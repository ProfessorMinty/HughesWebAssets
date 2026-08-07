const STRUCTURE_VERSION = 'structured-exhibit-2026.08.07.1';

const REVERSE_HEADER_STATIONS = new Set(['04', '06', '09']);

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

function buildSceneHeader(chamber) {
  const plaque = chamber.querySelector('.bhm-plaque');
  if (!plaque) return null;

  const number = chamber.dataset.station || '';
  const header = el('header', 'bhm-scene-header');
  if (REVERSE_HEADER_STATIONS.has(number)) header.classList.add('is-reversed');

  const titleGroup = el('div', 'bhm-scene-title-group');
  const meta = take(plaque, '.bhm-plaque-head');
  const title = take(plaque, 'h2');
  if (meta) titleGroup.append(meta);
  if (title) titleGroup.append(title);

  const summary = el('div', 'bhm-scene-summary');
  const badge = take(plaque, '.bhm-evidence-badge');
  const child = take(plaque, '.bhm-child-line');
  const deeper = take(plaque, '.bhm-look-deeper');
  if (badge) summary.append(badge);
  if (child) summary.append(child);
  if (deeper) summary.append(deeper);

  const remaining = [...plaque.children];
  const actions = el('div', 'bhm-scene-actions');
  remaining.forEach(node => actions.append(node));

  header.append(titleGroup, summary);
  if (actions.childElementCount) header.append(actions);

  plaque.remove();
  chamber.prepend(header);
  chamber.dataset.sceneStructure = STRUCTURE_VERSION;
  return { header, actions };
}

function markExhibit(chamber, selector) {
  const node = chamber.querySelector(selector);
  if (!node) return null;
  node.classList.add('bhm-scene-exhibit');
  return node;
}

function composeThreshold(chamber, structure) {
  const architecture = chamber.querySelector('.bhm-threshold-architecture');
  if (!architecture || !structure) return;

  architecture.classList.add('bhm-scene-exhibit', 'bhm-threshold-scene');

  const story = el('div', 'bhm-threshold-story');
  const entry = el('div', 'bhm-threshold-entry');
  const warning = structure.actions.querySelector('.bhm-prototype-warning');
  const recap = structure.actions.querySelector('.bhm-recap');
  const enter = structure.actions.querySelector('.bhm-primary');

  if (warning) story.append(warning);
  if (recap) story.append(recap);
  if (enter) entry.append(enter);

  if (story.childElementCount) architecture.append(story);
  if (entry.childElementCount) architecture.append(entry);
  structure.actions.remove();
}

function composeRotunda(chamber) {
  const stage = chamber.querySelector('.bhm-rotunda-stage');
  const bench = chamber.querySelector('.bhm-quiet-bench');
  if (!stage) return;

  const exhibit = el('div', 'bhm-scene-exhibit bhm-rotunda-exhibit');
  stage.before(exhibit);
  exhibit.append(stage);
  if (bench) exhibit.append(bench);
}

function composeBoundary(chamber) {
  const stage = chamber.querySelector('.bhm-boundary-stage');
  const pullback = chamber.querySelector('.bhm-pullback');
  const closing = chamber.querySelector('.bhm-closing-line');
  if (!stage) return;

  const exhibit = el('div', 'bhm-scene-exhibit bhm-boundary-exhibit');
  stage.before(exhibit);
  exhibit.append(stage);
  if (pullback) exhibit.append(pullback);
  if (closing) exhibit.append(closing);
}

function composeStation(chamber) {
  const structure = buildSceneHeader(chamber);
  if (!structure) return;

  switch (chamber.dataset.station) {
    case '01':
      composeThreshold(chamber, structure);
      break;
    case '02':
      markExhibit(chamber, '.bhm-stage-grid');
      break;
    case '03':
      markExhibit(chamber, '.bhm-evidence-layout');
      break;
    case '04':
      markExhibit(chamber, '.bhm-theater-layout');
      break;
    case '05':
      markExhibit(chamber, '.bhm-network-layout');
      break;
    case '06':
      markExhibit(chamber, '.bhm-reconstruction-layout');
      break;
    case '07':
      composeRotunda(chamber);
      break;
    case '08':
      markExhibit(chamber, '.bhm-lab-layout');
      break;
    case '09':
      markExhibit(chamber, '.bhm-anatomy-layout');
      break;
    case '10':
      composeBoundary(chamber);
      break;
    default:
      break;
  }
}

function composeMediaCenter(shell) {
  const center = shell.querySelector('.bhm-media-center');
  if (!center) return;
  center.dataset.sceneStructure = STRUCTURE_VERSION;
  center.classList.add('bhm-structured-media-center');
}

function composeCredits(shell) {
  const credits = shell.querySelector('.bhm-credits');
  if (!credits) return;
  credits.dataset.sceneStructure = STRUCTURE_VERSION;
  credits.classList.add('bhm-structured-credits');
}

export function recomposeBlackHoleMuseum(mount) {
  const shell = mount?.querySelector('.bhm-museum');
  if (!shell || shell.dataset.structure === STRUCTURE_VERSION) return;

  shell.dataset.structure = STRUCTURE_VERSION;
  shell.querySelectorAll('.bhm-chamber').forEach(composeStation);
  composeMediaCenter(shell);
  composeCredits(shell);
}

export { STRUCTURE_VERSION };
