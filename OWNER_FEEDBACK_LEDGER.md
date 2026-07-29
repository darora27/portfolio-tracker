# Owner feedback ledger — v2, the tracker

Proposed replacement for `OWNER_FEEDBACK_LEDGER.md`, delivered with
`UNIVERSE_AUDIT.md` (July 29, 2026). Same single durable record, one
structural change: **every owner item is now a row with an ID, a status,
and a closes-when condition.** Nothing from v1 was dropped; three rows
arrive pre-marked `landed` because the audit found their fixes already in
the shipped code, unshown.

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
| FB-01 | Planets too close; *"make the sun bigger and everything more spaced out, or make the planets smaller"*; frame unused | ≥3 (R4 brief, "so many times", Jul 29) | **designed** | `UNIVERSE_AUDIT.md` §5.1 — radii [0.62, 1.35], gap 1.75×(rᵢ+rᵢ₊₁)+0.55, sun rule unchanged | **§12a** | measured gap ≥ 1.0× larger disc **and he says it looks right** |
| FB-02 | Background *"still so meh"* — *"futuristic portrayal of retro futurism"*, Loki TVA / Miss Minutes | ≥3 | **designed** | Round 6 §2 (five moves) | **§12b** | before/after pair on contact sheet **and his sentence** |
| FB-03 | Trails *"too long and cheap looking… they were a lot better before"* | 2 | **landed** — 26–46° in `scene-model.ts` since §11 (was 36–64°) | §11 spec | — | he confirms from §11.R sheet; if still wrong → 18–30° (hue now carries magnitude) |
| FB-04 | *"No company logos are visible on any planet"* | 5 | **needs-measurement** — do NOT regenerate textures again | Audit §5.3: scale-harness strip at 44/56/64px + approach; expected fix = approach camera/exposure (F2/F3), overview identity stays colour+silhouette | **§11.R (measure) + §12a (decide)** | one capital reads on every *selected* planet in capture; overview policy gets his sign-off |
| FB-05 | *"Small fonts need to be a good bit larger so that you can even see what they have to say at all"*; large slightly smaller | ≥3 (§10, §11, R6) | **designed · critical** (§11 finding F1) | Round 6 §5 — five tokens 56/24/15/13/11, literal-size gate, rendered check | **§11.R** | computed-style assertions pass **and he reads the panel without squinting** |
| FB-06 | Rocket cursor — *"the physics of flying should somewhat be incorporated"* | 4 | **designed** — and mock-tuned by him (holds heading between strokes) | Round 6 §3 (k 1600, c 80, bank 28°, no re-park) | **§12a** | he flies it in the build and says so |
| FB-07 | *"The planet sits too far right"* — ASML; dead space left | 1 (§11 finding F2) | **designed** | Round 5 — left-third anchor x ≈ 30%, rail ≤ 380px | **§11.R** | measured disc centre ≈ 30% at 1440×900 + his confirm |
| FB-08 | Top tab strip — *"rather there be nothing than that super small font"*; try no divider; try full black | 1 | **designed** | Round 6 §4.2 — variants A / B / C | **§12a (captures only)** | he picks a variant from the sheet; then build it |
| FB-09 | Exit terminal — *"cool feature but… too much information… no happy medium"* | 1 | **designed** | Round 6 §4.1 — 20-word sign-off receipt + regrouped keyboard terminal | **§12a** | he sees receipt + terminal and confirms |
| FB-10 | News must hyperlink to the actual article or be cut | 1 | **landed** — real `<a href>` in panel + NEWS since §11 | — | — | he clicks one from the §11.R sheet |
| FB-11 | Correlation — *"cannot read what it means"* about HIS portfolio | 1 | **half-landed** — generic paragraph shipped §11; named-pair sentence not | Round 6 MOVES WITH template (≤ 14 words, his top pair) | **§12a** | he says back what it tells him about his book |
| FB-12 | DRAFT rig — off-design, hard to find, planets too fast, unclear | 1 | **landed · 3 gaps** (tape/GHOST/pit-rail all present) | Audit §5.4 — MOTION default off, dish ×1.6 → ×1.0, latch in strip + visible coach line | **§12a** | he opens, understands, fiddles, confirms |
| FB-13 | Stock technical dashboard — *"full scale graph… a much greater detailed look… unique kinds of mathematical modeling"* | 1 | **designed** | Round 6 §1 — the Chart Room + owner-reviewed mock | **§12b** | all three doors work; he uses it and says so |
| FB-14 | *"Take out the heavy glowy AI looking fonts… just a tad less bright"* — text only, never signal colours | 1 | **scheduled** | §12 owner addition; contrast floors hold | **§12a** | before/after on sheet + his confirm |
| FB-15 | *"Play around with the thin rectangular boxes being there and not being there"* | 1 | **scheduled** | one experiment with FB-08 variant B | **§12a (captures)** | he picks |
| FB-16 | XLK — *"replicating this solar system pattern… get the ball rolling sooner than later"* | 1 | **scheduled** | ledger v1 §7 sequence; `systems/README.md` done | **§13′** | hollow-core XLK system visitable behind a labelled door |
| FB-17 | Planet panel slightly too big | 1 | **landed** — 380px rail since §11 | Round 5 | — | he confirms from §11.R sheet |
| FB-18 | Trade-entry form (the one unfold-ed piece) | — | **needs-owner** — plain vs retrofuturist; recommendation: plain | ledger v1 §4 | **§17′** | he answers, then it ships |
| LT-01 | Long-task gate breached 55–65ms, five rounds; cause: three.js shader acquisition | — | **designed** | Audit §6 — `renderer.compileAsync` in staged warmup, re-measure | **§12a** | five-context run < 50ms, or the figure goes to him with data |
| D1 | Green trail on a down week — unreproduced | 1 | **held** | do not change colour logic until a contradicting ticker is named; then severe | — | named ticker or retired |
| D2 | *"The website is still relatively confusing"* | 1 | **open · general** | R5/R6 legibility work is the response | tracked via FB-05/-08/-09/-11 | subsumed rows close |
| D3 | Reddit for `/research` | 1 | **needs-owner** | reddit-fetch is a local tool, not a server data source — which problem is it solving? | parked | he clarifies or retires |

**Board count at adoption: 15 open/designed/scheduled · 4 landed awaiting
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
