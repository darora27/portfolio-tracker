# Owner feedback ledger

The single durable record of what Devan has asked for, decided, and rejected.
Maintained because feedback given in conversation is lost when the conversation
ends — this file is where it survives.

**Every agent working a Phase 10 section should read this alongside the section
spec.** If an item here contradicts an older document, this file is newer.

Last updated: July 29, 2026.

---

## 1. Product thesis — the sentence that governs everything

> *"We started this project with simple plans for it just being an Excel
> wrapper… Now we have created something else. We have created an actual
> creative product that is much more than just financial data. Still the
> foundation of this project is the financial data and the purpose of it is to
> be able to see complex data in a simple and understandable way without having
> to spend too much time analyzing all the numbers on the website."*

Creative first, but legibility is the point. A beautiful surface that cannot be
read has failed. His working bar for any detail view: **everything you need to
know in ten seconds or less.**

---

## 2. Settled owner decisions

These are decided. Do not reopen without asking.

| Decision | Date | Detail |
|---|---|---|
| **Desktop-first** | Jul 27 | Phones keep the existing tested 2D fallback; no mobile 3D is built. |
| **Real brand logos allowed** | Jul 28 | Reversed the earlier no-logo rule — personal project, not commercial. |
| **Rocket cursor replaces lock-on** | Jul 27 | One selection mechanism; planets keep orbiting, the rocket travels. |
| **Axial spin de-encoded** | Jul 28 | Spin no longer means day return — unreadable. Decorative only; the freed channel stays banked. |
| **Mission Control by viewer identity** | Jul 27 | Owner sees full content when authenticated; public sees percentages only. |
| **`/` is the universe too** | Jul 27 | Root and `/share` share one implementation. |
| **Trail magnitude in hue lightness** | Jul 28 | Dark red worst → neon green best, with dark ends floored at 3:1 so they never vanish. |
| **Plain section names** | Jul 28 | ORBITS, HOLDINGS, RETURNS, RISK, CORRELATION, NEWS, TRADES — jargon rejected. |
| **Sector map cut** | Jul 28 | Three failed attempts to make it comprehensible; deferred until the galaxy phase earns it. |
| **Public trade log** | Jul 28 | Action, ticker, date, % impact only. Never shares, prices, or dollars. |
| **Public news** | Jul 28 | Headlines for held tickers may appear publicly. |
| **Remaining sections fold into Mission Control** | Jul 28 | See §4. |
| **Universe matters most** | Jul 28 | Trim the deeper routes to whatever is simplest that works. |

---

## 3. Open owner items — not yet built

### 3.0 From the July 29 §11 review — newest

**A new surface, not a fix: the stock technical dashboard.**

> *"When you click on a stock in the holdings section of mission control —
> which should [also] be something you can do when you click on the orbit 2D
> thing on the mission control holding orbital ellipse — it should pull up a
> technical dashboard of the stock like the application used to do in previous
> iterations. It should show you the full scale graph with information that you
> may not even see in planetary holdings… a much greater detailed look at the
> stock. Whether it is through graphs of certain unique kinds of mathematical
> modeling, I am aspiring to pursue that vibe for that section."*

This is the deep analytical layer the universe currently has nowhere to put.
Reachable two ways: a row in HOLDINGS, and a ring or blip on the ORBITS radar.
Distinct from the planet detail panel, which is the ten-second read — this is
the opposite end, where depth is the point. The pre-Phase-10 `/stock/[ticker]`
route is the reference for what existed before.

**Layout and type:**

- **The planet sits too far right.** For some holdings — ASML named — the
  planet renders middle to middle-right with large unused space on the left.
- **Large fonts slightly smaller; small fonts a good bit larger.** Owner:
  *"the small fonts need to be a good bit larger so that you can even see what
  they have to say at all."* Small text is currently unreadable, which is the
  same complaint as §10's, unresolved.
- **The top tab strip does not look right.** Owner is uncertain rather than
  decided: *"I would rather there be nothing than that super small font that
  you can hardly see that is just taking up space."* Ideas he wants tested —
  removing the dividing line, or making the strip fully black so it recedes.

**Carried, still unaddressed after multiple reports:**

- **Rocket cursor physics.** Third request. There is still no sense of flight —
  momentum, drift, or inertia — in the cursor.
- **No company logos are visible on any planet.** Fourth report. **Do not
  regenerate textures again before the marks are measurable.** §11's panel
  rebuild was supposed to make that possible; establish first whether the marks
  are present-but-unviewable or genuinely absent.

**The background and the exit terminal:**

- **The background is still "meh."** Owner wants a *"futuristic portrayal of
  retro futurism"* — he names the Loki TVA / Miss Minutes register as the
  target. Compare against `docs/reference/`, which already holds that deck.
- **The green terminal shown when exiting Mission Control** is *"a cool feature
  but it displays too much information, in a way that is too hard to read or
  too big. There is no happy medium."*

**Open, unfinished:** the owner began asking about building the other
portfolios — the additional solar systems — and the note ends mid-sentence
(*"By that what I mean is"*). Not yet specified. The sector map was cut in §10
pending exactly this conversation.

### 3.1 From the July 29 §10 acceptance review

- **The trails are too long.** Owner: *"Why are the trails so long? It seems
  like they are too long and cheap looking now… the trails don't even seem like
  they fit the vibe of the project anymore, they were a lot better before."*
  Round 3 lengthened arcs from 18–30° to 36–64° to give the lightness ramp room.
  Shorten them — by eye, somewhere between the two — and reconcile against the
  ramp, which may no longer need the extra length now that hue carries
  magnitude. §11.
- **No logos are visible on any planet.** At OVERVIEW planets render at roughly
  30–60 px, too small for a mark; up close the panel blocks the view. The carved
  marks may be entirely correct and simply unviewable. **Do not regenerate
  textures against this again before it is measurable** — four rounds already
  did, and each moved the score by less than the measurement noise. §11's panel
  rebuild is the first chance to find out.

### 3.2 From the July 28 legibility review

- **The planet panel is slightly too big.** Layout is right — planet on the
  left, panel on the right — but the panel should shrink somewhat.
- **News headlines must hyperlink to the actual article.** Owner: *"if you
  cannot hyperlink to the actual article then it defeats the purpose, as a lot
  of these news headlines have a lot of jargon and don't really provide much
  information."* A headline that cannot be opened is not worth its space —
  either link it or cut the section.
- **The correlation view is not understood.** He likes how it looks but cannot
  read what it means. Needs a plain-language explanation of what correlation
  tells him about his own portfolio, not a better chart.

### 3.3 Carried, unresolved

- **D1 — the green-trail report.** Owner saw a green trail on a holding down
  for the week. Never reproduced; source mapping is correct and every committed
  screenshot matches. **Do not change colour logic until he names a
  contradicting ticker.** If he names one, treat as severe.
- **D2 — "the website is still relatively confusing."** Recorded verbatim, too
  general to action alone. Round 4's legibility work is the response.
- **Reddit for `/research`.** Owner: *"I was wondering if you could try to
  learn how to use the reddit skill things that I installed the other day
  because it does not look like I am getting approved for the reddit API thing
  any time soon."* Note the `reddit-fetch` skill works through a browser
  session, not the API — but it is a **local research tool**, not a server-side
  data source. It cannot feed a deployed public page. Clarify which problem is
  being solved before building.

---

## 4. Approved plan for the remaining sections

Owner approved folding surfaces into Mission Control rather than keeping
separate pages, July 28. Sections were originally specified when `/share` was a
five-chapter Field Journal, which no longer exists.

| Originally | Becomes |
|---|---|
| `/compare` | The **DRAFT rig** — a hypothetical-portfolio workbench inside Mission Control (`UNIVERSE_IDEAS_4.md`) |
| after-hours spike | Unchanged, deprioritised |
| `/research` | The **NEWS** section + per-planet news moons |
| `/history` | The **aurora** (52 weekly stripes) + **RETURNS** — largely already built |
| `/trades` | The **TRADES** section + a plain owner-only entry form |
| integration | Unchanged, still terminal |

Only two things genuinely do not exist yet: the DRAFT rig, and a form for
entering a new trade. Everything else was absorbed by Mission Control.

**Open question the owner has not answered:** should trade entry look
retrofuturist, or is a plain form acceptable? Recommendation on file: plain,
because it is used rarely and correctness matters more than atmosphere.

---

## 5. Design documents, in authority order

1. `UNIVERSE_IDEAS_5.md` — legibility: plain naming, rebuilt planet panel,
   scrolling Mission Control, sector map cut. **Newest.**
2. `UNIVERSE_IDEAS_4.md` — the DRAFT rig.
3. `UNIVERSE_IDEAS_3.md` — colour and material: the Fraunhofer rule, relit
   worlds, carved marks, trail ramps, sun scale, star population.
4. `UNIVERSE_IDEAS_2.md` — round 2, superseded where 3 and 5 conflict.
5. `UNIVERSE_IDEAS.md` — round 1, largely built.
6. `UNIVERSE_DIRECTION.md` — the original owner brief.

Working prototypes: `UNIVERSE_LEGIBILITY_MOCK.html`,
`UNIVERSE_DRAFT_RIG.html`. Visual references: `docs/reference/`.

---

## 6. Standing rules the owner has enforced

- **Never show a zero as if it were real.** Unavailable is not zero.
- **Every number carries its window.** `+5.2%` with no period is a defect.
  Vocabulary: TODAY / WEEK / 30D / SINCE BUY / SINCE START.
- **No dollar amounts on public surfaces**, ever.
- **`expect(source).toContain(...)` is not coverage** for rendered behaviour.
  §9 shipped five such guards; one passed while the trails it protected were
  invisible.
- **Every visual channel encodes one real number.** Nothing decorative that
  means nothing.
- **Market-relative figures derive from TWR**, never simple return.

---

## 7. Long-term goal — additional solar systems

Recorded July 29, 2026.

> *"Replicating this solar system pattern for the ETF XLK on your own. I am not
> expecting you to be able to do this over the course of a day or even a week.
> This is just a long term goal and I want to get the ball rolling sooner than
> later."*

**First step is done:** `systems/README.md` records the file shape, why a
hand-maintained JSON beats the paid Finnhub ETF endpoint at this scale, and the
rule that unowned systems cannot compute TWR and therefore render with a
hollow-core sun.

**Remaining, in order of what de-risks most:**

1. `systems/xlk.json` — top holdings and weights, copied from the issuer.
2. A multi-system data model; the app currently assumes one portfolio.
3. Textures for unheld tickers — roughly four or five, since XLK overlaps the
   owner's book heavily.
4. Navigation between systems. The sector map was cut in §10 pending exactly
   this decision; it now has a reason to exist.

Not scheduled into a section yet. Deliberately kept out of §11.

---

## 8. Round 6 adopted in full — July 29, 2026

> *"Fable did an incredible job. We need to follow this in any way shape or
> form… what Fable did was truly everything I want out of this project. Full
> throttle ahead."*

`UNIVERSE_IDEAS_6.md` is adopted whole and scheduled as **§12**: the Chart
Room, the type ramp, the cursor flight model, the sky, the exit receipt, and
the tab-strip variants. `UNIVERSE_STOCK_LAB.html` is the owner-reviewed mock.

**Two owner additions, both §12:**

- **Reduce the glow on type.** *"Take out the heavy glowy AI looking fonts
  throughout the application… don't make it too much duller, just a tad less
  bright."* Text glow and bright text-shadow are a large part of what reads as
  machine-generated. Reduce on **text only** — never on signal colours, which
  carry meaning — and hold every contrast floor.
- **Test the thin rectangular boxes.** *"Play around with the thin rectangular
  boxes being there and not being there — that could have an aesthetic
  benefit."* The 1px outlines around chips, tabs, and small labels. Capture
  both states; this overlaps round 6's variant B and should be one experiment.
