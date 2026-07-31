# Phase 10 — Portfolio Observatory Product Realignment

Status: implementation active

Live implementation status is generated in
`docs/phase10-workflow/ACTIVE_CONTEXT.md` from `PHASE10_STATE.json` and the
canonical workflow manifest. Do not maintain or infer a second current-section
claim in this roadmap.

The numbered roadmap below records all owner amendments in place. Its terminal
section is defined only by
`docs/phase10-workflow/workflow.json` (`managed_sections.terminal`) and checked
against the highest roadmap heading by the workflow validator.

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
- **Owner amendment, July 27 round two:** `/` now uses the same universe
  implementation and identity split as `/share` while preserving the root
  route's owner gate; the five-chapter root shell is retired. Planet maps ship
  at their authored 512×256 resolution, labels no longer occlude bodies,
  every selected camera state has Escape/visible-control/browser-Back/
  empty-space return paths, and Mission Control chrome is simplified without
  removing data. — recorded by codex/gpt-5

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

## §9. Universe craft and depth

Inserted July 28, 2026 by owner direction. Former §9–§14 renumbered to
§10–§15; their scope, work, and acceptance criteria are unchanged.

Authoritative sources, in order: `UNIVERSE_ROUND2_BRIEF.md` (the owner's
questions) → `UNIVERSE_IDEAS_2.md` (the accepted creative response, **including
its §9 owner corrections and authorizations**) → this section. Visual
references under `docs/reference/`.

### Purpose

§8 built the universe and proved it works. This section makes it *good*. The
owner's verdict on §8's accepted state: the textures are "ambiguous garbage,"
Mission Control "looks so generic and basic," and the scene lacks life. Round 1
solved structure; this section solves craft.

### Work

- **Planet textures, regenerated.** Composite real vector logos onto generated
  equirectangular maps rather than prompting text (models misspell wordmarks).
  Real branding is authorized — this is a personal project, not a commercial
  one. Every map must pass the 32-pixel test: shrink the rendered sphere to
  32px and the company is still nameable from one dominant colour, one macro
  silhouette, one emissive signature. Detail concentrated in the equatorial and
  mid-latitude bands; poles simplified; horizontal edges seamless.
- **Overview composition.** Planet diameter proportional to √weight with a
  floor; rings as the drawing rather than noise; trails carrying colour and
  length at rest; a health-tinted nebula behind the system; trade comets as the
  one event-driven ambient object.
- **Ticker labels.** Below the planet, billboarded, fixed screen-space size,
  contrast carried by the label rather than by dimming the art. Tint toward the
  planet's dominant brand hue, lightened — never literal colour inversion,
  which collides with the reserved red/green direction semantics.
- **Mission Control as an operations room.** Apollo mission ops + the Loki TVA
  + holographic bridge. A teletype status line, an orange wireframe system plot
  every bay refers back to, folder-tab bays, and named treatments per content:
  the manifest, the scope, the ring diagram, the hazard cluster, the signals
  grid, the launch schedule, the captain's log.
- **The planet detail view.** ID plate, holding chart with range detents,
  a four-tile telemetry strip, three news headlines, and egress. Hard budget:
  no paragraphs, ≤60 words on screen.
- **Moons, satellites, and the sector map.** One moon maximum per planet,
  carrying news. Three satellites carrying named portfolio statistics. Other
  portfolios reachable as a flat sector chart, with hollow-core suns for
  systems that lack trade history and therefore cannot compute TWR.
- **The sun's hover state.** Instrumentation, never physiology — a docking
  affordance that can never be misread as a change in portfolio health.

### Acceptance

- **Behavioral:** Every planet is nameable at OVERVIEW without hovering; moons,
  satellites, and belt objects are activatable by pointer and keyboard; the
  sector map loads another system and returns; every camera state remains one
  gesture from OVERVIEW.
- **Visual:** Each texture passes the 32-pixel test, verified by inspection of
  a shrunk render. Trails carry direction and magnitude in a still frame.
  Mission Control reads as an operations room rather than a web dashboard.
  1440×900 evidence required for every named surface.
- **Desktop-first scope:** unchanged. Below 1024px the existing tested fallback
  ships as-is — `canvas` count 0 at 390px and 320px. No mobile 3D.
- **Accessibility:** The semantic DOM remains the accessible source of truth.
  New objects (moons, satellites, sector systems) exist as real controls with
  text equivalents. Reduced motion freezes the scene while preserving every
  encoding. Contrast of new text verified by computed WCAG ratio from source
  tokens.
- **Financial honesty:** Every visual channel encodes one real computed number.
  Market-relative readings derive from TWR; any simple or since-purchase return
  is labeled and never placed beside a benchmark from a different period.
  Systems without trade history render hollow-core rather than faking a TWR.
- **Tests:** New encoding functions are pure, deterministic, clamped, and
  unit-tested against hand-computed fixtures. **Rendered behavior is verified by
  scene-graph or pixel assertions, never by `expect(source).toContain(...)`** —
  §8 shipped five source-string guards, one of which passed while the trails it
  claimed to protect were invisible.
- **Build:** Full tests and production build pass. Texture payload measured and
  recorded; if the shipped total exceeds ~15 MB, reduce rather than absorb. The
  route-owned long task stays under 50 ms on the §2.3.2 rig.
- **Privacy:** `/share` stays public with zero dollar amounts and zero
  owner-only fields. The **public trade log** (authorized: action, ticker, date,
  % impact — never shares, prices, or dollars) and **public news** (authorized
  for held tickers) are new disclosure surfaces; canary tests must extend to
  cover both. A news-source failure degrades gracefully rather than breaking the
  scene.

---

## §10. Universe colour, material, and command structure

Inserted July 28, 2026 by owner direction. Former §10–§15 renumbered to
§11–§16; their scope and acceptance criteria are unchanged.

Authoritative sources, in order: `UNIVERSE_IDEAS_3.md` (the accepted round-3
design, revision 2) → `UNIVERSE_PALETTE_3.html` (the computed palette board) →
`docs/reference/` → this section. Round-3 supersedes `UNIVERSE_IDEAS_2.md`
wherever the two conflict.

### Purpose

§8 built the universe; §9 gave it craft. This section gives it **colour,
material, and a command structure** — and fixes what the owner could not use.

Round 3 resolves the owner's "retro but lots of colours" direction against the
project's reserved red/green semantics with the **Fraunhofer rule**: decorative
and instrument light draws the full spectrum *minus two stolen bands* — green
125°–165° and red 345°–20° at chroma > 0.30 — which belong to meaning alone.
Only meaning burns white-hot. Ambient washes are hue-exempt but alpha-capped.
Matter is exempt.

### Work

Sequenced so the contract lands before any pixel moves
(`UNIVERSE_IDEAS_3.md` §11):

1. **`src/lib/observatory/universe-palette.ts`** — one source of colour truth,
   replacing hexes currently scattered across `scene-model.ts`,
   `OrreryScene.tsx`, `orrery.module.css`, and the bays. Ships with the
   two-tier firewall lint, the three decorative ramp LUTs, the two signal ramp
   LUTs, and the extended contrast table. CSS custom properties so the 2D
   fallback inherits the palette.
2. **Sun scale, trails, and spin.** `sunRadius = max(2.4, 1.25 × largest
   planet radius)`. Trail magnitude moves into hue lightness with the shipped
   `#63ef98`/`#ff665f` as exact ramp midpoints; arcs lengthen 18–30° → 36–64°;
   the white-hot head becomes a fixed 12% calibration reference. Trails render
   *behind* the planet. Axial spin is **de-encoded** — decorative only, 80–140 s
   seeded periods; moons slow to ~40 s and stop axial spin.
3. **Star population and ring falloff** — the graph-paper cure. Magnitude
   distribution, gaussian clustering, diffraction spikes on the brightest
   twelve, density ×1.8 inside the aurora band; rings gain vertex-alpha falloff
   so they stop reading as compass circles.
4. **Mission Control restructure** — one dominant bay (PLOT at ~55%), one huge
   number (64px day value), real material contrast (parchment for words, black
   glass for numbers), the unread prose column deleted, radar rings coloured by
   each holding's ramp value with click-through to that holding.
5. **Texture regeneration** — relight the five dark worlds into the measured
   luminance window, and carve the brand marks into the material stack.
6. **Aurora, weather wisps, brand-first entry, radar sweep.**
7. **Prism cursor exhaust.**

### Owner defects to close in this section

Reported live and carried from §9 rather than reopening it:

- Trails render **ahead** of the planet (geometry sign runs with velocity).
- Brand marks render **mirrored** — a flipY / seam-roll ordering bug in the
  texture compositor. Add a chirality assertion to the sphere-strip capture.
- **No trail renders** for holdings near flat; neutral must show something.
- Asteroid-belt holdings have **no visible body and cannot be clicked**.
- The sun **cannot be clicked** from the zoomed-out view.
- An unexplained **orange shadow** appears in the scene.
- The sun **occludes ASML** during rotation at close camera.
- Zooming out reaches the sector map **with no explanation of what it is**.
- Moons and satellites exist but **do nothing**.
- Planet-detail text is **too small**; the panel must widen and the planet
  shrink and move left.

### Acceptance

- **Behavioral:** Every planet is identifiable at OVERVIEW; belt bodies, moons,
  satellites and the sun are activatable by pointer and keyboard from every
  camera state; the radar's rings click through to their holding; every bay
  answers a named question with a working destination.
- **Visual:** Each world's equatorial-band mean luminance sits in **[0.16,
  0.55]**, asserted from a live sphere-strip render, not from the source map.
  Brand marks read as carved into the terrain — sharing its lighting and
  grain — and at least one instance faces the camera within 60° at all times.
  The sun is the largest body in the scene. Trails carry direction and
  magnitude in a still frame. 1440×900 evidence required for every surface.
- **Desktop-first scope:** unchanged. Below 1024px the existing tested fallback
  ships as-is — `canvas` count 0 at 390px and 320px.
- **Accessibility:** The semantic DOM remains the accessible source of truth.
  No encoding lives only in colour, motion, or glow — trail magnitude is
  carried by arc, lightness, *and* text. Reduced motion disables the sweep,
  twinkle, and cursor exhaust while preserving every encoding. Contrast
  verified by computed WCAG ratio from source tokens.
- **The colour firewall:** decorative or instrument light at chroma > 0.30 must
  fall outside hue 125°–165° and 345°–20°; ambient washes are hue-exempt but
  alpha-capped ≤ 0.18; every sample of both signal ramps stays within ±10° of
  its anchor. Enforced by lint over the palette module, with all five ramps
  transit-tested at 64 samples.
- **Financial honesty:** every visual channel encodes one real computed number.
  Market-relative readings derive from TWR. The aurora re-encodes the weekly
  series the SCOPE already draws — percent magnitudes only.
- **Tests:** encoding functions pure, deterministic, clamped, unit-tested
  against hand-computed fixtures. **Rendered behaviour is verified by
  scene-graph or pixel assertions, never by `expect(source).toContain(...)`.**
  The trail sampler upgrades from literal-hex matching to encoding assertions:
  hue lock ±10°, ΔE*ab ≤ 8 against the value computed from the payload, and
  ordering across same-direction holdings.
- **Build:** full tests and production build pass. Texture payload measured at
  each regeneration gate against a 30 MB ceiling; if the escalation ladder in
  `UNIVERSE_IDEAS_3.md` §2.3 reaches its final step, record it in the progress
  log rather than absorbing it. Route-owned long task stays under 50 ms; no
  post-processing pass is added.
- **Privacy:** `/share` stays public with zero dollar amounts and zero
  owner-only fields, including in every new encoded channel and in the radar's
  click-through detail card. Existing canary tests continue to pass.

---

## §11. Universe legibility and the draft rig

Inserted July 28, 2026 by owner direction. Former §11–§16 renumbered to
§12–§17; their scope and acceptance criteria are unchanged.

Authoritative sources, in order: `UNIVERSE_IDEAS_5.md` (legibility) →
`UNIVERSE_IDEAS_4.md` (the draft rig) → `OWNER_FEEDBACK_LEDGER.md` →
`UNIVERSE_LEGIBILITY_MOCK.html` and `UNIVERSE_DRAFT_RIG.html` (working
prototypes the owner has reviewed and approved) → this section.

### Purpose

§10 gave the universe colour. This section makes it **readable**.

The owner's verdict on §10's interfaces: Mission Control *"looks cool… then I
realized most of it was garbage,"* the planet panel *"needs massive
improvements,"* and numbers appear with no indication of what period they cover.
His bar: **everything you need to know about a holding in ten seconds or less.**

### Work

- **Plain naming.** PLOT→ORBITS, MANIFEST→HOLDINGS, SCOPE→RETURNS, HAZARD→RISK,
  SIGNALS→CORRELATION, COMMS→NEWS, LOG→TRADES. Only Mission Control keeps its
  name. The retrofuturist costume stays in the type, tabs, stamps, and
  materials — never the vocabulary.
- **The window vocabulary.** Five terms — TODAY / WEEK / 30D / SINCE BUY /
  SINCE START — with two legal attachment forms, so a bare `+5.2%` or an
  unexplained `−0.7` becomes an impossible state.
- **The planet panel, rebuilt.** The planet stays visible on the left; the panel
  occupies a fixed rail on the right and is **smaller than the mock's** (owner:
  *"slightly too big"*). A labelled hero number, a chart with real axes whose
  range toggle changes what you read, and a strict word budget.
- **Mission Control as a scrolling room.** A pinned summary strip carries the
  glance; the radar scrolls away as you descend. The one-screen-at-a-glance
  property is abandoned — three rounds never delivered it.
- **Remove the embedded legacy dashboard.** The "pure AI" remnant the owner
  keeps identifying is the old Tailwind dashboard included wholesale. It is
  deleted, not restyled, and takes its Recharts instances with it.
- **The DRAFT rig.** A hypothetical-portfolio workbench: one draft, weights as
  an integer half-percent ledger so they always total 100%, circles on a shared
  track sized by allocation, direction and speed carrying each holding's *real*
  weekly performance, ghost rings showing real weights, and the draft encoded in
  the URL so browser-back is undo.
- **Scene tuning.** Full orbital circles visible without reading as graph paper;
  the sun escalated to 1.6× the largest planet with a measured pixel assertion;
  even use of the frame.
- **The sector map is cut** until the galaxy phase earns it.

### Owner items to close in this section

- **News headlines must hyperlink to the real article.** Owner: *"if you cannot
  hyperlink to the actual article then it defeats the purpose."* If a source
  provides no URL, that headline does not ship.
- **Correlation needs a plain-language explanation** of what it tells the owner
  about his own portfolio — he likes the look and cannot read the meaning.
- The Mission Control radar draws **two ellipses per planet**; there must be one.
- The panel is **slightly too big** — shrink it, keep the layout.

### Acceptance

- **Behavioral:** Every section name says what it contains. Every displayed
  figure carries its window. The planet remains visible while its panel is open.
  Mission Control scrolls with a pinned summary. The draft rig's weights always
  total 100% and browser-back undoes an edit.
- **Visual:** The planet chart is readable at panel scale with axis, scale, and
  endpoint values; its range toggle visibly changes the data. Full orbital
  circles are visible without the scene reading as graph paper. The sun is
  measurably the largest body. 1440×900 evidence for every surface.
- **Desktop-first:** unchanged. Below 1024px the existing tested fallback ships
  as-is.
- **Accessibility:** the semantic DOM remains the accessible source of truth;
  draft weights are keyboard-adjustable, not drag-only; contrast verified by
  computed WCAG ratio from source tokens.
- **Financial honesty:** the draft rig computes draft and real returns with an
  identical mix-held formula over an identical window, differing only in
  weights, with an identity test against the existing `simulateRebalanced`
  engine. The `/compare` page's mandatory simulation disclaimer survives
  verbatim. Nothing in the rig carries a dollar amount.
- **Tests:** rendered behaviour verified by scene-graph or pixel assertions,
  never by `expect(source).toContain(...)`.
- **Build:** full tests and production build pass. This section should be a net
  *refund* against the long-task budget — the removed dashboard, the paused
  off-screen radar, and lazy-mounted below-fold sections all reduce load work.
- **Privacy:** `/share` stays public with zero dollar amounts and zero
  owner-only fields, including in the draft rig and the public trades view.

---

## §12. The Chart Room, the sky, and flight

Inserted July 29, 2026 by owner direction. Former §12–§17 renumbered to
§13–§18; their scope and acceptance criteria are unchanged.

Authoritative sources, in order: `UNIVERSE_IDEAS_6.md` (round 6, adopted in
full) → `UNIVERSE_STOCK_LAB.html` (the working Chart Room mock, owner-reviewed)
→ `OWNER_FEEDBACK_LEDGER.md` → this section.

Owner verdict on round 6: *"Fable did an incredible job. We need to follow this
in any way shape or form… what Fable did was truly everything I want out of
this project."*

### Purpose

Add the deepest analytical surface in the product, give the sky matter, and
make the cursor fly. §12 follows `UNIVERSE_IDEAS_6.md`'s own sequence.

### Work

1. **The type ramp first** (§5 of round 6). Five tokens — 56 / 24 / 15 / 13 /
   11 — replacing 44 distinct sizes across 125 declarations, of which 64% sit
   at or below 11.5px. Nothing below 11px anywhere on desktop. A build
   assertion fails on any literal size outside the ramp, plus one *rendered*
   check on computed sizes. First because every later surface inherits it, and
   because element-by-element fixes have failed three reviews running.
2. **The Chart Room** (§1). A full-viewport overlay at `?chart=<ticker>`, with
   three doors: a HOLDINGS row, an ORBITS ring or blip, and `FULL ANALYSIS ▸`
   on the planet panel. Pinned identity strip, a dominant full-scale graph with
   `MODE / VOO / BOOK / DEPTH / TRADES / COST` toggles, then the four-instrument
   bench — DISTRIBUTION, VS MARKET, DEPTH, MOVES WITH — then the contribution,
   company, and news plates. **Lazy-mounted; it must add zero to route load.**
3. **The cursor** (§3). Critically damped spring follower — `k = 1600`,
   `c = 80` — so overshoot is impossible by construction. Hit-testing stays on
   the true pointer, so precision never degrades. Heading from velocity, bank
   from turn rate clamped at 28°, exhaust reading the ship's speed rather than
   the pointer's. Attitude holds at rest; it never re-parks.
4. **The sky** (§2). Delete the repeating CSS star tiles (the WebGL population
   already owns stars, and a periodic tile is the "meh"); floor the aurora at
   `0.14 + wildness × 0.26` so a calm year is still visible; give the nebula a
   filament texture; add a black corner vignette and static warm grain for the
   TVA frame; one faint ecliptic graticule, disposable.
5. **The exit terminal** (§4.1). The green wall is the accessibility fallback
   revealed by programmatic focus. Split the audiences: a four-line sign-off
   receipt for the exit moment, and the full terminal — regrouped and re-set to
   the new ramp — for keyboard users.
6. **The tab strip** (§4.2). Build variants A (no tabs), B (black rail, no
   border, unboxed labels), and C (right-edge index) as owner-judgeable
   screens. **Do not pick one.**

### Owner additions to round 6

Recorded July 29 alongside the adoption:

- **Reduce the glow on type.** Owner: *"Take out the heavy glowy AI looking
  fonts throughout the application… don't make it too much duller, just a tad
  less bright."* Text glow and bright text-shadow are a large part of what
  reads as machine-generated. Reduce brightness and bloom on text specifically
  — **not** on signal colours, which carry meaning. Contrast ratios must not
  fall below their computed floors.
- **Test the thin rectangular boxes.** Owner: *"Play around with the thin
  rectangular boxes being there and not being there — that could have an
  aesthetic benefit."* The 1px outline treatment around chips, tabs, and small
  labels. Capture both, let the owner choose. This overlaps variant B's unboxed
  labels; treat them as one experiment.

### Acceptance

- **Behavioral:** Every holding opens a Chart Room from all three doors;
  `?chart=` is URL-restorable and back closes it; every instrument names its
  question, carries its window word, and stamps its sample size; an instrument
  below minimum history stands by rather than drawing a confident shape.
- **Visual:** No text below 11px anywhere on desktop, verified by computed
  style, and the hero at 56px. The aurora is visible at rest on a calm book.
  Both box variants and all three strip variants are captured at 1440×900 for
  owner judgement.
- **Desktop-first:** unchanged. Below 1024px the existing fallback ships, with
  values-only `ANALYSIS` rows added.
- **Accessibility:** the regrouped terminal loses no encoding; the receipt is
  additive; reduced motion keeps the system pointer and every room; contrast
  verified by computed WCAG ratio from source tokens, including under the new
  vignette and grain — the loss-ramp floor must stay above 3.0.
- **Financial honesty:** every instrument plots a quantity the math core
  already computes. **No indicator furniture** — no RSI, MACD, Bollinger, or
  moving-average ribbons; they are untested math and read as trade signals.
  `BOOK` and `VOO` overlays are same-period constructions.
- **Tests:** rendered behaviour verified by scene-graph or pixel assertions,
  never `expect(source).toContain(...)`. New assertions: aurora centre-band
  alpha ≥ its floor; cursor settle ≤ 150 ms, rest offset ≤ 2 px, heading
  unchanged across a stop; the type-ramp literal-size gate.
- **Build:** the Chart Room adds **zero** to route-load hydration, by lazy
  mount. The sky work should be a net refund. §11's carried long-task breach
  must clear or be re-measured with a current figure.
- **Privacy:** `/share` at `?chart=` carries zero dollar amounts. Owner-only:
  the dollar tile row, the COST line, and dividend income. Canary tests extend
  to the Chart Room.

---

## §14. The Chart Room — individual stock analytics

**Its own section, ahead of the Mission Control rework.** Raised four times.
The reason it moves first: everything in §15 is wiring up components that
already exist and work. **The Chart Room is the only genuinely missing thing
left in the queue**, and putting the missing thing behind the misplaced things
is how it slipped four times.

**Authority: `UNIVERSE_STOCK_LAB.html`**, in the repo root, tracked, and fully
specified. An earlier ledger note claiming a copy of it was missing was false —
all three copies are byte-identical.

**Stage one, the page:** header stat line · the full-scale graph with
`7D/30D/SINCE BUY/MAX` detents, `RETURN/PRICE` modes, and the
`VOO · SAME PERIOD` / `BOOK · SAME PERIOD` / `DEPTH` / `TRADES` / `COST`
overlays · the six benches, each keeping its plain-English question.

**Stage two, the doors:** a HOLDINGS row click and an ORBITS ring or blip
click, plus `FULL ANALYSIS ▸`.

**Two things the mock says about itself and the build must honour.** It is
marked `DEMO DATA · ROUND 6 MOCK · NOT LIVE`, so every figure comes from real
data or is absent — never a fabricated number, never a zero standing in for
one. And `§3 FLIGHT MODEL LIVE` is the cursor physics Devan already confirmed,
not new work.

**Not a rebuild either.** Five of the six benches map onto existing components
— `CorrelationHeatmap`, `ContributionChart`, `BetaTable`, `HoldingRiskTable`.
The layout is new; most of the maths is not.

## §15. Mission Control content rework

Adopted July 30, 2026 from the owner-requested Fable consult (FB-34). The
authority is **`MISSION_CONTROL_ARCHITECTURE.md`**; this section is assembled
*from* it and re-derives nothing.

**The premise.** Mission Control was built beside a working dashboard and never
inherited its organs — 26 components in `src/components/dashboard/` and 3 in
`src/components/history/` are present, routed and tested, and Mission Control
imports exactly one *type* from them. **This is a re-wiring job. No new parts.**
The only new build is the Chart Room, stage two, which has its own adopted
design.

**Stage one — the descent.** STRIP / ORBITS / HOLDINGS / RETURNS / MIX / RISK /
ACTIVITY / footer, with contents, sources and window words exactly per the
architecture's §4 table. Closes FB-27, FB-28, FB-29, FB-30, FB-31, FB-32,
FB-33, FB-35, and retires FB-11.

**Stage two — the Chart Room.** Bound into this section deliberately so it
cannot slip behind content work a fourth time. Both doors wired: a HOLDINGS row
click, and an ORBITS ring or blip click, plus `FULL ANALYSIS ▸`. Closes FB-13.

**Two owner sentences are outstanding** and are recorded in the architecture
§9: the EARNINGS chips ruling, and a keep-or-cut verdict on ACTIVITY once he
has seen it renamed.

**Acceptance test for the spec.** Its parts list must contain only component
names from the inventory, plus the Chart Room. A spec that invents a component
goes back with *"no new parts."*

**`/share` projection is unchanged in kind** — percentages only, VALUE and
realized/unrealized owner-only, privacy canaries extended to every new surface.

## §13. Universe fixes from the July 30 owner sitting

> **The original §13 (`/compare` guided simulation story) is CUT**, per
> `UNIVERSE_AUDIT.md` §6: the canned scenarios retired with `/compare` when the
> DRAFT rig replaced it (round 4 §8, owner-accepted). The number is reused here
> rather than left as a gap.

Everything Devan raised at the §12a sitting that concerns the universe itself.
Authority: `OWNER_FEEDBACK_LEDGER.md`.

**The largest item, and it moves first: FB-26.** Trails and orbital direction
must encode **daily** return, not weekly. `TST-03` and `VIS-04` both sample the
same field and move with it — neither may be weakened to accommodate the change.

**Carried, with his words attached:** FB-01 spacing — *"the orbits could be
spread out just a little bit more and the system should be zoomed out a little
bit more too. but the proportions are good."* **The proportions are CONFIRMED;
do not re-derive them.** One nudge of the gap term and `OVERVIEW_BELT_SPAN_PCT`
below 0.80. · FB-05 fonts, sixth report, *"a bit bigger"* · FB-17 panel width —
he picked 600 from the strip and then found the live panel too small, so **the
capture/live disagreement is the finding**, not the number · FB-02 background.

**New defects from the sitting:** FB-22 a yellow semi-circle haze above the sun
· FB-23 the PORTFOLIO chip floating loose in the orbits instead of sitting on
the sun · FB-24 moons that do nothing when clicked · FB-25 the planet panel
carrying too little · FB-31 the orange tabs, removed · FB-32 the top-right
block, which dies into the strip in §14.

**Parked by owner:** FB-12, the DRAFT rig — *"leave it as is for now since many
other things need to be fixed before this."*

## §13-original. `/compare` guided simulation story — CUT

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

## §14-original. After-hours capability spike — PARKED

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

## §15-original. `/research` prioritization and filing context — CUT

> **CUT by `UNIVERSE_AUDIT.md` §6**, adopted by Devan: *"§15 (`/research`) —
> cut; NEWS + moons absorbed it; Reddit stays parked until the owner clarifies
> which problem it solves (ledger D3)."* The §15 number now belongs to the
> Mission Control content rework above. Retained below as history.

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

## §16-original. `/history` event narrative — CUT

> **CUT by `UNIVERSE_AUDIT.md` §6**, adopted by Devan: *"§16 (`/history`) —
> cut; the aurora, RETURNS, and the Chart Room's DEPTH carry it."* Its three
> charts are not lost — `CompositionOverTimeChart`, `DrawdownChart` and
> `DailyReturnsChart` are scheduled into MIX and RISK by FB-35. Retained below
> as history.

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

## §17. `/trades` decision review and focused entry

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

## §18. Integration, local fonts, resilience, and acceptance

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

After §18 acceptance, report:

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
