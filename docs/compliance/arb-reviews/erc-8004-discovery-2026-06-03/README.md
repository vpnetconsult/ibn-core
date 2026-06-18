# ARB Review — ERC-8004 Discovery for ibn-core

| Field | Value |
|---|---|
| Submission | PR [#46](https://github.com/vpnetconsult/ibn-core/pull/46) — [`docs/roadmap/erc-8004-discovery.md`](../../../roadmap/erc-8004-discovery.md) |
| Review date | 2026-06-03 (reconciled same-day) |
| Decision | **Approved with Conditions** (5 conditions C1–C5) |
| Status | **Final** — reconciled 2026-06-03 against the live MITRE ATT&CK MCP (enterprise domain); see report §11 |
| Submitting architect | Roland Pfeifer (Vpnet Cloud Solutions Sdn. Bhd.) |

## Artefacts in this directory

| File | Purpose |
|---|---|
| [`arb-review-report.md`](arb-review-report.md) | The board-ready ARB Review Report. Decision, conditions, TOGAF findings, ATT&CK overlay, risk register, sign-off page. |
| [`action-register.md`](action-register.md) | Per-condition tracking table with ATT&CK refs, owners, due dates, acceptance criteria. |
| [`attack-navigator-layer.json`](attack-navigator-layer.json) | MITRE ATT&CK Navigator v4.5 layer JSON. Import into <https://mitre-attack.github.io/attack-navigator/> for visualisation. |
| [`repository-delta.md`](repository-delta.md) | Architecture Repository updates required as a result of this decision. |

## How to read this review

1. Start with [`arb-review-report.md`](arb-review-report.md) §1 Executive Summary and §2 Decision.
2. Cross-check the §4 TOGAF compliance findings against the plan PR.
3. The §5 ATT&CK overlay was reconciled against the live MITRE knowledge base on 2026-06-03 — see report §11 for the reconciliation findings (one technique ID correction, six M/DS attribution refinements, one risk likelihood uplift).
4. The five conditions in §2 are the closure work for Phase 1 + Phase 2 implementation PRs.
5. [`action-register.md`](action-register.md) is the single source of truth for tracking the conditions; it carries the post-reconciliation M/DS attributions and a Phase 1 progress audit.

## Reconciliation summary (2026-06-03)

The report was originally Provisional because the MITRE ATT&CK MCP was unavailable; it was reconciled the same day. Three material findings:

- **T1565.002 → T1565.001.** The highest-impact technique was correctly described as "Stored Data Manipulation" but cited the v15 ID for "Transmitted Data Manipulation". Corrected throughout.
- **Six M/DS attribution corrections** for C2, C3, C4, C5 — conditions themselves unchanged in substance.
- **Risk #1 (T1190) likelihood Medium → High** based on Volt Typhoon / Salt Typhoon / HAFNIUM active telecom-infrastructure prevalence. Residual 4 → 6. Two risks now at residual 6; both close via existing conditions; max residual unchanged, no Executive Risk Committee escalation.

Decision **Approved with Conditions** stands. Status now Final.

---

*Generated 2026-06-03 via `/arb-review` skill; reconciled same-day against live MITRE ATT&CK MCP (enterprise domain). Vpnet Cloud Solutions Sdn. Bhd.*
