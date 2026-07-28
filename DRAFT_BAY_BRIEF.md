# The DRAFT bay — brief for a creative collaborator

A new surface for the Stock Market Universe. Companion to
`UNIVERSE_IDEAS_3.md` (the accepted colour and material design) and
`UNIVERSE_ROUND3_BRIEF.md`. Read those first if you have not.

This replaces what was planned as a separate `/compare` page. The owner asked
for it as a feature inside Mission Control instead.

---

## 1. The idea, in the owner's own framing

> *"If we take the individual in the rocket — my cursor — that is flying around
> the solar system, this hypothetical portfolio is something that the user has
> inside their rocket ship to run tests."*

That is the whole concept and it should drive the design. The rocket cursor is
already the user's presence in this world. The DRAFT bay is **the workbench
inside it** — a small test rig you carry, not a separate application you visit.

Whatever this becomes, it should feel like equipment you own rather than a page
you navigate to.

---

## 2. What the owner specified

Direct requirements, not open questions:

- **Two-dimensional, not 3D.** Deliberately simpler than the main scene —
  closer to the flat top-down radar plot already in Mission Control.
- **Circles represent holdings**, each a different colour, each **labelled** so
  you can tell which is which without clicking.
- **Direction works exactly as it does in the real system** — orbit direction
  means the same thing here as out there. Learn the language once.
- **Weights are percentages, not dollars.** The mental model: *"the user gets
  $100 and disperses it across their holdings."* Nothing in this bay carries a
  real dollar amount.
- **Exactly one hypothetical portfolio.** Not a library, not saved scenarios —
  one, to keep it simple.
- **Easy to tamper with.** Repeated three times in the owner's description:
  *"easy to play around with,"* *"does not have to be all that complex,"*
  *"completely experimental."* Fiddling should be the primary verb.
- **Nothing too crazy.** His words. Restraint is a requirement, not a fallback.

---

## 3. The thing that makes this honest — read carefully

In a hypothetical portfolio, **the companies are still real.** ASML's actual
weekly return is ASML's actual weekly return regardless of how much of it you
pretend to own.

So the encodings split cleanly:

| Channel | In the DRAFT bay | Why |
|---|---|---|
| Orbit **direction** | **Real** — the holding's true weekly sign | The stock did what it did |
| Orbit **speed** | **Real** — true weekly magnitude | Same |
| Circle **size** | **Hypothetical** — your invented weight | This is the only thing you are changing |
| Circle **colour** | Identity — which company | Unchanged from the main scene |

**You are only ever playing with allocation.** That is what makes the bay
truthful: nothing about the companies is invented, only your ownership of them.

This also means the bay can say genuinely useful things without fabricating
anything:

- **Concentration** — top-two weight, HHI — recomputed live from your weights.
- **Sector and exposure mix** — real sector data, your weights.
- **Correlation** — real, and it changes meaning as weights change.
- **Same-period return under these weights** — computable honestly, *if*
  measured over exactly the same window as the real portfolio and labelled
  unmistakably as hypothetical.

**Hard rules on that last one.** The project's financial discipline
(`CLAUDE.md`) forbids comparing a since-purchase simple return against a
benchmark measured from a different start date. Any figure this bay produces
must be same-period, must be visibly labelled hypothetical, and must never be
confusable with the real portfolio's numbers. The original `/compare` spec
carried a mandatory simulation disclaimer; it carries forward here.

---

## 4. Questions

### 4.1 The instrument itself

What does this look like as a piece of equipment inside a rocket? The main
scene is deep space; Mission Control is a warm ops room. This is a third thing —
a small, hands-on, personal rig.

Concretely: how are the circles arranged, how big is it, what frames it, and how
does it read as *yours* rather than as another bay like the others?

### 4.2 How you actually change the weights

The single most important interaction. The owner wants fiddling to be
effortless — dragging a circle bigger, a slider per holding, dragging mass from
one to another, typing a number, something else.

Consider that weights must always total 100%. Taking from one gives to
another, and the interface should make that feel physical rather than like
form validation. What happens to the other seven when you grow one?

### 4.3 What you learn, and when

If changing a weight teaches you nothing, this is a toy. What does the bay show
you as you fiddle — and does it update live, or on release?

Name the two or three readouts that earn their space. Resist showing everything;
the owner has rejected dense text repeatedly.

### 4.4 Comparison against the real portfolio

How do you see the difference between your draft and what you actually own?
Options include a ghost overlay of real weights behind the draft circles, a
side-by-side readout, a single divergence number, or something better.

Note there is already a second form of comparison in this product: the sector
map lets you fly to another portfolio's system. Does the DRAFT bay need to
duplicate that, or should it only ever compare against *your own* book?

### 4.5 Starting state and reset

Does it open as a copy of your real portfolio, as equal weights, or empty? How
do you get back to unmodified? An experiment you cannot undo is not an
experiment.

### 4.6 Where the 2D grammar comes from

Mission Control already has a flat orange wireframe radar plot with rings and
blips. Should the DRAFT bay reuse that visual language exactly, or be visibly a
different instrument? Reuse is cheaper and more coherent; difference makes it
feel like a distinct tool.

---

## 5. Constraints

- **The Fraunhofer rule applies.** Decorative and instrument light draws the
  spectrum minus green 125°–165° and red 345°–20° at chroma > 0.30. Those bands
  mean gain and loss. Circle identity colours are matter and exempt; anything
  that glows is not.
- **Percentages only.** No dollar amounts anywhere in this bay, which also makes
  it public-safe by construction.
- **One draft portfolio.** Owner decision, for simplicity.
- **Desktop-first.** Phones keep the existing 2D fallback.
- **Contrast verified by computed WCAG ratio** from source tokens.
- **Keyboard operable and screen-reader legible.** Weight adjustment cannot be
  drag-only.
- **Reduced motion** must not break it — orbits may freeze while every encoding
  stays readable.
- **Route-owned long task under 50 ms.** This bay is 2D canvas or DOM, not a
  second WebGL context.
- **Every visual channel encodes one real number.** Nothing decorative that
  means nothing.

---

## 6. What good looks like

The owner will judge this by one thing: **is it fun to fiddle with?** It is
explicitly experimental — a toy that happens to be honest. If it feels like
filling in a form, it has failed regardless of how correct it is.

Be specific and buildable. Name interactions, sizes, and readouts. Where two of
the owner's wishes conflict, say so and choose.
