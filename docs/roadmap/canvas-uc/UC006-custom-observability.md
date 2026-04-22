# UC006 — Custom Observability (ibn-core Implementation Plan)

| Field | Value |
|---|---|
| UC | **UC006** — Custom Observability |
| Current status | 🛠 Plan approved 2026-04-22 — Phase 1 implementation in progress on `feat/uc006-langsmith-observability` |
| Target version | **v2.3.0** |
| Canvas prerequisites | OTLP-compatible collector (LangSmith is the default; any operator-side OTel collector works with a single env override) |
| Effort estimate | **M** (1–3 days) |
| Depends on | UC004 (Prometheus) ✅ covered · UC005 (base tracing) ✅ covered |
| Blocks | Paper 2 empirical observability claims · AI-Gateway audit trail |
| Plan author | Vpnet Cloud Solutions Sdn. Bhd. |
| Plan date | 2026-04-21 · revised 2026-04-22 (§9 LangSmith moved in-scope) |

---

## 1. What UC006 Requires

ODA Canvas UC006 covers **"specialised observability signals beyond the
standard Prometheus `/metrics` scrape and standard-library Istio tracing"**.
In a Canvas context, this means a component can declare a non-default signal
stream (LLM traces, custom business events, AI-gateway audit, long-running
workflow span graphs, LangSmith-style eval traces) and a Canvas-managed
collector can ingest it without bespoke plumbing per component.

For an **AI-Native component** like ibn-core, UC006 is the natural home for:

- LLM call telemetry — prompt, completion, token counts, model, latency.
- MCP tool-invocation spans with causal links to the parent intent.
- Intent-lifecycle custom spans (RFC 9315 §5.1.1–§5.2.3 phase markers).
- AI-Gateway decisions — DLP hits, tool-policy denies, prompt-injection
  detections with severity and matched pattern.
- Evaluation dataset replays — per-case pass/fail with trace.

Canvas design references:

- [AI-Native Canvas design](https://github.com/tmforum-oda/oda-canvas/blob/main/AI-Native-Canvas-design.md) — §"Observability" and §"AI Gateway".
- [ODA Canvas CTK](https://github.com/tmforum-oda/oda-canvas-ctk) — UC006
  acceptance script (Canvas-side).

---

## 2. Current State in ibn-core (Evidence)

### 2.1 What we already have

| Signal | Where | Covers |
|---|---|---|
| HTTP request duration histogram | [`src/metrics.ts:10–15`](../../../src/metrics.ts) | UC004 |
| Intent processing duration | [`src/metrics.ts:17–21`](../../../src/metrics.ts) | UC004 |
| Claude API call counter | [`src/metrics.ts:23–28`](../../../src/metrics.ts) | Partial — UC006-adjacent but count-only |
| MCP call counter | [`src/metrics.ts:30–35`](../../../src/metrics.ts) | Partial — UC006-adjacent but count-only |
| Auth success / failure counters | [`src/metrics.ts:38–50`](../../../src/metrics.ts) | UC009-adjacent |
| Prompt-injection detections | [`src/metrics.ts:52–57`](../../../src/metrics.ts) | AI-Gateway signal — count-only |
| PII masking operations | [`src/metrics.ts:59–64`](../../../src/metrics.ts) | AI-Gateway signal — count-only |
| Istio Telemetry → Jaeger traces | [`helm/ibn-core/templates/istio/telemetry.yaml`](../../../helm/ibn-core/templates/istio/telemetry.yaml) | UC005 (mesh-level spans only) |

### 2.2 What is missing for UC006

1. **No application-level tracing.** Istio Telemetry gives us mesh spans
   (pod → pod). It does **not** give us `intent.translate → claude.call →
   mcp.orchestrate → mcp.getStatus` causal chains inside the process.
2. **No LLM trace content.** We count Claude calls, we do not record prompt
   hash / token counts / model / finish-reason per call.
3. **No MCP tool-call spans with parent intent correlation.** Counter-only,
   no trace context propagated into `McpAdapter` calls.
4. **No OpenTelemetry SDK in the service.** `prom-client` only.
5. **No OTLP exporter.** Canvas `observability-operator` expects OTLP over
   gRPC or HTTP. We have no exporter wired.
6. **No ServiceMonitor or PodMonitor CR** for the Prometheus Operator — the
   scrape currently assumes the annotation-based pathway.
7. **No AI-Gateway audit log stream.** DLP / tool-policy / prompt-injection
   events land in counters only; the actual matched redaction text, pattern,
   and decision are not exported as structured events.

---

## 3. Gap Summary

| # | Gap | Canvas signal affected | Fix complexity |
|---|-----|-----------------------|----------------|
| G1 | No OpenTelemetry SDK in the Node service | All UC006 signals | M |
| G2 | No OTLP exporter wired to Canvas collector | All UC006 signals | S |
| G3 | LLM calls counted, not traced | AI-Native observability | S (once G1 lands) |
| G4 | MCP calls counted, not traced with parent span | AI-Native observability | S (once G1 lands) |
| G5 | No ServiceMonitor CR for Prometheus Operator | UC004 interop with Canvas | S |
| G6 | AI-Gateway decisions not exported as events | UC006 AI-Gateway audit | S |
| G7 | No `oda.tmforum.org/customObservability` annotation | Canvas discoverability | S |

---

## 4. Proposed Approach

**Principle:** adopt OpenTelemetry (OTLP) as the single span/metric/log export
surface. Keep `prom-client` for legacy Prometheus scrape; add OTEL SDK for
spans and for AI-specific events. Do not replace Istio Telemetry — stack it.

### Phase 1 — OTEL SDK + OTLP Exporter (G1, G2)

- Add `@opentelemetry/api`, `@opentelemetry/sdk-node`,
  `@opentelemetry/auto-instrumentations-node`,
  `@opentelemetry/exporter-trace-otlp-http`, `@opentelemetry/resources`,
  `@opentelemetry/semantic-conventions`.
- Bootstrap in a new `src/telemetry.ts`; import before any other module in
  `src/index.ts` so auto-instrumentation can hook `require`.
- Export endpoint configured via env: `OTEL_EXPORTER_OTLP_ENDPOINT`,
  `OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf`, `OTEL_SERVICE_NAME=ibn-core`,
  `OTEL_RESOURCE_ATTRIBUTES="oda.component.name=ibn-core,oda.component.version=2.3.0"`.
- **LangSmith as the default backend (workaround to avoid blocking on a
  Canvas-managed collector).** Default `OTEL_EXPORTER_OTLP_ENDPOINT` to
  `https://eu.api.smith.langchain.com/otel` (the Vpnet workspace is EU-
  region; a `lsv2_sk_...` key issued against a region returns 403 on the
  other region's endpoint), and carry the LangSmith API key + project
  via `OTEL_EXPORTER_OTLP_HEADERS=x-api-key=<key>,Langsmith-Project=ibn-core`.
  The exporter stays vendor-neutral OTLP/HTTP — operators running a
  Canvas OTel collector override `OTEL_EXPORTER_OTLP_ENDPOINT` and
  `OTEL_EXPORTER_OTLP_HEADERS` via Helm without code changes.
- Helm values: `observability.otel.enabled` (default false, flip to true
  on Canvas); `observability.otel.langsmith.{apiKeySecret,project}`;
  `observability.otel.endpoint` (override for non-LangSmith collectors).

### Phase 2 — Domain Spans (G3, G4)

- Wrap the Claude call in `src/claude-client.ts` in a span named `llm.translate` with
  attributes `llm.model`, `llm.prompt.hash`, `llm.prompt.tokens`,
  `llm.completion.tokens`, `llm.finish_reason`, `llm.latency_ms`.
  **Never** record raw prompt or completion text — hash only, per
  `docs/security/DPIA.md`.
- Wrap each `McpAdapter` method call in a span named
  `mcp.<method>` with attributes `mcp.adapter.name`,
  `mcp.intent.id`, `mcp.correlation.id`. Propagate trace context from the
  inbound HTTP request so Canvas can stitch mesh → app → tool.
- Add phase spans at RFC 9315 §5.1.1 / §5.1.2 / §5.1.3 / §5.2.1 / §5.2.2 /
  §5.2.3 boundaries using a small helper in `src/telemetry.ts`.

### Phase 3 — AI-Gateway Events (G6)

- Emit OTEL `Event`s (not just counter increments) on prompt-injection hit,
  DLP hit, and tool-policy deny, using span-attached events on the active
  span. Attributes: `ai_gateway.decision`, `ai_gateway.pattern`,
  `ai_gateway.severity`, `ai_gateway.action`.

### Phase 4 — Canvas Wiring (G5, G7)

- Add `helm/ibn-core/templates/servicemonitor.yaml` (behind
  `observability.serviceMonitor.enabled`) for the Prometheus Operator.
- Add `oda.tmforum.org/customObservability` annotation to
  `helm/ibn-core/templates/component.yaml` declaring the OTLP endpoint,
  signal types emitted, and the AI-Gateway event schema.
- Document in `docs/compliance/ODA_CANVAS_CTK.md` §6 ("Custom Observability")
  the Canvas-side collector wiring.

### Phase 5 — CTK Validation

- Run the `oda-canvas-ctk` UC006 test against the deployed component.
- Record result in a new
  `docs/compliance/UC006_CANVAS_CTK_RESULTS.md` following the same pattern
  as `TMF921_CTK_RESULTS_V2_0_0.md` (date, environment, pass/fail per check,
  root-cause notes for any fix).
- Update `docs/compliance/ODA_CANVAS_PUBLISHED_RESULTS.md` §4 matrix to flip
  UC006 from ⬜ to ✅ and bump revision history.

---

## 5. Files to Touch (Implementation PR, not this PR)

| File | Change type | Notes |
|---|---|---|
| `src/telemetry.ts` | **new** | OTEL SDK bootstrap, helpers, exporter config |
| `src/index.ts` | edit | Import `./telemetry` as the very first line |
| `src/claude-client.ts` | edit | Wrap translate call in `llm.translate` span |
| `src/mcp/McpAdapter.ts` | edit | Add OTEL spans to MockMcpAdapter methods |
| `src/policy/DLPPolicy.ts` | edit | Emit span event on DLP hit |
| `src/policy/ToolPolicyEngine.ts` | edit | Emit span event on tool-policy deny |
| `src/middleware/prompt-injection.ts` (if present) | edit | Emit span event on hit |
| `src/metrics.ts` | unchanged | Keep `prom-client` legacy surface intact |
| `src/package.json` | edit | 4 OTEL deps added |
| `helm/ibn-core/values.yaml` | edit | `observability.otel.*`, `observability.serviceMonitor.*` |
| `helm/ibn-core/templates/servicemonitor.yaml` | **new** | Prometheus Operator CR |
| `helm/ibn-core/templates/component.yaml` | edit | Add `oda.tmforum.org/customObservability` annotation |
| `helm/ibn-core/templates/deployment.yaml` | edit | Wire OTEL env vars |
| `docs/compliance/ODA_CANVAS_CTK.md` | edit | New §6 — Custom Observability wiring |
| `docs/compliance/ODA_CANVAS_PUBLISHED_RESULTS.md` | edit | UC006 → ✅, revision bump |
| `docs/compliance/UC006_CANVAS_CTK_RESULTS.md` | **new** | CTK execution record |
| `CLAUDE.md` | edit | Add OTEL bootstrap rule: "Import `./telemetry` before any other module" |
| `CHANGELOG.md` | edit | v2.3.0 entry |

Nothing under `src/api/`, `src/store/`, `business-intent-agent/`,
`mcp-services-k8s/`, or `.github/` is modified.

---

## 6. Acceptance Criteria (Testable)

1. **OTEL initialises.** With `observability.otel.enabled=true` and a local
   OTLP collector, the process logs `OpenTelemetry SDK started` at boot and
   the collector receives the service's resource attributes.
2. **Intent flow produces a single trace.** A `POST /api/v1/intent` generates
   one trace whose root span is the HTTP handler and whose child spans are,
   in order: `intent.ingest` → `llm.translate` → `mcp.orchestrate` →
   `intent.report.create`.
3. **LLM span attributes present.** `llm.translate` span carries
   `llm.model`, `llm.prompt.tokens`, `llm.completion.tokens`, and
   `llm.latency_ms`; **no raw prompt/completion text** appears in any
   attribute.
4. **AI-Gateway events.** A request that trips the DLP redactor produces a
   span event `ai_gateway.dlp.hit` with attributes `pattern`, `severity`,
   `action=redact`.
5. **ServiceMonitor CR is valid.** `kubectl apply` on the rendered
   `servicemonitor.yaml` succeeds and Prometheus Operator scrapes the
   endpoint.
6. **Canvas UC006 CTK passes.** `oda-canvas-ctk` UC006 suite returns **all
   pass**, recorded in the new results file.
7. **Regression gate.** TMF921 CTK 83/83 still passes (O2C canonical check
   per `CLAUDE.md` succeeds).
8. **No PII in exported spans.** A grep of collected OTLP output for
   known-PII values from the O2C test customer returns zero matches.

---

## 7. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| OTEL auto-instrumentation breaks existing routes | Medium | High | Feature-flag `observability.otel.enabled=false` by default; integration test before flipping. |
| Prompt text leaked as span attribute | Low | Very High | Code review gate + explicit `grep` test in acceptance §8; DPIA lists prompt content as masked. |
| OTLP exporter adds request-path latency | Medium | Medium | Use batching span processor; measure p95 before/after on O2C test; budget ≤5ms added latency. |
| Canvas collector endpoint differs per operator | High | Low | Configure via env var, not baked into chart defaults. |
| ServiceMonitor CRD not installed | Medium | Low | Wrap template in `{{- if .Values.observability.serviceMonitor.enabled }}`. |
| OTEL SDK version churn (pre-1.0 packages) | Medium | Medium | Pin exact versions; document upgrade path; keep `prom-client` as fallback. |

---

## 8. Rollback

1. Set `observability.otel.enabled=false` in Helm values → OTEL exporter
   shuts down, only `prom-client` remains.
2. If span-emitting code throws, wrap every domain span in a
   try/catch-never-throw helper; failure to emit a span must never fail the
   request. This is a design requirement of the span helpers, not a rollback
   step.
3. Full rollback: revert the implementation commit. Chart is backwards
   compatible because all new templates are gated by `enabled` flags.

---

## 9. Out of Scope for UC006

- **UC012–UC015 events.** Domain-event publish/subscribe is a different
  Canvas contract (EventHub CRDs) — not an observability signal.
- **Log aggregation.** UC006 is about spans / metrics / AI-specific events;
  log shipping to an OpenSearch/Loki stack is Canvas-side infrastructure.
- **Multi-tenant trace segregation.** v2.3.0 emits traces with customer IDs
  hashed per DPIA; per-tenant trace isolation is an operator-side concern.

**Previously out of scope, moved in scope on 2026-04-22:** LangSmith as
the default OTLP backend. We keep the exporter vendor-neutral (standard
OTLP/HTTP), but ship with the LangSmith endpoint + headers as the default
because no Canvas-managed collector is reachable in our current dev /
demo environments. Operators with a Canvas OTel collector override the
two env vars; no code change required.

---

## 10. Effort Estimate

| Phase | Effort | Notes |
|---|---|---|
| Phase 1 — OTEL SDK + exporter | 0.5 day | Boilerplate; mostly package additions and a new file. |
| Phase 2 — Domain spans | 0.5 day | ~5 call sites wrapped. |
| Phase 3 — AI-Gateway events | 0.5 day | ~3 policy modules. |
| Phase 4 — Canvas wiring | 0.25 day | Helm additions only. |
| Phase 5 — CTK validation + docs | 0.5 day | Includes results writeup. |
| Buffer / PR review / rework | 0.5 day | |
| **Total** | **~2.75 days** (M) | |

---

## 11. Approval Gate

**Plan approved 2026-04-22** by the Vpnet Cloud Solutions maintainer.
Implementation lands on `feat/uc006-langsmith-observability` (Phase 1 +
Phase 4 minimal wiring first; Phase 2/3 domain spans + AI-Gateway events
in a follow-up PR so each change stays reviewable).

Operator-partner coordination on the Canvas collector endpoint is **not
blocking** because the default LangSmith backend is operator-independent.
When an operator Canvas is available, they override
`observability.otel.endpoint` via Helm and their OTel collector ingests
the same OTLP/HTTP stream.

---

## 12. References

- [AI-Native Canvas design](https://github.com/tmforum-oda/oda-canvas/blob/main/AI-Native-Canvas-design.md)
- [ODA Canvas CTK](https://github.com/tmforum-oda/oda-canvas-ctk)
- [OpenTelemetry JS — SDK Node](https://github.com/open-telemetry/opentelemetry-js)
- [`ODA_CANVAS_CTK.md`](../../compliance/ODA_CANVAS_CTK.md) — current evidence map
- [`ODA_CANVAS_PUBLISHED_RESULTS.md`](../../compliance/ODA_CANVAS_PUBLISHED_RESULTS.md) — current published conformance record
- [`AI_AGENT_ALIGNMENT_PLAN.md`](../../architecture/AI_AGENT_ALIGNMENT_PLAN.md) — §"Agent trajectory observability" gap informed this plan
- [`src/metrics.ts`](../../../src/metrics.ts) — existing metrics surface
- [`helm/ibn-core/templates/istio/telemetry.yaml`](../../../helm/ibn-core/templates/istio/telemetry.yaml) — existing Istio Telemetry

---

*Plan v1.1 — 2026-04-22 — Vpnet Cloud Solutions Sdn. Bhd. — Apache 2.0.*
*v1.0 → v1.1 delta: §9 moves LangSmith in-scope as default OTel backend;
§4 Phase 1 specifies the LangSmith endpoint and env contract; §11 records
maintainer approval.*

*v1.1 → v1.1.1 patch (2026-04-22): default endpoint corrected to the EU
region (`https://eu.api.smith.langchain.com/otel`) after the first smoke
test returned HTTP 403 against the US endpoint with an EU-region key.
First successful end-to-end trace ingested 2026-04-22: span
`langsmith.smoke.test`, project `ibn-core`, visible at
eu.smith.langchain.com.*
