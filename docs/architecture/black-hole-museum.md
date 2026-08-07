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
- Current delivery release: `0.1.0-black-hole-lab.6`
- Current release manifest ref: `ff5c8c4433c9241d7a853c2b6bfdf68773b34b86`
- Current presentation source ref: `0b50187fe1a3aa6f0d63018d332150abc0d43bb9`
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

Do not move viewport breakout responsibility onto `.bhm-museum`. A dedicated regression test, `scripts/test_black_hole_viewport_contract.py`, validates the effective CSS cascade. The build appends `apps/black-hole-museum/src/viewport-breakout.css` after the base page stylesheet so the proven contract is authoritative.

Release `0.1.0-black-hole-lab.3` remains preserved as the isolated viewport correction and stable presentation rollback target.

## Maximum-shelf presentation contract

The unpublished black-hole laboratory is the ceiling test, not the balanced production default. The presentation layer therefore follows the Revised Arctic Preferred Maximum-Shelf Experience Blueprint literally: one continuous full-width environmental canvas, ten visually distinct chambers, large scientific artifacts, capped reading widths, strong exhibit lighting, quiet recovery spaces, layered depth, and several signature moments instead of one decorative centerpiece.

The source presentation is intentionally split into independent modules:

1. `apps/black-hole-museum/src/page.css` — verified base renderer styling and interaction states.
2. `apps/black-hole-museum/src/viewport-breakout.css` — the proven Edublogs full-viewport mount contract.
3. `apps/black-hole-museum/src/maximum-shelf.css` — subject-driven museum atmosphere, scale, chamber identity, artifact staging, responsive pocket-museum behavior, and Still Museum equivalents.
4. `apps/black-hole-museum/src/maximum-shelf-enhancements.css` — continuous lightfield, gallery transitions, chamber-scale identity, threshold architecture, lensing reticle, EHT network illumination, rotunda artifact bays, and scroll-journey cues.
5. `apps/black-hole-museum/src/theme-amadeus.css` — confirmed route-scoped theme compatibility only.

The build composes them in that exact order. The presentation and compatibility layers must not be folded into the historical laboratories or turned into site-wide CSS.

## Maximum-shelf runtime contract

`apps/black-hole-museum/src/maximum-shelf-runtime.js` is a decorator around the already-verified immutable `.2` renderer. It calls the verified renderer first and adds environmental elements only after the scientific museum has mounted successfully.

The decorator adds:

- continuous environmental lightfield layers;
- receding threshold architecture;
- large decorative chamber numbers and names;
- transition markers between the ten exhibit chambers;
- a decorative lensing reticle;
- a synchronized visual network overlay for the EHT Earth exhibit;
- monumental artifact-bay framing in the Twin-Ring Rotunda;
- a museum-journey progress rail;
- active-chamber atmosphere state;
- a presentation version field in repository diagnostics.

Decorative nodes are `aria-hidden`. Motion obeys the museum pause state and `prefers-reduced-motion`. Forced-colors mode removes decorative spatial layers. The decorator chains its cleanup work into the existing `mount.__bhmDestroy` lifecycle.

Release `0.1.0-black-hole-lab.6` reuses the already-verified `.2` bootstrap, scientific renderer, content, experience manifest, and media. Its tiny delivery entry point exports the maximum-shelf runtime pinned to source commit `0b50187fe1a3aa6f0d63018d332150abc0d43bb9`. Its stylesheet imports the immutable `.2` base plus all presentation modules from that same exact source commit. The release manifest is pinned at `ff5c8c4433c9241d7a853c2b6bfdf68773b34b86`.

Releases `.4` and `.5` were internal presentation candidates created during the live compatibility/design pass and were superseded before final handoff. They are not the current channel release.

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

`scripts/test_black_hole_presentation_contract.py` rejects an unscoped compatibility selector and checks the viewport, presentation, environmental runtime, responsive, reduced-motion, cleanup, and build-composition contracts.

## Scope

Application styling remains rooted beneath `#hrv-black-hole-museum-root` except for narrowly documented compatibility selectors gated behind `html.hrv-route-black-hole-lab-ready`.

The historical `test/repo-runtime-lab/` and `test/repo-layout-lab/` directories are evidence sources and are not replaced or edited by this package.
