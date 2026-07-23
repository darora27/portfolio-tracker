# Phase 10 §1 Codex Critic review

Reviewed July 23, 2026 by `codex/gpt-5`.

Builder candidate:
`507265d6e3427a414f2e2844d8513243ef348198`
(`phase10(§1): CSS 3D technical spike and production Observatory shell`).

## Result

**FAIL — route §1 to Claude Refiner. Do not begin §2.**

The candidate establishes a sound semantic foundation: five real chapter
links, one active article, client-enhanced focus restoration, a pure-CSS
flat fallback, owner-gated preview routes, no production R3F dependency,
and clean public/private render conditions. The critic independently
confirmed 278/278 tests, a successful Next.js production build, exact
390×844 and 320×844 shell fit without horizontal overflow, 44px mobile
chapter targets, click/back/forward focus restoration, owner gating, and
no strict currency or private-content leakage while logged out.

Five bounded acceptance failures remain.

## Scorecard

| Category | Result | Diagnostic | Evidence |
|---|---|---:|---|
| Product alignment | FAIL | 3/5 | The selected Night Orbit static concentric fallback is not present; the fallback is only a rectangular vertical link strip plus inspector. |
| Hierarchy | PASS | 4/5 | One active chapter, one inspector, and one observation plate dominate; supporting shell metadata is subordinate and the result is not a card wall. |
| Usefulness | FAIL | 3/5 | Chapter navigation drops private/forced-fallback state, and the retained spike links to a removed R3F route. |
| Originality | PASS | 4/5 | The desktop orbit and layered observation plate are specific to the Portfolio Observatory, map to real chapters, and do not copy reference branding or assets. |
| Accessibility and mobile | FAIL | 3/5 | Exact 390px/320px layout and targets pass in the critic's live run, but the 12.8px freshness label is only 3.82:1 and the required durable 390×844 evidence is absent. |
| Engineering reliability | FAIL | 2/5 | Tests, build, gating, privacy, dependency cleanup, and console state pass; required spike measurements are missing and the files labeled 1440×900 are not 1440×900. |

## Blocking findings

### 1. Required spike evidence and measurements are incomplete

- **Category:** Engineering reliability
- **Criterion:** Real, reproducible technical-spike measurements and
  1440×900 / 390×844 evidence.
- **Evidence:** `PHASE10.md` requires bundle cost, load/interaction
  behavior, frame stability, memory, reduced motion, forced WebGL failure,
  no-JavaScript output, and representative-phone behavior. The architecture
  additionally names load time, long tasks, frame stability, memory, and
  interaction latency. The decision report records bundle sizes and
  qualitative fallback reasoning, but no measured load time, long-task
  result, frame stability, memory result, or interaction latency.
  `sips` reports:
  - shell public “1440×900”: **892×779**;
  - every other shell/spike desktop “1440×900” image: **991×865**;
  - the only mobile images: **614×667**.
  The evidence report discloses the missing 390/320 captures, but still
  labels the non-1440 desktop files as 1440×900.
- **Impact:** The CSS-versus-R3F decision is directionally plausible, but
  §1's required visual and runtime comparison cannot be reproduced or
  accepted from the committed evidence.
- **Required change:** Recreate the isolated comparison long enough to
  capture and record the omitted runtime measurements under one documented
  protocol. Capture genuine 1440×900 CSS/R3F/failure states and genuine
  390×844 representative-phone evidence; capture the final shell at
  1440×900, 390×844, and 320px. Verify file dimensions before documenting
  them. Remove R3F code and dependencies again before the refiner commit.
- **Verification:** Record the measurement method, device/emulation,
  repetition count, actual values, budgets, and limitations. Run `sips -g
  pixelWidth -g pixelHeight` over every indexed screenshot and include the
  output summary. Re-run tests and build after dependency cleanup.

The critic did independently render the final CSS shell at true 1440×900,
390×844, and 320×844; the two phone widths had matching document/client
widths and no horizontal overflow. That verifies the current shell layout
but does not replace the missing two-approach spike evidence.

### 2. Chapter links discard private and forced-fallback URL state

- **Category:** Usefulness
- **Criterion:** Stable URL state and working public/private and no-3D
  modes.
- **Evidence:** `observatoryChapterHref()` always returns
  `${basePath}?chapter=${id}`. From
  `/dev/observatory-shell?mode=private&chapter=structure`, every chapter
  link omits `mode=private`. The critic clicked Forces and landed on
  `/dev/observatory-shell?chapter=forces`; the rendered shell changed from
  private to public and displayed `Read-only`. The same construction drops
  `no3d=1` after a chapter selection.
- **Impact:** A meaningful chapter action silently changes the active
  shell mode and can re-enable the 3D layout. The privacy behavior is
  fail-safe because owner content disappears rather than leaks, but the
  private and forced-fallback experiences are not stable.
- **Required change:** Make chapter URL construction preserve all
  route-relevant query state while replacing only `chapter`. Do not encode
  preview-only mode behavior into production routes; give the shell a
  general query-preservation contract or provide explicit preserved
  parameters from the caller.
- **Verification:** Add unit/integration coverage for private-mode chapter
  navigation, forced-no-3D chapter navigation, ordinary `/share` URLs,
  click navigation, and back/forward focus restoration.

### 3. The retained CSS spike links to the removed R3F route

- **Category:** Usefulness
- **Criterion:** Controls and evidence links lead to meaningful detail.
- **Evidence:** The retained `/dev/phase10-spike-css` page renders “Compare
  with the R3F spike” linking to `/dev/phase10-spike-r3f`, even though that
  route was removed. The critic activated the link and received the Next.js
  404 page.
- **Impact:** The durable evidence artifact advertises a comparison that no
  longer exists and sends reviewers to an error.
- **Required change:** Replace the live link with a link to the durable R3F
  evidence/decision report, or render it as non-interactive historical
  context. Do not restore a production R3F route solely to satisfy this
  link.
- **Verification:** Add a route/component assertion that the retained spike
  contains no link to the removed route; manually activate every retained
  evidence link.

### 4. Freshness-label contrast fails

- **Category:** Accessibility and mobile
- **Criterion:** Contrast meets the selected-direction accessibility
  contract.
- **Evidence:** `.freshnessLabel` uses `#726d63` over `#0b0b0e`. The
  critic measured the computed colors in the live page: **3.82:1** at
  **12.8px / 400**, below the 4.5:1 requirement for normal text.
- **Impact:** A first-class reliability label is intentionally de-emphasized
  below an accessible reading threshold, undermining the product's visible
  freshness promise.
- **Required change:** Raise the label color contrast to at least 4.5:1 at
  its rendered size and weight while keeping the value visually primary.
- **Verification:** Record computed foreground/background values and ratio
  for normal and stale freshness states at desktop and 390px; retain
  visible focus and selected-state contrast.

### 5. The selected static concentric fallback is absent

- **Category:** Product alignment
- **Criterion:** The chosen Field Journal hybrid is recognizable and
  includes the exact borrowed Night Orbit parts.
- **Evidence:** The selected-direction record explicitly names “Night Orbit
  static concentric fallback.” The direction brief calls for a static
  concentric map plus numbered chapter strip. In both fallback CSS branches,
  the orbit becomes a vertical flex column of rectangular links and a
  rectangular inspector. The saved forced-fallback and live 390px/320px
  views contain no concentric map, ring, plane, or equivalent static
  spatial index.
- **Impact:** The no-3D/reduced-motion/mobile path loses one of Devan's exact
  selected parts and becomes a conventional stacked navigation list.
- **Required change:** Add a restrained static concentric map that carries
  the same active chapter state while retaining the current single semantic
  link set, numbered strip, reading order, and 44px targets. It must not
  introduce duplicate focus stops, a miniature desktop scene, or overflow.
- **Verification:** Capture reduced-motion/forced-no-3D desktop, 390×844,
  and 320px states; confirm the concentric map is visible, the five real
  links remain the only chapter controls, and source order is unchanged.

## Passed checks to preserve

- Five chapters and questions match `PRODUCT_DIRECTION.md`.
- One semantic navigation landmark and five real anchors.
- `aria-current="page"` reflects the active chapter.
- Click navigation and browser back/forward restore focus to the active
  chapter heading.
- True 390×844: 390px document width, five 350×44px targets, active plate
  fully visible, no horizontal overflow.
- True 320×844: 320px document width, five 280×44px targets, no horizontal
  overflow.
- Public mode never renders the owner slot; private mode renders it when
  supplied.
- Logged-out preview routes render the sign-in form; no strict currency or
  private preview markers appear in logged-out HTML.
- Browser console contained zero warnings/errors on the retained shell/spike.
- `three`, `@react-three/fiber`, and `@types/three` are absent.
- `npm test`: 51 files, 278/278 tests passed.
- `npm run build`: compiled successfully; 16 static-page tasks generated.

## Disposition

Route §1 to Claude Refiner with only the five findings above. Preserve every
passed behavior, do not wire the shell into `/share` or `/`, and do not begin
§2.
