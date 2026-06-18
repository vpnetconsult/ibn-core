# HLD — Location-Anchored Closed-Loop Assurance

**Working name:** location-assurance-twin (sits alongside ibn-core / togaf-trace-kit)
**Status:** High-Level Design, for build (Claude Code) and architecture review (arcKit)
**Document version:** 0.1

### Baselines (authoritative, version-stamped)
| Anchor | Version / ref | Role |
|---|---|---|
| TM Forum SID Information Framework | GB922 **v24.0** | Location/Place foundation + cross-domain joints |
| Intent-Based Networking | IETF RFC 9315 | intent concepts; ties to ibn-core |
| YANG-Push | RFC 8639, RFC 8641 (+ RFC 8640) | semantic telemetry subscriptions |
| YANG / NETCONF | RFC 7950 / RFC 6241 | device config + state model |
| YANG-in-broker addressing | `draft-netana-nmop-yang-message-broker-message-key-00` (IETF NMOP) | feed-layer topic/key scheme |
| Service & infra map | `draft-ietf-nmop-simap-concept` (NMOP) | service↔infrastructure mapping cousin |
| Contextualised telemetry | `draft-ietf-opsawg-collected-data-manifest` | telemetry semantics |
| RDF/OWL + SHACL | W3C | model store + intent validation |
| ibn-core | Apache-2.0, v2.0.x | intent implementation lineage |
| Motivating incident | Optus 000, 18 Sep 2025 (public inquiry) | failure-mode evidence |

---

## 1. Purpose and scope

### 1.1 Purpose
A location-anchored, closed-loop assurance system. It consumes semantically-typed network
telemetry, maintains a live operational graph of *what is where*, validates the network against
declared intent, and computes the *reach* of any fault or proposed change before action is taken —
so remediation is correlated and governed, not blind.

### 1.2 The problem it addresses (one paragraph)
Maintenance-induced outages recur because a management-plane change can have an unmodelled
forwarding-plane consequence that is invisible at service level, and because second-line support
cannot associate a customer symptom with the network event that caused it. The system closes both
gaps: service-level causal observability (the feed) and symptom-to-cause correlation (the operational
graph), with a pre-change reach check (the governance gate).

### 1.3 In scope
Feed ingestion; operational correlation graph; intent/model store + validation; the bridge between
them; the closed-loop controller and governance gate; a docker-compose proof rig.

### 1.4 Out of scope (this iteration)
Production HA/scale-out; multi-operator federation (ibn-core v4.0.0 roadmap); automated execution
into live carrier control/management planes; procedural/change-management controls (explicitly a
human/organisational concern — see §12).

---

## 2. Architecture principles (review hooks)
| # | Principle | Consequence |
|---|---|---|
| P1 | Single source of truth — no fact mastered twice | instances in one store, schema/intent in the other |
| P2 | Authoritative-source discipline | every model element tagged to a versioned standard |
| P3 | Plane separation | actions routed to the correct plane; cross-plane impact made explicit |
| P4 | Privacy by default | no durable per-subscriber location; transient, TTL, resolved on demand |
| P5 | Open and reproducible | Apache-2.0; docker-compose rig; no closed dependencies |
| P6 | Semantics preserved end-to-end | telemetry carries its YANG semantics from device to graph |

---

## 3. Logical architecture (building blocks)

```
                 ┌──────────────────────────────────────────────────────┐
   network  ───▶ │ L0  SEMANTIC FEED                                     │
   elements      │     YANG-Push → message broker, typed + addressable   │
   (YANG-Push)   │     (Kafka/Redpanda · message-key scheme · NMOP)      │
                 └───────────────┬──────────────────────────────────────┘
                                 │ typed YANG records (xpath / element scoped)
              ┌──────────────────┴───────────────────┐
              ▼                                       ▼
   ┌───────────────────────┐               ┌──────────────────────────┐
   │ L1  OPERATIONAL GRAPH  │◀── bridge ───▶│ L2  MODEL / INTENT STORE  │
   │ property-graph (LPG)   │   shared      │ YANG-based RDF + SHACL    │
   │ Neo4j · SID Location   │   place names │ Fuseki · ontology + rules │
   │ instances + joints     │   (n10s)      │ intent / design invariants│
   └───────────┬───────────┘               └─────────────┬────────────┘
               │ impacted subgraph                        │ verdict
               └──────────────────┬───────────────────────┘
                                  ▼
                    ┌──────────────────────────────┐
                    │ L3  CLOSED-LOOP CONTROLLER    │
                    │ detect→correlate→validate→    │
                    │ blast-radius→(gate)→act→verify│
                    └──────────────┬────────────────┘
                                   ▼
                    ┌──────────────────────────────┐
                    │ L4  GOVERNANCE / SECURITY     │
                    │ plane-aware routing · autonomy │
                    │ level · audit · privacy bound  │
                    └──────────────────────────────┘
```

### 3.1 Architecture vs Solution Building Blocks (TOGAF)
| ABB (abstract) | SBB (concrete, this rig) | Authoritative anchor |
|---|---|---|
| Semantic Telemetry Feed | Kafka/Redpanda + YANG-Push (Netopeer2/Sysrepo publisher in rig); message-key topic scheme | RFC 8639/8641; NMOP message-key draft |
| Operational Knowledge Graph | Neo4j 5 (LPG) + APOC | SID Location ABE v24.0 |
| Model / Intent Graph | Apache Jena Fuseki + SHACL | GB922 v24.0 (RDF lift); YANG→RDF; W3C SHACL |
| Semantic Bridge | Neosemantics (n10s) | shared SID namespace |
| Closed-Loop Controller | `closed_loop` service (Node ≥22 or Python 3.11) | RFC 9315; MAPE-K |
| Governance Gate | Cypher reach query (Q-BLAST) + autonomy policy | TM Forum AN autonomy levels |

### 3.2 Component responsibilities
- **L0 Semantic Feed** — subscribe to device YANG-Push streams; preserve YANG semantics into broker
  records; make them addressable by subscription/xpath/element via the message-key scheme so a
  consumer pulls only the slice it needs. *This is Graf's layer — upstream precondition, not part of
  the correlation logic.*
- **L1 Operational Graph** — the live map. SID Location ABE instances (Place tree, civic + geodetic),
  the six v24 cross-domain joints, topology. Optimised for traversal: fault→place→services→customers→
  blast radius.
- **L2 Model/Intent Store** — the rulebook. SID Location ontology (RDF/OWL) + YANG-derived config
  model; SHACL shapes expressing design invariants (geo-diversity, critical-service reachability,
  provisioning correctness).
- **L3 Bridge** — n10s. Fuseki→Neo4j: import ontology so labels are GB922 class names. Neo4j→Fuseki:
  serialise impacted subgraph for SHACL validation. Uni-directional; no shared mastership.
- **L4 Closed-Loop Controller** — MAPE-K loop; orchestrates the queries and validation; emits the
  autonomy recommendation; never authors free-form config.
- **L5 Governance/Security** — plane-aware action routing; autonomy-level gating from blast radius;
  immutable audit with correlation id; enforces the privacy boundary.

---

## 4. Data architecture

### 4.1 Mastership split (P1)
| Concern | Master | Form |
|---|---|---|
| Location schema/ontology + the six joints | L2 (Fuseki) | RDF/OWL |
| Intent / design invariants | L2 (Fuseki) | SHACL |
| Operational instances (sites, resources, services, topology, live joints) | L1 (Neo4j) | LPG |
| Telemetry records (typed, in-flight) | L0 (broker) | YANG-in-broker |

### 4.2 Location foundation (SID Location ABE, GB922 v24.0 — Shared domain)
Place tree: `Place` → `GeographicPlace` (→ GeographicAddress, GeographicLocation, GeographicSite,
GeographicArea, Country/AdministrativeArea/GeographicState, Street, …), `LocalPlace` (indoor/3D),
`OpenGisSFS` (geometry). Civic hierarchy is native — do not invent it.

### 4.3 The six v24 cross-domain joints (corrected names)
| Joint | Connects | Note |
|---|---|---|
| `ServicePlaceDetails` | Service → Place | |
| `PlacePhysicalResourceAssoc` | PhysicalResource ↔ Place | (was DTDL `PlaceLocatesResource`) |
| `BusinessInteractionLocation` | BusinessInteraction → Place | trouble-ticket / order binding |
| `ProductPlaceRole` | Product → Place | |
| `ProductOrderItemPlaceRole` | ProductOrderItem → Place | |
| `StockLocation` | StockItem → Place | dispatch / truck-roll |
| *(Party → Place)* | indirect via `AddressContactMediumRole` | **no direct v24 association exists** |

### 4.4 Transient boundary (P4)
Durable: static service-location (which site anchors a service, which place hosts a resource).
Never durable: live per-subscriber serving location — resolved on demand, projected with TTL by a
short-lived job, never master data.

---

## 5. Closed-loop behaviour and the anchor use case

### 5.1 Use case — governed self-healing
Detect a fault → correlate to impacted services/customers via the place foundation → validate against
intent (is the network still on-design?) → compute blast radius → gate the autonomy level → act within
bounds → verify. Same loop runs auto for a tight single-site fault, supervised for a wide or
critical-service one.

### 5.2 Query set (L1, deterministic)
- `Q-CORRELATE` — fault → place → impacted services / customers / open interactions.
- `Q-SRLG` — geo-diversity: a backup sharing a route section is not redundant (shared-risk).
- `Q-BLAST` — blast radius → recommended autonomy level.
- `Q-PROACTIVE` — external area event → exposed sites/services before alarm.
- `Q-DISPATCH` — nearest stock + address + indoor location for truck-roll.

### 5.3 Intent shapes (L2, SHACL)
- geo-diversity (primary/backup share zero route sections);
- critical-service reachability (e.g. emergency-call path survives any element isolation — the Optus
  invariant);
- provisioning correctness (service has required place binding).

---

## 6. Non-functional requirements
| NFR | Target / approach |
|---|---|
| Scalability (feed) | broker partitioning via YANG message-key hash+modulo (NMOP draft); consumer pulls scoped slices |
| Performance (correlation) | multi-hop impact traversal in L1 returns within interactive latency on rig-scale graph |
| Detection vs causality | feed must carry causal (data-plane) signal, not only black-box/aggregate; probes complementary only |
| Observability redundancy | data/control/management sub-planes + outside-in view; incident detectable if ≥1 of 4 observed |
| Security | plane-aware routing; OAuth where control-plane reached; no raw config authored by controller |
| Privacy | GDPR data-minimisation; P4 transient boundary enforced in schema and code |
| Auditability | immutable log; correlation id threaded across all layers |
| Reproducibility | docker-compose; Apache-2.0; no closed dependencies in rig |

---

## 7. Security & governance view (ARB / threat-overlay hook)
- **Plane separation (P3):** classify each action M / C / F; a management-plane change with a
  forwarding-plane consequence must surface that consequence pre-commit (the Optus failure mode).
  *Vocabulary note:* "forwarding plane" here follows Graf's umbrella usage (observed system spanning
  data + control + management sub-planes) — distinct from the 3GPP user-plane. State which when crossing
  audiences.
- **Autonomy gating:** blast radius drives the autonomy level; cross-jurisdiction or critical-service
  reach forces human-in-loop.
- **Trust gradient:** any externally-triggered request (chatbot, ticket) is least-trusted; it may only
  create a governed request, never author config. Authorization binds to the authenticated subject.
- **Audit:** non-repudiable, correlation-id-linked record of every loop action.

---

## 8. Standards & provenance traceability matrix (review hook)
| Building block | Standard | Version/ref | Provenance |
|---|---|---|---|
| Location foundation | TM Forum SID | GB922 v24.0 | authoritative |
| Joints (§4.3) | TM Forum SID | GB922 v24.0 | authoritative |
| Civic/indoor hierarchy edges | (recursive relationship entities) | v24 `GeographicLocationRelationship` / `LocalLocationRelationship` | **open item — currently `[MODEL]`** |
| Feed subscriptions | YANG-Push | RFC 8639 / 8641 | authoritative |
| Feed addressing | NMOP message-key | `draft-netana-nmop-yang-message-broker-message-key-00` | work-in-progress |
| Service↔infra map | NMOP SIMAP | `draft-ietf-nmop-simap-concept` | work-in-progress |
| Intent concepts | IETF | RFC 9315 | authoritative |
| Intent validation | W3C SHACL | — | authoritative |
| Config model | YANG / NETCONF | RFC 7950 / 6241 | authoritative |

---

## 9. Build plan for Claude Code

### 9.1 Repo layout
```
location-assurance-twin/
  docker-compose.yml          # Neo4j+n10s+APOC, Fuseki+SHACL, broker
  .env.example                # secrets (gitignored); NEO4J_AUTH etc.
  graph/location_twin_v24.cypher    # L1 instances + joints + zero-X queries
  ontology/sid_location_v24.ttl     # L2 minimal OWL (GB922 v24.0 stamp)
  shapes/intent_shapes.ttl          # L2 SHACL: geo-diversity, reachability, provisioning
  feed/                              # L0: YANG-Push consumer → broker (message-key scheme)
  bridge/n10s_init.(cypher|sh)       # L3: ontology import + namespace map
  controller/closed_loop.(py|ts)     # L4: detect→correlate→validate→blast→gate→verify
  HLD.md                             # this document
  README.md                          # baselines, how-to-run, version stamps
```

### 9.2 Build tasks (each maps to a building block)
1. **rig** — docker-compose: Neo4j 5 (n10s + APOC), Fuseki (SHACL on), broker. `.env` secrets only.
2. **L1** — load `location_twin_v24.cypher`; the zero-X queries return non-empty.
3. **L2 ontology** — minimal OWL for the classes/joints in use; namespace `sid:`; stamp GB922 v24.0;
   carry provenance predicate.
4. **L2 shapes** — SHACL: geo-diversity (must FAIL on seeded shared-section case), critical-service
   reachability, provisioning.
5. **L3 bridge** — n10s init; import ontology; labels resolve to `sid:` classes.
6. **L0 feed** — YANG-Push consumer writing typed records to broker topics named per the message-key
   scheme; consumer pulls a scoped slice (xpath/element). Rig may stub devices via Netopeer2/Sysrepo.
7. **L4 controller** — one pass: input a faulted resource → `Q-CORRELATE` → serialise impacted
   subgraph → POST to Fuseki → SHACL validate → print impacted services/customers/tickets + violations;
   run `Q-BLAST`, print recommended autonomy level. No per-UE location anywhere.
8. **deviation report** — record approximations, any SID class approximated in OWL, and whether the
   `[MODEL]` civic/indoor edges were promoted to the named v24 relationships.

### 9.3 Constraints
Node ≥22 or Python 3.11; docker-compose (not Helm); Apache-2.0 headers; GB922 v24.0 stamped in
ontology + README; P4 privacy boundary enforced; provenance (`[SID v24]` vs `[MODEL]`) traceable
through to RDF.

### 9.4 Acceptance criteria
- `docker compose up` → all services healthy.
- L1 loads clean; zero-X queries return rows.
- n10s import succeeds; twin labels resolve to `sid:` classes.
- controller run returns impacted-service list **and** a geo-diversity SHACL violation on the seeded
  shared-section case **and** a `Q-BLAST` autonomy recommendation.
- no per-subscriber location persisted anywhere.

---

## 10. Decision records (condensed)
| ID | Decision | Driver |
|---|---|---|
| D1 | Graph for the relationship layer | recursive impact / blast-radius traversal |
| D2 | GB922 v24.0 authoritative baseline | source discipline; corrected 3 DTDL errors |
| D3 | Two stores, split by concern | SHACL intent + RDF interop vs traversal speed |
| D4 | Schema/intent in RDF, instances in LPG | SSoT — no fact mastered twice |
| D5 | n10s bridge, uni-directional | shared vocabulary without shared mastership |
| D6 | SHACL = intent, Cypher = blast radius | right engine per rule type |
| D7 | No durable per-subscriber location | privacy-by-default; plane separation |
| D8 | docker-compose proof rig | pattern proof, not production |
| D9 | Feed = semantic YANG-Push → broker, addressable (NMOP message-key) | preserve semantics end-to-end; observability is the upstream precondition |
| D10 | Adopt Graf forwarding-plane-as-umbrella vocabulary with reconciliation note | avoid term collision with 3GPP user-plane across audiences |

---

## 11. Relationship to adjacent work
- **ibn-core** — intent lineage (RFC 9315); this twin is the assurance consumer.
- **togaf-trace-kit** — observability-to-architecture; complementary evidence engine.
- **Graf / NMOP** — L0 feed is his semantic-YANG-in-broker layer (message-key draft); L1 correlation is
  structurally SIMAP-aligned. *Two distinct "digital twins": his = YANG network-state twin (feed/model);
  this = SID service/place twin (correlation/governance). Name them apart.*
- **Papers** — L1 correlation = Paper 2 (operational spine, free5GC adapter as signal source); L0 feed +
  L2 YANG-RDF = Paper 3 (intent-to-YANG via NMOP).

---

## 12. Risks and open items
| # | Item | Disposition |
|---|---|---|
| R1 | Two-store justification challenged ("why not Neo4j only?") | defence: Fuseki earns place for SHACL-as-intent + RDF interop; else collapse to one store |
| R2 | `[MODEL]` civic/indoor edges not named SID associations | promote to `GeographicLocationRelationship` / `LocalLocationRelationship` before paper/panel |
| R3 | OWL scope (minimal ~15 vs full ~85 Location ABE) | minimal acceptable for rig; confirm before publication |
| R4 | Over-claiming prevention of incidents | architecture surfaces consequence pre-commit; does NOT execute skipped procedure — keep claim narrow |
| R5 | Digital-twin term collision | always qualify which twin (YANG network-state vs SID service/place) |
| R6 | Feed draft is work-in-progress | message-key/SIMAP drafts may change; pin draft revisions in README |

---

## 13. Future (out of this iteration)
Multi-operator federation (ibn-core v4.0.0 / GSMA Open Gateway); real-carrier stress-testing of the
correlation and blast-radius queries; Paper 3 intent-to-YANG telemetry alignment; promotion of the rig
toward an HA topology.

---
*Working design document. Provenance discipline applies throughout: every model element is tagged to a
versioned standard; `[MODEL]` marks modelling-convenience constructs not named in GB922 v24.0. Motivating
incident facts sourced to public inquiry only.*
