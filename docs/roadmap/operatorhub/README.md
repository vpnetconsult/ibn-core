# OperatorHub — Submission Roadmap

This folder holds **implementation plans** for publishing Kubernetes
operators to the OLM distribution channels:

- **[k8s-operatorhub/community-operators][1]** → OperatorHub.io listing
  (the broad Kubernetes audience) and the OpenShift embedded catalogue.
- **[redhat-openshift-ecosystem/community-operators-prod][2]** →
  OpenShift OperatorHub listing (the OpenShift / OKD audience
  specifically).

The two repositories share bundle formats but are distinct catalogues;
a Vpnet component that targets both surfaces needs the bundle in both
repos.

Plans in this folder are **documentation only** — they propose PR
sequences against upstream repos. Implementation lands as upstream PRs,
not as ibn-core code changes.

## Strategic direction

**Canvas is consumed, not published.** ibn-core uses TM Forum ODA
Canvas as its runtime substrate: Canvas operators (TMFOP001–011)
install from `tmforum-oda/oda-canvas` via Helm, watch the
`Component` CR that each ODA component (ibn-core included) emits, and
handle identity registration, API exposure, observability wiring, and
so on.

**Vpnet's own components are published.** ibn-core, and later the
operator-specific CAMARA adapters that live in the private repo, are
packaged as OLM bundles and submitted to the community catalogues so
customers can install them from within OpenShift's built-in
OperatorHub UI.

Division of responsibility:

| Actor | Produces | Distributes via |
|---|---|---|
| TM Forum ODA-CP | Canvas operators TMFOP001–011 | Helm charts under `tmforum-oda/oda-canvas` (current state). Upstream publishing to community-operators is a TM Forum decision, tracked in [canvas-operators-upstream.md](canvas-operators-upstream.md) but **not a Vpnet deliverable**. |
| Vpnet Cloud Solutions (this repo) | ibn-core as an OLM Helm-operator bundle | Dual submission to both community-operators catalogues — see [ibn-core-operatorhub-submission.md](ibn-core-operatorhub-submission.md). |

This keeps the boundaries clean: we do not try to upstream someone
else's work, and we do not fork the Canvas.

## Scope map

| Phase | Component | Plan | Owner |
|---|---|---|---|
| **P1** | **ibn-core** (first Vpnet component) | [ibn-core-operatorhub-submission.md](ibn-core-operatorhub-submission.md) | Vpnet |
| P2 | Future Vpnet components (CAMARA adapters, etc.) | not yet drafted | Vpnet |
| — (aspirational) | TMFOP001 Component Management (the Canvas itself) | [canvas-operators-upstream.md](canvas-operators-upstream.md) | TM Forum (informational only — Vpnet does not own this) |

## Scope exclusion — why Canvas publishing is NOT a Vpnet deliverable

The earlier draft of this roadmap included a plan to publish the
Canvas's TMFOP001 Component Management operator upstream. That plan
was reclassified as **informational** — it describes what TM Forum
could do, should they choose to, but Vpnet does not own that work.
Customers can and do install the Canvas via the Helm path that the
Canvas repo already provides. Publishing the Canvas upstream is a
value-add for the broader TM Forum community, not a prerequisite for
ibn-core's distribution.

## Conventions

- **Upstream-first.** Every deliverable lands in
  `k8s-operatorhub/community-operators` or
  `redhat-openshift-ecosystem/community-operators-prod`. We do not
  fork either repo.
- **Helm-native.** ibn-core's Helm chart is the source of truth.
  Bundle submissions wrap the chart using the Operator SDK
  `helm-operator` pattern — we do not rewrite ibn-core as a Go or
  Ansible operator.
- **Licence.** All submissions must be Apache 2.0. ibn-core already
  satisfies this (see `LICENSE` + `NOTICE` at repo root).
- **Signed-off-by.** Both target repos require DCO on every commit.
  This is in addition to the `Co-Authored-By:` trailer we use
  internally.
- **Plans are approval artefacts.** Landing a plan is not landing an
  implementation. Acceptance criteria in each plan must be testable.

## References

| Source | Purpose |
|---|---|
| [k8s-operatorhub/community-operators][1] · [docs site][3] | OperatorHub.io catalogue — primary target |
| [redhat-openshift-ecosystem/community-operators-prod][2] | OpenShift Community catalogue — secondary target |
| [Operator SDK Helm-operator tutorial][4] | Chart-to-bundle wrapping path |
| [OperatorHub.io][5] | User-facing listing surface |
| [tmforum-oda/oda-canvas][6] | Canvas source — consumed, not published |

[1]: https://github.com/k8s-operatorhub/community-operators
[2]: https://github.com/redhat-openshift-ecosystem/community-operators-prod
[3]: https://k8s-operatorhub.github.io/community-operators/
[4]: https://sdk.operatorframework.io/docs/building-operators/helm/tutorial/
[5]: https://operatorhub.io/
[6]: https://github.com/tmforum-oda/oda-canvas
