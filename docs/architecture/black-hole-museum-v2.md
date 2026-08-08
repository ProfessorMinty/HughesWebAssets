# Black Hole Museum V2 Architecture

## Status

V2 is a clean presentation rebuild on `feature/black-hole-presentation-v2`, created from exact source commit `c18a87560ff529eb7d5ad496522b9f5020bc688a`.

The historical `.12` release, its immutable artifacts, and the `black-hole-lab` channel are not modified by V2 development. V2 uses its own staging channel: `black-hole-v2-lab`.

## Governing rule

**Keep the engine. Build a new car.**

V2 preserves verified science, authoritative asset metadata, accessibility principles, fallback behavior, performance budgeting, and release discipline. It does not inherit the failed presentation stack.

No V2 source imports or depends on:

- `page.css`
- `maximum-shelf.css`
- `maximum-shelf-enhancements.css`
- `maximum-shelf-finishing.css`
- `maximum-shelf-wide-performance.css`
- `maximum-shelf-composition.css`
- `maximum-shelf-structure.css`
- `maximum-shelf-structure-preflight.css`
- `maximum-shelf-runtime.js`
- `maximum-shelf-composed-runtime.js`
- `maximum-shelf-structure.js`

There is no post-render DOM compositor in V2.

## Fresh source island

V2 source lives under `apps/black-hole-museum/src/v2/`:

- `renderer.js` constructs the approved semantic compositions directly.
- `presentation.css` is the fresh page presentation system and root viewport breakout owner.
- `interactions.js` contains isolated scientific interaction components without page-layout authority.
- `runtime.js` contains performance/media/lifecycle helpers without page-layout authority.
- `amadeus-compat.css` contains only the minimal proven theme neutralization required after successful enhancement.

## Visual architecture

Full width belongs to atmosphere. Human-scale compositions live inside it.

The renderer creates the story directly as:

1. page hero
2. opening recap cluster
3. lensing interactive pair
4. gravity evidence cluster
5. star-orbit observation pair
6. Earth telescope cluster
7. three-stage reconstruction story
8. M87* / Sagittarius A* comparison pair
9. Warped Light interactive plus companion and supporting gallery
10. anatomy plus visible myth/fact cluster
11. compact paired-player Media Center
12. known/unknown split with evidence pullback
13. calm credits ledger

Local composition zones vary by subject. They are not one global website container. Feature, standard, and small modules are capped independently so available viewport width does not inflate normal content.

Phone width intentionally becomes a linear reading edition. Generic viewport-height chamber mandates are prohibited.

## Runtime behavior preserved by extraction

The following proven behaviors are preserved as small helpers rather than inherited presentation wrappers:

- current-plus-one-ahead runtime budgeting
- dormant native-video pause and `preload=none`
- next-section metadata warmup
- privacy-enhanced YouTube embeds
- `autoplay=0`
- normal YouTube controls
- lazy iframe creation and removal by viewport proximity
- reduced-motion awareness
- explicit cleanup of observers, listeners, videos, and iframes
- section wayfinding state

Scientific interaction logic is likewise separated from old wrappers for lensing, evidence clues, orbit tracing, observatory-network activation, reconstruction state, comparison state, warped-light controls, and anatomy layers.

## Edublogs three-tab contract

### HTML tab

`docs/deployment/black-hole-v2-edublogs-html.html`

Owns only:

- semantic native fallback
- unique V2 mount root
- page identity attributes
- readable no-JavaScript state

Mount id: `hrv-black-hole-v2-root`

Page identity: `repository-page-lab-black-holes-v2`

Page system: `black-hole-museum-v2`

### CSS tab

`docs/deployment/black-hole-v2-edublogs-css.css`

Owns only fallback readability and safety. It does not contain the enhanced page presentation.

### JavaScript tab

`docs/deployment/black-hole-v2-edublogs-javascript.js`

Owns only the page-local enhancement transaction:

- wait for DOM readiness
- validate the semantic mount contract
- fetch the exact pinned V2 staging release manifest
- load repository CSS
- load repository content/assets/experience manifests
- import the repository renderer
- mark the route ready only after successful mounting
- leave the native fallback intact on failure

The loader has no published-slug check, pathname check, WordPress page ID, or theme-global bootstrap dependency. Its presence in the page-local JavaScript tab plus the semantic mount contract establishes page identity.

## Minimal Amadeus compatibility

`amadeus-compat.css` was rebuilt from proven requirements rather than copied from the old adapter.

It activates only behind `html.hrv-route-black-hole-v2-ready` and neutralizes only:

- native page-title/footer entry chrome that conflicts with the enhanced application island
- centered `.site-content > .container` width restrictions
- `.content-area` / `.site-main` width and float restrictions
- article/entry horizontal padding and article-card chrome

It does not repaint the site footer, body, navigation, or unrelated theme surfaces.

## Data foundation policy

The verified `.2` content, asset, and experience manifests are reusable pinned input, not permanent V2 release architecture.

The first staging release `0.2.0-black-hole-v2-lab.1` intentionally references `.2` as a **temporary pinned seed** so the new presentation can be previewed without casually rewriting or duplicating the verified science foundation during the clean rebuild.

`scripts/build_black_hole_v2.py` defines the forward release architecture. Future V2 releases built through it publish V2-owned copies of:

- content JSON
- experience JSON
- runtime asset manifest
- optimized scientific media derivatives
- renderer/runtime/interaction modules
- combined V2 presentation plus minimal Amadeus adapter

The builder contains no `.2` runtime dependency and cannot write `channels/black-hole-lab.json`.

## Current V2 staging release

Release: `0.2.0-black-hole-v2-lab.1`

Channel: `black-hole-v2-lab`

Release manifest is pinned independently from the legacy Black Hole channel. Rollback for this unpublished staging path is the native fallback, not `.12`.

The staging release is explicitly marked `unpublished-v2-staging` and records its `.2` use as `temporary-pinned-seed`.

## Testing discipline

`scripts/test_black_hole_v2_contract.py` protects only consequential architectural behaviors:

- no legacy presentation ancestry
- direct renderer composition
- human-scale module caps and local composition zones
- root viewport breakout
- no giant generic chamber heights
- phone linear edition
- reduced motion
- current-plus-one media budgeting
- no-autoplay/lazy YouTube behavior
- minimal route-scoped Amadeus neutralization
- semantic page-local loader identity with no slug/page-ID dependency
- separate V2 staging channel
- temporary `.2` seed status
- future V2-owned data release path

The real unpublished Edublogs Preview remains the required integration smoke test after the three tab contents are installed on the page.
