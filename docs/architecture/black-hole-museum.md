# Arctic Preferred Black Hole Museum Architecture

## Authority order

1. The Revised Arctic Preferred Maximum-Shelf Experience Blueprint controls the creative experience.
2. The Black Hole Research and Creative Planning Package controls scientific claims, classifications, approved media, and credits.
3. The Repository Architecture and Manifest Standard controls route ownership, fallback, manifests, releases, testing, and rollback.

## Route and ownership

- Route: `/repository-page-lab/`
- Route id: `repository-page-lab-black-holes`
- Page system: `black-hole-museum`
- Mount id: `hrv-black-hole-museum-root`
- Current delivery release: `0.1.0-black-hole-lab.7`
- Current release manifest ref: `1d5c39e413952a840b6f94af9f00060e3291face`
- Current presentation source ref: `d548ca221ccf5d740897a4177e173ff40a464e54`
- Preserved viewport-correction release: `0.1.0-black-hole-lab.3`
- Preserved lean base release: `v0.1.0-black-hole-lab.2`
- Preserved source-bearing historical release: `v0.1.0-black-hole-lab.1`

Edublogs owns the route, native navigation, readable fallback, and mount. The repository owns the bootstrap, exact release, manifests, renderer, scoped CSS, interactions, diagnostics, environmental presentation, and media delivery.

## Loading transaction

The bootstrap verifies the exact route, mount contract, schema marker, and fallback before fetching anything. It loads one immutable release manifest with a bounded timeout, then loads exact CSS, content, assets, experience configuration, and the ES module renderer. The verified renderer builds into a detached `DocumentFragment` and commits only after the required manifests validate. The maximum-shelf runtime then decorates that successfully mounted museum without becoming the authority for scientific content or core interactions.

If any pre-commit dependency fails, the native fallback remains. If one station fails after mount, the station becomes a readable local error state while the rest of the museum continues.

## Viewport breakout contract

The full repository page uses the root-level breakout proven by `test/repo-layout-lab/`.

The mount root `#hrv-black-hole-museum-root.bhm-mounted` owns the `100vw`, `left:50%`, and negative half-viewport margins. The rendered `.bhm-museum` fills that root with `width:100%` and `margin:0`.

Do not move viewport breakout responsibility onto `.bhm-museum`. `scripts/test_black_hole_viewport_contract.py` guards this contract. Release `.3` remains preserved as the isolated viewport correction and stable presentation rollback target.

## Maximum-shelf presentation contract

This unpublished laboratory is the creative ceiling test, not the balanced production default. It follows the Revised Arctic Preferred Maximum-Shelf Experience Blueprint as one continuous full-width environmental canvas with ten visually distinct chambers, large scientific artifacts, capped reading widths, strong exhibit lighting, quiet recovery spaces, layered depth, and several signature moments.

Presentation source remains modular:

1. `page.css` — verified base renderer styling and interaction states.
2. `viewport-breakout.css` — proven Edublogs full-viewport mount contract.
3. `maximum-shelf.css` — museum scale, chamber identity, artifact staging, responsive pocket-museum behavior, and Still Museum equivalents.
4. `maximum-shelf-enhancements.css` — continuous lightfield, gallery transitions, threshold architecture, lensing reticle, EHT network illumination, artifact bays, and scroll-journey cues.
5. `maximum-shelf-finishing.css` — small cross-browser spatial fallbacks used by the live-theme finishing pass.
6. `theme-amadeus.css` — confirmed route-scoped theme compatibility only.

The durable build composes the base, breakout, maximum-shelf, environmental, and theme modules. The `.7` lean delivery additionally imports the finishing module from the same exact presentation source commit.

## Maximum-shelf runtime contract

`maximum-shelf-runtime.js` decorates the already-verified immutable `.2` renderer. It calls the verified renderer first and only then adds environmental elements.

The decorator adds continuous lightfield layers, receding threshold architecture, large decorative chamber identities, transitions between the ten exhibit chambers, a lensing reticle, EHT Earth-network illumination, Twin-Ring Rotunda artifact-bay framing, a museum-journey progress rail, active-chamber atmosphere state, and a presentation version field in diagnostics.

Decorative nodes are `aria-hidden`. Motion obeys the museum pause state and `prefers-reduced-motion`. Forced-colors mode removes decorative spatial layers. Cleanup chains into the existing `mount.__bhmDestroy` lifecycle.

Release `.7` reuses the verified `.2` bootstrap, scientific renderer, content, experience manifest, and media. Its delivery entry point and stylesheet are pinned to delivery commit `65d02609abcfde749d81e3108901cc4cf3a7556a`, with presentation modules sourced from exact feature commit `d548ca221ccf5d740897a4177e173ff40a464e54`. The release manifest is pinned at `1d5c39e413952a840b6f94af9f00060e3291face`.

Releases `.4`, `.5`, and `.6` were internal presentation candidates during the live design and compatibility pass. They were superseded before final handoff.

## Theme compatibility contract

The runtime laboratory proved that repository headings must explicitly own their color and typography rather than inheriting theme paint. The layout laboratory established that theme exceptions must be measured and route-scoped.

`theme-amadeus.css` activates only behind `html.hrv-route-black-hole-lab-ready`, which the bootstrap adds after a successful museum mount. Before enhancement succeeds, Edublogs fallback remains conventionally styled.

The observed Amadeus structure and source confirm the relevant native wrappers and defaults: the page title is in `header.entry-header`; `.site-content` adds top spacing; `.page .hentry` adds article padding; `.hentry` supplies the white card background/border/radius/bottom margin; and `.site-footer` is white.

On the enhanced laboratory route the adapter may suppress the native page-title wrapper, zero confirmed page/article spacing, remove the native white article card and entry-footer chrome, reinforce repository text color ownership, and tint the still-functional native site footer into the museum exit. It does not hide or replace the Hughes Room Views site header/navigation and does not apply to any other route.

`scripts/test_black_hole_presentation_contract.py` checks the viewport, presentation, environmental runtime, responsive, reduced-motion, cleanup, theme-scope, and build-composition contracts.

## Scope

Application styling remains rooted beneath `#hrv-black-hole-museum-root` except for narrowly documented compatibility selectors gated behind `html.hrv-route-black-hole-lab-ready`.

The historical `test/repo-runtime-lab/` and `test/repo-layout-lab/` directories are evidence sources and are not replaced or edited by this package.
