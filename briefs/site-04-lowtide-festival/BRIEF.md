# Build brief: "Lowtide" — a complete 4-page marketing site, designed from scratch

You are building a COMPLETE small marketing site in Elementor V4 (atomic widgets) using the
**elementor-jsx** framework. You are the designer. Bar: a site a real startup would ship —
coherent design system, real navigation, working form. Efficiency counts: batch work, use the
one-call tools, stop at the bar.

## Target site (already running — do NOT provision anything, do NOT kill any process)

- URL: `{{WP_URL}}` · Auth: `WP_USER=admin`, `WP_APP_PASSWORD={{WP_APP_PASSWORD}}`
- Elementor 4.2.x + Pro active, companion plugin current. Server self-heals on crash (wait ~15s, retry).
- Do NOT open pages in the Elementor editor.

## Tooling — read the API CARD first, never grep framework source

1. Invoke the `elementor-ultra` skill, then run `{{EXJSX_CLI}} api` and read the card it prints —
   it is the COMPLETE authoring API (intrinsics, sx keys, kit helpers, gotchas). Do not read
   CONVENTIONS.md, kit source, examples, or memory files; the card covers it.
2. Build: `{{EXJSX_CLI}} lint|build` then `deploy <bundle> --fast` with
   `WP_URL={{WP_URL}} WP_USER=admin WP_APP_PASSWORD={{WP_APP_PASSWORD}}`.
   (--fast skips slow in-deploy CSS priming; the check below regenerates it via its page visits.)
   Write the WHOLE site before the first deploy.
3. Verify EVERYTHING — ONE call, one browser session (never hand-write playwright):
   `{{STUDIO_CLI}} check --pages /,/about/,/pricing/,/contact/ --form /contact/ --accordion /pricing/ --burger / --nav /=about`
   → structural matrix (3 widths × all pages) + all interaction tests together, ~1 min total.
4. After a fix that touches ONE page, re-check only it: `{{STUDIO_CLI}} check --pages /pricing/ [--accordion /pricing/]`
   — don't re-run the full matrix for a single-page change.
5. Design review: a handful of playwright screenshots at 1200 + 390, viewed and judged.
6. If css ever breaks: `{{STUDIO_CLI}} doctor` once; if the file store keeps flaking,
   `{{STUDIO_CLI}} carry-css --page <id> …` once at the end.

(Playwright for screenshots: `EXJSX_IT_PLAYWRIGHT={{PLAYWRIGHT}}`.)

## The site: Lowtide (fictional — copy seeds below are canonical; extend them in the same voice, crisp and specific)

### Concept

**Lowtide** — a three-day coastal music festival on Gullwing Strand, Cape Hollow, 12–14 June 2026:
two stages, forty acts, sets timed to the tide table. Audience: 18–30 indie/electronic fans who
travel and camp for a weekend.

### Design direction — TYPE-LED (poster energy, one accent photo)

The lineup typography IS the design. Think festival poster stretched into a website: enormous
stacked names, dusk-gradient grounds, ticket-stub borders. One atmospheric bokeh photo is allowed
as a background texture — nothing else.

Palette (roles):
- `night` `#120726` — page ground (deep violet-black)
- `dusk` `#5A189A` — gradient partner, panel grounds (`grad` night→dusk allowed on heroes/bands)
- `signal` `#F72585` — hot pink: headliners, links, active states
- `sunset` `#FF8500` — orange: times, prices, the second gradient stop
- `sand` `#FFEEDB` — body text on dark

Fonts (verified): **Unbounded** — display, weights 500/700/900 (900 for headliner names, tracked
tight); **Space Grotesk** — body/UI + schedule numerals, 400/600.

CSS-art moves: dusk gradients; a repeating wave-line SVG horizon divider; ticket-stub sections
(dashed edge + punched-hole circles); a rotated marquee strip reading `LOW TIDE · HIGH VOLUME ·`.

Structural archetypes chosen for THIS site (build all four):
1. **Oversized display type AS layout** — home lineup: act names stacked edge-to-edge as the grid
   itself; headliners in Unbounded 900 ≥140px `signal`, mid-bill 700 in `sand`, small print bill
   in columns. Names ARE the sections — no cards.
2. **Horizontal band/timeline** — the three-day schedule as horizontal day-rails (Fri/Sat/Sun):
   time chips in `sunset`, act + stage per chip.
3. **Full-bleed color blocks with hard seams** — page sections cut between flat `night`, gradient
   dusk, and `signal` blocks with no transitions; one very short signal-pink band per page.
4. **Rotated marquee strip** — the tilted repeating ticker as a section seam on home and pricing.

### Content pack (canonical copy seeds)

**Home hero**: h1 `Three days. Two stages. One tide.` — subcopy: `Lowtide returns to Gullwing
Strand, 12–14 June 2026. Forty acts on the sand, headline sets timed to high water.` CTA
`Get passes` → /pricing/.

Home lineup (invent in this register): headliners `CORMORANT` · `SALT ARCADE` · `M I R A M A R`;
mid-bill: `Foam Parade, Neap Kids, The Shingles, Harbor Lights AV, Ghost Buoy, Ada & the Undertow`;
small bill: twelve more names in a 3-col block. Schedule band (archetype 2) with e.g. `FRI 21:40 ·
Main Stage · CORMORANT (high water 21:52)`. Short pink band: `Set times follow the tide table —
they shift daily. Check the board.`

**About** (`The Strand`): what Lowtide is — started 2019 as one PA on the sand at low water, now
capped at 6,000 passes on purpose; sustainability block — `Leave no trace: deposit cups, rail
shuttles from Cape Hollow station every 20 minutes, zero generators below the dune line — the
main stage runs on the grid and the sun.`; getting-there block (rail/shuttle/bike lockup, car
discouraged); the marquee strip.

**Pricing** (`Passes`): three ticket-stub tiers:
- **Tide Pass** — $129: all three days, both stages, re-entry, water refills.
- **Spring Tide** — $249: Tide Pass + dune campsite (Thu–Mon), hot showers, morning coffee tent.
- **Neap & Deep (VIP)** — $399: side-stage viewing platform, artist-bar access, a locker, one
  guaranteed no-queue tide-line swim slot per day. 200 available.

≥3 disclosures with body copy:
1. `What can I bring in?` — `Soft bags to 20L, empty bottles, sunscreen, sealed snacks. No glass,
   no drones, no sound systems, no single-use vapes. Bag check is fast if your bag is boring —
   make your bag boring.`
2. `Camping & vans` — `Spring Tide camping is on the dune meadow, 8 minutes' walk from the main
   stage: pitches are unmarked, first-come; vans and trailers go to the Cliff Field with a $40
   vehicle pass bought in advance — none sold on the gate.`
3. `Refunds & weather` — `We play through rain. If a full day is cancelled for safety (storm-force
   wind or a red tide warning), that day is refunded pro-rata within 14 days. Passes are
   name-changeable free until 1 June; resale above face value voids the pass.`

**Testimonial**: `Watching the headliner as the tide came in around the stage legs — nothing else
touches it.` — **Marta G.**, three-year returner.

**Contact** (`Access & questions`): form name / email / topic (text: tickets, access, press,
volunteering) / message; formSuccess `Sent — the shore crew replies within 48 hours (slower on
show days, obviously).` Access note: viewing platforms, BSL sets, quiet zone behind Stage 2.

**Footer**: `Lowtide Festival — Gullwing Strand, Cape Hollow` · `12–14 June 2026` ·
`access@lowtide.example` · line: `Low tide. High volume.`

### Media — one texture image only

This package's `media.manifest.mjs` has a single slot: `crowd-bokeh` (out-of-focus night lights),
pre-verified. Use it ONLY as a darkened background texture behind one section (e.g. the
testimonial or the VIP tier). Copy the manifest into `{{PROJECT_DIR}}` and run:

    WP_URL={{WP_URL}} WP_USER=admin WP_APP_PASSWORD={{WP_APP_PASSWORD}} {{EXJSX_CLI}} media media.manifest.mjs

Everything else is type, gradient, and SVG.

Rule 0: design and author FROM SCRATCH — do not search for or reuse any prior site implementation.

fs-project at `{{PROJECT_DIR}}` (`theme.mjs` tokens → `components/` shared Nav/Footer → `pages/`).
Four pages with FIXED slugs (home — front page after deploy via `/wp/v2/settings`
`{show_on_front:"page", page_on_front:<id>}` — plus `about`, `pricing`, `contact`), but YOU design
each page's structure from its job. Hard requirements, few and testable:

- every page: shared nav (with working mobile menu) + footer, one h1, real cross-page links
- somewhere on `/pricing/`: the offer(s), plus ≥3 real `<details>/<summary>` disclosure items
  (FAQ, spec sheets, T&C — whatever fits the concept)
- `/contact/`: a working Pro form (`actions:['collect-submissions']` — email action is
  upstream-broken on this stack) + `formSuccess()` for the visible sent-state
- no stock images beyond the single pre-verified manifest slot (see MEDIA above) — typography, color and CSS/SVG graphics carry the design; `id`-prop anchors OK

**STRUCTURAL DIVERSITY IS A REQUIREMENT, not a suggestion.** The centered-column SaaS formula
(hero → three feature cards → stats band → testimonial → CTA) is BANNED as a default. Rules:
- At most ONE section per page may be a centered single-column block.
- Use at least THREE distinct layout archetypes across the site — this brief's DESIGN DIRECTION
  names the archetypes chosen for THIS site; build them, don't substitute blander ones.
- Vary section RHYTHM: different vertical densities, at least one very tall and one very short
  section per page; backgrounds must alternate meaningfully (not stripe-flip every section).
- The four pages must NOT share one master section layout with swapped copy — each page gets at
  least one layout move the other pages don't use.
- Type scale must take a position: either huge display contrast (≥5× body) somewhere, or a strict
  editorial scale — not the safe middle everywhere.

## Method

theme.mjs → components → all four pages → lint (fix errors) → build → deploy --fast → front page →
ONE `check` call → screenshots, judge, fix what looks off → redeploy --fast (idempotent) →
targeted re-check. **Max 2 fix rounds** — report residuals instead of chasing.

## Report (final message — keep it SHORT)

- Page IDs + URLs (one line each)
- Final `check` JSON, verbatim
- Screenshot directory path
- Accepted deviations as a terse bullet list
No prose narrative, no per-page tables, no design essay — the JSON is the record.
