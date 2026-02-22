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

---

## Upstream Standards — Citation and Use Rules

### RFC 9315 (IRTF NMRG) — FREELY USABLE
- Licence: IETF Trust / BCP 78 — IRTF stream (permissive)
- Use: Implement all concepts freely, cite with DOI `10.17487/RFC9315`
- Copyright notice in code: not required — citation in NOTICE file is sufficient
- Companion RFCs: RFC 7575, RFC 8309, RFC 8994 — same rules apply

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
| `v1.4.0` | `7431505` | RFC 9315 IBN Baseline — pre-open-core. Cited as empirical baseline in Paper 1. |
| `v1.4.1` | `cd8880c` | Open Core Baseline — Apache 2.0. This is the paper-cited public release. |

**Rule:** Never rewrite or force-push these tags. They are cited in academic publications.

Future tags follow semver:
- `v2.0.0` — Redis persistence, ProbeIntent, full TMF921 CTK compliance target
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
> V. Subramaniam, "ibn-core: RFC 9315 Intent-Based Networking Production
> Implementation," GitHub, 2026. [Online].
> Available: https://github.com/vpnetconsult/ibn-core, v1.4.1.

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

*Last updated: February 2026 — Vpnet Cloud Solutions Sdn. Bhd.*
