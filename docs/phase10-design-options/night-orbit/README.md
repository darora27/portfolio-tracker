# Night Orbit

## Rationale

Night Orbit makes the Portfolio Observatory literal in structure but not in
theme-park imagery. The portfolio's market-relative pulse occupies the center
of a five-body navigation system. Each labeled body opens a question-led
chapter; the spatial composition is therefore navigation, progress, and
storytelling at once.

This is the strongest answer to Devan's desire to feel as though he is entering
a floating world. It also demands the strictest discipline: the orrery must
remain bounded, semantic, and subordinate to comprehension.

## Typography approach

- A characterful condensed or slightly industrial display face for the main
  observation.
- A highly legible grotesk for narrative and controls.
- A mono face only for values, timestamps, and method labels.
- Sharp scale contrast: large sentence, compact instrument text, minimal middle
  sizes.

Exact families remain open. The mockup uses local system fallbacks.

## Color and atmosphere

- Near-black blue space with faint orbital grid lines and a cool horizon glow.
- Bone-white primary copy.
- One electric chart/navigation signal plus a restrained warm warning signal.
- Gains/losses keep accessible semantic treatments and text labels; the
  atmospheric accent never replaces them.

Mockup values are illustrative, not production tokens.

## Navigation and disclosure model

- Five named orbital bodies: Pulse, Forces, Structure, Timeline, Lab.
- A persistent semantic chapter rail mirrors the bodies and exposes selected
  state.
- One selected body controls the main observation and the next question.
- Direct URL state, browser history, and real buttons are required.
- The page does not scroll through all five chapters by default.

## Dimensional treatment

- Concentric planes and bounded bodies create an orrery centered on the current
  pulse.
- Depth communicates chapter distance: Pulse is nearest, Lab is deepest.
- Data trajectories can bend around the central field but remain readable as
  normal charts.
- The 3D layer duplicates no essential copy or control.

## Motion plan

1. One entry descent assembles the five bodies and resolves the lead sentence.
2. Chapter change rotates/reframes the selected body and crossfades the primary
   evidence.

No perpetual decorative rotation is required. Pointer parallax, if used, is
minor and never needed to find a control.

## Mobile adaptation

- Replace the navigable 3D scene with a static concentric map and a normal
  two-column chapter list.
- Put the market-relative lead first, trajectory second, and selected chapter
  action third.
- Keep the same URL state and labels.
- No drag gesture, miniature orbit labels, or horizontal scene pan.

## Accessibility fallback

- Server-render the lead and chapter navigation before enhancement.
- Mirror the scene with real labeled buttons and `aria-current` or
  `aria-selected`.
- Reduced motion renders a static arrangement and 150ms-or-less content
  replacement.
- WebGL/CSS 3D failure falls back to the same dark 2D chapter map.
- Charts have a text takeaway and data alternative.

## Technical risk

Medium to high. CSS 3D can express the rings and bounded planes, but a richer
camera transition may justify a tightly scoped R3F layer. The Phase 10 spike
must compare both. Risk concentrates in focus synchronization, responsive
simplification, GPU/compositing cost, and preventing spectacle from outranking
the story.

## Resume-showcase strengths

- Most distinctive and memorable first impression.
- Demonstrates spatial information architecture, progressive enhancement,
  fallback design, motion restraint, and performance judgment.
- Makes the chosen product metaphor visible without hiding the quantitative
  evidence.

## What the mockup is testing

- Can a negative result lead confidently when expressed as a useful comparison?
- Does the orrery feel like navigation rather than decoration?
- Can the first viewport remain legible while feeling like a world?
- Does the mobile fallback still feel intentional?
