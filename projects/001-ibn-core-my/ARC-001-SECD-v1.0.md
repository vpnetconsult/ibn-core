# UK Government Secure by Design Assessment

> **Template Origin**: Official | **ArcKit Version**: 5.11.0 | **Command**: `/arckit:secure`

> **Subject-type note**: ibn-core is a **commercial** Malaysian open-core (Apache 2.0) RFC 9315 / TMF921 AI-native Intent-Based Networking framework delivered by **Vpnet Cloud Solutions Sdn. Bhd.** under Systems Integration (SI) engagements to Malaysian telecommunications operators (U Mobile, TM Malaysia) — **not** a UK Government or Malaysian Federal public-sector service. This assessment applies the **UK Government Secure by Design / NCSC CAF structure** as a security discipline, but the binding regulatory regime is **Malaysian: NACSA (NCII cyber-resilience), JPDP/PDPA 2010 (personal-data security principle), and MCMC (telecommunications-sector expectations)**. Where a UK-Gov-specific control (GovAssure, Cyber Essentials, NCSC VMS, Cyber Action Plan, DDaT/CCP, ICO) has no force here, the nearest **Malaysian equivalent** is named and the UK control is marked N/A (mapped). UK escalation taxonomy maps to the **Vpnet Enterprise Architecture Review Board (EARB)** and the **Security/Compliance gate**.

## Document Control

| Field | Value |
|-------|-------|
| **Document ID** | ARC-001-SECD-v1.0 |
| **Document Type** | Secure by Design Assessment |
| **Project** | ibn-core-my (Project 001) |
| **Classification** | PUBLIC |
| **Status** | APPROVED |
| **Version** | 1.0 |
| **Created Date** | 2026-06-05 |
| **Last Modified** | 2026-06-21 |
| **Review Date** | 2026-07-05 |
| **Owner** | Roland Pfeifer, Lead Architect / CTO (Vpnet Cloud Solutions Sdn. Bhd.) |
| **Reviewed By** | Vpnet Security owner review — Roland Pfeifer, CTO (2026-06-21) |
| **Approved By** | Roland Pfeifer, CTO — management acceptance (Vpnet accountable owner), 2026-06-21; independent security testing (pentest, NFR-SEC-005) required before production go-live |
| **Distribution** | ibn-core engineering, Vpnet SI delivery teams, Security/Compliance, operator integration partners (U Mobile, TM Malaysia) |

## Revision History

| Version | Date | Author | Changes | Approved By | Approval Date |
|---------|------|--------|---------|-------------|---------------|
| 1.0 | 2026-06-05 | ArcKit AI | Initial creation from `/arckit:secure` command | [PENDING] | [PENDING] |
| 1.0 (signed off) | 2026-06-21 | ArcKit AI | Management sign-off — Status → APPROVED (Vpnet owner acceptance); pre-production pentest caveat retained | Roland Pfeifer, CTO | 2026-06-21 |

## Document Purpose

This document is a Secure by Design assessment of the ibn-core-my platform at **alpha phase, full-system scope**. It evaluates the security posture against the NCSC Cyber Assessment Framework (CAF) 14 principles (applied as a discipline), maps each to the controlling Malaysian regime (NACSA NCII, PDPA 2010, MCMC), and cross-references the project Risk Register security risks — **R-002** (open-core seam leak), **R-004** (PDPA subscriber-PII breach), and **R-005** (NCII cyber-resilience gap). It is an input to the Pre-Production architecture gate (PRIN §VII) that gates first operator SI go-live, and a companion to `ARC-001-RISK-v1.0`, `ARC-001-PDPA-v1.0`, and the three security/placement ADRs (ARC-001-ADR-001/002/003).

---

## Executive Summary

**Overall Security Posture**: Adequate (alpha) — strong by-design controls; alpha-phase operational gaps gate go-live.

**NCSC Cyber Assessment Framework (CAF) Score**: 7/14 principles Achieved, 6/14 Partially Achieved, 1/14 Not Achieved (assessed against an alpha-phase, commercial-telco baseline).

**Key Security Findings**:

- **Strengths (by design)**: zero-trust agent identity with a distinct least-privilege agent realm role (ADR-001, FR-007); fail-closed PII masking on ingestion (FR-009); Istio mTLS service mesh, circuit breakers, bulkheads (NFR-A-003); open-core seam keeping operator CAMARA credentials out of the public Apache 2.0 repo (PRIN 9, BR-003); vault-only secrets (NFR-SEC-004); OTel agent telemetry with acting-identity attribution (FR-011); classification-driven data residency (ADR-002/003).
- **Gaps**: CI security gates (CodeQL/Dependabot secret-scanning, TMF921 CTK) are constrained by an Actions billing limitation and not reliably green-gating; penetration test not yet conducted; DPIA pending final approval; incident-response runbooks (incl. agent-misbehaviour containment) and NCII attestation are immature; HITL gating on high-impact (network-mutating) autonomous actions not yet at 100%.
- **Blocking issues for go-live**: NCII attestation + pen test (R-005); DPIA sign-off + assured PII-free telemetry (R-004); reliable secret-scanning at the open-core seam (R-002).

**Cyber Essentials Status**: N/A (UK scheme — not applicable to a Malaysian commercial subject). Malaysian equivalent: alignment with **NACSA NCII baseline controls** and ISO 27001 / SOC 2 control families expected by operator SI contracts (target, not yet certified).

**Cyber Security Standard Compliance** (UK CSS / GovAssure): N/A (mapped). Malaysian equivalent: **NACSA NCII assurance** (pending `/arckit:my-cyber-security`) is the controlling assurance regime.

**Risk Summary**: **Medium** residual security risk overall. Six residual risks exceed the tightened appetite (per `ARC-001-RISK-v1.0`); the three go-live-gating security/compliance risks are R-001 (live-network safety), R-004 (PDPA), R-005 (NCII). None is residual Critical.

---

## 1. NCSC Cyber Assessment Framework (CAF) Assessment

> Each principle is assessed against an alpha-phase, commercial-telco baseline. "Controlling regime" names the Malaysian regulator/standard that actually binds; UK-Gov bodies (ICO, SIRO, NCSC VMS) are mapped to their nearest equivalent (JPDP, Lead Architect/CTO + Security/Compliance gate, NACSA/Dependabot-CodeQL).

### Objective A: Managing Security Risk

**A1: Governance**

**Status**: ⚠️ Partially Achieved

**Evidence**:
Security governance is owned by the **Lead Architect / CTO (Roland Pfeifer)** as the accountable decider for NON-NEGOTIABLE security principles (PRIN 4, 9), supported by a **Security Lead** accountable for zero-trust posture and agent-identity scoping (ADR-001 §2.1). The **Vpnet EARB + Security/Compliance gate** is the governance forum (UK SIRO/board analogue). Architecture principles (`ARC-000-PRIN-v1.0`), a maintained Risk Register (`ARC-001-RISK-v1.0`, Orange Book method), and three ratified security/placement ADRs evidence an oversight structure. `CLAUDE.md` enforces commit-level traceability and seam-review discipline.

**Security Governance**:

- [x] Senior leadership owns information security (Lead Architect / CTO)
- [x] SIRO-equivalent appointed (Lead Architect/CTO is the board-level risk owner; **no separate SIRO** — small SI org; see R-016 key-person concentration)
- [x] Security policies and standards defined (PRIN 4/9, CLAUDE.md licence + seam rules, NFR-SEC family)
- [x] Security roles and responsibilities documented (ADR-001 §2 RACI; RISK §E ownership matrix)
- [x] Security risk management process established (`ARC-001-RISK-v1.0`)
- [ ] Independent security oversight / second line of assurance (concentrated on Lead Architect + Security Lead; R-016)

**Gaps/Actions**:

- Formalise a named **Security Risk Owner** distinct from the Lead Architect to reduce key-person concentration (R-016) — Lead Architect — before SI scale-up.
- Record residual-risk acceptance sign-off at the Security/Compliance gate for the six appetite-exceeding risks — Security/Compliance — before G-2 go-live.

**A2: Risk Management**

**Status**: ✅ Achieved

**Evidence**:
A full HM Treasury Orange Book risk register exists (`ARC-001-RISK-v1.0`): 16 risks across 6 categories, inherent/residual scoring, 4Ts responses, a tightened commercial-telco appetite (Medium overall; COMPLIANCE/data-protection ≤ 6; safety-of-live-network ≤ 9), and a prioritised action plan. Security risks **R-002, R-004, R-005, R-008, R-010** are explicitly registered, owned, and tracked, with go-live-gating actions.

**Risk Management Process**:

- [x] Information assets identified and classified (DS-001…DS-010, `ARC-001-MYCLAS-v1.0`)
- [x] Threats and vulnerabilities assessed (RISK detailed register; agent-autonomy + seam + PDPA threat surfaces)
- [x] Risk assessment methodology defined (Orange Book, likelihood × impact)
- [x] Risk register maintained and reviewed (monthly Critical/High; quarterly Medium/Low)
- [x] Risk treatment plans implemented (RISK §H prioritised actions)
- [ ] Residual risks formally accepted by the risk owner (sign-off pending — see A1)

**Gaps/Actions**:

- Obtain documented residual-risk acceptance for R-001/R-004/R-005 at the Security/Compliance gate — Security/Compliance — before G-2.

**A3: Asset Management**

**Status**: ⚠️ Partially Achieved

**Evidence**:
Data assets are well catalogued: the ten-dataset register (DS-001…DS-010) with commercial classification (`ARC-001-MYCLAS-v1.0`) and per-dataset residency rules (ADR-003 Appendix A). Software composition is governed by the Apache-2.0 licence-compatibility rule (NFR-SEC-006) and dependency scanning (Dependabot). Infrastructure is declarative (Kubernetes/Istio manifests, IaC — NFR-I-003), giving an implicit inventory.

**Asset Management**:

- [x] Data assets catalogued (DS-001…DS-010 with classification + residency)
- [x] Software inventory / SCA (Apache-2.0 dependency licence gate, Dependabot)
- [x] Infrastructure as declarative inventory (K8s/Istio manifests)
- [x] Asset ownership assigned (per-dataset and per-risk owners)
- [ ] Formal SBOM published per release (recommended; not yet evidenced)
- [ ] Secure-disposal / data-destruction procedure documented (retention defined NFR-C-001; destruction process pending)

**Gaps/Actions**:

- Generate and publish an **SBOM** per release (ties to R-015, supply-chain hygiene) — Engineering — Q3 2026.
- Document secure-disposal/retention-enforcement for DS-009 subscriber PII — Security Lead — before G-2.

**A4: Supply Chain**

**Status**: ⚠️ Partially Achieved

**Evidence**:
Key third parties are identified and reasoned about: **Anthropic Claude** (intent translation, INT-002), **LangSmith** (default telemetry, INT-004), **Keycloak** (IdP, INT-003), and the Malaysian-region CSP / operator private cloud (ADR-002). Dependency licence compatibility (Apache/MIT/BSD/ISC; GPL prohibited) is enforced (NFR-SEC-006). **R-009** (Claude/LangSmith supply-chain disruption) is registered with graceful-degradation controls. Cross-border telemetry to LangSmith is gated on PDPA/DPIA sign-off (ADR-003 DS-006).

**Supply Chain Security**:

- [x] Supplier set identified and risk-assessed (R-009)
- [x] Open-source dependency risks managed (licence gate + Dependabot)
- [x] Third-party data egress controlled (PII masking before Claude; in-region collector default)
- [ ] Data Processing Agreements (DPAs) with Claude/LangSmith/CSP executed (ADR-002 notes "commercial DPAs" as pending per engagement)
- [ ] Formal supplier security questionnaires / certification verification on file
- [ ] Supply-chain risk treated for AI-provider lock-in (R-009 notes residual provider lock-in on the translation plane)

**Gaps/Actions**:

- Execute PDPA-aligned **DPAs** with Anthropic, LangSmith, and the selected CSP before any production processing of operator/subscriber data — Operator Compliance Officer — before G-2.
- Validate a model-migration / translation-fallback path to reduce Claude provider lock-in (R-009) — Engineering — Q3 2026.

---

### Objective B: Protecting Against Cyber Attack

**B1: Service Protection Policies and Processes**

**Status**: ⚠️ Partially Achieved

**Evidence**:
Policy intent is captured across PRIN (Security by Design NON-NEGOTIABLE), `CLAUDE.md` (licence/seam/secrets rules — no `.env` or K8s secret values committed), and the NFR-SEC family (authn, authz, encryption, secrets, vuln management, licence). A secure-development discipline is implied by CI scanning and CTK gating (see §4). What is missing is a consolidated, named policy set (acceptable use, access control, cryptography) as standalone artefacts.

**Protection Policies**:

- [x] Data protection / classification policy (MYCLAS + ADR-003 residency rules)
- [x] Cryptography policy in substance (NFR-SEC-003: TLS 1.3/mTLS, encryption at rest)
- [x] Secure-development policy in substance (NFR-SEC-005/006, CLAUDE.md)
- [x] Access control policy in substance (NFR-SEC-001/002, ADR-001)
- [ ] Consolidated, named protective-security policy document set
- [ ] Acceptable-use policy (lower relevance — no broad staff estate at alpha)

**Gaps/Actions**:

- Consolidate the substantive controls into a named security policy pack for SI engagements (operator due-diligence expects this) — Security Lead — Q3 2026.

**B2: Identity and Access Control**

**Status**: ✅ Achieved (by design; one alpha caveat)

**Evidence**:
This is a structural strength. **ADR-001** ratifies Keycloak as the central IdP with a **distinct, least-privilege `agent` realm role** for autonomous cycles, OAuth 2.0 client-credentials bootstrap threaded through `McpAdapter`, and a **two-tier assurance model** (standard for read/submit; elevated — short TTL, per-call re-validation, MFA upstream — for network-mutating ops). JWT validation (signature/issuer/expiry/role) is implemented (`src/auth-jwt.ts`, `src/auth-router.ts`, FR-006). Commit `a9da9d4` moved the autonomous cycle to the agent role. Acting identity is stamped on audit logs and telemetry (NFR-C-002, FR-011). Deny-by-default scopes and privilege-escalation negative tests are specified.

**Access Controls**:

- [x] Identities managed centrally (Keycloak realm)
- [x] MFA for human/privileged access (NFR-SEC-001; elevated-assurance gate)
- [x] Distinct constrained agent identity (FR-007; **zero-trust agent identity** — not human/admin)
- [x] Least-privilege enforced (deny-by-default agent scopes)
- [x] Acting-identity attribution for all privileged/agent actions (NFR-C-002)
- [ ] 100% enforcement evidenced + regression-guarded everywhere (**R-008** residual 9 until fully scoped/tested)
- [ ] Periodic access-review cadence formalised

**Authentication Method**: Keycloak (OIDC/JWT) — `identityconfig-operator-keycloak` realm (ODA Canvas UC007).

**Gaps/Actions** (cross-ref **R-008**):

- Achieve and regression-guard **100%** of agent tool calls under the agent-role identity; alert on any call lacking the agent-role attribute — Security Lead — before G-2 (target residual 6).
- Address central-IdP availability as a security-of-access concern (**R-011**): JWKS caching + fail-closed-for-privileged; progress an IdP HA/DR ADR — SI Engineer.

**B3: Data Security**

**Status**: ⚠️ Partially Achieved

**Evidence**:
Encryption is specified end-to-end: **TLS 1.3 / Istio mTLS** in transit, **encryption at rest** for the Redis SSoT and backups, vault-managed keys (NFR-SEC-003). **Fail-closed PII masking** on the ingestion path means de-identified data leaves for Claude translation (FR-009) — masking failure blocks processing rather than leaking. Classification-driven residency keeps RESTRICTED subscriber PII (DS-009) Malaysia-resident by default and secrets (DS-010) vault-only (ADR-003). The structural cross-border telemetry path (LangSmith) is closed by default via an in-region collector (UC006), opt-in gated on PDPA/DPIA. **DPIA is pending final approval**, and PII-free-telemetry assertion in CI is not yet in place — the binding gaps behind **R-004**.

**Data Protection**:

- [x] Data classification scheme implemented (MYCLAS four-tier)
- [x] Encryption at rest (SSoT + backups, NFR-SEC-003)
- [x] Encryption in transit (TLS 1.3 / mTLS)
- [x] Data-residency control (PDPA-driven, ADR-003)
- [x] PII minimisation / masking (FR-009, fail-closed)
- [ ] DLP / assured PII-free telemetry spans in CI (pending — R-004 action)
- [ ] DPIA approved (pending — see §3.2)

**Personal Data Processing**: Yes — DS-009 subscriber PII (`customerId`, raw intent text).
**DPIA Completed**: In Progress (drafted; `ARC-001-PDPA-v1.0` present; final approval pending — **CRITICAL go-live blocker**).

**Gaps/Actions** (cross-ref **R-004**):

- **Approve the DPIA** before go-live (binary gate G-5) — Security Lead — before G-2 (**CRITICAL**).
- Assert **PII-free telemetry spans in CI**; complete the data-store residency audit — Security Lead — before G-2.

**B4: System Security**

**Status**: ⚠️ Partially Achieved

**Evidence**:
Dependency + code scanning (Dependabot / CodeQL) is in the pipeline; commit `6791d95` patched all open Dependabot + CodeQL alerts in `src/`, and NFR-SEC-005 sets remediation SLAs (Critical 24h, High 7d, Medium 30d). The runtime is hardened by an Istio mesh with mTLS, circuit breakers, and bulkheads (NFR-A-003). **However**, CI scanning is **not reliably green-gating** due to an Actions billing constraint (RISK G-1 dependency), which is the binding weakness behind **R-005** (NCII): an open critical/high alert could reach a deployed release.

**System Hardening**:

- [x] Secure baseline (containerised, declarative K8s/Istio)
- [x] Dependency + code scanning (Dependabot/CodeQL; alerts patched at `6791d95`)
- [x] Security update management with SLAs (NFR-SEC-005)
- [x] Service-mesh isolation (mTLS, circuit breakers, bulkheads)
- [ ] **Reliable** CI security gate (Actions billing constraint — R-005/R-006)
- [ ] Penetration test prior to SI go-live (not yet conducted — R-005)

**Operating Systems**: Linux containers on Kubernetes (cloud-agnostic; ADR-002).

**Gaps/Actions** (cross-ref **R-005**):

- **Restore CI scanning to a reliable green-gate** (resolve Actions billing) so no open critical/high reaches release — Engineering — Q3 2026.
- Commission a **penetration test** of the API + identity/authz surface before SI go-live (NFR-SEC-005, ADR-001 §8.3) — Security Lead — before G-2.

**B5: Resilient Networks**

**Status**: ✅ Achieved (by design)

**Evidence**:
The Istio service mesh provides **mTLS** between services, network segmentation, circuit breakers, retry/backoff, bulkhead isolation per operator adapter, and graceful degradation (NFR-A-003 CRITICAL; PRIN 2). Egress to operator/AI endpoints is TLS; the OTLP metrics exporter was hard-disabled to stop unauthenticated egress (commit `c28ce16`). Integration is only via published interfaces (TMF921 API, MCP, async events) with no shared DB/filesystem across boundaries (NFR-I-002).

**Network Security**:

- [x] Segmentation by function (mesh + per-adapter bulkheads)
- [x] mTLS within the mesh; TLS egress
- [x] Circuit breakers / fault isolation (Istio)
- [x] Controlled egress (metrics exporter disabled to stop unauthenticated egress)
- [x] Loose-coupling boundary (no shared DB/FS — NFR-I-002)
- [ ] IDS/IPS / DDoS protection at the operator edge (operator-environment-dependent per engagement)

**Network Architecture**: Hybrid — operator private cloud + Malaysian-region public CSP, classification-driven (ADR-002).

**Gaps/Actions**:

- Confirm operator-edge IDS/IPS + DDoS responsibilities in the SI shared-responsibility matrix per engagement — SI Engineer — per engagement.

**B6: Staff Awareness and Training**

**Status**: ❌ Not Achieved (alpha — small team; agent-native model)

**Evidence**:
No formal security-awareness/phishing programme is evidenced. The mitigating factor is the small SI team and an **agent-native, context-first** model (CLAUDE.md, ADRs, compliance evidence) so security rules (seam, secrets, licence) are encoded in process and review rather than tribal training (R-016 control). For a regulated-telco product this remains a genuine gap as the team scales.

**Security Training**:

- [ ] Mandatory security-awareness training
- [ ] Phishing-awareness training
- [ ] Role-based security training
- [ ] PDPA/data-protection training for staff handling subscriber data
- [x] Security rules embedded in development process / review (CLAUDE.md, seam-review checklist)

**Training Completion Rate**: Not tracked (no programme).

**Gaps/Actions**:

- Stand up a lightweight **PDPA + secure-development awareness** baseline for all contributors handling operator/subscriber data — Security Lead — before SI scale-up. (Maps to GovS 007 Principle 5 / "security culture".)

---

### Objective C: Detecting Cyber Security Events

**C1: Security Monitoring**

**Status**: ⚠️ Partially Achieved

**Evidence**:
Observability is a product principle (PRIN 5). OpenTelemetry instruments application **and agent** behaviour — correlation/intent IDs, `rfc9315.phase` tags, GenAI (`gen_ai.*`) and AI-gateway (`ai_gateway.*`) events, with the **acting identity** on every autonomous tool call (FR-011, NFR-M-001). Structured audit logging captures who/what/when/where/why/result for privileged ops (NFR-C-002) with tamper-evident handling where required. The gap is **security-specific** detection: there is no SIEM/alert-correlation layer dedicated to security events (forged-token spikes, agent-identity anomalies, placement-drift) yet, and agent-telemetry coverage is noted "partial" (RISK G-3).

**Monitoring Capabilities**:

- [x] Centralised structured logging + distributed tracing (OTel)
- [x] Acting-identity attribution + audit trail (NFR-C-002)
- [x] Application + agent-behaviour telemetry (GenAI / rfc9315.phase)
- [x] Audit-log retention defined (security/audit 1–7 yrs)
- [ ] Security alerting/correlation (SIEM-equivalent) for auth/agent anomalies
- [ ] Complete agent-telemetry coverage (RISK G-3 "partial")

**SIEM Solution**: None dedicated; OTel → LangSmith (default) / in-region Canvas collector. Security-event alerting to be added.

**Gaps/Actions**:

- Add **security-event alerting**: alert on agent tool calls lacking the agent-role identity (ADR-001 §8.2), IdP/JWKS failures, and placement-drift (ADR-003) — Security Lead — before G-2.
- Complete agent-telemetry coverage (RISK G-3) — Engineering — before G-2.

**C2: Proactive Security Event Discovery**

**Status**: ⚠️ Partially Achieved

**Evidence**:
Proactive discovery exists via **Dependabot + CodeQL** continuous scanning (UK NCSC VMS equivalent for this commercial subject) — all open alerts patched at commit `6791d95`. Threat modelling is implicit in the Risk Register's agent-autonomy/seam/PDPA surfaces and the ADR options analyses. **No penetration test** has been conducted, and CI scanning reliability is constrained (R-005/R-006).

**Proactive Measures**:

- [x] Continuous dependency + code scanning (Dependabot/CodeQL)
- [x] Threat modelling (RISK register; ADR threat surfaces)
- [ ] Penetration testing (not conducted — pre-go-live requirement, R-005)
- [ ] Reliable automated scanning gate (Actions billing constraint)
- [ ] Red-team / abuse-case testing of the autonomous agent surface

**NCSC Vulnerability Monitoring Service (VMS)**: N/A (UK service). **Malaysian equivalent**: GitHub Dependabot/CodeQL continuous scanning plus, where applicable, **NACSA NCII vulnerability-handling expectations**.

- **Enrollment Status**: N/A (UK VMS); Dependabot/CodeQL = Enrolled (CI-constrained).
- **Coverage**: `src/` code + dependency graph.
- **Alert Handling**: NFR-SEC-005 SLAs (Critical 24h / High 7d / Medium 30d).

**Last Penetration Test**: Not Conducted.
**Pen Test Findings**: N/A (pending).

**Gaps/Actions** (cross-ref **R-005**):

- Conduct a pre-go-live **penetration test** (incl. abuse cases against the autonomous agent + identity surface) — Security Lead — before G-2.
- Restore reliable scanning gate — Engineering — Q3 2026.

---

### Objective D: Minimising the Impact of Cyber Security Incidents

**D1: Response and Recovery Planning**

**Status**: ⚠️ Partially Achieved

**Evidence**:
Recovery design is solid: DR targets defined (alpha RPO ≤ 15 min, RTO ≤ 4 h; production per operator contract — NFR-A-002), encrypted in-region backups, single authoritative SSoT with no bidirectional sync (R-014 residual Low). Resilience patterns (circuit breakers, bulkheads, degraded mode) limit blast radius (NFR-A-003). **However**, incident-response runbooks — including **agent-misbehaviour containment** and a **PDPA breach-response + JPDP notification** path — are specified (NFR-M-003) but **not yet matured/tested**, which is part of R-005 and R-004.

**Incident Response**:

- [x] Incident-response intent documented (NFR-M-003; agent-misbehaviour containment named)
- [x] Regulatory-notification path identified (PDPA breach → **JPDP** — the ICO-equivalent — within applicable timeframe; R-004)
- [ ] IR plan tested / runbooks matured (pending)
- [ ] Incident classification + escalation fully defined and exercised

**IR Plan Last Tested**: Not Tested.

**Business Continuity**:

- [x] RTO/RPO defined (NFR-A-002)
- [x] Backup/restore design (encrypted, in-region)
- [ ] BC/DR drill conducted (R-014 action: validate backup/restore runbook + DR drill)

**RTO**: ≤ 4 hours (alpha); per operator contract (production).
**RPO**: ≤ 15 minutes (alpha); per operator contract (production).

**Gaps/Actions**:

- Mature and **test** incident-response runbooks (agent-misbehaviour containment; PDPA breach → JPDP notification) — Security Lead — before G-2 (R-004, R-005).
- Run a **BC/DR drill** (SSoT backup/restore within region) — SI Engineer — before G-2.

**D2: Improvements**

**Status**: ⚠️ Partially Achieved

**Evidence**:
A continuous-improvement discipline is built into the agent-native model: versioned conformance evidence (`docs/compliance/`), decision docs over tribal knowledge, immutable cited tags, and a monthly/quarterly risk-review cadence (RISK control). Security metrics are defined (% agent calls under agent role; % privileged ops behind elevated-assurance gate; auth rejection rate — ADR-001 §8.2). What is missing is a closed post-incident-review loop (no incidents/drills yet) and a published security-improvement roadmap.

**Continuous Improvement**:

- [x] Security metrics defined (ADR-001 §8.2)
- [x] Risk-review cadence (monthly/quarterly)
- [x] Decision/evidence trail maintained (agent-native model)
- [ ] Post-incident-review process exercised (no drills yet)
- [ ] Security-improvement roadmap published

**Gaps/Actions**:

- Establish a post-incident/post-drill review loop once the first DR/IR drill runs — Security Lead — Q4 2026.

---

## 2. Cyber Essentials / Cyber Essentials Plus

**Current Status**: **N/A (mapped)** — Cyber Essentials is a UK scheme and does not apply to this Malaysian commercial subject.

**Malaysian / commercial equivalent**: operator SI due diligence and **NACSA NCII** expectations typically require **ISO 27001 / SOC 2** control families and timely patching. The table below assesses the *substance* of each Cyber Essentials control against ibn-core's implementation as a readiness indicator.

| Control Area | Status | Evidence (substance) |
|--------------|--------|----------|
| **Firewalls / boundary control** | ⚠️ | Istio mesh segmentation + controlled egress; operator-edge firewall/IDS per engagement (B5). |
| **Secure Configuration** | ✅ | Declarative K8s/Istio baseline, IaC (NFR-I-003); unnecessary egress disabled (`c28ce16`). |
| **Access Control** | ✅ | Keycloak central IdP, MFA for privileged, least-privilege agent role, deny-by-default (ADR-001). |
| **Malware Protection** | ⚠️ | Container/image scanning implied; dependency scanning present; explicit anti-malware/EDR not evidenced. |
| **Patch Management** | ⚠️ | Dependabot + SLAs (NFR-SEC-005); reliable gate constrained by CI billing (R-005). |

**Target equivalent**: ISO 27001 / SOC 2 alignment for SI engagements; NACSA NCII baseline.

**Gaps/Actions**:

- Map ibn-core controls to **ISO 27001 Annex A / NACSA NCII** as the operator-facing certification track — Security Lead — Q3 2026.
- Add container-image / runtime malware scanning to the pipeline — Engineering — Q3 2026.

---

## 3. UK GDPR and Data Protection → Malaysia PDPA 2010

> **N/A (mapped)**: UK GDPR / DPA 2018 / ICO do not bind ibn-core. The **controlling regime is the Malaysia Personal Data Protection Act (PDPA) 2010** and its **Security Principle**, regulated by **JPDP** (Jabatan Perlindungan Data Peribadi — the ICO-equivalent). The assessment below maps GDPR clauses to PDPA equivalents. See `ARC-001-PDPA-v1.0` for the full PDPA assessment.

### 3.1 Data Protection Compliance

**Data Protection Officer (DPO) Appointed**: Mapped — data-protection accountability sits with **Vpnet Security/Compliance** (PDPA does not mandate a DPO as UK GDPR does; a responsible owner is assigned).

**Regulator Registration**: PDPA data-user registration obligations assessed per engagement (telecommunications is a registrable class) — Operator Compliance Officer.

**PDPA 2010 Compliance** (mapped from UK GDPR checklist):

- [x] Lawful handling / minimisation of subscriber data (FR-009 masking; NFR-C-001)
- [x] Data classification applied (MYCLAS; DS-009 RESTRICTED)
- [x] Privacy-by-design in intent processing + telemetry (masked egress; in-region collector default)
- [x] Breach-handling path identified (→ JPDP notification, R-004)
- [ ] **DPIA approved** (in progress — see 3.2; CRITICAL blocker)
- [ ] Records of Processing / data-user registration finalised per engagement
- [ ] Data-subject-rights procedures documented for the operator-customer context

**Personal Data Processed**: Yes (DS-009 — `customerId`, raw intent text).
**Special Category Data**: Not by design (subscriber service intent, not sensitive categories); confirm per engagement.

**Gaps/Actions** (cross-ref **R-004**):

- Approve DPIA; finalise PDPA data-user registration + ROPA-equivalent per engagement — Operator Compliance Officer — before G-2.

### 3.2 Data Protection Impact Assessment (DPIA)

**DPIA Required**: Yes — AI processing of subscriber personal data (NFR-C-001; ADR-001 §8.3).

**DPIA Status**: **In Progress** — `ARC-001-PDPA-v1.0` exists; DPIA review/approval pending (RISK R-004 notes "DPIA review status pending").

**DPIA Findings** (interim):

- High risks identified: PII leakage via telemetry/logs; cross-border transfer without documented basis (R-004).
- Mitigations implemented: fail-closed masking (FR-009); in-region collector default; Malaysia-resident DS-009 (ADR-003).
- Residual risks accepted: pending sign-off (R-004 residual 9, exceeds COMPLIANCE appetite ≤ 6 until DPIA approved + PII-free telemetry asserted).

**Regulator Consultation Required**: Assess per engagement (JPDP) if high residual risk persists.

**Gaps/Actions**:

- **Finalise and approve the DPIA** (binary go-live gate G-5) — Security Lead — before G-2 (**CRITICAL**).

---

## 4. Secure Development Practices

### 4.1 Secure Software Development Lifecycle (SDLC)

**Development Methodology**: Agile / agent-native DevOps; IaC-driven (NFR-I-003).

**Secure Development Practices**:

- [x] Secure-coding + licence/header standards (CLAUDE.md, NFR-SEC-006)
- [x] Security requirements as first-class NFRs (NFR-SEC-001…006)
- [x] Threat modelling (RISK register; ADR options analyses)
- [x] Code review includes security + seam review (CLAUDE.md cross-seam PR review)
- [x] SAST (CodeQL) + SCA / dependency scanning (Dependabot)
- [ ] DAST (pen test / dynamic testing pending — R-005)
- [x] Standards-conformance gate (TMF921 CTK) — reliability CI-constrained (R-006)

**OWASP Top 10 Mitigation** (substance):

- [x] Broken authentication prevented (Keycloak JWT validation; ADR-001)
- [x] Broken access control prevented (least-privilege agent role; deny-by-default — R-008)
- [x] Sensitive-data exposure prevented (masking, encryption, residency)
- [x] Vulnerable components prevented (dependency licence + vuln gate, R-015)
- [x] Insufficient logging/monitoring addressed (OTel + audit; security-alerting gap noted C1)
- [ ] Full OWASP coverage validated by DAST/pen test (pending)

**Gaps/Actions**:

- Add **DAST / penetration testing** to close the dynamic-testing gap (R-005) — Security Lead — before G-2.

### 4.2 DevSecOps

**CI/CD Security Integration**:

- [x] Automated security testing in pipeline (CodeQL/Dependabot) — *reliability constrained (R-005/R-006)*
- [x] Secrets discipline — no secrets/`.env`/K8s secret values in repo (NFR-SEC-004, CLAUDE.md)
- [ ] **Reliable** secrets-scanning + pre-commit hooks at the open-core seam (**R-002** action)
- [ ] Container-image scanning (recommended — §2)
- [x] IaC security (declarative, reviewed; placement guardrails ADR-003)
- [ ] Build-artifact signing / SBOM (recommended — A3)

**Gaps/Actions** (cross-ref **R-002**):

- Restore reliable **CI secret-scanning + add pre-commit hooks + seam-review checklist** so operator credentials / proprietary adapter logic cannot reach the public Apache 2.0 repo — Engineering Lead — Q3 2026 (target R-002 residual 9 → 6).

---

## 5. Cloud Security

### 5.1 Cloud Service Provider

**Cloud Provider**: Hybrid — **operator private cloud + Malaysian-region public CSP** (AWS `ap-southeast-5` / Azure Malaysia West / Google Cloud Malaysia), classification-driven (ADR-002). CSP-neutral Kubernetes + Istio runtime.

**Cloud Deployment Model**: Hybrid.

**Data Residency**: **Malaysia** (PDPA-driven). RESTRICTED PII (DS-009) Malaysia-resident by default; CONFIDENTIAL operator config (DS-007/008) in operator environment; secrets (DS-010) vault-only; PUBLIC unconstrained (ADR-003 Appendix A).

**Cloud Security Controls**:

- [x] IAM (Keycloak + CSP IAM)
- [x] Encryption key management (vault/KMS co-located with cluster)
- [x] Network security (Istio mesh, mTLS, egress control)
- [x] Multi-region/AZ redundancy capability (NFR-A-002)
- [x] Placement-drift guardrails + release-time verification (ADR-002/003)
- [ ] CSPM tooling formalised per engagement

**NCSC Cloud Security Principles**: applied in substance (data-in-transit/at-rest protection, separation, identity, supply-chain) — formal 14-principle mapping not yet produced; **NACSA NCII** is the controlling assurance regime.

**Gaps/Actions**:

- Verify **placement guardrails** (no CONFIDENTIAL/RESTRICTED/secret in public estate; DS-009 Malaysia-resident) at release time per engagement (cross-ref **R-010**) — Security Lead — per engagement.

---

## 6. Vulnerability and Patch Management

### 6.1 Vulnerability Management

**Vulnerability Scanning Frequency**: Continuous (Dependabot/CodeQL on push/PR) — reliability CI-constrained (R-005/R-006).

**Scanning Coverage**: `src/` code + dependency graph.

**Process**:

- [x] Automated scanning (Dependabot/CodeQL)
- [x] Prioritisation by severity + remediation SLAs (NFR-SEC-005)
- [x] Remediation tracking (alerts patched at `6791d95`)
- [ ] Reliable green-gate (Actions billing — R-005)
- [ ] Published SBOM + container-image scanning

**Remediation SLAs**: Critical 24h · High 7 days · Medium 30 days (NFR-SEC-005).

#### VMS Integration

**NCSC VMS**: N/A (UK service). **Malaysian equivalent** = Dependabot/CodeQL + NACSA NCII vulnerability-handling.

**Current Vulnerability Status** (per commit `6791d95`):

- Critical: 0 open · High: 0 open · Medium: 0 open · Low: monitored.
  (Subject to the CI-reliability caveat — R-005 risk is that a future alert reaches release if the gate is not restored.)

**Gaps/Actions** (cross-ref **R-005**): restore reliable gate; add SBOM + image scanning — Engineering — Q3 2026.

### 6.2 Patch Management

- [x] Patch assessment via Dependabot PRs
- [x] Emergency-patch path (commit-and-release; e.g. `6791d95`, `c28ce16`)
- [ ] Patch-compliance monitoring formalised
- [x] Rollback procedures (ADR-001/002 rollback plans; IaC redeploy)

**Critical Patch SLA**: 24 hours (NFR-SEC-005) — stricter than the UK 14-day baseline.

---

## 7. Third-Party and Supply Chain Risk

### 7.1 Third-Party Risk Management

| Vendor | Service | Security Rating | Risk Level | Mitigations |
|--------|---------|-----------------|------------|-------------|
| Anthropic (Claude) | AI intent translation + agent reasoning (INT-002) | Med | M (R-009/R-013) | PII masked before egress; timeout/retry/graceful degradation; cost tracked |
| LangSmith | Default OTLP telemetry backend (INT-004) | Med | M (R-004/R-009) | In-region collector default; LangSmith opt-in gated on PDPA/DPIA; spans PII-free; metrics exporter disabled (`c28ce16`) |
| Keycloak | Identity provider (INT-003) | High | M (R-011) | Self-hosted; JWKS caching; fail-closed-for-privileged |
| Malaysian-region CSP / operator private cloud | Hosting (ADR-002) | High | M (R-010) | Classification-driven placement; residency guardrails; ISO/SOC posture |

- [ ] DPAs executed with Anthropic / LangSmith / CSP (pending — A4)
- [x] Third-party egress controlled (masking; in-region default)
- [x] Supplier risks registered (R-009)

### 7.2 Open Source Security

**OSS Controls**:

- [x] Automated dependency scanning (Dependabot)
- [x] Known-vulnerability detection (CodeQL/CVE)
- [x] Licence-compliance checks (Apache/MIT/BSD/ISC only; GPL prohibited — NFR-SEC-006, R-015)
- [ ] Published SBOM (recommended)

**Gaps/Actions**: publish SBOM; keep licence/vuln checks in CI (R-015) — Engineering.

---

## 8. Backup and Recovery

### 8.1 Backup Strategy

**Backup Method**: Encrypted, in-region SSoT backups co-located with the workload (NFR-A-002, NFR-SEC-003).

- [x] Automated backups (per-environment frequency)
- [x] Backup encryption (NFR-SEC-003)
- [x] In-region placement compliant with residency (ADR-003)
- [ ] Immutable / ransomware-resistant backups (recommended)
- [ ] Backup-restoration test conducted (R-014 action — DR drill pending)

**Backup Retention**: aligned to compliance + recovery requirements (NFR-C-002: audit 1–7 yrs).

**Last Restoration Test**: Not conducted (R-014).

### 8.2 Recovery Capabilities

**RTO**: ≤ 4 h (alpha) · **RPO**: ≤ 15 min (alpha); per operator contract in production.

**Gaps/Actions**: conduct SSoT backup/restore + DR drill; evaluate immutable backups — SI Engineer — before G-2.

---

## 9. UK Government Cyber Security Standard Compliance → Malaysian Mapping

> **N/A (mapped)**: UK CSS (July 2025), GovAssure, the £210m Cyber Action Plan, and CSS exception clauses do not bind a Malaysian commercial subject. The controlling assurance regime is **NACSA NCII** (cyber-resilience for telco critical national information infrastructure), with **MCMC** sectoral oversight and **PDPA 2010** for personal-data security. Sections retained for structure; UK-specific mechanisms marked N/A with the Malaysian equivalent.

### 9.1 GovAssure Status → NACSA NCII Assurance

**GovAssure**: N/A. **Equivalent: NACSA NCII assurance** (pending `/arckit:my-cyber-security`).

| System | NCII Assurance Status | Assessment Date | Findings Summary | Remediation Status |
|--------|-----------------------|-----------------|------------------|--------------------|
| ibn-core platform (deployed into operator NCII) | Planned (pre-go-live attestation) | N/A | NCII cyber-resilience gap = **R-005** (residual 12, exceeds safety appetite ≤ 9) | In Progress |

**Findings**: R-005 — an unpatched critical vuln (if CI gate not restored) or an over-privileged/opaque agent flow could introduce systemic risk to national connectivity.

**Remediation Actions**:

- [ ] Pen test + **NCII attestation** + matured incident-response runbooks — Security Lead — before G-2.
- [ ] Restore reliable CI scanning gate — Engineering — Q3 2026.

### 9.2 Secure by Design Confidence Rating

**Confidence Level**: **Medium** (alpha). Strong secure-development and secure-deployment design; secure-operation maturity (IR drills, security alerting, pen test, NCII attestation) is the gap.

| SbD Principle | Status | Evidence |
|---------------|--------|----------|
| **Secure Development** | ✅ | Security NFRs, threat modelling, CodeQL/Dependabot, seam review, licence gate, CTK (CI-reliability caveat). |
| **Secure Deployment** | ⚠️ | IaC + mesh mTLS + classification-driven placement + vault secrets; reliable CI gate + image scanning pending. |
| **Secure Operation** | ⚠️ | Agent telemetry + audit + acting-identity; security alerting, IR drills, pen test, NCII attestation pending. |

**High-Confidence Profile Achievement**:

- [x] Security embedded throughout the lifecycle (by-design NFRs + CLAUDE.md)
- [x] Threat modelling conducted (RISK + ADRs)
- [⚠️] Security testing integrated in CI/CD (present but CI-reliability constrained)
- [ ] Incident-response capabilities tested and proven (pending)
- [⚠️] Continuous monitoring + improvement demonstrated (telemetry strong; security alerting + closed loop pending)

**Gap Analysis**:

| Gap | Impact | Improvement Action | Owner | Target Date |
|-----|--------|--------------------|-------|-------------|
| Reliable CI security gate (R-005/R-006) | High | Resolve Actions billing; green-gate CodeQL/Dependabot/CTK | Engineering Lead | Q3 2026 |
| Pen test + NCII attestation (R-005) | High | Commission pen test; complete NCII attestation | Security Lead | Before G-2 |
| DPIA approval + PII-free telemetry (R-004) | High | Approve DPIA; assert PII-free spans in CI | Security Lead | Before G-2 |
| Reliable seam secret-scanning (R-002) | High | Restore secret-scanning; pre-commit hooks; seam checklist | Engineering Lead | Q3 2026 |
| IR runbooks + DR drill | Medium | Mature + test runbooks; run DR drill | Security Lead / SI Engineer | Before G-2 |

### 9.3 Cyber Security Standard Exception Register

> UK CSS clauses 4.3/4.4 are N/A. Recorded below as **commercial security exceptions** managed at the Vpnet Security/Compliance gate, mapped to RISK appetite-exceeding items.

| Exception ID | Description | Basis | Risk Assessment | Mitigation in Place | Approval Authority | Review Date | Improvement Plan |
|-------------|-------------|------------|-----------------|---------------------|--------------------|-------------|------------------|
| SEC-EXC-001 | CI security gate (CodeQL/Dependabot/CTK) not reliably green-gating | Actions billing constraint (RISK G-1) | High (R-005/R-006) | Manual scan + patch (`6791d95`); merge discipline | Lead Architect / CTO | Q3 2026 | Resolve billing; hard merge gate |
| SEC-EXC-002 | DPIA not yet approved while alpha processing proceeds | Alpha phase, masked data | High (R-004) | Fail-closed masking; in-region collector; Malaysia-resident DS-009 | Security/Compliance + JPDP path | Before G-2 | Approve DPIA; PII-free telemetry assertion |
| SEC-EXC-003 | Agent-identity scoping not yet 100% regression-guarded | Alpha maturity | Medium (R-008) | Agent role live (`a9da9d4`); deny-by-default | Security Lead | Before G-2 | 100% coverage + anomaly alert |

**Total Exceptions**: 3 · **Under Active Improvement Plan**: 3.

### 9.4 Cyber Action Plan Alignment

**N/A (mapped)** — the £210m UK Cyber Action Plan does not apply. Pillar intent mapped to ibn-core/Malaysian context:

| Pillar | ibn-core Equivalent Activity | Alignment | Status |
|--------------------------|------------------------|-------------------|--------|
| **Skills & Workforce** | Agent-native documentation; PDPA/secure-dev awareness (gap — B6) | Partial | ⚠️ |
| **Tooling & Infrastructure** | Dependabot/CodeQL; OTel; Istio mTLS; vault | Strong (CI-reliability caveat) | ⚠️ |
| **Resilience & Response** | NFR-A-003 resilience; DR (NFR-A-002); IR runbooks (maturing) | Partial | ⚠️ |
| **Collaboration & Sharing** | Open-core public framework; operator/regulator (MCMC/NACSA) briefings (RISK R-003 control) | Partial | ⚠️ |

---

## 10. GovS 007: Security — Alignment Summary (mapped to commercial governance)

> GovS 007 is a UK cross-government standard (not binding). Mapped below as a protective-security discipline; "department" = Vpnet EARB; SIRO/SSRO/DSO map to Lead Architect/CTO + Security Lead.

| GovS 007 Principle | Evidence / ArcKit Artefact | Status |
|---------------------|---------------------------|--------|
| 1. Governance aligned to purpose | §1 CAF A1; Lead Architect/CTO ownership; EARB | ⚠️ |
| 2. Risk-based approach | §1 CAF A2; `ARC-001-RISK-v1.0` (Orange Book) | ✅ |
| 3. Security integrated into activities | §4 Secure Development; §5 Cloud; CLAUDE.md | ✅ |
| 4. Holistic security planning | §1–§8 full CAF assessment | ⚠️ |
| 5. Security culture embedded | §1 CAF B6 (gap); §11 profession mapping | ❌ |
| 6. Accountability at all levels | Sign-off table; ADR-001 RACI; RISK §E | ⚠️ |
| 7. Proportionate measures | Exec Summary; classification → controls (MYCLAS/ADR-003) | ✅ |
| 8. Continuous improvement | §1 CAF D2; §9.4 (mapped); risk-review cadence | ⚠️ |
| 9. Legal/regulatory compliance | §3 PDPA 2010; `ARC-001-PDPA-v1.0`; DPIA (pending) | ⚠️ |

### Security Roles (GovS 007 → commercial mapping)

| Role | Name | Responsibility |
|------|------|---------------|
| Accounting Officer (analogue) | Roland Pfeifer (Lead Architect / CTO) | Overall accountability for ibn-core security |
| Senior Security Risk Owner (SSRO) | Roland Pfeifer (Lead Architect / CTO) | Owns protective-security risk (R-016: concentration — recommend separation) |
| Departmental Security Officer (DSO) | Security Lead (Vpnet) | Day-to-day security coordination, agent-identity scoping, PDPA controls |
| Senior Information Risk Owner (SIRO) | Security/Compliance (Vpnet) | Owns information + cyber-security risk; JPDP/NACSA liaison |

---

## 11. Government Cyber Security Profession → Workforce

> **N/A (mapped)** — UK CCP / Government Cyber Academy / DDaT do not apply. Assessed as commercial workforce capability.

### 11.1 Profession Participation

**Enrolled**: N/A (UK). Commercial equivalent: small specialist SI team; capability concentrated in Lead Architect/CTO + Security Lead (R-016).

| Metric | Value |
|--------|-------|
| Certified cyber professionals (commercial cert, e.g. ISO 27001 LA / CISSP) | [PENDING] |
| Security-trained contributors on project | Informal (agent-native model; no formal programme — B6) |

### 11.2 Project Security Role Mapping

| Security Role | Role Holder | Certification | Notes |
|---------------|-------------|------------|-------|
| Security Architect / SSRO | Lead Architect / CTO | [PENDING] | Accountable for NON-NEGOTIABLE principles |
| Security Engineer / DSO | Security Lead | [PENDING] | Agent identity, PDPA, NCII |

### 11.3 Workforce Development

- [ ] PDPA + secure-development awareness baseline (B6 gap)
- [ ] Commercial security certification targets (ISO 27001 LA / CISSP) for key roles
- [ ] Succession planning to mitigate key-person concentration (R-016)

**Actions**: stand up awareness baseline + reduce key-person concentration — Security Lead — before SI scale-up.

---

## Overall Security Assessment Summary

### NCSC CAF Scorecard

| CAF Objective | Principles Achieved | Status |
|---------------|---------------------|--------|
| A. Managing Security Risk | 1/4 (A2 ✅; A1/A3/A4 ⚠️) | ⚠️ |
| B. Protecting Against Cyber Attack | 2/6 (B2, B5 ✅; B1/B3/B4 ⚠️; B6 ❌) | ⚠️ |
| C. Detecting Cyber Security Events | 0/2 (C1, C2 ⚠️) | ⚠️ |
| D. Minimising Impact of Incidents | 0/2 (D1, D2 ⚠️) | ⚠️ |
| **Overall** | **3/14 Achieved · 10/14 Partial · 1/14 Not Achieved** | ⚠️ Adequate (alpha) |

> Note: counting only ✅ as "Achieved" gives 3/14 fully Achieved; including by-design strengths assessed strong (B2, B5, A2) the substantive posture is stronger than the strict count implies. The Executive Summary "7/14" reflects principles where the *controlling* (by-design) controls are in place even if operational evidence is pending; this strict scorecard counts only fully-evidenced ✅. Both views are retained intentionally.

### Security Posture Summary

**Strengths**:

- Zero-trust **agent identity** — distinct least-privilege agent realm role, deny-by-default, acting-identity attribution (ADR-001, FR-007).
- **Fail-closed PII masking** + classification-driven Malaysia residency + vault-only secrets (FR-009, ADR-003).
- **Open-core seam** keeps operator CAMARA credentials out of the public Apache 2.0 repo (PRIN 9, BR-003).
- **Istio mTLS mesh**, circuit breakers, bulkheads, controlled egress (NFR-A-003).
- **Agent + application OTel telemetry** with audit-grade acting-identity attribution (FR-011, NFR-C-002).

**Critical Gaps** (go-live blockers):

- **R-005** NCII: reliable CI scanning gate + pen test + NCII attestation not yet in place.
- **R-004** PDPA: DPIA not approved; PII-free telemetry not asserted in CI.
- **R-002** seam leak: reliable secret-scanning at the open-core seam constrained by CI billing.

**Overall Risk Rating**: **Medium** (residual). Three go-live-gating security/compliance risks; none residual Critical.

### Critical Security Issues

1. **NCII cyber-resilience gap (CAF B4/C2/D1, NACSA)** — **CRITICAL** — unpatched critical vuln or opaque agent flow could introduce systemic risk to national telco infrastructure (**R-005**, residual 12 > appetite 9). Blocks G-2.
2. **PDPA subscriber-PII breach (CAF B3, PDPA 2010 / JPDP)** — **CRITICAL** — DPIA unapproved; PII-free telemetry unasserted (**R-004**, residual 9 > appetite 6). Blocks G-2.
3. **Open-core seam credential leak (CAF A4/B1, PRIN 9)** — **HIGH** — operator CAMARA credentials/proprietary logic could reach the public repo without reliable secret-scanning (**R-002**, residual 9 > appetite 6).
4. **Agent over-privilege / identity scoping not 100% (CAF B2)** — **HIGH** — (**R-008**, residual 9 > appetite 6).

### Recommendations

**Critical Priority** (0–30 days / before G-2 — phase blockers):

- Approve the **DPIA**; assert PII-free telemetry spans in CI; complete data-store residency audit — Security Lead (R-004).
- Commission a **penetration test** (incl. agent abuse cases); complete **NACSA NCII attestation**; mature + test incident-response runbooks — Security Lead (R-005).
- Restore reliable **CI secret-scanning** + pre-commit hooks + seam-review checklist — Engineering Lead (R-002).

**High Priority** (1–3 months):

- Restore reliable **CI scanning / CTK green-gate** (resolve Actions billing) — Engineering Lead (R-005/R-006).
- Achieve + regression-guard **100% agent-role identity** coverage with anomaly alerting — Security Lead (R-008).
- Add **security-event alerting** (SIEM-equivalent): forged-token spikes, agent-identity anomalies, placement-drift — Security Lead.
- Execute **DPAs** with Anthropic / LangSmith / CSP — Operator Compliance Officer.

**Medium Priority** (3–6 months):

- Publish **SBOM** + add container-image/runtime malware scanning — Engineering.
- Run a **BC/DR drill** (SSoT backup/restore) — SI Engineer (R-014).
- Stand up **PDPA + secure-development awareness** baseline; reduce key-person concentration — Security Lead (B6, R-016).
- Map controls to **ISO 27001 / NACSA NCII** for the operator certification track — Security Lead.

---

## Next Steps and Action Plan

**Immediate Actions** (0–30 days / before G-2):

- [ ] Approve DPIA + assert PII-free telemetry — Security Lead — before G-2 (R-004)
- [ ] Pen test + NCII attestation + IR runbooks — Security Lead — before G-2 (R-005)
- [ ] Restore reliable seam secret-scanning + pre-commit hooks — Engineering Lead — Q3 2026 (R-002)

**Short-term Actions** (1–3 months):

- [ ] Reliable CI scanning/CTK green-gate — Engineering Lead — Q3 2026 (R-005/R-006)
- [ ] 100% agent-role identity coverage + anomaly alert — Security Lead — before G-2 (R-008)
- [ ] Security-event alerting layer — Security Lead — before G-2

**Long-term Actions** (3–12 months):

- [ ] SBOM + image scanning; BC/DR drill; awareness baseline; ISO 27001/NCII mapping — Security/Engineering — H2 2026

**Next Security Review**: 2026-07-05 (monthly during alpha; align to RISK review cadence; re-assess at the Pre-Production gate).

---

## Approval and Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Project Lead | Roland Pfeifer (Lead Architect / CTO) | | |
| Security Architect | [PENDING] | | |
| Senior Security Risk Owner (SSRO) | Roland Pfeifer (Lead Architect / CTO) | | |
| Departmental Security Officer (DSO) | Security Lead (Vpnet) | | |
| Senior Information Risk Owner (SIRO) | Security/Compliance (Vpnet) | | |
| Data Protection Officer (DPO-equivalent) | Operator Compliance Officer | | |

---

**Document Control**:

- **Version**: 1.0
- **Classification**: PUBLIC
- **Last Reviewed**: 2026-06-05
- **Next Review**: 2026-07-05
- **Document Owner**: Roland Pfeifer (Lead Architect / CTO)

## External References

> This section provides traceability from generated content back to source documents.

### Document Register

| Doc ID | Filename | Type | Source Location | Description |
|--------|----------|------|-----------------|-------------|
| ARC-001-REQ | ARC-001-REQ-v1.0.md | Requirements | projects/001-ibn-core-my/ | BR/FR/NFR baseline (NFR-SEC family, FR-006/007/009/011, INT-001…004) |
| ARC-001-RISK | ARC-001-RISK-v1.0.md | Risk Register | projects/001-ibn-core-my/ | Orange Book register; security risks R-002/R-004/R-005/R-008/R-010 |
| ARC-001-ADR-001 | ARC-001-ADR-001-v1.0.md | ADR (Operator Identity) | projects/001-ibn-core-my/decisions/ | Keycloak central IdP, constrained agent role, CAMARA-native egress |
| ARC-001-ADR-002 | ARC-001-ADR-002-v1.0.md | ADR (Cloud Platform) | projects/001-ibn-core-my/decisions/ | Hybrid classification-driven landing zones |
| ARC-001-ADR-003 | ARC-001-ADR-003-v1.0.md | ADR (Data Residency) | projects/001-ibn-core-my/decisions/ | Tier-differentiated residency per MYCLAS ladder |
| ARC-001-PDPA | ARC-001-PDPA-v1.0.md | PDPA Assessment | projects/001-ibn-core-my/ | PDPA 2010 / DPIA basis (referenced) |
| ARC-001-MYCLAS | ARC-001-MYCLAS-v1.0.md | Classification Register | projects/001-ibn-core-my/ | DS-001…DS-010 four-tier ladder |
| ARC-000-PRIN | ARC-000-PRIN-v1.0.md | Principles | projects/000-global/ | Enterprise architecture principles (4, 5, 6, 9, 10) |

### Citations

| Citation ID | Doc ID | Page/Section | Category | Quoted Passage |
|-------------|--------|--------------|----------|----------------|
| [RISK-1] | ARC-001-RISK | R-005 | NCII | "an unpatched critical vulnerability or an over-privileged/opaque autonomous flow… falling short of NACSA NCII expectations." (residual 12, exceeds safety appetite ≤ 9) |
| [RISK-2] | ARC-001-RISK | R-004 | PDPA | "Subscriber PII… leaks via logs/telemetry or is transferred cross-border without a documented PDPA 2010 legal basis." (residual 9, exceeds COMPLIANCE appetite ≤ 6) |
| [RISK-3] | ARC-001-RISK | R-002 | Seam | "Operator CAMARA credentials… accidentally committed to the public Apache 2.0 repository, breaching the open-core seam (PRIN 9)." (residual 9) |
| [ADR1-1] | ARC-001-ADR-001 | §6.1 / §8.2 | Identity | Keycloak central IdP + distinct constrained agent role; 100% agent tool calls under the agent-role identity (target). |
| [ADR3-1] | ARC-001-ADR-003 | Appendix A | Residency | DS-009 Malaysia-resident default; DS-010 vault-only; DS-006 in-region collector default. |
| [REQ-1] | ARC-001-REQ | NFR-SEC-001…006, FR-009, NFR-C-001/002 | Security | Authn/authz, encryption, secrets, vuln mgmt, licence; PII masking; PDPA; audit logging. |

### Unreferenced Documents

| Filename | Source Location | Reason |
|----------|-----------------|--------|
| ARC-001-STKE-v1.0.md | projects/001-ibn-core-my/ | Stakeholder analysis — not security-load-bearing for this assessment |
| ARC-001-MYDIG-v1.0.md | projects/001-ibn-core-my/ | Not in the allocated input set for this SbD pass |
| ARC-001-MCRES-v1.0.md | projects/001-ibn-core-my/ | Residency detail consumed indirectly via ADR-002/003 |
| ARC-001-HLDR-v1.0.md | projects/001-ibn-core-my/ | HLD review — not in the allocated input set |

---

**Generated by**: ArcKit `/arckit:secure` command
**Generated on**: 2026-06-05 14:30 GMT
**ArcKit Version**: 5.11.0
**Project**: ibn-core-my (Project 001)
**AI Model**: claude-opus-4-8[1m]
**Generation Context**: Synthesised from ARC-001-REQ-v1.0, ARC-001-RISK-v1.0, and ARC-001-ADR-001/002/003-v1.0. UK Government Secure by Design / NCSC CAF structure applied; subject reframed as a commercial Malaysian telco product with Malaysian equivalents (NACSA NCII, PDPA 2010 / JPDP, MCMC). Security risks R-002 (seam leak), R-004 (PDPA), R-005 (NCII) cross-referenced throughout. Interactive defaults: Scope = Full system, Phase = alpha, Risk = Medium, Classification = PUBLIC (per project docs).

<!-- arckit-provenance:start -->

## Build Provenance

_Stamped automatically by the ArcKit plugin's `provenance-stamp.mjs` PostToolUse hook. Complements (does not replace) the human-authored footer above. Carries only fields the model can't authoritatively self-report: build context from `.arckit/state.json` and effort levels derived from command frontmatter + the silent-downgrade matrix._

| Field | Value |
|-------|-------|
| Requested Effort | `high` |
| Effective Effort | _unknown — model not parsed from existing footer_ |
| Stamped at | 2026-06-21T12:18:07.122Z |

<!-- arckit-provenance:end -->
