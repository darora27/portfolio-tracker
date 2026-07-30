# Phase 10 §12 (§12a) specification: closing the board, not opening a new one

Prepared July 30, 2026 by `claude-code/sonnet-5` (Claude Lead, `stage: specify`).

Design proof: `docs/phase10-workflow/design-proofs/section-12.md`
Acceptance ledger: `docs/phase10-workflow/acceptance/section-12.json`

Authority order for this section, per `PHASE10_STATE.json` `section.note`:
`UNIVERSE_IDEAS_6.md` (round 6, adopted in full) → `UNIVERSE_STOCK_LAB.html`
→ `OWNER_FEEDBACK_LEDGER.md` → `PHASE10.md` §12. **Overriding all four for
scope purposes**, per the standing prompt's owner-adopted "§12a unattended
ordering" (`docs/phase10-workflow/prompts/claude-lead.md` §8.5, July 29
2026): this turn specifies **§12a only** — four ordered phases closing
eleven named ledger rows plus the carried `BLD-04` — not the full
`PHASE10.md` §12 Chart Room/sky/cursor/full-ramp scope. **No §12b work is
authorized by this spec.** Where this spec is silent, the higher sources
govern within that boundary.

---


## 0.1 Owner ledger board — post-sitting, 2026-07-30

Rule 2 requires every open/designed row to be accounted for here. §12a's
mechanical work is complete and at `owner-sitting`; the thirteen rows opened by
Devan's sitting feedback are **all scheduled §12b**, none deferred.

| Row | Disposition |
|---|---|
| FB-22 yellow haze above the sun | scheduled §12b |
| FB-23 PORTFOLIO % floating loose in the orbits | scheduled §12b |
| FB-24 moons do nothing when clicked | scheduled §12b |
| FB-25 planet panel needs more content | scheduled §12b |
| **FB-26 trails/direction must encode DAILY, not weekly** | **scheduled §12b, early** — core encoding change; TST-03 and VIS-04 key off the same field and move with it |
| FB-27 HOLDINGS shows only the 8 planet tickers | scheduled §12b |
| **FB-28 Mission Control content rework** | **scheduled §12b — BLOCKED ON FB-34** |
| FB-29 NEWS demoted from a main component | scheduled §12b, folded into FB-28 |
| FB-30 TRADES / "BOOK impact" unexplained | scheduled §12b |
| FB-31 orange tabs removed | scheduled §12b |
| FB-32 top-right information too small or unnecessary | scheduled §12b |
| FB-33 CORRELATION and EARNINGS do not earn their place | scheduled §12b, folded into FB-28 |
| **FB-34 Fable content audit** | **scheduled §12b, FIRST — blocks FB-28** |

Carried open from before the sitting and also §12b: FB-01 (one more nudge,
proportions confirmed), FB-02 background, FB-05 fonts (6th), FB-13 Chart Room
(3rd), FB-17 panel width live-vs-capture gap. FB-12 DRAFT rig is **parked by
owner**. FB-11 is superseded by FB-33.

**Ordering constraint.** FB-34 is an owner-requested Fable consult and it
blocks FB-28. Nothing in the Mission Control content rework is designed before
it returns. FB-26 and the small defect rows do not depend on it and can
proceed.


## 0. What this section is for

§11 made the universe readable in the panel and Mission Control's structure.
The owner's re-reports since then (`OWNER_FEEDBACK_LEDGER.md` §2, board
snapshot July 29 2026) say four things at once: two rendering defects nobody
told him about (`FB-19`, `FB-20`), one *root-caused* regression on a rule
that was supposed to be closed (`FB-05` — small fonts, 5th report), one
design that was adopted, scheduled, and never built (`FB-09` — the exit
terminal, "I have told you that and yet it is still in the application"),
and four items where the honest next step is to build and show him, not
guess (`FB-17` panel width, `FB-08`/`FB-15` tab strip, `FB-12` DRAFT rig,
`FB-21` Mission Control space usage, `FB-11` correlation sentence).

This section closes the mechanical half of every one of those and produces
the evidence for the owner to close the taste half himself, in one sitting,
at review time. **It ships zero new surfaces.** Every criterion below is a
defect fix, a role correction within an already-adopted system, or a
build-then-capture variant of an already-adopted design.

### Operating conditions

- **`single_provider_mode` remains active** (`PHASE10_STATE.json`,
  OpenAI quota outage, unresolved as of this turn). Both implementation and
  review seats run under this constraint; `docs/phase10-workflow/SINGLE_PROVIDER_MODE.md`'s
  compensating controls are mandatory: executable verifiers with retained raw
  output, no criterion graded from source reading alone, owner visual review
  before any full acceptance. Its `must_wait_for_codex` reserved list (privacy
  boundary, financial math core, any gate change) is not implicated by any
  criterion in this section — nothing here touches those three.
- **`main` is green at section start:** `npm test` 107/107 files, 553/553
  tests; `npm run build` exit 0, both independently re-run by the §11 accept
  turn at HEAD `9f561b5`. No inherited-red exception exists. Any red at
  review is new and is a blocker.
- **One carried criterion:** `BLD-04` (high risk), carried from §11 by
  explicit owner ruling (`9f561b52179023f70c89fabfab62ea880df0a146`,
  "no exception, no gate weakened"). Its measurement-at-carry, root cause,
  and live paths are in `PHASE10_STATE.json`
  `section.carried_from_section_11`. It keeps its original ID. **This
  window authorizes re-measurement only** — see §5.
- **The board-open rule binds starting with this spec**
  (`OWNER_FEEDBACK_LEDGER.md` §0, `board_required_from_section: 12` in
  `workflow.json`). §1 below is that board.

---

## 1. The ledger board — every open/designed/regressed row, disposed

Per `OWNER_FEEDBACK_LEDGER.md` rule 2: every `open`/`designed` row (and, by
the same logic, `regressed` — rule 3's blocking status — and any row whose
own status text describes unclosed work) is marked `scheduled here`,
`scheduled §n`, or `deferred — owner initials`. Rows already `CONFIRMED`,
`RETIRED`, or otherwise closed are omitted; they need no disposition.

| ID | Status at spec time | Disposition |
|---|---|---|
| `FB-01` | designed · numbers fixed by owner | **scheduled here** — §3 (Phase B) |
| `FB-02` | designed | **scheduled §12b** — background is explicitly out of this window |
| `FB-05` | **regressed · critical**, 5th report | **scheduled here** — §3 (Phase B); rule 3 requires this section root-cause and close the mechanical half before §12b may start |
| `FB-08` | designed | **scheduled here** — §4 (Phase C), captures only, no verdict |
| `FB-09` | designed — flagged, told twice and still shipped | **scheduled here** — §4 (Phase C), first item |
| `FB-11` | half-landed | **scheduled here** — §4 (Phase C) |
| `FB-12` | landed · 3 gaps | **scheduled here** — §4 (Phase C) |
| `FB-13` | designed | **scheduled §12b** — the Chart Room door work belongs with the Chart Room itself |
| `FB-15` | scheduled (§12a, already routed in the ledger) | **scheduled here** — §4 (Phase C), folded into the `FB-08` experiment |
| `FB-16` | scheduled (§13′, already routed) | not this section — confirmed unchanged |
| `FB-17` | variant strip respecified by owner | **scheduled here** — §4 (Phase C) |
| `FB-19` | open | **scheduled here** — §2 (Phase A) |
| `FB-20` | open | **scheduled here** — §2 (Phase A) |
| `FB-21` | designed · numbers fixed by owner | **scheduled here** — §4 (Phase C) |
| `D2` | open · general ("the website is still relatively confusing") | **scheduled here** — tracked via `FB-05`/`FB-08`/`FB-09`/`FB-11`, all addressed in this section; the row itself closes only when the subsuming rows do |

Rows intentionally **not** carried into this section, with reason:
`FB-04` (retired by owner decision), `FB-18` (`needs-owner`, scheduled
`§17′`), `D1` (`held`, needs a named contradicting ticker), `D3`
(`needs-owner`, scheduled `parked`), `LT-01` (`landed · needs-capture` —
related to but distinct from `BLD-04`; its own remediation already landed in
§11.R4 and it awaits a capture, not new work).

`FB-10` (news hyperlinks) is already **`CONFIRMED — Jul 29, 2026`**, closed,
his words: *"news articles open."* It is named here only because its status
cell's quoted text contains the literal substring "open" (inside *"news
articles open"*), which the mechanical board-completeness check matches
irrespective of the row's actual, already-closed status. No disposition is
needed; it is not scheduled here.

Count at this spec's open/designed/regressed line: **11 rows scheduled
here**, well under the five-row landing-section threshold — this section is
itself the landing section the threshold would otherwise force, so no
override is needed.

---

## 2. Phase A — machine-checkable, close on evidence

No design question in either item. Both are rendering defects found by
capture, not by the owner, and both close on a capture plus a geometry
assertion.

### 2.1 `FB-19` — the `? SYSTEMS MANUAL` button overlaps the inspector panel

**Source:** `src/components/observatory/orrery/SystemsManual.tsx` (button,
lines 77–86, `.manualButton`), colliding with
`src/components/observatory/orrery/OrreryWorld.tsx`'s `<aside
className={styles.inspector}>` (lines 467–478). Both are `position: absolute`,
`right`-anchored, at effectively the same `top` offset
(`orrery.module.css` `.manualButton` lines 529–539 `top: 6.5rem`; `.inspector`'s
approach-camera rule, currently line 2517, `top: 5.75rem`) — the two
`0.75rem`-apart tops do not clear the button's own height at every viewport,
and the panel's `.microHint` span (`SPIN = SCENERY · ORBIT = WEE…`,
`OrreryWorld.tsx` line 469) truncates.

**Fix (either is acceptable; the reviewer grades the outcome, not the
method):** reposition `.manualButton` so its bounding box never intersects
`.inspector`'s bounding box while the panel is open at any of `FB-17`'s three
candidate widths (600/660/720px, §4.1), **or** raise `.manualButton`'s
`z-index` and reflow `.inspector`'s top padding so the `.microHint` line has
its full, untruncated width. Do not shrink or truncate `.microHint`'s text to
fit — the header line must read whole.

**Acceptance:** `VIS-01`.

### 2.2 `FB-20` — orphaned labels at approach scale

**Source:** `src/components/observatory/orrery/OrreryScene.tsx` line 1926
hides a label only on a raw depth test (`projected.z > 1`); labels then pass
through `layoutOverviewLabels`
(`src/lib/observatory/scene-model.ts`, lines 890–949), which clamps screen
position to viewport-edge padding (lines 902–919) with **no check tying the
clamped label position back to its planet body's own visibility/occlusion
state**. A label can therefore survive at the frame edge with its body culled,
off-screen, or occluded — the owner saw this with `CBRS` and `COST`.

**Fix:** `layoutOverviewLabels` (or its caller) must cull a label whenever its
associated body is not itself visible in the same frame (occluded, culled, or
off the depth-tested range) — not only when the label's own raw depth test
fails. The existing viewport-edge clamp for labels whose bodies **are**
visible is unchanged.

**Acceptance:** `VIS-02`.

---

## 3. Phase B — the two root-caused items

### 3.1 `FB-05` — the ramp gate constrains values, not roles

**Root cause, already diagnosed** in
`docs/phase10-baseline/section-11/raw-mission-control-type-root-cause.md`:
Mission Control maps these reading surfaces to `--type-label` (11px) —
plot/manifest headers and question copy, radar labels/timestamp/pair-line/
detail-card/manifest, briefing copy, rail stations, instrument strip, section
tabs, plot labels, holdings headers — even though `type-ramp.test.ts`'s
existing gate (source-parsed, `src/components/observatory/orrery/type-ramp.test.ts`)
passes, because that gate only asserts every font-size is **one of the five
legal values**, never that a given **role** resolves to the **correct**
token. A header sized at a legal 11px is still a header sized too small.

**Fix — a role→token map, not a value nudge.** Extend
`src/lib/observatory/mission-control-layout.ts`
(`MISSION_CONTROL_LAYOUT`/`MISSION_CONTROL_CSS_PROPERTIES`, the existing
source of truth `type-ramp.test.ts` already asserts against) with an explicit
mapping from semantic role to ramp token, covering at minimum every selector
named in the root-cause doc:

| Role | Selectors (from the root-cause doc) | Token | Not |
|---|---|---|---|
| Section/instrument header | `.plotChassis > header`, `.manifestInstrument > header`, `.manifestHeader` | `--type-title` (15px) | `--type-label` |
| Question copy, prose | `.bayQuestion`, briefing copy | `--type-body` (13px) | `--type-label` |
| Holdings headers, radar detail card/manifest text | `.radarDetailCard`, `.radarManifest > li > button`, holdings headers | `--type-body` (13px) | `--type-label` |
| Genuine labels/stamps/window words | `.radarRingTarget > span`, `.radarTimestamp`, `.radarPairLine`, rail stations (`.railStations a`), instrument strip (`.instrumentStrip a`), plot readouts (`.plotReadouts span`) | `--type-label` (11px) — **unchanged, legitimately** | — |

Apply the corresponding CSS changes in `orrery.module.css` for every selector
in the "Not `--type-label`" rows.

**Test — rendered, not sourced.** A value-only gate is exactly the failure
this criterion exists to close, so the new test must not repeat it. Extend
the existing test harness pattern
(`src/components/observatory/orrery/type-ramp.test.ts` parses the real
stylesheet text; `MissionControl.interaction.test.tsx` and siblings already
render Mission Control components with Testing Library) so that, for each
role in the table above, the test either (a) renders the real component tree
and asserts the DOM element carrying that semantic role has the CSS class
whose *parsed* token matches the expected role — extending the existing
source-parse technique with a render-time assertion that the class is
actually applied where the role lives, or (b) computes style directly if the
harness can be given the real stylesheet (injecting `orrery.module.css`'s
text into a `<style>` element before render is an accepted, existing pattern
for CSS-module testing in `jsdom`). Either is acceptable; a test that only
re-parses CSS text without confirming it against a rendered role is not —
that is the value-gate failure mode again, wearing a new name.

**Acceptance:** `TST-01`, `VIS-03`.

### 3.2 `FB-01` — spacing and the camera pull-back

**Source:** `src/lib/observatory/orrery.ts` lines 4–5
(`ORRERY_MIN_RADIUS = 0.8`, `ORRERY_MAX_RADIUS = 1.7`) and lines 106–112
(`orbitRadiiForPlanetRadii`'s gap: `1.6 * (planetRadii[index - 1] +
radius)`); `src/lib/observatory/scene-model.ts` line 24
(`OVERVIEW_BELT_SPAN_PCT = 0.88`).

**Fix, exact numbers, owner-fixed** (`UNIVERSE_AUDIT.md` §5.1,
`OWNER_FEEDBACK_LEDGER.md` FB-01):

- `ORRERY_MIN_RADIUS`: `0.8` → **`0.62`**
- `ORRERY_MAX_RADIUS`: `1.7` → **`1.35`**
- Gap formula: `1.6 × (rᵢ + rᵢ₊₁)` → **`1.75 × (rᵢ + rᵢ₊₁) + 0.55`**
- `OVERVIEW_BELT_SPAN_PCT`: `0.88` → **`0.80`**
- Weight still maps by `√weight`; the sun's floor (`max(2.8, 1.6 ×
  largest)`) is unchanged and its dominance rises for free as the largest
  planet shrinks.

**Do not fake positions.** The centre-left clustering the owner saw is
transient orbital phase, not a layout defect — leave the phase/position
logic untouched; only the radius/gap/belt-span constants change.

**Test debt:** `src/lib/observatory/orrery.test.ts` references
`ORRERY_MIN_RADIUS`/`ORRERY_MAX_RADIUS`/`orbitRadiiForPlanetRadii` directly
and must be updated to the new constants rather than left asserting the old
ones — a passing suite against stale constants is not evidence.

**Acceptance — measured half only; the row itself closes on his sentence,**
not this criterion: at the 1440×900 overview capture, minimum edge-to-edge
distance between any two adjacent planet discs at closest approach ≥ 1.0× the
larger disc's diameter, computed from the existing projection helpers, and
the full system (sun through outermost belt ring) fits within the frame with
margin. `VIS-04`.

---

## 4. Phase C — the variant fabrications, build → capture → park

Per the FB amendments committed in `be39047`. None of the five items below
carries a "correct" answer as an acceptance criterion — where a genuine
choice exists (`FB-17`, `FB-08`/`FB-15`), the criterion grades only the
invariant beneath the choice. Where the design is already fully specified
(`FB-09`, `FB-12`, `FB-11`, `FB-21`), the criterion grades the build; the
owner's confirmation is still a separate, later step.

### 4.1 `FB-17` — panel-width variant strip

**Source:** `orrery.module.css`, the approach-camera desktop rule
(currently lines ~2510–2525) setting `--panel-width: 460px`. **Ladder
re-specified upward** (every prior correction has gone up, not down): build
and capture at **600px, 660px, 720px**. The panel stays right-anchored and
grows **left**, pairing with the closed `FB-07` left-third camera anchor —
changing this token must not move the planet or alter orbital positions.

**Invariant, must hold at all three widths (this is the gradable part):**
`unoccluded: true` per the existing measurement pattern in
`docs/phase10-baseline/section-11/raw-panel-geometry.json` — the planet
disc's right edge stays ≤ the panel's left edge. A width that hides the
planet is not a candidate and fails this criterion outright, at any of the
three.

**Acceptance:** `VIS-05`.

### 4.2 `FB-08` + `FB-15` — one experiment: tab strip variants and the box question

**Source:** `UNIVERSE_IDEAS_6.md` §4.2, verbatim. Current state: 8 tabs
(`src/components/observatory/orrery/MissionControl.tsx` lines 104–135,
`MISSION_CONTROL_PANELS` plus one hardcoded `EARNINGS` link), rendered at
`--type-label` (11px, already on-ramp since §11 — not the "9px" the owner's
original complaint described, which the ramp fix already corrected in size
if not in framing) inside bordered boxes on a translucent green-black strip
(`orrery.module.css` `.missionStrip` lines 2803–2816, `nav a` lines
2855–2860).

Build and capture all three, changing nothing about which is currently
live in production:

- **A — no tabs.** The strip keeps hero, chips, `◂ UNIVERSE`; navigation
  folds into the existing chips (`WEEK` → RETURNS, `OFF HIGH` → RISK, etc.).
- **B — the black rail.** Strip background solid bay-glass `#010806`, no
  border-line, tabs lose their boxes (plain 11px letter-spaced small caps,
  active cream + underline tick, inactive at the dim label tone). **This
  variant is also the `FB-15` answer** — B rendered boxless, contrasted
  against the current boxed default, is the "boxes present vs absent"
  comparison the owner asked for; no separate build is needed for `FB-15`.
- **C — the index edge.** Tabs move to a vertical index down the right edge
  of the descent (11px, scroll-spy), strip keeps only hero + chips; below
  1280px it hides and behaves like A.

**Acceptance (build correctness only — no ranking):** each variant renders
without console errors, preserves all seven section destinations reachable
by some control (chip, index entry, or tab, per variant), and is
keyboard-operable. `VIS-06`.

### 4.3 `FB-09` — the exit receipt and the regrouped terminal

**Source:** `UNIVERSE_IDEAS_6.md` §4.1, verbatim — a single fully-specified
design, not a variant. Current code:
`src/components/observatory/orrery/OrreryWorld.tsx` — the semantic fallback
`<nav className={styles.semanticMap}>` (line 347) is visually hidden except
on `:focus-within` (`orrery.module.css` line 2167, rules 2167–2179), and the
post-exit focus-restoration effect (lines 210–239, specifically 229–232) sets
focus to `[data-portfolio-sun]` (attribute applied line 351) — which lives
inside that same layer, so leaving Mission Control accidentally springs the
full ~20-row accessibility terminal open for every visitor, sighted or not.

**Fix, both halves required:**

1. **The exit gets a designed receipt.** The focus-restoration effect sets
   `data-focus-source="program"` (cleared on the first real keydown), which
   suppresses the terminal reveal and instead shows the four-line, ≤ 20-word
   sign-off card verbatim from `UNIVERSE_IDEAS_6.md` §4.1 (phosphor
   `#e8f1df` on void, 17.46:1, computed in that doc and not re-derived here).
   Fades after 4s; **reduced motion: persists until any interaction** rather
   than fading — this is a state, not an animation, and must survive the
   reduced-motion boundary the same way every other fallback element does.
2. **Keyboard users keep the full terminal, regrouped.** `BODIES ·
   INSTRUMENTS · BELT · ENCODING` as collapsed sections, the group containing
   the just-focused element open, **≤ 9 visible rows at any moment**. Every
   encoding present today must remain present for assistive tech — this is
   disclosure, not deletion; the existing fallback-completeness tests must
   keep passing unmodified in content, only in visible-row-count behavior.

**Acceptance:** `VIS-07` (receipt + regrouped terminal, captured), `ACC-01`
(grouped disclosure preserves full encoding completeness; receipt does not
steal or trap focus from keyboard navigation).

### 4.4 `FB-12` — the DRAFT rig's three lines

**Source:** `src/components/observatory/orrery/DraftRig.tsx`.

1. **Motion default.** Line 127, `setMotion(!media.matches)` — motion
   defaults **on** for any visitor without an OS reduced-motion preference,
   contradicting the component's own SSR-safe `useState(false)` initializer
   (a red herring; the mount effect immediately overrides it for the common
   case). **Fix:** motion defaults **off** for everyone, regardless of the
   `prefers-reduced-motion` media query result. The query still forces (and
   locks) motion off when it matches; it must never turn motion **on**.
   Stillness until the visitor flips `MOTION {OFF→ON}` themselves.
2. **Dish-lap speed.** Lines ~310–315, `speed = Math.max(9, 28 -
   Math.min(18, Math.abs(holding.weeklyReturn ?? 0) * 180))` — laps run
   9–28 seconds against scene orbits measured in minutes. **Fix:** move the
   band to **30–90 seconds**, preserving the existing inverse-magnitude
   ordering (bigger weekly moves still lap proportionally faster) and the
   existing floor/ceiling shape — i.e. the same formula family with its
   constants rescaled to the new band, not a new formula. (This is the
   binding number; see the design proof's "resolved ambiguity" note on why
   the audit's number, not the ledger's compressed phrase, is used.)
3. **Discoverability.** The `DRAFT · 🚀` latch currently renders only in
   `MissionControl.tsx`'s `<footer className={styles.missionFooter}>`
   (lines 170–179). **Fix:** the latch also appears in the strip nav
   (owner view only, matching its existing `mode === "private"` gate), and
   first open shows one visible coach line (not aria-live only — currently
   absent entirely, confirmed by direct search): `PULL A CIRCLE — THE
   OTHERS BREATHE. DRAG INTO ANOTHER TO SIPHON.`

**Acceptance:** `VIS-08` (all three, captured), `BHV-02` (motion state and
lap-speed band asserted programmatically, not only visually).

### 4.5 `FB-11` — the correlation named-pair sentence

**Source:** `src/components/observatory/orrery/MissionControlRoomContent.tsx`
lines 116–121 — the `CORRELATION` section's static, generic paragraph
("When holdings move together, this portfolio has fewer independent
paths..."). `mostCorrelatedPair(tickers, cells)` already exists
(`src/lib/observatory/structure-copy.ts` lines 17–37) and already returns
`{ a, b, correlation }`, and is already consumed the same way by
`src/components/observatory/StructureChapter.tsx`. `MissionControlRoomContent`
already receives `data.correlationTickers`/`data.correlationCells` as props.

**Fix — narrow scope, explicitly not the Chart Room's `MOVES WITH`
instrument** (that bar-chart visualization is `UNIVERSE_IDEAS_6.md` §1.5,
§12b). Call `mostCorrelatedPair` on the data already in scope and add one
templated sentence, ≤ 14 words, beneath the existing paragraph — do not
replace it — using the top `|r|` pair, phrasing selected by correlation-band
template (not free prose), matching `UNIVERSE_IDEAS_6.md`'s own example
shape (`"IBM AND MSFT MOVED TOGETHER ON MOST SHARED DAYS — ONE BET,
TWICE."`). Below `MIN_OVERLAP` shared days (the same threshold
`per-holding-risk.ts`/`structure-copy.ts` already enforce), render no
sentence — the existing generic paragraph stands alone; never fabricate a
pair from insufficient history.

**Acceptance:** `BHV-01` (word count, source pair, insufficient-history
fallback), `VIS-09` (rendered, captured).

### 4.6 `FB-21` — Mission Control's content width

**Source:** `orrery.module.css` line 2873, `.missionDescent { width:
min(1120px, calc(100% - 2rem)); ... }`. **Fix, owner-fixed number:** →
`width: min(1400px, 96vw);`, plus the "breathing room" the ledger names —
review the block's padding/margin at the new width and increase where the
wider column now reads cramped rather than filled (implementer's judgment;
capture both before and after for the owner to confirm the room "uses its
space" per the closes-when condition).

**Acceptance:** `VIS-10`.

---

## 5. `BLD-04` — carried, re-measured, not closed by assertion

Per `PHASE10_STATE.json` `section.carried_from_section_11`: this criterion
must appear in this section's ledger with its §11 measurement attached, and
this section must re-run
`docs/phase10-baseline/section-11/scripts/measure-long-tasks.mjs`
**unmodified** and record the result. **No structural fix is authorized this
window** — the standing prompt's four §12a phases do not assign remediation
work to `BLD-04`, and the section's own scope boundary (§0, "no §12b work")
excludes the architecture-level SSR/loading change
(`resolved_in_12_by` in the carry record) that would be needed to close it
outright.

**What this criterion requires:** run the unmodified script, against a fresh
production build, exactly as §11's own reviewer turns did (5 contexts, CPU
2×, 1440×900, `/share`), and record the result verbatim — pass, fail, or
partial — with the raw output retained. If it still fails, it is carried
again to §12b with the fresh measurement attached, by the same non-assertion
rule that carried it here. If it happens to pass (§12a's Phase A/B/C changes
are layout/type/perf-neutral or net-positive, per the design proof's state
matrix — none of them add hydration cost, and none is expected to), that is
recorded as a genuine close, not assumed in advance.

**Acceptance:** `BLD-04` (kept as its original ID for traceability, per §11's
own precedent for carried criteria).

---

## 6. Regression criteria

Two lightweight criteria exist purely to catch scope leakage from files this
section's changes share with surfaces it must not touch.

- **`MOB-01`** — the sub-1024px fallback is unaffected. None of §12a's
  eleven rows are fallback work; because several (`FB-05`, `FB-21`) edit
  `orrery.module.css`, a regression capture at 390×844 plus the existing
  fallback test suite must show no change in fallback layout, text, or
  horizontal overflow.
- **`PRV-01`** — no privacy or public-data surface is touched. None of this
  section's criteria add a new route, a new public field, or a dollar figure
  to `/share`; the existing `/share` canary tests must pass unchanged, and a
  diff review at candidate time must confirm no new public data path was
  introduced incidentally.

---

## 7. Sequence

Risk- and dependency-ordered, matching the standing prompt's phase letters:

1. **Phase A** (`FB-19`, `FB-20`) — isolated, no shared-file risk with
   anything else in this section, do first.
2. **Phase B** (`FB-05`, `FB-01`) — both touch shared files (`orrery.ts`,
   `scene-model.ts`, `orrery.module.css`, `mission-control-layout.ts`) that
   Phase C's captures depend on being stable; land before Phase C so the
   variant captures reflect the corrected spacing and type roles, not the
   pre-fix state.
3. **Phase C** (`FB-17`, `FB-08`+`FB-15`, `FB-09`, `FB-12`, `FB-11`,
   `FB-21`) — independent of each other; any order.
4. **`BLD-04` re-measurement** — last, against the fully-assembled candidate,
   so the recorded figure reflects everything else in this section.
5. **Phase D** (assemble `REVIEW_SITTING.md` and the contact sheet, route to
   `stage: owner-sitting`) is a **review-turn** action, not implementation —
   it happens after Codex's candidate is independently verified, using the
   proof-surface captures this spec names in the design proof. It is not
   specified further here.

---

## 8. Global gates, unchanged

`npm test` and `npm run build` both green, independently re-run at
candidate and at review (`TST-02`, `BLD-01`). `G-BOUNDARY`,
`G-SECRETS`, `G-PUBLIC`: no criterion in this section touches privacy,
authentication, secrets, or financial correctness — `PRV-01` exists to prove
that claim rather than merely assert it.

---

## 9. What is explicitly not this section

The Chart Room, the sky, the cursor flight model, and the remainder of the
type-ramp migration beyond Mission Control's role remapping — all
`UNIVERSE_IDEAS_6.md` §1–§3 and the balance of §5 — are **§12b**, scheduled
but not specified here. `FB-02` (background) and `FB-13` (Chart Room doors)
stay on the board as `scheduled §12b`. Nothing in this spec authorizes touching
`src/components/observatory/orrery/OrreryScene.tsx`'s rendering pipeline
beyond `FB-20`'s label-culling fix, nor the sky/starfield layers at all.
