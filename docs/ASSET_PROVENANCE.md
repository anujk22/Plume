# Decorative artwork

Three assets were generated with the built-in OpenAI image-generation tool from the user's supplied references. They are decorative illustration only. Actual map and report imagery comes from the numeric Carbon Mapper rasters.

- `public/art/paper-landscape.png`: recreate the reference's cream left field, layered teal paper ribbon, river valley, mountains and warm sun. Remove all interface, text, scientific map imagery and methane graphics. Retained for the app header background.
- `public/art/home-landscape.png`: a new edit of the supplied homepage reference, preserving its exact valley, sun, paper boundary and composition while removing all UI, map streets and fictional methane blobs. Used only as homepage decoration; the interactive map uses real geographic tiles and published plume outlines.
- `public/art/workspace-frame.png`: recreate the second reference's paper-cut perimeter, cream header, thin mountain horizon, sun at upper right, teal side contours, and cream/blue lower edge with wooded corners. Keep the center blank pale blue-green; no map, road, heatmap, UI, label, logo, or data. Used only behind HTML panels and the separate scientific map.

Live typography, cards, controls, navigation, legends, source references, and scientific layers are implemented in code. The generated image is not used as a flattened substitute for the interface.
