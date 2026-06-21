# MyDIGITAL National Priorities Alignment Statement

> **Template Origin**: Community | **ArcKit Version**: 5.11.0 | **Command**: `/arckit:my-mydigital`

> ⚠️ **Community-contributed artefact** — not part of the officially-maintained ArcKit baseline. This statement positions **ibn-core**, a commercial open-core telecommunications enabler delivered by Vpnet Cloud Solutions Sdn. Bhd., against the Malaysia Digital Economy Blueprint (MyDIGITAL). It frames MyDIGITAL alignment as **commercial positioning for a private-sector telco enabler** — NOT as a public-sector agency obligation. ibn-core is not a Government initiative and carries no Federal mandate to deliver MyDIGITAL outcomes; the alignment below describes how a commercial 5G/AI connectivity enabler *contributes to* national digital-economy outcomes. Citations to MyDIGITAL, EPU and JDN text may lag the current source — verify against <https://www.mydigital.gov.my/> before reliance. Review by qualified Malaysian compliance counsel is advised before external use.

## Document Control

| Field | Value |
|-------|-------|
| **Document ID** | ARC-001-MYDIG-v1.0 |
| **Document Type** | MyDIGITAL National Priorities Alignment Statement |
| **Project** | ibn-core-my (Project 001) |
| **Classification** | PUBLIC |
| **Status** | APPROVED |
| **Version** | 1.0 |
| **Created Date** | 2026-06-05 |
| **Last Modified** | 2026-06-21 |
| **Review Cycle** | Quarterly |
| **Next Review Date** | 2026-09-05 |
| **Owner** | Roland Pfeifer, Lead Architect / CTO (Vpnet Cloud Solutions Sdn. Bhd.) |
| **Reviewed By** | Vpnet Compliance owner review — Roland Pfeifer, CTO (2026-06-21) |
| **Approved By** | Roland Pfeifer, CTO — management acceptance (Vpnet accountable owner), 2026-06-21; MyDIGITAL alignment is voluntary/strategic positioning, not a compliance certification |
| **Distribution** | ibn-core engineering, Vpnet SI delivery teams, operator integration partners (U Mobile, TM Malaysia) |

> **Subject type note**: ibn-core is a **commercial** product / Systems Integration (SI) engagement, not a Federal public-sector entity. The `my-operator` build recipe deliberately drops the public-sector-only MyDIGITAL overlays (MyGovEA, ePerolehan, MyGDX, National Archives digital records, MyDigital ID, rakyat-centric service review) and reframes data classification to commercial data-sensitivity tiers rather than Arahan Keselamatan. The Generic/commercial document-control header (not the Malaysia Federal "Agensi" header) therefore applies; classification follows the project's PUBLIC posture, consistent with `ARC-000-PRIN-v1.0`, `ARC-001-REQ-v1.0`, and `ARC-001-STKE-v1.0`.

## Revision History

| Version | Date | Author | Changes | Approved By | Approval Date |
|---------|------|--------|---------|-------------|---------------|
| 1.0 | 2026-06-05 | ArcKit AI | Initial creation from `/arckit:my-mydigital` (executed via arckit-build wave 2) | PENDING | PENDING |
| 1.0 (signed off) | 2026-06-21 | ArcKit AI | Management sign-off — Status → APPROVED (Vpnet owner acceptance); voluntary/strategic alignment, not a certification | Roland Pfeifer, CTO | 2026-06-21 |

---

## Executive Summary

**ibn-core** is an open-core (Apache 2.0) RFC 9315 Intent-Based Networking framework targeting the TM Forum TMF921 Intent Management API v5.0.0, developed by Vpnet Cloud Solutions Sdn. Bhd. and delivered commercially — with private operator CAMARA adapters — to Malaysian telecommunications operators (U Mobile, TM Malaysia) through Systems Integration engagements. It is AI-native: an Anthropic Claude translation layer converts natural-language commercial/customer intent into structured TMF921 Intent resources, and an autonomous agent runtime orchestrates fulfilment across operator 4G/5G core, transport, and OSS/BSS systems. This statement positions ibn-core against the Malaysia Digital Economy Blueprint (MyDIGITAL) — the EPU/JDN national strategy to make Malaysia a regional leader in the digital economy — strictly as a **commercial enabler contributing to national outcomes**, not as a Government deliverable.

ibn-core's contribution to MyDIGITAL is concentrated in the Blueprint's economy-facing thrusts rather than its public-sector-transformation thrust. Its strongest alignment is with **Thrust 2 (Boost economic competitiveness)** and **Thrust 3 (Build enabling digital infrastructure)**: by automating intent-to-network translation, ibn-core lowers operators' cost and time-to-service for 5G-enabled digital services, accelerating the deployment of the connectivity that MyDIGITAL's digital-economy GDP and 5G-coverage targets depend on. As a locally-developed, standards-conformant, AI-native framework it also advances **Thrust 4 (digital talent / local tech capability)** by building Malaysian deep-tech IP (RFC 9315 / TMF921 implementation, agentic AI, academic publication) and the **National 4IR Policy / AI agenda** through responsible, observable, identity-scoped autonomous AI operating on production telco networks.

Because ibn-core is a back-office operator enabler, its direct contribution to **Thrust 1 (public-sector digital transformation)** and **Thrust 5 (inclusive digital society)** is **indirect** — mediated through the operators it serves and the JENDELA connectivity programme those operators deliver. This statement records those linkages honestly and flags, in *Gaps & Opportunities*, where ibn-core under-delivers against MyDIGITAL and what (e.g. measured 5G time-to-service gains, MyDigital-ID interoperability, rural-coverage intent patterns) would close the gap. National KPIs are cited as the outcomes ibn-core *contributes toward via its operator customers*, never as KPIs ibn-core itself is accountable for.

---

## Initiative Context (for alignment)

| Attribute | Value |
|-----------|-------|
| Initiative | ibn-core — RFC 9315 / TMF921 Intent-Based Networking framework |
| Supplier | Vpnet Cloud Solutions Sdn. Bhd. (commercial; open-core + private SI adapters) |
| Beneficiary operators | U Mobile, TM Malaysia (and future Malaysian operators) |
| Delivery model | Open Core — public Apache 2.0 framework + private operator CAMARA adapters via SI |
| Phase / scope | Alpha phase; full-system scope (ref. `ARC-001-REQ-v1.0`) |
| AI posture | AI-native — LLM intent translation (FR-002) + autonomous agent orchestration (FR-003), agent-role identity (FR-007), agent telemetry (FR-011) |
| Regulatory triad | JPDP (PDPA 2010), NACSA (NCII — telecommunications), MCMC (connectivity / residency) — per `ARC-001-STKE-v1.0` |
| Subject classification | Commercial enabler (NOT a Federal public-sector entity) |

---

## Thrust Alignment

> National KPIs below are MyDIGITAL Blueprint targets. ibn-core **contributes toward** these through its operator customers; it is not itself accountable for them. Contribution is rated **Direct**, **Indirect (via operators)**, or **Enabling**.

| MyDIGITAL thrust | Relevant strategy / initiative | National KPI advanced | How ibn-core contributes | Contribution |
|---|---|---|---|---|
| **1. Drive digital transformation in the public sector** | Government digitalisation; cloud-first; data-driven services | Public-sector cloud adoption; digital-government service uptake | Out of primary scope — ibn-core is an operator enabler, not a Government system. Indirect only: the same RFC 9315 / TMF921 intent pattern and MCP adapter seam could, in principle, be reused for public-sector connectivity procurement, and Malaysian operators serving Government accounts benefit from faster, auditable service provisioning. No Federal mandate claimed. | Indirect / Enabling |
| **2. Boost economic competitiveness** | Digitalise businesses; grow digital-economy GDP; build local tech champions; deep-tech IP | Digital economy contribution to GDP; number of local tech firms / high-value digital jobs; deep-tech / IP creation | **Core alignment.** ibn-core cuts operator cost and time-to-service for launching 5G-enabled digital services (intent → TMF921 → autonomous fulfilment), directly improving the competitiveness of Malaysian telcos and the enterprises they connect. As locally-developed, standards-conformant deep-tech IP (Apache 2.0 framework + private SI adapters + academic publication), it grows Malaysian high-value technology capability and an exportable open-core product. | **Direct** |
| **3. Build enabling digital infrastructure** | National 5G rollout; quality, reliable, affordable connectivity; cloud infrastructure | 5G population coverage; service availability / quality; affordability | **Core alignment.** By automating and standardising intent-driven provisioning across operator 4G/5G core and transport, ibn-core makes 5G service activation faster, more reliable and lower-cost to operate — amplifying the value of national 5G infrastructure investment. Runs cloud-native on Kubernetes/Istio with operator-respecting data residency (MCMC / `MY_CLOUD_FIRST`). | **Direct** |
| **4. Build an agile, competent digital talent pool** | Grow 4IR/AI talent; deep-tech and agentic-AI skills; local capability | Number of digitally-skilled / 4IR-skilled workers; local R&D capability | Builds scarce Malaysian capability in RFC 9315 IBN, TMF921 conformance, agentic AI, OpenTelemetry observability and zero-trust telco security. Open-core (Apache 2.0) lowers the barrier for local engineers and researchers to learn production-grade IBN; the academic publication (Paper 1) seeds local deep-tech research. | Direct / Enabling |
| **5. Create an inclusive digital society** | JENDELA connectivity; bridge the digital divide; affordable access | Broadband coverage / quality (urban + rural); digital inclusion | Indirect — ibn-core does not face citizens. By lowering the cost and effort of provisioning connectivity services, it can help operators extend and sustain affordable services (including JENDELA-aligned coverage areas) more economically. Realising this requires operator commitment and rural-coverage intent patterns (see Gaps). | Indirect (via operators) |

---

## Cloud, Connectivity & AI Linkage

### Cloud adoption

- ibn-core is **cloud-native by construction**: Kubernetes/Istio service mesh, declarative Infrastructure-as-Code, horizontal autoscaling (ref. `ARC-001-REQ` NFR-S-001, NFR-I-003). It is deployable on PDSA-private, public CSP (AWS / Google / Microsoft / TM), or hybrid topologies.
- MyGovCloud / public-sector cloud targets apply to ibn-core **only indirectly** — as a commercial operator enabler it is not subject to the public-sector cloud-first mandate. Cloud placement is driven by **operator** residency and MCMC data-sovereignty reasoning, not a Government cloud-adoption KPI.
- **Hand off** the cloud-placement and residency analysis to `/arckit:my-cloud-first` (target `MY_CLOUD_FIRST` / `MCRES`) and the placement ADR (`ADR-001`); do not duplicate it here.

### Connectivity / JENDELA

- JENDELA is the national digital-connectivity programme (broadband quality, 4G coverage, fibre, 5G readiness). ibn-core does **not** build or own connectivity; it makes operators' *provisioning of services over* that connectivity faster, cheaper and auditable.
- Inclusion relevance is therefore **indirect**: efficiency gains can lower the marginal cost of serving lower-ARPU or rural segments, supporting (not delivering) JENDELA inclusion outcomes. This linkage is genuine but operator-mediated — see *Gaps & Opportunities*.

### National 4IR / AI

- ibn-core is squarely aligned with the **National 4IR Policy** and Malaysia's **AI agenda**: it is an agentic-AI system performing autonomous, identity-scoped actions on production telco networks, instrumented for full observability (GenAI semantic conventions, RFC 9315 phase tags — FR-011).
- Responsible-AI posture is a first-class design property: constrained agent-role identity (FR-007), PII masking before model invocation (FR-009), PDPA 2010 alignment (NFR-C-001), and auditable agent behaviour (BR-005). These map directly onto Malaysia's AI-governance expectations.
- **Hand off** the detailed AI-governance assessment to `/arckit:my-ai-governance` (target `MY_AI_GOVERNANCE` / `AIGE`) and the AI Playbook (`AIP`); this statement only records the *national-alignment* linkage, not the governance controls themselves.

---

## Gaps & Opportunities

| Gap vs MyDIGITAL | Impact | Opportunity to close it |
|---|---|---|
| **No measured 5G time-to-service / cost-reduction evidence yet** (alpha phase; targets only) | Thrust 2/3 contribution is currently asserted, not evidenced — weakens the economic-competitiveness and infrastructure claims | Capture operator-side baseline vs ibn-core provisioning metrics during SI pilots (time-to-intent < 10 s p95, ≥ 95 % translation accuracy per `ARC-001-REQ`); publish anonymised gains as MyDIGITAL contribution evidence |
| **Inclusion (Thrust 5) contribution is indirect and unquantified** | Cannot claim JENDELA / digital-divide impact credibly without operator-mediated data | Co-design rural/low-ARPU "coverage intent" patterns with operators; measure whether automation lowers the marginal cost of serving JENDELA-aligned areas |
| **No public-sector reuse path articulated (Thrust 1)** | MyDIGITAL's flagship public-sector-transformation thrust is largely untouched | Optional: document how the RFC 9315 / TMF921 intent pattern and MCP seam could underpin public-sector connectivity procurement (without claiming a Government mandate) |
| **Local-talent contribution relies on open-core uptake, not yet demonstrated** | Thrust 4 benefit is potential, not realised | Track Malaysian contributor / adopter signals on the Apache 2.0 repo; link the academic publication (Paper 1) to a local university / MyDIGITAL talent initiative |
| **MyDigital ID / national digital-identity interoperability not in scope** | A national-identity touchpoint MyDIGITAL emphasises is absent (ibn-core uses operator Keycloak identity, by design per `my-operator` recipe) | If a future engagement requires citizen-facing flows, assess MyDigital-ID interoperability via `ADR-002` (operator identity) rather than retrofitting it as a national obligation |
| **Affordability KPI dependence on operator pricing decisions** | ibn-core enables but does not control affordability outcomes | Frame affordability strictly as an *enabling* contribution; avoid over-claiming a KPI ibn-core cannot move alone |

---

## Cross-Reference & Hand-offs

| Concern | Owning artefact / command | Status |
|---|---|---|
| Cloud placement & MCMC residency | `/arckit:my-cloud-first` (`MCRES`), `ADR-001` | Pending (wave 2+) |
| AI governance controls (AIGE) | `/arckit:my-ai-governance` (`AIGE`), `/arckit:ai-playbook` (`AIP`) | Pending |
| Commercial data classification | `/arckit:my-classification` (`MYCLAS`) | Pending |
| PDPA 2010 obligations | `/arckit:my-pdpa` (`PDPA`), `/arckit:dpia` (`DPIA`) | Pending |
| NACSA NCII (telco sector) | `/arckit:my-cyber-security` (`NCII`) | Pending |
| Strategic outline (feeds from this statement) | `/arckit:strategy` (`STRAT`) | Pending |
| Requirements baseline | `ARC-001-REQ-v1.0` | Complete |
| Stakeholder / regulatory triad | `ARC-001-STKE-v1.0` | Complete |
| Architecture principles | `ARC-000-PRIN-v1.0` | Complete |

---

## External References

> This section provides traceability from generated content back to source documents.
> The MyDIGITAL blueprint is the authoritative anchor and MUST appear in the Document Register.

### Document Register

| Doc ID | Title | URL | Verified date |
|--------|-------|-----|---------------|
| MY-MYDIGITAL | Malaysia Digital Economy Blueprint (MyDIGITAL), Economic Planning Unit (EPU) / Jabatan Digital Negara (JDN) | <https://www.mydigital.gov.my/> | 2026-06-05 |
| ARC-000-PRIN | ibn-core Enterprise Architecture Principles v1.0 | projects/000-global/ARC-000-PRIN-v1.0.md | 2026-06-05 |
| ARC-001-REQ | ibn-core-my Business and Technical Requirements v1.0 | projects/001-ibn-core-my/ARC-001-REQ-v1.0.md | 2026-06-05 |
| ARC-001-STKE | ibn-core-my Stakeholder Analysis v1.0 | projects/001-ibn-core-my/ARC-001-STKE-v1.0.md | 2026-06-05 |

### Citations

| Citation | Doc ID | Section | Used in |
|----------|--------|---------|---------|
| [MYD-1] | MY-MYDIGITAL | Six thrusts & national KPIs | Thrust Alignment; Executive Summary |
| [MYD-2] | MY-MYDIGITAL | Thrust 3 — enabling digital infrastructure / 5G | Cloud, Connectivity & AI Linkage |
| [MYD-3] | MY-MYDIGITAL | National 4IR Policy / AI agenda | National 4IR / AI |
| [REQ-1] | ARC-001-REQ | NFR-S-001, NFR-I-003, FR-002/003/007/009/011, NFR-C-001 | Cloud / AI linkage; Gaps |
| [PRIN-1] | ARC-000-PRIN | Open-Core Seam Integrity; Security by Design | Initiative Context; AI linkage |
| [STKE-1] | ARC-001-STKE | MCMC / JPDP / NACSA regulatory triad | Initiative Context |

### Unreferenced Documents

| Filename | Source Location | Reason |
|----------|-----------------|--------|
| `.arckit/recipes/my-operator.yaml` | repo `.arckit/` | Read to confirm commercial-subject framing and target type code (MYDIG); methodological input, not a content source |

---

**Generated by**: ArcKit `/arckit:my-mydigital` command (via `/arckit:build` wave 2)
**Generated on**: 2026-06-05
**ArcKit Version**: 5.11.0
**Project**: ibn-core-my (Project 001)
**Model**: Claude Opus 4.8 (1M context)
