# High-Level Design (HLD) Review: ibn-core-my

> **Template Origin**: Official | **ArcKit Version**: 5.11.0 | **Command**: `/arckit:hld-review`

## Document Control

| Field | Value |
|-------|-------|
| **Document ID** | ARC-001-HLDR-v1.0 |
| **Document Type** | High-Level Design Review |
| **Project** | ibn-core-my (Project 001) |
| **Classification** | PUBLIC |
| **Status** | DRAFT |
| **Version** | 1.0 |
| **Created Date** | 2026-06-05 |
| **Last Modified** | 2026-06-05 |
| **Review Cycle** | Per-gate (alpha) |
| **Next Review Date** | 2026-07-05 |
| **Owner** | Roland Pfeifer, Lead Architect (Vpnet Cloud Solutions Sdn. Bhd.) |
| **Reviewed By** | [PENDING] |
| **Approved By** | [PENDING] |
| **Distribution** | Project Team, Architecture Team, Security Lead, Operator Compliance Officer |

## Revision History

| Version | Date | Author | Changes | Approved By | Approval Date |
|---------|------|--------|---------|-------------|---------------|
| 1.0 | 2026-06-05 | ArcKit AI | Initial creation from `/arckit:hld-review` command | [PENDING] | [PENDING] |

## Document Purpose

This document captures an Architecture Review Board (ARB) evaluation of the High-Level Design (HLD) for **ibn-core** — the open-core (Apache 2.0) RFC 9315 / TMF921 v5.0.0 AI-native Intent-Based Networking framework delivered by Vpnet Cloud Solutions to Malaysian operators (U Mobile, TM). It gates the transition from design to detailed design (DLD) and implementation, assessing the HLD against the 17 enterprise architecture principles (`ARC-000-PRIN-v1.0`), the 49 requirements (`ARC-001-REQ-v1.0`), and the three ratified architecture decisions (ADR-001 operator identity; ADR-002 cloud platform / landing zones; ADR-003 data residency).

> **Scope of this review.** No standalone vendor HLD document (e.g. `vendors/{vendor}/hld-v*.md`) was submitted. The "design under review" is therefore the **as-architected system** described and constrained by the approved upstream artefacts: the project context (real `ibn-core` repository — `src/`, `src/api`, `src/handlers`, `src/mcp/McpAdapter.ts`, Redis SSoT, Istio mesh, Keycloak JWT auth, OTel telemetry), the REQ baseline, and the three ADRs. Findings consequently focus on **design coherence, requirements coverage, and implementation readiness** of the decided architecture, and flag where the HLD-level design artefact (C4 diagrams, deployment topology, sequence/token-flow diagrams) is not yet materialised as a discrete document.

---

## 1. Review Overview

### 1.1 Purpose

This document captures the ARB's evaluation of the HLD for ibn-core-my. The HLD must demonstrate architectural soundness, alignment with enterprise principles, requirements coverage, and feasibility before proceeding to detailed design and alpha implementation.

### 1.2 HLD Document Under Review

**Document**: No discrete HLD artefact submitted; reviewed as the as-architected system defined by `ARC-001-REQ-v1.0`, `ARC-001-ADR-001/002/003-v1.0`, and the `ibn-core` repository context (`src/`, `business-intent-agent/k8s/istio/`, `mcp-services-k8s/`).
**ArcKit Version**: 5.11.0
**Submitted By**: Vpnet Cloud Solutions (internal architecture)
**Submission Date**: 2026-06-05

### 1.3 Review Participants

| Name | Role | Organization | Review Focus |
|------|------|--------------|--------------|
| [PENDING] | Lead Reviewer / Enterprise Architect | Vpnet Cloud Solutions | Overall architecture, principle compliance |
| [PENDING] | Security Architect | Vpnet Cloud Solutions | Zero-trust identity, agent role, threat model |
| [PENDING] | Domain Architect | Vpnet Cloud Solutions | RFC 9315 / TMF921 conformance, MCP seam |
| [PENDING] | Infrastructure Architect | Vpnet / SI | Kubernetes/Istio, scalability, resilience, DR |
| [PENDING] | Data Architect | Vpnet / Operator | SSoT, PDPA residency, PII masking |
| [PENDING] | SRE Lead | Vpnet / SI | Observability, operational readiness |

### 1.4 Review Criteria

The HLD is evaluated against: Architecture Principles (17, `ARC-000-PRIN-v1.0`); Requirements Alignment (6 BR, 13 FR, NFRs, 4 INT, 3 data entities); Technical Feasibility; Security & Compliance (zero-trust, PDPA 2010, open-core seam); Scalability & Resilience; Operational Readiness; and consistency with the three ratified ADRs.

### 1.5 Interactive Review Parameters (Q&A choices)

Recorded for auditability (no recommended defaults were pre-marked, so the standard first-option set was applied, matching the project's recorded state):

- **Scope**: Full system (entire ibn-core framework + landing-zone topology).
- **Phase**: Alpha (consistent with `ARC-001-REQ-v1.0` "alpha phase, full-system scope").
- **Risk profile**: Medium (consistent with the Medium risk appetite recorded in all three ADRs).
- **Vendor HLD**: None submitted — reviewed as the as-architected system per §1.2.

---

## 2. Executive Summary

### 2.1 Overall Assessment

**Status**: APPROVED WITH CONDITIONS

**Summary**: The ibn-core architecture is unusually coherent for an alpha-phase system. The design is anchored on a small set of strong, mutually reinforcing decisions — a published `McpAdapter` open-core seam, a Redis Single Source of Truth for intent state, Keycloak-issued JWTs with a distinct constrained agent-role identity, an Istio service mesh providing mTLS/circuit-breakers/HPA, and OpenTelemetry instrumentation of both application and agent behaviour. These map cleanly onto RFC 9315 phases and the TMF921 v5.0.0 resource model, and the three ratified ADRs are internally consistent (ADR-003 is explicitly the per-dataset residency layer *within* ADR-002's hybrid landing-zone topology; ADR-001's IdP placement follows ADR-002). Requirements coverage is high: every MUST_HAVE functional requirement traces to an identifiable component.

The conditions for approval are not architectural reversals but **maturity and evidence gaps appropriate to the design-gate transition**. The single most material gap is that no discrete HLD artefact (C4 system/container diagrams, deployment topology, token-flow and data-flow sequence diagrams) yet exists — three ADRs each list "HLD: [PENDING]" as a verification dependency. Second, the central-IdP and Redis-SSoT dependencies are acknowledged single points of failure whose HA/DR design is deferred (ADR-001 defers IdP HA to a future ADR; no Redis HA/replication topology is documented against the NFR-A-002 RPO ≤ 15 min target). Third, the two-tier JWT "elevated assurance" gate central to ADR-001 is named but not yet parameterised. None of these block the *direction*; all must be closed before the Pre-Production (SI go-live) gate.

The architecture is approved to proceed to detailed design, conditional on the blocking items below being addressed in the DLD and the supporting diagram set being produced.

### 2.2 Key Strengths

- **Standards conformance is structural, not bolted on.** Every intent-lifecycle capability maps to an RFC 9315 phase and the TMF921 v5.0.0 resource model; 100% CTK pass (83/83 baseline) is a versioned release gate (BR-001, NFR-C-003, PRIN 3).
- **The open-core seam is a clean, enforced boundary.** `McpAdapter` interface in the public repo; `MockMcpAdapter` for local dev; operator CAMARA logic and credentials confined to the private repo and vault — verified each release (BR-003, FR-010, PRIN 9). ADR-001 and ADR-003 reinforce this as both an identity and a residency control.
- **Zero-trust identity with a distinct, attributable agent role.** Autonomous cycles run under a constrained agent-role identity (never human/admin), every tool call identity-stamped for audit and telemetry (FR-007, BR-005, ADR-001, PRIN 4).
- **Compliance-by-placement.** Tier-differentiated residency (ADR-003) keyed to the MYCLAS ladder satisfies PDPA 2010 (DS-009) and operator/MCMC sovereignty (DS-007/008) structurally; the default in-region telemetry collector closes the one structural cross-border path (PRIN 6, NFR-C-001).
- **Meta-observability as a first-class concern.** OTel traces carry `rfc9315.phase` tags, GenAI (`gen_ai.*`) and AI-gateway events, with the telemetry-bootstrap-first-import rule codified (FR-011, PRIN 5).

### 2.3 Key Concerns

- **No discrete HLD design artefact yet exists** — C4 (L1/L2) diagrams, deployment topology, and token-flow / data-flow sequence diagrams are listed as `[PENDING]` across all three ADRs. The design is reconstructable from the artefacts but is not yet a reviewable, baseline-able HLD document.
- **Acknowledged SPOFs lack an HA/DR design.** Keycloak (central IdP) and the Redis SSoT are both critical-path dependencies; ADR-001 defers IdP HA/DR to a future ADR, and no Redis replication/failover topology is documented against NFR-A-002 (RPO ≤ 15 min, RTO ≤ 4 h).
- **The ADR-001 two-tier "elevated assurance" gate is unparameterised** (token TTLs, re-validation cadence, MFA scope) — a known specification-burden trade-off that must land in the DLD.
- **Cross-border AI-translation path (Claude, INT-002) vs. PDPA** relies on FR-009 masking holding fail-closed; the masked-egress legal basis is owned by `ARC-001-PDPA`/DPIA but the DPIA is not yet produced.
- **Performance/HA targets are stated but unvalidated** — no load-test or DR-drill evidence yet (appropriate for alpha, but a Pre-Production gate item).

### 2.4 Conditions for Approval

**MUST Address Before Detailed Design / Pre-Production gate**:

1. **[BLOCKING-01]** Produce the discrete HLD artefact set: C4 L1 (system context) and L2 (container) diagrams, deployment topology across the hybrid landing zones (ADR-002), and token-flow + data-flow sequence diagrams (human / agent / CAMARA-egress paths and the masked ingestion path). Closes the `HLD: [PENDING]` verification item in ADR-001/002/003.
2. **[BLOCKING-02]** Document the HA/DR design for the two acknowledged SPOFs: Keycloak (JWKS caching bounds + fail-closed-for-privileged behaviour, and the deferred IdP HA/DR ADR) and the Redis SSoT (replication/failover topology, backup/restore meeting NFR-A-002 RPO ≤ 15 min / RTO ≤ 4 h).
3. **[BLOCKING-03]** Parameterise the ADR-001 two-tier assurance gate (standard vs. elevated: token TTLs, per-call re-validation cadence, MFA scope for human-initiated network-mutating operations) in the DLD/security design, with regression tests.

**SHOULD Address During Detailed Design**:

1. **[ADVISORY-01]** Produce the DPIA (`/arckit:dpia`) confirming the masked-egress legal basis for the Claude (INT-002) and any LangSmith (INT-004) cross-border paths (PDPA 2010; NFR-C-001).
2. **[ADVISORY-02]** Define the load-test plan (50 concurrent submissions, 5 intents/s sustained; NFR-P-001/P-002) and the DR-drill / exit-window rehearsal procedure (ADR-002).
3. **[ADVISORY-03]** Specify Redis SSoT encryption-at-rest and tenant-isolation approach for multi-operator scaling (NFR-SEC-003, NFR-S-002).

### 2.5 Recommendation

- [ ] **APPROVED**: Proceed to detailed design with no conditions
- [x] **APPROVED WITH CONDITIONS**: Proceed after addressing blocking items listed above
- [ ] **APPROVED WITH ADVISORIES**: Proceed but address advisory items in DLD
- [ ] **REJECTED**: Significant rework required; resubmit revised HLD for review

**Target Resubmission Date** (blocking items re-review): aligned to the "Design Complete (Alpha)" milestone, 2026-08-16.

---

## 3. Architecture Principles Compliance

Evaluated against the 17 principles in `ARC-000-PRIN-v1.0`. (The generic template's P-1…P-10 slots are mapped onto the project's actual principle set; all 17 are assessed below.)

### 3.1 Principle Compliance Checklist

| Principle | Name | Criticality | Status | Comments |
|-----------|------|-------------|--------|----------|
| P1 | Scalability and Elasticity | HIGH | ⚠️ Partial | Stateless handlers + Istio HPA designed; load-test evidence pending. |
| P2 | Resilience and Fault Tolerance | CRITICAL | ⚠️ Partial | Circuit breakers/retries/timeouts designed; IdP + Redis HA/DR deferred (BLOCKING-02). |
| P3 | Standards Conformance | CRITICAL | ✅ Compliant | RFC 9315 phase map + TMF921 v5.0.0 + 100% CTK gate. |
| P4 | Security by Design (Zero Trust) | CRITICAL | ✅ Compliant | Keycloak JWT + constrained agent role + mTLS + vaulted secrets (ADR-001). |
| P5 | Observability and Operational Excellence | HIGH | ✅ Compliant | OTel traces, agent telemetry, bootstrap rule; SLOs/runbooks pending. |
| P6 | Data Sovereignty and Governance | CRITICAL | ✅ Compliant | Tier-differentiated residency (ADR-003); in-region collector default. |
| P7 | Data Quality and Lineage | MEDIUM | ⚠️ Partial | Schema validation + lineage described; quality-metric automation deferred to DLD. |
| P8 | Single Source of Truth | HIGH | ✅ Compliant | Redis SSoT for intent state (FR-005, RFC 9315 §4 P1). |
| P9 | Open-Core / Proprietary Seam Integrity | CRITICAL | ✅ Compliant | `McpAdapter` seam; no operator logic/creds in public repo (FR-010). |
| P10 | Loose Coupling | HIGH | ✅ Compliant | TMF921/MCP/events; no shared DB across boundaries; decoupled trust domains. |
| P11 | Asynchronous Communication | MEDIUM | ⚠️ Partial | Async orchestration intended; durability/DLQ/event-schema not yet specified. |
| P12 | Performance and Efficiency | HIGH | ⚠️ Partial | Targets defined (NFR-P-001/002 incl. AI cost-per-intent); no test evidence yet. |
| P13 | Availability and Reliability | CRITICAL | ⚠️ Partial | Alpha ≥ 99.0% target; redundancy/failover design pending (BLOCKING-02). |
| P14 | Maintainability and Evolvability | MEDIUM | ✅ Compliant | Modular seam, agent-readable context (CLAUDE.md), ADRs with citations. |
| P15 | Infrastructure as Code | HIGH | ✅ Compliant | K8s manifests + Istio policy declarative; parameterised landing-zone blueprint (ADR-002). |
| P16 | Automated Testing and Conformance | HIGH | ⚠️ Partial | CTK gate + O2C smoke designed; coverage thresholds/perf tests maturing. |
| P17 | CI/CD and Traceability | HIGH | ✅ Compliant | CI with CodeQL/Dependabot; commit-citation discipline; rollback to be tested. |

### 3.2 Principle Compliance Details (selected)

#### P3: Standards Conformance (NON-NEGOTIABLE) — ✅ Compliant

**Evidence**: Standards Implementation Map ties `POST /api/v1/intent` → §5.1.1; translation → §5.1.2; `McpAdapter.orchestrate()` → §5.1.3; metrics → §5.2.1; `IntentReport.reportState` → §5.2.2; Istio circuit-breakers/HPA → §5.2.3. TMF921 v5.0.0 resource shapes and 100% CTK (83/83) as a release gate (BR-001, NFR-C-003).
**Concerns**: CTK evidence must remain versioned per release; the IntentReport projection is a known regression risk (R-4) and must stay guarded.
**Recommendation**: Keep the CTK run (ID + date + commit/tag) attached to each release; no design change required.

#### P4: Security by Design / Zero Trust (NON-NEGOTIABLE) — ✅ Compliant

**Evidence**: ADR-001 ratifies Keycloak as central IdP, a distinct least-privilege agent realm role, mTLS within the Istio mesh, vaulted CAMARA egress credentials, and a two-tier assurance model. Every privileged/agent action authenticated and identity-stamped (FR-006/007, NFR-SEC-001/002/004).
**Concerns**: The elevated-assurance gate is unparameterised (BLOCKING-03); IdP is a SPOF (BLOCKING-02); threat model not yet produced as an artefact (PRIN 4 validation gate "threat model completed").
**Recommendation**: Land the assurance-gate parameters and a threat model in the DLD/security design before Pre-Production.

#### P9: Open-Core / Proprietary Seam Integrity (NON-NEGOTIABLE) — ✅ Compliant

**Evidence**: `McpAdapter` interface (public) + `MockMcpAdapter` (local) + operator adapters (private repo); release-time repo scan target of zero operator credentials/logic; Apache-2.0-compatible dependencies only; file-level copyright headers (FR-010, BR-003, TC-1/2). ADR-001 keeps CAMARA egress auth private; ADR-003 makes CONFIDENTIAL/RESTRICTED off-public-estate a residency rule.
**Concerns**: None at design level. Enforcement depends on CI seam/secret scanning continuing to run.
**Recommendation**: Maintain the release-time seam check as a hard CI gate.

#### P2 / P13: Resilience & Availability (CRITICAL) — ⚠️ Partial

**Evidence**: Istio circuit breakers, retries with backoff/jitter, timeouts, bulkhead isolation per operator adapter, graceful degradation of non-critical telemetry (NFR-A-003). JWKS caching + fail-closed-for-privileged for IdP outage.
**Concerns**: Keycloak and Redis SSoT are critical-path SPOFs without a documented HA/DR topology; no chaos/fault-injection or failover test evidence; RTO/RPO targets unvalidated.
**Recommendation**: BLOCKING-02 — document IdP HA/DR (future ADR) and Redis replication/failover + backup/restore meeting NFR-A-002; schedule a DR drill.

---

## 4. Requirements Coverage Analysis

### 4.1 Functional Requirements Coverage

| Req ID | Summary | Addressed | Design Element | Assessment |
|--------|---------|-----------|----------------|------------|
| FR-001 | NL intent ingestion `POST /api/v1/intent` | Yes | `src/api` route + PII-masking middleware | ✅ Adequate |
| FR-002 | AI/LLM intent translation | Yes | `src/handlers` Claude client (INT-002); schema-validate output | ✅ Adequate (confidence-gated fast path per C-1) |
| FR-003 | Autonomous orchestration via MCP | Yes | `McpAdapter.orchestrate()` + agent runtime (FR-007) | ✅ Adequate |
| FR-004 | Intent lifecycle CRUD | Yes | TMF921 routes + SSoT | ✅ Adequate |
| FR-005 | Intent-state SSoT | Yes | Redis SSoT | ⚠️ Adequate; HA/encryption pending (BLOCKING-02, ADVISORY-03) |
| FR-006 | Identity-based authn/authz | Yes | `src/auth-jwt.ts` / `src/auth-router.ts` (ADR-001) | ✅ Adequate |
| FR-007 | Constrained agent-role identity | Yes | Agent realm role, client-credentials bootstrap (ADR-001) | ✅ Adequate |
| FR-008 | IntentReport / compliance assessment | Yes | `reportState` projection (CTK-guarded) | ✅ Adequate |
| FR-009 | PII masking | Yes | Ingestion-path masking middleware (fail-closed) | ⚠️ Adequate; DPIA pending (ADVISORY-01) |
| FR-010 | Published MCP seam + mock | Yes | `src/mcp/McpAdapter.ts` + `MockMcpAdapter` | ✅ Adequate |
| FR-011 | Agent + app telemetry | Yes | `src/telemetry.ts` OTel; bootstrap-first rule | ✅ Adequate |
| FR-012 | Adapter capability exposure | Yes | `getCapabilities()` (RFC 9315 §4 P5) | ✅ Adequate |
| FR-013 | Intent status monitoring | Yes | `getIntentStatus()` / `GET /intent/{id}` | ✅ Adequate |

**Gaps**: No unaddressed FR. FR-005 and FR-009 carry conditions (HA/DR, encryption-at-rest, DPIA) rather than coverage gaps.

### 4.2 Non-Functional Requirements Coverage

#### Performance

| NFR | Target | HLD Approach | Assessment |
|-----|--------|--------------|------------|
| NFR-P-001 | Retrieve < 200 ms p95; NL→Intent < 10 s p95 | SSoT reads; confidence-gated translation fast path (C-1) | ⚠️ Plausible; no load-test evidence (ADVISORY-02) |
| NFR-P-002 | ≥ 5 intents/s, 3x headroom; AI cost-per-intent metric | Stateless handlers + HPA; cost metric in telemetry | ⚠️ Designed; unvalidated |

#### Availability & Resilience

| NFR | Target | HLD Approach | Assessment |
|-----|--------|--------------|------------|
| NFR-A-001 | Alpha ≥ 99.0% | Multi-replica + Istio health checks | ⚠️ SPOFs un-mitigated (BLOCKING-02) |
| NFR-A-002 | RPO ≤ 15 min / RTO ≤ 4 h (alpha) | SSoT backups; region-local DR | ❌ Redis HA/backup topology not documented (BLOCKING-02) |
| NFR-A-003 | Fault tolerance | Circuit breaker, retry/backoff, timeout, bulkhead, graceful degrade | ✅ Adequate (design) |

#### Security

| NFR | HLD Approach | Assessment |
|-----|--------------|------------|
| NFR-SEC-001 Authentication | MFA (human) + signed agent token + mTLS; Keycloak realm validation | ✅ Adequate |
| NFR-SEC-002 Authorization | RBAC least-privilege; constrained agent role | ⚠️ Adequate; assurance-gate parameters pending (BLOCKING-03) |
| NFR-SEC-003 Encryption | TLS 1.3/mTLS in transit; at-rest for stores | ⚠️ Redis at-rest encryption to confirm (ADVISORY-03) |
| NFR-SEC-004 Secrets | Vault-only; none in public repo | ✅ Adequate |
| NFR-SEC-005 Vuln mgmt | CodeQL + Dependabot; no open critical/high at release | ✅ Adequate |
| NFR-SEC-006 Licence compat | Apache-2.0-compatible deps; headers | ✅ Adequate |

#### Compliance, Scalability, Interoperability, Maintainability

| NFR | HLD Approach | Assessment |
|-----|--------------|------------|
| NFR-C-001 PDPA residency | Tier-differentiated residency (ADR-003); Malaysia-resident DS-009; masked egress | ⚠️ Adequate; DPIA pending (ADVISORY-01) |
| NFR-C-002 Audit logging | Who/what/when/where/why/result; acting identity | ✅ Adequate |
| NFR-C-003 Standards verification | CTK per release; RFC 9315 map | ✅ Adequate |
| NFR-S-001 Horizontal scaling | K8s HPA; stateless handlers | ⚠️ Designed; unvalidated |
| NFR-S-002 Tenant/volume scaling | Per-tenant capacity model | ⚠️ Multi-tenant isolation not yet specified (ADVISORY-03) |
| NFR-I-001 TMF921 API | v5.0.0 shapes; `/api/v1/` versioning | ✅ Adequate |
| NFR-I-002 Loose coupling | API/MCP/events; no shared DB | ✅ Adequate |
| NFR-I-003 IaC | Declarative manifests + parameterised blueprint | ✅ Adequate |
| NFR-M-001/002/003 Observability/Docs/Runbooks | OTel; context-first docs; runbooks partial | ⚠️ Runbooks/SLOs maturing |

---

## 5. Architecture Quality Assessment

### 5.1 System Context & Container Diagrams (C4 L1/L2)

**Provided in HLD**: No. **Assessment**: ❌ Inadequate (not yet produced).
Component responsibilities are clear from the repo and ADRs (API gateway/routes, intent processor + Claude client, `McpAdapter` seam, Redis SSoT, Keycloak, Istio mesh, OTel/collector), but no diagram baselines them. **BLOCKING-01** — produce C4 L1/L2, deployment topology, and sequence diagrams. (`/arckit:diagram` is the route.)

### 5.2 Technology Stack

| Layer | Technology | Approved? | Assessment |
|-------|-----------|-----------|------------|
| API / app | TypeScript / Node (`src/`) | ✅ (MIT/Apache-compatible) | ✅ |
| Intent translation | Anthropic Claude (INT-002) | ✅ | ⚠️ Cross-border path → masking/DPIA (ADVISORY-01) |
| Tool/adapter protocol | MCP (MIT) | ✅ | ✅ |
| SSoT | Redis | ✅ | ⚠️ HA/encryption (BLOCKING-02/ADVISORY-03) |
| Identity | Keycloak (OIDC/JWT) | ✅ | ⚠️ SPOF HA (BLOCKING-02) |
| Mesh | Istio (mTLS, CB, HPA) | ✅ | ✅ |
| Telemetry | OpenTelemetry → LangSmith / Canvas collector | ✅ | ⚠️ Default cross-border egress closed by in-region collector (ADR-003) |
| Orchestration | Kubernetes | ✅ | ✅ |
| CI/CD | GitHub Actions + CodeQL/Dependabot | ✅ | ✅ |

All technologies are Apache-2.0-compatible (PRIN 9 / NFR-SEC-006). No deprecated or non-approved technology detected.

### 5.3 Data Architecture & Governance

Entities (Intent, IntentReport, Agent Action/Telemetry Event) are defined with classifications (CONFIDENTIAL / INTERNAL) in REQ. Data classification ✅, residency (ADR-003) ✅, PII handling (FR-009 masking) ⚠️ (DPIA pending), retention ✅ (per operator policy), backup/recovery ⚠️ (BLOCKING-02). SSoT is the single authoritative store with no bidirectional sync (PRIN 8) ✅.

### 5.4 Integration Architecture

| External System | Pattern | Auth | Assessment |
|-----------------|---------|------|------------|
| Operator CAMARA (INT-001) | Request/response via `McpAdapter` | CAMARA-native, vaulted, agent-role context | ✅ (mock in alpha) |
| Anthropic Claude (INT-002) | Request/response, timeouts, degrade | Vaulted API key | ⚠️ Masking/DPIA |
| Keycloak (INT-003) | OIDC/JWT validation per request | Realm trust | ⚠️ Fail-closed-for-privileged; HA pending |
| OTel backend (INT-004) | Async OTLP export | Vaulted backend creds | ✅ (non-critical, in-region default) |

---

## 6. Security Architecture Review

**Threat model provided**: No (PRIN 4 validation gate). ⚠️ Produce in DLD/security design.
Authentication ✅ (Keycloak JWT, MFA for humans, signed agent token, mTLS). Authorization ⚠️ (RBAC/least-privilege designed; elevated-assurance parameters pending — BLOCKING-03). Network ✅ (Istio segmentation, mTLS, egress control). Data protection ⚠️ (at-rest encryption to confirm for Redis; masking fail-closed). Secrets ✅ (vault-only). Security monitoring ✅ (structured audit logging of authn/authz + agent actions; CodeQL/Dependabot). Penetration test required before SI go-live (NFR-SEC-005).

**Compliance mapping**: PDPA 2010 ⚠️ (residency satisfied by ADR-003; DPIA pending). ISO 27001 / SOC 2 control families addressed at design level for SI engagements. Open-core seam ✅.

---

## 7. Scalability & Performance Architecture

Horizontal scaling via stateless handlers + Istio/K8s HPA (CPU > 70% or demand metrics) ✅ design. Caching of expensive translation/enrichment (PRIN 12) — strategy not yet detailed ⚠️. Database scaling: Redis SSoT replication/sharding for multi-tenant growth not documented ⚠️ (ADVISORY-03). Growth projections stated (50 concurrent / 100k records alpha) but **no load-test evidence** ⚠️ (ADVISORY-02). Bottleneck candidates: Redis SSoT and the synchronous Claude translation call (latency budget in NL→Intent < 10 s) — the confidence-gated fast path (Conflict C-1) is the documented mitigation.

---

## 8. Resilience & Disaster Recovery

| Pattern | Implemented (design) | Assessment |
|---------|----------------------|------------|
| Circuit breaker | Yes (Istio) | ✅ |
| Retry w/ backoff + jitter | Yes | ✅ |
| Timeout on all network/AI calls | Yes | ✅ |
| Bulkhead isolation per operator | Yes | ✅ |
| Graceful degradation (telemetry/enrichment) | Yes | ✅ |
| Health checks | Yes (Istio/K8s) | ✅ |

**SPOFs**: (1) Keycloak central IdP — mitigated partially by JWKS caching + fail-closed-for-privileged; HA/DR deferred to a future ADR. (2) Redis SSoT — no replication/failover topology documented. **DR**: NFR-A-002 RPO ≤ 15 min / RTO ≤ 4 h (alpha) stated but the backup/restore + failover design and a DR drill are not yet present. **BLOCKING-02** consolidates these. Exit-window rehearsal (ADR-002 days-not-months) to be evidenced (ADVISORY-02).

---

## 9. Operational Architecture

Observability ✅ strong (structured logs with correlation/intent IDs; metrics incl. latency percentiles + AI cost-per-intent; OTel distributed tracing; agent telemetry with `rfc9315.phase` and `gen_ai.*`; telemetry-bootstrap-first rule codified). **SLI/SLO definitions and alerting runbooks**: partial — ⚠️ complete in DLD. Deployment: IaC (K8s + Istio) ✅; CI/CD with security scanning ✅; rollback capability to be tested (PRIN 17 gate) ⚠️. Supportability: runbooks for deploy/rollback, SSoT backup/restore, scaling, DR, incident response (incl. agent-misbehaviour containment) are specified as required (NFR-M-003) but not yet authored ⚠️.

---

## 10. Cost Architecture

Cost figures are `[PENDING]` in REQ (to be set via `/arckit:sobc`); ADR-002/003 give indicative per-engagement SI planning ranges (~USD 0.18–0.42M 3-year TCO for the recommended hybrid model). AI-inference cost-per-intent is correctly elevated to a first-class efficiency metric (NFR-P-002, PRIN 12). FinOps practices (tagging, budget alerts) not yet defined — defer to `/arckit:finops`. **Assessment**: ⚠️ Not yet costed; acceptable at alpha, required for the business case.

---

## 11. Issues and Recommendations

### 11.1 Critical Issues (BLOCKING)

| ID | Issue | Impact | Recommendation | Owner | Target |
|----|-------|--------|----------------|-------|--------|
| BLOCKING-01 | No discrete HLD artefact (C4 L1/L2, deployment topology, token/data-flow sequence diagrams) | HIGH — design not baseline-able; closes ADR-001/002/003 `HLD: [PENDING]` | Produce diagram set via `/arckit:diagram` | Enterprise/Solution Architect | 2026-08-16 |
| BLOCKING-02 | Keycloak + Redis SSoT SPOFs lack HA/DR design vs NFR-A-002 | HIGH — availability/recovery unproven | IdP HA/DR ADR + JWKS-cache bounds; Redis replication/failover + backup/restore + DR drill | Infra Architect / SI Engineer | 2026-08-16 |
| BLOCKING-03 | ADR-001 elevated-assurance gate unparameterised | HIGH — control strength ambiguous for network-mutating ops | Define token TTLs, re-validation cadence, MFA scope in DLD; regression-test | Security Lead | 2026-08-16 |

### 11.2 High Priority Issues (ADVISORY)

| ID | Issue | Impact | Recommendation | Owner | Target |
|----|-------|--------|----------------|-------|--------|
| ADVISORY-01 | DPIA absent for cross-border AI/telemetry paths | MEDIUM — PDPA legal basis unconfirmed | Run `/arckit:dpia`; confirm masked-egress basis | Operator Compliance Officer | DLD |
| ADVISORY-02 | No load-test / DR-drill evidence | MEDIUM — NFR-P/A targets unvalidated | Define and run load + DR/exit-window tests | SRE / Infra | DLD |
| ADVISORY-03 | Redis at-rest encryption + multi-tenant isolation unspecified | MEDIUM — NFR-SEC-003 / NFR-S-002 | Specify encryption + per-operator isolation | Data/Infra Architect | DLD |

### 11.3 Low Priority Items (INFORMATIONAL)

| ID | Suggestion | Benefit | Owner |
|----|------------|---------|-------|
| INFO-01 | Document async event schemas + DLQ for non-real-time orchestration (PRIN 11) | Durability/decoupling clarity | Domain Architect |
| INFO-02 | Add a threat model artefact (STRIDE/LINDDUN) tied to PRIN 4 gate | Closes a named validation gate | Security Architect |
| INFO-03 | Define caching strategy for translation/enrichment hot paths (PRIN 12) | Latency/AI-cost reduction | Eng |

---

## 12. Review Decision

### 12.1 Final Decision

**Status**: [x] APPROVED WITH CONDITIONS

**Effective Date**: 2026-06-05

**Conditions**: BLOCKING-01, BLOCKING-02, BLOCKING-03 resolved before the Design-Complete (Alpha) gate (2026-08-16); ADVISORY-01/02/03 addressed within the DLD. No architectural reversal required — the decided direction (open-core seam, SSoT, zero-trust agent identity, hybrid classification-driven placement) is sound and approved.

**Next Steps**:

- [ ] Produce HLD diagram set (BLOCKING-01)
- [ ] Author IdP + Redis HA/DR design (BLOCKING-02)
- [ ] Parameterise assurance gate (BLOCKING-03)
- [ ] Run DPIA, load test, DR drill (advisories)
- [ ] Proceed to Detailed Design (DLD)

### 12.2 Reviewer Sign-Off

| Reviewer | Role | Decision | Signature | Date |
|----------|------|----------|-----------|------|
| [PENDING] | Lead Reviewer / Enterprise Architect | [ ] Approve [ ] Conditional [ ] Reject | _________ | [PENDING] |
| [PENDING] | Security Architect | [ ] Approve [ ] Conditional [ ] Reject | _________ | [PENDING] |
| [PENDING] | Domain Architect | [ ] Approve [ ] Conditional [ ] Reject | _________ | [PENDING] |
| [PENDING] | Infrastructure Architect | [ ] Approve [ ] Conditional [ ] Reject | _________ | [PENDING] |
| [PENDING] | Data Architect | [ ] Approve [ ] Conditional [ ] Reject | _________ | [PENDING] |
| [PENDING] | SRE Lead | [ ] Approve [ ] Conditional [ ] Reject | _________ | [PENDING] |

**Unanimous Approval Required**: [x] Yes
**Escalation**: Vpnet Cloud Solutions Enterprise Architecture Review Board (Lead Architect / CTO).

---

## 13. Appendices

### Appendix A: HLD Document Reference

No discrete HLD submitted. As-architected baseline: `ARC-001-REQ-v1.0`, `ARC-001-ADR-001/002/003-v1.0`, and the `ibn-core` repository (`src/`, `src/api`, `src/handlers`, `src/mcp/McpAdapter.ts`, `business-intent-agent/k8s/istio/`, `mcp-services-k8s/`). BLOCKING-01 will create the missing artefact set.

### Appendix B: Requirements Traceability

Forward coverage matrix in §4. To be consolidated via `/arckit:traceability` (requirement → design → test) once the HLD diagram set and DLD exist.

### Appendix C: Architecture Principles Document

`projects/000-global/ARC-000-PRIN-v1.0.md` (17 principles; 3 NON-NEGOTIABLE: P3, P4, P9).

### Appendix D: Review Meeting Notes

Interactive review parameters recorded in §1.5 (Scope: Full system; Phase: Alpha; Risk: Medium; no vendor HLD). No live review meeting held; ARB sign-off pending.

---

**Document Control**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-06-05 | ArcKit AI | Initial review |

## External References

> This section provides traceability from generated content back to source documents.

### Document Register

| Doc ID | Filename | Type | Source Location | Description |
|--------|----------|------|-----------------|-------------|
| ARC-000-PRIN | ARC-000-PRIN-v1.0.md | Principles | projects/000-global/ | 17 enterprise architecture principles (3 NON-NEGOTIABLE) |
| ARC-001-REQ | ARC-001-REQ-v1.0.md | Requirements | projects/001-ibn-core-my/ | BR/FR/NFR/INT/DR baseline (49 requirements) |
| ARC-001-ADR-001 | ARC-001-ADR-001-v1.0.md | ADR | projects/001-ibn-core-my/decisions/ | Operator identity — Keycloak central IdP + constrained agent role + CAMARA egress |
| ARC-001-ADR-002 | ARC-001-ADR-002-v1.0.md | ADR | projects/001-ibn-core-my/decisions/ | Cloud platform — hybrid classification-driven landing zones |
| ARC-001-ADR-003 | ARC-001-ADR-003-v1.0.md | ADR | projects/001-ibn-core-my/decisions/ | Data residency — tier-differentiated per MYCLAS ladder |

### Citations

| Citation ID | Doc ID | Page/Section | Category | Quoted Passage |
|-------------|--------|--------------|----------|----------------|
| [PRIN-1] | ARC-000-PRIN | §I.3/I.4/III.9 | Principle | NON-NEGOTIABLE: Standards Conformance; Security by Design; Open-Core Seam Integrity. |
| [REQ-1] | ARC-001-REQ | FR-001…FR-013, NFR-A-002, NFR-P-001 | Requirement | Functional coverage; RPO ≤ 15 min / RTO ≤ 4 h alpha; NL→Intent < 10 s p95. |
| [ADR1-1] | ARC-001-ADR-001 | §6.2 / §7.2 | Decision | Keycloak central IdP + constrained agent role; central-IdP dependency accepted (JWKS cache, fail-closed). |
| [ADR2-1] | ARC-001-ADR-002 | §6.1 | Decision | Hybrid classification-driven landing zones (operator private cloud + Malaysian-region public CSP). |
| [ADR3-1] | ARC-001-ADR-003 | Appendix A | Decision | Tier-differentiated per-dataset residency (DS-001…DS-010); DS-009 Malaysia-resident; DS-010 vault-only. |

### Unreferenced Documents

| Filename | Source Location | Reason |
|----------|-----------------|--------|
| — | — | — |

---

**Generated by**: ArcKit `/arckit:hld-review` command
**Generated on**: 2026-06-05 14:30 GMT
**ArcKit Version**: 5.11.0
**Project**: ibn-core-my (Project 001)
**AI Model**: claude-opus-4-8[1m]
**Generation Context**: Reviewed the as-architected ibn-core system against ARC-000-PRIN-v1.0 (17 principles), ARC-001-REQ-v1.0 (49 requirements), and the three ratified ADRs (ARC-001-ADR-001/002/003). No discrete vendor HLD artefact was submitted; review focused on design coherence, requirements coverage, and implementation readiness. Interactive parameters: Full system / Alpha / Medium risk (first-option set, matching project state).
