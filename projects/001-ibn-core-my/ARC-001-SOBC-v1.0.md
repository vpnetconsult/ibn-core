# Strategic Outline Business Case (SOBC)

> **Template Origin**: Official | **ArcKit Version**: 5.11.0 | **Command**: `/arckit:sobc`

## Document Control

| Field | Value |
|-------|-------|
| **Document ID** | ARC-001-SOBC-v1.0 |
| **Document Type** | Strategic Outline Business Case (SOBC) |
| **Project** | ibn-core-my (Project 001) |
| **Classification** | PUBLIC |
| **Status** | DRAFT |
| **Version** | 1.0 |
| **Created Date** | 2026-06-05 |
| **Last Modified** | 2026-06-05 |
| **Review Cycle** | Quarterly |
| **Next Review Date** | 2026-09-05 |
| **Owner** | Roland Pfeifer, Lead Architect / CTO (Vpnet Cloud Solutions Sdn. Bhd.) |
| **Reviewed By** | PENDING |
| **Approved By** | PENDING |
| **Distribution** | Vpnet Cloud Solutions board / investment committee, ibn-core engineering, SI delivery, Commercial, Security/Compliance, Finance |

> **Subject-type note**: ibn-core is a **commercial** Malaysian open-core (Apache 2.0) deep-tech venture delivered by Vpnet Cloud Solutions Sdn. Bhd. — **not** a UK Government or Malaysian Federal public-sector spending proposal. The HM Treasury Green Book **5-case model** (Strategic / Economic / Commercial / Financial / Management) is applied here as a **structuring discipline** for an investment decision. Commercial language (revenue, margin, shareholder value, competitive advantage, return on investment) replaces public-sector language (public value, social CBA, citizen outcomes). The approving body is the **Vpnet board / investment committee**, not HM Treasury; the discount rate, thresholds, and "value for money" framing are adapted to a commercial venture. Currency is **Malaysian Ringgit (RM)** throughout. All financial figures are **indicative Rough Order of Magnitude (ROM) ranges** at SOBC stage and are explicitly flagged as assumptions to be refined at OBC.

## Revision History

| Version | Date | Author | Changes | Approved By | Approval Date |
|---------|------|--------|---------|-------------|---------------|
| 1.0 | 2026-06-05 | ArcKit AI | Initial creation from `/arckit:sobc` command | PENDING | PENDING |

## Document Purpose

This Strategic Outline Business Case justifies continued and incremental investment in **ibn-core** — the open-core RFC 9315 / TMF921 AI-native Intent-Based Networking (IBN) framework — as a **commercial product-plus-Systems-Integration (SI) venture** targeting Malaysian telecommunications operators (U Mobile, TM Malaysia as reference customers). It applies the Green Book 5-case model to a high-level, options-based investment decision taken **before** detailed delivery commitment, and is the strategic anchor for downstream artefacts (refined OBC, vendor/partner SOW, and the operator go-live gates). Benefits trace to stakeholder goals in `ARC-001-STKE-v1.0`; risks trace to `ARC-001-RISK-v1.0`; scope traces to `ARC-001-REQ-v1.0`.

---

## Executive Summary

**Purpose**: ibn-core exists to capture an emerging commercial opportunity — turning a verifiably standards-conformant, AI-native IBN framework into recurring revenue from Malaysian operator licensing and SI engagements, while open-core distribution drives reach, credibility, and lead generation at low marginal cost.

**Problem Statement**: Malaysian operators face rising cost and slow time-to-service translating commercial/customer intent into concrete 4G/5G + OSS/BSS configuration; the work is manual, error-prone, and offers no standards-based, auditable intent lifecycle. Existing OSS/BSS tooling is proprietary and lock-in-heavy. There is no productised, RFC 9315 / TMF921-conformant, AI-native alternative on offer to U Mobile or TM — a commercial gap ibn-core is positioned to fill.

**Proposed Solution**: Continue developing the public Apache 2.0 framework (Claude-based intent translation, autonomous MCP-orchestrated fulfilment, Redis SSoT, Keycloak identity, OTel observability) and monetise it through **private operator CAMARA adapters + SI delivery**, landing a first referenceable operator engagement and sustaining 100% TMF921 CTK conformance as the commercial differentiator.

**Strategic Fit**: Directly realises the Vpnet open-core commercial thesis — public framework for credibility and reach; private adapters and SI for revenue — and the architecture principles in `ARC-000-PRIN-v1.0` (standards conformance, security, open-core seam integrity as NON-NEGOTIABLE).

**Investment Required (indicative ROM, RM, 3 years)**: **RM 8.0M – RM 12.5M** (preferred Option 2)

- Capital (build/productise): RM 4.5M – RM 7.0M
- Operational (run, 3 years): RM 3.5M – RM 5.5M

**Expected Benefits (indicative ROM, RM, 3 years)**: **RM 16M – RM 28M** gross contribution (preferred Option 2)

- Operator SI engagement revenue (reference + second operator): RM 9M – RM 16M
- Product / platform licensing + support (recurring): RM 4M – RM 8M
- Open-core-driven pipeline acceleration and avoided sales cost: RM 3M – RM 4M

**Return on Investment (commercial, indicative)**:

- 3-year net contribution (ROM): **RM +5M – RM +16M** (benefits minus investment, pre-tax, undiscounted)
- Indicative payback period: **~18–30 months** from first operator go-live
- Indicative 3-year ROI on invested capital: **~60% – 140%** (wide band — ROM only, see assumptions)

> **Assumption flags (ROM)**: Figures assume (A1) one operator reaches production by Q4 2026 and a second is onboarded from the reference pattern within the window; (A2) SI day-rates and engagement scale typical of Malaysian telco transformation work; (A3) the open-core seam holds, so adapters remain monetisable. None of these figures is a costed/contracted number; they are indicative ranges for an investment decision and **must be refined at OBC** against an actual engagement scope and pipeline.

**Recommended Option**: **Option 2 — Balanced: productise + land first reference operator + sustain conformance.**

**Key Risks** (from `ARC-001-RISK-v1.0`):

1. **R-001** — Autonomous agent makes an unsafe change to a live operator network (residual 12, go-live-gating).
2. **R-004 / R-005** — PDPA 2010 subscriber-data breach and NCII cyber-resilience gap on critical national infrastructure (residual 9 / 12, go-live-gating).
3. **R-006 / R-002** — TMF921 conformance regression, or operator credentials / proprietary logic leaking into the public repo, erode the differentiator and commercial value (residual 9 / 9).

**Go/No-Go Recommendation**: **PROCEED** — continue investment on the Option 2 path, with first operator go-live conditioned on the safety, PDPA, and NCII gates already defined in the risk register.

**Rationale**: The opportunity is real and time-sensitive (operators are actively modernising OSS/BSS; standards-based, low-lock-in, AI-native positioning is differentiated). The dominant risks are inherent to the model but are already being actively treated and are gated, not open-ended. Option 2 captures the bulk of the commercial value at materially lower cost and risk than the comprehensive option.

**Next Steps if Approved**:

1. Confirm investment envelope and the first-operator engagement target with the board/investment committee.
2. Refine detailed requirements where needed (`ARC-001-REQ-v1.0` already exists; revalidate engagement-specific scope).
3. Develop the **OBC** with firmer engagement-based costs once the first operator scope is contracted.
4. Progress the partner/operator commercial route (adapter delivery + SI SOW).

---

# PART A: STRATEGIC CASE

## A1. Strategic Context

### A1.1 Problem Statement

**Current Situation**: Malaysian operators translate commercial and customer intent (e.g. "provide internet for a work-from-home customer") into network configuration through manual, specialist engineering across heterogeneous 4G/5G core, transport, and OSS/BSS systems. This does not scale to campaign-driven, bursty B2B demand, is error-prone, and produces no standards-based, auditable intent lifecycle. Incumbent OSS/BSS tooling is proprietary, raising lock-in and integration cost.

**Specific Pain Points** (from `ARC-001-STKE-v1.0` drivers):

| Stakeholder | Driver ID | Pain Point | Commercial Impact | Intensity |
|-------------|-----------|------------|-------------------|-----------|
| Operator Network Engineering | SD-4 | No trustworthy way to automate intent on live infrastructure | Manual effort; slow time-to-service; risk aversion blocks automation | CRITICAL |
| Operator IT / Procurement | SD-5 | Proprietary OSS/BSS lock-in; weak interoperability evidence | High switching cost; poor value-for-money against incumbents | HIGH |
| Vpnet Commercial / Sales | SD-3 | No productised, monetisable IBN offer to operators | Revenue opportunity unrealised; differentiation undefended | HIGH |
| Lead Architect / CTO | SD-1 | Differentiation rests on *verifiable* conformance that must be sustained | Erosion of conformance erodes the entire commercial thesis | CRITICAL |
| End-Customer Enterprises | SD-6 | Slow, manual service ordering (O2C) | Poor B2B experience; lost operator revenue downstream | MEDIUM |

**Consequences of Inaction** (commercial):

- The window to be the standards-based, AI-native alternative to incumbent OSS/BSS at U Mobile / TM closes as operators commit to other modernisation paths — first-mover and reference-customer advantage is lost.
- Sunk R&D in the framework (through v2.0.1, 100% CTK) yields no recurring revenue; the open-core investment generates reach but not contribution.
- The academic credibility asset (Paper 1) is not converted into commercial pull.

### A1.2 Strategic Drivers

**Link to Stakeholder Analysis**: Informed by `ARC-001-STKE-v1.0` (12 stakeholder drivers SD-1…SD-12).

**Primary Drivers** (commercial venture lens):

| Driver ID | Stakeholder | Driver Type | Driver Description | Strategic Imperative |
|-----------|-------------|-------------|-------------------|---------------------|
| SD-1 | Lead Architect / CTO | STRATEGIC | Standards conformance as the commercial + academic differentiator | Defensible market position |
| SD-2 | SI Delivery Lead | OPERATIONAL | Land first operator engagement to production | Revenue realisation + reference asset |
| SD-3 | Commercial / Sales | FINANCIAL | Grow SI + product revenue; protect monetisable adapters | Revenue growth + margin protection |
| SD-4 | Operator Network Eng | RISK | Safe, observable autonomous operation on live infra | Adoption unlock (the buying objection) |
| SD-5 | Operator IT / Procurement | FINANCIAL | Standards-based, low-lock-in, value-for-money procurement | Win procurement on differentiated value |
| SD-7 | Vpnet Security / Compliance | COMPLIANCE | Defensible PDPA / NCII / security posture | Precondition to operator trust + go-live |

**Strategic Alignment**:

- **Vpnet open-core commercial thesis**: public Apache 2.0 framework drives reach and credibility; private CAMARA adapters + SI engagements drive revenue. This SOBC is the investment case for that thesis.
- **Architecture Principles (`ARC-000-PRIN-v1.0`)**: Standards Conformance (P3), Security (P4), Open-Core Seam Integrity (P9) are NON-NEGOTIABLE and shape every option.
- **Academic-to-commercial flywheel**: Paper 1 citation integrity and reproducible conformance evidence are simultaneously a credibility asset and a sales asset (STKE Synergy 1).

### A1.3 Stakeholder Goals (become the benefit basis)

**Goals Addressed** (from `ARC-001-STKE-v1.0` — every Economic-Case benefit traces to one of these):

| Goal ID | Stakeholder | Goal (commercial framing) | Current State | Target State | Timeline |
|---------|-------------|---------------------------|---------------|--------------|----------|
| G-1 | Lead Architect / CTO | Sustain 100% TMF921 CTK (83/83) with versioned evidence | 100% at v2.0.1 | 100% maintained, zero post-release regressions | Through 2026 |
| G-2 | SI Delivery Lead | Land first operator in production with safety + compliance evidence | 0 in production | 1 operator live; O2C fulfilment ≥ 99% | Q4 2026 |
| G-3 | Security/Compliance + Architect | Demonstrably safe + observable autonomous agents | Agent-role adopted; telemetry partial | 100% scoped + audited; HITL on high-impact | By first go-live |
| G-4 | Lead Architect / CTO | Maintain open-core / proprietary seam integrity | Clean seam (v1.4.2); 0 known leaks | 0 leaks; backward-compatible interface | Through 2026 |
| G-5 | Security/Compliance | Demonstrable PDPA 2010 + data-sovereignty compliance | Masking present; DPIA review pending | Approved DPIA; 0 PII incidents; residency-conformant | Before first go-live |

### A1.4 Scope

**In Scope** (from `ARC-001-REQ-v1.0`, full-system, alpha phase):

- The public open-core framework: NL intent ingestion, Claude-based TMF921 v5.0.0 translation, autonomous MCP orchestration, Redis SSoT, Keycloak auth, Istio mesh, OTel observability, `MockMcpAdapter`, published `McpAdapter` interface.
- Canonical Order-to-Cash (O2C) journey as the primary end-to-end verification and demo asset.
- Productisation for SI: reusable deployment manifests, runbooks, conformance + compliance evidence packs as sales assets.
- The commercial wrapper: licensing/support model and the private-adapter + SI delivery motion (commercially, not the adapter code itself in the public repo).

**Out of Scope** (this phase / this repo):

- Production operator-specific CAMARA adapter implementations and real operator credentials — **private repo, delivered via SI** (open-core seam, PRIN P9).
- Live CAMARA integration against operator sandboxes (product roadmap v3.0.0).
- Multi-operator federation (product roadmap v4.0.0).
- Operator OSS/BSS billing/CRM/charging beyond defined integration contracts.

**Interfaces**:

- **Anthropic Claude API** — AI translation + agent reasoning (commercial dependency; cost-per-intent tracked).
- **Operator CAMARA APIs via MCP seam** — fulfilment (revenue-bearing integration, private adapters).
- **Keycloak / OTel backend (LangSmith default, Canvas-overridable)** — identity + observability.

**Assumptions** (ROM, to validate):

1. (A1) One operator reaches production by Q4 2026; a second follows from the reference pattern — *if wrong, revenue ramp slips and payback lengthens.*
2. (A2) SI engagement scale and day-rates are typical of Malaysian telco transformation work — *if wrong, both cost and revenue scale shift.*
3. (A3) The open-core seam holds (no credential/logic leakage), so adapters stay monetisable — *if wrong, the core monetisation mechanism is impaired (R-002).*
4. (A4) Autonomous-operation safety + PDPA + NCII evidence is accepted by operators/regulators — *if wrong, autonomy de-scopes to advisory and the differentiator weakens (R-003).*

**Dependencies**:

- **Internal**: Stable open-core seam (G-4) so adapters drop in; CI restored to reliable gating (currently billing-constrained — affects G-1 conformance gate and R-002/R-006 controls).
- **External**: Operator sandbox access + CAMARA adapter readiness; regulator engagement (MCMC/JPDP/NACSA); Anthropic + LangSmith terms/availability.
- **Commercial**: A contracted first-operator engagement to convert pipeline into recognised revenue.

### A1.5 Why Now?

**Urgency Factors (commercial)**:

- Operators are **actively modernising** OSS/BSS and adopting TM Forum Open APIs now — the procurement window for a standards-based, low-lock-in alternative is open but not indefinite.
- ibn-core is at a **conversion inflection**: the framework already holds 100% CTK (v2.0.1) and is cited (Paper 1); the marginal investment now is to convert credibility into a first reference engagement, not to build from scratch.
- **First-mover / reference-customer advantage**: the first Malaysian operator live becomes the case study that de-risks the entire pipeline (STKE Outcome O-2).

**Opportunity Cost of Delay**:

- Each quarter of delay risks an operator committing to an alternative modernisation path, forfeiting the reference deal (indicative lost contribution: a full SI engagement band, RM 9M–RM 16M over the window).
- Sustained R&D and open-core maintenance cost continues to accrue without recurring revenue offset.

**Window of Opportunity**: Standards maturity (TMF921 v5.0.0, RFC 9315), AI-native operation becoming credible, and operator appetite for low-lock-in tooling coincide — a favourable moment to commercialise.

---

# PART B: ECONOMIC CASE

> **Appraisal depth (configured)**: **Strategic estimates** — Rough Order of Magnitude (ROM) costs and qualitative benefits, appropriate to SOBC stage. NPV/BCR and full sensitivity analysis are deferred to OBC/FBC once an engagement scope is contracted. Indicative commercial payback and ROI bands are provided for decision support only and are flagged as assumptions.
> **Options configured**: **4 options** — Do Nothing (0), Minimal (1), Balanced (2, recommended), Comprehensive (3).

## B1. Critical Success Factors

1. **Verifiable standards conformance sustained** — *Measure*: TMF921 CTK pass rate per release. *Threshold*: 100% (83/83) maintained, zero post-release regressions (G-1).
2. **First reference operator in production** — *Measure*: production go-live with signed safety + DPIA + NCII gates; steady-state O2C fulfilment. *Threshold*: 1 operator live by Q4 2026, fulfilment ≥ 99% (G-2).
3. **Trustworthy autonomous operation** — *Measure*: % agent actions under scoped agent-role identity + audited; high-impact actions HITL-gated. *Threshold*: 100% scoped + audited (G-3).
4. **Open-core seam integrity (monetisation protected)** — *Measure*: credential/proprietary-logic leaks into public repo. *Threshold*: 0 leaks; interface backward-compatible (G-4).
5. **Commercial viability** — *Measure*: contracted SI revenue + recurring licensing against invested capital. *Threshold*: positive 3-year net contribution within ROM band; payback within ~30 months of first go-live.

## B2. Options Analysis

> All costs/benefits are **indicative ROM in RM over 3 years** and are decision-support estimates, not contracted figures.

### Option 0: Do Nothing (Baseline)

**Description**: Freeze ibn-core at the current open-core state (v2.0.1); maintain the repo passively; do **not** invest to productise or land an operator engagement.

**Costs (3-year, ROM)**:

- Capital: RM 0
- Operational (passive maintenance, minimal): RM 0.8M – RM 1.5M
- Total: **RM 0.8M – RM 1.5M**

**Benefits**: RM 0 recurring revenue (credibility/citation only; no commercial contribution).

**Pros**:

- ✅ No incremental investment or delivery risk.
- ✅ Preserves the academic asset and open-core reputation at low cost.

**Cons**:

- ❌ 0% of commercial stakeholder goals met (G-2 unrealised; no revenue).
- ❌ Forfeits the operator procurement window and first-mover reference advantage.
- ❌ Sunk R&D never converts to contribution; differentiation decays as standards evolve unattended (R-006).

**Risks**: Competitor/incumbent locks in U Mobile/TM; the open-core surface stagnates and is perceived as abandoned (R-007 open-washing risk worsens).

**Stakeholder Goals Met**: ~10% (G-1 partially, by inertia only).

**Recommendation**: **Reject** — captures none of the commercial opportunity the prior R&D created.

---

### Option 1: Minimal — Sustain conformance + lightweight commercialisation

**Description**: Keep the framework conformant and "demo-able," pursue operator interest opportunistically, but do **not** fully fund a productised SI motion or a committed first engagement.

**Scope**: Maintain 100% CTK + evidence (G-1); keep `MockMcpAdapter` + published seam current (G-4); light-touch sales collateral; respond to inbound operator interest without dedicated delivery investment.

**Costs (3-year, ROM ±40%)**:

- Capital: RM 1.5M – RM 2.5M (conformance gating restored, minimal productisation)
- Operational: RM 2.0M – RM 3.0M (lean engineering + maintenance)
- Total 3-year TCO: **RM 3.5M – RM 5.5M**

**Benefits (3-year, ROM)**:

- **B-1** (from G-1): conformance sustained — protects credibility/differentiation; modest licensing interest: RM 1M – RM 3M.
- **B-2** (from G-2, partial): possibly one small/late engagement if inbound appears: RM 2M – RM 5M.
- Total: **RM 3M – RM 8M**.

**Net contribution (ROM)**: **~ -RM 0.5M to +RM 4.5M** (wide, skewed low — depends entirely on unmanaged inbound).

**Pros**:

- ✅ Low cost; preserves the asset and optionality.
- ✅ Keeps the differentiator (conformance) alive.

**Cons**:

- ❌ ~40% of stakeholder goals met — no *committed* path to a reference operator (G-2 left to chance).
- ❌ Under-invests in the safety/observability + compliance evidence (G-3/G-5) operators require to buy — likely stalls at pilot.
- ❌ Revenue is opportunistic, not engineered; first-mover advantage likely lost.

**Stakeholder Impact**: G-1 ✅; G-2 ⚠️ partial; G-3 ❌; G-4 ✅; G-5 ⚠️ partial.

**Stakeholder Goals Met**: ~40%.

**Risks**: Reference deal never materialises; competitor wins the window; programme perceived as a research artefact, not a product.

---

### Option 2: Balanced — Productise + land first reference operator + sustain conformance (RECOMMENDED)

**Description**: Fund the full open-core-plus-private-adapter commercial motion: sustain conformance, complete the safety/observability + PDPA/NCII evidence operators require, deliver the private CAMARA adapter for one operator, and **commit to landing a first reference engagement to production** with reusable assets that de-risk a second.

**Scope**:

- Sustain 100% CTK with CI gating + versioned evidence (G-1).
- Reach **100% scoped agent identity, full agent telemetry, HITL on high-impact actions** (G-3) — converts the AI differentiator into something operators accept.
- Complete **approved DPIA, PII-safe telemetry, residency-conformant data, NCII attestation** (G-5) — clears the go-live gates.
- Deliver the first operator's private adapter + reusable manifests/runbooks (G-2, G-4 seam discipline).
- Build the conformance + compliance + reference case-study **sales assets**.

**Costs (3-year, ROM ±30%)**:

- Capital (build/productise): RM 4.5M – RM 7.0M
  - Core engineering (safety, telemetry, HITL, conformance gating): RM 2.0M – RM 3.0M
  - First-operator private adapter + integration: RM 1.0M – RM 2.0M
  - Compliance evidence (DPIA, NCII, residency, pen-test): RM 0.8M – RM 1.2M
  - Sales-asset productisation (runbooks, evidence packs, case study): RM 0.7M – RM 0.8M
- Operational (run, 3-year): RM 3.5M – RM 5.5M
  - Engineering + maintenance: RM 2.0M – RM 3.0M
  - AI-inference (cost-per-intent) + cloud/mesh run: RM 1.0M – RM 1.8M
  - Security/compliance sustainment: RM 0.5M – RM 0.7M
- **Total 3-year TCO: RM 8.0M – RM 12.5M**

**Benefits (3-year, ROM)** — each traces to a stakeholder goal:

| Benefit ID | Benefit Description | Stakeholder Goal | Type | Indicative 3-Year (RM, ROM) |
|------------|---------------------|------------------|------|------------------------------|
| B-1 | First operator SI engagement revenue (delivery + adapter) | G-2 | FINANCIAL | RM 6M – RM 10M |
| B-2 | Second operator from reference pattern (partial in window) | G-2 / O-2 | FINANCIAL | RM 3M – RM 6M |
| B-3 | Product / platform licensing + support (recurring) | G-1 / G-5 | FINANCIAL | RM 4M – RM 8M |
| B-4 | Open-core-driven pipeline acceleration + avoided sales cost | G-4 / O-4 | STRATEGIC | RM 2M – RM 3M |
| B-5 | Differentiation / risk-of-loss avoided (sustained conformance) | G-1 / O-1 | RISK | RM 1M – RM 1M |
| **Total** | | | | **RM 16M – RM 28M** |

**Commercial appraisal (indicative ROM — not NPV/BCR at this stage)**:

- 3-year net contribution: **RM +5M – RM +16M** (benefits minus TCO, pre-tax, undiscounted).
- Indicative payback: **~18–30 months from first operator go-live**.
- Indicative 3-year ROI on invested capital: **~60%–140%** (wide band; ROM only).

**Pros**:

- ✅ ~85% of stakeholder goals met (G-1…G-5 substantially).
- ✅ Captures the bulk of the commercial opportunity at moderate cost/risk.
- ✅ Builds the reusable reference that de-risks every subsequent engagement (the flywheel).
- ✅ Directly funds the controls that gate go-live (R-001/R-004/R-005), so risk reduction and revenue are the same spend.

**Cons**:

- ⚠️ Higher upfront investment than Options 0/1.
- ⚠️ Outcome depends on landing the first engagement (delivery risk R-012) and on operator/regulator acceptance (R-003).
- ⚠️ Change-management load on operator network teams (the principal resisters).

**Stakeholder Impact**: G-1 ✅; G-2 ✅; G-3 ✅; G-4 ✅; G-5 ✅.

**Stakeholder Goals Met**: ~85%.

**Risks** (with mitigations, from `ARC-001-RISK-v1.0`): R-001 unsafe autonomous change → phased autonomy + HITL + rollback; R-004/R-005 PDPA/NCII → gated go-live with DPIA + attestation; R-012 delivery slip → stable seam + front-loaded evidence; R-002/R-006 seam/conformance → CI gating + secret scanning.

---

### Option 3: Comprehensive — Multi-operator + live CAMARA + federation, accelerated

**Description**: Fund aggressively toward the full product roadmap now — live CAMARA integration (v3.0.0) and multi-operator federation (v4.0.0) capability built ahead of demand, plus parallel engagements with **both** U Mobile and TM concurrently.

**Scope**: Everything in Option 2, **plus** live CAMARA sandbox integration, federation architecture, and concurrent multi-operator delivery teams.

**Costs (3-year, ROM ±40%)**:

- Capital: RM 9M – RM 14M (federation + live integration built ahead of contracted demand)
- Operational: RM 6M – RM 9M (multiple concurrent delivery + run streams)
- Total 3-year TCO: **RM 15M – RM 23M**

**Benefits (3-year, ROM)**: RM 22M – RM 34M (higher ceiling, but a large fraction is **speculative** — depends on winning and delivering two operators concurrently plus federation demand that may not yet exist).

**Net contribution (ROM)**: **RM +7M – RM +11M** *typical*, but with **materially higher variance and downside** — heavy capital is committed ahead of contracted revenue; diminishing returns on federation built before there is multi-operator demand.

**Pros**:

- ✅ ~100% of stakeholder goals met; roadmap pulled forward.
- ✅ Highest revenue ceiling if everything lands.

**Cons**:

- ❌ Highest cost and cash-flow exposure; large spend ahead of contracted demand (federation pre-build).
- ❌ Concentration + delivery risk (R-012) multiplied across two concurrent operators with a lean org (R-016 key-person concentration).
- ❌ Over-engineering risk — builds v4.0.0 federation before a second operator is even live.

**Stakeholder Goals Met**: ~100% (but with disproportionate risk).

**Recommendation**: **Reject for now** — diminishing returns and cash-flow risk not justified before the first reference proves the model; revisit as a follow-on once Option 2 lands.

---

## B3. Recommended Option

**Recommendation**: **Option 2 — Balanced: productise + land first reference operator + sustain conformance.**

**Rationale**:

1. **Best risk-adjusted value**: highest net contribution per unit of risk/capital; Option 3's higher ceiling carries disproportionate downside (pre-built federation, concurrent delivery).
2. **Captures the opportunity**: directly funds the first reference operator (G-2) — the asset that de-risks the whole pipeline — unlike Options 0/1 which leave revenue to chance.
3. **Risk reduction and revenue are the same spend**: the Option 2 investment funds exactly the safety/telemetry/HITL (G-3) and PDPA/NCII (G-5) controls that gate go-live (R-001/R-004/R-005).
4. **Protects the monetisation mechanism**: sustains conformance (G-1) and seam integrity (G-4), the two things the commercial thesis depends on.
5. **Deliverable by a lean org**: one operator, sequenced gates — realistic for Vpnet's size; avoids the key-person overload Option 3 implies (R-016).

**Sensitivity (qualitative, ROM)**:

- *If first-engagement revenue is at the low end (RM 6M)*: net contribution still positive in the upper investment case only marginally; payback extends toward ~30 months. **Decision-sensitive — confirm engagement scope at OBC.**
- *If a second operator slips out of the window*: B-2 (RM 3M–6M) drops out; still net-positive at typical cost, payback lengthens.
- *If operator/regulator acceptance forces advisory-only autonomy (R-003)*: differentiation weakens; revenue band compresses — mitigated by phased-autonomy fallback (ship assist mode, expand on evidence).

> **Note on Green Book optimism bias**: a public-sector SOBC would add a standard cost uplift (e.g. +40%). As a **commercial** case, the equivalent discipline is applied via the **wide ROM ranges and the explicit downside in the sensitivity above**; a formal contingency/optimism uplift will be set at OBC against contracted scope.

---

# PART C: COMMERCIAL CASE

## C1. Commercialisation & Sourcing Strategy

> This is a **commercial venture**, so the Commercial Case addresses **how Vpnet brings ibn-core to market and sources what it needs to build/deliver it** — not a public-procurement route.

### C1.1 Market Assessment

**Market**: Malaysian telco OSS/BSS transformation and intent-based automation. Reference customers: **U Mobile, TM Malaysia**. Demand driver: operators standardising on TM Forum Open APIs to reduce proprietary lock-in (SD-5).

**Competitive landscape**:

- **Incumbent OSS/BSS vendors** — proprietary, high lock-in; ibn-core competes on standards-conformance, open-core transparency, and AI-native operation.
- **Generic automation / orchestration tooling** — not RFC 9315 / TMF921-conformant out of the box; ibn-core's verifiable CTK conformance is the wedge.
- **In-house operator builds** — possible, but cost/time-intensive; ibn-core offers a faster, evidenced, standards-based path.

> **Market-benchmark note**: No UK Tenders / procurement market-intelligence (TNDR/CMPT) artefact exists for this Malaysian commercial project; award-value benchmarks are therefore **not applicable** and none is cited. Engagement sizing in the Economic Case is ROM based on typical Malaysian telco transformation work (assumption A2), to be validated at OBC.

### C1.2 Go-to-Market & Sourcing Route

**Commercialisation model — Open Core**:

- **Public Apache 2.0 framework** → reach, credibility, lead generation, academic pull (Paper 1). Distributed openly; the published `McpAdapter` seam and `MockMcpAdapter` are public.
- **Private operator CAMARA adapters + SI engagements** → **the revenue mechanism**. Adapters, operator credentials, and pricing-sensitive logic stay in the private repo (PRIN P9, G-4) and are delivered under SI contract.
- **Product licensing + support** → recurring revenue on the framework + supported distribution.

**Sourcing (what Vpnet must acquire to build/deliver)**:

| Need | Route | Commercial Note |
|------|-------|-----------------|
| AI inference (Claude) | Commercial API (Anthropic) | Cost-per-intent is a first-class margin metric (NFR-P-002); single-provider dependency risk R-009 |
| Observability backend | LangSmith default; Canvas collector overridable | In-region collector for PDPA; LangSmith gated on DPIA (R-004/R-010) |
| Identity, mesh, store | Keycloak, Istio, Redis (OSS, Apache/permissive) | Apache-2.0-compatible only (PRIN, NFR-SEC-006) |
| Operator integration | Co-delivery with operator integration architects | Adapter delivery + SI; operator-side network/OSS access |

### C1.3 Contract Approach (operator engagements)

- **Build (adapter + integration)**: fixed-scope, milestone-based SI engagement per operator.
- **Run (support/licensing)**: recurring managed-support + licensing agreement; SLA per operator contract (availability, RTO/RPO per `ARC-001-REQ-v1.0` NFR-A).
- **IP / licensing**: public framework Apache 2.0; operator-specific adapter IP and credentials retained private (commercial value protection, R-002).
- **Key terms**: conformance + compliance evidence as contractual assurance; data residency + PDPA clauses; agent-safety/observability commitments as adoption enablers.

### C1.4 Commercial Differentiation & "Social"/Ecosystem Value

- **Differentiation**: verifiable 100% TMF921 CTK conformance + RFC 9315 traceability; AI-native operation that is safe and observable; transparent open-core licensing that reduces operator lock-in fear.
- **Ecosystem value (open-core)**: community contribution and scrutiny improve quality and reach at low marginal cost (O-4); academic citation reinforces credibility. The commercial equivalent of "social value" here is the **open-core public good** (a genuinely useful Apache 2.0 framework) sustained alongside the revenue model — provided open-washing is avoided (R-007).

---

# PART D: FINANCIAL CASE

> Commercial venture: this case addresses **investment envelope, funding, affordability, cash flow, and approval authority within Vpnet**, in RM. All figures are indicative ROM at SOBC stage.

## D1. Investment Requirement

**Total investment (preferred Option 2, 3-year ROM)**: **RM 8.0M – RM 12.5M**

### D1.1 Capital (build/productise) — ROM

| Item | Indicative 3-Year (RM, ROM) |
|------|------------------------------|
| Core engineering (safety, telemetry, HITL, conformance gating) | RM 2.0M – RM 3.0M |
| First-operator private adapter + integration | RM 1.0M – RM 2.0M |
| Compliance evidence (DPIA, NCII attestation, residency, pen-test) | RM 0.8M – RM 1.2M |
| Sales-asset productisation (runbooks, evidence packs, case study) | RM 0.7M – RM 0.8M |
| **Total Capital** | **RM 4.5M – RM 7.0M** |

### D1.2 Operational (run, 3-year) — ROM

| Item | Indicative 3-Year (RM, ROM) |
|------|------------------------------|
| Engineering + maintenance | RM 2.0M – RM 3.0M |
| AI-inference (cost-per-intent) + cloud/mesh run | RM 1.0M – RM 1.8M |
| Security / compliance sustainment | RM 0.5M – RM 0.7M |
| **Total OpEx** | **RM 3.5M – RM 5.5M** |

### D1.3 Total Cost of Ownership (3-year, ROM)

| | Indicative 3-Year (RM, ROM) |
|---|------------------------------|
| Capital | RM 4.5M – RM 7.0M |
| OpEx | RM 3.5M – RM 5.5M |
| **Total TCO** | **RM 8.0M – RM 12.5M** |

**Notes**: All figures in 2026 RM prices, ROM only, exclusive of tax. Optimism/contingency handled via ROM bands at SOBC; formal contingency set at OBC against contracted scope.

## D2. Funding Source

- **Primary**: Vpnet Cloud Solutions internal investment (retained earnings / SI margin reinvestment) phased over the build window.
- **Revenue offset**: first-operator SI revenue (B-1) begins offsetting OpEx from go-live; recurring licensing/support (B-3) builds thereafter.
- **Possible augmentation (to validate)**: Malaysian deep-tech / digital-economy grant or co-funding programmes, and/or operator co-investment in the reference engagement — *flagged as an assumption, not relied upon in the base case.*

**Funding gap**: A timing gap exists between capital outlay (Years 1–2) and revenue recognition (from first go-live, ~Q4 2026 onward). *Mitigation*: phase capital to engagement milestones; sequence the single operator before scaling (avoids Option 3's larger pre-revenue exposure).

## D3. Affordability

- **Context**: For a lean SI organisation, RM 8.0M–12.5M over three years is **material** and must be staged against revenue. *Assessment*: **Affordable if phased and gated to the first engagement**; not affordable as an all-upfront commitment — which is a further reason to prefer Option 2 over Option 3.
- **Cash-flow risk**: largest exposure is the pre-revenue build period (Years 1–2). *Mitigation*: milestone-staged spend; revenue-linked scaling; the first operator engagement partially self-funding from milestone payments.
- **Ongoing affordability (Year 3+)**: run-cost (engineering + AI inference + compliance) funded by recurring licensing/support + SI margin once ≥ 1 operator is live; AI-cost-per-intent actively managed as a margin lever (NFR-P-002, R-009).

## D4. Financial / Value-for-Money Appraisal

> NPV/BCR/IRR are **deferred to OBC** (per the configured Strategic-estimates appraisal depth). At SOBC the appraisal is the commercial ROM bands and the qualitative VfM below.

**Indicative commercial returns (ROM)**:

- 3-year net contribution: **RM +5M – RM +16M** (Option 2).
- Payback: **~18–30 months from first go-live**.
- 3-year ROI on invested capital: **~60%–140%** (wide ROM band).

**Value-for-Money (commercial) — qualitative**:

- **Economy**: leverages existing R&D (v2.0.1, 100% CTK) and OSS infrastructure (Apache-2.0 stack); incremental spend, not greenfield.
- **Efficiency**: open-core distribution generates pipeline at low marginal cost; one reference engagement seeds many.
- **Effectiveness**: ~85% of stakeholder goals met; directly converts credibility into recurring revenue.

**Overall VfM Rating**: **High** (subject to landing the first engagement) — the spend simultaneously buys revenue, the go-live-gating risk controls, and the reference asset.

---

# PART E: MANAGEMENT CASE

## E1. Governance

### E1.1 Roles & Responsibilities (RACI)

Derived from the decision-authority matrix in `ARC-001-STKE-v1.0`:

| Decision/Activity | Responsible | Accountable | Consulted | Informed |
|-------------------|-------------|-------------|-----------|----------|
| Overall venture success (this SOBC) | SI Delivery Lead | Lead Architect / CTO (SRO-equivalent) | EARB, Commercial, Finance | All stakeholders |
| Investment approval | Commercial Lead | Lead Architect / CTO | Finance | SI Delivery |
| Standards/conformance scope | Engineering Lead | Lead Architect / CTO | Operator IT, Academic audience | OSS Community |
| Open-core / private seam boundary | Lead Architect | Lead Architect / CTO | Commercial, Security | OSS Community, Engineering |
| Agent autonomy level (blast-radius gating) | Security / Compliance | Lead Architect / CTO | Operator Network Eng, Regulators | SI Delivery |
| Operator go-live (production sign-off) | SI Delivery Lead | Lead Architect / CTO | Operator Network Eng, Security, Operator IT | Commercial, Finance |
| Data-protection / PDPA decisions | Security / Compliance | Lead Architect / CTO | JPDP, Operator IT | SI Delivery |

**Senior Responsible Owner (commercial-equivalent)**: **Lead Architect / CTO (Roland Pfeifer)** — accountable for delivery, the NON-NEGOTIABLE principles, regulatory posture, and the investment outcome; chairs the EARB.

**Governance body**: **Vpnet Enterprise Architecture Review Board (EARB)** (the steering-committee equivalent) — scope, autonomy level, compliance gates, go-live, exceptions. Members: Lead Architect/CTO (chair), SI Delivery Lead, Security/Compliance Lead, Commercial Lead, Finance.

**Meeting frequency**: Weekly (delivery/engineering); monthly (commercial/finance + EARB review).

### E1.2 Approval / Stage Gates

| Gate | Criteria | Approving Body | Timing |
|------|----------|----------------|--------|
| **Gate 0: SOBC Approval** | Investment case approved; envelope + first-engagement target confirmed | Vpnet board / investment committee | 2026-Q2/Q3 |
| **Gate 1: Engagement scope confirmed** | First-operator scope contracted; requirements revalidated | Lead Architect/CTO + Commercial | 2026-Q3 |
| **Gate 2: Safety design sign-off** | Phased-autonomy + scoped identity + telemetry design accepted | EARB + Operator Network Eng | 2026-Q2/Q3 |
| **Gate 3: Compliance evidence** | Approved DPIA + NCII attestation + residency audit (G-5) | Security/Compliance + JPDP/NACSA paths | 2026-Q3 |
| **Gate 4: Production go-live** | Safety + PDPA + NCII gates passed; O2C validated in sandbox | EARB + operator sign-off | 2026-Q4 |
| **Gate 5: Benefits / OBC** | Steady-state metrics; refine to OBC with contracted actuals | EARB + Finance | 2027-Q1/Q2 |

## E2. Delivery Approach

**Methodology**: Agile, **agent-native** (context-first docs, ADRs, compliance evidence as versioned artefacts per `ARC-000-PRIN-v1.0`), with risk-gated stage gates above.

**Phases** (aligned to STKE Outcomes O-1…O-4 timeline):

1. **Q2 2026** — Conformance CI gating + evidence pipeline; 100% scoped agent identity + telemetry coverage; sandbox integration + safety design sign-off.
2. **Q3 2026** — DPIA + NCII attestation; HITL on high-impact actions; first-operator adapter + pre-production validation; regulator briefings.
3. **Q4 2026** — Production go-live; steady-state O2C metrics; reference case study.
4. **2027+** — Second operator from the reference pattern; revisit Option-3 roadmap items (live CAMARA v3.0.0, federation v4.0.0) on evidenced demand.

**Delivery model**: In-house core engineering + SI delivery (Vpnet); co-delivery with operator integration architects; private-adapter engineering across the seam.

## E3. Key Milestones

| Milestone | Target | Dependencies | Owner |
|-----------|--------|--------------|-------|
| SOBC approval (this document) | 2026-Q2/Q3 | Stakeholder + risk analysis complete | Lead Architect/CTO |
| Investment envelope confirmed | 2026-Q3 | SOBC approval | Commercial / Finance |
| First-operator engagement contracted | 2026-Q3 | Commercial close | SI Delivery Lead |
| 100% scoped agent identity + telemetry (G-3) | 2026-Q2 | Telemetry bootstrap; Keycloak realm | Security/Compliance |
| Approved DPIA + NCII attestation (G-5) | 2026-Q3 | Residency audit; pen-test | Security/Compliance |
| Sandbox O2C validated + safety sign-off | 2026-Q3 | Adapter readiness; operator access | SI Delivery + Operator Network Eng |
| **First operator GO-LIVE (G-2)** | **2026-Q4** | All gates passed | SI Delivery Lead |
| Reference case study published | 2026-Q4 | Go-live + steady state | Commercial |
| OBC (refined, contracted costs) | 2027-Q1/Q2 | Go-live + actuals | Lead Architect/CTO + Finance |

**Critical path**: agent-safety/telemetry (G-3) → compliance evidence (G-5) → sandbox safety sign-off → operator go-live (G-2). CI restoration (Actions billing) sits upstream of the conformance/seam gates (G-1/G-4, R-002/R-006).

## E4. Resource Requirements

**Core team (Vpnet, indicative)**: Lead Architect/CTO (part-time, accountable); ibn-core engineering (framework + AI runtime); private-adapter engineering; SI delivery lead + engineers; Security/Compliance lead; Commercial + Finance part-time.

**Skills**: RFC 9315 / TMF921 standards depth (available — concentrated, R-016); AI-agent + MCP engineering (available); operator CAMARA/OSS integration (co-sourced with operator); PDPA/NCII compliance (Security/Compliance).

**Key constraint**: lean org with **key-person concentration on Lead Architect/CTO and Security/Compliance** (R-016) — mitigated by agent-native, context-first documentation; cross-training on seam + conformance gates is an explicit action.

## E5. Change Management

### E5.1 Stakeholder Engagement (from `ARC-001-STKE-v1.0`)

| Stakeholder | Power-Interest | Approach | Frequency | Owner |
|-------------|----------------|----------|-----------|-------|
| Operator Network Eng | High-High | Manage closely — joint design reviews, live telemetry, HITL on high-impact | Bi-weekly | SI Delivery |
| Operator IT / Procurement | High-High | Manage closely — conformance evidence packs, commercial reviews | Per checkpoint | Commercial |
| MCMC / JPDP / NACSA | High-Med | Keep satisfied — evidence-backed regulatory briefings, attestations | Go-live + quarterly | Security/Compliance |
| OSS Community | Med-High | Keep informed — public roadmap, CONTRIBUTING, transparent seam rationale | Per release | Engineering |
| Vpnet Commercial/Finance | High-Med | Keep satisfied — revenue + margin (AI-cost-per-intent) checkpoints | Monthly | Lead Architect/CTO |

### E5.2 Resistance Management (from STKE conflict analysis)

| Source | Reason | Impact | Mitigation |
|--------|--------|--------|------------|
| Operator Network Engineering | Institutional caution about autonomous changes to live national infra | High | Phased autonomy by blast radius; full observability; reversibility; HITL — earn trust with evidence, not assertion (resolves STKE Conflict 2) |
| OSS Community | Perceived open-washing (thin public shell) | Medium | Keep the public core substantive; publish seam-boundary rationale; welcome contributions (R-007) |
| Speed-vs-compliance tension | Commercial pressure to go live before evidence | Medium-High | Treat compliance/safety gates as the *definition of "done"* for go-live, not a parallel track (resolves STKE Conflict 3) |

**Change champions**: Lead Architect/CTO and SI Delivery Lead (direct beneficiaries of the reference engagement).

## E6. Benefits Realisation

| Benefit | Stakeholder Goal | Measure | Owner | When |
|---------|------------------|---------|-------|------|
| B-1/B-2 SI engagement revenue | G-2 / O-2 | Contracted + recognised SI revenue; engagements live | SI Delivery Lead / Commercial | From Q4 2026 |
| B-3 Recurring licensing/support | G-1 / G-5 | Recurring revenue; supported deployments | Commercial | 2027+ |
| B-4 Pipeline acceleration | G-4 / O-4 | Inbound + qualified pipeline; avoided sales cost | Commercial | Ongoing |
| B-5 Differentiation sustained | G-1 / O-1 | CTK pass rate per release; procurement citations | Lead Architect/CTO | Per release |

**Monitoring**: EARB reviews benefits RAG monthly; conformance per release; production O2C fulfilment continuously; AI-cost-per-intent as a margin metric. Formal benefits review at the OBC point (2027-Q1/Q2).

## E7. Risk Management

### E7.1 Top Strategic Risks (from `ARC-001-RISK-v1.0`, Orange Book discipline; commercial-telco Medium appetite)

| Risk ID | Risk Description | Residual | Appetite | Mitigation (summary) | Owner |
|---------|------------------|----------|----------|----------------------|-------|
| R-001 | Autonomous agent makes unsafe change to live operator network | 12 | 9 | Phased autonomy; scoped identity; circuit breakers; **HITL on high-impact**; rollback — go-live gate | Lead Architect / Operator Network liaison |
| R-005 | NCII cyber-resilience gap on telco critical infrastructure | 12 | 9 | Defence-in-depth; dependency/code scanning; pen-test; **NCII attestation** — go-live gate | Security/Compliance |
| R-004 | Subscriber PII breach under PDPA 2010 | 9 | 6 | Fail-closed PII masking; in-region telemetry; **approved DPIA** — go-live gate | Security/Compliance |
| R-002 | Operator credentials / proprietary logic leak into public repo | 9 | 6 | Private-repo isolation; CI secret scanning; seam-review checklist | Lead Architect/CTO |
| R-006 | TMF921 CTK conformance regression ships undetected | 9 | 6 | CTK as hard merge gate; versioned evidence; immutable cited tags | Lead Architect/CTO |
| R-008 | Agent runs under over-privileged / human identity | 9 | 6 | Least-privilege agent role; deny-by-default; negative tests; audit attribution | Security Lead |
| R-012 | First operator engagement misses go-live (SI delivery) | 8 | 12 | Stable seam (no breaking `McpAdapter` changes); reusable assets; front-loaded evidence | SI Delivery Lead |
| R-003 | Operators/regulators reject autonomous operation outright | 6 | 12 | Evidence-led phasing; **fallback to advisory/assist mode**, expand on evidence | Lead Architect/CTO |
| R-009 | Claude / LangSmith supply-chain disruption | 6 | 12 | Timeout/retry/graceful degradation; cost-per-intent tracked; model-migration path | Engineering Lead |
| R-016 | Key-person concentration (Lead Architect + Security) | 4 | 12 | Agent-native context-first docs; cross-training on seam + gates | Lead Architect/CTO |

**Commercial risk appetite (adapted)**: Medium overall (residual ≤ 12), tightened to ≤ 6 on COMPLIANCE/data-protection and ≤ 9 on safety-of-live-network. **Six residual risks exceed the tightened appetite (R-001, R-002, R-004, R-005, R-006, R-008); all are go-live-gating and none is residual Critical.** This is expected for a pre-production, AI-native, regulated-telco venture and is the explicit basis for **gating** first operator go-live rather than blocking the investment.

### E7.2 Risk Mitigation Summary

- **Go-live-gating (treat, urgent)**: R-001, R-005, R-004 — no production without operator safety sign-off, approved DPIA, and NCII attestation.
- **Cheapest high-leverage controls**: CI secret-scanning + CTK gating (R-002, R-006) — non-negotiable merge gates (restoration of CI billing is the upstream dependency).
- **Commercial-thesis protection**: seam integrity (R-002) and conformance (R-006) protect the monetisation mechanism itself.
- **Built-in fallbacks**: R-003 (advisory mode) and R-009 (non-critical telemetry) carry Tolerate fallbacks, preserving the engagement under stress.

---

# PART F: RECOMMENDATION & NEXT STEPS

## F1. Summary of Recommendation

**Recommended Option**: **Option 2 — Balanced: productise + land first reference operator + sustain conformance.**

**Investment**: RM 8.0M – RM 12.5M over 3 years (indicative ROM).

**Expected Return**: RM 16M – RM 28M gross contribution; net RM +5M – RM +16M (ROM); payback ~18–30 months from first go-live.

**Stakeholder Goals Met**: ~85% (G-1…G-5).

**Risks**: Manageable and **gated** — six appetite-exceeding residual risks are go-live-gating, none residual Critical.

**Affordability**: Affordable **if phased and gated** to the first engagement (a key reason to prefer Option 2 over Option 3).

**Go/No-Go Recommendation**: **PROCEED** to the engagement-scoping and OBC phase on the Option 2 path.

## F2. Conditions for Approval

**Mandatory conditions**:

1. Investment envelope (RM 8.0M–12.5M ROM, staged) confirmed by the Vpnet board / investment committee.
2. A credible first-operator engagement target (U Mobile or TM) identified and a path to contracting it.
3. Lead Architect/CTO confirmed as accountable SRO-equivalent; EARB convened as the governance body.
4. Go-live explicitly conditioned on the safety (R-001), PDPA (R-004), and NCII (R-005) gates.

**Recommended conditions**:

1. CI restored to reliable gating (resolves the upstream dependency for R-002/R-006 and G-1).
2. Cross-training plan to reduce key-person concentration (R-016).
3. A documented downside plan (advisory-mode fallback, R-003) accepted up front.

## F3. Next Steps if Approved

1. **Confirm investment + engagement target** (board/investment committee) — 2026-Q3.
2. **Revalidate engagement-specific requirements** against `ARC-001-REQ-v1.0`; run `/arckit:requirements` only where engagement scope adds detail — 2026-Q3.
3. **Progress the commercial route**: first-operator SI **SOW** (`/arckit:sow`) for adapter delivery + integration — 2026-Q3.
4. **Develop the OBC** with firmer, contracted costs once the first engagement scope is fixed — 2027-Q1/Q2.
5. **Drive the go-live gates** (G-3 → G-5 → safety sign-off → G-2) per the Management Case milestones — through 2026-Q4.

## F4. Next Steps if Not Approved

1. **Understand objections**: Lead Architect/CTO reviews concerns with the investment committee (cost band, first-engagement certainty, or risk gating).
2. **Revise**: fall back toward **Option 1 (Minimal)** to preserve the asset and optionality at lower spend, or re-scope Option 2 to a smaller initial engagement.
3. **Re-submit** a revised SOBC.

**Do-Nothing consequences (Option 0)**: ~10% of commercial goals met; no recurring revenue; operator procurement window and first-mover reference advantage forfeited; prior R&D unmonetised.

---

# APPENDICES

## Appendix A: Stakeholder Analysis

**Source**: `projects/001-ibn-core-my/ARC-001-STKE-v1.0.md`

**Summary**: 12 drivers (SD-1…SD-12) → 5 goals (G-1…G-5) → 4 outcomes (O-1…O-4). Overall alignment MEDIUM, with two structural conflicts actively managed (open transparency vs. commercial seam; AI autonomy vs. regulator/operator risk appetite). Key stakeholders: Lead Architect/CTO, SI Delivery Lead, Operator Network Eng (U Mobile/TM), Operator IT/Procurement, Security/Compliance, MCMC/JPDP/NACSA, OSS community, academic audience.

## Appendix B: Architecture Principles

**Source**: `projects/000-global/ARC-000-PRIN-v1.0.md`

**Relevant (NON-NEGOTIABLE)**: P3 Standards Conformance (underpins the differentiator and G-1); P4 Security / zero-trust + agent identity (G-3, R-005/R-008); P9 Open-Core / Proprietary Seam Integrity (the monetisation mechanism, G-4, R-002).

## Appendix C: Options Analysis Details

Detailed ROM cost/benefit bands per option are in Part B. **Assumptions register**: A1 (operator-to-production timing), A2 (SI scale/day-rates), A3 (seam integrity), A4 (operator/regulator acceptance) — all flagged ROM, to be refined at OBC.

## Appendix D: Benefits Calculation

Benefits B-1…B-5 (Part B2, Option 2) each trace to a stakeholder goal. All figures are indicative ROM ranges, not contracted; NPV/BCR/IRR deferred to OBC per the configured Strategic-estimates appraisal depth. Sensitivity is qualitative at this stage (Part B3).

## Appendix E: Risk Register

**Full register**: `projects/001-ibn-core-my/ARC-001-RISK-v1.0.md` (16 risks, Orange Book discipline, commercial-telco Medium appetite, 4Ts). Top risks summarised in Part E7.

## Appendix F: Market Research

No UK Tenders / procurement market-intelligence (TNDR/CMPT) artefact exists for this Malaysian commercial venture; award-value benchmarks are not applicable. Competitive context (incumbent OSS/BSS vs. standards-based open-core AI-native positioning) is in Part C1.1.

## Appendix G: Governance Terms of Reference

**EARB (steering-committee equivalent)**: Lead Architect/CTO (chair), SI Delivery Lead, Security/Compliance Lead, Commercial Lead, Finance. Decisions: scope, autonomy level, compliance gates, go-live, exceptions. Escalation: L1 SI/Engineering Lead → L2 EARB → L3 Lead Architect/CTO (NON-NEGOTIABLE principles, regulatory posture, strategic conflicts).

## Appendix H: Glossary

| Term | Definition |
|------|------------|
| SOBC | Strategic Outline Business Case — first-stage investment case with high-level ROM estimates |
| OBC | Outline Business Case — refined costs after engagement scope is fixed |
| FBC | Full Business Case — final case with contracted costs |
| 5-case model | HM Treasury Green Book structure: Strategic / Economic / Commercial / Financial / Management (used here as a discipline for a commercial venture) |
| ROM | Rough Order of Magnitude — indicative estimate, wide tolerance |
| IBN | Intent-Based Networking (RFC 9315) |
| CTK | TMF921 Conformance Test Kit |
| SI | Systems Integration (engagement-based delivery + revenue) |
| Open core | Public Apache 2.0 framework + private monetisable adapters |
| EARB | Vpnet Enterprise Architecture Review Board (governance body) |
| PDPA / NCII | Malaysia Personal Data Protection Act 2010 / National Critical Information Infrastructure (NACSA) |
| RM | Malaysian Ringgit |

---

## Document Approval

| Name | Role | Signature | Date |
|------|------|-----------|------|
| Roland Pfeifer | Lead Architect / CTO (SRO-equivalent) | | |
| PENDING | Commercial Lead | | |
| PENDING | Finance | | |
| PENDING | Security / Compliance Lead | | |

**Approval Decision**: APPROVED | APPROVED WITH CONDITIONS | REJECTED | DEFERRED

**Conditions** (if any): per Part F2.

**Approval Date**: PENDING

**Next Review Date**: At OBC development (2027-Q1/Q2) or 6 months post-approval, whichever is sooner.

---

**END OF STRATEGIC OUTLINE BUSINESS CASE**

*Document created using ArcKit `/arckit:sobc` command*
*Template version: 1.0*
*Green Book 5-case model applied as a structuring discipline for a commercial venture (not a public-sector spending proposal)*

## External References

> This section provides traceability from generated content back to source documents.

### Document Register

| Doc ID | Filename | Type | Source Location | Description |
|--------|----------|------|-----------------|-------------|
| INT-STKE | ARC-001-STKE-v1.0.md | Stakeholder Analysis | projects/001-ibn-core-my/ | Drivers, goals, outcomes, RACI, conflicts — benefit basis |
| INT-RISK | ARC-001-RISK-v1.0.md | Risk Register | projects/001-ibn-core-my/ | 16 risks, appetite, 4Ts — Management Case risks |
| INT-REQ | ARC-001-REQ-v1.0.md | Requirements | projects/001-ibn-core-my/ | Scope, NFRs, integrations — Strategic/Commercial scope |
| INT-PRIN | ARC-000-PRIN-v1.0.md | Architecture Principles | projects/000-global/ | NON-NEGOTIABLE principles — strategic alignment |

> All sources above are **internal ArcKit artefacts**, not external third-party documents. No external budget/market documents were provided (`projects/000-global/external/` and `policies/` are empty); all financial figures are indicative ROM assumptions generated for this SOBC, to be refined at OBC.

### Citations

| Citation ID | Doc ID | Page/Section | Category | Quoted Passage |
|-------------|--------|--------------|----------|----------------|
| — | — | — | — | — |

### Unreferenced Documents

| Filename | Source Location | Reason |
|----------|-----------------|--------|
| — | — | — |

---

**Generated by**: ArcKit `/arckit:sobc` command
**Generated on**: 2026-06-05
**ArcKit Version**: 5.11.0
**Project**: ibn-core-my (Project 001)
**Model**: Claude Opus 4.8 (1M context)
