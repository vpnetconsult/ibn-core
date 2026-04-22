# TM Forum ODA Canvas CTK Compliance + AI-Native Canvas Alignment

**Component:** ibn-core v2.2.0
**ODA Component CRD:** `helm/ibn-core/templates/component.yaml`
**CRD apiVersion:** `oda.tmforum.org/v1alpha3`
**CTK reference:** https://github.com/tmforum-oda/oda-canvas-ctk
**AI-Native Canvas:** https://github.com/tmforum-oda/oda-canvas/blob/main/AI-Native-Canvas-design.md

> **Looking for the publication-grade conformance record?**
> See [`ODA_CANVAS_PUBLISHED_RESULTS.md`](ODA_CANVAS_PUBLISHED_RESULTS.md) — the
> formatted, self-declared test-results page suitable for ODA Canvas catalogue
> submission and external citation.

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
| **UC007** | External Auth Flow | 🛠 Declared (v2.3.0) — CTK pending | `oda.tmforum.org/externalAuthentication` annotation; Keycloak JWT validation via `src/auth-jwt.ts`. See §7 and [`UC007_CANVAS_CTK_RESULTS.md`](UC007_CANVAS_CTK_RESULTS.md). |
| UC006, UC008–UC015 | Advanced (events, auth flows) | ⬜ Out of scope v2.2.0 | See §5 |

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
| UC006 — Custom Observability | Planned for v2.3.0 — OpenTelemetry SDK + LangSmith backend. See [`../roadmap/canvas-uc/UC006-custom-observability.md`](../roadmap/canvas-uc/UC006-custom-observability.md). |
| UC007 — External Auth Flow | **Delivered in v2.3.0** — see §7 below. |
| UC008 — Internal Auth Flow | Planned post-UC007 — mTLS via Istio, reuses UC001 identity artefacts. |
| UC009–UC010 — Authorization + Token Refresh | Consumes the role-claim surface UC007 exposes (`req.auth.roles`). Not yet scoped. |
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

## 7a. UC007 — External Authentication Wiring (v2.3.0)

v2.3.0 activates Keycloak-issued JWT validation at the Component level. The
Canvas `identityconfig-operator-keycloak` provisions the realm, client, and
client-secret per UC001; UC007 is the runtime consumption of those artefacts.

**Component manifest annotation** (rendered from
[`helm/ibn-core/templates/component.yaml`](../../helm/ibn-core/templates/component.yaml)):

```yaml
metadata:
  annotations:
    oda.tmforum.org/externalAuthentication: |
      provider: keycloak
      mode: "jwt"
      identityBootstrap: identityconfig-operator-keycloak
      clientSecretName: "ibn-core-client-secret"
      tokenFormat: jwt-rs256
      claimsValidated: [iss, aud, exp, nbf, iat]
      jwksRotation: supported
      challengeHeader: "WWW-Authenticate: Bearer"
      roleClaims:
        - realm_access.roles
        - resource_access.<clientId>.roles
```

**Runtime configuration** (Helm values, see
[`helm/ibn-core/values.yaml`](../../helm/ibn-core/values.yaml)):

```yaml
auth:
  mode: jwt                # apiKey | jwt | both
  jwt:
    issuerUrl: "https://keycloak.canvas.svc/realms/canvas"
canvas:
  identityConfig:
    enabled: true          # mount ibn-core-client-secret as OIDC_CLIENT_ID / OIDC_AUDIENCE
```

**Runtime code path:**

- [`src/auth-router.ts`](../../src/auth-router.ts) — per-request dispatcher,
  honours `AUTH_MODE`.
- [`src/auth-jwt.ts`](../../src/auth-jwt.ts) — JWKS-backed validator using
  `jose.createRemoteJWKSet` (cache 10 min, cooldown 30 s, clock tolerance 30 s).
- [`src/auth.ts`](../../src/auth.ts) — legacy API-key path retained as the
  dev/standalone fallback.

**CTK execution record:** [`UC007_CANVAS_CTK_RESULTS.md`](UC007_CANVAS_CTK_RESULTS.md).

### Verify UC007 post-install

```bash
# 1. Confirm the Secret is mounted (values from identityconfig-operator-keycloak)
kubectl exec -n components deploy/ibn-core -- env | grep ^OIDC_
# Expected: OIDC_CLIENT_ID, OIDC_AUDIENCE set; OIDC_CLIENT_SECRET present but not echoed.

# 2. Unauthenticated → 401 with challenge
curl -i http://<ibn-core-host>/api/v1/intent | head -n 5
# Expected: HTTP/1.1 401 Unauthorized
#           WWW-Authenticate: Bearer realm="ibn-core", error="invalid_request", ...

# 3. Expired / bogus token → 401, never 500
curl -i -H "Authorization: Bearer aa.bb.cc" http://<ibn-core-host>/api/v1/intent | head -n 5
# Expected: HTTP/1.1 401 Unauthorized with error="invalid_token"

# 4. Valid Keycloak token → 200
#    (see UC007_CANVAS_CTK_RESULTS.md §4 for the client_credentials flow)
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
