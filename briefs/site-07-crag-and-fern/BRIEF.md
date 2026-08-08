# Build brief: "Crag & Fern" — a complete 4-page marketing site, designed from scratch

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

## The site: Crag & Fern (fictional — copy seeds below are canonical; extend them in the same voice, crisp and specific)

### Concept

**Crag & Fern** — a six-person workshop in Kestrel Falls sewing small-batch packs and shelters:
three products, lifetime repair, nothing discounted, nothing discontinued. Audience: thru-hikers
and weekend alpinists who repair rather than replace, and who read spec sheets for pleasure.

### Design direction — IMAGERY-LED (cold expedition photography)

Full-bleed cold-weather landscape photography sets the register; gear information sits on top as
dense, technical, spec-sheet typography. The tension — wild photos, precise type — IS the brand.

Palette (roles):
- `forest` `#1F3B2C` — primary dark ground
- `snow` `#F4F3EF` — light ground, text on forest
- `stone` `#DCD8CC` — secondary panels, table stripes
- `granite` `#55584F` — captions, secondary text
- `rust` `#A84B2A` — accent: prices, links, spec callouts, the order CTA

Fonts (verified): **Bricolage Grotesque** — display, weights 400/600/800 (its quirk reads
workshop, not corporate); **Inter** — body + spec tables, 400/600.

Imagery treatment: manifest photos full-bleed behind section headers and as diagonal-seam
dividers; gear "cards" overlap the photography (see archetype 2); captions name place + season
like field notes (`Kestrel headwall, late April`).

Structural archetypes chosen for THIS site (build all four):
1. **Split 60/40** — home: product story text (60) against a tall field photo column (40),
   flipped 40/60 in the next section.
2. **Overlapping/stacked cards with depth** — the three products as stone cards that overlap the
   full-bleed terrain photo behind them (negative margin, layered shadows).
3. **A table as a design object** — /pricing/: the full spec sheet as centerpiece — rows: volume,
   weight, fabric, frame, hip-belt sizes, warranty; columns: Fern 38 / Crag 55 / Ridgeline Tarp;
   set ruled on stone, numbers in Inter 600, prices in rust.
4. **Diagonal section breaks** — ridge-line seams: sections cut with a low-angle diagonal edge
   (SVG), echoing the skyline in the photos.

### Content pack (canonical copy seeds)

**Home hero**: h1 `Sewn for the long way round.` — over the mountain-lake photograph; subcopy:
`Three products. Six people. One workshop above Kestrel Falls. Every seam guaranteed for life —
yours, not the pack's.` CTA `See the line` → /pricing/.

Home: overlapping product cards over terrain (archetype 2) — one-liners: `Fern 38 — the
do-everything thru-pack`, `Crag 55 — winter loads without the wobble`, `Ridgeline Tarp — 620
grams of roof`; a field-notes band of two photos with place captions; the repair-count ticker
line: `1,412 repairs sewn since 2019 — 1,398 free.`; testimonial.

**About** (`The workshop`): story — founded 2019 by Ana Ferro (ex-sailmaker) and Colm Whitaker
after a hip-belt failure two days from a road; the six-person bench, each pack signed inside the
lid by its sewer; the `Why only three products` argument (fewer, better, repairable forever);
materials block — `X-Pac and 500D Cordura cut in-house; hardware from two suppliers we can name;
zippers we've tested to 11,000 cycles.`; the repair bench photo section with `goat` / `snow-ridge`
imagery as field notes.

**Pricing** (`The Line`): three offers + the spec-sheet table (archetype 3):
- **Fern 38** — $189: 38L thru-hiking pack, 890g, X-Pac VX21, removable alloy stay, hip-belts in
  four sizes; ships in 3 days.
- **Crag 55** — $259: 55L winter/expedition pack, 1,240g, 500D Cordura, twin stays, ice-tool
  carry, ski straps included.
- **Ridgeline Tarp** — $149: 3×2.4m silpoly tarp, 620g with guylines, 16 tie-outs, seam-sealed by
  hand; pairs with either pack's lid pocket.

≥3 disclosures with body copy:
1. `The lifetime repair program` — `If we sewed it and it fails, we fix it free — forever,
   original owner or not. Send it in clean with a note about what happened; typical turnaround is
   ten days including return post. Crampon holes and campfire melt aren't failures, but we repair
   those too at cost, and we'll tell you the price before we thread a needle.`
2. `Fabrics & where things are made` — `Every pack is cut and sewn in our Kestrel Falls workshop.
   X-Pac comes from Putnam mills, Cordura from a weaver we visit annually, buckles from two
   named suppliers with published load specs. Nothing in the line is white-labelled, and if a
   material changes, the product page says so in the changelog.`
3. `Shipping, returns & crash replacement` — `Free tracked shipping over $150; 60-day returns on
   unused gear, no restock fee. Destroyed something mid-trip? Crash replacement ships a loaner
   Fern 38 or tarp next-day to a trail town for the cost of postage while yours is on the bench.`

**Testimonial**: `2,100 miles on the Fern 38 and one re-stitched hip belt — which they did free
and had back to me in a week.` — **Sam Whitaker**, PCT thru-hiker, class of '25.

**Contact** (`Talk to the bench`): form name / email / product (text) / message ("fit questions,
repairs, wholesale — all of it"); formSuccess `Received — a sewer, not a bot, replies within two
working days.` Panel: workshop address, visiting hours (`First Friday monthly, 4–7pm — bring the
pack, we'll look at it`), repair-form note.

**Footer**: `Crag & Fern — Workshop 9, Old Tannery, Kestrel Falls` · `gear@cragandfern.example` ·
`Repairs: repairs@cragandfern.example` · line: `Every seam guaranteed for life.`

### Media — run FIRST, before building pages

`media.manifest.mjs` ships 7 pre-verified slots. Copy it into `{{PROJECT_DIR}}`, then from
`{{PROJECT_DIR}}` run:

    WP_URL={{WP_URL}} WP_USER=admin WP_APP_PASSWORD={{WP_APP_PASSWORD}} {{EXJSX_CLI}} media media.manifest.mjs

Slots: `hero-mountain-lake` (home hero), `snow-forest` `dusk-wave` `blue-ridges` (full-bleed
section/diagonal-seam imagery), `lagoon-rest` (about "rest day" field note), `goat-trail`
`snow-ridge` (field-note band, portrait + landscape). Caption them like field notes, not stock.

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
- imagery comes ONLY from this package's `media.manifest.mjs` (pre-verified URLs; see the MEDIA section above — sideload BEFORE building pages); no other stock sources; `id`-prop anchors OK

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
