# Phase 10 §9 review — Universe craft and depth

Reviewed by `claude-code/opus-5` (Claude Lead, `review` stage), July 28, 2026.

- Spec under review: `docs/phase10-workflow/specs/section-9.md`
- Reviewed commit: `bc1b79c97a9487174f389430a6f5fc8447ebde05`
  (`phase10(§9): craft the universe operations layer`)
- Diff base (`prev_actor_commit`): `77c74b3d725ada00e6783822eebffcb6f3e7fbec`
- Result: **FAIL — 6 bounded findings**

The `portfolio-ux` project skill was invoked for this turn via the `Skill`
tool (not the fallback path) and applied beneath the authority order in the
spec's §1. It created no new criteria and no advisory findings.

## Verification run independently this turn

| Check | Result |
|---|---|
| `npm test` | PASS — 94 test files, 496/496 tests |
| `npm run build` | PASS — Next.js 16.2.11, TypeScript clean, 18 static-generation tasks, 24 route entries |
| `npx next start` + live route probe | **FAIL — `/share` returns HTTP 500 on every request** |

`npm test` and `npm run build` are green, so criterion 53 passes literally.
They do not exercise the server/client component boundary, which is where the
section's primary route breaks.

## Findings

Each finding cites the spec requirement it fails, the evidence, and the
required change. Nothing optional or advisory is recorded here.

### F1 — `/share` returns HTTP 500 in the production build (blocking)

- **Criterion:** 9 ("Mission Control's seven bays are reachable by link,
  keyboard, and `?station=` URL"). Also blocks criteria 1–5, 7, 8, 10–13,
  15–17, 20–22, 25, 26, 50, 54, 56, 60 and 66, none of which can be observed
  while the route does not render. Authority §1's route-usefulness and
  resilience gates apply.
- **Evidence:** Against the production build produced in this review turn,
  `curl http://127.0.0.1:3100/share` returns `500`, as does
  `/share?focus=portfolio&camera=command&station=manifest`. The server log
  repeats `TypeError: l.MISSION_CONTROL_PANELS.some is not a function`
  (digest `69160525`). Full capture:
  `docs/phase10-baseline/section-9/claude-review/raw-route-status.txt` and
  `share-1440x900-FAILS.png`.
- **Root cause:** `src/components/observatory/orrery/MissionControl.tsx:1`
  gained `"use client"` in this section (it had no such directive at
  `77c74b3`). The server component
  `src/components/observatory/orrery/UniverseRoute.tsx:15` still imports the
  runtime value `MISSION_CONTROL_PANELS` from that now-client module and
  calls `.some(...)` on it at line 43. Across the client boundary that export
  is a client-reference proxy on the server, not an array.
  `/` returns 200 only because the owner gate renders the sign-in form before
  `resolveMissionPanel` is reached; the same crash occurs once authenticated.
- **Required change:** Move `MISSION_CONTROL_PANELS` and
  `MissionControlPanelId` into a shared non-`"use client"` module that both
  `UniverseRoute.tsx` (server) and `MissionControl.tsx` (client) import, so no
  runtime value crosses the boundary. Add coverage that would catch a 500 on
  `/share` — the current unit tests import the modules directly under vitest,
  where the boundary does not exist, and `npm run build` never prerenders
  `/share` because it is a dynamic route.

### F2 — the planet detail benchmark overlay draws a fabricated VOO trace

- **Criterion:** 42 ("Unavailable values render as `—` with the reason
  reachable, never as `0.0%` or a fabricated figure"), spec §6.2 ("A
  benchmark-overlay toggle adds same-period VOO as a dashed trace"), and §1's
  binding constraint that every visual object encodes one real computed number.
- **Evidence:** `src/components/observatory/orrery/PlanetDetail.tsx:102`
  renders the overlay as
  `<polyline className={styles.benchmarkTrace} points="0,71 80,66 160,69 240,57 320,52" />`.
  Those coordinates are string literals. They do not derive from
  `holding.chart`, from `benchmarkComparisons`, or from any other input, so
  the same "VOO" line is drawn for every holding, every range, and every data
  state. The main trace on the same chart is real (`tracePoints(values)` over
  the indexed price series), which makes the invented line read as measured.
- **Required change:** Drive the overlay from the real same-period VOO series,
  or, when that series is not supplied to the component, render the toggle in
  its unavailable state (as `SINCE BUY` already does) rather than drawing a
  literal path. No invented figure may ship on a chart.

### F3 — the retained long-task measurement script cannot execute

- **Criterion:** 54 ("measured across five fresh contexts after the texture
  change, with raw per-run output committed") and 50 ("A live RGB
  pixel-sampling script is retained in the repository and its raw output
  committed").
- **Evidence:** `node --check
  docs/phase10-baseline/section-9/scripts/measure-long-tasks.mjs` fails with
  `SyntaxError: Unexpected token '}'` at line 42 — the final
  `Math.max(...runs.map(({ maximumMs }) => maximumMs),` is missing its closing
  parenthesis, so the file never parses. The implementation handoff directs
  the reviewer to run exactly this script.
  `raw-long-task-output.txt` and `raw-rgb-pixel-output.txt` both contain only
  `NOT CAPTURED IN CODEX IMPLEMENTATION ENVIRONMENT.`
- **Required change:** Fix the script so it parses and runs, then commit the
  five fresh-context raw runs (1440×900, CPU 2×, every route-owned maximum
  under 50 ms) and the raw RGB sampling output, replacing both placeholder
  files.

### F4 — criterion 52's sun-invariance test cannot fail

- **Criterion:** 52 ("A test asserts the sun's body parameters — colour,
  corona width, sunspot intensity, pulse — are **identical** with and without
  hover/focus"), read together with §10.1's rule that §9 replaces hollow
  guards with assertions that can actually fail.
- **Evidence:** `src/lib/observatory/scene-model.test.ts`, test "keeps sun
  physiology identical across interaction states", is:
  `const beforeHover = sunVisualParameters(-0.5, 0.7); const afterHover =
  sunVisualParameters(-0.5, 0.7); expect(afterHover).toEqual(beforeHover);`
  Both calls pass identical arguments to the same pure function. No
  hover or focus state is varied anywhere in the test, so it asserts
  determinism, not interaction-invariance, and would still pass if hover were
  wired into the sun's appearance.
- **Required change:** Vary the interaction input and compare the resulting
  descriptors — e.g. assert `buildOverviewSceneModel({...}).sun` is deeply
  equal with `hoveredTicker` unset and with the sun hovered/focused, so the
  test fails if any sun body parameter ever becomes interaction-dependent.
  (The implementation itself is correct here: `OrreryScene.tsx` drives the sun
  material and corona only from `healthRef` and `sceneModel.sun`, and hover
  changes only `dockingRing.visible`. The test, not the behaviour, is what
  fails this criterion.)

### F5 — the public-log canary does not cover share counts

- **Criterion:** 61 ("Canary tests extend the existing distinctive-value
  fixture pattern in `src/app/(depth-pull)/share/page.test.tsx` to assert that
  **share counts**, prices, totals, realized-gain magnitudes, and trade
  reasons are absent from the public render").
- **Evidence:** In `src/app/(depth-pull)/share/page.test.tsx` the added
  canaries cover prices (`222.22`), day/prev-close (`333.33`, `444.44`),
  totals (`999999.99`, `111111.11`), realized-gain magnitude (`8888.88`) and
  the trade reason (`PRIVATE_TRADE_REASON`). Share counts are not covered: the
  fixture's only share values are `shares: 100` (line 57) and `shares: 10`
  (line 68), neither distinctive, and no assertion checks for their absence.
  A regression that leaked share counts would pass this suite.
- **Required change:** Give at least one fixture position a distinctive share
  value in the same style as the other canaries and assert it is absent from
  the public render.

### F6 — the required live evidence set is absent

- **Criterion:** 13 (32-pixel test verified against a live 32 px rendered
  sphere), 25 (1440×900 before/after screenshots for OVERVIEW,
  APPROACH/planet detail, all seven bays, the sector map, sun docking, and a
  moon and satellite hover), 26 (mobile fallback re-verified live at 390 px
  and 320 px — `canvas` count 0, no horizontal overflow, no sub-44 px
  targets), 50 and 54 (raw output committed), plus spec §12's evidence
  README requirements.
- **Evidence:** `docs/phase10-baseline/section-9/` contains no after
  screenshots at any viewport, no fallback audit output, and no live 32 px
  sphere strip; the only image is the authored-map thumbnail proxy, which the
  evidence README itself states "is a texture proxy, not the still-missing
  live 32 px sphere strip". Both raw output files read `NOT CAPTURED`. I could
  not close this gap during review: `/share` returns 500 (F1), and the
  owner-gated `/dev/phase10-portfolio-orrery` renders only the sign-in form
  (0 canvases) without owner credentials, which this turn did not use.
- **Required change:** After F1 is fixed, capture and commit the complete §12
  evidence set against a running production build, and record the results in
  `docs/phase10-baseline/section-9/README.md` with executor suffixes.

## Criteria that passed on inspection

Recorded so the remediation round does not redo settled work. These were
verified from source, tests, and committed artifacts; several remain
contingent on F1 being fixed before they can also be confirmed live.

- **6, 55** — the texture ladder is honestly recorded with measured totals at
  each tier (44,368,743 → 22,958,079 → 11,710,317 bytes), the Basis probe
  failure is retained verbatim (`command not found: basisu`, exit 127), and
  the shipped directory is 11,727,680 bytes, matching
  `texture-manifest.json`'s `totalBytes` and under the 15,000,000-byte cap.
- **14** — the generator's `Math.sin`/`Math.cos` synthesis path is gone; the
  authored 2048×1024 plates are the source of the base maps.
- **43, 9.1 contract** — `buildPublicTradeLog` emits exactly the five
  specified fields, `impactPct` is a ratio rounded to 3 decimals, and
  `realizedSign` carries sign only.
- **32** — contrast is computed from source tokens by
  `planet-identity.test.ts`, and the token pairs it asserts
  (`#e8f1df`/`#020706`, `#f6d493`/`#21120d`, `#fff0cf`/`#7d3d1d`,
  `#d5ba8c`/`#3b1f12`) are the values actually used in
  `orrery.module.css` — the assertions are grounded, not invented.
- **33, 34, 35, 36** — the plot canvas is `aria-hidden`; manifest rows are
  real `Link`s and `MissionControl` wires both `onPointerOver` and
  `onFocusCapture` to the blip flare; dialog semantics and focus restoration
  to `[data-portfolio-sun]` are intact; signals cells always carry a
  `+`/`−`/`—` glyph.
- **39, 40** — the teletype reads `data.twrPct`, and `SINCE BUY` is labelled
  `SIMPLE` with the benchmark toggle disabled while it is active.
- **44, 45, 46** — `buildOverviewSceneModel` is pure and serialisable, and is
  asserted directly for ring opacity/fog, two-pass trails, label
  size/collision yield, nebula alpha and hue, moon buckets, projected planet
  diameters, and satellite placement across a rebalance fixture.
- **47** — both named source-string guards are deleted; their replacements
  assert rendered HTML and scene-model output. One behaviour the deleted
  `MissionControlContent.source.test.ts` covered — that the owner branch is
  reached only under `authenticated && ownerGate` — now rests on the
  `UniverseRoute.tsx:135` condition plus the authenticated-visitor test in
  `share/page.test.tsx`; that pairing is adequate, but the gating condition
  itself is no longer directly asserted, so keep it in view when F1 moves this
  code.
- **63** — a rejected news fetch degrades to an empty projection and a
  `NO TRANSMISSIONS` line without throwing, asserted in
  `dashboard-data.source.test.ts`.
- **65** — no `.env*` contents were read, printed, edited, staged, or
  committed, and no `vercel --prod` was run, in the implementation turn or in
  this review turn.

## Next actor

`stage` → `remediate`, `next_actor` → `codex`. Fix only the six findings
above. F1 is the gate: nothing else can be confirmed live until `/share`
renders.
