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
