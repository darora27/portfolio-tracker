# The Stock Market Universe — creative response

Companion to `UNIVERSE_DIRECTION.md`. Written July 27, 2026, against the live
data in the July 27 share-view export (13 positions, −9.62% simple return
— labeled as such per `CLAUDE.md`; TWR is the figure any market-relative
reading must use — −1.13%
day, −13.7% off the June 30 peak). These are proposals for the ten open
questions in §8 of the brief, plus the encoding gaps the brief leaves
unspecified. Everything here respects the fixed constraints in §6.
Owner picks; nothing below is self-executing.

---

## 0. Two organizing principles

**The universe is an instrument, not an ornament.** Every visual channel maps
to one real computed number, exactly one, and the mapping is stable. The
moment two numbers share a channel, or a channel is decorative, glanceability
dies. The full channel map is in §2 — the brief specified speed, spin, and
direction, but left size, distance, and color unassigned. Those free channels
are where the remaining problems get solved.

**Down must not mean ugly.** The portfolio is −9.6% today, so the *weak* sun
is the launch state — the first thing family sees. Weak states therefore
need the most art direction, not the least. An ember sun should be the kind
of moody-beautiful you screenshot. If down reads as broken or sad, nobody
shares the link on a red week, and the product only exists on green days.

---

## 1. The sun (open question 1)

**Input.** A health scalar `h ∈ [−1, +1]` blending day and week returns,
normalized against the portfolio's own recent volatility (this portfolio runs
~37% annualized — a −1% day is an ordinary breath, not a crisis; the same
−1% on a placid portfolio should read stronger). Day weighted ~60/40 over
week: the sun is "how are we doing *now*."

> **Correction — `h` reads from TWR, never simple return.** `CLAUDE.md`'s
> financial math rules are explicit: *"Never compare since-purchase simple
> return against a benchmark measured from a fixed start date — always
> same-period comparisons,"* and simple return must be *"clearly labeled"*
> wherever it appears. The sun is about to become the most prominent number
> in the product; it must be computed from the daily-net-of-flow returns that
> already power TWR, so that any market-relative reading it implies is honest.
> The math core computes this correctly today — use it. The same rule applies
> to every derived reading in this document.

**Mapping — stellar physics, not anatomy:**

| h | Color temp | Corona | Surface |
|---|---|---|---|
| +1 | White-gold | Wide, active, prominences arcing | Lively granulation |
| 0 | Warm amber | Moderate, steady | Calm |
| −1 | Deep ember red | Contracted, thin | Slow, dim, guttering |

- **Drawdown gets its own channel: sunspots.** Distance from all-time high
  maps to dark spots on the surface (today: −13.7% → clearly spotted). Spots
  persist while h recovers — which is honest: you can have a good day inside
  a drawdown, and the sun shows both at once.
- **Pulse = breathing.** Slow confident breathing when strong; shallow and
  slow when weak. Never fast/alarming — a struggling sun goes *quiet*, not
  violent. Violence reads as energy.
- **Milestone flares.** New all-time high → one dramatic prominence arc.
  Celebration through behavior, not confetti.
- **Name + day % sit on the sun's face** (per the brief), in HUD mono. The
  number is always present, so color is never the sole carrier (§6
  accessibility) and colorblind viewers lose nothing.

**On faces: don't.** Anatomy caps the ceiling — a sad-face sun is a
Tamagotchi, and the dashboard's credibility bleeds out through it. It also
degrades at phone sizes and dies entirely under reduced motion. The middle
path that keeps the personality Devan wants: the sun has *moods expressed as
weather* — flares, spots, breathing, guttering. A dying ember says "weak"
with more dignity than a frown, and it says it in every fallback mode.

---

## 2. The full encoding map (gaps the brief left open)

| Channel | Encodes | Status |
|---|---|---|
| Orbit speed | Week performance magnitude | Brief |
| Axial spin | Day performance | Brief |
| Orbit direction | Up vs. down (week sign) | Brief |
| **Planet size** | **Portfolio weight** | Proposed |
| **Orbit radius** | **Weight rank — heaviest innermost** | Proposed |
| **Trail color** | **Week performance, red→green** | Proposed |
| **Trail length** | **Week magnitude (static-readable)** | Proposed |
| Surface art | Company identity | Brief |
| Sun color/corona/pulse | Portfolio health `h` | Proposed |
| Sunspots | Drawdown from ATH | Proposed |

**Size = weight** makes ASML (27.2%) visibly the system's giant and CBRS
(3.8%) a small world — importance readable before any label.

**Heaviest innermost** is the gravity metaphor: the sun holds its most
significant companions closest. It makes concentration *visible* — today's
top-2 = 47.4% reads as two big planets hugging the sun with a lot of empty
space behind them, which is exactly what the HHI number is trying to say.
Radii are assigned by rank with a minimum angular-separation guarantee, one
planet per ring — overlap (problem 3) becomes structurally impossible rather
than tuned away.

---

## 3. Comet trails — direction at a glance (open question 3)

Every planet trails a luminous, tapering streak, like a long-exposure
photograph of the sky.

- **Taper = direction.** Humans read a comet's heading instantly; no legend
  needed for "which way is it going."
- **Length = week magnitude.** A fast mover drags a long trail. Critically,
  this makes speed readable in a *still frame* — which is the honest answer
  to the reduced-motion constraint. Freeze the whole scene and direction,
  speed, and sign all survive.
- **Color = Devan's red→green gradient, relocated.** The gradient idea from
  the brief is right; the *ring* is the wrong surface for it. A colored
  circle can't show direction, and eight rainbow rings are clutter. On
  trails, the same gradient carries sign and severity while the taper
  carries direction. Orbit rings stay as faint neutral guides.
- **Mnemonic:** gainers run prograde (counter-clockwise), losers retrograde —
  losers swim against the current. One glance shows which planets fight the
  stream.

---

## 4. Clicking a moving target (open question 2)

Don't teach users to chase planets — change what hovering means.

**Lock-on targeting.** When the pointer nears a planet (generous magnetic
radius, ≥44px including the ticker label), that planet's *orbital advance
eases to a stop* while its axial spin continues — the day-encoding stays
alive, the week-encoding pauses for you. HUD reticle brackets snap around it
with a soft tick; click anywhere inside the brackets. Pointer leaves, it
eases back into the stream. Because every planet owns its ring (§2), pausing
one can never cause a collision.

This is also mood: a targeting computer locking on is the most
retrofuturistic interaction in the product, and it lands exactly at the
moment of intent.

- **Keyboard:** Tab cycles planets in weight order with the same reticle;
  Enter travels. (The existing keyboard scaffolding carries this.)
- **Mobile:** not applicable — phones never enter the WebGL path (§7). The
  existing semantic list fallback handles selection with ordinary links.
- **Fallback if lock-on tests badly:** global time-dilation — pointer enters
  the scene, the whole system eases to ~10% speed. Keeps everything
  clickable, loses the per-planet drama. Ship lock-on first.

---

## 5. Holdings 9–13: the asteroid belt (open question 4)

Beyond the eighth orbit, a shimmering belt holds the long tail — today that's
CRM, ORCL, SPCX, KYMR, MEI (10.2% combined). Small irregular rocks, spread
along a shared ring, each with a tiny ticker tag, tinted by day sign. The
metaphor is exact: individually small, collectively real, and *where planets
come from*.

- Tap the belt → the right panel lists the five with sparklines — same panel
  grammar as a planet, no new UI language.
- **Promotion is a moment.** CBRS (planet #8, 3.8%) and CRM (belt, 3.7%) sit
  0.1% apart — membership *will* churn. Re-rank only at snapshot time with a
  ~0.5% hysteresis band so the border doesn't flicker daily. When a rock
  clears the bar, it visibly **accretes into a planet** — a small event worth
  watching for. Demotion is quiet, no funeral.
- Rejected: moons (wrong hierarchy — moons orbit planets), a plain list
  (breaks the fiction), a distant second system (that's the galaxy, v2).

---

## 6. The camera (open question 5)

**No free orbit.** Free cameras are how users get lost, labels degrade, and
composition dies. The camera is a cinematographer with three named states:

1. **OVERVIEW** — whole system framed with margin, elevated ~25° off the
   plane so orbits read as ellipses. This one choice does triple duty: solves
   the clipping/zoom problem (2), gives instant depth so circles become
   spheres in space (5), and composes the scene like the reference art.
2. **APPROACH** — the planet rendezvous (§8).
3. **COMMAND** — the sun, opening into the dashboard (§10).

Pinch/scroll zooms within bounds; drag tilts ±10° of parallax, never a full
tumble. Esc or double-tap-empty-space always returns to OVERVIEW — every
state is one gesture from home, so nobody is ever lost.

---

## 7. Phone at 390px (open question 7) — SUPERSEDED BY OWNER DECISION

**Owner decision, July 27, 2026: this is a desktop-first product. Mobile gets
no new investment.** The original proposal here — a "parade" of planets
auto-rotating past the thumb zone, swipe-to-spin with inertia, and a
bottom-sheet inspector — is withdrawn. It is preserved in git history if the
decision is ever revisited.

**What ships on phones instead: exactly what ships today, unchanged.**

Below 1024px the route already renders **zero WebGL** and falls back to a
genuinely reflowed semantic list — legend, sun, holdings with every encoded
value as text, inspector. That fallback is built, tested, and has passed live
verification at 390px and 320px across three separate review turns.

Why this is the right call rather than a concession:

- **It is free.** The work is already done and paid for. Removing it would
  cost effort and gain nothing.
- **It removes the single largest risk in this document.** Putting a textured
  3D scene on phones inverts an acceptance criterion (`canvas` count 0 at
  390px/320px) that three reviews verified live, and Turn D already found a
  +506ms mobile load regression on the *non*-WebGL path that took a full
  remediation round to close.
- **It protects the texture budget.** Because phones never enter the WebGL
  path, they never download a single planet texture. The entire asset
  pipeline in §12 becomes a desktop-only cost. This mitigation only holds as
  long as mobile stays 2D.
- **A working simple page beats a broken impressive one.** If family opens
  the link on a phone, they get something clean and readable rather than a
  struggling scene.

**"Desktop-only" does not mean "drop accessibility."** Keyboard operation,
screen-reader support, the semantic DOM, reduced-motion handling, and the
no-WebGL fallback all remain required on desktop. Those are orthogonal to
viewport width, and §9's panel removal must respect them (see the note there).

---

## 8. The zoom-in: the rendezvous (open question 6)

Click → reticle locks → the camera leaves its vantage and **arrives
alongside the planet on a curved path** — a rendezvous, not a head-on zoom.
~800 ms, interruptible, starfield streaking with parallax while the rest of
the system falls dim and out of focus. The planet settles on the left with
its terminator line visible, still spinning at its true day rate. The right
side doesn't "open a panel" — HUD elements **draw themselves on** with a CRT
scanline wipe, staggered ~150 ms apart: performance chart first, then news.

Esc pulls the camera back out along the same curve. You never teleport; the
sense of place survives the round trip. URL updates (`?planet=ASML`) so any
planet is linkable — the URL-state scaffolding already exists. Reduced
motion: crossfade to the same end state.

Panel content, telegraphic: `ASML · ▼ 6.7% DAY · ▼ 8.4% SINCE BUY`, a
week/since-purchase chart, three news headlines max, and one link — `OPEN
FULL ANALYSIS →` — into the dashboard anchored at that holding.

> **Correction — label `SINCE BUY` as a simple return, and never place it
> beside a benchmark figure.** It is a since-purchase simple return, which
> `CLAUDE.md` permits only when clearly labeled and explicitly forbids
> comparing against a benchmark measured from a fixed start date. Standing
> alone in a holding panel it is fine and useful; the moment a VOO number
> appears next to it, the comparison becomes invalid. If this panel ever
> gains a benchmark row, that row must be same-period.

---

## 9. Text and the retrofuturist frame (open question 8)

Retrofuturism and "too much text" are not in tension — the terminals of the
imagined future were *laconic*. The rule set:

- The universe speaks only in **HUD telegrams of ≤8 words**, mono, small
  caps. Sentences exist only inside the dashboard.
- Nothing is ambient. The 13-entry side panel is **visually** removed, not
  redesigned — OVERVIEW shows exactly: sun + its label, planets + tickers,
  trails, belt. Everything else is summoned (selection panel, manual) and
  fully dismisses.

> **Correction — the panel may be removed visually, never semantically.**
> That panel is currently the accessible source of truth. Acceptance
> criterion 38 requires every encoded value to also exist as text in the
> semantic layer, and §R.9 forbids essential information existing only in
> WebGL, motion, colour, speed, or direction. The visible list goes; the
> underlying DOM must survive — visually hidden, still in reading order,
> still keyboard-navigable, still carrying each holding's weight, week
> return, direction, and analytics as text. Deleting it outright breaks the
> accessibility contract and existing tests. This costs almost nothing to do
> correctly and is expensive to discover late.
- One typographic voice for chrome, one for content. Numbers in tabular
  mono. Glyphs (▲ ▼ ◆) over words wherever a glyph survives.

The CRT chrome earns its place by *withholding*: scanlines and phosphor glow
on the few elements that exist, not many elements to justify the chrome.

---

## 10. Where the dashboard lives (open question 9)

**A diegetic overlay — "Mission Control."** Clicking the sun slides a
full-screen sheet over the universe; the system stays faintly alive behind
it, dimmed and defocused, so you never leave the place. Implemented as an
intercepting/parallel route so it's linkable and refresh-safe, but closing
it restores the exact camera state. Never a hard navigation that resets the
scene — that would turn the universe back into a splash page.

Content: the existing dashboard (kept per the brief), lightly reskinned with
the HUD chrome, absorbing the good analysis from the discarded chapters —
concentration, correlation, contribution ranking, the market-relative
sentence. Mission Control is the engine room; it is *allowed* to be dense.
The universe stays sparse because this exists.

---

## 11. First-visit comprehension (open question 10)

Three layers, no permanent legend:

1. **Self-evidence first.** Labels kill "which planet is which." Trails
   self-explain direction. The sun reads emotionally before numerically.
   Design so the legend confirms rather than instructs.
2. **A three-beat transmission, first visit only.** Typed CRT text, one
   sentence per beat, skippable, ~8 s total: *"This is a portfolio." →
   "Planets are its holdings — orbit is their week, spin is their day." →
   "Tap anything."* localStorage flag; never plays again. (Distinct from the
   discarded entrance animation: this is instruction, not ceremony, and it
   runs once ever, not once per session.)
3. **SYSTEMS MANUAL, summonable.** A `?` HUD button (and `?` key) opens the
   full encoding card; Esc/tap-out dismisses. Never permanent — problem 9
   closed.

Plus one micro-hint: the first two planet selections show "spin = today ·
orbit = this week" in the panel header, then retire forever.

---

## 12. Planet surfaces: art direction for the actual top 8

Rules: equirectangular 2:1 base + emissive map + normal map per ticker,
KTX2/Basis, low-res inline → hi-res streamed. Brand-*evoking*, zero logos or
wordmarks — note the NVIDIA reference image contains a literal logo and
wordmark, so it is a mood reference, not a shippable treatment on a public
resume-facing URL. One honest flourish: **volatility sets the weather.** A
130%-vol world visibly storms; an 11%-vol world sits placid. The math core
already computes per-holding vol — let it art-direct.

| Planet | World |
|---|---|
| **ASML** 27.2% | The system's giant. A precision-optics world: continents of concentric diffraction gratings, mirror-array seas, violet EUV glow tracing fabrication canyons, light splitting into spectra along the terminator. Exact, Dutch, immaculate. |
| **GOOG** 20.3% | The index world: a planet that organized itself. Map-tile continents, playful primary-colored city lights, data-center archipelagos, lighthouse beams sweeping like search. |
| **COST** 11.8% | The warehouse world: megastructure grid, bulk-crate mesas, arterial aisle-roads converging on port hubs, permanently calm 11%-vol weather. One hot-dog geyser at the pole for those who know. |
| **MSFT** 8.2% | The azure world: glass-pane cities in four-quadrant blocks, literal cloud compute — orderly cumulus grids over blue oceans, soft teal auroras. |
| **INTC** 7.5% | The reconstruction world: an old fab empire re-industrializing. Molten copper interconnect rivers, half-rebuilt megafabs under construction glow, blue-grey silicon plains. Weathered, but the lights are on — honest for a −31% turnaround story. |
| **IBM** 7.2% | The deep-blue world: mainframe monoliths as mountain ranges, punch-card strata in canyon walls, quantum domes glowing at the poles, pinstriped cloud bands. |
| **NBIS** 3.9% | The newborn world: crust still forming, accretion ring visible, GPU-cluster cities burning through fissures, permanent lightning storms (135% vol — the youngest weather in the system). |
| **CBRS** 3.8% | **Cerebras Systems.** The wafer world: one continent that is a single colossal die — wafer-scale plains, reticle gridlines, coolant rivers glowing. *(Confirmed July 27, 2026. This treatment was proposed from sector data alone, before the name was known, and turns out to be exactly right: Cerebras builds the Wafer Scale Engine, a single chip the size of an entire silicon wafer. Keep it verbatim.)* |

Belt objects get no textures — tinted rocks with tags. Cost: one generation
pass per ticker, cached forever, regenerated only when a new ticker enters
the top 8. A few dollars total; the "no budget limit" offer is better spent
on nothing — this is an asset pipeline, not a purchase.

---

## 13. Problems → solutions

| § 4 problem | Closed by |
|---|---|
| 1 Can't click a moving target | Lock-on targeting (§4) |
| 2 No zoom, planets clipped | OVERVIEW framing + bounded zoom (§6) |
| 3 Planets overlap | One planet per ring, min-separation radii (§2) |
| 4 No labels | Always-on ticker tags (§2, §4) |
| 5 Reads as 2D | 25° elevation, lighting/normal maps, terminator, trails (§6, §12) |
| 6 Side panel crowded | Deleted; summoned panels only (§9) |
| 7 Too much text | ≤8-word telegram rule (§9) |
| 8 Orbit direction illegible | Comet trails — taper, length, gradient (§3) |
| 9 Permanent legend | Summonable SYSTEMS MANUAL (§11) |

---

## 14. What to build first

Sequence to prove the hard parts before spending on paint:

1. **Layout + camera + trails + labels** with placeholder spheres — kills
   problems 1–5 and 8 while textures are still prompts in a notebook.
2. **Lock-on + rendezvous + panel** — the interaction model, the real risk.
3. **The sun** — health mapping, spots, breathing.
4. **Texture pipeline** — parallel to all of the above; art lands last and
   drops into finished sockets.
5. ~~Phone parade + bottom sheet.~~ **Withdrawn** — desktop-only decision
   (§7). The existing tested mobile fallback ships unchanged; verify it still
   renders zero WebGL after each step rather than building anything new.
6. **Belt, manual, first-visit transmission.**

The galaxy (v2) is designed toward, not built: the camera states, route
structure, and panel grammar all treat "one solar system" as a component
keyed by portfolio — a second system is a second key, not a rewrite.

---

*Status note: this document proposes; it decides nothing. The Phase 10
renumbering/workflow question stays open per the brief. Left uncommitted for
owner review.*

