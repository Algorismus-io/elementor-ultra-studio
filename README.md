# @algorismus/elementor-ultra-studio

One-command, **self-healing Elementor build environment for AI agents**. Composes
[@algorismus/elementor-ultra-playground](https://github.com/Algorismus-io/elementor-ultra-mcp) (local WP),
[@algorismus/elementor-ultra-mcp](https://github.com/Algorismus-io/elementor-ultra-mcp) (MCP server + companion plugin) and
[@algorismus/elementor-jsx](https://github.com/Algorismus-io/elementor-jsx) (the build layer) — and adds the
operational layer agents otherwise reinvent per session: health checks, self-heal, one-shot pixel
verification, and a generated build brief.

```
eu-studio up                                  # boot hardened local WP (crash-supervised) + doctor pass
eu-studio status                              # one-line health
eu-studio doctor [--page <id>] [--json]       # full health check + self-heal
eu-studio verify --page-url / --anchors a.json# anchor deltas + paint bands + mobile overflow (JSON)
eu-studio brief [--figma <url>] [--out f.md]  # ready-to-run agent build brief for THIS environment
```

Target site resolution: `--url/--user/--app-password` flags → `WP_URL`/`WP_USER`/`WP_APP_PASSWORD`
env → the local playground snapshot's baked credentials. Works against any WordPress with the
elementor-ultra companion plugin, not just the playground.

## Why

Field experience building real pages with agents showed the time sink isn't authoring — it's
environment fragility and verification round-trips:

- the PHP-WASM playground could crash on a bad CSS request (now supervised + auto-respawn),
- Elementor-editor visits can wipe the global-classes store out from under a deployed page,
- CSS priming is flaky on long-running WASM workers,
- verification (measure → compare → patch) cost ~5 tool calls per round without tooling,
- invisible-asset bugs (dark ink on dark background) pass every DOM check and need paint probes.

`doctor` and `verify` encode all of it.

## verify: anchors.json

```json
{ "viewport": 1200, "totalHeight": 4081,
  "anchors": [ { "name": "hero-h1", "selector": "h1", "y": 255 },
               { "name": "signup",  "selector": "text=Get instant access", "y": 3660 } ],
  "bands":   [ { "name": "ticker", "y0": 930, "y1": 975, "minInkPx": 500 } ] }
```

- `selector`: CSS selector, or `text=<exact starting text>`.
- `y`: design-absolute target in px; pass/fail at `--tolerance` (default 2px).
- `bands`: assert that a horizontal strip actually **paints** ink brighter than near-black —
  catches assets that composite to invisible (e.g. black-ink 50%-alpha PNGs on a black section).
- Mobile: asserts `scrollWidth == 390` and names the overflowing elements.

Requires playwright (`npm i playwright`, or point `EXJSX_IT_PLAYWRIGHT` at an existing install).

## CSS harvest (last-resort heal)

If a site's atomic CSS generator refuses to emit (doctor's css check keeps failing after
regen + prime + a server restart), generate the files on a **clean twin** and copy them over:

1. Boot a second pristine instance (`eu-studio up --port 8898 --dir /tmp/twin-site`, or extract the
   playground's `site.tar.gz` and mount it with `@wp-playground/cli`).
2. If the page uses Pro widgets, copy the `elementor-pro` plugin dir in and activate it via
   `PUT /wp-json/wp/v2/plugins/elementor-pro/elementor-pro {"status":"active"}`.
3. Re-run `exjsx media` against the twin (image URLs must be local to the validating site), rebuild,
   `exjsx deploy`. Class labels are content-hashed from styles, so the twin's class set is identical.
4. Visit the page on the twin, then copy `uploads/elementor/css/global-<twinPageId>-frontend-*.css`
   into the real site's css dir under the real page id (plus `base-*.css`). The files contain only
   label-based class selectors — no post ids or URLs — so they transplant cleanly.

## Gotchas this package encodes (so you don't rediscover them)

- Playground 301s **missing static files to the homepage** — a followed fetch of a dead stylesheet
  returns `200 text/html` and looks alive. Always check `content-type`.
- The ultra plugin's `design/classes` REST route is cursor-paginated (default `limit` 25 with
  `next_cursor`/`total`) — page it, raise `limit`, or read the full store in one response from
  Elementor's own `/wp-json/elementor/v1/global-classes`.
- `classes.value` on elements mixes local-style ids with global refs; only `g-*` ids live in the store.
- Never verify tall pages with fullPage screenshots (bottom-of-page image paint drops out
  deterministically on some stacks); verify uses viewport captures only.
- Don't open Playground-hosted pages in the Elementor editor; if styles vanish afterwards, redeploy
  the bundle and run `doctor`.

MIT © Algorismus. Not affiliated with or endorsed by Elementor Ltd.
