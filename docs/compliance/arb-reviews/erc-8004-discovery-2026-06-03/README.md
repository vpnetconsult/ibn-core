# ARB Review — ERC-8004 Discovery for ibn-core

| Field | Value |
|---|---|
| Submission | PR [#46](https://github.com/vpnetconsult/ibn-core/pull/46) — [`docs/roadmap/erc-8004-discovery.md`](../../../roadmap/erc-8004-discovery.md) |
| Review date | 2026-06-03 |
| Decision | **Approved with Conditions** (5 conditions C1–C5) |
| Status | **Provisional** — MITRE ATT&CK MCP unavailable; reconcile against live KB v15+ before final sign-off |
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
3. Cross-check the §5 ATT&CK overlay against the live MITRE knowledge base (this report is Provisional until reconciled).
4. The five conditions in §2 are the closure work for Phase 1 + Phase 2 implementation PRs.
5. [`action-register.md`](action-register.md) is the single source of truth for tracking the conditions.

## Provisional caveat

The MITRE ATT&CK MCP was not connected for this review. Technique IDs and mappings in the threat overlay (`§5` of the report, the navigator layer JSON) are derived from model knowledge of ATT&CK v15. Reconcile against `attack.mitre.org` v15+ before this report is treated as final. The decision (Approved with Conditions) and the substance of the conditions are robust to ID renamings — only the layer JSON visualisation needs updating if IDs have shifted.

---

*Generated 2026-06-03 via `/arb-review` skill. Vpnet Cloud Solutions Sdn. Bhd.*
