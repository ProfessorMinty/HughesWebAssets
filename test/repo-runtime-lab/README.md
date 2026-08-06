# Hughes Room Views Repository Runtime Laboratory

Build: `2026.08.05.1`  
Build timestamp: `2026-08-06T00:00:00Z`

This isolated test harness measures how much of an Edublogs page can be owned by externally hosted repository code. It does not replace any production page or the original `test/edublogs-test/test-content.json` connection proof.

## Files

- `bootstrap.js` — minimal Edublogs bridge that locates one mount, loads CSS, and loads the runtime.
- `index.js` — canonical test runtime, lifecycle owner, diagnostics, interactions, and browser API tests.
- `test-page.css` — fully scoped visual system, responsive behavior, motion, focus states, and reduced-motion rules.
- `test-page.html` — repository-hosted page structure inserted into the Edublogs mount.
- `test-data.json` — dynamic card data fetched by the runtime.
- `secondary.js` — independently loaded secondary classic script.
- `dynamic-module.js` — dynamically imported ES module.
- `assets/lab-orbit.svg` — external SVG resource.
- `index.html` — standalone repository preview shell.

## Edublogs bootstrap

Place this in a Custom HTML block on the dedicated test page only. The build query is intentionally visible and versioned.

```html
<div id="hrv-repo-test-root">
  Repository test is loading.
</div>
<script
  src="https://cdn.jsdelivr.net/gh/ProfessorMinty/HughesWebAssets@main/test/repo-runtime-lab/bootstrap.js?v=2026.08.05.1"
  data-build="2026.08.05.1"
  data-mount="hrv-repo-test-root">
</script>
```

The CDN path is used for executable JavaScript and CSS because it serves browser-appropriate MIME types. The repository remains the source of truth and the branch remains `main`.

## Console prefix

Every status result and diagnostic message uses:

```text
[HRV REPO TEST]
```

## Rollback

The exact pre-laboratory baseline is commit:

```text
c1d3ec6e290376c0c7b8d721470d0c9dc2fea931
```

Rollback the Edublogs test page by restoring its previous `#hrv-repo-test` mount and previous footer loader, or remove the new `#hrv-repo-test-root` block and `bootstrap.js` script. No production page depends on this directory.

To roll back the repository files themselves, revert the single laboratory commit or delete only `test/repo-runtime-lab/`. Do not change `test/edublogs-test/test-content.json`.

## Manual verification order

1. Confirm the large laboratory heading and build identifier.
2. Confirm the status panel begins filling.
3. Exercise marquee, animation, tabs, accordion, modal, form, theme, cards, diagnostics copy, duplicate mount, unmount, and remount controls.
4. Refresh and verify local/session storage behavior and no duplicated reactions.
5. Edit harmless text outside the mount in Edublogs, save, and retest.
6. Test signed out/private browsing.
7. Test phone layout and reduced motion.
8. Change the visible build number in a later release and compare normal refresh, hard refresh, cache-busted URL, and private browsing.
