# Build brief: "HALIDE: A Century of Light" — a complete 4-page marketing site, designed from scratch

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

## The site: HALIDE: A Century of Light (fictional — copy seeds below are canonical; extend them in the same voice, crisp and specific)

### Concept

**HALIDE: A Century of Light** — a special exhibition at the (fictional) Ashmere Museum of Art,
12 September 2026 – 31 January 2027: one hundred years of documentary photography in four rooms,
from glass-plate landscapes to the last darkroom generation. Audience: museum visitors planning a
trip, members, students, school groups.

### Design direction — IMAGERY-LED (monochrome prints + acid wayfinding)

The photographs are the exhibition and the website: every image strictly monochrome, edge-to-edge,
museum-hung on near-black. ONE synthetic color — acid yellow — plays the role of the gallery's
wayfinding tape: caption chips, section markers, the ticket CTA. It never tints the photographs.

Palette (roles):
- `gallery` `#111111` — page ground (near-black)
- `paper` `#F5F4F0` — long-form wall text ground (one light section per page)
- `silver` `#C9C9C9` — body text on gallery ground
- `acid` `#E3FF00` — wayfinding accent: chips, rules, active nav, ticket CTA
- `ash` `#6E6E6A` — captions, credits

Fonts (verified): **Syne** — display, weights 500/700/800 (its odd geometry reads
gallery-graphic); **IBM Plex Sans** — body, captions, labels, 400/600.

Imagery treatment: photographs full-bleed with hard seams; every image gets a real caption line in
`ash` with an `acid` index chip (`I.3`); PD historical prints get artist/date/collection credits
EXACTLY as given in the manifest comments — these are real works, credit them properly.

Structural archetypes chosen for THIS site (build all four):
1. **Sticky/pinned side rail** — home: the four exhibition chapters (`I Land` · `II Labor` ·
   `III Street` · `IV Departures`) pinned left as an acid-chip index while the picture wall
   scrolls right (stacks on mobile).
2. **Full-bleed image seams** — prints butt edge-to-edge with no gutters; chapter breaks are a
   single acid rule, not padding.
3. **Editorial multi-column wall text** — about/curator's essay set in 2–3 justified-feel columns
   on `paper`, like gallery wall text.
4. **A table as a design object** — /pricing/: the visiting grid (day / hours / last entry /
   notes) as a ruled silver-on-gallery table; also the tickets themselves as tabular rows, not
   cards.

### Content pack (canonical copy seeds)

**Home hero**: h1 `A Century of Light.` — over/beside the fog-bound monument photograph; subcopy:
`One hundred years of documentary photography — 140 prints, four rooms, one darkroom rebuilt in
the east gallery. 12 September 2026 – 31 January 2027.` CTA `Plan your visit` → /pricing/.

Home: the chapter rail + picture wall (each image captioned, e.g. `I.1 — Monument in fog` /
`II.1 — Lange, Migrant Mother, 1936` / `II.2 — Hine, Power house mechanic, 1920` /
`I.2 — Adams, The Tetons and the Snake River, 1942`); a short acid band: `140 prints. 4 rooms.
1 working darkroom.`; the critic quote.

**About** (`The exhibition`): curator's essay (archetype 3, on paper ground) — invent in a real
curatorial voice: what "halide" means (the silver salts that made every image here), why the show
ends where digital begins; a `Programs` section — Thursday curator tours 18:00, darkroom demos
Sat/Sun 14:00, school workshop `Fix the Shadow` (KS2–3); lender credits line — `Prints lent from
the National Archives, the Farm Security Administration collection, and private lenders.`

**Pricing** (`Tickets & visiting`): tickets as tabular rows:
- **General** — $18 (concessions $12, under-12s free): timed entry, includes collection galleries.
- **Member** — $0: free unlimited entry, the members' preview evening 11 September, no timed slot
  needed.
- **Patron Circle** — $250/yr: membership for two, curator's walkthrough (choose a date), the
  clothbound exhibition catalogue, darkroom demo priority.

Visiting grid (the table object): Tue–Sun 10–17, Fri to 21 (last entry one hour before); closed
Mondays & 25 Dec; step-free via Colonnade entrance.

≥3 disclosures with body copy:
1. `Photography in the galleries` — `Handheld, no flash, no tripods — except Room II, where lender
   agreements forbid photography entirely; it's marked with the crossed-camera tape at the
   threshold. The darkroom is lit safelight-red and cameras are useless there anyway. Sharing is
   encouraged; the show tag is #HalideAshmere.`
2. `Accessibility` — `Step-free route to all four rooms via the Colonnade entrance; wheelchairs
   and portable stools free at the cloakroom. Large-print label books in every room; audio
   descriptions on the free guide; BSL curator tour first Thursday monthly. The darkroom demo has
   a low-light warning and a seated option.`
3. `Groups & school bookings` — `Groups of 10+ book a slot at groups@ashmere.example (10% off,
   one free leader ticket per ten). School visits are free Tue–Fri mornings including the "Fix
   the Shadow" workshop — book at least three weeks ahead; risk-assessment pack on request.`

**Testimonial**: `The most rigorous hang this museum has attempted in a decade — Room II alone is
worth the ticket.` — **Jonas Ferreira**, *The Ashmere Ledger*.

**Contact** (`Ask the museum`): form name / email / topic (text) / message; formSuccess
`Received — visitor services replies within two working days.` Panel: address, the visiting grid
condensed, press contact `press@ashmere.example`.

**Footer**: `Ashmere Museum of Art — 1 Colonnade Walk, Ashmere` · `Tue–Sun 10–17, Fri to 21` ·
`halide@ashmere.example` · line: `Silver, salt, light.`

### Media — run FIRST, before building pages

`media.manifest.mjs` ships 10 pre-verified slots: 7 monochrome photographs (grayscale baked into
the picsum URLs) + 3 genuine public-domain prints from Wikimedia Commons (Lange, Adams, Hine —
license and source page recorded in the manifest comments; keep their credit lines in captions).
Copy the manifest into `{{PROJECT_DIR}}`, then from `{{PROJECT_DIR}}` run:

    WP_URL={{WP_URL}} WP_USER=admin WP_APP_PASSWORD={{WP_APP_PASSWORD}} {{EXJSX_CLI}} media media.manifest.mjs

Slots: `hero-monument-fog` (hero), `pd-migrant-mother` `pd-tetons` `pd-power-mechanic` (Room
I/II anchors — credit properly), `flats-mist` `night-alley` `coast-rocks` `farm-rows` `ridge-fog`
(picture wall), `camera-still` (about/programs section). Note: `pd-migrant-mother` is a ~5.6MB
original — sideload once, be patient.

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
