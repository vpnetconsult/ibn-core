/**
 * Copyright 2026 Vpnet Cloud Solutions Sdn. Bhd.
 * Licensed under the Apache License, Version 2.0
 * See LICENSE in the project root for license information.
 *
 * Implements RFC 9315 Intent-Based Networking
 * https://www.rfc-editor.org/rfc/rfc9315
 */

// ── Typed shapes for cycle-internal data ─────────────────────────────────────
// These interfaces describe the JSON shapes produced by ClaudeClient and the
// MCP tools.  All fields are optional because the values arrive at runtime as
// LLM / MCP output whose exact shape cannot be guaranteed.

/**
 * Structured output of the RFC 9315 §5.1.2 TRANSLATING phase.
 *
 * Produced by `ClaudeClient.analyzeIntent()`.  Fields map to the prompt
 * extraction list in claude-client.ts:
 *   1. intent tags   → tags
 *   2. product types → product_types
 *   3. priorities    → priority
 */
export interface IntentAnalysis {
  /** Semantic labels extracted from the intent expression (e.g. 'work_from_home'). */
  tags?: string[];
  /** BSS product type codes required to fulfil the intent (e.g. 'broadband'). */
  product_types?: string[];
  /** Ranked priority attributes (e.g. ['speed', 'reliability']). */
  priority?: string[];
}

/**
 * PII-masked customer profile as returned by the customer-data MCP and
 * post-processed by `maskCustomerProfile()`.
 *
 * Only the fields actually consumed by downstream phases are typed here.
 * Additional fields returned by the MCP are preserved via the index signature.
 */
export interface CustomerProfile {
  /** Market segment used for product-catalog filtering (e.g. 'consumer'). */
  segment?: string;
  /** Services the customer currently holds. */
  current_services?: string[];
  /** Customer tenure label (e.g. '2 years'). */
  tenure?: string;
  /** Allow additional MCP-returned fields without explicit typing. */
  [key: string]: unknown;
}

/**
 * Fulfilment offer produced by `ClaudeClient.generateOffer()`.
 *
 * Consumed by MONITORING (selected_products.length check) and ORCHESTRATING
 * (quote generation inputs).
 */
export interface SelectedOffer {
  /** BSS product codes chosen for the offer. */
  selected_products?: string[];
  /** Discount codes or percentages to apply at quoting. */
  recommended_discounts?: string[];
  /** Bundle identifier, if a bundle was selected. */
  bundle_recommendation?: string;
  /** Allow additional LLM-returned fields. */
  [key: string]: unknown;
}

// ── Context ───────────────────────────────────────────────────────────────────

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
  readonly customerProfile?: CustomerProfile;

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
  readonly intentAnalysis?: IntentAnalysis;

  // -------------------------------------------------------------------------
  // Populated by ORCHESTRATING (RFC 9315 §5.1.3)
  // -------------------------------------------------------------------------

  /** Products retrieved from the BSS catalog during orchestration */
  readonly availableProducts?: unknown;

  /** Related product bundles retrieved from the knowledge graph */
  readonly availableBundles?: unknown;

  /** Selected offer generated from available products and bundles */
  readonly selectedOffer?: SelectedOffer;

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
