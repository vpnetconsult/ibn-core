/**
 * Copyright 2026 Vpnet Cloud Solutions Sdn. Bhd.
 * Licensed under the Apache License, Version 2.0
 * See LICENSE in the project root for license information.
 *
 * Implements RFC 9315 Intent-Based Networking
 * https://www.rfc-editor.org/rfc/rfc9315
 *
 * BSS intent-handling runner — now a thin instantiation of the layer-agnostic
 * RFC 9315 core (Project 005, ARC-005-ROAD Phase 1). The phase BODIES live in
 * BssPhaseStrategy; the phase SEQUENCE / §5.2.3 loop / trace live in the
 * domain-neutral IntentCycleRunner. Public API is unchanged — this class
 * remains the BSS entrypoint and the reuse-surface export, preserving TMF921
 * CTK behaviour (Gate B re-verifies on the CTK harness).
 */

import type { IntentLlm } from '../llm/IntentLlm';
import { MCPClient } from '../mcp-client';
import { logger } from '../logger';
import { IntentHandlingStep } from './IntentHandlingCycle';
import { IntentHandlingContext } from './IntentHandlingContext';
import { SessionContext } from '../provenance/types';
import { IntentCycleRunner } from './core/IntentCycleRunner';
import { BssPhaseStrategy, BssMcpClients } from './BssPhaseStrategy';

/**
 * Service identity used for the autonomous IMF cycle's own MCP calls when no
 * authenticated caller session is supplied. See BssPhaseStrategy for how it is
 * threaded into MCP calls. RFC 9315 §5.1.3 · ToolPolicyEngine paper §4.1/§4.5.
 */
export const CYCLE_SERVICE_IDENTITY = 'ibn-core-agent';

/**
 * Optional runtime context the caller can supply to `run()`. Maps 1:1 onto
 * SessionContext fields; missing fields fall back to defaults derived from the
 * cycle identity (customerId, intentId). See issue #40.
 */
export interface IntentHandlingRuntimeContext {
  sessionId?: string;
  userId?: string;
  apiKeyName?: string;
  correlationId?: string;
}

export interface IntentHandlingResult {
  /** Fully-enriched context after the cycle completes */
  context: IntentHandlingContext;
  /** Ordered trace of every phase executed (RFC 9315 §5.2.1 monitoring). */
  handlingTrace: IntentHandlingStep[];
  /** Final report state — convenience accessor into context.reportState */
  reportState: string;
}

/**
 * IntentHandlingCycleRunner executes the six-phase RFC 9315 §5 intent handling
 * cycle for the business domain by composing the layer-agnostic core with the
 * BSS PhaseStrategy.
 *
 *   INGESTING → TRANSLATING → ORCHESTRATING → MONITORING → ASSESSING
 *                                  ↑                              |
 *                                  └─── ACTING (if not fulfilled) ┘
 */
export class IntentHandlingCycleRunner {
  constructor(
    private readonly claude: IntentLlm,
    private readonly mcpClients: BssMcpClients,
    private readonly maxRetries: number = 1,
  ) {}

  async run(
    intentId: string,
    customerId: string,
    intentText: string,
    runtimeContext?: IntentHandlingRuntimeContext,
  ): Promise<IntentHandlingResult> {
    const initial: IntentHandlingContext = {
      intentId,
      customerId,
      intentText,
      startedAt: new Date().toISOString(),
      retriesRemaining: this.maxRetries,
    };

    // SessionContext threaded into every MCP call for provenance / tool-policy.
    // Defaults derive from cycle identity for internal/system invocations.
    const session: SessionContext = {
      sessionId: runtimeContext?.sessionId ?? `intent-${intentId}`,
      userId: runtimeContext?.userId ?? customerId,
      apiKeyName: runtimeContext?.apiKeyName ?? CYCLE_SERVICE_IDENTITY,
      intentId,
      correlationId: runtimeContext?.correlationId,
    };

    const strategy = new BssPhaseStrategy(this.claude, this.mcpClients, session);
    const core = new IntentCycleRunner<IntentHandlingContext>(strategy, { log: logger });

    const { state, trace } = await core.run(initial);

    return {
      context: state,
      handlingTrace: trace,
      reportState: state.reportState ?? 'inProgress',
    };
  }
}
