# Commercial Data-Sensitivity Classification Register

> **Template Origin**: Community (reframed) | **ArcKit Version**: 5.11.0 | **Command**: `/arckit:my-classification`

> ⚠️ **Community-contributed command, commercial reframing** — ibn-core is a **commercial** open-core telecommunications enabler delivered by Vpnet Cloud Solutions Sdn. Bhd. under Systems Integration (SI) engagements, **not** a Malaysian Federal public-sector entity. Per the `my-operator` build recipe (`.arckit/recipes/my-operator.yaml`, precedence #1), the `MY_CLASSIFICATION` target is deliberately **reframed to commercial data-sensitivity tiers** (PUBLIC / INTERNAL / CONFIDENTIAL / RESTRICTED) and the **government Arahan Keselamatan ladder (Terbuka / Terhad / Sulit / Rahsia / Rahsia Besar) is NOT used** — ibn-core carries no Federal mandate and is not bound by the Chief Government Security Office security directive. Arahan Keselamatan is referenced below **only as a comparison the operator is not bound by**. Personal data is classified under the Malaysia PDPA 2010 (operators are data users); operator network / configuration data is treated as operator-confidential commercial data. Review by qualified Malaysian compliance counsel is advised before external use.

## Document Control

| Field | Value |
|-------|-------|
| **Document ID** | ARC-001-MYCLAS-v1.0 |
| **Document Type** | Commercial Data-Sensitivity Classification Register |
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
| **Distribution** | ibn-core engineering, Vpnet SI delivery teams, operator integration partners (U Mobile, TM Malaysia) |

> **Subject type note**: This register applies the **Generic / commercial** document-control header, not the Malaysia Federal "Agensi" header. Per `_partials/RENDERING.md`, the Malaysia public-sector doc-control block is included only when `governance_framework` is `Malaysia Federal` **or** `classification_scheme` is `Arahan Keselamatan`. ibn-core is a commercial subject under neither condition, so the Malaysia block is omitted — consistent with `ARC-001-MYDIG-v1.0` (Subject type note) and the project's PUBLIC posture in `ARC-000-PRIN-v1.0`, `ARC-001-REQ-v1.0`, and `ARC-001-STKE-v1.0`.

## Revision History

| Version | Date | Author | Changes | Approved By | Approval Date |
|---------|------|--------|---------|-------------|---------------|
| 1.0 | 2026-06-05 | ArcKit AI | Initial creation from `/arckit:my-classification` (executed via arckit-build wave 3); commercial-tier reframing per `my-operator` recipe | [PENDING] | [PENDING] |

---

## Executive Summary

**ibn-core** is an open-core (Apache 2.0) RFC 9315 Intent-Based Networking framework targeting the TM Forum TMF921 Intent Management API v5.0.0, delivered commercially by Vpnet Cloud Solutions Sdn. Bhd. — with private operator CAMARA adapters — to Malaysian telecommunications operators (U Mobile, TM Malaysia). This register classifies every dataset ibn-core handles against a **commercial data-sensitivity ladder** appropriate to a private-sector telco enabler, **not** the government Arahan Keselamatan scheme. The four tiers — **PUBLIC**, **INTERNAL**, **CONFIDENTIAL**, **RESTRICTED** — are inherited directly from `ARC-001-REQ-v1.0` NFR-C-001 (Data Privacy Compliance) and aligned to the security NFRs (NFR-SEC-001…006) and the open-core principle that the public framework and operator secrets are physically separated repositories.

The data estate spans four natural sensitivity bands. At the **PUBLIC** end sits the open-core itself — the Apache 2.0 framework source, the published `McpAdapter` interface, the `MockMcpAdapter`, and standards-conformance evidence (TMF921 CTK results, RFC 9315 phase traceability) — all of which are intended for public release and academic citation (Paper 1). At the **INTERNAL** band sits non-secret operational data: structured TMF921 Intent resources stripped of subscriber PII, IntentReports, and observability telemetry (traces, metrics, GenAI / `rfc9315.phase` spans) that by design must not carry unmasked PII. The **CONFIDENTIAL** band holds operator-confidential commercial data — operator network / 4G-5G core / OSS-BSS configuration, capability descriptors, and orchestration payloads whose disclosure would harm an operator's competitive or security position. The **RESTRICTED** band holds the two highest-impact data classes: **subscriber personal data** (PDPA 2010 personal data — `customerId`, natural-language intent text that may embed personal context) and **secrets / credentials** (operator CAMARA credentials, Anthropic Claude API keys, Keycloak signing material, agent-role tokens, K8s secret values, encryption keys).

The residency and handling consequences follow the tier, not a government classification: RESTRICTED subscriber personal data is subject to PDPA 2010 data-residency and operator-contractual residency reasoning (handed off to `/arckit:my-cloud-first` / `MCRES` and `ADR-003`), and RESTRICTED secrets are governed by NFR-SEC-004 — **never** present in the public repository, held only in a secure vault / Kubernetes secret store outside the open core. The non-negotiable open-core seam (PRIN Principle 9; BR-003) is itself a classification control: it guarantees that no CONFIDENTIAL operator logic and no RESTRICTED operator credential can leak into the PUBLIC-tier public repository.

---

## Classification Scheme (Commercial Tiers — NOT Arahan Keselamatan)

> ibn-core uses the four-tier commercial ladder below, inherited from `ARC-001-REQ` NFR-C-001. The right-hand column gives the **nearest** government Arahan Keselamatan level **for comparison only** — ibn-core is a commercial subject and is **NOT bound** by the Arahan Keselamatan scheme; the mapping is indicative orientation, not an obligation.

| Commercial tier | Definition (commercial subject) | Typical data | Arahan Keselamatan comparator (NOT binding) |
|-----------------|----------------------------------|--------------|----------------------------------------------|
| **PUBLIC** | Intended for unrestricted public release; disclosure causes no harm. | Open-core Apache 2.0 source, published interfaces, CTK conformance evidence, public docs. | ~ Terbuka (Open) |
| **INTERNAL** | Non-public operational data; limited business impact if disclosed; not personal data and not operator-secret. | PII-masked TMF921 Intents, IntentReports, masked telemetry. | ~ Terhad (Restricted) |
| **CONFIDENTIAL** | Operator-confidential commercial / network data; disclosure harms an operator's competitive or security posture. | Operator network / OSS-BSS / 5G-core configuration, capability descriptors, orchestration payloads. | ~ Sulit (Confidential) |
| **RESTRICTED** | Highest sensitivity: subscriber personal data (PDPA 2010) and secrets / credentials; disclosure causes serious legal, regulatory, or security harm. | Subscriber PII, operator/CAMARA credentials, API keys, JWT signing keys, agent-role tokens, encryption keys. | ~ Sulit→Rahsia (Confidential→Secret) |

## Classification Tiers Used

| Tier | Holds data? | Count | Notes |
|------|-------------|-------|-------|
| PUBLIC | Y | 3 | Open-core framework, published MCP interface + mock, conformance evidence. |
| INTERNAL | Y | 3 | Masked TMF921 Intent, IntentReport, observability telemetry. |
| CONFIDENTIAL | Y | 2 | Operator network/OSS-BSS config; adapter capability + orchestration payloads. |
| RESTRICTED | Y | 2 | Subscriber personal data (PDPA 2010); secrets / credentials. |
| *(Arahan Keselamatan Rahsia Besar — government Top Secret)* | N | 0 | Not applicable — ibn-core is a commercial subject; no government Top Secret data. |

---

## Dataset Register

| Dataset ID | Description | Source system | Classification | Handling rules | Storage location | Retention / declassification |
|------------|-------------|---------------|----------------|----------------|------------------|------------------------------|
| DS-001 | Open-core framework source (Apache 2.0), incl. `src/mcp/McpAdapter.ts` interface and `MockMcpAdapter` | Public GitHub repo (ibn-core) | PUBLIC | Open distribution; Apache 2.0 headers retained; no secrets/operator logic (BR-003, NFR-SEC-004/006) | Public repository | Permanent public record; cited tags immutable (BR-006) |
| DS-002 | Standards-conformance evidence — TMF921 v5.0.0 CTK results, RFC 9315 phase traceability | `docs/compliance/` | PUBLIC | Versioned, dated, tied to commit/tag; publishable for academic citation | Public repository | Permanent evidence baseline; never rewritten |
| DS-003 | Published API & adapter contract surface (TMF921 shapes, capability descriptor schema, context docs) | Public repo / API surface | PUBLIC | Public; backward-compatibility review on change (NFR-I-001) | Public repository / API | Per release |
| DS-004 | TMF921 v5.0.0 Intent resource (PII-masked) — authoritative state | Redis SSoT (FR-005) | INTERNAL | Access-controlled; PII masked before persistence (FR-009); no unmasked subscriber PII | Redis SSoT, encrypted at rest (NFR-SEC-003) | Per operator retention; archival tiers (NFR-S-002) |
| DS-005 | IntentReport / `reportState` (compliance assessment output) | Redis SSoT / API (FR-008) | INTERNAL | Read from SSoT or labelled read-only copy; no unmasked PII | Redis SSoT, encrypted at rest | Per operator retention |
| DS-006 | Observability telemetry — OTel traces, metrics, GenAI / `rfc9315.phase` / `ai_gateway.*` spans, audit logs | OTel → LangSmith / Canvas collector (FR-011, INT-004) | INTERNAL | No unmasked subscriber PII in spans (FR-009); audit-log integrity for privileged ops (NFR-C-002) | Telemetry backend (credentials not in public repo) | Audit/security logs 1–7 yrs; app logs 30–90 days; metrics 1–2 yrs (NFR-C-002) |
| DS-007 | Operator network / 4G-5G core / transport / OSS-BSS configuration & orchestration payloads | Operator systems via MCP seam (INT-001) | CONFIDENTIAL | Operator-confidential; exchanged only over mTLS/signed tokens; never in public repo; bulkhead-isolated per operator (NFR-A-003) | Operator environment / private adapter (private repo) | Per operator contract |
| DS-008 | Adapter capability descriptors (`getCapabilities()`) | MCP adapter (FR-012, INT-001) | CONFIDENTIAL | Disclosed only to authorised callers/auditors; mock set is non-sensitive (PUBLIC via DS-001) | Operator adapter (private) / mock (public) | Per operator contract |
| DS-009 | Subscriber personal data — `customerId`, raw natural-language intent text (may embed personal context) | `POST /api/v1/intent` ingestion path (FR-001) | RESTRICTED | PDPA 2010 personal data; masked before AI invocation & downstream (FR-009); minimisation; lawful basis required; masking failure fails closed | Ingestion path only; not persisted unmasked (NFR-C-001) | Automated deletion after retention; legal-hold capability (NFR-C-001) |
| DS-010 | Secrets / credentials — operator CAMARA creds, Anthropic Claude API key, Keycloak signing keys, agent-role tokens, K8s secrets, encryption keys | Secure vault / K8s secret store (NFR-SEC-004) | RESTRICTED | **Never** in code, config, or public repo (BR-003, NFR-SEC-004); periodic rotation; mTLS; agent-role least privilege (FR-007) | Secure vault / K8s secret management (outside public repo) | Rotated periodically; revoked on compromise |

---

## Handling Rules per Tier

### PUBLIC (DS-001, DS-002, DS-003)
- **Encryption**: TLS in transit for distribution; integrity via signed Git tags (immutable cited tags, BR-006). No at-rest confidentiality requirement.
- **Access**: Unrestricted read; write restricted to maintainers via PR review.
- **Network / residency**: No residency constraint — public artefacts.
- **Open-core control**: Apache 2.0 headers on all source; licence-compatibility gate (NFR-SEC-006); no GPL; no secrets or operator logic (the seam, BR-003).

### INTERNAL (DS-004, DS-005, DS-006)
- **Encryption**: TLS 1.3 / mTLS in transit (Istio mesh); encryption at rest for the Redis SSoT and backups (NFR-SEC-003).
- **Access**: Authenticated (Keycloak JWT, FR-006); role-based least privilege (NFR-SEC-002); reads from SSoT or labelled read-only copy.
- **PII rule**: Must not contain unmasked subscriber PII (FR-009); masking enforced upstream.
- **Audit**: Structured audit trail for privileged ops; tamper-evident audit logs (NFR-C-002).
- **Residency**: Follows operator residency for SSoT placement (deferred to `MCRES` / `ADR-003`).

### CONFIDENTIAL (DS-007, DS-008)
- **Encryption**: mTLS within mesh; TLS egress to operator endpoints; signed tokens (INT-001).
- **Access**: Authorised operator-integration roles and the constrained **agent-role identity** (FR-007) only; least privilege; bulkhead isolation per operator (NFR-A-003).
- **Residency**: Operator-confidential — placement driven by operator contractual residency and MCMC reasoning (`MCRES` / `ADR-003`).
- **Open-core control**: Operator-specific adapter logic confined to the **private repo**; never in the public open core (BR-003).

### RESTRICTED (DS-009 subscriber PII, DS-010 secrets)
- **Subscriber personal data (DS-009)**: PDPA 2010 governs. Mask before AI/model invocation and downstream (FR-009); data minimisation; do not persist unmasked; masking failure **blocks** processing (fail-closed). Lawful basis, breach notification, and Malaysia-compliant residency per NFR-C-001; cross-border transfer needs a documented legal basis. Hand off PDPA categorisation to `/arckit:my-pdpa` (`PDPA`) and `/arckit:dpia` (`DPIA`).
- **Secrets / credentials (DS-010)**: **Never** in code, configuration, or the public repository (NFR-SEC-004, BR-003). Held only in a secure vault / Kubernetes secret store. MFA for human/admin access (NFR-SEC-001); distinct least-privilege agent-role token for autonomous cycles (FR-007); periodic rotation; immediate revocation on compromise.
- **Encryption**: TLS 1.3 / mTLS in transit; encryption at rest; key material itself vault-managed.
- **Residency**: Malaysia-resident / operator-contracted residency for subscriber personal data — drives `MCRES` and `ADR-003`.

> **Comparison only (not binding):** under the government Arahan Keselamatan scheme, RESTRICTED-tier subscriber/secret data would sit around *Sulit/Rahsia* and trigger on-shore handling obligations. ibn-core, as a **commercial** subject, derives its equivalent residency obligations from **PDPA 2010 and operator contracts**, not from the Arahan Keselamatan directive.

---

## Cross-Reference Index

| Dataset ID | Upstream BR / requirement | Downstream INT / consumer | PDPA category & basis (if personal data) |
|------------|---------------------------|----------------------------|-------------------------------------------|
| DS-001 | BR-003, BR-006; NFR-SEC-006 | Public consumers; FR-010 | N/A |
| DS-002 | BR-001, BR-006; NFR-C-003 | Auditors; academic (Paper 1) | N/A |
| DS-003 | BR-001; NFR-I-001 | Operator integrators | N/A |
| DS-004 | BR-001; FR-001, FR-005 | INT-001 (MCP orchestration); FR-004 | Masked — no PDPA personal data at rest |
| DS-005 | BR-001, BR-002; FR-008 | UC-2/UC-4; auditors | N/A (masked) |
| DS-006 | BR-005; FR-011, NFR-M-001 | INT-004 (LangSmith / Canvas); auditors | N/A (PII must be masked, FR-009) |
| DS-007 | BR-002, BR-004; FR-003 | INT-001 (operator CAMARA adapters) | N/A (network/config, not personal data) |
| DS-008 | BR-001; FR-012 | INT-001; UC-4 auditors | N/A |
| DS-009 | BR-002, BR-004, BR-005; FR-001, FR-009; NFR-C-001 | INT-002 (Claude, masked); FR-002 | Personal data (subscriber identity / context); lawful basis & DPIA via `/arckit:my-pdpa`, `/arckit:dpia` |
| DS-010 | BR-003, BR-005; NFR-SEC-004; FR-007 | INT-001/002/003 (operator, Claude, Keycloak) | N/A (credentials) |

---

## Cross-Reference & Hand-offs

| Concern | Owning artefact / command | Status |
|---|---|---|
| PDPA 2010 personal-data categorisation & lawful basis (DS-009) | `/arckit:my-pdpa` (`PDPA`), `/arckit:dpia` (`DPIA`) | Pending |
| Cloud placement & MCMC residency for RESTRICTED/CONFIDENTIAL data | `/arckit:my-cloud-first` (`MCRES`), `ADR-001` | Pending |
| Data residency per commercial classification | `ADR-003` | Pending |
| NACSA NCII (telecommunications sector) controls | `/arckit:my-cyber-security` (`NCII`) | Pending |
| Requirements baseline (classification inheritance) | `ARC-001-REQ-v1.0` | Complete |
| MyDIGITAL positioning (commercial framing precedent) | `ARC-001-MYDIG-v1.0` | Complete |
| Architecture principles (open-core seam, security by design) | `ARC-000-PRIN-v1.0` | Complete |

---

## External References

> This section provides traceability from generated content back to source documents. The Arahan Keselamatan instrument is cited **only as the comparison the commercial operator is NOT bound by**; PDPA 2010 is the binding personal-data instrument.

### Document Register

| Doc ID | Title | URL | Verified date |
|--------|-------|-----|---------------|
| MY-PDPA | Personal Data Protection Act 2010 (Malaysia) — binding for subscriber personal data | <https://www.pdp.gov.my/> | 2026-06-05 |
| MY-ARAHAN | Arahan Keselamatan (Chief Government Security Office) — cited for comparison only; NOT binding on this commercial subject | <https://www.cgso.gov.my/> | 2026-06-05 |
| ARC-000-PRIN | ibn-core Enterprise Architecture Principles v1.0 | projects/000-global/ARC-000-PRIN-v1.0.md | 2026-06-05 |
| ARC-001-REQ | ibn-core-my Business and Technical Requirements v1.0 | projects/001-ibn-core-my/ARC-001-REQ-v1.0.md | 2026-06-05 |
| ARC-001-MYDIG | ibn-core-my MyDIGITAL National Priorities Alignment Statement v1.0 | projects/001-ibn-core-my/ARC-001-MYDIG-v1.0.md | 2026-06-05 |

### Citations

| Citation | Doc ID | Section | Used in |
|----------|--------|---------|---------|
| [PDPA-1] | MY-PDPA | Personal data handling, minimisation, residency | RESTRICTED tier; DS-009; Handling Rules |
| [AK-1] | MY-ARAHAN | Classification ladder (comparison only) | Classification Scheme comparator column |
| [REQ-1] | ARC-001-REQ | NFR-C-001 (four-tier scheme), NFR-SEC-001…006, FR-009 | Classification Scheme; Handling Rules |
| [REQ-2] | ARC-001-REQ | FR-001/003/005/007/008/010/011/012; INT-001…004; data entities | Dataset Register; Cross-Reference Index |
| [MYDIG-1] | ARC-001-MYDIG | Subject type note (commercial reframing; Generic header) | Subject type note; reframing rationale |
| [PRIN-1] | ARC-000-PRIN | Open-Core Seam Integrity; Security by Design | Handling Rules; Executive Summary |

### Unreferenced Documents

| Filename | Source Location | Reason |
|----------|-----------------|--------|
| `.arckit/recipes/my-operator.yaml` | repo `.arckit/` | Read to confirm the `MY_CLASSIFICATION` commercial-tier reframing and target type code (MYCLAS); methodological input, not a content source |
| `_partials/RENDERING.md`, `_partials/document-control-uk.md` | arckit-my plugin | Read to resolve the doc-control header to the Generic/commercial block (Malaysia block omitted); methodological input |

---

**Generated by**: ArcKit `/arckit:my-classification` command (commercial reframing via `/arckit:build` wave 3)
**Generated on**: 2026-06-05
**ArcKit Version**: 5.11.0
**Project**: ibn-core-my (Project 001)
**Model**: Claude Opus 4.8 (1M context)
