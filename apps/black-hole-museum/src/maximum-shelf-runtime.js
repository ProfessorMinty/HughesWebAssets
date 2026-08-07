import { mountBlackHoleMuseum as mountVerifiedMuseum } from 'https://cdn.jsdelivr.net/gh/ProfessorMinty/HughesWebAssets@v0.1.0-black-hole-lab.2/dist/v0.1.0-black-hole-lab.2/black-hole-museum.js';

const PRESENTATION_VERSION = 'maximum-shelf-2026.08.07.3';
const RUNTIME_WINDOW = 'current-plus-one-ahead';
const SIMULATED_MEDIA = [
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

function decorative(tag, className, text = '') {
  const node = document.createElement(tag);
  node.className = className;
  node.setAttribute('aria-hidden', 'true');
  if (text) node.textContent = text;
  return node;
}

function element(tag, className, text = '') {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function addMuseumLightfield(shell) {
  const field = decorative('div', 'bhm-max-lightfield');
  field.append(
    decorative('i', 'bhm-max-lightfield-orbit bhm-max-lightfield-orbit-a'),
    decorative('i', 'bhm-max-lightfield-orbit bhm-max-lightfield-orbit-b'),
    decorative('i', 'bhm-max-lightfield-orbit bhm-max-lightfield-orbit-c')
  );
  shell.prepend(field);
}

function addThresholdArchitecture(shell) {
  const stage = shell.querySelector('.bhm-threshold-architecture');
  if (!stage) return;
  const frames = decorative('div', 'bhm-max-corridor-frames');
  for (let i = 0; i < 4; i += 1) {
    const frame = decorative('i', 'bhm-max-corridor-frame');
    frame.style.setProperty('--frame-index', String(i));
    frames.append(frame);
  }
  stage.prepend(frames);
}

function addChamberIdentity(shell, content) {
  const stations = new Map((content.stations || []).map(station => [station.id, station]));
  const chambers = [...shell.querySelectorAll('.bhm-chamber')];

  chambers.forEach((chamber, index) => {
    const station = stations.get(chamber.id);
    if (!station) return;

    const ghost = decorative('div', 'bhm-max-chamber-identity');
    ghost.append(
      decorative('span', 'bhm-max-chamber-number', station.number),
      decorative('span', 'bhm-max-chamber-name', station.title)
    );
    chamber.append(ghost);

    if (index < chambers.length - 1) {
      const next = stations.get(chambers[index + 1].id);
      const transition = decorative('div', 'bhm-max-transition');
      transition.dataset.from = station.number;
      transition.dataset.to = next?.number || '';
      transition.append(
        decorative('i', 'bhm-max-transition-line'),
        decorative('span', 'bhm-max-transition-label', next ? `${next.number} · ${next.title}` : '')
      );
      chamber.after(transition);
    }
  });
}

function addLensingReticle(shell) {
  const stage = shell.querySelector('.bhm-lensing-stage');
  if (!stage) return;
  const reticle = decorative('div', 'bhm-max-lensing-reticle');
  reticle.append(
    decorative('i', 'bhm-max-reticle-ring bhm-max-reticle-ring-a'),
    decorative('i', 'bhm-max-reticle-ring bhm-max-reticle-ring-b'),
    decorative('i', 'bhm-max-reticle-axis bhm-max-reticle-axis-x'),
    decorative('i', 'bhm-max-reticle-axis bhm-max-reticle-axis-y')
  );
  stage.append(reticle);
}

function addEarthNetwork(shell, cleanups) {
  const earth = shell.querySelector('.bhm-earth');
  if (!earth) return;

  const sites = [...earth.querySelectorAll('.bhm-site')];
  if (!sites.length) return;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'bhm-max-earth-network');
  svg.setAttribute('viewBox', '0 0 100 100');
  svg.setAttribute('aria-hidden', 'true');

  sites.forEach((site, index) => {
    const x = Number.parseFloat(site.style.left) || 50;
    const y = Number.parseFloat(site.style.top) || 50;
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const bend = index % 2 === 0 ? 7 : -7;
    line.setAttribute('d', `M 50 50 Q ${(50 + x) / 2 + bend} ${(50 + y) / 2 - bend} ${x} ${y}`);
    line.dataset.siteIndex = String(index);
    svg.append(line);

    const node = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    node.setAttribute('cx', String(x));
    node.setAttribute('cy', String(y));
    node.setAttribute('r', '0.85');
    node.dataset.siteIndex = String(index);
    svg.append(node);
  });

  earth.prepend(svg);

  const update = () => {
    const active = sites.filter(site => site.classList.contains('is-on'));
    earth.dataset.networkState = active.length === 0 ? 'quiet' : active.length === sites.length ? 'complete' : 'partial';
    sites.forEach((site, index) => {
      const on = site.classList.contains('is-on');
      svg.querySelectorAll(`[data-site-index="${index}"]`).forEach(node => node.classList.toggle('is-on', on));
    });
  };

  const clickHandler = () => requestAnimationFrame(update);
  earth.addEventListener('click', clickHandler);
  cleanups.push(() => earth.removeEventListener('click', clickHandler));
  update();
}

function addArtifactBays(shell) {
  shell.querySelectorAll('.bhm-rotunda-stage .bhm-media-card').forEach((card, index) => {
    const bay = decorative('div', 'bhm-max-artifact-bay');
    bay.dataset.bay = String(index + 1);
    card.prepend(bay);
  });
}

function addScrollProgress(shell, mount, cleanups) {
  const progress = decorative('div', 'bhm-max-progress');
  const rail = decorative('i', 'bhm-max-progress-rail');
  const fill = decorative('i', 'bhm-max-progress-fill');
  progress.append(rail, fill);
  shell.append(progress);

  let raf = 0;
  const update = () => {
    raf = 0;
    const rect = mount.getBoundingClientRect();
    const total = Math.max(1, rect.height - window.innerHeight);
    const travelled = Math.min(total, Math.max(0, -rect.top));
    shell.style.setProperty('--bhm-scroll-progress', String(travelled / total));
  };
  const schedule = () => {
    if (!raf) raf = requestAnimationFrame(update);
  };

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  cleanups.push(() => {
    window.removeEventListener('scroll', schedule);
    window.removeEventListener('resize', schedule);
    if (raf) cancelAnimationFrame(raf);
  });
  update();
}

function createYouTubeCard(item) {
  const card = element('article', 'bhm-youtube-card');
  const frame = element('div', 'bhm-youtube-frame');
  frame.dataset.youtubeId = item.youtubeId;
  frame.dataset.youtubeTitle = item.title;
  frame.append(element('div', 'bhm-youtube-placeholder', 'Video player wakes up when the Media Center is nearby.'));

  const meta = element('div', 'bhm-youtube-card-meta');
  const heading = element('h3', '', item.title);
  const source = element('p');
  source.append(element('span', 'bhm-youtube-source', item.source), document.createTextNode(` · ${item.length}`));
  const note = element('p', '', item.note);
  meta.append(heading, source, note);
  card.append(frame, meta);
  return card;
}

function activateYouTubeFrame(frame) {
  if (frame.querySelector('iframe')) return;
  const id = frame.dataset.youtubeId;
  if (!id) return;

  const iframe = document.createElement('iframe');
  iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=0&controls=1&rel=0&playsinline=1`;
  iframe.title = frame.dataset.youtubeTitle || 'YouTube video';
  iframe.loading = 'lazy';
  iframe.referrerPolicy = 'strict-origin-when-cross-origin';
  iframe.allow = 'accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
  iframe.allowFullscreen = true;
  frame.append(iframe);
}

function deactivateYouTubeFrame(frame) {
  const iframe = frame.querySelector('iframe');
  if (iframe) iframe.remove();
}

function addMediaCenter(shell, cleanups) {
  const edge = shell.querySelector('#edge-of-the-known');
  if (!edge) return;

  const center = element('section', 'bhm-media-center');
  center.id = 'black-hole-media-center';
  center.setAttribute('aria-labelledby', 'black-hole-media-center-title');
  center.dataset.playerState = 'sleeping';

  const inner = element('div', 'bhm-media-center-inner');
  const intro = element('div', 'bhm-media-center-intro');
  intro.append(
    element('p', 'bhm-media-center-kicker', 'Watch · pause · wonder'),
    element('h2', '', 'Black Hole Media Center'),
    element('p', '', 'Two optional YouTube stops for visitors who want the story told out loud. Players use normal YouTube controls and never autoplay.'),
    element('p', 'bhm-media-center-warning', 'SIMULATED MEDIA SELECTION · NOT A RECORD OF MS HUGHES APPROVAL')
  );
  intro.querySelector('h2').id = 'black-hole-media-center-title';

  const grid = element('div', 'bhm-media-center-grid');
  SIMULATED_MEDIA.forEach(item => grid.append(createYouTubeCard(item)));
  inner.append(intro, grid);
  center.append(inner);
  edge.before(center);

  const frames = [...center.querySelectorAll('.bhm-youtube-frame')];
  const activate = () => {
    frames.forEach(activateYouTubeFrame);
    center.dataset.playerState = 'ready';
  };
  const sleep = () => {
    frames.forEach(deactivateYouTubeFrame);
    center.dataset.playerState = 'sleeping';
  };

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) activate();
        else if (center.dataset.playerState === 'ready') sleep();
      });
    }, { rootMargin: '100% 0px 100% 0px', threshold: 0 });
    observer.observe(center);
    cleanups.push(() => observer.disconnect());
  } else {
    activate();
  }

  cleanups.push(sleep);
}

function setVideoBudget(chamber, state) {
  chamber.querySelectorAll('video').forEach(video => {
    if (state === 'live') {
      video.preload = 'auto';
      return;
    }
    if (state === 'next') {
      video.preload = 'metadata';
      return;
    }
    video.pause();
    video.preload = 'none';
  });
}

function installRuntimeWindow(shell, cleanups) {
  const chambers = [...shell.querySelectorAll('.bhm-chamber')];
  if (!chambers.length) return;

  shell.dataset.runtimeWindow = RUNTIME_WINDOW;
  let activeIndex = 0;
  let direction = 1;
  let lastScrollY = window.scrollY;
  let raf = 0;

  const chooseActive = () => {
    const anchor = window.innerHeight * 0.42;
    let bestIndex = 0;
    let bestDistance = Number.POSITIVE_INFINITY;

    chambers.forEach((chamber, index) => {
      const rect = chamber.getBoundingClientRect();
      const containsAnchor = rect.top <= anchor && rect.bottom >= anchor;
      const distance = containsAnchor
        ? 0
        : Math.min(Math.abs(rect.top - anchor), Math.abs(rect.bottom - anchor));
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = index;
      }
    });
    return bestIndex;
  };

  const applyWindow = () => {
    raf = 0;
    const nextIndex = Math.max(0, Math.min(chambers.length - 1, activeIndex + direction));

    chambers.forEach((chamber, index) => {
      const state = index === activeIndex ? 'live' : index === nextIndex ? 'next' : 'dormant';
      chamber.classList.toggle('is-runtime-live', state === 'live');
      chamber.classList.toggle('is-runtime-next', state === 'next');
      chamber.classList.toggle('is-runtime-dormant', state === 'dormant');
      chamber.dataset.runtimeState = state;
      setVideoBudget(chamber, state);
    });

    shell.dataset.runtimeStation = chambers[activeIndex]?.dataset.station || '';
    shell.dataset.runtimeDirection = direction > 0 ? 'forward' : 'backward';
  };

  const schedule = () => {
    const y = window.scrollY;
    if (Math.abs(y - lastScrollY) > 2) direction = y >= lastScrollY ? 1 : -1;
    lastScrollY = y;
    const nextActive = chooseActive();
    if (nextActive !== activeIndex) activeIndex = nextActive;
    if (!raf) raf = requestAnimationFrame(applyWindow);
  };

  activeIndex = chooseActive();
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  cleanups.push(() => {
    window.removeEventListener('scroll', schedule);
    window.removeEventListener('resize', schedule);
    if (raf) cancelAnimationFrame(raf);
  });
  applyWindow();
}

function simplifyControls(shell) {
  const dock = shell.querySelector('.bhm-control-dock');
  if (!dock) return;

  dock.querySelectorAll('button').forEach(button => {
    const label = button.textContent.trim();
    if (/essential-content mode/i.test(label) || /standard media mode/i.test(label)) {
      button.remove();
      return;
    }
    if (/pause museum motion/i.test(label)) button.textContent = 'Pause motion';
    if (/resume museum motion/i.test(label)) button.textContent = 'Resume motion';
  });

  dock.querySelectorAll('select').forEach(select => {
    if (select.getAttribute('aria-label') === 'Laboratory magic profile') select.remove();
  });

  dock.dataset.maximumShelfControls = 'simplified';
}

function fixRotundaControls(shell) {
  const section = shell.querySelector('#twin-ring-rotunda');
  if (!section) return;
  const controls = section.querySelector('.bhm-state-controls');
  if (!controls) return;

  const buttons = [...controls.querySelectorAll('button')];
  const separate = buttons.find(button => /view separately/i.test(button.textContent));
  const compare = buttons.find(button => /^compare$/i.test(button.textContent.trim()));

  if (separate) separate.remove();
  if (compare) {
    compare.textContent = 'Compare side by side';
    compare.click();
  }
}

function enrichDiagnostics(shell) {
  const dl = shell.querySelector('.bhm-diagnostics dl');
  if (!dl) return;
  const rows = [
    ['Presentation', PRESENTATION_VERSION],
    ['Scroll budget', RUNTIME_WINDOW],
    ['Media Center', '2 simulated YouTube selections · no autoplay']
  ];

  rows.forEach(([label, value]) => {
    const row = document.createElement('div');
    const dt = document.createElement('dt');
    const dd = document.createElement('dd');
    dt.textContent = label;
    dd.textContent = value;
    row.append(dt, dd);
    dl.append(row);
  });
}

function installMaximumShelf({ mount, content }) {
  const shell = mount.querySelector('.bhm-museum');
  if (!shell) throw new Error('Maximum-shelf presentation could not find the mounted museum shell.');

  shell.dataset.presentation = PRESENTATION_VERSION;
  const cleanups = [];
  const baseDestroy = mount.__bhmDestroy;

  addMuseumLightfield(shell);
  addThresholdArchitecture(shell);
  addChamberIdentity(shell, content);
  addLensingReticle(shell);
  addEarthNetwork(shell, cleanups);
  addArtifactBays(shell);
  addScrollProgress(shell, mount, cleanups);
  addMediaCenter(shell, cleanups);
  installRuntimeWindow(shell, cleanups);
  simplifyControls(shell);
  fixRotundaControls(shell);
  enrichDiagnostics(shell);

  mount.__bhmDestroy = () => {
    cleanups.splice(0).forEach(cleanup => {
      try { cleanup(); } catch {}
    });
    if (typeof baseDestroy === 'function') baseDestroy();
  };
}

export async function mountBlackHoleMuseum(args) {
  await mountVerifiedMuseum(args);
  installMaximumShelf(args);
}
