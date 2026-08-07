import { mountBlackHoleMuseum as mountVerifiedMuseum } from 'https://cdn.jsdelivr.net/gh/ProfessorMinty/HughesWebAssets@v0.1.0-black-hole-lab.2/dist/v0.1.0-black-hole-lab.2/black-hole-museum.js';

const PRESENTATION_VERSION = 'maximum-shelf-2026.08.07.1';

function decorative(tag, className, text = '') {
  const node = document.createElement(tag);
  node.className = className;
  node.setAttribute('aria-hidden', 'true');
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

function installActiveChamber(shell, cleanups) {
  if (!('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver(entries => {
    const visible = entries
      .filter(entry => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible) shell.dataset.activeStation = visible.target.dataset.station || '';
  }, { rootMargin: '-18% 0px -52% 0px', threshold: [0.06, 0.18, 0.36] });

  shell.querySelectorAll('.bhm-chamber').forEach(chamber => observer.observe(chamber));
  cleanups.push(() => observer.disconnect());
}

function enrichDiagnostics(shell) {
  const dl = shell.querySelector('.bhm-diagnostics dl');
  if (!dl) return;
  const row = document.createElement('div');
  const dt = document.createElement('dt');
  const dd = document.createElement('dd');
  dt.textContent = 'Presentation';
  dd.textContent = PRESENTATION_VERSION;
  row.append(dt, dd);
  dl.append(row);
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
  installActiveChamber(shell, cleanups);
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
