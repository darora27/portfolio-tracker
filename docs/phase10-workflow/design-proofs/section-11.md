# Phase 10 §11 design proof: universe legibility and the draft rig

Status: `existing-package-equivalent` (owner-approved package, mapped item by item below)

Prepared July 29, 2026 by `claude-code/opus-5`.

`DESIGN_GATE.md` allows a section to cite an existing owner-approved design
package **only when it already contains every required item**, and requires the
mapping to be recorded explicitly rather than assumed. This document is that
mapping. Where the package does not decide an item, this proof says so and
decides it under a named rule — it does not pretend the package covered it.

The package: `UNIVERSE_IDEAS_5.md` (legibility) → `UNIVERSE_IDEAS_4.md` (the
draft rig) → `OWNER_FEEDBACK_LEDGER.md` → the two owner-reviewed prototypes
`UNIVERSE_LEGIBILITY_MOCK.html` and `UNIVERSE_DRAFT_RIG.html` → `PHASE10.md`
§11. `PHASE10.md` §11 records the two prototypes as reviewed and approved by
the owner.

## Intent

- **User question:** *"How is this holding doing, and how is my portfolio
  doing — right now, over what period?"* And, on the bench: *"What would a
  different allocation have done over the same week?"*
- **First-five-second comprehension:** the reader sees a labelled figure with
  its window attached (`TODAY ▲ 5.2%`), a shape that confirms it, and a name
  that says what the section contains. No translation step.
- **Primary action or conclusion:** for the panel — answer five questions
  without scrolling, squinting, or translating. For Mission Control — descend
  a room in decreasing order of need. For the rig — grab a circle and pull.

The governing sentence is the owner's, from `OWNER_FEEDBACK_LEDGER.md` §1:
*see complex data in a simple and understandable way without having to spend
too much time analyzing.* His bar for any detail view is **ten seconds**.

## Annotated references

| reference | exact quality borrowed | quality deliberately not borrowed |
|---|---|---|
| `UNIVERSE_LEGIBILITY_MOCK.html` | The rebuilt planet panel at real proportions — rail width, the five-zone ten-second stack, the chart with axes and endpoint chip, 15px body type; and the scrolling Mission Control with its pinned strip and section order | Its demo data, and its panel width: the owner's July 28 note says the panel is *"slightly too big"*, so §11 ships **narrower than the mock** |
| `UNIVERSE_DRAFT_RIG.html` | The core loop — grab a circle, pull, the other seven breathe, the numbers move live; one shared track with real direction and speed; ghost rings; the tank rack as the precision and accessible path | Its demo roster and stamped demo values; presets of any kind (retired with `/compare`) |
| `docs/reference/concept-sun-health-states.png` | Discrete, checkable sun states — the principle that **down must not mean ugly**, art-directed as carefully as up | Nothing new this section; the health mapping is already shipped and is not reopened |
| `docs/reference/concept-desktop-overview.png` | Full orbital rings as *paths* that structure the frame, always-visible ticker labels, sun-to-first-orbit clearance as a real composition risk | Its illustrative data; its lock-on reticle (replaced by the rocket cursor, `OWNER_FEEDBACK_LEDGER.md` §2) |
| Apollo-era console panels (as argued in `UNIVERSE_IDEAS_5.md` §1) | Ruthless literalness of labelling — ALTITUDE, FUEL, RANGE — and the mono small-caps, index tabs, and stamps that carry the period voice | The invented vocabulary. **The costume is the type and the materials, never the words.** |

`docs/reference/planet-surface-mood-reference.jpg` is deliberately **not** a
reference for this section. It contains a real logo and wordmark, its README
forbids literal reproduction, and §11 is explicitly barred from regenerating
textures against the no-visible-logo theory before that theory is measurable
(`OWNER_FEEDBACK_LEDGER.md` §3.1).

## Negative list

Named patterns that would make this result generic, confusing, inaccessible,
or inconsistent with the product:

- **A second design system inside the first.** The embedded legacy dashboard —
  white sans-serif `Dashboard` heading, Title Case, grey cards — is the
  "pure artificial intelligence" remnant the owner keeps identifying. It is
  **deleted, not restyled**.
- **Invented vocabulary.** PLOT, MANIFEST, SCOPE, HAZARD, SIGNALS, COMMS, LOG.
  Rejected by the owner and settled in `OWNER_FEEDBACK_LEDGER.md` §2.
- **A bare figure.** `+5.2%` or `−0.7` with no window is a build error, not a
  style preference.
- **Error furniture as information.** A `VOO UNAVAILABLE` bar occupying panel
  space; a missing benchmark removes its toggle silently.
- **A permanent legend.** The owner's oldest standing rule is no permanent
  legends; the bottom legend bar grew back and becomes first-visit only.
- **Graph paper.** Eight rings at one uniform alpha. Uniformity was the enemy,
  never visibility.
- **A pinned or shrinking sticky radar.** The owner asked to scroll past it.
  A cleverly shrinking sticky radar is exactly the kind of thing that reads
  as machine-generated.
- **Per-holding coloured scene rings.** Eight coloured ellipses rebuild the
  graph paper the owner just escaped; the radar owns that channel.
- **Teaching the sector map a fourth time.** Three explanations failed. Cut
  beats taught.
- **A headline that cannot be opened.** Owner: *"if you cannot hyperlink to
  the actual article then it defeats the purpose."* Link it or cut it.
- **A weight wearing a delta glyph.** `WEIGHT ◆ +7.6%`. Weight is a share, not
  a change; glyphs and signs belong to returns only.
- **A mood word grading the artwork.** The sun chip's `WEAK` — the sun's own
  body is the verdict.
- **Presets, backtest curves, a second dish, a correlation matrix in the rig.**
  All named and refused in `UNIVERSE_IDEAS_4.md` §4 and §9.
- **`expect(source).toContain(...)` as coverage for rendered behaviour.**
  Standing rule; §9 shipped five such guards and one passed while the trails
  it protected were invisible.

## Design grammar

- **Palette authority:** unchanged from §10 — `UNIVERSE_IDEAS_3.md` rev 2, the
  Fraunhofer rule and both firewall tiers, the signal ramps, the paper-vs-glass
  materials. §11 introduces **no new hues**. The rig adds exactly two neutrals:
  case shell `#2b2723`, dish glass `#0a0c10`.
- **Typography roles:** mono small-caps for labels, stamps, and tabs (the
  period voice). Panel body rises to **15px** (the capture's ~10px mono is the
  owner's "font so small" complaint); panel hero **56px**; window words and
  axis labels 10–11px in `#d5ba8c`. No new font family; no live build-time font
  dependency (`PHASE10.md` ground rule 14).
- **Spacing rhythm:** the panel is a **380px rail** (26% at 1440) and narrower
  than the mock. Mission Control sections get full width and honest height —
  holdings rows 34px, room-scale chart 320px, radar ~480px. Nothing is crammed
  beside anything; density was the viewport's fault, not the data's.
- **Component materials:** three materials, kept distinct. Room = umber chrome
  and wall glass. Trade log = parchment. Rig = charcoal case and cream panel
  face with a round dark-glass dish — *carried equipment*, summoned over the
  room rather than built into it.
- **Interaction language:** physical toggles and detents that have consequences;
  grab-and-pull with pro-rata breathing; a modeless siphon (drag into a second
  circle to latch it as sole counterparty); a guarded flip-up cover on the one
  destructive act. Every gesture has a keyboard equivalent.
- **Motion and reduced-motion boundary:** one or two orchestrated moments, not
  ambient float. The radar pauses via `IntersectionObserver` the moment it
  leaves the viewport — a performance *refund*, not an effect. Sticky
  positioning is CSS, not script. Under reduced motion: plain native scroll,
  no scroll-linked effects of any kind; the case is simply there rather than
  opening; rig circles hold seeded stations with a direction chevron and static
  trails, and **every encoding survives the freeze**.
- **Responsive mode:** desktop-first, settled July 27. Below 1024px the
  existing tested 2D fallback ships **as-is**. The fallback is text, so the
  renames and window words make it *more* legible for free — that is the only
  change it receives.

## State matrix

| state | relevant? | intended composition or behavior | proof |
|---|---|---|---|
| real data | yes | Panel five-zone stack with every figure windowed; Mission Control descent in order ORBITS → HOLDINGS → RETURNS → RISK → CORRELATION+EARNINGS → NEWS → TRADES | 1440×900 captures, `BHV-10`–`BHV-14`, `VIS-10`–`VIS-14` |
| negative values | yes | Signal colours on signs; the ramp's dark end floored at 3:1 so it never vanishes; down is art-directed as carefully as up | `VIS-04`, `VIS-16` |
| empty | yes | A holding with no news renders no NEWS zone rather than an empty frame; a zero-weight rig circle docks on the pit rail, grey-rimmed and still labelled | `BHV-16`, `BHV-31` |
| stale | yes | Existing `prices as of <date>` badge behaviour is unchanged and inherited | `PRV-13` (unchanged-surface check) |
| loading | yes | Below-fold sections lazy-mount on idle/first scroll and must not produce layout shift or a flash of empty room | `BLD-11` |
| error | yes | **Removed as furniture:** a missing benchmark removes its toggle silently instead of rendering `VOO UNAVAILABLE`. Never a zero shown as if real | `BHV-17` |
| private/public | yes | `/share`: percentages only, zero dollars, zero owner-only fields. The `VALUE` column and the dollar line are owner-view only. The DRAFT rig is **owner-gated in §11** — see Owner decision below | `PRV-10`–`PRV-14` |
| reduced motion | yes | Native scroll, no scroll-linked effects; case present without lid animation; rig stations + chevrons + static trails; brand-first phase still *set*, only the transition not animated | `ACC-13`, `BHV-05`, `BHV-32` |
| fallback renderer | yes | Below 1024px and no-WebGL: the existing tested 2D path, carrying every renamed label and window word | `MOB-10`, `MOB-11` |

## Proof surfaces

Desktop-first is a recorded owner decision, so this is a deliberate
desktop-first record, not an omission.

| viewport / environment | artifact | what this proves |
|---|---|---|
| 1440×900 desktop | `docs/phase10-baseline/section-11/after/planet-detail-1440x900.png` | The rail width, the five-zone stack, and the planet visible beside the panel |
| 1440×900 desktop | `docs/phase10-baseline/section-11/after/overview-1440x900.png` | Full rings without graph paper, sun dominance, shortened trails, no legend bar |
| 1440×900 desktop | `docs/phase10-baseline/section-11/after/mission-control-strip-1440x900.png` plus one capture per section | The pinned strip and the descent at honest height |
| 1440×900 desktop | `docs/phase10-baseline/section-11/after/draft-rig-1440x900.png` | The case on the desk, dish, rack, three readouts, ghost rings |
| 1440×900 desktop | `docs/phase10-baseline/section-11/after/live-sphere-strip-32.png` | Marks measurable at last — the panel no longer occludes the sampled band |
| 390×844 mobile | `docs/phase10-baseline/section-11/after/fallback-390x844.png` | The existing tested fallback still ships, now carrying the new nouns and window words |
| 1024px boundary | `docs/phase10-baseline/section-11/after/fallback-1024x900.png` | The desktop/fallback switch is where it was |

## Owner decision

- **Selected direction:** `UNIVERSE_IDEAS_5.md` in full (naming, panel rebuild,
  scrolling Mission Control, chart, scene tuning, sector-map cut) and
  `UNIVERSE_IDEAS_4.md` in full (the DRAFT rig). Both prototypes are recorded
  as owner-reviewed and approved in `PHASE10.md` §11. Individual decisions are
  settled in `OWNER_FEEDBACK_LEDGER.md` §2: plain section names, sector map
  cut, desktop-first, Mission Control by viewer identity, public trade log
  (action/ticker/date/% impact only), public news.
- **Rejected alternatives:** the round-2 invented vocabulary; the one-screen
  glance (asserted three times, never delivered — redefined honestly as the
  pinned strip); a pinned or shrinking radar; per-holding coloured scene rings;
  re-explaining the sector map; `/compare`'s three canned scenarios and its sim
  trade log; a side-by-side second dish; a backtest curve in the rig.
- **Approval evidence:** `PHASE10.md` §11 ("working prototypes the owner has
  reviewed and approved"); `OWNER_FEEDBACK_LEDGER.md` §2 and §3.1–§3.2;
  `docs/phase10-handoffs/2026-07-29-section-10-devan-to-claude-lead-accept.md`.

### Two items the package does not decide — resolved here under a named rule

1. **Is the DRAFT rig public on `/share`?** `UNIVERSE_IDEAS_4.md` §8 offers it
   as *"a recommendation the owner can veto"*, so it is **not decided**.
   Resolved by `G-PUBLIC` (new public surface requires an explicit privacy
   decision; the default is owner-gated): **§11 ships the DRAFT rig
   owner-gated.** The public `/share` view renders no DRAFT tab and no rig
   markup. This is reversible in one gate later if the owner says yes, and it
   is raised in this turn's handoff for exactly that answer. Under
   `single_provider_mode`, opening it is a privacy-boundary change and would in
   any case wait for cross-model review.
2. **How short is "shorter"?** The owner rejected round 3's 36–64° arcs by name
   and asked for *"somewhere between the two"* (round 2 was 18–30°), judged by
   eye. Resolved as a token pair set to **26–46°**, which is literally between
   the two bands, with the value recorded by the implementer, measured by the
   reviewer, and **confirmed by owner visual review before acceptance** —
   which `single_provider_mode` already requires. The eye is the authority
   here; the band exists so the result is measurable and cannot drift silently.

## Freeze boundary

- **Defect remediation** (in scope, no new owner decision): the radar's double
  ellipse; weight rendered with a delta glyph; the `VOO UNAVAILABLE` bar; the
  legend bar's permanence; ring opacity below its own spec; the sun's scale not
  matching its spec; XIRR shouting an annualized figure off 34 days of history;
  the panel occluding the planet; a headline without a working link.
- **New creative direction requiring a new owner-scoped section:** any further
  planet-texture regeneration against the no-visible-logo theory (explicitly
  barred until measurable); any change to the health mapping, the Fraunhofer
  rule, the firewall tiers, or the signal ramps; a galaxy phase or any labelled
  door to the retained authored-system machinery; rig v1.5 items (the 90-day
  mix-held sparkline, cross-device drafts); a mobile 3D scene (settled against).

## Acceptance-ledger mapping

| proof item | criterion ID(s) |
|---|---|
| Intent — ten-second panel test | `BHV-11`, `VIS-11` |
| Plain naming, everywhere including fallback and manual | `BHV-10`, `MOB-11` |
| Window vocabulary, two attachment forms, no third | `BHV-12`, `VIS-12` |
| Panel rail width, narrower than the mock | `VIS-10` |
| Planet visibility invariant beside the panel | `BHV-13`, `VIS-13`, `DEF-02`, `VIS-02`, `BHV-05` |
| The chart that earns its toggle | `VIS-14`, `BHV-15` |
| Cuts: duplicate hero, error furniture, manual chip | `BHV-16`, `BHV-17` |
| Mission Control descent, pinned strip, section order | `BHV-14`, `VIS-15` |
| Legacy dashboard deleted, radar paused, lazy-mount | `BLD-10`, `BLD-11`, `BLD-04` |
| Correlation plain-language explanation | `BHV-18` |
| Radar: one ellipse per holding | `VIS-17` |
| News headlines hyperlink or do not ship | `BHV-19` |
| Rings full circle, floor 0.22, not graph paper | `VIS-16` |
| Sun dominance, measured in pixels | `VIS-18` |
| Trails shortened and reconciled with the ramp | `VIS-04`, `TST-03` |
| Label collision obstacle, legend demotion | `VIS-19`, `BHV-20` |
| Sector map cut, no accidental route in | `BHV-21`, `BHV-22` |
| Rig: half-unit ledger, always 100 | `BHV-30`, `TST-10` |
| Rig: gestures, siphon, keyboard, aria-live | `BHV-31`, `ACC-10`, `ACC-11` |
| Rig: readouts, ghost rings, drift | `VIS-20`, `BHV-33` |
| Rig: URL state, back is undo, guarded reset | `BHV-34`, `BHV-35` |
| Rig: mix-held identity test vs `simulateRebalanced` | `TST-11` |
| Rig: verbatim banner, no dollars | `PRV-11`, `PRV-12` |
| Rig: owner-gated in §11 | `PRV-10` |
| Rig: reduced-motion stations keep every encoding | `BHV-32`, `ACC-13` |
| Contrast computed from source tokens | `ACC-12` |
| Desktop-first, fallback unchanged below 1024px | `MOB-10`, `MOB-11` |
| Privacy: zero dollars, zero owner-only fields on `/share` | `PRV-13`, `PRV-14` |
| Tests and build green; rendered behaviour not source-asserted | `TST-12`, `TST-13`, `BLD-12` |
