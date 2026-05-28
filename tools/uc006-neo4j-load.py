#!/usr/bin/env python3
"""Load UC006 OTLP sample traces into Neo4j as a span graph.

Graph model (all nodes carry dataset:'uc006' for easy scoping/teardown):
  (:OtelService {name, version})
  (:OtelTrace   {traceId, scenario, runId, rootStatus, spanCount})
  (:OtelSpan    {spanId, traceId, name, kind, kindName, startNs, endNs,
                 durationMs, statusCode, statusName, statusMessage, <attrs...>})
  (:OtelEvent   {name, timeNs, <attrs...>})

  (:OtelSpan)-[:IN_TRACE]->(:OtelTrace)
  (:OtelTrace)-[:EMITTED_BY]->(:OtelService)
  (:OtelTrace)-[:ROOT_SPAN]->(:OtelSpan)
  (child:OtelSpan)-[:CHILD_OF]->(parent:OtelSpan)
  (:OtelSpan)-[:HAS_EVENT]->(:OtelEvent)

Usage:
  NEO4J_PASSWORD=... [NEO4J_USER=neo4j] [NEO4J_URL=http://localhost:7474] \
  python3 uc006_neo4j_load.py <file1.json> [file2.json ...]
"""
import json, os, sys, base64, urllib.request, urllib.error

KIND = {0: "UNSPECIFIED", 1: "INTERNAL", 2: "SERVER", 3: "CLIENT", 4: "PRODUCER", 5: "CONSUMER"}
STATUS = {0: "UNSET", 1: "OK", 2: "ERROR"}


def sanitize(key: str) -> str:
    return "".join(c if c.isalnum() else "_" for c in key)


def attr_value(v: dict):
    if "stringValue" in v:
        return v["stringValue"]
    if "intValue" in v:
        return int(v["intValue"])
    if "doubleValue" in v:
        return float(v["doubleValue"])
    if "boolValue" in v:
        return bool(v["boolValue"])
    return json.dumps(v)


def attrs_to_props(attrs):
    return {sanitize(a["key"]): attr_value(a["value"]) for a in attrs}


def parse_file(path):
    doc = json.load(open(path))
    rs = doc["resourceSpans"][0]
    res = attrs_to_props(rs["resource"]["attributes"])
    spans_in = rs["scopeSpans"][0]["spans"]

    spans, parents, events = [], [], []
    trace_id = scenario = run_id = root_span_id = root_status = None

    for sp in spans_in:
        props = attrs_to_props(sp.get("attributes", []))
        start = int(sp["startTimeUnixNano"]); end = int(sp["endTimeUnixNano"])
        st = sp.get("status", {}) or {}
        code = st.get("code", 0)
        props.update({
            "spanId": sp["spanId"], "traceId": sp["traceId"], "name": sp["name"],
            "kind": sp.get("kind", 0), "kindName": KIND.get(sp.get("kind", 0), "?"),
            "startNs": start, "endNs": end, "durationMs": round((end - start) / 1e6, 3),
            "statusCode": code, "statusName": STATUS.get(code, "?"),
            "statusMessage": st.get("message", ""),
        })
        # spanId is unique only WITHIN a trace; key globally on traceId:spanId.
        props["uid"] = f'{sp["traceId"]}:{sp["spanId"]}'
        spans.append(props)
        trace_id = sp["traceId"]
        if "parentSpanId" in sp and sp["parentSpanId"]:
            parents.append({"child": f'{sp["traceId"]}:{sp["spanId"]}',
                            "parent": f'{sp["traceId"]}:{sp["parentSpanId"]}'})
        else:
            root_span_id = f'{sp["traceId"]}:{sp["spanId"]}'
            root_status = STATUS.get(code, "?")
        if props.get("scenario"):
            scenario = props["scenario"]
        if props.get("run_id"):
            run_id = props["run_id"]
        for ev in sp.get("events", []):
            ep = attrs_to_props(ev.get("attributes", []))
            ep.update({"uid": f'{sp["traceId"]}:{sp["spanId"]}', "spanId": sp["spanId"],
                       "name": ev["name"], "timeNs": int(ev["timeUnixNano"])})
            events.append(ep)

    trace = {"traceId": trace_id, "scenario": scenario, "runId": run_id,
             "rootStatus": root_status, "spanCount": len(spans)}
    return {"service": {"name": res.get("service_name"), "version": res.get("service_version")},
            "trace": trace, "rootSpanId": root_span_id,
            "spans": spans, "parents": parents, "events": events}


def post(url, user, pw, statements):
    body = json.dumps({"statements": statements}).encode()
    req = urllib.request.Request(url, data=body, method="POST")
    req.add_header("Content-Type", "application/json")
    req.add_header("Authorization", "Basic " + base64.b64encode(f"{user}:{pw}".encode()).decode())
    try:
        resp = json.load(urllib.request.urlopen(req))
    except urllib.error.HTTPError as e:
        print(f"HTTP {e.code}: {e.read().decode()}"); sys.exit(1)
    if resp.get("errors"):
        print("Neo4j errors:", json.dumps(resp["errors"], indent=2)); sys.exit(1)
    return resp


def main():
    files = sys.argv[1:]
    pw = os.environ.get("NEO4J_PASSWORD")
    user = os.environ.get("NEO4J_USER", "neo4j")
    base = os.environ.get("NEO4J_URL", "http://localhost:7474").rstrip("/")
    url = f"{base}/db/neo4j/tx/commit"
    if not pw:
        print("Set NEO4J_PASSWORD"); sys.exit(2)

    # Constraints (idempotent). Span key is traceId:spanId, not spanId alone.
    post(url, user, pw, [
        {"statement": "DROP CONSTRAINT otel_span_id IF EXISTS"},
        {"statement": "CREATE CONSTRAINT otel_span_uid IF NOT EXISTS FOR (s:OtelSpan) REQUIRE s.uid IS UNIQUE"},
        {"statement": "CREATE CONSTRAINT otel_trace_id IF NOT EXISTS FOR (t:OtelTrace) REQUIRE t.traceId IS UNIQUE"},
    ])

    totals = {"traces": 0, "spans": 0, "events": 0}
    for path in files:
        d = parse_file(path)
        stmts = [
            {"statement": "MERGE (s:OtelService {name:$svc.name}) SET s.version=$svc.version, s.dataset='uc006'",
             "parameters": {"svc": d["service"]}},
            {"statement": "MERGE (t:OtelTrace {traceId:$t.traceId}) SET t+=$t, t.dataset='uc006' "
                          "WITH t MATCH (s:OtelService {name:$svc}) MERGE (t)-[:EMITTED_BY]->(s)",
             "parameters": {"t": d["trace"], "svc": d["service"]["name"]}},
            {"statement": "UNWIND $spans AS sp MERGE (n:OtelSpan {uid:sp.uid}) SET n+=sp, n.dataset='uc006' "
                          "WITH n,sp MATCH (t:OtelTrace {traceId:sp.traceId}) MERGE (n)-[:IN_TRACE]->(t)",
             "parameters": {"spans": d["spans"]}},
            {"statement": "UNWIND $p AS r MATCH (c:OtelSpan {uid:r.child}),(p:OtelSpan {uid:r.parent}) MERGE (c)-[:CHILD_OF]->(p)",
             "parameters": {"p": d["parents"]}},
            {"statement": "MATCH (t:OtelTrace {traceId:$tid}),(r:OtelSpan {uid:$rid}) MERGE (t)-[:ROOT_SPAN]->(r)",
             "parameters": {"tid": d["trace"]["traceId"], "rid": d["rootSpanId"]}},
            {"statement": "UNWIND $ev AS e MATCH (n:OtelSpan {uid:e.uid}) "
                          "MERGE (x:OtelEvent {uid:e.uid, name:e.name, timeNs:e.timeNs}) SET x+=e, x.dataset='uc006' "
                          "MERGE (n)-[:HAS_EVENT]->(x)",
             "parameters": {"ev": d["events"]}},
        ]
        post(url, user, pw, stmts)
        totals["traces"] += 1; totals["spans"] += len(d["spans"]); totals["events"] += len(d["events"])
        print(f"loaded {d['trace']['scenario']:<26} traceId={d['trace']['traceId'][:12]}… "
              f"spans={len(d['spans'])} events={len(d['events'])} root={d['trace']['rootStatus']}")

    print(f"\nDONE: {totals['traces']} traces, {totals['spans']} spans, {totals['events']} events")


if __name__ == "__main__":
    main()
