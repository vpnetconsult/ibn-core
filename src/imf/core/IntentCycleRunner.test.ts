/**
 * Copyright 2026 Vpnet Cloud Solutions Sdn. Bhd.
 * Licensed under the Apache License, Version 2.0
 * See LICENSE in the project root for license information.
 *
 * Implements RFC 9315 Intent-Based Networking
 * https://www.rfc-editor.org/rfc/rfc9315
 *
 * Unit tests for the layer-agnostic IntentCycleRunner (Project 005). Uses a
 * domain-free mock PhaseStrategy — the runner must drive the RFC 9315 §5 cycle
 * for ANY domain. (First test coverage for the cycle runner; the pre-extraction
 * BSS runner had none.)
 */

import { IntentCycleRunner } from './IntentCycleRunner';
import { PhaseStrategy, SafetyGovernor } from './PhaseStrategy';
import { IntentHandlingPhase } from '../IntentHandlingCycle';

interface TestState {
  readonly retriesRemaining: number;
  readonly orchestrations?: number;
  readonly fulfilled?: boolean;
}

/** Mock strategy that becomes fulfilled after `fulfilAfter` orchestrations. */
function mockStrategy(fulfilAfter: number): PhaseStrategy<TestState> {
  return {
    ingest: async (s) => ({ ...s }),
    translate: async (s) => ({ ...s }),
    orchestrate: async (s) => ({ ...s, orchestrations: (s.orchestrations ?? 0) + 1 }),
    monitor: async (s) => ({ ...s }),
    assess: async (s) => ({ ...s, fulfilled: (s.orchestrations ?? 0) >= fulfilAfter }),
    isFulfilled: (s) => s.fulfilled === true,
    nextAfterActing: (s) => ({ ...s, retriesRemaining: s.retriesRemaining - 1 }),
  };
}

const phasesOf = (trace: { phase: IntentHandlingPhase }[]) => trace.map((t) => t.phase);

describe('IntentCycleRunner (layer-agnostic RFC 9315 core)', () => {
  it('runs the five phases in RFC 9315 order and exits when fulfilled first pass', async () => {
    const runner = new IntentCycleRunner(mockStrategy(1));
    const { state, trace } = await runner.run({ retriesRemaining: 1 });

    expect(phasesOf(trace)).toEqual([
      IntentHandlingPhase.INGESTING,
      IntentHandlingPhase.TRANSLATING,
      IntentHandlingPhase.ORCHESTRATING,
      IntentHandlingPhase.MONITORING,
      IntentHandlingPhase.ASSESSING,
    ]);
    expect(trace.every((t) => t.outcome === 'completed')).toBe(true);
    expect(state.fulfilled).toBe(true);
    expect(state.orchestrations).toBe(1);
  });

  it('re-enters ORCHESTRATING via ACTING (§5.2.3) when not yet fulfilled', async () => {
    const runner = new IntentCycleRunner(mockStrategy(2)); // needs a 2nd orchestration
    const { state, trace } = await runner.run({ retriesRemaining: 1 });

    const acting = trace.filter((t) => t.phase === IntentHandlingPhase.ACTING);
    expect(acting).toHaveLength(1);
    expect(acting[0].outcome).toBe('retrying');
    // ORCHESTRATING appears twice (initial + after corrective action)
    expect(phasesOf(trace).filter((p) => p === IntentHandlingPhase.ORCHESTRATING)).toHaveLength(2);
    expect(state.fulfilled).toBe(true);
    expect(state.retriesRemaining).toBe(0);
  });

  it('exits when the retry budget is exhausted without fulfilment', async () => {
    const runner = new IntentCycleRunner(mockStrategy(99)); // never fulfils
    const { state, trace } = await runner.run({ retriesRemaining: 0 });

    // retriesRemaining starts at 0 → no ACTING; one pass only
    expect(trace.filter((t) => t.phase === IntentHandlingPhase.ACTING)).toHaveLength(0);
    expect(state.fulfilled).toBe(false);
  });

  it('halts before orchestration when the SafetyGovernor returns halt', async () => {
    const halting: SafetyGovernor = { admit: () => 'halt' };
    const runner = new IntentCycleRunner(mockStrategy(1), { safety: halting });

    await expect(runner.run({ retriesRemaining: 1 })).rejects.toThrow(/SafetyGovernor halted/);
  });

  it('is unaffected by a permissive (or absent) SafetyGovernor', async () => {
    const allowing: SafetyGovernor = { admit: () => 'allow' };
    const runner = new IntentCycleRunner(mockStrategy(1), { safety: allowing });
    const { state } = await runner.run({ retriesRemaining: 1 });
    expect(state.fulfilled).toBe(true);
  });
});
