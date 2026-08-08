const STRUCTURE_VERSION = 'story-clusters-2026.08.07.2';

const COMPOSITIONS = {
  '01': 'threshold-cluster',
  '02': 'interactive-pair',
  '03': 'evidence-cluster',
  '04': 'media-story-pair',
  '05': 'telescope-cluster',
  '06': 'three-stage-process',
  '07': 'comparison-pair',
  '08': 'interactive-gallery',
  '09': 'myth-grid',
  '10': 'knowledge-split'
};

function el(tag, className = '', text = '') {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function take(plaque, selector) {
  const node = plaque?.querySelector(selector);
  if (node) node.remove();
  return node;
}

function composeHero(shell) {
  const header = shell.querySelector('.bhm-museum-header');
  if (!header || header.dataset.storyComposed === 'true') return;

  const copy = el('div', 'bhm-hero-copy');
  [...header.children].forEach(node => copy.append(node));

  const visual = el('div', 'bhm-hero-visual');
  visual.setAttribute('aria-hidden', 'true');
  visual.append(
    el('i', 'bhm-hero-orbit bhm-hero-orbit-a'),
    el('i', 'bhm-hero-orbit bhm-hero-orbit-b'),
    el('i', 'bhm-hero-shadow'),
    el('i', 'bhm-hero-ring')
  );

  header.append(copy, visual);
  header.dataset.storyComposed = 'true';
}

function buildSectionIntro(chamber) {
  const plaque = chamber.querySelector('.bhm-plaque');
  if (!plaque) return null;

  const number = chamber.dataset.station || '';
  chamber.dataset.composition = COMPOSITIONS[number] || 'generic';
  chamber.dataset.sceneStructure = STRUCTURE_VERSION;

  const intro = el('header', 'bhm-section-intro');
  const titleGroup = el('div', 'bhm-section-title');
  const summary = el('div', 'bhm-section-summary');
  const actions = el('div', 'bhm-section-actions');

  const meta = take(plaque, '.bhm-plaque-head');
  const title = take(plaque, 'h2');
  const badge = take(plaque, '.bhm-evidence-badge');
  const child = take(plaque, '.bhm-child-line');
  const deeper = take(plaque, '.bhm-look-deeper');

  if (meta) titleGroup.append(meta);
  if (title) titleGroup.append(title);
  if (badge) summary.append(badge);
  if (child) summary.append(child);
  if (deeper) summary.append(deeper);

  [...plaque.children].forEach(node => actions.append(node));

  intro.append(titleGroup, summary);
  if (actions.childElementCount) intro.append(actions);
  plaque.remove();
  chamber.prepend(intro);

  return { intro, titleGroup, summary, actions, deeper };
}

function consumeActions(structure, target) {
  if (!structure?.actions || !target) return;
  [...structure.actions.children].forEach(node => target.append(node));
  structure.actions.remove();
}

function composeThreshold(chamber, structure) {
  const architecture = chamber.querySelector('.bhm-threshold-architecture');
  if (!architecture || !structure) return;

  architecture.classList.add('bhm-story-exhibit', 'bhm-threshold-cluster');
  const story = el('div', 'bhm-threshold-story');
  const entry = el('div', 'bhm-threshold-entry');

  const warning = structure.actions.querySelector('.bhm-prototype-warning');
  const recap = structure.actions.querySelector('.bhm-recap');
  const enter = structure.actions.querySelector('.bhm-primary');

  if (warning) story.append(warning);
  if (recap) {
    recap.classList.add('bhm-recap-grid');
    recap.querySelectorAll(':scope > p').forEach((paragraph, index) => {
      paragraph.classList.add('bhm-recap-card');
      paragraph.dataset.recapIndex = String(index + 1);
    });
    story.append(recap);
  }
  if (enter) entry.append(enter);

  if (story.childElementCount) architecture.append(story);
  if (entry.childElementCount) architecture.append(entry);
  structure.actions.remove();
}

function composeLensing(chamber, structure) {
  const layout = chamber.querySelector('.bhm-stage-grid');
  const stage = chamber.querySelector('.bhm-lensing-stage');
  if (!layout || !stage) return;

  layout.classList.add('bhm-story-exhibit', 'bhm-interactive-pair');
  stage.classList.add('bhm-primary-module');

  const rail = el('aside', 'bhm-interaction-rail');
  rail.append(el('p', 'bhm-rail-label', 'Try the model'));
  consumeActions(structure, rail);
  layout.append(rail);
}

function composeEvidence(chamber, structure) {
  const layout = chamber.querySelector('.bhm-evidence-layout');
  const network = chamber.querySelector('.bhm-evidence-network');
  const reference = layout?.querySelector(':scope > .bhm-media-card');
  if (!layout || !network) return;

  layout.classList.add('bhm-story-exhibit', 'bhm-evidence-cluster');
  network.classList.add('bhm-primary-module');
  if (reference) reference.classList.add('bhm-support-module');

  const clueGrid = el('div', 'bhm-clue-grid');
  const reveal = structure.actions.querySelector('.bhm-primary');
  if (reveal) clueGrid.append(reveal);

  [...network.querySelectorAll('.bhm-clue')].forEach(card => clueGrid.append(card));
  if (reference) layout.insertBefore(clueGrid, reference);
  else layout.append(clueGrid);
  structure.actions.remove();
}

function composeOrbit(chamber, structure) {
  const layout = chamber.querySelector('.bhm-theater-layout');
  const stage = chamber.querySelector('.bhm-orbit-stage');
  if (!layout || !stage) return;

  layout.classList.add('bhm-story-exhibit', 'bhm-media-story-pair');
  stage.classList.add('bhm-primary-module');

  const sidecar = el('aside', 'bhm-media-sidecar');
  sidecar.append(el('p', 'bhm-rail-label', 'Observation tool'));
  if (structure.deeper) sidecar.append(structure.deeper);
  consumeActions(structure, sidecar);
  layout.append(sidecar);
}

function composeNetwork(chamber, structure) {
  const layout = chamber.querySelector('.bhm-network-layout');
  const earth = chamber.querySelector('.bhm-earth-stage');
  const map = layout?.querySelector(':scope > .bhm-media-card');
  if (!layout || !earth) return;

  layout.classList.add('bhm-story-exhibit', 'bhm-telescope-cluster');
  earth.classList.add('bhm-primary-module');
  if (map) map.classList.add('bhm-support-module');

  const stack = el('aside', 'bhm-observatory-stack');
  stack.append(el('p', 'bhm-rail-label', 'One telescope, many sites'));
  const siteList = el('div', 'bhm-observatory-chips');
  chamber.querySelectorAll('.bhm-site').forEach(site => {
    siteList.append(el('span', 'bhm-observatory-chip', site.textContent.trim()));
  });
  stack.append(siteList);
  consumeActions(structure, stack);
  layout.append(stack);
}

function composeReconstruction(chamber, structure) {
  const layout = chamber.querySelector('.bhm-reconstruction-layout');
  const viewer = chamber.querySelector('.bhm-reconstruction-viewer');
  const visual = chamber.querySelector('.bhm-reconstruction-visual');
  const controls = viewer?.querySelector('.bhm-state-controls');
  const reference = layout?.querySelector(':scope > .bhm-media-card');
  if (!layout || !viewer || !visual || !controls) return;

  layout.classList.add('bhm-story-exhibit', 'bhm-three-stage-process');
  viewer.classList.add('bhm-primary-module');
  if (reference) reference.classList.add('bhm-support-module');

  const descriptions = [
    'Timed radio measurements arrive from observatories around Earth.',
    'Different image structures are tested against the measurements.',
    'Compatible reconstructions are evaluated into the published result.'
  ];
  const process = el('div', 'bhm-process-row');
  [...controls.querySelectorAll('button')].forEach((button, index) => {
    const card = el('article', 'bhm-process-card');
    card.dataset.step = String(index + 1).padStart(2, '0');
    card.append(button, el('p', '', descriptions[index] || 'Inspect this reconstruction stage.'));
    process.append(card);
  });
  controls.remove();
  layout.prepend(process);

  const toolRail = el('div', 'bhm-process-tools');
  if (structure.deeper) toolRail.append(structure.deeper);
  consumeActions(structure, toolRail);
  if (toolRail.childElementCount) layout.append(toolRail);
}

function composeRotunda(chamber, structure) {
  const stage = chamber.querySelector('.bhm-rotunda-stage');
  const bench = chamber.querySelector('.bhm-quiet-bench');
  if (!stage) return;

  stage.classList.add('bhm-story-exhibit', 'bhm-comparison-pair');
  stage.querySelectorAll('.bhm-media-card').forEach(card => card.classList.add('bhm-primary-module'));

  const tools = el('div', 'bhm-comparison-tools');
  consumeActions(structure, tools);
  if (tools.childElementCount) stage.after(tools);
  if (bench) bench.classList.add('bhm-comparison-note');
}

function composeLaboratory(chamber, structure) {
  const layout = chamber.querySelector('.bhm-lab-layout');
  const stage = chamber.querySelector('.bhm-accretion-stage');
  const media = chamber.querySelector('.bhm-lab-media');
  if (!layout || !stage || !media) return;

  layout.classList.add('bhm-story-exhibit', 'bhm-interactive-gallery');
  stage.classList.add('bhm-primary-module');

  const cards = [...media.querySelectorAll(':scope > .bhm-media-card')];
  const companion = cards.shift();
  if (companion) {
    companion.classList.add('bhm-lab-companion', 'bhm-support-module');
    layout.insertBefore(companion, media);
  }
  media.classList.add('bhm-support-gallery');
  cards.forEach(card => card.classList.add('bhm-support-module'));

  const rail = el('aside', 'bhm-lab-story');
  if (structure.deeper) rail.append(structure.deeper);
  consumeActions(structure, rail);
  if (rail.childElementCount) layout.insertBefore(rail, media);
}

function composeAnatomy(chamber, structure) {
  const layout = chamber.querySelector('.bhm-anatomy-layout');
  const viewer = chamber.querySelector('.bhm-anatomy-viewer');
  const myths = chamber.querySelector('.bhm-myth-wall');
  if (!layout || !viewer || !myths) return;

  layout.classList.add('bhm-story-exhibit', 'bhm-myth-grid-layout');
  viewer.classList.add('bhm-primary-module');
  myths.classList.add('bhm-myth-grid');
  consumeActions(structure, myths);
}

function composeBoundary(chamber, structure) {
  const stage = chamber.querySelector('.bhm-boundary-stage');
  const pullback = chamber.querySelector('.bhm-pullback');
  const closing = chamber.querySelector('.bhm-closing-line');
  if (!stage) return;

  stage.classList.add('bhm-story-exhibit', 'bhm-knowledge-split');
  if (pullback) pullback.classList.add('bhm-evidence-pullback');
  if (closing) closing.classList.add('bhm-final-statement');

  const tools = el('div', 'bhm-boundary-tools');
  if (structure.deeper) tools.append(structure.deeper);
  consumeActions(structure, tools);
  if (tools.childElementCount) stage.append(tools);
}

function composeStation(chamber) {
  const structure = buildSectionIntro(chamber);
  if (!structure) return;

  switch (chamber.dataset.station) {
    case '01': composeThreshold(chamber, structure); break;
    case '02': composeLensing(chamber, structure); break;
    case '03': composeEvidence(chamber, structure); break;
    case '04': composeOrbit(chamber, structure); break;
    case '05': composeNetwork(chamber, structure); break;
    case '06': composeReconstruction(chamber, structure); break;
    case '07': composeRotunda(chamber, structure); break;
    case '08': composeLaboratory(chamber, structure); break;
    case '09': composeAnatomy(chamber, structure); break;
    case '10': composeBoundary(chamber, structure); break;
    default: break;
  }
}

function composeMediaCenter(shell) {
  const center = shell.querySelector('.bhm-media-center');
  if (!center) return;
  center.dataset.sceneStructure = STRUCTURE_VERSION;
  center.classList.add('bhm-story-media-center');
}

function composeCredits(shell) {
  const credits = shell.querySelector('.bhm-credits');
  if (!credits) return;
  credits.dataset.sceneStructure = STRUCTURE_VERSION;
  credits.classList.add('bhm-story-credits');
}

export function recomposeBlackHoleMuseum(mount) {
  const shell = mount?.querySelector('.bhm-museum');
  if (!shell || shell.dataset.structure === STRUCTURE_VERSION) return;

  shell.dataset.structure = STRUCTURE_VERSION;
  composeHero(shell);
  shell.querySelectorAll('.bhm-chamber').forEach(composeStation);
  composeMediaCenter(shell);
  composeCredits(shell);
}

export { STRUCTURE_VERSION };