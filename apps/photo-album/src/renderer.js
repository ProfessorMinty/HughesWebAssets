/* Hughes Room Views · Photo Album renderer */
'use strict';

const RENDERER_VERSION = 'photo-album-renderer-0.1.0';
const DEFAULT_TIMEOUT_MS = 12000;

function requiredNode(root, selector, label) {
  const node = root.querySelector(selector);
  if (!node) throw new Error(`Photo Album mount is missing ${label}.`);
  return node;
}

function normalizeOrigin(value) {
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

function validateManifest(data, mediaOrigin) {
  const allowedOrigin = normalizeOrigin(mediaOrigin);
  if (!allowedOrigin || !data || data.version !== 1 || !Array.isArray(data.photos)) {
    return false;
  }

  return data.photos.every((photo) => {
    if (!photo || typeof photo.url !== 'string') return false;

    let photoUrl;
    try {
      photoUrl = new URL(photo.url);
    } catch {
      return false;
    }

    return (
      photoUrl.origin === allowedOrigin &&
      photoUrl.pathname.startsWith('/media/') &&
      (photo.name === undefined || typeof photo.name === 'string') &&
      (photo.alt === undefined || typeof photo.alt === 'string')
    );
  });
}

async function fetchManifest(url, mediaOrigin, timeoutMs = DEFAULT_TIMEOUT_MS) {
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
    if (!validateManifest(data, mediaOrigin)) {
      throw new Error('Photo manifest validation failed.');
    }

    return data;
  } finally {
    window.clearTimeout(timer);
  }
}

function createPhotoFigure(photo) {
  const figure = document.createElement('figure');
  figure.className = 'hrv-photo';

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

export async function mountPhotoAlbum({
  root,
  manifestUrl,
  mediaOrigin,
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

  if (!normalizeOrigin(mediaOrigin)) {
    throw new Error('Photo Album renderer requires a valid media origin.');
  }

  const status = requiredNode(root, '#hrv-photo-album-status', 'the status node');
  const gallery = requiredNode(root, '#hrv-photo-album-gallery', 'the gallery node');

  root.dataset.hrvState = 'loading-manifest';
  root.setAttribute('aria-busy', 'true');
  status.textContent = 'Loading classroom memories…';

  try {
    const manifest = await fetchManifest(manifestUrl, mediaOrigin, timeoutMs);

    const fragment = document.createDocumentFragment();
    manifest.photos.forEach((photo) => fragment.appendChild(createPhotoFigure(photo)));
    gallery.replaceChildren(fragment);

    const count = manifest.photos.length;
    status.textContent = count === 1
      ? '1 photo loaded.'
      : `${count} photos loaded.`;

    root.dataset.hrvRendererMounted = 'true';
    root.dataset.hrvState = 'ready';
    root.dataset.hrvRenderer = RENDERER_VERSION;
    root.dataset.hrvManifestGeneratedAt = manifest.generatedAt || '';
    root.dataset.hrvRelease = release?.release || '';
    root.dataset.hrvCommit = release?.commit || '';
    root.classList.add('hrv-photo-album-repo-ready');
    root.removeAttribute('aria-busy');

    console.info('[HRV Photo Album] Repository renderer ready.', {
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
    status.textContent = 'The Photo Album is temporarily unavailable.';
    console.error('[HRV Photo Album] Renderer failed.', error);
    throw error;
  }
}
