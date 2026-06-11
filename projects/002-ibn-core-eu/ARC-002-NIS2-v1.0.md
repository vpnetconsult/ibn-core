# NIS2 Compliance Assessment

> **Template Origin**: Community | **ArcKit Version**: 5.11.0 | **Command**: `/arckit:eu-nis2`

## Document Control

| Field | Value |
|-------|-------|
| **Document ID** | ARC-002-NIS2-v1.0 |
| **Document Type** | NIS2 (Directive (EU) 2022/2555) Compliance Assessment |
| **Project** | ibn-core EU (Project 002) |
| **Classification** | OFFICIAL-SENSITIVE |
| **Status** | DRAFT |
| **Version** | 1.0 |
| **Created Date** | 2026-06-06 |
| **Last Modified** | 2026-06-06 |
| **Review Cycle** | Quarterly |
| **Next Review Date** | 2026-09-06 |
| **Owner** | CISO, Vpnet Cloud Solutions Sdn. Bhd. |
| **Reviewed By** | [PENDING] |
| **Approved By** | [PENDING] |
| **Distribution** | EU RFP evaluation panel; operator CISO |

## Revision History

| Version | Date | Author | Changes | Approved By | Approval Date |
|---------|------|--------|---------|-------------|---------------|
| 1.0 | 2026-06-06 | ArcKit AI | Initial creation from `/arckit:eu-nis2`, grounded in ibn-core security docs | [PENDING] | [PENDING] |

## Executive Summary

| Pillar | Status | Critical Gaps |
|--------|--------|---------------|
| Entity Scoping | Supplier to Essential/Important entities | 0 |
| Governance | Partial | 1 (named accountable body) |
| Risk Management (Art. 21) | Partial | 2 (encryption-at-rest, DR/BCM) |
| Incident Reporting (Art. 23) | Partial | 1 (**24h early-warning workflow**) |
| Supply Chain | Partial | 1 (SBOM) |
| Business Continuity | Gap | 1 (DR plan not done) |

## 1. Entity Scoping

ibn-core is an IBN **software framework**. When deployed by a telecom operator it sits within the operator's **Digital infrastructure / electronic communications** estate (NIS2 Annex I — Essential). Vpnet, as the provider, is most directly engaged through:
- **Annex I — Digital infrastructure / ICT service management (B2B)** if Vpnet runs ibn-core as a managed service; and
- **Art. 21(2)(d) supply-chain security** as a supplier/ICT product to Essential/Important entities.

| Determination | Result |
|---------------|--------|
| ibn-core as standalone product | Supplier to NIS2-regulated entities (supply-chain reach) |
| ibn-core operated as managed service by Vpnet | Potentially **Important entity** (size-dependent) |
| Size (Vpnet) | Likely SME — confirm against 50/250-employee, €10M/€50M thresholds |

## 2. Art. 21 Risk-Management Measures (Statement of Applicability)

| Measure (Art. 21(2)) | Implemented? | Evidence | Gap |
|----------------------|--------------|----------|-----|
| (a) Risk-analysis & infosec policy | Partial | SECURITY.md policy set | Formal threat model not done (Phase 2) |
| (b) Incident handling | Strong | IR plan, 4 runbooks, severity SLAs (P0<15m, P1<1h) | See §3 reporting |
| (c) Business continuity / backup / DR | **Gap** | Recovery procedures only | **No DR plan, no RTO/RPO, no backup** |
| (d) **Supply-chain security** | Partial | CI: npm audit + CodeQL + Trivy + Dependency Review; 100% pinned deps; CVEs fixed | **No SBOM**; add Dependabot |
| (e) Secure acquisition/dev/vuln handling | Strong | Vuln-disclosure policy (Critical 7d/High 14d), CI scanning | — |
| (f) Effectiveness testing | Partial | CI gates | Pen test planned Q1 2026, not done |
| (g) Cyber hygiene & training | Partial | Secure-coding practices | Training programme not evidenced |
| (h) Cryptography | Partial | TLS 1.3, SHA-256 salted | **Encryption at rest not done** |
| (i) Access control / asset mgmt | Strong | MCP keys (CRIT-005), RBAC field filter, file-based secrets, 90-day rotation | JWT/Keycloak named but unevidenced |
| (j) MFA / secure comms | Partial | API-key + HMAC signing | **No MFA evidenced** |

## 3. Art. 23 Incident Reporting

- **Existing:** GDPR 72-hour breach clock + internal severity SLAs (`INCIDENT_RESPONSE.md`).
- **NIS2 requirement (gap):** **early warning within 24 hours**, incident notification within **72 hours**, final report within **1 month**, to the CSIRT/competent authority. The 24-hour early-warning step and the CSIRT reporting path are **not yet implemented** — add to the IR runbook.

## 4. Governance & Accountability (Art. 20)

Management-body accountability and oversight of cyber-risk measures must be formally assigned (Art. 20). Currently no named accountable management body / sign-off is evidenced (Implementation-Summary approvals table unsigned). **Action:** assign and record.

## 5. Risk Register

| Risk | Likelihood | Impact | Treatment |
|------|-----------|--------|-----------|
| No 24h early-warning workflow | Medium | High | Add CSIRT reporting runbook |
| No DR/BCM for an essential-supporting system | Medium | High | DR plan + backup + RTO/RPO |
| Supply-chain transparency (no SBOM) | Medium | Medium | Generate + publish SBOM |
| Management accountability not assigned | Medium | Medium | Assign per Art. 20 |

## External References

| Doc ID | Title | URL / Path | Verified |
|--------|-------|-----------|----------|
| EU-NIS2 | Directive (EU) 2022/2555 (NIS2) | <https://eur-lex.europa.eu/eli/dir/2022/2555/oj> | 2026-06-06 |
| IBN-SEC | ibn-core security docs | docs/security/{SECURITY,SECURITY_IMPLEMENTATION_SUMMARY,SECURITY_REPORT}.md | 2026-06-06 |
| IBN-IR | ibn-core Incident Response Plan | docs/security/INCIDENT_RESPONSE.md | 2026-06-06 |

---

**Generated by**: ArcKit `/arckit:eu-nis2` · **Generated on**: 2026-06-06 · **ArcKit Version**: 5.11.0 · **Project**: ibn-core EU (002) · **Model**: claude-opus-4-8

> ⚠️ Community-contributed command — verify against current NIS2 transposition in the target Member State before reliance.
