/**
 * Copyright 2026 Vpnet Cloud Solutions Sdn. Bhd.
 * Licensed under the Apache License, Version 2.0
 * See LICENSE in the project root for license information.
 *
 * Implements RFC 9315 Intent-Based Networking
 * https://www.rfc-editor.org/rfc/rfc9315
 *
 * ibn-core library entry — curated re-export of the RFC 9315 IMF reuse surface
 * consumed by downstream agents (e.g. resource-intent-agent, Project 004, ADR-004/ADR-009).
 *
 * ADDITIVE: this entry is independent of the business-intent-agent application
 * (src/index.ts) and its build. Nothing else from src/ leaks through this surface.
 *
 * SDK-FREE (Project 004 dashboard D4 / Project 005 slim-entry): this entry pulls
 * NO LLM dependency. The BSS-concrete `IntentHandlingCycleRunner` is deliberately
 * NOT re-exported here — it imports `claude-client` (→ @anthropic-ai/sdk) and is
 * the business-intent-agent's own runner, reached via src/, not the reuse surface.
 * Post-ADR-012 every downstream peer (resource, future service/slice) instantiates
 * the layer-agnostic `IntentCycleRunner` with its own PhaseStrategy instead, so the
 * heavy LLM closure no longer rides along with the coordination-plane reuse. A
 * future `ibn-core/bss` subpath can re-expose the BSS runner if ever needed.
 */
export { ConflictArbiter } from '../src/imf/ConflictArbiter';
export { SharedStatePlane } from '../src/imf/SharedStatePlane';
export { IntentHierarchy } from '../src/imf/IntentHierarchy';
export { KnowledgeStore } from '../src/imf/KnowledgeStore';
export { SemanticToolRegistry } from '../src/mcp/SemanticToolRegistry';

// ── Layer-agnostic RFC 9315 core (Project 005, ARC-005-ADR-001) ──────────────
// The "two peers, one core" surface: any intent domain (business, resource,
// future service/slice) instantiates IntentCycleRunner with its own
// PhaseStrategy adapter set. The phase enums/step types are re-exported so
// consumers stop mirroring them locally (closes 004 dashboard D6 / FR-010).
export { IntentCycleRunner } from '../src/imf/core/IntentCycleRunner';
export type { CycleResult, IntentCycleOptions } from '../src/imf/core/IntentCycleRunner';
export type {
  PhaseStrategy,
  CycleState,
  SafetyGovernor,
  ProposedChange,
  AdmitDecision,
  CycleLogger,
} from '../src/imf/core/PhaseStrategy';
export { PERMISSIVE_GOVERNOR } from '../src/imf/core/PhaseStrategy';
export { IntentHandlingPhase } from '../src/imf/IntentHandlingCycle';
export type { IntentHandlingStep, PhaseOutcome } from '../src/imf/IntentHandlingCycle';
