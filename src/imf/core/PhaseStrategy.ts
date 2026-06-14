/**
 * Copyright 2026 Vpnet Cloud Solutions Sdn. Bhd.
 * Licensed under the Apache License, Version 2.0
 * See LICENSE in the project root for license information.
 *
 * Implements RFC 9315 Intent-Based Networking
 * https://www.rfc-editor.org/rfc/rfc9315
 *
 * Layer-agnostic RFC 9315 core — PhaseStrategy port set.
 *
 * Project 005 (ARC-005-ADR-001 / phase0-port-contract-spec). This file is the
 * domain-neutral seam: it imports ONLY RFC 9315 phase types, never any
 * business (BSS) or resource domain module (NFR-ARCH-001 "no domain imports
 * in core"). Each port maps to an RFC 9315 §5 sub-section.
 */

import { IntentHandlingPhase } from '../IntentHandlingCycle';

/**
 * Minimal state contract the layer-agnostic runner needs. Domains extend this
 * with their own state shape (BSS: IntentHandlingContext; resource: a KG-backed
 * state). The runner reasons only about the corrective-action budget.
 */
export interface CycleState {
  /** RFC 9315 §5.2.3 corrective-action budget (decremented per ACTING). */
  readonly retriesRemaining: number;
}

// ── SafetyGovernor cross-cut (FR-008; relates resource-intent ADR-011) ────────

export interface ProposedChange {
  readonly phase: IntentHandlingPhase;
  readonly summary?: string;
}

export type AdmitDecision = 'allow' | 'gate' | 'halt';

/**
 * Blast-radius safety gate, called before actuation phases. The core only
 * defines the hook (per ARC-005 Phase-0 spec §7); a domain supplies an
 * enforcing governor (resource) or a permissive one (BSS). Resource enforcement
 * is wired in Phase 5 (ARC-005 R-005 sequencing) — until then the permissive
 * default makes the hook a behaviour-preserving no-op.
 */
export interface SafetyGovernor {
  admit(change: ProposedChange): Promise<AdmitDecision> | AdmitDecision;
}

/** Permissive default — admits everything; preserves pre-extraction behaviour. */
export const PERMISSIVE_GOVERNOR: SafetyGovernor = {
  admit: () => 'allow',
};

// ── Optional structured log sink (FR-009; domain-neutral) ─────────────────────

export interface CycleLogger {
  info?(obj: unknown, msg?: string): void;
  warn?(obj: unknown, msg?: string): void;
  error?(obj: unknown, msg?: string): void;
}

// ── The PhaseStrategy port set (one method per RFC 9315 §5 phase) ─────────────

/**
 * Per-phase strategy supplied by a domain adapter. The runner owns the phase
 * *sequence*, the §5.2.3 corrective-action loop, the trace and the safety gate;
 * the strategy owns each phase *body* (declarative — state in, enriched state
 * out; never an imperative step list, per condition D-4).
 *
 * `ResolvePort` from the Phase-0 spec is folded into `translate` for now
 * (Gate-A disposition Q2: BSS folds resolution into translation; a distinct
 * resolve port is a Phase-1+ refinement).
 */
export interface PhaseStrategy<S extends CycleState> {
  /** RFC 9315 §5.1.1 Ingestion — accept/validate intent; enrich context. */
  ingest(state: S): Promise<S>;
  /** RFC 9315 §5.1.2 Translation — intent expression → actionable desired state. */
  translate(state: S): Promise<S>;
  /** RFC 9315 §5.1.3 Orchestration — enact the desired state. */
  orchestrate(state: S): Promise<S>;
  /** RFC 9315 §5.2.1 Monitoring — observe live fulfilment state. */
  monitor(state: S): Promise<S>;
  /** RFC 9315 §5.2.2 Compliance Assessment — produce conformance verdict. */
  assess(state: S): Promise<S>;

  /** Assess predicate driving the §5.2.3 loop: is the intent fulfilled? */
  isFulfilled(state: S): boolean;
  /** RFC 9315 §5.2.3 corrective action — produce the next state (e.g. decrement budget). */
  nextAfterActing(state: S): S;
}
