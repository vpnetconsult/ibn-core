# Stakeholder Drivers & Goals Analysis: ibn-core-my

> **Template Origin**: Official | **ArcKit Version**: 5.11.0 | **Command**: `/arckit:stakeholders`

## Document Control

| Field | Value |
|-------|-------|
| **Document ID** | ARC-001-STKE-v1.0 |
| **Document Type** | Stakeholder Drivers & Goals Analysis |
| **Project** | ibn-core-my (Project 001) |
| **Classification** | PUBLIC |
| **Status** | DRAFT |
| **Version** | 1.0 |
| **Created Date** | 2026-06-05 |
| **Last Modified** | 2026-06-05 |
| **Review Cycle** | Quarterly |
| **Next Review Date** | 2026-09-05 |
| **Owner** | Roland Pfeifer, Lead Architect (Vpnet Cloud Solutions Sdn. Bhd.) |
| **Reviewed By** | PENDING |
| **Approved By** | PENDING |
| **Distribution** | ibn-core engineering, Vpnet SI delivery teams, operator integration partners, open-source community |

## Revision History

| Version | Date | Author | Changes | Approved By | Approval Date |
|---------|------|--------|---------|-------------|---------------|
| 1.0 | 2026-06-05 | ArcKit AI | Initial creation from `/arckit:stakeholders` command | PENDING | PENDING |

---

## Executive Summary

### Purpose

This document identifies key stakeholders of the **ibn-core** programme — the open-core (Apache 2.0) RFC 9315 Intent-Based Networking framework developed by Vpnet Cloud Solutions Sdn. Bhd. and delivered, with private operator adapters, as a commercial product and Systems Integration (SI) engagement to Malaysian telecommunications operators. It documents their underlying drivers (motivations, concerns, pressures), how those drivers manifest into measurable goals, and the outcomes that will satisfy them — providing traceability from individual stakeholder concerns to programme success metrics.

### Key Findings

The programme serves two deeply intertwined value propositions that occasionally pull in opposite directions: a **public, standards-conformant open-core framework** that drives academic credibility and community adoption, and **private, revenue-generating operator integrations** delivered to U Mobile and TM Malaysia. The dominant alignment is strong — standards conformance (RFC 9315 / TMF921 CTK) simultaneously satisfies operators procuring on interoperability, the academic audience citing Paper 1, and Vpnet's commercial differentiation. The sharpest tension is between **open-source transparency** (community contributors want everything in the open) and **commercial seam integrity** (operator credentials, CAMARA adapters, and pricing-sensitive logic must stay private). A second material tension is **AI-native autonomous operation** (Vpnet's differentiator) versus **regulator and operator risk appetite** (MCMC, NACSA, and operator network teams are cautious about autonomous changes to live national infrastructure).

### Critical Success Factors

- Sustained 100% TMF921 CTK conformance and demonstrable RFC 9315 phase traceability — the single shared currency that satisfies operators, regulators, and the academic audience simultaneously.
- An intact, well-documented open-core / proprietary seam: zero operator credentials or proprietary adapter logic in the public repo, with a stable published `McpAdapter` interface.
- Demonstrable safety and observability of autonomous AI agent behaviour (agent identity scoping, telemetry, human-in-the-loop guardrails) sufficient to win operator network-team and regulator confidence.
- A reference SI engagement (U Mobile or TM Malaysia) reaching production with evidenced PDPA 2010 and NCII/NACSA alignment.

### Stakeholder Alignment Score

**Overall Alignment**: MEDIUM

Strategic alignment is high around standards conformance and product quality, but two structural conflicts (open transparency vs. commercial seam; AI autonomy vs. regulator/operator risk appetite) require active, ongoing management rather than one-off resolution. These are inherent to the open-core, AI-native, regulated-telco model and will persist across the programme's life.

---

## Stakeholder Identification

### Internal Stakeholders

| Stakeholder | Role/Department | Influence | Interest | Engagement Strategy |
|-------------|----------------|-----------|----------|---------------------|
| Lead Architect / CTO (Roland Pfeifer) | Executive Sponsor — Vpnet Cloud Solutions | HIGH | HIGH | Active involvement, final architecture and standards authority |
| Vpnet SI Delivery Lead | Professional services / engagement delivery | HIGH | HIGH | Day-to-day delivery ownership, operator-facing commitments |
| ibn-core Engineering Team | Open-core framework + AI runtime development | MEDIUM | HIGH | Sprint collaboration, ADRs, seam discipline |
| Private Adapter Engineering | CAMARA operator adapter development (private repo) | MEDIUM | HIGH | Seam-boundary coordination, credential handling |
| Vpnet Commercial / Sales | Revenue, operator account management | HIGH | MEDIUM | Revenue checkpoints, roadmap influence, pricing protection |
| Vpnet Security / Compliance | InfoSec, PDPA, ISO 27001 posture | HIGH | MEDIUM | Security gates, threat modelling, agent identity review |
| Vpnet Finance | Budget, SI margin, AI-inference cost | MEDIUM | MEDIUM | Budget approvals, AI-cost-per-intent validation |

### External Stakeholders

| Stakeholder | Organization | Relationship | Influence | Interest |
|-------------|--------------|--------------|-----------|----------|
| Operator Network Engineering | U Mobile, TM Malaysia | Customer (technical) | HIGH | HIGH |
| Operator IT / Procurement | U Mobile, TM Malaysia | Customer (commercial) | HIGH | HIGH |
| End-Customer Enterprises (O2C buyers) | Operators' B2B subscribers | Beneficiary | LOW | HIGH |
| MCMC | Malaysian Communications and Multimedia Commission | Telco regulator | HIGH | MEDIUM |
| JPDP | Jabatan Perlindungan Data Peribadi (PDPA 2010) | Data-protection regulator | HIGH | MEDIUM |
| NACSA | National Cyber Security Agency (NCII) | Cyber/critical-infrastructure regulator | HIGH | MEDIUM |
| Open-Source Community & Contributors | GitHub `vpnetconsult/ibn-core` | Co-developers / adopters | MEDIUM | HIGH |
| Academic & Standards Audience | IRTF NMRG, TM Forum, Paper 1 readers | Validators / citers | LOW | MEDIUM |
| Anthropic (MCP / Claude) | Linux Foundation / TM Forum (CAMARA / TMF921) | Technology & standards suppliers | LOW | MEDIUM |

> **Context note**: This is a **commercial Malaysian telecommunications** programme, not a UK public-sector citizen service. UK Government digital and security role tables (GovS 005 / GovS 007) are therefore **not applicable** and are intentionally omitted. The regulatory triad of MCMC (telecom), JPDP (PDPA 2010 data protection), and NACSA (NCII cyber) substitutes for the public-sector governance roles in this context.

### Stakeholder Power-Interest Grid

```text
                          INTEREST
              Low                         High
        ┌─────────────────────┬─────────────────────────┐
        │                     │                         │
        │   KEEP SATISFIED    │     MANAGE CLOSELY       │
   High │                     │                         │
        │  • MCMC             │  • Lead Architect / CTO  │
        │  • JPDP             │  • SI Delivery Lead      │
        │  • NACSA            │  • Operator Network Eng  │
 P      │  • Vpnet Security   │  • Operator IT / Procure │
 O      │  • Vpnet Commercial │                         │
 W      ├─────────────────────┼─────────────────────────┤
 E      │                     │                         │
 R      │      MONITOR        │     KEEP INFORMED        │
        │                     │                         │
   Low  │  • Academic /       │  • OSS Community         │
        │    Standards bodies │  • ibn-core Engineering  │
        │  • Tech suppliers   │  • End-Customer Entps     │
        │    (Anthropic/CAMARA)│  • Private Adapter Eng  │
        └─────────────────────┴─────────────────────────┘
```

| Stakeholder | Power | Interest | Quadrant | Engagement Strategy |
|-------------|-------|----------|----------|---------------------|
| Lead Architect / CTO | HIGH | HIGH | Manage Closely | Continuous; final decision authority |
| SI Delivery Lead | HIGH | HIGH | Manage Closely | Weekly delivery reviews |
| Operator Network Engineering | HIGH | HIGH | Manage Closely | Joint design reviews, safety sign-off |
| Operator IT / Procurement | HIGH | HIGH | Manage Closely | Commercial checkpoints, conformance evidence |
| MCMC | HIGH | MEDIUM | Keep Satisfied | Regulatory briefings on autonomous operation |
| JPDP | HIGH | MEDIUM | Keep Satisfied | DPIA / PDPA evidence on request |
| NACSA | HIGH | MEDIUM | Keep Satisfied | NCII cyber-posture attestations |
| Vpnet Security / Compliance | HIGH | MEDIUM | Keep Satisfied | Security gates, milestone reviews |
| Vpnet Commercial / Sales | HIGH | MEDIUM | Keep Satisfied | Revenue and roadmap checkpoints |
| OSS Community & Contributors | MEDIUM | HIGH | Keep Informed | Public roadmap, CONTRIBUTING, release notes |
| ibn-core Engineering | MEDIUM | HIGH | Keep Informed | Sprint reviews, ADRs |
| End-Customer Enterprises | LOW | HIGH | Keep Informed | Operator-mediated service updates |
| Academic / Standards Audience | LOW | MEDIUM | Monitor | Versioned conformance artefacts, citations |
| Tech Suppliers (Anthropic/CAMARA/TMF) | LOW | MEDIUM | Monitor | Track upstream releases and licence terms |

**Quadrant Interpretation:**

- **Manage Closely** (High Power, High Interest): Key decision-makers requiring active engagement.
- **Keep Satisfied** (High Power, Low/Medium Interest): Influential stakeholders needing periodic, evidence-backed assurance.
- **Keep Informed** (Low/Medium Power, High Interest): Engaged stakeholders needing regular communication.
- **Monitor** (Low Power, Low/Medium Interest): Minimal but watchful engagement.

---

## Stakeholder Drivers Analysis

### SD-1: Lead Architect / CTO — Standards conformance as commercial and academic differentiator

**Stakeholder**: Lead Architect / CTO (Roland Pfeifer), Vpnet Cloud Solutions.

**Driver Category**: STRATEGIC

**Driver Statement**: Establish ibn-core as the reference RFC 9315 / TMF921 v5.0.0 production implementation — verifiable, citable, and commercially credible — so the framework wins operator procurement and underpins Paper 1's empirical claims.

**Context & Background**: ibn-core's differentiation rests on demonstrable, third-party-verifiable conformance (100% TMF921 CTK, RFC 9315 phase traceability). Operators procure on interoperability; the academic audience cites on rigour. Divergence from standards erodes both at once.

**Driver Intensity**: CRITICAL

**Enablers**:

- Automated TMF921 CTK in CI with versioned, tagged evidence.
- RFC 9315 phase mapping maintained in code and commit traceability.

**Blockers**:

- Pressure to ship operator-specific shortcuts that diverge from public contracts.
- Conformance regressions slipping past release gates.

**Related Stakeholders**: Operator Network Engineering (SD-4), Academic audience (SD-9), OSS community (SD-8).

---

### SD-2: SI Delivery Lead — Reference engagement to production

**Stakeholder**: Vpnet SI Delivery Lead.

**Driver Category**: OPERATIONAL

**Driver Statement**: Land at least one Malaysian operator engagement (U Mobile or TM Malaysia) in production, on time and within margin, to anchor the commercial model and create a referenceable case study.

**Context & Background**: SI revenue depends on repeatable, evidenced delivery. The first production engagement de-risks the sales pipeline and proves the open-core-plus-private-adapter model end-to-end.

**Driver Intensity**: HIGH

**Enablers**:

- Stable open-core seam so adapters drop in cleanly.
- Reusable deployment manifests and operational runbooks.

**Blockers**:

- Seam churn forcing adapter rework.
- Operator security/regulatory sign-off delays.

**Related Stakeholders**: Operator IT / Procurement (SD-5), Vpnet Commercial (SD-3), Private Adapter Engineering.

---

### SD-3: Vpnet Commercial / Sales — Protect commercial value of operator integrations

**Stakeholder**: Vpnet Commercial / Sales.

**Driver Category**: FINANCIAL

**Driver Statement**: Grow SI and product revenue while protecting the proprietary value embedded in operator (CAMARA) adapters and pricing-sensitive logic that must never leak into the public repo.

**Context & Background**: The open-core model only generates revenue if the private seam holds. Commercial wants maximum public visibility for lead generation but maximum protection for the monetisable adapters.

**Driver Intensity**: HIGH

**Enablers**:

- Clean, published seam with private adapters in a separate repo.
- Strong public reference customers and conformance evidence as sales assets.

**Blockers**:

- Accidental exposure of operator logic or credentials in public commits.
- Community pressure to open-source revenue-critical components.

**Related Stakeholders**: OSS Community (SD-8, conflict), Lead Architect (SD-1).

---

### SD-4: Operator Network Engineering — Safe, observable autonomous operation on live infrastructure

**Stakeholder**: Operator Network Engineering teams (U Mobile, TM Malaysia).

**Driver Category**: RISK

**Driver Statement**: Adopt intent-based automation only if autonomous AI agents acting on live national network configuration are provably safe, scoped, reversible, and fully observable — never a black box.

**Context & Background**: Intents mutate live network state. Network engineers are accountable for uptime and carry deep institutional caution about autonomous changes. AI-native operation is attractive but only under strong guardrails (agent identity, least privilege, telemetry, rollback).

**Driver Intensity**: CRITICAL

**Enablers**:

- Agent identity scoping, least-privilege roles, human-in-the-loop on high-impact actions.
- Full agent telemetry (GenAI conventions, RFC 9315 phase tags) and rollback paths.

**Blockers**:

- Opaque agent reasoning or unscoped autonomous privileges.
- Absence of degraded-mode and circuit-breaker behaviour.

**Related Stakeholders**: NACSA (SD-12), MCMC (SD-10), Vpnet Security (SD-7).

---

### SD-5: Operator IT / Procurement — Standards-based, low-lock-in, value-for-money procurement

**Stakeholder**: Operator IT / Procurement (U Mobile, TM Malaysia).

**Driver Category**: FINANCIAL

**Driver Statement**: Procure an interoperable, standards-conformant (TMF921 / RFC 9315) intent platform that minimises vendor lock-in and demonstrates clear value for money against incumbent OSS/BSS tooling.

**Context & Background**: Operators standardise on TM Forum Open APIs to avoid proprietary lock-in. Procurement needs verifiable conformance and a defensible commercial case.

**Driver Intensity**: HIGH

**Enablers**:

- Published TMF921 CTK results; loose coupling via standard APIs.
- Transparent licensing (Apache 2.0 core) reducing lock-in fears.

**Blockers**:

- Hidden proprietary dependencies that reintroduce lock-in.
- Weak or unverifiable conformance evidence.

**Related Stakeholders**: Lead Architect (SD-1), SI Delivery (SD-2).

---

### SD-6: End-Customer Enterprises — Fast, reliable Order-to-Cash service

**Stakeholder**: End-customer enterprises (operators' B2B subscribers, O2C buyers).

**Driver Category**: CUSTOMER

**Driver Statement**: Obtain connectivity services through a fast, accurate, self-service Order-to-Cash flow that fulfils intent reliably ("I need internet for working from home" → provisioned, fulfilled).

**Context & Background**: The canonical O2C use case (Paper 1) is the visible value proposition for end customers. They neither know nor care about RFC 9315 — they care about speed and reliability.

**Driver Intensity**: MEDIUM

**Enablers**:

- Reliable intent fulfilment with clear status reporting (IntentReport).
- Low-latency intent ingestion and high availability.

**Blockers**:

- Failed or stuck intents; opaque fulfilment status.

**Related Stakeholders**: Operator Network Eng (SD-4), Operator IT (SD-5).

---

### SD-7: Vpnet Security / Compliance — Defensible security and data-protection posture

**Stakeholder**: Vpnet Security / Compliance.

**Driver Category**: COMPLIANCE

**Driver Statement**: Maintain a zero-trust, defence-in-depth posture (ISO 27001 / SOC 2 alignment) and demonstrable PDPA 2010 compliance, including for autonomous agent actions, to satisfy operators and regulators and avoid breach liability.

**Context & Background**: ibn-core handles subscriber context, identity tokens, and agent actions that mutate live config. Security is a NON-NEGOTIABLE principle; agent identity and privilege scoping are first-class concerns.

**Driver Intensity**: CRITICAL

**Enablers**:

- mTLS, vaulted secrets, validated identity tokens, structured audit logging.
- Agent identity scoping and continuous verification.

**Blockers**:

- Secrets or credentials reaching the public repo.
- Autonomous flows running under human/admin identities.

**Related Stakeholders**: NACSA (SD-12), JPDP (SD-11), Operator Network Eng (SD-4).

---

### SD-8: Open-Source Community & Contributors — Genuinely open, contributable framework

**Stakeholder**: Open-source community and external contributors (`vpnetconsult/ibn-core`).

**Driver Category**: STRATEGIC

**Driver Statement**: Engage with a genuinely open (Apache 2.0), well-documented, agent-native framework where contributions are welcomed and the public surface is not hollowed out by commercial gatekeeping.

**Context & Background**: Open-core credibility depends on the public framework being substantive and contributable. Community adoption amplifies reach and academic citation — but collides with commercial protection of adapters.

**Driver Intensity**: MEDIUM

**Enablers**:

- Substantive public framework, clear CONTRIBUTING, context-first docs (CLAUDE.md).
- Transparent rationale for what stays private and why.

**Blockers**:

- Perception of "open-washing" — a thin public shell around closed value.
- GPL-incompatible or proprietary dependencies entering the core.

**Related Stakeholders**: Vpnet Commercial (SD-3, conflict), Lead Architect (SD-1).

---

### SD-9: Academic & Standards Audience — Rigorous, reproducible conformance claims

**Stakeholder**: Academic and standards audience (IRTF NMRG, TM Forum, Paper 1 readers).

**Driver Category**: STRATEGIC

**Driver Statement**: Rely on ibn-core as a reproducible, citable empirical artefact whose conformance claims (CTK pass rates, RFC 9315 mapping) are evidenced, versioned, and immutable at cited tags.

**Context & Background**: Paper 1 cites the repo at specific tags (e.g., v2.0.1). Citation integrity requires those tags never be rewritten and conformance evidence remain verifiable.

**Driver Intensity**: MEDIUM

**Enablers**:

- Immutable version tags; dated, run-ID-stamped compliance artefacts.
- Public standards traceability map.

**Blockers**:

- Force-pushed or rewritten cited tags.
- Unsubstantiated or non-reproducible conformance claims.

**Related Stakeholders**: Lead Architect (SD-1), OSS community (SD-8).

---

### SD-10: MCMC — Telecom regulatory compliance of autonomous network operation

**Stakeholder**: Malaysian Communications and Multimedia Commission (MCMC).

**Driver Category**: COMPLIANCE

**Driver Statement**: Ensure that AI-driven intent-based automation operating on licensed Malaysian network infrastructure remains accountable, auditable, and within telecom regulatory bounds.

**Context & Background**: As the telco regulator, MCMC has oversight of how licensed operators manage network operations. Autonomous AI changes to live infrastructure are a novel regulatory surface requiring accountability and auditability.

**Driver Intensity**: HIGH

**Enablers**:

- Complete audit trails of agent actions and intent lifecycle.
- Human accountability and override on regulated operations.

**Blockers**:

- Unauditable autonomous actions.
- Inability to attribute a network change to a responsible identity.

**Related Stakeholders**: Operator Network Eng (SD-4), NACSA (SD-12).

---

### SD-11: JPDP — PDPA 2010 personal data protection

**Stakeholder**: Jabatan Perlindungan Data Peribadi (Personal Data Protection Department).

**Driver Category**: COMPLIANCE

**Driver Statement**: Ensure subscriber personal data processed through intent flows complies with PDPA 2010 — lawful basis, residency, retention, and protection — including data touched by AI agents.

**Context & Background**: Intent payloads and subscriber context can contain personal data. PDPA 2010 governs processing and cross-border transfer of Malaysian subscriber data.

**Driver Intensity**: HIGH

**Enablers**:

- Data classification, PII masking, residency controls, retention with automated deletion.
- A maintained DPIA covering agent processing.

**Blockers**:

- PII leakage in logs/telemetry.
- Undocumented cross-border data transfers.

**Related Stakeholders**: Vpnet Security (SD-7), Operator IT (SD-5).

---

### SD-12: NACSA — National critical information infrastructure (NCII) cyber assurance

**Stakeholder**: National Cyber Security Agency (NACSA).

**Driver Category**: RISK

**Driver Statement**: Ensure ibn-core deployments touching national telecom infrastructure meet NCII cyber-security expectations and do not introduce systemic risk via autonomous agents.

**Context & Background**: Telecom networks are critical national infrastructure. NACSA's NCII mandate covers cyber resilience of systems that, if compromised, would impact national connectivity.

**Driver Intensity**: HIGH

**Enablers**:

- Defence-in-depth, dependency/code scanning, incident response runbooks.
- Constrained, observable agent privileges; degraded-mode resilience.

**Blockers**:

- Unpatched critical vulnerabilities in deployed components.
- Over-privileged or opaque autonomous flows.

**Related Stakeholders**: Vpnet Security (SD-7), Operator Network Eng (SD-4), MCMC (SD-10).

---

## Driver-to-Goal Mapping

### Goal G-1: Sustain 100% TMF921 CTK conformance with versioned evidence

**Derived From Drivers**: SD-1, SD-5, SD-9

**Goal Owner**: Lead Architect / CTO

**Goal Statement**: Maintain 100% TMF921 v5.0.0 CTK pass (83/83) on every tagged release through 2026, with run-ID-stamped evidence committed under `docs/compliance/` within 24 hours of each release.

**Why This Matters**: Conformance is the shared currency satisfying operator procurement (SD-5), commercial/academic differentiation (SD-1), and citation integrity (SD-9).

**Success Metrics**:

- **Primary Metric**: TMF921 CTK pass rate per release.
- **Secondary Metrics**: Time-to-evidence after release; number of conformance regressions caught pre-merge vs. post-release.

**Baseline**: 100% (83/83) at v2.0.1.

**Target**: 100% maintained across all 2026 releases; zero post-release conformance regressions.

**Measurement Method**: Automated CTK run in CI; evidence docs under `docs/compliance/` with run ID and date.

**Dependencies**: CI pipeline (Actions billing currently constrained); stable TMF921 v5.0.0 resource model.

**Risks to Achievement**: Operator-specific shortcuts diverging from public contracts; CI availability.

---

### Goal G-2: Land first operator engagement in production with safety + compliance evidence

**Derived From Drivers**: SD-2, SD-4, SD-5, SD-7

**Goal Owner**: SI Delivery Lead

**Goal Statement**: Reach production for one Malaysian operator (U Mobile or TM Malaysia) by Q4 2026, with operator network-team safety sign-off, a completed DPIA, and an NCII cyber-posture attestation.

**Why This Matters**: Anchors the commercial model (SD-2), proves autonomous safety to network teams (SD-4), and evidences regulatory readiness (SD-7).

**Success Metrics**:

- **Primary Metric**: Production go-live achieved (binary) with signed safety + compliance gates.
- **Secondary Metrics**: O2C intent fulfilment rate in production; mean intent-to-fulfilment latency.

**Baseline**: No operator in production (pilot/sandbox stage).

**Target**: 1 operator live by Q4 2026; O2C fulfilment ≥ 99% in steady state.

**Measurement Method**: Engagement gate records; production IntentReport metrics; signed DPIA and attestation artefacts.

**Dependencies**: Stable open-core seam (G-4); operator sandbox access; CAMARA adapter readiness.

**Risks to Achievement**: Seam churn; regulator/operator sign-off delays; AI safety concerns unresolved.

---

### Goal G-3: Demonstrably safe and observable autonomous agent operation

**Derived From Drivers**: SD-4, SD-7, SD-10, SD-12

**Goal Owner**: Vpnet Security / Compliance (with Lead Architect)

**Goal Statement**: Ensure 100% of autonomous agent actions run under a scoped, least-privilege agent identity, emit full GenAI + RFC 9315 phase telemetry, and route high-impact actions through human-in-the-loop, with end-to-end audit trails — by the first production go-live.

**Why This Matters**: Converts the AI-native differentiator into something operators (SD-4) and regulators (SD-10, SD-12) will accept on live infrastructure, under a defensible security posture (SD-7).

**Success Metrics**:

- **Primary Metric**: % of agent actions executed under the dedicated agent role identity (target 100%).
- **Secondary Metrics**: % high-impact actions with human approval; audit-trail completeness; telemetry coverage of agent reasoning/tool calls.

**Baseline**: Autonomous intent cycle recently moved to run under the agent role (commit a9da9d4); telemetry partially in place.

**Target**: 100% scoped identity; 100% high-impact actions gated; 100% action auditability.

**Measurement Method**: Authorization logs; OTel agent traces (`gen_ai.*`, `rfc9315.phase`); audit-log review.

**Dependencies**: Telemetry bootstrap ordering preserved; identity realm (Keycloak) integration; HITL workflow.

**Risks to Achievement**: Over-privileged flows; telemetry gaps; pressure to remove HITL for speed.

---

### Goal G-4: Maintain open-core / proprietary seam integrity

**Derived From Drivers**: SD-1, SD-3, SD-8

**Goal Owner**: Lead Architect / CTO

**Goal Statement**: Keep zero operator credentials and zero proprietary adapter logic in the public repo throughout 2026, with the `McpAdapter` interface extended only in backward-compatible ways and all new dependencies Apache-2.0-compatible.

**Why This Matters**: Protects commercial value (SD-3) and standards/citation integrity (SD-1) while preserving genuine openness for the community (SD-8).

**Success Metrics**:

- **Primary Metric**: Count of credential/proprietary-logic leaks into public repo (target 0).
- **Secondary Metrics**: Seam interface backward-compatibility (no breaking changes); dependency licence-compliance rate.

**Baseline**: Clean seam at v1.4.2 (operator services separated to private repo); 0 known leaks.

**Target**: 0 leaks; 100% licence-compatible dependencies; interface backward-compatible all releases.

**Measurement Method**: Secret scanning in CI; dependency licence checks; interface diff review at each release.

**Dependencies**: Secret-scanning tooling; disciplined PR review across the seam.

**Risks to Achievement**: Accidental commits of private logic; community pressure perceived as open-washing.

---

### Goal G-5: Demonstrable PDPA 2010 and data-sovereignty compliance

**Derived From Drivers**: SD-7, SD-11

**Goal Owner**: Vpnet Security / Compliance

**Goal Statement**: Achieve and maintain a current DPIA, enforced PII masking, Malaysia-resident subscriber data handling, and automated retention/deletion — verified before first production go-live and reviewed quarterly.

**Why This Matters**: Satisfies JPDP (SD-11) and underpins the broader security posture (SD-7); a precondition for operator trust.

**Success Metrics**:

- **Primary Metric**: DPIA current and approved (binary) at go-live.
- **Secondary Metrics**: PII-in-logs incidents (target 0); residency-conformant data stores (100%); retention-policy automation coverage.

**Baseline**: PII masking middleware present; DPIA exists in `docs/security/` (review status pending).

**Target**: Approved DPIA; 0 PII-leak incidents; 100% residency-conformant; automated retention live.

**Measurement Method**: DPIA sign-off record; log PII scans; data-store residency audit; retention-job logs.

**Dependencies**: Operator residency requirements; classification of all data stores.

**Risks to Achievement**: PII leakage via telemetry; undocumented cross-border transfers.

---

## Goal-to-Outcome Mapping

### Outcome O-1: Verifiable standards leadership driving procurement and citation

**Supported Goals**: G-1, G-4

**Outcome Statement**: ibn-core is recognised as a reference RFC 9315 / TMF921 production implementation, evidenced by sustained 100% CTK conformance and used as a procurement qualifier by at least one Malaysian operator and as a cited artefact in Paper 1.

**Measurement Details**:

- **KPI**: Sustained CTK pass rate + count of procurement/citation references.
- **Current Value**: 100% (83/83) CTK; Paper 1 cites v2.0.1.
- **Target Value**: 100% maintained; ≥ 1 operator procurement citing conformance; citation integrity preserved.
- **Measurement Frequency**: Per release (conformance); quarterly (references).
- **Data Source**: `docs/compliance/` artefacts; procurement records; citation tags.
- **Report Owner**: Lead Architect / CTO.

**Business Value**:

- **Financial Impact**: Conformance-as-sales-asset shortens procurement; protects deal value.
- **Strategic Impact**: Reference-implementation status; defensible market position.
- **Operational Impact**: Regression-proof releases via CTK gating.
- **Customer Impact**: Operator confidence in interoperability and low lock-in.

**Timeline**:

- **Phase 1 (Q2 2026)**: CTK gating in CI; evidence pipeline operational.
- **Phase 2 (Q3 2026)**: Conformance cited in first operator procurement.
- **Phase 3 (Q4 2026)**: Sustained across all releases; citation integrity confirmed.
- **Sustainment (2027+)**: 100% maintained as standards evolve.

**Stakeholder Benefits**:

- **Lead Architect (SD-1)**: Differentiation and academic credibility realised.
- **Operator IT (SD-5)**: Verifiable, low-lock-in procurement basis.
- **Academic audience (SD-9)**: Reproducible, citable claims.

**Leading Indicators**: CTK gating active in CI; time-to-evidence < 24h.

**Lagging Indicators**: Operator procurement won citing conformance; preserved cited tags.

---

### Outcome O-2: A referenceable production operator engagement

**Supported Goals**: G-2, G-3, G-5

**Outcome Statement**: One Malaysian operator runs ibn-core in production with evidenced safety, PDPA, and NCII alignment, producing a referenceable case study that de-risks the SI sales pipeline.

**Measurement Details**:

- **KPI**: Production engagements live + steady-state O2C fulfilment rate.
- **Current Value**: 0 in production.
- **Target Value**: 1 live by Q4 2026; O2C fulfilment ≥ 99%.
- **Measurement Frequency**: Monthly during delivery; continuous in production.
- **Data Source**: Engagement gate records; production IntentReport metrics.
- **Report Owner**: SI Delivery Lead.

**Business Value**:

- **Financial Impact**: First recognised SI revenue; pipeline acceleration.
- **Strategic Impact**: Proof of the open-core-plus-private-adapter model.
- **Operational Impact**: Reusable runbooks and deployment manifests.
- **Customer Impact**: Faster, reliable O2C for end-customer enterprises (SD-6).

**Timeline**:

- **Phase 1 (Q2 2026)**: Sandbox integration + safety design sign-off.
- **Phase 2 (Q3 2026)**: DPIA + NCII attestation; pre-production validation.
- **Phase 3 (Q4 2026)**: Production go-live; steady-state metrics.
- **Sustainment (2027+)**: Second operator onboarded from the reference pattern.

**Stakeholder Benefits**:

- **SI Delivery (SD-2)** / **Commercial (SD-3)**: Referenceable revenue.
- **Operator Network Eng (SD-4)**: Safe, observed automation in production.
- **End customers (SD-6)**: Reliable O2C service.

**Leading Indicators**: Safety sign-off obtained; DPIA approved; sandbox O2C passing.

**Lagging Indicators**: Sustained production fulfilment ≥ 99%; case study published.

---

### Outcome O-3: Trusted autonomous AI operation on regulated infrastructure

**Supported Goals**: G-3, G-5

**Outcome Statement**: Autonomous AI agents operate on live operator infrastructure with full accountability, observability, and least-privilege scoping — accepted by operator network teams and demonstrable to MCMC, NACSA, and JPDP.

**Measurement Details**:

- **KPI**: % agent actions scoped + audited; regulator/operator concerns closed.
- **Current Value**: Agent role identity adopted for autonomous cycle; telemetry partial.
- **Target Value**: 100% scoped + audited; high-impact actions HITL-gated; regulator briefings accepted.
- **Measurement Frequency**: Continuous (telemetry); quarterly (regulator engagement).
- **Data Source**: OTel agent traces; authorization + audit logs; regulator correspondence.
- **Report Owner**: Vpnet Security / Compliance.

**Business Value**:

- **Financial Impact**: Unlocks operator adoption of the AI differentiator.
- **Strategic Impact**: Converts AI-native operation from risk into trust asset.
- **Operational Impact**: Black-box-free agent operations; faster incident triage.
- **Customer Impact**: Operator and regulator confidence in autonomous changes.

**Timeline**:

- **Phase 1 (Q2 2026)**: 100% scoped identity + telemetry coverage.
- **Phase 2 (Q3 2026)**: HITL on high-impact actions; regulator briefings.
- **Phase 3 (Q4 2026)**: Accepted in production go-live.
- **Sustainment (2027+)**: Continuous assurance as autonomy expands.

**Stakeholder Benefits**:

- **Operator Network Eng (SD-4)**: Provable safety and reversibility.
- **MCMC / NACSA / JPDP (SD-10/12/11)**: Auditability and accountability.
- **Vpnet Security (SD-7)**: Defensible posture.

**Leading Indicators**: 100% actions under agent role; telemetry coverage complete.

**Lagging Indicators**: Zero autonomous-action security incidents; regulator acceptance recorded.

---

### Outcome O-4: A credible, contributable open core

**Supported Goals**: G-4, G-1

**Outcome Statement**: The public framework is substantive, well-documented, and genuinely contributable — sustaining community engagement without compromising the proprietary seam or licence posture.

**Measurement Details**:

- **KPI**: Seam-leak incidents (0) + community engagement signals.
- **Current Value**: Clean seam; agent-native docs (CLAUDE.md) in place.
- **Target Value**: 0 leaks; growing external contribution / adoption signals; no licence-incompatible deps.
- **Measurement Frequency**: Per release (seam/licence); quarterly (community).
- **Data Source**: Secret scans; dependency licence checks; repo contribution metrics.
- **Report Owner**: Lead Architect / CTO.

**Business Value**:

- **Financial Impact**: Community reach amplifies lead generation at low cost.
- **Strategic Impact**: Open-core credibility avoids "open-washing" reputational risk.
- **Operational Impact**: External contributions and scrutiny improve quality.
- **Customer Impact**: Transparent licensing reduces operator lock-in fears.

**Timeline**:

- **Phase 1 (Q2 2026)**: Secret scanning + licence checks enforced in CI.
- **Phase 2 (Q3 2026)**: CONTRIBUTING + transparent seam-rationale published.
- **Phase 3 (Q4 2026)**: Demonstrated external contributions / adoption.
- **Sustainment (2027+)**: Healthy contributor base maintained.

**Stakeholder Benefits**:

- **OSS Community (SD-8)**: Genuine, contributable framework.
- **Commercial (SD-3)**: Protected adapter value.
- **Academic audience (SD-9)**: Reproducible public artefact.

**Leading Indicators**: 0 leaks per release; licence checks passing.

**Lagging Indicators**: Sustained external contributions; no open-washing criticism.

---

## Complete Traceability Matrix

### Stakeholder → Driver → Goal → Outcome

| Stakeholder | Driver ID | Driver Summary | Goal ID | Goal Summary | Outcome ID | Outcome Summary |
|-------------|-----------|----------------|---------|--------------|------------|-----------------|
| Lead Architect / CTO | SD-1 | Standards as differentiator | G-1 | Sustain TMF921 CTK 100% | O-1 | Verifiable standards leadership |
| Lead Architect / CTO | SD-1 | Standards as differentiator | G-4 | Seam integrity | O-4 | Credible open core |
| SI Delivery Lead | SD-2 | Reference engagement to prod | G-2 | First operator in production | O-2 | Referenceable engagement |
| Vpnet Commercial | SD-3 | Protect adapter value | G-4 | Seam integrity | O-4 | Credible open core |
| Operator Network Eng | SD-4 | Safe autonomous operation | G-3 | Safe, observable agents | O-3 | Trusted AI on regulated infra |
| Operator Network Eng | SD-4 | Safe autonomous operation | G-2 | First operator in production | O-2 | Referenceable engagement |
| Operator IT / Procurement | SD-5 | Standards, low lock-in, VfM | G-1 | Sustain TMF921 CTK 100% | O-1 | Verifiable standards leadership |
| Operator IT / Procurement | SD-5 | Standards, low lock-in, VfM | G-2 | First operator in production | O-2 | Referenceable engagement |
| End-Customer Enterprises | SD-6 | Fast reliable O2C | G-2 | First operator in production | O-2 | Referenceable engagement |
| Vpnet Security / Compliance | SD-7 | Defensible security posture | G-3 | Safe, observable agents | O-3 | Trusted AI on regulated infra |
| Vpnet Security / Compliance | SD-7 | Defensible security posture | G-5 | PDPA + data sovereignty | O-2 | Referenceable engagement |
| OSS Community | SD-8 | Genuinely open framework | G-4 | Seam integrity | O-4 | Credible open core |
| Academic / Standards | SD-9 | Reproducible claims | G-1 | Sustain TMF921 CTK 100% | O-1 | Verifiable standards leadership |
| MCMC | SD-10 | Telco regulatory accountability | G-3 | Safe, observable agents | O-3 | Trusted AI on regulated infra |
| JPDP | SD-11 | PDPA 2010 compliance | G-5 | PDPA + data sovereignty | O-3 | Trusted AI on regulated infra |
| NACSA | SD-12 | NCII cyber assurance | G-3 | Safe, observable agents | O-3 | Trusted AI on regulated infra |

### Conflict Analysis

**Competing Drivers**:

- **Conflict 1 — Openness vs. commercial seam**: The OSS community (SD-8) wants maximum transparency and contributable scope, while Commercial (SD-3) needs operator adapters, credentials, and pricing logic kept private. Incompatible at the extremes because revenue depends on the seam holding while credibility depends on the public core being substantive.
  - **Resolution Strategy**: Hold a principled, published boundary — the `McpAdapter` interface and a mock adapter are public; production adapters and credentials are private — and document the rationale transparently so the community sees a clean line, not open-washing. Invest in making the public framework genuinely substantive (G-4 / O-4).

- **Conflict 2 — AI autonomy vs. regulator/operator risk appetite**: Vpnet's AI-native differentiator (SD-1 strategic value, fast autonomous operation) collides with operator network teams' (SD-4) and regulators' (SD-10/12) caution about autonomous changes to live national infrastructure.
  - **Resolution Strategy**: Phase autonomy by blast radius — start with read/assessment and low-impact actions fully autonomous, gate high-impact actions through human-in-the-loop, and make every action scoped, observable, and reversible (G-3 / O-3). Earn expanded autonomy with evidenced safety, not assertion.

- **Conflict 3 — Speed-to-production vs. compliance depth**: SI Delivery (SD-2) and Commercial (SD-3) want the first operator live quickly; Security/Compliance (SD-7) and regulators (SD-11/12) require DPIA, NCII, and safety evidence first.
  - **Resolution Strategy**: Treat the compliance and safety gates as the definition of "done" for go-live (built into G-2), not as a parallel track — sequencing sandbox proof, then evidence, then production, so speed is achieved within the gates rather than around them.

**Synergies**:

- **Synergy 1**: Standards conformance (SD-1) aligns with operator procurement (SD-5) and academic citation (SD-9) — a single investment in CTK conformance and evidence (G-1) satisfies all three at once.
- **Synergy 2**: Agent observability (SD-4) aligns with security posture (SD-7) and all three regulators (SD-10/11/12) — the same telemetry, identity scoping, and audit trail (G-3) is the evidence each party needs.
- **Synergy 3**: A clean open-core seam (SD-3) and genuine openness (SD-8) both depend on the same disciplined boundary (G-4); done well, commercial protection and community credibility reinforce rather than oppose each other.

---

## Communication & Engagement Plan

### Stakeholder-Specific Messaging

#### Operator Network Engineering (U Mobile, TM Malaysia)

**Primary Message**: Autonomous intent automation that you can trust on live infrastructure — every agent action is scoped, observable, reversible, and human-gated where it matters.

**Key Talking Points**:

- Agent actions run under a dedicated least-privilege identity, never admin/human credentials.
- Full telemetry of agent reasoning, tool calls, and RFC 9315 phase transitions — no black box.
- Circuit breakers, degraded-mode behaviour, and rollback paths for resilience.

**Communication Frequency**: Bi-weekly during delivery; joint design reviews at each phase gate.

**Preferred Channel**: Joint technical reviews; live telemetry dashboards.

**Success Story**: "Safety sign-off achieved; O2C intents fulfilling reliably in production with full audit trail."

#### Operator IT / Procurement

**Primary Message**: A standards-conformant, Apache-2.0-cored platform that minimises lock-in and is procurement-defensible on verifiable conformance.

**Key Talking Points**:

- 100% TMF921 CTK conformance with published, dated evidence.
- Loose coupling via TM Forum Open APIs; no hidden proprietary dependencies in the core.
- Transparent commercial model: open core plus contracted operator adapters.

**Communication Frequency**: At commercial checkpoints and phase gates.

**Preferred Channel**: Conformance evidence packs; commercial reviews.

**Success Story**: "Procurement qualified ibn-core on verifiable conformance and low lock-in."

#### MCMC / JPDP / NACSA (Regulators)

**Primary Message**: AI-driven network operation that remains accountable, auditable, data-protection-compliant, and cyber-resilient on critical national infrastructure.

**Key Talking Points**:

- Complete, attributable audit trails for every autonomous action (MCMC).
- PDPA 2010 alignment: PII masking, residency, retention, maintained DPIA (JPDP).
- Defence-in-depth, dependency/code scanning, incident response, constrained agent privilege (NACSA).

**Communication Frequency**: At go-live milestones and on request; quarterly thereafter.

**Preferred Channel**: Evidence-backed regulatory briefings and attestations.

**Success Story**: "Regulators satisfied that autonomous operation is accountable, compliant, and resilient."

#### Open-Source Community & Contributors

**Primary Message**: A genuinely open, agent-native RFC 9315 framework — substantive, documented, and contributable, with a transparent line on what stays private and why.

**Key Talking Points**:

- Substantive public framework and the published `McpAdapter` seam.
- Context-first docs (CLAUDE.md, roadmap, compliance evidence) for fast onboarding.
- Clear, honest rationale for the open-core boundary — no open-washing.

**Communication Frequency**: Per release; ongoing via issues/PRs.

**Preferred Channel**: GitHub (releases, CONTRIBUTING, discussions).

**Success Story**: "External contributions merged; the public core is recognised as genuinely useful, not a shell."

#### Vpnet Internal (Commercial, Security, Finance, Engineering)

**Primary Message**: Disciplined execution of the open-core model — protect the seam, evidence conformance and compliance, manage AI-inference cost, and deliver the reference engagement.

**Key Talking Points**:

- Seam integrity is non-negotiable and revenue-protecting.
- Conformance and compliance evidence are sales assets, not overhead.
- AI-cost-per-intent is a first-class efficiency metric.

**Communication Frequency**: Weekly (delivery/engineering); monthly (commercial/finance).

**Preferred Channel**: Internal reviews; ADRs; dashboards.

**Success Story**: "Reference engagement delivered on margin with the seam intact."

---

## Change Impact Assessment

### Impact on Stakeholders

| Stakeholder | Current State | Future State | Change Magnitude | Resistance Risk | Mitigation Strategy |
|-------------|---------------|--------------|------------------|-----------------|---------------------|
| Operator Network Eng | Manual / scripted network ops | Intent-based with scoped autonomous agents | HIGH | HIGH | Phased autonomy by blast radius; full observability; HITL on high-impact actions |
| Operator IT / Procurement | Proprietary OSS/BSS tooling | Standards-based, low-lock-in platform | MEDIUM | MEDIUM | Conformance evidence; transparent licensing; VfM case |
| End-Customer Enterprises | Slower, manual service ordering | Fast self-service O2C fulfilment | MEDIUM | LOW | Reliable fulfilment + clear status reporting |
| Vpnet Engineering | Mixed public/private discipline | Strict seam + conformance gating | MEDIUM | LOW | CI gating, secret scanning, ADR discipline |
| Regulators (MCMC/JPDP/NACSA) | Limited exposure to autonomous network AI | Auditable, compliant autonomous operation | HIGH | MEDIUM | Proactive evidence-backed briefings; attestations |
| OSS Community | Observing a young open-core repo | Active contribution to a credible core | LOW | LOW | Substantive public surface; transparent boundary rationale |

### Change Readiness

**Champions** (Enthusiastic supporters):

- Lead Architect / CTO — owns the vision and standards differentiation.
- SI Delivery Lead — direct beneficiary of a referenceable production engagement.

**Fence-sitters** (Neutral, need convincing):

- Operator IT / Procurement — convinced by verifiable conformance and VfM evidence.
- OSS Community — convinced by a substantive, genuinely open public core.
- Regulators (MCMC/JPDP/NACSA) — convinced by auditability and compliance evidence.

**Resisters** (Opposed or skeptical):

- Operator Network Engineering — institutionally cautious about autonomous changes to live infrastructure. Strategy: phased autonomy, full observability, reversibility, and HITL — earn trust with evidence, never assertion.

---

## Risk Register (Stakeholder-Related)

### Risk R-1: Operator network teams reject autonomous operation

**Related Stakeholders**: Operator Network Engineering, MCMC, NACSA.

**Risk Description**: Network teams or regulators judge autonomous AI changes to live infrastructure too risky, blocking or de-scoping autonomy.

**Impact on Goals**: G-2, G-3.

**Probability**: MEDIUM

**Impact**: HIGH

**Mitigation Strategy**: Phase autonomy by blast radius; scoped agent identity; full telemetry; HITL on high-impact actions; reversibility and circuit breakers (G-3).

**Contingency Plan**: Ship in assist/advisory mode (human executes agent recommendations) and expand autonomy as evidence accrues.

---

### Risk R-2: Proprietary logic or credentials leak into the public repo

**Related Stakeholders**: Vpnet Commercial, Vpnet Security, OSS Community.

**Risk Description**: Operator credentials or proprietary adapter logic accidentally committed to the public Apache-2.0 repo, damaging commercial value and trust.

**Impact on Goals**: G-4.

**Probability**: LOW

**Impact**: HIGH

**Mitigation Strategy**: Secret scanning in CI; pre-commit hooks; strict cross-seam PR review; private-repo isolation of adapters (G-4).

**Contingency Plan**: Immediate rotation of exposed credentials; history scrub; incident review and tightened controls.

---

### Risk R-3: Conformance regression undermines differentiation and citations

**Related Stakeholders**: Lead Architect, Operator IT, Academic audience.

**Risk Description**: A release silently regresses TMF921 CTK conformance, eroding the core value proposition and citation integrity.

**Impact on Goals**: G-1.

**Probability**: MEDIUM

**Impact**: HIGH

**Mitigation Strategy**: CTK gating in CI; conformance evidence within 24h of release; never rewrite cited tags (G-1).

**Contingency Plan**: Block release on regression; hotfix and re-run CTK before any tag is published.

---

### Risk R-4: PDPA / data-sovereignty breach via PII leakage

**Related Stakeholders**: JPDP, Vpnet Security, Operator IT.

**Risk Description**: Subscriber PII leaks through logs/telemetry or via undocumented cross-border transfer, breaching PDPA 2010.

**Impact on Goals**: G-5, G-2.

**Probability**: LOW

**Impact**: HIGH

**Mitigation Strategy**: PII masking; residency-conformant stores; automated retention/deletion; maintained DPIA; PII log scans (G-5).

**Contingency Plan**: PDPA breach-response process; regulator notification; remediation and DPIA update.

---

### Risk R-5: Open-washing perception damages community credibility

**Related Stakeholders**: OSS Community, Academic audience, Vpnet Commercial.

**Risk Description**: The community perceives the public core as a thin shell around closed value, eroding adoption and academic credibility.

**Impact on Goals**: G-4, G-1.

**Probability**: MEDIUM

**Impact**: MEDIUM

**Mitigation Strategy**: Keep the public framework substantive; publish transparent rationale for the seam boundary; welcome contributions (G-4 / O-4).

**Contingency Plan**: Engage community directly; re-evaluate what can be moved into the public core without harming the commercial model.

---

## Governance & Decision Rights

### Decision Authority Matrix (RACI)

| Decision Type | Responsible | Accountable | Consulted | Informed |
|---------------|-------------|-------------|-----------|----------|
| Standards/conformance scope (RFC 9315 / TMF921) | Engineering Lead | Lead Architect / CTO | Operator IT, Academic audience | OSS Community |
| Open-core / private seam boundary | Lead Architect | Lead Architect / CTO | Commercial, Security | OSS Community, Engineering |
| Agent autonomy level (blast-radius gating) | Security / Compliance | Lead Architect / CTO | Operator Network Eng, Regulators | SI Delivery |
| Operator go-live (production sign-off) | SI Delivery Lead | Lead Architect / CTO | Operator Network Eng, Security, Operator IT | Commercial, Finance |
| Data-protection / PDPA decisions | Security / Compliance | Lead Architect / CTO | JPDP, Operator IT | SI Delivery |
| Dependency / licence approval | Engineering Lead | Lead Architect / CTO | Security | OSS Community |
| Commercial terms & pricing | Commercial Lead | Lead Architect / CTO | Finance | SI Delivery |

### Escalation Path

1. **Level 1**: SI Delivery Lead / Engineering Lead — day-to-day delivery, technical, and seam decisions.
2. **Level 2**: Vpnet Architecture Review Board — scope, autonomy level, compliance gates, exceptions.
3. **Level 3**: Lead Architect / CTO — non-negotiable principles (standards conformance, security, seam integrity), regulatory posture, strategic conflicts.

---

## Validation & Sign-off

### Stakeholder Review

| Stakeholder | Review Date | Comments | Status |
|-------------|-------------|----------|--------|
| Lead Architect / CTO | PENDING | — | CHANGES_REQUESTED |
| SI Delivery Lead | PENDING | — | CHANGES_REQUESTED |
| Vpnet Security / Compliance | PENDING | — | CHANGES_REQUESTED |

### Document Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Executive Sponsor / CTO | Roland Pfeifer | | |
| SI Delivery Lead | PENDING | | |
| Security / Compliance Lead | PENDING | | |

---

## Appendices

### Appendix A: Stakeholder Interview Summaries

> No primary stakeholder interviews were conducted for this initial version. Drivers were derived from the programme's architecture principles (ARC-000-PRIN-v1.0), the project context (CLAUDE.md), the open-core commercial model, and the Malaysian telecom regulatory landscape. Interview summaries will be added as engagements progress.

### Appendix B: Survey Results

> No stakeholder surveys conducted for v1.0. Consultation method for this iteration was document-based analysis (architecture principles and project context). Surveys with operator and community stakeholders are recommended for v1.1.

### Appendix C: References

- ARC-000-PRIN-v1.0 — ibn-core Enterprise Architecture Principles (Vpnet Cloud Solutions).
- CLAUDE.md — ibn-core project context and open-core governance rules.
- RFC 9315 — Intent-Based Networking Concepts and Definitions (IRTF NMRG), DOI 10.17487/RFC9315.
- TMF921 Intent Management API v5.0.0 (TM Forum).
- Paper 1 — R. Pfeifer, "ibn-core: RFC 9315 Intent-Based Networking Production Implementation," 2026.

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | 2026-06-05 | ArcKit AI | Initial draft |
| 1.0 | 2026-06-05 | ArcKit AI | Approved version |

## External References

> This section provides traceability from generated content back to source documents.
> Follow citation instructions in the project's citation reference guide.

### Document Register

| Doc ID | Filename | Type | Source Location | Description |
|--------|----------|------|-----------------|-------------|
| *None provided* | — | — | — | — |

### Citations

| Citation ID | Doc ID | Page/Section | Category | Quoted Passage |
|-------------|--------|--------------|----------|----------------|
| — | — | — | — | — |

### Unreferenced Documents

| Filename | Source Location | Reason |
|----------|-----------------|--------|
| — | — | — |

---

**Generated by**: ArcKit `/arckit:stakeholders` command
**Generated on**: 2026-06-05
**ArcKit Version**: 5.11.0
**Project**: ibn-core-my (Project 001)
**Model**: Claude Opus 4.8 (1M context)
