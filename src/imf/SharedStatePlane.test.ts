/**
 * Copyright 2026 Vpnet Cloud Solutions Sdn. Bhd.
 * Licensed under the Apache License, Version 2.0
 * See LICENSE in the project root for license information.
 *
 * Implements RFC 9315 Intent-Based Networking
 * https://www.rfc-editor.org/rfc/rfc9315
 */

import {
  SharedStatePlane,
  sharedStatePlane,
  DEFAULT_HYSTERESIS_MS,
  DEFAULT_RECENT_WINDOW_MS,
} from './SharedStatePlane';
import { IntentPriorityLayer } from './IntentHierarchy';

function makePlane(): SharedStatePlane {
  return new SharedStatePlane();
}

function recordNow(
  plane: SharedStatePlane,
  resource: string,
  intentId = 'INT-001',
  agentId = 'agent-A',
  action = 'increase'
) {
  return plane.recordActuation({
    intentId,
    agentId,
    resource,
    action,
    executedAt: new Date().toISOString(),
  });
}

// ── registerIntent / getIntentState ──────────────────────────────────────────

describe('SharedStatePlane — registerIntent / getIntentState', () => {
  it('registers an intent with idle status', () => {
    const p = makePlane();
    const e = p.registerIntent('INT-001', IntentPriorityLayer.BUSINESS, 'BSS');
    expect(e.intentId).toBe('INT-001');
    expect(e.layer).toBe(IntentPriorityLayer.BUSINESS);
    expect(e.owner).toBe('BSS');
    expect(e.actuationStatus).toBe('idle');
    expect(e.lastUpdatedAt).toBeTruthy();
  });

  it('defaults owner to "unknown" when omitted', () => {
    const p = makePlane();
    const e = p.registerIntent('INT-002', IntentPriorityLayer.SERVICE);
    expect(e.owner).toBe('unknown');
  });

  it('getIntentState returns the registered entry', () => {
    const p = makePlane();
    p.registerIntent('INT-003', IntentPriorityLayer.RESOURCE, 'oran-smo');
    const e = p.getIntentState('INT-003');
    expect(e).toBeDefined();
    expect(e!.intentId).toBe('INT-003');
  });

  it('returns undefined for an unregistered intent', () => {
    expect(makePlane().getIntentState('GHOST')).toBeUndefined();
  });

  it('replaces an existing entry on re-registration', () => {
    const p = makePlane();
    p.registerIntent('INT-004', IntentPriorityLayer.OPTIMISATION, 'energy-agent');
    p.registerIntent('INT-004', IntentPriorityLayer.BUSINESS, 'BSS');
    expect(p.getIntentState('INT-004')!.layer).toBe(IntentPriorityLayer.BUSINESS);
  });

  it('pendingProposalId and lastActuatedAt are undefined after registration', () => {
    const p = makePlane();
    p.registerIntent('INT-005', IntentPriorityLayer.SERVICE, 'oss');
    const e = p.getIntentState('INT-005')!;
    expect(e.pendingProposalId).toBeUndefined();
    expect(e.lastActuatedAt).toBeUndefined();
  });
});

// ── setActuationStatus ───────────────────────────────────────────────────────

describe('SharedStatePlane.setActuationStatus()', () => {
  it('updates the actuation status', () => {
    const p = makePlane();
    p.registerIntent('INT-A', IntentPriorityLayer.BUSINESS, 'BSS');
    p.setActuationStatus('INT-A', 'pending-proposal', 'PROP-1');
    expect(p.getIntentState('INT-A')!.actuationStatus).toBe('pending-proposal');
  });

  it('sets pendingProposalId when status is pending-proposal', () => {
    const p = makePlane();
    p.registerIntent('INT-B', IntentPriorityLayer.BUSINESS, 'BSS');
    p.setActuationStatus('INT-B', 'pending-proposal', 'PROP-99');
    expect(p.getIntentState('INT-B')!.pendingProposalId).toBe('PROP-99');
  });

  it('clears pendingProposalId when status transitions away from pending-proposal', () => {
    const p = makePlane();
    p.registerIntent('INT-C', IntentPriorityLayer.SERVICE, 'oss');
    p.setActuationStatus('INT-C', 'pending-proposal', 'PROP-5');
    p.setActuationStatus('INT-C', 'actuating');
    expect(p.getIntentState('INT-C')!.pendingProposalId).toBeUndefined();
  });

  it('updates lastUpdatedAt on each call', () => {
    const p = makePlane();
    p.registerIntent('INT-D', IntentPriorityLayer.RESOURCE, 'oran');
    const before = p.getIntentState('INT-D')!.lastUpdatedAt;
    p.setActuationStatus('INT-D', 'fulfilled');
    const after = p.getIntentState('INT-D')!.lastUpdatedAt;
    expect(after >= before).toBe(true);
  });

  it('throws for an unregistered intent', () => {
    expect(() => makePlane().setActuationStatus('GHOST', 'idle')).toThrow(/not registered/);
  });
});

// ── recordActuation ──────────────────────────────────────────────────────────

describe('SharedStatePlane.recordActuation()', () => {
  it('assigns a unique actuationId', () => {
    const p = makePlane();
    const r = recordNow(p, 'ran-slice:001:prb');
    expect(r.actuationId).toBeTruthy();
    expect(typeof r.actuationId).toBe('string');
  });

  it('stores all provided fields', () => {
    const p = makePlane();
    const r = p.recordActuation({
      intentId: 'INT-001',
      agentId: 'energy-agent',
      resource: 'ran-slice:002:prb',
      action: 'decrease',
      executedAt: new Date().toISOString(),
      durationMs: 42,
    });
    expect(r.intentId).toBe('INT-001');
    expect(r.agentId).toBe('energy-agent');
    expect(r.resource).toBe('ran-slice:002:prb');
    expect(r.action).toBe('decrease');
    expect(r.durationMs).toBe(42);
  });

  it('updates lastActuatedAt and lastActuatedResource on the intent state entry', () => {
    const p = makePlane();
    p.registerIntent('INT-001', IntentPriorityLayer.BUSINESS, 'BSS');
    const ts = new Date().toISOString();
    p.recordActuation({
      intentId: 'INT-001',
      agentId: 'agent',
      resource: 'ran-slice:001:prb',
      action: 'increase',
      executedAt: ts,
    });
    const e = p.getIntentState('INT-001')!;
    expect(e.lastActuatedAt).toBe(ts);
    expect(e.lastActuatedResource).toBe('ran-slice:001:prb');
  });

  it('does not throw when the intent is not registered', () => {
    const p = makePlane();
    expect(() => recordNow(p, 'some-resource', 'UNREGISTERED')).not.toThrow();
  });

  it('increments actuationCount', () => {
    const p = makePlane();
    expect(p.actuationCount).toBe(0);
    recordNow(p, 'res-1');
    recordNow(p, 'res-2');
    expect(p.actuationCount).toBe(2);
  });
});

// ── isWithinHysteresis ───────────────────────────────────────────────────────

describe('SharedStatePlane.isWithinHysteresis()', () => {
  it('returns true immediately after an actuation', () => {
    const p = makePlane();
    recordNow(p, 'ran-slice:001:prb');
    expect(p.isWithinHysteresis('ran-slice:001:prb')).toBe(true);
  });

  it('returns false when the resource has never been actuated', () => {
    expect(makePlane().isWithinHysteresis('fresh-resource')).toBe(false);
  });

  it('returns false when the actuation is outside the window', () => {
    const p = makePlane();
    const staleTime = new Date(Date.now() - DEFAULT_HYSTERESIS_MS - 1000).toISOString();
    p.recordActuation({
      intentId: 'INT-001',
      agentId: 'agent',
      resource: 'old-resource',
      action: 'increase',
      executedAt: staleTime,
    });
    expect(p.isWithinHysteresis('old-resource')).toBe(false);
  });

  it('respects a custom windowMs', () => {
    const p = makePlane();
    recordNow(p, 'custom-res');
    expect(p.isWithinHysteresis('custom-res', 0)).toBe(false); // 0ms window = already expired
  });

  it('does not confuse different resources', () => {
    const p = makePlane();
    recordNow(p, 'resource-A');
    expect(p.isWithinHysteresis('resource-B')).toBe(false);
  });
});

// ── getRecentActuations ──────────────────────────────────────────────────────

describe('SharedStatePlane.getRecentActuations()', () => {
  it('returns all recent actuations when no resource filter is given', () => {
    const p = makePlane();
    recordNow(p, 'res-1', 'INT-001', 'agent-A');
    recordNow(p, 'res-2', 'INT-002', 'agent-B');
    expect(p.getRecentActuations()).toHaveLength(2);
  });

  it('filters by resource when provided', () => {
    const p = makePlane();
    recordNow(p, 'res-1');
    recordNow(p, 'res-2');
    recordNow(p, 'res-1');
    const results = p.getRecentActuations('res-1');
    expect(results).toHaveLength(2);
    expect(results.every((r) => r.resource === 'res-1')).toBe(true);
  });

  it('excludes actuations outside the limitMs window', () => {
    const p = makePlane();
    const staleTime = new Date(Date.now() - DEFAULT_RECENT_WINDOW_MS - 1000).toISOString();
    p.recordActuation({
      intentId: 'INT-001',
      agentId: 'agent',
      resource: 'stale-res',
      action: 'increase',
      executedAt: staleTime,
    });
    expect(p.getRecentActuations('stale-res')).toHaveLength(0);
  });

  it('returns empty array when no actuations exist', () => {
    expect(makePlane().getRecentActuations()).toHaveLength(0);
  });
});

// ── listIntentsByLayer / queryState ──────────────────────────────────────────

describe('SharedStatePlane — listIntentsByLayer / queryState', () => {
  it('listIntentsByLayer returns only intents at the specified layer', () => {
    const p = makePlane();
    p.registerIntent('A', IntentPriorityLayer.BUSINESS, 'BSS');
    p.registerIntent('B', IntentPriorityLayer.BUSINESS, 'CRM');
    p.registerIntent('C', IntentPriorityLayer.OPTIMISATION, 'energy-agent');
    const business = p.listIntentsByLayer(IntentPriorityLayer.BUSINESS);
    expect(business).toHaveLength(2);
    expect(business.map((e) => e.intentId).sort()).toEqual(['A', 'B']);
  });

  it('listIntentsByLayer returns empty array when no intents are at that layer', () => {
    const p = makePlane();
    p.registerIntent('A', IntentPriorityLayer.BUSINESS, 'BSS');
    expect(p.listIntentsByLayer(IntentPriorityLayer.RESOURCE)).toHaveLength(0);
  });

  it('queryState with no filter returns all intents', () => {
    const p = makePlane();
    p.registerIntent('A', IntentPriorityLayer.BUSINESS, 'BSS');
    p.registerIntent('B', IntentPriorityLayer.OPTIMISATION, 'e');
    expect(p.queryState()).toHaveLength(2);
  });

  it('queryState filters by layer', () => {
    const p = makePlane();
    p.registerIntent('A', IntentPriorityLayer.BUSINESS, 'BSS');
    p.registerIntent('B', IntentPriorityLayer.SERVICE, 'OSS');
    const results = p.queryState({ layer: IntentPriorityLayer.SERVICE });
    expect(results).toHaveLength(1);
    expect(results[0].intentId).toBe('B');
  });

  it('queryState filters by status', () => {
    const p = makePlane();
    p.registerIntent('A', IntentPriorityLayer.BUSINESS, 'BSS');
    p.registerIntent('B', IntentPriorityLayer.SERVICE, 'OSS');
    p.setActuationStatus('B', 'fulfilled');
    const fulfilled = p.queryState({ status: 'fulfilled' });
    expect(fulfilled).toHaveLength(1);
    expect(fulfilled[0].intentId).toBe('B');
  });

  it('queryState filters by both layer and status', () => {
    const p = makePlane();
    p.registerIntent('A', IntentPriorityLayer.BUSINESS, 'BSS');
    p.registerIntent('B', IntentPriorityLayer.BUSINESS, 'CRM');
    p.setActuationStatus('A', 'fulfilled');
    const results = p.queryState({
      layer: IntentPriorityLayer.BUSINESS,
      status: 'fulfilled',
    });
    expect(results).toHaveLength(1);
    expect(results[0].intentId).toBe('A');
  });
});

// ── intentCount ──────────────────────────────────────────────────────────────

describe('SharedStatePlane.intentCount', () => {
  it('starts at zero', () => {
    expect(makePlane().intentCount).toBe(0);
  });

  it('increments on each registerIntent call', () => {
    const p = makePlane();
    p.registerIntent('A', IntentPriorityLayer.BUSINESS, 'BSS');
    p.registerIntent('B', IntentPriorityLayer.SERVICE, 'OSS');
    expect(p.intentCount).toBe(2);
  });

  it('does not change when re-registering the same intent', () => {
    const p = makePlane();
    p.registerIntent('A', IntentPriorityLayer.BUSINESS, 'BSS');
    p.registerIntent('A', IntentPriorityLayer.SERVICE, 'OSS');
    expect(p.intentCount).toBe(1);
  });
});

// ── Singleton ─────────────────────────────────────────────────────────────────

describe('sharedStatePlane singleton', () => {
  it('exports a shared SharedStatePlane instance', () => {
    expect(sharedStatePlane).toBeInstanceOf(SharedStatePlane);
  });
});
