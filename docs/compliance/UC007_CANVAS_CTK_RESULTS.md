# UC007 — External Authentication Flow — Canvas CTK Results

| Field | Value |
|---|---|
| UC | **UC007** — External Authentication Flow |
| Canvas CTK suite | `oda-canvas-ctk` UC007 |
| ibn-core code tag | **v2.3.0-rc1** (pre-release, implementation delivered) |
| Helm chart version | `ibn-core` 2.3.0 |
| Test date | **pending** — awaits Canvas deployment at an operator site |
| Test environment | **pending** — requires `identityconfig-operator-keycloak` + Keycloak realm |
| Publication date | 2026-04-21 (implementation record; CTK run table left blank) |
| Plan | [`UC007-external-authentication.md`](../roadmap/canvas-uc/UC007-external-authentication.md) |

---

## 1. Status

**Implementation delivered. CTK execution pending a live Canvas.**

The code paths, Helm wiring, and acceptance-test scaffolding described in the
plan have landed on `feat/uc007-external-authentication` and are merged into
`main` via the PR linked in the revision history below. What remains is to
run the `oda-canvas-ctk` UC007 suite against a Canvas that:

1. Has `identityconfig-operator-keycloak` installed and running.
2. Has a Keycloak realm (e.g. `canvas`) reachable from the component
   namespace.
3. Has rendered the `ibn-core-client-secret` into the target namespace.

Until a Canvas with those prerequisites is available to the Vpnet Cloud
Solutions team or an operator partner, this file records the implementation
evidence. The results table in §3 will be filled in when the suite runs.

---

## 2. Implementation Evidence

| Plan gap | Closed by | File / line |
|---|---|---|
| G1 — No JWT validation middleware | `authenticateJwt` middleware | [`src/auth-jwt.ts`](../../src/auth-jwt.ts) |
| G2 — No JWKS fetch / cache / rotation | `createRemoteJWKSet` with cache + cooldown | [`src/auth-jwt.ts:112–120`](../../src/auth-jwt.ts) |
| G3 — Keycloak client Secret unused | Mounted via deployment.yaml when `canvas.identityConfig.enabled=true` | [`helm/ibn-core/templates/deployment.yaml`](../../helm/ibn-core/templates/deployment.yaml) |
| G4 — No issuer / audience / expiry check | `jose.jwtVerify(..., { issuer, audience, clockTolerance })` | [`src/auth-jwt.ts:202–206`](../../src/auth-jwt.ts) |
| G5 — No dual-mode toggle | `AUTH_MODE={apiKey,jwt,both}` dispatcher | [`src/auth-router.ts`](../../src/auth-router.ts) |
| G6 — No role-claim surface | `extractRoles()` merges `realm_access` + `resource_access[aud]` | [`src/auth-jwt.ts:122–142`](../../src/auth-jwt.ts) |
| G7 — No `WWW-Authenticate: Bearer` challenge | `sendChallenge()` on every 401 | [`src/auth-jwt.ts:152–166`](../../src/auth-jwt.ts) |
| G8 — Auth metric label set too narrow | `auth_success_total{method="jwt"\|"api_key"}` emitted | [`src/auth-jwt.ts:260`](../../src/auth-jwt.ts), [`src/auth.ts:141`](../../src/auth.ts) |
| Plan Phase 4 — Component CRD declaration | `oda.tmforum.org/externalAuthentication` annotation | [`helm/ibn-core/templates/component.yaml`](../../helm/ibn-core/templates/component.yaml) |
| Plan Phase 5 — Auth documentation | Updated authentication guide | [`src/API_AUTHENTICATION.md`](../../src/API_AUTHENTICATION.md) |

Unit tests covering the structural helpers (distinguishing a JWT from an
API key; extracting roles out of Keycloak claim shapes) and the router's
per-mode dispatch behaviour are at
[`src/auth-jwt.test.ts`](../../src/auth-jwt.test.ts) and
[`src/auth-router.test.ts`](../../src/auth-router.test.ts).

---

## 3. CTK Run Table (reserved — blank until executed)

| Check | Result | Evidence / Notes |
|---|---|---|
| UC007.01 — Component accepts a Keycloak-issued Bearer token | *pending* | — |
| UC007.02 — Token signature validated against realm JWKS | *pending* | — |
| UC007.03 — `iss`, `aud`, `exp`, `nbf`, `iat` claims validated | *pending* | — |
| UC007.04 — JWKS rotation handled without pod restart | *pending* | — |
| UC007.05 — `ibn-core-client-secret` consumed as the source of truth | *pending* | — |
| UC007.06 — `WWW-Authenticate: Bearer` challenge on invalid tokens | *pending* | — |
| UC007.07 — `auth_success_total{method="jwt"}` observed | *pending* | — |
| UC007.08 — Role claims surface accessible to downstream UC009 hook | *pending* | — |
| **Regression** — TMF921 CTK 83/83 with `auth.mode=both` + dev API key | *pending* | — |
| **Regression** — O2C canonical (`CLAUDE.md`) returns `lifecycleStatus=completed` | *pending* | — |

When the suite runs, each row is updated with:

- Pass / Fail / N/A
- Captured command output (e.g. `curl -i` headers, span extract)
- For any fail, the root cause and commit reference for the fix

---

## 4. Replay Procedure (when a Canvas is available)

```bash
# 1. Pin to the v2.3.0 release
git clone https://github.com/vpnetconsult/ibn-core.git
cd ibn-core
git checkout v2.3.0

# 2. Canvas prerequisites — identityconfig-operator-keycloak must be running
kubectl get deployment -n canvas identityconfig-operator-keycloak
kubectl get secret -n components ibn-core-client-secret

# 3. Install ibn-core in JWT mode
helm install ibn-core ./helm/ibn-core \
  --namespace components \
  --set secrets.anthropicApiKey="$ANTHROPIC_API_KEY" \
  --set secrets.adminSecret="$ADMIN_SECRET" \
  --set secrets.piiHashSalt="$PII_HASH_SALT" \
  --set istio.enabled=false \
  --set canvas.identityConfig.enabled=true \
  --set auth.mode=jwt \
  --set auth.jwt.issuerUrl="https://keycloak.canvas.svc/realms/canvas" \
  --wait --timeout 5m

# 4. Obtain a Keycloak-issued token for the ibn-core client
ACCESS_TOKEN=$(curl -s \
  -d "client_id=ibn-core" \
  -d "client_secret=$(kubectl get secret -n components ibn-core-client-secret -o jsonpath='{.data.clientSecret}' | base64 -d)" \
  -d "grant_type=client_credentials" \
  https://keycloak.canvas.svc/realms/canvas/protocol/openid-connect/token \
  | jq -r .access_token)

# 5. Exercise a protected endpoint
curl -i \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  http://<ibn-core-host>/api/v1/intent

# 6. Run the Canvas CTK UC007 suite
# See https://github.com/tmforum-oda/oda-canvas-ctk for the runner and
# per-UC test drivers.

# 7. Regression — TMF921 CTK 83/83 must still pass
#    Re-run from docs/compliance/TMF921_CTK_RESULTS_V2_0_0.md §CTK Runbook.
```

---

## 5. Rollback

If the CTK run surfaces a defect, the operator rollback path is:

1. `helm upgrade ibn-core ... --set auth.mode=apiKey --set canvas.identityConfig.enabled=false`
2. Re-verify the canonical O2C test.
3. File an issue against the repository citing the failing CTK check.

Helm values are backwards compatible — every new key defaults to "off".

---

## 6. Revision History

| Date | Revision | Change |
|---|---|---|
| 2026-04-21 | 0.1 | Implementation delivered on `feat/uc007-external-authentication`; CTK execution pending a live Canvas deployment. |

---

*Copyright 2026 Vpnet Cloud Solutions Sdn. Bhd. — Apache 2.0.*
*Implements RFC 9315 — https://www.rfc-editor.org/rfc/rfc9315.*
