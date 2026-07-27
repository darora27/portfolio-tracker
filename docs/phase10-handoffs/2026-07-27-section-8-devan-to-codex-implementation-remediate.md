# Phase 10 §8 handoff: Devan (owner feedback) → Codex Implementation

Prepared July 27, 2026 by `claude/fable-5` (Cowork, owner-directed), recording
Devan's live review of the shipped Stock Market Universe at commit `3c53630`.

## Outcome

Owner feedback recorded. §8 returns to `remediate` with three confirmed
defects, two owner decisions that change scope, one tuning item, one asset
task, and one item awaiting owner clarification.

**This supersedes nothing in the §8 spec except where explicitly stated.** All
existing acceptance criteria (1–50) remain in force, including the privacy
gates, the 50 ms long-task budget, the desktop-first fallback contract, and the
semantic-DOM-survives requirement.

---

## A. Confirmed defects — spec'd behavior that is not working

### A1. Planets run away when you try to click them (severe)

The single complaint that survived the entire rebuild. Spec §7 (lock-on
targeting) requires that pointer proximity ease a planet's orbital advance to a
stop so it can be clicked. It does not happen — the owner still chases planets
around the screen.

**Note the owner decision in C1 before fixing this.** Lock-on is being replaced,
not repaired. Do not spend a round making reticle-based lock-on work.

### A2. Planets still overlap

Spec §3.2 and criterion set require one planet per orbital ring with a
guaranteed minimum angular separation and `ORRERY_SUN_CLEARANCE` respected.
Overlap is still visible in normal use. Determine whether the ring assignment,
the separation guarantee, or the camera projection is at fault, and add a
test that would have caught it.

### A3. The Portfolio Observatory content is still present

The owner wants the solar system to be the first and only thing on arrival:
*"portfolio observatory is still there even though I want it completely gone.
Good information but it is just too many words that I don't care about. When I
open the website I want to see the solar system first."*

Resolve this together with C2 — the retained analysis belongs inside Mission
Control, reachable from the sun, never on the arrival surface.

---

## B. Tuning and assets

### B1. Orbital speed is far too fast

*"All the planets are moving way too fast, everything needs to be scaled down
to be slower."* Scale the whole speed domain down substantially. Keep the
encoding intact — relative speed must still track weekly magnitude, and the
clamp behavior and its tests stay valid. This is a constant change, not a
redesign.

### B2. Planet textures do not evoke their companies

*"None of the planets have the textures that relate to the companies
themselves."* The KTX2 pipeline itself works — 24 maps load and render
correctly. What ships in them is placeholder-grade procedural art.

**This is an asset task, not an engineering one.** The per-company art
direction already exists in `UNIVERSE_IDEAS.md` §12 (ASML precision optics,
GOOG index world, COST warehouse world, MSFT azure world, INTC reconstruction
world, IBM deep blue, NBIS newborn world, CBRS Cerebras wafer world) and the
quality bar is `docs/reference/planet-surface-mood-reference.jpg`. Constraints
unchanged: equirectangular 2:1, brand-evoking, **no logos or wordmarks**, and
the existing texture byte budget.

---

## C. Owner decisions that change scope

### C1. The rocket-ship cursor replaces lock-on targeting

*"I want my cursor to be a rocket ship that can fly to planets which allows me
to see what's going on with each planet."*

**Decision: the rocket cursor is the single planet-selection mechanism.**
Reticle-based lock-on (spec §7) is withdrawn. Do not build both.

- The cursor is rendered as a rocket ship.
- Aiming it at a planet flies it there; on arrival, that planet's holding panel
  opens.
- **Planets keep orbiting.** The system stays in motion; the rocket does the
  travelling. This is what fixes A1 — the user aims once instead of tracking a
  moving target.
- Keyboard and screen-reader operation are **unchanged and still required**.
  The rocket is a pointer affordance only; every planet must remain reachable
  by Tab and activatable by Enter, and the semantic DOM stays the accessible
  source of truth.
- Reduced motion must not animate a flying cursor — fall back to an ordinary
  pointer with direct selection.

### C2. Mission Control becomes the real analysis surface, gated by who is viewing

*"When I click on the sun it opens up this confusing mission control thing. I
essentially just want the mission control to be the dashboard, history, trades,
and research screen. But I want all of that to be in the retrofuturistic
artistic style."*

`/dashboard`, `/history`, `/trades`, and `/research` are all owner-gated behind
`OWNER_PASSWORD` today and contain dollar amounts, cost basis, and written
trade reasons. `/share` is public. Publishing them as-is would expose the
owner's full financial position to anyone holding the link.

**Decision: Mission Control renders by viewer identity.**

- **Owner, authenticated:** the full dashboard, history, trades, and research
  content, restyled in the retrofuturist HUD/CRT language.
- **Public, unauthenticated:** public-safe equivalents — percentages, weights,
  and derived scalars only. No dollar amounts, no cost basis, no trade reasons,
  no research notes.
- Reuse the existing `mode="public"` / `mode="private"` pattern the Observatory
  shell already establishes and tests; do not invent a new mechanism.
- **Every existing privacy criterion still applies in full.** The canary-value
  tests must be extended to cover the new authenticated-versus-public split,
  and a public request must be proven to contain zero owner-only fields in
  HTML, RSC payload, and client bundle.
- The five current chapters (Pulse, Forces, Structure, Timeline, Lab) stop
  being the Mission Control content. Their analysis is retained where it has a
  home in the new surfaces; anything with no home is recorded as dropped rather
  than silently deleted.

Restyling is wrapping, not rewriting — the same "wrap, don't rewrite" rule the
original spec §10 established. Do not edit accepted, tested route components to
fit a new frame.

---

## D. Awaiting owner clarification — do not act yet

### D1. A green trail on a holding that is down for the week

*"Certain planets have a green trail even though they are down for the week."*

Traced and **not reproduced** at this commit. The mapping is correct in source:
`directionForWeeklyReturn` returns `clockwise` for a positive week and
`counterclockwise` for a negative one; `OrreryScene.tsx` colors clockwise
`#63ef98` (green), counterclockwise `#ff665f` (red), neutral `#e3b65c` (amber).
Every trail in the committed review screenshot matches its holding's weekly
return.

Most likely explanation: the holding panel shows **two** figures — `TODAY` and
`TRAILING WEEK` — and the trail encodes the week. MSFT, for example, reads
`TODAY +1.9%` / `TRAILING WEEK −3.1%`: up today, down for the week, red trail.
Correct, but confusing if the day figure is what caught the eye.

**If the owner names a ticker whose trail contradicts its own weekly figure,
this becomes a severe defect** — an encoding that misreports performance is
worse than no encoding. Until then, do not change the colour logic.

Worth considering independently: whether showing two different time windows in
one panel, while the scene encodes only one of them, is itself a legibility
problem.

### D2. "Website is still relatively confusing"

Recorded verbatim and deliberately not acted on. Too general to convert into
bounded work without producing unscoped changes. To be unpacked with the owner
once A1–A3 and C1–C2 land, since several of those are likely contributors.

---

## E. Still requiring live verification from the previous round

Commit `3c53630` remediated two findings that **have not been verified live**:

1. Desktop `?no3d=1` and desktop `prefers-reduced-motion` rendered a nearly
   blank page. The CSS fix is structurally correct on inspection, but neither
   state has been exercised in a browser since.
2. Criterion 37's fixture-driven coverage of `dayReturn` and belt hysteresis.

Both must be confirmed in the next Claude review alongside the new work. Do not
treat them as closed.

---

## For the next actor

Codex Implementation, `stage: remediate`. Read this handoff, then
`docs/phase10-workflow/specs/section-8.md` (still authoritative except where C1
and C2 change it), then `UNIVERSE_IDEAS.md` §12 for texture art direction, then
`PHASE10_STATE.json`.

Suggested order — the defects are what the owner feels every time he opens the
page, and C2 is the largest piece of new work:

1. A2 and A3 (overlap, arrival surface) — smallest, most visible
2. B1 (speed) — a constant
3. C1 (rocket cursor) — closes A1
4. C2 (Mission Control by viewer identity) — largest; privacy tests first
5. B2 (textures) — independent of all the above, can land last

Keep `npm test` and `npm run build` green, commit once as
`phase10(§8): <summary>`, and transition `stage` → `review`, `role` →
`claude_lead`, `next_actor` → `claude`. If the environment blocks live
verification again, preserve the green work, document the gap plainly, and
route to Claude review — do not claim evidence that does not exist.
