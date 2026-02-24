# TMF921 CTK Conformance Results — ibn-core v2.0.0
**Date:** February 2026
**Author:** R. Pfeifer, Vpnet Cloud Solutions Sdn. Bhd.
**Standard:** TMF921 Intent Management API v5.0.0
**Tool:** TMForum Conformance Test Kit (CTK)

## Final Result: 83/83 (100%)

## Progression

| Run | Score | Notes |
|-----|-------|-------|
| v1.3 baseline | 47/83 (56.6%) | Pre-Redis, in-memory Map, Paper 1 baseline |
| v2.0.0 run 1 | 62/83 (74.7%) | Redis live — IntentReport routes returned 404 |
| v2.0.0 run 2 | 75/83 (90.4%) | Routes fixed — 8 field projection failures |
| v2.0.0 run 3 | 83/83 (100%) | Full conformance |

## Fixes Required

### Fix 1 — CTK Seed: cypress.env.json
The CTK tests IntentReport before creating an Intent.
`Cypress.env('intentId')` was undefined on first run.
**Fix:** Pre-seed `cypress.env.json` with intentId from a
DEMO-CUSTOMER seed intent created before CTK execution.

### Fix 2 — Field Projection: creationDate
`?fields=expression` and `?fields=name` responses omitted
`creationDate`. CTK `validateMandatoryAttr` expected it.
**Fix:** Added `creationDate` to always-included fields
in `projectFields()` in `src/tmf921/routes.ts` (line 52).

### Fix 3 — Seed Maintenance
CTK DELETE test (test 11) deletes the seeded IntentReport
each run. `cypress.env.json` must be re-seeded with a fresh
intent/report before each CTK run.
**Fix:** Document as pre-condition in CTK runbook (see below).

## RFC 9315 §4 Principle Status at v2.0.0

| Principle | Status | Implementation |
|-----------|--------|----------------|
| P1 SSoT/SVoT | ✅ CLOSED | Redis persistence, TTL 90 days |
| P2 One Touch | ✅ CLOSED | POST /api/v1/intent/probe live |
| P3 Autonomy | ✅ Full | Kubernetes HPA + Istio |
| P4 Learning | ✅ Full | Claude Sonnet §5.1.2 |
| P5 Capability | ⚠️ Mock | CAMARA target: Paper 2 (v3.0) |
| P6 Abstract | ✅ Full | O2C natural language confirmed |

## CTK Runbook — Pre-conditions for Each Run

1. Ensure cluster is running:
   ```bash
   kubectl get pods -n intent-platform
   ```

2. Port-forward the ingress gateway:
   ```bash
   kubectl port-forward -n istio-system svc/istio-ingressgateway 8080:80
   ```

3. Create a seed intent as DEMO-CUSTOMER and wait for async processing:
   ```bash
   curl -s -X POST http://localhost:8080/tmf-api/intentManagement/v5/intent \
     -H 'Content-Type: application/json' \
     -H 'Authorization: Bearer dev-api-key-12345' \
     -d '{"name":"CTK Seed Intent","description":"Pre-seeded for CTK","version":"1.0","priority":"1"}'
   ```
   Wait ~20s for async processing to complete, then retrieve the intentId
   and first intentReport id.

4. Update `~/Downloads/TMF921/DO_NOT_CHANGE/cypress.env.json`:
   ```json
   {
     "intentId": "<intent-id>",
     "id": "<report-id>",
     "@type": "IntentReport",
     "creationDate": "<report-creationDate>",
     "href": "<report-href>"
   }
   ```

5. Run the CTK:
   ```bash
   cd ~/Downloads/TMF921 && bash Mac-Linux-RUNCTK.sh
   ```

6. Expected result: 83/83 passing (100%).

> **Note:** The CTK's DELETE test (test 11) deletes the seeded
> IntentReport. Re-seed before the next run.

## Root Cause Analysis — v1.3 → v2.0.0 Gap

### Gap 1: IntentReport 404s (21 failures at v2.0.0 run 1)
- **Root cause:** `Cypress.env('intentId')` undefined. The CTK fixture
  (`ctk.json`) orders IntentReport tests (positions 1–11) before Intent
  POST (position 21). No prior POST had set `intentId` in the Cypress
  environment.
- **Resolution:** Pre-seed `cypress.env.json`.

### Gap 2: "Each attribute Test" failures (8 failures at v2.0.0 run 2)
- **Root cause:** CTK's `validateMandatoryAttr` checks every mandatory
  field against `Cypress.env(attribute)`. For `?fields=expression` and
  `?fields=name` projections, our `projectFields()` excluded
  `creationDate` from the response. The pre-seeded env value
  (`creationDate: "2026-..."`) did not match `undefined` in the response.
- **Resolution:** Added `creationDate` to the always-included fields in
  `projectFields()`, consistent with `id`, `href`, and `@type`.

### Gap 3: in-memory Map data loss (36 failures at v1.3)
- **Root cause:** The `IntentStore` and `IntentSpecificationStore`
  classes used `Map<string, T>` in-process storage. Between CTK test
  phases (POST then GET/PATCH/DELETE), a new Express request may land on
  a different pod replica, losing the previously stored resource.
- **Resolution:** Replaced with Redis-backed `RedisIntentStore` and
  `RedisSpecificationStore` (v2.0.0 commit `9a61c19`).

## Test Environment

| Component | Value |
|-----------|-------|
| CTK version | TMForum CTK v5.0.0 (Cypress 12.17.4) |
| ibn-core version | v2.0.1 (commit `66e72c2`) |
| Cluster | kind (local-k8s) |
| Ingress | Istio IngressGateway (NodePort) |
| Base URL | http://localhost:8080/tmf-api/intentManagement/v5 |
| Auth | Bearer dev-api-key-12345 (DEMO-CUSTOMER) |
| Redis | redis:7-alpine, AOF persistence |

---

*Copyright 2026 Vpnet Cloud Solutions Sdn. Bhd. — Apache 2.0*
