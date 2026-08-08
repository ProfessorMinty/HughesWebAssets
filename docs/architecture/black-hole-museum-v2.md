# Black Hole Museum V2 Architecture

## Status

Black Hole Museum V2 is a clean repository page system on `feature/black-hole-presentation-v2`, originally branched from exact source commit `c18a87560ff529eb7d5ad496522b9f5020bc688a`.

The historical Black Hole `.12` release line and `black-hole-lab` channel remain separate and untouched. V2 uses `black-hole-v2-lab`.

**Current unpublished staging candidate:** `0.2.0-black-hole-v2-lab.9`  
**Immediate rollback:** `0.2.0-black-hole-v2-lab.8`  
**Edublogs integration status:** pending real unpublished Preview revalidation after consolidation.

## Governing design rule

**Full width belongs to atmosphere. Human-scale reading lives inside it. Major scientific artifacts are allowed to be major.**

The page should read as a continuous private museum wing, not an article decorated with animated cards and not a sequence of tiny dashboard modules spread across a large monitor.

The revised maximum-shelf blueprint controls spatial/emotional staging. The Black Hole research package controls scientific claims, classifications, assets, credits, and media meaning. Repository architecture controls ownership, fallback, performance, release discipline, and rollback.

## Active source ownership

The active V2 runtime has exactly five source authorities:

- `renderer.js` — direct semantic station/chamber construction and station-local fallback.
- `interactions.js` — scientific interaction state and control behavior.
- `runtime.js` — current-plus-one performance window, video/YouTube lifecycle, motion control, section spy, cleanup.
- `presentation.css` — the **single** repository presentation authority for the museum.
- `amadeus-compat.css` — narrow route-ready structural compatibility only.

The following files are intentionally **not active source** anymore:

- `experience-layer.css`
- `stabilization.css`
- `normalization.css`
- `stabilization.js`

Their anti-pattern history is indexed under:

`apps/black-hole-museum/src/v2/Archive of things not to do lol/README.md`

Immutable `.6`, `.7`, and `.8` dist checkpoints are not moved or edited because their rollback URLs are evidence and must remain immutable.

## Why the consolidation was necessary

Staging `.6` found the correct maximum-shelf visual direction, but `.7` and `.8` accumulated correction layers. That recreated fragmented presentation ownership and made source review a poor predictor of the actual human-rendered result.

The consolidation audit also identified a concrete browser-scale error: sub-1rem museum microcopy was calculated relative to the WordPress document root, not the V2 mount root. Values believed to be comfortably readable were rendering around 14px on the reference desktop.

The canonical presentation now uses explicit meaningful-text tokens:

- body: `20px`
- support: `19px`
- UI: `18px`
- labels/classifications: `17px`
- lead copy: `22px`

These are project readability floors, not claims that WCAG defines a universal minimum font size.

## Direct museum composition

The renderer now builds the blueprint as distinct spatial rooms rather than repeating one header/card grammar:

1. **Classroom Threshold** — one classroom recap plaque plus a gallery aperture.
2. **Invisible Sky Atrium** — broad lensing instrument with state readout and wall label.
3. **Gravity Leaves Clues** — asymmetrical evidence gallery around an invisible center; clue copy is genuinely concealed until revealed; labeled scientific reference can open larger.
4. **Star-Orbit Theater** — dominant real observational screen with integrated explanatory orbit console and multiple direct overlays.
5. **Earth Becomes One Telescope** — large observatory map, large Earth network, site controls, detail panel, and synchronization sequence.
6. **Reconstruction Corridor** — visible three-stage process track, reconstruction workbench, explanations, and large reference image.
7. **Twin-Ring Rotunda** — two monumental observation bays, optional context/scale views, and a deliberate quiet bench.
8. **Warped Light Laboratory** — large interactive model, photon-path and shadow/horizon tools, Doppler explanation, and readable scientific references.
9. **Shadow and Myth Gallery** — calmer anatomy selector beside a myth-correction stack.
10. **Edge of the Known** — visible known/unknown boundary, galaxy pullback, observer return, and closing line.

The Media Center remains two normal 16:9 privacy-enhanced YouTube players with no autoplay. Credits are a calm expandable ledger rather than another wall of tiny cards.

## Scientific media readability

Labeled diagrams are not treated like generic thumbnails. The renderer can attach an `Open diagram larger` native dialog to scientific figures whose baked-in labels need more space.

The source continues to use verified media metadata and classifications. Creative overlays are explicitly described as explanatory/simplified rather than observational content.

## Interaction ownership

Interaction state is initialized and managed by the component that owns it:

- lensing state/readout
- clue reveal/hide state and evidence lines
- orbit trace/center/comparison overlays
- observatory network selection/completion
- reconstruction states and explanations
- comparison context/scale state
- Warped Light presets, photon paths, shadow/horizon guide, Doppler explanation
- anatomy layer selection

There is no post-render stabilizer/compositor.

Each station is constructed through a station-local error boundary. If one station builder fails, that station falls back to readable text while the rest of the enhanced museum can remain available. A failure during the overall mount transaction still restores the native Edublogs fallback.

## Runtime behavior

Preserved proven runtime behavior:

- `current-plus-one-ahead` section budget
- dormant video pause and `preload=none`
- next-section metadata warmup
- privacy-enhanced `youtube-nocookie.com`
- `autoplay=0`
- standard player controls
- proximity-based iframe creation/removal
- no iframe teardown while keyboard focus remains inside the Media Center
- reduced-motion awareness
- explicit manual pause/resume of currently running ambient animations
- observer/listener/media cleanup
- section wayfinding state

## Native Amadeus boundary

The native Hughes Room Views foundation remains intentionally calm and readable:

- Atkinson Hyperlegible body
- Nunito Sans headings
- 20px native body target
- light neutral native surfaces
- dark teal native headings/body

V2 explicitly owns its dark museum foreground and presentation inside the mount root. `amadeus-compat.css` does not own colors or typography. It activates only after successful enhancement and neutralizes the proven structural conflicts: theme container widths, floats, page-entry spacing/chrome, native page title/footer chrome, and duplicate native site footer on this route.

The Edublogs fallback CSS was also returned to the intended 20px Atkinson/Nunito baseline.

## Edublogs three-tab contract

### HTML tab

`docs/deployment/black-hole-v2-edublogs-html.html`

Owns semantic readable fallback, unique mount root, page identity, and no-JavaScript safety.

### CSS tab

`docs/deployment/black-hole-v2-edublogs-css.css`

Owns fallback readability only. It is not an enhanced presentation layer.

### JavaScript tab

`docs/deployment/black-hole-v2-edublogs-javascript.js`

Owns the page-local enhancement transaction:

1. wait for DOM readiness;
2. validate the semantic page contract;
3. fetch the exact pinned staging release;
4. fetch/validate content, assets, experience, and renderer module before adding enhanced CSS;
5. load canonical presentation CSS;
6. load narrow Amadeus compatibility CSS;
7. mount the renderer;
8. mark the route ready only after successful mount;
9. remove both enhanced styles and preserve native fallback if enhancement fails.

There is no slug, pathname, WordPress page-id, or global bootstrap identity dependency.

## Staging `.9` delivery

`.9` is an unpublished **clean-source-pinned staging** checkpoint. It deliberately avoids the `.8` wrapper/import packaging pattern.

Its release manifest pins one immutable repository snapshot containing:

- direct `renderer.js` module
- relative direct `interactions.js` and `runtime.js`
- direct canonical `presentation.css`
- direct structural `amadeus-compat.css`
- a V2-owned truthful experience JSON
- the previously verified `.2` content and asset manifests as temporary staging seed only

This direct-source staging mode is not the permanent production distribution architecture. `scripts/build_black_hole_v2.py` defines the production-capable path and emits V2-owned dist copies of renderer/modules/styles/data/assets. The builder now fails if any retired patch-layer filename reappears in active source.

## Human render preflight for `.9` source

Before `.9` was handed back to Edublogs, the consolidated renderer/interactions/runtime/presentation were exercised in a local Chromium harness with non-sensitive fixture media.

Measured reference results:

| Viewport | Root text | classification/label floor | site controls | nav | figcaption | horizontal overflow |
|---|---:|---:|---:|---:|---:|---|
| 1920×1032 | 20px | 17px | 17px | 17px | 18px | none |
| 1440×900 | ~19.9px | 17px | 17px | 17px | 18px | none |
| 960×900 equivalent | ~18.9px | 17px | 17px | 17px | 18px | none |
| 390×844 | 18px | 17px | 17px | 17px | 18px | none |

The harness produced no page errors in these passes. Stations 01, 03, 04, 05, 06, 07, 08, 09, and 10 were visually inspected as individual rendered compositions; a full-page render was also inspected for rhythm. A Warped Light browser-default button regression found during this preflight was corrected before `.9` staging.

This is **not** a substitute for the real Edublogs integration test. The unpublished Edublogs Preview remains the final authority for Amadeus interaction and actual classroom-page proportions.

## Verification and rollback discipline

`scripts/test_black_hole_v2_contract.py` now protects the consolidated architecture rather than the old patch-era layers. In particular it fails if the retired presentation/stabilization files return.

The test also guards:

- direct blueprint-specific renderer composition
- direct interaction ownership
- current-plus-one runtime behavior
- meaningful text floors
- absence of generic 340/520/760px major-module caps
- no nested CSS imports
- direct diagram enlargement path
- truthful experience capabilities
- separate structural compatibility ownership
- readable native fallback
- `.9` loader/channel/rollback contract
- builder rejection of obsolete layers

The canonical human defect history remains:

`docs/evidence/black-hole-v2-human-visual-audit.md`

Staging `.9` exists because that audit's consolidation gate was acted on. Edublogs revalidation is still required before the human-visible defects can be marked fully closed.
