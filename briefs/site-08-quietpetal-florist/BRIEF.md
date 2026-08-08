# Build brief: "Quietpetal" — a complete 4-page marketing site, designed from scratch

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

## The site: Quietpetal (fictional — copy seeds below are canonical; extend them in the same voice, crisp and specific)

### Concept

**Quietpetal** — a two-woman florist studio in Bellbrook working only with what's in season within
forty miles: weekly stem subscriptions, occasion arrangements, and full wedding work. Audience:
locals who want flowers that look gathered rather than manufactured, and couples planning
hedgerow-style weddings.

### Design direction — IMAGERY-LED (airy botanical)

Soft botanical photography on plaster grounds; the site should feel like the studio — light,
unhurried, a little wild at the edges. Serif italics do the romance; the layout stays disciplined.

Palette (roles):
- `plaster` `#F7F1EC` — page ground
- `rose` `#C88C86` — primary accent: links, chips, hover
- `moss` `#7A8B6F` — secondary: rules, botanical labels, success states
- `plum` `#4A2C3E` — text, and the ground of the short ribbon sections
- `cream` `#FBF8F4` — panel ground over photos

Fonts (verified): **Cormorant Garamond** — display, weights 400/500/700, ITALICS are the
signature (hero and pull-lines in italic); **Mulish** — body/UI, 400/700.

Imagery treatment: manifest photos in an offset editorial rhythm — varied crop heights, generous
plaster margins (NOT full-bleed everywhere; this site breathes); thin moss caption labels in the
manner of herbarium tags (`Prunus sp., April`).

Structural archetypes chosen for THIS site (build all four):
1. **Asymmetric offset grid** — home: botanical crops staggered at unequal heights and widths
   with plaster gaps; captions hang under each like herbarium tags.
2. **Editorial multi-column** — care notes and the seasonality manifesto set in 2–3 text columns
   with moss column rules.
3. **Horizontal band / seasonal rail** — `What blooms when`: a horizontal January→December rail;
   each month a chip listing 2–3 stems (`APR — tulips, blossom branches, narcissi`).
4. **Tall/short rhythm as a feature** — one very tall hero (≥85vh, image + italic overlay) and,
   on every page, one very short plum ribbon (one italic line, e.g. `Flowers should smell of the
   week they were cut.`).

### Content pack (canonical copy seeds)

**Home hero**: h1 (Cormorant italic) `Flowers from forty miles.` — subcopy: `A Bellbrook studio
working with what the season actually gives: hedgerow, meadow, and twelve growers we know by
first name.` CTA `Weekly stems — $22` → /pricing/.

Home: the offset botanical grid (archetype 1) with herbarium captions; the seasonal rail
(archetype 3); a `How Thursdays work` strip — `Stems cut Wednesday evening, bunched at dawn,
on doorsteps by ten. What's in the bunch? Whatever was best at six a.m.`; plum ribbon; testimonial.

**About** (`The studio`): Marnie Okafor & June Tran, who met on a flower farm in 2019 and opened
the Bell Lane studio in 2022; the forty-mile rule and what it costs them (`No roses in February.
No apologies either.`); grower list (twelve names/farms, one line each — invent); the care-notes
multi-column section (archetype 2): conditioning stems, water changes, keeping blossom branches.

**Pricing** (`Flowers & occasions`): three offers:
- **Weekly Stems** — $22/week: one hand-tied seasonal bunch, Thursday doorstep delivery in
  Bellbrook, pause anytime; jam-jar deposit $2, returned at the door.
- **Occasion Arrangement** — from $65: birthdays, tables, apologies; brief us with three words
  and a budget; 48 hours' notice, same-week guaranteed for members.
- **Wedding Studio** — from $1,800: full service — consultation, seasonal palette mock-up one
  month out, bouquets/buttonholes/arch, delivery and midnight strike included. Three weddings a
  month, booked 6–12 months ahead.

≥3 disclosures with body copy:
1. `How the weekly subscription works` — `Pay monthly, get four Thursday bunches. Going away?
   Skip by Tuesday noon and we credit the week. Every bunch lists its stems and growers on the
   tag, and the jam jars keep circulating — deposit back whenever you return one.`
2. `Seasonality — why we won't promise peonies in October` — `We buy nothing flown in and
   nothing forced, so the answer to "can you get X in Y month" is sometimes simply no. What you
   get instead is the best of the forty miles that week — and a studio that will tell you the
   truth about what will look magnificent versus what will look imported.`
3. `Delivery zones & flower care` — `Thursday rounds cover Bellbrook and the three villages on
   the Harrow road; occasion deliveries go anywhere within the forty miles for a flat $12. Every
   arrangement leaves with a care tag: cool room, fresh water every two days, stems re-cut at an
   angle — and blossom branches want a heavy vase.`

**Testimonial**: `The arch looked like the hedgerow we got engaged under — people are still
sending us photos of it.` — **Lena & Tom Marsh**, married at Harrow Barn, June 2025.

**Contact** (`Say it with a brief`): form name / email / date needed (text) / message ("three
words and a budget is a perfect brief"); formSuccess `Received — Marnie or June replies within a
day (two on wedding weekends).` Panel: studio address & counter hours, wedding-consult booking
note.

**Footer**: `Quietpetal — 12 Bell Lane, Bellbrook` · `Counter: Thu–Sat 9–4` ·
`studio@quietpetal.example` · line: `Cut Wednesday. Yours Thursday.`

### Media — run FIRST, before building pages

`media.manifest.mjs` ships 6 pre-verified botanical slots. Copy it into `{{PROJECT_DIR}}`, then
from `{{PROJECT_DIR}}` run:

    WP_URL={{WP_URL}} WP_USER=admin WP_APP_PASSWORD={{WP_APP_PASSWORD}} {{EXJSX_CLI}} media media.manifest.mjs

Slots: `hero-blossom` (tall hero), `daisy-study` `autumn-drift` `dew-grass` `woodland-moss`
(offset grid), `meadow-walk` (about, portrait crop). Herbarium-style captions under each.

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
