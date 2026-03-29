# ibn-core AI Evaluation Dataset — O2C Canonical Test Case

**Component:** ibn-core v2.2.0
**Standard:** TM Forum AI-Native Canvas — Evaluation Dataset
**Reference:** [AI-Native Canvas design](https://github.com/tmforum-oda/oda-canvas/blob/main/AI-Native-Canvas-design.md)
**Declared in:** `helm/ibn-core/templates/component.yaml` annotation `oda.tmforum.org/evaluationDataset`

---

## Purpose

The AI-Native Canvas design requires that agent components package evaluation datasets to support
non-deterministic AI system testing — covering pre-deployment baselines and in-production monitoring.

ibn-core's primary evaluation dataset is the Order-to-Cash (O2C) use case described in Paper 1.

---

## Evaluation Entry 001 — O2C Canonical Intent

| Field | Value |
|-------|-------|
| ID | EVAL-001 |
| Name | O2C Broadband Home Working Intent |
| RFC 9315 phase | All (§5.1.1 → §5.2.3 end-to-end) |
| Category | functional / regression |
| Risk level | low |

### Input

```bash
curl -X POST http://<host>/api/v1/intent \
  -H 'Content-Type: application/json' \
  -d '{
    "customerId": "CUST-12345",
    "intent": "I need internet for working from home"
  }'
```

### Expected Output (exact field match)

```json
{
  "lifecycleStatus": "completed",
  "reportState": "fulfilled"
}
```

### Pass Criteria

| Field | Expected | Match type |
|-------|----------|------------|
| `lifecycleStatus` | `"completed"` | exact |
| `reportState` | `"fulfilled"` | exact |
| HTTP status | `200` | exact |
| Response time | `< 30s` | bound |

### Failure Policy

Per CLAUDE.md: *"If this test fails after any change, do not commit."*

---

## Running the Evaluation

### Against a running cluster

```bash
# Port-forward to the service
kubectl port-forward -n <namespace> svc/<release-name>-service 8080:8080

# Run the evaluation
curl -sX POST http://localhost:8080/api/v1/intent \
  -H 'Content-Type: application/json' \
  -d '{"customerId":"CUST-12345","intent":"I need internet for working from home"}' \
  | jq '{lifecycleStatus, reportState}'
```

### Expected result

```json
{
  "lifecycleStatus": "completed",
  "reportState": "fulfilled"
}
```

---

## TMF921 Conformance Evidence

Supplementary conformance evidence covering all 83 CTK test cases:
→ [`docs/compliance/TMF921_CTK_RESULTS_V2_0_0.md`](TMF921_CTK_RESULTS_V2_0_0.md)

---

## Extending the Dataset

To add evaluation entries, append to this document following the schema above.
Suggested next entries:

| ID | Description | Priority |
|----|-------------|----------|
| EVAL-002 | Business broadband intent (high bandwidth SLA) | high |
| EVAL-003 | Bundle upgrade intent | medium |
| EVAL-004 | Non-fulfillable intent (infeasible requirements) | medium |
| EVAL-005 | Probe intent feasibility check (`/api/v1/intent/probe`) | medium |

---

*Last updated: 2026-03-29 — Vpnet Cloud Solutions Sdn. Bhd.*
