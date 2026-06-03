# Action Register — ERC-8004 Discovery ARB Review

**Linked report:** [`arb-review-report.md`](arb-review-report.md)
**Generated:** 2026-06-03 · **Reconciled:** 2026-06-03 (same-day, via live MITRE ATT&CK MCP — see report §11)
**Decision:** Approved with Conditions (Final)

One row per condition. Tracked at the next monthly ARB after Phase 1 GA.

> **Reconciliation note:** C4's technique ID has been corrected from **T1565.002** ("Transmitted Data Manipulation") to **T1565.001** ("Stored Data Manipulation") — see report §11.1. M/DS attribution refinements for C2, C3, C5 are recorded inline below (canonical mappings tightened); the actions themselves are unchanged in substance.

| # | Action | ATT&CK refs | Owner | Due | Acceptance criteria | Status |
|---|--------|-------------|-------|-----|---------------------|--------|
| **C1** | Add §11 "Security Architecture Viewpoint" to `docs/roadmap/erc-8004-discovery.md` citing this ARB output's ATT&CK overlay, M-series mitigations, and DS-series detections | Cross-cutting; TOGAF G; Risk #7 | Roland | Before Phase 1 impl PR opens | Plan §11 contains the section; PR diff reviewable; cross-link to `docs/compliance/arb-reviews/erc-8004-discovery-2026-06-03/` present | ⬜ Open |
| **C2** | Apply a dedicated rate limit OR upstream CDN cache to `GET /.well-known/agent-registration.json` | **T1499** → **M1037 Filter Network Traffic** (canonical); detect via **DS0029 Network Traffic** + **DS0015 Application Log** (composes with C5). *Reconciled: M1031 NIPS dropped — not canonical for T1499 in v15+; defence-in-depth advisory only.* | Roland | Phase 1 impl PR (target v2.1.0) | Integration test confirms separate limiter wraps the well-known route; OR Cloudflare / CDN config committed alongside route; rate-limit threshold documented in plan §4.4 | ⬜ Open |
| **C3** | Store `AGENT_OWNER_PRIVATE_KEY` in a Kubernetes Secret with RBAC restricting `get`/`watch` to the deploy ServiceAccount only; document key residency, rotation cadence (≤ 90 days for testnet), and incident-response steps in `SECURITY.md` | **T1552.001** → **M1022 Restrict File and Directory Permissions** + **M1027 Password Policies** + **M1047 Audit**; **T1555** → **M1026 Privileged Account Management** + **M1027** + **M1051 Update Software**; **T1078.004** → **M1018 User Account Management** + **M1026** + **M1036 Account Use Policies**. Detect via **DS0022 File Access** (file-side) + **DS0002 User Account Authentication** + **DS0028 Logon Session** (cloud-account-side). *Reconciled: M1041 dropped from all three legs (not canonical); M1022 + M1026 added; DS0002/DS0028 added for T1078.004.* | Roland | Phase 2 impl PR (target v2.2.0) | K8s manifest committed; RBAC role file lists the ServiceAccount explicitly; SECURITY.md amended; `kubectl auth can-i list secrets` smoke test recorded in evidence doc | ⬜ Open |
| **C4** | Implement on-chain monitor polling minted `agentId`'s `tokenURI`; alert on change not authored by a controlled deploy; pin expected `agentURI` in CI smoke test (`scripts/verify-registration.ts`) | **T1565.001 Stored Data Manipulation** (corrected 2026-06-03 from T1565.002) → **M1022 Restrict File and Directory Permissions** + **M1041 Encrypt Sensitive Information** (canonical); **M1029 Remote Data Storage** noted but does not apply (on-chain `tokenURI` IS by-design remote storage). Detect via **DS0022 File modification** (key-side, canonical) + on-chain `tokenURI` change events (functionally DS0029-style network observation, defensible extension). | Roland | Phase 2 impl PR; monitor LIVE before any mainnet path is contemplated | Monitor script committed; sample alert recorded in evidence doc; CI smoke test passes against live Base Sepolia state; expected `tokenURI` value pinned in CI config | ⬜ Open |
| **C5** | Add route-level structured error/anomaly logging on `GET /.well-known/agent-registration.json` plumbed through `src/telemetry.ts`; emit **DS0015 Application Log** events for 4xx/5xx with rate-spike detection | **T1190** → **M1016 Vulnerability Scanning** + **M1051 Update Software** + **M1050 Exploit Protection**; detect via **DS0015 Application Log** + **DS0029 Network Traffic** | Roland | Phase 1 impl PR (target v2.1.0) | Telemetry test asserts a route-level span/log emission on 4xx/5xx; documented in plan §4.4; metric exposed via existing Prometheus `/metrics` endpoint | ⬜ Open |

## Risk-only items (no condition, recorded for the register)

| # | Risk | Treatment | Owner | Notes |
|---|------|-----------|-------|-------|
| **R5** | T1525 + T1554 (image supply chain) — residual 3 | Mitigate via existing CodeQL + Dependabot posture | Roland | Document the dependence in `docs/compliance/arb-reviews/erc-8004-discovery-2026-06-03/repository-delta.md`; no new control added |
| **R6** | T1071.001 — egress to Base Sepolia RPC not policy-specified — residual 2 | Mitigate by stating expected egress + log via existing telemetry | Roland | Plan §5.3 amendment (state expected RPC URL pattern); no K8s NetworkPolicy required at this scale |
| **R8** | TOGAF H — no SLO/SLI for new route — residual 1 | **Accept** (non-critical-path; existing `/health` covers operational state) | Roland | Acceptance recorded in this report §6 Risk #8; 12-month review |
| **R9** | TOGAF J — no rollback plan if ERC-8004 spec shifts — residual 2 | Mitigate (already partial via type isolation D5/§7 R1); add explicit rollback statement | Roland | Plan §7 amendment in Phase 1 impl PR |

## Phase 1 progress audit — 2026-06-03 (same-day, post-reconciliation)

Branch `feat/erc-8004-discovery-phase-1` contains only the plan and ARB review commits. **No Phase 1 implementation code yet.** All five conditions remain ⬜ Open.

| Condition | Phase | Current state | Next step |
|---|---|---|---|
| C1 | Phase 1 doc-only | ⬜ Open — plan still ends at §10; no Security Architecture Viewpoint section | **Closable now** via a doc-only PR amending `docs/roadmap/erc-8004-discovery.md` to add §11 cross-referencing this ARB output. No code dependency. |
| C2 | Phase 1 impl | ⬜ Open — no `/.well-known` route exists | Wait for Phase 1 impl PR; close in same PR |
| C3 | Phase 2 impl | ⬜ Open — expected (Phase 2 not started) | Phase 2 impl PR |
| C4 | Phase 2 impl | ⬜ Open — expected | Phase 2 impl PR + Phase 2 evidence doc |
| C5 | Phase 1 impl | ⬜ Open — no route to instrument | Phase 1 impl PR |

**Recommendation:** progress C1 as a doc-only PR before opening the Phase 1 implementation PR — unblocks the Phase 1 gate without code.

---

## Closure tracking

This register closes when:

- C1, C2, C5 are evidenced in the Phase 1 implementation PR
- C3, C4 are evidenced in the Phase 2 implementation PR + the Phase 2 evidence doc at `docs/compliance/ERC-8004-base-sepolia-registration.md`
- R5/R6/R9 are evidenced as plan or evidence-doc amendments
- R8 acceptance is signed by the Solution Architect in the report's §9

The next monthly ARB will treat any open ⬜ item as a discussion item.
