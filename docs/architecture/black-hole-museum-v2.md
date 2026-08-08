# Black Hole Museum V2 Architecture

## Status

Black Hole Museum V2 is a clean repository page system on `feature/black-hole-presentation-v2`, originally branched from exact source commit `c18a87560ff529eb7d5ad496522b9f5020bc688a`.

The historical Black Hole `.12` release line and `black-hole-lab` channel remain separate and untouched. V2 uses `black-hole-v2-lab`.

**Current unpublished staging candidate:** `0.2.0-black-hole-v2-lab.10`  
**Immediate rollback:** `0.2.0-black-hole-v2-lab.9`  
**Payload snapshot:** `b4eef573a9f11a5f54ce99cfe60e2bc63059d271`  
**Edublogs integration status:** pending real unpublished Preview revalidation after the `.10` interaction-locality refinement.

## Governing design rule

**Full width belongs to atmosphere. Human-scale reading lives inside it. Major scientific artifacts are allowed to be major.**

The page should read as a continuous private museum wing, not an article decorated with animated cards and not a sequence of tiny dashboard modules spread across a large monitor.

The revised maximum-shelf blueprint controls spatial/emotional staging. The Black Hole research package controls scientific claims, classifications, assets, credits, and media meaning. Repository architecture controls ownership, fallback, performance, release discipline, and rollback.

## Active source ownership

The active V2 runtime has exactly five source authorities:

- `renderer.js` — direct semantic station/chamber construction, station-local fallback, media dialogs, and composition.
- `interactions.js` — scientific interaction state, control behavior, stable explanation trays, and direct selected-state initialization.
- `runtime.js` — current-plus-one native-media window, explicit-play YouTube lifecycle, motion control, section spy, cleanup.
- `presentation.css` — the **single** repository presentation authority for the museum.
- `amadeus-compat.css` — narrow route-ready structural compatibility only.

The following files are intentionally **not active source**:

- `experience-layer.css`
- `stabilization.css`
- `normalization.css`
- `stabilization.js`

Their anti-pattern history is indexed under:

`apps/black-hole-museum/src/v2/Archive of things not to do lol/README.md`

Immutable `.6`, `.7`, and `.8` dist checkpoints remain untouched as rollback/evidence artifacts.

## Readability contract

A Chromium-rendered browser audit proved that `rem` inside the repository island resolves against the WordPress document root, not the V2 mount root. Earlier sub-1rem microcopy therefore rendered much smaller than intended.

The canonical presentation uses explicit meaningful-text tokens:

- body: `20px`
- support: `19px`
- UI: `18px`
- labels/classifications: `17px`
- lead copy: `22px`

These are Hughes Room Views project readability floors, not a claim that WCAG defines one universal minimum font size.

## Direct museum composition

The renderer builds distinct spatial rooms rather than repeating one header/card grammar:

1. **Classroom Threshold** — classroom recap plaque plus gallery aperture.
2. **Invisible Sky Atrium** — broad lensing instrument with state readout and wall label.
3. **Gravity Leaves Clues** — asymmetrical evidence gallery around an invisible center; clue geometry stays stable while evidence is revealed; labeled scientific reference can open larger.
4. **Star-Orbit Theater** — dominant real observational screen with explanatory overlay controls physically attached to the same instrument.
5. **Earth Becomes One Telescope** — large observatory map, Earth network, site controls, detail panel, and compact synchronization sequence.
6. **Reconstruction Corridor** — compact three-stage process rail, reconstruction workbench, stable explanation tray, and large reference image.
7. **Twin-Ring Rotunda** — two monumental observation bays, quiet bench, and viewport-dialog context/scale views that do not create empty alternate-state acreage.
8. **Warped Light Laboratory** — large interactive model, photon-path and shadow/horizon tools, stable model-note tray, and readable scientific references.
9. **Shadow and Myth Gallery** — anatomy selector beside a myth selector plus one stable explanation region.
10. **Edge of the Known** — visible known/unknown boundary, galaxy pullback, observer return, and closing line.

The Media Center remains two normal 16:9 authored poster cards. YouTube is not created until the visitor explicitly chooses Play.

## Interaction-locality contract

`.10` promotes a reusable interaction rule:

> **A control and its primary visual consequence should normally be perceivable together without scroll travel.**

This is especially consequential in the Orbit theater. The real `.9` preview required scrolling down to the controls and back up to see the overlay. `.10` makes the screen and control shelf one bounded theater instrument.

Local Chromium at the 1920×1032 reference viewport measured the complete `.10` theater at approximately `862.875px` tall.

The real Edublogs Preview remains the final integration proof.

## Stable explanation contract

Document growth is not the default explanation model for interactive museum content.

Reusable stable-detail ownership now exists inside `interactions.js`:

- Reconstruction questions share one detail tray.
- Warped Light model notes share one detail tray.
- Myth corrections use one stable detail region.
- Gravity remains a special spatial evidence system, but clue copy occupies reserved card geometry so reveal does not resize the cards.

Reduced-motion CSS removes animated transitions while keeping the same structure.

## Scientific media readability and dialogs

Labeled diagrams are not generic thumbnails. The renderer attaches an `Open diagram larger` action to appropriate scientific figures.

`.10` uses native modal-dialog semantics rather than inline document expansion:

- viewport-centered enlarged image;
- backdrop;
- explicit Close control;
- native Escape behavior;
- focus moves into the dialog;
- focus returns to the opener with `preventScroll`;
- underlying document geometry and scroll position remain stable.

Twin-Ring galaxy-context and relative-scale views use the same dialog model.

## Interaction ownership

Interaction state is initialized and managed by the component that owns it:

- lensing state/readout;
- clue reveal/hide state and evidence lines;
- orbit trace/center/comparison overlays and local status;
- observatory network selection/completion;
- reconstruction states and explanation tray;
- Warped Light presets, photon paths, shadow/horizon guide, and explanation tray;
- anatomy layer selection;
- myth selection/detail state.

There is no post-render stabilizer/compositor.

Each station is constructed through a station-local error boundary. If one station builder fails, that station falls back to readable text while the rest of the museum remains available. A failure during the overall mount transaction restores the native Edublogs fallback.

## Runtime behavior

Preserved and current runtime behavior:

- `current-plus-one-ahead` native section media budget;
- dormant video pause and `preload=none`;
- next-section native-video metadata warmup;
- privacy-enhanced `youtube-nocookie.com`;
- `autoplay=0`;
- standard player controls;
- **explicit Play required before a YouTube iframe is created**;
- authored poster restored when an active player sleeps;
- no iframe teardown while keyboard focus remains inside the Media Center;
- external-watch link remains available outside the iframe;
- reduced-motion awareness;
- explicit manual pause/resume of currently running ambient animations;
- observer/listener/media cleanup;
- section wayfinding state.

## Native Amadeus boundary

The native Hughes Room Views foundation remains intentionally calm and readable:

- Atkinson Hyperlegible body;
- Nunito Sans headings;
- 20px native body target;
- light neutral native surfaces;
- dark teal native headings/body.

V2 explicitly owns its dark museum foreground and presentation inside the mount root. `amadeus-compat.css` does not own colors or typography. It activates only after successful enhancement and neutralizes proven structural conflicts: theme container widths, floats, page-entry spacing/chrome, native page title/footer chrome, and the native `.site-footer` on this route.

The Edublogs fallback CSS uses the intended 20px Atkinson/Nunito baseline.

### Root-width ownership

The old V2 staging breakout used `100vw`, a centered offset, and negative `50vw` margins.

After the Amadeus parent container became explicitly neutralized, that viewport breakout became unnecessary and could contribute scrollbar-width overflow in WordPress.

`.10` therefore fills the already-neutralized parent with `width:100%` and normal positioning. It does **not** globally hide page overflow.

Real Edublogs revalidation is required to determine whether any additional global/theme element remains an overflow owner.

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
9. schedule read-only unpublished integration diagnostics;
10. remove enhanced styles and preserve native fallback if enhancement fails.

There is no slug, pathname, WordPress page-id, or global bootstrap identity dependency.

### Unpublished integration diagnostics

The real `.9` preview exposed two integration questions that cannot be resolved from repository source alone:

- a horizontal page scrollbar;
- unrelated teal Explorations Hub / Previous / Next / Nav content after the museum credits.

The `.10` loader records, without changing presentation:

- viewport/client/scroll width;
- overflowing element bounds;
- mount ancestry and adjacent sibling summaries;
- nodes containing known textual clues from the unexplained teal tail.

The report is available at:

`window.__HRV_BLACK_HOLE_V2_DIAGNOSTICS__`

This diagnostic is evidence collection, not a styling workaround.

## Staging `.10` delivery

`.10` is an unpublished **clean-source-pinned refinement staging** checkpoint.

Its payload snapshot is:

`b4eef573a9f11a5f54ce99cfe60e2bc63059d271`

The release references direct immutable copies of:

- `renderer.js`;
- `interactions.js`;
- `runtime.js`;
- canonical `presentation.css`;
- structural `amadeus-compat.css`;
- V2-owned truthful experience JSON;
- verified `.2` content and asset manifests as temporary staging seed only.

There is no wrapper JavaScript and no presentation `@import` chain.

`scripts/build_black_hole_v2.py` remains the production-capable path that emits V2-owned dist copies and fails if retired patch-layer filenames reappear.

## `.10` local human/interactions preflight

The `.10` source was exercised in a non-sensitive local Chromium harness across 1920×1032, 1440×900, 960×900, and 390×844 reference widths.

Recorded results include:

- body text 20px on reference desktop;
- label/classification floor 17px;
- captions 18px;
- no local horizontal overflow;
- Orbit theater approximately 862.875px tall at 1920×1032;
- Gravity reveal document shift 0px;
- Reconstruction detail-switch document shift 0px;
- Warped Light detail-switch document shift 0px;
- Myth detail-switch document shift 0px;
- dialog document shift 0px;
- Media Center iframe count 0 before explicit Play;
- one iframe after one explicit Play;
- no page errors observed in the tested interaction journey.

This is **not** a substitute for the real Edublogs integration test.

## Verification and rollback discipline

`scripts/test_black_hole_v2_contract.py` has been updated to protect the `.10` architecture, including:

- no retired presentation/stabilization files;
- direct renderer/interaction ownership;
- current-plus-one runtime behavior;
- explicit-play YouTube;
- meaningful text floors;
- no old `100vw/-50vw` breakout math;
- stable explanation trays;
- viewport dialogs;
- narrow separate compatibility ownership;
- read-only integration diagnostics;
- `.10 → .9` channel/rollback contract;
- builder rejection of obsolete layers.

**Verification boundary:** the revised contract file has not been executed from a fresh repository checkout in the current environment. Do not record it as a passed run until it is actually executed.

The chronological lessons and current real-preview gate live in:

`docs/evidence/black-hole-v2-living-creation-log.md`

The canonical human defect history remains:

`docs/evidence/black-hole-v2-human-visual-audit.md`
