# Product Direction — Portfolio Observatory

Status: Phase 10 planning authority

Owner: Devan

Primary showcase route: `/share`

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
| `/` | Give Devan a private daily briefing | What changed, why, and what deserves review? | Private dashboard, research, trades, and history |
| `/dashboard` | Turn the portfolio into a prioritized decision-review surface | How am I doing? Why? What deserves attention? | Metric calculations and holding-level evidence |
| `/compare` | Teach what three hypothetical portfolios reveal about the real one | What does each rule represent, and why did paths diverge? | Rules, rebalance events, calculations, and limitations |
| `/research` | Prioritize public evidence connected to held positions | What new information matters and why is it relevant? | Source items, filings, filters, freshness, and methodology |
| `/history` | Explain how portfolio behavior and composition evolved | What changed, when, and what event or flow explains it? | Snapshot rows and exports |
| `/trades` | Review decisions and their later portfolio effects while keeping entry reliable | What decisions were made, and what followed? | Trade detail, linked performance windows, and export |
| `/stock/[ticker]` | Explain one holding's role in the portfolio | Why is this position here, how is it behaving, and what is its portfolio effect? | Fundamentals, research, correlation, and price history |
| `/share/full` | Transitional legacy public detail during Phase 10 | Where is the complete read-only dataset? | It should be reorganized or retired only through an explicit migration decision |

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
- No literal food language or imagery.
- No automatic audio.
- No essential content that exists only in WebGL, canvas, hover, motion, or
  color.
- No promise of pre-market or after-hours data before provider, exchange
  calendar, freshness, caching, and failure-state spikes pass.
- No production Three.js/React Three Fiber dependency before the isolated
  technical comparison and design selection.
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
