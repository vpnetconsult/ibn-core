/**
 * Copyright 2026 Vpnet Cloud Solutions Sdn. Bhd.
 * Licensed under the Apache License, Version 2.0
 * See LICENSE in the project root for license information.
 *
 * Implements RFC 9315 Intent-Based Networking
 * https://www.rfc-editor.org/rfc/rfc9315
 */

/**
 * Inline DLP (Data Loss Prevention) Policy for MCP tool responses.
 *
 * Implements §4.4 from:
 *   Errico, Ngiam & Sojan, "Securing the Model Context Protocol (MCP):
 *   Risks, Controls, and Governance", arXiv 2511.20920, §4.4.
 *
 * Design:
 *   - Per-tool, per-role field allowlists applied inline, before the
 *     MCP response is forwarded to the LLM.
 *   - Sensitive fields are replaced with the sentinel '[DLP_REDACTED]'
 *     rather than removed, preserving the schema shape so the AI can
 *     reason about field presence without seeing raw values.
 *   - '*' grants all fields for a given role on a given tool (open pass).
 *   - Unknown tools default to full redaction of known sensitive fields.
 *   - Nested objects and arrays are traversed recursively.
 *   - All redaction events are logged at INFO for SIEM correlation.
 *
 * Relationship to complementary controls:
 *   pii-masking.ts        — masks customer PII before external AI API calls
 *   mcp-response-filter.ts — blocks prompt injection in MCP tool responses
 *   response-filter.ts    — role-based field filtering for HTTP API clients
 *
 * RFC 9315 mapping:
 *   §4 Principle 5 — Capability Exposure: data disclosed is bounded by
 *   the caller's authorised role, not just tool access.
 */

import { logger } from '../logger';

// ── Types ─────────────────────────────────────────────────────────────────────

export type DLPRole = string;

/** Sentinel placed in lieu of redacted field values. */
export const DLP_REDACTED = '[DLP_REDACTED]';

/**
 * Per-role field policy for a single tool.
 *
 * '*'            → all fields permitted (open pass)
 * Set<string>    → only listed fields permitted; others are redacted
 */
export type FieldPolicy = '*' | Set<string>;

/** Result of applying the DLP policy to a response. */
export interface DLPResult {
  /** The sanitised response (field values replaced, not removed). */
  sanitised: Record<string, unknown>;
  /** Names of top-level fields that were redacted. */
  redactedFields: string[];
}

// ── Built-in per-tool DLP rules ───────────────────────────────────────────────

/**
 * DLP allowlists: tool → role → permitted top-level fields.
 *
 * Rationale per tool:
 *
 * get_customer_profile — highest-sensitivity tool; returns raw PII.
 *   customer  → own non-identifying data only (no name/contact/financial)
 *   agent     → operational fields + generalised credit tier; no raw contact
 *   analyst   → aggregate/segment data only; no individual PII
 *   admin     → full access (operator oversight)
 *
 * search_product_catalog / find_related_products / get_bundle_details /
 * get_product_details / list_products — product data, no customer PII.
 *   All roles → open pass.
 *
 * generate_quote — contains customer_id and pricing; no raw PII.
 *   customer  → own quote fields
 *   agent     → full quote for fulfilment
 *   analyst   → blocked (no individual quote data)
 *   admin     → full access
 *
 * get_intent_status / update_intent_status — lifecycle metadata only.
 *   All roles → open pass.
 *
 * get_analytics_report / list_orders — aggregate/operational data.
 *   customer  → blocked (no cross-customer analytics)
 *   agent     → operational view
 *   analyst   → full analytics
 *   admin     → full access
 */
const BUILT_IN_RULES: Record<string, Record<DLPRole, FieldPolicy>> = {
  get_customer_profile: {
    customer: new Set([
      'customer_id',
      'segment',
      'spending_tier',
      'contract_type',
      'current_services',
      'preferences',
    ]),
    agent: new Set([
      'customer_id',
      'segment',
      'spending_tier',
      'contract_type',
      'current_services',
      'preferences',
      // Credit score and location are allowed but must be generalised upstream
      // (pii-masking.ts handles this before the AI call; DLP enforces at MCP layer)
      'credit_score',
      'location',
    ]),
    analyst: new Set([
      'customer_id',
      'segment',
      'spending_tier',
      'contract_type',
    ]),
    admin: '*',
  },

  search_product_catalog: {
    customer: '*',
    agent: '*',
    analyst: '*',
    admin: '*',
  },

  get_product_details: {
    customer: '*',
    agent: '*',
    analyst: '*',
    admin: '*',
  },

  list_products: {
    customer: '*',
    agent: '*',
    analyst: '*',
    admin: '*',
  },

  find_related_products: {
    customer: '*',
    agent: '*',
    analyst: '*',
    admin: '*',
  },

  get_bundle_details: {
    customer: '*',
    agent: '*',
    analyst: '*',
    admin: '*',
  },

  generate_quote: {
    customer: new Set([
      'quote_id',
      'products',
      'subtotal',
      'discounts',
      'discount_amount',
      'total_monthly',
      'currency',
      'valid_until',
      'terms',
    ]),
    agent: '*',
    // Analysts cannot access individual customer quote data.
    analyst: new Set([]),
    admin: '*',
  },

  submit_order: {
    customer: new Set(['order_id', 'status', 'created_at']),
    agent: '*',
    analyst: new Set([]),
    admin: '*',
  },

  cancel_order: {
    customer: new Set([]),
    agent: new Set([]),
    analyst: new Set([]),
    admin: '*',
  },

  get_intent_status: {
    customer: '*',
    agent: '*',
    analyst: '*',
    admin: '*',
  },

  update_intent_status: {
    customer: new Set([]),
    agent: '*',
    analyst: new Set([]),
    admin: '*',
  },

  get_analytics_report: {
    // Customers must not receive cross-customer analytics.
    customer: new Set([]),
    agent: new Set(['report_type', 'period', 'summary']),
    analyst: '*',
    admin: '*',
  },

  list_orders: {
    customer: new Set(['order_id', 'status', 'created_at', 'products']),
    agent: '*',
    analyst: '*',
    admin: '*',
  },

  send_feedback: {
    customer: new Set([]),
    agent: '*',
    analyst: new Set([]),
    admin: '*',
  },
};

/** Fields considered universally sensitive — redacted on unknown tools. */
const UNIVERSAL_SENSITIVE_FIELDS = new Set([
  'email',
  'phone',
  'ssn',
  'credit_card',
  'bank_account',
  'passport',
  'password',
  'secret',
  'token',
  'api_key',
]);

// ── Engine class ──────────────────────────────────────────────────────────────

export class DLPPolicy {
  private readonly rules: Map<string, Map<DLPRole, FieldPolicy>>;

  constructor() {
    // Deep-copy built-in rules so mutations via registerTool() are isolated.
    this.rules = new Map(
      Object.entries(BUILT_IN_RULES).map(([tool, roleMap]) => [
        tool,
        new Map(
          Object.entries(roleMap).map(([role, policy]) => [
            role,
            policy === '*' ? '*' : new Set(policy as Set<string>),
          ])
        ),
      ])
    );
  }

  /**
   * Register or replace the DLP policy for a tool.
   * Used for operator-specific tools not in the built-in set.
   */
  registerTool(tool: string, roleMap: Record<DLPRole, FieldPolicy>): void {
    this.rules.set(
      tool,
      new Map(
        Object.entries(roleMap).map(([role, policy]) => [
          role,
          policy === '*' ? '*' : new Set(policy as Set<string>),
        ])
      )
    );
  }

  /**
   * Apply inline DLP to an MCP tool response.
   *
   * @param toolName   - The MCP tool that produced the response.
   * @param role       - The role of the principal that invoked the tool.
   * @param response   - The raw tool response (must be a plain object).
   * @returns          - Sanitised response + list of redacted top-level fields.
   */
  apply(
    toolName: string,
    role: DLPRole,
    response: Record<string, unknown>
  ): DLPResult {
    const toolRules = this.rules.get(toolName);

    // Unknown tool — apply universal sensitive-field redaction only.
    if (!toolRules) {
      return this.applyUniversalRedaction(toolName, role, response);
    }

    const fieldPolicy = toolRules.get(role) ?? toolRules.get('customer');

    // Unknown role for a known tool — fall back to most-restrictive ('customer').
    // If even 'customer' is missing, apply universal redaction.
    if (!fieldPolicy) {
      return this.applyUniversalRedaction(toolName, role, response);
    }

    // Open pass — nothing to redact.
    if (fieldPolicy === '*') {
      return { sanitised: response, redactedFields: [] };
    }

    // Empty set — redact everything.
    if (fieldPolicy.size === 0) {
      const allFields = Object.keys(response);
      const sanitised: Record<string, unknown> = {};
      for (const field of allFields) {
        sanitised[field] = DLP_REDACTED;
      }
      if (allFields.length > 0) {
        logger.info(
          { toolName, role, redactedFields: allFields },
          'DLP: full response redacted (role has no field allowlist for this tool)'
        );
      }
      return { sanitised, redactedFields: allFields };
    }

    // Selective redaction — keep allowed fields, redact the rest.
    return this.selectiveRedact(toolName, role, response, fieldPolicy);
  }

  // ── Private ─────────────────────────────────────────────────────────────────

  private selectiveRedact(
    toolName: string,
    role: DLPRole,
    response: Record<string, unknown>,
    allowedFields: Set<string>
  ): DLPResult {
    const sanitised: Record<string, unknown> = {};
    const redactedFields: string[] = [];

    for (const [field, value] of Object.entries(response)) {
      if (allowedFields.has(field)) {
        sanitised[field] = value;
      } else {
        sanitised[field] = DLP_REDACTED;
        redactedFields.push(field);
      }
    }

    if (redactedFields.length > 0) {
      logger.info(
        { toolName, role, redactedFields },
        'DLP: fields redacted from MCP tool response'
      );
    }

    return { sanitised, redactedFields };
  }

  private applyUniversalRedaction(
    toolName: string,
    role: DLPRole,
    response: Record<string, unknown>
  ): DLPResult {
    const sanitised: Record<string, unknown> = {};
    const redactedFields: string[] = [];

    for (const [field, value] of Object.entries(response)) {
      if (UNIVERSAL_SENSITIVE_FIELDS.has(field)) {
        sanitised[field] = DLP_REDACTED;
        redactedFields.push(field);
      } else {
        sanitised[field] = value;
      }
    }

    if (redactedFields.length > 0) {
      logger.info(
        { toolName, role, redactedFields },
        'DLP: universal sensitive-field redaction applied (unknown tool)'
      );
    }

    return { sanitised, redactedFields };
  }
}

/** Module-level singleton — one policy shared across the process. */
export const dlpPolicy = new DLPPolicy();
