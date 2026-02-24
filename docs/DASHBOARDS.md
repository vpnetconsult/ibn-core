# Local Dashboard Access Guide

**Last Updated:** January 11, 2026
**Status:** Active Port-Forwards Running ✅

---

## Quick Start

All dashboards are accessible via localhost after running the port-forward setup:

```bash
# Set up all dashboards (runs in background)
./scripts/setup-dashboards.sh

# Or manually create port-forwards:
pkill -f "kubectl port-forward" 2>/dev/null || true
kubectl port-forward -n istio-system svc/grafana 3000:3000 &
kubectl port-forward -n istio-system svc/prometheus 9090:9090 &
kubectl port-forward -n istio-system svc/kiali 20001:20001 &
kubectl port-forward -n intent-platform svc/neo4j-service 7474:7474 &
kubectl port-forward -n intent-platform svc/knowledge-graph-mcp-service 8080:8080 &
```

---

## 📊 Available Dashboards

### 1. Grafana - Metrics & Visualization

**URL:** http://localhost:3000

**Credentials:** `admin` / `admin` (change on first login)

**What to View:**
- Istio Service Dashboard - Service mesh metrics
- Istio Mesh Dashboard - Overall mesh health
- Istio Performance Dashboard - Latency, throughput
- Custom dashboards for Business Intent Agent

**Key Metrics:**
- Request rate (RPS)
- Error rate (%)
- Latency (p50, p95, p99)
- Service availability

**Quick Start:**
1. Open http://localhost:3000
2. Login with admin/admin
3. Navigate to **Dashboards** → **Browse**
4. Select **Istio Service Dashboard**
5. Filter by namespace: `intent-platform`

**Recommended Dashboards:**
```
Istio/
├── Istio Mesh Dashboard
├── Istio Service Dashboard
├── Istio Workload Dashboard
└── Istio Performance Dashboard
```

---

### 2. Prometheus - Metrics Database

**URL:** http://localhost:9090

**What to View:**
- Raw metric queries
- Alert rules
- Target health
- Service discovery

**Key Features:**
- **Graph:** Visualize metric queries
- **Alerts:** View active alerts
- **Targets:** Check scrape target health
- **Status:** Service discovery, configuration

**Example Queries:**

```promql
# Request rate for Knowledge Graph MCP
rate(knowledge_graph_rdf_queries_total[5m])

# Query latency p95
histogram_quantile(0.95, rate(knowledge_graph_rdf_queries_duration_ms_bucket[5m]))

# Error rate
rate(knowledge_graph_rdf_errors_total[5m]) / rate(knowledge_graph_rdf_queries_total[5m])

# Istio request rate for intent-platform
rate(istio_requests_total{destination_namespace="intent-platform"}[5m])

# Neo4j query performance
rate(neo4j_cypher_query_execution_total[5m])
```

**Navigation:**
1. Open http://localhost:9090
2. Click **Graph** tab
3. Enter a PromQL query
4. Click **Execute**
5. View table or graph visualization

---

### 3. Kiali - Service Mesh Dashboard

**URL:** http://localhost:20001

**What to View:**
- Service graph visualization
- Traffic flow between services
- Service health status
- Configuration validation
- Distributed tracing

**Key Features:**

**Graph View:**
- Namespace: `intent-platform`
- View: **Versioned app graph**
- Display: Request rate, latency, errors
- Traffic animation

**Applications:**
- Business Intent Agent
- Knowledge Graph MCP
- BSS/OSS MCP
- Customer Data MCP
- Neo4j

**Services:**
- Health indicators (green/yellow/red)
- Request metrics
- Error rates
- Traffic routing

**Quick Start:**
1. Open http://localhost:20001
2. Click **Graph** in left sidebar
3. Select namespace: `intent-platform`
4. Choose display: **Versioned app graph**
5. Enable **Traffic Animation**
6. Click on services to see details

**Useful Views:**
```
Graph → intent-platform → Show: Request Rate, Latency
Applications → knowledge-graph-mcp → Metrics
Workloads → knowledge-graph-mcp → Logs
Services → knowledge-graph-mcp-service → Traffic
```

---

### 4. Neo4j Browser - Graph Database

**URL:** http://localhost:7474

**Credentials:** `neo4j` / `password123`

**What to View:**
- RDF product catalog
- Bundle relationships
- Semantic graph structure
- Query performance

**Example Queries:**

```cypher
// View all RDF products
MATCH (p:sch__Product)
RETURN p.sch__name, p.tmf620__productOfferingType, p.intent__priceAmount
ORDER BY p.intent__aiRecommendationWeight DESC

// View all bundles
MATCH (b:tmf620__BundledProductOffering)
RETURN b.sch__name, b.intent__bundlePrice, b.intent__savings
ORDER BY b.intent__popularityScore DESC

// View bundle-product relationships
MATCH (b:tmf620__BundledProductOffering)-[r:tmf620__includes]->(p:sch__Product)
RETURN b.sch__name AS bundle,
       p.sch__name AS product,
       r.intent__position AS position,
       r.intent__recommended AS recommended

// Find products related to broadband
MATCH (p:sch__Product {sch__identifier: 'PROD-BB-1GB'})
MATCH (p)-[:intent__complementsProduct]->(related:sch__Product)
RETURN p.sch__name AS product,
       related.sch__name AS relatedProduct,
       related.intent__priceAmount AS price

// Check indexes
SHOW INDEXES
YIELD name, type, state
WHERE name STARTS WITH 'rdf_'
   OR name STARTS WITH 'tmf620_'
   OR name STARTS WITH 'intent_'
RETURN name, type, state
ORDER BY name

// View graph structure
MATCH (n:Resource)
RETURN n
LIMIT 25
```

**Quick Start:**
1. Open http://localhost:7474
2. Login with neo4j/password123
3. Paste a query in the editor
4. Click **Run** (or Ctrl+Enter)
5. View results as graph, table, or JSON

**Useful Commands:**
```cypher
:help        // Show help
:clear       // Clear editor
:schema      // View database schema
:play cypher // Interactive Cypher tutorial
```

---

### 5. Knowledge Graph MCP Service - API Endpoints

**Base URL:** http://localhost:8080

**Endpoints:**

#### Health Check
```bash
curl http://localhost:8080/health | jq .
```

**Response:**
```json
{
  "status": "healthy",
  "version": "2.0.0",
  "timestamp": "2026-01-11T10:30:00.000Z"
}
```

#### Readiness Check
```bash
curl http://localhost:8080/ready | jq .
```

**Response:**
```json
{
  "ready": true,
  "indexes": 17
}
```

#### Prometheus Metrics
```bash
curl http://localhost:8080/metrics
```

**Metrics Available:**
- `knowledge_graph_rdf_queries_total`
- `knowledge_graph_rdf_queries_duration_ms`
- `knowledge_graph_rdf_errors_total`
- `knowledge_graph_index_usage_ratio`

#### List MCP Tools
```bash
curl http://localhost:8080/mcp/tools | jq .
```

**Response:**
```json
{
  "version": "2.0.0",
  "tools": [
    {
      "name": "find_related_products",
      "description": "Find products related to a given product using RDF relationships",
      "parameters": { ... }
    },
    {
      "name": "search_product_catalog",
      "description": "Search product catalog with RDF filters",
      "parameters": { ... }
    },
    {
      "name": "get_bundle_recommendations",
      "description": "Get bundle recommendations with optional filters",
      "parameters": { ... }
    }
  ]
}
```

#### Test MCP Tool: Search Product Catalog
```bash
curl -X POST http://localhost:8080/mcp/tools/search_product_catalog \
  -H "Content-Type: application/json" \
  -d '{
    "productType": "broadband",
    "maxPrice": 60,
    "segment": "premium"
  }' | jq .
```

#### Test MCP Tool: Find Related Products
```bash
curl -X POST http://localhost:8080/mcp/tools/find_related_products \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "PROD-BB-500"
  }' | jq .
```

#### Test MCP Tool: Get Bundle Recommendations
```bash
curl -X POST http://localhost:8080/mcp/tools/get_bundle_recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "intent": "gaming",
    "maxPrice": 100
  }' | jq .
```

---

## 🔧 Management

### Check Active Port-Forwards

```bash
ps aux | grep "kubectl port-forward" | grep -v grep
```

### Stop All Port-Forwards

```bash
pkill -f "kubectl port-forward"
```

### Restart Specific Port-Forward

```bash
# Example: Restart Grafana
pkill -f "grafana.*3000"
kubectl port-forward -n istio-system svc/grafana 3000:3000 &
```

### Check Port Availability

```bash
lsof -i :3000   # Grafana
lsof -i :9090   # Prometheus
lsof -i :20001  # Kiali
lsof -i :7474   # Neo4j
lsof -i :8080   # Knowledge Graph MCP
```

---

## 📈 Monitoring Workflows

### Workflow 1: Check Service Health

1. **Kiali** (http://localhost:20001)
   - View service graph
   - Check for red/yellow indicators
   - View error rates

2. **Grafana** (http://localhost:3000)
   - Open **Istio Service Dashboard**
   - Filter by service
   - Check request rate, latency, errors

3. **Prometheus** (http://localhost:9090)
   - Query specific metrics
   - Check alert rules
   - View target health

### Workflow 2: Debug Slow Queries

1. **Knowledge Graph MCP** (http://localhost:8080/metrics)
   - Check `knowledge_graph_rdf_queries_duration_ms`
   - Identify slow tool calls

2. **Neo4j Browser** (http://localhost:7474)
   - Run query with `PROFILE`
   - Check execution plan
   - Verify index usage

3. **Grafana** (http://localhost:3000)
   - View latency percentiles (p50, p95, p99)
   - Compare with SLA targets

### Workflow 3: Investigate Errors

1. **Prometheus** (http://localhost:9090)
   - Query error metrics
   - Check error rate trends

2. **Kiali** (http://localhost:20001)
   - View service graph
   - Identify failing service
   - Check configuration

3. **Knowledge Graph MCP** logs
   ```bash
   kubectl logs -n intent-platform -l app=knowledge-graph-mcp --tail=50
   ```

---

## 🎯 Dashboard Cheat Sheet

| Dashboard | URL | Primary Use | Key Features |
|-----------|-----|-------------|--------------|
| **Grafana** | :3000 | Metrics visualization | Pre-built dashboards, alerts |
| **Prometheus** | :9090 | Metric queries | PromQL, raw metrics |
| **Kiali** | :20001 | Service mesh | Traffic graph, health |
| **Neo4j** | :7474 | Graph database | Cypher queries, RDF data |
| **MCP Service** | :8080 | API testing | Health, tools, metrics |

---

## 📚 Additional Resources

**Grafana Docs:** https://grafana.com/docs/
**Prometheus Docs:** https://prometheus.io/docs/
**Kiali Docs:** https://kiali.io/docs/
**Neo4j Docs:** https://neo4j.com/docs/
**Istio Docs:** https://istio.io/docs/

**Internal Docs:**
- Phase 4 Deployment: `docs/v2.x/N10S_PHASE4_DEPLOYMENT.md`
- MCP Migration Guide: `docs/v2.x/KNOWLEDGE_GRAPH_MCP_MIGRATION.md`
- RDF Query Guide: `docs/v2.x/RDF_QUERY_GUIDE.md`

---

## ⚠️ Troubleshooting

### Port Already in Use

```bash
# Kill process using the port
lsof -ti :3000 | xargs kill -9

# Or change local port
kubectl port-forward -n istio-system svc/grafana 3001:3000 &
```

### Port-Forward Dies

```bash
# Restart with nohup for persistence
nohup kubectl port-forward -n istio-system svc/grafana 3000:3000 &
```

### Cannot Connect to Dashboard

```bash
# Check service exists
kubectl get svc -n istio-system grafana

# Check pod is running
kubectl get pods -n istio-system -l app=grafana

# Test service directly
kubectl exec -n istio-system deploy/grafana -- wget -O- http://localhost:3000
```

---

**Quick Access Summary:**

```
📊 Grafana:    http://localhost:3000  (admin/admin)
📈 Prometheus: http://localhost:9090
🕸️  Kiali:     http://localhost:20001
🗄️  Neo4j:     http://localhost:7474  (neo4j/password123)
🔌 MCP API:    http://localhost:8080
```

**Status:** ✅ All Dashboards Active
