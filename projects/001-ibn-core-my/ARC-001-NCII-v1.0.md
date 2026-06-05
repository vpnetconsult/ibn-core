# Cyber Security Act 2024 / NACSA NCII Statement of Applicability

> **Template Origin**: Community | **ArcKit Version**: 5.11.0 | **Command**: `/arckit:my-cyber-security`

> ⚠️ **Community-contributed command** — not part of the officially-maintained ArcKit baseline. Output should be reviewed by qualified Malaysian cybersecurity / compliance counsel before reliance. Citations to the Cyber Security Act 2024 [Act 854] and NACSA codes of practice may lag the current text — verify against the source (<https://www.nacsa.gov.my/act854.php>).

> ⚠️ **Commercial-subject reframing (key applicability stance)** — ibn-core is a **commercial** open-core (Apache 2.0) RFC 9315 / TMF921 AI-native Intent-Based Networking framework delivered by **Vpnet Cloud Solutions Sdn. Bhd.** under Systems Integration (SI) engagements to Malaysian telecommunications operators (U Mobile, TM Malaysia). Under the Cyber Security Act 2024, the **NCII entity is the operator** — the licensed telco that owns the National Critical Information Infrastructure in the Communications sector. ibn-core is **not itself a designated NCII entity**; it is a **system/vendor that orchestrates operator network infrastructure** and therefore falls **within the operator's NCII obligations** as a supplier component. This SoA states ibn-core's posture as that in-scope vendor — the controls the operator's NCII duties flow down to ibn-core, and the assurance ibn-core must provide so the operator can discharge its statutory duties to NACSA. Per the `my-operator` recipe (`.arckit/recipes/my-operator.yaml`), the commercial doc-control header is used (consistent with `ARC-001-MYCLAS-v1.0`, `ARC-001-SECD-v1.0`); the Malaysia-Federal "Agensi" block is omitted (ibn-core carries no Federal mandate).

## Document Control

| Field | Value |
|-------|-------|
| **Document ID** | ARC-001-NCII-v1.0 |
| **Document Type** | NACSA NCII Statement of Applicability (Cyber Security Act 2024) |
| **Project** | ibn-core-my (Project 001) |
| **Classification** | PUBLIC |
| **Status** | DRAFT |
| **Version** | 1.0 |
| **Created Date** | 2026-06-05 |
| **Last Modified** | 2026-06-05 |
| **Review Cycle** | Annual (minimum; re-run on material architecture change or new operator engagement) |
| **Next Review Date** | 2027-06-05 |
| **Owner** | Roland Pfeifer, Lead Architect / CTO (Vpnet Cloud Solutions Sdn. Bhd.) — accountable; Security Lead — control owner |
| **Reviewed By** | [PENDING] |
| **Approved By** | [PENDING] |
| **Distribution** | ibn-core engineering, Vpnet SI delivery + Security/Compliance, operator NCII/security teams (U Mobile, TM Malaysia), operator-side NACSA liaison |
| **Instrument cited** | Cyber Security Act 2024 [Act 854] + subsidiary regulations (NACSA); cross-ref PDPA 2010 (am. 2024) |
| **Hosting / placement** | Hybrid — operator private cloud + Malaysian-region public CSP per dataset tier (ADR-002 / ADR-003) |
| **NCII sector (if applicable)** | Communications (telecommunications) — operator is the NCII entity; ibn-core is an in-scope vendor component |

> **Subject-type note**: This SoA applies the **Generic / commercial** document-control header, not the Malaysia Federal "Agensi" header. Per `_partials/RENDERING.md`, the Malaysia public-sector block is included only when `governance_framework` is `Malaysia Federal` **or** `classification_scheme` is `Arahan Keselamatan`. ibn-core is a commercial subject under neither condition (plugin `userConfig` sets only `organisation_name: Vpnet`), so the Malaysia block is omitted — consistent with `ARC-001-MYCLAS-v1.0` and `ARC-001-SECD-v1.0`. The **Communications NCII obligations apply derivatively** through the operator's designation, not because ibn-core is itself an NCII entity.

## Revision History

| Version | Date | Author | Changes | Approved By | Approval Date |
|---------|------|--------|---------|-------------|---------------|
| 1.0 | 2026-06-05 | ArcKit AI | Initial creation from `/arckit:my-cyber-security` (executed via arckit-build wave 8); commercial vendor-to-NCII reframing per `my-operator` recipe; cross-references SECD CAF controls and RISK R-005 | [PENDING] | [PENDING] |

---

## Executive Summary

ibn-core is an AI-native RFC 9315 / TMF921 Intent-Based Networking framework that translates customer intent into orchestration actions against a Malaysian operator's live 4G/5G core, OSS/BSS and network configuration. Because **telecommunications is a designated National Critical Information Infrastructure (NCII) sector** under the Cyber Security Act 2024 [Act 854], any system that mutates operator network infrastructure sits inside the operator's NCII perimeter. The **NCII entity is the operator** (the licensed telco, e.g. U Mobile / TM Malaysia); **NACSA** is the regulator and the Communications sector lead is the operator's sector lead. ibn-core, as the orchestrating system and Vpnet's SI deliverable, is **a vendor component within the operator's NCII obligations** — it does not hold an independent NACSA designation, but the operator's statutory duties (risk assessment, audit, code-of-practice compliance, incident notification) flow down to it contractually and architecturally. This SoA states that derivative posture.

The applicable Cyber Security Act 2024 duties — at least **annual NCII risk assessment**, **cybersecurity audit** on NACSA direction, **sector code-of-practice compliance**, **cybersecurity exercises**, and **incident notification to NACSA** (initial report within **6 hours**, full report within **14 days**) — are mapped below to the operator (as duty-holder) and to ibn-core (as the system that must supply the evidence and detection telemetry to satisfy them). The **6-hour initial-report window is an architecture constraint**: ibn-core's OpenTelemetry instrumentation, `rfc9315.phase` / `gen_ai.*` / `ai_gateway.*` spans, acting-identity audit on every autonomous tool call (FR-011, NFR-M-001, NFR-C-002) and Istio mesh telemetry must be sufficient for the operator to detect, triage and file within 6 hours. A dedicated security-event correlation (SIEM) layer is the principal detection gap (SECD §C, RISK G-3).

The Statement of Applicability records **24 controls** across NCII governance, identity/access, protection, detection, incident response, supply-chain and assurance. ibn-core's by-design strengths — zero-trust constrained agent identity (ADR-001, FR-007), fail-closed PII masking, Istio mTLS mesh, dependency/code scanning, immutable conformance evidence — give a credible base, but **go-live-gating gaps remain**: NCII attestation and a penetration test are not yet complete, CI security gates are not reliably green-gating (Actions billing constraint), incident-response runbooks are immature, and no security SIEM exists. These are exactly the controls behind **RISK R-005 (NCII cyber-resilience gap, residual 12 — exceeds the ≤9 appetite)**, which this SoA cross-checks per its treatment plan. Penalty exposure for the operator under Act 854 is severe — up to **RM500,000 and/or 10 years' imprisonment** for code-of-practice or reporting failures — so the operator will require this assurance as a condition of SI go-live (STKE goal G-2).

## NCII Determination

| Question | Assessment |
|----------|------------|
| Would disruption impact essential services (security, defence, foreign relations, economy, public health, public safety, public order)? | **Yes (derivatively).** ibn-core orchestrates a national telecommunications operator's live network. Disruption, compromise or an unsafe autonomous change to that infrastructure can degrade national connectivity — an essential service underpinning the economy, public safety and public order. The impact materialises through the operator's NCII, which ibn-core acts upon. |
| NCII sector | **Communications** (telecommunications) — one of the designated NCII sectors under the Cyber Security Act 2024. The operator is also subject to MCMC sectoral oversight. |
| Sector lead | The **NCII Sector Lead for Communications** designated under Act 854 (operator-facing), reporting to the **NACSA Chief Executive**. ibn-core interacts via the **operator's NCII/security function**, not directly. |
| Conclusion (NCII / not NCII / vendor to NCII) | **Vendor / system component to an NCII entity.** ibn-core is **not** independently designated NCII. The **operator is the NCII entity**; ibn-core falls **within the operator's NCII obligations** as a system orchestrating its critical infrastructure. The operator's Act 854 duties flow down to ibn-core contractually (SI engagement) and architecturally (this SoA). NACSA scrutiny reaches ibn-core through the operator (RISK R-005, SD-12). |

> **Why this matters for design**: even though ibn-core is not the designated entity, the operator cannot discharge its NCII duties unless ibn-core supplies (a) detection telemetry fast enough for the 6-hour report, (b) audit evidence for NACSA-directed audits, and (c) code-of-practice control conformance. The duties are therefore treated as **binding on ibn-core via the operator** throughout this SoA.

## Obligations Register

Penalty figures reflect the Cyber Security Act 2024 [Act 854] tiers; the operator (as NCII entity) is the primary duty-holder, with ibn-core's duty being to **enable and evidence** each obligation. Verify current penalty quanta against Act 854 and subsidiary regulations before reliance.

| Obligation | Requirement (Act 854) | Owner | Cadence | Penalty exposure |
|------------|-----------------------|-------|---------|------------------|
| **NCII risk assessment** | Operator must conduct an NCII cyber risk assessment and provide it to NACSA; ibn-core must supply its component risk posture (this project's `ARC-001-RISK-v1.0`, esp. R-005) as an input. | Operator NCII function (duty-holder); Vpnet Security Lead (ibn-core input) | **At least annually** (and on material change) | up to RM200k / 3 yrs [CSA-1] |
| **Cybersecurity audit** | On NACSA direction, the NCII's systems are audited; ibn-core must be auditable — provide architecture, controls evidence, conformance artefacts (`docs/compliance/`, this SoA, SECD). | Operator (duty-holder); Vpnet Security Lead + Lead Architect (audit support) | Per NACSA direction (target: pre-go-live attestation, then periodic) | up to RM200k / 3 yrs [CSA-1] |
| **Code-of-practice compliance** | Comply with the NACSA **Communications-sector code of practice** controls applicable to NCII; ibn-core implements/maps the controls in the SoA below. | Operator (duty-holder); Vpnet Security Lead (ibn-core controls) | **Continuous** | up to **RM500k / 10 yrs** [CSA-1] |
| **Cybersecurity exercise** | Participate in NACSA-directed exercises / drills; ibn-core supplies incident-response runbooks (NFR-M-003) and degraded-mode behaviour (NFR-A-003) for the operator's exercise scope. | Operator (lead); Vpnet Security Lead (ibn-core scenarios) | **On notice** from NACSA | — (non-participation tracked under audit/code-of-practice) |
| **Incident notification to NACSA** | Notify the sector lead + NACSA Chief Executive of a cybersecurity incident — **initial report within 6 hours**, **full report within 14 days**. ibn-core must detect and escalate to the operator fast enough to meet the operator's 6-hour clock. | Operator (notifier to NACSA); ibn-core detection/escalation (NFR-M-001, NFR-C-002, FR-011) | **6 h initial / 14 d full** per incident | up to **RM500k / 10 yrs** [CSA-2] |
| **NACSA licensing (cybersecurity service providers)** | Required only if **providing a licensable cybersecurity service** (e.g. managed SOC, pen-testing as a service). **Not applicable** to ibn-core as shipped — it is an IBN orchestration product, not a cybersecurity service provider. Re-assess if Vpnet offers managed security services around it. | Vpnet (if scope changes) | Before offering such service | per subsidiary regulations |

## Statement of Applicability

Status legend: ✅ Implemented · ◑ Partial · ◻ Planned/Gap · N/A Not applicable. "Applicable?" is from ibn-core's perspective as the in-scope vendor component; controls map to the operator's Communications-sector code-of-practice obligations. Cross-references: **SECD** = `ARC-001-SECD-v1.0` (NCSC CAF used as the assessment discipline; Malaysian regimes binding); **RISK** = `ARC-001-RISK-v1.0`; **ADR-001/002/003** = security/placement decisions; REQ NFR/FR IDs from `ARC-001-REQ-v1.0`.

| # | Control (Communications-sector code of practice domain) | Applicable? | Implemented? | Gap | Remediation owner |
|---|---|---|---|---|---|
| C-01 | **Cyber security governance & accountable owner** — named SIRO-equivalent, oversight forum | Yes | ✅ | Lead Architect/CTO accountable; Security Lead control owner; EARB + Security/Compliance gate (SECD §A1). | Lead Architect / CTO |
| C-02 | **NCII risk management** — maintained risk register feeding operator NCII assessment | Yes | ✅ | `ARC-001-RISK-v1.0` (Orange Book), R-005 active treatment; flows to operator annually. | Security Lead |
| C-03 | **Asset & dependency inventory** — third parties identified (Claude, LangSmith, Keycloak, CSP) | Yes | ✅ | SECD §A4; INT-002/003/004 catalogued; licence-compatibility enforced (NFR-SEC-006). | Security Lead |
| C-04 | **Supply-chain / open-core seam integrity** — operator secrets never in public repo | Yes | ◑ | `McpAdapter` seam + `CLAUDE.md` rules; **secret-scanning not reliably green-gating** (Actions billing) → R-002. | Engineering Lead |
| C-05 | **Identity & access control** — central IdP, MFA for privileged, least privilege | Yes | ✅ | Keycloak central IdP; MFA privileged; deny-by-default (ADR-001, NFR-SEC-001/002, SECD §B2). | Security Lead |
| C-06 | **Constrained autonomous-agent identity** — scoped agent role, not human/admin creds | Yes | ✅ | Distinct agent-role token, least privilege, observable (FR-007, ADR-001 §2.1). | Security Lead |
| C-07 | **Human-in-the-loop gate on high-impact network-mutating actions** | Yes | ◑ | Elevated-assurance JWT gate (ADR-001); **HITL not yet 100%** → R-001 (residual 12). | Lead Architect / CTO |
| C-08 | **Encryption in transit & at rest** — mTLS mesh, vaulted secrets | Yes | ✅ | Istio mTLS; encryption at rest; vault-only secrets (NFR-SEC-003/004, ADR-003). | Security Lead |
| C-09 | **Data residency for subscriber PII / secrets** (PDPA-driven) | Yes | ✅ | RESTRICTED PII Malaysia-resident; secrets vault-only (ADR-003, MYCLAS DS-001..010). | Security Lead |
| C-10 | **PII masking before third-party/AI egress** (fail-closed) | Yes | ✅ | Fail-closed PII masking before Claude; in-region collector default (SECD §A4, PDPA). | Security Lead |
| C-11 | **Vulnerability management & patch SLAs** — no open critical/high at release | Yes | ◑ | Dependabot/CodeQL + SLAs (Crit 24h/High 7d); commit `6791d95` patched; **CI not green-gating** → R-005. | Engineering Lead |
| C-12 | **Secure SDLC / DevSecOps** — code review, seam discipline, traceability | Yes | ✅ | `CLAUDE.md` enforced; commit traceability; CTK conformance gating (SECD §4). | Engineering Lead |
| C-13 | **Network boundary & segmentation** — mesh segmentation, controlled egress | Yes | ✅ | Istio segmentation; metrics exporter disabled to stop unauthenticated egress (SECD §B5). | Security Lead |
| C-14 | **Security event detection & logging** — sufficient to detect an NCII incident | Yes | ◑ | OTel + audit logging (NFR-M-001, NFR-C-002); **no dedicated security SIEM/correlation** (SECD §C, R-005). | Security Lead |
| C-15 | **Tamper-evident audit trail** — who/what/when/where/why/result on privileged ops | Yes | ✅ | NFR-C-002 audit logging; acting identity on every autonomous tool call (FR-011). | Security Lead |
| C-16 | **6-hour incident detection & escalation capability** (Act 854 reporting enabler) | Yes | ◑ | Telemetry + correlation IDs support triage; **no SIEM alerting / drill-tested escalation** to hit 6 h reliably. | Security Lead |
| C-17 | **Incident-response runbooks** incl. agent-misbehaviour containment | Yes | ◑ | NFR-M-003 runbooks defined; **immature, undrilled** (SECD §D, R-005). | Security Lead |
| C-18 | **Incident notification process to operator → NACSA** (6 h / 14 d) | Yes | ◻ | Notification chain to operator NCII function **to be contracted per SI engagement**; PDPA dual-trigger noted. | Security/Compliance |
| C-19 | **Business continuity / DR for critical state** (Redis SSoT, IdP) | Yes | ◑ | NFR-A-002/003 patterns; **Keycloak + Redis SPOFs lack HA/DR** vs NFR-A-002 (HLD blocking gap). | Lead Architect / CTO |
| C-20 | **Degraded-mode / fault tolerance** — circuit breakers, bulkheads, graceful degradation | Yes | ✅ | Istio circuit breakers + HPA; degraded-mode resilience (NFR-A-003, FR-007). | Security Lead |
| C-21 | **Cybersecurity exercise participation** — scenarios for operator drills | Yes | ◻ | To be supplied per operator NACSA-directed exercise; runbooks (C-17) are prerequisite. | Security Lead |
| C-22 | **NCII audit readiness / attestation** — evidence pack for NACSA-directed audit | Yes | ◻ | **NCII attestation not yet complete; penetration test not conducted** → R-005 go-live blocker. | Security Lead |
| C-23 | **Standards conformance evidence** (TMF921 CTK, RFC 9315 phase) as integrity assurance | Yes | ✅ | Versioned `docs/compliance/` evidence; immutable cited tags; CTK 83/83 (v2.0.1). | Engineering Lead |
| C-24 | **Personnel security awareness** | Yes | ◑ | No formal phishing/awareness programme; mitigated by small SI team + agent-native encoded rules (SECD §B6, R-016). | Security Lead |

**SoA summary**: 24 controls — applicable: 24 (N/A: 0 from ibn-core's vendor-component perspective; NACSA-licensing obligation in the Obligations Register is the only N/A item, as ibn-core is not a cybersecurity-service provider). Implemented ✅: 13 · Partial ◑: 7 · Gap ◻: 4. The 11 non-fully-implemented controls (C-04, C-07, C-11, C-14, C-16, C-17, C-18, C-19, C-21, C-22, C-24) are the operator-facing go-live conditions, the most material being **C-22 (NCII attestation + pen test)**, **C-16/C-17 (6-hour-capable detection + drilled runbooks)** and **C-19 (HA/DR for SPOFs)** — all consolidated under **RISK R-005**.

## Incident-Reporting Posture

- **Initial report to sector lead + NACSA Chief Executive: within 6 hours.** ibn-core is **upstream** of this clock: it must detect and escalate a cybersecurity event to the **operator's NCII function**, which files to NACSA. The operator's 6-hour budget is consumed partly by ibn-core's detection-to-escalation latency, so this is a hard architecture constraint, not just a process step.
- **Full report: within 14 days.** ibn-core supplies forensic detail — correlation/intent IDs, `rfc9315.phase` tags, `gen_ai.*` / `ai_gateway.*` events, acting-identity audit (FR-011, NFR-C-002) and Istio mesh telemetry — sufficient for the operator's full report.
- **Detection/logging designed to meet the 6-hour window: ◑ Partial.** Evidence: OpenTelemetry instrumentation of application **and** agent behaviour, tamper-evident audit logging on privileged ops (NFR-M-001, NFR-C-002), and acting-identity capture exist and are strong by design. **Gap**: there is **no dedicated security-event correlation / SIEM / alerting layer** (forged-token spikes, agent-identity anomalies, placement drift) and the escalation runbook to the operator is **undrilled** (SECD §C/§D, RISK G-3, R-005). Until C-16/C-17 close, reliably meeting the operator's 6-hour clock is **not yet assured** — this is a go-live condition.
- **Personal-data breach dual trigger**: a cyber incident affecting subscriber personal data **also** triggers **PDPA 2010 breach notification to JPDP** (see `ARC-001-PDPA-v1.0` and `ARC-001-DPIA-v1.0`; note the PDPA 72-hour clock runs in parallel to the NACSA 6-hour clock — the **6-hour clock dominates** for design). See `/arckit:my-pdpa`.

## Risks

These feed the core register (`ARC-001-RISK-v1.0`); R-005 is the anchor NCII risk and this SoA's primary cross-reference.

| Risk | Likelihood | Impact | Treatment |
|------|-----------|--------|-----------|
| **R-005 — NCII cyber-resilience gap** (unpatched critical vuln / over-privileged or opaque autonomous flow on telco CNI). Residual **12** (L3×I4), exceeds ≤9 appetite. | Possible (3) | Major (4) | **TREAT** — restore CI scanning to green-gate; **penetration test + NCII attestation + incident-response runbooks** before SI go-live; this SoA cross-checks the control set. Owner: Security Lead. Target residual 9. |
| R-005a (SoA-derived) — **6-hour report unachievable**: no SIEM/alerting + undrilled escalation (C-16/C-17) means the operator may miss its NACSA 6-hour clock. | Possible (3) | Major (4) | TREAT — stand up security-event correlation/alerting; contract + drill operator escalation chain (C-18). Owner: Security Lead. |
| R-005b (SoA-derived) — **NCII audit/attestation not ready** (C-22): operator cannot evidence ibn-core to NACSA on direction. | Possible (3) | Major (4) | TREAT — complete attestation + pen test + evidence pack as G-2 condition. Owner: Security Lead. |
| R-019 (SoA-derived) — **HA/DR SPOFs** (Keycloak, Redis SSoT) breach NCII continuity expectation (C-19) vs NFR-A-002. | Possible (3) | Major (4) | TREAT — HA/DR for IdP + SSoT (HLD blocking gap). Owner: Lead Architect/CTO. |

## External References

### Document Register

| Doc ID | Title | URL | Verified date |
|--------|-------|-----|---------------|
| MY-CSA2024 | Cyber Security Act 2024 [Act 854] (NACSA) | <https://www.nacsa.gov.my/act854.php> | 2026-06-05 |
| MY-NACSA | National Cyber Security Agency (NACSA) | <https://www.nacsa.gov.my> | 2026-06-05 |
| MY-PDPA | Personal Data Protection Act 2010 (am. 2024) — JPDP | <https://www.pdp.gov.my> | 2026-06-05 |
| ARC-001-RISK | ibn-core-my Risk Register (Orange Book) — R-005 NCII | projects/001-ibn-core-my/ARC-001-RISK-v1.0.md | 2026-06-05 |
| ARC-001-SECD | ibn-core-my Secure by Design assessment (NCSC CAF discipline) | projects/001-ibn-core-my/ARC-001-SECD-v1.0.md | 2026-06-05 |
| ARC-001-MYCLAS | ibn-core-my Commercial Data-Sensitivity Classification | projects/001-ibn-core-my/ARC-001-MYCLAS-v1.0.md | 2026-06-05 |
| ARC-001-REQ | ibn-core-my Requirements (NFR-SEC/M/A/C, FR-007/011) | projects/001-ibn-core-my/ARC-001-REQ-v1.0.md | 2026-06-05 |
| ARC-001-ADR-001 | ADR — Operator identity / agent role / CAMARA egress | projects/001-ibn-core-my/decisions/ARC-001-ADR-001-v1.0.md | 2026-06-05 |
| ARC-001-ADR-002 | ADR — Cloud platform & data-centre placement (hybrid) | projects/001-ibn-core-my/decisions/ARC-001-ADR-002-v1.0.md | 2026-06-05 |
| ARC-001-ADR-003 | ADR — Data residency per classification | projects/001-ibn-core-my/decisions/ARC-001-ADR-003-v1.0.md | 2026-06-05 |

### Citations

| Citation | Doc ID | Section | Used in |
|----------|--------|---------|---------|
| [CSA-1] | MY-CSA2024 | NCII duties (risk assessment, audit, code of practice, exercises) | Obligations Register, SoA |
| [CSA-2] | MY-CSA2024 | Incident reporting (6 h initial / 14 d full) | Obligations Register, Incident-Reporting Posture |
| [SECD-A..D] | ARC-001-SECD | CAF Objectives A–D (governance, protection, detection, incident response) | Statement of Applicability |
| [R-005] | ARC-001-RISK | Risk R-005 NCII cyber-resilience gap (residual 12) | NCII Determination, Risks |

### Unreferenced Documents

`ARC-001-DPIA-v1.0` and `ARC-001-AIGE-v1.0` were consulted for the PDPA dual-trigger and HITL-gate context but are cited indirectly via SECD/PDPA cross-references rather than as primary sources here.

---

**Generated by**: ArcKit `/arckit:my-cyber-security` command (community; executed via arckit-build wave 8, command-fallback — slash command, not a Skill-tool skill)
**Generated on**: 2026-06-05
**ArcKit Version**: 5.11.0
**Project**: ibn-core-my (001)
**Model**: Claude Opus 4.8 (1M context)
