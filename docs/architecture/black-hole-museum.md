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
- Release: `0.1.0-black-hole-lab.1`
- Immutable ref: `v0.1.0-black-hole-lab.1`

Edublogs owns the route, native navigation, readable fallback, and mount. The repository owns the bootstrap, exact release, manifests, renderer, scoped CSS, interactions, diagnostics, and media delivery.

## Loading transaction

The bootstrap verifies the exact route, mount contract, schema marker, and fallback before fetching anything. It loads one immutable release manifest with a bounded timeout, then loads exact CSS, content, assets, experience configuration, and the ES module renderer. The renderer builds into a detached `DocumentFragment` and commits only after the required manifests validate.

If any pre-commit dependency fails, the native fallback remains. If one station fails after mount, the station becomes a readable local error state while the rest of the museum continues.

## Scope

All application CSS is rooted beneath `#hrv-black-hole-museum-root`. The only document-level rule is gated behind `html.hrv-route-black-hole-lab-ready` and clips horizontal overflow after a successful mount.

The historical `test/repo-runtime-lab/` and `test/repo-layout-lab/` directories are not replaced or edited by this package.
