# Project 006 — location-assurance-twin

**Name:** location-assurance-twin
**Project ID:** 006
**Created:** 2026-06-17
**Status:** ArcKit intake (governance from external HLD v0.1)

Location-anchored, closed-loop assurance system: a SID/GB922 v24.0 place graph
(Neo4j LPG) + YANG-derived RDF/SHACL intent store (Apache Jena Fuseki), fed by
semantic YANG-Push telemetry over a broker, driving a MAPE-K closed loop with a
blast-radius governance gate. RFC 9315 intent lineage to ibn-core; assurance
consumer sibling to the resource-intent-agent (Project 004).

## Source

ArcKit governance generated from the external High-Level Design:
`external/location_assurance_twin_HLD.md` (v0.1), with supporting source
artifacts in `external/`.

## Baselines (from the HLD)

- TM Forum SID Information Framework — GB922 v24.0
- IETF RFC 9315 (IBN), RFC 8639/8640/8641 (YANG-Push), RFC 7950/6241 (YANG/NETCONF)
- NMOP drafts: message-key, SIMAP, collected-data-manifest
- W3C RDF/OWL + SHACL
- ibn-core (Apache-2.0)

Apache-2.0 / open and reproducible (HLD principle P5).
