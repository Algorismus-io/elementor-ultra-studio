# Brief packages — index

Ten build-ready site brief packages for the elementor-ultra-studio agent pipeline. Each dir has
`BRIEF.md` (complete brief, launcher placeholders literal), `media.manifest.mjs` (every URL
verified HTTP 200 + image/*), `meta.json`. Verified 2026-08-08.

| NN | Name | Industry | Imagery-led? | Display font | Palette | Archetypes |
|----|------|----------|--------------|--------------|---------|------------|
| 01 | Ember & Oak | Restaurant (live-fire dining) | yes (6 img) | Fraunces (+ Karla) | `#191310` `#F2EAD9` `#C1440E` `#F4A259` `#8A817C` | full-bleed image seams · split 60/40 · menu as table object · evening timeline band |
| 02 | Meridian Atelier | Architecture studio (adaptive reuse) | yes (6 img, grayscale) | Archivo (+ Instrument Sans) | `#FAFAF7` `#E5E3DD` `#141412` `#55534C` `#3E7C6F` | asymmetric offset grid · sticky side rail · oversized numerals as layout · works-index table |
| 03 | Pip & Parcel | Children's craft-box subscription | no (0 img) | Baloo 2 (+ Nunito) | `#FFF8EB` `#26547C` `#FFC53D` `#FF70A6` `#06D6A0` | overlapping sticker cards · wavy diagonal seams · M-A-K-E words as layout · rotated ticket strip |
| 04 | Lowtide | Coastal music festival | no (1 img) | Unbounded (+ Space Grotesk) | `#120726` `#5A189A` `#F72585` `#FF8500` `#FFEEDB` | lineup type as layout · day-rail timeline · hard-seam color blocks · rotated marquee strip |
| 05 | Cedarline Clinic | Healthcare clinic (membership care) | no (1 img) | Sora (+ Newsreader) | `#F4F7F2` `#FDFDFB` `#1E3D34` `#7FA98C` `#C97B4A` | split 50/50 · multi-column directory · comparison table object · very short urgent banner |
| 06 | HALIDE: A Century of Light | Museum exhibition (photography) | yes (10 img, 3 PD prints) | Syne (+ IBM Plex Sans) | `#111111` `#F5F4F0` `#C9C9C9` `#E3FF00` `#6E6E6A` | sticky chapter rail · full-bleed image seams · multi-column wall text · visiting-grid table |
| 07 | Crag & Fern | Outdoor gear (packs & shelters) | yes (7 img) | Bricolage Grotesque (+ Inter) | `#1F3B2C` `#F4F3EF` `#DCD8CC` `#55584F` `#A84B2A` | split 60/40 · overlapping gear cards · spec-sheet table object · diagonal ridge seams |
| 08 | Quietpetal | Florist studio | yes (6 img) | Cormorant Garamond (+ Mulish) | `#F7F1EC` `#C88C86` `#7A8B6F` `#4A2C3E` `#FBF8F4` | asymmetric offset grid · multi-column care notes · seasonal rail band · tall/short rhythm feature |
| 09 | Pixelmoth — LUMEN DRIFT | Indie game studio | no (0 img) | Silkscreen (+ Rubik) | `#120458` `#FF2E88` `#00F0FF` `#EDEBFF` `#7A6FF0` | title type as layout · level-select color blocks · overlapping devlog cards · changelog table |
| 10 | Southpaw Barber Club | Barbershop | no (1 img) | Alfa Slab One (+ Libre Franklin) | `#1B2A41` `#F4EFE6` `#A62639` `#7D8CA3` | price handbill as table object · split 50/50 · barber-pole stripe seams · walk-in board band |

## Verification totals

- **Font families verified**: 20/20 (2 per site; every family fetched from
  `fonts.googleapis.com/css2` with listed weights → HTTP 200). No display family repeats.
- **Image URLs verified**: 38/38 (each fetched → HTTP 200 + `image/jpeg`): 35 seeded
  picsum.photos URLs (stable seeds; grayscale baked into URLs where the design requires it) +
  3 Wikimedia Commons public-domain prints (Lange 1936, Adams 1942, Hine 1920 — license and
  source page recorded in `site-06-halide-exhibition/media.manifest.mjs`).
- Imagery-led: 5 of 10 (01, 02, 06, 07, 08). Every image was visually inspected via contact
  sheets before slot assignment; alt text describes actual content.
