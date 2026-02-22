# Business Intent Agent - Kubernetes Deployment Summary

## Open Core Architecture

This repository contains the public ibn-core framework.

| Component | Location | Reason |
|-----------|----------|--------|
| McpAdapter interface | src/mcp/McpAdapter.ts (this repo) | Public contract |
| MockMcpAdapter | src/mcp/McpAdapter.ts (this repo) | Local dev |
| Generic mock MCP server | mcp-services-k8s/mock-mcp.yaml (this repo) | Local dev |
| Operator BSS/OSS adapters | ibn-operator-adapters (private repo) | Operator-specific |
| CAMARA adapters | ibn-operator-adapters (private repo) | Operator credentials |

The O2C (Order-to-Cash) use case runs against the generic mock
in this repo. Production O2C against real operator BSS/OSS
systems uses adapters from the private repository.

---

**Deployment Date:** December 26, 2025
**Environment:** Local Kubernetes (kind cluster: local-k8s)
**Namespace:** intent-platform

## 🎯 Overview

Successfully deployed a complete AI-powered business intent processing system using Claude AI and microservices architecture on Kubernetes.

## 📊 Deployed Services

### 1. Business Intent Agent
- **Deployment:** `business-intent-agent` (2 replicas)
- **Image:** `vpnet/business-intent-agent:1.0.0`
- **Port:** 8080
- **Service:** `business-intent-agent-service`
- **Features:**
  - REST API for intent processing
  - Claude AI integration (Sonnet 4.5)
  - MCP client connections
  - Prometheus metrics
  - Health checks
- **Resources:** 250m CPU / 512Mi RAM (requests), 1 CPU / 2Gi RAM (limits)
- **Autoscaling:** HPA configured (2-5 replicas, 70% CPU / 80% memory)

### 2. Customer Data MCP Service
- **Deployment:** `customer-data-mcp` (1 replica)
- **Image:** `vpnet/customer-data-mcp-service:1.0.0`
- **Port:** 8080
- **Service:** `customer-data-mcp-service`
- **Provides:** Customer profile retrieval via `get_customer_profile` tool
- **Resources:** 100m CPU / 128Mi RAM (requests), 500m CPU / 512Mi RAM (limits)

### 3. BSS/OSS MCP Service
- **Deployment:** `bss-oss-mcp` (1 replica)
- **Image:** `vpnet/bss-oss-mcp-service:1.0.0`
- **Port:** 8080
- **Service:** `bss-oss-mcp-service`
- **Provides:**
  - `search_product_catalog` - Product search
  - `generate_quote` - Quote generation
- **Resources:** 100m CPU / 128Mi RAM (requests), 500m CPU / 512Mi RAM (limits)

### 4. Knowledge Graph MCP Service
- **Deployment:** `knowledge-graph-mcp` (1 replica)
- **Image:** `vpnet/knowledge-graph-mcp-service:1.0.0`
- **Port:** 8080
- **Service:** `knowledge-graph-mcp-service`
- **Provides:** `find_related_products` - Bundle recommendations
- **Resources:** 100m CPU / 128Mi RAM (requests), 500m CPU / 512Mi RAM (limits)

### 5. Neo4j Graph Database
- **Deployment:** `neo4j` (1 replica)
- **Image:** `neo4j:5-community`
- **Ports:** 7474 (HTTP), 7687 (Bolt)
- **Service:** `neo4j-service`
- **Storage:** 2Gi PVC (`neo4j-data`)
- **Features:**
  - APOC plugin enabled
  - Web browser interface
  - Cypher query support
- **Resources:** 500m CPU / 1Gi RAM (requests), 2 CPU / 2Gi RAM (limits)
- **Credentials:** neo4j / password123

## 🔗 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Intent Platform                          │
│                   (Namespace: intent-platform)               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Business Intent Agent (2 replicas)                  │   │
│  │  - REST API (POST /api/v1/intent)                    │   │
│  │  - Claude AI Integration                             │   │
│  │  - MCP Client Orchestration                          │   │
│  └────────┬──────────────┬──────────────┬────────────────┘   │
│           │              │              │                     │
│           ▼              ▼              ▼                     │
│  ┌────────────┐  ┌──────────┐  ┌──────────────────┐        │
│  │ Customer   │  │ BSS/OSS  │  │ Knowledge Graph  │        │
│  │ Data MCP   │  │ MCP      │  │ MCP              │        │
│  │ Service    │  │ Service  │  │ Service          │        │
│  └────────────┘  └──────────┘  └──────────────────┘        │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Neo4j Graph Database                                │   │
│  │  - 19 Nodes (Products, Bundles, Intents, Segments)  │   │
│  │  - Relationships (INCLUDES, MATCHES_INTENT, etc.)    │   │
│  │  - Web Browser Interface (port 7474)                 │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Repository Structure

```
k8s/
├── business-intent-agent/          # Main business intent agent
│   └── k8s/                        # Kubernetes manifests
│       ├── 00-namespace.yaml       # Namespace definition
│       ├── 01-secrets.yaml         # API keys and credentials
│       ├── 02-configmap.yaml       # Application configuration
│       ├── 03-rbac.yaml            # RBAC resources
│       ├── 04-deployment.yaml      # Deployment spec
│       ├── 05-service.yaml         # Service definition
│       └── 06-hpa.yaml             # Horizontal Pod Autoscaler
├── mcp-services-k8s/               # MCP services manifests
│   ├── customer-data-mcp.yaml      # Customer data service
│   ├── bss-oss-mcp.yaml            # BSS/OSS service
│   ├── knowledge-graph-mcp.yaml    # Knowledge graph service
│   └── neo4j.yaml                  # Neo4j database
├── src/                            # Source code
│   ├── index.ts                    # Main application
│   ├── claude-client.ts            # Claude AI client
│   ├── mcp-client.ts               # MCP protocol client
│   ├── intent-processor.ts         # Business logic
│   ├── logger.ts                   # Logging setup
│   ├── metrics.ts                  # Prometheus metrics
│   ├── package.json                # Node.js dependencies
│   ├── tsconfig.json               # TypeScript config
│   ├── Dockerfile.build            # Docker build file
│   ├── populate-neo4j.cypher       # Neo4j data initialization
│   └── mcp-services/               # MCP service implementations
│       ├── customer-data/          # Customer data MCP
│       ├── bss-oss/                # BSS/OSS MCP
│       └── knowledge-graph/        # Knowledge graph MCP
└── DEPLOYMENT_SUMMARY.md           # This file
```

## 🚀 Deployment Process

### Prerequisites Met
- ✅ Kind cluster running (`local-k8s`)
- ✅ Docker Desktop installed
- ✅ kubectl configured
- ✅ Anthropic API key with credits

### Deployment Steps Executed

1. **Namespace Creation**
   - Created `intent-platform` namespace

2. **Secrets Configuration**
   - Anthropic API key: Configured
   - MCP service URLs: Configured

3. **Docker Images Built**
   - business-intent-agent:1.0.0
   - customer-data-mcp-service:1.0.0
   - bss-oss-mcp-service:1.0.0
   - knowledge-graph-mcp-service:1.0.0

4. **Images Loaded to Kind**
   - All images loaded into local-k8s cluster

5. **Kubernetes Resources Deployed**
   - ConfigMaps, Secrets, RBAC
   - Deployments, Services
   - HorizontalPodAutoscaler
   - PersistentVolumeClaim (Neo4j)

6. **Neo4j Database Initialized**
   - Populated with 19 nodes
   - Created relationship graph
   - Configured APOC plugin

## ✅ Testing & Validation

### End-to-End Flow Verified

**Request:**
```bash
curl -X POST http://localhost:8080/api/v1/intent \
  -H 'Content-Type: application/json' \
  -d '{"customerId": "CUST-12345", "intent": "I need internet for work from home"}'
```

**Response (Summary):**
- ✅ Customer profile retrieved from customer-data-mcp
- ✅ Intent analyzed by Claude AI
- ✅ Products searched via bss-oss-mcp
- ✅ Bundles recommended via knowledge-graph-mcp
- ✅ Personalized offer generated by Claude AI
- ✅ Quote created via bss-oss-mcp
- ⏱️ Processing time: ~14 seconds

**Result:** Complete intent processing workflow operational

### Health Checks
```bash
# Business Intent Agent
curl http://localhost:8080/health
# Response: {"status":"healthy","service":"business-intent-agent","version":"1.0.0"}

# All MCP services healthy and responding
```

## 🔌 Access Points

### Port Forwards Active

| Service | Local Port | Remote Port | URL |
|---------|------------|-------------|-----|
| Business Intent Agent | 8080 | 8080 | http://localhost:8080 |
| Neo4j Browser | 7474 | 7474 | http://localhost:7474 |
| Neo4j Bolt | 7687 | 7687 | bolt://localhost:7687 |

### API Endpoints

**Business Intent Agent:**
- `GET /health` - Health check
- `GET /ready` - Readiness check
- `POST /api/v1/intent` - Process customer intent

## 📈 Monitoring & Observability

### Metrics Available
- Prometheus annotations configured
- HTTP request duration
- Intent processing duration
- Claude API calls counter
- MCP calls counter

### Logs
```bash
# View business intent agent logs
kubectl logs -n intent-platform -l app=business-intent-agent -f

# View specific MCP service logs
kubectl logs -n intent-platform deployment/customer-data-mcp -f
kubectl logs -n intent-platform deployment/bss-oss-mcp -f
kubectl logs -n intent-platform deployment/knowledge-graph-mcp -f

# View Neo4j logs
kubectl logs -n intent-platform deployment/neo4j -f
```

## 🗄️ Neo4j Knowledge Graph

### Data Model

**19 Nodes:**
- 6 Products (Broadband, Mobile, TV variants)
- 4 Bundles (Work-from-Home, Family, Gaming, Streaming)
- 6 Intent Tags (work_from_home, gaming, streaming, family, reliability, speed)
- 3 Customer Segments (premium, standard, basic)

**Relationships:**
- `INCLUDES` - Bundle contains product
- `MATCHES_INTENT` - Bundle matches intent
- `TARGETS_SEGMENT` - Bundle targets segment
- `COMPLEMENTS` - Product complements product
- `UPGRADES_TO` - Product upgrades to product

### Sample Queries

```cypher
// View all bundles and their products
MATCH (b:Bundle)-[r:INCLUDES]->(p:Product)
RETURN b, r, p

// Find bundles for work-from-home intent
MATCH (b:Bundle)-[r:MATCHES_INTENT]->(i:Intent {name: 'work_from_home'})
RETURN b, r, i

// Show product upgrade paths
MATCH (p1:Product)-[r:UPGRADES_TO]->(p2:Product)
RETURN p1, r, p2
```

## 🔧 Configuration

### Environment Variables (Business Intent Agent)

- `NODE_ENV`: development
- `PORT`: 8080
- `LOG_LEVEL`: info
- `CLAUDE_MODEL`: claude-sonnet-4-20250514
- `CLAUDE_MAX_TOKENS`: 2048
- `CLAUDE_TEMPERATURE`: 0.7
- `ANTHROPIC_API_KEY`: Configured via secret
- `MCP_BSS_URL`: http://bss-oss-mcp-service:8080
- `MCP_KNOWLEDGE_GRAPH_URL`: http://knowledge-graph-mcp-service:8080
- `MCP_CUSTOMER_DATA_URL`: http://customer-data-mcp-service:8080
- `MCP_TIMEOUT_MS`: 10000

## 🛠️ Troubleshooting

### Common Commands

```bash
# Check all pods
kubectl get pods -n intent-platform

# Check all services
kubectl get svc -n intent-platform

# Check deployments
kubectl get deployments -n intent-platform

# View all resources
kubectl get all -n intent-platform

# Describe pod for issues
kubectl describe pod <pod-name> -n intent-platform

# View events
kubectl get events -n intent-platform --sort-by='.lastTimestamp'
```

### Known Issues & Resolutions

1. **ImagePullBackOff**
   - Solution: Images loaded to kind cluster using `kind load docker-image`

2. **Permission denied in containers**
   - Solution: Added `--chown=node:node` to COPY commands in Dockerfiles

3. **Claude JSON parsing errors**
   - Solution: Added `parseJsonResponse()` method to handle markdown code blocks

4. **Neo4j config validation errors**
   - Solution: Disabled strict validation with `NEO4J_server_config_strict__validation_enabled=false`

## 📊 Resource Utilization

| Service | CPU Request | Memory Request | CPU Limit | Memory Limit | Replicas |
|---------|-------------|----------------|-----------|--------------|----------|
| business-intent-agent | 250m | 512Mi | 1000m | 2Gi | 2 |
| customer-data-mcp | 100m | 128Mi | 500m | 512Mi | 1 |
| bss-oss-mcp | 100m | 128Mi | 500m | 512Mi | 1 |
| knowledge-graph-mcp | 100m | 128Mi | 500m | 512Mi | 1 |
| neo4j | 500m | 1Gi | 2000m | 2Gi | 1 |
| **Total** | **1150m** | **2Gi** | **5000m** | **7.5Gi** | **6** |

## 🎯 Next Steps

### Recommended Enhancements

1. **Monitoring & Observability**
   - Deploy Prometheus & Grafana
   - Create custom dashboards
   - Set up alerts

2. **Persistence**
   - Add persistent storage for logs
   - Implement caching layer (Redis)

3. **Security**
   - Implement proper secret management (Sealed Secrets, Vault)
   - Add network policies
   - Enable mTLS between services
   - Scan container images for vulnerabilities

4. **CI/CD**
   - Automate builds
   - Add automated testing
   - Implement GitOps (ArgoCD/Flux)

5. **Neo4j Integration**
   - Connect knowledge-graph-mcp to real Neo4j
   - Implement dynamic bundle recommendations
   - Add graph-based ML algorithms

6. **Production Readiness**
   - Add proper logging aggregation
   - Implement distributed tracing
   - Set up backup/restore procedures
   - Configure ingress controller
   - Add rate limiting
   - Implement circuit breakers

## 📝 Notes

- All services are mock implementations for demonstration
- Claude AI integration is fully functional with real API calls
- Neo4j contains sample data for telecom products/bundles
- System is designed for local development/testing
- Production deployment would require additional security and scalability considerations

## 🏆 Success Metrics

- ✅ All 5 services deployed and running
- ✅ End-to-end intent processing flow working
- ✅ Claude AI integration successful
- ✅ All MCP services responding
- ✅ Neo4j graph database populated and queryable
- ✅ Health checks passing
- ✅ Average request processing time: ~14 seconds

---

**Deployment Status:** ✅ SUCCESSFUL
**System Status:** 🟢 OPERATIONAL
**Last Updated:** December 26, 2025
