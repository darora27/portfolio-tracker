# Phase 10 §8 handoff: Devan (owner defects, round 3) → Codex Implementation

Prepared July 28, 2026 by `claude/fable-5` (Cowork, owner-directed), after the
owner ran commit `c2485af` locally. §8 had passed review with zero findings
(`9b907c2`); this round reopens it for six defects.

## Scope — defects only

This handoff covers **regressions and gaps in §8's delivered scope**. It does
**not** cover the round-2 creative work (texture regeneration, Mission Control
reskin, planet detail view, moons, satellites, sector map). That is new scope,
recorded in `UNIVERSE_IDEAS_2.md`, and will be specified as its own section
after §8 is accepted. Do not begin it here.

All existing §8 acceptance criteria remain in force.

---

## F1. Orbit rings and comet trails are effectively invisible (severe)

*"The planet trails and orbits are for some reason hidden. I no longer see the
path of orbit and I do not see the color of trails that well."*

Confirmed at source: `OrreryScene.tsx` renders orbit rings at opacity `0.12`
and `0.2`. Trails sit at `0.72` but are drawn thin enough to disappear against
the background at overview.

This is a regression. Earlier §8 builds showed clearly readable rings and
trails, and trails are load-bearing — they are the **only** encoding of orbit
direction, which is the sign of the weekly return. An invisible trail means a
holding's performance direction is unreadable.

**Required:** restore ring and trail legibility at OVERVIEW. Rings should read
as the composition's structure, not as noise. Trails must show both colour
(direction) and length (weekly magnitude) at rest, in a still frame, without
hovering. Add a check that would catch a future opacity regression.

## F2. Planets intersect orbit lines when the camera is close

*"When you click on a planet sometimes you see the planet intersecting with
some of the orbital lines, that is no good… there should never be any overlap
between planets and other orbits."*

The owner explicitly does **not** want orbits pushed further apart — seeing
other planets moving while zoomed in is desirable. The fix is depth/geometry
handling at close camera range, not increased spacing.

## F3. Exiting a planet back to the whole system is still unreliable

*"It is hard to get out of certain planet and view the entire solar system."*

Reported for the third time across rounds. Spec §6 requires every camera state
to be one gesture from OVERVIEW. The previous fix addressed control overlap;
the underlying difficulty persists. Treat this as not-yet-fixed rather than
regressed, and cover the return path from every camera state in tests — not
only from APPROACH.

## F4. Asteroid-belt objects are not clickable

*"You cannot click on any of the lower position asteroids for some reason."*

Belt members are holdings 9+ and were specified as activatable, opening the
belt panel. Verify hit targets, pointer handling under the rocket cursor, and
keyboard reachability.

## F5. The sun gives no hover feedback

*"Clicking on the sun is not very intuitive as the sun does not light up or
anything when you hover on it like the planets do."*

The sun is the most important control on the screen and currently reads as
scenery.

**Constraint that matters:** the sun's body already encodes portfolio health
through colour, corona, sunspots, and pulse. **Hover feedback must never be
confusable with a change in health.** Add an affordance that is clearly
instrumentation rather than physiology — `UNIVERSE_IDEAS_2.md` §6 proposes a
dashed docking ring outside the corona plus an extended label, which satisfies
this; any equivalent solution is acceptable.

## F6. Ticker labels darken the planets they annotate

*"You cannot see the texture packs at all since it seems like all the planets
have been darkened to allow for the user to see the stock ticker. I would
rather have the stock ticker be below the planet."*

The scrim that makes labels legible is hiding the texture, which is the point
of the planet.

**Required:** remove the darkening. Move the ticker to a billboarded tag
**below** the planet, with contrast carried by the label itself (an outline or
plate) rather than by dimming the art. Labels stay always-visible and
fixed-size in screen space at every zoom.

Note the owner's inverse-colour suggestion and `UNIVERSE_IDEAS_2.md` §2's
refinement of it: literal inversion lands on arbitrary hues and can collide
with the reserved red/green direction semantics. Tinting toward the planet's
dominant brand hue, lightened, keeps the identity link without that collision.

---

## Not in scope for this turn

- Texture regeneration and resolution changes (`UNIVERSE_IDEAS_2.md` §1, §9.1)
- Overview composition redesign — planet scale, ring spacing, nebula, comets
- Mission Control reskin
- The planet detail view
- Moons, satellites, the sector map
- The public trade log and public news surfaces (authorized in
  `UNIVERSE_IDEAS_2.md` §9.3–9.4, but specified in the next section)

F6 necessarily touches label rendering, which the overview redesign will
revisit. Do the minimum that removes the darkening and moves the tag below the
planet; do not pre-empt the composition work.

---

## For the next actor

Codex Implementation, `stage: remediate`. Read this handoff, then
`docs/phase10-workflow/specs/section-8.md`, then `PHASE10_STATE.json`.

Suggested order: F1 (most visible, and it breaks an encoding), F6, F4, F5,
F2, F3.

Keep `npm test` and `npm run build` green, commit once as
`phase10(§8): <summary>`, and transition `stage` → `review`, `role` →
`claude_lead`, `next_actor` → `claude`. If the environment blocks live
verification, preserve green work, document the gap plainly, and route to
Claude review.
