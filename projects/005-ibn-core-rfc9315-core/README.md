# Project 005 — ibn-core RFC 9315 Layer-Agnostic Core (To-Be)

| Field | Value |
|-------|-------|
| **Project ID** | 005 |
| **Project Name** | ibn-core-rfc9315-core |
| **Created** | 2026-06-14 |
| **Owner** | Roland Pfeifer, Lead Architect (Vpnet Cloud Solutions Sdn. Bhd.) |
| **Classification** | PUBLIC (open-core engineering; Apache-2.0) |
| **Status** | Active — target-state ("to-be") architecture |
| **Repo home** | `vpnetconsult/ibn-core` (public open core) |

## Purpose

This project governs the **target-state ("to-be") architecture** for ibn-core:
extracting the RFC 9315 intent-cycle phase machine out of its current
**BSS-concrete** runner into a **layer-agnostic core library**, so that every
intent domain instantiates the same core rather than re-implementing the phase
pattern.

It is the forward-looking counterpart to the *as-is* facts recorded elsewhere:

- **As-is:** ibn-core v2.1.x ships the IMF coordination plane as reusable, but
  the cycle runner is **BSS-concrete, not layer-agnostic**
  (resource-intent-agent `ARC-004-ADR-010`).
- **Pragmatic present:** resource-intent-agent therefore built a domain-specific
  runner (`ResourceDomainCycleFactory`) that re-implements the phase pattern and
  composes the reused coordination plane (`ARC-004-REQ` v1.3, FR-014).
- **To-be (this project):** make the phase machine genuinely layer-agnostic and
  ship it as a library, so the bespoke per-domain runner is no longer required.

## Thesis — "two peers, one core"

Both **business-intent-agent (BSS)** and **resource-intent-agent** MUST
instantiate from the same RFC 9315 core library as **peer adapters** — neither is
the privileged "owner" of the runner.

- **Shared core (public, Apache-2.0):** the phase state machine
  (`IntentCycleRunner`), the `PhaseStrategy` ports (one per RFC 9315 phase), the
  phase/priority enums, retry/backoff, telemetry phase-tagging, the
  `SafetyGovernor.admit()` cross-cut hook, and the IMF coordination plane
  (ConflictArbiter, SharedStatePlane, IntentHierarchy, SemanticToolRegistry,
  KnowledgeStore façade).
- **Per-domain adapter sets:** BSS (TMF921 → MCP → Redis SSoT → claude-client);
  Resource (TS 28.312 → NETCONF → Fuseki/SPARQL → SHACL).

**Acid test of success:** the core must host BSS (the original, most-coupled
domain) *and* resource. A core that only resource consumes — while BSS keeps its
own runner — is **not** layer-agnostic; it is a fork-in-waiting. Migrating BSS
onto the core is the costly, load-bearing part and the reason this is a
**breaking change (v3.0.0 candidate)**.

**Scope & IP positioning.** TMF921 CTK and the ODA Canvas (UC006/UC007) are
properties of the **instantiated business-intent-agent**, not of the RFC 9315
core. The business-intent-agent and its TMF921/CTK/ODA conformance are themselves
**public open-core** (Apache-2.0) — implementing TM Forum's *open* standards is
**not** owning TM Forum IP. Vpnet claims **no ownership of TM Forum or IETF
standards**; the only original contribution ("IP") is the **demonstration that
the business-intent and resource-intent agents derive from one common source —
the single layer-agnostic RFC 9315 core**. Only **operator-specific adapters and
credentials** (CAMARA; vendor-embedded resource logic per 004 ADR-006) are
private. Public = core + business-intent-agent; private = operator/vendor
adapters.

## Scope

**In scope:**

- Extract the RFC 9315 phase machine into a domain-neutral core with
  ports-and-adapters seams.
- Fix the public-entry gaps surfaced downstream: under-exported phase enums
  (004 dashboard D6) and the heavy transitive footprint / `@anthropic-ai/sdk`
  drag (D4) — slim the core entry to coordination-plane + runner + ports.
- Migrate **both** domains onto the core (BSS first, behaviour-preserving, with
  TMF921 CTK 83/83 as the guardrail; then resource, superseding `ARC-004-ADR-010`).
- A domain-agnostic phase-machine conformance suite; validate with a third
  domain (service/slice) to prove genuine layer-agnosticism.
- Decide whether `SafetyGovernor` becomes a core cross-cut (so every domain
  inherits the blast-radius gate, not just resource — relates to `ARC-004-ADR-011`).

**Out of scope:**

- Vendor/operator-specific phase adapters (private repos; open-core seam, PRIN 9).
- Day-to-day resource-domain delivery (governed in `vpnetconsult/resource-intent-agent`,
  Project 004) — this project only owns the core-extraction decisions that 004 consumes.

## Relationship to other projects

| Project | Relationship |
|---------|--------------|
| `000-global` | Inherits the enterprise architecture principles (esp. open-core seam, loose coupling). |
| `001-ibn-core` | The as-is public core; this project defines its to-be. |
| `004-resource-intent-agent` (private repo) | First non-BSS consumer; its `ARC-004-ADR-010` is the as-is constraint this project removes. A 004 ADR will supersede ADR-010 when the core ships. |

## Planned artifacts (next steps)

| Artifact | Command | Purpose |
|----------|---------|---------|
| Roadmap | `/arckit:roadmap` | The phased extraction plan (Phase 0–5: decide → extract core → package → resource adopts → 3rd-domain proof → harden). |
| Phase-0 ADR | `/arckit:adr` | "Extract the RFC 9315 phase machine into a layer-agnostic core; both BSS and resource instantiate it." Supersedes the BSS-concrete status quo. |
| Requirements | `/arckit:requirements` | Core-library requirements (port contracts, no-domain-imports rule, CTK-parity guardrail, slim-entry NFR). |
| Risk | `/arckit:risk` | Premature/leaky-abstraction, behaviour drift, safety regression, breaking-change migration. |

> Naming note: project named `ibn-core-rfc9315-core` to reflect the substance
> (the layer-agnostic RFC 9315 library). Rename freely if you prefer
> `ibn-core-to-be` or similar.
