# The Stock Market Universe — round 4 creative response: the DRAFT bay

Answers to the DRAFT bay brief, in its order. Written July 28, 2026.
Companion to `UNIVERSE_IDEAS_3.md` (rev 2). Grounded in the code this bay
replaces: the `/compare` page, its tested rebalance engine
(`sim-portfolio.ts`), and the mandatory simulations banner
(`compare-copy.ts`) — what survives from each is named in §8. As always:
proposals, not decisions.

**A working mock ships with this document — `UNIVERSE_DRAFT_RIG.html`.
Fiddle first, read second.** The brief says the owner will judge this by
whether it is fun to fiddle with; that question is answerable only by
fiddling, so the core loop — grab a circle, pull, watch the other seven
breathe, watch the numbers move — is built and interactive (demo data,
clearly stamped).

---

## 1. The read

The universe now has three places, each with a material truth:

- **The scene** — deep space. Where your money actually lives.
- **Mission Control** — the warm ops room. Where you read it.
- **The DRAFT rig** — the workbench *inside your rocket*. Where you play
  pretend with real physics.

The owner's framing is the whole design: this is **equipment you carry,
not a page you visit.** So it is not another bay bolted into the wall —
it is the one piece of gear you *take out*: a flight case that opens onto
the desk. And it finally gives a home to the one owner reference that
never found one: the little orange sphere-computer — a personal,
round-screened, chunky-buttoned instrument that belongs to somebody.

One sentence for the whole thing: **the companies stay real; only your
ownership is make-believe.** Direction and speed on this bench are the
truth; size is the toy.

---

## 2. The instrument (brief §4.1)

**Where it lives:** a tab in the Mission Control bay row — `DRAFT ·` with
a small rocket glyph — but opening it does not swap a panel. The room
dims a step and a **flight case (~900×570px) sets down centered on the
desk**, lid opening upward (reduced motion: it is simply there). ESC or
the lid latch puts it away. Being *summoned over* the room, rather than
*of* the room, is what makes it read as carried equipment.

**The chassis — yours, specifically:**

- Charcoal case shell `#2b2723`, cream panel face reusing the paper token
  `#f0e2c4`, wing screws in the corners, burnt-orange accent `#d96f23`.
- A stencil: `SOL-DEVAN · TEST RIG Nº 1 · CARRIED EQUIPMENT`, with a
  small painted silhouette of the rocket cursor — the case belongs to the
  ship you fly.
- A strip of aged tape carrying, verbatim, the mandatory banner (§8):
  *"SIMULATIONS — hypothetical portfolios for comparison only. Not
  advice, not predictions, not recommendations."* In-world material,
  exact mandated words.
- Two physical toggles: `GHOST` (real-weight overlays, §5, default on)
  and `MOTION` (orbits run/hold; defaults off under reduced motion).
- Wear: corner scuffs, one older tape shadow. Uniform chrome is how
  interfaces say "template"; wear is how objects say "mine."

**The dish:** a round dark-glass screen, Ø ~470px, left side of the case.
On it, in faint P3 amber: **one orbit track** — a single ring at ~150px
radius with sparse tick marks and a small crosshair hub. Not eight rings:
one. Deliberately sparse; the graph-paper lesson from round 3 is one
ring, ticks, nothing else.

**Why one track is the layout:** ring order in the radar encodes the real
book's rank. The draft has no rank — the *only* variable is allocation —
so concentric rings would either freeze the real ranking (a lie about
your draft) or re-sort as you drag (chaos). One shared road, eight
runners: every circle orbits the same track, at its **real direction and
real speed** (the scene's angular-speed mapping, scaled ×1.6 for the
small dish so the motion is visible at bench size).

And the detail that makes the bench a toy: at real speeds the fast
circles genuinely **lap the slow ones**. On approach, the faster circle
eases ~12px outward, passes in the outside lane, and tucks back in.
Overtaking is honest (that *is* what a +5% week does to a −1% week),
physical, and quietly funny. The bay is called DRAFT; on this bench,
things literally draft past each other.

**The circles:** fill = the holding's identity `brandHex` (matter,
firewall-exempt — IBM stays navy), rimmed 1.5px in its `labelHex`
near-white tint, ticker in 11px mono inside the disc when diameter ≥
34px, tagged beneath when smaller. Diameter is the one hypothetical
channel: **d = 14 + 110·√w** px — 0.5% is a 22px pea, 12.5% is a 53px
ball, an all-in 100% is a 124px planet that still fits the dish. Each
circle also carries a short **trail in the signal magnitude ramp** — the
exact LUTs and lightness the scene uses for its real week. Learn the
language once: out there and on this bench, direction is direction,
speed is speed, darkness is bad and neon is good. Only size lies, and it
is labelled as the lie you're telling.

Reduced motion: circles hold seeded stations on the track; a small
chevron on the track ahead of each shows direction; trails render
statically. Every encoding survives the freeze.

---

## 3. Changing the weights (brief §4.2)

### The ledger that makes it physical

The owner's mental model — *"the user gets $100 and disperses it"* — is
implemented literally: internal state is **200 integer half-percent
units** (fifty-cent pieces of the hundred). Every operation moves whole
units, redistributions round by largest remainder, and the sum is 100.0
**by construction**. There is no float drift, no "weights must total
100%" message, no invalid state to validate. The interface never
corrects you because the physics never lets you be wrong — that is the
difference between a rig and a form.

### The gestures

1. **Grab and pull** — the primary act. Point at a circle, drag away
   from its centre to grow it, toward to shrink. The **other seven
   breathe** in compensation, pro-rata to their current weights — grow
   ASML by 6 and everyone else exhales proportionally, preserving their
   relative mix (the least-surprising default). Their discs animate;
   their rack numbers tick. You feel the hundred conserving itself.
2. **Siphon** — the targeted act, modeless: while dragging circle A,
   carry the pointer *into* circle B. B's rim glows amber — it latches
   as the **sole counterparty** — and now everything A sheds lands on B
   alone (the other six hold still). A dashed amber fuel line arcs from
   A to B with the moving amount: `▸ 3.5`. Release commits; drift out of
   B to fall back to pro-rata. One gesture family covers both.
3. **Type** — click any weight readout (dish tag or rack row) and type;
   half-percent steps; others renormalise pro-rata.
4. **Keys** — Tab moves focus circle to circle (cream focus ring);
   ←/→ = ±0.5%, Shift = ±5%; Space latches the focused circle as
   counterparty for the next adjustment (the keyboard siphon); Enter on
   a readout opens type-in. `aria-live` announces politely: *"ASML
   30.0%. Others adjusted."* Weight change is never drag-only.

**Zeroing:** a circle at 0.0% docks on the **pit rail** — a short siding
arc inside the track — parked, grey-rimmed, still labelled, out of the
race but in the garage. Drag it back onto the track to re-enter. The
roster is fixed at the eight planets; the belt sits this bench out (v1
scope, stated — a ninth-holding draft is a different, bigger tool).

**What happens to the other seven when you grow one** — answered
mechanically: they shrink pro-rata (default) or one of them pays alone
(siphon latch). Nothing else ever moves them.

---

## 4. What you learn, and when (brief §4.3)

Three readouts on the right rail. Not four. Each updates **live during
the drag** — the maths is eight multiplications — and settles on release.
Live is what separates fiddling from submitting.

1. **THE WEEK** — the payoff plate, stamped `DRAFT` in a dashed border:
   `DRAFT MIX ▲ 2.1%` at 28px, and beneath it `YOUR MIX ▲ 0.8 · EDGE
   +1.3`. Both numbers are the same formula over the same window —
   mix-held-from-window-start, Σ wᵢ·Rᵢ on the same public weekly returns
   the scene already renders — differing **only in the weights**. That
   construction is what `CLAUDE.md`'s same-period rule demands, and it
   is identity-testable against the existing engine (§8). Signs wear
   signal colours; the word DRAFT never leaves the plate.
2. **CONCENTRATION** — `TOP-2 54.0 · HHI 1,920` plus the shipped verdict
   stamp (`concentration-status.ts` bands: <1500 DIVERSIFIED, ≤2500
   MODERATE, >2500 CONCENTRATED). Watching the stamp flip as you pile
   into two names is the fastest risk lesson this product can teach.
3. **DRIFT** — `MOVED 22.0 OF 100` — turnover distance Σ|Δw|/2, in the
   owner's own $100 story: of your hundred dollars, how many did you
   move. One number for "how far from home am I."

Below the readouts, the **tank rack**: eight slim rows — identity chip,
ticker, weight, and a horizontal gauge with a small cream notch at the
*real* weight. The rack is the precision instrument and the accessible
path (it is also, quietly, the answer for anyone who wants sliders). Row
height 24px; no prose.

**Cut, with reasons:** the correlation matrix (the SIGNALS bay owns
covariance; a second matrix here is dense and duplicative), sector mix
(the manifest owns it), and any backtest curve (§8 — the machinery
exists, but a history chart is the start of the complexity the owner
refused three separate times). If one future addition earns a toggle, it
is a single 90-day mix-held sparkline from the existing engine — parked
as v1.5, not proposed for v1.

---

## 5. Against the real book (brief §4.4)

**Ghost rings.** With `GHOST` on (default), every circle carries a
dashed cream ring at its *real* weight's diameter, concentric with the
disc. Grown past your real stake, the solid spills outside the ghost;
trimmed below it, the ghost halos you. Per-holding divergence with zero
added chrome, read at a glance, togglable off by a physical switch when
you want the fantasy pure.

The WEEK plate compares outcomes; DRIFT totals the divergence; the rack
notches mark it per row. That is the whole comparison apparatus — no
side-by-side second dish (twice the pixels for none of the play).

**Against the sector map: no duplication.** The rig compares only
against **your own book**. Other portfolios are places — systems you fly
to. The bench in your rocket is a **mirror, not a telescope**; keeping
that split is also what keeps the one-draft rule coherent.

**No confusable numbers:** the rig shows no TWR, no benchmark lines, no
dollar figure — only mix-held percentages under DRAFT stamps. The real
teletype numbers cannot appear inside the case, so the two can never be
mistaken for each other.

---

## 6. Starting state and reset (brief §4.5)

**Opens as your book**, rounded to half-units (largest remainder). An
experiment starts from reality or the first readout means nothing; equal
weights is a strategy nobody chose, and empty is a form.

**The draft lives in the URL** — the project's existing URL-state
scaffolding, one compact param of eight half-unit integers
(`?draft=52.40.28.20.20.16.12.12`). Three things fall out for free:

- **Undo is the browser.** Each release is one history entry
  (`pushState` on release, `replaceState` during drag) — Back steps your
  fiddling, Forward replays it. An experiment you cannot undo is not an
  experiment; this one has a tape deck.
- **A draft is shareable.** `COPY TEST LINK` on the case footer — send a
  friend your allocation experiment. Percentages only, public-safe by
  construction.
- **No storage machinery.** No table, no library, no migration. One
  draft *is* one string. (Cross-device drafts via the settings API is a
  v1.5 note, not a need.)

**Reset is a guarded latch:** `RESET TO BOOK` under a flip-up cover —
first click arms it (`SURE? FLIP AGAIN`, 3s), second commits. And
because reset is itself a history entry, Back un-resets. The cover is
Apollo theatre with a real job: the one destructive act on the bench
cannot happen by accident.

---

## 7. Where the 2D grammar comes from (brief §4.6)

**Same alphabet, different instrument — split deliberately:**

Shared (the language, learned once): P3 amber linework, mono type and
stamps, orbit direction/speed meaning exactly what they mean in the
scene, the signal magnitude ramps on trails and signed values, cream
text, the Fraunhofer rule entire.

Distinct (the object): a **round personal screen** against the radar's
rectangular wall glass; **one track** against the radar's eight ranked
rings; **identity-colour matter discs** against the radar's
signal-coloured rings; a **charcoal-and-cream case** against both the
room's umber chrome and the log's parchment — the third material this
brief asked for. The radar is the room's; the rig is yours.

New tokens are two neutrals and no new hues: case shell `#2b2723`, dish
glass `#0a0c10`; panel cream, accent orange, amber, and all signal/
identity colours are existing tokens. Firewall exposure: zero new
saturated light. Contrast, computed: stencil cream `#f0e2c4` on case
shell 12.7:1 AAA; amber `#ffd68c` on dish glass 13.9:1 AAA; every
`labelHex` rim ≥ 13:1 on dish glass (worst `#e8f3ff`-family well clear);
plate numbers inherit the round-3 verified pairs.

---

## 8. Honesty, and what happens to `/compare` (brief §3 + §5)

**The encoding split, restated as shipped tokens:**

| Channel | Status | Source |
|---|---|---|
| Orbit direction | REAL | holding's true weekly sign, scene mapping |
| Orbit speed | REAL | true weekly magnitude, scene mapping ×1.6 |
| Trail colour/lightness | REAL | signal ramps at true \|week\| |
| Disc size | **HYPOTHETICAL** | your half-unit weights — the only lie |
| Disc colour | identity | `brandHex` / `labelHex`, matter-exempt |

**The one number the bay computes** is Σ wᵢ·Rᵢ over the scene's weekly
window — algebraically identical to buy-and-hold-from-window-start,
which means it must ship with an **identity test against
`simulateRebalanced`** (one rebalance at window start) to 1e-9 — the
exact fixture pattern `steadyMarket` already uses. The tested engine
becomes the rig's oracle.

**What survives `/compare`, what retires:** the mandatory banner
survives **verbatim** (it is mandated for "every view that renders sim
data" — the tape slip carries the sentence untouched, and rig copy stays
inside the banned-words rules). The engine survives as test oracle and
the v1.5 sparkline's motor. The three canned scenarios (Steady Market,
Tech Tilt, AI Concentrate) and the sim trade log **retire with the
page** — presets are somebody else's drafts, and the owner asked for
one, his.

**Constraint sweep:** percentages only, everywhere, by the unit ledger —
public-safe by construction (and the rig is worth *offering* on
`/share`: it is the most fun a visiting friend can have with the link;
flagged as a recommendation the owner can veto). DOM + one 2D canvas,
rAF only while the case is open, recompute is O(8) — the 50ms budget is
untouched. Keyboard path complete (§3.4); `aria-live` announcements;
focus rings. Reduced motion: stations + chevrons + static trails, all
encodings intact. Every channel encodes one number; the only decoration
is wear on the case, which is matter.

---

## 9. Conflicts called, positions picked

1. **"Fun to fiddle" vs "nothing too crazy."** The fun is put into
   *physics* — breathing circles, the siphon line, overtaking on the
   track — not into features. Three readouts, no backtest, no library,
   no presets. A toy earns restraint by being tactile, not sparse.
2. **Labelled moving circles vs collisions on one track.** Overtaking
   with an outside-lane ease, plus the existing label-yield rule at
   close approach. Rare by construction (real speeds differ by small
   rates), and each pass is information: fast laps slow.
3. **"Direction exactly as the real system" vs a rank-free layout.**
   Kept the grammar (orbit, direction, speed), dropped the rank
   (concentric rings) — rank is the book's fact, not the draft's. One
   track is the honest geometry of allocation-only.
4. **Dark identity fills vs dish legibility.** The rev-2 relight problem
   in miniature: solved at the token layer — `labelHex` rims and labels
   carry the ≥13:1 floor; the matter exemption keeps IBM navy.
5. **Sum-to-100 vs freedom to fiddle.** The integer half-unit ledger:
   no invalid state exists, so no validation ever interrupts play.
   Conservation is physics, not form.
6. **Reset safety vs bench speed.** A two-flip guarded latch plus
   history-entry reset: deliberate to trigger, one keystroke to regret.
7. **The verbatim banner vs in-world chrome.** Both, exactly: the
   mandated sentence, printed on a strip of tape.
8. **`/compare`'s presets vs the one-draft rule.** Presets retire. If
   the owner ever misses them, they return as *other rockets' benches*
   in the galaxy phase — not as clutter in his.

---

## 10. Sequence

1. The ledger + maths: half-unit state, pro-rata/siphon ops, Σ wᵢ·Rᵢ,
   identity test vs the engine. Pure functions, tested first, no pixels.
2. The dish: track, circles, motion, trails, reduced-motion stations.
3. Grab-and-pull + breathing; then siphon latch; then rack + keyboard.
4. Readouts + ghost rings + drift.
5. The case: chassis, toggles, tape banner, latch, URL state + share
   link.
6. Retire `/compare`; route its nav entry to Mission Control's DRAFT
   tab.

*Uncommitted, for owner review. The interactive mock —
`UNIVERSE_DRAFT_RIG.html`, demo data, stamped as such — implements §2–§6
far enough to answer the only question that matters: pick up a circle
and pull.*
