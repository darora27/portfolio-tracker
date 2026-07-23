# Field Journal

## Rationale

Field Journal treats the portfolio as a set of observations rather than a
machine full of metrics. A decisive editorial sentence leads, a single evidence
plate proves it, and marginal notes explain why it matters. Five layered
observation plates provide dimensional navigation without asking a recruiter to
decode a spatial scene.

This option is the most polished/professional of the three. Its playfulness
comes from composition, numbered plates, depth, and annotation—not from a
literal orbit.

## Typography approach

- A distinctive editorial serif or sharp contemporary roman for the lead.
- A compact neo-grotesk for navigation and explanations.
- Mono values and timestamps as instrument annotations.
- Deliberate contrast between oversized editorial language and small precise
  evidence labels.

Exact families remain open. The mockup uses local system fallbacks.

## Color and atmosphere

- Charcoal-black paper, ink-like warm white, oxidized green/cyan evidence, and a
  small rust/coral loss signal.
- Soft edge light and translucent “observation plates” create depth.
- Very little glow; atmosphere comes from layered material and faint grain/grid.

Mockup values are illustrative, not production tokens.

## Navigation and disclosure model

- Five numbered plates: Observation, Drivers, Structure, History, Method.
- The active plate is frontmost; the edges of deeper plates remain visible.
- A horizontal index and previous/next controls make the model explicit.
- Each plate contains one finding, one evidence visual, and optional marginalia.
- Advanced formulas open from Method rather than appearing beside the lead.

## Dimensional treatment

- Depth comes from stacked translucent planes, edge offsets, crop marks, and
  controlled overlap.
- The “orrery” becomes an observation instrument: each layer is a lens on the
  same portfolio.
- All content stays in semantic DOM; CSS transforms can supply the full effect.

## Motion plan

1. One entry moment slides the first plate into focus and draws the evidence
   line.
2. Chapter changes lift the next plate forward with a short depth shift.

No ambient motion or pointer parallax is needed.

## Mobile adaptation

- Flatten the plate stack into a numbered chapter strip and one active article.
- Preserve the editorial lead and one evidence ribbon within the first screen.
- Move marginal notes below the primary visual in source order.
- Use inline disclosures for method and limitations.

## Accessibility fallback

- The enhanced plate stack is a semantic tablist or navigation plus article.
- Without transforms, it renders as a dark editorial page with numbered links.
- Reduced motion replaces plate movement with a short crossfade.
- Type remains readable at zoom; annotations are not the only place a fact
  appears.

## Technical risk

Low to medium. It is achievable with DOM/CSS and has the simplest fallback.
Primary risk is product, not rendering: if depth is too subtle it may feel like
a beautiful report rather than a spatial Observatory. The chosen implementation
must keep the layered navigation visible and tactile.

## Resume-showcase strengths

- Best demonstration of product writing, hierarchy, restraint, and
  information-design judgment.
- Fastest comprehension for a context-free recruiter.
- Lower technical risk leaves more time for exceptional metric explanations,
  responsive detail, and reliability.

## What the mockup is testing

- Can a strong sentence make weak performance interesting and trustworthy?
- Is layered editorial depth enough to express Devan's personality?
- Does evidence remain more memorable than the isolated return?
- Is the phone composition clearly authored rather than collapsed?
