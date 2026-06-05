# Commercial Cloud Residency & Data-Sovereignty Assessment

> **Template Origin**: Community (commercially reframed) | **ArcKit Version**: 5.11.0 | **Command**: `/arckit:my-cloud-first`

> ⚠️ **Community-contributed command, commercial reframing** — ibn-core is a **commercial** open-core telecommunications enabler delivered by Vpnet Cloud Solutions Sdn. Bhd. under Systems Integration (SI) engagements, **not** a Malaysian Federal public-sector entity. The upstream `/arckit:my-cloud-first` command assesses residency against the **public-sector Cloud First policy and the MyGovCloud / PDSA (Pusat Data Sektor Awam) hybrid model**. Per the `my-operator` build recipe (`.arckit/recipes/my-operator.yaml`, precedence #1), the `MY_CLOUD_FIRST` target is deliberately **reframed to commercial cloud-residency reasoning**: ibn-core carries **no Federal mandate**, is **not bound by the Cloud First / MyGovCloud public-sector policy**, and does **not** procure through the Cloud Framework Agreement / ePerolehan. Cloud residency is instead reasoned from **MCMC regulatory expectations for telecommunications data, PDPA 2010 cross-border-transfer rules, operator data-sovereignty preferences, and Malaysian data-centre availability** (AWS / Azure / Google Cloud Malaysia regions plus operator private cloud). MyGovCloud / PDSA is referenced below **only as a comparator the operator is NOT bound by** — it would apply only where an operator serves a specific government customer under a contract that imports it. Review by qualified Malaysian compliance counsel is advised before external use.

## Document Control

| Field | Value |
|-------|-------|
| **Document ID** | ARC-001-MCRES-v1.0 |
| **Document Type** | Commercial Cloud Residency & Data-Sovereignty Assessment |
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

> **Subject type note**: This assessment applies the **Generic / commercial** document-control header, not the Malaysia Federal "Agensi" header. Per `_partials/RENDERING.md`, the Malaysia public-sector doc-control block is included only when `governance_framework` is `Malaysia Federal` **or** `classification_scheme` is `Arahan Keselamatan`. ibn-core is a commercial subject under neither condition, so the Malaysia block is omitted — consistent with `ARC-001-MYCLAS-v1.0` and `ARC-001-MYDIG-v1.0` (Subject type notes) and the project's PUBLIC posture in `ARC-000-PRIN-v1.0`, `ARC-001-REQ-v1.0`, and `ARC-001-STKE-v1.0`. Because the classification scheme is the **commercial four-tier ladder** (PUBLIC / INTERNAL / CONFIDENTIAL / RESTRICTED) inherited from `ARC-001-MYCLAS-v1.0`, this assessment evaluates residency against those tiers — **not** against Sulit / Rahsia / Rahsia Besar on-shore obligations, which bind only public-sector subjects.

## Revision History

| Version | Date | Author | Changes | Approved By | Approval Date |
|---------|------|--------|---------|-------------|---------------|
| 1.0 | 2026-06-05 | ArcKit AI | Initial creation from `/arckit:my-cloud-first` (executed via arckit-build wave 4); commercial cloud-residency reframing per `my-operator` recipe | [PENDING] | [PENDING] |

---

## Executive Summary

**ibn-core** is an open-core (Apache 2.0) RFC 9315 Intent-Based Networking framework targeting the TM Forum TMF921 Intent Management API v5.0.0, delivered commercially by Vpnet Cloud Solutions Sdn. Bhd. to Malaysian telecommunications operators (U Mobile, TM Malaysia) with private operator CAMARA adapters. The deployment is **Kubernetes + Istio and cloud-agnostic by design**: the open-core framework runs as an ODA component on any conformant cluster, and the only seam to operator-specific infrastructure is the private `McpAdapter` implementation. This assessment determines **where each dataset may physically reside** given that ibn-core is a **commercial** subject reasoning from **MCMC telco-data expectations, PDPA 2010 cross-border-transfer rules, and operator data-sovereignty preferences** — **not** from the public-sector Cloud First / MyGovCloud (PDSA) policy, which does **not** bind a commercial operator.

The residency posture follows the commercial sensitivity ladder inherited from `ARC-001-MYCLAS-v1.0`, not a government classification. **PUBLIC**-tier data (the Apache 2.0 framework, published `McpAdapter` interface, `MockMcpAdapter`, TMF921 CTK conformance evidence) carries **no residency constraint** and lives in public GitHub / CI infrastructure anywhere. **INTERNAL**-tier data (PII-masked TMF921 Intents, IntentReports, masked observability telemetry) is **flexible** but defaults to the operator's chosen Malaysian region for operational locality and to keep the Redis SSoT close to the workload. **CONFIDENTIAL**-tier data (operator 4G-5G core / OSS-BSS configuration, capability descriptors, orchestration payloads) is placed per **operator contractual residency** — typically **Malaysia-resident** to satisfy operator sovereignty preferences and MCMC sectoral expectations, and physically confined to the operator's environment / private adapter. **RESTRICTED**-tier data divides into two classes: **subscriber personal data** (PDPA 2010), which is **Malaysia-resident by default** with any cross-border transfer requiring a documented PDPA legal basis (per `ARC-001-PDPA`); and **secrets / credentials**, which never leave a secure vault / Kubernetes secret store and are **never** present in the public repository (NFR-SEC-004, BR-003).

Three Malaysian-region public CSPs (**AWS asia-southeast5 Kuala Lumpur/Johor**, **Microsoft Azure Malaysia West**, **Google Cloud Malaysia `asia-southeast1`-adjacent / Malaysia region**) plus **operator private cloud** are viable landing zones; selection is an operator-by-operator commercial decision captured in `ADR-001` (cloud platform) and `ADR-003` (residency per classification). Because ibn-core is cloud-agnostic Kubernetes + Istio, **exit and portability risk is structurally low**: the framework is CSP-neutral, state is confined to Redis + telemetry backends with standard egress paths, and lock-in is limited to whatever managed services an operator independently elects. MyGovCloud / PDSA appears in this assessment **only as a comparator the operator is not bound by**; it becomes relevant solely where an operator serves a government customer whose contract imports the public-sector policy.

## Scope

**In scope** — residency and placement of all ten datasets in the `ARC-001-MYCLAS-v1.0` register (DS-001…DS-010) as handled by the ibn-core open core and its runtime: the TMF921 API surface (`POST/GET/DELETE /api/v1/intent`), the intent processor + Claude client, the `McpAdapter` orchestration seam, the Redis Single-Source-of-Truth, and the observability pipeline.

**Shared platform components** —
- **Identity**: Keycloak (`identityconfig-operator-keycloak` realm) issuing JWTs validated by `src/auth-jwt.ts` (ODA Canvas UC007). Residency follows the operator's identity-platform placement.
- **Observability**: OTel → LangSmith (default OTLP/HTTP backend) **or** a Canvas-local collector (ODA Canvas UC006). Default LangSmith egress is a **cross-border processing path** (see Cross-Border) and is overridable to an in-region collector.
- **Backups / state**: Redis SSoT (encrypted at rest, NFR-SEC-003) and its backups follow the chosen region.
- **Secret management**: secure vault / Kubernetes secret store, co-located with the cluster, outside the public repo.

**Dependencies on other services' residency posture** — CONFIDENTIAL operator configuration (DS-007) and RESTRICTED subscriber PII (DS-009) inherit the **operator's** environment residency; ibn-core does not unilaterally relocate them. Cross-border PDPA determinations are owned by `/arckit:my-pdpa` (`ARC-001-PDPA`).

## Per-Dataset Residency Assessment

> Classification tiers are the **commercial** ladder from `ARC-001-MYCLAS-v1.0` (PUBLIC / INTERNAL / CONFIDENTIAL / RESTRICTED), **not** Arahan Keselamatan. "Required residency" derives from PDPA 2010, MCMC sectoral expectation, and operator contract — **not** from the public-sector Cloud First on-shore rule.

| Dataset ID | Classification | Required residency | Recommended placement | Region | Compliance check |
|------------|----------------|--------------------|-----------------------|--------|------------------|
| DS-001 (open-core source, `McpAdapter` interface, `MockMcpAdapter`) | PUBLIC | None — public artefact | Public GitHub + CI (CSP-agnostic) | Any | OK |
| DS-002 (TMF921 CTK conformance evidence, RFC 9315 traceability) | PUBLIC | None | Public repo / CI | Any | OK |
| DS-003 (published API & adapter contract surface) | PUBLIC | None | Public repo / API surface | Any | OK |
| DS-004 (TMF921 Intent, PII-masked — Redis SSoT) | INTERNAL | Flexible; operator-preferred | Operator-region public CSP **or** private cloud | Malaysia region (default) | OK |
| DS-005 (IntentReport / `reportState`) | INTERNAL | Flexible; follows DS-004 | Same as SSoT | Malaysia region (default) | OK |
| DS-006 (observability telemetry — OTel traces/metrics/`gen_ai.*`/`rfc9315.phase` spans) | INTERNAL | Flexible, **but** default LangSmith egress crosses border | In-region Canvas collector (preferred) **or** LangSmith (cross-border) | Malaysia region preferred | Gap (if LangSmith) — see Cross-Border |
| DS-007 (operator 4G-5G core / OSS-BSS config & orchestration payloads) | CONFIDENTIAL | Operator-contracted; MCMC sectoral | Operator environment / private adapter (private repo) | Malaysia-resident (typical) | OK |
| DS-008 (adapter capability descriptors) | CONFIDENTIAL | Operator-contracted | Operator adapter (private); mock is PUBLIC | Malaysia-resident (typical) | OK |
| DS-009 (subscriber personal data — `customerId`, raw intent text) | RESTRICTED | **Malaysia-resident by default (PDPA 2010)**; cross-border needs documented legal basis | Ingestion path only; masked before AI invocation; not persisted unmasked | Malaysia region | OK (Gap if unmasked PII egresses — fail-closed per FR-009) |
| DS-010 (secrets / credentials — CAMARA creds, Claude API key, Keycloak signing keys, agent-role tokens, K8s secrets, encryption keys) | RESTRICTED | Never in public repo; vault-resident with cluster | Secure vault / K8s secret store, co-located with cluster | Malaysia region (with cluster) | OK |

**Residency rule summary (commercial framing):** No dataset carries a *public-sector* on-shore mandate. The **binding** residency drivers are (a) PDPA 2010 for DS-009 subscriber personal data, (b) operator contract + MCMC sectoral expectation for DS-007/008 CONFIDENTIAL operator data, and (c) NFR-SEC-004 / BR-003 for DS-010 secrets. PUBLIC and INTERNAL tiers are residency-flexible, defaulting to the operator's Malaysian region for locality.

## CSP Due-Diligence Pack

> Assessed as **commercial** landing zones available to a Malaysian operator — **not** as Cloud Framework Agreement panel members for public-sector procurement. The Bumiputera-MSP / Cloud Framework Agreement columns from the public-sector template are **not applicable** to this commercial subject and are marked N/A; an operator may nonetheless prefer a local managed-service partner on commercial grounds.

| CSP | Malaysia region footprint | Local MSP model | Certification posture | Sovereign-data scope | Limitations / notes (commercial subject) |
|---|---|---|---|---|---|
| **AWS Malaysia** | Asia Pacific (Malaysia) — Kuala Lumpur / Johor region (`ap-southeast-5`) | N/A (public-sector CFA model not binding); commercial partners available | ISO 27001/27017/27018, SOC 1/2/3; PDPA-aligned DPA available | In-region data storage + EKS/Istio support; KMS for DS-010 | No public-sector PDSA obligation applies; cloud-agnostic K8s portable off it |
| **Microsoft Azure Malaysia** | Malaysia West (Greater Kuala Lumpur) | N/A (commercial) | ISO 27001/27017/27018, SOC 1/2/3; Azure PDPA DPA | In-region AKS + Key Vault for DS-010; confidential-compute options | Same — comparator only; not a government-cloud obligation |
| **Google Cloud Malaysia** | Malaysia region (Kuala Lumpur) | N/A (commercial) | ISO 27001/27017/27018, SOC 1/2/3; PDPA DPA | In-region GKE + Cloud KMS; data-residency controls | Same — comparator only |
| **Operator private cloud (U Mobile / TM)** | Operator data centres (Malaysia-resident) | Operator-owned / TM (TM is itself a CSP/data-centre operator) | Per operator certification; MCMC sectoral posture | Full sovereignty — DS-007/008/009/010 can stay wholly on-operator-premise | Highest sovereignty; placement chosen per operator contract; bulkhead-isolated per operator (NFR-A-003) |
| *(MyGovCloud / PDSA — public-sector hybrid)* | Government data centres | Public-sector only | Government assurance | Government workloads | **Comparator only — NOT binding on this commercial operator.** Applies only where an operator serves a government customer whose contract imports the Cloud First policy. |

Because the runtime is **cloud-agnostic Kubernetes + Istio**, any of the three Malaysian public-CSP regions or the operator's private cloud is technically viable; the choice is a per-operator commercial/sovereignty decision recorded in `ADR-001` and `ADR-003`.

## Shared-Responsibility Matrix

> Generic commercial shared-responsibility split for ibn-core on a Malaysian-region public CSP (Kubernetes + Istio). On operator private cloud, the operator additionally assumes the Provider column.

| Layer | Provider (CSP) responsibility | Entity (Vpnet / operator) responsibility |
|-------|-------------------------------|-------------------------------------------|
| Infrastructure | Physical DC, compute/storage/network, region isolation, hardware | Region selection (Malaysia), VPC/subnet design, availability-zone spread |
| Platform | Managed K8s control plane, host OS patching (managed nodes), managed Redis (if used) | Istio mesh config, mTLS (NFR-SEC-003), HPA / circuit breakers, namespace bulkheads (NFR-A-003) |
| Application | — | ibn-core TMF921 API, intent processor, `McpAdapter` seam, open-core integrity (BR-003) |
| Data | At-rest encryption primitives, durable storage | Classification handling (MYCLAS), PII masking (FR-009), SSoT placement, retention, DS-009 residency |
| Identity | IAM for cloud control plane | Keycloak realm, JWT validation (`src/auth-jwt.ts`), agent-role least privilege (FR-007) |
| Operations | Hardware/region monitoring, CSP SLAs | App observability (OTel/UC006), audit-log integrity (NFR-C-002), secret rotation (DS-010), incident response |

## Exit & Portability Plan

**Structural portability (low lock-in):** ibn-core is **cloud-agnostic Kubernetes + Istio** with no hard dependency on any single CSP's proprietary services. The application layer is fully portable across the four candidate landing zones.

- **Data egress** — INTERNAL state lives in Redis (SSoT) + the telemetry backend; both have standard export/dump egress paths. CONFIDENTIAL operator data (DS-007/008) never leaves the operator environment, so its portability is the operator's own concern. RESTRICTED secrets (DS-010) are re-issued into the destination vault, not migrated.
- **Lock-in risks** — limited to any **managed** services an operator independently elects (managed Redis, managed K8s add-ons, LangSmith for DS-006). Mitigation: prefer in-cluster/self-hosted equivalents (e.g. Canvas-local OTel collector over LangSmith) where sovereignty or portability is prioritised.
- **Exit triggers** — operator contract termination, a change in MCMC sectoral expectation, a PDPA cross-border determination forcing DS-006 telemetry in-region, or a CSP certification lapse. On any trigger: redeploy the cluster to the destination region, restore Redis SSoT, re-issue DS-010 secrets, repoint OTLP egress. Estimated exit window: days, not months, given CSP-neutrality.
- **No MyGovCloud exit dependency** — because this commercial subject is not on MyGovCloud / PDSA, there is no public-sector-cloud exit obligation to satisfy.

## Cross-Border

The one structural cross-border processing path is **DS-006 observability telemetry** when the default **LangSmith** OTLP/HTTP backend is used (ODA Canvas UC006): traces/metrics/`gen_ai.*` spans egress to a non-Malaysian endpoint. This is **flexible by design** — the backend is overridable to an **in-region Canvas-local collector**, which removes the cross-border path entirely. Telemetry must carry **no unmasked subscriber PII** (FR-009), so even on the LangSmith path no DS-009 personal data should transit the border; if masking were to fail, processing fails closed.

A secondary path is the **Anthropic Claude** model invocation (INT-002): subscriber intent text is **masked before invocation** (FR-009), so the data leaving for translation is de-identified.

Any residual cross-border transfer of DS-009 subscriber personal data requires a **documented PDPA 2010 legal basis**. That determination is owned by **`/arckit:my-pdpa`** (`ARC-001-PDPA`) and the **`/arckit:dpia`** assessment — cross-referenced here, not decided here.

## Cross-Reference & Hand-offs

| Concern | Owning artefact / command | Status |
|---|---|---|
| Cloud platform & placement decision (private / public CSP / hybrid) | `ADR-001` (`/arckit:adr`) | Pending |
| Data residency per commercial classification | `ADR-003` (`/arckit:adr`) | Pending |
| PDPA 2010 cross-border transfer legal basis (DS-009) | `/arckit:my-pdpa` (`PDPA`), `/arckit:dpia` (`DPIA`) | Pending |
| Commercial data-sensitivity register (residency inputs) | `ARC-001-MYCLAS-v1.0` | Complete |
| NACSA NCII (telecommunications sector) controls | `/arckit:my-cyber-security` (`NCII`) | Pending |
| Requirements baseline (NFR-C-001, NFR-SEC-003/004, FR-009) | `ARC-001-REQ-v1.0` | Complete |
| MyDIGITAL positioning (commercial framing precedent) | `ARC-001-MYDIG-v1.0` | Complete |
| Architecture principles (open-core seam, security by design) | `ARC-000-PRIN-v1.0` | Complete |

---

## External References

> This section provides traceability from generated content back to source documents. The MyGovCloud / Cloud First public-sector policy is cited **only as the comparator the commercial operator is NOT bound by**; PDPA 2010 and MCMC sectoral expectation are the binding residency drivers.

### Document Register

| Doc ID | Title | URL | Verified date |
|--------|-------|-----|---------------|
| MY-CLOUDFIRST | Public Sector Cloud Computing / Cloud First policy & MyGovCloud (PDSA, Jabatan Digital Negara) — cited for comparison only; NOT binding on this commercial subject | <https://www.malaysia.gov.my/portal/content/31183> | 2026-06-05 |
| MY-PDPA | Personal Data Protection Act 2010 (Malaysia) — binding for DS-009 subscriber personal data residency & cross-border transfer | <https://www.pdp.gov.my/> | 2026-06-05 |
| MY-MCMC | Malaysian Communications and Multimedia Commission (MCMC) — sectoral regulator; telco-data expectations | <https://www.mcmc.gov.my/> | 2026-06-05 |
| ARC-000-PRIN | ibn-core Enterprise Architecture Principles v1.0 | projects/000-global/ARC-000-PRIN-v1.0.md | 2026-06-05 |
| ARC-001-REQ | ibn-core-my Business and Technical Requirements v1.0 | projects/001-ibn-core-my/ARC-001-REQ-v1.0.md | 2026-06-05 |
| ARC-001-MYCLAS | ibn-core-my Commercial Data-Sensitivity Classification Register v1.0 | projects/001-ibn-core-my/ARC-001-MYCLAS-v1.0.md | 2026-06-05 |
| ARC-001-MYDIG | ibn-core-my MyDIGITAL National Priorities Alignment Statement v1.0 | projects/001-ibn-core-my/ARC-001-MYDIG-v1.0.md | 2026-06-05 |

### Citations

| Citation | Doc ID | Section | Used in |
|----------|--------|---------|---------|
| [CF-1] | MY-CLOUDFIRST | Cloud First / MyGovCloud residency model (comparison only) | CSP Due-Diligence Pack (comparator row); Executive Summary |
| [PDPA-1] | MY-PDPA | Personal-data residency & cross-border transfer | Per-Dataset (DS-009); Cross-Border |
| [MCMC-1] | MY-MCMC | Telecommunications sectoral data expectations | Per-Dataset (DS-007/008); Executive Summary |
| [CLAS-1] | ARC-001-MYCLAS | Dataset register DS-001…DS-010; commercial four-tier ladder | Per-Dataset Residency Assessment |
| [REQ-1] | ARC-001-REQ | NFR-C-001, NFR-SEC-003/004, FR-009, NFR-A-003, BR-003 | Shared-Responsibility; Handling; Cross-Border |
| [MYDIG-1] | ARC-001-MYDIG | Commercial reframing precedent (Generic header) | Subject type note |
| [PRIN-1] | ARC-000-PRIN | Open-Core Seam Integrity; Security by Design | Shared-Responsibility; Exit & Portability |

### Unreferenced Documents

| Filename | Source Location | Reason |
|----------|-----------------|--------|
| `.arckit/recipes/my-operator.yaml` | repo `.arckit/` | Read to confirm the `MY_CLOUD_FIRST` commercial cloud-residency reframing and target type code (MCRES); methodological input, not a content source |
| `_partials/RENDERING.md`, `_partials/document-control-uk.md` | arckit-my plugin | Read to resolve the doc-control header to the Generic/commercial block (Malaysia block omitted); methodological input |

---

**Generated by**: ArcKit `/arckit:my-cloud-first` command (commercial reframing via `/arckit:build` wave 4)
**Generated on**: 2026-06-05
**ArcKit Version**: 5.11.0
**Project**: ibn-core-my (Project 001)
**Model**: Claude Opus 4.8 (1M context)
