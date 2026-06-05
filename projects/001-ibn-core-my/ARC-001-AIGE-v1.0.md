# National AI Governance & Ethics (AIGE) Assessment

> **Template Origin**: Community | **ArcKit Version**: 5.11.0 | **Command**: `/arckit:my-ai-governance`

> ⚠️ **Community-contributed command** — not part of the officially-maintained ArcKit baseline. Output must be reviewed by qualified Malaysian AI-governance / compliance counsel and validated against the National Guidelines on AI Governance & Ethics (MOSTI) and the National AI Office (NAIO) before reliance. Citations may lag the current text — verify against the source at <https://www.mosti.gov.my/>.

> **Commercial-applicability note**: ibn-core is delivered **commercially** by Vpnet Cloud Solutions Sdn. Bhd. as an open-core, AI-native RFC 9315 / TMF921 Intent-Based Networking framework, with private operator CAMARA adapters for Malaysian telecommunications operators (U Mobile, TM Malaysia). Malaysia's **National Guidelines on AI Governance & Ethics (AIGE, MOSTI 2024)** are **principles-based and largely voluntary**. They are therefore assessed here as **alignment and good practice**. Where a principle is given legal force by sector law — principally the **PDPA 2010 (am. 2024)** for personal data, the **Cyber Security Act 2024 / NACSA NCII** regime for operator networks, and **MCMC** sector regulation — the binding obligation is flagged and the controlling artefact cross-referenced (`ARC-001-PDPA-v1.0`, `ARC-001-RISK-v1.0`).

## Document Control

| Field | Value |
|-------|-------|
| **Document ID** | ARC-001-AIGE-v1.0 |
| **Document Type** | National AI Governance & Ethics (AIGE) Assessment |
| **Project** | ibn-core-my (Project 001) |
| **Classification** | PUBLIC |
| **Status** | DRAFT |
| **Version** | 1.0 |
| **Created Date** | 2026-06-05 |
| **Last Modified** | 2026-06-05 |
| **Review Cycle** | Quarterly |
| **Next Review Date** | 2026-09-05 |
| **Owner** | Roland Pfeifer, Lead Architect / CTO (Vpnet Cloud Solutions Sdn. Bhd.) |
| **Reviewed By** | [PENDING] |
| **Approved By** | [PENDING] |
| **Distribution** | ibn-core engineering, Vpnet SI delivery teams, operator integration partners (U Mobile, TM Malaysia), operator Compliance Officers, operator Network Engineering |

> **Subject type note**: This assessment uses the **Generic / commercial** document-control header per `_partials/RENDERING.md` — ibn-core's `governance_framework` is not `Malaysia Federal` and its `classification_scheme` is not `Arahan Keselamatan` (userConfig `organisation_name: Vpnet`), so the Malaysia Federal doc-control block is omitted. This is consistent with `ARC-001-MYCLAS-v1.0`, `ARC-001-MYDIG-v1.0` and `ARC-001-PDPA-v1.0`. AIGE alignment is nonetheless assessed in full, and personal-data / NCII obligations remain binding under sector law.

## Revision History

| Version | Date | Author | Changes | Approved By | Approval Date |
|---------|------|--------|---------|-------------|---------------|
| 1.0 | 2026-06-05 | ArcKit AI | Initial creation from `/arckit:my-ai-governance` (executed via arckit-build wave 7, command-fallback). Maps ibn-core to the seven AIGE principles; documents human oversight (HITL gating per R-001), transparency/explainability via GenAI + RFC 9315 telemetry, and accountability via constrained agent-role identity (FR-007 / ADR-001). | [PENDING] | [PENDING] |

---

## Executive Summary

ibn-core is an **AI-native** Intent-Based Networking framework: an Anthropic Claude-based translation layer converts natural-language operator/customer intent into structured TMF921 Intent resources, and an **autonomous agent runtime** orchestrates fulfilment through a Model Context Protocol (MCP) adapter seam to operator CAMARA APIs (`ARC-001-REQ-v1.0` BR-002, FR-002, FR-003). The agent can ultimately **mutate live operator network configuration** — placing the system squarely within the scope of Malaysia's National Guidelines on AI Governance & Ethics (AIGE) and, for the network surface, the NACSA NCII / Cyber Security Act 2024 regime.

The assessed AI **risk tier is HIGH-impact / Medium-residual**: the use case influences live national-infrastructure configuration (potential for service-affecting change) and processes subscriber personal data during intent fulfilment, but the system is at **alpha phase** with mock adapters, and live subscriber PII / network mutation enters only at SI engagement (v3.0.0). The dominant AIGE-relevant risk is **R-001 — an autonomous agent making an unsafe or unreversible change to a live network** (inherent 16, residual 12, exceeds the tightened safety appetite of ≤ 9), with **R-008** (agent running under an over-privileged / human identity) and **R-003** (operators/regulators rejecting autonomous operation outright) as the supporting governance risks.

Overall AIGE posture is **Aligned with conditions**. The architecture already realises the strongest accountability and transparency controls — a distinct **constrained least-privilege agent-role identity** for every autonomous cycle (FR-007, ADR-001; commit `a9da9d4`), and pervasive **GenAI semantic-convention + RFC 9315 phase telemetry** that makes agent reasoning and every tool call attributable and reviewable (FR-011, BR-005). The **binding gap is human oversight**: HITL gating on high-impact, network-mutating actions is not yet 100% enforced. Closing that gap (phased autonomy by blast radius, reversible-by-default orchestration with tested rollback, EARB + operator network-team sign-off as a release gate) is the principal condition for first operator go-live and the key to satisfying the AIGE *Reliability, Safety & Control* and *Accountability* principles.

## AI Use-Case Summary & Risk Tier

| Item | Detail |
|------|--------|
| What the AI does | (1) **Intent translation** — Claude-based NL→TMF921 structured Intent (RFC 9315 §5.1.2; `ARC-001-REQ-v1.0` FR-002). (2) **Autonomous orchestration** — an agent runtime drives `McpAdapter.orchestrate()` to fulfil intent via operator CAMARA APIs (RFC 9315 §5.1.3; FR-003). |
| Decisions it influences | Service provisioning / connectivity changes on live operator networks; selection and sequencing of CAMARA fulfilment actions; compliance/rollback actions on intent state. Low-impact and read/assessment actions are autonomous; **high-impact, network-mutating actions are gated** (R-001 phased-autonomy control). |
| Personal data involved | Subscriber personal data may appear in intent payloads processed by the agent (FR-009, NFR-C-001). Bound by **PDPA 2010 (am. 2024)** — see `ARC-001-PDPA-v1.0`; RESTRICTED-tier (DS-009) PII Malaysia-resident; cross-border telemetry (LangSmith INT-004) gated on PDPA/DPIA sign-off (`ARC-001-RISK` R-004; ADR-003 DS-006). |
| Affected critical infrastructure | Operator networks are NCII (Cyber Security Act 2024 / NACSA). AI autonomy on this surface is the irreducible core of R-001 / R-005. |
| Phase / maturity | **Alpha**, full-system scope, mock adapters. Live network mutation + subscriber PII enter at SI / v3.0.0. |
| **Assessed AI risk tier** | **HIGH impact, Medium residual.** Recommend companion `/arckit:ai-playbook` and `/arckit:atrs` (transparency record) before live operator go-live (G-2). |

## Seven AIGE Principles Assessment

| Principle | How met | Gap | Action |
|-----------|---------|-----|--------|
| **Fairness** | Domain is technical network-resource provisioning, not decisions about individuals — low intrinsic discrimination surface. Deterministic TMF921 schema constrains agent output; intent translation is auditable per-decision via telemetry. No automated decisions are made *about persons* (no eligibility/credit/profiling). | No explicit bias-testing of the LLM translation layer for systematic mis-handling of particular operators, service classes, or customer segments; fairness is asserted by domain, not evidenced. | Add a translation-fairness check to the CTK / evaluation suite (consistency of NL→TMF921 across equivalent intents); record outcome in `/arckit:atrs`. Owner: ibn-core Engineering. |
| **Reliability, Safety & Control** | **Phased autonomy by blast radius** (read/low-impact autonomous, high-impact gated); Istio circuit breakers, retry/backoff, bulkheads and degraded mode (NFR-A-003, PRIN 2); RFC 9315 compliance-assessment loop (IntentReport.reportState) for drift detection; constrained agent role bounds the action space (FR-007). | **R-001 (residual 12, > safety appetite 9):** HITL gating not yet 100% on network-mutating ops; reversible-by-default orchestration with tested rollback per adapter not yet shipped; agent-telemetry coverage "partial" (STKE G-3). | Reach **100% HITL gating on high-impact actions**; ship reversible-by-default orchestration + tested rollback; complete telemetry coverage. **EARB + operator network-team sign-off is a release gate** (before G-2, Q4 2026). Owner: Security/Compliance + Operator Network liaison. |
| **Privacy & Security** | **Binding under PDPA 2010 (am. 2024)** — full compliance assessment in `ARC-001-PDPA-v1.0` (7 DPP, DPO, 72h breach notification, risk-based cross-border). PII masking in logs/telemetry (FR-009, NFR-C-001); zero-trust identity + least privilege (PRIN 4, ADR-001); Malaysia-resident RESTRICTED data; secrets vault-only; CAMARA credentials never coupled to commercial identity (ADR-001). | Cross-border telemetry default (LangSmith, INT-004) is a residual privacy risk (R-004, residual 9 > appetite 6) until in-region collector is default and transfer basis documented. | Make in-region OTLP collector the default; gate LangSmith on PDPA/DPIA sign-off; complete DPIA (`/arckit:dpia`) before live PII. Owner: Operator Compliance Officer / Security Lead. |
| **Inclusiveness** | B2B operator-tooling context (network engineers, service designers) rather than direct citizen interface — accessibility/digital-divide exposure is indirect. Open-core (Apache 2.0) framework lowers barrier to scrutiny and reuse. | No accessibility or multi-language (BM/EN) consideration recorded for the human-facing intent-authoring / review surfaces; no inclusiveness criteria in stakeholder design. | Record accessibility + BM/EN posture for operator-facing UIs at SI design; note that end-subscriber impact is mediated by the operator. Owner: Lead Architect. |
| **Transparency** | **Strong.** Every autonomous tool call emits **GenAI semantic-convention (`gen_ai.*`)**, **AI-gateway (`ai_gateway.*`)** and **RFC 9315 phase (`rfc9315.phase`)** telemetry carrying the acting identity and correlation/intent ID (FR-011, BR-005, UC006). Meta-observability of agent behaviour is an explicit product principle (PRIN 5). UC-003 review journey lets a reviewer obtain an attributable, phase-tagged trace per intent. Open-core repo + CLAUDE.md make the design legible. | No external/citizen-facing disclosure artefact yet; explainability of the *LLM reasoning step* (vs. the tool-call trace) is observational, not a structured rationale record. Companion ATRS not yet produced. | Produce an **ATRS transparency record** (`/arckit:atrs`); add a model/decision-documentation card; ensure operators disclose AI involvement to affected end-customers where service-affecting. Owner: Lead Architect. |
| **Accountability** | **Strong.** **Constrained least-privilege agent-role identity** for every autonomous cycle — distinct OAuth2 client-credentials `agent` realm role, deny-by-default scopes, never a human/admin identity (FR-007, ADR-001; commit `a9da9d4`). Acting identity carried in audit logs **and** telemetry spans (NFR-C-002); 100%-attributable-tool-call target. Named owners per risk; EARB escalation path. | **R-008 (residual 9 > appetite 6):** identity scoping not yet enforced/regression-guarded everywhere; **R-003** — without evidenced safety + observability, operators/regulators may reject autonomy. Governance forum (EARB) and NAIO touchpoint not yet formally constituted for this product. | Per-release least-privilege role review; **alert on any agent tool call lacking the agent-role identity attribute**; privilege-escalation negative tests; stand up the EARB AI-oversight forum; register NAIO touchpoint. Owner: Security Lead. |
| **Pursuit of Human Benefit & Wellbeing** | Purpose is faster, auditable, lower-error network service provisioning — reduces manual engineering toil and time-to-service (BR-002) while keeping humans in control of high-impact change. Autonomy is deliberately bounded (the differentiator is *trustworthy* autonomy, not unbounded automation). | Benefit is asserted operationally; no explicit human-impact / displacement consideration recorded for operator network-engineering roles. | Note human-augmentation (not replacement) framing in the SI engagement; benefits realisation tracked against STKE goals. Owner: Lead Architect / CTO. |

## Human Oversight

ibn-core's oversight model is **risk-tiered by blast radius**, which is the central control reconciling the AIGE *Reliability, Safety & Control* principle with the autonomy that is the product's differentiator (STKE Conflict-2 resolution; `ARC-001-RISK-v1.0` R-001):

- **Autonomous (human-on-the-loop):** read / assessment / low-impact actions run without per-action human approval. Humans monitor via telemetry (UC-003) and can intervene; the RFC 9315 compliance-assessment loop (`IntentReport.reportState`) surfaces drift.
- **Gated (human-in-the-loop):** **high-impact, network-mutating actions** must pass a human-approval gate. ADR-001 provides the technical hook — an **elevated-assurance gate** (short token TTL, per-call re-validation, and MFA upstream for human-initiated privileged actions) — which the action plan binds to network-mutating operations.
- **Release-gate oversight (governance-in-the-loop):** **EARB + operator network-team sign-off is a release gate** for first operator go-live; no production without operator network-team safety sign-off, a current DPIA, and an NCII attestation (R-001 / R-005 treated as go-live blockers).

**Binding gap (condition for go-live):** HITL gating is **not yet 100%** on high-impact actions, and reversible-by-default orchestration with tested per-adapter rollback is not yet shipped — this is why R-001 residual (12) still exceeds the tightened safety appetite (≤ 9). Reaching 100% HITL coverage + tested rollback is the explicit target (residual → 9) before G-2 (Q4 2026). Until then the elevated-assurance gate parameters (token TTL, re-validation scope, MFA boundary) remain partly unparameterised (an HLD blocking gap).

**Escalation path:** agent anomaly → telemetry alert (acting identity / phase) → operator on-call + ibn-core Engineering → Security/Compliance → EARB + operator Network Engineering.

## Transparency & Explainability

- **Decision-level traceability:** every intent yields a correlation/intent-ID-tagged trace; every autonomous cycle emits `gen_ai.*`, `ai_gateway.*` and `rfc9315.phase` spans carrying the **acting agent identity** (FR-011, BR-005, UC006/UC-003). The telemetry bootstrap rule (`src/telemetry.ts` first import) guarantees coverage of new entrypoints.
- **Disclosure to affected parties:** ibn-core is operator-facing; **disclosure of AI involvement to affected end-customers** for service-affecting changes is an operator responsibility to be set in the SI engagement. No citizen-facing disclosure artefact exists yet.
- **Model / decision documentation:** recommended companion **ATRS** record (`/arckit:atrs`) and a model card documenting the Claude translation step, its inputs/outputs, and known limitations — to convert observational trace explainability into a structured rationale record.

## Accountability

- **Owner / accountable executive:** Roland Pfeifer, Lead Architect / CTO (Vpnet Cloud Solutions Sdn. Bhd.).
- **Identity & attribution:** autonomous cycles run under a **distinct, constrained, least-privilege `agent` realm role** (OAuth2 client-credentials, deny-by-default) — never a human/admin identity (FR-007, ADR-001; commit `a9da9d4`). Acting identity is recorded in both audit logs and telemetry; the target is 100% of agent tool calls attributable to the agent-role identity and a correlation/intent ID (NFR-C-002). R-008 tracks the residual scoping/regression gap.
- **Governance forum:** the **EARB** (Enterprise Architecture Review Board) is the AI-oversight forum and the release-gate authority for autonomous operation (with operator network-team sign-off). It should be formally constituted with an AI-oversight remit for this product.
- **NAIO touchpoint:** as a commercial AI deployer on critical telecommunications infrastructure, Vpnet should register the appropriate **National AI Office (NAIO)** voluntary touchpoint and track AIGE guidance updates; sector-binding obligations (PDPA/JPDP, MCMC, NACSA NCII) are handled via their respective artefacts and remain the mandatory floor.

## Risks

| Risk | Likelihood | Impact | Treatment |
|------|-----------|--------|-----------|
| **R-001** — Autonomous agent makes an unsafe / unreversible change to a live network (`ARC-001-RISK` R-001; residual 12, > safety appetite 9) | 3 - Possible | 4 - Major | **TREAT** — 100% HITL gating on high-impact actions; reversible-by-default + tested rollback; EARB + operator network-team sign-off as release gate; complete agent telemetry. Target residual 9. |
| **R-008** — Autonomous flow runs under an over-privileged / human identity (`ARC-001-RISK` R-008; residual 9, > appetite 6) | 3 - Possible | 3 - Moderate | **TREAT** — per-release least-privilege role review; alert on any agent tool call lacking the agent-role identity; privilege-escalation negative tests. Target residual 6. |
| **R-003** — Operators / regulators reject autonomous operation outright (`ARC-001-RISK` R-003; residual 6) | 3 - Possible | 2–3 | **TREAT** — evidence safety + observability; phased-autonomy narrative; engage MCMC/operator early; this AIGE assessment + ATRS are part of the evidence base. |
| **R-004** — Cross-border AI processing / telemetry of subscriber PII (`ARC-001-RISK` R-004; residual 9, > appetite 6) | — | — | **TREAT** — in-region collector default; LangSmith gated on PDPA/DPIA sign-off; documented transfer basis. See `ARC-001-PDPA-v1.0`. |

These feed the core register `ARC-001-RISK-v1.0`; no new risk IDs are minted here.

## External References

### Document Register

| Doc ID | Title | URL | Verified date |
|--------|-------|-----|---------------|
| MY-AIGE | National Guidelines on AI Governance & Ethics (AIGE) — Ministry of Science, Technology and Innovation (MOSTI) / National AI Office (NAIO) | <https://www.mosti.gov.my/> | 2026-06-05 |
| ARC-001-REQ | ibn-core-my Requirements v1.0 (AI in scope; FR-002/003/007/009/011, BR-002/005, NFR-C/SEC) | projects/001-ibn-core-my/ARC-001-REQ-v1.0.md | 2026-06-05 |
| ARC-001-RISK | ibn-core-my Risk Register v1.0 (R-001, R-003, R-004, R-008) | projects/001-ibn-core-my/ARC-001-RISK-v1.0.md | 2026-06-05 |
| ARC-001-ADR-001 | ADR-001 Operator Identity / constrained agent role / CAMARA egress | projects/001-ibn-core-my/decisions/ARC-001-ADR-001-v1.0.md | 2026-06-05 |
| ARC-001-PDPA | PDPA 2010 (am. 2024) Compliance Assessment v1.0 | projects/001-ibn-core-my/ARC-001-PDPA-v1.0.md | 2026-06-05 |
| ARC-001-MYDIG | MyDIGITAL national-alignment statement v1.0 (AIGE handoff) | projects/001-ibn-core-my/ARC-001-MYDIG-v1.0.md | 2026-06-05 |

### Citations

| Citation | Doc ID | Section | Used in |
|----------|--------|---------|---------|
| [AIGE-1] | MY-AIGE | Seven AI principles | Seven AIGE Principles Assessment |
| [AIGE-2] | MY-AIGE | Human oversight / responsible AI | Human Oversight |
| [REQ-1] | ARC-001-REQ | FR-007 constrained agent-role identity; FR-011 telemetry; BR-002/BR-005 | Accountability; Transparency & Explainability |
| [RISK-1] | ARC-001-RISK | R-001 / R-003 / R-008 | Risks; Human Oversight; Accountability |
| [ADR-1] | ARC-001-ADR-001 | Constrained agent role + elevated-assurance gate | Human Oversight; Accountability |
| [PDPA-1] | ARC-001-PDPA | PDPA 2010 (am. 2024) personal-data obligations | Privacy & Security principle |

### Unreferenced Documents

ARC-001-ADR-002-v1.0 and ARC-001-ADR-003-v1.0 (cloud placement / data residency) were read for residency context that informs the Privacy & Security principle and R-004; cited indirectly via `ARC-001-PDPA-v1.0` and the risk rows rather than directly.

---

**Generated by**: ArcKit `/arckit:my-ai-governance` command (command-fallback, arckit-build wave 7)
**Generated on**: 2026-06-05
**ArcKit Version**: 5.11.0
**Project**: ibn-core-my (Project 001)
**Model**: Claude Opus 4.8 (1M context)
