/**
 * Copyright 2026 Vpnet Cloud Solutions Sdn. Bhd.
 * Licensed under the Apache License, Version 2.0
 * See LICENSE in the project root for license information.
 *
 * Implements RFC 9315 Intent-Based Networking
 * https://www.rfc-editor.org/rfc/rfc9315
 */

/**
 * Provenance tracking types for MCP agent security.
 *
 * Schema defined per: Errico, Ngiam & Sojan, "Securing the Model Context
 * Protocol (MCP): Risks, Controls, and Governance", arXiv 2511.20920 §4.2.
 *
 * Each ProvenanceRecord captures a single MCP tool invocation with:
 * - user identity and session context
 * - cryptographic hash chain for tamper-evidence
 * - sanitized tool parameters and responses (PII-masked)
 * - data lineage (which sources were touched)
 */

export interface ProvenanceRecord {
  /** Unique record identifier (UUID v4) */
  recordId: string;

  /** Groups all records belonging to one agent session */
  sessionId: string;

  /** Monotonically increasing within a session (1-based) */
  sequenceNumber: number;

  /** SHA-256 of the previous record's selfHash; 'GENESIS' for sequence 1 */
  parentHash: string;

  /** SHA-256 of this record's canonical JSON (excluding selfHash field) */
  selfHash: string;

  // ── User context ──────────────────────────────────────────────────────────

  /** Authenticated customer/user ID */
  userId: string;

  /** Human-readable API key name (never the key value) */
  apiKeyName: string;

  // ── Temporal context ──────────────────────────────────────────────────────

  /** ISO 8601 timestamp with millisecond precision */
  timestamp: string;

  // ── Agent reasoning ───────────────────────────────────────────────────────

  /** TMF921 Intent ID, if this call is part of intent processing */
  intentId?: string;

  /** Correlation ID linking to upstream request */
  correlationId?: string;

  /** Why the agent decided to invoke this tool (from orchestration context) */
  agentReasoning?: string;

  // ── Tool invocation ───────────────────────────────────────────────────────

  /** MCP tool name (e.g. "get_customer_profile", "search_product_catalog") */
  toolName: string;

  /** MCP server base URL (identity of the server being called) */
  mcpServer: string;

  /** Tool parameters with PII fields masked before storage */
  toolParameters: Record<string, unknown>;

  // ── Tool response ─────────────────────────────────────────────────────────

  /** Tool response with PII fields masked before storage */
  toolResponse: Record<string, unknown>;

  /** Whether the tool call succeeded */
  responseStatus: 'success' | 'error' | 'timeout';

  /** Wall-clock duration of the tool call in milliseconds */
  durationMs: number;

  // ── Data lineage ──────────────────────────────────────────────────────────

  /**
   * Logical names of data sources accessed during this call.
   * Used for SIEM correlation and compliance reporting.
   */
  dataSourcesTouched: string[];
}

/** Context supplied once at the start of an agent session */
export interface SessionContext {
  sessionId: string;
  userId: string;
  apiKeyName: string;
  intentId?: string;
  correlationId?: string;
}

/** Parameters for recording a single MCP tool invocation */
export interface RecordToolCallParams {
  session: SessionContext;
  toolName: string;
  mcpServer: string;
  toolParameters: Record<string, unknown>;
  toolResponse: Record<string, unknown>;
  responseStatus: 'success' | 'error' | 'timeout';
  durationMs: number;
  dataSourcesTouched?: string[];
  agentReasoning?: string;
}

/** Summary returned from getSessionSummary */
export interface SessionSummary {
  sessionId: string;
  userId: string;
  recordCount: number;
  firstRecordAt: string;
  lastRecordAt: string;
  toolsInvoked: string[];
  mcpServersContacted: string[];
  dataSourcesTouched: string[];
  chainIntact: boolean;
}
