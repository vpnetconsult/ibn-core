# ibn-core → Community Operators (dual-channel) — Submission Plan

| Field | Value |
|---|---|
| Component | **ibn-core** — TMF921 Intent Management API v5.0.0 reference implementation |
| Wrapping pattern | [Operator SDK Helm-operator][helm-tutorial] around `helm/ibn-core` |
| CRD introduced | `Ibncore.v1alpha1.ibncore.vpnet.app` — watches one CR → renders the chart |
| Source chart | `helm/ibn-core` (current repo, current chart version) |
| Source licence | Apache 2.0 (ibn-core repo `LICENSE`) |
| Target catalogues | **Both:** [`k8s-operatorhub/community-operators`][ch1] (OperatorHub.io) + [`redhat-openshift-ecosystem/community-operators-prod`][ch2] (OpenShift OperatorHub) |
| Effort estimate | **L** (1–2 weeks across ~4 PRs, most of which are mechanical) |
| Plan author | Vpnet Cloud Solutions Sdn. Bhd. |
| Plan date | 2026-04-24 |
| Status | ⬜ Proposed |

---

## 1. Why this shape

ibn-core is a **workload**, not a controller — it runs a TMF921 HTTP
service. It does not watch CRDs or reconcile state.

The Operator SDK's **helm-operator** pattern is the correct wrapper
for this exact situation: it generates a thin controller that watches
a single custom resource (say `Ibncore`) and, on each reconcile, runs
`helm upgrade --install` against our existing chart. The chart is the
source of truth; the operator is 100 % generated scaffolding around
it. No Go code, no Python, no Ansible — and no fork of the chart.

This gets us three things in one move:

1. **Installable from the OpenShift OperatorHub UI** — the user
   experience the customer actually asks for.
2. **Installable via OLM on vanilla Kubernetes** — `kubectl operator
   install ibn-core` on any cluster where OLM is deployed.
3. **Helm path unchanged** — `helm install ibn-core helm/ibn-core`
   continues to work exactly as today. The bundle is additive, not
   a replacement.

## 2. What the user installs

### 2.1 User flow (OpenShift OperatorHub — primary surface)

```
OpenShift Console → OperatorHub → search "ibn-core" → Install
                                       │
                                       ▼
       OLM installs the ibn-core operator + the Ibncore CRD
                                       │
                                       ▼
       User creates an Ibncore CR:
         apiVersion: ibncore.vpnet.app/v1alpha1
         kind: Ibncore
         metadata: { name: dev, namespace: components }
         spec:
           image: { tag: v2.3.0 }
           observability: { otel: { enabled: true } }
           auth: { mode: jwt }
           canvas: { identityConfig: { enabled: true } }
                                       │
                                       ▼
       helm-operator reconciles CR → renders helm/ibn-core chart →
       creates Deployment, Service, ConfigMap, Secret refs, and the
       ODA Component CR that TMF001 (Canvas Component Management)
       then decomposes.
```

### 2.2 Canvas interaction (unchanged)

The Ibncore CR's Helm render still produces the
`oda.tmforum.org/v1alpha3` Component resource that Canvas operators
watch. Canvas operators do their usual job (identity bootstrap, API
exposure, observability wiring). **Nothing in the Canvas needs to
change for ibn-core to ship this way.**

## 3. Repo layout — where the bundle source lives

The bundle source lives in **this repo**, alongside the Helm chart:

```
ibn-core/
├── helm/
│   └── ibn-core/                          ← existing chart (unchanged)
└── operator/                              ← NEW
    ├── helm-charts/
    │   └── ibn-core/                      ← symlink or copy of ../../helm/ibn-core
    ├── config/
    │   ├── crd/                           ← generated Ibncore CRD
    │   ├── rbac/                          ← role derived from chart resources
    │   ├── samples/                       ← example Ibncore CRs (dev, canvas)
    │   └── manifests/                     ← CSV base + kustomize overlays
    ├── bundle/                            ← `make bundle` output
    │   ├── manifests/
    │   │   ├── ibn-core.clusterserviceversion.yaml
    │   │   └── ibncore.ibncore.vpnet.app.crd.yaml
    │   └── metadata/
    │       └── annotations.yaml
    ├── watches.yaml                       ← single-line map: Ibncore → helm-charts/ibn-core
    ├── Dockerfile                         ← helm-operator image
    ├── bundle.Dockerfile                  ← bundle image (referenced by CI, not shipped)
    └── Makefile                           ← `make bundle bundle-build bundle-push`
```

Design notes:

- `operator/helm-charts/ibn-core` is either a **symlink** or a
  **copy-on-release** of `helm/ibn-core`. Symlink is cleaner during
  development; copy-on-release is required because OLM bundle images
  bake the chart in. CI handles the copy.
- The `Ibncore` CRD's `.spec` schema is **derived** from the chart's
  `values.yaml` — one property per `values.yaml` top-level key, with
  `openAPIV3Schema` types enforcing what customers can pass.

## 4. Submission channels — both, not one or the other

### 4.1 OperatorHub.io — `k8s-operatorhub/community-operators`

Directory:

```
operators/ibn-core/
├── ci.yaml
└── <chart-version>/
    ├── manifests/
    │   ├── ibn-core.v<chart-version>.clusterserviceversion.yaml
    │   └── ibncore.ibncore.vpnet.app.crd.yaml
    └── metadata/
        └── annotations.yaml
```

### 4.2 OpenShift Community — `redhat-openshift-ecosystem/community-operators-prod`

Directory has the same shape (same bundle format). OpenShift adds two
extras via `annotations.yaml`:

- `com.redhat.openshift.versions: "v4.12-v4.16"` — supported OCP range.
- An additional `ci.yaml` key `cert`/`fbc` only if we pursue the
  file-based catalog path (we won't, for first submission).

Submitting to both is the same bundle rendered twice with different
`annotations.yaml` deltas — kept in sync by a single source CSV in
this repo, rendered via a `make publish-bundle CHANNEL={oh|ocp}`
target.

## 5. CSV — what goes in, what needs a decision

Concrete values we can fill in today (no external decisions needed):

| CSV field | Value |
|---|---|
| `metadata.name` | `ibn-core.v<chart-version>` |
| `spec.displayName` | `ibn-core — TMF921 Intent Management v5.0.0` |
| `spec.description` (Markdown) | Repo README abridged — RFC 9315 implementation, TMF921 v5.0.0 CTK 83/83, ODA Canvas Component |
| `spec.keywords` | `["tmforum", "tmf921", "rfc9315", "intent", "oda-canvas", "ai-native", "telco", "bss", "oss"]` |
| `spec.maintainers` | Roland Pfeifer · `roland@vpnet.app` |
| `spec.provider.name` | `Vpnet Cloud Solutions Sdn. Bhd.` |
| `spec.provider.url` | `https://vpnet.app` |
| `spec.links` | GitHub repo · Paper 1 DOI · UC compliance results |
| `spec.icon` | Vpnet logo (base64 PNG, ≥128×128, transparent) — Vpnet has this asset |
| `spec.installModes` | `OwnNamespace=true, SingleNamespace=true, MultiNamespace=false, AllNamespaces=false` (per-namespace component) |
| `spec.capabilities` annotation | `Basic Install` for v1. `Seamless Upgrades` added once we have two versions chained. |
| `spec.minKubeVersion` | `1.27.0` |
| `com.redhat.openshift.versions` (OCP bundle only) | `v4.12-v4.16` |

### 5.1 `spec.customresourcedefinitions.owned`

One entry only: the `Ibncore` CRD. The ODA `Component` CRD is **not**
owned by ibn-core — it is owned by the Canvas (TMFOP001). OLM
supports this via `required:` — we declare the Canvas's `Component`
CRD as a required CRD in the CSV, signalling that OperatorHub should
refuse to install ibn-core on a cluster where the Canvas is not
present.

```yaml
spec:
  customresourcedefinitions:
    owned:
      - name: ibncores.ibncore.vpnet.app
        version: v1alpha1
        kind: Ibncore
    required:
      - name: components.oda.tmforum.org
        version: v1alpha3
        kind: Component
        description: Provided by TM Forum ODA Canvas (tmforum-oda/oda-canvas). ibn-core emits a Component CR for the Canvas to decompose.
```

This is the clean seam between "Canvas is consumed" and "ibn-core is
published" — the CSV encodes the dependency without trying to own
the Canvas's CRDs.

## 6. CI integration — what has to move into this repo

Four small additions, all mechanical:

| File | Purpose |
|---|---|
| `operator/Makefile` | `bundle`, `bundle-build`, `bundle-push`, `bundle-validate` targets (standard helm-operator output from `operator-sdk init`). |
| `.github/workflows/operator-bundle.yml` | On every PR that touches `operator/` or `helm/ibn-core/`: run `operator-sdk bundle validate` and `operator-sdk scorecard`. |
| `.github/workflows/operator-publish.yml` | On tag push (`v*`): build operator image, build bundle image, push both to `ghcr.io/vpnetconsult/ibn-core-operator`, sign with cosign. |
| `operator/README.md` | How to regenerate the bundle locally, how to run the `Ibncore` CR against an existing Canvas. |

## 7. Open questions — to resolve before PR 3 opens

1. **Chart-version coupling.** Do the `ibn-core` chart version and
   operator bundle version move in lockstep, or independently?
   **Proposed:** lockstep — `operator.v<chart-version>` always. Simpler
   SemVer graph for OLM, matches our existing release cadence.
2. **Canvas-absent fallback.** If a user installs ibn-core on a
   cluster where the Canvas is not present, the `required` CSV
   entry blocks install. Is that the desired behaviour, or should
   the operator install and degrade gracefully (chart works fine
   standalone)? **Proposed:** block — "ibn-core on non-Canvas
   clusters" is out of scope for the OperatorHub distribution.
   Customers who want standalone can still `helm install` directly.
3. **Operator-image registry.** Does Vpnet publish to
   `ghcr.io/vpnetconsult/...` (current pattern for ibn-core images)
   or use a dedicated registry? **Proposed:** same registry as the
   application image, new repository name.
4. **Support policy.** OperatorHub.io asks for a support URL. Do we
   point at GitHub issues (public) or a Vpnet SI support address
   (private)? **Proposed:** GitHub issues for the bundle; the
   private support channel is for paid customers and is out of
   scope for the public catalogue.

## 8. PR plan — 4 steps, top-to-bottom

### PR 1 (this repo) — scaffold `operator/`

| Item | Detail |
|---|---|
| Branch | `feat/helm-operator-scaffold` |
| Added | `operator/` tree generated by `operator-sdk init --plugins=helm --domain=ibncore.vpnet.app --group=ibncore --kind=Ibncore --version=v1alpha1 --helm-chart ../helm/ibn-core` |
| Added | `.github/workflows/operator-bundle.yml` (validate on PR) |
| Not yet done | Publishing — bundle is built locally only |
| Acceptance | `make bundle-validate` passes on main |
| Reviewer | Vpnet internal |

### PR 2 (this repo) — CI publish + release flow

| Item | Detail |
|---|---|
| Branch | `feat/helm-operator-publish` |
| Added | `.github/workflows/operator-publish.yml` (tag-push → build + sign + push) |
| Added | `operator/README.md` |
| Added | Section in top-level `README.md` pointing to the OperatorHub install path |
| Acceptance | Pushing a test tag (e.g. `operator-test-v0.0.1`) produces a signed bundle image on `ghcr.io/vpnetconsult/ibn-core-operator-bundle` |

### PR 3 (upstream → community-operators) — first OperatorHub.io submission

| Item | Detail |
|---|---|
| Target repo | `k8s-operatorhub/community-operators` |
| Branch | `operator/ibn-core-v<chart-version>` |
| Added | `operators/ibn-core/ci.yaml` + `operators/ibn-core/<chart-version>/...` |
| Sign-off | Every commit DCO-signed (`git commit -s`) |
| CI gates | `operator-sdk bundle validate` · scorecard basic · graph check |
| Acceptance | `authorized-changes` label auto-applied via `reviewers:` → auto-merge → listing appears at `operatorhub.io/operator/ibn-core` within ~24 hours |

### PR 4 (upstream → community-operators-prod) — OpenShift catalogue submission

| Item | Detail |
|---|---|
| Target repo | `redhat-openshift-ecosystem/community-operators-prod` |
| Branch | same shape as PR 3, with `com.redhat.openshift.versions` set |
| Added | same bundle files, OCP-annotated |
| Acceptance | Listing appears in OpenShift Console → OperatorHub for any cluster in the supported OCP range |

## 9. What this plan does NOT include

- No rewrite of ibn-core as a Go/Ansible/Kubebuilder operator.
- No changes to `src/`.
- No changes to `helm/ibn-core/` beyond what a helm-operator wrap
  requires (likely: none — the chart renders the same resources).
- No attempt to publish any TMFOPnnn Canvas operator upstream. That
  track is informational only — see [canvas-operators-upstream.md](canvas-operators-upstream.md).
- No File-Based Catalog (FBC) work. Standard bundle format is
  sufficient for first submission; FBC can be a future optimisation.

## 10. Rollback / abandonment

The `operator/` tree is additive. If the submission stalls or the
maintenance burden proves too high, we delete `operator/` and the
two workflow files — no impact on the Helm install path, the TMF921
service, or the Canvas integration. The Helm chart and all existing
PRs (#34, #35, #36) remain fully supported.

## 11. Acceptance criteria

Plan is **approved** when:

1. Open question §7.2 (Canvas-absent fallback) has a documented
   decision.
2. Open question §7.3 (operator-image registry path) has a
   documented decision.
3. Vpnet confirms it owns the ongoing maintenance of the bundle
   (version bumps every chart release, security-patch propagation).

Plan is **done** when:

- PR 3 merges and `operatorhub.io/operator/ibn-core` resolves.
- PR 4 merges and ibn-core appears in OpenShift Console OperatorHub
  on an OCP 4.12+ cluster.
- `kubectl operator install ibn-core && kubectl apply -f
  sample-ibncore.yaml` on a kind cluster with the Canvas installed
  brings ibn-core to the same state that `helm install ibn-core
  helm/ibn-core` reaches.

## 12. Revision history

| Rev | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-04-24 | Vpnet Cloud Solutions | First draft — helm-operator wrap, dual-channel submission, Canvas consumed-not-published boundary. |

[helm-tutorial]: https://sdk.operatorframework.io/docs/building-operators/helm/tutorial/
[ch1]: https://github.com/k8s-operatorhub/community-operators
[ch2]: https://github.com/redhat-openshift-ecosystem/community-operators-prod
