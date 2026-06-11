# EU AI Act Compliance Assessment

> **Template Origin**: Community | **ArcKit Version**: 5.11.0 | **Command**: `/arckit:eu-ai-act`

## Document Control

| Field | Value |
|-------|-------|
| **Document ID** | ARC-002-AIACT-v1.0 |
| **Document Type** | EU AI Act (Regulation (EU) 2024/1689) Compliance Assessment |
| **Project** | ibn-core EU (Project 002) |
| **Classification** | OFFICIAL-SENSITIVE |
| **Status** | DRAFT |
| **Version** | 1.0 |
| **Created Date** | 2026-06-06 |
| **Last Modified** | 2026-06-06 |
| **Review Cycle** | Quarterly |
| **Next Review Date** | 2026-09-06 |
| **Owner** | AI Governance Lead, Vpnet Cloud Solutions Sdn. Bhd. |
| **Reviewed By** | [PENDING] |
| **Approved By** | [PENDING] |
| **Distribution** | EU RFP evaluation panel; AI governance forum |

## Revision History

| Version | Date | Author | Changes | Approved By | Approval Date |
|---------|------|--------|---------|-------------|---------------|
| 1.0 | 2026-06-06 | ArcKit AI | Initial creation from `/arckit:eu-ai-act`, grounded in ibn-core AI alignment plan + UC006 traces | [PENDING] | [PENDING] |

## Executive Summary

ibn-core is a **restricted, LLM-based GenAI agent** (copilot pattern) using Claude (`claude-sonnet-4-20250514`) to translate natural-language telecom intents into TMF921 offers. Under the EU AI Act, ibn-core is a **deployer (and provider of an AI system that integrates a third-party GPAI model)**. Its use case — commercial product recommendation/pricing for telecom services — is assessed as **Limited Risk**, triggering primarily **Article 50 transparency** obligations plus voluntary alignment to high-risk-style risk-management good practice (which ibn-core largely already meets via its guardrails).

## 1. Role & Risk Classification

| Question | Assessment |
|----------|------------|
| Role | **Deployer** + provider of an AI system embedding a **GPAI** model (Claude); Anthropic is the GPAI provider |
| Prohibited practices (Art. 5) | **None** — no social scoring, subliminal manipulation, biometric categorisation, or untargeted scraping |
| High-risk (Annex III)? | **No** — commercial telecom offer recommendation is not an Annex III category (not biometric, not critical-infrastructure safety, not access to *essential* services determination, not employment/education) |
| Risk tier | **Limited Risk** → Article 50 transparency obligations |
| GPAI considerations | Uses a third-party GPAI model under contract; rely on provider's GPAI obligations + own DPA |

## 2. Article 50 Transparency Obligations

| Obligation | Status | Evidence / Action |
|-----------|--------|-------------------|
| Inform users they are interacting with an AI system | **Gap** | Add explicit AI-interaction disclosure in the customer journey |
| Mark AI-generated/assisted output where applicable | Partial | Intent rationale surfaced in response; formalise labelling |

## 3. Voluntary Risk-Management Alignment (already met in large part)

| Area | Evidence |
|------|----------|
| **Risk management & guardrails** | Prompt-injection detection (50+ patterns, auto-block HIGH; `prompt-injection-detection.ts`); tool-policy deny (trace C, `TP-ADMIN-ONLY-009` → 403); input sanitisation/NFKC |
| **Data governance** | PII masked before inference (trace B `dlp.redactions`); no Art. 9 special-category data |
| **Technical documentation & logging** | OTel `gen_ai.*` spans capture prompt + completion; `rfc9315.phase` tags; `ai_gateway.*` per-decision audit events |
| **Human oversight** | Bounded autonomy (restricted agent; cannot exceed TMF921 states / authorised remediation); role-gated privileged tools |
| **Accuracy / robustness** | Deterministic TMF921 `reportState` checks; DoS input-length guard |

## 4. Gaps

| Gap | Action |
|-----|--------|
| **Art. 50 AI-interaction disclosure** not implemented | Add user-facing AI disclosure |
| **No fairness/bias assessment** of segment-based pricing/discounts | Conduct bias evaluation; document non-discrimination |
| **Telemetry off by default** (`OTEL_ENABLED`) | Enforce-on in production for auditability |
| **No agent-step reasoning trace** (Phase 3) | Ship `AgentTrajectory` |
| **No human-in-the-loop approval** for high-value offers | Define approval threshold + escalation |
| **AI literacy (Art. 4)** | Provide staff/operator AI-literacy measures |

## 5. Risk Register

| Risk | Likelihood | Impact | Treatment |
|------|-----------|--------|-----------|
| Non-disclosure of AI interaction (Art. 50) | Medium | Medium | Add disclosure UI |
| Discriminatory pricing (no fairness testing) | Medium | High | Fairness monitoring + policy |
| Mis-tiering as low-risk if scope expands to access decisions | Low | High | Re-assess if used to gate essential-service access |

## External References

| Doc ID | Title | URL / Path | Verified |
|--------|-------|-----------|----------|
| EU-AIACT | Regulation (EU) 2024/1689 (AI Act) | <https://eur-lex.europa.eu/eli/reg/2024/1689/oj> | 2026-06-06 |
| IBN-AAP | ibn-core AI Agent Alignment Plan | docs/architecture/AI_AGENT_ALIGNMENT_PLAN.md | 2026-06-06 |
| IBN-UC006 | UC006 adversarial traces (DLP / tool-policy / injection) | docs/compliance/uc006-sample-trace-{B,C,D}*.json | 2026-06-06 |

---

**Generated by**: ArcKit `/arckit:eu-ai-act` · **Generated on**: 2026-06-06 · **ArcKit Version**: 5.11.0 · **Project**: ibn-core EU (002) · **Model**: claude-opus-4-8

> ⚠️ Community-contributed command — verify risk classification against current AI Act guidance before reliance.
