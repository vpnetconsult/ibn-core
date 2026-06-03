# ERC-8004 Discovery for ibn-core (Phase 1 + Phase 2)

| Field | Value |
|---|---|
| Workstream | **ERC-8004 Discovery** — make ibn-core discoverable via the ERC-8004 Identity Registry |
| Phases in scope | **Phase 1** off-chain registration file (v2.1.0) · **Phase 2** Base Sepolia mint (v2.2.0) |
| Out of scope | Reputation Registry, Validation Registry, mainnet/L2 deployment, `setAgentWallet`, EIP-712/ERC-1271 wallet rebinding, x402 payments |
| Spec | [ERC-8004 — Trustless Agents (Draft, became live on Ethereum mainnet 2026-01-29)](https://eips.ethereum.org/EIPS/eip-8004) |
| Reference implementation | [`ChaosChain/trustless-agents-erc-ri`](https://github.com/ChaosChain/trustless-agents-erc-ri) — v1.0-compliant, audited, deployed across 20+ networks including Base Sepolia |
| Target version (Phase 1) | **v2.1.0** |
| Target version (Phase 2) | **v2.2.0** |
| Effort estimate | Phase 1: **S** (≤1 day) · Phase 2: **M** (1–3 days, includes testnet mint + verification round-trip) |
| Depends on | None — `McpAdapter` seam unaffected, no schema changes |
| Blocks | Future Reputation Registry / Validation Registry workstreams (separate plans) |
| Plan author | Vpnet Cloud Solutions Sdn. Bhd. |
| Plan date | 2026-06-03 |
| Status | ⬜ Draft — awaiting review |

> **Plan-only PR.** Per `CLAUDE.md` *Agent-Native Development* §2 — Plans before
> PRs — this document does **not** change source code. Implementation lands in
> a separate PR after this plan is approved.

---

## 1. What ERC-8004 Requires

ERC-8004 specifies three on-chain registries deployable as per-chain singletons:

| Registry | Purpose | In this plan |
|---|---|---|
| **Identity Registry** | ERC-721 NFT per agent; `tokenURI` resolves to an off-chain registration file describing the agent's endpoints and trust model | **Yes** — both phases |
| **Reputation Registry** | On-chain feedback signals (`int128` value + tags) from clients about agents | Out of scope |
| **Validation Registry** | Hooks for validators (zkML / TEE / stake-secured re-execution) to attest to an agent's work | Out of scope |

### Identity Registry contract — what ibn-core integrates with

The ibn-core implementation does **not** deploy or modify any contract. It
integrates with the ChaosChain reference Identity Registry contract that is
already deployed on Base Sepolia. The contract is ERC-721-with-URIStorage; the
agent owner mints an `agentId` and sets the `agentURI` to a URL that resolves
to the registration file described in §3.

### Off-chain registration file shape — ERC-8004 v1

The agent registration file ibn-core publishes must conform to the v1 shape
keyed by `type: "https://eips.ethereum.org/EIPS/eip-8004#registration-v1"`:

```jsonc
{
  "type": "https://eips.ethereum.org/EIPS/eip-8004#registration-v1",
  "name": "...",
  "description": "...",
  "image": "...",
  "services": [ { "name": "...", "endpoint": "...", "version": "..." }, ... ],
  "x402Support": false,
  "active": true,
  "registrations": [ { "agentId": N, "agentRegistry": "eip155:<chainId>:<contract>" } ],
  "supportedTrust": [ "reputation" | "crypto-economic" | "tee-attestation" ]
}
```

Spec citation: ERC-8004 §Identity Registry / Agent URI and Agent Registration File.

---

## 2. Current State in ibn-core (Evidence)

### 2.1 What the service exposes externally today

| Surface | Where | URL path | Note |
|---|---|---|---|
| TMF921 v5 Intent Management API | [`src/index.ts:78`](../../src/index.ts) (`app.use('/tmf-api/intentManagement/v5', tmf921Router)`) | `/tmf-api/intentManagement/v5/*` | Primary external API. **This is what ERC-8004 readers should be pointed at.** |
| Informal intent endpoint | [`src/index.ts:177–254`](../../src/index.ts) | `POST /api/v1/intent`, `POST /api/v1/intent/probe`, `GET /api/v1/intent/:id`, `GET /api/v1/intent` | Pre-TMF921 surface kept for backwards compatibility; not the standards surface |
| Health / readiness / metrics | [`src/index.ts:83–123`](../../src/index.ts) | `/health`, `/ready`, `/metrics` | Operational, not discovery-worthy |
| Admin | [`src/index.ts:127`](../../src/index.ts) | `/api/v1/admin/generate-api-key` | Must not be advertised |

### 2.2 What ibn-core does *not* expose (corrections to the original ERC-8004 mapping sketch)

| Surface | Reality | Implication for `services[]` |
|---|---|---|
| MCP server endpoint | None. [`src/index.ts:64–68`](../../src/index.ts) shows ibn-core is an **MCP client** consuming three upstream MCP servers (BSS, KG, CustomerData). | Do NOT advertise an `MCP` service entry. |
| Protocol-level A2A agent-card | None. [`src/a2a/index.ts`](../../src/a2a/index.ts) is an internal multi-agent library (`BaseAgent`, `IntentAnalystAgent`); no `/.well-known/agent-card.json` is served. | Do NOT advertise an `A2A` service entry. |
| ENS / DID | None registered. | Skip. |
| Public web | The repo serves no static landing page; `/` returns 404. | Either skip `web` or advertise the GitHub repo URL. |

### 2.3 What `McpAdapter.getCapabilities()` actually returns

The `McpAdapter` seam at [`src/mcp/McpAdapter.ts:67–74`](../../src/mcp/McpAdapter.ts) returns
**CAMARA-style network service capabilities** (`broadband.residential`, `qod.v0`, etc.) — these
describe what the operator-bound adapter can provision in the network, not how to *communicate*
with the agent. The earlier sketch that suggested `buildRegistrationFile()` would consume
`getCapabilities()` directly was wrong. The ERC-8004 `services[]` field is a
*communication-endpoints* list, distinct from `McpAdapter` capabilities.

These two surfaces map differently to RFC 9315 §4 P5 (Capability Exposure):

| Layer | Standard | ibn-core surface |
|---|---|---|
| Communication endpoints | ERC-8004 `services[]` | This plan |
| Network service capabilities | RFC 9315 §4 P5 + (future) OASF `skills[]` | `McpAdapter.getCapabilities()` — already in code; *could* be reflected as an OASF entry in `services[]` in a future revision, not in this plan |

---

## 3. Gap Analysis

| # | Gap | Resolved in |
|---|-----|-------------|
| G1 | No publicly fetchable agent registration file at any URL | Phase 1 |
| G2 | No ERC-8004-compliant types in the TypeScript codebase | Phase 1 |
| G3 | No way for an ERC-8004 reader to discover ibn-core's TMF921 endpoint | Phase 1 |
| G4 | No on-chain identity for ibn-core; no `agentId`, no NFT | Phase 2 |
| G5 | No documented round-trip (`agentId` → contract → URI → JSON → endpoints) verifying discovery works | Phase 2 |
| G6 | No traceability doc connecting RFC 9315 §4 P5 to ERC-8004 | Phase 1 (`docs/standards/ERC-8004-mapping.md`) |
| G7 | `NOTICE` does not attribute ERC-8004 or the ChaosChain reference implementation | Phase 1 |

---

## 4. Phase 1 — Off-Chain Registration File (v2.1.0)

### 4.1 Deliverables

| Path | Kind | Purpose |
|---|---|---|
| `src/discovery/types.ts` | New | TypeScript types matching ERC-8004 v1 registration file shape; isolated so spec revisions are a localised change |
| `src/discovery/AgentRegistration.ts` | New | `buildRegistrationFile()` composes the JSON from `config/agent-public.yaml`. **Does not** consume `McpAdapter.getCapabilities()` (see §2.3). |
| `config/agent-public.yaml` | New | Curated public-endpoints config — explicit list, never derived from runtime service discovery |
| `src/index.ts` | Modified | Mount `GET /.well-known/agent-registration.json` route, public, no auth |
| `src/discovery/AgentRegistration.test.ts` | New | Unit tests + JSON-schema validation against the ERC-8004 v1 shape |
| `src/discovery/agent-registration.integration.test.ts` | New | Supertest hitting the route end-to-end |
| `docs/standards/ERC-8004-mapping.md` | New | Traceability table: RFC 9315 §4 P5 ↔ ERC-8004 registration fields |
| `NOTICE` | Modified | Add ERC-8004 (CC0) + ChaosChain reference impl (Apache 2.0) attribution per CLAUDE.md governance rule |

### 4.2 The `services[]` array — exact contents

Honest, non-aspirational. Reflects §2.2:

```jsonc
"services": [
  {
    "name": "TMF921",
    "endpoint": "https://ibn-core.vpnet.cloud/tmf-api/intentManagement/v5",
    "version": "5.0.0"
  },
  {
    "name": "web",
    "endpoint": "https://github.com/vpnetconsult/ibn-core"
  }
]
```

If/when ibn-core grows a real MCP server endpoint or protocol-level A2A
agent-card, those entries get added in a follow-up. Until then, advertising
them would be a lie.

### 4.3 The full registration file shape (Phase 1)

```jsonc
{
  "type": "https://eips.ethereum.org/EIPS/eip-8004#registration-v1",
  "name": "ibn-core",
  "description": "RFC 9315 Intent-Based Networking framework with TMF921 v5 conformance. Open-core under Apache 2.0.",
  "image": "<deferred — TODO before Phase 1 ships>",
  "services": [ /* see §4.2 */ ],
  "x402Support": false,
  "active": true,
  "registrations": [],
  "supportedTrust": ["reputation"]
}
```

`registrations[]` is empty in Phase 1. Phase 2 populates it after the mint.

### 4.4 Route placement and security

| Concern | Decision |
|---|---|
| Path | `GET /.well-known/agent-registration.json` (literal — matches ERC-8004 §Endpoint Domain Verification) |
| Auth | None — must be publicly reachable per spec |
| Mount point | `src/index.ts` **after** `app.use(metricsMiddleware)` (line 50) so metrics are recorded, but **outside** the `/api/` rate limiter so a denial-of-service on the limiter does not block discovery |
| Caching | `Cache-Control: public, max-age=300` (5 min). File contents are static between deploys. |
| Content type | `application/json; charset=utf-8` |
| Telemetry import order | The new module sits *below* `src/telemetry.ts`'s mandatory first-import rule (`src/index.ts:4`). Verified in §6.2. |

### 4.5 Why a separate module, not inline in `index.ts`

`src/index.ts` is already 311 lines and mixes app bootstrap, three intent
endpoints, admin, health, metrics, and error handling. The TMF921 router lives
in `src/tmf921/` for the same reason. `src/discovery/` follows the established
pattern.

### 4.6 Acceptance criteria — Phase 1

| # | Criterion | How verified |
|---|-----------|--------------|
| AC1.1 | `curl https://ibn-core.vpnet.cloud/.well-known/agent-registration.json` returns HTTP 200 with `Content-Type: application/json` | Manual after deploy |
| AC1.2 | Response body validates against the ERC-8004 v1 JSON shape (all required fields present, types correct) | `AgentRegistration.test.ts` schema validation |
| AC1.3 | `services[]` contains exactly the TMF921 v5 endpoint and the web entry from §4.2 | Unit + integration test |
| AC1.4 | `supportedTrust` is exactly `["reputation"]` | Unit test |
| AC1.5 | `registrations[]` is exactly `[]` (Phase 2 populates) | Unit test |
| AC1.6 | Route serves under 50ms p95 from a warm Node process | Local benchmark; not a CI gate |
| AC1.7 | `docs/standards/ERC-8004-mapping.md` lists every RFC 9315 §4 P5 mapping to an ERC-8004 field, with no broken cross-links | Manual review |
| AC1.8 | `NOTICE` includes ERC-8004 and ChaosChain reference impl entries | Manual review |
| AC1.9 | All new `.ts` files carry the file-level copyright header per CLAUDE.md §File-Level Copyright Header | Manual review |

---

## 5. Phase 2 — Base Sepolia Mint (v2.2.0)

### 5.1 Deliverables

| Path | Kind | Purpose |
|---|---|---|
| `config/erc-8004.yaml` | New | Per-chain contract config — pinned ChaosChain Identity Registry address on Base Sepolia |
| `scripts/register-agent.ts` | New | One-shot CLI: reads owner key from env, calls `register(agentURI)`, prints `agentId` + tx hash + Basescan link |
| `scripts/verify-registration.ts` | New | Round-trip verifier — resolves `agentId` → on-chain `tokenURI` → fetched JSON → asserts shape matches live route |
| `src/discovery/AgentRegistration.ts` | Modified | Populate `registrations[]` from `config/erc-8004.yaml` once `agentId` is recorded in `config/agent-public.yaml` |
| `SECURITY.md` | Modified | Document `AGENT_OWNER_PRIVATE_KEY` as testnet-only, never committed, rotated on leak |
| `docs/compliance/ERC-8004-base-sepolia-registration.md` | New | Evidence doc per CLAUDE.md §Evidence-as-versioned-artefacts: tx hash, agentId, Basescan link, date, verifier output |

### 5.2 Pinning the registry contract

The ChaosChain reference implementation README lists the deployed Identity
Registry address on Base Sepolia. Phase 2 kickoff begins with reading that
README and pinning the address in `config/erc-8004.yaml`. We do **not**
deploy our own contract — that would not be interoperable with the broader
ERC-8004 reader ecosystem.

```yaml
# config/erc-8004.yaml (Phase 2)
chains:
  base-sepolia:
    chainId: 84532
    identityRegistry: "0x..."     # pinned from ChaosChain README at kickoff
    caip10Prefix: "eip155:84532"
    explorerBase: "https://sepolia.basescan.org"
```

### 5.3 Key handling

| Concern | Decision |
|---|---|
| Owner key storage | `.env` (gitignored). Documented in `SECURITY.md`. |
| Network | Base Sepolia testnet only. No mainnet path in Phase 2. |
| If key leaks | Rotate, re-mint a new `agentId` on a new owner address, update `config/agent-public.yaml`, document in evidence doc. |
| `setAgentWallet` flow (EIP-712 / ERC-1271) | **Deferred.** Owner address remains the implicit agent wallet until a payment workstream gives a reason to bind a separate wallet. |

### 5.4 Acceptance criteria — Phase 2

| # | Criterion | How verified |
|---|-----------|--------------|
| AC2.1 | `scripts/register-agent.ts` mints an `agentId` on Base Sepolia and prints the tx hash | Run once, record output in `docs/compliance/ERC-8004-base-sepolia-registration.md` |
| AC2.2 | The transaction is visible on `sepolia.basescan.org` and shows the `agentURI` set to `https://ibn-core.vpnet.cloud/.well-known/agent-registration.json` | Manual via Basescan link |
| AC2.3 | `scripts/verify-registration.ts` resolves `agentId` → on-chain `tokenURI` → fetched JSON → asserts the live route serves an identical document | Run as a manual smoke; output captured in evidence doc |
| AC2.4 | `config/agent-public.yaml` records the minted `agentId`; the next deploy includes it in the route's `registrations[]` | Integration test asserting the field |
| AC2.5 | An off-the-shelf ERC-8004 reader (ChaosChain's tooling if shipped, otherwise the verifier script) treats the registration as valid | Manual |

---

## 6. Decisions Record

Locked in during the planning conversation on 2026-06-03. Recorded here per
CLAUDE.md §Agent-Native Development principle 3 — *Decision docs over tribal
knowledge*.

| # | Decision | Rationale |
|---|----------|-----------|
| D1 | **Chain: Base Sepolia (84532)** | Cheap, fast, EVM-equivalent, ChaosChain reference contracts already deployed |
| D2 | **Identity Registry: ChaosChain reference implementation** (not a Vpnet-deployed contract) | Interoperability with the broader ERC-8004 reader ecosystem |
| D3 | **`supportedTrust: ["reputation"]` only** | TMF921 IntentReport `reportState` is a natural feedback source. `crypto-economic` and `tee-attestation` would be lies — no stake infra, no TEE infra |
| D4 | **Discovery work lives in the public ibn-core repo, not the private operator-adapters repo** | Discovery is framework-level, involves no operator credentials |
| D5 | **`services[]` is config-driven, not derived from `McpAdapter.getCapabilities()`** | Different concerns (communication endpoints vs network service capabilities) — see §2.3 |
| D6 | **No `setAgentWallet` / EIP-712 flow in Phase 2** | No payment story exists yet; binding a wallet has no purpose |
| D7 | **Mainnet / L2 production deployment deferred to v3.0.0+** | Likely Paper 2 timing; no current production driver |
| D8 | **Reputation Registry integration out of scope** | Would require a feedback ingest path; separate workstream |
| D9 | **Validation Registry integration out of scope** | Requires TEE / zkML / staking infra ibn-core does not have |

### 6.2 Open items to resolve **before** Phase 1 implementation PR

| # | Item | Owner | Status |
|---|------|-------|--------|
| O1 | ERC-721 thumbnail image URL for the `image` field | Roland | Deferred — Roland uploads later; Phase 1 can ship with a placeholder pointing at the repo's GitHub avatar |
| O2 | Confirm `https://ibn-core.vpnet.cloud` is the production hostname and TLS terminates correctly | Roland | Confirmed in planning conversation 2026-06-03 |

---

## 7. Risks

| # | Risk | Mitigation |
|---|------|------------|
| R1 | ERC-8004 spec still nominally **Draft**; shape could change | Types isolated in `src/discovery/types.ts`. A spec revision is a localised edit. The `type` field is a versioned URL (`#registration-v1`) so divergence is detectable. |
| R2 | Owner key leak on the testnet | Key is testnet-only; impact is loss of one `agentId` and minor Base Sepolia ETH. Rotate per §5.3. |
| R3 | ChaosChain reference contract gets deprecated / re-deployed | `config/erc-8004.yaml` pins the address; a redeploy is a config change and a re-mint, not a code change |
| R4 | Registration file inadvertently leaks internal hostnames / topology | `services[]` is built from `config/agent-public.yaml`, not from runtime service discovery. Config is reviewed at PR time. |
| R5 | A future MCP server / A2A endpoint gets added to ibn-core but the registration file is not updated | `services[]` config sits next to the route definitions; convention is to update both in the same PR. Belt-and-braces: an integration test asserts the served `services[]` matches the YAML. |

---

## 8. Out of Scope (Explicit)

These are deliberately not in either phase. Listed so a reader does not assume
they are bugs:

1. **Reputation Registry** — no `giveFeedback`, no `getSummary`, no on-chain feedback aggregation
2. **Validation Registry** — no `validationRequest`, no validator integration
3. **`setAgentWallet`** and the EIP-712 / ERC-1271 signature flow
4. **Multi-chain `registrations[]`** — Phase 2 mints on Base Sepolia only
5. **Mainnet or L2 mainnet deployment** — deferred to v3.0.0+
6. **x402 payment proof in feedback files** — no payment story yet
7. **OASF skills/domains advertising** in `services[]` — requires deciding the public OASF schema first; orthogonal to discovery
8. **A2A agent-card endpoint** — requires actually exposing a protocol-level A2A surface; separate work
9. **MCP server endpoint** — ibn-core is an MCP client; exposing a server is a separate architectural decision

---

## 9. Commit and PR Conventions for This Workstream

Per CLAUDE.md §Paper Citation Reference.

### Phase 1 implementation commit

```
feat(discovery): publish ERC-8004 v1 registration file

Implements: RFC 9315 §4 Principle 5 (Capability Exposure)
TMF921: advertises /tmf-api/intentManagement/v5 as TMF921 v5.0.0 service
Paper: supports cross-organisational discovery claim for Paper 2
```

### Phase 2 implementation commit

```
feat(discovery): mint ERC-8004 agentId on Base Sepolia

Implements: RFC 9315 §4 Principle 5 (on-chain capability advertisement)
TMF921: TMF921 v5 endpoint now discoverable from on-chain agentId
Paper: supports Paper 2 §X cross-organisational discovery empirical claim
```

---

## 10. References

### Specifications

- ERC-8004 — Trustless Agents: <https://eips.ethereum.org/EIPS/eip-8004>
- ERC-721 (the identity NFT): <https://eips.ethereum.org/EIPS/eip-721>
- ERC-1271 (smart-contract signature validation, deferred to post-Phase-2): <https://eips.ethereum.org/EIPS/eip-1271>
- EIP-712 (typed-data signing, deferred to post-Phase-2): <https://eips.ethereum.org/EIPS/eip-712>
- RFC 9315 — IBN: <https://www.rfc-editor.org/rfc/rfc9315>
- TMF921 v5 Intent Management API: <https://github.com/tmforum-apis/TMF921-Intent_Management>

### Reference implementations

- ChaosChain reference contracts: <https://github.com/ChaosChain/trustless-agents-erc-ri>
- Curated 8004 contracts: <https://github.com/erc-8004/erc-8004-contracts>

### Internal cross-references

- `CLAUDE.md` — file-level copyright header, NOTICE governance, Paper Citation Reference, Agent-Native Development principles
- [`src/mcp/McpAdapter.ts`](../../src/mcp/McpAdapter.ts) — the open-core seam; this plan consumes nothing from it, by design
- [`docs/roadmap/canvas-uc/UC007-external-authentication.md`](canvas-uc/UC007-external-authentication.md) — plan-doc format reference

---

## 11. Security Architecture Viewpoint (ARB C1 — added 2026-06-03)

This section closes condition **C1** of the [ARB review](../compliance/arb-reviews/erc-8004-discovery-2026-06-03/) (Approved with Conditions, reconciled 2026-06-03 against the live MITRE ATT&CK MCP). The full threat overlay, coverage matrix, risk register, and Navigator JSON are in [`docs/compliance/arb-reviews/erc-8004-discovery-2026-06-03/`](../compliance/arb-reviews/erc-8004-discovery-2026-06-03/) — this section is the cross-reference required by the plan, not a re-statement.

### 11.1 Threat overlay (summary)

- **In-scope ATT&CK tactics (8):** TA0043 Reconnaissance, TA0042 Resource Development (advisory), TA0001 Initial Access, TA0002 Execution, TA0003 Persistence, TA0006 Credential Access (Phase 2), TA0011 C2 (Phase 2 RPC), TA0040 Impact.
- **17 prioritised techniques** weighted across four threat profiles (telecom-infrastructure, DeFi/crypto-key, generic enterprise, academic/supply-chain).
- **Highest-impact technique: T1565.001 Stored Data Manipulation** (Phase 2) — leaked owner key calls `setAgentURI(maliciousURL)`, redirecting all on-chain discovery.

### 11.2 Designed-in mitigations (M-series, canonical per live ATT&CK)

| Concern | Technique | Mitigation(s) | Where it lives |
|---|---|---|---|
| Public route DoS (Phase 1) | **T1499** Endpoint DoS | **M1037** Filter Network Traffic | `wellKnownLimiter` in `src/index.ts` (C2) |
| Route-level intrusion (Phase 1) | **T1190** Exploit Public-Facing Application | **M1051** Update Software (Dependabot), **M1050** Exploit Protection (Helmet), **M1016** Vulnerability Scanning (CodeQL) | Existing CI + `src/index.ts:33` |
| Owner key file (Phase 2) | **T1552.001** Credentials in Files | **M1022** Restrict File and Directory Permissions, **M1027** Password Policies, **M1047** Audit | K8s Secret + RBAC (C3) |
| Cloud-account theft (Phase 2) | **T1078.004** Valid Accounts: Cloud Accounts | **M1018** User Account Management, **M1026** Privileged Account Management, **M1036** Account Use Policies | Deploy ServiceAccount scoping (C3) |
| On-chain tokenURI redirect (Phase 2) | **T1565.001** Stored Data Manipulation | **M1022**, **M1041** Encrypt Sensitive Information | On-chain monitor + CI pin (C4) |

### 11.3 Emitted detection data components (DS-series)

| Detection target | Data Source / Component | How it is emitted |
|---|---|---|
| Route anomalies, 4xx/5xx spikes (T1190) | **DS0015** Application Log Content | `logger.error(...)` on the well-known route → `src/telemetry.ts` → OTLP (C5) |
| Rate-limit rejections (T1499) | **DS0029** Network Traffic Flow / Content | `wellKnownLimiter` 429 responses + Prometheus `/metrics` |
| Owner-key file access (Phase 2, T1552.001) | **DS0022** File Access | K8s audit log on the Secret |
| Cloud-account auth (Phase 2, T1078.004) | **DS0002** User Account Authentication + **DS0028** Logon Session | K8s API server audit log |
| On-chain `tokenURI` change (Phase 2, T1565.001) | **DS0022** File modification (key-side) + on-chain event polling (DS0029-style network observation) | `scripts/verify-registration.ts` (C4) |

### 11.4 ARB conditions traced into this PR

- **C1** — closed by this §11.
- **C2** — closed by the dedicated `wellKnownLimiter` in `src/index.ts` + `src/discovery/agent-registration.integration.test.ts:"C2 — dedicated rate limiter rejects after configured max"`.
- **C5** — closed by the structured `logger.error(...)` on 5xx + `src/discovery/agent-registration.integration.test.ts:"C5 — structured error log emitted on 5xx"`.
- **C3**, **C4** — Phase 2 work; tracked open in [`action-register.md`](../compliance/arb-reviews/erc-8004-discovery-2026-06-03/action-register.md).

### 11.5 Risk register reference

See ARB review §6 + §11.3 (post-reconciliation). Two risks sit at residual 6 (T1190 detection on the new route; Phase 2 owner-key custody composite); both close via the conditions above. No risk above 6; no Executive Risk Committee escalation.

---

## 12. Phase 1 implementation log (added during impl PR)

| Date | Commit | Change |
|---|---|---|
| 2026-06-03 | this PR | Phase 1 implementation: `src/discovery/`, `src/config/agent-public.yaml`, route wiring with C2 limiter + C5 logging, unit + integration tests, `ERC-8004-mapping.md`, NOTICE + CLAUDE.md amendments. Closes C1 (via §11 above), C2, C5. |

---

*Plan doc — Vpnet Cloud Solutions Sdn. Bhd., 2026-06-03. §11 added 2026-06-03 as ARB C1 closure; §12 added during Phase 1 implementation PR.*
