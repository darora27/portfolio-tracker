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
| FB-01 | Planets too close / zoom out | **5** | **NEARLY THERE — Jul 30:** *"spacing looks good. The orbits could be spread out just a little bit more and the system should be zoomed out a little bit more too. but the proportions are good."* **Proportions CONFIRMED.** | one more small step in the same direction: widen the gap term slightly and drop `OVERVIEW_BELT_SPAN_PCT` a little below 0.80. Do NOT re-derive the ratios — he has explicitly blessed the proportions | **§12b** | he says the spread and zoom are right |
| FB-02 | Background — Jul 29 post-drop: *"Background is still the same and boring."* Wants *"futuristic portrayal of retro futurism"*, Loki TVA / Miss Minutes | **4** | **designed** | Round 6 §2 (five moves) | **§12b** | before/after pair on contact sheet **and his sentence** |
| FB-03 | Trails *"too long and cheap looking… they were a lot better before"* | 3 | **CONFIRMED — Jul 29, 2026** · his words: *"trails look fine."* Closed at 18–30°. The regression's root cause: 26–46° was a half-step, and the row's own fallback band had been right all along | `scene-model.ts` band 18–30° (`a7f85ac`) | — | ✅ closed — **and defended.** Jul 29: §11's trail-colour verifier assumed the old 26–46° band and could not find a valid sample at 18–30° (ASML's ribbon sits fully behind its own disc, furthest sample 7.1px inside a 31.06px radius). Devan refused to re-lengthen the trails to suit the tool and authorised temporal per-holding sampling instead. The band he confirmed is not negotiable to a verifier's convenience. |
| FB-04 | No company logos visible on ANY planet. Jul 29, 8th and decisive: *"NONE OF THE PLANETS AT ALL HAVE ANY LOGOS NOT JUST IBM OR NBIS."* | **8** | **RETIRED to colour+silhouette identity — by his own decision rule.** He authorised one repair attempt with an explicit fallback. The attempt succeeded at the input layer and is measured: ibm.svg and nbis.svg carried full-canvas background plates, alpha 100% / 98.62%, so no mark shape ever reached those two composites; plates removed, letterforms recoloured, **alpha now 4.88% / 20.98%**. But he reports no mark on any of the eight, and §11.R had already proven the other six carry exact mark composites. **Therefore the remaining defect is downstream of the art** — render scale, exposure, material, or mark longitude facing away — not the SVGs and not the texture pipeline. He declined to pursue it further now. | Overview and approach identity rest on colour + silhouette, as he directed. **If it is ever reopened, start downstream: the six good composites prove the art is fine, so measure the material and the approach exposure — do NOT touch the SVGs or regenerate textures again.** | — | ✅ retired by owner decision, Jul 29 2026 |
| FB-05 | Small fonts in Mission Control | **6** | **STILL OPEN, but the language softened** — Jul 30: *"The smaller fonts on the mission control still need to be a bit bigger."* Prior rounds were *"way too small"*; the role→token map moved it, it has not arrived | raise the small end of the ramp again; the role mapping is right, the values at the bottom are still short | **§12b** | he reads Mission Control without squinting |
| FB-06 | Rocket cursor — *"the physics of flying should somewhat be incorporated"* | 4 | **CONFIRMED — Jul 29, 2026** · his words: *"Rocket ship cursor works well."* Closed after four requests. | Round 6 §3 as shipped in `a7f85ac` | — | ✅ closed |
| FB-07 | Planet sits too far right | 2 | **CONFIRMED — Jul 29, 2026** · his words: *"planet position is correct for the most part now."* Closed on §11.R's left-third camera framing; deterministic projection holds x ≈ 30% | Round 5 left-third anchor | — | ✅ closed |
| FB-08 | Top tab strip treatment | 1 | **CONFIRMED — Jul 30, 2026** · his words: *"B is fine."* **Variant B ships**, boxes off. | Round 6 §4.2 variant B | make B the shipped default | ✅ picked — implement B |
| FB-09 | Exit terminal springing open on leaving Mission Control | 2 | **CONFIRMED — Jul 30, 2026** · his words: *"Exit issues seem resolved."* Closed after being told twice and shipped late. | Round 6 §4.1 receipt + regrouped terminal | — | ✅ closed |
| FB-10 | News must hyperlink to the actual article or be cut | 1 | **CONFIRMED — Jul 29, 2026** · his words: *"news articles open."* Closed. | — | — | ✅ closed |
| FB-11 | Correlation section | 1 | **SUPERSEDED — he wants it CUT, not explained.** Jul 30: *"I think both correlation and earning is kind of unnecessary for the mission control."* The row asked whether the sentence reads; his answer is that the section does not earn its place | folded into FB-28 (Mission Control content rework). Do not spend more effort making correlation legible until the content question is settled | **§12b** | resolved by the FB-28 rework |
| FB-12 | DRAFT rig | **3** | **NOT RESOLVED, but owner-deprioritised.** Jul 30: *"Draft rig is too small and too confusing. You can leave it as is for now since many other things need to be fixed before this."* | too small and too confusing — a sizing and comprehension problem, not the three gaps we fixed. Needs a real design pass when it comes back up | **parked by owner** | he opens it, understands it, confirms |
| FB-13 | Full analysis of an individual stock — the Chart Room | **3** | **RE-REPORTED, with visible frustration.** Jul 30: *"There is still no full analysis of individual stocks like what was made in that html file that fable made. i have talked about this multiple times."* Plus the door: *"when i click on the orbit ellipse it should take me to the full analysis of the individual stock."* | Round 6 §1 + the mock he keeps naming. **`UNIVERSE_STOCK_LAB_2.html` is still not in the repo** | **§12b, first item** | FULL ANALYSIS and the orbit ellipse both land in the Chart Room; he uses it and says so |
| FB-14 | Text glow — *"just a tad less bright"*, text only, never signal colours | 1 | **CONFIRMED — Jul 29, 2026** · his words: *"glow is fine."* Closed. Blooms cut: world title 22px/0.38→10px/0.22, orientation 24px/0.32→10px/0.20, hover flare 12px/0.7→8px/0.45; signal colours untouched | §12 owner addition (`a7f85ac`) | — | ✅ closed |
| FB-15 | *"Play around with the thin rectangular boxes being there and not being there"* | 1 | **scheduled** | one experiment with FB-08 variant B | **§12a (captures)** | he picks |
| FB-16 | XLK — *"replicating this solar system pattern… get the ball rolling sooner than later"* | 1 | **scheduled** | ledger v1 §7 sequence; `systems/README.md` done | **§13′** | hollow-core XLK system visitable behind a labelled door |
| FB-17 | Planet panel width | **5** | **PICKED 600, WITH A CONTRADICTION TO RESOLVE.** Jul 30: *"600 but when I open up npm run build && npm run start the panel looks too small as it is now."* He chose 600 from the capture strip, then found the live panel too small. **The capture and the running app disagree** — that gap is the finding, not the number | ship 600 as the default, then reproduce his live view and find why it reads smaller than its own capture (viewport width, devicePixelRatio, or the strip being captured at a different zoom) | **§12b** | he sees the live panel at his own window size and says it is right |
| FB-18 | Trade-entry form (the one unfold-ed piece) | — | **needs-owner** — plain vs retrofuturist; recommendation: plain | ledger v1 §4 | **§17′** | he answers, then it ships |
| LT-01 | Long-task gate breached 55–65ms; Jul 29 owner run after staged shader warmup still 58/64/60/58/57ms | — | **landed · needs-capture** — the retained owner profile disproved shader acquisition as the dominant cause (largest frame 4.5ms; program 2.9ms; GC 3.4ms inside diffuse construction) | **§11.R4:** scene construction yields by family and every two planets; star/trail/ring buffers are preallocated to cut transient GC pressure. Existing staged warmup retained, not extended | **§11.R4** | committed five-context production run with every maximum < 50ms |
| D1 | Green trail on a down week — unreproduced | 1 | **held** | do not change colour logic until a contradicting ticker is named; then severe | — | named ticker or retired |
| D2 | *"The website is still relatively confusing"* | 1 | **open · general** | R5/R6 legibility work is the response | tracked via FB-05/-08/-09/-11 | subsumed rows close |
| D3 | Reddit for `/research` | 1 | **needs-owner** | reddit-fetch is a local tool, not a server data source — which problem is it solving? | parked | he clarifies or retires |
| FB-21 | Mission Control does not use its available space — *"the mission control in general is not using all the space that it can use"* | 1 | **designed · numbers fixed by owner** | Content width `min(1120px, calc(100% - 2rem))` → **`min(1400px, 96vw)`** in `orrery.module.css:2873`, plus breathing room. Pairs with FB-05: small type inside an under-filled frame is one problem seen twice. **Captured before/after.** | **§12a Phase C** | he says Mission Control uses its space |
| FB-22 | Random yellow semi-circle haze above the sun. *"random yellow semi circle haze thing above the sun"* | 1 | **open · defect** | a rendering artefact he can see; find it before designing anything around it | **§12b** | it is gone from a capture |
| FB-23 | PORTFOLIO TODAY % floats loose in the orbits. *"the portfolio today percentage is just in the middle of the orbits. It either needs to be directly on the sun or look like it is directly above the sun."* | 1 | **open** | anchor the sun chip to the sun body, not to the frame | **§12b** | he sees it attached to the sun |
| FB-24 | Moons do nothing when clicked. *"the moons do nothing when i click on them. I thought they were supposed to give some information. you have to figure that out for yourself."* | 1 | **open** | moons were specified as news; either wire them to the headline they carry, or remove them. He has explicitly left the choice to us | **§12b** | clicking a moon does something he understands |
| FB-25 | Planet panel needs more content. *"The planet terminals that open up when you click on a planet do not have enough information. They need more to look at."* | 1 | **open** | pairs with FB-17 — he wants the panel both wider AND fuller. Simple information, per his earlier instruction | **§12b** | he opens a planet and finds enough there |
| FB-26 | **MAJOR — trails and direction must encode DAILY, not weekly**. *"MAJOR CHANGE: rather than the trails and direction of the planet representing weekly stock trend. i want it to represent daily stock trend."* | 1 | **open · high** | a change to the core encoding. Trail hue-lightness, arc, and orbital direction all currently read weekly return. Every verifier that samples them (TST-03, VIS-04) keys off the same field and must move with it | **§12b, early** | trails and direction read daily and he confirms |
| FB-27 | HOLDINGS shows only the 8 planet tickers. *"I want to see all of my holdings in my holdings section not just the 8 ones that make up planets."* Also: *"this font is way too small and the numbers are way too spread out."* | 1 | **open** | the planet cast is a subset by design; HOLDINGS is a table and should list the whole book. Tighten the number columns while there | **§12b** | he sees every holding he owns |
| FB-28 | **Mission Control content is the real problem — bring the old dashboard's substance back**. *"The OG dashboard… was much better content wise… I liked seeing the graph with my portfolios performance against xlk, voo, and VTI… I could toggle which benchmarks… the graph with all the individual stock performance… toggle what stocks I wanted to see… It seems like this mission control itself content wise keeps getting worse and worse."* And: *"clicking 'open trade desk' brings me to the old dashboard… I would like for those to be back and be what the mission control is made up of."* | 1 | **open · CRITICAL · Fable trigger fired** | he named the two graphs he misses by name: portfolio vs XLK/VOO/VTI with benchmark toggles, and per-stock performance with stock toggles. This is a content architecture question, not a styling one — see FB-34 | **§12b, with Fable** | Mission Control carries the substance he misses and he says so |
| FB-29 | NEWS should not be a main component. *"The news is a cool section but it does not need to be a main component of the mission control."* | 1 | **open** | demote, do not delete — FB-10 confirmed the links work. Folded into FB-28's rework | **§12b** | resolved by the FB-28 rework |
| FB-30 | TRADES and "BOOK impact" are unexplained. *"I dont really know what the Trades thing is at the very bottom or what BOOK impact means."* | 1 | **open** | his own trade log, and a jargon term nobody defined for him. Either name it in plain words or cut it — the same judgement that killed PLOT/MANIFEST/SCOPE | **§12b** | he reads it and knows what it is |
| FB-31 | Orange tabs unnecessary. *"The tabs in orange are not necessary and can be removed."* | 1 | **open** | remove | **§12b** | gone from a capture |
| FB-32 | Top-right information is too small or unnecessary. *"All the information on the top right is either too small to read or unnecessary."* | 1 | **open** | pairs with FB-05; decide per item whether it earns its place before enlarging it | **§12b** | he can read what remains, and what remains earns its place |
| FB-33 | Correlation and Earnings do not earn their place in Mission Control. *"I think both correlation and earning is kind of unnecessary for the mission control."* | 1 | **open** | folded into FB-28. Note EARNINGS was one of the original seven product requirements — confirm he means demote rather than delete before cutting it | **§12b** | resolved by the FB-28 rework, with EARNINGS explicitly confirmed |
| FB-34 | **Fable content audit against real portfolio managers and stock screeners**. *"The design of the universe itself is coming together. But now the content is the issue. A lot of information is missing and a lot of the information that is there is not necessary. Now I am not smart enough to figure what is missing and what is unnecessary on my own but I want fable to compare this website to what already exists for portfolio managers and stock screeners."* | 1 | **open · owner-requested Fable consult** | he has asked for this directly, which is trigger 4 (a genuinely new surface needs design) and trigger 1 (the same complaint twice after landed). Do not start FB-28's rework before this lands | **blocks FB-28** | Fable returns a content architecture and he approves it |
| FB-19 | `? SYSTEMS MANUAL` button overlaps the planet panel and truncates its header line (`SPIN = SCENERY · ORBIT = WEE…`) | 0 — found by capture, not by him | **CONFIRMED — Jul 30, 2026 (capture).** Closed on capture per its own closes-when, not on his sentence — no taste judgment involved. `systems-manual-1440x900.png` + `raw-fb19-geometry.json`: bounding boxes non-intersecting, header line untruncated. Independently re-verified by Claude Lead at §12a review. | none needed; z-order/layout collision | §12a | ✅ closed — the header line reads whole on a capture |
| FB-20 | Orphaned labels — `CBRS` and `COST` render at the frame edge with no attached body at approach scale | 0 — found by capture | **CONFIRMED — Jul 30, 2026 (capture).** Closed on capture per its own closes-when. `label-culling-1440x900.png` + `raw-fb20-label-body-pairs.json`: `orphaned: []` across all 3 sampled transitions. Independently recomputed by Claude Lead at §12a review, not just trusted from the implementer's summary. | none needed; label culling on approach | §12a | ✅ closed — no label without its body on a capture |

**Board, July 30 2026 — after the §12a sitting.**

**Closed on his words (9):** FB-03 trails · FB-06 rocket cursor · FB-07 planet
position · FB-08 tab strip *"B is fine"* · FB-09 exit *"Exit issues seem
resolved"* · FB-10 news links · FB-14 glow · plus FB-19 and FB-20 closed on
capture alone. FB-04 retired by his decision.

**His verdict on the universe itself:** *"The design of the universe is coming
together."* Spacing proportions confirmed, one small nudge left.

**His verdict on Mission Control:** *"content wise keeps getting worse and
worse."* That is the headline of this round and it outranks everything else
open.

**Thirteen new rows, FB-22 to FB-34.** Two matter more than the rest:

- **FB-26 is a core encoding change.** Trails and orbital direction must read
  **daily**, not weekly. Every verifier that samples them keys off the same
  field and moves with it.
- **FB-34 is an owner-requested Fable consult, and it blocks FB-28.** He asked
  for it in as many words, and he was precise about why: *"I am not smart
  enough to figure what is missing and what is unnecessary on my own."* He is
  not asking for taste. He is asking for a content architecture measured
  against real portfolio managers and stock screeners.

**The pattern worth naming.** Every visual row is closing. Every content row is
opening. The universe is landing and Mission Control is thinning — he can see
that clearly even where he cannot name the fix, and he named the two graphs he
misses exactly: portfolio versus XLK/VOO/VTI with benchmark toggles, and
per-stock performance with stock toggles. Both existed in the pre-universe
dashboard. **Nothing in FB-28 should be designed before FB-34 returns.**

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
