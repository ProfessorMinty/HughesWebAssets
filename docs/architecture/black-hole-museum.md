# Arctic Preferred Black Hole Museum Architecture

## Authority order

1. The Revised Arctic Preferred Maximum-Shelf Experience Blueprint controls the creative experience.
2. The Black Hole Research and Creative Planning Package controls scientific claims, classifications, approved scientific media, and credits.
3. The Repository Architecture and Manifest Standard controls route ownership, fallback, manifests, releases, testing, and rollback.
4. The historical `test/repo-layout-lab/` and `test/repo-runtime-lab/` proofs control already-tested Edublogs layout/runtime behavior unless new evidence explicitly supersedes them.

## Route and ownership

- Route: `/repository-page-lab/`
- Route id: `repository-page-lab-black-holes`
- Page system: `black-hole-museum`
- Mount id: `hrv-black-hole-museum-root`
- Current delivery release: `0.1.0-black-hole-lab.8`
- Current release manifest ref: `8bc03e77770a00da3cdc2b0508c9be8db889ffa2`
- Current presentation source ref: `fc977a7f2d212513a50c9bd798a7e62c0afe6983`
- Previous visual checkpoint: `0.1.0-black-hole-lab.7`
- Preserved viewport correction: `0.1.0-black-hole-lab.3`
- Verified lean science/media foundation: `v0.1.0-black-hole-lab.2`
- Preserved source-bearing historical release: `v0.1.0-black-hole-lab.1`

Edublogs owns the route, native navigation, semantic fallback, and mount. The repository owns the enhanced-mode canvas, exact release, manifests, renderer, scoped CSS, interactions, diagnostics, environmental presentation, optional Media Center, and media delivery.

## Loading transaction

The bootstrap verifies the exact route, mount contract, schema marker, and fallback before fetching anything. It loads one immutable release manifest with a bounded timeout, then exact CSS, content, assets, experience configuration, and the ES module renderer. The verified `.2` scientific renderer mounts first. Maximum-Shelf presentation decorates only after that mount succeeds.

A failed enhancement returns to the native fallback. A successful enhancement is never allowed to solve an error by retreating into the Amadeus centered article container.

## Viewport breakout contract

The enhanced repository page uses the root-level breakout proven by `test/repo-layout-lab/`.

`#hrv-black-hole-museum-root.bhm-mounted` owns `100vw`, `left:50%`, and the symmetric negative half-viewport margins. `.bhm-museum` fills that root with `width:100%` and `margin:0`.

Do not move viewport breakout responsibility onto a child. Do not reintroduce a desktop museum `max-width` shell. `scripts/test_black_hole_viewport_contract.py` guards the proven breakout.

## Desktop horizontal-canvas contract

Release `.8` makes the desktop rule explicit: the viewport is a museum floor plan, not a blog-column container.

On desktop and normal tablet widths, exhibit structures should use multiple horizontal lanes whenever the content supports it. A story plaque may occupy the left lane while an interactive instrument occupies the center/right. Three related elements may use left/center/right. Observation pairs and media sets may use two- or four-bay grids. Local prose components may cap line length for readability, but those text limits must never become outer-page width limits.

The single vertical stack is the intentional mobile edition only.

`maximum-shelf-wide-performance.css` is the final wide-layout authority. It explicitly removes the old museum-width ceiling, enlarges the typography, prevents ordinary exhibit words from splitting mid-word, and provides two- and three-lane layouts for the major stations.

## Amadeus compatibility contract

The runtime laboratory proved repository headings must explicitly own their text paint. The layout laboratory proved theme exceptions must be route-scoped.

`theme-amadeus.css` activates only behind `html.hrv-route-black-hole-lab-ready`. In successful enhanced mode it neutralizes the native page-title strip, `.site-content` spacing, the centered `.site-content > .container`, fixed/floated `.content-area`, page-entry padding, white article card, and entry-footer chrome. The site header/navigation remain native. The native footer remains functional but is visually integrated into the dark museum exit.

This adapter exists to remove confirmed Amadeus constraints, not to recreate a second site-wide CSS system.

## Maximum-Shelf source layers

Presentation remains intentionally modular:

1. `page.css` — verified base renderer styling and core interaction states.
2. `viewport-breakout.css` — proven Edublogs mount-root breakout.
3. `maximum-shelf.css` — primary museum scale, chamber identity, artifacts, phone edition, and Still Museum treatment.
4. `maximum-shelf-enhancements.css` — environmental lightfield, transitions, threshold architecture, reticles, network illumination, artifact bays, and journey cues.
5. `maximum-shelf-finishing.css` — small cross-browser spatial fallbacks.
6. `maximum-shelf-wide-performance.css` — full horizontal desktop composition, larger readable type, word-wrap protection, paint-budget reductions, and dormant-chamber styling.
7. `maximum-shelf-media-center.css` — optional simulated YouTube Media Center presentation.
8. `theme-amadeus.css` — route-scoped compatibility adapter.

The durable build composes those modules in that order.

## Runtime and scroll budget

`maximum-shelf-runtime.js` decorates the verified immutable `.2` renderer rather than replacing its scientific authority.

Release `.8` uses a `current-plus-one-ahead` scroll budget. The runtime identifies the current chamber and keeps exactly one chamber in the scroll direction warm. Distant chambers remain in the semantic DOM but become dormant: their animations pause, native video is paused and set to `preload=none`, and `content-visibility` allows the browser to skip unnecessary rendering work. The next chamber may preload metadata; the current chamber may use its full presentation budget.

The runtime also removes redundant laboratory controls, defaults the Twin-Ring Rotunda to the useful side-by-side comparison state, and strengthens interaction states that were visually ambiguous in live testing.

Cleanup chains into the existing `mount.__bhmDestroy` lifecycle.

## Simulated YouTube Media Center

The real classroom workflow uses one or more YouTube videos approved by Ms. Hughes. No such approval exists for this prototype, so `.8` adds an explicitly simulated Media Center between Station 09 and Station 10.

Prototype selections:

- National Geographic — `Black Holes 101` (`kOEDG3j1bjs`)
- CrashCourse — `Black Holes: Crash Course Astronomy #33` (`qZWPBKULkdQ`)

The players use `youtube-nocookie.com`, standard YouTube controls, `autoplay=0`, and no programmatic autoplay. The iframes do not exist at initial museum mount. An `IntersectionObserver` creates them only when the Media Center enters a one-viewport prefetch buffer. Leaving that buffered region removes the iframes, which stops playback and releases the external player overhead.

The Media Center is two-up on desktop and one-column on mobile. Its visible label states that it is a simulated selection and not a record of Ms. Hughes approval.

## Releases and rollback

`.8` reuses the verified `.2` scientific content, experience manifest, twelve scientific media assets, and bootstrap. Its delivery CSS and JS are pinned to delivery commit `12c36263bfeae6a6c252b5271435ae0d6c822f38`; source presentation is pinned to `fc977a7f2d212513a50c9bd798a7e62c0afe6983`; the release manifest is pinned at `8bc03e77770a00da3cdc2b0508c9be8db889ffa2`.

`.7` remains the immediate visual rollback. `.3` remains the stable isolated viewport-correction rollback. `.1` and `.2` remain preserved.

## Testing

`scripts/test_black_hole_viewport_contract.py` guards the historical root-breakout contract.

`scripts/test_black_hole_presentation_contract.py` guards heading ownership, horizontal desktop composition, mobile-only collapse, current-plus-one runtime budgeting, dormant video behavior, Media Center no-autoplay/privacy requirements, route-scoped Amadeus neutralization, and build-module order.

`.github/workflows/black-hole-presentation-ci.yml` was added as a lightweight remote regression gate for those two tests. The connected GitHub surface did not expose a completed Actions run during the `.8` assembly, so the live Edublogs route remains the required browser/performance smoke test before considering the presentation pass verified.

## Scope

Application styling remains rooted beneath `#hrv-black-hole-museum-root` except for narrowly documented compatibility selectors gated behind `html.hrv-route-black-hole-lab-ready`.

The historical runtime/layout laboratories are preserved as evidence and are not edited by this page system.
