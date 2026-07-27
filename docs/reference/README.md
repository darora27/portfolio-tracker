# §8 visual reference

Committed July 27, 2026 by owner direction, alongside `UNIVERSE_DIRECTION.md`
and `UNIVERSE_IDEAS.md`. These images exist because a written description of a
quality bar is much weaker than a picture of one — and "polished versus generic
low-poly" was the exact axis on which §7's first two prototypes were rejected.

**None of these are assets. All of them are references.** Nothing here ships.

---

## `planet-surface-mood-reference.jpg`

The owner's reference for planet surface quality (generated with ChatGPT, July
27, 2026; downscaled here from the 2.8 MB original — it is a mood board, not a
texture source).

**What it establishes:** the target for `UNIVERSE_IDEAS.md` §12 — a planet
should read as a *world belonging to that company*. Circuit-board continents,
glowing data-veins, structures built into the surface, atmospheric rim light,
a nebula behind it. Depth, detail, and deliberate art direction.

> ### This image must NOT be reproduced literally
>
> It contains a real logo and wordmark. `UNIVERSE_DIRECTION.md` §6 and
> `PHASE10.md` §8 both require planet surfaces to be **brand-evoking while
> reproducing no logos or wordmarks**, because `/share` is a public,
> resume-facing URL.
>
> Take from it: the *mood*, the density of detail, the lighting, the sense of
> an inhabited world. Do not take: the eye mark, the wordmark, or any literal
> corporate identity. The green circuit-world without the logo is the target.

---

## `concept-desktop-overview.png`

The OVERVIEW camera state with the full encoding system visible. Directly
useful as a layout and encoding reference.

**What it correctly demonstrates:**

- One planet per orbital ring, no overlap
- Planet size encoding weight; heavier holdings orbiting closer to the sun
- Always-visible ticker labels (no clicking required to identify a planet)
- Comet trails whose taper shows direction and whose colour shows sign —
  green for up, red for down
- The lock-on reticle bracketing a planet whose orbit has paused
- The asteroid belt carrying holdings 9+ as a labelled outer ring
- The sun carrying the portfolio name and percentage on its face

**Two cautions when reading it:**

1. The data is illustrative, not live. Encodings must be computed from real
   TWR-consistent returns.
2. Look at how close the largest planet sits to the sun. Because size encodes
   weight *and* the heaviest orbits innermost, the biggest planet crowds the
   sun — and the sun is the primary health indicator. This is a real
   composition risk to test early, and is likely to need a minimum
   sun-to-first-orbit clearance.

---

## `concept-sun-health-states.png`

Five sun states across the health range — Strong, Steady, Flat, Weak,
Struggling — with corona width, colour temperature, and drawdown sunspots
varying together. The "Weak" state is marked as today's real condition.

This is the most directly implementable reference in the folder: it gives
discrete, checkable targets for the health mapping in `UNIVERSE_IDEAS.md` §1.

Note that it demonstrates the principle that **down must not mean ugly.** The
weak and struggling states are art-directed at least as carefully as the strong
one, which matters because the portfolio's launch state is negative.

---

## `SUPERSEDED-concept-mobile-parade.png`

> ### Superseded — do not build this
>
> This mockup shows the mobile "parade" concept: a 3D scene on phones with
> planets rotating past the thumb zone and a bottom-sheet inspector.
>
> **The owner decided on July 27, 2026 that this product is desktop-first.**
> Mobile receives no new investment. Below 1024px, `/share` keeps its existing,
> already-tested fallback: zero WebGL, a genuinely reflowed semantic list,
> verified at 390px and 320px across three review turns.
>
> See `UNIVERSE_IDEAS.md` §7 and `PHASE10.md` §8's desktop-first acceptance
> criterion. Building a mobile 3D scene would invert an acceptance criterion
> that three separate reviews verified live, and would destroy the mitigation
> that keeps the planet-texture pipeline a desktop-only cost.
>
> It is retained only so the decision is legible, and because its bottom-sheet
> panel content is a reasonable reference for what a *selected holding* shows
> on desktop.
