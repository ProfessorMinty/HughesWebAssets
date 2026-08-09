/* Hughes Room Views · Photo Album end-to-end test · Edublogs JavaScript tab */
(() => {
  'use strict';

  const KEY = '__HRV_PHOTO_ALBUM_E2E_LOADER__';
  const VERSION = 'photo-album-e2e-loader-0.1.0';
  const ROOT_ID = 'hrv-photo-album-test';
  const EXPECTED_RELEASE = '0.1.0-photo-album-e2e.1';
  const PAGE_SYSTEM = 'photo-album-e2e-test';
  const RELEASE_MANIFEST =
    'https://cdn.jsdelivr.net/gh/ProfessorMinty/HughesWebAssets@d9b8724b558d4edaee9d7a867ddcfc891d84406a/labs/photo-album-end-to-end-test/release.json';
  const TIMEOUT_MS = 12000;

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback, { once: true });
    } else {
      callback();
    }
  }

  function setStatus(root, message) {
    const node = root.querySelector('#hrv-test-status');
    if (node) node.textContent = message;
  }

  async function fetchJson(url, label) {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        cache: 'no-store',
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`${label} returned HTTP ${response.status}.`);
      }

      return await response.json();
    } finally {
      window.clearTimeout(timer);
    }
  }

  function loadStyle(url) {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = url;
      link.dataset.hrvPhotoAlbumE2eStyle = 'repository';
      link.addEventListener('load', () => resolve(link), { once: true });
      link.addEventListener(
        'error',
        () => reject(new Error(`Photo Album repository stylesheet failed: ${url}`)),
        { once: true }
      );
      document.head.appendChild(link);
    });
  }

  ready(async () => {
    const root = document.getElementById(ROOT_ID);
    if (!root) return;

    const status = root.querySelector('#hrv-test-status');
    const gallery = root.querySelector('#hrv-test-gallery');

    if (!status || !gallery) {
      root.dataset.hrvState = 'contract-mismatch';
      console.error('[HRV Photo Album E2E] Semantic mount contract mismatch.');
      return;
    }

    if (window[KEY]) {
      root.dataset.hrvDuplicateLoader = 'ignored';
      console.warn('[HRV Photo Album E2E] Duplicate page-local loader ignored.');
      return;
    }

    window[KEY] = {
      version: VERSION,
      startedAt: Date.now()
    };

    root.dataset.hrvState = 'checking-release';
    root.setAttribute('aria-busy', 'true');
    setStatus(root, 'Checking the pinned Photo Album repository release…');

    let injectedStyle = null;

    try {
      const release = await fetchJson(RELEASE_MANIFEST, 'Photo Album release manifest');

      if (
        release?.schemaVersion !== '1.0' ||
        release?.release !== EXPECTED_RELEASE
      ) {
        throw new Error('Unexpected Photo Album release manifest.');
      }

      const system = release.pageSystems?.[PAGE_SYSTEM];

      if (
        !system?.script?.url ||
        !system?.style?.url ||
        !system?.data?.url
      ) {
        throw new Error('Photo Album release manifest is missing required resources.');
      }

      root.dataset.hrvRelease = release.release;
      root.dataset.hrvCommit = release.commit || '';
      root.dataset.hrvState = 'loading-repository';
      setStatus(root, 'Loading the pinned Photo Album repository renderer…');

      const module = await import(system.script.url);

      if (typeof module?.mountPhotoAlbumTest !== 'function') {
        throw new Error('Photo Album repository renderer entry point is unavailable.');
      }

      injectedStyle = await loadStyle(system.style.url);

      await module.mountPhotoAlbumTest({
        root,
        manifestUrl: system.data.url,
        release,
        timeoutMs: TIMEOUT_MS
      });

      root.removeAttribute('aria-busy');
      root.dataset.hrvState = 'ready';

      console.info('[HRV Photo Album E2E] Repository enhancement ready.', {
        loader: VERSION,
        release: release.release,
        commit: release.commit,
        manifest: system.data.url
      });
    } catch (error) {
      if (injectedStyle) injectedStyle.remove();
      root.removeAttribute('aria-busy');
      root.dataset.hrvState = 'failed';
      gallery.replaceChildren();
      setStatus(
        root,
        'The repository Photo Album enhancement is unavailable. The test shell remains readable.'
      );
      console.error('[HRV Photo Album E2E] Enhancement failed; test shell preserved.', error);
    }
  });
})();
