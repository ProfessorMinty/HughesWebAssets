# Black Hole Museum V2 — Consolidation Result

**Date:** 2026-08-08  
**Candidate:** `0.2.0-black-hole-v2-lab.9`  
**Relationship to the canonical audit:** This document records the implementation response to `black-hole-v2-human-visual-audit.md`. The audit remains the historical defect ledger; this result records which gates were addressed before the next Edublogs review.

## Status

**Source consolidation complete. Local human-scale Chromium preflight complete. Real unpublished Edublogs Preview revalidation still required.**

No claim in this document closes a human-visible defect that depends on Amadeus/Edublogs integration until the real preview has been reviewed.

## P0 architecture response

### Presentation authority

Resolved in source:

- one active `presentation.css`
- one structural `amadeus-compat.css`
- no active `experience-layer.css`
- no active `stabilization.css`
- no active `normalization.css`

The retired filenames are explicitly rejected by `build_black_hole_v2.py`.

### Post-render patching

Resolved in source:

- `stabilization.js` removed from active source
- clue state, Orbit labels/overlays, Earth network state, Warped Light states, and Anatomy initialization are owned directly by `interactions.js`
- station composition is owned directly by `renderer.js`
- runtime/media lifecycle is owned directly by `runtime.js`

### Human scale

Resolved in the consolidated source candidate:

- generic `340px`, `520px`, and `760px` major-module caps removed
- reading measure remains controlled while major observational/scientific artifacts use broad local composition space
- labeled diagrams have an explicit `Open diagram larger` path
- credits are collapsed into one calm ledger instead of another dense card wall

### Repetitive section grammar

Resolved structurally in the renderer:

- threshold plaque + aperture
- atrium instrument
- asymmetrical evidence gallery
- observation theater
- planetary telescope hall
- reconstruction corridor
- twin-ring rotunda
- working Warped Light laboratory
- quiet anatomy/myth gallery
- knowledge boundary and observer return

The rooms no longer depend on one repeated “header + equal cards” grammar.

## Confirmed browser-scale root cause

The consolidation pass reproduced a key typography regression in real Chromium:

`rem` values inside the repository island resolve against the document root, not the V2 mount root.

At the reference desktop, values such as `.88rem` and `.86rem` rendered around 14px even though the V2 mount itself was near 20px. This is why some source-level “font increases” made human-visible text remain tiny or become perceptually worse.

The canonical presentation now uses explicit meaningful-text floors:

- body `20px`
- support `19px`
- UI `18px`
- meaningful labels/classifications `17px`
- lead copy `22px`

## Local Chromium preflight

A non-sensitive fixture harness exercised the consolidated renderer/interactions/runtime/presentation in headless Chromium.

Measured results:

| Viewport | root | classification | observatory site | navigation | figcaption | horizontal overflow |
|---|---:|---:|---:|---:|---:|---|
| 1920×1032 | 20px | 17px | 17px | 17px | 18px | none |
| 1440×900 | ~19.9px | 17px | 17px | 17px | 18px | none |
| 960×900 | ~18.9px | 17px | 17px | 17px | 18px | none |
| 390×844 | 18px | 17px | 17px | 17px | 18px | none |

The harness produced no page errors during these passes.

Individual rendered inspections were performed for Stations 01, 03, 04, 05, 06, 07, 08, 09, and 10, plus a full-page continuity render. A browser-default button styling regression in Warped Light was found during this preflight and corrected before staging `.9`.

## Interaction response

- Gravity clues start genuinely concealed and can be revealed individually or together.
- Orbit owns three explanatory controls: featured trace, invisible-center marker, simplified comparison.
- Earth network owns per-site selection, completion/reset state, status, and a selected-site explanation panel.
- Reconstruction owns its three states plus “why several versions?” and “why orange?” explanations.
- Warped Light owns viewing presets, photon paths, a shadow/horizon guide, and Doppler-beaming explanation.
- Anatomy initializes a valid selected layer directly.
- Media Center iframe sleep is suppressed while keyboard focus remains inside the center.

## Release cleanup

`.9` intentionally does **not** repeat the `.8` wrapper/`@import` delivery pattern.

For this unpublished staging gate, the release manifest pins one immutable repository payload snapshot and references the direct clean renderer/modules/presentation/compatibility files. The verified `.2` content/assets remain temporary staging seed; `.9` owns the truthful V2 experience JSON.

The production-capable builder remains the forward path that emits complete V2-owned dist copies and now rejects retired patch-layer files.

## Archived anti-patterns

The active patch files were removed. Their history is indexed at:

`apps/black-hole-museum/src/v2/Archive of things not to do lol/README.md`

Immutable `.6`, `.7`, and `.8` dist checkpoints remain untouched because they are rollback/evidence artifacts and their paths are part of the immutable contract.

## Remaining acceptance gate

The next required evidence is one real unpublished Edublogs Preview of `.9` using fresh HTML/CSS/JavaScript tab contents.

That review should test the canonical audit as a whole rather than asking the user to rediscover defects. Specifically verify:

- normal desktop readability at actual viewing distance
- section/chamber hierarchy across the full scroll
- labeled-image readability and zoom behavior
- clue conceal/reveal
- Orbit overlays and console
- Earth-network layout/control state
- reconstruction states
- Twin-Ring scale
- Warped Light tools and motion
- Anatomy state
- Media Center focus/player lifecycle
- final boundary/pullback/observer return
- no Amadeus typography, width, footer, or color collisions
- no horizontal overflow at the real page width

Only after that real integration review should the human-visible entries in the canonical defect ledger be marked closed.
