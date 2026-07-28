# The Stock Market Universe — round 4 creative response: legibility

Answers to the round 4 brief (legibility), in its order. Written July 28,
2026. Companion to `UNIVERSE_IDEAS_3.md` (adopted) and
`UNIVERSE_IDEAS_4.md` (the DRAFT rig, accepted); response file numbering
continues the IDEAS series. Grounded in the owner's `Feedback 3` document
and its five captures, each verified against the complaint it
illustrates. Contrast figures computed as always (§9).

The thesis sentence governs everything here: *see complex data in a
simple and understandable way without spending too much time analyzing.*
The scene got beautiful; the reading got expensive. This round spends
nothing on beauty and everything on the ten seconds.

**A working mock ships alongside — `UNIVERSE_LEGIBILITY_MOCK.html` — with
the rebuilt planet panel (planet visible, chart with axes, working
toggle) and the scrolling Mission Control at real proportions.**

---

## 1. The names — complied, and why the room survives it (brief §6.1)

The owner is right, and the round-2 decision was wrong in a way worth
naming: **the jargon taxed exactly the ten seconds the product exists to
protect.** A user translating SCOPE → "performance chart" is doing work
the interface was supposed to do. And the period defence was always
backwards: real consoles were ruthlessly literal — the Apollo panel said
ALTITUDE, FUEL, RANGE. Precision *is* the period voice. The costume was
never the vocabulary; it is the mono small-caps, the index tabs, the
stamps, the materials. Those all stay. The words become literal:

| Was | Becomes | It is |
|---|---|---|
| PLOT 00 | **ORBITS** | the system radar |
| MANIFEST 01 | **HOLDINGS** | what you own |
| SCOPE 02 | **RETURNS** | performance vs the market |
| HAZARD 03 | **RISK** | volatility, beta, drawdown |
| SIGNALS 04 | **CORRELATION** | what moves together |
| COMMS 05 | **NEWS** | headlines for held tickers |
| LOG 06 | **TRADES** | the trade log |
| LAUNCH | **EARNINGS** | the earnings calendar |
| BRIEFING | BRIEFING | already plain — stays |
| DRAFT | DRAFT | already plain — stays |

Planet panel sections: the ID plate becomes a plain header (a ticker
needs no label); SCOPE becomes **the chart, titled by its window**
(§4); TELEMETRY becomes **STATS**; TRANSMISSIONS becomes **NEWS**;
EGRESS becomes two buttons that say what they do: `FULL ANALYSIS ▸` and
`◂ BACK TO SYSTEM`.

One proper noun keeps its theme: **Mission Control** itself — the owner
uses the name with affection, and a room may have a name. Everything
*inside* it says what it is. Rule, stated once for the ledger: **things
are labelled by what they are; only the room is labelled by what it's
called.** The Systems Manual and fallback text adopt the new nouns in
the same commit.

---

## 2. The planet panel, rebuilt for ten seconds (brief §6.2)

The IBM capture confirms the defect exactly: the panel owns the right
half and the planet you travelled to is behind it. Two changes, one
layout law:

**The law: the panel is a rail, and the planet is framed beside it.**
Panel width drops from ~50% to **380px (26% at 1440)**. On selection the
camera places the planet at the **left-third anchor (screen x ≈ 30%)** —
which round 2 specified and the build lost. The planet rotates in the
open, brand-first (rev 2), with the panel beside it. If the panel would
overlap the planet's disc at any zoom, the camera pulls back — planet
visibility is an asserted invariant, not a hope (§9).

**The ten-second stack**, top to bottom — one glance zone per question a
holder actually has:

| Zone | Content | Size |
|---|---|---|
| Header | `IBM · International Business Machines` | 15px |
| Hero | **`TODAY ▲ 5.2%`** — window word attached, never bare | 56px |
| Windows | `WEEK ▲ 8.1 · 30D ▲ 12.4 · SINCE BUY ▲ 41 (SIMPLE)` | one 13px line |
| Chart | the real chart, §4 — titled `30 DAYS · ▲ 12.4%` | 170px tall |
| Stats | `WEIGHT 7.6% · VOL 104% · BETA −1.8 · EARNINGS T−12D` | one 13px line |
| News | three headlines, one line each, timestamped | 3 × 15px |
| Footer | `FULL ANALYSIS ▸` · `◂ BACK TO SYSTEM` | buttons |

Body type moves to **15px** (the capture's ~10px mono is the "font so
small" complaint), hero 56px, word budget stays ≤ 60. **Cut:** the
duplicate unlabelled hero (the `+5.2%` vs `WEEK +8.1%` confusion cannot
exist when every figure is labelled and each figure appears once), the
`VOO UNAVAILABLE` error bar (a missing benchmark removes its toggle
silently — error furniture is not information), and the `SYSTEMS
MANUAL` chip from panel-top (it lives in the room, not on every stock).

One formatting defect the capture surfaced, called for the fix list:
the stats row renders **weight with a delta glyph** (`WEIGHT ◆ +7.6%`).
Weight is a share, not a change — glyphs and signs belong to returns
only. `WEIGHT 7.6%`, no arrow, no sign.

**The acceptance test, literally ten seconds:** five questions, five
zones, in priority order — up today? (hero) · trending? (chart title +
shape) · how much do I hold? (stats) · how wild is it? (stats) ·
anything happening? (earnings chip + news). A reviewer runs the test on
a fresh capture: every answer findable without scrolling, squinting, or
translating.

---

## 3. Every number's window (brief §6.3)

The bare `+5.2%`, the uninterpretable `−0.7`, and the sun chip's
`PORTFOLIO −0.7% WEAK` are all the same defect: **figures without
windows.** The fix is a vocabulary, not a per-case patch.

**The window vocabulary — five words, everywhere, same order:**
`TODAY · WEEK · 30D · SINCE BUY · SINCE START`. (Plus `SAME PERIOD`
reserved for benchmark comparisons, per the maths rules.)

**The attachment rule — exactly two legal forms:**

1. **Attached label:** the window word sits with the figure as a dim
   small-caps prefix — `TODAY ▲ 5.2%`, `WEEK ▼ 0.7%` — in `#d5ba8c` at
   10–11px (10.81:1 on glass, AAA at any size).
2. **Touching header:** a figure may inherit its window only from a
   header *physically adjacent* — a table column headed `TODAY`, or a
   chart titled `30 DAYS · ▲ 12.4%` directly above its own plot.

No third form. A number with neither is a build error, and the review
checklist gains a line: *screenshot each surface; every figure must show
its window within 20px.* Specific repairs the captures demand: the
Mission Control hero becomes `TODAY ▼ 0.7%`; the sun chip becomes
`PORTFOLIO · TODAY ▼ 0.7%` — and drops `WEAK`, because the sun's own
body is the verdict and a mood word under it is the interface grading
its own artwork; XIRR, which currently shouts `−73%` annualized off 34
days of history, follows the maths rules and renders as `XIRR — (needs
90d)` until it has 90 days.

---

## 4. The chart that earns its toggle (brief §6.4)

The capture shows why the toggle "means nothing": ~90px of unlabelled
line with no axis, no scale, no endpoints — both toggle states produce
the same unreadable ribbon. The rebuilt chart, at panel scale (170px
tall) and room scale (RETURNS, 320px):

- **Title = window + answer:** `30 DAYS · ▲ 12.4%` — the toggle now
  visibly changes both the number and the shape, which is what makes it
  a control rather than a decoration.
- **Axis:** three horizontal hairlines (cream at 0.10 alpha — sparse,
  not graph paper), labelled at left in 10px `#d5ba8c` (10.81:1);
  auto-scaled to the window with 8% padding.
- **Baseline:** the zero/100 line drawn solid `#f4dba8` (14.97:1),
  1.5px — the horizon that makes above/below readable at a glance; the
  region below it keeps the faint ember tint.
- **Endpoints:** a dot at start and end; the end carries a chip with
  the closing figure in signal colour. The eye reads start → end →
  title and is done.
- **Hover:** crosshair with a date-and-value chip (`JUL 14 · ▲ 3.2%`),
  desktop-only, no persistent clutter.
- **Detents:** `7D · 30D · SINCE BUY · MAX` as physical toggles
  (unchanged positions, now with consequences). A benchmark overlay,
  where the same-period series exists, draws dashed in the cold
  benchmark blues — and where it doesn't exist, the toggle simply
  isn't there.

Trace colour stays instrument amber `#e6a14d`; signal colour is
reserved for the *conclusions* (title arrow, endpoint chip), so the
chart obeys the Fraunhofer rule even while it finally says something.

---

## 5. Mission Control becomes a room you walk down (brief §6.5)

**The position the brief asks for:** the one-screen-at-a-glance
property was never real. It was asserted in round 2, compressed in
round 3, and the owner has now told us three times that he cannot read
the wall. A glance was only ever going to be one *strip*, not fifty
numbers — so the design splits: **the glance becomes a pinned strip;
the reading becomes a descent.** The owner's scroll proposal is
adopted, and it is the correct diagnosis, not a concession.

And the capture identifies the "pure artificial intelligence" remnant
precisely: **the old app's dashboard is embedded wholesale** — white
sans-serif `Dashboard` heading, Title Case, grey cards — a second
design system living inside the first. It dies this round; its data
(which the owner explicitly likes) redistributes into the room's own
voice. One type system, one language, no survivors.

**The descent, top to bottom:**

| Order | Section | Height | Notes |
|---|---|---|---|
| pinned | **THE STRIP** | 64px | `TODAY ▼ 0.7%` huge · `WEEK · SINCE START TWR · VS VOO SAME PERIOD · OFF HIGH` as labelled chips · section tabs · `◂ UNIVERSE` |
| 1 | **ORBITS** | ~480px | the radar, full width, one ellipse per holding (§7 defect), ring-click → that holding |
| 2 | **HOLDINGS** | 8 rows × 34px | columns headed `WEIGHT · TODAY · WEEK · VALUE*` (*owner view only) — the old dashboard's dollar cards become one owner-only `VALUE` line here |
| 3 | **RETURNS** | 320px | the §4 chart at room scale, benchmarks dashed cold |
| 4 | **RISK** | ~200px | gauges + drawdown column (`OFF HIGH −15.0% · SINCE JUN 30`) |
| 5 | **CORRELATION** + **EARNINGS** | ~240px | side by side, half width each |
| 6 | **NEWS** | ~5 lines | headlines, timestamped |
| 7 | **TRADES** | paper | the parchment log, deliberately last — the archive at the bottom of the case |
| footer | BRIEFING folder · DRAFT latch · stamps | — | |

Rationale for the order: descent = decreasing frequency of need. Today
→ what do I own → how am I doing → how bad can it get → structure →
context → history.

**Scroll behaviour:** the radar is **not pinned** — the owner asked to
scroll past it, and he scrolls past it; its animation pauses via
IntersectionObserver the moment it leaves the viewport (a performance
*refund*, see §9). The strip alone is sticky, and its section tabs
(the renamed bays, §1) jump-scroll — the folder tabs survive as
navigation rather than as walls. The scene behind dims fully once
scrolled; ESC leaves from any depth. Reduced motion: plain native
scroll, no scroll-linked effects of any kind — sticky positioning is
CSS, not script.

What this buys: every section gets full width and honest height. The
holdings table breathes at 34px rows and 15px type. The chart is 320px
tall with axes. Nothing is crammed beside anything. Density was never
the data's fault — it was the viewport's.

---

## 6. The sector map: cut it (brief §6.6)

Three reports, three failures to explain it. The verified capture shows
what a user actually meets: a near-black screen, a faint grid, **two
dots** — one of which is where they just came from — and an exit chip
in the far corner. This is not an explanation problem. It is a feature
shipped before its content existed: a navigation layer for a galaxy of
**one** other system, reachable by accident (zoom out too far) rather
than intent.

**Cut it from the surface.** Zooming out now rubber-bands at the
overview framing — there is no hidden further state to fall into. The
authored-system machinery (`systems/*.json`, hollow-core suns, the
hydration code) stays in the codebase behind a flag; the galaxy phase
will want it, and it will arrive through a **labelled door** (a
`SYSTEMS ▸` bay or a signpost object), never through an accidental
zoom. `OBSERVATORY-GROWTH` becomes unreachable for now — the owner has
never once mentioned wanting to visit it, only wanting to escape it.

The third-report rule, adopted for the ledger: **a feature explained
three times and still not understood is not under-explained; it is
premature.** Cutting it also deletes the "how do I get back"
problem — there is nowhere to get back from.

---

## 7. Rings, sun, spacing (brief §6.7 + §4)

**Full circles, no graph paper — the falloff was right, the tuning was
wrong.** The capture shows rings at effectively zero; rev 2 specified a
0.10 floor and the build appears to have gone lower still (or the
round-2 opacity regression returned — verify first). The reconciliation
the brief asks for: graph paper came from *uniformity*, not from
*visibility* — eight circles at one constant alpha read as a grid;
eight circles each brightest where its planet runs and easing to a
still-visible far side read as drawn paths. Retune: **peak 0.55 over
the 90° arc centred on the planet, easing to a floor of 0.22 — never
lower — full circle always present.** Hovered ring: 0.70 in the
holding's ramp colour (as shipped). The falloff pair
`{peak: 0.55, floor: 0.22}` replaces the single ring-opacity constant
so "the rings vanished" can never recur silently — the floor is a
token, and the render assertion samples the far side of two rings.

**The sun — verify, then escalate.** The capture shows the sun at
roughly GOOG's size, so either rev 2's `1.25×` never landed (defect) or
it landed and is too timid (design). Both cases end the same place:
**`sunRadius = max(2.8, 1.6 × largest planet radius)`**, and — because
this is the second round the sun has been "not big enough" — a
**measured assertion**: in the live sphere-strip capture, the sun's
disc diameter ≥ 1.5× the largest planet's disc. No more asserting scale
in units; measure it in pixels, like everything else this project
trusts.

**Spacing.** Planet radius range narrows from [0.9, 1.95] to
**[0.8, 1.7]** — with the ring-clearance multiplier unchanged, the
system's proportions open up and the sun's 1.6× dominance costs less
absolute space. The centre-left cluster in the capture is transient
orbital bunching — real positions, honestly moving — and with full
rings visible the frame reads structured even when the planets bunch,
because the *paths* fill it evenly. No fake repositioning: the
composition fix is the rings, the bigger sun, and the smaller planets,
not a lie about where things are.

**Two label defects, fixed together:** the `PORTFOLIO` readout joins
the label-collision system as an obstacle (the capture shows COST
colliding with it — labels currently only avoid each other), and the
bottom legend bar (`SUN = WHOLE PORTFOLIO · …`) becomes first-visit
only, dismissed on first interaction and summonable from the manual —
the owner's oldest standing rule is no permanent legends, and the
build grew one back.

---

## 8. What was kept, what this round refuses

Kept without change: the Fraunhofer rule and both firewall tiers, the
signal ramps and sampler assertions, the aurora and weather poles, the
paper-vs-glass materials, the DRAFT rig as accepted, brand-first entry,
the banked spin channel.

Refused, with reasons: **no per-holding coloured scene rings** (still —
the radar owns that; eight coloured ellipses would rebuild the graph
paper the owner just escaped); **no pinned radar** (he asked to scroll
past it; a shrinking sticky radar is the kind of cleverness that reads
as AI); **no re-explaining the sector map** (cut beats taught, third
time); **no window-word omission for "obvious" cases** — TODAY appears
even on the hero, because the hero is where the ambiguity complaint
started.

---

## 9. Constraints check (brief §7)

**Contrast, computed from source tokens:** window words and axis labels
`#d5ba8c` on glass `#010806` = **10.81:1** (AAA at 10px); chart
baseline `#f4dba8` = 14.97:1; 15px body cream = 17.92:1; hero amber
`#f6d493` on glass = 14.21:1. Every new text role this round introduces
is AAA; every figure colour was verified in rounds 3–3.2.

**The long-task budget — this round is a net refund.** The gate is
breached (56–62ms) and remediation is in flight; nothing here adds
load-time main-thread work, and three items remove ongoing work:

| Change | Main-thread effect |
|---|---|
| Radar pauses off-screen (IntersectionObserver) | − (was 60fps always) |
| Below-fold sections lazy-mount on idle/first scroll | − at load |
| Old embedded dashboard removed | − (Recharts instances drop) |
| Sticky strip, scroll, tabs | 0 (CSS position: sticky, native scroll) |
| Bigger sun, ring retune, label obstacle | 0 (existing draw calls, new constants) |

**Assertions added to the review process:** planet-visibility invariant
(selected planet's disc fully outside the panel rect in capture);
sun-dominance ≥ 1.5× in pixels; ring far-side alpha ≥ 0.22 sampled;
every-figure-has-a-window screenshot check; one-ellipse-per-holding in
the radar capture (the double-ellipse defect's regression test).

**Defect list (fixes, not design):** radar double ellipse; weight
rendered with a delta glyph; `VOO UNAVAILABLE` error furniture; the
legend bar's permanence; ring opacity below its own spec.

**Unchanged by construction:** `/share` shows no dollars (the `VALUE`
column and dollar line are owner-view only, as the old dashboard's
cards were); desktop-first; reduced-motion and no-WebGL paths carry
every renamed label and window word (they are text — the fallback gets
*more* legible for free); every visual channel still encodes one real
number.

---

## 10. Conflicts called, positions picked

1. **Atmosphere vs comprehension — conceded.** The round-2 naming was
   mine; the owner's rejection is correct and the concession is full,
   not grudging. The lesson enters the ledger: *the costume is the
   type and the materials, never the vocabulary.*
2. **One-screen glance vs the scroll.** The glance property was never
   delivered in three attempts; it is redefined honestly as the pinned
   strip, and the reading becomes a room with length. His diagnosis,
   adopted as architecture.
3. **Full rings vs graph paper.** Both — visibility floor 0.22, falloff
   retained. Uniformity, not visibility, was ever the enemy.
4. **Sun realism vs planet legibility.** 1.6× with a measured pixel
   assertion — dominant, not astronomical; the planets remain the
   content.
5. **Sector map: teach vs cut.** Cut. Three explanations failed; the
   galaxy phase gets a labelled door instead of an accidental cliff.
6. **Ten seconds vs completeness.** The panel keeps five glance zones
   and sixty words; everything else is one click deeper (`FULL
   ANALYSIS ▸`). Depth moved, not deleted.

---

## 11. Sequence

1. Renames everywhere (bays, panel, manual, fallback) + window
   vocabulary + the two attachment forms — pure text, zero risk,
   biggest comprehension win per line changed.
2. Planet panel rebuild (rail width, camera anchor, ten-second stack,
   15px type) + the §4 chart in the panel.
3. Mission Control descent (strip, order, lazy-mount, radar pause,
   old-dashboard removal) + the §4 chart at room scale.
4. Scene: sun rule + measured assertion, ring retune, planet range,
   label obstacle, legend demotion.
5. Sector map removal (zoom rubber-band, feature flag).
6. Defect list alongside, as fixes.

*Uncommitted, for owner review. The mock —
`UNIVERSE_LEGIBILITY_MOCK.html` — shows the rebuilt panel beside a
visible planet and the full descent with its pinned strip, at real
proportions with demo data.*
