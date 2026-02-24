#!/bin/bash
# Dashboard Port-Forwarding Setup Script
# Sets up local access to all monitoring and observability dashboards

set -e

echo "======================================"
echo "Setting Up Local Dashboard Access"
echo "======================================"
echo ""

# Kill any existing port-forwards to avoid conflicts
echo "Cleaning up existing port-forwards..."
pkill -f "kubectl port-forward" 2>/dev/null || true
sleep 2

# Array to store background process IDs
declare -a PIDS=()

# Function to create port-forward with retry
create_port_forward() {
    local namespace=$1
    local service=$2
    local local_port=$3
    local remote_port=$4
    local name=$5

    echo "Starting port-forward: $name ($service:$remote_port -> localhost:$local_port)"
    kubectl port-forward -n $namespace svc/$service $local_port:$remote_port &
    PIDS+=($!)
    sleep 1
}

echo ""
echo "Creating port-forwards..."
echo "--------------------------------------"

# 1. Grafana - Metrics & Dashboards
create_port_forward "istio-system" "grafana" "3000" "3000" "Grafana"

# 2. Prometheus - Metrics Database
create_port_forward "istio-system" "prometheus" "9090" "9090" "Prometheus"

# 3. Kiali - Service Mesh Dashboard
create_port_forward "istio-system" "kiali" "20001" "20001" "Kiali"

# 4. Jaeger - Distributed Tracing
create_port_forward "istio-system" "jaeger-collector" "16686" "16686" "Jaeger UI" 2>/dev/null || \
    echo "⚠ Jaeger UI port-forward failed (service may not expose port 16686)"

# 5. Neo4j Browser - Graph Database
create_port_forward "intent-platform" "neo4j-service" "7474" "7474" "Neo4j Browser"

# 6. Knowledge Graph MCP Service
create_port_forward "intent-platform" "knowledge-graph-mcp-service" "8080" "8080" "Knowledge Graph MCP"

echo ""
echo "======================================"
echo "Dashboard Access URLs"
echo "======================================"
echo ""
echo "📊 Grafana (Metrics & Dashboards)"
echo "   URL: http://localhost:3000"
echo "   Default credentials: admin/admin"
echo ""
echo "📈 Prometheus (Metrics Database)"
echo "   URL: http://localhost:9090"
echo "   Query UI: http://localhost:9090/graph"
echo ""
echo "🕸️  Kiali (Service Mesh Dashboard)"
echo "   URL: http://localhost:20001"
echo "   View: Service graph, traffic flow, config validation"
echo ""
echo "🔍 Jaeger (Distributed Tracing)"
echo "   URL: http://localhost:16686"
echo "   View: Request traces, latency analysis"
echo ""
echo "🗄️  Neo4j Browser (Graph Database)"
echo "   URL: http://localhost:7474"
echo "   Credentials: neo4j/password123"
echo "   Try: MATCH (n:Resource) RETURN n LIMIT 25"
echo ""
echo "🔌 Knowledge Graph MCP Service"
echo "   Health: http://localhost:8080/health"
echo "   Ready: http://localhost:8080/ready"
echo "   Metrics: http://localhost:8080/metrics"
echo "   Tools: http://localhost:8080/mcp/tools"
echo ""
echo "======================================"
echo "Port-Forward Management"
echo "======================================"
echo ""
echo "Process IDs: ${PIDS[@]}"
echo ""
echo "To stop all port-forwards:"
echo "  pkill -f 'kubectl port-forward'"
echo ""
echo "To view this list again:"
echo "  cat $0"
echo ""
echo "Press Ctrl+C to stop all port-forwards"
echo "======================================"

# Wait for Ctrl+C
trap "echo ''; echo 'Stopping all port-forwards...'; kill ${PIDS[@]} 2>/dev/null; exit 0" INT TERM

# Keep script running
wait
