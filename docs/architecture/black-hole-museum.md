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
- Current delivery release: `0.1.0-black-hole-lab.3`
- Current release manifest ref: `762566482a6d1202c09082b137c03f66f88b7204`
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

Release `0.1.0-black-hole-lab.3` is a commit-pinned viewport patch that reuses the already-verified immutable `.2` JavaScript, content, experience configuration, and media assets while replacing only the stylesheet delivery layer.

## Scope

All application CSS is rooted beneath `#hrv-black-hole-museum-root`. The only document-level rule is gated behind `html.hrv-route-black-hole-lab-ready` and clips horizontal overflow after a successful mount.

The historical `test/repo-runtime-lab/` and `test/repo-layout-lab/` directories are not replaced or edited by this package.
