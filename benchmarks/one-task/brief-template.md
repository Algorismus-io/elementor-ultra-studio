# Build brief: "One Task at a Time" — Figma → Elementor V4, pixel-faithful ({{RUN_ID}})

You are building a single dark-theme SaaS landing page in Elementor, reproducing a Figma design
pixel-faithfully, using the **elementor-jsx** framework. Work efficiently: batch your work, use the
provided one-shot verification tool instead of hand-written browser scripts, and stop polishing at
the stated fidelity bar.

## Target site (already running — do NOT provision anything, do NOT kill any process)

- URL: `{{WP_URL}}` (WordPress Playground, PHP-WASM — **no wp-cli, no Docker**; REST only)
- Auth: `WP_USER=admin`, `WP_APP_PASSWORD=VorycCYtTT00nOS06BJ0BePq`
- Elementor 4.2.1 + Elementor Pro 4.1.0 ACTIVE, atomic elements on, companion ultra plugin live.
- The server SELF-HEALS if it crashes (supervisor restarts it within ~15s) — if a request suddenly
  fails, wait 15s and retry before diagnosing.
- Do NOT open pages in the Elementor editor (it can wipe the global-classes store).

## Tooling

- FIRST: invoke the `elementor-ultra` skill (Skill tool). Do NOT spend time re-reading full framework
  docs beyond the skill — the gotchas you need are in this brief.
- exjsx CLI: `{{EXJSX_CLI}} <build|deploy|lint|media|inspect>`
- Env for deploy: `WP_URL={{WP_URL}} WP_USER=admin WP_APP_PASSWORD=VorycCYtTT00nOS06BJ0BePq`
- **Health/self-heal** (use if anything looks broken, instead of debugging by hand):
  `WP_URL={{WP_URL}} WP_USER=admin WP_APP_PASSWORD=VorycCYtTT00nOS06BJ0BePq {{STUDIO_CLI}} doctor --page <id>`
- **Scoring — ONE call per convergence round** (do NOT write your own playwright/measure scripts):
  `EXJSX_IT_PLAYWRIGHT={{PLAYWRIGHT}} WP_URL={{WP_URL}} WP_USER=admin WP_APP_PASSWORD=VorycCYtTT00nOS06BJ0BePq {{STUDIO_CLI}} bench score --scenario {{SCENARIO_DIR}} --page-url / --run-id {{RUN_ID}}-r<N> --notes "<what you changed>"`
  One call gives you EVERYTHING, health-gated (self-heals CSS before measuring): geometric anchors
  (with image PRESENCE floors — an image at the right y with zero width fails), a logo-ticker paint
  band, total height, a WIDTH-GENERALIZATION probe at 1512px, a mobile-390 overflow probe, AND a
  photometric pixel-diff of the rendered page against the reference render.
  **PASS requires ALL: anchor mean <=2px, photometric mean <=10/255, generalization ok, mobile 390.**
  Photometric guide: <=3 near-identical / 3-8 faithful / 8-20 visible deviations. The JSON names the
  worst 50px band (`worstBand.band_y`) — crop the reference at that y vs your build to see WHAT
  differs (gradients, ink weight, missing art are the usual suspects).

## Project location

Create the fs-project at:
`{{PROJECT_DIR}}`
Slug: `home`. After deploy, set it as the front page via REST `/wp/v2/settings` `{show_on_front:"page", page_on_front:<id>}`.

## Design reference (all local, already downloaded)

Reference dir: `{{SCENARIO_DIR}}/`

- `assets/export-full.png` — **full-res 1200×4081 render of the entire design. Ground truth.**
  Sample exact colors from its pixels; measure gaps/cap-heights/wrap-points from it. Read it in
  slices (PIL crop) — don't trust downscaled views for color or type judgments.
- Image assets (upload to WP via `exjsx media`; use absolute `{{WP_URL}}/...` URLs):
  - `assets/cursor-3d.png` (1500²) — purple 3D cursor, hero left (~200×200 at x137,y378)
  - `assets/message-3d-a.png` / `message-3d-b.png` (1500²) — purple 3D speech bubble, hero right (~200×200 at x883,y301)
  - `assets/pie-3d.png` (1500²) — 3D pie shape, sign-up left (263² at x49,y3540)
  - `assets/gear-3d.png` (1500²) — 3D gear, sign-up right (268² at x885,y3739)
  - `assets/app-night.png` (2280×1414) — product screenshot (1092×678 at x46,y1985)
  - `assets/logo-icon.png` (120²) — colorful diamond app icon, nav logo
  - Ticker logos: `assets/logo-{acme,quantum,echo-valley,celestial,pulse,apex}.png` and pre-tinted
    `-tinted.png` variants of each. CHECK INK-VS-BACKGROUND before choosing: sample the PNGs — if the
    ink composites to invisible over the section background, use the tinted variants. The verify
    tool's ticker paint band will catch a wrong choice.
- `assets/svg_1..20.svg` — vector layers (nav/social/card icons, tag arrow, etc.). Inline what you
  need; recolor to match the reference.

## Page structure + anchor targets (Figma absolute y, page is 1200w × 4081h)

| y | h | section |
|------|------|---------|
| 0 | 46 | Announcement bar — light gradient (pink→mint), dark text: "This page is included in a free SaaS Website Kit. View the complete Kit →" |
| 46 | 81 | Nav — logo-icon + "made by ⚡Framer" badge left, white "Get for free" pill button right, dark bg, hairline bottom border |
| 127 | 731 | Hero — black→purple radial glow with a dark "planet horizon" curve at bottom (reproduce with radial/linear gradients + the planet ellipse from the svg assets); centered: outlined tag pill "Version 2.0 is here — Read more →", giant white H1 "One Task at a Time" (2 lines, ~120px+, tight lh), body ~457w, white "Get for free" button; cursor-3d left + message-3d right flanking the H1 |
| 858 | 150 | Logo ticker — gray caption "Trusted by the world's most innovative teams", row of 6 logos, muted |
| 1008 | 742 | Features — centered H2 "Everything you need" (~54px), body below, then 3 cards 360×260 (gap 16): near-black cards, 1px #ffffff15 border, radius ~12; each: white rounded icon tile (~48px, dark glyph), bold title, muted body. Copy: "Integration ecosystem"/"Enhance your productivity by connecting with your favorite tools, keeping all your essentials in one place." · "Goal setting and tracking"/"Define and track your goals, breaking down objectives into achievable tasks to keep your targets in sight." · "Secure data encryption"/"With end-to-end encryption, your data is securely stored and protected from unauthorized access." |
| 1750 | 1074 | Product — H2 "Intuitive interface", body "Celebrate the joy of accomplishment with an app designed to track your progress, motivate your efforts, and celebrate your successes, one task at a time.", then app-night.png 1092w, radius ~12, subtle border |
| 2824 | 706 | FAQ — H2 "Frequently asked questions"; 4 accordion rows 673w, each "How does the pricing work for teams" + "+" icon, 1px #ffffff15 hairline separators. REAL accordions (details/summary or small JS toggle) |
| 3530 | 487 | Sign-up CTA — H2 "Get instant access", body "Celebrate the joy of accomplishment with an app designed to track your progress and motivate your efforts.", email form: dark input "name@email.com" + white "Get access" button; pie-3d floats left, gear-3d floats right |
| 4017 | 64 | Footer — muted "@ 2024 Your Company, Inc. All rights reserved" left, 6 small social icons right (X, Instagram, Pinterest, LinkedIn, TikTok, YouTube — from svg assets) |

Fonts: geometric sans (DM Sans 600 for headings/UI with tight tracking ≈ −0.07em, Inter 400 body —
this combination was glyph-verified against this design). Load via fontLoader (Google Fonts).
Palette: bg #000/near-black, purple accent ≈ #8c45ff family for glows, muted body ≈ #ffffffb0,
hairlines ≈ #ffffff15 — verify by sampling export-full.png.

## Method — efficiency rules (follow them exactly)

0. AUTHOR THE PAGE FROM SCRATCH from this brief and the reference assets. Do NOT search the
   filesystem for prior implementations of this design; do not reuse any existing fs-project or
   bundle — this run measures authoring, and reuse invalidates it.

1. Skill first, then scaffold the fs-project, `exjsx media`, write theme + page tw-first.
   Write the WHOLE page in one pass before any deploy — don't deploy section by section.
2. `lint` → `build` → `deploy`. A 422 names the offending envelope; fix and redeploy.
3. Score with ONE `bench score` call per round (never hand-written browser code). Patch
   paddings/margins numerically from the delta table, propagate shifts, redeploy, re-verify.
   **FIDELITY BAR: bench score reports pass:true (anchor mean <=2px, photometric <=10/255,
   width-generalization ok, mobile 390). STOP as soon as pass:true. MAXIMUM 4 scoring rounds** —
   report residuals rather than chasing them.
4. The score's mobile + generalization probes replace manual passes — fix only what they name.
5. Set front page, then final report: page ID + URL, final verify JSON verbatim, deviations accepted.

## Known gotchas (respect them; do not rediscover)

- **Build width-general, not 1200-pinned**: the score gate ALSO probes 1512px — centered content must
  re-center (absolutes use left:calc(50% +/- Npx) from design-center-600, never fixed left:Npx; grid
  rows need justify-content:center or w:hug — container boxes default to width:100% and left-pin
  their tracks). A page that only composes at exactly 1200 FAILS the gate.
- `ls`/`lh` shorthands are **EM not px**. `border={n}` is a width. `sx={{}}` merges as shorthand. `bgImage` for photo-behind-text.
- Atomic container tags: div|header|section|article|aside|footer|a|button only (no nav/main/ul).
- Row-box children get flex:1 unless width-pinned (`w-fit` for justify-between clusters); headings in flex columns need `w='100%'`.
- Image URLs: absolute http(s) on THIS site, single query param.
- In-page anchor targets: `id="signup"` prop on any container/heading/text/img renders a real HTML id
  — `<text href="#signup">` CTAs then scroll-target it.
- Decorative absolutes = raw position:absolute at Figma coords; section needs `raw overflow:hidden` when decorations bleed.
- Figma text-frame heights ≠ font-size — measure from reference pixels.
- Free-vs-Pro: Pro is active; raw custom_css renders via global classes (default non-inline deploy is correct on this dedicated site — do NOT use --inline).
- Missing static assets 404 on this site (never a homepage redirect); trust content-type.
