/**
 * Copyright 2026 Vpnet Cloud Solutions Sdn. Bhd.
 * Licensed under the Apache License, Version 2.0
 * See LICENSE in the project root for license information.
 *
 * Implements RFC 9315 Intent-Based Networking
 * https://www.rfc-editor.org/rfc/rfc9315
 */

import {
  SemanticToolRegistry,
  SemanticTool,
  McpCallable,
  BUILT_IN_SEMANTIC_TOOLS,
  semanticToolRegistry,
} from './SemanticToolRegistry';

// ── Test helpers ──────────────────────────────────────────────────────────────

function makeClient(
  handler: (tool: string, params: Record<string, unknown>) => unknown = () => ({ ok: true })
): McpCallable {
  return {
    call: jest.fn(async (tool: string, params: Record<string, unknown>) => handler(tool, params)),
  };
}

function failingClient(message = 'MCP error'): McpCallable {
  return {
    call: jest.fn(async () => {
      throw new Error(message);
    }),
  };
}

function makeTwoStepTool(overrides: Partial<SemanticTool> = {}): SemanticTool {
  return {
    name: 'two_step_tool',
    description: 'A two-step test tool',
    paperRef: 'test',
    steps: [
      {
        name: 'step_one',
        clientKey: 'svc',
        toolName: 'tool_a',
        mapParams: (ctx) => ({ input: ctx.input['x'] }),
      },
      {
        name: 'step_two',
        clientKey: 'svc',
        toolName: 'tool_b',
        mapParams: (ctx) => ({ prev: ctx.stepResults['step_one'] }),
      },
    ],
    ...overrides,
  };
}

// ── register / get / listTools ────────────────────────────────────────────────

describe('SemanticToolRegistry — registration', () => {
  it('registers a tool and retrieves it by name', () => {
    const registry = new SemanticToolRegistry();
    const tool = makeTwoStepTool();
    registry.register(tool);
    expect(registry.get('two_step_tool')).toBe(tool);
  });

  it('returns undefined for an unregistered name', () => {
    const registry = new SemanticToolRegistry();
    expect(registry.get('nonexistent')).toBeUndefined();
  });

  it('replaces a tool when registered under the same name', () => {
    const registry = new SemanticToolRegistry();
    const original = makeTwoStepTool({ description: 'original' });
    const replacement = makeTwoStepTool({ description: 'replacement' });
    registry.register(original);
    registry.register(replacement);
    expect(registry.get('two_step_tool')!.description).toBe('replacement');
  });

  it('lists all registered tool names', () => {
    const registry = new SemanticToolRegistry();
    registry.register(makeTwoStepTool({ name: 'alpha' }));
    registry.register(makeTwoStepTool({ name: 'beta' }));
    registry.register(makeTwoStepTool({ name: 'gamma' }));
    expect(registry.listTools().sort()).toEqual(['alpha', 'beta', 'gamma']);
  });

  it('starts with an empty tool list', () => {
    expect(new SemanticToolRegistry().listTools()).toHaveLength(0);
  });
});

// ── execute — happy path ──────────────────────────────────────────────────────

describe('SemanticToolRegistry.execute() — happy path', () => {
  it('executes all steps and returns success', async () => {
    const registry = new SemanticToolRegistry();
    registry.register(makeTwoStepTool());

    const client = makeClient((tool) => ({ result: tool }));
    const result = await registry.execute(
      'two_step_tool',
      { x: 42 },
      { svc: client }
    );

    expect(result.success).toBe(true);
    expect(result.failedStep).toBeUndefined();
    expect(result.error).toBeUndefined();
    expect(result.steps).toHaveLength(2);
    expect(result.steps[0].status).toBe('success');
    expect(result.steps[1].status).toBe('success');
  });

  it('populates stepOutputs with outputs of successful steps', async () => {
    const registry = new SemanticToolRegistry();
    registry.register(makeTwoStepTool());

    const client = makeClient((tool) => ({ tool }));
    const result = await registry.execute('two_step_tool', {}, { svc: client });

    expect(result.stepOutputs['step_one']).toEqual({ tool: 'tool_a' });
    expect(result.stepOutputs['step_two']).toEqual({ tool: 'tool_b' });
  });

  it('threads step results through execution context', async () => {
    const registry = new SemanticToolRegistry();
    let capturedPrev: unknown;

    registry.register({
      name: 'chain_tool',
      description: 'test',
      paperRef: 'test',
      steps: [
        {
          name: 'first',
          clientKey: 'svc',
          toolName: 'get_data',
          mapParams: () => ({}),
        },
        {
          name: 'second',
          clientKey: 'svc',
          toolName: 'use_data',
          mapParams: (ctx) => {
            capturedPrev = ctx.stepResults['first'];
            return { data: ctx.stepResults['first'] };
          },
        },
      ],
    });

    const client = makeClient((tool) => (tool === 'get_data' ? { payload: 'hello' } : {}));
    await registry.execute('chain_tool', {}, { svc: client });

    expect(capturedPrev).toEqual({ payload: 'hello' });
  });

  it('passes the original input to mapParams on every step', async () => {
    const registry = new SemanticToolRegistry();
    const capturedInputs: unknown[] = [];

    registry.register({
      name: 'input_check_tool',
      description: 'test',
      paperRef: 'test',
      steps: [
        {
          name: 's1',
          clientKey: 'svc',
          toolName: 'a',
          mapParams: (ctx) => { capturedInputs.push(ctx.input['key']); return {}; },
        },
        {
          name: 's2',
          clientKey: 'svc',
          toolName: 'b',
          mapParams: (ctx) => { capturedInputs.push(ctx.input['key']); return {}; },
        },
      ],
    });

    await registry.execute('input_check_tool', { key: 'sentinel' }, { svc: makeClient() });
    expect(capturedInputs).toEqual(['sentinel', 'sentinel']);
  });

  it('calls the correct tool name on the client', async () => {
    const registry = new SemanticToolRegistry();
    registry.register(makeTwoStepTool());

    const client = makeClient();
    await registry.execute('two_step_tool', {}, { svc: client });

    const calls = (client.call as jest.Mock).mock.calls;
    expect(calls[0][0]).toBe('tool_a');
    expect(calls[1][0]).toBe('tool_b');
  });

  it('forwards params produced by mapParams to the client', async () => {
    const registry = new SemanticToolRegistry();
    registry.register(makeTwoStepTool());

    const client = makeClient();
    await registry.execute('two_step_tool', { x: 99 }, { svc: client });

    const params = (client.call as jest.Mock).mock.calls[0][1];
    expect(params).toEqual({ input: 99 });
  });

  it('forwards session context to every tool call', async () => {
    const registry = new SemanticToolRegistry();
    registry.register(makeTwoStepTool());

    const session = { sessionId: 'sess-1', userId: 'u1', apiKeyName: 'key1' };
    const client = makeClient();
    await registry.execute('two_step_tool', {}, { svc: client }, session);

    const calls = (client.call as jest.Mock).mock.calls;
    expect(calls[0][2]).toBe(session);
    expect(calls[1][2]).toBe(session);
  });

  it('records durationMs for each step', async () => {
    const registry = new SemanticToolRegistry();
    registry.register(makeTwoStepTool());

    const result = await registry.execute('two_step_tool', {}, { svc: makeClient() });
    for (const step of result.steps) {
      expect(typeof step.durationMs).toBe('number');
      expect(step.durationMs).toBeGreaterThanOrEqual(0);
    }
  });

  it('records total durationMs for the tool', async () => {
    const registry = new SemanticToolRegistry();
    registry.register(makeTwoStepTool());

    const result = await registry.execute('two_step_tool', {}, { svc: makeClient() });
    expect(typeof result.durationMs).toBe('number');
    expect(result.durationMs).toBeGreaterThanOrEqual(0);
  });
});

// ── execute — unknown tool ────────────────────────────────────────────────────

describe('SemanticToolRegistry.execute() — unknown tool', () => {
  it('returns failure for an unregistered tool name', async () => {
    const registry = new SemanticToolRegistry();
    const result = await registry.execute('ghost', {}, {});

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/Unknown semantic tool/);
    expect(result.steps).toHaveLength(0);
  });

  it('never throws even for an unknown tool', async () => {
    const registry = new SemanticToolRegistry();
    await expect(registry.execute('ghost', {}, {})).resolves.toBeDefined();
  });
});

// ── execute — required step failure ──────────────────────────────────────────

describe('SemanticToolRegistry.execute() — required step failure', () => {
  it('aborts on required step client call failure', async () => {
    const registry = new SemanticToolRegistry();
    registry.register(makeTwoStepTool());

    const client = failingClient('upstream down');
    const result = await registry.execute('two_step_tool', {}, { svc: client });

    expect(result.success).toBe(false);
    expect(result.failedStep).toBe('step_one');
    expect(result.error).toMatch(/upstream down/);
    expect(result.steps).toHaveLength(1);
    expect(result.steps[0].status).toBe('failed');
  });

  it('does not execute subsequent steps after required failure', async () => {
    const registry = new SemanticToolRegistry();
    registry.register(makeTwoStepTool());

    const client = failingClient('boom');
    const result = await registry.execute('two_step_tool', {}, { svc: client });

    expect(result.steps).toHaveLength(1); // step_two was never reached
    expect((client.call as jest.Mock).mock.calls).toHaveLength(1);
  });

  it('fails when a required step has no matching client key', async () => {
    const registry = new SemanticToolRegistry();
    registry.register(makeTwoStepTool());

    const result = await registry.execute('two_step_tool', {}, {}); // empty clients map

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/No client registered for key 'svc'/);
    expect(result.failedStep).toBe('step_one');
  });

  it('fails when mapParams throws on a required step', async () => {
    const registry = new SemanticToolRegistry();
    registry.register({
      name: 'bad_mapper',
      description: 'test',
      paperRef: 'test',
      steps: [
        {
          name: 'exploding_step',
          clientKey: 'svc',
          toolName: 'tool',
          mapParams: () => { throw new Error('mapper exploded'); },
        },
      ],
    });

    const result = await registry.execute('bad_mapper', {}, { svc: makeClient() });

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/mapper exploded/);
    expect(result.failedStep).toBe('exploding_step');
  });

  it('never throws even when a step fails', async () => {
    const registry = new SemanticToolRegistry();
    registry.register(makeTwoStepTool());

    await expect(
      registry.execute('two_step_tool', {}, { svc: failingClient() })
    ).resolves.toBeDefined();
  });
});

// ── execute — optional steps ──────────────────────────────────────────────────

describe('SemanticToolRegistry.execute() — optional steps', () => {
  it('continues pipeline when an optional step fails', async () => {
    const registry = new SemanticToolRegistry();
    registry.register({
      name: 'optional_test',
      description: 'test',
      paperRef: 'test',
      steps: [
        {
          name: 'required_first',
          clientKey: 'svc',
          toolName: 'tool_a',
          mapParams: () => ({}),
        },
        {
          name: 'optional_middle',
          clientKey: 'svc',
          toolName: 'tool_b',
          mapParams: () => ({}),
          optional: true,
        },
        {
          name: 'required_last',
          clientKey: 'svc',
          toolName: 'tool_c',
          mapParams: () => ({}),
        },
      ],
    });

    let callIndex = 0;
    const client = makeClient(() => {
      callIndex++;
      if (callIndex === 2) throw new Error('optional step failed');
      return { step: callIndex };
    });

    const result = await registry.execute('optional_test', {}, { svc: client });

    expect(result.success).toBe(true);
    expect(result.steps[1].status).toBe('skipped');
    expect(result.steps[2].status).toBe('success');
  });

  it('marks optional step as skipped when its client key is missing', async () => {
    const registry = new SemanticToolRegistry();
    registry.register({
      name: 'optional_no_client',
      description: 'test',
      paperRef: 'test',
      steps: [
        {
          name: 'opt_step',
          clientKey: 'missing',
          toolName: 'tool',
          mapParams: () => ({}),
          optional: true,
        },
        {
          name: 'req_step',
          clientKey: 'svc',
          toolName: 'tool',
          mapParams: () => ({}),
        },
      ],
    });

    const result = await registry.execute('optional_no_client', {}, { svc: makeClient() });

    expect(result.success).toBe(true);
    expect(result.steps[0].status).toBe('skipped');
    expect(result.steps[1].status).toBe('success');
  });

  it('does not include skipped steps in stepOutputs', async () => {
    const registry = new SemanticToolRegistry();
    registry.register({
      name: 'skip_output',
      description: 'test',
      paperRef: 'test',
      steps: [
        {
          name: 'opt',
          clientKey: 'svc',
          toolName: 'tool',
          mapParams: () => ({}),
          optional: true,
        },
      ],
    });

    const result = await registry.execute('skip_output', {}, { svc: failingClient() });

    expect(result.stepOutputs['opt']).toBeUndefined();
  });

  it('marks optional step as skipped when mapParams throws', async () => {
    const registry = new SemanticToolRegistry();
    registry.register({
      name: 'optional_mapper_fail',
      description: 'test',
      paperRef: 'test',
      steps: [
        {
          name: 'optional_exploding',
          clientKey: 'svc',
          toolName: 'tool',
          mapParams: () => { throw new Error('bad mapping'); },
          optional: true,
        },
        {
          name: 'next_step',
          clientKey: 'svc',
          toolName: 'tool2',
          mapParams: () => ({}),
        },
      ],
    });

    const result = await registry.execute('optional_mapper_fail', {}, { svc: makeClient() });

    expect(result.success).toBe(true);
    expect(result.steps[0].status).toBe('skipped');
    expect(result.steps[1].status).toBe('success');
  });
});

// ── execute — multiple clients ────────────────────────────────────────────────

describe('SemanticToolRegistry.execute() — multiple clients', () => {
  it('routes each step to the correct client', async () => {
    const registry = new SemanticToolRegistry();
    registry.register({
      name: 'multi_client_tool',
      description: 'test',
      paperRef: 'test',
      steps: [
        { name: 'alpha', clientKey: 'bss', toolName: 'bss_tool', mapParams: () => ({}) },
        { name: 'beta', clientKey: 'kg', toolName: 'kg_tool', mapParams: () => ({}) },
      ],
    });

    const bssClient = makeClient(() => ({ from: 'bss' }));
    const kgClient = makeClient(() => ({ from: 'kg' }));

    const result = await registry.execute(
      'multi_client_tool',
      {},
      { bss: bssClient, kg: kgClient }
    );

    expect(result.success).toBe(true);
    expect(result.stepOutputs['alpha']).toEqual({ from: 'bss' });
    expect(result.stepOutputs['beta']).toEqual({ from: 'kg' });
    expect((bssClient.call as jest.Mock).mock.calls).toHaveLength(1);
    expect((kgClient.call as jest.Mock).mock.calls).toHaveLength(1);
  });
});

// ── Built-in tools ────────────────────────────────────────────────────────────

describe('BUILT_IN_SEMANTIC_TOOLS', () => {
  it('exports three built-in tools', () => {
    expect(BUILT_IN_SEMANTIC_TOOLS).toHaveLength(3);
  });

  it('all built-in tools have names, descriptions, and steps', () => {
    for (const tool of BUILT_IN_SEMANTIC_TOOLS) {
      expect(tool.name).toBeTruthy();
      expect(tool.description).toBeTruthy();
      expect(tool.paperRef).toBeTruthy();
      expect(tool.steps.length).toBeGreaterThan(0);
    }
  });

  it('fulfil_internet_intent has the correct step names', () => {
    const tool = BUILT_IN_SEMANTIC_TOOLS.find((t) => t.name === 'fulfil_internet_intent')!;
    const names = tool.steps.map((s) => s.name);
    expect(names).toEqual(['search_products', 'find_bundles', 'generate_quote']);
  });

  it('fulfil_internet_intent has find_bundles as optional', () => {
    const tool = BUILT_IN_SEMANTIC_TOOLS.find((t) => t.name === 'fulfil_internet_intent')!;
    const bundles = tool.steps.find((s) => s.name === 'find_bundles')!;
    expect(bundles.optional).toBe(true);
  });

  it('enrich_customer_context has get_eligibility as optional', () => {
    const tool = BUILT_IN_SEMANTIC_TOOLS.find((t) => t.name === 'enrich_customer_context')!;
    const elig = tool.steps.find((s) => s.name === 'get_eligibility')!;
    expect(elig.optional).toBe(true);
  });

  it('submit_and_track_order has get_order_status as optional', () => {
    const tool = BUILT_IN_SEMANTIC_TOOLS.find((t) => t.name === 'submit_and_track_order')!;
    const status = tool.steps.find((s) => s.name === 'get_order_status')!;
    expect(status.optional).toBe(true);
  });
});

// ── Singleton registry ────────────────────────────────────────────────────────

describe('semanticToolRegistry singleton', () => {
  it('is pre-populated with the three built-in tools', () => {
    const names = semanticToolRegistry.listTools();
    expect(names).toContain('fulfil_internet_intent');
    expect(names).toContain('enrich_customer_context');
    expect(names).toContain('submit_and_track_order');
  });

  it('executes fulfil_internet_intent end-to-end with mock clients', async () => {
    const bssClient = makeClient((tool) => {
      if (tool === 'search_product_catalog') return { products: ['broadband_100'] };
      if (tool === 'generate_quote') return { quoteId: 'Q-001', total: 99.99 };
      return {};
    });
    const kgClient = makeClient(() => ({ bundles: ['bundle_a'] }));

    const result = await semanticToolRegistry.execute(
      'fulfil_internet_intent',
      {
        intentTags: ['internet', 'wfh'],
        customerSegment: 'residential',
        productTypes: ['broadband'],
        customerId: 'CUST-001',
      },
      { bss: bssClient, knowledgeGraph: kgClient }
    );

    expect(result.success).toBe(true);
    expect(result.stepOutputs['search_products']).toEqual({ products: ['broadband_100'] });
    expect(result.stepOutputs['find_bundles']).toEqual({ bundles: ['bundle_a'] });
    expect(result.stepOutputs['generate_quote']).toEqual({ quoteId: 'Q-001', total: 99.99 });
  });

  it('fulfil_internet_intent succeeds even when find_bundles (optional) fails', async () => {
    const bssClient = makeClient((tool) => {
      if (tool === 'search_product_catalog') return { products: ['broadband_100'] };
      if (tool === 'generate_quote') return { quoteId: 'Q-002', total: 49.99 };
      return {};
    });
    const kgClient = failingClient('knowledge graph offline');

    const result = await semanticToolRegistry.execute(
      'fulfil_internet_intent',
      {
        intentTags: ['internet'],
        customerSegment: 'residential',
        productTypes: ['broadband'],
        customerId: 'CUST-002',
      },
      { bss: bssClient, knowledgeGraph: kgClient }
    );

    expect(result.success).toBe(true);
    expect(result.steps.find((s) => s.name === 'find_bundles')!.status).toBe('skipped');
    expect(result.stepOutputs['generate_quote']).toBeDefined();
  });
});
