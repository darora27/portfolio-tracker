# Phase 10 §9 — Universe craft and depth

Specification written by `claude-code/opus-5` (Claude Lead, `specify` stage),
July 28, 2026.

Implementer: Codex Implementation. Implement to this document. Every acceptance
criterion in §11 is checkable; nothing here is a placeholder.

The `portfolio-ux` project skill was invoked for this turn (via the `Skill`
tool, not the fallback path) and applied beneath the authority order in §1.

---

## 0. Premises corrected before scope

Four things in the source documents are wrong or stale about the code as it
actually stands. Correcting them here prevents an implementation round spent
building against a false picture.

### 0.1 The KTX2 pipeline is not Basis. It is zstd-compressed raw RGBA.

`UNIVERSE_IDEAS_2.md` §9.1 infers from the observed ~1.28 bytes/pixel that the
pipeline runs KTX2 **UASTC** mode and that switching to **ETC1S** buys ~4×.

The measured pipeline is different. `scripts/generate-planet-textures.mjs`
writes with three.js's `KTX2Exporter`, which emits **uncompressed RGBA8**, and
then applies `KHR_SUPERCOMPRESSION_ZSTD`. The shipped `asml-base.ktx2` is
167,320 bytes for 512×256 = 1.276 B/px, which is zstd over 4 B/px RGBA — not a
GPU block format at all. There is no Basis encoder in the repository and no
Basis transcoder under `public/`; `KTX2Loader` currently succeeds precisely
because the payload needs no transcoding.

The owner's **lever** is still correct — compression before resolution — and
his **binding instruction** is unchanged and is what §3 implements: measure,
and if the shipped total exceeds ~15 MB, reduce rather than absorb. What
changes is that "switch to ETC1S" is a *hypothesis to test and record*, not a
step known to be available. §3.3 gives the exact ladder.

### 0.2 The current textures are procedural noise, not the authored art.

`assets/planet-textures/source/*.png` holds eight authored 512×256 plates. The
generator does **not** ship them: `sample()` synthesises every pixel from
`Math.sin`/`Math.cos` terms seeded by an FNV hash of the ticker, and the
authored plate is only blended in as a tint. That is the mechanical reason the
owner sees "ambiguous garbage" — no authored macro structure survives to the
sphere. §3 replaces the synthesis with the authored plate as the actual source.

### 0.3 `docs/reference/README.md`'s no-logo caution is superseded for §9.

That file says planet surfaces must be "brand-evoking while reproducing no
logos or wordmarks," citing `UNIVERSE_DIRECTION.md` §6 and `PHASE10.md` §8.
`UNIVERSE_ROUND2_BRIEF.md` §1 reverses this by owner decision — "Real logos,
wordmarks, and brand colours are permitted" — and `PHASE10.md` §9 restates it
("Real branding is authorized"). For §9, real branding is allowed. Everything
else in that README still stands, including that
`planet-surface-mood-reference.jpg` must not be reproduced literally and that
`SUPERSEDED-concept-mobile-parade.png` must not be built.

Do not edit `docs/reference/README.md`; it is §8's record. This spec is the
controlling document for §9.

### 0.4 Part of the round-2 wish list already shipped in §8 remediation.

Already present in `OrreryScene.tsx` — do **not** rebuild:

- Ticker tags rendered as a DOM overlay **below** the planet, tinted by
  `--planet-label-color`, with no darkening scrim over the texture.
- A dashed `dockingRing` group around the sun, hidden by default.
- `fog: false` on the orbit-ring and trail `MeshBasicMaterial`s, ring opacity
  0.34 and trail opacity 0.96.
- Escape / empty-space double-click return to OVERVIEW, clickable belt
  objects, planet–orbit clearance at close range.

§4 and §8 below therefore specify only the *remaining* deltas on those
surfaces, not a rewrite.

---

## 1. Authority order and binding constraints

Authority for §9, highest first:

1. `PRODUCT_DIRECTION.md`'s decision hierarchy — privacy/security, then
   financial correctness, then route usefulness, then accessibility, then
   hierarchy, then resilience, then art direction, then convenience.
2. `UNIVERSE_ROUND2_BRIEF.md` (the owner's questions and constraints).
3. `UNIVERSE_IDEAS_2.md`, **including its §9 owner corrections and
   authorizations**.
4. `PHASE10.md` §9.
5. This specification, which resolves conflicts among the above into
   checkable requirements.

Standing gates carried in unchanged from §7/§8 — none may be weakened,
redefined, or baseline-subtracted:

- Route-owned long task **< 50 ms** on the §2.3.2 rig (1440×900, CPU 2×,
  five fresh contexts).
- **Desktop-first.** Below 1024 px the existing tested fallback ships
  unchanged: `canvas` count 0 at 390 px and 320 px, no horizontal overflow,
  no sub-44 px targets. No mobile 3D.
- The semantic DOM is the accessible source of truth. No essential
  information exists only in WebGL, motion, colour, speed, or direction.
- Reduced motion freezes the scene while preserving every encoding.
- Contrast of new text verified by **computed WCAG ratio from source tokens**,
  never by eye.
- Every visual object encodes one real computed number or opens one real
  destination. Nothing decorative ships.
- `/share` is public and read-only: zero dollar amounts, zero owner-only
  fields, in HTML, RSC payload, and client bundle.

### 1.1 Two owner observations carried in from §8

- **D1 — the unreproduced green trail.** An owner report of a green trail on a
  holding that was down for the week was never reproduced; source mapping is
  correct. **Do not change trail/orbit colour or direction logic in §9.** If a
  contradicting ticker is named by the owner during this section, stop and
  treat it as severe. Trail *weight, length, and glow* are in scope (§4);
  *sign→colour and sign→direction mapping* is not.
- **D2 — "website is still relatively confusing."** Too general to bound in
  §8. §9 closes it with exactly one bounded requirement, criterion 66: a
  persistent OVERVIEW orientation line. It is not a licence for unscoped
  restructuring.

---

## 2. Scope

### 2.1 In scope — six work packages

| ID | Package | Source |
|---|---|---|
| **A** | Planet textures regenerated with composited marks, at a measured byte budget | IDEAS_2 §1, §9.1 |
| **B** | Overview composition: planet scale, ring weight, trail life, nebula, trade comets, label chip and collision yield | IDEAS_2 §2 |
| **C** | Mission Control rebuilt as an operations room: teletype, system plot, seven folder-tab bays with named treatments | IDEAS_2 §3 |
| **D** | Planet detail view: ID plate, scope chart, telemetry strip, transmissions, egress | IDEAS_2 §4 |
| **E** | Moons (news), three satellites (portfolio instruments), sector map (one further system) | IDEAS_2 §5, §9.2 |
| **F** | Sun docking state completion and the OVERVIEW orientation line | IDEAS_2 §6; D2 |

Two new public disclosure surfaces are authorized and specified in §9:
the **public captain's log** (IDEAS_2 §9.3) and **public news for held
tickers** (IDEAS_2 §9.4).

### 2.2 Explicitly out of scope — do not touch

- Trail/orbit **sign→colour** and **sign→direction** mapping (D1 above).
- Any route other than `/` and `/share`. `/dashboard`, `/compare`,
  `/research`, `/history`, `/trades`, `/stock/[ticker]`, `/share/full` keep
  their accepted behaviour and tests exactly.
- The mobile/no-WebGL/reduced-motion fallback's *structure*. It is re-verified,
  not redesigned. New semantic controls added by §9 (§7.4, §8.3) appear in it
  because they are part of the semantic DOM; nothing else changes.
- The financial math libraries. §9 adds no new return, risk, or benchmark
  computation. `impactPct` (§9.1) is a ratio of existing quantities and lives
  in a new pure module, not inside the math core.
- `src/components/surface/PortfolioOrrery.tsx` — the unrelated Phase 9
  decorative component with a colliding name. Do not rename, repurpose, or
  delete it.
- `PRODUCT_DIRECTION.md` reconciliation. Recorded as a separate later task.
- The correlation-cell→plot pair-line and the concentration arc from
  IDEAS_2 §3.3. One plot linkage ships (manifest row → blip, criterion 34);
  the other two are deferred and must not be built.
- More than one additional sector system. IDEAS_2 §5 caps this at "v1.5,
  3–4 systems"; `PHASE10.md` §9 requires only that "the sector map loads
  another system and returns." Exactly one additional authored system ships.
- Automatic audio, of any kind.

---

## 3. Work package A — planet textures

### 3.1 Pipeline change

Rewrite `scripts/generate-planet-textures.mjs` so the **authored plate is the
source of the base map**, not a tint over synthesised noise. For each of the
eight tickers (ASML, GOOG, MSFT, IBM, COST, INTC, NBIS, CBRS):

1. **Regenerate the authored plate** at 2048×1024 or larger into
   `assets/planet-textures/source/<ticker>.png`, using the shared prompt
   template and the per-ticker WORLD/POLES/PALETTE fills in
   `UNIVERSE_IDEAS_2.md` §1. INTC and NBIS use that section's stated
   directions ("copper-reconstruction", "newborn-accretion") built on the same
   template. Update `assets/planet-textures/source/README.md` with the exact
   prompt used per ticker and an executor suffix.
   - The plates must carry **no generated text**: the prompt must forbid
     letters, numbers, and wordmarks. Text comes from the composite in step 2.
2. **Composite the mark.** Author one SVG per ticker at
   `assets/planet-textures/marks/<ticker>.svg`, either as vector path geometry
   or as text set in a font already vendored in this repository. Composite it
   onto the flat plate with `sharp`, centred at 50% width and 50% height,
   spanning 18–22% of image width. It must be **spelled correctly and legible
   in the shipped base map** (criterion 4). Give it a surface treatment
   (emboss / road-paint / etched) so it reads as built into the world.
3. **Seam fix.** Roll the composited plate 50% horizontally, blend the
   now-centred seam, roll back. Left and right edge columns must match within
   the tolerance in criterion 3.
4. **Derive emissive and normal from the base**, never from a second
   generation pass. Emissive: mask the plate's glow hues, boost, tint to the
   ticker's declared brand hue, then add a glow copy of the mark. Normal:
   height-from-luminance (Sobel) with macro relief exaggerated and micro
   detail blurred.
5. **Downsample, encode, measure** per §3.3.
6. **Emit evidence** per §3.4.

The plates and marks are committed source art. `public/textures/planets/`
holds only the encoded maps and the §3.4 evidence.

### 3.2 Declared brand hue table

Add to the generator and to `src/lib/observatory/planet-identity.ts` (new, pure)
one committed table: `{ ticker, brandHex, labelHex, macroFeature,
emissiveSignature }`. `brandHex` is the world's dominant hue; `labelHex` is
`brandHex` lightened to ≈90% lightness per IDEAS_2 §2 (this is the value the
existing `--planet-label-color` consumes — replacing whatever ad-hoc value
`OrreryScene.tsx` computes today). `macroFeature` and `emissiveSignature` are
short strings naming the two non-colour signals the 32-pixel test relies on;
they are rendered as text in the systems manual, so they are not decorative
metadata.

### 3.3 Byte budget — the binding ladder

Total shipped bytes under `public/textures/planets/` (all maps, all tickers)
**must be ≤ 15,000,000 bytes**, measured with `du -b` / `wc -c` and recorded.
Today's measured total is **3,424,390 bytes** across 24 maps at 512×256.

Work the ladder in this order, recording the measured total at each step:

1. **Test real GPU block compression.** Attempt KTX2 Basis (ETC1S preferred,
   UASTC as the comparison) via a **build-time-only** encoder. If adopted, the
   Basis transcoder must be vendored under `public/basis/` and
   `KTX2Loader.setTranscoderPath()` wired, and the encoder must be a
   `devDependency` — never a production dependency. If no encoder can be
   obtained in the implementation environment, **record that finding with the
   exact command output** and move to step 2. Do not fabricate a compression
   result and do not add a network-dependent build step.
2. **Zero-dependency reductions**, all of which apply regardless of step 1:
   raise the zstd level; ship emissive as single-channel R8; ship normal as
   two-channel RG8 with Z reconstructed in the fragment shader.
3. **Resolution ladder.** Target base 2048×1024 with emissive and normal at
   1024×512, per owner correction §9.1. If the measured total exceeds
   15,000,000 bytes, step the **base** down through 1448×724 → 1024×512 →
   768×384, re-measuring at each step, and ship the largest tier that fits.
   Emissive and normal never exceed half the base's dimensions.

Shipping below 2048×1024 is an expected outcome of an honest measurement, not
a failure — but the measured number and the tier chosen must both be recorded
(criterion 6). Shipping over 15 MB is a failure.

The authored source plates are archived at full resolution regardless of the
shipped tier.

### 3.4 The 32-pixel test, made checkable

`UNIVERSE_ROUND2_BRIEF.md`'s quality bar is: shrink the rendered sphere to
32 px and the company is still nameable from one dominant colour, one macro
silhouette feature, one emissive signature.

The generator must additionally emit, from **the exact pixel buffer it
encodes** (not from the source plate):

- `public/textures/planets/thumbs/<ticker>-base-32.png` — a 32×16 downsample.
- `public/textures/planets/texture-manifest.json` — per ticker:
  `{ ticker, shippedWidth, shippedHeight, bytes: {base, emissive, normal},
  dominantHex, luminanceStdDev, seamMaxDeltaE }`, plus a top-level
  `{ totalBytes, tier, encoder }`.

Both are committed. The unit test in §10.2 asserts against them. The human
32-pixel judgement is made from the live evidence in §12.

---

## 4. Work package B — the overview as a designed image

All values below are design targets for a 1440×900 frame and must be derived
in the pure scene model (§10.1), not hand-tuned inside the render loop.

1. **Planet diameter ∝ √weight with a floor.** `radiusForWeight()` already
   uses `Math.sqrt`; retune `ORRERY_MIN_RADIUS`/`ORRERY_MAX_RADIUS` so the
   projected on-screen diameter at the OVERVIEW camera lands at ≈68 px for the
   heaviest holding and never below **22 px** for the lightest. The floor is
   deliberate and flatters sub-4% holdings; the exact weight stays one hover
   away (IDEAS_2 §7.2).
2. **Fill the frame.** The belt ring spans **85–92%** of viewport width at
   OVERVIEW. Ring spacing stays ≥ 1.6× the sum of adjacent planet radii; the
   existing `ORRERY_SUN_CLEARANCE` minimum is preserved.
3. **Rings are the drawing.** Neutral slate, alpha 0.30–0.35, 1.5 px. The
   hovered or focused planet's own ring lifts to alpha 0.6 in its trail colour
   and returns on blur.
4. **Trails carry the colour life.** Arc length **18–30°** scaled by weekly
   magnitude, rendered in two passes — a 3 px saturated core plus a wider soft
   underglow with additive blending. Sign→colour is unchanged (D1).
5. **The background is a place.** One nebula wisp behind the system, hue keyed
   to the sun's current health palette (ember when the health scalar is
   negative, gold when positive), alpha **≤ 0.15**, slow drift. Plus a second
   starfield layer at a different depth with slight parallax against the
   existing one. The nebula encodes the health scalar and must be listed as
   such in the systems manual — it is not ambience.
6. **Trade comets.** On a day a trade executed, exactly one comet crosses the
   system once per page load: white tail for a buy, green for a sell that
   realized a gain, red for a sell that realized a loss. Driven by the public
   trade record (§9.1) — `realizedGain`'s **sign only** crosses the boundary,
   never its magnitude. No trade that day, no comet. No other ambient moving
   object is added.
7. **Label chip on hover.** The existing below-planet tag stays ticker-only at
   rest and gains the day-% chip (`▼ 6.7`) on hover or focus. Tag text is
   fixed screen-space **12 px mono caps at every zoom**, with a 2 px dark
   outline, tinted `labelHex` from §3.2.
8. **Label collision yield.** When two tags overlap in screen space, the tag
   belonging to the planet farther from the camera slides radially outward
   from its planet; if it still overlaps, it fades to 50% opacity. Tags
   default to the anti-sun side of their planet.

---

## 5. Work package C — Mission Control as an operations room

Rebuild the overlay opened by the sun. **No datum currently rendered may be
deleted** (Ground rule 15); everything moves into a bay.

### 5.1 Chrome

- The universe stays visible behind the overlay, dimmed and defocused. The
  overlay is not a full-bleed opaque page.
- A 1 px cream chassis frame inset from the viewport edge with corner ticks
  holds every bay. Bays are bays in one machine, connected by hairline conduit
  rules — not floating cards on a void.
- Chrome colour is **constant**: cream text, burnt-orange accents, umber
  field, regardless of portfolio health (IDEAS_2 §7.5). Only the plot and the
  scope trace tint toward the health hue; semantic red/green appears only on
  signed values.
- Numbers are tabular mono with explicit sign and fixed decimals. On data
  refresh, changed digits flip odometer-style over 120 ms; under
  `prefers-reduced-motion` they change instantly.
- Nameplates are ≤ 2 words. No sentence appears anywhere outside the teletype.

### 5.2 The teletype

A full-width status line across the top, typing itself once on open with a
blinking cursor block (instant under reduced motion), reading:

`SOL-DEVAN · DAY <day%> · TWR <twr%> · VS VOO <excess%> SAME PERIOD ·
DRAWDOWN <dd%>`

TWR only — the teletype never quotes simple return, and never places a
since-purchase number beside a benchmark measured from a different period.
Unavailable values render as `—` with the reason available in the systems
manual, never as `0.0%`.

### 5.3 The plot

A live top-down 2D-canvas wireframe of the system — concentric rings, moving
planet blips, sun at centre — in thin orange linework tinted by the health
hue. **2D canvas only; no WebGL context inside the overlay.** It is
`aria-hidden`; the manifest below it is its text equivalent.

### 5.4 The seven bays

Folder-tab nameplates with index numbers:
`PLOT 00 · MANIFEST 01 · SCOPE 02 · HAZARD 03 · SIGNALS 04 · COMMS 05 ·
LOG 06`.

| Bay | Content | Treatment |
|---|---|---|
| PLOT 00 | the system plot | §5.3 |
| MANIFEST 01 | holdings table **and** contribution chart, merged | Mono rows: brand-colour chip, ticker, day ▲▼, weight as a fuel-gauge bar, contribution as a bilateral bar from a centre spine (positive right, negative left) |
| SCOPE 02 | return chart | Recharts trace in phosphor amber on a dark etched grid; benchmarks as dim dashed traces; the 100 line drawn strong with the region below tinted faint ember; corner stamp `INDEXED 100 · NET OF FLOWS` |
| HAZARD 03 | risk block | Volatility and beta as analog needle gauges; drawdown as a pressure column filled to its value with the ATH tick at top; win rate as a segmented lamp bar; best/worst day as two stamped extremes |
| SIGNALS 04 | correlation matrix + composition | Cells as square lamps — brightness = strength, glyph `+`/`−` for sign, **never hue alone**; diagonal replaced by planet chips. Composition renders as concentric arcs at each holding's actual orbital rank, arc length = weight; HHI as a stamped `CONCENTRATION: <band>` indicator |
| COMMS 05 | earnings calendar | T-minus rows: `T−2D · MSFT · AFTER CLOSE · EST 4.33`, soonest row lit |
| LOG 06 | trade log | Reverse-chron teletype lines. **Public:** `2026-07-14 · BUY · NBIS · +2.1% OF BOOK` — action, ticker, date, % of book only. **Owner:** the existing full ledger, unchanged in content |

Bay navigation replaces the current four-panel `MISSION_CONTROL_PANELS` nav.
Bays are real links with `aria-current`, preserving the existing
`?focus=portfolio&camera=command&station=<bay>` URL grammar and the
`preservedQuery` behaviour. `MissionControlPanelId` becomes the seven bay ids.

### 5.5 Cross-reference

Hovering or keyboard-focusing a MANIFEST row flares that holding's blip on the
PLOT. This is the only plot linkage in §9 (§2.2).

---

## 6. Work package D — the planet detail view

Replaces `HoldingInspector` in `OrreryWorld.tsx`. Stage direction is unchanged:
planet left, information right, the rest of the system alive and dimmed behind.
The planet keeps ~45% of the width and keeps rotating at its axial-spin rate.

The right side is one narrow column, **exactly five bays**, drawn on with the
existing staggered wipe:

1. **ID plate** — `<TICKER> · <Company name>`, then the day number as the
   largest element on screen with its direction glyph.
2. **Scope** — the holding's chart, ≈220 px tall, with range detents rendered
   as physical toggles: `7D · 30D · SINCE BUY · MAX`. `SINCE BUY` is labelled
   **`SIMPLE`** and is never shown beside a benchmark measured from a
   different period. A benchmark-overlay toggle adds same-period VOO as a
   dashed trace.
3. **Telemetry strip** — exactly four tiles: `WEIGHT`, `WEEK`, `VOL`, `BETA`.
   Glyph plus number; no prose. (`Vs. portfolio` moves into the systems
   manual's holding-metric definitions rather than being deleted.)
4. **Transmissions** — exactly three headlines, one line each, mono timestamp
   prefix, source dot. Clicking opens the article in a new tab. `MORE ▸`
   expands the bay in place and never navigates away. If news is unavailable
   for this ticker, the bay renders a single `NO TRANSMISSIONS` line
   (§9.2) — it never disappears silently and never blocks the rest of the view.
5. **Egress** — `OPEN IN MISSION CONTROL ▸`, anchored to this holding's
   MANIFEST row, and `◂ SYSTEM` returning to OVERVIEW.

Hard budget: **no paragraph anywhere; total on-screen word count ≤ 60**,
counting every visible word in the column excluding numbers, ticker symbols,
and headline text. Headlines may wrap once. If earnings for this holding fall
within 7 days, the ID plate gains a `T−nD` chip using the same glyph as
COMMS 05.

---

## 7. Work package E — moons, satellites, the sector map

Grammar that keeps the three legible: **moons orbit planets, satellites orbit
the sun, systems live beyond the belt.** Natural bodies are organic spheres;
instruments are angular craft with a blinking nav light. Nothing else flies.

### 7.1 Moons — news, one per planet, maximum

A planet with at least one headline in the trailing 7 days grows exactly one
small cratered moon in a close, fast orbit. Diameter is bucketed by story
volume into three sizes (1–2, 3–5, 6+ headlines). No news → no moon. Clicking
or activating the moon opens that planet's detail view scrolled to
Transmissions. If earnings for that holding fall within 7 days, the moon gains
a bright ring and a `T−nD` tag — same object, scheduled news.

One moon maximum is the clutter law. Never one moon per story.

### 7.2 Satellites — three portfolio instruments

Three angular craft in tight orbit around the sun:

| Id | Encodes | Hover readout | Click destination |
|---|---|---|---|
| `DRIFT` | excess return vs VOO, same period | `VS VOO <excess%>` | SCOPE 02 |
| `HAZARD` | portfolio volatility; nav light blinks at the vol bucket rate (calm = slow) | `VOL <vol%> · BETA <beta>` | HAZARD 03 |
| `SUPPLY` | next earnings anywhere in the book | `T−nD · <TICKER>` | COMMS 05 |

**Placement is computed from ring geometry at render time** (owner correction
IDEAS_2 §9.2): the satellite ring is placed in the widest gap between
`ORRERY_SUN_CLEARANCE` and the first planet ring, honouring the same minimum
separation the planets already use. It must never be hard-coded to "inside
ASML's ring," and a rebalance fixture that changes rank order must not put a
satellite inside a planet's clearance (criterion 44).

### 7.3 The sector map — one further system

Zooming fully out from OVERVIEW resolves into a **flat 2D sector chart** in the
plot's wireframe style — not navigable 3D void. One sun glyph per system,
coloured by that system's own health, labelled with name and day %. Selecting a
system warps (600 ms starfield streak; instant under reduced motion) and loads
it in the identical grammar. A breadcrumb chip `SECTOR ◂ <system>` returns.

Systems are authored as committed `systems/*.json`:
`{ name, holdings: [{ ticker, weight }], trades? }`. Exactly **one** additional
system ships in §9, weight-only (no trade history).

**Financial honesty:** a system without trade history cannot compute TWR. Its
sun renders with a **hollow core** — observed, not owned — and its health is
derived from constituents' weighted day/week returns with the label
`OBSERVED · NO TWR` in its semantic control. It must never display a number
labelled TWR. Owned systems get solid cores.

### 7.4 Accessibility for every new body

Moons, satellites, and sector systems are **real controls in the semantic
DOM**, inside the existing `nav[aria-label="Portfolio bodies"]`, each carrying
its encoded value as text, reachable by Tab, activatable by Enter, and with a
visible focus ring. The WebGL bodies are the visual presentation of those
controls, never the only way to reach them.

---

## 8. Work package F — the sun's docking state and orientation

### 8.1 Docking

`health is physiology; hover is instrumentation.` The sun's body — colour,
corona, sunspots, pulse — must not react to the cursor at all, so hover can
never be misread as a health change (criterion 52).

The existing `dockingRing` completes: on pointer approach or keyboard focus it
materialises just outside the corona, dashed and slowly rotating (static under
reduced motion), and the sun's label extends from `PORTFOLIO` to
`PORTFOLIO · ENTER MISSION CONTROL ▸`. The cursor swaps to docking
orientation. Clicking anywhere inside the ring docks. On leave, the ring
dissolves.

### 8.2 Discoverability

Once per session, ~20 s after load, the docking ring flashes once, faintly.
Exactly once, session-scoped (`sessionStorage`), suppressed entirely under
reduced motion and once the sun has been activated. The sun stays first in tab
order; Enter docks.

### 8.3 The OVERVIEW orientation line (closes D2)

A persistent, always-visible single line in the OVERVIEW chrome — not a
dismissable tooltip, not the first-visit overlay — naming the three things an
unprimed viewer cannot currently infer:

`SUN = WHOLE PORTFOLIO · PLANET = ONE HOLDING · CLICK EITHER TO OPEN`

It sits in the semantic DOM, appears in the mobile/no-WebGL fallback, and is
the only new prose added to OVERVIEW. It replaces nothing; the systems manual
and first-visit orientation stay as they are.

---

## 9. Data and privacy contracts for the two new public surfaces

Both are **new disclosures**. `/share` exposes no trade data and no news
today. Neither may widen beyond what is written here.

### 9.1 Public captain's log

New pure module `src/lib/observatory/public-trade-log.ts`:

```ts
export type PublicTradeEntry = {
  date: string;        // ISO date, no time
  action: "buy" | "sell";
  ticker: string;
  impactPct: number;   // signed, rounded to 3 decimal places (0.1% display)
  realizedSign: -1 | 0 | 1;  // sell only; 0 for buys. Sign only, never magnitude.
};

export function buildPublicTradeLog(
  trades: readonly TradeRow[],
  maxEntries?: number,   // default 20
): PublicTradeEntry[];
```

- `impactPct` = the trade's total ÷ the portfolio's total cost basis
  immediately after that trade, signed positive for a buy and negative for a
  sell. It is a **ratio**, so no dollar amount crosses the boundary, and
  neither the numerator nor the denominator is public. Rounded to 3 decimal
  places before it leaves the server.
- Displayed as `+2.1% OF BOOK`. Its definition appears in the systems manual.
- **Never crosses the boundary:** `shares`, `price`, `total`, `realized_gain`'s
  magnitude, `reason`, or any dollar-denominated field. `realizedSign` exists
  solely to colour the §4.6 trade comet.
- The owner view's full ledger is unchanged. Only the public projection is new.

### 9.2 Public news

New pure module `src/lib/observatory/public-news.ts` exposing
`groupNewsByTicker(newsByTicker, heldTickers, now)` returning, per held
ticker, at most 3 items of exactly
`{ headline, source, url, datetime, ticker }` from the trailing 7 days.
`src/lib/dashboard-data.ts` gains `newsByHolding: Record<string,
PublicNewsItem[]>` alongside the existing `latestNews`.

- No owner-only field may ride along in the news payload.
- **Graceful degradation is required:** a news-source failure or empty result
  yields no moon and a `NO TRANSMISSIONS` line, and must not throw, blank the
  scene, or block Mission Control. Covered by criterion 61.

---

## 10. Testing rules

### 10.1 The pure scene model — how rendered behaviour becomes testable

`PHASE10.md` §9 forbids `expect(source).toContain(...)` as coverage for
rendered behaviour, because §8 shipped five such guards and one passed while
the trails it protected were fogged to invisibility.

Introduce `src/lib/observatory/scene-model.ts`: pure functions that compute the
scene's **complete descriptor tree** from data and camera state, returning
plain serialisable objects (no `three` import, no DOM, no WebGL) —

```ts
buildOverviewSceneModel(input): SceneModel
// SceneModel: { rings[], planets[], trails[], labels[], moons[],
//               satellites[], nebula, comet | null, sun }
// each node carries its computed colour, opacity, fog flag, radius,
// screen-space position/size, visibility, and the datum it encodes.
```

`OrreryScene.tsx` consumes this model to construct its three.js objects; it
must not recompute any encoded value inline. Tests then assert on the model —
real behavioural coverage, deterministic, no renderer required.

Rules for §9's tests:

- **No new `expect(source).toContain(...)`** (or `toMatch` on file text) as
  coverage for anything rendered.
- The existing source-string guards in
  `src/app/dev/phase10-portfolio-orrery/OrreryScene.source.test.ts` and
  `src/components/observatory/orrery/MissionControlContent.source.test.ts`
  cover surfaces §9 rewrites. Replace each with an equivalent scene-model,
  DOM, or pixel assertion; delete the source-string form. No coverage is lost
  — every behaviour those guards named must still be asserted, by a stronger
  mechanism.
- Rendered facts the model cannot prove (actual on-screen luminance, real
  contrast of the composited scene) are proven by **live RGB pixel sampling**
  with a retained script, the same methodology that caught the §8 fog
  regression.

### 10.2 Texture tests

A unit test reads the committed `texture-manifest.json` and the 32×16
thumbnails and asserts, per ticker:

- `dominantHex` is within ΔE ≤ 12 of the ticker's declared `brandHex` in
  `planet-identity.ts`.
- `luminanceStdDev` of the 32×16 thumbnail ≥ **0.10** (normalised 0–1) —
  macro structure survives shrinking rather than averaging into mud.
- `seamMaxDeltaE` ≤ 6 between the first and last pixel columns.
- `shippedWidth`/`shippedHeight` match the tier recorded in the manifest, and
  the manifest's `totalBytes` equals the real on-disk total.
- `totalBytes` ≤ 15,000,000.

### 10.3 Encoding tests

Every new encoding function is pure, deterministic, clamped, and unit-tested
against hand-computed fixtures **including clamp boundaries and the
unavailable (`null`) case**: moon size bucket, satellite nav-light rate,
satellite ring placement, nebula hue/alpha from the health scalar, trail arc
length from weekly magnitude, label collision yield, `impactPct`, observed
(hollow-core) system health.

---

## 11. Acceptance criteria

Organized by `PHASE10.md` §9's seven named dimensions. Every criterion is a
pass/fail gate.

### Behavioral

1. Every planet is nameable at OVERVIEW **without hovering** — the below-planet
   tag is legible at rest at 1440×900 for all eight planets simultaneously.
2. Every moon, satellite, and belt object is activatable by **both** pointer
   and keyboard (Tab to focus, Enter to activate), and each has a visible
   focus indicator.
3. The sector map opens from OVERVIEW, loads the one additional authored
   system, and the breadcrumb returns to `SOL-DEVAN`; both directions are
   URL-restorable and survive browser back/forward.
4. The composited mark on every shipped base map is **spelled correctly and
   legible** on the rendered sphere at the APPROACH camera.
5. Every camera state — OVERVIEW, APPROACH, COMMAND, SECTOR — is one gesture
   (`Escape` or empty-space double-click) from OVERVIEW.
6. The measured shipped texture total is recorded in
   `texture-manifest.json` and in the evidence doc, together with the ladder
   step reached and, if step 1 failed, the exact encoder command output.
7. Selecting a moon opens its planet's detail view with Transmissions in view.
8. Each satellite's click destination opens the named Mission Control bay
   (`DRIFT`→SCOPE 02, `HAZARD`→HAZARD 03, `SUPPLY`→COMMS 05) without resetting
   the camera.
9. Mission Control's seven bays are reachable by link, keyboard, and
   `?station=` URL, each with `aria-current` on the active bay, preserving
   `no3d`.
10. The planet detail view's `SINCE BUY` detent renders its value labelled
    `SIMPLE`, and the benchmark overlay toggle is unavailable while `SINCE BUY`
    is active.
11. `MORE ▸` in Transmissions expands the bay in place; the URL does not
    change and focus stays inside the bay.
12. The trade comet appears exactly once per page load on a day a trade
    executed, and not at all on a day with no trade.

### Visual

13. Each of the eight textures passes the **32-pixel test**, verified by
    inspecting the committed 32×16 thumbnail and a live 32 px rendered sphere,
    and by criterion 48's automated proxy. The evidence doc names, per ticker,
    the dominant colour, the macro silhouette feature, and the emissive
    signature actually visible at 32 px.
14. The shipped base maps derive from the **authored plates**, not from
    `Math.sin`-synthesised noise; the generator's synthesis path is removed.
15. Trails carry direction and magnitude **in a single still frame** at
    1440×900, with the two-pass core+underglow rendering visible.
16. Orbit rings read as the composition at alpha 0.30–0.35, and the
    hovered/focused planet's ring lifts to 0.6 in its trail colour — verified
    by live RGB pixel sampling, not by eye.
17. The belt ring spans 85–92% of viewport width at OVERVIEW with no dead
    margin, and no planet is clipped by the 1440×900 viewport.
18. The heaviest planet projects to ≈68 px diameter and the lightest to
    ≥ 22 px, measured from the scene model at the OVERVIEW camera.
19. The nebula is present at alpha ≤ 0.15, its hue tracks the sign of the
    health scalar, and it is named as an encoding in the systems manual.
20. A second starfield layer parallaxes against the first on pointer move.
21. Mission Control reads as an operations room, not a web dashboard: the
    chassis frame with corner ticks, folder-tab nameplates with index numbers,
    the teletype, and the wireframe plot are all present in the 1440×900
    screenshot, and no bay renders as a plain bordered card.
22. Each of the seven bays renders its named treatment from §5.4 —
    specifically the manifest's centre-spine bilateral contribution bars, the
    scope's `INDEXED 100 · NET OF FLOWS` stamp, the hazard needle gauges and
    pressure column, the signals lamp grid with `+`/`−` glyphs, the COMMS
    T-minus rows, and the LOG teletype lines.
23. Chrome colour is constant across health states: a forced-negative and a
    forced-positive health fixture produce identical chrome tokens, with only
    the plot and scope trace tinting.
24. The planet detail view keeps the planet visible and rotating alongside the
    five bays; on-screen word count in the column is **≤ 60**.
25. 1440×900 before/after screenshots exist for every named surface: OVERVIEW,
    APPROACH/planet detail, all seven Mission Control bays, the sector map,
    the sun docking state, and a moon and satellite hover.

### Desktop-first scope

26. Below 1024 px the existing fallback is unchanged in structure: `canvas`
    count **0** at 390 px and 320 px, no horizontal overflow, no target under
    44×44 px. Re-verified live, not assumed.
27. No mobile 3D scene is built, and `SUPERSEDED-concept-mobile-parade.png` is
    not implemented.
28. The new semantic controls (moons, satellites, sector systems) and the
    orientation line appear in the 390 px fallback as ordinary list content in
    reading order.

### Accessibility

29. The semantic DOM remains the accessible source of truth: every encoded
    value introduced by §9 (moon story-volume bucket, satellite readout,
    sector system health and `OBSERVED · NO TWR` label, nebula health hue,
    trail magnitude, label day-%) exists as text in the DOM.
30. Moons, satellites, and sector systems are real focusable controls inside
    `nav[aria-label="Portfolio bodies"]`, in a deterministic order, each with
    a visible focus ring.
31. `prefers-reduced-motion` freezes the scene while preserving every
    encoding: no comet flight, no nebula drift, no parallax, no docking-ring
    rotation or flash, no teletype typing, no odometer flip, no warp streak —
    and every value they convey is still present.
32. Contrast of every new text token — the label `labelHex` set against both
    the darkest and lightest background it can sit on, the teletype, bay
    nameplates, and the orientation line — is verified by **computed WCAG
    ratio from source tokens** at ≥ 4.5:1 for normal text and ≥ 3:1 for large
    text, asserted in a test that computes the ratio, not by eye.
33. The plot canvas is `aria-hidden` and the MANIFEST bay is its complete text
    equivalent.
34. Hovering **or keyboard-focusing** a MANIFEST row flares the corresponding
    plot blip — the linkage is not pointer-only.
35. Mission Control keeps its dialog semantics (`role="dialog"`,
    `aria-modal`, labelled by the title, Escape closes, focus returns to the
    sun control).
36. The signals grid never encodes sign by hue alone; the `+`/`−` glyph is
    present in the DOM for every cell.
37. `Tab` order at OVERVIEW is deterministic and documented: sun first, then
    planets in weight-rank order, then each planet's moon, then satellites,
    then belt, then chrome controls.

### Financial honesty

38. Every new visual channel encodes one real computed number, named in the
    systems manual: moon size ← story volume, moon ring ← earnings within 7
    days, satellite blink ← volatility bucket, nebula hue ← health scalar sign,
    comet colour ← trade action and realized sign, trail length ← weekly
    magnitude.
39. Market-relative readings in the teletype and on `DRIFT` derive from
    **TWR**, same-period, never simple return.
40. Any simple or since-purchase return is labelled `SIMPLE` and never placed
    beside a benchmark measured from a different period (criterion 10).
41. The additional sector system has no trade history and therefore renders a
    **hollow core** with `OBSERVED · NO TWR`; no TWR-labelled number is shown
    for it anywhere.
42. Unavailable values render as `—` with the reason reachable, never as
    `0.0%` or a fabricated figure.
43. `impactPct` is computed as specified in §9.1 and is unit-tested against
    hand-computed fixtures including a sell, a buy, and the first trade in the
    book.

### Tests

44. Satellite ring placement is computed from ring geometry and is unit-tested
    against a **rebalance fixture** that reorders weight rank; no satellite
    falls inside any planet's clearance in either arrangement.
45. All new encoding functions (§10.3) are pure, deterministic, clamped, and
    unit-tested against hand-computed fixtures including clamp boundaries and
    the `null` case.
46. `buildOverviewSceneModel` exists as a pure module, `OrreryScene.tsx`
    recomputes no encoded value inline, and the model is asserted directly for
    ring opacity and fog flag, trail arc length and two-pass structure, label
    position/size/collision-yield, nebula alpha and hue, moon presence and
    bucket, satellite placement, and projected planet diameters.
47. **No new `expect(source).toContain(...)` or file-text `toMatch` is added as
    coverage for rendered behaviour**, and the existing guards in
    `OrreryScene.source.test.ts` and `MissionControlContent.source.test.ts` are
    replaced by scene-model, DOM, or pixel assertions with no loss of covered
    behaviour.
48. The texture manifest test in §10.2 passes for all eight tickers.
49. Belt hysteresis, the existing orrery encodings, and every retained
    Mission Control analysis keep their existing tests passing unmodified
    except where a bay rename requires a selector change.
50. A live RGB pixel-sampling script is retained in the repository and its raw
    output committed, covering ring/trail legibility at OVERVIEW and the
    docking ring's visibility on approach.
51. Reduced-motion behaviour (criterion 31) is asserted by test, not only by
    screenshot.
52. A test asserts the sun's body parameters — colour, corona width, sunspot
    intensity, pulse — are **identical** with and without hover/focus, so
    docking can never be misread as a health change.

### Build

53. `npm test` and `npm run build` are green before the implementation commit.
54. The route-owned long task stays **< 50 ms** on the §2.3.2 rig (1440×900,
    CPU 2×), measured across five fresh contexts after the texture change, with
    raw per-run output committed. Not baseline-subtracted, not redefined.
55. Total shipped bytes under `public/textures/planets/` ≤ **15,000,000**,
    measured on disk and matching `texture-manifest.json`'s `totalBytes`.
56. Textures still stream after first paint; the first contentful frame does
    not block on any map.
57. No new production dependency. Any encoder added for §3.3 is a
    `devDependency`; if a Basis transcoder is vendored it is a static asset
    under `public/basis/`, not a package import at runtime.
58. No `next/font/google` change and no new build-time network dependency
    (§15 owns the local-font migration).
59. `npx tsc --noEmit` exits 0.

### Privacy

60. `/share` stays public and read-only with **zero dollar amounts and zero
    owner-only fields** in HTML, RSC payload, and client bundle — including in
    any encoded radius, size, direction, speed, texture selection, moon,
    satellite, comet, or sector value.
61. The public captain's log exposes **only** `date`, `action`, `ticker`,
    `impactPct`, and `realizedSign`. Canary tests extend the existing
    distinctive-value fixture pattern in
    `src/app/(depth-pull)/share/page.test.tsx` to assert that share counts,
    prices, totals, realized-gain magnitudes, and trade reasons are absent from
    the public render — in HTML, in the RSC payload, and in the client bundle.
62. The public news payload carries only `{ headline, source, url, datetime,
    ticker }`; a canary test asserts no owner-only field rides along.
63. A news-source failure or empty result degrades gracefully — no moon, a
    `NO TRANSMISSIONS` line — and does not throw, blank the scene, or block
    Mission Control. Asserted by a failing-fetch test.
64. The owner-gated `/` route keeps its gate: the owner Mission Control branch
    checks **both** `authenticated` and `ownerGate`, and a valid owner session
    cookie presented to `/share` still yields public content only. This is the
    §8 severe regression; a regression test asserts it.
65. No `.env*` contents are read, printed, edited, staged, or committed, and
    no `vercel --prod` is run.

### Orientation (closes D2)

66. The OVERVIEW orientation line from §8.3 is persistent, present in the
    semantic DOM, present in the 390 px fallback, and names what the sun is,
    what a planet is, and that either can be opened. Its contrast is verified
    per criterion 32.

---

## 12. Evidence to capture and commit

Under `docs/phase10-baseline/section-9/`:

- 1440×900 before/after screenshots for every surface in criterion 25.
- A 32 px rendered-sphere strip for all eight tickers, plus the committed
  32×16 thumbnails, with the per-ticker three-signal table.
- Raw long-task measurement output (five fresh contexts, 1440×900, CPU 2×) and
  the retained measurement script.
- Raw RGB pixel-sampling output and script for criterion 50.
- 390×844 and 320×844 fallback screenshots with `canvas` count and
  `scrollWidth === clientWidth` recorded.
- `docs/phase10-baseline/section-9/README.md` recording: the texture ladder
  step reached with measured totals at each step, the encoder outcome from
  §3.3 step 1 verbatim, the per-ticker 32 px signals, the reduced-motion
  check, the keyboard walk-through of criterion 37, and every screenshot path.

Every checklist item completed in any doc gets an executor suffix
(`— done by codex/<model>`).

---

## 13. New and changed files (minimum)

**New**

- `src/lib/observatory/scene-model.ts` + test
- `src/lib/observatory/planet-identity.ts` + test
- `src/lib/observatory/public-trade-log.ts` + test
- `src/lib/observatory/public-news.ts` + test
- `src/lib/observatory/sector-systems.ts` + test (authoring + hollow-core health)
- `src/components/observatory/orrery/MissionControlBays/*` (seven bays)
- `src/components/observatory/orrery/PlanetDetail.tsx` + test
- `src/components/observatory/orrery/SectorMap.tsx` + test
- `assets/planet-textures/marks/<ticker>.svg` (8)
- `systems/<name>.json` (1)
- `public/textures/planets/texture-manifest.json`,
  `public/textures/planets/thumbs/*.png`

**Changed**

- `scripts/generate-planet-textures.mjs` (authored-plate pipeline, mark
  composite, seam fix, derived emissive/normal, manifest + thumbs, ladder)
- `assets/planet-textures/source/*.png` and its `README.md`
- `src/components/observatory/orrery/OrreryScene.tsx` (consumes the scene
  model; adds nebula, second starfield, comet, moons, satellites, label chip
  and collision yield, docking completion)
- `src/components/observatory/orrery/OrreryWorld.tsx` (planet detail view,
  new semantic controls, orientation line)
- `src/components/observatory/orrery/MissionControl.tsx` +
  `PublicMissionControlContent.tsx` + `OwnerMissionControlContent.tsx` (seven
  bays, teletype, plot)
- `src/components/observatory/orrery/orrery.module.css`
- `src/components/observatory/orrery/SystemsManual.tsx` (new encodings,
  `% OF BOOK` definition, holding-metric definitions moved in from the
  telemetry strip)
- `src/lib/dashboard-data.ts` (`newsByHolding`, public trade log projection)
- `src/app/(depth-pull)/share/page.test.tsx` (extended canaries)
- Deleted: the source-string guards named in criterion 47

---

## 14. Implementation sequence

Follow `UNIVERSE_IDEAS_2.md` §8's order, which front-loads the owner's
loudest complaint and the riskiest measurement:

1. **A** — textures. Ladder and measurement first; art second.
2. **B** — overview composition and labels.
3. **C** — Mission Control.
4. **D** — planet detail view.
5. **F** — sun docking and the orientation line.
6. **E** — moons → satellites → sector map, in that order.

Run `npm test` and `npm run build` after each package. If a package cannot be
completed, finish every other package in full and report exactly what was left
and why — do not silently narrow scope, and do not leave uncommitted work.
