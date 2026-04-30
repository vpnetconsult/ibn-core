# UC006 — Custom Observability — Canvas CTK Results (Phase 1 Smoke)

| Field | Value |
|---|---|
| UC | **UC006** — Custom Observability |
| Canvas CTK suite | `oda-canvas-ctk` UC006 (full suite pending — see §4) |
| ibn-core code tag | **v2.3.0-rc1** (post-merge of [#35](https://github.com/vpnetconsult/ibn-core/pull/35)) |
| Helm chart version | `ibn-core` 2.3.0 |
| Test environment | Local developer workstation → **LangSmith EU** (`eu.api.smith.langchain.com`) |
| Ingest endpoint | `https://eu.api.smith.langchain.com/otel/v1/traces` |
| Project | `ibn-core` |
| Test date | 2026-04-22 |
| Publication date | 2026-04-22 |
| Plan | [`UC006-custom-observability.md`](../roadmap/canvas-uc/UC006-custom-observability.md) |

---

## 1. Status

**Phase 1 ingest path verified end-to-end against LangSmith EU.**

The Canvas UC006 CTK suite is not runnable yet because no Canvas with a
managed OTel collector is reachable from our current environment. In
lieu of the Canvas CTK, two stand-in smoke runs have been executed
against the same `telemetry.ts` exporter the Helm chart wires up in
production:

1. **`langsmith.smoke.test`** — minimal single-span probe confirming the
   `OTEL_EXPORTER_OTLP_ENDPOINT` + `LANGSMITH_API_KEY` contract reaches
   LangSmith EU and renders as a run in the `ibn-core` project.
2. **`uc006-extensive-*`** — four-scenario harness emitting
   ~30 spans with OpenTelemetry GenAI semantic conventions, RFC 9315
   phase tags, MCP adapter attributes, and AI-Gateway event payloads.
   This run mirrors the trace shape that Phase 2/3 will emit once real
   code paths are instrumented.

The full UC006 CTK run table (§4) will be filled in when a Canvas with
a managed collector becomes available. Until then, these smoke runs
are the ingest-path evidence for the UC006 claim.

---

## 2. Smoke Run 1 — Minimal Ingest Probe

| Field | Value |
|---|---|
| Run name | `langsmith.smoke.test` |
| Purpose | Prove OTLP/HTTP bytes leave the process and land in LangSmith |
| Exporter | `@opentelemetry/exporter-trace-otlp-http` 0.215.0 |
| Endpoint | `https://eu.api.smith.langchain.com/otel/v1/traces` |
| Auth header | `x-api-key: <redacted>` + `Langsmith-Project: ibn-core` |
| Result | ✅ 1 span visible in LangSmith EU `ibn-core` project |

**How to reproduce.** From a pod or workstation with the same Secret
mounted as `LANGSMITH_API_KEY`:

```bash
OTEL_ENABLED=true \
OTEL_SERVICE_NAME=ibn-core \
OTEL_EXPORTER_OTLP_ENDPOINT=https://eu.api.smith.langchain.com/otel \
LANGSMITH_API_KEY=$(kubectl get secret ibn-core-langsmith -n intent-platform -o jsonpath='{.data.apiKey}' | base64 -d) \
LANGSMITH_PROJECT=ibn-core \
node -e "require('./telemetry'); \
  const { trace } = require('@opentelemetry/api'); \
  const t = trace.getTracer('smoke'); \
  t.startActiveSpan('langsmith.smoke.test', s => { s.end(); }); \
  setTimeout(() => process.exit(0), 2000);"
```

**Known footgun — LangSmith regions.** A `lsv2_sk_...` key is region-
scoped. Posting an EU key against the US endpoint returns HTTP 403 with
no body. Probe the key's region with:

```bash
curl -s -o /dev/null -w '%{http_code}\n' -H "x-api-key: $KEY" \
  https://eu.api.smith.langchain.com/api/v1/sessions?limit=1
# 200 → EU, 403 → try US
```

The chart default endpoint (`values.yaml`) is **EU** since the current
Vpnet Cloud Solutions account lives there. US-region operators
override:

```
--set observability.otel.endpoint=https://api.smith.langchain.com/otel
```

---

## 3. Smoke Run 2 — RFC 9315 Scenario Harness

| Field | Value |
|---|---|
| Run ID | `uc006-extensive-1776851841678` |
| Scenarios | 4 (see below) |
| Total spans emitted | ~30 |
| Exporter | Same as Run 1 (OTLP/HTTP protobuf → LangSmith EU) |
| Instrumentation | Explicit spans only (NodeSDK with `instrumentations: []`) |
| Result | ✅ 4 root traces visible in LangSmith EU `ibn-core` project |

### 3.1 Scenarios

| # | Scenario | Root span | Root status | What it exercises |
|---|---|---|---|---|
| A | `A-happy-path` | `http.server.request POST /tmf-api/intentManagement/v5/intent` | OK | Full RFC 9315 lifecycle: ingest → translate[LLM] → orchestrate[3 × MCP + offer LLM] → monitor → assess `fulfilled` |
| B | `B-dlp-redaction` | same as A | OK | Happy tree + 2 × `ai_gateway.dlp.hit` events (email, phone-e164) on `intent.ingest`; `dlp.redactions.count=2` |
| C | `C-tool-policy-deny` | early-exit at `intent.orchestrate` | ERROR | `ai_gateway.tool_policy.deny` event (`tool=mcp.bss.cancel_service`, `role=customer`, `required=admin`); `reportState=compliantFailure` |
| D | `D-prompt-injection-block` | early-exit at `intent.ingest.blocked` | ERROR | `ai_gateway.prompt_injection.hit` (`pattern=jailbreak-v2`, `rule=PI-017`); ingest rejected before translation |

### 3.2 Attributes per span family

| Span family | Key attributes |
|---|---|
| `http.server.request` | `http.method`, `http.route`, `http.status_code`, `net.peer.ip` |
| `intent.ingest` | `rfc9315.phase=5.1.1`, `intent.id`, `intent.customer_id`, `tmf921.version=v5.0.0` |
| `intent.translate` (LLM) | `rfc9315.phase=5.1.2`, `gen_ai.system=anthropic`, `gen_ai.request.model=claude-sonnet-4-20250514`, `gen_ai.usage.input_tokens`, `gen_ai.usage.output_tokens`, `gen_ai.prompt.0.content` (DEMO-labelled), `gen_ai.completion.0.content` (DEMO-labelled) |
| `intent.orchestrate` | `rfc9315.phase=5.1.3`, `mcp.server.count` |
| `mcp.<method>` | `mcp.server=<bss\|knowledge-graph\|customer-data>`, `mcp.tool`, `mcp.request.id`, `rpc.system=mcp` |
| `intent.monitor` | `rfc9315.phase=5.2.1`, `intent.telemetry.source=prometheus+otel` |
| `intent.assess` | `rfc9315.phase=5.2.2`, `tmf921.reportState=fulfilled\|compliantFailure` |

### 3.3 AI-Gateway event payloads

Events are attached via `span.addEvent(name, attributes)`:

| Event | Attributes |
|---|---|
| `ai_gateway.dlp.hit` | `dlp.rule`, `dlp.match.type=email\|phone-e164`, `dlp.span.start`, `dlp.span.end`, `dlp.action=redact` |
| `ai_gateway.tool_policy.deny` | `tool_policy.rule`, `tool_policy.tool`, `tool_policy.role.actual`, `tool_policy.role.required`, `tool_policy.action=deny` |
| `ai_gateway.prompt_injection.hit` | `prompt_injection.pattern`, `prompt_injection.rule`, `prompt_injection.action=block` |

### 3.4 How to find the run in LangSmith

Navigate to the EU project:

> <https://eu.smith.langchain.com/o/-/projects/p/ibn-core>

Filter by tag `run.id=uc006-extensive-1776851841678`, or by the
`scenario` tag (`A-happy-path`, `B-dlp-redaction`, `C-tool-policy-deny`,
`D-prompt-injection-block`) to isolate individual scenarios.

---

## 4. Canvas CTK Run Table (to be filled in)

| CTK check | Expected | Observed | Notes |
|---|---|---|---|
| `UC006.01` — Component declares `customObservability` annotation | present | **pending** | Annotation rendered by `helm/ibn-core/templates/component.yaml` when `observability.otel.enabled=true` |
| `UC006.02` — Exporter reaches Canvas collector | OTLP/HTTP POST 200 | **pending** | Smoke runs 1 + 2 prove the exporter reaches *an* OTLP/HTTP collector (LangSmith); Canvas-collector run pending |
| `UC006.03` — Traces include `service.name=ibn-core` | yes | **pending** | Resource attribute set in `telemetry.ts` via `resourceFromAttributes` |
| `UC006.04` — Rollback toggle works | `enabled=false` → no export | **pending** | Verified locally — gate assertion covered by `src/telemetry.test.ts` |
| `UC006.05` — RFC 9315 phase tags present on lifecycle spans | `rfc9315.phase` on every domain span | partial | Auto-instrumentation spans do not carry phase tags; Phase 2 closes this gap |

---

## 5. Known Limitations — Phase 1

The spans that reach LangSmith from the real service today are **only**
the auto-instrumentation set:

- `http.server.request` (`@opentelemetry/instrumentation-http`)
- `express.handler` (`@opentelemetry/instrumentation-express`)

The scenario harness in §3 emits realistic domain spans (LLM, MCP,
AI-Gateway) to show what LangSmith will render **once Phase 2 and
Phase 3 land.** Phase 1's scope is the ingest-path proof only:

| Phase | Scope | Status |
|---|---|---|
| 1 | OTel SDK + OTLP/HTTP exporter + Helm wiring + LangSmith default | ✅ merged in [#35](https://github.com/vpnetconsult/ibn-core/pull/35) |
| 2 | Explicit `llm.translate` / `mcp.*` domain spans in `claude-client.ts` and `McpAdapter` | pending |
| 3 | AI-Gateway span events (DLP / tool-policy / prompt-injection) on real policy modules | pending |
| 4 | Route through an in-cluster OTel Collector managed by the OpenTelemetry Operator — see [`UC006-otel-operator-comparison.md`](../roadmap/canvas-uc/UC006-otel-operator-comparison.md) | decision recorded (hybrid), implementation pending |
| 5 | Canvas CTK UC006 run — completes §4 table | pending |

Phase 2 and 3 close UC006.05 on the CTK table; Phase 4 moves the
exporter onto a Canvas-compatible Collector (closing UC006.02 when a
Canvas is reachable); Phase 5 closes the remaining rows.

---

## 6. Security Notes

- The LangSmith API key was installed as a Kubernetes Secret
  (`ibn-core-langsmith.apiKey` in namespace `intent-platform`).
  `telemetry.ts` redacts the key in the boot log to a 4-character
  prefix + length marker (`lsv2…(58)`).
- The Helm chart never inlines the key — the key lives only in the
  Secret, which the deployment mounts as `LANGSMITH_API_KEY`.
  `telemetry.ts` synthesises the `x-api-key` / `Langsmith-Project`
  header pair at boot, which avoids leaking the key into the rendered
  ConfigMap.
- Prompt and completion content on demo LLM spans is **DEMO-labelled**
  synthetic text. No PII and no real Anthropic calls were made during
  either smoke run.

---

## 7. Revision History

| Revision | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-04-22 | Vpnet Cloud Solutions | First publication — Phase 1 ingest-path smoke results (LangSmith EU, 2 runs, 4 scenarios). CTK run table left blank pending Canvas availability. |

---

*This document is published under the Apache License 2.0. Vpnet Cloud
Solutions Sdn. Bhd. 2026.*
