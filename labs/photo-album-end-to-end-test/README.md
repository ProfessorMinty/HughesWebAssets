# Hughes Room Views Photo Album End-to-End Test

Status: unpublished launch-critical architecture test.

This lab exists to prove the repository/frontend half of the Photo Album pipeline after the backend path has already been proven:

`Google Drive → X.509 WIF → Cloudflare Worker → Cloudflare Images → private R2 → Worker manifest/media routes`

The repository adds the remaining browser path:

`Edublogs page-local loader → pinned HughesWebAssets release → repository renderer/CSS → Cloudflare manifest/media → visible gallery`

## Ownership

Edublogs owns:

- route/page shell;
- readable fallback HTML;
- tiny fallback CSS;
- tiny DOM-ready bootstrap.

HughesWebAssets owns:

- enhanced renderer;
- enhanced scoped CSS;
- release metadata;
- canonical copies of the three Edublogs deployment tabs.

Cloudflare owns live album state and sanitized media. Photo data is not stored in this repository.

## Current pinned test release

Release: `0.1.0-photo-album-e2e.1`

Source commit:

`3fe0d6e7ce8990b84d573aa376e6861ba2164da3`

Release-manifest commit:

`d9b8724b558d4edaee9d7a867ddcfc891d84406a`

Live test manifest:

`https://hrv-photo-album-test.drminty17.workers.dev/manifest.json`

## Runtime files

- `renderer.js` exports `mountPhotoAlbumTest()`.
- `renderer.css` is scoped to `#hrv-photo-album-test`.
- `release.json` pins the exact repository source commit and the live Cloudflare data endpoint.

## Edublogs deployment copies

Canonical copy/paste files:

- `docs/deployment/photo-album-e2e-edublogs-html.html`
- `docs/deployment/photo-album-e2e-edublogs-css.css`
- `docs/deployment/photo-album-e2e-edublogs-javascript.js`

The JavaScript tab intentionally contains only the page-local loader. It waits for DOM readiness, validates the pinned release manifest, imports the pinned repository renderer, loads the pinned repository stylesheet, and preserves the native test shell if enhancement fails.

## Guardrails

- Do not place classroom photo originals in this repository.
- Do not place the live photo manifest in this repository.
- Do not switch pinned URLs to mutable `@main` references.
- Do not move the full renderer into the Edublogs JavaScript tab.
- Do not create another test Worker, Drive folder, or Edublogs test page.
- Keep the Worker R2 bucket private; public media is delivered only through controlled Worker routes.
