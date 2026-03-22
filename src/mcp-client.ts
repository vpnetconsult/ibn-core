/**
 * Copyright 2026 Vpnet Cloud Solutions Sdn. Bhd.
 * Licensed under the Apache License, Version 2.0
 * See LICENSE in the project root for license information.
 *
 * Implements RFC 9315 Intent-Based Networking
 * https://www.rfc-editor.org/rfc/rfc9315
 */

import axios, { AxiosInstance } from 'axios';
import { logger } from './logger';
import { provenanceTracker } from './provenance/ProvenanceTracker';
import { SessionContext } from './provenance/types';
import { scanMcpResponse } from './mcp-response-filter';
import { toolPolicyEngine } from './policy/ToolPolicyEngine';

export class MCPClient {
  private client: AxiosInstance;
  private baseURL: string;
  private apiKey: string;

  constructor(baseURL: string, apiKey?: string) {
    this.baseURL = baseURL;
    this.apiKey = apiKey || process.env.MCP_API_KEY_BUSINESS_INTENT || '';

    if (!this.apiKey) {
      logger.warn({ baseURL }, 'MCP Client initialized without API key');
    }

    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
      },
    });
  }

  async call(tool: string, params: any, session?: SessionContext, agentReasoning?: string): Promise<any> {
    const startTime = Date.now();
    let responseStatus: 'success' | 'error' | 'timeout' = 'success';
    let response: any;

    // RBAC check — paper §4.1/§4.5: deny-by-default tool-level authorisation.
    if (session?.apiKeyName) {
      const policy = toolPolicyEngine.checkAccess(session.apiKeyName, tool);
      if (!policy.permitted) {
        const rbacError = new Error(
          `RBAC denied: ${policy.reason ?? `tool '${tool}' not permitted for role '${policy.role}'`}`
        );
        if (session) {
          provenanceTracker.record({
            session,
            toolName: tool,
            mcpServer: this.baseURL,
            toolParameters: params ?? {},
            toolResponse: { denied: true, role: policy.role, reason: policy.reason },
            responseStatus: 'error',
            durationMs: Date.now() - startTime,
            agentReasoning,
          });
        }
        throw rbacError;
      }
    }

    try {
      const axiosResponse = await this.client.post('/mcp/tools/call', {
        tool,
        params,
      });
      response = axiosResponse.data;
    } catch (error: any) {
      responseStatus = error.code === 'ECONNABORTED' ? 'timeout' : 'error';
      logger.error({ tool, error: error.message }, 'MCP call failed');

      if (session) {
        provenanceTracker.record({
          session,
          toolName: tool,
          mcpServer: this.baseURL,
          toolParameters: params ?? {},
          toolResponse: { error: error.message },
          responseStatus,
          durationMs: Date.now() - startTime,
          agentReasoning,
        });
      }

      throw error;
    }

    // Scan the response for injected instructions before forwarding to the LLM.
    // Paper §3.2/§4.3 — indirect prompt injection via MCP tool responses.
    const scanResult = scanMcpResponse(tool, this.baseURL, response);
    if (scanResult.blocked) {
      const injectionError = new Error(
        `MCP response injection blocked: tool=${tool} server=${this.baseURL} patterns=${scanResult.patterns.join('; ')}`
      );
      if (session) {
        provenanceTracker.record({
          session,
          toolName: tool,
          mcpServer: this.baseURL,
          toolParameters: params ?? {},
          toolResponse: { blocked: true, patterns: scanResult.patterns },
          responseStatus: 'error',
          durationMs: Date.now() - startTime,
          agentReasoning,
        });
      }
      throw injectionError;
    }

    if (session) {
      provenanceTracker.record({
        session,
        toolName: tool,
        mcpServer: this.baseURL,
        toolParameters: params ?? {},
        toolResponse: response ?? {},
        responseStatus,
        durationMs: Date.now() - startTime,
        agentReasoning,
      });
    }

    return response;
  }

  async ping(): Promise<boolean> {
    try {
      const response = await this.client.get('/health');
      return response.status === 200;
    } catch {
      return false;
    }
  }
}
