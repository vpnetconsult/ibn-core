/**
 * Copyright 2026 Vpnet Cloud Solutions Sdn. Bhd.
 * Licensed under the Apache License, Version 2.0
 * See LICENSE in the project root for license information.
 *
 * Implements RFC 9315 Intent-Based Networking
 * https://www.rfc-editor.org/rfc/rfc9315
 *
 * Layer-agnostic RFC 9315 §5 cycle runner (Project 005 — the "to-be" core).
 *
 * This runner owns ONLY the domain-neutral concerns: the phase sequence, the
 * §5.2.3 corrective-action loop, the handling trace, and the safety gate. Every
 * phase BODY is supplied by an injected PhaseStrategy. It imports no BSS or
 * resource domain module (NFR-ARCH-001). Both the business-intent and the
 * resource-intent agents instantiate it as peer adapters ("two peers, one core").
 *
 * Extracted behaviour-preservingly from IntentHandlingCycleRunner (ARC-005-ROAD
 * Phase 1); the BSS runner now delegates here via BssPhaseStrategy.
 */

import {
  IntentHandlingPhase,
  IntentHandlingStep,
  PhaseOutcome,
} from '../IntentHandlingCycle';
import {
  CycleState,
  PhaseStrategy,
  SafetyGovernor,
  CycleLogger,
} from './PhaseStrategy';

export interface CycleResult<S extends CycleState> {
  /** Final state after the cycle completes. */
  state: S;
  /** Ordered trace of every phase executed (RFC 9315 §5.2.1 trajectory). */
  trace: IntentHandlingStep[];
}

export interface IntentCycleOptions {
  /**
   * Optional blast-radius gate, consulted before actuation phases
   * (ORCHESTRATING and the ACTING re-commit). When omitted, no gate is applied
   * — preserving the behaviour of callers that have no SafetyGovernor.
   */
  safety?: SafetyGovernor;
  /** Optional structured log sink (domain-neutral). */
  log?: CycleLogger;
}

/**
 * IntentCycleRunner executes the RFC 9315 §5 cycle for any domain:
 *
 *   INGESTING → TRANSLATING → ORCHESTRATING → MONITORING → ASSESSING
 *                                  ↑                              |
 *                                  └─── ACTING (if not fulfilled) ┘
 *
 * Assurance (MONITORING → ASSESSING → ACTING) is a CONTINUOUS loop that feeds
 * back into ORCHESTRATING; it does not terminate at ACTING (condition D-1). The
 * loop exits when the strategy reports fulfilled or the retry budget is spent.
 */
export class IntentCycleRunner<S extends CycleState> {
  constructor(
    private readonly strategy: PhaseStrategy<S>,
    private readonly opts: IntentCycleOptions = {},
  ) {}

  async run(initial: S): Promise<CycleResult<S>> {
    const trace: IntentHandlingStep[] = [];
    let state = initial;

    // RFC 9315 §5.1.1 — INGESTING
    state = await this.runPhase(IntentHandlingPhase.INGESTING, state, trace,
      (s) => this.strategy.ingest(s),
    );

    // RFC 9315 §5.1.2 — TRANSLATING
    state = await this.runPhase(IntentHandlingPhase.TRANSLATING, state, trace,
      (s) => this.strategy.translate(s),
    );

    // RFC 9315 §5.1.3 → §5.2.1 → §5.2.2 → §5.2.3 (continuous assurance loop)
    let continueLoop = true;
    while (continueLoop) {
      await this.admit(IntentHandlingPhase.ORCHESTRATING);

      state = await this.runPhase(IntentHandlingPhase.ORCHESTRATING, state, trace,
        (s) => this.strategy.orchestrate(s),
      );
      state = await this.runPhase(IntentHandlingPhase.MONITORING, state, trace,
        (s) => this.strategy.monitor(s),
      );
      state = await this.runPhase(IntentHandlingPhase.ASSESSING, state, trace,
        (s) => this.strategy.assess(s),
      );

      if (this.strategy.isFulfilled(state) || state.retriesRemaining <= 0) {
        continueLoop = false;
      } else {
        // RFC 9315 §5.2.3 — corrective action: consume one retry, re-orchestrate
        await this.admit(IntentHandlingPhase.ACTING);
        const start = this.startStep(IntentHandlingPhase.ACTING);
        state = this.strategy.nextAfterActing(state);
        this.endStep(start, trace, 'retrying',
          `Corrective action: re-entering orchestration (${state.retriesRemaining} retries remaining)`,
        );
        this.opts.log?.warn?.(
          { retriesRemaining: state.retriesRemaining },
          'RFC 9315 §5.2.3 — corrective action: re-entering ORCHESTRATING phase',
        );
      }
    }

    return { state, trace };
  }

  // ── Safety gate (no-op unless a SafetyGovernor is supplied) ─────────────────

  private async admit(phase: IntentHandlingPhase): Promise<void> {
    const gov = this.opts.safety;
    if (!gov) return;
    const decision = await gov.admit({ phase });
    if (decision === 'halt') {
      throw new Error(`SafetyGovernor halted the cycle before ${phase}`);
    }
    // 'gate' is reserved for the Phase-5 human-gate wiring; treated as allow here.
  }

  // ── Trace helpers (verbatim from the pre-extraction runner) ─────────────────

  private startStep(phase: IntentHandlingPhase): {
    phase: IntentHandlingPhase;
    t0: number;
    startedAt: string;
  } {
    return { phase, t0: Date.now(), startedAt: new Date().toISOString() };
  }

  private endStep(
    start: { phase: IntentHandlingPhase; t0: number; startedAt: string },
    trace: IntentHandlingStep[],
    outcome: PhaseOutcome,
    detail?: string,
  ): void {
    trace.push({
      phase: start.phase,
      startedAt: start.startedAt,
      durationMs: Date.now() - start.t0,
      outcome,
      detail,
    });
  }

  private async runPhase(
    phase: IntentHandlingPhase,
    state: S,
    trace: IntentHandlingStep[],
    fn: (s: S) => Promise<S>,
  ): Promise<S> {
    const start = this.startStep(phase);
    try {
      const next = await fn(state);
      this.endStep(start, trace, 'completed');
      return next;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      this.endStep(start, trace, 'failed', message);
      this.opts.log?.error?.({ phase, error: message }, 'Intent handling phase failed');
      throw err;
    }
  }
}
