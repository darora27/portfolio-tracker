# FB-05 root cause — Mission Control type remained on the smallest token

Root-caused July 29, 2026 by `codex/gpt-5`. This is diagnosis, not a visual
pass and not a fix.

The Fable drop successfully replaced literal font sizes with the five legal
tokens `56 / 24 / 15 / 13 / 11`, and `type-ramp.test.ts` correctly prevents
new off-ramp literals. The owner nevertheless re-reported Mission Control
small type because the gate constrains the *set of values* but not the
*semantic role mapping*.

Mission Control still maps the following reading surfaces to the smallest
`--type-label` / `--mission-label-size` value (11px):

- plot and manifest headers and their question copy;
- radar labels, timestamp, pair line, expanded detail card, and manifest;
- briefing copy, rail stations, instrument strip, and section tabs;
- plot labels, holdings headers, and related microcopy.

Evidence: `src/components/observatory/orrery/orrery.module.css` selectors
`.plotChassis > header`, `.manifestInstrument > header`, `.bayQuestion`,
`.radarRingTarget > span`, `.radarTimestamp`, `.radarPairLine`,
`.radarDetailCard`, `.radarManifest > li > button`, `.railStations a`,
`.instrumentStrip a`, `.plotReadouts span`, and `.manifestHeader`.

The §12a repair is therefore a role remap using the existing five tokens:
Mission Control reading copy moves up to body/title roles while true labels
remain labels. It must not add a sixth size or nudge individual declarations.
