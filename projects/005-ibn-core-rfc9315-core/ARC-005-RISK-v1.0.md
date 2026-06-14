# Risk Register

> **Template Origin**: Official | **ArcKit Version**: 5.11.0 | **Command**: `/arckit:risk`

## Document Control

| Field | Value |
|-------|-------|
| **Document ID** | ARC-005-RISK-v1.0 |
| **Document Type** | Risk Register (HM Treasury Orange Book 2023) |
| **Project** | ibn-core-rfc9315-core (Project 005) |
| **Classification** | PUBLIC |
| **Status** | DRAFT |
| **Version** | 1.0 |
| **Created Date** | 2026-06-14 |
| **Last Modified** | 2026-06-14 |
| **Review Cycle** | Monthly (Medium); per gate for any escalation |
| **Review Date** | 2026-07-14 |
| **Owner** | Roland Pfeifer, Lead Architect (Vpnet Cloud Solutions Sdn. Bhd.) |
| **Reviewed By** | [PENDING] |
| **Approved By** | [PENDING] |
| **Distribution** | Vpnet Architecture Review Board, ibn-core engineering, business-intent-agent engineering, resource-intent-agent engineering, Security Architect |

> **Notes**: Commercial open-source subject — UK-Gov-specific risks (parliamentary/NAO/PAC/spend-control) are **not applicable**. No organisational `risk-appetite.md` exists; the per-category thresholds in §G are **proposed**, not yet ARB-ratified. Owners are drawn from the `ARC-005-STKE-v1.0` RACI. This register **consolidates** the risks drafted in `ARC-005-REQ-v1.0` (R-001…R-005) and `ARC-005-STKE-v1.0` (R-1…R-3).

## Revision History

| Version | Date | Author | Changes | Approved By | Approval Date |
|---------|------|--------|---------|-------------|---------------|
| 1.0 | 2026-06-14 | ArcKit AI | Initial creation from `/arckit:risk` command; consolidates REQ/STKE risks into an Orange Book register | [PENDING] | [PENDING] |

---

## Executive Summary

### Risk Profile Overview

**Total Risks Identified:** 9 across 6 categories

| Risk Level | Inherent | Residual | Change |
|------------|----------|----------|--------|
| **Critical** (20-25) | 0 | 0 | — |
| **High** (13-19) | 3 | 0 | ↓ 100% |
| **Medium** (6-12) | 6 | 6 | — |
| **Low** (1-5) | 0 | 3 | ↑ (from controls) |
| **TOTAL (sum of scores)** | 106 | 53 | ↓ 50% |

### Risk Category Distribution

| Category | Count | Avg Inherent | Avg Residual | Control Effectiveness |
|----------|-------|--------------|--------------|----------------------|
| **STRATEGIC** | 2 (R-004, R-007) | 10.5 | 6.0 | 43% |
| **OPERATIONAL** | 1 (R-003) | 12.0 | 6.0 | 50% |
| **FINANCIAL** | 1 (R-008) | 9.0 | 6.0 | 33% |
| **COMPLIANCE** | 2 (R-002, R-009) | 12.0 | 6.0 | 50% |
| **REPUTATIONAL** | 1 (R-006) | 9.0 | 4.0 | 56% |
| **TECHNOLOGY** | 2 (R-001, R-005) | 15.5 | 6.5 | 58% |

### Overall Risk Assessment

**Overall Residual Risk Score:** 53/225 (9 risks × 25 max)
**Risk Reduction from Controls:** ~50%
**Risk Profile Status:** ✅ **Acceptable after controls** — 3 High inherent risks all reduce to Medium/Low; no residual High/Critical.

### Risks Exceeding Appetite

Against the **proposed** thresholds (§G), **0 residual risks exceed appetite**. Three risks (R-001, R-002, R-005) exceed appetite **at the inherent level** and rely on their controls/gates holding — they are the ones to watch.

### Top 5 Risks Requiring Attention (by residual, then inherent)

1. **R-002** (COMPLIANCE, residual 8; inherent 16): BSS extraction regresses TMF921 CTK 83/83 — Owner: BSS eng lead — Open
2. **R-001** (TECHNOLOGY, residual 8; inherent 16): Premature/leaky abstraction — core not genuinely layer-agnostic — Owner: Lead Architect — Open
3. **R-005** (TECHNOLOGY, residual 5; inherent 15): Safety regression relocating the cycle (SafetyGovernor) — Owner: Security Architect — Open
4. **R-003** (OPERATIONAL, residual 6; inherent 12): BSS team resists/deprioritises the extraction — Owner: Lead Architect — Open
5. **R-004** (STRATEGIC, residual 6; inherent 12): RFC 9315 fidelity (D-1…D-4) traded away under pressure — Owner: Lead Architect — Open

### Key Findings and Recommendations

**Findings:**

- The profile is **benign once controls hold** — but the three highest-inherent risks (R-001, R-002, R-005) all depend on **gates** (Gate D third-domain proof; Gate B CTK-parity; deferring the SafetyGovernor move to Phase 5). If a gate is skipped, the residual reverts toward inherent.
- **R-002 and R-003 are the same event seen two ways**: the technical CTK-regression risk and the human "BSS team bears the risk" risk. The CTK-parity gate is the shared control.
- Almost everything is **Treat** — this is an internal engineering programme with little to Transfer or Terminate.

**Recommendations:**

1. Treat the **Gate B (CTK-parity)** and **Gate D (third-domain proof)** as hard, non-skippable gates — they are the controls holding R-001/R-002 down.
2. Bring the **BSS team** along early (R-003) — exec sponsorship + the CTK guarantee + pairing.
3. Keep D-1…D-4 as binding requirements (R-004) and the SafetyGovernor in place until Phase 5 (R-005).

---

## A. Risk Matrix Visualization

### Inherent Risk Matrix (Before Controls)

```text
                                    IMPACT
              1-Minimal   2-Minor    3-Moderate   4-Major    5-Severe
           ┌───────────┬───────────┬───────────┬───────────┬───────────┐
5-Almost   │           │           │           │           │           │
Certain    │    5      │    10     │    15     │    20     │    25     │
           ├───────────┼───────────┼───────────┼───────────┼───────────┤
4-Likely   │           │           │           │ R-001     │           │
           │    4      │    8      │    12     │ R-002 =16 │    20     │
L          ├───────────┼───────────┼───────────┼───────────┼───────────┤
I 3-Possible│          │           │ R-003     │ R-004     │ R-005 =15 │
K          │    3      │    6      │ R-007     │    12     │    15     │
E          │           │           │ R-008 =9  │           │           │
L          ├───────────┼───────────┼───────────┼───────────┼───────────┤
I 2-Unlikely│          │           │           │ R-009 =8  │           │
H          │    2      │    4      │ R-006 =9? │    8      │    10     │
O          ├───────────┼───────────┼───────────┼───────────┼───────────┤
O 1-Rare   │    1      │    2      │    3      │    4      │    5      │
D          └───────────┴───────────┴───────────┴───────────┴───────────┘
```

> Placement note: R-006 inherent = L3×I3 = 9 (Possible × Moderate); R-009 inherent = L2×I4 = 8.

**Inherent zones:** High (13-19): R-001 (16), R-002 (16), R-005 (15). Medium (6-12): R-003 (12), R-004 (12), R-006 (9), R-007 (9), R-008 (9), R-009 (8). Critical/Low: none.

### Residual Risk Matrix (After Controls)

```text
                                    IMPACT
              1-Minimal   2-Minor    3-Moderate   4-Major    5-Severe
           ┌───────────┬───────────┬───────────┬───────────┬───────────┐
5-Almost   │    5      │    10     │    15     │    20     │    25     │
Certain    ├───────────┼───────────┼───────────┼───────────┼───────────┤
4-Likely   │    4      │    8      │    12     │    16     │    20     │
L          ├───────────┼───────────┼───────────┼───────────┼───────────┤
I 3-Possible│          │ R-003     │           │           │           │
K          │    3      │ R-004     │    9      │    12     │    15     │
E          │           │ R-007,008 │           │           │           │
L          │           │  (=6)     │           │           │           │
I 2-Unlikely│          │ R-006     │           │ R-001     │           │
H          │    2      │ R-009     │    6      │ R-002 =8  │    10     │
O          │           │  (=4)     │           │           │           │
O 1-Rare   │           │           │           │ R-005 =5  │           │
D          │    1      │    2      │    3      │    4      │    5      │
           └───────────┴───────────┴───────────┴───────────┴───────────┘
```

**Risk Movement:**

- **R-001** 16 → 8 (no-domain-imports rule + third-domain proof).
- **R-002** 16 → 8 (behaviour-preserving refactor + CTK-parity gate).
- **R-005** 15 → 5 (defer SafetyGovernor move to Phase 5; keep ADR-011 placement).
- **R-006** 9 → 4 (semver + beta + migration guide + pinnable tags).
- **R-003** 12 → 6; **R-004** 12 → 6; **R-007** 9 → 6; **R-008** 9 → 6; **R-009** 8 → 4.

---

## B. Top Risks (Ranked by Residual, then Inherent)

| Rank | ID | Title | Category | Inherent | Residual | Owner | Status | Response |
|------|----|-------|----------|----------|----------|-------|--------|----------|
| 1 | R-002 | BSS extraction regresses TMF921 CTK 83/83 | COMPLIANCE | 16 | 8 | BSS eng lead | Open | Treat |
| 2 | R-001 | Premature/leaky abstraction (not layer-agnostic) | TECHNOLOGY | 16 | 8 | Lead Architect | Open | Treat |
| 3 | R-003 | BSS team resists/deprioritises extraction | OPERATIONAL | 12 | 6 | Lead Architect | Open | Treat |
| 4 | R-004 | RFC 9315 fidelity (D-1…D-4) traded away | STRATEGIC | 12 | 6 | Lead Architect | Open | Treat |
| 5 | R-007 | No third domain → layer-agnosticism unproven | STRATEGIC | 9 | 6 | Lead Architect | Open | Treat |
| 6 | R-008 | Engineering capacity not sustained; no payback | FINANCIAL | 9 | 6 | Lead Architect | Open | Treat |
| 7 | R-005 | Safety regression relocating the cycle | TECHNOLOGY | 15 | 5 | Security Architect | Open | Treat |
| 8 | R-006 | v3.0.0 breaking change strands OSS consumers | REPUTATIONAL | 9 | 4 | ibn-core eng lead | Open | Treat |
| 9 | R-009 | Cited-tag / open-core-seam integrity breach | COMPLIANCE | 8 | 4 | Vpnet ARB | Open | Tolerate |

---

## C. Detailed Risk Register

### Risk R-001: Premature / leaky abstraction — core not genuinely layer-agnostic

**Category:** TECHNOLOGY · **Status:** Open · **Risk Owner:** Lead Architect (RACI Accountable, fidelity decision) · **Action Owner:** ibn-core engineering lead

**Description:** The extracted core secretly encodes BSS+resource assumptions and does not generalise — "layer-agnostic" in name only.
**Root Cause:** Abstracting from only two consumers; pressure to ship.
**Trigger Events:** third domain needs core changes to fit; domain concepts leak into the runner.
**Consequences:** the goal (one reusable core) is not met; a third runner variant emerges; rework.
**Affected Stakeholders:** Lead Architect (SD-1), future-domain teams (SD-7), ibn-core eng (SD-2).
**Related Objectives:** G-1 (one core), threatens the whole project thesis.

| Assessment | L | I | Score |
|------------|---|---|-------|
| Inherent | 4 | 4 | **16 (High)** |
| Residual | 2 | 4 | **8 (Medium)** |

**Controls:** "no domain imports in core" CI rule; **Gate D third-domain proof** (prove, don't assume); two *real* consumers as the extraction basis; port contracts reviewed against both domains in Phase 0. Effectiveness: **Adequate–Strong**.
**Response:** **TREAT.** **Action:** enforce the dependency rule from Phase 1; do not declare layer-agnostic until Gate D green. Target residual 8 (hold).

---

### Risk R-002: BSS extraction regresses TMF921 CTK 83/83

**Category:** COMPLIANCE · **Status:** Open · **Risk Owner:** BSS engineering lead (RACI Responsible for Gate B; Accountable: ARB) · **Action Owner:** BSS + ibn-core engineering

**Description:** Re-expressing the BSS runner as an adapter set over the core changes behaviour and breaks the cited TMF921 v5 CTK 83/83 conformance.
**Root Cause:** the highest-risk refactor touches the most-coupled, conformance-critical domain.
**Trigger Events:** feature work mixed into the extraction; subtle phase-ordering change; incomplete adapter parity.
**Consequences:** conformance claim (and citation) invalidated; BSS service regression; loss of BSS-team trust.
**Affected Stakeholders:** BSS eng (SD-3), ARB (SD-6).
**Related Objectives:** G-2; threatens BR-004 (conformance) and the cited release baseline.

| Assessment | L | I | Score |
|------------|---|---|-------|
| Inherent | 4 | 4 | **16 (High)** |
| Residual | 2 | 4 | **8 (Medium)** |

**Controls:** behaviour-preserving refactor (no feature work); **Gate B CTK-parity blocks packaging** until 83/83; legacy BSS runner behind a flag during cutover; CTK in CI. Effectiveness: **Strong** (the gate is a hard stop).
**Response:** **TREAT.** **Action:** run CTK every CI build of the BSS adapter; no v3.0.0-beta until Gate B green. Target residual 8 (impact stays high because conformance is binary; likelihood driven down).

---

### Risk R-003: BSS team resists / deprioritises the extraction

**Category:** OPERATIONAL · **Status:** Open · **Risk Owner:** Lead Architect (sponsor) · **Action Owner:** Lead Architect + BSS lead

**Description:** The team bearing the extraction risk (BSS) has the least short-term incentive, so the work stalls or is under-resourced. (Conflict C-1 in STKE.)
**Root Cause:** benefit/risk asymmetry — others gain, BSS carries the risk.
**Trigger Events:** competing BSS priorities; perception that the gate isn't a real protection.
**Consequences:** programme slips; G-1/G-2 delayed.
**Affected Stakeholders:** BSS eng (SD-3), Lead Architect (SD-1).
**Related Objectives:** G-2.

| Assessment | L | I | Score |
|------------|---|---|-------|
| Inherent | 4 | 3 | **12 (Medium)** |
| Residual | 2 | 3 | **6 (Medium)** |

**Controls:** exec sponsorship/priority; the CTK-parity gate as a credible guarantee; ibn-core eng pairs with BSS; framing as removing BSS's future maintenance. Effectiveness: **Adequate**.
**Response:** **TREAT.** **Contingency:** fall back to roadmap Option 2 (harden coordination plane, defer BSS migration) — but flag it fails the layer-agnostic goal.

---

### Risk R-004: RFC 9315 fidelity conditions (D-1…D-4) traded away under delivery pressure

**Category:** STRATEGIC · **Status:** Open · **Risk Owner:** Lead Architect · **Action Owner:** ibn-core engineering lead

**Description:** Under schedule pressure the core ships as an imperative pipeline that loses continuous assurance / declarative intent (violating D-1…D-4), undermining standards credibility.
**Root Cause:** fidelity adds design constraints that slow the extraction (Conflict C-3).
**Trigger Events:** "ship now, fix fidelity later"; ports named for domains not RFC functions.
**Consequences:** standards credibility (and citations) eroded; D-1 loss also weakens safety.
**Affected Stakeholders:** standards-fidelity (SD-9), Security Architect (SD-5 via D-1), ARB (SD-6).
**Related Objectives:** G-4; BR-004.

| Assessment | L | I | Score |
|------------|---|---|-------|
| Inherent | 3 | 4 | **12 (Medium)** |
| Residual | 2 | 3 | **6 (Medium)** |

**Controls:** D-1…D-4 are **binding REQ FR-004…007** and roadmap Gate-A/Phase-0 criteria; ARB blocks the release gate if a condition is unmet; the persona standards-review is on record (advisory). Effectiveness: **Adequate–Strong**.
**Response:** **TREAT.**

---

### Risk R-005: Safety regression while relocating the cycle (SafetyGovernor)

**Category:** TECHNOLOGY · **Status:** Open · **Risk Owner:** Security Architect · **Action Owner:** Security Architect + resource eng

**Description:** Moving the cycle (and later the `SafetyGovernor` into the core) disturbs the G1 blast-radius gate (004 ADR-011), weakening protection of the autonomous resource loop over live network functions.
**Root Cause:** relocating a safety-critical control during refactor.
**Trigger Events:** moving the governor before the core is stable; the core hook not wired for resource thresholds.
**Consequences:** unsafe autonomous actuation on an NCII estate (high impact, downstream in 004).
**Affected Stakeholders:** Security Architect (SD-5), resource eng (SD-4).
**Related Objectives:** G-5; protects 004 ADR-011.

| Assessment | L | I | Score |
|------------|---|---|-------|
| Inherent | 3 | 5 | **15 (High)** |
| Residual | 1 | 5 | **5 (Low)** |

**Controls:** keep the SafetyGovernor exactly where 004 ADR-011 put it until **Phase 5**; move only once the core is stable; safety tests + tabletop + two-person re-arm carried over. Effectiveness: **Strong** (sequencing removes the exposure). Impact stays 5 (safety), likelihood driven to Rare.
**Response:** **TREAT.**

---

### Risk R-006: v3.0.0 breaking change strands open-source consumers

**Category:** REPUTATIONAL · **Status:** Open · **Risk Owner:** ibn-core engineering lead · **Action Owner:** ibn-core engineering

**Description:** The v3.0.0 surface change leaves consumers behind; they pin to v2.x or fork, damaging reuse credibility and community trust. (STKE R-2.)
**Root Cause:** breaking change to a public, cited library.
**Trigger Events:** release with no migration guide; no beta; forced LLM-SDK dependency persists.
**Consequences:** fragmentation; reputational damage to the open core.
**Affected Stakeholders:** OSS consumers (SD-8), ARB (SD-6).
**Related Objectives:** G-6.

| Assessment | L | I | Score |
|------------|---|---|-------|
| Inherent | 3 | 3 | **9 (Medium)** |
| Residual | 2 | 2 | **4 (Low)** |

**Controls:** semver v3.0.0 + **beta** + migration guide; pinnable immutable cited tags; slim entry removes forced LLM-SDK. Effectiveness: **Strong**.
**Response:** **TREAT.** **Contingency:** a v2.x compatibility shim for one minor cycle.

---

### Risk R-007: No genuine third domain → layer-agnosticism unproven (Gate D fails)

**Category:** STRATEGIC · **Status:** Open · **Risk Owner:** Lead Architect · **Action Owner:** Lead Architect

**Description:** No real third domain (service/slice, RFC 9543) materialises, so the core's generality cannot be proven (Gate D) and R-001 cannot be retired.
**Root Cause:** the proof depends on a domain outside this project's direct control.
**Trigger Events:** no service/slice work scheduled; capacity diverted.
**Consequences:** "layer-agnostic" remains a claim, not a demonstrated fact.

| Assessment | L | I | Score |
|------------|---|---|-------|
| Inherent | 3 | 3 | **9 (Medium)** |
| Residual | 2 | 3 | **6 (Medium)** |

**Controls:** identify the third domain in Phase 0; a **synthetic reference domain** as a fallback proof. Effectiveness: **Adequate.**
**Response:** **TREAT.**

---

### Risk R-008: Engineering capacity not sustained; payback not reached

**Category:** FINANCIAL · **Status:** Open · **Risk Owner:** Lead Architect · **Action Owner:** Lead Architect

**Description:** The 1–2 FTE over ~18 months isn't sustained; the programme stalls at two consumers, so the reuse payback (at the third domain) is never realised.
**Root Cause:** small team; competing commercial priorities.
**Trigger Events:** reassignment; SI delivery pressure.
**Consequences:** sunk extraction cost without the payoff.

| Assessment | L | I | Score |
|------------|---|---|-------|
| Inherent | 3 | 3 | **9 (Medium)** |
| Residual | 2 | 3 | **6 (Medium)** |

**Controls:** resourcing confirmed at Gate A; phase-gated funding; extend toward the 3-year horizon if needed. Effectiveness: **Adequate.**
**Response:** **TREAT.**

---

### Risk R-009: Cited-tag rewrite / open-core-seam integrity breach during v3.0.0

**Category:** COMPLIANCE · **Status:** Open · **Risk Owner:** Vpnet ARB · **Action Owner:** ibn-core engineering lead

**Description:** During the v3.0.0 cutover, an academically-cited tag is rewritten, or operator/vendor specifics leak into the public core — breaching PRIN 9 and the citation baseline.
**Root Cause:** large refactor + release touching the public surface.
**Trigger Events:** force-push to a cited tag; domain/vendor code merged into core.
**Consequences:** invalidated citations; open-core licence/seam breach.

| Assessment | L | I | Score |
|------------|---|---|-------|
| Inherent | 2 | 4 | **8 (Medium)** |
| Residual | 1 | 4 | **4 (Low)** |

**Controls:** tag-immutability policy (CLAUDE.md); no-domain-imports CI rule; ARB release gate. Effectiveness: **Strong** (process-enforced).
**Response:** **TOLERATE** (low residual, process-controlled; monitor at the release gate).

---

## D. Risk Category Analysis

| Category | Count | Avg Inherent | Avg Residual | Reduction | Profile |
|----------|-------|--------------|--------------|-----------|---------|
| STRATEGIC (R-004, R-007) | 2 | 10.5 | 6.0 | 43% | ✅ Acceptable |
| OPERATIONAL (R-003) | 1 | 12.0 | 6.0 | 50% | ✅ Acceptable (people-risk; manage actively) |
| FINANCIAL (R-008) | 1 | 9.0 | 6.0 | 33% | ✅ Acceptable |
| COMPLIANCE (R-002, R-009) | 2 | 12.0 | 6.0 | 50% | ⚠️ Watch — R-002 conformance is binary; gate-dependent |
| REPUTATIONAL (R-006) | 1 | 9.0 | 4.0 | 56% | ✅ Acceptable |
| TECHNOLOGY (R-001, R-005) | 2 | 15.5 | 6.5 | 58% | ⚠️ Watch — highest inherent; controls are gates that must hold |

**Key theme:** the residual profile is acceptable *because* of three gates (Gate B CTK-parity, Gate D third-domain proof, Phase-5 SafetyGovernor sequencing). The register's central message: **protect the gates.**

---

## E. Risk Ownership Matrix

| Stakeholder | Owned Risks | High (inherent) | Notes |
|-------------|-------------|------------------|-------|
| Lead Architect | R-001, R-003, R-004, R-007, R-008 | 1 (R-001) | Heaviest load — sponsor + abstraction/fidelity/capacity owner; consider delegating R-007/R-008 tracking |
| BSS engineering lead | R-002 | 1 (R-002) | The conformance gate owner |
| Security Architect | R-005 | 1 (R-005) | Safety sequencing |
| ibn-core engineering lead | R-006 | 0 | Release discipline |
| Vpnet ARB | R-009 | 0 | Seam/tag integrity at the release gate |

**Concentration note:** ⚠️ the Lead Architect owns 5 of 9; pragmatic for a small team, but R-007/R-008 monitoring could be delegated.

---

## F. 4Ts Response Framework Summary

| Response | Count | % | Examples |
|----------|-------|---|----------|
| **TOLERATE** | 1 | 11% | R-009 (low residual, process-controlled) |
| **TREAT** | 8 | 89% | R-001…R-008 (active mitigation via gates/controls) |
| **TRANSFER** | 0 | 0% | N/A — internal engineering programme, nothing insurable |
| **TERMINATE** | 0 | 0% | N/A — the activity *is* the strategic goal |

**Insight:** an internal-engineering risk profile — dominated by Treat, with no meaningful Transfer/Terminate options. The "treatment" is overwhelmingly **disciplined gates**, not spend.

---

## G. Risk Appetite Compliance

> **No organisational `risk-appetite.md` exists.** The thresholds below are **proposed** for this commercial open-source library project, pending ARB ratification.

| Category | Proposed Threshold | Residual Within | Residual Exceeding |
|----------|--------------------|-----------------|--------------------|
| STRATEGIC | ≤ 12 | 2 | 0 |
| OPERATIONAL | ≤ 9 | 1 | 0 |
| FINANCIAL | ≤ 9 | 1 | 0 |
| COMPLIANCE | ≤ 8 | 2 | 0 |
| REPUTATIONAL | ≤ 8 | 1 | 0 |
| TECHNOLOGY | ≤ 12 | 2 | 0 |

**Overall:** all **residual** risks within proposed appetite. **Inherent** exceedances (R-001 16, R-002 16, R-005 15) are acceptable only while their gates hold — if Gate B or Gate D is skipped, escalate immediately.

---

## H. Prioritized Action Plan

| Priority | Action | Risk(s) | Owner | Due | Status |
|----------|--------|---------|-------|-----|--------|
| 1 | Make Gate B (CTK-parity) a hard, CI-enforced stop before any v3.0.0-beta | R-002, R-003 | BSS + ibn-core lead | Phase 1 (CY2027 Q1) | Open |
| 2 | Enforce "no domain imports in core" CI rule from Phase 1; schedule Gate D third-domain proof | R-001, R-007 | ibn-core lead | Phase 1 → Phase 4 | Open |
| 3 | Keep SafetyGovernor per 004 ADR-011 until Phase 5; design the core `admit()` hook | R-005 | Security Architect | Phase 5 (CY2027 Q4) | Open |
| 4 | Lock D-1…D-4 into the port-contract spec + ARB release-gate criteria | R-004 | Lead Architect | Phase 0–1 | Open |
| 5 | v3.0.0 migration guide + beta + confirm pinnable cited tags + slim entry | R-006, R-009 | ibn-core lead | Phase 2 (CY2027 Q1) | Open |
| 6 | Confirm 1–2 FTE resourcing at Gate A; phase-gate funding | R-008 | Lead Architect | Gate A (CY2026 Q3) | Open |

---

## I. Integration with SOBC

If an `ARC-005-SOBC` is produced: the **Management Case (Part E)** uses this register; the **Economic Case** should carry a contingency for R-008 (capacity) and R-006 (migration support); the **Strategic Case** uses R-001/R-007 (reuse-leverage-at-risk) to frame urgency. No SOBC exists yet.

---

## J. Monitoring and Review Framework

| Risk Level | Frequency | Reviewed By | Escalated To |
|------------|-----------|-------------|--------------|
| High (none residual) | — | — | — |
| Medium (R-001..004, 007, 008) | Monthly + at each gate | Risk owner | Lead Architect → ARB |
| Low (R-005, 006, 009) | At each gate | Action owner | Risk owner |

**Escalation triggers:** any gate (B/D) at risk of being skipped; any residual rising by 3+; any inherent-High risk losing its controlling gate. **Register owner:** Lead Architect. **Next review:** 2026-07-14 / Gate A.

---

## K. Orange Book Compliance Checklist

- ✅ **Governance & Leadership** — owners from the STKE RACI; ARB escalation.
- ✅ **Integration** — risks linked to STKE drivers, REQ requirements, and roadmap gates.
- ✅ **Collaboration & Best Information** — sourced from REQ + STKE conflict analysis + the persona standards review.
- ✅ **Risk Processes** — 6 categories, 5×5 inherent/residual, 4Ts.
- ✅ **Continual Improvement** — review at each gate; KRIs = gate health.
- ⚠️ **Risk appetite** — proposed, not yet ratified (the one open Orange Book item).

---

## Appendix B: Stakeholder-Risk Linkage

| Stakeholder | Driver (STKE) | Risk | Category | Residual |
|-------------|---------------|------|----------|----------|
| Lead Architect | SD-1 reuse leverage | R-001, R-007, R-008 | TECH/STRAT/FIN | 8/6/6 |
| BSS engineering | SD-3 don't break conformant service | R-002, R-003 | COMPLIANCE/OPERATIONAL | 8/6 |
| Standards fidelity | SD-9 RFC 9315 faithfulness | R-004 | STRATEGIC | 6 |
| Security Architect | SD-5 safety inherited/not regressed | R-005 | TECHNOLOGY | 5 |
| OSS consumers | SD-8 don't strand me | R-006 | REPUTATIONAL | 4 |
| Vpnet ARB | SD-6 seam + conformance + cited tags | R-002, R-009 | COMPLIANCE | 8/4 |

**Conflicts → risks:** STKE C-1 (benefit/risk asymmetry) → R-002 + R-003; C-2 (speed vs responsible change) → R-006; C-3 (fidelity vs fast) → R-004.

---

## Document Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| **Risk Register Owner** | Roland Pfeifer (Lead Architect) | | [PENDING] |
| **Governance Board** | Vpnet Architecture Review Board | | [PENDING] |

---

## External References

> Traceability from generated content back to source material.

### Document Register

| Doc ID | Filename | Type | Source Location | Description |
|--------|----------|------|-----------------|-------------|
| STKE | ARC-005-STKE-v1.0.md | Stakeholder Analysis | projects/005-ibn-core-rfc9315-core/ | Risk owners (RACI), conflicts C-1…C-3, drivers SD-1…SD-10 |
| REQ | ARC-005-REQ-v1.0.md | Requirements | projects/005-ibn-core-rfc9315-core/ | R-001…R-005 source rows; FR-004…007 (D-1…D-4) |
| ADR005 | ARC-005-ADR-001-v1.0.md | ADR | projects/005-ibn-core-rfc9315-core/decisions/ | Gates; D-1…D-4 conditions |
| ROAD | ARC-005-ROAD-v1.0.md | Roadmap | projects/005-ibn-core-rfc9315-core/ | Gates A–D (the controlling controls) |
| PRIN | ARC-000-PRIN-v1.0.md | Principles | projects/000-global/ | 3, 9, 14 (conformance, seam, maintainability) |

### Citations

| Citation ID | Doc ID | Section | Category | Quoted/Paraphrased Passage |
|-------------|--------|---------|----------|----------------------------|
| [STKE-C1] | STKE | Conflict Analysis C-1…C-3; RACI | Risk Factor | Benefit/risk asymmetry; owners; conflicts mapped to risks |
| [REQ-C1] | REQ | Dependencies and Risks (R-001…R-005) | Risk Factor | Consolidated source risks + D-1…D-4 as FRs |
| [ROAD-C1] | ROAD | Gates A–D | Risk Factor | CTK-parity (B) and third-domain proof (D) are the controlling gates |

### Unreferenced Documents

| Filename | Source Location | Reason |
|----------|-----------------|--------|
| 000-global/policies/README.md | projects/000-global/policies/ | Placeholder; no risk-appetite content |

---

**Generated by**: ArcKit `/arckit:risk` command
**Generated on**: 2026-06-14 GMT
**ArcKit Version**: 5.11.0
**Project**: ibn-core-rfc9315-core (Project 005)
**AI Model**: claude-opus-4-8 (1M context)
**Generation Context**: Orange Book register consolidating ARC-005-REQ (R-001…R-005) and ARC-005-STKE (R-1…R-3, conflicts, RACI owners), with controls from ARC-005-ROAD gates and ARC-005-ADR-001. Commercial open-source subject (UK-Gov risks N/A); no organisational risk-appetite.md — thresholds proposed pending ARB ratification.

<!-- arckit-provenance:start -->

## Build Provenance

_Stamped automatically by the ArcKit plugin's `provenance-stamp.mjs` PostToolUse hook. Complements (does not replace) the human-authored footer above. Carries only fields the model can't authoritatively self-report: build context from `.arckit/state.json` and effort levels derived from command frontmatter + the silent-downgrade matrix._

| Field | Value |
|-------|-------|
| Requested Effort | `high` |
| Effective Effort | _unknown — model not parsed from existing footer_ |
| Stamped at | 2026-06-14T19:20:47.699Z |

<!-- arckit-provenance:end -->
