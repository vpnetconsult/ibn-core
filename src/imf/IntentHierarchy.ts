/**
 * Copyright 2026 Vpnet Cloud Solutions Sdn. Bhd.
 * Licensed under the Apache License, Version 2.0
 * See LICENSE in the project root for license information.
 *
 * Implements RFC 9315 Intent-Based Networking
 * https://www.rfc-editor.org/rfc/rfc9315
 */

/**
 * Intent Hierarchy — the priority source for the master thermostat.
 *
 * Implements the intent hierarchy mechanism described in:
 *   thermostat-section-v2.docx §X.3.1 "Intent Hierarchy — the Priority Source"
 *
 * The fundamental cause of the "competing thermostats" failure mode is the
 * absence of a shared priority structure.  Each autonomous agent treats its
 * objective as the highest-priority concern because no higher-level intent is
 * visible to it.  This module resolves that by establishing an explicit
 * four-layer hierarchy:
 *
 *   L1 BUSINESS     — Customer SLA commitments, commercial obligations, regulatory
 *                     constraints.  Owner: BSS / CRM.  NEVER overridden.
 *   L2 SERVICE      — End-to-end service quality targets, network slice SLA
 *                     parameters.  Owner: OSS / Service Assurance.
 *   L3 RESOURCE     — RAN PRB allocation, QoS class assignment, traffic
 *                     engineering.  Owner: O-RAN SMO / Non-RT RIC.
 *   L4 OPTIMISATION — Energy efficiency, cost minimisation, load balancing.
 *                     Owner: domain-specific agents.  Lowest priority.
 *
 * The hierarchy makes priorities explicit, machine-readable, and enforceable —
 * rather than implicit, human-held, and inconsistently applied.
 *
 * Standards alignment (doc §X.4):
 *   TMForum IG1253  — intent hierarchy + autonomy manager as arbitration function
 *   3GPP TS 28.312  — expectation priority for autonomous 5G network management
 *   RFC 9315 §5.1.3 — orchestration stage possesses new intent + active intents
 */

import { logger } from '../logger';

// ── Priority layers ───────────────────────────────────────────────────────────

/**
 * The four intent priority layers defined in thermostat-section-v2.docx §X.3.1.
 *
 * Numeric values represent rank: **lower number = higher priority**.
 * L1 (1) always beats L4 (4); within the same layer, intents are peers.
 */
export const IntentPriorityLayer = {
  /** L1 — BSS/CRM authority. Customer SLA, regulatory. Never overridden. */
  BUSINESS: 1,
  /** L2 — OSS/Service Assurance authority. E2E service quality, slice SLA. */
  SERVICE: 2,
  /** L3 — O-RAN SMO/Non-RT RIC authority. PRB allocation, QoS, traffic eng. */
  RESOURCE: 3,
  /** L4 — domain-agent authority. Energy, cost, load balancing. Lowest priority. */
  OPTIMISATION: 4,
} as const;

export type IntentPriorityLayer =
  (typeof IntentPriorityLayer)[keyof typeof IntentPriorityLayer];

/** Human-readable labels for each layer (for logs and summaries). */
export const LAYER_LABELS: Record<IntentPriorityLayer, string> = {
  1: 'L1-Business',
  2: 'L2-Service',
  3: 'L3-Resource',
  4: 'L4-Optimisation',
};

// ── Record type ───────────────────────────────────────────────────────────────

/**
 * A single entry in the intent hierarchy registry.
 */
export interface HierarchyRecord {
  /** The intent or goal this record represents. */
  intentId: string;
  /**
   * Priority layer (1 = highest).
   * Determines which intents may override this one during arbitration.
   */
  layer: IntentPriorityLayer;
  /**
   * System or agent that owns this intent.
   * e.g. 'BSS', 'OSS', 'energy-optimisation-agent', 'capacity-agent'.
   */
  owner: string;
  /** Optional human-readable justification for this layer assignment. */
  rationale?: string;
  /** RFC 3339 timestamp when this record was registered. */
  registeredAt: string;
}

// ── Registry ──────────────────────────────────────────────────────────────────

/**
 * In-memory registry that maps intent IDs to their priority layer records.
 *
 * The registry is the single source of truth for the intent priority
 * structure.  It is consulted by the ConflictArbiter during arbitration
 * (RFC 9315 §5.1.3) to determine which competing proposal takes precedence.
 */
export class IntentHierarchy {
  private readonly records = new Map<string, HierarchyRecord>();

  /**
   * Register an intent and assign it to a priority layer.
   *
   * Replaces any existing record for the same intentId.
   */
  register(
    intentId: string,
    layer: IntentPriorityLayer,
    owner: string,
    rationale?: string
  ): HierarchyRecord {
    const record: HierarchyRecord = {
      intentId,
      layer,
      owner,
      rationale,
      registeredAt: new Date().toISOString(),
    };
    this.records.set(intentId, record);
    logger.debug(
      { intentId, layer: LAYER_LABELS[layer], owner },
      'Intent registered in hierarchy'
    );
    return record;
  }

  /**
   * Retrieve the full hierarchy record for an intent.
   *
   * Returns undefined if the intent has not been registered.
   */
  getRecord(intentId: string): HierarchyRecord | undefined {
    return this.records.get(intentId);
  }

  /**
   * Retrieve only the priority layer for an intent.
   *
   * Returns undefined if the intent has not been registered.
   */
  getLayer(intentId: string): IntentPriorityLayer | undefined {
    return this.records.get(intentId)?.layer;
  }

  /**
   * Return true if intentIdA has higher priority than intentIdB.
   *
   * Lower numeric layer = higher priority (L1 > L2 > L3 > L4).
   * Returns false if either intent is not registered, or if they are
   * at the same layer.
   */
  isHigherPriority(intentIdA: string, intentIdB: string): boolean {
    const a = this.records.get(intentIdA);
    const b = this.records.get(intentIdB);
    if (!a || !b) return false;
    return a.layer < b.layer;
  }

  /**
   * Compare two intents by priority layer for sorting.
   *
   * Returns -1 when A has higher priority, 1 when B has higher priority,
   * 0 when equal or either is unregistered.
   *
   * Usage: `[...intents].sort((a, b) => hierarchy.compare(a, b))`
   * produces a list from highest to lowest priority.
   */
  compare(intentIdA: string, intentIdB: string): -1 | 0 | 1 {
    const a = this.records.get(intentIdA);
    const b = this.records.get(intentIdB);
    if (!a || !b) return 0;
    if (a.layer < b.layer) return -1;
    if (a.layer > b.layer) return 1;
    return 0;
  }

  /**
   * List all intents registered at a specific layer.
   */
  listByLayer(layer: IntentPriorityLayer): HierarchyRecord[] {
    return [...this.records.values()].filter((r) => r.layer === layer);
  }

  /**
   * Remove an intent from the hierarchy.
   *
   * Returns true if the intent was present and removed, false if it was
   * not registered.
   */
  deregister(intentId: string): boolean {
    const existed = this.records.has(intentId);
    if (existed) {
      this.records.delete(intentId);
      logger.debug({ intentId }, 'Intent deregistered from hierarchy');
    }
    return existed;
  }

  /** Total number of intents currently registered in the hierarchy. */
  get registrationCount(): number {
    return this.records.size;
  }
}

// ── Module-level singleton ────────────────────────────────────────────────────

/** Process-level intent hierarchy registry shared across all IMF components. */
export const intentHierarchy = new IntentHierarchy();
