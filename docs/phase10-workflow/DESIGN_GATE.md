# Phase 10 design-proof gate

User-facing sections must settle their design grammar before broad production
implementation. This gate converts taste from late remediation feedback into an
explicit input.

## When the gate applies

The gate applies when a section creates or materially changes layout, visual
hierarchy, spatial composition, motion language, component styling, or art
direction.

A section may cite an existing owner-approved design package as the proof when
it already contains every item below. Otherwise Claude Lead creates
`docs/phase10-workflow/design-proofs/section-N.md` during `specify`. If a
material owner choice remains open, the state routes to Devan before Codex
implements production UI.

Start from `docs/phase10-workflow/design-proofs/TEMPLATE.md` so the proof and
its acceptance-ledger mapping remain consistent between sections.

## Required proof

1. **Intent:** the one user question and desired first-five-second
   comprehension.
2. **Annotated references:** two to five references, with the exact structure,
   texture, motion, typography, or hierarchy being borrowed. A URL or image
   without an annotation is not direction.
3. **Negative list:** named patterns that would make the result generic,
   confusing, inaccessible, or inconsistent with the product.
4. **Design grammar:** palette authority, typography roles, spacing rhythm,
   component materials, interaction language, motion boundaries, and
   responsive mode.
5. **State matrix:** representative real-data, negative, empty, stale, loading,
   error, private/public, reduced-motion, and fallback states relevant to the
   section.
6. **Proof surfaces:** desktop and mobile compositions or a deliberate
   desktop-first/mobile-fallback record at the exact acceptance viewports.
7. **Owner decision:** selected direction and rejected alternatives, or an
   explicit citation to a previously approved package that fully decides them.
8. **Freeze boundary:** what counts as defect remediation versus a new creative
   direction requiring a new owner-scoped section.

## Section §10 equivalence

For §10, the owner-approved combination of `UNIVERSE_IDEAS_3.md`,
`UNIVERSE_PALETTE_3.html`, `docs/reference/README.md`, and the section's
required live 1440×900 proof surfaces may satisfy this gate. Claude Lead must
record the mapping explicitly in the §10 spec and acceptance ledger; it must not
assume that the existence of those files alone proves every item.

## Review rule

Automated checks verify tokens, contrast, geometry, state coverage, and artifact
dimensions. Claude Lead still judges meaning, hierarchy, coherence, and
owner-intent alignment. Pixel comparison protects accepted behavior; it is not
a substitute for taste.
