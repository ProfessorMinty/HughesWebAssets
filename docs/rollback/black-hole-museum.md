# Black Hole Museum Rollback

## Immediate route rollback

Remove the `<script>` element from the dedicated Black Hole Museum Custom HTML block while leaving the native `<section>` intact. The complete readable fallback becomes the permanent route state.

## Full block rollback

Restore the previous Edublogs revision of the dedicated `/repository-page-lab/` page or remove the dedicated block. No unrelated route is modified by this page system.

## Repository rollback

The immutable release is never edited. A later release must point to a new immutable ref. To roll back from a future release, restore the Edublogs script and release-manifest URLs to:

- `v0.1.0-black-hole-lab.1`
- `dist/v0.1.0-black-hole-lab.1/runtime-bootstrap.js`
- `dist/v0.1.0-black-hole-lab.1/release.json`

After rollback, repeat route, signed-out, small-phone, reduced-motion, JavaScript-disabled, and version-marker smoke tests.
