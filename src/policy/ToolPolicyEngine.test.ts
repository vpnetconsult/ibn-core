/**
 * Copyright 2026 Vpnet Cloud Solutions Sdn. Bhd.
 * Licensed under the Apache License, Version 2.0
 * See LICENSE in the project root for license information.
 *
 * Implements RFC 9315 Intent-Based Networking
 * https://www.rfc-editor.org/rfc/rfc9315
 */

import { ToolPolicyEngine } from './ToolPolicyEngine';

// Each test gets its own engine instance so built-in policies are not
// contaminated by registerRole() calls in other tests.
function makeEngine(): ToolPolicyEngine {
  return new ToolPolicyEngine();
}

// ── resolveRole() ─────────────────────────────────────────────────────────────

describe('ToolPolicyEngine.resolveRole()', () => {
  it('should resolve "admin" for an API key name containing "Admin"', () => {
    expect(makeEngine().resolveRole('Operations Admin Key')).toBe('admin');
  });

  it('should resolve "admin" case-insensitively', () => {
    expect(makeEngine().resolveRole('ADMIN_SYSTEM')).toBe('admin');
  });

  it('should resolve "analyst" for a key name containing "Analyst"', () => {
    expect(makeEngine().resolveRole('Business Analyst Key')).toBe('analyst');
  });

  it('should resolve "agent" for a key name containing "Agent"', () => {
    expect(makeEngine().resolveRole('Intent Agent Service Key')).toBe('agent');
  });

  it('should resolve "agent" for the default development API key name', () => {
    expect(makeEngine().resolveRole('Development API Key')).toBe('agent');
  });

  it('should default to "customer" for an unrecognised key name', () => {
    expect(makeEngine().resolveRole('John Doe Production Key')).toBe('customer');
  });

  it('should default to "customer" for an empty string', () => {
    expect(makeEngine().resolveRole('')).toBe('customer');
  });
});

// ── checkAccess() — customer role ─────────────────────────────────────────────

describe('ToolPolicyEngine.checkAccess() — customer role', () => {
  const engine = makeEngine();
  const KEY = 'John Doe Customer Key'; // resolves to 'customer'

  it('should permit get_customer_profile for customer', () => {
    const result = engine.checkAccess(KEY, 'get_customer_profile');
    expect(result.permitted).toBe(true);
    expect(result.role).toBe('customer');
    expect(result.reason).toBeUndefined();
  });

  it('should permit get_intent_status for customer', () => {
    expect(engine.checkAccess(KEY, 'get_intent_status').permitted).toBe(true);
  });

  it('should deny generate_quote for customer', () => {
    const result = engine.checkAccess(KEY, 'generate_quote');
    expect(result.permitted).toBe(false);
    expect(result.role).toBe('customer');
    expect(result.reason).toContain('generate_quote');
  });

  it('should deny send_feedback for customer (paper §3.2 PoC tool)', () => {
    // send_feedback is the PoC exfiltration vector — customers must not invoke it directly
    const result = engine.checkAccess(KEY, 'send_feedback');
    expect(result.permitted).toBe(false);
  });

  it('should deny manage_api_keys for customer', () => {
    expect(engine.checkAccess(KEY, 'manage_api_keys').permitted).toBe(false);
  });

  it('should deny an unknown tool for customer', () => {
    expect(engine.checkAccess(KEY, 'nonexistent_tool').permitted).toBe(false);
  });
});

// ── checkAccess() — agent role ────────────────────────────────────────────────

describe('ToolPolicyEngine.checkAccess() — agent role', () => {
  const engine = makeEngine();
  const KEY = 'Development API Key'; // resolves to 'agent'

  it('should permit all intent-lifecycle tools for agent', () => {
    const agentTools = [
      'get_customer_profile',
      'search_product_catalog',
      'get_product_details',
      'generate_quote',
      'submit_order',
      'find_related_products',
      'get_bundle_details',
      'get_intent_status',
      'update_intent_status',
      'send_feedback',
    ];
    for (const tool of agentTools) {
      expect(engine.checkAccess(KEY, tool).permitted).toBe(true);
    }
  });

  it('should deny manage_api_keys for agent', () => {
    expect(engine.checkAccess(KEY, 'manage_api_keys').permitted).toBe(false);
  });

  it('should deny cancel_order for agent (admin-only)', () => {
    expect(engine.checkAccess(KEY, 'cancel_order').permitted).toBe(false);
  });
});

// ── checkAccess() — analyst role ──────────────────────────────────────────────

describe('ToolPolicyEngine.checkAccess() — analyst role', () => {
  const engine = makeEngine();
  const KEY = 'Business Analyst Key';

  it('should permit read tools for analyst', () => {
    expect(engine.checkAccess(KEY, 'get_customer_profile').permitted).toBe(true);
    expect(engine.checkAccess(KEY, 'get_analytics_report').permitted).toBe(true);
    expect(engine.checkAccess(KEY, 'list_orders').permitted).toBe(true);
  });

  it('should deny mutating tools for analyst', () => {
    expect(engine.checkAccess(KEY, 'generate_quote').permitted).toBe(false);
    expect(engine.checkAccess(KEY, 'submit_order').permitted).toBe(false);
    expect(engine.checkAccess(KEY, 'send_feedback').permitted).toBe(false);
  });
});

// ── checkAccess() — admin role ────────────────────────────────────────────────

describe('ToolPolicyEngine.checkAccess() — admin role', () => {
  const engine = makeEngine();
  const KEY = 'Platform Admin Key';

  it('should permit all tools for admin', () => {
    const adminOnlyTools = ['manage_api_keys', 'view_audit_log', 'cancel_order'];
    for (const tool of adminOnlyTools) {
      expect(engine.checkAccess(KEY, tool).permitted).toBe(true);
    }
  });

  it('should deny an unknown tool even for admin (deny-by-default)', () => {
    expect(engine.checkAccess(KEY, 'completely_unknown_tool').permitted).toBe(false);
  });
});

// ── getAllowedTools() ──────────────────────────────────────────────────────────

describe('ToolPolicyEngine.getAllowedTools()', () => {
  const engine = makeEngine();

  it('should return the allowlist for a known role', () => {
    const tools = engine.getAllowedTools('customer');
    expect(tools).toBeDefined();
    expect(tools!.has('get_customer_profile')).toBe(true);
    expect(tools!.has('manage_api_keys')).toBe(false);
  });

  it('should return undefined for an unknown role', () => {
    expect(engine.getAllowedTools('phantom_role')).toBeUndefined();
  });
});

// ── registerRole() ────────────────────────────────────────────────────────────

describe('ToolPolicyEngine.registerRole()', () => {
  it('should add a new custom role with its allowlist', () => {
    const engine = makeEngine();
    engine.registerRole('billing', ['get_quote', 'list_orders', 'generate_invoice']);

    const decision = engine.checkAccess('Billing Service Key', 'get_quote');
    // 'Billing Service Key' resolves to 'customer' (no admin/analyst/agent keyword)
    // so we test with an apiKeyName that resolves to 'billing' — we can't do that
    // without a custom resolveRole override. Instead verify via getAllowedTools.
    const tools = engine.getAllowedTools('billing');
    expect(tools).toBeDefined();
    expect(tools!.has('get_quote')).toBe(true);
    expect(tools!.has('generate_invoice')).toBe(true);
    expect(tools!.has('manage_api_keys')).toBe(false);
  });

  it('should replace the allowlist when re-registering an existing role', () => {
    const engine = makeEngine();
    engine.registerRole('customer', ['get_customer_profile', 'extra_tool']);

    const tools = engine.getAllowedTools('customer');
    expect(tools!.has('extra_tool')).toBe(true);
    // Original customer tools (other than get_customer_profile) are gone
    expect(tools!.has('list_products')).toBe(false);
  });

  it('should not affect other roles when registering a new role', () => {
    const engine = makeEngine();
    engine.registerRole('billing', ['get_quote']);

    // agent role must be unaffected
    const KEY = 'Development API Key'; // resolves to 'agent'
    expect(engine.checkAccess(KEY, 'generate_quote').permitted).toBe(true);
  });
});

// ── PolicyDecision shape ──────────────────────────────────────────────────────

describe('ToolPolicyEngine — PolicyDecision shape', () => {
  const engine = makeEngine();

  it('should include toolName in every decision', () => {
    const d = engine.checkAccess('Dev Key', 'get_customer_profile');
    expect(d.toolName).toBe('get_customer_profile');
  });

  it('should include role in every decision', () => {
    const d = engine.checkAccess('Development API Key', 'get_customer_profile');
    expect(d.role).toBe('agent');
  });

  it('should set reason on deny decisions', () => {
    const d = engine.checkAccess('Dev Key', 'manage_api_keys');
    expect(d.permitted).toBe(false);
    expect(typeof d.reason).toBe('string');
    expect(d.reason!.length).toBeGreaterThan(0);
  });

  it('should leave reason undefined on permit decisions', () => {
    const d = engine.checkAccess('Development API Key', 'generate_quote');
    expect(d.permitted).toBe(true);
    expect(d.reason).toBeUndefined();
  });
});
