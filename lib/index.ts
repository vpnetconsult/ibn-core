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
 * (src/index.ts) and its build. It re-exports ONLY the six reuse components —
 * nothing else from src/ leaks through this surface.
 */
export { IntentHandlingCycleRunner } from '../src/imf/IntentHandlingCycleRunner';
export { ConflictArbiter } from '../src/imf/ConflictArbiter';
export { SharedStatePlane } from '../src/imf/SharedStatePlane';
export { IntentHierarchy } from '../src/imf/IntentHierarchy';
export { KnowledgeStore } from '../src/imf/KnowledgeStore';
export { SemanticToolRegistry } from '../src/mcp/SemanticToolRegistry';
