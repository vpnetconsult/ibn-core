/**
 * Copyright 2026 Vpnet Cloud Solutions Sdn. Bhd.
 * Licensed under the Apache License, Version 2.0
 * See LICENSE in the project root for license information.
 *
 * Implements RFC 9315 Intent-Based Networking
 * https://www.rfc-editor.org/rfc/rfc9315
 */

import { KnowledgeStore, KnowledgeRegistry } from './KnowledgeStore';

function makeStore(domainId = 'test-domain'): KnowledgeStore {
  return new KnowledgeStore(domainId);
}

// ── assertFact / getFact ──────────────────────────────────────────────────────

describe('KnowledgeStore — facts', () => {
  it('should store and retrieve a fact', () => {
    const store = makeStore();
    store.assertFact('max_bandwidth', 1000);
    const fact = store.getFact('max_bandwidth');
    expect(fact).toBeDefined();
    expect(fact!.value).toBe(1000);
    expect(fact!.confidence).toBe(1.0);
    expect(fact!.source).toBe('operator');
  });

  it('should replace an existing fact with the same key', () => {
    const store = makeStore();
    store.assertFact('speed', 100);
    store.assertFact('speed', 200, { source: 'measurement', confidence: 0.8 });
    const fact = store.getFact('speed');
    expect(fact!.value).toBe(200);
    expect(fact!.source).toBe('measurement');
    expect(fact!.confidence).toBe(0.8);
  });

  it('should return undefined for a missing fact', () => {
    expect(makeStore().getFact('nonexistent')).toBeUndefined();
  });

  it('should evict and return undefined for an expired fact', () => {
    const store = makeStore();
    // TTL of -1 second (already expired)
    store.assertFact('stale', 'old', { ttlSeconds: -1 });
    expect(store.getFact('stale')).toBeUndefined();
    expect(store.factCount).toBe(0);
  });

  it('should return a live fact that has not expired', () => {
    const store = makeStore();
    store.assertFact('fresh', 42, { ttlSeconds: 3600 });
    expect(store.getFact('fresh')).toBeDefined();
    expect(store.getFact('fresh')!.value).toBe(42);
  });

  it('should count only non-expired facts', () => {
    const store = makeStore();
    store.assertFact('a', 1, { ttlSeconds: 3600 });
    store.assertFact('b', 2, { ttlSeconds: 3600 });
    store.assertFact('c', 3, { ttlSeconds: -1 }); // expired
    expect(store.factCount).toBe(2);
  });

  it('should store object values', () => {
    const store = makeStore();
    store.assertFact('profile', { tier: 'premium', segment: 'enterprise' });
    expect(store.getFact('profile')!.value).toEqual({ tier: 'premium', segment: 'enterprise' });
  });
});

// ── getFactValue ──────────────────────────────────────────────────────────────

describe('KnowledgeStore.getFactValue()', () => {
  it('should return the fact value when the fact exists', () => {
    const store = makeStore();
    store.assertFact('limit', 100);
    expect(store.getFactValue<number>('limit', 0)).toBe(100);
  });

  it('should return the default when the fact is missing', () => {
    expect(makeStore().getFactValue<string>('missing', 'default')).toBe('default');
  });

  it('should return the default when the fact is expired', () => {
    const store = makeStore();
    store.assertFact('key', 'value', { ttlSeconds: -1 });
    expect(store.getFactValue<string>('key', 'fallback')).toBe('fallback');
  });
});

// ── retractFact ───────────────────────────────────────────────────────────────

describe('KnowledgeStore.retractFact()', () => {
  it('should remove an existing fact and return true', () => {
    const store = makeStore();
    store.assertFact('key', 'value');
    expect(store.retractFact('key')).toBe(true);
    expect(store.getFact('key')).toBeUndefined();
  });

  it('should return false for a non-existent key', () => {
    expect(makeStore().retractFact('ghost')).toBe(false);
  });
});

// ── queryFacts ────────────────────────────────────────────────────────────────

describe('KnowledgeStore.queryFacts()', () => {
  it('should return all facts matching a prefix', () => {
    const store = makeStore();
    store.assertFact('network.latency', 20);
    store.assertFact('network.bandwidth', 1000);
    store.assertFact('customer.tier', 'premium');
    const results = store.queryFacts('network.');
    expect(results).toHaveLength(2);
    expect(results.map((f) => f.key).sort()).toEqual(['network.bandwidth', 'network.latency']);
  });

  it('should return all facts when prefix is empty string', () => {
    const store = makeStore();
    store.assertFact('a', 1);
    store.assertFact('b', 2);
    expect(store.queryFacts('')).toHaveLength(2);
  });

  it('should exclude expired facts from query results', () => {
    const store = makeStore();
    store.assertFact('network.ok', 1, { ttlSeconds: 3600 });
    store.assertFact('network.stale', 0, { ttlSeconds: -1 });
    const results = store.queryFacts('network.');
    expect(results).toHaveLength(1);
    expect(results[0].key).toBe('network.ok');
  });

  it('should return empty array when no facts match prefix', () => {
    const store = makeStore();
    store.assertFact('foo.bar', 1);
    expect(store.queryFacts('xyz.')).toHaveLength(0);
  });
});

// ── recordMeasurement ─────────────────────────────────────────────────────────

describe('KnowledgeStore — measurements', () => {
  it('should record a measurement with an auto-incrementing sequence number', () => {
    const store = makeStore();
    const m = store.recordMeasurement('INT-001', 'throughput_mbps', 950, 'mbps', 'fulfilled');
    expect(m.sequenceNumber).toBe(1);
    expect(m.intentId).toBe('INT-001');
    expect(m.metric).toBe('throughput_mbps');
    expect(m.value).toBe(950);
    expect(m.fulfilmentState).toBe('fulfilled');
  });

  it('should increment sequence numbers correctly', () => {
    const store = makeStore();
    const m1 = store.recordMeasurement('INT-001', 'latency_ms', 10, 'ms', 'fulfilled');
    const m2 = store.recordMeasurement('INT-001', 'latency_ms', 15, 'ms', 'degraded');
    expect(m1.sequenceNumber).toBe(1);
    expect(m2.sequenceNumber).toBe(2);
  });

  it('should filter measurements by intentId', () => {
    const store = makeStore();
    store.recordMeasurement('INT-001', 'latency_ms', 10, 'ms', 'fulfilled');
    store.recordMeasurement('INT-002', 'latency_ms', 50, 'ms', 'degraded');
    store.recordMeasurement('INT-001', 'latency_ms', 12, 'ms', 'fulfilled');
    const results = store.getMeasurements('INT-001');
    expect(results).toHaveLength(2);
    expect(results.every((m) => m.intentId === 'INT-001')).toBe(true);
  });

  it('should respect the limit parameter', () => {
    const store = makeStore();
    for (let i = 0; i < 20; i++) {
      store.recordMeasurement('INT-001', 'metric', i, 'unit', 'fulfilled');
    }
    const recent = store.getMeasurements('INT-001', 5);
    expect(recent).toHaveLength(5);
    expect(recent[4].value).toBe(19); // newest last
  });

  it('should return all measurements when intentId is omitted', () => {
    const store = makeStore();
    store.recordMeasurement('INT-001', 'm', 1, 'u', 'fulfilled');
    store.recordMeasurement('INT-002', 'm', 2, 'u', 'degraded');
    expect(store.getMeasurements()).toHaveLength(2);
  });
});

// ── getLatestFulfilmentState ──────────────────────────────────────────────────

describe('KnowledgeStore.getLatestFulfilmentState()', () => {
  it('should return the most recent fulfilment state for an intent', () => {
    const store = makeStore();
    store.recordMeasurement('INT-001', 'metric', 1, 'u', 'not-fulfilled');
    store.recordMeasurement('INT-001', 'metric', 2, 'u', 'fulfilled');
    expect(store.getLatestFulfilmentState('INT-001')).toBe('fulfilled');
  });

  it('should return "unknown" when no measurements exist', () => {
    expect(makeStore().getLatestFulfilmentState('INT-999')).toBe('unknown');
  });
});

// ── Domain state transitions ──────────────────────────────────────────────────

describe('KnowledgeStore — domain state', () => {
  it('should start in idle state', () => {
    expect(makeStore().getDomainState()).toBe('idle');
  });

  it('should transition to degraded on a degraded measurement', () => {
    const store = makeStore();
    store.recordMeasurement('INT-001', 'm', 1, 'u', 'degraded');
    expect(store.getDomainState()).toBe('degraded');
  });

  it('should transition to recovering on not-fulfilled measurement', () => {
    const store = makeStore();
    store.recordMeasurement('INT-001', 'm', 1, 'u', 'not-fulfilled');
    expect(store.getDomainState()).toBe('recovering');
  });

  it('should transition back to idle on fulfilled measurement', () => {
    const store = makeStore();
    store.recordMeasurement('INT-001', 'm', 1, 'u', 'degraded');
    expect(store.getDomainState()).toBe('degraded');
    store.recordMeasurement('INT-001', 'm', 2, 'u', 'fulfilled');
    expect(store.getDomainState()).toBe('idle');
  });

  it('should allow manual state override via setDomainState', () => {
    const store = makeStore();
    store.setDomainState('failed');
    expect(store.getDomainState()).toBe('failed');
  });

  it('should not transition out of failed state via not-fulfilled measurement', () => {
    const store = makeStore();
    store.setDomainState('failed');
    store.recordMeasurement('INT-001', 'm', 1, 'u', 'not-fulfilled');
    expect(store.getDomainState()).toBe('failed');
  });
});

// ── recordDecision ────────────────────────────────────────────────────────────

describe('KnowledgeStore — decisions', () => {
  it('should record a decision and retrieve it', () => {
    const store = makeStore();
    const d = store.recordDecision(
      'TRANSLATING',
      'select_intent_type',
      'broadband_residential',
      'Customer mentioned WFH and high-speed; broadband fits best.',
      0.92
    );
    expect(d.phase).toBe('TRANSLATING');
    expect(d.label).toBe('select_intent_type');
    expect(d.choice).toBe('broadband_residential');
    expect(d.confidence).toBe(0.92);
  });

  it('should filter decisions by phase', () => {
    const store = makeStore();
    store.recordDecision('TRANSLATING', 'a', 'x', 'r', 0.9);
    store.recordDecision('ORCHESTRATING', 'b', 'y', 'r', 0.8);
    store.recordDecision('TRANSLATING', 'c', 'z', 'r', 0.7);
    const translating = store.getDecisions('TRANSLATING');
    expect(translating).toHaveLength(2);
    expect(translating.every((d) => d.phase === 'TRANSLATING')).toBe(true);
  });

  it('should return all decisions when phase is omitted', () => {
    const store = makeStore();
    store.recordDecision('TRANSLATING', 'a', 'x', 'r', 0.9);
    store.recordDecision('ASSESSING', 'b', 'y', 'r', 0.8);
    expect(store.getDecisions()).toHaveLength(2);
  });
});

// ── snapshot ──────────────────────────────────────────────────────────────────

describe('KnowledgeStore.snapshot()', () => {
  it('should include all store metrics', () => {
    const store = makeStore('domain-A');
    store.assertFact('key1', 'v1');
    store.assertFact('key2', 'v2');
    store.recordMeasurement('INT-001', 'm', 1, 'u', 'fulfilled');
    store.recordDecision('TRANSLATING', 'l', 'c', 'r', 0.9);

    const snap = store.snapshot();
    expect(snap.domainId).toBe('domain-A');
    expect(snap.domainState).toBe('idle');
    expect(snap.factCount).toBe(2);
    expect(snap.measurementCount).toBe(1);
    expect(snap.decisionCount).toBe(1);
    expect(snap.latestMeasurement).toBeDefined();
    expect(snap.latestDecision).toBeDefined();
  });

  it('should have undefined latestMeasurement and latestDecision when empty', () => {
    const snap = makeStore().snapshot();
    expect(snap.latestMeasurement).toBeUndefined();
    expect(snap.latestDecision).toBeUndefined();
  });
});

// ── KnowledgeRegistry ─────────────────────────────────────────────────────────

describe('KnowledgeRegistry', () => {
  it('should create a new store for an unseen domain', () => {
    const registry = new KnowledgeRegistry();
    const store = registry.getOrCreate('domain-X');
    expect(store).toBeDefined();
    expect(registry.domainCount).toBe(1);
  });

  it('should return the same store on repeated calls for the same domain', () => {
    const registry = new KnowledgeRegistry();
    const a = registry.getOrCreate('domain-Y');
    const b = registry.getOrCreate('domain-Y');
    expect(a).toBe(b);
  });

  it('should maintain separate stores for different domains', () => {
    const registry = new KnowledgeRegistry();
    const a = registry.getOrCreate('domain-A');
    const b = registry.getOrCreate('domain-B');
    a.assertFact('key', 'a');
    expect(b.getFact('key')).toBeUndefined();
  });

  it('should list all registered domain IDs', () => {
    const registry = new KnowledgeRegistry();
    registry.getOrCreate('domain-1');
    registry.getOrCreate('domain-2');
    registry.getOrCreate('domain-3');
    expect(registry.listDomains().sort()).toEqual(['domain-1', 'domain-2', 'domain-3']);
  });

  it('should report the correct domain count', () => {
    const registry = new KnowledgeRegistry();
    registry.getOrCreate('d1');
    registry.getOrCreate('d2');
    expect(registry.domainCount).toBe(2);
  });
});
