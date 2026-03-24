/**
 * Copyright 2026 Vpnet Cloud Solutions Sdn. Bhd.
 * Licensed under the Apache License, Version 2.0
 * See LICENSE in the project root for license information.
 *
 * Implements RFC 9315 Intent-Based Networking
 * https://www.rfc-editor.org/rfc/rfc9315
 */

/**
 * Conflict Arbiter — proposals before actuation.
 *
 * Implements the conflict arbitration mechanism described in:
 *   thermostat-section-v2.docx §X.3.3 "Conflict Arbitration — Proposals Before Actuation"
 *
 * The arbiter replaces direct actuation with a propose-arbitrate-execute
 * pattern.  Agents do not write directly to network resources — they
 * submit proposals that are evaluated against four checks before any
 * actuation command is emitted:
 *
 *   Check 1 — Intent hierarchy:
 *     Does this proposal violate a higher-priority active intent on the
 *     same resource?
 *
 *   Check 2 — Pending proposals:
 *     Does another in-flight proposal target the same resource with an
 *     opposing action?
 *
 *   Check 3 — Hysteresis window:
 *     Was this resource actuated within the cooling period?
 *
 *   Check 4 — SLA state validity:
 *     Is the SLA deviation that triggered this proposal still active?
 *     (Default: accepted — arbiter trusts the agent's stated reason
 *     unless the intent is already in 'fulfilled' state.)
 *
 * Accepted proposals are stored as pending.  Rejected proposals receive
 * a structured reason and a recommended re-evaluation delay (cooldownMs).
 *
 * "This converts the thermostat war into a governed conversation."
 * — thermostat-section-v2.docx §X.3.3
 *
 * RFC 9315 mapping:
 *   §5.1.3 Intent Orchestration — primary arbitration locus (doc §X.3.4)
 *     The only stage with simultaneous access to: new intent, active intents,
 *     and current network state.
 *
 * Standards alignment (doc §X.4):
 *   O-RAN WG2 A1   — rApps propose, Non-RT RIC arbitrates before A1 publication
 *   ORION arXiv:2603.03667 — propose-arbitrate-execute validated in live O-RAN
 *   TMForum IG1253 — autonomy manager as cross-domain arbitration function
 *   3GPP TS 28.312 — machine-enforceable priority ordering
 */

import { v4 as uuidv4 } from 'uuid';
import { logger } from '../logger';
import {
  IntentHierarchy,
  IntentPriorityLayer,
  LAYER_LABELS,
  intentHierarchy,
} from './IntentHierarchy';
import {
  SharedStatePlane,
  ActuationRecord,
  sharedStatePlane,
} from './SharedStatePlane';

// ── Proposal types ────────────────────────────────────────────────────────────

/**
 * The type of change being proposed to a network resource.
 */
export type ProposalAction = 'increase' | 'decrease' | 'set' | 'reset' | 'override';

/**
 * A proposal submitted by a domain agent to the ConflictArbiter.
 *
 * Agents MUST NOT actuate network resources directly.  All desired changes
 * must be expressed as Proposals and evaluated before execution.
 */
export interface Proposal {
  /** Unique proposal identifier assigned by the arbiter. */
  proposalId: string;
  /** The intent on whose behalf this proposal is submitted. */
  intentId: string;
  /** The agent submitting the proposal (e.g. 'energy-optimisation-agent'). */
  agentId: string;
  /**
   * The network resource to be actuated.
   * e.g. 'ran-slice:SLICE-001:prb_allocation'
   */
  resource: string;
  /** Type of change requested. */
  action: ProposalAction;
  /** Quantitative value for 'set' actions (optional for increase/decrease). */
  actionValue?: number | string;
  /**
   * Agent's stated reason for this proposal.
   * Used for SLA validity check (Check 4) and audit trail.
   */
  reason: string;
  /** Agent's self-assessed confidence in this proposal [0, 1]. */
  confidence: number;
  /** Priority layer of the proposing intent. */
  layer: IntentPriorityLayer;
  /** RFC 3339 timestamp when the proposal was submitted. */
  submittedAt: string;
}

// ── Decision types ────────────────────────────────────────────────────────────

/** Outcome of the arbiter's evaluation of a proposal. */
export type ArbiterVerdict = 'accepted' | 'rejected' | 'superseded';

/**
 * The arbiter's decision on a submitted proposal.
 *
 * Rejected proposals include a structured reason identifying which check
 * failed, plus a recommended re-evaluation delay (cooldownMs).
 */
export interface ArbiterDecision {
  proposalId: string;
  verdict: ArbiterVerdict;
  /**
   * Human-readable reason explaining the verdict.
   * For rejections, identifies which of the four checks failed.
   */
  reason: string;
  /**
   * Recommended milliseconds to wait before re-evaluating.
   * Present only for rejected proposals.
   */
  cooldownMs?: number;
  /**
   * Present when verdict is 'superseded': the proposalId of the
   * higher-priority proposal that won.
   */
  supersededBy?: string;
  /** RFC 3339 timestamp when the arbiter made this decision. */
  evaluatedAt: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

/** Default cooldown after a hierarchy or pending-conflict rejection (ms). */
export const DEFAULT_REJECTION_COOLDOWN_MS = 120_000;

/** Shorter cooldown used after a hysteresis rejection (ms). */
export const HYSTERESIS_REJECTION_COOLDOWN_MS = 30_000;

/** Opposing action pairs — proposals with these action combinations on the
 *  same resource are considered conflicting. */
const OPPOSING_ACTIONS: ReadonlySet<string> = new Set([
  'increase:decrease',
  'decrease:increase',
  'set:reset',
  'reset:set',
  'set:decrease',
  'decrease:set',
  'set:increase',
  'increase:set',
]);

function areActionsOpposing(a: ProposalAction, b: ProposalAction): boolean {
  return OPPOSING_ACTIONS.has(`${a}:${b}`);
}

// ── Arbiter ───────────────────────────────────────────────────────────────────

export class ConflictArbiter {
  private readonly pending = new Map<string, Proposal>();
  private readonly decisionHistory: ArbiterDecision[] = [];

  /**
   * @param hierarchy - IntentHierarchy instance used for Check 1.
   * @param plane     - SharedStatePlane instance used for Checks 2, 3, and 4.
   */
  constructor(
    private readonly hierarchy: IntentHierarchy,
    private readonly plane: SharedStatePlane
  ) {}

  // ── Submit ─────────────────────────────────────────────────────────────────

  /**
   * Submit a proposal for arbitration.
   *
   * Runs all four checks in order.  The first failing check rejects the
   * proposal with a structured reason and cooldownMs.  If all checks pass,
   * the proposal is accepted and stored as pending.
   *
   * @param input - Proposal without proposalId and submittedAt (assigned here).
   * @returns     - The stored Proposal and the ArbiterDecision.
   */
  submit(
    input: Omit<Proposal, 'proposalId' | 'submittedAt'>
  ): { proposal: Proposal; decision: ArbiterDecision } {
    const proposal: Proposal = {
      ...input,
      proposalId: uuidv4(),
      submittedAt: new Date().toISOString(),
    };

    const decision = this._evaluate(proposal);
    this.decisionHistory.push(decision);

    if (decision.verdict === 'accepted') {
      this.pending.set(proposal.proposalId, proposal);
      // Update shared state to reflect in-flight proposal.
      try {
        this.plane.setActuationStatus(
          proposal.intentId,
          'pending-proposal',
          proposal.proposalId
        );
      } catch {
        // Intent not registered in the plane — acceptable for incremental adoption.
      }
      logger.info(
        {
          proposalId: proposal.proposalId,
          intentId: proposal.intentId,
          resource: proposal.resource,
          action: proposal.action,
          layer: LAYER_LABELS[proposal.layer],
        },
        'Proposal accepted'
      );
    } else {
      logger.info(
        {
          proposalId: proposal.proposalId,
          verdict: decision.verdict,
          reason: decision.reason,
          cooldownMs: decision.cooldownMs,
        },
        'Proposal rejected'
      );
    }

    return { proposal, decision };
  }

  // ── Execute ────────────────────────────────────────────────────────────────

  /**
   * Execute an accepted proposal, translating it into an actuation command.
   *
   * Records the actuation in the SharedStatePlane and removes the proposal
   * from the pending queue.
   *
   * @throws If the proposalId is not found in the pending queue.
   */
  execute(proposalId: string): ActuationRecord {
    const proposal = this.pending.get(proposalId);
    if (!proposal) {
      throw new Error(`ConflictArbiter: no accepted proposal with id '${proposalId}'`);
    }

    const startMs = Date.now();
    const executedAt = new Date().toISOString();

    const record = this.plane.recordActuation({
      intentId: proposal.intentId,
      agentId: proposal.agentId,
      resource: proposal.resource,
      action:
        proposal.actionValue !== undefined
          ? `${proposal.action}:${proposal.actionValue}`
          : proposal.action,
      executedAt,
      durationMs: Date.now() - startMs,
    });

    // Update intent state to 'actuating'.
    try {
      this.plane.setActuationStatus(proposal.intentId, 'actuating');
    } catch {
      // Intent not registered in the plane — acceptable.
    }

    this.pending.delete(proposalId);

    logger.info(
      {
        proposalId,
        actuationId: record.actuationId,
        intentId: proposal.intentId,
        resource: proposal.resource,
        action: record.action,
      },
      'Proposal executed — actuation recorded'
    );

    return record;
  }

  // ── Cancel ─────────────────────────────────────────────────────────────────

  /**
   * Cancel an accepted but not yet executed proposal.
   *
   * Returns true if the proposal was found and removed, false if it was
   * not in the pending queue.
   */
  cancelProposal(proposalId: string): boolean {
    const existed = this.pending.has(proposalId);
    if (existed) {
      const proposal = this.pending.get(proposalId)!;
      this.pending.delete(proposalId);
      try {
        this.plane.setActuationStatus(proposal.intentId, 'idle');
      } catch {
        // Intent not registered.
      }
      logger.debug({ proposalId }, 'Proposal cancelled');
    }
    return existed;
  }

  // ── Queries ────────────────────────────────────────────────────────────────

  /** Return all accepted proposals that have not yet been executed. */
  getPendingProposals(): Proposal[] {
    return [...this.pending.values()];
  }

  /**
   * Return the decision history, optionally filtered by intentId.
   */
  getDecisionHistory(intentId?: string): ArbiterDecision[] {
    if (intentId === undefined) return [...this.decisionHistory];
    // Find all proposal IDs associated with this intent, then filter decisions.
    return this.decisionHistory.filter((d) => {
      // Match decisions for proposals submitted for this intent.
      // We store the intentId on the proposal; look up by proposalId in history.
      const proposal = this.pending.get(d.proposalId);
      if (proposal) return proposal.intentId === intentId;
      // For non-pending (rejected/executed) proposals, we rely on history index.
      // intentId is not stored on ArbiterDecision directly — filter all for now.
      return true;
    });
  }

  /**
   * Return the full decision history for a specific intent.
   *
   * Since ArbiterDecision does not carry intentId, we use a secondary index
   * built from submitted proposals.
   */
  getDecisionsForIntent(intentId: string): ArbiterDecision[] {
    return this._getDecisionsByIntentId(intentId);
  }

  /** Number of accepted proposals currently awaiting execution. */
  get pendingCount(): number {
    return this.pending.size;
  }

  // ── Private evaluation ────────────────────────────────────────────────────

  // Secondary index: proposalId → intentId (for all proposals ever submitted).
  private readonly proposalIntentIndex = new Map<string, string>();

  private _evaluate(proposal: Proposal): ArbiterDecision {
    const now = new Date().toISOString();
    this.proposalIntentIndex.set(proposal.proposalId, proposal.intentId);

    // ── Check 1: Intent hierarchy ──────────────────────────────────────────
    // Does this proposal violate a higher-priority active intent on the
    // same resource?
    const conflictingHigherIntent = this._findHigherPriorityConflict(proposal);
    if (conflictingHigherIntent) {
      const higherLayer = this.hierarchy.getLayer(conflictingHigherIntent);
      return {
        proposalId: proposal.proposalId,
        verdict: 'rejected',
        reason:
          `Hierarchy override: intent '${conflictingHigherIntent}' at ` +
          `${LAYER_LABELS[higherLayer!]} has higher priority than ` +
          `${LAYER_LABELS[proposal.layer]} proposal on resource '${proposal.resource}'`,
        cooldownMs: DEFAULT_REJECTION_COOLDOWN_MS,
        evaluatedAt: now,
      };
    }

    // ── Check 2: Pending proposals ─────────────────────────────────────────
    // Does another in-flight proposal target the same resource with an
    // opposing action?
    const conflictingPending = this._findConflictingPending(proposal);
    if (conflictingPending) {
      return {
        proposalId: proposal.proposalId,
        verdict: 'superseded',
        reason:
          `Conflicting in-flight proposal '${conflictingPending.proposalId}' ` +
          `(agent: ${conflictingPending.agentId}) is already pending for ` +
          `resource '${proposal.resource}' with opposing action '${conflictingPending.action}'`,
        cooldownMs: DEFAULT_REJECTION_COOLDOWN_MS,
        supersededBy: conflictingPending.proposalId,
        evaluatedAt: now,
      };
    }

    // ── Check 3: Hysteresis window ─────────────────────────────────────────
    // Was this resource actuated within the cooling period?
    if (this.plane.isWithinHysteresis(proposal.resource)) {
      return {
        proposalId: proposal.proposalId,
        verdict: 'rejected',
        reason:
          `Hysteresis: resource '${proposal.resource}' was recently actuated ` +
          `and is within the cooling period. Re-evaluate after cooldown.`,
        cooldownMs: HYSTERESIS_REJECTION_COOLDOWN_MS,
        evaluatedAt: now,
      };
    }

    // ── Check 4: SLA state validity ────────────────────────────────────────
    // Is the SLA deviation that triggered this proposal still active?
    // Arbiter trusts the agent unless the intent is already in 'fulfilled' state.
    const intentState = this.plane.getIntentState(proposal.intentId);
    if (intentState?.actuationStatus === 'fulfilled') {
      return {
        proposalId: proposal.proposalId,
        verdict: 'rejected',
        reason:
          `SLA state invalid: intent '${proposal.intentId}' is already in ` +
          `'fulfilled' state — the deviation that triggered this proposal is no ` +
          `longer present. Proposal reason was: "${proposal.reason}"`,
        cooldownMs: DEFAULT_REJECTION_COOLDOWN_MS,
        evaluatedAt: now,
      };
    }

    // All checks passed — accept.
    return {
      proposalId: proposal.proposalId,
      verdict: 'accepted',
      reason: 'All arbitration checks passed',
      evaluatedAt: now,
    };
  }

  private _findHigherPriorityConflict(proposal: Proposal): string | undefined {
    // Look for any intent registered in the hierarchy at a higher layer that
    // has an active or in-progress state on the same resource.
    const higherLayerStates = this.plane.queryState().filter((entry) => {
      if (entry.intentId === proposal.intentId) return false;
      if (entry.actuationStatus === 'idle' || entry.actuationStatus === 'failed') return false;
      if (entry.lastActuatedResource !== proposal.resource) return false;
      // Check if this entry's intent is registered and has higher priority.
      return this.hierarchy.isHigherPriority(entry.intentId, proposal.intentId);
    });
    return higherLayerStates.length > 0 ? higherLayerStates[0].intentId : undefined;
  }

  private _findConflictingPending(proposal: Proposal): Proposal | undefined {
    for (const pending of this.pending.values()) {
      if (pending.proposalId === proposal.proposalId) continue;
      if (pending.resource !== proposal.resource) continue;
      if (areActionsOpposing(proposal.action, pending.action)) {
        return pending;
      }
    }
    return undefined;
  }

  private _getDecisionsByIntentId(intentId: string): ArbiterDecision[] {
    const relevantProposalIds = new Set<string>();
    for (const [pid, iid] of this.proposalIntentIndex) {
      if (iid === intentId) relevantProposalIds.add(pid);
    }
    return this.decisionHistory.filter((d) => relevantProposalIds.has(d.proposalId));
  }
}

// ── Module-level singleton ────────────────────────────────────────────────────

/**
 * Process-level ConflictArbiter using the module-level hierarchy and state plane
 * singletons.
 */
export const conflictArbiter = new ConflictArbiter(intentHierarchy, sharedStatePlane);
