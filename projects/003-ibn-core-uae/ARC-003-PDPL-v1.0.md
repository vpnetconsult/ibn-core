# UAE PDPL (Federal Decree-Law 45/2021) Compliance Assessment

> **Template Origin**: Community | **ArcKit Version**: 5.11.0 | **Command**: `/arckit:uae-pdpl`

## Document Control

| Field | Value |
|-------|-------|
| **Document ID** | ARC-003-PDPL-v1.0 |
| **Document Type** | UAE PDPL Compliance Assessment |
| **Project** | ibn-core UAE (Project 003) |
| **Classification** | Confidential |
| **Status** | DRAFT |
| **Version** | 1.0 |
| **Created Date** | 2026-06-08 |
| **Last Modified** | 2026-06-08 |
| **Review Cycle** | Quarterly |
| **Next Review Date** | 2026-09-08 |
| **Owner** | Data Protection Officer (to be appointed), Vpnet Cloud Solutions Sdn. Bhd. |
| **Reviewed By** | [PENDING] |
| **Approved By** | [PENDING] |
| **Distribution** | UAE RFP evaluation panel; DPO; legal |
| **Federal Entity** | Vpnet Cloud Solutions Sdn. Bhd. (supplier) |
| **Cabinet Instrument cited** | Federal Decree-Law No. 45 of 2021 on the Protection of Personal Data |
| **Sovereign Cloud Region** | Per deployment — UAE-resident for Confidential+ personal data |
| **AI Autonomy Tier** | Tier 1 (restricted copilot) — see ARC-003-AICH |

## Revision History

| Version | Date | Author | Changes | Approved By | Approval Date |
|---------|------|--------|---------|-------------|---------------|
| 1.0 | 2026-06-08 | ArcKit AI | Initial UAE baseline from `/arckit:uae-pdpl`, grounded in ibn-core DPIA + PII-masking code | [PENDING] | [PENDING] |

## Executive Summary

ibn-core processes telecom customer personal data — identity, contact, commercial, and heightened-risk financial data — to translate natural-language intents into TMF921 service offers. The platform ships **strong data-protection-by-design controls in code**: a PII masking layer that removes/hashes/generalises personal data **before** any data reaches the Claude (Anthropic) LLM (`src/pii-masking.ts`), role-based field-level response filtering (`src/response-filter.ts`), SHA-256 salted hashing, TLS 1.3 in transit, and structured audit logging with log redaction.

**Material finding for this RFP:** ibn-core's existing data-protection artefacts (`docs/security/DPIA.md`) are framed against **EU GDPR and the Irish Data Protection Commission**, under the legacy entity "Vpnet Consulting LLC / Business Intent Agent v1.1.0" — **not** the UAE PDPL / UAE Data Office / Vpnet Cloud Solutions Sdn. Bhd. The technical controls map well to the PDPL, but the **lawful-basis model, breach-notification authority, cross-border transfer mechanism, and DPO appointment must be re-cut for Federal Decree-Law 45/2021** before a compliance claim can be made. The single most urgent gap is the **unsigned Anthropic Data Processing Agreement**, which must be in place before production processing of UAE personal data.

> **Baseline note:** This is the UAE reference assessment. The Malaysia equivalent (ARC-001-PDPA) was derived from this pattern — the gaps (DPA, DPO, jurisdiction re-cut, cross-border) are shared; only the regulator (UAE Data Office vs JPDP) and instrument differ.

## PDPL Core Obligations

| Obligation | Compliant? | Evidence | Gap | Action |
|-----------|------------|----------|-----|--------|
| **Lawful basis (Art. 4)** | Partial | DPIA documents purpose per activity | Bases stated as GDPR Art. 6/9; PDPL has its own consent + permitted-grounds regime (Art. 4) | Re-map each activity to a PDPL basis |
| **Consent (Art. 6)** | Gap | — | No PDPL-form consent / withdrawal mechanism | Implement consent capture + withdrawal |
| **Controller obligations (Art. 7)** | Partial | Security-by-design controls in code | Records of processing not PDPL-framed | Maintain PDPL Art. 7 records |
| **Security of processing (Art. 20)** | Strong | PII removal/hashing before LLM, SHA-256 salted, TLS 1.3, RBAC field filter, rate limiting, log redaction | Encryption **at rest** not implemented; default hash-salt fallback | Enable encryption at rest; enforce non-default `PII_HASH_SALT` |
| **Data-subject rights (Art. 13–19)** | Gap | Rights documented (access/correction/erasure/portability/object/restriction) | **No implementing code**; portal "Planned Q2 2026" | Build DSAR + portability workflow |
| **Breach notification (Art. 9)** | Partial | IR plan with a 72-hour GDPR clock to the Irish DPC | Must re-point to the **UAE Data Office** and the PDPL breach duty | Re-point breach workflow to UAE Data Office |
| **DPO (Art. 10)** | Gap | Role defined, unassigned | Appoint a DPO where required (risk-based / large-scale processing) | Appoint + record DPO |

## Cross-Border Transfers (Art. 22–23)

| Transfer | Destination | Recipient | Current safeguard | PDPL action |
|----------|-------------|-----------|-------------------|-------------|
| LLM inference | **USA** | Anthropic (Claude API) | GDPR SCCs + PII masking + TLS 1.3; **DPA unsigned** | Assess under PDPL Art. 22 (adequacy) / Art. 23 (appropriate safeguards); sign DPA; confirm only masked, non-personal data leaves the UAE |
| Identity / billing | Per deployment | Operator BSS/OSS | Internal | Keep on UAE-resident infrastructure (see ARC-003 cloud-residency) |

> The architecture masks personal data **before** the cross-border LLM call — only masked/redacted content leaves the UAE (`gen_ai.prompt.0.content` → `[REDACTED-EMAIL]/[REDACTED-PHONE]`). This materially reduces transfer risk but does not remove the DPA obligation.

## Risk Register

| Risk | Likelihood | Impact | Treatment | Residual |
|------|-----------|--------|-----------|----------|
| Anthropic DPA unsigned at go-live | Medium | High | Sign before production; launch gate | Low |
| Lawful basis challenged (GDPR basis, not PDPL) | High | High | Re-map to PDPL grounds | Medium |
| DPO not appointed where required | Medium | High | Appoint + record | Low |
| DSAR/portability not built | Medium | Medium | Build DSAR workflow | Low |
| Personal data leak to LLM via unknown field | Low | High | Tighten `maskCustomerProfile` to default-deny + `validateNoRawPII` gate | Low |

## External References

### Document Register

| Doc ID | Title | URL / Path | Verified date |
|--------|-------|-----------|---------------|
| UAE-PDPL | Federal Decree-Law No. 45 of 2021 (PDPL) / UAE Data Office | <https://u.ae/en/about-the-uae/digital-uae/data/data-protection-laws> | 2026-06-08 |
| IBN-DPIA | ibn-core Data Protection Impact Assessment | docs/security/DPIA.md | 2026-06-08 |
| IBN-PIIM | ibn-core PII Masking design + code | src/PII_MASKING.md; src/pii-masking.ts; src/response-filter.ts | 2026-06-08 |

### Citations

| Citation | Doc ID | Section | Used in |
|----------|--------|---------|---------|
| [PDPL-1] | UAE-PDPL | Core obligations (Art. 4–20) | PDPL Core Obligations |
| [PDPL-2] | UAE-PDPL | Cross-border (Art. 22–23); breach (Art. 9); DPO (Art. 10) | Cross-Border; Breach; DPO |
| [E-1] | IBN-PIIM | maskCustomerProfile / validateNoRawPII | Security |
| [E-2] | IBN-DPIA | Cross-border; retention; DPO | Cross-Border; Risk Register |

### Unreferenced Documents

None.

---

**Generated by**: ArcKit `/arckit:uae-pdpl` command · **Generated on**: 2026-06-08 · **ArcKit Version**: 5.11.0 · **Project**: ibn-core UAE (003) · **Model**: claude-opus-4-8

> ⚠️ Community-contributed command — review by qualified UAE data-protection counsel (UAE Data Office) before reliance. Source evidence is GDPR-framed; PDPL mapping performed by the assessor.
