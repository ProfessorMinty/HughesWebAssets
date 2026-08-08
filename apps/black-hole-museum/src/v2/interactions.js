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

function setPressed(buttons, activeIndex) {
  buttons.forEach((item, index) => {
    const active = index === activeIndex;
    item.classList.toggle('is-active', active);
    item.setAttribute('aria-pressed', String(active));
  });
}

export function createLensingInteractive(station) {
  const module = el('div', 'bhv2-lensing bhv2-feature-module');
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 650;
  canvas.setAttribute('aria-label', 'Simplified diagram of background stars and bent light near an invisible massive center.');

  const paths = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  paths.setAttribute('class', 'bhv2-lensing-paths');
  paths.setAttribute('viewBox', '0 0 1200 650');
  paths.setAttribute('aria-hidden', 'true');
  paths.innerHTML = '<path d="M70 150 C390 140 410 300 600 324 C790 348 810 510 1130 500"/><path d="M70 500 C370 510 430 372 600 326 C770 280 830 140 1130 150"/><circle cx="600" cy="325" r="72"/>';

  const center = el('div', 'bhv2-lensing-center');
  center.setAttribute('aria-hidden', 'true');

  const controls = el('div', 'bhv2-control-row');
  const labels = station.interaction?.states || ['Quiet sky', 'Bent light', 'Show paths'];
  const buttons = labels.map((label, index) => {
    const control = button(label);
    control.setAttribute('aria-pressed', index === 0 ? 'true' : 'false');
    if (index === 0) control.classList.add('is-active');
    controls.append(control);
    return control;
  });

  const ctx = canvas.getContext('2d');
  const stars = Array.from({ length: 115 }, (_, i) => {
    const angle = (i * 2.3999632297) % (Math.PI * 2);
    const radius = 80 + ((i * 83) % 500);
    return { x: 600 + Math.cos(angle) * radius, y: 325 + Math.sin(angle) * radius * .55, r: 1 + (i % 4) * .45 };
  });

  function draw(mode) {
    ctx.clearRect(0, 0, 1200, 650);
    const background = ctx.createRadialGradient(600, 325, 20, 600, 325, 650);
    background.addColorStop(0, '#02030a');
    background.addColorStop(1, '#07142d');
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, 1200, 650);

    stars.forEach((star, i) => {
      let x = star.x;
      let y = star.y;
      let stretch = 1;
      if (mode !== 'quiet') {
        const dx = x - 600;
        const dy = y - 325;
        const distance = Math.max(70, Math.hypot(dx, dy));
        const bend = Math.min(46, 7600 / (distance * distance));
        x += (-dy / distance) * bend * (i % 2 ? 1 : -1);
        y += (dx / distance) * bend * (i % 2 ? 1 : -1);
        stretch = distance < 230 ? 3.2 : 1;
      }
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.atan2(y - 325, x - 600) + Math.PI / 2);
      ctx.fillStyle = i % 8 === 0 ? '#7ff4ff' : '#ffffff';
      ctx.globalAlpha = .55 + (i % 5) * .09;
      ctx.beginPath();
      ctx.ellipse(0, 0, star.r * stretch, star.r, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  buttons.forEach((control, index) => {
    control.addEventListener('click', () => {
      setPressed(buttons, index);
      draw(index === 0 ? 'quiet' : 'bent');
      module.classList.toggle('show-paths', index === 2);
    });
  });

  draw('quiet');
  module.append(canvas, paths, center, controls);
  return module;
}

export function createEvidenceInteractive(station) {
  const module = el('div', 'bhv2-evidence-model bhv2-feature-module');
  const center = el('div', 'bhv2-evidence-center', 'Invisible mass');
  const clues = el('div', 'bhv2-clue-grid');

  (station.clues || []).forEach((clue) => {
    const card = button('', 'bhv2-clue');
    card.setAttribute('aria-expanded', 'false');
    card.append(
      el('span', 'bhv2-clue-symbol', clue.symbol || '•'),
      el('strong', '', clue.title || ''),
      el('span', 'bhv2-clue-copy', clue.text || '')
    );
    card.addEventListener('click', () => {
      const expanded = card.classList.toggle('is-open');
      card.setAttribute('aria-expanded', String(expanded));
    });
    clues.append(card);
  });

  const reveal = button(station.interaction?.label || 'Reveal all clues', 'bhv2-primary');
  reveal.addEventListener('click', () => {
    clues.querySelectorAll('.bhv2-clue').forEach((card) => {
      card.classList.add('is-open');
      card.setAttribute('aria-expanded', 'true');
    });
  });

  module.append(center, clues, reveal);
  return module;
}

export function createOrbitOverlay(station) {
  const overlay = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  overlay.setAttribute('class', 'bhv2-orbit-overlay');
  overlay.setAttribute('viewBox', '0 0 1000 560');
  overlay.setAttribute('aria-hidden', 'true');
  overlay.innerHTML = '<ellipse cx="500" cy="280" rx="270" ry="120"/><circle cx="500" cy="280" r="9"/><circle class="bhv2-orbit-star" cx="770" cy="280" r="13"/>';

  const control = button(station.interaction?.label || 'Trace the featured star', 'bhv2-primary');
  control.setAttribute('aria-pressed', 'false');
  control.addEventListener('click', () => {
    const active = overlay.classList.toggle('is-traced');
    control.setAttribute('aria-pressed', String(active));
  });

  return { overlay, control };
}

export function createEarthNetwork(station) {
  const module = el('div', 'bhv2-earth-network bhv2-standard-module');
  const earth = el('div', 'bhv2-earth');
  const sites = [
    ['ALMA', 25, 72], ['APEX', 30, 72], ['LMT', 36, 42], ['SMT', 31, 37],
    ['SMA', 48, 14], ['JCMT', 43, 17], ['SPT', 86, 50], ['IRAM', 24, 53]
  ];

  const lines = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  lines.setAttribute('class', 'bhv2-earth-lines');
  lines.setAttribute('viewBox', '0 0 100 100');
  lines.setAttribute('aria-hidden', 'true');

  const siteButtons = sites.map(([name, top, left], index) => {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const bend = index % 2 === 0 ? 7 : -7;
    path.setAttribute('d', `M 50 50 Q ${(50 + left) / 2 + bend} ${(50 + top) / 2 - bend} ${left} ${top}`);
    path.dataset.siteIndex = String(index);
    lines.append(path);

    const node = button(name, 'bhv2-site');
    node.style.top = top + '%';
    node.style.left = left + '%';
    node.setAttribute('aria-pressed', 'false');
    node.dataset.siteIndex = String(index);
    earth.append(node);
    return node;
  });

  earth.prepend(lines);

  function update() {
    siteButtons.forEach((site, index) => {
      const active = site.classList.contains('is-on');
      site.setAttribute('aria-pressed', String(active));
      lines.querySelector(`[data-site-index="${index}"]`)?.classList.toggle('is-on', active);
    });
    const activeCount = siteButtons.filter((site) => site.classList.contains('is-on')).length;
    earth.dataset.networkState = activeCount === 0 ? 'quiet' : activeCount === siteButtons.length ? 'complete' : 'partial';
  }

  siteButtons.forEach((site) => {
    site.addEventListener('click', () => {
      site.classList.toggle('is-on');
      update();
    });
  });

  const all = button(station.interaction?.label || 'Show the complete network', 'bhv2-primary');
  all.addEventListener('click', () => {
    siteButtons.forEach((site) => site.classList.add('is-on'));
    update();
  });

  update();
  module.append(earth, all);
  return { module, siteNames: sites.map(([name]) => name) };
}

export function createReconstructionInteractive(station) {
  const module = el('div', 'bhv2-reconstruction bhv2-standard-module');
  const visual = el('div', 'bhv2-reconstruction-visual');
  const controls = el('div', 'bhv2-process-controls');
  const states = [
    { name: 'Measurements', cls: 'measurements', text: 'Timed radio measurements from many observatories.' },
    { name: 'Possible reconstructions', cls: 'possibilities', text: 'Several image structures can fit the data.' },
    { name: 'Published result', cls: 'average', text: 'A carefully evaluated average of compatible reconstructions.' }
  ];
  const buttons = states.map((state, index) => {
    const control = button(state.name, 'bhv2-process-button');
    control.setAttribute('aria-pressed', index === 0 ? 'true' : 'false');
    if (index === 0) control.classList.add('is-active');
    control.addEventListener('click', () => setState(index));
    controls.append(control);
    return control;
  });

  function setState(index) {
    const state = states[index];
    visual.className = `bhv2-reconstruction-visual is-${state.cls}`;
    visual.setAttribute('aria-label', state.text);
    setPressed(buttons, index);
  }

  setState(0);
  module.append(visual, controls);
  return { module, states };
}

export function createComparisonControls(station, onState) {
  const wrap = el('div', 'bhv2-control-row bhv2-comparison-controls');
  const labels = station.interaction?.states || ['View separately', 'Compare', 'Galaxy context', 'Relative scale'];
  const buttons = labels.map((label, index) => {
    const control = button(label);
    control.setAttribute('aria-pressed', index === 0 ? 'true' : 'false');
    if (index === 0) control.classList.add('is-active');
    control.addEventListener('click', () => {
      setPressed(buttons, index);
      onState(index);
    });
    wrap.append(control);
    return control;
  });
  return wrap;
}

export function createWarpedLightInteractive(station) {
  const module = el('div', 'bhv2-warped-light bhv2-feature-module');
  const visual = el('div', 'bhv2-accretion-visual');
  visual.innerHTML = '<div class="bhv2-disk bhv2-disk-back"></div><div class="bhv2-shadow"></div><div class="bhv2-disk bhv2-disk-front"></div><div class="bhv2-photon-ring"></div><svg viewBox="0 0 800 500" class="bhv2-photon-overlay" aria-hidden="true"><path d="M40 110 C240 90 280 250 400 250 C520 250 560 410 760 390"/><path d="M40 390 C240 410 280 250 400 250 C520 250 560 90 760 110"/></svg>';

  const controls = el('div', 'bhv2-warp-controls');
  const range = document.createElement('input');
  range.type = 'range';
  range.min = '0';
  range.max = '100';
  range.value = '48';
  range.setAttribute('aria-label', 'Accretion-disk viewing angle');
  const output = el('output', '', 'Slanted viewpoint');

  function apply(value) {
    const numeric = Number(value);
    visual.style.setProperty('--angle', numeric + 'deg');
    visual.dataset.angle = numeric < 25 ? 'above' : numeric > 75 ? 'edge' : 'slanted';
    output.textContent = numeric < 25 ? 'Above viewpoint' : numeric > 75 ? 'Edge-on viewpoint' : 'Slanted viewpoint';
  }

  range.addEventListener('input', (event) => apply(event.target.value));
  controls.append(range, output);

  const presets = el('div', 'bhv2-control-row');
  const values = [10, 48, 88];
  (station.interaction?.presets || ['Above', 'Slanted', 'Edge-on']).forEach((label, index) => {
    const control = button(label);
    control.addEventListener('click', () => {
      range.value = String(values[index]);
      apply(values[index]);
    });
    presets.append(control);
  });

  const paths = button('Show photon paths');
  paths.setAttribute('aria-pressed', 'false');
  paths.addEventListener('click', () => {
    const active = visual.classList.toggle('show-paths');
    paths.setAttribute('aria-pressed', String(active));
  });

  controls.append(presets, paths);
  apply(48);
  module.append(visual, controls);
  return module;
}

export function createAnatomyInteractive(station) {
  const module = el('div', 'bhv2-anatomy bhv2-feature-module');
  const diagram = el('div', 'bhv2-anatomy-diagram');
  diagram.innerHTML = '<i class="bhv2-layer emission"></i><i class="bhv2-layer shadow"></i><i class="bhv2-layer photon"></i><i class="bhv2-layer horizon"></i>';
  const controls = el('div', 'bhv2-anatomy-controls');
  const description = el('p', 'bhv2-anatomy-description', 'Select a layer to inspect the model.');

  (station.layers || []).forEach((layer) => {
    const control = button(layer.title);
    control.setAttribute('aria-pressed', 'false');
    control.addEventListener('click', () => {
      diagram.dataset.layer = layer.id;
      controls.querySelectorAll('button').forEach((item) => item.setAttribute('aria-pressed', 'false'));
      control.setAttribute('aria-pressed', 'true');
      description.textContent = layer.text;
    });
    controls.append(control);
  });

  module.append(diagram, controls, description);
  return module;
}
