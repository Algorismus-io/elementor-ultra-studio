# Build brief: "{{SITE_NAME}}" — a complete 4-page marketing site, designed from scratch

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
2. Build: `{{EXJSX_CLI}} lint|build|deploy` with `WP_URL={{WP_URL}} WP_USER=admin WP_APP_PASSWORD={{WP_APP_PASSWORD}}`.
   Deploys self-prime CSS. Write the WHOLE site before the first deploy.
3. Verify structure — ONE call: `{{STUDIO_CLI}} verify --pages /,/about/,/pricing/,/contact/`
4. Test interactions — ONE call (never hand-write playwright):
   `{{STUDIO_CLI}} clicktest --form /contact/ --accordion /pricing/ --burger / --nav /=about`
5. Design review: a handful of playwright screenshots at 1200 + 390, viewed and judged.
6. If css ever breaks: `{{STUDIO_CLI}} doctor` once; if the file store keeps flaking,
   `{{STUDIO_CLI}} carry-css --page <id> …` once at the end.

(Playwright for screenshots: `EXJSX_IT_PLAYWRIGHT={{PLAYWRIGHT}}`.)

## The site: {{SITE_NAME}} (fictional — invent all copy, crisp and specific)

{{DIRECTION}}

Rule 0: design and author FROM SCRATCH — do not search for or reuse any prior site implementation.

fs-project at `{{PROJECT_DIR}}` (`theme.mjs` tokens → `components/` shared Nav/Footer → `pages/`):

1. **home** (front page after deploy via `/wp/v2/settings` `{show_on_front:"page", page_on_front:<id>}`):
   nav (wordmark, links, CTA) · hero with CSS/SVG-only art · 3 feature cards · stats band ·
   testimonial · footer (links, inline-SVG socials, copyright).
2. **about**: manifesto story, values grid, team grid (CSS initials avatars, no photos).
3. **pricing**: 3 tiers (one featured), checklists, FAQ with 4 real `<details>/<summary>` accordions.
4. **contact**: pitch + working Pro form (`actions:['collect-submissions']` — email action is
   upstream-broken on this stack) + `formSuccess()` for the visible sent-state.

No stock images — typography, color and CSS graphics carry the design. Cross-page links use real
pretty URLs; in-page CTAs may use `id`-prop anchors.

## Method

theme.mjs → components → all four pages → lint (fix errors) → build → deploy → front page →
`verify --pages` + `clicktest` (one call each) → screenshots, judge, fix what looks off →
redeploy (idempotent) → re-verify. **Max 2 fix rounds** — report residuals instead of chasing.

## Report (final message — keep it SHORT)

- Page IDs + URLs (one line each)
- Final `verify --pages` JSON and `clicktest` JSON, verbatim
- Screenshot directory path
- Accepted deviations as a terse bullet list
No prose narrative, no per-page tables, no design essay — the JSON is the record.
