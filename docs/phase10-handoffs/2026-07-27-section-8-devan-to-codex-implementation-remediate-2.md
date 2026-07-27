# Phase 10 §8 handoff: Devan (owner feedback, round 2) → Codex Implementation

Prepared July 27, 2026 by `claude/fable-5` (Cowork, owner-directed), after the
owner ran commit `d992510` locally. §8 had passed review with zero findings
(`4577d78`); this owner round reopens it.

## Outcome

Six items: one owner decision closing a scope hole, one confirmed defect with a
root cause the review could not have caught, two bounded defects, one design
change, and two features. Plus one reported item **resolved as a false alarm**.

All existing §8 acceptance criteria remain in force — privacy gates, the 50 ms
long-task budget, the desktop-first fallback contract, keyboard and
screen-reader operation, and the semantic-DOM-survives requirement.

---

## E0. Resolved, not a defect — the owner was viewing `/`, not `/share`

The report *"immediately when I open the application I get stuck with the
Pulse, Forces, Structure, Lab and Timeline screen"* is correct but not a bug in
§8. `src/app/(depth-pull)/share/page.tsx` imports no chapter components at all.
`src/app/(depth-pull)/page.tsx` — the **home route** — still renders
`ObservatoryShell` with all five chapters, untouched by §8.

This surfaces a real scope hole rather than a defect: `UNIVERSE_DIRECTION.md`,
`UNIVERSE_IDEAS.md`, the §8 spec, and `PHASE10.md` §8 all scope the work to
"`/share` rebuilt." **None of them say what happens to `/`.** The result is
that the application's front door still opens onto the content the owner has
rejected three times, with the universe one URL deeper. See E1.

---

## E1. Owner decision — `/` becomes the universe

*"Make `/` the universe too."*

The root route renders the Stock Market Universe, using the same components and
the same identity gating as `/share`, so opening the application lands in the
solar system regardless of URL. The five-chapter Observatory is retired from
`/` exactly as it was retired from `/share`.

- Do not fork the implementation. `/` and `/share` share one universe
  component; any difference is a prop, not a copy.
- `/` is an **owner-briefing route today and is not public.** Preserve whatever
  gating it currently has. The identity split built in C2 applies here too:
  authenticated sees owner content, unauthenticated sees public-safe.
- Existing `/` behaviour that is not the chapter shell (metadata, gating,
  redirects, any link into it from elsewhere) must keep working.
- Update every internal link, test, and doc that assumed `/` renders chapters.

---

## E2. Confirmed defect — planet textures are destroyed by the build pipeline

*"Still not seeing any of the personalized texture surfaces for any of the
planets."*

**The owner is right, and the source art is not the problem.**
`assets/planet-textures/source/` contains eight correctly-prompted 512×256
equirectangular plates with real per-company art direction and no logos. That
work is good.

**`scripts/generate-planet-textures.mjs` then downsamples them to 112×56**
(lines 21–22). 512×256 is 131,072 pixels; 112×56 is 6,272 — a **95% loss**.
Every recognisable feature (ASML's lens strata, CBRS's wafer die, COST's
warehouse grid) is annihilated before it reaches a sphere. Wrapped on a planet
at desktop size, the result is a tinted blur, exactly as reported.

**Root cause: the texture byte budget.** 24 maps inside ~261 KB is ~11 KB each,
and 11 KB forces postage-stamp resolution. The budget was strangling the art.
The review passed this because criterion coverage was mechanical — *textures
load, per-planet variation exists* — never perceptual.

**Required change: raise the budget and ship the art at a resolution that
carries it.**

- Use the 512×256 source at native resolution. Do not downsample below it.
- KTX2/Basis at 512×256 runs roughly 40–80 KB per map; ~1–2 MB across 24 maps
  is the expected new budget. Measure and record the real figure.
- This is affordable because these assets are **desktop-only** (phones never
  enter the WebGL path), **lazy-loaded after first paint**, and cached. The
  50 ms gate governs main-thread JavaScript, not texture bytes.
- **Re-measure the 50 ms long-task gate and GPU/heap after the change** — texture
  bytes are not JS, but decode and GPU upload are real costs. If the gate moves,
  report it rather than absorbing it.
- Add a check that would have caught this: assert the shipped texture
  dimensions match the source plates, so a future budget change cannot silently
  destroy the art again.

---

## E3. Defect — ticker labels are larger than the planets

*"The planets have shrunk but the boxes that have the name of each stock are so
large that you can't even see the planets from a zoomed out point of view."*

Visible in the committed review screenshots as well: label boxes did not scale
down when planet sizes were reduced, so at OVERVIEW the labels dominate and
occlude the bodies they annotate.

Labels must stay always-visible (that requirement is unchanged and was itself
owner-driven) — but they must not obscure the planets. Scale, position, or
weight them so both read at OVERVIEW.

---

## E4. Defect — no way back to the whole solar system after selecting a stock

*"Still some bugs as far as clicking on a stock and then not being able to go
back and view the entire solar system."*

Spec §6 requires every camera state to be one gesture from OVERVIEW. Verify
and fix all return paths: Escape, an explicit visible control, browser Back,
and clicking empty space. Add coverage for the return path, not only the
outbound one.

---

## E5. Design — simplify Mission Control's interface

*"When you click on the sun it brings you to the dashboard like I said which is
good. I don't like the user interface though, it needs to be a bit more
simple."*

The destination is right; the surface is too busy. Reduce it toward the
telegraphic discipline in `UNIVERSE_IDEAS.md` §9 — fewer simultaneous elements,
stronger hierarchy, less chrome competing with content. Do not remove data the
owner values; reduce what surrounds it.

---

## E6. Features — satellites and moons

Both extend the metaphor rather than decorating it, and both must obey the
existing encoding rule: every object means one real number, or it does not
ship.

- **Satellites** carry portfolio-level statistics (the mathematical measures
  that describe the whole system rather than one holding).
- **Moons**, per planet, open recent news for that stock — visible after
  travelling to a planet, activatable like any other body.

These are additive and lower priority than E1–E4. If budget is short, land the
defects first and report satellites and moons as not started.

---

## E7. Scope emphasis — public-first

*"We can just focus on the public version... I want a greater emphasis on the
public view of this project."*

The identity gating built in C2 stays (it is already tested and it is the
primitive the owner's longer-term vision needs). But **the public view is the
one that must be excellent.** When public and owner presentation compete for
effort or polish, the public view wins.

Owner's stated long-term direction, recorded for context and explicitly **not**
in scope now: multiple users, each starting from a basic template portfolio,
syncing or manually entering holdings, viewing their own system privately, and
flying to another person's system to see only its public face. Nothing in this
round should foreclose that architecture.

---

## For the next actor

Codex Implementation, `stage: remediate`. Read this handoff, then
`docs/phase10-workflow/specs/section-8.md`, then the prior owner handoff
(`2026-07-27-section-8-devan-to-codex-implementation-remediate.md`), then
`PHASE10_STATE.json`.

Suggested order:

1. **E1** (`/` becomes the universe) — closes the scope hole; the owner has
   been evaluating the wrong page
2. **E2** (texture resolution) — the most visible quality gap, and the fix is
   well understood
3. **E3, E4** (labels, return-to-overview) — bounded defects
4. **E5** (Mission Control simplification)
5. **E6** (satellites, moons) — only if budget allows

Keep `npm test` and `npm run build` green, commit once as
`phase10(§8): <summary>`, and transition `stage` → `review`, `role` →
`claude_lead`, `next_actor` → `claude`. If the environment blocks live
verification again, preserve green work, document the gap plainly, and route to
Claude review — do not claim evidence that does not exist.
