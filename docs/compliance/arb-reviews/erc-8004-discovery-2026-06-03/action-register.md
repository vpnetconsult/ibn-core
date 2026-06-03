# Action Register — ERC-8004 Discovery ARB Review

**Linked report:** [`arb-review-report.md`](arb-review-report.md)
**Generated:** 2026-06-03
**Decision:** Approved with Conditions

One row per condition. Tracked at the next monthly ARB after Phase 1 GA.

| # | Action | ATT&CK refs | Owner | Due | Acceptance criteria | Status |
|---|--------|-------------|-------|-----|---------------------|--------|
| **C1** | Add §11 "Security Architecture Viewpoint" to `docs/roadmap/erc-8004-discovery.md` citing this ARB output's ATT&CK overlay, M-series mitigations, and DS-series detections | Cross-cutting; TOGAF G; Risk #7 | Roland | Before Phase 1 impl PR opens | Plan §11 contains the section; PR diff reviewable; cross-link to `docs/compliance/arb-reviews/erc-8004-discovery-2026-06-03/` present | ⬜ Open |
| **C2** | Apply a dedicated rate limit OR upstream CDN cache to `GET /.well-known/agent-registration.json` | **T1499** → **M1037 Filter Network Traffic** + **M1031 NIPS**; detect via **DS0029 Network Traffic** | Roland | Phase 1 impl PR (target v2.1.0) | Integration test confirms separate limiter wraps the well-known route; OR Cloudflare / CDN config committed alongside route; rate-limit threshold documented in plan §4.4 | ⬜ Open |
| **C3** | Store `AGENT_OWNER_PRIVATE_KEY` in a Kubernetes Secret with RBAC restricting `get`/`watch` to the deploy ServiceAccount only; document key residency, rotation cadence (≤ 90 days for testnet), and incident-response steps in `SECURITY.md` | **T1552.001** + **T1555** + **T1078.004** → **M1027 Password Policies** + **M1041 Encrypt Sensitive Information** + **M1018 User Account Management**; detect via **DS0022 File** access events | Roland | Phase 2 impl PR (target v2.2.0) | K8s manifest committed; RBAC role file lists the ServiceAccount explicitly; SECURITY.md amended; `kubectl auth can-i list secrets` smoke test recorded in evidence doc | ⬜ Open |
| **C4** | Implement on-chain monitor polling minted `agentId`'s `tokenURI`; alert on change not authored by a controlled deploy; pin expected `agentURI` in CI smoke test (`scripts/verify-registration.ts`) | **T1565.002** → **M1041 Encrypt Sensitive Information** + **M1022 Restrict File and Directory Permissions** + detective control; detect via **DS0029 Network Traffic** (on-chain event poll) + **DS0022 File modification** | Roland | Phase 2 impl PR; monitor LIVE before any mainnet path is contemplated | Monitor script committed; sample alert recorded in evidence doc; CI smoke test passes against live Base Sepolia state; expected `tokenURI` value pinned in CI config | ⬜ Open |
| **C5** | Add route-level structured error/anomaly logging on `GET /.well-known/agent-registration.json` plumbed through `src/telemetry.ts`; emit **DS0015 Application Log** events for 4xx/5xx with rate-spike detection | **T1190** → **M1016 Vulnerability Scanning** + **M1051 Update Software** + **M1050 Exploit Protection**; detect via **DS0015 Application Log** + **DS0029 Network Traffic** | Roland | Phase 1 impl PR (target v2.1.0) | Telemetry test asserts a route-level span/log emission on 4xx/5xx; documented in plan §4.4; metric exposed via existing Prometheus `/metrics` endpoint | ⬜ Open |

## Risk-only items (no condition, recorded for the register)

| # | Risk | Treatment | Owner | Notes |
|---|------|-----------|-------|-------|
| **R5** | T1525 + T1554 (image supply chain) — residual 3 | Mitigate via existing CodeQL + Dependabot posture | Roland | Document the dependence in `docs/compliance/arb-reviews/erc-8004-discovery-2026-06-03/repository-delta.md`; no new control added |
| **R6** | T1071.001 — egress to Base Sepolia RPC not policy-specified — residual 2 | Mitigate by stating expected egress + log via existing telemetry | Roland | Plan §5.3 amendment (state expected RPC URL pattern); no K8s NetworkPolicy required at this scale |
| **R8** | TOGAF H — no SLO/SLI for new route — residual 1 | **Accept** (non-critical-path; existing `/health` covers operational state) | Roland | Acceptance recorded in this report §6 Risk #8; 12-month review |
| **R9** | TOGAF J — no rollback plan if ERC-8004 spec shifts — residual 2 | Mitigate (already partial via type isolation D5/§7 R1); add explicit rollback statement | Roland | Plan §7 amendment in Phase 1 impl PR |

## Closure tracking

This register closes when:

- C1, C2, C5 are evidenced in the Phase 1 implementation PR
- C3, C4 are evidenced in the Phase 2 implementation PR + the Phase 2 evidence doc at `docs/compliance/ERC-8004-base-sepolia-registration.md`
- R5/R6/R9 are evidenced as plan or evidence-doc amendments
- R8 acceptance is signed by the Solution Architect in the report's §9

The next monthly ARB will treat any open ⬜ item as a discussion item.
