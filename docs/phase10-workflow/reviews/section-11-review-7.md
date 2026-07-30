# Phase 10 §11 review (turn 7) — BHV-31 CLOSED (pass), MOB-11 opens 1 bounded finding, FAIL

Reviewed July 30, 2026 by `claude-code/sonnet-5` (Claude Lead, `stage: review`),
covering both roles under `single_provider_mode` (`PHASE10_STATE.json`
`applies_from: "§11"`).

- **Candidate SHA:** `e8faf0d3ae6ce7f14f9a9f0b44205f51f0b4ae77` — unchanged
  since review turn 6 (`phase10(§11): remediate F10 — ring far-side geometry,
  alpha, and width`). No remediation commit landed between review-6 and this
  turn; the only thing that changed was the owner's ruling on the two open
  spec questions (commit `8ce63e2`, `phase10(owner §11): rule on BHV-31 and
  MOB-11; unblock for accept`), which this turn grades against.
- **Spec:** `docs/phase10-workflow/specs/section-11.md` (now carries §11.0,
  the owner's two rulings)
- **Ledger:** `docs/phase10-workflow/acceptance/section-11.json`
- **Result:** **FAIL, not pass.** `BHV-31` is now gradable and **closes as a
  pass**. `MOB-11` is now gradable and **opens exactly one new bounded
  finding** — a narrow, real gap the corrected reading exposes rather than
  resolves away. The section cannot accept this turn.

## Independent gates

| Gate | Result |
|---|---|
| `npm test` | **PASS** — 107 files, 553 tests, zero failures (independent run, this turn) |
| `npm run build` | **PASS** — Next.js 16.2.11 production build, exit 0, 18/18 static pages, `/share` smoke pass (independent run, this turn) |
| Chromium launch, this sandbox | Confirmed directly, again — `npm run start -- -p 3300` against this turn's own build, then `node docs/phase10-baseline/section-11/scripts/review-7-mob11.mjs`. No in-app browser tool used. |

## `BHV-31` — CLOSED, pass

The owner's 2026-07-30 ruling (`docs/phase10-workflow/specs/section-11.md`
§11.0) sets the maximum acceptable pro-rata ratio drift at 0.02 (2.0
percentage points), citing review turn 5's own measurement. That measurement
is retained at `docs/phase10-baseline/section-11/raw-review-5-bhv30-31-keyboard.json`:
a real keyboard-driven edit (index 2 grown 14% → 49%) produced
`maxRatioDrift: 0.01835385316917465` among the seven untouched holdings.
0.0184 < 0.02 — **pass**, no new measurement needed (the owner did not ask
for a fresh run, and the number he ruled against is the same number already
on file). The siphon latch and pit-rail zeroing pieces of `BHV-31` were
already independently confirmed clean in review turns 4-5 and are unaffected.

## `MOB-11` — 1 bounded finding, fail

The owner's ruling resolves the *scope* ambiguity — the fallback does **not**
need to grow `CORRELATION`/`TRADES`/`ORBITS` — but does not by itself make
`MOB-11` pass. Re-ran the naming sweep fresh, this turn's own server, current
HEAD (`docs/phase10-baseline/section-11/scripts/review-7-mob11.mjs` →
`raw-review-7-mob11.json`), at both 390×844 and 320×844:

```
requiredNounsPresent: RETURNS, RISK, NEWS, EARNINGS
requiredNounsMissing: HOLDINGS, CORRELATION, TRADES
```

Unchanged from review turn 4's measurement — confirming this is not a stale
reading. Per the ruling, `CORRELATION` and `TRADES` missing is **not** a
finding (no new mobile surface required). `HOLDINGS` missing **is** a
finding: it is not a new section the fallback lacks content for — it is the
fallback's *primary* content, already fully rendered.

Read the source directly
(`src/components/observatory/orrery/OrreryWorld.tsx:347-458`): the fallback's
single `<nav aria-label="Portfolio bodies">` renders, in order, the sun
control, the per-ticker holdings `<ol className={styles.holdingList}>`, a
news list, belt bodies, then single-item links for `RETURNS`, `RISK`, and
`EARNINGS`. Every one of those sibling sections carries an explicit `"X /
..."` label prefix in its rendered text (e.g. `"RETURNS / VS VOO · SAME
PERIOD ..."`) — except the holdings list, which has no heading or label
anywhere before or around it. Checked the CSS module for a
`content:`-injected label on `.holdingList` — none exists. This is a genuine
gap, not a false positive: an existing, already-implemented section using no
current name at all, while every other section on the same page correctly
names itself.

**Finding MOB-11-1 (bounded).**
- **Criterion:** `MOB-11`
- **Evidence:** `docs/phase10-baseline/section-11/raw-review-7-mob11.json`,
  `docs/phase10-baseline/section-11/raw-review-7-fallback-390.png`,
  `docs/phase10-baseline/section-11/raw-review-7-fallback-320.png`,
  `src/components/observatory/orrery/OrreryWorld.tsx:347-458`
- **Required change:** add a `"HOLDINGS / ..."`-style label to the fallback's
  existing per-ticker list (`<ol className={styles.holdingList}>` in
  `OrreryWorld.tsx`), matching the label convention already used by its
  sibling sections (`RETURNS`, `RISK`, `EARNINGS`, `NEWS`). No other content
  change — do **not** add `CORRELATION`/`TRADES`/`ORBITS` sections; the
  owner's ruling explicitly excludes that.

## Not attempted this turn: full `--require reviewer` ledger check

Still not run to a clean pass. Review turn 6 deferred this "to whichever turn
actually attempts accept" — this turn does not attempt accept either (a new
bounded finding opened), so the deferral stands and carries forward again.
For scale: this turn also determined the pixel-evidence rule
(`workflow.owner_ledger`'s visual-truth check) applies to nearly every
criterion in this ledger, not just the ones tagged `dimension: visual` —
`verifier.kind: "browser"` alone triggers it, which is most of the matrix.
Closing that gap honestly (real pixel evidence per criterion, not a
bookkeeping rename) is a larger task than fits inside a turn that already has
a bounded finding to route; leaving it explicitly named here rather than
attempting a partial, unreviewed bulk rewrite of the ledger.

## Unchanged: five owner-carried criteria not reopened

`BHV-11`, `VIS-10`, `VIS-02`, `DEF-02`, `BHV-05` remain `carried_by_owner` —
this turn changed no logo mark, panel width, or Mission Control typography.

## For the next turn (codex_implementation, remediate)

Fix `MOB-11-1` only: add a `HOLDINGS`-style label to the fallback's existing
holdings list in `OrreryWorld.tsx`. Verify live at 390×844 and 320×844 that
`HOLDINGS` now appears in `document.body.innerText` alongside the other
already-present nouns, and that `CORRELATION`/`TRADES` remain correctly
absent (do not add them). Re-run `npm test` and `npm run build` before
committing. Do not touch anything else in scope — `BHV-31` is closed, and the
`--require reviewer` ledger-hygiene gap is explicitly out of scope for this
remediation round; it belongs to a future review/accept turn.
