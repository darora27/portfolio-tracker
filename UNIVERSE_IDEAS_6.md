# The Stock Market Universe — round 6 creative response: depth, atmosphere, and flight

Answers to the round 6 brief, in its order. Written July 29, 2026. Companion
to `UNIVERSE_IDEAS_3.md` (colour and material), `_4.md` (the DRAFT rig), and
`_5.md` (legibility), all adopted and largely built, and to
`OWNER_FEEDBACK_LEDGER.md`, which is newer than any of them and governs where
they disagree. Every visibility, contrast, and cost claim below is computed
from the source tree at head (§7). As always: proposals, not decisions.

**A working mock ships alongside — `UNIVERSE_STOCK_LAB.html`** — the Chart
Room at real proportions with demo data (stamped as such), working range
detents and overlay toggles, all four instruments drawn from the demo series,
and the §3 cursor physics live on the page so the flight model can be felt
rather than imagined.

The round's centre of gravity is §1, as briefed. One sentence to hold it:
**the planet panel is the ten-second read; the Chart Room is the ten-minute
one — and it stays readable because the room is dense while every instrument
in it is sparse.**

---

## 1. The Chart Room — the stock technical dashboard (brief §1)

### 1.1 What it is, and where it lives

The universe has three places with material truths: the scene (deep space),
Mission Control (the warm ops room), and the DRAFT rig (the workbench you
carry). This round adds the fourth and deepest: **the Chart Room** — the
navigator's room where one holding is laid out on the table and actually
worked. Rooms may have names (the round-5 rule: *things are labelled by what
they are; only the room is labelled by what it's called*); everything inside
it says what it is.

It is a **full-viewport overlay with its own descent**, structurally a
sibling of Mission Control, not a bay inside it: a pinned identity strip, a
dominant instrument, a bench of smaller ones. It opens *over* whatever you
were doing and ESC/`◂ BACK` returns you there. State lives in the URL —
`?chart=IBM` — composing with the existing params, so a deep look is
shareable and the back button is the exit. Content width
`min(1360px, 100% − 3rem)`: wider than Mission Control's 1120px, because the
owner asked for a *full-scale* graph and the graph is the reason the room
exists.

**Three doors in, exactly as asked:**

1. **HOLDINGS rows.** A row click opens `?chart=<ticker>` (today it flies to
   the planet — the owner's sentence overrides: *"when you click on a stock
   in the holdings section… it should pull up a technical dashboard"*). The
   planet keeps its own doors (the scene, and a `VISIT PLANET ▸` link in the
   Chart Room strip).
2. **The ORBITS radar.** Ring or blip **single click** opens that holding's
   Chart Room. Hover already does the highlighting, so the click was
   underemployed; double-click keeps flying to the planet. This is what
   finally answers "very cool but does not say anything" — the diagram
   becomes the door to the deepest surface in the product.
3. **`FULL ANALYSIS ▸`** on the planet panel. Today that button scrolls to a
   table row — a promise with no room behind it. It opens the Chart Room. The
   belt bodies' semantic rows get the same door; every holding has a Chart
   Room, planets and belt alike.

### 1.2 How a dense surface stays readable — the instrument law

Round 5 answered density for Mission Control with one dominant element and
material contrast. That answer does not transfer whole — this room is
*permitted* to be dense; it is the one surface where depth is the point. The
answer here is older than software: it is how real chart rooms and control
benches survive their own density.

**The law: the room may be dense; no instrument may be.** Concretely:

- **One instrument, one question, one computed quantity.** Every instrument
  is titled by its question, carries its window word, and stamps its sample
  size. An instrument that cannot name its question is cut.
- **Each instrument passes the ten-second test alone.** The room passes no
  collective test — that is what the strip is for.
- **The strip preserves the shallow read inside the deep room.** The planet
  panel's five glance zones ride at the top, pinned. You never trade the ten
  seconds to get the ten minutes.
- **Sparse chrome per instrument: ≤ 12 words** — title, window, n-stamp,
  verdict. The word budget moves from the surface to the instrument, which
  is what lets eight of them coexist.
- **Below minimum history an instrument stands by, honestly.** The XIRR
  precedent: `NEEDS 10 SESSIONS`, never a confident shape from four points.

### 1.3 The strip

64px, pinned, the Mission Control grammar with the identity swapped:

```
CHART ROOM   IBM · INTERNATIONAL BUSINESS MACHINES        TODAY ▼ 0.7%
WEIGHT 7.6 · WEEK ▼ 2.1 · 30D ▲ 12.4 · SINCE BUY ▲ 41 (SIMPLE) · EARNINGS T−12D
                                        VISIT PLANET ▸   ·   ◂ BACK
```

Hero at 24px, chips at 13px with window words in `#d5ba8c` (10.81:1 on
glass), everything from the public payload the panel already reads. `◂ BACK`
is a history pop — the room closes to wherever it was opened from.

### 1.4 The graph — the dominant instrument

Full width, ~56% of viewport height. The `ReturnInstrument` grown up, not a
new organism — same axes law (three hairlines, labelled left, solid baseline
`#f4dba8`), same title-carries-the-answer rule (`30 DAYS · ▲ 12.4%`), same
detents (`7D · 30D · SINCE BUY · MAX`).

What it gains at full scale — each a labelled physical toggle, each a real
series the project already computes, defaults chosen so the first paint is
calm:

| Toggle | Series | Default | Who |
|---|---|---|---|
| `MODE: RETURN / PRICE` | indexed return (existing) / raw closes | RETURN | both |
| `VOO · SAME PERIOD` | benchmark index, dashed cold blue (existing) | on | both |
| `BOOK · SAME PERIOD` | the portfolio index over the same window — *did this stock beat my own book* | off | both |
| `DEPTH` | the running-peak line with the below-peak stratum shaded ember — drawdown drawn as depth, not told as a number | off | both |
| `TRADES` | buy/sell glyphs at trade dates (the public log's fields: action, date) | off | both |
| `COST` | the average-cost line in PRICE mode | off | **owner** |

The hover crosshair, endpoint chip, and 8%-padded auto-scale carry over
unchanged. `BOOK` uses the same-period construction the maths rules demand —
both series indexed from the window start, differing only in what they hold.
`DEPTH` is the drawdown mathematics the RISK bay already trusts, pointed at
one holding and finally given a shape: the stratum between the peak line and
the trace *is* the drawdown, and the deepest scar carries its date.

### 1.5 The instrument bench — where the mathematics is the ornament

One row, four instruments, equal frames (~220px), black glass, amber
linework. This is the "unique kinds of mathematical modeling" ask honoured
literally: each is a *plot of a quantity the project already computes*, drawn
so the mathematics is the visual. Nothing invented, nothing decorative.

**DISTRIBUTION — is today normal?** The holding's daily returns since buy as
a physical histogram: vertical amber bars, 1%-wide bins clamped at ±8% with
pooled tails (n is small — 30–60 sessions — so coarse bins are the honest
choice). Overlaid: the mean tick, the ±1σ band as a faint bracket, and
**today's return as the lit needle** in signal colour — the one conclusion,
in the one colour conclusions are allowed. σ here is daily; the panel's `VOL
104%` is annualized, and the caption says so once: `σ DAILY 2.1% · VOL ANN
104%`. Stamp: `SINCE BUY · N=41 SESSIONS`. This is the instrument that makes
volatility legible — the number becomes a shape, and today lands somewhere
on it.

**VS MARKET — does it move with the market, and how hard?** The two-axis
plot the brief names: this holding's daily return (y) against VOO's (x) on
shared dates, the same pairing `per-holding-risk.ts` already builds under
its `MIN_OVERLAP = 5` rule. The cloud is the actual days; the fitted line's
**slope is the shipped beta figure** — the caption is the proof: `SLOPE =
BETA −1.84 · FIT r −0.62 · N=38 SHARED DAYS`. Quadrants labelled `WITH ·
AGAINST` at 11px. Today's point white-hot. Beta stops being a bare number
the owner has to trust and becomes a picture of the relationship it
summarizes.

**DEPTH — how far under its own high?** The drawdown ladder as a gauge: zero
at the top, the current position as a needle riding a vertical track, the
worst-ever mark as a scar with its date: `OFF HIGH −18.2% · WORST −27.9% ·
JUL 02`. Same computation as the graph's `DEPTH` shade — the gauge is the
summary, the shade is the history, one source of truth.

**MOVES WITH — is this its own bet?** The holding's correlation row against
the other holdings — already computed, currently a colour grid the owner has
told us he cannot read. Here it is drawn as an instrument instead: a centre
spine at r = 0, one signed horizontal bar per sibling, sorted, labelled
`MSFT +0.81` at 13px. And because round 5's lesson was that he wants
*meaning*, one templated sentence beneath, ≤ 14 words, from the data:
`IBM AND MSFT MOVED TOGETHER ON MOST SHARED DAYS — ONE BET, TWICE.` (template
picks phrasing by the top |r| band; no free prose). Stamp: `SINCE BUY ·
SHARED DAYS`.

### 1.6 The plates

Below the bench, two half-width plates and the news:

- **CONTRIBUTION & POSITION.** `CONTRIBUTION · SINCE BUY ▲ 3.1% OF BOOK ·
  RANK 2 OF 13` as a balance bar against the sibling ranks (contributionPct
  is already in the public payload). **Owner view adds the dollar tiles** —
  `VALUE · COST BASIS · DAY $ · SINCE BUY $` — the old route's StatCards
  reborn as one row of glass tiles, 24px numerals.
- **THE COMPANY PLATE.** The pre-Phase-10 route's Finnhub block in the
  room's voice: the 52-week range as a linear gauge with the price needle,
  `P/E TTM · MKT CAP · DIV YIELD` as three labelled readouts, and the
  analyst consensus as a five-segment meter (`SB B H S SS`) with counts —
  company facts, public. Served through the existing api-cache with a 24h
  TTL so the public room costs Finnhub one fetch per ticker per day.
  Estimated annual dividend income derives from position value → owner-only.
- **NEWS.** The three-headline block, every headline a real link (the ledger
  rule), timestamped, `MORE ▸` into the room's NEWS section filtered to the
  ticker.

### 1.7 Owner and public — the stated position

**The Chart Room is one surface projected by viewer identity, the settled
Mission Control pattern — not a second gate.** Public (`/share`) gets every
percentage instrument: the graph in both modes (closing prices are public
facts), VOO/BOOK overlays, DEPTH, TRADES glyphs (the public log already
publishes action+date+impact), the full bench, contribution rank, the
company plate. **Owner-only, because they carry dollars or derive from
them: the dollar tile row, the COST line, and estimated dividend income.**
Nothing else needs the gate. The public projection is tested with the same
canary values `/share` already uses — the Chart Room adds no new leakage
surface because it reads the same public payload the panel reads, plus
cached company facts.

### 1.8 What it costs — the honest ledger

The long-task gate is breached (57–65ms against 50, unmoved across five
measurement rounds, root-caused to route-chunk hydration) and §11 carries it.
The Chart Room is designed to add **zero** to that number, by construction
rather than hope:

| Item | Cost |
|---|---|
| Room code | `dynamic()` import, mounted only when `?chart=` is present — the shipped DraftRig pattern. Route-load hydration delta: 0. |
| Bench + plates | static SVG/DOM (the ReturnInstrument pattern), no canvas, no rAF except the existing hover crosshair. Idle cost: 0. |
| Data | public payload already carries per-holding chart/vol/beta/correlation/contribution; owner plate + pairs fetched on open via one route handler, api-cached. |
| Open transition | one overlay mount; instruments render from ≤ 260-point series — well inside a frame. Measured at review like everything else: the open must attribute no route-owned task ≥ 50ms. |
| Bytes | no textures, no fonts. ~0. |

A lazy room is also the *correct* room: depth that loads when summoned is
the product's whole thesis in miniature.

### 1.9 Refused, with reasons

- **No indicator zoo** — RSI, MACD, Bollinger, moving-average ribbons. They
  are the costume of technical dashboards, but they would be the first
  numbers in the product the tested math core does not own, and they whisper
  trade signals — the exact liability the DRAFT rig's mandated banner exists
  to avoid. The instruments above are deeper, not louder: every one is a
  quantity the project already computes, given a body.
- **No second navigation system.** The room has one door out (`◂ BACK`) and
  two lateral doors (planet, ticker-filtered news). No prev/next-holding
  carousel — the radar and HOLDINGS are the index; the room is the depth.
- **No live-ticking instruments.** The bench draws once per open from the
  daily series. The one live number is the strip's TODAY, on the existing
  quote refresh. Stillness is what makes density survivable.

---

## 2. The sky — "a futuristic portrayal of retro futurism" (brief §2)

### 2.1 First, the brief's question answered: built, and structurally muted

The round-3 aurora **is built** (`auroraDescriptor` → one additive plane,
magnitude-striped from the rolling weekly series through the aurora LUT) and
so is the health nebula (`nebulaForHealth` → gold `#d4a846` / ember
`#5a3f38` arc). Neither is the problem alone. Computed from source:

1. **The aurora's opacity is `0.02 + wildness × 0.38`**, where wildness is
   the *wildest* rolling week over the trail clamp (12%). A calm book renders
   the year's sky at alpha ≈ 0.02–0.2 — the round-3 trade that raised the cap
   to 0.40 never bought a floor, so the aurora is invisible exactly when the
   portfolio is calm, which is most of the time.
2. **The nebula is a flat single-colour arc** — one `RingGeometry`, one hex,
   alpha 0.15. It encodes health sign correctly and reads as a smear, not
   weather.
3. **The visible sky behind the WebGL scene is a CSS tile.** The renderer
   clears transparent onto `.starField`, which paints stars as *two
   repeating radial-gradient grids* on 89×83px and 137×131px tiles. Round 3
   wrote the law — *space has weather, not wallpaper* — and built a 1024-star
   clustered population with diffraction spikes to obey it; the CSS wallpaper
   behind it was never retired. A periodic tile is the "meh": the eye finds
   the repeat in seconds.

So: part tuning problem, part design problem, one genuine defect. Five
moves, all inside the standing law (Fraunhofer untouched; ambient washes
alpha-capped; no encoding lives only in colour):

### 2.2 The five moves

1. **Retire the tile wallpaper.** The WebGL star population owns stars. The
   CSS layer keeps only its dark base gradient (it is also the no-WebGL and
   sub-1024px sky) plus the pointer parallax; the two repeating dot grids
   and the two ellipse washes die. This is a deletion, and a performance
   refund (two fewer composited gradient layers).
2. **Floor the aurora: `opacity = 0.14 + wildness × 0.26`.** Cap unchanged
   at 0.40; the calm-book floor becomes 0.14 — *the year is always on the
   sky*, wild years burn brighter. The stripe encoding is untouched; a
   prebaked vertical falloff mask makes the plane read as a curtain rather
   than a rectangle. New sampler assertion: centre-band sampled alpha ≥ the
   floor token, so it can never silently vanish again.
3. **Give the nebula matter.** Replace the flat arc colour with one
   offline-generated filament texture (512×256 KTX2, tens of KB against the
   30MB ceiling at 22.8MB), tinted by the same two health anchors — gold
   hue 41°, ember hue 12°, both chroma-checked clear of the stolen bands
   (§7). Same encoding (sign → hue family), same alpha cap 0.18: the health
   tint stops being a wash and becomes weather. This is the reference
   deck's "nebula behind the world," done with the aurora's own prebake
   pattern.
4. **The TVA register lives in the frame, not the void.** Miss Minutes is
   warm equipment between you and the picture. Concretely: a **black
   corner vignette** (radial, transparent at centre, ≤ 0.35 at corners —
   darkening only, which *raises* light-on-dark contrast; the loss-ramp
   dark end computes 3.08 → 3.11:1) and **static warm grain** baked into
   the same overlay at ≤ 0.05 umber — worst case moves the loss floor to
   3.06:1, above the 3.0 gate (§7). With the shipped scanlines, the sky
   becomes a broadcast received on period equipment — warm, analog,
   slightly official — without a single encoding touched. The void token
   itself does not change; fourth round saying so.
5. **One structural line, ambient tier: the ecliptic graticule.** A single
   faint great-circle arc with sparse tick marks in ring slate `#66756f`
   (chroma 0.059 — decorative tier, legal) at alpha ≤ 0.10, lying in the
   orbital plane. It gives the sky the drafted-instrument axis the TVA
   look runs on — the observatory's own reticle — and costs one line
   geometry. If it reads as clutter in the first capture, it dies without
   ceremony; it encodes nothing and therefore owes nothing.

**Refused:** any animated sky element (clouds, drifting bands, shooting
stars on a timer). The owner's feedback has one recurring disease —
over-encoding and over-motion — and atmosphere must not reinfect it. The
sky gets *matter and frame*, not behaviour. Reduced-motion and no-WebGL
paths: the vignette/grain overlay is static CSS and survives everywhere;
the fallback sky keeps its gradient; every encoded value remains in text.

---

## 3. The rocket learns to fly (brief §3)

### 3.1 Diagnosis, from source

The rocket is a DOM sprite pinned 1:1 to the pointer every `pointermove`,
drawn at a **fixed −35° attitude** forever; the prism exhaust scales with
instantaneous *pointer* speed. It cannot drift, lag, bank, or point where
it is going — it is a costume on the OS cursor, which is exactly the
owner's fourth-time complaint.

### 3.2 The model: the pointer is the helm; the rocket is the ship

**Precision is preserved by construction: hit-testing never moves.** The
raycaster and the 64px magnetic radius keep reading the *true* pointer.
The rocket becomes pure presentation — a vehicle chasing the helm. Aim
never lags because aim was never the sprite; and the existing hover flare
on targets remains the aim feedback, so the eye confirms the target, not
the rocket. A cursor with real inertia that overshoots was the named
fear; this one cannot, because the follower is **critically damped** — the
no-overshoot case of a spring-damper, by definition rather than by tuning
luck.

Per frame, inside the existing rAF loop (no new loops, ~20 arithmetic ops
and one transform write):

```
a = k·(pointer − pos) − c·vel        k = 1600 s⁻², c = 2√k = 80 s⁻¹
vel += a·dt;  pos += vel·dt          (critically damped: ζ = 1)
heading → atan2(vel) through its own 80ms smoothing; HELD when at rest
bank = clamp(headingRate × 0.12s, ±28°), added to heading
transform: translate(pos) rotate(heading + bank)
```

Felt consequences, with the numbers that produce them:

- **Trail while flying, dock when you slow.** Steady-state lag = c·v/k =
  v/20: a fast 1000px/s sweep trails the helm by ~50px of visible drift;
  after the pointer stops, the ship settles to within 2px in ≈ 145ms
  (5.8/ωₙ, ωₙ = 40 rad/s). Flight at speed, precision at rest.
- **The nose points where it flies — and holds that heading at rest.**
  Owner decision, made against the round-6 mock: the ship never resets its
  attitude between strokes; −35° is only the pre-flight parked attitude,
  before the first input. A ship that swings back to a home angle after
  every gesture reads as a widget; one that stays pointed where it last
  flew reads as parked mid-mission. Still the single strongest "piloted"
  signal, and it is free.
- **Banking** comes from turn rate, not position — carve a curve and the
  ship rolls into it, clamped at 28° so it never reads as tumbling.
- **Thrust becomes honest:** flame and prism read the *ship's* |vel|, not
  the pointer's — exhaust dies to a pilot light as it coasts in. Today the
  exhaust flares while the sprite teleports; that inversion is half of why
  it reads as a costume.
- **Click-to-fly folds into the same integrator:** a planet click retargets
  the spring at the planet with afterburner k = 3200 (settle ≈ 100ms per
  the same formula, replacing the current 560ms hand-eased lerp) — one
  motion system, no seams.

### 3.3 Guard-rails

Reduced motion: unchanged — no rocket, system pointer (shipped behaviour).
The scripted-pointer interaction test gains four measured assertions:
settle ≤ 150ms after stop; rest offset ≤ 2px; mid-path heading within
tolerance of the velocity vector; heading unchanged (±2°) across a stop —
the no-re-park rule can never silently regress. The tuning constants ship as named
tokens (`ROCKET_STIFFNESS`, `ROCKET_BANK_CLAMP`…) so "the cursor feels
wrong" is ever after a one-constant conversation, like the ring floor.

---

## 4. The exit terminal, and the tab strip (brief §4)

### 4.1 The green terminal: diagnosis, then the happy medium

What the owner is seeing is not a designed feature. It is the **semantic
fallback layer** — the screen-reader/no-3d list of every body and
instrument — which is visually hidden on desktop *except* that
`:focus-within` reveals it; and leaving Mission Control programmatically
restores focus to the sun link, which lives inside that layer. The
accessibility terminal springs open by accident: ~20 rows of 9.6–11.5px
phosphor over the left third of the scene. He is right on every count —
it is cool (a green phosphor console over the void is exactly the
product's voice), it is too much (it is the *entire* encoding inventory),
and it is unreadable (it was built for assistive tech, not eyes).

Split the two audiences the collision fused:

1. **The exit gets a designed receipt.** Programmatic focus restoration
   sets `data-focus-source="program"` (cleared on the first real keydown),
   which suppresses the terminal reveal and instead shows a **sign-off
   card**: four lines, ≤ 20 words, 13px minimum, phosphor `#e8f1df` on
   void (17.46:1):

   ```
   MISSION CONTROL · SIGNED OFF
   TODAY ▼ 0.7% · WEEK ▲ 2.1%
   NEXT: EARNINGS T−4D · MSFT
   ⏎ RESUME · TAB EXPLORE
   ```

   It fades after 4s (reduced motion: persists until any interaction). It
   answers "where was I, what changed" — the useful fraction of what the
   terminal was accidentally shouting.
2. **Keyboard users keep the full terminal — rebuilt to be read.** It is
   their navigation and loses nothing, but gains the §5 ramp (13px rows,
   11px floor) and **grouped disclosure**: `BODIES · INSTRUMENTS · BELT ·
   ENCODING` as collapsed sections, focused group open — ≤ 9 visible rows
   at any moment instead of 20+. Grouping is disclosure, not deletion:
   every encoding stays present for assistive tech, and the fallback
   completeness tests keep passing by construction.

The cool survives; the dump dies; the accessibility layer goes back to
being excellent at its actual job.

### 4.2 The tab strip: three variants to judge, no verdict

The strip's tabs today: eight 9px labels in 1px boxes, on a translucent
green-black, under a 1px amber rule. The owner is undecided between
"nothing" and "not awful, but doesn't look right," and asked for options
rather than an answer. Three, each buildable in under a day, each with its
cost stated:

**A — NO TABS.** The nav dies. The strip keeps hero, chips, `◂ UNIVERSE`.
The chips become the doors — each already names a section (`WEEK` →
RETURNS, `OFF HIGH` → RISK), so navigation folds into the readouts
themselves. *Gains:* the calmest possible strip; his "rather be nothing"
tested honestly. *Costs:* TRADES/NEWS/CORRELATION lose their one-click
door; first-visit discoverability rests on scrolling past everything once.

**B — THE BLACK RAIL.** His two ideas, executed together: strip background
to solid bay-glass `#010806`, **no border-line** (the drop shadow already
separates it), and the tabs stay but lose their boxes — plain 11px
letter-spaced small caps (§5 floor; cream on that black computes 17.9:1),
active tab cream with an underline tick, inactive at the dim label tone.
*Gains:* tabs recede into instrument labelling; the "small font in boxes
taking up space" complaint dies without losing the jump-scroll. *Costs:*
none structural — this is the smallest change that addresses everything he
said, which is also why it should be judged against A rather than assumed.

**C — THE INDEX EDGE.** Tabs leave the strip entirely and become the
round-3 file-folder material: a vertical index down the right edge of the
descent, 11px, scroll-spy lighting the section you are in. The strip
keeps only hero + chips. *Gains:* a persistent you-are-here map that the
pinned strip never had; the folder-tab costume finally does navigation
work. *Costs:* ~90px of right edge (fits beside the 1120px room at
≥ 1280px viewports; below that it hides and behaves like A); the most
build of the three.

Screens of all three go to the owner; B is the cheapest to stage first if
he wants to feel them in the build rather than in mocks — an ordering, not
a recommendation.

---

## 5. The ramp — ending the small-font recurrence (brief §5)

### 5.1 Why it keeps coming back, measured

Round 5 set 64 → 15 → 11. The stylesheet at head has **125 font-size
declarations across 44 distinct sizes**, from 8px to 64px. **64% sit at or
below 11.5px; 24% are below 10px.** The modal sizes are 10px (19 uses),
11px (17), and 9px (10). The ramp was a spec, not a system: every new
element re-picked its own size, and the swarm regrew. Fixing elements
one at a time can never converge — the *set of legal sizes* has to shrink.

### 5.2 The ramp, as five tokens and a law

| Token | px | Role | Replaces |
|---|---|---|---|
| `--type-hero` | **56** | the one huge number per surface | 64, 56 (owner: large "just a little smaller") |
| `--type-readout` | **24** | strip heroes, plate numerals | 19–28, 32–43 display strays |
| `--type-title` | **15** | section titles, nameplates, body-plus | 14–16 |
| `--type-body` | **13** | body, table cells, chips, headlines | 12–13, most 10–11px text |
| `--type-label` | **11** | window words, axis labels, units, stamps — **the floor** | everything 8–10px |

Five sizes. Nothing below 11px anywhere on the desktop surface — the
smallest text grows ≥ 21% in height (9 → 11 is +49% in area, 10 → 13 is
+69%), which is precisely "the small fonts need to be a good bit larger,"
while the hero steps 64 → 56, which is precisely "a little bit smaller,
nothing crazy."

**Enforcement, so this is the last time:** every `font`/`font-size` in the
universe stylesheets must reference a ramp token; a source assertion fails
the build on any literal px/rem size outside the five. And because the
ledger's own rule says source greps are not rendered coverage, one
rendered check joins the review captures: computed size of a window word
≥ 11px, of a body cell ≥ 13px, of the hero ≤ 56px. Contrast at the new
floor was pre-verified in round 5: the 11px roles wear `#d5ba8c`-class
tones at 10.81:1 — AAA at any size — so the floor is now set by geometry,
not colour.

Migration is mechanical (9/10 → 11 for labels, 10/11/12 → 13 for prose and
cells, by role rather than by arithmetic) and lands as one commit with the
before/after capture pair, so the owner judges the whole surface once
rather than element by element — the failure mode this section exists to
end.

---

## 6. Fixed constraints, checked against every proposal (brief §6)

- **Fraunhofer + firewall:** new light introduced this round: none. New
  *matter/ambient*: nebula anchors gold 41.4°/0.557 and ember 12.4°/0.133,
  vignette umber 15.0°/0.078, graticule slate 156.0°/0.059 — every value
  outside the stolen bands or under the 0.30 chroma gate (computed).
  Instrument traces stay `#e6a14d` (32.9°/0.600, clear); signal colour
  appears only on conclusions (today-needles, verdict chips), the round-5
  precedent.
- **Signal ramps and samplers:** untouched. New assertions only *add*:
  aurora centre-band alpha ≥ floor; cursor settle/offset/heading; ramp
  literal-size gate; rendered type minimums.
- **Every channel encodes one number:** the Chart Room's channels are
  enumerated per instrument in §1.5; the sky's additions are ambient tier
  (vignette, grain, graticule) and encode nothing — declared as such,
  matching the starfield's standing.
- **TWR for market-relative figures:** the graph's `VOO`/`BOOK` overlays
  are same-period indexed constructions; nothing new derives from simple
  return except the labelled `SINCE BUY (SIMPLE)` chip that already
  exists.
- **Windows:** every Chart Room figure carries TODAY / WEEK / 30D / SINCE
  BUY / SINCE START or inherits from a touching header; instrument stamps
  add `N=` so small history can never masquerade as long history.
- **`/share` zero dollars:** the owner-only set is exactly the dollar
  tiles, COST line, and dividend income (§1.7); canary tests extend to
  `?chart=` on `/share`.
- **Contrast:** computed this round — receipt phosphor 17.46:1; strip-black
  tab cream 17.92:1; window words 10.81:1; loss-ramp floor under worst-case
  vignette+grain 3.06:1 against the 3.0 gate (and 3.11:1 under the black
  corner alone).
- **Desktop-first, 2D fallback, reduced motion, no-WebGL:** the Chart Room
  is DOM/SVG and works in every path; below 1024px the existing semantic
  fallback gains `ANALYSIS` text rows (values only — the phone is not the
  bench); reduced motion loses the rocket (shipped), keeps every room;
  no-WebGL keeps the gradient sky.
- **The 50ms gate:** breached at 57–65ms, carried; this round's ledger —
  Chart Room +0 by lazy mount, cursor +0 (existing rAF), sky net negative
  (two composited CSS layers deleted; one small KTX2 replacing a material),
  terminal receipt trivial, type zero. The round is a refund or neutral at
  every line; nothing in it is load-time.

---

## 7. Computed, not asserted — this round's numbers

Type: 125 declarations / 44 distinct sizes / 64% ≤ 11.5px / 24% < 10px /
extremes 8 and 64px (source scan of `orrery.module.css`). Aurora: opacity
formula `0.02 + wildness × 0.38` from `auroraDescriptor`; plane 2.6 × 0.52
outer radii; calm-book floor 0.02. Sky layers: renderer clears alpha-0 onto
a CSS background whose star grids repeat on 89×83 and 137×131px tiles.
Cursor: k 1600, c 80 (critical), lag v/20, settle ≈ 145ms, afterburner
k 3200 ≈ 100ms. Contrast: `#e8f1df`/void 17.46:1 · cream/`#010806`
17.92:1 · `#d5ba8c`/glass 10.81:1 · `#9de7b2`/void 14.01:1 (hue 137° at
chroma 0.290 — inside the stolen green band's hue range but under its 0.30
chroma gate; the terminal voice is legal by 0.010 of chroma and should
never be saturated further). Ramp floors under the new frame: loss dark
end 3.08 → 3.11 (black vignette 0.35) → 3.06 (plus 0.05 umber grain);
gain dark end 3.80 → 3.78. Long-task at head: 65/57/58/58/57ms vs 50.
Texture budget: 22.8MB of 30MB; nebula filament adds tens of KB.

---

## 8. Conflicts called, positions picked

1. **Dense vs readable — the brief's named conflict.** Chosen: density is
   granted to the *room* and denied to every *instrument* (§1.2). The
   strip carries the ten-second read inside the ten-minute surface, so
   depth never costs the glance. Where a proposed element failed the
   per-instrument test (a correlation grid, a stats wall), it was redrawn
   as one question or cut.
2. **"Technical dashboard" vs the no-advice line.** The owner's word
   "technical" invites indicator furniture; refused (§1.9). The room goes
   deeper than a trading terminal precisely by drawing only tested,
   owned quantities.
3. **HOLDINGS and radar clicks re-routed to the Chart Room.** The planet
   approach loses two doors and keeps three (scene click, semantic row,
   `VISIT PLANET ▸`). The owner's sentence was explicit; stated so the
   change is never read as a regression.
4. **"Cool terminal" vs "unreadable dump."** Both true; resolved by
   splitting audiences — a 20-word receipt for the exit moment, the full
   (grouped, re-set) terminal for keyboard navigation. The accident
   becomes two designed things.
5. **Aurora floor vs the over-encoding lesson.** The floor adds no new
   channel — it makes an *adopted, built* encoding perceivable at rest.
   Atmosphere gained this round is matter and frame only; every animated
   sky idea was refused.
6. **Tab strip: options, not a verdict** — per the owner's own framing.
   The one position taken is sequencing (B is cheapest to feel first);
   choosing is his.
7. **Inertia vs precision.** Resolved structurally: hit-testing stays on
   the true pointer; the ship is presentation, critically damped so
   overshoot is impossible by definition, with measured settle/offset
   assertions so "feels draggy" can be tuned by token instead of by
   argument.

---

## 9. Sequence

1. **The ramp** (§5) — tokens, migration, both assertions. First because
   it is the recurring failure, and because every surface after it
   inherits the fix, including the new room.
2. **The Chart Room** (§1) — loader + strip + graph with detents/overlays;
   then the bench; then plates and news; then the three doors (HOLDINGS
   click, radar click, `FULL ANALYSIS ▸`), owner plate and canary tests
   last.
3. **The cursor** (§3) — small, self-contained, the highest felt value per
   line changed in the round.
4. **The sky** (§2) — wallpaper deletion + aurora floor (tuning); nebula
   filament prebake (byte-gated); vignette/grain frame; graticule last and
   disposable.
5. **The exit** (§4.1) — focus-source flag, receipt, terminal regrouping.
6. **The strip** (§4.2) — after the owner picks a variant from screens.

*Uncommitted, for owner review. The mock — `UNIVERSE_STOCK_LAB.html`, demo
data, stamped as such — shows the Chart Room at real proportions and lets
the §3 flight model be flown before it is built.*
