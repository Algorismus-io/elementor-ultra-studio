# Build brief: "Ember & Oak" — a complete 4-page marketing site, designed from scratch

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

## The site: Ember & Oak (fictional — copy seeds below are canonical; extend them in the same voice, crisp and specific)

### Concept

**Ember & Oak** — a live-fire restaurant in the old foundry district of Rooksport: everything
cooked over oak coals, no gas line in the building. Audience: date-night diners and small-group
celebrations who book a week out; food-lovers who read the menu like a program.

### Design direction — IMAGERY-LED

The photographs carry this site: dark, warm, smoke-and-ember atmosphere. Sections are built AROUND
full-bleed images; type sits on char-dark grounds.

Palette (roles):
- `char` `#191310` — primary background (most of the site is dark)
- `bone` `#F2EAD9` — text on dark; also the ground of the one light section per page
- `ember` `#C1440E` — primary accent: rules, links, prices, the reserve CTA
- `flame` `#F4A259` — secondary warm accent: highlights, hover, small labels
- `smoke` `#8A817C` — muted captions, meta text

Fonts (Google Fonts, both verified):
- **Fraunces** — display, weights 400/600/900; use 900 for the huge headline moments, italic 400
  for menu-item flourishes
- **Karla** — body/UI, weights 400/700

Imagery treatment: manifest photos only, full-bleed or hard-cropped; darken with a char overlay
gradient where type sits on top; never place them in small rounded "card" thumbnails.

Structural archetypes chosen for THIS site (build all four):
1. **Full-bleed image blocks with hard seams** — home is a stack of edge-to-edge photo sections
   with no padding between them; text panels butt directly against images.
2. **Split-screen 60/40** — about page: kitchen story text vs. tall image column.
3. **A table as a design object** — the tasting menu on /pricing/ set as a formal table: course /
   dish / fire note, thin `bone` rules on `char`, prices right-aligned in `ember`.
4. **Horizontal band / timeline** — "one evening at Ember & Oak": 3pm coals lit → 5pm dough rested
   → 6pm first seating → 11pm rake-out, as a horizontal rail with times in Fraunces 900.

### Content pack (canonical copy seeds — use these, extend in the same voice)

**Home hero**: h1 `Cooked by fire. Nothing else.` — subcopy: `Oak coals, cast iron, and a
seven-course argument for patience. Ember & Oak is Rooksport's only gas-free kitchen.` CTA:
`Reserve a table` → /contact/.

Home sections: the evening timeline band (above); a full-bleed image seam pairing `hero-ember-sky`
with the line `The fire is lit at three. You eat at six.`; a short provenance block — `Whole
animals from Harrow Vale farms. Vegetables from the market forty steps away. Oak from windfall
only.`; the critic's quote (below) on a bone ground.

**About** (`The kitchen`): the story — chef Noor Behzadi gutted a 1904 foundry annex, kept the
brick smoke-stack, and built the hearth where the casting pit was. Split 60/40: story text vs. tall
`counter-still` / `valley-gold` image column. A `Sourcing` sub-section using the provenance line;
a short block on the wood: `Oak only, split ten months ahead, stacked under the north wall.`

**Pricing** (`Menus`): three offers as the table-object plus tier summaries:
- **Hearth** — $48 per person: four courses from the day's fire; bread & cultured butter; a
  vegetable cooked in the coals; one dessert. Wed–Thu only.
- **Ember** — $72 per person: six courses; the whole-leek starter; dry-aged beef or market fish
  finished over open flame; pairing add-on $38.
- **Whole Hog Table** — $95 per person, parties of 8–10: one table beside the hearth, one animal,
  five hours; includes the rake-out toast at close.

≥3 disclosures (details/summary) with THIS body copy:
1. `What does "live-fire" actually mean?` — `No gas, no electric ovens, no sous vide. Every dish
   touches oak heat: grilled over coals, buried in embers, or held in the brick oven's falling
   heat. The menu changes when the fire does.`
2. `Allergies & dietary notes` — `Tell us when you book. Fire cooking is flexible — smoke is not.
   We can build a full vegetarian sequence with two days' notice; strict allergen separation has
   limits in a one-hearth kitchen and we will say so honestly.`
3. `Cancellations & large parties` — `Tables release at 48 hours; the Whole Hog Table at 7 days
   (half the deposit thereafter). Parties over six: one menu for the table, chosen in advance.`

**Testimonial**: `The short ribs came off the coals like something out of a myth — charred,
trembling, gone in minutes.` — **Dana Okafor**, restaurant critic, *Rooksport Courier*.

**Contact** (`Reserve`): form fields name / email / party size (number) / message ("date, time,
occasion"); formSuccess message `Request received — we confirm every booking by hand within a day.`
Sidebar details: address + hours (below), `Walk-ins take the six counter seats, first come.`

**Footer**: `Ember & Oak — 214 Foundry Row, Rooksport` · `Wed–Sun, 5–11pm` · `(555) 014-7788` ·
`reservations@emberandoak.example` · line: `The fire is lit at three.`

### Media — run FIRST, before building pages

This package ships `media.manifest.mjs` next to this brief. Every URL is pre-verified (HTTP 200,
image/jpeg) — do NOT swap in other sources. Copy the manifest into `{{PROJECT_DIR}}`, then from
`{{PROJECT_DIR}}` run:

    WP_URL={{WP_URL}} WP_USER=admin WP_APP_PASSWORD={{WP_APP_PASSWORD}} {{EXJSX_CLI}} media media.manifest.mjs

It sideloads all slots into the WP media library and writes `data/media-map.json`; reference
images in pages by their mapped attachment ids, never by remote URL. Slots and intended use:
`hero-ember-sky` (home hero seam), `alley-lights` (evening/atmosphere section), `fire-macro`
(texture block behind the timeline or menus), `counter-still` + `valley-gold` (about split column),
`dining-room` (reserve page / room section).

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
