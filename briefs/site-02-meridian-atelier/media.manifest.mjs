// media.manifest.mjs — Meridian Atelier (site-02, architecture studio) — IMAGERY-LED, monochrome
// All URLs verified 2026-08-08: HTTP 200, content-type image/jpeg. Grayscale is baked into the
// URLs (?grayscale) — do not add a second query param (framework rule: single query param max).
// Source: picsum.photos seeded URLs — stable, free for any use.
export default [
  { slot: 'hero-monument', src: 'https://picsum.photos/seed/bloom27/1600/1000?grayscale',
    alt: 'Monolithic concrete monument photographed from below against open sky, black and white' }, // 1600x1000
  { slot: 'atrium-spiral', src: 'https://picsum.photos/seed/bloom20/1600/1000?grayscale',
    alt: 'Circular courtyard interior spiralling up toward the sun, black and white' }, // 1600x1000
  { slot: 'bridge-cables', src: 'https://picsum.photos/seed/bloom19/1200/1500?grayscale',
    alt: 'Suspension-bridge tower and cable web in one-point perspective, black and white' }, // 1200x1500 portrait
  { slot: 'escalator-vault', src: 'https://picsum.photos/seed/bloom21/1600/1000?grayscale',
    alt: 'Symmetric escalator tunnel under a ribbed vault, black and white' }, // 1600x1000
  { slot: 'bridge-street', src: 'https://picsum.photos/seed/bloom14/1200/1500?grayscale',
    alt: 'Steel bridge framed between two brick facades, black and white' }, // 1200x1500 portrait
  { slot: 'city-panorama', src: 'https://picsum.photos/seed/bloom24/1600/900?grayscale',
    alt: 'Dense old-city rooftop panorama under flat light, black and white' }, // 1600x900 wide
];
