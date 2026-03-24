/**
 * Copyright 2026 Vpnet Cloud Solutions Sdn. Bhd.
 * Licensed under the Apache License, Version 2.0
 * See LICENSE in the project root for license information.
 *
 * Implements RFC 9315 Intent-Based Networking
 * https://www.rfc-editor.org/rfc/rfc9315
 */

import {
  IntentHierarchy,
  IntentPriorityLayer,
  intentHierarchy,
} from './IntentHierarchy';

function makeHierarchy(): IntentHierarchy {
  return new IntentHierarchy();
}

// ── register / getRecord / getLayer ──────────────────────────────────────────

describe('IntentHierarchy — register / getRecord / getLayer', () => {
  it('registers an intent and retrieves the full record', () => {
    const h = makeHierarchy();
    h.register('INT-001', IntentPriorityLayer.BUSINESS, 'BSS', 'Customer SLA');
    const r = h.getRecord('INT-001');
    expect(r).toBeDefined();
    expect(r!.intentId).toBe('INT-001');
    expect(r!.layer).toBe(IntentPriorityLayer.BUSINESS);
    expect(r!.owner).toBe('BSS');
    expect(r!.rationale).toBe('Customer SLA');
    expect(r!.registeredAt).toBeTruthy();
  });

  it('returns undefined for an unregistered intent', () => {
    expect(makeHierarchy().getRecord('GHOST')).toBeUndefined();
  });

  it('getLayer returns the correct layer value', () => {
    const h = makeHierarchy();
    h.register('INT-002', IntentPriorityLayer.OPTIMISATION, 'energy-agent');
    expect(h.getLayer('INT-002')).toBe(IntentPriorityLayer.OPTIMISATION);
  });

  it('getLayer returns undefined for an unregistered intent', () => {
    expect(makeHierarchy().getLayer('MISSING')).toBeUndefined();
  });

  it('replaces an existing record when the same intentId is registered again', () => {
    const h = makeHierarchy();
    h.register('INT-003', IntentPriorityLayer.RESOURCE, 'oran-smo');
    h.register('INT-003', IntentPriorityLayer.SERVICE, 'oss', 'updated');
    const r = h.getRecord('INT-003');
    expect(r!.layer).toBe(IntentPriorityLayer.SERVICE);
    expect(r!.owner).toBe('oss');
    expect(r!.rationale).toBe('updated');
  });

  it('omits rationale when not provided', () => {
    const h = makeHierarchy();
    h.register('INT-004', IntentPriorityLayer.SERVICE, 'oss');
    expect(h.getRecord('INT-004')!.rationale).toBeUndefined();
  });

  it('registeredAt is an ISO 8601 string', () => {
    const h = makeHierarchy();
    h.register('INT-005', IntentPriorityLayer.BUSINESS, 'BSS');
    const ts = h.getRecord('INT-005')!.registeredAt;
    expect(() => new Date(ts)).not.toThrow();
    expect(new Date(ts).toISOString()).toBe(ts);
  });
});

// ── isHigherPriority ──────────────────────────────────────────────────────────

describe('IntentHierarchy.isHigherPriority()', () => {
  it('L1 is higher priority than L2', () => {
    const h = makeHierarchy();
    h.register('A', IntentPriorityLayer.BUSINESS, 'BSS');
    h.register('B', IntentPriorityLayer.SERVICE, 'OSS');
    expect(h.isHigherPriority('A', 'B')).toBe(true);
  });

  it('L1 is higher priority than L4', () => {
    const h = makeHierarchy();
    h.register('A', IntentPriorityLayer.BUSINESS, 'BSS');
    h.register('B', IntentPriorityLayer.OPTIMISATION, 'energy-agent');
    expect(h.isHigherPriority('A', 'B')).toBe(true);
  });

  it('L2 is higher priority than L3', () => {
    const h = makeHierarchy();
    h.register('A', IntentPriorityLayer.SERVICE, 'OSS');
    h.register('B', IntentPriorityLayer.RESOURCE, 'oran-smo');
    expect(h.isHigherPriority('A', 'B')).toBe(true);
  });

  it('L3 is higher priority than L4', () => {
    const h = makeHierarchy();
    h.register('A', IntentPriorityLayer.RESOURCE, 'oran-smo');
    h.register('B', IntentPriorityLayer.OPTIMISATION, 'energy-agent');
    expect(h.isHigherPriority('A', 'B')).toBe(true);
  });

  it('same layer returns false (peers, not higher)', () => {
    const h = makeHierarchy();
    h.register('A', IntentPriorityLayer.BUSINESS, 'BSS');
    h.register('B', IntentPriorityLayer.BUSINESS, 'CRM');
    expect(h.isHigherPriority('A', 'B')).toBe(false);
  });

  it('returns false when A is lower priority than B', () => {
    const h = makeHierarchy();
    h.register('A', IntentPriorityLayer.OPTIMISATION, 'energy-agent');
    h.register('B', IntentPriorityLayer.BUSINESS, 'BSS');
    expect(h.isHigherPriority('A', 'B')).toBe(false);
  });

  it('returns false when A is not registered', () => {
    const h = makeHierarchy();
    h.register('B', IntentPriorityLayer.SERVICE, 'OSS');
    expect(h.isHigherPriority('GHOST', 'B')).toBe(false);
  });

  it('returns false when B is not registered', () => {
    const h = makeHierarchy();
    h.register('A', IntentPriorityLayer.BUSINESS, 'BSS');
    expect(h.isHigherPriority('A', 'GHOST')).toBe(false);
  });
});

// ── compare ───────────────────────────────────────────────────────────────────

describe('IntentHierarchy.compare()', () => {
  it('returns -1 when A has higher priority than B', () => {
    const h = makeHierarchy();
    h.register('A', IntentPriorityLayer.BUSINESS, 'BSS');
    h.register('B', IntentPriorityLayer.OPTIMISATION, 'energy-agent');
    expect(h.compare('A', 'B')).toBe(-1);
  });

  it('returns 1 when A has lower priority than B', () => {
    const h = makeHierarchy();
    h.register('A', IntentPriorityLayer.OPTIMISATION, 'energy-agent');
    h.register('B', IntentPriorityLayer.BUSINESS, 'BSS');
    expect(h.compare('A', 'B')).toBe(1);
  });

  it('returns 0 for same layer', () => {
    const h = makeHierarchy();
    h.register('A', IntentPriorityLayer.SERVICE, 'OSS-1');
    h.register('B', IntentPriorityLayer.SERVICE, 'OSS-2');
    expect(h.compare('A', 'B')).toBe(0);
  });

  it('returns 0 when either intent is unregistered', () => {
    const h = makeHierarchy();
    h.register('A', IntentPriorityLayer.BUSINESS, 'BSS');
    expect(h.compare('A', 'GHOST')).toBe(0);
    expect(h.compare('GHOST', 'A')).toBe(0);
  });

  it('can be used to sort a list from highest to lowest priority', () => {
    const h = makeHierarchy();
    h.register('I1', IntentPriorityLayer.OPTIMISATION, 'e');
    h.register('I2', IntentPriorityLayer.BUSINESS, 'BSS');
    h.register('I3', IntentPriorityLayer.RESOURCE, 'oran');
    h.register('I4', IntentPriorityLayer.SERVICE, 'oss');

    const sorted = ['I1', 'I2', 'I3', 'I4'].sort((a, b) => h.compare(a, b));
    expect(sorted).toEqual(['I2', 'I4', 'I3', 'I1']);
  });
});

// ── listByLayer ───────────────────────────────────────────────────────────────

describe('IntentHierarchy.listByLayer()', () => {
  it('returns all intents at a given layer', () => {
    const h = makeHierarchy();
    h.register('A', IntentPriorityLayer.BUSINESS, 'BSS');
    h.register('B', IntentPriorityLayer.BUSINESS, 'CRM');
    h.register('C', IntentPriorityLayer.SERVICE, 'OSS');
    const business = h.listByLayer(IntentPriorityLayer.BUSINESS);
    expect(business).toHaveLength(2);
    expect(business.map((r) => r.intentId).sort()).toEqual(['A', 'B']);
  });

  it('returns empty array when no intents are at that layer', () => {
    const h = makeHierarchy();
    h.register('A', IntentPriorityLayer.BUSINESS, 'BSS');
    expect(h.listByLayer(IntentPriorityLayer.OPTIMISATION)).toHaveLength(0);
  });
});

// ── deregister ────────────────────────────────────────────────────────────────

describe('IntentHierarchy.deregister()', () => {
  it('removes a registered intent and returns true', () => {
    const h = makeHierarchy();
    h.register('INT-X', IntentPriorityLayer.SERVICE, 'OSS');
    expect(h.deregister('INT-X')).toBe(true);
    expect(h.getRecord('INT-X')).toBeUndefined();
  });

  it('returns false for an intent that was never registered', () => {
    expect(makeHierarchy().deregister('GHOST')).toBe(false);
  });

  it('returns false on a second deregister call for the same intent', () => {
    const h = makeHierarchy();
    h.register('INT-Y', IntentPriorityLayer.BUSINESS, 'BSS');
    h.deregister('INT-Y');
    expect(h.deregister('INT-Y')).toBe(false);
  });
});

// ── registrationCount ────────────────────────────────────────────────────────

describe('IntentHierarchy.registrationCount', () => {
  it('starts at zero', () => {
    expect(makeHierarchy().registrationCount).toBe(0);
  });

  it('increments on each register call', () => {
    const h = makeHierarchy();
    h.register('A', IntentPriorityLayer.BUSINESS, 'BSS');
    h.register('B', IntentPriorityLayer.SERVICE, 'OSS');
    expect(h.registrationCount).toBe(2);
  });

  it('decrements on deregister', () => {
    const h = makeHierarchy();
    h.register('A', IntentPriorityLayer.BUSINESS, 'BSS');
    h.register('B', IntentPriorityLayer.SERVICE, 'OSS');
    h.deregister('A');
    expect(h.registrationCount).toBe(1);
  });

  it('does not change when replacing an existing registration', () => {
    const h = makeHierarchy();
    h.register('A', IntentPriorityLayer.BUSINESS, 'BSS');
    h.register('A', IntentPriorityLayer.SERVICE, 'OSS'); // replace
    expect(h.registrationCount).toBe(1);
  });
});

// ── Singleton ─────────────────────────────────────────────────────────────────

describe('intentHierarchy singleton', () => {
  it('exports a shared IntentHierarchy instance', () => {
    expect(intentHierarchy).toBeInstanceOf(IntentHierarchy);
  });
});
