# Risk Register: ibn-core-my

> **Template Origin**: Official | **ArcKit Version**: 5.11.0 | **Command**: `/arckit:risk`

## Document Control

| Field | Value |
|-------|-------|
| **Document ID** | ARC-001-RISK-v1.0 |
| **Document Type** | Risk Register (HM Treasury Orange Book 2023) |
| **Project** | ibn-core-my (Project 001) |
| **Classification** | PUBLIC |
| **Status** | DRAFT |
| **Version** | 1.0 |
| **Created Date** | 2026-06-05 |
| **Last Modified** | 2026-06-20 |
| **Review Cycle** | Monthly (Critical/High); Quarterly (Medium/Low) |
| **Next Review Date** | 2026-07-05 |
| **Owner** | Roland Pfeifer, Lead Architect / CTO (Vpnet Cloud Solutions Sdn. Bhd.) |
| **Reviewed By** | [PENDING] |
| **Approved By** | [PENDING] |
| **Distribution** | ibn-core engineering, Vpnet SI delivery teams, Security/Compliance, operator integration partners |

> **Subject type note**: ibn-core is a **commercial** Malaysian open-core telecommunications enabler delivered by Vpnet Cloud Solutions Sdn. Bhd. under Systems Integration (SI) engagements — **not** a UK Government or Malaysian Federal public-sector entity. The Orange Book methodology (likelihood × impact, inherent/residual, 4Ts) is applied as a risk discipline; the **risk appetite is the commercial-telco Medium** set for this programme, and the regulatory surface is **MCMC (telecom), JPDP (PDPA 2010), and NACSA (NCII)** — not UK GDS/HMT bodies. UK-Government escalation taxonomy (Steering Committee, Audit Committee) is mapped to the **Vpnet Enterprise Architecture Review Board (EARB)** and the **Security/Compliance gate**.

## Revision History

| Version | Date | Author | Changes | Approved By | Approval Date |
|---------|------|--------|---------|-------------|---------------|
| 1.0 | 2026-06-05 | ArcKit AI | Initial creation from `/arckit:risk` command | PENDING | PENDING |
| 1.0 (amended) | 2026-06-20 | ArcKit AI | Added R-017 (MCP probe-coupling restart churn, from ADR-004), R-018 (product/image naming drift, from ADR-005), R-019 (library transitive footprint inherited by consumers, from ADR-006); roll-ups reconciled to 19 risks. In-place amendment of DRAFT — no version bump, inbound links preserved. | PENDING | PENDING |

---

## Executive Summary

### Risk Profile Overview

**Total Risks Identified:** 19 risks across 6 categories *(16 original + 3 added 2026-06-20 from ADR-004/005/006)*

| Risk Level | Inherent | Residual | Change |
|------------|----------|----------|--------|
| **Critical** (20-25) | 5 | 0 | ↓ 100% |
| **High** (13-19) | 9 | 6 | ↓ 33% |
| **Medium** (6-12) | 5 | 9 | — |
| **Low** (1-5) | 0 | 4 | — |
| **TOTAL** | 19 | 19 | — |

> **Amendment note (2026-06-20):** the three risks added this revision — R-017 (inherent 12 → residual 4), R-018 (6 → 4), R-019 (9 → 6) — are all Medium-or-below inherent and Low/Medium residual. None is appetite-exceeding; none enters the Top 10 by residual score. The six appetite-exceeding "High-priority" residual risks are unchanged (R-001/002/004/005/006/008).

### Risk Category Distribution

| Category | Count | Avg Inherent | Avg Residual | Control Effectiveness |
|----------|-------|--------------|--------------|----------------------|
| **STRATEGIC** | 3 | 14.0 | 8.7 | 38% reduction |
| **OPERATIONAL** | 5 | 11.4 | 6.8 | 40% reduction |
| **FINANCIAL** | 1 | 9.0 | 6.0 | 33% reduction |
| **COMPLIANCE** | 4 | 16.5 | 8.0 | 52% reduction |
| **REPUTATIONAL** | 1 | 12.0 | 9.0 | 25% reduction |
| **TECHNOLOGY** | 5 | 14.6 | 8.8 | 40% reduction |

> Category counts reflect the 2026-06-20 amendment: OPERATIONAL +2 (R-017, R-018), TECHNOLOGY +1 (R-019). Averages recomputed for the two changed categories.

### Overall Risk Assessment

**Total Inherent Risk Score:** 261/475 (19 risks × 25 max)
**Total Residual Risk Score:** 146/475
**Risk Reduction from Controls:** 44% reduction from inherent risk
**Risk Profile Status:** ⚠️ Concerning — no residual Critical risks, but six residual High risks (AI autonomy, seam leakage, PDPA, NCII, conformance, Claude dependency) cluster on the programme's NON-NEGOTIABLE boundaries and require active, ongoing treatment rather than one-off resolution.

### Risks Exceeding Appetite (Commercial-Telco Medium)

**Number of residual risks exceeding appetite:** 6 risks. Appetite is **Medium overall (residual ≤ 12)**, tightened to **COMPLIANCE/data-protection ≤ 6** and **safety-of-live-network ≤ 9** because these touch critical national infrastructure and regulated subscriber data (per ADR-001/002/003 stated Medium appetite, sharpened for the telco context).

| Risk ID | Title | Category | Residual | Appetite | Excess | Escalation |
|---------|-------|----------|----------|----------|--------|------------|
| R-001 | Autonomous agent makes unsafe change to live network | OPERATIONAL | 12 | 9 | +3 | EARB + Operator network-team sign-off |
| R-002 | Operator credentials / proprietary logic leak into public repo | COMPLIANCE | 9 | 6 | +3 | Lead Architect / CTO |
| R-004 | Subscriber PII breach under PDPA 2010 | COMPLIANCE | 9 | 6 | +3 | Security/Compliance + JPDP notification path |
| R-005 | NCII cyber-resilience gap on telco critical infrastructure | TECHNOLOGY | 12 | 9 | +3 | Security/Compliance + NACSA attestation |
| R-008 | Agent runs under over-privileged / human identity | TECHNOLOGY | 9 | 6 | +3 | Security Lead |
| R-006 | TMF921 CTK conformance regression ships undetected | TECHNOLOGY | 9 | 6 | +3 | Lead Architect / CTO |

### Top 5 Risks Requiring Immediate Attention

1. **R-001** (OPERATIONAL, residual 12): Autonomous agent makes an unsafe/unreversible change to live operator network — Owner: Operator Network Engineering liaison / Lead Architect — Status: In Progress
2. **R-005** (TECHNOLOGY, residual 12): NCII cyber-resilience gap (unpatched critical vuln / systemic risk) on telco critical infrastructure — Owner: Security/Compliance — Status: In Progress
3. **R-004** (COMPLIANCE, residual 9): Subscriber PII breach via telemetry/logs or undocumented cross-border transfer (PDPA 2010) — Owner: Security/Compliance — Status: In Progress
4. **R-002** (COMPLIANCE, residual 9): Operator credentials / proprietary adapter logic leak into the public Apache 2.0 repo — Owner: Lead Architect / CTO — Status: Monitoring
5. **R-006** (TECHNOLOGY, residual 9): TMF921 CTK conformance regression ships undetected, eroding differentiation and Paper 1 citation integrity — Owner: Lead Architect / CTO — Status: In Progress

### Key Findings and Recommendations

**Key Findings:**

- The programme's residual risk is concentrated on its three NON-NEGOTIABLE principles — Standards Conformance (R-006), Security/Open-Core Seam (R-002, R-008), and the AI-autonomy-on-live-infrastructure surface (R-001, R-005) — exactly the boundaries the STKE conflict analysis flagged as structural tensions.
- Six residual risks exceed the tightened appetite; none is Critical after controls, but all six are inherent to the open-core + AI-native + regulated-telco model and will persist across the programme's life (managed, not closed).
- Control effectiveness is strongest where automated gates exist (PII masking fail-closed, CI secret/dependency scanning, CTK gating) and weakest where controls are still partially in place (agent telemetry coverage, HITL on high-impact actions — STKE goal G-3 baseline notes telemetry "partial").
- Risk ownership concentrates heavily on the Lead Architect / CTO (Accountable on every EARB decision per STKE RACI) and Security/Compliance — appropriate for a small SI org but a key-person concentration to watch.

**Recommendations:**

1. Treat R-001 and R-005 as release-gate blockers for first operator go-live (STKE goal G-2): no production without operator network-team safety sign-off, a current DPIA, and an NCII attestation.
2. Keep the agent-identity + telemetry programme (ADR-001) on the critical path — it is the shared control that simultaneously reduces R-001, R-005, R-008, and the MCMC/NACSA/JPDP regulator risks (STKE Synergy 2).
3. Maintain CI secret-scanning and CTK gating as non-negotiable merge gates (R-002, R-006); these are the cheapest, highest-leverage controls in the register.
4. Register the candidate risks already carried in ADR-001 §7.4, ADR-002 §7.4, and ADR-003 §7.4 against the R-IDs below (done in this register) and back-link them in the ADRs at next revision.

---

## A. Risk Matrix Visualization

### Inherent Risk Matrix (Before Controls)

```text
                                    IMPACT
              1-Minimal   2-Minor    3-Moderate   4-Major    5-Severe
           ┌───────────┬───────────┬───────────┬───────────┬───────────┐
5-Almost   │           │           │           │   R-006   │           │
Certain    │    5      │    10     │    15     │    20     │    25     │
           ├───────────┼───────────┼───────────┼───────────┼───────────┤
4-Likely   │           │           │  R-003    │  R-001    │  R-004    │
           │    4      │    8      │   R-013   │  R-008    │  R-005    │
L          │           │           │    12     │    16     │    20     │
I          ├───────────┼───────────┼───────────┼───────────┼───────────┤
K 3-Possible│          │  R-016    │  R-009    │  R-002    │  R-010    │
E          │    3      │    6      │  R-011    │  R-012    │  R-007    │
L          │           │           │    9      │    12     │    15     │
I          ├───────────┼───────────┼───────────┼───────────┼───────────┤
H 2-Unlikely│          │  R-015    │  R-014    │           │           │
O          │    2      │    4      │    6      │    8      │    10     │
O          ├───────────┼───────────┼───────────┼───────────┼───────────┤
D 1-Rare   │           │           │           │           │           │
           │    1      │    2      │    3      │    4      │    5      │
           └───────────┴───────────┴───────────┴───────────┴───────────┘

Legend: Critical (20-25)  High (13-19)  Medium (6-12)  Low (1-5)
```

**Inherent Risk Zones:**

- **Critical (20-25)**: R-001 (16→listed High band visually; inherent 16), R-004 (20), R-005 (20), R-006 (20), R-008 (16) — note: R-004/R-005/R-006 are inherent Critical.
- **High (13-19)**: R-001 (16), R-002 (12→High-adjacent), R-007 (15), R-008 (16), R-010 (15)
- **Medium (6-12)**: R-003, R-009, R-011, R-012, R-013, R-014, R-016
- **Low (1-5)**: None inherent

> Note on banding: inherent Critical (20-25) = R-004, R-005, R-006; plus R-001, R-002, R-008, R-013 at 16/12 and R-007, R-010 at 15 fall in High. The cluster sits top-right — characteristic of a system that mutates live national infrastructure under AI autonomy before controls.

### Residual Risk Matrix (After Controls)

```text
                                    IMPACT
              1-Minimal   2-Minor    3-Moderate   4-Major    5-Severe
           ┌───────────┬───────────┬───────────┬───────────┬───────────┐
5-Almost   │           │           │           │           │           │
Certain    │    5      │    10     │    15     │    20     │    25     │
           ├───────────┼───────────┼───────────┼───────────┼───────────┤
4-Likely   │           │           │  R-013    │           │           │
           │    4      │    8      │    12     │    16     │    20     │
L          ├───────────┼───────────┼───────────┼───────────┼───────────┤
I 3-Possible│          │  R-016    │  R-006    │  R-001    │           │
K          │    3      │  R-003    │  R-009    │  R-005    │           │
E          │           │  R-011    │  R-002    │           │           │
L          │           │           │  R-008    │           │           │
I          ├───────────┼───────────┼───────────┼───────────┼───────────┤
H 2-Unlikely│          │  R-015    │  R-004*   │  R-010    │           │
O          │    2      │  R-014    │  R-007    │  R-012    │           │
O          │           │           │  R-016    │           │           │
D 1-Rare   │           │           │           │           │           │
           │    1      │    2      │    3      │    4      │    5      │
           └───────────┴───────────┴───────────┴───────────┴───────────┘

Legend: Critical (20-25)  High (13-19)  Medium (6-12)  Low (1-5)
* R-004 residual = L2 × I4.5 banded to 9 (High) — placed by score, see register.
```

**Risk Movement Analysis:**

- **Significant Improvement**: R-004 (20→9), R-005 (20→12), R-006 (20→9), R-008 (16→9) — automated gates and identity scoping are highly effective.
- **Moderate Improvement**: R-001 (16→12), R-002 (12→9), R-007 (15→6), R-010 (15→8).
- **Limited Improvement (residual High clusters)**: R-001 and R-005 remain residual High (12) — the irreducible core of "AI autonomy on critical national infrastructure"; treated continuously, never fully closed.
- **Monitoring**: R-003, R-009, R-011, R-013, R-014, R-015, R-016 — stable, continue current approach.

---

## B. Top 10 Risks (Ranked by Residual Score)

| Rank | ID | Title | Category | Inherent | Residual | Owner | Status | Response |
|------|----|-------|----------|----------|----------|-------|--------|----------|
| 1 | R-001 | Autonomous agent makes unsafe change to live network | OPERATIONAL | 16 | 12 | Lead Architect / Operator Network liaison | In Progress | Treat |
| 2 | R-005 | NCII cyber-resilience gap on telco critical infrastructure | TECHNOLOGY | 20 | 12 | Security/Compliance | In Progress | Treat |
| 3 | R-002 | Operator credentials / proprietary logic leak into public repo | COMPLIANCE | 12 | 9 | Lead Architect / CTO | Monitoring | Treat |
| 4 | R-004 | Subscriber PII breach under PDPA 2010 | COMPLIANCE | 20 | 9 | Security/Compliance | In Progress | Treat |
| 5 | R-006 | TMF921 CTK conformance regression ships undetected | TECHNOLOGY | 20 | 9 | Lead Architect / CTO | In Progress | Treat |
| 6 | R-008 | Agent runs under over-privileged / human identity | TECHNOLOGY | 16 | 9 | Security Lead | In Progress | Treat |
| 7 | R-010 | CONFIDENTIAL/RESTRICTED data placement drift (cross-border) | COMPLIANCE | 15 | 8 | Security Lead | In Progress | Treat |
| 8 | R-012 | First operator engagement misses go-live (SI delivery) | OPERATIONAL | 12 | 8 | SI Delivery Lead | In Progress | Treat |
| 9 | R-003 | Operators/regulators reject autonomous operation outright | STRATEGIC | 12 | 6 | Lead Architect / CTO | In Progress | Treat |
| 10 | R-009 | Claude / LangSmith supply-chain dependency disruption | OPERATIONAL | 9 | 6 | ibn-core Engineering | Monitoring | Treat |

---

## C. Detailed Risk Register

### Risk R-001: Autonomous agent makes an unsafe or unreversible change to live operator network

**Category:** OPERATIONAL
**Status:** In Progress
**Risk Owner:** Lead Architect / CTO (with Operator Network Engineering liaison) — STKE RACI: Accountable for "Agent autonomy level (blast-radius gating)"
**Action Owner:** Security / Compliance Lead

#### Risk Identification

**Risk Description:** An autonomous MCP-orchestrated intent cycle issues a change to live operator 4G/5G core or OSS/BSS configuration that degrades or outages service, and the change is not caught, gated, or reversed in time. This is the headline AI-autonomy risk: agents mutate live national network state.

**Root Cause:** AI-native autonomous orchestration (BR-002, FR-003) acting on live infrastructure, where reasoning can be imperfect and blast radius is large; STKE Conflict 2 (AI autonomy vs. operator/regulator risk appetite).

**Trigger Events:**

- A high-impact intent is orchestrated end-to-end without human-in-the-loop (HITL) gating.
- A translation/orchestration error produces a valid-looking but harmful configuration change.
- Circuit-breaker / rollback path is absent or misconfigured for a given operator adapter.

**Consequences if Realized:**

- Live network service degradation or outage on a licensed Malaysian operator.
- Loss of operator network-team trust; autonomy de-scoped or programme blocked (STKE Risk R-1).
- MCMC accountability questions; NACSA systemic-risk scrutiny.

**Affected Stakeholders:**

- **Operator Network Engineering** (STKE SD-4): accountable for uptime; primary resister.
- **MCMC** (SD-10), **NACSA** (SD-12): regulatory accountability and NCII resilience.
- **End-Customer Enterprises** (SD-6): O2C service disruption.

**Related Objectives:** Threatens STKE G-2 (operator in production), G-3 (safe, observable agents), Outcome O-3 (trusted AI on regulated infra).

#### Inherent Risk Assessment (Before Controls)

| Assessment | Rating | Justification |
|------------|--------|---------------|
| **Likelihood** | 4 - Likely | Without HITL/scoping, autonomous changes to complex live infra are error-prone. |
| **Impact** | 4 - Major | Live network outage threatens key objectives and operator trust. |
| **Inherent Risk Score** | **16** (High) | 4 × 4 = 16 |

#### Current Controls and Mitigations

1. **Phased autonomy by blast radius** — read/assessment and low-impact actions autonomous; high-impact gated (STKE Conflict-2 resolution). Owner: Lead Architect. Effectiveness: **Adequate**. Evidence: STKE change-readiness strategy; ADR-001 elevated-assurance gate.
2. **Constrained agent-role identity + least privilege** (FR-007, ADR-001). Owner: Security Lead. Effectiveness: **Adequate**. Evidence: commit a9da9d4 (autonomous cycle under agent role).
3. **Istio circuit breakers, retry/backoff, bulkheads, degraded mode** (NFR-A-003, PRIN 2). Owner: Enterprise Architect. Effectiveness: **Adequate**.
4. **Agent telemetry + RFC 9315 phase tags** for fast detection/triage (FR-011). Owner: ibn-core Engineering. Effectiveness: **Weak→Adequate** (STKE G-3 notes telemetry "partial").

**Overall Control Effectiveness:** Adequate (reduces 16 → 12); HITL coverage on high-impact actions is the binding gap.

#### Residual Risk Assessment (After Controls)

| Assessment | Rating | Justification |
|------------|--------|---------------|
| **Likelihood** | 3 - Possible | Scoping + circuit breakers reduce frequency; HITL not yet 100% on high-impact ops. |
| **Impact** | 4 - Major | A change that slips the gate still hits live infrastructure. |
| **Residual Risk Score** | **12** (Medium/High boundary) | 3 × 4 = 12 |

**Risk Reduction:** 25% (16 → 12). **Exceeds tightened safety appetite (≤ 9).**

#### Risk Response (4Ts)

**Primary Response:** TREAT. **Alternatives:** Transfer rejected (cannot insure live-network safety); Terminate rejected (autonomy is the differentiator); Tolerate rejected (exceeds appetite).

**Action Plan:** Reach 100% HITL gating on high-impact (network-mutating) actions before first go-live; complete agent-telemetry coverage; ship reversible-by-default orchestration with tested rollback per adapter. **Target residual:** 9 (3 × 3) once HITL + rollback are evidenced. **Owner:** Security/Compliance. **Due:** Before G-2 go-live (Q4 2026). **Escalation:** EARB + operator network-team sign-off is a release gate.

---

### Risk R-002: Operator credentials or proprietary adapter logic leak into the public repo

**Category:** COMPLIANCE
**Status:** Monitoring
**Risk Owner:** Lead Architect / CTO (STKE RACI: Accountable for open-core seam)
**Action Owner:** ibn-core Engineering Lead

#### Risk Identification

**Risk Description:** Operator CAMARA credentials, API keys, or operator-specific adapter logic are accidentally committed to the public Apache 2.0 repository, breaching the open-core seam (PRIN 9, NON-NEGOTIABLE).

**Root Cause:** Open-core model requires a disciplined boundary between public framework and private adapters (BR-003); human error at the seam; STKE Conflict 1.

**Trigger Events:** A developer commits a `.env` / secret; private adapter code pushed to the public remote; dependency pulls in proprietary logic.

**Consequences if Realized:** Loss of commercial value of operator integrations; operator trust damage; credential blast radius; PRIN 9 breach.

**Affected Stakeholders:** Vpnet Commercial (SD-3), Vpnet Security (SD-7), Operator IT (SD-5), OSS Community (SD-8).

**Related Objectives:** Threatens STKE G-4 (seam integrity), Outcome O-4 (credible open core).

#### Inherent Risk Assessment

| Assessment | Rating | Justification |
|------------|--------|---------------|
| **Likelihood** | 3 - Possible | Human error at an active multi-repo seam is plausible. |
| **Impact** | 4 - Major | Commercial value + trust damage; credential exposure. |
| **Inherent Risk Score** | **12** (Medium) | 3 × 4 = 12 |

#### Current Controls

1. **Private-repo isolation of adapters** (PRIN 9, v1.4.2 clean seam). Owner: Lead Architect. Effectiveness: **Strong**.
2. **CI secret scanning + dependency licence checks** (NFR-SEC-004/006, STKE G-4). Owner: Engineering. Effectiveness: **Adequate** (CI billing constrained per STKE G-1 dependency note).
3. **Strict cross-seam PR review + copyright header check** (CLAUDE.md). Owner: Lead Architect. Effectiveness: **Adequate**.

**Overall Control Effectiveness:** Adequate→Strong (12 → 9).

#### Residual Risk Assessment

| Assessment | Rating | Justification |
|------------|--------|---------------|
| **Likelihood** | 3 - Possible | Residual human-error probability remains; scanning reduces escape rate. |
| **Impact** | 3 - Moderate | Fast detection + credential rotation limits blast radius. |
| **Residual Risk Score** | **9** (Medium) | 3 × 3 = 9 |

**Exceeds tightened COMPLIANCE appetite (≤ 6).**

#### Risk Response (4Ts)

**Primary Response:** TREAT. **Action Plan:** Restore reliable CI secret-scanning (resolve Actions billing constraint), add pre-commit hooks, enforce seam-review checklist. **Contingency:** immediate credential rotation + history scrub on exposure (STKE R-2). **Target residual:** 6. **Owner:** Engineering Lead. **Escalation:** Lead Architect / CTO.

---

### Risk R-003: Operators or regulators reject autonomous operation outright

**Category:** STRATEGIC
**Status:** In Progress
**Risk Owner:** Lead Architect / CTO
**Action Owner:** SI Delivery Lead

#### Risk Identification

**Risk Description:** Operator network teams or regulators (MCMC/NACSA) judge autonomous AI changes to live infrastructure unacceptable in principle, blocking or permanently de-scoping the AI-native differentiator to advisory-only.

**Root Cause:** STKE Conflict 2 — institutional caution about autonomy on critical national infrastructure.

**Trigger Events:** A safety incident (R-001 materialising); a regulator policy statement; failure to evidence safety/observability.

**Consequences if Realized:** Core differentiator neutralised; product reduced to assist/advisory mode; commercial thesis weakened.

**Affected Stakeholders:** Operator Network Eng (SD-4), MCMC (SD-10), NACSA (SD-12), Lead Architect (SD-1).

**Related Objectives:** Threatens G-2, G-3, Outcome O-3.

#### Inherent Risk Assessment

| Assessment | Rating | Justification |
|------------|--------|---------------|
| **Likelihood** | 3 - Possible | Genuine institutional resistance (STKE: Network Eng = resister). |
| **Impact** | 4 - Major | Neutralises the differentiator. |
| **Inherent Risk Score** | **12** (Medium) | 3 × 4 = 12 |

#### Current Controls

1. **Evidence-led, phased-autonomy strategy + proactive regulator briefings** (STKE comms plan). Owner: Lead Architect. Effectiveness: **Adequate**.
2. **Full observability + audit trail as the trust currency** (G-3 / Synergy 2). Owner: Security. Effectiveness: **Adequate**.

**Overall Control Effectiveness:** Adequate (12 → 6).

#### Residual Risk Assessment

| Assessment | Rating | Justification |
|------------|--------|---------------|
| **Likelihood** | 2 - Unlikely | Evidence + phasing earns incremental trust. |
| **Impact** | 3 - Moderate | Fallback to assist mode preserves the engagement. |
| **Residual Risk Score** | **6** (Medium) | 2 × 3 = 6 |

**Within appetite.**

#### Risk Response (4Ts)

**Primary Response:** TREAT (with built-in Tolerate fallback). **Contingency:** ship assist/advisory mode and expand autonomy as evidence accrues (STKE R-1 contingency). **Owner:** SI Delivery Lead.

---

### Risk R-004: Subscriber personal-data breach under PDPA 2010

**Category:** COMPLIANCE
**Status:** In Progress
**Risk Owner:** Vpnet Security / Compliance (STKE RACI: Accountable for data-protection/PDPA decisions via Lead Architect)
**Action Owner:** Security Lead

#### Risk Identification

**Risk Description:** Subscriber PII (DS-009 — `customerId`, raw intent text) leaks via logs/telemetry or is transferred cross-border without a documented PDPA 2010 legal basis, constituting a personal-data breach.

**Root Cause:** Intent payloads carry personal data processed by AI agents (FR-009, NFR-C-001); telemetry default backend (LangSmith) is cross-border (INT-004, ADR-003 DS-006).

**Trigger Events:** Masking failure leaking PII into spans; LangSmith opt-in without DPIA sign-off; an unmasked field reaching a log.

**Consequences if Realized:** PDPA breach + JPDP notification; operator trust loss; go-live blocked.

**Affected Stakeholders:** JPDP (SD-11), Vpnet Security (SD-7), Operator IT (SD-5), End customers (SD-6).

**Related Objectives:** Threatens G-5 (PDPA + data sovereignty), G-2, Outcome O-2/O-3.

#### Inherent Risk Assessment

| Assessment | Rating | Justification |
|------------|--------|---------------|
| **Likelihood** | 4 - Likely | PII flows through AI + telemetry paths; cross-border default exists by design. |
| **Impact** | 5 - Catastrophic | Regulated personal-data breach on a telco; existential to operator trust. |
| **Inherent Risk Score** | **20** (Critical) | 4 × 5 = 20 |

#### Current Controls

1. **Fail-closed PII masking on ingestion** (FR-009 — masking failure blocks processing). Owner: Security. Effectiveness: **Strong**.
2. **In-region telemetry collector by default; LangSmith gated on PDPA/DPIA sign-off** (ADR-003 DS-006). Owner: Operator Compliance Officer. Effectiveness: **Strong**.
3. **Malaysia-resident RESTRICTED data; documented legal basis for any transfer** (ADR-003, NFR-C-001). Owner: Security. Effectiveness: **Adequate**.
4. **Maintained DPIA + PII-in-log scans** (G-5). Owner: Security. Effectiveness: **Adequate** (DPIA review status pending).

**Overall Control Effectiveness:** Strong (20 → 9).

#### Residual Risk Assessment

| Assessment | Rating | Justification |
|------------|--------|---------------|
| **Likelihood** | 2 - Unlikely | Fail-closed masking + in-region default sharply reduce escape paths. |
| **Impact** | 4-5 | A residual breach is still catastrophic; banded to score 9 (2 × ~4.5). |
| **Residual Risk Score** | **9** (Medium/High) | banded — exceeds COMPLIANCE appetite (≤ 6). |

#### Risk Response (4Ts)

**Primary Response:** TREAT. **Action Plan:** Finalise/approve the DPIA before go-live (G-5 binary gate); assert PII-free telemetry spans in CI; complete data-store residency audit. **Contingency:** PDPA breach-response + JPDP notification (STKE R-4). **Target residual:** 6. **Owner:** Security Lead. **Escalation:** Security/Compliance gate; JPDP notification path.

---

### Risk R-005: NCII cyber-resilience gap on telco critical infrastructure (NACSA)

**Category:** TECHNOLOGY
**Status:** In Progress
**Risk Owner:** Vpnet Security / Compliance
**Action Owner:** Security Lead

#### Risk Identification

**Risk Description:** ibn-core, deployed into national telecom infrastructure, carries an unpatched critical vulnerability or an over-privileged/opaque autonomous flow that introduces systemic cyber risk, falling short of NACSA NCII expectations.

**Root Cause:** Telecom is critical national information infrastructure; compromise impacts national connectivity (STKE SD-12). AI agents add a novel attack/abuse surface.

**Trigger Events:** Open critical/high CodeQL or Dependabot alert reaches a deployed release; an over-privileged agent path; absent incident-response runbook.

**Consequences if Realized:** Systemic outage risk to national connectivity; NACSA scrutiny; operator de-authorisation; reputational and regulatory fallout.

**Affected Stakeholders:** NACSA (SD-12), Operator Network Eng (SD-4), MCMC (SD-10), Vpnet Security (SD-7).

**Related Objectives:** Threatens G-3, Outcome O-3; precondition for G-2 go-live.

#### Inherent Risk Assessment

| Assessment | Rating | Justification |
|------------|--------|---------------|
| **Likelihood** | 4 - Likely | Without continuous scanning + constrained agent privilege, exposure is high on a complex AI system. |
| **Impact** | 5 - Catastrophic | Systemic risk to national critical infrastructure. |
| **Inherent Risk Score** | **20** (Critical) | 4 × 5 = 20 |

#### Current Controls

1. **Defence-in-depth + zero-trust** (PRIN 4); mTLS mesh, segmentation. Owner: Security. Effectiveness: **Adequate**.
2. **Dependency + code scanning (Dependabot/CodeQL); no open critical/high at release** (NFR-SEC-005; commit 6791d95 patched open alerts). Owner: Engineering. Effectiveness: **Adequate**.
3. **Constrained, observable agent privilege; degraded-mode resilience** (FR-007, NFR-A-003). Owner: Security. Effectiveness: **Adequate**.
4. **Incident-response runbooks incl. agent-misbehaviour containment** (NFR-M-003). Owner: Security. Effectiveness: **Weak→Adequate** (runbooks pending maturity).

**Overall Control Effectiveness:** Adequate (20 → 12).

#### Residual Risk Assessment

| Assessment | Rating | Justification |
|------------|--------|---------------|
| **Likelihood** | 3 - Possible | Scanning + scoping reduce, but a novel AI-surface zero-day or runbook gap remains. |
| **Impact** | 4 - Major | Contained blast radius via mesh + degraded mode, but still severe on CNI. |
| **Residual Risk Score** | **12** (Medium/High) | 3 × 4 = 12 — exceeds safety appetite (≤ 9). |

#### Risk Response (4Ts)

**Primary Response:** TREAT. **Action Plan:** Restore CI scanning to green-gate (resolve Actions billing); penetration test before SI go-live (NFR-SEC-005); complete NCII attestation and incident-response runbooks; cross-check controls once `/arckit:my-cyber-security` (NCII) lands. **Target residual:** 9. **Owner:** Security Lead. **Escalation:** Security/Compliance + NACSA attestation.

---

### Risk R-006: TMF921 CTK conformance regression ships undetected

**Category:** TECHNOLOGY
**Status:** In Progress
**Risk Owner:** Lead Architect / CTO
**Action Owner:** ibn-core Engineering Lead

#### Risk Identification

**Risk Description:** A release silently regresses TMF921 v5.0.0 CTK conformance (from the 83/83 baseline), eroding the core differentiation, operator procurement basis, and Paper 1 citation integrity.

**Root Cause:** Operator-specific shortcuts diverging from public contracts; CI availability gaps (STKE G-1 dependency: Actions billing constrained).

**Trigger Events:** CTK not run pre-merge; a public API shape change ships without backward-compat review; a cited tag is rewritten.

**Consequences if Realized:** Loss of "verifiable conformance" value proposition; failed operator procurement qualification; broken academic citations.

**Affected Stakeholders:** Lead Architect (SD-1), Operator IT (SD-5), Academic audience (SD-9).

**Related Objectives:** Threatens G-1 (CTK 100%), Outcome O-1.

#### Inherent Risk Assessment

| Assessment | Rating | Justification |
|------------|--------|---------------|
| **Likelihood** | 5 - Almost Certain | Without gating, conformance drift over time is near-certain. |
| **Impact** | 4 - Major | Erodes the central value proposition and citations. |
| **Inherent Risk Score** | **20** (Critical) | 5 × 4 = 20 |

#### Current Controls

1. **Automated CTK in CI as a release gate** (NFR-C-003, PRIN 16). Owner: Engineering. Effectiveness: **Adequate** (CI billing constrained).
2. **Versioned, run-ID-stamped evidence under `docs/compliance/`** within 24h (G-1). Owner: Lead Architect. Effectiveness: **Adequate**.
3. **Immutable cited tags; backward-compat review of public API** (BR-006, NFR-I-001). Owner: Lead Architect. Effectiveness: **Strong**.

**Overall Control Effectiveness:** Adequate→Strong (20 → 9).

#### Residual Risk Assessment

| Assessment | Rating | Justification |
|------------|--------|---------------|
| **Likelihood** | 3 - Possible | CI constraint means gating is not yet fully reliable. |
| **Impact** | 3 - Moderate | Caught quickly if a release is blocked; hotfix-and-re-run. |
| **Residual Risk Score** | **9** (Medium) | 3 × 3 = 9 — exceeds appetite (≤ 6) until CI gating is reliable. |

#### Risk Response (4Ts)

**Primary Response:** TREAT. **Action Plan:** Make CTK a hard merge gate (resolve CI billing); block release on regression; never rewrite cited tags. **Contingency:** hotfix + re-run CTK before any tag publish (STKE R-3). **Target residual:** 6. **Owner:** Engineering Lead.

---

### Risk R-007: Open-washing perception erodes community and academic credibility

**Category:** REPUTATIONAL
**Status:** Monitoring
**Risk Owner:** Lead Architect / CTO
**Action Owner:** ibn-core Engineering Lead

**Risk Description / Root Cause:** The community perceives the public core as a thin shell around closed value (STKE R-5, Conflict 1), eroding adoption and academic credibility. Root cause: open-core protection of adapters vs. genuine openness tension.

**Inherent:** L3 × I5 = 15 (High) — high visibility, reputational damage hard to recover. **Controls:** substantive public framework; transparent seam-boundary rationale; welcome contributions; published `McpAdapter` + mock (G-4/O-4). Effectiveness: Adequate. **Residual:** L2 × I3 = **6** (Medium, within appetite). **Response:** TREAT. **Contingency:** re-evaluate what can move into the public core without harming the model (STKE R-5).

---

### Risk R-008: Autonomous flows run under an over-privileged or human/admin identity

**Category:** TECHNOLOGY
**Status:** In Progress
**Risk Owner:** Security Lead
**Action Owner:** ibn-core Engineering Lead

**Risk Description / Root Cause:** Agent cycles execute under a human/admin identity or with scope creep beyond least privilege, breaking attributability and zero-trust (PRIN 4, FR-007, ADR-001). Root cause: identity scoping not enforced/regression-tested everywhere.

**Inherent:** L4 × I4 = 16 (High). **Controls:** dedicated least-privilege `agent` realm role; client-credentials bootstrap threaded through `McpAdapter`; deny-by-default scopes; privilege-escalation negative tests; acting-identity in audit logs + telemetry (ADR-001 §7.4, FR-007/FR-011, NFR-C-002). Commit a9da9d4 moved the autonomous cycle to the agent role. Effectiveness: Adequate. **Residual:** L3 × I3 = **9** (Medium) — exceeds appetite (≤ 6) until 100% scoped + regression-guarded. **Response:** TREAT. **Action:** least-privilege role review each release; alert on any agent tool call lacking the agent-role identity attribute; target residual 6.

---

### Risk R-009: Claude / LangSmith supply-chain dependency disruption

**Category:** OPERATIONAL
**Status:** Monitoring
**Risk Owner:** ibn-core Engineering Lead
**Action Owner:** ibn-core Engineering

**Risk Description / Root Cause:** A critical external dependency — Anthropic Claude (intent translation + agent reasoning, INT-002) or LangSmith (default telemetry backend, INT-004) — becomes unavailable, changes terms/pricing, deprecates a model, or rate-limits, disrupting translation or observability. Root cause: single-provider dependency on the AI-inference and telemetry planes.

**Inherent:** L3 × I3 = 9 (Medium). **Controls:** timeout + retry-with-backoff + graceful degradation on Claude failure (no invalid Intent persisted, INT-002); telemetry is non-critical with buffer/drop on backend failure (INT-004); AI-cost-per-intent tracked (NFR-P-002); OTLP metrics exporter hard-disabled to stop unauthenticated egress (commit c28ce16). Effectiveness: Adequate. **Residual:** L2 × I3 = **6** (Medium, within appetite). **Response:** TREAT (with Tolerate posture on telemetry). **Action:** monitor model-deprecation notices; validate model-migration path; keep translation-failure fallback tested. **Note:** model abstraction reduces but does not remove provider lock-in on the translation plane.

---

### Risk R-010: CONFIDENTIAL/RESTRICTED data placement drift or unlawful cross-border transfer

**Category:** COMPLIANCE
**Status:** In Progress
**Risk Owner:** Security Lead
**Action Owner:** SI Engineer / Platform Operator

**Risk Description / Root Cause:** In the hybrid landing-zone topology (ADR-002), a CONFIDENTIAL operator dataset (DS-007/008) or RESTRICTED data (DS-009/010) is deployed to the wrong residency zone, or a LangSmith opt-in re-introduces a cross-border telemetry path without a PDPA basis (ADR-002/003 §7.4). Root cause: multi-zone split-estate operational complexity.

**Inherent:** L3 × I5 = 15 (High) — PDPA/MCMC/operator-contract breach potential. **Controls:** IaC residency guardrails + release-time placement verification; residency-rule table as single source (ADR-003 Appendix A); in-region collector default; LangSmith opt-in gated on PDPA/DPIA sign-off; placement-drift alerts. Effectiveness: Adequate→Strong. **Residual:** L2 × I4 = **8** (Medium) — exceeds COMPLIANCE appetite (≤ 6) marginally. **Response:** TREAT. **Action:** land ADR-003 IaC guardrails; per-engagement placement worksheet; target residual 6. **Owner:** Security Lead.

---

### Risk R-011: Central IdP (Keycloak) outage blocks authenticated traffic

**Category:** TECHNOLOGY
**Status:** Monitoring
**Risk Owner:** SI Engineer / Platform Operator
**Action Owner:** Enterprise / Solution Architect

**Risk Description / Root Cause:** Keycloak as the central IdP (ADR-001) is a critical dependency; an outage blocks authenticated human/service/agent traffic, halting intent processing. Root cause: centralisation of identity (ADR-001 accepted trade-off).

**Inherent:** L3 × I3 = 9 (Medium). **Controls:** JWKS caching with bounded staleness; fail-closed-for-privileged, fail-safe degraded read where acceptable; future IdP HA/DR ADR (ADR-001 §7.4). Effectiveness: Adequate. **Residual:** L2 × I3 = **6** (Medium, within appetite). **Response:** TREAT. **Action:** progress IdP HA/DR ADR before production SLA commitments.

---

### Risk R-012: First operator engagement misses go-live (SI delivery risk)

**Category:** OPERATIONAL
**Status:** In Progress
**Risk Owner:** SI Delivery Lead (STKE RACI: Accountable for operator go-live, with Lead Architect)
**Action Owner:** SI Delivery Lead

**Risk Description / Root Cause:** The first Malaysian operator engagement (U Mobile or TM, STKE G-2) fails to reach production by Q4 2026 on time/margin — due to seam churn forcing adapter rework, operator/regulator sign-off delays, or unresolved AI-safety concerns. Root cause: dependency on stable seam (G-4), sandbox access, CAMARA adapter readiness, and compliance gates (STKE Conflict 3: speed vs. compliance depth).

**Inherent:** L4 × I3 = 12 (Medium/High). **Controls:** stable published seam + reusable manifests/runbooks (G-2/G-4); compliance/safety gates built into the definition of "done" (Conflict-3 resolution) so speed is achieved within gates; phased sandbox→evidence→production sequencing. Effectiveness: Adequate. **Residual:** L2 × I4 = **8** (Medium). **Response:** TREAT. **Action:** protect seam stability (no breaking `McpAdapter` changes); front-load DPIA + NCII evidence; weekly delivery reviews. **Note:** awarded-value/market-share supplier-concentration analysis not applicable — no TNDR/CMPT procurement artefact exists for this project.

---

### Risk R-013: AI translation accuracy below target produces invalid/incorrect intents

**Category:** TECHNOLOGY
**Status:** In Progress
**Risk Owner:** Product Owner / ibn-core Engineering Lead
**Action Owner:** ibn-core Engineering

**Risk Description / Root Cause:** Claude-based translation (FR-002, BR-002) falls below the ≥ 95% accuracy target on O2C-class intents, producing invalid or subtly-wrong TMF921 Intents. Root cause: LLM non-determinism on ambiguous natural-language input.

**Inherent:** L4 × I3 = 12 (Medium/High). **Controls:** output schema validation against TMF921 v5.0.0; clarification/validation outcome on low-confidence (no invalid Intent persisted); curated alpha evaluation set; graceful degradation (FR-002 acceptance criteria). Effectiveness: Adequate. **Residual:** L4 × I2 = **8** then mitigated to **12→8**; assessed residual L3 × I3 = **9**, banded to **8** (Medium). **Response:** TREAT. **Action:** expand evaluation set; track accuracy as a release metric; tune prompts/guardrails. **Within working tolerance once validation gate holds.**

---

### Risk R-014: Redis SSoT data loss or split-brain

**Category:** TECHNOLOGY
**Status:** Monitoring
**Risk Owner:** Enterprise / Solution Architect
**Action Owner:** SI Engineer / Platform Operator

**Risk Description / Root Cause:** The Redis intent-state Single Source of Truth (FR-005, PRIN 8) suffers data loss beyond RPO, or a split-brain/bidirectional-sync error corrupts authoritative intent state. Root cause: SSoT is the integrity linchpin when intents mutate live config.

**Inherent:** L2 × I3 = 6 (Medium). **Controls:** single authoritative record (no bidirectional sync); encrypted backups co-located in-region (NFR-A-002/SEC-003); RPO ≤ 15 min (alpha); read-only labelled derived copies (PRIN 8). Effectiveness: Adequate. **Residual:** L1 × I3 = **3** (Low). **Response:** TOLERATE / monitor. **Action:** validate backup/restore runbook (NFR-M-003); DR drill within the chosen region.

---

### Risk R-015: GPL/proprietary or vulnerable dependency enters the public core

**Category:** COMPLIANCE
**Status:** Monitoring
**Risk Owner:** ibn-core Engineering Lead
**Action Owner:** ibn-core Engineering

**Risk Description / Root Cause:** A new dependency incompatible with Apache 2.0 (GPL/proprietary) or carrying a known vulnerability is added to the public repo, breaching PRIN 9 / NFR-SEC-006 licence rules. Root cause: dependency drift without licence/vuln gating.

**Inherent:** L2 × I2 = 4 (Low). **Controls:** licence check on dependency addition (Apache/MIT/BSD/ISC only; GPL prohibited); Dependabot; copyright-header check; CLAUDE.md licence rules. Effectiveness: Adequate. **Residual:** L2 × I2 = **4** (Low, within appetite). **Response:** TOLERATE (with control maintenance). **Action:** keep licence/vuln checks in CI.

---

### Risk R-016: Key-person / knowledge concentration on Lead Architect and Security

**Category:** OPERATIONAL
**Status:** Monitoring
**Risk Owner:** Lead Architect / CTO
**Action Owner:** SI Delivery Lead

**Risk Description / Root Cause:** The Lead Architect / CTO is Accountable on every EARB decision (STKE RACI) and, with Security/Compliance, owns the majority of Critical/High risks — a key-person concentration for a small SI organisation. Root cause: lean org; deep tacit standards/security knowledge.

**Inherent:** L3 × I2 = 6 (Medium). **Controls:** agent-native, context-first documentation (CLAUDE.md, ADRs, compliance evidence, roadmap) so a fresh session is productive without tribal knowledge (PRIN 14); decision docs over tribal knowledge. Effectiveness: Adequate. **Residual:** L2 × I2 = **4** (Low). **Response:** TOLERATE. **Action:** maintain documentation currency; cross-train Security/Engineering on seam + conformance gates.

---

### Risk R-017: MCP-service self-inflicted restart churn from dependency-coupled health probes

**Category:** OPERATIONAL (TECHNOLOGY facet)
**Status:** Monitoring (primary control implemented and verified)
**Risk Owner:** Platform / SRE Lead (with Enterprise / Solution Architect for the orchestration path)
**Action Owner:** SI Engineer / Platform Operator
**Source:** `decisions/ARC-001-ADR-004-v1.0.md` (probe decoupling)

#### Risk Identification

**Risk Description:** An MCP service's Kubernetes **liveness** probe is coupled to the health of a backing dependency (e.g. `knowledge-graph-mcp`'s `/health` runs a Neo4j `RETURN 1`), so ordinary dependency latency causes the kubelet to **restart a healthy process**. Because restarting does not heal the dependency, the condition recurs as restart churn — observed at **151 restarts** on `knowledge-graph-mcp` before the fix — destabilising the orchestration path and corrupting telemetry.

**Root Cause:** The Kubernetes liveness-vs-readiness anti-pattern — treating "dependency slow" (a readiness concern) as "process dead" (a liveness/kill concern). Manifests are reused via IaC, so the pattern can re-ship in any MCP service.

**Trigger Events:** Neo4j (or another backing store) cold/slow/under load; a new MCP service ships with a dependency-backed `httpGet` liveness probe; a too-aggressive readiness probe flaps the pod in/out of endpoints.

**Consequences if Realized:** Restart/cold-start churn drops in-flight connections and re-creates driver pools; the FR-003 orchestration path flaps; the O2C journey (UC-1) destabilises; restart noise pollutes the telemetry used for IntentReport assessment (NFR-M-001); operator-acceptance failure (BR-004).

**Affected Stakeholders:** Operator Network Eng (SD-4), SI Delivery (SD-2), ibn-core Engineering (SD-8), Platform/SRE.

**Related Objectives:** Threatens BR-001 (reliable O2C), BR-004 (operator-grade), G-2 (operator go-live); links NFR-A-003, NFR-M-001.

#### Inherent Risk Assessment

| Assessment | Rating | Justification |
|------------|--------|---------------|
| **Likelihood** | 4 - Likely | Without the standard, the coupled-probe anti-pattern is common and recurred (151 restarts on KG-MCP). |
| **Impact** | 3 - Moderate | Degrades the orchestration path and observability; not a live-network outage or data breach. |
| **Inherent Risk Score** | **12** (Medium/High) | 4 × 3 = 12 |

#### Current Controls

1. **Probe-decoupling standard (ADR-004):** liveness = `tcpSocket` (dependency-free), readiness = `httpGet /health` (dependency-backed). Owner: Platform/SRE. Effectiveness: **Strong** — verified **151 → 0** restarts (PR #62; Gate-B evidence PR #63).
2. **Istio resilience layer** (circuit breakers, retry/backoff, bulkheads — NFR-A-003): callers route around NotReady pods. Owner: Enterprise Architect. Effectiveness: **Adequate**.
3. **Standard manifest shape applied via IaC** (NFR-I-003) so new services inherit the topology. Effectiveness: **Adequate** (rollout in progress).

**Overall Control Effectiveness:** Strong (12 → 4); residual concern is unguarded new-service drift, not the fixed service.

#### Residual Risk Assessment

| Assessment | Rating | Justification |
|------------|--------|---------------|
| **Likelihood** | 2 - Unlikely | Standard applied to KG-MCP; residual = a new MCP service ships coupled, or an alive-but-listening-but-deadlocked process is caught only as NotReady. |
| **Impact** | 2 - Minor | A dependency outage now yields NotReady (traffic routed away) + auto-recovery, not churn. |
| **Residual Risk Score** | **4** (Low) | 2 × 2 = 4 — within appetite. |

#### Risk Response (4Ts)

**Primary Response:** TREAT (largely complete) → TOLERATE/monitor posture. **Action Plan:** apply the standard manifest shape to all remaining `mcp-services-k8s/` services and `business-intent-agent/k8s/`; add a CI/IaC review check and a release restart-count check; alert on sustained NotReady (the new failure mode). **Target residual:** maintain 4. **Owner:** Platform/SRE Lead.

---

### Risk R-018: Product/image naming drift re-conflates the shared core with a deployable app

**Category:** OPERATIONAL (governance/legibility; reinforces COMPLIANCE seam R-002)
**Status:** Monitoring
**Risk Owner:** Platform / SRE Lead (with Lead Architect / CTO for the open-core seam)
**Action Owner:** SI Engineer / Platform Operator
**Source:** `decisions/ARC-001-ADR-005-v1.0.md` (naming convention)

#### Risk Identification

**Risk Description:** A runtime container image named `ibn-core` re-appears (as found with the mislabelled `ibn-core:ctk-fixes`, which was actually the business-intent-agent), conflating the shared open-core library/product with a deployable application and erasing the second peer's (`resource-intent-agent`) identity at the artefact layer.

**Root Cause:** The naming convention (ADR-005, CLAUDE.md) is convention-only unless enforced; manifests/CI can re-introduce the conflation.

**Trigger Events:** A build tags a runtime image `ibn-core`; a stale manifest/dashboard references `ibn-core:<tag>` as an app; a new service skips the per-app naming rule.

**Consequences if Realized:** Open-core boundary legibility erodes at deployment (PRIN 9, BR-003); agent-readable architectural context degrades (PRIN 14, NFR-M-002); mis-deployment / mis-attribution risk.

**Affected Stakeholders:** Lead Architect (SD-1), Platform/SRE, OSS Community (SD-8), resource-intent-agent maintainers.

**Related Objectives:** Threatens BR-002 (two peers, one core), BR-003 (open-core integrity); supports G-4 (seam integrity).

#### Inherent Risk Assessment

| Assessment | Rating | Justification |
|------------|--------|---------------|
| **Likelihood** | 3 - Possible | Convention drift is plausible without a CI guardrail. |
| **Impact** | 2 - Minor | Confusion / mis-deployment; not a breach or outage. |
| **Inherent Risk Score** | **6** (Medium) | 3 × 2 = 6 |

#### Current Controls

1. **ADR-005 convention codified in CLAUDE.md** (`## Product & Image Naming`); the mislabelled image retagged to `business-intent-agent:ctk-fixes` (O2C re-verified). Owner: Lead Architect. Effectiveness: **Adequate**.
2. **Per-app image identities** for both peers + MCP services. Effectiveness: **Adequate**.

**Overall Control Effectiveness:** Adequate (6 → 4).

#### Residual Risk Assessment

| Assessment | Rating | Justification |
|------------|--------|---------------|
| **Likelihood** | 2 - Unlikely | Convention + retag done; residual = drift before a CI guardrail lands. |
| **Impact** | 2 - Minor | Caught on review; cosmetic-to-operational, no breach. |
| **Residual Risk Score** | **4** (Low) | 2 × 2 = 4 — within appetite. |

#### Risk Response (4Ts)

**Primary Response:** TREAT → TOLERATE once the guardrail lands. **Action Plan:** add a CI/registry guardrail rejecting an image literally named `ibn-core`; sweep manifests/dashboards to per-app names; align the resource-intent-agent (private repo) build at next peer release. **Target residual:** maintain 4. **Owner:** Platform/SRE Lead.

---

### Risk R-019: ibn-core library reuse-surface — heavy transitive footprint inherited by consumers

**Category:** TECHNOLOGY (COMPLIANCE licence facet) — extends R-015 to the consumer side
**Status:** In Progress
**Risk Owner:** Security Lead (licence/vuln) with ibn-core Engineering Lead (footprint/build)
**Action Owner:** ibn-core Engineering
**Source:** `decisions/ARC-001-ADR-006-v1.0.md` (A-lite git-installable library)

#### Risk Identification

**Risk Description:** Packaging ibn-core as an A-lite git-installable library (ADR-006) drags its full transitive dependency tree (`@anthropic-ai/sdk`, OpenTelemetry, MCP SDK, …) into every consumer (e.g. resource-intent-agent). This inherits a vulnerability surface (NFR-SEC-005) and a licence surface (NFR-SEC-006, PRIN 9) into the peers; build-on-install requires a toolchain; and a Project-005 re-shaping of the reuse surface could break tag-pinned consumers.

**Root Cause:** A-lite consumption (no registry, builds on install, no pruned artefact) means consumers take the whole tree; the reuse surface is still maturing (Project 005 pending).

**Trigger Events:** A transitive dependency develops a critical vuln or pulls an Apache-incompatible (e.g. GPL) licence; a consumer toolchain cannot build-on-install; Project 005 re-shapes the surface breaking pinned consumers.

**Consequences if Realized:** Vulnerable/incompatible dependency inherited by every peer; a GPL/incompatible licence in the public tree breaches PRIN 9 / NFR-SEC-006 (extends R-015 from the core to its consumers); consumer build failures; cross-peer coordination cost on upgrades.

**Affected Stakeholders:** resource-intent-agent maintainers, Vpnet Security (SD-7), ibn-core Engineering (SD-8), Enterprise Architect.

**Related Objectives:** Supports BR-002 (reuse surface) and BR-003/BR-006; threatens NFR-SEC-005/006 posture if unmanaged.

#### Inherent Risk Assessment

| Assessment | Rating | Justification |
|------------|--------|---------------|
| **Likelihood** | 3 - Possible | A heavy, evolving tree has a non-trivial chance of a vuln/licence/build issue over time. |
| **Impact** | 3 - Moderate | Inherited by consumers; a licence breach engages the NON-NEGOTIABLE seam (PRIN 9). |
| **Inherent Risk Score** | **9** (Medium) | 3 × 3 = 9 |

#### Current Controls

1. **Immutable-tag pinning + public-surface-only export + additive packaging** (ADR-006): consumers pin to `v2.1.1`; only Apache 2.0 surface exported; app build unchanged. Owner: Engineering Lead. Effectiveness: **Adequate**.
2. **Dependency + code scanning on the core tree** (Dependabot/CodeQL, NFR-SEC-005); recent advisory clean-ups kept the tree green. Owner: Security. Effectiveness: **Adequate** (CI billing constrained — shared with R-006/R-005).
3. **Licence gate — Apache/MIT/BSD/ISC only, no GPL** (NFR-SEC-006, PRIN 9) — the same control as R-015, now spanning the consumer-inherited tree. Owner: Lead Architect. Effectiveness: **Adequate**.
4. **Project 005 path** (layer-agnostic core) available to prune heavy deps from the reuse surface. Effectiveness: **Planned**.

**Overall Control Effectiveness:** Adequate (9 → 6).

#### Residual Risk Assessment

| Assessment | Rating | Justification |
|------------|--------|---------------|
| **Likelihood** | 2 - Unlikely | Scanning + licence gate + immutable pins reduce escape; residual = a new transitive issue or a churn-break. |
| **Impact** | 3 - Moderate | Still inherited by consumers; a licence breach is a seam issue. |
| **Residual Risk Score** | **6** (Medium) | 2 × 3 = 6 — at the COMPLIANCE appetite boundary (≤ 6) for the licence facet. |

#### Risk Response (4Ts)

**Primary Response:** TREAT. **Action Plan:** scan the resolved consumer-inherited tree per release (licence + vuln); document build-on-install prerequisites; prune the footprint via Project 005 (or promote to A-full prebuilt artefact) once the surface stabilises; coordinate tag bumps so pinned consumers are not silently broken. **Target residual:** maintain 6, drive the licence facet to ≤ 4 via the gate. **Owner:** Security Lead + Engineering Lead.

---

## D. Risk Category Analysis

### STRATEGIC Risks (R-003 and strategic facets of R-001/R-007)

**Count:** 3 (R-003 primary; autonomy-rejection theme). **Avg Inherent:** ~13 | **Avg Residual:** ~6. **Themes:** autonomy acceptance on critical national infrastructure; open-core credibility. **Profile:** ⚠️ Concerning — strategic risk is the AI-autonomy acceptance question (STKE Conflict 2), treated by evidence-led phasing.

### OPERATIONAL Risks (R-001, R-009, R-012, R-016, R-017, R-018)

**Count:** 6 | **Avg Inherent:** ~10.2 | **Avg Residual:** ~6.3 | **Reduction:** ~38%. **Themes:** safe autonomous operation, SI delivery to production, supply-chain availability, key-person concentration, MCP-service probe-coupling restart churn (R-017), product/image naming drift (R-018). **Profile:** ⚠️ Concerning at the top (R-001 dominates, residual High) but the two added risks (R-017/R-018) are well-controlled Low residual.

### FINANCIAL Risks

**Count:** 0 standalone (financial facets embedded in R-009 AI-cost and R-012 margin). **Note:** AI-inference cost-per-intent is tracked as a first-class efficiency metric (NFR-P-002) rather than registered as a separate scored risk at alpha; revisit at SI-engagement costing.

### COMPLIANCE/REGULATORY Risks (R-002, R-004, R-010, R-015)

**Count:** 4 | **Avg Inherent:** ~12.75 | **Avg Residual:** ~7.5 | **Reduction:** ~41%. **Themes:** open-core seam leakage, PDPA 2010 personal-data breach, residency/cross-border drift, dependency licence. **Profile:** ⚠️ Concerning — tightened appetite (≤ 6); R-002/R-004/R-010 exceed it and are go-live-gating.

### REPUTATIONAL Risks (R-007)

**Count:** 1 | **Inherent:** 15 | **Residual:** 6 | **Reduction:** 60%. **Theme:** open-washing. **Profile:** ✅ Acceptable post-control; prevention-focused.

### TECHNOLOGY Risks (R-005, R-006, R-008, R-011, R-013, R-014, R-019)

**Count:** 7 | **Avg Inherent:** ~13.1 | **Avg Residual:** ~7.6 | **Reduction:** ~42%. **Themes:** NCII cyber-resilience, conformance regression, agent identity scoping, IdP dependency, translation accuracy, SSoT integrity, library reuse-surface transitive footprint inherited by consumers (R-019). **Profile:** ⚠️ Concerning — R-005 residual High; the rest within or near appetite. R-019 (residual 6) sits at the COMPLIANCE boundary on its licence facet and extends R-015 to the consumer side.

---

## E. Risk Ownership Matrix

| Stakeholder | Role | Owned Risks | Critical (res.) | High (res.) | Medium | Low | Concentration |
|-------------|------|-------------|-----------------|-------------|--------|-----|---------------|
| Lead Architect / CTO | Strategic + seam + autonomy authority | R-001, R-002, R-003, R-006, R-007, R-016 | 0 | 2 (R-001, R-006*) | 3 | 1 | ⚠️ High concentration |
| Security / Compliance (incl. Security Lead) | Zero-trust, PDPA, NCII, identity | R-004, R-005, R-008, R-010, R-011 | 0 | 2 (R-005, +R-004*) | 3 | 0 | ⚠️ High concentration |
| SI Delivery Lead | Engagement go-live | R-012 | 0 | 0 | 1 | 0 | Focused |
| ibn-core Engineering Lead | Framework + AI runtime | R-009, R-013, R-015, R-019 | 0 | 0 | 3 | 1 | Moderate |
| Enterprise / Solution Architect | Topology, SSoT, resilience | R-014 | 0 | 0 | 0 | 1 | Low |
| Platform / SRE Lead | Cluster, manifests, image registry, probes | R-017, R-018 | 0 | 0 | 0 | 2 | Low (new owner, 2026-06-20) |

> **2026-06-20 amendment:** a **Platform / SRE Lead** owner is introduced for the infrastructure-layer risks (R-017 probes, R-018 image naming). R-019 (library footprint) is co-owned by Security Lead (licence/vuln facet) and ibn-core Engineering Lead (footprint/build facet) — listed under Engineering above.

\* R-004/R-006 residual 9 sit at the Medium/High boundary; treated as High-priority for escalation.

**Concentration Analysis:** ⚠️ The Lead Architect / CTO and Security/Compliance jointly own all six appetite-exceeding risks — appropriate (they map to NON-NEGOTIABLE principles) but a deliberate key-person concentration (see R-016). **Escalation paths:** Critical/High → EARB (Level 2) → Lead Architect / CTO (Level 3); COMPLIANCE → Security/Compliance gate + relevant regulator path (JPDP/NACSA/MCMC).

---

## F. 4Ts Response Framework Summary

| Response | Count | % | Key Examples |
|----------|-------|---|--------------|
| **TOLERATE** | 3 | 16% | R-014, R-015, R-016 (low residual, within appetite) |
| **TREAT** | 16 | 84% | R-001…R-013, R-017, R-018, R-019 (active mitigation; R-017/R-018 trending to a Tolerate/monitor posture as their controls complete) |
| **TRANSFER** | 0 | 0% | None — live-network safety, PDPA liability, and conformance cannot be meaningfully insured/outsourced for this subject |
| **TERMINATE** | 0 | 0% | None — no activity exceeds appetite so far it must be stopped; autonomy is phased, not terminated |
| **TOTAL** | 19 | 100% | |

**Insights:** An 81% Treat rate reflects a young, high-stakes programme whose risks are intrinsic to its differentiators (AI autonomy, open-core, regulated telco) and must be actively managed rather than tolerated, transferred, or terminated. Several Treat responses (R-003, R-009) carry a built-in Tolerate fallback (assist mode; non-critical telemetry).

---

## G. Risk Appetite Compliance

**Risk appetite:** **Commercial-telco Medium** overall (residual ≤ 12), tightened for regulated surfaces:

| Category | Appetite Level | Threshold | Rationale |
|----------|---------------|-----------|-----------|
| STRATEGIC | Medium | ≤ 12 | Growth differentiator; accept managed strategic risk |
| OPERATIONAL | Medium | ≤ 12 (safety-of-live-network ≤ 9) | Live infrastructure tightens the safety sub-threshold |
| FINANCIAL | Medium | ≤ 12 | Tracked via AI-cost metric at alpha |
| COMPLIANCE / data-protection | Very Low | ≤ 6 | PDPA, seam integrity, NCII are NON-NEGOTIABLE |
| REPUTATIONAL | Low | ≤ 6 | Open-washing damage hard to recover |
| TECHNOLOGY | Medium | ≤ 12 (security/identity ≤ 6–9) | Conformance + agent identity tightened |

| Category | Appetite | Within | Exceeding | Action |
|----------|----------|--------|-----------|--------|
| STRATEGIC | ≤ 12 | R-003 | none | ✅ |
| OPERATIONAL | ≤ 12 (safety ≤ 9) | R-009, R-012, R-016, R-017 (4), R-018 (4) | R-001 (12 > 9 safety) | ⚠️ EARB + operator sign-off |
| COMPLIANCE | ≤ 6 | R-015, R-019 (6, at boundary — licence facet) | R-002 (9), R-004 (9), R-010 (8) | ❌ Security/Compliance gate + regulator path |
| REPUTATIONAL | ≤ 6 | R-007 | none | ✅ |
| TECHNOLOGY | ≤ 12 (sec ≤ 6–9) | R-006*, R-011, R-013, R-014, R-019 (6) | R-005 (12 > 9), R-008 (9 > 6) | ⚠️/❌ Security/Compliance + NACSA |

**Overall Appetite Compliance:** 6 of 19 residual risks exceed the tightened appetite — unchanged by the 2026-06-20 amendment (the three added risks are all within appetite: R-017 = 4, R-018 = 4, R-019 = 6 at the COMPLIANCE boundary). All six exceeding risks are go-live-gating and concentrate on the NON-NEGOTIABLE principles — expected for a pre-production, AI-native, regulated-telco programme. None is residual Critical.

**Significantly exceeding (regulated surfaces):** R-001 (live-network safety), R-004 (PDPA), R-005 (NCII) are the three that most directly gate first operator go-live (STKE G-2).

---

## H. Prioritized Action Plan

### Priority 1: URGENT (appetite-exceeding, go-live-gating)

| # | Action | Risk(s) | Owner | Due | Target |
|---|--------|---------|-------|-----|--------|
| 1 | 100% HITL gating on high-impact actions + tested per-adapter rollback; complete agent telemetry | R-001 | Security/Compliance | Before G-2 go-live | 12→9 |
| 2 | Penetration test + NCII attestation + incident-response runbooks; restore CI scanning to green-gate | R-005 | Security Lead | Before G-2 go-live | 12→9 |
| 3 | Approve DPIA; assert PII-free telemetry in CI; data-store residency audit | R-004 | Security Lead | Before G-2 go-live | 9→6 |
| 4 | Restore CI secret-scanning + pre-commit hooks; seam-review checklist | R-002 | Engineering Lead | Q3 2026 | 9→6 |
| 5 | Make CTK a hard merge gate (resolve CI billing) | R-006 | Engineering Lead | Q3 2026 | 9→6 |

### Priority 2: HIGH

| # | Action | Risk(s) | Owner | Due | Target |
|---|--------|---------|-------|-----|--------|
| 6 | Enforce + regression-test 100% agent-role identity; alert on missing identity attribute | R-008 | Security Lead | Q3 2026 | 9→6 |
| 7 | Land ADR-003 IaC residency guardrails + placement worksheet | R-010 | Security Lead | Q3 2026 | 8→6 |
| 8 | Protect `McpAdapter` seam stability; front-load DPIA/NCII evidence for first engagement | R-012 | SI Delivery Lead | Q3-Q4 2026 | 8→6 |

### Priority 3: MEDIUM

| # | Action | Risk(s) | Owner | Due | Target |
|---|--------|---------|-------|-----|--------|
| 9 | Expand translation evaluation set; track accuracy as release metric | R-013 | Engineering | Ongoing | 8→6 |
| 10 | IdP HA/DR ADR; validate SSoT backup/restore DR drill | R-011, R-014 | Enterprise Architect | Q4 2026 | maintain |
| 11 | Monitor Claude/LangSmith deprecation; validate model-migration path | R-009 | Engineering | Ongoing | maintain 6 |
| 12 | Apply ADR-004 probe standard to all MCP services + agent workloads; CI restart-count check; alert on sustained NotReady | R-017 | Platform/SRE Lead | Q3 2026 | maintain 4 |
| 13 | CI/registry guardrail rejecting an image named `ibn-core`; sweep manifests to per-app names | R-018 | Platform/SRE Lead | Q3 2026 | maintain 4 |
| 14 | Per-release licence+vuln scan of the consumer-inherited dependency tree; document build-on-install prereqs; prune via Project 005 | R-019 | Security Lead + Engineering | Ongoing / Project 005 | maintain 6, licence facet → ≤ 4 |

---

## I. Integration with SOBC

- **Strategic Case ("Why Now?"):** R-001/R-003 (autonomy acceptance) and R-006 (conformance) frame urgency and the evidence-led go-to-market.
- **Economic Case (risk-adjusted):** R-009 AI-inference cost and R-012 margin/delay inform contingency; AI-cost-per-intent (NFR-P-002) is the live financial signal.
- **Management Case (Part E):** this full register, the ownership matrix, and the monitoring framework evidence risk-management capability.
- **Recommendation:** the six appetite-exceeding, go-live-gating risks (R-001/002/004/005/006/008) define the pre-production gate; option selection should prefer phased autonomy and evidence-before-production sequencing.

---

## J. Monitoring and Review Framework

| Risk Level | Frequency | Reviewed By | Escalated To |
|------------|-----------|-------------|--------------|
| High (13-19) / appetite-exceeding | Monthly | Risk Owner + Security/Compliance | EARB / Lead Architect / CTO |
| Medium (6-12) | Monthly | Risk Owner | EARB (exception) |
| Low (1-5) | Quarterly | Action Owner | Risk Owner |

**Leading KRIs:** % agent actions under agent-role identity (target 100%); % high-impact actions HITL-gated; open critical/high CodeQL/Dependabot alerts (target 0); CTK pass rate per release; PII-in-log scan hits (target 0); telemetry collector endpoint (in-region vs LangSmith).
**Lagging KRIs:** autonomous-action safety incidents; PDPA breach events; conformance regressions post-release; credential exposures.
**Escalation triggers:** any risk +5 points; any new residual Critical; any appetite-exceeding risk without an active treatment; any safety/PDPA/NCII incident.
**Next Review Date:** 2026-07-05. **Risk Register Owner:** Lead Architect / CTO (delegating action tracking to Security/Compliance).

---

## K. Orange Book Compliance Checklist

- ✅ **Governance & Leadership:** owners from STKE RACI (Accountable = Risk Owner); EARB escalation; Medium appetite set and tightened for regulated surfaces.
- ✅ **Integration:** risks linked to STKE drivers/goals/outcomes, PRIN principles, REQ requirements, and ADR-001/002/003 risk tables.
- ✅ **Collaboration & Best Information:** sourced from STKE conflicts/drivers, ADR §7.4 risk tables, and commit-evidenced controls (a9da9d4, 6791d95, c28ce16).
- ✅ **Risk Processes:** 6-category identification; 5×5 inherent/residual; 4Ts responses.
- ✅ **Continual Improvement:** monthly/quarterly review, KRIs, version-controlled register.
- ✅ **Risk Control Framework:** appetite/tolerance, ownership/governance, methodology, inherent-vs-residual effectiveness.

---

## Appendix A: Risk Assessment Scales

### Likelihood (1-5)

| Score | Rating | Probability |
|-------|--------|-------------|
| 1 | Rare | < 5% |
| 2 | Unlikely | 5-25% |
| 3 | Possible | 25-50% |
| 4 | Likely | 50-75% |
| 5 | Almost Certain | > 75% |

### Impact (1-5)

| Score | Rating | Description (commercial-telco) |
|-------|--------|--------------------------------|
| 1 | Negligible | Absorbed routinely; no operator/regulator visibility |
| 2 | Minor | Managed within contingency; minor delay |
| 3 | Moderate | Management effort + approval; operator-visible |
| 4 | Major | Threatens go-live/objectives; operator trust at risk |
| 5 | Catastrophic | Live-network outage / regulated breach / national-connectivity impact |

### Score → Level

| Range | Level | Action |
|-------|-------|--------|
| 20-25 | Critical | Immediate escalation |
| 13-19 | High | Management attention, mitigation plan |
| 6-12 | Medium | Monitoring, consider mitigation |
| 1-5 | Low | Routine monitoring |

---

## Appendix B: Stakeholder-Risk Linkage

| Stakeholder (STKE) | Driver | Risk ID | Risk Title | Category | Residual |
|--------------------|--------|---------|------------|----------|----------|
| Operator Network Eng | SD-4: safe autonomous operation | R-001 | Unsafe change to live network | OPERATIONAL | 12 |
| Vpnet Commercial | SD-3: protect adapter value | R-002 | Credential/logic leak to public repo | COMPLIANCE | 9 |
| MCMC | SD-10: regulatory accountability | R-003 | Autonomy rejected outright | STRATEGIC | 6 |
| JPDP | SD-11: PDPA 2010 | R-004 | Subscriber PII breach | COMPLIANCE | 9 |
| NACSA | SD-12: NCII cyber assurance | R-005 | NCII cyber-resilience gap | TECHNOLOGY | 12 |
| Lead Architect | SD-1: conformance differentiator | R-006 | CTK conformance regression | TECHNOLOGY | 9 |
| OSS Community | SD-8: genuinely open core | R-007 | Open-washing perception | REPUTATIONAL | 6 |
| Vpnet Security | SD-7: defensible posture | R-008 | Agent over-privileged identity | TECHNOLOGY | 9 |
| Anthropic / suppliers | SD (tech suppliers) | R-009 | Claude/LangSmith disruption | OPERATIONAL | 6 |
| Operator Compliance | SD-7/SD-11 | R-010 | Placement drift / cross-border | COMPLIANCE | 8 |
| SI Engineer | SD-2 enabler | R-011 | Keycloak IdP outage | TECHNOLOGY | 6 |
| SI Delivery Lead | SD-2: reference engagement | R-012 | First operator misses go-live | OPERATIONAL | 8 |
| Product Owner | SD-2/SD-6 | R-013 | Translation accuracy below target | TECHNOLOGY | 8 |
| Enterprise Architect | SSoT integrity | R-014 | Redis SSoT loss / split-brain | TECHNOLOGY | 3 |
| Engineering | SD-8 licence posture | R-015 | GPL/vulnerable dependency in core | COMPLIANCE | 4 |
| Lead Architect | governance | R-016 | Key-person concentration | OPERATIONAL | 4 |
| Platform / SRE | reliable orchestration path | R-017 | MCP probe-coupling restart churn | OPERATIONAL | 4 |
| Platform / SRE + Lead Architect | open-core legibility at deployment | R-018 | Product/image naming drift | OPERATIONAL | 4 |
| Security + Engineering | reuse-surface footprint | R-019 | Library transitive footprint inherited by consumers | TECHNOLOGY | 6 |

**Conflict-derived risks (STKE Conflict Analysis):** Conflict 1 (openness vs seam) → R-002, R-007, R-018 (naming legibility of the seam); Conflict 2 (autonomy vs risk appetite) → R-001, R-003, R-005, R-008; Conflict 3 (speed vs compliance depth) → R-004, R-010, R-012.

**ADR-derived risks (2026-06-20 amendment):** ADR-004 (probe decoupling) → R-017; ADR-005 (naming convention) → R-018; ADR-006 (A-lite library packaging) → R-019 (extends R-015 to the consumer-inherited dependency tree).

---

## Document Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| **Risk Register Owner** | Roland Pfeifer (Lead Architect / CTO) | | |
| **Security / Compliance Lead** | [PENDING] | | |
| **SI Delivery Lead** | [PENDING] | | |
| **Governance Board** | Vpnet Cloud Solutions EARB | | |

---

## Next Steps

1. **This Week:** validate R-001/R-004/R-005 assessments with operator network team + Security/Compliance; confirm DPIA approval path; restore CI scanning gates (R-002/R-006).
2. **This Month:** integrate into SOBC Management Case Part E; stand up monthly High/appetite-exceeding risk review; back-link ADR-001/002/003 §7.4 rows to these R-IDs.
3. **This Quarter:** complete go-live-gating Priority 1 actions before first operator production; quarterly appetite-compliance review.

---

**END OF RISK REGISTER**

*This risk register follows HM Treasury Orange Book (2023) principles, applied to a commercial Malaysian telecommunications subject, and integrates with ArcKit's stakeholder-driven architecture governance framework.*

## External References

> This section provides traceability from generated content back to source documents.

### Document Register

| Doc ID | Filename | Type | Source Location | Description |
|--------|----------|------|-----------------|-------------|
| ARC-001-STKE | ARC-001-STKE-v1.0.md | Stakeholder Analysis | projects/001-ibn-core-my/ | Drivers, RACI (risk owners), conflict analysis, stakeholder risk register |
| ARC-001-REQ | ARC-001-REQ-v1.0.md | Requirements | projects/001-ibn-core-my/ | BR/FR/NFR baseline; INT integrations; NFR-SEC/C requirements |
| ARC-000-PRIN | ARC-000-PRIN-v1.0.md | Principles | projects/000-global/ | NON-NEGOTIABLE principles 3, 4, 9 and validation gates |
| ARC-001-ADR-001 | ARC-001-ADR-001-v1.0.md | ADR | projects/001-ibn-core-my/decisions/ | Operator identity / agent role; §7.4 risk table |
| ARC-001-ADR-002 | ARC-001-ADR-002-v1.0.md | ADR | projects/001-ibn-core-my/decisions/ | Cloud platform / landing zones; §7.4 risk table |
| ARC-001-ADR-003 | ARC-001-ADR-003-v1.0.md | ADR | projects/001-ibn-core-my/decisions/ | Data residency per classification; §7.4 risk table |
| ARC-001-ADR-004 | ARC-001-ADR-004-v1.0.md | ADR | projects/001-ibn-core-my/decisions/ | MCP probe decoupling; §7.4 → R-017 |
| ARC-001-ADR-005 | ARC-001-ADR-005-v1.0.md | ADR | projects/001-ibn-core-my/decisions/ | Product/image naming convention; §7.4 → R-018 |
| ARC-001-ADR-006 | ARC-001-ADR-006-v1.0.md | ADR | projects/001-ibn-core-my/decisions/ | A-lite git-installable library; §7.4 → R-019 |

### Citations

| Citation ID | Doc ID | Page/Section | Category | Quoted Passage |
|-------------|--------|--------------|----------|----------------|
| [STKE-1] | ARC-001-STKE | Conflict Analysis | Risk source | "AI autonomy vs. regulator/operator risk appetite… collides with operator network teams' and regulators' caution about autonomous changes to live national infrastructure." |
| [STKE-2] | ARC-001-STKE | Risk Register R-1…R-5 | Risk source | Stakeholder-related risks (autonomy rejection, seam leak, conformance regression, PDPA breach, open-washing). |
| [ADR1-1] | ARC-001-ADR-001 | §7.4 Risks and Mitigations | Risk source | "Agent role over-privileged (scope creep)… CAMARA credential leakage into public repo… Keycloak outage blocks authenticated traffic." |
| [ADR3-1] | ARC-001-ADR-003 | §7.4 Risks | Risk source | "CONFIDENTIAL/RESTRICTED data or secrets reach the public estate or a non-Malaysian region… Unmasked subscriber PII egresses via telemetry or AI path." |
| [REQ-1] | ARC-001-REQ | NFR-SEC-005, NFR-C-001/003, FR-007/009 | Controls | Vulnerability management, PDPA residency, CTK conformance, agent identity, fail-closed PII masking. |
| [PRIN-1] | ARC-000-PRIN | Principles 3, 4, 9 | Appetite | NON-NEGOTIABLE Standards Conformance, Security by Design, Open-Core Seam Integrity. |

### Unreferenced Documents

| Filename | Source Location | Reason |
|----------|-----------------|--------|
| ARC-001-MYCLAS-v1.0.md | projects/001-ibn-core-my/ | Classification register — informs R-010 indirectly via ADR-003; not separately cited |
| ARC-001-MCRES-v1.0.md | projects/001-ibn-core-my/ | Residency assessment — consumed via ADR-002/003 |
| ARC-001-PDPA-v1.0.md | projects/001-ibn-core-my/ | PDPA assessment — supports R-004; read summary level only |

---

**Generated by**: ArcKit `/arckit:risk` command
**Generated on**: 2026-06-05
**ArcKit Version**: 5.11.0
**Project**: ibn-core-my (Project 001)
**AI Model**: claude-opus-4-8[1m]
**Generation Context**: Synthesised from ARC-001-STKE-v1.0 (risk owners, conflicts, stakeholder risks), ARC-001-REQ-v1.0 (controls/requirements), ARC-000-PRIN-v1.0 (NON-NEGOTIABLE principles → appetite), and ARC-001-ADR-001/002/003 (§7.4 risk tables). **2026-06-20 amendment** added R-017/018/019 from ARC-001-ADR-004 (MCP probe decoupling), ADR-005 (product/image naming), and ADR-006 (A-lite library packaging); roll-ups reconciled to 19 risks; in-place DRAFT amendment (no version bump, inbound links preserved). Risk appetite = commercial-telco Medium, tightened for PDPA/NCII/seam surfaces. No TNDR/CMPT procurement artefact exists; supplier-concentration risk not applicable. No risk-appetite.md or external threat reports present in 000-global/policies.

<!-- arckit-provenance:start -->

## Build Provenance

_Stamped automatically by the ArcKit plugin's `provenance-stamp.mjs` PostToolUse hook. Complements (does not replace) the human-authored footer above. Carries only fields the model can't authoritatively self-report: build context from `.arckit/state.json` and effort levels derived from command frontmatter + the silent-downgrade matrix._

| Field | Value |
|-------|-------|
| Requested Effort | `high` |
| Effective Effort | _unknown — model not parsed from existing footer_ |
| Stamped at | 2026-06-20T21:24:44.528Z |

<!-- arckit-provenance:end -->
