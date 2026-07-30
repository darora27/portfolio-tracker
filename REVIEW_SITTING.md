# §12a review sitting

Prepared 2026-07-30 by Claude Lead (`claude-code/sonnet-5`), review turn,
candidate `2390059473ad2a0da2b64ee7a9ecce35d5e532b1`.

This is the one sitting the §12a spec exists to produce: eleven ledger rows'
mechanical half is done and independently verified (19/19 acceptance criteria
pass — see `docs/phase10-workflow/reviews/section-12-review.md`), tests and
build are green, and `BLD-04` (carried from §11) re-measures clean across 15
fresh contexts this round. Two rows (`FB-19`, `FB-20`) close outright — they
were rendering defects nobody had to judge by eye, and the fix is provably
correct from geometry alone. **Everything else in this section is a question
for you, not a verdict of ours.**

Look at `docs/phase10-baseline/section-12/contact-sheet.md` (12 frames) and
answer what you see. Nothing below needs measuring — only looking.

## Closed already (no question — for your awareness only)

- **FB-19** — the `? SYSTEMS MANUAL` button no longer overlaps the inspector
  panel; its header line reads in full. Frames not included in the 12-frame
  sitting cap (no judgment needed) — see `systems-manual-1440x900.png` if
  you want to look anyway.
- **FB-20** — no more orphaned `CBRS`/`COST`-style labels floating with no
  planet attached. See `label-culling-1440x900.png` if you want to look.

## Questions — your sentence closes each of these

1. **FB-01 (spacing/zoom)** — frame 1, `overview-1440x900.png`. Is the system
   spread out and zoomed out the way you asked?
2. **FB-05 (legibility) + FB-21 (space use)** — frames 2–3,
   `mission-control-1440x900.png` and the `-before-1120-` comparison. Can you
   read Mission Control without squinting? Does it feel like it's using the
   space it has now, versus the narrower before?
3. **FB-17 (panel width)** — frames 4–6, `panel-width-{600,660,720}.png`.
   Which of these three do you want to keep? (No ranking implied — pick one,
   or none if you want a fourth number.)
4. **FB-08 + FB-15 (tab strip)** — frames 7–9, `tab-strip-{a,b,c}.png`. Which
   treatment do you want — and does removing the boxes (variant B) read
   better than keeping them? Variant C's fixed index sits a little close to
   the sticky title bar at 1440×900 — a rough edge, not a defect, noted so
   you see it if you look for it.
5. **FB-09 (exit receipt)** — frame 10, `exit-receipt-1440x900.png`. Is this
   what you meant instead of the terminal springing open when you leave
   Mission Control? (The full terminal is unchanged for keyboard/AT users,
   just regrouped and capped at 9 visible rows — not pictured again here to
   hold the frame count, see `exit-terminal-grouped-1440x900.png` if you want
   it.)
6. **FB-12 (DRAFT rig)** — frame 11, `reviewer/draft-rig-1440x900.png`
   (captured this turn with a temporary reviewer credential, since the route
   is owner-gated). Does it feel resolved now — open it yourself if you'd
   rather see it live: `npm run build && npm run start`, sign in, click
   DRAFT.
7. **FB-11 (correlation sentence)** — frame 12, `correlation-1440x900.png`.
   Does this sentence tell you something real and useful about your own
   book?

## What happens with your answers

Whatever you say gets transcribed into `OWNER_FEEDBACK_LEDGER.md` as
`CONFIRMED` (his exact words, quoted, dated) for each row you're satisfied
with, or a fresh `regressed`/`re-reported` entry for anything you're not — per
the ledger's own rules, not a re-guess by us. A pick among FB-17's three
widths or FB-08/FB-15's three variants becomes a follow-up implementation
item to make that pick the shipped default (not part of this section's
criteria, since neither had a "correct" answer to grade).

## State

`stage: owner-sitting`, `next_actor: devan`, `status: ready`. Nothing further
runs until your answers come back.
