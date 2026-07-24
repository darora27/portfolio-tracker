---
name: portfolio-ux
description: Product and frontend direction for Portfolio Observatory. Use before specifying, implementing, or reviewing any user-facing route, component, interaction, responsive state, visualization, copy hierarchy, or motion in Phase 10.
---

# Portfolio Observatory UX

Use this skill to turn Devan's product taste into concrete frontend decisions.
It supplements, but never overrides, `PRODUCT_DIRECTION.md`, `PHASE10.md`,
`docs/PHASE10_UX_ARCHITECTURE.md`, security/privacy rules, financial
correctness, or the current section specification.

## Desired reaction

The work should make a recruiter or technical evaluator think:

> This is an exceptionally well-made, resilient, creative product.

Show product judgment and frontend craft first, then data-science and
quantitative depth. The portfolio's balance and returns are evidence, not the
product's identity.

## Personality and aesthetic

- Experimental, curious, energetic, bold, and unconventional.
- Approximately 60% polished/professional and 40% playful/expressive.
- Dark, atmospheric, dimensional, and spatial: a floating observatory rather
  than a generic finance dashboard.
- The structural language combines an editorial field journal with restrained
  orbital navigation.
- Discovery should feel rewarding, but essential tasks must remain obvious.
- Preserve the accepted visual system and tokens. Do not restyle completed
  surfaces merely to demonstrate creativity.

## The five-course principle

Treat progressive disclosure like a meal a visitor may stop after at any
course. Do not use food language or imagery in the interface.

For each active chapter or route layer:

1. Answer one primary user question.
2. Lead with one plain-language observation.
3. Show one dominant visual or interaction.
4. Offer no more than three first-layer supporting facts.
5. Provide one clear continuation into deeper evidence.
6. Put expert detail, definitions, tables, and calculations behind deliberate
   drill-in or disclosure.

A visitor who stops at the first layer should still leave with a complete,
useful answer. Advanced information remains available; it is reorganized, not
deleted.

## Meaning before metrics

- Start with behavior, cause, window, and freshness.
- Never lead `/share` or `/` with account value or an isolated giant KPI.
- Explain expert metrics before assuming financial vocabulary.
- For Sharpe, Sortino, Beta, volatility, drawdown, HHI, correlation, or similar
  concepts, expose: plain-language meaning, current value, portfolio relevance,
  limitations, and calculation.
- Negative performance receives the same clarity and visual care as positive
  performance. Never disguise weak results.
- Describe evidence neutrally. Do not provide investment advice.

## Dimensionality with purpose

- Spatial bodies, depth, planes, and motion must represent real chapters,
  relationships, data states, or navigation.
- If a 3D element can disappear without changing comprehension or navigation,
  it is decoration and should be removed or given a real job.
- Prefer resilient CSS-based dimensionality unless an accepted technical
  decision authorizes something heavier.
- Use one or two orchestrated motion moments for entering or changing mental
  models. Avoid constant floating motion and scattered animation noise.
- Reduced-motion and no-JavaScript modes must preserve hierarchy, facts,
  destinations, and focus behavior.

## Visual craft

- Avoid generic AI defaults: card walls, evenly weighted dashboard stacks,
  glassmorphism kits, timid palettes, purple gradients on white, default SaaS
  layouts, and interchangeable hero sections.
- Typography should feel intentional and editorial. Do not introduce Inter,
  Roboto, Arial, Space Grotesk, or a live build-time font dependency.
- Use dominant dark surfaces, controlled contrast, atmospheric depth, and
  sharp restrained accents. Do not distribute accent colors everywhere.
- Prefer composition, spacing, type scale, and depth over extra borders,
  containers, badges, or decorative widgets.
- Every visualization needs an adjacent takeaway and an accessible text or
  table path.

## Desktop and mobile

Desktop may feel immersive, but it should still present one primary stage and
one active question.

At 390px:

- Convert the spatial world into an intentional two-dimensional sequence.
- Keep the same question, evidence, and controls; never crop the desktop scene.
- No horizontal page overflow, miniature labels, drag-only navigation,
  fixed-height text, or controls smaller than 44×44 CSS pixels.
- Preserve semantic source order: lead, visual, facts, explanation,
  continuation.
- The first viewport should contain a useful answer and an obvious next step
  whenever the section specification requires it.

## Copy

- Write short, concrete sentences using familiar words before technical labels.
- Prefer neutral verbs such as trails, leads, contributed, moved,
  concentrated, changed, coincided, and filed.
- Separate measured fact from inference and name uncertainty explicitly.
- Show data windows, freshness, unavailable sources, insufficient history,
  public/private scope, and hypothetical status as designed states.
- Avoid hype, vague praise, imperative advice, and finance jargon without
  explanation.

## How to apply this skill

### During specification

- Convert these principles into exact, section-specific, testable acceptance
  criteria.
- State the first-viewport hierarchy, dominant visual, continuation, desktop
  behavior, 390px behavior, fallback, and evidence requirements.
- Name what existing information moves behind disclosure and what remains
  unchanged.
- Require real screenshots and live keyboard/mobile checks for UI-bearing
  work.
- Keep scope to the smallest complete vertical slice assigned by
  `PHASE10.md`.

### During implementation

- Reuse accepted primitives and the established visual language before adding
  components or dependencies.
- Build semantic HTML first; layer visual depth on top.
- Keep financial calculations in existing tested libraries.
- Verify the actual rendered hierarchy at desktop and 390px, not only source
  code or unit tests.

### During review

- Judge only requirements already authorized by the section specification and
  binding product documents.
- Do not turn this skill into new advisory findings or expand a bounded review.
- Verify screenshots, hierarchy, overflow, target sizes, keyboard operation,
  reduced motion/fallback, privacy, tests, and build with real evidence.

## Gotchas

- More information is not more useful.
- A long page divided into cards is still a long wall of information.
- A beautiful orbit that does not structure navigation is decoration.
- A chart without a takeaway and accessible data path is incomplete.
- A technically responsive page can still fail if it only shrinks desktop.
- An explanation hidden too deeply does not help a novice.
- Visual spectacle never outranks privacy, honest math, accessibility,
  resilience, or comprehension.
