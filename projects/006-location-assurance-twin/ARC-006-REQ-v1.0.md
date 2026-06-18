# Project Requirements: location-assurance-twin

> **Template Origin**: Official | **ArcKit Version**: 5.11.0 | **Command**: `/arckit:requirements`

## Document Control

| Field | Value |
|-------|-------|
| **Document ID** | ARC-006-REQ-v1.0 |
| **Document Type** | Business and Technical Requirements |
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
| **Distribution** | Project Team, Architecture Team |

## Revision History

| Version | Date | Author | Changes | Approved By | Approval Date |
|---------|------|--------|---------|-------------|---------------|
| 1.0 | 2026-06-17 | ArcKit AI | Initial creation from `/arckit:requirements` command; extracted from external HLD v0.1 (`location_assurance_twin_HLD.md`) | [PENDING] | [PENDING] |

## Document Purpose

This document defines the business and technical requirements for **location-assurance-twin**, derived from the external High-Level Design (HLD v0.1) [LATH-C1]. It is the authoritative requirements baseline for architecture review (ArcKit), build (Claude Code), and the standards/provenance traceability the design demands. Requirements are tagged to the versioned standards that anchor them (TM Forum SID GB922 v24.0, IETF RFCs, W3C SHACL) per the project's authoritative-source discipline.

> **Input gaps (flagged):** No Stakeholder Analysis (STKE), Risk Register (RISK), or Business Case (SOBC) artifact exists for Project 006 yet. Stakeholder rows and the Risk section below are derived from the HLD; run `/arckit:stakeholders` and `/arckit:risk` to formalise them. Global Architecture Principles (`ARC-000-PRIN-v1.0`) were available and are referenced for NFR alignment.

---

## Executive Summary

### Business Context

Maintenance-induced and configuration-induced outages recur in carrier networks because a management-plane change can have an unmodelled forwarding-plane consequence that is invisible at service level, and because second-line support cannot reliably associate a customer symptom with the network event that caused it [LATH-C2]. The motivating evidence is the Optus "000" emergency-call outage of 18 September 2025 (public inquiry) [LATH-C3]. location-assurance-twin is a location-anchored, closed-loop assurance system that consumes semantically-typed network telemetry, maintains a live operational graph of *what is where*, validates the network against declared intent, and computes the *reach* of any fault or proposed change **before** action is taken — so remediation is correlated and governed, not blind [LATH-C1].

It is the assurance-consumer sibling of **ibn-core** (RFC 9315 intent lineage) and a peer to the resource-intent-agent (Project 004): where those projects drive intent *fulfilment*, this project closes the *assurance* loop with a location/place foundation. It is deliberately open and reproducible (Apache-2.0, docker-compose proof rig) [LATH-C4].

### Objectives

- Provide service-level **causal observability** — bind a customer symptom to the network event that caused it, via a location/place foundation.
- Provide a **pre-change reach (blast-radius) gate** that governs the autonomy level of any remediation before it acts.
- Validate the live network against **declared intent** (SHACL invariants) — geo-diversity, critical-service reachability, provisioning correctness.
- Preserve **telemetry semantics end-to-end** (YANG meaning carried from device to graph) and **standards provenance** (every model element tagged to a versioned standard).
- Deliver an **open, reproducible reference implementation** that proves the pattern (not a production system).

### Expected Outcomes

- Closed-loop self-healing demonstrated on the rig: detect → correlate → validate → blast-radius → gate → act → verify, with autonomy auto-graded by reach [LATH-C5].
- A seeded shared-route-section case is **caught** by the geo-diversity SHACL invariant (the redundancy-that-isn't), demonstrating intent validation value.
- Zero durable per-subscriber location persisted anywhere — privacy-by-default proven in schema and code [LATH-C6].
- A standards/provenance traceability matrix that withstands architecture-panel and publication review (Paper 2 / Paper 3 lineage).

### Project Scope

**In Scope**:

- L0 semantic feed: YANG-Push → broker, typed and addressable (message-key scheme).
- L1 operational correlation graph (Neo4j LPG, SID Location foundation + the six v24 joints + topology).
- L2 model/intent store (Apache Jena Fuseki: YANG-derived RDF/OWL + SHACL intent shapes).
- L3 semantic bridge (Neosemantics / n10s, uni-directional).
- L4 closed-loop controller (MAPE-K) and the L5 governance/security gate.
- A docker-compose proof rig and the deterministic query set (Q-CORRELATE, Q-SRLG, Q-BLAST, Q-PROACTIVE, Q-DISPATCH).

**Out of Scope** (this iteration) [LATH-C7]:

- Production HA / scale-out.
- Multi-operator federation (deferred to the ibn-core v4.0.0 / GSMA Open Gateway roadmap).
- Automated execution into live carrier control/management planes (the controller recommends and gates; it does not push to production network elements).
- Procedural / change-management (human/organisational) controls — explicitly an organisational concern.

---

## Stakeholders

> Derived from the HLD; not yet validated by a formal STKE artifact.

| Stakeholder | Role | Organization | Involvement Level |
|-------------|------|--------------|-------------------|
| Roland Pfeifer | Lead Architect / Document Owner | Vpnet Cloud Solutions | Decision maker, technical oversight |
| Network Assurance Lead | Product owner (assurance outcomes) | Operator (target) | Requirements definition |
| Second-line Support / NOC | End-user representative (symptom→cause) | Operator (target) | User acceptance |
| Network Change / Maintenance | End-user representative (pre-change gate) | Operator (target) | User acceptance |
| Security & Governance Lead | Security / autonomy-gating review | Vpnet / Operator | Security review |
| Data Protection Officer | Privacy boundary (no durable per-subscriber location) | Vpnet / Operator | Compliance review |
| Standards/Research reviewer | Architecture panel / paper review | IETF NMOP / TM Forum / academic | Technical assurance |

---

## Business Requirements

### BR-001: Prevent recurrence of cross-plane "invisible consequence" outages

**Description**: The system must surface the forwarding-plane (data/control/management) consequence of a proposed or actual management-plane change **before** commit, so that maintenance-induced outages with unmodelled service impact are prevented from proceeding blind [LATH-C2].

**Rationale**: This is the central failure mode evidenced by the Optus 000 incident [LATH-C3]; it is the project's reason to exist.

**Success Criteria**:

- For a seeded management-plane change with a modelled forwarding-plane consequence, the system surfaces that consequence pre-commit.
- The claim is held narrow: the architecture *surfaces consequence*; it does not execute a skipped human procedure (see Conflict C-3, Risk R-4).

**Priority**: MUST_HAVE
**Stakeholder**: Network Change / Maintenance; Lead Architect

---

### BR-002: Service-level causal observability (symptom → cause)

**Description**: The system must let second-line support associate a customer-visible symptom with the network event that caused it, by traversing the location/place foundation (fault → place → impacted services → customers) [LATH-C2].

**Rationale**: Closes the second-line correlation gap; this is the operational spine (Paper 2).

**Success Criteria**:

- `Q-CORRELATE` returns the impacted services, customers, and open interactions for a given faulted resource.

**Priority**: MUST_HAVE
**Stakeholder**: Second-line Support / NOC

---

### BR-003: Governed remediation via a pre-change reach gate

**Description**: The system must compute the blast radius of a fault or proposed change and use it to gate the **autonomy level** of remediation (auto vs human-in-the-loop) [LATH-C5].

**Rationale**: Remediation must be correlated and governed, not blind; reach is the governance signal.

**Success Criteria**:

- `Q-BLAST` returns a recommended autonomy level; wide-reach or critical-service cases force supervised mode.

**Priority**: MUST_HAVE
**Stakeholder**: Security & Governance Lead

---

### BR-004: Open, reproducible reference implementation

**Description**: The system must be delivered as an open (Apache-2.0), reproducible docker-compose rig with no closed dependencies — a pattern proof, not a production deployment [LATH-C4].

**Rationale**: Reproducibility and openness underpin the academic lineage (Paper 2 / Paper 3) and the ibn-core open posture.

**Success Criteria**:

- `docker compose up` brings all services healthy from a clean checkout; Apache-2.0 headers present; no closed dependencies in the rig.

**Priority**: MUST_HAVE
**Stakeholder**: Lead Architect; Standards/Research reviewer

---

### BR-005: Standards & provenance discipline

**Description**: Every model element must be tagged to a versioned authoritative standard (GB922 v24.0, the relevant RFCs/W3C), and modelling-convenience constructs must be explicitly marked (`[MODEL]`) and distinguishable from authoritative ones (`[SID v24]`) [LATH-C8].

**Rationale**: Source discipline is a review hook; it is what makes the design defensible at an architecture panel or in publication.

**Success Criteria**:

- A standards/provenance traceability matrix exists; provenance tags are carried through to the RDF; deviations are recorded in a deviation report.

**Priority**: MUST_HAVE
**Stakeholder**: Standards/Research reviewer

---

### BR-006: Privacy-by-default posture

**Description**: The system must operate without mastering durable per-subscriber location, to remain acceptable under data-minimisation regimes (GDPR / Malaysia PDPA) [LATH-C6].

**Rationale**: Privacy-by-default (HLD principle P4) is both an ethical and a regulatory requirement and aligns with PRIN 6 (Data Sovereignty).

**Success Criteria**:

- No per-subscriber serving location persisted anywhere; live location is resolved on demand with TTL only.

**Priority**: MUST_HAVE
**Stakeholder**: Data Protection Officer

---

## Functional Requirements

### User Personas

#### Persona 1: NOC / Second-line Support Engineer

- **Role**: Diagnoses customer-impacting incidents.
- **Goals**: Move from a customer symptom to the causing network event quickly; know who else is affected.
- **Pain Points**: Cannot associate symptom with cause; impact lists are manual and slow.
- **Technical Proficiency**: Medium–High.

#### Persona 2: Network Change / Maintenance Engineer

- **Role**: Plans and executes management-plane changes.
- **Goals**: Know the service/forwarding-plane consequence of a change before committing it.
- **Pain Points**: Cross-plane consequences are invisible at service level until after the change.
- **Technical Proficiency**: High.

#### Persona 3: Assurance / Governance Architect

- **Role**: Owns autonomy policy and intent invariants.
- **Goals**: Encode design invariants (geo-diversity, reachability) and have the network continuously validated against them; gate autonomy by reach.
- **Pain Points**: Intent is implicit and unenforced; autonomy is ungoverned.
- **Technical Proficiency**: High.

---

### Use Cases

#### UC-1: Governed self-healing (anchor use case)

**Actor**: Closed-loop controller (on behalf of the Assurance/Governance Architect)

**Preconditions**:

- L1 operational graph loaded with SID Location instances, the six v24 joints, and topology.
- L2 intent shapes loaded; L0 feed delivering typed YANG-Push records.

**Main Flow** [LATH-C5]:

1. Controller detects a fault (a faulted resource appears in the feed).
2. System correlates the fault to impacted services / customers / open interactions via the place foundation (`Q-CORRELATE`).
3. System validates the impacted subgraph against declared intent (serialise L1 subgraph → SHACL validate in L2).
4. System computes blast radius (`Q-BLAST`) and derives a recommended autonomy level.
5. Governance gate routes the action by plane and autonomy level; tight single-site faults proceed auto, wide or critical-service faults require human-in-the-loop.
6. System acts within bounds (recommendation in this iteration; not live execution) and verifies the outcome.

**Postconditions**:

- Impacted-service/customer list produced; intent verdict produced; autonomy recommendation recorded with a correlation id in the immutable audit.

**Alternative Flows**:

- **Alt 4a**: If blast radius crosses jurisdiction or touches a critical service, force supervised mode regardless of size.

**Exception Flows**:

- **Ex 1**: If the feed subscription is unhealthy, the controller must not treat absence of change as conformance (a precondition for acting).

**Business Rules**:

- The controller never authors free-form config.
- Externally-triggered requests may only create a governed request, never act directly.

**Priority**: CRITICAL

---

### Functional Requirements Detail

#### FR-001: L0 — Semantic telemetry feed

**Description**: The system must subscribe to device YANG-Push streams and write **semantically-typed** records to a message broker, addressable by subscription / xpath / element via a message-key scheme, so a consumer can pull only the slice it needs [LATH-C9].

**Relates To**: BR-002, UC-1, INT-001

**Acceptance Criteria**:

- [ ] Given a YANG-Push notification, when it is published to the broker, then the record preserves its YANG semantics and is keyed per the message-key scheme.
- [ ] Given a consumer requesting a scoped slice (xpath/element), when it subscribes, then it receives only the matching records.
- [ ] Rig may stub devices via Netopeer2/Sysrepo.

**Data Requirements**: Inputs: YANG-Push `push-update`/`push-change-update` notifications. Outputs: typed broker records (YANG-in-broker). Validations: message-key conforms to the NMOP draft scheme.

**Priority**: MUST_HAVE | **Complexity**: HIGH | **Dependencies**: INT-001 | **Assumptions**: NMOP message-key draft revision pinned (Risk R-6).

---

#### FR-002: L1 — Operational correlation graph

**Description**: The system must maintain a live property-graph (Neo4j LPG) of SID Location ABE instances (Place tree, civic + geodetic), the six v24 cross-domain joints, and topology, optimised for traversal fault → place → services → customers → blast radius [LATH-C10].

**Relates To**: BR-001, BR-002, UC-1, DR-001, DR-002

**Acceptance Criteria**:

- [ ] Given the seed dataset, when loaded, then the deterministic "zero-X" queries return non-empty rows.
- [ ] Given a faulted resource, when traversed, then impacted places/services/customers are reachable in-graph.

**Data Requirements**: See DR-001, DR-002. Inputs: instances + joints + topology. Outputs: traversable impact subgraphs.

**Priority**: MUST_HAVE | **Complexity**: HIGH | **Dependencies**: DR-001, DR-002 | **Assumptions**: rig-scale graph.

---

#### FR-003: L2 — Model / intent store (RDF/OWL + SHACL)

**Description**: The system must hold the SID Location ontology (RDF/OWL) plus a YANG-derived config model, and SHACL shapes expressing design invariants, in Apache Jena Fuseki [LATH-C11].

**Relates To**: BR-005, FR-012, DR-003, DR-006

**Acceptance Criteria**:

- [ ] Given the ontology, when loaded, then classes/joints carry GB922 v24.0 provenance.
- [ ] Given an impacted subgraph, when POSTed to Fuseki, then SHACL validation returns a conformance verdict.

**Priority**: MUST_HAVE | **Complexity**: HIGH | **Dependencies**: DR-003, DR-006.

---

#### FR-004: L3 — Semantic bridge (n10s), uni-directional

**Description**: The system must bridge the two stores with Neosemantics (n10s): Fuseki → Neo4j to import the ontology so labels resolve to GB922 class names, and Neo4j → Fuseki to serialise an impacted subgraph for SHACL validation — with **no shared mastership** [LATH-C12].

**Relates To**: BR-005, DR-003, INT-002, NFR-D-001

**Acceptance Criteria**:

- [ ] Given n10s init, when run, then twin labels resolve to `sid:` classes.
- [ ] Bridge is uni-directional; no fact is mastered in both stores.

**Priority**: MUST_HAVE | **Complexity**: MEDIUM | **Dependencies**: INT-002.

---

#### FR-005: L4 — Closed-loop controller (MAPE-K)

**Description**: The system must run a MAPE-K closed loop — detect → correlate → validate → blast-radius → (gate) → act → verify — that orchestrates the queries and validation, emits the autonomy recommendation, and **never authors free-form config** [LATH-C5].

**Relates To**: BR-001, BR-003, UC-1, NFR-SEC-004

**Acceptance Criteria**:

- [ ] Given a faulted resource, when one controller pass runs, then it outputs impacted services/customers/tickets, SHACL violations, and a `Q-BLAST` autonomy recommendation.
- [ ] The controller emits no free-form device configuration.

**Priority**: MUST_HAVE | **Complexity**: HIGH | **Dependencies**: FR-002, FR-003, FR-004.

---

#### FR-006: L5 — Governance / security gate

**Description**: The system must route actions by plane, gate autonomy from blast radius, enforce the privacy boundary, and write an immutable audit record with a correlation id for every loop action [LATH-C13].

**Relates To**: BR-003, BR-006, NFR-SEC-001, NFR-SEC-002, NFR-C-002

**Acceptance Criteria**:

- [ ] Every loop action produces a correlation-id-linked, immutable audit entry.
- [ ] Actions are classified by plane (M/C/F) and routed accordingly.

**Priority**: MUST_HAVE | **Complexity**: MEDIUM | **Dependencies**: FR-005.

---

#### FR-007: Q-CORRELATE — fault to impact

**Description**: A deterministic L1 query mapping a fault → place → impacted services / customers / open interactions [LATH-C14].

**Relates To**: BR-002, UC-1
**Acceptance Criteria**: Given a faulted resource, returns the impacted set with no per-subscriber location.
**Priority**: MUST_HAVE | **Complexity**: MEDIUM

---

#### FR-008: Q-SRLG — geo-diversity / shared-risk detection

**Description**: A deterministic L1 query detecting that a backup sharing a route section with its primary is not truly redundant (shared-risk link group) [LATH-C14].

**Relates To**: BR-001, FR-012
**Acceptance Criteria**: Given a seeded shared-section case, identifies the shared risk.
**Priority**: MUST_HAVE | **Complexity**: MEDIUM

---

#### FR-009: Q-BLAST — blast radius to autonomy level

**Description**: A deterministic L1 query computing blast radius and mapping it to a recommended autonomy level [LATH-C14].

**Relates To**: BR-003, UC-1
**Acceptance Criteria**: Returns a recommended autonomy level proportional to reach.
**Priority**: MUST_HAVE | **Complexity**: MEDIUM

---

#### FR-010: Q-PROACTIVE — external area event to exposure

**Description**: A deterministic L1 query mapping an external area event to exposed sites/services before an alarm fires [LATH-C14].

**Relates To**: BR-002
**Acceptance Criteria**: Given an area event, returns exposed sites/services pre-alarm.
**Priority**: SHOULD_HAVE | **Complexity**: MEDIUM

---

#### FR-011: Q-DISPATCH — nearest stock + indoor location for truck-roll

**Description**: A deterministic L1 query returning nearest stock + address + indoor location for dispatch [LATH-C14].

**Relates To**: BR-002, DR-002 (StockLocation joint)
**Acceptance Criteria**: Returns nearest stock and civic/indoor location for a dispatch target.
**Priority**: SHOULD_HAVE | **Complexity**: MEDIUM

---

#### FR-012: SHACL intent shapes

**Description**: The system must express declared intent as SHACL shapes: geo-diversity (primary/backup share zero route sections), critical-service reachability (e.g. emergency-call path survives any single element isolation — the Optus invariant), and provisioning correctness (a service has its required place binding) [LATH-C15].

**Relates To**: BR-001, BR-005, FR-003

**Acceptance Criteria**:

- [ ] The geo-diversity shape MUST FAIL (flag a violation) on the seeded shared-route-section case.
- [ ] The critical-service reachability shape validates survival under single-element isolation.
- [ ] The provisioning shape flags a service missing its required place binding.

**Priority**: MUST_HAVE | **Complexity**: HIGH | **Dependencies**: FR-003.

---

#### FR-013: Autonomy modes (auto vs supervised)

**Description**: The same closed loop must run automatically for a tight single-site fault and in supervised (human-in-the-loop) mode for a wide-reach or critical-service fault [LATH-C5].

**Relates To**: BR-003, NFR-SEC-002
**Acceptance Criteria**: Mode is selected by blast radius/criticality, not hard-coded per fault.
**Priority**: MUST_HAVE | **Complexity**: MEDIUM

---

#### FR-014: On-demand transient subscriber-location resolution

**Description**: Where live per-subscriber serving location is required, it must be resolved on demand and projected with a TTL by a short-lived job — never written as master data [LATH-C6].

**Relates To**: BR-006, DR-004, NFR-C-001
**Acceptance Criteria**: No per-subscriber location persists beyond its TTL; nothing per-subscriber is master data.
**Priority**: MUST_HAVE | **Complexity**: MEDIUM

---

#### FR-015: Deviation report

**Description**: The build must produce a deviation report recording approximations, any SID class approximated in OWL, and whether the `[MODEL]` civic/indoor edges were promoted to the named v24 relationships [LATH-C16].

**Relates To**: BR-005, DR-005, DR-006
**Acceptance Criteria**: A deviation report exists and is current at build completion.
**Priority**: SHOULD_HAVE | **Complexity**: LOW

---

## Non-Functional Requirements (NFRs)

### Performance Requirements

#### NFR-P-001: Correlation traversal latency

**Requirement**: Multi-hop impact traversal in L1 (fault → place → services → customers → blast radius) must return within interactive latency on the rig-scale graph [LATH-C17].

**Measurement Method**: Time `Q-CORRELATE` / `Q-BLAST` on the seed dataset.
**Load Conditions**: Rig-scale graph (proof rig, not carrier-scale).
**Priority**: HIGH — aligns with PRIN 12 (Performance).

---

#### NFR-P-002: Causal (not black-box) detection signal

**Requirement**: The feed must carry causal (data-plane) signal, not only black-box/aggregate metrics; active probes are complementary only [LATH-C18].

**Rationale**: Symptom→cause correlation requires the causing signal to be observable, not inferred from aggregates alone.
**Priority**: HIGH.

---

### Availability and Resilience Requirements

#### NFR-A-001: Observability redundancy (4-way)

**Requirement**: The observed system must be covered across data, control, and management sub-planes plus an outside-in view, such that an incident is detectable if at least one of the four vantage points observes it [LATH-C19].

**Measurement Method**: Demonstrate detection with any single vantage point disabled.
**Priority**: HIGH — aligns with PRIN 2 (Resilience), PRIN 5 (Observability).

---

#### NFR-A-002: Subscription-health precondition

**Requirement**: The controller must treat feed-subscription health as a precondition for ACTING; absence of change on a dead subscription must not be interpreted as conformance.

**Rationale**: Prevents a silent-feed false "all clear" (a closed-loop safety property).
**Priority**: HIGH.

---

### Scalability Requirements

#### NFR-S-001: Feed partitioning / scoped consumption

**Requirement**: The feed must scale by broker partitioning via the YANG message-key hash+modulo scheme (NMOP draft), with consumers pulling only scoped slices [LATH-C20].

**Growth Projections**: Rig demonstrates the mechanism; carrier-scale validation is out of scope this iteration.
**Priority**: MEDIUM — aligns with PRIN 1 (Scalability), PRIN 11 (Async Communication).

---

### Security Requirements

#### NFR-SEC-001: Plane separation and pre-commit cross-plane disclosure

**Requirement**: Each action must be classified by plane (Management / Control / Forwarding); a management-plane change with a forwarding-plane consequence must surface that consequence **pre-commit** [LATH-C21].

**Vocabulary note**: "forwarding plane" follows the Graf/NMOP umbrella usage (observed system spanning data + control + management sub-planes) — distinct from the 3GPP user-plane; state which when crossing audiences (Decision D10).
**Priority**: CRITICAL — aligns with PRIN 4 (Security by Design).

---

#### NFR-SEC-002: Autonomy gating by reach

**Requirement**: Blast radius must drive the autonomy level; cross-jurisdiction or critical-service reach must force human-in-the-loop [LATH-C22].

**Priority**: CRITICAL — aligns with PRIN 4.

---

#### NFR-SEC-003: Trust gradient for externally-triggered requests

**Requirement**: Any externally-triggered request (chatbot, ticket) is least-trusted: it may only create a governed request, never author config; authorization binds to the authenticated subject [LATH-C23].

**Priority**: CRITICAL — aligns with PRIN 4 (zero-trust, least privilege).

---

#### NFR-SEC-004: Controller authors no raw config; OAuth on control-plane reach

**Requirement**: The controller must never author raw device configuration; where a control-plane is reached, access must be OAuth-secured [LATH-C24].

**Priority**: CRITICAL — aligns with PRIN 4, PRIN 9 (clean seam).

---

#### NFR-SEC-005: Secrets hygiene

**Requirement**: No secrets in code or committed configuration; rig secrets live only in a gitignored `.env` (`NEO4J_AUTH`, etc.) [LATH-C25].

**Priority**: CRITICAL — aligns with PRIN 4 (secrets management).

---

### Compliance and Regulatory Requirements

#### NFR-C-001: Privacy by default (data minimisation)

**Requirement**: GDPR / Malaysia PDPA data-minimisation must be honoured: the P4 transient boundary is enforced in both schema and code; no durable per-subscriber location exists [LATH-C6].

**Data Retention**: Live per-subscriber location is TTL-bounded and resolved on demand only.
**Priority**: CRITICAL — aligns with PRIN 6 (Data Sovereignty).

---

#### NFR-C-002: Immutable, correlated audit

**Requirement**: Every loop action must produce a non-repudiable, immutable audit record threaded with a correlation id across all layers [LATH-C26].

**Log Integrity**: Tamper-evident; correlation id links feed → graph → verdict → action.
**Priority**: CRITICAL — aligns with PRIN 5 (Observability), PRIN 6.

---

#### NFR-C-003: Standards provenance traceability

**Requirement**: Every model element must carry provenance to a versioned standard; `[SID v24]` (authoritative) must be distinguishable from `[MODEL]` (modelling convenience), traceable through to the RDF [LATH-C8].

**Priority**: HIGH — aligns with PRIN 7 (Data Quality & Lineage), PRIN 3 (Standards Conformance).

---

### Maintainability and Supportability Requirements

#### NFR-M-001: Reproducibility

**Requirement**: The rig must be reproducible via docker-compose, Apache-2.0 licensed, with no closed dependencies; GB922 v24.0 stamped in the ontology and README [LATH-C4].

**Priority**: HIGH — aligns with PRIN 14 (Maintainability), PRIN 15 (IaC), BR-004.

---

#### NFR-M-002: Correlation-id observability across layers

**Requirement**: A correlation id must be threaded across L0→L5 so any loop instance is traceable end-to-end.

**Priority**: HIGH — aligns with PRIN 5 (Observability).

---

### Data Integrity Requirements

#### NFR-D-001: Single source of truth (no fact mastered twice)

**Requirement**: Each fact must have exactly one master store; the bridge must be uni-directional with no shared mastership [LATH-C27].

**Priority**: CRITICAL — aligns with PRIN 8 (Single Source of Truth), HLD principle P1.

---

## Integration Requirements

### INT-001: Device YANG-Push feed → broker

**Purpose**: Ingest semantically-typed network telemetry.
**Integration Type**: Event-driven (subscription → broker).
**Data Exchanged**: From network elements to the system — YANG-Push `push-update`/`push-change-update` notifications → typed broker records.
**Integration Pattern**: Pub/sub over Kafka/Redpanda; addressable via the NMOP message-key scheme.
**Authentication**: Device/subscription auth; OAuth where a control-plane is reached (NFR-SEC-004).
**Standards**: RFC 8639 / RFC 8641 (+ RFC 8640 transport); `draft-netana-nmop-yang-message-broker-message-key-00` [LATH-C9].
**Error Handling**: Subscription-health precondition (NFR-A-002).
**Owner**: L0 feed component.
**Priority**: CRITICAL

---

### INT-002: Neo4j ↔ Fuseki semantic bridge (n10s)

**Purpose**: Share vocabulary without sharing mastership.
**Integration Type**: Library-mediated (Neosemantics), uni-directional both ways (import ontology; export impacted subgraph).
**Data Exchanged**: Fuseki → Neo4j ontology labels; Neo4j → Fuseki impacted subgraph (RDF) for SHACL.
**Authentication**: Internal rig (`.env` credentials).
**Standards**: W3C RDF/OWL; shared SID namespace.
**Priority**: CRITICAL

---

### INT-003: ibn-core / RFC 9315 intent lineage

**Purpose**: Position this twin as the assurance consumer of the RFC 9315 intent line.
**Integration Type**: Conceptual lineage (intent concepts) in this iteration; no runtime coupling required.
**Standards**: IETF RFC 9315.
**Priority**: MEDIUM

---

### INT-004: SIMAP alignment (service ↔ infrastructure map)

**Purpose**: Structural alignment of the L1 correlation graph with the NMOP SIMAP concept.
**Integration Type**: Modelling alignment (no runtime dependency this iteration).
**Standards**: `draft-ietf-nmop-simap-concept` [LATH-C28].
**Priority**: COULD_HAVE

---

### INT-005: Control / management plane action routing (interface only)

**Purpose**: Define the routed-action interface for plane-aware remediation.
**Integration Type**: Interface defined; **execution out of scope** this iteration (controller recommends only).
**Authentication**: OAuth (NFR-SEC-004).
**Priority**: SHOULD_HAVE

---

## Data Requirements

### DR-001: Location foundation (SID Location ABE, GB922 v24.0)

**Description**: The Place tree must follow SID Location ABE natively: `Place` → `GeographicPlace` (→ GeographicAddress, GeographicLocation, GeographicSite, GeographicArea, Country / AdministrativeArea / GeographicState, Street, …), `LocalPlace` (indoor/3D), `OpenGisSFS` (geometry). The civic hierarchy is native — it must not be reinvented [LATH-C29].

**Data Classification**: PUBLIC/INTERNAL (no PII in static place data).
**Data Retention**: Durable master data (static service-location).
**Authoritative anchor**: GB922 v24.0 (Shared domain).

---

### DR-002: The six v24 cross-domain joints

**Description**: The model must use the corrected v24 joint names [LATH-C30]:

| Joint | Connects |
|---|---|
| `ServicePlaceDetails` | Service → Place |
| `PlacePhysicalResourceAssoc` | PhysicalResource ↔ Place (was DTDL `PlaceLocatesResource`) |
| `BusinessInteractionLocation` | BusinessInteraction → Place (trouble-ticket / order binding) |
| `ProductPlaceRole` | Product → Place |
| `ProductOrderItemPlaceRole` | ProductOrderItem → Place |
| `StockLocation` | StockItem → Place (dispatch / truck-roll) |

Party → Place is **indirect** via `AddressContactMediumRole`; **no direct v24 association exists** and one must not be invented.

**Authoritative anchor**: GB922 v24.0.

---

### DR-003: Mastership split (no fact mastered twice)

**Description**: Mastership must be split by concern [LATH-C27]:

| Concern | Master | Form |
|---|---|---|
| Location schema/ontology + the six joints | L2 (Fuseki) | RDF/OWL |
| Intent / design invariants | L2 (Fuseki) | SHACL |
| Operational instances (sites, resources, services, topology, live joints) | L1 (Neo4j) | LPG |
| Telemetry records (typed, in-flight) | L0 (broker) | YANG-in-broker |

**Relates To**: NFR-D-001, FR-004.

---

### DR-004: Transient privacy boundary

**Description**: Durable: static service-location (which site anchors a service, which place hosts a resource). Never durable: live per-subscriber serving location — resolved on demand, projected with TTL by a short-lived job, never master data [LATH-C6].

**Data Classification**: Live subscriber location = CONFIDENTIAL/RESTRICTED, transient only.
**Relates To**: BR-006, FR-014, NFR-C-001.

---

### DR-005: Provenance tagging ([SID v24] vs [MODEL])

**Description**: Every element carries a provenance predicate; authoritative `[SID v24]` elements are distinguished from `[MODEL]` modelling-convenience constructs. The civic/indoor hierarchy edges are currently `[MODEL]` — an open item to be promoted to the named v24 `GeographicLocationRelationship` / `LocalLocationRelationship` before publication [LATH-C31].

**Relates To**: BR-005, NFR-C-003, Risk R-2.

---

### DR-006: OWL scope (minimal vs full)

**Description**: The OWL ontology may be minimal (~15 classes in use) for the rig versus the full (~85) Location ABE; the minimal scope is acceptable for the rig but must be confirmed before publication [LATH-C32].

**Relates To**: FR-003, FR-015, Risk R-3.

---

### Data Quality Requirements

**Data Accuracy**: Joint names must match GB922 v24.0 exactly (three DTDL errors corrected — Decision D2).
**Data Completeness**: Required place bindings enforced by the provisioning-correctness SHACL shape (FR-012).
**Data Consistency**: Single mastership (DR-003); uni-directional sync (FR-004).
**Data Lineage**: Provenance predicate carried to RDF (DR-005); correlation id across layers (NFR-M-002).

---

### Data Migration Requirements

**Migration Scope**: Not applicable — greenfield reference rig seeded from `location_twin_v24.cypher`; no legacy data migration in this iteration.

---

## Constraints and Assumptions

### Technical Constraints

**TC-1**: Runtime is Node ≥ 22 or Python 3.11; orchestration is docker-compose (not Helm); Apache-2.0 headers on all source [LATH-C33].

**TC-2**: GB922 v24.0 must be stamped in the ontology and README; provenance (`[SID v24]` vs `[MODEL]`) must be traceable through to RDF [LATH-C33].

**TC-3**: The P4 privacy boundary must be enforced in both schema and code (not policy alone) [LATH-C33].

**TC-4**: The bridge must be uni-directional (n10s); no shared mastership across stores.

---

### Business Constraints

**BC-1**: This iteration is a pattern-proof rig, not production; production HA/scale-out is excluded.

**BC-2**: No automated execution into live carrier control/management planes in this iteration.

**BC-3**: Multi-operator federation is deferred to the ibn-core v4.0.0 / GSMA Open Gateway roadmap.

**BC-4**: Procedural / change-management (human/organisational) controls are out of scope (Risk R-4 narrows the prevention claim accordingly).

---

### Assumptions

**A-1**: NMOP drafts (message-key, SIMAP) are work-in-progress; their revisions are pinned in the README (Risk R-6) [LATH-C34].

**A-2**: The rig graph is small enough that multi-hop traversal stays within interactive latency (NFR-P-001).

**A-3**: Device telemetry can be stubbed via Netopeer2/Sysrepo for the rig where live YANG-Push sources are unavailable.

**Validation Plan**: Assumptions A-1/A-2 validated during build (deviation report, latency timing); A-3 validated by the L0 feed task.

---

## Success Criteria and KPIs

### Technical Success Metrics (Acceptance — HLD §9.4) [LATH-C35]

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Rig brings up cleanly | `docker compose up` → all services healthy | Compose health checks |
| L1 loads | Clean load; zero-X queries return rows | Query execution on seed |
| Bridge resolves | n10s import succeeds; twin labels resolve to `sid:` classes | Label inspection |
| Closed loop produces value | Controller returns impacted-service list **and** a geo-diversity SHACL violation on the seeded shared-section case **and** a `Q-BLAST` autonomy recommendation | One controller pass |
| Privacy proven | No per-subscriber location persisted anywhere | Schema + store inspection |

### Business Success Metrics

| Metric | Baseline | Target | Timeline | Measurement Method |
|--------|----------|--------|----------|-------------------|
| Symptom→cause correlation | Manual, ad hoc | Deterministic via `Q-CORRELATE` | Rig demo | Controller output |
| Pre-change consequence disclosure | Invisible at service level | Surfaced pre-commit | Rig demo | Governance-gate output |
| Standards defensibility | — | Traceability matrix complete; deviation report current | Pre-publication | Architecture-panel review |

---

## Dependencies and Risks

### Dependencies

| Dependency | Description | Owner | Target Date | Status | Impact if Delayed |
|------------|-------------|-------|-------------|--------|-------------------|
| NMOP message-key draft | Feed addressing scheme (`draft-netana-nmop-yang-message-broker-message-key-00`) | IETF NMOP | Draft track | At Risk | MEDIUM (pin revision) |
| GB922 v24.0 | SID Location ABE baseline | TM Forum | Published | On Track | HIGH |
| Neosemantics (n10s) | Bridge library | Neo4j Labs | Available | On Track | MEDIUM |
| Seed dataset | `location_twin_v24.cypher` | Project | Available | On Track | HIGH |

### Risks

> Derived from HLD §12; formalise via `/arckit:risk`.

| Risk ID | Description | Probability | Impact | Mitigation Strategy | Owner |
|---------|-------------|-------------|--------|---------------------|-------|
| R-1 | Two-store choice challenged ("why not Neo4j only?") | MEDIUM | MEDIUM | Defend: Fuseki earns its place for SHACL-as-intent + RDF interop; else collapse to one store | Lead Architect |
| R-2 | `[MODEL]` civic/indoor edges not named SID associations | HIGH | MEDIUM | Promote to `GeographicLocationRelationship` / `LocalLocationRelationship` before paper/panel | Standards reviewer |
| R-3 | OWL scope (minimal ~15 vs full ~85) | MEDIUM | LOW | Minimal acceptable for rig; confirm before publication | Standards reviewer |
| R-4 | Over-claiming prevention of incidents | MEDIUM | HIGH | Keep claim narrow: architecture surfaces consequence pre-commit; does NOT execute a skipped human procedure | Lead Architect |
| R-5 | Digital-twin term collision (YANG network-state vs SID service/place) | MEDIUM | LOW | Always qualify which twin | All |
| R-6 | Feed drafts are work-in-progress | HIGH | MEDIUM | Pin draft revisions in README; isolate behind the feed component | L0 owner |

---

## Requirement Conflicts & Resolutions

### Conflict C-1: Two stores vs one (complexity vs fit)

**Conflicting Requirements**:

- **Requirement A**: NFR-D-001 / DR-003 — split mastership across Neo4j (LPG) and Fuseki (RDF/SHACL).
- **Requirement B**: Simplicity pressure — a single store (Neo4j only) would reduce moving parts.

**Stakeholders Involved**: Lead Architect (fit-for-purpose) vs reviewer/operator (operational simplicity, Risk R-1).

**Nature of Conflict**: Two engines add integration cost; one engine is simpler but cannot serve both SHACL-as-intent + RDF interop *and* fast multi-hop traversal well.

**Trade-off Analysis**:

| Option | Pros | Cons | Impact |
|--------|------|------|--------|
| **Two stores (chosen)** | Right engine per rule type (Cypher reach + SHACL intent); RDF interop | Bridge complexity; two deployments | Fit ✅, simplicity ❌ |
| **Neo4j only** | Simpler rig | Loses SHACL-as-intent + RDF interoperability | Simplicity ✅, fit ❌ |

**Resolution Strategy**: PRIORITIZE (fit)
**Decision**: Keep two stores, split by concern (Decision D3/D6).
**Rationale**: SHACL is the correct intent-validation engine and RDF gives standards interoperability; Cypher is the correct blast-radius traversal engine. The bridge is uni-directional to avoid split mastership.
**Decision Authority**: Lead Architect (ARB on formalisation).
**Impact on Requirements**: DR-003, FR-003, FR-004 retained. Fallback documented (collapse to one store if the two-store justification fails review).
**Stakeholder Management**: R-1 carries the explicit defence and fallback.

---

### Conflict C-2: Privacy (no durable subscriber location) vs correlation/dispatch richness

**Conflicting Requirements**:

- **Requirement A**: BR-006 / NFR-C-001 / DR-004 — no durable per-subscriber location.
- **Requirement B**: FR-007 (`Q-CORRELATE`) and FR-011 (`Q-DISPATCH`) benefit from per-customer location detail.

**Stakeholders Involved**: DPO (data minimisation) vs NOC/dispatch (operational richness).

**Nature of Conflict**: Richer correlation/dispatch is easiest with durable subscriber location, which the privacy boundary forbids.

**Resolution Strategy**: COMPROMISE / INNOVATE
**Decision**: Master only **static service-location**; resolve live per-subscriber location **on demand with TTL** (FR-014). Correlation works on service/place bindings, not durable subscriber tracking.
**Rationale**: Satisfies operational need without durable PII; privacy enforced in schema and code (TC-3).
**Decision Authority**: DPO + Lead Architect (Decision D7).
**Impact on Requirements**: FR-014 added; DR-004 enforced; FR-007/FR-011 operate on durable static bindings + transient projections.

---

### Conflict C-3: Autonomy/speed vs safety

**Conflicting Requirements**:

- **Requirement A**: FR-013 — automatic self-healing (speed).
- **Requirement B**: NFR-SEC-002 / BR-003 — gate autonomy by blast radius (safety).

**Resolution Strategy**: PHASE (reach-graded autonomy)
**Decision**: Blast radius drives autonomy: tight single-site faults run auto; wide-reach or critical-service faults are forced to supervised (human-in-the-loop). The controller never authors free-form config (NFR-SEC-004).
**Rationale**: Captures the speed benefit where reach is small and risk low, while preserving human control where it matters. Keeps BR-001's prevention claim narrow (R-4).
**Decision Authority**: Security & Governance Lead.
**Impact on Requirements**: FR-013, NFR-SEC-002 reconciled; BR-001 claim explicitly narrowed.

---

### Conflict C-4: Standards fidelity vs rig pragmatism

**Conflicting Requirements**:

- **Requirement A**: BR-005 / NFR-C-003 — full authoritative fidelity (named v24 relationships; full OWL).
- **Requirement B**: DR-006 — minimal OWL + `[MODEL]` edges for a buildable rig.

**Resolution Strategy**: PHASE
**Decision**: Ship minimal OWL with `[MODEL]`-tagged civic/indoor edges for the rig; promote to the named v24 `GeographicLocationRelationship` / `LocalLocationRelationship` and confirm OWL scope **before** paper/panel.
**Rationale**: Unblocks the rig now while protecting publication credibility; the gap is tracked (R-2, R-3) and recorded in the deviation report (FR-015).
**Decision Authority**: Standards reviewer + Lead Architect.
**Impact on Requirements**: DR-005, DR-006, FR-015 retained with explicit promotion path.

---

## Timeline and Milestones

### High-Level Milestones (maps to HLD §9.2 build tasks)

| Milestone | Description | Target | Dependencies |
|-----------|-------------|--------|--------------|
| Requirements Approval | Sign-off on this document | 2026-07-17 | This document |
| Rig up | docker-compose: Neo4j (n10s+APOC), Fuseki (SHACL), broker | Build task 1 | Requirements |
| L1 loaded | `location_twin_v24.cypher` loads; zero-X queries return rows | Build task 2 | Rig |
| L2 ontology + shapes | Minimal OWL stamped GB922 v24.0; SHACL shapes | Build tasks 3–4 | L1 |
| L3 bridge | n10s import; labels resolve to `sid:` | Build task 5 | L2 |
| L0 feed | YANG-Push consumer → broker (message-key) | Build task 6 | Rig |
| L4 controller pass | End-to-end controller run meets acceptance | Build task 7 | L1–L3, L0 |
| Deviation report | Approximations + provenance promotion status | Build task 8 | All |

---

## Budget

Not applicable in monetary terms for this iteration — open-source reference rig, no procurement. Cost is engineering effort only (single rig on developer/CI infrastructure). A costed Economic Case would be produced only if the pattern progresses toward an operator deployment (out of scope here).

---

## Approval

### Requirements Review

| Reviewer | Role | Status | Date | Comments |
|----------|------|--------|------|----------|
| [PENDING] | Lead Architect | [ ] Approved | [PENDING] | |
| [PENDING] | Security & Governance Lead | [ ] Approved | [PENDING] | |
| [PENDING] | Data Protection Officer | [ ] Approved | [PENDING] | |
| [PENDING] | Standards/Research Reviewer | [ ] Approved | [PENDING] | |

### Sign-Off

By signing below, stakeholders confirm the requirements are complete, understood, and approved to proceed to design.

| Stakeholder | Signature | Date |
|-------------|-----------|------|
| [PENDING], Lead Architect | _________ | [PENDING] |

---

## Appendices

### Appendix A: Glossary

| Term | Definition |
|------|------------|
| SID / GB922 | TM Forum Information Framework (Shared Information/Data model); v24.0 baseline |
| ABE | Aggregate Business Entity (SID grouping), here the Location ABE |
| LPG | Labelled Property Graph (Neo4j) |
| SHACL | Shapes Constraint Language (W3C) — used here as the intent-validation engine |
| n10s | Neosemantics — Neo4j ↔ RDF bridge |
| YANG-Push | RFC 8641 subscription to YANG datastore updates (periodic / on-change) |
| MAPE-K | Monitor-Analyse-Plan-Execute over shared Knowledge (autonomic loop) |
| SRLG | Shared-Risk Link Group (geo-diversity hazard) |
| Plane (M/C/F) | Management / Control / Forwarding; "forwarding" per Graf umbrella usage (≠ 3GPP user-plane) |
| `[SID v24]` / `[MODEL]` | Provenance tags: authoritative vs modelling-convenience |

### Appendix B: Reference Documents

- External HLD: `external/location_assurance_twin_HLD.md` (v0.1)
- Global principles: `projects/000-global/ARC-000-PRIN-v1.0.md`
- Related: ibn-core (RFC 9315), resource-intent-agent (Project 004), togaf-trace-kit

### Appendix C: Standards Anchors (from HLD §8)

| Building block | Standard | Version/ref | Provenance |
|---|---|---|---|
| Location foundation + joints | TM Forum SID | GB922 v24.0 | authoritative |
| Feed subscriptions | YANG-Push | RFC 8639 / 8641 (+ 8640) | authoritative |
| Feed addressing | NMOP message-key | `draft-netana-nmop-yang-message-broker-message-key-00` | work-in-progress |
| Service↔infra map | NMOP SIMAP | `draft-ietf-nmop-simap-concept` | work-in-progress |
| Intent concepts | IETF | RFC 9315 | authoritative |
| Intent validation | W3C SHACL | — | authoritative |
| Config model | YANG / NETCONF | RFC 7950 / 6241 | authoritative |
| Civic/indoor edges | recursive relationship entities | v24 `GeographicLocationRelationship` / `LocalLocationRelationship` | open item (`[MODEL]`) |

---

**Document History**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-06-17 | ArcKit AI | Initial requirements baseline from HLD v0.1 |

## External References

> Traceability from generated content back to source documents.

### Document Register

| Doc ID | Filename | Type | Source Location | Description |
|--------|----------|------|-----------------|-------------|
| LATH | location_assurance_twin_HLD.md | High-Level Design | 006-location-assurance-twin/external/ | Authoritative source HLD v0.1 — architecture, NFRs, query set, data/mastership, standards traceability |
| LTC | location_twin_v24.cypher | Seed data (Cypher) | 006-location-assurance-twin/external/ | L1 instances + joints + zero-X queries (build seed) |
| LRSPI | LOCATION_RESOURCE_SERVICE_PART_INTERACTION.pdf | Reference diagram/notes | 006-location-assurance-twin/external/ | Location/Resource/Service/Part interaction reference |
| TPDT | tmf_pyramid_digital_twin.svg | Reference diagram | 006-location-assurance-twin/external/ | TMF pyramid / digital-twin positioning graphic |

### Citations

| Citation ID | Doc ID | Page/Section | Category | Quoted Passage |
|-------------|--------|--------------|----------|----------------|
| LATH-C1 | LATH | §1.1 Purpose | Business Requirement | "A location-anchored, closed-loop assurance system. It consumes semantically-typed network telemetry, maintains a live operational graph of *what is where*, validates the network against declared intent, and computes the *reach* of any fault or proposed change before action is taken" |
| LATH-C2 | LATH | §1.2 Problem | Business Requirement | "a management-plane change can have an unmodelled forwarding-plane consequence that is invisible at service level, and because second-line support cannot associate a customer symptom with the network event that caused it" |
| LATH-C3 | LATH | Baselines | Risk Factor | "Motivating incident | Optus 000, 18 Sep 2025 (public inquiry) | failure-mode evidence" |
| LATH-C4 | LATH | §2 P5 / §9.3 | Non-Functional Requirement | "Open and reproducible — Apache-2.0; docker-compose rig; no closed dependencies" |
| LATH-C5 | LATH | §5.1 Use case | Functional Requirement | "Detect a fault → correlate to impacted services/customers via the place foundation → validate against intent → compute blast radius → gate the autonomy level → act within bounds → verify." |
| LATH-C6 | LATH | §4.4 Transient boundary | Data Requirement | "Never durable: live per-subscriber serving location — resolved on demand, projected with TTL by a short-lived job, never master data." |
| LATH-C7 | LATH | §1.4 Out of scope | Procurement Constraint | "Production HA/scale-out; multi-operator federation (ibn-core v4.0.0 roadmap); automated execution into live carrier control/management planes; procedural/change-management controls" |
| LATH-C8 | LATH | §2 P2 / footer | Data Requirement | "every model element tagged to a versioned standard; `[MODEL]` marks modelling-convenience constructs not named in GB922 v24.0" |
| LATH-C9 | LATH | §3.2 L0 | Integration Requirement | "preserve YANG semantics into broker records; make them addressable by subscription/xpath/element via the message-key scheme so a consumer pulls only the slice it needs" |
| LATH-C10 | LATH | §3.2 L1 | Functional Requirement | "the live map. SID Location ABE instances (Place tree, civic + geodetic), the six v24 cross-domain joints, topology. Optimised for traversal: fault→place→services→customers→blast radius." |
| LATH-C11 | LATH | §3.2 L2 | Functional Requirement | "the rulebook. SID Location ontology (RDF/OWL) + YANG-derived config model; SHACL shapes expressing design invariants" |
| LATH-C12 | LATH | §3.2 L3 | Integration Requirement | "n10s. Fuseki→Neo4j: import ontology so labels are GB922 class names. Neo4j→Fuseki: serialise impacted subgraph for SHACL validation. Uni-directional; no shared mastership." |
| LATH-C13 | LATH | §3.2 L5 | Security Requirement | "plane-aware action routing; autonomy-level gating from blast radius; immutable audit with correlation id; enforces the privacy boundary." |
| LATH-C14 | LATH | §5.2 Query set | Functional Requirement | "Q-CORRELATE … Q-SRLG … Q-BLAST … Q-PROACTIVE … Q-DISPATCH" |
| LATH-C15 | LATH | §5.3 Intent shapes | Functional Requirement | "geo-diversity (primary/backup share zero route sections); critical-service reachability (e.g. emergency-call path survives any element isolation — the Optus invariant); provisioning correctness" |
| LATH-C16 | LATH | §9.2 task 8 | Functional Requirement | "deviation report — record approximations, any SID class approximated in OWL, and whether the `[MODEL]` civic/indoor edges were promoted to the named v24 relationships." |
| LATH-C17 | LATH | §6 NFR | Non-Functional Requirement | "Performance (correlation) | multi-hop impact traversal in L1 returns within interactive latency on rig-scale graph" |
| LATH-C18 | LATH | §6 NFR | Non-Functional Requirement | "Detection vs causality | feed must carry causal (data-plane) signal, not only black-box/aggregate; probes complementary only" |
| LATH-C19 | LATH | §6 NFR | Non-Functional Requirement | "Observability redundancy | data/control/management sub-planes + outside-in view; incident detectable if ≥1 of 4 observed" |
| LATH-C20 | LATH | §6 NFR | Non-Functional Requirement | "Scalability (feed) | broker partitioning via YANG message-key hash+modulo (NMOP draft); consumer pulls scoped slices" |
| LATH-C21 | LATH | §7 | Security Requirement | "Plane separation (P3): classify each action M / C / F; a management-plane change with a forwarding-plane consequence must surface that consequence pre-commit" |
| LATH-C22 | LATH | §7 | Security Requirement | "Autonomy gating: blast radius drives the autonomy level; cross-jurisdiction or critical-service reach forces human-in-loop." |
| LATH-C23 | LATH | §7 | Security Requirement | "Trust gradient: any externally-triggered request (chatbot, ticket) is least-trusted; it may only create a governed request, never author config. Authorization binds to the authenticated subject." |
| LATH-C24 | LATH | §6 / §3.2 L4 | Security Requirement | "no raw config authored by controller" / "OAuth where control-plane reached" |
| LATH-C25 | LATH | §9.1 | Security Requirement | ".env # secrets (gitignored); NEO4J_AUTH etc." |
| LATH-C26 | LATH | §6 / §7 | Compliance Constraint | "Auditability | immutable log; correlation id threaded across all layers" |
| LATH-C27 | LATH | §4.1 Mastership split | Data Requirement | "Single source of truth — no fact mastered twice | instances in one store, schema/intent in the other" |
| LATH-C28 | LATH | Baselines / §11 | Integration Requirement | "Service & infra map | `draft-ietf-nmop-simap-concept` (NMOP) | service↔infrastructure mapping cousin" |
| LATH-C29 | LATH | §4.2 | Data Requirement | "Place tree: `Place` → `GeographicPlace` … `LocalPlace` (indoor/3D), `OpenGisSFS` (geometry). Civic hierarchy is native — do not invent it." |
| LATH-C30 | LATH | §4.3 | Data Requirement | "The six v24 cross-domain joints (corrected names): ServicePlaceDetails, PlacePhysicalResourceAssoc, BusinessInteractionLocation, ProductPlaceRole, ProductOrderItemPlaceRole, StockLocation" |
| LATH-C31 | LATH | §8 | Data Requirement | "Civic/indoor hierarchy edges … v24 `GeographicLocationRelationship` / `LocalLocationRelationship` | open item — currently `[MODEL]`" |
| LATH-C32 | LATH | §12 R3 | Data Requirement | "OWL scope (minimal ~15 vs full ~85 Location ABE) | minimal acceptable for rig; confirm before publication" |
| LATH-C33 | LATH | §9.3 Constraints | Compliance Constraint | "Node ≥22 or Python 3.11; docker-compose (not Helm); Apache-2.0 headers; GB922 v24.0 stamped in ontology + README; P4 privacy boundary enforced" |
| LATH-C34 | LATH | §12 R6 | Risk Factor | "Feed draft is work-in-progress | message-key/SIMAP drafts may change; pin draft revisions in README" |
| LATH-C35 | LATH | §9.4 Acceptance | Functional Requirement | "controller run returns impacted-service list and a geo-diversity SHACL violation on the seeded shared-section case and a Q-BLAST autonomy recommendation; no per-subscriber location persisted anywhere." |

### Unreferenced Documents

| Filename | Source Location | Reason |
|----------|-----------------|--------|
| location_twin_v24.cypher | 006-location-assurance-twin/external/ | Build seed referenced by the HLD; not directly quoted in requirements (consumed at build time, FR-002) |
| LOCATION_RESOURCE_SERVICE_PART_INTERACTION.pdf | 006-location-assurance-twin/external/ | Supporting reference graphic; requirements derived from the HLD which supersedes it |
| tmf_pyramid_digital_twin.svg | 006-location-assurance-twin/external/ | Positioning graphic; not a requirements source |

---

**Generated by**: ArcKit `/arckit:requirements` command
**Generated on**: 2026-06-17
**ArcKit Version**: 5.11.0
**Project**: location-assurance-twin (Project 006)
**Model**: Claude Opus 4.8 (1M context)
**Generation Context**: Extracted from external HLD v0.1 (`location_assurance_twin_HLD.md`) with global principles `ARC-000-PRIN-v1.0`. STKE/RISK/SOBC not yet present — flagged for follow-up.

<!-- arckit-provenance:start -->

## Build Provenance

_Stamped automatically by the ArcKit plugin's `provenance-stamp.mjs` PostToolUse hook. Complements (does not replace) the human-authored footer above. Carries only fields the model can't authoritatively self-report: build context from `.arckit/state.json` and effort levels derived from command frontmatter + the silent-downgrade matrix._

| Field | Value |
|-------|-------|
| Requested Effort | `max` |
| Effective Effort | _unknown — model not parsed from existing footer_ |
| Stamped at | 2026-06-17T14:52:26.679Z |

<!-- arckit-provenance:end -->
