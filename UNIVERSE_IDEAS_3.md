# The Stock Market Universe — round 3 creative response: the colour question
## Revision 2 — after the owner ran the build

Written July 28, 2026. Supersedes revision 1 in place; this is one design,
not a patch list. Adopted from revision 1 and standing: **the Fraunhofer
rule, the two-tier firewall, the ramp-transit test, `universe-palette.ts`
as the first buildable unit, the P3-amber refusal, the aurora, the weather
poles, the cabinet contained as furniture.** Changed by contact with live
use: the texture clause, the frozen-hex literalism, the motion freeze, the
sun's scale, the starfield, and Mission Control's structure. Every colour
and luminance claim below is computed (§9). As before: proposals, not
decisions.

---

## 1. The law, restated in one breath

Decorative and instrument light draws from the full spectrum **minus two
stolen bands** — green 125°–165°, red 345°–20°, at chroma > 0.30 — which
belong to meaning alone. Only meaning burns white-hot. Ambient washes are
hue-exempt but alpha-capped ≤ 0.18. Matter is exempt.

One amendment, forced by §4: the whitelist inside the stolen bands widens
from **six literal hexes to two signal ramps plus four constants** — and
the lint now polices both directions: decorative light must stay *out* of
the bands, and every sample of the signal ramps must stay *in* its own
band (hue within ±10° of its anchor). The law holds; it grew teeth on its
own side of the fence.

---

## 2. The worlds, relit (revision brief §3.1)

"Textures — untouched" is dead. The owner can't see five of his eight
planets, and the marks are broken. What survives from revision 1 is the
**matter clause** — planet surfaces stay exempt from the firewall — which
was always about *exemption*, never immutability. The assets change; the
law doesn't.

### 2.1 The luminance window: [0.16, 0.55], measured from the render

The owner's report is exactly reproducible from the identity tokens. Mean
relative luminance of each world's dominant tone:

| World | brandHex | L | Owner's verdict |
|---|---|---|---|
| GOOG | `#bcc7ba` | 0.551 | visible |
| ASML | `#5c80ad` | 0.207 | visible |
| MSFT | `#5f7271` | 0.157 | visible |
| COST | `#645d53` | 0.112 | dark |
| CBRS | `#655331` | 0.092 | dark |
| NBIS | `#763a74` | 0.081 | dark |
| INTC | `#42474f` | 0.062 | dark |
| IBM | `#16295d` | 0.025 | dark |

The three he can see are precisely the three above L ≈ 0.15. So the
target is empirical, not aesthetic: **equatorial-band mean luminance in
[0.16, 0.55]** — the window the working trio already occupies — verified
from the **live sphere-strip capture** (the script exists), not from the
source map, because the render includes lighting.

**How the dark five get there without losing themselves:** keep the
identity *hue*, raise the *value structure* — the night-city strategy.
A world stays dark-souled while its architecture catches light:

| World | Keeps | Gains (firewall-checked lifts) |
|---|---|---|
| IBM | deep navy `#16295d` terrain | monolith tops + pinstripe edge-light in `#8fa3d6` (L 0.37), ~18% band coverage; denser quantum-dome emissive |
| INTC | slate plains | slate lifted to `#5a6270`; molten copper rivers widened (emissive carries the rest) |
| COST | concrete world | concrete lifted to `#8a8274` (L 0.23) — daylight warehouse, red signage stays matte paint |
| NBIS | violet accretion scar | scar core brightened to `#a05a9e` (L 0.17); violet-white terrace emissive |
| CBRS | bronze wafer | wafer sheen to `#9c7d3f` (L 0.22); cyan coolant rivers widened |

**What it costs the sky — said out loud, not left to hope:** five
brighter worlds plus a dominant sun (§6) raise foreground luminance, and
the aurora's *relative* prominence drops. Two caps move, one doesn't:

- **Aurora alpha cap: 0.32 → 0.40.** Explicit trade, spent here.
- **Aurora chord moves off-centre:** nearest screen-space approach to the
  sun's disc ≥ 1.2 sun radii — the band crosses the upper sky beyond the
  sun, not behind its glare. (Also composition: §6.)
- **The void and nebula caps do not move.** `#020706` stands; brighter
  planets pop *harder* against an unchanged night.

### 2.2 The marks: carve, don't stamp

The owner's three complaints are the three structural defects of
compositing a crisp vector over a finished painting, and one pipeline bug:

**The pick: build the mark into the material stack, three times.**

1. **Carve, don't stamp.** The vector still lands in post — generation
   still misspells wordmarks ("Cotsco" is not coming back) — but it stops
   being an *image* layered on the picture and becomes an *input to the
   material*: its albedo is the world's material treatment (road-paint,
   etched metal, inlaid ceramic — the round-2 per-ticker assignments)
   **multiplied by the underlying terrain's luminance** so ground shows
   through; its silhouette is embossed into the **normal map** so engine
   light rakes across it; its emissive copy glows on the night side; its
   mask is edge-eroded a few pixels so the boundary weathers. A mark that
   shares the terrain's lighting and grain cannot read as a decal —
   MSFT's round-2 note ("the logo IS the continental structure") applied
   to all eight.
2. **Three capitals.** The mark repeats at three longitudes, 120° apart,
   within ±18° latitude (where equirectangular stretch is ≤ 5%, which
   kills the warp complaint without pre-distortion math). One instance is
   always within 60° of facing the camera — worst-case foreshortening
   0.5×, still legible. In-world it reads as what brands actually do:
   build the same store everywhere.
3. **Brand-first entry.** Because spin is now decorative (§4), the planet
   view is free to set rotation phase on entry: the camera arrives with
   the nearest capital facing you, then the slow spin resumes. The
   recognition moment is guaranteed at the exact moment it matters, with
   zero standing cost at overview (where the 32px test — colour + macro
   silhouette + emissive signature — was always the identity carrier).

Rejected: generation-time wordmarks (misspelling), billboard marks that
counter-rotate against the surface (breaks the object's physicality), and
dropping surface marks (the owner has asked repeatedly; recognition in
scene-objects is weaker than the thing itself).

**Defect, not design:** marks rendering mirrored ("the wrong direction")
is a compositor orientation bug — flipY/seam-roll order — fix it in the
pipeline and add a chirality assertion to the sphere-strip capture so it
can't regress silently.

### 2.3 The byte budget

~23 MB sits against the 30 MB ceiling, and denser emissive costs bytes.
Plan, measured at each gate, recorded like the round-2 correction:

1. Regenerate all eight in one pass (relight + carved marks together).
2. **Emissive maps to aggressive ETC1S** — soft glow tolerates ETC1S
   artifacts better than any other content in the pipeline. Measure.
3. If > 30 MB: normal maps to 512×256 for the two smallest discs
   (CBRS, NBIS — smallest projected diameters, macro relief survives).
4. If still > 30 MB: base to 1024×512 for those same two.

If step 4 is ever reached, say so in the progress log rather than
absorbing it silently.

---

## 3. Trails: magnitude moves into the hue (revision brief §3.2)

The owner asked for the strongest kind of encoding change — one he
invented while using the thing. Adopted, with the collision he predicted
resolved as follows.

### 3.1 The ramps, with the frozen hexes as their midpoints

Weekly magnitude (same 0.2%–12% clamp the arc already uses) maps to
lightness within each semantic hue:

| Ramp | small → mid → big | Hue drift | Endpoint floors on void |
|---|---|---|---|
| gain | `#1f7a46` → `#63ef98` → `#a9ffcf` | ≤ 3.8° off 143° | 3.80:1 / 17.28:1 |
| loss | `#ff9d97` → `#ff665f` → `#b3241d` | ≤ 1.3° off 3° | 10.16:1 / 3.08:1 |

Dark green grinding upward; the neon week of your life; a pale scratch of
a down day; a deep dried-blood bad week. **The shipped hexes `#63ef98`
and `#ff665f` become the exact midpoints (t = 0.5 ≈ a ±6.1% week)** — a
typical week renders the colour every screenshot to date has shown, so
continuity is free.

The conflict inside the owner's own ask, called: **"darker means worse"
collides with "visible on a near-black void."** An honestly-dark worst
trail disappears — the IBM problem again, in miniature. Resolved by
flooring the dark ends at ≥ 3:1 against `#020706` (computed: 3.80 and
3.08). The owner gets *clearly darker*; the void never gets *gone*.
Luminance is monotonic along both ramps (verified), so ordering reads.

### 3.2 Is the redundancy worth it? Yes — and here is the argument

Arc length already encodes this variable. Keep both, because the two
channels fail differently: arc length is a *comparison* channel that
humans read badly across different ring radii (the same 30° subtends
wildly different on-screen lengths on ring 1 vs ring 8 — and rate/length
channels are exactly what the owner just told us he can't read, twice:
spin and orbit speed). Lightness is instantly ordinal at a glance with no
cross-referencing. Arc stays as the long-exposure *form*; lightness
becomes the *read*. And per the owner: **arcs lengthen, 18–30° →
36–64°** — longer trails also give the lightness somewhere to live.

The white-hot head survives at **fixed extent** — first 12% of arc,
constant intensity, every trail. Fixed, because a variable head would
adulterate the lightness read; constant, it becomes a calibration
reference sitting next to every trail body ("how dark is this trail
compared to white-hot" is an easier judgement than absolute darkness).

**Defect, not design:** trails currently sweep *ahead* of the planet —
the geometry's sign runs with the velocity, not against it. Flip it;
update the trail-geometry test. Not part of this design's scope.

### 3.3 What the sampler asserts now — exactly

The literal-hex baselines die for trails only. Replacement assertions,
runnable from the same public payload the scene reads:

1. **Hue lock:** sampled trail-core pixels sit within ±10° of the anchor
   (143° gain / 3° loss) at chroma > 0.30.
2. **Expected colour:** ΔE*ab ≤ 8 between the sample and
   `rampGain(|weekly|)` / `rampLoss(|weekly|)` computed from the payload
   — the sampler stops checking paint and starts checking the *encoding*.
3. **Ordering:** for any two same-direction holdings, the larger
   |weekly| samples lighter (gain) / darker (loss) — robust to renderer
   tone shifts.
4. **Literals stay literal** for what didn't change: flat `#e3b65c`,
   comet `#f4f0df`, sun `#f5c45d`/`#d65a24`.

---

## 4. The freed channel: banked (revision brief §3.3)

Spin-as-day-return is scrapped, per the owner. **Nothing takes the
channel.** The owner's live feedback has one consistent theme — spin
unreadable, the diagram says nothing, too many words, bays unproductive:
**the ambient scene was over-encoded relative to what a visitor can
absorb.** Re-homing day return onto some other ambient property would
re-create the disease. Day return stays where it is already read: the
hover chip, the manifest, the teletype, the fallback text. The encoding
ledger, Systems Manual, and fallback prose drop the spin row.

What decorative motion looks like, since it must now *only* be pleasing:
planets spin prograde (with their orbit), seeded periods 80–140 s so the
system never looks gear-locked; **moon orbits slow to ~40 s periods**
(the owner: "far too fast"); moons stop axial spin entirely. And the one
dividend already spent: decorative spin is what makes **brand-first
entry** legal (§2.2.3) — you cannot phase-snap a rotation that encodes
data, but you can phase-snap scenery.

---

## 5. The sun: bigger than everything (revision brief §3.4)

New rule: **`sunRadius = max(2.4, 1.25 × largest planet radius)`** —
strict ordering over every planet (with the current book: ~2.44 vs
ASML's 1.95), capped near 1.25× because the owner's sentence ends at
"bigger than the planets," and a to-scale sun would end the planets as
content. The sun is the *largest* body, not the only one.

Ripples, traced:

- **Layout:** the satellite ring and first orbit already derive from
  `SUN_BODY_RADIUS` plus clearances, and the camera already binary-
  searches to fit the belt at 88% span — the system re-fits itself. Net
  effect: everything breathes outward slightly; no constant hand-tuning.
- **The sky (asked directly):** yes, it moves. The aurora's diagonal
  through frame centre dies — a dominant central body was exactly what
  that diagonal never had to negotiate. The band becomes an upper-sky
  chord, ≥ 1.2 sun radii clear of the disc (§2.1), which reads *more*
  like a milky way seen past a foreground star, not less.
- **Luminance at centre:** corona parameters scale with radius; the
  corona alpha curve (0.018–0.073) is unchanged, so centre brightness
  grows with area, not intensity. The health read improves — a bigger
  instrument.
- **Docking ring, label, hover states** scale with radius; hit-target
  code inherits geometry.

Composition note: the missing *focal hierarchy* was half of the
graph-paper problem. A sun that outranks its planets gives the overview a
protagonist; §6 does the rest.

---

## 6. "Graph paper, not stars" (revision brief §3.5)

Asked to say which — aurora or starfield — the answer is **both, because
the complaint has two parents:**

**Diagnosis.** The graph-paper read comes from (a) **eight concentric
constant-opacity ellipses** — literally compass circles — and (b) a
starfield of near-uniform dots, evenly scattered, two fixed point sizes,
no hierarchy. The aurora gives the sky an *axis and a place* — structure
— but a mechanical dot-field in front of it would still read as plotted,
not photographed. So:

**Stars become a population, not a pattern:**

- **Magnitude distribution:** ~70% faint 1px at 0.25–0.45 alpha, ~25% at
  2px, ~4% bright 3px, and the **twelve brightest get 4-point
  diffraction spikes** — the single cheapest "telescope photograph"
  signal that exists.
- **Clustering:** positions sampled from 2–3 seeded gaussian fields over
  a uniform floor — space has weather, not wallpaper.
- **Geography:** star density ×1.8 within the aurora band — the band
  reads as a stellar structure the way the collage reference's prism
  road does, not as a stripe overlay.
- Round-3 accent tints stand (cyan 1-in-23, violet 1-in-41).

**Rings stop being compass circles:** each ring gets a vertex-alpha
falloff along its own ellipse — ~0.50 in the arc near its planet,
decaying to ~0.10 at the far side, as if the body lights its own road.
Structure stays; the drafting-tool uniformity dies. Hover behaviour
unchanged.

**Owner's distinct-orbit-colours idea — split verdict, stated:** adopted
in Mission Control's radar (§7), **refused in the 3D scene** — eight
differently-coloured concentric circles is graph paper in a party hat,
and in-scene the trails already carry the week. The scene keeps slate
rings; the radar gets the colour.

The void still does not change.

---

## 7. Mission Control: structure, then colour (revision brief §3.6)

**Diagnosis first, as asked.** The "AI vibe-coded look" is not chromatic.
It is **uniformity**: every bay the same size, same 1px border, same
corner radius, same padding, same type scale, arranged in an even grid
with no dominant element — the visual signature of a system that made no
choices. **Colour alone does not remove it.** Revision 1's four recolors
stand (cold benchmarks, radar week-colours, ice correlation, ember
drawdown) but they are seasoning. The meal:

**1. One dominant.** The PLOT — the thing the owner already loves — grows
to ~55% of the overlay, full height, left side, with true chassis (2px
frame, corner ticks). Everything else is subordinate by construction.
The right rail stacks MANIFEST, SCOPE, LAUNCH; a narrow bottom strip
carries HAZARD and SIGNALS as instruments. No two bays the same size.

**2. One huge number.** The teletype strip keeps its typed line, but the
day number becomes a real instrument readout — **64px**, the largest
thing in the room. Type scale now spans 64 → 15 → 11px; the current
everything-at-12px flatness is the vibe-code tell.

**3. Materials split, visibly.** Revision 1 said "paper for words, glass
for numbers" — the build renders every bay as identical dark cards. Make
the metaphor physical: instruments stay black glass with CRT-curved 10px
bezels; **the LOG and the BRIEFING become actual parchment** — `#f0e2c4`
paper, `#2b1a10` umber ink (13.02:1, AAA), 2px corners, a deckled edge,
tabs like file folders. A TVA desk is CRTs *and* paperwork. Material
contrast is what generated interfaces never have.

**4. The word budget, enforced.** The far-left column the owner won't
read — dies. Its prose compresses into the teletype line and a `BRIEFING
▸` paper folder that unfolds on demand and folds away. Re-asserted from
round 2, since the build drifted: nameplates ≤ 2 words, no sentence
outside the teletype, headlines wrap once.

**5. Asymmetry with reasons.** Gutters differ (dominant 20px, strip
10px); tabs size to their names; stamps sit slightly over frame edges;
the concentration verdict stays a dashed rubber-stamp. Uniformity is the
tell; wear is the cure.

**The radar earns its keep** (owner: "very cool but does not say
anything" — his fix adopted and extended):

- **Rings take their holding's signal-ramp colour at its current week
  value** — the radar becomes the week at a glance, in the exact
  encoding the scene teaches. A tiny ticker label sits at each ring's
  outer edge. (This is where the distinct-orbit idea lives.)
- **Blip size ∝ weight**; hover still flares scene + row.
- **Click a ring or blip → that holding's manifest row expands in place**
  into a detail card (sparkline, day/week/weight, latest headline);
  Enter or double-click → full planet view. One gesture, information.
- **The sweep**: a slow radar sweep whose period equals the data-refresh
  interval — decorative theatre that honestly encodes staleness (a fresh
  sweep means fresh quotes). Reduced motion: no sweep, timestamp stamp
  instead.

**Every bay must name its question or die:**

| Bay | The question it answers | Click-through |
|---|---|---|
| PLOT | where is everything, and how was the week | ring → holding card |
| MANIFEST | what do I own, at what weight | row → detail card |
| SCOPE | am I beating the market | range detents, benchmark toggle |
| HAZARD | how much can this hurt | → drawdown history |
| SIGNALS | what moves together | cell → pair-line on PLOT |
| LAUNCH | what's next on the calendar | row → that ticker's card |
| COMMS | what's being said | headline → article |
| LOG (paper) | what did I do | entry → trade context |

**The planet detail panel** (owner: too small, too many words, better
font): panel widens to ~40% of the viewport (min 560px); body text
15px, headlines 15px, the ID-plate day number **64px** to match the
teletype's scale logic. Typeface: **Chakra Petch** (600) for nameplates,
tabs, and the ID plate — the Eurostile-descended retrofuture face, free
via Google Fonts, self-hosted — while all numerals stay in the mono
stack with `tabular-nums`. Word budget unchanged from round 2 (≤ 60
words on screen), which the larger type now enforces physically.

---

## 8. What stays quiet — revised ledger

- **The void**: unchanged, still `#020706`. Third revision saying so.
- **The cabinet**: no new hues, now with material contrast instead.
- **Text**: cream/amber + signed values; ramps still never carry text.
- **Scene rings**: slate, now with falloff — but never per-holding hue.
- **Belt, satellites**: untouched this round.
- **The comet**: three colours, semantic, no prism tail.
- **Motion**: *reduced* overall — spin slowed and de-encoded, moons
  slowed, one sweep added with an honest meaning. The freed channel is
  banked, not spent (§4).
- **The prism exhaust**: survives as the one whimsy, unchanged.

---

## 9. Constraints check — computed, revision 2

**Firewall v2.** All revision-1 results stand (16 glass tokens clean;
three decorative ramps transit-clean; ambient tier capped). New:
both signal ramps hold their bands across 64 samples — max hue drift
3.8° (gain) / 1.3° (loss) against the ±10° gate — with monotonic
luminance (gain 0.147→0.845, loss 0.476→0.109: darker *is* worse, as
ordered). Relit mid-tone accents (`#8fa3d6` `#5a6270` `#8a8274`
`#a05a9e` `#9c7d3f`) all clear the firewall — they are matter anyway,
checked out of caution.

**Contrast.** All revision-1 pairs stand (worst text pair 7.28:1 AAA).
New: paper pair `#2b1a10`/`#f0e2c4` = 13.02:1 AAA. Signal ramp dark
ends floored on the void: `#1f7a46` 3.80:1, `#b3241d` 3.08:1 (≥ 3:1
non-text gate). The neon end 17.28:1.

**Luminance law.** Worlds: equatorial-band mean L ∈ [0.16, 0.55],
asserted from the live sphere-strip render per world. The window is
derived from the built, owner-approved trio (0.157 / 0.207 / 0.551),
not from taste.

**Bytes.** 23 MB now; regeneration plan with measure-gates (§2.3),
ceiling 30 MB, escalation recorded not absorbed.

**Performance.** Everything here is init-time (star population, ring
vertex alpha, texture load), 2D-canvas (radar), or CSS (Mission
Control). The aurora remains one prebaked texture. No post pass. The
50 ms route-owned budget is untouched; texture regeneration is offline.

**Sampler.** Trail assertions upgraded per §3.3 (hue lock, ΔE ≤ 8 vs
data-derived expectation, ordering, literals for unchanged tokens).
Sphere-strip capture gains the mark-chirality assertion. Aurora-adjacent
background baselines re-shot once.

**Fallbacks & ledger.** Spin leaves the encoding ledger, Systems Manual,
and fallback prose. Trail magnitude is now triple-carried (arc,
lightness, fallback text) — nothing lives only in colour. Reduced
motion: no sweep, no twinkle, static trails with taper + white head
still showing direction of travel.

**`/share`.** Ramp inputs are public weekly percentages; the detail
card shows nothing the manifest doesn't already show. No new leakage
surface.

---

## 10. Conflicts called, positions picked

1. **"Darker red = worse" vs a near-black void.** An honest dark is an
   invisible trail. Floored both ramps' dark ends at ≥ 3:1 (computed
   3.80 / 3.08) — the owner gets *darker*, never *gone*.
2. **My "textures untouched" vs five invisible planets.** The owner
   wins, and the matter clause survives intact — it governed exemption,
   not immutability. Relight + carve in one regeneration pass.
3. **White-hot heads vs lightness-as-magnitude.** A variable head would
   pollute the read; a fixed 12% head becomes its calibration reference.
4. **Logos always visible vs projection physics.** Not billboards —
   three carved capitals plus brand-first entry. The mark is guaranteed
   at the moment of attention and honest the rest of the time.
5. **Redundant magnitude encoding.** Earns its cost: the owner has now
   rejected two rate/length channels (spin, orbit speed) as unreadable;
   lightness is the ordinal channel he reads instantly. Arc demotes to
   form, lengthened 36–64° per his ask.
6. **The freed spin channel.** Banked, against the temptation to spend
   it — over-encoding is the complaint under half his feedback. The
   scene loses ambient day-return; the chip, manifest, teletype and
   fallback keep it.
7. **A decorative radar sweep vs "nothing decorative."** Tied its
   period to the data-refresh interval: the sweep now encodes staleness.
8. **Distinct orbit colours (owner's idea).** Adopted in the radar,
   where it makes the diagram *say* something; refused in the 3D scene,
   where eight coloured compass circles would deepen the exact
   graph-paper read he's complaining about.

---

## 11. Sequence

1. `universe-palette.ts` + firewall v2 + signal-ramp LUTs + sampler
   upgrade — the contract, before any pixel moves.
2. Sun scale rule + trail ramps/arc lengths + trail-behind fix + spin
   de-encoding and new rates — small scene-math diffs, big felt change.
3. Star population + ring falloff — the graph-paper cure.
4. Mission Control restructure (§7) — dominant plot, materials, word
   budget, radar click-through, detail panel.
5. Texture regeneration batch (relight + carved marks, byte-gated).
6. Aurora reposition + weather wisps + brand-first entry + sweep.
7. Prism exhaust — still dessert, still last.

*Uncommitted, for owner review. Companion board updated in place:
`UNIVERSE_PALETTE_3.html` — now including the signal ramps, the world
luminance audit, and the revised aurora cap.*
