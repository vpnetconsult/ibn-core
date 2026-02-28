#!/bin/bash
# upgrade-infra.sh — ibn-core infrastructure upgrade
# Copyright 2026 Vpnet Cloud Solutions Sdn. Bhd.
# Licensed under the Apache License, Version 2.0
# See LICENSE in the project root for license information.
#
# Upgrades the local kind cluster infrastructure stack:
#   Istio         1.20.1  → 1.29.0
#   Prometheus    v2.41.0 → v3.10.0   (via Istio 1.29 addon manifest)
#   Grafana       9.5.5   → 12.4.0
#   Jaeger        1.46    → 2.15.0    (v2 — new image: jaegertracing/jaeger)
#   Kiali         v1.76   → v2.22.0   (via Istio 1.29 addon manifest)
#
# Prerequisites:
#   - Docker running
#   - kind cluster running (kind start-cluster or Docker Desktop)
#   - kubectl configured
#
# Usage:
#   ./scripts/upgrade-infra.sh
#
# Run from the repo root.
set -euo pipefail

# ---------------------------------------------------------------------------
# Versions
# ---------------------------------------------------------------------------
ISTIO_VERSION="1.29.0"
GRAFANA_IMAGE="docker.io/grafana/grafana:12.4.0"
JAEGER_IMAGE="docker.io/jaegertracing/jaeger:2.15.0"
ISTIO_ADDONS_BASE="https://raw.githubusercontent.com/istio/istio/release-1.29/samples/addons"

# ---------------------------------------------------------------------------
# Colours
# ---------------------------------------------------------------------------
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; BOLD='\033[1m'; NC='\033[0m'

step()  { echo -e "\n${BLUE}${BOLD}==> $*${NC}"; }
ok()    { echo -e "${GREEN}✓${NC} $*"; }
warn()  { echo -e "${YELLOW}⚠${NC}  $*"; }
fail()  { echo -e "${RED}✗${NC}  $*"; exit 1; }

# ---------------------------------------------------------------------------
# Preflight checks
# ---------------------------------------------------------------------------
step "Preflight checks"

docker info &>/dev/null        || fail "Docker is not running. Start Docker and try again."
kubectl cluster-info &>/dev/null || fail "Cannot reach Kubernetes cluster. Is the kind cluster running?"

CURRENT_ISTIO=$(kubectl -n istio-system get deployment istiod \
  -o jsonpath='{.spec.template.spec.containers[0].image}' 2>/dev/null || echo "not-found")
ok "Cluster reachable"
ok "Current istiod image: ${CURRENT_ISTIO}"

# ---------------------------------------------------------------------------
# Step 1 — Download istioctl 1.29.0
# ---------------------------------------------------------------------------
step "Step 1/6 — Download istioctl ${ISTIO_VERSION}"

ISTIOCTL_BIN="$(pwd)/.istioctl-${ISTIO_VERSION}"

if [[ -f "${ISTIOCTL_BIN}" ]]; then
  ok "istioctl ${ISTIO_VERSION} already downloaded"
else
  ARCH=$(uname -m)
  OS=$(uname -s | tr '[:upper:]' '[:lower:]')

  # Map arch
  [[ "$ARCH" == "arm64" || "$ARCH" == "aarch64" ]] && ARCH="arm64" || ARCH="amd64"
  # Istio uses "osx" for macOS in tarball names
  [[ "$OS" == "darwin" ]] && OS_SUFFIX="osx" || OS_SUFFIX="linux"

  TARBALL="istioctl-${ISTIO_VERSION}-${OS_SUFFIX}-${ARCH}.tar.gz"
  URL="https://github.com/istio/istio/releases/download/${ISTIO_VERSION}/${TARBALL}"

  echo "  Downloading ${URL} ..."
  curl -fsSL -o "/tmp/${TARBALL}" "${URL}"
  tar -xzf "/tmp/${TARBALL}" -C /tmp istioctl
  mv /tmp/istioctl "${ISTIOCTL_BIN}"
  chmod +x "${ISTIOCTL_BIN}"
  rm -f "/tmp/${TARBALL}"
  ok "istioctl ${ISTIO_VERSION} ready at ${ISTIOCTL_BIN}"
fi

ISTIOCTL="${ISTIOCTL_BIN}"

# ---------------------------------------------------------------------------
# Step 2 — Upgrade Istio (1.20.1 → 1.29.0)
# ---------------------------------------------------------------------------
step "Step 2/6 — Upgrade Istio to ${ISTIO_VERSION}"

warn "This upgrades istiod in-place. Sidecar proxies in intent-platform will"
warn "be upgraded automatically on the next pod restart / rollout."

"${ISTIOCTL}" upgrade --set profile=demo --skip-confirmation

# Wait for istiod to be ready with new version
kubectl rollout status deployment/istiod -n istio-system --timeout=5m
ok "istiod ${ISTIO_VERSION} deployed and ready"

# Restart the intent-platform workloads to pick up new sidecar proxy version
step "Step 2b — Restart intent-platform workloads to update Envoy sidecars"
kubectl rollout restart deployment -n intent-platform
kubectl rollout status deployment/business-intent-agent -n intent-platform --timeout=5m
ok "intent-platform workloads restarted with new Envoy sidecars"

# ---------------------------------------------------------------------------
# Step 3 — Upgrade Prometheus (via Istio 1.29 addon manifest)
# ---------------------------------------------------------------------------
step "Step 3/6 — Upgrade Prometheus (Istio 1.29 addon — includes v3)"

# The Istio 1.29 addon manifest ships Prometheus v3.
# Add fallback_scrape_protocol to prevent v3 Content-Type strictness
# from breaking Envoy sidecar scraping.
kubectl apply -f "${ISTIO_ADDONS_BASE}/prometheus.yaml"

# Patch the prometheus ConfigMap to add fallback_scrape_protocol for Envoy sidecars.
# Prometheus v3 enforces strict Content-Type; Envoy returns prometheus text without it.
PROM_CM=$(kubectl -n istio-system get configmap prometheus -o json 2>/dev/null || echo "")
if [[ -n "$PROM_CM" ]]; then
  if ! echo "$PROM_CM" | grep -q "fallback_scrape_protocol"; then
    warn "Patching prometheus ConfigMap to add fallback_scrape_protocol for Envoy compatibility"
    # Extract current config, inject fallback, re-apply
    kubectl -n istio-system get configmap prometheus -o jsonpath='{.data.prometheus\.yml}' \
      | sed 's/scrape_configs:/fallback_scrape_protocol: PrometheusText0.0.4\nscrape_configs:/' \
      > /tmp/prometheus-patched.yml
    kubectl -n istio-system patch configmap prometheus \
      --patch "$(kubectl -n istio-system create configmap prometheus \
        --from-file=prometheus.yml=/tmp/prometheus-patched.yml \
        --dry-run=client -o json)"
    rm -f /tmp/prometheus-patched.yml
    ok "prometheus ConfigMap patched for v3 Envoy compatibility"
  else
    ok "prometheus ConfigMap already has fallback_scrape_protocol"
  fi
fi

kubectl rollout status deployment/prometheus -n istio-system --timeout=3m
ok "Prometheus upgraded"

# ---------------------------------------------------------------------------
# Step 4 — Upgrade Grafana (9.5.5 → 12.4.0)
# ---------------------------------------------------------------------------
step "Step 4/6 — Upgrade Grafana to 12.4.0"

# Apply the Istio 1.29 addon manifest first (updates datasource config),
# then patch the image to 12.4.0 (the Istio addon may ship an older Grafana).
kubectl apply -f "${ISTIO_ADDONS_BASE}/grafana.yaml"
kubectl -n istio-system set image deployment/grafana \
  grafana="${GRAFANA_IMAGE}"

kubectl rollout status deployment/grafana -n istio-system --timeout=3m
ok "Grafana upgraded to 12.4.0"

# ---------------------------------------------------------------------------
# Step 5 — Upgrade Jaeger (1.46 → 2.15.0 — v2, new image name)
# ---------------------------------------------------------------------------
step "Step 5/6 — Upgrade Jaeger to v2 (2.15.0)"

warn "Jaeger v2 uses a new image (jaegertracing/jaeger instead of jaegertracing/all-in-one)"
warn "v1 is EOL since 2025-12-31. This is an in-place patch of the existing all-in-one deployment."

# Apply Istio 1.29 addon manifest for base config, then patch image to v2
kubectl apply -f "${ISTIO_ADDONS_BASE}/jaeger.yaml"
kubectl -n istio-system set image deployment/jaeger \
  jaeger="${JAEGER_IMAGE}" 2>/dev/null || \
kubectl -n istio-system set image deployment/jaeger \
  all-in-one="${JAEGER_IMAGE}"

kubectl rollout status deployment/jaeger -n istio-system --timeout=3m
ok "Jaeger upgraded to v2 (2.15.0)"

# ---------------------------------------------------------------------------
# Step 6 — Upgrade Kiali (v1.76 → v2.22.0)
# ---------------------------------------------------------------------------
step "Step 6/6 — Upgrade Kiali to v2.22.0"

# Kiali v2 requires Istio ≥ 1.27 — satisfied by Step 2.
kubectl apply -f "${ISTIO_ADDONS_BASE}/kiali.yaml"

kubectl rollout status deployment/kiali -n istio-system --timeout=5m
ok "Kiali upgraded to v2.22.0"

# ---------------------------------------------------------------------------
# Verify
# ---------------------------------------------------------------------------
step "Verification"

echo ""
echo "Component image versions after upgrade:"
echo "---------------------------------------"
for dep in istiod istio-ingressgateway istio-egressgateway prometheus grafana jaeger kiali; do
  IMG=$(kubectl -n istio-system get deployment "${dep}" \
    -o jsonpath='{.spec.template.spec.containers[0].image}' 2>/dev/null || echo "not found")
  printf "  %-28s %s\n" "${dep}:" "${IMG}"
done

echo ""
echo "intent-platform pod status:"
kubectl get pods -n intent-platform

echo ""
echo -e "${GREEN}${BOLD}Infrastructure upgrade complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. Run the O2C smoke test:"
echo "     kubectl port-forward -n intent-platform svc/business-intent-agent-service 8080:8080 &"
echo "     curl -X POST http://localhost:8080/api/v1/intent \\"
echo "       -H 'Content-Type: application/json' \\"
echo "       -d '{\"customerId\":\"CUST-12345\",\"intent\":\"I need internet for working from home\"}'"
echo ""
echo "  2. Check Kiali mesh topology:"
echo "     kubectl port-forward -n istio-system svc/kiali 20001:20001 &"
echo "     open http://localhost:20001"
echo ""
echo "  3. Clean up downloaded istioctl:"
echo "     rm -f ${ISTIOCTL_BIN}"
