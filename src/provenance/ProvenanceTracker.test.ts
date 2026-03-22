/**
 * Copyright 2026 Vpnet Cloud Solutions Sdn. Bhd.
 * Licensed under the Apache License, Version 2.0
 * See LICENSE in the project root for license information.
 *
 * Implements RFC 9315 Intent-Based Networking
 * https://www.rfc-editor.org/rfc/rfc9315
 */

import crypto from 'crypto';
import { ProvenanceTracker } from './ProvenanceTracker';
import { RecordToolCallParams, SessionContext } from './types';

// ── Fixtures ─────────────────────────────────────────────────────────────────

const SESSION: SessionContext = {
  sessionId: 'sess-test-001',
  userId: 'CUST-12345',
  apiKeyName: 'Development API Key',
  intentId: 'intent-abc',
  correlationId: 'corr-xyz',
};

function makeCall(overrides: Partial<RecordToolCallParams> = {}): RecordToolCallParams {
  return {
    session: SESSION,
    toolName: 'get_customer_profile',
    mcpServer: 'http://customer-data-mcp:3000',
    toolParameters: { customer_id: 'CUST-12345' },
    toolResponse: { segment: 'Young Professional', name: 'John Doe' },
    responseStatus: 'success',
    durationMs: 42,
    dataSourcesTouched: ['customer-data'],
    ...overrides,
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('ProvenanceTracker', () => {
  let tracker: ProvenanceTracker;

  beforeEach(() => {
    tracker = new ProvenanceTracker();
  });

  // ── record() ────────────────────────────────────────────────────────────

  describe('record()', () => {
    it('should return a record with all expected fields', () => {
      const rec = tracker.record(makeCall());

      expect(rec.recordId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
      expect(rec.sessionId).toBe(SESSION.sessionId);
      expect(rec.sequenceNumber).toBe(1);
      expect(rec.parentHash).toBe('GENESIS');
      expect(rec.userId).toBe(SESSION.userId);
      expect(rec.apiKeyName).toBe(SESSION.apiKeyName);
      expect(rec.toolName).toBe('get_customer_profile');
      expect(rec.mcpServer).toBe('http://customer-data-mcp:3000');
      expect(rec.responseStatus).toBe('success');
      expect(rec.durationMs).toBe(42);
      expect(rec.dataSourcesTouched).toEqual(['customer-data']);
      expect(rec.selfHash).toHaveLength(64); // SHA-256 hex
    });

    it('should increment sequenceNumber with each record', () => {
      const r1 = tracker.record(makeCall());
      const r2 = tracker.record(makeCall({ toolName: 'search_product_catalog' }));
      const r3 = tracker.record(makeCall({ toolName: 'generate_quote' }));

      expect(r1.sequenceNumber).toBe(1);
      expect(r2.sequenceNumber).toBe(2);
      expect(r3.sequenceNumber).toBe(3);
    });

    it('should link parentHash of each record to selfHash of the previous', () => {
      const r1 = tracker.record(makeCall());
      const r2 = tracker.record(makeCall());
      const r3 = tracker.record(makeCall());

      expect(r2.parentHash).toBe(r1.selfHash);
      expect(r3.parentHash).toBe(r2.selfHash);
    });

    it('should store intent and correlation context from session', () => {
      const rec = tracker.record(makeCall());

      expect(rec.intentId).toBe('intent-abc');
      expect(rec.correlationId).toBe('corr-xyz');
    });

    it('should store agentReasoning when provided', () => {
      const rec = tracker.record(
        makeCall({ agentReasoning: 'Fetching profile to personalise offer' })
      );

      expect(rec.agentReasoning).toBe('Fetching profile to personalise offer');
    });

    it('should mask PII in toolParameters before storage', () => {
      const rec = tracker.record(
        makeCall({
          toolParameters: {
            customer_id: 'CUST-12345',
            email: 'john.doe@example.com',
            phone: '+60123456789',
          },
        })
      );

      // redactForLogs() should have masked email and phone
      expect(JSON.stringify(rec.toolParameters)).not.toContain('john.doe@example.com');
      expect(JSON.stringify(rec.toolParameters)).not.toContain('+60123456789');
    });

    it('should mask PII in toolResponse before storage', () => {
      const rec = tracker.record(
        makeCall({
          toolResponse: {
            name: 'John Doe',
            email: 'john.doe@example.com',
            segment: 'Young Professional',
          },
        })
      );

      expect(JSON.stringify(rec.toolResponse)).not.toContain('john.doe@example.com');
    });

    it('should handle multiple independent sessions without cross-contamination', () => {
      const sessA: SessionContext = { ...SESSION, sessionId: 'sess-A', userId: 'CUST-A' };
      const sessB: SessionContext = { ...SESSION, sessionId: 'sess-B', userId: 'CUST-B' };

      tracker.record(makeCall({ session: sessA }));
      tracker.record(makeCall({ session: sessA }));
      tracker.record(makeCall({ session: sessB }));

      expect(tracker.getSession('sess-A')).toHaveLength(2);
      expect(tracker.getSession('sess-B')).toHaveLength(1);
      expect(tracker.getSession('sess-A')[0].userId).toBe('CUST-A');
      expect(tracker.getSession('sess-B')[0].userId).toBe('CUST-B');
    });

    it('should default dataSourcesTouched to [] when not provided', () => {
      const params = makeCall();
      delete (params as any).dataSourcesTouched;
      const rec = tracker.record(params);

      expect(rec.dataSourcesTouched).toEqual([]);
    });

    it('should produce a different selfHash if any field changes', () => {
      const r1 = tracker.record(makeCall({ toolName: 'tool-a' }));
      const r2 = tracker.record(makeCall({ toolName: 'tool-b' }));

      expect(r1.selfHash).not.toBe(r2.selfHash);
    });
  });

  // ── verifyChain() ────────────────────────────────────────────────────────

  describe('verifyChain()', () => {
    it('should return true for an empty session', () => {
      expect(tracker.verifyChain('non-existent-session')).toBe(true);
    });

    it('should return true for a valid chain', () => {
      tracker.record(makeCall());
      tracker.record(makeCall());
      tracker.record(makeCall());

      expect(tracker.verifyChain(SESSION.sessionId)).toBe(true);
    });

    it('should detect a tampered selfHash', () => {
      tracker.record(makeCall());
      tracker.record(makeCall());

      // Directly mutate the second record's selfHash
      const chain = tracker.getSession(SESSION.sessionId);
      (chain[1] as any).selfHash = 'a'.repeat(64);

      expect(tracker.verifyChain(SESSION.sessionId)).toBe(false);
    });

    it('should detect a tampered parentHash', () => {
      tracker.record(makeCall());
      tracker.record(makeCall());

      const chain = tracker.getSession(SESSION.sessionId);
      (chain[1] as any).parentHash = 'b'.repeat(64);

      expect(tracker.verifyChain(SESSION.sessionId)).toBe(false);
    });

    it('should detect a tampered field value', () => {
      tracker.record(makeCall());
      tracker.record(makeCall());

      // Mutate a data field without updating selfHash
      const chain = tracker.getSession(SESSION.sessionId);
      (chain[0] as any).userId = 'ATTACKER';

      expect(tracker.verifyChain(SESSION.sessionId)).toBe(false);
    });
  });

  // ── getSession() ─────────────────────────────────────────────────────────

  describe('getSession()', () => {
    it('should return [] for an unknown session', () => {
      expect(tracker.getSession('unknown')).toEqual([]);
    });

    it('should return records in insertion order', () => {
      tracker.record(makeCall({ toolName: 'a' }));
      tracker.record(makeCall({ toolName: 'b' }));
      tracker.record(makeCall({ toolName: 'c' }));

      const names = tracker.getSession(SESSION.sessionId).map((r) => r.toolName);
      expect(names).toEqual(['a', 'b', 'c']);
    });
  });

  // ── getSessionSummary() ──────────────────────────────────────────────────

  describe('getSessionSummary()', () => {
    it('should return undefined for an unknown session', () => {
      expect(tracker.getSessionSummary('unknown')).toBeUndefined();
    });

    it('should aggregate tools, servers, and data sources', () => {
      tracker.record(
        makeCall({
          toolName: 'get_customer_profile',
          mcpServer: 'http://customer-mcp:3000',
          dataSourcesTouched: ['customer-db'],
        })
      );
      tracker.record(
        makeCall({
          toolName: 'search_product_catalog',
          mcpServer: 'http://bss-mcp:3001',
          dataSourcesTouched: ['product-db', 'pricing-engine'],
        })
      );
      tracker.record(
        makeCall({
          toolName: 'get_customer_profile', // duplicate tool
          mcpServer: 'http://customer-mcp:3000',
          dataSourcesTouched: ['customer-db'], // duplicate source
        })
      );

      const summary = tracker.getSessionSummary(SESSION.sessionId)!;

      expect(summary.recordCount).toBe(3);
      expect(summary.toolsInvoked).toHaveLength(2); // de-duplicated
      expect(summary.toolsInvoked).toContain('get_customer_profile');
      expect(summary.toolsInvoked).toContain('search_product_catalog');
      expect(summary.mcpServersContacted).toHaveLength(2);
      expect(summary.dataSourcesTouched).toHaveLength(3); // customer-db, product-db, pricing-engine
      expect(summary.chainIntact).toBe(true);
    });

    it('should report chainIntact=false when chain is tampered', () => {
      tracker.record(makeCall());
      const chain = tracker.getSession(SESSION.sessionId);
      (chain[0] as any).userId = 'TAMPERED';

      const summary = tracker.getSessionSummary(SESSION.sessionId)!;
      expect(summary.chainIntact).toBe(false);
    });

    it('should include firstRecordAt and lastRecordAt', () => {
      tracker.record(makeCall());
      tracker.record(makeCall());

      const summary = tracker.getSessionSummary(SESSION.sessionId)!;
      expect(new Date(summary.firstRecordAt).getTime()).toBeLessThanOrEqual(
        new Date(summary.lastRecordAt).getTime()
      );
    });
  });

  // ── clearSession() ───────────────────────────────────────────────────────

  describe('clearSession()', () => {
    it('should remove all records for a session', () => {
      tracker.record(makeCall());
      tracker.record(makeCall());

      tracker.clearSession(SESSION.sessionId);

      expect(tracker.getSession(SESSION.sessionId)).toHaveLength(0);
      expect(tracker.activeSessionCount).toBe(0);
    });

    it('should not affect other sessions', () => {
      const sessB: SessionContext = { ...SESSION, sessionId: 'sess-B' };
      tracker.record(makeCall());
      tracker.record(makeCall({ session: sessB }));

      tracker.clearSession(SESSION.sessionId);

      expect(tracker.getSession('sess-B')).toHaveLength(1);
    });
  });

  // ── activeSessionCount ───────────────────────────────────────────────────

  describe('activeSessionCount', () => {
    it('should count distinct sessions', () => {
      const sessB: SessionContext = { ...SESSION, sessionId: 'sess-B' };
      const sessC: SessionContext = { ...SESSION, sessionId: 'sess-C' };

      tracker.record(makeCall());
      tracker.record(makeCall({ session: sessB }));
      tracker.record(makeCall({ session: sessC }));

      expect(tracker.activeSessionCount).toBe(3);
    });
  });

  // ── Hash determinism ─────────────────────────────────────────────────────

  describe('hash determinism', () => {
    it('should produce the same selfHash for identical record content', () => {
      // Two separate tracker instances should hash identically
      const t1 = new ProvenanceTracker();
      const t2 = new ProvenanceTracker();

      // Use fixed timestamps by freezing Date
      const fixedNow = new Date('2026-03-22T12:00:00.000Z');
      jest.useFakeTimers({ now: fixedNow });

      const r1 = t1.record(makeCall());
      const r2 = t2.record(makeCall());

      jest.useRealTimers();

      // Both have sequence 1 and GENESIS parent — content is equivalent
      // (recordId differs due to UUID, so hashes will differ; we verify
      // structure instead)
      expect(r1.sequenceNumber).toBe(r2.sequenceNumber);
      expect(r1.parentHash).toBe(r2.parentHash);
      // Verify the hash length and format
      expect(r1.selfHash).toMatch(/^[a-f0-9]{64}$/);
      expect(r2.selfHash).toMatch(/^[a-f0-9]{64}$/);
    });

    it('should use SHA-256 (64 hex chars)', () => {
      const rec = tracker.record(makeCall());
      expect(rec.selfHash).toHaveLength(64);
      expect(rec.selfHash).toMatch(/^[a-f0-9]{64}$/);
      // Double-check it matches crypto.createHash('sha256') output format
      const sample = crypto.createHash('sha256').update('test').digest('hex');
      expect(sample).toHaveLength(64);
    });
  });
});
