/**
 * Copyright 2026 Vpnet Cloud Solutions Sdn. Bhd.
 * Licensed under the Apache License, Version 2.0
 * See LICENSE in the project root for license information.
 *
 * Implements RFC 9315 Intent-Based Networking
 * https://www.rfc-editor.org/rfc/rfc9315
 */

import { v4 as uuidv4 } from 'uuid';
import { ClaudeClient } from './claude-client';
import { MCPClient } from './mcp-client';
import { logger } from './logger';
import { IntentHandlingCycleRunner } from './imf/IntentHandlingCycleRunner';

/**
 * IntentProcessor — public API for intent processing within ibn-core.
 *
 * Executes the RFC 9315 §5 intent handling cycle via IntentHandlingCycleRunner
 * and maps the result back to the shape expected by:
 *   - The legacy POST /api/v1/intent route (index.ts)
 *   - TMF921IntentService.processIntentAsync (tmf921/intent-service.ts)
 *
 * The public interface (process signature and return shape) is intentionally
 * stable; callers do not need to know about the cycle internals.
 * The additive `handlingTrace` field carries RFC 9315 §5 observability data.
 */
export class IntentProcessor {
  private readonly cycleRunner: IntentHandlingCycleRunner;

  constructor(
    private readonly claude: ClaudeClient,
    private readonly mcpClients: {
      bss: MCPClient;
      knowledgeGraph: MCPClient;
      customerData: MCPClient;
    },
  ) {
    this.cycleRunner = new IntentHandlingCycleRunner(claude, mcpClients);
  }

  /**
   * Process a natural-language intent for the given customer.
   *
   * @param customerId  Opaque customer reference (not a PII value in logs)
   * @param intent      Sanitized natural-language intent expression
   * @param context     Optional caller context; intentId is used as
   *                    the correlation ID when present
   * @returns           Processing result including offer, quote, and the
   *                    RFC 9315 §5 handling trace
   */
  async process(customerId: string, intent: string, context?: { sessionId?: string; userId?: string; apiKeyName?: string; intentId?: string; correlationId?: string; [key: string]: unknown }): Promise<any> {
    const intentId: string = (context?.intentId as string | undefined) ?? uuidv4();
    const startTime = Date.now();

    try {
      const result = await this.cycleRunner.run(intentId, customerId, intent);
      const ctx = result.context;
      const processingTime = Date.now() - startTime;

      return {
        intent_analysis:    ctx.intentAnalysis,
        // rawCustomerProfile is returned here for the response-filter middleware,
        // which redacts fields based on the caller's role before the value is
        // sent to the client. The cycle uses only the PII-masked customerProfile
        // for all AI processing.
        customer_profile:   ctx.rawCustomerProfile,
        recommended_offer:  ctx.selectedOffer,
        quote:              ctx.quote,
        processing_time_ms: processingTime,
        // Additive: RFC 9315 §5 handling trajectory for observability.
        // Not part of the core TMF921 Intent resource shape.
        handlingTrace:      result.handlingTrace,
      };
    } catch (error: any) {
      logger.error({ error: error.message, customerId }, 'Intent processing failed');
      throw error;
    }
  }
}
