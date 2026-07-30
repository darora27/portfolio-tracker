# Phase 10 §13 design proof: universe fixes from the July 30 owner sitting

Status: `existing-package-equivalent`, with named Lead scope-reconciliations
where the cited packages give direction but not an exact number.

Prepared July 30, 2026 by `claude-code/sonnet-5` (Claude Lead, `stage: specify`).

`DESIGN_GATE.md` allows a section to cite an existing owner-approved design
package when it already contains every required item, and requires the
mapping recorded explicitly. This section's authority, in the order
`PHASE10_STATE.json` `section.note` and `PHASE10.md` §13 give it:
`OWNER_FEEDBACK_LEDGER.md` (per-row owner quotes and dispositions) →
`PHASE10.md` §13 (the roadmap's own scope statement, including the FB-32
boundary) → `UNIVERSE_IDEAS_6.md` §2 (FB-02's five moves, adopted whole in
§12's "round 6 adopted in full") → `UNIVERSE_AUDIT.md` §5.1 (FB-01's prior
derivation method, reused for this round's further nudge). **No §14 work
(FB-27–30, FB-33, FB-35, FB-32's full STRIP rebuild) is authorized or
specified by this document.**

## Intent

- **User question, this section:** the same one the board asks: *"You said
  the universe is coming together — does it still hold up under six more
  things I found? And the one big thing I asked for — trails that show
  today, not last week — does it actually show up?"*
- **First-five-second comprehension:** unchanged. Nothing here adds a new
  surface. FB-26 changes what an existing surface *means* (trail color/arc/
  direction now read TODAY, not WEEK) — the visual grammar itself (ramp,
  arc, clockwise/counterclockwise) is unchanged, only its input.
- **Primary conclusion for the owner:** a contact sheet at review time
  (assembled in the review turn, not this specify turn) letting him confirm
  FB-01's spread/zoom, FB-05's floor, FB-17's live panel, FB-02's sky, and
  see FB-22/23/24/25/31 fixed and FB-26 reading daily, in one sitting.

## Annotated references

| reference | exact quality borrowed | quality deliberately not borrowed |
|---|---|---|
| `OWNER_FEEDBACK_LEDGER.md` §2, rows FB-01, FB-02, FB-05, FB-17, FB-22, FB-23, FB-24, FB-25, FB-26, FB-31 | Each row's exact owner quote and closes-when condition | FB-32 (disposition "next section" in the ledger itself, confirmed by `PHASE10.md` §13's own text: "the top-right block, which dies into the strip in §14") — named on the board below, not actioned here. FB-12 (parked). FB-13/FB-16/FB-18/D1/D3 (scheduled elsewhere, unchanged) |
| `PHASE10.md` §13 | "The largest item, and it moves first: FB-26" — the section's own sequencing instruction | Nothing rejected — this is the roadmap's own framing of this exact section |
| `UNIVERSE_IDEAS_6.md` §2.2 "The five moves" | FB-02's five ordered moves verbatim: retire the CSS tile wallpaper, floor the aurora at `0.14 + wildness × 0.26`, texture the nebula (512×256 KTX2, gold 41°/ember 12°), the black-corner-vignette + static grain TVA register, one faint ecliptic graticule | The brief's rejected sixth idea (any animated sky element) — explicitly refused in the source doc and not reconsidered here |
| `UNIVERSE_AUDIT.md` §5.1 "Spacing — the full answer" | The *method* — radii/gap/belt-span move together in the same direction, checked against a measured minimum-gap floor and a full-system-fits-in-frame requirement | The specific numbers, which were for the *previous* nudge (0.8→0.62, 1.6→1.75, 0.88→0.80) and are now the *starting point* for this round's smaller further nudge, not the target |
| `docs/phase10-baseline/section-11/raw-panel-geometry.json` and the §12a panel-width evidence | The `unoccluded: true` invariant, unchanged, as the floor beneath FB-17's new default | The 460px pre-§12a default — retired by FB-17 below |

## Resolved ambiguities — three Lead scope-reconciliations

Recorded here per the same authority `AGENTS.md` and the ledger name for
this role: computing an exact number from qualitative owner direction when
no cited source gives one, and no re-derivation of an already-blessed ratio
is being attempted.

### FB-01 — "widen the gap term slightly," "a little below 0.80"

His words are explicitly qualitative and explicitly **not** a request to
re-derive `UNIVERSE_AUDIT.md` §5.1's proportions (he confirmed those). The
two adjustable terms move a further, smaller step in the same direction as
the last round, roughly half that round's own percentage change (which was
gap +9.4%, belt-span −9.1%):

- Gap coefficient: `1.75` → **`1.82`** (+4.0%), additive term `+0.55`
  unchanged (that term is fixed clearance, not spread).
- `OVERVIEW_BELT_SPAN_PCT`: `0.80` → **`0.75`** (−6.25%).

Both move the system further apart and pull the camera back further, in
exactly the direction his words name, at roughly half the previous round's
step size — consistent with "just a little bit more," not a re-derivation.
The existing measured floor (minimum edge-to-edge gap ≥ 1.0× the larger
disc's diameter, full system fits the frame) is unchanged and re-asserted
against the new constants, not merely assumed to still hold.

### FB-05 — "a bit bigger" (6th report, language softened from "way too small")

`UNIVERSE_IDEAS_6.md` §5.2 names `--type-label` (11px) as "the floor" and
gives no number beyond it. The ledger's own language distinguishes this
report from the five before it: "the role mapping is right, the values at
the bottom are still short" — this is about the token's *value*, not its
*application* (§12a's `MISSION_CONTROL_TEXT_ROLES` work, unchanged and
correct). Scope: **only** `--type-label`, 11px → **12px** (+19% area, by
the same area-growth accounting `UNIVERSE_IDEAS_6.md` §5.2 uses for its own
comparisons). `--type-body` (13px) and the other three tokens are
unchanged — the disposition names "the small end," singular, and widening
the gap between label and body risks losing the tier distinction §12a's
role-mapping fix just established. Contrast is unaffected in the
unfavorable direction (a larger glyph at the same `#d5ba8c`-class color
only improves the already-AAA 10.81:1 ratio; WCAG's large-text threshold is
also more permissive, not less, at larger sizes).

### FB-26 — daily encoding, magnitude-clamp constants left unchanged

The owner's request is a **field swap** — trails and orbital direction
should read the daily return, not the weekly one — not a request to
recalibrate how a given magnitude maps to visual intensity. The existing
clamp constants (`0.2%` floor, `12%` ceiling, shared verbatim across the
angular-speed, color-ramp, and arc-length formulas today) stay numerically
unchanged; only the input field they receive changes from `weeklyReturn` to
`dayReturn`. Reasoning against recalibrating this same turn: (1) the ledger
frames this row purely as "represent daily stock trend," not "daily moves
look too flat" — recalibrating a value nobody asked to change, in the same
turn as a request nobody asked to combine it with, repeats exactly the
failure mode `UNIVERSE_IDEAS_6.md`'s own retrospective calls out (bundling
an unrequested tuning pass into a requested structural change makes it
impossible to tell which change caused which visual result); (2) a rough
check against this repo's own seed closing-price history
(`data/closing_prices.csv`, 13 tickers, ~20 trading rows) shows daily
absolute-return median ≈2.4%, p90 ≈7.8%, comfortably inside the existing
0.2–12% band without saturating early, though this sample is short seed
data, not the live production history, and is not treated as a load-bearing
statistic — it is corroborating evidence that the unchanged clamp is not
obviously wrong, not proof that it is right. If the shipped result reads
too flat or too saturated once he sees it live, that is exactly the kind of
capture-and-confirm judgment `VIS-04` already carries a two-part structure
for (measured floor + his sentence), and a follow-up clamp nudge would be
cheap — the same "one more nudge" pattern FB-01 is already in.

**Functions are renamed to be return-window-agnostic**, since the same
magnitude→visual mapping is genuinely reused by the (now daily) main scene
and by the DraftRig lap-speed feature, which stays on `weeklyReturn`
(FB-12 is parked — its inputs are explicitly out of this section's scope):
`directionForWeeklyReturn`→`directionForReturn`,
`angularSpeedForWeeklyReturn`→`angularSpeedForReturn`,
`normalizedWeeklyMagnitude`→`normalizedReturnMagnitude`,
`rampForWeekly`→`rampForReturn`,
`trailArcLengthForWeeklyReturn`→`trailArcLengthForReturn`. Every call site
that should now read daily passes `holding.dayReturn`; `DraftRig.tsx`'s one
call site keeps passing `holding.weeklyReturn`, mechanically renamed only.

## Negative list

- **Recalibrating FB-26's magnitude clamps this turn.** See above — a
  field swap, not a tuning pass; conflating the two makes neither
  independently verifiable.
- **Re-deriving FB-01's proportions.** He confirmed them. Only the two
  named terms move, by the computed small step above.
- **Widening the whole type ramp for FB-05.** Only `--type-label` moves;
  `--type-body` and the three larger tokens are untouched.
- **Building FB-32's STRIP.** Named on the board, explicitly `PHASE10.md`
  §14 work. Nothing in `orrery.module.css`'s `.missionStrip`/`.missionHero`/
  `.missionReadoutChips` rules changes in this section beyond FB-31's
  narrow tab-treatment fix below.
- **Removing the moons instead of wiring them**, without recording why.
  FB-24 explicitly delegates the choice; §5's freeze boundary below records
  the reasoning for keeping and fixing them rather than deleting a
  designed, partially-working feature.
- **A DOM-presence or build-exit claim standing in for a `VIS-*` criterion.**
  Unchanged standing rule.
- **Touching the DRAFT rig.** FB-12 stays parked; `DraftRig.tsx` receives
  only the one mechanical rename referenced above, no behavioral change.

## Design grammar

- **Palette authority:** unchanged — `UNIVERSE_IDEAS_3.md` rev 2, the
  Fraunhofer rule, both firewall tiers. FB-02's nebula/vignette/graticule
  hues (gold 41.4°/0.557, ember 12.4°/0.133, umber 15.0°/0.078, slate
  156.0°/0.059) are pre-computed clear of the stolen bands in
  `UNIVERSE_IDEAS_6.md` §6/§7 and used verbatim, not re-derived.
- **Typography roles:** the five-token ramp's *role mapping* (§12a) is
  unchanged; only `--type-label`'s value moves, 11px → 12px, per the
  resolved ambiguity above.
- **Spacing rhythm:** FB-01's radii/gap/belt-span move within their
  existing formula shape, a further small step past §12a's numbers. FB-17's
  panel width changes its CSS *default* (`--panel-width: 460px` → `600px`)
  rather than introducing a new mechanism — the capture-only
  `?panelWidth=` override stays for 660/720px evidence, unchanged in kind.
- **Component materials:** FB-31's tab-strip fix reuses variant B's
  already-built, already-owner-confirmed boxless/cream-underline materials
  (`orrery.module.css` `[data-strip-variant="b"]` rules, `be39047`) as the
  new *default* rather than inventing new materials — this closes the
  literal defect (the orange background he is still seeing in production
  is `#7d3d1d`, the un-migrated default rule, not variant B, which he
  already confirmed and which was never shipped as the default).
- **Interaction language:** FB-23's sun chip switches from frame-relative
  (`top: 50%; left: 50%`) to the same per-frame world-projection technique
  planet labels already use (`layoutOverviewLabels`/`projectOverviewPoint`,
  `scene-model.ts`) — reusing an existing pattern, not inventing one.
  FB-24's moon fix reuses the existing click→navigate→scroll pattern,
  correcting its one data-mismatch bug rather than adding a new
  interaction. FB-25 adds two already-computed, already-typed fields
  (`contributionPct`, `portfolioRelativeReturn`) to the existing stats row
  — no new component, no new data plumbing, no privacy surface (both
  fields are percentages, already public-safe per the existing `/share`
  canary).
- **Motion boundary:** FB-02's sky changes are explicitly static/ambient
  per its own source doc (no new animated element); nothing else in this
  section introduces or removes motion.
- **Responsive mode:** desktop-first, unchanged. None of this section's
  ten rows touch the sub-1024px fallback's own layout or content; a
  regression criterion (`MOB-01`) catches accidental leakage from the
  shared stylesheet, same as §12a.

## State matrix

| state | relevant? | intended composition or behavior | proof |
|---|---|---|---|
| real data | yes | trails/direction read `dayReturn`; sun chip tracks the sun's real projected position; moons open real linkable news; planet panel shows real contribution/vs-VOO figures | `VIS-04`, `TST-03`, `VIS-06`, `VIS-07`, `VIS-09` |
| negative values | yes | daily loss trails/direction are sign-agnostic templates, same ramp/direction logic as gains, only the input field changed | `TST-03` |
| empty / insufficient history | yes | a holding with `dayReturn: null` renders the existing neutral/flat trail state (unchanged null-handling in the renamed functions) | inherited from existing null-handling, regression-checked in `TST-03`'s fixture |
| stale | not relevant | no freshness surface touched | — |
| loading | not relevant | no new data-fetch path | — |
| error | yes (FB-24) | a moon whose holding has zero linkable news does not render as a moon at all (existence now keys off the same filter its click destination uses) — no more dead-end clicks | `BHV-01` |
| private/public | yes | FB-25's two new panel fields are already-public percentages; `PRV-01` regression-checked, no new dollar figure or route | `PRV-01` |
| reduced motion | yes | FB-02's vignette/grain/graticule are static CSS, survive reduced-motion and no-WebGL unchanged; nothing else in this section animates | inherited, not newly tested this section |
| fallback renderer | yes | sub-1024px fallback unaffected by any of this section's `orrery.module.css`/component edits | `MOB-01` |

## Proof surfaces

Desktop-first, unchanged decision. All at 1440×900 unless noted.

| viewport / state | artifact | what it proves | criterion |
|---|---|---|---|
| 1440×900, overview, approach | `docs/phase10-baseline/section-13/trail-daily-1440x900.png` + `raw-trail-sampler-TST-03.json` | FB-26 trails/direction read daily | `TST-03`, `VIS-04` |
| 1440×900, overview | `docs/phase10-baseline/section-13/overview-1440x900.png` + `raw-fb01-spacing-measurement.json` | FB-01 further spread/zoom | `VIS-01` |
| 1440×900, Mission Control open | `docs/phase10-baseline/section-13/mission-control-1440x900.png` | FB-05 label-tier size | `TST-01`, `VIS-02` |
| 1440×900, production server (no query params) | `docs/phase10-baseline/section-13/panel-width-live-default.png` + `raw-fb17-live-vs-capture.json` | FB-17 live default now 600px, capture/live gap explained | `VIS-03` |
| 1440×900, sky | `docs/phase10-baseline/section-13/sky-before-1440x900.png`, `sky-after-1440x900.png` | FB-02 five moves, before/after | `VIS-05` |
| 1440×900, overview, sun region | `docs/phase10-baseline/section-13/sun-region-1440x900.png` + `raw-fb22-fb23-sun-region.json` | FB-22 haze gone, FB-23 chip anchored to the sun across camera states | `VIS-06`, `VIS-07` |
| 1440×900, moon interaction | `docs/phase10-baseline/section-13/moon-click-1440x900.png` + `raw-fb24-moon-news.json` | FB-24 moons open real news or do not render | `BHV-01`, `VIS-08` |
| 1440×900, planet panel | `docs/phase10-baseline/section-13/planet-panel-1440x900.png` | FB-25 contribution/vs-VOO fields present | `VIS-09` |
| 1440×900, Mission Control tab strip | `docs/phase10-baseline/section-13/tab-strip-default-1440x900.png` | FB-31 orange gone, boxless default | `VIS-10` |

The ≤ 12-frame contact sheet with captions is assembled at review time, not
this specify turn, per the same Phase D pattern §12a established.

## Owner decision

- **Selected direction:** `PHASE10.md` §13's own scope statement (owner
  roadmap text, July 30 2026) naming exactly these ten rows, FB-26 first.
- **Individually owner-fixed or owner-confirmed inputs:** FB-02 (the five
  moves, `UNIVERSE_IDEAS_6.md` §2.2, adopted whole), FB-08/FB-15's variant B
  (already `CONFIRMED — Jul 30, 2026`, "B is fine" — reused here, not
  re-litigated, to close FB-31), FB-17's 600px pick (`OWNER_FEEDBACK_LEDGER.md`
  FB-17, "Jul 30... 600").
- **Lead scope-reconciliations, this turn:** FB-01's further nudge numbers,
  FB-05's `--type-label` value, FB-26's decision to leave magnitude clamps
  unchanged — each derived and reasoned above, in the same role `AGENTS.md`
  assigns Claude Lead for exactly this kind of gap between qualitative
  owner direction and an exact implementable number.
- **Rejected alternatives:** removing the moons entirely (FB-24) — rejected
  because they are a partially-correct, already-designed feature with one
  locatable bug, and deleting a working idea is a worse outcome than fixing
  it, per the product thesis's own "more information is not more useful,
  but working information should not be deleted to avoid a bug" reading.
  A full type-ramp value re-audit (raising every token) — rejected, FB-05
  names only the floor.

## Freeze boundary

- **Defect remediation (in scope, no new owner decision needed):** FB-22
  (rendering artifact), FB-23 (positioning bug, existing projection pattern
  reused), FB-24 (data-mismatch bug between moon existence and moon click
  destination), FB-31 (shipping an already-confirmed variant as the
  default), FB-26 (field swap using existing formulas), FB-02 (a fully
  specified, already-adopted five-move package).
- **Numeric nudges within an already-blessed direction, computed this
  turn:** FB-01, FB-05 — see the resolved-ambiguity notes; both stay
  gradable by a measured floor plus the owner's own eventual sentence.
- **Addition of already-computed fields to an existing surface:** FB-25 —
  not a new creative direction, two more rows in an existing stats block.
- **New creative direction requiring a new owner-scoped section:** none in
  this section. FB-32's STRIP is explicitly `PHASE10.md` §14, not reachable
  from this freeze boundary at all.

## Acceptance-ledger mapping

| proof item | criterion ID(s) |
|---|---|
| FB-26 — trails/direction read daily, verifiers moved with the field | `TST-03`, `VIS-04` |
| FB-01 — further spacing/zoom nudge, measured | `VIS-01` |
| FB-05 — `--type-label` 11→12px | `TST-01`, `VIS-02` |
| FB-17 — 600px default, live-vs-capture gap explained | `VIS-03` |
| FB-02 — the sky's five moves | `VIS-05` |
| FB-22 — yellow haze above the sun gone | `VIS-06` |
| FB-23 — PORTFOLIO chip anchored to the sun | `VIS-07` |
| FB-24 — moons open real news or do not render | `BHV-01`, `VIS-08` |
| FB-25 — planet panel gains CONTRIB and VS VOO | `VIS-09` |
| FB-31 — orange tab background gone | `VIS-10` |
| Regression: mobile fallback unaffected | `MOB-01` |
| Regression: no privacy/public-data surface touched | `PRV-01` |
| Tests and build green | `TST-02`, `BLD-01` |
