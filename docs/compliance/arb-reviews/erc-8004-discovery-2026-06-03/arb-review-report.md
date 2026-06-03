# ARB Review Report — ERC-8004 Discovery for ibn-core (Phase 1 + Phase 2)

**Submission ID:** PR [#46](https://github.com/vpnetconsult/ibn-core/pull/46) — `docs/roadmap/erc-8004-discovery.md`
**Date of review:** 2026-06-03
**Submitting architect:** Roland Pfeifer (Vpnet Cloud Solutions Sdn. Bhd.)
**ARB chair:** *To be named by Vpnet ARB process*
**Decision:** **Approved with Conditions**

> **Status: Provisional.** The MITRE ATT&CK MCP was not connected for this review. The Step 3 threat overlay is derived from model knowledge of ATT&CK v15 and must be reconciled against the live ATT&CK knowledge base before final ARB sign-off. The decision is robust to that reconciliation — none of the conditions below depend on disputed technique IDs.

---

## 1. Executive Summary

The submission proposes to make ibn-core discoverable via the ERC-8004 Identity Registry in two phases: Phase 1 publishes a public registration JSON at `/.well-known/agent-registration.json` (v2.1.0); Phase 2 mints an `agentId` on Base Sepolia using the audited ChaosChain reference contract (v2.2.0). TOGAF compliance is strong on principle alignment, building-block reuse, and standards conformance, with five Compliant criteria, five Partially Compliant, and one Non-Compliant — the Security Architecture Viewpoint, which this review now supplies. The ATT&CK overlay identifies 8 in-scope tactics and 17 prioritised techniques across the union of four threat profiles (telecom-infrastructure, DeFi-key, generic enterprise, academic / supply-chain); the highest-impact gap is on Phase 2 — a leaked owner key enables T1565.002 (Stored Data Manipulation) via `setAgentURI`, redirecting all on-chain discovery to a malicious file. No residual risk scores above 6, so every gap is closable within ARB Chair authority. The plan is approved subject to five technique-anchored conditions covering security viewpoint, DoS protection on the well-known route, owner-key custody, on-chain tampering detection, and route-level anomaly telemetry.

---

## 2. Decision

**Approved with Conditions.**

The Architecture Review Board approves submission **ERC-8004 Discovery for ibn-core** for progression to the Phase 1 implementation gate (`v2.1.0`), subject to the conditions listed below. Phase 2 progression (`v2.2.0`) is conditional on closure of conditions C3 and C4. Compliance with the cited Architecture Principles (RFC 9315 §4 P5; CLAUDE.md *Agent-Native Development* §§2/3/4/5; Open Core boundary) and the Technology Standards Catalog (ERC-8004 v1, ERC-721, TMF921 v5, RFC 9315) is acceptable. The threat overlay identifies 8 in-scope ATT&CK tactics and 17 prioritised techniques; the gaps below must be closed before the named milestones.

### Conditions

| # | Condition | ATT&CK reference | Owner | Due | Acceptance criteria |
|---|-----------|------------------|-------|-----|---------------------|
| **C1** | Add a *Security Architecture Viewpoint* section to `docs/roadmap/erc-8004-discovery.md` citing this ARB output's ATT&CK overlay, named M-series mitigations, and DS-series detections. Closes TOGAF G Non-Compliance. | Cross-cutting (TOGAF G; Risk #7) | Roland | Before Phase 1 impl PR opens | Plan doc contains §11 "Security Architecture Viewpoint" cross-referencing `docs/compliance/arb-reviews/erc-8004-discovery-2026-06-03/`. Reviewable in PR diff. |
| **C2** | Apply a dedicated rate limit (and/or upstream CDN cache) to `GET /.well-known/agent-registration.json` to mitigate **T1499 Endpoint Denial of Service**. The deliberate exclusion from the `/api/` rate limiter (plan §4.4) MUST be paired with another control. | **T1499** mitigated by **M1037 Filter Network Traffic** + **M1031 Network Intrusion Prevention**; detection via **DS0029 Network Traffic** | Roland | Phase 1 impl PR (v2.1.0) | Integration test confirms a separate limiter wraps the well-known route; OR Cloudflare/CDN cache configuration is committed alongside the route; rate-limit decision and threshold documented in plan |
| **C3** | Owner private key (`AGENT_OWNER_PRIVATE_KEY`) stored in a Kubernetes Secret with RBAC restricting `get`/`watch` to the deploy ServiceAccount only. Document key residency, rotation cadence (≤ 90 days for testnet), and incident-response steps in `SECURITY.md`. Mitigates **T1552.001 Credentials in Files**, **T1555 Credentials from Password Stores**, **T1078.004 Cloud Accounts**. | T1552.001, T1555, T1078.004 mitigated by **M1027 Password Policies**, **M1041 Encrypt Sensitive Information**, **M1018 User Account Management**; detection via **DS0022 File** access events | Roland | Phase 2 impl PR (v2.2.0) | K8s manifest committed; RBAC role file lists the SA explicitly; SECURITY.md amended; `kubectl auth can-i` smoke test recorded in evidence doc |
| **C4** | Implement a continuous on-chain monitor that polls the minted `agentId`'s `tokenURI` and alerts on any change not authored by a controlled deploy. Pin the expected `agentURI` in a CI smoke test (`scripts/verify-registration.ts`). Mitigates **T1565.002 Stored Data Manipulation** — the highest-impact technique for this submission. | **T1565.002** mitigated by **M1041 Encrypt Sensitive Information** + **M1022 Restrict File and Directory Permissions** (key-side) + detective control; detection via **DS0029 Network Traffic** (on-chain event poll) and **DS0022 File modification** | Roland | Phase 2 impl PR (v2.2.0); monitor live before mainnet path is contemplated | Monitor script committed; sample alert recorded in evidence doc; CI smoke test passes against the live Base Sepolia state |
| **C5** | Add route-level structured error/anomaly logging on `GET /.well-known/agent-registration.json` plumbed through `src/telemetry.ts`, emitting **DS0015 Application Log** events for 4xx/5xx with rate-spike detection. Mitigates **T1190 Exploit Public-Facing Application** detection gap. | **T1190** mitigated by **M1016 Vulnerability Scanning** + **M1051 Update Software** + **M1050 Exploit Protection**; detection via **DS0015 Application Log** + **DS0029 Network Traffic** | Roland | Phase 1 impl PR (v2.1.0) | Telemetry test asserts a route-level span / log emission on 4xx/5xx; documented in plan §4.4 |

Conditions will be tracked in `docs/compliance/arb-reviews/erc-8004-discovery-2026-06-03/action-register.md` and reviewed at the next monthly ARB.

**Effective date:** 2026-06-03. **Conditions due by:** C1 prior to Phase 1 impl PR; C2 + C5 by Phase 1 GA (v2.1.0); C3 + C4 by Phase 2 GA (v2.2.0). **Re-review:** Next monthly ARB after Phase 1 GA.

---

## 3. Submission Profile

| Field | Value |
|---|---|
| Submission type | Solution Architecture Description (single workstream, two phases) |
| ADM phase(s) in scope | **B** Business — capability-level discovery; **C** Information Systems — new app module + data shape; **D** Technology — Base Sepolia chain dependency; **G** Implementation Governance — phased gates |
| Business capabilities affected | (new) Cross-organisational agent discovery; (existing) TMF921 v5 Intent Management — newly advertised externally |
| Value streams touched | Customer/partner self-service intent fulfilment; future operator federation (deferred to v3.0.0+) |
| Data classification — registration file | **Public** by design (spec requires public fetchability) |
| Data classification — Phase 2 owner key | **Restricted** (testnet only, but still a secret) |
| Platforms in scope | **Containers** (K8s deploy), **Linux** (runtime), **IaaS** (cluster host), **SaaS** (GitHub, Basescan, Anthropic API), **Network Devices** (egress to Base Sepolia RPC), **PRE** (recon surface) |
| External exposure (new in Phase 1) | `GET /.well-known/agent-registration.json` on `ibn-core.vpnet.cloud` — public, unauthenticated, deliberately outside `/api/` rate limiter (plan §4.4) |
| External exposure (newly advertised) | TMF921 API `/tmf-api/intentManagement/v5` (already public; advertisement adds discoverability) |
| External exposure (new in Phase 2) | Outbound HTTPS to Base Sepolia JSON-RPC; one-shot mint tx via owner EOA |
| Identity stack | Existing JWT / API key (in progress per UC007); **new (Phase 2):** Externally Owned Account on Base Sepolia |
| Integration points (new) | Base Sepolia RPC, ChaosChain Identity Registry contract (read + one-shot mint) |
| Threat profile relevance | **All four — union:** Telecom-infrastructure attackers; DeFi/crypto-key targeting groups; Generic enterprise; Academic / supply-chain research targeting |
| Architecture principles cited | RFC 9315 §4 Principle 5 (Capability Exposure); CLAUDE.md *Agent-Native Development* §§2/3/4/5; Open Core boundary; "Honest gaps" principle |
| Building blocks reused | `McpAdapter` seam (untouched), TMF921 router, Express 5 app skeleton, ERC-721, ChaosChain reference Identity Registry contract |
| Building blocks introduced | `src/discovery/*` module, `config/agent-public.yaml`, `config/erc-8004.yaml`, `scripts/register-agent.ts`, `scripts/verify-registration.ts`, `/.well-known/agent-registration.json` route |

---

## 4. TOGAF Compliance Findings

| Criterion | Status | Evidence / Gap | Action required |
|-----------|--------|----------------|-----------------|
| **A. Alignment to Architecture Principles** | Compliant | Plan §6 D1–D9 records nine decisions with rationale; §2.3 corrects a misconception about `McpAdapter.getCapabilities()`; "Honest gaps" principle visibly applied in §2.2 (no false MCP/A2A advertisement) | — |
| **B. Building Blocks** | Compliant | Plan §5.2 reuses ChaosChain ref impl (ABB), introduces well-justified SBBs in §4.1 / §5.1; D2 rules out parallel implementation | — |
| **C. Standards Conformance** | Compliant | ERC-8004 v1, ERC-721, RFC 9315, TMF921 v5 all named and conformed to (§1, §4.3, §10) | — |
| **D. Data Architecture** | Partially Compliant | Registration file shape documented (§4.3); classification of the file as public is implicit, not explicit. Phase 2 owner key (Restricted) discussed (§5.3) but no key residency / RBAC binding stated | Action: state data classification for both artefacts explicitly in plan §4.3 and §5.3; covered by **C3** |
| **E. Application Architecture** | Compliant | New module justified in §4.5; integrates with existing Express 5 pattern (§4.4); mount-point reasoning explicit | — |
| **F. Technology Architecture** | Compliant | Chain decision (Base Sepolia) justified §6 D1; ChaosChain ref impl D2; identity stack stated for Phase 2 | — |
| **G. Security Architecture Viewpoint** | **Non-Compliant** | Plan contains no threat model, no ATT&CK overlay, no detection telemetry mapped, no mitigations cited by framework. The plan does discuss risks in §7 but they are operational, not threat-modelled | Action: this ARB output IS the missing viewpoint; **C1** requires the plan be amended to cite it |
| **H. Operability** | Partially Compliant | Caching, telemetry import order, route placement after metrics middleware discussed (§4.4); no SLO/SLI for the new route, no on-call mention for Phase 2 key rotation, no rollback plan if ERC-8004 spec changes shape | Action: state SLO ("availability ≥ 99% measured over 30 days; not on the critical path"); rollback covered by §7 R1 + type isolation (D5); add to plan §4.4 |
| **I. Cost & Licensing** | Partially Compliant | Apache 2.0 / CC0 covered (§NOTICE governance, §10); Base Sepolia testnet ETH cost not stated; no cost-allocation tagging | Action: state testnet faucet source and rough per-mint cost; not blocking |
| **J. Lifecycle & Transition** | Partially Compliant | Phased delivery (Phase 1 → Phase 2) is sound; no EOL dates for components; rollback partially designed via type isolation (D5, §7 R1) | Action: add explicit "rollback to previous release tag" statement; not blocking |
| **K. Governance** | Compliant | Submitting architect named; accepting stakeholder implied via ARB process; Phase H trigger conditions discussed in §7 (spec drift, contract redeployment) | — |

**Summary:** 5 Compliant, 5 Partially Compliant, 1 Non-Compliant. The single Non-Compliance is on **G. Security Architecture Viewpoint** — addressed by this report and condition C1.

---

## 5. Threat Profile (ATT&CK Overlay) — PROVISIONAL

> **Caveat:** Derived from model knowledge of ATT&CK v15. Reconcile against `attack.mitre.org` enterprise matrix v15+ before final ARB sign-off. Specific technique IDs may have been renamed or split into sub-techniques in subsequent ATT&CK releases.

### 5.1 In-scope tactics

| Tactic ID | Tactic | Activated because … |
|---|---|---|
| TA0043 | Reconnaissance | The well-known file is by-design a reconnaissance enabler — it publishes endpoints publicly. Academic / supply-chain group weighting elevates code-repo recon. |
| TA0042 | Resource Development | Advisory only — adversary infrastructure development. Low priority for this review. |
| TA0001 | Initial Access | New public route on `ibn-core.vpnet.cloud`; existing TMF921 endpoint becomes more discoverable. Telecom-infra weighting elevates T1190. |
| TA0002 | Execution | New code surface: route + AgentRegistration module (Phase 1); register-agent.ts script (Phase 2). |
| TA0003 | Persistence | The `setAgentURI` semantic means an attacker who briefly holds the owner key can persistently redirect discovery. |
| TA0006 | Credential Access | Phase 2 introduces an EOA private key — a high-value target for DeFi-targeting and supply-chain groups. |
| TA0011 | Command and Control | Outbound HTTPS to Base Sepolia RPC. Low-priority C2 channel concern; not blocking. |
| TA0040 | Impact | A compromised owner key enables `setAgentURI` redirecting all discovery — the central impact scenario for this submission. |

**Explicitly out of scope** (justified): TA0004 (no new privileged accounts), TA0005 (no AV/EDR scope change), TA0007 (no internal directory exposure), TA0008 (route is read-only public; no east-west surface), TA0009 (no sensitive data collection introduced), TA0010 (registration data is by-design public; "exfiltration" of it is meaningless).

### 5.2 Prioritised techniques

Top-3 per in-scope tactic, weighted by the union of all four threat profiles.

| Tactic | Technique (ID + name) | Platform | Group relevance | In scope because … |
|--------|----------------------|----------|-----------------|--------------------|
| TA0043 Reconnaissance | **T1596** Search Open Technical Databases | PRE | Generic + Academic | The on-chain Identity Registry IS a public technical database; adversaries query it to enumerate agents |
| TA0043 | **T1593.003** Search Open Code Repositories | PRE | Academic / supply-chain | Plan publicly cites GitHub repo URLs; CI workflows readable |
| TA0043 | **T1591.002** Gather Victim Org Information: Business Relationships | PRE | Telecom-infra | Registration JSON enumerates which TMF921 endpoint exists; recon for partner/operator relationships |
| TA0001 Initial Access | **T1190** Exploit Public-Facing Application | Linux, Containers, IaaS | Generic + Telecom-infra (high prevalence) | New public route adds attack surface on `ibn-core.vpnet.cloud` |
| TA0001 | **T1133** External Remote Services | Linux, Containers | Telecom-infra | TMF921 endpoint now publicly advertised — easier to find than before |
| TA0001 | **T1078.004** Valid Accounts: Cloud Accounts | IaaS, SaaS | DeFi/crypto-key (high prevalence) | Phase 2: Base Sepolia EOA is a "cloud account" for this purpose; theft = full agent takeover |
| TA0001 | **T1195** Supply Chain Compromise | Linux, Containers, SaaS | Academic / supply-chain | New deps (ethers.js / viem family) on Phase 2; npm supply chain risk |
| TA0002 Execution | **T1059** Command and Scripting Interpreter | Linux | Generic | `register-agent.ts` (Phase 2) — if env/inputs tampered, arbitrary calldata to `register()` |
| TA0002 | **T1525** Implant Internal Image | Containers | Telecom-infra + Academic | Container build pipeline poisoning |
| TA0003 Persistence | **T1554** Compromise Host Software Binary | Linux, Containers | Generic + Academic | Image-supply-chain compromise |
| TA0006 Credential Access | **T1552.001** Unsecured Credentials: Credentials In Files | Linux, Containers | DeFi/crypto-key (high prevalence) | `AGENT_OWNER_PRIVATE_KEY` in `.env` files |
| TA0006 | **T1555** Credentials from Password Stores | Linux, Containers, IaaS | DeFi/crypto-key | If key stored in K8s Secret, store-theft path |
| TA0006 | **T1212** Exploitation for Credential Access | Linux | Generic | Dependency vuln stealing creds at process level |
| TA0011 C2 | **T1071.001** Application Layer Protocol: Web Protocols | Linux, Network Devices | Generic | Outbound HTTPS to Base Sepolia RPC; blends with normal traffic — monitor item |
| TA0040 Impact | **T1565.002** Stored Data Manipulation | IaaS, SaaS | **DeFi/crypto-key (high prevalence for this submission)** | **Phase 2: attacker with owner key calls `setAgentURI(maliciousURL)`, redirects all on-chain discovery.** Single highest-impact technique. |
| TA0040 | **T1499** Endpoint Denial of Service | Linux, Containers, Network | Generic + Telecom-infra | `/.well-known` deliberately outside rate limiter — DoS target |
| TA0040 | **T1657** Financial Theft | IaaS (cryptocurrency exchanges) | DeFi/crypto-key | Owner-key theft enables draining of associated wallets if Phase 3+ binds payment wallets |

### 5.3 Coverage matrix

| # | Technique | Designed-in mitigations (M-id) | Emitted data components (DS-id) | Gap class |
|---|-----------|--------------------------------|---------------------------------|-----------|
| 1 | T1596 | M1056 Pre-compromise (inherent — public-by-design) | — | **Mitigation gap (inherent)** — accepted |
| 2 | T1593.003 | M1056 Pre-compromise | — | **Mitigation gap (inherent)** — accepted |
| 3 | T1591.002 | M1056 Pre-compromise | — | **Mitigation gap (inherent)** — accepted |
| 4 | T1190 | M1051 Update Software (inherited: Dependabot), M1050 Exploit Protection (inherited: Helmet at `src/index.ts:33`) | DS0029 partial (existing metrics); **DS0015 Application Log NOT route-specific** | **Detection gap** → **C5** |
| 5 | T1133 | M1032 MFA (N/A for /.well-known — by-design unauth) | DS0028 (N/A) | **Inherent (by-design)** — accepted |
| 6 | T1078.004 | None designed-in for Phase 2 EOA | None designed-in | **Coverage gap (Phase 2)** → **C3** |
| 7 | T1195 | M1051 Update Software (inherited: Dependabot in CI per recent commits) | DS0007 Image (inherited: CodeQL) | **No new gap** — relies on existing posture; document the dependence |
| 8 | T1059 | M1038 Execution Prevention (general K8s posture) | DS0017 Command (not specifically enabled for `scripts/`) | **Detection gap (Phase 2)** → addressed by C3's RBAC scoping |
| 9 | T1525 | M1047 Audit (existing CI) | DS0007 Image | **No new gap** — inherited CodeQL/Dependabot posture |
| 10 | T1554 | M1051 Update Software | DS0022 File | **No new gap** — inherited posture |
| 11 | T1552.001 | M1027 Password Policies (partial — plan §5.3) | DS0022 File access (not stated) | **Detection gap (Phase 2)** → **C3** |
| 12 | T1555 | M1027 Password Policies | DS0009 Process | **Coverage gap (Phase 2)** — depends on key-store decision (file vs K8s Secret vs vault) → **C3** |
| 13 | T1212 | M1051 Update Software (inherited) | DS0015 Application Log | **No new gap** — inherited posture |
| 14 | T1071.001 | M1037 Filter Network Traffic (egress policy not stated) | DS0029 Network Traffic (partial: existing metrics) | **Mitigation gap (Phase 2)** — minor; document expected egress only, no condition needed unless K8s NetworkPolicy is intended |
| 15 | T1565.002 | M1041 Encrypt Sensitive Information (key-side, partial) + **NO detective control on tokenURI** | DS0029 (none on-chain), DS0022 (key-file only) | **Detection gap (Phase 2 — highest impact)** → **C4** |
| 16 | T1499 | M1037 Filter Network Traffic (deliberately weakened — plan §4.4 puts route outside `/api/` limiter) | DS0029 Network Traffic | **Mitigation gap (Phase 1)** → **C2** |
| 17 | T1657 | Out of scope until Phase 3 binds payment wallets | — | **Deferred** — not in scope of this plan; flag in Phase 3 plan |

**Summary:** 3 inherent-and-accepted gaps (recon is the inverse of discovery), 4 covered-by-existing-posture (supply chain), 5 conditions C1–C5 close the remaining gaps, 1 deferred to Phase 3 (T1657).

---

## 6. Risk Register

| # | Gap | Likelihood | Severity | Residual | Treatment | Accepting authority | Owner | Condition | Review date |
|---|-----|------------|----------|----------|-----------|---------------------|-------|-----------|-------------|
| 1 | T1190 detection gap on new route | Medium | Medium | **4** | Mitigate | Domain Architect / Engineering Lead | Roland | **C5** | Phase 1 GA + 30d |
| 2 | T1552.001 + T1555 + T1078.004 — Phase 2 owner key custody | Medium | High | **6** | Mitigate | Chief Architect or CISO delegate | Roland | **C3** | Phase 2 GA + 30d |
| 3 | T1565.002 — leaked-key → `setAgentURI` redirect (Phase 2) | Low | High | **3** | Mitigate | Domain Architect | Roland | **C4** | Phase 2 GA + 30d; quarterly thereafter |
| 4 | T1499 — DoS on `/.well-known` outside rate limiter | Medium | Low | **2** | Mitigate | Solution Architect | Roland | **C2** | Phase 1 GA |
| 5 | T1525 + T1554 (image supply chain) | Low | High | **3** | Mitigate (rely on existing CodeQL + Dependabot) | Solution Architect | Roland | Documented in evidence doc | Next monthly ARB |
| 6 | T1071.001 — egress policy for Base Sepolia RPC | Medium | Low | **2** | Mitigate (state expected egress; log via existing telemetry) | Solution Architect | Roland | Plan §5.3 amendment | Phase 2 impl PR |
| 7 | TOGAF G — Security Viewpoint absent in plan | Medium | Medium | **4** | Mitigate (this ARB output + plan amendment) | Solution Architect | Roland | **C1** | Phase 1 impl PR opening |
| 8 | TOGAF H — no SLO/SLI for new route | Low | Low | **1** | Accept (non-critical-path; covered by existing `/health`) | Solution Architect (records acceptance in this report) | Roland | — | 12 months |
| 9 | TOGAF J — no rollback plan if ERC-8004 spec shifts | Low | Medium | **2** | Mitigate (already partial via type isolation D5/§7 R1; add explicit rollback statement) | Solution Architect | Roland | Plan §7 amendment | Phase 1 impl PR |

**Risk hot-spots:** Risk #2 at residual 6 requires Chief Architect / CISO delegate sign-off per `reference/risk-acceptance-authority.md`. All other risks are within Solution Architect or Domain Architect authority. **No risk above 6**; no escalation to Executive Risk Committee required. **No regulated data flows** through the discovery path — the only Restricted item is the Phase 2 owner key, which is testnet-scoped.

---

## 7. Architecture Repository Delta

The following Architecture Repository artefacts must be updated as a result of this review:

- **Capability heatmap**: add "Cross-organisational agent discovery" as a NEW capability for ibn-core; mark as v2.1.0 candidate (Phase 1) and v2.2.0 on-chain (Phase 2).
- **Application attack-surface viewpoint**: add `GET /.well-known/agent-registration.json` to the public-surface list with the deliberate-no-rate-limiter annotation paired to C2.
- **Technology standard exposure record**: add **ERC-8004 v1** as an emerging standard (track via ChaosChain ref impl); add **ERC-721 (URI Storage extension)** as a transitively-adopted standard via the chosen contract.
- **Building block catalog**: register `src/discovery/*` as SBB-2026-001 (Discovery — ERC-8004); register **ChaosChain Identity Registry (Base Sepolia)** as a referenced external ABB.
- **Risk register**: add 9 entries from §6 with cross-references to this report's path.
- **Standards Traceability Map (`docs/standards/`)**: a new `ERC-8004-mapping.md` is required by Phase 1 deliverables; this ARB output should be linked from it.

A draft of the full delta is in [`repository-delta.md`](repository-delta.md).

---

## 8. Attached artefacts

- [ATT&CK Navigator layer (`attack-navigator-layer.json`)](attack-navigator-layer.json) — import into [Navigator UI](https://mitre-attack.github.io/attack-navigator/) for visualisation
- [Action Register (`action-register.md`)](action-register.md) — one row per condition
- [Repository Delta note (`repository-delta.md`)](repository-delta.md) — Architecture Repository updates required
- Source submission: [PR #46 / `docs/roadmap/erc-8004-discovery.md`](../../../roadmap/erc-8004-discovery.md)

---

## 9. Sign-off

| Role | Name | Date | Status |
|------|------|------|--------|
| Submitting architect | Roland Pfeifer (Vpnet Cloud Solutions Sdn. Bhd.) | | Pending |
| Domain architect | | | Pending |
| Security architect | | | Pending |
| ARB chair | | | Pending |
| Risk accepting authority (Chief Architect or CISO delegate — Risk #2 residual 6) | | | Pending |

---

## 10. Reconciliation note (because this report is Provisional)

Before this report becomes a final ARB record:

1. Connect the MITRE ATT&CK MCP (or query `attack.mitre.org` v15+ manually) and verify the 17 prioritised technique IDs and their group attributions. Pay particular attention to **T1565.002** (the highest-impact technique) and **T1657** Financial Theft (a more recent technique whose ID has been stable but whose mappings continue to evolve).
2. For each named M-series mitigation and DS-series data component in the Coverage Matrix, confirm the canonical ID still exists in v15+ and that the technique-to-mitigation mapping has not changed.
3. If any technique has been renamed or merged with a sub-technique, update §5.2 / §5.3 / §6 IDs accordingly. The decision and conditions are robust to such renamings — but the navigator layer JSON must be updated to reflect any ID changes before import.

---

*ARB Review Report — Provisional. Generated 2026-06-03 via `/arb-review` skill. Reconcile against live ATT&CK knowledge base before final ARB sign-off. Vpnet Cloud Solutions Sdn. Bhd.*
