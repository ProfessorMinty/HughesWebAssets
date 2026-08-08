import {
  createAnatomyInteractive,
  createComparisonControls,
  createEarthNetwork,
  createEvidenceInteractive,
  createLensingInteractive,
  createOrbitOverlay,
  createReconstructionInteractive,
  createWarpedLightInteractive
} from './interactions.js';
import {
  destroyEnhancedMedia,
  installLazyYouTube,
  installMotionControl,
  installRuntimeWindow,
  installSectionSpy,
  motionBehavior
} from './runtime.js';

const RENDERER_VERSION = 'black-hole-v2-0.1.0';
const MEDIA_CENTER_ITEMS = [
  {
    youtubeId: 'kOEDG3j1bjs',
    title: 'Black Holes 101',
    source: 'National Geographic',
    length: 'Short overview',
    note: 'A compact introduction to black-hole types, formation, and how scientists detect objects that do not emit visible light.'
  },
  {
    youtubeId: 'qZWPBKULkdQ',
    title: 'Black Holes: Crash Course Astronomy #33',
    source: 'CrashCourse',
    length: 'Classroom deep dive',
    note: 'A longer tour of formation, common misconceptions, stellar-mass black holes, tides, and warped spacetime.'
  }
];

function el(tag, className = '', text = '') {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== '') node.textContent = text;
  return node;
}

function button(label, className = '') {
  const node = el('button', className, label);
  node.type = 'button';
  return node;
}

function assetMap(manifest) {
  return new Map((manifest.assets || []).map((item) => [item.id, item]));
}

function evidenceBadge(text) {
  const badge = el('p', 'bhv2-evidence-badge', text || '');
  badge.setAttribute('aria-label', 'Scientific media classification: ' + (text || 'Unclassified'));
  return badge;
}

function sourceLink(asset) {
  const link = document.createElement('a');
  link.href = asset.sourcePage;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.textContent = 'Authoritative source';
  return link;
}

function preferredImage(asset) {
  const derivatives = asset.derivatives || [];
  return derivatives.find((item) => item.width === 1280 && item.format === 'webp') ||
    derivatives.find((item) => item.format === 'webp') ||
    derivatives.find((item) => item.format === 'avif') ||
    null;
}

function mediaCard(asset, options = {}) {
  const figure = el('figure', 'bhv2-media-card' + (options.className ? ' ' + options.className : ''));
  figure.dataset.assetId = asset.id;
  figure.dataset.kind = asset.kind;

  const frame = el('div', 'bhv2-media-frame');
  if (options.aspect) frame.style.setProperty('--media-aspect', options.aspect);

  if (asset.kind === 'video' && asset.localUrl) {
    const video = document.createElement('video');
    video.controls = true;
    video.preload = 'none';
    video.playsInline = true;
    if (asset.posterUrl) video.poster = asset.posterUrl;
    video.setAttribute('aria-label', asset.alt || asset.title);
    const source = document.createElement('source');
    source.src = asset.localUrl;
    if (/\.webm(?:$|\?)/i.test(asset.localUrl)) source.type = 'video/webm';
    if (/\.mp4(?:$|\?)/i.test(asset.localUrl)) source.type = 'video/mp4';
    video.append(source);
    frame.append(video);
  } else {
    const picture = document.createElement('picture');
    const derivatives = asset.derivatives || [];
    const avif = derivatives.filter((item) => item.format === 'avif').sort((a, b) => a.width - b.width);
    const webp = derivatives.filter((item) => item.format === 'webp').sort((a, b) => a.width - b.width);

    if (avif.length) {
      const source = document.createElement('source');
      source.type = 'image/avif';
      source.srcset = avif.map((item) => `${item.url} ${item.width}w`).join(', ');
      source.sizes = options.sizes || '(max-width: 700px) 94vw, 520px';
      picture.append(source);
    }
    if (webp.length) {
      const source = document.createElement('source');
      source.type = 'image/webp';
      source.srcset = webp.map((item) => `${item.url} ${item.width}w`).join(', ');
      source.sizes = options.sizes || '(max-width: 700px) 94vw, 520px';
      picture.append(source);
    }

    const img = document.createElement('img');
    const preferred = preferredImage(asset);
    img.src = preferred?.url || asset.localUrl || asset.stubUrl;
    img.alt = asset.alt || '';
    img.loading = options.eager ? 'eager' : 'lazy';
    img.decoding = 'async';
    if (preferred?.width) img.width = preferred.width;
    if (preferred?.height) img.height = preferred.height;
    img.addEventListener('error', () => {
      picture.remove();
      frame.append(el('div', 'bhv2-media-failure', 'Scientific media is unavailable. The verified caption, classification, credit, and source remain readable below.'));
    }, { once: true });
    picture.append(img);
    frame.append(picture);
  }

  const caption = el('figcaption');
  caption.append(
    el('strong', 'bhv2-media-title', asset.title || ''),
    evidenceBadge(asset.classification || ''),
    el('span', 'bhv2-media-caption', asset.caption || ''),
    el('span', 'bhv2-media-credit', `Credit: ${asset.credit || 'See source'}${asset.license ? ' · ' + asset.license : ''}`),
    sourceLink(asset)
  );
  figure.append(frame, caption);
  return figure;
}

function sectionHeader(station, label = '') {
  const header = el('header', 'bhv2-section-header');
  const meta = el('div', 'bhv2-section-meta');
  meta.append(
    el('span', 'bhv2-section-number', station.number || ''),
    el('p', 'bhv2-kicker', label || station.kicker || '')
  );
  const copy = el('div', 'bhv2-section-copy');
  copy.append(
    el('h2', '', station.title || ''),
    evidenceBadge(station.classification || ''),
    el('p', 'bhv2-child-line', station.child || '')
  );
  const deeper = el('details', 'bhv2-look-deeper');
  deeper.append(el('summary', '', 'Look deeper'), el('p', '', station.deeper || ''));
  copy.append(deeper);
  header.append(meta, copy);
  return header;
}

function sectionShell(station, composition, zone = 'standard') {
  const section = el('section', `bhv2-section bhv2-section--${composition} bhv2-zone--${zone}`);
  section.id = station.id;
  section.dataset.station = station.number;
  section.dataset.composition = composition;
  section.tabIndex = -1;
  return section;
}

function stationByNumber(content, number) {
  const station = (content.stations || []).find((item) => item.number === number);
  if (!station) throw new Error(`Missing station ${number}.`);
  return station;
}

function buildHero(content) {
  const hero = el('header', 'bhv2-hero');
  const zone = el('div', 'bhv2-zone bhv2-zone--hero');
  const copy = el('div', 'bhv2-hero-copy');
  copy.append(
    el('p', 'bhv2-eyebrow', content.page.eyebrow || 'Hughes Room Views'),
    el('h1', '', content.page.title || 'Black Holes'),
    el('p', 'bhv2-hero-line', content.page.supportingLine || ''),
    el('p', 'bhv2-prototype-warning', content.page.prototypeWarning || '')
  );

  const visual = el('div', 'bhv2-hero-visual');
  visual.setAttribute('aria-hidden', 'true');
  visual.append(
    el('i', 'bhv2-hero-halo bhv2-hero-halo--outer'),
    el('i', 'bhv2-hero-halo bhv2-hero-halo--inner'),
    el('i', 'bhv2-hero-disk'),
    el('i', 'bhv2-hero-shadow')
  );
  zone.append(copy, visual);
  hero.append(zone);
  return hero;
}

function buildWayfinding(content, state) {
  const nav = el('nav', 'bhv2-wayfinding');
  nav.dataset.bhv2Wayfinding = 'true';
  nav.setAttribute('aria-label', 'Black Hole Museum sections');
  (content.stations || []).forEach((station) => {
    const link = document.createElement('a');
    link.href = '#' + station.id;
    link.textContent = station.number;
    link.title = station.title;
    link.addEventListener('click', (event) => {
      event.preventDefault();
      document.getElementById(station.id)?.scrollIntoView({ behavior: motionBehavior(state), block: 'start' });
    });
    nav.append(link);
  });
  return nav;
}

function buildOpeningRecap(station, content) {
  const section = sectionShell(station, 'opening-recap', 'compact');
  const zone = el('div', 'bhv2-zone bhv2-opening-zone');
  zone.append(sectionHeader(station));
  const grid = el('div', 'bhv2-recap-grid');
  (content.recap || []).forEach((paragraph, index) => {
    const card = el('article', 'bhv2-recap-card');
    card.dataset.recap = String(index + 1);
    card.append(el('span', 'bhv2-recap-index', String(index + 1).padStart(2, '0')), el('p', '', paragraph));
    grid.append(card);
  });
  zone.append(grid);
  section.append(zone);
  return section;
}

function buildLensing(station) {
  const section = sectionShell(station, 'interactive-pair', 'standard');
  const zone = el('div', 'bhv2-zone bhv2-two-up bhv2-two-up--feature');
  const story = el('div', 'bhv2-story-panel');
  story.append(sectionHeader(station), el('p', 'bhv2-support-note', 'Change the model and watch the background stars become evidence.'));
  zone.append(story, createLensingInteractive(station));
  section.append(zone);
  return section;
}

function buildEvidence(station, assets) {
  const section = sectionShell(station, 'evidence-cluster', 'wide');
  const zone = el('div', 'bhv2-zone');
  zone.append(sectionHeader(station));
  const cluster = el('div', 'bhv2-evidence-cluster');
  cluster.append(createEvidenceInteractive(station));
  const reference = assets.get('nasa-labeled-accretion');
  if (reference) cluster.append(mediaCard(reference, { className: 'bhv2-support-module', sizes: '(max-width: 700px) 94vw, 390px' }));
  zone.append(cluster);
  section.append(zone);
  return section;
}

function buildOrbit(station, assets) {
  const section = sectionShell(station, 'observation-pair', 'standard');
  const zone = el('div', 'bhv2-zone');
  zone.append(sectionHeader(station));
  const composition = el('div', 'bhv2-observation-pair');
  const observation = el('div', 'bhv2-orbit-observation bhv2-standard-module');
  const asset = assets.get('eso-star-orbits');
  if (asset) observation.append(mediaCard(asset, { aspect: '16 / 9', sizes: '(max-width: 700px) 94vw, 720px' }));
  const { overlay, control } = createOrbitOverlay(station);
  observation.append(overlay);
  const tool = el('aside', 'bhv2-sidecar');
  tool.append(el('p', 'bhv2-sidecar-label', 'Observation tool'), el('p', '', station.deeper || ''), control);
  composition.append(observation, tool);
  zone.append(composition);
  section.append(zone);
  return section;
}

function buildTelescope(station, assets) {
  const section = sectionShell(station, 'telescope-cluster', 'wide');
  const zone = el('div', 'bhv2-zone');
  zone.append(sectionHeader(station));
  const cluster = el('div', 'bhv2-telescope-cluster');
  const map = assets.get('eht-observatory-map');
  if (map) cluster.append(mediaCard(map, { className: 'bhv2-telescope-map', sizes: '(max-width: 700px) 94vw, 600px' }));
  const earth = createEarthNetwork(station);
  cluster.append(earth.module);
  const sites = el('aside', 'bhv2-observatory-stack');
  sites.append(el('p', 'bhv2-sidecar-label', 'Places → network → one instrument'));
  const chips = el('div', 'bhv2-chip-list');
  earth.siteNames.forEach((name) => chips.append(el('span', 'bhv2-chip', name)));
  sites.append(chips, el('p', '', 'Widely separated observatories synchronize radio measurements so the network can act like an Earth-sized virtual telescope.'));
  cluster.append(sites);
  zone.append(cluster);
  section.append(zone);
  return section;
}

function buildReconstruction(station, assets) {
  const section = sectionShell(station, 'three-stage-process', 'wide');
  const zone = el('div', 'bhv2-zone');
  zone.append(sectionHeader(station));

  const interactive = createReconstructionInteractive(station);
  const process = el('div', 'bhv2-process-row');
  interactive.states.forEach((state, index) => {
    const card = el('article', 'bhv2-process-card');
    card.append(el('span', 'bhv2-process-index', String(index + 1).padStart(2, '0')), el('h3', '', state.name), el('p', '', state.text));
    process.append(card);
  });

  const evidence = el('div', 'bhv2-reconstruction-pair');
  evidence.append(interactive.module);
  const reference = assets.get('sgr-a-reconstruction');
  if (reference) evidence.append(mediaCard(reference, { sizes: '(max-width: 700px) 94vw, 500px' }));
  zone.append(process, evidence);
  section.append(zone);
  return section;
}

function buildComparison(station, assets) {
  const section = sectionShell(station, 'comparison-pair', 'standard');
  const zone = el('div', 'bhv2-zone');
  zone.append(sectionHeader(station));
  const pair = el('div', 'bhv2-comparison-pair');
  ['m87-observation', 'sgr-a-observation'].forEach((id) => {
    const asset = assets.get(id);
    if (asset) pair.append(mediaCard(asset, { className: 'bhv2-comparison-card', sizes: '(max-width: 700px) 94vw, 460px' }));
  });

  const support = el('div', 'bhv2-comparison-support');
  const controls = createComparisonControls(station, (index) => {
    support.dataset.view = ['separate', 'compare', 'context', 'scale'][index] || 'separate';
    support.querySelectorAll('[data-comparison-extra]').forEach((node) => { node.hidden = true; });
    if (index === 2) support.querySelector('[data-comparison-extra="context"]')?.removeAttribute('hidden');
    if (index === 3) support.querySelector('[data-comparison-extra="scale"]')?.removeAttribute('hidden');
    pair.dataset.view = index === 1 ? 'compare' : 'separate';
  });
  support.append(controls);

  const galaxy = assets.get('m87-galaxy');
  if (galaxy) {
    const card = mediaCard(galaxy, { className: 'bhv2-small-module', sizes: '(max-width: 700px) 94vw, 340px' });
    card.dataset.comparisonExtra = 'context';
    card.hidden = true;
    support.append(card);
  }
  const scale = assets.get('m87-sgr-scale');
  if (scale) {
    const card = mediaCard(scale, { className: 'bhv2-small-module', sizes: '(max-width: 700px) 94vw, 340px' });
    card.dataset.comparisonExtra = 'scale';
    card.hidden = true;
    support.append(card);
  }

  zone.append(pair, support);
  section.append(zone);
  return section;
}

function buildWarpedLight(station, assets) {
  const section = sectionShell(station, 'interactive-gallery', 'wide');
  const zone = el('div', 'bhv2-zone');
  zone.append(sectionHeader(station));
  const top = el('div', 'bhv2-warped-pair');
  top.append(createWarpedLightInteractive(station));
  const companion = assets.get('nasa-labeled-accretion');
  if (companion) top.append(mediaCard(companion, { className: 'bhv2-standard-module', sizes: '(max-width: 700px) 94vw, 500px' }));

  const gallery = el('div', 'bhv2-support-gallery');
  ['nasa-optics', 'nasa-edge-on', 'nasa-rotating'].forEach((id) => {
    const asset = assets.get(id);
    if (asset) gallery.append(mediaCard(asset, { className: 'bhv2-small-module', sizes: '(max-width: 700px) 94vw, 340px' }));
  });
  zone.append(top, gallery);
  section.append(zone);
  return section;
}

function buildAnatomy(station) {
  const section = sectionShell(station, 'anatomy-myth-cluster', 'wide');
  const zone = el('div', 'bhv2-zone');
  zone.append(sectionHeader(station));
  const cluster = el('div', 'bhv2-anatomy-cluster');
  cluster.append(createAnatomyInteractive(station));
  const myths = el('div', 'bhv2-myth-grid');
  (station.myths || []).forEach((item) => {
    const card = el('details', 'bhv2-myth');
    card.append(el('summary', '', item.claim || ''), el('p', '', item.knowledge || ''));
    myths.append(card);
  });
  cluster.append(myths);
  zone.append(cluster);
  section.append(zone);
  return section;
}

function youtubeCard(item) {
  const card = el('article', 'bhv2-youtube-card');
  const frame = el('div', 'bhv2-youtube-frame');
  frame.dataset.youtubeId = item.youtubeId;
  frame.dataset.youtubeTitle = item.title;
  frame.append(el('div', 'bhv2-youtube-placeholder', 'Video player wakes up when the Media Center is nearby.'));
  const meta = el('div', 'bhv2-youtube-meta');
  meta.append(
    el('h3', '', item.title),
    el('p', 'bhv2-youtube-source', `${item.source} · ${item.length}`),
    el('p', '', item.note)
  );
  card.append(frame, meta);
  return card;
}

function buildMediaCenter() {
  const section = el('section', 'bhv2-media-center bhv2-zone--standard');
  section.id = 'black-hole-media-center';
  section.dataset.runtimeAuxiliary = 'media-center';
  section.dataset.playerState = 'sleeping';
  section.setAttribute('aria-labelledby', 'black-hole-media-center-title');
  const zone = el('div', 'bhv2-zone bhv2-media-center-zone');
  const signage = el('div', 'bhv2-media-signage');
  signage.append(
    el('p', 'bhv2-kicker', 'Watch · pause · wonder'),
    el('h2', '', 'Black Hole Media Center'),
    el('p', '', 'Two optional video stops. They use normal YouTube controls and never autoplay.'),
    el('p', 'bhv2-media-warning', 'SIMULATED MEDIA SELECTION · NOT A RECORD OF MS HUGHES APPROVAL')
  );
  signage.querySelector('h2').id = 'black-hole-media-center-title';
  const grid = el('div', 'bhv2-youtube-grid');
  MEDIA_CENTER_ITEMS.forEach((item) => grid.append(youtubeCard(item)));
  zone.append(signage, grid);
  section.append(zone);
  return section;
}

function buildBoundary(station, content, assets) {
  const section = sectionShell(station, 'knowledge-split', 'wide');
  const zone = el('div', 'bhv2-zone');
  zone.append(sectionHeader(station));
  const split = el('div', 'bhv2-knowledge-split');
  const known = el('article', 'bhv2-known');
  known.append(el('h3', '', 'What scientists can investigate'));
  (station.known || []).forEach((item) => known.append(el('p', '', item)));
  const unknown = el('article', 'bhv2-unknown');
  unknown.append(el('h3', '', 'Questions still open'));
  (station.unknown || []).forEach((item) => unknown.append(el('p', '', item)));
  split.append(known, unknown);

  const pullback = el('div', 'bhv2-evidence-pullback');
  ['m87-observation', 'm87-galaxy', 'alma-antennas'].forEach((id) => {
    const asset = assets.get(id);
    if (asset) pullback.append(mediaCard(asset, { className: 'bhv2-small-module', sizes: '(max-width: 700px) 94vw, 340px' }));
  });

  zone.append(split, pullback, el('blockquote', 'bhv2-closing-line', content.page.closingLine || station.child || ''));
  section.append(zone);
  return section;
}

function buildCredits(content, assetManifest) {
  const section = el('section', 'bhv2-credits bhv2-zone--standard');
  section.id = 'black-hole-credits';
  const zone = el('div', 'bhv2-zone');
  zone.append(el('p', 'bhv2-kicker', 'Media ledger'), el('h2', '', 'Scientific media and credits'), el('p', 'bhv2-credit-intro', content.creditsIntro || ''));
  const list = el('div', 'bhv2-credit-list');
  (assetManifest.assets || []).forEach((asset) => {
    const item = el('article', 'bhv2-credit-item');
    item.append(el('h3', '', asset.title || ''), evidenceBadge(asset.classification || ''), el('p', '', `${asset.credit || ''}${asset.license ? ' · ' + asset.license : ''}`), sourceLink(asset));
    list.append(item);
  });
  zone.append(list);
  section.append(zone);
  return section;
}

function buildFooter(release, content) {
  const footer = el('footer', 'bhv2-footer');
  const zone = el('div', 'bhv2-zone bhv2-footer-zone');
  zone.append(
    el('p', '', content.page.prototypeWarning || ''),
    el('p', 'bhv2-build-marker', `V2 renderer ${RENDERER_VERSION} · staging release ${release.release || 'unversioned'} · ${String(release.commit || '').slice(0, 12)}`)
  );
  footer.append(zone);
  return footer;
}

function buildControls() {
  const dock = el('aside', 'bhv2-controls');
  dock.setAttribute('aria-label', 'Black Hole Museum controls');
  const motion = button('Pause motion');
  dock.append(motion);
  return { dock, motion };
}

function validateBundle(content, assets, experience) {
  if (content?.schemaVersion !== '1.0' || !Array.isArray(content.stations) || content.stations.length !== 10) {
    throw new Error('Invalid black-hole content manifest.');
  }
  if (assets?.schemaVersion !== '1.0' || !Array.isArray(assets.assets)) {
    throw new Error('Invalid black-hole asset manifest.');
  }
  if (experience?.schemaVersion !== '1.0') {
    throw new Error('Invalid black-hole experience manifest.');
  }
}

export async function mountBlackHoleMuseum({ mount, release, content, assets, experience }) {
  if (!mount) throw new Error('Mount is required.');
  validateBundle(content, assets, experience);

  const nativeNodes = [...mount.childNodes];
  const assetIndex = assetMap(assets);
  const cleanups = [];
  const state = {
    reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
    motionPaused: false
  };

  const shell = el('div', 'bhv2-shell');
  shell.dataset.renderer = RENDERER_VERSION;
  shell.dataset.motion = state.reducedMotion ? 'still' : 'running';
  shell.dataset.experienceProfile = experience.defaultProfile || '5';

  const skip = document.createElement('a');
  skip.className = 'bhv2-skip';
  skip.href = '#classroom-threshold';
  skip.textContent = 'Skip to the Black Hole Museum';

  const controls = buildControls();
  shell.append(skip, buildHero(content), buildWayfinding(content, state), controls.dock);

  const main = el('main', 'bhv2-main');
  main.id = 'bhv2-main';
  main.append(
    buildOpeningRecap(stationByNumber(content, '01'), content),
    buildLensing(stationByNumber(content, '02')),
    buildEvidence(stationByNumber(content, '03'), assetIndex),
    buildOrbit(stationByNumber(content, '04'), assetIndex),
    buildTelescope(stationByNumber(content, '05'), assetIndex),
    buildReconstruction(stationByNumber(content, '06'), assetIndex),
    buildComparison(stationByNumber(content, '07'), assetIndex),
    buildWarpedLight(stationByNumber(content, '08'), assetIndex),
    buildAnatomy(stationByNumber(content, '09'))
  );
  const mediaCenter = buildMediaCenter();
  main.append(mediaCenter, buildBoundary(stationByNumber(content, '10'), content, assetIndex), buildCredits(content, assets));
  shell.append(main, buildFooter(release, content));

  try {
    mount.replaceChildren(shell);
    mount.classList.remove('hrv-native-fallback');
    mount.classList.add('bhv2-mounted');
    mount.dataset.hrvState = 'ready';

    const sections = [...shell.querySelectorAll('.bhv2-section')];
    installMotionControl(shell, controls.motion, state);
    installRuntimeWindow(shell, sections, cleanups);
    installSectionSpy(shell, sections, cleanups);
    installLazyYouTube(mediaCenter, cleanups);

    mount.__bhv2Destroy = () => {
      cleanups.splice(0).forEach((cleanup) => {
        try { cleanup(); } catch {}
      });
      destroyEnhancedMedia(shell);
    };
  } catch (error) {
    cleanups.splice(0).forEach((cleanup) => {
      try { cleanup(); } catch {}
    });
    mount.replaceChildren(...nativeNodes);
    mount.classList.remove('bhv2-mounted');
    mount.classList.add('hrv-native-fallback');
    mount.dataset.hrvState = 'failed';
    throw error;
  }
}
