# CLAUDE.md — ibn-core Project Intelligence

This file provides context for Claude Code sessions working on this repository.
Read this before making any changes.

---

## Project Identity

| Field | Value |
|-------|-------|
| Repo | `https://github.com/vpnetconsult/ibn-core` |
| Copyright holder | Vpnet Cloud Solutions Sdn. Bhd. |
| Copyright year | 2026 |
| License | Apache 2.0 |
| Model | Open Core (public framework + private operator adapters) |
| Primary standard | RFC 9315 (IRTF NMRG, Oct 2022) |
| API target | TMF921 Intent Management API v5.0.0 |

---

## Licensing Rules — Read Before Every Commit

### What This Repo Is

This is the **public open core** of the ibn-core framework.
It implements RFC 9315 Intent-Based Networking concepts and targets
TMF921 v5.0.0 compliance. It is licensed Apache 2.0.

Operator-specific CAMARA adapters (U Mobile, TM Malaysia, etc.) are
**not** in this repo — they live in a separate private repository and
are delivered via Vpnet Cloud Solutions SI engagements.

### File-Level Copyright Header

Every `.ts`, `.js`, `.sh`, and `.py` file must have this header:

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

**Rule:** If you create a new source file and it does not have this header, add it.
Never omit or modify the copyright holder name.

### Root-Level Governance Files

These files must always exist at repo root and must not be deleted or moved:

| File | Purpose | Must contain |
|------|---------|--------------|
| `LICENSE` | Apache 2.0 full text | Unmodified Apache 2.0 from apache.org |
| `NOTICE` | Upstream attributions | TMF921, CAMARA, MCP, K8s, RFC 9315 attribution |
| `CLAUDE.md` | This file | Project context for Claude Code sessions |

### What You MUST NOT Do

- Do not change the license to MIT, GPL, or any other licence
- Do not remove copyright headers from existing files
- Do not add proprietary operator credentials, API keys, or CAMARA tokens to this repo
- Do not add operator-specific adapter implementations (U Mobile, TM) — those go in the private repo
- Do not modify the `LICENSE` file content
- Do not commit `.env` files or Kubernetes secret values

### Dependency Licence Compatibility

All dependencies must be compatible with Apache 2.0. Approved licences:

| Licence | Compatible | Examples |
|---------|-----------|---------|
| Apache 2.0 | ✅ Yes | TMF921, CAMARA, Kubernetes, Istio |
| MIT | ✅ Yes | MCP Protocol spec, most npm packages |
| BSD 2/3-clause | ✅ Yes | Many node packages |
| ISC | ✅ Yes | Common in npm ecosystem |
| GPL v2/v3 | ❌ No | Do not add GPL dependencies |
| LGPL | ⚠️ Check | Requires review before adding |
| Proprietary | ❌ No | Never add proprietary dependencies |

If adding a new npm package, check its licence with:
```bash
npm info <package-name> license
```

---

## Agent-Native Development — How We Work on This Repo

ibn-core is an AI-Native ODA component, and its development workflow is
agent-native by design. "Agent-native development" means AI agents
(Claude Code sessions, subagents, and — in production — the component
itself) are first-class collaborators. The repo is structured so a
fresh agent session gets productive without tribal knowledge.

Everything below this section — repo layout, the `McpAdapter` seam,
the Standards Implementation Map, the telemetry bootstrap rule,
commit-message traceability — exists in the form it does to support
this approach.

### Principles

1. **Context-first.** Every repo has `CLAUDE.md` (this file). Every
   workstream has a plan under `docs/roadmap/`. Every conformance
   claim has evidence under `docs/compliance/`. An agent joining cold
   reads these before touching code.

2. **Plans before PRs.** Non-trivial work starts as a plan doc in
   `docs/roadmap/` — e.g. `canvas-uc/UC006-custom-observability.md`,
   `operatorhub/ibn-core-operatorhub-submission.md`. Plans are the
   unit of approval; PRs are the unit of implementation. This keeps
   direction separate from mechanics.

3. **Decision docs over tribal knowledge.** When two technically valid
   paths exist, land a decision doc that records the choice and the
   one-line rationale — e.g.
   `docs/roadmap/canvas-uc/UC006-otel-operator-comparison.md`. Future
   agents do not re-litigate settled questions.

4. **Evidence as versioned artefacts.** CTK runs, smoke tests, and
   conformance verifications land as Markdown under `docs/compliance/`,
   dated and tied to a commit or tag. The doc IS the evidence —
   screenshots and external dashboards are secondary.

5. **Named architectural seams.** The most important boundaries are
   called out explicitly in this file — `src/mcp/McpAdapter.ts`
   (open-core seam), `src/telemetry.ts` (must be first import),
   `docs/standards/` (cited vs. implemented). Editing a named seam
   means reading its rule first.

6. **Traceability in commit messages.** Every non-trivial commit cites
   the RFC / TMF / Paper reference it touches (see "Paper Citation
   Reference" below). `git log` becomes a reasoning trail a future
   agent can reconstruct cold.

7. **Meta-observability.** The product itself emits agent telemetry —
   GenAI semantic conventions (`gen_ai.*`), RFC 9315 phase tags
   (`rfc9315.phase`), AI-Gateway events (`ai_gateway.*`). Agent
   behaviour in production is a measurable signal, not a black box.
   The same telemetry pattern (`src/telemetry.ts` → OTLP → LangSmith
   or a Canvas collector) is what lets us evaluate the agents we ship.

8. **Parallel worktrees for parallel sessions.** `.claude/worktrees/`
   isolates simultaneous agent sessions so two branches in flight do
   not collide on the same working tree.

### Enforceable rules

- **A new feature without a plan doc is a red flag.** If you are
  implementing something not covered by a `docs/roadmap/` file, pause
  and write the plan first.
- **A conformance claim without a `docs/compliance/` doc is not
  verified.** The doc — with run ID, date, and evidence links — is
  the claim.
- **A fork in the road without a decision doc leaves a gap.** If two
  valid technical paths exist for a non-trivial choice, write the
  comparison before picking.
- **A cross-file architectural rule not in `CLAUDE.md` will be
  forgotten.** Add it here.
- **Never delegate understanding.** When spawning a subagent, write a
  self-contained prompt with file paths, line numbers, and the
  specific question. Do not write "based on your findings, fix the
  bug" — synthesis stays with the orchestrating agent.

---

## Repository Structure

```
ibn-core/                          ← repo root
├── LICENSE                        ← Apache 2.0 (do not modify)
├── NOTICE                         ← upstream attributions (update if adding deps)
├── CLAUDE.md                      ← this file
├── README.md                      ← project overview and quickstart
├── CHANGELOG.md                   ← version history
├── .gitignore
├── .github/
│   └── workflows/                 ← CI/CD (CodeQL, build checks)
├── src/                           ← TypeScript application source
│   ├── mcp/
│   │   └── McpAdapter.ts          ← THE OPEN CORE SEAM (see below)
│   ├── api/                       ← TMF921 API routes
│   ├── handlers/                  ← intent processor, Claude client
│   ├── middleware/                ← auth, PII masking, security
│   └── store/                     ← Redis/persistence adapter
├── business-intent-agent/         ← Kubernetes manifests for main app
│   └── k8s/
│       └── istio/
├── mcp-services-k8s/              ← Kubernetes manifests for MCP services
├── encryption/                    ← encryption utilities
└── docs/
    ├── architecture/              ← DEPLOYMENT_SUMMARY.md, C4 diagrams
    ├── compliance/                ← TMF921 CTK results and analysis
    ├── security/                  ← DPIA, SECURITY, INCIDENT_RESPONSE
    └── standards/                 ← TMF921 spec review, RFC traceability
        └── external-reviews/      ← reviews of external I-Ds, RFCs, TS, white papers
```

---

## The Open Core Seam — McpAdapter.ts

**This is the most important architectural boundary in the repo.**

`src/mcp/McpAdapter.ts` defines the `McpAdapter` interface. This is the
boundary between the public framework and private operator adapters.

**Rules:**
- The interface definition stays in this public repo (Apache 2.0)
- `MockMcpAdapter` (included here) is for local development only
- Production implementations (`CamaraUMobileMcpAdapter`, etc.) are in the **private repo**
- Never add real CAMARA credentials or operator-specific logic to this file
- Never remove or weaken the interface — it is cited in Paper 1

**RFC 9315 mapping:**

| Interface method | RFC 9315 reference |
|----------------|-------------------|
| `orchestrate()` | §5.1.3 Orchestration |
| `getIntentStatus()` | §5.2.1 Monitoring |
| `getCapabilities()` | §4 Principle 5 — Capability Exposure |
| `cancelIntent()` | §5.2.3 Compliance Actions |

---

## Standards Implementation Map

When modifying code, maintain traceability to these standards:

| Code component | RFC 9315 | TMF921 v5.0.0 |
|---------------|----------|---------------|
| `POST /api/v1/intent` | §5.1.1 Ingestion | POST /intent |
| `claude-client.ts` / intent processor | §5.1.2 Translation | Handler-internal |
| `McpAdapter.orchestrate()` | §5.1.3 Orchestration | Cross-layer |
| `metrics.ts` + Prometheus | §5.2.1 Monitoring | IntentReport source |
| `IntentReport.reportState` | §5.2.2 Compliance Assessment | reportState field |
| Istio circuit breakers + HPA | §5.2.3 Compliance Actions | Handler triggers |
| `GET /api/v1/intent/:id` | §4 P1 SSoT/SVoT | GET /intent/{id} |
| `DELETE /api/v1/intent/:id` | §6 Lifecycle | DELETE /intent/{id} |
| `src/auth-jwt.ts` + `src/auth-router.ts` | §4 P3 Autonomy (identity bootstrap consumption) | ODA Canvas UC007 — Keycloak JWT validation against `identityconfig-operator-keycloak` realm |
| `src/telemetry.ts` | §5.2.1 Monitoring (OTel spans) | ODA Canvas UC006 — Custom Observability; default OTLP/HTTP backend is LangSmith, overridable to any Canvas collector |

---

## Telemetry Bootstrap Rule (UC006)

`src/telemetry.ts` MUST remain the very first `import` in `src/index.ts`.
The OTel SDK's auto-instrumentation hooks `require` at init time; any
other import ordered before it (express, http, etc.) will be bound
before the hooks install and will never emit spans.

Do not add new entrypoints that skip this import. If you create a new
process (worker, cron, script) that needs traces, its first line must
also be `import './telemetry'`.

---

## Upstream Standards — Citation and Use Rules

### RFC 9315 (IRTF NMRG) — FREELY USABLE
- Licence: IETF Trust / BCP 78 — IRTF stream (permissive)
- Use: Implement all concepts freely, cite with DOI `10.17487/RFC9315`
- Copyright notice in code: not required — citation in NOTICE file is sufficient
- Companion RFCs: RFC 7575, RFC 8309, RFC 8994 — same rules apply

### RFC 8329 (I2NSF framework) — CITATION ONLY
- Licence: IETF Trust / BCP 78 (permissive)
- Status in ibn-core: **cited, not implemented.** Surfaced via external review of
  draft-ahn-nmrg-5g-security-i2nsf-framework-01 in `docs/standards/external-reviews/`.
- Do not adopt I2NSF terminology (IUF, ICF, SCF, DMF, SDAF, NSF) in public-repo
  module names until/unless a WG-adopted draft lands. Individual-submission
  drafts must not shape open-core vocabulary.

### TMF921 v5.0.0 API (tmforum-apis GitHub) — APACHE 2.0
- Licence: Apache 2.0
- Use: Implement freely, retain Apache 2.0 attribution in NOTICE
- IG documents (IG1230, IG1251, IG1253): TMForum Proprietary
  - Do NOT copy IG document text or diagrams into this repo
  - Cite by reference only: "TM Forum IG1230 v3.0"

### CAMARA APIs (Linux Foundation) — APACHE 2.0
- Licence: Apache 2.0
- Use: Implement freely, retain NOTICE attribution
- Real operator CAMARA credentials: **never in this repo**

### MCP Protocol (Anthropic) — MIT
- Licence: MIT (compatible with Apache 2.0)
- Use: Implement freely

---

## Version Tags

| Tag | Commit | Description |
|-----|--------|-------------|
| `v1.4.0` | `7431505` | RFC 9315 IBN Baseline — pre-open-core. Paper 1 empirical starting point. |
| `v1.4.1` | `cd8880c` | Open Core Baseline — Apache 2.0 licence. |
| `v1.4.2` | `d91f12c` | Clean MCP boundary — operator services separated to private repo. |
| `v1.4.3` | `306fa01` | O2C verification fixes — MCP auth, TMF921 response shape, Istio TLS egress. Paper 1 cited release. |
| `v2.0.0` | `9a61c19` | RFC 9315 §4 P1+P2 closed. Redis SSoT + ProbeIntent. Paper 1 v2.0 implementation complete. |
| `v2.0.1` | `960a611` | 100% TMF921 CTK conformance (83/83). IntentReport projection fix + CTK seed runbook. |

**Rule:** Never rewrite or force-push these tags. They are cited in academic publications.

Future tags follow semver:
- `v2.0.1` — 100% TMF921 CTK conformance (83/83), IntentReport fix
- `v3.0.0` — Live CAMARA integration with operator sandbox
- `v4.0.0` — Multi-operator federation

---

## Paper Citation Reference

When code changes relate to Paper 1 claims, use this commit message format:

```
type(scope): description

Implements: RFC 9315 §X.X.X ([section title])
TMF921: [resource or endpoint affected]
Paper: [claim this supports, e.g. "supports §IV-B CTK compliance claim"]
```

The paper citation for this repo:
> R. Pfeifer, "ibn-core: RFC 9315 Intent-Based Networking Production
> Implementation," GitHub, 2026. [Online].
> Available: https://github.com/vpnetconsult/ibn-core, v2.0.1.

---

## O2C Test Case — Canonical Verification

The primary test case for regression checks:

```bash
curl -X POST http://localhost:8080/api/v1/intent \
  -H 'Content-Type: application/json' \
  -d '{
    "customerId": "CUST-12345",
    "intent": "I need internet for working from home"
  }'
```

Expected: `lifecycleStatus: "completed"`, `reportState: "fulfilled"`

This is the Order-to-Cash (O2C) use case described in Paper 1.
If this test fails after any change, do not commit.

---

*Last updated: April 2026 — Vpnet Cloud Solutions Sdn. Bhd. · added
"Agent-Native Development" methodology section; prior revision February
2026 (v2.0.1).*
