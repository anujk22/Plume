# Plume — complete product and build specification

Version 4.2 · 19 September 2026

**Status: product and architecture decisions are fixed for implementation; data acceptance gates are explicit below.** This document is the single build authority. It consolidates the supplied v3 product requirements, the user's subsequent decisions, the two visual references, and direct data checks performed on 19 September. It does not assert that the application or its release dataset has already passed validation.

The earlier download path is no longer present. Its requirements were recovered from this conversation's earlier file reads. Quoted critiques are review input, not automatic instructions to remove features. No deadline-based scope reduction is incorporated. The repository starts with no application code.

## 1. Product, audience, and promise

**Plume helps people explore methane observations, understand what the evidence supports, and create investigations others can verify.**

The central question is: **Was methane observed here on more than one date, and what can someone responsibly do with that evidence?**

Environmental analysts, journalists, researchers, community investigators, hobbyists, and students use the same application. Findings and guided cases make it approachable; original records, measurement definitions, lineage, and structured exports make it useful for research. There are no separate personas, account types, or enterprise workflows. Public-sector adoption is not part of the pitch.

The unit of work is an **investigation/case**: a defined geographic area, selected dated observations, evidence relationships, findings, unresolved questions, and notes. A case is not synonymous with a plume, facility, or proven emissions source.

The useful distinction from a catalog viewer is the combination of:

1. Findings that reveal their supporting records and recompute when evidence selection changes.
2. Explicit acquisition/product/version relationships that prevent repeated publications from inflating evidence.
3. Comparison assessments that explain which conditions are satisfied, failed, or unknown.
4. An understandable brief and reusable evidence package derived from the same records.

Do not claim a first-ever capability, automatic global reconciliation, discoveries of new leaks, or superiority over every existing portal. Cross-provider reconciliation becomes a demonstrated claim only when its real example passes the gate in §5.

The environmental benefit is better interpretation and follow-up of existing methane evidence. Repairs, avoided emissions, health improvements, adoption, and time saved require separate measurements and are not claimed.

## 2. Fixed release scope

Build the full workflow below. Sequence it by dependencies; do not replace scope with a short demonstration shell.

| ID | Required behavior | Release condition |
|---|---|---|
| F1 | Guided investigations, case search, and separately labeled place lookup | Works without relying on a live methane API |
| F2 | Map and equivalent observation list; date and recurrence filters | Same result set and actions in both views |
| F3 | Actual observation imagery, quantity definitions, dates, source links, uncertainty | Every displayed value and asset resolves to its record |
| F4 | Persistent acquisition timeline, previous/next, play/pause, two-date comparison | No interpolated dates, movement, or fabricated coverage |
| F5 | Established / Unresolved / Next evidence step, with inspectable findings | Derived deterministically from selected evidence |
| F6 | Record, acquisition, plume, and processing-version lineage | A real within-provider example is required |
| F7 | Save investigation, evidence selection, plain-text notes on this device | Reload persistence; session operation when storage fails |
| F8 | Preview and download PDF plus complete structured ZIP | Same evidence, quantities, and claims in both |
| F9 | Method, coverage, source terms, technical documentation | Accessible to beginners and inspectable by specialists |
| F10 | Cross-provider lineage | Required verification attempt; activate the claim only for verified relationships |
| F11 | Infrastructure context and an instructive unresolved-attribution example | Real documented candidate infrastructure; proximity is not attribution |
| F12 | Reported-inventory comparison assessment | A real relevant reporting record and visible reasoned assessment |
| F13 | Multi-date geometry history | Post-core enhancement; three dates by default, maximum five, only when supported |

F11 and F12 are deliberate promotions from v3's optional scope because the reviewed ambiguity and comparison states now form part of the intended product. Their real examples are now populated with the reviewed Newby Island acquisitions, EPA annual record, and official permitted-process context. F10's verified cross-provider example remains a data gate; its absence must change positioning rather than produce a fabricated join. F13 remains optional; it is not a release dependency.

The initial dataset must contain at least one reviewed case with two real georeferenced methane rasters from distinct acquisitions, a real lineage example, an attribution-ambiguity example, and a reported-context assessment. Cases may serve multiple purposes. Target 3–6 reviewed cases; there is no arbitrary requirement to pad the dataset to 12. Every included case must be independently reviewed. Historical cases are acceptable; evidentiary quality takes precedence over recency.

Excluded: live satellite monitoring, custom methane detection or flux estimation, automatic annualization, exposure/health-risk scoring, compliance or guilt determinations, repair verification, accounts, collaboration, payments, alerts, chatbot, user-uploaded satellite processing, and a research compositing module.

## 3. Primary experience and routes

### Landing (`/`)

Preserve the reference's paper-cut environmental identity, confident serif wordmark, cream left surface, deep teal right composition, and warm sun accent. The central promise must be understandable before technical terms appear.

- Wordmark: **Plume**.
- Eyebrow: **METHANE OBSERVATIONS, IN CONTEXT**.
- Headline: **See the observations. Follow the evidence.**
- Supporting copy: **Explore satellite observations. Understand their limits. Take the evidence with you.**
- Primary action: **Explore an investigation**, showing the featured case's actual place and dates alongside it.
- Secondary action: **Browse cases**. Place lookup remains inside Explore rather than dominating the hero.
- Three supporting ideas: **Published observations / Traceable findings / Reusable evidence**.
- Navigation: **Explore / Method**. About, intended environmental benefit, coverage, and data credits live in Method/footer.
- The right-hand preview uses the real featured case and actual prepared imagery, with acquisition labels. Decorative art never substitutes for map data.

No account avatar, “Satellite & AI,” invented confidence percentage, “Cleaner air,” measured-impact counter, or “Get involved” destination without corresponding functionality.

### Explore (`/explore`)

Show reviewed investigations first. Case cards contain a neutral place name, instrument, available dates, distinct detection-day count, and imagery availability. Provide a text search over included cases and a separate **Find a place** control whose dataset scope is clear.

Place lookup answers where a location is; the observation index separately answers what this snapshot contains there. A successful geocode is not evidence that methane data exists. Never silently send an unsuccessful local search to a distant featured case.

### Investigation (`/investigations/:caseId`)

Open immediately from a public link. Show the actual case extent, full-case date range, snapshot retrieval date, selected acquisition, map/list view, persistent timeline, concise findings, and primary **Create investigation brief** action.

Opening a claim reveals supporting publications and highlights the corresponding observations on the map/list and timeline. Opening lineage explains acquisition and processing relationships. Selecting report evidence recomputes the selected-evidence summary; it does not rewrite the full-case history.

### Method (`/method`) and brief preview

Method begins with plain-language explanations and a guided example. Technical definitions, schemas, preparation steps, source terms, and known limitations follow. Brief preview is a real generated PDF displayed in a dialog/panel with an accessible text summary and download alternatives; it is not a separately written imitation of the report.

## 4. Actual source integrations

Provider means the organization publishing a record. Instrument means the observing sensor. **Carbon Mapper / EMIT** identifies a publisher and instrument; it does not prove a join to NASA's separate record.

| Source | Access and purpose | Runtime policy |
|---|---|---|
| Carbon Mapper catalog | Public `GET https://api.carbonmapper.org/api/v1/catalog/plumes/annotated`, queried by `plume_names`, `limit`, `offset`; preserves published observation fields | Fetch during preparation; no live dependency per click |
| Carbon Mapper STAC | Public `GET https://api.carbonmapper.org/api/v1/stac/search?ids=…`; collection/item self-links supply product/version metadata and asset links | Pin records and download permitted assets before release |
| Carbon Mapper source context | Public `GET /api/v1/catalog/source/plume/name/{plumeName}` | Preserve source grouping separately from case membership; do not transfer a source statistic to another area |
| NASA EMIT catalog | CMR `GET https://cmr.earthdata.nasa.gov/search/granules.json`, `short_name=EMITL2BCH4PLM`, `version=002`; UMM JSON by granule concept ID | Publication and acquisition metadata; Earthdata-protected assets are not assumed anonymously accessible |
| NASA EMIT public map metadata | `https://earth.jpl.nasa.gov/emit-mmgis/Missions/EMIT/Layers/coverage/combined_plume_metadata.json`, as referenced by its official map configuration | Snapshot with schema checks; a public map feed is not a promised stable API |
| EPA GHGRP | Official downloadable gas-specific annual facility reporting data, with exact file, year, row, facility ID, gas, and reporting unit pinned during preparation | US inventory context only after an actual relevant record is reviewed; never apply an EPA record to the current non-US candidate |
| Facility registries | Provider attribution, or an official registry appropriate to the selected case; EPA facility records for US examples | Keep registry provenance, geometry role, and date; no nearest-point auto-attribution |
| GeoNames | Downloaded `cities15000`, country/admin names, and US postal-code data | Prepared place index; no geocoding key or third-party request for each query |
| OpenFreeMap / OpenStreetMap | MapLibre-compatible public vector tiles and a locally controlled style | External basemap only; failure leaves evidence/list/export usable |

Source documentation: [Carbon Mapper guide](https://carbonmapper.org/articles/product-guide), [API](https://api.carbonmapper.org/api/v1/docs), [terms](https://carbonmapper.org/terms), [NASA portal](https://earth.jpl.nasa.gov/emit/data/data-portal/Greenhouse-Gases/), [EMIT product guide](https://github.com/emit-sds/emit-sds-tgp/blob/main/docs/EMIT_L2B_TRACE_GAS_User_Guide.md), [CMR search documentation](https://cmr.earthdata.nasa.gov/search/site/docs/search/api.html), [EPA datasets](https://www.epa.gov/ghgreporting/data-sets), [GeoNames data documentation](https://download.geonames.org/export/dump/readme.txt), [postal data documentation](https://download.geonames.org/export/zip/readme.txt), [OpenFreeMap quick start](https://openfreemap.org/quick_start/).

### Product-specific field policy

For the inspected Carbon Mapper plume records, preserve `scene_timestamp`, `geometry_json`, `scene_id`, `plume_id`, `instrument`, `processing_software`, `emission_version`, `hide_emission`, `emission_auto`, and `emission_uncertainty_auto` with original field paths. Published plume rates are in kg/h for this product; source aggregate rates are a different quantity. `hide_emission=true` suppresses display/export of the number even if it remains present in a raw response. A null quality field means no quality statement was supplied; it is not “high quality.”

Resolve public STAC asset roles explicitly. `con_tif` and the visualization concentration TIFF may have different grids and masks. A PNG without georeferencing is not eligible for map placement. Signed asset URLs expire; retain stable record/item URLs and locally prepared permitted assets, not signed URLs as production dependencies.

**NASA rate correction:** the currently accessible public map feed includes “Emissions Rate Estimate (kg/hr)” and uncertainty fields. The older portal FAQ says rates are not provided. Therefore, do not encode “NASA never publishes rates.” Preserve the exact product/version and field provenance; display such rates only after their method, uncertainty semantics, quality/suppression rules, and permitted use are verified. Until then, label that quantity **Not validated for display** while preserving the record's identity. This does not block displaying separately validated imagery or metadata.

NASA point and polygon features can represent one `Plume ID`. Geometry representations are not independent detections. Its maximum-enhancement location is not interchangeable with a Carbon Mapper plume-origin estimate.

## 5. Verified preflight and remaining gates

The inspected files are preserved under `evidence/preflight-2026-09-19/`. They are **preflight material**, excluded from automatic production publication. `manifest.json` includes original/stored SHA-256 hashes and source endpoints. Expiring signed URL queries are removed from archived JSON; original and stored hashes are intentionally distinct.

### Verified on 19 September 2026

| Item | Observation A | Observation B |
|---|---|---|
| Carbon Mapper plume identifier | `emi20240420t101448p07050-A` | `emi20241023t083741p06026-A` |
| Acquisition UTC | 2024-04-20 10:14:48 | 2024-10-23 08:37:41 |
| Provider coordinate in Yemen, longitude/latitude | 46.0360034, 15.5864598 | 46.0361416, 15.5848176 |
| Published plume-rate field, kg/h | 3056.005915823478 | 4944.489197055098 |
| Published uncertainty field, kg/h | 444.13146723218654 | 661.4465037147299 |
| Provider suppression flag | false | false |
| Processing software | 3.18.1 | 3.18.1 |
| Numeric visualization raster | Downloaded and decoded | Downloaded and decoded |
| Native CRS / approximate sampling | EPSG:32638 / 59.14 m | EPSG:32638 / 59.14 m |
| Visualization mask | NaN nodata; 303 valid zero pixels | NaN nodata; 205 valid zero pixels |
| Quantification crop mask | Zero declared nodata | Zero declared nodata |

The case is in Yemen, near 46.036° E, 15.586° N. Retain it as a geographic evidence case without naming a facility or operator. A separate US case is required for EPA inventory context; Algeria would not solve that US-only reporting dependency. The April and October numeric visualization maxima are 4792.98584 and 5144.18310 ppm·m. Keep a shared 0–5500 scale: it compares enhancement values, not emission rates. The seven-product lineage example is verified for April only; October version history is not assumed.

The table reports actual fetched fields, not a release endorsement of all scientific semantics. Preserve raw precision in exports; present appropriately rounded values with the provider's uncertainty definition once reviewed. Do not label that uncertainty a 95% interval without documentation.

The visualization and quantification crops have different extents. Reprojection onto the crop grid matched all 166 and 133 valid crop samples respectively, with zero numeric difference. Provider point estimates lie inside their respective visualization bounds. The QA figure uses a common 0–5500 ppm·m scale, nearest-neighbor rendering, and transparent/masked absent pixels. These checks establish internal geospatial consistency, not independent ground truth or facility attribution.

Carbon Mapper's STAC search returned seven product/version items for the April plume identifier. Shared identifiers and scene metadata establish a real within-provider publication/version example. These are multiple products or revisions, not seven measurements. A changed rate between archived and current processing must be described as a processing revision, not a change in the atmosphere.

NASA CMR has corresponding candidate granules `G3961088513-LPCLOUD` and `G3961096319-LPCLOUD`. Their source-scene metadata and public map entries support further investigation. **A definitive cross-provider shared-acquisition relationship has not yet been established in this preflight.** Do not merge by timestamp/location alone or imply that finding candidates validates the complete join.

The April provider source-group response includes only the April plume as a detection. The nearby October record is not thereby established as the same provider-defined source. Initially treat the pair as observations within a geographic investigation, with source association unresolved. Distinguish repeated detections in an area from repeated detections at a verified facility.

### Data acceptance gates

| Gate | Current state | Required work / failure behavior |
|---|---|---|
| Two real numeric/georeferenced rasters | Passed preflight | Repeat validation on the exact production snapshot; inspect basemap alignment and final web/PDF rendering |
| Version/product lineage | Passed preflight | Publish a documented relationship with original IDs and product-role distinctions |
| Exact quantity, uncertainty, masks, permissions | Partially verified | Complete per-product field mapping, quality rules, and asset-license ledger before release |
| Same-source attribution across the two dates | Unresolved | Use area-level wording; promote to source recurrence only with evidence |
| Cross-provider acquisition join | Candidate only | Verify an authoritative lineage mapping or documented original-scene identity; otherwise show unresolved candidates and omit verified-cross-provider marketing |
| Infrastructure ambiguity case | Reviewed Newby Island process ambiguity | The November 2022 Bay Area Air District permit lists landfill decomposition S-2 and composting S-3; included satellite observations do not resolve the emitting process. Do not invent two facility points or a location-uncertainty radius. |
| Relevant annual reporting example | Not validated | Retrieve an actual gas-specific inventory row, document boundary and year, and assess it against relevant observations |
| Production geocoder and basemap behavior | Architecture selected | Download/version gazetteer; implement and exercise success, empty, and tile-failure states |

A candidate failing a required imagery or contextual-data gate is replaced with another real case. It is never completed with invented measurements. No user answer is needed to make these routine evidence-review decisions. If no accessible dataset can satisfy a mandatory gate after investigation, report the concrete limitation before calling the release complete.

## 6. Fixed implementation architecture

### Stack and responsibility

| Layer | Choice | Responsibility |
|---|---|---|
| Web application | React + TypeScript using the Sites Vinext/Vite starter in `web/` | Routes, responsive UI, browser state, static data loading |
| Styling | Tailwind/CSS variables with purpose-built components | Reference-specific identity; use existing accessible primitives where helpful |
| Mapping | MapLibre GL JS | Actual geography, prepared imagery, outlines, synchronized views, attribution |
| Data contracts | Zod schemas and TypeScript types | Reject invalid snapshots and validate URL/local state |
| Evidence engine | Pure TypeScript modules, shared by UI and export worker | Counts, lineage, deterministic claims, comparison reason codes |
| PDF | `@react-pdf/renderer` with its flow layout, wrapping, pagination, and embedded licensed fonts | Programmatic pages, dated imagery, legends, links, notes, tables |
| ZIP | `fflate` in a Web Worker | Package PDF, JSON, CSV, GeoJSON, relationships, manifest, permitted assets |
| Hashing | Browser Web Crypto SHA-256; Python hashlib for preparation | Canonical evidence fingerprint and file integrity |
| Preparation | Python, rasterio/GDAL, pyproj, NumPy | Source retrieval, mask/CRS checks, preparation, hashes, data-review reports |
| Scientific QA | Matplotlib | Inspect real rasters and document transformations; not generate fictitious plume art |
| Hosting | Sites deployment of the starter's Cloudflare Worker/static assets | Public routes and immutable snapshots; no database required |

Use the starter's compatible dependency versions and lockfile. Add only necessary libraries above. Do not combine incompatible framework versions manually. Keep domain logic independent of framework request handlers. Unit tests use Vitest; browser tests use Playwright and targeted accessibility checks.

**Backend decision:** no database, authentication service, live satellite proxy, or server PDF service is required. The hosted Worker serves the application and versioned static resources. An offline preparation pipeline supplies the data; browser workers create reports and search local indices. If static-asset packaging limits require splitting assets, keep the same versioned snapshot contract. Do not introduce a database to solve file organization.

Notes and selected evidence remain on the device. Export generation has no network call for private notes. A public URL serializes only allowed public snapshot/case/observation IDs and view state.

### Repository layout

```text
PLUME_PRD.md                      authoritative product and build specification
web/                             starter application and its lockfile
  src/                           routes/components/domain/export code, following starter conventions
  public/data/<snapshot-id>/      approved runtime manifests, records, prepared assets
  public/art/                    decorative artwork; never scientific evidence
scripts/                         retrieval, normalization, validation, publication tools
data/                            normalized working data and source/field mappings
evidence/preflight-2026-09-19/     archived feasibility evidence; not a release snapshot
design/references/               supplied mockups; not shipped as evidence or UI backgrounds
tests/fixtures/                  explicitly synthetic or sampled test-only inputs
docs/                            setup, method detail, validation, actual research decisions
```

The exact starter route directory convention governs `web/`; do not create duplicate Next/Vite routing systems. Production code imports data only through the approved snapshot manifest, never by scanning the preflight/reference directories.

### Preparation and runtime separation

1. Retrieve stable record metadata; record full request parameters, retrieval UTC, source version, and response hash.
2. Validate and preserve provider fields. Fetch permitted assets using fresh signed URLs where required.
3. Review quantity, units, time/spatial support, geometry role, masks, quality, uncertainty, and permissions.
4. Establish acquisition/product/plume/source relationships with machine-readable rationale and evidence IDs.
5. Prepare georeferenced display imagery and numeric legends; retain original permitted assets and transformation metadata.
6. Compile claims' input facts, cases, search indices, comparison assessments, and license ledger.
7. Validate the manifest, inspect the real map and PDF, then publish an immutable snapshot.

Updating the snapshot is an explicit build/review operation. No live cron or silent provider refresh is part of this release. Existing public links pin their snapshot. If an older snapshot is unavailable, explain that state instead of silently showing a newer one under the old identifier.

## 7. Data contract and identity

All public entities have stable IDs and a schema version. Preserve null/missing/suppressed/inapplicable distinctly. Normalize GeoJSON to WGS84 longitude, latitude; retain source CRS and transformation history for raster assets.

| Entity | Required information |
|---|---|
| DatasetSnapshot | ID, schema/rule/adapter versions, retrieval range, acquisition range, source requests/versions, hashes, known gaps, permissions, included IDs |
| ProviderRecord | Publisher, native ID and product/version, original record URL, publication/retrieval times, original field paths, source hash, quality/suppression state |
| Acquisition | Instrument/platform, original scene identity where known, acquisition timestamp and precision, verified relationships; no statistical-independence assertion |
| Observation | A plume/detection under a specific product; acquisition link or unresolved candidate, geometry role, gas, quantities, associated records |
| ObservationAsset | Observation/record IDs, role, local URL, original stable reference, SHA-256, CRS, affine transform, footprint, dimensions, nodata/mask rules, units, legend, resampling and license |
| Case | Neutral name, investigation area and why it was selected, included observations, scope of recurrence, reviewed associations and questions |
| EvidenceRelationship | Typed endpoints, `verified`/`candidate`/`rejected`, rule or human-review rationale, supporting records and review date |
| Claim | ID, rule version, text, scope, supporting evidence IDs, explicit missing-data conditions, parameters, snapshot and selection fingerprint |
| FacilityCandidate | Registry/provider ID, name, geometry role, date, distance reference, association status, evidence and unresolved alternatives |
| InventoryRecord | Facility/report ID, gas, original units/value, reporting year/period, boundary, estimator/method and source record |
| ComparisonAssessment | Intended operation, two contexts, condition statuses with reason codes/evidence, permitted result or withheld result, next evidence step |
| LocalWorkspace | Version, snapshot/case IDs, selected observation IDs, plain-text notes, user preferences, saved-at time |
| ExportManifest | Snapshot/schema/rule/software versions, selection, canonical fingerprint, generated-at time, file hashes, source and license references |

Quantity fields: `kind`, `gas`, `value`, `unit`, `time_support`, `spatial_support`, `producer`, `method_ref`, `uncertainty` with its definition/type/unit, `display_status`, `source_record_id`, and `source_field_path`. A hidden raw provider number is not put into the public normalized record or export merely because the original payload contains it.

| Internal kind | Display label | Typical unit; exact provider unit governs |
|---|---|---|
| `column_enhancement` | Methane column enhancement | ppm·m |
| `integrated_mass_enhancement` | Integrated methane mass enhancement | kg |
| `instantaneous_plume_rate` | Plume rate, single acquisition | kg/h |
| `provider_source_rate` | Provider source estimate | Documented mass/time unit and aggregation period |
| `reported_annual_mass` | Reported methane mass, [year] | kg CH₄ or metric tonnes CH₄ over that year |

Do not substitute CO₂-equivalent totals for methane mass or apply an unstated GWP conversion. Do not derive rate from enhancement or mass in this application. Exact unit conversions within the same quantity may be used with a recorded factor; every original unit/value remains available when display is permitted.

### Counting rules

- Publication count, distinct acquisition count, distinct plume count, and distinct UTC detection-day count are separate fields and labels.
- One acquisition can contain multiple real plumes. Sharing an acquisition never deletes those plumes.
- Product revisions and geometry representations do not add acquisitions or detection days.
- Relationship types include `same_acquisition`, `same_plume`, `processing_revision`, `derived_product`, and `case_association`; do not overload a single `duplicate` flag.
- Unknown identity does not silently become a new verified independent measurement. Show verified counts plus unresolved records.
- For date-only timestamps, retain that precision. Never invent noon or seconds to create a join. Use date intervals where needed.
- Compare processing versions in the lineage drawer. Use the reviewed preferred product per observation for default display; never average revisions.
- Distinct acquisitions are not automatically statistically independent. The UI says “distinct acquisitions,” not “independent confirmations.”

## 8. Search, timeline, maps, and selection

### Place lookup and scoped results

**Santiago catalog extension (19 September 2026):** Place search also reads a frozen regional Carbon Mapper STAC excerpt covering bbox [-71.3, -34, -70.1, -32.6]. Include public CH4 L3 plume visualization records only, deduplicated by exact plume ID using the latest processing timestamp. Scene footprints are not detections. This is a catalog browsing layer, separate from reviewed case claims, quantities, and exports. Show provider origin estimates as gold markers, cluster counts as plume-record counts, and only the selected published plume footprint. Provide dated selection, original record link, radius/date filters, and explicit regional coverage. Never imply zero methane outside the snapshot or global catalog completeness.

**Santiago catalog extension (19 September 2026):** Place search also reads a frozen regional Carbon Mapper STAC excerpt covering bbox [-71.3, -34, -70.1, -32.6]. Include public CH4 L3 plume visualization records only, deduplicated by exact plume ID using the latest processing timestamp. Scene footprints are not detections. This is a catalog browsing layer, separate from reviewed case claims, quantities, and exports. Show provider origin estimates as gold markers, cluster counts as plume-record counts, and only the selected published plume footprint. Provide dated selection, original record link, radius/date filters, and explicit regional coverage. Never imply zero methane outside the snapshot or global catalog completeness.

Bundle GeoNames city entries from `cities15000`, administrative names, and US ZIP-code centroids. State this coverage in the control: **City, region, or US ZIP code**. This is not a promise to resolve every settlement or worldwide postal code. City/admin aliases are normalized for search while retaining original spelling and Unicode display.

Use a local Web Worker and prepared prefix/country shards; load US postal shards only for a postal query. Debounce query updates, disambiguate results with country/admin area, and reject empty/oversized input. A place lookup result always shows its type and approximate centroid semantics. The release does not assume GeoNames supplies authoritative area polygons.

Point-only results, including administrative centroids, use an explicit default **Within 25 km of this place's center**, with 10/25/50/100 km options. If a documented polygon is later included for a reviewed case, its area scope is displayed separately. Never silently treat a center/radius as an administrative boundary.

Prepared observation indices store representative location role and geometry. Use geodesic point distances for a declared point role, or polygon intersection for a declared area query. A plume maximum, origin estimate, and facility coordinate cannot be interchanged without changing the distance label. Match dates by acquisition time.

Basic filters: acquisition date range and repeated detections. Advanced provider/instrument/sector filters appear only when the dataset offers meaningful choices. Curated browsing order is labeled; searched results sort by geographic distance, with latest-acquisition sorting also available. Counts and map clusters state what they count.

Do not auto-zoom the map after an empty result. Empty result text: **No published observations in this dataset for the selected area and dates. This does not establish that methane emissions are absent.** Show active filters, Reset, radius/date adjustments, and a separately labeled example. A failed place lookup has different copy and preserves the query.

### Map imagery and legends

**Regional visual presentation update:** Santiago opens on the selected plume against a deep teal basemap, with an explicit area-overview switch. Three prepared Tanager-1 acquisitions offer contour bands and a raw sensor-pixel toggle. Contours use ContourPy linear interpolation inside fully valid measured cells only, with no Gaussian smoothing, mask expansion, or extrapolation. Use five fixed 500 ppm·m bands and the inferno palette on a shared 0–2,500 ppm·m scale. Label contours as derived/interpolated; preserve original rasters and hashes. This is an explicit regional display exception to the nearest-neighbor-only default below; reviewed investigation maps now use the same derived-contour default with a sensor-pixel toggle; their original case scales (Marib 0–5500, Newby Island 0–9000 ppm·m) remain fixed. Full scenes and exports retain their original rendering. Case thumbnails, observation previews, and evidence-list thumbnails use dated vector contours. Reviewed-case contours use corner masking to retain triangles with three valid measured vertices; masked vertices are excluded. Reviewed-case contours use corner masking to retain triangles with three valid measured vertices; masked vertices are excluded. Dates without imagery show their own outline, never a different date’s raster.

**Regional visual presentation update:** Santiago opens on the selected plume against a deep teal basemap, with an explicit area-overview switch. Three prepared Tanager-1 acquisitions offer contour bands and a raw sensor-pixel toggle. Contours use ContourPy linear interpolation inside fully valid measured cells only, with no Gaussian smoothing, mask expansion, or extrapolation. Use five fixed 500 ppm·m bands and the inferno palette on a shared 0–2,500 ppm·m scale. Label contours as derived/interpolated; preserve original rasters and hashes. This is an explicit regional display exception to the nearest-neighbor-only default below; reviewed investigation maps now use the same derived-contour default with a sensor-pixel toggle; their original case scales (Marib 0–5500, Newby Island 0–9000 ppm·m) remain fixed. Full scenes and exports retain their original rendering. Case thumbnails, observation previews, and evidence-list thumbnails use dated vector contours. Reviewed-case contours use corner masking to retain triangles with three valid measured vertices; masked vertices are excluded. Reviewed-case contours use corner masking to retain triangles with three valid measured vertices; masked vertices are excluded. Dates without imagery show their own outline, never a different date’s raster.

Use an actual desaturated basemap, actual georeferenced enhancement imagery, and documented outline geometry. Default to one selected acquisition. Draw only supplied/prepared evidence coverage. Blank and transparent areas are not styled as zero methane.

Prepare each numeric raster through its own affine transform/CRS. Reproject to a documented Web Mercator display grid for MapLibre; preserve original numeric values/masks in the research package where permitted. Use nearest-neighbor resampling for the release and record the chosen resolution. Do not smooth/interpolate plume shapes for visual appeal. Source CRS coordinates remain available in metadata.

Default scalar colormap is **cividis**, with numeric ticks, quantity, unit, acquisition, and provider. Record limits and clipping; do not assign an undisclosed per-image autoscale. For the validated candidate pair, the proposed shared scale is 0–5500 ppm·m after final product/mask review. Do not silently discard negative valid values in other products; set their scale from their documented semantics.

A pre-colored provider image retains its documented original scale/legend. Unknown-color images are viewable as provider images but cannot receive an invented scientific legend. A rate card never acts as an enhancement legend. Outlines use neutral strokes; candidate infrastructure uses a distinct symbol from observation points.

Keep attribution visible at all view sizes. Data, map, and export attribution are separate obligations. Do not remove OpenStreetMap/OpenMapTiles/provider notices from the basemap style. Basemap failure shows a neutral coordinate canvas and a message; it does not remove the data or offer invented geography.

### Timeline, replay, and compare

The timeline is persistent and uses a true time axis with visible gaps; instrument lanes only where more than one instrument makes them useful. Mark acquisitions, not publication dates. Multiple same-day acquisitions remain accessible separately. Selection is operable without dragging and without color alone.

Static note: **Gaps mean no included record; they do not show that methane was absent.** A hover/focus explanation may add detail but is not the sole disclosure. Only explicit coverage evidence can add “usable observation, no detection” or “unusable observation” states. A provider's source-level denominator is displayed only with its scope and definition; it is not generalized across a nearby case.

Previous/next and play/pause step through actual acquisitions. Each frame lasts at least 1.5 seconds after loading; stop at the last acquisition. Pause on manual selection, mode change, hidden tab, or error. Respect reduced motion by starting paused and avoiding animated camera movement. Never morph one plume into another or fill unobserved dates.

Compare selects two different acquisition dates and displays synchronized maps with equal geographic extents. Both dates remain visible. Shared scales require compatible quantity, units, product interpretation, masks, and accessible numeric rasters; otherwise show separate legends and the reason. Do not compute a percentage rate change or treat visual shape changes as demonstrated emission changes.

Asset/date/legend/details update atomically. During a date change, show loading or keep the old date clearly labeled until the new asset is ready. Cancel stale requests; an unavailable asset cannot inherit another date's picture. Preload only adjacent dates and the selected compare pair.

### Full-case versus report selection

The case header and timeline describe the full reviewed case. Checkboxes select observations for **this brief**. A visible label identifies **Selected evidence: N observations / D dates**. Deselecting data recomputes report findings, highlights, quantities, and export contents. It does not hide the fact that additional case observations exist.

With zero selected observations, preserve the case and notes, explain the empty selection, and disable evidence export with a clear reason. One selected date produces a single-date finding rather than a recurrence claim. Save investigation is secondary to Create investigation brief.

## 9. Findings, uncertainty, and comparison assessment

### Evidence-linked findings

Use deterministic templates with stable rule IDs, not an LLM. Every factual sentence either links to supporting records or declares a specific missing prerequisite. A next-step suggestion is labeled as a recommendation, not a measured fact. Human-written case context also requires citations.

| Condition | User-facing finding |
|---|---|
| Two or more verified dates in the selected area | “Methane was detected within this investigation area on {N} dates between {first} and {last}. These observations do not establish continuous emissions.” |
| Only one verified date | “The selected evidence contains a detection on {date}. It does not establish repeated detections.” |
| Unresolved acquisition relationships | “{N} acquisitions are verified; {M} additional records have unresolved acquisition relationships.” |
| Source identity unresolved | “The observations are near one another, but the emitting source has not been established.” |
| Observation opportunities unknown | “The dataset does not establish every usable observation opportunity, so detection frequency cannot be calculated.” |
| Multiple supported infrastructure candidates | “The available location evidence does not distinguish {candidate names}. Source-location review is needed before assigning a facility.” |
| Known period mismatch | “The reported figure covers {period}; these observations describe {time support}. A numerical discrepancy is not calculated.” |

When two single-acquisition rates are shown, always include: “These estimates describe separate moments. A difference between them does not establish a change in ongoing emissions.” A shared enhancement color scale does not change that limitation.

The cardinality and grammar must handle 0/1/many. Claims use actual minimum/maximum selected acquisition dates, not hardcoded featured-case prose. Three dates becoming two and two becoming one are required behaviors. A claim click simultaneously focuses supporting map/list entries and timeline marks, then exposes record links and rule rationale in the evidence drawer.

Display five distinct, expandable statuses: **Observation quality / Lineage / Recurrence / Attribution / Comparison**. Use specific values such as “Provider flag unavailable,” “Shared acquisition verified,” “Two dates in this area,” “Unresolved,” and “Not comparable.” Do not turn them into a global score or show category names alone as supposed results.

### Reported-versus-observed assessment

The panel title is **Can these figures be compared?** It is a first-class part of the case evidence view, not an empty disabled chart. It shows the actual reported record and selected observed context with dates, units, boundaries, providers, and links before the assessment.

This release assesses and explains compatibility but implements no numerical annual-discrepancy calculator or unreachable passing-result screen. Each condition has `satisfied`, `failed`, `unknown`, or `not_assessed`, a reason code, a readable explanation, and evidence IDs:

1. Source/facility association is sufficiently established for the proposed operation.
2. Spatial/system boundaries describe the same relevant emissions scope.
3. Gas is the same; CH₄ mass and CO₂-equivalent values are not interchangeable.
4. Physical quantity/dimensions are compatible.
5. Temporal support is compatible, not merely overlapping date labels.
6. Estimator/aggregation method supports the proposed interpretation.
7. Uncertainty and quality definitions support that interpretation.
8. Display and calculation permissions allow it.

All required conditions would have to pass to support a numerical comparison; this release does not implement that calculation. A known mismatch is `failed`; missing evidence is `unknown`. Disabled upstream checks are `not_assessed`, never silently passed. When any check fails or is unknown, show **Numerical comparison withheld**, identify why, and state what additional evidence would be needed if that is known.

This release does not supply a method to estimate annual mass from episodic observations. A few dated plume rates therefore cannot become an annual discrepancy even when facility identity matches. Do not manufacture a passing annual example. Retain both legitimate published contexts and the specific questions a user can pursue.

No generic facility CO₂e total is presented as methane mass. If no relevant reporting record exists, show **No reporting record included** with that distinct reason, rather than pretending two real figures failed a substantive assessment.

## 10. Visual specification and replication strategy

### Fidelity contract

The supplied images govern **art direction**, not scientific content or nonexistent features. Match the paper texture, layered contour silhouette, color relationships, typography character, rounded surfaces, restrained shadows, and generous composition closely. Rebuild the workspace around evidence and time.

The implementation target is a high-fidelity responsive interpretation. A literal pixel-identical functional copy cannot be promised from two flattened images without editable artwork, exact fonts, and responsive/state specifications. Generated artwork can preserve style and composition while varying individual contours. The real map necessarily differs from the illustrated Denver heatmap.

Image generation is for a small cohesive set of **decorative assets**: hero landscape, layered contour edge, subtle paper texture, and a coordinated compact/mobile crop. Use supplied images as style/composition references. Request assets without words, controls, plotted measurements, or map labels. The landing page may use reference-matched conceptual roads and sculpted plume-like contours as clearly labeled illustration. Do not attach real location labels, acquisition dates, numeric scales, or measured rates to that artwork; link to the separate measured investigation view. This landing-page exception follows the user’s explicit request to restore the illustrated reference using image generation. Prefer one coherent source composition and derived crops over many unrelated generations. Preserve transparent edges where required.

Implement all headings, labels, buttons, icons, cards, maps, timelines, and interactions in HTML/CSS/SVG/MapLibre. Do not place invisible buttons over a flattened full-screen screenshot. Generated text is not production interface text. The supplied reference PNGs are kept outside `public/` and are not shipped as the application.

Generated decorative artwork is allowed on the landing page and restrained outer workspace framing. It must never enter a scientific layer, claim thumbnail, exported evidence image, or quantity legend. The production manifest explicitly marks scientific assets; decorative assets have a separate directory and role. No rule bans legitimate generated branding merely because it is generated.

### Tokens

| Role | Value |
|---|---|
| Paper | `#F3F2E9` |
| Deep ink / primary control | `#073641` |
| Teal secondary | `#176B73` |
| Sage | `#87AEA0` |
| Pale blue paper layer | `#BBD8DB` |
| Sun accent | `#F8D568` |
| Attention / unresolved state | `#76627D` (with an icon and text) |

Text contrast governs final token usage; decorative colors do not automatically qualify as text colors. Use deep ink on paper for body copy, and paper on deep ink for primary buttons. Reserve the sun accent for orientation and selected controls, not a “dangerous emissions” severity scale. The scientific colormap is independent of branding.

Type: **Source Serif 4** for the wordmark and editorial headings; **DM Sans** for UI/body; **IBM Plex Mono** only for technical IDs where helpful. Self-host licensed font subsets with license files. These are deliberate matching choices, not claims about the unknown original fonts. Use tabular numerals for quantities and dates. Body 16 px; dense metadata no smaller than 12 px; normal line height at least 1.45.

Spacing uses 4/8/12/16/24/32/48/64 px. Cards have 20–28 px corners, controls 10–14 px or pills as in the reference. Use soft directional shadows rather than universal frosted-glass effects. Avoid shadows around every data row. The paper-cut contour is the visual signature; do not add unrelated visual motifs.

### Desktop workspace layout

```text
+-------------------------------------------------------------------------+
| Plume     Explore  Method             Acquisition range · Snapshot date  |
+--------------+--------------------------------------+-------------------+
| Cases        | Real map / synchronized comparison   | Case title        |
| Find a place | Selected acquisition/date badge      | Established       |
| Short list   | Numeric legend + provider links      | Unresolved        |
| Basic filter | Scale + map attribution              | Next evidence step|
|              |                                      | Quantity + source |
|              +--------------------------------------+ Assessment        |
|              | Persistent acquisition timeline      | Create brief      |
+--------------+--------------------------------------+-------------------+
```

At a reference width near 1672 px: header 72 px, outer gap 16–24 px, left column about 248 px, right column about 352 px, remaining width for map. Timeline occupies the bottom of the map column, approximately 144–176 px. These are responsive constraints, not mandatory fixed pixels at every viewport. At 1440 px the map should retain at least roughly 640 px where possible; collapse the left rail before crushing the map.

The right panel scrolls within its available height without clipping the primary action. Full comparison assessment and lineage can expand into accessible drawers/panels. Avoid showing five large status cards plus every technical field simultaneously; use concise findings with inspectable depth.

Between 900–1199 px, cases/filters move into a drawer, and the evidence panel can be toggled. Below 900 px, use a stacked layout: title and snapshot, map/list, persistent-in-flow timeline, findings, then export. Mobile comparison uses synchronized selectable A/B views with both dates labeled; no unreadably narrow split screen. Controls have at least 44 px touch targets. No horizontal page overflow at 390 px.

Provide a persistent compact locator inset showing the case region; keep plume outlines visible when raster details become small. Findings and the brief action occupy the right panel; statuses are compact wrapping chips, while full quantities, lineage, and assessment open dedicated drawers.

Keep paper scenery outside the geographic viewport. The map's neutral background, data raster, outlines, and infrastructure symbols must remain distinguishable from decorative mountains. The landing can remain richly illustrated; the workspace retains the same identity with much quieter framing.

### Accessibility and visual review

Use semantic headings, named controls, visible focus, keyboard-operable timeline/selection, non-color states, dialog focus management, reduced motion, meaningful loading announcements, and equivalent list actions. Target WCAG 2.2 AA for the core journey. A map canvas alone is not the accessible interface.

Before broad feature expansion, render the real-data landing and workspace at 1672×941, 1440×900, 1024×768, and 390×844. Compare the identity and proportions with the references, then iterate in code. This rendered implementation becomes the corrected build target; another generated full UI mockup is not a substitute for it.

## 11. Local work and exports

Save case IDs, selections, and plain-text notes in versioned browser storage. Display **Saved on this device**. On storage failure, maintain session state and offer export; do not block the investigation. Require confirmation only for clearing saved work. Notes do not change observations, source association, scientific status, or verified claims.

Public links include snapshot ID, case ID, selected public observation IDs, mode, and selected acquisition/compare pair. Never include private notes. Validate all linked IDs against the snapshot; invalid state produces a recoverable message. Notes are plain text, limited to 20,000 characters per case, escaped during export. No analytics or application logs contain note content.

### PDF

Create a completed PDF in a Web Worker, then show that file for preview/download. Include:

1. Neutral case title, location and scope, selected observation window, snapshot/retrieval date.
2. Established findings, unresolved questions, and practical next evidence steps.
3. Dated real imagery with legends, scale/orientation where meaningful, provider attribution, and source links.
4. Selected quantities with exact meaning, permitted uncertainty, and temporal support.
5. Observation table, lineage explanation, and comparison assessment where present.
6. Clearly separated optional user notes; unchecked by default when sharing/exporting a brief.
7. Source/terms references, software/rule versions, generated-at time, and evidence fingerprint.

Target 2–4 readable main pages; appendices can grow with evidence. Never shrink body text to force a page count. Rendering must use approved prepared assets, not a screenshot of potentially tainted map tiles. A standalone georeferenced evidence figure can omit a basemap; retain scale, date, legend, location context, and attribution. If a basemap is included, its export permission and attribution must be satisfied.

### ZIP contents

```text
brief.pdf
case.json
observations.csv
geometries.geojson
relationships.json
claims.json
comparison.json                   when an assessment exists
manifest.json
sources.json
ATTRIBUTION.txt
licenses/                         applicable notices/terms references
assets/                           only permitted selected evidence assets
```

`observations.csv` uses one row per observation/quantity, with observation/acquisition/record IDs, quantity kind, original value/unit, display status, uncertainty fields, time/spatial support, processing version, and source URL. An observation without a permitted quantity still has a row with explicit missing/suppressed status. Guard spreadsheet formula injection in free-text CSV cells; do not convert legitimate numeric negatives into text accidentally.

GeoJSON features have stable IDs, geometry-role labels, and observation/facility relationships. `relationships.json` remains useful within one provider and is always included, even when the cross-provider example is unresolved. Include stable retrieval instructions instead of restricted raw files. Never export a suppressed value via a secondary source file.

The main thread sends the export worker a single canonical, fingerprinted input, rather than passing independently assembled UI fragments. Workers execute the same pure rule code in their own context; the returned input fingerprint must match the preview selection.

Canonical evidence reproducibility means the same snapshot, selection, rule version, and relevant settings yield the same ordered canonical facts and claims. Exclude generated timestamps from this fingerprint; document canonicalization, sorting, and serialization. User notes, if included, have a separate content hash. Each exported file has an integrity checksum in the manifest; the manifest does not recursively hash itself. Include a detached `manifest.sha256` for integrity verification; it is not a signature or proof of trusted authorship.

Byte-identical PDF files are not required: generation metadata may differ. Checksums prove identity/integrity, not scientific truth. Validation compares canonical evidence fingerprints and semantic report contents. Export errors preserve the workspace and show a specific retry action.

## 12. Resilience, permissions, and security

Distinguish loading, invalid link, unresolved place, no matching observations, unknown coverage, missing image, unavailable basemap, unavailable source website, and export failure. No failure state may substitute fake data, turn null into zero, silently widen geographic scope, or show a previous date's asset under a new label.

Validate snapshot schemas and all entity references at build time. Validate bounded query/state inputs at runtime. Only manifest-approved local assets enter export. Never fetch arbitrary user-supplied URLs in the Worker or export worker. Use safe link schemes, escaped text, a documented content-security policy compatible with map/web workers, and no client secrets.

Software license: **MIT** for original application code. Upstream datasets, basemaps, fonts, artwork, and dependencies retain their own terms; MIT does not relicense them. Maintain a per-source/per-asset license ledger with attribution text, redistribution status, export restrictions, review date, and official terms URL. Carbon Mapper’s January 13, 2026 terms §§3.1–3.4 explicitly allow reproduction, derivatives, and distribution subject to noncommercial purpose, attribution, and the same downstream terms. Decision: bundle the reviewed public raster assets in the repository and deployment, with “Source: Carbon Mapper,” a data-specific terms notice, and applicable downstream conditions. Code remains MIT; these data assets do not. This resolves anonymous clone/demo access without a live fetch dependency. Review and preserve applicable terms before public distribution, not only a generic “data from” label.

Use textual source attribution without implying endorsement. Do not use provider logos unless their use is permitted. GeoNames attribution and OpenStreetMap/OpenMapTiles notices remain visible where required. Reference mockups are design inputs, not upstream evidence or production screenshots.

The production manifest validator rejects synthetic flags, fixture/reference/preflight paths, missing checksums, unknown entity IDs, undocumented quantity units, undefined masks, missing license decisions, and generated scientific assets. Decorative art is allowed only under its separate role and may not be referenced by observations or exports as evidence.

Measure initial load, date changes, local search, and PDF/ZIP generation on a recorded device/browser/network/dataset. Proposed performance targets are interaction response under 200 ms for local state changes, prepared date switch under 1 second when cached, and featured-case export under 10 seconds on the test laptop. Publish measured export duration in the README whether or not the target is met. Record actual results and fix material stalls; do not advertise these targets as measurements. Heavy work runs off the main thread and supports cancellation.

## 13. Build sequence and proof of completion

These phases specify dependencies, not time limits or permission checkpoints. Routine implementation and source-review decisions proceed without another product debate.

1. **Data foundation:** pin the real imagery pair; finish masks, quantity/uncertainty/terms mapping, case scope, and version lineage. Investigate the cross-provider candidates. Acquire the real ambiguity and inventory examples.
2. **Corrected visual target:** initialize `web/`, implement the token/type system, generate decorative assets, and render the real-data landing/workspace with the persistent timeline. Inspect desktop/mobile composition before multiplying screens.
3. **Evidence workflow:** complete search/list/map parity, acquisition selection/replay/compare, evidence-linked findings, lineage drawer, local notes/selection, and comparison assessment.
4. **Outputs:** implement the canonical evidence engine, PDF/ZIP, coverage/Method content, attribution, and reproducibility documentation.
5. **Verification and release:** test the invariants and failure cases below; inspect actual web and PDF output; deploy, check public routes and downloads, and prepare submission assets. Do not call the product complete because only the featured screenshot looks finished.

### Required verification

| Area | Evidence needed to pass |
|---|---|
| Real imagery | Both exact release assets decode, retain proper masks/units, align in map and report, and resolve to their acquisition |
| Race conditions | Rapid A/B selection and failed loads cannot produce date/image/legend mismatch |
| Counting | Real version records collapse acquisition/day counts correctly; synthetic same-scene distinct-plume fixture preserves both plumes |
| Claims | 3→2→1→0 selection changes produce correct scope/grammar and evidence IDs; full-case context stays intact |
| Unknown identity | Unresolved relationships do not inflate a verified count or silently merge observations |
| Quantities | Zero, null, hidden, unavailable, and inapplicable remain distinct in UI/CSV/JSON/PDF |
| Comparison | Failed and unknown preconditions produce distinct reasons; annual mass versus single-acquisition rate cannot produce a discrepancy |
| Search | Disambiguation, supported city/region/ZIP, empty dataset, missing gazetteer shard, and radius scope behave honestly |
| Resilience | Provider API outage, basemap failure, unavailable image, storage denial, invalid shared URL, and export error preserve evidence/work appropriately |
| Export | Extracted PDF text and structured package agree on selected IDs, dates, quantities, claims, notes policy, and fingerprint; all packaged hashes verify |
| Visual QA | Inspect all four viewport sizes and every PDF page for clipping, illegible legends, missing fonts, and misleading map composition |
| Accessibility | Keyboard-only core journey, list alternative, focus handling, reduced motion, contrast, and accessible status announcements |
| Production boundary | Build fails on synthetic/reference/preflight evidence, missing licenses, suppressed-value leakage, and unknown IDs |
| Public release | Direct case links, refresh, Method, source links, and actual downloaded PDF/ZIP work on the deployed site |

Test high-risk behavior and real provider fixtures; avoid tests that merely repeat rendering markup. Record only checks actually run. A mathematical or schema check cannot substitute for visual inspection of a map/report.

Documentation must let another developer install the pinned dependencies, run the frozen example without provider credentials, verify the manifest, and rerun preparation for permitted sources. If protected source downloads need an Earthdata account, document that separately; never make a judge's basic demo depend on it.

## 14. Hackathon demonstration and honest claims

The official criteria are Originality, Adherence to Track, Completion, Learning, Design, and Technology. There are no adopted numeric scoring weights. The theme is Earth Forward. The provided event page requires a demo/pitch no longer than five minutes, a repository/code link, and a live link where applicable. [Official event](https://nextstep2026.devpost.com/)

Demo spine:

1. Open the real case, with acquisition dates and snapshot age visible.
2. Compare two recorded dates and explain the geographic scope of recurrence.
3. Reveal multiple products/versions of one observation. Include a cross-provider reveal only if verified.
4. Click a finding, expose its records, deselect evidence, and watch the finding update.
5. Show the actual reported-versus-observed assessment and why a number is withheld.
6. Show the meaningful attribution ambiguity and its next evidence step.
7. Download the brief and structured evidence package.

Keep the explanation in ordinary language. “Two publications can share one observation” is easier to demonstrate than a speech about provenance architecture. Explain what a user can do next without claiming they have proved misconduct or reduced emissions.

The Learning account must describe work actually performed. Valid examples already include discovering valid zeros versus nodata in different raster products, differing grids for visualization/quantification, processing revisions that change published estimates, and conflicting NASA rate documentation versus current fields. Do not invent an earlier TROPOMI implementation, numerical experiment, destriping bug, or abandoned research result from a quoted model narrative. Preserve that history only if its underlying artifacts are obtained and reviewed.

Attempt two first-time user walkthroughs if participants are available: ask the person to distinguish repeated detections from continuous emissions, find a source record, and create a brief. If none occur, report internal walkthroughs honestly. Record observed failures and corrections rather than invented success percentages.

The final deliverable is the working application, public deployment, source repository, verified data snapshot and terms, readable Method page, downloadable outputs, validation record, and a demo script grounded in real behavior. No promise of first place or zero future revisions accompanies this specification. Product decisions are settled; external-data facts and implementation quality must still earn verification.

## 15. Minimum demonstration grounded in validated evidence

If optional cross-provider validation does not pass, the supported demonstration remains: open the Yemen area case; compare its two dates; reveal seven product/version records for the April plume; click a finding and change its selected evidence; explain why episodic rates do not supply annual mass; download the matching brief and ZIP. A real inventory record and substantive attribution case remain required release work under §2, and enrich this sequence once validated. The fallback does not pretend those examples already exist.

The shared color scale stays because it makes the same enhancement value mean the same color. Per-image autoscaling is not a remedy for confusing enhancement with emissions. Both maxima and the rate-comparison limitation are shown. No speculative TROPOMI notebook is added without original assumptions; actual raster and lineage decisions already supply an honest Learning account.


## 18. Implemented release decisions (19 September 2026)

This section resolves data-dependent choices for the first implementation. It does not relax scientific validity to match the reference artwork.

- **Dataset:** two reviewed geographic cases, five real acquisitions. Yemen: 20 April and 23 October 2024. Newby Island, California: 3 August, 7 August, and 26 September 2024. Cases serve multiple requirements; the preferred 3–6 case count is not filled with unreviewed examples.
- **US context:** EPA facility 1006179, FRS 110006533117, registry point 37.45973 / −121.94164. Public Envirofacts Subpart HH record for 2023 reports 7,954.5 metric tonnes CH4. Do not use the summary workbook's 198,862.5 tonnes CO2e as methane mass. Subpart HH methodology and the original API response are linked.
- **Ambiguity:** source-process attribution at a real multi-process site, supported by the official permit. This is not a claim that two facilities are equally probable; no quantitative location uncertainty was provided.
- **US image scale:** fixed 0–9,000 ppm·m, covering native valid-pixel maxima 5,371.5664 / 8,453.2188 / 3,385.5125. The same explicit brightness-versus-rate caution applies. The legend is generated from the same 256-entry cividis color map as the raster.
- **Raster verification:** every valid quantification-crop pixel agrees exactly with the corresponding numeric visualization pixel after nearest-neighbor alignment: 166 / 133 / 38 / 101 / 57 samples. Valid zeros are preserved independently of missing pixels.
- **Cross-provider lineage:** candidates remain unresolved. The demonstrated record reconciliation is seven April product/version records for one plume observation.
- **Architecture:** Vinext/Vite, React, TypeScript, MapLibre; frozen same-origin data, local browser storage, independent browser workers for search and PDF/ZIP. No user-notes API or database is necessary. Worker bundles are explicitly generated for stable delivery in development and production.
- **Place lookup:** 34,146 GeoNames cities with administrative/country names and 41,490 US postal centroids. Region queries search cities in that region; the app does not invent a regional centroid. A city result is the search center.
- **Visual correction:** the workspace uses its own paper-cut perimeter asset closely derived from the second reference, cream floating cards, teal controls, a prominent selected-image preview, and larger serif headings. The actual maps retain their scientific raster geometry. Generated framing is visually outside the evidence, never exported as data.
- **PDF:** four intentionally structured sections with automatic pagination for longer notes or provenance. Contents and evidence fingerprints are reproducible; file timestamps may differ. Scientific images and the continuous legend are verified against the snapshot hashes before export.
- **Scope labels:** date filters constrain map/list browsing; the full-case timeline and report selection remain explicit. An empty browse filter does not erase already-selected evidence.
- **Further history view:** optional multi-layer history remains outside this release; date replay and two-date comparison are included.

### Worldwide exploration and graduated plume rendering

Investigation and place maps include a separately labeled NASA/JPL EMIT context layer containing all 1,686 unique plume IDs in the saved public methane feed (10 August 2022–22 September 2025; checked 19 September 2026). Point/polygon representations are paired and counted once. Clusters count plume records, never emissions or independent acquisitions. Markers represent maximum-enhancement pixels, not source origins. Published footprints appear at local zoom; selectable records disclose date, peak column enhancement, and original source data. This layer includes all catalog dates independently of case filters, does not imply exhaustive worldwide coverage, and is excluded from reviewed case counts and exports.

Prepared numeric plume imagery uses 64 fixed-scale color bands instead of five, preserving the existing valid-cell interpolation and nodata mask. Original sensor samples remain inspectable. No smoothing into unmeasured areas, invented plume shapes, or per-date scale changes are permitted.
