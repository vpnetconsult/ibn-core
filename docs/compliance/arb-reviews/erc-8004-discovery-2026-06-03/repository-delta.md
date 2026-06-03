# Architecture Repository Delta — ERC-8004 Discovery ARB Review

**Linked report:** [`arb-review-report.md`](arb-review-report.md)
**Generated:** 2026-06-03

The following Architecture Repository artefacts MUST be updated as a result of the ARB decision. Each entry names the artefact, what to add/amend, and where it lands in the repo.

Vpnet Cloud Solutions Sdn. Bhd. operates a single small-org Architecture Repository realised inside the ibn-core repo at `docs/` — there is no separate enterprise EA tool. References below are to repo paths.

---

## 1. Capability heatmap

**Artefact:** Capability map (currently implicit in `CLAUDE.md` §Standards Implementation Map and `docs/architecture/`).

**Add:**
- New capability: **Cross-Organisational Agent Discovery** — at v2.1.0 (off-chain) and v2.2.0 (on-chain, Base Sepolia testnet).
- Mark as Emerging — not yet on the critical path; not Canvas CTK-required.

**Where it lands:** `docs/architecture/` — extend the capability section. If no formal capability heatmap file exists, create `docs/architecture/capability-map.md` as the canonical source.

---

## 2. Application attack-surface viewpoint

**Artefact:** Public-surface inventory (currently implicit across `src/index.ts` and `docs/security/`).

**Add:**
- New route: `GET /.well-known/agent-registration.json` on `ibn-core.vpnet.cloud` — public, unauthenticated, **deliberately outside `/api/` rate limiter** (plan §4.4) — **paired control C2** (dedicated limiter or CDN) is required to compensate.
- Newly advertised route (existing): `/tmf-api/intentManagement/v5/*` — now discoverable via on-chain `agentId` lookup post-Phase 2.
- New outbound: HTTPS to Base Sepolia JSON-RPC (Phase 2). Document the expected RPC URL pattern. No K8s NetworkPolicy strictly required at this scale but document the egress for future tightening.

**Where it lands:** Either `docs/security/ATTACK_SURFACE.md` (create if absent) or extend an existing security viewpoint doc. The plan §4.4 already states the routing decisions; the ARB delta is to consolidate them in a single attack-surface artefact.

---

## 3. Technology standard exposure record

**Artefact:** Technology Standards Catalog (currently `CLAUDE.md` §Upstream Standards section + `docs/standards/`).

**Add:**
- **ERC-8004 v1 (Trustless Agents)** — Emerging standard. Status: Draft, live on Ethereum mainnet 2026-01-29. Licence: CC0. ibn-core conformance: Phase 1 registration file conforms to v1 shape; Phase 2 mint conforms to v1 registration semantics.
- **ERC-721 (with URIStorage extension)** — Transitively-adopted standard via the ChaosChain reference Identity Registry. No direct ibn-core implementation; usage is via the deployed contract.
- **EIP-712 / ERC-1271** — Listed as *deferred* dependencies. Will become in-scope when payment wallets are bound (Phase 3+).

**Where it lands:** `docs/standards/ERC-8004-mapping.md` (a Phase 1 plan deliverable). This ARB delta makes that file part of the Architecture Repository, not just a Phase 1 implementation artefact.

---

## 4. Building block catalog

**Artefact:** Building block inventory (currently implicit in repo structure and `CLAUDE.md`).

**Solution Building Blocks introduced:**

| SBB ID (proposed) | Name | Path | Status |
|---|---|---|---|
| **SBB-2026-001** | Discovery — ERC-8004 Off-Chain Registration File | `src/discovery/*` | Pending — created by Phase 1 impl PR |
| **SBB-2026-002** | Discovery — Base Sepolia Mint Script | `scripts/register-agent.ts` | Pending — created by Phase 2 impl PR |
| **SBB-2026-003** | Discovery — On-Chain Token URI Monitor | `scripts/monitor-token-uri.ts` (proposed name) | Pending — created by C4 in Phase 2 impl PR |

**Architecture Building Blocks referenced (external):**

| ABB | Source | Conformance posture |
|---|---|---|
| **ChaosChain Identity Registry (Base Sepolia)** | <https://github.com/ChaosChain/trustless-agents-erc-ri> | Reused as-is. Address pinned in `config/erc-8004.yaml`. No redeployment by Vpnet. |
| **ERC-721 NFT standard** | <https://eips.ethereum.org/EIPS/eip-721> | Transitively conformed via the above contract. |

**Where it lands:** A new `docs/architecture/building-blocks.md` if no formal catalog exists. Otherwise extend the existing file.

---

## 5. Risk register

**Artefact:** Enterprise risk register (currently no dedicated file).

**Add 9 entries** from `arb-review-report.md` §6, cross-referenced to this ARB review path. Each entry includes residual score, treatment, accepting authority, and review date.

**Where it lands:** `docs/security/RISK_REGISTER.md` (create if absent). At v2.x scale this can be a single Markdown table; if the workstream grows, consider splitting per-workstream.

---

## 6. Standards Traceability Map

**Artefact:** RFC-9315-to-implementation map (currently `CLAUDE.md` §Standards Implementation Map).

**Amend:**
- The entry for **RFC 9315 §4 P5 (Capability Exposure)** currently maps only to `McpAdapter.getCapabilities()`. Amend to clarify that there are TWO surfaces:
  - **Network-service-capability surface** — `McpAdapter.getCapabilities()` (existing).
  - **Agent-communication-endpoint surface** — `GET /.well-known/agent-registration.json` (new, Phase 1).
- Both implement Principle 5 at different layers. The plan §2.3 already makes this distinction; the ARB delta is to surface it in the canonical Standards Implementation Map at the top of `CLAUDE.md`.

**Where it lands:** `CLAUDE.md` §Standards Implementation Map. Treat as a CLAUDE.md amendment in the Phase 1 impl PR (alongside C1).

---

## 7. Open-core boundary record

**Artefact:** Open-core split documentation (currently `CLAUDE.md` §Licensing Rules).

**Confirm:**
- ERC-8004 discovery code lives in the **public** ibn-core repo per plan §6 D4.
- No operator-specific data is published in the registration file (plan §4.2: services array is TMF921 v5 endpoint + GitHub web link only).
- Phase 2 owner key is environment-scoped, not committed to the repo.

**Where it lands:** No CLAUDE.md amendment needed — the existing licensing/open-core rules cover this. Recorded here for traceability.

---

## 8. Provisional reconciliation tasks (because the ARB review is Provisional)

Before the entries above become *final* Architecture Repository updates:

1. Reconcile `attack-navigator-layer.json` IDs against live MITRE ATT&CK v15+ — see report §10 reconciliation note.
2. Verify the **T1565.002** mapping (the highest-impact technique) is current — the v15 description should still cover the `setAgentURI` redirect scenario.
3. If any technique ID has shifted in v15+, regenerate the navigator layer JSON and update the conditions C2–C5 ATT&CK references in the action register.

The decision and conditions are robust to such reconciliation — the substance of the gaps does not depend on disputed IDs.

---

*Repository Delta — generated 2026-06-03 via `/arb-review` skill. Vpnet Cloud Solutions Sdn. Bhd.*
