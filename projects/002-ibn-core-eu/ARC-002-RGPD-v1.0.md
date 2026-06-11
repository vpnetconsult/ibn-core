# GDPR Compliance Assessment

> **Template Origin**: Community | **ArcKit Version**: 5.11.0 | **Command**: `/arckit:eu-rgpd`

## Document Control

| Field | Value |
|-------|-------|
| **Document ID** | ARC-002-RGPD-v1.0 |
| **Document Type** | GDPR (Regulation (EU) 2016/679) Compliance Assessment |
| **Project** | ibn-core EU (Project 002) |
| **Classification** | OFFICIAL-SENSITIVE |
| **Status** | DRAFT |
| **Version** | 1.0 |
| **Created Date** | 2026-06-06 |
| **Last Modified** | 2026-06-06 |
| **Review Cycle** | Quarterly |
| **Next Review Date** | 2026-09-06 |
| **Owner** | Data Protection Officer (to be appointed), Vpnet Cloud Solutions Sdn. Bhd. |
| **Reviewed By** | [PENDING] |
| **Approved By** | [PENDING] |
| **Distribution** | EU RFP evaluation panel; DPO; legal |

## Revision History

| Version | Date | Author | Changes | Approved By | Approval Date |
|---------|------|--------|---------|-------------|---------------|
| 1.0 | 2026-06-06 | ArcKit AI | Initial creation from `/arckit:eu-rgpd`, grounded in ibn-core DPIA + PII-masking code | [PENDING] | [PENDING] |

## Executive Summary

| Area | Status | Key Findings |
|------|--------|-------------|
| Lawful Basis | Established | Art. 6(1)(f)/(b)/(a) mapped per activity (`DPIA.md §2.1`) |
| Data Subject Rights | Partial | Art. 15–22 documented; **implementing code not evidenced** |
| International Transfers | Partial | Anthropic (USA) under SCCs + masking; **DPA unsigned** |
| DPIA Requirement | Conducted | `docs/security/DPIA.md` exists (large-scale profiling) |
| DPO | Gap | Role defined but **unassigned** |
| Breach Notification | In place | 72-hour process to DPA (`INCIDENT_RESPONSE.md`) |

> Unlike the Malaysia pack, ibn-core's existing artefacts are **already GDPR-native** (Articles 6/9/15-22/25/32/33/46, Irish DPC). This is the strongest of the compliance assessments — most controls are present; the gaps are the unsigned Anthropic DPA and the unappointed DPO.

## 1. Scope and Role Determination

| Role | Applicable | Note |
|------|-----------|------|
| **Data Controller** | ☑ (in Vpnet-operated SaaS) | Determines purposes/means |
| **Data Processor** | ☑ (when deployed for an operator) | Processes operator's customer data on instruction |
| **Sub-processor** | — | **Anthropic** is ibn-core's sub-processor for LLM inference |

### Data Categories Processed

| Data Category | GDPR Ref | Present | Lawful Basis |
|--------------|----------|---------|-------------|
| Standard personal data (identity, contact, commercial, technical: IP, API keys) | Art. 6 | ☑ | 6(1)(f)/(b) |
| Financial data (credit score, account balance) | Art. 6 (heightened risk) | ☑ | 6(1)(f) + safeguards |
| **Special category** (health/biometric/genetic/etc.) | Art. 9 | ☐ | **None processed** |

> Correction to legacy DPIA: it labels financial data "special category (Art. 9)". Under GDPR, financial data is **not** an Article 9 special category — it is standard personal data carrying heightened risk. ibn-core processes **no** Art. 9 data, which lowers the risk profile.

## 2. Lawful Basis (Art. 6)

| Processing | Basis | Evidence |
|-----------|-------|----------|
| Intent analysis | 6(1)(f) Legitimate interest (LIA provided) | `DPIA.md §2.1, §3.1` |
| Personalised recommendation / profiling | 6(1)(f) Legitimate interest | `DPIA.md §2.1` |
| Quote generation | 6(1)(b) Contract performance | `DPIA.md §2.1` |
| Marketing | 6(1)(a) Consent (opt-in) | `DPIA.md §2.1` |

## 3. Data Subject Rights (Art. 15–22)

Documented with response targets (access/rectification 30d; erasure 30d; **portability** JSON export; object/restriction immediate via flags) — `DPIA.md §5.2.4`. **Gap:** no implementing code is evidenced; enhanced data-subject portal "Planned Q2 2026". Art. 22 (automated decisions): intent rationale surfaced in response; right to human intervention claimed.

## 4. Data Protection by Design & Default (Art. 25 / 32)

Strong, code-evidenced:
- **PII minimisation before processing** — `maskCustomerProfile()` removes high-risk fields, SHA-256-hashes identifiers, generalises location, tiers credit score **before** any data reaches the LLM (`src/pii-masking.ts`).
- **Role-based field-level access** — `filterResponseByRole()` (`src/response-filter.ts`).
- **Security of processing (Art. 32)** — TLS 1.3 in transit, K8s secret encryption, salted SHA-256, rate limiting, audit logging with `redactForLogs()`.
- Residual gaps: **encryption at rest** not yet implemented; `validateNoRawPII` covers fewer patterns than documented; `maskCustomerProfile` preserves unknown fields with a warning (tighten to default-deny).

## 5. International Transfers (Chapter V)

| Transfer | Destination | Mechanism | Status |
|----------|-------------|-----------|--------|
| LLM inference (masked data only) | USA (Anthropic) | Art. 46 SCCs + PII masking + TLS 1.3 | **DPA unsigned — blocker** (`PII_MASKING.md`) |

> Post-*Schrems II*: SCCs + the masking transfer-impact mitigation (only redacted content leaves the EEA — trace evidence `[REDACTED-EMAIL]/[REDACTED-PHONE]` in `gen_ai.prompt`) support the transfer, but the **DPA must be executed** before production.

## 6. DPO & Breach

- **DPO:** required (large-scale profiling, Art. 37(1)(b)) — role defined, **unassigned** (`DPIA.md §6.1`). **Appoint and register.**
- **Breach (Art. 33/34):** 72-hour DPA notification process in place; data-subject notification where high risk (`INCIDENT_RESPONSE.md`). Supervisory authority currently Irish DPC — confirm lead authority for target EU market.

## 7. Risk Register

| Risk | Likelihood | Impact | Treatment |
|------|-----------|--------|-----------|
| Anthropic DPA unsigned at go-live | Medium | High | Execute DPA; launch gate |
| DPO not appointed (mandatory) | High | High | Appoint + register with DPA |
| DSAR/portability not built | Medium | Medium | Implement DSAR workflow |
| No encryption at rest | Medium | Medium | Enable (Phase 2) |

## External References

| Doc ID | Title | URL / Path | Verified |
|--------|-------|-----------|----------|
| EU-GDPR | Regulation (EU) 2016/679 (GDPR) | <https://eur-lex.europa.eu/eli/reg/2016/679/oj> | 2026-06-06 |
| IBN-DPIA | ibn-core DPIA | docs/security/DPIA.md | 2026-06-06 |
| IBN-PIIM | ibn-core PII masking | src/pii-masking.ts; src/response-filter.ts; src/PII_MASKING.md | 2026-06-06 |

---

**Generated by**: ArcKit `/arckit:eu-rgpd` · **Generated on**: 2026-06-06 · **ArcKit Version**: 5.11.0 · **Project**: ibn-core EU (002) · **Model**: claude-opus-4-8

> ⚠️ Community-contributed command — verify citations against current EU regulatory text before reliance.
