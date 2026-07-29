# Systems — additional solar systems

Each file here is one solar system beyond the owner's own portfolio. The first
target is **XLK** (Technology Select Sector SPDR), recorded as a long-term goal
by the owner on July 29, 2026:

> *"Replicating this solar system pattern for the ETF XLK on your own. I am not
> expecting you to be able to do this over the course of a day or even a week.
> This is just a long term goal and I want to get the ball rolling sooner than
> later."*

Nothing here is wired into the application yet. This directory exists so the
first step is done and the shape is settled.

## Why a hand-maintained file rather than an API

Finnhub has an ETF-holdings endpoint, but it sits behind their paid tier
(~$12/month). It is not needed.

XLK rebalances quarterly, and the universe only renders the **top 8 holdings as
planets** plus a handful in the belt. That is a short file updated four times a
year — free, immediate, and entirely adequate for a personal project. If the
number of systems ever grows past what is pleasant to maintain by hand, revisit
the API then.

Source for the numbers: the issuer publishes full holdings publicly (State
Street for XLK). Copy the top names and weights; they need not sum to 100%
because the belt absorbs the remainder.

## File shape

```json
{
  "key": "xlk",
  "name": "XLK",
  "longName": "Technology Select Sector SPDR",
  "owned": false,
  "asOf": "2026-07-29",
  "holdings": [
    { "ticker": "NVDA", "weight": 0.0000 },
    { "ticker": "MSFT", "weight": 0.0000 }
  ]
}
```

`weight` is a fraction, not a percentage — `0.152`, not `15.2`. Matching the
convention `publicOrreryHoldings` already uses.

## The rule that governs an unowned system

**`owned: false` means TWR cannot be computed.** There are no cash flows,
because nobody bought anything. Inventing a time-weighted return for a system
you do not hold would break the project's central financial rule.

`UNIVERSE_IDEAS_3.md` §5 already settled the answer: unowned systems render
with a **hollow-core sun** — observed, not owned. Health derives from the
constituents' weighted day and week returns, honestly downgraded, and the
hollow core is the visual admission that a whole class of measurement is
unavailable there.

An owned system — one with real trade history — gets a solid core.

## What XLK needs beyond this file

1. **A multi-system data model.** The app currently assumes one portfolio.
   Loading a system by key is the real engineering work.
2. **Textures for unheld tickers.** XLK's top names overlap the owner's book
   heavily — MSFT, ORCL and CRM already exist — so the marginal cost is roughly
   four or five new worlds at the existing per-ticker cost.
3. **Navigation between systems.** The sector map was cut in §10 after three
   attempts at making it comprehensible, explicitly pending this decision.
   It now has a reason to exist, which changes the problem: previously it was a
   map to nowhere.
4. **A privacy check.** An unowned public system carries no owner data at all,
   which makes it strictly safer than the existing view — but the canary tests
   should cover it rather than assume it.
