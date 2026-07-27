# Product Direction — Portfolio Observatory

Status: Phase 10 planning authority

Owner: Devan

Primary showcase route: `/share`

Owner amendment, July 27, 2026 (Phase 10 §8 round two): `/` now shares the
Stock Market Universe implementation with `/share` while preserving its owner
sign-in gate and identity-aware private Mission Control. The five-chapter
Observatory is retired from the root route as well as `/share`. Where this
older planning document describes either route as a five-chapter shell, the
owner amendment and `UNIVERSE_DIRECTION.md` supersede it. — recorded by
codex/gpt-5

## Authority

This document overrides Phase 9 visual choices for Phase 10 whenever they
conflict. Phase 9's security, privacy, authentication, public/private route
boundaries, financial-math conventions, source freshness, graceful-degradation,
and data-integrity rules remain binding. A visual or interaction decision never
overrides an honest number, a privacy boundary, or a reliability requirement.

Exact fonts, color values, motion curves, component mechanics, and the choice
between CSS 3D and a bounded WebGL layer remain open until the Phase 10
technical spikes are complete.

## Selected Phase 10 direction

Recorded July 23, 2026:

- **Structural base:** Field Journal.
- **Field Journal parts retained:** editorial market-relative lead,
  observation-plate chapter stack, evidence marginalia, and annotated
  divergence ribbon.
- **Night Orbit parts borrowed:** orbital chapter navigation, selected-body
  inspector, and static concentric fallback.

The orbit is the spatial index for the editorial plates, not a competing
navigation model. It should create a sense of vastness, space, and
extraterrestrial curiosity while the lead observation keeps the product firmly
aware of market and economic reality. The interface should feel singular and
human-authored, yet simple to understand.

## The Portfolio Orrery (owner decision, July 25, 2026)

This section supersedes the spatial-object model above wherever the two
conflict. Everything else in the selected direction — the editorial
market-relative lead, the observation-plate chapters, evidence marginalia, the
divergence ribbon, the selected-body inspector pattern, and the static
concentric fallback — remains in force.

### Why the change

Phase 10 §7's two spatial prototypes were built, measured, and photographed,
and Devan rejected both as production candidates
(`docs/phase10-spike-section-7/DECISION.md`). The CSS prototype read as a
clean dashboard placed on an infinite perspective grid rather than a detailed
spatial world, and its ellipses had no apparent meaning. The R3F prototype
read as low-quality generic spheres whose moving bodies had no understandable
portfolio purpose. Both failures are the same failure: **the spatial objects
carried no portfolio information**, which design principle 3 already forbids.
Neither prototype was selected, and the technically cleaner one was not
promoted by default.

### What the Orrery is

`/share` opens with a genuinely full-viewport portfolio solar system.

1. **The sun is the portfolio as a whole.** It never leads with, and never
   publicly reveals, total account dollar value. Activating it opens the
   portfolio-level summary: composition, return, and market-relative context.
2. **Each planet is one actual public-safe holding** — not an Observatory
   chapter, not a category, not a decorative body.
3. **Planet radius encodes portfolio weight** on a perceptually sensible,
   clamped scale. Larger positions must clearly produce larger planets; small
   holdings must remain visible and selectable.
4. **Orbit direction encodes trailing weekly performance:** positive return
   clockwise, negative return counterclockwise, unavailable or effectively
   flat a neutral, explicitly labelled behaviour.
5. **Orbital speed increases monotonically with the absolute weekly
   percentage change**, under safe minimum and maximum clamps. The mapping is
   deterministic, unit-tested, and explained by an on-screen legend. Direction
   and speed may never be the only accessible representation of performance.
6. **Orbital paths represent the planets' real trajectories.** No unexplained
   ellipses and no decorative geometric marks are permitted anywhere in the
   scene.
7. **Hovering, focusing, or selecting a planet pauses or stabilises it** so
   the interaction stays usable, and selecting it opens a semantic holding
   inspector: ticker and company, portfolio weight, weekly return,
   portfolio-relative performance context, public-safe holding analytics, and
   a link to deeper stock information. Inspector state is URL-restorable and
   works with browser back/forward.
8. **Every visual object encodes portfolio information or supports spatial
   orientation.** Generic low-poly placeholder spheres are replaced by a
   deliberate visual system: procedurally varied planet materials, an emissive
   sun, atmospheric rim lighting, meaningful orbital paths, depth, restrained
   bloom, and a coherent star field.

### Art direction — "portfolio command observatory"

Dark outer-space environment; 1980s CRT phosphor green and amber accents;
restrained scanline overlays; neon telemetry glow and analog-future HUD
framing; retrofuturist control-room typography and labels. Polished and
professional first, playful and experimental second. Translate the broad
qualities of classic space-opera control panels, optimistic atomic-age
futurism, and analog time-bureaucracy — never copying protected logos,
characters, props, or exact compositions.

### Runtime and resilience

React Three Fiber is the intended visually dominant desktop approach, with the
existing semantic DOM as the accessible source of truth and the CSS shell as
the no-WebGL and reduced-motion fallback. This authorisation is conditional,
not a blank cheque: R3F's measured 59–60 ms route-owned long task must be
genuinely optimised, not excused, and the 50 ms boundary is not to be weakened
or redefined. If one bounded optimisation round cannot bring it under the
gate, the measured result returns to Devan for an explicit decision — CSS is
not selected silently as a consolation.

Mobile uses a deliberate static or simplified 2D orbital map or list. Reduced
motion freezes orbital movement. Keyboard and screen-reader users receive a
synchronised semantic holding list and inspector. No essential information may
exist only in WebGL, motion, colour, speed, or direction.

### What the Orrery does not disturb

Dashboard, Research, History, Trades, Compare, and the stock routes remain
intact with their accepted functionality. The Orrery becomes the public
spatial entry point and the product's navigation signature; later integration
work may extend the same retro-space visual grammar into deeper routes without
replacing what those routes already do. All public/private and no-dollar
privacy rules are unchanged — no owner-only holding data may reach `/share`.

## Product purpose

Portfolio Observatory is a personal investing product that helps a person
understand:

1. how the portfolio is behaving relative to relevant markets;
2. what holdings, decisions, and exposures are driving that behavior;
3. what deserves attention without turning observation into advice; and
4. how the conclusions were calculated and where they are limited.

It is also a résumé artifact. The product should make Devan's product judgment,
frontend craft, data-science skill, and quantitative discipline visible in that
order. The account balance and returns are evidence used by the product, not the
product's identity.

The intended reaction is:

> This is an exceptionally well-made, resilient, creative product.

## Audiences

### Public visitor

A recruiter, designer, engineer, or friend arriving at `/share` with no context.
They need a useful, honest story in the first viewport, an obvious next place to
explore, and proof of technical depth only when they ask for it.

### Owner

Devan, returning frequently to answer practical questions: what changed, why,
what is unusual, what needs review, and what happened after a decision. Dollars
matter here, but not before the day's meaning is clear.

### Evaluator

A technical reviewer who wants to inspect the math, simulation rules,
freshness, limitations, accessibility, and failure handling. The product should
reward this scrutiny without imposing it on every visitor.

## Product personality

- Experimental and curious: exploration produces useful discoveries.
- Energetic and bold: the art direction has a point of view.
- Trustworthy: every claim is traceable to data, time, method, and limitations.
- Unconventional: the spatial system is part of navigation and reasoning, not a
  decorative object behind a conventional dashboard.
- Balanced: approximately 60% polished/professional and 40%
  playful/expressive.
- Dimensional: the interface feels like a floating observatory with layers and
  depth, while remaining complete as semantic two-dimensional content.

## Product promise

Within the first viewport, the product will tell a visitor:

- the portfolio's current market-relative story;
- the most important reason for that result;
- the freshness and scope of the evidence; and
- the next meaningful question they can open.

It will never make a weak result look strong, present a hypothetical result as
real, or use spectacle to obscure uncertainty.

## Design principles

### 1. Lead with meaning, not magnitude

Start with a useful sentence about behavior and cause. A return can support that
sentence; it should not stand alone as the page's identity. Total account value
is private utility, not a public hero.

### 2. One question per layer

Every chapter has one primary question, one dominant visual hierarchy, and one
clear continuation. Complexity is available through deliberate drill-in, not a
long stack of equally weighted cards.

### 3. Make dimensionality structural

The spatial system represents real chapters, relationships, or states. Every
body, plane, or node must map to a destination or data concept. If it can be
removed without changing navigation or comprehension, it is decoration and
does not qualify as the product signature.

### 4. Plain language opens the door; exact math remains nearby

Every expert metric begins with interpretation, then exposes definition,
current value, portfolio relevance, limitations, and calculation. The interface
does not assume the visitor already speaks finance.

### 5. Observation, not advice

The product describes evidence, comparisons, and uncertainty. It does not tell
the user what to buy, sell, or do. Research and simulations remain educational
and neutral.

### 6. Motion marks a change of mental model

Use one or two orchestrated motion moments: entering the Observatory and moving
between chapters or depth levels. Micro-interactions support state recognition;
they do not compete for attention. Reduced motion preserves the same hierarchy
and navigation without spatial travel.

### 7. Mobile is a deliberate mode

Desktop may be immersive. Mobile becomes a clear two-dimensional sequence with
the same questions, evidence, and controls. It is never a cropped scene, tiny
constellation, or horizontally scrolling desktop.

### 8. Reliability is visible craft

Freshness, stale data, unavailable sources, insufficient history, public/private
scope, and hypothetical inputs are designed states. The local-font strategy,
server cache, accessible fallback, and no-JavaScript reading order are part of
the product quality.

### 9. Negative performance remains legible

Weak or negative results receive the same type scale, contrast, context, and
explanatory care as positive results. Color supports meaning but never carries
it alone.

### 10. Distinctive does not mean unfamiliar everywhere

The top-level world may be expressive. Tables, forms, calculations, and critical
controls use familiar semantics. Discovery should feel pleasurable, not
cryptic.

## Information model

The product uses five progressive chapters. They are conceptual layers, not
necessarily five vertical scroll sections:

1. **Pulse** — How is the portfolio behaving relative to the market?
2. **Forces** — What holdings, flows, and market moves are driving it?
3. **Structure** — Where are concentration, correlation, and risk located?
4. **Timeline** — How did decisions, composition, cash flows, and important
   events evolve?
5. **Lab** — How do methods, simulations, calculations, and limitations change
   the interpretation?

A visitor can stop after any chapter and still leave with a complete answer to
that chapter's question. URLs, semantic navigation, focus, and browser history
must reflect chapter changes.

## Route jobs

| Route | Primary job | First question | Deepest useful continuation |
|---|---|---|---|
| `/share` | Create the strongest public first impression through an honest market-relative story | How is this portfolio behaving, and what is driving it? | Public methodology and selected read-only detail without dollars |
| `/` | Give Devan the owner-gated Stock Market Universe | What changed, why, and what deserves review? | Identity-aware Mission Control: private dashboard, research, trades, and history |
| `/dashboard` | Turn the portfolio into a prioritized decision-review surface | How am I doing? Why? What deserves attention? | Metric calculations and holding-level evidence |
| `/compare` | Teach what three hypothetical portfolios reveal about the real one | What does each rule represent, and why did paths diverge? | Rules, rebalance events, calculations, and limitations |
| `/research` | Prioritize public evidence connected to held positions | What new information matters and why is it relevant? | Source items, filings, filters, freshness, and methodology |
| `/history` | Explain how portfolio behavior and composition evolved | What changed, when, and what event or flow explains it? | Snapshot rows and exports |
| `/trades` | Review decisions and their later portfolio effects while keeping entry reliable | What decisions were made, and what followed? | Trade detail, linked performance windows, and export |
| `/stock/[ticker]` | Explain one holding's role in the portfolio | Why is this position here, how is it behaving, and what is its portfolio effect? | Fundamentals, research, correlation, and price history |
| `/share/full` | Transitional legacy public detail during Phase 10 | Where is the complete read-only dataset? | It should be reorganized or retired only through an explicit migration decision |

As of July 25, 2026, `/share`'s spatial entry point is the Portfolio Orrery
above: the full-viewport solar system a public visitor arrives in, whose sun
opens the portfolio-level summary and whose planets open individual public-safe
holdings. The route's job, first question, and no-dollar boundary are
unchanged.

## Decision hierarchy

When requirements conflict, decide in this order:

1. Security, privacy, authentication, and secret handling.
2. Financial correctness, data lineage, source freshness, and honest labeling.
3. The route's user question and usefulness.
4. Accessibility, keyboard/touch operation, reduced motion, and complete mobile
   behavior.
5. Product hierarchy and progressive disclosure.
6. Performance, resilience, and graceful fallback.
7. Distinctive art direction and dimensional delight.
8. Implementation convenience.

No decision lower in the list may weaken one above it.

## Content voice

- Start with a concrete observation: “The portfolio trails VOO by 4.6 points
  since inception.”
- Follow with the strongest supported cause: “Most of the shortfall came from
  IBM and INTC; MSFT offset part of it.”
- Name the window and source freshness.
- Separate fact from inference with explicit phrasing.
- Prefer short sentences and familiar words before metric labels.
- Use neutral verbs: trails, leads, contributed, moved, concentrated, changed,
  coincided, filed.
- Avoid imperatives and advisory language.

## Non-goals

- No account-value hero on `/share` or `/`.
- No attempt to make returns look better than they are.
- No brokerage, trading, or portfolio-recommendation behavior.
- No generic SaaS dashboard, card wall, purple gradient on white, glassmorphism
  kit, or context-free 3D decoration.
- No unexplained ellipses, rings, orbit paths, or geometric marks that no
  object travels and no legend explains (added July 25, 2026 — this is the
  specific failure that ended the §7 spike).
- No generic placeholder geometry standing in for portfolio meaning: a body in
  the scene either encodes portfolio information or supports spatial
  orientation, or it does not ship.
- No public exposure of total account dollar value, including via the
  Orrery's sun.
- No literal food language or imagery.
- No automatic audio.
- No essential content that exists only in WebGL, canvas, hover, motion, or
  color.
- No promise of pre-market or after-hours data before provider, exchange
  calendar, freshness, caching, and failure-state spikes pass.
- No production Three.js/React Three Fiber dependency before the isolated
  technical comparison and design selection. **Status, July 25, 2026:** the
  comparison is complete and recorded
  (`docs/phase10-spike-section-7/DECISION.md`); it produced no winner. R3F is
  authorised for §7's Portfolio Orrery remediation under the conditions in
  "Runtime and resilience" above — the unchanged 50 ms long-task gate and the
  owner-decision escape hatch — and nowhere else.
- No exact visual-token or font freeze during the planning pass.
- No rewrite of the proven financial math merely to support a new layout.
- No removal of advanced data; it moves to an appropriate layer.

## Success measures

### Comprehension

- A first-time visitor can state the market-relative result, main driver, data
  window, and next chapter after five seconds on `/share`.
- A novice can explain a selected expert metric after using its explanation
  interaction.
- A visitor can distinguish real, benchmark, and hypothetical results without
  reading fine print.

### Navigation

- Every top-level chapter is reachable by click, keyboard, touch, and a stable
  URL state.
- Returning from a drill-in restores the prior chapter and focus.
- The same task is complete at 390px without horizontal page overflow.

### Craft

- The Observatory is recognizable when shown without the logo, but all
  essential information survives with 3D, motion, and JavaScript disabled.
- Before-and-after screenshots show a clear hierarchy improvement on every
  UI-bearing slice.
- No production build depends on a live Google Fonts fetch.

### Trust

- Every data-bearing view exposes freshness and important limitations.
- Privacy tests prove no dollar amounts or owner-only research/simulation data
  leak into public routes.
- Tests and production build are green before every implementation commit.
