/**
 * Copyright 2026 Vpnet Cloud Solutions Sdn. Bhd.
 * Licensed under the Apache License, Version 2.0
 * See LICENSE in the project root for license information.
 *
 * Implements RFC 9315 Intent-Based Networking
 * https://www.rfc-editor.org/rfc/rfc9315
 */

/**
 * Accumulated state carried through the RFC 9315 §5 intent handling cycle.
 *
 * Each phase receives the context from the previous phase and returns an
 * enriched copy. The context is never mutated in place — spreading into a
 * new object at each phase boundary makes the state evolution explicit and
 * the cycle safe to reason about.
 *
 * Fields are grouped by the phase that populates them, matching the RFC 9315
 * §5 section structure.
 */
export interface IntentHandlingContext {
  // -------------------------------------------------------------------------
  // Immutable identity — set at cycle start
  // -------------------------------------------------------------------------

  /** Correlation ID linking this cycle to the stored Intent resource */
  readonly intentId: string;

  /** Opaque customer reference — never a raw PII value in logs or traces */
  readonly customerId: string;

  /** Sanitized natural-language intent expression (RFC 9315 §5.1.1 input) */
  readonly intentText: string;

  /** ISO 8601 timestamp when the cycle started */
  readonly startedAt: string;

  // -------------------------------------------------------------------------
  // Populated by INGESTING (RFC 9315 §5.1.1)
  // -------------------------------------------------------------------------

  /**
   * PII-masked customer profile, safe for downstream AI processing.
   * Raw fields are removed or tokenized before this context field is set.
   */
  readonly customerProfile?: unknown;

  /**
   * Raw customer profile retained solely for the role-based response filter.
   * The response-filter middleware redacts fields based on the caller's role
   * before the value leaves the service boundary.
   * Must not be passed to any external AI service.
   */
  readonly rawCustomerProfile?: unknown;

  // -------------------------------------------------------------------------
  // Populated by TRANSLATING (RFC 9315 §5.1.2)
  // -------------------------------------------------------------------------

  /**
   * Structured intent analysis produced by translating the natural-language
   * expression into network-actionable requirements: intent tags, product
   * types, and priority requirements.
   */
  readonly intentAnalysis?: unknown;

  // -------------------------------------------------------------------------
  // Populated by ORCHESTRATING (RFC 9315 §5.1.3)
  // -------------------------------------------------------------------------

  /** Products retrieved from the BSS catalog during orchestration */
  readonly availableProducts?: unknown;

  /** Related product bundles retrieved from the knowledge graph */
  readonly availableBundles?: unknown;

  /** Selected offer generated from available products and bundles */
  readonly selectedOffer?: unknown;

  /** Pricing quote for the selected offer */
  readonly quote?: unknown;

  // -------------------------------------------------------------------------
  // Populated by MONITORING / ASSESSING (RFC 9315 §5.2.1–5.2.2)
  // -------------------------------------------------------------------------

  /**
   * Current fulfilment state as assessed against the intent expectations.
   * Maps to TMF921 IntentReport.reportState.
   */
  readonly reportState?: 'fulfilled' | 'notFulfillable' | 'inProgress' | 'degraded';

  // -------------------------------------------------------------------------
  // Corrective-action budget (RFC 9315 §5.2.3)
  // -------------------------------------------------------------------------

  /**
   * Number of corrective-action retries remaining.
   * The cycle re-enters ORCHESTRATING while this is > 0 and the intent is
   * not yet fulfilled. Set to maxRetries at cycle initialisation; decremented
   * each time ACTING executes.
   */
  readonly retriesRemaining: number;
}
