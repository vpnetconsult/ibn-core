/**
 * Copyright 2026 Vpnet Cloud Solutions Sdn. Bhd.
 * Licensed under the Apache License, Version 2.0
 * See LICENSE in the project root for license information.
 *
 * Implements RFC 9315 Intent-Based Networking
 * https://www.rfc-editor.org/rfc/rfc9315
 */

import {
  ConflictArbiter,
  Proposal,
  conflictArbiter,
  DEFAULT_REJECTION_COOLDOWN_MS,
  HYSTERESIS_REJECTION_COOLDOWN_MS,
} from './ConflictArbiter';
import { IntentHierarchy, IntentPriorityLayer } from './IntentHierarchy';
import { SharedStatePlane } from './SharedStatePlane';

// ── Test helpers ──────────────────────────────────────────────────────────────

function makeArbiter(): {
  arbiter: ConflictArbiter;
  hierarchy: IntentHierarchy;
  plane: SharedStatePlane;
} {
  const hierarchy = new IntentHierarchy();
  const plane = new SharedStatePlane();
  const arbiter = new ConflictArbiter(hierarchy, plane);
  return { arbiter, hierarchy, plane };
}

type ProposalInput = Omit<Proposal, 'proposalId' | 'submittedAt'>;

function baseProposal(overrides: Partial<ProposalInput> = {}): ProposalInput {
  return {
    intentId: 'INT-001',
    agentId: 'capacity-agent',
    resource: 'ran-slice:SLICE-001:prb_allocation',
    action: 'increase',
    reason: 'throughput below SLA threshold',
    confidence: 0.9,
    layer: IntentPriorityLayer.SERVICE,
    ...overrides,
  };
}

// ── submit — accepted path ────────────────────────────────────────────────────

describe('ConflictArbiter.submit() — accepted path', () => {
  it('accepts a proposal when all checks pass', () => {
    const { arbiter } = makeArbiter();
    const { decision } = arbiter.submit(baseProposal());
    expect(decision.verdict).toBe('accepted');
    expect(decision.cooldownMs).toBeUndefined();
  });

  it('assigns a unique proposalId', () => {
    const { arbiter } = makeArbiter();
    const { proposal: p1 } = arbiter.submit(baseProposal());
    const { proposal: p2 } = arbiter.submit(baseProposal({ resource: 'other-resource' }));
    expect(p1.proposalId).not.toBe(p2.proposalId);
  });

  it('stores the accepted proposal in the pending queue', () => {
    const { arbiter } = makeArbiter();
    const { proposal } = arbiter.submit(baseProposal());
    expect(arbiter.getPendingProposals().map((p) => p.proposalId)).toContain(proposal.proposalId);
  });

  it('increments pendingCount on acceptance', () => {
    const { arbiter } = makeArbiter();
    expect(arbiter.pendingCount).toBe(0);
    arbiter.submit(baseProposal());
    expect(arbiter.pendingCount).toBe(1);
  });

  it('sets the intent to pending-proposal status in the plane', () => {
    const { arbiter, plane } = makeArbiter();
    plane.registerIntent('INT-001', IntentPriorityLayer.SERVICE, 'oss');
    const { proposal } = arbiter.submit(baseProposal());
    const state = plane.getIntentState('INT-001')!;
    expect(state.actuationStatus).toBe('pending-proposal');
    expect(state.pendingProposalId).toBe(proposal.proposalId);
  });

  it('does not throw when the intent is not registered in the plane', () => {
    const { arbiter } = makeArbiter();
    expect(() => arbiter.submit(baseProposal())).not.toThrow();
  });

  it('two non-conflicting proposals on different resources are both accepted', () => {
    const { arbiter } = makeArbiter();
    const { decision: d1 } = arbiter.submit(baseProposal({ resource: 'res-A' }));
    const { decision: d2 } = arbiter.submit(baseProposal({ resource: 'res-B' }));
    expect(d1.verdict).toBe('accepted');
    expect(d2.verdict).toBe('accepted');
    expect(arbiter.pendingCount).toBe(2);
  });

  it('records the decision in history', () => {
    const { arbiter } = makeArbiter();
    arbiter.submit(baseProposal());
    expect(arbiter.getDecisionHistory()).toHaveLength(1);
  });
});

// ── submit — Check 1: Hierarchy ───────────────────────────────────────────────

describe('ConflictArbiter.submit() — Check 1: hierarchy rejection', () => {
  it('rejects an L4 proposal when an L1 intent is active on the same resource', () => {
    const { arbiter, hierarchy, plane } = makeArbiter();

    // L1 intent is actively being fulfilled on this resource.
    hierarchy.register('INT-SLA', IntentPriorityLayer.BUSINESS, 'BSS', 'Customer SLA');
    plane.registerIntent('INT-SLA', IntentPriorityLayer.BUSINESS, 'BSS');
    plane.setActuationStatus('INT-SLA', 'actuating');
    plane.recordActuation({
      intentId: 'INT-SLA',
      agentId: 'capacity-agent',
      resource: 'ran-slice:SLICE-001:prb_allocation',
      action: 'increase',
      executedAt: new Date().toISOString(),
    });

    // L4 energy agent tries to decrease the same resource.
    hierarchy.register('INT-ENERGY', IntentPriorityLayer.OPTIMISATION, 'energy-agent');
    plane.registerIntent('INT-ENERGY', IntentPriorityLayer.OPTIMISATION, 'energy-agent');
    const { decision } = arbiter.submit(
      baseProposal({
        intentId: 'INT-ENERGY',
        agentId: 'energy-agent',
        action: 'decrease',
        layer: IntentPriorityLayer.OPTIMISATION,
        reason: 'PRB utilisation exceeds energy target',
      })
    );

    expect(decision.verdict).toBe('rejected');
    expect(decision.reason).toMatch(/Hierarchy override/);
    expect(decision.reason).toMatch(/INT-SLA/);
    expect(decision.cooldownMs).toBe(DEFAULT_REJECTION_COOLDOWN_MS);
  });

  it('accepts an L1 proposal even when an L4 intent is active on the resource', () => {
    const { arbiter, hierarchy, plane } = makeArbiter();

    // L4 energy agent has been actuating.
    hierarchy.register('INT-ENERGY', IntentPriorityLayer.OPTIMISATION, 'energy-agent');
    plane.registerIntent('INT-ENERGY', IntentPriorityLayer.OPTIMISATION, 'energy-agent');
    plane.setActuationStatus('INT-ENERGY', 'actuating');
    plane.recordActuation({
      intentId: 'INT-ENERGY',
      agentId: 'energy-agent',
      resource: 'ran-slice:SLICE-001:prb_allocation',
      action: 'decrease',
      executedAt: new Date(Date.now() - 200_000).toISOString(), // outside hysteresis
    });

    // L1 BSS now proposes to increase.
    hierarchy.register('INT-SLA', IntentPriorityLayer.BUSINESS, 'BSS');
    const { decision } = arbiter.submit(
      baseProposal({
        intentId: 'INT-SLA',
        agentId: 'BSS',
        action: 'increase',
        layer: IntentPriorityLayer.BUSINESS,
        reason: 'Customer SLA at risk',
      })
    );

    expect(decision.verdict).toBe('accepted');
  });
});

// ── submit — Check 2: Pending conflict ───────────────────────────────────────

describe('ConflictArbiter.submit() — Check 2: pending conflict rejection', () => {
  it('rejects an opposing proposal when a pending proposal exists for the same resource', () => {
    const { arbiter } = makeArbiter();

    // First proposal accepted.
    arbiter.submit(baseProposal({ agentId: 'capacity-agent', action: 'increase' }));

    // Second proposal opposes the first.
    const { decision } = arbiter.submit(
      baseProposal({ agentId: 'energy-agent', action: 'decrease' })
    );

    expect(decision.verdict).toBe('superseded');
    expect(decision.reason).toMatch(/in-flight proposal/);
    expect(decision.supersededBy).toBeDefined();
    expect(decision.cooldownMs).toBe(DEFAULT_REJECTION_COOLDOWN_MS);
  });

  it('allows a non-opposing proposal on the same resource', () => {
    const { arbiter } = makeArbiter();
    arbiter.submit(baseProposal({ agentId: 'agent-A', action: 'increase' }));
    const { decision } = arbiter.submit(
      baseProposal({ agentId: 'agent-B', action: 'increase', resource: 'ran-slice:SLICE-001:prb_allocation' })
    );
    // Same action (increase:increase) is not opposing — accepted.
    expect(decision.verdict).toBe('accepted');
  });

  it('allows same-resource proposal after the first is executed (no longer pending)', () => {
    const { arbiter } = makeArbiter();
    const { proposal } = arbiter.submit(baseProposal({ agentId: 'agent-A', action: 'increase' }));
    arbiter.execute(proposal.proposalId);

    const { decision } = arbiter.submit(
      baseProposal({ agentId: 'agent-B', action: 'decrease' })
    );
    // Hysteresis check will catch this — but it won't be a pending conflict.
    expect(decision.verdict).not.toBe('superseded');
  });
});

// ── submit — Check 3: Hysteresis ─────────────────────────────────────────────

describe('ConflictArbiter.submit() — Check 3: hysteresis rejection', () => {
  it('rejects a proposal when the resource is within the hysteresis window', () => {
    const { arbiter, plane } = makeArbiter();

    // Record a very recent actuation directly on the plane.
    plane.recordActuation({
      intentId: 'INT-001',
      agentId: 'prior-agent',
      resource: 'ran-slice:SLICE-001:prb_allocation',
      action: 'increase',
      executedAt: new Date().toISOString(),
    });

    const { decision } = arbiter.submit(baseProposal());
    expect(decision.verdict).toBe('rejected');
    expect(decision.reason).toMatch(/Hysteresis/);
    expect(decision.cooldownMs).toBe(HYSTERESIS_REJECTION_COOLDOWN_MS);
  });

  it('accepts a proposal after the hysteresis window has passed', () => {
    const { arbiter, plane } = makeArbiter();

    // Record an old actuation (outside the 120s window).
    plane.recordActuation({
      intentId: 'INT-001',
      agentId: 'prior-agent',
      resource: 'ran-slice:SLICE-001:prb_allocation',
      action: 'increase',
      executedAt: new Date(Date.now() - 200_000).toISOString(),
    });

    const { decision } = arbiter.submit(baseProposal());
    expect(decision.verdict).toBe('accepted');
  });
});

// ── submit — Check 4: SLA validity ───────────────────────────────────────────

describe('ConflictArbiter.submit() — Check 4: SLA state validity', () => {
  it('rejects a proposal when the intent is already fulfilled', () => {
    const { arbiter, plane } = makeArbiter();
    plane.registerIntent('INT-001', IntentPriorityLayer.SERVICE, 'oss');
    plane.setActuationStatus('INT-001', 'fulfilled');

    const { decision } = arbiter.submit(baseProposal());
    expect(decision.verdict).toBe('rejected');
    expect(decision.reason).toMatch(/SLA state invalid/);
    expect(decision.reason).toMatch(/fulfilled/);
    expect(decision.cooldownMs).toBe(DEFAULT_REJECTION_COOLDOWN_MS);
  });

  it('accepts a proposal when the intent is in degraded state', () => {
    const { arbiter, plane } = makeArbiter();
    plane.registerIntent('INT-001', IntentPriorityLayer.SERVICE, 'oss');
    plane.setActuationStatus('INT-001', 'degraded');

    const { decision } = arbiter.submit(baseProposal());
    expect(decision.verdict).toBe('accepted');
  });

  it('accepts a proposal when the intent is not registered in the plane', () => {
    const { arbiter } = makeArbiter();
    // Intent not in plane at all — arbiter trusts agent's stated reason.
    const { decision } = arbiter.submit(baseProposal());
    expect(decision.verdict).toBe('accepted');
  });
});

// ── execute ───────────────────────────────────────────────────────────────────

describe('ConflictArbiter.execute()', () => {
  it('returns an ActuationRecord for an accepted proposal', () => {
    const { arbiter } = makeArbiter();
    const { proposal } = arbiter.submit(baseProposal());
    const record = arbiter.execute(proposal.proposalId);
    expect(record.actuationId).toBeTruthy();
    expect(record.intentId).toBe('INT-001');
    expect(record.resource).toBe('ran-slice:SLICE-001:prb_allocation');
    expect(record.action).toMatch(/increase/);
  });

  it('removes the proposal from the pending queue after execution', () => {
    const { arbiter } = makeArbiter();
    const { proposal } = arbiter.submit(baseProposal());
    arbiter.execute(proposal.proposalId);
    expect(arbiter.pendingCount).toBe(0);
    expect(arbiter.getPendingProposals()).toHaveLength(0);
  });

  it('updates the intent to actuating status in the plane', () => {
    const { arbiter, plane } = makeArbiter();
    plane.registerIntent('INT-001', IntentPriorityLayer.SERVICE, 'oss');
    const { proposal } = arbiter.submit(baseProposal());
    arbiter.execute(proposal.proposalId);
    expect(plane.getIntentState('INT-001')!.actuationStatus).toBe('actuating');
  });

  it('includes actionValue in the actuation action string when set', () => {
    const { arbiter } = makeArbiter();
    const { proposal } = arbiter.submit(baseProposal({ action: 'set', actionValue: 42 }));
    const record = arbiter.execute(proposal.proposalId);
    expect(record.action).toBe('set:42');
  });

  it('throws when the proposalId is not in the pending queue', () => {
    const { arbiter } = makeArbiter();
    expect(() => arbiter.execute('nonexistent-id')).toThrow(/no accepted proposal/);
  });

  it('throws when trying to execute a rejected proposal', () => {
    const { arbiter, plane } = makeArbiter();
    plane.registerIntent('INT-001', IntentPriorityLayer.SERVICE, 'oss');
    plane.setActuationStatus('INT-001', 'fulfilled');
    const { proposal } = arbiter.submit(baseProposal());
    expect(() => arbiter.execute(proposal.proposalId)).toThrow(/no accepted proposal/);
  });
});

// ── cancelProposal ────────────────────────────────────────────────────────────

describe('ConflictArbiter.cancelProposal()', () => {
  it('removes an accepted proposal and returns true', () => {
    const { arbiter } = makeArbiter();
    const { proposal } = arbiter.submit(baseProposal());
    expect(arbiter.cancelProposal(proposal.proposalId)).toBe(true);
    expect(arbiter.pendingCount).toBe(0);
  });

  it('returns false for a non-existent proposalId', () => {
    expect(makeArbiter().arbiter.cancelProposal('ghost')).toBe(false);
  });

  it('resets the intent status to idle in the plane after cancel', () => {
    const { arbiter, plane } = makeArbiter();
    plane.registerIntent('INT-001', IntentPriorityLayer.SERVICE, 'oss');
    const { proposal } = arbiter.submit(baseProposal());
    arbiter.cancelProposal(proposal.proposalId);
    expect(plane.getIntentState('INT-001')!.actuationStatus).toBe('idle');
  });
});

// ── getDecisionHistory / getPendingProposals ──────────────────────────────────

describe('ConflictArbiter — decision history and pending proposals', () => {
  it('getDecisionHistory returns all decisions in order', () => {
    const { arbiter } = makeArbiter();
    arbiter.submit(baseProposal({ resource: 'res-1' }));
    arbiter.submit(baseProposal({ resource: 'res-2' }));
    expect(arbiter.getDecisionHistory()).toHaveLength(2);
  });

  it('getPendingProposals returns only accepted, not-yet-executed proposals', () => {
    const { arbiter } = makeArbiter();
    arbiter.submit(baseProposal({ resource: 'res-1' }));
    const { proposal: p2 } = arbiter.submit(baseProposal({ resource: 'res-2' }));
    arbiter.execute(p2.proposalId);
    expect(arbiter.getPendingProposals()).toHaveLength(1);
    expect(arbiter.getPendingProposals()[0].resource).toBe('res-1');
  });

  it('getDecisionsForIntent returns decisions for that specific intent', () => {
    const { arbiter } = makeArbiter();
    arbiter.submit(baseProposal({ intentId: 'INT-A', resource: 'res-1' }));
    arbiter.submit(baseProposal({ intentId: 'INT-B', resource: 'res-2' }));
    const forA = arbiter.getDecisionsForIntent('INT-A');
    expect(forA).toHaveLength(1);
  });
});

// ── Thermostat scenario (doc §X.2 + §X.3.3) ──────────────────────────────────

describe('Competing thermostats scenario — doc §X.3.3 example', () => {
  it('resolves the Agent A / Agent B PRB oscillation correctly', () => {
    const { arbiter, hierarchy, plane } = makeArbiter();

    // Register the competing intents in the hierarchy.
    hierarchy.register('INT-SLA', IntentPriorityLayer.SERVICE, 'OSS', 'Throughput SLA');
    hierarchy.register('INT-ENERGY', IntentPriorityLayer.OPTIMISATION, 'energy-agent');

    // Register in the plane with at-risk SLA.
    plane.registerIntent('INT-SLA', IntentPriorityLayer.SERVICE, 'OSS');
    plane.setActuationStatus('INT-SLA', 'degraded');

    plane.registerIntent('INT-ENERGY', IntentPriorityLayer.OPTIMISATION, 'energy-agent');

    const resource = 'ran-slice:SLICE-001:prb_allocation';

    // Agent A (capacity) proposes increase.
    const { decision: dA } = arbiter.submit({
      intentId: 'INT-SLA',
      agentId: 'capacity-agent',
      resource,
      action: 'increase',
      reason: 'throughput below SLA threshold (22 Mbps)',
      confidence: 0.95,
      layer: IntentPriorityLayer.SERVICE,
    });
    expect(dA.verdict).toBe('accepted');

    // Agent B (energy) proposes decrease — should be superseded (pending conflict).
    const { decision: dB } = arbiter.submit({
      intentId: 'INT-ENERGY',
      agentId: 'energy-agent',
      resource,
      action: 'decrease',
      reason: 'PRB utilisation above energy target',
      confidence: 0.8,
      layer: IntentPriorityLayer.OPTIMISATION,
    });
    expect(dB.verdict).toBe('superseded');
    expect(dB.supersededBy).toBe(dA.proposalId);
    expect(dB.cooldownMs).toBeGreaterThan(0);

    // Execute Agent A's accepted proposal.
    const record = arbiter.execute(dA.proposalId);
    expect(record.resource).toBe(resource);
    expect(record.action).toContain('increase');

    // Exactly one actuation was emitted.
    const recent = plane.getRecentActuations(resource);
    expect(recent).toHaveLength(1);
    expect(recent[0].agentId).toBe('capacity-agent');
  });
});

// ── Singleton ─────────────────────────────────────────────────────────────────

describe('conflictArbiter singleton', () => {
  it('exports a shared ConflictArbiter instance', () => {
    expect(conflictArbiter).toBeInstanceOf(ConflictArbiter);
  });
});
