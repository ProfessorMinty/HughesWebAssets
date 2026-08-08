/* Hughes Room Views · Black Hole Museum V2 · Edublogs JavaScript tab */
(() => {
  'use strict';

  const KEY = '__HRV_BLACK_HOLE_V2_PAGE_LOADER__';
  const VERSION = 'v2-page-local-0.1.0';
  const ROOT_ID = 'hrv-black-hole-v2-root';
  const PAGE_ID = 'repository-page-lab-black-holes-v2';
  const PAGE_SYSTEM = 'black-hole-museum-v2';
  const EXPECTED_RELEASE = '0.2.0-black-hole-v2-lab.10';
  const RELEASE_MANIFEST = 'https://cdn.jsdelivr.net/gh/ProfessorMinty/HughesWebAssets@e658e5e74950380772fc456fdb3f24a064eed730/dist/v0.2.0-black-hole-v2-lab.10/release.json';
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

  function loadStyle(url, role) {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = url;
      link.dataset.hrvBlackHoleV2Style = role;
      link.addEventListener('load', () => resolve(link), { once: true });
      link.addEventListener('error', () => reject(new Error(`V2 ${role} stylesheet failed: ${url}`)), { once: true });
      document.head.appendChild(link);
    });
  }

  function describeNode(node) {
    if (!(node instanceof Element)) return null;
    const rect = node.getBoundingClientRect();
    return {
      tag: node.tagName.toLowerCase(),
      id: node.id || '',
      classes: [...node.classList].slice(0, 8).join(' '),
      role: node.getAttribute('role') || '',
      page: node.getAttribute('data-hrv-page') || '',
      pageSystem: node.getAttribute('data-hrv-page-system') || '',
      left: Math.round(rect.left * 10) / 10,
      right: Math.round(rect.right * 10) / 10,
      width: Math.round(rect.width * 10) / 10,
      text: (node.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 120)
    };
  }

  function collectIntegrationDiagnostics(root, release) {
    const scrolling = document.scrollingElement || document.documentElement;
    const clientWidth = scrolling.clientWidth;
    const scrollWidth = scrolling.scrollWidth;
    const overflow = [];

    document.body.querySelectorAll('*').forEach((node) => {
      const rect = node.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      if (rect.left < -1 || rect.right > clientWidth + 1) {
        overflow.push(describeNode(node));
      }
    });

    const ancestry = [];
    let current = root;
    for (let depth = 0; current && depth < 8; depth += 1, current = current.parentElement) {
      ancestry.push({
        depth,
        node: describeNode(current),
        nextSibling: describeNode(current.nextElementSibling),
        previousSibling: describeNode(current.previousElementSibling)
      });
    }

    const cluePatterns = [
      /Explorations Hub Home/i,
      /Next Exploration/i,
      /Previous/i,
      /^\s*Nav\s*$/i
    ];
    const matchedElements = new Set();
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let textNode;
    while ((textNode = walker.nextNode())) {
      const text = (textNode.nodeValue || '').replace(/\s+/g, ' ').trim();
      if (!text) continue;
      if (cluePatterns.some((pattern) => pattern.test(text))) {
        if (textNode.parentElement) matchedElements.add(textNode.parentElement);
      }
    }

    const report = {
      version: 1,
      release: release?.release || '',
      commit: release?.commit || '',
      viewport: {
        innerWidth: window.innerWidth,
        clientWidth,
        scrollWidth,
        overflowDelta: scrollWidth - clientWidth
      },
      overflowElements: overflow.slice(0, 80),
      mountAncestry: ancestry,
      ownershipTextMatches: [...matchedElements].map(describeNode).filter(Boolean)
    };

    window.__HRV_BLACK_HOLE_V2_DIAGNOSTICS__ = report;
    console.groupCollapsed('[HRV BHM V2] Unpublished integration diagnostics');
    console.log('Viewport', report.viewport);
    console.table(report.overflowElements);
    console.log('Mount ancestry and adjacent siblings', report.mountAncestry);
    console.table(report.ownershipTextMatches);
    console.log('Full report is available at window.__HRV_BLACK_HOLE_V2_DIAGNOSTICS__');
    console.groupEnd();
  }

  function scheduleIntegrationDiagnostics(root, release) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => collectIntegrationDiagnostics(root, release));
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
      if (
        !system?.script?.url ||
        !system?.style?.url ||
        !system?.compatStyle?.url ||
        !system?.content?.url ||
        !system?.assets?.url ||
        !system?.experience?.url
      ) {
        throw new Error('V2 release manifest is missing required page-system resources.');
      }

      root.dataset.hrvRelease = release.release;
      root.dataset.hrvCommit = release.commit || '';
      root.dataset.hrvState = 'loading';
      status(root, 'Loading the Black Hole Museum V2…');

      /* Validate all data and the module before introducing enhanced CSS.
         This keeps a failed enhancement visually native if any prerequisite fails. */
      const [content, assets, experience, module] = await Promise.all([
        fetchJson(system.content.url, 'V2 content manifest'),
        fetchJson(system.assets.url, 'V2 asset manifest'),
        fetchJson(system.experience.url, 'V2 experience manifest'),
        import(system.script.url)
      ]);

      if (typeof module?.mountBlackHoleMuseum !== 'function') {
        throw new Error('V2 renderer entry point is unavailable.');
      }

      await loadStyle(system.style.url, 'presentation');
      await loadStyle(system.compatStyle.url, 'compatibility');
      await module.mountBlackHoleMuseum({ root, mount: root, release, content, assets, experience });
      document.documentElement.classList.add('hrv-route-black-hole-v2-ready');
      root.removeAttribute('aria-busy');
      root.dataset.hrvState = 'ready';
      console.info('[HRV BHM V2] Refinement staging enhancement ready.', { release: release.release, commit: release.commit });
      scheduleIntegrationDiagnostics(root, release);
    } catch (error) {
      document.querySelectorAll('link[data-hrv-black-hole-v2-style]').forEach((link) => link.remove());
      document.documentElement.classList.remove('hrv-route-black-hole-v2-ready');
      root.removeAttribute('aria-busy');
      root.dataset.hrvState = 'failed';
      status(root, 'The enhanced V2 museum is unavailable. The complete readable recap remains available.', 'failed');
      console.error('[HRV BHM V2] Enhancement failed; native fallback preserved.', error);
    }
  });
})();
