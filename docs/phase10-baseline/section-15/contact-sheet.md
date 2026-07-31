# §15 contact sheet — review round 2 (re-review of F1 remediation)

Captures from this round only (`docs/phase10-baseline/section-15/review-2/`).
Round 1's own visual evidence (`docs/phase10-baseline/section-15/*.png`,
`docs/phase10-baseline/section-15/review/*.png`) remains valid for every
criterion not revisited here — see `section-15-review.md` and
`section-15-review-2.md`.

1. `review-2/private-CRM-45deg-before.png` — private mode, Mission Control
   ORBITS radar, immediately before a double-click at 45° on CRM's own ring
   stroke. Evidences `BHV-08`/`VIS-08`: the subsequent double-click at this
   exact point navigated to `/stock/IBM`, not `/stock/CRM`.
2. `review-2/public-CRM-45deg-before.png` — same point, public/`/share`
   mode. Evidences `VIS-08`'s negative-capture half: the click still
   resolved to the wrong ticker's pre-existing destination
   (`?holding=IBM&camera=approach`), confirming the misroute is
   mode-independent.
3. `review-2/private-CBRS-45deg-before.png` — private mode, CBRS's own ring
   at 45°. Evidences the same defect recurring on a second ring
   (`/stock/INTC` instead of `/stock/CBRS`), showing this is not
   ticker-specific.
4. `review-2/public-CBRS-45deg-before.png` — same point, public mode.
   Evidences the mode-independence of the CBRS/INTC misroute.

Supporting non-visual evidence for the same finding (numeric, not pixel,
kept alongside for traceability): `review-2/raw-radar-ring-sweep.json` (a
24-angle-per-ring hit-test sweep showing 0/24 wrong for the four smallest
rings but 4/24–12/24 wrong for the five largest), and
`review-2/raw-confirm-diagonal-misroute.json` (the real double-click
confirmation behind captures 1–4).
