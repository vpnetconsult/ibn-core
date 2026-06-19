# TMF921 v5.0.0 CTK — Gate-B Run (Stubbed Translation)

> **Status:** Refactor-regression PROXY for the Project 005 cutover (ARC-005-ADR-002 Gate B). **NOT** a full real-translation conformance certification. See "Honest scope" below.

| Field | Value |
|-------|-------|
| Date (run) | 2026-06-19 |
| CTK | `tmforumorg/tmf921-v5.0.0-ctk:1.0.3` (Cypress/Electron, arm64 native) |
| Target | business-intent-agent (image `ibn-core:llm-stub`, built from `main` @ `1d455b9` — incl. the LLM-agnostic seam + the layer-agnostic core) |
| Endpoint | `/tmf-api/intentManagement/v5` (via `host.docker.internal:18080` → port-forward → ClusterIP `business-intent-agent-service`, kind `local-k8s`/`intent-platform`) |
| LLM provider | **`LLM_PROVIDER=stub`** (deterministic `StubIntentLlm`; no Anthropic SDK/key/credits) |
| Auth | `Authorization: Bearer <default-api-key>` |
| **Result** | **55 / 65 passing** (reproduced across two runs) |
| Canonical O2C | **`lifecycleStatus: completed` · `reportState: fulfilled`** (via stub, no credits) |
| Evidence | `docs/compliance/ctk-evidence/tmf921-v5-ctk-1.0.3-index.json` |

## Purpose

The Project 005 cutover ("two peers, one core" — business-intent + resource-intent on one `IntentCycleRunner`) is already merged. ARC-005-ADR-002 defers the immutable `v3.0.0` tag until **Gate B** (TMF921 CTK + canonical O2C) is recorded green. The live O2C had been blocked on exhausted Anthropic credits; ARC-005-ADR-003 introduced an LLM-agnostic seam with a deterministic **stub** so the full intent cycle (and therefore the CTK) can run **without credits**. This run exercises that path.

## Result — 55/65, with all 10 failures decomposed

Two independent runs (2026-06-19) gave the identical **55 passing / 10 failing**. Every failure is a **pre-existing agent TMF921 conformance gap — none is introduced by the cutover refactor or the LLM seam**:

| # | Failing case(s) | Error | Cause | Cutover-related? |
|---|-----------------|-------|-------|------------------|
| 4 | `POST/PATCH/GET /intent` schema | `/priority must be string` | `Intent.priority` serialized as a non-string vs the v5 schema | No — resource serialization gap, untouched by the cutover |
| 4 | `GET /intent/{id}/intentReport` (+ `?fields=expression`, `/{id}`) | `expected undefined to equal {…}` | The TMF921 IntentReport sub-resource isn't surfaced for CTK-created intents | No — sub-resource gap; **persists with KG-MCP stable + O2C green**, so not environmental |
| 2 | `PATCH /intentSpecification/{id}` | `must have required property '@type'` (+ cascaded suite stop) | IntentSpecification PATCH response/handling missing `@type` | No — schema gap |

The 55 passing cover the conformance the cutover *could* have affected: Intent `POST` status, IntentSpecification `POST`/`GET`/`DELETE`, ProbeIntent, JudgeIntent, BestIntent, Hub, and field-selection (`?fields=`) cases.

## What this run proves (and what it does not)

**Proves (Gate-B refactor-regression question — "did the cutover break the TMF921 API path / O2C?"):**

- ✅ The canonical **O2C completes and fulfils** through the layer-agnostic core + `BssPhaseStrategy` — `completed` / `fulfilled`.
- ✅ The TMF921 API path is intact under the cutover; the 10 failures are orthogonal pre-existing gaps, reproduced identically, with zero attributable to the refactor or the seam.
- ✅ The LLM-agnostic stub runs the entire cycle with **no Anthropic credits** — the credit blocker on Gate B is removed.

**Does NOT prove (still owed for a real `v3.0.0` GA conformance claim):**

- ❌ This is a **stubbed-translation** run — the deterministic stub substitutes for live LLM translation. Not a real-translation conformance certification.
- ❌ It is **not** "83/83 / 100%". This CTK (1.0.3, 65 cases) is a newer/stricter kit than the historical run; it surfaces **3 genuine conformance gaps** to fix: (a) `Intent.priority` string typing, (b) the `GET /intent/{id}/intentReport` sub-resource, (c) `intentSpecification` PATCH `@type`.

## Conclusion

For ARC-005-ADR-002 Gate B, this is a **refactor-regression PASS**: the cutover did not break TMF921 conformance or the O2C, and the credit blocker is removed by the seam (ARC-005-ADR-003). It is **not** the full conformance claim. Therefore **`v3.0.0` remains deferred** (per ADR-002), now gated on: (1) a real-translation CTK run when credits are available, and (2) fixing the 3 surfaced conformance gaps (or recording them as documented-acceptable). 

## Follow-ups

- Fix `Intent.priority` serialization (string), the IntentReport sub-resource GET, and IntentSpecification PATCH `@type`.
- Re-run the CTK with `LLM_PROVIDER=anthropic` once credits are topped up → record the real-translation result.
- Then ARB Gate C → cut `v3.0.0` → re-pin resource ADR-009 (ADR-002 §10 runbook).

## Reproduce

```bash
# agent on main (seam) in stub mode:
docker build -f src/Dockerfile -t ibn-core:llm-stub src/ && kind load docker-image ibn-core:llm-stub --name local-k8s
kubectl set env  deploy/business-intent-agent -n intent-platform LLM_PROVIDER=stub
kubectl set image deploy/business-intent-agent -n intent-platform business-intent-agent=ibn-core:llm-stub
kubectl port-forward -n intent-platform svc/business-intent-agent-service 18080:8080 &
# CTK (arm64 native): config.json url=http://host.docker.internal:18080/tmf-api/intentManagement/v5 + Bearer auth
cd <tmf921-ctk> && platform=linux/arm64 ./run.sh
```

---
*Generated 2026-06-19. Contains a stubbed-translation conformance result for the ibn-core business-intent-agent; see the JSON report under `ctk-evidence/`.*
