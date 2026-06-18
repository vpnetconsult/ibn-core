# ERC-8004 v1 ↔ RFC 9315 §4 Principle 5 mapping

> AC1.7 closure for [`docs/roadmap/erc-8004-discovery.md`](../roadmap/erc-8004-discovery.md). Cross-referenced by [`CLAUDE.md`](../../CLAUDE.md) §Standards Implementation Map and the [ARB review](../compliance/arb-reviews/erc-8004-discovery-2026-06-03/).

This map records how the ERC-8004 v1 off-chain registration file fields realise **RFC 9315 §4 Principle 5 — Capability Exposure** for ibn-core. ERC-8004 v1 is the agent-communication-endpoint surface; `McpAdapter.getCapabilities()` is the network-service-capability surface. The two are distinct — see plan §2.3.

## 1. Spec identifiers

| Layer | URL / id | Licence |
|---|---|---|
| ERC-8004 v1 (Trustless Agents — registration file v1) | <https://eips.ethereum.org/EIPS/eip-8004> · type URL `https://eips.ethereum.org/EIPS/eip-8004#registration-v1` | CC0 (per ERC text) |
| RFC 9315 (IRTF NMRG, Oct 2022) | <https://www.rfc-editor.org/rfc/rfc9315> · DOI `10.17487/RFC9315` | IETF Trust / BCP 78 |
| TMF921 Intent Management API v5.0.0 | <https://github.com/tmforum-apis/TMF921-Intent_Management> | Apache 2.0 |

## 2. Field-by-field mapping

| ERC-8004 v1 field | RFC 9315 §4 P5 mapping | ibn-core source | Notes |
|---|---|---|---|
| `type` | (versioning) | hard-coded `ERC8004_REGISTRATION_TYPE_URL` in `src/discovery/types.ts` | Allows readers to detect spec divergence (plan §R1). |
| `name` | P5 — agent identity | `src/config/agent-public.yaml` `name` | Stable across versions. |
| `description` | P5 — agent identity | `src/config/agent-public.yaml` `description` | Open-core posture declared here. |
| `image` | (UI affordance, not RFC 9315) | `src/config/agent-public.yaml` `image` | GitHub avatar placeholder per plan §6.2 O1. |
| `services[]` | **P5 — capability surface** | `src/config/agent-public.yaml` `services` | Curated allow-list. Never derived from runtime discovery (plan §D5). |
| `services[].name = "TMF921"` | P5 — TMF921 v5 endpoint | `src/index.ts:78` mount of `createTMF921Router` | The advertised endpoint must answer in production — "honest gaps" (plan §2.2). |
| `services[].endpoint` | P5 — endpoint URL | YAML | Reviewed at PR time per plan §R4. |
| `services[].version` | P5 — protocol version | YAML | `5.0.0` for TMF921. |
| `x402Support` | (not RFC 9315 — payment surface) | YAML `x402Support: false` | No payment story (plan §D6/D7). |
| `active` | RFC 9315 §6 Lifecycle — operational state | YAML `active` | Flip to `false` during planned outage. |
| `registrations[]` | (chain-binding, Phase 2 only) | empty in Phase 1; Phase 2 populates from `config/erc-8004.yaml` | `[]` literal in Phase 1 (AC1.5). |
| `supportedTrust[]` | P5 — feedback model | YAML `supportedTrust: [reputation]` | TMF921 `IntentReport.reportState` is the reputation feedback source (plan §D3). `crypto-economic` and `tee-attestation` would be lies. |

## 3. RFC 9315 Principle 5 coverage check

| RFC 9315 §4 P5 obligation | ibn-core realisation |
|---|---|
| The agent exposes the set of capabilities it supports | `services[]` + `supportedTrust[]` in the served JSON |
| Capabilities are addressable by a stable identifier | The TMF921 endpoint URL (stable across deploys) |
| Capability advertisement is independent of internal implementation | YAML config-driven (D5), not introspected from runtime |
| Capability surface is versioned | ERC-8004 v1 carries `type` URL with `#registration-v1` fragment |

## 4. Honest gaps (deliberately not advertised)

Per plan §2.2 / §8, ibn-core does **not** advertise:

- MCP server endpoint — ibn-core is an MCP client, not a server (open-core seam in `src/mcp/McpAdapter.ts`).
- A2A agent-card endpoint — no protocol-level A2A surface yet.
- OASF skills/domains — public OASF schema decision pending.
- `crypto-economic` or `tee-attestation` trust — no stake/TEE infrastructure.

These are tracked in the plan §8 "Out of Scope" list. They get added to `services[]` / `supportedTrust[]` only when the corresponding surface actually exists.

## 5. Cross-references

- [`docs/roadmap/erc-8004-discovery.md`](../roadmap/erc-8004-discovery.md) — plan + §11 Security Architecture Viewpoint + §12 implementation log
- [`docs/compliance/arb-reviews/erc-8004-discovery-2026-06-03/`](../compliance/arb-reviews/erc-8004-discovery-2026-06-03/) — ARB review (Final, reconciled 2026-06-03)
- [`src/discovery/types.ts`](../../src/discovery/types.ts) — TypeScript types for the registration file
- [`src/discovery/AgentRegistration.ts`](../../src/discovery/AgentRegistration.ts) — builder
- [`src/config/agent-public.yaml`](../../src/config/agent-public.yaml) — curated config
- [`CLAUDE.md`](../../CLAUDE.md) §Standards Implementation Map — top-level map

---

*Standards traceability — Vpnet Cloud Solutions Sdn. Bhd., 2026-06-03.*
