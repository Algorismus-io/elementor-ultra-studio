# Build brief: "Pip & Parcel" — a complete 4-page marketing site, designed from scratch

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

## The site: Pip & Parcel (fictional — copy seeds below are canonical; extend them in the same voice, crisp and specific)

### Concept

**Pip & Parcel** — a monthly craft-box subscription for kids aged 4–9: real projects (cardboard
castles, seed bombs, shadow puppets) with everything included except the afternoon. Audience:
parents and gift-giving grandparents who want screen-free hands-busy time.

### Design direction — TYPE & CSS-ART-LED (no photography)

Zero photos. The design is sticker-sheet energy built entirely from type, flat color, and CSS/SVG
shapes: blobs, wobbly underlines, confetti dots, thick ink outlines, tilted "sticker" cards with
hard offset shadows (`box-shadow: 6px 6px 0 ink`).

Palette (roles):
- `paper` `#FFF8EB` — page ground (warm cream)
- `ink` `#26547C` — text and ALL outlines (this blue is the "black" of the site)
- `sunshine` `#FFC53D` — primary accent, big shapes, tier 2
- `bubblegum` `#FF70A6` — secondary accent, stickers, tier 1
- `grass` `#06D6A0` — tertiary accent, success states, tier 3

Fonts (verified): **Baloo 2** — display, weights 500/700/800 (round, friendly, used BIG);
**Nunito** — body, 400/700.

CSS-art moves: SVG wavy section seams; rotated elements (cards at −2°/+3°); a dashed
"cut-along-the-line" border around the gift section; oversized letterforms as decoration.

Structural archetypes chosen for THIS site (build all four):
1. **Overlapping/stacked cards with depth** — the three box tiers as overlapping sticker cards,
   each tilted, with hard offset shadows; they overlap the section seam above them.
2. **Diagonal/shaped section breaks** — every major seam on home is a wavy SVG edge, alternating
   paper/sunshine/grass grounds (meaningfully, not stripe-flip).
3. **Oversized display words AS layout** — a section where `M A K E` in Baloo 800 (≥180px) forms a
   2×2 grid and each giant letter anchors one step: Make/Assemble/Kraft/Explode-with-pride (own
   the joke in microcopy).
4. **Rotated ticket strip** — a slim tilted "golden ticket" band for the annual plan, dashed
   border, on its own short section.

### Content pack (canonical copy seeds)

**Home hero**: h1 `An afternoon in a box.` — subcopy: `One parcel a month. Real tools, real glue,
real mess — everything your kid needs to build something they'll insist on keeping forever.`
CTA `Pick a parcel` → /pricing/. Secondary link `What's inside?` → anchor.

Home: the M-A-K-E grid; a "this month's parcel" feature — `The Drawbridge Castle: 14 cardboard
sheets, 2 brass fasteners, string, and a working winch. Ages 6+, about 90 gloriously quiet
minutes.`; the wavy-seam sections; testimonial; short grass-ground band: `No screens were harmed
in the making of this box.`

**About** (`Why boxes?`): founder story — Priya and Sam Chandra, ex-primary-school teachers who
started packing boxes in a Maplewick garage in 2023 after one too many rainy-day meltdowns; a
`How we design a project` section (tested by a 30-kid "destruction panel"; instructions drawn, not
written, so pre-readers can lead); safety block — `Everything passes EN 71. Scissors are real but
child-sized. Glue washes out. Glitter is banned — you're welcome.`

**Pricing** (`Parcels`): three sticker-card tiers:
- **Little Parcel** — $19/mo: one project, ages 4–6 or 7–9, postcard from Pip the pigeon, cancel
  anytime.
- **Big Parcel** — $29/mo: three linked projects that build one big thing, collector's badge,
  sibling add-on kit $9.
- **Parcel Club (annual)** — $290/yr: twelve boxes, the summer MEGA-box free, birthday-month
  golden ticket, price-locked for the year.

≥3 disclosures with body copy:
1. `What's actually inside a box?` — `Every part for the month's project (pre-cut, counted twice),
   the drawn instruction map, one real tool your child keeps — a hole punch, a stitching needle, a
   proper paintbrush — and a postcard from Pip. You supply water, table, and applause.`
2. `Age ranges & safety` — `Each project ships in a 4–6 or 7–9 version — same build, different
   grip. Everything is EN 71 tested; nothing sharp travels loose; small parts are flagged on the
   lid for households with under-3s.`
3. `Pausing, skipping, gifting` — `Skip any month from your account by the 20th, pause for up to
   three months, cancel with two clicks and zero guilt. Gift subscriptions never auto-renew — the
   last box says goodbye instead of billing grandma.`

**Testimonial**: `Saturday mornings went from cartoons to cardboard castles.` — **Priya N.**,
mother of two, subscriber since 2024.

**Contact** (`Say hello`): form name / email / child's age (number) / message; formSuccess
`Got it! Pip is pecking at your message now — expect a reply within a day.` Side panel: gift-order
note and `press & schools` line.

**Footer**: `Pip & Parcel Ltd — PO Box 77, Maplewick` · `hello@pipandparcel.example` ·
`Weekdays 9–5` · line: `Real tools. Real glue. Real mess.`

### Media

This site uses NO images by design. The package's `media.manifest.mjs` is intentionally empty —
do not sideload anything; build all decoration from type, color, and CSS/SVG shapes.

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
- no stock images — typography, color and CSS/SVG graphics carry the design; `id`-prop anchors OK

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
