# Stock Market Universe — round 2 creative brief

Prompt for a creative collaborator. Companion to `UNIVERSE_DIRECTION.md` (the
original brief) and `UNIVERSE_IDEAS.md` (the accepted round-1 response, whose
proposals are now built and shipping).

**Read this first:** the universe exists and works. Eight labelled planets orbit
a sun that encodes portfolio health, with comet trails, an asteroid belt, a
rocket cursor, and a Mission Control overlay. Round 1 answered *what to build*.
This round is about **why it doesn't yet feel good**, which is a different and
harder question.

Answer only the questions in §3. The engineering defects in §4 are listed so
you don't propose things that collide with fixes already underway — do not
solve them.

---

## 1. What changed since round 1

**Branding is now allowed.** Round 1 forbade logos and wordmarks because the
public URL was treated as resume-facing. The owner has since decided this is a
personal project, not monetised, not displayed at scale, and that planets
should carry real company identity. **Real logos, wordmarks, and brand colours
are permitted.**

**Desktop-only stands.** Phones keep an existing, tested 2D fallback. Design
for a 1440×900 desktop scene.

**Public-first stands.** The public view is the one that must be excellent.

**The financial math is correct and must stay correct.** Every visual channel
encodes one real computed number. No decorative object that means nothing.

---

## 2. The core problem to solve

The owner's verdict on the current state, in his words:

> *"The textures all suck… Make the texture actually something worthwhile, not
> just ambiguous garbage."*

> *"When you look at Mission Control, it is good information but it just needs
> to be displayed in another more creative way. It looks so generic and basic…
> How can I convey this better?"*

Both complaints are the same complaint: **the thing is correct but it has no
soul.** Round 1 solved structure. Round 2 has to solve craft.

---

## 3. Questions to answer

### 3.1 Planet textures — the hard technical constraint

The owner's reference images are **rendered globes**: a sphere in space, logo
on the visible face, floating label boxes. Those cannot be used as textures.

The pipeline needs a **2:1 equirectangular map** — a flat rectangle wrapped
around a sphere. Consequences a proposal must respect:

- Content near the top and bottom edges is crushed at the poles. Detail belongs
  near the vertical centre.
- Horizontal edges must tile seamlessly or a visible seam appears.
- A logo placed at the horizontal centre faces the default camera. It will
  curve with the sphere — that is correct and desirable, not a defect.
- Floating UI labels cannot survive. Anything that must read as text has to be
  *painted into the surface* at a size that survives curvature.

**Question:** write image-generation prompts that produce equirectangular maps
which, once wrapped, look like the owner's references. Give the exact prompt
text for at least three of: ASML, GOOG, MSFT, IBM, COST, INTC, NBIS, CBRS
(Cerebras — wafer-scale AI chips). Say where the logo sits in the flat map and
how large, and what fills the polar regions so they don't smear into mud.

Also specify: what should base colour, emissive, and normal maps each carry, so
the planet has real relief and glow rather than a flat decal?

### 3.2 Planet legibility at overview

Currently the planets are darkened so white ticker labels stay readable on top
of them — which hides the texture that is the whole point.

The owner's own suggestion: put the ticker **below** the planet, or colour the
label using the inverse of the texture beneath it.

**Question:** how should a ticker label relate to its planet so that both read
clearly at overview, the texture stays fully visible, and the label survives
against arbitrary underlying colours? Consider placement, contrast strategy,
scale relative to planet size, and behaviour when planets are near each other.

**Second question:** at overview the planets currently read as small dots in a
lot of empty space, and the orbit rings are nearly invisible. What should the
overview composition actually look like — planet scale, ring visibility, trail
weight, camera framing — so the system reads as a designed image rather than
scattered marks?

### 3.3 Mission Control — the biggest open question

Clicking the sun opens Mission Control: the portfolio dashboard, history,
trades, and research. The information is right. The presentation is, in the
owner's words, "generic and basic."

Constraints: it must stay dense (it is the analytical surface), it must not
lose data, and charts have inherent visual limits.

**Question:** what makes an information-dense analytical surface feel like a
retrofuturist command deck rather than a web dashboard? Be concrete —
propose layout structure, framing, typography, how numbers are presented, how
panels relate spatially, what happens at the edges, what the eye does first.

The strongest possible answer names specific treatments for specific content:
what a holdings table becomes, what a returns chart becomes, what a trade log
becomes. "Add scanlines" is not an answer.

### 3.4 The planet detail view

Selecting a planet currently shows a small telemetry panel. The owner wants
more: a chart of the holding over time, recent news, and today's performance —
*"basic information portrayed in a simple retrofuturistic way."*

**Question:** design that view. What is on screen, where, in what hierarchy?
How does it coexist with the planet itself (which stays visible and rotating)?
How does it avoid becoming the wall of text the owner rejected on the old
chapter pages?

### 3.5 Satellites, moons, and more systems

Three additive ideas from the owner, none built yet:

- **Satellites** carrying portfolio-level statistics
- **Moons** per planet, opening recent news for that holding
- **More solar systems** in the galaxy — other portfolios the owner creates

**Question:** how do these fit without turning the scene into clutter? What
does a satellite look like and what exactly does each one encode? How many
moons, and how does a moon differ from a satellite visually so the two never
confuse? For multiple systems — how do you leave one and reach another, and
what does the space between systems look like?

Every object must encode one real number or open one real thing. Anything
decorative fails.

### 3.6 The sun's hover state

Planets respond to the rocket cursor. The sun does not, so it reads as scenery
rather than the most important control on screen.

**Question:** what should the sun do on approach, given that it already encodes
health through colour, corona, sunspots, and a slow pulse — and that whatever
you add must not be mistaken for a change in portfolio health?

---

## 4. Do not solve these — engineering fixes already scoped

- Orbit rings and trails rendered nearly invisible (opacity regression)
- Planets intersecting orbit lines when the camera is close
- Difficulty returning from a planet to the whole system
- Asteroid-belt objects not clickable

Do not propose designs that depend on these staying broken.

---

## 5. What a good answer looks like

Specific, opinionated, and buildable. Name treatments, not directions. Where
two of the owner's wishes conflict, say so and pick one. Where something
would break the encoding rule or the desktop-only or public-first constraints,
say so rather than quietly ignoring it.

The round-1 response set the bar: it answered every question with a named
mechanism, caught encoding gaps the brief hadn't assigned, and pushed back on
one of the owner's own ideas with a reason. Do that again.
