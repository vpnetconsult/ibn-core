# EU Cyber Resilience Act Compliance Assessment

> **Template Origin**: Community | **ArcKit Version**: 5.11.0 | **Command**: `/arckit:eu-cra`

## Document Control

| Field | Value |
|-------|-------|
| **Document ID** | ARC-002-CRA-v1.0 |
| **Document Type** | EU Cyber Resilience Act (Regulation (EU) 2024/2847) Compliance Assessment |
| **Project** | ibn-core EU (Project 002) |
| **Classification** | OFFICIAL-SENSITIVE |
| **Status** | DRAFT |
| **Version** | 1.0 |
| **Created Date** | 2026-06-07 |
| **Last Modified** | 2026-06-07 |
| **Review Cycle** | Quarterly |
| **Next Review Date** | 2026-09-07 |
| **Owner** | CISO / Product Security, Vpnet Cloud Solutions Sdn. Bhd. |
| **Reviewed By** | [PENDING] |
| **Approved By** | [PENDING] |
| **Distribution** | EU RFP evaluation panel; product security |

## Revision History

| Version | Date | Author | Changes | Approved By | Approval Date |
|---------|------|--------|---------|-------------|---------------|
| 1.0 | 2026-06-07 | ArcKit AI | Initial creation from `/arckit:eu-cra`, grounded in ibn-core security/CI evidence | [PENDING] | [PENDING] |

## Executive Summary

| Area | Classification | Status | Key Gaps |
|------|---------------|--------|----------|
| Product Scope | In scope | — | Software product with digital elements, commercial SI |
| Risk Classification | Default (Annex III not engaged) | — | Self-assessment route |
| Security by Design (Annex I, Pt I) | — | Partial | 3 (at-rest encryption, secure update, integrity monitoring) |
| Vulnerability Management (Annex I, Pt II) | — | Partial | 2 (**SBOM**, coordinated CSIRT/ENISA disclosure) |
| Reporting Capability | — | Gap | 1 (**24h** actively-exploited-vuln reporting) |
| Conformity Assessment | — | Gap | 1 (DoC / CE marking not produced) |

> ibn-core is a **product with digital elements** placed on the EU market, so the CRA applies — and ibn-core already meets a large share of the essential requirements through its CI security pipeline, secure defaults and published VDP. The headline gaps are an **SBOM**, a **signed/secure update mechanism**, and the **24-hour actively-exploited-vulnerability reporting** path to ENISA/CSIRT (shared with NIS2).

## 1. Scope and Classification

| Criterion | Assessment |
|-----------|------------|
| Product with digital elements | **Yes** — software (TypeScript/Node, containerised) |
| Placed/made available on EU market | **Yes** (commercial SI engagements) |
| Excluded sector category | No (not medical/aviation/automotive) |
| **Risk class** | **Default** — not Class I/II (Annex III critical products: password managers, firewalls, OS, etc.); **self-assessment** conformity route |
| **Open-source position** | Open-core (Apache 2.0 public framework) **with paid support/SI** → in scope for the supported commercial product; the manufacturer (Vpnet) is responsible for the full product |

## 2. Security Requirements by Design (Annex I, Part I)

| Requirement | Status | Evidence | Gap / Remediation |
|-------------|--------|----------|-------------------|
| No known exploitable vulnerabilities at release | Strong | CI: npm audit + CodeQL + Trivy + Dependency Review; CVE-2023-45857, CVE-2025-64756, CVE-2024-21538 fixed; 100% pinned deps | Maintain release gate |
| Secure-by-default configuration | Strong | File-based read-only secrets (`secrets.ts`), non-root containers, Helmet headers, ClusterIP internal-only | — |
| Protection against unauthorised access | Partial | MCP API keys (CRIT-005), RBAC field filter (`response-filter.ts`), HMAC signing | MFA / JWT not evidenced |
| Data confidentiality & integrity | Partial | TLS 1.3 in transit, SHA-256 salted | **Encryption at rest not done** |
| Minimal data collection | Strong | PII masking / minimisation before LLM (`pii-masking.ts`) | — |
| Availability / DoS protection | Partial | Rate limiting, input-length guard | Add circuit breakers (Phase 3) |
| Limit attack surface | Strong | Internal-only services, least-exposure | — |
| Reduce exploitable vulnerabilities | Partial | Least privilege, secure coding, input sanitisation | Threat model (Phase 2) |
| Integrity monitoring | **Gap** | — | Add software/data integrity verification |
| Security audit logging | Partial | Pino structured logs, audit logging, Prometheus security metrics | Tamper-resistant log store |
| **Secure update mechanism** | **Gap** | `kubectl rollout` only | Signed updates + rollback capability |
| End-of-support transparency | **Gap** | — | Publish support/EOL policy |

## 3. Vulnerability Management (Annex I, Part II)

| Requirement | Status | Evidence | Gap |
|-------------|--------|----------|-----|
| Vulnerability disclosure policy (VDP) | Strong | Published VDP, `security@vpnet.cloud`, fix SLAs Critical 7d / High 14d (`SECURITY.md`) | — |
| **SBOM** | **Gap** | Deps pinned but no machine-readable SBOM | Generate CycloneDX/SPDX SBOM |
| CVE registry participation | Partial | Consumes + remediates CVEs | Register product CVEs (CNA/MITRE) |
| Free security updates over lifetime | Partial | Open-source + SI updates | Formalise update commitment |
| Coordinated disclosure to CSIRT/ENISA | **Gap** | Internal coordinated disclosure only | Establish CSIRT/ENISA channel |
| Documented support period | **Gap** | — | Publish support period |

## 4. Reporting (Art. 14)

CRA requires manufacturers to report **actively exploited vulnerabilities** and **severe incidents** to the relevant CSIRT and ENISA — **early warning within 24 hours**, follow-up within 72 hours, final report within 14 days/1 month. **Status: Gap** — the same 24-hour early-warning workflow flagged under NIS2 (ARC-002-NIS2) must be built and pointed at ENISA's single reporting platform.

## 5. Conformity Assessment (Art. 32, Annex IV/V)

Default-class products self-assess and issue an **EU Declaration of Conformity** + affix CE marking. **Status: Gap** — no DoC or technical documentation file produced yet. **Action:** compile Annex VII technical documentation; issue DoC once the SBOM, secure-update, and reporting gaps are closed.

## 6. Risk Register

| Risk | Likelihood | Impact | Treatment |
|------|-----------|--------|-----------|
| No SBOM (Annex I Pt II mandatory) | High | Medium | Generate + maintain SBOM in CI |
| No secure/signed update mechanism | Medium | High | Implement signed updates + rollback |
| No 24h ENISA reporting capability | Medium | High | Build reporting runbook (shared w/ NIS2) |
| No DoC / CE marking at market placement | Medium | High | Produce Annex VII docs + DoC |

## External References

| Doc ID | Title | URL / Path | Verified |
|--------|-------|-----------|----------|
| EU-CRA | Regulation (EU) 2024/2847 (Cyber Resilience Act) | <https://eur-lex.europa.eu/eli/reg/2024/2847/oj> | 2026-06-07 |
| IBN-SEC | ibn-core security docs + CI pipeline | docs/security/{SECURITY,SECURITY_IMPLEMENTATION_SUMMARY,SECURITY_REPORT}.md | 2026-06-07 |

---

**Generated by**: ArcKit `/arckit:eu-cra` · **Generated on**: 2026-06-07 · **ArcKit Version**: 5.11.0 · **Project**: ibn-core EU (002) · **Model**: claude-opus-4-8

> ⚠️ Community-contributed command — verify against current CRA implementing acts / harmonised standards before reliance.
