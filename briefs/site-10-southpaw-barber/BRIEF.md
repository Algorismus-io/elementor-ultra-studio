# Build brief: "Southpaw Barber Club" — a complete 4-page marketing site, designed from scratch

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

## The site: Southpaw Barber Club (fictional — copy seeds below are canonical; extend them in the same voice, crisp and specific)

### Concept

**Southpaw Barber Club** — a four-chair barbershop on Gaslight Court, Harlan Quay, cutting since
2013: standing appointments, hot-towel shaves, a wall of regulars' photos. Audience: locals who
book the same chair every third Thursday, plus walk-ins deciding from the street.

### Design direction — TYPE & CSS-ART-LED (vintage handbill)

No photography except ONE accent flat-lay. The site is a vintage price handbill brought to the
web: heavy slab display type, dot-leader price rules, barber-pole diagonal stripes drawn in pure
CSS, double-rule borders. Confident, dense, a little gruff.

Palette (roles):
- `navy` `#1B2A41` — primary ground (most sections are navy)
- `cream` `#F4EFE6` — text on navy; ground of the handbill sections
- `poleRed` `#A62639` — accent: stripes, prices, the book CTA
- `steel` `#7D8CA3` — secondary text, rules, meta
(Barber-pole stripe: `repeating-linear-gradient(45deg, poleRed 0 12px, cream 12px 24px, navy
24px 36px)` — used as slim seam bands, never as full backgrounds.)

Fonts (verified): **Alfa Slab One** — display, weight 400 (one weight is the point — vary SIZE
dramatically instead); **Libre Franklin** — body/UI, 400/600/800.

Structural archetypes chosen for THIS site (build all four):
1. **A table as a design object** — THE centerpiece: the price list on /pricing/ (and abridged on
   home) as a vintage handbill — service … dot leaders … price, double-rule top and bottom,
   `EST. 2013` roundel; set on cream in navy ink.
2. **Split-screen 50/50** — home: left `Walk in. Sit down. Look sharp.` manifesto; right the
   abridged handbill. About: left the shop story, right the house-rules list.
3. **Diagonal stripe seams** — every section seam is a slim barber-pole stripe band (the CSS
   gradient above), the site's signature move.
4. **Horizontal band** — the `walk-in board`: a horizontal rail of the week (`TUE 9–7 · two
   chairs · quietest before noon` … `SAT 8–4 · all four chairs · queue by 9`), chips in Libre
   Franklin 800.

### Content pack (canonical copy seeds)

**Home hero**: h1 `Look sharp. Stay sharp.` — subcopy: `Four chairs, three barbers, one standard
since 2013. Walk in off Gaslight Court or book your usual — either way you leave right.` CTA
`Book a chair` → /contact/; secondary `The price list` → /pricing/.

Home: the split manifesto/handbill (archetype 2); the walk-in board (archetype 4); a short navy
band with the club line — `Members get the 8am chairs. There is no 7am chair.`; testimonial;
stripe seams throughout (archetype 3).

**About** (`The shop`): story — Ray "Southpaw" Deluca opened with two chairs and a transistor
radio in 2013; now four chairs: Ray, Bex Okonkwo (fades, twelve years), Tomas Vidal (shears &
shaves, Seville-trained); apprentice chair Saturdays. House rules split-screen — right column
list: `Cash or card, tips in the jar` · `Kids weekdays before 4` · `No phone calls in the chair —
texts are your business` · `The radio plays what Ray likes`; a line on the wall of regulars —
`Bring a photo for the wall at your tenth cut. Tradition's tradition.`

**Pricing** (`The price list`): the full handbill table (archetype 1) — rows: `The Standard
(cut, wash, style) … $28` · `Skin fade … $34` · `Beard trim & line-up … $18` · `Hot-towel shave …
$38` · `Cut & hot-towel shave … $52` · `Kids under 12 (weekdays) … $19` · `Buzz & out (10 min) …
$15`. Plus three offers set beside/below it:
- **The Standard** — $28: the cut that named the shop; thirty minutes, no upsell, walks out
  finished.
- **Cut & Hot-Towel Shave** — $52: the full hour — cut, two hot towels, straight razor, cold
  finish; book ahead, Tomas's chair only.
- **The Club** — $85/mo: unlimited between-cut cleanups (neck, ears, line-up), two full cuts a
  month, priority 8am chairs, your preferences on file. Twenty memberships per barber, waitlist
  when full.

≥3 disclosures with body copy:

1. `Do I need an appointment?` — `No — walk-ins fill whatever the book doesn't, first come, and
   the walk-in board on the home page tells you when the queue is short. Booked regulars hold
   their slot for ten minutes; after that the chair goes to the bench.`
2. `First visit — what to expect` — `Come in five early, say what usually goes wrong with your
   cut, and bring a photo if you have one — a bad photo beats a good description. First cuts run
   ten minutes longer because we write your card: guard numbers, cowlicks, how you part. Second
   visit onward, "the usual" actually means something.`
3. `Late, no-shows & kids` — `Ten minutes late, the chair may be gone — we'll fit you in when we
   can. Two unannounced no-shows and the book closes to you for a month (the bench never does).
   Kids cut weekdays before 4; a parent stays in the shop, and the lollipop is non-negotiable.`

**Testimonial**: `Twelve years, three cities, one barber worth the drive back.` — **Marcus
Bell**, Club member #041.

**Contact** (`Book a chair`): form name / email / barber & day (text: "any chair" is fine) /
message; formSuccess `Booked-ish — we confirm your chair by text within the hour, shop hours.`
Panel: address, the walk-in board condensed, phone `(555) 090-4411`.

**Footer**: `Southpaw Barber Club — 7 Gaslight Court, Harlan Quay` · `Tue–Fri 9–7 · Sat 8–4` ·
`chairs@southpawbarber.example` · `(555) 090-4411` · line: `Est. 2013. Still $28.`

### Media — one accent image only

`media.manifest.mjs` ships a single pre-verified slot `dapper-kit` (a gentleman's-accessories
flat-lay on dark wood). Use it once — e.g. beside the Club membership tier or the about story —
framed with a double rule like a shop photo. Copy the manifest into `{{PROJECT_DIR}}` and run:

    WP_URL={{WP_URL}} WP_USER=admin WP_APP_PASSWORD={{WP_APP_PASSWORD}} {{EXJSX_CLI}} media media.manifest.mjs

Everything else is type, rules, and stripes.

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
