# §13 review — FAIL

Reviewer: `claude-code/sonnet-5` (Claude Lead), 2026-07-30.
Candidate: `d5208c5a46516b48b8e3bd7ca77dda79fefdd5e8` (HEAD at turn start,
`phase10(§13): implement universe fixes from the July 30 sitting`).
Ledger: `docs/phase10-workflow/acceptance/section-13.json` (15 criteria).

## Independent verification performed

- `npm test`: 112 test files, 583 passed, 1 skipped (intentional), zero
  failures. Matches the implementer's own run exactly.
- `npm run build`: exit 0, 18 routes, unchanged route list, `/share` smoke
  PASS. Matches the implementer's own run exactly.
- Read the complete diff (`git diff 807d08d d5208c5 -- src/`) line by line
  against the spec: `orrery.ts`, `scene-model.ts`, `universe-palette.ts`,
  `OrreryWorld.tsx`, `OrreryScene.tsx`, `DraftRig.tsx`, `PlanetDetail.tsx`,
  `dashboard-data.ts`, `orrery.module.css`. Every renamed function, moved
  call site, and changed constant matches the spec's own table exactly
  (FB-26's five renames and `dayReturn` call sites, FB-01's `1.82`/`0.75`,
  FB-05's `12px`, FB-17's `600px`, FB-02's five moves, FB-24's
  `isUsableNewsUrl` filter, FB-25's two new panel fields).
- Independently launched Chromium directly against a freshly built
  production server (`npm run build && npm run start -p 3100`), matching
  `AGENTS.md`'s Live Verification procedure, and wrote new reviewer-owned
  scripts under `docs/phase10-baseline/section-13/review-scripts/` (not
  reused implementer output) to re-derive:
  - **`VIS-01`**: re-measured minimum edge-to-edge planet spacing directly
    from a fresh page load — 89.97px between ASML/MSFT, ratio 2.16x the
    larger disc's diameter (floor 1.0x). Matches the implementer's own
    90.1px/2.16x within capture-to-capture noise. **PASS.**
  - **`VIS-03`**: re-measured the approach panel's rendered width at all
    five viewports (1280/1366/1440/1536/1920) against a fresh production
    server — exactly 600px at every width, confirming the `calc(100vw -
    3rem)` floor does not bind in this range. **PASS.**
  - **`VIS-05`**: independently confirmed via computed style / DOM /
    network request rather than trusting the implementer's notes:
    `.starField`'s `background-image` is now a single `linear-gradient`
    (dot-grid/ellipse layers absent), `.skyVignette` is present in the DOM,
    and `/textures/nebula/filament.ktx2` serves 200 with the documented
    29,016-byte size. **PASS.**
  - **`VIS-06`**: reviewed a fresh overview capture — clean sun silhouette,
    no yellow/gold haze above it. **PASS.**
  - **`VIS-07`**: clicked a planet to move overview → approach and read the
    chip's live `style.left/top` in both states — the chip moved with the
    sun in both (not pinned to frame-center). **PASS.**
  - **`BHV-01`** (also independently covered by `npm test`) / **`VIS-08`**:
    read the moon's own evidence hook (`dataset.evidenceMoonTarget`/`X`/`Y`),
    clicked it, and confirmed the resulting panel shows a real headline
    (`AMD Fell 8%...`) linking to a genuine `https://finnhub.io/...` URL.
    **PASS.**
  - **`VIS-09`**: opened ASML's panel fresh and read its full text —
    `CONTRIB ▼ 2.0%` and `VS VOO ▼ 7.2%` both present alongside
    `WEIGHT`/`VOL`/`BETA`, matching the implementer's own values exactly.
    **PASS.**
  - **`MOB-01`**: confirmed `scrollWidth === clientWidth` at 390x844 on a
    fresh load (no horizontal overflow). **PASS.**
  - **`TST-01`/`PRV-01`/`TST-02`/`BLD-01`**: covered directly by the
    independent `npm test`/`npm run build` runs above. **PASS.**
  - **`VIS-02`**: corroborated by `TST-01`'s independently-passing rendered
    12px assertion plus a reviewed capture. **PASS.**
  - **`VIS-10`**: **FAIL — see Finding 1.**
  - **`TST-03`/`VIS-04`**: **FAIL — see Finding 2.** (Implementer correctly
    left these `deferred_to_reviewer` rather than silently passing or
    failing them; this is exactly the reviewer decision the handoff asked
    for.)

## Findings

### Finding 1 — `VIS-10` (FB-31): the active tab's cream underline never
renders; every tab looks identical

**Risk:** medium. **Criterion:** `VIS-10`.

The orange background is genuinely gone (independently confirmed:
`backgroundColor: rgba(0, 0, 0, 0)` on every tab, live computed style) — the
literal "no orange background" text of `VIS-10` is satisfied. But the fix's
own stated intent — "the already-owner-confirmed variant B boxless /
cream-underline treatment" — is not fully delivered: **the active tab never
shows the intended `2px solid cream` underline.**

Root cause: `orrery.module.css` has a pre-existing, unconditional rule at
(current) line 2976, `.missionControl .missionStrip nav a { border: 1px
solid rgba(213, 186, 140, 0.28); ... }`, which was already shipping before
this section (it back-fills the "boxed" tab look the old default used and
the `data-strip-variant="b"` evidence variant already overrode with its own
more-specific selector). This rule and the new
`.missionControl nav a[aria-current="page"] { border-bottom: 2px solid
var(--universe-cabinet-cream); }` rule have **identical CSS specificity**
(0,2,2 each) and both set `border-bottom-*`. Per the cascade, the one later
in the file wins for tied specificity — and the nested `.missionStrip` rule
(line 2976) is declared *after* the `[aria-current="page"]` rule (line 891),
so it wins. The active tab's border-bottom resolves to the nested rule's
`1px solid rgba(213, 186, 140, 0.28)`, not the intended `2px solid cream`.

Independently confirmed live (`docs/phase10-baseline/section-13/review-scripts/review-tabs.mjs`,
reused for this finding): every one of the 8 tabs, active and inactive
alike, computes to `borderBottomWidth: "1px"`, `borderBottomColor: "rgba(213,
186, 140, 0.28)"`. A screenshot of the live tab strip
(`docs/phase10-baseline/section-13/review-scripts/out/review-tab-strip.png`)
shows no visual distinction between the active `ORBITS` tab and the other
seven — the affordance FB-08's "B is fine" treatment was supposed to give
(which tab is open) is absent in the shipped default, even though it does
render correctly under the `?stripVariant=b` capture-only query param
(that path's own more-specific `[data-strip-variant="b"] nav
a[aria-current="page"]` rule, specificity (0,4,2), safely beats the nested
rule).

The implementer's own handoff flagged this exact risk area ("FB-31's fix
touches a general selector, not the nested one... worth an independent
look") but the investigation performed only checked `background`/`color`
(which are unaffected), not `border`/`border-bottom` (which is affected).

**Required change:** give the active-tab cream-underline rule higher
specificity than `.missionControl .missionStrip nav a` — e.g. scope it as
`.missionControl .missionStrip nav a[aria-current="page"]` — or reorder so
it is declared after line 2976, and verify with live computed style
(`border-bottom-width`/`border-bottom-color`) rather than source reading
alone that the active tab actually differs from the inactive tabs.

### Finding 2 — `TST-03`/`VIS-04` (FB-26): the trail-sampler gate fails for
5/8 tickers, and the recorded root cause does not explain 2 of the 5

**Risk:** critical (`TST-03`) / high (`VIS-04`), shared evidence file.

The implementer's own evidence
(`docs/phase10-baseline/section-13/raw-trail-sampler-TST-03.json`) is
honest and was not silently passed — correctly left `deferred_to_reviewer`.
Independently read in full rather than trusting the summary in the handoff.

The stated root cause — "three holdings (MSFT, INTC, CBRS) whose dayReturn
simultaneously exceeds the 12% clamp ceiling... the trail's own additive
glow pass... brightens the sampled pixel 1-2.5 ΔE units past the gate" — is
correct and sufficient **only for those three tickers** (ΔE 8.28, 9.695,
8.25, all pinned to the identical brightest ramp stop `#a9ffcf`). It does
**not** account for the other two failures:

- **ASML** — `dayReturn` +6.5%, nowhere near the 12% clamp ceiling, ΔE
  8.993. ASML's orbit is the innermost in this fixture and its trail head
  sample point sits close to the sun in the capture plate
  (`docs/phase10-baseline/section-13/trail-daily-1440x900.png`, ASML
  crop) — proximity to the sun's own additive glow/bloom shells is a more
  plausible contributor than clamp collision, and was not investigated.
- **COST** — `dayReturn` -2.1%, ΔE 10.156, the *worst* of all 8 samples.
  **IBM**, at an almost identical magnitude (-2.0%), passes cleanly at ΔE
  6.674 — a 3.5 ΔE gap between two holdings whose input differs by 0.1
  percentage points. This divergence is not explained by the additive-glow
  theory (which predicts a roughly uniform bleed at a given magnitude) and
  was not investigated per-ticker.

Both `TST-03` and `VIS-04` fail their literal, unweakened criteria (5/8
tickers exceed ΔE≤8) and the recorded explanation is incomplete, so this
cannot be marked `pass`, and it should not be carried or excepted on a
partial explanation. FB-26's own scope forbids touching the magnitude
clamps or ramp/arc formulas, and that boundary is correct and unchanged by
this finding.

**Required change:** re-investigate ASML's and COST's failures
specifically (not as more instances of the already-understood clamp
collision) before assuming this is an unavoidable design tension:
- Check whether ASML's near-sun orbital position causes contamination from
  the sun's own additive glow shells or docking ring at the trail's sampled
  pixel.
- Check why COST diverges so sharply from IBM at nearly identical
  magnitude — candidates include overlap with a nearby moon marker/label
  chip, or the newly-added FB-02 ecliptic graticule ring (this section) if
  COST's orbit radius happens to sit near the graticule's `1.6-1.66x
  outerRadius` band.
- Do **not** touch `MIN_RETURN_MAGNITUDE`/`MAX_RETURN_MAGNITUDE`, the ramp
  functions, or arc-length formulas — that boundary from the original spec
  is unchanged.
- If a genuine, ticker-specific rendering contamination is found and fixed,
  re-run the full 8-ticker sampler and report the new pass count.
- If, after a real per-ticker investigation, all 5 failures turn out to
  trace to the same inherent glow/clamp characteristic after all, report
  that explicitly with the additional evidence (do not resubmit the same
  three-ticker explanation for the other two) — at that point this becomes
  a legitimate carry-forward or design-tension call for Devan, matching the
  §10/§11 `BLD-04` precedent, and should say so rather than being marked
  `pass`.

## Result

13 of 15 criteria: **pass** (independently re-verified above, not merely
trusted from the implementer's notes). 2 criteria: **fail** (`VIS-10`,
`TST-03`+`VIS-04`, both bounded findings above). `npm run phase10:acceptance
-- check docs/phase10-workflow/acceptance/section-13.json --require
reviewer` → valid (all reviewer fields filled).

Routing to `stage: remediate`, `role: codex_implementation`, `next_actor:
codex` with these two bounded findings. No new criteria introduced, no
advisory findings beyond the two above.
