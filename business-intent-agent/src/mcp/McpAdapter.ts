/**
 * Copyright 2026 Vpnet Cloud Solutions Sdn. Bhd.
 * Licensed under the Apache License, Version 2.0
 *
 * See LICENSE in the project root for license information.
 *
 * Implements RFC 9315 Intent-Based Networking
 * https://www.rfc-editor.org/rfc/rfc9315
 */

/**
 * MCP Adapter Interface — RFC 9315 §5.1.3 Orchestration Boundary
 *
 * Defines the contract between the Intent Engine and MCP (Model Context
 * Protocol) servers. Each adapter translates intent expectations into
 * domain-specific MCP tool calls and aggregates responses back into
 * intent reports.
 *
 * Implementations are operator-specific and delivered via SI engagements
 * (not part of the open core).
 */

import type { Intent, IntentExpectation, IntentReport } from '../tmf921/types';

/**
 * MCP server connection configuration
 */
export interface McpServerConfig {
  /** MCP server endpoint URL */
  url: string;
  /** Server identifier (e.g., 'bss-oss', 'customer-data', 'knowledge-graph') */
  serverId: string;
  /** Connection timeout in milliseconds */
  timeoutMs?: number;
  /** Optional authentication token */
  authToken?: string;
  /** TLS configuration */
  tls?: {
    enabled: boolean;
    certPath?: string;
    keyPath?: string;
    caPath?: string;
  };
}

/**
 * MCP tool invocation request
 */
export interface McpToolRequest {
  /** Tool name as registered on the MCP server */
  toolName: string;
  /** Tool input parameters */
  parameters: Record<string, unknown>;
  /** Correlation ID for tracing (maps to intent ID) */
  correlationId: string;
  /** Optional timeout override */
  timeoutMs?: number;
}

/**
 * MCP tool invocation response
 */
export interface McpToolResponse {
  /** Whether the tool call succeeded */
  success: boolean;
  /** Tool output data */
  data?: Record<string, unknown>;
  /** Error details if success is false */
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  /** Execution duration in milliseconds */
  durationMs: number;
  /** Server that handled the request */
  serverId: string;
}

/**
 * Intent fulfilment result from an MCP adapter
 */
export interface FulfilmentResult {
  /** The intent ID being fulfilled */
  intentId: string;
  /** Overall fulfilment status */
  status: 'fulfilled' | 'partial' | 'failed' | 'pending';
  /** Individual tool call results */
  toolResponses: McpToolResponse[];
  /** Generated intent report entries */
  report?: IntentReport;
  /** Timestamp of fulfilment attempt */
  timestamp: string;
}

/**
 * McpAdapter — Orchestration boundary interface (RFC 9315 §5.1.3)
 *
 * Adapters bridge the gap between abstract intent expectations and
 * concrete MCP tool invocations. The intent engine delegates fulfilment
 * to one or more adapters based on expectation type.
 */
export interface McpAdapter {
  /** Unique adapter identifier */
  readonly adapterId: string;

  /** MCP server configuration for this adapter */
  readonly serverConfig: McpServerConfig;

  /**
   * Initialise the adapter and verify MCP server connectivity.
   * @throws if the MCP server is unreachable
   */
  connect(): Promise<void>;

  /**
   * Gracefully disconnect from the MCP server.
   */
  disconnect(): Promise<void>;

  /**
   * Check whether this adapter can fulfil the given expectation.
   * Used by the orchestrator to route expectations to the correct adapter.
   */
  canFulfil(expectation: IntentExpectation): boolean;

  /**
   * Translate an intent into MCP tool calls and execute them.
   * Returns a fulfilment result with tool responses and report entries.
   */
  fulfil(intent: Intent): Promise<FulfilmentResult>;

  /**
   * Invoke a specific MCP tool directly.
   * Lower-level API for fine-grained orchestration.
   */
  callTool(request: McpToolRequest): Promise<McpToolResponse>;

  /**
   * List available tools on the connected MCP server.
   */
  listTools(): Promise<string[]>;

  /**
   * Health check for the underlying MCP server.
   */
  healthCheck(): Promise<{ healthy: boolean; latencyMs: number }>;
}
