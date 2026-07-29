# §11 remediation → Devan — needs capture and texture decision

Date: 2026-07-29
Role: `codex_implementation` / `remediate`
Actor: `codex/gpt-5`
Start commit: `92d13e0c26e06d77d8d112cb3dc951470fc321e8`
Route: `status=blocked`, `next_actor=devan`

## Outcome

This turn stopped at the exact guard in Devan's F3 amendment. It did not
regenerate, rewrite, or stage any planet texture.

Direct KTX2 decode and byte comparison of all eight shipped base maps found:

- ASML, GOOG, MSFT, COST, INTC, and CBRS match their intended authored
  composites byte-for-byte and distinguish the mirrored alternative.
- IBM's supplied SVG alpha covers 100% of its mark canvas.
- NBIS's supplied SVG alpha covers 99.5211% of its mark canvas.
- IBM and NBIS therefore produce byte-identical normal/mirrored composites.
  No distinguishable mark shape reaches those two shipped textures.

Evidence:

- `docs/phase10-baseline/section-11/raw-shipped-mark-measurement.json`
- `docs/phase10-baseline/section-11/captures/all-eight-texture-marks.png`
- `docs/phase10-baseline/section-11/scripts/measure-shipped-marks.mjs`

This is a texture-pipeline defect, not an exposure or rotation-phase verdict.
Devan must decide whether a bounded repair to the IBM/NBIS alpha input or
compositor is authorized. No repair or regeneration was inferred here.

## Bounded remediation completed

- F1 / FB-05 was root-caused without another font nudge: Mission Control maps
  reading surfaces to the smallest 11px role even though the five-token ramp
  itself is present. The role remap remains scheduled for §12a. Evidence:
  `raw-mission-control-type-root-cause.md`. — done by `codex/gpt-5`
- F2 / VIS-10 approach framing now targets x approximately 30% from four orbit
  directions in deterministic projection coverage. — done by `codex/gpt-5`
- FB-17's right-anchored rail supports 460/520/580px variants and grows left.
  The capture harness records panel bounds and planet disc center for each.
  — done by `codex/gpt-5`
- F3's bounded camera/exposure slice adds selected-world approach exposure and
  retained 0°/120°/240° evidence-phase controls without faking production
  orbit behavior. — done by `codex/gpt-5`
- F4 / BHV-15's owner-directed Fable fix was re-run: MAX is absent when it
  duplicates SINCE BUY and differs in figure and SVG path when pre-purchase
  history exists. — verified by `codex/gpt-5`

## Live capture blocker

The production build and server started successfully. The retained Node capture
script was then run against `http://127.0.0.1:3000`. Cached Chromium 131 exited
before page launch:

`bootstrap_check_in com.google.Chrome.MachPortRendezvousServer... Permission denied (1100)`

No live pixel, geometry, screenshot, accessibility, or performance pass is
claimed. The exact failure is retained in
`docs/phase10-baseline/section-11/raw-remediation-browser-block.txt`.

Run these exact commands in separate terminals:

```bash
npm run build && npm run start
```

```bash
npm run phase10:capture -- --section 11 --base http://127.0.0.1:3000
```

The second command must produce the 460/520/580px panel captures, their raw
geometry, and ASML mark frames at 0°/120°/240°. If the IBM/NBIS pipeline repair
is not authorized first, those two worlds remain known failures regardless of
camera phase.

## Gates

- Focused verifier run: 3 files / 31 tests passed. — done by `codex/gpt-5`
- `npm test`: 106 files / 548 tests passed. — done by `codex/gpt-5`
- `npm run build`: exit 0; TypeScript, 18/18 pages, and `/share` smoke passed.
  — done by `codex/gpt-5`
- Both changed scripts pass `node --check`. — done by `codex/gpt-5`
- Acceptance check passed with the ledger's permitted incomplete implementer
  state on the five explicit non-passes BHV-11, BHV-05, VIS-10, VIS-02, and
  DEF-02. Their evidence records the failures, reviewer results are unchanged,
  and state routes to Devan rather than review. This does not weaken or relabel
  the gates. Full output:
  `docs/phase10-baseline/section-11/raw-remediation-gates.txt`.
  — recorded by `codex/gpt-5`

No `.env*` file was read, printed, edited, staged, or committed. No production
deployment command was run. The runner-owned `PHASE10_LOCK` was not edited or
released.
