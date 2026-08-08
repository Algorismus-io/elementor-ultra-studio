# Build brief: "Meridian Atelier" — a complete 4-page marketing site, designed from scratch

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

## The site: Meridian Atelier (fictional — copy seeds below are canonical; extend them in the same voice, crisp and specific)

### Concept

**Meridian Atelier** — an eleven-person architecture studio in Port Linden specialising in civic
adaptive reuse: tram depots into libraries, grain stores into swimming halls. Audience: municipal
clients, development trusts, and juries shortlisting for competitions.

### Design direction — IMAGERY-LED (monochrome)

Grayscale structural photography is the identity. The whole site is near-monochrome — paper,
concrete, ink — with ONE pigment: verdigris. Photography is already grayscale at source (the
manifest URLs carry `?grayscale`); pages may add a subtle verdigris duotone wash on hover/overlay.

Palette (roles):
- `paper` `#FAFAF7` — page ground
- `concrete` `#E5E3DD` — panel ground, table stripes
- `ink` `#141412` — text, and the ground of one inverted section per page
- `graphite` `#55534C` — captions, meta
- `verdigris` `#3E7C6F` — the only color: links, active states, project numbers, rules

Fonts (verified): **Archivo** — display + numerals, weights 400/600/800 (800 for the giant index
numbers); **Instrument Sans** — body/UI, 400/600.

Imagery treatment: strict grayscale, hard edges, no border radius anywhere on this site; generous
captions in graphite set small.

Structural archetypes chosen for THIS site (build all four):
1. **Asymmetric offset grid** — home: selected works as staggered image blocks of unequal size
   (e.g. 7/12 + 4/12 offset rows), each numbered `01 02 03` in Archivo 800 verdigris.
2. **Sticky/pinned side rail** — about: the studio's four principles pinned in a left rail while
   portraits/history scroll on the right (desktop; stacks on mobile).
3. **Oversized numerals as layout** — the process section: `01 Listen / 02 Measure / 03 Argue /
   04 Build` where the numbers ARE the grid, set at ≥160px.
4. **A table as a design object** — /pricing/: the works index (year / project / typology / status)
   set as a formal ruled table in concrete/ink.

### Content pack (canonical copy seeds)

**Home hero**: h1 `Old buildings are the greenest ones.` — subcopy: `Meridian Atelier turns the
structures a city already owns into the rooms it actually needs. Eleven people, one wharf studio,
twenty-two buildings saved.` CTA `Start a conversation` → /contact/.

Home: offset grid of works — `01 Tramline Library, Port Linden (2024)` · `02 Saltworks Baths,
Grebe Point (2023)` · `03 Granary Concert Room, Ostfeld (2022)` · `04 Signal House Archive (2021)`,
each with a one-line note e.g. `A 1911 depot; the reading room keeps the rails in the floor.`
Then the oversized-numerals process section; then a short inverted ink band with the line
`We measure twice. Then we argue.`

**About** (`Studio`): sticky rail principles — `Keep the structure` / `Spend on daylight` /
`Honest materials` / `Public first` — each with a paragraph; right column: founding story (Noa
Meridian & Felix Abt, 2014, a condemned chandlery they refused to see demolished), team block
(eleven names, roles one line each — invent), awards list (`Port Linden Civic Prize 2024`,
`Shortlist, Ostfeld Kulturbau 2022`).

**Pricing** (`Engagements`): three tiers:
- **Feasibility Study** — $6,500 flat, 3 weeks: site visit, structural triage with our engineer,
  massing options, a costed go/no-go memo. Credited against later stages.
- **Concept & Planning Set** — from $24,000: full concept design, planning submission, one physical
  model, two public-consultation evenings.
- **Full Service** — 8% of construction cost: everything through handover, site visits weekly,
  as-built drawings and a maintenance dossier at close.

≥3 disclosures with body copy:
1. `How fees are structured` — `Fixed where scope is fixed (studies, planning sets); percentage
   where it is not (construction). We invoice monthly against milestones and never bill surprises —
   scope changes are priced before we do the work.`
2. `Who owns the drawings?` — `You do, on final payment — including model files. We keep the right
   to photograph and publish the built work; you keep the right to say no to a magazine we both
   regret.`
3. `A typical timeline` — `Feasibility 3 weeks · concept 8–10 weeks · planning authority 12–16
   weeks (theirs, not ours) · construction 10–20 months by scale. Reuse is not slower than new
   build — demolition just hides its months upstream.`

**Testimonial**: `They treated our 1911 tram depot like a client, not a site.` — **Amara Voss**,
Director, Port Linden Development Trust.

**Contact** (`Start`): form name / email / building or site (text) / message ("what the building is
and what it could be"); formSuccess `Received — a partner replies within two working days.`
Note under the form: `We take on six new buildings a year. Send yours early.`

**Footer**: `Meridian Atelier — Studio 4, 88 Meridian Wharf, Port Linden` ·
`new-work@meridianatelier.example` · `+44 (0)20 5550 8814` · line: `Twenty-two buildings saved.`

### Media — run FIRST, before building pages

This package ships `media.manifest.mjs` next to this brief. Every URL is pre-verified (HTTP 200,
image/jpeg; grayscale baked into the URLs) — do NOT swap sources. Copy it into `{{PROJECT_DIR}}`,
then from `{{PROJECT_DIR}}` run:

    WP_URL={{WP_URL}} WP_USER=admin WP_APP_PASSWORD={{WP_APP_PASSWORD}} {{EXJSX_CLI}} media media.manifest.mjs

Reference images by mapped attachment id. Slots: `hero-monument` (home hero), `atrium-spiral`,
`bridge-cables`, `escalator-vault`, `bridge-street` (works grid — treat as project photography),
`city-panorama` (about or footer-adjacent wide band).

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
