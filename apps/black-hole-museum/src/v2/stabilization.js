function setButtonState(button, active) {
  if (!button) return;
  button.classList.toggle('is-active', active);
  button.setAttribute('aria-pressed', String(active));
}

function stabilizeWarpedLight(root, cleanups) {
  const module = root.querySelector('.bhv2-warped-light');
  if (!module) return;

  const range = module.querySelector('input[type="range"]');
  const presetWrap = module.querySelector('.bhv2-control-row');
  const presetButtons = presetWrap ? [...presetWrap.querySelectorAll('button')] : [];
  const presetValues = [10, 48, 88];

  const syncPresets = () => {
    const value = Number(range?.value ?? 48);
    presetButtons.forEach((button, index) => setButtonState(button, value === presetValues[index]));
  };

  presetButtons.forEach((button) => {
    button.addEventListener('click', syncPresets);
    cleanups.push(() => button.removeEventListener('click', syncPresets));
  });
  if (range) {
    range.addEventListener('input', syncPresets);
    cleanups.push(() => range.removeEventListener('input', syncPresets));
  }
  syncPresets();

  const pathButton = [...module.querySelectorAll('button')].find((button) => /photon paths/i.test(button.textContent || ''));
  if (pathButton) {
    const syncPathLabel = () => {
      const active = pathButton.getAttribute('aria-pressed') === 'true';
      pathButton.textContent = active ? 'Hide photon paths' : 'Show photon paths';
      pathButton.classList.toggle('is-active', active);
    };
    pathButton.addEventListener('click', syncPathLabel);
    cleanups.push(() => pathButton.removeEventListener('click', syncPathLabel));
    syncPathLabel();
  }
}

function stabilizeAnatomy(root) {
  const module = root.querySelector('.bhv2-anatomy');
  if (!module) return;
  const description = module.querySelector('.bhv2-anatomy-description');
  if (description) description.setAttribute('aria-live', 'polite');
  const buttons = [...module.querySelectorAll('.bhv2-anatomy-controls button')];
  if (buttons.length && !buttons.some((button) => button.getAttribute('aria-pressed') === 'true')) {
    buttons[0].click();
  }
}

function stabilizeEarthNetwork(root, cleanups) {
  const module = root.querySelector('.bhv2-earth-network');
  const earth = module?.querySelector('.bhv2-earth');
  const completeButton = module?.querySelector(':scope > .bhv2-primary');
  if (!module || !earth || !completeButton) return;

  const defaultLabel = completeButton.textContent || 'Show the complete network';
  const sync = () => {
    const complete = earth.dataset.networkState === 'complete';
    setButtonState(completeButton, complete);
    completeButton.textContent = complete ? 'Complete network shown' : defaultLabel;
  };

  const observer = new MutationObserver(sync);
  observer.observe(earth, { attributes: true, attributeFilter: ['data-network-state'] });
  cleanups.push(() => observer.disconnect());
  sync();
}

function stabilizeOrbit(root, cleanups) {
  const section = root.querySelector('[data-station="04"]');
  const sidecar = section?.querySelector('.bhv2-sidecar');
  const button = sidecar?.querySelector('.bhv2-primary');
  if (!sidecar || !button) return;

  const label = sidecar.querySelector('.bhv2-sidecar-label');
  if (label) label.textContent = 'Trace the orbit';

  if (!sidecar.querySelector('.bhv2-tool-instruction')) {
    const helper = document.createElement('p');
    helper.className = 'bhv2-tool-instruction';
    helper.textContent = 'Press the button to overlay a simplified orbit guide on the observation. Press it again to remove the guide.';
    sidecar.insertBefore(helper, button);
  }

  const defaultLabel = 'Trace the featured star';
  const sync = () => {
    const active = button.getAttribute('aria-pressed') === 'true';
    button.classList.toggle('is-active', active);
    button.textContent = active ? 'Hide traced orbit' : defaultLabel;
  };
  button.addEventListener('click', sync);
  cleanups.push(() => button.removeEventListener('click', sync));
  sync();
}

function stabilizeEvidence(root, cleanups) {
  const module = root.querySelector('.bhv2-evidence-model');
  const reveal = module?.querySelector(':scope > .bhv2-primary');
  if (!module || !reveal) return;

  const clues = [...module.querySelectorAll('.bhv2-clue')];
  const sync = () => {
    clues.forEach((clue) => {
      const open = clue.getAttribute('aria-expanded') === 'true';
      const copy = clue.querySelector('.bhv2-clue-copy');
      if (copy) copy.setAttribute('aria-hidden', String(!open));
    });

    const allOpen = clues.length > 0 && clues.every((clue) => clue.getAttribute('aria-expanded') === 'true');
    setButtonState(reveal, allOpen);
    reveal.textContent = allOpen ? 'All clues revealed' : 'Reveal all clues';
  };

  /* The exhibit is a discovery interaction. Always begin the enhanced page
     with clue details closed, regardless of authored button wording. */
  clues.forEach((clue) => {
    clue.classList.remove('is-open');
    clue.setAttribute('aria-expanded', 'false');
    clue.querySelector('.bhv2-clue-copy')?.setAttribute('aria-hidden', 'true');
    clue.addEventListener('click', sync);
    cleanups.push(() => clue.removeEventListener('click', sync));
  });

  reveal.addEventListener('click', sync);
  cleanups.push(() => reveal.removeEventListener('click', sync));
  sync();
}

export function stabilizeBlackHoleV2(root) {
  const cleanups = [];
  if (!root?.classList?.contains('bhv2-mounted')) return () => {};

  root.dataset.hrvStabilization = '0.2.0';
  stabilizeWarpedLight(root, cleanups);
  stabilizeAnatomy(root);
  stabilizeEarthNetwork(root, cleanups);
  stabilizeOrbit(root, cleanups);
  stabilizeEvidence(root, cleanups);

  return () => {
    cleanups.splice(0).forEach((cleanup) => {
      try { cleanup(); } catch {}
    });
  };
}
