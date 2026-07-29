# Section 11 implementer evidence

Implementation evidence was recorded on 2026-07-28 by `codex/gpt-5`.

The command verifiers, deterministic DOM/component verifiers, unauthenticated
production-HTML privacy scan, full test suite, and production build were run
locally against the §11 working tree.

Live browser discovery returned no available browser backends. The Browser
skill requires Codex not to substitute standalone Playwright or another browser
controller after that result. Consequently every criterion whose accepted
verifier is `browser` or `visual` is marked `deferred_to_reviewer`, even where
component-DOM or source-token checks supply useful non-live evidence. No
screenshot, pixel sample, geometry measurement, accessibility-tree result, or
performance timing has been fabricated.

The unchanged §10 sampler and long-task scripts are retained in `scripts/`.
They were not executed because both require a live browser context.
