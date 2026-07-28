# Phase 10 §9 handoff: Claude Lead (`specify`) → Codex Implementation (`implement`)

Prepared July 28, 2026 by `claude-code/opus-5`.

## Outcome

Spec ready for implementation. `docs/phase10-workflow/specs/section-9.md` is
written and committed; `PHASE10_STATE.json` routes §9 to Codex Implementation
at `stage: implement`.

## What this turn did

- Preflight clean: no `STOP`; `PHASE10_LOCK` present with `owner=claude`;
  `git status --porcelain` empty; state at `role: claude_lead` /
  `stage: specify` / `status: ready`; zero prior same-day `-to-devan` handoffs
  for §9, so the retry budget is intact.
- Invoked the project `portfolio-ux` skill via the `Skill` tool (not the
  documented fallback read of `SKILL.md`) before any spec work, and applied it
  beneath the §9 authority order.
- Read the full authority chain: `AGENTS.md`, `PHASE10_PROGRESS.md`,
  `PRODUCT_DIRECTION.md`, `docs/PHASE10_UX_ARCHITECTURE.md`,
  `docs/PHASE10_AGENT_WORKFLOW.md`, `PHASE10.md` §9,
  `UNIVERSE_ROUND2_BRIEF.md`, `UNIVERSE_IDEAS_2.md` (including its §9 owner
  corrections and authorizations), `docs/reference/README.md`, and
  `docs/phase10-workflow/reviews/section-8-accepted.md`.
- Read the actual `/share` implementation before specifying against it:
  `OrreryScene.tsx`, `OrreryWorld.tsx`, `UniverseRoute.tsx`, `MissionControl*`,
  `src/lib/observatory/orrery.ts`, `src/lib/dashboard-data.ts`,
  `scripts/generate-planet-textures.mjs`, `assets/planet-textures/source/`,
  `public/textures/planets/`, and the existing share-page canary tests.
- Wrote the §9 specification: six work packages (A textures, B overview
  composition, C Mission Control, D planet detail, E moons/satellites/sector
  map, F sun docking + orientation) and **66 numbered acceptance criteria**
  across `PHASE10.md` §9's seven dimensions plus one bounded orientation
  criterion.
- Started **no** implementation. No application source, dependency, texture
  asset, or test was touched this turn.
- **Repository note:** a stale zero-byte `.git/index.lock` (created 01:13 EDT,
  immediately before this turn acquired `PHASE10_LOCK` at 01:14) blocked the
  first `git add`. `ps` confirmed no `git` process and no other Claude/Codex
  process was running against this working directory — only this turn's own
  CLI. The stale lock was removed and the commit proceeded. Recorded here
  rather than silently repaired; if this recurs, the runner script's git
  invocation is the place to look.

### Four premises corrected before scope (spec §0)

These matter because implementing against the stale picture would waste a
round:

1. **The KTX2 pipeline is not Basis.** `UNIVERSE_IDEAS_2.md` §9.1 infers UASTC
   from the observed ~1.28 B/px. The generator actually uses three.js's
   `KTX2Exporter` (uncompressed RGBA8) plus `KHR_SUPERCOMPRESSION_ZSTD`; there
   is no Basis encoder in the repo and no transcoder under `public/`. The
   owner's *lever* (compression before resolution) and his *binding
   instruction* (measure; if over ~15 MB, reduce rather than absorb) are
   carried through in full as a three-step ladder — but "switch to ETC1S" is
   specified as a hypothesis to test and record honestly, not a known step.
2. **The shipped textures are procedural noise.** `sample()` synthesises every
   pixel from `Math.sin`/`Math.cos` seeded by an FNV hash of the ticker; the
   authored plates in `assets/planet-textures/source/` are only blended in as
   a tint. That is the mechanical reason for the owner's "ambiguous garbage"
   verdict, and §3 replaces it with the authored plate as the real source.
3. **`docs/reference/README.md`'s no-logo caution is superseded for §9** by
   `UNIVERSE_ROUND2_BRIEF.md` §1 and `PHASE10.md` §9. Real branding is
   authorized. That README is §8's record and must not be edited.
4. **Part of the round-2 wish list already shipped in §8 remediation** —
   below-planet identity-tinted labels with no scrim, the sun's dashed docking
   ring, and `fog: false` on the ring/trail materials. §9 specifies only the
   remaining deltas on those surfaces.

## Evidence

- Commit (prior actor): `a8b18070605747dde4cae7c45bfa917971d0c213` —
  `chore: scoped Codex local-dev permissions so implementation turns can
  self-verify`
- Spec doc: `docs/phase10-workflow/specs/section-9.md`
- Validator: `node scripts/phase10-validate-state.mjs` exits 0.
- Tests / build: not re-run this turn. This is a spec-only commit that touches
  no implementation source, per `docs/PHASE10_AGENT_WORKFLOW.md` §8. The last
  recorded green state is `6a68758` (87 files, 474/474 tests; Next.js 16.2.11
  Turbopack build clean, 24 routes).
- Screenshots: none. No UI changed this turn.

## For the next actor

`PHASE10_STATE.json` now reads `current_section: §9`, `stage: implement`,
`role: codex_implementation`, `next_actor: codex`, `status: ready`,
`section.spec_doc: docs/phase10-workflow/specs/section-9.md`.

Implement to that spec. Section-specific context worth naming here:

- **Sequence matters.** Spec §14 front-loads work package A (textures) because
  it carries the owner's loudest complaint *and* the riskiest measurement. Run
  the byte ladder and record the numbers before spending time on art.
- **The byte budget is the binding gate, the resolutions are targets.**
  ≤ 15,000,000 bytes total under `public/textures/planets/`, measured on disk.
  Today's measured total is 3,424,390 bytes at 512×256. If the directed
  2048×1024 base does not fit, step down the ladder and record each measured
  total — shipping under the directed resolution after an honest measurement
  is an expected outcome; shipping over 15 MB is a failure. Do not fabricate a
  compression result, and do not add a network-dependent build step.
- **No `expect(source).toContain(...)` for rendered behaviour.** Spec §10.1
  gives the mechanism: a new pure `src/lib/observatory/scene-model.ts` that
  computes the complete scene descriptor tree from data, which `OrreryScene`
  then consumes without recomputing anything inline. The five existing
  source-string guards cover surfaces §9 rewrites and must be replaced with
  scene-model, DOM, or pixel assertions — with no loss of covered behaviour.
- **Two new public disclosure surfaces.** The public captain's log
  (`date`/`action`/`ticker`/`impactPct`/`realizedSign` only — spec §9.1
  defines `impactPct` exactly, as a ratio so no dollars cross) and public news
  for held tickers. Both need extended canary coverage in
  `src/app/(depth-pull)/share/page.test.tsx`, and a news-source failure must
  degrade to no moon plus a `NO TRANSMISSIONS` line rather than breaking the
  scene.
- **D1 is a do-not-touch.** The unreproduced green-trail report means
  trail/orbit **sign→colour** and **sign→direction** logic must not change in
  §9. Trail weight, length, and glow are in scope; the mapping is not. If the
  owner names a contradicting ticker mid-section, stop and treat it as severe.
- **D2 is closed by exactly one criterion** (66, the persistent OVERVIEW
  orientation line). It is not a licence for unscoped restructuring.
- **Standing gates unchanged:** route-owned long task < 50 ms on the §2.3.2
  rig re-measured after the texture change; `canvas` count 0 at 390 px and
  320 px with no mobile 3D; semantic DOM as the accessible source of truth;
  contrast by computed WCAG ratio from source tokens.
- Spec §2.2 lists what must **not** be touched, including the two deferred
  plot linkages, additional sector systems beyond one, and
  `src/components/surface/PortfolioOrrery.tsx`.

`npm test` and `npm run build` must be green before the implementation commit,
which uses `phase10(§9): <summary>`.

## Decision needed (only if status = blocked)

Not applicable — `status` is `ready`.
