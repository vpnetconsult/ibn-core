/**
 * McpAdapter — RFC 9315 §5.1.3 Orchestration Interface
 *
 * This interface defines the boundary between the public ibn-core framework
 * and operator-specific MCP adapter implementations.
 *
 * The base implementation (MockMcpAdapter) provides simulation for local
 * development. Production operator adapters implementing this interface
 * are delivered as part of Vpnet Cloud Solutions SI engagements.
 *
 * Copyright 2026 Vpnet Cloud Solutions Sdn. Bhd.
 * Licensed under the Apache License, Version 2.0
 */

export interface IntentOrchestrationRequest {
  intentId: string;
  customerId: string;
  translatedIntent: {
    serviceType: string;
    requirements: Record<string, unknown>;
    constraints?: Record<string, unknown>;
  };
  correlationId: string;
}

export interface IntentOrchestrationResult {
  success: boolean;
  orchestrationId: string;
  provisionedResources: Array<{
    resourceType: string;
    resourceId: string;
    status: string;
  }>;
  reportState: 'fulfilled' | 'notFulfillable' | 'inProgress' | 'degraded';
  message?: string;
}

/**
 * McpAdapter — implement this interface for each operator/environment.
 *
 * Production implementations:
 * - CamaraUMobileMcpAdapter   (U Mobile Malaysia CAMARA sandbox)
 * - CamaraTMMcpAdapter         (Telekom Malaysia CAMARA sandbox)
 * - MockMcpAdapter              (local development, included in ibn-core)
 */
export interface McpAdapter {
  readonly adapterName: string;
  readonly camaraEndpoint: string;

  /**
   * RFC 9315 §5.1.3 — Orchestration
   * Submit translated intent to network for fulfilment
   */
  orchestrate(request: IntentOrchestrationRequest): Promise<IntentOrchestrationResult>;

  /**
   * RFC 9315 §5.2.1 — Monitoring
   * Check current fulfilment state of an active intent
   */
  getIntentStatus(intentId: string): Promise<{
    reportState: string;
    metrics: Record<string, number>;
  }>;

  /**
   * RFC 9315 §4 P5 — Capability Exposure
   * Return available network capabilities this adapter can fulfil
   */
  getCapabilities(): Promise<Array<{
    capabilityId: string;
    name: string;
    camaraApi: string;
    parameters: Record<string, unknown>;
  }>>;

  /**
   * RFC 9315 §5.2.3 — Compliance Actions
   * Withdraw/cancel a previously submitted intent
   */
  cancelIntent(intentId: string): Promise<{ success: boolean }>;
}

/**
 * MockMcpAdapter — included in ibn-core for local development.
 * Simulates operator responses without real CAMARA credentials.
 */
export class MockMcpAdapter implements McpAdapter {
  readonly adapterName = 'MockMcpAdapter';
  readonly camaraEndpoint = 'http://localhost:9000/mock';

  async orchestrate(request: IntentOrchestrationRequest): Promise<IntentOrchestrationResult> {
    return {
      success: true,
      orchestrationId: `mock-orch-${Date.now()}`,
      provisionedResources: [{
        resourceType: 'broadband.service',
        resourceId: `mock-res-${request.intentId}`,
        status: 'active'
      }],
      reportState: 'fulfilled',
      message: 'Mock orchestration successful — replace with operator McpAdapter'
    };
  }

  async getIntentStatus(intentId: string) {
    return {
      reportState: 'fulfilled',
      metrics: { latencyMs: 0, throughputMbps: 100 }
    };
  }

  async getCapabilities() {
    return [{
      capabilityId: 'camara.qod.v0',
      name: 'Quality on Demand (Mock)',
      camaraApi: 'CAMARA QoD API v0.10',
      parameters: { maxLatencyMs: 50, profiles: ['QOS_E', 'QOS_S', 'QOS_M', 'QOS_L'] }
    }];
  }

  async cancelIntent(intentId: string) {
    return { success: true };
  }
}
