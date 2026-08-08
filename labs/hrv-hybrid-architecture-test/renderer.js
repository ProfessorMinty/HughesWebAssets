(() => {
  'use strict';

  const ROOT_ID = 'hrv-hybrid-root';
  const RENDERER_VERSION = 'hybrid-lab-0.1.0';
  const scriptUrl = document.currentScript?.src;

  if (window.__HRV_REPO_HYBRID_LAB__) return;
  window.__HRV_REPO_HYBRID_LAB__ = true;

  const root = document.getElementById(ROOT_ID);
  if (!root) return;

  const target = root.querySelector('[data-hrv-enhancement]');
  const fallback = root.querySelector('[data-hrv-fallback]');
  if (!target || !fallback || !scriptUrl) return;

  const manifestUrl = new URL('./manifest.json', scriptUrl).href;

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function validateManifest(data) {
    return Boolean(
      data &&
      data.schemaVersion === '1.0' &&
      data.pageId === 'hrv-hybrid-architecture-test' &&
      data.presentation &&
      typeof data.presentation.title === 'string' &&
      Array.isArray(data.cards)
    );
  }

  async function fetchManifest() {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 6000);

    try {
      const response = await fetch(manifestUrl, {
        cache: 'no-store',
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`Manifest request failed: ${response.status}`);
      }

      return await response.json();
    } finally {
      window.clearTimeout(timer);
    }
  }

  function render(data) {
    const experience = el('section', 'hrv-repo-experience');
    experience.setAttribute('aria-labelledby', 'hrv-repo-test-title');

    const eyebrow = el('p', 'hrv-repo-eyebrow', data.presentation.eyebrow);
    const title = el('h1', 'hrv-repo-title', data.presentation.title);
    title.id = 'hrv-repo-test-title';
    const lede = el('p', 'hrv-repo-lede', data.presentation.lede);
    const status = el('p', 'hrv-repo-status', data.presentation.statusLabel);

    const grid = el('div', 'hrv-repo-grid');

    data.cards.forEach((card) => {
      const article = el('article', 'hrv-repo-card');
      article.dataset.cardId = card.id || '';
      article.append(
        el('h2', '', card.title || ''),
        el('p', '', card.body || '')
      );
      grid.append(article);
    });

    experience.append(eyebrow, title, lede, status, grid);

    target.replaceChildren(experience);
    target.hidden = false;

    root.classList.add('hrv-repo-ready');
    root.dataset.hrvRuntime = RENDERER_VERSION;
    root.dataset.hrvManifestVersion = data.contentVersion || 'unknown';
    root.dataset.hrvFallbackState = 'enhanced';

    /* The fallback is hidden only after manifest validation and successful render. */
    fallback.hidden = true;

    console.info('[HRV Hybrid Lab] Repository enhancement ready.', {
      renderer: RENDERER_VERSION,
      manifest: data.contentVersion,
      manifestUrl
    });
  }

  fetchManifest()
    .then((data) => {
      if (!validateManifest(data)) {
        throw new Error('Manifest validation failed.');
      }
      render(data);
    })
    .catch((error) => {
      root.dataset.hrvRuntime = 'native-fallback';
      root.dataset.hrvFallbackState = 'visible';
      target.hidden = true;
      fallback.hidden = false;
      console.warn('[HRV Hybrid Lab] Enhancement failed; native fallback preserved.', error);
    });
})();
