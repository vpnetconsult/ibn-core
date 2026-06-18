# Risk Register

> **Template Origin**: Official | **ArcKit Version**: 5.11.0 | **Command**: `/arckit:risk`

## Document Control

| Field | Value |
|-------|-------|
| **Document ID** | ARC-006-RISK-v1.0 |
| **Document Type** | Risk Register (HM Treasury Orange Book 2023) |
| **Project** | location-assurance-twin (Project 006) |
| **Classification** | PUBLIC |
| **Status** | DRAFT |
| **Version** | 1.0 |
| **Created Date** | 2026-06-17 |
| **Last Modified** | 2026-06-17 |
| **Review Cycle** | Monthly (High), Quarterly (Medium/Low) |
| **Next Review Date** | 2026-07-17 |
| **Owner** | Roland Pfeifer (Lead Architect, Vpnet Cloud Solutions Sdn. Bhd.) |
| **Reviewed By** | [PENDING] |
| **Approved By** | [PENDING] |
| **Distribution** | Project Team, Architecture Team, Standards/Research Reviewer |

## Revision History

| Version | Date | Author | Changes | Approved By | Approval Date |
|---------|------|--------|---------|-------------|---------------|
| 1.0 | 2026-06-17 | ArcKit AI | Initial creation from `/arckit:risk`; HLD §12 (R1–R6) + REQ-implied risks (R-7/R-8/R-9) | [PENDING] | [PENDING] |

> **Input note (Orange Book governance):** No formal Stakeholder Analysis (STKE) or organisational risk-appetite statement exists for Project 006 yet. Risk owners are drawn from the `ARC-006-REQ-v1.0` stakeholder table and the HLD; risk appetite is applied qualitatively (Very Low for compliance/privacy, Low for reputational, Medium for technology) pending ratification. Run `/arckit:stakeholders` to formalise owners and `projects/000-global/risk-appetite.md` to ratify appetite.

---

## Executive Summary

### Risk Profile Overview

**Total Risks Identified:** 9 risks across 4 categories (TECHNOLOGY, COMPLIANCE, REPUTATIONAL, OPERATIONAL).

| Risk Level | Inherent | Residual | Change |
|------------|----------|----------|--------|
| **Critical** (20-25) | 0 | 0 | — |
| **High** (13-19) | 1 | 0 | ↓ 100% |
| **Medium** (6-12) | 8 | 4 | ↓ 50% |
| **Low** (1-5) | 0 | 5 | ↑ |
| **TOTAL (score)** | 90 | 42 | ↓ 53% |

### Risk Category Distribution

| Category | Count | Avg Inherent | Avg Residual | Control Effectiveness |
|----------|-------|--------------|--------------|----------------------|
| **TECHNOLOGY** | 5 | 8.4 | 4.8 | 43% reduction |
| **COMPLIANCE** | 2 | 13.5 | 5.0 | 63% reduction |
| **REPUTATIONAL** | 1 | 12.0 | 6.0 | 50% reduction |
| **OPERATIONAL** | 1 | 6.0 | 2.0 | 67% reduction |
| **STRATEGIC** | 0 | — | — | — |
| **FINANCIAL** | 0 | — | — | — |

### Overall Risk Assessment

**Overall Residual Risk Score:** 42 (sum across 9 risks)
**Risk Reduction from Controls:** 53% reduction from inherent (90 → 42)
**Risk Profile Status:** ✅ Acceptable (no Critical/High residual; all residual risks Medium or Low, each with a treatment or tolerate rationale)

### Risks Exceeding Appetite

**Number of risks exceeding (qualitative) appetite at residual:** 0. Two risks sit at the privacy/compliance boundary at *inherent* level (R-7, R-2) and are brought within appetite by controls; they remain the closest-watched.

### Top 5 Risks Requiring Attention (by inherent severity / sensitivity)

1. **R-7** (COMPLIANCE, inherent High 15 → residual Low 4): Durable per-subscriber location leakage (privacy) — Owner: DPO — Status: Open
2. **R-2** (COMPLIANCE, inherent Medium 12 → residual Medium 6): `[MODEL]` edges not yet named SID v24 relationships — Owner: Standards Reviewer — Status: Open
3. **R-4** (REPUTATIONAL, inherent Medium 12 → residual Medium 6): Over-claiming incident prevention — Owner: Lead Architect — Status: Open
4. **R-6** (TECHNOLOGY, inherent Medium 12 → residual Medium 6): NMOP feed drafts work-in-progress — Owner: L0 Feed Owner — Status: Open
5. **R-8** (TECHNOLOGY, inherent Medium 12 → residual Medium 6): Silent/dead YANG-Push subscription misread as conformance — Owner: Assurance Architect — Status: Open

### Key Findings and Recommendations

**Key Findings:**

- The profile is dominated by **review/standards-credibility and feed-maturity** risks, not by financial or strategic risk — consistent with an open reference-rig (not a production system).
- The single highest-sensitivity risk is **privacy** (R-7); it is well-controlled by schema-and-code enforcement of the transient boundary, but its impact stays high if breached.
- **R-4 (over-claiming)** is a narrative/reputational risk unique to this domain — the prevention claim must stay narrow.

**Recommendations:**

1. Treat R-7 as the gating control: enforce the no-durable-subscriber-location boundary in schema *and* code (not policy alone) and test it explicitly.
2. Promote `[MODEL]` civic/indoor edges to the named v24 relationships before any paper/panel (closes R-2/R-3 credibility exposure).
3. Pin NMOP draft revisions in the README and isolate the feed behind its component (R-6).
4. Formalise STKE + risk appetite to ratify owners and thresholds.

---

## A. Risk Matrix Visualization

### Inherent Risk Matrix (Before Controls)

```text
                                    IMPACT
              1-Negligible 2-Minor    3-Moderate   4-Major    5-Catastrophic
           ┌───────────┬───────────┬───────────┬───────────┬───────────┐
5-Almost   │           │           │           │           │           │
Certain    │    5      │    10     │    15     │    20     │    25     │
           ├───────────┼───────────┼───────────┼───────────┼───────────┤
4-Likely   │           │           │ R-2 R-6   │           │           │
           │    4      │    8      │    12     │    16     │    20     │
L          ├───────────┼───────────┼───────────┼───────────┼───────────┤
I 3-Possible│          │ R-3 R-5   │ R-1       │ R-4 R-8   │   R-7     │
K          │    3      │    6      │    9      │    12     │    15     │
E          ├───────────┼───────────┼───────────┼───────────┼───────────┤
L 2-Unlikely│          │ R-9       │           │           │           │
I          │    2      │    4      │    6      │    8      │    10     │
H          ├───────────┼───────────┼───────────┼───────────┼───────────┤
O 1-Rare   │           │           │           │           │           │
O          │    1      │    2      │    3      │    4      │    5      │
D          └───────────┴───────────┴───────────┴───────────┴───────────┘

Legend: ██ Critical (20-25)  ▓▓ High (13-19)  ░░ Medium (6-12)  ·· Low (1-5)
```

**Risk Zones (inherent):** High: R-7 (15). Medium: R-1 (9), R-2 (12), R-3 (6), R-4 (12), R-5 (6), R-6 (12), R-8 (12), R-9 (4 — Low). (R-9 is Low at 4.)

### Residual Risk Matrix (After Controls)

```text
                                    IMPACT
              1-Negligible 2-Minor    3-Moderate   4-Major    5-Catastrophic
           ┌───────────┬───────────┬───────────┬───────────┬───────────┐
5-Almost   │           │           │           │           │           │
Certain    │    5      │    10     │    15     │    20     │    25     │
           ├───────────┼───────────┼───────────┼───────────┼───────────┤
4-Likely   │           │           │           │           │           │
           │    4      │    8      │    12     │    16     │    20     │
L          ├───────────┼───────────┼───────────┼───────────┼───────────┤
I 3-Possible│          │ R-2 R-4   │           │           │           │
K          │    3      │ R-6 R-8   │    9      │    12     │    15     │
E          ├───────────┼───────────┼───────────┼───────────┼───────────┤
L 2-Unlikely│ R-5      │ R-1 R-3   │           │           │           │
I          │    2      │ R-9       │    6      │    8      │    10     │
H          ├───────────┼───────────┼───────────┼───────────┼───────────┤
O 1-Rare   │           │           │           │ R-7       │           │
O          │    1      │    2      │    3      │    4      │    5      │
D          └───────────┴───────────┴───────────┴───────────┴───────────┘

Legend: ██ Critical (20-25)  ▓▓ High (13-19)  ░░ Medium (6-12)  ·· Low (1-5)
```

**Risk Movement Analysis:**

- **R-7** 15 → 4 (privacy boundary enforced in schema + code makes occurrence rare; impact stays Major).
- **R-2** 12 → 6, **R-6** 12 → 6, **R-8** 12 → 6, **R-4** 12 → 6 (controls halve each).
- **R-1** 9 → 4, **R-3** 6 → 4, **R-5** 6 → 2, **R-9** 4 → 4 (stable, low).

---

## B. Top Risks (Ranked by Residual Score)

| Rank | ID | Title | Category | Inherent | Residual | Owner | Status | Response |
|------|----|-------|----------|----------|----------|-------|--------|----------|
| 1 | R-2 | `[MODEL]` edges not named SID v24 relationships | COMPLIANCE | 12 | 6 | Standards Reviewer | Open | Treat |
| 2 | R-4 | Over-claiming incident prevention | REPUTATIONAL | 12 | 6 | Lead Architect | Open | Treat |
| 3 | R-6 | NMOP feed drafts work-in-progress | TECHNOLOGY | 12 | 6 | L0 Feed Owner | Open | Treat |
| 4 | R-8 | Dead YANG-Push subscription read as conformance | TECHNOLOGY | 12 | 6 | Assurance Architect | Open | Treat |
| 5 | R-7 | Durable per-subscriber location leakage | COMPLIANCE | 15 | 4 | DPO | Open | Treat |
| 6 | R-1 | Two-store justification challenged | TECHNOLOGY | 9 | 4 | Lead Architect | Monitoring | Tolerate |
| 7 | R-3 | OWL scope minimal vs full | TECHNOLOGY | 6 | 4 | Standards Reviewer | Monitoring | Tolerate |
| 8 | R-9 | Bridge import staleness → wrong labels | TECHNOLOGY | 4 | 4 | Project Team | Monitoring | Treat |
| 9 | R-5 | Digital-twin term collision | OPERATIONAL | 6 | 2 | Lead Architect | Monitoring | Tolerate |

---

## C. Detailed Risk Register

### Risk R-1: Two-store justification challenged

**Category:** TECHNOLOGY · **Status:** Monitoring · **Risk Owner:** Lead Architect · **Action Owner:** Lead Architect

**Risk Description:** A reviewer/panel challenges the two-store topology (Neo4j + Fuseki) as unjustified complexity ("why not Neo4j only?"), forcing rework or eroding design credibility.
**Root Cause:** Two engines + a bridge add visible complexity that must be defended.
**Trigger Events:** Architecture-panel review; operator due-diligence; a reviewer unfamiliar with SHACL-as-intent.
**Consequences if Realized:** Rework toward a single store; lost review time; credibility dent.
**Affected Stakeholders:** Lead Architect, Standards Reviewer.
**Related Objectives:** BR-005 (standards defensibility); ADR-001.

| Assessment | Likelihood | Impact | Score |
|------------|-----------|--------|-------|
| Inherent | 3 Possible | 3 Moderate | **9 (Medium)** |

**Existing Controls:** ADR-001 records the engine-fit + defensibility rationale and a documented single-store fallback (Adequate, Owner: Lead Architect).

| Assessment | Likelihood | Impact | Score |
|------------|-----------|--------|-------|
| Residual | 2 Unlikely | 2 Minor | **4 (Low)** |

**Response:** TOLERATE — ADR-001 already mitigates; the fallback bounds the downside.
**Action:** Keep ADR-001 current; surface it early in any review. **Target:** 4 (Low). **Success:** review accepts the rationale.

---

### Risk R-2: `[MODEL]` civic/indoor edges not named SID v24 relationships

**Category:** COMPLIANCE (standards fidelity) · **Status:** Open · **Risk Owner:** Standards Reviewer · **Action Owner:** Project Team

**Risk Description:** The civic/indoor hierarchy edges are modelling-convenience `[MODEL]` constructs, not the named v24 `GeographicLocationRelationship` / `LocalLocationRelationship`; left unpromoted, they undermine the standards-fidelity claim at paper/panel.
**Root Cause:** Rig pragmatism (minimal model) vs full GB922 v24.0 fidelity.
**Trigger Events:** Paper submission; architecture panel; standards audit.
**Consequences if Realized:** Credibility loss; rework of the ontology/edges before publication.
**Affected Stakeholders:** Standards Reviewer, Lead Architect.
**Related Objectives:** BR-005, NFR-C-003, DR-005.

| Assessment | Likelihood | Impact | Score |
|------------|-----------|--------|-------|
| Inherent | 4 Likely | 3 Moderate | **12 (Medium)** |

**Existing Controls:** Provenance tagging distinguishes `[SID v24]` from `[MODEL]`; deviation report (FR-015) tracks the gap (Adequate).

| Assessment | Likelihood | Impact | Score |
|------------|-----------|--------|-------|
| Residual | 3 Possible | 2 Minor | **6 (Medium)** |

**Response:** TREAT — promote `[MODEL]` edges to the named v24 relationships before any paper/panel.
**Action:** Promotion task scheduled pre-publication; deviation report records status. **Target:** 6 → 4 after promotion. **Success:** no `[MODEL]` civic/indoor edges remain at publication.

---

### Risk R-3: OWL scope minimal (~15) vs full (~85) Location ABE

**Category:** TECHNOLOGY (standards scope) · **Status:** Monitoring · **Risk Owner:** Standards Reviewer · **Action Owner:** Standards Reviewer

**Risk Description:** The rig ships a minimal OWL subset; if mistaken for the full Location ABE, it overstates coverage.
**Root Cause:** Rig scope vs full-ABE fidelity trade-off (DR-006).
**Trigger Events:** Publication; reuse by another team assuming full coverage.
**Consequences if Realized:** Misrepresentation of coverage; rework if full ABE required.
**Affected Stakeholders:** Standards Reviewer.
**Related Objectives:** DR-006, BR-005.

| Assessment | Likelihood | Impact | Score |
|------------|-----------|--------|-------|
| Inherent | 3 Possible | 2 Minor | **6 (Medium)** |

**Existing Controls:** Scope documented as minimal-for-rig; confirm-before-publication gate; deviation report (Adequate).

| Assessment | Likelihood | Impact | Score |
|------------|-----------|--------|-------|
| Residual | 2 Unlikely | 2 Minor | **4 (Low)** |

**Response:** TOLERATE — acceptable for the rig; confirm scope before publication.
**Action:** State minimal scope in README + deviation report. **Target:** 4 (Low). **Success:** scope explicitly stated wherever the ontology is presented.

---

### Risk R-4: Over-claiming incident prevention

**Category:** REPUTATIONAL · **Status:** Open · **Risk Owner:** Lead Architect · **Action Owner:** Lead Architect

**Risk Description:** Claiming the system "prevents" outages (e.g. the Optus 000 failure mode) over-states capability; the architecture *surfaces consequence pre-commit* but does not execute a skipped human procedure. An over-claim that is later contradicted by an incident is reputationally damaging.
**Root Cause:** A compelling motivating incident invites an over-broad claim.
**Trigger Events:** Public messaging, paper abstract, sales narrative; a real incident occurring despite the system.
**Consequences if Realized:** Credibility/reputational damage; possible misrepresentation.
**Affected Stakeholders:** Lead Architect, Standards Reviewer, prospective operators.
**Related Objectives:** BR-001 (claim narrowed by design).

| Assessment | Likelihood | Impact | Score |
|------------|-----------|--------|-------|
| Inherent | 3 Possible | 4 Major | **12 (Medium)** |

**Existing Controls:** BR-001 success criteria explicitly narrow the claim ("surfaces consequence; does not execute a skipped procedure"); §12 R4 disposition; out-of-scope statement on procedural controls (Adequate).

| Assessment | Likelihood | Impact | Score |
|------------|-----------|--------|-------|
| Residual | 2 Unlikely | 3 Moderate | **6 (Medium)** |

**Response:** TREAT — enforce narrow-claim wording in all external artefacts.
**Action:** Claim-language review gate for paper/marketing. **Target:** 6 (Medium), monitored. **Success:** all external claims match the narrowed wording.

---

### Risk R-5: Digital-twin term collision

**Category:** OPERATIONAL (communication) · **Status:** Monitoring · **Risk Owner:** Lead Architect · **Action Owner:** All

**Risk Description:** Two distinct "digital twins" exist (Graf/NMOP YANG network-state twin vs this SID service/place twin); conflating them confuses audiences and misattributes capability.
**Root Cause:** Overloaded "digital twin" terminology across adjacent work.
**Trigger Events:** Joint presentations; cross-team docs.
**Consequences if Realized:** Miscommunication; misattributed scope.
**Affected Stakeholders:** All; adjacent NMOP work.
**Related Objectives:** §11 relationship-to-adjacent-work clarity.

| Assessment | Likelihood | Impact | Score |
|------------|-----------|--------|-------|
| Inherent | 3 Possible | 2 Minor | **6 (Medium)** |

**Existing Controls:** Always qualify which twin (Decision D10 vocabulary note) (Strong).

| Assessment | Likelihood | Impact | Score |
|------------|-----------|--------|-------|
| Residual | 2 Unlikely | 1 Negligible | **2 (Low)** |

**Response:** TOLERATE — naming discipline suffices.
**Action:** Qualify "twin" in every cross-audience doc. **Target:** 2 (Low). **Success:** no unqualified "digital twin" in shared material.

---

### Risk R-6: NMOP feed drafts are work-in-progress

**Category:** TECHNOLOGY · **Status:** Open · **Risk Owner:** L0 Feed Owner · **Action Owner:** L0 Feed Owner

**Risk Description:** The feed addressing depends on IETF NMOP drafts (`draft-netana-nmop-yang-message-broker-message-key-00`, SIMAP) that may change, breaking the message-key scheme or alignment.
**Root Cause:** Building on pre-RFC drafts.
**Trigger Events:** Draft revision; WG direction change.
**Consequences if Realized:** Feed-layer rework; topic/key scheme changes.
**Affected Stakeholders:** L0 Feed Owner, Project Team.
**Related Objectives:** FR-001, INT-001, NFR-S-001.

| Assessment | Likelihood | Impact | Score |
|------------|-----------|--------|-------|
| Inherent | 4 Likely | 3 Moderate | **12 (Medium)** |

**Existing Controls:** Pin draft revisions in README; isolate the scheme behind the L0 feed component (Adequate).

| Assessment | Likelihood | Impact | Score |
|------------|-----------|--------|-------|
| Residual | 3 Possible | 2 Minor | **6 (Medium)** |

**Response:** TREAT — pin + encapsulate; track WG progress.
**Action:** README records pinned draft revisions; feed adapter isolates the scheme. **Target:** 6 (Medium), monitored. **Success:** a draft change touches only the feed component.

---

### Risk R-7: Durable per-subscriber location leakage (privacy)

**Category:** COMPLIANCE (privacy) · **Status:** Open · **Risk Owner:** Data Protection Officer · **Action Owner:** Project Team

**Risk Description:** If live per-subscriber serving location were persisted (against the P4 boundary), the system would hold durable location PII, breaching GDPR/PDPA data-minimisation.
**Root Cause:** Correlation/dispatch convenience tempts durable subscriber-location storage.
**Trigger Events:** A feature shortcut; an un-TTL'd projection; a query materialising subscriber location.
**Consequences if Realized:** Privacy breach; regulatory exposure (PDPA/GDPR); loss of trust.
**Affected Stakeholders:** DPO, end subscribers, operator.
**Related Objectives:** BR-006, NFR-C-001, DR-004, FR-014.

| Assessment | Likelihood | Impact | Score |
|------------|-----------|--------|-------|
| Inherent | 3 Possible | 5 Catastrophic | **15 (High)** |

**Existing Controls:** P4 transient boundary enforced in **schema and code**; per-subscriber location resolved on demand with TTL only, never master (FR-014); acceptance criterion "no per-subscriber location persisted anywhere" (Strong).

| Assessment | Likelihood | Impact | Score |
|------------|-----------|--------|-------|
| Residual | 1 Rare | 4 Major | **4 (Low)** |

**Response:** TREAT — schema-and-code enforcement + explicit test.
**Action:** Store-inspection test asserts no durable subscriber location; TTL job reviewed. **Target:** 4 (Low). **Success:** automated check passes; DPO sign-off. Aligns with PRIN 6 (Data Sovereignty).

---

### Risk R-8: Silent/dead YANG-Push subscription misread as conformance

**Category:** TECHNOLOGY (safety) · **Status:** Open · **Risk Owner:** Assurance Architect · **Action Owner:** Project Team

**Risk Description:** If the feed subscription dies, absence of change events could be misread as "network on-design," letting the closed loop pass a faulty state or gate a change on stale data.
**Root Cause:** A closed loop that equates "no change observed" with "no problem."
**Trigger Events:** Broker/subscription failure; consumer crash; silent feed.
**Consequences if Realized:** False "all clear"; missed fault; mis-gated remediation.
**Affected Stakeholders:** Assurance Architect, NOC, operator.
**Related Objectives:** NFR-A-002 (subscription-health precondition), UC-1.

| Assessment | Likelihood | Impact | Score |
|------------|-----------|--------|-------|
| Inherent | 3 Possible | 4 Major | **12 (Medium)** |

**Existing Controls:** NFR-A-002 makes subscription health a precondition for ACTING; observability redundancy (NFR-A-001) (Adequate).

| Assessment | Likelihood | Impact | Score |
|------------|-----------|--------|-------|
| Residual | 2 Unlikely | 3 Moderate | **6 (Medium)** |

**Response:** TREAT — health-gated acting + multi-vantage observability.
**Action:** Controller checks subscription health before ACTING; alert on silent feed. **Target:** 6 (Medium), monitored. **Success:** a killed subscription blocks acting and raises an alert in test.

---

### Risk R-9: Bridge import staleness → wrong labels

**Category:** TECHNOLOGY · **Status:** Monitoring · **Risk Owner:** Project Team · **Action Owner:** Project Team

**Risk Description:** If the n10s ontology import is not re-run after an ontology change, Neo4j labels no longer resolve to current GB922 class names, producing misleading correlation output.
**Root Cause:** Uni-directional bridge requires re-init on ontology change (ADR-001).
**Trigger Events:** Ontology edit without bridge re-init.
**Consequences if Realized:** Wrong/stale labels; misleading impact output.
**Affected Stakeholders:** Project Team, NOC.
**Related Objectives:** FR-004, ADR-001.

| Assessment | Likelihood | Impact | Score |
|------------|-----------|--------|-------|
| Inherent | 2 Unlikely | 2 Minor | **4 (Low)** |

**Existing Controls:** n10s init is part of the build/init step; acceptance check that labels resolve to `sid:` classes (Adequate).

| Assessment | Likelihood | Impact | Score |
|------------|-----------|--------|-------|
| Residual | 2 Unlikely | 2 Minor | **4 (Low)** |

**Response:** TREAT — re-init on ontology change; CI check.
**Action:** Make bridge re-init a documented step on ontology change. **Target:** 4 (Low). **Success:** labels resolve correctly after any ontology change.

---

## D. Risk Category Analysis

### TECHNOLOGY (5 risks: R-1, R-3, R-6, R-8, R-9)

Avg inherent 8.6 → avg residual 4.8 (≈44% reduction). Themes: pre-RFC draft dependency (R-6), closed-loop safety (R-8), bridge correctness (R-9), topology defensibility (R-1), scope clarity (R-3). Profile: ✅ Acceptable — all residual Medium/Low with treatments.

### COMPLIANCE (2 risks: R-2, R-7)

Avg inherent 13.5 → avg residual 5.0 (63% reduction). Themes: standards fidelity (R-2), privacy/data-minimisation (R-7). Profile: ⚠️ Watch — privacy impact stays Major even when rare; keep the enforcement test green.

### REPUTATIONAL (1 risk: R-4)

Inherent 12 → residual 6. Theme: narrow-claim discipline. Profile: ⚠️ Watch — narrative risk, prevention is wording discipline.

### OPERATIONAL (1 risk: R-5)

Inherent 6 → residual 2. Theme: terminology discipline. Profile: ✅ Acceptable.

### STRATEGIC / FINANCIAL

None this iteration (open reference rig; no budget/strategic-direction exposure in scope).

---

## E. Risk Ownership Matrix

| Stakeholder | Role | Owned Risks | High | Medium | Low | Notes |
|-------------|------|-------------|------|--------|-----|-------|
| Lead Architect | Decision owner | R-1, R-4, R-5 | 0 | 1 (R-4) | 2 | Defensibility + narrative |
| Standards Reviewer | Standards fidelity | R-2, R-3 | 0 | 1 (R-2) | 1 | Promote `[MODEL]` edges |
| Data Protection Officer | Privacy | R-7 | 0 (resid) | 0 | 1 (R-7 resid) | Highest inherent sensitivity |
| L0 Feed Owner | Feed component | R-6 | 0 | 1 | 0 | Pin NMOP drafts |
| Assurance Architect | Closed-loop safety | R-8 | 0 | 1 | 0 | Health-gated acting |
| Project Team | Build | R-9 | 0 | 0 | 1 | Bridge re-init discipline |

**Escalation paths:** Privacy (R-7) → DPO → Lead Architect; Standards (R-2/R-3) → Standards Reviewer → Architecture Review Board; all others → Lead Architect.

---

## F. 4Ts Response Framework Summary

| Response | Count | % | Key Examples |
|----------|-------|---|--------------|
| **TOLERATE** | 3 | 33% | R-1, R-3, R-5 (low residual; rationale documented) |
| **TREAT** | 6 | 67% | R-2, R-4, R-6, R-7, R-8, R-9 |
| **TRANSFER** | 0 | 0% | — (no insurable/contractable risks in this rig) |
| **TERMINATE** | 0 | 0% | — |

**Insight:** No transfer/terminate — risks are internal design/standards/feed concerns addressed by controls, not external liabilities.

---

## G. Risk Appetite Compliance

No ratified organisational appetite exists yet; a qualitative appetite is applied: COMPLIANCE/privacy **Very Low** (≤ 4), REPUTATIONAL **Low** (≤ 6), TECHNOLOGY **Medium** (≤ 12), OPERATIONAL **Low** (≤ 6).

| Category | Qualitative Appetite | Residual within? | Note |
|----------|----------------------|------------------|------|
| COMPLIANCE | ≤ 4 | R-7 = 4 ✅; R-2 = 6 ⚠️ | R-2 above privacy-grade appetite but it is a fidelity (not data) risk; treat to ≤ 4 via promotion |
| REPUTATIONAL | ≤ 6 | R-4 = 6 ✅ (at threshold) | Keep claim narrow |
| TECHNOLOGY | ≤ 12 | R-1/3/6/8/9 ✅ | All within |
| OPERATIONAL | ≤ 6 | R-5 = 2 ✅ | Within |

**Overall:** Within qualitative appetite once R-2 is promoted; ratify appetite via `projects/000-global/risk-appetite.md`.

---

## H. Prioritized Action Plan

| Priority | Action | Risk(s) | Owner | Due | Expected Impact | Status |
|----------|--------|---------|-------|-----|-----------------|--------|
| 1 | Store-inspection test: assert no durable per-subscriber location; review TTL job | R-7 | DPO / Project Team | Build task 7 | Hold residual at 4 (Low) | Not Started |
| 2 | Subscription-health precondition for ACTING + silent-feed alert | R-8 | Assurance Architect | Build task 7 | 12 → 6 | Not Started |
| 3 | Promote `[MODEL]` civic/indoor edges to named v24 relationships | R-2 | Standards Reviewer | Pre-publication | 6 → 4 | Not Started |
| 4 | Pin NMOP draft revisions in README; isolate feed adapter | R-6 | L0 Feed Owner | Build task 6 | 12 → 6 | Not Started |
| 5 | Claim-language review gate for paper/marketing | R-4 | Lead Architect | Pre-publication | Hold at 6 | Not Started |
| 6 | Bridge re-init step on ontology change + CI label check | R-9 | Project Team | Build task 5 | Hold at 4 | Not Started |

---

## I. Integration with SOBC

Not applicable this iteration (open reference rig, no business case). If the pattern progresses toward an operator deployment, this register feeds the SOBC Management Case Part E (risk management), and R-7 (privacy) + R-2 (standards fidelity) would shape option selection and the costed contingency.

---

## J. Monitoring and Review Framework

| Risk Level | Review Frequency | Reviewed By | Escalated To |
|------------|------------------|-------------|--------------|
| High (13-19) | Monthly | Risk Owner | Architecture Review Board |
| Medium (6-12) | Monthly | Risk Owner | Lead Architect |
| Low (1-5) | Quarterly | Action Owner | Risk Owner |

**Escalation triggers:** any risk +5 points; any new Critical; R-7 control test failing; an external claim exceeding the narrowed BR-001 wording.
**Next Review Date:** 2026-07-17. **Risk Register Owner:** Lead Architect.

---

## K. Orange Book Compliance Checklist

- ✅ **Governance & Leadership** — owners assigned (from REQ stakeholder table pending STKE); escalation paths defined.
- ✅ **Integration** — every risk linked to REQ IDs and ADR-001 / HLD sections.
- ✅ **Collaboration & Best Information** — risks sourced from the HLD §12, requirements, and the ADR.
- ✅ **Risk Processes** — 6-category scan, 5×5 inherent/residual, 4Ts responses.
- ✅ **Continual Improvement** — review cadence + KRIs + action plan.

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

| Score | Rating | Description (this project) |
|-------|--------|----------------------------|
| 1 | Negligible | Cosmetic; routine fix |
| 2 | Minor | Local rework; no external effect |
| 3 | Moderate | Notable rework or review friction |
| 4 | Major | Credibility/safety/privacy concern, recoverable |
| 5 | Catastrophic | Privacy breach / publication credibility collapse |

### Score Bands

| Range | Level | Action |
|-------|-------|--------|
| 20-25 | 🟥 Critical | Immediate escalation |
| 13-19 | 🟧 High | Mitigation plan required |
| 6-12 | 🟨 Medium | Monitor + treat |
| 1-5 | 🟩 Low | Routine monitoring |

---

## Appendix B: Risk-to-Requirement Linkage

| Risk | REQ / ADR / HLD link | Driver under threat |
|------|----------------------|---------------------|
| R-1 | ADR-001; REQ Conflict C-1 | BR-005 (defensibility) |
| R-2 | DR-005, NFR-C-003; HLD §8/§12 R2 | BR-005 |
| R-3 | DR-006; HLD §12 R3 | BR-005 |
| R-4 | BR-001; HLD §12 R4 | BR-001 |
| R-5 | HLD §10 D10/§11/§12 R5 | clarity |
| R-6 | FR-001, INT-001; HLD §12 R6 | FR-001 |
| R-7 | BR-006, NFR-C-001, DR-004, FR-014 | BR-006 |
| R-8 | NFR-A-002; UC-1 | BR-001/BR-003 |
| R-9 | FR-004; ADR-001 | BR-002 |

---

## Document Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| **Risk Register Owner** | Roland Pfeifer | | [PENDING] |
| **Data Protection Officer** | [PENDING] | | [PENDING] |
| **Standards/Research Reviewer** | [PENDING] | | [PENDING] |
| **Architecture Review Board** | [PENDING] | | [PENDING] |

---

## External References

> Traceability from generated content back to source documents.

### Document Register

| Doc ID | Filename | Type | Source Location | Description |
|--------|----------|------|-----------------|-------------|
| LATH | location_assurance_twin_HLD.md | High-Level Design | 006-location-assurance-twin/external/ | §12 risk list (R1–R6) + §6/§7 NFR/security |
| REQ006 | ARC-006-REQ-v1.0.md | Requirements | 006-location-assurance-twin/ | NFR/DR/FR sources for R-7/R-8/R-9 and owners |
| ADR006-1 | ARC-006-ADR-001-v1.0.md | ADR | 006-location-assurance-twin/decisions/ | Two-store decision controlling R-1/R-9 |

### Citations

| Citation ID | Doc ID | Page/Section | Category | Quoted Passage |
|-------------|--------|--------------|----------|----------------|
| LATH-C1 | LATH | §12 R1 | Risk Factor | "Two-store justification challenged ('why not Neo4j only?') | defence: Fuseki earns place for SHACL-as-intent + RDF interop; else collapse to one store" |
| LATH-C2 | LATH | §12 R2 | Risk Factor | "`[MODEL]` civic/indoor edges not named SID associations | promote to `GeographicLocationRelationship` / `LocalLocationRelationship` before paper/panel" |
| LATH-C3 | LATH | §12 R3 | Risk Factor | "OWL scope (minimal ~15 vs full ~85 Location ABE) | minimal acceptable for rig; confirm before publication" |
| LATH-C4 | LATH | §12 R4 | Risk Factor | "Over-claiming prevention of incidents | architecture surfaces consequence pre-commit; does NOT execute skipped procedure — keep claim narrow" |
| LATH-C5 | LATH | §12 R5 | Risk Factor | "Digital-twin term collision | always qualify which twin (YANG network-state vs SID service/place)" |
| LATH-C6 | LATH | §12 R6 | Risk Factor | "Feed draft is work-in-progress | message-key/SIMAP drafts may change; pin draft revisions in README" |
| LATH-C7 | LATH | §4.4 / §6 | Risk Factor | "Never durable: live per-subscriber serving location … never master data" (basis for R-7) |
| LATH-C8 | LATH | §6 NFR | Risk Factor | "feed must carry causal (data-plane) signal … incident detectable if ≥1 of 4 observed" (basis for R-8) |

### Unreferenced Documents

| Filename | Source Location | Reason |
|----------|-----------------|--------|
| location_twin_v24.cypher | 006-location-assurance-twin/external/ | Build seed; not a risk source |
| LOCATION_RESOURCE_SERVICE_PART_INTERACTION.pdf | 006-location-assurance-twin/external/ | Reference graphic; not a risk source |
| tmf_pyramid_digital_twin.svg | 006-location-assurance-twin/external/ | Positioning graphic; not a risk source |

---

**Generated by**: ArcKit `/arckit:risk` command
**Generated on**: 2026-06-17
**ArcKit Version**: 5.11.0
**Project**: location-assurance-twin (Project 006)
**Model**: Claude Opus 4.8 (1M context)
**Generation Context**: HLD v0.1 §12 (R1–R6) + ARC-006-REQ-v1.0 (R-7/R-8/R-9) + ARC-006-ADR-001. STKE/appetite pending — owners from REQ stakeholder table; appetite applied qualitatively.

<!-- arckit-provenance:start -->

## Build Provenance

_Stamped automatically by the ArcKit plugin's `provenance-stamp.mjs` PostToolUse hook. Complements (does not replace) the human-authored footer above. Carries only fields the model can't authoritatively self-report: build context from `.arckit/state.json` and effort levels derived from command frontmatter + the silent-downgrade matrix._

| Field | Value |
|-------|-------|
| Requested Effort | `high` |
| Effective Effort | _unknown — model not parsed from existing footer_ |
| Stamped at | 2026-06-17T15:05:41.658Z |

<!-- arckit-provenance:end -->
