# Phase 7 — Feature Completeness + Visual Design (v3)

Read this alongside CLAUDE.md. The platform is live in production. This
phase closes every remaining gap against the old Google Sheet, adds
analysis the sheet never had, and replaces the default-Tailwind look with
a real visual identity.

**Who this is written for:** unattended execution by a smaller model than
the one that wrote it. Every ambiguous decision has already been made and
is written down below — palette hexes, component APIs, test fixtures with
exact expected values, seed data, edge cases. Implement as given rather
than riffing. If you hit something genuinely not covered, make the most
reasonable call, record it in the progress log, and keep going.

---

## Ground rules for this unattended run

1. **Progress log + resume protocol.** Before anything else, create
   `PHASE7_PROGRESS.md` at the repo root containing the section checklist
   from this file (§0–§9, unchecked). At the START of every session, read
   that file first and work only unchecked items. After finishing a
   section: check it off, add 1–3 lines of notes (decisions made, anything
   deferred), and include the file in that section's commit. This is what
   makes the run survivable across session limits and context compaction.
2. **One commit per section**, message format `phase7(§N): <summary>`.
   `npm test` and `npm run build` must pass before every commit. Never
   leave the repo broken between commits.
3. **Regression rule:** existing tests are the spec for existing behavior.
   Never edit an existing test to make new code pass — if a change breaks
   one, the change is wrong. New math goes in new files under
   `src/lib/math/`.
4. **Do not run `vercel --prod`.** Commit locally only. Deployment stays a
   manual, reviewed step. Also: never edit or print `.env*` contents, and
   never rotate or log secrets.
5. **Auth default for anything new:** every new route/page is owner-gated
   unless this file explicitly says it is public. The only public surface
   is `/share`. (A previous phase shipped an ungated root route; that class
   of bug is the one to be paranoid about.)
6. **Budget behavior:** if usage runs low, stop cleanly after the section
   you're on — finished, tested, committed, progress log updated — then
   write the final summary described in §9. Never stop mid-section.
7. "Verify empirically" appears below because a past phase assumed a
   Finnhub free-tier endpoint worked and it returned 403. Probe the real
   API before building on any assumption about it.

---

## §0. Preflight (cheap probes before heavy work)

Do these four things first; they de-risk everything after.

1. Confirm the repo is green as-is: `npm test`, `npm run build`.
2. **Probe Finnhub sector data once:** real request to
   `/stock/profile2?symbol=ASML` with the configured key. Record the HTTP
   status and whether `finnhubIndustry` is present in
   `PHASE7_PROGRESS.md`. This single probe decides which branch §4 takes —
   decide it now, not mid-build.
3. Confirm the `benchmarks` table has rows for all three of VOO, VTI, XLK
   across the snapshot date range (a simple count-by-ticker query).
   Expected: three tickers, ~20 dates each. This confirms §3 is UI-only.
4. Create `PHASE7_PROGRESS.md` with the checklist. First commit:
   `phase7(§0): preflight probes + progress log`.

---

## §1. Design System — build first, use everywhere after

**Direction:** dark, high-contrast "trading terminal" — the confidence of
a Bloomberg terminal with the polish of Linear or Vercel's dashboard.
Precise and a little intense; built for someone tracking real money. Not
corporate-flat, not playful. Dark is the only mode; do not build a light
toggle this pass.

### 1a. Tokens
Define as CSS variables in `globals.css`, exposed through the Tailwind
theme. **Never hardcode a hex in a component.**

```css
--bg:            #0A0A0F;   /* page background */
--surface:       #14141C;   /* card/panel background */
--surface-hover: #1B1B26;
--border:        #26262F;
--border-strong: #34343F;
--text-primary:  #F2F2F5;
--text-secondary:#9494A3;
--text-muted:    #5F5F6B;
--accent:        #7C6FFF;   /* links, active nav, focus rings */
--accent-glow:   rgba(124,111,255,0.35);
--gain:          #22D3A5;
--gain-bg:       rgba(34,211,165,0.12);
--loss:          #FF5C7A;
--loss-bg:       rgba(255,92,122,0.12);
```

Chart series colors (used only for chart series, nowhere else):
portfolio `#7C6FFF`, VOO `#22D3A5`, VTI `#FFB84D`, XLK `#4DD0FF`.
Line styles so color is never the only differentiator: portfolio solid
2px; VOO dashed `6 3`; VTI dashed `2 3`; XLK dash-dot `8 3 2 3`; all
benchmarks 1.5px.

Page background flourish (the cheap "not plain" win): a fixed,
non-interactive radial glow at the top of the page —
`radial-gradient(600px at 50% -100px, rgba(124,111,255,0.07), transparent)`
layered over `--bg`. Subtle; it should read as atmosphere, not a spotlight.

### 1b. Typography
- Numbers (every dollar, percent, headline figure, table numeral):
  `JetBrains Mono` via `next/font/google`.
- Everything else: `Inter` via `next/font/google`.
- Scale: headline figures `text-4xl font-bold` mono; section headers
  `text-xs font-semibold uppercase tracking-wider` in `--text-secondary`;
  table numbers `text-sm` mono right-aligned; labels/body `text-sm` sans
  in `--text-secondary`.
- Respect `prefers-reduced-motion` for all animation below.

### 1c. Formatting module (single source of truth)
Create `src/lib/format.ts` and route ALL display formatting through it:
- `fmtUSD(n)` → `$1,234.56` / `-$1,234.56` (always two decimals).
- `fmtPct(n, {signed, decimals})` → headline figures signed with two
  decimals (`+11.32%`, `-2.81%`); dense table cells signed with one
  decimal (`+28.4%`).
- `fmtDate(d)` → `Jul 22, 2026`; chart x-axis short form `Jun 24`.
Grep-check at the end of the phase: no `toFixed(` or `toLocaleString(`
calls in components outside this module.

### 1d. Layout shell
- Sticky top nav, `h-14`, background `rgba(10,10,15,0.8)` with
  `backdrop-blur`, `border-b` in `--border`. Left: an 8px rounded square
  in `--accent` + "Portfolio Tracker" wordmark (sans, semibold). Right on
  private pages: Dashboard / Trades links + Sign out; active link
  `--text-primary` with a 2px `--accent` underline, inactive
  `--text-secondary`. On `/share`: wordmark + a "Read-only" chip, no nav.
- Content: `max-w-6xl mx-auto px-4 sm:px-6`, sections `space-y-8`.
- Stat-card grid: `grid-cols-2 sm:grid-cols-3 xl:grid-cols-6`.
- Tables on mobile: horizontal scroll with a sticky first (ticker) column.

### 1e. Components (hand-roll these four in `src/components/ui/`; don't
pull in a component library for them)
- `<Card>` — base surface: `--surface`, `rounded-xl`, `p-6` (`p-8` for
  headline stats), `1px solid var(--border)`; on hover border →
  `--border-strong` + soft `--accent-glow` shadow, 150ms ease.
- `<StatCard label value sublabel? delta?>` — label (section-header
  style), big mono value, optional `<DeltaChip>`. Value changes animate as
  a ~400ms count-up/down via a small custom hook (skip under
  reduced-motion).
- `<DeltaChip value percent?>` — pill, `rounded-lg`, `--gain-bg`/`--loss-bg`
  background, `--gain`/`--loss` text, tiny up/down triangle from
  `lucide-react` (add as a dependency). Sign always shown.
- `<DataTable>` — `--border` row dividers, right-aligned mono numeric
  columns, row hover `--surface-hover`, header row in section-header type.

Loading states: shimmer skeleton blocks in `--surface-hover`. The
existing "Prices as of <date>" stale notice becomes a muted chip with a
small clock icon.

### 1f. Charts (Recharts)
Dark theme everywhere: gridlines only, in `--border`; no heavy axis
lines; tick labels mono `text-xs` in `--text-muted`; ≤5 y-ticks;
`type="monotone"` curves; area charts get a gradient fill from the series
color to transparent. Custom tooltip component: small `--surface` card,
`--border-strong` border, mono values — never the default white Recharts
tooltip. Legend rendered as pill chips above the chart; clicking a chip
toggles that series' visibility (simple useState).

**Definition of done for §1:** tokens + fonts wired; four components
exist and render on a scratch page; format module exists; nav shell live
on all three pages; no visual feature work yet.

---

## §2. Privacy matrix for everything new

`/share` hides dollar amounts. Every §3–§7 feature must obey this table;
re-verify it in §8.

| Element | Private dashboard | /share |
|---|---|---|
| Benchmark chart (indexed %) | full | full |
| Beta table + excess returns | full | full |
| Sector weights | full | full |
| AI-exposure weights | full | full |
| Correlation heatmap | full | full |
| Composition donut | tooltip shows $ value | tooltip shows weight % only |
| Realized / unrealized split | dollar StatCards | percent-of-invested only, no dollars |

---

## §3. Three-way benchmark comparison (VOO, VTI, XLK)
Data already exists (§0 probe #3 confirms). UI/analytics only:
- Value-over-time chart gains VTI and XLK lines using §1 series
  colors/dashes, with the toggleable pill legend.
- Beta vs each of the three benchmarks — a small three-row table (mono
  values), not a relabeled single number. Reuse the existing beta
  function; do not fork the math.
- Excess return: TWR minus each benchmark's same-period return, three
  `<DeltaChip>`s labeled "vs VOO / vs VTI / vs XLK".

**Done when:** chart shows four toggleable series; three betas and three
excess returns render on both dashboard and /share.

---

## §4. Sector & industry classification (automatic)
Branch on the §0 probe result:
- **Probe succeeded:** fetch `profile2` per held ticker, cache in a new
  `ticker_sector` table (ticker PK, sector, fetched_at). Refresh only
  when a trade introduces a new ticker — never on page load.
- **Probe failed (403 etc.):** use the seed below as `data/sectors.json`
  and note the fallback in the progress log. New tickers show
  "Unclassified" until the file is updated — visibly, never silently
  omitted.

```json
{
  "ASML": "Semiconductor Equipment", "CBRS": "Semiconductors (AI)",
  "GOOG": "Communication Services", "INTC": "Semiconductors",
  "MEI": "Electronic Components", "KYMR": "Biotechnology",
  "MSFT": "Software — Infrastructure", "ORCL": "Software — Infrastructure",
  "IBM": "IT Services", "SPCX": "Aerospace & Defense",
  "NBIS": "AI Cloud Infrastructure", "CRM": "Software — Application",
  "COST": "Consumer Staples"
}
```

UI: horizontal bar list of sector weights (position values summed by
sector / total), bars in `--accent` at graded opacity, mono percentages
right-aligned. Same treatment for §5.

**Done when:** sector weights render on both pages from cached/seeded
data; zero Finnhub calls on page load.

---

## §5. AI-exposure classification (seeded)
Create `data/ai-exposure.json` exactly:

```json
{
  "ASML": "High", "CBRS": "High", "GOOG": "High", "INTC": "Medium",
  "MEI": "Low", "KYMR": "None", "MSFT": "High", "ORCL": "High",
  "IBM": "Medium", "SPCX": "Medium-High", "NBIS": "High", "CRM": "Medium",
  "COST": "None"
}
```
(These reflect actual research on the current holdings, not placeholders.)
Weight breakdown by exposure level, same bar-list treatment as §4.
Unlisted tickers → "Unclassified", shown plainly.

---

## §6. Correlation matrix between holdings
New pure function, new file `src/lib/math/correlation.ts`:

```ts
correlationMatrix(
  returnsByTicker: Record<string, { date: string; r: number }[]>,
  minOverlap = 5
): { tickers: string[]; matrix: (number | null)[][] }
```

Rules the implementation must follow:
- Pairwise: for each ticker pair, use only DATES BOTH have a return for.
  Holdings were bought on different days, so overlap windows differ per
  pair — this alignment is the whole trick.
- Fewer than `minOverlap` shared observations → `null` for that cell
  (renders as a muted "—"). **COST was bought 2026-07-22 and has
  essentially no return history — every COST pair must come out null, not
  NaN and not a crash.** Constant series (zero variance) → `null` too.

Unit tests against exact fixtures (same rigor as the Phase 2 math):
- `corr(A, A) = 1.0` exactly, any non-constant A.
- `corr([1,2,3,4], [2,4,6,8]) = 1.0` exactly.
- `corr([1,2,3], [3,2,1]) = -1.0` exactly.
- `corr([1,2,3], [1,3,2]) = 0.5` exactly (hand-derived: deviations
  (-1,0,1) and (-1,1,0); covariance 1; each stddev term √2; 1/(√2·√2)).
- A pair with 3 overlapping dates and `minOverlap = 5` → `null`.

UI: lower-triangular heatmap. Diverging color scale — `-1` → `--loss`
tint, `0` → `--surface`, `+1` → `--accent` tint — because NEGATIVE
correlation is meaningful here, not just strength. Mono ticker labels,
rounded cells, hover tooltip with the exact value, nulls as "—" in
`--text-muted`.

**Done when:** tests pass including the exact fixtures; heatmap renders on
both pages; COST row/column is all "—" and nothing crashes.

---

## §7. Composition donut + realized/unrealized split
**Donut** (the pie chart from the original sheet — the export was
text-only so the exact original isn't recoverable; weight-by-ticker is
the standard reading, and if it was something else, e.g. by sector,
that's a one-line follow-up swap — note it in the summary):
- Donut with ~60% inner radius, all 13 tickers, sorted descending by
  weight, §1 palette. Center label: "13 positions" (count is
  privacy-safe on both pages). Legend: right side on desktop, below on
  mobile — ticker + weight %, mono. Hover: slice highlight + tooltip per
  the §2 privacy matrix (dollars privately, weight-only on /share). No
  labels drawn on thin slices; the legend carries them.

**Realized vs unrealized:** replace the single combined figure with two
`<StatCard>`s — Realized (closed positions, from `trades`) and Unrealized
(mark-to-market on current holdings) — combined total as a sublabel. On
/share: percent-of-invested only, per §2.

---

## §8. Final integration pass
One sweep across `/`, `/share`, `/trades`:
- Every number goes through `src/lib/format.ts` (grep per §1c).
- Every figure uses `<StatCard>`/`<DeltaChip>`; every table `<DataTable>`;
  no default-Tailwind blue, no unstyled remnants, no white tooltips.
- Mobile at 390px width actually works — `/share` especially, since
  family opens it on phones: nav, donut legend, sticky-first-column
  tables, heatmap scroll.
- Privacy re-check against the §2 matrix, and confirm logged-out `/`
  still shows only the sign-in gate (the root-route lesson).
- If a browser/screenshot tool is available in this environment, capture
  each page at desktop and 390px widths into `docs/screenshots/`; if not,
  skip without failing.

---

## §9. Final summary (required output of the run)
End with: sections completed vs remaining; the §0 probe result and which
§4 branch was taken; any judgment calls made (each also in the progress
log); test count before → after; and this open question surfaced to
Devan rather than decided: **per-stock price targets and exit levels**
were on his original wishlist — distinct from the thesis journal he cut,
but adjacent — build or skip? Do not build them this pass.
