# Coral Gardeners strategy meeting

Date: 2026-08-04
Participants: Adrian Stier; Hannah Stewart, Science Officer, Coral Gardeners
Context: RSE-Moorea collaboration scoping meeting
Source: Otter.ai transcript exported from `Coral Restoration Strategy Meeting.mp3`
Raw transcript: [2026-08-04-coral-gardeners-strategy-meeting-transcript.txt](2026-08-04-coral-gardeners-strategy-meeting-transcript.txt)
Nursery analysis design: [nursery-performance-analysis-design.md](nursery-performance-analysis-design.md)
Figure asset provenance: [assets/icons/README.md](assets/icons/README.md)

## Summary

This was a scoping call about how RSE-Moorea could help Coral Gardeners turn their existing monitoring into better restoration decisions. The current collaboration focus is three linked analytical tracks: ROI/KPI framing for the restoration system, nursery performance analysis, and outplant modeling using imperfect provenance data.

The nursery analysis is the most immediate technical opportunity, especially the most complete Moorea records. The goal is to ask how coral growth, health, bleaching, and mortality vary with genotype, parent colony, nursery age, size, site, and local neighborhood. That analysis could eventually support simple operational rules for which corals or ropes should be grown longer, moved sooner, or outplanted into particular restoration contexts.

A second analysis track is to use imperfect provenance from parent colonies, ropes, cells, and restoration areas to connect nursery performance to aggregate outplant outcomes. Coral Gardeners does not follow each individual coral after outplanting, but the transcript makes clear that there is still useful information about what went where. The goal would be to model live coral cover, survival, bleaching, replacement needs, and restoration trajectories without pretending the individual-level data are complete.

The ROI/KPI track is the broader system-level frame. The aim is to help Coral Gardeners move away from coral-count reporting toward ecological success metrics: live coral cover after one to three years, structural complexity, biodiversity or functional community recovery, restoration resilience, and return on restoration investment. Related questions include which metrics should feed the reef health index, which monitoring streams can be reduced, and how to report restoration success in ways that are useful internally and credible externally.

## Purpose

This meeting scoped possible collaborations between Adrian Stier/RSE-Moorea and Coral Gardeners. The discussion focused on how Coral Gardeners currently collects nursery, outplant, restoration-site, control-site, and biodiversity data; where those data are strong enough for near-term analysis; and how those data could support restoration decisions and ROI/KPI reporting.

## What we were trying to accomplish

- Map Coral Gardeners' data stream from mother-colony collection, wound follow-up, nursery monitoring, outplanting, and restoration/control/reference-site monitoring.
- Identify the strongest near-term analysis, likely starting with the longer and higher-frequency nursery records from the most complete Moorea site.
- Turn existing monitoring data into operational decision support: which parent colonies, genotypes, sizes, ages, and neighborhood combinations should be grown, retained, and outplanted where.
- Frame outplant analyses around imperfect but useful provenance, because individual outplants are not followed after deployment but parent colonies, ropes, cells, and restoration areas are often known.
- Separate ecological success metrics from donor-facing coral counts, and define better reporting around live coral cover, structural complexity, biodiversity, survival, and return on restoration investment.
- Decide what monitoring can eventually be reduced or replaced while still supporting credible ROI/KPI and reef-health reporting.

## Main takeaways

Coral Gardeners is moving from coral-count metrics toward ecosystem-level restoration metrics. Hannah emphasized that "number of corals planted" is mainly a measure of work or throughput, not restoration success. The more meaningful outcomes are likely live coral cover, survival through one to three years, structural complexity, and biodiversity/functional community metrics.

The nursery data may be the most immediately analyzable dataset. Nursery monitoring includes mother-colony identity, fragment batches/ropes, size measurements for a monitored subset, health and bleaching scores, mortality, and flags for issues such as algae, sediment, snails, fish, and disease. Monitoring frequency is relatively high compared with outplant monitoring, which makes nursery growth and survival a promising starting point.

The nursery workstream is not mainly about testing nursery infrastructure. Coral Gardeners is already comparing wire versus rope separately. For this collaboration, nursery infrastructure matters as context or a covariate, while the main analytical questions are coral performance by genotype, parent colony, age, size, neighborhood, and site.

Outplant data are more aggregate and are in transition. Coral Gardeners generally knows which corals/ropes go into each outplant cell or restoration area, but they do not track individual colonies once outplanted. Current outplant metrics include annual estimates of live coral cover, survival of outplants, bleaching status, and restoration versus control areas. The team is shifting toward video-based benthic monitoring and automated analysis.

Coral Gardeners is designing a reef health index built from biodiversity, structural, and functional components. Hannah's working principle is that if Coral Gardeners collects a metric, it should feed the reef health index; otherwise the team should question whether the metric is necessary. Current weights are even until enough data exist to estimate or justify different weights.

Restoration practice has already changed based on evidence and judgment. Hannah stopped an earlier experiment comparing whole colonies, partial colonies, and small fragments because small fragments were being heavily grazed and the result was lopsided enough that continuing felt irresponsible. Coral Gardeners now emphasizes larger, more intact outplants and maintains restoration areas by removing dead corals/algae, filling back to target live coral cover, and expanding only when surplus coral is available.

The current collaboration focus is analytical rather than a new nursery-infrastructure experiment. The key tradeoff is donor/adopter demand for large coral numbers versus ecological outcomes that actually persist. Species/genus, outplant size, density, nursery residence time, habitat complexity, and neighborhood composition may all matter, but the near-term task is to learn what the existing data can already say.

Hannah is aiming for a portable, mechanistic restoration framework that can work across Coral Gardeners sites. The transcript frames reefs as different in details but potentially similar in the mechanisms that support habitat-forming communities: live cover, structure, biodiversity, function, and resilience.

## Current collaboration workstreams

1. Nursery performance analysis

   Use the existing nursery dataset to quantify growth, health, bleaching, and mortality patterns across mother colonies, genotypes, species/genera, nursery structures, cohorts, neighborhoods, and time. The most complete Moorea nursery dataset was identified as the likely starting point, pending confirmation of site names and database completeness. Near-term questions:

   - Which mother colonies or taxa grow fastest or survive best in the nursery?
   - How does nursery coral growth vary as a function of genotype, parent colony, and local neighborhood?
   - How much variation exists among parent colonies after accounting for site, cohort, and monitoring interval?
   - Do nearby nursery neighbors affect growth, condition, competition, or mortality?
   - Does nursery residence time affect survival or condition, especially for corals that become large and begin dying in the center?
   - Are there warning signs in nursery condition scores, bleaching scores, or issue flags that predict mortality or poor outplant readiness?
   - Can nursery records eventually support simple placement rules or algorithms for gardeners, such as which rope or batch should be outplanted to which restoration area?

2. Outplant success from imperfect provenance

   Even though individuals are not followed after outplanting, Coral Gardeners often knows which ropes or parent-colony batches went into each cell or area. That imperfect provenance could still support aggregate models:

   - Link parent-colony and nursery performance to cell-level or area-level live coral cover, survival, and bleaching outcomes.
   - Estimate whether some taxa or parent colonies contribute disproportionately to successful restoration outcomes.
   - Ask whether outplant composition, density, or taxonomic/morphological mix predicts later live coral cover.
   - Test whether pre-outplant condition, size/volume, symbiont status, or nursery history predicts later aggregate restoration outcomes.
   - Evaluate whether 2024 bleaching outcomes support the hypothesis that restored reef areas can be more resilient than artificial nursery structures.
   - Treat uncertainty explicitly rather than requiring perfect individual tracking.

3. ROI/KPI system and monitoring-effort reduction

   Help evaluate which monitoring streams are redundant and which are essential for the reef health index and internal ROI/KPI reporting. Candidate analyses:

   - Compare traditional transects, video-derived benthic cover, fish-video metrics, bioacoustics, and eDNA as indicators of ecosystem state.
   - Identify the minimum sampling needed to estimate restoration outcomes with useful confidence.
   - Test whether low-cost/high-throughput metrics predict the more labor-intensive metrics well enough to replace or downsample them.
   - Explore whether index weights can be learned from outcomes rather than fixed evenly.
   - Connect reef health metrics to internal KPIs or return-on-investment summaries: how efficiently different restoration strategies turn money and effort into live cover, complexity, biodiversity, and survival.

## Other experiment discussed

Hannah also raised a possible wound-healing treatment comparison. This is not part of the current three-track collaboration focus, but it should stay in the notes as a possible later experiment. Coral Gardeners is already handling the nursery-infrastructure comparison separately, so this would be a wound-treatment contrast rather than a wire-versus-rope experiment. Candidate treatments discussed:

- Concrete.
- Apoxie Sculpt epoxy.
- A Scripps/Hybrid Reefs biomaterial candidate, potentially Wangpraseurt/Hybrid Reefs CoralGuard if Hannah confirms that is the material.
- Naked/open wound control.

The practical question is whether any treatment improves wound healing enough to justify the added cost and handling time. CoralGuard may be the wrong experimental arm if it is primarily a plug/tile, larval-settlement, or fragment-fusion material rather than a direct wound-cover material. If so, it should be shifted into a separate substrate/fusion experiment rather than forced into the wound-healing comparison.

Epoxy product to include in the treatment notes: [Aves Apoxie Sculpt - 2 Part Modeling Compound (A & B), 1 Pound, White/Stone White](https://www.amazon.com/Apoxie-Sculpt-White-modeling-compound/dp/B0013UDWXI). Adrian noted that this is the epoxy currently used.

## Transcript cross-reference

Use these timestamps to cross-check the notes against the Otter transcript. Line numbers refer to the saved raw transcript file in this folder.

- Mother-colony health scoring, wound photos, follow-up intervals, tags, nursery seeding, nursery measurements, bleaching monitoring, issue flags, associates, and monitoring fractions: `00:00-04:02`, transcript lines 1-20.
- Outplant records, pre-outplant size/condition, cell-level monitoring, annual survival/cover estimates, video/photogrammetry transition, fish video, bioacoustics, eDNA, traditional transects, recruitment, and invertebrates: `04:02-10:50`, transcript lines 19-35.
- Earlier whole-colony/partial-colony/fragment experiment, shift away from small fragments, restoration/control/reference-site design, Moorea site structure, complexity targets, and reef health index components/weights: `11:21-16:02`, transcript lines 46-83.
- Restoration maintenance, target live coral cover, nursery residence time, throughput/adoption pressure, older nursery corals declining, 2024 bleaching contrast between nurseries and restoration sites, and mechanistic cross-site framework: `16:13-20:28`, transcript lines 88-131.
- Genotype, parent-colony, species/genera, nursery growth/survival, imperfect provenance, cell-level aggregate outcomes, neighborhood effects, and data-readiness limits: `21:17-26:43`, transcript lines 136-164.
- Outplant size/density tradeoffs, species-specific palatability or competition, donor-number constraints, fragment equivalents, and redefining scale beyond coral counts: `26:49-34:31`, transcript lines 166-206.
- ROI/KPI framing and reducing monitoring effort to the minimum necessary set of metrics: `34:49-36:34`, transcript lines 208-212.
- One-page follow-up document, modeling/data workstream, wound experiment, research nursery option, wire-versus-rope context, and cost/time calculation for wound treatments: `36:42-38:34`, transcript lines 226-260.

## Data mentioned

- Mother-colony sampling records with health and bleaching scores.
- Before/after photos of sampled mother-colony wounds, with follow-up photos at roughly 3, 6, 9, and 12 months when colonies can be relocated.
- Mother-colony tags, habitat photos, and possible year-color tag schemes to improve relocation and decide when a colony is considered healed or no longer monitored.
- Nursery records with mother-colony identity, rope or batch structure, dimensions for a monitored subset, health score, bleaching score, mortality, and issue flags.
- Nursery context including the ongoing wire-versus-rope infrastructure transition, fragment counts per parent colony, and variable monitoring fractions across years.
- Bleaching-season nursery monitoring every two weeks once conditions become hot.
- Outplant records linking corals/ropes to cells or restoration areas, with pre-outplant size/condition, calculated volume, symbiont status, and annual post-outplant survival/cover estimates.
- Restoration, control, and reference sites for each island or location where feasible.
- Annual restoration maintenance records or observations: remove dead corals/algae, refill to target live coral cover, then expand if extra coral is available.
- Video or photogrammetry data for benthic cover and structural complexity, with the analysis pipeline still being developed.
- Fish community video data, historically from custom stereoscopic cameras and potentially from GoPros plus an AI identification pipeline.
- Bioacoustic recordings, including work with Conservation Metrics.
- Potential eDNA sampling as a community-level biodiversity metric.
- Traditional fish transects, benthic photos, recruit counts, possible recruitment tiles, and key-invertebrate observations that may eventually be replaced or reduced.

## Action items

- Adrian: draft a one-page Google Doc summarizing the three current collaboration tracks and proposed next steps.
- Hannah: review and edit the one-pager, especially to confirm which questions match Coral Gardeners' priorities and data reality.
- Coral Gardeners/RSE-Moorea: confirm the current database schema, monitoring fractions, site names, taxonomic names, and which datasets are complete enough for immediate analysis.
- Coral Gardeners/RSE-Moorea: assess whether the nursery data can support genotype-, parent-colony-, and neighborhood-level growth models.
- Coral Gardeners/RSE-Moorea: identify the most complete Moorea nursery and restoration datasets for a first-pass analysis.
- Coral Gardeners/RSE-Moorea: assess which provenance fields can link parent colonies, ropes, cells, restoration areas, and aggregate outplant outcomes.
- Coral Gardeners/RSE-Moorea: define candidate ecological success and KPI/ROI metrics that can replace or contextualize coral-count reporting.

## Transcript cleanup needed

The raw transcript is usable but contains Otter.ai errors. Items to verify before quoting externally:

- Site names in Moorea and other Coral Gardeners locations.
- Species/genera mentioned in the size, density, and competition discussion.
- Exact nursery monitoring fractions: 10%, 20%, or both depending on metric and year.
- Exact issue-flag vocabulary in the nursery app/database.
- Names of collaborators, companies, and technical partners.

## Full transcript status

The full Otter.ai transcript is preserved as a separate text file in this folder. For analysis or manuscript-style notes, use the raw transcript as the provenance record and this Markdown file as the scoping summary.
