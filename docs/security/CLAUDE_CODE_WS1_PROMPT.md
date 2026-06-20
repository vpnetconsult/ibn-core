# Claude Code prompt — WS-1: End-to-end signing and supply-chain integrity

> **Hand this file to Claude Code.** Run:
> ```bash
> cd ~/projects/k8s/.claude/worktrees/happy-hofstadter-b49483
> claude --prompt-file docs/security/CLAUDE_CODE_WS1_PROMPT.md
> ```
> The prompt is self-contained: a fresh agent session can execute it without prior context.

---

## Mission

You are implementing **WS-1 (Supply Chain & Image Provenance)** from `docs/security/REMEDIATION_PLAN.md`, **expanded** per the project owner's direction to cover every input and every output in the ibn-core request lifecycle. The goal: **anything that crosses a trust boundary in ibn-core is signed, and anything that consumes a crossed boundary verifies the signature.**

This closes ATT&CK techniques T1195, T1525, T1204.003 and ATLAS technique AML.T0010.001 (the four `Open` supply-chain findings), and materially improves the residual on T1036 (Masquerading), T1199 (Trusted Relationship), and AML.T0066 (LLM Trusted Output Manipulation).

---

## Read these first

Do not skip. The agent reads cold; this is the briefing.

| File | Why |
|------|-----|
| `CLAUDE.md` | Repository conventions, copyright-header rule, what must never be committed, commit-message format for paper citation. **Hard rules — follow exactly.** |
| `docs/security/REMEDIATION_PLAN.md` §3 WS-1 | The original WS-1 spec (SBOM, cosign, admission, CI gates, attestation doc). |
| `docs/security/ibn-core_attack_assessment.docx` §5 | Why this matters — supply-chain Open findings and the recommended fix. |
| `docs/security/ibn-core_atlas_assessment.docx` §6 | LLM-side reasoning — AML.T0010.001 closure. |
| `docs/compliance/UC006_ODA_CANVAS_IMPLEMENTATION.html` §3 | The Component CR contract; the `dependentModels` annotation is where signed model metadata lands. |
| `helm/ibn-core/` (whole chart) | What you're modifying. |
| `.github/workflows/` | Existing CI; you'll extend, not replace. |
| `src/telemetry.ts` | The bootstrap rule. Anything you add MUST NOT come before this import in `src/index.ts`. |
| `src/mcp/McpAdapter.ts` | The open-core seam. Signing of MCP responses lands here. |
| `src/handlers/intent-processor.ts` (or equivalent) | Where prompts are assembled and the LLM is called. Prompt signing and scaffold version-pinning land here. |

---

## Hard constraints (CLAUDE.md → operative rules)

1. **Apache 2.0 only.** Every new dependency must be Apache 2.0, MIT, BSD 2/3-clause, or ISC. GPL/LGPL forbidden. Run `npm info <pkg> license` before adding.
2. **Copyright header on every new `.ts`/`.js`/`.sh`/`.py` file:**
   ```
   /**
    * Copyright 2026 Vpnet Cloud Solutions Sdn. Bhd.
    * Licensed under the Apache License, Version 2.0
    * See LICENSE in the project root for license information.
    *
    * Implements RFC 9315 Intent-Based Networking
    * https://www.rfc-editor.org/rfc/rfc9315
    */
   ```
3. **No secrets in the repo.** Cosign keys: public half committed, private half NEVER. Keyless mode (Sigstore Fulcio) is preferred where the operator runtime supports it.
4. **No proprietary operator code.** This is the open core. CAMARA adapters and operator credentials stay in the private repo. If you find yourself adding U Mobile / TM Malaysia-specific logic, stop and ask.
5. **The telemetry bootstrap rule.** `src/telemetry.ts` MUST remain the very first import in `src/index.ts`. Anything you add to startup goes AFTER it.
6. **Commit messages cite the standard.** Per CLAUDE.md "Paper Citation Reference":
   ```
   type(scope): description

   Implements: RFC 9315 §X.X.X ([section title])
   TMF921: [resource or endpoint affected]
   Paper: [claim this supports — for WS-1: "supports §IV-C supply-chain integrity claim"]
   ```
7. **O2C smoke test must still pass after every commit.** From REMEDIATION_PLAN.md / CLAUDE.md:
   ```bash
   curl -X POST http://localhost:8080/api/v1/intent \
     -H 'Content-Type: application/json' \
     -d '{"customerId":"CUST-12345","intent":"I need internet for working from home"}'
   ```
   Expected: `lifecycleStatus: "completed"`, `reportState: "fulfilled"`. If this fails, do not commit.

---

## Scope — expanded per project owner

The original WS-1 covered container images, SBOM, Helm chart signing, and admission. Expand to cover **every input and every output of every component**:

### A. Build-time artefacts (per WS-1 §1 of the plan)

1. **Container images** — Sigstore cosign signature on every published tag. Keyless mode preferred (OIDC via GitHub Actions → Fulcio → Rekor); a long-lived KMS-backed key is the fallback.
2. **Helm chart** — `helm package --sign` OR cosign on the OCI artefact (whichever the chart distribution channel supports). Public key in `helm/ibn-core/KEYS`.
3. **CycloneDX SBOM** — generated per build, attached as a Sigstore attestation alongside the image and published as a release asset.
4. **Provenance attestation (SLSA Level 3)** — `actions/attest-build-provenance` or equivalent on every release.

### B. Request-time inputs (NEW — expanded scope)

5. **TMF921 request body integrity** — implement [HTTP Message Signatures (RFC 9421)](https://www.rfc-editor.org/rfc/rfc9421) verification on the `POST /api/v1/intent` route. Signed requests are mandatory for `agent` and `admin` roles; optional but verified-if-present for `customer` role. The signature covers the request-target, `content-digest`, `date`, and selected headers per a documented coverage list. Reject with HTTP 401 if a required signature is missing or invalid.
6. **Content-Digest header** — RFC 9530. Computed and verified on every authenticated request body.
7. **API-key fingerprints** — each api-key entry in the registry includes the SHA-256 of the issued key plus an Ed25519 public key the holder uses to sign requests. Verification at the gateway.

### C. LLM call site (NEW — expanded scope per owner direction "LLM signing")

8. **Model version pinning + attestation.** Every LLM call records the exact model identifier (e.g. `claude-sonnet-4-…-20260315`), the SHA-256 of the prompt scaffold version in use, and the SHA-256 of the assembled prompt. These three fields go onto the LLM span as `gen_ai.model.id`, `gen_ai.scaffold.sha256`, `gen_ai.prompt.sha256`.
9. **Scaffold signing.** Every prompt scaffold in `src/prompts/` is loaded from a manifest at `src/prompts/MANIFEST.signed.json` that lists each scaffold path with its expected SHA-256 and an Ed25519 signature over the manifest. Boot fails if the manifest signature is invalid or any scaffold's hash diverges from the manifest. Operators rotate scaffolds by committing a new manifest signed with the build-time key.
10. **LLM response integrity.** Anthropic responses themselves carry a `request-id` and timing metadata; capture these onto the LLM span and persist a hash of the response body so a future audit can detect tamper between the LLM call and the persisted artefact in Redis.
11. **`dependentModels` annotation extension.** The Component CR's `dependentModels` annotation gains `signedManifest: docs/security/MODEL_ATTESTATIONS.signed.json` — an Ed25519-signed manifest listing the approved model IDs, the date Vpnet last reviewed Anthropic's Annex-XII docs, and the scaffold-manifest SHA-256.

### D. MCP responses (NEW — expanded scope)

12. **Signed MCP responses.** Extend the `McpAdapter` interface to require that every MCP back-end response carries a detached Ed25519 signature over the response body and the request correlation ID. The reference `MockMcpAdapter` produces signatures; production adapters (private repo) follow the same contract. The AI Gateway's DLP layer verifies the signature before redaction; an unsigned or invalid-signature response is treated as `compliantFailure` rather than redacted-and-forwarded.
13. **MCP capability manifest.** Each MCP back-end publishes a signed `capabilities.json` declaring which tools and field allowlists it offers per role. The ToolPolicyEngine refuses to allow a tool that is not in the active manifest. Manifests rotate via Component CR annotation `mcpInterfaces[*].capabilityManifest`.

### E. Outputs and audit (NEW — expanded scope)

14. **Signed TMF921 responses.** Optional but supported: when the caller's request was signed (per B), the response carries an Ed25519 signature over the response body and the request correlation ID. Lets the caller verify the offer they received was authored by ibn-core and not tampered downstream.
15. **OTel span attestations.** Every root span carries a `vpnet.attestation.sha256` attribute that is the SHA-256 of the canonical-form span tree, signed with the build-time key. Lets the audit-trail mirror (future WS-7) detect tamper.
16. **Public attestation index.** `docs/security/SUPPLY_CHAIN.md` is the human-readable index: which keys are in use, where Rekor entries are, how an operator verifies the whole chain end-to-end.

---

## Phase plan

Execute in this order. After each phase: `git commit`, run the O2C smoke test, run the four-scenario harness, then proceed.

### Phase 1 — Foundation: keys, CI gates, SBOM

Goal: nothing changes architecturally; we just start producing signed artefacts.

- [ ] Generate the Vpnet WS-1 signing key pair (Ed25519). Public half committed at `docs/security/keys/ws1-2026.pub`. Private half NEVER in repo; document where it lives (KMS, secret manager).
- [ ] Add CycloneDX SBOM generation to `.github/workflows/release.yml` (`anchore/sbom-action` or `CycloneDX/cyclonedx-node-npm`). Attach as release asset; reference from `NOTICE`.
- [ ] Add cosign signing to release workflow. Keyless mode via `sigstore/cosign-installer@v3` + `actions/attest-build-provenance@v1`.
- [ ] Add `cosign verify` smoke test to the release workflow (verifies the just-published image).
- [ ] Update `NOTICE` to list the new tooling dependencies (Sigstore, CycloneDX).

### Phase 2 — Helm and admission

- [ ] Sign the chart on release. Commit public key under `helm/ibn-core/KEYS`.
- [ ] Ship Kyverno admission policy template at `helm/ibn-core/templates/admission/cosign-verify.yaml`, off by default but documented for opt-in.
- [ ] Add `helm verify` to the chart release workflow.

### Phase 3 — Scaffold signing and model pinning

- [ ] Create `src/prompts/` if it does not exist; move the analyzeIntent and generateOffer scaffolds into separate files (no functional change).
- [ ] Add `src/prompts/MANIFEST.signed.json` with Ed25519 detached signature.
- [ ] Add `src/prompts/manifest-verifier.ts` that loads at boot, verifies signature, hashes each scaffold, fails-fast on divergence.
- [ ] Wire into `src/index.ts` AFTER the telemetry import.
- [ ] Update `claude-client.ts` to record `gen_ai.scaffold.sha256` and `gen_ai.prompt.sha256` on the LLM span.
- [ ] Pin the model ID via config; surface as `gen_ai.model.id`.

### Phase 4 — MCP response signing

- [ ] Extend `McpAdapter` interface with `verifyResponse(response, correlationId): boolean`.
- [ ] Add Ed25519 signature/verification helpers in `src/mcp/signing.ts`.
- [ ] Update `MockMcpAdapter` to sign responses; update tests.
- [ ] Add `capabilities.json` schema and the manifest-verification path in `ToolPolicyEngine`.
- [ ] Document the contract for downstream adapter authors at `src/mcp/README.md`.

### Phase 5 — Request and response signing on the API

- [ ] Add `src/middleware/http-message-signatures.ts` implementing RFC 9421 verification.
- [ ] Make signature required for `agent` and `admin` roles; optional for `customer`.
- [ ] Add `Content-Digest` (RFC 9530) verification.
- [ ] Sign successful responses when the inbound request was signed; emit `Signature` and `Content-Digest` response headers.
- [ ] Update OpenAPI spec to document the signature scheme.

### Phase 6 — Span attestation and public index

- [ ] Add `src/telemetry/attestation.ts` that computes the canonical-form span-tree hash on root-span end and emits `vpnet.attestation.sha256` + a detached signature.
- [ ] Write `docs/security/SUPPLY_CHAIN.md` — human-readable index of: keys in use (with `cosign verify` commands), Rekor query patterns, what an operator must check end-to-end before running ibn-core in production.
- [ ] Write `docs/security/MODEL_ATTESTATIONS.signed.json` with current approved models.
- [ ] Update Component CR template to surface the new annotations (`dependentModels.signedManifest`, `mcpInterfaces[*].capabilityManifest`).

### Phase 7 — Verification end-to-end

Write `scripts/verify-supply-chain.sh` (committed to the repo) that:

1. Pulls the latest image; runs `cosign verify`.
2. Pulls the latest chart; runs `helm verify`.
3. Downloads the SBOM; checks for missing fields.
4. Verifies `docs/security/MODEL_ATTESTATIONS.signed.json` signature.
5. Verifies `src/prompts/MANIFEST.signed.json` signature.
6. Verifies `docs/security/keys/ws1-2026.pub` is parseable and matches the signing key fingerprint published at `docs/security/SUPPLY_CHAIN.md`.

Exit 0 if all pass, non-zero otherwise. Document the script in `SUPPLY_CHAIN.md`.

---

## Open questions — surface to the user before committing the design

The owner expanded the scope verbally to "all input signed, images, LLM." That admits several interpretations. **Ask the user to confirm before Phase 3 ships:**

1. **Keyless vs key-bound signing.** Keyless (Sigstore Fulcio + OIDC) is simpler operationally but ties verification to Sigstore availability. Key-bound (KMS-backed Ed25519) is more sovereign but adds key-rotation burden. Default: keyless for images and chart; key-bound for in-repo artefacts (scaffold manifest, model attestation). Confirm or change.
2. **HTTP Message Signatures rollout.** Mandatory for `agent`/`admin` immediately may break existing operators. Acceptable to ship as "verified-if-present" first across all roles, mandatory in the release after. Confirm rollout shape.
3. **Anthropic response integrity.** Anthropic returns `request-id` and timing but no body-signature today. Capture as recorded provenance; do not claim cryptographic chain of custody from the model itself.
4. **Operator-side trust roots.** If an operator runs ibn-core in an environment that cannot reach Rekor, keyless verification breaks at deploy time. Decide whether we ship a Rekor-mirror reference deployment or document the operator's responsibility to mirror.

---

## Acceptance criteria (re-stated from REMEDIATION_PLAN.md WS-1, extended)

Phase complete when **all** of the following are true:

- `docker pull` of any released image + `cosign verify` against the published key succeeds.
- `helm verify ibn-core-X.Y.Z.tgz` succeeds against the published key.
- The CycloneDX SBOM is downloadable from the GitHub release page; it lists every direct and transitive npm dependency with version + licence.
- The admission policy template, when applied to a Canvas cluster, blocks an unsigned ibn-core image from running.
- `scripts/verify-supply-chain.sh` exits 0 on the released artefacts.
- The four-scenario trace harness still produces the four canonical outcomes (A fulfilled, B fulfilled-with-redaction, C compliantFailure, D blocked); new spans for scaffold and prompt hashes are present on A/B/C.
- The O2C smoke test still passes.
- The ATT&CK and ATLAS assessment artefacts in `docs/security/` are regenerated:
  - T1195, T1525, T1204.003 move from `Open` to at least `PartiallyMitigated` (target `Mitigated`).
  - AML.T0010.001 moves from `Open` to at least `PartiallyMitigated`.
  - T1036, T1199, AML.T0066 move toward `Mitigated`.
- `docs/security/REMEDIATION_PLAN.md` WS-1 status box is updated from ⬜ to 🟩.
- `docs/security/SUPPLY_CHAIN.md` exists and documents the full verification flow for an operator.

---

## What "done" looks like (one-line summary the agent gives back)

> "WS-1 shipped: every released image and chart is cosign-signed and SLSA-attested; every prompt scaffold and model attestation in the repo is Ed25519-signed and boot-verified; every TMF921 request from an agent/admin role is RFC 9421-signed and verified; every MCP response carries a detached Ed25519 signature; every LLM span records model ID + scaffold SHA + prompt SHA; SUPPLY_CHAIN.md indexes the verification chain end-to-end. ATT&CK and ATLAS assessments regenerated; T1195/T1525/T1204.003 and AML.T0010.001 closed. O2C smoke test green. REMEDIATION_PLAN.md WS-1 marked 🟩."

---

## Behavioural notes for the agent

- Prefer **TodoWrite/Plan-mode** before editing. WS-1 is a multi-file change; surface the plan to the owner before you implement Phase 3 onwards (the owner has expanded scope verbally; confirm interpretation before you commit large changes).
- **Trust but verify your own work.** After each phase, regenerate the relevant assessment file (`python3 docs/security/scripts/attack_assessment.py` or equivalent) and confirm the score change.
- **Do not over-format your responses.** The owner prefers prose over bullet-storms (CLAUDE.md is the model). Keep status updates terse.
- **Do not invent files outside the deliverable list.** If you find yourself adding a new top-level concept not in this prompt, stop and ask.
- **Read the existing files before editing.** Especially `helm/ibn-core/`, `src/mcp/McpAdapter.ts`, and `src/telemetry.ts` — they encode conventions the prompt summarises but does not exhaustively repeat.
- **Cite the standard in every commit message** per the Paper Citation Reference rule in CLAUDE.md.

Good luck. Open the plan, read CLAUDE.md, then start with Phase 1.
