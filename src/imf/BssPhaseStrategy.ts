/**
 * Copyright 2026 Vpnet Cloud Solutions Sdn. Bhd.
 * Licensed under the Apache License, Version 2.0
 * See LICENSE in the project root for license information.
 *
 * Implements RFC 9315 Intent-Based Networking
 * https://www.rfc-editor.org/rfc/rfc9315
 *
 * BSS (business-intent) adapter set over the layer-agnostic RFC 9315 core.
 *
 * This is the FIRST PhaseStrategy adapter (ARC-005-ROAD Phase 1, "BSS as the
 * first adapter set"). The phase bodies below are moved verbatim from the
 * pre-extraction IntentHandlingCycleRunner so behaviour — and TMF921 CTK
 * conformance — is preserved. This adapter is the business-agent's; it stays
 * PUBLIC open-core (TMF921 is an open TM Forum standard, not owned IP).
 */

import { ClaudeClient } from '../claude-client';
import { MCPClient } from '../mcp-client';
import { logger } from '../logger';
import { maskCustomerProfile, validateNoRawPII, redactForLogs } from '../pii-masking';
import {
  IntentAnalysis,
  CustomerProfile,
  SelectedOffer,
  IntentHandlingContext,
} from './IntentHandlingContext';
import { SessionContext } from '../provenance/types';
import { PhaseStrategy } from './core/PhaseStrategy';

export interface BssMcpClients {
  bss: MCPClient;
  knowledgeGraph: MCPClient;
  customerData: MCPClient;
}

/**
 * BSS PhaseStrategy — implements the RFC 9315 §5 ports for the business domain.
 * Constructed per cycle run with the SessionContext so provenance / tool-policy
 * attribution is threaded into MCP calls exactly as before.
 */
export class BssPhaseStrategy implements PhaseStrategy<IntentHandlingContext> {
  constructor(
    private readonly claude: ClaudeClient,
    private readonly mcpClients: BssMcpClients,
    private readonly session: SessionContext,
  ) {}

  /** RFC 9315 §5.1.1 — INGESTING */
  async ingest(ctx: IntentHandlingContext): Promise<IntentHandlingContext> {
    logger.info(
      { customerId: ctx.customerId },
      'RFC 9315 §5.1.1 — ingesting intent, fetching requester context',
    );

    const rawProfile = await this.mcpClients.customerData.call(
      'get_customer_profile',
      { customer_id: ctx.customerId },
      this.session,
      'RFC 9315 §5.1.1 INGESTING — fetch requester profile for PII masking',
    );

    const maskedProfile = maskCustomerProfile(rawProfile);
    const validation = validateNoRawPII(maskedProfile);

    if (!validation.valid) {
      logger.error(
        { violations: validation.violations },
        'PII validation failed during INGESTING phase',
      );
      throw new Error(`PII validation failed: ${validation.violations.join(', ')}`);
    }

    logger.debug(
      { originalProfile: redactForLogs(rawProfile), maskedProfile },
      'Requester profile masked for intent handling cycle',
    );

    return { ...ctx, customerProfile: maskedProfile, rawCustomerProfile: rawProfile };
  }

  /** RFC 9315 §5.1.2 — TRANSLATING */
  async translate(ctx: IntentHandlingContext): Promise<IntentHandlingContext> {
    logger.info(
      { intentText: ctx.intentText },
      'RFC 9315 §5.1.2 — translating intent expression',
    );

    const intentAnalysis = await this.claude.analyzeIntent(
      ctx.intentText,
      ctx.customerProfile,
    );

    return { ...ctx, intentAnalysis };
  }

  /** RFC 9315 §5.1.3 — ORCHESTRATING */
  async orchestrate(ctx: IntentHandlingContext): Promise<IntentHandlingContext> {
    const analysis: IntentAnalysis = ctx.intentAnalysis ?? {};
    const profile: CustomerProfile = ctx.customerProfile ?? {};

    logger.info(
      { tags: analysis.tags },
      'RFC 9315 §5.1.3 — orchestrating: searching product catalog',
    );

    const availableProducts = await this.mcpClients.bss.call(
      'search_product_catalog',
      { intent: analysis.tags, customer_segment: profile.segment },
      this.session,
      'RFC 9315 §5.1.3 ORCHESTRATING — search BSS catalog by intent tags + segment',
    );

    logger.info(
      { productTypes: analysis.product_types },
      'RFC 9315 §5.1.3 — orchestrating: resolving bundles',
    );

    const availableBundles = await this.mcpClients.knowledgeGraph.call(
      'find_related_products',
      { base_products: analysis.product_types },
      this.session,
      'RFC 9315 §5.1.3 ORCHESTRATING — knowledge-graph: resolve bundles for product types',
    );

    logger.info('RFC 9315 §5.1.3 — orchestrating: generating fulfilment offer');

    const selectedOffer: SelectedOffer = await this.claude.generateOffer({
      intent: analysis,
      customer: profile,
      products: availableProducts,
      bundles: availableBundles,
    });

    logger.info(
      { products: selectedOffer.selected_products },
      'RFC 9315 §5.1.3 — orchestrating: generating quote',
    );

    const quote = await this.mcpClients.bss.call(
      'generate_quote',
      {
        customer_id: ctx.customerId,
        products: selectedOffer.selected_products,
        discounts: selectedOffer.recommended_discounts,
      },
      this.session,
      'RFC 9315 §5.1.3 ORCHESTRATING — BSS: generate quote for selected products',
    );

    return { ...ctx, availableProducts, availableBundles, selectedOffer, quote };
  }

  /** RFC 9315 §5.2.1 — MONITORING */
  async monitor(ctx: IntentHandlingContext): Promise<IntentHandlingContext> {
    logger.info({ intentId: ctx.intentId }, 'RFC 9315 §5.2.1 — monitoring fulfilment state');

    const offer: SelectedOffer = ctx.selectedOffer ?? {};
    const reportState: IntentHandlingContext['reportState'] =
      (offer.selected_products?.length ?? 0) > 0 ? 'inProgress' : 'notFulfillable';

    return { ...ctx, reportState };
  }

  /** RFC 9315 §5.2.2 — ASSESSING */
  async assess(ctx: IntentHandlingContext): Promise<IntentHandlingContext> {
    logger.info(
      { intentId: ctx.intentId, reportState: ctx.reportState },
      'RFC 9315 §5.2.2 — assessing compliance against intent expectations',
    );

    const offer: SelectedOffer = ctx.selectedOffer ?? {};
    const quote = ctx.quote;

    const fulfilled =
      quote != null &&
      Array.isArray(offer.selected_products) &&
      offer.selected_products.length > 0;

    return { ...ctx, reportState: fulfilled ? 'fulfilled' : 'notFulfillable' };
  }

  /** Assess predicate driving the §5.2.3 loop. */
  isFulfilled(ctx: IntentHandlingContext): boolean {
    return ctx.reportState === 'fulfilled';
  }

  /** RFC 9315 §5.2.3 corrective action — consume one retry. */
  nextAfterActing(ctx: IntentHandlingContext): IntentHandlingContext {
    return { ...ctx, retriesRemaining: ctx.retriesRemaining - 1 };
  }
}
