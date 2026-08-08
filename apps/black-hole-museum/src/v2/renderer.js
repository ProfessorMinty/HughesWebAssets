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

const RENDERER_VERSION = 'black-hole-v2-0.3.0';
const NAV_SHORT = {
  '01': 'Threshold',
  '02': 'Invisible sky',
  '03': 'Clues',
  '04': 'Orbits',
  '05': 'Earth',
  '06': 'Image',
  '07': 'Twin rings',
  '08': 'Warped light',
  '09': 'Anatomy',
  '10': 'Boundary'
};
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
  const badge = el('span', 'bhv2-evidence-badge', text || '');
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

function largestImage(asset) {
  const derivatives = (asset.derivatives || [])
    .filter((item) => item.format === 'webp' || item.format === 'avif')
    .sort((a, b) => (b.width || 0) - (a.width || 0));
  return derivatives[0] || preferredImage(asset);
}

function createAssetDialog(asset, options = {}) {
  const dialog = document.createElement('dialog');
  dialog.className = 'bhv2-media-dialog';
  dialog.setAttribute('aria-label', options.label || asset.title || 'Enlarged scientific media');
  const close = button('Close enlarged view', 'bhv2-dialog-close');
  const img = document.createElement('img');
  const largest = largestImage(asset);
  img.src = largest?.url || asset.localUrl || asset.stubUrl;
  img.alt = asset.alt || asset.title || '';
  const caption = el('p', 'bhv2-dialog-caption', asset.caption || asset.title || '');
  dialog.append(close, img, caption);

  let opener = null;
  const open = (source) => {
    opener = source || document.activeElement;
    dialog.showModal();
    requestAnimationFrame(() => close.focus({ preventScroll: true }));
  };
  const dismiss = () => dialog.close();

  close.addEventListener('click', dismiss);
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dismiss();
  });
  dialog.addEventListener('close', () => {
    try { opener?.focus?.({ preventScroll: true }); } catch {}
  });

  return { dialog, open };
}

function attachZoomDialog(figure, asset) {
  const trigger = button('Open diagram larger', 'bhv2-zoom-button');
  const viewer = createAssetDialog(asset, { label: `Enlarged view: ${asset.title || 'scientific diagram'}` });
  trigger.addEventListener('click', () => viewer.open(trigger));
  figure.append(trigger, viewer.dialog);
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
      source.sizes = options.sizes || '(max-width: 700px) 94vw, 900px';
      picture.append(source);
    }
    if (webp.length) {
      const source = document.createElement('source');
      source.type = 'image/webp';
      source.srcset = webp.map((item) => `${item.url} ${item.width}w`).join(', ');
      source.sizes = options.sizes || '(max-width: 700px) 94vw, 900px';
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
  if (options.zoom && asset.kind !== 'video') attachZoomDialog(figure, asset);
  return figure;
}

function sectionIntro(station, options = {}) {
  const header = el('header', 'bhv2-section-intro');
  const marker = el('div', 'bhv2-section-marker');
  marker.append(el('span', 'bhv2-section-number', station.number || ''), el('span', 'bhv2-kicker', options.label || station.kicker || ''));
  const copy = el('div', 'bhv2-section-copy');
  copy.append(
    el('h2', '', station.title || ''),
    evidenceBadge(station.classification || ''),
    el('p', 'bhv2-child-line', station.child || '')
  );
  if (station.deeper && options.deeper !== false) {
    const deeper = document.createElement('details');
    deeper.className = 'bhv2-deeper-drawer';
    deeper.append(el('summary', '', options.deeperLabel || 'More about this evidence'), el('p', '', station.deeper));
    copy.append(deeper);
  }
  header.append(marker, copy);
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
    link.append(el('span', 'bhv2-nav-number', station.number), el('span', 'bhv2-nav-label', NAV_SHORT[station.number] || station.title));
    link.addEventListener('click', (event) => {
      event.preventDefault();
      document.getElementById(station.id)?.scrollIntoView({ behavior: motionBehavior(state), block: 'start' });
    });
    nav.append(link);
  });
  return nav;
}

function buildUtilityBar(content, state) {
  const bar = el('div', 'bhv2-utility-bar');
  const motion = button('Pause motion', 'bhv2-motion-control');
  bar.append(buildWayfinding(content, state), motion);
  return { bar, motion };
}

function buildOpeningRecap(station, content) {
  const section = sectionShell(station, 'threshold', 'wide');
  const zone = el('div', 'bhv2-zone bhv2-threshold-zone');
  const plaque = el('article', 'bhv2-threshold-plaque');
  plaque.append(sectionIntro(station, { deeperLabel: 'Why scientists watch the surroundings' }));
  const warning = el('p', 'bhv2-prototype-warning bhv2-threshold-warning', content.page.prototypeWarning || 'SIMULATED CLASSROOM RECAP');
  const recap = el('div', 'bhv2-recap-copy');
  (content.recap || []).forEach((paragraph, index) => {
    const row = el('div', 'bhv2-recap-row');
    row.append(el('span', 'bhv2-recap-index', String(index + 1).padStart(2, '0')), el('p', '', paragraph));
    recap.append(row);
  });
  plaque.append(warning, recap);

  const aperture = el('div', 'bhv2-threshold-aperture');
  aperture.setAttribute('aria-hidden', 'true');
  aperture.append(el('div', 'bhv2-aperture-stars'), el('p', 'bhv2-aperture-label', 'Enter the Black Hole Gallery'));
  zone.append(plaque, aperture);
  section.append(zone);
  return section;
}

function buildLensing(station) {
  const section = sectionShell(station, 'atrium', 'wide');
  const zone = el('div', 'bhv2-zone bhv2-atrium-zone');
  zone.append(sectionIntro(station, { deeperLabel: 'What the demonstration means' }));
  const instrument = createLensingInteractive(station);
  const wallLabel = el('aside', 'bhv2-wall-label');
  wallLabel.append(el('strong', '', 'Look for the disturbance, not a visible object.'), el('p', '', 'The center stays dark while the stars and light paths become the evidence.'));
  zone.append(instrument, wallLabel);
  section.append(zone);
  return section;
}

function buildEvidence(station, assets) {
  const section = sectionShell(station, 'evidence-gallery', 'wide');
  const zone = el('div', 'bhv2-zone');
  zone.append(sectionIntro(station, { deeperLabel: 'How independent clues build one answer' }));
  const gallery = el('div', 'bhv2-evidence-gallery');
  gallery.append(createEvidenceInteractive(station));
  const reference = assets.get('nasa-labeled-accretion');
  if (reference) gallery.append(mediaCard(reference, { className: 'bhv2-diagram-pedestal', sizes: '(max-width: 900px) 94vw, 620px', zoom: true }));
  zone.append(gallery);
  section.append(zone);
  return section;
}

function buildOrbit(station, assets) {
  const section = sectionShell(station, 'theater', 'wide');
  const zone = el('div', 'bhv2-zone bhv2-theater-zone');
  zone.append(sectionIntro(station, { deeper: false }));
  const theater = el('div', 'bhv2-theater');
  const screen = el('div', 'bhv2-theater-screen');
  const asset = assets.get('eso-star-orbits');
  const observation = asset ? mediaCard(asset, { aspect: '16 / 9', className: 'bhv2-orbit-observation', sizes: '(max-width: 900px) 94vw, 1080px' }) : null;
  const orbit = createOrbitOverlay();
  if (observation) {
    observation.querySelector('.bhv2-media-frame')?.append(orbit.overlay);
    screen.append(observation);
  } else {
    screen.append(orbit.overlay);
  }
  const consolePanel = el('aside', 'bhv2-theater-console');
  consolePanel.setAttribute('aria-label', 'Orbit observation controls');
  consolePanel.append(
    el('p', 'bhv2-sidecar-label', 'Observation tool · explanatory overlays'),
    orbit.controls
  );
  theater.append(screen, consolePanel);
  zone.append(theater);
  section.append(zone);
  return section;
}

function buildTelescope(station, assets) {
  const section = sectionShell(station, 'planetary-hall', 'wide');
  const zone = el('div', 'bhv2-zone bhv2-planetary-zone');
  zone.append(sectionIntro(station, { deeperLabel: 'How many observatories become one instrument' }));
  const map = assets.get('eht-observatory-map');
  if (map) zone.append(mediaCard(map, { className: 'bhv2-map-wall', sizes: '(max-width: 900px) 94vw, 1400px', zoom: true }));
  const earth = createEarthNetwork(station);
  const explanation = el('div', 'bhv2-sync-strip');
  ['Places', 'Synchronized measurements', 'One virtual telescope'].forEach((label, index) => {
    const step = el('div', 'bhv2-sync-step');
    step.append(el('span', '', String(index + 1).padStart(2, '0')), el('strong', '', label));
    explanation.append(step);
  });
  zone.append(earth.module, explanation);
  section.append(zone);
  return section;
}

function buildReconstruction(station, assets) {
  const section = sectionShell(station, 'reconstruction-corridor', 'wide');
  const zone = el('div', 'bhv2-zone');
  zone.append(sectionIntro(station, { deeper: false }));
  const interactive = createReconstructionInteractive(station);
  const track = el('ol', 'bhv2-process-track');
  interactive.states.forEach((state, index) => {
    const item = el('li', 'bhv2-process-stop');
    item.append(el('span', 'bhv2-process-index', String(index + 1).padStart(2, '0')), el('h3', '', state.name), el('p', '', state.text));
    track.append(item);
  });
  const workbench = el('div', 'bhv2-reconstruction-workbench');
  workbench.append(interactive.module);
  const reference = assets.get('sgr-a-reconstruction');
  if (reference) workbench.append(mediaCard(reference, { className: 'bhv2-reconstruction-reference', sizes: '(max-width: 900px) 94vw, 680px', zoom: true }));
  zone.append(track, workbench);
  section.append(zone);
  return section;
}

function buildComparison(station, assets) {
  const section = sectionShell(station, 'rotunda', 'wide');
  const zone = el('div', 'bhv2-zone bhv2-rotunda-zone');
  zone.append(sectionIntro(station, { deeperLabel: 'Why these are reconstructed observations' }));
  const pair = el('div', 'bhv2-rotunda-bays');
  ['m87-observation', 'sgr-a-observation'].forEach((id) => {
    const asset = assets.get(id);
    if (asset) pair.append(mediaCard(asset, { className: 'bhv2-monument-card', sizes: '(max-width: 900px) 94vw, 720px' }));
  });

  const galaxy = assets.get('m87-galaxy');
  const scale = assets.get('m87-sgr-scale');
  const galaxyViewer = galaxy ? createAssetDialog(galaxy, { label: 'M87 galaxy context' }) : null;
  const scaleViewer = scale ? createAssetDialog(scale, { label: 'M87 and Sagittarius A star-system scale comparison' }) : null;

  const support = el('div', 'bhv2-rotunda-controls');
  const controls = createComparisonControls(station, (index, control) => {
    pair.dataset.view = index === 1 ? 'compare' : 'separate';
    if (index === 2) galaxyViewer?.open(control);
    if (index === 3) scaleViewer?.open(control);
  });
  support.append(controls);

  const firstComparisonControl = controls.querySelector('button');
  [galaxyViewer, scaleViewer].filter(Boolean).forEach((viewer) => {
    viewer.dialog.addEventListener('close', () => firstComparisonControl?.click());
    zone.append(viewer.dialog);
  });

  const bench = el('div', 'bhv2-quiet-bench');
  bench.append(el('span', '', 'QUIET BENCH'), el('p', '', 'No action required here. Pause with the two historic observations before moving into the working laboratory.'));
  zone.append(pair, support, bench);
  section.append(zone);
  return section;
}

function buildWarpedLight(station, assets) {
  const section = sectionShell(station, 'laboratory', 'wide');
  const zone = el('div', 'bhv2-zone');
  zone.append(sectionIntro(station, { deeper: false }));
  const bench = el('div', 'bhv2-lab-bench');
  bench.append(createWarpedLightInteractive(station));
  const companion = assets.get('nasa-labeled-accretion');
  if (companion) bench.append(mediaCard(companion, { className: 'bhv2-lab-diagram', sizes: '(max-width: 900px) 94vw, 700px', zoom: true }));

  const gallery = el('div', 'bhv2-support-gallery');
  ['nasa-optics', 'nasa-edge-on', 'nasa-rotating'].forEach((id) => {
    const asset = assets.get(id);
    if (asset) gallery.append(mediaCard(asset, { className: 'bhv2-lab-reference', sizes: '(max-width: 900px) 94vw, 520px', zoom: true }));
  });
  zone.append(bench, gallery);
  section.append(zone);
  return section;
}

function buildAnatomy(station) {
  const section = sectionShell(station, 'clarity-gallery', 'wide');
  const zone = el('div', 'bhv2-zone');
  zone.append(sectionIntro(station, { deeperLabel: 'Keep the parts distinct' }));
  const cluster = el('div', 'bhv2-anatomy-cluster');
  cluster.append(createAnatomyInteractive(station));

  const myths = el('div', 'bhv2-myth-stack');
  myths.append(el('h3', '', 'Myths to retire'));
  const mythControls = el('div', 'bhv2-myth-controls');
  mythControls.setAttribute('role', 'group');
  mythControls.setAttribute('aria-label', 'Black-hole myths');
  const mythDetail = el('div', 'bhv2-myth-detail');
  mythDetail.setAttribute('aria-live', 'polite');
  mythDetail.append(el('span', 'bhv2-detail-kicker', 'MYTH CHECK'), el('strong', 'bhv2-myth-claim'), el('p', 'bhv2-myth-answer'));
  const mythButtons = [];

  const selectMyth = (index) => {
    const item = (station.myths || [])[index];
    if (!item) return;
    mythButtons.forEach((control, buttonIndex) => {
      const active = buttonIndex === index;
      control.classList.toggle('is-active', active);
      control.setAttribute('aria-pressed', String(active));
    });
    mythDetail.querySelector('.bhv2-myth-claim').textContent = item.claim || '';
    mythDetail.querySelector('.bhv2-myth-answer').textContent = item.knowledge || '';
  };

  (station.myths || []).forEach((item, index) => {
    const control = button(item.claim || `Myth ${index + 1}`, 'bhv2-myth');
    control.setAttribute('aria-pressed', 'false');
    control.addEventListener('click', () => selectMyth(index));
    mythControls.append(control);
    mythButtons.push(control);
  });
  myths.append(mythControls, mythDetail);
  if (mythButtons.length) selectMyth(0);

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
  const poster = el('div', 'bhv2-youtube-poster');
  poster.append(
    el('span', 'bhv2-youtube-poster-label', item.title),
    button('Play video', 'bhv2-youtube-play')
  );
  frame.append(poster);
  const meta = el('div', 'bhv2-youtube-meta');
  const external = document.createElement('a');
  external.className = 'bhv2-youtube-external';
  external.href = `https://www.youtube.com/watch?v=${encodeURIComponent(item.youtubeId)}`;
  external.target = '_blank';
  external.rel = 'noopener noreferrer';
  external.textContent = 'Open on YouTube';
  meta.append(el('h3', '', item.title), el('p', 'bhv2-youtube-source', `${item.source} · ${item.length}`), el('p', '', item.note), external);
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
    el('p', '', 'Two optional video stops. Players load only when you choose Play, use normal YouTube controls, and never autoplay.'),
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
  const section = sectionShell(station, 'boundary', 'wide');
  const zone = el('div', 'bhv2-zone bhv2-boundary-zone');
  zone.append(sectionIntro(station, { deeperLabel: 'Where observation stops' }));

  const threshold = el('div', 'bhv2-knowledge-boundary');
  threshold.setAttribute('aria-hidden', 'true');
  threshold.append(el('span', '', 'WHAT WE CAN MEASURE'), el('i'), el('span', '', 'WHAT REMAINS OPEN'));

  const split = el('div', 'bhv2-knowledge-split');
  const known = el('article', 'bhv2-known');
  known.append(el('h3', '', 'What scientists can investigate'));
  const knownList = document.createElement('ul');
  (station.known || []).forEach((item) => knownList.append(el('li', '', item)));
  known.append(knownList);
  const unknown = el('article', 'bhv2-unknown');
  unknown.append(el('h3', '', 'Questions still open'));
  const unknownList = document.createElement('ul');
  (station.unknown || []).forEach((item) => unknownList.append(el('li', '', item)));
  unknown.append(unknownList);
  split.append(known, unknown);

  const returnSequence = el('div', 'bhv2-return-sequence');
  const galaxy = assets.get('m87-galaxy');
  if (galaxy) returnSequence.append(mediaCard(galaxy, { className: 'bhv2-pullback-artifact', sizes: '(max-width: 900px) 94vw, 1200px' }));
  const observers = assets.get('alma-antennas');
  if (observers) returnSequence.append(mediaCard(observers, { className: 'bhv2-observer-artifact', sizes: '(max-width: 900px) 94vw, 1400px' }));

  zone.append(threshold, split, returnSequence, el('blockquote', 'bhv2-closing-line', content.page.closingLine || station.child || ''));
  section.append(zone);
  return section;
}

function buildCredits(content, assetManifest) {
  const section = el('section', 'bhv2-credits bhv2-zone--standard');
  section.id = 'black-hole-credits';
  const zone = el('div', 'bhv2-zone');
  zone.append(el('p', 'bhv2-kicker', 'Media ledger'), el('h2', '', 'Scientific media and credits'), el('p', 'bhv2-credit-intro', content.creditsIntro || ''));
  const ledger = document.createElement('details');
  ledger.className = 'bhv2-credit-ledger';
  ledger.append(el('summary', '', `Open the full media ledger (${(assetManifest.assets || []).length} sources)`));
  const list = el('div', 'bhv2-credit-list');
  (assetManifest.assets || []).forEach((asset) => {
    const item = el('article', 'bhv2-credit-item');
    item.append(el('h3', '', asset.title || ''), evidenceBadge(asset.classification || ''), el('p', '', `${asset.credit || ''}${asset.license ? ' · ' + asset.license : ''}`), sourceLink(asset));
    list.append(item);
  });
  ledger.append(list);
  zone.append(ledger);
  section.append(zone);
  return section;
}

function buildFooter(release, content) {
  const footer = el('footer', 'bhv2-footer');
  const zone = el('div', 'bhv2-zone bhv2-footer-zone');
  zone.append(el('p', '', content.page.prototypeWarning || ''), el('p', 'bhv2-build-marker', `V2 renderer ${RENDERER_VERSION} · staging release ${release.release || 'unversioned'} · ${String(release.commit || '').slice(0, 12)}`));
  footer.append(zone);
  return footer;
}

function stationFallback(station, error) {
  const section = sectionShell(station, 'fallback', 'standard');
  const zone = el('div', 'bhv2-zone bhv2-station-fallback');
  zone.append(
    el('p', 'bhv2-kicker', `Exhibit ${station.number}`),
    el('h2', '', station.title || 'Exhibit unavailable'),
    el('p', '', station.child || 'The enhanced exhibit is unavailable.'),
    el('p', 'bhv2-failure-note', 'This exhibit could not start. The rest of the museum remains available.')
  );
  console.error(`[HRV BHM V2] Station ${station.number} failed.`, error);
  section.append(zone);
  return section;
}

function buildStation(station, builder) {
  try {
    return builder();
  } catch (error) {
    return stationFallback(station, error);
  }
}

function validateBundle(content, assets, experience) {
  if (content?.schemaVersion !== '1.0' || !Array.isArray(content.stations) || content.stations.length !== 10) throw new Error('Invalid black-hole content manifest.');
  if (assets?.schemaVersion !== '1.0' || !Array.isArray(assets.assets)) throw new Error('Invalid black-hole asset manifest.');
  if (experience?.schemaVersion !== '1.0') throw new Error('Invalid black-hole experience manifest.');
}

export async function mountBlackHoleMuseum({ mount, release, content, assets, experience }) {
  if (!mount) throw new Error('Mount is required.');
  validateBundle(content, assets, experience);

  const nativeNodes = [...mount.childNodes];
  const assetIndex = assetMap(assets);
  const cleanups = [];
  const state = { reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches, motionPaused: false };

  const shell = el('div', 'bhv2-shell');
  shell.dataset.renderer = RENDERER_VERSION;
  shell.dataset.motion = state.reducedMotion ? 'still' : 'running';
  shell.dataset.experienceProfile = experience.defaultProfile || '5';

  const skip = document.createElement('a');
  skip.className = 'bhv2-skip';
  skip.href = '#classroom-threshold';
  skip.textContent = 'Skip to the Black Hole Museum';
  const utility = buildUtilityBar(content, state);
  shell.append(skip, buildHero(content), utility.bar);

  const main = el('main', 'bhv2-main');
  main.id = 'bhv2-main';
  const s01 = stationByNumber(content, '01');
  const s02 = stationByNumber(content, '02');
  const s03 = stationByNumber(content, '03');
  const s04 = stationByNumber(content, '04');
  const s05 = stationByNumber(content, '05');
  const s06 = stationByNumber(content, '06');
  const s07 = stationByNumber(content, '07');
  const s08 = stationByNumber(content, '08');
  const s09 = stationByNumber(content, '09');
  const s10 = stationByNumber(content, '10');

  main.append(
    buildStation(s01, () => buildOpeningRecap(s01, content)),
    buildStation(s02, () => buildLensing(s02)),
    buildStation(s03, () => buildEvidence(s03, assetIndex)),
    buildStation(s04, () => buildOrbit(s04, assetIndex)),
    buildStation(s05, () => buildTelescope(s05, assetIndex)),
    buildStation(s06, () => buildReconstruction(s06, assetIndex)),
    buildStation(s07, () => buildComparison(s07, assetIndex)),
    buildStation(s08, () => buildWarpedLight(s08, assetIndex)),
    buildStation(s09, () => buildAnatomy(s09))
  );
  const mediaCenter = buildMediaCenter();
  main.append(mediaCenter, buildStation(s10, () => buildBoundary(s10, content, assetIndex)), buildCredits(content, assets));
  shell.append(main, buildFooter(release, content));

  try {
    mount.replaceChildren(shell);
    mount.classList.remove('hrv-native-fallback');
    mount.classList.add('bhv2-mounted');
    mount.dataset.hrvState = 'ready';

    const sections = [...shell.querySelectorAll('.bhv2-section')];
    installMotionControl(shell, utility.motion, state);
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
