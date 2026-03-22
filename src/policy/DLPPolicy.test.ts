/**
 * Copyright 2026 Vpnet Cloud Solutions Sdn. Bhd.
 * Licensed under the Apache License, Version 2.0
 * See LICENSE in the project root for license information.
 *
 * Implements RFC 9315 Intent-Based Networking
 * https://www.rfc-editor.org/rfc/rfc9315
 */

import { DLPPolicy, DLP_REDACTED } from './DLPPolicy';

function makePolicy(): DLPPolicy {
  return new DLPPolicy();
}

// ── get_customer_profile — customer role ──────────────────────────────────────

describe('DLPPolicy.apply() — get_customer_profile, customer role', () => {
  const policy = makePolicy();

  const fullProfile = {
    customer_id: 'CUST-001',
    name: 'Alice Smith',
    email: 'alice@example.com',
    phone: '+60-11-1234-5678',
    segment: 'premium',
    spending_tier: 'high',
    contract_type: 'postpaid',
    current_services: ['broadband', 'mobile'],
    preferences: { language: 'en' },
    credit_score: 'excellent',
    location: 'Kuala Lumpur, Malaysia',
  };

  it('should permit non-PII operational fields for customer', () => {
    const { sanitised } = policy.apply('get_customer_profile', 'customer', fullProfile);
    expect(sanitised.customer_id).toBe('CUST-001');
    expect(sanitised.segment).toBe('premium');
    expect(sanitised.spending_tier).toBe('high');
    expect(sanitised.contract_type).toBe('postpaid');
    expect(sanitised.current_services).toEqual(['broadband', 'mobile']);
    expect(sanitised.preferences).toEqual({ language: 'en' });
  });

  it('should redact PII fields (name, email, phone) for customer', () => {
    const { sanitised, redactedFields } = policy.apply('get_customer_profile', 'customer', fullProfile);
    expect(sanitised.name).toBe(DLP_REDACTED);
    expect(sanitised.email).toBe(DLP_REDACTED);
    expect(sanitised.phone).toBe(DLP_REDACTED);
    expect(redactedFields).toContain('name');
    expect(redactedFields).toContain('email');
    expect(redactedFields).toContain('phone');
  });

  it('should redact credit_score and location for customer', () => {
    const { sanitised } = policy.apply('get_customer_profile', 'customer', fullProfile);
    expect(sanitised.credit_score).toBe(DLP_REDACTED);
    expect(sanitised.location).toBe(DLP_REDACTED);
  });

  it('should preserve schema shape — all fields present in sanitised response', () => {
    const { sanitised } = policy.apply('get_customer_profile', 'customer', fullProfile);
    expect(Object.keys(sanitised)).toEqual(Object.keys(fullProfile));
  });
});

// ── get_customer_profile — agent role ────────────────────────────────────────

describe('DLPPolicy.apply() — get_customer_profile, agent role', () => {
  const policy = makePolicy();

  const fullProfile = {
    customer_id: 'CUST-001',
    name: 'Alice Smith',
    email: 'alice@example.com',
    phone: '+60-11-1234-5678',
    segment: 'premium',
    spending_tier: 'high',
    contract_type: 'postpaid',
    current_services: ['broadband'],
    preferences: {},
    credit_score: 'excellent',
    location: 'Kuala Lumpur, Malaysia',
  };

  it('should permit operational + credit/location fields for agent', () => {
    const { sanitised } = policy.apply('get_customer_profile', 'agent', fullProfile);
    expect(sanitised.segment).toBe('premium');
    expect(sanitised.credit_score).toBe('excellent');
    expect(sanitised.location).toBe('Kuala Lumpur, Malaysia');
  });

  it('should redact raw contact PII (name, email, phone) for agent', () => {
    const { sanitised, redactedFields } = policy.apply('get_customer_profile', 'agent', fullProfile);
    expect(sanitised.name).toBe(DLP_REDACTED);
    expect(sanitised.email).toBe(DLP_REDACTED);
    expect(sanitised.phone).toBe(DLP_REDACTED);
    expect(redactedFields).toContain('name');
    expect(redactedFields).toContain('email');
    expect(redactedFields).toContain('phone');
  });
});

// ── get_customer_profile — analyst role ──────────────────────────────────────

describe('DLPPolicy.apply() — get_customer_profile, analyst role', () => {
  const policy = makePolicy();

  const profile = {
    customer_id: 'CUST-001',
    name: 'Alice Smith',
    email: 'alice@example.com',
    segment: 'premium',
    spending_tier: 'high',
    contract_type: 'postpaid',
    current_services: ['broadband'],
    credit_score: 'excellent',
  };

  it('should only permit aggregate/segment fields for analyst', () => {
    const { sanitised } = policy.apply('get_customer_profile', 'analyst', profile);
    expect(sanitised.customer_id).toBe('CUST-001');
    expect(sanitised.segment).toBe('premium');
    expect(sanitised.spending_tier).toBe('high');
    expect(sanitised.contract_type).toBe('postpaid');
  });

  it('should redact individual PII and operational fields for analyst', () => {
    const { sanitised, redactedFields } = policy.apply('get_customer_profile', 'analyst', profile);
    expect(sanitised.name).toBe(DLP_REDACTED);
    expect(sanitised.email).toBe(DLP_REDACTED);
    expect(sanitised.current_services).toBe(DLP_REDACTED);
    expect(sanitised.credit_score).toBe(DLP_REDACTED);
    expect(redactedFields.length).toBeGreaterThan(0);
  });
});

// ── get_customer_profile — admin role ────────────────────────────────────────

describe('DLPPolicy.apply() — get_customer_profile, admin role', () => {
  it('should allow all fields for admin (open pass)', () => {
    const policy = makePolicy();
    const profile = {
      customer_id: 'CUST-001',
      name: 'Alice Smith',
      email: 'alice@example.com',
      phone: '+60-11-1234-5678',
      credit_score: 'excellent',
    };
    const { sanitised, redactedFields } = policy.apply('get_customer_profile', 'admin', profile);
    expect(sanitised.email).toBe('alice@example.com');
    expect(sanitised.phone).toBe('+60-11-1234-5678');
    expect(redactedFields).toHaveLength(0);
  });
});

// ── generate_quote — analyst role (full block) ────────────────────────────────

describe('DLPPolicy.apply() — generate_quote, analyst role', () => {
  it('should redact all quote fields for analyst', () => {
    const policy = makePolicy();
    const quote = {
      quote_id: 'Q-001',
      products: ['broadband-100'],
      total_monthly: 199,
      currency: 'MYR',
    };
    const { sanitised, redactedFields } = policy.apply('generate_quote', 'analyst', quote);
    for (const field of Object.keys(quote)) {
      expect(sanitised[field]).toBe(DLP_REDACTED);
    }
    expect(redactedFields).toEqual(expect.arrayContaining(Object.keys(quote)));
  });
});

// ── generate_quote — customer role ───────────────────────────────────────────

describe('DLPPolicy.apply() — generate_quote, customer role', () => {
  it('should allow standard quote fields for customer', () => {
    const policy = makePolicy();
    const quote = {
      quote_id: 'Q-001',
      products: ['broadband-100'],
      subtotal: 199,
      discounts: [],
      discount_amount: 0,
      total_monthly: 199,
      currency: 'MYR',
      valid_until: '2026-04-01',
      terms: 'Standard 24-month contract',
    };
    const { sanitised, redactedFields } = policy.apply('generate_quote', 'customer', quote);
    expect(sanitised.quote_id).toBe('Q-001');
    expect(sanitised.total_monthly).toBe(199);
    expect(redactedFields).toHaveLength(0);
  });
});

// ── Product catalog tools — all roles open pass ───────────────────────────────

describe('DLPPolicy.apply() — product catalog tools, all roles', () => {
  const roles = ['customer', 'agent', 'analyst', 'admin'];
  const catalogResponse = { product_id: 'P-001', name: 'Broadband 100', price: 199 };

  for (const role of roles) {
    it(`should not redact any fields for ${role} on search_product_catalog`, () => {
      const policy = makePolicy();
      const { sanitised, redactedFields } = policy.apply('search_product_catalog', role, catalogResponse);
      expect(sanitised).toEqual(catalogResponse);
      expect(redactedFields).toHaveLength(0);
    });
  }
});

// ── get_analytics_report — customer role (blocked) ───────────────────────────

describe('DLPPolicy.apply() — get_analytics_report, customer role', () => {
  it('should redact all analytics fields for customer', () => {
    const policy = makePolicy();
    const report = { report_type: 'churn', period: 'Q1-2026', summary: { total: 100 } };
    const { sanitised, redactedFields } = policy.apply('get_analytics_report', 'customer', report);
    for (const field of Object.keys(report)) {
      expect(sanitised[field]).toBe(DLP_REDACTED);
    }
    expect(redactedFields.length).toBe(3);
  });
});

// ── Unknown tool — universal sensitive-field redaction ────────────────────────

describe('DLPPolicy.apply() — unknown tool', () => {
  const policy = makePolicy();

  it('should redact universally sensitive fields on an unknown tool', () => {
    const response = {
      public_data: 'hello',
      email: 'user@example.com',
      token: 'secret-token',
      phone: '+1-555-1234',
    };
    const { sanitised, redactedFields } = policy.apply('unknown_tool_xyz', 'agent', response);
    expect(sanitised.public_data).toBe('hello');
    expect(sanitised.email).toBe(DLP_REDACTED);
    expect(sanitised.token).toBe(DLP_REDACTED);
    expect(sanitised.phone).toBe(DLP_REDACTED);
    expect(redactedFields).toContain('email');
    expect(redactedFields).toContain('token');
    expect(redactedFields).toContain('phone');
  });

  it('should not redact non-sensitive fields on an unknown tool', () => {
    const response = { product_name: 'Broadband', price: 99, available: true };
    const { sanitised, redactedFields } = policy.apply('new_tool', 'agent', response);
    expect(sanitised).toEqual(response);
    expect(redactedFields).toHaveLength(0);
  });
});

// ── registerTool() — custom tool registration ─────────────────────────────────

describe('DLPPolicy.registerTool()', () => {
  it('should allow custom tools to be registered with per-role policies', () => {
    const policy = makePolicy();
    policy.registerTool('get_billing_record', {
      customer: new Set(['invoice_id', 'amount', 'due_date']),
      agent: '*',
      analyst: new Set(['amount', 'due_date']),
      admin: '*',
    });

    const billing = { invoice_id: 'INV-001', amount: 199, due_date: '2026-04-01', bank_account: 'REDACT' };

    const customerResult = policy.apply('get_billing_record', 'customer', billing);
    expect(customerResult.sanitised.invoice_id).toBe('INV-001');
    expect(customerResult.sanitised.bank_account).toBe(DLP_REDACTED);

    const agentResult = policy.apply('get_billing_record', 'agent', billing);
    expect(agentResult.redactedFields).toHaveLength(0);
  });

  it('should not affect other tools when registering a custom tool', () => {
    const policy = makePolicy();
    policy.registerTool('new_custom_tool', { agent: '*', customer: new Set([]), analyst: new Set([]), admin: '*' });

    // Existing tool should be unaffected
    const { sanitised } = policy.apply('search_product_catalog', 'customer', { name: 'Broadband', price: 99 });
    expect(sanitised.name).toBe('Broadband');
  });

  it('should replace an existing tool policy on re-registration', () => {
    const policy = makePolicy();
    // Re-register get_customer_profile to allow name for agent
    policy.registerTool('get_customer_profile', {
      customer: new Set(['customer_id']),
      agent: new Set(['customer_id', 'name']),
      analyst: new Set([]),
      admin: '*',
    });

    const { sanitised } = policy.apply('get_customer_profile', 'agent', {
      customer_id: 'CUST-001',
      name: 'Alice',
      email: 'alice@example.com',
    });
    expect(sanitised.name).toBe('Alice');
    expect(sanitised.email).toBe(DLP_REDACTED);
  });
});

// ── Unknown role fallback ─────────────────────────────────────────────────────

describe('DLPPolicy.apply() — unknown role fallback', () => {
  it('should fall back to customer policy for an unrecognised role on a known tool', () => {
    const policy = makePolicy();
    const profile = {
      customer_id: 'CUST-001',
      name: 'Alice',
      email: 'alice@example.com',
      segment: 'premium',
    };
    // 'auditor' is not in built-in rules — should fall back to 'customer'
    const { sanitised } = policy.apply('get_customer_profile', 'auditor', profile);
    expect(sanitised.segment).toBe('premium');
    expect(sanitised.name).toBe(DLP_REDACTED);
    expect(sanitised.email).toBe(DLP_REDACTED);
  });
});

// ── Schema preservation ───────────────────────────────────────────────────────

describe('DLPPolicy — schema preservation', () => {
  it('should return all input field keys in the sanitised output', () => {
    const policy = makePolicy();
    const profile = { customer_id: 'C1', name: 'Bob', email: 'bob@x.com', segment: 'basic', credit_score: 'good' };
    const { sanitised } = policy.apply('get_customer_profile', 'customer', profile);
    expect(Object.keys(sanitised).sort()).toEqual(Object.keys(profile).sort());
  });

  it('should not modify non-string field values that are permitted', () => {
    const policy = makePolicy();
    const response = { current_services: ['mobile', 'broadband'], preferences: { sms: true }, spending_tier: 'high' };
    const { sanitised } = policy.apply('get_customer_profile', 'customer', response);
    expect(sanitised.current_services).toEqual(['mobile', 'broadband']);
    expect(sanitised.preferences).toEqual({ sms: true });
  });
});
