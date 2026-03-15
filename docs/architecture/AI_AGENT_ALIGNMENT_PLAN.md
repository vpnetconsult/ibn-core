# AI Agent Architecture Alignment Plan

**Version:** 1.0
**Date:** March 2026
**Reference:** Ericsson White Paper BCSS-25:024439 — "AI agents in the telecommunication network architecture" (October 2025)
**Branch:** `feat/ericsson-ai-agent-alignment`
**Author:** Vpnet Cloud Solutions Sdn. Bhd.

---

## Executive Summary

This plan aligns ibn-core with the Ericsson AI agent architecture model for telecommunications networks, as described in their October 2025 white paper. The paper validates ibn-core's existing RFC 9315 + TMF921 direction and identifies five concrete areas where the implementation should evolve. All changes preserve the open-core Apache 2.0 boundary and existing Paper 1 citation commitments.

---

## Current State — ibn-core v2.0.1

| Component | Role | RFC 9315 mapping |
|-----------|------|-----------------|
| `IntentProcessor` | Sequential 6-step pipeline: profile → analyse → catalog → bundle → offer → quote | §5.1 Intent Handling |
| `MCPClient` | Outbound MCP calls to BSS, knowledge graph, customer data | §5.1.3 Orchestration |
| `McpAdapter` interface | Open-core seam; operator adapters in private repo | §5.1.3 |
| TMF921 routes | REST API for intent lifecycle | §5.2 Monitoring & Compliance |
| Redis | SSoT/SVoT — single source/version of truth | §4 P1 |
| Prometheus + Jaeger | Observability | §5.2.1 Monitoring |

**What ibn-core already is** (Ericsson taxonomy, §"AI agents: Definition and taxonomy"):
A **Restricted, LLM-based GenAI AI agent** (copilot pattern). It is authorized to act within the intent management domain, uses Claude as its LLM, and is bound by human-defined constraints (TMF921 lifecycle, RFC 9315 compliance rules, PII guardrails).

---

## Gap Analysis — White Paper vs ibn-core

| White Paper Concept | Current ibn-core State | Gap |
|--------------------|----------------------|-----|
| IMF as AI agent with Knowledge→Decision→Action loop | `IntentProcessor` is a linear pipeline | Loop not explicitly modelled; no re-assessment on failure |
| CSPs expose MCP servers for network services | ibn-core is an MCP *client* only | ibn-core itself is not discoverable as an MCP server by external agents |
| IMF-to-IMF communication via TMF standards | Single-domain only | No inter-domain intent delegation (no upstream/downstream IMF interfaces) |
| Agent trajectory observability (track all steps, not just outcome) | Request-level metrics + structured logs | No agent-step-level trace; reasoning path not captured |
| A2A protocol for proprietary agent-to-agent comms | No A2A support | Operator adapters have no standard internal messaging contract |
| Agent taxonomy classification exposed | Implicit in code | No machine-readable capability/taxonomy declaration |

---

## Implementation Phases

### Phase 1 — IMF Agent Loop Formalisation
**Target version:** v2.1.0
**RFC 9315 citation:** §5.1–5.2 (full intent handling cycle)
**Paper section:** "Agents for intent management functions" (p. 9)

The Ericsson paper describes an IMF as: *Requirement → [Knowledge → Decision → Action] → Reporting*. The current `IntentProcessor` implements this implicitly as a flat pipeline. Phase 1 makes the loop explicit so that:
- Failures can trigger reassessment (re-enter the Knowledge phase) rather than hard-fail
- Each loop iteration is a traceable agent step
- The agent can decide to request more context before acting

**Files to create/modify:**

| File | Action | Description |
|------|--------|-------------|
| `src/imf/IntentManagementFunction.ts` | Create | Replaces `IntentProcessor`. Implements the explicit Knowledge→Decision→Action loop with retry semantics |
| `src/imf/IMFState.ts` | Create | State machine: `OBSERVING` → `ASSESSING` → `DECIDING` → `ACTING` → `REPORTING` → `FULFILLED` / `FAILED` |
| `src/imf/AgentContext.ts` | Create | Accumulates knowledge across loop iterations (customer profile, network state, constraints) |
| `src/intent-processor.ts` | Modify | Thin adapter: delegates to `IntentManagementFunction`, preserves existing public API |

**Commit message format:**
```
feat(imf): formalise Knowledge→Decision→Action agent loop

Implements: RFC 9315 §5.1.1–5.2.3 (full intent lifecycle)
TMF921: POST /intent, reportState lifecycle
Paper: aligns with Ericsson WP BCSS-25:024439 §"Agents for intent management functions"
```

---

### Phase 2 — ibn-core as MCP Server
**Target version:** v2.2.0
**RFC 9315 citation:** §4 Principle 5 — Capability Exposure
**Paper section:** "Model Context Protocol" (p. 13–14)

The paper states: *"CSPs supply MCP servers for network services exposed to the application layer."* Currently ibn-core only calls external MCP servers. Phase 2 adds an MCP server endpoint so that external AI agents (enterprise copilots, upstream IMFs, subscriber agents) can use ibn-core's intent management capability as a tool.

The paper's key guidance: *"The role of an MCP tool is to abstract multiple low-level API calls into coherent, high-level tools that represent tasks or capabilities an agent can invoke."* ibn-core's tools should be high-level (e.g., `submit_customer_intent`), not one-to-one wrappers of its REST routes.

**MCP tools to expose:**

| Tool name | Maps to | Description |
|-----------|---------|-------------|
| `submit_customer_intent` | `POST /api/v1/intent` | Accept a natural-language intent, return fulfilled offer |
| `probe_intent_feasibility` | `POST /api/v1/intent/probe` | Assess feasibility without committing |
| `get_intent_status` | `GET /api/v1/intent/:id` | Retrieve current intent lifecycle state |
| `cancel_intent` | `DELETE /api/v1/intent/:id` | Cancel an active intent |
| `list_customer_intents` | `GET /api/v1/intent` | List all intents for a customer |

**Files to create:**

| File | Description |
|------|-------------|
| `src/mcp-server/McpServer.ts` | MCP server implementation; registers tools above |
| `src/mcp-server/tools/submitIntent.ts` | Tool handler — wraps intent pipeline |
| `src/mcp-server/tools/probeIntent.ts` | Tool handler — wraps probe handler |
| `src/mcp-server/tools/getIntentStatus.ts` | Tool handler — wraps TMF921 GET |
| `src/mcp-server/tools/cancelIntent.ts` | Tool handler — wraps TMF921 DELETE |
| `src/mcp-server/McpServerAdapter.ts` | Implements `McpAdapter` interface using the server's own tools (self-reference for testing) |

**Endpoint:** `POST /mcp/tools/call` (mirrors the client-side MCPClient convention for symmetry)
**Auth:** Same `X-API-Key` header used by the existing REST API

**NOTICE update required:** Add ibn-core MCP server attribution alongside existing MCP Protocol (Anthropic/MIT) entry.

---

### Phase 3 — Agent Trajectory Observability
**Target version:** v2.2.0 (alongside Phase 2)
**RFC 9315 citation:** §5.2.1 Monitoring
**Paper section:** "Robustness and trustworthiness in AI agent-based systems" (p. 16)

The paper states: *"All steps to get to a particular result need to be tracked, making evaluation, monitoring, and observability more complex."* Current Prometheus metrics cover request-level latency and counts. This phase adds agent-step-level tracing.

**Required additions:**

| Addition | Description |
|----------|-------------|
| `src/metrics.ts` — new counters | `ibn_agent_step_total{step, status}` — counts each IMF loop step |
| `src/metrics.ts` — new histogram | `ibn_agent_step_duration_seconds{step}` — latency per step |
| `src/imf/IntentManagementFunction.ts` | Emit step-level spans to Jaeger (OpenTelemetry); include agent state at each transition |
| `src/imf/AgentTrajectory.ts` | Immutable record of all steps taken for an intent (stored in Redis alongside the intent) |
| TMF921 `IntentReport` | Add `agentTrajectory` field: list of `{step, state, durationMs, outcome}` |

**Guardrail evaluation logging** — for each Claude call, log:
- Which guardrail checks ran (PII masking, prompt injection, response filter)
- Pass/fail outcome and which rules triggered
- This satisfies the paper's "evaluation in both development and operational phases" requirement

---

### Phase 4 — IMF-to-IMF Federation
**Target version:** v3.0.0
**RFC 9315 citation:** §5.1.3 Orchestration (cross-domain)
**Paper section:** "Agent-to-agent in the telecommunications domain" (p. 15)

The paper states: *"If an IMF is implemented using AI agents, the agent-to-agent communication takes the form of functional interfaces as defined by TMF."* This phase adds the ability for ibn-core to act as a downstream IMF receiving decomposed intents from an upstream E2E management layer, and as an upstream IMF delegating sub-intents to domain-level IMFs.

**Alignment rule** (from paper, p. 15): Since ibn-core implements a standardised TMF function, it must use TMF Intent Management Framework interfaces for inter-IMF communication — **not** A2A. A2A is reserved for proprietary internal use.

**Interfaces to implement:**

| Interface | Direction | Standard |
|-----------|-----------|---------|
| Receive decomposed sub-intent | Inbound | TMF921 `POST /intent` with `isSubIntentOf` link |
| Report sub-intent status to parent IMF | Outbound | TMF921 `PATCH /intent/:id` on parent domain |
| Delegate to downstream domain | Outbound | TMF921 `POST /intent` on downstream MCP server |
| Capability advertisement | Both | `GET /capabilities` — RFC 9315 §4 P5 |

**Files to create:**

| File | Description |
|------|-------------|
| `src/tmf921/IntentFederation.ts` | Manages upstream/downstream IMF relationships |
| `src/api/capabilities.ts` | `GET /api/v1/capabilities` — exposes what this IMF can handle |
| `src/tmf921/intent-service.ts` | Extend to handle `isSubIntentOf` link on POST |

**McpAdapter interface extension** (backward-compatible):
```typescript
// Addition to McpAdapter.ts
getCapabilities(): Promise<IMFCapabilities>;  // already defined — §4 P5
reportToParentIMF?(intentId: string, status: IntentReport): Promise<void>;  // new optional method
```

---

### Phase 5 — A2A Protocol for Operator Adapter Communication
**Target version:** v3.0.0 (alongside Phase 4)
**RFC 9315 citation:** §5.1.3 Orchestration (internal)
**Paper section:** "Agent-to-agent in the telecommunications domain" (p. 15)

The paper clarifies A2A's role: *"For proprietary interfaces, agents should be given flexibility in choosing the best protocol for each agent's purpose, such as A2A."*

In ibn-core, the boundary between the public framework and private operator adapters is the `McpAdapter` interface. Operator adapters (in the private repo) currently receive orchestration calls through this interface with no standardized internal messaging format. Phase 5 defines an A2A-compatible message envelope for internal operator adapter coordination.

**Scope** (open-core only — no operator credentials):
- Define `A2AMessage` type in `src/mcp/A2AMessage.ts`
- Define `A2ACapabilityCard` in `src/mcp/A2ACapabilityCard.ts` — describes what an adapter can do
- Extend `McpAdapter` interface with optional `describeCapabilities(): A2ACapabilityCard` method
- Document the A2A integration pattern in `docs/architecture/A2A_INTEGRATION.md`

The concrete A2A implementation (routing, message exchange) stays in the private operator adapter repo — this phase only establishes the contract in the open-core seam.

---

## Standards Traceability

| Phase | White Paper section | RFC 9315 | TMF921 |
|-------|---------------------|----------|--------|
| 1 — IMF Loop | "Agents for intent management functions" | §5.1.1–5.2.3 | Intent lifecycle |
| 2 — MCP Server | "Model Context Protocol" | §4 P5 Capability Exposure | N/A (transport layer) |
| 3 — Observability | "Robustness and trustworthiness" | §5.2.1 Monitoring | `IntentReport.reportState` |
| 4 — IMF Federation | "Agent-to-agent in telecommunications" | §5.1.3 Orchestration | TMF IG1253 IMF-to-IMF |
| 5 — A2A | "Agent-to-agent in telecommunications" | §5.1.3 internal | N/A (proprietary) |

---

## Agent Taxonomy Classification

As defined by Ericsson white paper Figure 1:

```
ibn-core business-intent-agent
  └── AI agent
      └── Restricted AI agent
          └── GenAI-based
              └── LLM-based (Claude claude-sonnet-4-x)
```

**Copilot pattern**: ibn-core acts as a restricted, LLM-based agent that works on behalf of enterprise customers, expressed through natural language intents. It is bounded by:
- TMF921 lifecycle constraints (cannot act outside defined states)
- RFC 9315 §5.2.3 Compliance Actions (cannot exceed authorised remediation)
- PII guardrails (cannot expose raw customer data to the LLM)
- Rate limits and auth (cannot be accessed without valid API key)

This classification should be exposed via the capabilities endpoint added in Phase 4:
```json
{
  "agentType": "restricted-llm-genai",
  "pattern": "copilot",
  "standards": ["RFC9315", "TMF921v5"],
  "constraints": ["pii-masked", "rate-limited", "auth-required"]
}
```

---

## What Changes Are NOT Planned

The following Ericsson concepts are explicitly out of scope for this plan, consistent with CLAUDE.md rules:

| Concept | Reason out of scope |
|---------|-------------------|
| 3GPP core network integration (PCF, SBI) | ibn-core operates at the management layer, not 3GPP NF layer |
| O-RAN rApp-to-rApp communication | Out of scope for open-core (operator-specific) |
| Network slicing orchestration | Operator adapter concern — private repo only |
| Unrestricted AI agent design | Paper advises caution; ibn-core stays restricted |
| 6G architecture specifics | Forward-looking; no current standard to implement against |

---

## Version Tag Roadmap

| Version | Phases | Description |
|---------|--------|-------------|
| v2.1.0 | Phase 1 | IMF Agent Loop formalisation |
| v2.2.0 | Phase 2 + 3 | MCP Server exposure + Agent trajectory observability |
| v3.0.0 | Phase 4 + 5 | IMF Federation + A2A capability card |

---

## Licence Notes

All additions are Apache 2.0. No new dependencies with licence concerns are introduced in Phases 1–3.

Phase 4–5 may require:
- A2A protocol library: check licence before adding (`npm info <pkg> license`)
- Any TMF IG1253 schema packages: must be Apache 2.0 (TMF APIs are Apache 2.0 licensed)

---

*Copyright 2026 Vpnet Cloud Solutions Sdn. Bhd. — Licensed under Apache License, Version 2.0*
*Reference: Ericsson White Paper BCSS-25:024439, October 2025*
