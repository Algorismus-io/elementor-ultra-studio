# Build brief: "Cedarline Clinic" — a complete 4-page marketing site, designed from scratch

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

## The site: Cedarline Clinic (fictional — copy seeds below are canonical; extend them in the same voice, crisp and specific)

### Concept

**Cedarline Clinic** — a neighborhood primary-care clinic in Fernhaven on a flat-fee membership
model: same-week appointments, visits that run thirty minutes, prices printed on the wall.
Audience: families and freelancers tired of opaque billing; people comparing membership care to
urgent-care roulette.

### Design direction — TYPE-LED (calm clinical, one sky photo)

Calm is the brand. Lots of air, soft rounded panels, thin-line SVG pictograms (drawn inline —
stethoscope, leaf, clock — 1.5px stroke, `evergreen`), a serif for warmth in the prose. One
cloudscape photo allowed as a quiet hero backdrop; otherwise no imagery.

Palette (roles):
- `mist` `#F4F7F2` — page ground
- `cloud` `#FDFDFB` — panel ground
- `evergreen` `#1E3D34` — headings, pictogram strokes, the inverted banner ground
- `sage` `#7FA98C` — secondary: rules, chips, hover
- `clay` `#C97B4A` — single warm accent: prices, the book CTA, "urgent" markers

Fonts (verified): **Sora** — display/headings + prices, weights 400/600/800; **Newsreader** —
body prose, 400/500 (use its italic for the human asides).

Structural archetypes chosen for THIS site (build all four):
1. **Split-screen 50/50** — home: left half fixed message (`Medicine at a human pace`) + CTA;
   right half the visit types as stacked rounded rows. Repeated nowhere else.
2. **Editorial multi-column** — "what we treat" as a genuine 2–3 column directory of conditions
   (columns of plain text with sage rules — not cards).
3. **A table as a design object** — /pricing/: membership vs. drop-in comparison table (rows:
   same-week visit, 30-min appointments, texts with your doctor, labs at cost, after-hours line),
   checks in `sage`, prices in `clay`, set as the page's centerpiece.
4. **Very short full-bleed banner** — a slim `evergreen` band on every page: `Chest pain or
   stroke signs? Call 911 now — then call us.` in cloud text. The one inverted moment per page.

### Content pack (canonical copy seeds)

**Home hero**: h1 `Medicine at a human pace.` — subcopy: `Thirty-minute appointments, same-week
scheduling, and a price list that fits on one page. Cedarline is primary care the way it should
have stayed.` CTA `Book a visit` → /contact/; secondary `See plain prices` → /pricing/.

Home: split-screen (archetype 1) with visit rows — `New-patient intake · 45 min`, `Everyday care ·
30 min`, `Kids & school forms · 30 min`, `Chronic care check-in · 30 min`; the what-we-treat
column directory (archetype 2: coughs & infections, blood pressure, diabetes care, skin, anxiety &
sleep, sports injuries, vaccinations, women's health, stitches & minor procedures…); the evergreen
urgent band; testimonial; a short numbers row set in Sora 800 (`14 min` median wait · `30 min`
every visit · `$0` surprise bills).

**About** (`Our practice`): Dr. Amaia Reyes-Cole (family medicine, 14 years) and Dr. Sam Okoye
(pediatrics) left a 4,000-patient panel system to cap Cedarline at 600 members per doctor — the
why, in Newsreader prose with italic asides; a `What membership changes` section (unhurried
visits, your doctor answers the phone, labs at cost); the clinic room note — `Two cedar-clad
exam rooms, a kids' corner with actual good books, and no waiting-room TV.`

**Pricing** (`Plain prices`): three offers around the comparison table:
- **Drop-in Visit** — $75 flat: one visit, no membership, price includes basic labs; you'll know
  any extra cost before it happens.
- **Cedarline Membership** — $39/mo per adult: unlimited visits, same-week guarantee, direct
  text/phone line to your doctor, wholesale labs & meds.
- **Family Plan** — $89/mo: two adults + all kids under 18; includes school/sports forms and
  same-day sick-kid slots held every morning.

≥3 disclosures with body copy:
1. `Do you take insurance?` — `We don't bill insurance — that's how visits stay long and prices
   stay printed. Members use insurance normally for specialists, imaging, and hospital care; many
   pair Cedarline with a high-deductible plan. We'll give you itemized receipts to claim against
   an HSA/FSA.`
2. `What's included in membership — and what isn't?` — `Included: every visit, procedures we do
   in-clinic, the after-hours line, and chronic-care management. Not included: prescriptions
   (though we dispense many at wholesale), specialist care, and imaging — for those we quote our
   negotiated cash rates up front.`
3. `After-hours & emergencies` — `Members reach the on-call doctor 24/7 by phone for anything
   that can't wait for morning. True emergencies — chest pain, stroke signs, severe breathing
   trouble — are 911 first, every time; we take over coordination once you're stable.`

**Testimonial**: `I texted at 8am about my son's fever; he was seen by noon and it cost nothing
extra.` — **The Reyes family**, members since 2023.

**Contact** (`Book`): form name / email / phone (tel) / message ("what do you need seen, and
when?"); formSuccess `Request received — our front desk confirms a time within one business day.`
Panel: address, hours, parking note, the urgent band.

**Footer**: `Cedarline Clinic — 402 Cedar Line Road, Fernhaven` · `Mon–Sat 8–6` ·
`(555) 021-3300` · `care@cedarline.example` · line: `Prices on the wall. Doctor on the phone.`

### Media — one image only

`media.manifest.mjs` ships a single pre-verified slot `calm-sky` (soft cloudscape). Use it only
as the home hero backdrop at low contrast under a mist overlay, or skip it entirely if the type
holds alone. Copy the manifest into `{{PROJECT_DIR}}` and run:

    WP_URL={{WP_URL}} WP_USER=admin WP_APP_PASSWORD={{WP_APP_PASSWORD}} {{EXJSX_CLI}} media media.manifest.mjs

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
