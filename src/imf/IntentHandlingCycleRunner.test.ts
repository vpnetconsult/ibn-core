/**
 * Copyright 2026 Vpnet Cloud Solutions Sdn. Bhd.
 * Licensed under the Apache License, Version 2.0
 * See LICENSE in the project root for license information.
 *
 * Implements RFC 9315 Intent-Based Networking
 * https://www.rfc-editor.org/rfc/rfc9315
 *
 * Integration test for IntentHandlingCycleRunner after the Project-005 Phase-1
 * extraction: the BSS runner now delegates to the layer-agnostic core via
 * BssPhaseStrategy. This exercises the REAL runner + BssPhaseStrategy + real
 * PII masking, with Claude/MCP mocked — the closest local proxy to the O2C
 * behaviour the CTK Gate B verifies on the live API.
 */

import { IntentHandlingCycleRunner } from './IntentHandlingCycleRunner';
import { ClaudeClient } from '../claude-client';
import { MCPClient } from '../mcp-client';
import { IntentHandlingPhase } from './IntentHandlingCycle';

// PII-safe profile: no HIGH_RISK field keys, no email patterns → passes
// maskCustomerProfile + validateNoRawPII in the INGESTING phase.
const SAFE_PROFILE = { segment: 'consumer', current_services: ['mobile'], tenure: '2 years' };

function makeMcpClients() {
  const call = async (tool: string) => {
    switch (tool) {
      case 'get_customer_profile': return SAFE_PROFILE;
      case 'search_product_catalog': return [{ id: 'BB-100', name: 'Broadband 100' }];
      case 'find_related_products': return [{ id: 'BUNDLE-1' }];
      case 'generate_quote': return { quoteId: 'Q-1', total: 49.99 };
      default: return {};
    }
  };
  const client = { call } as unknown as MCPClient;
  return { bss: client, knowledgeGraph: client, customerData: client };
}

function makeClaude(selectedProducts: string[]): ClaudeClient {
  return {
    analyzeIntent: async () => ({
      tags: ['work_from_home'],
      product_types: ['broadband'],
      priority: ['speed'],
    }),
    generateOffer: async () => ({
      selected_products: selectedProducts,
      recommended_discounts: ['NEW10'],
    }),
  } as unknown as ClaudeClient;
}

describe('IntentHandlingCycleRunner — BSS adapter over the layer-agnostic core', () => {
  it('canonical O2C: NL intent → reportState fulfilled (CLAUDE.md O2C case)', async () => {
    const runner = new IntentHandlingCycleRunner(makeClaude(['BB-100']), makeMcpClients(), 1);

    const result = await runner.run(
      'INT-1',
      'CUST-12345',
      'I need internet for working from home',
    );

    expect(result.reportState).toBe('fulfilled');
    expect(result.context.reportState).toBe('fulfilled');
    expect(result.context.selectedOffer?.selected_products).toContain('BB-100');
    expect(result.context.quote).toBeDefined();

    const phases = result.handlingTrace.map((s) => s.phase);
    expect(phases.slice(0, 5)).toEqual([
      IntentHandlingPhase.INGESTING,
      IntentHandlingPhase.TRANSLATING,
      IntentHandlingPhase.ORCHESTRATING,
      IntentHandlingPhase.MONITORING,
      IntentHandlingPhase.ASSESSING,
    ]);
    // Fulfilled first pass → no corrective action
    expect(phases.filter((p) => p === IntentHandlingPhase.ACTING)).toHaveLength(0);
  });

  it('not fulfillable → §5.2.3 corrective retry, then notFulfillable', async () => {
    const runner = new IntentHandlingCycleRunner(makeClaude([]), makeMcpClients(), 1);

    const result = await runner.run('INT-2', 'CUST-12345', 'unfulfillable request');

    expect(result.reportState).toBe('notFulfillable');
    const phases = result.handlingTrace.map((s) => s.phase);
    // initial orchestration + one corrective re-orchestration
    expect(phases.filter((p) => p === IntentHandlingPhase.ORCHESTRATING)).toHaveLength(2);
    expect(phases.filter((p) => p === IntentHandlingPhase.ACTING)).toHaveLength(1);
    expect(result.context.retriesRemaining).toBe(0);
  });

  it('preserves the IntentHandlingResult shape (context, handlingTrace, reportState)', async () => {
    const runner = new IntentHandlingCycleRunner(makeClaude(['BB-100']), makeMcpClients(), 1);
    const result = await runner.run('INT-3', 'CUST-12345', 'internet please');
    expect(result).toHaveProperty('context');
    expect(result).toHaveProperty('handlingTrace');
    expect(result).toHaveProperty('reportState');
    expect(Array.isArray(result.handlingTrace)).toBe(true);
  });
});
