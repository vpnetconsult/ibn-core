# Project Requirements: ibn-core RFC 9315 Layer-Agnostic Core

> **Template Origin**: Official | **ArcKit Version**: 5.11.0 | **Command**: `/arckit:requirements`

## Document Control

| Field | Value |
|-------|-------|
| **Document ID** | ARC-005-REQ-v1.0 |
| **Document Type** | Business and Technical Requirements |
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
| **Distribution** | Vpnet Architecture Review Board, ibn-core engineering, resource-intent-agent engineering |

> **Subject type note**: This is the **public open core** (Apache-2.0); classified **PUBLIC**. UK GDS / TCoP references are non-binding comparators; the binding constraints are the open-core seam (PRIN 9) and **RFC 9315 fidelity, D-1…D-4** (PRIN 3).
>
> **Scope & IP positioning**: TMF921 CTK (83/83) and the ODA Canvas (UC006/UC007, ODA-component packaging) are properties of the **instantiated business-intent-agent**, not of this RFC 9315 core — the core is domain-neutral, never CTK-tested, and not an ODA component (its standards fidelity is to **RFC 9315 / D-1…D-4**). The business-intent-agent and its TMF921/CTK/ODA conformance are themselves **public open-core** (Apache-2.0): implementing TM Forum's *open* standards is **not** owning TM Forum IP. Vpnet claims **no ownership of TM Forum or IETF standards**; the only original contribution is the **demonstration that the business-intent and resource-intent agents are derivable from one common source — a single layer-agnostic RFC 9315 core** ("two peers, one core"). Only **operator-specific adapters and credentials** (CAMARA; vendor-embedded resource logic per 004 ADR-006) are private.

## Revision History

| Version | Date | Author | Changes | Approved By | Approval Date |
|---------|------|--------|---------|-------------|---------------|
| 1.0 | 2026-06-14 | ArcKit AI | Initial creation from `/arckit:requirements`; formalises the requirements implied by `ARC-005-ROAD-v1.0` and `ARC-005-ADR-001`, including the ADR-005-001 Appendix D conditions D-1…D-4 as functional requirements | [PENDING] | [PENDING] |

## Document Purpose

Defines the business and technical requirements for **Project 005 — the layer-agnostic RFC 9315 core library** (the "to-be" of ibn-core). It is the requirements baseline for the core's port-contract spec, HLD/DLD, conformance suite, and the v3.0.0 release. Requirements trace to `ARC-000-PRIN-v1.0`, to the keystone decision `ARC-005-ADR-001` (incl. its Appendix D standards-review conditions), and to the roadmap `ARC-005-ROAD-v1.0`.

> **Input note**: No `ARC-005-STKE` / `ARC-005-RISK` / `ARC-005-WARD` yet. Stakeholders are interim; risks are summarised here and to be formalised via `/arckit:risk`.

---

## Executive Summary

### Business Context

The RFC 9315 intent cycle in ibn-core is welded to the business/BSS domain; the resource domain had to re-implement the phase pattern (`ARC-004-ADR-010`). `ARC-005-ADR-001` (APPROVED with conditions) decided to extract the phase machine into a **layer-agnostic core library** that both business-intent and resource-intent **instantiate as peer adapters** ("two peers, one core"). This document specifies what that core must do and the qualities it must hold — including the four RFC 9315-fidelity conditions (D-1…D-4) attached at ARB approval.

### Objectives

- Deliver one domain-neutral RFC 9315 cycle core that every intent domain instantiates (no per-domain runner re-implementation).
- Preserve RFC 9315 fidelity: continuous intent assurance, RFC-named functions, intent refinement across layers, a declarative/outcome-oriented core (D-1…D-4).
- Preserve TMF921 CTK 83/83 through the BSS extraction; keep the open-core seam clean.
- Make the public entry slim and well-typed (LLM SDK optional; phase enums exported).

### Expected Outcomes

- Runner implementations: 2 → 1; domains on the shared core: 0 → 3.
- TMF921 CTK 83/83 maintained; forced LLM-SDK dependency removed; phase enums exported.
- A new domain stands up from library + docs alone (proven by a third domain).

### Project Scope

**In Scope**: the `IntentCycleRunner`, the `PhaseStrategy` port set, the coordination-plane re-export, the `SafetyGovernor` core cross-cut hook, phase-tagged telemetry, packaging (v3.0.0), the conformance suite, and the BSS + resource adapter migrations.

**Out of Scope**: vendor/operator-specific phase adapters (private repos; PRIN 9); resource-domain delivery beyond the core adoption (governed by Project 004); business-feature changes (the BSS extraction is behaviour-preserving).

---

## Stakeholders

> Interim — run `/arckit:stakeholders` to ratify.

| Stakeholder | Role | Involvement |
|-------------|------|-------------|
| Roland Pfeifer | Lead Architect / CTO (Vpnet) | Decision maker |
| ibn-core engineering | Core owner | Extraction, packaging, conformance |
| resource-intent-agent engineering | First consumer | Phase-3 adoption; supersede 004 ADR-010 |
| Security Architect | Safety owner | SafetyGovernor core cross-cut (Phase 5) |
| Future-domain teams | Third consumer | Layer-agnosticism proof |
| Vpnet Architecture Review Board | Governance | Gates A–D |

---

## Business Requirements

### BR-001: One layer-agnostic RFC 9315 cycle core

**Description**: ibn-core must expose a single domain-neutral RFC 9315 cycle core that all intent domains instantiate, eliminating the duplicated phase machine.

**Rationale**: Two runner implementations (BSS + resource) drift and re-pay the phase-machine cost per domain. Aligns PRIN 14 (Maintainability), 10 (Loose Coupling). Source: `ARC-005-ADR-001`.

**Success Criteria**: runner implementations 2 → 1; ≥ 2 domains on the core at v3.0.0; 3 by Gate D.

**Priority**: MUST_HAVE · **Stakeholder**: Lead Architect; ibn-core engineering

---

### BR-002: Two peers, one core (dogfooded layer-agnosticism)

**Description**: Business-intent and resource-intent must both instantiate the core as peer adapters; neither owns the runner.

**Rationale**: A core only resource uses (while BSS keeps its own runner) is a fork-in-waiting. BSS-on-core is the dogfooding proof. Source: `ARC-005-ADR-001`, Project 005 thesis.

**Success Criteria**: BSS passes TMF921 CTK 83/83 on the core; resource loop green on the core; bespoke `ResourceDomainCycleFactory` phase code removed.

**Priority**: MUST_HAVE · **Stakeholder**: Lead Architect; both engineering teams

---

### BR-003: Reuse leverage — adapter-only new domains

**Description**: Onboarding a new intent domain must require supplying a `PhaseStrategy` adapter set, not re-implementing the cycle.

**Rationale**: The open-core value proposition; payback at the third domain. Aligns PRIN 9.

**Success Criteria**: a third domain (service/slice) runs on the unmodified core (Gate D).

**Priority**: SHOULD_HAVE · **Stakeholder**: Future-domain teams

---

### BR-004: Preserve seam and conformance through extraction

**Description**: The extraction must keep the open-core seam clean (public Apache-2.0 core; private domain/vendor adapters) and preserve TMF921 CTK conformance.

**Rationale**: NON-NEGOTIABLE principles PRIN 9 and PRIN 3; cited tags immutable.

**Success Criteria**: zero domain imports in core; CTK 83/83 maintained; v3.0.0 ships with migration guide; cited tags untouched.

**Priority**: MUST_HAVE · **Stakeholder**: Lead Architect; ARB

---

## Functional Requirements

> FR-004…FR-007 are the **ADR-005-001 Appendix D conditions (D-1…D-4)**, folded in as binding functional requirements.

### FR-001: Domain-neutral `IntentCycleRunner`

**Description**: Provide an `IntentCycleRunner` that drives the RFC 9315 phase sequence and lifecycle state with **zero domain (BSS/resource) imports**, parameterised by injected `PhaseStrategy` ports and the coordination plane.

**Relates To**: BR-001, BR-002 · **Acceptance**:

- [ ] Given the core package, when built, then it imports no BSS/resource domain modules (CI-enforced dependency rule).
- [ ] Given a domain's adapter set, when supplied, then the runner executes the full cycle for that domain.

**Priority**: MUST_HAVE · **Complexity**: HIGH

---

### FR-002: `PhaseStrategy` port per RFC 9315 phase

**Description**: Define one `PhaseStrategy` port per RFC 9315 phase; each domain implements the set.

**Relates To**: BR-001, BR-003 · **Acceptance**:

- [ ] One port per phase exists; BSS and resource each implement all ports.
- [ ] A phase body lives only in an adapter, never in the runner.

**Priority**: MUST_HAVE · **Complexity**: HIGH

---

### FR-003: Both domains instantiate the core (peer adapters)

**Description**: BSS and resource must each instantiate the core runner with their own adapter sets; the BSS runner and the resource `ResourceDomainCycleFactory` re-implementations are retired.

**Relates To**: BR-002 · **Acceptance**:

- [ ] BSS runs on the core (CTK 83/83); resource runs on the core (loop tests green).
- [ ] No standalone per-domain phase machine remains.

**Priority**: MUST_HAVE · **Complexity**: HIGH

---

### FR-004 (D-1): Continuous intent assurance in the core

**Description**: The core must treat **intent assurance as continuous** — the monitor/assess phases feed back into the loop; "act" is not a terminal step. The closed loop (with room for recognition/learning over time) is first-class, per RFC 9315.

**Relates To**: BR-004; **ADR-005-001 condition D-1** · **Acceptance**:

- [ ] The runner supports continuous monitor→assess→(re)act cycles, not a one-shot pipeline.
- [ ] Assurance state is observable per cycle iteration, not only at completion.

**Priority**: MUST_HAVE · **Complexity**: MEDIUM

---

### FR-005 (D-2): RFC 9315-named ports mapped to §5

**Description**: `PhaseStrategy` ports must be named for **RFC 9315 functions** (intent fulfilment / intent assurance), and each port mapped to its RFC 9315 §5 sub-section in the port-contract spec — not to domain or vendor terms.

**Relates To**: BR-004; **ADR-005-001 condition D-2** · **Acceptance**:

- [ ] Each port carries an RFC 9315 §5 reference in the contract spec.
- [ ] No domain/vendor jargon in public port names (consistent with the CLAUDE.md non-WG-vocabulary rule).

**Priority**: MUST_HAVE · **Complexity**: LOW

---

### FR-006 (D-3): Intent refinement via `IntentHierarchy`

**Description**: The business→resource relationship must be modelled as **RFC 9315 intent refinement/decomposition** through the reused `IntentHierarchy` — a higher-layer intent decomposes into lower-layer intent — not as mere code reuse.

**Relates To**: BR-002, BR-003; **ADR-005-001 condition D-3** · **Acceptance**:

- [ ] A business intent decomposed to a resource intent is linked as a parent→child refinement in `IntentHierarchy`.
- [ ] Resource fulfilment/assurance status is reported up the hierarchy to the parent intent.

**Priority**: SHOULD_HAVE · **Complexity**: MEDIUM

---

### FR-007 (D-4): Declarative, outcome-oriented core

**Description**: The core must remain **declarative and outcome-oriented**; the phase machine must not harden into an imperative pipeline that loses intent's declarative nature.

**Relates To**: BR-004; **ADR-005-001 condition D-4** · **Acceptance**:

- [ ] Ports express desired outcomes/expectations, not imperative step lists, at the contract boundary.
- [ ] Design review confirms no imperative coupling leaks into the runner.

**Priority**: MUST_HAVE · **Complexity**: MEDIUM

---

### FR-008: `SafetyGovernor` as injectable core cross-cut

**Description**: The core must provide a `SafetyGovernor.admit()` cross-cut hook so any domain can enforce a blast-radius gate (resource enforces thresholds per 004 ADR-011; BSS may no-op).

**Relates To**: BR-004 · **Acceptance**:

- [ ] The runner invokes an injectable `admit()` hook before actuation phases.
- [ ] Resource supplies an enforcing governor; BSS supplies a permissive one — both via the same hook.

**Priority**: SHOULD_HAVE · **Complexity**: MEDIUM · **Dependencies**: 004 ADR-011

---

### FR-009: Phase-tagged telemetry as a core concern

**Description**: The core emits `rfc9315.phase`-tagged telemetry for every cycle, inherited by all domains.

**Relates To**: BR-004 (PRIN 5) · **Acceptance**:

- [ ] Spans carry the RFC 9315 phase and a correlation/intent ID, emitted from the core.

**Priority**: SHOULD_HAVE · **Complexity**: LOW

---

### FR-010: Exported phase enums (D6 closure)

**Description**: The public entry must export the phase/priority enums (`IntentHandlingPhase/Step/IntentPriorityLayer`) so consumers stop mirroring them locally.

**Relates To**: BR-004 · **Acceptance**:

- [ ] Enums importable from the public entry; the resource local mirror is removed.

**Priority**: MUST_HAVE · **Complexity**: LOW

---

## Non-Functional Requirements

### NFR-C-001: TMF921 CTK conformance parity (Gate B)

**Requirement**: BSS running on the core must pass **TMF921 v5 CTK 83/83** with no behaviour change; this gates packaging.

**Priority**: CRITICAL

---

### NFR-ARCH-001: No-domain-imports dependency rule

**Requirement**: A CI-enforced rule must fail any build where the core package imports a domain (BSS/resource) module. Target: 0 violations.

**Priority**: CRITICAL

---

### NFR-PKG-001: Slim public entry (D4 closure)

**Requirement**: Installing the core must not force `@anthropic-ai/sdk` (or other LLM deps) on consumers that do not use the LLM adapter; the LLM adapter is opt-in.

**Priority**: HIGH

---

### NFR-I-001: Semver and migration

**Requirement**: Ship as **v3.0.0** with a migration guide and a beta before GA; never rewrite cited tags (v1.4.x–v2.1.0).

**Priority**: HIGH

---

### NFR-M-001: Domain-agnostic conformance suite

**Requirement**: A conformance suite must validate the phase machine independent of domain, passing for BSS, resource, and a third domain (Gate D).

**Priority**: HIGH

---

### NFR-LIC-001: Open-core licence compatibility

**Requirement**: The core is public Apache-2.0; all core dependencies Apache-2.0-compatible (Apache/MIT/BSD/ISC); no GPL. Vendor/operator adapters stay private.

**Priority**: CRITICAL

---

## Constraints and Assumptions

**TC-1**: The phase *pattern* is genuinely shared across domains; only phase *bodies* differ (validated in Phase 0 port-contract review).

**TC-2**: BSS can be re-expressed as an adapter set without semantic change (CTK-parity guarded).

**BC-1**: Public core only; no operator/vendor specifics (PRIN 9). **BC-2**: Cited tags immutable.

**A-1**: 1–2 FTE available across ~18 months (roadmap). **A-2**: a genuine third domain (service/slice, RFC 9543) is available to prove generality.

---

## Dependencies and Risks

| Risk ID | Description | P | I | Mitigation |
|---------|-------------|---|---|------------|
| R-001 | Premature/leaky abstraction (core not truly generic) | M | H | No-domain-imports rule; third-domain proof (Gate D) |
| R-002 | BSS behaviour drift regresses CTK 83/83 | M | H | Behaviour-preserving refactor; Gate B parity |
| R-003 | Assurance reduced to a terminal step (violates D-1) | M | H | FR-004 acceptance; design review against RFC 9315 §5 |
| R-004 | Breaking change strands consumers | M | M | Semver v3.0.0; migration guide; beta |
| R-005 | Safety regression relocating the cycle | L | H | Keep 004 ADR-011 placement until Phase 5 |

> Formalise in `ARC-005-RISK` via `/arckit:risk`.

---

## Traceability

| Source | Requirement(s) |
|--------|----------------|
| `ARC-005-ADR-001` (decision) | BR-001…004, FR-001…003, FR-008…010 |
| `ARC-005-ADR-001` Appendix D (D-1…D-4) | **FR-004 (D-1), FR-005 (D-2), FR-006 (D-3), FR-007 (D-4)** |
| `ARC-005-ROAD-v1.0` (Phase 0 / Gates A–D) | NFR-C-001, NFR-ARCH-001, NFR-PKG-001, NFR-I-001, NFR-M-001 |
| `ARC-000-PRIN-v1.0` (9, 10, 14, 5, 3) | BR-004, FR-001, FR-009, NFR-LIC-001, NFR-C-001 |
| `ARC-004-ADR-010` / `ARC-004-REQ` v1.3 FR-014 | BR-002, FR-003 (the consumer constraint retired onto the core) |
| `ARC-004-ADR-011` (SafetyGovernor) | FR-008 |

---

## External References

> Traceability from generated content back to source material.

### Document Register

| Doc ID | Filename | Type | Source Location | Description |
|--------|----------|------|-----------------|-------------|
| ADR005 | ARC-005-ADR-001-v1.0.md | ADR | projects/005-ibn-core-rfc9315-core/decisions/ | Keystone decision + Appendix D conditions D-1…D-4 |
| ROAD | ARC-005-ROAD-v1.0.md | Roadmap | projects/005-ibn-core-rfc9315-core/ | Phases/gates; D-1…D-4 in Phase 0 |
| PRIN | ARC-000-PRIN-v1.0.md | Principles | projects/000-global/ | 9, 10, 14, 5, 3 |
| REQ004 | ARC-004-REQ-v1.0.md (content v1.3) | Requirements (external repo) | resource-intent-agent/…/ | FR-014 domain-specific runner — consumer constraint |

### Citations

| Citation ID | Doc ID | Section | Category | Quoted/Paraphrased Passage |
|-------------|--------|---------|----------|----------------------------|
| [ADR005-C1] | ADR005 | Appendix D | Functional Requirement | Conditions D-1 (continuous assurance), D-2 (RFC-named ports mapped to §5), D-3 (intent refinement), D-4 (declarative core) |
| [ROAD-C1] | ROAD | Phase 0 / Gate A | Non-Functional Requirement | Port contracts incorporate D-1…D-4; CTK-parity, slim-entry, conformance gates |
| [PRIN-C1] | PRIN | Principles 9 / 10 / 14 | Compliance Constraint | Open-core seam; loose coupling; maintainability |

### Unreferenced Documents

| Filename | Source Location | Reason |
|----------|-----------------|--------|
| — | — | — |

---

**Generated by**: ArcKit `/arckit:requirements` command
**Generated on**: 2026-06-14 GMT
**ArcKit Version**: 5.11.0
**Project**: ibn-core-rfc9315-core (Project 005)
**AI Model**: claude-opus-4-8 (1M context)
**Generation Context**: Derived from ARC-005-ADR-001 (keystone decision; Appendix D conditions D-1…D-4 folded in as FR-004…007), ARC-005-ROAD-v1.0 (gates → NFRs), ARC-000-PRIN-v1.0 (principles), and the 004 consumer context (ARC-004-ADR-010/011, ARC-004-REQ v1.3). PUBLIC open-core subject; UK GDS/TCoP non-binding. No ARC-005-STKE/RISK/WARD yet — interim stakeholders, risks to be formalised.

<!-- arckit-provenance:start -->

## Build Provenance

_Stamped automatically by the ArcKit plugin's `provenance-stamp.mjs` PostToolUse hook. Complements (does not replace) the human-authored footer above. Carries only fields the model can't authoritatively self-report: build context from `.arckit/state.json` and effort levels derived from command frontmatter + the silent-downgrade matrix._

| Field | Value |
|-------|-------|
| Requested Effort | `max` |
| Effective Effort | _unknown — model not parsed from existing footer_ |
| Stamped at | 2026-06-14T19:30:06.472Z |

<!-- arckit-provenance:end -->
