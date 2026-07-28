# What §11–§16 should become

Draft for owner review, July 28, 2026. **Nothing here is decided or committed.**
Staged outside the repository because a relay turn is running.

## Why this exists

Sections §11–§16 were specified when `/share` was a five-chapter Field
Journal. That design is gone. The remaining specs describe separate pages built
around a model the product no longer uses, and at least one of them describes
something you have already asked for somewhere else.

Owner decisions recorded today:

- **Fold what fits into Mission Control** rather than keeping separate pages.
- **The universe matters most** — trim the deeper routes to whatever is
  simplest that still works.

---

## The current plan, and what is wrong with each

### §11 `/compare` — guided simulation story

**Problem: you already asked for this inside Mission Control.** From your
feedback:

> *"In the dashboard itself I want there to be a sort of virtual environment
> inside the dashboard that allows you to create a virtual solar system inside
> of the mission control that allows for you to make and track hypothetical
> portfolios."*

That is `/compare`'s entire purpose, relocated. Building both means building the
same feature twice with two different interfaces.

**Proposal: `/compare` dies as a route.** It becomes the **DRAFT bay** in
Mission Control — build a hypothetical portfolio, watch it render as its own
small solar system, compare it against your real one. The existing simulation
math, fixtures, and the mandatory hypothetical-data disclaimer all survive; only
the surface changes.

There is also a second, cheaper form of comparison already designed: the
**sector map** lets you fly to another system. Comparing *is* travelling. Some
of §11's job may already be covered by that.

### §12 — after-hours capability spike

**Least affected by the direction change.** This is a data-capability question —
can the provider give reliable pre-market and after-hours prices — not a page.
It survives roughly as written.

**Proposal: keep, deprioritise.** It is a spike that answers yes or no. If yes,
the payoff is small and ambient: the sun and planets reflect after-hours moves.
Worth doing, not worth doing soon.

### §13 `/research` — prioritisation and filing context

**Two problems.** First, it was designed as a separate page. Second, you raised a
blocker nobody has answered:

> *"I was wondering if you could try to learn how to use the reddit skill things
> that I installed the other day because it does not look like I am getting
> approved for the reddit API thing any time soon."*

**Proposal: research folds into Mission Control's COMMS bay**, which already
exists in the round-3 design as the "what is being said" surface. The news moons
per planet already carry headlines. Research stops being a destination and
becomes what you see when you fly somewhere.

On Reddit: the `reddit-fetch` skill you installed works through a browser
session rather than the API, so it sidesteps the approval you are waiting on.
Worth a real look — but note it is a **local research tool**, not a server-side
data source. It could help you gather sentiment while working; it cannot feed a
deployed public page. Those are different problems and it is worth being clear
which one you are solving.

### §14 `/history` — event narrative

**Partly built already.** Fable's aurora *is* your history: fifty-two stripes,
one per week, coloured by that week's return magnitude. Your portfolio's story
is literally rendered across the sky.

Mission Control's SCOPE bay carries the indexed performance trace, and the LOG
carries dated events.

**Proposal: `/history` dies as a route.** What remains is a **TIMELINE
treatment inside Mission Control** — the aurora is the ambient version, the
scope is the analytical version. If something is genuinely missing after §10
lands, it becomes a small addition rather than a section.

### §15 `/trades` — decision review and focused entry

**Mission Control already has the LOG bay** — reverse-chronological teletype
lines, one per trade, with your reasons.

But there is one thing the universe genuinely cannot do: **entering a new
trade.** That is a form, it is owner-only, and it does not belong on a public
spatial page.

**Proposal: split it.** Trade *review* folds into the LOG bay. Trade *entry*
stays a real owner-only route — plain, fast, unglamorous, and correct. A form
you use twice a month does not need art direction.

### §16 — integration, local fonts, resilience, acceptance

**Unchanged and still last.** Local fonts still matter — the production build
still fetches from Google Fonts, which has blocked builds repeatedly. Everything
else in it is the final pass across whatever the product turns out to be.

---

## The proposed shape

| Was | Becomes |
|---|---|
| §11 `/compare` | **DRAFT bay** in Mission Control + the sector map |
| §12 after-hours | Unchanged spike, deprioritised |
| §13 `/research` | **COMMS bay** + news moons |
| §14 `/history` | **Aurora + SCOPE** (largely already built) |
| §15 `/trades` | **LOG bay** + a plain owner-only entry form |
| §16 integration | Unchanged, still terminal |

Five sections collapse into roughly two pieces of real work:

1. **One section** that builds the DRAFT bay and the trade-entry form — the two
   things that genuinely do not exist yet.
2. **The after-hours spike**, whenever you want it.
3. **§16**, last.

That is a meaningful shortening of the road, and it happens because most of
these surfaces were absorbed into Mission Control by the round-3 design without
anyone noticing.

---

## What this costs you

**Honest tradeoffs, since trimming has consequences:**

- **Everything lives in one room.** If Mission Control gets crowded, there is no
  overflow. The word budget and the one-dominant-bay rule matter more than they
  did.
- **Deep analysis loses room to breathe.** A correlation matrix is more
  comfortable on its own page than in a bay. You said the universe matters most,
  so this is the trade you chose — but it is a real one.
- **Nothing is deleted, only relocated.** The concentration, correlation, and
  contribution analysis survives in bays. If a bay turns out too small for its
  content, that is a signal to promote it back to a route.

---

## Open questions for you

1. **Does the DRAFT bay need to render hypothetical portfolios as actual solar
   systems**, or is a chart enough? You described a virtual solar system, which
   is the more ambitious and more interesting answer.
2. **Is the sector map enough comparison on its own?** If flying to another
   system already satisfies "compare," the DRAFT bay may only need to handle
   *hypothetical* portfolios, not real ones.
3. **Reddit for research** — a local tool you use while working, or something
   that has to run on the deployed site? They need different solutions.
4. **Should trade entry look retrofuturist**, or is a plain form fine? My
   instinct is plain, because you use it rarely and correctness matters more
   than atmosphere.

None of this becomes real until §10 lands and you have looked at it. It is
written now so that §11's spec turn does not start from a stale plan.
