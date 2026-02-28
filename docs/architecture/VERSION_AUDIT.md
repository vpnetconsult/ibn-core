# Version Audit — ibn-core Stack

**Date:** February 2026
**Project:** ibn-core v2.0.1 — Vpnet Cloud Solutions Sdn. Bhd.

---

## Priority Summary

| # | Component | Deployed | Latest | Gap | Priority |
|---|-----------|----------|--------|-----|----------|
| 1 | Istio | 1.20.1 | 1.29.0 | 9 minors — EOL since 2024 | CRITICAL |
| 2 | Jaeger | 1.46 | 2.15.0 | Full major rewrite — EOL 2025-12-31 | HIGH |
| 3 | Kiali | v1.76 | v2.22.0 | Full major version | HIGH |
| 4 | Grafana | 9.5.5 | 12.4.0 | 3 majors — unpatched CVEs | HIGH |
| 5 | Prometheus | v2.41.0 | v3.10.0 | 3+ majors — EOL Feb 2023 | HIGH |
| 6 | Node.js (mock-mcp) | 20.x | 24.13.1 | 2 LTS majors — EOL 2026-04-30 | HIGH |
| 7 | Redis | 7-alpine (floating) | 7.4.7-alpine / 8.6.1 | Floating tag; Redis 7.2 EOL today | MEDIUM-HIGH |
| 8 | Node.js (app Dockerfiles) | 22.x | 24.13.1 | 1 LTS major | MEDIUM |
| 9 | containerd | 2.2.0 | 2.2.1 | 1 patch — verify runc CVEs | LOW-MEDIUM |
| 10 | Neo4j Community | 5-community (floating) | 5.26.21 LTS | Unknown exact patch; ⚠️ GPLv3 licence | LOW-MEDIUM |
| 11 | Kubernetes | v1.35.0 | v1.35.1 | 1 patch | LOW |

---

## Detail by Component

### 1. Istio — CRITICAL

| Field | Value |
|-------|-------|
| Deployed | 1.20.1 |
| Latest stable | 1.29.0 (released 2026-02-16) |
| EOL | Istio 1.20 went EOL in 2024 |
| Supported band | 1.27, 1.28, 1.29 |

Istio 1.20 has been end-of-life for over a year and receives no CVE patches. Recent CVEs affecting supported Istio releases that are **not** backported to 1.20:

| CVE | CVSS | Description |
|-----|------|-------------|
| CVE-2025-66220 | 8.1 High | Traffic policy bypass |
| CVE-2025-64527 | 8.1 High | Authorization policy bypass |
| CVE-2025-64763 | 8.1 High | mTLS bypass via header manipulation |
| CVE-2025-54588 | 7.5 High | Use-after-free in DNS cache |

**Action:** Upgrade to Istio 1.28.x or 1.29.0. Must be coordinated with Kiali upgrade (see item 3). Target a single maintenance window for both.

---

### 2. Jaeger — HIGH

| Field | Value |
|-------|-------|
| Deployed | 1.46 (`jaegertracing/all-in-one:1.46`) |
| Latest stable | v2.15.0 (released 2026-02-07) |
| EOL | Jaeger v1 EOL: 2025-12-31 |

Jaeger v1 reached end-of-life on 31 December 2025. No further releases of v1 binaries will be made. Jaeger v2 is an architectural rewrite based on the OpenTelemetry Collector framework — configuration format, image names, and deployment model have all changed. Known unpatched issues in v1.46:

- Stored XSS in Jaeger UI (pre-1.53 not fully mitigated)
- CVE-2024-24788 (Go stdlib DoS via malformed DNS response)

**Action:** Plan migration to Jaeger v2. This is not a drop-in upgrade — allocate dedicated effort for reconfiguration and testing.

---

### 3. Kiali — HIGH

| Field | Value |
|-------|-------|
| Deployed | v1.76 (`kiali/kiali:v1.76`) |
| Latest stable | v2.22.0 |

Kiali v2 requires a supported Istio version. Running Kiali v1.76 against Istio 1.20 (EOL) creates a double compatibility problem — the mesh observability console cannot accurately reflect mesh state and will not receive bug fixes.

**Action:** Upgrade Kiali to v2.22.0 in the same maintenance window as the Istio upgrade. These two must be coordinated.

---

### 4. Grafana — HIGH

| Field | Value |
|-------|-------|
| Deployed | 9.5.5 (`grafana/grafana:9.5.5`) |
| Latest stable | 12.4.0 (released 2026-02-24) |
| EOL | Grafana 9.x is long EOL |

Known CVEs in Grafana 9.5.5:

| CVE | Severity | Status in 9.5.5 |
|-----|----------|-----------------|
| Snapshot authorization bypass | High | Vulnerable (affects 9.5.0–9.5.17) |
| Stored XSS in Text plugin | High | Vulnerable |
| CVE-2023-2801 (public dashboard DoS) | High | Patched in 9.5.3 ✓ |
| CVE-2023-2183 (unauthorized alert sending) | Medium | Patched in 9.5.3 ✓ |

Upgrading from 9.x to 12.x requires a staged migration through 10.x and 11.x. Breaking changes include: unified alerting became mandatory (v10), Angular panel support dropped (v11), new navigation UX (v11).

**Action:** Begin staged upgrade planning: 9.5.5 → 10.x → 11.x → 12.x.

---

### 5. Prometheus — HIGH

| Field | Value |
|-------|-------|
| Deployed | v2.41.0 (`prom/prometheus:v2.41.0`) |
| Latest stable | v3.10.0 (released 2026-02-25) |
| Latest LTS | v3.5.1 (January 2026) |
| EOL | v2.41 went EOL February 2023 (6 weeks after release) |

Prometheus v2.41.0 has been EOL for 3 years. Known unpatched issue:

| CVE | Severity | Description |
|-----|----------|-------------|
| CVE-2022-46146 | High | Authentication cache poisoning via bcrypt bypass in Exporter Toolkit |

Prometheus v3.x introduces: OTLP ingest pipeline, native histograms (stable in v3.10), removal of deprecated storage flags. Migration requires updating scrape configs and reviewing any v2-specific flags.

**Action:** Upgrade to v3.5.1 LTS or v3.10.0. Review scrape configuration compatibility before upgrade.

---

### 6. Node.js — mock-mcp — HIGH

| Field | Value |
|-------|-------|
| Deployed | `node:20-alpine` (`mcp-services-k8s/mock-mcp.yaml`) |
| Latest LTS | 24.13.1 "Krypton" (Active LTS, released 2026-02-10) |
| Node.js 20 EOL | 2026-04-30 (60 days) |

Node.js 20 enters end-of-life in 60 days and will cease receiving security patches. Unpatched CVEs will accumulate from that date.

**Action:** Update `mock-mcp.yaml` base image from `node:20-alpine` to `node:22-alpine` (or `node:24-alpine`) before April 30, 2026.

---

### 7. Redis — MEDIUM-HIGH

| Field | Value |
|-------|-------|
| Deployed | `redis:7-alpine` (floating tag) |
| Latest 7.x | 7.4.7-alpine |
| Latest overall | 8.6.1 (released 2026-02-23) |
| Redis 7.2 EOL | 2026-02-28 (today) |

Two immediate risks:

1. **Floating tag** — `redis:7-alpine` resolves to whatever Docker Hub serves at pull time. The actual running patch version is unknown and may vary between pod restarts.
2. **Redis 8.x licence change** — Redis 8.x uses a tri-licence model (RSALv2 / SSPLv1 / AGPLv3). None of these are compatible with Apache 2.0. Upgrading to Redis 8.x would violate the project's licence policy.

Recent CVEs in Redis 7.x:

| CVE | Severity | Description |
|-----|----------|-------------|
| CVE-2025-27151 | High | Stack overflow / RCE in redis-check-aof |
| CVE-2025-49844 | High | Lua script RCE |
| CVE-2025-46817 | High | Lua script RCE (variant) |
| CVE-2025-46818 | Medium | Lua context execution as another user |

**Action:** Pin image to `redis:7.4.7-alpine` immediately. Do **not** upgrade to Redis 8.x without a formal licence review — RSALv2/SSPL are not Apache 2.0-compatible.

---

### 8. Node.js — app Dockerfiles — MEDIUM

| Field | Value |
|-------|-------|
| Deployed | `node:22-alpine` (floating tag, `src/Dockerfile` and `src/Dockerfile.build`) |
| Latest LTS | 24.13.1 "Krypton" (Active LTS) |
| Node.js 22 EOL | April 2027 |

Node.js 22 remains on Active LTS until April 2027. The January 2026 security patch addressed:

| CVE | Severity | Description |
|-----|----------|-------------|
| CVE-2025-59465 | High | HTTP/2 crash via malformed HEADERS frame |
| CVE-2026-21636 | Medium | Permission model bypass via Unix Domain Socket |
| CVE-2026-21637 | Medium | TLS PSK/ALPN DoS |

The floating `node:22-alpine` tag means these patches may or may not be present depending on when the image was last pulled.

**Action:** Pin to a specific patch (e.g., `node:22.14-alpine`) to guarantee CVE patch uptake. Consider planning move to Node.js 24 LTS within 2026.

---

### 9. containerd — LOW-MEDIUM

| Field | Value |
|-------|-------|
| Deployed | 2.2.0 |
| Latest stable | 2.2.1 |

CVE-2025-64329 (goroutine leak / DoS, CVSS 6.9 Medium) was patched in 2.2.0 final — deployed version is protected. However, also verify the underlying runc version:

| CVE | Severity | Description |
|-----|----------|-------------|
| CVE-2025-31133 | High | Container escape via runc mount race |
| CVE-2025-52565 | High | runc mount race (variant) |
| CVE-2025-52881 | High | runc mount race (variant) |

**Action:** Update containerd to 2.2.1 in next maintenance window. Verify runc version is ≥ 1.2.8 / 1.3.3.

---

### 10. Neo4j Community — LOW-MEDIUM ⚠️ Licence Flag

| Field | Value |
|-------|-------|
| Deployed | `neo4j:5-community` (floating tag) |
| Latest 5.x LTS | 5.26.21 |
| Latest overall | 2026.01.4 (calendar versioning, released 2026-02-04) |
| Licence | **GPLv3** |

⚠️ **Licence conflict:** Neo4j Community Edition is licensed under GPLv3, which is listed as incompatible with Apache 2.0 in `CLAUDE.md`. While Neo4j runs as a separate networked service (not linked into the ibn-core codebase), the GPL isolation should be formally reviewed and documented.

The `neo4j:5-community` floating tag likely resolves to 5.26.21 (current LTS patch) but should be pinned for reproducibility.

**Action:**
1. Pin image to `neo4j:5.26.21-community`.
2. Conduct a formal licence review to confirm GPL isolation is acceptable under the project's Apache 2.0 policy.

---

### 11. Kubernetes — LOW

| Field | Value |
|-------|-------|
| Deployed | v1.35.0 |
| Latest stable | v1.35.1 (released 2026-02-10) |
| EOL | 2027-02-28 |

One patch behind. Notable CVEs in the broader ecosystem (not specific to v1.35.0): Ingress-NGINX batch (CVE-2025-1974 Critical, CVE-2025-1098/1097 High) — not applicable here as NGINX ingress is not deployed; Istio gateway is used instead.

**Action:** Update to v1.35.1 in next maintenance window.

---

## Recommended Upgrade Sequencing

| Phase | Components | Notes |
|-------|-----------|-------|
| **Immediate** | Pin Redis to `7.4.7-alpine`, Neo4j to `5.26.21-community`, Node.js app to `22.14-alpine` | No functional change — tag pinning only |
| **Phase 1** | Istio 1.29 + Kiali v2.22 | Must be done together in one window |
| **Phase 2** | Prometheus v3.5.1 LTS + Grafana 12.x | Breaking changes; requires scrape config review and staged Grafana migration |
| **Phase 3** | Jaeger v2 | Architectural rewrite — requires dedicated planning |
| **Phase 4** | mock-mcp Node.js 20 → 22 | Before 2026-04-30 EOL |
| **Phase 5** | Kubernetes v1.35.1 + containerd 2.2.1 | Low risk; cluster patch |
| **Review** | Neo4j Community GPLv3 licence | Legal/compliance review — may require alternative |
| **Review** | Redis 8.x upgrade feasibility | Licence compatibility (RSALv2/SSPL) must be confirmed before upgrade |
