# Phase 10 §7 — Codex Turn D remediation → Claude Lead review

Date: 2026-07-26

From: `codex/gpt-5`

To: Claude Lead

State: `§7` / `review` / `claude_lead` / `ready`

## Outcome

All three bounded findings from
`docs/phase10-workflow/reviews/section-7-review-4.md` have code remediations.
Tests and the production build are green. The Codex sandbox again denied
localhost binding, so the focus paths and mobile timing require independent
live verification in this review; this handoff does not claim those browser
checks passed.

## Bounded changes

- [x] Criterion 16: de-duplicate the pointerdown/click dismissal sequence and
  restore focus to `[data-portfolio-sun]` on the next animation frame, after
  browser default focus ordering. The Skip-button test now asserts
  `document.activeElement` is the portfolio sun — done by codex/gpt-5
- [x] Criterion 30 / §2.3.1: preserve the complete R.9 semantic mobile
  fallback while setting `prefetch={false}` on every Orrery Link, removing
  speculative holding/sun query RSC work from the Slow-4G `networkidle`
  path. A source-contract test covers every Orrery Link — done by codex/gpt-5
- [x] Criterion 20: extend `observatory-contrast.test.ts` with source-derived
  WCAG relative-luminance checks for `.signal` against the arrival surface
  and `.skip` against its alpha-composited real button surface — done by
  codex/gpt-5
- [x] No passing behavior outside the three review findings was changed:
  no R.9 content removal, scene/runtime/CSS change, financial or privacy
  change, dependency/manifest change, route change, or accepted chapter/deep
  route change — done by codex/gpt-5

## Verification

- [x] Focused tests: 3 files, 14/14 tests passed — done by codex/gpt-5
- [x] `npm test`: 82 files, 457/457 tests passed — done by codex/gpt-5
- [x] `npm run build`: Next.js 16.2.11 compiled; TypeScript passed; all 19
  static-page tasks generated — done by codex/gpt-5
- [x] `git diff --check`: clean — done by codex/gpt-5
- [ ] Live production verification: unavailable in Codex because
  `npm start -- -p 3100` failed with `listen EPERM: operation not permitted
  0.0.0.0:3100`; no live result was fabricated.

## Required Claude Lead checks

1. On a real production server and fresh sessions, verify focus lands on
   `[data-portfolio-sun]` after Skip-button click, window pointer dismissal,
   key dismissal, and natural timeout.
2. Rerun the unchanged §2.3.1 Moto G4 / CPU 4× / Slow 4G procedure with five
   fresh contexts against both this production build and the same real
   pre-Turn-C baseline (`799a124`). Confirm `goto` → `networkidle` no longer
   measurably regresses and retain the raw request/timing evidence.
3. Confirm both computed contrast assertions read their colors from the real
   CSS and remain ≥4.5:1.

## Scope note

The mobile performance remediation targets a specific avoidable inefficiency:
automatic speculative prefetch for the Orrery’s many query-state links. It
does not defer, remove, or simplify the required semantic holding list,
legend, inspector, or ordinary navigation. If the unchanged rig still shows a
reproducible regression after prefetch removal, follow Finding 4’s existing
escalation instruction rather than inventing another optimization round.
