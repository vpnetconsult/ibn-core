// =====================================================================
// LOCATION-FOUNDATION DIGITAL TWIN  —  Neo4j 5 LPG
// Baseline: TM Forum GB922 Information Framework (SID), Frameworx v24.0
// Source of truth: GB922_Information_Framework_SID_Excel_v24_0.xlsx
//                  ("Shared Domain.Location ABE" tree + cross-domain joints)
// =====================================================================
// PROVENANCE DISCIPLINE — every edge below is tagged:
//   [SID v24]  = a named association/relationship in GB922 v24.0
//   [MODEL]    = modelling-convenience containment, NOT a named SID assoc
//                (sensible hierarchy edges the attribute view doesn't name)
// Three corrections vs the earlier DTDL twin are applied:
//   1. PlaceLocatesResource (DTDL)      -> PlacePhysicalResourceAssoc [SID v24]
//   2. PlacePartyRoleAssoc              -> DOES NOT EXIST in v24; Party->Place
//                                          is indirect via AddressContactMediumRole
//   3. Location ABE lives in SHARED domain (not "Common")
// =====================================================================

// ---------------------------------------------------------------------
// 0. CONSTRAINTS / INDEXES
// ---------------------------------------------------------------------
CREATE CONSTRAINT place_id   IF NOT EXISTS FOR (p:Place)            REQUIRE p.id IS UNIQUE;
CREATE CONSTRAINT svc_id     IF NOT EXISTS FOR (s:Service)          REQUIRE s.id IS UNIQUE;
CREATE CONSTRAINT pr_id      IF NOT EXISTS FOR (r:PhysicalResource) REQUIRE r.id IS UNIQUE;
CREATE CONSTRAINT prod_id    IF NOT EXISTS FOR (p:Product)          REQUIRE p.id IS UNIQUE;
CREATE CONSTRAINT bi_id      IF NOT EXISTS FOR (b:BusinessInteraction) REQUIRE b.id IS UNIQUE;
CREATE CONSTRAINT party_id   IF NOT EXISTS FOR (p:PartyRole)        REQUIRE p.id IS UNIQUE;
CREATE CONSTRAINT nrs_id     IF NOT EXISTS FOR (n:NetworkRouteSection) REQUIRE n.id IS UNIQUE;
CREATE POINT INDEX geo_pt    IF NOT EXISTS FOR (g:GeographicLocation) ON (g.location);

// ---------------------------------------------------------------------
// 1. LOCATION FOUNDATION  (Shared Domain.Location ABE)
//    Multi-label: every node is :Place plus its v24 subtype label.
// ---------------------------------------------------------------------

// --- Civic / Geographic Place ABE : the civic pyramid (all native in v24) ---
MERGE (cy:Place:Country          {id:'C-MY'})           SET cy.name='Malaysia';
MERGE (st:Place:GeographicState  {id:'S-WP'})           SET st.name='WP Kuala Lumpur';
MERGE (aa:Place:AdministrativeArea {id:'AA-KL'})        SET aa.name='Kuala Lumpur', aa.level='city';
MERGE (ga:Place:GeographicArea   {id:'GA-KEPONG'})      SET ga.name='Kepong district';
MERGE (st)-[:WITHIN {prov:'[MODEL]'}]->(cy);
MERGE (aa)-[:WITHIN {prov:'[MODEL]'}]->(st);
MERGE (ga)-[:WITHIN {prov:'[MODEL]'}]->(aa);

// --- GeographicSite + GeographicAddress + GeographicLocation (geodetic leaf) ---
MERGE (site:Place:GeographicSite {id:'SITE-KEPONG-01'}) SET site.name='Kepong Campus', site.kind='campus';
MERGE (site)-[:WITHIN {prov:'[MODEL]'}]->(ga);
MERGE (addr:Place:GeographicAddress {id:'ADDR-KEPONG-01'})
  SET addr.streetName='Jalan Kepong', addr.postcode='52100', addr.stateOrProvince='WP KL';
MERGE (gl:Place:GeographicLocation {id:'GL-KEPONG-01'})
  SET gl.location = point({latitude:3.2065, longitude:101.6360}), gl.accuracyM=50;
MERGE (addr)-[:GeographicAddressLocatedAt {prov:'[SID v24]'}]->(gl);   // named assoc in v24
MERGE (site)-[:SiteDefinesLocalPlace {prov:'[SID v24]'}]->(lp:Place:LocalPlace {id:'LP-KEPONG-FLR3'});

// --- Local Place ABE : indoor/3D campus location (Paper 3 OT/IT anchor) ---
SET lp.name='Floor 3 plant room';
MERGE (ll:Place:LocalLocation {id:'LL-RACK-A12'})
  SET ll.x=12.4, ll.y=3.1, ll.z=0.0, ll.coordSystem='campus-local-grid';
MERGE (ll)-[:WITHIN {prov:'[MODEL]'}]->(lp);
// OpenGisSFS geometry layer exists in v24 (Point/Polygon/...) — coverage polygon kept
// as a property here for runnability; formal model would be :Polygon geometry nodes.
SET ga.coveragePolygon = 'POLYGON((101.62 3.19,101.65 3.19,101.65 3.22,101.62 3.22,101.62 3.19))';

// ---------------------------------------------------------------------
// 2. THE SIX v24 CROSS-DOMAIN JOINTS  (the "pointers" into Place)
//    Relationship name == the GB922 v24.0 association entity name.
// ---------------------------------------------------------------------
// (a) Service -> Place
MERGE (svc:Service {id:'SVC-VONR-001'}) SET svc.name='VoNR voice service (Kepong)', svc.critical=true;
MERGE (svc)-[:ServicePlaceDetails {prov:'[SID v24]'}]->(site);

// (b) PhysicalResource <-> Place   (corrected from DTDL PlaceLocatesResource)
MERGE (gnb:PhysicalResource {id:'PR-GNB-KEPONG-01'}) SET gnb.kind='gNB';
MERGE (smf:PhysicalResource {id:'PR-SMF-HOST-01'})   SET smf.kind='SMF host';
MERGE (gnb)-[:PlacePhysicalResourceAssoc {prov:'[SID v24]'}]->(site);
MERGE (smf)-[:PlacePhysicalResourceAssoc {prov:'[SID v24]'}]->(site);
// Service realized on resource (Service<->Resource arc; not a Place joint)
MERGE (svc)-[:RealizedBy {prov:'[SID v24]'}]->(smf);

// (c) BusinessInteraction -> Place  (supertype; TroubleTicket/Order are subtype labels)
//     carries locationRole — this is the TMF621 trouble-ticket binding to the foundation
MERGE (tt:BusinessInteraction:TroubleTicket {id:'TT-90021'})
  SET tt.status='open', tt.symptom='no voice calls';
MERGE (tt)-[:BusinessInteractionLocation {prov:'[SID v24]', locationRole:'fault-site'}]->(site);

// (d) Product -> Place   (placeRole)
MERGE (prod:Product {id:'PROD-MOBILE-7781'}) SET prod.name='Mobile plan w/ VoNR';
MERGE (prod)-[:ProductPlaceRole {prov:'[SID v24]', placeRole:'service-address'}]->(addr);

// (e) ProductOrderItem -> Place   (placeRole)
MERGE (poi:BusinessInteraction:ProductOrderItem {id:'POI-5540'}) SET poi.status='completed';
MERGE (poi)-[:ProductOrderItemPlaceRole {prov:'[SID v24]', placeRole:'install-address'}]->(addr);

// (f) StockItem / InstalledResource -> Place
MERGE (stock:Place:GeographicSite {id:'WH-KL-CENTRAL'}) SET stock.name='KL Central warehouse', stock.kind='warehouse';
MERGE (si:StockItem {id:'STK-GNB-SPARE-RU'}) SET si.kind='gNB radio unit', si.qty=4;
MERGE (si)-[:StockLocation {prov:'[SID v24]'}]->(stock);

// (g) Party -> Place : INDIRECT via AddressContactMediumRole (no direct assoc in v24)
MERGE (cust:PartyRole:Customer {id:'CUST-44120'}) SET cust.name='Acme Logistics';
MERGE (cm:ContactMedium {id:'CM-44120-ADDR'}) SET cm.type='postal';
MERGE (cust)-[:PartyRoleContactableVia {prov:'[SID v24]'}]->(cm);
MERGE (cm)-[:AddressContactMediumRole {prov:'[SID v24]'}]->(addr);
// product ownership ties customer to the service location
MERGE (cust)-[:Owns {prov:'[SID v24]'}]->(prod);

// ---------------------------------------------------------------------
//  SRLG seed : two paths for the critical service that WRONGLY share a section
// ---------------------------------------------------------------------
MERGE (rtP:NetworkRoute {id:'NR-PRIMARY'})  SET rtP.role='primary';
MERGE (rtB:NetworkRoute {id:'NR-BACKUP'})   SET rtB.role='backup';
MERGE (svc)-[:USES_PATH {prov:'[MODEL]'}]->(rtP);
MERGE (svc)-[:USES_PATH {prov:'[MODEL]'}]->(rtB);
UNWIND ['NRS-A','NRS-B','NRS-SHARED'] AS sid MERGE (:NetworkRouteSection {id:sid});
MATCH (a:NetworkRouteSection {id:'NRS-A'}),(b:NetworkRouteSection {id:'NRS-B'}),(sh:NetworkRouteSection {id:'NRS-SHARED'})
MERGE (rtP)-[:HAS_SECTION {prov:'[SID v24]'}]->(a)
MERGE (rtP)-[:HAS_SECTION {prov:'[SID v24]'}]->(sh)
MERGE (rtB)-[:HAS_SECTION {prov:'[SID v24]'}]->(b)
MERGE (rtB)-[:HAS_SECTION {prov:'[SID v24]'}]->(sh);   // <-- shared-risk: both use NRS-SHARED


// =====================================================================
//  ZERO-X QUERY LIBRARY  — the autonomous-loop payoff
//  Location is the deterministic join: detection -> impact -> blast radius.
// =====================================================================

// --- Q-CORRELATE : TMF642 alarm -> Place -> impacted Services / Customers / Tickets
//     (deterministic Analyze step; replaces ML correlation guesswork)
//   :param prId => 'PR-GNB-KEPONG-01'
//   MATCH (r:PhysicalResource {id:$prId})-[:PlacePhysicalResourceAssoc]->(p:Place)
//   // descend the foundation: child places under the faulted place are also hit
//   MATCH (child:Place)-[:WITHIN*0..]->(p)
//   OPTIONAL MATCH (s:Service)-[:ServicePlaceDetails]->(child)
//   OPTIONAL MATCH (pr:Product)-[:ProductPlaceRole]->(child)<-[:AddressContactMediumRole]-(:ContactMedium)<-[:PartyRoleContactableVia]-(cu:Customer)
//   OPTIONAL MATCH (bi:BusinessInteraction)-[:BusinessInteractionLocation|ProductOrderItemPlaceRole]->(child)
//   RETURN p.id AS faultPlace,
//          collect(DISTINCT s.id)  AS impactedServices,
//          collect(DISTINCT cu.id) AS impactedCustomers,
//          collect(DISTINCT bi.id) AS openInteractions;

// --- Q-SRLG : zero-outage redundancy. Geo-diverse means NO shared NetworkRouteSection.
//     Upgrades the SHACL "must have a backup" rule from topological to shared-risk.
//   :param svcId => 'SVC-VONR-001'
//   MATCH (s:Service {id:$svcId})-[:USES_PATH]->(:NetworkRoute {role:'primary'})-[:HAS_SECTION]->(shared:NetworkRouteSection)
//   MATCH (s)-[:USES_PATH]->(:NetworkRoute {role:'backup'})-[:HAS_SECTION]->(shared)
//   RETURN s.id AS service, collect(shared.id) AS sharedRiskSections,
//          CASE WHEN count(shared)=0 THEN 'GEO-DIVERSE ✓' ELSE 'SRLG VIOLATION ✗' END AS verdict;

// --- Q-BLAST : governance gate. Compute blast radius -> recommend IG1218 autonomy level.
//     This is what lets the SAME loop run AUTO for a tight transport fault and
//     SUPERVISED for a wide / cross-jurisdiction one.
//   :param prId => 'PR-GNB-KEPONG-01' ; :param maxAutoServices => 5
//   MATCH (r:PhysicalResource {id:$prId})-[:PlacePhysicalResourceAssoc]->(p:Place)
//   MATCH (child:Place)-[:WITHIN*0..]->(p)
//   OPTIONAL MATCH (s:Service)-[:ServicePlaceDetails]->(child)
//   OPTIONAL MATCH (child)-[:WITHIN*0..]->(aa:AdministrativeArea)
//   WITH p, count(DISTINCT s) AS svcCount, count(DISTINCT aa) AS adminAreas,
//        max(CASE WHEN s.critical THEN 1 ELSE 0 END) AS hasCritical, $maxAutoServices AS cap
//   RETURN p.id AS scope, svcCount, adminAreas, hasCritical=1 AS touchesCritical,
//     CASE
//       WHEN adminAreas>1 OR svcCount>cap OR hasCritical=1 THEN 'L2-SUPERVISED (human approves remediation)'
//       WHEN svcCount=0 THEN 'L4-AUTONOMOUS (no service impact, safe)'
//       ELSE 'L3-CONDITIONAL-AUTO (single site, bounded)'
//     END AS recommendedAutonomyLevel;

// --- Q-PROACTIVE : zero-trouble. External GeographicArea event -> exposed sites/services
//     BEFORE any alarm fires (storm cell, grid fault, planned civil works).
//   :param areaId => 'GA-KEPONG'
//   MATCH (a:GeographicArea {id:$areaId})<-[:WITHIN*0..]-(site:GeographicSite)
//   MATCH (s:Service)-[:ServicePlaceDetails]->(site)
//   RETURN a.id AS eventArea, collect(DISTINCT site.id) AS exposedSites,
//          collect(DISTINCT s.id) AS atRiskServices;

// --- Q-DISPATCH : zero-touch-physical bridge when self-heal isn't possible.
//     Nearest stock + exact address + indoor location for the truck roll.
//   :param prId => 'PR-GNB-KEPONG-01'
//   MATCH (r:PhysicalResource {id:$prId})-[:PlacePhysicalResourceAssoc]->(site:GeographicSite)
//   OPTIONAL MATCH (site)-[:WITHIN]->()<-[:WITHIN]-(:GeographicSite)<-[:StockLocation]-(stk:StockItem)
//   OPTIONAL MATCH (site)<-[:SiteDefinesLocalPlace]-() , (site)-[:SiteDefinesLocalPlace]->(:LocalPlace)<-[:WITHIN]-(ll:LocalLocation)
//   MATCH (gl:GeographicLocation)<-[:GeographicAddressLocatedAt]-(:GeographicAddress)
//   RETURN site.id AS faultSite, gl.location AS gps, ll.id AS indoorLocation, collect(DISTINCT stk.id) AS sparesAvailable;

// =====================================================================
//  TRANSIENT IDENTITY-SPINE  (privacy/governance boundary — unchanged)
//  Durable: the STATIC service-location (which Site anchors the VoNR service,
//  which Place hosts SMF/UPF) — modelled above.
//  NOT durable: live per-UE serving cell/TAI. Resolved on demand
//  (Nudm_UECM -> serving AMF; Namf_EventExposure -> TAI) and projected with TTL.
//   // MERGE (sub:Subscriber {supi:'imsi-...'})-[:CAMPED_ON {ts:datetime(), ttl:300}]->(:Cell)
//   // never master data; written by a short-lived projection job, then expired.
// =====================================================================
