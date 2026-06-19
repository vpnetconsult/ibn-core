# TMF921 v5.0.0 CTK — Gate-B Run (Stubbed Translation)

> **Status:** Full **65/65** TMF921 v5 CTK pass via the deterministic stub (after fixing 3 conformance gaps). This is the Project 005 cutover Gate-B regression evidence. It is a **stubbed-translation** pass — the real-translation run (Anthropic, when credits return) remains for the v3.0.0 GA claim. See "Honest scope".

| Field | Value |
|-------|-------|
| Date (run) | 2026-06-19 |
| CTK | `tmforumorg/tmf921-v5.0.0-ctk:1.0.3` (Cypress/Electron, **arm64 native** — amd64-under-emulation fails to launch the browser) |
| Target | business-intent-agent (image `ibn-core:ctk-fixes`, built from `main` + the 3 conformance fixes below; incl. the layer-agnostic core + LLM-agnostic seam) |
| Endpoint | `/tmf-api/intentManagement/v5` (via `host.docker.internal:18080` → port-forward → ClusterIP `business-intent-agent-service`, kind `local-k8s`/`intent-platform`) |
| LLM provider | **`LLM_PROVIDER=stub`** (deterministic `StubIntentLlm`; no Anthropic SDK/key/credits) |
| Auth | `Authorization: Bearer <default-api-key>` |
| **Result** | **65 / 65 passing · 0 failing** (after fixes; initial run was 55/65) |
| Canonical O2C | **`lifecycleStatus: completed` · `reportState: fulfilled`** (via stub, no credits) |
| Evidence | `docs/compliance/ctk-evidence/tmf921-v5-ctk-1.0.3-index.json` |

## Purpose

The Project 005 cutover ("two peers, one core") is already merged. ARC-005-ADR-002 defers the immutable `v3.0.0` tag until **Gate B** (TMF921 CTK + canonical O2C) is recorded green. The live O2C had been blocked on exhausted Anthropic credits; ARC-005-ADR-003 added an LLM-agnostic seam with a deterministic **stub** so the full cycle (and the CTK) can run **without credits**. This run exercises that path and certifies API conformance.

## Initial run: 55/65 → 3 conformance gaps found and fixed

The first run (same harness, same stub) was **55/65**. All 10 failures were **pre-existing agent TMF921 conformance gaps — none introduced by the cutover or the seam**, and all have now been fixed:

| Gap (failing cases) | Root cause | Fix |
|---|---|---|
| `Intent.priority must be string` (4) | `createIntent` set `priority: 5` (a number) | Coerce to string: `String(intentCreate.priority ?? 5)` and `'5'` (`src/tmf921/intent-service.ts`) |
| `GET …/intentReport` `expected undefined…` (4) | `createIntent` seeded `intentReport: []`; the `IntentReport` type also lacked `expression`/`name` | Seed one initial IntentReport mirroring the intent expression; widen `IntentReport` + `IntentExpression` types (`intent-service.ts`, `tmf921/types.ts`) |
| `intentSpecification` PATCH `@type required` (2) | `tmf921_intent_spec_update` allow-list omitted `name`, so `{@type, name}` PATCH → 400 (non-spec body) | Add `name` (+ parity fields) to the update allow-list (`src/response-filter.ts`) |

After the fixes, re-run = **65/65, 0 failing**.

## What this run proves (and what it does not)

**Proves:**

- ✅ **Full TMF921 v5 CTK conformance — 65/65** for the business-intent-agent on the cutover code (layer-agnostic core + `BssPhaseStrategy`).
- ✅ The canonical **O2C completes and fulfils** through the core via the stub — `completed` / `fulfilled`.
- ✅ The LLM-agnostic stub runs the entire cycle + CTK with **no Anthropic credits** — the credit blocker on Gate B is removed.
- ✅ The cutover refactor did not break conformance; the 10 initial failures were orthogonal pre-existing gaps, now fixed.

**Does NOT prove (still owed for `v3.0.0` GA):**

- ❌ This is a **stubbed-translation** run — the deterministic stub substitutes for live LLM translation. The CTK validates the TMF921 API contract (LLM-independent), but a **real-translation** O2C/CTK run (`LLM_PROVIDER=anthropic`, credits topped up) is still required to close the GA claim per ARC-005-ADR-002 §10.

## Conclusion

For ARC-005-ADR-002 Gate B, this is a **PASS**: 65/65 TMF921 CTK conformance + O2C fulfilment on the cutover code, with the credit blocker removed by the seam (ARC-005-ADR-003), and the 3 surfaced conformance gaps fixed. The only remaining Gate-B item before cutting `v3.0.0` is the **real-translation** confirmation run; then ARB Gate C → tag → re-pin resource ADR-009 (ADR-002 §10 runbook).

## Reproduce

```bash
docker build -f src/Dockerfile -t ibn-core:ctk-fixes src/ && kind load docker-image ibn-core:ctk-fixes --name local-k8s
kubectl set env  deploy/business-intent-agent -n intent-platform LLM_PROVIDER=stub
kubectl set image deploy/business-intent-agent -n intent-platform business-intent-agent=ibn-core:ctk-fixes
kubectl port-forward -n intent-platform svc/business-intent-agent-service 18080:8080 &
# CTK (arm64 native): config.json url=http://host.docker.internal:18080/tmf-api/intentManagement/v5 + Bearer auth
cd <tmf921-ctk> && platform=linux/arm64 ./run.sh
```

---
*Generated 2026-06-19. Stubbed-translation conformance result (65/65) for the ibn-core business-intent-agent; machine-readable report under `ctk-evidence/`.*
