# PDPA 2010 (am. 2024) Compliance Assessment

> **Template Origin**: Community | **ArcKit Version**: 5.11.0 | **Command**: `/arckit:my-pdpa`

> ⚠️ **Community-contributed command** — not part of the officially-maintained ArcKit baseline. Output must be reviewed by a qualified Malaysian data-protection practitioner and validated against the Personal Data Protection Department (Jabatan Perlindungan Data Peribadi, JPDP) before reliance. Citations to the PDPA and JPDP guidelines may lag the current statutory text — verify against the source at <https://www.pdp.gov.my/>.

> **Commercial-applicability note**: ibn-core is delivered **commercially** by Vpnet Cloud Solutions Sdn. Bhd. as an open-core IBN framework with private operator CAMARA adapters for Malaysian telecommunications operators (U Mobile, TM Malaysia). The PDPA 2010 s.3 exemption for Federal and State Government does **NOT** apply: ibn-core and its operator deployers are **commercial data users (data controllers/processors)** processing subscriber personal data during intent fulfilment, so the PDPA 2010 (as amended by the Personal Data Protection (Amendment) Act 2024) **applies in full**. This is consistent with `ARC-001-MYCLAS-v1.0` (commercial-tier reframing; Arahan Keselamatan cited for comparison only) and `ARC-001-REQ-v1.0` NFR-C-001.

## Document Control

| Field | Value |
|-------|-------|
| **Document ID** | ARC-001-PDPA-v1.0 |
| **Document Type** | PDPA 2010 (am. 2024) Compliance Assessment |
| **Project** | ibn-core-my (Project 001) |
| **Classification** | PUBLIC |
| **Status** | DRAFT |
| **Version** | 1.0 |
| **Created Date** | 2026-06-05 |
| **Last Modified** | 2026-06-05 |
| **Review Cycle** | Quarterly |
| **Next Review Date** | 2026-09-05 |
| **Owner** | Roland Pfeifer, Lead Architect / CTO (Vpnet Cloud Solutions Sdn. Bhd.) |
| **Reviewed By** | [PENDING] |
| **Approved By** | [PENDING] |
| **Distribution** | ibn-core engineering, Vpnet SI delivery teams, operator integration partners (U Mobile, TM Malaysia), operator Compliance Officers |

> **Subject type note**: This assessment uses the **Generic / commercial** document-control header per `_partials/RENDERING.md` — ibn-core's `governance_framework` is not `Malaysia Federal` and its `classification_scheme` is not `Arahan Keselamatan`, so the Malaysia Federal doc-control block is omitted. This is consistent with `ARC-001-MYCLAS-v1.0` and `ARC-001-MYDIG-v1.0`. Personal data is nonetheless governed by the **PDPA 2010 (am. 2024)**, which binds commercial data users regardless of classification scheme.

## Revision History

| Version | Date | Author | Changes | Approved By | Approval Date |
|---------|------|--------|---------|-------------|---------------|
| 1.0 | 2026-06-05 | ArcKit AI | Initial creation from `/arckit:my-pdpa` (executed via arckit-build wave 4); commercial-applicability confirmed; inherits RESTRICTED-tier personal-data scope (DS-009) from `ARC-001-MYCLAS-v1.0` | [PENDING] | [PENDING] |

---

## Scope and Method

| Parameter | Value | Source |
|-----------|-------|--------|
| Scope | Full system | `ARC-001-REQ-v1.0` (full-system scope, alpha phase) |
| Phase | Alpha | `ARC-001-REQ-v1.0` Document Purpose |
| Overall risk posture | Medium | Pre-production, mock adapters in alpha; live subscriber PII enters at SI/v3.0.0 |
| Classification | PUBLIC (document) | Inherited from `ARC-000-PRIN`, `ARC-001-REQ`, `ARC-001-MYCLAS` |
| Personal-data dataset in scope | DS-009 (subscriber PII) — RESTRICTED tier | `ARC-001-MYCLAS-v1.0` Dataset Register |

This assessment maps the seven PDPA Data Protection Principles, the Personal Data Protection (Amendment) Act 2024 obligations (DPO, breach notification, data portability, risk-based cross-border regime, raised penalties), the data-subject rights, and the RESTRICTED-tier personal-data class onto ibn-core's architecture and requirements baseline. It is a design-time architectural assessment, not a legal opinion.

## Executive Summary

ibn-core is a **commercial** open-core RFC 9315 Intent-Based Networking framework delivered by Vpnet Cloud Solutions Sdn. Bhd. to Malaysian telecommunications operators. The only category of **personal data** it processes is **subscriber personal data ingested on the Order-to-Cash (O2C) path** — the `customerId` (e.g. `CUST-12345`) and the raw natural-language intent string (e.g. "I need internet for working from home"), which may embed personal context. This corresponds to dataset **DS-009 (RESTRICTED)** in `ARC-001-MYCLAS-v1.0`. Because ibn-core is a commercial data user and **not** a Federal/State Government body, the **PDPA 2010 s.3 government exemption does not apply** and the Act — as amended by the **Personal Data Protection (Amendment) Act 2024** — applies in full. In a deployed SI engagement, the operator (U Mobile / TM) is the **data controller** for its subscribers and ibn-core/Vpnet acts as **data processor**; post-2024 both roles carry security and DPO obligations.

The architectural posture is **broadly aligned but not yet evidenced**. The PII-masking middleware (`src/middleware`, FR-009) enforces data minimisation by masking subscriber PII **before** AI/model invocation and downstream persistence, with masking failure failing **closed** — directly supporting the Security and General principles and Retention minimisation. Authentication (Keycloak JWT, FR-006), least-privilege agent-role identity (FR-007), encryption in transit/at rest (NFR-SEC-003), audit logging (NFR-C-002), and the open-core seam (BR-003, ensuring no subscriber PII or credentials leak to the public Apache 2.0 repo) provide the Security-principle backbone. However, several PDPA-specific instruments are **gaps at alpha**: no **DPO** has been appointed/notified to the Commissioner (mandatory from 1 June 2025 for controllers and processors); **Notice & Choice** (consent / privacy notice in Bahasa Malaysia and English) is operator-dependent and not yet evidenced; a **data-portability** mechanism (new 2024 right) is not implemented; and a **breach-notification runbook** meeting the 72-hour Commissioner / 7-day data-subject timelines is not yet in place (NFR-M-003 lists incident runbooks but not the PDPA breach workflow specifically).

**Cross-border transfer** is the principal residency exposure: the Anthropic Claude API (INT-002) is invoked for intent translation. Although PII is masked before invocation (FR-009), the **risk-based cross-border regime under PDP Guideline 03/2025** (which replaced the former whitelist) must be applied to confirm that masked-but-potentially-re-identifiable intent text crossing borders to the AI provider, plus telemetry export to LangSmith (INT-004), is supported by a documented legal basis and safeguard. This is handed off to `/arckit:my-cloud-first` (`MCRES`) and `ADR-003`, and a DPIA via `/arckit:dpia` is required for the AI processing of subscriber data (NFR-C-001 explicitly calls for it). Penalty exposure under the 2024 amendment rises to **RM1,000,000 and up to 3 years' imprisonment** for DP-principle breaches, raising the materiality of closing the DPO, notice, portability and breach-notification gaps before live subscriber data enters at v3.0.0.

## Seven Data Protection Principles

| Principle | Compliant? | Gap | Action | Owner |
|-----------|------------|-----|--------|-------|
| **General** (lawful processing; no processing without consent / lawful basis; purpose limitation) | Partial | Lawful basis / consent for processing subscriber intent is operator-dependent and not yet documented; purpose limited to intent fulfilment but not evidenced in a processing record. | Document the processing purpose (O2C intent fulfilment) and the lawful basis per operator engagement; record controller (operator) vs processor (Vpnet) roles in the SI contract / DPA. | Operator Compliance Officer; SI Delivery Lead |
| **Notice & Choice** (privacy notice in BM + English; inform of purpose, recipients, rights, obligatory/voluntary) | No (gap) | No subscriber-facing privacy notice or consent capture is part of ibn-core; ingestion (`POST /api/v1/intent`) assumes upstream consent. | Operator to provide bilingual notice & choice at point of collection; ibn-core to record a consent/lawful-basis reference field alongside `customerId`. | Operator Compliance Officer |
| **Disclosure** (no disclosure for purposes other than collected, or to undisclosed third parties, without consent) | Partial | Subscriber intent text is disclosed to the Anthropic Claude API (INT-002, masked) and orchestration data flows to operator systems (INT-001). Third-party AI disclosure not yet covered in notice. | Disclose the AI-processing recipient (Anthropic) and operator-orchestration recipients in the notice; rely on masking (FR-009) to minimise disclosed personal data. | Security Lead; Operator Compliance Officer |
| **Security** (practical steps against loss, misuse, unauthorised access, alteration, disclosure) | Strong (architecturally) | Controls designed but not yet pen-tested / evidenced at alpha; breach-response PDPA workflow absent. | Maintain PII masking (FR-009), Keycloak JWT (FR-006), agent-role least privilege (FR-007), TLS1.3/mTLS + at-rest encryption (NFR-SEC-003), secrets in vault (NFR-SEC-004); complete pen-test (NFR-SEC-005) pre-go-live. | Security Lead |
| **Retention** (do not keep longer than necessary; destroy when purpose fulfilled) | Partial | NFR-C-001 mandates automated deletion after retention + legal-hold, but no concrete retention schedule for DS-009 yet; unmasked PII deliberately not persisted (good). | Define and implement a subscriber-PII retention schedule and automated deletion; confirm no unmasked PII persists beyond the ingestion path. | SI Delivery Lead; Security Lead |
| **Data Integrity** (accurate, complete, not misleading, kept up to date) | Partial | `customerId` and intent text accuracy depend on operator source systems; ibn-core does not re-verify. | Rely on operator source-of-truth for subscriber accuracy; provide correction propagation hook where intent records are retained. | Operator Integration Architect |
| **Access** (data subject right of access and correction) | Partial | No subscriber-facing access/correction mechanism in ibn-core; reads served via TMF921 API to operator, not data subject. | Support operator-mediated access/correction requests against retained intent records; document SLA for data-subject requests. | Operator Compliance Officer; SI Delivery Lead |

## Personal Data Protection (Amendment) Act 2024 — Obligations

| 2024 amendment obligation | Status | Detail / action |
|---|---|---|
| **Mandatory DPO** (appoint and notify the Commissioner; applies to controllers **and** processors from 1 June 2025) | **Gap** | No DPO appointed/notified. Vpnet (as processor) and each operator (as controller) must each appoint and notify a DPO. Action: appoint DPO, notify JPDP, record contact in this document control before live subscriber data (v3.0.0). |
| **Breach notification to the Commissioner** (as soon as practicable / within 72 hours) | **Gap** | No PDPA-specific breach runbook. Action: add a PDPA breach-notification runbook to NFR-M-003 set; integrate with audit logging (NFR-C-002) and incident response. |
| **Breach notification to affected data subjects** (within 7 days where risk of significant harm) | **Gap** | Define data-subject notification workflow + harm-assessment trigger. Coordinate with operator (controller) who holds the subscriber relationship. |
| **Data portability right** (new data-subject right) | **Gap** | Not implemented. Action: provide structured export of a subscriber's retained intent records on operator-relayed request, subject to technical feasibility. |
| **Risk-based cross-border transfer regime** (PDP Guideline 03/2025 — replaced the whitelist) | **Partial / open** | Cross-border flows to Anthropic Claude (INT-002, masked) and LangSmith telemetry (INT-004). Apply the risk-based assessment; document safeguard/legal basis. Hand off to `/arckit:my-cloud-first` (`MCRES`) and `ADR-003`. |
| **Raised penalties** (up to RM1,000,000 fine and 3 years' imprisonment for DP-principle breaches) | **Awareness** | Materiality driver for closing DPO / notice / portability / breach gaps before go-live. |

## Data Protection Officer

| Item | Status |
|------|--------|
| DPO appointed | **N** — gap; mandatory from 1 June 2025 for both controller (operator) and processor (Vpnet) |
| Notified to Commissioner (JPDP) | **N** — gap |
| Name / role / contact | [PENDING — appoint Vpnet DPO and record operator DPO per engagement] |

## Data-Subject Rights

| Right | Supported? | Mechanism |
|-------|-----------|-----------|
| Access | Partial | Operator-mediated; intent records retrievable via TMF921 `GET /api/v1/intent/{id}` to the operator, not directly to the data subject. Define data-subject access SLA. |
| Correction | Partial | Subscriber accuracy sourced from operator systems (Data Integrity principle); correction propagation to retained records to be defined. |
| Withdraw consent | No (gap) | No consent-withdrawal mechanism in ibn-core; consent is captured upstream by the operator. Add a lawful-basis/consent reference and honour withdrawal in retention/deletion. |
| Data portability (new, 2024) | No (gap) | Not implemented. Provide structured export of a subscriber's retained intent data on operator-relayed request. |

## Cross-Border Transfers

| Transfer | Destination | Recipient | Adequacy / safeguard (risk-based, PDP Guideline 03/2025) | Decision |
|---|---|---|---|---|
| Masked natural-language intent text for AI translation (INT-002) | Anthropic Claude API (provider-hosted, likely outside Malaysia) | Anthropic | PII masked before invocation (FR-009) reduces personal-data content; residual re-identification risk requires risk-based assessment + documented safeguard (DPA / contractual). | **Open** — assess via `MCRES` / `ADR-003`; require DPIA (`/arckit:dpia`) |
| Telemetry export (traces/spans, no unmasked PII by design) (INT-004) | LangSmith (default OTLP backend) or operator-local Canvas collector | LangSmith / Canvas | Spans must carry no unmasked subscriber PII (FR-009); prefer in-jurisdiction Canvas collector for operator deployments to avoid cross-border personal-data transfer. | **Mitigated** — recommend Canvas collector on-shore for SI; confirm no PII in spans |
| Operator orchestration / network config (INT-001) | Operator environment (Malaysia) | Operator | CONFIDENTIAL operator data, not subscriber personal data; mTLS/signed tokens; resides in operator environment. | In-jurisdiction — not a personal-data cross-border concern |

> Cross-border findings constrain cloud placement and are handed off to `/arckit:my-cloud-first` (`MCRES`) and `ADR-003`, consistent with the `ARC-001-MYCLAS-v1.0` hand-off register.

## Breach Notification Readiness

- **Commissioner (JPDP) notification target**: as soon as practicable / **within 72 hours** of becoming aware. **Current state: gap** — no PDPA-specific breach runbook; audit logging (NFR-C-002) provides the evidence substrate but no notification workflow.
- **Affected-individual notification**: **within 7 days** where there is risk of significant harm. **Current state: gap** — define harm-assessment trigger and operator-coordinated data-subject notification.
- **NCII coordination**: where a breach is also a cyber incident affecting Critical Information Infrastructure (telecommunications sector), coordinate with the NACSA reporting timeline via `/arckit:my-cyber-security` (`NCII`).
- **Penalty exposure**: up to **RM1,000,000 fine** and **up to 3 years' imprisonment** for DP-principle breaches (raised by the 2024 amendment).
- **Action**: add a PDPA breach-notification runbook to the NFR-M-003 runbook set before live subscriber data (v3.0.0); define controller (operator) vs processor (Vpnet) notification responsibilities in the DPA.

## Risk Register

| Risk | Likelihood | Impact | Treatment | Residual |
|------|-----------|--------|-----------|----------|
| R-PDPA-01: No DPO appointed/notified (mandatory from 1 Jun 2025) | High | High | Appoint + notify DPO for Vpnet (processor) and each operator (controller) before go-live | Low (once actioned) |
| R-PDPA-02: No PDPA breach-notification runbook (72h / 7-day) | Medium | High | Build runbook into NFR-M-003; tie to audit log (NFR-C-002) and NACSA NCII path | Low–Medium |
| R-PDPA-03: Cross-border transfer of (masked) intent to Anthropic without documented risk-based safeguard | Medium | High | Risk-based assessment (Guideline 03/2025) + DPA; on-shore Canvas collector for telemetry; DPIA | Medium until `MCRES`/`ADR-003`/DPIA closed |
| R-PDPA-04: No data-portability mechanism (new 2024 right) | Medium | Medium | Implement structured subscriber-data export on operator-relayed request | Medium |
| R-PDPA-05: No subscriber-facing Notice & Choice / consent-withdrawal | Medium | Medium | Operator-provided bilingual notice; record lawful-basis reference; honour withdrawal in deletion | Low–Medium |
| R-PDPA-06: Undefined retention schedule for DS-009 | Low–Medium | Medium | Define + automate retention/deletion (NFR-C-001); legal-hold capability | Low |
| R-PDPA-07: Re-identification of "masked" intent text leaking residual PII to AI/telemetry | Low | High | Validate masking coverage (FR-009 fail-closed); no unmasked PII in spans; pen-test (NFR-SEC-005) | Low |

> These risks are fed into the core `/arckit:risk` register for the project.

## Cross-Reference & Hand-offs

| Concern | Owning artefact / command | Status |
|---|---|---|
| Privacy impact assessment for AI processing of subscriber data | `/arckit:dpia` (`DPIA`) | Pending (required by NFR-C-001) |
| Cross-border placement & MCMC/residency reasoning | `/arckit:my-cloud-first` (`MCRES`), `ADR-001`, `ADR-003` | Pending |
| Personal-data dataset classification (DS-009, RESTRICTED) | `ARC-001-MYCLAS-v1.0` | Complete |
| NACSA NCII (telecommunications) breach coordination | `/arckit:my-cyber-security` (`NCII`) | Pending |
| Requirements baseline (NFR-C-001, FR-009, INT-002/004) | `ARC-001-REQ-v1.0` | Complete |
| Architecture principles (security by design, open-core seam) | `ARC-000-PRIN-v1.0` | Complete (referenced) |

## External References

### Document Register

| Doc ID | Title | URL | Verified date |
|--------|-------|-----|---------------|
| MY-PDPA | Personal Data Protection Act 2010 [Act 709] & Personal Data Protection (Amendment) Act 2024 (administered by JPDP) | <https://www.pdp.gov.my/> | 2026-06-05 |
| MY-PDP-GL0325 | PDP Guideline 03/2025 — risk-based cross-border transfer regime (replaced the whitelist) | <https://www.pdp.gov.my/> | 2026-06-05 |
| ARC-000-PRIN | ibn-core Enterprise Architecture Principles v1.0 | projects/000-global/ARC-000-PRIN-v1.0.md | 2026-06-05 |
| ARC-001-REQ | ibn-core-my Business and Technical Requirements v1.0 | projects/001-ibn-core-my/ARC-001-REQ-v1.0.md | 2026-06-05 |
| ARC-001-MYCLAS | ibn-core-my Commercial Data-Sensitivity Classification Register v1.0 | projects/001-ibn-core-my/ARC-001-MYCLAS-v1.0.md | 2026-06-05 |

### Citations

| Citation | Doc ID | Section | Used in |
|----------|--------|---------|---------|
| [PDPA-1] | MY-PDPA | Seven Data Protection Principles (s.5–s.12) | Seven Data Protection Principles |
| [PDPA-2] | MY-PDPA | DPO, breach notification, data portability (Amendment Act 2024) | DPO; Breach Notification Readiness; Data-Subject Rights; 2024 Obligations |
| [PDPA-3] | MY-PDP-GL0325 | Risk-based cross-border transfer | Cross-Border Transfers; Risk Register R-PDPA-03 |
| [PDPA-4] | MY-PDPA | s.3 government exemption (inapplicable to commercial subject) | Commercial-applicability note |
| [REQ-1] | ARC-001-REQ | NFR-C-001, FR-009, FR-006/007, NFR-SEC-001…006, INT-002/004 | Principles; Security; Cross-Border; Risk Register |
| [CLAS-1] | ARC-001-MYCLAS | DS-009 RESTRICTED personal data; RESTRICTED handling rules | Scope; Executive Summary; Cross-Border |

### Unreferenced Documents

| Filename | Source Location | Reason |
|----------|-----------------|--------|
| `_partials/RENDERING.md`, `_partials/document-control-uk.md` | arckit-my plugin | Read to resolve the doc-control header to the Generic/commercial block (Malaysia Federal block omitted); methodological input, not a content source |

---

**Generated by**: ArcKit `/arckit:my-pdpa` command (executed via `/arckit:build` wave 4)
**Generated on**: 2026-06-05
**ArcKit Version**: 5.11.0
**Project**: ibn-core-my (Project 001)
**Model**: Claude Opus 4.8 (1M context)
