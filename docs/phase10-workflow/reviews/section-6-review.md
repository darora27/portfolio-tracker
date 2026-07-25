# Phase 10 §6 review — `/dashboard` first-layer hierarchy

Reviewed by: claude-code/sonnet-5 (Claude Lead, `review` stage)
Reviewed commit (this turn's clean starting HEAD, recorded as
`section.implementation_commit`): `3806060b811d2d27ec3e2844390ce63e8e75a175`
("`phase10(§6): prioritize dashboard questions and analytics`")
Spec: `docs/phase10-workflow/specs/section-6.md`

## Result: PASS — no findings

Every acceptance criterion in §7 of the spec was independently checked
against source, tests, and a real running instance of the application
(production server, real login, Playwright-driven browser at 1440×900 and
390×844). The implementation carried a documented browser-evidence gap
from the Codex implementation runner's CLI environment (no browser backend,
localhost bind denied); this review closes that gap directly rather than
accepting it as given, per the standing prompt's requirement that Claude
Lead perform every missing live check before recording PASS.

## What this review did

- Read the complete §6 spec (`docs/phase10-workflow/specs/section-6.md`)
  and the full diff since `prev_actor_commit`
  (`45b7d694ed013fca408ae60bc063a64dc9d9b5f0..HEAD`, 23 files changed).
- Invoked the `portfolio-ux` skill (this section changes user-facing UI)
  and applied it beneath the spec's own bounded scope — it produced no new
  criteria beyond what the spec already states, as required.
- Independently ran `npm test` (73 files, 414/414 passed) and a clean
  `npm run build` (`.next` removed first; Next.js 16.2.11 compiled,
  TypeScript passed, 16 static-page tasks generated, `/dashboard` remained
  dynamic) on this turn's own clean starting HEAD.
- Read every new/changed source file directly:
  `src/lib/dashboard-hierarchy.ts`,
  `src/components/dashboard/DashboardModeSwitcher.tsx`,
  `src/components/dashboard/MetricDisclosure.tsx` +
  `metric-disclosure.module.css`, `src/components/dashboard/RiskPanel.tsx`,
  `src/app/dashboard/page.tsx`, `HowAmIDoingMode.tsx`, `WhyMode.tsx`,
  `AttentionMode.tsx`, `AllAnalyticsView.tsx`.
- Grepped for `--obs-*` token references under `src/components/dashboard/`
  (zero matches) and confirmed `package.json`/`package-lock.json` are
  unchanged since `prev_actor_commit`.
- Performed every live browser check the implementation's evidence report
  flagged as an unproduced gap: temporarily installed `playwright` with
  `npm install --no-save` (removed again after; manifests confirmed
  unchanged via `git diff --quiet`), started a real production server with
  a temporary localhost-only `OWNER_PASSWORD` override, logged in through
  the actual `LoginForm`, and captured/measured all required desktop and
  mobile evidence. Full detail and raw results are in
  `docs/phase10-baseline/section-6/README.md` and
  `docs/phase10-baseline/section-6/claude-lead-live-check-results.json`.

## Acceptance criteria — spot check against evidence

All 37 criteria in the spec's §7 were checked; the following is not
exhaustive prose repetition of the spec but records the specific evidence
for each dimension:

- **Behavioral (1–10):** Confirmed live at all four `mode` values plus an
  invalid value (defaults to `how`, HTTP 200, no crash). Headline numbers
  are pixel-identical across every mode (same `LiveHeadlineStats` outside
  all branches). `explain=sharpe` in `mode=analytics` opens Sharpe
  pre-expanded with its heading focused; the same param in `mode=how` opens
  nothing (`cross-view-explain-how-panel-count: 0`). `AllAnalyticsView`
  renders all 18 relocated components across exactly four groups with no
  duplication (direct source read against the spec's §6.4 table).
  Unauthenticated branch unchanged (direct diff read — zero lines changed
  in that branch).
- **Visual (11–15):** Screenshots at 1440×900 for How/Why/Attention/
  Analytics(Risk)/Analytics(Sharpe expanded) show exactly one dominant
  visual and ≤3 facts per mode, a labeled four-group analytics index, and
  the unchanged dark deep-tier palette throughout (zero `--obs-*` grep
  hits). Before/after screenshots exist per item 15 (before: retained §0
  baseline; after: this turn's captures).
- **Mobile (16–19):** 390×844 captures for all four views plus the expanded
  disclosure all show `scrollWidth === clientWidth === 390` (measured live,
  not inferred). Every switcher link and disclosure trigger/Close/permalink
  measured at exactly 44px height at 390px. Full-page mobile captures for
  `how` and `attention` confirm the complete lead/facts/chart/continuation
  sequence renders below the fold without truncation.
- **Accessibility (20–25):** One `<h1>` ("Dashboard"), one `<h2>` per active
  view, `<h3>` group labels in Analytics — confirmed by direct screenshot
  and source read. `DashboardModeSwitcher` uses real `<Link
  aria-current="page">`s. `MetricDisclosure`'s trigger is a labeled
  `<button>` with correct `aria-expanded`/`aria-controls`; live keyboard
  test confirmed `Enter` opens and moves focus to the panel heading,
  `Escape` closes and returns focus to the trigger. Attention severity
  prefixes ("Notice:"/"Critical:") render as visible text, confirmed in the
  attention screenshot. 200% zoom (emulated via viewport halving, this
  project's established technique) shows no clipping or overflow.
- **Tests (26–31):** All eleven new/changed test files listed in the spec's
  §8 exist; `npm test` is 414/414 green across 73 files (up from the §5
  baseline), including the new dashboard-area suites. No existing test was
  weakened or skipped (full-suite pass, not a scoped rerun).
- **Build (32–34):** Clean build passes; `package.json`/`package-lock.json`
  are byte-identical to `prev_actor_commit`; no new runtime dependency.
- **Privacy (35–37):** `/dashboard` is unchanged in its `isValidSession`
  gate and `force-dynamic` export (direct source read); no new route
  segment was created (all four views live under `/dashboard` via `?mode=`);
  nothing in this section touches `/share`, `/share/full`, or the public
  Observatory chapters (confirmed by diffstat — no file under those paths
  changed except none at all).

## One implementation deviation from the spec's literal text — reviewed and accepted

Spec §5 writes `RiskPanel`'s new props without explicit optionality markers
except `explainOpenId`. The implementation made all four new props
(`historyDays`, `dailyChangeAsOf`, `pricesAsOf`, `explainOpenId`) optional
and gates `MetricDisclosure` rendering on `historyDays !== undefined &&
dailyChangeAsOf !== undefined`, falling back to the pre-existing `Metric`
tiles otherwise. This is necessary, not a scope violation: `RiskPanel` is
also used by `src/app/share/full/page.tsx`, which the spec explicitly places
out of scope ("`/share/full` — unaffected; that route's own migration is
§3's decision, already settled, not reopened here"). Making the props
required would have forced editing that out-of-scope call site. Verified
directly: `/share/full/page.tsx`'s `<RiskPanel>` call passes none of the new
props and is otherwise byte-identical to before this section, so it
continues to render the legacy compact tiles. This satisfies both the
spec's letter (§5's five `MetricDisclosure` replacements, for `/dashboard`)
and its explicit out-of-scope boundary; it is not a new criterion, just a
verification of how an already-stated constraint was correctly resolved.

## Findings

None.

## Acceptance record — July 25, 2026

§6 accepted. The review above records PASS with no findings. This
acceptance turn was executed by `claude/fable-5` running in Cowork,
directly instructed by Devan (owner-directed turn outside the fixed
runners; `PHASE10_LOCK` held for its duration). The `portfolio-ux` skill
was applied via its documented fallback (direct read of
`.claude/skills/portfolio-ux/SKILL.md`).

- Accepted commit (the review-pass commit, recorded per Trap B by this
  later turn, never self-referentially):
  `139da143f7e9de48215aa17a52313ab1946bca67`
  ("phase10(review §6): pass, no findings"). No implementation source
  changed between that commit and this acceptance.
- Acceptance-turn verification: this turn's sandbox cannot execute the
  repo's darwin-arm64 test/build binaries, so at Claude Lead's request
  Devan ran the gate on the working machine against this turn's working
  tree (HEAD `139da14` plus this turn's three then-uncommitted doc/state
  files): `npm test` — 73 files, 414/414 passed (Vitest 4.1.10);
  `npm run build` — Next.js 16.2.11 (Turbopack) compiled successfully,
  TypeScript passed, 16/16 static pages generated, route list unchanged
  with `/dashboard` still dynamic. Results pasted verbatim by Devan into
  the turn transcript.
- This same turn executed Devan's owner-directed roadmap amendment: new
  §7 "Spatial Observatory"; former §7 `/compare` renumbered to §8;
  former §8 + §9 consolidated into §9 (Phase A/Phase B) with the
  capability gate preserved; §10–§13 unchanged. See `PHASE10.md` and
  `docs/phase10-handoffs/2026-07-25-section-7-claude-lead-to-claude-lead.md`.
