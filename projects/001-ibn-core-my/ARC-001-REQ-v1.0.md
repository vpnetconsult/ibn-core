# Project Requirements: ibn-core-my

> **Template Origin**: Official | **ArcKit Version**: 5.11.0 | **Command**: `/arckit:requirements`

## Document Control

| Field | Value |
|-------|-------|
| **Document ID** | ARC-001-REQ-v1.0 |
| **Document Type** | Business and Technical Requirements |
| **Project** | ibn-core-my (Project 001) |
| **Classification** | PUBLIC |
| **Status** | DRAFT |
| **Version** | 1.0 |
| **Created Date** | 2026-06-05 |
| **Last Modified** | 2026-06-05 |
| **Review Cycle** | Monthly (alpha phase) |
| **Next Review Date** | 2026-07-05 |
| **Owner** | Roland Pfeifer, Lead Architect (Vpnet Cloud Solutions Sdn. Bhd.) |
| **Reviewed By** | [PENDING] |
| **Approved By** | [PENDING] |
| **Distribution** | ibn-core engineering, Vpnet SI delivery teams, operator integration partners |

## Revision History

| Version | Date | Author | Changes | Approved By | Approval Date |
|---------|------|--------|---------|-------------|---------------|
| 1.0 | 2026-06-05 | ArcKit AI | Initial creation from `/arckit:requirements` command | [PENDING] | [PENDING] |

## Document Purpose

This document defines the business, functional, and technical requirements for **ibn-core** — an open-core (Apache 2.0) RFC 9315 Intent-Based Networking framework targeting the TMF921 Intent Management API v5.0.0, delivered commercially with private operator adapters to Malaysian telecommunications operators (U Mobile, TM Malaysia). It is the authoritative requirements baseline for vendor/partner RFPs, architecture reviews (Discovery/Alpha, Beta/Design, Pre-Production gates), and downstream artefacts (research, HLD/DLD, traceability, AI-governance assessments). Requirements are traceable to the ibn-core Enterprise Architecture Principles (`ARC-000-PRIN-v1.0`).

The project is at **alpha phase** with **full-system scope**. AI/LLM/agent capabilities are **in scope** as first-class functional requirements: the system performs Claude-based natural-language intent translation and autonomous agent orchestration. This drives downstream AI-governance artefacts (DPIA, AI Playbook, ATRS, JSP-936 as applicable).

---

## Executive Summary

### Business Context

Telecommunications operators face rising cost and slow time-to-service when translating commercial and customer intent (e.g. "provide internet for a work-from-home customer") into concrete network configuration across heterogeneous 4G/5G core, transport, and OSS/BSS systems. Today this requires manual, error-prone engineering work that does not scale to campaign-driven, bursty demand and provides no standards-based, auditable intent lifecycle. ibn-core addresses this by implementing the IRTF RFC 9315 Intent-Based Networking model as a production framework and exposing it through the TM Forum TMF921 v5.0.0 Intent Management API, so operators procure on the basis of verifiable standards conformance.

ibn-core is **AI-native**: it uses an Anthropic Claude-based translation layer to convert natural-language intent into structured TMF921 Intent resources, and an autonomous agent runtime that orchestrates fulfilment through a Model Context Protocol (MCP) adapter seam to operator CAMARA APIs. State is held in a Redis Single Source of Truth, services run on a Kubernetes/Istio service mesh secured by Keycloak-issued JWTs, and all behaviour — including agent reasoning and tool calls — is instrumented with OpenTelemetry traces (default backend LangSmith, overridable to any ODA Canvas collector).

The strategic value is twofold: a commercial, standards-conformant product differentiated by 100% TMF921 Conformance Test Kit (CTK) pass and RFC 9315 phase traceability; and an **open-core commercial model** — a public Apache 2.0 framework plus private, operator-specific CAMARA adapters delivered through Vpnet Cloud Solutions Systems Integration (SI) engagements. The framework also underpins academic publication (Paper 1), so standards conformance and the open-core seam are programme-defining constraints, not optional features.

### Objectives

- Deliver a standards-conformant intent platform: every intent-lifecycle capability mapped to an RFC 9315 phase and exposed through TMF921 v5.0.0, with 100% CTK conformance as a release gate.
- Provide AI-native intent translation and autonomous orchestration with measurable, auditable agent behaviour (GenAI telemetry, RFC 9315 phase tags, agent-role identity).
- Preserve a clean open-core / proprietary seam: a published MCP adapter interface in the public Apache 2.0 repo; operator credentials and adapter logic confined to the private repo.
- Achieve operator-grade non-functional posture: horizontal scalability, resilience, zero-trust security, and observability sufficient for Malaysian operator SI engagements.
- Validate the canonical Order-to-Cash (O2C) journey end-to-end: natural-language intent → TMF921 Intent → MCP orchestration → IntentReport with `lifecycleStatus: completed` and `reportState: fulfilled`.

### Expected Outcomes

- **Standards conformance**: 100% TMF921 CTK pass (target maintained from v2.0.1 baseline of 83/83), recorded as versioned evidence per release.
- **Intent translation accuracy**: ≥ 95% of canonical O2C-class natural-language intents translated to a valid TMF921 Intent without human correction (alpha measurement on a curated evaluation set).
- **Time-to-intent**: natural-language submission to accepted TMF921 Intent in < 10 seconds (p95) under nominal load.
- **Auditability**: 100% of autonomous agent tool invocations carry agent-role identity and emit GenAI/RFC 9315 telemetry spans.
- **Open-core integrity**: zero operator credentials or operator-specific adapter logic present in the public repository (verified each release).

### Project Scope

**In Scope**:

- Natural-language intent ingestion and Claude-based translation to TMF921 v5.0.0 Intent resources (FR area: AI translation).
- Autonomous agent orchestration of intent fulfilment via the `McpAdapter` seam, including agent-role identity and constrained-privilege execution.
- TMF921 v5.0.0 intent lifecycle: create, retrieve, delete, and IntentReport / `reportState` reporting (RFC 9315 §5.1–§5.2).
- Redis-backed intent-state Single Source of Truth (RFC 9315 §4 P1).
- Keycloak JWT authentication/authorisation for human and agent identities; Istio service mesh for mTLS, segmentation, and compliance actions (circuit breakers, HPA).
- OpenTelemetry instrumentation of application and agent behaviour; default OTLP backend LangSmith, overridable to a Canvas collector (ODA Canvas UC006).
- The public open-core framework, the `MockMcpAdapter` for local development, and the published adapter interface.
- Canonical O2C use case as the primary end-to-end verification journey.

**Out of Scope**:

- Production operator-specific CAMARA adapter implementations (e.g. `CamaraUMobileMcpAdapter`) and real operator credentials — these live in the **private repository** and are delivered via SI engagements.
- Live CAMARA integration against operator sandboxes (targeted for v3.0.0; alpha uses mock/sandbox adapters).
- Multi-operator federation (targeted for v4.0.0).
- Proprietary TM Forum IG document text/diagrams (cited by reference only).
- Operator OSS/BSS billing, CRM, and charging systems beyond the integration contracts defined herein.
- I2NSF / individual-submission draft terminology and module names (RFC 8329 cited, not implemented).

---

## Stakeholders

> **Note**: No Stakeholder Analysis artefact (`ARC-001-STKE-v*.md`) exists for this project. The table below is an interim, role-based stakeholder set inferred from the project context and `ARC-000-PRIN-v1.0`. **Run `/arckit:stakeholders` to produce a full Power/Interest, RACI, and conflict analysis**; requirement-to-stakeholder-goal traceability and the Requirement Conflicts section should be revalidated against that output.

| Stakeholder | Role | Organization | Involvement Level |
|-------------|------|--------------|-------------------|
| Roland Pfeifer | Lead Architect / CTO (Executive Sponsor) | Vpnet Cloud Solutions | Decision maker |
| Product Owner | Product Owner (ibn-core) | Vpnet Cloud Solutions | Requirements definition |
| SI Delivery Lead | Engagement / Delivery Lead | Vpnet Cloud Solutions | Requirements elicitation, operator liaison |
| Enterprise / Solution Architect | Architecture oversight | Vpnet Cloud Solutions | Technical oversight |
| Security Lead | Security & compliance | Vpnet Cloud Solutions | Security review (zero-trust, PDPA) |
| Operator Integration Architect | Network / OSS integration | U Mobile, TM Malaysia | Adapter & CAMARA integration |
| Operator Compliance Officer | Regulatory / data governance | U Mobile, TM Malaysia | PDPA, data residency sign-off |
| Open-source maintainers / community | Contributors to public core | External | Apache 2.0 framework users |

---

## Business Requirements

### BR-001: Standards-Conformant Intent Platform

**Description**: ibn-core must deliver intent-management capability that conforms to RFC 9315 IBN concepts and is exposed through the TMF921 Intent Management API v5.0.0, so operators can procure on verifiable standards compliance.

**Rationale**: Commercial differentiation and academic citation (Paper 1) rest on verifiable conformance — 100% TMF921 CTK and RFC 9315 phase traceability. Divergence erodes interoperability and the core value proposition. Aligns with PRIN Principle 3 (Standards Conformance, NON-NEGOTIABLE).

**Success Criteria**:

- 100% TMF921 v5.0.0 CTK pass recorded with run ID, date, and commit/tag per release (baseline 83/83 from v2.0.1).
- Every intent-lifecycle capability mapped to an RFC 9315 phase in the Standards Implementation Map.

**Priority**: MUST_HAVE

**Stakeholder**: Lead Architect / CTO; Operator Integration Architect

---

### BR-002: AI-Native Intent Translation and Autonomous Orchestration

**Description**: The platform must translate natural-language operator/customer intent into structured TMF921 Intent and autonomously orchestrate fulfilment, reducing manual network-engineering effort and time-to-service.

**Rationale**: The product's value over manual provisioning is AI-driven translation and agent orchestration. This is the basis of the O2C use case and the AI-native positioning. Supports PRIN Principle 5 (Observability — agent behaviour as a measurable signal).

**Success Criteria**:

- ≥ 95% of canonical O2C-class intents translated to a valid TMF921 Intent without human correction on the alpha evaluation set.
- Autonomous fulfilment of the canonical O2C journey to `reportState: fulfilled` without manual intervention in nominal conditions.

**Priority**: MUST_HAVE

**Stakeholder**: Product Owner; SI Delivery Lead

---

### BR-003: Open-Core Commercial Model Integrity

**Description**: Maintain a clean separation between the public Apache 2.0 framework and private operator adapters, protecting both the open-source licence posture and the commercial value of operator integrations.

**Rationale**: The business model is open core: public framework plus private CAMARA adapters delivered via SI. The adapter interface is cited in Paper 1 and must not be weakened. Aligns with PRIN Principle 9 (Open-Core / Proprietary Seam Integrity, NON-NEGOTIABLE).

**Success Criteria**:

- Zero operator credentials, API keys, or operator-specific adapter logic in the public repository (verified each release).
- All public dependencies licence-compatible with Apache 2.0 (Apache/MIT/BSD/ISC); no GPL.

**Priority**: MUST_HAVE

**Stakeholder**: Lead Architect / CTO; Open-source maintainers

---

### BR-004: Operator-Grade Delivery for Malaysian SI Engagements

**Description**: The platform must meet the scalability, resilience, security, and data-governance expectations required to be deployed into Malaysian operator environments under SI contracts, including PDPA 2010 obligations.

**Rationale**: Revenue derives from SI engagements with U Mobile and TM Malaysia. Operators impose availability SLAs, data residency, and regulatory obligations that gate adoption. Aligns with PRIN Principles 1, 2, 4, 6.

**Success Criteria**:

- Architecture passes the Pre-Production architecture review gate (all validation gates in PRIN §VII satisfied).
- PDPA 2010 data-handling obligations and operator-mandated residency mapped and demonstrably met per engagement.

**Priority**: MUST_HAVE

**Stakeholder**: SI Delivery Lead; Operator Compliance Officer

---

### BR-005: Auditable, Trustworthy Autonomous Behaviour

**Description**: Autonomous agent actions that can mutate live network configuration must be observable, attributable, and constrained, so operators and auditors can trust and review them.

**Rationale**: Agents act on live operator networks; "black-box" autonomy is not acceptable to operators or regulators. Meta-observability of agent behaviour is a product principle. Aligns with PRIN Principles 4 (zero-trust, agent identity) and 5 (agent telemetry).

**Success Criteria**:

- 100% of agent tool invocations executed under a distinct constrained agent-role identity (not human/admin) and logged.
- GenAI semantic-convention and RFC 9315 phase telemetry emitted for all autonomous cycles.

**Priority**: MUST_HAVE

**Stakeholder**: Security Lead; Operator Compliance Officer

---

### BR-006: Maintain Academic and Evidence Baseline

**Description**: Preserve the citable release baseline and conformance evidence trail (versioned tags, CTK results, RFC/TMF traceability) that supports Paper 1 and future publications.

**Rationale**: Cited tags (v1.4.x–v2.0.1) and `docs/compliance/` evidence are referenced in academic work and must not be rewritten or invalidated. Aligns with PRIN Principles 16–17 (conformance verification, traceability).

**Success Criteria**:

- Cited version tags remain immutable (never force-pushed/rewritten).
- Each conformance claim backed by a dated evidence artefact tied to a commit or tag.

**Priority**: SHOULD_HAVE

**Stakeholder**: Lead Architect / CTO

---

## Functional Requirements

### User Personas

#### Persona 1: Operator Service Designer / Intent Author

- **Role**: Designs commercial offers and submits service intent on behalf of customers/campaigns.
- **Goals**: Express intent in natural language and have it fulfilled correctly and quickly without writing network configuration.
- **Pain Points**: Manual translation from commercial intent to network config is slow and error-prone; no standards-based audit trail.
- **Technical Proficiency**: Medium.

#### Persona 2: Operator Network / Integration Engineer

- **Role**: Integrates ibn-core with operator network functions and CAMARA APIs; troubleshoots fulfilment.
- **Goals**: Reliable orchestration, clear failure diagnostics, conformance to operator interfaces.
- **Pain Points**: Heterogeneous network/OSS systems; needs to trust and inspect autonomous actions.
- **Technical Proficiency**: High.

#### Persona 3: SI Engineer / Platform Operator (Vpnet)

- **Role**: Deploys, configures, and operates ibn-core in operator environments.
- **Goals**: Repeatable deployment (IaC), observability, secure secret handling, smooth adapter swap (mock → operator).
- **Pain Points**: Environment drift; secrets management; ensuring the open-core seam holds.
- **Technical Proficiency**: High.

#### Persona 4: Autonomous Intent Agent (system actor)

- **Role**: The AI agent runtime that translates intent and orchestrates fulfilment cycles.
- **Goals**: Translate intent accurately, orchestrate via MCP, report state, operate under a constrained identity, and emit telemetry.
- **Pain Points**: Must not over-reach privilege; must be observable and bounded.
- **Technical Proficiency**: N/A (machine actor).

#### Persona 5: Auditor / Compliance Reviewer

- **Role**: Reviews agent actions, identity usage, and data handling for compliance.
- **Goals**: Trace who/what did what to network state, with evidence.
- **Pain Points**: Opaque automation; insufficient logs.
- **Technical Proficiency**: Medium.

---

### Use Cases

#### UC-1: Order-to-Cash (O2C) — Natural-Language Intent to Fulfilment

**Actor**: Operator Service Designer / Intent Author (Persona 1); Autonomous Intent Agent (Persona 4).

**Preconditions**:

- Caller holds a valid Keycloak-issued JWT authorised for intent submission.
- The relevant MCP adapter (mock in alpha; operator adapter in SI) is configured and reachable.

**Main Flow**:

1. User submits a natural-language intent (e.g. "I need internet for working from home") with a customer identifier to `POST /api/v1/intent`.
2. System authenticates the request and masks PII for downstream processing.
3. System invokes the Claude-based translation layer to produce a structured TMF921 v5.0.0 Intent (RFC 9315 §5.1.2 Translation).
4. System persists the Intent as authoritative state in the Redis SSoT (RFC 9315 §4 P1) and returns a TMF921 Intent resource.
5. The autonomous agent orchestrates fulfilment via `McpAdapter.orchestrate()` under its agent-role identity (RFC 9315 §5.1.3).
6. System monitors fulfilment, computes compliance assessment, and produces an IntentReport with `reportState`.
7. On success, the Intent reaches `lifecycleStatus: completed` and `reportState: fulfilled`.

**Postconditions**:

- Intent record and IntentReport persisted; telemetry spans emitted for translation and each MCP call.

**Alternative Flows**:

- **Alt 3a**: If translation is low-confidence or ambiguous, system returns a clarification/validation error rather than an invalid Intent.
- **Alt 5a**: If an MCP/operator dependency is degraded, the agent retries with backoff and applies circuit-breaker behaviour.

**Exception Flows**:

- **Ex 1**: Authentication/authorisation failure → request rejected with no intent created and an audit log entry.
- **Ex 2**: Orchestration unrecoverable failure → Intent reaches a non-fulfilled `reportState` with diagnostic detail; no partial silent success.

**Business Rules**:

- Every privileged/orchestration action runs under the constrained agent-role identity, never human/admin.
- Public API responses must conform to TMF921 v5.0.0 shapes.

**Priority**: CRITICAL

---

#### UC-2: Retrieve Intent and IntentReport

**Actor**: Operator Service Designer; Network Engineer; Auditor.

**Preconditions**: Valid JWT; intent ID known.

**Main Flow**:

1. Caller requests `GET /api/v1/intent/{id}`.
2. System reads authoritative state from the Redis SSoT.
3. System returns the TMF921 Intent and current IntentReport / `reportState`.

**Postconditions**: No state change (idempotent read).

**Alternative Flows**:

- **Alt 2a**: Unknown ID → TMF921-conformant 404 error.

**Business Rules**: Reads served from the SSoT or a clearly-labelled read-only derived copy; no bidirectional sync.

**Priority**: HIGH

---

#### UC-3: Cancel / Delete Intent

**Actor**: Operator Service Designer; SI Engineer.

**Preconditions**: Valid JWT authorised for deletion; intent exists.

**Main Flow**:

1. Caller requests `DELETE /api/v1/intent/{id}`.
2. System invokes compliance actions / cancellation via the adapter where applicable (RFC 9315 §5.2.3) and updates lifecycle state.
3. System confirms deletion with a TMF921-conformant response.

**Postconditions**: Intent lifecycle terminated; action audited.

**Exception Flows**:

- **Ex 1**: Deletion during in-flight orchestration → cancellation requested via `cancelIntent()`; final state recorded consistently.

**Business Rules**: Lifecycle transitions follow TMF921 v5.0.0 and RFC 9315 §6.

**Priority**: HIGH

---

#### UC-4: Inspect Agent Behaviour and Capabilities

**Actor**: Auditor (Persona 5); Network Engineer.

**Preconditions**: Telemetry backend (LangSmith or Canvas collector) configured; access authorised.

**Main Flow**:

1. Reviewer queries telemetry for a given intent/correlation ID.
2. System surfaces agent reasoning spans, tool invocations, RFC 9315 phase tags, and the identity under which each action ran.
3. Reviewer optionally queries adapter capabilities via `getCapabilities()` (RFC 9315 §4 Principle 5).

**Postconditions**: Reviewer obtains an attributable, phase-tagged trace of autonomous behaviour.

**Business Rules**: Every autonomous tool call is attributable to the agent-role identity and a correlation/intent ID.

**Priority**: HIGH

---

### Functional Requirements Detail

#### FR-001: Natural-Language Intent Ingestion

**Description**: The system must accept a natural-language intent plus a customer identifier via `POST /api/v1/intent` and return a TMF921 v5.0.0 Intent resource.

**Relates To**: BR-001, BR-002, UC-1

**Acceptance Criteria**:

- [ ] Given a valid JWT and body `{customerId, intent}`, when posted, then a TMF921 v5.0.0 Intent is created and returned with a `201`-class response.
- [ ] Given a missing/invalid body, when posted, then a TMF921-conformant validation error is returned and no intent is created.
- [ ] Edge case: oversized or malformed payloads are rejected without partial persistence.

**Data Requirements**:

- **Inputs**: `customerId`, natural-language `intent` string, auth token.
- **Outputs**: TMF921 Intent resource (id, lifecycleStatus, expression).
- **Validations**: Schema validation; PII masking applied before downstream processing.

**Priority**: MUST_HAVE

**Complexity**: MEDIUM

**Dependencies**: FR-006 (auth), FR-002 (translation)

**Assumptions**: Caller supplies intent in a supported natural language.

---

#### FR-002: AI/LLM-Based Intent Translation

**Description**: The system must use the Claude-based translation handler to convert natural-language intent into a valid structured TMF921 v5.0.0 Intent (RFC 9315 §5.1.2 Translation).

**Relates To**: BR-002, UC-1

**Acceptance Criteria**:

- [ ] Given a canonical O2C-class intent, when translated, then the output validates against the TMF921 v5.0.0 Intent schema.
- [ ] Given an ambiguous/low-confidence intent, when translated, then the system returns a clarification/validation outcome rather than an invalid Intent.
- [ ] Edge case: translation failures degrade gracefully (no invalid Intent persisted) and are logged with correlation ID.

**Data Requirements**:

- **Inputs**: Masked natural-language intent, prompt/context.
- **Outputs**: Structured TMF921 Intent expression; confidence/validation signal.
- **Validations**: Output schema validation against TMF921 v5.0.0.

**Priority**: MUST_HAVE

**Complexity**: HIGH

**Dependencies**: FR-001, INT-002 (Claude/Anthropic API)

**Assumptions**: Anthropic Claude API is reachable; PII is masked before model invocation.

---

#### FR-003: Autonomous Agent Orchestration via MCP

**Description**: The system must orchestrate intent fulfilment by invoking `McpAdapter.orchestrate()` through the MCP adapter seam, driven by the autonomous agent runtime (RFC 9315 §5.1.3 Orchestration).

**Relates To**: BR-002, BR-005, UC-1

**Acceptance Criteria**:

- [ ] Given an accepted Intent, when the agent runs a fulfilment cycle, then orchestration is invoked via the `McpAdapter` interface (not operator-specific code in the public repo).
- [ ] Given the `MockMcpAdapter` in alpha, when the O2C journey runs, then it completes to `reportState: fulfilled`.
- [ ] Edge case: a failing adapter call triggers retry-with-backoff and circuit-breaker behaviour (see NFR-A-003).

**Data Requirements**:

- **Inputs**: TMF921 Intent, session context, agent reasoning context.
- **Outputs**: Orchestration result, fulfilment status updates.
- **Validations**: Adapter responses validated before state transition.

**Priority**: MUST_HAVE

**Complexity**: HIGH

**Dependencies**: FR-002, INT-001 (MCP/CAMARA seam), FR-007 (agent identity)

**Assumptions**: A configured adapter (mock or operator) is reachable.

---

#### FR-004: Intent Lifecycle Management (Create / Retrieve / Delete)

**Description**: The system must support TMF921 v5.0.0 intent lifecycle operations: create (FR-001), retrieve `GET /api/v1/intent/{id}`, and delete `DELETE /api/v1/intent/{id}` (RFC 9315 §6 Lifecycle).

**Relates To**: BR-001, UC-2, UC-3

**Acceptance Criteria**:

- [ ] Given an existing intent ID, when retrieved, then the TMF921 Intent and IntentReport are returned from the SSoT.
- [ ] Given a delete request, when processed, then lifecycle is terminated, cancellation is requested via `cancelIntent()` if in-flight, and a TMF921-conformant response is returned.
- [ ] Edge case: unknown ID returns a TMF921-conformant 404.

**Data Requirements**:

- **Inputs**: Intent ID, auth token.
- **Outputs**: TMF921 Intent / IntentReport; deletion confirmation.
- **Validations**: ID existence; authorisation for the operation.

**Priority**: MUST_HAVE

**Complexity**: MEDIUM

**Dependencies**: FR-005 (SSoT), FR-006 (auth)

**Assumptions**: Lifecycle states follow TMF921 v5.0.0.

---

#### FR-005: Intent-State Single Source of Truth

**Description**: The system must persist authoritative intent state in a Redis-backed Single Source of Truth; any derived/cached copies must be read-only and clearly labelled (RFC 9315 §4 Principle 1).

**Relates To**: BR-001, BR-004, UC-2

**Acceptance Criteria**:

- [ ] Given concurrent operations on one intent, when persisted, then a single authoritative record is maintained without split-brain.
- [ ] Given a read, when served, then it originates from the SSoT or a labelled read-only derived copy.
- [ ] Edge case: no bidirectional sync exists without an explicit conflict-resolution strategy.

**Data Requirements**:

- **Inputs**: Intent and IntentReport records.
- **Outputs**: Authoritative state reads.
- **Validations**: Write authority restricted to the system of record.

**Priority**: MUST_HAVE

**Complexity**: MEDIUM

**Dependencies**: FR-004

**Assumptions**: Redis store is available and access-controlled.

---

#### FR-006: Identity-Based Authentication and Authorisation

**Description**: The system must authenticate every request (human and service) using Keycloak-issued JWTs validated against the configured identity realm, and authorise privileged operations (ODA Canvas UC007).

**Relates To**: BR-004, BR-005, UC-1, UC-3

**Acceptance Criteria**:

- [ ] Given a request without a valid JWT, when received, then it is rejected and audited; no intent is created or mutated.
- [ ] Given a valid JWT, when validated, then the request is authorised per role against the configured realm.
- [ ] Edge case: expired/forged tokens are rejected with a structured auth log entry.

**Data Requirements**:

- **Inputs**: JWT, realm configuration.
- **Outputs**: Auth decision; audit event.
- **Validations**: Signature, expiry, issuer, and role claims.

**Priority**: MUST_HAVE

**Complexity**: MEDIUM

**Dependencies**: INT-003 (Keycloak)

**Assumptions**: Keycloak realm `identityconfig-operator-keycloak` (or configured equivalent) is reachable.

---

#### FR-007: Constrained Agent-Role Identity for Autonomous Cycles

**Description**: Autonomous intent cycles and their MCP/tool calls must execute under a distinct, constrained agent-role identity — never a human or admin identity (RFC 9315 §4 P3; PRIN Principle 4 zero-trust).

**Relates To**: BR-005, UC-1, UC-4

**Acceptance Criteria**:

- [ ] Given an autonomous fulfilment cycle, when it invokes MCP/tools, then calls are made under the agent-role identity.
- [ ] Given an attempt to run a cycle under a human/admin identity, when detected, then it is prevented or flagged.
- [ ] Edge case: agent role grants least privilege; out-of-scope operations are denied.

**Data Requirements**:

- **Inputs**: Agent-role credentials/token, session context.
- **Outputs**: Identity-scoped tool invocations; audit attribution.
- **Validations**: Role scoping verified per privileged operation.

**Priority**: MUST_HAVE

**Complexity**: MEDIUM

**Dependencies**: FR-006, FR-003

**Assumptions**: Agent role is provisioned in the identity provider with least privilege.

---

#### FR-008: IntentReport Generation and Compliance Assessment

**Description**: The system must compute and expose an IntentReport with `reportState` reflecting compliance assessment of fulfilment (RFC 9315 §5.2.1–§5.2.2).

**Relates To**: BR-001, BR-002, UC-1, UC-2

**Acceptance Criteria**:

- [ ] Given a fulfilled intent, when assessed, then `reportState: fulfilled` is projected into the IntentReport.
- [ ] Given a non-fulfilled outcome, when assessed, then `reportState` reflects the actual state with diagnostics (no false "fulfilled").
- [ ] Edge case: report projection matches the TMF921 CTK expectations (regression-guarded).

**Data Requirements**:

- **Inputs**: Fulfilment status, metrics signals.
- **Outputs**: IntentReport with `reportState`.
- **Validations**: Projection validated against TMF921 v5.0.0 and CTK.

**Priority**: MUST_HAVE

**Complexity**: MEDIUM

**Dependencies**: FR-003, FR-005, NFR-M-001 (telemetry/metrics)

**Assumptions**: Monitoring signals are available to drive assessment.

---

#### FR-009: PII Masking of Subscriber Context

**Description**: The system must mask subscriber/personal data before it is passed to the AI translation layer and downstream processing, and avoid persisting unmasked PII unnecessarily.

**Relates To**: BR-004, BR-005, UC-1

**Acceptance Criteria**:

- [ ] Given an intent containing personal data, when processed, then PII is masked before model invocation and downstream handling.
- [ ] Given logs/telemetry, when emitted, then they do not contain unmasked subscriber PII.
- [ ] Edge case: masking failure blocks model invocation rather than leaking PII.

**Data Requirements**:

- **Inputs**: Raw intent payload.
- **Outputs**: Masked payload for processing.
- **Validations**: Masking middleware applied on the ingestion path.

**Priority**: MUST_HAVE

**Complexity**: MEDIUM

**Dependencies**: FR-001, FR-002

**Assumptions**: PII fields are identifiable by the masking middleware.

---

#### FR-010: Published MCP Adapter Seam with Mock Implementation

**Description**: The public framework must expose the `McpAdapter` interface (`src/mcp/McpAdapter.ts`) and ship a `MockMcpAdapter` for local development, with production operator adapters confined to the private repo.

**Relates To**: BR-003, UC-1

**Acceptance Criteria**:

- [ ] Given the public repo, when inspected, then the `McpAdapter` interface and `MockMcpAdapter` are present and the interface is unchanged or backward-compatibly extended.
- [ ] Given the public repo, when scanned, then no operator-specific adapter implementation or credential is present.
- [ ] Edge case: interface methods map to RFC 9315 (`orchestrate`/§5.1.3, `getIntentStatus`/§5.2.1, `getCapabilities`/§4 P5, `cancelIntent`/§5.2.3).

**Data Requirements**:

- **Inputs**: Adapter interface contract.
- **Outputs**: Mock orchestration responses for local dev.
- **Validations**: Interface conformance; no proprietary leakage.

**Priority**: MUST_HAVE

**Complexity**: LOW

**Dependencies**: FR-003

**Assumptions**: Operator adapters are delivered separately under SI.

---

#### FR-011: Agent and Application Telemetry Emission

**Description**: The system must emit structured telemetry — logs, metrics, and OpenTelemetry traces — including agent reasoning, tool invocations, GenAI semantic conventions, and RFC 9315 phase tags (ODA Canvas UC006).

**Relates To**: BR-005, UC-4

**Acceptance Criteria**:

- [ ] Given any intent processed, when traced, then spans carry correlation/intent IDs and `rfc9315.phase` tags.
- [ ] Given an autonomous cycle, when run, then GenAI (`gen_ai.*`) and AI-gateway (`ai_gateway.*`) events are emitted with the acting identity.
- [ ] Edge case: telemetry initialisation is the first import of every entrypoint (bootstrap rule), verified for new processes.

**Data Requirements**:

- **Inputs**: Runtime spans/metrics/logs.
- **Outputs**: OTLP export to LangSmith (default) or a Canvas collector.
- **Validations**: Bootstrap ordering check; span attribute presence.

**Priority**: MUST_HAVE

**Complexity**: MEDIUM

**Dependencies**: FR-003, FR-007

**Assumptions**: An OTLP-compatible backend is configured.

---

#### FR-012: Adapter Capability Exposure

**Description**: The system must expose adapter/orchestration capabilities via `getCapabilities()` so callers and auditors can discover what an adapter can do (RFC 9315 §4 Principle 5 — Capability Exposure).

**Relates To**: BR-001, UC-4

**Acceptance Criteria**:

- [ ] Given a configured adapter, when capabilities are queried, then a capability descriptor is returned.
- [ ] Given the mock adapter, when queried, then it returns a representative capability set for local dev.

**Data Requirements**:

- **Inputs**: Adapter configuration.
- **Outputs**: Capability descriptor.
- **Validations**: Descriptor schema present.

**Priority**: SHOULD_HAVE

**Complexity**: LOW

**Dependencies**: FR-010

**Assumptions**: Adapters implement the capability method.

---

#### FR-013: Intent Status Monitoring

**Description**: The system must provide intent fulfilment status via `getIntentStatus()` / `GET /api/v1/intent/{id}` for monitoring (RFC 9315 §5.2.1 Monitoring).

**Relates To**: BR-001, UC-2

**Acceptance Criteria**:

- [ ] Given an in-flight intent, when status is queried, then current fulfilment status is returned.
- [ ] Given a completed intent, when queried, then terminal status and IntentReport are returned.

**Data Requirements**:

- **Inputs**: Intent ID.
- **Outputs**: Status / IntentReport.
- **Validations**: SSoT-sourced status.

**Priority**: SHOULD_HAVE

**Complexity**: LOW

**Dependencies**: FR-005, FR-008

**Assumptions**: Status is derivable from monitoring signals.

---

## Non-Functional Requirements (NFRs)

### Performance Requirements

#### NFR-P-001: Response Time

**Requirement**: Interactive API operations must meet alpha-phase latency targets under nominal load.

- Intent retrieval (`GET /api/v1/intent/{id}`): < 200 ms (p95).
- Natural-language submission to accepted TMF921 Intent (including AI translation): < 10 seconds (p95).
- Delete operation: < 500 ms (p95) excluding downstream cancellation latency.

**Measurement Method**: APM / OpenTelemetry latency histograms (p50, p95, p99).

**Load Conditions**:

- Peak load (alpha target): 50 concurrent intent submissions.
- Average load: 5 intents/second sustained.
- Data volume: up to 100k intent records in the SSoT.

**Priority**: HIGH

---

#### NFR-P-002: Throughput and AI-Cost Efficiency

**Requirement**: The system must sustain ≥ 5 intent submissions/second at the alpha target and scale horizontally to 3x that within the alpha-to-beta window. AI-inference cost-per-intent must be tracked as a first-class efficiency metric.

**Scalability**: Stateless request-handling components scale horizontally without code change.

**Priority**: HIGH

---

### Availability and Resilience Requirements

#### NFR-A-001: Availability Target

**Requirement**: Alpha environment target ≥ 99.0% service availability; SI/production engagements adopt the operator-contracted SLA (e.g. 99.9%/99.95%).

- Maximum planned downtime (alpha): defined maintenance windows.
- Production SLA: per operator contract (RTO/RPO defined per engagement).

**Maintenance Windows**: Agreed per environment; production windows per operator contract.

**Priority**: HIGH

---

#### NFR-A-002: Disaster Recovery

**RPO (Recovery Point Objective)**: Intent-state data loss target — alpha: ≤ 15 minutes; production: per operator contract.

**RTO (Recovery Time Objective)**: alpha: ≤ 4 hours; production: per operator contract.

**Backup Requirements**:

- SSoT backup frequency defined per environment; encrypted at rest.
- Backup retention aligned with compliance and recovery requirements.
- Geographic placement compliant with operator residency terms.

**Failover Requirements**:

- Automatic failover for production: target YES (per engagement).
- Failover time: < operator-contracted RTO.

**Priority**: HIGH

---

#### NFR-A-003: Fault Tolerance

**Requirement**: The system must degrade gracefully when external operator, MCP, AI-inference, or identity dependencies fail, and recover automatically (RFC 9315 §5.2.3; PRIN Principle 2).

**Resilience Patterns Required**:

- [ ] Circuit breaker for external operator and MCP dependencies (Istio).
- [ ] Retry with exponential backoff and jitter on transient failures.
- [ ] Timeout on all network and AI-inference calls.
- [ ] Bulkhead isolation so one operator adapter cannot starve another.
- [ ] Graceful degradation when non-critical services (telemetry, enrichment) fail.

**Priority**: CRITICAL

---

### Scalability Requirements

#### NFR-S-001: Horizontal Scaling

**Requirement**: The system must scale horizontally without code change, driven by demand metrics (request rate, queue depth, latency), using Kubernetes HPA.

**Growth Projections** (indicative, alpha → SI):

- Alpha: 50 concurrent submissions, 100k intent records.
- SI pilot (Year 1): per-operator tenant load; bursty campaign peaks.
- Multi-tenant (future): capacity model per operator tenant.

**Scaling Triggers**: Auto-scale on CPU > 70% or demand-metric thresholds.

**Priority**: HIGH

---

#### NFR-S-002: Tenant and Data Volume Scaling

**Requirement**: The architecture must accommodate per-operator tenant isolation and growth in intent/report volume without architectural change, with no fixed-capacity assumptions in intent processing.

**Data Archival Strategy**: Retention/archival tiers for historical intents and reports per operator policy.

**Priority**: MEDIUM

---

### Security Requirements

#### NFR-SEC-001: Authentication

**Requirement**: All access must be authenticated. Human access uses MFA; service-to-service and agent calls use signed tokens / mTLS. JWTs validated against the configured Keycloak realm.

**Multi-Factor Authentication (MFA)**:

- Required for: human/administrative access and privileged operations.
- Agent-to-service: distinct agent-role token (FR-007), not MFA.

**Session Management**:

- Token expiry and re-validation enforced; privileged operations re-checked per call.

**Priority**: CRITICAL

---

#### NFR-SEC-002: Authorization

**Requirement**: Role-based access control with least privilege. Autonomous cycles run under constrained agent roles, not human/admin identities.

**Roles and Permissions**: Human roles, service roles, and a least-privilege agent role; to be detailed in the (pending) STKE RACI and security design.

**Privilege Elevation**: Time-boxed where required; no standing elevated agent privilege.

**Priority**: CRITICAL

---

#### NFR-SEC-003: Data Encryption

**Requirement**:

- Data in transit: TLS 1.3 (mTLS within the Istio mesh; TLS egress to operator/AI endpoints).
- Data at rest: encryption for all data stores (SSoT, backups).
- Key management: via a secure vault mechanism (no keys in code/config/public repo).

**Encryption Scope**:

- [ ] SSoT (Redis) encryption at rest.
- [ ] Backup encryption.
- [ ] Encrypted transport for all network communication.
- [ ] Field-level handling/masking for subscriber PII (see FR-009).

**Priority**: CRITICAL

---

#### NFR-SEC-004: Secrets Management

**Requirement**: No secrets (API keys, operator/CAMARA credentials, certificates, `.env` values, K8s secret values) in code, configuration, or the public repository.

**Secrets Storage**: Secure vault / Kubernetes secret management outside the public repo.

**Secrets Rotation**: Periodic rotation for operator and service credentials.

**Priority**: CRITICAL

---

#### NFR-SEC-005: Vulnerability Management

**Requirement**:

- Dependency scanning (e.g. Dependabot) and code scanning (e.g. CodeQL) in CI — no open critical/high alerts in `src/` at release.
- Static and dynamic security testing as the pipeline matures.
- Penetration testing prior to production SI go-live.

**Remediation SLA**:

- Critical: 24 hours.
- High: 7 days.
- Medium: 30 days.

**Priority**: HIGH

---

#### NFR-SEC-006: Dependency Licence Compatibility

**Requirement**: All public-repo dependencies must be licence-compatible with Apache 2.0 (Apache, MIT, BSD, ISC). GPL is prohibited; LGPL requires review. File-level copyright headers retained on all source files.

**Measurement Method**: Licence check on dependency addition; header check on new source files.

**Priority**: CRITICAL

---

### Compliance and Regulatory Requirements

#### NFR-C-001: Data Privacy Compliance (PDPA 2010)

**Applicable Regulations**: Malaysia Personal Data Protection Act (PDPA) 2010 for subscriber personal data; operator-specific regulatory obligations as contracted.

**Compliance Requirements**:

- [ ] Lawful handling of subscriber personal data; minimisation and masking (FR-009).
- [ ] Data classification applied (PUBLIC/INTERNAL/CONFIDENTIAL/RESTRICTED).
- [ ] Privacy-by-design in intent processing and telemetry.
- [ ] Breach handling and notification per applicable obligation.
- [ ] DPIA completed for AI processing of subscriber data (run `/arckit:dpia`).

**Data Residency**: Malaysian subscriber personal data resides in jurisdictions compliant with PDPA 2010 and operator contractual residency; cross-border transfers require a documented legal basis.

**Data Retention**: Automated deletion after defined retention; legal-hold capability.

**Priority**: CRITICAL

---

#### NFR-C-002: Audit Logging

**Requirement**: Comprehensive, structured audit trail for authentication/authorisation events and autonomous agent actions.

**Audit Log Contents** (for sensitive/privileged operations):

- Who: human or agent-role identity.
- What: action performed (incl. tool invocation).
- When: UTC timestamp.
- Where: service component.
- Why: correlation/intent ID and agent reasoning reference.
- Result: success/failure with diagnostics.

**Log Retention**: Security/audit logs retained per compliance (typically 1–7 years); application logs 30–90 days; metrics 1–2 years with aggregation.

**Log Integrity**: Tamper-evident handling for audit logs where required.

**Priority**: HIGH

---

#### NFR-C-003: Standards-Conformance Verification

**Requirement**: The TMF921 v5.0.0 Conformance Test Kit (CTK) must be executed and recorded each release; public API changes reviewed for backward compatibility; RFC 9315 phase mapping maintained.

**Report Types**:

- TMF921 CTK conformance result: per release, with run ID, date, and commit/tag.
- RFC 9315 phase traceability: maintained in the Standards Implementation Map.

**Priority**: CRITICAL

---

### Usability Requirements

#### NFR-U-001: API and Developer Experience

**Requirement**: The system must offer a consistent, standards-based API and an agent-readable context surface so that operator integrators and fresh agent/developer sessions become productive without tribal knowledge (PRIN Principle 14).

**UX/DX Standards**:

- TMF921 v5.0.0-conformant request/response shapes and error formats.
- Context-first documentation (project context, roadmap, decision docs, compliance evidence) kept current.

**Priority**: MEDIUM

---

### Maintainability and Supportability Requirements

#### NFR-M-001: Observability

**Requirement**: Comprehensive instrumentation for monitoring, troubleshooting, and capacity planning, including agent behaviour (RFC 9315 §5.2.1; PRIN Principle 5).

**Telemetry Requirements**:

- **Logging**: Structured logs with correlation and intent IDs.
- **Metrics**: Request volume, latency percentiles (p50/p95/p99), error rates, intent-fulfilment rates, AI-inference cost-per-intent.
- **Tracing**: Distributed trace context across intent processing and MCP calls (OpenTelemetry).
- **Agent telemetry**: GenAI semantic conventions, `rfc9315.phase` tags, AI-gateway events.
- **Alerting**: SLO-based alerting with actionable runbooks.

**Telemetry Bootstrap Rule**: `src/telemetry.ts` must be the first import of `src/index.ts`; new entrypoints (workers, cron, scripts) must `import './telemetry'` first.

**Log Levels**: DEBUG, INFO, WARN, ERROR, FATAL.

**Priority**: HIGH

---

#### NFR-M-002: Documentation and Agent-Readable Context

**Requirement**: Maintain current architecture and context documentation for human and AI-agent consumers.

**Documentation Types**:

- [ ] Architecture documentation (C4, deployment summary).
- [ ] API documentation (TMF921-aligned).
- [ ] Standards traceability (RFC 9315 / TMF921 mapping).
- [ ] Compliance evidence (CTK runs, dated, tied to commit/tag).
- [ ] Runbooks and decision docs (ADRs with standards citations).

**Documentation Currency**: Context/compliance docs updated alongside code changes.

**Priority**: MEDIUM

---

#### NFR-M-003: Operational Runbooks

**Requirement**: Runbooks for deployment, rollback, backup/restore, scaling, DR, and incident response (including agent-misbehaviour containment).

**Runbook Coverage**:

- [ ] Deployment and rollback.
- [ ] Backup and restore of the SSoT.
- [ ] Scaling procedures.
- [ ] Incident response for common failure modes (operator/MCP/AI/identity outages).
- [ ] CTK seed and conformance re-verification.

**Priority**: MEDIUM

---

### Portability and Interoperability Requirements

#### NFR-I-001: API Standards (TMF921)

**Requirement**: All intent-management APIs must conform to TMF921 v5.0.0 resource models, response shapes, and lifecycle semantics; versioning via URL path (`/api/v1/`).

**API Design Principles**:

- RESTful design with standard HTTP methods and JSON.
- Consistent TMF921-conformant error responses.
- Backward-compatibility review for public API changes.

**Priority**: CRITICAL

---

#### NFR-I-002: Integration via Published Interfaces (Loose Coupling)

**Requirement**: Systems must integrate only through published APIs (TMF921), the MCP interface, or asynchronous events — no shared database or filesystem across boundaries (PRIN Principles 10–11).

**Integration Patterns**:

- [ ] RESTful API integration (TMF921).
- [ ] MCP interface to operator adapters.
- [ ] Event-driven / async for non-real-time orchestration where applicable.

**Integration SLA**: Defined per integration; resilience patterns per NFR-A-003.

**Priority**: HIGH

---

#### NFR-I-003: Infrastructure as Code

**Requirement**: All infrastructure (Kubernetes manifests, Istio service-mesh policy) must be declarative, version-controlled, and deployed via automated pipelines; no manual production changes (PRIN Principle 15).

**Scope**:

- [ ] Cluster manifests for the main app and MCP services.
- [ ] Istio policy (mTLS, circuit breakers, egress).
- [ ] Environments reproducible from code.

**Priority**: HIGH

---

## Integration Requirements

### External System Integrations

#### INT-001: Operator CAMARA APIs via MCP Adapter Seam

**Purpose**: Orchestrate intent fulfilment against operator network capabilities through the MCP adapter seam.

**Integration Type**: Real-time API via the `McpAdapter` interface (mock in alpha; operator CAMARA adapters in private repo for SI).

**Data Exchanged**:

- **From ibn-core to operator**: Orchestration requests derived from TMF921 Intent; cancellation requests.
- **From operator to ibn-core**: Fulfilment status, capability descriptors.

**Integration Pattern**: Request/response via MCP; resilience per NFR-A-003.

**Authentication**: Operator credentials held in the private repo / vault (never public); mTLS/signed tokens; agent-role identity (FR-007).

**Error Handling**: Retry with backoff, circuit breaker, bulkhead isolation per operator.

**SLA**: Per operator engagement.

**Owner**: Operator Integration Architect (operator side); Vpnet SI (adapter delivery).

**Priority**: CRITICAL

---

#### INT-002: Anthropic Claude API (AI Translation)

**Purpose**: Provide LLM-based translation of natural-language intent to TMF921 Intent and agent reasoning.

**Integration Type**: Real-time API (Anthropic Claude; MIT-licensed MCP protocol used for tool integration).

**Data Exchanged**:

- **From ibn-core to Claude**: Masked intent text and prompt/context (PII masked per FR-009).
- **From Claude to ibn-core**: Structured TMF921 Intent expression; agent reasoning/tool decisions.

**Integration Pattern**: Request/response with timeouts; graceful degradation on failure.

**Authentication**: API key held in secure vault (never in public repo / config).

**Error Handling**: Timeout, retry with backoff, fallback to validation error (no invalid Intent persisted).

**SLA**: Per provider; cost-per-intent tracked (NFR-P-002).

**Owner**: ibn-core engineering.

**Priority**: CRITICAL

---

#### INT-003: Keycloak Identity Provider (JWT / OIDC)

**Purpose**: Authenticate and authorise human, service, and agent identities (ODA Canvas UC007).

**Integration Type**: OIDC / JWT validation against the configured Keycloak realm.

**Data Exchanged**:

- **From Keycloak to ibn-core**: Signed JWTs, realm/JWKS metadata.
- **From ibn-core to Keycloak**: Token validation / discovery requests.

**Integration Pattern**: Token validation per request; agent-role token issuance for autonomous cycles.

**Authentication**: Realm trust; signature/issuer/expiry validation.

**Error Handling**: Reject invalid tokens; audit; degrade safely if IdP unreachable (fail-closed for privileged ops).

**SLA**: Per environment.

**Owner**: SI Engineer / Platform Operator.

**Priority**: CRITICAL

---

#### INT-004: OpenTelemetry Backend (LangSmith / ODA Canvas Collector)

**Purpose**: Receive application and agent telemetry for observability and AI-behaviour evaluation (ODA Canvas UC006).

**Integration Type**: OTLP/HTTP export; default backend LangSmith, overridable to any Canvas-compatible collector.

**Data Exchanged**:

- **From ibn-core to backend**: Traces, metrics, logs, GenAI/`rfc9315.phase`/AI-gateway events (no unmasked PII).

**Integration Pattern**: Async export; non-critical (graceful degradation if backend unavailable).

**Authentication**: Backend credentials in secure config (not public repo). Note: OTLP metrics exporter is hard-disabled where it caused unauthenticated egress; traces remain the primary signal.

**Error Handling**: Drop/buffer on backend failure without impacting request path.

**SLA**: Best-effort (observability is non-critical to request success).

**Owner**: ibn-core engineering.

**Priority**: HIGH

---

## Data Requirements

### Data Entities

#### Entity 1: Intent

**Description**: The authoritative TMF921 v5.0.0 Intent resource translated from natural-language input; the system of record held in the Redis SSoT.

**Attributes**:
| Attribute | Type | Required | Description | Constraints |
|-----------|------|----------|-------------|-------------|
| id | UUID/String | Yes | Unique intent identifier | Primary key |
| customerId | String | Yes | Customer/tenant reference | Indexed; may be masked |
| expression | Object | Yes | TMF921 Intent expression (translated) | TMF921 v5.0.0 schema |
| lifecycleStatus | Enum | Yes | TMF921 lifecycle state | e.g. acknowledged, inProgress, completed |
| createdAt | Timestamp | Yes | Creation time (UTC) | Indexed |
| updatedAt | Timestamp | Yes | Last update (UTC) | Indexed |

**Relationships**:

- One-to-many with IntentReport (an Intent has report state over time).

**Data Volume**: Alpha up to 100k records; per-operator growth in SI.

**Access Patterns**: By id (read), by lifecycle state (monitoring).

**Data Classification**: CONFIDENTIAL (may reference subscriber context).

**Data Retention**: Per operator policy; automated deletion after retention.

---

#### Entity 2: IntentReport

**Description**: The compliance-assessment report for an Intent, carrying `reportState` (RFC 9315 §5.2.2; TMF921 IntentReport).

**Attributes**:
| Attribute | Type | Required | Description | Constraints |
|-----------|------|----------|-------------|-------------|
| id | UUID/String | Yes | Report identifier | Primary key |
| intentId | UUID/String | Yes | Parent Intent reference | Foreign key |
| reportState | Enum | Yes | Compliance/fulfilment state | e.g. fulfilled, degraded, notFulfilled |
| generatedAt | Timestamp | Yes | Report generation time (UTC) | Indexed |
| details | Object | No | Diagnostics / metrics references | — |

**Relationships**:

- Many-to-one with Intent.

**Data Volume**: ≥ one per Intent; more for long-running intents.

**Access Patterns**: By intentId; latest-state queries.

**Data Classification**: CONFIDENTIAL.

**Data Retention**: Aligned with Intent retention.

---

#### Entity 3: Agent Action / Telemetry Event

**Description**: A record/span of an autonomous agent action — reasoning reference, tool invocation, acting identity, and RFC 9315 phase — emitted as telemetry.

**Attributes**:
| Attribute | Type | Required | Description | Constraints |
|-----------|------|----------|-------------|-------------|
| correlationId | String | Yes | Intent/trace correlation | Indexed |
| identity | String | Yes | Acting agent-role identity | Must be agent role for cycles |
| phase | Enum | Yes | RFC 9315 phase tag | rfc9315.phase value |
| toolInvocation | Object | No | MCP/tool call detail | No unmasked PII |
| timestamp | Timestamp | Yes | Event time (UTC) | — |

**Relationships**:

- References an Intent via correlationId.

**Data Volume**: High-cardinality (telemetry); retained per log policy.

**Access Patterns**: By correlationId; audit queries.

**Data Classification**: INTERNAL (must exclude unmasked subscriber PII).

**Data Retention**: Per audit/log retention (NFR-C-002).

---

### Data Quality Requirements

**Data Accuracy**: Validation rules and TMF921 schema enforced at ingestion; no invalid Intent persisted.

**Data Completeness**: No unexpected nulls in required Intent/IntentReport fields.

**Data Consistency**: Cross-system reconciliation between intent records and operator state.

**Data Timeliness**: Freshness SLAs for status/report defined and monitored.

**Data Lineage**: Source-to-target mapping from natural-language input → TMF921 Intent → IntentReport; translation/orchestration logic version-controlled and reviewable.

---

### Data Migration Requirements

**Migration Scope**: None for alpha (greenfield; no legacy data import). Future SI engagements may require import of operator reference data — out of scope for v1.0.

**Migration Strategy**: N/A for alpha.

**Data Transformation**: N/A for alpha.

**Data Validation**: N/A for alpha.

**Rollback Plan**: N/A for alpha.

**Migration Timeline**: N/A for alpha.

---

## Constraints and Assumptions

### Technical Constraints

**TC-1**: Public framework must remain Apache 2.0; all public dependencies licence-compatible (no GPL); file-level copyright headers retained.

**TC-2**: Operator-specific CAMARA adapters and credentials must live only in the private repo; the public `McpAdapter` interface must not be weakened.

**TC-3**: Public contracts must not diverge from RFC 9315 / TMF921 v5.0.0 without an approved, documented exception (NON-NEGOTIABLE principles 3, 4, 9).

**TC-4**: Telemetry initialisation must be the first import of every process entrypoint (bootstrap rule).

**TC-5**: I2NSF / individual-submission draft terminology must not be adopted in public-repo module names.

---

### Business Constraints

**BC-1**: Standards conformance (RFC 9315 / TMF921) and the open-core seam are programme-defining; they may not be waived (only implementation detail may vary with compensating controls).

**BC-2**: Cited version tags (v1.4.x–v2.0.1) must remain immutable to preserve academic citations.

**BC-3**: No proprietary TM Forum IG document text/diagrams may be copied into the repo (cite by reference only).

**BC-4**: Delivery to Malaysian operators is subject to PDPA 2010 and operator-contracted residency/regulatory obligations.

---

### Assumptions

**A-1**: The Anthropic Claude API and configured Keycloak realm are reachable from the runtime environment.

**A-2**: In alpha, the `MockMcpAdapter` (or an operator sandbox) stands in for live operator CAMARA endpoints; live CAMARA integration is deferred to v3.0.0.

**A-3**: A Stakeholder Analysis (`STKE`), Risk Register (`RISK`), and Business Case (`SOBC`) will be produced; requirement-to-goal traceability and conflict resolution will be revalidated against them.

**A-4**: PII fields in intent payloads are identifiable by the masking middleware.

**Validation Plan**: Validate A-1/A-2 via the canonical O2C smoke test; validate A-3 by running `/arckit:stakeholders`, `/arckit:risk`, `/arckit:sobc`; validate A-4 via masking tests on representative payloads.

---

## Success Criteria and KPIs

### Business Success Metrics

| Metric | Baseline | Target | Timeline | Measurement Method |
|--------|----------|--------|----------|-------------------|
| TMF921 CTK conformance | 83/83 (v2.0.1) | 100% maintained | Each release | CTK run with ID/date |
| O2C translation success (no human correction) | New (alpha) | ≥ 95% | Alpha eval set | Evaluation harness |
| Operator-specific logic/credentials in public repo | 0 | 0 (maintained) | Each release | Repo scan |
| Time-to-intent (submission → accepted Intent, p95) | New (alpha) | < 10 s | Alpha | OTel latency |

### Technical Success Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Intent retrieval latency (p95) | < 200 ms | OTel / APM |
| Service availability (alpha) | ≥ 99.0% | Uptime monitoring |
| Agent actions under agent-role identity | 100% | Audit log analysis |
| Open critical/high security alerts in `src/` at release | 0 | CodeQL / Dependabot |
| Spans carrying `rfc9315.phase` for processed intents | 100% | Telemetry inspection |

### User Adoption Metrics

| Metric | Target | Timeline | Measurement Method |
|--------|--------|----------|-------------------|
| Operator integration partners onboarded (SI) | ≥ 1 pilot | Post-alpha | Engagement tracking |
| Canonical O2C journey green in CI | Always | Ongoing | CI smoke test |
| Developer/agent onboarding without tribal knowledge | Qualitative pass | Ongoing | Session feedback |

---

## Dependencies and Risks

### Dependencies

| Dependency | Description | Owner | Target Date | Status | Impact if Delayed |
|------------|-------------|-------|-------------|--------|-------------------|
| Anthropic Claude API access | LLM translation/agent reasoning | ibn-core eng | Alpha | On Track | HIGH |
| Keycloak realm provisioning | Identity for human/service/agent | SI / Platform | Alpha | On Track | HIGH |
| Private operator-adapter repo | CAMARA adapters for SI | Vpnet SI | Pre-SI | At Risk | HIGH |
| Operator sandbox / CAMARA access | Live integration (v3.0.0) | Operator | Post-alpha | At Risk | MEDIUM |
| Stakeholder Analysis (STKE) | Goal traceability & conflicts | Architecture | Before beta gate | Blocked | MEDIUM |

---

### Risks

| Risk ID | Description | Probability | Impact | Mitigation Strategy | Owner |
|---------|-------------|-------------|--------|---------------------|-------|
| R-1 | AI translation produces invalid/incorrect TMF921 Intent | MEDIUM | HIGH | Output schema validation; clarification path; eval harness; no invalid Intent persisted (FR-002) | ibn-core eng |
| R-2 | Operator credential or adapter logic leaks into public repo | LOW | HIGH | Repo scans, CI checks, secrets in vault, seam rules (BR-003, TC-2) | Security Lead |
| R-3 | Autonomous agent over-reaches privilege on live network | LOW | HIGH | Constrained agent-role identity, least privilege, audit (FR-007, NFR-SEC-002) | Security Lead |
| R-4 | TMF921 CTK conformance regression | MEDIUM | HIGH | CTK as release gate; IntentReport projection guard (NFR-C-003) | ibn-core eng |
| R-5 | PDPA / residency non-compliance in SI deployment | MEDIUM | HIGH | PII masking, residency mapping, DPIA (NFR-C-001, FR-009) | Compliance Officer |
| R-6 | External dependency outage (Claude/Keycloak/MCP) | MEDIUM | MEDIUM | Circuit breakers, retries, timeouts, graceful degradation (NFR-A-003) | ibn-core eng |

**Risk Scoring**: Probability × Impact = Risk Level. High → executive escalation; Medium → active monitoring; Low → accepted.

---

## Requirement Conflicts & Resolutions

> **Purpose**: Document conflicting requirements arising from competing drivers and how they were resolved.
>
> **Source**: No Stakeholder Analysis (`ARC-001-STKE-v*.md`) exists yet; the conflicts below are inferred from `ARC-000-PRIN-v1.0` and the project context. **Revalidate against the STKE conflict analysis and RACI once produced.**

### Conflict C-1: AI Translation Speed vs. Translation Correctness

**Conflicting Requirements**:

- **Requirement A**: NFR-P-001 — natural-language submission to accepted Intent in < 10 s (p95).
- **Requirement B**: FR-002 / R-1 — high translation correctness with validation and clarification (no invalid Intent persisted).

**Stakeholders Involved**:

- **Product Owner / SI Delivery**: want fast time-to-intent for a responsive operator experience.
- **Security Lead / Operator Compliance**: want correctness because intents mutate live network config.

**Nature of Conflict**: Additional validation, clarification round-trips, and schema checks add latency that can breach the speed target on ambiguous inputs.

**Trade-off Analysis**:

| Option | Pros | Cons | Impact |
|--------|------|------|--------|
| **Option 1**: Prioritise speed (skip clarification) | Faster p95 | Risk of invalid/incorrect Intent on live network | Product happy; Security concerned |
| **Option 2**: Prioritise correctness (always validate/clarify) | Safer | Slower; may breach < 10 s on ambiguous input | Security happy; Product concerned |
| **Option 3**: Innovate (fast path for high-confidence, clarify only on low-confidence) | Speed AND safety for common case | Implementation complexity | Both satisfied for typical O2C |

**Resolution Strategy**: INNOVATE

**Decision**: Option 3 — fast-path high-confidence translations to meet < 10 s; trigger clarification/validation only when confidence is low; never persist an invalid Intent.

**Rationale**: Standards conformance and live-network safety (NON-NEGOTIABLE principles) cannot be traded for latency; a confidence-gated path preserves the speed target for the common O2C case.

**Decision Authority**: Lead Architect / CTO (pending STKE RACI confirmation).

**Impact on Requirements**: NFR-P-001 target applies to high-confidence path; FR-002 retains the clarification path as the safety fallback.

**Stakeholder Management**: Product Owner accepts that ambiguous intents may exceed the latency target in exchange for correctness; metric reported on the high-confidence path.

**Future Consideration**: Re-tune the confidence threshold using alpha evaluation data.

---

### Conflict C-2: Security/Zero-Trust Friction vs. Developer & Agent Velocity

**Conflicting Requirements**:

- **Requirement A**: NFR-SEC-001/002, FR-006/007 — authenticate everything, constrained agent-role identity, least privilege.
- **Requirement B**: NFR-U-001 / PRIN Principle 14 — agent-native developer experience; fast onboarding without tribal knowledge.

**Stakeholders Involved**:

- **Security Lead**: wants strict identity, least privilege, mTLS for all calls including agents.
- **ibn-core engineering / open-source community**: want low-friction local development and contribution.

**Nature of Conflict**: Full zero-trust (Keycloak, mTLS, agent-role tokens) adds setup friction that can slow local dev and external contribution.

**Trade-off Analysis**:

| Option | Pros | Cons | Impact |
|--------|------|------|--------|
| **Option 1**: Enforce full zero-trust everywhere incl. local | Maximum security | High local-dev friction; deters contributors | Security happy; Eng/community concerned |
| **Option 2**: Relax auth for local/dev only | Fast dev | Risk of insecure defaults bleeding to prod | Eng happy; Security concerned |
| **Option 3**: Compromise — `MockMcpAdapter` + dev profile for local; full zero-trust enforced in SI/production | Low local friction AND strong prod posture | Two configurations to maintain | Both satisfied |

**Resolution Strategy**: COMPROMISE

**Decision**: Option 3 — ship `MockMcpAdapter` and a local dev profile (no operator credentials, simplified local auth) while enforcing full zero-trust (Keycloak JWT, mTLS, agent-role identity) in SI/production; secrets never in the public repo.

**Rationale**: Preserves the agent-native DX principle and open-core contribution flow without weakening the NON-NEGOTIABLE security posture in operator environments.

**Decision Authority**: Lead Architect / CTO with Security Lead (pending STKE RACI confirmation).

**Impact on Requirements**: FR-010 (mock adapter) and NFR-U-001 satisfy local DX; NFR-SEC-001/002/004 and FR-006/007 govern SI/production.

**Stakeholder Management**: Security Lead accepts a documented dev profile on the condition that production enforcement is gated by the Pre-Production review; community gets a low-friction local path.

**Future Consideration**: Provide a one-command secure local bootstrap to further reduce the gap.

---

## Timeline and Milestones

### High-Level Milestones

| Milestone | Description | Target Date | Dependencies |
|-----------|-------------|-------------|--------------|
| Requirements Approval | Stakeholder sign-off on this document | 2026-07-05 | This document |
| Stakeholder & Risk Baseline | STKE + RISK produced; conflicts revalidated | 2026-07-19 | Requirements |
| Design Complete (Alpha) | HLD/DLD approved against principles | 2026-08-16 | Requirements |
| Alpha O2C Verified | Canonical O2C green end-to-end with mock adapter | 2026-09-13 | Design |
| Beta / SI Readiness | Operator adapter (private) + zero-trust enforced | [PENDING] (post-alpha) | Alpha, operator access |

---

## Budget

> **Note**: Budget figures are not yet established for this alpha-phase open-core project. To be produced via `/arckit:sobc` (Strategic Outline Business Case) and refined per SI engagement. Placeholders below indicate the categories to be costed; they are intentionally left as [PENDING] rather than fabricated.

### Cost Estimate

| Category | Estimated Cost | Notes |
|----------|----------------|-------|
| Development | [PENDING] | Open-core engineering effort |
| Infrastructure | [PENDING] | Kubernetes/Istio, Redis, environments |
| Third-party services | [PENDING] | Anthropic Claude API, LangSmith, Keycloak hosting |
| Testing | [PENDING] | CTK, performance, security testing |
| Training / Enablement | [PENDING] | SI enablement, documentation |
| **Total** | [PENDING] | To be set in SOBC |

### Ongoing Operational Costs

| Category | Annual Cost | Notes |
|----------|-------------|-------|
| Infrastructure | [PENDING] | Cluster, scaling, Redis |
| Licenses / Services | [PENDING] | AI inference, telemetry backend |
| Support | [PENDING] | SI support, on-call |
| **Total** | [PENDING] | To be set in SOBC |

---

## Approval

### Requirements Review

| Reviewer | Role | Status | Date | Comments |
|----------|------|--------|------|----------|
| Roland Pfeifer | Lead Architect / CTO (Sponsor) | [ ] Approved | [PENDING] | |
| Product Owner | Product Owner | [ ] Approved | [PENDING] | |
| Enterprise / Solution Architect | Architecture | [ ] Approved | [PENDING] | |
| Security Lead | Security | [ ] Approved | [PENDING] | |
| Operator Compliance Officer | Compliance | [ ] Approved | [PENDING] | |

### Sign-Off

By signing below, stakeholders confirm that requirements are complete, understood, and approved to proceed to design phase.

| Stakeholder | Signature | Date |
|-------------|-----------|------|
| Roland Pfeifer, Lead Architect / CTO | _________ | [PENDING] |
| Product Owner, ibn-core | _________ | [PENDING] |

---

## Appendices

### Appendix A: Glossary

| Term | Definition |
|------|------------|
| RFC 9315 | IRTF NMRG Intent-Based Networking concepts and definitions (DOI 10.17487/RFC9315). |
| TMF921 | TM Forum Intent Management API (v5.0.0) — intent CRUD and IntentReport. |
| CTK | Conformance Test Kit — TMF921 test suite verifying API conformance. |
| Intent | A declarative expression of desired outcome, captured as a TMF921 Intent resource. |
| IntentReport | TMF921 resource carrying `reportState` — the compliance/fulfilment assessment. |
| MCP | Model Context Protocol (Anthropic, MIT) — tool/adapter integration protocol. |
| McpAdapter | The public open-core seam interface to operator orchestration (`src/mcp/McpAdapter.ts`). |
| CAMARA | Linux Foundation telco network APIs (Apache 2.0) implemented by operator adapters. |
| SSoT | Single Source of Truth — the authoritative intent-state store (Redis). |
| O2C | Order-to-Cash — the canonical natural-language-intent-to-fulfilment use case. |
| SI | Systems Integration engagement (Vpnet Cloud Solutions delivery model). |
| PDPA 2010 | Malaysia Personal Data Protection Act 2010. |
| ODA Canvas | TM Forum Open Digital Architecture Canvas (UC006 Observability, UC007 Identity). |

### Appendix B: Reference Documents

- ibn-core Enterprise Architecture Principles — `projects/000-global/ARC-000-PRIN-v1.0.md`.
- RFC 9315, Intent-Based Networking — Concepts and Definitions (IRTF NMRG, Oct 2022).
- TM Forum TMF921 Intent Management API v5.0.0.
- (Pending) `ARC-001-STKE`, `ARC-001-RISK`, `ARC-001-SOBC`.

### Appendix C: Wireframes and Mockups

Not applicable — ibn-core is an API-first / agent-native framework with no end-user GUI in scope for v1.0.

### Appendix D: Data Models

See Data Requirements (Entities 1–3). A comprehensive data model can be produced via `/arckit:data-model`.

---

**Document History**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | 2026-06-05 | ArcKit AI | Initial draft |
| 1.0 | 2026-06-05 | ArcKit AI | Initial creation from `/arckit:requirements` command |

## External References

> This section provides traceability from generated content back to source documents.
> Follow citation instructions in the project's citation reference guide.

### Document Register

| Doc ID | Filename | Type | Source Location | Description |
|--------|----------|------|-----------------|-------------|
| ARC-000-PRIN-v1.0 | ARC-000-PRIN-v1.0.md | Architecture Principles | projects/000-global/ | ibn-core enterprise architecture principles (alignment source) |

### Citations

| Citation ID | Doc ID | Page/Section | Category | Quoted Passage |
|-------------|--------|--------------|----------|----------------|
| PRIN-P3 | ARC-000-PRIN-v1.0 | §I.3 Standards Conformance | Constraint | "All intent-handling capabilities MUST conform to RFC 9315 ... TMF921 ... v5.0.0." |
| PRIN-P4 | ARC-000-PRIN-v1.0 | §I.4 Security by Design | Constraint | "defence-in-depth with zero-trust ... every request authenticated, including agent-to-service calls executed under a distinct agent role identity." |
| PRIN-P8 | ARC-000-PRIN-v1.0 | §II.8 Single Source of Truth | Constraint | "RFC 9315 §4 Principle 1 requires a Single Source of Truth ... for intent state." |
| PRIN-P9 | ARC-000-PRIN-v1.0 | §III.9 Open-Core Seam Integrity | Constraint | "Operator-specific logic, credentials ... MUST NOT enter the public repository." |
| PRIN-P5 | ARC-000-PRIN-v1.0 | §I.5 Observability | Constraint | "AI-agent behaviour MUST be a measurable signal, not a black box." |

### Unreferenced Documents

| Filename | Source Location | Reason |
|----------|-----------------|--------|
| — | — | No external/RFP/policy documents present in projects/001-ibn-core-my/external/ or 000-global/policies/ |

---

**Generated by**: ArcKit `/arckit:requirements` command
**Generated on**: 2026-06-05 (GMT)
**ArcKit Version**: 5.11.0
**Project**: ibn-core-my (Project 001)
**Model**: claude-opus-4-8[1m]
**Generation Context**: Generated from project context and `ARC-000-PRIN-v1.0`. No Stakeholder Analysis, Risk Register, Business Case, external documents, or global policies were available; stakeholder set and conflict analysis are interim and flagged for revalidation. AI/LLM/agent capabilities treated as in-scope functional requirements (alpha phase, full-system scope).
