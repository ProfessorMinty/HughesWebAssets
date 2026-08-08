/* Hughes Room Views · Black Hole Museum V2 · Edublogs JavaScript tab */
(() => {
  'use strict';

  const KEY = '__HRV_BLACK_HOLE_V2_PAGE_LOADER__';
  const VERSION = 'v2-page-local-0.1.0';
  const ROOT_ID = 'hrv-black-hole-v2-root';
  const PAGE_ID = 'repository-page-lab-black-holes-v2';
  const PAGE_SYSTEM = 'black-hole-museum-v2';
  const EXPECTED_RELEASE = '0.2.0-black-hole-v2-lab.6';
  const RELEASE_MANIFEST = 'https://cdn.jsdelivr.net/gh/ProfessorMinty/HughesWebAssets@b66d97c606d9efee016cddc6af28afc1bb2dd4be/dist/v0.2.0-black-hole-v2-lab.6/release.json';
  const TIMEOUT_MS = 12000;

  function ready(callback) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', callback, { once: true });
    else callback();
  }

  function status(root, message, state = 'info') {
    const node = root.querySelector('[data-hrv-native-status]');
    if (!node) return;
    node.textContent = message;
    node.dataset.state = state;
  }

  async function fetchJson(url, label) {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const response = await fetch(url, { cache: 'no-store', signal: controller.signal });
      if (!response.ok) throw new Error(`${label} returned HTTP ${response.status}`);
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
      link.dataset.hrvBlackHoleV2Style = 'staging';
      link.addEventListener('load', () => resolve(link), { once: true });
      link.addEventListener('error', () => reject(new Error(`V2 stylesheet failed: ${url}`)), { once: true });
      document.head.appendChild(link);
    });
  }

  ready(async () => {
    const root = document.getElementById(ROOT_ID);
    if (!root) return;

    if (window[KEY]) {
      root.dataset.hrvDuplicateLoader = 'ignored';
      console.warn('[HRV BHM V2] Duplicate page-local loader ignored.');
      return;
    }
    window[KEY] = { version: VERSION, startedAt: Date.now() };

    if (
      root.dataset.hrvPage !== PAGE_ID ||
      root.dataset.hrvPageSystem !== PAGE_SYSTEM ||
      root.dataset.hrvSchema !== '1.0' ||
      !root.querySelector('[data-hrv-fallback]')
    ) {
      root.dataset.hrvState = 'contract-mismatch';
      status(root, 'The V2 enhancement was refused because the semantic page contract is incomplete.', 'failed');
      console.error('[HRV BHM V2] Semantic mount contract mismatch.');
      return;
    }

    root.setAttribute('aria-busy', 'true');
    root.dataset.hrvState = 'checking';
    status(root, 'Checking the pinned V2 staging release…');

    try {
      const release = await fetchJson(RELEASE_MANIFEST, 'V2 release manifest');
      if (release.schemaVersion !== '1.0' || release.release !== EXPECTED_RELEASE) {
        throw new Error('Unexpected V2 release manifest.');
      }
      const system = release.pageSystems?.[PAGE_SYSTEM];
      if (!system?.script?.url || !system?.style?.url || !system?.content?.url || !system?.assets?.url || !system?.experience?.url) {
        throw new Error('V2 release manifest is missing required page-system resources.');
      }

      root.dataset.hrvRelease = release.release;
      root.dataset.hrvCommit = release.commit || '';
      root.dataset.hrvState = 'loading';
      status(root, 'Loading the Black Hole Museum V2…');

      /* Validate all data and the module before introducing enhanced CSS.
         This keeps a failed enhancement visually native even if another request fails quickly. */
      const [content, assets, experience, module] = await Promise.all([
        fetchJson(system.content.url, 'V2 content manifest'),
        fetchJson(system.assets.url, 'V2 asset manifest'),
        fetchJson(system.experience.url, 'V2 experience manifest'),
        import(system.script.url)
      ]);

      if (typeof module?.mountBlackHoleMuseum !== 'function') {
        throw new Error('V2 renderer entry point is unavailable.');
      }

      await loadStyle(system.style.url);
      await module.mountBlackHoleMuseum({ root, mount: root, release, content, assets, experience });
      document.documentElement.classList.add('hrv-route-black-hole-v2-ready');
      root.removeAttribute('aria-busy');
      root.dataset.hrvState = 'ready';
      console.info('[HRV BHM V2] Staging enhancement ready.', { release: release.release, commit: release.commit });
    } catch (error) {
      document.querySelectorAll('link[data-hrv-black-hole-v2-style="staging"]').forEach((link) => link.remove());
      document.documentElement.classList.remove('hrv-route-black-hole-v2-ready');
      root.removeAttribute('aria-busy');
      root.dataset.hrvState = 'failed';
      status(root, 'The enhanced V2 museum is unavailable. The complete readable recap remains available.', 'failed');
      console.error('[HRV BHM V2] Enhancement failed; native fallback preserved.', error);
    }
  });
})();
