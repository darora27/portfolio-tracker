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

## 4. Open items this gate would currently fail

- **FB-36** — 18.2 s to first byte on `/share`, warm, every request. Fails
  D1, D2, D3, D4, D5.
- **FB-37** — 21.8 MB of planet textures. Fails D6; not the cause of FB-36 and
  not to be worked before FB-36 lands and the load is re-measured.
