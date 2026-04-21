<!--
Copyright 2026 Vpnet Cloud Solutions Sdn. Bhd.
Licensed under the Apache License, Version 2.0
See LICENSE in the project root for license information.
-->

# External Review — draft-ahn-nmrg-5g-security-i2nsf-framework-01

> **Status:** draft (published to repo, open for internal comment)
> **Reviewer:** Vpnet Cloud Solutions / ibn-core maintainers
> **Date written:** 2026-04-21
> **ibn-core HEAD at review time:** `d0e5124` (branch `claude/happy-hofstadter-b49483`, most recent tag `v2.0.1`)

---

## 1. Source metadata

| Field | Value |
|------|------|
| Title | An Integrated Security Service System for 5G Networks using an I2NSF Framework |
| Authors / organisation | Yoseop Ahn, Jaehoon Paul Jeong (Sungkyunkwan University); Younghan Kim (Soongsil University) |
| Version / revision | `-01` |
| Publication date | 2026-02-25 |
| Retrieval date | 2026-04-21 |
| Canonical URL | https://datatracker.ietf.org/doc/draft-ahn-nmrg-5g-security-i2nsf-framework/ |
| Status | Active individual Internet-Draft submitted to IRTF NMRG. **Not** IETF-endorsed, not WG-adopted. Expires 2026-08-29. |
| Licence / citation terms | IETF Trust / BCP 78 — citation freely permitted; text reuse subject to Simplified BSD-style grant in IETF Trust LTPA. |

## 2. Abstract summary

The draft proposes a framework for automated 5G edge security that combines
Intent-Based Networking (per RFC 9315) with the I2NSF architecture
(per RFC 8329). High-level security intents are submitted by an administrator
through an *Intent-Based Use Function* (IUF) and translated by an
*Intent Control Function* (ICF) into two policy tracks: network-side policies
are delivered via the 5G *Network Exposure Function* (NEF) to core functions
(AMF, SMF, and others), while application-side policies are delivered to
user-equipment through distributed IBN Controllers. A *Security Control
Function* (SCF) synthesises low-level policies from the translated intents,
a *Developer's Management Function* (DMF) registers Network Security
Function (NSF) capabilities, and a *Security Data Analytics Function* (SDAF)
closes the loop by collecting monitoring data and validating enforcement.
The draft references RFC 9315, RFC 8329, RFC 6020/7950 (YANG), RFC 6241
(NETCONF) and RFC 8040 (RESTCONF); it describes deep-learning as a potential
enhancement for the translation and anomaly-detection stages. No reference
implementation, conformance kit, or code repository is provided.

## 3. Component mapping — Ahn et al. ↔ ibn-core

| Ahn et al. (draft §3) | ibn-core equivalent | Evidence | Gap vs. source |
|---|---|---|---|
| **IUF** — admin web UI for high-level security intents | `POST /api/v1/intent` HTTP route + Claude natural-language translator (no GUI) | [src/api](../../../src/api), [src/handlers](../../../src/handlers) | No graphical admin UI. API-only. Gap is cosmetic; not load-bearing. |
| **ICF** — intent-to-policy translator | Claude-based intent processor, mapped to RFC 9315 §5.1.2 in [CLAUDE.md:157](../../../CLAUDE.md) | [CLAUDE.md:157](../../../CLAUDE.md) | **ibn-core is stronger here.** LLM-based translation is a concrete realisation of what the draft hints at as "deep learning could be employed". |
| **SCF** — low-level security policy synthesis | `McpAdapter.orchestrate()` seam at [src/mcp/McpAdapter.ts:54](../../../src/mcp/McpAdapter.ts) | [CLAUDE.md:158](../../../CLAUDE.md), [src/mcp/McpAdapter.ts:54](../../../src/mcp/McpAdapter.ts) | Structurally identical seam; scope mismatch. ibn-core's `orchestrate()` produces **service** fulfilment actions (CAMARA-facing), not ACL/firewall policies. A security-intent pathway would re-use the seam with a different downstream. |
| **DMF** — dynamic NSF capability registration | `McpAdapter.getCapabilities()` at [src/mcp/McpAdapter.ts:69](../../../src/mcp/McpAdapter.ts) | [CLAUDE.md:145](../../../CLAUDE.md) | **Real gap.** Ours returns a static list per adapter instance; the draft implies a registration API where NSF developers publish capabilities at runtime. |
| **SDAF** — monitoring + closed-loop validation | `IntentReport.reportState` projection + Prometheus metrics pipeline | [CLAUDE.md:159–160](../../../CLAUDE.md), [src/metrics.ts](../../../src/metrics.ts) | Partial. We monitor and report; we do not yet feed signals **back** to the translator for adaptive behaviour. Closed-loop learning is on the Paper 2 idea list. |
| **NSF** — enforcement point | Operator adapter (private repo: `CamaraUMobileMcpAdapter`, `CamaraTMMcpAdapter`) | [CLAUDE.md:135](../../../CLAUDE.md) ("The Open Core Seam" rules) | Architecturally parallel (pluggable enforcement), semantically distinct (service actions vs. security actions). Not a drop-in. |
| **NEF** — 5G-Core north-bound gateway | Not present; out of scope | [docs/architecture/AI_AGENT_ALIGNMENT_PLAN.md:241](../../../docs/architecture/AI_AGENT_ALIGNMENT_PLAN.md) — explicitly: "ibn-core operates at the management layer, not 3GPP NF layer" | Deliberate deferral. Operator adapters may bridge to NEF in the private repo; the open core will not. |

## 4. Existing alignment — what we already do well

- **RFC 9315 §5 full lifecycle** is implemented across Ingestion, Translation,
  Orchestration, Monitoring, Compliance Assessment and Compliance Actions;
  the draft only references the lifecycle abstractly. See the Standards
  Implementation Map in [CLAUDE.md:150–163](../../../CLAUDE.md).
- **3GPP TS 28.312** (intent-driven management for mobile networks) is
  already cited and reflected in the intent hierarchy at
  [src/imf/IntentHierarchy.ts:36](../../../src/imf/IntentHierarchy.ts) and
  [src/imf/ConflictArbiter.ts:52](../../../src/imf/ConflictArbiter.ts).
  The draft does **not** cite TS 28.312; this is a defensible advantage.
- **TM Forum IG1253 / O-RAN WG2 A1** integration is scoped and documented
  in CHANGELOG.md and the alignment plan; the draft engages neither forum.
- **TMF921 v5.0.0 conformance is demonstrable at 83/83** via the published
  CTK results; the draft has no conformance evidence of any kind.
- **Open-core licensing model with a private-adapter boundary** is explicit
  and documented in [CLAUDE.md](../../../CLAUDE.md); the draft is silent on
  how an implementation would be distributed or licensed.

## 5. Genuine gaps the draft exposes

Priority rubric: **P0** = needed before v3.0.0 CAMARA work; **P1** = v2.3.0
candidate; **P2** = Paper 2 material; **P3** = future / optional.

1. **No `SecurityIntent` in the intent-type enum.** The current enumeration
   at [src/tmf921/types.ts:62](../../../src/tmf921/types.ts) is
   `ServiceIntent | DeliveryIntent | AssuranceIntent | CustomerIntent`. A
   security-intent pathway is not even a placeholder. **Priority P2** —
   additive, backwards-compatible, signals intent for Paper 2.
2. **No RFC 8329 (I2NSF) citation anywhere.** A grep across the repo for
   `I2NSF` and `RFC 8329` returns nothing. The Standards Implementation Map
   ends at RFC 9315 + TMF921. **Priority P1** — citation-level only; no
   implementation commitment.
3. **No dynamic NSF / capability registration.** `getCapabilities()` is
   static per adapter instance; there is no API for a third-party NSF
   developer to register new capabilities at runtime. The DMF pattern from
   the draft is a reasonable design input if we ever need this.
   **Priority P2** — design-first ADR.
4. **No documented YANG / NETCONF / RESTCONF binding path.** The
   `McpAdapter` seam could delegate to a NETCONF or RESTCONF backend via an
   operator adapter, but the pattern is not written down in
   `docs/architecture/`. **Priority P1** — ADR-only; no code change yet.
5. **No 5G-core data-plane observability.** NWDAF is not referenced
   anywhere. An SDAF-style analytics feedback loop (report → translator
   context) is an obvious Paper 2 empirical candidate. **Priority P2**.

## 6. Counter-positions — where the draft is wrong, vague, or premature

- **Deep-learning paragraph is hand-wavy.** The draft says "deep-learning
  techniques can be employed" without specifying model family, training
  data, or a concrete translation contract. ibn-core's existing
  LLM-based translator at the Claude-client layer is a specific, deployed
  counter-example; we should cite ibn-core as a reference implementation
  in any response and offer to contribute an empirical comparison for the
  authors' `-02` revision.
- **Protocol choice is asserted without justification.** The draft
  prescribes NETCONF / RESTCONF / YANG as the protocol stack without
  engaging the alternative of TMF921-over-REST. For a framework that
  claims 5G-edge scope, the TMF Open API family is a serious peer that
  deserves at least a comparison table. ibn-core's choice of TMF921 is
  worth putting on the record.
- **No conformance evidence.** The draft defines an architecture but
  provides no CTK, reference implementation, or public evaluation. ibn-core
  has TMF921 CTK at 83/83, so we are in a strong position to argue that
  any successor draft must include a conformance path.
- **Individual submission, version 01, low maturity.** The draft is not
  WG-adopted. We should engage at the review and publication level; we
  should **not** align the ibn-core roadmap to its terminology or name
  our modules after its acronyms (IUF, ICF, SCF, DMF, SDAF). A draft
  that expires without adoption cannot be allowed to shape the public
  repo's vocabulary.
- **Security model under-specified.** The draft does not address how
  operator-tenant isolation, multi-operator federation, or cross-domain
  trust work — all of which are live concerns on our v4.0.0 roadmap.
  If we respond to the authors, we can offer these as open questions.

## 7. Follow-up backlog derived from this review

| # | Item | Priority | Target file(s) | Notes |
|---|---|---|---|---|
| 1 | Add RFC 8329 to the "Upstream Standards — Citation and Use Rules" section of CLAUDE.md as citation-only (not implemented) | P1 | [CLAUDE.md](../../../CLAUDE.md) | Handled in same PR that lands this review. |
| 2 | Add a `SecurityIntent` member to the `IntentType` enum as a placeholder, with a doc comment linking back to this review | P2 | [src/tmf921/types.ts:62](../../../src/tmf921/types.ts) | One-line addition; no routing logic until a real use case. Needs a separate plan + PR. |
| 3 | Author an ADR documenting the `McpAdapter` → NETCONF / RESTCONF / YANG delegation pattern | P1 | `docs/architecture/adr/` (new) | Doc-only; clarifies the open-core seam and positions ibn-core against the draft's protocol assumptions. |
| 4 | Author a design sketch ADR for dynamic NSF / capability registration (DMF analogue) | P2 | `docs/architecture/adr/` (new) | Impacts the `getCapabilities()` contract; design-first before any code. |
| 5 | Scope a closed-loop learning hook that feeds `IntentReport` outcomes into translator prompt context over time | P2 | Follow-up plan | Empirical candidate for Paper 2; not in this cycle. |
| 6 | Optional: contact the draft authors with a link to this review and an offer of ibn-core as a reference implementation for `-02` | P3 | External comms | Builds external presence; low priority. |

## 8. Limitations of this review

- The source is an **individual Internet-Draft at revision `-01`**. It is
  not WG-adopted, not published as an RFC, and may expire without advancing.
  Do **not** use it to justify roadmap commitments in ibn-core.
- The review covers **architectural alignment only**. It does not evaluate
  performance, security, or conformance of the draft's proposal; the draft
  provides no material to evaluate those against.
- The reviewer is **not a 3GPP SA5 specialist**. 5G-core specifics (NEF,
  AMF, SMF interactions) are cross-checked against public documentation
  only and should be reviewed by a 5G core expert before being cited in
  follow-up work or in a response to the authors.
- **Retrieval date is 2026-04-21.** If the draft advances to `-02` or is
  replaced by a WG draft, re-check before acting on the follow-up backlog.

## 9. Change log for this review

| Date | Change | Author |
|------|--------|--------|
| 2026-04-21 | Initial draft written against ibn-core HEAD `d0e5124`. | ibn-core maintainers |
