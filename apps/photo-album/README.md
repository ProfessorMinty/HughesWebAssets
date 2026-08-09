# Hughes Room Views Photo Album

Status: active production implementation path.

This application is the permanent Photo Album code path. It is promoted from the proven end-to-end laboratory without carrying laboratory naming into published ownership.

## Naming law

Anything reused from the laboratory and intended to remain active in the published implementation must be normalized now to its permanent semantic name.

Do not introduce or retain `test`, `e2e`, `staging`, or `canary` in permanent code identifiers, bindings, configuration keys, page-system identifiers, DOM contracts, runtime entry points, or resource ownership names merely because the current configured value points at rehearsal infrastructure.

Environment differences belong in configuration values and safety gates, not permanent identifier names.

Current permanent semantic configuration names include:

- `DRIVE_ROOT_FOLDER_ID`
- `ALBUM_ID`
- `SCHOOL_YEAR`
- `CURRENT_MANIFEST_KEY`
- `GOOGLE_MTLS`
- `IMAGES`
- `PHOTO_STORE`
- `GOOGLE_X509_SUBJECT_TOKEN`

Current permanent frontend/runtime names include:

- page system: `photo-album`
- mount root: `#hrv-photo-album`
- loader key: `__HRV_PHOTO_ALBUM_LOADER__`
- renderer entry point: `mountPhotoAlbum()`
- ready class: `hrv-photo-album-repo-ready`

The frozen laboratory under `labs/photo-album-end-to-end-test/` remains historical proof and is not the active production path.

## Source ownership

- `src/renderer.js` owns repository-side rendering and manifest validation.
- `src/page.css` owns enhanced Photo Album presentation.
- Edublogs will own only the route, semantic fallback, tiny safety CSS, and tiny pinned loader.
- Cloudflare owns ingestion, reconciliation, derivatives, state, manifest delivery, and controlled media delivery.

## Current rehearsal rule

The active code uses permanent names even while `DRIVE_ROOT_FOLDER_ID` temporarily points at the controlled rehearsal source. Before the real multi-thousand-photo production root is attached, the pipeline must prove discovery-only mode, hard processing caps, two derivatives, three delivery paths, archive exclusion, and idempotency.
