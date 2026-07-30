# Phase 10 §11 specification: universe legibility and the draft rig

Prepared July 29, 2026 by `claude-code/opus-5` (Claude Lead, `stage: specify`).

Design proof: `docs/phase10-workflow/design-proofs/section-11.md`
Acceptance ledger: `docs/phase10-workflow/acceptance/section-11.json`

Authority order, from `PHASE10.md` §11: `UNIVERSE_IDEAS_5.md` →
`UNIVERSE_IDEAS_4.md` → `OWNER_FEEDBACK_LEDGER.md` →
`UNIVERSE_LEGIBILITY_MOCK.html` and `UNIVERSE_DRAFT_RIG.html` → `PHASE10.md`
§11 → this spec. Where this spec is silent, the higher source governs.

---

## 0. What this section is for

§10 gave the universe colour. **§11 makes it readable.**

The owner's verdict on §10: Mission Control *"looks cool… then I realized most
of it was garbage"*, the planet panel *"needs massive improvements"*, and
figures appear with no indication of what period they cover. His bar, from
`OWNER_FEEDBACK_LEDGER.md` §1: **everything you need to know about a holding
in ten seconds or less.**

This section spends nothing on beauty and everything on those ten seconds.

### Operating conditions

- **`single_provider_mode` is active** (`PHASE10_STATE.json`). Claude performs
  both the implementation and the review role. The compensating controls in
  `docs/phase10-workflow/SINGLE_PROVIDER_MODE.md` are **mandatory**, not
  advisory: executable verifiers with retained raw output, no criterion graded
  from source reading alone, and **owner visual review before acceptance**.
  `sections_history` records `single_provider_mode: true` for §11.
- **`must_wait_for_codex` binds.** See §8 for exactly where the work stops.
- **`main` is green at section start:** `npm test` 527/527 across 99 files,
  `npm run build` exit 0. **No inherited red exception exists.** Any red at
  review is new and is a blocker.
- **Six §10 criteria are carried, not closed** — `TST-03`, `VIS-04`, `DEF-02`,
  `VIS-02`, `BHV-05`, `BLD-04`. They keep their original §10 IDs so they stay
  mechanically traceable. Each carries its measurement-at-carry in the ledger.
  **None may be closed by assertion**, and no gate may be weakened, redefined,
  or baseline-subtracted. See §7.

---

## 1. Sequence — risk-first, and why this order

Implement in this order. It is `UNIVERSE_IDEAS_5.md` §11's sequence with the
rig appended per `UNIVERSE_IDEAS_4.md` §10, and it is ordered so that the work
closing the carried §10 debt lands **first**.

| # | Package | Closes | Risk |
|---|---|---|---|
| A | Naming + window vocabulary | owner's loudest legibility complaint | lowest — pure text |
| B | Planet panel rebuild + the chart | `DEF-02`, `VIS-02`, `BHV-05` | high — unblocks three carried criteria |
| C | Mission Control descent + legacy dashboard removal | `BLD-04` | high — the long-task refund |
| D | Scene tuning (sun, rings, trails, labels, legend) | `VIS-04`, `TST-03` | high — two carried criteria |
| E | Sector map cut | — | low |
| F | The DRAFT rig | — | high — the only genuinely new feature |
| G | Defect list, alongside | four owner items | low |

**All six carried criteria live in packages B, C, and D. Package F closes
none of them.** That is deliberate: if this section runs long, the debt is
already discharged before the new feature starts.

> ### Scope note for the owner — not a blocker
>
> §11 as written covers roughly twice §10's surface, and §10 took one
> implementation round, five reviews, four remediations, and still carried six
> criteria. Under `single_provider_mode` the review is by the same model that
> implemented, which the mode itself records as a genuine reduction in review
> quality.
>
> **Recommendation:** consider splitting §11 at the A–E / F seam — legibility
> and carried debt in one section, the DRAFT rig in the next. The seam is
> clean: no package A–E depends on F, and F closes no carried criterion.
>
> This is a roadmap decision and therefore Devan's, so this spec covers **all**
> of §11 and implementation proceeds now. Because the sequence above is
> risk-first, nothing is lost by answering late: the work done first is the
> work that survives either choice.

---

## 2. Package A — naming and the window vocabulary

Pure text. Zero behavioural risk, the largest comprehension win per line
changed. Do this first and commit nothing else until it is complete, including
the fallback and the Systems Manual.

### A.1 Plain naming

`OWNER_FEEDBACK_LEDGER.md` §2 records this as **settled**. The rule, stated
once: **things are labelled by what they are; only the room is labelled by
what it's called.** Mission Control keeps its name. Everything inside says
what it is.

| Was | Becomes | It is |
|---|---|---|
| `PLOT 00` | **ORBITS** | the system radar |
| `MANIFEST 01` | **HOLDINGS** | what you own |
| `SCOPE 02` | **RETURNS** | performance vs the market |
| `HAZARD 03` | **RISK** | volatility, beta, drawdown |
| `SIGNALS 04` | **CORRELATION** | what moves together |
| `COMMS 05` | **NEWS** | headlines for held tickers |
| `LOG 06` | **TRADES** | the trade log |
| `LAUNCH` | **EARNINGS** | the earnings calendar |
| `BRIEFING`, `DRAFT` | unchanged | already plain |

Panel sections: the ID plate becomes a plain header (a ticker needs no label);
`SCOPE` becomes **the chart, titled by its window** (§3.4); `TELEMETRY`
becomes **STATS**; `TRANSMISSIONS` becomes **NEWS**; `EGRESS` becomes two
buttons that say what they do — `FULL ANALYSIS ▸` and `◂ BACK TO SYSTEM`.

The source of truth is `src/components/observatory/orrery/mission-control-panels.ts`.
The `question` strings stay; the numeric index suffixes go with the jargon.
**The Systems Manual, the fallback text, and every `aria-label` adopt the new
nouns in the same change** — a renamed tab with an unrenamed manual is worse
than neither.

The retrofuturist costume survives entirely in the mono small-caps, the index
tabs, the stamps, and the materials. It was never the vocabulary.

### A.2 The window vocabulary

Five words, everywhere, in this order:
**`TODAY · WEEK · 30D · SINCE BUY · SINCE START`**, plus `SAME PERIOD`
reserved for benchmark comparisons per `CLAUDE.md`'s maths rules.

**Exactly two legal attachment forms. There is no third.**

1. **Attached label** — the window word sits with the figure as a dim
   small-caps prefix: `TODAY ▲ 5.2%`, `WEEK ▼ 0.7%`. `#d5ba8c` at 10–11px
   (10.81:1 on glass `#010806`, AAA at any size).
2. **Touching header** — a figure inherits its window only from a header
   *physically adjacent*: a table column headed `TODAY`, or a chart titled
   `30 DAYS · ▲ 12.4%` directly above its own plot.

**A figure with neither is a build error.** The review check is literal:
screenshot each surface; every figure must show its window within 20px.

Specific repairs required:

- Mission Control hero → `TODAY ▼ 0.7%`.
- Sun chip → `PORTFOLIO · TODAY ▼ 0.7%`, and **drop `WEAK`** — the sun's own
  body is the verdict; a mood word under it is the interface grading its own
  artwork.
- **XIRR** currently shows an annualized figure off ~34 days of history.
  `CLAUDE.md` requires it de-emphasised under 90 days; render
  **`XIRR — (needs 90d)`** until history reaches 90 days. Never a zero, never
  a number presented as if meaningful.
- **`WEIGHT 7.6%`** — no arrow, no sign. Weight is a share, not a change;
  glyphs and signs belong to returns only. (Currently renders as
  `WEIGHT ◆ +7.6%`.)

No omission for "obvious" cases. `TODAY` appears even on the hero, because
the hero is where the ambiguity complaint started.

---

## 3. Package B — the planet panel, rebuilt

The owner cannot see the planet he travelled to. This package is also what
makes `DEF-02`, `VIS-02`, and `BHV-05` measurable for the first time — at
§10's accept, the panel covered **96.8–100%** of the band those verifiers
sample.

### 3.1 The layout law

**The panel is a rail, and the planet is framed beside it.**

- Panel width drops from ~50% to **380px (26% at 1440)** — and the owner's
  July 28 note says the mock is *"slightly too big"*, so 380px is a
  **ceiling, not a target**.
- On selection the camera places the planet at the **left-third anchor**,
  screen x ≈ 30%. Round 2 specified this and the build lost it.
- **Planet visibility is an asserted invariant, not a hope.** If the panel
  would overlap the planet's disc at any zoom, the camera pulls back.

### 3.2 The ten-second stack

One glance zone per question a holder actually has, top to bottom:

| Zone | Content | Size |
|---|---|---|
| Header | `IBM · International Business Machines` | 15px |
| Hero | **`TODAY ▲ 5.2%`** — window word attached, never bare | 56px |
| Windows | `WEEK ▲ 8.1 · 30D ▲ 12.4 · SINCE BUY ▲ 41 (SIMPLE)` | one 13px line |
| Chart | the real chart (§3.4), titled `30 DAYS · ▲ 12.4%` | 170px tall |
| Stats | `WEIGHT 7.6% · VOL 104% · BETA −1.8 · EARNINGS T−12D` | one 13px line |
| News | three headlines, one line each, timestamped | 3 × 15px |
| Footer | `FULL ANALYSIS ▸` · `◂ BACK TO SYSTEM` | buttons |

Body type is **15px** (the ~10px mono is the owner's "font so small"
complaint). Word budget **≤ 60**. Each figure appears **exactly once**.

### 3.3 What is cut

- **The duplicate unlabelled hero.** The `+5.2%` vs `WEEK +8.1%` confusion
  cannot exist when every figure is labelled and each appears once.
- **The `VOO UNAVAILABLE` error bar.** A missing benchmark removes its toggle
  **silently**. Error furniture is not information. (This does not weaken the
  never-show-a-zero-as-if-real rule — nothing is shown at all.)
- **The `SYSTEMS MANUAL` chip from panel-top.** It lives in the room, not on
  every stock.

### 3.4 The chart that earns its toggle

Today it is ~90px of unlabelled line with no axis, no scale, no endpoints —
both toggle states produce the same unreadable ribbon. Rebuilt, at panel scale
(170px) and room scale (RETURNS, 320px):

- **Title = window + answer:** `30 DAYS · ▲ 12.4%`. The toggle must visibly
  change **both the number and the shape** — that is what makes it a control
  rather than a decoration.
- **Axis:** three horizontal hairlines, cream at 0.10 alpha (sparse, not graph
  paper), labelled at left in 10px `#d5ba8c`; auto-scaled to the window with
  8% padding.
- **Baseline:** the zero/100 line solid `#f4dba8` (14.97:1) at 1.5px — the
  horizon that makes above/below readable at a glance. The region below keeps
  the faint ember tint.
- **Endpoints:** a dot at start and end; the end carries a chip with the
  closing figure in signal colour.
- **Hover:** crosshair with a date-and-value chip (`JUL 14 · ▲ 3.2%`),
  desktop-only, no persistent clutter.
- **Detents:** `7D · 30D · SINCE BUY · MAX`, positions unchanged, now with
  consequences. A benchmark overlay draws dashed in the cold benchmark blues
  **where the same-period series exists**; where it does not, the toggle is
  simply absent.
- **Trace colour stays instrument amber `#e6a14d`.** Signal colour is reserved
  for the *conclusions* — title arrow and endpoint chip — so the chart obeys
  the Fraunhofer rule even while it finally says something.

### 3.5 News in the panel

Owner: *"if you cannot hyperlink to the actual article then it defeats the
purpose."* A headline that cannot be opened does not ship.

`src/lib/finnhub-news.ts` already carries `url` and both render paths already
emit an anchor — but the parser accepts an **empty string** as a valid `url`,
which would render a dead link. Required: a headline whose `url` is not a
non-empty `http(s)` URL is **filtered out at the data layer**, not rendered
with a broken href. If that leaves zero headlines, the NEWS zone renders
nothing rather than an empty frame.

---

## 4. Package C — Mission Control becomes a room you walk down

**The one-screen-at-a-glance property was never real.** It was asserted in
round 2, compressed in round 3, and the owner has now said three times that he
cannot read the wall. The design splits honestly: **the glance becomes a
pinned strip; the reading becomes a descent.** The owner's scroll proposal is
adopted as the correct diagnosis, not as a concession.

### 4.1 The descent

| Order | Section | Height | Notes |
|---|---|---|---|
| pinned | **THE STRIP** | 64px | `TODAY ▼ 0.7%` large · `WEEK · SINCE START TWR · VS VOO SAME PERIOD · OFF HIGH` as labelled chips · section tabs · `◂ UNIVERSE` |
| 1 | **ORBITS** | ~480px | the radar, full width, **one ellipse per holding**, ring-click → that holding |
| 2 | **HOLDINGS** | 8 rows × 34px | columns headed `WEIGHT · TODAY · WEEK · VALUE*` (*owner view only) |
| 3 | **RETURNS** | 320px | the §3.4 chart at room scale, benchmarks dashed cold |
| 4 | **RISK** | ~200px | gauges + drawdown column (`OFF HIGH −15.0% · SINCE JUN 30`) |
| 5 | **CORRELATION** + **EARNINGS** | ~240px | side by side, half width each |
| 6 | **NEWS** | ~5 lines | headlines, timestamped, hyperlinked (§3.5 rule applies) |
| 7 | **TRADES** | paper | the parchment log, deliberately last |
| footer | BRIEFING folder · DRAFT latch · stamps | — | |

Order rationale: **descent = decreasing frequency of need.** Today → what do I
own → how am I doing → how bad can it get → structure → context → history.

### 4.2 Scroll behaviour

- The radar is **not pinned**. The owner asked to scroll past it, so he scrolls
  past it. A shrinking sticky radar is refused by name.
- The radar's animation **pauses via `IntersectionObserver`** the moment it
  leaves the viewport. This is a performance refund (§4.4).
- **The strip alone is sticky**, via CSS `position: sticky` — not script. Its
  section tabs jump-scroll; the folder tabs survive as navigation rather than
  as walls.
- The scene behind dims fully once scrolled. **ESC leaves from any depth.**
- **Reduced motion:** plain native scroll, **no scroll-linked effects of any
  kind**.

### 4.3 Delete the embedded legacy dashboard

The "pure artificial intelligence" remnant the owner keeps identifying is the
old app's dashboard included wholesale — white sans-serif `Dashboard` heading,
Title Case, grey cards: a second design system living inside the first. It is
in `src/components/observatory/orrery/OwnerMissionControlContent.tsx`.

**It is deleted, not restyled**, and takes its Recharts instances with it. Its
data — which the owner explicitly likes — redistributes into the room's own
voice: the dollar cards become one owner-only `VALUE` line in the HOLDINGS
table. `PHASE10.md` ground rule 15 binds: **preserve advanced data by moving
it to the correct layer; do not delete correct analytics to create visual
space.** Anything that cannot be redistributed this section must be named in
the handoff, not silently dropped.

Recharts remains used by other routes; only this route's instances go.

### 4.4 The long-task refund

`BLD-04` is carried at **65/57/58/58/57 ms** against an unchanged **50 ms**
ceiling, unmoved across five rounds. §10's round-3 CDP profile attributes
34.3 ms self time to Three.js shader-program acquisition and clears texture
upload. `PHASE10.md` §11 states this section should be a **net refund**.

| Change | Main-thread effect |
|---|---|
| Radar pauses off-screen (`IntersectionObserver`) | − (was 60fps always) |
| Below-fold sections lazy-mount on idle/first scroll | − at load |
| Embedded legacy dashboard removed | − (Recharts instances drop) |
| Sticky strip, scroll, tabs | 0 (CSS + native scroll) |
| Bigger sun, ring retune, label obstacle | 0 (existing draw calls, new constants) |

If these three refunds do not clear 50 ms, the shader-program acquisition
named by the §10 profile is the next lever. **Do not baseline-subtract and do
not redefine the gate** — that is a `must_wait_for_codex` action (§8).

### 4.5 Correlation needs a plain-language explanation

Owner likes how it looks and cannot read what it means. He needs a
plain-language statement of what correlation tells him **about his own
portfolio** — not a better chart. One or two short sentences, adjacent to the
visual, naming what moving together means for his concentration and what it
does not mean. `portfolio-ux`'s explainability rule applies: plain-language
meaning, current value, portfolio relevance, limitations. Neutral description,
no advice.

---

## 5. Package D — scene tuning

### 5.1 Rings: full circles, no graph paper

The falloff was right; the tuning was wrong. **Graph paper came from
*uniformity*, not from *visibility*.** Eight circles at one constant alpha
read as a grid; eight circles each brightest where its planet runs and easing
to a still-visible far side read as drawn paths.

- **Peak 0.55** over the 90° arc centred on the planet, easing to a **floor of
  0.22 — never lower**. Full circle always present.
- Hovered ring: 0.70 in the holding's ramp colour (as shipped).
- The single ring-opacity constant is replaced by the **token pair
  `{peak: 0.55, floor: 0.22}`** so "the rings vanished" can never recur
  silently. The floor is a token, and the render assertion **samples the far
  side of two rings**.
- Current source shows `OVERVIEW_RING_OPACITY = 0.34` in
  `src/lib/observatory/scene-model.ts`. Verify first whether rev 2's floor
  never landed or a round-2 opacity regression returned; record which.

### 5.2 The sun: verify, then escalate

The capture shows the sun at roughly GOOG's size, so either rev 2's 1.25×
never landed (defect) or it landed and is too timid (design). Source shows
`SUN_TO_PLANET_RATIO = 1.25`, `MIN_SUN_RADIUS = 2.4`.

Both cases end in the same place:
**`sunRadius = max(2.8, 1.6 × largest planet radius)`.**

And because this is the second round the sun has been "not big enough", a
**measured assertion**: in the live capture, the sun's disc diameter is
**≥ 1.5× the largest planet's disc, in pixels**. No more asserting scale in
units.

### 5.3 Planet radius range and spacing

Range narrows from `[0.9, 1.95]` to **`[0.8, 1.7]`**
(`ORRERY_MIN_RADIUS` / `ORRERY_MAX_RADIUS`). The ring-clearance multiplier is
unchanged. The system's proportions open up and the sun's 1.6× dominance costs
less absolute space.

The centre-left cluster in the owner's capture is **transient orbital
bunching — real positions, honestly moving.** With full rings visible the
frame reads structured even when planets bunch, because the *paths* fill it
evenly. **No fake repositioning.** The composition fix is the rings, the
bigger sun, and the smaller planets — never a lie about where things are.

### 5.4 Trails, shortened

The owner: *"Why are the trails so long? It seems like they are too long and
cheap looking now… they were a lot better before."* Round 3 lengthened arcs
from 18–30° to 36–64° to give the lightness ramp room. He asks for shorter,
**by eye, somewhere between the two**.

> **Owner-authorized amendment — Devan, July 29, 2026.** The intermediate
> 26–46° band was superseded by the shipped 18–30° band and closed on his
> sentence *"trails look fine."* When the single-still verifier could not
> truthfully sample ASML because its short ribbon was behind the planet, he
> refused to re-lengthen the trails and authorized **temporal per-holding
> sampling**: capture each holding at the orbital phase where its own ribbon is
> naturally unoccluded. The geometry, ΔE ≤ 8, 10° hue lock, chroma floor,
> same-direction magnitude ordering, all-holdings fixture, ramp-lightness
> clause, and fixed 12% white-hot calibration head are unchanged.

- `MIN_TRAIL_DEGREES` / `MAX_TRAIL_DEGREES` remain **`18 / 30`**.
- `TST-03` waits for and captures each fixture holding at its own naturally
  unoccluded phase; no other holding's pixels may substitute for it.
- `VIS-04` uses the captioned temporal pixel plate produced by that verifier,
  not an impossible all-holdings still.

### 5.5 Two label defects

- The **`PORTFOLIO` readout joins the label-collision system as an obstacle.**
  Labels currently avoid only each other, and the owner's capture shows `COST`
  colliding with the readout.
- The **bottom legend bar** (`SUN = WHOLE PORTFOLIO · …`) becomes **first-visit
  only** — dismissed on first interaction, summonable from the manual. The
  owner's oldest standing rule is no permanent legends, and the build grew one
  back.

---

## 6. Package E — the sector map is cut

Three reports, three failures to explain it. What a user actually meets is a
near-black screen, a faint grid, **two dots** — one of which is where they
came from — and an exit chip in the far corner. This is not an explanation
problem. It is a feature shipped before its content existed: a navigation
layer for a galaxy of **one** other system, reachable **by accident** (zoom
out too far) rather than by intent.

- **Cut it from the surface.** Zooming out **rubber-bands at the overview
  framing**. There is no hidden further state to fall into.
- The authored-system machinery (`systems/*.json`, hollow-core suns, the
  hydration code) **stays in the codebase behind a flag.** The galaxy phase
  will want it, and it will arrive through a **labelled door**, never through
  an accidental zoom.
- `OBSERVATORY-GROWTH` becomes unreachable for now. The owner has never once
  mentioned wanting to visit it — only wanting to escape it.
- Cutting it also deletes the "how do I get back" problem: there is nowhere to
  get back from.

Adopted for the ledger — **the third-report rule:** *a feature explained three
times and still not understood is not under-explained; it is premature.*

---

## 7. Package F — the DRAFT rig

`UNIVERSE_IDEAS_4.md` is authoritative for this package in full. Summary of
the binding requirements:

### 7.1 The object

A tab in the Mission Control bay row — `DRAFT ·` with a small rocket glyph.
Opening it does not swap a panel: the room dims a step and a **flight case
(~900×570px) sets down centered on the desk**, lid opening upward (reduced
motion: it is simply there). ESC or the lid latch puts it away. Being summoned
*over* the room rather than being *of* the room is what makes it read as
carried equipment.

Chassis: charcoal shell `#2b2723`, cream panel face reusing the paper token
`#f0e2c4`, wing screws, burnt-orange accent `#d96f23`, the stencil
`SOL-DEVAN · TEST RIG Nº 1 · CARRIED EQUIPMENT`, and wear (corner scuffs, one
older tape shadow). Two physical toggles: `GHOST` (default on) and `MOTION`
(defaults off under reduced motion). Two new neutral tokens only — case shell
and dish glass `#0a0c10`. **No new hues. Zero new saturated light.**

### 7.2 The dish

A round dark-glass screen, Ø ~470px, left side. **One orbit track** — a single
ring at ~150px radius with sparse tick marks and a crosshair hub. Not eight
rings: one. The graph-paper lesson applies.

Why one track: ring order in the radar encodes the real book's **rank**. The
draft has no rank — the only variable is allocation — so concentric rings
would either freeze the real ranking (a lie about the draft) or re-sort as you
drag (chaos). One shared road, eight runners, each at its **real direction and
real speed** (the scene's angular-speed mapping, ×1.6 for bench size).

Fast circles genuinely **lap** slow ones: on approach the faster circle eases
~12px outward, passes in the outside lane, and tucks back in. Overtaking is
honest — that *is* what a +5% week does to a −1% week.

Circles: fill = `brandHex` (matter, firewall-exempt — IBM stays navy), rimmed
1.5px in `labelHex`, ticker in 11px mono inside the disc when diameter ≥ 34px,
tagged beneath when smaller. **`d = 14 + 110·√w` px.** Each carries a short
trail in the signal magnitude ramp — the exact LUTs the scene uses.

### 7.3 The ledger that makes it physical

Internal state is **200 integer half-percent units**. Every operation moves
whole units; redistributions round by **largest remainder**; the sum is 100.0
**by construction**. There is no float drift, no "weights must total 100%"
message, and **no invalid state to validate**. The interface never corrects
you because the physics never lets you be wrong.

### 7.4 The gestures

1. **Grab and pull** — drag away from a circle's centre to grow, toward to
   shrink. The other seven **breathe** pro-rata to their current weights,
   preserving their relative mix.
2. **Siphon** — modeless: while dragging A, carry the pointer *into* B. B's rim
   glows amber and latches as the **sole counterparty**; everything A sheds
   lands on B alone. A dashed amber fuel line arcs from A to B with the moving
   amount (`▸ 3.5`). Release commits; drift out of B to fall back to pro-rata.
3. **Type** — click any weight readout and type; half-percent steps; others
   renormalise pro-rata.
4. **Keys** — Tab moves focus circle to circle (cream focus ring); ←/→ = ±0.5%,
   Shift = ±5%; **Space latches the focused circle as counterparty** (the
   keyboard siphon); Enter on a readout opens type-in. `aria-live` announces
   politely: *"ASML 30.0%. Others adjusted."*

**Weight change is never drag-only.** `PHASE10.md` §11 requires this.

**Zeroing:** a circle at 0.0% docks on the **pit rail**, parked, grey-rimmed,
still labelled. Drag it back onto the track to re-enter. The roster is fixed at
the eight planets; the belt sits this bench out (v1 scope).

### 7.5 The three readouts

Live during the drag (the maths is eight multiplications), settling on release.

1. **THE WEEK** — `DRAFT MIX ▲ 2.1%` at 28px, stamped `DRAFT` in a dashed
   border, and beneath `YOUR MIX ▲ 0.8 · EDGE +1.3`. Both are the same formula
   over the same window — mix-held-from-window-start, `Σ wᵢ·Rᵢ` on the same
   public weekly returns the scene already renders — **differing only in the
   weights.** That construction is exactly what `CLAUDE.md`'s same-period rule
   demands.
2. **CONCENTRATION** — `TOP-2 54.0 · HHI 1,920` plus the shipped verdict stamp
   from `concentration-status.ts` (<1500 DIVERSIFIED, ≤2500 MODERATE, >2500
   CONCENTRATED).
3. **DRIFT** — `MOVED 22.0 OF 100` — turnover distance `Σ|Δw|/2`, in the
   owner's own $100 story.

Below them the **tank rack**: eight slim rows (24px) — identity chip, ticker,
weight, and a horizontal gauge with a small cream notch at the **real** weight.
The rack is the precision instrument and the accessible path.

**Cut, with reasons:** the correlation matrix (CORRELATION owns covariance),
sector mix (HOLDINGS owns it), and any backtest curve.

### 7.6 Against the real book

**Ghost rings.** With `GHOST` on (default), every circle carries a dashed cream
ring at its *real* weight's diameter, concentric with the disc. Grown past your
real stake, the solid spills outside the ghost; trimmed below, the ghost halos
you. The WEEK plate compares outcomes, DRIFT totals the divergence, the rack
notches mark it per row. **That is the whole comparison apparatus** — no
side-by-side second dish.

**No confusable numbers:** the rig shows no TWR, no benchmark lines, and no
dollar figure — only mix-held percentages under DRAFT stamps.

### 7.7 State, undo, reset

**Opens as your book**, rounded to half-units by largest remainder. An
experiment starts from reality or the first readout means nothing.

**The draft lives in the URL** — one compact param of eight half-unit integers
(`?draft=52.40.28.20.20.16.12.12`), on the project's existing URL-state
scaffolding.

- **Undo is the browser.** `pushState` on release, `replaceState` during drag.
  Back steps your fiddling; Forward replays it.
- **A draft is shareable.** `COPY TEST LINK` on the case footer. Percentages
  only, public-safe by construction.
- **No storage machinery.** One draft *is* one string.
- **Reset is a guarded latch:** `RESET TO BOOK` under a flip-up cover — first
  click arms (`SURE? FLIP AGAIN`, 3s), second commits. Reset is itself a
  history entry, so Back un-resets.

### 7.8 Honesty and `/compare`

| Channel | Status | Source |
|---|---|---|
| Orbit direction | REAL | true weekly sign, scene mapping |
| Orbit speed | REAL | true weekly magnitude, scene mapping ×1.6 |
| Trail colour/lightness | REAL | signal ramps at true \|week\| |
| Disc size | **HYPOTHETICAL** | your half-unit weights — the only lie |
| Disc colour | identity | `brandHex` / `labelHex`, matter-exempt |

One sentence for the whole thing: **the companies stay real; only your
ownership is make-believe.**

- **The mandatory banner survives verbatim.** `SIMULATIONS — hypothetical
  portfolios for comparison only. Not advice, not predictions, not
  recommendations.` — from `src/lib/compare-copy.ts`, printed on a strip of
  aged tape. **In-world material, exact mandated words, byte-identical.**
- **The identity test is required:** `Σ wᵢ·Rᵢ` over the scene's weekly window
  is algebraically identical to buy-and-hold-from-window-start, so it ships
  with an identity test against `simulateRebalanced`
  (`src/lib/math/sim-portfolio.ts`, one rebalance at window start) **to 1e-9**,
  using the existing `steadyMarket` fixture pattern. The tested engine is the
  rig's oracle.
- **`/compare`'s three canned scenarios and the sim trade log retire with the
  page**; its nav entry routes to Mission Control's DRAFT tab. The engine
  survives as the test oracle.

### 7.9 Privacy decision for the rig — owner-gated in §11

`UNIVERSE_IDEAS_4.md` §8 offers the rig on `/share` as *"a recommendation the
owner can veto"* — so it is **not an owner decision yet**. Under `G-PUBLIC`
the default is owner-gated, and under `single_provider_mode` opening a new
public surface is a privacy-boundary change that waits for cross-model review.

**§11 ships the DRAFT rig owner-gated.** The public `/share` view renders no
DRAFT tab and no rig markup — not hidden by CSS, **not rendered**. Making it
public later is a one-gate change once the owner answers; this turn's handoff
asks him.

---

## 8. Where the work stops — `must_wait_for_codex`

`single_provider_mode` lists three things Claude may not do alone. Plan for
these boundaries rather than discovering them mid-implementation.

| Boundary | §11 stops at |
|---|---|
| **The privacy boundary** — `/share` rendering, the authenticated/public split, canary tests | Renaming, relayout, and the descent are fine: they change *presentation*, not the partition. **Frozen:** which fields are public, the gating mechanism, and every canary test. The rig is owner-gated (§7.9) rather than opened. If any package requires moving a field across the public/owner line, **stop and hand off**. |
| **The financial math core** — TWR, XIRR, drawdown, beta, Sharpe, volatility | §11 changes **none** of it. The rig **adds** a new pure mix-held function tested against the existing `simulateRebalanced` oracle — additive, not a change. The XIRR work (§2.2) changes only its *presentation* under 90 days, never its computation. If a defect is found in the math itself, **record it and hand off**. |
| **Weakening, redefining, or excepting any gate** | Absolutely not available this section. `BLD-04`'s 50 ms is not baseline-subtracted or redefined. `TST-03`'s ΔE ≤ 8 is not loosened. `VIS-04`'s arc band changes **only** because the owner directed shorter trails by name, and every other clause of it is unchanged. Anything else → blocked handoff to Devan. |

---

## 9. The carried §10 criteria

These six keep their §10 IDs. Each carries `measurement_at_carry` in the
ledger. **§11 must re-run the named verifier and record the result. None may
be closed by assertion.**

| ID | Measurement at carry | How §11 resolves it |
|---|---|---|
| `TST-03` | Sampler aborts on NBIS at ΔE 33.123 against a ≤8 gate. The taper fix (0.45→0.85) widened every ribbon 1.89× and took IBM to ΔE 0.396 — so the fix landed and **width was never the cause**. The 49px cross-section at the published sample point is a ~12px band peaking at red 93 against the model's 179, zero pixels within 2; the same NBIS arc reaches ΔE 3.44 some 165px away. | Use the owner-authorized temporal method: sample each holding only at its own naturally unoccluded phase, retain every threshold and all eight fixture holdings, and keep the confirmed 18–30° geometry unchanged. |
| `VIS-04` | Blocked on `TST-03`'s remaining NBIS sample, which the owner reports renders correctly. | Follows temporal `TST-03` and its captioned per-holding pixel plate at the confirmed 18–30° band (§5.4). Every threshold and non-method clause is unchanged. |
| `DEF-02` | Shipped-view chirality verifier aborts on COST; 6 of 8 worlds fail. The panel covers **96.8–100%** of the sampled band, so the verifier cannot see what it measures. Two authorised texture regenerations moved the margin by 0.018 and 0.021 — inside the 0.002–0.011 round-to-round drift of five untouched worlds — and did not invert sign. Mirroring a mark **must** invert a correlation that reads it, so the column-mean greyscale profile **cannot discriminate handedness** and substantiates neither pass nor fail. | The panel rebuild (§3) keeps the planet visible and shrinks the panel; then **re-run the shipped-view verifier and record the result.** A verifier that samples the mark **directly** rather than a terrain-dominated equatorial column profile is legitimate §11 work. **Do NOT weaken the assertion.** |
| `VIS-02` | Same panel occlusion. | Same. |
| `BHV-05` | Same panel occlusion. | Same. |
| `BLD-04` | `measure-long-tasks.mjs` unmodified, five fresh 1440×900 CPU-2× contexts, **not baseline-subtracted**: 65/57/58/58/57 ms against an unchanged 50 ms ceiling. Unmoved across five rounds. Round-3 CDP profile attributes 34.3 ms self time to Three.js shader-program acquisition; texture upload cleared. | §4.3–§4.4: delete the embedded dashboard and its Recharts instances, pause the off-screen radar, lazy-mount below-fold sections. **Do NOT baseline-subtract or redefine the gate.** |

**Do not regenerate planet textures against the no-visible-logo theory before
it is measurable.** Four rounds already did, and each moved the score by less
than the measurement noise. The panel rebuild is the first chance to find out
whether the marks were correct all along.

---

## 10. Acceptance criteria

Every criterion below is in the ledger with a risk, a verifier, and required
artifacts. IDs are stable. `expect(source).toContain(...)` **is not coverage
for rendered behaviour** — use a browser, scene-graph, pixel, geometry, or
accessibility verifier.

### Behavioral

| ID | Requirement |
|---|---|
| `BHV-10` | Every section name says what it contains — ORBITS/HOLDINGS/RETURNS/RISK/CORRELATION/NEWS/TRADES/EARNINGS — in the room, the panel, the Systems Manual, the fallback, and every accessible name. No jargon noun survives anywhere in rendered output. |
| `BHV-11` | The ten-second test passes on a fresh 1440×900 capture: up today? (hero) · trending? (chart title + shape) · how much do I hold? (stats) · how wild is it? (stats) · anything happening? (earnings chip + news) — every answer findable without scrolling, squinting, or translating. |
| `BHV-12` | Every displayed figure carries its window in one of exactly two forms — attached label, or a header within 20px. No third form; no bare figure on any surface. |
| `BHV-13` | The selected planet's disc is fully outside the panel rect in the shipped view, at every zoom the camera allows. If the panel would overlap, the camera pulls back. |
| `BHV-14` | Mission Control scrolls with a sticky 64px strip; the radar scrolls away; section tabs jump-scroll; ESC leaves from any depth. |
| `BHV-15` | The chart's range toggle visibly changes both the title figure and the plotted shape; a benchmark toggle is absent (not disabled, not error-barred) when no same-period series exists. |
| `BHV-16` | Cut items are gone from rendered output: the duplicate unlabelled hero, the `SYSTEMS MANUAL` panel-top chip. A holding with zero linkable news renders no NEWS zone. |
| `BHV-17` | No error furniture: the `VOO UNAVAILABLE` bar does not render. Nothing shows a zero as if it were real. |
| `BHV-18` | CORRELATION carries a plain-language explanation of what correlation says about *this* portfolio — meaning, relevance, and limitation — adjacent to the visual, neutral, no advice. |
| `BHV-19` | Every rendered headline is an anchor with a non-empty `http(s)` href; headlines lacking one are filtered at the data layer and never rendered. |
| `BHV-20` | The bottom legend bar is first-visit only, dismissed on first interaction, and summonable from the manual. |
| `BHV-21` | Zooming out rubber-bands at the overview framing. There is no reachable sector-map state and no path to `OBSERVATORY-GROWTH` from the shipped UI. |
| `BHV-22` | The authored-system machinery remains in the codebase behind a flag and is provably unreachable from the UI, not deleted. |
| `BHV-30` | Draft weights always total exactly 100.0% across a randomised sequence of grow, shrink, siphon, type, key, and zero operations — by construction, with no validation message reachable. |
| `BHV-31` | Pro-rata breathing preserves the relative mix of the untouched seven; the siphon latch moves weight between exactly two circles; a zeroed circle docks on the pit rail, still labelled, and can be dragged back. |
| `BHV-32` | Under reduced motion the rig holds seeded stations with direction chevrons and static trails, and **every encoding survives the freeze**. |
| `BHV-33` | All three readouts update live during the drag and settle on release. |
| `BHV-34` | The draft is encoded in the URL; browser Back undoes an edit and Forward replays it; `COPY TEST LINK` yields a URL that restores the same draft. |
| `BHV-35` | `RESET TO BOOK` requires two deliberate actions within the arm window, and Back un-resets. |
| `BHV-05` | **(carried)** Brand-first entry: the planet view arrives with the nearest carved capital facing the camera, then resumes decorative spin. The phase is still set under reduced motion; only the transition is not animated. |

### Visual

| ID | Requirement |
|---|---|
| `VIS-10` | The panel occupies a fixed right rail ≤ 380px at 1440×900 — narrower than `UNIVERSE_LEGIBILITY_MOCK.html` — with the planet anchored at screen x ≈ 30%. |
| `VIS-11` | The panel renders the five-zone stack in order at the specified sizes: 15px body, 56px hero, ≤ 60 words, each figure appearing exactly once. |
| `VIS-12` | `WEIGHT` renders with no arrow and no sign. The sun chip reads `PORTFOLIO · TODAY ▼ x%` with no mood word. XIRR renders `XIRR — (needs 90d)` while history < 90 days. |
| `VIS-13` | 1440×900 capture shows the planet visible beside the open panel, unoccluded. |
| `VIS-14` | The chart is readable at panel scale (170px) and room scale (320px): three axis hairlines with left labels, a solid baseline, start and end dots, and an endpoint chip carrying the closing figure. |
| `VIS-15` | Mission Control's descent renders in the specified order at honest heights, each section full width, with the strip pinned. |
| `VIS-16` | Every orbital ring is a full circle with far-side alpha **≥ 0.22**, sampled on at least two rings, peaking at 0.55 over the planet's 90° arc — and the frame does not read as uniform graph paper. |
| `VIS-17` | The radar draws exactly **one** ellipse per holding. Regression coverage for the double-ellipse defect. |
| `VIS-18` | The sun's disc diameter is **≥ 1.5×** the largest planet's disc **measured in pixels** in the live capture. |
| `VIS-19` | The `PORTFOLIO` readout participates in label collision avoidance as an obstacle; no label overlaps it in the capture. |
| `VIS-20` | Ghost rings render dashed cream at each circle's real-weight diameter and toggle off with the `GHOST` switch; the rack notch marks the real weight per row. |
| `VIS-04` | **(carried)** Trails carry direction and magnitude in a captioned temporal per-holding 1440×900 pixel plate: owner-confirmed arc between **18 and 30 degrees**, ramp lightness for magnitude, and a fixed 12% white-hot head as a calibration reference. Every threshold and non-method clause is unchanged. |
| `VIS-02` | **(carried)** Marks read as carved into the terrain — sharing its lighting and grain, embossed into the normal map, edge-eroded — at three capitals 120° apart within ±18° latitude, with at least one instance facing the camera within 60° at all times. |
| `DEF-02` | **(carried)** Brand marks render with correct chirality on the rendered sphere for all eight worlds, proven by a chirality assertion on the shipped view, not by eye. |

### Mobile

| ID | Requirement |
|---|---|
| `MOB-10` | Below 1024px the existing tested 2D fallback ships **as-is**: zero WebGL, a genuinely reflowed semantic list, no horizontal overflow at 390px and 320px, targets ≥ 44×44px. |
| `MOB-11` | The fallback carries every renamed noun and every window word, verified in the rendered DOM at 390×844. |

### Accessibility

| ID | Requirement |
|---|---|
| `ACC-10` | The rig's weights are fully keyboard-adjustable — Tab between circles, ←/→ ±0.5%, Shift ±5%, Space to latch a counterparty, Enter to type — with a visible focus ring. **Never drag-only.** |
| `ACC-11` | `aria-live="polite"` announces each committed weight change in the form *"ASML 30.0%. Others adjusted."* |
| `ACC-12` | Every new or changed text role meets its contrast floor, **computed from source tokens** by a regression test: window words `#d5ba8c` on glass ≥ 10:1, chart baseline `#f4dba8`, 15px body cream, stencil cream on case shell, amber on dish glass, every `labelHex` rim on dish glass. |
| `ACC-13` | Under reduced motion: native scroll with **no scroll-linked effects of any kind**, the case present without lid animation, and hierarchy, facts, destinations, and focus behaviour all preserved. |

### Tests

| ID | Requirement |
|---|---|
| `TST-10` | The half-unit ledger is covered by property-style tests over randomised operation sequences asserting the invariant sum and largest-remainder rounding. |
| `TST-11` | The rig's mix-held return matches `simulateRebalanced` (one rebalance at window start) **to 1e-9**, using the existing `steadyMarket` fixture pattern. |
| `TST-12` | Rendered behaviour is verified by scene-graph, DOM, pixel, or geometry assertions. **No new `expect(source).toContain(...)` guard is introduced for rendered behaviour**, and none of §11's criteria is graded from source reading alone. |
| `TST-13` | `npm test` passes with zero failures. No test is skipped, weakened, or deleted to achieve it. |
| `TST-03` | **(carried)** The temporal trail sampler captures each holding at its own naturally unoccluded orbital phase and asserts hue lock within 10°, **ΔE\*ab ≤ 8** against the payload-derived expectation from `rampForWeekly`, and ordering across same-direction holdings — for **every** holding in the fixture, not a sampled subset. Literal-hex baselines survive only for flat, comet, and sun tokens. **ΔE and every other threshold are not loosened.** |

### Build

| ID | Requirement |
|---|---|
| `BLD-10` | The embedded legacy dashboard is **deleted** from the Mission Control route, along with its Recharts instances. Its data is redistributed, not dropped; anything not redistributed is named in the handoff. |
| `BLD-11` | The radar pauses when off-screen via `IntersectionObserver`, and below-fold sections lazy-mount on idle/first scroll without layout shift. |
| `BLD-12` | `npm run build` exits 0 with the route list otherwise unchanged, and the `/share` route smoke check passes. |
| `BLD-04` | **(carried)** The route-owned long task stays **under 50 ms** across five fresh 1440×900 CPU-2× contexts with raw per-run output committed. **Not baseline-subtracted, not redefined.** No post-processing pass is added. This section should be a net refund. |

### Privacy

| ID | Requirement |
|---|---|
| `PRV-10` | The DRAFT rig is owner-gated: the public `/share` view emits **no** DRAFT tab and **no** rig markup — not hidden by CSS, not rendered. Covered by a canary-style regression test. |
| `PRV-11` | The mandatory simulations banner appears **byte-identical** to `SIMULATIONS_BANNER` in `src/lib/compare-copy.ts` on every rig view. |
| `PRV-12` | Nothing in the rig carries a dollar amount — verified against the rendered output, not the source. |
| `PRV-13` | `/share` renders zero dollar amounts and zero owner-only fields after the rebuild, including the public trades view. The existing canary tests pass **unmodified**. |
| `PRV-14` | The public/owner field partition is unchanged by this section: no field crosses the line in either direction. The `VALUE` column and the dollar line remain owner-view only. |

---

## 11. Evidence requirements

Under `single_provider_mode`, **executable verifiers are required, not
supporting**, and raw output is retained. Live browser evidence is runnable in
this environment: the repo's own `node_modules/playwright` with cached
Chromium, driven against a real production server, as §10's review rounds did.
An in-app browser tool reporting "no backend" is not evidence that live
verification is unavailable.

- Reuse §10's retained verifier scripts where they still apply —
  `sample-live-rgb.mjs`, `capture-live-sphere-strip.mjs`,
  `measure-long-tasks.mjs`, `measure-overview-fit.mjs`,
  `audit-live-interactions.mjs`, `diagnose-live-scene.mjs` — copying them into
  `docs/phase10-baseline/section-11/scripts/` and recording any modification
  explicitly. `measure-long-tasks.mjs`'s **measurement logic and the 50ms
  gate are unmodified** for `BLD-04`; its navigation-wait plumbing and
  evidence emission follow the measurement contract below, which applies
  repo-wide as of 2026-07-29 (see `AGENTS.md`'s Live Verification section).
- Retain raw output for every measured criterion under
  `docs/phase10-baseline/section-11/`.
- Capture 1440×900 for every surface and 390×844 for the fallback.
- A reviewer pass must retain evidence. A `pass` without retained evidence is
  invalid.
- **Owner visual review precedes acceptance.** Devan is the independent check
  while the second model is unavailable.

### 11.1 Measurement contract — pinned so runs are comparable

> **Owner-authorized amendment — Devan, July 29, 2026.** This section was added
> to an already-accepted spec while §11 was in remediation, which normally
> requires an owner decision, and got one. Origin: `claude-code/sonnet-5`, while
> investigating whether this host can launch a browser at all, found that
> `waitUntil: "networkidle"` never settles on these routes — they poll quotes
> and run a continuous animation loop — so `measure-long-tasks.mjs` was timing
> out at 30s against a page that had loaded correctly. That is a plausible
> root cause for BLD-04's long history of being unmeasurable.
>
> **The 50ms long-task gate is unchanged**, and this amendment must never be
> read as relaxing it: the assertion remains `maximumMs < 50`. What changed is
> how a run reaches the measurement, not what the measurement has to beat.
> Verified before authorization.

Changing the wait strategy changes what is measured, so it is written down
here rather than left to each script's discretion.

- **No verifier uses `waitUntil: "networkidle"`.** These routes poll quotes
  and run continuous animation loops, so `networkidle` never settles — it is
  what caused `measure-long-tasks.mjs` to time out at 30s on a page that had
  in fact loaded correctly. Every verifier navigates with
  `waitUntil: "domcontentloaded"` instead.
- **The readiness signal that starts collection** (i.e., that marks the view
  as mounted with first data painted, and therefore safe to start measuring
  or interacting): the canvas element is visible **and** all eight scene
  labels carry `data-scene-ticker` (`document.querySelectorAll("[data-scene-ticker]").length === 8`).
  This is an existing signal the render loop already writes on its first
  frame — no new DOM attribute was added. For the no-WebGL fallback (reduced
  motion, mobile, `no3d`), the equivalent signal is
  `nav[aria-label="Portfolio bodies"]` becoming visible. Scripts that also
  need Mission Control panel content ready additionally wait for
  `[data-radar-ticker]` or `[data-manifest-ticker]` to be present, since the
  canvas signal alone confirms the app shell has hydrated but not that a
  specific panel's own data has rendered.
- **The sampling window duration**, once the readiness signal fires:
  - `measure-long-tasks.mjs` (`BLD-04`): a fixed **5000ms** post-readiness
    window before reading the long-task buffer. Collection itself starts at
    navigation, not at readiness — the `PerformanceObserver` is installed via
    `addInitScript` before `goto` with `buffered: true`, so it captures tasks
    from navigation start regardless of when the script starts observing.
    The post-readiness window exists to let trailing work (shader
    compilation, deferred hydration, below-fold lazy mounts) finish before
    the buffer is read.
  - `sample-live-rgb.mjs` (`TST-03`): readiness additionally requires the
    trail-sample and planet-geometry `data-*` attributes, then a fixed 1200ms
    initial settle before a 350ms temporal sampling loop (maximum 150s) waits
    for each holding's own naturally unoccluded phase. Each accepted phase
    retains its full 1440×900 frame and contributes to the captioned pixel
    plate. `capture-live-sphere-strip.mjs` (`DEF-02`) keeps its fixed
    **1200–1500ms** settle window.
  - `measure-overview-fit.mjs`: readiness requires the planet-geometry
    `data-*` attributes, then a **3000ms** settle window before the 24-sample
    aggregation loop begins (each sample itself spaced 500ms apart).
  - Interaction-only scripts (`audit-live-interactions.mjs`) do not hold a
    fixed post-readiness window beyond the canvas-visible check plus 250ms,
    because they drive the page via keyboard/pointer events rather than
    sampling a settled frame.
- **The sector map has no equivalent readiness signal** in the retained
  capture scripts' scope (it renders no canvas and, per Package E, is being
  cut from the reachable surface). Those captures use a fixed 1500ms settle
  window instead of a hard gate and are not held to the same fidelity as the
  gated surfaces.

---

## 12. Out of scope

- Planet-texture regeneration against the no-visible-logo theory (barred until
  measurable).
- Any change to the health mapping, the Fraunhofer rule, the firewall tiers, or
  the signal ramps.
- A galaxy phase, or any labelled door to the retained authored-system
  machinery.
- Rig v1.5: the 90-day mix-held sparkline, cross-device drafts, a ninth-holding
  draft, presets.
- Any mobile 3D work (settled against, July 27).
- The trade-entry form (§16) and the open owner question about its styling.
- Repairing `docs/phase10-workflow/acceptance/README.md`'s one stale sentence
  about `carried_by_owner` — left for the owner, not repaired inside a product
  turn.
- D1, the unreproduced green-trail report: **do not change colour logic** until
  the owner names a contradicting ticker. If he does, treat as severe.
