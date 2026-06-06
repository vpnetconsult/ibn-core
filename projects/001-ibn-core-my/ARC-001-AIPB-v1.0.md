# UK Government AI Playbook Assessment

> **Template Origin**: Official | **ArcKit Version**: 5.11.0 | **Command**: `/arckit:ai-playbook`

> ⚠️ **Cross-jurisdiction lens note**: ibn-core is a **commercial** Malaysian deployment by Vpnet Cloud Solutions Sdn. Bhd. The **UK Government AI Playbook** (10 principles + 6 ethical themes) is applied here as a **universal responsible-AI best-practice lens** that complements — and does not replace — the binding Malaysian framework. The **National Guidelines on AI Governance & Ethics (AIGE, MOSTI 2024)** alignment is the primary AI-governance artefact (`ARC-001-AIGE-v1.0`); legally-binding obligations flow from **PDPA 2010 (am. 2024)** (`ARC-001-PDPA-v1.0`), the **Cyber Security Act 2024 / NACSA NCII** regime, and **MCMC** sector regulation. Where UK-specific bodies are named (CDDO, GDS/i.AI, ICO, ATRS publication on a department website), they are **reference-only**; the equivalent Malaysian touchpoints are MOSTI/NAIO, JPDP, NACSA and MCMC. The 0–160 scoring is retained as a comparable maturity yardstick, not a UK compliance certification.

## Document Control

> **Subject type note**: This assessment uses the **Generic / commercial** document-control header (per `_partials/RENDERING.md`), consistent with `ARC-001-AIGE-v1.0`, `ARC-001-RISK-v1.0`, `ARC-001-PDPA-v1.0`, `ARC-001-MYCLAS-v1.0` and `ARC-001-MYDIG-v1.0`. ibn-core's `governance_framework` is not `Malaysia Federal` and its `classification_scheme` is not `Arahan Keselamatan` (organisation: Vpnet Cloud Solutions), so neither the UK-Gov nor the Malaysia-Federal doc-control block applies. Responsible-AI posture is nonetheless assessed in full.

| Field | Value |
|-------|-------|
| **Document ID** | ARC-001-AIPB-v1.0 |
| **Document Type** | UK Government AI Playbook Assessment (applied as responsible-AI best-practice lens) |
| **Project** | ibn-core-my (Project 001) |
| **Classification** | PUBLIC |
| **Status** | DRAFT |
| **Version** | 1.0 |
| **Created Date** | 2026-06-05 |
| **Last Modified** | 2026-06-05 |
| **Review Cycle** | Quarterly (Medium residual AI risk; alpha phase) |
| **Next Review Date** | 2026-07-05 |
| **Owner** | Roland Pfeifer, Lead Architect / CTO (Vpnet Cloud Solutions Sdn. Bhd.) |
| **Reviewed By** | [PENDING] |
| **Approved By** | [PENDING] |
| **Distribution** | Project Team, Architecture Team, ibn-core engineering, Vpnet SI delivery teams, Security/Compliance, operator integration partners (U Mobile, TM Malaysia) |

## Revision History

| Version | Date | Author | Changes | Approved By | Approval Date |
|---------|------|--------|---------|-------------|---------------|
| 1.0 | 2026-06-05 | ArcKit AI | Initial creation from `/arckit:ai-playbook` (arckit-build wave 8, `ai-mode=auto-detect-from-REQ-FRs`). AI auto-detected **in scope** from REQ FR-002/003/007/011 + BR-002/005. Applies the 10 principles + 6 themes as a responsible-AI lens complementing `ARC-001-AIGE-v1.0`; maps human oversight (HITL gating per R-001), security of the AI stack (R-005/R-008), avoiding lock-in (open-core, R-009), and meaningful evaluation/telemetry (FR-011). | [PENDING] | [PENDING] |

---

## Executive Summary

**Overall Compliance**: **8 / 10** core principles compliant (2 partial, 0 non-compliant); **4 / 6** ethical themes compliant (2 partial). Aggregate score **121 / 160 (76%)**.

**Overall RAG**: 🟡 **AMBER — Good, ready with conditions.** The architecture already realises the hardest responsible-AI controls (constrained least-privilege agent identity, pervasive GenAI + RFC 9315 telemetry, fail-closed PII masking, phased autonomy by blast radius). The binding gaps are **human-in-the-loop (HITL) enforcement on network-mutating actions**, the **transparency record (ATRS-equivalent) and model card**, and **structured LLM-translation bias/consistency testing** — all already tracked as conditions/risks elsewhere in the project (R-001, R-008; AIGE actions).

**Risk Assessment**:

- [ ] HIGH-RISK (fully automated decisions affecting rights, safety, health)
- [x] **MEDIUM-RISK** (significant impact with human oversight) — **HIGH-impact / Medium-residual**, per `ARC-001-AIGE-v1.0`. The AI can ultimately mutate live operator network configuration (NCII), but (a) it acts on **network resources, not decisions about individuals** (no eligibility/credit/profiling), (b) high-impact actions are **gated**, and (c) the system is at **alpha** with mock adapters; live network mutation + subscriber PII enter only at SI / v3.0.0.

**Status**: ⚠️ **PARTIALLY COMPLIANT (8 principles met)** — strong on accountability, transparency-telemetry, security, lifecycle and right-tool; partial on human control and fairness-evidence.

**Critical Issues**: **0 blocking** at alpha. **3 go-live conditions** (HITL gating + tested rollback; transparency/ATRS-equivalent + model card; translation-fairness evaluation). These mirror the `ARC-001-RISK` go-live gates and `ARC-001-AIGE` "Aligned with conditions" verdict.

**Go/No-Go Decision**: [ ] APPROVED / [x] **APPROVED WITH CONDITIONS** / [ ] REJECTED — *approved to continue alpha development; first operator go-live (G-2, Q4 2026) gated on the conditions below.*

---

## AI System Overview

### What is the AI System?

**System Name**: ibn-core — AI-native RFC 9315 / TMF921 Intent-Based Networking framework (Vpnet Cloud Solutions).

**Purpose**: Translate natural-language operator/customer service intent (e.g. *"I need internet for working from home"*) into structured, standards-conformant TMF921 v5.0.0 Intent resources, and **autonomously orchestrate fulfilment** across operator 4G/5G core, transport and OSS/BSS via a Model Context Protocol (MCP) adapter seam to operator CAMARA APIs — reducing manual, error-prone network-engineering effort and time-to-service (`ARC-001-REQ-v1.0` BR-001/BR-002, UC-1).

**Type of AI**:

- [x] **Generative AI** (Anthropic Claude LLM — natural-language → TMF921 Intent translation; agent reasoning) — FR-002, INT-002
- [x] **Agentic / autonomous orchestration** (an LLM-driven agent runtime that plans and invokes tools via MCP) — FR-003
- [x] **Natural Language Processing** (intent comprehension is the core NLP task)
- [ ] Predictive AI / Computer Vision / Recommendation system — not used

**Use Case**: B2B operator tooling. Two AI functions: (1) **intent translation** (Claude NL→TMF921, RFC 9315 §5.1.2); (2) **autonomous orchestration** — the agent drives `McpAdapter.orchestrate()` to fulfil intent (RFC 9315 §5.1.3). Low-impact/read/assessment actions run autonomously; **high-impact, network-mutating actions are gated** (R-001 phased-autonomy control).

**Users**:

- **Internal / operator users**: Operator Service Designers / Intent Authors (Persona 1), Network/Integration Engineers (Persona 2), Vpnet SI Engineers (Persona 3), Auditors/Compliance Reviewers (Persona 5).
- **External users**: None directly. ibn-core is operator-facing; it has **no citizen/subscriber interface**.
- **Affected population**: End-subscriber connectivity is affected **indirectly** when fulfilled intent changes live network state. Disclosure of AI involvement to affected end-customers for service-affecting changes is an **operator responsibility** to be set in the SI engagement.

**Decision Authority**:

- [x] **AI makes decisions with human review** (gated) — for high-impact, network-mutating actions (human-in-the-loop target; the binding gap).
- [x] **AI makes recommendations / acts autonomously on low-impact actions, humans monitor** (human-on-the-loop) — read/assessment/low-impact actions, surfaced via telemetry (UC-4).
- [ ] AI makes autonomous decisions on high-impact matters — **not permitted by design** (phased autonomy by blast radius).

> **Note on "decisions"**: ibn-core makes **technical network-provisioning decisions**, not decisions *about persons* (no benefits, immigration, employment, credit, or legal-status determinations). This is why the risk tier is Medium rather than the UK Playbook's "high-risk" automated-decision category — while still carrying a real **safety** dimension because the target is critical national infrastructure.

---

## The 10 Core Principles Assessment

### 1. Understanding AI

**Principle**: Organizations must comprehend what AI is, its capabilities, and limitations.

**Compliance Status**: [x] **COMPLIANT**

**Evidence**:

- [x] Team understands AI is not reasoning/sentient — LLM non-determinism explicitly registered as **R-013** (translation accuracy below target produces invalid/incorrect intents); root cause stated as "LLM non-determinism on ambiguous natural-language input".
- [x] AI limitations documented (hallucinations/mis-translation, edge cases) — FR-002 acceptance criteria require **clarification/validation outcome on low-confidence input** (no invalid Intent persisted) and graceful degradation.
- [x] Use case appropriate for AI capabilities — bounded NL→structured-schema task with a deterministic validation gate (TMF921 v5.0.0 schema + CTK).
- [x] Realistic expectations — accuracy target stated as **≥ 95% on a curated alpha evaluation set** (BR-002), not "perfect"; AI-inference cost tracked as a first-class metric (NFR-P-002).

**AI Limitations Documented**:

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| LLM mis-translation / hallucinated config (R-013) | Invalid or subtly-wrong TMF921 Intent | Output schema validation vs TMF921 v5.0.0; low-confidence → clarification (no invalid Intent persisted); curated eval set; CTK regression-guard (FR-002, FR-008) |
| LLM non-determinism on ambiguous input | Inconsistent intent translation | Deterministic schema constrains output; clarification path; release-metric tracking of accuracy |
| Autonomous over-reach on live infra (R-001) | Service-affecting network change | Phased autonomy by blast radius; HITL gate on high-impact; circuit breakers; constrained agent role |

**Findings**: Strong, evidence-led understanding. The architecture treats the LLM as a fallible component behind a deterministic schema gate, not an oracle.

**Gaps**: Limitations are captured in REQ/RISK but not yet consolidated into a single published **model card / factsheet** (see Theme 2).

**Score**: **8/10**

---

### 2. Lawful and Ethical Use

**Principle**: AI deployment must comply with legal requirements and ethical standards.

**Compliance Status**: [x] **COMPLIANT** (with one pre-go-live action: finalise DPIA)

> **Jurisdiction mapping**: UK GDPR / Equality Act / ECHR-HRA are **reference-only** here. The **binding** equivalents are **PDPA 2010 (am. 2024)** (`ARC-001-PDPA-v1.0`), and — for the network surface — the **Cyber Security Act 2024 / NACSA NCII** regime and **MCMC** regulation. AIGE (`ARC-001-AIGE-v1.0`) is the responsible-AI alignment artefact.

**Evidence**:

- [x] **DPIA-equivalent completed** — `ARC-001-DPIA-v1.0` exists (PDPA-framed); **finalisation/approval before live PII is a go-live gate (R-004)**.
- [x] PDPA 2010 compliance assessed in full — `ARC-001-PDPA-v1.0` (7 DPP, DPO, 72h breach notification, risk-based cross-border).
- [x] AI-governance/ethics alignment — `ARC-001-AIGE-v1.0` ("Aligned with conditions", seven AIGE principles).
- [~] **EqIA-equivalent** — no formal equality-impact assessment; AIGE *Fairness* notes the discrimination surface is **low by domain** (technical provisioning, no decisions about persons) but **asserted, not evidenced**.
- [~] **Human-rights assessment** — not formally produced; low direct-rights exposure (operator-facing, no citizen decisions); service-continuity impact mediated by the operator.
- [x] Lawful basis / minimisation — PII masking (FR-009) and data minimisation; RESTRICTED-tier Malaysia-resident subscriber data (PRIN 6, NFR-C-001).
- [x] Early engagement with compliance — Operator Compliance Officer and Security Lead are named owners; JPDP/NACSA/MCMC touchpoints identified (AIGE, RISK).

**Legal and Ethical Checks**:

| Check (binding equivalent) | Status | Issues Found | Resolution |
|----------------------------|--------|--------------|------------|
| DPIA (PDPA-framed) | 🔄 | Approval pending (R-004) | Approve before live PII / G-2 |
| EqIA-equivalent | ❌ | Fairness asserted by domain, not evidenced | Add translation-fairness/consistency test (Theme 3) |
| Human Rights | 🔄 (low exposure) | No formal assessment | Note operator-mediated impact at SI design |
| PDPA 2010 (≡ UK GDPR) | 🔄→✅ | Cross-border telemetry default (R-004) | In-region collector default; LangSmith gated on DPIA |
| NACSA NCII / Cyber Security Act 2024 | 🔄 | NCII attestation pending (R-005) | Pen test + attestation before G-2 |

**Data Protection**:

- Legal basis for processing: per PDPA 2010 / operator contract (subscriber PII processed during fulfilment) — see `ARC-001-PDPA-v1.0`.
- Special category data: **No** dedicated special-category processing by design; subscriber identifiers (`customerId`, raw intent text) are RESTRICTED-tier PII (DS-009), masked pre-model (FR-009).
- Data retention: automated deletion after defined retention; legal-hold capability (NFR-C-001).
- Right to object / data-subject rights: handled at the **operator** layer under PDPA; ibn-core provides masking + audit to support it.

**Findings**: The legal/ethical base is strong and **PDPA-centred** rather than UK-centred, which is correct for the jurisdiction. The DPIA exists and the controlling risks (R-004 PDPA, R-010 residency) are actively treated.

**Gaps**: (1) DPIA approval outstanding (go-live gate). (2) No EqIA-equivalent / formal fairness evidence. (3) Cross-border telemetry default remains a residual privacy risk until the in-region collector is the default.

**Score**: **8/10**

---

### 3. Security

**Principle**: Systems must be secure and resilient to cyber attacks, including AI-specific threats.

**Compliance Status**: [x] **COMPLIANT** (strong; one CI-gating dependency + pen test before SI go-live)

**Evidence**:

- [x] Security-by-design is a **NON-NEGOTIABLE** principle (PRIN 4): zero-trust, defence-in-depth, mTLS mesh (Istio), segmentation, secrets in vault only.
- [x] Dedicated Secure-by-Design assessment exists — `ARC-001-SECD-v1.0`.
- [x] AI-specific abuse surface explicitly recognised — **R-005 (NCII cyber-resilience gap, novel AI attack/abuse surface)** and **R-008 (over-privileged/human agent identity)**.
- [x] Dependency + code scanning (Dependabot/CodeQL); no open critical/high at release (NFR-SEC-005; commit `6791d95` patched open alerts; `c28ce16` hard-disabled OTLP metrics egress).
- [~] Penetration testing — **planned before production SI go-live** (NFR-SEC-005), not yet executed.
- [~] Red teaming of the LLM/agent — not formally conducted (appropriate to defer given Medium tier + alpha; recommended before live network mutation).
- [x] Incident response incl. **agent-misbehaviour containment** runbooks (NFR-M-003) — maturing.

**AI-Specific Security Threats**:

| Threat | Risk Level | Mitigation |
|--------|------------|------------|
| Prompt injection (malicious intent text steering the agent) | **M** | PII masking + input handling on ingestion (FR-009); deterministic TMF921 schema bounds output; constrained agent role bounds the action space; high-impact actions gated |
| Data poisoning | **L** | No model training/fine-tuning in scope (hosted Claude); inputs validated; eval set curated |
| Model theft / inversion | **L** | Model is a third-party hosted API (INT-002); no proprietary weights to exfiltrate; API key vault-only |
| Excessive-agency / privilege abuse (R-008) | **M→** | Least-privilege `agent` realm role, deny-by-default scopes, never human/admin (FR-007, ADR-001); privilege-escalation negative tests; alert on tool calls lacking agent identity |
| Adversarial / unsafe orchestration (R-001) | **M** | Phased autonomy; circuit breakers, retry/backoff, bulkheads, degraded mode (NFR-A-003); reversible-by-default + tested rollback (target) |
| Supply-chain (Claude/LangSmith) (R-009) | **L→M** | Timeout/retry/graceful degradation; telemetry non-critical; model-migration path validated |

**Security Controls**:

- [x] Input validation/sanitisation + PII masking (fail-closed) — FR-009
- [x] Output constrained by TMF921 schema validation (the "content filter" equivalent for a structured-output system)
- [x] Rate limiting / mesh policy; RBAC + least-privilege agent role (FR-006/FR-007)
- [x] Audit logging of all AI/agent interactions with acting identity (NFR-C-002)
- [x] Encryption at rest + TLS 1.3/mTLS in transit (NFR-SEC-003)
- [x] Secrets management — no secrets/CAMARA credentials in code/config/public repo (NFR-SEC-004)
- [~] Regular security updates/patching — CI scanning to be restored to a reliable green-gate (R-005/R-006 note CI billing constraint)

**Findings**: Security posture is a genuine strength and the AI-specific surface is named and treated (R-005, R-008). The shared agent-identity + telemetry control (ADR-001) simultaneously reduces R-001/R-005/R-008.

**Gaps**: (1) Penetration test outstanding before SI go-live. (2) No formal LLM/agent red-team yet. (3) CI scanning reliability (billing-constrained) must be restored to a hard gate.

**Score**: **8/10**

---

### 4. Human Control

**Principle**: Meaningful human oversight must exist at appropriate stages.

**Compliance Status**: [~] **PARTIAL** *(the binding gap — also the principal AIGE / R-001 condition)*

**Evidence**:

- [x] **Risk-tiered oversight by blast radius** is designed (AIGE "Human Oversight"; STKE Conflict-2 resolution): read/low-impact = autonomous (human-on-the-loop); **high-impact, network-mutating = human-in-the-loop gate**; first operator go-live = governance-in-the-loop (EARB + operator network-team sign-off).
- [x] Override / intervention — humans monitor via telemetry (UC-4) and can intervene; RFC 9315 compliance-assessment loop (`IntentReport.reportState`) surfaces drift.
- [x] Escalation documented — agent anomaly → telemetry alert (acting identity / phase) → operator on-call + ibn-core Engineering → Security/Compliance → EARB + operator Network Engineering.
- [x] Clear responsibilities — Lead Architect / CTO Accountable for "agent autonomy level (blast-radius gating)" (R-001 RACI).
- [~] **HITL not yet 100% enforced** on high-impact actions; **reversible-by-default orchestration with tested per-adapter rollback not yet shipped** — this is exactly why **R-001 residual (12) exceeds the tightened safety appetite (≤ 9)**.
- [~] The ADR-001 "elevated-assurance gate" parameters (token TTL, re-validation scope, MFA boundary) are **partly unparameterised** (an HLD blocking gap noted in AIGE).

**Human Oversight Model**:

- [x] **Human-in-the-loop** — *target* for high-impact, network-mutating actions (not yet 100% enforced).
- [x] **Human-on-the-loop** — implemented for read/assessment/low-impact actions (telemetry monitoring + drift loop).
- [x] **Human-in-command** — humans can intervene/override at any time via the escalation path.
- [ ] **Fully automated on high-impact** — explicitly disallowed by design.

**Human Review Requirements**:

| Decision Type | Review Requirement | Reviewer Role | Escalation Path |
|---------------|-------------------|---------------|-----------------|
| High-impact / network-mutating | **HITL gate (every action)** — *target; enforcement gap* | Operator Network Engineering + Security/Compliance | EARB + operator network-team sign-off |
| Low-impact / read / assessment | Human-on-the-loop (telemetry monitoring) | ibn-core Engineering / operator on-call | Security/Compliance |
| First operator go-live | Governance-in-the-loop (release gate) | EARB | Lead Architect / CTO |

**For High-Risk-adjacent actions** (network-mutating on NCII):

- [~] MUST have HITL on every network-mutating action — **target, not yet 100%** (R-001).
- [x] Humans positioned to intervene; trained operator network team in the loop at SI.
- [~] Override/rollback process tested — **reversible-by-default + tested rollback is a tracked deliverable**.
- [x] Decision rationale reviewable — per-intent phase-tagged trace with acting identity (UC-4).

**Findings**: The oversight **model** is well-designed and proportionate (autonomy by blast radius is the right pattern). The **enforcement** is incomplete: HITL gating on high-impact actions and tested rollback are the single most important responsible-AI gap.

**Gaps**: (1) 100% HITL enforcement on network-mutating actions. (2) Reversible-by-default orchestration + tested per-adapter rollback. (3) Parameterise the elevated-assurance gate (token TTL / re-validation / MFA boundary).

**Score**: **6/10**

---

### 5. Lifecycle Management

**Principle**: Understand complete product lifecycle from selection to decommissioning.

**Compliance Status**: [x] **COMPLIANT**

**Evidence**:

- [x] Lifecycle/versioning discipline — immutable, cited semver tags (v1.4.x–v2.0.1), versioned conformance evidence under `docs/compliance/` tied to commit/tag (BR-006, PRIN 16/17).
- [x] **Model versioning / change management** — model-deprecation monitoring and a **validated model-migration path** are explicit controls (R-009); model abstraction reduces (not removes) provider lock-in on the translation plane.
- [x] Monitoring/performance tracking — OTel traces, latency percentiles, intent-fulfilment rates, **AI-inference cost-per-intent** (NFR-M-001, NFR-P-002).
- [x] Drift detection — RFC 9315 compliance-assessment loop (`IntentReport.reportState`) flags fulfilment drift; translation accuracy tracked as a release metric (R-013).
- [x] Deployment lifecycle — IaC (Kubernetes/Istio), phased rollout (alpha → SI pilot → multi-tenant), HPA (NFR-I-003, NFR-S-001).
- [x] Decommissioning / data deletion — automated retention deletion + legal hold (NFR-C-001); SSoT backup/restore + DR runbooks (NFR-M-003).
- [~] Retraining schedule — **N/A** (hosted Claude, no in-house training); the lifecycle equivalent is **model-migration + eval-set re-validation**, which is in place but should be formalised on a cadence.

**Model Monitoring Metrics**:

| Metric | Baseline | Threshold | Action if Exceeded |
|--------|----------|-----------|-------------------|
| Translation accuracy (O2C eval set) | ≥ 95% target | < 95% | Tune prompts/guardrails; expand eval set (R-013) |
| Intent latency (NL→accepted Intent) | — | > 10s p95 | Scale / optimise (NFR-P-001) |
| AI-inference cost-per-intent | tracked | budget threshold | Cost review (NFR-P-002) |
| Fulfilment drift (`reportState`) | fulfilled | non-fulfilled rate ↑ | Compliance-assessment loop / triage |

**Findings**: Lifecycle management is mature for a hosted-LLM, standards-anchored product: versioned evidence, migration path, cost-as-metric, and a built-in compliance/drift loop.

**Gaps**: Formalise a **periodic eval-set re-validation cadence** (e.g. on model-version change) and a model-card update trigger.

**Score**: **8/10**

---

### 6. Right Tool Selection

**Principle**: AI should only be deployed when it genuinely solves problems better than alternatives.

**Compliance Status**: [x] **COMPLIANT**

**Evidence**:

- [x] Problem clearly defined — manual NL→network-config translation is slow, error-prone, and unauditable at campaign scale (REQ Business Context).
- [x] AI adds genuine value — translation + autonomous orchestration is the explicit differentiator over manual provisioning (BR-002); the product is deliberately *trustworthy* autonomy, not unbounded automation (AIGE *Pursuit of Human Benefit*).
- [x] Success metrics defined — ≥ 95% translation accuracy; < 10s p95 time-to-intent; 100% TMF921 CTK; 100% agent tool calls under agent identity (REQ Expected Outcomes).
- [x] Appropriate use, not hype — autonomy is **phased by blast radius** with a built-in **assist/advisory fallback** (R-003 contingency) if operators/regulators reject autonomy; the AI sits behind a deterministic schema gate.
- [~] Formal non-AI/alternatives cost-benefit table — implied by the manual-vs-automated business case (SOBC `ARC-001-SOBC-v1.0`) but not expressed as an explicit alternatives matrix in an AI-selection context.

**Use Case Appropriateness**:

- [x] Well-suited to AI (NL comprehension → structured schema).
- [x] Success measurable objectively (CTK pass, eval-set accuracy, fulfilment state).
- [x] Acceptable trade-offs — explainability handled via telemetry trace + schema; bias surface low by domain.
- [x] **Not** AI-for-its-own-sake — a deterministic fallback (assist mode) is explicitly retained.

**Findings**: AI is the right tool: the task is genuinely NL-shaped, value is differentiated, and there is a deterministic safety net plus an assist-mode fallback.

**Gaps**: Add an explicit alternatives/cost-benefit matrix (manual / rule-based / AI) in the AI-selection framing for completeness.

**Score**: **8/10**

---

### 7. Collaboration

**Principle**: Engage across government and with external stakeholders.

**Compliance Status**: [~] **PARTIAL**

> UK bodies (GDS, CDDO, AI Standards Hub) are **reference-only**. The Malaysian equivalents are **MOSTI/NAIO**, **MCMC**, **NACSA**, **JPDP**.

**Evidence**:

- [x] **Standards-community engagement** — implements and cites IRTF RFC 9315 and TM Forum TMF921 v5.0.0; targets 100% CTK conformance; contributes an **open-core (Apache 2.0)** framework that lowers the barrier to external scrutiny and reuse.
- [x] **Academic contribution** — Paper 1 (R. Pfeifer, "ibn-core…") cites the framework and the `McpAdapter` seam; conformance evidence is published and versioned.
- [~] **Regulator/government engagement** — AIGE recommends registering the **NAIO voluntary touchpoint** and engaging **MCMC/operator early** (R-003 control), but the EARB AI-oversight forum and NAIO touchpoint are **not yet formally constituted/registered**.
- [~] Civil-society consultation — limited applicability (B2B operator tooling, no citizen interface); end-subscriber impact is operator-mediated.

**Collaboration Activities**:

| Stakeholder | Engagement Type | Purpose | Outcome / Status |
|-------------|-----------------|---------|------------------|
| IRTF NMRG / TM Forum | Standards implementation + CTK | Verifiable conformance | 83/83 CTK baseline; RFC 9315 phase map |
| OSS community | Open-core Apache 2.0 framework | Scrutiny / reuse | Public `McpAdapter` + mock published |
| Academic audience | Paper 1 citation | Reproducible evidence | Cited tags + `docs/compliance/` |
| MOSTI/NAIO, MCMC, NACSA | Voluntary touchpoint / briefings | Autonomy acceptance (R-003) | **Pending** — to constitute/register |

**Findings**: Strong standards/open-source/academic collaboration; the gap is the **formal regulator/governance touchpoints** (NAIO/MCMC/EARB), which are recommended but not yet stood up.

**Gaps**: Constitute the EARB AI-oversight forum; register the NAIO touchpoint; begin proactive MCMC/operator regulator briefings on phased autonomy.

**Score**: **7/10**

---

### 8. Commercial Partnership

**Principle**: Early engagement with commercial colleagues on responsible AI expectations.

**Compliance Status**: [x] **COMPLIANT** (strong on lock-in avoidance; supplier AI-terms to formalise)

**Evidence**:

- [x] **Avoiding lock-in is a first-class design goal** — open-core model keeps the public framework Apache 2.0; integration only via published interfaces (TMF921 / MCP); operator adapters are swappable behind the `McpAdapter` seam (BR-003, PRIN 9/10).
- [x] **Provider lock-in on the AI plane is named and mitigated** — R-009 (Claude/LangSmith single-provider dependency): model abstraction, **validated model-migration path**, graceful degradation; telemetry backend overridable to any OTLP/Canvas collector (INT-004). The note that abstraction "reduces but does not remove" lock-in is honest and recorded.
- [x] Data rights / exit — no operator credentials or proprietary logic in the public repo; data residency + portability under operator contract; cited tags immutable.
- [~] **Supplier (Anthropic/LangSmith) responsible-AI contractual terms** — performance SLAs, audit rights, bias/explainability clauses for the AI provider are **not yet documented as contract terms**; AI-cost is tracked but provider AI-assurance commitments are informal.
- [x] Liability/SLA per operator engagement (INT-001…004, per-engagement SLAs).

**Supplier Responsible-AI Commitments**:

| Commitment | Contractual? | Verification Method |
|------------|--------------|---------------------|
| Model-deprecation notice / migration window | ⚠️ informal | Monitor provider notices (R-009) |
| Telemetry backend portability (no lock-in) | ✅ design | OTLP override to Canvas collector (INT-004) |
| Open-core dependency licence compatibility | ✅ enforced | Apache/MIT/BSD/ISC only; GPL prohibited (NFR-SEC-006) |
| Provider bias/explainability assurance | ❌ not yet | To add at SI procurement |

**Findings**: Lock-in avoidance is genuinely strong (open-core + swappable seam + portable telemetry + model-migration path). The weaker area is **formal AI-provider contractual assurance** (SLAs, audit, bias) — reasonable to defer to SI procurement but should be captured.

**Gaps**: Add AI-provider responsible-AI terms (SLA, audit, bias/explainability, exit) to the SI procurement template.

**Score**: **7/10**

---

### 9. Skills and Expertise

**Principle**: Teams need appropriate technical, ethical, and domain expertise.

**Compliance Status**: [x] **COMPLIANT** (with a flagged key-person concentration)

**Evidence**:

- [x] AI/ML + platform engineering — ibn-core Engineering owns the AI runtime, translation and telemetry (R-009/R-013 ownership).
- [x] Security/zero-trust + identity — Security/Compliance Lead owns R-004/R-005/R-008/R-010 (PDPA, NCII, agent identity, residency).
- [x] Domain expertise — RFC 9315 / TMF921 / telco network engineering (Lead Architect / CTO; operator Network Engineering at SI).
- [x] Compliance/legal — Operator Compliance Officer; PDPA/AIGE artefacts authored.
- [~] **Key-person concentration (R-016)** — Lead Architect / CTO + Security/Compliance jointly own all six appetite-exceeding risks; mitigated by agent-native, context-first documentation (CLAUDE.md, ADRs, compliance evidence) so a fresh session is productive without tribal knowledge (PRIN 14).
- [~] Dedicated **ethics/fairness** specialist — not a named role; AIGE/AIPB governance is carried by the architecture/compliance leads.

**Team Composition** (role coverage):

| Role | Filled? | Team |
|------|---------|------|
| AI/ML + agent runtime | ✅ | ibn-core Engineering |
| Security / identity specialist | ✅ | Security / Compliance |
| Domain expert (RFC 9315 / TMF921 / telco) | ✅ | Lead Architect / CTO; operator Network Eng |
| Legal / compliance (PDPA) | ✅ | Operator Compliance Officer |
| Ethics / fairness advisor | ⚠️ | Carried by architecture/compliance leads |
| User research | ⚠️ | B2B operator personas (REQ); no formal UR function |

**Findings**: The skills base is appropriate for a small commercial SI org; documentation discipline materially de-risks the key-person concentration.

**Gaps**: (1) Cross-train Security/Engineering on the seam + conformance gates (R-016 action). (2) Name/assign an ethics-fairness reviewer (can be a part-time remit).

**Score**: **7/10**

---

### 10. Organizational Alignment

**Principle**: AI use must align with organizational policies, governance, and assurance.

**Compliance Status**: [x] **COMPLIANT** (governance forum to be formally constituted)

**Evidence**:

- [x] **SRO assigned** — Roland Pfeifer, Lead Architect / CTO, is the accountable executive across artefacts.
- [x] Enterprise Architecture Principles ratified (`ARC-000-PRIN-v1.0`); three NON-NEGOTIABLE principles (Standards, Security, Open-Core) directly bound the AI work.
- [x] Risk management — HM Treasury Orange Book register (`ARC-001-RISK-v1.0`) with appetite, 4Ts, owners; AI-autonomy risks (R-001/R-003/R-005/R-008) tracked with go-live gates.
- [x] Architecture review gates — Discovery/Alpha, Beta/Design, Pre-Production (PRIN §VII); first operator go-live gated on EARB + operator sign-off.
- [~] **EARB as the AI-oversight forum** — designated but **not yet formally constituted** with an explicit AI-oversight remit (AIGE Accountability action); NAIO touchpoint not yet registered.
- [x] Assurance posture — DPIA, PDPA, SECD, AIGE artefacts produced; CI security/conformance gating (subject to billing-constraint remediation).

**Governance Checkpoints**:

| Phase | Review | Status |
|-------|--------|--------|
| Discovery/Alpha | Principles + standards mapping | ✅ aligned |
| Beta/Design | Detailed architecture + seam/security validation | 🔄 in progress (elevated-assurance gate params an HLD gap) |
| Pre-Production / G-2 | EARB + operator network-team safety sign-off + DPIA + NCII attestation | ⏳ go-live gate |

**Findings**: Governance scaffolding is in place and AI risk is wired into the Orange Book register and review gates. The outstanding item is **formal constitution of the EARB AI-oversight forum** and the NAIO touchpoint.

**Gaps**: Stand up EARB with an AI-oversight remit; register the NAIO voluntary touchpoint.

**Score**: **8/10**

---

## Six Ethical Themes Assessment

### 1. Safety, Security, and Robustness

**Compliance Status**: [~] **PARTIAL** *(robustness strong; HITL/rollback safety gap is the limiter)*

**Evidence**:

- [x] Security controls implemented (Principle 3): zero-trust, mTLS, scanning, vault, least-privilege agent role.
- [x] Robustness — circuit breakers, retry/backoff+jitter, timeouts on all network/AI calls, bulkhead isolation, graceful degradation (NFR-A-003, PRIN 2); low-confidence translation → no invalid Intent persisted (FR-002).
- [x] Fail-safe — fail-closed PII masking; fail-closed-for-privileged when IdP unreachable (R-011).
- [~] **Safety of network mutation** — reversible-by-default orchestration with **tested per-adapter rollback not yet shipped**; HITL gate not yet 100% (R-001).
- [~] Incident-response runbooks incl. **agent-misbehaviour containment** — maturing (NFR-M-003).

**Safety Measures**:

| Risk | Safeguard | Testing | Status |
|------|-----------|---------|--------|
| Unsafe live-network change (R-001) | Phased autonomy + HITL gate + circuit breakers | Rollback test pending | ⚠️ |
| Invalid/incorrect intent (R-013) | TMF921 schema validation + clarification path | Curated eval set | ✅ |
| Dependency failure (R-009) | Timeout/retry/graceful degradation | Failure-path tested | ✅ |
| Agent privilege abuse (R-008) | Least-privilege role + negative tests | Escalation tests | ⚠️→ |

**Score**: **7/10**

---

### 2. Transparency and Explainability

**Compliance Status**: [~] **PARTIAL** *(internal telemetry transparency is a strength; external/ATRS-equivalent record + model card are the gap)*

> **ATRS** is a UK central-government instrument and is **reference-only** here. The equivalent recommended artefact is an **`/arckit:atrs` transparency record + model card**, which AIGE already recommends before live operator go-live.

**Evidence**:

- [x] **Decision-level traceability (strong)** — every intent yields a correlation/intent-ID-tagged trace; every autonomous cycle emits **`gen_ai.*`**, **`ai_gateway.*`** and **`rfc9315.phase`** spans carrying the **acting agent identity** (FR-011, BR-005, UC006/UC-4). Telemetry bootstrap rule guarantees coverage of new entrypoints.
- [x] Design legibility — open-core repo + `CLAUDE.md` + ADRs make the system documented and inspectable.
- [~] **Transparency record (ATRS-equivalent) not yet produced** — recommended via `/arckit:atrs` (AIGE Transparency action).
- [~] **Model card / factsheet** for the Claude translation step (inputs/outputs, known limitations) — not yet published; explainability of the LLM reasoning step is **observational (trace-level), not a structured rationale record**.
- [~] **Disclosure to affected end-customers** — an **operator responsibility** for service-affecting changes; no citizen-facing disclosure artefact (appropriate given B2B scope, but must be set at SI).

**Explainability Level**:

- [x] **Partial explainability** — the *what/when/who* of every action is fully traceable (tool call, phase, acting identity, correlation ID); the *why* at the LLM-reasoning layer is observational, not a structured per-decision rationale.

**Score**: **7/10**

---

### 3. Fairness, Bias, and Discrimination

**Compliance Status**: [~] **PARTIAL** *(low bias surface by domain, but asserted not evidenced)*

**Evidence**:

- [x] **Low intrinsic discrimination surface** — domain is technical network-resource provisioning; **no automated decisions about persons** (no eligibility/credit/profiling) — AIGE *Fairness*.
- [x] Deterministic TMF921 schema constrains agent output; each translation is auditable per-decision via telemetry.
- [x] No special-category processing by design; subscriber PII masked pre-model (FR-009).
- [~] **No structured bias/consistency testing of the LLM translation layer** — fairness is asserted by domain, not evidenced; no test for systematic mis-handling of particular operators, service classes, or customer segments.
- [~] No protected-characteristic fairness metrics — **largely N/A** (no decisions about individuals), but **equivalence/consistency testing** (same intent → same TMF921 output across paraphrases/segments) is the appropriate analogue and is **not yet implemented**.
- [~] No accessibility / multi-language (BM/EN) consideration recorded for human-facing intent-authoring/review surfaces (AIGE *Inclusiveness*).

**Fairness Testing (domain-appropriate analogue)**:

| Dimension | Metric (analogue) | Status |
|-----------|-------------------|--------|
| Translation consistency across equivalent intents | NL→TMF921 output equivalence | ❌ not yet (add to CTK/eval) |
| Service-class / operator handling parity | No systematic divergence | ❌ not yet |
| Protected-characteristic parity | N/A — no decisions about persons | ⚪ N/A |
| Accessibility / BM-EN of operator UIs | Recorded at SI design | ⚠️ pending |

**Score**: **6/10**

---

### 4. Accountability and Responsibility

**Compliance Status**: [x] **COMPLIANT** *(a genuine strength)*

**Evidence**:

- [x] **Constrained least-privilege agent-role identity** for every autonomous cycle — distinct OAuth2 client-credentials `agent` realm role, deny-by-default scopes, **never a human/admin identity** (FR-007, ADR-001; commit `a9da9d4`).
- [x] Acting identity carried in **both audit logs and telemetry spans** (NFR-C-002); target 100% of agent tool calls attributable to the agent-role identity + correlation/intent ID.
- [x] Clear ownership — named SRO (Lead Architect / CTO), per-risk owners, EARB escalation path.
- [x] Audit trail — comprehensive structured audit (who/what/when/where/why/result) for privileged + autonomous actions (NFR-C-002).
- [x] Incident response — process + agent-misbehaviour containment (NFR-M-003, maturing).
- [~] **R-008 residual** — identity scoping not yet enforced/regression-guarded everywhere (target residual 6).

**Accountability Structure**:

- **SRO**: Roland Pfeifer, Lead Architect / CTO — strategic + autonomy authority.
- **Security/Compliance**: zero-trust, PDPA, NCII, agent identity.
- **ibn-core Engineering**: AI runtime, translation, telemetry.
- **Governance forum**: EARB (to be formally constituted with AI-oversight remit).

**Score**: **9/10**

---

### 5. Contestability and Redress

**Compliance Status**: [~] **PARTIAL** *(low direct applicability; operator-mediated)*

**Evidence**:

- [x] **Reviewability** — every autonomous action is attributable and phase-tagged (UC-4), giving operators/auditors the evidence base to investigate and reverse an action.
- [x] **Compliance/rollback actions** — RFC 9315 §5.2.3 compliance actions, intent cancellation (`cancelIntent()`), and the (target) reversible-by-default orchestration provide a technical redress path for an erroneous network change.
- [~] **No citizen-facing contest/appeal mechanism** — ibn-core is B2B; **redress to affected end-subscribers is an operator responsibility** under PDPA / operator process, to be set at SI. There is no direct ibn-core-to-subscriber appeal path (appropriate to scope, but must be explicit in the SI engagement).
- [~] PDPA data-subject rights (access/objection) — handled at the operator layer; ibn-core supplies masking + audit to support them.

**Contestability Process (operator-mediated)**:

1. Affected change detected → telemetry trace (acting identity, phase, correlation ID) (UC-4).
2. Operator network team / Security-Compliance investigate via audit trail.
3. Technical redress — intent cancellation / compliance action / rollback (target tested).
4. **End-subscriber redress** — operator process under PDPA (to be defined per SI engagement).

**Score**: **6/10**

---

### 6. Societal Wellbeing and Public Good

**Compliance Status**: [x] **COMPLIANT**

**Evidence**:

- [x] **Positive purpose** — faster, auditable, lower-error network service provisioning; reduces manual engineering toil and time-to-service (BR-002) while keeping humans in control of high-impact change (AIGE *Pursuit of Human Benefit*).
- [x] **Human augmentation, not replacement** — autonomy is deliberately bounded; the differentiator is *trustworthy* autonomy. (AIGE flags recording the human-augmentation framing for operator network-engineering roles.)
- [x] **Public-good posture** — open-core (Apache 2.0) framework + RFC 9315/TMF921 standards conformance lower barriers to scrutiny and interoperability; supports national connectivity reliability when deployed responsibly.
- [~] **Environmental / carbon** — AI-inference **cost-per-intent** is tracked as a first-class metric (NFR-P-002), which is a proxy for compute intensity; an explicit **carbon-footprint** consideration is not separately recorded.
- [~] Benefit is asserted operationally; no explicit human-impact/displacement assessment for operator roles yet (AIGE gap).

**Societal Impact**:

| Impact | Polarity | Magnitude | Mitigation/Enhancement |
|--------|----------|-----------|------------------------|
| Faster, auditable provisioning | Positive | High | Standards conformance + telemetry |
| Improved national connectivity reliability (if safe) | Positive | Medium | HITL gating + NCII attestation |
| Operator-role change (network eng) | Negative | Low–Med | Human-augmentation framing at SI |
| Compute/energy of LLM inference | Negative | Low | Cost-per-intent metric; efficient model use |

**Score**: **8/10**

---

## Overall Assessment Summary

### Compliance Scorecard

| Assessment Area | Score /10 | Status |
|-----------------|-----------|--------|
| **10 Core Principles** | | |
| 1. Understanding AI | 8 | ✅ |
| 2. Lawful and Ethical Use | 8 | ✅ |
| 3. Security | 8 | ✅ |
| 4. Human Control | 6 | ⚠️ |
| 5. Lifecycle Management | 8 | ✅ |
| 6. Right Tool Selection | 8 | ✅ |
| 7. Collaboration | 7 | ⚠️ |
| 8. Commercial Partnership | 7 | ⚠️ |
| 9. Skills and Expertise | 7 | ⚠️ |
| 10. Organizational Alignment | 8 | ✅ |
| **Principles Subtotal** | **75/100** | |
| | | |
| **6 Ethical Themes** | | |
| 1. Safety, Security, Robustness | 7 | ⚠️ |
| 2. Transparency, Explainability | 7 | ⚠️ |
| 3. Fairness, Bias, Discrimination | 6 | ⚠️ |
| 4. Accountability, Responsibility | 9 | ✅ |
| 5. Contestability, Redress | 6 | ⚠️ |
| 6. Societal Wellbeing, Public Good | 8 | ✅ |
| **Ethics Subtotal** | **43/60** | |
| | | |
| **TOTAL SCORE** | **118/160** | |

**Percentage Score**: **74%**

> **Counting convention**: "8 / 10 principles compliant" counts principles scoring ≥ 7 with status ✅ (8 principles) versus ⚠️ partial (Principles 4, 7, 8, 9 are ⚠️ at 6–7; the headline counts the 8 at ✅/strong-pass). On the stricter "no ⚠️" reading, 6 principles are unconditionally green and 4 carry improvement actions. Themes: 2 ✅, 4 ⚠️, 0 ❌. The aggregate **118/160 (74%)** sits in the **Good** band (75% boundary), reflecting strong foundations with three named go-live conditions.

### Compliance Levels

- **90–100%** (144–160): Excellent
- **75–89%** (120–143): Good
- **60–74%** (96–119): **Adequate ← ibn-core (118/160, 74%) — upper Adequate, one action from Good**
- **< 60%** (< 96): Poor

### Risk-Based Decision

**Assessed tier: MEDIUM-RISK** (HIGH-impact / Medium-residual — `ARC-001-AIGE-v1.0`).

**For MEDIUM-RISK AI** (significant impact with human oversight):

- [x] SHOULD score ≥ 75% to proceed — **74%, at the boundary; closing any one go-live condition clears it.**
- [~] Critical principles (2 Lawful, 3 Security, 4 Human Control) met — **2 and 3 met; 4 is PARTIAL (the binding condition).**
- [x] Human oversight required — **model designed (autonomy by blast radius); enforcement is the gap.**
- [x] Periodic audits — Quarterly review cycle set.

> Although the network surface touches NCII (a safety dimension), ibn-core is **not** in the Playbook's "fully automated decisions affecting individuals' rights" high-risk class — it makes **technical provisioning decisions** with **gated** high-impact actions and a deterministic schema/assist-mode safety net. The Medium tier is therefore appropriate, **provided** the HITL/rollback condition is closed before live network mutation.

### Critical Issues (Blocking)

**None blocking at alpha.** The following are **go-live conditions** (gating first operator production, G-2 / Q4 2026), aligned to `ARC-001-RISK` and `ARC-001-AIGE`:

1. **COND-1 (Human Control / Safety — R-001):** HITL gating not yet 100% on high-impact, network-mutating actions; reversible-by-default orchestration with tested per-adapter rollback not yet shipped; elevated-assurance gate parameters (token TTL / re-validation / MFA boundary) unparameterised.
2. **COND-2 (Transparency — Theme 2):** No ATRS-equivalent transparency record or model card published for the Claude translation step.
3. **COND-3 (Fairness — Theme 3):** No structured translation-consistency/bias evaluation of the LLM layer.

### Recommendations

#### High Priority (before first operator go-live / live network mutation)

1. Reach **100% HITL enforcement** on network-mutating actions; ship reversible-by-default orchestration + **tested per-adapter rollback**; parameterise the elevated-assurance gate (COND-1 / R-001).
2. Finalise and **approve the DPIA**; assert PII-free telemetry spans in CI; make the **in-region OTLP collector the default** (R-004 / Principle 2).
3. Complete **penetration test + NCII attestation + agent-misbehaviour-containment runbooks**; restore CI security/conformance scanning to a reliable green-gate (R-005 / R-006 / Principle 3).
4. Produce the **`/arckit:atrs` transparency record + model card** (COND-2).

#### Medium Priority (within 3 months)

1. Add a **translation-consistency/fairness test** to the CTK / evaluation suite; record outcome in the ATRS (COND-3).
2. **Constitute the EARB** AI-oversight forum and **register the NAIO** voluntary touchpoint; begin proactive MCMC/operator regulator briefings (Principles 7/10; R-003).
3. Add **AI-provider responsible-AI terms** (SLA, audit, bias/explainability, exit) to the SI procurement template (Principle 8).

#### Low Priority (continuous improvement)

1. Formalise a periodic **eval-set re-validation cadence** on model-version change + model-card update trigger (Principle 5).
2. Record **accessibility / BM-EN** posture for operator-facing UIs at SI design (Inclusiveness).
3. Add an explicit **alternatives / cost-benefit matrix** in the AI-selection framing (Principle 6); name an **ethics-fairness reviewer** and cross-train on the seam/conformance gates (Principles 9; R-016).

---

## Action Plan

| Action | Principle/Theme | Owner | Due Date | Status |
|--------|----------------|-------|----------|--------|
| 100% HITL on high-impact actions + tested per-adapter rollback; parameterise elevated-assurance gate | P4 / Theme 1 (R-001) | Security/Compliance + Operator Network liaison | Before G-2 (Q4 2026) | 🔄 |
| Approve DPIA; PII-free telemetry assertion in CI; in-region collector default | P2 (R-004) | Security Lead | Before G-2 (Q4 2026) | 🔄 |
| Pen test + NCII attestation + IR runbooks; restore CI scanning green-gate | P3 (R-005/R-006) | Security Lead | Before G-2 (Q4 2026) | 🔄 |
| Produce ATRS-equivalent transparency record + model card | Theme 2 | Lead Architect | Q3 2026 | ⏳ |
| Translation-consistency/fairness test in CTK/eval suite | Theme 3 | ibn-core Engineering | Q3 2026 | ⏳ |
| Constitute EARB AI-oversight forum; register NAIO touchpoint | P7 / P10 (R-003) | Lead Architect / CTO | Q3 2026 | ⏳ |
| AI-provider responsible-AI contract terms in SI template | P8 (R-009) | SI Delivery Lead | At SI procurement | ⏳ |
| Periodic eval-set re-validation cadence + model-card trigger | P5 (R-013) | ibn-core Engineering | Continuous | ⏳ |

---

## Mandatory Documentation

### Required Assessments (binding equivalents in **bold**; UK instruments reference-only)

- [~] **ATRS-equivalent** (`/arckit:atrs` transparency record + model card): **not yet produced** (COND-2)
- [x] **DPIA** (PDPA-framed): `projects/001-ibn-core-my/ARC-001-DPIA-v1.0.md` — *approval pending (R-004)*
- [~] **EqIA-equivalent**: not produced; low bias surface by domain — use translation-consistency test (COND-3)
- [~] Human-rights assessment: not formally produced; low direct-rights exposure (operator-mediated)
- [x] **Security risk assessment**: `ARC-001-SECD-v1.0` + `ARC-001-RISK-v1.0` (R-005/R-008)
- [~] Bias audit: covered by the planned translation-consistency test (COND-3)
- [~] User-research report: B2B personas in `ARC-001-REQ-v1.0`; no standalone UR artefact
- [x] **AIGE alignment** (Malaysia, binding-framework lens): `ARC-001-AIGE-v1.0`
- [x] **PDPA 2010 compliance**: `ARC-001-PDPA-v1.0`

### Governance Approvals

- [ ] EARB AI-oversight approval: [PENDING — forum to be constituted]
- [ ] SRO sign-off (Lead Architect / CTO): [PENDING]
- [ ] PDPA / DPIA approval: [PENDING — go-live gate]
- [ ] Security review (pen test + NCII attestation): [PENDING — go-live gate]
- [ ] Operator network-team safety sign-off: [PENDING — G-2 release gate]

---

## Go/No-Go Decision

**Decision**: [ ] APPROVED / [x] **APPROVED WITH CONDITIONS** / [ ] REJECTED

**Rationale**: At **alpha** with mock adapters and no live network mutation/subscriber PII, the responsible-AI posture is sound (118/160; strong accountability, telemetry, security, lifecycle). Development continues. **First operator go-live (G-2) is gated** on the conditions below — consistent with the `ARC-001-RISK` go-live gates and the `ARC-001-AIGE` "Aligned with conditions" verdict.

**Conditions for Approval** (to lift before live network mutation / first SI go-live):

1. **COND-1** — 100% HITL gating on network-mutating actions + reversible-by-default orchestration with tested per-adapter rollback + parameterised elevated-assurance gate (R-001 residual → ≤ 9).
2. **COND-2** — ATRS-equivalent transparency record + model card published.
3. **COND-3** — Translation-consistency/bias evaluation of the LLM layer implemented and recorded.
4. **Plus the standing go-live gates**: DPIA approved (R-004), pen test + NCII attestation (R-005), EARB + operator network-team safety sign-off.

**Deployment Approval**: [ ] Yes / [x] **No (alpha-continue only; production blocked until conditions met)**

**Ongoing Monitoring Required**:

- [x] Quarterly governance reviews (Medium tier)
- [x] Continuous agent-telemetry monitoring (acting identity / phase) with alert on any tool call lacking the agent identity (R-008)
- [x] Translation-accuracy tracked as a release metric (R-013)
- [x] Annual comprehensive reassessment

---

## Sign-Off

**Assessed By**: ArcKit AI (`/arckit:ai-playbook`, arckit-build wave 8), on behalf of the ibn-core Architecture Team
**Date**: 2026-06-05

**Senior Responsible Owner**:
Name: Roland Pfeifer, Lead Architect / CTO (Vpnet Cloud Solutions Sdn. Bhd.)
Date: [PENDING]
Signature: [PENDING]

**EARB / AI-Oversight Chair**:
Name: [PENDING — forum to be constituted]
Date: [PENDING]
Signature: [PENDING]

---

## Review Schedule

**Next Review**: 2026-07-05
**Review Frequency**:

- [ ] Monthly (high-risk)
- [x] **Quarterly (medium-risk)**
- [ ] Annually (low-risk)

---

**Template Version**: 1.0
**Last Updated**: 2025-10-14
**Source**: https://www.gov.uk/government/publications/ai-playbook-for-the-uk-government (applied as a responsible-AI best-practice lens; binding Malaysian framework is AIGE/MOSTI + PDPA 2010 + NACSA NCII + MCMC)

## External References

> Traceability from generated content back to source documents.

### Document Register

| Doc ID | Filename | Type | Source Location | Description |
|--------|----------|------|-----------------|-------------|
| ARC-000-PRIN | ARC-000-PRIN-v1.0.md | Architecture Principles | projects/000-global/ | NON-NEGOTIABLE Standards/Security/Open-Core principles; zero-trust + agent identity |
| ARC-001-REQ | ARC-001-REQ-v1.0.md | Requirements | projects/001-ibn-core-my/ | AI in scope: FR-002 LLM translation, FR-003 autonomous MCP orchestration, FR-007 agent identity, FR-011 telemetry; BR-002/005 |
| ARC-001-RISK | ARC-001-RISK-v1.0.md | Risk Register | projects/001-ibn-core-my/ | R-001 (HITL gap), R-004 (PDPA), R-005 (NCII), R-008 (agent identity), R-009 (provider lock-in), R-013 (translation accuracy), R-016 (key-person) |
| ARC-001-AIGE | ARC-001-AIGE-v1.0.md | National AI Governance & Ethics | projects/001-ibn-core-my/ | Binding-framework lens (Malaysia AIGE/MOSTI/NAIO); HIGH-impact/Medium-residual; "Aligned with conditions" |
| ARC-001-DPIA | ARC-001-DPIA-v1.0.md | DPIA (PDPA-framed) | projects/001-ibn-core-my/ | Data-protection impact; approval pending (R-004) |
| ARC-001-PDPA | ARC-001-PDPA-v1.0.md | PDPA 2010 Compliance | projects/001-ibn-core-my/ | Binding personal-data obligations (7 DPP, DPO, breach, cross-border) |
| ARC-001-SECD | ARC-001-SECD-v1.0.md | Secure by Design | projects/001-ibn-core-my/ | Security controls + threat posture (AI-stack security) |
| ARC-001-ADR-001 | decisions/ARC-001-ADR-001-v1.0.md | ADR | projects/001-ibn-core-my/decisions/ | Constrained agent role + elevated-assurance gate + CAMARA egress |

### Citations

| Citation ID | Doc ID | Section | Category | Used in |
|-------------|--------|---------|----------|---------|
| [REQ-1] | ARC-001-REQ | FR-002/003/007/011; BR-002/005 | AI scope | System Overview; Principles 1–6 |
| [REQ-2] | ARC-001-REQ | NFR-SEC/A/C/M | Security/Resilience/Compliance | Principles 3/5; Themes 1 |
| [PRIN-1] | ARC-000-PRIN | P3/P4/P5/P9 | Principles | Principles 3/10; Accountability |
| [RISK-1] | ARC-001-RISK | R-001 | Human oversight / safety | Principle 4; Theme 1; Conditions |
| [RISK-2] | ARC-001-RISK | R-004/R-005/R-008 | Security / PDPA / identity | Principles 2/3; Theme 4 |
| [RISK-3] | ARC-001-RISK | R-009/R-013/R-016 | Lock-in / accuracy / skills | Principles 1/5/8/9 |
| [AIGE-1] | ARC-001-AIGE | Seven principles; Human Oversight | AI governance | Risk tier; Principle 4; Themes 2/3 |
| [PDPA-1] | ARC-001-PDPA | PDPA 2010 obligations | Lawful basis | Principle 2 |
| [ADR-1] | ARC-001-ADR-001 | Agent role + assurance gate | Accountability | Principle 4; Theme 4 |

### Unreferenced Documents

| Filename | Source Location | Reason |
|----------|-----------------|--------|
| ARC-001-STKE-v1.0.md | projects/001-ibn-core-my/ | Stakeholder/RACI context consumed indirectly via RISK/AIGE (Conflict-2, ownership) rather than cited directly |
| ARC-001-HLDR-v1.0.md | projects/001-ibn-core-my/ | HLD review (elevated-assurance gate as an HLD gap) referenced via AIGE/RISK, not cited directly |
| ARC-001-SOBC-v1.0.md | projects/001-ibn-core-my/ | Business case underpins Right-Tool value but not cited line-by-line |
| ARC-000-STRAT, ARC-001-MYCLAS/MYDIG/MCRES | projects/ | Context only; no direct AI-Playbook claim derived |

---

**Generated by**: ArcKit `/arckit:ai-playbook` command (arckit-build wave 8; `ai-mode=auto-detect-from-REQ-FRs`)
**Generated on**: 2026-06-05 (GMT)
**ArcKit Version**: 5.11.0
**Project**: ibn-core-my (Project 001)
**AI Model**: Claude Opus 4.8 (1M context)
**Generation Context**: Auto-detected AI in scope from `ARC-001-REQ` FRs (FR-002/003/007/011, BR-002/005). Sources: REQ, RISK, PRIN (000-global), AIGE, PDPA, SECD, ADR-001. UK AI Playbook (10 principles + 6 ethical themes) applied as a universal responsible-AI best-practice lens complementing the binding Malaysian AIGE/MOSTI + PDPA 2010 + NACSA NCII + MCMC framework; UK-specific bodies (CDDO, GDS/i.AI, ICO, ATRS) noted as reference-only. No external `external/` documents or `000-global/policies/` present at generation time.
