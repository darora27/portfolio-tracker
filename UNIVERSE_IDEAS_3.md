# The Stock Market Universe — round 3 creative response: the colour question

Answers to the round 3 brief, in its order. Written July 28, 2026.
Grounded in the build as it exists: every colour named below was checked
against the shipped tokens in `scene-model.ts`, `planet-identity.ts`,
`orrery.module.css`, and `OrreryScene.tsx`, and every contrast ratio and
hue claim in this document was **computed, not eyeballed** (results in §8).
As before: proposals, not decisions.

---

## 0. What the references actually agree on

Read the thirteen images as one deck and they stop conflicting. In every
single one, **saturated colour is light**: CRT phosphor, false-colour
plots, neon airbrush, prism diffraction, glowing wireframe. And in every
single one, **the furniture is warm matter**: cream consoles, bakelite
buttons, paper forms, beige machines, painted cities. The two never trade
places. There is no reference with a rainbow desk or a grey screen.

Note what the owner kept in the deck: both TVA stills, the orange
sphere-computer, the beige machine at the moonlit window. Round 2's warm
chrome was not voted off — it was re-elected as the furniture. The ask is
not "replace the world," it is:

**Round 2 built the cabinet. Round 3 turns on the glass.**

Where each reference lands in this proposal:

| Reference | Lands as |
|---|---|
| Rainbow-monitor control room | Mission Control's data surfaces (§4) |
| Prism space collage (floppies, planets) | The aurora tape behind the system (§3) |
| Neon airbrushed montage on black | Trail glow discipline + glass palette (§1, §2) |
| Green-phosphor terminals | **Refused — retuned to amber phosphor** (§4) |
| Amber rounded-bezel HUD kit | Already built; unchanged |
| Pastel daylight city, McCall paintings | The FIRST LIGHT weather pole (§5) |
| Moonlit-mountain computer room | The CLEAR NIGHT weather pole (§5) |
| Red monorail hero | The lesson that one solid hue = the thing that matters (§1) |
| TVA stills, sphere computer | The cabinet, kept as-is (§2) |

---

## 1. The conflict resolved (brief §3): the Fraunhofer rule

Real starlight is not a full spectrum. It carries **absorption lines** —
narrow bands stolen by matter standing between you and the light. A
spectrograph reads a star by its missing colours.

This universe's spectrum has **two stolen lines**:

- **the green band, hue 125°–165°** — stolen by gain (`#63ef98`, 143°)
- **the red band, hue 345°–20°** — stolen by loss (`#ff665f`, 3°)

Everything else may burn. Cyan, blue, violet, magenta, pink, amber, gold,
orange — full saturation, welcome everywhere light lives. The two stolen
bands appear **only as signal**. That is the whole law, in three clauses:

1. **Meaning is light, and only meaning burns white-hot.** Red and green
   exist solely as emissive signal — trails, signed values, the trade
   comet, radar blips — and signal alone gets a white-hot core (§2). No
   decorative glow ever carries a white centre.
2. **Decoration is the spectrum minus two.** Any decorative or
   instrument light must sit outside the stolen bands (enforced at
   chroma > 0.30 — pale washes can't impersonate a signal and are
   handled by tier 2, §8).
3. **Matter is exempt.** Planet surfaces are lit, non-emissive matter —
   COST's red dock lanes and GOOG's leaf-green district are paint, not
   signal. Nothing matte glows, so nothing matte can lie.

Why this dissolves the conflict rather than splitting the difference: a
spectrum with two absorption lines **still reads as a rainbow**. Indigo
→ violet → magenta → pink → cream registers as "every colour" to a
human; no one stands in front of the aurora counting for the missing
green. But the pixel sampler counts — and it will find red and green
exactly where money put them, nowhere else.

Said plainly, because the brief asks for the pick: **the owner cannot
have indiscriminate full-spectrum colour and meaningful red/green at
full strength in the same field. Meaning wins.** The rainbow is then
rebuilt around the two reserved bands — and the result is *more*
chromatic than the references' literal rainbows, because every hue that
remains is allowed to go louder, knowing it cannot be misread.

Where the eye finds the spectrum afterward:

| Where | What's chromatic there |
|---|---|
| The sky | The aurora tape (§3) — indigo→violet→magenta→pink |
| Mission Control glass | Cold benchmark traces, ice + ember ramps (§4) |
| The cursor | The rocket's prism exhaust (§7) |
| The stars | Cyan and violet accent points (§3) |
| The planets | The approved textures — untouched matter (§6) |

---

## 2. The palette (brief §4.1)

Four layers. Two exist and are kept; one is frozen; one is new.

### VOID — the grounds (unchanged)

| Token | Hex | Where |
|---|---|---|
| `void.space` | `#020706` | Scene clear colour + fog, as shipped |
| `void.glass` | `#010806` / `#010504` / `#04110d` | Bay interiors, as shipped |

The void does not change. The references' colour lives **on** black, and
the build already has the right black — the faint green-black CRT cast
is heritage worth keeping. Richness is added in front of it, never by
lightening it. This also spares every existing baseline re-shoot the
brief didn't budget for.

### CABINET — the TVA chrome (kept, contained)

Everything from round 2's §3: creams `#fff0cf` `#f6d493` `#e8f1df`,
ambers `#ffd68c` `#efbb62` `#e6a14d`, burnt oranges `#d96f23` `#c96d32`
`#7d3d1d`, umbers `#21120d` `#3b1f12` `#160e0a`, sage `#b9cdb8`.

**Answer to "replace or contain": contain.** The cabinet is demoted from
"the whole aesthetic" to "the furniture" — bezels, tabs, nameplates,
lamps, gauges, stamps, prose, the belt, the moons, the satellites. It
gains not one new hue. A note the numbers force: the entire cabinet
lives at hue 33°–41°, only ~30° from loss-red — it has never been
misread as loss because it is matte chrome while loss is emissive
signal. That standing proof is what makes clause 1 of the law credible.

### SIGNAL — the money colours (frozen)

| Token | Hex | Meaning |
|---|---|---|
| `signal.gain` | `#63ef98` | week up — trails, signed values, blips |
| `signal.loss` | `#ff665f` | week down — same surfaces |
| `signal.flat` | `#e3b65c` | flat/no-data — the amber neutral |
| `signal.buy` | `#f4f0df` | buy comet |
| `sun.up` / `sun.down` | `#f5c45d` / `#d65a24` | portfolio health |

These are **contract values** — the live review process samples them by
pixel. Round 3 does not move them by one bit. What it adds is the
signals' exclusive property: **the white-hot core.** Each trail's core
pass gains a head→tail vertex gradient — `#fff7e6` at the planet,
resolving into pure signal hue within the first quarter-arc, fading out
along the existing taper. Gains and losses get identical craftsmanship;
a bad week is rendered as beautifully as a good one, just in red.
(Vertex colours on the existing custom geometry — no new pass, §8.)

### GLASS — the new chromatic layer (this round's addition)

Saturated instrument light, on black only, all firewall-verified:

| Token | Hex | Hue | Role |
|---|---|---|---|
| `glass.cyan` | `#4fd6e8` | 187° | pair-lines, hover linework, star accent |
| `glass.blue` | `#5f8dff` | 223° | secondary linework |
| `glass.violet` | `#8f6bff` | 255° | star accent, ramp family |
| `glass.magenta` | `#d95ce0` | 297° | aurora family, flourishes |
| `glass.pink` | `#ff70c8` | 323° | aurora hot end |
| `glass.amber/gold/orange` | `#ffd68c` `#efbb62` `#e6a14d` | 33–39° | warm instrument light (existing, promoted into glass) |
| `bench.voo` | `#5fa8c9` | 199° | VOO trace |
| `bench.vti` | `#46799c` | 204° | VTI trace |
| `bench.xlk` | `#7b6bc9` | 250° | XLK trace |

Plus three **ramps — shipped as LUTs, never improvised gradients** (why
that matters: a naive magenta→orange lerp transits crimson; §8):

| Ramp | Stops | Encodes |
|---|---|---|
| `aurora` | `#131c3f → #33307e → #63359c → #a23d9c → #e0559c → #f7a0c0 → #ffe4d6` | weekly return magnitude (§3) |
| `ember` | `#1c0f06 → #5e2d0e → #9c4f16 → #d97a2b → #ffb347 → #ffe4ad` | drawdown depth (§4) |
| `ice` | `#061018 → #123a54 → #1e6b8f → #3fa8c4 → #a8e4ef` | correlation strength (§4) |

**A gap the brief didn't assign, called here:** colour currently has no
single source of truth — hexes live in `scene-model.ts`, inline in
`OrreryScene.tsx`, in `orrery.module.css`, and in the bays. Round 3's
first buildable unit is `src/lib/observatory/universe-palette.ts`
exporting every token above (plus CSS custom properties for the DOM
side), so the firewall lint in §8 has one target and the 2D fallback
inherits the palette for free.

---

## 3. The universe background (brief §4.2)

What is behind the planets, back to front:

**1. The void — unchanged.** `#020706`, fog as shipped.

**2. The aurora: the round's one big scene move.** A broad band crossing
deep space diagonally (~28°, behind both starfields, parallax with the
far layer) — the prism road from the collage reference, made honest.
It is built from **52 stripes: the trailing 52 weeks of portfolio
return, each stripe coloured by that week's |magnitude| on the aurora
ramp.** Calm weeks are deep indigo and nearly vanish; wild weeks flare
magenta-pink toward cream. A violent quarter reads as a hot streak in
the sky; a sleepy summer fades the band to embers. The wildest thing
your money did all year is literally written across the heavens.

- Data: weekly net-of-flow returns from the existing snapshot history —
  the same series the SCOPE already draws, so this is a **re-encoding of
  data the accessible surfaces already carry**, not a new colour-only
  channel. Percent magnitudes only: public-safe on `/share`.
- If history < 52 weeks, the band is short and grows week by week — the
  sky ages with the book. That is a feature; do not pad it.
- Texture: rendered once to an offscreen canvas (~1024×256, stripe
  colour + per-stripe alpha jitter + film grain) in an idle callback,
  uploaded once. Luminance cap: composite alpha ≤ 0.32. Zero per-frame
  cost (§8).

**3. Starfields — kept, with two accents.** The three shipped tints
(`#dcebd7` white, `#8acda0` phosphor, `#d7aa63` amber) stay; add
`#4fd6e8` cyan at 1-in-23 and `#8f6bff` violet at 1-in-41. Optional
flourish, cheap and honest: accent stars twinkle **only while the market
is open** (`market-calendar` already knows) — the sky trades with you.
Reduced motion: no twinkle. The open/closed fact already lives in the
"prices as of" badge, so nothing is colour-only.

**4. The nebula — kept, plus one wisp per weather pole.** The shipped
health wisp is untouched (`#d4a846` up / `#9c3f24` down, alpha
0.08–0.15). §5 adds a second wisp at ≤ 0.10 alpha. Note for §8: the
ember `#9c3f24` sits at hue 13.5° — inside the red band — and is legal
**only** as an alpha-capped ambient wash; the new lint turns that cap
from habit into law.

What the background encodes:

| Layer | Encodes | Channel |
|---|---|---|
| Aurora stripes | 52 × weekly return magnitude | hue position + brightness on one ramp |
| Nebula hue + alpha | portfolio health scalar | as shipped |
| Weather wisp | health sign (the two poles, §5) | hue temperature |
| Accent twinkle | market open/closed | motion (optional) |
| Star positions, grain | nothing — ground texture, static | exempt: not a variable |

---

## 4. Mission Control (brief §4.3)

**Verdict: the cabinet survives; the glass turns on.** Both TVA stills
show the same desk: paper forms *and* a glowing CRT. That is the room —
**paper for words, glass for numbers.** Round 2's bay grounds are
already black glass (`#010806` family), which means the references were
half-obeyed before this brief was written. The chrome, tabs, teletype,
lamps, gauges, stamps: unchanged. The change is four recolors inside
the glass, each named:

**1. The SCOPE goes bi-thermal.** Portfolio trace stays hero amber
`#e6a14d`. The three benchmarks — today three barely-separable browns
(`#927e64` `#725f4e` `#5e5044`) — go cold: VOO `#5fa8c9` dashed, VTI
`#46799c`, XLK `#7b6bc9`. **The book burns warm; the market glows
cold.** One glance separates "me" from "everyone" by temperature, and
the muddiest corner of the room becomes its most reference-faithful.
The planet detail view's scope inherits the same rule.

**2. The PLOT radar wears the week.** Blips are currently uniform
`#cf7b46`. They take their holding's **trail colour** — semantic hue on
real data, so the radar becomes a one-glance week summary: a green
system, a red system, a mixed one. Active blip gains the white-hot core
(`#fff4d7`), consistent with clause 1. Rings stay health-tinted amber.

**3. The SIGNALS grid gets ice.** Correlation cells fill from the ice
ramp by |ρ| (brightness = strength, as designed); sign stays a glyph.
Explicitly guarded: sign must **never** take red/green — red means
"down," not "anti-correlated," and a hue that lies about which question
it answers is worse than no hue. Hover pair-lines draw in `glass.cyan`.

**4. The HAZARD column burns ember.** The drawdown pressure column
fills from the ember ramp by depth — shallow dips smoulder dark, a deep
drawdown glows toward `#ffb347`. Magnitude on a warm ramp, direction
already unambiguous (drawdown only goes down). Transit-verified (§8).

**The refusal, stated as the brief demands:** the green-phosphor
terminal reference is the one reference this response rejects. In a
system where green *is* gain, green monospace would dress every neutral
word in profit — the terminal would lie once per line. The period
answer is that CRTs shipped in more than one phosphor: **P1 was green,
P3 was amber.** This room runs P3. The teletype and all terminal text
stay in the shipped amber family (`#f6d493` on `#21120d`, 12.75:1), and
the radar-scope *form* the reference offers is kept — it is already the
PLOT — just never its colour.

---

## 5. Colour by state (brief §4.4): weather, not verdict

Yes — the universe's palette shifts with portfolio state. **One layer
shifts. Everything else holds still.** The shift is the second nebula
wisp from §3, and its two poles are designed with equal love, straight
from the two daylight/night families in the reference deck:

| Pole | Trigger | Wisp | The reference it comes from |
|---|---|---|---|
| **FIRST LIGHT** | health > 0 | `#b3479e` magenta, alpha 0.04 + 0.06·h | McCall's purple-and-amber painted skies |
| **CLEAR NIGHT** | health < 0 | `#3d5aa8` indigo, alpha 0.04 + 0.06·\|h\| | the moonlit mountains behind the beige computer |

The mood-ring trap, and the four guards against it:

1. **Only hue temperature moves.** Luminance, composition, aurora,
   chrome, text, signal colours: constant. Contrast ratios are
   identical at both poles because no text ground changes.
2. **Both poles are fully designed.** A down day is not "the pretty sky,
   removed" — it is a different, colder, *clearer* beauty. The single
   coziest image in the owner's own deck is a cold night. Bad days get
   the dignity of good art direction; that is what makes the tracker
   bearable to open in a drawdown, which is the entire point.
3. **The shift is slow and small.** Crossfade ≤ 2s on data refresh,
   capped at 0.10 alpha; reduced motion snaps. Nobody watches their sky
   mood-swing during a volatile lunch hour.
4. **The sun stays the verdict.** Both wisps derive from the same
   health scalar the sun already encodes — the sky is weather *about*
   the verdict and can never contradict it.

---

## 6. The planet textures (brief §4.5)

**Untouched.** The eight approved worlds are the matter clause of the
law: lit, non-emissive, identity-bearing. COST's signal-red dock lanes
and GOOG's leaf-green district are paint on terrain. Nothing on a
planet surface blooms, adds, or glows white-hot — those three
properties belong exclusively to signal, and the separation is what
lets the two coexist within pixels of each other at 32px.

Considered and dropped: per-planet emissive rims tinted by each world's
identity hue. It dies on its own test case — COST's identity is red;
a red *emissive* rim is a fake loss. The texture already carries
identity; the new palette's job is to stay out of its way.

One monitored token from the audit: the star phosphor `#8acda0` (hue
140° — inside the green band, chroma 0.26 — under the 0.30 gate). It
passes as-built. It goes in the lint's watch list with a comment rather
than being churned: if anyone ever saturates the starfield, the lint
catches the moment it starts to lie.

---

## 7. What stays quiet (brief §4.6)

Colour got promoted this round. These deliberately did not:

- **The void.** Still `#020706`. The night is the house; colour is the
  guest.
- **The cabinet.** Zero new hues in chrome, ever. If a bezel turns
  cyan, the room stops being a place and starts being a screensaver.
- **Text.** Cream and amber only, signed values in signal, **ramps and
  glass hues never carry a single character.** (Also the WCAG
  constraint solved by construction — §8.)
- **The sun.** The most important instrument keeps its two-colour axis.
  Nothing competes with the health read.
- **Labels, rings, belt, moons, satellites.** Slate ring `#66756f`,
  bone moons, tan rocks — the scene's matter stays matte and warm so
  trails and aurora own the light. Sector-map suns keep the sun's own
  palette.
- **Motion.** Frozen at round-2 levels. Promoting colour *and* motion
  in the same round is how command decks become carnivals.
- **The comet.** Three semantic colours, as authorized. No prism tail.

One sanctioned whimsy, because the deck is playful and the owner is
too: **the rocket cursor's exhaust becomes a prism ribbon** — a short
cyan→violet→magenta→amber gradient (the spectrum minus two, in
miniature), length and density proportional to pointer speed. It is the
only full-arc spectrum in the scene: ephemeral, user-steered, carrying
a value that is self-encoding (your own hand's velocity), and gone the
moment you stop. ≤ 24 additive points; reduced motion: plain exhaust.

---

## 8. Constraints check (brief §5) — computed, not asserted

**Semantic hexes frozen.** `#63ef98` `#ff665f` `#e3b65c` `#f4f0df`
`#f5c45d` `#d65a24` are untouched, so the live pixel-sampling baselines
for signals remain valid. Background sample points near the aurora's
path need one re-baseline; that is the only verifier churn in the
round.

**The firewall, formalized as lint** (proposed test:
`universe-palette.test.ts` against the new token module):

- *Tier 1 — emissive signal & instrument light:* chroma > 0.30 ⇒ hue
  ∉ [125°,165°] ∪ [345°,20°]. Semantic tokens whitelisted. **Result:
  all 16 glass tokens pass; nearest decorative hue to gain is cyan at
  Δ44°, to loss is orange at Δ30° (the established amber-neutral
  family).**
- *Tier 2 — ambient washes:* large-area layers are hue-exempt but
  **alpha-capped ≤ 0.18 by the same lint.** This tier exists because
  the audit caught a shipped token breaking tier 1: `nebula.down`
  `#9c3f24` (hue 13.5°). It has never been misread precisely because
  it is a ≤0.15 wash — the tier writes down why.
- *Ramp transit:* each LUT sampled at 64 points under the tier-1 rule.
  **The first aurora draft failed** (pink→cream transiting crimson at
  chroma 0.35) and was re-routed through `#f7a0c0` (hue 338°); the
  ember ramp's deep stops were retuned to `#5e2d0e`/`#9c4f16` for the
  same reason. **All three ramps now pass all 64 samples.** This is
  exactly the failure class the test exists to catch in CI.

**WCAG, computed from source tokens** (the brief's hard gate):

| Pair | Ratio | Tier |
|---|---|---|
| orientation `#e8f1df` / `#020706` | 17.46:1 | AAA |
| teletype `#f6d493` / `#21120d` | 12.75:1 | AAA |
| active bay `#fff0cf` / `#7d3d1d` | 7.28:1 | AAA |
| nameplate `#d5ba8c` / `#3b1f12` | 8.08:1 | AAA |
| cream on glass `#fff0cf` / `#010806` | 17.92:1 | AAA |
| amber on glass `#ffd68c` / `#010806` | 14.68:1 | AAA |
| gain on glass `#63ef98` / `#010806` | 13.80:1 | AAA |
| loss on glass `#ff665f` / `#010806` | 7.05:1 | AAA |

Every text colour proposed is a colour already committed — no new text
hue exists to fail. Non-text marks all clear 3:1 on glass (worst:
`nebula.clear-night` 3.11:1, `bench.vti` 4.31:1; every other glass
token ≥ 4.6:1). `OBSERVATORY_TEXT_CONTRASTS` extends with the
on-glass pairs above.

**Performance accounting** (50 ms route budget):

| Addition | Cost |
|---|---|
| Aurora | one offscreen canvas render in `requestIdleCallback` (~2 ms, once) + 1 textured quad |
| Weather wisp | +1 sprite, same geometry as shipped nebula |
| White-hot heads | vertex colours on existing trail geometry — no new pass |
| Star accents | init-time colour array change |
| Benchmarks / radar / grids | prop + CSS values, zero runtime delta |
| Prism exhaust | ≤ 24 additive points, pointer-gated |
| **Post-processing added** | **none — no bloom pass, no grading pass** |

**Fallbacks.** No new encoding is colour-only: the aurora re-encodes
the scope's own series; the twinkle mirrors the as-of badge; trail
direction keeps taper + travel + text fallback. The 2D phone fallback
and no-WebGL path inherit the palette through the CSS variables in the
new token module, and change nothing else.

**`/share`.** Weekly percent magnitudes and correlation strengths are
already public-grade. No new surface carries a dollar, share count, or
owner-only field. Canary tests unaffected.

**Proposed new checks, in the build's own culture:** the palette lint
(both tiers + alpha caps), the ramp-transit test, the extended contrast
table, and one live scene assertion — render a loss trail crossing the
aurora's hottest stripe and assert channel distance at the trail core
(the white-hot head makes this trivially separable; prove it stays so).

---

## 9. Conflicts called, positions picked

1. **Full rainbow vs meaningful red/green.** Cannot both be everywhere
   at full strength. Picked meaning; rebuilt the rainbow as the
   spectrum-minus-two. The absence is invisible to people and obvious
   to the sampler — which is the correct way around.
2. **Green phosphor vs green-means-gain.** Refused the reference —
   the only one in the deck this response rejects — and kept its form:
   the room runs P3 amber, the scope shape stays.
3. **Whole-universe mood vs the mood ring.** Both wishes survive by
   rationing: one alpha-capped weather layer moves; two designed poles
   (FIRST LIGHT / CLEAR NIGHT); everything else constant. Bad days get
   cold clarity, not ugliness.
4. **The aurora's hot end vs loss-red.** The obvious ramp transits
   crimson; caught by the transit test this document proposes, re-routed
   through hue 338°, verified at 64 samples. The tooling earned its
   place before shipping.
5. **Identity rims vs the firewall.** Dropped on the COST case — a red
   emissive rim is a fake loss. Identity stays in matter.
6. **A shipped token vs the new law.** `nebula.down` breaks tier 1.
   Rather than bending the band or churning a sampled token, the law
   grew a second tier with an enforced alpha cap. The rule improved by
   contact with the build.
7. **Gap caught beyond the brief:** no single source of colour truth
   exists; `universe-palette.ts` + lint is the first buildable unit.

---

## 10. Sequence note

1. `universe-palette.ts` + lint + ramp LUTs + contrast extension — pure
   code, no pixels change, the contract lands first.
2. Mission Control's four recolors (§4) — smallest visible win, biggest
   reference payoff.
3. Trail white-hot heads (§2).
4. The aurora (§3) — needs the weekly-series plumbing.
5. Weather wisps + star accents (§3, §5).
6. The prism exhaust (§7) — dessert, last.

*Uncommitted, for owner review. Companion palette board:
`UNIVERSE_PALETTE_3.html` — every token, ramp, and pole from this
document, rendered with live-computed contrast and firewall checks.*
