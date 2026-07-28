# Phase 10 §10 design proof: universe colour, material, and command structure

Status: `existing-package-equivalent` (items 1–4, 6, 7) + `draft` (items 5, 8)

Prepared July 28, 2026 by `claude-code/opus-5` (Claude Lead, `specify` stage).

`docs/phase10-workflow/DESIGN_GATE.md` allows §10 to cite the owner-approved
combination of `UNIVERSE_IDEAS_3.md` (rev 2), `UNIVERSE_PALETTE_3.html`,
`docs/reference/README.md`, and §10's required live 1440×900 proof surfaces —
**provided the mapping is recorded explicitly and the existence of those files
is not assumed to prove every item.** This document is that mapping. Two of the
eight required proof items are **not** decided anywhere in the owner package and
are decided here: the **state matrix** and the **freeze boundary**.

---

## Intent

- **User question:** *What is my portfolio doing this week, and which holding is
  responsible?* — answered from a single still frame of the OVERVIEW, before any
  click.
- **First-five-second comprehension:** one dominant body (the sun) is the
  portfolio and it is visibly the largest thing in the scene; eight named worlds
  orbit it; each world drags a trail whose **hue says direction** and whose
  **lightness says magnitude**; the sky is photographed, not plotted.
- **Primary action or conclusion:** click the sun for Mission Control, or click
  a world for that holding. Both destinations are stated in persistent on-screen
  text, not discovered.

## Annotated references

| reference | exact quality borrowed | quality deliberately not borrowed |
|---|---|---|
| `UNIVERSE_PALETTE_3.html` §00 "THE LAW" | The Fraunhofer spectrum-minus-two-bands as the literal palette authority; the computed badge/ratio discipline (every claim recomputed on the page) | The board's own chrome (its `.bay` cards are a swatch layout, not a Mission Control layout) |
| `UNIVERSE_PALETTE_3.html` §02b signal ramps | The two magnitude ramps with the shipped `#63ef98`/`#ff665f` as exact midpoints, and the ≥ 3:1-on-void dark-end floors | The linear-gradient rendering; production uses a 64-entry LUT, not CSS interpolation |
| `docs/reference/concept-desktop-overview.png` | One planet per ring, no overlap; always-visible ticker labels; trail taper carrying direction; the belt as a labelled outer ring | Its illustrative data, and its sun-to-first-orbit crowding — §10 explicitly *widens* that clearance via the new sun rule |
| `docs/reference/concept-sun-health-states.png` | Discrete, art-directed sun states where **down is not ugly** — corona width, colour temperature, and sunspots varying together | Nothing; this reference is unchanged from §8/§9 and its mapping already ships |
| `docs/reference/planet-surface-mood-reference.jpg` | Density of surface detail, rim light, the sense of an inhabited world — the quality bar for the relit textures | **Must not be reproduced literally.** Its eye mark and wordmark are a real third-party identity |

## Negative list

Named patterns that would make §10 generic, confusing, or product-inconsistent:

- **Uniformity as a layout.** Every bay the same size, same 1px border, same
  radius, same padding, same 12px type in an even grid. `UNIVERSE_IDEAS_3.md` §7
  names this as the actual cause of the owner's "AI vibe-coded look" verdict, and
  states that colour alone does not remove it.
- **Graph paper.** Concentric constant-opacity ellipses plus an evenly scattered,
  two-size dot field. Both are present in the shipped build and both are being
  cured (§6 of the round-3 document).
- **Eight differently-coloured concentric orbit rings in the 3D scene** — the
  owner's own idea, explicitly *refused* in-scene and *adopted* in the radar.
- **A wall of unread prose.** The far-left Mission Control prose column is
  deleted, not shrunk.
- **Over-encoding.** The freed axial-spin channel is **banked**. Nothing new may
  be re-homed onto an ambient scene property.
- **Decoration without a job.** Any body that can disappear without changing
  comprehension or navigation. The radar sweep survives only because its period
  encodes data-refresh staleness.
- **Decals.** A crisp vector stamped over a finished painting, in any form —
  including billboard marks that counter-rotate against the surface.
- **Semantic hue theft.** Any decorative or instrument light at chroma > 0.30
  inside hue 125°–165° or 345°–20°.

## Design grammar

- **Palette authority:** `src/lib/observatory/universe-palette.ts` becomes the
  single source of colour truth, replacing hexes currently scattered across
  `scene-model.ts` (9 unique), `OrreryScene.tsx` (12 unique), `orrery.module.css`
  (75 unique), and the bays. It exports the tokens, the three decorative ramp
  LUTs, the two signal ramp LUTs, the extended contrast table, and the firewall
  checker itself. It also emits CSS custom properties so the 2D fallback and the
  Mission Control CSS inherit the same values rather than re-declaring them.
- **Typography roles:** Chakra Petch 600 (self-hosted, vendored, OFL) for
  nameplates, folder tabs, and ID plates. All numerals stay in the existing mono
  stack with `tabular-nums`. Type scale spans **64 → 15 → 11px**; the shipped
  everything-at-≈12px flatness is the defect being corrected. No `next/font/google`
  change and no build-time network dependency (§16 owns the font migration).
- **Spacing rhythm:** deliberately unequal. Dominant bay gutter 20px, instrument
  strip gutter 10px. No two bays the same size. Tabs size to their names.
- **Component materials:** two, and they must be visibly different. Instruments
  are **black glass** with CRT-curved 10px bezels. The LOG and the BRIEFING are
  **parchment** — `#f0e2c4` paper, `#2b1a10` umber ink (13.02:1 AAA), 2px
  corners, deckled edge, file-folder tabs.
- **Interaction language:** every bay names its question and has exactly one
  click-through destination (the table in `UNIVERSE_IDEAS_3.md` §7). Radar ring
  or blip → that holding's manifest row expands in place; Enter or double-click →
  full planet view. Escape or empty-space double-click always returns to OVERVIEW.
- **Motion and reduced-motion boundary:** motion is *reduced* overall. Axial spin
  is decorative only, prograde, seeded 80–140 s; moons slow to ~40 s and stop
  axial spin. One sweep is added and it encodes staleness. Under
  `prefers-reduced-motion`: no sweep, no twinkle, no cursor exhaust, no
  brand-first phase snap — and every encoding those channels carry is still
  present as text.
- **Responsive mode:** desktop-first, unchanged. Below 1024px the existing tested
  fallback ships as-is; `canvas` count 0 at 390px and 320px.

## State matrix

Not decided in the owner package. Decided here, and each row is carried into the
specification as a numbered criterion.

| state | relevant? | intended composition or behavior | proof |
|---|---|---|---|
| real data | yes | Eight relit worlds in the [0.16, 0.55] luminance window; sun largest body; trails at ramp lightness for the real weekly magnitude | `VIS-01`, `VIS-03`, `VIS-04` |
| negative values | yes | Loss ramp, dark end floored at 3.08:1 on the void; chrome colour **unchanged** by health; sun's weak/struggling states art-directed as carefully as strong | `VIS-05`, `VIS-11` |
| near-flat / zero magnitude | yes | A trail still renders. Below the 0.2% clamp floor the holding shows the flat token `#e3b65c` at minimum arc — never nothing. This is owner defect 3 | `DEF-03` |
| empty (no holdings in belt, no moons, no comet) | yes | Belt ring renders with zero bodies and its label states the count; no moon and no comet is a valid frame; nothing throws | `BHV-11` |
| stale | yes | The radar sweep's period equals the data-refresh interval, so a stalled sweep *is* the staleness signal; under reduced motion a timestamp stamp replaces it | `BHV-09`, `ACC-07` |
| loading | yes | Textures stream after first paint; the first contentful frame does not block on any map; a world with an unloaded map renders its deterministic shader art rather than black | `BLD-05` |
| error (texture/news/quote source down) | yes | Unavailable values render `—` with the reason reachable, never `0.0%`; a failed map keeps shader art; a failed news source yields no moon and a `NO TRANSMISSIONS` line | `FIN-05`, `BHV-12` |
| private/public | yes | `/share` shows zero dollar amounts and zero owner-only fields in every new channel, including the radar click-through detail card | `PRV-01`–`PRV-04` |
| reduced motion | yes | Sweep, twinkle, exhaust, phase snap, warp all disabled; static trails keep taper + white head so direction still reads | `ACC-05` |
| fallback renderer (<1024px, no-WebGL, no-JS) | yes | Existing tested 2D fallback unchanged in structure, now inheriting the palette through CSS custom properties rather than duplicated hexes | `MOB-01`–`MOB-03` |

## Proof surfaces

| viewport / environment | artifact | what this proves |
|---|---|---|
| desktop 1440×900 | `docs/phase10-baseline/section-10/after/*.png` — OVERVIEW, planet detail, each Mission Control bay, sector map, sun docking, radar click-through | The composition, the dominant bay, the material split, the 64px readout, trail direction+magnitude in a still frame |
| desktop 1440×900, instrumented | live sphere-strip capture with per-world equatorial-band mean luminance **and mark chirality** | The luminance window and the mirrored-mark defect, measured from the render rather than the source map |
| desktop 1440×900, instrumented | trail sampler output: hue lock, ΔE\*ab vs the payload-derived expectation, ordering | That the trail *encoding* is correct, not that a literal hex is present |
| mobile 390×844 and 320×844 | fallback screenshots with `canvas` count and `scrollWidth === clientWidth` | The desktop-first record: no mobile 3D was built and the tested fallback is unchanged |

§9's `docs/phase10-baseline/section-9/after/overview-1440x900.png` is **not** a
§10 baseline. It was deliberately never recaptured, and any capture at that
commit already renders §10's round-3 textures.

## Owner decision

- **Selected direction:** `UNIVERSE_IDEAS_3.md` revision 2 in full — the
  Fraunhofer rule and its two-tier firewall, the relit worlds, magnitude-in-hue
  trails, the banked spin channel, the dominant sun, the star population and ring
  falloff, and Mission Control's structural restructure.
- **Rejected alternatives, recorded by the owner package itself** (`UNIVERSE_IDEAS_3.md`
  §10): honest-dark trails that disappear on the void (floored instead);
  textures-untouched (reversed — the owner wins, the matter clause survives);
  variable white-hot heads (fixed at 12% as a calibration reference); billboard
  marks and generation-time wordmarks (three carved capitals plus brand-first
  entry); re-homing the freed spin channel (banked); distinct orbit colours in
  the 3D scene (adopted in the radar only).
- **Approval evidence:** `PHASE10_STATE.json` `roadmap_amendment_3` — inserted
  July 28, 2026 by owner direction, recording that every quantitative claim in
  `UNIVERSE_IDEAS_3.md` was independently recomputed before adoption, and
  `PHASE10.md` §10, which restates the design as roadmap scope with its own
  acceptance dimensions.

## Freeze boundary

Not stated in the owner package. Decided here, because §9 ran seventeen turns
and the boundary between "fix it" and "redesign it" is what kept reopening.

**Defect remediation — in scope for §10 review findings:**

- Any of the ten carried owner defects still reproducing at the candidate.
- A shipped value that misses a number this specification states (a luminance
  outside [0.16, 0.55], a ramp sample outside its ±10° band, an arc outside
  36–64°, a byte total over 30 MB, contrast under its stated floor).
- A state from the matrix above rendering incorrectly, throwing, or fabricating
  a number.
- An encoding present in colour, motion, or glow but absent from the semantic DOM.

**New creative direction — requires a new owner-scoped section, not a §10 finding:**

- Spending the banked spin channel on any new encoding.
- Adding a body, bay, ramp, or ambient system not named in `UNIVERSE_IDEAS_3.md`
  §11's seven-step sequence.
- Changing the void `#020706`, the two stolen bands, or the sign→hue mapping
  (green = up, red = down).
- Restyling any surface outside `/` and `/share`.
- Re-litigating a position `UNIVERSE_IDEAS_3.md` §10 already picked.

Taste feedback that names none of the above is owner scope for §11+, recorded in
the progress log rather than absorbed into §10.

## Acceptance-ledger mapping

| proof item | criterion ID(s) |
|---|---|
| 1. Intent | `BHV-01`, `BHV-02`, `VIS-03`, `DEF-08` |
| 2. Annotated references | `VIS-01`, `VIS-02`, `VIS-04`, `VIS-06` |
| 3. Negative list | `VIS-07`, `VIS-08`, `VIS-09`, `FWL-01`–`FWL-04` |
| 4. Design grammar | `VIS-07`, `VIS-10`, `VIS-11`, `BLD-06`, `ACC-05` |
| 5. State matrix | `DEF-03`, `BHV-09`, `BHV-11`, `BHV-12`, `FIN-05`, `BLD-05`, `ACC-05`, `ACC-07`, `MOB-01`–`MOB-03`, `PRV-01`–`PRV-04`, `VIS-05` |
| 6. Proof surfaces | `VIS-12`, `MOB-01`, `TST-03`, `TST-04`, `TST-06` |
| 7. Owner decision | `DEF-01`–`DEF-10` (the ten carried defects are the owner's own acceptance list) |
| 8. Freeze boundary | Governs review scope; not itself a criterion |
