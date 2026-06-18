# Stakeholder Drivers & Goals Analysis: location-assurance-twin

> **Template Origin**: Official | **ArcKit Version**: 5.11.0 | **Command**: `/arckit:stakeholders`

## Document Control

| Field | Value |
|-------|-------|
| **Document ID** | ARC-006-STKE-v1.0 |
| **Document Type** | Stakeholder Drivers & Goals Analysis |
| **Project** | location-assurance-twin (Project 006) |
| **Classification** | PUBLIC |
| **Status** | DRAFT |
| **Version** | 1.0 |
| **Created Date** | 2026-06-17 |
| **Last Modified** | 2026-06-17 |
| **Review Cycle** | 30 days (until baseline) |
| **Next Review Date** | 2026-07-17 |
| **Owner** | Roland Pfeifer (Lead Architect, Vpnet Cloud Solutions Sdn. Bhd.) |
| **Reviewed By** | [PENDING] |
| **Approved By** | [PENDING] |
| **Distribution** | Project Team, Architecture Team, Standards/Research Reviewer |

## Revision History

| Version | Date | Author | Changes | Approved By | Approval Date |
|---------|------|--------|---------|-------------|---------------|
| 1.0 | 2026-06-17 | ArcKit AI | Initial creation from `/arckit:stakeholders`; derived from HLD v0.1 + ARC-006-REQ-v1.0 (retro-fitted; REQ/ADR/RISK/TRAC predate this STKE) | [PENDING] | [PENDING] |

---

## Executive Summary

### Purpose

Identify the stakeholders of location-assurance-twin, the drivers behind their involvement, the goals those drivers translate into, and the measurable outcomes that prove satisfaction. This closes the backward-traceability gap flagged in `ARC-006-TRAC-v1.0` (GAP-003) by giving requirements and risks named stakeholder goals (G-IDs) to trace to.

> **Sequencing note:** This is an **open reference-rig** project (not a UK Government service), so GovS 005/007 digital and security roles are **not applicable**; the relevant governance lens is Vpnet's enterprise architecture board + Malaysia PDPA. The STKE was produced *after* REQ/ADR/RISK/TRAC (retro-fit), so goal IDs here are mapped back to the existing requirements rather than driving their creation.

### Key Findings

The stakeholder set is strongly **aligned** around two shared assets: the **location/place foundation** (which serves correlation, pre-change reach, and dispatch at once) and the **closed loop with a governance gate**. The genuine tensions are the four already resolved in the REQ/ADR: standards fidelity vs rig pragmatism, privacy vs correlation richness, autonomy vs safety, and two-store fit vs simplicity. The single most sensitive driver is the DPO's privacy boundary; the single most credibility-defining driver is the Standards Reviewer's fidelity requirement.

### Critical Success Factors

- The closed loop **surfaces cross-plane consequence pre-commit** and **catches the geo-diversity violation** on the seeded case (proves the core value).
- **No durable per-subscriber location** anywhere (privacy proven in schema + code).
- The design is **standards-defensible** (GB922 v24.0 provenance; `[MODEL]` edges promoted before publication).
- The rig is **reproducible** (`docker compose up` healthy; Apache-2.0; NMOP drafts pinned).

### Stakeholder Alignment Score

**Overall Alignment: HIGH** — synergies dominate (the place foundation and SHACL-as-intent each satisfy multiple stakeholders); the four conflicts are understood trade-offs already resolved in ADR-001 and the REQ conflict log, not open disputes.

---

## Stakeholder Identification

### Internal Stakeholders

| Stakeholder | Role/Department | Influence | Interest | Engagement Strategy |
|-------------|----------------|-----------|----------|---------------------|
| Lead Architect (Roland Pfeifer) | Sponsor / decision owner, Vpnet | HIGH | HIGH | Active — owns decisions, ADRs, narrative |
| Standards / Research Reviewer | IETF NMOP / TM Forum / academic lens | HIGH | HIGH | Active — fidelity reviews, pre-publication gates |
| Security & Governance Lead | Autonomy policy, plane separation | HIGH | HIGH | Active — gate design, trust gradient |
| Data Protection Officer (DPO) | Privacy boundary | HIGH | HIGH | Active — privacy sign-off, store inspection |
| Assurance / Governance Architect | Intent invariants + closed loop | MEDIUM | HIGH | Day-to-day — SHACL shapes, controller |
| NOC / Second-line Support | Symptom→cause operations | LOW | HIGH | Keep informed — demos, query UX |
| Network Change / Maintenance | Pre-change reach gate | LOW | HIGH | Keep informed — gate output |
| L0 Feed Owner | Semantic feed component (NMOP-adjacent) | MEDIUM | HIGH | Day-to-day — message-key scheme |
| Project Team | Build the rig | MEDIUM | HIGH | Day-to-day — build tasks |

### External Stakeholders

| Stakeholder | Organization | Relationship | Influence | Interest |
|-------------|--------------|--------------|-----------|----------|
| Target Operator | Carrier (future) | Beneficiary / future buyer | HIGH | MEDIUM |
| NMOP / Graf (adjacent work) | IETF NMOP community | Collaborator / standards source | MEDIUM | MEDIUM |
| TM Forum | SID GB922 v24.0 steward | Standards source | LOW | LOW |
| Academic / panel reviewers | Conference / journal | Assurance (Paper 2/3) | LOW | MEDIUM |

> **GovS 005 / GovS 007 (UK Government roles): Not applicable** — this is a commercial/open project under Vpnet's enterprise architecture governance and Malaysia PDPA, not a UK Government service.

### Stakeholder Power-Interest Grid

```text
                          INTEREST
              Low                         High
        ┌─────────────────────┬─────────────────────┐
        │                     │                     │
        │   KEEP SATISFIED    │   MANAGE CLOSELY    │
   High │                     │                     │
        │  • Target Operator  │  • Lead Architect   │
        │                     │  • Standards Reviewer│
        │                     │  • Security Lead    │
 P      │                     │  • DPO              │
 O      ├─────────────────────┼─────────────────────┤
 W      │                     │                     │
 E      │      MONITOR        │    KEEP INFORMED    │
 R      │                     │                     │
   Low  │  • TM Forum         │  • NOC / Support    │
        │  • Academic panel   │  • Maintenance      │
        │                     │  • Assurance Arch.  │
        │                     │  • L0 Feed Owner    │
        └─────────────────────┴─────────────────────┘
```

| Stakeholder | Power | Interest | Quadrant | Engagement Strategy |
|-------------|-------|----------|----------|---------------------|
| Lead Architect | HIGH | HIGH | Manage Closely | Owns decisions |
| Standards Reviewer | HIGH | HIGH | Manage Closely | Fidelity gates |
| Security & Governance Lead | HIGH | HIGH | Manage Closely | Autonomy policy |
| DPO | HIGH | HIGH | Manage Closely | Privacy sign-off |
| Assurance Architect | MEDIUM | HIGH | Keep Informed | Shapes + controller |
| NOC / Second-line | LOW | HIGH | Keep Informed | Demos |
| Network Change / Maintenance | LOW | HIGH | Keep Informed | Gate output |
| L0 Feed Owner | MEDIUM | HIGH | Keep Informed | Feed scheme |
| Target Operator | HIGH | MEDIUM | Keep Satisfied | Outcome briefings |
| NMOP / Graf | MEDIUM | MEDIUM | Keep Informed | Twin-naming, alignment |
| TM Forum / Academic panel | LOW | LOW–MED | Monitor | Citations |

---

## Stakeholder Drivers Analysis

### SD-1: Lead Architect — prove a citable, differentiating assurance pattern

**Stakeholder**: Lead Architect / Vpnet · **Driver Category**: STRATEGIC
**Driver Statement**: Demonstrate that location-anchored, closed-loop assurance is a reproducible, standards-grounded pattern — a sibling to ibn-core and the basis for Paper 2/3 — to build reputation and a future SI offering.
**Context & Background**: Vpnet's differentiation is standards-faithful, agent-native network architecture; this twin extends the RFC 9315 line into assurance.
**Driver Intensity**: HIGH
**Enablers**: Reusable rig; clear paper narrative; ibn-core lineage. **Blockers**: Over-claiming (credibility); scope creep to production.
**Related Stakeholders**: Standards Reviewer (SD-2), Operator (SD-9).

### SD-2: Standards / Research Reviewer — standards fidelity that survives review

**Stakeholder**: Standards / Research Reviewer · **Driver Category**: COMPLIANCE (credibility)
**Driver Statement**: Every model element must be tagged to a versioned standard (GB922 v24.0, the RFCs, W3C SHACL); `[MODEL]` constructs must be promoted before publication, or the design fails panel/peer review.
**Context & Background**: Architecture-panel and journal credibility rests on authoritative-source discipline.
**Driver Intensity**: CRITICAL
**Enablers**: Provenance predicate to RDF; deviation report; named v24 relationships. **Blockers**: Unpromoted `[MODEL]` edges; minimal-OWL mistaken for full ABE.
**Related Stakeholders**: Lead Architect (SD-1), Assurance Architect (SD-7).

### SD-3: NOC / Second-line Support — close the symptom→cause gap

**Stakeholder**: NOC / Second-line Support · **Driver Category**: OPERATIONAL
**Driver Statement**: Move from a customer symptom to the causing network event quickly, and see who else is impacted, without manual correlation.
**Context & Background**: Today the symptom-to-cause association is manual and slow.
**Driver Intensity**: HIGH
**Enablers**: Place foundation; Q-CORRELATE. **Blockers**: Incomplete topology/joints; stale graph labels.
**Related Stakeholders**: Maintenance (SD-4), Assurance Architect (SD-7).

### SD-4: Network Change / Maintenance — see consequence before committing

**Stakeholder**: Network Change / Maintenance · **Driver Category**: RISK
**Driver Statement**: Know the service/forwarding-plane consequence of a management-plane change before commit, to avoid maintenance-induced outages (the Optus 000 failure mode).
**Context & Background**: Cross-plane consequences are invisible at service level until after the change.
**Driver Intensity**: CRITICAL
**Enablers**: Plane-aware routing; blast-radius reach; SHACL critical-service invariant. **Blockers**: Dead/silent feed read as "all clear"; over-claiming prevention.
**Related Stakeholders**: Security Lead (SD-5), NOC (SD-3).

### SD-5: Security & Governance Lead — autonomy must be governed, not blind

**Stakeholder**: Security & Governance Lead · **Driver Category**: RISK / governance
**Driver Statement**: Autonomy must be gated by reach; the controller must never author raw config; externally-triggered requests must be least-trusted (governed request only).
**Context & Background**: A system that can influence live network change must enforce a trust gradient and human-in-loop where reach is wide/critical.
**Driver Intensity**: HIGH
**Enablers**: Q-BLAST → autonomy level; plane separation; immutable audit. **Blockers**: Unbounded autonomy; config authored by the loop.
**Related Stakeholders**: DPO (SD-6), Maintenance (SD-4).

### SD-6: Data Protection Officer — no durable subscriber location

**Stakeholder**: DPO · **Driver Category**: COMPLIANCE (privacy)
**Driver Statement**: The system must not master durable per-subscriber location; live location is resolved on demand with TTL only — to satisfy GDPR / Malaysia PDPA data-minimisation.
**Context & Background**: Durable location PII is a regulatory and trust liability; privacy-by-default is non-negotiable (PRIN 6).
**Driver Intensity**: CRITICAL
**Enablers**: Schema + code enforcement of the transient boundary; store-inspection test. **Blockers**: A feature shortcut persisting subscriber location; un-TTL'd projection.
**Related Stakeholders**: Security Lead (SD-5), Operator (SD-9).

### SD-7: Assurance / Governance Architect — intent encoded and continuously validated

**Stakeholder**: Assurance / Governance Architect · **Driver Category**: OPERATIONAL
**Driver Statement**: Encode design invariants (geo-diversity, critical-service reachability, provisioning) as SHACL and have the network continuously validated against them in a closed loop.
**Context & Background**: Intent is implicit and unenforced today; SHACL makes it declarative and testable.
**Driver Intensity**: HIGH
**Enablers**: Fuseki SHACL; the monitor→assess loop; subscription-health precondition. **Blockers**: Validation-window staleness; dead subscription misread.
**Related Stakeholders**: Standards Reviewer (SD-2), Maintenance (SD-4).

### SD-8: L0 Feed Owner — preserve telemetry semantics end-to-end

**Stakeholder**: L0 Feed Owner (NMOP-adjacent) · **Driver Category**: STRATEGIC / collaboration
**Driver Statement**: Preserve YANG semantics from device to graph and address telemetry by the NMOP message-key scheme; keep this SID service/place twin clearly named apart from the YANG network-state twin.
**Context & Background**: The feed is the upstream precondition for observability; NMOP drafts define the addressing.
**Driver Intensity**: MEDIUM
**Enablers**: Message-key scheme; pinned draft revisions; clear twin naming. **Blockers**: Draft churn; twin-term collision.
**Related Stakeholders**: NMOP/Graf community, Assurance Architect (SD-7).

### SD-9: Target Operator — fewer outages, faster recovery, regulatory acceptability

**Stakeholder**: Target Operator (future) · **Driver Category**: CUSTOMER / FINANCIAL
**Driver Statement**: Reduce maintenance-induced outages and MTTR, with a privacy- and standards-acceptable solution — the basis for eventual procurement.
**Context & Background**: Outage and emergency-service exposure carry regulatory and reputational cost.
**Driver Intensity**: MEDIUM (future-facing this iteration)
**Enablers**: Demonstrated closed loop; standards fidelity; privacy posture. **Blockers**: Pattern unproven at carrier scale (out of scope now).
**Related Stakeholders**: Lead Architect (SD-1), DPO (SD-6).

---

## Driver-to-Goal Mapping

### Goal G-1: Deterministic symptom→cause + impact in one controller pass

**Derived From Drivers**: SD-3, SD-4, SD-9 · **Goal Owner**: Assurance Architect
**Goal Statement**: On the rig, a faulted resource yields its impacted services/customers/open interactions via `Q-CORRELATE` in a single controller pass, with no per-subscriber location.
**Why This Matters**: Satisfies the NOC's symptom→cause driver and the operator's MTTR driver.
**Success Metrics**: `Q-CORRELATE` returns a non-empty, correct impacted set. **Baseline**: manual correlation. **Target**: deterministic query result (rig demo). **Measurement**: controller output on seed.
**Dependencies**: L1 graph (FR-002), place foundation (DR-001/002). **Risks**: R-9 (stale labels), R-8 (dead feed).
**Traces to REQ**: BR-002, FR-007.

### Goal G-2: Geo-diversity SHACL invariant catches the seeded shared-section case

**Derived From Drivers**: SD-4, SD-7, SD-2 · **Goal Owner**: Assurance Architect
**Goal Statement**: The geo-diversity SHACL shape FAILS (flags a violation) on the seeded primary/backup shared-route-section case.
**Why This Matters**: Proves intent-as-SHACL value (the redundancy-that-isn't) — the headline assurance result.
**Success Metrics**: SHACL report shows the violation with focus node. **Baseline**: no intent enforcement. **Target**: violation flagged. **Measurement**: SHACL validation report.
**Dependencies**: L2 store (FR-003), shapes (FR-012). **Risks**: R-2 (`[MODEL]` fidelity).
**Traces to REQ**: BR-001, FR-008, FR-012.

### Goal G-3: Blast-radius → reach-graded autonomy recommendation

**Derived From Drivers**: SD-4, SD-5 · **Goal Owner**: Security & Governance Lead
**Goal Statement**: `Q-BLAST` produces a recommended autonomy level proportional to reach; wide-reach or critical-service cases force supervised mode.
**Why This Matters**: Satisfies the governance driver — autonomy is governed, not blind.
**Success Metrics**: Recommendation produced; supervised forced on wide/critical. **Baseline**: ungoverned. **Target**: reach-graded recommendation. **Measurement**: controller output.
**Dependencies**: L1 reach (FR-009), gate (FR-006/FR-013). **Risks**: R-4 (over-claim).
**Traces to REQ**: BR-003, FR-009, FR-013, NFR-SEC-002.

### Goal G-4: Zero durable per-subscriber location

**Derived From Drivers**: SD-6 · **Goal Owner**: DPO
**Goal Statement**: No per-subscriber serving location is persisted anywhere; live location is resolved on demand with TTL only.
**Why This Matters**: Satisfies the privacy driver; PDPA/GDPR data-minimisation.
**Success Metrics**: Store-inspection finds no durable subscriber location. **Baseline**: none (greenfield). **Target**: zero durable subscriber location. **Measurement**: schema + store inspection test.
**Dependencies**: §4.4 boundary (FR-014). **Risks**: R-7 (leakage).
**Traces to REQ**: BR-006, FR-014, NFR-C-001, DR-004.

### Goal G-5: Standards-defensible design

**Derived From Drivers**: SD-2, SD-1 · **Goal Owner**: Standards Reviewer
**Goal Statement**: Provenance traceability complete; `[MODEL]` civic/indoor edges promoted to named v24 relationships before publication; deviation report current.
**Why This Matters**: Satisfies the credibility driver — survives panel/peer review.
**Success Metrics**: No `[MODEL]` civic/indoor edges at publication; provenance tags in RDF. **Baseline**: `[MODEL]` edges present. **Target**: promoted + documented. **Measurement**: deviation report + RDF inspection.
**Dependencies**: §8 (NFR-C-003, DR-005). **Risks**: R-2, R-3.
**Traces to REQ**: BR-005, NFR-C-003, DR-005, DR-006.

### Goal G-6: Reproducible open rig

**Derived From Drivers**: SD-1, SD-8 · **Goal Owner**: Lead Architect
**Goal Statement**: `docker compose up` brings all services healthy from a clean checkout; Apache-2.0; NMOP draft revisions pinned.
**Why This Matters**: Satisfies the reproducibility/openness driver (Paper 2/3 lineage; collaboration).
**Success Metrics**: Clean bring-up; pinned drafts in README. **Baseline**: none. **Target**: one-command healthy rig. **Measurement**: compose health checks.
**Dependencies**: §9 build tasks. **Risks**: R-6 (draft churn).
**Traces to REQ**: BR-004, NFR-M-001, NFR-S-001.

---

## Goal-to-Outcome Mapping

### Outcome O-1: Faster, governed remediation demonstrated

**Supported Goals**: G-1, G-3
**Outcome Statement**: The rig demonstrates symptom→cause correlation and reach-graded autonomy in one pass — the basis for reduced MTTR and no-blind-change at an operator.
**Measurement Details**: KPI — controller produces impacted set + autonomy recommendation; Frequency — per demo; Data source — controller output; Report owner — Assurance Architect.
**Business Value**: Operational (faster MTTR), Customer (operator outage reduction), Strategic (pattern proof).
**Leading Indicators**: Q-CORRELATE/Q-BLAST return on seed. **Lagging Indicators**: operator interest / pilot.
**Stakeholder Benefits**: NOC (SD-3), Maintenance (SD-4), Operator (SD-9).

### Outcome O-2: Intent-as-SHACL proven and standards-defensible

**Supported Goals**: G-2, G-5
**Outcome Statement**: The seeded geo-diversity violation is caught, and the design carries complete standards provenance — accepted at architecture panel / publication.
**Measurement Details**: KPI — SHACL violation flagged + zero unpromoted `[MODEL]` edges at publication; Frequency — pre-publication; Report owner — Standards Reviewer.
**Business Value**: Strategic (citable reference), credibility.
**Leading Indicators**: SHACL FAILs on seed. **Lagging Indicators**: paper/panel acceptance.
**Stakeholder Benefits**: Standards Reviewer (SD-2), Lead Architect (SD-1), Assurance Architect (SD-7).

### Outcome O-3: Privacy-by-default proven

**Supported Goals**: G-4
**Outcome Statement**: No durable per-subscriber location exists anywhere — a PDPA/GDPR-acceptable posture.
**Measurement Details**: KPI — store-inspection passes (zero durable subscriber location); Frequency — per build + release; Report owner — DPO.
**Business Value**: Compliance (regulatory acceptability), trust.
**Leading Indicators**: schema enforces boundary. **Lagging Indicators**: DPO sign-off.
**Stakeholder Benefits**: DPO (SD-6), Operator (SD-9).

### Outcome O-4: Reproducible reference pattern adopted/cited

**Supported Goals**: G-6, G-1
**Outcome Statement**: The open rig is reproduced/cited as the location-anchored assurance pattern (ibn-core sibling; Paper 2/3 lineage).
**Measurement Details**: KPI — clean reproductions / citations; Frequency — ongoing; Report owner — Lead Architect.
**Business Value**: Strategic (reputation, SI pipeline).
**Leading Indicators**: clean `docker compose up`. **Lagging Indicators**: external reproductions / citations.
**Stakeholder Benefits**: Lead Architect (SD-1), L0 Feed Owner / NMOP (SD-8).

---

## Complete Traceability Matrix

### Stakeholder → Driver → Goal → Outcome

| Stakeholder | Driver ID | Driver Summary | Goal ID | Goal Summary | Outcome ID | Outcome Summary |
|-------------|-----------|----------------|---------|--------------|------------|-----------------|
| NOC / Second-line | SD-3 | Symptom→cause | G-1 | Deterministic correlation pass | O-1 | Governed remediation |
| Maintenance | SD-4 | Pre-commit consequence | G-2 | Geo-diversity SHACL catch | O-2 | Intent proven + defensible |
| Maintenance / Security | SD-4/SD-5 | Governed autonomy | G-3 | Reach-graded autonomy | O-1 | Governed remediation |
| Security Lead | SD-5 | Trust gradient / no blind autonomy | G-3 | Reach-graded autonomy | O-1 | Governed remediation |
| DPO | SD-6 | No durable subscriber location | G-4 | Zero durable location | O-3 | Privacy-by-default proven |
| Assurance Architect | SD-7 | Intent encoded + validated | G-2 | SHACL invariants | O-2 | Intent proven + defensible |
| Standards Reviewer | SD-2 | Standards fidelity | G-5 | Standards-defensible | O-2 | Intent proven + defensible |
| Lead Architect | SD-1 | Citable differentiating pattern | G-6 | Reproducible open rig | O-4 | Pattern adopted/cited |
| L0 Feed Owner | SD-8 | Preserve telemetry semantics | G-6 | Reproducible open rig | O-4 | Pattern adopted/cited |
| Target Operator | SD-9 | Fewer outages / MTTR | G-1 | Correlation pass | O-1 | Governed remediation |

### Conflict Analysis

**Competing Drivers** (mirrors REQ conflicts C-1..C-4 and risks R-1/R-2/R-4/R-7):

- **Conflict 1 — Standards fidelity vs rig pragmatism**: Standards Reviewer (SD-2, full v24 fidelity) vs Lead Architect/Project (minimal OWL + `[MODEL]` for a buildable rig).
  - **Resolution**: PHASE — minimal for the rig; promote `[MODEL]` edges + confirm OWL scope before publication (REQ C-4; R-2/R-3).
- **Conflict 2 — Privacy vs correlation/dispatch richness**: DPO (SD-6, no durable location) vs NOC/dispatch (SD-3, per-customer detail).
  - **Resolution**: COMPROMISE — master only static service-location; resolve live subscriber location on demand with TTL (REQ C-2; FR-014; R-7).
- **Conflict 3 — Autonomy/speed vs safety**: Operator/Lead Architect (SD-1/SD-9, auto self-healing) vs Security Lead (SD-5, gate).
  - **Resolution**: PHASE — reach-graded autonomy; auto for tight single-site, supervised for wide/critical (REQ C-3; NFR-SEC-002; R-4).
- **Conflict 4 — Compelling narrative vs accurate claim**: Lead Architect (SD-1, "prevents outages") vs reality (surfaces consequence pre-commit).
  - **Resolution**: Narrow the claim in all external artefacts (BR-001; R-4).
- **Conflict 5 — Two-store fit vs operational simplicity**: Lead Architect/Standards (fit) vs simplicity objection (R-1).
  - **Resolution**: ADR-001 (two stores, with documented single-store fallback).

**Synergies**:

- **DPO + Security Lead**: privacy boundary (SD-6) and trust gradient (SD-5) both pull toward least-data, least-trust — mutually reinforcing.
- **Standards Reviewer + Assurance Architect**: SHACL-as-intent (SD-7) is also the fidelity vehicle (SD-2) — one mechanism, two satisfied drivers.
- **NOC + Maintenance**: the place foundation serves both symptom→cause (SD-3) and pre-change reach (SD-4) — one graph, two operational drivers.
- **Lead Architect + L0 Feed Owner**: reproducible open rig (SD-1) and NMOP-aligned feed (SD-8) both advance the shared reference pattern.

---

## Communication & Engagement Plan

### Lead Architect / Standards Reviewer (Manage Closely)

**Primary Message**: The rig proves the pattern *and* stays standards-defensible. **Talking points**: closed-loop demo, provenance matrix, `[MODEL]` promotion plan. **Frequency**: continuous. **Channel**: ADRs + reviews. **Good news**: SHACL catch + panel acceptance.

### Security & Governance Lead / DPO (Manage Closely)

**Primary Message**: Autonomy is reach-gated and privacy is enforced in schema+code. **Talking points**: Q-BLAST gating, trust gradient, store-inspection test. **Frequency**: at gate/sign-off. **Channel**: review gates. **Good news**: zero durable location; supervised-on-critical proven.

### NOC / Maintenance / Assurance Architect / L0 Feed Owner (Keep Informed)

**Primary Message**: One graph answers symptom→cause and pre-change reach; the feed preserves YANG semantics. **Frequency**: demos / sprint reviews. **Channel**: demos, build updates. **Good news**: deterministic impact list; clean feed.

### Target Operator (Keep Satisfied)

**Primary Message**: Fewer blind changes, faster MTTR, privacy- and standards-acceptable. **Frequency**: outcome briefings. **Channel**: briefings. **Good news**: demonstrated closed loop.

---

## Change Impact Assessment

| Stakeholder | Current State | Future State | Change Magnitude | Resistance Risk | Mitigation |
|-------------|---------------|--------------|------------------|-----------------|------------|
| NOC / Second-line | Manual symptom→cause | Deterministic correlation | MEDIUM | LOW | Demos; keep query UX simple |
| Maintenance | Blind to cross-plane consequence | Pre-commit reach gate | MEDIUM | LOW | Show gate value early |
| Security Lead | Ungoverned autonomy concern | Reach-graded gate | LOW | LOW | Co-design the gate |
| DPO | Privacy concern | Enforced transient boundary | LOW | LOW | Store-inspection evidence |
| Standards Reviewer | Fidelity concern | Provenance + promotion | MEDIUM | MEDIUM | Promotion plan + deviation report |

### Change Readiness

**Champions**: Lead Architect (SD-1), Assurance Architect (SD-7) — own the vision.
**Fence-sitters**: Standards Reviewer — convinced by provenance + `[MODEL]` promotion; Operator — convinced by a credible demo.
**Resisters**: none identified; the two-store-simplicity objection (R-1) is a critique, not opposition.

---

## Risk Register (Stakeholder-Related)

> Full treatment in `ARC-006-RISK-v1.0`; the stakeholder-facing subset:

### Risk R-1 (stakeholder): Standards-credibility loss from unpromoted `[MODEL]` edges

**Related Stakeholders**: Standards Reviewer, Lead Architect · **Impact on Goals**: G-5, G-2 · **Probability**: HIGH · **Impact**: MEDIUM · **Mitigation**: promote before publication (RISK R-2) · **Contingency**: scope claims to the minimal model explicitly.

### Risk R-2 (stakeholder): Privacy-boundary breach erodes DPO/operator trust

**Related Stakeholders**: DPO, Operator · **Impact on Goals**: G-4 · **Probability**: LOW (after controls) · **Impact**: HIGH · **Mitigation**: schema+code enforcement + test (RISK R-7) · **Contingency**: halt; purge; DPO review.

### Risk R-3 (stakeholder): Over-claiming damages reputation

**Related Stakeholders**: Lead Architect, Operator · **Impact on Goals**: G-3, O-1 · **Probability**: MEDIUM · **Impact**: MEDIUM · **Mitigation**: narrow-claim review gate (RISK R-4) · **Contingency**: correct messaging promptly.

---

## Governance & Decision Rights

### Decision Authority Matrix (RACI)

| Decision Type | Responsible | Accountable | Consulted | Informed |
|---------------|-------------|-------------|-----------|----------|
| Data-store topology (two-store) | Project Team | Lead Architect | Standards Reviewer | All |
| Standards fidelity / `[MODEL]` promotion | Project Team | Standards Reviewer | Lead Architect | All |
| Privacy boundary enforcement | Project Team | DPO | Security Lead | All |
| Autonomy policy / gate | Assurance Architect | Security & Governance Lead | Lead Architect | NOC, Maintenance |
| Feed scheme (message-key) | L0 Feed Owner | Lead Architect | NMOP-adjacent | Project Team |
| Publication / external claims | Lead Architect | Lead Architect | Standards Reviewer, DPO | All |

### Escalation Path

1. **Level 1**: Assurance Architect / Project Team (day-to-day).
2. **Level 2**: Lead Architect (scope, conflicts, decisions/ADRs).
3. **Level 3**: Vpnet Enterprise Architecture Review Board (strategic / cross-project; standards-credibility disputes).

---

## Validation & Sign-off

### Stakeholder Review

| Stakeholder | Review Date | Comments | Status |
|-------------|-------------|----------|--------|
| Lead Architect | [PENDING] | | [PENDING] |
| Standards Reviewer | [PENDING] | | [PENDING] |
| DPO | [PENDING] | | [PENDING] |
| Security & Governance Lead | [PENDING] | | [PENDING] |

### Document Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Project Sponsor / Lead Architect | Roland Pfeifer | | [PENDING] |
| Standards/Research Reviewer | [PENDING] | | [PENDING] |
| Data Protection Officer | [PENDING] | | [PENDING] |

---

## Appendices

### Appendix A: Stakeholder Interview Summaries

No formal interviews conducted; drivers are inferred from the HLD and requirements. Validate with named stakeholders at first review (this is a retro-fitted STKE for an open reference rig).

### Appendix B: Survey Results

Not applicable.

### Appendix C: References

- HLD v0.1: `external/location_assurance_twin_HLD.md`
- Requirements: `ARC-006-REQ-v1.0.md` (stakeholder table, conflicts)
- ADR-001: `decisions/ARC-006-ADR-001-v1.0.md`
- Risk Register: `ARC-006-RISK-v1.0.md`
- Principles: `projects/000-global/ARC-000-PRIN-v1.0.md`

## External References

> Traceability from generated content back to source documents.

### Document Register

| Doc ID | Filename | Type | Source Location | Description |
|--------|----------|------|-----------------|-------------|
| LATH | location_assurance_twin_HLD.md | High-Level Design | 006-location-assurance-twin/external/ | Source for stakeholder drivers (§1.2 problem, §5 use case, §7 governance, §11 relationships, §12 risks) |
| REQ006 | ARC-006-REQ-v1.0.md | Requirements | 006-location-assurance-twin/ | Stakeholder table + conflict log |
| RISK006 | ARC-006-RISK-v1.0.md | Risk Register | 006-location-assurance-twin/ | Stakeholder-related risks |

### Citations

| Citation ID | Doc ID | Page/Section | Category | Quoted Passage |
|-------------|--------|--------------|----------|----------------|
| LATH-C1 | LATH | §1.2 | Stakeholder Need | "second-line support cannot associate a customer symptom with the network event that caused it" (SD-3) |
| LATH-C2 | LATH | §7 | Stakeholder Need | "Autonomy gating: blast radius drives the autonomy level; cross-jurisdiction or critical-service reach forces human-in-loop." (SD-5) |
| LATH-C3 | LATH | §4.4 | Stakeholder Need | "Never durable: live per-subscriber serving location — resolved on demand, projected with TTL … never master data." (SD-6) |
| LATH-C4 | LATH | §2 P2 / §12 R2 | Stakeholder Need | "every model element tagged to a versioned standard" / promote `[MODEL]` edges before paper/panel (SD-2) |
| LATH-C5 | LATH | §11 | Stakeholder Need | "ibn-core — intent lineage (RFC 9315); this twin is the assurance consumer" / "name them apart" (SD-1, SD-8) |

### Unreferenced Documents

| Filename | Source Location | Reason |
|----------|-----------------|--------|
| location_twin_v24.cypher | 006-location-assurance-twin/external/ | Build seed; not a stakeholder-driver source |
| LOCATION_RESOURCE_SERVICE_PART_INTERACTION.pdf | 006-location-assurance-twin/external/ | Reference graphic |
| tmf_pyramid_digital_twin.svg | 006-location-assurance-twin/external/ | Positioning graphic |

---

**Generated by**: ArcKit `/arckit:stakeholders` command
**Generated on**: 2026-06-17
**ArcKit Version**: 5.11.0
**Project**: location-assurance-twin (Project 006)
**Model**: Claude Opus 4.8 (1M context)
**Generation Context**: Retro-fitted from HLD v0.1 + ARC-006-REQ-v1.0 (stakeholder table, conflicts) + ARC-006-RISK-v1.0. Open reference-rig; GovS roles N/A. Closes TRAC GAP-003 (backward stakeholder-goal traceability).

<!-- arckit-provenance:start -->

## Build Provenance

_Stamped automatically by the ArcKit plugin's `provenance-stamp.mjs` PostToolUse hook. Complements (does not replace) the human-authored footer above. Carries only fields the model can't authoritatively self-report: build context from `.arckit/state.json` and effort levels derived from command frontmatter + the silent-downgrade matrix._

| Field | Value |
|-------|-------|
| Requested Effort | `high` |
| Effective Effort | _unknown — model not parsed from existing footer_ |
| Stamped at | 2026-06-17T18:37:51.193Z |

<!-- arckit-provenance:end -->
