# UC007 — External Authentication Flow (ibn-core Implementation Plan)

| Field | Value |
|---|---|
| UC | **UC007** — External Authentication Flow |
| Current status | ⬜ Not covered. Today the service validates an API-key Bearer token in-process only. |
| Target version | **v2.3.0** (parallel to UC006; shared release window) |
| Canvas prerequisites | `identityconfig-operator-keycloak` ✅ (already referenced by UC001), Keycloak realm, Keycloak JWKS reachable from the component namespace |
| Effort estimate | **M** (2–3 days) |
| Depends on | UC001 — Identity Bootstrap ✅ covered (declarative). UC007 activates what UC001 provisions. |
| Blocks | UC008 (internal auth consistency), UC009 (role claims), UC010 (token refresh) |
| Plan author | Vpnet Cloud Solutions Sdn. Bhd. |
| Plan date | 2026-04-21 |

---

## 1. What UC007 Requires

UC007 covers the flow where an **external caller** (human user, partner
system, another ODA Component) authenticates to a Canvas-hosted Component
via the Canvas-managed Identity Provider — Keycloak in the reference
Canvas — and the Component validates the presented token against the IdP
before serving the request.

Canvas-side expectations:

- Component MUST accept a Bearer token issued by the Canvas Keycloak realm.
- Component MUST validate token signature against the realm's **JWKS**,
  never a static shared secret.
- Component MUST validate standard claims: `iss`, `aud`, `exp`, `nbf`,
  `iat`.
- Component SHOULD reuse the Keycloak **client** provisioned for it by
  `identityconfig-operator-keycloak` (the UC001 artefact) — specifically
  the `clientId` and `clientSecret` injected as a Secret into the
  component's namespace.
- Component SHOULD handle JWKS rotation without restart.

Canvas design references:

- [ODA Canvas CTK — UC007](https://github.com/tmforum-oda/oda-canvas-ctk)
- [`identityconfig-operator-keycloak` README](https://github.com/tmforum-oda/oda-canvas) (Canvas umbrella chart)

---

## 2. Current State in ibn-core (Evidence)

### 2.1 What the service does today

| Area | Where | Note |
|---|---|---|
| Bearer-token middleware | [`src/auth.ts:72–145`](../../../src/auth.ts) (`authenticateApiKey`) | Parses `Authorization: Bearer <token>`, looks it up in an **in-memory map** seeded from the `API_KEYS` env var. Timing-safe lookup (CWE-208 mitigated). |
| Dev seeding | [`src/auth.ts:58–66`](../../../src/auth.ts) | `NODE_ENV=development` auto-seeds `dev-api-key-12345` for `DEMO-CUSTOMER`. |
| Customer ownership check | [`src/auth.ts:194–228`](../../../src/auth.ts) (`validateCustomerOwnership`) | UC009-adjacent. `DEMO-CUSTOMER` bypass in dev. |
| Auth metrics | [`src/metrics.ts:38–50`](../../../src/metrics.ts) | `auth_success_total{method}`, `auth_failure_total{reason}`. |
| Canvas Keycloak declaration | [`helm/ibn-core/templates/component.yaml`](../../../helm/ibn-core/templates/component.yaml) `spec.security.controllerRole: ibn-core-role` | UC001 — declarative. The Canvas operator **creates** the Keycloak client; ibn-core does **not** currently read the resulting secret or validate Keycloak-issued tokens. |

### 2.2 The documented-vs-actual gap

The file header of `src/auth.ts` says:

> `JWT Authentication Middleware` — `JWT token validation with RS256
> algorithm` — `API key authentication fallback`

The implementation is the **opposite**: API-key primary, no JWT validation
at all. UC007 closes that gap and makes the docstring true.

---

## 3. Gaps for UC007

| # | Gap | Impact |
|---|-----|--------|
| G1 | No JWT validation middleware | UC007 fails outright |
| G2 | No JWKS fetch / cache / rotation | UC007 signature check fails |
| G3 | Keycloak client Secret (from `identityconfig-operator-keycloak`) is not consumed by the container | UC001 output is unused at runtime |
| G4 | No issuer / audience / expiry validation | Token forgery / replay risk |
| G5 | No dual-mode toggle (API key vs JWT) | Dev ergonomics regress if we delete API keys |
| G6 | No role / client-scope claim extraction | UC009 has nothing to read |
| G7 | No `WWW-Authenticate: Bearer` challenge response | OIDC client UX break |
| G8 | `auth_success_total{method}` label only has `api_key` | Canvas observability cannot distinguish auth modes |

---

## 4. Proposed Approach

**Principle:** add Keycloak-backed JWT validation as a **parallel** middleware
to the existing API-key path. Let Helm decide which is the gate for
production traffic. Keep API keys as a dev fallback only.

### Phase 1 — JWT Middleware (G1, G2, G4, G7)

- Dependency: `jose` (Apache-2.0, maintained, already used elsewhere in the
  TMF921 ecosystem). No `jsonwebtoken` — unmaintained issues around JWKS.
- New file `src/auth-jwt.ts` with:
  - `authenticateJwt(req, res, next)` middleware.
  - JWKS loader using `jose.createRemoteJWKSet(url, { cache, cooldown })`.
  - Claim validators: `iss`, `aud`, `exp`, `nbf`, `iat`.
  - Role extraction into `(req as any).auth.roles` from
    `realm_access.roles` and `resource_access[<clientId>].roles`.
  - On failure: `401` with `WWW-Authenticate: Bearer realm="ibn-core",
    error="invalid_token", error_description="<reason>"`.
- Env surface:
  - `OIDC_ISSUER_URL` — e.g. `https://keycloak.canvas.svc/realms/canvas`.
  - `OIDC_JWKS_URL` — derived from issuer `/.well-known/openid-configuration`
    on boot (fallback to explicit env).
  - `OIDC_AUDIENCE` — the Keycloak `clientId` created for ibn-core (read
    from the injected Secret, not hard-coded).
  - `OIDC_JWKS_CACHE_MAX_AGE_MS` — default `600000` (10 min).
  - `OIDC_JWKS_COOLDOWN_MS` — default `30000` (30 s — protects against
    flood on rotation).

### Phase 2 — Canvas Secret Consumption (G3)

- `helm/ibn-core/templates/deployment.yaml`: mount the Canvas-provisioned
  Keycloak client Secret (name convention: `ibn-core-client-secret`, created
  by `identityconfig-operator-keycloak` per UC001) as env vars
  `OIDC_CLIENT_ID` and `OIDC_CLIENT_SECRET`.
- Guard with `{{- if .Values.canvas.identityConfig.enabled }}` so standalone
  (non-Canvas) install still works.
- Add `values.yaml`:
  ```yaml
  canvas:
    identityConfig:
      enabled: false
      clientSecretName: ibn-core-client-secret
  auth:
    mode: "apiKey"   # one of: apiKey | jwt | both
    jwt:
      issuerUrl: ""
      audience: ""
  ```

### Phase 3 — Dual-Mode Routing (G5, G8)

- New `src/auth-router.ts` exporting `authenticate()` which:
  - Reads `process.env.AUTH_MODE` (`apiKey` | `jwt` | `both`).
  - `both`: try JWT first (if `Bearer` prefix + 3-segment dot-separated
    token), fall back to API-key path.
  - Single auth surface to all routes — `src/api/*` only imports
    `authenticate` from `auth-router`, not the concrete middleware.
- Extend `auth_success_total{method}` to emit
  `jwt` / `api_key` / `unknown` labels.

### Phase 4 — Role Claim Surface for UC009 (G6)

- Document the role-claim shape in `src/auth-router.ts` so the UC009 plan
  has a concrete hook:
  ```ts
  interface AuthContext {
    customerId: string;
    roles: string[];           // e.g. ["ibn-core:operator", "ibn-core:admin"]
    method: 'jwt' | 'api_key';
    authenticatedAt: Date;
  }
  ```
- UC007 does not itself enforce roles — that's UC009's job — but the surface
  lands now so UC009 is a middleware addition, not a refactor.

### Phase 5 — CTK Validation + Docs

- Run `oda-canvas-ctk` UC007 suite.
- Record results in `docs/compliance/UC007_CANVAS_CTK_RESULTS.md`.
- Update `docs/compliance/ODA_CANVAS_PUBLISHED_RESULTS.md` §4 matrix:
  UC007 ⬜ → ✅, bump revision.
- Update `src/auth.ts` file-header docstring so "JWT Authentication
  Middleware" is no longer a lie: rename to "API Key Authentication
  Middleware" or merge into `auth-router.ts`.

---

## 5. Files to Touch (Implementation PR, not this PR)

| File | Change type | Notes |
|---|---|---|
| `src/auth-jwt.ts` | **new** | JWKS + claim validation |
| `src/auth-router.ts` | **new** | Dual-mode dispatcher |
| `src/auth.ts` | edit | Fix header docstring; keep API-key path intact |
| `src/api/*.ts` | edit | Replace `authenticateApiKey` imports with `authenticate` from `auth-router` |
| `src/metrics.ts` | edit | Widen `auth_success_total{method}` label set |
| `src/package.json` | edit | Add `jose` dependency |
| `helm/ibn-core/values.yaml` | edit | New `canvas.identityConfig.*`, `auth.mode`, `auth.jwt.*` keys |
| `helm/ibn-core/templates/deployment.yaml` | edit | Mount Keycloak client Secret, set `OIDC_*` env vars |
| `helm/ibn-core/templates/component.yaml` | edit | Confirm `spec.security.controllerRole` is consumed; add `oda.tmforum.org/externalAuthentication` annotation |
| `helm/ibn-core/templates/configmap.yaml` | edit | Carry `AUTH_MODE` |
| `docs/compliance/ODA_CANVAS_CTK.md` | edit | New §7 — External Authentication wiring |
| `docs/compliance/ODA_CANVAS_PUBLISHED_RESULTS.md` | edit | UC007 → ✅, revision bump |
| `docs/compliance/UC007_CANVAS_CTK_RESULTS.md` | **new** | CTK execution record |
| `docs/security/API_AUTHENTICATION.md` | edit | Document JWT + dual-mode + Keycloak wiring |
| `CLAUDE.md` | edit | Add UC007 entry to Standards Implementation Map |
| `CHANGELOG.md` | edit | v2.3.0 entry |

Nothing under `src/store/`, `src/handlers/`, `src/tmf921/`, `src/mcp/`,
`business-intent-agent/`, `mcp-services-k8s/`, or `.github/` is modified.

---

## 6. Acceptance Criteria (Testable)

1. **JWT validates happy path.** A Keycloak-issued RS256 token with valid
   `iss`, `aud=ibn-core`, future `exp`, past `iat` → `200` on
   `GET /api/v1/intent`.
2. **JWT rejects bad signature.** Token signed with a different key → `401`
   with `WWW-Authenticate: Bearer error="invalid_token"`.
3. **JWT rejects expired token.** `exp` in the past → `401`,
   `error="invalid_token"`, `error_description` mentions expiry.
4. **JWT rejects wrong audience.** `aud=other-component` → `401`.
5. **JWKS rotation.** Keycloak rotates keys; within `cacheMaxAgeMs + cooldownMs`
   the next request with a token signed by the new key succeeds **without**
   pod restart.
6. **Dual-mode both.** `AUTH_MODE=both`: valid JWT succeeds; valid API key
   succeeds; random string fails with `401`.
7. **Canvas Secret is the source of truth.** With
   `canvas.identityConfig.enabled=true`, the pod reads `OIDC_CLIENT_ID` and
   `OIDC_AUDIENCE` from the mounted Secret, not from Helm values.
8. **Metric label set expanded.** `auth_success_total{method="jwt"}` is
   observed during the JWT happy-path test.
9. **Role claims populated.** An admin-role Keycloak token produces
   `req.auth.roles` containing `ibn-core:admin` (observable via a test-only
   debug route, never in production routes).
10. **Standalone install still works.** With
    `canvas.identityConfig.enabled=false` and `auth.mode=apiKey`, O2C
    canonical test still returns `lifecycleStatus=completed`.
11. **TMF921 CTK 83/83 regression.** No CTK test regresses when run with
    `auth.mode=both` and the pre-seeded `dev-api-key-12345`.
12. **Canvas UC007 CTK passes.** `oda-canvas-ctk` UC007 suite: all pass.

---

## 7. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| JWKS endpoint unreachable → every request 401 | Medium | High | Cache aggressively (`cacheMaxAgeMs=10min`), fail-closed but log loudly, surface `auth_failure_total{reason="jwks_unreachable"}` metric, add liveness probe that does not depend on JWKS |
| Clock skew causes valid tokens to be rejected | Medium | Medium | Accept `clockTolerance: 30` in `jose.jwtVerify` |
| API-key bypass of JWT in dual-mode | Medium | High | In `both` mode, require API keys to also carry a customer scope; document in `API_AUTHENTICATION.md` that `both` is for migration only; plan deprecation of API-key mode post-v3.0.0 |
| Role-claim shape mismatch between operators | High | Low | Audience is per-operator; `iss` check per-operator; claim mapping isolated to `auth-jwt.ts` |
| Dev ergonomics regress | Medium | Low | `auth.mode=apiKey` remains the default; CI / CTK still use API keys |
| Secret not yet provisioned at pod start | High | Medium | Liveness probe independent of auth; readiness probe waits on Secret mount (Kubernetes native); add `OIDC_STARTUP_GRACE_MS` window |
| Old bearer-token API-key strings accidentally accepted as JWTs | Low | Medium | JWT path requires 3-segment base64 + non-empty `kid` — API-key strings fail structural check fast |

---

## 8. Rollback

1. Set `auth.mode=apiKey` in Helm values → JWT middleware is never invoked;
   service reverts to pre-UC007 behaviour.
2. If JWT middleware throws during request handling, the `auth-router` wraps
   every call in try/catch and converts to `503` (not `500`) so it is
   obviously an auth-infrastructure problem, not a business-logic bug.
3. Full rollback: revert the implementation commit. Helm values are
   backwards compatible because every new key has a safe default
   (`auth.mode=apiKey`, `canvas.identityConfig.enabled=false`).

---

## 9. Out of Scope for UC007

- **Authorization / RBAC enforcement.** UC009 consumes the `roles` claim
  surface UC007 exposes; UC007 itself does not gate routes on roles.
- **Token refresh.** UC010.
- **Internal (service-to-service) auth.** UC008 — mTLS via Istio.
- **Multi-realm / multi-tenant.** UC007 targets a single Canvas realm;
  multi-operator federation lands in v4.0.0 per roadmap.
- **User management UI.** Keycloak is authoritative; ibn-core never exposes
  user CRUD.

---

## 10. Effort Estimate

| Phase | Effort | Notes |
|---|---|---|
| Phase 1 — JWT middleware | 0.75 day | `jose` integration + claim checks + test fixtures |
| Phase 2 — Canvas Secret consumption | 0.25 day | Helm-only |
| Phase 3 — Dual-mode router | 0.5 day | Routing + metric label widen |
| Phase 4 — Role-claim surface | 0.25 day | Type + test |
| Phase 5 — CTK validation + docs | 0.5 day | |
| Buffer / review | 0.5 day | |
| **Total** | **~2.75 days** (M) | |

---

## 11. Approval Gate

Docs-only plan PR. Merging authorises the plan; implementation lands in a
separate PR (`feat/uc007-external-authentication`) executing §5–§8.

---

## 12. References

- [`src/auth.ts`](../../../src/auth.ts) — current API-key middleware
- [`src/API_AUTHENTICATION.md`](../../../src/API_AUTHENTICATION.md) — current auth docs (pre-JWT)
- [`helm/ibn-core/templates/component.yaml`](../../../helm/ibn-core/templates/component.yaml) — `spec.security.controllerRole` declaration for UC001
- [ODA Canvas CTK](https://github.com/tmforum-oda/oda-canvas-ctk)
- [jose — JSON Object Signing and Encryption for Node.js](https://github.com/panva/jose)
- [`UC006-custom-observability.md`](UC006-custom-observability.md) — sibling plan, shared v2.3.0 release window

---

*Plan v1.0 — 2026-04-21 — Vpnet Cloud Solutions Sdn. Bhd. — Apache 2.0.*
