# RFC 9315 PhaseStrategy Port-Contract Specification (Phase 0)

> **Engineering deliverable** (not a formal ArcKit artifact type) | **Phase-0 deliverable of `ARC-005-ROAD-v1.0` (Gate A)** | ArcKit context v5.11.0

## Document Control

| Field | Value |
|-------|-------|
| **Document ID** | ARC-005 / Phase-0 Port-Contract Spec (v1.0) |
| **Document Type** | Port-Contract Specification (interface design) |
| **Project** | ibn-core-rfc9315-core (Project 005) |
| **Classification** | PUBLIC |
| **Status** | REVIEWED — Gate A passed with conditions (see §11) |
| **Version** | 1.0 |
| **Created Date** | 2026-06-14 |
| **Last Modified** | 2026-06-14 |
| **Review Date** | 2026-07-14 |
| **Owner** | Roland Pfeifer, Lead Architect (Vpnet Cloud Solutions Sdn. Bhd.) |
| **Reviewed By** | [PENDING] |
| **Approved By** | [PENDING] |
| **Distribution** | Vpnet Architecture Review Board, ibn-core engineering, business-intent-agent engineering, resource-intent-agent engineering, Security Architect |

> **What this is**: the Gate-A deliverable — the **port-contract spec** for the layer-agnostic RFC 9315 core. It defines the `IntentCycleRunner` and the `PhaseStrategy` port set, maps each port to RFC 9315 §5, encodes the ADR-005-001 conditions **D-1…D-4**, and **validates the ports against both real domains** (business-intent and resource-intent) — the Gate-A acceptance criterion. The TypeScript below is **contract sketch**, not final code; Phase 1 implements and refines it.
>
> **Naming note**: filed under a descriptive name (not `ARC-005-{CODE}`) because "port-contract spec" is not a standard ArcKit document-type code; it is the engineering Phase-0 deliverable the roadmap/REQ/TRAC refer to.
>
> **Scope & IP**: this is the **public** core (Apache-2.0). It carries **no TMF921 CTK or ODA Canvas obligation** — those belong to the instantiated business-agent. The core's standards fidelity is to **RFC 9315** only.

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-06-14 | ArcKit AI | Initial Phase-0 port-contract spec; encodes D-1…D-4; validated against BSS + resource |
| 1.0 | 2026-06-14 | Vpnet ARB | Gate-A Architecture Review Board (ARB): **Approved with conditions**; 4 open questions dispositioned (§11). Gate A now complete (ADR-005-001 + this spec). |

---

## 1. Purpose & RFC 9315 grounding

The core extracts the RFC 9315 intent cycle into a **domain-neutral runner** driven by a set of **per-phase strategy ports**. Each phase body is supplied by a domain adapter; the runner owns only the *sequence*, the *lifecycle state*, the *continuous-assurance loop*, the *safety gate*, and *telemetry*.

The phase decomposition and RFC 9315 §5 mapping reuse the programme's existing **Standards Implementation Map** (ibn-core `CLAUDE.md`):

| Port | RFC 9315 reference | Lifecycle half |
|------|--------------------|----------------|
| `IngestPort` | §5.1.1 Ingestion | Fulfilment |
| `TranslatePort` | §5.1.2 Translation | Fulfilment |
| `ResolvePort` | §4 P1 SSoT/SVoT (resolution against the source of truth) | Fulfilment |
| `OrchestratePort` | §5.1.3 Orchestration | Fulfilment |
| `MonitorPort` | §5.2.1 Monitoring | Assurance |
| `AssessPort` | §5.2.2 Compliance Assessment | Assurance |
| `ActPort` | §5.2.3 Compliance Actions | Assurance (feeds back) |

> The §-numbers are taken from the programme's Standards Implementation Map; **verify against the RFC 9315 published text** before the spec is ratified (a Phase-0 review action, satisfying **D-2**).

---

## 2. The `IntentCycleRunner` contract (the core)

```ts
// @ibn-core/rfc9315-core — NO domain (BSS/resource) imports allowed here (NFR-ARCH-001)

export enum IntentPhase {            // exported enum — closes D6 / FR-010
  Ingest, Translate, Resolve, Orchestrate, Monitor, Assess, Act,
}

export interface IntentCycleRunner<I, S> {
  /** Run the RFC 9315 cycle for one intent until it reaches a steady
   *  assured state OR the SafetyGovernor halts it. The loop is CONTINUOUS
   *  (D-1): Monitor→Assess→Act feeds back into (re)fulfilment; it does NOT
   *  terminate at Act. */
  run(intent: IntentExpectation<I>, ctx: IntentHandlingContext<S>): AsyncIterable<AssuranceState<S>>;
}
```

The runner is parameterised by domain types `I` (intent expression) and `S` (resource/state model), supplied by the adapter set. It is **outcome-oriented** (D-4): it consumes an `IntentExpectation` (desired outcome) and emits a stream of `AssuranceState` (observed conformance), never an imperative command list.

### 2.1 Injected dependencies (the reused IMF coordination plane)

```ts
export interface IntentHandlingContext<S> {
  knowledge: KnowledgeStore<S>;        // reused façade (SSoT access)
  arbiter: ConflictArbiter;            // reused — precedence across intents
  shared: SharedStatePlane;            // reused — cross-agent coordination
  hierarchy: IntentHierarchy;          // reused — intent refinement (D-3)
  tools: SemanticToolRegistry;         // reused — capability discovery
  safety: SafetyGovernor;              // injectable cross-cut (D-1 / FR-008)
  telemetry: PhaseTelemetry;           // rfc9315.phase-tagged spans (FR-009)
}
```

These come from the existing v2.1.x reuse surface; the core re-exports them. Domains do **not** re-implement them.

---

## 3. The `PhaseStrategy` ports

Every port is **declarative** (D-4): inputs are expectations/observed-state, outputs are produced state or assessments — not step lists. Each is implemented by a domain adapter.

```ts
// Fulfilment ports (RFC 9315 §5.1)
export interface IngestPort<I>      { ingest(raw: unknown): Promise<IntentExpectation<I>>; }          // §5.1.1
export interface TranslatePort<I,S> { translate(i: IntentExpectation<I>, k: KnowledgeStore<S>): Promise<DesiredState<S>>; } // §5.1.2
export interface ResolvePort<S>     { resolve(d: DesiredState<S>, k: KnowledgeStore<S>): Promise<ResolvedTargets<S>>; }     // §4 P1
export interface OrchestratePort<S> { orchestrate(t: ResolvedTargets<S>): Promise<FulfilmentResult>; }                      // §5.1.3

// Assurance ports (RFC 9315 §5.2) — the continuous loop (D-1)
export interface MonitorPort<S>     { observe(t: ResolvedTargets<S>): AsyncIterable<ObservedState<S>>; }                    // §5.2.1
export interface AssessPort<S>      { assess(observed: ObservedState<S>, expected: DesiredState<S>): Promise<AssuranceState<S>>; } // §5.2.2
export interface ActPort<S>         { act(gap: ConformanceGap<S>): Promise<ActionOutcome>; }                               // §5.2.3 — re-enters fulfilment
```

### 3.1 Per-port responsibilities + two-domain validation (Gate A acceptance)

> The Gate-A criterion is "**port contracts validated against both domains**." Each port below shows its BSS (business-agent, public) and Resource (private) adapter — demonstrating the contract fits both without leaking either domain into the core.

| Port | RFC 9315 | Responsibility (declarative) | BSS adapter (public) | Resource adapter (private) |
|------|----------|------------------------------|----------------------|----------------------------|
| `IngestPort` | §5.1.1 | raw input → typed `IntentExpectation` | NL / TMF921 intent ingest | TMF921→TS 28.312 / YANG-Push event ingest |
| `TranslatePort` | §5.1.2 | expectation → `DesiredState` | Claude NL→TMF921 Intent | TS 28.312→YANG `DesiredState` render (deterministic) |
| `ResolvePort` | §4 P1 | which entities does it touch | customer/intent lookup (Redis SSoT) | SPARQL resolve over the KG (Fuseki SSoT) |
| `OrchestratePort` | §5.1.3 | enact desired state | MCP adapter orchestration | NETCONF `edit-config` (candidate/confirmed-commit) |
| `MonitorPort` | §5.2.1 | stream observed state | metrics / IntentReport source | YANG-Push telemetry stream |
| `AssessPort` | §5.2.2 | observed vs expected → conformance | `reportState` projection | SHACL validation of the state graph |
| `ActPort` | §5.2.3 | close the gap; re-plan | circuit-breaker / re-quote | re-render + re-commit; escalate to ConflictArbiter |

**Result**: all seven ports are satisfiable by *both* domains with no shared domain code — the contracts are domain-neutral. ✅ (Gate-A acceptance evidence.)

---

## 4. D-1 — Continuous intent assurance (the loop is not terminal)

The runner's control loop, in contract terms:

```
Ingest → Translate → Resolve → [safety.admit] → Orchestrate
                                       │
                          ┌────────────┘
                          ▼
        ┌──► Monitor ──► Assess ──► (conformant?) ──► yes ──► emit AssuranceState (steady)
        │                                │
        │                                └─ no ─► Act ──► [safety.admit] ──► re-Resolve / re-Orchestrate
        └──────────────────────────────────────────────────────────────────────┘   (feeds back)
```

- Assurance (§5.2.1–§5.2.3) is a **continuous cycle**, not a final step (**D-1**). `run()` returns an `AsyncIterable<AssuranceState>` precisely so assurance is observable per iteration, not only at completion.
- `Act` (§5.2.3) **re-enters fulfilment** (re-Resolve/re-Orchestrate) rather than terminating — the RFC 9315 closed loop.

---

## 5. D-3 — Intent refinement via `IntentHierarchy`

A higher-layer intent decomposes into lower-layer intents (RFC 9315 recursion), expressed through the reused `IntentHierarchy`:

```ts
// business intent (BSS) --refines--> resource intent (resource-intent-agent)
hierarchy.link(parentIntentId, childIntentExpectation);     // parent→child refinement
hierarchy.report(childIntentId, assuranceState);            // child assurance reported up
```

- The BSS runner may emit a child resource `IntentExpectation`; the resource runner consumes it and reports assurance back up. This is **genuine intent decomposition**, not code reuse (**D-3**).
- An orphan child intent (no parent) is still runnable standalone (resource-only intents).

---

## 6. D-4 — Declarative / outcome-oriented (no imperative pipeline)

Enforced at the contract boundary:

- Port inputs/outputs are **expectations and observed state** (`IntentExpectation`, `DesiredState`, `ObservedState`, `AssuranceState`) — never imperative command/step lists.
- The runner owns *sequencing*; adapters declare *what outcome* a phase produces, not *how the cycle proceeds*.
- **Design-review gate (D-4)**: any port whose contract takes an ordered list of imperative operations is rejected.

---

## 7. SafetyGovernor cross-cut (FR-008, relates 004 ADR-011)

```ts
export interface SafetyGovernor { admit(change: ProposedChange): Promise<AdmitDecision>; }  // 'allow' | 'gate' | 'halt'
```

- The runner calls `ctx.safety.admit(...)` **before every actuation** (`Orchestrate`, and `Act`'s re-commit).
- Resource supplies an **enforcing** governor (the G1 blast-radius gate, 004 ADR-011 thresholds); BSS supplies a **permissive** (no-op/allow) governor — both via the same hook.
- **Sequencing (R-005 mitigation)**: the hook is *defined* in the core now, but the resource SafetyGovernor stays where 004 ADR-011 placed it until **Phase 5**; only then is enforcement wired through the core hook.

---

## 8. The "no domain imports in core" rule (NFR-ARCH-001)

- The core package imports **zero** BSS/resource modules. A CI dependency rule fails any build that violates this.
- Domain types enter only as the generic parameters `I`/`S` and via injected adapters — never as imports.
- This is the structural guarantee that the abstraction is genuinely layer-agnostic (mitigates R-001).

---

## 9. Open questions for Gate-A review

1. **RFC §-number verification (D-2)**: confirm §5.1.1/§5.1.2/§5.1.3/§5.2.1/§5.2.2/§5.2.3 against the RFC 9315 text (the map is from the programme's CLAUDE.md, not yet re-checked against the RFC).
2. **`Resolve` placement**: is resolution a distinct port or part of `Translate`? (BSS folds it into translation; resource has a heavy SPARQL resolve — argues for a distinct port.)
3. **`AsyncIterable` vs callback** for the assurance stream — ergonomics vs back-pressure.
4. **Third-domain pre-check (R-007)**: sanity-check these ports against a service/slice (RFC 9543) sketch *before* Phase 1, so the abstraction isn't validated on only two domains.

---

## 10. Traceability

| This spec section | Satisfies | Source |
|-------------------|-----------|--------|
| §2 runner; §3 ports | FR-001, FR-002 | ARC-005-REQ |
| §3.1 two-domain table | FR-003, BR-002; **Gate A acceptance** | ARC-005-ROAD |
| §4 continuous loop | **FR-004 (D-1)** | ADR-005-001 Appendix D |
| §1 / §3 RFC §5 mapping | **FR-005 (D-2)** | ADR-005-001 Appendix D |
| §5 IntentHierarchy | **FR-006 (D-3)** | ADR-005-001 Appendix D |
| §6 declarative ports | **FR-007 (D-4)** | ADR-005-001 Appendix D |
| §7 SafetyGovernor hook | FR-008 | 004 ADR-011 |
| §2 telemetry; enum | FR-009, FR-010 | ARC-005-REQ |
| §8 no-domain-imports | NFR-ARCH-001 | ARC-005-REQ |

---

## 11. Gate-A Architecture Review Board (ARB) Record

**Board**: Vpnet Architecture Review Board (Gate A) · **Date**: 2026-06-14 · **Scope**: this port-contract spec as the Gate-A deliverable, alongside `ARC-005-ADR-001` (already APPROVED). Reviewed through three lenses: **architecture/solution**, a **simulated RFC 9315 author-persona** (advisory), and **security**.

> **Integrity label**: the RFC 9315 author-persona input is an **AI-generated advisory lens**, not a statement or endorsement by any real person. The board of record is the Vpnet ARB; named sign-offs remain [PENDING].

### 11.1 Findings

| Lens | Finding | Verdict |
|------|---------|---------|
| Solution / architecture | Runner is domain-neutral; the 7 ports are validated against **both** domains (§3.1) with no shared domain code; no-domain-imports rule (§8) makes it enforceable. | ✅ Pass |
| RFC 9315 fidelity (persona, advisory) | D-1 continuous assurance (§4), D-2 RFC-named ports mapped to §5 (§1/§3), D-3 intent refinement (§5), D-4 declarative ports (§6) are all satisfied **in contract form**. Caveat: §-numbers unverified against the RFC text (see action A1). | ✅ Pass (with A1) |
| Security | Public core has **no CTK/ODA/PII surface**; the one safety-critical element (SafetyGovernor) is *defined* as a hook but enforcement is correctly deferred to Phase 5 per 004 ADR-011 (R-005). Low exposure at this layer. | ✅ Pass |

### 11.2 Open-question dispositions

| # | Question | SRB disposition |
|---|----------|-----------------|
| Q1 | Verify RFC §-numbers against the RFC 9315 text | **Action A1** (not blocking Gate A) — verify before Phase-1 code freeze. Owner: Lead Architect. |
| Q2 | Is `Resolve` a distinct port or part of `Translate`? | **Decided: keep `ResolvePort` distinct.** Resource's SPARQL resolve is substantial; BSS folds a trivial resolve into a thin adapter. |
| Q3 | `AsyncIterable` vs callback for the assurance stream | **Decided: `AsyncIterable`** (back-pressure friendly); revisit only if Phase-1 ergonomics demand. |
| Q4 | Third-domain pre-check before Phase 1 | **Action A2** — paper-sketch a service/slice (RFC 9543) domain against these ports before Phase 1 starts (mitigates R-001/R-007). Owner: Lead Architect. |

### 11.3 Verdict & conditions

**Verdict: APPROVED WITH CONDITIONS — Gate A is complete** (ADR-005-001 approved + this spec reviewed). Conditions carried into Phase 1:

- **A1** — verify RFC 9315 §-numbers against the published text before Phase-1 code freeze (D-2).
- **A2** — third-domain (RFC 9543) paper-sketch against the ports before Phase 1 begins.
- **C1** — Phase 1 must implement the ports behaviour-preservingly for BSS and hold **TMF921 CTK 83/83** at the business-agent (Gate B).
- **C2** — the D-4 design-review gate (reject imperative port contracts) applies to every port PR.

### 11.4 Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Technical Architect | Roland Pfeifer | | [PENDING] |
| Governance Board | Vpnet Architecture Review Board | ✓ (Gate A) | 2026-06-14 |
| RFC 9315 standards lens | *simulated advisory (see §11 label) — not a real endorsement* | ✓ advisory | 2026-06-14 |

---

## External References

| Doc ID | Filename | Type | Source Location | Description |
|--------|----------|------|-----------------|-------------|
| ADR005 | ARC-005-ADR-001-v1.0.md | ADR | projects/005-ibn-core-rfc9315-core/decisions/ | Decision + D-1…D-4 (Appendix D) |
| REQ | ARC-005-REQ-v1.0.md | Requirements | projects/005-ibn-core-rfc9315-core/ | FR-001…010, NFR-ARCH-001 etc. |
| ROAD | ARC-005-ROAD-v1.0.md | Roadmap | projects/005-ibn-core-rfc9315-core/ | Phase 0 / Gate A |
| CLAUDE | CLAUDE.md | Project intelligence | repo root | Standards Implementation Map (RFC 9315 §5 mappings) |
| ADR011-004 | ARC-004-ADR-011-v1.0.md | ADR (private repo) | resource-intent-agent/…/decisions/ | SafetyGovernor (resource governor wired in Phase 5) |

**Citations**: [CLAUDE-C1] CLAUDE.md Standards Implementation Map — RFC 9315 §5.1.1/§5.1.2/§5.1.3/§5.2.1/§5.2.2/§5.2.3 mappings. [ADR005-C1] ARC-005-ADR-001 Appendix D — conditions D-1…D-4.

---

**Generated by**: Phase-0 design step (engineering deliverable for ARC-005-ROAD Gate A)
**Generated on**: 2026-06-14 GMT
**Project**: ibn-core-rfc9315-core (Project 005)
**AI Model**: claude-opus-4-8 (1M context)
**Generation Context**: Phase-0 port-contract spec encoding ADR-005-001 D-1…D-4; RFC 9315 §5 mappings reuse the programme Standards Implementation Map (CLAUDE.md), flagged for verification against the RFC text. TypeScript is contract sketch; Phase 1 implements. PUBLIC core — no CTK/ODA obligation.
