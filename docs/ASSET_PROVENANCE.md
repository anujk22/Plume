# Decorative artwork

Four assets were generated with the built-in OpenAI image-generation tool from the user's supplied references. They are decorative illustration only. Actual map and report imagery comes from the numeric Carbon Mapper rasters.

- `public/art/paper-landscape.png`: recreate the reference's cream left field, layered teal paper ribbon, river valley, mountains and warm sun. Remove all interface, text, scientific map imagery and methane graphics. Retained for the app header background.
- `public/art/home-landscape.png`: a new edit of the supplied homepage reference, preserving its exact valley, sun, paper boundary and composition while removing all UI, map streets and fictional methane blobs. Retained as an earlier homepage decoration; superseded by `home-illustrated.png`.
- `public/art/workspace-frame.png`: recreate the second reference's paper-cut perimeter, cream header, thin mountain horizon, sun at upper right, teal side contours, and cream/blue lower edge with wooded corners. Keep the center blank pale blue-green; no map, road, heatmap, UI, label, logo, or data. Used only behind HTML panels and the separate scientific map.

Live typography, cards, controls, navigation, legends, source references, and scientific layers are implemented in code. The generated image is not used as a flattened substitute for the interface.

## Scientific map previews

`public/data/home-plumes/` contains numeric renderings of the provider's `l3a-ime-ch4-mfa-v3 / ime-cmf-concentrations.tif` products for the five Newby Island and Marib observations. These are not generated illustrations. `scripts/prepare_home_plumes.py` preserves the provider's zero nodata mask, trims only that mask's outer margin, reprojects with nearest-neighbor sampling, and uses the existing cividis legend at the snapshot’s fixed case scales (0–9,000 ppm·m for Newby Island; 0–5,500 ppm·m for Marib). No threshold, smoothing, interpolation of concentrations, or synthetic hotspots are added. Every display pixel is checked against a native provider sample. The manifest records geographic bounds, source URLs, input and output checksums, and native sample counts. Run the script with `--check` to reproduce and verify the previews; CI includes this check. The investigation maps use these provider-masked images by default. The “Full acquisition scene” layer restores the full scene raster. Full scene imagery remains in the evidence exports.

## Illustrated landing page

`public/art/home-illustrated.png` was generated with the built-in image-generation tool from the user's original homepage reference. It recreates the cream river valley, layered teal paper boundary, stylized cartographic texture, and sculpted warm contour shapes. These shapes are concept artwork, not plume measurements or real geography. The homepage explicitly labels the illustration, displays no numerical legend or measured rate against it, and links into separate real investigation maps. The small homepage card uses a decorative crop of the same artwork. Text, cards, navigation and search are HTML; the generated asset contains no interface. It is never included in evidence manifests, observation thumbnails, or exports. Exact generation prompt: [home illustration prompt](design/home-illustration-prompt.md).
