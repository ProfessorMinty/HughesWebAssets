/* Hughes Room Views · Photo Album end-to-end architecture test renderer */
'use strict';

const RENDERER_VERSION = 'photo-album-e2e-renderer-0.1.0';
const DEFAULT_TIMEOUT_MS = 12000;

function requiredNode(root, selector, label) {
  const node = root.querySelector(selector);
  if (!node) throw new Error(`Photo Album mount is missing ${label}.`);
  return node;
}

function validateManifest(data) {
  if (!data || data.version !== 1 || !Array.isArray(data.photos)) return false;

  return data.photos.every((photo) => (
    photo &&
    typeof photo.url === 'string' &&
    photo.url.startsWith('https://hrv-photo-album-test.drminty17.workers.dev/media/') &&
    (photo.name === undefined || typeof photo.name === 'string') &&
    (photo.alt === undefined || typeof photo.alt === 'string')
  ));
}

async function fetchManifest(url, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      cache: 'no-store',
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`Photo manifest returned HTTP ${response.status}.`);
    }

    const data = await response.json();
    if (!validateManifest(data)) {
      throw new Error('Photo manifest validation failed.');
    }

    return data;
  } finally {
    window.clearTimeout(timer);
  }
}

function createPhotoFigure(photo) {
  const figure = document.createElement('figure');
  figure.className = 'hrv-test-photo';

  const img = document.createElement('img');
  img.src = photo.url;
  img.alt = photo.alt || '';
  img.loading = 'lazy';
  img.decoding = 'async';

  figure.appendChild(img);

  if (photo.name) {
    const caption = document.createElement('figcaption');
    caption.textContent = photo.name;
    figure.appendChild(caption);
  }

  return figure;
}

export async function mountPhotoAlbumTest({
  root,
  manifestUrl,
  release = null,
  timeoutMs = DEFAULT_TIMEOUT_MS
} = {}) {
  if (!(root instanceof Element)) {
    throw new Error('Photo Album renderer requires a valid mount root.');
  }

  if (root.dataset.hrvRendererMounted === 'true') {
    return {
      renderer: RENDERER_VERSION,
      duplicateMountIgnored: true
    };
  }

  if (typeof manifestUrl !== 'string' || !manifestUrl.startsWith('https://')) {
    throw new Error('Photo Album renderer requires an HTTPS manifest URL.');
  }

  const status = requiredNode(root, '#hrv-test-status', 'the status node');
  const gallery = requiredNode(root, '#hrv-test-gallery', 'the gallery node');

  root.dataset.hrvState = 'loading-manifest';
  root.setAttribute('aria-busy', 'true');
  status.textContent = 'Loading processed photos from the repository-backed pipeline…';

  try {
    const manifest = await fetchManifest(manifestUrl, timeoutMs);

    const fragment = document.createDocumentFragment();
    manifest.photos.forEach((photo) => fragment.appendChild(createPhotoFigure(photo)));

    gallery.replaceChildren(fragment);

    const count = manifest.photos.length;
    status.textContent = count === 1
      ? '1 processed photo loaded.'
      : `${count} processed photos loaded.`;

    root.dataset.hrvRendererMounted = 'true';
    root.dataset.hrvState = 'ready';
    root.dataset.hrvRenderer = RENDERER_VERSION;
    root.dataset.hrvManifestGeneratedAt = manifest.generatedAt || '';
    root.dataset.hrvRelease = release?.release || '';
    root.dataset.hrvCommit = release?.commit || '';
    root.classList.add('hrv-photo-album-repo-ready');
    root.removeAttribute('aria-busy');

    console.info('[HRV Photo Album E2E] Repository renderer ready.', {
      renderer: RENDERER_VERSION,
      photos: count,
      manifestGeneratedAt: manifest.generatedAt || null,
      release: release?.release || null,
      commit: release?.commit || null
    });

    return {
      renderer: RENDERER_VERSION,
      photos: count,
      manifest
    };
  } catch (error) {
    gallery.replaceChildren();
    root.dataset.hrvState = 'failed';
    root.removeAttribute('aria-busy');
    status.textContent = 'The repository renderer is available, but the processed photo feed could not be loaded.';
    console.error('[HRV Photo Album E2E] Renderer failed.', error);
    throw error;
  }
}
