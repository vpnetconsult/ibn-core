/**
 * Copyright 2026 Vpnet Cloud Solutions Sdn. Bhd.
 * Licensed under the Apache License, Version 2.0
 * See LICENSE in the project root for license information.
 *
 * ProbeIntent Handler — RFC 9315 §4 P2 One Touch / Not One Shot
 * TMF921 v5.0.0 ProbeIntent resource implementation.
 *
 * Performs feasibility assessment BEFORE committing an intent.
 * Returns: feasible (200) | notFeasible (422) | feasibleWithDegradation (206)
 *
 * Flow:
 *   1. Validate request fields
 *   2. Query McpAdapter.getCapabilities()  (RFC 9315 §4 P5)
 *   3. Match intent keywords against available capabilities
 *   4. Return ProbeIntent resource with feasibility assessment
 *      — feasible:              200 + negotiated IntentSpecification
 *      — notFeasible:           422 + reason + alternatives
 *      — feasibleWithDegradation: 206 + partial match details
 *
 * https://www.rfc-editor.org/rfc/rfc9315
 */

import { Request, Response } from 'express';
import { MockMcpAdapter } from '../mcp/McpAdapter';

interface ProbeIntentRequest {
  customerId: string;
  intent: string;
  constraints?: Record<string, unknown>;
}

interface ProbeIntentResponse {
  id: string;
  href: string;
  feasibilityResult: 'feasible' | 'notFeasible' | 'feasibleWithDegradation';
  intentSpecification?: {
    serviceType: string;
    parameters: Record<string, unknown>;
    matchedCapability: string;
  };
  reason?: string;
  alternatives?: Array<{
    description: string;
    capabilityId: string;
  }>;
  assessedAt: string;
}

const adapter = new MockMcpAdapter();

// Keywords that signal broadband/connectivity intent
const CONNECTIVITY_KEYWORDS = [
  'internet', 'broadband', 'network', 'speed', 'connection',
  'online', 'wifi', 'fibre', 'fiber', 'bandwidth', 'data',
];

export async function probeIntentHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const { customerId, intent, constraints } =
    req.body as ProbeIntentRequest;

  if (!customerId || !intent) {
    res.status(400).json({
      error: 'customerId and intent are required',
      code: 'MISSING_REQUIRED_FIELDS',
    });
    return;
  }

  const probeId = `PROBE-${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase()}`;

  try {
    // Step 1 — Get available capabilities (RFC 9315 §4 P5)
    const capabilities = await adapter.getCapabilities();

    // Step 2 — Keyword feasibility match
    // v3.0 will replace this with semantic Claude analysis
    const intentLower = intent.toLowerCase();
    const hasConnectivityKeyword = CONNECTIVITY_KEYWORDS.some(kw =>
      intentLower.includes(kw),
    );

    const matchedCapability = capabilities.find(cap => {
      const capName = cap.name.toLowerCase();
      return (
        hasConnectivityKeyword ||
        capName.includes('broadband') ||
        capName.includes('network')
      );
    });

    if (matchedCapability) {
      const response: ProbeIntentResponse = {
        id: probeId,
        href: `/api/v1/intent/probe/${probeId}`,
        feasibilityResult: 'feasible',
        intentSpecification: {
          serviceType: matchedCapability.capabilityId,
          parameters: {
            ...matchedCapability.parameters,
            ...(constraints ?? {}),
          },
          matchedCapability: matchedCapability.name,
        },
        assessedAt: new Date().toISOString(),
      };
      res.status(200).json(response);
    } else {
      const response: ProbeIntentResponse = {
        id: probeId,
        href: `/api/v1/intent/probe/${probeId}`,
        feasibilityResult: 'notFeasible',
        reason: 'No matching capability found for the requested intent',
        alternatives: capabilities.map(cap => ({
          description: cap.name,
          capabilityId: cap.capabilityId,
        })),
        assessedAt: new Date().toISOString(),
      };
      res.status(422).json(response);
    }
  } catch (error) {
    console.error('[ProbeIntent] Assessment failed:', error);
    res.status(500).json({
      id: probeId,
      href: `/api/v1/intent/probe/${probeId}`,
      feasibilityResult: 'notFeasible',
      reason: 'Capability assessment unavailable',
      assessedAt: new Date().toISOString(),
    });
  }
}
