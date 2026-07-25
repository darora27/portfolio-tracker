# Phase 10 §7 handoff: Claude Lead → Devan (blocked, not routed to Codex)

Prepared July 25, 2026 by `claude-code/sonnet-5`.

## Outcome

blocked — see Decision needed. Section §7 remains **not accepted**. This
turn independently reviewed Codex's Turn B′ remediation
(`dc358a6237b084e3fd3f1e19f1a74ac185868573`, `phase10(§7): remediate R3F and
build Portfolio Orrery`) — the owner-gated Portfolio Orrery build plus the
described R3F long-task optimisation and parallax fix — and re-ran every
live measurement the Codex sandbox could not complete. One finding
(the R3F long task) is reported directly to Devan rather than resubmitted
to Codex, because the spec's own escape hatch for this exact outcome names
Devan, not another remediation attempt, as the next step. A second,
independently fixable finding is also recorded so it isn't rediscovered
piecemeal later.

## What this turn did

- Read `section-7.md` §0 (turn structure), §R (the normative Orrery spec),
  `PRODUCT_DIRECTION.md`'s "The Portfolio Orrery" and "Runtime and
  resilience" sections, `docs/PHASE10_UX_ARCHITECTURE.md` §3.1, and the
  Turn B′ handoff before touching anything.
- Confirmed the diff since Turn B's own review commit touches only
  spike/remediation files and the new `/dev/phase10-portfolio-orrery`
  route — no production Observatory file, so this is Turn B′'s review, not
  Turn D.
- Ran `npm test` (446/446) and `npm run build` (green, 19 routes) on this
  machine — both complete cleanly here, closing the environment gap the
  Codex sandbox hit.
- Found and stopped an unrelated stale `next-server` process already
  listening on port 3100 (started ~08:35, serving a build that 404'd on the
  new route) before starting a fresh server for live verification. No
  repository state was affected.
- Started a real production server with a task-only `OWNER_PASSWORD`
  process override (never read from `.env*`) and authenticated via
  `POST /api/auth/login`, matching the standing local-auth pattern used by
  every prior section's live-verification pass.
- Re-ran `docs/phase10-spike-section-7/measure-desktop.mjs` (as
  `measure-desktop-turn-bprime.mjs`, output path only difference) against
  the remediated `/dev/phase10-spike-r3f-world`: **the long task is
  unchanged — 59, 59, 60, 59, 59 ms, 5/5 runs**, byte-for-byte the same as
  the pre-remediation FAIL measurement.
- Independently verified live: pointer parallax on both
  `/dev/phase10-portfolio-orrery` and `/dev/phase10-spike-r3f-world` (two
  layers, different magnitudes, multiple pointer positions — closes that
  half of Turn B's original Finding 2); the sun and every planet
  activate by click/keyboard, open the correct inspector content, and are
  URL-restorable with working back/forward; reduced motion, forced
  `?no3d=1`, and mobile (390px/320px) all correctly render zero `canvas`
  elements with no horizontal overflow and no sub-44px targets; zero dollar
  patterns and zero owner-only fields anywhere in authenticated or
  unauthenticated HTML; zero console errors across every capture.
- Captured and committed all eight required §R.11 visual-evidence items
  (screenshots + two filmstrips), which the Turn B′ handoff explicitly
  could not do itself.
- Found, during that same visual inspection, that §R.10's required star
  field, restrained bloom, and atmospheric rim lighting are essentially
  absent from the R3F canvas (Finding 2, below) — recorded as a second,
  ordinarily-fixable finding.
- Wrote the review doc, updated `PHASE10_STATE.json`
  (`status` → `blocked`, `next_actor` → `devan`), and this handoff. Changed
  no file under `src/`.

## Evidence

- Commit: (this turn's own — not yet created; see the state file's note on
  never writing a commit's own hash into itself)
- Reviewed commit: `dc358a6237b084e3fd3f1e19f1a74ac185868573` —
  `phase10(§7): remediate R3F and build Portfolio Orrery`
- Tests: `npm test` — 81 files, 446/446 passed
- Build: `npm run build` — Next.js 16.2.11 compiled, TypeScript passed, 19
  routes generated
- Review doc: `docs/phase10-workflow/reviews/section-7-review-2.md`
- Evidence: `docs/phase10-baseline/section-7/README.md` ("Turn B′ review
  evidence" section), screenshots under
  `docs/phase10-baseline/section-7/screenshots/orrery-turn-bprime/`,
  filmstrips under `docs/phase10-baseline/section-7/filmstrips/`
- Long-task raw data:
  `docs/phase10-spike-section-7/raw/desktop-scene-turn-bprime.json`

## Decision needed

The R3F route-owned long task on `/dev/phase10-spike-r3f-world` is
**59-60ms in 5/5 runs**, identical before and after Codex's described
optimisation round (removed the `THREE` namespace import, reused camera
vectors, reduced icosahedron subdivision, fixed `dpr={1}`, deferred the
lazy scene request across two paint frames). Those changes are real and
independently confirmed in the diff, but none of them reduce the duration
of the task once it runs — only when it's scheduled. This is consistent
with the cost being dominated by parsing/evaluating the ~234 KB
three.js/R3F chunk and WebGL/shader initialization under CPU 2× throttling,
which nothing in the attempted round touches.

Per `section-7.md` §R.8 and `PRODUCT_DIRECTION.md`'s "Runtime and
resilience" section, this exact situation — one authorized optimisation
round, no measurable improvement — is defined in advance as a stop-and-ask
point, not a second Codex remediation loop: "If one bounded optimisation
round cannot bring it under the gate, return the measured result to Devan
for an explicit decision — do not silently select CSS." This turn does
that rather than guessing at which of the following you'd prefer:

1. **Accept a §1-style documented exception for §7's R3F long task**,
   analogous to `docs/phase10-handoffs/2026-07-24-section-1-claude-refiner-to-devan-blocked.md`'s
   resolution — record the absolute 50ms boundary as still failing on its
   own terms, but replace it with a narrower, non-generalizing replacement
   gate specific to this route if you're satisfied the cost is an
   irreducible chunk-load/WebGL-init floor rather than anything the Orrery
   itself does wastefully. (Not yet investigated: whether the ~234 KB chunk
   itself can be reduced, e.g. by dropping unused three.js modules from the
   bundle — that's a different lever than the scene-construction
   optimisations already attempted, and wasn't tried this round.)
2. **Authorize a second, differently-scoped optimisation attempt** — e.g.
   investigating the R3F/three.js chunk's own contents for reducible
   imports, rather than only the scene-construction code that was tuned
   this round.
3. **Fall back to the CSS shell as the Orrery's primary desktop
   presentation** instead of R3F, reusing the already-passing CSS
   parallax/depth machinery and building the solar-system visual in CSS 3D.
   This would be a real product-direction change from `PRODUCT_DIRECTION.md`'s
   "R3F is the intended visually dominant desktop approach" and would need
   your explicit sign-off, not an agent's inference.
4. Something else you'd rather direct.

Separately (not blocking, but should be folded into whatever comes next):
**Finding 2** — `section-7.md` §R.10 requires "an emissive sun, atmospheric
rim lighting, depth, restrained bloom, and a coherent star field —
replacing the generic low-poly placeholder spheres that failed review."
The emissive sun and per-planet material variation are genuinely present;
the star field, bloom, and rim lighting are not (confirmed by source grep
and by direct visual inspection of the committed screenshots). Given that
"low-quality generic spheres" was half of the reason both original
prototypes were rejected, and the *portfolio-purpose* half of that defect
is now clearly fixed while the *visual* half is not, this is worth
addressing regardless of which option you choose above — it isn't
contingent on the runtime decision.

## For the next actor

Whoever resumes this section next reads the latest state
(`PHASE10_STATE.json`, `stage: review`, `status: blocked`) and this
handoff — do not restart from Turn A or re-run the spike decision procedure
(`docs/phase10-spike-section-7/DECISION.md` is unaffected by any of this).
Once Devan decides Finding 1, the natural next turn is a bounded
remediation pass (whichever runtime/approach is chosen) that also closes
Finding 2, followed by another Claude Lead review pass before this section
can reach Turn C (production wiring into `/share`).
