# Phase 10 §12 (§12a) design proof: closing the board, not opening a new one

Status: `existing-package-equivalent` (owner-approved package, mapped item by
item below)

Prepared July 30, 2026 by `claude-code/sonnet-5`.

`DESIGN_GATE.md` allows a section to cite an existing owner-approved design
package **only when it already contains every required item**, and requires
the mapping to be recorded explicitly rather than assumed. This document is
that mapping, scoped to **§12a only** — the owner-adopted "§12a unattended
ordering" (`docs/phase10-workflow/prompts/claude-lead.md` §8.5, July 29 2026),
not the full `PHASE10.md` §12 Chart Room/sky/cursor/full-ramp scope, which is
explicitly deferred to §12b. **No §12b work is authorized or specified by this
document.**

The package, in the order §12a itself dictates:
`OWNER_FEEDBACK_LEDGER.md` §2 (the board — the eleven rows this section
closes on evidence or advances to owner judgment: FB-01, FB-05, FB-08, FB-09,
FB-11, FB-12, FB-15, FB-17, FB-19, FB-20, FB-21) → `UNIVERSE_AUDIT.md` §5.1
(spacing, full numeric answer) and §5.4 (the DRAFT rig's three gaps) →
`UNIVERSE_IDEAS_6.md` §4.1 (the exit terminal) and §4.2 (the tab-strip
variants) → `docs/phase10-baseline/section-11/raw-mission-control-type-root-cause.md`
(FB-05's already-diagnosed root cause) → the standing prompt's "§12a
unattended ordering" itself, which is the owner's explicit scope-and-sequence
decision for this window.

## Intent

- **User question, this section:** not one new question — the closing of
  eleven already-answered ones. Concretely: *"Can I read Mission Control
  without squinting? Is the system spaced out the way I asked? Do the two
  render bugs I didn't even have to report (`? SYSTEMS MANUAL` overlap,
  orphaned labels) still happen? And for the four items you're still guessing
  at (tab strip, panel width, DRAFT rig feel, Mission Control's use of
  space) — show me, don't tell me."*
- **First-five-second comprehension:** none of this section's changes
  introduce a new surface to comprehend. Every criterion is a defect fix,
  a role-correction, or a build-then-show variant. The five-course
  principle and meaning-before-metrics rules bind on any text this section
  touches (the correlation sentence, the receipt card) exactly as they did
  in §11 — nothing here relaxes them.
- **Primary conclusion for the owner:** a contact sheet at review time
  (assembled in the review turn's Phase D, not this specify turn) that lets
  him close FB-19/FB-20 by capture and answer FB-01/FB-05/FB-09/FB-11/FB-12/
  FB-17/FB-08/FB-15/FB-21 by looking, in one sitting.

## Annotated references

| reference | exact quality borrowed | quality deliberately not borrowed |
|---|---|---|
| `OWNER_FEEDBACK_LEDGER.md` §2 board rows FB-01, FB-05, FB-08, FB-09, FB-11, FB-12, FB-15, FB-17, FB-19, FB-20, FB-21 | The owner-fixed numbers where they exist (FB-01's radii/gap/belt-span, FB-21's `min(1400px, 96vw)`), and each row's exact closes-when condition | Rows not in this list (FB-02 background, FB-13 Chart Room, FB-16 XLK, FB-18 trade form) — explicitly §12b/§13′/§17′, not this section |
| `UNIVERSE_AUDIT.md` §5.1 "Spacing — the full answer" | Radii `[0.62, 1.35]`, gap `1.75 × (rᵢ + rᵢ₊₁) + 0.55`, the two-part acceptance (measured gap ≥ 1.0× larger disc, **and** his sentence) | Nothing rejected — this is the fuller derivation behind the ledger's terse FB-01 numbers, and the two agree |
| `UNIVERSE_AUDIT.md` §5.4 "The DRAFT rig — three gaps, three lines" | The three named gaps (motion default, dish-lap speed vs scene-minute pacing, latch discoverability + coach line) and the closes-when (*"he opens, understands, fiddles, confirms"*) | The audit's own casual phrase for the speed fix ("slow the band to 30–90s") is treated as the binding number over the ledger row's more compressed "dish ×1.6 → ×1.0" — see the resolved-ambiguity note below |
| `UNIVERSE_IDEAS_6.md` §4.1 "The green terminal: diagnosis, then the happy medium" | The `data-focus-source="program"` split, the four-line ≤20-word sign-off receipt, and the grouped-disclosure terminal (`BODIES · INSTRUMENTS · BELT · ENCODING`, ≤9 visible rows) | Nothing — this is a single fully-specified design, not a variant choice, despite living in the standing prompt's "Phase C" bucket (it is captured and parked for his *confirmation*, not his *pick*) |
| `UNIVERSE_IDEAS_6.md` §4.2 "The tab strip: three variants to judge, no verdict" | Variants A (no tabs), B (black rail, boxless), C (index edge) verbatim, and the owner's own framing that this is *"options, not a verdict"* | Any recommendation on which variant is right — the doc explicitly refuses to rank them, and so does this spec |
| `docs/phase10-baseline/section-11/raw-mission-control-type-root-cause.md` | The exact list of Mission Control selectors already diagnosed as legally-sized-but-wrong-role (`.plotChassis > header`, `.bayQuestion`, `.manifestHeader`, etc.) | Nothing — this is §11's own reviewer measurement, reused rather than re-derived |
| `docs/phase10-baseline/section-11/raw-panel-geometry.json` | The `unoccluded: true` invariant pattern (disc right edge ≤ panel left edge) as the mechanically-checkable floor beneath any panel-width variant | The specific widths it measured (460/520/580) — FB-17 raises the floor to 600/660/720 per the owner's re-report |

`UNIVERSE_IDEAS_6.md` §1 (the Chart Room), §2 (the sky), and §3 (the cursor)
are deliberately **not** references for this section — they are §12b, and
citing them here would be exactly the scope creep the standing prompt warns
against ("do not default to specifying the full PHASE10.md §12 scope").

### Resolved ambiguity — the DRAFT rig's dish-speed number

`OWNER_FEEDBACK_LEDGER.md` FB-12 reads *"dish ×1.6 → ×1.0"*; `UNIVERSE_AUDIT.md`
§5.4 reads *"dish laps run 9–28 seconds... slow the band to 30–90s, still
magnitude-ordered."* No `1.6` constant exists anywhere in `DraftRig.tsx` or
its stylesheet (checked directly against source, not assumed), so the ledger's
compressed phrase cannot be mapped onto a concrete current value. The audit's
number is fully traceable to the live `--draft-speed` formula and is adopted
as the binding target: **the existing `max(9, 28 − min(18, |weeklyReturn| ×
180))` formula's output band moves from 9–28s to 30–90s**, preserving the
existing inverse-magnitude ordering (bigger weekly moves still lap faster,
proportionally) and preserving the existing floor/ceiling shape. This is a
Claude Lead scope-reconciliation, exactly the kind `AGENTS.md` and the ledger
name as this role's job when two owner-adopted sources disagree on a number
neither can be independently re-derived from code.

## Negative list

Named patterns that would make this section's result generic, confusing,
inaccessible, or a repeat of a prior failure mode:

- **Closing a ledger row by assertion.** `landed` is not done; a criteria-ledger
  `pass` is not done. Every FB-row this section touches stays open on the
  board until the owner's sentence or a committed capture closes it — this
  spec's acceptance criteria grade the mechanical, gradable half of each row
  and explicitly do not claim the row itself closed.
- **Treating a taste question as a machine-gradable criterion.** FB-17's width
  and FB-08/FB-15's tab-strip variant have no objectively correct answer; no
  acceptance criterion in this spec grades "which variant is right." The
  invariant beneath each variant (unoccluded panel, valid markup, no console
  errors) is gradable and is graded; the pick is not.
- **`expect(source).toContain(...)` as coverage for rendered behavior.**
  Standing rule, restated because FB-05 is exactly the failure mode this
  rule exists to prevent: a source-level value gate (already shipped, see
  `type-ramp.test.ts`) that stays legally green while the *role* mapping is
  wrong. FB-05's new gate must assert against rendered/computed output, not
  only parsed CSS text.
- **Re-lengthening the trails, re-touching the SVGs, or reopening the texture
  pipeline.** FB-03 and FB-04 are closed/retired by explicit owner decision;
  nothing in this section revisits either, even incidentally through a shared
  file edit.
- **Any new motion, new hue, or new font family.** §12a is defect remediation
  within the adopted palette/type/motion system, not a new creative round.
  The DRAFT rig's motion-default fix reduces default motion; it introduces
  none.
- **A DOM-presence or build-exit claim standing in for a `VIS-*` criterion.**
  Every visual criterion below requires a capture or a sampled measurement.
- **Bundling §12b into this turn's implementation** because the code is
  adjacent (Mission Control's CSS file is shared by the Chart Room's future
  work too). The spec's criteria are scoped to the eleven named rows plus the
  carried `BLD-04`; nothing else in `orrery.module.css` is in scope.

## Design grammar

- **Palette authority:** unchanged from §10/§11 — `UNIVERSE_IDEAS_3.md` rev 2,
  the Fraunhofer rule, both firewall tiers. §12a introduces **no new hues**.
- **Typography roles:** the five-token ramp (`--type-hero` 56 / `--type-readout`
  24 / `--type-title` 15 / `--type-body` 13 / `--type-label` 11) is unchanged
  in its *values* (shipped and gated in §11's `type-ramp.test.ts`). FB-05's
  work is exclusively **reassigning which token a given selector's role
  references** — headers, questions, and manifest text move off `--type-label`
  onto `--type-title`/`--type-body`; genuine labels, stamps, and window words
  stay on `--type-label`, legitimately. No sixth token, no new size.
  Mission Control's content-width change (FB-21) and the panel-width variants
  (FB-17) are spacing/geometry changes, not typography.
  `MISSION_CONTROL_LAYOUT`/`MISSION_CONTROL_CSS_PROPERTIES`
  (`src/lib/observatory/mission-control-layout.ts`) is the existing source of
  truth for the ramp-to-role mapping and is the file FB-05 extends, not
  replaces.
- **Spacing rhythm:** the belt/orbit constants move within their existing
  formulas' shape (radii shrink, gap constant grows, belt span constant
  shrinks) — no new spacing primitive. Mission Control's content column widens
  within its existing `min(...)` clamp pattern. The panel-width ladder stays a
  single `--panel-width` custom property already wired for exactly this kind
  of change (see `raw-panel-geometry.json`'s precedent).
- **Component materials:** unchanged. The DRAFT rig keeps its case/dish
  materials; only its motion default, lap-speed band, and latch placement
  change. The tab-strip variants reuse existing bay-glass/cream/amber
  materials per `UNIVERSE_IDEAS_6.md` §4.2 — no new material is introduced by
  any of the three.
- **Interaction language:** the exit receipt is a new but fully-specified
  four-line, non-interactive, auto-fading (reduced-motion: persistent) card;
  it adds no new gesture. The regrouped terminal adds disclosure (focused
  group open, ≤ 9 visible rows), not new interaction primitives — it is the
  same semantic list, reorganized.
- **Motion boundary:** the DRAFT rig's motion toggle now **defaults off**
  for every visitor (not only `prefers-reduced-motion`) — a reduction in
  default motion, not an addition. Nothing else in this section animates.
- **Responsive mode:** desktop-first, unchanged. None of §12a's eleven rows
  touch the sub-1024px fallback's own layout; the fallback's *text* may
  change only where it already inherits Mission Control nouns/labels (already
  covered by §11's regression tests) — this section adds a regression
  criterion (`MOB-01`) rather than new fallback work, precisely to catch any
  accidental leak from the shared stylesheet.

## State matrix

| state | relevant? | intended composition or behavior | proof |
|---|---|---|---|
| real data | yes | Mission Control text reads at title/body roles, not label; spacing/zoom changes visible at 1440×900 overview; correlation sentence names the real top pair from real data | `VIS-03`, `VIS-04`, `VIS-08` |
| negative values | yes | The correlation sentence and DRAFT rig readouts are sign-agnostic templates; no new signal-colour encoding is introduced | inherited from §10/§11, unchanged this section |
| empty / insufficient history | yes | `mostCorrelatedPair` on fewer than `MIN_OVERLAP` shared days must not fabricate a sentence — falls back to the existing generic paragraph | `BHV-01` |
| stale | not relevant | no price/quote-freshness surface touched | — |
| loading | yes | `BLD-04`'s carried long-task re-measurement is exactly about pre-mount hydration cost | `BLD-04` |
| error | not relevant | no new data-fetch path | — |
| private/public | yes | none of §12a's eleven rows touch dollar figures, gating, or new public data; regression-checked rather than newly designed | `PRV-01` |
| reduced motion | yes | DRAFT rig motion-off-by-default must still compose correctly with `prefers-reduced-motion` (already-off stays off); receipt persists rather than fades | `ACC-01` |
| fallback renderer | yes | sub-1024px fallback unchanged by any §12a edit to the shared stylesheet | `MOB-01` |

## Proof surfaces

Desktop-first, unchanged decision. All at 1440×900 unless noted.

| viewport / state | artifact (to be produced at implementation/review) | what it proves |
|---|---|---|
| 1440×900, overview camera | `docs/phase10-baseline/section-12/overview-1440x900.png` | FB-01 spacing/zoom, minimum-gap measurement |
| 1440×900, Mission Control open | `docs/phase10-baseline/section-12/mission-control-1440x900.png` | FB-05 role mapping, FB-21 content width |
| 1440×900, approach camera, planet selected | `docs/phase10-baseline/section-12/systems-manual-1440x900.png` | FB-19 no overlap/truncation |
| 1440×900, approach camera, orbit transition | `docs/phase10-baseline/section-12/label-culling-1440x900.png` | FB-20 no orphaned labels |
| 1440×900 × 3 | `docs/phase10-baseline/section-12/panel-width-{600,660,720}.png` | FB-17 variant strip, `unoccluded: true` at each width |
| 1440×900 × 3 | `docs/phase10-baseline/section-12/tab-strip-{a,b,c}.png` | FB-08 variants A/B/C, FB-15 box on/off (B is boxless) |
| 1440×900, exit transition | `docs/phase10-baseline/section-12/exit-receipt-1440x900.png` | FB-09 receipt |
| 1440×900, keyboard focus | `docs/phase10-baseline/section-12/exit-terminal-grouped-1440x900.png` | FB-09 regrouped terminal, ≤ 9 visible rows |
| 1440×900, DRAFT rig open | `docs/phase10-baseline/section-12/draft-rig-1440x900.png` | FB-12 motion-off default, latch in strip, coach line |
| 1440×900, correlation section | `docs/phase10-baseline/section-12/correlation-1440x900.png` | FB-11 named-pair sentence |
| production server, 5×2 contexts | `docs/phase10-baseline/section-12/raw-bld04-longtasks.json` | `BLD-04` re-measurement (not visual; script output) |

The full ≤ 12-frame contact sheet with captions is assembled at **review
time** (this specify turn does not produce it) per the standing prompt's
Phase D; this table names the source captures it will draw from.

## Owner decision

- **Selected direction:** the "§12a unattended ordering" itself
  (`docs/phase10-workflow/prompts/claude-lead.md` §8.5, owner-adopted July 29
  2026) — an explicit, written scope-and-sequence decision naming exactly
  these eleven rows across four phases, in place of the full `PHASE10.md` §12
  text. This is the owner's own scoping act, cited as the equivalence per
  `DESIGN_GATE.md`'s "owner-approved equivalent" clause.
- **Individually owner-fixed numbers:** FB-01 (radii, gap formula, belt span —
  "designed · numbers fixed by owner"), FB-21 (content width — "designed ·
  numbers fixed by owner"). Both are used verbatim, not re-derived.
- **Rejected alternatives:** a full §12 spec covering the Chart Room, sky, and
  cursor in the same turn — explicitly rejected by the standing prompt's "No
  §12b work in this window." Ranking the tab-strip or panel-width variants —
  explicitly rejected by `UNIVERSE_IDEAS_6.md` §4.2's own framing ("options,
  not a verdict") and by FB-17's re-report history (the audit's own "two
  lessons this board has now paid for twice": a row that closes on a number
  instead of his eyes oscillates).
- **Approval evidence:** `OWNER_FEEDBACK_LEDGER.md` §2 (every row's Design/
  Scheduled columns), `UNIVERSE_AUDIT.md` §5, `docs/phase10-workflow/prompts/claude-lead.md`
  §8.5, `PHASE10_STATE.json` `section.note` (July 29 2026 owner insertion,
  "full throttle ahead").

## Freeze boundary

- **Defect remediation (in scope, no new owner decision needed):** FB-19,
  FB-20 (both mechanical), FB-05's role remapping (mechanical, root-caused),
  FB-01's spacing numbers (owner-fixed), FB-21's width (owner-fixed), FB-09's
  fully-specified receipt/terminal, FB-12's three named lines, FB-11's
  named-pair sentence addition to the existing paragraph. `BLD-04`'s
  re-measurement (not remediation — see the spec's own scope note on why no
  structural fix is authorized this window).
- **Build-then-show, not a design decision:** FB-17's three widths, FB-08's
  three tab-strip variants (FB-15 answered by contrast with variant B). None
  of these ship as "the" final treatment from this turn; each lands behind
  its existing/current default until the owner picks, and the pick itself is
  §12a Phase D's job (a review-turn action), not this spec's.
- **New creative direction requiring a new owner-scoped section:** the Chart
  Room (`UNIVERSE_IDEAS_6.md` §1), the sky (§2), the cursor flight model (§3),
  the full remaining type-ramp migration beyond Mission Control's role
  remapping (§5's broader "125 declarations" migration, if any remain
  outside Mission Control) — all §12b. Any structural SSR/hydration rewrite
  to resolve `BLD-04` outright — not authorized this window; re-measurement
  only.

## Acceptance-ledger mapping

| proof item | criterion ID(s) |
|---|---|
| FB-19 — `? SYSTEMS MANUAL` no longer overlaps/truncates the panel header | `VIS-01` |
| FB-20 — no orphaned label without its body at approach scale | `VIS-02` |
| FB-05 — Mission Control text role → token mapping, rendered not sourced | `TST-01`, `VIS-03` |
| FB-01 — spacing/pull-back, measured gap and belt fit | `VIS-04` |
| FB-17 — panel-width variant strip, `unoccluded: true` at every width | `VIS-05` |
| FB-08 + FB-15 — tab-strip variant strip, each variant renders validly | `VIS-06` |
| FB-09 — exit receipt + regrouped keyboard terminal | `VIS-07`, `ACC-01` |
| FB-12 — DRAFT rig: motion off by default, 30–90s lap band, latch + coach line | `VIS-08`, `BHV-02` |
| FB-11 — correlation named-pair sentence | `BHV-01`, `VIS-09` |
| FB-21 — Mission Control content width | `VIS-10` |
| `BLD-04` — carried long-task re-measurement, unmodified verifier | `BLD-04` |
| Regression: mobile fallback unaffected | `MOB-01` |
| Regression: no privacy/public-data surface touched | `PRV-01` |
| Tests and build green | `TST-02`, `BLD-01` |
