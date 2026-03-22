/**
 * Copyright 2026 Vpnet Cloud Solutions Sdn. Bhd.
 * Licensed under the Apache License, Version 2.0
 * See LICENSE in the project root for license information.
 *
 * Implements RFC 9315 Intent-Based Networking
 * https://www.rfc-editor.org/rfc/rfc9315
 */

/**
 * Tool-Level RBAC Policy Engine for MCP agent sessions.
 *
 * Implements the authorisation controls described in:
 *   Errico, Ngiam & Sojan, "Securing the Model Context Protocol (MCP):
 *   Risks, Controls, and Governance", arXiv 2511.20920, §4.1 / §4.5.
 *
 * Design:
 *   - Four built-in roles: customer, agent, analyst, admin.
 *   - Each role has an explicit tool allowlist (deny-by-default).
 *   - Roles are resolved from the apiKeyName provided by the auth middleware.
 *   - All permit and deny decisions are logged for SIEM correlation.
 *   - Custom role→toolset mappings can be added via registerRole().
 *   - The engine is stateless and safe for concurrent use.
 *
 * RFC 9315 mapping:
 *   §4 Principle 5 — Capability Exposure: only tools the principal is
 *   authorised for are reachable through the MCP client.
 */

import { logger } from '../logger';

// ── Types ─────────────────────────────────────────────────────────────────────

export type Role = string;

export interface PolicyDecision {
  /** Whether the tool call is permitted */
  permitted: boolean;
  /** Role that was resolved for the caller */
  role: Role;
  /** Tool that was checked */
  toolName: string;
  /** Human-readable reason for a deny decision */
  reason?: string;
}

// ── Built-in role definitions ─────────────────────────────────────────────────

/**
 * Tool allowlists per role.
 *
 * Listed tools are the *only* ones a principal in that role may invoke.
 * Any tool not in the list is implicitly denied.
 *
 * Paper §4.1 — roles correspond to the three adversary entry points:
 *   customer  → end-user facing (limited read access)
 *   agent     → AI agent acting on behalf of customer (intent lifecycle)
 *   analyst   → internal business analytics (read-only, no mutations)
 *   admin     → operator platform management (full access)
 */
const BUILT_IN_POLICIES: Record<Role, Set<string>> = {
  customer: new Set([
    'get_customer_profile',
    'get_intent_status',
    'get_quote',
    'list_products',
  ]),

  agent: new Set([
    // Customer data
    'get_customer_profile',
    // BSS — catalog and quoting
    'search_product_catalog',
    'get_product_details',
    'generate_quote',
    'submit_order',
    // Knowledge graph
    'find_related_products',
    'get_bundle_details',
    // Intent lifecycle
    'get_intent_status',
    'update_intent_status',
    // Feedback (benign, structured)
    'send_feedback',
  ]),

  analyst: new Set([
    'get_customer_profile',
    'search_product_catalog',
    'get_product_details',
    'list_products',
    'get_intent_status',
    'get_analytics_report',
    'list_orders',
  ]),

  admin: new Set([
    // All agent + analyst tools, plus management operations
    'get_customer_profile',
    'update_customer_profile',
    'search_product_catalog',
    'get_product_details',
    'list_products',
    'generate_quote',
    'submit_order',
    'cancel_order',
    'find_related_products',
    'get_bundle_details',
    'get_intent_status',
    'update_intent_status',
    'get_analytics_report',
    'list_orders',
    'send_feedback',
    'manage_api_keys',
    'view_audit_log',
  ]),
};

// ── Role resolution ───────────────────────────────────────────────────────────

/**
 * Derive a Role from an API key name.
 *
 * Convention (case-insensitive):
 *   "… Admin …"    → admin
 *   "… Analyst …"  → analyst
 *   "… Agent …"    → agent
 *   anything else  → customer   (safe default — most restrictive)
 */
function resolveRoleFromApiKeyName(apiKeyName: string): Role {
  const lower = apiKeyName.toLowerCase();
  if (lower.includes('admin')) return 'admin';
  if (lower.includes('analyst')) return 'analyst';
  if (lower.includes('agent') || lower.includes('development')) return 'agent';
  return 'customer';
}

// ── Engine class ──────────────────────────────────────────────────────────────

export class ToolPolicyEngine {
  private readonly policies: Map<Role, Set<string>>;

  constructor() {
    // Deep-copy built-in policies so mutations via registerRole() are isolated.
    this.policies = new Map(
      Object.entries(BUILT_IN_POLICIES).map(([role, tools]) => [role, new Set(tools)])
    );
  }

  /**
   * Register a custom role with its tool allowlist.
   * If the role already exists, its allowlist is replaced.
   */
  registerRole(role: Role, allowedTools: string[]): void {
    this.policies.set(role, new Set(allowedTools));
  }

  /**
   * Return the tool allowlist for a role, or undefined if the role is unknown.
   */
  getAllowedTools(role: Role): ReadonlySet<string> | undefined {
    return this.policies.get(role);
  }

  /**
   * Resolve the role for a principal identified by their API key name.
   */
  resolveRole(apiKeyName: string): Role {
    return resolveRoleFromApiKeyName(apiKeyName);
  }

  /**
   * Check whether a principal (identified by apiKeyName) may invoke toolName.
   *
   * Deny-by-default: if the role is unknown or the tool is not on the
   * allowlist, the call is denied.
   *
   * All decisions are logged at INFO (permit) or WARN (deny) for SIEM.
   */
  checkAccess(apiKeyName: string, toolName: string): PolicyDecision {
    const role = this.resolveRole(apiKeyName);
    const allowlist = this.policies.get(role);

    if (!allowlist) {
      const decision: PolicyDecision = {
        permitted: false,
        role,
        toolName,
        reason: `Unknown role '${role}' — deny by default`,
      };
      logger.warn({ role, toolName, permitted: false, reason: decision.reason }, 'RBAC deny');
      return decision;
    }

    const permitted = allowlist.has(toolName);

    if (permitted) {
      logger.info({ role, toolName, permitted: true }, 'RBAC permit');
    } else {
      logger.warn(
        { role, toolName, permitted: false, reason: 'tool not in role allowlist' },
        'RBAC deny'
      );
    }

    return {
      permitted,
      role,
      toolName,
      reason: permitted ? undefined : `Tool '${toolName}' is not permitted for role '${role}'`,
    };
  }
}

/** Module-level singleton — one engine shared across the process. */
export const toolPolicyEngine = new ToolPolicyEngine();
