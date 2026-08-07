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
- Current delivery release: `0.1.0-black-hole-lab.5`
- Current release manifest ref: `ddb414f95c201238820299701c6264f04b3c7be5`
- Preserved viewport-correction release: `0.1.0-black-hole-lab.3`
- Preserved lean base release: `v0.1.0-black-hole-lab.2`
- Preserved source-bearing historical release: `v0.1.0-black-hole-lab.1`

Edublogs owns the route, native navigation, readable fallback, and mount. The repository owns the bootstrap, exact release, manifests, renderer, scoped CSS, interactions, diagnostics, and media delivery.

## Loading transaction

The bootstrap verifies the exact route, mount contract, schema marker, and fallback before fetching anything. It loads one immutable release manifest with a bounded timeout, then loads exact CSS, content, assets, experience configuration, and the ES module renderer. The renderer builds into a detached `DocumentFragment` and commits only after the required manifests validate.

If any pre-commit dependency fails, the native fallback remains. If one station fails after mount, the station becomes a readable local error state while the rest of the museum continues.

## Viewport breakout contract

The full repository page uses the root-level breakout proven by `test/repo-layout-lab/`.

The mount root `#hrv-black-hole-museum-root.bhm-mounted` owns the `100vw`, `left:50%`, and negative half-viewport margins. The rendered `.bhm-museum` fills that root with `width:100%` and `margin:0`.

Do not move viewport breakout responsibility onto `.bhm-museum`. A dedicated regression test, `scripts/test_black_hole_viewport_contract.py`, validates the effective CSS cascade. The build appends `apps/black-hole-museum/src/viewport-breakout.css` after the base page stylesheet so the proven contract is authoritative.

Release `0.1.0-black-hole-lab.3` remains preserved as the isolated viewport correction and stable presentation rollback target.

## Maximum-shelf presentation contract

The unpublished black-hole laboratory is the ceiling test, not the balanced production default. The presentation layer therefore follows the Revised Arctic Preferred Maximum-Shelf Experience Blueprint literally: one continuous full-width environmental canvas, ten visually distinct chambers, large scientific artifacts, capped reading widths, strong exhibit lighting, quiet recovery spaces, layered depth, and several signature moments instead of one decorative centerpiece.

The source presentation is intentionally split into independent modules:

1. `apps/black-hole-museum/src/page.css` — base renderer styling and interaction states.
2. `apps/black-hole-museum/src/viewport-breakout.css` — the proven Edublogs full-viewport mount contract.
3. `apps/black-hole-museum/src/maximum-shelf.css` — subject-driven museum atmosphere, scale, chamber identity, artifact staging, responsive pocket-museum behavior, and Still Museum equivalents.
4. `apps/black-hole-museum/src/theme-amadeus.css` — confirmed route-scoped theme compatibility only.

The build composes them in that exact order. The last two layers must not be folded into the historical laboratories or turned into site-wide CSS.

Release `0.1.0-black-hole-lab.5` reuses the already-verified `.2` bootstrap, renderer, content, experience manifest, and scientific media. Its presentation stylesheet is immutable and imports the `.2` base CSS plus the three presentation modules from exact Git commit `0961fa1cd9f102da7f0eadc8253f72116dbd78c5`. The release manifest is pinned at `ddb414f95c201238820299701c6264f04b3c7be5`.

Release `.4` was an internal presentation candidate created before the confirmed Amadeus page-spacing rules were incorporated. It was superseded before handoff and is not the current channel release.

## Theme compatibility contract

The runtime laboratory proved that repository headings must explicitly own their color and typography rather than inheriting theme paint. The layout laboratory established that theme exceptions must be measured and route-scoped.

`theme-amadeus.css` therefore activates only behind `html.hrv-route-black-hole-lab-ready`, which the bootstrap adds after a successful museum mount. Before enhancement succeeds, Edublogs fallback remains conventionally styled.

The Amadeus page template and stylesheet confirm the relevant native wrappers and spacing: page titles render inside `header.entry-header`; `.site-content` adds top spacing; `.page .hentry` adds article padding; and `.hentry` supplies the white card background, border, radius, and bottom margin.

On the enhanced laboratory route the adapter may:

- suppress the native WordPress entry/page title wrapper so the white `Black Holes and Stuff` strip does not interrupt the installation;
- zero the confirmed `.site-content` and page-entry spacing;
- remove the native article white card, border, radius, and padding;
- remove native entry-content spacing and entry-footer chrome that visually split the museum;
- reinforce repository heading and body color inheritance inside the mount.

It does not replace or hide the Hughes Room Views site header/navigation. It does not apply to any other route.

`scripts/test_black_hole_presentation_contract.py` rejects an unscoped compatibility selector and checks the required presentation/build contracts.

## Scope

Application styling remains rooted beneath `#hrv-black-hole-museum-root` except for narrowly documented compatibility selectors gated behind `html.hrv-route-black-hole-lab-ready`.

The historical `test/repo-runtime-lab/` and `test/repo-layout-lab/` directories are evidence sources and are not replaced or edited by this package.
