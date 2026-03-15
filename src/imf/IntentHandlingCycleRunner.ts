/**
 * Copyright 2026 Vpnet Cloud Solutions Sdn. Bhd.
 * Licensed under the Apache License, Version 2.0
 * See LICENSE in the project root for license information.
 *
 * Implements RFC 9315 Intent-Based Networking
 * https://www.rfc-editor.org/rfc/rfc9315
 */

import { ClaudeClient } from '../claude-client';
import { MCPClient } from '../mcp-client';
import { logger } from '../logger';
import { maskCustomerProfile, validateNoRawPII, redactForLogs } from '../pii-masking';
import {
  IntentHandlingPhase,
  IntentHandlingStep,
  PhaseOutcome,
} from './IntentHandlingCycle';
import { IntentHandlingContext } from './IntentHandlingContext';

export interface IntentHandlingResult {
  /** Fully-enriched context after the cycle completes */
  context: IntentHandlingContext;
  /**
   * Ordered trace of every phase executed during this cycle run.
   * Constitutes the handling trajectory for RFC 9315 §5.2.1 monitoring.
   */
  handlingTrace: IntentHandlingStep[];
  /** Final report state — convenience accessor into context.reportState */
  reportState: string;
}

/**
 * IntentHandlingCycleRunner executes the six-phase RFC 9315 §5 intent
 * handling cycle.
 *
 * Phase sequence:
 *
 *   INGESTING → TRANSLATING → ORCHESTRATING → MONITORING → ASSESSING
 *                                  ↑                              |
 *                                  └─── ACTING (if not fulfilled) ┘
 *
 * If ASSESSING determines the intent is not fulfilled and retriesRemaining > 0,
 * ACTING decrements the retry budget and re-enters ORCHESTRATING (RFC 9315
 * §5.2.3 corrective action). The cycle exits when the intent is fulfilled or
 * the retry budget is exhausted.
 */
export class IntentHandlingCycleRunner {
  constructor(
    private readonly claude: ClaudeClient,
    private readonly mcpClients: {
      bss: MCPClient;
      knowledgeGraph: MCPClient;
      customerData: MCPClient;
    },
    private readonly maxRetries: number = 1,
  ) {}

  async run(
    intentId: string,
    customerId: string,
    intentText: string,
  ): Promise<IntentHandlingResult> {
    const trace: IntentHandlingStep[] = [];

    let ctx: IntentHandlingContext = {
      intentId,
      customerId,
      intentText,
      startedAt: new Date().toISOString(),
      retriesRemaining: this.maxRetries,
    };

    // RFC 9315 §5.1.1 — INGESTING
    ctx = await this.runPhase(IntentHandlingPhase.INGESTING, ctx, trace,
      () => this.ingest(ctx),
    );

    // RFC 9315 §5.1.2 — TRANSLATING
    ctx = await this.runPhase(IntentHandlingPhase.TRANSLATING, ctx, trace,
      () => this.translate(ctx),
    );

    // RFC 9315 §5.1.3 → §5.2.3 loop
    // ORCHESTRATING → MONITORING → ASSESSING; repeat via ACTING if not fulfilled
    let continueLoop = true;
    while (continueLoop) {
      // §5.1.3
      ctx = await this.runPhase(IntentHandlingPhase.ORCHESTRATING, ctx, trace,
        () => this.orchestrate(ctx),
      );

      // §5.2.1
      ctx = await this.runPhase(IntentHandlingPhase.MONITORING, ctx, trace,
        () => this.monitor(ctx),
      );

      // §5.2.2
      ctx = await this.runPhase(IntentHandlingPhase.ASSESSING, ctx, trace,
        () => this.assess(ctx),
      );

      if (ctx.reportState === 'fulfilled' || ctx.retriesRemaining <= 0) {
        continueLoop = false;
      } else {
        // §5.2.3 — corrective action: consume one retry and re-orchestrate
        const actStart = this.startStep(IntentHandlingPhase.ACTING);
        ctx = { ...ctx, retriesRemaining: ctx.retriesRemaining - 1 };
        this.endStep(actStart, trace, 'retrying',
          `Corrective action: re-entering orchestration (${ctx.retriesRemaining} retries remaining)`,
        );
        logger.warn(
          { intentId, retriesRemaining: ctx.retriesRemaining },
          'RFC 9315 §5.2.3 — corrective action: re-entering ORCHESTRATING phase',
        );
      }
    }

    return {
      context: ctx,
      handlingTrace: trace,
      reportState: ctx.reportState ?? 'inProgress',
    };
  }

  // ---------------------------------------------------------------------------
  // Phase implementations
  // ---------------------------------------------------------------------------

  /**
   * RFC 9315 §5.1.1 — INGESTING
   * Fetch the requester context and validate that no raw PII will reach the
   * translation or orchestration phases.
   */
  private async ingest(ctx: IntentHandlingContext): Promise<IntentHandlingContext> {
    logger.info(
      { customerId: ctx.customerId },
      'RFC 9315 §5.1.1 — ingesting intent, fetching requester context',
    );

    const rawProfile = await this.mcpClients.customerData.call(
      'get_customer_profile',
      { customer_id: ctx.customerId },
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

    return {
      ...ctx,
      customerProfile: maskedProfile,
      rawCustomerProfile: rawProfile,
    };
  }

  /**
   * RFC 9315 §5.1.2 — TRANSLATING
   * Resolve the natural-language intent expression into structured,
   * network-actionable requirements using the AI translation service.
   */
  private async translate(ctx: IntentHandlingContext): Promise<IntentHandlingContext> {
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

  /**
   * RFC 9315 §5.1.3 — ORCHESTRATING
   * Submit the translated requirements to network resources and obtain a
   * fulfilment commitment (selected offer and binding quote).
   */
  private async orchestrate(ctx: IntentHandlingContext): Promise<IntentHandlingContext> {
    const analysis = ctx.intentAnalysis as any;
    const profile  = ctx.customerProfile as any;

    logger.info(
      { tags: analysis?.tags },
      'RFC 9315 §5.1.3 — orchestrating: searching product catalog',
    );

    const availableProducts = await this.mcpClients.bss.call(
      'search_product_catalog',
      {
        intent: analysis?.tags,
        customer_segment: profile?.segment,
      },
    );

    logger.info(
      { productTypes: analysis?.product_types },
      'RFC 9315 §5.1.3 — orchestrating: resolving bundles',
    );

    const availableBundles = await this.mcpClients.knowledgeGraph.call(
      'find_related_products',
      { base_products: analysis?.product_types },
    );

    logger.info('RFC 9315 §5.1.3 — orchestrating: generating fulfilment offer');

    const selectedOffer = await this.claude.generateOffer({
      intent:    analysis,
      customer:  profile,
      products:  availableProducts,
      bundles:   availableBundles,
    });

    logger.info(
      { products: (selectedOffer as any)?.selected_products },
      'RFC 9315 §5.1.3 — orchestrating: generating quote',
    );

    const quote = await this.mcpClients.bss.call(
      'generate_quote',
      {
        customer_id: ctx.customerId,
        products:    (selectedOffer as any)?.selected_products,
        discounts:   (selectedOffer as any)?.recommended_discounts,
      },
    );

    return { ...ctx, availableProducts, availableBundles, selectedOffer, quote };
  }

  /**
   * RFC 9315 §5.2.1 — MONITORING
   * Observe the live fulfilment state of the orchestrated resources.
   * Derives an initial reportState from the orchestration output; a live
   * network deployment would query the network adapter here.
   */
  private async monitor(ctx: IntentHandlingContext): Promise<IntentHandlingContext> {
    logger.info(
      { intentId: ctx.intentId },
      'RFC 9315 §5.2.1 — monitoring fulfilment state',
    );

    const offer = ctx.selectedOffer as any;
    const reportState: IntentHandlingContext['reportState'] =
      offer?.selected_products?.length > 0 ? 'inProgress' : 'notFulfillable';

    return { ...ctx, reportState };
  }

  /**
   * RFC 9315 §5.2.2 — ASSESSING
   * Evaluate compliance: determine whether the observed fulfilment state
   * satisfies the original intent expectations.
   */
  private async assess(ctx: IntentHandlingContext): Promise<IntentHandlingContext> {
    logger.info(
      { intentId: ctx.intentId, reportState: ctx.reportState },
      'RFC 9315 §5.2.2 — assessing compliance against intent expectations',
    );

    const offer = ctx.selectedOffer as any;
    const quote = ctx.quote;

    const fulfilled =
      quote != null &&
      offer != null &&
      Array.isArray(offer.selected_products) &&
      offer.selected_products.length > 0;

    return {
      ...ctx,
      reportState: fulfilled ? 'fulfilled' : 'notFulfillable',
    };
  }

  // ---------------------------------------------------------------------------
  // Trace helpers
  // ---------------------------------------------------------------------------

  private startStep(phase: IntentHandlingPhase): {
    phase: IntentHandlingPhase;
    t0: number;
    startedAt: string;
  } {
    return { phase, t0: Date.now(), startedAt: new Date().toISOString() };
  }

  private endStep(
    start: { phase: IntentHandlingPhase; t0: number; startedAt: string },
    trace: IntentHandlingStep[],
    outcome: PhaseOutcome,
    detail?: string,
  ): void {
    trace.push({
      phase:     start.phase,
      startedAt: start.startedAt,
      durationMs: Date.now() - start.t0,
      outcome,
      detail,
    });
  }

  /**
   * Execute a single phase function, record it in the trace, and propagate
   * any error after marking the step as failed.
   */
  private async runPhase(
    phase: IntentHandlingPhase,
    ctx: IntentHandlingContext,
    trace: IntentHandlingStep[],
    fn: () => Promise<IntentHandlingContext>,
  ): Promise<IntentHandlingContext> {
    const start = this.startStep(phase);
    try {
      const next = await fn();
      this.endStep(start, trace, 'completed');
      return next;
    } catch (err: any) {
      this.endStep(start, trace, 'failed', err.message);
      logger.error(
        { phase, intentId: ctx.intentId, error: err.message },
        'Intent handling phase failed',
      );
      throw err;
    }
  }
}
