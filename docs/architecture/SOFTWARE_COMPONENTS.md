# Software Component Description — ibn-core

**Project:** ibn-core — RFC 9315 Intent-Based Networking Framework
**Version:** v2.0.1
**Namespaces:** `intent-platform` (application), `istio-system` (service mesh + observability)
**Runtime:** Kubernetes v1.35.0 / containerd 2.2.0 / Istio 1.20.1
**Last updated:** February 2026 — Vpnet Cloud Solutions Sdn. Bhd.

---

## Component Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        intent-platform (ns)                         │
│                                                                     │
│  ┌──────────────────────────┐    ┌──────────────────────────────┐   │
│  │   business-intent-agent  │───►│      mock-mcp  (dev only)    │   │
│  │   (HPA: 2–5 replicas)    │    │      port 9000               │   │
│  └───────────┬──────────────┘    └──────────────────────────────┘   │
│              │                                                       │
│       ┌──────┴──────┐                                               │
│       ▼             ▼                                               │
│  ┌─────────┐  ┌────────────────────┐                               │
│  │  Redis  │  │ knowledge-graph-mcp│                               │
│  │  :6379  │  │ port 8080          │                               │
│  └─────────┘  └────────┬───────────┘                               │
│                        │                                            │
│                        ▼                                            │
│                  ┌──────────┐                                       │
│                  │  Neo4j   │                                       │
│                  │  :7474   │                                       │
│                  │  :7687   │                                       │
│                  └──────────┘                                       │
└─────────────────────────────────────────────────────────────────────┘
         ▲ Istio Gateway (80/443) + mTLS PeerAuthentication (STRICT)
         ▼ Istio ServiceEntry → api.anthropic.com:443
```

---

## Components

### 1. business-intent-agent

| Field | Value |
|-------|-------|
| **Image** | `business-intent-agent:v1.3.1-o2c-fix` |
| **Registry** | `ghcr.io/vpnetconsult/business-intent-agent` |
| **Port** | 8080 (HTTP) |
| **Replicas** | 2 initial, 2–5 via HPA |
| **CPU** | request 250m / limit 1000m |
| **Memory** | request 512Mi / limit 2Gi |
| **RFC 9315** | §5.1.1 Ingestion, §5.1.2 Translation, §5.1.3 Orchestration |
| **TMF921** | Full v5.0.0 API surface (83/83 CTK) |

**Purpose:** Core IBN agent. Exposes the TMF921 v5.0.0 REST API, passes natural-language intents to Claude Sonnet via MCP, persists lifecycle state in Redis, and delegates orchestration to an `McpAdapter` implementation.

**Key configuration:**

| Parameter | Value |
|-----------|-------|
| Claude model | `claude-sonnet-4-20250514` |
| Max tokens | 4 000 |
| Temperature | 0.7 |
| MCP timeout | 10 s, 3 retries |
| Redis TTL | 7 776 000 s (90 days) |
| Log level | info |

**Security:** Non-root UID 1001, read-only root filesystem, all Linux capabilities dropped, pod anti-affinity for HA spread across nodes.

**Autoscaling (HPA):**

| Metric | Target | Scale-up | Scale-down |
|--------|--------|----------|------------|
| CPU | 70% | +100% or +2 pods / 30 s | −50% / 60 s (300 s window) |
| Memory | 80% | +100% or +2 pods / 30 s | −50% / 60 s (300 s window) |

---

### 2. Redis

| Field | Value |
|-------|-------|
| **Image** | `redis:7-alpine` |
| **Port** | 6379 (TCP) |
| **Replicas** | 1 |
| **CPU** | request 50m / limit 200m |
| **Memory** | request 64Mi / limit 256Mi |
| **RFC 9315** | §4 P1 — Single Source of Truth (SSoT) / Single Version of Truth (SVoT) |

**Purpose:** Persistent intent store. Implements the RFC 9315 §4 P1 SSoT principle — every intent state transition is written here with a 90-day TTL. Append-Only File (AOF) persistence ensures durability across pod restarts.

**Key configuration:**

| Parameter | Value |
|-----------|-------|
| Persistence | AOF (`--appendonly yes`) |
| Intent TTL | 90 days |
| Security | Non-root UID 999, read-only filesystem |
| Health | Liveness + readiness via `redis-cli ping` |

---

### 3. Neo4j

| Field | Value |
|-------|-------|
| **Image** | `neo4j:5-community` |
| **Ports** | 7474 (HTTP browser), 7687 (Bolt) |
| **Replicas** | 1 |
| **CPU** | request 500m / limit 2000m |
| **Memory** | request 1Gi / limit 2Gi |
| **Storage** | 2Gi PersistentVolume |

**Purpose:** Knowledge graph database backing the product catalog. Stores telecom product/bundle relationships as a graph and serves RDF-compliant queries via the n10s plugin. Used by the knowledge-graph-mcp service to answer intent resolution queries (e.g. "which bundle matches a 1 Gbps home broadband intent?").

**Key configuration:**

| Parameter | Value |
|-----------|-------|
| Plugins | `apoc`, `n10s` (RDF / neosemantics) |
| Auth | Credentials from `neo4j-credentials` secret |
| Access | Internal only (no external Istio route) |

---

### 4. knowledge-graph-mcp

| Field | Value |
|-------|-------|
| **Image** | `vpnet/knowledge-graph-mcp-service:2.0.0` |
| **Port** | 8080 (HTTP) |
| **RFC 9315** | §5.1.3 Orchestration — product catalog queries |

**Purpose:** MCP-protocol dispatcher that bridges the `McpAdapter` interface to Neo4j graph queries. Translates structured tool calls from the business-intent-agent into Cypher queries against the Neo4j product graph and returns scored product/bundle recommendations.

**Exposed MCP tools:**

| Tool | Description |
|------|-------------|
| `find_related_products` | Graph traversal for related SKUs |
| `search_product_catalog` | Full-text + semantic product search |
| `get_bundle_recommendations` | Scored bundle suggestions for an intent |

**Key configuration:**

| Parameter | Value |
|-----------|-------|
| Entry point | `POST /mcp/tools/call` |
| Neo4j URI | `bolt://neo4j:7687` (env: `NEO4J_URI`) |
| Metrics | Prometheus-compatible, RDF query tracking |
| Deployment | ConfigMap patches `server.js` via strategic merge |

---

### 5. mock-mcp *(development only)*

| Field | Value |
|-------|-------|
| **Image** | `node:20-alpine` |
| **Port** | 9000 (HTTP) |
| **Replicas** | 1 |
| **CPU** | request 50m / limit 200m |
| **Memory** | request 64Mi / limit 128Mi |
| **RFC 9315** | §5.1.3 Orchestration, §4 P5 Capability Exposure |

**Purpose:** In-cluster mock of the operator BSS/OSS MCP adapter. Used for local development and the canonical O2C test case without requiring real CAMARA/operator credentials. Production deployments replace this with operator-specific adapters from the private `ibn-operator-adapters` repository.

**Exposed endpoints:**

| Endpoint | Purpose |
|----------|---------|
| `GET /health` | Liveness probe |
| `GET /capabilities` | RFC 9315 §4 P5 capability advertisement |
| `POST /orchestrate` | RFC 9315 §5.1.3 intent orchestration |
| `GET /intent/{id}/status` | RFC 9315 §5.2.1 monitoring |
| `POST /intent/{id}/cancel` | RFC 9315 §5.2.3 compliance actions |
| `GET /metrics` | Prometheus scrape |

**Mock capabilities:** `broadband` (residential / business), `qod` (Quality on Demand).

---

## Infrastructure Platform

### 6. Kubernetes

| Field | Value |
|-------|-------|
| **Version** | v1.35.0 |
| **Distribution** | kind (Kubernetes in Docker) — single-node, local |
| **Node** | `local-k8s-control-plane` |
| **Node role** | control-plane (single-node; workloads also run here) |
| **Architecture** | arm64 |
| **OS** | Debian GNU/Linux 12 (Bookworm) — kernel 6.12.69-linuxkit |
| **Container runtime** | containerd 2.2.0 |
| **Namespace** | `intent-platform` |

**Purpose:** Container orchestration layer. Manages pod scheduling, service discovery, secrets, RBAC, PersistentVolumes, and the HPA for the business-intent-agent. Provides the runtime for all application and infrastructure components.

**Key cluster resources:**

| Resource | Purpose |
|----------|---------|
| Namespace `intent-platform` | Isolates all ibn-core workloads; Istio injection enabled |
| ServiceAccount + RBAC | Least-privilege pod identity for the agent |
| Secrets | Anthropic API key, MCP URLs, Neo4j credentials, PII hash salt |
| ConfigMap | Non-sensitive agent configuration (model, timeouts, log level) |
| PersistentVolumeClaim | 2Gi for Neo4j graph data |
| HPA | Autoscales business-intent-agent 2–5 replicas on CPU/memory |

---

### 7. Istio

| Field | Value |
|-------|-------|
| **Version** | 1.20.1 |
| **Components** | istiod (pilot), ingress gateway, egress gateway |
| **Image** | `docker.io/istio/pilot:1.20.1` |
| **mTLS mode** | STRICT (PeerAuthentication, namespace-wide) |
| **Sidecar injection** | Automatic (namespace label `istio-injection: enabled`) |

**Purpose:** Service mesh providing mutual TLS encryption for all pod-to-pod traffic, traffic management (retries, timeouts, circuit breaking), and controlled egress to the Anthropic API. Implements RFC 9315 §5.2.3 compliance actions via DestinationRule circuit breakers and HPA triggers.

**Deployed resources:**

| Resource | Kind | Purpose |
|----------|------|---------|
| `intent-platform-gateway` | Gateway | HTTP :80 / HTTPS :443 ingress |
| `business-intent-agent-vs` | VirtualService | Routes external traffic → agent :8080 |
| `bss-oss-mcp-vs` | VirtualService | Routes to BSS/OSS MCP adapter |
| `customer-data-mcp-vs` | VirtualService | Routes to customer data MCP |
| `knowledge-graph-mcp-vs` | VirtualService | Routes to Neo4j knowledge graph MCP |
| `intent-platform-mtls` | PeerAuthentication STRICT | Enforces mTLS for all pods in namespace |
| `anthropic-api` | ServiceEntry | Registers api.anthropic.com as mesh external service |
| `anthropic-api-vs` | VirtualService | 120 s timeout, 2 retries on 5xx/reset/connect-failure |
| `anthropic-api-dr` | DestinationRule | App-originated TLS, max 10 TCP / 10 HTTP2 connections |
| DestinationRules (×4) | DestinationRule | Per-service circuit breaker policies |

---

## Observability Stack

All observability components run in the `istio-system` namespace, installed as part of the Istio add-on bundle.

### 8. Prometheus

| Field | Value |
|-------|-------|
| **Image** | `prom/prometheus:v2.41.0` |
| **Sidecar** | `jimmidyson/configmap-reload:v0.8.0` |
| **Port** | 9090 (HTTP) |
| **Replicas** | 1 |

**Purpose:** Metrics collection and storage. Scrapes Prometheus-format metrics from business-intent-agent, mock-mcp, knowledge-graph-mcp, and all Istio sidecar proxies. Backs Grafana dashboards and feeds RFC 9315 §5.2.1 monitoring data.

---

### 9. Grafana

| Field | Value |
|-------|-------|
| **Image** | `docker.io/grafana/grafana:9.5.5` |
| **Port** | 3000 (HTTP) |
| **Replicas** | 1 |

**Purpose:** Visualisation layer for Prometheus metrics. Provides dashboards for intent lifecycle throughput, latency, MCP orchestration success rates, and Istio mesh telemetry.

---

### 10. Jaeger

| Field | Value |
|-------|-------|
| **Image** | `docker.io/jaegertracing/all-in-one:1.46` |
| **Ports** | 16686 (UI), 14268 (collector), 6831/UDP (agent) |
| **Replicas** | 1 |

**Purpose:** Distributed tracing. Captures end-to-end traces for intent requests — from TMF921 API ingress through Claude MCP calls to Redis persistence and MCP orchestration. Traces are injected automatically by Istio sidecars (Zipkin-compatible B3 headers).

---

### 11. Kiali

| Field | Value |
|-------|-------|
| **Image** | `quay.io/kiali/kiali:v1.76` |
| **Port** | 20001 (HTTP) |
| **Replicas** | 1 |

**Purpose:** Istio service mesh observability console. Provides live traffic topology, mTLS validation, VirtualService/DestinationRule health, and integration with Prometheus and Jaeger for unified mesh insight.

---

## Networking — Istio

### Ingress

| Resource | Kind | Purpose |
|----------|------|---------|
| `intent-platform-gateway` | Gateway | Accepts HTTP :80 and HTTPS :443, hosts `*` |
| `business-intent-agent-vs` | VirtualService | Routes external traffic to agent :8080 |

### mTLS

| Resource | Mode | Scope |
|----------|------|-------|
| `intent-platform-mtls` | PeerAuthentication STRICT | All pods in `intent-platform` namespace |

All service-to-service traffic (agent ↔ Redis, agent ↔ knowledge-graph-mcp, agent ↔ mock-mcp) is mutually authenticated and encrypted via Istio sidecar-injected mTLS.

### Egress — Anthropic API

| Resource | Kind | Config |
|----------|------|--------|
| `anthropic-api` | ServiceEntry | `api.anthropic.com:443`, TLS SIMPLE |
| `anthropic-api-vs` | VirtualService | 120 s timeout, 2 retries (60 s each), retry on 5xx/reset/connect-failure |
| `anthropic-api-dr` | DestinationRule | TLS DISABLE (app-originated TLS), max 10 TCP / 10 HTTP2 connections |

---

## Resource Summary

**Application components** (`intent-platform` namespace):

| Component | Image | Port | CPU req/lim | Mem req/lim | Replicas |
|-----------|-------|------|-------------|-------------|----------|
| business-intent-agent | `business-intent-agent:v1.3.1-o2c-fix` | 8080 | 250m / 1000m | 512Mi / 2Gi | 2–5 (HPA) |
| redis | `redis:7-alpine` | 6379 | 50m / 200m | 64Mi / 256Mi | 1 |
| neo4j | `neo4j:5-community` | 7474, 7687 | 500m / 2000m | 1Gi / 2Gi | 1 |
| knowledge-graph-mcp | `vpnet/knowledge-graph-mcp-service:2.0.0` | 8080 | — | — | 1 |
| mock-mcp *(dev)* | `node:20-alpine` | 9000 | 50m / 200m | 64Mi / 128Mi | 1 |

**Infrastructure platform** (`istio-system` namespace + cluster):

| Component | Image | Port | Version |
|-----------|-------|------|---------|
| Kubernetes | — | — | v1.35.0 |
| containerd | — | — | 2.2.0 |
| Istio (istiod) | `istio/pilot:1.20.1` | — | 1.20.1 |
| Prometheus | `prom/prometheus:v2.41.0` | 9090 | v2.41.0 |
| Grafana | `grafana/grafana:9.5.5` | 3000 | 9.5.5 |
| Jaeger | `jaegertracing/all-in-one:1.46` | 16686 | 1.46 |
| Kiali | `kiali/kiali:v1.76` | 20001 | v1.76 |

---

## Open Core Boundary

| Component | Repo | Notes |
|-----------|------|-------|
| `McpAdapter` interface | This repo (public) | Contract definition — Apache 2.0 |
| `MockMcpAdapter` | This repo (public) | Local dev only |
| mock-mcp server | This repo (public) | Generic O2C dev target |
| knowledge-graph-mcp | This repo (public) | Generic product graph |
| Operator BSS/OSS adapters | `ibn-operator-adapters` (private) | CAMARA / U Mobile / TM |
| CAMARA credentials | Private repo only | Never in this repo |

See `src/mcp/McpAdapter.ts` and `CLAUDE.md` for the full open core seam definition.
