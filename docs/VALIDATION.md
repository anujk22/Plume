# Validation record

Performed on 19 September 2026, macOS Apple Silicon, Node 22, Chromium 153.

## Passed

- TypeScript typecheck and production Vinext build.
- Eight unit tests: selected-evidence 3→2→1→0 grammar and provenance; acquisition identity; blocked annual comparison; notes exclusion; canonicalization; geodesic distance; valid snapshot; rejected suppressed values/missing asset hashes.
- Six browser regression tests: selected findings, map/list date-filter parity, reload persistence, real EPA context, city/ZIP search, honest uncovered-place result, unavailable snapshot, unavailable basemap, and responsive width constraints.
- Full browser journey generated the real PDF and ZIP, checked local-note persistence, and exercised selection and comparison. No page errors recorded. The regression suite also checks actual PDF/ZIP generation, evidence-fingerprint agreement, all packaged hashes, and invalidation after selection changes.
- Screenshots inspected at 1672, 1024, 768 and 390 CSS pixels. No horizontal page overflow. The workspace was revised against the supplied reference: paper-cut frame, floating cream cards, larger serif type, prominent imagery and pill controls.
- All five real numeric visualization / quantification-crop pairs align exactly at every valid crop sample: 166, 133, 38, 101, 57. Valid zero and missing pixels remain separate. Native CRS, bounds and quantities are preserved.
- Downloaded ZIP hashes and detached manifest hash verified. Default export excluded the test note. Three selected observations and all claim IDs matched the structured outputs.
- PDF pages rendered and visually inspected; orphaned overflow pages were corrected into intentionally structured sections.
- WebMCP: three tools registered in a supported browser. Valid evidence selection updated the visible findings; unknown IDs and empty report selections failed intentionally; valid report staging opened the visible builder. Private notes were never returned.
- Local three-observation PDF preview measured at approximately 1.2 seconds in repeated complete-journey checks.

## Scientific limitations that remain by design

- Cross-provider NASA / Carbon Mapper candidate lineage has not been verified. Only the within-provider seven-product example is advertised.
- Facility/process attribution, continuous emissions, coverage denominators and annual satellite totals are not established.
- Uncertainty interval definitions are not established in the snapshot. The provider's reported uncertainty is shown with that limitation.
- Source-process ambiguity uses real permitted operations at one site; it does not claim measured positional uncertainty or equally probable facilities.
- No user-adoption, repaired-leak, avoided-emission, or health benefit has been measured.

## Release checks

The exact final source must pass typecheck, unit/browser checks and production build before deployment. A deployed URL is not considered public judging access unless its audience has been explicitly made public. Owner-only hosting is a review preview.
