# Fable — round 7 brief

**From Devan, July 31 2026, via Opus.** This is the sixth round of written
feedback on this project. Read the whole brief before doing anything.

---

## 0. What you are being asked to do

Four stages, in order, with a **hard stop** after stage 2. Do not run them
together. Do not skip ahead to design because the fix seems obvious.

**Stage 1 — Intake and grouping.**
Take every item in §3 below. Group items that are *the same underlying
problem wearing different clothes*. Devan asked for this explicitly: "find
the changes and ones that fable thinks are similar." Nine separate complaints
about small text may be one type-ramp problem; they may also be three
different problems that only look alike. Say which, and say why. Where your
grouping is a judgement call rather than an obvious merge, mark it as such.

**Stage 2 — Locate and screenshot. THEN STOP.**
For each group, find the exact region of the running application it refers to
and capture it. Then **stop and show Devan the screenshots for confirmation
before designing anything.** This checkpoint is the point of the exercise —
it exists because this project has repeatedly designed fixes for regions that
turned out not to be the region he meant. Present them as: *"here is the area
I believe item N refers to — confirm or correct me."*

Do not proceed to stage 3 until he answers.

**Stage 3 — Design.**
Only after his confirmation. For each confirmed area, design how it will be
improved. Concrete and specific: layout, hierarchy, type sizes, colour roles,
what is added, what is removed, what replaces what. Where a change is a taste
call rather than a correctness call, present options rather than picking for
him — but recommend one.

**Stage 4 — Implementation instructions.**
Write instructions precise enough for Opus 5 Max to implement without
re-deriving your reasoning. Name real files and components. State what
"done" looks like in a way that can be checked. Assume the implementer is
competent but has not seen your thinking — every inference you leave implicit
is one they will get wrong.

### How to get screenshots

The app runs locally. Nothing is deployed — the Vercel project was deleted on
July 31 at Devan's direction, so **do not reference a live URL**.

```
cd ~/Desktop/portfolio-tracker && npm run dev
# owner view:  http://localhost:3000        (password = OWNER_PASSWORD in .env.local)
# public view: http://localhost:3000/share  (no password, percentages only)
```

There is also a capture harness: `npm run phase10:capture -- --section N`,
and a camera daemon documented in `AGENTS.md` §8.4.

**If you do not have shell or browser access where you are running:** do not
guess and do not describe from memory. Produce a precise shot list — route,
viewport, what to click first, what region to frame — and hand it to Opus,
who will execute it and return the images to you. Then continue at stage 2.

---

## 1. The one thing to understand before you read the feedback

Devan's closing sentence today:

> *"When I look back on the previous iterations of this project before we
> incorporated the solar system and retrofuturistic AI I think I liked it
> better. I like the looks of this website a lot better but everything is just
> garbage now and it feels like you have no clue what direction I want this
> project to actually go in."*

Two distinct claims, and separating them is the most valuable thing you can do
in this round:

1. **The look is better now.** He is not asking to undo the universe.
2. **The content and legibility got worse.** He believes the older, plainer
   dashboard *told him more* and was *easier to read*.

He made the same point a round earlier, on July 30:

> *"The OG dashboard that we made before this project turned into a solar
> system was much better content wise then what is here right now."*

So this is now **two reports of the same structural complaint**, and it is the
deepest item in the brief. `MISSION_CONTROL_ARCHITECTURE.md` was written to
address exactly this and has not landed — it may have been the wrong answer, it
may be the right answer badly executed, or it may simply not have shipped yet.
**Determine which.** That determination is worth more than any individual fix
below.

---

## 2. The screenshots he attached

Nine images, extracted in document order. Opus has them; ask if you need them
re-sent. The mapping from image to complaint is exact:

| # | Label | His attached comment |
|---|---|---|
| 1–4 | **Old UI** — benchmark chart w/ tooltip; composition donut, 13 positions; holdings table, 13 rows × 11 columns; holdings-performance chart w/ per-stock toggles | *"These are screenshots from previous iterations of the project. I like how the information is displayed much more in this then compared to what you have made so far."* |
| 5 | **Current RETURNS section** | *"To some degree I like the style of this but I hate the functionality of it. It is hard to read and it's hard to interpret. You need to change it back to what it was before because it was much easier to understand back then"* |
| 6 | **Current ORBITS radar** | *"I want the orbits to all be different colors. I also want the circles on them to spin based on their daily trend or last recorded daily trend but they can move very very slow. Also ASML is covered up."* |
| 7 | **Current HOLDINGS table** | *"You can hardly read any of this stuff"* |
| 8 | **Current NEWS footer strip** | *"There is no where near enough news. I want the major headlines and daily reports. All of them. Biggest moves. All of that stuff but I want it in a different section"* |
| 9 | **Current top STRIP + tabs** | *"This stuff is garbage. I KEEP TELLING YOU THAT WE DO NOT NEED THOSE TABS AT THE TOP..."* |

### What images 1–4 appear to prove — test this, do not assume it

This is Opus's read, offered as a hypothesis for you to confirm or kill.

Every one of the four old screenshots shares traits the current build dropped:

- **Multi-colour series.** Each stock, each benchmark, each donut slice has its
  own hue. The current build is near-monochrome amber.
- **Toggle chips.** He can turn individual stocks and benchmarks on and off.
  He has praised this twice, by name.
- **Hover tooltips with exact values** at a date. The current charts have none.
- **Generous type and spacing**, with real axis labels and dates.
- **A plain-English subtitle** under each chart explaining what it measures.
- **All 13 holdings**, not the 8 that became planets.

The current build's charts have none of the first five. If that is the real
content of "hard to read and hard to interpret," it is one coherent fix across
several sections rather than a dozen separate ones.

**But there is a live tension you must resolve, not paper over:** the project's
Fraunhofer rule reserves green 125°–165° and red 345°–20° above chroma 0.30
for gain/loss encoding. Per-series colour and per-orbit colour (item 6) both
push into that space. The old UI was free of this constraint; the universe is
not. Decide explicitly how multi-colour series and the gain/loss reservation
coexist, and write that decision down. Do not quietly break the rule, and do
not quietly refuse him.

---

## 3. The feedback, verbatim — July 31

Numbered for reference. His words, unedited.

1. *"When the market is closed, I do not want the planets to just not orbit. I
   want them to display whatever trend correlated to how the market closed the
   prior day and then when the market opens, it automatically changes to the
   updated daily trend"*

2. *"I still don't see any satelites or anything else creative that would make
   the solar system look better"*

3. *"You removed the star grid background from before but now it looks too
   plane. Come up with something much more creative"*

4. *"When you click on a planet how the planet comes up and the size of the
   dashboard looks better but the planet dashboard needs much more information
   in a bigger font. I can hardly read what is on the dashboard and it all
   looks heavily designed by artificial intelligence it does not look unique"*

5. *"When you open up full analysis for the stock, it looks good initially but
   the graphs need to be better or easier on the eyes. Everything feels like it
   is either too small or too hard to read. Also you overcomplicated the graph
   with buttons that don't matter like depth and cost. I need the graph to be
   more clear. Also when I pull up the full analysis for the planet on the top
   of the screen I see tabs for overview, dashboard, history, trades, research
   displaying the old UI for the project which I do not like."*

6. *(images 1–4)* *"These are screenshots from previous iterations of the
   project. I like how the information is displayed much more in this then
   compared to what you have made so far."*

7. *(image 5)* *"To some degree I like the style of this but I hate the
   functionality of it. It is hard to read and it's hard to interpret. You need
   to change it back to what it was before because it was much easier to
   understand back then"*

8. *(image 6)* *"I want the orbits to all be different colors. I also want the
   circles on them to spin based on their daily trend or last recorded daily
   trend but they can move very very slow. Also ASML is covered up."*

9. *(image 7)* *"You can hardly read any of this stuff"*

10. *(image 8)* *"There is no where near enough news. I want the major
    headlines and daily reports. All of them. Biggest moves. All of that stuff
    but I want it in a different section"*

11. *(image 9)* *"This stuff is garbage. I KEEP TELLING YOU THAT WE DO NOT NEED
    THOSE TABS AT THE TOP. The only reason why tabs at the top would be useful
    was if we were switching to another page but all of those tabs are LOCATED
    ON THE SAME PAGE. I would be okay if the tabs took you to different pages
    maybe one showing history and one showing research."*

12. *"When I look back on the previous iterations... it feels like you have no
    clue what direction I want this project to actually go in."* (full quote §1)

---

## 4. Repeat counts — these carry more weight than the new items

The feedback ledger tracks every request with a report count. A repeat means
something we called fixed was not fixed, and by the project's own rules it
blocks the next section until root-caused.

| Item | Reports | Note |
|---|---|---|
| **Small fonts / can't read it** | **7** | Items 4, 5, 9 today are the 7th, and they now name three *different* surfaces: planet terminal, full analysis, holdings table. A ramp change has been shipped twice and he still cannot read it. Treat "the ramp is correct" as disproven. |
| **The tabs at the top** | **3** | Today in capital letters, with the reason: they don't navigate anywhere. |
| **Per-stock full analysis** | **5** | `UNIVERSE_STOCK_LAB.html` is in the repo root and is the reference he keeps pointing at. It has now partly shipped (item 5 says "looks good initially"), so this is progress — but read what he says about the graphs. |
| **The old dashboard had better content** | **2** | See §1. The deepest item. |
| **Background is boring** | **5** | Item 3 today. A previous change *removed* a star grid he liked; the replacement reads as flatter than what it replaced. Regression, not a miss. |
| **Trails/orbits should be DAILY not weekly** | **2** | Item 1 today, and a "MAJOR CHANGE" note on July 30. Not yet shipped. |
| **Satellites / creative objects** | **2** | Item 2. |

**Item 5's tab complaint and item 11 are the same underlying thing**: routes
that show "the old UI" (`/dashboard`, `/history`, `/trades`, `/research`) are
still reachable and still styled from a design system he has rejected. Two
independent complaints, one cause.

---

## 5. A possible real bug, flagged for your stage 2

In image 7, **every holding shows `TODAY ◆ 0.0%`** — all thirteen. Image 3
(old UI) shows `DAY $ $0.00` and `DAY % 0.00%` for all thirteen too.

`CLAUDE.md` states the rule directly: *"never show zeros as if they were
real."* If the market is closed or the quote fetch is empty, showing a
uniform 0.0% violates that rule and is almost certainly the same root cause as
his item 1 — *"when the market is closed I do not want the planets to just not
orbit."* One bug, surfacing as a visual complaint and a data complaint.

Confirm it in stage 2 rather than taking this on faith.

---

## 6. Constraints you must not break

These are owner decisions and project rules, not preferences:

- **Privacy.** `/share` is public: zero dollar amounts, zero owner-only fields,
  ever. Any new field on that route needs a privacy decision and a regression
  test.
- **The Fraunhofer rule.** Green 125°–165° and red 345°–20° above chroma 0.30
  are reserved for gain/loss. See §2 for the tension this creates with item 8.
- **Do not regenerate the planet textures, and do not touch the mark SVGs.**
  Five rounds were spent there; the row is retired by his decision. If planet
  identity is ever reopened it starts downstream at material, exposure and
  longitude.
- **Trail colour band is 18°–30°** and is confirmed by him. It is not
  negotiable to a verifier's convenience.
- **`MISSION_CONTROL_ARCHITECTURE.md` §10 — "no new parts."** Its rework was
  scoped to wiring existing components. If your design needs a genuinely new
  component, say so explicitly and justify it; don't smuggle it in.
- **Two open performance rows**, FB-36 and FB-37, are already root-caused and
  scheduled to §16. Do not re-diagnose them: FB-36 is `/share` being
  `force-dynamic` and blocking first byte on ~24 Finnhub calls (18.2 s
  measured, warm); FB-37 is 21.8 MB of planet textures, which is *not* what
  makes it slow. Your work should not make either worse.

## 7. Context on how this project runs

`OWNER_FEEDBACK_LEDGER.md` is the live record — 37 rows, 15 currently
open or designed. Rows close only on a quoted sentence from Devan or on
committed pixel evidence; an agent asserting something looks right closes
nothing. `PHASE10.md` holds the section roadmap; §14 is the Chart Room, §15
the Mission Control content rework, §16 now carries the performance work.

Prior Fable deliverables in the repo, for continuity and to avoid
re-deriving settled ground: `UNIVERSE_AUDIT.md`, `MISSION_CONTROL_ARCHITECTURE.md`,
`UNIVERSE_IDEAS_6.md` (Chart Room design), `UNIVERSE_STOCK_LAB.html` (the mock
he keeps citing).

## 8. What Opus got wrong recently, so you don't inherit it

Asked why the deployed app was slow, Opus looked at a 26 MB folder and filed
that as the cause without measuring. It was wrong — zero texture requests had
even been issued during the 17-second wait; the real cause was server-side.
The lesson generalises to this round: **a claim about what is on screen needs
a screenshot of the screen, not an inference from the code that draws it.**
That is why stage 2 exists and why it stops.

---

## 9. Deliverables

1. **Stage 1 output** — the grouped item list, with your reasoning for each
   grouping and a flag on the ones that are judgement calls.
2. **Stage 2 output** — the screenshots, one per group, presented for his
   confirmation. **Then stop.**
3. **Stage 3 output** — the design, after he answers.
4. **Stage 4 output** — implementation instructions for Opus 5 Max, naming real
   files, with a checkable definition of done for each change.

Devan reads these himself and is not a developer. Write stages 1–3 in plain
language. Stage 4 can be as technical as it needs to be.
