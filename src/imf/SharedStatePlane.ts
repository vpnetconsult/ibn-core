/**
 * Copyright 2026 Vpnet Cloud Solutions Sdn. Bhd.
 * Licensed under the Apache License, Version 2.0
 * See LICENSE in the project root for license information.
 *
 * Implements RFC 9315 Intent-Based Networking
 * https://www.rfc-editor.org/rfc/rfc9315
 */

/**
 * Shared State Plane — mutual visibility for competing autonomous agents.
 *
 * Implements the shared state mechanism described in:
 *   thermostat-section-v2.docx §X.3.2 "Shared State Plane — Mutual Visibility"
 *
 * The paper identifies information asymmetry as the root cause of the
 * oscillation pattern: each agent acts on private observations without
 * awareness of pending actions from other agents.  The Shared State Plane
 * eliminates this asymmetry by maintaining:
 *
 *   1. A per-intent actuation status map — who is doing what right now.
 *   2. An append-only actuation history — what has been done recently.
 *   3. A hysteresis window — a configurable cooling period (default 120 s)
 *      after any actuation that prevents rapid re-actuation by any agent,
 *      regardless of its current observation.
 *
 * "This alone eliminates the majority of oscillation cases." — doc §X.3.2
 *
 * RFC 9315 mapping:
 *   §5.1.1 Intent Ingestion — pre-check against shared state before accepting
 *   §5.2.2 Compliance Assessment — ongoing SLA verification loop
 *
 * Standards alignment (doc §X.4):
 *   O-RAN WG2 A1   — rApps query coordination state before proposing policies
 *   TMForum IG1253 — cross-domain shared intent state
 */

import { v4 as uuidv4 } from 'uuid';
import { logger } from '../logger';
import { IntentPriorityLayer, LAYER_LABELS } from './IntentHierarchy';

// ── Status type ───────────────────────────────────────────────────────────────

/**
 * Current actuation lifecycle status for a registered intent.
 *
 *   idle              → no pending or in-progress actuation
 *   pending-proposal  → a proposal has been submitted to the arbiter
 *   actuating         → an accepted proposal is being executed
 *   fulfilled         → the intent's SLA target is currently met
 *   degraded          → SLA target is partially met
 *   failed            → intent cannot be fulfilled; manual intervention required
 */
export type IntentActuationStatus =
  | 'idle'
  | 'pending-proposal'
  | 'actuating'
  | 'fulfilled'
  | 'degraded'
  | 'failed';

// ── State entry ───────────────────────────────────────────────────────────────

/**
 * Current state of a registered intent as maintained by the Shared State Plane.
 */
export interface IntentStateEntry {
  /** The intent this entry tracks. */
  intentId: string;
  /** Priority layer from the IntentHierarchy. */
  layer: IntentPriorityLayer;
  /** System or agent that owns this intent. */
  owner: string;
  /** Current actuation lifecycle status. */
  actuationStatus: IntentActuationStatus;
  /** RFC 3339 timestamp of the most recent status change. */
  lastUpdatedAt: string;
  /**
   * ID of the in-flight proposal for this intent.
   * Present only when actuationStatus is 'pending-proposal'.
   */
  pendingProposalId?: string;
  /** RFC 3339 timestamp of the most recent completed actuation. */
  lastActuatedAt?: string;
  /** The network resource last actuated for this intent. */
  lastActuatedResource?: string;
}

// ── Actuation record ──────────────────────────────────────────────────────────

/**
 * An immutable record of a completed network actuation.
 *
 * Stored in the actuation history and used by the hysteresis check to
 * prevent rapid re-actuation of the same resource.
 */
export interface ActuationRecord {
  /** Unique identifier for this actuation event. */
  actuationId: string;
  /** The intent that triggered this actuation. */
  intentId: string;
  /** Agent that submitted the winning proposal. */
  agentId: string;
  /**
   * The network resource that was actuated.
   * e.g. 'ran-slice:SLICE-001:prb_allocation'
   */
  resource: string;
  /**
   * The action applied.
   * e.g. 'increase' | 'decrease' | 'set:42'
   */
  action: string;
  /** RFC 3339 timestamp when this actuation was executed. */
  executedAt: string;
  /** Wall-clock duration of the actuation in milliseconds. */
  durationMs?: number;
}

// ── Constants ─────────────────────────────────────────────────────────────────

/**
 * Default hysteresis window (milliseconds).
 *
 * After any actuation on a resource, no further actuation is permitted on
 * that resource for this duration.  Eliminates the majority of oscillation
 * cases (doc §X.3.2).  Default: 120 000 ms (120 seconds).
 */
export const DEFAULT_HYSTERESIS_MS = 120_000;

/**
 * Default look-back window for `getRecentActuations` (milliseconds).
 * Default: 300 000 ms (5 minutes).
 */
export const DEFAULT_RECENT_WINDOW_MS = 300_000;

// ── Plane ─────────────────────────────────────────────────────────────────────

/**
 * Single-source-of-truth for current intent states and actuation history
 * across all domain agents.
 */
export class SharedStatePlane {
  private readonly intentStates = new Map<string, IntentStateEntry>();
  private readonly actuations: ActuationRecord[] = [];

  // ── Intent state management ───────────────────────────────────────────────

  /**
   * Register an intent in the Shared State Plane.
   *
   * Sets initial status to 'idle'.  Replaces any existing entry for the
   * same intentId.
   */
  registerIntent(
    intentId: string,
    layer: IntentPriorityLayer,
    owner = 'unknown'
  ): IntentStateEntry {
    const entry: IntentStateEntry = {
      intentId,
      layer,
      owner,
      actuationStatus: 'idle',
      lastUpdatedAt: new Date().toISOString(),
    };
    this.intentStates.set(intentId, entry);
    logger.debug(
      { intentId, layer: LAYER_LABELS[layer], owner },
      'Intent registered in SharedStatePlane'
    );
    return entry;
  }

  /**
   * Retrieve the current state entry for an intent.
   *
   * Returns undefined if the intent has not been registered.
   */
  getIntentState(intentId: string): IntentStateEntry | undefined {
    return this.intentStates.get(intentId);
  }

  /**
   * Update the actuation status of a registered intent.
   *
   * @param intentId    - The intent to update.
   * @param status      - New status value.
   * @param proposalId  - Must be provided when status is 'pending-proposal'.
   *                      Cleared automatically for all other statuses.
   */
  setActuationStatus(
    intentId: string,
    status: IntentActuationStatus,
    proposalId?: string
  ): IntentStateEntry {
    const entry = this.requireEntry(intentId);
    entry.actuationStatus = status;
    entry.lastUpdatedAt = new Date().toISOString();
    entry.pendingProposalId = status === 'pending-proposal' ? proposalId : undefined;
    logger.debug({ intentId, status, proposalId }, 'Intent actuation status updated');
    return entry;
  }

  // ── Actuation history ─────────────────────────────────────────────────────

  /**
   * Record a completed network actuation.
   *
   * Updates the associated intent state entry's `lastActuatedAt` and
   * `lastActuatedResource` fields.
   *
   * @returns The stored ActuationRecord with an assigned actuationId.
   */
  recordActuation(
    record: Omit<ActuationRecord, 'actuationId'>
  ): ActuationRecord {
    const stored: ActuationRecord = {
      ...record,
      actuationId: uuidv4(),
    };
    this.actuations.push(stored);

    // Update the intent state entry if it exists.
    const entry = this.intentStates.get(record.intentId);
    if (entry) {
      entry.lastActuatedAt = record.executedAt;
      entry.lastActuatedResource = record.resource;
      entry.lastUpdatedAt = new Date().toISOString();
    }

    logger.info(
      {
        actuationId: stored.actuationId,
        intentId: record.intentId,
        resource: record.resource,
        action: record.action,
      },
      'Actuation recorded in SharedStatePlane'
    );

    return stored;
  }

  /**
   * Return true if the given resource was actuated within the hysteresis window.
   *
   * This is the primary oscillation-prevention mechanism.  No proposal
   * targeting a resource that is within its cooling period should be accepted.
   *
   * @param resource  - The resource identifier to check.
   * @param windowMs  - Hysteresis window in milliseconds (default: 120 000 ms).
   */
  isWithinHysteresis(resource: string, windowMs = DEFAULT_HYSTERESIS_MS): boolean {
    const cutoff = Date.now() - windowMs;
    return this.actuations.some(
      (a) => a.resource === resource && new Date(a.executedAt).getTime() > cutoff
    );
  }

  /**
   * Return recent actuations, optionally filtered by resource.
   *
   * Results are in execution order (oldest first).
   *
   * @param resource  - If provided, filter to this resource only.
   * @param limitMs   - Look-back window in milliseconds (default: 300 000 ms).
   */
  getRecentActuations(resource?: string, limitMs = DEFAULT_RECENT_WINDOW_MS): ActuationRecord[] {
    const cutoff = Date.now() - limitMs;
    return this.actuations.filter(
      (a) =>
        new Date(a.executedAt).getTime() > cutoff &&
        (resource === undefined || a.resource === resource)
    );
  }

  // ── Queries ───────────────────────────────────────────────────────────────

  /**
   * List all registered intents at a specific priority layer.
   */
  listIntentsByLayer(layer: IntentPriorityLayer): IntentStateEntry[] {
    return [...this.intentStates.values()].filter((e) => e.layer === layer);
  }

  /**
   * Query registered intents with optional filters.
   *
   * @param filter.layer   - Filter by priority layer.
   * @param filter.status  - Filter by actuation status.
   */
  queryState(filter?: {
    layer?: IntentPriorityLayer;
    status?: IntentActuationStatus;
  }): IntentStateEntry[] {
    let entries = [...this.intentStates.values()];
    if (filter?.layer !== undefined) {
      entries = entries.filter((e) => e.layer === filter.layer);
    }
    if (filter?.status !== undefined) {
      entries = entries.filter((e) => e.actuationStatus === filter.status);
    }
    return entries;
  }

  // ── Counts ────────────────────────────────────────────────────────────────

  /** Total number of intents registered in the plane. */
  get intentCount(): number {
    return this.intentStates.size;
  }

  /** Total number of actuation records in the history. */
  get actuationCount(): number {
    return this.actuations.length;
  }

  // ── Private ───────────────────────────────────────────────────────────────

  private requireEntry(intentId: string): IntentStateEntry {
    const entry = this.intentStates.get(intentId);
    if (!entry) {
      throw new Error(
        `SharedStatePlane: intent '${intentId}' is not registered — call registerIntent() first`
      );
    }
    return entry;
  }
}

// ── Module-level singleton ────────────────────────────────────────────────────

/** Process-level Shared State Plane shared across all IMF domain agents. */
export const sharedStatePlane = new SharedStatePlane();
