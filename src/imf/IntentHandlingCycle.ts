/**
 * Copyright 2026 Vpnet Cloud Solutions Sdn. Bhd.
 * Licensed under the Apache License, Version 2.0
 * See LICENSE in the project root for license information.
 *
 * Implements RFC 9315 Intent-Based Networking
 * https://www.rfc-editor.org/rfc/rfc9315
 */

/**
 * RFC 9315 §5 — Intent handling cycle phases.
 *
 * The six phases follow the intent from expression to verified fulfilment:
 *
 *   INGESTING     (§5.1.1) — accept and validate the intent expression;
 *                            enrich with requester context
 *   TRANSLATING   (§5.1.2) — resolve natural-language intent into
 *                            network-actionable requirements
 *   ORCHESTRATING (§5.1.3) — submit requirements to network resources
 *                            and obtain a fulfilment commitment
 *   MONITORING    (§5.2.1) — observe the live fulfilment state
 *   ASSESSING     (§5.2.2) — evaluate compliance: does the observed state
 *                            satisfy the intent expectations?
 *   ACTING        (§5.2.3) — take corrective action when compliance fails;
 *                            triggers re-entry into ORCHESTRATING
 */
export enum IntentHandlingPhase {
  INGESTING     = 'ingesting',      // RFC 9315 §5.1.1
  TRANSLATING   = 'translating',    // RFC 9315 §5.1.2
  ORCHESTRATING = 'orchestrating',  // RFC 9315 §5.1.3
  MONITORING    = 'monitoring',     // RFC 9315 §5.2.1
  ASSESSING     = 'assessing',      // RFC 9315 §5.2.2
  ACTING        = 'acting',         // RFC 9315 §5.2.3
}

export type PhaseOutcome = 'completed' | 'failed' | 'retrying';

/**
 * A single step in the intent handling trace.
 * The ordered list of steps constitutes the handling trajectory,
 * used for RFC 9315 §5.2.1 monitoring and compliance assessment.
 */
export interface IntentHandlingStep {
  /** Which phase of the RFC 9315 §5 cycle this step belongs to */
  phase: IntentHandlingPhase;
  /** ISO 8601 timestamp when this phase started */
  startedAt: string;
  /** Wall-clock duration of this phase in milliseconds */
  durationMs: number;
  /** Outcome of this phase execution */
  outcome: PhaseOutcome;
  /**
   * Optional non-PII summary for structured logging and observability.
   * Must not contain customer identifiers or personal data.
   */
  detail?: string;
}
