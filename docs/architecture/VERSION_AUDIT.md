# Version Audit — ibn-core Stack

**Date:** February 2026
**Project:** ibn-core v2.0.1 — Vpnet Cloud Solutions Sdn. Bhd.

---

## Priority Summary

| # | Component | Was | Now | Status | Remaining gap |
|---|-----------|-----|-----|--------|---------------|
| 1 | Istio | 1.20.1 | **1.29.0** | ✅ Upgraded 2026-02-28 | Current |
| 2 | Jaeger | 1.46 (v1, EOL) | **2.15.0 (v2)** | ✅ Upgraded 2026-02-28 | Current |
| 3 | Kiali | v1.76 | **v2.22.0** | ✅ Upgraded 2026-02-28 | Current |
| 4 | Grafana | 9.5.5 | **12.4.0** | ✅ Upgraded 2026-02-28 | Current |
| 5 | Prometheus | v2.41.0 | **v3.10.0** | ✅ Upgraded 2026-02-28 | Current |
| 6 | Node.js (mock-mcp) | 20.x (floating) | **22.14.0-alpine** | ✅ Pinned 2026-02-28 | EOL Apr 2027 |
| 7 | Redis | 7-alpine (floating) | **7.4.7-alpine** | ✅ Pinned 2026-02-28 | ⚠️ 8.x licence review pending |
| 8 | Node.js (app Dockerfiles) | 22-alpine (floating) | **22.14.0-alpine** | ✅ Pinned 2026-02-28 | EOL Apr 2027 |
| 9 | Neo4j Community | 5-community (floating) | **5.26.21-community** | ✅ Pinned 2026-02-28 | ⚠️ GPLv3 licence review pending |
| 10 | containerd | 2.2.0 | 2.2.0 | 🔵 Pending | 1 patch behind |
| 11 | Kubernetes | v1.35.0 | v1.35.0 | 🔵 Pending | 1 patch behind |

---

## Open Actions

| Item | Action | Priority |
|------|--------|----------|
| Redis 8.x | Formal licence review (RSALv2/SSPL vs Apache 2.0) before any upgrade | MEDIUM |
| Neo4j GPLv3 | Formal GPL isolation review — confirm networked-service separation is acceptable | MEDIUM |
| Node.js 22→24 | Plan upgrade to Node.js 24 LTS within 2026 | LOW |
| containerd 2.2.1 | Update at next cluster maintenance window; verify runc ≥ 1.2.8 | LOW |
| Kubernetes v1.35.1 | Update at next cluster maintenance window | LOW |

---

## Upgrade Log

### 2026-02-28 — Items 1–8 completed

**Istio 1.20.1 → 1.29.0**
- Upgraded via `istioctl upgrade --set profile=demo`
- All intent-platform Envoy sidecars restarted to pick up proxy v1.29.0
- Script: `scripts/upgrade-infra.sh`
- Notes: Prometheus and Jaeger deployments required delete-before-recreate due to immutable selector/probe changes between Istio addon versions

**Jaeger 1.46 (v1) → 2.15.0 (v2)**
- Migrated from `jaegertracing/all-in-one` (v1) to `jaegertracing/jaeger` (v2)
- Health probe port changed: 14269 → 13133 (`/status`)
- Architecture: now OpenTelemetry Collector-based
- Applied Istio 1.29 addon manifest (base v2 config), then patched image to 2.15.0

**Kiali v1.76 → v2.22.0**
- Applied Istio 1.29 addon manifest + patched image
- Coordinated with Istio upgrade in same window (Kiali v2 requires Istio ≥ 1.27)

**Grafana 9.5.5 → 12.4.0**
- Applied Istio 1.29 addon manifest (datasource config), patched image to 12.4.0
- Resolves: snapshot authorization bypass CVE, stored XSS in Text plugin

**Prometheus v2.41.0 → v3.10.0**
- Applied Istio 1.29 addon manifest (Prometheus v3 scrape config), patched image to v3.10.0
- Resolves: CVE-2022-46146 (auth cache poisoning, CVSS High)
- Note: Prometheus v3 enforces strict Content-Type on scrapes; Istio 1.29 addon config handles Envoy sidecar compatibility

**Image tag pinning (items 6–9)**
- `redis:7-alpine` → `redis:7.4.7-alpine`
- `neo4j:5-community` → `neo4j:5.26.21-community`
- `node:22-alpine` → `node:22.14.0-alpine` (src/Dockerfile, src/Dockerfile.build)
- `node:20-alpine` → `node:22.14.0-alpine` (mock-mcp — pre-empts Node 20 EOL Apr 2026)

---

## Detail by Component

### 1. Istio ✅

| Field | Value |
|-------|-------|
| Was | 1.20.1 (EOL 2024) |
| Now | **1.29.0** |
| Upgraded | 2026-02-28 |
| CVEs resolved | CVE-2025-66220, CVE-2025-64527, CVE-2025-64763 (8.1 High), CVE-2025-54588 (7.5 High) |

---

### 2. Jaeger ✅

| Field | Value |
|-------|-------|
| Was | 1.46 — `jaegertracing/all-in-one:1.46` (v1, EOL 2025-12-31) |
| Now | **2.15.0** — `jaegertracing/jaeger:2.15.0` (v2) |
| Upgraded | 2026-02-28 |
| Architecture change | OpenTelemetry Collector-based; health probe port 14269 → 13133/status |
| CVEs resolved | Stored XSS (pre-1.53), CVE-2024-24788 (Go stdlib DoS) |

---

### 3. Kiali ✅

| Field | Value |
|-------|-------|
| Was | v1.76 — `kiali/kiali:v1.76` |
| Now | **v2.22.0** — `quay.io/kiali/kiali:v2.22.0` |
| Upgraded | 2026-02-28 |
| Notes | Coordinated with Istio upgrade; v2 requires Istio ≥ 1.27 |

---

### 4. Grafana ✅

| Field | Value |
|-------|-------|
| Was | 9.5.5 — `grafana/grafana:9.5.5` (EOL) |
| Now | **12.4.0** — `grafana/grafana:12.4.0` |
| Upgraded | 2026-02-28 |
| CVEs resolved | Snapshot authorization bypass (High), stored XSS in Text plugin (High) |

---

### 5. Prometheus ✅

| Field | Value |
|-------|-------|
| Was | v2.41.0 — `prom/prometheus:v2.41.0` (EOL Feb 2023) |
| Now | **v3.10.0** — `prom/prometheus:v3.10.0` |
| Upgraded | 2026-02-28 |
| CVEs resolved | CVE-2022-46146 (auth cache poisoning, High) |
| Notes | v3 strict Content-Type enforcement handled by Istio 1.29 addon scrape config |

---

### 6. Node.js — mock-mcp ✅

| Field | Value |
|-------|-------|
| Was | `node:20-alpine` (floating, EOL 2026-04-30) |
| Now | **`node:22.14.0-alpine`** (pinned) |
| Updated | 2026-02-28 |
| Next action | Plan upgrade to Node.js 24 LTS — Node 22 EOL April 2027 |

---

### 7. Redis ✅ (tag pinned) ⚠️ Licence review pending

| Field | Value |
|-------|-------|
| Was | `redis:7-alpine` (floating) |
| Now | **`redis:7.4.7-alpine`** (pinned) |
| Updated | 2026-02-28 |
| Redis 8.x | ⚠️ RSALv2/SSPL licence — **do not upgrade** without formal review |

Redis 8.x uses a tri-licence model (RSALv2 / SSPLv1 / AGPLv3). None are compatible with Apache 2.0. Stay on `7.4.7-alpine` until a licence review is completed.

---

### 8. Node.js — app Dockerfiles ✅ (tag pinned)

| Field | Value |
|-------|-------|
| Was | `node:22-alpine` (floating, both Dockerfiles) |
| Now | **`node:22.14.0-alpine`** (pinned) |
| Updated | 2026-02-28 |
| CVEs pinned | CVE-2025-59465 (High), CVE-2026-21636/21637 (Medium) |
| Next action | Plan upgrade to Node.js 24 LTS within 2026 |

---

### 9. Neo4j Community ✅ (tag pinned) ⚠️ Licence review pending

| Field | Value |
|-------|-------|
| Was | `neo4j:5-community` (floating) |
| Now | **`neo4j:5.26.21-community`** (pinned) |
| Updated | 2026-02-28 |
| Licence | **GPLv3** — formal isolation review required |

Neo4j Community Edition is GPLv3. While it operates as a separate networked service (not linked into ibn-core), a formal GPL isolation review should be documented to confirm compliance with the project's Apache 2.0 policy.

---

### 10. containerd — 🔵 Pending

| Field | Value |
|-------|-------|
| Deployed | 2.2.0 |
| Latest stable | 2.2.1 |
| Action | Update at next cluster maintenance window |
| runc CVEs | Verify runc ≥ 1.2.8 / 1.3.3 (CVE-2025-31133, CVE-2025-52565, CVE-2025-52881 — High) |

---

### 11. Kubernetes — 🔵 Pending

| Field | Value |
|-------|-------|
| Deployed | v1.35.0 |
| Latest stable | v1.35.1 (released 2026-02-10) |
| EOL | 2027-02-28 |
| Action | Update to v1.35.1 at next cluster maintenance window |
