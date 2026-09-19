# Plume

**See the observations. Follow the evidence.**

Plume turns a reviewed methane catalog snapshot into an inspectable investigation. It separates acquisitions from product revisions, recomputes findings when selected evidence changes, explains why an annual comparison cannot be calculated, and exports a PDF plus a verifiable evidence package.

## Run

Requires Node 22.13 or newer.

```sh
npm ci
npm run dev
```

Open `http://localhost:5173`. No data API credentials are needed. The five reviewed observations, scientific imagery, font files, and place lookup are bundled. The contextual basemap uses OpenFreeMap and needs internet; a disclosed basemap failure preserves the dated evidence.

```sh
npm run typecheck
npm test
npx playwright install chromium
npx playwright test
npm run build
```

The predev/prebuild step bundles browser workers. PDF layout and ZIP creation run off the main thread. Notes are local-only; no database or account is used by the app.

## What to try

1. Open the Yemen case and compare the two real dates.
2. Open **Follow the record trail**: seven product/version records represent one April plume observation.
3. Open Newby Island. Click the established finding, deselect a date, and see three dates become two, then one.
4. Open the comparison assessment. The real 2023 EPA methane total cannot be compared numerically to episodic 2024 rates.
5. Inspect the permitted landfill/composting context. Nearby infrastructure does not establish the emitting process.
6. Create a brief. Its ZIP contains structured facts, source links, imagery, claims, relationships, licenses, and a checksum manifest.

## Evidence and limits

- Two geographic investigations; five real EMIT acquisitions published by Carbon Mapper, 20 April–23 October 2024. Retrieved 19 September 2026.
- No live global monitoring, custom emissions model, health inference, annualization, or compliance accusation.
- Acquisition dates establish recurrence in an area, not continuous emissions or a common emitting facility.
- Seven within-provider product/version relationships are verified. Cross-provider NASA / Carbon Mapper candidates remain unverified and are not counted as corroboration.
- Newby Island EPA record: facility 1006179, 2023, Subpart HH, methane `ghg_quantity=7954.5` metric tonnes CH4. Its associated summary-workbook value in CO2e is a different quantity.
- Registry coordinates are points, not operational boundaries. Official permitted operations establish a real unresolved source-process question; the app does not manufacture uncertainty radii or separate component locations.
- Image display uses numeric rasters, nearest-neighbor reprojection, preserved nodata, and cividis. Image enhancement in ppm·m is separate from the published plume rate in kg/h.

## Reproducibility and privacy

The PDF and ZIP share the same selected observations and rule engine. A canonical evidence fingerprint includes snapshot/schema/rule versions, selected records, quantities, asset metadata, case context, relationships, and derived claims. Generated timestamps and private notes are excluded; included notes have their own hash. File hashes in `manifest.json` and detached `manifest.sha256` provide integrity checks, not trusted signatures. Repeated PDFs may differ at the byte level because creation metadata differs.

Public links contain only snapshot/case/observation IDs, selected evidence, and view state. Notes remain in browser storage unless explicitly included in a download. Clearing local work requires confirmation.

## Performance observed locally

In headless Chromium 153 on this macOS Apple Silicon host, the three-observation Newby PDF preview took approximately **1.2 seconds** after opening the case. This is a local measurement, not a universal guarantee. Map and report bundles are loaded separately; the report worker starts on demand.

## Source and licensing

Original application code: MIT. **Data is not MIT licensed.** See `docs/DATA_LICENSES.md`. Source: Carbon Mapper. Its noncommercial, attribution, and downstream conditions apply to included data and derived imagery. EPA, GeoNames, Natural Earth, basemaps, fonts, artwork, and dependencies retain their respective terms. Plume is not endorsed by its data providers.

The authoritative build specification is `docs/PLUME_PRD.md`. `docs/VALIDATION.md` records actual checks and limitations. `docs/DEMO.md` gives a concise demonstration sequence.
