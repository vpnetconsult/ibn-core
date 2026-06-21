# Data Protection Impact Assessment (DPIA)

> **Template Origin**: Official (ArcKit `/arckit:dpia`, UK GDPR Art. 35 structure) | **ArcKit Version**: 5.11.0 | **Command**: `/arckit:dpia`

> ⚠️ **Jurisdiction note — binding instrument is Malaysia's PDPA, not UK GDPR.** This DPIA applies the ICO / UK GDPR Article 35 **structure** (the ArcKit `dpia` template) but the **binding legal instrument is the Malaysian Personal Data Protection Act 2010 [Act 709], as amended by the Personal Data Protection (Amendment) Act 2024**, administered by the **Personal Data Protection Department (Jabatan Perlindungan Data Peribadi, JPDP)**. The supervisory authority is **JPDP — not the UK ICO**. Where the template references "UK GDPR Articles", "ICO", "SAR", "Article 6/9", or "1-month SAR", read across to the corresponding PDPA construct (Seven Data Protection Principles, JPDP, data-subject access/correction, lawful-basis/consent). This DPIA aligns to and depends on `ARC-001-PDPA-v1.0` (PDPA Compliance Assessment) and must be reviewed by a qualified Malaysian data-protection practitioner before reliance. Verify PDPA/JPDP citations against <https://www.pdp.gov.my/>.

## Document Control

| Field | Value |
|-------|-------|
| **Document ID** | ARC-001-DPIA-v1.0 |
| **Document Type** | Data Protection Impact Assessment (PDPA 2010 am. 2024; UK GDPR Art. 35 structure) |
| **Project** | ibn-core-my (Project 001) |
| **Classification** | OFFICIAL-SENSITIVE |
| **Status** | APPROVED |
| **Version** | 1.0 |
| **Created Date** | 2026-06-05 |
| **Last Modified** | 2026-06-21 |
| **Review Cycle** | 12 months (or on material change, breach, or JPDP guidance update) |
| **Next Review Date** | 2027-06-05 |
| **Owner** | Roland Pfeifer, Lead Architect / CTO (Vpnet Cloud Solutions Sdn. Bhd.) |
| **Reviewed By** | Vpnet DPO-function owner review — Roland Pfeifer, CTO (2026-06-21); operator DPO per engagement |
| **Approved By** | Roland Pfeifer, CTO — Vpnet processor-side management acceptance, 2026-06-21; operator Data Controller approval + qualified MY data-protection practitioner review required per engagement before reliance |
| **Distribution** | ibn-core engineering, Vpnet SI delivery teams, Security/Compliance, operator integration partners (U Mobile, TM Malaysia), operator Compliance Officers / DPOs |

> **Assessment Date**: 2026-06-05 · **Scope**: Full system · **Phase**: Alpha · **Assessment risk posture**: Medium (pre-production; mock adapters in alpha; live subscriber PII enters at SI / v3.0.0).

## Revision History

| Version | Date | Author | Changes | Approved By | Approval Date |
|---------|------|--------|---------|-------------|---------------|
| 1.0 | 2026-06-05 | ArcKit AI | Initial creation from `/arckit:dpia` (arckit-build wave 7). Full-system scope; framed to PDPA 2010 (am. 2024) / JPDP per `ARC-001-PDPA-v1.0`; ICO 9-criteria screening = 4/9 → DPIA REQUIRED. | [PENDING] | [PENDING] |
| 1.0 (signed off) | 2026-06-21 | ArcKit AI | Vpnet processor-side management sign-off — Status → APPROVED; operator Data Controller approval + qualified-practitioner review retained as per-engagement gate | Roland Pfeifer, CTO | 2026-06-21 |

## Executive Summary

**Processing Activity**: AI-native translation and autonomous orchestration of subscriber intent on the Order-to-Cash (O2C) path — natural-language intent plus a `customerId` (e.g. `CUST-12345`) are ingested, PII-masked, translated by the Anthropic Claude LLM into a TMF921 Intent, and autonomously orchestrated to fulfilment, with OpenTelemetry traces emitted to a collector (LangSmith by default).

**DPIA Outcome**: **MEDIUM** residual risk to data subjects (one residual-HIGH risk — cross-border transfer — pending closure of the `MCRES`/`ADR-003`/DPA actions).

**Approval Status**: PENDING (DRAFT — for Vpnet DPO + operator Data Controller sign-off before live subscriber data at v3.0.0).

**Key Findings**:

- The **only** personal data ibn-core processes is subscriber PII on the O2C path — dataset **DS-009 (RESTRICTED)** per `ARC-001-MYCLAS-v1.0`: the `customerId` and the raw natural-language intent string (which may embed personal context). No special-category data is processed by design.
- The architectural privacy posture is strong: **fail-closed PII masking** (FR-009) before LLM invocation and downstream persistence, Keycloak JWT authentication (FR-006), least-privilege agent-role identity (FR-007), TLS 1.3 / mTLS + at-rest encryption (NFR-SEC-003), and the open-core seam (BR-003) preventing PII/credential leakage to the public repo.
- The principal residual exposure is **cross-border transfer** of masked-but-potentially-re-identifiable intent text to the Anthropic Claude API (INT-002) and telemetry to LangSmith (INT-004), to be governed by the **risk-based cross-border regime under PDP Guideline 03/2025** (RISK R-010, PDPA R-PDPA-03).
- PDPA-specific instrument **gaps** carried from `ARC-001-PDPA-v1.0` are confirmed here as DPIA risks: no DPO appointed/notified (mandatory from 1 June 2025), no subscriber-facing Notice & Choice, no data-portability mechanism (new 2024 right), and no PDPA-specific 72-hour/7-day breach-notification runbook.

**Recommendation**: **Proceed with conditions** — alpha may proceed with mock adapters; live subscriber data (SI / v3.0.0) is **gated** on closing the DPO, Notice & Choice, portability, breach-runbook, and cross-border-safeguard actions in Section 16.2.

**JPDP Prior Consultation Required**: NO formal JPDP prior-consultation instrument exists in PDPA equivalent to ICO Art. 36; however the residual-HIGH cross-border risk **must** be closed (documented safeguard + DPA) before live processing, and DPO notification to JPDP is a statutory precondition.

---

## 1. DPIA Screening Assessment

### 1.1 Screening Criteria (ICO's 9 Criteria — applied to the PDPA context)

| # | Criterion | YES/NO | Evidence |
|---|-----------|--------|----------|
| 1 | **Evaluation or scoring** including profiling and predicting | NO | The Claude layer emits a translation confidence signal (FR-002) but performs **no profiling, scoring, or prediction about the data subject**. Intent is translated, not the subscriber evaluated. |
| 2 | **Automated decision-making with legal or similarly significant effect** | YES | Autonomous agent cycles orchestrate fulfilment via `McpAdapter.orchestrate()` **without human-in-the-loop on low/medium-impact actions** (FR-003, BR-002, UC-1); the O2C outcome materially affects the subscriber's service provisioning. High-impact actions are HITL-gated (RISK R-001 control). |
| 3 | **Systematic monitoring** of data subjects | NO | ibn-core processes one-shot intent submissions; it does not track, surveil, or continuously monitor subscribers. Telemetry monitors the **system/agent**, not the data subject (Entity 3 excludes unmasked PII). |
| 4 | **Sensitive data or data of a highly personal nature** | NO | DS-009 (subscriber PII) is **RESTRICTED-tier but not special-category** (`ARC-001-MYCLAS-v1.0`). No health, biometric, racial, religious, or criminal data is processed by design. Residual risk: free-text intent could embed personal context (mitigated by FR-009 masking; see DPIA-007). |
| 5 | **Processing on a large scale** | YES | Operator deployment scope is the operator subscriber base (U Mobile / TM Malaysia — national telco scale); alpha ≤ 100k intent records, with per-operator tenant growth in SI (NFR-S-001/002, Entity 1 data volume). Geographic extent: national. |
| 6 | **Matching or combining datasets** from different sources | YES | The `customerId` and intent text are combined and orchestrated across **multiple parties** — operator systems (INT-001), the Anthropic Claude API (INT-002), and the telemetry backend (INT-004) — in ways a subscriber may not reasonably expect (third-party AI disclosure; PDPA Disclosure principle gap). |
| 7 | **Data concerning vulnerable data subjects** | NO | Data subjects are operator B2B/consumer subscribers (STKE SD-6); no children, patients, or capacity-impaired groups are identified in `ARC-001-STKE-v1.0`. (Note: a consumer subscriber base may include individuals in vulnerable circumstances — operator notice should account for this.) |
| 8 | **Innovative use or application of new technological solutions** | YES | LLM-based intent translation (Anthropic Claude, INT-002) and **autonomous AI agents** mutating live network configuration (FR-003, FR-007) — a novel, AI-native architecture (BR-002; STKE Conflict 2). |
| 9 | **Processing that prevents data subjects from exercising a right or using a service** | YES | Per `ARC-001-PDPA-v1.0`: **no data-portability mechanism** (new 2024 right), **no consent-withdrawal mechanism**, and access/correction are **operator-mediated only** — the data subject cannot directly exercise PDPA rights against ibn-core. |

**Screening Score**: **4/9 criteria met** (criteria 2, 5, 6, 8; with criterion 9 a rights-exercise gap).

### 1.2 DPIA Necessity Decision

**Decision**: **DPIA REQUIRED**

**Rationale**:

- ≥ 2 ICO criteria met (4/9) → DPIA REQUIRED under the UK GDPR Art. 35 structure.
- Independently, **NFR-C-001 mandates a DPIA for AI processing of subscriber data**, and `ARC-001-PDPA-v1.0` (§Cross-Reference & Hand-offs) lists the DPIA as a required, pending hand-off.
- Innovative technology (autonomous AI agents on live national infrastructure) with automated decision effect and large-scale, multi-party (incl. cross-border) processing is precisely the high-risk profile a DPIA exists to assess.

**Decision Authority**: Roland Pfeifer, Lead Architect / CTO (Vpnet Cloud Solutions Sdn. Bhd.) — Accountable for data-protection/PDPA decisions per `ARC-001-STKE-v1.0` RACI.

**Decision Date**: 2026-06-05

---

## 2. Description of Processing

### 2.1 Nature of Processing

**What operations are being performed?**

- [x] Collection (natural-language intent + `customerId` via `POST /api/v1/intent`, FR-001)
- [x] Recording (TMF921 Intent persisted in Redis SSoT, FR-005)
- [x] Organisation / Structuring (translation to structured TMF921 Intent, FR-002)
- [x] Storage (Redis SSoT, encrypted at rest, NFR-SEC-003)
- [x] Adaptation/alteration (PII masking, FR-009)
- [x] Retrieval (`GET /api/v1/intent/{id}`, FR-013)
- [x] Use (autonomous orchestration of fulfilment, FR-003)
- [x] Disclosure by transmission (to Claude API INT-002 masked; to operator systems INT-001; to telemetry backend INT-004)
- [x] Alignment/combination (intent + customerId combined across parties)
- [x] Erasure/destruction (automated deletion after retention, NFR-C-001 — schedule pending)

**Processing Method**:

- [x] Combination of automated and manual — fully automated translation and low/medium-impact orchestration; human-in-the-loop (HITL) gating on high-impact network-mutating actions (RISK R-001 control).

**Profiling Involved**: NO — no profiling of the data subject; the LLM translates intent, it does not evaluate the individual.

**Automated Decision-Making**: YES (partial)

- Autonomous agent cycles orchestrate fulfilment and project an IntentReport `reportState` without human action on low/medium-impact paths (FR-003, FR-008).
- **Human oversight**: YES on high-impact actions — phased autonomy by blast radius; high-impact (network-mutating) actions HITL-gated before first go-live (RISK R-001; STKE G-3). Every autonomous action runs under a constrained, attributable agent-role identity (FR-007) and emits telemetry (FR-011).

### 2.2 Scope of Processing

#### What data are we processing?

**Personal Data Categories** (from `ARC-001-REQ-v1.0` Data Entities + `ARC-001-MYCLAS-v1.0` DS-009):

| Entity ID | Entity Name | Data Categories | Special Category? | PII Level |
|-----------|-------------|-----------------|-------------------|-----------|
| E-001 | Intent | `customerId` (subscriber/tenant reference, indexed, may be masked); `expression` (TMF921 Intent translated from raw intent text, which may embed personal context) | NO | HIGH (RESTRICTED-tier per DS-009) |
| E-002 | IntentReport | `reportState`, diagnostics referencing the parent Intent; no direct PII fields, inherits Intent linkage | NO | MEDIUM (CONFIDENTIAL) |
| E-003 | Agent Action / Telemetry Event | `correlationId`, acting `identity`, RFC 9315 `phase`, tool-invocation detail — **must exclude unmasked subscriber PII** | NO | LOW (INTERNAL; PII-free by design) |

**Total Data Items**: Subscriber PII is concentrated in **two fields** — `customerId` and the raw natural-language `intent` string — across one primary entity (Intent), per `ARC-001-PDPA-v1.0`.

**Special Category Data**: NO — no Article-9-equivalent / special-category data is processed by design (DS-009 is RESTRICTED, not special-category).

**Children's Data**: NO — no children identified as a data-subject category in `ARC-001-STKE-v1.0` (Section 14 marked Not Applicable).

#### Whose data are we processing?

**Data Subject Categories** (from `ARC-001-STKE-v1.0`):

| Data Subject Type | Description | Volume | Vulnerable? |
|-------------------|-------------|--------|-------------|
| Operator subscribers (O2C buyers) | End-customer enterprises and their users whose connectivity intent is fulfilled — STKE SD-6 beneficiaries | Operator subscriber base (national scale); alpha ≤ 100k intent records | NO (consumer base may include individuals in vulnerable circumstances — operator notice to account for this) |

**Total Data Subjects**: At alpha, none live (mock adapters). At SI / v3.0.0: scoped to the contracting operator's subscriber base per engagement (national telco scale).

**Vulnerable Groups**: None specifically identified. Operator-provided Notice & Choice should account for consumer subscribers who may be in vulnerable circumstances.

#### How much data?

**Volume Metrics**:

- **Records**: Alpha up to 100k intent records (Entity 1); per-operator growth in SI.
- **Data subjects**: Operator subscriber base (SI); zero live in alpha.
- **Transaction rate**: Alpha target ≥ 5 intent submissions/second; 50 concurrent (NFR-P-001/002).
- **Geographic scope**: National (Malaysia), with cross-border egress to the AI provider and (by default) telemetry backend.

**Scale Classification**: **Large scale** — national telco subscriber base, high transaction rate, multi-party flows.

#### How long are we keeping it?

**Retention Periods** (from `ARC-001-REQ-v1.0` + `ARC-001-PDPA-v1.0`):

| Data Type | Retention Period | Legal Basis for Retention | Deletion Method |
|-----------|------------------|---------------------------|-----------------|
| Intent (`customerId`, expression) | Per operator policy; automated deletion after retention (NFR-C-001) — **concrete DS-009 schedule pending** | Business need (intent lifecycle) + operator contractual obligation | Secure deletion; automated retention job (to be implemented) |
| IntentReport | Aligned with parent Intent retention | Business need | Secure deletion |
| Agent/Telemetry events | Per audit/log retention (NFR-C-002: security/audit 1–7 years; app logs 30–90 days) — **PII-free by design** | Audit/compliance | Log-rotation / retention policy |
| Unmasked subscriber PII | **Not persisted** beyond the ingestion path (masked before persistence, FR-009) | N/A | N/A — minimised at source |

**Maximum Retention**: Audit/security logs up to 7 years (PII-free); intent records per operator policy (schedule to be defined — gap, DPIA-004).

**Automated Deletion**: Required by NFR-C-001; **mechanism + concrete DS-009 retention schedule not yet implemented** (gap — see DPIA-004 / R-PDPA-06).

### 2.3 Context of Processing

#### Why are we processing this data?

**Processing Purpose** (from `ARC-001-REQ-v1.0`):

| Requirement ID | Purpose | Stakeholder Goal |
|----------------|---------|------------------|
| BR-002 / FR-001 / FR-002 | Translate natural-language subscriber intent into a structured TMF921 Intent | STKE G-2 (operator in production); SD-6 (fast reliable O2C) |
| FR-003 / FR-008 | Autonomously orchestrate intent fulfilment and report compliance state | STKE G-3 (safe observable agents) |
| FR-005 | Persist authoritative intent state (Redis SSoT) | RFC 9315 §4 P1 single-source-of-truth |
| FR-009 | Mask subscriber PII before AI/downstream processing | STKE G-5 (PDPA + data sovereignty) |
| FR-011 | Emit agent/application telemetry (PII-free) | STKE G-3 observability |

**Primary Purpose**: Fulfil a subscriber's connectivity intent (Order-to-Cash) by translating it to a standards-conformant TMF921 Intent and orchestrating fulfilment — minimising the personal data exposed by masking it before AI/downstream handling.

**Secondary Purposes**: None. Telemetry is for system/agent observability (PII-free) — not a secondary processing of personal data. No marketing, profiling, or analytics on the subscriber.

#### What is the relationship with data subjects?

**Relationship Type**:

- [x] Customer/client — the data subject is the operator's subscriber; ibn-core/Vpnet acts as **data processor** to the operator **data controller** (per `ARC-001-PDPA-v1.0`).

**Power Balance**:

- [x] Imbalanced relationship — the subscriber has no direct relationship with ibn-core/Vpnet; the operator holds the subscriber relationship and the consent/notice obligation. **Safeguard**: ibn-core minimises personal data (masking), processes only on the controller's instruction, and exposes no subscriber-facing surface; the controller (operator) provides Notice & Choice and mediates rights.

#### How much control do data subjects have?

**Control Mechanisms** (per `ARC-001-PDPA-v1.0` Data-Subject Rights):

- [ ] Consent can be withdrawn — **NO (gap)**; consent captured upstream by operator; no withdrawal hook in ibn-core (DPIA-009).
- [ ] Can opt out of processing — operator-mediated only.
- [x] Can access their data — **Partial**; operator-mediated via TMF921 `GET /api/v1/intent/{id}` to the operator, not directly to the subscriber.
- [x] Can correct inaccurate data — **Partial**; subscriber accuracy sourced from operator systems; correction propagation to retained records to be defined.
- [ ] Can request deletion — via operator retention/deletion; no direct subscriber channel.
- [ ] Can port data — **NO (gap)**; data-portability (new 2024 right) not implemented (DPIA-010).
- [ ] Can object to automated decisions — no direct channel; HITL gating on high-impact actions is the operational safeguard.

**Limitations on Control**: ibn-core is a processor with no direct subscriber relationship; all data-subject control is mediated by the operator controller. Several PDPA rights (portability, consent-withdrawal) have no implementation — see Section 12.

#### Would data subjects expect this processing?

**Reasonable Expectation Assessment**:

- **Transparency**: Whether the data subject is informed depends on the operator's Notice & Choice — **not yet evidenced** (`ARC-001-PDPA-v1.0` Notice & Choice = gap).
- **Privacy Notice**: NO subscriber-facing notice is part of ibn-core; ingestion assumes upstream operator consent/notice.
- **Expectation**: MAYBE — a subscriber would expect connectivity provisioning, but **may not expect disclosure of intent text to a third-party AI provider (Anthropic)**. This drives the Disclosure-principle and cross-border findings.

**If unexpected processing**: Additional safeguards — fail-closed PII masking before AI invocation (FR-009); operator notice must disclose the AI-processing recipient (Anthropic) and cross-border telemetry recipient.

### 2.4 Purpose and Benefits

#### What do we want to achieve?

**Intended Outcomes** (from `ARC-001-STKE-v1.0` goals):

| Stakeholder Goal | Processing Contribution | Measurable Benefit |
|------------------|------------------------|--------------------|
| G-2 (operator in production) | Intent fulfilment via AI translation + orchestration | ≥ 99% O2C fulfilment in steady state |
| G-5 (PDPA + data sovereignty) | PII masking, residency, retention, maintained DPIA | 0 PII-in-log incidents; 100% residency-conformant |
| SD-6 (fast reliable O2C) | Low-latency intent ingestion and fulfilment | < 10 s submission→accepted Intent (p95) |

**Primary Benefit**: Faster, accurate, auditable connectivity provisioning for subscribers, with personal data minimised by design.

#### Who benefits?

- [x] Data subjects — faster, more reliable O2C service (SD-6).
- [x] Organisation — Vpnet SI revenue; operator differentiation (G-2).
- [x] Society/public — more efficient national telecom operations (indirect).
- [x] Third parties — operators (U Mobile, TM) as controllers and commercial beneficiaries.

---

## 3. Consultation

### 3.1 Data Protection Officer (DPO) Consultation

**DPO Name**: [PENDING — **no DPO yet appointed**; mandatory from 1 June 2025 for both controller (operator) and processor (Vpnet) under the PDPA (Amendment) Act 2024 — `ARC-001-PDPA-v1.0` / R-PDPA-01].

**Date Consulted**: [PENDING — DPO appointment + JPDP notification is a precondition for live processing.]

**DPO Advice**: Cannot be recorded until a DPO is appointed. This DPIA itself serves as the structured input the DPO must review and sign off (Section 8) before live subscriber data at v3.0.0.

**DPO Recommendations**: [PENDING DPO appointment.]

**How DPO Advice Addressed**: [PENDING — gating action GA-1, Section 16.2.]

### 3.2 Data Subject Consultation

**Consultation Method**:

- [x] Not consulted directly (explain why): ibn-core is a **processor with no direct subscriber relationship**; the operator (controller) holds the subscriber relationship and is responsible for Notice & Choice and any consultation. Direct consultation by Vpnet is not feasible or appropriate at alpha (no live subscribers; mock adapters).

> **Orchestration note**: The skill's default consultation method is **Surveys**; here the appropriate, documented approach is **operator-mediated** — the controller (operator) conducts any subscriber-facing notice/consultation. Recorded as "Not applicable to the processor" rather than a survey, consistent with the imbalanced processor relationship in Section 2.3.

**Date(s) Consulted**: N/A (operator-mediated; pre-live).

**Key Feedback Received**: N/A at alpha.

**How Feedback Addressed**: Operator to provide bilingual (Bahasa Malaysia + English) Notice & Choice at point of collection; ibn-core to record a consent/lawful-basis reference field alongside `customerId` (`ARC-001-PDPA-v1.0` Notice & Choice action).

### 3.3 Stakeholder Consultation

**Stakeholders Consulted** (from `ARC-001-STKE-v1.0` RACI):

| Stakeholder | Role | Date Consulted | Feedback Summary |
|-------------|------|----------------|------------------|
| Lead Architect / CTO | Accountable — data-protection/PDPA decisions | 2026-06-05 (artefact-based) | Confirms DPIA required (NFR-C-001); PDPA is the binding instrument, not UK GDPR. |
| Vpnet Security / Compliance | Responsible — zero-trust, PDPA, NCII, identity | 2026-06-05 (artefact-based) | Masking fail-closed and in-region telemetry default are the key controls (RISK R-004). |
| Operator Compliance Officer / DPO | Consulted — controller-side PDPA, residency sign-off | [PENDING per engagement] | Notice & Choice, lawful basis, controller-vs-processor roles in DPA. |
| SI Delivery Lead | Consulted — go-live gating | 2026-06-05 (artefact-based) | DPIA approval is a binary go-live gate (STKE G-2/G-5). |

**Key Stakeholder Concerns**: Cross-border transfer to Anthropic; absence of DPO/Notice/portability/breach-runbook before live data.

**Resolution**: Captured as gating actions GA-1…GA-5 (Section 16.2); none blocks alpha (mock adapters), all block live subscriber data at v3.0.0.

---

## 4. Necessity and Proportionality Assessment

### 4.1 Lawful Basis Assessment (PDPA "General Principle" — read across from UK GDPR Article 6)

> Under the PDPA, lawful processing rests on the **General Principle** (s.6): processing requires the data subject's **consent** unless a statutory exception applies, plus purpose limitation. There is no UK-GDPR-style six-basis menu; the practical equivalents are **consent** and **necessity for a contract/transaction**.

- [x] **Consent (PDPA General Principle)** — Processing of subscriber intent rests on **consent captured upstream by the operator (controller)** at the point of collection.
  - Evidence of consent: **Operator-held; not yet evidenced in ibn-core** (Notice & Choice gap). ibn-core to record a consent/lawful-basis **reference field** alongside `customerId`.
  - Freely given, specific, informed, unambiguous: **To be ensured by the operator's bilingual Notice & Choice.**
  - Withdrawal mechanism: **Gap** — no withdrawal hook in ibn-core (DPIA-009).

- [x] **Necessity for performance of the subscriber's service request (contract-equivalent)** — Processing the intent is necessary to provision the connectivity the subscriber requested (O2C).
  - How processing is necessary: the `customerId` and intent text are the minimum needed to translate and fulfil the requested service.

**Justification for Chosen Basis**: As **processor**, Vpnet/ibn-core relies on the operator controller's lawful basis (consent + service necessity). The DPA between operator and Vpnet must record controller-vs-processor roles and the lawful basis per engagement (`ARC-001-PDPA-v1.0` General principle action).

### 4.2 Special Category Data Basis (Article 9 equivalent)

**Applicable**: **NO** — ibn-core processes **no special-category / sensitive personal data** by design (DS-009 is RESTRICTED-tier subscriber PII, not sensitive data under PDPA s.40). No Article-9-equivalent condition is required.

**Residual consideration**: Free-text intent could inadvertently embed sensitive context. This is mitigated by fail-closed masking (FR-009) and is tracked as DPIA-007 (re-identification / residual-PII leakage). Operator notice should discourage entry of sensitive personal data in the free-text field.

### 4.3 Necessity Assessment

| Question | Answer | Justification |
|----------|--------|---------------|
| Can we achieve the purpose without processing personal data? | NO | A `customerId` is required to bind the intent to the correct subscriber/tenant for fulfilment; the intent text is the subject of translation. |
| Can we achieve the purpose with less personal data? | NO (already minimised) | Only two PII fields are used; both are masked before AI/downstream processing (FR-009); unmasked PII is not persisted. |
| Can we achieve the purpose with less intrusive processing? | NO | Masking-before-AI is the least-intrusive viable design; the alternative (sending raw PII to the LLM) is rejected. |
| Can we achieve the purpose by processing data for less time? | PARTIALLY | Yes — a concrete DS-009 retention schedule with automated deletion is required (gap, DPIA-004). |

**Necessity Conclusion**: Processing is **NECESSARY** for O2C intent fulfilment, with data already minimised to two fields and masked before AI handling.

**Alternatives Considered**:

1. Send raw (unmasked) intent + `customerId` to the LLM — **Rejected**: unnecessary personal-data exposure and cross-border risk; masking achieves the purpose.
2. Rule-based (non-AI) translation to avoid third-party AI disclosure — **Rejected**: does not meet the AI-native value proposition (BR-002) and accuracy targets; masking + cross-border safeguard is the proportionate path.

### 4.4 Proportionality Assessment

**Data Minimization**:

- [x] We only collect data adequate for the purpose — `customerId` + intent text only.
- [x] We only collect data relevant for the purpose — both fields are load-bearing for fulfilment.
- [x] We do not collect excessive data — no profiling, no secondary collection; telemetry is PII-free by design.
- Evidence: `ARC-001-REQ-v1.0` Data Entities; FR-009 masking; `ARC-001-PDPA-v1.0` (masking enforces minimisation, fails closed).

**Proportionality Factors**:

| Factor | Assessment | Score (1-5) |
|--------|------------|-------------|
| Severity of intrusion into private life | Low (two fields, masked, no profiling) | 2 |
| Benefits to data subjects | Medium (faster, reliable O2C) | 3 |
| Benefits to organisation | High (SI revenue, differentiation) | 4 |
| Benefits to society | Medium (efficient telecom) | 3 |
| Reasonable alternatives exist | No (for AI-native purpose) | 4 |

**Proportionality Conclusion**: Processing is **PROPORTIONATE** — intrusion is low (minimised, masked, no profiling) relative to the service benefit, provided the cross-border safeguard, Notice & Choice, and retention schedule are closed before live data.

**Justification**: The design embodies data minimisation (masking-before-AI, no PII persistence, PII-free telemetry). The one disproportionality risk — third-party AI disclosure of re-identifiable intent text across borders — is the subject of the residual-HIGH risk DPIA-005 and its safeguard action.

---

## 5. Risk Assessment to Data Subjects

**CRITICAL**: These risks assess harm to **individuals' rights and freedoms** (subscribers), not organisational risk. Where an organisational risk in `ARC-001-RISK-v1.0` has a data-subject dimension, it is cross-referenced.

### 5.1 Risk Identification

Risk categories considered: material damage (identity/financial exposure via `customerId`), non-material damage (loss of control over personal data, distress, unexpected third-party/cross-border disclosure), and discrimination (not applicable — no profiling).

### 5.2 Inherent Risks (Before Mitigation)

| Risk ID | Risk Description | Impact on Data Subjects | Likelihood | Severity | Risk Level | Risk Source |
|---------|------------------|-------------------------|------------|----------|------------|-------------|
| DPIA-001 | Unauthorised access to `customerId` / intent text in the SSoT | Loss of confidentiality; potential identity linkage | Medium | High | **HIGH** | Security vulnerability / access control |
| DPIA-002 | Subscriber PII leaks into logs or telemetry spans | Loss of control over personal data; unexpected exposure | Medium | High | **HIGH** | Telemetry / logging path |
| DPIA-003 | Unmasked or re-identifiable intent text disclosed to Anthropic Claude (third-party AI) | Unexpected third-party disclosure; loss of control | Medium | High | **HIGH** | AI-processing disclosure (INT-002) |
| DPIA-004 | Excessive retention of intent records (no concrete DS-009 schedule) | Personal data kept longer than necessary | Medium | Medium | **MEDIUM** | Retention policy gap |
| DPIA-005 | Cross-border transfer of (masked) intent + telemetry without a documented risk-based safeguard | Personal data subject to foreign jurisdiction without PDPA-compliant basis | Medium | High | **HIGH** | Cross-border transfer (INT-002/004) |
| DPIA-006 | Autonomous agent acts on the wrong subscriber's intent (mis-orchestration) | Wrong provisioning affecting the individual's service | Low | High | **MEDIUM** | Automated decision-making (FR-003) |
| DPIA-007 | Re-identification of "masked" intent revealing residual PII / sensitive context | Sensitive personal context exposed despite masking | Low | High | **MEDIUM** | Masking-coverage gap (FR-009) |
| DPIA-008 | Function creep — intent data reused for an unintended purpose | Processing beyond the subscriber's expectation | Low | Medium | **LOW** | Purpose-limitation drift |
| DPIA-009 | No consent-withdrawal mechanism — withdrawn consent not honoured downstream | Continued processing against the subject's wishes | Medium | Medium | **MEDIUM** | Rights-exercise gap |
| DPIA-010 | No data-portability mechanism (new 2024 PDPA right) | Subject cannot obtain/port their intent data | Medium | Low | **LOW** | Rights-exercise gap |

**Likelihood Scale**: Low (0–33%), Medium (34–66%), High (67–100%).

**Severity Scale**: Low (temporary inconvenience) · Medium (significant distress / minor loss) · High (serious consequences / significant exposure) · Very High (irreversible harm).

**Risk Level Matrix**:

|                       | Low Severity | Medium Severity | High Severity | Very High Severity |
|-----------------------|-------------|-----------------|---------------|--------------------|
| **Low Likelihood**    | LOW   | LOW    | MEDIUM | HIGH      |
| **Medium Likelihood** | LOW   | MEDIUM | HIGH   | VERY HIGH |
| **High Likelihood**   | MEDIUM| HIGH   | VERY HIGH | VERY HIGH |

### 5.3 Detailed Risk Analysis

**DPIA-003 / DPIA-005: Third-party AI disclosure and cross-border transfer of intent text**

**Description**: Intent text (masked) is transmitted to the Anthropic Claude API (INT-002) for translation, and telemetry is exported (by default) to LangSmith (INT-004) — both likely outside Malaysia. If masking is incomplete, or the transfer lacks a documented PDPA risk-based safeguard, subscriber personal data is disclosed to a third party and crosses borders without a compliant basis.

**Data Subjects Affected**: All subscribers whose intent is translated (operator subscriber base at SI).

**Harm to Individuals**: Non-material — loss of control over personal data; exposure to a foreign jurisdiction's legal regime; unexpected third-party disclosure. Material — if re-identifiable, potential linkage to the individual.

**Likelihood Analysis**: Medium — masking reduces but does not eliminate residual re-identifiable content; cross-border egress to the AI provider is **by design** (INT-002). Telemetry cross-border is mitigated by the in-region collector default.

**Severity Analysis**: High — regulated personal-data transfer without a compliant basis is a PDPA breach with subscriber-trust and statutory consequences (penalties up to RM1,000,000 / 3 years under the 2024 amendment).

**Existing Controls**: Fail-closed PII masking before invocation (FR-009); in-region telemetry collector default with LangSmith gated on PDPA/DPIA sign-off (ADR-003); documented legal basis required for any transfer (NFR-C-001).

**DPIA-002: PII leakage into logs / telemetry**

**Description**: An unmasked field reaches a log line or a telemetry span (Entity 3 is meant to be PII-free).

**Harm**: Loss of control over personal data; broad internal/third-party exposure if spans egress cross-border.

**Likelihood / Severity**: Medium / High → HIGH inherent. **Existing controls**: masking fail-closed (FR-009); telemetry designed PII-free; OTLP metrics exporter hard-disabled to stop unauthenticated egress (RISK R-009; commit c28ce16); "assert PII-free telemetry spans in CI" action (RISK R-004).

**DPIA-006: Autonomous mis-orchestration affecting the wrong subscriber**

**Description**: An autonomous cycle acts on an incorrect intent/subscriber binding, provisioning the wrong service.

**Harm**: Service disruption to the individual; potential exposure of one subscriber's provisioning to another.

**Likelihood / Severity**: Low / High → MEDIUM. **Existing controls**: schema validation (no invalid Intent persisted, FR-002); HITL on high-impact actions (RISK R-001); constrained agent-role identity + audit attribution (FR-007, NFR-C-002); SSoT integrity (FR-005).

[Remaining risks DPIA-001, DPIA-004, DPIA-007, DPIA-008, DPIA-009, DPIA-010 follow the same structure; mitigations in Section 6.]

---

## 6. Mitigation Measures

### 6.1 Technical Measures

**Data Security**:

- [x] **Encryption at rest** — SSoT (Redis) and backups encrypted (NFR-SEC-003).
- [x] **Encryption in transit** — TLS 1.3; mTLS within the Istio mesh; TLS egress to operator/AI endpoints (NFR-SEC-003).
- [x] **Data masking** — fail-closed PII masking on the ingestion path before AI/downstream processing; masking failure **blocks** model invocation (FR-009). The single highest-leverage privacy control.
- [x] **Access controls** — Keycloak JWT authentication (FR-006); RBAC least privilege; MFA for human/privileged access (NFR-SEC-001/002).
- [x] **Audit logging** — structured who/what/when/where/why/result for privileged + agent actions (NFR-C-002); acting identity recorded.
- [x] **Secure deletion** — automated deletion after retention required (NFR-C-001) — **to be implemented (DPIA-004)**.
- [ ] **Pseudonymization** — partial; `customerId` may be masked. Consider tokenising `customerId` end-to-end.

**Data Minimization**:

- [x] **Collection limitation** — only `customerId` + intent text collected.
- [x] **Storage limitation** — automated deletion after retention (to be implemented); unmasked PII not persisted.
- [x] **Processing limitation** — purpose limited to O2C intent fulfilment; telemetry PII-free.
- [x] **Disclosure limitation** — masked before disclosure to Anthropic; orchestration limited to the operator environment.

**Technical Safeguards for AI/Autonomous processing**:

- [x] **Human oversight** — HITL gating on high-impact (network-mutating) actions; phased autonomy by blast radius (RISK R-001; STKE G-3).
- [x] **Constrained agent identity** — least-privilege agent-role identity, never human/admin; deny-by-default scopes; negative tests (FR-007; RISK R-008).
- [x] **Attribution / explainability** — GenAI semantic conventions + `rfc9315.phase` telemetry for every autonomous action (FR-011).
- [ ] **Bias testing** — N/A — no profiling/scoring of data subjects; intent translation only.

### 6.2 Organisational Measures

**Policies and Procedures**:

- [ ] **Privacy Notice (Notice & Choice)** — **gap** — operator to provide bilingual (BM + English) notice at collection; ibn-core to record a lawful-basis reference (DPIA-009; R-PDPA-05).
- [x] **Data classification** — DS-009 RESTRICTED applied (`ARC-001-MYCLAS-v1.0`).
- [ ] **Retention and Disposal Policy** — **gap** — concrete DS-009 retention schedule + automated deletion (DPIA-004; R-PDPA-06).
- [ ] **Data Breach Response Plan (PDPA)** — **gap** — PDPA-specific runbook for **72-hour Commissioner (JPDP)** and **7-day data-subject** notification (DPIA per `ARC-001-PDPA-v1.0`; NFR-M-003).
- [ ] **Data Subject Rights Procedures** — operator-mediated access/correction; portability + withdrawal not implemented.

**Vendor / Processor Management**:

- [ ] **Data Processing Agreement (DPA)** — **required** — operator (controller) ↔ Vpnet (processor); plus a DPA/contractual safeguard with Anthropic for cross-border AI processing.
- [x] **Cross-border safeguard** — apply the **risk-based regime (PDP Guideline 03/2025)** to Anthropic + LangSmith flows; documented legal basis (hand-off to `MCRES` / `ADR-003`).
- [x] **In-region telemetry collector** — prefer the on-shore Canvas collector for SI to avoid cross-border telemetry (INT-004; ADR-003).

**Governance**:

- [ ] **Data Protection Officer (DPO)** — **gap** — appoint + notify JPDP for Vpnet (processor) and each operator (controller); mandatory from 1 June 2025 (R-PDPA-01; GA-1).
- [x] **Privacy by Design / Default** — masking-before-AI, PII-free telemetry, no PII persistence, least-privilege agent identity.
- [x] **Regular reviews** — 12-month DPIA review cycle; quarterly PDPA review (`ARC-001-PDPA-v1.0`).

### 6.3 Mitigation Mapping

| Risk ID | Risk Title | Mitigations Applied | Responsibility | Implementation Date |
|---------|------------|---------------------|----------------|---------------------|
| DPIA-001 | Unauthorised access to PII | Encryption at rest; Keycloak JWT + RBAC least privilege; mTLS; audit logging | Security Lead | Before v3.0.0 go-live |
| DPIA-002 | PII leakage in logs/telemetry | Fail-closed masking (FR-009); PII-free telemetry by design; OTLP metrics exporter disabled; assert PII-free spans in CI | Security + Engineering | Before v3.0.0 go-live |
| DPIA-003 | Third-party AI disclosure | Mask before invocation (FR-009); disclose Anthropic recipient in operator notice; DPA with Anthropic | Security + Operator Compliance | Before v3.0.0 go-live |
| DPIA-004 | Excessive retention | Concrete DS-009 retention schedule + automated deletion; legal-hold capability (NFR-C-001) | SI Delivery + Security | Before v3.0.0 go-live |
| DPIA-005 | Cross-border transfer | Risk-based assessment (PDP Guideline 03/2025) + documented safeguard/DPA; in-region telemetry default | Security Lead (via MCRES/ADR-003) | Before v3.0.0 go-live |
| DPIA-006 | Autonomous mis-orchestration | Schema validation; HITL on high-impact; agent-role identity + audit; SSoT integrity | Security + Engineering | Before v3.0.0 go-live |
| DPIA-007 | Residual-PII re-identification | Validate masking coverage (fail-closed); discourage sensitive free-text in notice; pen-test (NFR-SEC-005) | Security Lead | Before v3.0.0 go-live |
| DPIA-009 | No consent-withdrawal | Record lawful-basis/consent reference; honour withdrawal in retention/deletion | Operator Compliance + Engineering | Before v3.0.0 go-live |
| DPIA-010 | No data portability | Structured export of a subscriber's retained intent records on operator-relayed request | Engineering | Before v3.0.0 go-live |

### 6.4 Residual Risk Assessment

| Risk ID | Risk Title | Mitigations | Residual Likelihood | Residual Severity | Residual Risk Level | Acceptable? | Justification |
|---------|------------|-------------|---------------------|-------------------|---------------------|-------------|---------------|
| DPIA-001 | Unauthorised access | Encryption + JWT/RBAC + mTLS + audit | Low | High | **MEDIUM** | YES | Strong access + crypto controls reduce likelihood to Low. |
| DPIA-002 | PII leakage in telemetry | Fail-closed masking + PII-free telemetry + CI assertion | Low | High | **MEDIUM** | YES (with CI assertion live) | Masking fail-closed is strong; CI assertion needed to confirm. |
| DPIA-003 | Third-party AI disclosure | Masking + notice disclosure + DPA | Low | High | **MEDIUM** | YES (with DPA) | Masking minimises content; DPA + notice make disclosure lawful/expected. |
| DPIA-004 | Excessive retention | Retention schedule + automated deletion | Low | Medium | **LOW** | YES (once implemented) | Technical deletion enforces storage limitation. |
| DPIA-005 | Cross-border transfer | Risk-based safeguard + DPA + in-region telemetry | Low | High | **HIGH** | **CONDITIONAL** | Remains HIGH until the documented safeguard/DPA (MCRES/ADR-003) is in place — go-live-gating. |
| DPIA-006 | Autonomous mis-orchestration | Validation + HITL + identity + SSoT | Low | High | **MEDIUM** | YES | HITL on high-impact + attribution contain the harm. |
| DPIA-007 | Residual-PII re-identification | Masking-coverage validation + pen-test | Low | High | **MEDIUM** | YES | Fail-closed masking + testing reduce likelihood to Low. |
| DPIA-008 | Function creep | Purpose limitation + audit | Low | Medium | **LOW** | YES | No secondary use designed; audit detects drift. |
| DPIA-009 | No consent-withdrawal | Lawful-basis reference + honour in deletion | Low | Medium | **LOW** | YES (once implemented) | Operator-mediated withdrawal honoured downstream. |
| DPIA-010 | No data portability | Structured export on operator request | Low | Low | **LOW** | YES (once implemented) | Export mechanism satisfies the 2024 right. |

**Overall Residual Risk Level**: **MEDIUM** — with **one residual-HIGH** risk (DPIA-005, cross-border transfer) that is **conditional on closing the safeguard/DPA before live subscriber data**.

**Acceptability Assessment**:

- [x] Some residual risks are HIGH → **ACCEPTABLE WITH CONDITIONS** — DPIA-005 must be closed before v3.0.0 live processing; alpha (mock adapters, no live subscribers) is acceptable.

**Conditions for Acceptance**:

1. Document a PDPA risk-based cross-border safeguard + DPA for Anthropic (INT-002) and confirm in-region telemetry for SI (INT-004) — closes DPIA-005 to MEDIUM.
2. Appoint + notify a DPO to JPDP (controller and processor) before live processing.
3. Implement Notice & Choice (operator), retention schedule + automated deletion, data-portability export, and the PDPA breach-notification runbook.

---

## 7. JPDP / ICO Prior Consultation

**Prior Consultation Required**: **NO formal instrument** — Malaysia's PDPA does **not** have a UK-GDPR-Article-36-style "prior consultation with the supervisory authority for residual high risk" mechanism, so there is no ICO-equivalent prior-consultation filing with JPDP.

**However**: The residual-HIGH risk **DPIA-005 (cross-border transfer)** must be reduced to MEDIUM via a documented risk-based safeguard + DPA **before live subscriber data** (v3.0.0). Statutory preconditions that must be met before live processing:

- **DPO appointment and notification to JPDP** (mandatory from 1 June 2025).
- **Breach-notification readiness**: 72-hour JPDP notification and 7-day data-subject notification runbook in place.
- Where a breach is also a cyber incident on Critical Information Infrastructure (telecom), coordinate the **NACSA NCII** reporting path (hand-off to `/arckit:my-cyber-security`).

| Field | Value |
|-------|-------|
| JPDP engagement | Evidence-on-request (STKE: JPDP "Keep Satisfied" — DPIA/PDPA evidence on request) |
| Residual HIGH risks | DPIA-005 (cross-border) — closed via MCRES/ADR-003 before go-live |
| Statutory precondition | DPO appointed + notified to JPDP; breach runbook live |

---

## 8. Sign-Off and Approval

### 8.1 DPIA Approval

| Role | Name | Decision | Date | Signature |
|------|------|----------|------|-----------|
| **Data Protection Officer (Vpnet, processor)** | [PENDING — to be appointed + notified to JPDP] | [PENDING] | [PENDING] | |
| **Data Controller (operator — U Mobile / TM)** | [PENDING — per engagement] | [PENDING] | [PENDING] | |
| **Senior Responsible Owner / CTO** | Roland Pfeifer | [PENDING] | [PENDING] | |

### 8.2 Conditions of Approval

1. Cross-border safeguard + DPA documented for Anthropic; in-region telemetry confirmed for SI (closes DPIA-005).
2. DPO appointed and notified to JPDP (controller + processor).
3. Notice & Choice, retention schedule + automated deletion, portability export, and PDPA breach runbook implemented.

**How Conditions Will Be Met**: See gating actions GA-1…GA-5, Section 16.2.

### 8.3 Final Decision

**Decision**: **PROCEED WITH CONDITIONS**

**Rationale**: Alpha processing (mock adapters, no live subscribers) is low-risk and may proceed. Live subscriber processing (SI / v3.0.0) is gated on closing the cross-border safeguard and the PDPA instrument gaps. The architectural privacy posture (masking fail-closed, encryption, least-privilege agent identity, PII-free telemetry) is strong.

**Effective Date**: Alpha — effective on DPO/SRO sign-off. Live subscriber data — effective only when all Section 8.2 conditions are met.

---

## 9. Integration with Information Security Management

### 9.1 Link to Security Controls

**Security baseline reference**: `ARC-001-REQ-v1.0` NFR-SEC-001…006; `ARC-000-PRIN-v1.0` Principle 4 (Security by Design, zero-trust). A dedicated Secure-by-Design artefact (`SBD`/`SECD`) is **not yet present** for Project 001; security controls below are drawn from the requirements baseline and RISK register.

**DPIA Mitigations → Security Controls Mapping**:

| DPIA Mitigation | Security Control (REQ) | Principle | Implementation Status |
|-----------------|------------------------|-----------|-----------------------|
| Encryption at rest / in transit | NFR-SEC-003 (TLS 1.3, mTLS, at-rest crypto) | PRIN P4 | Designed; pen-test pending (NFR-SEC-005) |
| Access controls (JWT/RBAC/MFA) | NFR-SEC-001/002; FR-006 | PRIN P4 | Implemented (Keycloak) |
| PII masking (fail-closed) | FR-009 | PRIN P4 / NFR-C-001 | Implemented (middleware) |
| Least-privilege agent identity | FR-007; RISK R-008 | PRIN P4 | Implemented (commit a9da9d4); regression-guarding pending |
| Audit logging | NFR-C-002 | PRIN P5 | Designed |
| PII-free telemetry | FR-011; INT-004 | PRIN P5 | Designed; CI assertion pending (RISK R-004) |

### 9.2 Link to Risk Register

**Risk Register reference**: `ARC-001-RISK-v1.0`.

**DPIA Risks ↔ Risk Register mapping** (DPIA risks focus on harm to **data subjects**; register risks focus on the **organisation** — bidirectional link):

| DPIA Risk ID | Risk Register ID | Category | Owner | Treatment |
|--------------|------------------|----------|-------|-----------|
| DPIA-001/002/003/007 | R-004 (Subscriber PII breach under PDPA) | Compliance / Data Protection | Security/Compliance | Treat |
| DPIA-005 | R-010 (cross-border placement drift) | Compliance / Data Protection | Security Lead | Treat |
| DPIA-006 | R-001 (unsafe autonomous change) | Operational | Lead Architect / Security | Treat |
| DPIA-002 | R-009 (Claude/LangSmith dependency; telemetry egress) | Operational | Engineering | Treat |
| DPIA-004/009/010 | (new — to add as Data Protection entries) | Compliance / Data Protection | Security/Compliance | Treat |

---

## 10. Review and Monitoring

### 10.1 Review Triggers

DPIA must be reviewed when:

- [x] Significant change to processing (live CAMARA integration at v3.0.0; new operator; new data category)
- [x] New technology introduced (model change, new agent capability, federation at v4.0.0)
- [x] New risks identified (new egress path, telemetry backend change)
- [x] Data breach or security incident occurs
- [x] JPDP / PDPA guidance changes (e.g. updated cross-border guideline)
- [x] Periodic review date reached

**Periodic Review Frequency**: **12 months** (aligned with `ARC-001-PDPA-v1.0` quarterly PDPA review for the binding instrument).

### 10.2 Review Schedule

| Review Type | Frequency | Next Review Date | Responsibility |
|-------------|-----------|------------------|----------------|
| **Periodic review** | 12 months | 2027-06-05 | DPO (once appointed) |
| **Pre-go-live review** | Before v3.0.0 | At SI engagement | Security/Compliance + DPO |
| **Post-implementation review** | 3 months after first go-live | At go-live + 3 months | Enterprise Architect |

### 10.3 Monitoring Activities

- [x] Track PII-in-log/telemetry incidents (target 0)
- [x] Monitor audit logs for unauthorised access attempts
- [x] Verify 100% of autonomous actions run under the agent-role identity
- [x] Track operator-relayed access/correction/portability requests and response times
- [x] Track compliance with the DS-009 retention schedule
- [x] Track data breaches / near-misses against the PDPA 72h/7-day timelines

**Monitoring Metrics**:

| Metric | Target | Measurement Frequency | Responsibility |
|--------|--------|----------------------|----------------|
| PII-in-log/telemetry incidents | 0 | Continuous | Security Team |
| Agent actions under agent-role identity | 100% | Continuous (audit/telemetry) | Security Team |
| Residency-conformant data stores | 100% | Per release / per engagement | Security Lead |
| Data-subject request response time (operator-relayed) | Per DPA SLA | Monthly | DPO |

### 10.4 Change Management

1. Any change to processing is assessed for DPIA impact.
2. Significant change (new data, new purpose, new egress, live CAMARA) triggers a DPIA update.
3. Updated DPIA re-approved by DPO + operator Data Controller.
4. Data subjects notified of significant changes via the operator (controller).

**Change Log**:

| Change Date | Change Description | DPIA Impact | Updated Sections | Approved By |
|-------------|-------------------|-------------|------------------|-------------|
| 2026-06-05 | Initial DPIA (alpha; mock adapters) | New | All | [PENDING] |

---

## 11. Traceability to ArcKit Artifacts

### 11.1 Source Artifacts

| Artifact | Location | Information Extracted |
|----------|----------|----------------------|
| **PDPA Compliance Assessment** | `projects/001-ibn-core-my/ARC-001-PDPA-v1.0.md` | Binding instrument (PDPA 2010 am. 2024); DS-009 scope; cross-border findings; DPO/Notice/portability/breach gaps; R-PDPA risk set |
| **Requirements** | `projects/001-ibn-core-my/ARC-001-REQ-v1.0.md` | Data entities; processing purposes; FR-009 masking; NFR-C-001; NFR-SEC-*; INT-002/004 |
| **Stakeholder Analysis** | `projects/001-ibn-core-my/ARC-001-STKE-v1.0.md` | Data-subject categories (SD-6); JPDP/Security drivers; RACI for data-protection decisions; goals G-3/G-5 |
| **Risk Register** | `projects/001-ibn-core-my/ARC-001-RISK-v1.0.md` | R-004 (PDPA breach), R-010 (cross-border), R-001 (autonomy), R-008 (agent identity), R-009 (Claude/LangSmith) |
| **Data Classification** | `projects/001-ibn-core-my/ARC-001-MYCLAS-v1.0.md` (referenced) | DS-009 RESTRICTED subscriber PII |
| **Architecture Principles** | `projects/000-global/ARC-000-PRIN-v1.0.md` (referenced) | Privacy/Security by Design (P4), Observability (P5) |

> **Data Model note**: No standalone `ARC-001-DATA-v*.md` exists. The data-entity inventory (E-001 Intent, E-002 IntentReport, E-003 Telemetry) was sourced from the **Data Requirements** section of `ARC-001-REQ-v1.0` and the DS-009 classification in `ARC-001-MYCLAS-v1.0`. Recommend producing a dedicated data model via `/arckit:data-model` to deepen PII traceability.

### 11.2 Traceability Matrix: Data → Requirements → DPIA

| Data Entity | PII Level | Requirement | Processing Purpose | DPIA Risk(s) | Lawful Basis (PDPA) |
|-------------|-----------|-------------|--------------------|--------------|---------------------|
| E-001: Intent (`customerId`, expression) | HIGH (DS-009 RESTRICTED) | FR-001/002/005/009 | Translate + fulfil subscriber intent (O2C) | DPIA-001/003/005/006/007 | Consent (operator) + service necessity |
| E-002: IntentReport | MEDIUM | FR-008 | Compliance assessment / reporting | DPIA-001/008 | Consent (operator) + service necessity |
| E-003: Telemetry event | LOW (PII-free) | FR-011 | System/agent observability | DPIA-002 | N/A (PII-free by design) |

### 11.3 Traceability Matrix: Stakeholder → Data Subject → Rights

| Stakeholder | Data Subject Type | Volume | Rights Processes | Vulnerability Safeguards |
|-------------|-------------------|--------|------------------|--------------------------|
| Operator (controller) | Operator subscribers (SD-6) | National telco base (SI) | Access/correction (operator-mediated); withdrawal + portability **to implement** | Operator notice to account for vulnerable subscribers |

### 11.4 Downstream Artifacts Informed by DPIA

| Artifact | How DPIA Informs It |
|----------|---------------------|
| **Risk Register** (`ARC-001-RISK-v1.0`) | Add DPIA-004/009/010 as Data Protection risks; back-link DPIA-005↔R-010, DPIA-001/002/003/007↔R-004 |
| **Cross-border / Cloud-first** (`ARC-001-MCRES`, `ADR-003`) | DPIA-005 cross-border safeguard requirement |
| **Secure by Design** (to produce) | DPIA mitigations become security control requirements |
| **NCII / Cyber-security** (`/arckit:my-cyber-security`) | Breach-coordination path for telecom CII |

---

## 12. Data Subject Rights Implementation (PDPA — read across from UK GDPR rights)

### 12.1 Rights Checklist

**Right of Access** (PDPA s.30 — read across from UK GDPR Art. 15):

- [x] Process implemented: **Partial** — operator-mediated via TMF921 `GET /api/v1/intent/{id}` to the operator, not directly to the subscriber. Define a data-subject access SLA in the DPA.

**Right to Correction / Rectification** (PDPA s.34 — Art. 16):

- [x] Process implemented: **Partial** — subscriber accuracy sourced from operator systems; correction propagation to retained intent records to be defined.

**Right to Erasure / Deletion** (Art. 17 equivalent via retention):

- [x] Process implemented: **Partial** — via operator-policy retention + automated deletion (to be implemented, DPIA-004); no direct subscriber channel.

**Right to Restriction** (Art. 18 equivalent):

- [ ] Not separately implemented; operator-mediated.

**Right to Data Portability** (new PDPA 2024 right — Art. 20 equivalent):

- [ ] Applicable: YES (new 2024 right) — **NOT implemented (gap, DPIA-010)**. Provide structured export (JSON/CSV) of a subscriber's retained intent records on operator-relayed request.

**Right to Withdraw Consent / Object** (PDPA General Principle — Art. 21 equivalent):

- [ ] **NOT implemented (gap, DPIA-009)** — no consent-withdrawal hook in ibn-core; honour withdrawal in retention/deletion once a lawful-basis reference is recorded.

**Rights Related to Automated Decision-Making** (Art. 22 equivalent):

- [x] Applicable: partial automated orchestration (FR-003). Safeguards: HITL on high-impact actions; attributable agent identity; ability for the operator to cancel/delete an intent (`DELETE /api/v1/intent/{id}`, UC-3).

### 12.2 Rights Fulfilment Procedures

As a **processor**, Vpnet/ibn-core fulfils rights requests **relayed by the operator (controller)**: (1) operator receives and verifies the subscriber; (2) operator relays to Vpnet with a reference; (3) Vpnet retrieves/exports/deletes the relevant intent records; (4) response within the DPA-agreed SLA; (5) DPO oversight on complex requests. Direct subscriber channels are the controller's responsibility.

---

## 13. International Data Transfers

**Applicable**: **YES**

### 13.1 Transfer Details

| Recipient | Country | Data Transferred | Purpose | Volume | Adequacy / Safeguard |
|-----------|---------|------------------|---------|--------|----------------------|
| Anthropic (Claude API, INT-002) | Provider-hosted, **likely outside Malaysia** | Masked natural-language intent text + prompt/context (PII masked, FR-009) | AI translation of intent | Per intent submission | **Open** — risk-based assessment (PDP Guideline 03/2025) + DPA required (DPIA-005) |
| LangSmith (default telemetry, INT-004) | Provider-hosted, likely outside Malaysia | Traces/spans — **no unmasked PII by design** | Observability | Per trace (async) | **Mitigated** — prefer in-region Canvas collector for SI; confirm PII-free spans |
| Operator orchestration (INT-001) | Malaysia (operator environment) | Orchestration / network config — **not subscriber personal data** | Fulfilment | Per intent | In-jurisdiction — not a personal-data cross-border concern |

### 13.2 Transfer Safeguards

> Malaysia's PDPA (am. 2024) uses a **risk-based cross-border transfer regime under PDP Guideline 03/2025** (which replaced the former whitelist) — **not** UK ICO SCCs/IDTA/BCRs. Read the template's "SCCs/BCRs" across to the PDPA risk-based safeguard.

**For the Anthropic transfer (no Malaysian adequacy presumption)**:

- [x] **Risk-based assessment (PDP Guideline 03/2025)** — assess that masked-but-potentially-re-identifiable intent text crossing to Anthropic is supported by a documented legal basis and safeguard.
- [x] **Data Processing Agreement / contractual safeguard** with Anthropic — to be executed.
- [x] **Masking before transfer** (FR-009) — reduces personal-data content at source.
- Hand-off: `/arckit:my-cloud-first` (`MCRES`) and `ADR-003`.

**For the telemetry transfer**:

- [x] **In-region Canvas collector** preferred for SI to avoid cross-border personal-data transfer; LangSmith opt-in gated on PDPA/DPIA sign-off (ADR-003; RISK R-010).

### 13.3 Transfer Risk Assessment

- Foreign government access to data: residual — mitigated by masking (minimal personal-data content) and DPA.
- Different legal protections: addressed via the risk-based safeguard + contractual terms.
- Enforcement challenges: addressed via DPA and on-shore telemetry preference.

**Additional safeguards**: prefer on-shore telemetry; confirm no unmasked PII in spans; document the cross-border legal basis before live data.

---

## 14. Children's Data

**Processing Children's Data**: **NO**

No children are identified as a data-subject category in `ARC-001-STKE-v1.0` (the data subjects are operator B2B/consumer subscribers). The processing involves no age-gated service and no profiling. **Section not applicable.** Should an operator engagement bring a consumer base that may include minors, the operator (controller) is responsible for age-appropriate Notice & Choice; a DPIA review trigger (Section 10.1) would apply.

---

## 15. Algorithmic / AI Processing

**Algorithmic Processing**: **YES** — recommend completing `/arckit:ai-playbook` and `/arckit:atrs` for the AI-native components (consistent with `ARC-001-REQ-v1.0` Document Purpose, which flags DPIA + AI Playbook + ATRS as downstream AI-governance artefacts).

### 15.1 Algorithm Description

**Algorithm Type**:

- [x] Natural language processing — LLM-based intent translation (Anthropic Claude, INT-002).
- [x] Other — autonomous agent runtime orchestrating fulfilment via MCP (FR-003).

**Processing Type**:

- [x] Classification / translation — natural-language intent → structured TMF921 Intent.
- [x] Automated decision-making — autonomous orchestration on low/medium-impact paths.
- [ ] Profiling / prediction / recommendation — **NO** (no evaluation of the data subject).

**Human Oversight**:

- [x] Human-in-the-loop on high-impact (network-mutating) actions (RISK R-001).
- [x] Human-on-the-loop via full telemetry, audit attribution, and intent cancel/delete (UC-3, UC-4).

### 15.2 Algorithmic Bias Assessment

**Protected characteristics**: **N/A** — the system performs no profiling, scoring, or decision **about the individual**; it translates a service intent and orchestrates fulfilment. There is no demographic decision surface, so demographic-parity/fairness-metric testing does not apply. The relevant AI risks are **accuracy** (R-013 — invalid/incorrect TMF921 Intent) and **safe autonomy** (R-001), addressed via schema validation, a curated evaluation set, HITL, and reversibility — not bias testing.

### 15.3 Explainability and Transparency

**Explainability Level**:

- [x] Limited-to-full — every autonomous action emits GenAI semantic-convention spans, `rfc9315.phase` tags, tool-invocation detail, and the acting identity (FR-011), giving an attributable, phase-tagged trace (UC-4). Agent behaviour is "a measurable signal, not a black box" (PRIN P5).

**Explanation Mechanism**: Auditors/operators query telemetry by correlation/intent ID for the reasoning + tool-call trace (UC-4).

**ATRS Compliance**: No ATRS record yet — recommend `/arckit:atrs` to formalise the algorithmic transparency record.

---

## 16. Summary and Conclusion

### 16.1 Key Findings

**Processing Summary**:

- Processing **1 category** of personal data (subscriber PII — DS-009 RESTRICTED) across 2 fields (`customerId`, intent text).
- Processing **0** special-category data types (by design).
- Affecting operator subscribers (national telco scale at SI; zero live in alpha).
- For the purpose of: O2C intent translation + autonomous fulfilment.
- Lawful basis (PDPA): consent (operator-held) + service necessity.

**Risk Summary**:

- **10** risks to data subjects identified.
- **5** HIGH risks before mitigation (DPIA-001/002/003/005; plus High-severity others).
- **6** MEDIUM + **3** LOW residual after mitigation.
- **1** residual-HIGH after mitigation (DPIA-005, cross-border) — **conditional / go-live-gating**.
- Overall residual risk: **MEDIUM**.

**Compliance Summary** (PDPA):

- [x] Necessity and proportionality demonstrated
- [x] Lawful basis identified (consent + service necessity; operator-held)
- [ ] Data subjects consulted — operator-mediated (processor cannot consult directly)
- [ ] DPO consulted — **gap (no DPO yet)**
- [x] Risks identified and mitigated
- [ ] Data-subject rights processes complete — access/correction partial; portability + withdrawal **to implement**
- [x] Security measures implemented (masking, encryption, JWT, agent identity)
- [x] Review schedule established (12 months)

### 16.2 Recommendations and Gating Actions

| ID | Action | Risk(s) | Responsibility | Due | Status |
|----|--------|---------|----------------|-----|--------|
| GA-1 | Appoint + notify DPO to JPDP (Vpnet processor + operator controller) | DPIA-005 precondition; R-PDPA-01 | CTO + Operator Compliance | Before v3.0.0 | Not Started |
| GA-2 | Document PDPA risk-based cross-border safeguard + DPA (Anthropic); confirm in-region telemetry | DPIA-005; R-010 | Security Lead (via MCRES/ADR-003) | Before v3.0.0 | In Progress |
| GA-3 | Operator bilingual Notice & Choice + record lawful-basis/consent reference; consent-withdrawal honoured | DPIA-009; R-PDPA-05 | Operator Compliance + Engineering | Before v3.0.0 | Not Started |
| GA-4 | DS-009 retention schedule + automated deletion; data-portability export | DPIA-004, DPIA-010 | SI Delivery + Engineering | Before v3.0.0 | Not Started |
| GA-5 | PDPA breach-notification runbook (72h JPDP / 7-day subject); assert PII-free telemetry in CI; pen-test | DPIA-002/007; R-004/R-005 | Security Lead | Before v3.0.0 | In Progress |

### 16.3 Final Conclusion

**Conclusion**: **PROCEED WITH CONDITIONS**

**Rationale**: ibn-core's privacy-by-design posture (fail-closed PII masking, encryption, least-privilege agent identity, PII-free telemetry, data minimisation to two fields) makes the processing proportionate and the residual risk MEDIUM overall. Alpha processing with mock adapters and no live subscribers may proceed. **Live subscriber processing (SI / v3.0.0) is gated** on the conditions below.

**Conditions**:

- GA-1…GA-5 (Section 16.2) closed and evidenced.
- DPIA-005 (cross-border) reduced from HIGH to MEDIUM via documented safeguard + DPA.
- DPO + operator Data Controller sign-off recorded in Section 8.

**Sign-Off**: This DPIA is complete in DRAFT and ready for DPO + operator Data Controller review. Live processing may commence only when the Section 16.2 conditions are met.

---

## External References

> Traceability from generated content back to source documents. Binding instrument: PDPA 2010 (am. 2024), administered by JPDP — not UK GDPR/ICO.

### Document Register

| Doc ID | Filename | Type | Source Location | Description |
|--------|----------|------|-----------------|-------------|
| ARC-001-PDPA | ARC-001-PDPA-v1.0.md | PDPA Compliance Assessment | projects/001-ibn-core-my/ | Binding-instrument basis; DS-009 scope; cross-border + gap findings |
| ARC-001-REQ | ARC-001-REQ-v1.0.md | Requirements | projects/001-ibn-core-my/ | Data entities; FR-009; NFR-C-001; NFR-SEC-*; INT-002/004 |
| ARC-001-STKE | ARC-001-STKE-v1.0.md | Stakeholder Analysis | projects/001-ibn-core-my/ | Data subjects (SD-6); JPDP driver; RACI; G-3/G-5 |
| ARC-001-RISK | ARC-001-RISK-v1.0.md | Risk Register | projects/001-ibn-core-my/ | R-004, R-010, R-001, R-008, R-009 |
| ARC-001-MYCLAS | ARC-001-MYCLAS-v1.0.md | Classification Register | projects/001-ibn-core-my/ | DS-009 RESTRICTED subscriber PII |
| MY-PDPA | — | Statute | <https://www.pdp.gov.my/> | PDPA 2010 [Act 709] + Amendment Act 2024 (JPDP) |
| MY-PDP-GL0325 | — | Guideline | <https://www.pdp.gov.my/> | PDP Guideline 03/2025 — risk-based cross-border regime |

### Citations

| Citation ID | Doc ID | Section | Used in |
|-------------|--------|---------|---------|
| [PDPA-A1] | ARC-001-PDPA | DS-009 scope; cross-border; gap findings | Executive Summary; Sections 1, 5, 6, 13 |
| [PDPA-A2] | ARC-001-PDPA | R-PDPA-01…07; DPO; breach readiness | Sections 3, 7, 16 |
| [REQ-A1] | ARC-001-REQ | Data Entities; FR-009; NFR-C-001; INT-002/004 | Sections 2, 4, 6 |
| [STKE-A1] | ARC-001-STKE | SD-6; SD-11 (JPDP); RACI; G-3/G-5 | Sections 2, 3, 5 |
| [RISK-A1] | ARC-001-RISK | R-004, R-010, R-001, R-008, R-009 | Sections 5, 9 |
| [CLAS-A1] | ARC-001-MYCLAS | DS-009 RESTRICTED | Sections 1, 2 |

### Unreferenced Documents

| Filename | Source Location | Reason |
|----------|-----------------|--------|
| ARC-001-MYDIG-v1.0.md, ARC-001-HLDR-v1.0.md, ARC-001-MCRES-v1.0.md | projects/001-ibn-core-my/ | Adjacent artefacts; MCRES referenced as the cross-border hand-off owner but not re-derived here |

---

## Generation Metadata

**Generated by**: ArcKit `/arckit:dpia` command (arckit-build wave 7)
**Generated on**: 2026-06-05
**ArcKit Version**: 5.11.0
**Project**: ibn-core-my (Project 001)
**Model**: Claude Opus 4.8 (1M context)

**Traceability**: Traceable to `ARC-001-PDPA`, `ARC-001-REQ`, `ARC-001-STKE`, `ARC-001-RISK`, and `ARC-001-MYCLAS`. Applies the UK GDPR Article 35 / ICO 9-criteria **structure**; the **binding instrument is Malaysia's PDPA 2010 (am. 2024), regulator JPDP**.

---

## Appendix A: ICO 9-Criteria Screening Checklist (applied to PDPA context)

1. ☐ Evaluation or scoring (NO — no profiling of the data subject)
2. ☑ Automated decision-making with significant effect (YES — autonomous orchestration; HITL on high-impact)
3. ☐ Systematic monitoring (NO)
4. ☐ Sensitive data (NO — DS-009 RESTRICTED, not special-category)
5. ☑ Large scale (YES — national telco subscriber base)
6. ☑ Matching/combining datasets (YES — multi-party: operator + Anthropic + telemetry)
7. ☐ Vulnerable data subjects (NO)
8. ☑ Innovative technology (YES — LLM + autonomous agents)
9. ☑ Prevents exercising rights (YES — no portability/withdrawal; access operator-mediated)

**Score: 4/9 → DPIA REQUIRED.**

---

## Appendix B: UK GDPR Article 35 Requirements Checklist (structure applied; PDPA is binding)

| Article 35 Requirement | Addressed in Section | Complete? |
|------------------------|---------------------|-----------|
| Systematic description of processing | Section 2 | ✓ |
| Purposes of processing | Section 2.4 | ✓ |
| Assessment of necessity and proportionality | Section 4 | ✓ |
| Assessment of risks to data subjects | Section 5 | ✓ |
| Measures to address risks | Section 6 | ✓ |
| Safeguards, security measures | Sections 6, 9 | ✓ |
| Demonstrate compliance (with PDPA, not UK GDPR) | Throughout | ✓ |

---

## Appendix C: PDPA Seven Data Protection Principles — Compliance Snapshot

> Read across from the UK GDPR Article 5 principles; the binding set is the **PDPA Seven Data Protection Principles** (per `ARC-001-PDPA-v1.0`).

| PDPA Principle | Assessment | Evidence |
|----------------|------------|----------|
| **General** (consent / lawful basis; purpose limitation) | PARTIAL | Operator-held consent; purpose limited to O2C; processing record to be documented (Section 4.1) |
| **Notice & Choice** (bilingual notice) | NON-COMPLIANT (gap) | No subscriber-facing notice in ibn-core (DPIA-009; GA-3) |
| **Disclosure** (no undisclosed third-party disclosure) | PARTIAL | Anthropic (masked) + operator orchestration; AI recipient to be disclosed in notice (Section 13) |
| **Security** (practical protection steps) | COMPLIANT (architecturally) | Masking fail-closed, encryption, JWT, agent identity (Section 6.1); pen-test pending |
| **Retention** (no longer than necessary) | PARTIAL | NFR-C-001 mandates deletion; concrete DS-009 schedule pending (DPIA-004; GA-4) |
| **Data Integrity** (accurate, up to date) | PARTIAL | Operator source-of-truth; correction propagation to define (Section 12) |
| **Access** (access + correction) | PARTIAL | Operator-mediated via TMF921 API; SLA to define (Section 12) |

---

## Appendix D: Glossary

| Term | Definition |
|------|------------|
| **PDPA 2010 (am. 2024)** | Malaysia Personal Data Protection Act 2010 [Act 709], as amended by the Personal Data Protection (Amendment) Act 2024 — the binding instrument for this DPIA. |
| **JPDP** | Jabatan Perlindungan Data Peribadi (Personal Data Protection Department) — Malaysia's data-protection supervisory authority (not the UK ICO). |
| **DS-009** | The RESTRICTED-tier subscriber personal-data dataset (`customerId` + intent text) per `ARC-001-MYCLAS-v1.0`. |
| **Data Controller** | The operator (U Mobile / TM) that determines the purposes/means of processing its subscribers' data. |
| **Data Processor** | Vpnet/ibn-core, processing personal data on the operator's instruction. |
| **PII masking (FR-009)** | Fail-closed middleware masking subscriber PII before AI/downstream processing; masking failure blocks processing. |
| **PDP Guideline 03/2025** | The PDPA risk-based cross-border transfer regime (replaced the former whitelist). |
| **O2C** | Order-to-Cash — the canonical natural-language-intent-to-fulfilment use case. |
| **DPO** | Data Protection Officer — mandatory from 1 June 2025 for controllers and processors under the 2024 amendment. |
| **HITL** | Human-in-the-loop — human gating of high-impact autonomous actions. |
| **UK GDPR / ICO** | Referenced only for the DPIA **structure**; not the binding instrument here. |

---

**END OF DPIA**

<!-- arckit-provenance:start -->

## Build Provenance

_Stamped automatically by the ArcKit plugin's `provenance-stamp.mjs` PostToolUse hook. Complements (does not replace) the human-authored footer above. Carries only fields the model can't authoritatively self-report: build context from `.arckit/state.json` and effort levels derived from command frontmatter + the silent-downgrade matrix._

| Field | Value |
|-------|-------|
| Requested Effort | `high` |
| Effective Effort | _unknown — model not parsed from existing footer_ |
| Stamped at | 2026-06-21T12:17:59.258Z |

<!-- arckit-provenance:end -->
