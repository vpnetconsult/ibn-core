/**
 * Copyright 2026 Vpnet Cloud Solutions Sdn. Bhd.
 * Licensed under the Apache License, Version 2.0
 * See LICENSE in the project root for license information.
 *
 * Implements RFC 9315 Intent-Based Networking
 * https://www.rfc-editor.org/rfc/rfc9315
 */

/**
 * IMF Knowledge Store — per-domain knowledge-centric intelligence.
 *
 * Implements the Knowledge component of the Intent Management Function (IMF)
 * closed control loop from:
 *   Ericsson White Paper BCSS-25:024439, "AI agents in the telecommunication
 *   network architecture", October 2025, §"Agents for intent management
 *   functions", Figure 2.
 *
 * Figure 2 loop:
 *   Intent → Requirement → [Knowledge] → Decision → Action
 *         ↑                                              ↓
 *   Report ← State ← Actuation ← Measurement ← Actuation
 *
 * Design:
 *   - Each IMF domain owns one KnowledgeStore instance.
 *   - Facts are typed key-value entries with an optional TTL.
 *   - Measurement records track actuation outcomes (State ← Measurement).
 *   - Decisions record the agent's inferred choices and their confidence.
 *   - The store is consulted during TRANSLATING and ASSESSING phases
 *     (paper §"Agents for IMFs": "knowledge-centric domain intelligence").
 *   - TTL-expired facts are lazily evicted on access.
 *   - All mutations emit structured log entries for observability.
 *
 * RFC 9315 mapping:
 *   §5.1.2 TRANSLATING — knowledge enriches intent→requirement mapping
 *   §5.2.1 MONITORING  — measurements feed back into the store
 *   §5.2.2 ASSESSING   — store provides historical context for compliance
 *   §5.2.3 ACTING      — decisions guide corrective actions
 */

import { logger } from '../logger';

// ── Fact ──────────────────────────────────────────────────────────────────────

/**
 * A single piece of domain knowledge stored in the IMF.
 *
 * Facts model the "Knowledge" box in Figure 2.  They represent any stable
 * piece of information that the IMF has learned through Measurement or that
 * was seeded at initialisation (e.g. network capability limits, SLA
 * thresholds, segment preferences).
 */
export interface Fact {
  /** Unique identifier for the fact (e.g. 'max_bandwidth_mbps'). */
  key: string;
  /** The stored value (any JSON-serialisable type). */
  value: unknown;
  /** RFC 3339 timestamp when the fact was recorded. */
  recordedAt: string;
  /**
   * Optional expiry timestamp (RFC 3339).
   * Expired facts are treated as absent and lazily evicted on next access.
   */
  expiresAt?: string;
  /**
   * Confidence score in [0, 1].
   * 1.0 = deterministic/operator-seeded; <1.0 = inferred/measured.
   */
  confidence: number;
  /** Free-form source label (e.g. 'measurement', 'operator', 'inference'). */
  source: string;
}

// ── Measurement ───────────────────────────────────────────────────────────────

/**
 * An actuation outcome observed from the network (State ← Measurement in Figure 2).
 *
 * Measurements are the raw signal that drives the closed loop:
 *   Action → Actuation → Measurement → State → (feeds back to Assessment)
 */
export interface Measurement {
  /** Monotonically increasing sequence number within the domain. */
  sequenceNumber: number;
  /** The intent or action this measurement is associated with. */
  intentId: string;
  /** What was measured (e.g. 'throughput_mbps', 'latency_ms', 'error_rate'). */
  metric: string;
  /** The observed value. */
  value: number;
  /** Unit of the observed value (e.g. 'mbps', 'ms', 'percent'). */
  unit: string;
  /** Whether this measurement indicates fulfilment of the associated intent. */
  fulfilmentState: 'fulfilled' | 'degraded' | 'not-fulfilled' | 'unknown';
  /** RFC 3339 timestamp of the observation. */
  observedAt: string;
}

// ── Decision ──────────────────────────────────────────────────────────────────

/**
 * A decision made by the IMF during an intent handling cycle.
 *
 * Decisions record the "Decision" box in Figure 2 and form the basis for
 * trajectory evaluation (paper §"Robustness and trustworthiness").
 */
export interface KnowledgeDecision {
  /** RFC 3339 timestamp when the decision was made. */
  decidedAt: string;
  /** The intent handling phase during which this decision was made. */
  phase: string;
  /** Short label for the decision (e.g. 'select_product', 'trigger_correction'). */
  label: string;
  /** The chosen outcome or action. */
  choice: string;
  /** Reasoning supplied by the agent (chain-of-thought summary). */
  reasoning: string;
  /** Confidence score in [0, 1]. */
  confidence: number;
}

// ── Domain state ──────────────────────────────────────────────────────────────

/** Current actuation state of the IMF domain (State box in Figure 2). */
export type DomainState = 'idle' | 'fulfilling' | 'degraded' | 'recovering' | 'failed';

// ── Store ─────────────────────────────────────────────────────────────────────

export class KnowledgeStore {
  private readonly domainId: string;
  private readonly facts = new Map<string, Fact>();
  private readonly measurements: Measurement[] = [];
  private readonly decisions: KnowledgeDecision[] = [];
  private domainState: DomainState = 'idle';
  private measurementSeq = 0;

  /** Maximum measurements retained in the hot store. */
  private static readonly MAX_MEASUREMENTS = 500;
  /** Maximum decisions retained. */
  private static readonly MAX_DECISIONS = 200;

  constructor(domainId: string) {
    this.domainId = domainId;
  }

  // ── Facts ──────────────────────────────────────────────────────────────────

  /**
   * Assert a fact into the knowledge store, replacing any existing fact
   * with the same key.
   *
   * Maps to: Knowledge update from Measurement or operator seed (Figure 2).
   */
  assertFact(
    key: string,
    value: unknown,
    options: { confidence?: number; source?: string; ttlSeconds?: number } = {}
  ): Fact {
    const { confidence = 1.0, source = 'operator', ttlSeconds } = options;
    const now = new Date();
    const fact: Fact = {
      key,
      value,
      recordedAt: now.toISOString(),
      expiresAt: ttlSeconds
        ? new Date(now.getTime() + ttlSeconds * 1000).toISOString()
        : undefined,
      confidence,
      source,
    };
    this.facts.set(key, fact);
    logger.debug({ domainId: this.domainId, key, source, confidence }, 'IMF fact asserted');
    return fact;
  }

  /**
   * Retrieve a fact by key.
   *
   * Returns `undefined` if the fact does not exist or has expired (lazy eviction).
   */
  getFact(key: string): Fact | undefined {
    const fact = this.facts.get(key);
    if (!fact) return undefined;

    if (fact.expiresAt && new Date(fact.expiresAt) < new Date()) {
      this.facts.delete(key);
      logger.debug({ domainId: this.domainId, key }, 'IMF fact expired and evicted');
      return undefined;
    }

    return fact;
  }

  /**
   * Retrieve the raw value of a fact, or a provided default.
   */
  getFactValue<T>(key: string, defaultValue: T): T {
    const fact = this.getFact(key);
    return fact !== undefined ? (fact.value as T) : defaultValue;
  }

  /**
   * Retract (remove) a fact from the store.
   */
  retractFact(key: string): boolean {
    const existed = this.facts.has(key);
    this.facts.delete(key);
    if (existed) {
      logger.debug({ domainId: this.domainId, key }, 'IMF fact retracted');
    }
    return existed;
  }

  /**
   * Return all non-expired facts whose keys match the given prefix.
   *
   * Expired facts are lazily evicted: we collect the expired keys in a
   * separate pass and delete them after iteration to avoid mutating the Map
   * while iterating over it.
   */
  queryFacts(keyPrefix: string): Fact[] {
    const now = new Date();
    const results: Fact[] = [];
    const expired: string[] = [];

    for (const [key, fact] of this.facts) {
      if (!key.startsWith(keyPrefix)) continue;
      if (fact.expiresAt && new Date(fact.expiresAt) < now) {
        expired.push(key);
        continue;
      }
      results.push(fact);
    }

    for (const key of expired) {
      this.facts.delete(key);
    }
    if (expired.length > 0) {
      logger.debug(
        { domainId: this.domainId, count: expired.length },
        'IMF facts expired and evicted',
      );
    }

    return results;
  }

  /** Number of non-expired facts currently in the store. */
  get factCount(): number {
    return this.queryFacts('').length;
  }

  // ── Measurements ──────────────────────────────────────────────────────────

  /**
   * Record a network measurement (State ← Measurement in Figure 2).
   *
   * Measurements drive the feedback loop: they update the domain state and
   * can trigger corrective-action cycles (RFC 9315 §5.2.3 ACTING phase).
   */
  recordMeasurement(
    intentId: string,
    metric: string,
    value: number,
    unit: string,
    fulfilmentState: Measurement['fulfilmentState']
  ): Measurement {
    const measurement: Measurement = {
      sequenceNumber: ++this.measurementSeq,
      intentId,
      metric,
      value,
      unit,
      fulfilmentState,
      observedAt: new Date().toISOString(),
    };

    this.measurements.push(measurement);
    if (this.measurements.length > KnowledgeStore.MAX_MEASUREMENTS) {
      this.measurements.shift();
    }

    // Auto-update domain state from fulfilment signal.
    this.updateDomainStateFromMeasurement(fulfilmentState);

    logger.info(
      {
        domainId: this.domainId,
        intentId,
        metric,
        value,
        unit,
        fulfilmentState,
        seq: measurement.sequenceNumber,
      },
      'IMF measurement recorded'
    );

    return measurement;
  }

  /**
   * Return recent measurements for a given intent (newest last).
   *
   * @param intentId - Filter by intent; omit to return all measurements.
   * @param limit    - Maximum number of results (default: 10).
   */
  getMeasurements(intentId?: string, limit = 10): Measurement[] {
    const filtered = intentId
      ? this.measurements.filter((m) => m.intentId === intentId)
      : [...this.measurements];
    return filtered.slice(-limit);
  }

  /**
   * Compute the most recent fulfilment state for a given intent.
   *
   * Returns 'unknown' if no measurements have been recorded for the intent.
   */
  getLatestFulfilmentState(intentId: string): Measurement['fulfilmentState'] {
    const forIntent = this.measurements.filter((m) => m.intentId === intentId);
    if (forIntent.length === 0) return 'unknown';
    return forIntent[forIntent.length - 1].fulfilmentState;
  }

  // ── Decisions ─────────────────────────────────────────────────────────────

  /**
   * Log a decision made by the agent (Decision box in Figure 2).
   *
   * Decisions are append-only and used by the trajectory evaluator to score
   * agent reasoning quality (paper §"Robustness and trustworthiness").
   */
  recordDecision(
    phase: string,
    label: string,
    choice: string,
    reasoning: string,
    confidence: number
  ): KnowledgeDecision {
    const decision: KnowledgeDecision = {
      decidedAt: new Date().toISOString(),
      phase,
      label,
      choice,
      reasoning,
      confidence,
    };

    this.decisions.push(decision);
    if (this.decisions.length > KnowledgeStore.MAX_DECISIONS) {
      this.decisions.shift();
    }

    logger.info(
      { domainId: this.domainId, phase, label, choice, confidence },
      'IMF decision recorded'
    );

    return decision;
  }

  /**
   * Return all decisions, optionally filtered by phase.
   */
  getDecisions(phase?: string): KnowledgeDecision[] {
    return phase ? this.decisions.filter((d) => d.phase === phase) : [...this.decisions];
  }

  // ── Domain state ──────────────────────────────────────────────────────────

  /**
   * Return the current domain state (State box in Figure 2).
   */
  getDomainState(): DomainState {
    return this.domainState;
  }

  /**
   * Manually set the domain state (e.g. after a corrective action completes).
   */
  setDomainState(state: DomainState): void {
    const previous = this.domainState;
    this.domainState = state;
    logger.info({ domainId: this.domainId, from: previous, to: state }, 'IMF domain state changed');
  }

  // ── Snapshot ──────────────────────────────────────────────────────────────

  /**
   * Return a diagnostic snapshot of the store (for observability / SIEM).
   */
  snapshot(): {
    domainId: string;
    domainState: DomainState;
    factCount: number;
    measurementCount: number;
    decisionCount: number;
    latestMeasurement?: Measurement;
    latestDecision?: KnowledgeDecision;
  } {
    return {
      domainId: this.domainId,
      domainState: this.domainState,
      // Use the factCount getter so expired facts are evicted before counting,
      // keeping this snapshot consistent with the public factCount accessor.
      factCount: this.factCount,
      measurementCount: this.measurements.length,
      decisionCount: this.decisions.length,
      latestMeasurement: this.measurements[this.measurements.length - 1],
      latestDecision: this.decisions[this.decisions.length - 1],
    };
  }

  // ── Private ───────────────────────────────────────────────────────────────

  private updateDomainStateFromMeasurement(
    fulfilmentState: Measurement['fulfilmentState']
  ): void {
    switch (fulfilmentState) {
      case 'fulfilled':
        if (this.domainState !== 'idle') {
          this.setDomainState('idle');
        }
        break;
      case 'degraded':
        if (this.domainState === 'idle' || this.domainState === 'fulfilling') {
          this.setDomainState('degraded');
        }
        break;
      case 'not-fulfilled':
        if (this.domainState !== 'failed') {
          this.setDomainState('recovering');
        }
        break;
      default:
        break;
    }
  }
}

// ── Domain registry ───────────────────────────────────────────────────────────

/**
 * Process-level registry of per-domain KnowledgeStore instances.
 *
 * Each autonomous domain in the TMF architecture owns one KnowledgeStore.
 * The registry ensures a single store per domain throughout the process lifetime.
 */
export class KnowledgeRegistry {
  private readonly stores = new Map<string, KnowledgeStore>();

  /**
   * Return the KnowledgeStore for a domain, creating it if it does not exist.
   */
  getOrCreate(domainId: string): KnowledgeStore {
    if (!this.stores.has(domainId)) {
      this.stores.set(domainId, new KnowledgeStore(domainId));
      logger.info({ domainId }, 'IMF KnowledgeStore created for domain');
    }
    return this.stores.get(domainId)!;
  }

  /** Number of active domain stores. */
  get domainCount(): number {
    return this.stores.size;
  }

  /** List all registered domain IDs. */
  listDomains(): string[] {
    return [...this.stores.keys()];
  }
}

/** Module-level singleton registry. */
export const knowledgeRegistry = new KnowledgeRegistry();
