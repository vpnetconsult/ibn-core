# UAE AI Charter Compliance Assessment

> **Template Origin**: Community | **ArcKit Version**: 5.11.0 | **Command**: `/arckit:uae-ai-charter`

## Document Control

| Field | Value |
|-------|-------|
| **Document ID** | ARC-003-AICH-v1.0 |
| **Document Type** | UAE AI Charter Compliance Assessment |
| **Project** | ibn-core UAE (Project 003) |
| **Classification** | Confidential |
| **Status** | DRAFT |
| **Version** | 1.0 |
| **Created Date** | 2026-06-08 |
| **Last Modified** | 2026-06-08 |
| **Review Cycle** | Quarterly |
| **Next Review Date** | 2026-09-08 |
| **Owner** | AI Governance Lead, Vpnet Cloud Solutions Sdn. Bhd. |
| **Reviewed By** | [PENDING] |
| **Approved By** | [PENDING] |
| **Distribution** | UAE RFP evaluation panel; AI governance forum |
| **Federal Entity** | Vpnet Cloud Solutions Sdn. Bhd. (supplier) |
| **Cabinet Instrument cited** | UAE Charter for the Development & Use of Artificial Intelligence |
| **Sovereign Cloud Region** | Per deployment; LLM inference via Anthropic (USA) on masked data only |
| **AI Autonomy Tier** | Tier 1 — restricted copilot (bounded autonomy) |

## Revision History

| Version | Date | Author | Changes | Approved By | Approval Date |
|---------|------|--------|---------|-------------|---------------|
| 1.0 | 2026-06-08 | ArcKit AI | Initial UAE baseline from `/arckit:uae-ai-charter`, grounded in ibn-core AI alignment plan + UC006 traces | [PENDING] | [PENDING] |

## Executive Summary

ibn-core is an **AI-native** system: a deliberately **restricted, LLM-based GenAI agent** (copilot pattern) that uses Claude (`claude-sonnet-4-20250514`) to translate natural-language customer intents into TMF921 service actions (`docs/architecture/AI_AGENT_ALIGNMENT_PLAN.md`). It embeds several UAE AI Charter principles by construction: **bounded autonomy** (the agent cannot act outside TMF921 lifecycle states or exceed authorised remediation), **privacy & safety** (PII masked before the model sees data; prompt-injection detection; tool-policy deny; input sanitisation), and **transparency/accountability** (OpenTelemetry `gen_ai.*` spans and AI-Gateway decision events). These are demonstrated end-to-end by the UC006 adversarial traces: DLP redaction (B), tool-policy deny (C), and prompt-injection block (D).

The principal Charter gaps are **fairness** — the agent personalises pricing and promotional discounts by customer segment but **no bias / fairness assessment exists** (fairness monitoring planned Q1 2026) — and **human oversight**, where no explicit human-in-the-loop approval, escalation path, or named accountable officer is yet documented. Telemetry is also **off by default** (`OTEL_ENABLED`), weakening the transparency control unless enabled in deployment.

> **Baseline note:** This is the UAE reference assessment. The Malaysia equivalent (ARC-001-AIGE, MOSTI/NAIO seven principles) was derived from this pattern — the shared gaps are fairness/bias testing, the human-in-the-loop gate, telemetry-on, and the agent-step reasoning trace; only the principles framework (UAE AI Charter vs MOSTI AIGE) and oversight body differ.

## AI Use-Case Summary & Risk Posture

| Item | Detail |
|------|--------|
| What the AI does | Translates NL customer intent → intent tags/product needs (`analyzeIntent`) and a product/bundle/pricing/discount offer (`generateOffer`), `src/claude-client.ts`; model `claude-sonnet-4-20250514` |
| Decisions it influences | Product recommendations, bundle selection, **pricing strategy and promotional discounts** per customer segment |
| Autonomy | **Tier 1 — restricted / bounded**: cannot act outside TMF921 states or exceed RFC 9315 §5.2.3 remediation; auth-required; rate-limited; PII-masked |
| Charter risk posture | Commercial recommendation/pricing influence; not safety-critical; human principal (copilot) |

## AI Charter Principles Assessment

| Charter principle | How met | Gap | Action |
|-------------------|---------|-----|--------|
| **Fairness & non-bias** | Segment-based personalisation exists | **No bias/fairness testing** of pricing/discount differentiation | Build fairness monitoring (planned Q1 2026); document non-discrimination |
| **Safety, security & robustness** | Prompt-injection detection (50+ patterns, auto-block HIGH); tool-policy deny (trace C → 403); input sanitisation/NFKC; deterministic TMF921 `reportState` checks | MEDIUM/LOW injections detected but **not auto-blocked by default** | Enable MEDIUM blocking in deployment |
| **Privacy** | PII masked **before** LLM call (trace B `dlp.redactions.count: 2`); telemetry secret hygiene (`redactHeaders`) | DPA with Anthropic unsigned (see ARC-003-PDPL) | Sign DPA; keep masking gate default-deny |
| **Transparency & explainability** | OTel `gen_ai.*` spans capture prompt + completion; `rfc9315.phase` tags; `ai_gateway.*` per-decision audit | **Telemetry off by default** (`OTEL_ENABLED`); **no agent-step reasoning trace** (Phase 3) | Enable telemetry in prod; ship `AgentTrajectory` |
| **Human oversight & accountability** | Bounded autonomy; tool-policy role gate; auth-required; owner = Vpnet Cloud Solutions Sdn. Bhd. | **No explicit human-in-the-loop approval, escalation path, or named accountable officer** | Define HITL gate + accountable AI officer |
| **Human benefit & wellbeing** | Makes telecom service fulfilment accessible via NL ("I need internet at home" → fulfilled offer) | No broader wellbeing objective stated | Document benefit + safeguards in service design |

## Human Oversight

Current design is a **copilot pattern** with a human principal and bounded autonomy — the agent is explicitly *restricted*, and privileged tools are role-gated (trace C denies a `customer` role calling `cancel_service`). However, **no documented human-in-the-loop approval step or escalation workflow** exists for high-impact offers (e.g. large discounts). **Action:** define an approval threshold and escalation path before production.

## Accountability

Owner: Vpnet Cloud Solutions Sdn. Bhd. Bounded-autonomy constraints are enforced in code and demonstrated in traces. **To close:** name an accountable AI officer, stand up an AI governance forum, and add the HITL approval gate.

## Risks

| Risk | Likelihood | Impact | Treatment |
|------|-----------|--------|-----------|
| Discriminatory pricing/offers (no fairness testing) | Medium | High | Fairness monitoring + non-discrimination policy |
| AI decision not auditable (telemetry off in prod) | Medium | Medium | Enforce `OTEL_ENABLED=true`; ship agent trajectory |
| MEDIUM-severity injection not blocked | Low | Medium | Enable MEDIUM blocking; tune thresholds |
| No human override on high-value offers | Medium | Medium | HITL approval threshold |

## External References

### Document Register

| Doc ID | Title | URL / Path | Verified date |
|--------|-------|-----------|---------------|
| UAE-AICH | UAE Charter for the Development & Use of Artificial Intelligence | <https://u.ae/en/about-the-uae/digital-uae/artificial-intelligence> | 2026-06-08 |
| IBN-AAP | ibn-core AI Agent Alignment Plan | docs/architecture/AI_AGENT_ALIGNMENT_PLAN.md | 2026-06-08 |
| IBN-PI | ibn-core prompt-injection detection | src/prompt-injection-detection.ts | 2026-06-08 |
| IBN-UC006 | UC006 adversarial traces (DLP / tool-policy / injection) | docs/compliance/uc006-sample-trace-{B,C,D}*.json | 2026-06-08 |

### Citations

| Citation | Doc ID | Section | Used in |
|----------|--------|---------|---------|
| [AICH-1] | UAE-AICH | Charter principles | AI Charter Principles Assessment |
| [E-1] | IBN-AAP | Restricted agent; constraints; gap analysis | Use-Case; Accountability |
| [E-2] | IBN-UC006 | Traces B/C/D | Safety; Privacy; Transparency |
| [E-3] | IBN-PI | Pattern tiers; auto-block HIGH | Safety, security & robustness |

### Unreferenced Documents

None.

---

**Generated by**: ArcKit `/arckit:uae-ai-charter` command · **Generated on**: 2026-06-08 · **ArcKit Version**: 5.11.0 · **Project**: ibn-core UAE (003) · **Model**: claude-opus-4-8

> ⚠️ Community-contributed command — review by qualified UAE AI-governance counsel before reliance.
