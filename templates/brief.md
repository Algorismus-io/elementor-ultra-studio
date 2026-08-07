# Build brief: {{TITLE}} — Elementor V4, pixel-faithful

You are building a page in Elementor on a live local WordPress, using the **elementor-jsx** framework
(the system's default authoring path). Reproduce the design faithfully; verify with real measurements.

## Target site (already running — do NOT provision anything, do NOT kill any process)

- URL: `{{WP_URL}}`
- Auth: `WP_USER={{WP_USER}}`, `WP_APP_PASSWORD={{WP_APP_PASSWORD}}`
- {{SITE_LINE}}
- The server self-heals if it crashes (supervisor); if a request suddenly fails, wait ~15s and retry
  before diagnosing.

## Tooling

- FIRST: invoke the `elementor-ultra` skill if available, and read the elementor-jsx `README.md` +
  `CONVENTIONS.md`. Follow the styling ladder (tw → sx → raw last) and the fs-project layout
  (`pages/*.page.jsx`, `theme.mjs`, `site.config.mjs`, `components/`).
- exjsx CLI: `{{EXJSX_CLI}}` (build | deploy | lint | media | inspect | watch)
- Env for deploy: `WP_URL={{WP_URL}} WP_USER={{WP_USER}} WP_APP_PASSWORD={{WP_APP_PASSWORD}}`
- Health + self-heal at any time: `{{STUDIO_CLI}} doctor --page <id>`
- Verification (one call per convergence round): `{{STUDIO_CLI}} verify --page-url <url> --anchors anchors.json`
  — write an anchors.json with your section targets (see `{{STUDIO_CLI}} verify --help` for the shape).

## Design reference

{{DESIGN_BLOCK}}

## Method (proven loop — follow it)

1. Skill + docs first. Scaffold the fs-project, upload media (`exjsx media`), write theme + page tw-first.
2. `lint` (fix errors), `build`, `deploy`. A 422 names the offending envelope — the validator is authoritative.
3. Write `anchors.json` from the design's section y-coordinates, then run `studio verify` after each
   deploy. Patch paddings/margins numerically from the delta table, propagate shifts. Target mean |Δ| ≤ 2px.
   STOP at 3 rounds unless explicitly asked for pixel-perfect.
4. Include paint `bands` in anchors.json for any content that could silently render invisible
   (logos/icons on same-tone backgrounds) — DOM probes can't see paint.
5. Mobile: `verify` checks 390px overflow automatically; fix offenders it names (stack rows, w-fit
   pinned clusters, w:100% headings, hide/shrink decorations).
6. Set the front page if asked, then report: page ID + URL, final verify JSON, deviations you accepted.

## Known gotchas (encoded from prior runs — respect them)

- `ls`/`lh` shorthands are **EM not px**. `border={n}` is a width. `sx={{}}` merges as shorthand.
  `bgImage` for photo-behind-text.
- Atomic container tags: div|header|section|article|aside|footer|a|button only (no nav/main/ul).
- Row-box children get flex:1 unless width-pinned (`w-fit` for justify-between clusters); headings in
  flex columns need `w='100%'`.
- Image URLs: absolute http(s) on THIS site, single query param. Check asset ink vs background: a
  dark-ink/transparent PNG on a dark section composites to invisible — tint the asset, don't fight CSS.
- Figma text-frame heights ≠ font-size — measure from reference pixels (baseline gaps, cap heights,
  wrap points).
- Do NOT open the built page in the Elementor editor on Playground-backed sites — editor visits can
  wipe the global-classes store. If styles vanish: `exjsx deploy <bundle> --force`, then
  `{{STUDIO_CLI}} doctor`.
- Verify with viewport screenshots / `studio verify` bands — never fullPage captures of tall pages
  (bottom-of-page images deterministically fail to paint).
