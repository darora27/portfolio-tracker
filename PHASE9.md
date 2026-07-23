# Phase 9 — Progressive Disclosure + Research + Simulations + Multi-Agent (v1)

Read alongside CLAUDE.md, PHASE7.md, PHASE8.md. Phases 7–8 are complete:
the app is live, dense, dark, and correct. Phase 9 changes what the app
feels like on arrival, adds a research section and comparison
simulations, and makes the repo workable by two different agent tools.

**Who this is written for:** unattended execution by a smaller model —
possibly a DIFFERENT VENDOR'S model (OpenAI Codex CLI) on some
sections. There is no shared taste between executors, so nothing here
is left to taste. Literal values, exact fixtures, pre-made decisions.
If something is genuinely uncovered: smallest reasonable call, record
it in the progress log, keep going.

## Ground rules
1. **Progress log:** create `PHASE9_PROGRESS.md` first, from the §0–§8
   checklist, with an executor column. Every completed item appends
   `— done by <tool>/<model>` (e.g. `— done by claude-code/sonnet-4-6`,
   `— done by codex/gpt-5.6-sol`). Read this file at the start of every
   session; work only unchecked items; commit it with each section.
2. One commit per section: `phase9(§N): <summary>`. `npm test` and
   `npm run build` green before every commit. Never leave the repo
   broken between commits, and never stop mid-section — finish, test,
   commit, then stop.
3. Existing tests are the spec for existing behavior. Never edit one to
   make new code pass. All 170+ must stay green after every section —
   including §3's route moves.
4. **Never run `vercel --prod`.** Never print or edit `.env*`. Every
   new route is owner-gated unless this file says public; the only
   public surfaces are `/share` and `/share/full`.
5. **Do not restyle existing deep components.** Phase 7's dark tokens
   and components are untouched. The new surface layer uses NEW token
   names (`--paper`, `--ink`, …) so the two palettes coexist with zero
   collisions by construction.
6. All external reads go server-side through the cache module. API keys
   never reach the browser.
7. Both agent tools must obey AGENTS.md (created in §0). Never run two
   agents against this repo simultaneously.

---

## §0. Preflight + multi-agent groundwork
1. Confirm repo green: `npm test`, `npm run build`.
2. Probe once each, server-side, real key, **log status codes only**:
   - Finnhub `/news?category=general`
   - Finnhub `/stock/insider-transactions?symbol=ASML`
   Record status + whether expected fields exist in the progress log.
   Either failing → the dependent block in §4 renders nothing
   (graceful absence) and you note it. (The candles endpoint taught us
   free-tier docs lie; verify everything.)
3. Check presence (NOT values) of `REDDIT_CLIENT_ID`,
   `REDDIT_CLIENT_SECRET`, `REDDIT_USER_AGENT`. Absent is expected —
   approval is pending — and §4's Reddit block must build in its
   flagged-off state regardless.
4. Confirm the `benchmarks` table covers VOO/VTI/XLK from 2026-06-24
   through the latest snapshot (needed by §5 sims).
5. Create `AGENTS.md` at repo root (Codex CLI reads this filename
   natively; Claude Code is instructed to read it via one pointer line
   added to CLAUDE.md — do not duplicate content). Contents, verbatim
   in spirit:
   - Read the current `PHASE*_PROGRESS.md` before doing anything.
   - Work sections in order; one commit per section
     (`phase9(§N): …`); tests + build green before every commit.
   - Append your tool/model name to every item you complete.
   - Never run alongside another agent on this repo.
   - Never run `vercel --prod`; never touch `.env*`; new routes are
     owner-gated by default.
   - Leave the repo green and committed before stopping for any
     reason (rate limit, budget, end of task).
6. Create `PHASE9_PROGRESS.md`. Commit:
   `phase9(§0): preflight probes + AGENTS.md + progress log`.

---

## §1. Surface design system — "Daylight" layer

**The design decision (made, not open):** the app becomes two visual
tiers of ONE system. The surface tier — what everyone lands on — is
warm, light, spacious, almost empty: Apple-page restraint with one
warm-paper twist so it doesn't read as a generic white template. The
deep tier is the existing dark trading terminal, unchanged. The violet
accent `#7C6FFF` is the single thread that runs through both tiers, and
JetBrains Mono renders every numeral in both tiers. Depth = descent:
moving from surface to deep literally moves from light to dark, which
makes the information architecture *felt* rather than explained.

### 1a. Surface tokens (new names; add to `globals.css`; never reuse
deep-tier names)
```css
--paper:        #F7F5F0;  /* page background, warm off-white */
--paper-raised: #FFFFFF;  /* cards on paper */
--ink:          #17161C;  /* primary text on paper */
--ink-soft:     #5A5763;  /* secondary text */
--ink-faint:    #8B8794;  /* muted text */
--line:         #E4E1D8;  /* hairline borders on paper */
--accent stays  #7C6FFF   /* fills, rings, large text only on paper */
--accent-ink:   #5646E5;  /* accent-colored TEXT on paper (small sizes) */
--gain-ink:     #0E8A6A;  /* positive text on paper */
--loss-ink:     #D6335C;  /* negative text on paper */
--gain-wash:    rgba(14,138,106,0.10);
--loss-wash:    rgba(214,51,92,0.10);
```
Contrast rules (enforce, don't eyeball): `--ink` on `--paper` ≈ 15:1;
`--ink-soft` ≈ 6.6:1 (body-size ok); `#7C6FFF` on paper ≈ 4.3:1 —
**allowed only ≥ 18px text or non-text uses**; any smaller accent text
on paper uses `--accent-ink` (≈ 5.4:1). Gains/losses as text on paper
always use the `-ink` variants, never the deep-tier neons.

### 1b. Surface typography
- Add **Instrument Serif** (weight 400 + italic) via
  `next/font/google`. Used ONLY for surface-tier display moments: the
  hero label line and section lead-ins. Never for numbers, never in
  the deep tier, never below 28px.
- Inter remains all other surface text. JetBrains Mono remains every
  numeral, both tiers.
- Surface scale: hero number `clamp(56px, 10vw, 112px)` mono bold in
  `--ink`; hero label 32–40px Instrument Serif italic in `--ink-soft`;
  plain-language subline 18–20px Inter in `--ink-soft`; section
  lead-ins 28px Instrument Serif; buttons/links 16px Inter medium.

### 1c. Motion tokens (both tiers; respect `prefers-reduced-motion`
globally — reduced = crossfade ≤150ms or nothing, per pattern below)
```css
--ease-flip:  cubic-bezier(0.2, 0.7, 0.2, 1);
--ease-depth: cubic-bezier(0.7, 0, 0.2, 1);
--dur-flip: 420ms; --dur-depth: 560ms; --dur-count: 600ms; --dur-micro: 150ms;
```

### 1d. The three reveal patterns (build in `src/components/surface/`)

**1. `<FlipCard>` — the workhorse.** A `--paper-raised` card,
`rounded-xl`, `1px solid var(--line)`, generous `p-8`. Front face:
plain-language stat. Back face: the corresponding EXISTING deep
component (reused as-is — e.g. the Phase 7 concentration meter or a
mini composition donut) plus a "See more →" link into the deep tier.
Mechanics: real `<button>` semantics wrapping the card, `aria-pressed`
toggling, both faces in the DOM with `aria-hidden` swapped; 3D flip
`rotateY(180deg)` over `--dur-flip` `--ease-flip`, `perspective:
1200px`, `backface-visibility: hidden`; a small ⟳ glyph pinned to the
top-right corner of every FlipCard front so the affordance is visible,
not discovered (the 8-to-80 rule: nothing relies on hover or intuition).
Tap/click/Enter flips; again flips back. Reduced-motion: 150ms
crossfade, no rotation. Min tap target 44px everywhere.

**2. `<DepthPull>` — the tier transition.** Wraps navigation from a
surface page into the deep tier. On trigger: a fixed full-viewport
overlay in `--paper` covers the screen, then wipes upward via
`clip-path: inset(0 0 0 0 → 100% 0 0 0)` over `--dur-depth`
`--ease-depth`, revealing the dark route beneath (router.push fires at
overlay-full, wipe plays after navigation commit). The incoming deep
page's headline number runs its Phase 7 count-up on arrival. Do NOT
depend on the View Transitions API; this overlay approach is the
implementation. Reduced-motion: plain navigation, no overlay.

**3. `<CountUpSettle>` — extend the Phase 7 count-up hook:** surface
hero numbers count up over `--dur-count` and finish with a single
80ms scale settle (1.00 → 1.015 → 1.00). Reduced-motion: render final
value immediately. No other bounce anywhere — one settle, once, on
load.

**Done when:** tokens + fonts wired; the three components render on a
scratch page; reduced-motion verified for all three (test via
matchMedia mock); zero deep-tier files modified.

---

## §2. Plain-language engine (deterministic, tested — this is where
"legible to an 8-year-old or an 80-year-old" actually lives)

New pure module `src/lib/surface-copy.ts`. No LLM calls — template
logic only, so it's free, instant, and testable.

`weeklySubline({twr7d, voo7d})` → string. Rules, in order:
- if `|twr7d| < 0.0005` → `"Little changed this week."`
- else direction word: `twr7d > 0 ? "Up" : "Down"`, magnitude
  formatted one decimal via the existing format module.
- market clause from `d = twr7d − voo7d`:
  `|d| < 0.0015` → `"about even with the market"`;
  `d ≥ 0.0015` → `"ahead of the market"`;
  `d ≤ −0.0015` → `"behind the market"`.
- join: `"{Up|Down} {x.x}% this week — {clause}."`

Fixtures (exact strings):
- `{twr7d: 0.024, voo7d: 0.010}` → `"Up 2.4% this week — ahead of the market."`
- `{twr7d: −0.031, voo7d: −0.012}` → `"Down 3.1% this week — behind the market."`
- `{twr7d: 0.0009, voo7d: 0.0002}` → `"Little changed this week."`
- `{twr7d: 0.012, voo7d: 0.0112}` → `"Up 1.2% this week — about even with the market."`

Also `todayLine({dayReturn})` (same thresholds, "today" wording) and
`riskLine(hhi)` mapping the Phase 8 concentration bands to
`"Very concentrated — a few stocks drive most of the movement."` /
`"Moderately concentrated."` / `"Well spread out."`. Fixture each band
edge. **Banned everywhere in this module: any imperative or advice
word — buy, sell, should, consider, recommend.** Add a unit test that
greps the module's output strings for those words and fails if found.

---

## §3. Surface pages + routing

**Route moves (decided):** the existing dense private dashboard page
moves unchanged from `/` to `/dashboard`. The existing dense share page
moves unchanged from `/share` to `/share/full`. New surface pages take
over `/` (owner-gated, as `/` is today) and `/share` (public). Nav on
deep pages gains "Overview" (→ surface) as the first item; existing
Dashboard/History/Trades/Research links unchanged. Old bookmarks to
the dense views now land one click away — acceptable; note it in the
summary.

**Surface page structure — three "acts", both `/` and `/share`, each
roughly a viewport tall, `--paper` background, max-w-3xl centered,
enormous whitespace:**

- **Act 1 — The number.** Instrument Serif label ("Devan's portfolio" /
  on share: "The portfolio"), then the hero: private = total value in
  dollars; **share = same-period TWR percent (never dollars)**. Under
  it, `weeklySubline(...)` in 18–20px `--ink-soft`. `<CountUpSettle>`
  on the hero.
- **Act 2 — The shape.** One large area chart of the TWR growth index:
  surface chart variant — no gridlines, 3px `--accent` line, gradient
  fill to transparent, only first/last date labels, `--paper-raised`
  tooltip with `--line` border. One toggle chip "vs the market" adds
  the VOO line (dashed, `--ink-faint`). Nothing else on this screen.
- **Act 3 — The doors.** Three FlipCards side by side (stack on
  mobile): "What I own" (front: one-line count + top holding by
  weight; back: mini composition donut reused from Phase 7 + See
  more →), "How risky is it" (front: `riskLine(hhi)`; back: the
  concentration meter + See more →), "Today" (front: `todayLine(...)`;
  back: today's top mover + See more →). Below them, ONE primary
  button — `--accent` fill, white text, 18px, pill — "Open the full
  dashboard" (share: "See the full breakdown") wired through
  `<DepthPull>` into `/dashboard` (share: `/share/full`).

Surface header: minimal — wordmark; private adds a quiet "Full
dashboard" text link (`--accent-ink`) + Sign out; share adds the
existing "Read-only" chip. `/share` keeps `export const
revalidate = 300` from Phase 8.

**Privacy matrix (surface additions):**

| Element | `/` (private) | `/share` |
|---|---|---|
| Hero number | dollars | TWR % only |
| Sublines (week/today/risk) | % language | % language (identical) |
| Act 2 chart | index (%) | index (%) |
| FlipCard fronts/backs | may show $ on backs | weights/% only, no $ anywhere |
| Primary button target | `/dashboard` | `/share/full` |

**Done when:** all 170+ existing tests still green after the moves;
logged-out `/` gates; `/share` serves; both surfaces hold at 390px
width; every reveal works by keyboard.

---

## §4. `/research` — owner-gated. Not linked from any share surface.

**Data layer first** (extend the Phase 8 cache module; rename the file
to `src/lib/server/api-cache.ts` and re-export from the old path so no
import breaks):
- **General market news:** Finnhub `/news?category=general`, 30min
  TTL, top 12 items. §0 probe failed → omit block.
- **Company news:** reuse Phase 8's per-ticker fetch (24h TTL).
- **Insider transactions (label: "Insider filings (SEC Form 4)"):**
  Finnhub `/stock/insider-transactions` per held ticker, 24h TTL, last
  90 days; show filer name, buy/sell, shares, date; per-ticker net
  count badge. **Required copy, verbatim, as the section's subtitle:**
  "Public SEC Form 4 disclosures — filed when insiders trade their own
  company's stock." Never imply non-public information anywhere.
- **Reddit mentions (capability-flagged):** if the three env vars are
  absent → render a `--surface` card: "Reddit integration pending —
  awaiting Reddit's API approval." and build everything else to run
  without it. When present: OAuth2 client-credentials token (cache
  ~50min), then **three requests per hour total**:
  `GET /r/{stocks|investing|wallstreetbets}/new?limit=100` with the
  configured User-Agent, 60min TTL. Filter to posts with
  `created_utc` within 24h; scan title + selftext.
  Counting rule (deterministic): count `$TICKER` (case-insensitive)
  and bare `TICKER` as a word-boundary, uppercase-only match — EXCEPT
  for the ambiguous set `{COST, MEI}` where ONLY `$`-prefixed mentions
  count (both are common English words).
  Fixture — synthetic posts:
  `["$GOOG earnings tonight", "GOOG will beat", "the cost of eggs",
  "$COST membership hike", "MEI update", "buying $MEI"]`
  → GOOG = 2, COST = 1, MEI = 1.
- **Sentiment lean (dead simple, no NLP):** fixed lexicon, title-only,
  case-insensitive. Positive: beat, beats, surge, soars, record,
  upgrade, rally, jump, jumps, gains, tops. Negative: miss, misses,
  plunge, falls, cuts, downgrade, probe, lawsuit, warns, layoffs,
  slump. Item score = (#pos − #neg); lean = sign. Fixtures:
  "ASML beats estimates, shares surge" → +2 → positive;
  "IBM warns on pipeline probe" → −2 → negative;
  "GOOG announces event date" → 0 → neutral.

**Page layout** (deep tier, existing dark components): a cross-source
table — rows = held tickers; columns = News (24h count + lean arrow),
Reddit (24h mentions + lean, or "pending"), Insider net (90d) — with a
subtle `--accent` ring on a row when news lean and Reddit lean agree
and are nonzero. Below: General Market News list, then per-ticker
insider filings (collapsed per ticker). Every item shows source +
timestamp. Page footer line, verbatim: "Public information aggregated
for personal research — not investment advice." The §2 banned-words
test extends to this page's static copy.

---

## §5. Comparison simulations — `/compare`, owner-gated

Pure functions over data ALREADY in the database (snapshot closes +
benchmarks). Zero new external calls. New file
`src/lib/math/sim-portfolio.ts`.

All sims: hypothetical **$10,000** at inception **2026-06-24**, valued
on every snapshot date, TWR by the same convention as the real
portfolio. Three sims (names are product copy — use them exactly):
1. **"Steady Market"** — 100% VOO, buy and hold.
2. **"Tech Tilt"** — 50/50 VOO/XLK, rebalanced to 50/50 on the first
   trading day of each month.
3. **"AI Concentrate"** — equal-weight the tickers that are BOTH held
   in the real portfolio AND rated High in `data/ai-exposure.json`,
   re-formed on the first trading day of each month; a ticker missing
   a close on a rebalance date is skipped and weights renormalize; if
   fewer than 3 qualify, that month holds VOO.

Every simulated trade appends to a sim trade log with plain-text
reason ("monthly rebalance: rule = equal-weight High-AI holdings").

Fixtures (exact):
- **Identity:** Steady Market's TWR must equal the dashboard's
  same-period VOO return to within 1e-9. (shares = 10000/close₀;
  value_t = shares×close_t — algebraically identical.)
- **Tech Tilt synthetic:** closes A: [100, 110], B: [100, 90], one
  50/50 buy at t0 → value 10,000 → 10,000 → **0.00% exactly**.
- **AI Concentrate synthetic:** two qualifying tickers, closes day0
  100 and 200, dayN 110 and 190 → 50 sh + 25 sh → 5,500 + 4,750 =
  **$10,250 → +2.50% exactly**.

UI: `/compare` shows the real portfolio line vs the three sim lines
(indexed to 100 at 2026-06-24; deep-tier chart styling; sims get the
VTI/XLK/muted line treatments), a small table (TWR, vol, max DD per
sim — reuse existing math functions), and each sim's trade log behind
a collapse. **Mandatory banner component at the top of every view that
renders sim data, verbatim:** "SIMULATIONS — hypothetical portfolios
for comparison only. Not advice, not predictions, not
recommendations." The banned-words test covers this page too (the
banner itself is the only allowed occurrence of "recommendations").
Add one FlipCard-sized entry point on `/dashboard` ("vs. three
simulated portfolios →"), not on any share surface.

**Privacy:** `/compare` is owner-only; nothing sim-related appears on
`/share` or `/share/full`.

---

## §6. `scripts/agent-relay.sh` — best-effort convenience, not
infrastructure

A ~60-line bash loop, committed with a header comment saying exactly
this: it is a convenience for alternating two locally-authenticated
agent CLIs, both of which the OWNER must have pre-configured in their
unattended/full-permission modes; it passes no secrets and makes no
network calls itself.

Behavior: run tool A non-interactively with the resume prompt ("Read
AGENTS.md and the current PHASE*_PROGRESS.md; resume from the first
unchecked item; stop cleanly per ground rules."); if its output/exit
indicates a rate limit, run tool B with the same prompt; if both are
limited, sleep 20 minutes and loop; log every attempt with timestamps
to `agent-relay.log`; exit on Ctrl-C. Tool commands and the
rate-limit-detection strings go in variables at the top of the script
so the owner can adjust them without editing logic. Manual alternation
remains the documented reliable path; say so in the header.

---

## §7. Integration pass
- All new numbers through the format module (grep for stray
  `toFixed(`/`toLocaleString(` outside it).
- No hardcoded hexes in new components (grep `#` in
  `src/components/surface/` and new pages).
- 390px audit: both surfaces, `/research`, `/compare`.
- Logged-out: `/` gates to sign-in; `/dashboard`, `/research`,
  `/compare`, `/history`, `/stock/*` gate; `/share` and `/share/full`
  serve; export routes still 401.
- Reduced-motion pass on every new animation.
- Screenshots to `docs/screenshots/` if a browser tool exists; skip
  silently if not.

## §8. Required closing summary
Report: sections done vs remaining, with the executor column totals
(how much each tool did); §0 probe results and any blocks omitted;
test count before → after; every judgment call; confirmation that the
Steady Market identity fixture passes; and the flags below surfaced to
Devan verbatim.

## Flags for Devan (decisions he may want to override — each is cheap
to change now, expensive later)
1. **Display font:** Instrument Serif chosen for surface display type.
   One-line swap candidates if the vibe is off: Fraunces, Newsreader.
2. **Route moves:** dense dashboard now at `/dashboard`, dense share at
   `/share/full`. Old bookmarks land on the new surfaces.
3. **Sim rules:** $10k inception 2026-06-24; the three rules as named.
   Different rules or starting capital = small config change.
4. **Surface copy tone:** the §2 sentence templates are the voice of
   the whole surface — approve or redline the exact strings.
5. **X/Twitter:** still out, pending an explicit ~$10–30/mo budget
   decision (no free tier exists).

## Future ideas — record, do NOT build
X integration (budget-gated); LLM-reasoned sim portfolio with logged
rationale (token cost); preference to skip straight to the deep tier
("start me in full"); Reddit sentiment history charting once real data
accumulates; sim portfolios with deposits mirroring the real cash-flow
schedule.
