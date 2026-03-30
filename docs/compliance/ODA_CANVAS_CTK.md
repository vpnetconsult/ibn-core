# TM Forum ODA Canvas CTK Compliance + AI-Native Canvas Alignment

**Component:** ibn-core v2.2.0
**ODA Component CRD:** `helm/ibn-core/templates/component.yaml`
**CRD apiVersion:** `oda.tmforum.org/v1alpha3`
**CTK reference:** https://github.com/tmforum-oda/oda-canvas-ctk
**AI-Native Canvas:** https://github.com/tmforum-oda/oda-canvas/blob/main/AI-Native-Canvas-design.md

---

## 1. Canvas Infrastructure Prerequisites

ibn-core is an ODA *Component* — it runs inside a Canvas, it does not install the Canvas itself.
The following must be pre-installed on the cluster via the `canvas-oda` umbrella Helm chart
before deploying ibn-core:

| Resource | Provided by | Purpose |
|----------|-------------|---------|
| `oda.tmforum.org/v1alpha3` CRD | `oda-crds` chart | Accepts `component.yaml` |
| `components` namespace | `canvas-namespaces` | Default target namespace |
| `component-operator` v1.4.3 | `canvas-oda` | Reconciles Component → ExposedAPI objects |
| `api-operator-istio` v1.1.4 | `canvas-oda` | Reads ExposedAPI → creates Istio routing |
| `identityconfig-operator-keycloak` v1.2.7 | `canvas-oda` | UC001 Keycloak role bootstrap |
| `oda-webhook` | `canvas-oda` | Validates component.yaml on admission |

**When using `api-operator-istio`:** set `istio.enabled=false` in ibn-core Helm values.
The Canvas operator owns Istio routing; ibn-core's own Istio templates would conflict.

---

## 2. CTK Use Case Coverage

| UC | Title | ibn-core Claim | Evidence |
|----|-------|----------------|----------|
| **UC001** | Identity Bootstrap | ✅ Declared | `spec.security.controllerRole: ibn-core-role` — `identityconfig-operator-keycloak` creates Keycloak client + role |
| **UC002** | Expose API in the Canvas | ✅ Declared | `spec.coreFunction.exposedAPIs[intentManagement]` — TMF921 at `/tmf-api/intentManagement/v5:8080` |
| UC003 | Retrieve API endpoint | ✅ Derived | `component-operator` creates ExposedAPI sub-resource; `api-operator-istio` resolves it |
| **UC004** | Publish Metrics | ✅ Declared | `spec.management.exposedAPIs[metrics]` — Prometheus at `/metrics:8080` |
| **UC005** | Retrieve Observability data | ✅ Declared | Prometheus scrape + Istio Telemetry (Jaeger traces) |
| UC006–UC015 | Advanced (events, auth flows) | ⬜ Out of scope v2.2.0 | See §5 |

---

## 3. AI-Native Canvas Alignment

The [AI-Native Canvas design](https://github.com/tmforum-oda/oda-canvas/blob/main/AI-Native-Canvas-design.md)
defines the next evolution of ODA Canvas. ibn-core is already an AI-native component.

| AI-Native Canvas Concept | ibn-core Implementation | Component Manifest |
|---|---|---|
| Components expose MCP tools | `src/mcp/McpAdapter.ts` — `orchestrate()`, `getIntentStatus()`, `getCapabilities()`, `cancelIntent()` | `annotations.oda.tmforum.org/mcpInterfaces` |
| `dependentModels` — LLM declaration | `src/claude-client.ts` — Claude Sonnet 4 (RFC 9315 §5.1.2 Translation) | `annotations.oda.tmforum.org/dependentModels` |
| A2A agent cards | `src/a2a/agent.ts` + `src/a2a/taxonomy.ts` — Ericsson paper Figure 1 taxonomy | `annotations.oda.tmforum.org/agentCard` |
| Evaluation datasets | O2C canonical test (CLAUDE.md §O2C Test Case) | `annotations.oda.tmforum.org/evaluationDataset` |
| AI Gateway — audit + guardrails | `src/policy/DLPPolicy.ts` + `src/policy/ToolPolicyEngine.ts` + Istio Telemetry | Declared via `dependentModels.guardrails` |

**Annotation strategy:** AI-native fields are declared as `metadata.annotations` in `component.yaml`
because the `oda.tmforum.org/v1alpha3` schema does not yet include `dependentModels`,
`mcpInterfaces`, or `agentCard` as first-class spec fields. When TM Forum publishes the schema,
these migrate to spec fields in a clean `v1beta1` follow-on PR.

---

## 4. TMF921 API Compliance (UC002 Evidence)

ibn-core achieves **83/83 (100%)** on the TMF921 CTK v5.0.0.

Full results: [`TMF921_CTK_RESULTS_V2_0_0.md`](TMF921_CTK_RESULTS_V2_0_0.md)

The Canvas `coreFunction.exposedAPIs` entry declares:

```yaml
- name: intentManagement
  specification: TMF921
  apitype: openapi
  path: /tmf-api/intentManagement/v5
  port: 8080
  required: true
  implementation: ibn-core-service
```

The `component-operator` creates an `ExposedAPI` sub-resource from this.
The `api-operator-istio` (or Kong/APISIX alternative) creates the route.

---

## 5. Out-of-Scope Use Cases

| UC | Reason |
|----|--------|
| UC006 — Custom Observability | Requires Canvas-managed LangSmith/OpenLLMetry integration |
| UC007–UC008 — External/Internal Auth | Keycloak flows managed by Canvas operator; no app code change needed |
| UC009–UC010 — Authorization + Token Refresh | Delegated to `identityconfig-operator-keycloak` |
| UC011 — License Metrics | Out of scope for Apache 2.0 open core |
| UC012–UC015 — Event Management | Requires Canvas EventHub CRD (`PublishedNotification`, `SubscribedNotification`) — planned for v3.0.0 CAMARA integration |

---

## 6. Helm Install Runbook

### Prerequisites

```bash
# 1. Install canvas-oda umbrella chart (Canvas operators + CRDs)
helm repo add oda-canvas https://tmforum-oda.github.io/oda-canvas
helm install canvas-oda oda-canvas/canvas-oda --namespace canvas --create-namespace

# 2. Verify Canvas CRDs are installed
kubectl get crd components.oda.tmforum.org
kubectl get crd apis.oda.tmforum.org

# 3. Verify Canvas operators are running
kubectl get deployment -n canvas component-operator api-operator-istio identityconfig-operator-keycloak
```

### Install ibn-core on Canvas

```bash
helm install ibn-core ./helm/ibn-core \
  --namespace components \
  --create-namespace \
  --set secrets.anthropicApiKey="$ANTHROPIC_API_KEY" \
  --set secrets.adminSecret="$ADMIN_SECRET" \
  --set secrets.piiHashSalt="$PII_HASH_SALT" \
  --set istio.enabled=false \   # Canvas api-operator-istio manages routing
  --wait --timeout 5m
```

### Standalone install (no Canvas)

```bash
helm install ibn-core ./helm/ibn-core \
  --namespace intent-platform \
  --create-namespace \
  --set namespace=intent-platform \
  --set secrets.anthropicApiKey="$ANTHROPIC_API_KEY" \
  --set secrets.adminSecret="$ADMIN_SECRET" \
  --set secrets.piiHashSalt="$PII_HASH_SALT" \
  --set istio.enabled=true \
  --wait --timeout 5m
```

---

## 7. Verification Steps

### Step 1 — Helm lint (no cluster needed)

```bash
helm lint ./helm/ibn-core \
  --set secrets.anthropicApiKey=test \
  --set secrets.adminSecret=test \
  --set secrets.piiHashSalt=test
# Expected: 0 errors, 0 warnings
```

### Step 2 — Verify component CRD is accepted

```bash
kubectl get component -n components ibn-core -o yaml
# Check: spec.coreFunction.exposedAPIs[0].name == intentManagement
# Check: spec.security.controllerRole == ibn-core-role
# Check: metadata.annotations contain oda.tmforum.org/agentCard
```

### Step 3 — Verify UC002: API exposure

```bash
kubectl get exposedapi -n components
# Expected: ibn-core-intentmanagement resource created by component-operator

# Test the exposed endpoint
curl -s http://<canvas-ingress>/tmf-api/intentManagement/v5/intent
# Expected: HTTP 200, JSON array
```

### Step 4 — Verify UC001: Keycloak role

```bash
kubectl get secret -n components | grep ibn-core
# Expected: ibn-core-client-secret (created by identityconfig-operator-keycloak)
```

### Step 5 — Verify UC004/005: Metrics

```bash
kubectl port-forward -n components svc/ibn-core-service 8080:8080
curl -s http://localhost:8080/metrics | head -5
# Expected: # HELP / # TYPE prometheus metric lines
```

### Step 6 — O2C regression (mandatory per CLAUDE.md)

```bash
curl -sX POST http://localhost:8080/api/v1/intent \
  -H 'Content-Type: application/json' \
  -d '{"customerId":"CUST-12345","intent":"I need internet for working from home"}' \
  | jq '{lifecycleStatus, reportState}'
# Expected: {"lifecycleStatus":"completed","reportState":"fulfilled"}
```

---

## 8. Standards References

| Standard | Version | Role |
|----------|---------|------|
| RFC 9315 | Oct 2022 | Intent-Based Networking primary standard |
| TMF921 | v5.0.0 | Intent Management API (83/83 CTK) |
| ODA Canvas CTK | — | Component registration validation |
| AI-Native Canvas design | Mar 2025 | AI-native component patterns |
| IG1253 | v3.0 | ODA Component Design Guidelines (cited by reference) |

---

*Last updated: 2026-03-29 — Vpnet Cloud Solutions Sdn. Bhd.*
