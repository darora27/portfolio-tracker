# Phase 10 UX Architecture

Status: planning only

Depends on: `PRODUCT_DIRECTION.md` and a recorded Phase 10 design selection

Primary route: `/share`

## 1. Evidence and current-state diagnosis

This diagnosis combines Devan's Phase 9 review, the Phase 9 specification and
handoff, current route/component source, saved screenshots, and a live local
inspection of `/share` and `/share/full` on July 23, 2026.

### What Phase 9 got right

- The public/private route boundary is clear and fail-private behavior is
  deliberate.
- The math and same-period benchmark convention are strong foundations.
- The public surface avoids dollar leakage.
- Research joins news, sentiment, and insider filings into a useful new source
  of evidence. Insider filings are the clearest example of a feature with an
  interesting job.
- Compare contains a genuinely interesting real-versus-rules dataset.
- Existing motion primitives include reduced-motion handling.
- The product already has honest negative performance data, source freshness,
  simulation disclaimers, and graceful absence patterns.

### Why the Phase 9 overview fails

At 1440×900, the live `/share` first viewport is almost entirely empty warm
paper with “−2.81%” centered as the dominant object. The small CSS orrery sits
behind the number but does not explain, navigate, or change the information
model. The only supporting sentence reports a weekly decline and market lag.
The visitor learns that performance is negative but not what the product is
for, what caused the result, or where to go next.

At 390×844, the same composition becomes a smaller number in a large blank
field. It technically fits, but the layout's purpose does not improve. The
responsive adaptation is size reduction, not a mobile-specific story.

The private `/` repeats the same issue with account value as the dominant fact.
This is useful utility placed ahead of meaning.

### Why the deep tier feels like too much information

`/dashboard` and `/share/full` render long linear sequences of components with
similar visual weight:

- headline stats;
- value chart;
- simulations entry;
- holdings performance;
- beta and excess return;
- positions;
- realized/unrealized;
- composition, contribution, sector, AI exposure, and correlation;
- movers, earnings, news, risk, and holding risk.

The live public deep view is approximately 5,776 CSS pixels tall on desktop and
7,284 pixels tall at 390px. The source provides no first-layer prioritization
beyond order. Cards answer different questions but look equally urgent.

Expert metrics such as Sharpe, Beta, Sortino, volatility, drawdown, and HHI are
rendered as terse labels and values. A person who does not already understand
the metric receives little help interpreting the actual portfolio.

### Route-specific findings

| Route | Current strength | Current product problem |
|---|---|---|
| `/share` | Public, dollar-safe, simple | Leads with an isolated negative number; no useful purpose or meaningful spatial navigation |
| `/` | Reuses the public surface and provides owner access | Leads with total value; does not answer the daily owner questions |
| `/dashboard` | Broad, accurate coverage and live quotes | A wall of equally weighted analytics; no “how / why / attention” sequence |
| `/compare` | Most exciting quantitative concept after Research | Names, chart, stats, and logs are not a story; rules and divergence are hard to understand |
| `/research` | Strong cross-source model and compelling filings | A large table comes before prioritization; little context for why a filing or signal matters |
| `/history` | Useful return, drawdown, composition series | Charts followed by a dense snapshot table; events, flows, trades, and causal links are absent |
| `/trades` | Reliable entry and complete ledger | Form settings and raw table dominate; the route does not help review decisions or later effects |
| `/stock/[ticker]` | Position, price, fundamentals, news, correlation | Components remain a stack; the holding's role and portfolio consequence are not synthesized |

### Visual-system diagnosis

The Phase 9 light surface and dark deep tier create a dramatic contrast, but
they read as two products. The dark tier is competent and conventional; the
light tier is sparse but not useful. Violet is the main connective device, which
is not enough to establish one art direction.

The reference at `y-n10.com` is valuable for its sense of entering a world,
camera-like movement, spatial composition, and coherent rules. Its voxel
language, branding, layout, assets, and audio are not relevant to copy. The
transferable lesson is that the world itself structures discovery.

## 2. Proposed information architecture

### The Observatory model

The product becomes an Observatory with five question-led chapters:

1. **Pulse** — How is the portfolio behaving relative to the market?
2. **Forces** — Which holdings, flows, and market moves explain the behavior?
3. **Structure** — Where are concentration, correlation, and risk located?
4. **Timeline** — How did composition, cash flows, trades, and important events
   evolve?
5. **Lab** — What do simulations, calculations, and limitations reveal?

These are not five mandatory vertical sections. On desktop, the chosen spatial
system may arrange them as bodies, planes, or nodes. Selecting one moves a
single primary stage into that chapter. On mobile and in the non-3D fallback,
they become a semantic chapter list or tab set followed by one active panel.

Each chapter has:

- one plain-language lead;
- one primary visual;
- up to three supporting facts;
- one “why” explanation;
- one next action;
- optional expert detail behind an explicit control.

The browser URL records the active chapter, preferably with a query or route
segment that works with server rendering and browser history. Hash-only state is
acceptable only if it preserves focus and direct linking reliably.

### Public disclosure sequence

#### Chapter 1 — Pulse

Lead with a market-relative sentence, not a freestanding KPI:

> Since June 24, the portfolio is down 2.8% while VOO is up 1.7% — a 4.6-point
> gap.

Follow with one supported cause:

> Most of the shortfall came from IBM and INTC; MSFT offset part of it.

Show the period, latest close timestamp, and public read-only status in the same
visual field. Negative numbers receive normal emphasis and full contrast.

#### Chapter 2 — Forces

Show contribution, not just return. Connect the market-relative gap to holdings
and cash flows. A visitor should be able to answer “which positions mattered
most?” without opening a table.

#### Chapter 3 — Structure

Show concentration and correlated exposure as a portfolio shape. Explain the
top-two weight and HHI in plain language. The detailed holdings list and
correlation matrix remain available below the interpretation.

#### Chapter 4 — Timeline

Show performance, composition, cash flows, and selected events on one aligned
time axis. Public mode excludes dollar cash-flow amounts; it may mark “capital
added” without disclosing value.

#### Chapter 5 — Lab

Expose public methodology, same-period comparison rules, TWR explanation,
freshness, limitations, and a curated non-private example of simulation logic.
Owner-only simulation results stay private unless a later privacy decision
explicitly changes that rule.

### Private disclosure sequence

The private `/` uses the same Observatory and chapter language so the system
feels coherent. Its first view answers:

1. what changed since the last close;
2. why;
3. what is unusual or stale;
4. what deserves review.

Total value is available in the owner utility strip or a disclosed private
summary after the story, not as the hero. Private chapters may add dollars,
trade-entry actions, owner-only research, and live/extended-hours states.

## 3. Navigation and transitions

### 3.1 The Portfolio Orrery spatial model (added July 25, 2026)

This subsection supersedes the rest of §3 wherever the two conflict. It
records the owner decision that followed §7's spike, which produced no winner
(`docs/phase10-spike-section-7/DECISION.md`). Both prototypes failed for the
same reason: their spatial objects encoded nothing. The corrected model makes
every body carry portfolio information.

**Objects and their meaning.**

| Object | Encodes | Activation opens |
|---|---|---|
| Sun | The portfolio as a whole. Never leads with or publicly reveals total account dollar value. | Portfolio-level summary: composition, return, market-relative context |
| Planet | One actual public-safe holding | The semantic holding inspector |
| Planet radius | Portfolio weight, on a perceptually sensible clamped scale — small holdings stay visible and selectable, larger positions clearly larger | — |
| Orbit direction | Trailing weekly performance: positive clockwise, negative counterclockwise, unavailable or effectively flat a neutral explicitly-labelled behaviour | — |
| Orbital speed | Monotonic in the absolute weekly percentage change, with safe min/max clamps; deterministic, unit-tested, legended on screen | — |
| Orbital path | The planet's real trajectory. Nothing else. | — |

**Prohibited by construction:** any ellipse, ring, arc, or geometric mark that
no object travels and no legend explains; any generic placeholder body that
stands in for portfolio meaning; any encoding whose only accessible
representation is motion, colour, speed, or direction.

**Holding inspector.** Selecting a planet stabilises or pauses it — motion
never fights the interaction — and opens an inspector containing at minimum
ticker and company, portfolio weight, weekly return, portfolio-relative
performance context, public-safe holding analytics, and a link to deeper stock
information. Its state is URL-restorable and works with browser back/forward,
under the same contract chapter state already uses.

**Runtime.** R3F is the visually dominant desktop layer; the semantic DOM is
the accessible source of truth for headings, the holding list, the inspector,
keyboard operation, and URL state; the CSS shell is the no-WebGL and
reduced-motion fallback. The 50 ms long-task boundary is unchanged and is not
to be replaced with a baseline-subtracted proxy.

**Art direction — "portfolio command observatory."** Dark outer-space
environment; 1980s CRT phosphor green and amber accents; restrained scanline
overlays; neon telemetry glow and analog-future HUD framing; retrofuturist
control-room typography. Procedurally varied planet materials, an emissive
sun, atmospheric rim lighting, depth, restrained bloom, and a coherent star
field. Polished and professional first, playful and experimental second.
Translate the broad qualities of classic space-opera control panels,
optimistic atomic-age futurism, and analog time-bureaucracy without copying
protected logos, characters, props, or exact compositions.

**Relationship to the five chapters.** The Orrery is `/share`'s spatial entry
point and the product's navigation signature; it does not replace the accepted
five-chapter Observatory content or its navigation contract, which remain
reachable and unchanged in the semantic layer. Dashboard, Research, History,
Trades, Compare, and the stock routes are untouched; later integration work
may extend the same retro-space grammar into them without replacing their
accepted functionality.

**Mobile and reduced motion.** Mobile gets a deliberate static or simplified
2D orbital map or list — never a cropped desktop scene. Reduced motion freezes
orbital movement while preserving every encoded value as text. Keyboard and
screen-reader users receive a synchronised semantic holding list and
inspector.

### Global shell

- Product name and public/private state are always visible.
- The five chapter names are discoverable without hovering over a 3D object.
- Deep routes remain normal links.
- Freshness is a first-class status, not hidden in chart copy.
- Chapter state is URL-addressable.

### Desktop

- One primary stage occupies the viewport.
- The spatial navigation and semantic chapter navigation are synchronized.
- A selected chapter is identified by label, position, and state—not color
  alone.
- Entering the product may use one orchestrated depth transition.
- Moving chapters may use one restrained camera/plane/orbit transition.
- Drill-ins open within the chapter or as a normal route; they never strand the
  user inside a canvas.

### Mobile

- Use a two-dimensional chapter switcher or compact ordered list.
- Show one active chapter at a time.
- Preserve source order: lead, visual, facts, explanation, next action.
- Avoid miniature orbit labels, drag-only scenes, horizontal page scrolling,
  fixed-height text, and controls below 44×44 CSS pixels.
- Restore chapter and focus when returning from a drill-in.

### Reduced motion

- Skip camera travel, parallax, orbiting, and depth wipes.
- Crossfade or replace the active chapter in no more than 150ms.
- Keep selected state, reading order, focus, and URL behavior identical.

### No-3D / no-JavaScript fallback

- Server-render a dark semantic page with the Pulse story and a five-link
  chapter navigation.
- Render the active chapter's content in normal DOM.
- If enhancement fails, all essential facts and destinations remain available.
- Canvas/WebGL is `aria-hidden` when it duplicates semantic content.

## 4. Route architecture

### `/share` — public Observatory

**User questions**

- What happened relative to the market?
- What caused the difference?
- How is the portfolio structured?
- How did it get here?
- Can I trust the method?

**First-layer hierarchy**

1. Market-relative lead and main driver.
2. Same-period trajectory.
3. Five chapter destinations.
4. Freshness, scope, and read-only state.

**Transitions**

- Chapter selection stays on `/share` with stable URL state.
- Holding detail opens a privacy-safe public drawer or a carefully scoped
  public route only after an explicit privacy design; until then, show aggregate
  public detail.
- “Method” opens calculation/freshness content without leaving the story.

### `/` — private Observatory

**User questions**

- What changed?
- Why did it change?
- What deserves attention?

**First-layer hierarchy**

1. Daily/weekly market-relative briefing.
2. Driver or unusual condition.
3. Stale/unavailable data notices.
4. Chapter destinations.
5. Quiet owner utility including total value.

**Transitions**

- “Review this” can open the relevant dashboard chapter, research filter, trade,
  or holding detail.
- Owner status persists across routes without exposing it publicly.

### `/dashboard`

Use three top-level questions as the first layer:

1. **How am I doing?** TWR, same-period benchmark gap, drawdown context.
2. **Why?** contribution, movers, flows, and composition change.
3. **What deserves attention?** concentration, unusual moves, earnings,
   freshness, and supported after-hours states.

Selecting a question reveals one primary chart and prioritized evidence. A
secondary “All analytics” index provides every existing deep component grouped
by Performance, Holdings, Risk, and Events. Nothing is deleted merely to create
space.

### `/compare`

Start with a guided sequence rather than four lines:

1. Introduce the real portfolio and comparison question.
2. Introduce one simulation at a time with rule, purpose, and visual identity.
3. Reveal all paths together.
4. Annotate the largest divergence.
5. Explain which holdings/rebalance rule created it.
6. Offer detailed stats, trades, and calculation.

The visitor can skip the guide and open the complete comparison. Every screen
retains hypothetical, inception, rebalance, and data-window labels.

### `/research`

Start with a priority queue:

- new or unusual held-ticker evidence;
- recent insider filings;
- upcoming earnings or events;
- cross-source agreement/disagreement;
- source availability and freshness.

Group by “Needs context,” “New filings,” “Company coverage,” and “Market
backdrop,” not solely by source. Filters include holding, source, time window,
filing direction/type, and read status where durable state is appropriate.
“Why this matters” explains relevance to weight, risk, an upcoming event, or a
recent move without advice.

### `/history`

Make the route an event narrative:

- one aligned timeline for TWR, composition, cash flows, trades, and important
  events;
- selectable turning points;
- a plain-language explanation of each selected period;
- optional daily snapshot table and CSV export.

The default view highlights a small number of meaningful changes, not every
date.

### `/trades`

Separate “Record a trade” from “Review decisions.”

- The default owner view is a scan-friendly decision ledger with filters.
- Each trade shows the original reason, portfolio weight created/removed,
  subsequent performance over clearly labeled windows, and relevant events.
- No result is framed as proof that a decision was good or bad.
- Trade entry is a focused, reliable mode with validation and a clear success
  state.
- Share settings move to an owner settings location rather than leading the
  trade workflow.

### `/stock/[ticker]`

The first layer explains the holding's role:

- current weight and portfolio contribution;
- behavior since purchase and relative to a same-period benchmark;
- concentration/correlation role;
- next known event and latest research;
- supported current/extended-hours state.

Fundamentals and analyst data remain deeper evidence with source and limitation
labels.

## 5. Metric-explanation content model

### Interaction

Use a visible “Explain” control on every expert metric. It must be a button,
work by click/Enter/Space/touch, expose expanded state with `aria-expanded`, and
move focus predictably. Do not rely on hover or an unlabeled information icon.

On desktop, the explanation may appear as an anchored popover only if it traps
neither focus nor reading order; a side panel or inline disclosure is safer for
long content. On mobile, use an inline disclosure or bottom sheet with a clear
heading and close control. Direct links to metric explanations should be
possible.

### Required fields

```ts
type MetricExplanation = {
  id: string;
  name: string;
  shortLabel: string;
  category: "performance" | "risk" | "market-relative" | "cash-flow";
  definition: string;
  currentValue: {
    raw: number | null;
    formatted: string;
    asOf: string;
    window: string;
  };
  interpretation: {
    summary: string;
    evidence: string[];
    status: "contextual" | "limited" | "unavailable";
  };
  whyItMattersHere: string;
  limitations: string[];
  calculation: {
    formulaLabel: string;
    inputLabels: string[];
    methodReference: string;
  };
  sourceFreshness: string;
};
```

### Content contract

Every explanation supplies, in order:

1. what it measures;
2. the current portfolio value and window;
3. a plain-language interpretation;
4. why it matters for this portfolio;
5. important limitations;
6. an optional calculation view.

### Metric-specific cautions

- **TWR:** explain net-of-flow daily chaining and why deposits are removed from
  performance.
- **Beta:** name the benchmark and window; flag short history and unstable
  estimates.
- **Sharpe:** name the risk-free convention and annualization; explain that
  short samples can be noisy.
- **Sortino:** explain downside deviation and the same short-history caution.
- **Alpha:** do not show until benchmark, window, and regression method are
  explicit and tested.
- **Volatility:** distinguish variability from permanent loss.
- **Drawdown:** identify the peak and recovery status.
- **XIRR:** explain money-weighting and visibly de-emphasize very short history.
- **HHI/concentration:** translate the value into actual top holdings and weight.

## 6. Simulation story model

### Shared frame

- “Hypothetical” is visible before any simulated value.
- Inception: June 24, 2026.
- Starting capital: $10,000.
- Valuation dates and TWR method match the real comparison window.
- Rebalance rules and fallback behavior remain inspectable.
- Simulations are educational comparisons, never recommendations or
  predictions.

### Per-simulation story

```ts
type SimulationStory = {
  id: "steady-market" | "tech-tilt" | "ai-concentrate";
  name: string;
  represents: string;
  ruleSummary: string;
  purpose: string;
  notice: string;
  divergence: {
    headline: string;
    startDate: string;
    largestGapDate: string;
    drivers: string[];
  };
  stats: Array<{
    metricId: string;
    realValue: string;
    simulationValue: string;
    interpretation: string;
  }>;
  trades: Array<{
    date: string;
    action: string;
    reason: string;
  }>;
  limitations: string[];
};
```

### Story prompts

- **Steady Market:** What changes when the only rule is owning VOO?
- **Tech Tilt:** What changes when market exposure is split with technology and
  reset monthly?
- **AI Concentrate:** What changes when the rule amplifies a small subset of
  high-AI-exposure holdings?

The interface calls out what to notice, such as path volatility, drawdown, or a
rebalance-driven divergence, without judging which portfolio is preferable.

## 7. After-hours capability spike

No UI commitment or provider promise is allowed before this spike passes.

### Provider questions

- Does the provider return pre-market and after-hours prices for every held US
  listing on the current plan?
- Are foreign listings, ADRs, ETFs, OTC instruments, and unsupported exchanges
  identified?
- Are timestamp, session, previous close, source, and status authoritative?
- What are the documented and observed rate limits, delayed-data rules, and
  redistribution constraints?
- Can the response distinguish “no trade,” “session closed,” “unsupported,” and
  “temporarily unavailable”?

Probe representative held instruments and log status, field presence, session,
and timestamp only. Never log the API key or full sensitive responses.

### Session model

```ts
type ExtendedHoursQuote = {
  symbol: string;
  session: "pre-market" | "regular" | "after-hours" | "closed";
  price: number | null;
  absoluteChange: number | null;
  percentChange: number | null;
  comparedWith: "previous-close" | "regular-close" | null;
  marketTimestamp: string | null;
  fetchedAt: string;
  freshness: "live" | "delayed" | "stale" | "unavailable" | "unsupported";
  source: string;
};
```

### Calendar and time-zone behavior

- Determine the instrument's primary exchange.
- Calculate sessions in the exchange's local time with DST-aware data.
- Respect weekends, full holidays, early closes, and exceptional closures.
- Pre-market and after-hours labels must not appear during regular session.
- After an early close, the extended session boundary must use the early close.
- Server time and browser time never determine session status by themselves.

### State catalogue

| State | Required presentation |
|---|---|
| Loading | Preserve previous close; label the extended quote as loading |
| Fresh | Session, price, absolute/percent change, market timestamp, and source |
| Delayed | Same data plus explicit delay/freshness label |
| Stale | Keep last known value, visually secondary, with timestamp and stale label |
| Unavailable | No zero placeholder; explain temporary source absence |
| Unsupported | Explain that the instrument/provider does not supply this session |
| Market closed | Show prior regular close; do not imply an extended session is active |

### Caching and privacy

- Fetch server-side only.
- Cache by symbol and session with a TTL justified by provider limits and
  observed update frequency.
- Deduplicate concurrent requests and retain last-known-good data.
- Never include API keys in browser bundles, logs, or cache keys.
- Owner routes may use live extended data; public exposure requires a separate
  redistribution/privacy decision and defaults to off.
- A partial provider failure must not fail the page or replace known prices with
  zero.

### Pass/fail decision

The spike passes only if session identity, timestamp semantics, held-symbol
coverage, plan rights, caching, and failure-state differentiation are reliable.
If it fails, Phase 10 ships an explicit “regular close only” state and records
the unsupported capability. It does not build a guessed substitute.

## 8. CSS 3D vs bounded React Three Fiber spike

This spike occurs only after Devan selects a visual direction. It adds no
production dependency until a decision is recorded.

| Criterion | Resilient CSS 3D | Bounded Three.js / React Three Fiber |
|---|---|---|
| Best fit | Planes, rings, restrained depth, DOM-native chapter objects | Connected spatial field, camera movement, richer lighting/occlusion |
| Semantic content | Naturally DOM-based | Must be duplicated/synchronized with semantic DOM |
| Keyboard/touch | Straightforward with real controls | Requires explicit hit targets and parallel controls |
| Reduced motion | Simple static transforms | Requires camera/object motion bypass and static render |
| Performance | Lower baseline cost; compositing can still become expensive | Higher JS/GPU cost; must be lazy, bounded, and disposable |
| Failure mode | Degrades to flat DOM | Must fall back completely if WebGL/context/loading fails |
| Visual ceiling | Moderate | High |
| Engineering risk | Low to medium | Medium to high |

### Spike prototype

Build the selected direction's first viewport twice in an isolated,
non-production route or story:

- same semantic content and controls;
- same 1440×900 and 390×844 targets;
- no network data;
- max five spatial objects;
- no post-processing or physics;
- reduced-motion and forced-WebGL-failure states;
- keyboard, touch, screen-reader, and no-JavaScript fallback checks;
- measured JS bytes, load time, long tasks, frame stability, memory, and
  interaction latency on a representative phone.

Choose R3F only if it creates a material navigation/storytelling advantage that
CSS cannot provide while meeting the fallback and performance budgets. Otherwise
use CSS 3D.

### Spike outcome (July 25, 2026)

The §7 spike ran under this framework and **selected neither variant**
(`docs/phase10-spike-section-7/DECISION.md`). Two lessons are binding on any
future spike written from this section:

1. **"Otherwise use CSS 3D" is not a default win.** CSS passed every measured
   reliability row and was still not selected, because the storytelling gate
   ranks equal to performance and both variants failed it. A variant that
   passes the technical gate and loses the visual gate has lost.
2. **A budget row that the untouched baseline also fails is an invalid
   discriminator.** §7's interaction-latency row appended a fixed 900 ms wait
   inside the measurement itself, so the pre-§7 baseline failed it too; the
   row was recorded and then excluded from scoring rather than being used
   against either variant. Declare thresholds against an instrument that can
   actually distinguish the thing being measured — the same defect §1 found in
   its "≤16.7 ms per frame" predicate.

## 9. Cross-route accessibility contract

- One `h1` names the current route or chapter.
- Chapter controls expose selected/current state semantically.
- All explanations, disclosures, and filters work without hover.
- Focus is visible against the actual dark surface.
- Route/chapter changes announce a useful title and move focus intentionally.
- Data tables keep headers and captions; responsive summaries do not remove the
  complete accessible table.
- Charts include a concise text takeaway and an accessible data/table path.
- Gain/loss and source states use text/icons in addition to color.
- Motion, 3D, and canvas never contain the only copy or control.
- Contrast is verified after the visual direction is selected; mockup colors
  are illustrative.

## 10. Responsive contract

Test at minimum:

- 1440×900 primary desktop;
- 1024×768 compact desktop/tablet;
- 768px portrait tablet;
- 390×844 primary phone;
- 320px narrow phone;
- 200% zoom at desktop width.

Every UI slice defines:

- its dominant desktop composition;
- its intentional mobile composition;
- what is removed, reordered, or simplified;
- how navigation remains visible;
- how charts and tables expose complete content;
- how touch targets and text fit without horizontal page overflow.

## 11. Transition from Phase 9

- Preserve current routes and privacy boundaries during the redesign.
- Build new slices behind isolated components or gated route states.
- Start with `/share`; do not restyle the whole deep tier before the public
  information model is proven.
- Reuse correct math and data modules.
- Treat `/share/full` as a compatibility route until the public chapter model
  covers its useful content.
- Do not remove a deep component until its information has a verified home.
- Capture before-and-after screenshots for every UI-bearing section.
