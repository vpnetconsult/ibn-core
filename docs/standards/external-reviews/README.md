<!--
Copyright 2026 Vpnet Cloud Solutions Sdn. Bhd.
Licensed under the Apache License, Version 2.0
See LICENSE in the project root for license information.
-->

# External Reviews — ibn-core

This folder holds **structured reviews of external expert inputs** (IETF
Internet-Drafts, IETF RFCs, ETSI GS, 3GPP TS, TM Forum IG documents, O-RAN
specifications, white papers) against the current state of ibn-core.

## Purpose

ibn-core implements RFC 9315 Intent-Based Networking and TMF921 v5.0.0. As
the framework matures, we need a **repeatable way to position the
implementation against the wider standards and research landscape**:

1. **Validate architectural choices** — confirm that the seams we have (the
   `McpAdapter` boundary, the RFC 9315 §5 lifecycle, the intent hierarchy)
   line up with what the community is converging on.
2. **Surface gaps** — find concepts we have not modelled yet and decide,
   per gap, whether they belong in the roadmap or are out of scope.
3. **Flag counter-positions** — identify where the external source is
   weaker, vaguer, or less mature than our implementation. We want to
   engage with the community from evidence, not deference.
4. **Feed Paper 2 and beyond** — reviews become citations and frame the
   empirical contributions of future publications.

## How this folder is organised

| File | Purpose |
|------|---------|
| `README.md` | This file. Queue + conventions. |
| `TEMPLATE.md` | Blank review template. Copy + fill in. |
| `YYYY-MM-<slug>.md` | One completed review per file. |

### Naming convention

`YYYY-MM-<short-slug>.md` — e.g. `2026-04-draft-ahn-nmrg-5g-security-i2nsf-01.md`.
The slug should make the source identifiable without opening the file. Include
the source revision number (`-01`) when applicable; Internet-Drafts expire and
numbering matters.

### Authoring conventions

- **Copy `TEMPLATE.md`** into a new dated file. Do not edit the template in
  place for a new review.
- **Fill every section**, even if briefly. A blank "Counter-positions"
  section is almost always the sign of a lazy review.
- **Cite ibn-core evidence with file paths**, e.g. `src/mcp/McpAdapter.ts:46`.
  Reviews without code references are not useful for follow-up work.
- **Record the HEAD SHA and tag** at review time in the frontmatter block.
  Repos drift; reviews are time-stamped artefacts.
- **State limitations explicitly**. If the source is an individual I-D or
  an unratified white paper, say so in §8 of the template.

### What goes in, what does not

**In scope** for this folder:

- IETF RFCs and Internet-Drafts adjacent to RFC 9315 (NMRG, OPSAWG, I2NSF).
- ETSI group specifications (ENI, ZSM).
- 3GPP technical specifications (SA5 OAM, SA2 architecture) that intersect
  with intent-driven management.
- TM Forum Information Guides and API specifications.
- O-RAN Alliance working group outputs.
- Peer-reviewed papers and industrial white papers with architectural claims.

**Out of scope** (belongs elsewhere):

- TMF921 CTK conformance evidence → `docs/compliance/`.
- Internal design decisions and ADRs → `docs/architecture/`.
- Security assessments (DPIA, threat models) → `docs/security/`.
- Commercial operator collateral → private repo.

## Review queue

Order is by estimated signal-to-noise for ibn-core's current roadmap.
Items higher in the list are reviewed first.

| Priority | Source | Status |
|---|---|---|
| 1 | IETF draft-ahn-nmrg-5g-security-i2nsf-framework-01 | ✅ written 2026-04-21 |
| 2 | 3GPP TS 28.312 (Intent-driven management for mobile networks) — formal review; already cited in `src/imf/IntentHierarchy.ts` and `src/imf/ConflictArbiter.ts` | ⏳ pending |
| 3 | TM Forum IG1253 (Intent in Autonomous Networks) — cited in CHANGELOG but no formal review | ⏳ pending |
| 4 | Ericsson White Paper BCSS-25:024439 (AI agents in telecom) — referenced in `docs/architecture/AI_AGENT_ALIGNMENT_PLAN.md` | ⏳ pending |
| 5 | ETSI GS ENI 005 / 008 (Experiential Networked Intelligence — closed-loop cognitive networking) | ⏳ pending |
| 6 | O-RAN WG2 AIML / A1 interface | ⏳ pending |
| 7 | TM Forum IG1230 / IG1251 (Autonomous Networks reference architecture) | ⏳ pending |
| 8 | RFC 8993 (Reference Model for Autonomic Networking) — adjacent to RFC 9315 | ⏳ pending |
| 9 | NMRG active I-Ds (re-check list each cycle on datatracker.ietf.org) | ⏳ rolling |

New items are added to the bottom; priority can be re-ordered on merge of
a review that changes the picture.

## Using reviews

Each review's §7 ("Follow-up backlog") is the primary consumable. The
prioritised items are candidates for future planning documents; they are
**not** committed to the roadmap by virtue of appearing in a review. A
review raises a claim; a separate planning document adopts or rejects it.
