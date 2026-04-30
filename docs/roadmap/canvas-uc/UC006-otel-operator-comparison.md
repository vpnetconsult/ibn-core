# UC006 — OpenTelemetry Operator vs. In-Process SDK — Decision Doc

| Field | Value |
|---|---|
| Parent plan | [`UC006-custom-observability.md`](UC006-custom-observability.md) |
| Parent CTK results | [`UC006_CANVAS_CTK_RESULTS.md`](../../compliance/UC006_CANVAS_CTK_RESULTS.md) |
| Related roadmap | [`operatorhub/ibn-core-operatorhub-submission.md`](../operatorhub/ibn-core-operatorhub-submission.md) |
| Status | **🟡 Decision proposed — hybrid** |
| Author | Vpnet Cloud Solutions Sdn. Bhd. |
| Date | 2026-04-24 |

---

## 1. Why This Doc Exists

UC006 Phase 1 shipped an in-process OpenTelemetry NodeSDK bootstrap
([`src/telemetry.ts`](../../../src/telemetry.ts)) that exports OTLP/HTTP
directly to LangSmith. The upstream
[**OpenTelemetry Operator**](https://github.com/open-telemetry/opentelemetry-operator)
is available on both OperatorHub.io and the OpenShift Community catalog
(the same catalog ibn-core plans to ship into — see
[`ibn-core-operatorhub-submission.md`](../operatorhub/ibn-core-operatorhub-submission.md)).

Before Phase 2/3 land more domain instrumentation on top of
`telemetry.ts`, we need to decide whether the OTel Operator replaces,
augments, or runs parallel to what we already have.

---

## 2. What Each Approach Owns

### 2.1 In-process SDK (what we have today)

`src/telemetry.ts` is a 227-line bootstrap that:

- Constructs a `NodeSDK` with `OTLPTraceExporter` over HTTP/protobuf.
- Enables `getNodeAutoInstrumentations` for `http` + `express`; disables
  `fs` (noise) and `pino` (double-wrapping).
- Reads a direct env contract (`OTEL_ENABLED`, `OTEL_SERVICE_NAME`,
  `OTEL_EXPORTER_OTLP_ENDPOINT`, `OTEL_EXPORTER_OTLP_HEADERS`) plus a
  LangSmith convenience mode that synthesises `x-api-key` from a
  Kubernetes Secret-sourced `LANGSMITH_API_KEY`.
- Sets resource attributes including `service.name`, `service.version`,
  and `oda.component.*`.
- Starts at module import (must be the first `import` in `src/index.ts`)
  and flushes on SIGTERM / SIGINT.

**Boundary:** everything lives inside the ibn-core process.

### 2.2 OpenTelemetry Operator

The upstream operator ships three CRDs:

| CRD | Purpose |
|---|---|
| `OpenTelemetryCollector` | Declarative Collector deployments — Sidecar, Deployment, StatefulSet, or DaemonSet modes. Receivers / processors / exporters expressed as YAML config. |
| `Instrumentation` | Language-specific auto-instrumentation config — for Node.js, an init container copies the agent into the app pod and an env-var `NODE_OPTIONS=--require /otel-auto-instrumentation-nodejs/autoinstrumentation.js` wires it in. Triggered by pod annotation `instrumentation.opentelemetry.io/inject-nodejs: "true"`. |
| `OpAMPBridge` | Two-way control plane to fleet-manage collectors (not relevant to Phase 1–3). |

**Boundary:** the operator manages Collector pods and injects auto-
instrumentation into application pods. It never writes application code.

---

## 3. Dimension-by-Dimension Comparison

| Dimension | In-process SDK (today) | OTel Operator | Notes |
|---|---|---|---|
| **What it instruments** | HTTP + Express auto-spans, plus any explicit spans we add (Phase 2/3) | HTTP + Express + more (mongodb, pg, redis, fastify, grpc) via the Node.js agent | Operator agent bundle is broader than what we ship; ours is Express-only by choice |
| **Authoring custom spans** (`intent.*`, `gen_ai.*`, `ai_gateway.*`) | Native — import `trace.getTracer(…)` anywhere in the code | **Requires the same in-process SDK** — the operator cannot author application semantics | **This is the pivotal point.** Phase 2/3 must be in-app regardless |
| **Code coupling** | 6 OTel npm deps in `package.json`, must stay as runtime deps | Zero app-side deps if we rely on agent injection only | Hybrid keeps our deps but adds the operator for transport |
| **Collector in the trace path** | None — direct HTTP POST to LangSmith | OTel Collector pod(s) sit between app and backend | Collector unlocks batching, sampling, filtering, fan-out, backend swap |
| **Backend switching** | Redeploy ibn-core with new `OTEL_EXPORTER_OTLP_ENDPOINT` | Edit Collector `exporters:` YAML — no app redeploy | Operational win when we add Jaeger, Tempo, or a second LangSmith project |
| **Sampling / filtering / redaction** | None — every span ships | `tail_sampling`, `filter`, `attributes`, `redaction` processors in Collector | We will want `attributes`-processor redaction before any customer data hits a backend |
| **Secret handling** | `LANGSMITH_API_KEY` mounted into the app pod | Secret mounted into the Collector pod; app pod no longer needs the API key | Smaller blast radius — only Collector sees backend credentials |
| **Ops posture** | One process, one thing to debug | +1 control-plane component (operator) + N data-plane components (Collectors) | Non-trivial; pays off only when the Collector earns its keep |
| **OpenShift Community alignment** | N/A — no operator | Already published in the same catalog ibn-core targets in [`ibn-core-operatorhub-submission.md`](../operatorhub/ibn-core-operatorhub-submission.md) | Both operators install from the built-in OperatorHub UI — natural "same shelf" story |
| **Canvas UC006 conformance** | ✅ satisfies the "OTLP-compatible exporter" requirement | ✅ satisfies it and adds a Canvas-approved managed-collector pattern | Neither path is disallowed by UC006; the Canvas spec is backend-neutral |
| **Phase 1 re-run cost** | Zero — already shipped in [#35](https://github.com/vpnetconsult/ibn-core/pull/35) | Requires Collector CR + agent injection annotation + Helm updates | Need to quantify before committing |

---

## 4. The Three Options

### Option A — Pure in-process (status quo)

Keep `telemetry.ts` as-is. Never deploy an operator. Add Phase 2/3
domain spans inside the app.

- ✅ Zero new ops surface.
- ✅ Already shipped, already verified against LangSmith EU.
- ❌ No Collector → no sampling, no redaction, no fan-out. Every
  `gen_ai.prompt.*` attribute we add in Phase 2 ships raw to the
  configured backend.
- ❌ Backend switch = app redeploy.

### Option B — Pure OTel Operator (rip-and-replace)

Remove `telemetry.ts`, uninstall the six `@opentelemetry/*` npm
dependencies, annotate the Pod for injection, and accept whatever the
Node.js agent emits.

- ✅ Zero app-side telemetry code.
- ❌ **Blocks Phase 2 and Phase 3.** The domain spans UC006 actually
  needs — `intent.translate` (LLM), `mcp.<method>`, `intent.assess`
  with `tmf921.reportState`, AI-Gateway events — cannot be authored by
  an injected agent. The agent has no way to know our intent
  lifecycle; it only wraps well-known libraries.
- ❌ Throws away working, verified Phase 1 code.
- **Not viable.** Documented here for completeness.

### Option C — Hybrid (**recommended**)

Keep `telemetry.ts` as the **authoring surface** for explicit domain
spans. Add the OpenTelemetry Operator to manage a **Collector** in the
trace path. Change one Helm value — the endpoint — to route through the
Collector. Ship the backend config in the Collector CR, not the app.

```
                   ┌────────────────────────────┐
  app pod          │  ibn-core                  │
                   │  ├── telemetry.ts (NodeSDK)│
                   │  │     explicit spans:     │
                   │  │       intent.*, gen_ai.*│
                   │  │       mcp.*, ai_gateway.│
                   │  └── OTLPTraceExporter ────┼──► OTel Collector (Sidecar or cluster DaemonSet)
                   └────────────────────────────┘          │
                                                           │  batch / tail_sample / attributes-redact
                                                           ▼
                                            ┌─────────────────────────────┐
                                            │ OpenTelemetryCollector CR   │
                                            │   exporters:                │
                                            │     otlphttp/langsmith: ... │
                                            │     otlp/tempo: ...         │  (future)
                                            └─────────────────────────────┘
```

---

## 5. Why Hybrid

The deciding fact: **the OTel Operator does not author application
semantics.** `gen_ai.*` (GenAI semantic conventions), `rfc9315.phase`
tags, `ai_gateway.dlp.hit` / `.tool_policy.deny` / `.prompt_injection.hit`
events — every UC006-valuable span attribute listed in
[`UC006_CANVAS_CTK_RESULTS.md` §3.2](../../compliance/UC006_CANVAS_CTK_RESULTS.md)
— is emitted by **our** code calling `tracer.startActiveSpan(…)`. The
operator cannot do that work for us.

So we keep `telemetry.ts` because Phase 2/3 need it.

We add the operator because a Collector in the path earns two things
that matter before any real customer data flows:

1. **Redaction before egress.** A Collector `attributes` processor is
   the right place to scrub prompts and completions before they leave
   the cluster. Doing that in-app is fragile and backend-coupled.
2. **Backend switch without redeploy.** First Vpnet customer with a
   Canvas-managed Tempo or an in-house Jaeger does not force an
   ibn-core rebuild — they edit the Collector CR.

Both of those are Phase-4-adjacent work, so the hybrid choice defers
operator adoption to the right moment (not Phase 1), but we decide
*now* that Phase 1 stays as the eventual authoring surface rather than
something we rip out later.

---

## 6. Migration Delta (If / When We Adopt the Hybrid)

Scope of changes — all outside `src/`:

| Change | Where | Effort |
|---|---|---|
| Install OTel Operator from OpenShift Community catalog | cluster-admin action | Trivial |
| Add `OpenTelemetryCollector` CR (sidecar mode first; graduate to DaemonSet) | new file, e.g. `helm/ibn-core/templates/otel-collector.yaml`, gated on `observability.otel.collector.enabled` | S |
| Point `observability.otel.endpoint` at the local Collector service | `helm/ibn-core/values.yaml` comment update; default can stay LangSmith to keep single-pod installs working | S |
| Move `LANGSMITH_API_KEY` Secret from app pod to Collector pod | Helm values rewire | S |
| Remove the LangSmith convenience mode in `telemetry.ts` (optional, once all installs have a Collector) | `src/telemetry.ts` lines 124–130 | Trivial |
| Add `attributes` processor for prompt/completion redaction | Collector CR `config:` block | S |
| CTK run row update: `UC006.02` moves from **pending** → **pass** because the Canvas-managed-collector assumption is finally met | [`UC006_CANVAS_CTK_RESULTS.md` §4](../../compliance/UC006_CANVAS_CTK_RESULTS.md) | Doc-only |

What does **not** change:

- `telemetry.ts` boot ordering and the `first-import` rule from CLAUDE.md.
- The env contract (`OTEL_ENABLED`, `OTEL_EXPORTER_OTLP_ENDPOINT`).
- Resource attributes (`service.name`, `oda.component.*`).
- Phase 2/3 span-authoring work inside `claude-client.ts` /
  `McpAdapter` / AI-Gateway — all still in-app, all still on the
  existing SDK.
- Paper 1 / Paper 2 evidence — the spans listed in UC006 CTK §3.2
  continue to exist unchanged; they just travel through one more hop.

---

## 7. Non-Goals

- **Automatic instrumentation injection via `Instrumentation` CR.** We
  already import `@opentelemetry/auto-instrumentations-node` from inside
  the app. Running the operator's agent injector on top would
  double-wrap Express. Skip this part of the operator.
- **OpAMPBridge.** Single-cluster, single-deployment ibn-core does not
  need fleet management. Revisit only if Vpnet runs >10 Collectors.
- **Replacing Prometheus `/metrics`.** Metrics continue to flow through
  `prom-client` per the existing UC006 plan §2.1; Collector `prometheus`
  receiver is a separate decision deferred until a second metric
  consumer exists.

---

## 8. Open Questions (Non-Blocking)

| # | Question | Owner | Needed by |
|---|---|---|---|
| 1 | Collector deployment mode: Sidecar per app pod, or DaemonSet per node, or single Deployment? | Ops | Hybrid adoption (Phase 4) |
| 2 | Does the Canvas ship its own managed Collector under `observability-operator`, and if so does our Collector CR duplicate it? | TM Forum liaison | Before adding our own CR |
| 3 | Which `attributes` processor rules count as canonical redaction for AI-Gateway data? | Security / DPIA | Before any real prompt data flows |
| 4 | Should `ibn-core` Helm chart ship the Collector CR by default, or only when `observability.otel.collector.enabled=true`? | Chart maintainer | PR-time |

---

## 9. Decision

**Adopt Option C — hybrid — with adoption deferred to UC006 Phase 4.**

Rationale in one line: the operator cannot author our domain spans, so
we keep the in-process SDK; but the operator owns the transport layer
better than we ever will, so we route through it when the ops burden is
justified (Phase 4 — real customer data).

Until Phase 4, `telemetry.ts` stays exactly as shipped in
[#35](https://github.com/vpnetconsult/ibn-core/pull/35). Phase 2 and
Phase 3 add domain spans on top of it without any Collector dependency.

---

## 10. References

| Source | Purpose |
|---|---|
| [open-telemetry/opentelemetry-operator][1] | Upstream operator — CRDs, install paths |
| [OpenTelemetryCollector CRD reference][2] | Sidecar / Deployment / DaemonSet modes |
| [Node.js auto-instrumentation (operator)][3] | `Instrumentation` CR + injection annotation |
| [UC006 plan][4] | Parent implementation plan |
| [UC006 CTK results][5] | Phase 1 evidence (LangSmith EU smoke runs) |
| [ibn-core OperatorHub submission plan][6] | Same-catalog alignment rationale |

[1]: https://github.com/open-telemetry/opentelemetry-operator
[2]: https://github.com/open-telemetry/opentelemetry-operator/blob/main/docs/api/opentelemetrycollectors.md
[3]: https://github.com/open-telemetry/opentelemetry-operator#nodejs
[4]: UC006-custom-observability.md
[5]: ../../compliance/UC006_CANVAS_CTK_RESULTS.md
[6]: ../operatorhub/ibn-core-operatorhub-submission.md

---

*This document is published under the Apache License 2.0. Vpnet Cloud
Solutions Sdn. Bhd. 2026.*
