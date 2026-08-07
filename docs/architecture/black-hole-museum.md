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
- Current delivery release: `0.1.0-black-hole-lab.10`
- Current release manifest ref: `c3d34cbdbd9c0988f6f0856eafc9b3126aed29ae`
- Delivery asset ref: `774351e0c61e7f43e0afe669da6f344e8eaaf4da`
- Structured source ref: `66206a48d28c3e12194b50c6178d472627c085ac`
- Immediate rollback: `0.1.0-black-hole-lab.9`
- Verified lean science/media foundation: `v0.1.0-black-hole-lab.2`
- Preserved source-bearing historical release: `v0.1.0-black-hole-lab.1`

Edublogs owns the route, native navigation, semantic fallback, and mount. The repository owns the successful enhanced-mode canvas, release manifests, renderer, DOM composition, scoped CSS, interactions, diagnostics, environmental presentation, optional Media Center, and media delivery.

## Loading transaction

The immutable `.2` bootstrap verifies the exact route, mount contract, schema marker, and fallback before loading the release manifest. The verified scientific renderer mounts first. The Maximum-Shelf runtime then adds environmental behavior, performance budgeting, Media Center behavior, and interaction cleanup. Release `.10` adds a final structural composition stage after those proven behaviors mount successfully.

The structural stage moves existing DOM nodes rather than recreating scientific content or interaction controls. Existing buttons, details elements, videos, and event handlers therefore remain owned by the verified renderer/runtime while their visual grouping becomes a real exhibit system.

A failed enhancement returns to the native fallback. A successful enhancement is never allowed to solve an error by retreating into the Amadeus centered article container.

## Viewport breakout contract

The enhanced route uses the root-level breakout proven by `test/repo-layout-lab/`.

`#hrv-black-hole-museum-root.bhm-mounted` owns `100vw`, `left:50%`, and symmetric negative half-viewport margins. `.bhm-museum` fills that root. Viewport breakout responsibility must never move to a descendant card or exhibit.

There is no desktop museum `max-width` shell. Local prose and individual artifacts may have readable size limits, but those limits do not become page limits.

## Structured exhibit contract

Release `.10` corrects a failure visible in the `.8/.9` screenshots: full width alone did not create composition. Large artifacts and narrow plaques still behaved like unrelated floating modules.

Every numbered station now has two structural levels:

1. **Scene entrance/header** — station identity, title, scientific classification, one-sentence takeaway, deeper-reading disclosure, and any station-level action.
2. **Exhibit body** — the dominant observation/interaction plus supporting references arranged for that subject.

`maximum-shelf-structure.js` performs this DOM recomposition after the proven Maximum-Shelf runtime mounts. `maximum-shelf-structure.css` owns the final scene anatomy and typography.

Desktop scene headers use explicit title/summary/action roles. Stations 04, 06, and 09 reverse that header rhythm so the journey does not become a repeated left-title/right-object template.

Specialized anatomy:

- Station 01 becomes an entrance hall with a two-column simulated recap inside the threshold architecture.
- Station 02 becomes one dominant sky/lensing exhibit below the room header.
- Station 03 becomes a primary evidence network with one supporting scientific reference.
- Station 04 becomes an observation theater with the real star-orbit time-lapse as the room-scale artifact.
- Station 05 pairs the Earth/EHT network instrument with its authoritative observatory map.
- Station 06 gives the reconstruction instrument primary weight and the published reconstruction reference secondary weight.
- Station 07 remains intentionally symmetrical because the paired historic observations are the concept.
- Station 08 uses one working warped-light model followed by an editorial supporting-media spread.
- Station 09 makes the scientific anatomy model dominant and the myth-correction wall a deliberate interpretation rail.
- Station 10 preserves the known/unknown conceptual split and follows it with a clean three-artifact evidence pullback.

The simulated Media Center now behaves as a room: its heading/intro precedes the two video players rather than competing with them as a third card.

## Typography and hierarchy contract

The live screenshots established that technically valid 17px-era typography was visually inadequate at modern full-width desktop scale. `.10` raises the museum reading base to approximately 20–23px on desktop, gives station titles exhibit-scale typography, enlarges controls and captions, and keeps classification/source metadata subordinate but legible.

A page may use the whole viewport without making every object equally large. Primary, supporting, and tertiary elements must remain visually distinct.

## Desktop and mobile layout contract

Desktop and normal tablet widths use horizontal composition wherever the content supports it. Full-width means the viewport is available to the designer, not that every child must span edge to edge.

The intentional single-column reading edition begins at phone width (`767px` and below). Mobile stacks the same semantic material without changing its scientific meaning or interaction ownership.

## Performance contract

`maximum-shelf-runtime.js` retains the `current-plus-one-ahead` scroll budget established after live lag was observed. Distant chambers remain semantic DOM but pause animation work, pause native video, set dormant native video to `preload=none`, and use `content-visibility` where appropriate.

The YouTube Media Center keeps privacy-enhanced `youtube-nocookie.com` players, normal controls, `autoplay=0`, and lazy iframe creation/removal based on proximity to the viewport.

The structural compositor does not add scroll listeners, animation loops, media decoders, or duplicate interaction handlers.

## Amadeus compatibility contract

`theme-amadeus.css` activates only behind `html.hrv-route-black-hole-lab-ready`. It neutralizes the native page-title strip, `.site-content` spacing, centered `.site-content > .container`, fixed/floated `.content-area`, page-entry padding, white article card, and entry-footer chrome. Native site navigation remains native and the real site footer remains functional.

Theme compatibility exists to remove confirmed theme constraints. It must never recreate a centered website-content box around repository-native pages.

## Durable source layers

The durable build composes:

1. `page.css` — verified base renderer styling and core interaction states.
2. `viewport-breakout.css` — proven Edublogs mount-root breakout.
3. `maximum-shelf.css` — primary atmosphere and responsive experience.
4. `maximum-shelf-enhancements.css` — environmental transitions and decorative instrumentation.
5. `maximum-shelf-finishing.css` — small cross-browser spatial fallbacks.
6. `maximum-shelf-wide-performance.css` — full-width availability, word-wrap protection, paint-budget reductions, and dormant-chamber styling.
7. `maximum-shelf-media-center.css` — simulated YouTube Media Center.
8. `maximum-shelf-structure.css` — final scene anatomy, typography, and exhibit hierarchy.
9. `theme-amadeus.css` — route-scoped theme compatibility.

The durable JavaScript entry is now `maximum-shelf-composed-runtime.js`, which mounts `maximum-shelf-runtime.js` first and then calls `recomposeBlackHoleMuseum()` from `maximum-shelf-structure.js`.

## Releases and rollback

`.10` reuses the `.9` presentation/media CSS foundation and the verified `.2` scientific content, assets, experience manifest, and bootstrap. Its JavaScript points to the structured source commit `66206a48d28c3e12194b50c6178d472627c085ac`.

Delivery files are pinned at `774351e0c61e7f43e0afe669da6f344e8eaaf4da`; the release manifest is pinned at `c3d34cbdbd9c0988f6f0856eafc9b3126aed29ae`.

`.9` is the immediate rollback. `.3` remains the preserved isolated viewport-correction release. `.1` and `.2` remain immutable historical/scientific foundations.

## Testing

`scripts/test_black_hole_viewport_contract.py` guards the historical root-breakout contract.

`scripts/test_black_hole_presentation_contract.py` now also guards the structured compositor, exhibit-scale typography, non-container desktop composition, specialized scene anatomy, mobile-only single-column collapse, current-plus-one performance budget, Media Center behavior, route-scoped Amadeus neutralization, and durable build order.

`.github/workflows/black-hole-presentation-ci.yml` syntax-checks the Maximum-Shelf runtime, structural compositor, and composed runtime with Node before running the Python contracts. A live Edublogs browser pass remains required because CSS/theme/rendering integration cannot be completely certified by static repository checks.

## Scope

Application styling remains beneath `#hrv-black-hole-museum-root` except for narrowly documented compatibility selectors gated behind `html.hrv-route-black-hole-lab-ready`.

Historical runtime/layout laboratories and older classroom pages are evidence sources. They are not edited by this page system and are not treated as limits on what the modern repository architecture may achieve.
