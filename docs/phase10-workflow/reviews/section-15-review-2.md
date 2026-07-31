# Phase 10 §15 review, round 2 — re-review of the F1 (ORBITS ring) remediation

Reviewed by `claude-code/sonnet-5` (Claude Lead, `review` stage), July 31, 2026.

## Candidate

`b27525be532fbac1c38f9559d9e436ad8b82f351` —
`phase10(§15): remediate ORBITS ring hit-test (F1: BHV-08/VIS-08)`. Sole
remediation commit since round 1's fail (`bff98cf`).

## Result: FAIL — F1's original symptom is fixed; a narrower but still
critical variant of the same defect survives

## Independent verification performed this turn

- `npm test`: 118 files, 645 passed, 1 intentional skip, zero failures —
  byte-identical to the implementer's reported numbers.
- `npm run build`: exit 0, 23 routes (unchanged route list), `/share` smoke
  PASS.
- `node scripts/phase10-acceptance.mjs check docs/phase10-workflow/acceptance/section-15.json --require implementer`
  → valid.
- Read the full `bff98cf..b27525b` diff:
  `MissionControlBays/SystemPlot.tsx` (5 lines — a `--radar-ring-z` custom
  property, `holdings.length - index`) and `orrery.module.css` (26 lines —
  moves the visible circle to a `pointer-events:none` `::before`, gives
  `.radarRingTarget` `z-index: var(--radar-ring-z, 0)`, raises
  `.radarBlipTarget`'s z-index to 1000/1001, adds `isolation: isolate` to
  `.radarTargets`, and a matching mobile-fallback `::before` addition).
  Confirmed `SystemPlot.tsx` in `MissionControlBays/` is the live component
  (imported by the live `MissionControl.tsx`, itself imported by
  `OrreryWorld.tsx`) — the spec's "MissionControlBays/* is dead code" note
  applies to the *other* Bay components (`HazardBay`/`LogBay`/`ManifestBay`/
  `ScopeBay`, used only by the actually-unused
  `PublicMissionControlContent.tsx`), not to `SystemPlot.tsx`.
- Started a fresh production server on a different port (3418) than either
  the implementer's (3417) or round 1's (3416), with a self-chosen temporary
  `OWNER_PASSWORD` override (not read from `.env.local`).
- **Deliberately re-tested with a different click-angle methodology than the
  implementer's own script**, per round 1's own handoff note asking the
  next reviewer to avoid rubber-stamping the implementer's exact test. The
  implementer's script clicks each ring at a fixed **cardinal** point (95%
  toward the ring's own left edge, 180°). Rings are ellipses
  (`data-radar-ellipse`) whose visible stroke is inscribed inside a
  rectangular hit-box; a cardinal-only test cannot exercise a non-cardinal
  click, which is where this round's finding lives.
  - First attempt: clicked each ring at its own natural blip angle
    (`index*0.89` rad). This coincidentally lands on that ring's *own* blip
    (blips sit at exactly that angle/radius), which sits on top
    (`z-index: 1000`) and correctly intercepts the click — a test artifact,
    not a finding (root-caused in
    `docs/phase10-baseline/section-15/review-2/scripts/debug-cbrs.mjs`, kept
    as evidence of ruling this out).
  - Second attempt, offset 90° from each ring's own blip angle (still
    non-cardinal, no blip collision): **CBRS misrouted to IBM** in both
    modes (`docs/phase10-baseline/section-15/review-2/raw-radar-ring-diagonal-click.json`).
  - Characterized the scope with a 24-angle (every 15°) hit-test sweep across
    all 8 real rings (`docs/phase10-baseline/section-15/review-2/raw-radar-ring-sweep.json`):
    the four smallest rings (ASML, GOOG, COST, MSFT's own inner neighbors)
    are clean, but the five largest rings each misroute at a growing
    fraction of sampled angles — MSFT/INTC/IBM wrong at 4/24 (the ~45°
    diagonals), CBRS and CRM (the two largest, outermost rings) wrong at
    **12/24 — literally half the compass**.
  - Confirmed with real dispatched double-clicks (not just
    `elementsFromPoint` reads), in both modes:
    `docs/phase10-baseline/section-15/review-2/raw-confirm-diagonal-misroute.json`
    — CRM's ring at 45° navigates to `/stock/IBM` (private) /
    `?holding=IBM&camera=approach` (public); CBRS's ring at 45° navigates to
    `/stock/INTC` / `?holding=INTC&camera=approach`. Screenshots:
    `docs/phase10-baseline/section-15/review-2/{private,public}-{CRM,CBRS}-45deg-before.png`.

## Finding F2 — the ring fix only holds at cardinal angles; large rings
misroute across roughly half their own visible stroke

**Root cause.** The remediation correctly stacks rings by size
(`z-index: holdings.length - index`, smaller ring on top) and is
mathematically sound for the *rectangular hit-box* geometry: because every
ring's box uses one `ringSize%` for both width and height, all 8 boxes are
self-similar (same aspect ratio, same center), and a strictly smaller box is
a proper geometric subset of every larger box — there is no direction in
which a smaller ring's rectangle can extend past a larger ring's own
rectangle. The residual bug is a **different** mismatch: the *visible*
stroke is an ellipse inscribed in that rectangle (`border-radius: 50%` on
the `::before`), touching the rectangle's edge only at the four cardinal
points. At any other angle the visible stroke sits *inside* the rectangle,
short of its true edge — and for a smaller-but-still-large neighboring ring,
that inner rectangle can still reach out far enough, in one axis-dominant
direction, to cover the point where a larger ring's visible curve is drawn.
The two outermost rings (CBRS, CRM) have the least "spare" rectangle margin
relative to their inner neighbors relative to their own visible curve, which
is why they show the widest failure arc (12/24 sampled angles) while the
innermost rings (whose next-larger neighbor is comparatively much bigger)
show none.

**Reproduction.** See the sweep and confirmation artifacts above. Concretely:
double-clicking CRM's own ring at 45° (a point squarely on CRM's visible
stroke, `document.elementsFromPoint` confirms it sits inside CRM's own
rectangle) opens IBM's Chart Room instead, in both private and public mode.
This is not a corner case restricted to one obscure angle — it spans a
contiguous ~45°-wide arc around each of the four diagonals for the two
outermost rings.

**Why this is still BHV-08/VIS-08, not a new criterion.** Both criteria
require doors to "navigate to `/stock/<ticker>` for the correct real
ticker" / resolve correctly for the paired private/public capture. A click
on CRM's own visible ring, at a point inside CRM's own rectangle, that
still opens a different ticker's page, is exactly the failure mode F1
described — narrower in *area* (roughly half of two rings' compass rather
than nearly the whole radar) but identical in *kind* and unchanged in risk
(critical): a user who visually aims for and clicks a specific holding's
ring is silently shown a different holding's data, with no error and no
visual indication.

**Not affected, not re-litigated:** `PRV-01` (the public-mode misroute still
never produces a `/stock/` URL — confirmed above), the HOLDINGS-row and
`FULL ANALYSIS ▸` doors (unchanged by this commit, not retested), and every
other §15 criterion already independently `pass`ed in round 1 — this
commit touched only `SystemPlot.tsx` and `orrery.module.css`'s ring/blip
styling, confirmed by the diff.

## All other criteria

`BHV-01`–`07`, `PRV-01`, `VIS-01`–`07` (excluding the door-negative-capture
half already covered by `VIS-08`), `MOB-01`, `ACC-01`, `TST-01`, `TST-02`,
`BLD-01` remain `pass` from round 1's independent review — unaffected by a
commit scoped to ring/blip CSS and one JSX prop, re-confirmed this turn only
via the full `npm test`/`npm run build` re-run (both green, no new
failures).

## Next

Routed to `stage: remediate`, `role: codex_implementation`,
`next_actor: codex`, `section.review_result: fail`, `status: ready`.
The implementer's next fix must hold for **every** angle around each ring,
not just the cardinal points a fixed-angle test happens to sample —
re-verifying with a single click point per ring (any angle) is exactly how
this round's regression slipped past the round-1 remediation's own test.
A mechanism that clips each ring's actual hit area to its visible
annulus/ellipse (e.g. `clip-path: ellipse(...)` sized to the ring's own
stroke, revisiting why the implementer's round-1 notes rejected `clip-path`
for the *label*, which can remain a sibling/absolutely-positioned element
outside the clipped hit area) is one option; z-index-only stacking of
same-shaped rectangles cannot fully solve this because the defect is
geometric (ellipse-vs-rectangle), not a stacking-order problem. Re-verify
with an angle **sweep** (not a single fixed point) per ring, in both modes,
plus a real double-click confirmation at any failing angles found — the
sweep script in `docs/phase10-baseline/section-15/review-2/scripts/radar-ring-sweep.mjs`
is a usable starting point, not a required file to reuse.
