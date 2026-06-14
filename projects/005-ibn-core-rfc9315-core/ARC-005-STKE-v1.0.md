# Stakeholder Drivers & Goals Analysis: ibn-core RFC 9315 Layer-Agnostic Core

> **Template Origin**: Official | **ArcKit Version**: 5.11.0 | **Command**: `/arckit:stakeholders`

## Document Control

| Field | Value |
|-------|-------|
| **Document ID** | ARC-005-STKE-v1.0 |
| **Document Type** | Stakeholder Drivers & Goals Analysis |
| **Project** | ibn-core-rfc9315-core (Project 005) |
| **Classification** | PUBLIC |
| **Status** | DRAFT |
| **Version** | 1.0 |
| **Created Date** | 2026-06-14 |
| **Last Modified** | 2026-06-14 |
| **Review Cycle** | Monthly (active design) |
| **Review Date** | 2026-07-14 |
| **Owner** | Roland Pfeifer, Lead Architect (Vpnet Cloud Solutions Sdn. Bhd.) |
| **Reviewed By** | [PENDING] |
| **Approved By** | [PENDING] |
| **Distribution** | Vpnet Architecture Review Board, ibn-core engineering, business-intent-agent engineering, resource-intent-agent engineering |

> **Subject type note**: ibn-core is a **commercial open-source** programme (Apache-2.0). UK-Government digital/security governance roles (GovS 005 SRO/Service Owner/CDDO; GovS 007 SSRO/SIRO) are **not applicable**; the governance analogue is the Vpnet Architecture Review Board and the engineering leads. Classification **PUBLIC**.

## Revision History

| Version | Date | Author | Changes | Approved By | Approval Date |
|---------|------|--------|---------|-------------|---------------|
| 1.0 | 2026-06-14 | ArcKit AI | Initial creation from `/arckit:stakeholders` command; closes the STKE gap flagged in `ARC-005-REQ` and `ARC-005-ADR-001` | [PENDING] | [PENDING] |

---

## Executive Summary

### Purpose

Identifies the stakeholders of the RFC 9315 core-extraction (Project 005), their underlying drivers, the goals those drivers produce, and the measurable outcomes that satisfy them — with full Driver → Goal → Outcome traceability to `ARC-005-ADR-001` and `ARC-005-ROAD-v1.0`.

### Key Findings

The goal (one layer-agnostic core, two peers) is broadly supported, but **the benefit and the risk fall on different teams**: the resource team, future domains, and the architect gain; the **business-intent (BSS) team bears the extraction risk** to its TMF921-conformant service while gaining little short-term. The single most important alignment lever is the **CTK-parity gate** that makes "we will not break BSS" an enforced promise, not a hope.

### Critical Success Factors

- BSS runs on the extracted core with **TMF921 CTK 83/83 preserved** (the trust anchor for the BSS team and the ARB).
- The RFC 9315 fidelity conditions (D-1…D-4) are honoured, not traded away under delivery pressure.
- The v3.0.0 breaking change ships responsibly (beta + migration guide; cited tags immutable) so consumers aren't stranded.

### Stakeholder Alignment Score

**Overall Alignment**: **MEDIUM-HIGH**

Strong agreement on the destination; the live tension is the BSS team absorbing risk for others' benefit, plus the breaking-change burden on external consumers. Both are manageable with the CTK gate and a disciplined release.

---

## Stakeholder Identification

### Internal Stakeholders

| Stakeholder | Role/Department | Influence | Interest | Engagement Strategy |
|-------------|----------------|-----------|----------|---------------------|
| Roland Pfeifer | Lead Architect / CTO (Exec Sponsor) | HIGH | HIGH | Manage closely — decision authority |
| Vpnet Architecture Review Board | Governance (Gates A–D) | HIGH | HIGH | Manage closely — gate reviews |
| business-intent-agent (BSS) engineering | Domain being migrated | MEDIUM | HIGH | Manage closely — CTK-parity owner, risk-bearer |
| ibn-core engineering | Core extraction team | MEDIUM | HIGH | Manage closely — builds the core |
| resource-intent-agent engineering | First consumer | MEDIUM | HIGH | Keep informed — Phase-3 adoption |
| Security Architect | Safety owner (SafetyGovernor) | HIGH | MEDIUM | Keep satisfied — Phase-5 cross-cut |
| SI / commercial (Vpnet) | Reuse-leverage = sales story | MEDIUM | MEDIUM | Keep informed — value messaging |
| Future-domain teams (service/slice) | Third consumer | LOW | MEDIUM | Monitor — onboarding feedback |

### External Stakeholders

| Stakeholder | Organization | Relationship | Influence | Interest |
|-------------|--------------|--------------|-----------|----------|
| Open-source consumers of ibn-core | External | Library users | LOW | HIGH (v3.0.0 breaking change) |
| RFC 9315 / IETF standards community | IETF | Standards fidelity | LOW | LOW |
| Academic / Paper-1 citation audience | Academia | Cited release baseline | LOW | MEDIUM (immutable tags) |

### UK Government Digital Roles (GovS 005) / Security Roles (GovS 007)

**Not applicable** — commercial open-source subject. The governance analogue is the Vpnet ARB (decision/assurance), the Lead Architect (sponsor), and the engineering leads.

### Stakeholder Power-Interest Grid

```text
                          INTEREST
              Low                         High
        ┌─────────────────────┬─────────────────────┐
        │   KEEP SATISFIED    │   MANAGE CLOSELY     │
   High │                     │                      │
        │  • Security Arch.   │  • Lead Architect    │
        │                     │  • Vpnet ARB         │
 P      │                     │                      │
 O      ├─────────────────────┼─────────────────────┤
 W      │      MONITOR        │    KEEP INFORMED     │
 E      │                     │                      │
 R  Low │  • IETF community   │  • BSS engineering   │
        │  • Future domains   │  • ibn-core eng.     │
        │                     │  • resource eng.     │
        │                     │  • OSS consumers     │
        └─────────────────────┴─────────────────────┘
```

> Note: BSS and ibn-core engineering are placed at the High-Interest boundary; their **influence over success is high in practice** (they execute and gate the extraction) even if their org-chart power is medium — treat them as Manage-Closely for this project.

| Stakeholder | Power | Interest | Quadrant | Engagement Strategy |
|-------------|-------|----------|----------|---------------------|
| Lead Architect / CTO | HIGH | HIGH | Manage Closely | Decision authority, gate sign-off |
| Vpnet ARB | HIGH | HIGH | Manage Closely | Gates A–D |
| BSS engineering | MEDIUM | HIGH | Manage Closely | CTK-parity, risk mitigation, pairing |
| ibn-core engineering | MEDIUM | HIGH | Manage Closely | Core build, weekly working session |
| resource engineering | MEDIUM | HIGH | Keep Informed | Phase-3 adoption sync |
| Security Architect | HIGH | MEDIUM | Keep Satisfied | Phase-5 SafetyGovernor cross-cut |
| OSS consumers | LOW | HIGH | Keep Informed | Migration guide, beta, changelog |
| Future-domain teams | LOW | MEDIUM | Monitor | Onboarding docs feedback |
| IETF / standards community | LOW | LOW | Monitor | Fidelity (D-1…D-4); optional outreach |

---

## Stakeholder Drivers Analysis

### SD-1: Lead Architect / CTO — Reuse leverage of the open core

**Driver Category**: STRATEGIC · **Intensity**: CRITICAL

**Driver Statement**: Make the RFC 9315 cycle a genuine reusable asset so a new intent domain costs "an adapter set," not "a re-implemented runner" — proving the open-core commercial model.

**Context**: Resource already had to re-implement the cycle (004 ADR-010); every future domain would repay that. The open-core value proposition depends on real reuse.

**Enablers**: two existing consumers; an approved roadmap and ADR. **Blockers**: BSS extraction risk; engineering capacity.

**Related**: SD-2, SD-4, SD-7 (aligned).

---

### SD-2: ibn-core engineering — One phase machine to maintain

**Driver Category**: OPERATIONAL · **Intensity**: HIGH

**Driver Statement**: Stop maintaining two implementations of the same phase pattern (BSS runner + resource's `ResourceDomainCycleFactory`) that will drift.

**Context**: Duplicated logic means double bug-fixing and divergence risk.

**Enablers**: ports-and-adapters seam; no-domain-imports CI rule. **Blockers**: the behaviour-preserving extraction is delicate; CTK exposure.

**Related**: SD-1, SD-4 (aligned).

---

### SD-3: business-intent-agent (BSS) engineering — Don't break the conformant service

**Driver Category**: RISK · **Intensity**: CRITICAL

**Driver Statement**: "My TMF921-conformant service must keep working — I'm being asked to absorb extraction risk for a benefit others get." Protect CTK 83/83 and avoid regressions.

**Context**: BSS *is* the current runner; the extraction re-expresses it as an adapter set — all downside risk, little short-term upside for this team. This is the project's key resistance point.

**Enablers**: behaviour-preserving refactor; CTK-parity gate (Gate B); legacy runner behind a flag during cutover; pairing with ibn-core eng. **Blockers**: schedule pressure; mixing feature work into the extraction.

**Related**: SD-1/SD-2 (tension — Conflict C-1); SD-6 (aligned on conformance).

---

### SD-4: resource-intent-agent engineering — Retire the bespoke runner

**Driver Category**: OPERATIONAL / PERSONAL · **Intensity**: HIGH

**Driver Statement**: Stop carrying `ResourceDomainCycleFactory` as a fork of the phase pattern; consume the shared core instead.

**Context**: Maintaining a domain-specific re-implementation is ongoing cost and drift risk for the resource team.

**Enablers**: a stable v3.0.0 core; a clean adoption path; the 004 ADR superseding ADR-010. **Blockers**: core slips or changes shape late.

**Related**: SD-1, SD-2 (aligned).

---

### SD-5: Security Architect — Safety must not regress; ideally inherited by all

**Driver Category**: RISK / COMPLIANCE · **Intensity**: HIGH

**Driver Statement**: The G1 blast-radius `SafetyGovernor` (004 ADR-011) must survive the cycle relocation — and is better as a **core cross-cut** so every domain inherits the gate, not just resource.

**Context**: The autonomous resource loop writes to live network functions; safety is non-negotiable. Relocating the cycle is a moment of risk.

**Enablers**: injectable `admit()` core hook (FR-008); keep the gate where ADR-011 put it until the core is stable. **Blockers**: moving safety too early in the extraction.

**Related**: SD-9 (continuous assurance D-1 is both safety and fidelity).

---

### SD-6: Vpnet Architecture Review Board — Protect the seam, conformance, and cited tags

**Driver Category**: COMPLIANCE / RISK · **Intensity**: HIGH

**Driver Statement**: Manage the v3.0.0 breaking change responsibly — preserve the open-core seam (PRIN 9), TMF921 conformance (PRIN 3), and the immutable academically-cited tags.

**Context**: ibn-core is a cited, commercially-sold framework; a careless breaking change damages trust and reuse credibility.

**Enablers**: CTK-parity gate; semver + migration; no-domain-imports rule. **Blockers**: scope creep into the extraction; tag rewrites (prohibited).

**Related**: SD-3, SD-8 (aligned on careful change).

---

### SD-7: Future-domain teams — Cheap onboarding

**Driver Category**: STRATEGIC · **Intensity**: MEDIUM

**Driver Statement**: Stand up a new intent domain (e.g. service/slice) from the library + docs, without re-implementing the cycle.

**Context**: The third domain is also the *proof* the core is genuinely layer-agnostic (Gate D).

**Enablers**: documented ports + reference adapter; conformance suite. **Blockers**: no real third domain materialises.

**Related**: SD-1 (aligned).

---

### SD-8: Open-source consumers — Don't strand me on the breaking change

**Driver Category**: RISK · **Intensity**: MEDIUM

**Driver Statement**: A v3.0.0 that changes the reuse surface must come with a clear migration path; otherwise consumers pin to v2.x or fork.

**Context**: The core entry, enums, and footprint change; consumers need to follow.

**Enablers**: beta, migration guide, changelog, immutable older tags. **Blockers**: a breaking change with no migration support.

**Related**: SD-6 (aligned).

---

### SD-9: Standards-fidelity (RFC 9315) — Keep the core faithful

**Driver Category**: COMPLIANCE / STRATEGIC · **Intensity**: MEDIUM-HIGH

**Driver Statement**: The extracted core must remain faithful to RFC 9315 — continuous intent assurance, declarative/outcome-orientation, intent refinement across layers, RFC-named functions (the D-1…D-4 conditions from the ADR-005-001 standards review).

**Context**: ibn-core's differentiation and citations rest on verifiable standards fidelity; "layer-agnostic" must not become an imperative pipeline that loses intent's nature.

**Enablers**: D-1…D-4 folded into port contracts (REQ FR-004…007); RFC §5 mapping per port. **Blockers**: treating fidelity as optional under delivery pressure.

**Related**: SD-5 (D-1 continuous assurance overlaps safety); SD-1/SD-2 (tension — Conflict C-3).

---

### SD-10: SI / commercial — Reuse leverage as a sales story

**Driver Category**: FINANCIAL / STRATEGIC · **Intensity**: MEDIUM

**Driver Statement**: Faster new-domain delivery and a cleaner public surface strengthen the SI/commercial pitch.

**Context**: Reuse leverage is a differentiator in engagements.

**Enablers**: a shipped v3.0.0 with a demonstrable third-domain onboarding. **Blockers**: programme stalls at two consumers.

**Related**: SD-1, SD-7 (aligned).

---

## Driver-to-Goal Mapping

### Goal G-1: One layer-agnostic core, instantiated by multiple domains

**Derived From**: SD-1, SD-2, SD-4, SD-7, SD-10 · **Owner**: Lead Architect

**Statement**: Reduce runner implementations from 2 to **1** and have **≥ 2 domains on the shared core at v3.0.0, 3 by Gate D (CY 2027 Q3)**.

**Why**: satisfies the reuse-leverage, one-machine, retire-fork, and cheap-onboarding drivers.

**Metrics**: runner implementations (target 1); domains on core (target 3). **Baseline**: 2 runners, 0 on a shared core. **Method**: code audit per release. **Risks**: leaky abstraction (third domain proves it).

---

### Goal G-2: BSS on the core with TMF921 CTK 83/83 preserved

**Derived From**: SD-3, SD-6, SD-2 · **Owner**: BSS engineering lead

**Statement**: Re-express BSS as the first adapter set and pass **TMF921 v5 CTK 83/83 with no behaviour change** (Gate B, CY 2027 Q1).

**Why**: the trust anchor — turns "we won't break BSS" into an enforced gate; directly answers SD-3.

**Metrics**: CTK 83/83 (must hold); behaviour-diff (zero). **Baseline**: 83/83 on the legacy BSS runner. **Method**: CTK run per release. **Risks**: drift during refactor.

---

### Goal G-3: Resource adopts the core; supersede 004 ADR-010

**Derived From**: SD-4 · **Owner**: resource engineering lead

**Statement**: Refactor `ResourceDomainCycleFactory` onto the core (CY 2027 Q2) and write the 004 ADR superseding ADR-010; resource loop + SafetyGovernor green.

**Metrics**: resource loop tests green on core; bespoke phase code deleted. **Baseline**: resource on its own runner. **Method**: test suite + code audit.

---

### Goal G-4: RFC 9315 fidelity in the port contracts (D-1…D-4)

**Derived From**: SD-9, SD-6, SD-5 · **Owner**: Lead Architect

**Statement**: Port contracts honour D-1 (continuous assurance), D-2 (RFC-named ports mapped to §5), D-3 (intent refinement), D-4 (declarative core); conformance suite green for 3 domains.

**Why**: protects standards credibility (and, via D-1, safety).

**Metrics**: D-1…D-4 acceptance (REQ FR-004…007) met; conformance suite pass. **Method**: design review + suite. **Risks**: fidelity traded away under pressure (R-3).

---

### Goal G-5: SafetyGovernor as injectable core cross-cut

**Derived From**: SD-5 · **Owner**: Security Architect

**Statement**: Provide a core `admit()` hook so every domain inherits the blast-radius gate (Phase 5); resource enforces thresholds, BSS may no-op.

**Metrics**: hook present; resource governor enforcing; no safety regression. **Method**: safety tests + tabletop.

---

### Goal G-6: Responsible v3.0.0 (no stranded consumers)

**Derived From**: SD-6, SD-8, SD-2 · **Owner**: ibn-core engineering lead

**Statement**: Ship v3.0.0 with beta + migration guide, slim entry, exported enums; cited tags untouched.

**Metrics**: migration guide published; LLM-SDK no longer forced; enums exported; cited tags intact. **Method**: package audit + changelog.

---

## Goal-to-Outcome Mapping

### Outcome O-1: One phase machine in shared use; per-domain runner cost eliminated

**Supported Goals**: G-1, G-3 · **KPI**: runner implementations (2 → 1); domains on core (0 → 3). **Frequency**: per release. **Business Value**: removes drift-defect class; negative marginal cost per future domain (adapter-only). **Leading**: BSS compiles against the core. **Lagging**: third domain live on the unmodified core.

### Outcome O-2: Zero TMF921 conformance regression

**Supported Goals**: G-2 · **KPI**: CTK 83/83 maintained across v3.0.0. **Frequency**: per release. **Value**: protects the cited conformance claim and the BSS service. **Leading**: BSS adapter passes CTK in CI. **Lagging**: v3.0.0 GA at 83/83.

### Outcome O-3: Demonstrable RFC 9315 fidelity

**Supported Goals**: G-4, G-1 · **KPI**: D-1…D-4 satisfied; conformance suite green for 3 domains. **Value**: standards credibility; continuous-assurance (also a safety property). **Leading**: ports carry §5 mappings. **Lagging**: suite green for BSS + resource + third domain.

### Outcome O-4: Blast-radius safety inherited by all domains

**Supported Goals**: G-5 · **KPI**: every domain runs through the core `admit()` hook; zero safety regression. **Value**: safety is a core property, not re-built per domain. **Leading**: hook in the runner. **Lagging**: resource enforcing via the core hook in production.

### Outcome O-5: No stranded consumers

**Supported Goals**: G-6 · **KPI**: migration adoption; cited tags intact; consumers off forced LLM-SDK. **Value**: protects reuse credibility and the open-source community. **Leading**: beta uptake. **Lagging**: consumers on v3.0.0.

---

## Complete Traceability Matrix

| Stakeholder | Driver | Driver Summary | Goal | Outcome |
|-------------|--------|----------------|------|---------|
| Lead Architect | SD-1 | Reuse leverage | G-1 | O-1 |
| ibn-core eng | SD-2 | One machine | G-1, G-6 | O-1, O-5 |
| BSS eng | SD-3 | Don't break the conformant service | G-2 | O-2 |
| resource eng | SD-4 | Retire the bespoke runner | G-3 | O-1 |
| Security Architect | SD-5 | Safety inherited / not regressed | G-5 | O-4 |
| Vpnet ARB | SD-6 | Seam + conformance + cited tags | G-2, G-6 | O-2, O-5 |
| Future-domain teams | SD-7 | Cheap onboarding | G-1 | O-1 |
| OSS consumers | SD-8 | Don't strand me | G-6 | O-5 |
| Standards fidelity | SD-9 | RFC 9315 faithfulness (D-1…D-4) | G-4 | O-3 |
| SI / commercial | SD-10 | Reuse as sales story | G-1 | O-1 |

### Conflict Analysis

- **C-1 — Benefit/risk asymmetry (SD-1/SD-2 vs SD-3)**: the architect and core team want the extraction; the BSS team carries the risk to its conformant service for little short-term gain.
  - **Resolution**: behaviour-preserving extraction with the **CTK-parity gate (Gate B)** as an enforced promise; legacy BSS runner behind a flag during cutover; ibn-core eng pairs with BSS eng; frame the long-term win as *removing BSS's future maintenance*. Exec sponsor (Lead Architect) backs the priority. **BSS engineering is the stakeholder to bring along first.**
- **C-2 — Speed vs responsible breaking change (SD-1 vs SD-6/SD-8)**: ship the reuse win fast vs don't strand consumers.
  - **Resolution**: semver v3.0.0 + beta + migration guide; cited tags immutable; release gated (Gate C).
- **C-3 — Fidelity vs just-extract-fast (SD-9 vs SD-1/SD-2)**: D-1…D-4 add design constraints that slow the extraction.
  - **Resolution**: D-1…D-4 already folded into REQ FR-004…007 and the roadmap Phase-0/Gate-A — fidelity is a gate, not optional. (Note: D-1 continuous assurance also serves SD-5 safety, reducing the apparent cost.)

### Synergies

- **S-1**: SD-2 (one machine) + SD-4 (retire fork) + SD-7 (cheap onboarding) + SD-10 (sales story) all pull toward the same extraction — a broad coalition behind G-1.
- **S-2**: SD-5 (safety) + SD-9 (fidelity) converge on **D-1 continuous assurance** — one design property satisfies both a safety driver and a standards driver.

---

## Communication & Engagement Plan

#### business-intent-agent (BSS) engineering

**Primary Message**: "This does not put your CTK conformance at risk — the parity gate blocks the release until BSS passes 83/83, and your legacy runner stays behind a flag during cutover. Long term, you stop owning a bespoke runner."
**Talking Points**: enforced CTK gate; pairing support; removal of future maintenance burden. **Frequency**: weekly during Phases 1–2. **Channel**: working session. **Good news**: "BSS green on the core at 83/83."

#### Lead Architect / ARB

**Primary Message**: reuse leverage realised without compromising the seam, conformance, or cited tags. **Frequency**: at each gate. **Channel**: ARB review.

#### resource-intent-agent engineering

**Primary Message**: "v3.0.0 lets you delete the bespoke runner and supersede ADR-010." **Frequency**: at Phase-3 boundary.

#### Open-source consumers

**Primary Message**: "v3.0.0 changes the reuse surface — here is the migration guide and beta; older cited tags remain pinnable." **Frequency**: beta + release. **Channel**: changelog / repo notes.

---

## Change Impact Assessment

| Stakeholder | Current State | Future State | Change Magnitude | Resistance Risk | Mitigation |
|-------------|---------------|--------------|------------------|-----------------|------------|
| BSS engineering | BSS *is* the runner | BSS is an adapter set over the core | HIGH | MED-HIGH | Behaviour-preserving refactor; CTK gate; pairing; flagged cutover |
| ibn-core engineering | maintains the BSS runner | maintains the core + ports | MEDIUM | LOW | Owns the design; clear win |
| resource engineering | bespoke runner | adapter over the core | MEDIUM | LOW | Positive change (retire fork) |
| OSS consumers | v2.x surface | v3.0.0 surface | MEDIUM | MEDIUM | Migration guide; beta; pinnable tags |
| Security Architect | resource-only governor | core cross-cut governor | LOW-MED | LOW | Phase-5; keep ADR-011 placement until stable |

### Change Readiness

**Champions**: Lead Architect (sponsor); resource engineering (retire fork); SI/commercial (sales story).
**Fence-sitters**: ibn-core engineering (effort, but aligned); future-domain teams (await the library).
**Resisters**: BSS engineering (risk for others' benefit — bring along via the CTK gate + pairing); some OSS consumers (breaking change — bring along via migration support).

---

## Risk Register (Stakeholder-Related)

### Risk R-1: BSS team deprioritises/resists the extraction

**Related**: SD-3, SD-1. **Description**: the team bearing the risk has the least short-term incentive, so the extraction stalls. **Impact on Goals**: G-1, G-2. **Probability**: MEDIUM · **Impact**: HIGH. **Mitigation**: exec sponsorship; CTK gate as a guarantee; pairing; frame as removing future maintenance. **Contingency**: fall back to Option 2 (harden the coordination plane, defer the BSS migration) — but flag that this fails the layer-agnostic goal.

### Risk R-2: OSS consumers fork at v2.x rather than migrate

**Related**: SD-8, SD-6. **Probability**: MEDIUM · **Impact**: MEDIUM. **Mitigation**: migration guide, beta, clear value; keep cited tags pinnable. **Contingency**: maintain a v2.x compatibility shim for one minor cycle.

### Risk R-3: Fidelity conditions (D-1…D-4) traded away under delivery pressure

**Related**: SD-9, SD-5. **Probability**: MEDIUM · **Impact**: HIGH. **Mitigation**: D-1…D-4 are binding REQ FRs and roadmap gate criteria, not optional. **Contingency**: ARB blocks the release gate if a fidelity condition is unmet.

---

## Governance & Decision Rights

### Decision Authority Matrix (RACI)

| Decision Type | Responsible | Accountable | Consulted | Informed |
|---------------|-------------|-------------|-----------|----------|
| Extraction decision (Gate A) | Lead Architect | Vpnet ARB | ibn-core + BSS eng | All |
| CTK-parity sign-off (Gate B) | BSS eng lead | Vpnet ARB | ibn-core eng | All |
| v3.0.0 release (Gate C) | ibn-core eng lead | Vpnet ARB | OSS-consumer reps, resource eng | All |
| Resource adoption / supersede ADR-010 | resource eng lead | Lead Architect | ibn-core eng | ARB |
| SafetyGovernor core cross-cut (Phase 5) | Security Architect | Vpnet ARB | resource eng | All |
| Fidelity (D-1…D-4) acceptance | Lead Architect | Vpnet ARB | (advisory: RFC 9315 persona review) | All |

### Escalation Path

1. **Level 1**: Engineering working session (delivery, blockers).
2. **Level 2**: Lead Architect (scope, priority, cross-repo coordination).
3. **Level 3**: Vpnet Architecture Review Board (gates, seam, breaking-change, conflict resolution).

---

## Validation & Sign-off

### Stakeholder Review

| Stakeholder | Review Date | Comments | Status |
|-------------|-------------|----------|--------|
| BSS engineering lead | [PENDING] | | [PENDING] |
| ibn-core engineering lead | [PENDING] | | [PENDING] |
| Vpnet ARB | [PENDING] | | [PENDING] |

### Document Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Project Sponsor | Roland Pfeifer (Lead Architect / CTO) | | [PENDING] |
| Governance Board | Vpnet Architecture Review Board | | [PENDING] |

---

## Appendices

### Appendix A: Stakeholder Interview Summaries

No interviews conducted — this analysis is derived from `ARC-005-ADR-001`, `ARC-005-ROAD-v1.0`, `ARC-005-REQ-v1.0`, and the 004 consumer context. Validate with named role-holders at first review.

### Appendix C: References

- `projects/000-global/ARC-000-PRIN-v1.0.md` — principles.
- `projects/005-ibn-core-rfc9315-core/ARC-005-ADR-001-v1.0.md` — keystone decision + D-1…D-4.
- `projects/005-ibn-core-rfc9315-core/ARC-005-ROAD-v1.0.md` — roadmap/gates.
- `projects/005-ibn-core-rfc9315-core/ARC-005-REQ-v1.0.md` — requirements (FR-004…007 = D-1…D-4).
- `resource-intent-agent` `ARC-004-ADR-010` / `ARC-004-REQ` v1.3 — consumer context.

---

## External References

> Traceability from generated content back to source material.

### Document Register

| Doc ID | Filename | Type | Source Location | Description |
|--------|----------|------|-----------------|-------------|
| ADR005 | ARC-005-ADR-001-v1.0.md | ADR | projects/005-ibn-core-rfc9315-core/decisions/ | Keystone decision + Appendix D (D-1…D-4) |
| ROAD | ARC-005-ROAD-v1.0.md | Roadmap | projects/005-ibn-core-rfc9315-core/ | Gates A–D; phases |
| REQ | ARC-005-REQ-v1.0.md | Requirements | projects/005-ibn-core-rfc9315-core/ | BR/FR/NFR incl. FR-004…007 (D-1…D-4) |
| PRIN | ARC-000-PRIN-v1.0.md | Principles | projects/000-global/ | 9, 10, 14, 5, 3 |

### Citations

| Citation ID | Doc ID | Page/Section | Category | Quoted Passage |
|-------------|--------|--------------|----------|----------------|
| [ADR005-C1] | ADR005 | §6 / Appendix D | Stakeholder Need | Two peers, one core; conditions D-1…D-4 (continuous assurance, RFC-named ports, intent refinement, declarative core) |
| [ROAD-C1] | ROAD | Gates A–D | Stakeholder Need | CTK-parity gate; v3.0.0 release gate; third-domain proof |
| [REQ-C1] | REQ | FR-004…007 / NFRs | Stakeholder Need | D-1…D-4 as binding FRs; CTK-parity, slim-entry, conformance NFRs |

### Unreferenced Documents

| Filename | Source Location | Reason |
|----------|-----------------|--------|
| — | — | — |

---

**Generated by**: ArcKit `/arckit:stakeholders` command
**Generated on**: 2026-06-14 GMT
**ArcKit Version**: 5.11.0
**Project**: ibn-core-rfc9315-core (Project 005)
**AI Model**: claude-opus-4-8 (1M context)
**Generation Context**: Derived from ARC-005-ADR-001, ARC-005-ROAD-v1.0, ARC-005-REQ-v1.0, ARC-000-PRIN-v1.0, and the 004 consumer context. Commercial open-source subject — GovS 005/007 roles N/A. No interviews; stakeholders to be validated with named role-holders. Closes the STKE gap flagged across the 005 artifacts.

<!-- arckit-provenance:start -->

## Build Provenance

_Stamped automatically by the ArcKit plugin's `provenance-stamp.mjs` PostToolUse hook. Complements (does not replace) the human-authored footer above. Carries only fields the model can't authoritatively self-report: build context from `.arckit/state.json` and effort levels derived from command frontmatter + the silent-downgrade matrix._

| Field | Value |
|-------|-------|
| Requested Effort | `high` |
| Effective Effort | _unknown — model not parsed from existing footer_ |
| Stamped at | 2026-06-14T19:16:41.111Z |

<!-- arckit-provenance:end -->
