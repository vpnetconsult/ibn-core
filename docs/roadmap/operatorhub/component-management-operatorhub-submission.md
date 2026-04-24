# TMFOP001 Component Management → community-operators — Submission Plan

| Field | Value |
|---|---|
| Target upstream | [`k8s-operatorhub/community-operators`](https://github.com/k8s-operatorhub/community-operators) |
| Source upstream | [`tmforum-oda/oda-canvas`](https://github.com/tmforum-oda/oda-canvas) — `source/operators/TMFOP001-Component-Management` |
| Canvas operator ID | **TMFOP001** — Component Management |
| Source licence | Apache 2.0 (verified — `tmforum-oda/oda-canvas/LICENSE`) |
| Destination distribution | OperatorHub.io · OpenShift embedded · OKD |
| Effort estimate | **L** (1–2 weeks across 3 PRs) |
| Plan author | Vpnet Cloud Solutions Sdn. Bhd. |
| Plan date | 2026-04-24 |
| Status | ⬜ Proposed — awaiting TM Forum + Vpnet approval to act as upstream submitter |

---

## 1. Why TMFOP001 first

The **Component Management operator** is the root of the Canvas. It owns
the `Component` CRD (`oda.tmforum.org/v1alpha3` Kind `Component`) and
decomposes each `Component` CR into the sub-resources that the other ten
Canvas operators reconcile (`ExposedAPI`, `DependentAPI`,
`PublishedNotification`, `IdentityConfig`, `SecretsManagement`, etc.).

Without TMFOP001 installed, a `kubectl apply -f component.yaml` from an
ODA Component chart (ibn-core included) produces a single static CR that
nothing watches. Shipping TMFOP001 through community-operators is the
minimal viable step that makes "install the Canvas on any OLM-managed
cluster" a one-command operation.

Follow-ups (TMFOP002 API-Management, TMFOP003 Identity-Config, then the
rest) are tracked under `docs/roadmap/operatorhub/README.md` as Phase 2
and Phase 3.

## 2. What community-operators requires

Verified against <https://k8s-operatorhub.github.io/community-operators/>
on 2026-04-24.

### 2.1 Directory layout (bundle format — recommended)

```
operators/
└── oda-canvas-component-management/
    ├── ci.yaml
    └── <x.y.z>/
        ├── manifests/
        │   ├── <crd-1>.crd.yaml
        │   ├── <crd-2>.crd.yaml
        │   └── oda-canvas-component-management.v<x.y.z>.clusterserviceversion.yaml
        └── metadata/
            └── annotations.yaml
```

### 2.2 Mandatory artifacts

| Artifact | Purpose |
|---|---|
| `ClusterServiceVersion` (CSV) | Declares deployment, RBAC, owned CRDs, capability level, display metadata, install modes |
| `CustomResourceDefinition`s | One YAML per CRD (`Component`, and any sub-resource CRDs TMFOP001 owns) |
| `annotations.yaml` | Bundle media type, OLM channels, default channel, OpenShift version range |
| `ci.yaml` | Reviewer list, `updateGraph: replaces-mode` or `semver-mode` |

### 2.3 Gates to pass before merge

| Gate | Requirement |
|---|---|
| Licence | Apache 2.0 or a compatible OSI licence. ✅ Canvas repo confirmed Apache 2.0. |
| DCO | Every commit signed `Signed-off-by:`. ibn-core uses `Co-Authored-By:` — these are different trailers; both are cheap to add. |
| `operator-sdk bundle validate` | Must pass `--select-optional suite=operatorframework`. Catches CSV schema errors, missing examples, RBAC drift. |
| Scorecard | OLM scorecard basic checks: CR applied, deploy succeeds, olm-bundle-validate passes. |
| Container image | Must be on a public registry (e.g. `ghcr.io/tmforum-oda/component-operator`) with a signed digest. The bundle references the image by digest, not tag. |
| Vanilla Kubernetes | Operator must install and reconcile a sample Component on a vanilla k8s cluster (for OperatorHub.io publication). Currently assumed — needs confirmation on kind/minikube. |
| Minimum capability level | **Basic Install** is acceptable for first submission. "Seamless Upgrades" can be added in later revisions via the `replaces:` chain. |

## 3. Source-side conversion work (`tmforum-oda/oda-canvas`)

The Canvas ships as Helm today. An OLM bundle needs different artifacts.
This is NOT a rewrite — the operator binary is unchanged. Only the
distribution wrapper changes.

| From (Helm) | To (OLM bundle) | Notes |
|---|---|---|
| `Chart.yaml` — name, version, appVersion | CSV `metadata.name` + `spec.version` | Use same semver as chart version. |
| `values.yaml` — image.repository, image.tag | CSV `spec.install.spec.deployments[0].spec.template.spec.containers[0].image` | Pin to image digest, not tag. Registry TBD — confirm with TM Forum; likely `ghcr.io/tmforum-oda/component-operator`. |
| `templates/deployment.yaml` | CSV `spec.install.spec.deployments[0]` | Embed the rendered Deployment; no Helm templating. |
| `templates/rbac.yaml` (Role + Binding + SA) | CSV `spec.install.spec.permissions` + `clusterPermissions` | OLM creates the SA/Role/Binding from this section. |
| `templates/crds/*.yaml` | `manifests/*.crd.yaml` (sibling of CSV) | CRDs go next to the CSV in the bundle, not inside it. |
| `NOTES.txt`, `README.md` | CSV `spec.description` (Markdown) + icon base64 | LongDescription surfaces on OperatorHub.io tile. |

An auxiliary script should live in `tmforum-oda/oda-canvas` under
`tools/olm/render-bundle.sh` that renders the Helm chart, extracts the
deployment + RBAC, and emits the CSV + annotations.yaml. This keeps Helm
as the primary development path and makes the OLM bundle a
derived artifact rather than a forked manifest set.

## 4. CSV fields — draft contents

These are the values that need concrete decisions before the PR opens.
None of them require code changes — they are metadata the Canvas
maintainers pick.

| CSV field | Proposed value | Decision owner |
|---|---|---|
| `metadata.name` | `oda-canvas-component-management.v<x.y.z>` | TM Forum |
| `spec.displayName` | `TM Forum ODA Canvas — Component Management` | TM Forum |
| `spec.version` | Track Canvas Helm chart version | TM Forum |
| `spec.keywords` | `["tmforum", "oda", "canvas", "telco", "bss", "oss", "component"]` | — |
| `spec.maintainers` | TM Forum ODA-CP maintainers (emails from MAINTAINERS file) | TM Forum |
| `spec.provider.name` | `TM Forum` | — |
| `spec.links` | Canvas repo, OperatorHub listing, docs site | — |
| `spec.icon` | TM Forum logo (base64 PNG, transparent bg, ≥128×128) | TM Forum marketing |
| `spec.installModes` | `OwnNamespace=true, SingleNamespace=true, MultiNamespace=false, AllNamespaces=true` | See §5 |
| `spec.capabilities` annotation | `Basic Install` for first revision | — |
| `spec.minKubeVersion` | `1.27.0` (current Canvas CI floor) | TM Forum |
| `spec.customresourcedefinitions.owned` | One entry per CRD — at minimum `Component.v1alpha3.oda.tmforum.org` | — |

## 5. Open questions — blockers we cannot resolve unilaterally

These must be answered by the TM Forum ODA-CP maintainers, not by us, and
the answers shape the PR:

1. **Container-image registry.** Does the Canvas publish the
   component-operator image to a public registry with immutable digests?
   If yes — confirm the registry path. If no — TM Forum must first
   publish the image (e.g. to `ghcr.io/tmforum-oda/...` with
   provenance / SBOM attestations).
2. **`AllNamespaces` support.** Canvas today assumes per-namespace
   install (Component CRs live in the same namespace as the component
   workload). Does the operator work correctly when watching all
   namespaces? If not, the CSV must declare `AllNamespaces=false`, which
   is acceptable but limits listing adoption.
3. **CRD conversion webhook.** The Canvas has moved across
   `v1alpha1 → v1alpha3`. Is there a conversion webhook? OLM requires
   conversion webhooks to be declared in the CSV under
   `spec.webhookdefinitions` and the serving cert must be issued by a
   cert-manager the operator bundles. This may add material work.
4. **Who is the upstream submitter?** community-operators `ci.yaml`
   `reviewers` list controls auto-labelling for fast-track merges. TM
   Forum maintainers need to decide whose GitHub handles go there.
5. **Vpnet's role.** Are we proposing to act as upstream contributor to
   TM Forum (i.e. open the PR ourselves under TM Forum's direction), or
   are we documenting the plan for TM Forum to execute? This plan
   assumes **option A** but defers the decision to TM Forum.

## 6. PR plan — 3-step upstream flow

### PR 1 — `tmforum-oda/oda-canvas` — bundle-render tooling

| Item | Detail |
|---|---|
| Branch | `feat/olm-bundle-tooling` |
| Files added | `tools/olm/render-bundle.sh`, `tools/olm/csv-template.yaml`, `tools/olm/README.md` |
| Files changed | `.github/workflows/olm-bundle.yml` (new — runs `operator-sdk bundle validate` on every PR) |
| Merge criteria | Bundle renders cleanly from `helm template`; `operator-sdk bundle validate` passes for the current Canvas release |
| Reviewer | TM Forum ODA-CP maintainers |

### PR 2 — `tmforum-oda/oda-canvas` — publish operator image to a public registry

| Item | Detail |
|---|---|
| Branch | `feat/component-operator-ghcr-publish` |
| Files added | `.github/workflows/component-operator-publish.yml` (builds + pushes image + cosign sign) |
| Acceptance | A pinned digest (`ghcr.io/tmforum-oda/component-operator@sha256:...`) is available for the Canvas release being bundled |
| Reviewer | TM Forum ODA-CP maintainers |

### PR 3 — `k8s-operatorhub/community-operators` — first bundle submission

| Item | Detail |
|---|---|
| Branch | `operator/oda-canvas-component-management-v<x.y.z>` |
| Files added | `operators/oda-canvas-component-management/ci.yaml` + `operators/oda-canvas-component-management/<x.y.z>/manifests/*.yaml` + `operators/oda-canvas-component-management/<x.y.z>/metadata/annotations.yaml` |
| Sign-off | Every commit DCO-signed |
| CI gates | `operator-sdk bundle validate` · scorecard basic · catalog index build · graph check |
| Reviewer | `ci.yaml` `reviewers:` list includes TM Forum maintainers + OperatorHub reviewers |
| Acceptance | Green pipeline → `authorized-changes` label → auto-merge |

## 7. ibn-core side — what changes (almost nothing)

ibn-core is a **consumer** of the Canvas. Nothing in ibn-core's `src/`,
`helm/ibn-core/`, or operator-facing annotations needs to change for
TMFOP001 to ship via OperatorHub. Specifically:

- `helm/ibn-core/templates/component.yaml` already targets
  `oda.tmforum.org/v1alpha3` — unchanged.
- UC006 and UC007 annotations (`customObservability`,
  `externalAuthentication`) ride on the same `Component` CR and are
  unaffected.
- The Canvas CTK evidence files in `docs/compliance/` do not change.

The only ibn-core-side deliverable is a **README note** once TMFOP001
lands on OperatorHub, telling users they can `kubectl create` the
Canvas through OLM as an alternative to the Helm install. That note is
tracked as a follow-up, not as part of this plan.

## 8. Rollback / abandonment

If this plan stalls (e.g. TM Forum declines to own upstream submission,
or the operator-image-publishing gate can't be met), ibn-core loses
nothing — the Helm install path remains fully supported and is the
only path we currently rely on. The plan can be re-opened against a
later Canvas release without rework.

## 9. Acceptance criteria

Plan is "approved" when:

1. TM Forum ODA-CP maintainers confirm they are willing to own
   upstream submission (or delegate to Vpnet with a MAINTAINERS-listed
   reviewer).
2. Open question §5.1 (image registry) has a concrete answer.
3. Open question §5.3 (conversion webhook) has a concrete answer.

Plan is "done" when:

- PR 3 merges on `k8s-operatorhub/community-operators`.
- <https://operatorhub.io/operator/oda-canvas-component-management>
  resolves to the listing.
- `kubectl operator install oda-canvas-component-management` on a
  vanilla kind cluster installs TMFOP001 and reconciles a sample
  `Component` CR to `Deployed`.

## 10. Revision history

| Revision | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-04-24 | Vpnet Cloud Solutions | First draft of submission plan — pending TM Forum approval. |
