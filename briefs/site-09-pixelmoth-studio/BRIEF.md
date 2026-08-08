# Build brief: "Pixelmoth" — a complete 4-page marketing site, designed from scratch

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

## The site: Pixelmoth (fictional — copy seeds below are canonical; extend them in the same voice, crisp and specific)

### Concept

**Pixelmoth** — a four-person indie game studio in Kestrel City shipping its debut,
**LUMEN DRIFT**: a lantern-lit deep-sea exploration game about light as a resource. Audience:
players deciding whether to wishlist/pre-order, press, and small publishers.

### Design direction — TYPE & CSS-ART-LED (CRT arcade, NO green-terminal cliché)

Zero photography. The site is a CRT cabinet: deep indigo ground, magenta/cyan phosphor accents,
scanline overlays, pixel-stepped borders — all CSS/SVG. Explicitly avoid green-on-black hacker
styling; this is a neon arcade, not a terminal.

Palette (roles):
- `abyss` `#120458` — page ground (deep indigo)
- `glowpink` `#FF2E88` — primary accent: CTAs, headliner glow, active states
- `beam` `#00F0FF` — cyan: links, HUD chips, table rules
- `moth` `#EDEBFF` — body text on dark
- `drift` `#7A6FF0` — secondary violet: panels, muted chips

Fonts (verified): **Silkscreen** — pixel display, weights 400/700 (headlines, HUD labels, prices;
set BIG — pixel fonts die at small sizes); **Rubik** — body/UI, 400/600.

CSS-art moves: scanlines (`repeating-linear-gradient` at 3px, low alpha) over hero and bands;
pixel borders via stepped box-shadows; a blinking `PRESS START` cursor animation on the CTA;
glow via layered text-shadow in glowpink/beam; an SVG moth-sprite built from CSS grid squares.

Structural archetypes chosen for THIS site (build all four):
1. **Oversized display type AS layout** — hero: `LUMEN DRIFT` in Silkscreen stacked to fill the
   viewport (≥120px per line), letters glowing; the nav and wishlist CTA hang off the letterforms.
2. **Full-bleed color blocks with hard seams** — home reads like a level-select: flat abyss /
   drift / near-black bands cut hard, one per game pillar (`DIVE` · `HARVEST LIGHT` · `OUTRUN
   THE DARK`), each with HUD-chip copy.
3. **Overlapping/stacked cards with depth** — the devlog: entries as arcade-cabinet cards,
   overlapped and offset, pixel borders, newest on top.
4. **A table as a design object** — /pricing/: the patch-notes/changelog table (version / date /
   headline change) in beam rules on abyss — shipped as a design centerpiece under the editions.

### Content pack (canonical copy seeds)

**Home hero**: h1 `LUMEN DRIFT` (the letterform layout itself); tagline `Your lantern is your
life bar.` — subcopy: `A deep-sea exploration game about spending light to find more of it.
From Pixelmoth — four people, one submarine obsession.` CTA `WISHLIST NOW ▸` (link to /contact/
anchor `#wishlist`), secondary `Watch the reveal` (inline `youtube()` embed lower on the page).

Home: three level-select bands (archetype 2) — `DIVE: 4,000 meters of hand-lit trench, no map,
no minimap`; `HARVEST LIGHT: barter lumens with things that want them more than you do`; `OUTRUN
THE DARK: the abyss notices spent light — travel bright, arrive hunted`; devlog cards (archetype
3) with invented entries (`Devlog 14 — teaching anglerfish to lie`, `Devlog 13 — the lantern
economy is finally cruel enough`); press strip (the testimonial); scanline band with release
line: `Surfacing 2027 — PC first, consoles after the pressure tests.`

**About** (`The studio`): Pixelmoth is Ana Reyes (code), Kofi Boateng (art), Mirren Walsh
(design), and June Sato (audio) — two shipped-game veterans, two first-timers, all listed with
one-line bios; the studio principle — `Small team, small game, deep water: we would rather ship
one perfect trench than an ocean of shallow ones.`; a `press kit` block: logo pack, screenshots,
fact sheet at `press@pixelmoth.example`.

**Pricing** (`Editions`): three editions:
- **Standard** — $24.99: the game at launch, soundtrack sampler, launch-week wallpaper pack.
- **Deluxe** — $34.99: game + full OST (June Sato, 24 tracks) + digital artbook `Drawing in the
  Dark` (140 pages).
- **Founders** — $59.99: everything in Deluxe + closed-beta access this winter, your name in the
  credits reef, and the enamel moth pin mailed at launch. Limited to 2,000.

Below the editions: the changelog table (archetype 4) with invented rows (`0.9.2 — beta — lantern
bartering rebalanced; anglerfish now bluff`, `0.9.0 — beta — the Sunken Lighthouse zone`, `0.8.4 —
alpha — permadeath made optional after playtest riots`).

≥3 disclosures with body copy:
1. `System requirements` — `Minimum: a 2019 mid-range card (GTX 1660 / RX 590), 8GB RAM, SSD
   recommended — the trench streams in. Target: 60fps at 1080p on medium. It runs on Steam Deck
   at 40fps locked, verified badge pending. No online requirement, ever — the abyss works
   offline.`
2. `Early access & beta roadmap` — `Founders beta opens this winter: three zones, wipe at 1.0,
   feedback via the in-game sonar journal. We patch every second Friday; the changelog below is
   the real one, not marketing. 1.0 means the full trench, the ending, and mod hooks.`
3. `Refunds & key resellers` — `Buy from our store or Steam; anywhere else is grey-market and we
   can't help you there. Standard 14-day/2-hour refund terms apply on Steam; on our store it's
   30 days, no questions, even if you finished it — we'd rather have the review than the $25.`

**Testimonial**: `The most confident debut we saw at Nightjar Expo — LUMEN DRIFT understands that
darkness is a resource, not a filter.` — **Iris Kwan**, *Backlit Magazine*.

**Contact** (`Ping the sub`): form name / email / topic (text: wishlist news, press, publishing,
bugs) / message; anchored `#wishlist`; formSuccess `Signal received — we surface for mail twice a
week. You're on the list.` Panel: press-kit link line, `no NFTs, no crypto, don't ask` in tiny
Silkscreen as an easter egg.

**Footer**: `Pixelmoth — Unit 2B, Old Arcade, Kestrel City` · `press@pixelmoth.example` ·
`hello@pixelmoth.example` · line: `Spend light carefully.`

### Media

This site uses NO images by design (the `youtube()` embed is allowed for the reveal trailer —
pick any real, innocuous game-trailer URL or omit it). The package's `media.manifest.mjs` is
intentionally empty — build every visual from type, color, gradients, and CSS/SVG.

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
