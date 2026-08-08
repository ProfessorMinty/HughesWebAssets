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

function setToggle(control, active) {
  control.classList.toggle('is-active', active);
  control.setAttribute('aria-pressed', String(active));
}

export function createLensingInteractive(station) {
  const module = el('div', 'bhv2-lensing bhv2-atrium-instrument');
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

  const controls = el('div', 'bhv2-control-row bhv2-atrium-controls');
  const labels = station.interaction?.states || ['Quiet sky', 'Bent light', 'Show paths'];
  const readout = el('p', 'bhv2-state-readout', 'Quiet sky: the background stars are undisturbed.');
  readout.setAttribute('aria-live', 'polite');
  const buttons = labels.map((label, index) => {
    const control = button(label);
    control.setAttribute('aria-pressed', index === 0 ? 'true' : 'false');
    if (index === 0) control.classList.add('is-active');
    controls.append(control);
    return control;
  });

  const ctx = canvas.getContext('2d');
  const stars = Array.from({ length: 128 }, (_, i) => {
    const angle = (i * 2.3999632297) % (Math.PI * 2);
    const radius = 76 + ((i * 83) % 520);
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
      ctx.fillStyle = i % 8 === 0 ? '#8cf4ff' : '#ffffff';
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
      readout.textContent = index === 0
        ? 'Quiet sky: the background stars are undisturbed.'
        : index === 1
          ? 'Bent light: the empty center becomes visible through changes around it.'
          : 'Light paths: a simplified diagram shows how the apparent paths bend around the invisible center.';
    });
  });

  draw('quiet');
  module.append(canvas, paths, center, controls, readout);
  return module;
}

export function createEvidenceInteractive(station) {
  const module = el('div', 'bhv2-evidence-model');
  const lines = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  lines.setAttribute('class', 'bhv2-evidence-lines');
  lines.setAttribute('viewBox', '0 0 1000 700');
  lines.setAttribute('aria-hidden', 'true');
  lines.innerHTML = [
    '<path data-clue-line="0" d="M500 350 C390 290 310 205 185 155"/>',
    '<path data-clue-line="1" d="M500 350 C635 270 730 210 825 165"/>',
    '<path data-clue-line="2" d="M500 350 C385 455 300 520 170 555"/>',
    '<path data-clue-line="3" d="M500 350 C640 430 725 500 840 555"/>'
  ].join('');

  const center = el('div', 'bhv2-evidence-center');
  center.innerHTML = '<strong>Invisible mass</strong><span>We infer the hidden object from several independent clues.</span>';
  const clueWrap = el('div', 'bhv2-evidence-clues');
  const clueButtons = [];

  (station.clues || []).forEach((clue, index) => {
    const card = button('', `bhv2-clue bhv2-clue--${index + 1}${index === 3 ? ' bhv2-clue--support' : ''}`);
    card.setAttribute('aria-expanded', 'false');
    const copy = el('span', 'bhv2-clue-copy', clue.text || '');
    copy.hidden = true;
    card.append(
      el('span', 'bhv2-clue-symbol', clue.symbol || '•'),
      el('strong', 'bhv2-clue-title', clue.title || ''),
      copy
    );
    card.addEventListener('click', () => {
      const expanded = !card.classList.contains('is-open');
      card.classList.toggle('is-open', expanded);
      card.setAttribute('aria-expanded', String(expanded));
      copy.hidden = !expanded;
      lines.querySelector(`[data-clue-line="${index}"]`)?.classList.toggle('is-on', expanded);
      syncMaster();
    });
    clueButtons.push(card);
    clueWrap.append(card);
  });

  const reveal = button(station.interaction?.label || 'Reveal all clues', 'bhv2-primary bhv2-evidence-master');
  function syncMaster() {
    const allOpen = clueButtons.length > 0 && clueButtons.every((card) => card.classList.contains('is-open'));
    setToggle(reveal, allOpen);
    reveal.textContent = allOpen ? 'Hide all clues' : 'Reveal all clues';
  }
  reveal.addEventListener('click', () => {
    const shouldOpen = !clueButtons.every((card) => card.classList.contains('is-open'));
    clueButtons.forEach((card, index) => {
      const copy = card.querySelector('.bhv2-clue-copy');
      card.classList.toggle('is-open', shouldOpen);
      card.setAttribute('aria-expanded', String(shouldOpen));
      if (copy) copy.hidden = !shouldOpen;
      lines.querySelector(`[data-clue-line="${index}"]`)?.classList.toggle('is-on', shouldOpen);
    });
    syncMaster();
  });

  module.append(lines, center, clueWrap, reveal);
  syncMaster();
  return module;
}

export function createOrbitOverlay() {
  const overlay = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  overlay.setAttribute('class', 'bhv2-orbit-overlay');
  overlay.setAttribute('viewBox', '0 0 1000 560');
  overlay.setAttribute('aria-hidden', 'true');
  overlay.innerHTML = [
    '<g class="bhv2-orbit-trace"><path d="M188 327 C246 177 410 112 585 151 C746 188 824 306 763 407 C704 505 532 514 388 466 C254 421 145 385 188 327"/><circle class="bhv2-orbit-star" cx="763" cy="407" r="13"/></g>',
    '<g class="bhv2-orbit-center-marker"><circle cx="500" cy="315" r="18"/><path d="M500 281v68M466 315h68"/></g>',
    '<g class="bhv2-orbit-compare"><ellipse cx="500" cy="315" rx="320" ry="168"/></g>'
  ].join('');

  const controls = el('div', 'bhv2-orbit-controls');
  const trace = button('Trace featured orbit', 'bhv2-primary');
  const center = button('Mark invisible center');
  const compare = button('Show simplified comparison');
  [trace, center, compare].forEach((control) => control.setAttribute('aria-pressed', 'false'));
  const status = el('p', 'bhv2-state-readout', 'Observation only. Explanatory overlays are currently hidden.');
  status.setAttribute('aria-live', 'polite');

  trace.addEventListener('click', () => {
    const active = overlay.classList.toggle('show-trace');
    setToggle(trace, active);
    trace.textContent = active ? 'Hide featured orbit' : 'Trace featured orbit';
    status.textContent = active
      ? 'A simplified explanatory path is overlaid on the real observation.'
      : 'Observation only. The orbit guide is hidden.';
  });
  center.addEventListener('click', () => {
    const active = overlay.classList.toggle('show-center');
    setToggle(center, active);
    center.textContent = active ? 'Hide center marker' : 'Mark invisible center';
  });
  compare.addEventListener('click', () => {
    const active = overlay.classList.toggle('show-compare');
    setToggle(compare, active);
    compare.textContent = active ? 'Hide comparison guide' : 'Show simplified comparison';
  });

  controls.append(trace, center, compare, status);
  return { overlay, controls };
}

export function createEarthNetwork(station) {
  const module = el('div', 'bhv2-earth-network');
  const stage = el('div', 'bhv2-network-stage');
  const earth = el('div', 'bhv2-earth');
  const sites = [
    ['ALMA', 25, 72], ['APEX', 30, 72], ['LMT', 36, 42], ['SMT', 31, 37],
    ['SMA', 48, 14], ['JCMT', 43, 17], ['SPT', 86, 50], ['IRAM', 24, 53]
  ];

  const lines = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  lines.setAttribute('class', 'bhv2-earth-lines');
  lines.setAttribute('viewBox', '0 0 100 100');
  lines.setAttribute('aria-hidden', 'true');

  const detail = el('aside', 'bhv2-network-detail');
  detail.append(
    el('p', 'bhv2-sidecar-label', 'Selected observatory'),
    el('h3', '', 'Choose a site'),
    el('p', '', 'Each selected station contributes synchronized radio measurements to the shared network.')
  );

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
    node.addEventListener('click', () => {
      node.classList.toggle('is-on');
      detail.querySelector('h3').textContent = name;
      detail.querySelector('p:last-child').textContent = `${name} is ${node.classList.contains('is-on') ? 'active in' : 'currently removed from'} the simplified synchronized network model.`;
      update();
    });
    earth.append(node);
    return node;
  });

  earth.prepend(lines);
  const all = button(station.interaction?.label || 'Show the complete network', 'bhv2-primary bhv2-network-master');
  const status = el('p', 'bhv2-state-readout', 'No observatories selected yet.');
  status.setAttribute('aria-live', 'polite');

  function update() {
    siteButtons.forEach((site, index) => {
      const active = site.classList.contains('is-on');
      site.setAttribute('aria-pressed', String(active));
      lines.querySelector(`[data-site-index="${index}"]`)?.classList.toggle('is-on', active);
    });
    const activeCount = siteButtons.filter((site) => site.classList.contains('is-on')).length;
    const complete = activeCount === siteButtons.length;
    earth.dataset.networkState = activeCount === 0 ? 'quiet' : complete ? 'complete' : 'partial';
    module.dataset.networkState = earth.dataset.networkState;
    setToggle(all, complete);
    all.textContent = complete ? 'Reset the network' : 'Show the complete network';
    status.textContent = activeCount === 0
      ? 'No observatories selected yet.'
      : complete
        ? 'Complete network: many observatories now act as one coordinated instrument.'
        : `${activeCount} of ${siteButtons.length} observatories are active in this simplified model.`;
  }

  all.addEventListener('click', () => {
    const complete = earth.dataset.networkState === 'complete';
    siteButtons.forEach((site) => site.classList.toggle('is-on', !complete));
    if (complete) {
      detail.querySelector('h3').textContent = 'Choose a site';
      detail.querySelector('p:last-child').textContent = 'Each selected station contributes synchronized radio measurements to the shared network.';
    }
    update();
  });

  stage.append(earth, detail);
  module.append(stage, all, status);
  update();
  return { module, siteNames: sites.map(([name]) => name) };
}

export function createReconstructionInteractive() {
  const module = el('div', 'bhv2-reconstruction');
  const visual = el('div', 'bhv2-reconstruction-visual');
  const controls = el('div', 'bhv2-process-controls');
  const status = el('p', 'bhv2-state-readout');
  status.setAttribute('aria-live', 'polite');
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
    status.textContent = state.text;
  }

  const explainers = el('div', 'bhv2-reconstruction-explainers');
  const several = document.createElement('details');
  several.append(el('summary', '', 'Why are there several versions?'), el('p', '', 'Several reconstructions can fit the telescope data. The published Sagittarius A* image is an average assembled from thousands of compatible reconstructions.'));
  const orange = document.createElement('details');
  orange.append(el('summary', '', 'Why orange?'), el('p', '', 'Orange is a presentation choice applied to radio data. It is not a visible-light color recorded by the telescope.'));
  explainers.append(several, orange);

  setState(0);
  module.append(visual, controls, status, explainers);
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

export function createWarpedLightInteractive() {
  const module = el('div', 'bhv2-warped-light');
  const visual = el('div', 'bhv2-accretion-visual');
  visual.innerHTML = '<div class="bhv2-disk bhv2-disk-back"></div><div class="bhv2-shadow"></div><div class="bhv2-disk bhv2-disk-front"></div><div class="bhv2-photon-ring"></div><div class="bhv2-boundary-horizon"></div><div class="bhv2-boundary-shadow"></div><svg viewBox="0 0 800 500" class="bhv2-photon-overlay" aria-hidden="true"><path d="M40 110 C240 90 280 250 400 250 C520 250 560 410 760 390"/><path d="M40 390 C240 410 280 250 400 250 C520 250 560 90 760 110"/></svg>';

  const controls = el('div', 'bhv2-warp-controls');
  const range = document.createElement('input');
  range.type = 'range';
  range.min = '0';
  range.max = '100';
  range.value = '48';
  range.setAttribute('aria-label', 'Accretion-disk viewing angle');
  const output = el('output', '', 'Slanted viewpoint');
  const presets = el('div', 'bhv2-control-row');
  const presetButtons = [];
  const presetValues = [10, 48, 88];
  ['Above', 'Slanted', 'Edge-on'].forEach((label, index) => {
    const control = button(label);
    control.addEventListener('click', () => {
      range.value = String(presetValues[index]);
      apply(presetValues[index]);
    });
    presets.append(control);
    presetButtons.push(control);
  });

  const pathToggle = button('Show photon paths', 'bhv2-primary');
  pathToggle.setAttribute('aria-pressed', 'false');
  pathToggle.addEventListener('click', () => {
    const active = visual.classList.toggle('show-paths');
    setToggle(pathToggle, active);
    pathToggle.textContent = active ? 'Hide photon paths' : 'Show photon paths';
  });

  const boundaryToggle = button('Compare shadow and horizon', 'bhv2-primary');
  boundaryToggle.setAttribute('aria-pressed', 'false');
  boundaryToggle.addEventListener('click', () => {
    const active = visual.classList.toggle('show-boundaries');
    setToggle(boundaryToggle, active);
    boundaryToggle.textContent = active ? 'Hide shadow/horizon guide' : 'Compare shadow and horizon';
  });

  const doppler = document.createElement('details');
  doppler.className = 'bhv2-lab-explainer';
  doppler.append(el('summary', '', 'Why can one side look brighter?'), el('p', '', 'Material moving toward the observer can appear brighter than material moving away. This effect is called Doppler beaming.'));

  function apply(value) {
    const numeric = Number(value);
    visual.style.setProperty('--angle', numeric + 'deg');
    visual.dataset.angle = numeric < 25 ? 'above' : numeric > 75 ? 'edge' : 'slanted';
    output.textContent = numeric < 25 ? 'Above viewpoint' : numeric > 75 ? 'Edge-on viewpoint' : 'Slanted viewpoint';
    const closest = presetValues.indexOf(numeric);
    presetButtons.forEach((control, index) => setToggle(control, index === closest));
  }

  range.addEventListener('input', (event) => apply(event.target.value));
  controls.append(range, output, presets, pathToggle, boundaryToggle, doppler);
  apply(48);
  module.append(visual, controls);
  return module;
}

export function createAnatomyInteractive(station) {
  const module = el('div', 'bhv2-anatomy');
  const diagram = el('div', 'bhv2-anatomy-diagram');
  diagram.innerHTML = '<i class="bhv2-layer emission"></i><i class="bhv2-layer shadow"></i><i class="bhv2-layer photon"></i><i class="bhv2-layer horizon"></i>';
  const controls = el('div', 'bhv2-anatomy-controls');
  const description = el('p', 'bhv2-anatomy-description');
  description.setAttribute('aria-live', 'polite');
  const buttons = [];

  function setLayer(index) {
    const layer = (station.layers || [])[index];
    if (!layer) return;
    diagram.dataset.layer = layer.id;
    setPressed(buttons, index);
    description.textContent = layer.text;
  }

  (station.layers || []).forEach((layer, index) => {
    const control = button(layer.title);
    control.setAttribute('aria-pressed', 'false');
    control.addEventListener('click', () => setLayer(index));
    controls.append(control);
    buttons.push(control);
  });

  module.append(diagram, controls, description);
  setLayer(0);
  return module;
}
