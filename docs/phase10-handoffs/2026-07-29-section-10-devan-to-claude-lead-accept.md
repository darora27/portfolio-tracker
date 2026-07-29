# Phase 10 §10 handoff: Devan (owner decision) → Claude Lead

Prepared July 29, 2026 by `claude/fable-5` (Cowork, owner-directed), resolving
`docs/phase10-handoffs/2026-07-29-section-10-claude-lead-to-devan-blocked-2.md`.

## Outcome

**Accept §10.** Reclassify both remaining bucket-A items to bucket B and carry
them to §11 with their measurements attached. No exception is recorded; no gate
is weakened.

## The decision rests on direct owner observation

Round 5 left two failures whose mechanisms were disproven and which no further
measurement could separate. The owner ran the build and looked at both.

**F1 / TST-03 — the verifier is wrong, not the render.**

> *"NBIS trail is the same brightness as the other red planets."*

The check reports NBIS rendering at red 93 against a model value of 179 —
roughly half. The owner, comparing it directly against its neighbours, sees no
difference. Human judgement is the ground truth for "is this the correct
colour," and it contradicts the instrument.

This also explains round 5's result: the authorised taper fix widened every
ribbon 1.89× and took IBM from ΔE 3.522 to 0.396 — it plainly worked — while
NBIS moved only 33.8 → 30.5. A width fix could not help because width was never
the problem. **The sample point or the expected value is wrong**, not the
rendering.

**F3b / DEF-02 — unjudgeable by anyone until the panel shrinks.**

> *"I honestly can't see the planet at all because of the bug where the terminal
> covers up the screen… I do not see any logos on any of the planets."*

The chirality verifier fails because the inspector covers 96.8–100% of the band
it samples. The owner just hit the same wall from the other side: he cannot see
the planet either, so he cannot say whether the mark is mirrored.

**Neither a human nor a machine can currently evaluate this criterion.** It is
not a texture defect that has resisted two fixes; it is a measurement — and a
product experience — blocked by panel geometry. §11 rebuilds that panel.

## Reclassification

Both move to **bucket B: carried to §11, not closed.**

| Item | Carried because | Resolved in §11 by |
|---|---|---|
| F1 / TST-03 | The verifier disagrees with direct observation; its sample point or expected value must be re-derived | Re-derive the sampler against the rebuilt view and reconcile it with what a viewer sees |
| F3b / DEF-02 | Unjudgeable while the panel occludes the planet | The planet-panel rebuild, after which the shipped-view verifier is re-run |
| F2 / BLD-04 | Already an approved carry; 65/57/58/58/57 ms, unmoved across five rounds | Deleting the embedded legacy dashboard and its Recharts instances |
| F3a + VIS-02, BHV-05 | Already an approved carry; same panel occlusion | The same panel rebuild |

All four must appear in §11's acceptance criteria with these measurements
attached. **None is closed by this acceptance.**

## New owner feedback, recorded for §11

> *"Why are the trails so long? It seems like they are too long and cheap
> looking now… the trails don't even seem like they fit the vibe of the project
> anymore, they were a lot better before."*

Round 3 lengthened trail arcs from 18–30° to 36–64° to give the new lightness
ramp somewhere to live. The owner is rejecting that change: the longer arcs read
as cheap and worse than what preceded them. §11 should shorten them —
somewhere between the two, judged by eye rather than by the ramp's needs — and
reconcile that against the lightness encoding, which may no longer need the
extra length now that hue carries magnitude.

Also recorded: **no logos are visible on any planet.** At OVERVIEW the planets
render at roughly 30–60px, too small for a mark to read; up close the panel
blocks the view. The carved marks may be entirely correct and simply
unviewable. §11's panel rebuild is the first opportunity to find out.

## Why accept rather than continue

§10 passes 71 of 77 criteria. Every remaining failure is entangled with a
surface §11 replaces — the panel that blocks two of them, the dashboard that
likely causes the third. Fixing a measurement inside §10 while §11 rewrites what
it measures is the duplicated work the bucket system exists to prevent.

Five review rounds, three disproven mechanisms, and two authorised fixes that
landed in the artifacts without moving their meters. That is the signature of
measurement error, not implementation failure, and the owner's direct
observation confirms it on both counts.

## For the next actor

Claude Lead, `stage: review` with `review_result: fail` and zero *actionable*
findings inside §10's scope.

Accept §10 at candidate `3d85341` — the last commit carrying application
source. Record in the acceptance:

- The four carried items above with their current measurements.
- That acceptance rests on direct owner observation contradicting two
  instruments, quoted verbatim.
- `single_provider_mode: true` is **not** set — §10 was implemented and reviewed
  across two providers.

Then initialize §11 at `stage: specify`, adding the four carried items and the
trail-length feedback to its criteria. Do no §11 work in the accept turn.

## Correction to a prior owner record

`single_provider_mode.activate_when` reads *"§10 is accepted"* on the premise
that the two bucket-A fixes would finish the section. They did not, but the
trigger is unchanged and now correct on its own terms: §10 is accepted here, so
the mode activates for §11. The remaining OpenAI credits were spent on the
bucket-A attempt; that was the right call even though it failed, because it
disproved two mechanisms and produced the evidence this decision rests on.
