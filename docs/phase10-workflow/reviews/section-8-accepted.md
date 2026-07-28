# Phase 10 §8 — acceptance record

Accepted by: `claude-code/opus-5` (Claude Lead, `accept` stage), July 28, 2026.

## Result: ACCEPTED

The latest and authoritative review for §8 is
`docs/phase10-workflow/reviews/section-8-review-6.md`, which recorded
**PASS with 0 findings**. It confirmed review-5's single bounded finding
(OVERVIEW orbit-ring/trail materials darkened to illegibility by
`scene.fog`) fixed at source and live, using the same RGB pixel-sampling
methodology that originally caught the regression. Zero findings remain
across every round.

This acceptance turn read the actual latest review doc, not the first one —
§8 ran six review rounds (`section-8-review.md`,
`section-8-review-2.md` … `section-8-review-6.md`), and only the sixth is
authoritative.

## Verification re-run at acceptance

Both commands were re-run independently by this acceptance turn, on the
accepted commit itself, not carried over from a prior turn's claim:

- `npm test`: 87 test files passed; **474 of 474 tests passed** (vitest
  4.1.10).
- `npm run build`: Next.js 16.2.11 (Turbopack) production build compiled
  successfully; TypeScript passed; 18 page-generation tasks completed; 24
  route entries emitted, with `/` and `/share` both still dynamic
  (server-rendered on demand).

## Accepted commit

`6a68758d57474f5494ff2ce38056ebb37b5aa244` —
`owner: insert §9 Universe craft and depth, renumber §10-§15`

Recorded via `git log -1 --format=%H` against the clean tree this
acceptance turn started from, per Trap B in §1 of
`docs/phase10-workflow/IMPLEMENTATION_SPEC.md`; this is the immediately
preceding actor's commit, never this turn's own.

**Why the accepted commit is the owner's amendment rather than the
reviewed commit.** Review 6 passed at
`e6859e1f0a35a6667f650b67c1957bb386cfcbf9`
(`phase10(§8): remediate overview trail fog`). Devan then committed
`6a68758` on top of it, inserting the new §9 into `PHASE10.md`, renumbering
§10–§15, and widening the validator's section bounds. That commit changes
**no application source**: `git diff --stat e6859e1 HEAD -- src public
package.json package-lock.json` is empty, and the only non-documentation
file it touches is `scripts/phase10-validate-state.mjs` (section-bound
regex and completion check). The reviewed implementation and the accepted
tree are therefore byte-identical under `src/` and `public/`, and the
tests/build re-run above was performed on `6a68758` itself.

## Section summary

§8 replaced the five-chapter Field Journal `/share` with an explorable
stock-market universe — solar system as portfolio, sun as the portfolio
whole, planet as holding — after an owner direction change from a
finance-first product to a creative-first one. The retained chapter
analysis was not discarded; it moved into Mission Control, the dashboard
the sun opens.

The section ran unusually long: one implementation round, six review
rounds, five remediation rounds, and three separate rounds of owner live
review. Substantive defects found and resolved along the way:

- **Privacy (severe):** `/share` leaked full owner-only Mission Control
  content, including exact dollar amounts, to any browser carrying a valid
  owner session cookie — `UniverseRoute.tsx`'s owner-content branch
  checked only `authenticated`, never `ownerGate`. Fixed in `c2485af`,
  verified live in review 4.
- **Textures (severe):** the build pipeline downsampled authored 512×256
  equirectangular plates to 112×56, destroying every recognizable feature.
  Root cause was a byte budget forcing postage-stamp resolution. Fixed by
  shipping at native 512×256 (24 KTX2 maps, 3,424,390 bytes total) with a
  dimension assertion and a re-measured 50 ms long-task gate.
- **Trail legibility (severe, twice):** orbit rings and comet trails —
  the only encoding of orbit direction, i.e. weekly return sign — were
  first too faint and then, after an opacity-only fix, darkened to
  invisibility by `scene.fog` while the planet body's `ShaderMaterial` was
  already fog-exempt. Fixed in `e6859e1` with `fog: false` on both
  `MeshBasicMaterial` instances.
- Plus: desktop `?no3d=1`/reduced-motion blank page, header identity text,
  Systems Manual / return-control click overlap, planet–orbit intersection
  at close range, unreliable return-to-OVERVIEW, unclickable belt objects,
  missing sun hover affordance, and label scrims hiding the textures.

Standing gates all hold at acceptance: route-owned long task 0 ms across 5
fresh contexts (1440×900, CPU 2×), `canvas` count 0 with no horizontal
overflow at 390×844 and 320×844, and the public-surface canary tests
green.

### Carried forward into §9, deliberately not closed here

- **D1** — the owner's report of a green trail on a holding down for the
  week was never reproduced; source mapping is correct and every committed
  screenshot matched. Most likely day-vs-week confusion (panels show both
  TODAY and TRAILING WEEK; the trail encodes the week). **Do not change
  colour logic until a contradicting ticker is named**; if one is named,
  treat it as severe.
- **D2** — "website is still relatively confusing," recorded verbatim and
  deliberately not actioned in §8 as too general to bound without
  unscoped change. §9's craft work is the natural place for it to be
  answered concretely.
- The round-two creative scope (texture regeneration, overview
  composition, Mission Control as an operations room, planet detail view,
  moons, satellites, sector map, sun hover state) was explicitly held out
  of §8's remediation and is now §9, per
  `PHASE10_STATE.json`'s `roadmap_amendment_2`.

## History not superseded by this record

`docs/phase10-workflow/specs/section-8.md`,
`docs/phase10-workflow/reviews/section-8-review.md` through
`section-8-review-6.md`, the evidence under
`docs/phase10-baseline/section-8/`, `UNIVERSE_DIRECTION.md`,
`UNIVERSE_IDEAS.md`, and this section's handoff docs under
`docs/phase10-handoffs/` all remain authoritative for their own subjects.
Nothing above rewrites them.
