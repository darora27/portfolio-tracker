# Deploy readiness gate

**Written July 31, 2026, after a deploy that was not ready.**

The site went live on July 30. On July 31 Devan sent his resume **without the
link**, because the deployed site takes 18 seconds to show anything. Nothing in
this project's tooling caught that before he did.

This file exists so the next deploy is gated on the things that actually
decide whether a stranger stays on the page.

---

## 1. What went wrong, precisely

Not the slowness itself — slowness is a bug and bugs happen. The failure was
that **we shipped without ever measuring the deployed page**, and had no gate
that would have noticed.

Three separate mistakes stacked:

**The gate measured the wrong thing.** Phase 10 has a 50 ms long-task budget,
defended hard for seven rounds. It measures main-thread work *after* the page
arrives. It says nothing about whether the page arrives at all. A route can
pass the 50 ms gate and still take 18 seconds to first byte — and did.

**Local dev hid it.** `npm run dev` and the capture harness both run against
`localhost`, where Finnhub responses are fast or cached and there is no
serverless cold start. The condition only exists in production.

**The first diagnosis was made from a correlate, not a measurement.** Asked why
the app was slow, I looked at `public/`, found 26 MB, and filed it as the
cause. It was not the cause; zero texture requests had even been issued during
the 17-second wait. This is the same failure mode the acceptance ledger was
built to prevent, committed against the deployment instead of against a
criterion. **A production claim needs a production measurement.**

## 2. The gate — every item runs against the DEPLOYED url, not localhost

No deploy is announced, linked, or put on a resume until all of these pass on
the real Vercel URL.

| # | Check | Threshold | How |
|---|---|---|---|
| D1 | **Time to first byte** | < 1.5 s | `performance.getEntriesByType('navigation')[0].responseStart` |
| D2 | **HTML fully streamed** | < 2.5 s | `...responseEnd` — catches streaming SSR held open by a slow await |
| D3 | **DOMContentLoaded** | < 3 s | `...domContentLoadedEventEnd` |
| D4 | **Cold instance** | D1–D3 hold | first hit after ≥ 15 min idle, or a fresh deployment URL |
| D5 | **Repeat visit** | D1–D3 hold | in-memory caches must not be what makes it pass |
| D6 | **Total transfer to first meaningful paint** | < 3 MB | sum `transferSize` up to the point the scene is legible |
| D7 | **Throttled** | usable at "Fast 3G" | DevTools throttling; family open this on phones |
| D8 | **Privacy** | zero dollar amounts on `/share` | existing public-payload tests, run against the deployed html |

D4 and D5 are the pair that matters most. **A warm in-memory cache making the
second render fast is not a fix** — it lives on one serverless instance and
never helps a first-time visitor, which is the only visitor a resume link has.

## 3. Standing rules this produced

- **Measure the deployed thing.** No performance claim about production may
  rest on a local run, a file size, a bundle report, or reasoning. It rests on
  a number taken from the live URL.
- **`force-dynamic` is a performance decision, not a default.** Any route
  carrying it must state in a comment what it needs per-request freshness
  *for*. `/share` carried it while serving daily-snapshot data.
- **Never block first byte on a third-party API.** Render from the database,
  stream live prices in behind `<Suspense>`. The "prices as of" fallback
  already exists for exactly this and was not being used on the critical path.
- **A pass on the 50 ms long-task gate says nothing about load time.** They are
  different budgets measuring different phases. Both are required.

## 4. Status of the blockers — updated August 3, 2026

- **FB-36** — *fixed in source, UNMEASURED in production.* `getDashboardData`
  is wrapped in `unstable_cache` (`src/lib/dashboard-data.ts`), so the ~24
  Finnhub calls are shared across serverless instances and visitors rather
  than blocking every render. The in-memory cache that preceded it lived on
  one instance and never helped a first-time visitor. **This claim rests on a
  source change, which §3 says is not good enough** — D1–D5 still have to be
  taken from the live URL before the link goes anywhere.
- **FB-37** — *closed as an owner decision, plus a real mobile fix.* The 26 MB
  is the price he knowingly chose over the graininess of a smaller tier (see
  the budget comment in `scripts/generate-planet-textures.mjs`, raised from
  15 MB on 2026-07-28 by his direction). What was genuinely wrong was that the
  generator's "desktop-only" justification was not enforced anywhere, so
  phones downloaded all of it. `src/lib/observatory/texture-policy.ts` now
  withholds the planet maps below 1024px and under Data Saver. **D6 should be
  re-measured on both a wide and a narrow viewport** — the narrow case is the
  one the old figure was wrong about.

## 5. Running the gate

`scripts/deploy-gate.js` is D1–D3 and D6 made runnable: paste the whole file
into the DevTools console on the **deployed** URL and read the table.

It deliberately does not cover everything:

- **D4 / D5** cannot be automated from inside a single page load. The script
  prints what to do for whichever one you did not just measure. This pair
  matters most — a warm cache making the second render fast is not a fix.
- **D6** is counted to `DOMContentLoaded` rather than to "the scene is
  legible", which nothing can detect automatically. It is reported as a
  **lower bound**, not as the whole number.
- **D7** needs DevTools throttling, by hand.
- **D8** stays with the public-payload tests. A console script grepping for
  dollar signs would be a weaker check wearing the same name.

### What cannot be verified from the agent sandbox

Recorded so it is never assumed again. The sandbox runs linux/arm64 against
`node_modules` installed for darwin/arm64, with no registry access:

- **`npm test`** — vitest fails to load its rolldown native binding.
- **`npm run build`** — `Failed to load SWC binary for linux/arm64`, and the
  wasm fallback cannot be downloaded.

So "typechecked and linted" is the most an agent turn can honestly claim
about this repo. **`tsc` and `eslint` passing is not the suite passing, and
neither is a build.** Any agent report saying "done" without Devan having run
`npm test` and `npm run build` is overclaiming.
