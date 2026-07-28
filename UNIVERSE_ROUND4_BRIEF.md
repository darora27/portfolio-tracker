# Round 4 brief — legibility

The owner ran the §10 build. The verdict is mixed in an important way: **the
scene is working, the interfaces are not.** Attach the five screenshots
supplied with this brief.

Companion to `UNIVERSE_IDEAS_3.md` (adopted) and `UNIVERSE_IDEAS_4.md` (the
DRAFT rig, accepted). This round is about everything a user has to *read*.

---

## 1. The sentence that should govern this round

The owner, closing his feedback:

> *"We started this project with simple plans for it just being an Excel
> wrapper… Now we have created something else. We have created an actual
> creative product that is much more than just financial data. Still the
> foundation of this project is the financial data and the purpose of it is to
> be able to see complex data in a simple and understandable way without having
> to spend too much time analyzing all the numbers on the website."*

That is the product thesis, and the current interfaces violate it. The scene has
become beautiful; the panels have become dense. Round 4's job is to make the
numbers legible without making the world boring.

His own bar for the planet panel: **"I should be able to get everything I need
to know about the stock in 10 seconds or less."**

---

## 2. The one that reverses your own decision

> *"All these terms like manifest, scope, log — please just use the correct
> terminology that the sections actually represent."*

Round 2 named the bays MANIFEST, SCOPE, HAZARD, SIGNALS, COMMS, LOG, and the
planet panel ID / SCOPE / TELEMETRY / TRANSMISSIONS / EGRESS. It was a coherent
retrofuturist decision and the owner is rejecting it.

**Take this seriously rather than defending it.** The naming was atmosphere
bought with comprehension, and he is telling you the price was too high. A user
who has to translate "SCOPE" into "performance chart" before reading it has
spent some of the ten seconds he does not have.

The question for you is not whether to comply — comply — but **how to keep the
room in character while its labels say what they mean.** Retrofuturist
interfaces did have plain labels; a 1960s console said ALTITUDE, not ALTIMETRIC
TELEMETRY. Precision *is* the period voice. Propose the actual replacement
names.

---

## 3. Confirmed defects, verified in the screenshots

**The planet panel covers the planet.**

> *"When you click on a planet you can no longer see the planet. Isn't that so
> stupid."*

He is right — in the IBM capture the panel occupies the right half and IBM is
entirely behind it. Round 2 specified "planet left, information right." What
shipped is "information over everything." The planet must remain visible while
its panel is open; that was the entire point of travelling to it.

**Numbers with no period.**

> *"What does +5.2% mean. Is that for the day, the week, the year?"*

The panel's hero number is a bare `▲ +5.2%` with no label, while TELEMETRY below
shows `WEEK +8.1%`. Two different numbers, one unlabelled. Every figure in this
product needs its window attached. He raises the same complaint about a `-0.7`
in Mission Control that he still cannot interpret.

**The chart is decorative.**

> *"I like how you can toggle between the 7 day and 30 day but it means nothing
> because it is so hard to see and hard to read what the data is actually
> saying."*

The scope trace is roughly 40px tall with no axis, no scale, and no endpoint
values. A toggle whose two states are equally unreadable is not a feature.

**Two ellipses per planet in the Mission Control radar.**

> *"Why in the world are there like two orbiting patterns for each planet.
> There should only be one ellipse."*

Treat as a rendering defect.

**The sector map is still incomprehensible — third report.**

> *"Whenever I zoom out it gives me this and I have no clue what this is or
> what it does. It is very difficult to get back to my solar system once I get
> here."*

Reported after §8, after §9, and again now. Whatever explanation exists is not
working, and the exit is not findable. This needs a different answer, not a
better label.

---

## 4. The scene — close, and specifically wrong

The owner is positive here, which is new: *"the planets have seemed to start to
look how I wanted them to."* Textures are working. Three specific asks:

**Show the full orbital circle for every holding** — *"without the screen
looking too busy."* In the capture, only comet trails are visible; the rings
have receded to nearly nothing. He wants to see the paths. Reconcile that with
your own round-3 position that eight uniform ellipses read as graph paper — the
ring falloff was designed to solve exactly this tension and may simply be tuned
too far.

**The sun is still not dominant.** In the capture it is comparable to GOOG and
ASML rather than obviously the largest body. Round 3 set `sunRadius = max(2.4,
1.25 × largest planet radius)`; either it did not land or 1.25× is too timid.

**Spacing.** *"Either make the sun bigger and everything more spaced out, or
make the planets smaller."* Note the capture shows planets clustered centre-left
with a large empty region bottom-right — the composition is not using its frame
evenly. Also: the COST label collides with the sun's own readout.

---

## 5. Mission Control — the hardest problem

> *"It caught my eye since it looks cool. Then I started looking at it more and
> I realized most of it was garbage… this just looks crowded and awful. It is
> hard to read what the data actually means when you put all the numbers and
> graphs on the right side of the screen."*

> *"There are still remnants of our old design that looks like pure artificial
> intelligence."*

He is explicit that the *data* is right — *"I like the data that you see in this
section, I think it is all good"* — and that the *arrangement* fails.

**His structural proposal, which is the most actionable thing in the feedback:**

> *"Somehow we need to make the mission control more vast so we can fit in all
> the information that we want to fit in. There should be an ability to scroll
> down on the entire page that encompasses the mission control. The 2D orbiting
> thing that is on the left side of the screen does not have to be frozen there
> on the screen — I should be able to scroll down and not see it anymore."*

This is a real diagnosis. Round 3 solved density by making one bay dominant and
compressing the rest into a fixed viewport. He is proposing the opposite: **let
it be a long room you move through** rather than a wall you cram.

That releases the constraint that has been strangling every readout — but it
costs the "one screen, everything at a glance" property. Take a position on
whether that property was ever real, given he has never once been able to read
it at a glance.

---

## 6. Questions

1. **The names.** What does each bay and each panel section actually get
   called, in plain language that still sounds like this room?
2. **The planet panel, rebuilt.** Everything about a stock in ten seconds, with
   the planet still visible. What is on it, how big, in what order? What gets
   cut?
3. **Every number's window.** How is the period attached to a figure without
   spending words — a suffix, a column header, a shared time control governing
   the whole panel?
4. **The chart that earns its toggle.** What makes a 7-day versus 30-day view
   genuinely readable at panel scale? Axis, scale, endpoints, hover?
5. **Mission Control as a scrolling room.** If it becomes vertical, what is the
   order of descent? What does the radar do when you scroll past it? Does
   anything stay pinned?
6. **The sector map.** Third failure. What is it, what is it for, and how do you
   leave? If it cannot be made obvious, propose cutting it until the galaxy
   phase actually needs it.
7. **Rings and spacing.** Full orbital circles visible without graph paper; the
   sun genuinely dominant; the frame used evenly.

---

## 7. Unchanged constraints

The Fraunhofer rule, the two-tier firewall, signal ramps and their sampler
assertions, desktop-first, `/share` public with zero dollar amounts, computed
WCAG contrast from source tokens, no encoding living only in colour or motion,
the 50 ms route-owned long task, and every visual channel encoding one real
number.

**One live warning:** the long-task gate is currently *breached* at 56–62 ms
across ten fresh contexts, where §9 measured zero. Remediation is in flight.
Anything you propose that adds main-thread work at load arrives into a budget
that is already over.

---

## 8. What good looks like

Round 3 was your best work because it computed rather than asserted, and
overrode the owner where it had a reason. Do that again — but note that this
round's central item is one where **he is right and a previous decision of yours
was wrong.** Comply on the naming, and spend your independence on the harder
questions: the scrolling room, the ten-second panel, and the sector map.

The scene is nearly there. The reading is not. Fix the reading.
