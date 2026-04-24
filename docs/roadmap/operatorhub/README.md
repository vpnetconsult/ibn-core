# Canvas Operator → community-operators — Submission Roadmap

This folder holds **implementation plans** for publishing the ODA Canvas
operators to the [community-operators][1] distribution channel (the canonical
source that feeds [OperatorHub.io][2], OpenShift's embedded OperatorHub, and
OKD).

Plans in this folder are **documentation only** — they propose a PR sequence
against the upstream [`k8s-operatorhub/community-operators`][3] repo and/or
[`tmforum-oda/oda-canvas`][4] repo. Implementation lands in the **upstream**
repositories, not in ibn-core; ibn-core tracks the effort here because
ibn-core is a **dependent consumer** of the Canvas (ibn-core ships as an ODA
Component that the Canvas operators install and wire).

## Why this matters for ibn-core

ibn-core declares itself an ODA Component (`oda.tmforum.org/v1alpha3`
`Component` kind). That CRD is installed and watched by the Canvas's
**Component Management operator** (TMFOP001). Today:

- Canvas operators ship **Helm-only** from `tmforum-oda/oda-canvas`.
- Neither Canvas nor any TMFOPnnn operator is published on
  community-operators or OperatorHub.io.
- Operators using OLM (Operator Lifecycle Manager) — the default install
  path on OpenShift and an increasingly common path on vanilla Kubernetes
  — cannot install the Canvas through their cluster's operator catalogue.

This is a friction point for any customer who wants ibn-core on a Canvas
they manage via OLM rather than Helm. Publishing the Canvas operators to
community-operators removes that friction.

## Scope map

| Phase | Target operator | Plan | Owner repo |
|---|---|---|---|
| P1 | TMFOP001 Component Management | [component-management-operatorhub-submission.md](component-management-operatorhub-submission.md) | upstream PR to [`k8s-operatorhub/community-operators`][3] |
| P2 | TMFOP002 API Management + TMFOP003 Identity Config | follow-up plan (not yet drafted) | upstream PR to [`k8s-operatorhub/community-operators`][3] |
| P3 | Remaining TMFOPnnn (004–011) | follow-up plan (not yet drafted) | upstream PR to [`k8s-operatorhub/community-operators`][3] |

## Scope exclusion — why ibn-core itself is NOT a candidate

ibn-core is a **workload**, not a Kubernetes operator. It does not watch
CRDs or reconcile custom resources. It exposes a TMF921 API and is
installed via Helm. `community-operators` accepts only OLM bundles of
**Kubernetes operators** — ibn-core is out of scope.

The ibn-core Helm chart can be listed on [ArtifactHub][5] (separate
distribution channel, Helm-native). That's tracked separately if/when we
decide to do it; it's not part of this roadmap.

## Conventions

- **Upstream-first.** Every deliverable in a plan here lands in
  `tmforum-oda/oda-canvas` or `k8s-operatorhub/community-operators`. We
  do not fork.
- **Traceability.** Each plan pins the exact upstream commit / tag / chart
  version it converts to an OLM bundle.
- **Licence check.** Every upstream source touched must be Apache 2.0 or
  MIT (our repo's licence policy — see `CLAUDE.md`).
- **DCO sign-off.** Every commit to community-operators must carry
  `Signed-off-by:` (community-operators DCO requirement — not the same as
  our `Co-Authored-By:` trailer).

## References

- [community-operators docs site][1]
- [community-operators repo][3]
- [OperatorHub.io][2]
- [tmforum-oda/oda-canvas][4]
- [Operator SDK bundle format][6]
- [TM Forum ODA Canvas operator matrix — `source/operators/README.md`][7]

[1]: https://k8s-operatorhub.github.io/community-operators/
[2]: https://operatorhub.io/
[3]: https://github.com/k8s-operatorhub/community-operators
[4]: https://github.com/tmforum-oda/oda-canvas
[5]: https://artifacthub.io/
[6]: https://sdk.operatorframework.io/docs/olm-integration/generation/
[7]: https://github.com/tmforum-oda/oda-canvas/tree/main/source/operators
