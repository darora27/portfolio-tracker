# The Stock Market Universe — round 2 creative response

Answers to `UNIVERSE_ROUND2_BRIEF.md`, in its order. Written July 28, 2026.
Owner reference picks for Mission Control: **Apollo mission ops + holographic
bridge + the Loki TVA** — warm bureaucratic retrofuture over analog consoles,
with thin holographic linework where data lives. That triangulation drives §3.
Owner will attach planet-detail inspiration images; §4 is v1 pending those.
As before: proposals, not decisions. Nothing here touches the fenced defects
in brief §4.

---

## 1. Planet textures (brief §3.1)

### The one decision that fixes most of it: composite the logo, don't prompt it

Image models mangle wordmarks — misspelled "Cotsco," warped letterforms,
half-refused trademarks. Since real branding is now allowed, use the actual
asset: **generate the world without the logo, then composite the real vector
logo onto the flat map before compression.** At the equator the projection is
nearly undistorted, so a flat overlay wraps correctly. The composite gets a
material treatment (emboss, road-paint, etched metal — per ticker below) so it
reads as *built into the surface*, not a sticker. Crisp at every zoom, spelled
correctly every time, and the emissive copy of it is generated for free by
duplicating the vector into the emissive map with a glow.

Prompt-embedded logos stay as fallback only for marks that are pure geometry
(simple glyphs survive generation; text never does).

### The acceptance test: 32 pixels

A texture is "worthwhile" when the wrapped planet passes the **32px test**:
shrink the rendered sphere to 32px and you can still name the company from
three signals — one dominant brand color, one macro silhouette feature, one
emissive signature. The current maps fail because they're uniform detail with
no macro structure: noise reads as mud at distance. Every prompt below is
built around 2–3 huge shapes, a limited palette, and glow that survives
shrinking. This is also the direct answer to "planets should read clearly at
overview" — legibility is authored into the map, not added by the renderer.

### Anatomy of the flat map (4096×2048)

- **Equatorial hero band (central ~40%):** all identity content. Logo
  composite centered at 50% width, spanning ~20% of image width (≈820px) —
  it faces the default camera and curves with the sphere.
- **Mid-latitudes:** secondary identity — continents, cities, veins.
- **Polar caps (top/bottom ~15%):** simple, dark, near-uniform material.
  Equirectangular projection crushes these bands into the poles; any detail
  there smears. Dark caps also anchor the sphere visually.
- **Seam:** left and right edges must continue into each other. No model
  reliably obeys, so fix in post: roll the image 50% horizontally, inpaint
  the now-centered seam, roll back.
- **No baked lighting.** The engine lights the sphere; a map with painted
  shadows or specular highlights fights the real light and flattens the 3D.
  Owner's five reference globes go into generation as *style images*, never
  as source pixels — they're renders, not maps.

### What the five references agree on (and what can't survive)

Devan's five globes — NVDA, ASML, IBM, GOOG, MSFT — share one composition,
and it's the recipe:

1. **A central mark facing the camera** (logo or wordmark, huge, integrated
   into the terrain).
2. **Product and heritage districts**: the surface divides into brand-color
   territories, each anchored by an icon *built as architecture* — the play
   button as a stadium-scale plaza, the Android robot as a statue, a windmill
   and canal houses on ASML's Delft-blue coast, punch-card strata and the
   Eye-Bee-M rebus on IBM. Districts are what make the planet recognizable
   before the logo resolves; they're also natural macro shapes for the 32px
   test.
3. **Glowing infrastructure veins** connecting districts (the NVDA lightning
   river) — this is the emissive layer's job.
4. **Floating label boxes and taglines** — the one element that cannot
   survive: those are compositing, not surface. Anything that must stay
   text-crisp gets composited as vector (logo yes; taglines only if truly
   wanted, painted billboard-scale or dropped).
5. **Moons and ships around the globe** — scene objects, not texture content.
   §5 gives them jobs.

### What each map carries

| Map | Carries | Never carries |
|---|---|---|
| Base | Color, macro landforms, the composited logo as material | Glow, shadows, highlights |
| Emissive | City grids, data veins, coolant rivers, logo glow copy, storm lightning on high-vol worlds | Anything that shouldn't burn on the night side |
| Normal | Macro relief — canyons, monoliths, die-edges (derived from base luminance, macro exaggerated, micro blurred) | Fine noise (shimmers at small sizes) |

**Emissive is derived, never generated separately** — a second generation
pass can't align pixel-to-pixel with the first, and misaligned glow is
instant garbage. Mask the glow hues out of the base, boost, tint to brand
color, add the logo glow layer. Normal via height-from-luminance (Sobel or
Materialize). Then: upscale to 4096×2048 if generated smaller → seam fix →
mips → KTX2, the pipeline that already exists.

### Shared prompt template

> Flat 2:1 equirectangular planet-surface texture map, unwrapped world-map
> projection, full-bleed detail edge to edge. No sphere, no globe, no space
> background, no stars, no atmosphere, no vignette, no directional lighting,
> no cast shadows — uniform flat ambient light, video-game planet texture
> sheet. [WORLD]. Detail concentrated in the equatorial and mid-latitude
> bands; the top and bottom 15% simplify into [POLES]. Bold macro landmasses
> readable at thumbnail size, dominant palette of [PALETTE]. Left and right
> edges continue seamlessly.

### Exact fills, six tickers — in the references' own language

**ASML** — WORLD: *a white-and-blue precision world: cleanroom megastructure
continents tiled with EUV optics assemblies — giant lens and mirror rings
sunk into the surface with blue laser light rising from their centers —
wafer-grid plains, coastlines of Delft-blue ceramic sea patterned like
porcelain, a district of tiny Dutch canal houses and one windmill on the
shore.* POLES: *matte slate-blue solar arrays.* PALETTE: *white, silver,
cobalt blue.* Logo composite: ASML wordmark in cobalt across the largest
white hull-plate continent; emissive = the blue laser columns, optics rims,
canal-house windows.

**GOOG** — WORLD: *a joyful product-district world: territories in
vermilion, cobalt, saffron and leaf-green, each anchored by icon
architecture — a play-button stadium plaza in the red district, an envelope
forum in the cobalt one, a map-pin monument range, a green district with a
robot statue, cloud-server archipelagos — all linked by fiber-light
boulevards over white map-tile terrain.* POLES: *soft white cloud caps.*
PALETTE: *white plus the four primaries.* Logo composite: the G as a
colored-glass circular plaza at the equator; emissive = fiber boulevards and
each district's icon glow.

**MSFT** — WORLD: *a four-quadrant world — the planet's continents divide
into four brand-color territories of cobalt, leaf-green, saffron and
vermilion meeting at the equator's center, glass-pane cities in orderly
blocks, an azure cloud layer drifting over the northern quadrant, a green
crater arena in the south, ring-road light loops in each quadrant's color.*
POLES: *pale glass ice.* PALETTE: *the four window colors on deep blue.*
Logo composite: the four-pane window mark at the quadrant junction — the
logo IS the continental structure; emissive = ring-roads and window grids.

**IBM** — WORLD: *a deep-blue heritage world: horizontal pinstripe
terrain-bands echoing an eight-bar mark, mainframe monolith mountain
ranges, punch-card strata canyons, a rebus painted across one continent as
field-scale land art — an eye, a bee, an M — quantum-dome observatories at
high latitudes, satellite-dish farms.* POLES: *dark navy with faint
pinstripes.* PALETTE: *deep blues, silver-white.* Logo composite: the
eight-bar wordmark plus a small THINK plate beneath; emissive = monolith
windows, quantum domes, pinstripe edge-light.

**COST** — WORLD: *a warehouse world organized like departments: flat-roof
megastructure continents in warm concrete grey, department districts —
produce terraces, a tire-stack crater ring, a gold-bullion vault mesa, a
food-court caldera venting steam — connected by aisle-boulevards with tiny
cart constellations in the parking plains.* POLES: *dark asphalt.* PALETTE:
*concrete grey, signal red, deep blue.* Logo composite: wordmark in red
road-paint across the largest rooftop; emissive = signage stripes, dock
lights, the food-court glow. ($1.50 hot-dog steam included.)

**CBRS (Cerebras)** — WORLD: *a wafer-scale world: the entire equatorial
belt is one continuous silicon die — copper reticle gridlines, iridescent
bronze-and-gold wafer sheen, glowing cyan coolant rivers between chip
blocks, test-probe towers at the die edges.* POLES: *raw silicon-ingot
grey.* PALETTE: *bronze, gold, cyan.* Logo composite: wordmark etched as
circuit lettering into the central die; emissive = coolant rivers plus storm
lightning — at 132% vol, the most violent weather in the system, and the map
should say so.

(INTC copper-reconstruction and NBIS newborn-accretion fills on request —
same template, same district logic.)

---

## 2. Labels and the overview composition (brief §3.2)

### The label never touches the planet

The darkening scrim dies. The ticker becomes a **tag below the planet** —
billboarded, offset ~0.35× planet radius under the disc, texture 100%
visible. Contrast comes from the tag itself, not from dimming the art: text
with a 2px dark outline (canvas-sprite labels in three.js — no new
dependency), which survives *any* background: space, rings, trails, another
planet passing behind.

On the inverse-color idea: right instinct — per-planet label identity —
wrong formula. Two problems with literal inversion: the label floats next to
the planet, so its background is mostly black space, not the texture; and
inverses land on arbitrary hues, so a teal planet gets a reddish label that
whispers "loss" in a scene where red/green are reserved for direction. Keep
the spirit: **label color = the planet's dominant brand hue, lightened to
~90% (near-white tint), plus the dark outline.** Identity-linked, valence
neutral, contrast guaranteed. GOOG's tag is faintly warm-white, ASML's
faintly violet-white.

Rules: fixed screen-space size (12px mono caps) at every zoom — labels are
instrumentation, not world objects, and ASML's tag must not dwarf CBRS's.
Hover adds the day% chip (`▼ 6.7`); ambient state is ticker only. When two
planets converge in screen space, the farther one's tag yields — slides
radially outward, and fades to 50% if still colliding. Tags default to the
anti-sun side of the planet, where space is emptier.

### The overview as a designed image

Targets for a 1440×900 frame (design values, not the opacity bug fix):

- **Planet scale: diameter ∝ √weight, floored.** Linear-by-weight makes the
  belt-adjacent planets invisible. Area-proportional reads honestly and
  keeps everything visible: ASML ≈ 68px, CBRS ≈ 24px, floor at 22px. The
  floor slightly flatters sub-4% holdings — acceptable; the tooltip carries
  exact weight (conflict called in §7).
- **Fill the frame.** Belt ring spans ~88% of viewport width; no dead
  margins. Ring spacing ≥ 1.6× the sum of adjacent planet radii.
- **Rings are the drawing.** Neutral slate at 0.30–0.35 alpha, 1.5px — the
  nested-ellipse composition is the aesthetic, not clutter. The hovered
  planet's own ring lifts to 0.6 in its trail color.
- **Trails are the color life.** Arc length 18–30° by week magnitude, two
  passes: 3px saturated core + wide soft underglow, additive blending. At
  rest the scene should read like a long-exposure photograph.
- **The background is a place, not black.** One faint nebula wisp behind the
  system, hue keyed to the sun's health palette (ember when down, gold when
  up), alpha ≤ 0.15, slow drift — this is the NVIDIA reference's green
  nebula, made honest by encoding health. Plus two starfield layers with
  slight parallax. No other ambient objects.
- **Trades are comets.** The one moving ambient object: on a day a trade
  executed, a single comet crosses the system once on load — green tail for
  a sell that realized a gain, red for a loss, white for a buy. Rare,
  event-driven, honest. (Every object encodes; shooting stars for free are
  cut.)

---

## 3. Mission Control as a TVA operations room (brief §3.3)

Reference synthesis, per Devan's picks: **the TVA's warm bureaucratic
retrofuture supplies the material world** (rounded CRT bezels, burnt orange
and cream on deep umber, stamped forms, file-folder tabs), **Apollo supplies
the operational grammar** (consoles, indicator lamps, T-minus boards,
nameplates), and **the holographic bridge supplies the data surfaces** (thin
orange wireframe projections — which the TVA war-table already is). The room
is warm, analog, slightly bureaucratic, and alive.

What makes it a command deck instead of a dashboard, structurally:

**1. It's a room with a window, not a page.** The universe stays faintly
visible behind (dimmed, defocused). A 1px cream chassis frame inset from the
screen edge, with corner ticks, holds everything — panels are bays bolted
into one machine, connected by hairline conduit lines, never floating cards
in a void.

**2. The eye's first stop: the teletype.** A full-width status line across
the top types itself once, cursor block blinking at the end:
`SOL-DEVAN · DAY −1.13% · TWR −6.71% · VS VOO −7.2% SAME PERIOD ·
DRAWDOWN −13.7%`. Everything the sun told you outside, restated as
instrumentation. (TWR, per the math rules — the teletype never quotes simple
return against a benchmark.)

**3. The plot anchors the room.** A live top-down hologram of the system —
concentric rings, moving planet blips, sun at center — drawn in thin orange
wireframe (2D canvas, cheap, no WebGL inside the overlay). Every bay refers
back to it: hover a manifest row → its blip flares; hover a correlation cell
→ a line connects the two blips; the concentration reading draws an arc
around the two inner giants. Abstract numbers get physical referents. The
plot is the room's table of contents.

**4. Bays are files.** Each bay has a **folder tab** (TVA bureaucracy):
`PLOT 00 · MANIFEST 01 · SCOPE 02 · HAZARD 03 · SIGNALS 04 · COMMS 05 ·
LOG 06`. Mono small-caps nameplates, index numbers, rounded-corner CRT
bezels with a faint inner curvature vignette.

**5. Named treatments for named content:**

| Content | Becomes |
|---|---|
| Holdings table | **The manifest.** Mono rows: brand-color chip, ticker, day ▲▼, weight as a fuel-gauge bar, contribution as a bilateral bar from a center spine (positive right, negative left — the contribution chart and the table merge into one object). Row hover flares the plot blip. |
| Returns chart | **The scope.** Recharts trace in phosphor amber on a dark etched grid; benchmarks as dim dashed traces; the 100 line drawn strong — the horizon; region below it tinted faint ember. Corner calibration stamp: `INDEXED 100 · NET OF FLOWS`. |
| Composition donut | **The ring diagram.** Concentric arcs at each holding's actual orbital rank, arc length = weight — composition and the universe become the same drawing. HHI becomes a stamped indicator: `CONCENTRATION: MODERATE` in a dashed rubber-stamp box, amber. |
| Risk block | **The hazard cluster.** Vol and beta as analog needle gauges; drawdown as a pressure column filled to −13.7% with the ATH tick at top; win rate as a segmented lamp bar; best/worst day as two stamped extremes. |
| Correlation matrix | **The signals grid.** Cells as square lamps — brightness = strength, glyph +/− for sign (never hue alone); hover draws the pair-line on the plot. Diagonal replaced by planet chips. |
| Earnings calendar | **The launch schedule.** T-minus rows: `T−2D · MSFT · AFTER CLOSE · EST 4.33`, soonest row lit. The single cheapest command-deck move in the whole room. |
| Trade log | **The captain's log.** Reverse-chron teletype lines, timestamp-prefixed: `2026-07-14 · BUY · NBIS · +2.1% OF BOOK`. Public view shows action, ticker, date, and % impact only — shares × price reconstruct dollars, so neither appears on `/share` (see §7). |
| Market-relative sentence | Lives in the teletype, not a paragraph. |

**6. Numbers behave like instruments.** Tabular mono everywhere, explicit
sign, fixed decimals. On data refresh, changed digits flip odometer-style
(120ms, reduced-motion: none). Words stay scarce: nameplates ≤2 words, no
sentence outside the teletype.

**7. Color discipline.** Chrome is constant TVA warmth — cream text, burnt
orange accents, umber field. Two things are *not* constant: the plot
hologram and the scope trace tint toward the sun's current health hue, and
semantic red/green appears only on signed values. The room stays in
character whether the day is good or bad; the data wears the mood.

---

## 4. The planet detail view, v1 (brief §3.4)

*(v1 because Devan is attaching interface references; this locks structure,
his images will tune the finish.)*

Stage direction stays as built: planet left, information right. The planet
owns ~45% of the width, rotating at its true day rate, terminator visible,
its news moon (§5) in frame. The rest of the system stays alive behind,
dimmed — you're near a world, not on a page.

The right side is **one narrow column, max five bays**, drawing on with the
staggered scanline wipe:

1. **ID plate** — `ASML · ASML HOLDING` and the day number huge with spin
   glyph: `▼ 6.7% ↺`. The number you came for is the biggest thing.
2. **The scope** — the holding's chart, ~220px tall, range detents as
   physical toggles: `7D · 30D · SINCE BUY · MAX`. Since-buy is labeled
   `SIMPLE` per the math rules; a benchmark overlay toggle adds same-period
   VOO, dashed.
3. **Telemetry strip** — exactly four tiles: `WEIGHT 27.2% · WEEK ▼2.1% ·
   VOL 55% · BETA 3.2`. Glyph + number, no prose.
4. **Transmissions** — exactly three headlines, one line each, mono
   timestamp prefix, source dot. Click opens the article; `MORE ▸` expands
   the bay in place (never navigates away).
5. **Egress** — `OPEN IN MISSION CONTROL ▸` anchored to this holding's
   manifest row, and `◂ SYSTEM` (the same exit the fenced fix restores).

Anti-wall-of-text budget, hard rules: no paragraph anywhere, headlines may
wrap once, total on-screen word count ≤ 60. If earnings are within 7 days
the ID plate gains a `T−2D` chip — same chip the launch schedule uses.

---

## 5. Moons, satellites, more systems (brief §3.5)

The grammar that prevents confusion: **moons orbit planets. Satellites orbit
the sun. Systems live beyond the belt.** And one material rule: natural
bodies are organic spheres; instruments are angular craft with a blinking
nav light. Nothing else flies.

**Moons = news, one per planet, maximum.** A planet with headlines in the
last 7 days grows a small cratered moon in close fast orbit; size = story
volume (3 buckets). Click the moon → the planet view opens directly to
Transmissions. No news, no moon — most planets are moonless in a quiet week,
which is exactly why the busy ones read. Earnings inside 7 days: the moon
gains a bright ring and a `T−nD` tag — scheduled news, same object. One moon
max is the clutter law; news *volume* is the bucket, never one-moon-per-story.

**Satellites = three portfolio instruments in tight orbit inside ASML's
ring** (today's concentration leaves that space empty — the instruments
live where the gravity is):

1. `DRIFT` — excess return vs VOO, same-period. Hover: `VS VOO −7.2%`.
   Click → the scope in Mission Control.
2. `HAZARD` — portfolio volatility; its nav light blinks at vol bucket rate
   (calm = slow). Hover: `VOL 36.7% · BETA 2.63`. Click → hazard cluster.
3. `SUPPLY` — next earnings anywhere in the book. Hover: `T−2D · MSFT`.
   Click → launch schedule.

Each satellite = one number ambient (its blink or presence), full readout on
hover, one destination on click. Anything that can't name its number doesn't
fly.

**More systems = the sector map, not open space.** Other portfolios Devan
authors (friends, ETFs, experiments) become neighboring systems. From
overview, zooming fully out doesn't reveal navigable 3D void — it resolves
into a **sector chart**: a flat map in the plot's wireframe style, one sun
glyph per system, each colored by its own health, labeled with name and day
%. Click a sun → warp (600ms starfield streak) → that system loads in the
identical grammar. Breadcrumb chip: `SECTOR ◂ SOL-DEVAN`. The space between
systems is a map because empty 3D interstitial space is expensive to build
and nothing lives there.

Authoring: `systems/*.json` — `{name, holdings: [{ticker, weight}],
trades?}`. Weight-only systems can't compute TWR, so their suns render with
a **hollow core**: observed, not owned — health from constituents' weighted
day/week returns, honestly downgraded. Owned systems (full trade history)
get solid cores. Texture reuse makes this cheap: VOO/XLK tops overlap
Devan's book heavily, so most new systems cost only their missing tickers.
Cap v1.5 at 3–4 systems.

---

## 6. The sun's hover state (brief §3.6)

Rule: **health is physiology; hover is instrumentation.** The sun's body —
color, corona, spots, pulse — never reacts to the cursor, so hover can never
be misread as a health change.

On approach: a thin **docking ring** materializes just outside the corona —
dashed, slowly rotating, clearly artificial in the reticle's visual family —
and the label extends: `PORTFOLIO` → `PORTFOLIO · ENTER MISSION CONTROL ▸`,
cursor swaps to docking orientation. Click anywhere inside the ring. On
leave, the ring dissolves. Reduced motion: static ring, same label.

Discoverability nudge: once per session, ~20s after load, the docking ring
flashes once, faintly — the sun introduces itself as a door exactly one
time. Keyboard: the sun is first in tab order; Enter docks.

---

## 7. Conflicts called, positions picked

1. **Logo fidelity vs generation.** Prompted logos misspell and warp;
   composited vector logos are crisp and always right. Picked: composite,
   always — the model builds the world, the brand asset lands in post.
2. **Size honesty vs legibility.** Diameter ∝ √weight with a 22px floor
   slightly flatters the smallest planets. Picked: floor stays; the true
   weight is one hover away, and an invisible planet is a worse lie.
3. **Moons reversed from round 1.** Round 1 rejected moons as decorative
   hierarchy. The owner's assignment — moons open news — gives them a real
   job, which dissolves the objection. Reversal adopted, with the one-moon
   law as the clutter guard.
4. **Trade log on the public view.** Shares and prices reconstruct dollar
   amounts, which `/share` must never leak. Picked: public log shows
   action/ticker/date/% impact; the full ledger stays owner-only. The
   privacy tests extend to the new surface.
5. **TVA-constant chrome vs health-tinted room.** Both wishes can't own the
   whole room. Picked: chrome constant, data surfaces (plot, scope trace)
   carry the health hue. The room keeps character; the data wears the mood.
6. **District-rich textures vs the 32px test.** The references are busy;
   thumbnails punish busy. Picked: districts yes, but 2–3 macro districts
   dominate each hemisphere with one emissive signature — detail lives
   inside macro shapes, never instead of them.

---

## 8. Sequence note

Textures are re-generation, not re-engineering — the KTX2 pipeline exists.
Suggested order: (1) regenerate maps per §1 with logo composites — ASML,
GOOG, MSFT first, since references exist; (2) labels + overview composition
(§2) — pairs naturally with the fenced visibility fixes; (3) Mission Control
reskin (§3); (4) planet view v2 after Devan's references land (§4); (5) sun
hover (§6); (6) moons → satellites → sector map (§5), in that order —
moons are per-planet payoff, the sector map is the galaxy's first real step.

*Uncommitted, for owner review. Nothing here decides the §4 fenced fixes.*

---

## 9. Owner corrections and authorizations (recorded July 28, 2026 by `claude/fable-5`, cowork)

Adopted, with four corrections. Everything not listed below stands as written.

### 9.1 CORRECTION — texture resolution: 4096×2048 is not shippable

§1 specifies 4096×2048 maps. Measured against the current pipeline's observed
compression (~1.28 bytes/pixel, from the shipped 512×256 maps at 163 KB each):

| Resolution | Per map | 24 maps |
|---|---|---|
| 512×256 (shipping today) | 163 KB | **3.3 MB** |
| 1024×512 | 0.64 MB | 15.3 MB |
| 2048×1024 | 2.55 MB | 61.3 MB |
| 4096×2048 (as proposed) | 10.2 MB | **245 MB** |

245 MB cannot ship on a route that must hold a 50 ms long-task gate.

**The real lever is compression, not resolution.** 1.28 bytes/pixel indicates
UASTC (high-quality) mode. KTX2's ETC1S mode runs 0.25–0.5 bytes/pixel — about
4× smaller — and is well suited to this content.

**Directed:** tune compression first, then ship **base at 2048×1024, emissive
and normal at 1024×512.** Normal maps carry macro relief that survives
downsampling, and §1 itself notes fine normal detail "shimmers at small sizes."
Generate at 4096×2048 if the model produces better structure there, then
downsample for shipping — the source plates are archived either way.

Measure and record the real total before and after. If the measured figure
exceeds ~15 MB, reduce further rather than absorbing it silently.

### 9.2 CORRECTION — satellite placement must derive from geometry, not today's data

§5 places the three satellites "inside ASML's ring" because "today's
concentration leaves that space empty." That is a snapshot, not a rule — a
rebalance breaks it and the instruments collide with a planet.

**Directed:** compute satellite placement from actual ring geometry at render
time, with the same minimum-separation guarantee the planets already use.

### 9.3 AUTHORIZED — trade activity on the public view

Owner decision, July 28, 2026: `/share` **may** show the public captain's log —
**action, ticker, date, and % impact on the book.** Never shares, never prices,
never dollar amounts (§7.4's reasoning is correct: shares × price reconstructs
dollars). The trade comet in §2 is authorized on the same basis.

This is a **new disclosure.** `/share` currently exposes no trade data at all.
The privacy canary tests must be extended to cover the new surface: assert that
share counts, prices, and dollar patterns are absent from the public log in
HTML, RSC payload, and client bundle, exactly as the existing station tests do.

### 9.4 AUTHORIZED — stock news on the public view

Owner decision, July 28, 2026: news headlines for held tickers **may** appear
on the public view, enabling the news moons (§5) and the Transmissions bay
(§4). Headlines concern public companies and the held tickers are already
visible on `/share`, so this adds context rather than exposure.

Standard obligations still apply: no owner-only field may ride along in the
news payload, and a news-source failure must degrade gracefully (no moon, no
bay) rather than break the scene.

### 9.5 Sequencing — this document is not one section of work

The defects Devan reported alongside this round (orbit rings and trails
rendered nearly invisible, planets intersecting orbit lines when the camera is
close, difficulty exiting a planet, asteroid-belt objects not clickable, the
sun not responding to hover, and ticker labels darkening the planets) are
**regressions and gaps in §8's delivered scope.** They are being fixed as §8
remediation and are not part of this document's work.

Everything in §1–§8 above — texture regeneration, the overview composition,
the Mission Control reskin, the planet detail view, moons, satellites, and the
sector map — is **new scope** and will be specified as its own section with its
own acceptance criteria, after §8 is accepted.
