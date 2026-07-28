# Phase 10 §9 planet-source art

Regenerated July 28, 2026 with OpenAI's built-in ImageGen tool, then normalized
to 2048×1024 PNG source plates before the repository's deterministic KTX2 pipeline
derives base, emissive, and normal maps.

Every call used this exact prompt template, replacing only `<WORLD>`:

`Create a seamless-looking 2:1 equirectangular fictional planet surface
texture, edge-to-edge map only, no globe silhouette, no space background.
<WORLD>. Strong continent-scale silhouette, one unmistakable emissive network,
polar continuity, premium cinematic material detail, readable at 32 pixels.
Absolutely no text, no letters, no numbers, no logo, no wordmark, no
trademarked icon.`

The exact `<WORLD>` fills were:

- **ASML:** `A cool steel-blue precision-optics world with a single
  lens-shaped continent, etched photolithography terraces, and cyan optics
  rings glowing through dark glass channels.` — done by codex/gpt-5.
- **GOOG:** `A pale sage and cloud-white information world with four distinct
  product districts joined by brilliant white fiber boulevards and blue,
  red, yellow, and green mineral accents that never form an icon.` — done by
  codex/gpt-5.
- **MSFT:** `A slate-teal cloud world with one four-quadrant continent,
  modular software-city grids, and azure ring roads glowing through translucent
  atmospheric layers without forming a logo.` — done by codex/gpt-5.
- **IBM:** `A midnight-blue mainframe world dominated by one pinstripe
  monolith mountain range, disciplined horizontal strata, and a pale quantum
  dome grid glowing across the night side.` — done by codex/gpt-5.
- **COST:** `A warm concrete and warehouse-tan world dominated by a warehouse
  crater complex, pallet-grid plains, and red loading-dock lanes glowing
  between gold bulk-goods terraces.` — done by codex/gpt-5.
- **INTC:** `A graphite reconstruction world with one copper repair spiral,
  exposed silicon strata, half-finished crystalline megastructures, and
  electric-blue coolant channels.` — done by codex/gpt-5.
- **NBIS:** `A newborn accretion world with dark violet crust, one vast fresh
  accretion scar, rising compute terraces, and violet-white infrastructure
  glowing through the fracture.` — done by codex/gpt-5.
- **CBRS:** `A bronze-green wafer-scale world dominated by one vast processor
  core, ceramic substrate canyons, repeating compute fields, and cyan coolant
  rivers.` — done by codex/gpt-5.

The generated PNGs are retained as reproducible art inputs. The browser loads
only the compressed maps in `public/textures/planets/`.
