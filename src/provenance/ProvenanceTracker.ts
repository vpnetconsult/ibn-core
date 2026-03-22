/**
 * Copyright 2026 Vpnet Cloud Solutions Sdn. Bhd.
 * Licensed under the Apache License, Version 2.0
 * See LICENSE in the project root for license information.
 *
 * Implements RFC 9315 Intent-Based Networking
 * https://www.rfc-editor.org/rfc/rfc9315
 */

/**
 * End-to-end provenance tracking for MCP agent sessions.
 *
 * Implements the provenance controls from:
 * Errico, Ngiam & Sojan, "Securing the Model Context Protocol (MCP):
 * Risks, Controls, and Governance", arXiv 2511.20920, §4.2.
 *
 * Design:
 * - Hash-chained records: each record includes SHA-256(previous record),
 *   forming an append-only tamper-evident log.
 * - In-memory hot store with configurable capacity per session.
 * - PII fields in parameters/responses are masked before storage using
 *   the existing pii-masking module.
 * - Exposes getSessionSummary() for SIEM integration and verifyChain()
 *   for integrity checks.
 */

import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../logger';
import { redactForLogs } from '../pii-masking';
import {
  ProvenanceRecord,
  RecordToolCallParams,
  SessionSummary,
} from './types';

/** Sentinel value used as parentHash for the first record in a session */
const GENESIS_HASH = 'GENESIS';

/** Maximum records kept in memory per session (oldest evicted beyond this) */
const MAX_RECORDS_PER_SESSION = 1000;

export class ProvenanceTracker {
  /** sessionId → ordered list of records */
  private readonly sessions = new Map<string, ProvenanceRecord[]>();

  /**
   * Record one MCP tool invocation.
   *
   * The record is appended to the session's chain. PII in parameters and
   * responses is masked before storage via redactForLogs().
   *
   * @returns The completed and hash-signed ProvenanceRecord.
   */
  record(params: RecordToolCallParams): ProvenanceRecord {
    const {
      session,
      toolName,
      mcpServer,
      toolParameters,
      toolResponse,
      responseStatus,
      durationMs,
      dataSourcesTouched = [],
      agentReasoning,
    } = params;

    const chain = this.getOrCreateChain(session.sessionId);
    const sequenceNumber = chain.length + 1;
    const parentHash =
      chain.length === 0 ? GENESIS_HASH : chain[chain.length - 1].selfHash;

    const recordId = uuidv4();
    const timestamp = new Date().toISOString();

    // Mask PII before persisting — parameters and responses may contain
    // customer data (names, emails, account numbers).
    const maskedParameters = redactForLogs(toolParameters) as Record<string, unknown>;
    const maskedResponse = redactForLogs(toolResponse) as Record<string, unknown>;

    // Build the record without selfHash so we can hash it deterministically.
    const recordWithoutSelfHash: Omit<ProvenanceRecord, 'selfHash'> = {
      recordId,
      sessionId: session.sessionId,
      sequenceNumber,
      parentHash,
      userId: session.userId,
      apiKeyName: session.apiKeyName,
      timestamp,
      intentId: session.intentId,
      correlationId: session.correlationId,
      agentReasoning,
      toolName,
      mcpServer,
      toolParameters: maskedParameters,
      toolResponse: maskedResponse,
      responseStatus,
      durationMs,
      dataSourcesTouched,
    };

    const selfHash = this.hashRecord(recordWithoutSelfHash);
    const record: ProvenanceRecord = { ...recordWithoutSelfHash, selfHash };

    // Append and evict oldest if over capacity.
    chain.push(record);
    if (chain.length > MAX_RECORDS_PER_SESSION) {
      chain.shift();
    }

    logger.info(
      {
        sessionId: session.sessionId,
        recordId,
        sequenceNumber,
        toolName,
        mcpServer,
        responseStatus,
        durationMs,
        selfHash: selfHash.substring(0, 12) + '…',
      },
      'Provenance record appended'
    );

    return record;
  }

  /**
   * Return all records for a session (oldest first).
   */
  getSession(sessionId: string): ProvenanceRecord[] {
    return this.sessions.get(sessionId) ?? [];
  }

  /**
   * Return a SIEM-ready summary of agent activity within a session.
   *
   * Includes de-duplicated lists of tools, servers, and data sources
   * accessed, plus a chain integrity flag.
   */
  getSessionSummary(sessionId: string): SessionSummary | undefined {
    const chain = this.sessions.get(sessionId);
    if (!chain || chain.length === 0) return undefined;

    const first = chain[0];
    const last = chain[chain.length - 1];

    return {
      sessionId,
      userId: first.userId,
      recordCount: chain.length,
      firstRecordAt: first.timestamp,
      lastRecordAt: last.timestamp,
      toolsInvoked: [...new Set(chain.map((r) => r.toolName))],
      mcpServersContacted: [...new Set(chain.map((r) => r.mcpServer))],
      dataSourcesTouched: [...new Set(chain.flatMap((r) => r.dataSourcesTouched))],
      chainIntact: this.verifyChain(sessionId),
    };
  }

  /**
   * Verify the hash chain for a session.
   *
   * Walks every record and checks:
   * 1. parentHash matches selfHash of the previous record (or GENESIS).
   * 2. selfHash matches SHA-256 of the record's canonical content.
   *
   * @returns true if the chain is intact, false if any record is tampered.
   */
  verifyChain(sessionId: string): boolean {
    const chain = this.sessions.get(sessionId);
    if (!chain || chain.length === 0) return true;

    for (let i = 0; i < chain.length; i++) {
      const record = chain[i];

      // Verify parentHash linkage.
      const expectedParent = i === 0 ? GENESIS_HASH : chain[i - 1].selfHash;
      if (record.parentHash !== expectedParent) {
        logger.warn(
          { sessionId, sequenceNumber: record.sequenceNumber, recordId: record.recordId },
          'Provenance chain integrity failure: parentHash mismatch'
        );
        return false;
      }

      // Verify selfHash.
      const { selfHash, ...rest } = record;
      const recomputed = this.hashRecord(rest);
      if (selfHash !== recomputed) {
        logger.warn(
          { sessionId, sequenceNumber: record.sequenceNumber, recordId: record.recordId },
          'Provenance chain integrity failure: selfHash mismatch'
        );
        return false;
      }
    }

    return true;
  }

  /**
   * Remove all records for a session (e.g. after export to cold storage).
   */
  clearSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  /** Number of active sessions in the hot store. */
  get activeSessionCount(): number {
    return this.sessions.size;
  }

  // ── Private ──────────────────────────────────────────────────────────────

  private getOrCreateChain(sessionId: string): ProvenanceRecord[] {
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, []);
    }
    return this.sessions.get(sessionId)!;
  }

  /**
   * Deterministic SHA-256 of a record's content (excluding selfHash).
   * Keys are sorted before serialisation to ensure canonical JSON.
   */
  private hashRecord(record: Omit<ProvenanceRecord, 'selfHash'>): string {
    const canonical = JSON.stringify(record, Object.keys(record).sort());
    return crypto.createHash('sha256').update(canonical, 'utf8').digest('hex');
  }
}

/** Module-level singleton — one tracker shared across the process. */
export const provenanceTracker = new ProvenanceTracker();
