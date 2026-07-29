# Fable — full project audit and a plan that stops the circles

You have designed six rounds for this project. Rounds 1–6 were adopted, most
of them built. The owner's verdict on round 6 was *"Fable did an incredible
job… truly everything I want out of this project."*

This brief is different. **We are not asking you to design anything new.** We
are asking you to audit what has actually happened and tell us how to proceed,
because the owner's assessment today is:

> *"I have given you so much feedback and you have come up with so many ideas
> and now it feels like they are not being implemented during these relays…
> I feel like we are just running in circles."*

He is right. Your job is to figure out why and fix the way this project runs.

---

## 1. What the product is

A web-based investment portfolio tracker that became a creative product. The
owner's own framing:

> *"We started this project with simple plans for it just being an Excel
> wrapper… Now we have created something else. We have created an actual
> creative product that is much more than just financial data. Still the
> foundation of this project is the financial data and the purpose of it is to
> be able to see complex data in a simple and understandable way without having
> to spend too much time analyzing all the numbers on the website."*

**The Stock Market Universe.** Solar systems are portfolios. The sun is the
whole portfolio. Planets are holdings, sized by weight. Trails encode return.
Moons are news. Satellites are portfolio statistics. Next.js + TypeScript +
raw three.js. Desktop-first by owner decision. A public read-only `/share`
view with zero dollar amounts.

His standing bar for any detail view: **everything you need to know in ten
seconds or less.**

---

## 2. The problem you are auditing

Eleven sections have been accepted. The app works. The owner looks at it and
cannot see progress. Three distinct failures produced that, and you should
assume all three are still active:

### 2.1 Feedback that was never written where it would be read

"The planets are too close together" has been raised **repeatedly**, in his
words *"like I mentioned so many times before."* It appears in
`UNIVERSE_ROUND4_BRIEF.md` as a design note — his exact words were *"either
make the sun bigger and everything more spaced out, or make the planets
smaller"* — but it was **never entered in `OWNER_FEEDBACK_LEDGER.md`**, which
is the file every build turn actually reads. So no build turn was ever told to
fix it. It has therefore never been fixed, and he has had to say it again
every round.

### 2.2 Feedback that was recorded and skipped anyway

*"The background is still meh"* **is** in the ledger, complete with his
reference — he wants a *"futuristic portrayal of retro futurism"* and names the
Loki TVA / Miss Minutes register. It has survived two sections untouched.

### 2.3 Verification that never looked at the screen

This is the deepest one. The build process grades each section against a
criteria ledger. For visual criteria, agents recorded **41 criteria in one
section alone** as "deferred — no browser available," then the section was
accepted anyway. The verification scripts confirmed things like *"eight planets
exist in the DOM"* — which was true — while nobody ever confirmed what the
screen looked like.

Consequence: **his eyes have been the only visual review this project has
ever had.** Every defect he reports is a defect the process was structurally
incapable of catching. That is why he keeps reporting the same ones.

---

## 3. Everything he has asked for, consolidated

Grouped by whether it landed. Assume anything unfixed is still wanted.

### Fixed and shipped
Plain section names (ORBITS, HOLDINGS, RETURNS, RISK, CORRELATION, NEWS,
TRADES). Trail magnitude in hue lightness, dark red worst → neon green best.
Axial spin de-encoded — it meant day-return and was unreadable, now decorative.
Rocket cursor replaced lock-on. Mission Control content splits by viewer
identity. Root `/` and `/share` share one implementation. The DRAFT rig is
built and reachable behind a `DRAFT · 🚀` button.

### Reported repeatedly, still not fixed
1. **Planets too close together / composition doesn't use the frame.** Many
   times. Never entered in the ledger. See 2.1.
2. **The background is boring.** Retro-futurism, Loki TVA register. Reference
   images are in `docs/reference/`.
3. **Trails are too long.** *"Too long and cheap looking now… they don't even
   seem like they fit the vibe of the project anymore, they were a lot better
   before."* Arcs were lengthened from 18–30° to 36–64° to give the lightness
   ramp room; that traded away the look.
4. **No company logos are visible on any planet.** Five reports. Textures were
   regenerated four times without fixing it. A likely explanation that has
   never been tested: at overview scale planets render 44–64px, so a brand mark
   is a handful of pixels — a *scale* problem, not a texture problem.
5. **Small fonts are unreadable.** *"The small fonts need to be a good bit
   larger so that you can even see what they have to say at all."* Large fonts
   slightly smaller, small fonts much larger.
6. **Rocket cursor has no sense of flight.** Three requests. No momentum,
   drift, or inertia.
7. **The planet sits too far right** — for ASML especially, with dead space on
   the left.
8. **The top tab strip looks wrong.** He is undecided, not prescriptive:
   *"I would rather there be nothing than that super small font that you can
   hardly see that is just taking up space."* Wants variants tested — no
   divider line, or a fully black strip that recedes.
9. **The exit terminal shows too much.** *"A cool feature but it displays too
   much information, in a way that is too hard to read or too big. There is no
   happy medium."*
10. **News headlines must hyperlink to the real article**, or the section
    should be cut. *"If you cannot hyperlink to the actual article then it
    defeats the purpose."*
11. **The correlation view is not understood.** He likes how it looks and
    cannot read what it means. He needs plain language about what correlation
    tells him about *his own* portfolio — not a better chart.
12. **The DRAFT rig doesn't match your design**, is hard to find, planets in it
    move too fast, and how to use it is unclear.

### Designed by you, adopted, not yet built
**Round 6 in full** — the Chart Room, the five-token type ramp, the cursor
flight model, the sky, the exit receipt, the tab-strip variants. Plus two
owner additions: reduce the glow on text (*"take out the heavy glowy AI
looking fonts… don't make it too much duller, just a tad less bright"* — text
only, never signal colours), and test the thin 1px rectangular outlines
present vs absent.

**A stock technical dashboard** — a new surface, his most recent large ask:

> *"When you click on a stock in the holdings section of Mission Control… it
> should pull up a technical dashboard of the stock like the application used
> to do in previous iterations. It should show you the full scale graph with
> information that you may not even see in planetary holdings… a much greater
> detailed look at the stock. Whether it is through graphs of certain unique
> kinds of mathematical modeling, I am aspiring to pursue that vibe."*

This is the opposite end from the planet panel: the panel is the ten-second
read, this is where depth is the point.

**Additional solar systems**, starting with the ETF **XLK**. Long-term, but he
wants the ball rolling. Note: unowned systems cannot compute time-weighted
return, so they render with hollow-core suns.

### Cut or settled — do not reopen
No thesis/journal. No multi-user accounts. No intraday tracking. No brokerage
integration. Desktop-first; phones keep the existing 2D fallback. Real brand
logos are allowed. The sector map was cut pending the multi-system decision.

---

## 4. Constraints that are not negotiable

- **`/share` is public: zero dollar amounts, zero owner-only fields, ever.**
- Market-relative figures derive from time-weighted return, never simple return.
- Every number carries its window — `+5.2%` with no period is a defect.
  Vocabulary: TODAY / WEEK / 30D / SINCE BUY / SINCE START.
- Never show a zero as if it were real. Unavailable is not zero.
- Every visual channel encodes one real number. Nothing decorative that means
  nothing.
- **The Fraunhofer rule, your own invention, still governs:** decorative light
  draws the full spectrum minus two stolen bands — green 125°–165° and red
  345°–20° above chroma 0.30 — which belong to gain and loss alone.
- A route long-task budget of 50ms. It has been breached at 55–65ms for five
  rounds; the cause is three.js shader-program acquisition.

---

## 5. What we are asking you for

Not a new design round. A **plan**. Specifically:

1. **An audit.** Read the corpus below and tell us what is actually wrong.
   Separate *the design is wrong* from *the design is right and the build
   didn't land it* — we cannot currently tell these apart, and that confusion
   is most of the problem.

2. **A fix for the circles.** The owner's feedback gets lost, deprioritised, or
   silently dropped between rounds. Design the mechanism that stops it. Be
   concrete about where feedback lives, what forces a build turn to address it,
   and what happens when it can't.

3. **A sequenced plan.** What to do next, in order, with the recurring items in
   §3 given real positions rather than being perpetually deferred behind new
   work. Say plainly what to cut. The owner would rather have fewer things that
   land than more things that half-land.

4. **A visual-truth standard.** Given that nobody has been looking at the
   screen, tell us what evidence should be required before any visual thing is
   called done.

Where a recurring item needs a design answer to be fixable — spacing and the
background especially — give that answer. Otherwise stay out of design.

---

## 6. The corpus

In the project folder:

| File | What it is |
|---|---|
| `UNIVERSE_DIRECTION.md` | The original owner brief |
| `UNIVERSE_IDEAS.md` → `_6.md` | Your six rounds, 1 → 6, newest last |
| `UNIVERSE_ROUND4_BRIEF.md` | Round 4 brief — holds the spacing complaint |
| `DRAFT_BAY_BRIEF.md` | The DRAFT rig brief |
| `UNIVERSE_STOCK_LAB.html`, `_3.html` | Round 6 Chart Room mocks |
| `UNIVERSE_DRAFT_RIG.html` | The DRAFT rig mock |
| `UNIVERSE_LEGIBILITY_MOCK.html` | The legibility mock |
| `UNIVERSE_PALETTE_3.html` | The Fraunhofer palette |
| `OWNER_FEEDBACK_LEDGER.md` | The owner-decision record — **incomplete, see 2.1** |
| `PHASE10.md` | The build roadmap, §0–§18 |
| `docs/reference/` | Visual references, including the retro-futurism deck |

Authority order for design documents: round 6 is newest and wins, then 5, 4,
3, 2, 1. Where the ledger contradicts an older document, the ledger is newer.

---

## 7. One thing to know about the owner

He does the visual review himself and he is good at it. Across five sections
his eyes caught more real defects than the entire criteria apparatus did. He
does not want to be told a thing is done when it is not, and he can tell.

He also said, of your round 6: *"full throttle ahead."* He wants to move. What
he cannot tolerate is moving in a circle.
