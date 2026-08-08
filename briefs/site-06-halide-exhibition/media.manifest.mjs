// media.manifest.mjs — HALIDE: A Century of Light (site-06, museum exhibition) — IMAGERY-LED
// All URLs verified 2026-08-08: HTTP 200, content-type image/jpeg.
// Two source classes:
//  - picsum.photos seeded URLs (stable, free for any use), grayscale baked in via ?grayscale —
//    single query param only, do not append more.
//  - Wikimedia Commons PUBLIC DOMAIN prints — real historical works; license + source page in
//    the comment above each entry. Keep artist/date credits in on-page captions.
export default [
  { slot: 'hero-monument-fog', src: 'https://picsum.photos/seed/halide01/1600/1000?grayscale',
    alt: 'Statue of Liberty emerging from dense fog, monochrome' }, // 1600x1000

  // Dorothea Lange, "Migrant Mother" (1936). Public domain — work of the U.S. federal government
  // (Farm Security Administration). Source: https://commons.wikimedia.org/wiki/File:Lange-MigrantMother02.jpg
  // Original 6205x8066, ~5.6MB — sideload is slow but one-time.
  { slot: 'pd-migrant-mother', src: 'https://upload.wikimedia.org/wikipedia/commons/5/54/Lange-MigrantMother02.jpg',
    alt: 'Dorothea Lange, Migrant Mother, 1936 — Florence Owens Thompson with two of her children, Nipomo, California' },

  // Ansel Adams, "The Tetons and the Snake River" (1942). Public domain — created for the U.S.
  // National Park Service Mural Project (NARA 79-AA-G01).
  // Source: https://commons.wikimedia.org/wiki/File:Adams_The_Tetons_and_the_Snake_River.jpg
  { slot: 'pd-tetons', src: 'https://upload.wikimedia.org/wikipedia/commons/2/21/Adams_The_Tetons_and_the_Snake_River.jpg',
    alt: 'Ansel Adams, The Tetons and the Snake River, 1942, Grand Teton National Park, Wyoming' }, // 3000x2402

  // Lewis Hine, "Power house mechanic working on steam pump" (1920). Public domain (published
  // before 1926; U.S. copyright expired).
  // Source: https://commons.wikimedia.org/wiki/File:Lewis_Hine_Power_house_mechanic_working_on_steam_pump.jpg
  { slot: 'pd-power-mechanic', src: 'https://upload.wikimedia.org/wikipedia/commons/6/60/Lewis_Hine_Power_house_mechanic_working_on_steam_pump.jpg',
    alt: 'Lewis Hine, Power house mechanic working on steam pump, 1920' }, // 2155x3000 portrait

  { slot: 'flats-mist', src: 'https://picsum.photos/seed/halide00/1600/1000?grayscale',
    alt: 'Bare dead trees on cracked mud flats in mist, monochrome' }, // 1600x1000
  { slot: 'night-alley', src: 'https://picsum.photos/seed/halide02/1200/1500?grayscale',
    alt: 'Old-town alley at night under a string of lamps, monochrome' }, // 1200x1500 portrait
  { slot: 'coast-rocks', src: 'https://picsum.photos/seed/halide05/1600/1000?grayscale',
    alt: 'Dark rocks and tidal sand along a muted shoreline, monochrome' }, // 1600x1000
  { slot: 'farm-rows', src: 'https://picsum.photos/seed/halide07/1600/1000?grayscale',
    alt: 'Aerial geometry of planted farm rows, monochrome' }, // 1600x1000
  { slot: 'ridge-fog', src: 'https://picsum.photos/seed/halide09/1600/900?grayscale',
    alt: 'Forested ridgeline dissolving into fog, monochrome' }, // 1600x900 wide
  { slot: 'camera-still', src: 'https://picsum.photos/seed/bloom15/1600/1000?grayscale',
    alt: 'Vintage rangefinder camera with strap on black, monochrome still life' }, // 1600x1000
];
