# ODA Canvas Use-Case Plans

This folder holds **implementation plans** for TM Forum ODA Canvas CTK Use
Cases that ibn-core has **not yet** claimed conformance for, as recorded in
[`docs/compliance/ODA_CANVAS_PUBLISHED_RESULTS.md`](../../compliance/ODA_CANVAS_PUBLISHED_RESULTS.md).

Each file is a single-UC plan describing what the UC requires, what the repo
has today, what would need to change, and acceptance criteria. Plans are
**documentation only** — they do not change source code. Implementation lands
under a separate PR once a plan is approved.

## Scope map

| UC | Title | Status | Plan |
|----|-------|--------|------|
| UC001 | Identity Bootstrap | ✅ Covered (v2.2.0) | — |
| UC002 | Expose API in the Canvas | ✅ Covered (v2.2.0) | — |
| UC003 | Retrieve API endpoint | ✅ Covered (v2.2.0) | — |
| UC004 | Publish Metrics | ✅ Covered (v2.2.0) | — |
| UC005 | Retrieve Observability Data | ✅ Covered (v2.2.0) | — |
| UC006 | Custom Observability | ⬜ Planned | [UC006-custom-observability.md](UC006-custom-observability.md) |
| UC007 | External Authentication | 🛠 In implementation (v2.3.0) | [UC007-external-authentication.md](UC007-external-authentication.md) |
| UC008 | Internal Authentication | ⬜ Not yet planned | — |
| UC009 | Authorization | ⬜ Not yet planned | — |
| UC010 | Token Refresh | ⬜ Not yet planned | — |
| UC011 | Licence Metrics | ❌ Not applicable (Apache 2.0) | — |
| UC012 | Published Events | ⬜ Not yet planned | — |
| UC013 | Subscribed Events | ⬜ Not yet planned | — |
| UC014 | Event Hub Integration | ⬜ Not yet planned | — |
| UC015 | Event Delivery Semantics | ⬜ Not yet planned | — |

## Conventions

- **Filename:** `UCNNN-<short-slug>.md` (lowercase, hyphen-separated).
- **No code.** Plans are approval artefacts. Landing a plan is not landing an
  implementation.
- **Cite sources.** Every claim about ibn-core's current state must point at
  a file or line; every Canvas-side claim must point at the CTK repo or a
  published design doc.
- **Honest gaps.** Call out what's missing and what's genuinely out of scope.
- **Acceptance criteria are testable.** The plan must make it possible for
  someone else to know when the UC is "done."
- **Effort is a range, not a guess.** Use S (≤1 day), M (1–3 days),
  L (1–2 weeks), XL (>2 weeks).

## References

- [ODA Canvas CTK](https://github.com/tmforum-oda/oda-canvas-ctk)
- [AI-Native Canvas design](https://github.com/tmforum-oda/oda-canvas/blob/main/AI-Native-Canvas-design.md)
- [`ODA_CANVAS_CTK.md`](../../compliance/ODA_CANVAS_CTK.md) — current evidence map
- [`ODA_CANVAS_PUBLISHED_RESULTS.md`](../../compliance/ODA_CANVAS_PUBLISHED_RESULTS.md) — current conformance record
