# Arctic Preferred Black Hole Museum Architecture

## Authority order

1. The Revised Arctic Preferred Maximum-Shelf Experience Blueprint controls the creative experience.
2. The Black Hole Research and Creative Planning Package controls scientific claims, classifications, approved scientific media, and credits.
3. The Repository Architecture and Manifest Standard controls route ownership, fallback, manifests, releases, testing, and rollback.
4. The historical `test/repo-layout-lab/` and `test/repo-runtime-lab/` proofs control already-tested Edublogs layout/runtime behavior unless new evidence explicitly supersedes them.
5. Historical Hughes Room Views pages may inform composition discipline and house-language lessons, but they are not a capability ceiling. Their centered Edublogs container limitations must not be carried into repository-native full-width pages.

## Route and ownership

- Route: `/repository-page-lab/`
- Route id: `repository-page-lab-black-holes`
- Page system: `black-hole-museum`
- Mount id: `hrv-black-hole-museum-root`
- Current delivery release: `0.1.0-black-hole-lab.12`
- Current release manifest ref: `0d80ceadd70ec0377e4b38b8d8c03ad6725b90d0`
- Delivery asset ref: `153172becd5ba139c80c5aa26b99e318e124d2dd`
- Human-scale story-grid source ref: `c18a87560ff529eb7d5ad496522b9f5020bc688a`
- Immediate rollback: `0.1.0-black-hole-lab.11`
- Verified lean science/media foundation: `v0.1.0-black-hole-lab.2`
- Preserved source-bearing historical release: `v0.1.0-black-hole-lab.1`

Edublogs owns the route, native navigation, semantic fallback, and mount. The repository owns the successful enhanced-mode canvas, release manifests, renderer, post-render DOM composition, scoped CSS, interactions, diagnostics, environmental presentation, optional Media Center, and media delivery.

## Loading transaction

The immutable `.2` bootstrap verifies the exact route, mount contract, schema marker, and fallback before loading a release manifest. The verified scientific renderer mounts first. The Maximum-Shelf runtime then adds environmental behavior, performance budgeting, Media Center behavior, and interaction cleanup. The story compositor finally reorganizes those already-mounted nodes into purposeful local groups.

The compositor moves existing DOM nodes rather than recreating the scientific engine. Buttons, details elements, native videos, and their event handlers remain owned by the verified renderer/runtime.

A failed enhancement may return to the native fallback. A successful enhancement is never allowed to solve a layout problem by retreating into the Amadeus centered article container.

## Viewport breakout contract

The enhanced route uses the root-level breakout proven by `test/repo-layout-lab/`.

`#hrv-black-hole-museum-root.bhm-mounted` owns `100vw`, `left:50%`, and symmetric negative half-viewport margins. `.bhm-museum` fills that root. Viewport breakout responsibility must never move to a descendant card or exhibit.

There is no desktop museum `max-width` shell. Local prose and individual artifacts may have readable size limits, but those limits do not become page limits.

## Human-scale story-grid doctrine

Release `.12` replaces the mistaken room-scale interpretation of full width.

**Full width belongs to the page atmosphere. Human-scale modules live inside that canvas.**

The viewport is used to compose relationships, not to maximize component size. A normal desktop should usually show several related pieces of information at once. Empty space is allowed when it serves the composition, but no component earns billboard scale merely because horizontal space exists.

The page uses a flexible twelve-column local composition system. There is no centered master container. Individual sections may use only part of the grid, pair different spans, or create compact card clusters according to the subject.

Generic `90vh`, `110vh`, `130vh`, or `150vh` station-height mandates are not part of the `.12` structure layer. Height is primarily content-driven.

## Named story compositions

`maximum-shelf-structure.js` assigns an explicit composition type to each station:

1. `threshold-cluster`
2. `interactive-pair`
3. `evidence-cluster`
4. `media-story-pair`
5. `telescope-cluster`
6. `three-stage-process`
7. `comparison-pair`
8. `interactive-gallery`
9. `myth-grid`
10. `knowledge-split`

This prevents the renderer from treating every subject as `title + explanation + giant hero object`.

### Station 01 · Classroom Threshold

The opening lesson becomes a compact four-card recap cluster inside the threshold atmosphere. The section can feel ceremonial without turning the recap itself into a tall narrow article.

### Station 02 · Invisible Sky Atrium

The lensing model is a medium interactive paired with its local controls. The full-width environment supplies scale; the instrument itself remains human-sized.

### Station 03 · Gravity Leaves Clues

The section shows the hidden-mass concept, four evidence cards, and one supporting scientific reference together. The composition itself communicates that several independent clues point toward the same invisible object.

### Station 04 · The Orbit Draws Itself

The ESO observation and the tracing/explanation tool remain visible together. The real video is important, but it does not consume the entire monitor.

### Station 05 · Earth Becomes One Telescope

The authoritative observatory map, medium Earth/network interaction, and compact observatory-site stack coexist in one composition. The visual sentence is `places -> network -> one instrument`.

### Station 06 · Data Becomes an Image

Three adjacent process cards expose `Measurements -> Possible reconstructions -> Published result`. The interactive reconstruction and published scientific reference then sit beneath that process rather than replacing it with one giant visualization.

### Station 07 · Twin-Ring Rotunda

M87* and Sagittarius A* remain the intentional comparison moment. Their cards are capped at human viewing scale instead of becoming wall-sized murals.

### Station 08 · Warped Light Laboratory

A medium working model occupies seven columns, a companion annotated reference occupies five, and three additional supporting visualizations form a compact gallery below.

### Station 09 · Shadow and Myth Gallery

The scientific anatomy interaction shares the section with a visible 2x2 myth/fact cluster. The relationship between model and interpretation is visible without scrolling through separate giant rooms.

### Media Center

The simulated Media Center is a small lounge. Compact signage occupies a local rail while two normal 16:9 YouTube players share the remaining space. The existing no-autoplay and lazy-loading rules remain authoritative.

### Station 10 · Edge of the Known

Known and unknown material remains an intentional conceptual split, followed by a compact three-artifact evidence pullback and a closing statement.

## Hero and typography contract

The page hero is one of the few moments allowed to be large. It uses a purposeful 7/5 composition with the thesis and a decorative black-hole visual, and its height is capped for an ordinary desktop.

Ordinary desktop reading text targets roughly 18–20px. Station headings target roughly 40–64px depending on viewport size. Metadata remains subordinate but legible.

The rule is not `everything smaller`. It is `scale communicates role`.

## Desktop and phone contract

Desktop and normal tablet widths use the twelve-column canvas to keep related material visible together.

At phone width (`700px` and below), those semantic groups intentionally become a single column. Cards stack; they do not expand into viewport-height monuments. Native and YouTube video regions retain normal media proportions.

## Performance contract

`maximum-shelf-runtime.js` retains the `current-plus-one-ahead` scroll budget established after live lag was observed. Distant chambers remain semantic DOM but pause animation work, pause native video, set dormant native video to `preload=none`, and use `content-visibility` where appropriate.

The YouTube Media Center keeps privacy-enhanced `youtube-nocookie.com` players, normal controls, `autoplay=0`, and lazy iframe creation/removal based on proximity to the viewport.

The `.12` compositor adds no scroll listener, animation loop, media decoder, or duplicate scientific interaction handler.

## Amadeus compatibility contract

`theme-amadeus.css` activates only behind `html.hrv-route-black-hole-lab-ready`. It neutralizes the native page-title strip, `.site-content` spacing, centered `.site-content > .container`, fixed/floated `.content-area`, page-entry padding, white article card, and entry-footer chrome. Native site navigation remains native and the real site footer remains functional.

Theme compatibility removes confirmed theme constraints. It must never recreate a centered website-content box around repository-native pages.

## Durable source layers

The durable source composition is:

1. `page.css` — verified base renderer styling and core interaction states.
2. `viewport-breakout.css` — proven Edublogs mount-root breakout.
3. `maximum-shelf.css` — primary atmosphere and responsive experience.
4. `maximum-shelf-enhancements.css` — environmental transitions and decorative instrumentation.
5. `maximum-shelf-finishing.css` — small cross-browser spatial fallbacks.
6. `maximum-shelf-wide-performance.css` — full-width availability, word-wrap protection, paint-budget reductions, and dormant-chamber styling.
7. `maximum-shelf-media-center.css` — simulated YouTube Media Center.
8. `maximum-shelf-structure.css` — human-scale story grid, module sizing, section rhythm, and phone collapse.
9. `theme-amadeus.css` — route-scoped theme compatibility.

`maximum-shelf-composed-runtime.js` mounts `maximum-shelf-runtime.js` first and then calls `recomposeBlackHoleMuseum()` from `maximum-shelf-structure.js`.

The `.11` `maximum-shelf-structure-preflight.css` file remains historical evidence of the cascade defect found during that release. It is not part of the `.12` durable composition because `.12` no longer layers the new structure over the `.9` named-grid composition release.

## Releases and rollback

`.12` references the human-scale story-grid source at `c18a87560ff529eb7d5ad496522b9f5020bc688a` and continues to reuse the verified `.2` content, assets, experience manifest, and bootstrap.

Delivery JS/CSS are pinned at `153172becd5ba139c80c5aa26b99e318e124d2dd`. The release manifest is pinned at `0d80ceadd70ec0377e4b38b8d8c03ad6725b90d0`.

`.11` is the immediate rollback. `.9` remains the last pre-structure visual checkpoint. `.3` remains the preserved isolated viewport-correction release. `.1` and `.2` remain immutable historical/scientific foundations.

## Testing

`scripts/test_black_hole_viewport_contract.py` guards the historical root-breakout contract.

`scripts/test_black_hole_presentation_contract.py` guards the human-scale story-grid doctrine, named composition types, capped hero, local twelve-column relationships, phone-only linear collapse, current-plus-one performance budget, Media Center behavior, route-scoped Amadeus neutralization, and durable build order.

`.github/workflows/black-hole-presentation-ci.yml` syntax-checks the Maximum-Shelf runtime, structural compositor, and composed runtime with Node before running the Python contracts.

A representative local Chromium story-layout fixture was rendered at 1920, 1366, 1024, 800, and 390px. Those fixture renders showed the intended multi-module desktop relationships, linear phone grouping, normal media proportions, and no horizontal overflow. The fixture validates the composition model; the real Edublogs route remains the required CDN/theme/browser smoke test.

## Scope

Application styling remains beneath `#hrv-black-hole-museum-root` except for narrowly documented compatibility selectors gated behind `html.hrv-route-black-hole-lab-ready`.

Historical runtime/layout laboratories and older classroom pages are evidence sources. They are not edited by this page system and are not treated as limits on what the modern repository architecture may achieve.
