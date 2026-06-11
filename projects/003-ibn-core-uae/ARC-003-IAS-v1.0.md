# UAE Information Assurance Standards (IAS) Statement of Applicability

> **Template Origin**: Community | **ArcKit Version**: 5.11.0 | **Command**: `/arckit:uae-ias`

## Document Control

| Field | Value |
|-------|-------|
| **Document ID** | ARC-003-IAS-v1.0 |
| **Document Type** | UAE IAS Statement of Applicability |
| **Project** | ibn-core UAE (Project 003) |
| **Classification** | Confidential |
| **Status** | DRAFT |
| **Version** | 1.0 |
| **Created Date** | 2026-06-08 |
| **Last Modified** | 2026-06-08 |
| **Review Cycle** | Quarterly |
| **Next Review Date** | 2026-09-08 |
| **Owner** | CISO, Vpnet Cloud Solutions Sdn. Bhd. |
| **Reviewed By** | [PENDING] |
| **Approved By** | [PENDING] |
| **Distribution** | UAE RFP evaluation panel; entity CISO / Cybersecurity Council liaison |
| **Federal Entity** | Vpnet Cloud Solutions Sdn. Bhd. (supplier) |
| **Cabinet Instrument cited** | UAE Information Assurance Standards (IAS) — UAE Cybersecurity Council / TDRA (formerly NESA) |
| **Sovereign Cloud Region** | Per deployment — UAE-resident for Confidential+ data |
| **AI Autonomy Tier** | Tier 1 (restricted copilot) — see ARC-003-AICH |

## Revision History

| Version | Date | Author | Changes | Approved By | Approval Date |
|---------|------|--------|---------|-------------|---------------|
| 1.0 | 2026-06-08 | ArcKit AI | Initial UAE baseline from `/arckit:uae-ias`, grounded in ibn-core security docs | [PENDING] | [PENDING] |

## Executive Summary

ibn-core ships a substantial, evidenced application-security posture: authenticated MCP services (CRIT-005), role-based field-level authorisation (`src/response-filter.ts`), file-based secret handling (`src/secrets.ts`), prompt-injection defence (`src/prompt-injection-detection.ts`), PII/DLP masking, a CI security pipeline (npm audit + **CodeQL** + **Trivy** + Dependency Review) with 100% pinned dependencies, and a documented incident-response plan with severity SLAs (P0 < 15 min, P1 < 1 h).

This Statement of Applicability maps those controls to the **UAE Information Assurance Standards (IAS)** — the ~188-control framework (≈60 management + ≈128 technical controls) maintained by the UAE Cybersecurity Council / TDRA (formerly NESA). ibn-core is assessed as a **supplier / ICT product to a UAE federal entity or critical-sector operator**, providing the technical controls while the operating entity owns the management-tier obligations.

**Two material gaps for an IAS claim:** (1) the incident-reporting workflow is built to the **GDPR 72-hour** clock, not the UAE incident-reporting path to **aeCERT / the Cybersecurity Council**; and (2) several enterprise controls named in project context (JWT/Keycloak/OIDC, Istio mTLS, SIEM, encryption at rest) are **planned, not yet evidenced** in the security documentation reviewed.

> **Baseline note:** This is the UAE reference assessment. The Malaysia equivalent (ARC-001-NCII) was derived from this pattern — the shared gaps are the regulatory incident-reporting workflow, encryption-at-rest, SIEM, DR/RTO-RPO and "named-but-unevidenced" controls; only the standard (IAS vs NACSA sector CoP) and the reporting authority (aeCERT/Cybersecurity Council vs NACSA) differ.

## Statement of Applicability (IAS control families)

| IAS area | Applicable? | Implemented? | Evidence | Gap / Remediation owner |
|---|---|---|---|---|
| Identity & access management (T1) | Yes | Partial | MCP API keys (CRIT-005), three-tier keys, customer-ownership validation, RBAC field filter (`response-filter.ts`) | JWT/Keycloak/OIDC named in CLAUDE.md but **not evidenced** — verify / Security |
| Communications security (T2) | Yes | Partial | TLS 1.3 stated; HMAC request signing (optional) | Enforce + verify; Istio **mTLS not implemented** (Phase 3) / Platform |
| Cryptography (T3) | Yes | Partial | SHA-256 salted | Encryption **at rest** not done / Platform |
| Asset & secrets management (M/T) | Yes | Strong | File-based read-only secrets (`secrets.ts`, MED-001), no hardcoded creds, 90-day rotation | Automate rotation (Phase 2) / DevOps |
| Network security (T4) | Yes | Partial | K8s NetworkPolicies, ClusterIP internal-only, rate limiting (100/min) | Istio service mesh (Phase 3) / Platform |
| Logging, monitoring & detection (T5) | Yes | Partial | Pino structured JSON, audit logs, Prometheus metrics (`auth_*`, `pii_masking_*`, `prompt_injection_*`) | **SIEM not deployed**; OTel telemetry default-off / SOC |
| Vulnerability & supply-chain mgmt (T6) | Yes | Strong | CI: npm audit + CodeQL + Trivy + Dependency Review; 100% pinned; CVE-2023-45857, CVE-2025-64756, CVE-2024-21538 fixed | **No SBOM**; add Dependabot automation / DevOps |
| Application security (T7) | Yes | Strong | Input validation, prompt-injection detection (50+ patterns), mass-assignment protection, Helmet headers | MEDIUM/LOW injection not auto-blocked by default / Security |
| Business continuity & resilience (M/T) | Yes | **Gap** | Recovery procedures, scaling | **No RTO/RPO, no backup, no HPA; DR plan not done** (Phase 2) / Platform |
| Threat & risk management (M1) | Yes | **Gap** | — | Formal threat model / risk assessment not done (Phase 2) / Security |
| Incident management & reporting (M2) | Yes | Partial | IR plan, 4 runbooks, severity SLAs (P0<15m) | **No aeCERT / Cybersecurity Council reporting workflow** / SOC |

## Incident-Reporting Posture

- **Existing:** 4 severity tiers (P0 < 15 min, P1 < 1 h, P2 < 4 h, P3 < 24 h), 5 response phases, 4 runbooks, IRT roles + on-call, GDPR **72-hour** breach clock (`docs/security/INCIDENT_RESPONSE.md`).
- **Gap — UAE:** No reporting workflow to **aeCERT / the UAE Cybersecurity Council**. The 15-minute (P0) detection/triage SLA and Prometheus alerting support a strong *detection* posture, but the **regulatory reporting path and timelines must be added** per IAS / sector direction.
- A reportable cyber incident involving personal data also triggers the PDPL breach duty — see ARC-003-PDPL.

## Risks

| Risk | Likelihood | Impact | Treatment |
|------|-----------|--------|-----------|
| Cannot meet UAE incident reporting (no workflow/SIEM) | Medium | High | Add aeCERT/Council reporting runbook; deploy SIEM before go-live |
| Controls named but unevidenced (JWT/Istio/at-rest) | Medium | High | Produce evidence or implement before claiming |
| No DR / RTO-RPO for a critical-supporting system | Medium | High | DR plan + backup + HPA |
| Supply-chain compromise | Low | High | CI scanning in place; add SBOM + Dependabot |

## External References

### Document Register

| Doc ID | Title | URL / Path | Verified date |
|--------|-------|-----------|---------------|
| UAE-IAS | UAE Information Assurance Standards (Cybersecurity Council / TDRA) | <https://csc.gov.ae/> | 2026-06-08 |
| IBN-SEC | ibn-core Security docs | docs/security/{SECURITY,SECURITY_IMPLEMENTATION_SUMMARY,SECURITY_REPORT}.md | 2026-06-08 |
| IBN-IR | ibn-core Incident Response Plan | docs/security/INCIDENT_RESPONSE.md | 2026-06-08 |

### Citations

| Citation | Doc ID | Section | Used in |
|----------|--------|---------|---------|
| [IAS-1] | UAE-IAS | Control families (management + technical) | Statement of Applicability |
| [IAS-2] | UAE-IAS | Incident management & reporting | Incident-Reporting Posture |
| [E-1] | IBN-SEC | CRIT-005, MED-001, CI pipeline | Statement of Applicability |
| [E-2] | IBN-IR | Severity tiers; GDPR 72h | Incident-Reporting Posture |

### Unreferenced Documents

None.

---

**Generated by**: ArcKit `/arckit:uae-ias` command · **Generated on**: 2026-06-08 · **ArcKit Version**: 5.11.0 · **Project**: ibn-core UAE (003) · **Model**: claude-opus-4-8

> ⚠️ Community-contributed command — review by qualified UAE cyber-security counsel (Cybersecurity Council / aeCERT) before reliance. Some controls cited in project context were not evidenced in the documents reviewed and are marked as gaps.
