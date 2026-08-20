# Coral Gardeners data inventory

Source: 2026-08-04 Coral Gardeners strategy meeting with Adrian Stier and Hannah Stewart.

Related files:

- [Meeting notes](2026-08-04-coral-gardeners-strategy-meeting.md)
- [Raw Otter transcript](2026-08-04-coral-gardeners-strategy-meeting-transcript.txt)
- [Nursery performance analysis design](nursery-performance-analysis-design.md)
- [Nursery performance analysis figure](nursery-performance-analysis-figure.svg)
- [Nursery fragment wound-treatment experiment design](wound-treatment-experiment-design.md)
- [Nursery fragment wound-treatment experiment plan](wound-treatment-experiment-plan.md)
- [Curated vector icon sources](assets/icons/README.md)
- [Vector icon preview sheet](wound-treatment-icon-options.png)

## Current collaboration focus

The current RSE-Moorea/Coral Gardeners collaboration is focused on three analytical tracks:

1. ROI/KPI framing for the restoration system.
2. Nursery performance analysis.
3. Outplant modeling using imperfect provenance data.

Coral Gardeners also collects or is developing several broader biodiversity, environmental, and experimental data streams. Those are listed here because they affect interpretation and may become useful covariates, but not all of them are part of the current collaboration scope.

## Data system overview

The data stream described in the meeting follows corals from source colony to nursery to outplant site, then shifts from individual coral tracking to aggregate ecosystem monitoring.

1. Mother/source colony is sampled.
2. The sampling wound is photographed and sometimes revisited.
3. Fragments are assigned to nursery structures, historically plastic rope and now moving toward wire.
4. Nursery corals are monitored for size, health, bleaching, mortality, and issue flags.
5. Before outplanting, nursery corals are measured or scored so Coral Gardeners knows size/volume and condition.
6. Outplants are assigned to cells, bommies, or restoration areas, but individual fragments are not followed after deployment.
7. Restoration areas are monitored annually for live coral cover, survival, bleaching, and restoration trajectory.
8. Broader ecosystem data, including benthic cover, complexity, fish, sound, eDNA, recruits, invertebrates, and environmental sensors, feed or may feed the reef health index.

The strongest near-term quantitative dataset appears to be the nursery data, especially the most complete Moorea site records. The outplant data are useful but require models that respect imperfect provenance and aggregate outcomes.

## 1. Mother-colony and collection data

**What they have or are collecting**

- Mother/source colony identity for collected fragments.
- Health score on a 1-5 scale, where 1 is best and 5 is unhealthy.
- Bleaching score, apparently also on a 1-5 or similar ordinal scale.
- Photographs of the collection area before and after sampling.
- Habitat photographs to help relocate colonies.
- Tags or markers for colonies that can likely be found again.
- Possible annual tag-color scheme by collection year.
- Fragment counts collected per parent colony.
- Species, genus, genotype, or parent-colony identifiers, at least for some corals.

**Cadence/resolution**

- Initial source-colony score and photographs at collection.
- Wound follow-up photographs at roughly 3, 6, 9, and 12 months where colonies can be relocated.
- Longer-term monitoring may stop after a wound is judged healed, or shift to annual checks.

**Known limitations**

- Some mother colonies are hard to relocate.
- The definition of "healed" is not yet fully standardized.
- It is unclear from the transcript which source-colony fields are complete across years and sites.
- Taxonomic and genotype fields need database confirmation.

**Potential use**

- Parent-colony/genotype effects in nursery growth and survival models.
- Source-colony covariates for outplant performance.
- Wound-healing status as a possible later experimental or operational outcome.

## 2. Nursery inventory and structure data

**What they have or are collecting**

- Nursery location/site.
- Mother-colony identity for nursery fragments.
- Rope, wire, batch, or nursery-structure assignment.
- Fragment counts per parent colony and per rope/structure.
- Historical rope design and ongoing transition to wire.
- Approximate standardization toward 20 fragments per collected colony, apparently split as 10 and 10 across structures, though historical records may include 12, 13, 25, or other counts.
- T0 or near-T0 monitoring after nursery seeding. Hannah noted that T0 is not always true T0 because seeding a whole nursery can take months.

**Cadence/resolution**

- Structure-, rope-, batch-, and measured-subset records exist, but persistent individual-fragment tracking is limited or absent and needs confirmation.
- Some monitoring is full monitoring, some is lower-intensity state monitoring.

**Known limitations**

- Nursery infrastructure is changing over time, so rope/wire should be treated as a covariate or cohort effect.
- Historical structure sizes and fragment counts may not be standardized.
- The transcript says Coral Gardeners does not follow individuals in the nursery in the way an individual longitudinal growth study would.
- Some new app/database fields have had implementation issues, with temporary spreadsheet workarounds and possible data loss.

**Potential use**

- Nursery performance models by parent colony, genotype, site, cohort, structure type, and neighborhood.
- Operational placement algorithms, for example which rope or batch should move to which outplant area.
- Distinguishing biological performance from nursery-infrastructure or cohort effects.

## 3. Nursery growth, health, bleaching, and mortality monitoring

**What they have or are collecting**

- Length, width, and height for measured nursery corals.
- Derived volume or size proxies, if calculated from dimensions.
- Health state/score.
- Bleaching score.
- Dead/alive status.
- Issue flags explaining reduced condition, including algae, sediment, fish, snails, disease, and mortality.
- Crab or fish associates, recorded to understand at what coral size associates appear in the nursery.
- Top-down photographs for a subset of nursery corals.
- Top photographs and measurements are not collected for every coral.

**Cadence/resolution**

- Full nursery monitoring at approximately 3, 6, 9, and 12 months.
- Bleaching-season monitoring every two weeks once conditions get hot.
- Exact monitoring fractions are uncertain: Hannah mentioned 10% photographed or measured and 20% monitored at some level, but said this needs checking.

**Known limitations**

- Not all corals are measured.
- Not all corals are photographed.
- The 10% versus 20% monitoring fractions may vary by metric, year, or database version.
- Exact issue-flag vocabulary needs confirmation from the app/database.

**Potential use**

- Growth and survival models across genotype, parent colony, species/genus, site, cohort, size, and nursery age.
- Bleaching-response models during hot periods.
- Early-warning models: whether issue flags, bleaching scores, health scores, or associates predict mortality or outplant readiness.
- Neighborhood models: whether nearby corals affect growth, condition, competition, or survival.
- Decisions about nursery residence time, especially if larger or older nursery corals begin dying in the center.

## 4. Pre-outplant condition data

**What they have or are collecting**

- Monitoring immediately before outplanting.
- Size measurements sufficient to calculate volume.
- Health state.
- Bleaching state.
- Symbiont status.
- Outplant readiness screening: unhealthy corals are not intended to be outplanted.

**Cadence/resolution**

- Collected before outplanting events.
- Likely linked to nursery rope/batch and parent colony, but individual linkage after outplanting ends.

**Known limitations**

- Need to confirm whether pre-outplant records link consistently to parent colony, genotype, rope, outplant cell, and restoration area.
- Individual coral IDs may not persist after outplanting.

**Potential use**

- Predicting aggregate outplant success from pre-outplant size, volume, health, bleaching, symbiont status, and nursery history.
- Estimating whether larger, healthier, or younger corals generate better ROI per unit effort.

## 5. Outplant placement and provenance data

**What they have or are collecting**

- General location of outplanted corals.
- Cell, bommie, or restoration-area assignment.
- Rope or batch assignment to outplant cells/areas.
- Rules intended to avoid putting too many fragments from the same rope on one bommie/cell; Hannah mentioned trying not to put more than three from a rope on one unit.
- Restoration area versus control area designation.
- Reference-site designation where feasible.

**Cadence/resolution**

- Placement recorded at outplanting.
- Individual corals are not followed after deployment.
- Current cell-based systems may change as video-based area monitoring improves.

**Known limitations**

- Provenance is imperfect: Coral Gardeners may know which parent colonies or ropes went into a cell or area, but not which exact individual survived.
- Cell definitions may differ across sites because some places have bommies and others have reef areas rather than discrete bommies.
- The team is transitioning away from cell-level work if automated video analysis can monitor areas directly.

**Potential use**

- Aggregate models linking nursery inputs to restoration-area outputs.
- Multiple-instance or mixture models: parent colonies/ropes/genotypes are treated as contributors to cell- or area-level outcomes.
- Estimating which outplant compositions, sizes, or nursery histories are associated with better live cover, survival, or lower replacement needs.

## 6. Outplant and restoration outcome data

**What they have or are collecting**

- Percent coral cover.
- Percent live coral cover.
- Survival of outplanted corals, currently estimated at aggregate scales.
- Bleaching status.
- Two-gardener visual estimates for some current placeholder metrics.
- Annual restoration monitoring.
- Before-outplant and after-outplant measurements within a yearly monitoring cycle.
- One-, two-, and three-year post-outplant success are the key horizons Hannah mentioned as meaningful.

**Cadence/resolution**

- Annual outplant/restoration monitoring for live cover, coral cover, survival, and bleaching.
- Fish monitoring may become quarterly.
- Benthic cover could be measured more often if video tools become efficient, though Hannah noted benthic cover does not change very fast.

**Known limitations**

- Placeholder estimates are currently visual and observer-based.
- The photogrammetry pipeline did not work as intended for earlier individual bommie monitoring.
- Automated video analysis is under development and not fully operational.
- Outplant data are less complete than nursery data.

**Potential use**

- Main response variables for imperfect-provenance outplant modeling.
- ROI/KPI outcomes: live cover, survival, bleaching resilience, replacement needs, and trajectory over one to three years.
- Testing whether restored reef areas perform better than nursery structures during bleaching events.

## 7. Restoration maintenance and expansion data

**What they have or are collecting**

- Annual removal of dead corals from restoration areas.
- Algal cleanup or removal.
- Re-filling restored areas to target live coral cover.
- Expansion into new area when extra corals are available.
- Target of maintaining approximately 50% live coral cover in restoration areas.

**Cadence/resolution**

- Tied to annual restoration monitoring and outplanting.

**Known limitations**

- The transcript does not specify whether maintenance actions are formal database fields or operational observations.
- Replacement/fill-in effort may need to be reconstructed from outplant and monitoring records.

**Potential use**

- Critical for ROI/KPI analysis because restoration success depends on maintenance, not just first outplanting.
- Replacement needs can become a performance metric: how much effort is needed to maintain a restoration area at target live cover.
- Helps separate "hectares restored" from areas actually maintained and improving.

## 8. Site design: restoration, control, and reference areas

**What they have or are collecting**

- Restoration areas.
- Similar control areas that are not intervened on.
- Reference sites where feasible.
- In Moorea, multiple restoration/nursery areas were mentioned, though Otter transcription of site names is uncertain.
- One island-level reference site may be used when per-site reference areas are not feasible.

**Cadence/resolution**

- Restoration/control design is area-level, not 1 m2 cell-level.
- Monitoring occurs across these areas over time.

**Known limitations**

- Site names need confirmation.
- Reference sites are not pristine; they are benchmarks for structure and function, not untouched baselines.
- There may not be enough resources for a reference site paired to every restoration site.

**Potential use**

- Control/reference comparisons for reef health and ROI/KPI reporting.
- Defining target complexity, morphology, live cover, and biodiversity.
- Estimating whether restoration areas converge toward or surpass local reference conditions.

## 9. Benthic imagery, photogrammetry, video, and complexity data

**What they have or are collecting**

- Benthic photos from traditional monitoring.
- Previous photogrammetry attempts at individual bommies or cells.
- Current move toward video-based benthic monitoring.
- Automated or semi-automated analysis intended to classify substrate types, including live coral, dead substrate, algae, and other benthic categories.
- Structural complexity metrics from video/spatial-intelligence models.
- Multiple complexity metrics, with a desire to reduce these to the top few or a single interpretable score.

**Cadence/resolution**

- Historically tied to outplant/restoration monitoring.
- Future cadence could increase if video analysis becomes fast enough.

**Known limitations**

- Earlier photogrammetry generated data that were difficult to analyze.
- The automated video analysis pipeline is not fully resolved.
- Complexity metrics need reduction, interpretation, and weighting.

**Potential use**

- Structural component of the reef health index.
- ROI/KPI outcomes beyond coral count.
- Covariates or outcomes in outplant models.
- Potential replacement for slower benthic survey methods.

## 10. Fish community data

**What they have or are collecting**

- Historical fish community measurements from custom camera systems.
- Cameras reportedly identified fish in real time from dawn to dusk.
- Stereoscopic camera data that could estimate fish size.
- Live feed and low-light camera capacity.
- Fish community composition.
- Functional group composition.
- Planned or ongoing transition to GoPro video plus AI identification pipeline.

**Cadence/resolution**

- Future fish monitoring may be roughly every three months.
- Historical custom-camera data may have high temporal resolution if available.

**Known limitations**

- The original custom-camera workflow depended on personnel no longer working with Coral Gardeners.
- Need to confirm whether historical outputs, raw videos, size estimates, or species IDs are accessible.
- GoPro plus AI pipeline is still being developed or tested.

**Potential use**

- Biodiversity or functional component of reef health index.
- Higher trophic or community response metric for ROI/KPI reporting.
- Possible indicator of restoration function and habitat complexity.

## 11. Bioacoustics data

**What they have or are collecting**

- Hydrophone recordings.
- Acoustic data from previous camera/hydrophone systems.
- Collaboration with Conservation Metrics in Santa Cruz.
- Acoustic signals intended to describe restoration-site soundscape or biodiversity.

**Cadence/resolution**

- Not specified in the transcript.

**Known limitations**

- Need to confirm sampling design, temporal coverage, file availability, and existing analysis outputs.
- Need to decide whether acoustic data add independent information beyond other biodiversity metrics.

**Potential use**

- Biodiversity or functional component of reef health index.
- Lower-effort ecosystem metric if it predicts community recovery.
- Candidate metric for monitoring-effort reduction.

## 12. eDNA data

**What they have or plan to collect**

- eDNA is being considered or developed as an easy community-level biodiversity metric.
- It may be used alongside hydrophones at selected intervals.
- It could capture invertebrates that are difficult to detect from video.

**Cadence/resolution**

- Proposed as interval-based sampling; exact design not specified.

**Known limitations**

- The transcript frames eDNA as hoped-for or in discussion, not necessarily fully operational.
- Need to confirm lab workflow, taxonomic resolution, cost, sampling frequency, and whether it correlates with management-relevant outcomes.

**Potential use**

- Biodiversity component of reef health index.
- Replacement or supplement for traditional fish/invertebrate transects.
- Monitoring-effort reduction if it captures community recovery reliably and cheaply.

## 13. Traditional ecological survey data

**What they have or are collecting**

- Traditional fish transects.
- Benthic photos.
- Recruit counts along transects.
- Key invertebrate observations.
- Possible future recruitment tiles.

**Cadence/resolution**

- Still being collected while newer technology pipelines mature.
- Exact cadence was not specified.

**Known limitations**

- Labor-intensive.
- Coral Gardeners wants to move away from some of this once faster metrics are reliable.
- Invertebrates may not be recoverable from video, making eDNA or targeted field surveys important.

**Potential use**

- Calibration set for video, bioacoustics, and eDNA.
- Baseline biodiversity and recruitment metrics.
- Validation of simplified reef health index components.

## 14. Environmental sensor and source-environment data

**What they have or are collecting**

- Light sensors.
- Temperature sensors.
- Standardization of sensor deployments is ongoing.
- Source-environment data intended to characterize hotter and less-hot collection areas.

**Cadence/resolution**

- Not specified in the transcript.

**Known limitations**

- The definition of a "hot pocket" is unresolved.
- Source-environment work appears to be an ongoing Coral Gardeners effort, not part of the current three-track RSE-Moorea collaboration focus.
- Moorea, Fiji, Thailand, and other sites may differ because of tides, reef setting, and intertidal exposure.

**Potential use**

- Potential covariate in future nursery or outplant models.
- Independent Coral Gardeners project to test whether source environment predicts stress tolerance.
- Not an active collaboration priority unless scope changes.

## 15. Operational, donor, and KPI data

**What they have or are collecting**

- Number of corals in nurseries.
- Number of corals outplanted.
- Historical "fragment equivalent" counts, where one large coral could have been counted as many fragments under the old metric.
- Current "one coral is one coral" counting practice.
- Donor/adopter commitments or targets, such as high coral-count promises.
- Restoration effort implied by nursery throughput, outplanting, maintenance, replacement, and expansion.
- KPI tracking already underway internally.

**Cadence/resolution**

- Likely annual or campaign-based for reporting.
- May also be tracked by donor, site, restoration area, or project.

**Known limitations**

- Coral counts are useful as effort metrics but not success metrics.
- Historical changes in counting rules create discontinuities.
- ROI needs cost and effort denominators that may sit outside the ecological database.

**Potential use**

- Core of the ROI/KPI collaboration track.
- Translate restoration strategies into comparable outcomes per dollar, hour, coral, area, or campaign.
- Separate throughput from ecological return: live cover, complexity, biodiversity, survival, and reduced replacement need.

## 16. Historical and side-experiment data

**Whole, partial, and fragment outplant comparison**

- Coral Gardeners previously compared whole colonies, partial colonies, and fragments.
- Hannah stopped the experiment because small fragments were being heavily grazed and the result was lopsided.
- Data may exist but are likely incomplete or ethically/operationally truncated.
- Useful mainly as background evidence for why current practice favors larger, intact outplants.

**Wire versus rope nursery infrastructure**

- Coral Gardeners is already testing wire versus plastic rope.
- This is not the current RSE-Moorea collaboration focus.
- It may still be useful as a covariate because infrastructure type can affect growth, disease, removal, and later outplant condition.

**Wound-treatment experiment**

- Possible later experiment contrasting concrete, Apoxie Sculpt epoxy, a confirmed Scripps/Hybrid Reefs candidate, and naked/open wound control.
- Working identification: the Scripps material may be Wangpraseurt/Hybrid Reefs CoralGuard, but this needs confirmation. CoralGuard may fit a fouling/reskinning problem; if it is primarily a plug/tile, larval-settlement, or fragment-fusion technology, it should be tested as a nursery-substrate treatment rather than forced into a wound-cover experiment.
- Response variables would include healing rate, health score, photographic recovery, treatment persistence, handling time, and cost.
- Supporting literature search: [coral-biomaterials-antifouling-literature-search.md](coral-biomaterials-antifouling-literature-search.md).
- This was discussed, but the current collaboration priority is ROI/KPI, nursery performance, and imperfect-provenance outplant modeling.

## Analysis-ready priorities

1. **Inventory database tables and keys**

   Confirm whether Coral Gardeners can link:

   - parent colony to genotype/species/genus;
   - parent colony to nursery rope/batch;
   - rope/batch to nursery measurements and issue flags;
   - rope/batch to outplant cell, bommie, or restoration area;
   - restoration area to annual live cover, survival, bleaching, maintenance, and replacement records;
   - restoration/control/reference areas to benthic, fish, acoustic, eDNA, and sensor data.

2. **Start with nursery performance**

   The nursery records appear to have the best combination of frequency, biological detail, and parent-colony provenance. A first pass should quantify data completeness and model growth/survival by parent colony, genotype, site, cohort, size, nursery age, infrastructure, and neighborhood.

3. **Build imperfect-provenance outplant models**

   The outplant analysis should not require individual tracking after deployment. Treat parent colonies, ropes, or batches as known contributors to aggregate cell/area outcomes, and model live cover, survival, bleaching, and replacement needs at the level Coral Gardeners actually monitors.

4. **Define ROI/KPI metrics**

   Separate effort from success. Coral counts, nursery inventory, and outplant totals describe work done. Success metrics should include one-, two-, and three-year live coral cover, survival, structural complexity, biodiversity or functional community recovery, resilience during bleaching, and maintenance/replacement effort.

5. **Use broader ecosystem metrics as validation or reduction targets**

   Fish video, benthic video, complexity, bioacoustics, eDNA, transects, recruits, and invertebrate records can help identify the minimum monitoring package needed for credible ecological reporting.

## Open questions to confirm with Coral Gardeners

- What is the current database schema, and which tables hold parent colony, genotype, nursery, outplant, and restoration records?
- Which Moorea site is the most complete starting point, and what are the verified site names?
- Which fields are consistently populated across years versus only recently added?
- Are genotype IDs available for all or only some parent colonies?
- Can nursery neighborhood be reconstructed from rope position, structure position, or spatial layout?
- How are health and bleaching scores defined, and are scales consistent across mother colonies, nursery corals, and outplants?
- What exact fraction of nursery corals are measured, photographed, or state-monitored in each monitoring round?
- Are issue flags standardized across app versions?
- Which data were temporarily collected in spreadsheets, and were they merged back into the database?
- Which provenance links remain after outplanting: parent colony, rope, batch, cell, bommie, restoration area, or only some of these?
- Are maintenance actions such as dead-coral removal, algal cleanup, refill, and expansion captured as data fields?
- What cost, staff-time, donor, and project accounting data are available for ROI/KPI analysis?
- Which video, acoustic, eDNA, and traditional-survey datasets already have processed outputs versus only raw data?
