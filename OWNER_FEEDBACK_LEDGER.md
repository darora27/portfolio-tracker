# Owner feedback ledger — v2, the tracker

**ADOPTED by Devan, July 29, 2026.** This is the live record; v1 is
superseded. Delivered with `UNIVERSE_AUDIT.md`. Same single durable record,
one structural change: **every owner item is now a row with an ID, a status,
and a closes-when condition.** Nothing from v1 was dropped; three rows
arrive pre-marked `landed` because the audit found their fixes already in
the shipped code, unshown.

The §0 rules and the appendix are binding and machine-checked: rule 2
(debt blocks scope) and the visual-truth standard are enforced by
`npm run phase10:validate`. The board check applies from §12 — §11's scope
was fixed by owner direction to four findings and nothing else — and the
visual-truth check applies from §11's review onward.

## 0. How this file works now

**Statuses:** `open` → `designed (→doc)` → `scheduled (→§)` →
`landed (→where)` → `verified (→capture)` → **`CONFIRMED`** (his words,
quoted, dated). Side states: `regressed` · `needs-owner` · `retired`.

**The four rules:**

1. **Intake in the same turn.** Any turn receiving owner feedback
   transcribes it to rows here before other work. A brief containing owner
   quotes absent from this file invalidates the turn that consumed it.
2. **Debt blocks scope.** Every section spec opens with this board: each
   `open`/`designed` row marked `scheduled here`, `scheduled §n`, or
   `deferred — owner initials`. While ≥ 5 rows sit open/designed, the next
   section is a landing section unless the owner overrides in writing.
3. **Re-report alarm.** Owner re-reports a `landed`+ row → it flips to
   `regressed` and blocks the next section until root-caused (never landed /
   broke later / design missed).
4. **Only two things close a row:** a `CONFIRMED` owner quote, or a
   committed capture for items he has delegated to measurement. `landed` is
   not done. A criteria-ledger `pass` is not done.

---

## 1. Product thesis — unchanged

> *"We have created an actual creative product that is much more than just
> financial data. Still the foundation… is the financial data and the purpose
> is to be able to see complex data in a simple and understandable way
> without having to spend too much time analyzing all the numbers."*

Ten seconds or less for any detail view. A beautiful surface that cannot be
read has failed.

---

## 2. The board

| ID | Item (his words, abbreviated) | Reports | Status | Design | Scheduled | Closes when |
|---|---|---|---|---|---|---|
| FB-01 | Planets too close — **and now also: zoom the whole system out.** Jul 29 post-drop: *"Planet orbits are still too close to each other. Spread them out more and zoom out the entire solar system as a whole."* | **4** | **designed · widened** | Audit §5.1 (radii [0.62, 1.35], gap 1.75×(rᵢ+rᵢ₊₁)+0.55) **plus a camera pull-back** — spacing alone was the plan and he has now asked for both | **§12a** | measured gap ≥ 1.0× larger disc, whole system fits with margin, **and he says it looks right** |
| FB-02 | Background — Jul 29 post-drop: *"Background is still the same and boring."* Wants *"futuristic portrayal of retro futurism"*, Loki TVA / Miss Minutes | **4** | **designed** | Round 6 §2 (five moves) | **§12b** | before/after pair on contact sheet **and his sentence** |
| FB-03 | Trails *"too long and cheap looking… they were a lot better before"* | 3 | **landed (18–30°, `a7f85ac`) — awaiting owner eyes.** Root cause of the regression: 26–46° was a half-step; the row's own fallback band was correct all along | `scene-model.ts` band 18–30° | — | he says they look right |
| FB-04 | *"No company logos are visible on any planet"* — Jul 29 post-drop, again: *"Still not seeing any logos on the planets themselves."* | **6** | **needs-measurement** — do NOT regenerate textures again | Audit §5.3: scale-harness strip at 44/56/64px + approach; expected fix = approach camera/exposure (F2/F3), overview identity stays colour+silhouette | **§11.R (measure) + §12a (decide)** | one capital reads on every *selected* planet in capture; overview policy gets his sign-off |
| FB-05 | Small fonts. Jul 29 post-drop, **after the five-token ramp shipped**: *"Mission control has a lot of font that is too small."* | **4** | **REGRESSED · critical — the ramp did not reach Mission Control.** Fable's drop tokenised `orrery.module.css` + `mission-control-layout.ts`; his complaint is now specifically Mission Control's own surfaces | root-cause first: find which Mission Control text is still off-ramp, then extend the ramp — do NOT nudge individual sizes | **blocks §12a until root-caused (rule 3)** | he reads Mission Control without squinting |
| FB-06 | Rocket cursor — *"the physics of flying should somewhat be incorporated"* | 4 | **CONFIRMED — Jul 29, 2026** · his words: *"Rocket ship cursor works well."* Closed after four requests. | Round 6 §3 as shipped in `a7f85ac` | — | ✅ closed |
| FB-07 | Planet still too far right. Jul 29 post-drop: *"the planet still shows to be too far over to the right. Needs to be farther over to the left as there is a lot of empty space on the left."* | **2** | **designed** (§11 finding F2, unstarted — camera work held for captures) | Round 5 left-third anchor x ≈ 30% | **§11.R** | measured disc centre ≈ 30% at 1440×900 **and his confirm** |
| FB-08 | Top tab strip — *"rather there be nothing than that super small font"*; try no divider; try full black | 1 | **designed** | Round 6 §4.2 — variants A / B / C | **§12a (captures only)** | he picks a variant from the sheet; then build it |
| FB-09 | Exit terminal (green panel, left side, on leaving Mission Control). Jul 29 post-drop: *"I do not like that and I have told you that and yet it is still in the application."* | **2** | **designed — flagged: told twice, still shipped.** Not a design gap; it was scheduled and not built | Round 6 §4.1 — 20-word sign-off receipt + regrouped keyboard terminal | **§12a, first item** | he sees receipt + terminal and confirms |
| FB-10 | News must hyperlink to the actual article or be cut | 1 | **CONFIRMED — Jul 29, 2026** · his words: *"news articles open."* Closed. | — | — | ✅ closed |
| FB-11 | Correlation — *"cannot read what it means"* about HIS portfolio | 1 | **half-landed** — generic paragraph shipped §11; named-pair sentence not | Round 6 MOVES WITH template (≤ 14 words, his top pair) | **§12a** | he says back what it tells him about his book |
| FB-12 | DRAFT rig. Jul 29 post-drop: *"The whole draft rig thing is still very mediocre and consuming and needs some further iterations of development."* | **2** | **landed · 3 gaps** (tape/GHOST/pit-rail present) | Audit §5.4 — MOTION default off, dish ×1.6 → ×1.0, latch in strip + visible coach line. If §12a's three lines do not satisfy him, this is a Fable trigger (same complaint twice after landed) | **§12a** | he opens, understands, fiddles, confirms |
| FB-13 | Chart Room / full analysis. Jul 29 post-drop names the doors: *"when I click on full analysis it should take me to that full analysis terminal that fable made"* (`UNIVERSE_STOCK_LAB_2.html`) and *"Clicking on the orbits for the 2d orbits in the mission control does not take you to the full analysis of the stock. Some of the orbits just take you back to the brief report."* | **2** | **designed** | Round 6 §1 + the mock he named — **`UNIVERSE_STOCK_LAB_2.html` is in `~/Downloads`, not the repo; it must be moved in before §12b specs** | **§12b** | FULL ANALYSIS and the Mission Control 2D orbits both land in the Chart Room; he uses it and says so |
| FB-14 | *"Take out the heavy glowy AI looking fonts… just a tad less bright"* — text only, never signal colours | 1 | **landed (`a7f85ac`) — awaiting owner eyes.** Blooms cut: world title 22px/0.38→10px/0.22, orientation 24px/0.32→10px/0.20, hover flare 12px/0.7→8px/0.45. Signal colours untouched | §12 owner addition; contrast floors hold | — | his confirm |
| FB-15 | *"Play around with the thin rectangular boxes being there and not being there"* | 1 | **scheduled** | one experiment with FB-08 variant B | **§12a (captures)** | he picks |
| FB-16 | XLK — *"replicating this solar system pattern… get the ball rolling sooner than later"* | 1 | **scheduled** | ledger v1 §7 sequence; `systems/README.md` done | **§13′** | hollow-core XLK system visitable behind a labelled door |
| FB-17 | Planet panel size **and direction of growth.** Jul 29 post-drop, after 460px: *"The planet terminal dashboard thing that comes up should take up more space as well, expanding horizontally to the left. Contain a little bit more information, but simple information."* | **3** | **landed (460px token, `a7f85ac`) — but he has now asked for MORE, and for it to grow leftward, and for slightly more content.** History: "slightly too big" → 380 → "too small" → 460 → "more space, expand left" | pair with FB-07: the panel grows left into the dead space while the planet moves left too. Capture 460/520/580 and let him pick rather than guessing a fourth number | **§11.R with F2** | he picks a width from a capture **and** the extra fields are simple |
| FB-18 | Trade-entry form (the one unfold-ed piece) | — | **needs-owner** — plain vs retrofuturist; recommendation: plain | ledger v1 §4 | **§17′** | he answers, then it ships |
| LT-01 | Long-task gate breached 55–65ms, five rounds; cause: three.js shader acquisition | — | **designed** | Audit §6 — `renderer.compileAsync` in staged warmup, re-measure | **§12a** | five-context run < 50ms, or the figure goes to him with data |
| D1 | Green trail on a down week — unreproduced | 1 | **held** | do not change colour logic until a contradicting ticker is named; then severe | — | named ticker or retired |
| D2 | *"The website is still relatively confusing"* | 1 | **open · general** | R5/R6 legibility work is the response | tracked via FB-05/-08/-09/-11 | subsumed rows close |
| D3 | Reddit for `/research` | 1 | **needs-owner** | reddit-fetch is a local tool, not a server data source — which problem is it solving? | parked | he clarifies or retires |
| FB-19 | `? SYSTEMS MANUAL` button overlaps the planet panel and truncates its header line (`SPIN = SCENERY · ORBIT = WEE…`) | 0 — found by capture, not by him | **open** | none needed; z-order/layout collision | **§12a** | the header line reads whole on a capture |
| FB-20 | Orphaned labels — `CBRS` and `COST` render at the frame edge with no attached body at approach scale | 0 — found by capture | **open** | none needed; label culling on approach | **§12a** | no label without its body on a capture |

**Board, July 29 2026 — after the Fable drop (`a7f85ac`) and his second look:**

**Closed on his words (2):** FB-06 rocket cursor *"works well"* — after four
requests. FB-10 news links *"news articles open."*

**Landed, awaiting his eyes (2):** FB-03 trails at 18–30°, FB-14 text glow
reduced. He has not yet commented on either since the drop.

**Blocking §12a (1):** FB-05. The five-token ramp shipped and he still reports
*"Mission control has a lot of font that is too small."* Fourth report. The
ramp reached `orrery.module.css`; Mission Control's own surfaces are the gap.
Root-cause before touching a size.

**Re-reported this round (6):** FB-01 spacing (4th, now also asking to zoom the
whole system out) · FB-02 background (4th) · FB-04 logos (6th) · FB-07 planet
anchor (2nd) · FB-09 exit terminal (2nd, *"I have told you that and yet it is
still in the application"*) · FB-12 DRAFT rig (2nd).

**Two lessons this board has now paid for twice.** FB-17 went *slightly too
big* → 380 → *too small* → 460 → *more space, expand left*: a row that closes
on a number instead of his eyes will oscillate. Give him two or three captures
and let him point. And FB-09 was never a design problem — it was designed,
scheduled, and simply not built, which is exactly the failure the ledger
exists to make impossible.

**Original count at adoption: 15 open/designed/scheduled · 4 landed awaiting
his eyes · 3 needs-owner/held.** Rule 2 therefore makes the next section a
landing section (§11.R, then §12a) — which is exactly the audit's plan.

---

## 3. Settled owner decisions — unchanged from v1

Desktop-first (phones keep the tested 2D fallback) · real brand logos
allowed · rocket cursor replaces lock-on · axial spin decorative, channel
banked · Mission Control by viewer identity · `/` and `/share` share one
implementation · trail magnitude in hue lightness, dark ends floored 3:1 ·
plain section names · sector map cut pending the multi-system decision ·
public trade log: action/ticker/date/%-impact only · public news headlines
allowed · remaining sections fold into Mission Control · **universe matters
most; trim the deeper routes to whatever is simplest that works** · round 6
adopted in full as §12 (*"full throttle ahead"*).

Cut and not reopened: thesis/journal, multi-user, intraday, brokerage
integration, the five-chapter `/share`, `/compare` and its canned scenarios
(retired with the DRAFT rig, round 4 §8).

## 4. Standing rules the owner has enforced — unchanged

Never show a zero as if it were real · every number carries its window
(TODAY / WEEK / 30D / SINCE BUY / SINCE START) · no dollars on public
surfaces, ever · `expect(source).toContain(...)` is not coverage for
rendered behaviour · every visual channel encodes one real number ·
market-relative figures derive from TWR · the Fraunhofer rule and both
firewall tiers · route-owned long tasks under 50ms.

## 5. Design documents, authority order

`UNIVERSE_IDEAS_6.md` (newest, adopted whole) → `_5` → `_4` → `_3` → `_2` →
`_1` → `UNIVERSE_DIRECTION.md`. This ledger outranks all of them where they
conflict. `UNIVERSE_AUDIT.md` governs process; the mocks
(`UNIVERSE_STOCK_LAB.html`, `UNIVERSE_DRAFT_RIG.html`,
`UNIVERSE_LEGIBILITY_MOCK.html`) are owner-reviewed references.

---

## Appendix — ready to paste into AGENTS.md and both standing prompts

> **Ledger rules (owner-adopted).** (1) Any turn receiving owner feedback
> transcribes it to `OWNER_FEEDBACK_LEDGER.md` rows before other work; a
> consumed brief containing owner quotes absent from the ledger invalidates
> the turn. (2) Every section spec opens with the ledger board: each
> open/designed row marked scheduled-here, scheduled-§n, or deferred with
> owner initials; while ≥ 5 rows are open/designed the next section is a
> landing section unless the owner overrides in writing. (3) An owner
> re-report of a landed/verified/CONFIRMED row flips it to `regressed` and
> blocks the next section until root-caused. (4) Rows close only on an
> owner quote or a committed capture; `landed` and criteria-`pass` are not
> done.
>
> **Visual truth (owner-adopted).** A visual claim requires pixel evidence:
> a committed capture from `npm run phase10:capture` (named viewport, named
> state, fixture data), a sampled-pixel/geometry measurement, or the owner's
> recorded sentence for taste verdicts. Sections cannot pass review with any
> visual criterion `not_run`/`deferred`/`blocked`; DOM presence, source
> greps, and build exits never satisfy a `VIS-*` criterion. If no browser
> can launch, the turn ends at `needs-capture` / `next_actor: devan` with
> the exact command to run. Every review produces
> `docs/phase10-baseline/section-N/contact-sheet.md` — ≤ 12 captures, each
> captioned with the criteria and FB-rows it evidences. Cap sections at
> ~20 criteria, ≤ 12 visual.
