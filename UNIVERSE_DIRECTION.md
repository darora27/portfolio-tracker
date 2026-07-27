# The Stock Market Universe — creative direction brief

Owner: Devan. Written July 27, 2026.

**Status:** owner direction change. This supersedes `PRODUCT_DIRECTION.md`'s
framing of `/share` and makes Phase 10 §8–§13 obsolete as specified. The phase
renumbering and workflow restructure are a separate decision and are NOT
resolved by this document.

**Purpose of this document:** to brief a creative collaborator (human or model)
well enough that they can generate strong ideas without having seen the
project. It states the vision, the honest inventory of what exists, the
problems that must be solved, the constraints that cannot move, and — most
importantly — the questions that are deliberately left open for ideas.

---

## 1. The pivot, in one paragraph

This began as an investment portfolio tracker: a rigorous finance tool with
correct performance math and a well-structured dashboard. That part works and
is not in question. The direction change is that **the product is now a
creative project first and a finance project second.** The numbers stay
correct and stay available — but the way you meet the portfolio should be a
place you explore, not a report you read.

## 2. The vision

**The metaphor: a stock market universe.**

- A **solar system** is a portfolio.
- A **sun** is the portfolio as a whole.
- A **planet** is an individual holding.
- A **galaxy** contains many solar systems — other portfolios, ETFs, mutual
  funds, other investors. *(Deliberately out of v1 scope. See §5.)*

### The sun

- Represents the total portfolio.
- **Its appearance conveys portfolio health.** When the portfolio is down, the
  sun should read as visibly *weaker* — dimmer, cooler, struggling. When it's
  strong, it should read as strong. This must be legible at a glance, without
  reading a number.
- The portfolio name and the current percentage change appear on or around
  the sun itself.
- **Clicking the sun opens the full dashboard** — the complete technical
  breakdown. This replaces every other navigation route into the analysis.

### The planets

- One per holding, **top 8 by portfolio weight only.** Holdings outside the top
  8 are represented some other way (see open questions).
- **Every planet is visibly labeled with its ticker.** The user must never have
  to click a planet to find out what it is.
- **Each planet's surface represents its company.** Not decorative noise —
  a recognizable world. The reference image the owner generated: NVIDIA as a
  dark green circuit-board planet, glowing lime data-veins running across
  continents of chip architecture, city-structures built into the surface,
  green nebula behind it. That is the target quality and mood.
- **Orbit speed** encodes performance over the past week.
- **Axial spin** encodes performance over the current day.
- **Orbit direction** encodes up vs. down — and must be far easier to read at a
  glance than it currently is.
- **Planets must never overlap each other**, and all of them must be visible.

### Selecting a planet

- Click a planet and the camera **zooms into it.**
- The planet rotates on the **left** of the screen; its information sits on the
  **right**.
- Content: performance over time, and quick access to relevant news.

### The mood

**Youthful, retrofuturistic, techy.** Playful is welcome. This is not a
Bloomberg terminal and should not feel like one.

---

## 3. Honest inventory: what exists today

The project is real and substantially built. 8 of 14 planned redesign sections
are complete, 457 tests pass, and it deploys.

### Keep — this is the foundation, not legacy debt

| Asset | Why it matters here |
|---|---|
| **Financial math core** | TWR, XIRR, drawdown, volatility, beta, Sharpe — all pure functions, unit-tested against hand-computed fixtures. Orbits encode *real, correct* returns. |
| **The dashboard** | The owner explicitly wants this kept. It is what the sun opens. |
| **Data layer** | Supabase Postgres, daily snapshot job, trade log, Finnhub integration, CSV import. |
| **three.js foundation** | Already a real dependency (`three@0.185.1`), rendering the current scene. |
| **Performance work** | A route-owned long task was driven from 60ms to **zero** over three rounds. That headroom is what makes textured planets affordable. |
| **Public-safe projection** | `/share` provably leaks no dollar amounts or owner-only fields. Tested with canary values. |
| **Accessibility scaffolding** | Semantic DOM, keyboard operation, URL state, reduced-motion and no-WebGL fallbacks. |

### Discard

- The five-chapter `/share` structure — **Pulse, Forces, Structure, Timeline,
  Lab.** The owner's verdict: with the sun opening the dashboard directly,
  this navigation layer is unnecessary ceremony.
- **The useful analysis inside those chapters is NOT discarded** —
  concentration, correlation, contribution ranking, the market-relative
  summary sentence — it folds into the dashboard the sun opens.
- The current planet surfaces (procedural wave patterns generated from a
  holding's array index — decorative, meaningless).
- The session-scoped entrance animation, pending review.

---

## 4. Problems in the current build that must be solved

Every one of these was observed live by the owner and independently confirmed.

1. **You cannot click a moving target.** Planets orbit continuously; trying to
   click one means chasing it. This is the deepest problem in the set — it is
   an interaction-model failure, not a bug, and polish will not fix it.
2. **No zoom control.** Outer planets are clipped by the viewport. There is no
   way to see the whole system.
3. **Planets overlap** and bunch near the sun. Orbits are far too small.
4. **No labels.** You cannot tell which planet is which stock without clicking.
5. **It reads as 2D.** Flat-shaded circles moving in a plane, not spheres in
   space.
6. **The side panel is crowded** — 13 dense entries, four data points each.
7. **Too much text overall.** It suppresses the desire to read anything.
8. **Orbit direction is hard to perceive.** Owner's own suggestion, offered as
   a starting point rather than a requirement: color the orbit rings on a
   red→green gradient by performance.
9. **The encoding legend is always on screen.** It should be summonable and
   dismissable.

---

## 5. Scope of version one

**One solar system, executed excellently.** The owner's portfolio, rendered as
a universe worth looking at.

The **galaxy** — multiple solar systems, other investors, ETFs, mutual funds —
is the next phase. It is a genuine part of the vision and should be designed
*toward*, but it introduces new data sourcing and a whole navigation layer, and
it should not delay a first version that proves the hard parts.

---

## 6. Fixed constraints

Ideas that violate these are not usable.

- **The math is correct and must stay correct.** Visual encodings read from
  real computed returns. No fudging values to make the picture nicer.
- **`/share` is public and must never expose dollar amounts** or owner-only
  fields. This is enforced by tests using canary values.
- **Desktop-first — owner decision, July 27, 2026.** The universe is a desktop
  experience. Phones receive **no new investment**: below 1024px the route
  keeps the existing, already-tested fallback — zero WebGL, a genuinely
  reflowed semantic list carrying every encoded value as text. That fallback
  is built and has passed live verification at 390px and 320px across three
  review turns, so keeping it costs nothing and removing it would cost effort.
  Do not build a mobile 3D scene. This also keeps the entire planet-texture
  pipeline a desktop-only cost, since phones never enter the WebGL path.
- **Desktop-first does not mean dropping accessibility.** Keyboard operation,
  screen-reader support, the semantic DOM as source of truth, reduced-motion
  handling, and the no-WebGL fallback all remain required on desktop. These are
  independent of viewport width.
- **Non-WebGL and reduced-motion fallbacks are required.** No essential
  information may exist only in motion, colour, speed, or direction.
- **Performance budget is real.** Route-owned long tasks must stay under 50ms.
  Eight high-resolution planet textures threaten this directly and need
  compression (KTX2/Basis) and a loading strategy.
- **Stack:** Next.js 16 (App Router), TypeScript, Tailwind v4, React 19,
  three.js, Supabase Postgres, Vercel. Recharts for 2D charts.
- **Brand-inspired, not literal.** Planet surfaces should evoke each company's
  world without reproducing actual logos or wordmarks — this is a
  publicly-shared, resume-facing URL.

---

## 7. Technical note on planet surfaces

The reference NVIDIA image is a **static 2D AI render**, not a 3D asset. The
path to that look in real-time 3D:

1. Generate an **equirectangular** texture per ticker (2:1 aspect — a square
   image warps badly when wrapped on a sphere).
2. Map it onto a sphere in three.js. This is core functionality; **no new
   library is required.**
3. Add an **emissive map** so glowing features actually emit light, and a
   **normal map** for surface relief. These are what sell "sphere in space"
   over "circle on screen."
4. Compress to KTX2/Basis and load progressively.

The requirement is an **asset pipeline**, not new software. Cost is a few
dollars of image generation per ticker, generated once and cached.

---

## 8. Open questions — where ideas are wanted

These are deliberately unresolved. Strong, specific, opinionated proposals are
the point of this brief.

1. **How does a "weaker" sun read?** Colour temperature? Corona size? Pulse
   rate? Surface activity? The owner floated facial expressions — how far
   should personification go before it undercuts credibility?
2. **How do you click a moving target?** Pause on approach, magnetic hit
   areas, click the label rather than the body, freeze-on-hover, or something
   else entirely?
3. **How is orbit direction made obvious at a glance** without adding clutter?
4. **What happens to holdings 9 through 13?** An asteroid belt? A moon system?
   A distant ring? Something non-spatial?
5. **How does the camera work?** Free orbit, fixed vantage points, guided
   travel? How do you get an overview and then get back?
6. **What does the planet zoom-in feel like?** It is the signature moment of
   the product.
7. ~~What is the universe on a 390px phone?~~ **Closed by owner decision,
   July 27, 2026** — desktop-first; phones keep the existing tested 2D
   fallback unchanged. No longer an open question.
8. **How does retrofuturist CRT/HUD framing coexist with "too much text"?**
9. **Where does the dashboard live relative to the universe?** Overlay, panel,
   separate route, or something that preserves the sense of place?
10. **How does a first-time visitor understand the encoding** without a
    permanent legend?

---

## 9. What good looks like

A friend opens the link on a laptop. Within seconds they can tell whether the
portfolio is doing well — from the sun alone. They recognise a company from
its planet before reading the label. They click it, travel to it, and learn
something real. They come back later because it is a place, not a report.

If they open it on a phone instead, they get a clean, fast, readable page that
tells them the same things in words — not a struggling scene.

And every number underneath it is correct.
