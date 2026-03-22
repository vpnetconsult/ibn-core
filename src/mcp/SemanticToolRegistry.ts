/**
 * Copyright 2026 Vpnet Cloud Solutions Sdn. Bhd.
 * Licensed under the Apache License, Version 2.0
 * See LICENSE in the project root for license information.
 *
 * Implements RFC 9315 Intent-Based Networking
 * https://www.rfc-editor.org/rfc/rfc9315
 */

/**
 * MCP Semantic Tool Registry — high-level tool abstraction for LLM agents.
 *
 * Implements the MCP abstraction principle from:
 *   Ericsson White Paper BCSS-25:024439, "AI agents in the telecommunication
 *   network architecture", October 2025, §"Model Context Protocol".
 *
 * The paper states that MCP servers should expose high-level semantic tools
 * that represent coherent tasks or capabilities, rather than forcing agents
 * to chain multiple low-level API calls themselves.  This reduces:
 *   - LLM reasoning steps (fewer tokens, lower latency)
 *   - Error surface (chaining errors stay inside the registry, not the agent)
 *   - Hallucination risk (agent receives a single structured result, not N)
 *
 * Design:
 *   - A SemanticTool is an ordered pipeline of MCP tool calls (steps).
 *   - Each step receives the original input plus all prior step results via
 *     an execution context object; a mapper function produces the low-level
 *     parameters for that step.
 *   - Steps may be marked optional; failure of an optional step is recorded
 *     but does not abort the pipeline.
 *   - The registry ships built-in tools that mirror the IntentProcessor
 *     workflow so existing agents benefit without code changes.
 *   - Operators may register additional domain-specific semantic tools at
 *     startup via register().
 *
 * RFC 9315 mapping:
 *   §5.1.3 Orchestration — semantic tools wrap multi-step orchestration
 *   §5.2.1 Monitoring    — status tools abstract polling sequences
 *   §5.1.2 Translation   — enrichment tools abstract catalog look-ups
 */

import { logger } from '../logger';
import { SessionContext } from '../provenance/types';

// ── Execution context ─────────────────────────────────────────────────────────

/**
 * Mutable context threaded through each step of a semantic tool execution.
 *
 * Steps read from `input` (the caller-supplied arguments) and from
 * `stepResults` (the keyed outputs of every prior step).
 */
export interface SemanticExecutionContext {
  /** Original input supplied by the caller. */
  input: Record<string, unknown>;
  /**
   * Accumulated results of completed steps, keyed by step name.
   * Later steps can reference earlier step outputs via this map.
   */
  stepResults: Record<string, unknown>;
  /** Optional provenance session — forwarded to each MCPClient.call(). */
  session?: SessionContext;
}

// ── Step definition ───────────────────────────────────────────────────────────

/**
 * A single step within a semantic tool pipeline.
 *
 * The step's `mapParams` function receives the current execution context
 * (input + all prior step results) and returns the low-level parameters
 * for the underlying MCP tool call.
 */
export interface SemanticToolStep {
  /** Human-readable name used in logs and result keys (must be unique per tool). */
  name: string;
  /**
   * Key identifying which MCPClient instance to use.
   * Must match a key supplied in the `clients` map at execute() time.
   */
  clientKey: string;
  /** Name of the low-level MCP tool to call on the client. */
  toolName: string;
  /**
   * Maps execution context → low-level tool parameters.
   * Runs synchronously immediately before the tool call.
   */
  mapParams: (ctx: SemanticExecutionContext) => Record<string, unknown>;
  /**
   * If true, failure of this step is recorded but does not abort the pipeline.
   * Defaults to false.
   */
  optional?: boolean;
  /**
   * Optional description for introspection / debugging.
   */
  description?: string;
}

// ── Tool definition ───────────────────────────────────────────────────────────

/**
 * A high-level semantic tool: a named, ordered pipeline of low-level steps.
 *
 * Follows the Ericsson paper principle: the tool represents a coherent
 * task that an LLM agent can invoke as a single unit.
 */
export interface SemanticTool {
  /** Unique name that agents use to invoke this tool. */
  name: string;
  /** Natural-language description shown to the LLM in tool-selection prompts. */
  description: string;
  /** Citation of the paper or RFC section that motivates this abstraction. */
  paperRef: string;
  /** Ordered list of steps to execute. */
  steps: SemanticToolStep[];
}

// ── Result types ──────────────────────────────────────────────────────────────

export type StepStatus = 'success' | 'skipped' | 'failed';

export interface StepResult {
  name: string;
  status: StepStatus;
  /** Present when status === 'success'. */
  output?: unknown;
  /** Present when status === 'failed'. */
  error?: string;
  durationMs: number;
}

export interface SemanticToolResult {
  toolName: string;
  success: boolean;
  /** Results indexed by step name, in execution order. */
  steps: StepResult[];
  /** Convenience: combined map of step name → output for successful steps. */
  stepOutputs: Record<string, unknown>;
  /** Name of the first required step that caused failure, if any. */
  failedStep?: string;
  /** Error message from the failed required step, if any. */
  error?: string;
  durationMs: number;
}

// ── Minimal interface consumed by the registry ────────────────────────────────

/**
 * The registry depends only on a minimal call() surface so that test doubles
 * and production MCPClient instances both satisfy the contract.
 */
export interface McpCallable {
  call(
    tool: string,
    params: Record<string, unknown>,
    session?: SessionContext,
    reasoning?: string
  ): Promise<unknown>;
}

// ── Registry ──────────────────────────────────────────────────────────────────

export class SemanticToolRegistry {
  private readonly tools = new Map<string, SemanticTool>();

  /**
   * Register a semantic tool.  Replaces any existing tool with the same name.
   */
  register(tool: SemanticTool): void {
    this.tools.set(tool.name, tool);
    logger.debug({ toolName: tool.name, steps: tool.steps.length }, 'SemanticTool registered');
  }

  /**
   * Retrieve the definition of a registered tool.
   *
   * Returns undefined if no tool with that name has been registered.
   */
  get(name: string): SemanticTool | undefined {
    return this.tools.get(name);
  }

  /** Return names of all registered tools. */
  listTools(): string[] {
    return [...this.tools.keys()];
  }

  /**
   * Execute a registered semantic tool end-to-end.
   *
   * @param toolName - Name of the semantic tool to run.
   * @param input    - Caller-supplied arguments (threaded into every step via ctx.input).
   * @param clients  - Map of client keys → MCPCallable instances.
   * @param session  - Optional provenance session forwarded to each tool call.
   *
   * @returns SemanticToolResult — always resolves (never rejects); failures are
   *          captured inside the result.
   */
  async execute(
    toolName: string,
    input: Record<string, unknown>,
    clients: Record<string, McpCallable>,
    session?: SessionContext
  ): Promise<SemanticToolResult> {
    const wallStart = Date.now();

    const tool = this.tools.get(toolName);
    if (!tool) {
      return {
        toolName,
        success: false,
        steps: [],
        stepOutputs: {},
        failedStep: undefined,
        error: `Unknown semantic tool: '${toolName}'`,
        durationMs: Date.now() - wallStart,
      };
    }

    logger.info(
      { toolName, stepCount: tool.steps.length },
      'SemanticTool execution started'
    );

    const ctx: SemanticExecutionContext = {
      input,
      stepResults: {},
      session,
    };

    const stepResults: StepResult[] = [];
    let abortedStep: string | undefined;
    let abortError: string | undefined;

    for (const step of tool.steps) {
      const stepStart = Date.now();
      const client = clients[step.clientKey];

      if (!client) {
        const msg = `No client registered for key '${step.clientKey}' (step: ${step.name})`;
        if (step.optional) {
          logger.warn({ toolName, stepName: step.name }, msg);
          stepResults.push({ name: step.name, status: 'skipped', error: msg, durationMs: 0 });
          continue;
        }
        abortedStep = step.name;
        abortError = msg;
        stepResults.push({
          name: step.name,
          status: 'failed',
          error: msg,
          durationMs: Date.now() - stepStart,
        });
        break;
      }

      let params: Record<string, unknown>;
      try {
        params = step.mapParams(ctx);
      } catch (mappingErr: any) {
        const msg = `Parameter mapping failed for step '${step.name}': ${mappingErr.message}`;
        if (step.optional) {
          logger.warn({ toolName, stepName: step.name, error: mappingErr.message }, msg);
          stepResults.push({
            name: step.name,
            status: 'skipped',
            error: msg,
            durationMs: Date.now() - stepStart,
          });
          continue;
        }
        abortedStep = step.name;
        abortError = msg;
        stepResults.push({
          name: step.name,
          status: 'failed',
          error: msg,
          durationMs: Date.now() - stepStart,
        });
        break;
      }

      try {
        const output = await client.call(
          step.toolName,
          params,
          session,
          `SemanticTool '${toolName}' step '${step.name}' — ${step.description ?? step.toolName}`
        );

        ctx.stepResults[step.name] = output;
        stepResults.push({
          name: step.name,
          status: 'success',
          output,
          durationMs: Date.now() - stepStart,
        });

        logger.debug(
          { toolName, stepName: step.name, durationMs: Date.now() - stepStart },
          'SemanticTool step succeeded'
        );
      } catch (callErr: any) {
        const msg = callErr.message as string;
        if (step.optional) {
          logger.warn(
            { toolName, stepName: step.name, error: msg },
            'Optional SemanticTool step failed — continuing'
          );
          stepResults.push({
            name: step.name,
            status: 'skipped',
            error: msg,
            durationMs: Date.now() - stepStart,
          });
          continue;
        }

        abortedStep = step.name;
        abortError = msg;
        stepResults.push({
          name: step.name,
          status: 'failed',
          error: msg,
          durationMs: Date.now() - stepStart,
        });

        logger.error(
          { toolName, stepName: step.name, error: msg },
          'Required SemanticTool step failed — aborting pipeline'
        );
        break;
      }
    }

    const success = abortedStep === undefined;
    const stepOutputs: Record<string, unknown> = {};
    for (const sr of stepResults) {
      if (sr.status === 'success') {
        stepOutputs[sr.name] = sr.output;
      }
    }

    const durationMs = Date.now() - wallStart;
    logger.info(
      { toolName, success, stepCount: stepResults.length, durationMs },
      'SemanticTool execution complete'
    );

    return {
      toolName,
      success,
      steps: stepResults,
      stepOutputs,
      failedStep: abortedStep,
      error: abortError,
      durationMs,
    };
  }
}

// ── Built-in semantic tools ───────────────────────────────────────────────────

/**
 * Built-in semantic tools that abstract the multi-step intent fulfilment
 * workflow described in the Ericsson white paper (§"Model Context Protocol").
 *
 * Agents can invoke these as single units instead of chaining individual
 * BSS and knowledge-graph calls.
 */
export const BUILT_IN_SEMANTIC_TOOLS: SemanticTool[] = [
  {
    name: 'fulfil_internet_intent',
    description:
      'End-to-end internet service fulfilment: searches the product catalog for matching ' +
      'products, discovers available bundles, and generates a priced quote — in one call.',
    paperRef: 'Ericsson BCSS-25:024439 §"Model Context Protocol" — semantic tool abstraction',
    steps: [
      {
        name: 'search_products',
        clientKey: 'bss',
        toolName: 'search_product_catalog',
        description: 'Search BSS product catalog using intent tags and customer segment',
        mapParams: (ctx) => ({
          intent: ctx.input['intentTags'],
          customer_segment: ctx.input['customerSegment'],
        }),
      },
      {
        name: 'find_bundles',
        clientKey: 'knowledgeGraph',
        toolName: 'find_related_products',
        description: 'Discover bundle opportunities from the knowledge graph',
        mapParams: (ctx) => ({
          base_products: ctx.input['productTypes'],
        }),
        optional: true,
      },
      {
        name: 'generate_quote',
        clientKey: 'bss',
        toolName: 'generate_quote',
        description: 'Generate a priced quote for the selected products and discounts',
        mapParams: (ctx) => ({
          customer_id: ctx.input['customerId'],
          products: (ctx.stepResults['search_products'] as any)?.products ?? [],
          bundles: ctx.stepResults['find_bundles'],
          discounts: ctx.input['recommendedDiscounts'] ?? [],
        }),
      },
    ],
  },
  {
    name: 'enrich_customer_context',
    description:
      'Retrieve customer profile and assess current service eligibility — combined into a ' +
      'single enrichment call for the TRANSLATING phase (RFC 9315 §5.1.2).',
    paperRef: 'Ericsson BCSS-25:024439 §"Model Context Protocol" — RFC 9315 §5.1.2 TRANSLATING',
    steps: [
      {
        name: 'get_profile',
        clientKey: 'customerData',
        toolName: 'get_customer_profile',
        description: 'Fetch customer profile from CRM',
        mapParams: (ctx) => ({ customer_id: ctx.input['customerId'] }),
      },
      {
        name: 'get_eligibility',
        clientKey: 'bss',
        toolName: 'check_service_eligibility',
        description: 'Check which services the customer is eligible for',
        mapParams: (ctx) => ({
          customer_id: ctx.input['customerId'],
          segment: (ctx.stepResults['get_profile'] as any)?.segment,
        }),
        optional: true,
      },
    ],
  },
  {
    name: 'submit_and_track_order',
    description:
      'Submit a provisioning order and immediately retrieve its initial status — ' +
      'abstracts the submit + poll pattern into a single synchronous tool call.',
    paperRef: 'Ericsson BCSS-25:024439 §"Model Context Protocol" — RFC 9315 §5.1.3 ORCHESTRATION',
    steps: [
      {
        name: 'submit_order',
        clientKey: 'bss',
        toolName: 'submit_order',
        description: 'Submit the provisioning order to BSS',
        mapParams: (ctx) => ({
          customer_id: ctx.input['customerId'],
          quote_id: ctx.input['quoteId'],
          products: ctx.input['products'],
        }),
      },
      {
        name: 'get_order_status',
        clientKey: 'bss',
        toolName: 'get_order_status',
        description: 'Retrieve initial order status immediately after submission',
        mapParams: (ctx) => ({
          order_id: (ctx.stepResults['submit_order'] as any)?.orderId,
        }),
        optional: true,
      },
    ],
  },
];

// ── Singleton registry (pre-populated with built-ins) ─────────────────────────

export const semanticToolRegistry = new SemanticToolRegistry();

for (const tool of BUILT_IN_SEMANTIC_TOOLS) {
  semanticToolRegistry.register(tool);
}
