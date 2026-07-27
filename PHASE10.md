# Phase 10 — Portfolio Observatory Product Realignment

Status: implementation active

Implementation status: §0–§6 accepted. §1 was accepted by Codex with an
explicit owner-approved exception to the absolute zero-long-task budget. The
50 ms classification boundary and all observed absolute tasks remain recorded;
for §1 only, the accepted gate is no attributable route-owned long task and no
route-owned client hydration. §2–§6 were accepted under the Claude-lead /
Codex-implementation workflow (accepted commits: `PHASE10_STATE.json`
`sections_history`). §7 (Spatial Observatory) is current, at the `specify`
stage.

Roadmap amendment (July 25, 2026, owner-directed): a new §7 "Spatial
Observatory" is inserted; the former §7 (`/compare` guided simulation story)
is renumbered to §8; the former §8 (after-hours capability spike) and former
§9 (conditional after-hours slice) are consolidated into one §9 that
preserves the capability gate and every reliability/privacy requirement;
§10–§13 keep their numbers and purposes. Accepted history (§0–§6) is
unchanged. Recorded by claude/fable-5 (cowork), directed by Devan.

Selected direction: Field Journal structural base with Night Orbit orbital
chapter navigation, selected-body inspector, and static concentric fallback

Primary authority: `PRODUCT_DIRECTION.md`

UX model: `docs/PHASE10_UX_ARCHITECTURE.md`

Agent workflow: `docs/PHASE10_AGENT_WORKFLOW.md`

## Ground rules

1. Phase 10 does not begin until Devan records the §0 direction choice.
2. `PRODUCT_DIRECTION.md` overrides Phase 9 visual choices when they conflict.
   Phase 9 security, privacy, financial correctness, data integrity, public
   route boundaries, caching, and graceful-failure rules remain binding.
3. Work sections in order. Each implementation section follows:
   Claude Builder → Codex Critic → Claude Refiner when needed → Codex
   acceptance review.
4. No section advances if any workflow scorecard category fails.
5. One accepted vertical slice per implementation section; commit with
   `phase10(§N): <summary>`.
6. `npm test` and `npm run build` must be green before every implementation
   commit. Existing tests remain the spec for existing behavior.
7. Capture before-and-after screenshots at 1440×900 and 390×844 for every
   UI-bearing section. Record the real paths in the handoff state.
8. Never claim a visual, browser, mobile, accessibility, or fallback check that
   was not performed.
9. Never run concurrently with another coding agent against this repository.
10. Never read, print, edit, stage, or commit `.env*` files or secrets. Never
    run `vercel --prod`.
11. No new public route or public data field without a privacy decision and
    regression test. New routes remain owner-gated by default.
12. No production Three.js/React Three Fiber dependency before the §0
    selection and §1 technical spike pass. Amended July 25, 2026: §7
    (Spatial Observatory) reopens this choice for its own scope — a bounded
    production WebGL/R3F layer is allowed only if §7's own recorded spike
    decision selects it under §7's gates. §1's recorded CSS 3D decision and
    evidence remain accepted history.
13. No after-hours feature promise before the provider capability spike passes.
14. Use local/self-hosted fonts in production; the clean build must not depend
    on a live Google Fonts fetch.
15. Preserve advanced data by moving it to the correct layer. Do not delete
    correct analytics merely to create visual space.

## Required acceptance dimensions

Every section below includes:

- **Behavioral**
- **Visual**
- **Mobile**
- **Accessibility**
- **Tests**
- **Build**
- **Privacy**

For a non-UI spike, “Visual” means a state/content model or isolated prototype
review rather than production UI. For every UI section, the visual criteria
include real before/after screenshots.

---

## §0. Blocking design selection and baseline

### Purpose

Choose the Phase 10 direction, record any named combination, freeze a measured
baseline, and establish the state file. No later section may begin while the
selection record is blank.

### Required owner record

Copy and complete this block in `PHASE10_STATE.json` when implementation is
authorized:

```json
{
  "selected_direction": {
    "name": "Night Orbit | Field Journal | Signal Constellation",
    "recorded_by": "Devan",
    "recorded_at": "ISO-8601 timestamp",
    "combined_parts": [
      "Optional: exact named part from another direction"
    ]
  }
}
```

If Devan combines parts, one direction must remain the structural base. Record
parts by name, for example: “Night Orbit spatial chapter navigation + Field
Journal editorial lead.” “A mix of all three” is not actionable.

### Work

- Review the three options in `docs/phase10-design-options/index.md`.
- Record the choice; do not let an agent choose.
- Create the durable handoff state defined in the workflow.
- Capture current route baselines at 1440×900 and 390×844 for `/share`, `/`,
  `/dashboard`, `/compare`, `/research`, `/history`, and `/trades`.
- Record current test count, build result, relevant bundle/font behavior,
  browser console state, public dollar-leak checks, and route gating.
- Confirm no concurrent Claude/Codex process is active against the repository.

### Acceptance

- **Behavioral:** The selected direction and any borrowed parts are explicit;
  the state machine blocks §1 until recorded; all route baselines are linked.
- **Visual:** Devan selected from all three rendered desktop/mobile options;
  current production screenshots exist for comparison; no production UI
  changed.
- **Mobile:** Baselines include a real 390×844 viewport and page-overflow
  results for every named route.
- **Accessibility:** Baseline records keyboard chapter/navigation behavior,
  focus visibility, reduced-motion state, and known issues.
- **Tests:** Full existing suite passes and the count is recorded.
- **Build:** Clean production build passes and its Google Fonts/network
  dependency behavior is recorded.
- **Privacy:** Logged-out gates and public-dollar leakage checks are recorded;
  no `.env*` access/output occurred.

**Blocking gate:** `selected_direction.name` is non-null and signed by Devan.

---

## §1. Selected direction technical spike and semantic shell

### Purpose

Prove the selected direction's spatial navigation with a complete semantic
fallback before production content is moved into it.

### Work

- Build isolated CSS 3D and bounded Three.js/R3F prototypes of the selected
  first viewport only, following the architecture spike limits.
- Do not add a production dependency during comparison.
- Measure bundle cost, load/interaction behavior, frame stability, memory,
  reduced motion, forced WebGL failure, no-JavaScript output, and representative
  phone behavior.
- Record the CSS-versus-R3F decision with evidence.
- Build the production semantic Observatory shell only after that decision:
  five chapters, URL state, focus restoration, public/private modes, freshness
  slot, and a complete 2D fallback.

### Acceptance

- **Behavioral:** All five chapter destinations work as real controls and stable
  URL states; back/forward and focus restoration work; no essential action
  depends on the spatial layer.
- **Visual:** The selected direction is recognizable in the isolated
  prototype; dimensional objects map to chapters; 1440×900 before/after
  evidence documents the decision.
- **Mobile:** 390×844 uses an intentional 2D chapter model with no miniature or
  cropped desktop scene; 320px also fits.
- **Accessibility:** Semantic navigation, current state, visible focus,
  reduced-motion, forced-no-3D, and screen-reader reading order pass.
- **Tests:** Unit/integration tests cover URL state, keyboard controls,
  reduced-motion, no-3D fallback, and public/private shell modes.
- **Build:** Production build is green; the chosen approach meets recorded
  performance/bundle budgets; unchosen spike code/dependencies are absent from
  production.
- **Privacy:** The shell contains no data by itself; public/private variants
  cannot cross-render owner controls or data.

---

## §2. `/share` Pulse vertical slice

### Purpose

Replace the current number-first public landing with the useful market-relative
story that anchors the résumé experience.

### Work

- Make Pulse the default public chapter.
- Lead with the same-period portfolio-versus-VOO story, main supported driver,
  window, freshness, and read-only state.
- Show one trajectory visual and one clear continuation to Forces.
- Preserve honest negative values and privacy-safe percentages.
- Provide a text/chart-data alternative.

### Acceptance

- **Behavioral:** A new visitor can identify result, benchmark gap, main driver,
  window, freshness, and next chapter from the first viewport; stale and
  insufficient-history states remain useful.
- **Visual:** No account value or isolated giant KPI leads; one story and one
  trajectory dominate; selected-direction depth structures navigation;
  1440×900 before/after screenshots pass critic review.
- **Mobile:** The same answer appears within the 390×844 first viewport with an
  intentional composition, no overflow, and no hidden continuation.
- **Accessibility:** One useful `h1`, semantic chart takeaway, keyboard/touch
  chapter action, visible focus, reduced-motion, and no-3D fallback pass.
- **Tests:** Copy thresholds, benchmark-gap calculation, driver selection,
  stale/empty states, chart alternative, and public privacy tests pass.
- **Build:** Full tests and production build pass with no new build-time network
  dependency.
- **Privacy:** No dollars, owner controls, private simulations, trade reasons,
  or research-only data appear in public HTML/RSC/client payloads.

---

## §3. `/share` Forces, Structure, Timeline, and Method chapters

### Purpose

Complete the public Observatory without turning it into a long dashboard.

### Work

- Forces: contribution and main drivers.
- Structure: concentration, top-two weight, correlation/exposure context.
- Timeline: public performance/composition/events with dollar-safe flow markers.
- Method: TWR, source freshness, limitations, and accessible calculation detail.
- Keep one active chapter on the primary stage.
- Decide, with privacy tests, whether `/share/full` remains a compatibility
  link, redirects to a chapter, or is retained temporarily.

### Acceptance

- **Behavioral:** Each chapter answers one named question and can stand alone;
  browser history/direct links work; advanced detail is explicitly disclosed.
- **Visual:** The four chapters share one coherent selected direction but use
  different dominant compositions; no card grid or mandatory long scroll;
  1440×900 before/after screenshots exist for every chapter.
- **Mobile:** Each chapter has a documented 390×844 composition and retains
  full data access without horizontal page overflow.
- **Accessibility:** Chapter changes announce useful context; focus restores;
  charts have text/data alternatives; controls do not rely on hover, drag,
  motion, or color.
- **Tests:** Chapter routing/state, fallback, dollar-safe flow markers,
  `/share/full` compatibility, reduced-motion, and public payload leakage are
  covered.
- **Build:** Full tests and production build pass; performance budgets remain
  within the §1 decision.
- **Privacy:** Only percentage/weight/public methodology data ships; aggregate
  timeline events cannot reconstruct private cash amounts or trade reasons.

---

## §4. Private `/` owner briefing

### Purpose

Create the private counterpart to `/share`: a daily briefing before owner
utilities.

### Work

- Default to “what changed / why / what deserves attention.”
- Reuse the Observatory chapters and selected spatial grammar.
- Add owner-only dollars, total value, and actions after the briefing.
- Show data-source degradation and stale states in priority order.
- Link attention items to the exact dashboard/research/history/trade detail.

### Acceptance

- **Behavioral:** The first view answers the three owner questions; total value
  is available but not dominant; attention links land in relevant context.
- **Visual:** The private view clearly belongs to the same product as `/share`;
  owner utility is subordinate; 1440×900 before/after screenshots pass.
- **Mobile:** Briefing, freshness, and first action fit coherently at 390×844;
  owner utilities are touch-safe and do not crowd chapter navigation.
- **Accessibility:** Attention priority is expressed in text, focus order is
  logical, live/stale states are announced without noisy updates, and all
  actions work by keyboard/touch.
- **Tests:** Authentication, private data, attention-priority rules, stale/error
  states, links, and public regression tests pass.
- **Build:** Full tests and production build pass.
- **Privacy:** Owner dollars/actions never render on `/share`; logged-out `/`
  still gates; client payloads contain no unnecessary server-only data.

---

## §5. Metric explainability primitive and core metrics

### Purpose

Make expert metrics understandable without diluting their mathematical meaning.

### Work

- Implement the content model in the UX architecture.
- Build a reusable click/keyboard/touch explanation disclosure.
- Cover TWR, XIRR, Beta, Sharpe, Sortino, volatility, max drawdown, HHI/top-two
  concentration, and alpha only if a tested alpha definition exists.
- Include definition, current value/window, interpretation, portfolio
  relevance, limitations, and optional calculation.
- Add direct-link and focus behavior.

### Acceptance

- **Behavioral:** Every listed metric exposes all six content layers and
  accurate current values; unavailable/short-history states explain why.
- **Visual:** Explanation reads as a guided layer, not a tooltip wall; current
  value and interpretation lead; 1440×900 before/after screenshots include one
  compact and one expanded state.
- **Mobile:** The complete explanation fits/reflows at 390×844 without clipped
  formulas or offscreen close controls.
- **Accessibility:** A visible labeled button works by click/Enter/Space/touch;
  `aria-expanded`, focus movement/return, heading structure, and escape/close
  behavior are correct; no hover-only content.
- **Tests:** Content-schema validation, portfolio-value fixtures, short-history
  limitations, interaction/focus behavior, mobile rendering, and banned
  advisory language pass.
- **Build:** Full tests and production build pass; explanations add no external
  runtime content dependency.
- **Privacy:** Public explanations expose only public values/windows; owner-only
  dollar inputs and calculation details remain gated.

---

## §6. `/dashboard` first-layer hierarchy

### Purpose

Replace the analytics wall with three prioritized questions while preserving
the complete toolset.

### Work

- Add top-level modes: How am I doing? Why? What deserves attention?
- Give each one a lead interpretation, one primary visual, up to three facts,
  and explicit deeper analytics.
- Group all existing components under Performance, Holdings, Risk, and Events.
- Add explainability from §5.
- Preserve live quote/freshness behavior.

### Acceptance

- **Behavioral:** The default dashboard answers all three questions through
  clear navigation; every current analytic has a discoverable home; mode state
  is linkable/restorable.
- **Visual:** One question dominates at a time; advanced analytics no longer
  appear as one uninterrupted stack; 1440×900 before/after screenshots cover
  all three modes.
- **Mobile:** 390×844 presents a usable mode switcher and one primary visual;
  tables/charts keep complete accessible alternatives and no page overflow.
- **Accessibility:** Modes use semantic tabs/navigation, visible current state,
  correct focus, text alternatives, reduced motion, and 200% zoom support.
- **Tests:** Mode routing, data parity with current dashboard, live/stale
  behavior, explainability, keyboard interactions, and regressions for every
  moved analytic pass.
- **Build:** Full tests and production build pass; no material client-bundle or
  server-latency regression without an approved budget exception.
- **Privacy:** Route remains owner-gated; no dashboard data appears in public
  caches or payloads; API keys remain server-only.

---

## §7. Spatial Observatory — the Portfolio Orrery

### Purpose

Turn the dimensionally styled interface into a visibly immersive, spatial,
floating-world desktop Observatory — entering a coherent world, with
camera-like movement, layered depth, and rewarding discovery — without
sacrificing the semantic, accessible, private, honest foundations §0–§6
built. The experiential reference remains `https://y-n10.com/`: the sense of
entering a world, camera-like movement, spatial composition, depth,
discovery, and memorable transitions. Its branding, assets, voxel language,
and exact design are explicitly not copied (see
`docs/PHASE10_UX_ARCHITECTURE.md` §1's reference note).

This section exists because the current interface, while dimensionally
styled, does not yet create that experience. More shadows, circles, cards,
or CSS transforms alone do not satisfy §7.

### Spike outcome and product-direction correction (July 25, 2026)

The Phase A spike ran to completion and produced **no winner**
(`docs/phase10-spike-section-7/DECISION.md`,
`docs/phase10-workflow/reviews/section-7-review.md`). Devan reviewed both
measured prototypes and rejected both as production candidates: the CSS
variant reads as a clean dashboard placed on an infinite perspective grid
with ellipses that have no apparent meaning; the R3F variant reads as
low-quality generic spheres whose moving bodies have no understandable
portfolio purpose. R3F additionally failed the reliability gate on measured
evidence (a route-owned 59–60 ms long task in 5 of 5 desktop runs, where the
baseline and CSS each produce zero) and shipped no pointer parallax at all.
CSS was **not** promoted by default for passing the technical gate — the
storytelling gate ranks equal to performance, and both variants failed it.

The target is therefore replaced. §7's spatial layer is no longer five
chapter-bodies in a field; it is the **Portfolio Orrery**, in which every
body encodes real portfolio information. The normative specification is
`docs/phase10-workflow/specs/section-7.md` §R; the product statement is
`PRODUCT_DIRECTION.md`, "The Portfolio Orrery"; the spatial model is
`docs/PHASE10_UX_ARCHITECTURE.md` §3.1.

### Portfolio Orrery terms (July 25, 2026, owner-defined)

1. `/share` opens with a genuinely full-viewport portfolio solar system.
2. The central sun represents the portfolio as a whole. It never leads with
   or publicly reveals total account dollar value. Activating the sun opens
   the portfolio-level summary: composition, return, and market-relative
   context.
3. Each planet represents one actual public-safe holding — not an Observatory
   chapter.
4. Planet radius encodes portfolio weight on a perceptually sensible, clamped
   scale, so small holdings remain visible and selectable while larger
   positions clearly produce larger planets.
5. Orbit direction encodes trailing weekly performance: positive clockwise,
   negative counterclockwise, unavailable or effectively flat a neutral,
   explicitly labelled behaviour.
6. Orbital speed increases monotonically with the absolute weekly percentage
   change, with safe minimum and maximum clamps. The mapping is
   deterministic, unit-tested, and explained by an on-screen legend.
   Direction and speed can never be the only accessible representation of
   performance.
7. Orbital paths represent the planets' real trajectories. No unexplained
   ellipses and no decorative geometric marks are permitted.
8. Hovering, focusing, or selecting a planet pauses or stabilises it so the
   interaction remains usable. Selecting it opens a semantic holding
   inspector containing at minimum ticker and company, portfolio weight,
   weekly return, portfolio-relative performance context, public-safe holding
   analytics, and a link to deeper stock information. Inspector state is
   URL-restorable and works with browser back/forward.
9. R3F is the intended visually dominant desktop approach, with the existing
   semantic DOM as the accessible source of truth and the CSS shell as the
   no-WebGL and reduced-motion fallback.
10. Generic low-poly placeholder spheres are replaced by a deliberate visual
    system: procedurally varied planet materials, an emissive sun,
    atmospheric rim lighting, meaningful orbital paths, depth, restrained
    bloom, and a coherent star field. Every visual object encodes portfolio
    information or supports spatial orientation.
11. Art direction is "portfolio command observatory": dark outer-space
    environment; 1980s CRT phosphor green and amber accents; restrained
    scanline overlays; neon telemetry glow and analog-future HUD framing;
    retrofuturist control-room typography and labels; polished and
    professional first, playful and experimental second. Translate the broad
    qualities of classic space-opera control panels, optimistic atomic-age
    futurism, and analog time-bureaucracy. Do not copy protected logos,
    characters, props, or exact compositions.
12. Dashboard, Research, History, Trades, Compare, and stock routes remain
    intact. The Orrery becomes the public spatial entry point and navigation
    signature; later integration work may extend the same retro-space visual
    grammar into deeper routes without replacing their accepted
    functionality.
13. Mobile uses a deliberate static or simplified 2D orbital map or list.
    Reduced motion freezes orbital movement. Keyboard and screen-reader users
    receive a synchronised semantic holding list and inspector. No essential
    information may exist only in WebGL, motion, colour, speed, or direction.
14. All public/private and no-dollar privacy rules are preserved. No
    owner-only holding data may reach `/share`.
15. Remediation must first address the R3F long task and the missing
    parallax, attempting real optimisation rather than weakening the 50 ms
    gate. If the route-owned task cannot be brought under the gate after one
    bounded optimisation round, the measured result returns to Devan for an
    explicit decision — CSS is not to be silently selected.
16. Visual evidence must demonstrate: initial solar-system entry; multiple
    differently sized planets; simultaneous clockwise and counterclockwise
    motion; planet focus and selection; camera movement to the selected
    holding; the holding inspector; and the reduced-motion and mobile
    fallbacks.

### Owner amendment terms (July 25, 2026)

- Bounded WebGL/React Three Fiber is reopened as an allowed production
  option for this section's scope, superseding §1's CSS-3D-only production
  posture for §7 only. §1's recorded decision, evidence, and owner
  exception remain accepted history and are not rewritten.
- Any production spatial-runtime dependency still requires §7's own
  recorded spike decision first: a fresh bounded CSS-versus-R3F evaluation
  under `docs/PHASE10_UX_ARCHITECTURE.md` §8's framework, re-scored with
  visual/storytelling quality as a required gate alongside performance.
  This keeps `PRODUCT_DIRECTION.md`'s rule intact: no production
  Three.js/R3F dependency before an isolated technical comparison and
  recorded selection. **Satisfied July 25, 2026** — the evaluation ran, the
  decision is recorded in `docs/phase10-spike-section-7/DECISION.md`, and it
  selected neither variant. R3F's use in the Orrery remediation is
  authorised by the owner decision above, conditional on term 15.
- Audio is prohibited for now (beyond `PRODUCT_DIRECTION.md`'s "no
  automatic audio": no audio at all in §7).
- Personality target: approximately 60% polished/professional and 40%
  playful/expressive — curiosity, energy, boldness, experimentation, and
  discovery.

### Work

- ~~Run the §7 spatial-runtime spike~~ — **done, and it produced no
  winner.** Both variants were built, measured live on both declared rigs,
  and photographed; the decision is recorded in
  `docs/phase10-spike-section-7/DECISION.md` before any production
  dependency was added. `package.json` and `package-lock.json` remain
  untouched.
- Build the production Portfolio Orrery on R3F, under term 15's optimisation
  condition:
  - a deliberate entry experience — one orchestrated arrival into the solar
    system (`PRODUCT_DIRECTION.md` design principle 6), skippable and never
    blocking content;
  - camera movement to a selected holding, and to the sun for the
    portfolio-level summary;
  - layered depth and responsive parallax tied to navigation and pointer
    intent — no constant floating noise beyond the orbital motion that
    itself encodes performance;
  - holdings, portfolio weight, trailing weekly performance, and real
    orbital trajectories as the spatial objects themselves: every body,
    path, or node maps to a real holding, quantity, or destination
    (`PRODUCT_DIRECTION.md` principle 3 — nothing purely decorative, and no
    unexplained ellipse or geometric mark);
  - the accepted five-chapter Observatory content (Pulse, Forces,
    Structure, Timeline, Lab) remains reachable and unchanged in the
    semantic layer; the Orrery is the entry point to it, not a replacement
    for it.
- Lazy-load the spatial runtime so it never blocks or delays semantic
  content; declare and enforce explicit bundle/runtime budgets in the §7
  spec.
- Keep all essential content and controls in semantic HTML; the spatial
  layer enhances and never owns content; canvas/WebGL is `aria-hidden`
  where it duplicates semantic content.
- Provide deliberate fallbacks: mobile (intentional 2D sequence), reduced
  motion, no-WebGL, no-JavaScript, and keyboard-only paths, each
  preserving hierarchy, facts, destinations, and focus behavior.
- Preserve every public/private boundary; the spatial layer carries no
  data its semantic counterpart would not.
- Capture side-by-side comparison evidence against the pre-§7 CSS-only
  experience.

### Acceptance

- **Behavioral:** Entering the Orrery, activating the sun, and selecting
  every planet work by click, keyboard, touch, URL, and browser history;
  selection state and focus restoration survive travel and browser
  back/forward; the accepted five-chapter navigation still works exactly as
  before; no essential action or content depends on the spatial layer; the
  entry experience is skippable and never traps the user.
- **Visual (storytelling gate — required, equal in rank to performance):**
  The desktop result reads as a coherent, immersive spatial world judged
  against named storytelling criteria the §7 spec declares in advance
  (coherent world, camera-like movement, spatial composition, layered
  depth, discovery, memorable transitions) — not merely additional
  shadows, circles, cards, or transforms, and not generic placeholder
  geometry; the ~60/40 polished-to-playful balance is evident; real
  1440×900 before/after screenshots against the pre-§7 experience document
  the difference; and term 16's visual evidence exists (initial
  solar-system entry, multiple differently sized planets, simultaneous
  clockwise and counterclockwise motion, planet focus and selection, camera
  movement to the selected holding, the holding inspector, and the
  reduced-motion and mobile fallbacks).
- **Encoding correctness:** The weight→radius, weekly-return→direction, and
  |weekly %|→speed mappings are deterministic, clamped, unit-tested against
  hand-computed fixtures, and explained by an on-screen legend; every value
  they encode is also available as text.
- **Mobile:** 390×844 (and 320px fit) presents a deliberate static or
  simplified 2D orbital map or list with the same holdings, encodings,
  questions, evidence, and inspector content; no cropped desktop scene, no
  horizontal page overflow, no targets under 44×44 CSS px; real 390×844
  screenshots are required.
- **Accessibility:** Reduced-motion (orbital movement frozen), no-WebGL,
  no-JavaScript, and keyboard-only paths preserve hierarchy, facts,
  destinations, focus visibility, and announcements; keyboard and
  screen-reader users get a synchronised semantic holding list and
  inspector; contrast is verified on the real dark surfaces; the spatial
  canvas is `aria-hidden` wherever it duplicates semantic content; no
  essential information exists only in WebGL, motion, colour, speed, or
  direction.
- **Tests:** The weight/direction/speed encoding functions, runtime-selection
  and fallback branching, lazy-load gating, reduced-motion/no-WebGL/no-JS
  behavior, holding-selection and chapter URL state, and focus behavior are
  covered; the full existing suite stays green.
- **Build:** Full tests and production build pass; the spatial runtime is
  lazy-loaded and inside the spec's declared bundle/runtime budgets; if
  R3F is selected, the dependency stays bounded (no post-processing or
  physics beyond the spec), disposable, and absent from routes that do not
  use it; no audio dependency of any kind.
- **Privacy:** Public/private render isolation is re-proven on the spatial
  shell — no owner controls or data cross-render into public mode; no
  dollar patterns in public HTML/RSC/client payloads; no new public route
  or public data field without a recorded privacy decision and regression
  test. No owner-only holding data may reach `/share`, including through
  the Orrery's planet set, inspector, or any encoded value.

**Section gates:** (1) no production spatial-runtime dependency before
§7's recorded spike decision — **satisfied July 25, 2026**: the decision is
recorded and R3F is authorised for the Orrery remediation under term 15's
condition; (2) the storytelling gate is required — a technically clean but
non-immersive result fails §7, and the technically cleaner variant is never
promoted by default for passing the performance gate alone; (3) no audio;
(4) the 50 ms long-task boundary is not to be weakened, redefined, or
replaced with a baseline-subtracted proxy in this section — if one bounded
optimisation round cannot meet it, the measured result goes to Devan for an
explicit decision; (5) no unexplained ellipse, ring, path, or geometric mark
may ship — every visual object encodes portfolio information or supports
spatial orientation.

---

## §8. The Stock Market Universe — `/share` rebuilt

Inserted July 27, 2026 by owner direction. Former §8–§13 renumbered to
§9–§14; their scope, work, and acceptance criteria are unchanged. Authoritative
sources for this section, in order: `UNIVERSE_DIRECTION.md` (the owner's brief)
→ `UNIVERSE_IDEAS.md` (the accepted creative response, including its inline
corrections) → this section. Visual references are committed under
`docs/reference/` — **read its `README.md` first**, as one mockup there depicts
a superseded mobile concept and the planet mood reference must not be
reproduced literally. Where the older `PRODUCT_DIRECTION.md` describes
`/share` as a five-chapter Field Journal with an Orrery entrance, those two
documents supersede it.

### Purpose

Turn `/share` from a report you read into a place you explore. A solar system
is a portfolio, the sun is the portfolio as a whole, and a planet is a holding.
The product becomes creative-first while every number underneath stays correct.

This supersedes the five-chapter `/share` navigation built in §2–§3. The
analysis inside those chapters — concentration, correlation, contribution
ranking, the market-relative summary — is **not** discarded; it moves into the
dashboard that opens when the sun is selected.

### Work

Sequenced to prove the hard parts before spending on art
(`UNIVERSE_IDEAS.md` §14):

- **Layout, camera, trails, labels** with placeholder spheres: one planet per
  orbital ring with guaranteed minimum separation, size encoding weight,
  heaviest innermost, always-visible ticker labels, comet trails whose taper
  encodes direction and length encodes weekly magnitude, and a bounded
  OVERVIEW camera elevated off the orbital plane.
- **Lock-on targeting and the rendezvous**: pointer proximity eases a planet's
  orbital advance to a stop while axial spin continues; selection travels the
  camera alongside the planet and draws the holding panel on. Extends the
  existing hover/focus stabilisation rather than replacing it.
- **The sun**: health scalar computed from TWR-consistent daily net-of-flow
  returns, normalised against the portfolio's own volatility; colour
  temperature, corona, and breathing encode health; sunspots encode drawdown
  from all-time high; portfolio name and percentage legible on the sun itself.
- **Planet texture pipeline**: equirectangular base plus emissive and normal
  maps per top-8 ticker, brand-evoking but reproducing no logos or wordmarks,
  compressed to KTX2/Basis and streamed after first paint.
- **The asteroid belt**: holdings ranked 9 and beyond, re-ranked only at
  snapshot time with a hysteresis band so top-8 membership cannot churn daily.
- **Mission Control**: selecting the sun opens the existing dashboard as an
  overlay that preserves camera state, absorbing the retained chapter analysis.
- **Summonable systems manual** replacing the permanent encoding legend, plus a
  one-time first-visit orientation.
- **Retire** the five-chapter `/share` navigation and the session-scoped
  entrance, preserving their analysis content per the Purpose above.

### Acceptance

- **Behavioral:** Every planet is identifiable without clicking; a planet can
  be selected reliably while the system is in motion; camera state is always
  one gesture from OVERVIEW; selection is URL-restorable and survives browser
  back/forward; the sun opens the dashboard without resetting the scene.
- **Visual:** The scene reads as spheres in space, not circles on a plane; no
  two planets overlap at any point in their orbits; no planet is clipped by the
  viewport in OVERVIEW; orbit direction and relative speed are readable from a
  single still frame; weak portfolio states are art-directed as deliberately as
  strong ones. 1440×900 screenshots and motion evidence required.
- **Desktop-first scope:** Below 1024px the route keeps the existing tested
  fallback unchanged — `canvas` count 0 at 390px and 320px, a genuinely
  reflowed semantic list, no horizontal overflow, no sub-44px targets. No
  mobile 3D scene is built. This is an owner decision, not a deferral.
- **Accessibility:** The semantic DOM remains the accessible source of truth.
  The visible 13-entry side panel is removed; its content survives visually
  hidden, in reading order, keyboard-navigable, carrying every encoded value as
  text. No essential information exists only in WebGL, motion, colour, speed,
  or direction. Reduced motion freezes the scene while preserving every
  encoding. Contrast of new text is verified by computed WCAG ratio from source
  tokens, not by eye.
- **Financial honesty:** The sun's health scalar and every market-relative
  reading derive from TWR-consistent returns, never simple return. Any simple
  or since-purchase return shown is labeled as such and never placed beside a
  benchmark measured from a different period.
- **Tests:** Encoding functions (weight→size, rank→radius, return→direction,
  |return|→speed, health→sun state, drawdown→sunspots) are pure, deterministic,
  clamped, and unit-tested against hand-computed fixtures including clamp
  boundaries and the unavailable case. Belt hysteresis is tested against a
  churn fixture. Retained chapter analysis keeps its existing tests.
- **Build:** Full tests and production build pass. The route-owned long task
  stays under 50 ms on the §2.3.2 desktop rig (1440×900, CPU 2×) — the gate
  cleared in §7 is not to be weakened, redefined, or baseline-subtracted.
  Texture payloads are measured and budgeted, not assumed.
- **Privacy:** `/share` remains public and read-only with zero dollar amounts
  and zero owner-only fields in HTML, RSC payload, or client bundle — including
  in any encoded radius, size, direction, speed, or texture selection. The
  existing canary-value tests continue to pass.

---

## §9. `/compare` guided simulation story

### Purpose

Turn three correct simulations into an educational explanation of divergence.

### Work

- Introduce real portfolio, Steady Market, Tech Tilt, and AI Concentrate one at
  a time.
- Explain each representation, rule, purpose, useful comparison, and what to
  notice.
- Annotate the largest divergence and its causes.
- Retain the complete four-line view, stats, rebalance log, fixtures, and
  mandatory simulation disclaimer.
- Add inception, starting capital, rebalance, fallback, and hypothetical labels
  wherever results appear.

### Acceptance

- **Behavioral:** A visitor can explain each rule and one cause of divergence;
  guided and complete modes work; real/hypothetical data cannot be confused.
- **Visual:** The story reveals complexity progressively; four lines do not
  appear before context unless the user skips; 1440×900 before/after
  screenshots cover introduction, divergence, and complete views.
- **Mobile:** 390×844 uses one simulation/story step at a time; legend, labels,
  and trade details remain readable and touch-safe.
- **Accessibility:** Step controls, chart alternatives, annotations, and logs
  work by keyboard/touch and screen reader; reduced motion skips line/camera
  reveals.
- **Tests:** Existing identity and synthetic fixtures remain exact; story data,
  divergence selection, disclaimer presence, interaction, and advisory-language
  tests pass.
- **Build:** Full tests and production build pass; simulation math remains pure
  and unchanged unless separately proved.
- **Privacy:** `/compare` remains owner-only; no simulation result, rule entry,
  or link leaks onto public routes.

---

## §10. After-hours capability spike and conditional holdings slice

Consolidated July 25, 2026 by owner direction from the former §8
(capability spike) and former §9 (conditional slice). The capability gate
between the two phases and every reliability/privacy requirement are
preserved unchanged. The §7 spec-stage for this section must sequence
Phase A strictly before any Phase B work.

### Phase A — provider and exchange-calendar capability spike

#### Purpose

Determine whether reliable pre-market/after-hours data is possible before
promising a feature.

#### Work

- Execute the provider, coverage, timestamp, rate-limit, plan-rights, and
  session probes defined in the UX architecture.
- Probe representative held instruments without logging secrets/full sensitive
  responses.
- Define exchange-local session calculation including DST, holidays, early
  closes, and exceptional closures.
- Prototype the typed quote state and server cache in isolation.
- Record pass/fail and the supported symbol/session matrix.

#### Acceptance

- **Behavioral:** The spike distinguishes pre-market, regular, after-hours,
  closed, delayed, stale, unavailable, and unsupported; it records an explicit
  go/no-go decision.
- **Visual:** A non-production state catalogue shows exact required labels and
  fields for each state; no production route changes; evidence screenshots are
  required only if an isolated state prototype is built.
- **Mobile:** State labels/content are proven to fit a 390px isolated prototype
  or documented content-width check.
- **Accessibility:** State meanings use text, not color; freshness timestamps
  and comparison basis have unambiguous accessible names.
- **Tests:** Session-boundary, DST, holiday, early-close, timestamp, cache,
  last-known-good, partial failure, and unsupported fixtures pass in the spike.
- **Build:** Full tests and production build remain green; no provider SDK or
  production dependency is added by the spike.
- **Privacy:** Probes are server-side; logs contain status/field presence only;
  no keys, `.env*` content, or public quote redistribution is introduced.

**Conditional gate:** Phase B feature work runs only if the recorded Phase A
spike result is `pass`. If `fail`, Phase B implements only the honest
regular-close limitation state.

### Phase B — conditional after-hours holdings slice

#### Purpose

If Phase A passes, add reliable extended-hours context to owner holdings and
stock detail. If it fails, make the regular-close limitation explicit without
fake data.

#### Work

- Add session, price, absolute/percentage change, timestamp, source, and
  freshness to owner attention/holdings/stock detail.
- Implement loading, delayed, stale, unavailable, unsupported, and closed
  states.
- Use server caching and last-known-good behavior.
- Keep public display off unless a separate explicit redistribution/privacy
  approval is recorded.

#### Acceptance

- **Behavioral:** Session/change basis is correct for every state; partial
  failure preserves known prices; no zero placeholder masquerades as data.
- **Visual:** Extended-hours content is contextual, not a new KPI wall;
  1440×900 before/after screenshots cover fresh and unavailable/unsupported
  states.
- **Mobile:** 390×844 keeps ticker, session, change basis, timestamp, and state
  readable without wrapping collisions or overflow.
- **Accessibility:** Session/freshness are named in text; updates do not create
  noisy announcements; all detail/disclosure works by keyboard/touch.
- **Tests:** Phase A fixtures become production tests; cache, privacy, partial
  provider failure, unsupported symbol, and stale-state tests pass.
- **Build:** Full tests and production build pass; server/client boundary and
  performance budget pass.
- **Privacy:** Owner-only by default; provider rights are honored; no API keys or
  extended quote payload leaks onto public routes.

---

## §11. `/research` prioritization and filing context

### Purpose

Develop the strongest Phase 9 feature into a prioritized research workflow
while preserving insider filings.

### Work

- Lead with new/unusual held-ticker evidence and recent filings.
- Group by relevance, not only source.
- Add holding/source/window/filing filters.
- Explain “why this matters” using weight, recent move, risk, or upcoming event.
- Preserve source, timestamp, SEC Form 4 context, and non-advisory footer.
- Improve Reddit-pending and partial-source states.

### Acceptance

- **Behavioral:** The first layer surfaces a bounded priority list; filters work
  and are URL/restorable where appropriate; every item exposes source,
  timestamp, relevance, and raw detail.
- **Visual:** Insider filings remain prominent; hierarchy replaces the
  cross-source-table-first experience; 1440×900 before/after screenshots cover
  prioritized and filtered states.
- **Mobile:** 390×844 shows priority items and filters without a mandatory wide
  table; full table/detail remains accessible.
- **Accessibility:** Filters, disclosures, read/unread state if used, and source
  links work by keyboard/touch; agreement/lean is not color-only.
- **Tests:** Prioritization fixtures, filter combinations, filing parsing,
  source absence, freshness, and banned-advisory-language tests pass.
- **Build:** Full tests and production build pass; external reads remain cached
  server-side and failure-tolerant.
- **Privacy:** Route remains owner-only; no research data/link appears on public
  routes; keys and source credentials remain server-only.

---

## §12. `/history` event narrative

### Purpose

Explain how performance, composition, cash flows, trades, and important events
evolved.

### Work

- Build one aligned timeline with selectable turning points.
- Join TWR, composition, flow markers, trades, and relevant events by date.
- Lead each selected period with a plain-language explanation.
- Retain daily return, drawdown, composition detail, snapshot table, and CSV
  behind explicit layers.
- Define insufficient-event and incomplete-source states.

### Acceptance

- **Behavioral:** A user can select a turning point and understand performance,
  composition, cash flow, and events in the same window; raw snapshots/export
  remain available.
- **Visual:** Timeline/event narrative leads; charts and table no longer form an
  unexplained stack; 1440×900 before/after screenshots cover default and
  selected-event states.
- **Mobile:** 390×844 uses an ordered event sequence with a compact aligned
  visual; no dense table is required to understand the story.
- **Accessibility:** Timeline points are real buttons/list items with dates and
  labels; charts have text alternatives; focus and selected state are clear.
- **Tests:** Date joins, cash-flow labeling, trade/event alignment, missing
  events, selected URL state, export regression, and financial-math parity pass.
- **Build:** Full tests and production build pass; history query/serialization
  performance remains within an approved budget.
- **Privacy:** Route/export remain owner-only; no private cash amounts or trade
  reasons reach public timeline data.

---

## §13. `/trades` decision review and focused entry

### Purpose

Help the owner review decisions and later portfolio effects without weakening
trade-entry reliability.

### Work

- Make the decision ledger the default view.
- Add filters for holding, action, date, reason presence, and outcome window.
- Link each trade to portfolio weight created/removed, subsequent performance
  over labeled windows, and relevant events.
- Separate focused “Record a trade” mode from review.
- Move share settings to an appropriate owner settings surface.
- Preserve validation, holdings derivation, realized gain/loss, and CSV export.

### Acceptance

- **Behavioral:** Review and entry are distinct; filters and trade detail work;
  later performance is labeled and never framed as proof of decision quality;
  entry still updates derived holdings correctly.
- **Visual:** Scanability and decision context lead; the form no longer
  dominates every visit; 1440×900 before/after screenshots cover ledger, detail,
  and entry modes.
- **Mobile:** 390×844 uses readable trade summaries/detail rather than forcing a
  wide table; entry fields, validation, and submit target fit and remain stable.
- **Accessibility:** Filter labels, table/list semantics, validation messages,
  focus after save, and touch/keyboard operation pass.
- **Tests:** Trade CRUD/derivation, validation, filters, performance windows,
  event links, settings move, export, and failure recovery pass.
- **Build:** Full tests and production build pass; trade mutation path remains
  server-authorized and reliable.
- **Privacy:** Route and mutation remain owner-only; public share settings cannot
  expose dollars by default; reasons and owner dollar effects never leak.

---

## §14. Integration, local fonts, resilience, and acceptance

### Purpose

Unify the product, remove build-time font fragility, and prove the complete
Phase 10 experience.

### Work

- Self-host/localize the selected production fonts with resilient system
  fallbacks and correct licensing.
- Remove clean-build dependence on fetching Google Fonts.
- Complete selected-direction styling across implemented routes without
  flattening their route jobs.
- Audit loading, empty, stale, unsupported, error, no-JavaScript, no-WebGL,
  reduced-motion, keyboard, touch, zoom, and source-failure states.
- Audit public/private payloads, route gates, caches, exports, and client bundles.
- Run desktop/mobile before-and-after portfolio.
- Record final workflow/scorecard summary and any consciously deferred work.

### Acceptance

- **Behavioral:** The five chapters and all deep routes have clear jobs,
  transitions restore context, error states preserve useful data, and no
  accepted Phase 10 behavior is missing.
- **Visual:** One coherent dark direction spans the product; dimensionality is
  structural; route hierarchy is distinct; final 1440×900 and 390×844
  screenshots exist for every UI-bearing route.
- **Mobile:** `/share`, `/`, `/dashboard`, `/compare`, `/research`, `/history`,
  `/trades`, and representative stock pages pass at 390×844 and 320px with no
  page overflow; 200% zoom passes.
- **Accessibility:** Keyboard-only, touch, screen reader, visible focus,
  headings/landmarks, contrast, reduced motion, no-3D, no-JavaScript, and chart
  alternatives pass with recorded evidence.
- **Tests:** Full suite, all Phase 10 fixtures, gating/privacy, public-payload,
  fallback, and interaction tests pass; test count before/after is recorded.
- **Build:** A clean production build passes without network access to Google
  Fonts; bundle/performance budgets pass; repository is clean at the accepted
  commit.
- **Privacy:** Final route/payload/export/cache audit proves no dollar, trade,
  research, simulation, secret, or owner-action leakage; no `.env*` access or
  production deployment occurred.

---

## Required final report

After §13 acceptance, report:

1. selected direction and any combined named parts;
2. sections completed, builders/reviewers, and accepted commits;
3. test count before and after;
4. production build and local-font result;
5. CSS 3D versus R3F decision and measured reason;
6. after-hours capability result and supported coverage;
7. before/after screenshot index;
8. privacy/accessibility/mobile evidence;
9. every material product judgment and deferred item;
10. confirmation that all workflow scorecard categories pass.
