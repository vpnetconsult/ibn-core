# ibn-core — ODA Canvas Published Test Results

**Publication-grade conformance record for submission to the TM Forum ODA Canvas
Component Catalogue and for citation in academic / vendor-due-diligence contexts.**

> Self-declaration under the TM Forum ODA Conformance Programme.
> All evidence in this document is reproducible from the public repository
> [vpnetconsult/ibn-core](https://github.com/vpnetconsult/ibn-core) (Apache 2.0).

---

## 1. Conformance Summary Card

| Field | Value |
|---|---|
| **Component name** | `ibn-core` |
| **Component type** | ODA Component — AI-Native |
| **Domain** | B2C Customer Management |
| **Vendor** | Vpnet Cloud Solutions Sdn. Bhd. |
| **Component version** | 2.2.0 (Helm chart), code tag `v2.0.1` |
| **Repository** | https://github.com/vpnetconsult/ibn-core |
| **Licence** | Apache 2.0 |
| **Primary standard** | RFC 9315 Intent-Based Networking (IRTF NMRG, Oct 2022) |
| **TMF Open API** | TMF921 Intent Management v5.0.0 |
| **TMF921 CTK score** | **83 / 83 — 100%** |
| **ODA Canvas Use Cases** | UC001 ✅ · UC002 ✅ · UC003 ✅ · UC004 ✅ · UC005 ✅ · UC007 🛠 (v2.3.0, CTK pending) |
| **AI-Native Canvas readiness** | MCP tools · dependentModels · A2A agentCard · evaluationDataset — all declared |
| **Conformance type** | Self-declared, reproducible from public repo |
| **Test date** | February 2026 |
| **Publication date** | 2026-04-21 |

---

## 2. Attestation

The vendor attests, under the Apache 2.0 licence of the referenced repository,
that the results recorded on this page were produced by executing the
unmodified **TM Forum TMF921 Conformance Test Kit v5.0.0** (Cypress 12.17.4)
against a deployed instance of `ibn-core` at the commit identified in §7
"Reproducibility".

This is a **self-declared** conformance record. It is not a TM Forum-issued
certificate. Because the component source, manifests, and runbook are public,
any party can re-execute the CTK and independently verify the score.

---

## 3. Component Identity (ODA Canvas Catalogue Metadata)

These are the values the ODA Canvas operator reads from the `component.yaml`
manifest at [`helm/ibn-core/templates/component.yaml`](../../helm/ibn-core/templates/component.yaml).

```yaml
apiVersion: oda.tmforum.org/v1alpha3
kind: component
metadata:
  name: ibn-core
  annotations:
    oda.tmforum.org/componentVersion: "2.2.0"
    oda.tmforum.org/domain: "B2C Customer Management"
    oda.tmforum.org/aiNative: "true"
    oda.tmforum.org/featureSet: "TMF921"
spec:
  type: ibn-core
  version: "2.2.0"
  maintainers:
    - name: Vpnet Cloud Solutions Sdn. Bhd.
      url: https://github.com/vpnetconsult/ibn-core
  coreFunction:
    exposedAPIs:
      - name: intentManagement
        specification: TMF921
        apitype: openapi
        path: /tmf-api/intentManagement/v5
        port: 8080
        required: true
  management:
    exposedAPIs:
      - name: metrics
        apitype: prometheus
        path: /metrics
        port: 8080
  security:
    controllerRole: ibn-core-role
  dependentAPIs: []
```

---

## 4. ODA Canvas Use-Case Conformance

Reference: [TM Forum ODA Canvas CTK](https://github.com/tmforum-oda/oda-canvas-ctk).
Detailed evidence map: [`ODA_CANVAS_CTK.md`](ODA_CANVAS_CTK.md).

| UC | Title | Result | Evidence |
|---|---|---|---|
| **UC001** | Identity Bootstrap | ✅ Pass | `spec.security.controllerRole: ibn-core-role` → `identityconfig-operator-keycloak` creates Keycloak client + role. Verified by `kubectl get secret ibn-core-client-secret`. |
| **UC002** | Expose API in the Canvas | ✅ Pass | `spec.coreFunction.exposedAPIs[intentManagement]` → TMF921 at `/tmf-api/intentManagement/v5:8080`. `component-operator` materialises `ExposedAPI` CR. |
| **UC003** | Retrieve API endpoint | ✅ Pass | `api-operator-istio` reads `ExposedAPI` and creates the Istio route; endpoint resolvable via Canvas ingress. |
| **UC004** | Publish Metrics | ✅ Pass | `spec.management.exposedAPIs[metrics]` → Prometheus at `/metrics:8080`. Scrape target registered. |
| **UC005** | Retrieve Observability Data | ✅ Pass | Prometheus scrape + Istio Telemetry (Jaeger traces). |
| UC006 | Custom Observability | 🛠 Planned v2.3.0 | OpenTelemetry SDK + LangSmith backend. See [`../roadmap/canvas-uc/UC006-custom-observability.md`](../roadmap/canvas-uc/UC006-custom-observability.md). |
| **UC007** | External Auth Flow | 🛠 Delivered v2.3.0 — CTK pending | Keycloak JWT validation (`src/auth-jwt.ts`, `src/auth-router.ts`), `oda.tmforum.org/externalAuthentication` annotation. Run record: [`UC007_CANVAS_CTK_RESULTS.md`](UC007_CANVAS_CTK_RESULTS.md). |
| UC008 | Internal Auth Flow | ⬜ Not yet planned | mTLS via Istio; reuses UC007 identity artefacts. |
| UC009 | Authorization | ⬜ Out of scope | Delegated to `identityconfig-operator-keycloak`. |
| UC010 | Token Refresh | ⬜ Out of scope | Delegated to Canvas. |
| UC011 | Licence Metrics | ⬜ Not applicable | Apache 2.0 open core — no licence-metering surface. |
| UC012–UC015 | Event Management | ⬜ Out of scope v2.2.0 | Requires Canvas EventHub CRDs (`PublishedNotification` / `SubscribedNotification`). Planned for v3.0.0 alongside live CAMARA integration. |

**Use-case score (v2.0.1): 5 / 5 in-scope Use Cases passed. 10 out-of-scope, 0 failed.**

**v2.3.0 delta:** UC007 implementation delivered (JWT/Keycloak). CTK execution
against a Canvas with `identityconfig-operator-keycloak` is the remaining gate
before UC007 flips to ✅. UC006 (Custom Observability via OTel + LangSmith) is
in parallel development under the same release window.

---

## 5. TMF921 Intent Management v5.0.0 — CTK Results

**Test kit:** TM Forum TMF921 CTK v5.0.0 (Cypress 12.17.4).
**Standard:** TMF921 Intent Management API v5.0.0.
**Raw test log:** [`TMF921_CTK_RESULTS_V2_0_0.md`](TMF921_CTK_RESULTS_V2_0_0.md).
**Run analysis:** [`TMF921_CTK_ANALYSIS.md`](TMF921_CTK_ANALYSIS.md).

### 5.1 Final result

**83 / 83 — 100% pass.**

### 5.2 Test-group coverage

| Resource | Test count | Result |
|---|---|---|
| `Intent` — POST / GET / PATCH / DELETE / listing / field projection | 36 | 36 pass |
| `IntentSpecification` — GET / listing / field projection | 18 | 18 pass |
| `IntentReport` — GET / listing / field projection / DELETE | 29 | 29 pass |
| **Total** | **83** | **83 pass (100%)** |

Per-test detail (test IDs, response bodies, validators) is preserved in the raw
CTK log at [`TMF921_CTK_RESULTS_V2_0_0.md`](TMF921_CTK_RESULTS_V2_0_0.md).

### 5.3 Progression (v1.3 → v2.0.0)

| Run | Score | Blocker resolved |
|---|---|---|
| v1.3 baseline | 47 / 83 (56.6%) | Pre-Redis in-memory `Map` data loss across pod replicas. |
| v2.0.0 run 1 | 62 / 83 (74.7%) | `IntentReport` returned 404 — CTK tested Report before Intent existed. |
| v2.0.0 run 2 | 75 / 83 (90.4%) | `?fields=expression` / `?fields=name` projections omitted `creationDate`. |
| **v2.0.0 run 3** | **83 / 83 (100%)** | — |

Each blocker, its root cause, and the corresponding code fix (file + line) are
documented in [`TMF921_CTK_RESULTS_V2_0_0.md §Root Cause Analysis`](TMF921_CTK_RESULTS_V2_0_0.md).

---

## 6. AI-Native Canvas Readiness

Reference: [AI-Native Canvas design](https://github.com/tmforum-oda/oda-canvas/blob/main/AI-Native-Canvas-design.md)
(TM Forum, March 2025).

The `oda.tmforum.org/v1alpha3` schema does not yet include AI-native fields as
first-class `spec` entries. `ibn-core` declares them as forward-compatible
`metadata.annotations`; they migrate to `spec` fields in a clean `v1beta1`
follow-on when TM Forum publishes the schema.

| AI-Native concept | Declared | Implementation |
|---|---|---|
| **MCP tool exposure** | `oda.tmforum.org/mcpInterfaces` | [`src/mcp/McpAdapter.ts`](../../src/mcp/McpAdapter.ts) — `orchestrate`, `getIntentStatus`, `getCapabilities`, `cancelIntent` (RFC 9315 §5.1.3). |
| **dependentModels** | `oda.tmforum.org/dependentModels` | Claude Sonnet — RFC 9315 §5.1.2 natural-language translation. Guardrails declared: DLP, tool-policy RBAC, prompt-injection detection. |
| **A2A agentCard** | `oda.tmforum.org/agentCard` | [`src/a2a/agent.ts`](../../src/a2a/agent.ts) + `src/a2a/taxonomy.ts`. Endpoint: `/api/v1/intent/probe`. |
| **Evaluation dataset** | `oda.tmforum.org/evaluationDataset` | [`docs/compliance/O2C_EVALUATION.md`](O2C_EVALUATION.md) — Order-to-Cash canonical test. |
| **AI Gateway / guardrails** | `dependentModels.guardrails` | `src/policy/DLPPolicy.ts` + `src/policy/ToolPolicyEngine.ts` + Istio Telemetry. |

**AI-native readiness: all five concepts declared and implemented.**

---

## 7. Reproducibility — Replay This Run

Anyone with a Kubernetes cluster can reproduce the 83 / 83 result. Exact
procedure:

```bash
# 1. Pin to the tested commit
git clone https://github.com/vpnetconsult/ibn-core.git
cd ibn-core
git checkout v2.0.1   # commit 960a611

# 2. Install the Canvas (prereq — operators + CRDs)
helm repo add oda-canvas https://tmforum-oda.github.io/oda-canvas
helm install canvas-oda oda-canvas/canvas-oda \
  --namespace canvas --create-namespace

# 3. Install ibn-core as an ODA Component
helm install ibn-core ./helm/ibn-core \
  --namespace components --create-namespace \
  --set secrets.anthropicApiKey="$ANTHROPIC_API_KEY" \
  --set secrets.adminSecret="$ADMIN_SECRET" \
  --set secrets.piiHashSalt="$PII_HASH_SALT" \
  --set istio.enabled=false   # Canvas api-operator-istio manages routing

# 4. Port-forward the Canvas ingress
kubectl port-forward -n istio-system svc/istio-ingressgateway 8080:80

# 5. Seed the CTK (see TMF921_CTK_RESULTS_V2_0_0.md §CTK Runbook)
#    The CTK tests IntentReport before creating an Intent, so a seed
#    intent + its first report id must be pre-populated into
#    ~/Downloads/TMF921/DO_NOT_CHANGE/cypress.env.json.

# 6. Run the CTK
cd ~/Downloads/TMF921
bash Mac-Linux-RUNCTK.sh
# Expected: 83/83 passing (100%)

# 7. Run the canonical O2C regression test (CLAUDE.md mandatory check)
curl -sX POST http://localhost:8080/api/v1/intent \
  -H 'Content-Type: application/json' \
  -d '{"customerId":"CUST-12345","intent":"I need internet for working from home"}' \
  | jq '{lifecycleStatus, reportState}'
# Expected: {"lifecycleStatus":"completed","reportState":"fulfilled"}
```

Full runbook (including CTK seed JSON shape and re-seed requirement between
runs): [`TMF921_CTK_RESULTS_V2_0_0.md §CTK Runbook`](TMF921_CTK_RESULTS_V2_0_0.md).

---

## 8. Test Environment

| Component | Value |
|---|---|
| Test kit | TM Forum TMF921 CTK v5.0.0 (Cypress 12.17.4) |
| ibn-core version | v2.0.1 (commit `960a611`) |
| Helm chart version | ibn-core 2.2.0 |
| Kubernetes | kind (local, v1.29+) |
| Canvas umbrella chart | `canvas-oda` from `tmforum-oda/oda-canvas` |
| Ingress | Istio IngressGateway (NodePort) |
| Base URL | http://localhost:8080/tmf-api/intentManagement/v5 |
| Authentication | Bearer `dev-api-key-12345` (DEMO-CUSTOMER dev key) |
| Persistence | Redis 7-alpine, AOF enabled (RFC 9315 §4 P1 SSoT) |
| Translation model | Anthropic Claude Sonnet (RFC 9315 §5.1.2) |

Reproducible local stack: `helm/ibn-core` + `canvas-oda` umbrella. No external
CAMARA credentials required for the CTK run — the `MockMcpAdapter` covers the
orchestration path.

---

## 9. RFC 9315 §4 Principle Coverage

TMF921 CTK validates API conformance. RFC 9315 §4 principles are architectural
and cannot be mechanically tested; coverage is asserted with code pointers.

| Principle | Status at v2.0.1 | Evidence |
|---|---|---|
| P1 — Single Source of Truth / Single Version of Truth | ✅ Closed | Redis persistence, TTL 90 days. |
| P2 — One-Touch Interaction | ✅ Closed | `POST /api/v1/intent/probe` live. |
| P3 — Autonomy | ✅ Full | Kubernetes HPA + Istio circuit breakers. |
| P4 — Learning | ✅ Full | Claude Sonnet — §5.1.2 Translation. |
| P5 — Capability Exposure | ⚠️ Mock | `MockMcpAdapter.getCapabilities()`; live CAMARA = v3.0.0. |
| P6 — Abstract Intent | ✅ Full | O2C natural-language test case (CLAUDE.md §O2C Test Case). |

---

## 10. Limitations and Honest Gaps

This section exists to keep the publication record credible.

- **Self-declared, not TM Forum-issued.** No third-party auditor has signed
  off on the 83 / 83 result. The mitigation is that every artefact is public
  and reproducible.
- **UC006 – UC015 not claimed.** Advanced observability, external/internal
  auth flows, authorisation, token refresh, licence metrics, and event
  management are either out of scope for v2.2.0 or delegated to Canvas
  operators (see §4).
- **P5 Capability Exposure is mock-backed.** Live CAMARA operator integration
  is a v3.0.0 deliverable. U Mobile / Telekom Malaysia adapters are developed
  in a separate private repository under SI engagement.
- **CTK seed is manual.** The CTK tests `IntentReport` before creating an
  `Intent`, so each run requires pre-seeding `cypress.env.json`. This is a
  CTK design quirk, not an `ibn-core` defect; automation is tracked for a
  later runbook revision.
- **Test environment is a local `kind` cluster.** Multi-node production
  deployment characteristics (node-affinity, NetworkPolicy, HPA under load)
  are validated separately and are not part of the CTK score.

---

## 11. Publication Metadata

| Field | Value |
|---|---|
| Publication URL | `docs/compliance/ODA_CANVAS_PUBLISHED_RESULTS.md` (this file) |
| Canonical repo | https://github.com/vpnetconsult/ibn-core |
| Commit under test | `960a611` (tag `v2.0.1`) |
| Reproduction cost | ~20 min (single-node `kind` + CTK re-run) |
| Academic citation | R. Pfeifer, *ibn-core: RFC 9315 Intent-Based Networking Production Implementation*, GitHub, 2026, v2.0.1. |
| Contact | `SECURITY.md` / GitHub Issues on the canonical repo |

---

## 12. Revision History

| Date | Revision | Change |
|---|---|---|
| 2026-04-21 | 1.0 | Initial publication — TMF921 CTK 83 / 83 (v2.0.1) + Canvas UC001–UC005 attestation + AI-Native readiness declaration. |
| 2026-04-21 | 1.1 | Implementation delta: UC007 External Authentication delivered (Keycloak JWT via `identityconfig-operator-keycloak`). UC006 Custom Observability plan approved (OTel + LangSmith). Both await Canvas-side execution to flip from 🛠 to ✅. |

---

## 13. Related Documents

- [`ODA_CANVAS_CTK.md`](ODA_CANVAS_CTK.md) — detailed Canvas CTK evidence map
  and helm install runbook.
- [`TMF921_CTK_RESULTS_V2_0_0.md`](TMF921_CTK_RESULTS_V2_0_0.md) — raw CTK
  execution log and root-cause analysis of fixes.
- [`TMF921_CTK_ANALYSIS.md`](TMF921_CTK_ANALYSIS.md) — progression analysis
  v1.3 → v2.0.0.
- [`O2C_EVALUATION.md`](O2C_EVALUATION.md) — Order-to-Cash canonical
  evaluation dataset (AI-Native `evaluationDataset` target).
- [`TMF921_README.md`](TMF921_README.md) — TMF921 implementation overview.
- [`../standards/external-reviews/README.md`](../standards/external-reviews/README.md)
  — external-expert review programme.

---

*Copyright 2026 Vpnet Cloud Solutions Sdn. Bhd. — Apache 2.0.*
*Implements RFC 9315 — https://www.rfc-editor.org/rfc/rfc9315.*
