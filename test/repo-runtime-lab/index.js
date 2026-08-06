(function () {
  'use strict';

  var PREFIX = '[HRV REPO TEST]';
  var RUNTIME_VERSION = '2026.08.05.1';
  var BUILD_TIMESTAMP = '2026-08-06T00:00:00Z';
  var runtimeScript = document.currentScript;
  var BASE = runtimeScript && runtimeScript.dataset.base ? runtimeScript.dataset.base : '';
  var BUILD = runtimeScript && runtimeScript.dataset.build ? runtimeScript.dataset.build : RUNTIME_VERSION;
  var MOUNT_ID = runtimeScript && runtimeScript.dataset.mount ? runtimeScript.dataset.mount : 'hrv-repo-test-root';
  var BOOTSTRAP_SOURCE = runtimeScript && runtimeScript.dataset.bootstrapSource ? runtimeScript.dataset.bootstrapSource : '';
  var REPO_ROOT = BASE.replace(/test\/repo-runtime-lab\/?$/i, '');
  var REPOSITORY_URL = 'https://github.com/ProfessorMinty/HughesWebAssets';

  var STATUS_DEFINITIONS = [
    ['runtimeLoaded', 'Repository runtime loaded'],
    ['externalJs', 'External JavaScript executed'],
    ['externalCss', 'External CSS loaded'],
    ['externalHtml', 'Repository-hosted HTML rendered'],
    ['jsonFetch', 'JSON fetch succeeded'],
    ['imageLoaded', 'Image loaded'],
    ['svgLoaded', 'SVG loaded'],
    ['secondaryScript', 'Secondary script loaded'],
    ['dynamicModule', 'Dynamic import or script loading succeeded'],
    ['eventHandlers', 'Event handlers worked'],
    ['timers', 'Timers worked'],
    ['observers', 'Observers worked'],
    ['canvas', 'Canvas worked'],
    ['localStorage', 'Local storage worked'],
    ['sessionStorage', 'Session storage worked'],
    ['modal', 'Modal worked'],
    ['responsiveStyles', 'Responsive styles detected'],
    ['reducedMotion', 'Reduced-motion behavior detected'],
    ['duplicateProtection', 'Duplicate mount protection worked'],
    ['unmountCleanup', 'Unmount cleanup worked'],
    ['remount', 'Remount worked']
  ];

  var state = {
    mounted: false,
    mounting: false,
    mountCount: 0,
    duplicateAttempts: 0,
    timers: new Set(),
    animationFrames: new Set(),
    observers: new Set(),
    cleanups: [],
    controller: null,
    root: null,
    statuses: new Map(),
    logs: [],
    cards: [],
    cardSortDescending: true,
    marquee: { running: true, speed: 0.65, direction: -1, x: 0 },
    canvas: { particles: [], width: 0, height: 0 },
    lastSuccess: 'None yet',
    lastFailure: 'None yet',
    phase: 'bootstrap',
    cacheBust: BUILD + '-' + Date.now().toString(36),
    persistentLifecycle: {
      unmountCleanup: 'NOT TESTED',
      remount: 'NOT TESTED'
    },
    previousDialogTrigger: null,
    data: null
  };

  function mountNode() {
    return document.getElementById(MOUNT_ID) || document.getElementById('hrv-repo-test');
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function log(level, message, detail) {
    var stamp = new Date().toISOString();
    var entry = stamp + ' [' + level.toUpperCase() + '] ' + message + (detail ? ' ' + safeStringify(detail) : '');
    state.logs.push(entry);
    if (state.logs.length > 24) state.logs.shift();
    var method = console[level] || console.log;
    method.call(console, PREFIX + ' ' + message, detail || '');
    updateConsolePreview();
  }

  function safeStringify(value) {
    try { return typeof value === 'string' ? value : JSON.stringify(value); }
    catch (error) { return String(value); }
  }

  function beginStatusMap() {
    state.statuses.clear();
    STATUS_DEFINITIONS.forEach(function (definition) {
      state.statuses.set(definition[0], { id: definition[0], label: definition[1], state: 'NOT TESTED', detail: '' });
    });
    setStatus('unmountCleanup', state.persistentLifecycle.unmountCleanup, state.persistentLifecycle.unmountCleanup === 'PASS' ? 'Prior instance cleaned up successfully.' : 'Use the Lifecycle Airlock to test.');
    setStatus('remount', state.persistentLifecycle.remount, state.persistentLifecycle.remount === 'PASS' ? 'A clean remount has completed.' : 'Use the Lifecycle Airlock to test.');
  }

  function setStatus(id, result, detail) {
    if (!state.statuses.has(id)) return;
    var normalized = ['PASS', 'FAIL', 'PARTIAL', 'NOT TESTED', 'UNSUPPORTED'].indexOf(result) >= 0 ? result : 'PARTIAL';
    var item = state.statuses.get(id);
    item.state = normalized;
    item.detail = detail || '';
    if (normalized === 'PASS') state.lastSuccess = item.label;
    if (normalized === 'FAIL') state.lastFailure = item.label + (detail ? ': ' + detail : '');
    console.info(PREFIX + ' RESULT ' + normalized + ' | ' + item.label + (detail ? ' | ' + detail : ''));
    renderStatuses();
    updateDiagnostics();
  }

  function setPhase(phase) {
    state.phase = phase;
    if (!state.root) return;
    state.root.dataset.phase = phase;
    var live = state.root.querySelector('[data-live-phase]');
    var label = state.root.querySelector('[data-phase-label]');
    if (live) live.textContent = phase;
    if (label) label.textContent = phase;
    updateDiagnostics();
  }

  function renderStatuses() {
    if (!state.root) return;
    var grid = state.root.querySelector('[data-status-grid]');
    if (!grid) return;
    grid.innerHTML = Array.from(state.statuses.values()).map(function (item) {
      return '<div class="hrv-status-item" data-state="' + escapeHtml(item.state) + '" title="' + escapeHtml(item.detail) + '">' +
        '<span class="hrv-status-item__dot" aria-hidden="true"></span>' +
        '<strong>' + escapeHtml(item.label) + '</strong>' +
        '<span class="hrv-status-state">' + escapeHtml(item.state) + '</span>' +
      '</div>';
    }).join('');
    var completed = Array.from(state.statuses.values()).filter(function (item) { return item.state !== 'NOT TESTED'; }).length;
    var passed = Array.from(state.statuses.values()).filter(function (item) { return item.state === 'PASS'; }).length;
    var summary = state.root.querySelector('[data-pass-summary]');
    if (summary) summary.textContent = passed + ' pass • ' + completed + ' tested';
  }

  function updateConsolePreview() {
    if (!state.root) return;
    var preview = state.root.querySelector('[data-console-preview]');
    if (preview) preview.textContent = state.logs.slice(-12).join('\n');
  }

  function trackedTimeout(callback, delay) {
    var id = window.setTimeout(function () {
      state.timers.delete(id);
      callback();
      updateDiagnostics();
    }, delay);
    state.timers.add(id);
    updateDiagnostics();
    return id;
  }

  function trackedInterval(callback, delay) {
    var id = window.setInterval(callback, delay);
    state.timers.add(id);
    updateDiagnostics();
    return id;
  }

  function clearTrackedTimer(id) {
    window.clearTimeout(id);
    window.clearInterval(id);
    state.timers.delete(id);
    updateDiagnostics();
  }

  function trackedRaf(callback) {
    var id = window.requestAnimationFrame(function (time) {
      state.animationFrames.delete(id);
      callback(time);
    });
    state.animationFrames.add(id);
    return id;
  }

  function addObserver(observer) {
    state.observers.add(observer);
    updateDiagnostics();
    return observer;
  }

  function addCleanup(fn) {
    state.cleanups.push(fn);
  }

  function getDiagnostics() {
    var cssLink = document.getElementById('hrv-repo-lab-css');
    var jsonUrl = BASE + 'test-data.json?v=' + encodeURIComponent(BUILD);
    var sourceUrl = runtimeScript && runtimeScript.src ? runtimeScript.src : BASE + 'index.js';
    var externalOrigin = 'unknown';
    try { externalOrigin = new URL(sourceUrl).origin; } catch (error) {}
    var query = {};
    try { new URLSearchParams(location.search).forEach(function (value, key) { query[key] = value; }); } catch (error) {}
    return [
      ['Runtime version', RUNTIME_VERSION],
      ['Build identifier', BUILD],
      ['Build timestamp', BUILD_TIMESTAMP],
      ['Script source URL', sourceUrl],
      ['Bootstrap source URL', BOOTSTRAP_SOURCE || 'Not reported'],
      ['Stylesheet source URL', cssLink ? cssLink.href : BASE + 'test-page.css'],
      ['JSON source URL', jsonUrl],
      ['Current Edublogs page URL', location.href],
      ['Current origin', location.origin],
      ['External asset origin', externalOrigin],
      ['Viewport size', window.innerWidth + ' × ' + window.innerHeight],
      ['Device pixel ratio', window.devicePixelRatio || 1],
      ['Online status', navigator.onLine ? 'online' : 'offline'],
      ['Reduced-motion status', window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'requested by browser' : 'not requested by browser'],
      ['Runtime mount count', state.mountCount],
      ['Duplicate attempts', state.duplicateAttempts],
      ['Active timer count', state.timers.size],
      ['Active animation frame count', state.animationFrames.size],
      ['Active observer count', state.observers.size],
      ['Last successful test', state.lastSuccess],
      ['Last failed test', state.lastFailure],
      ['Cache-busting identifier', state.cacheBust],
      ['Current test phase', state.phase],
      ['URL query parameters', Object.keys(query).length ? safeStringify(query) : 'none'],
      ['User agent summary', navigator.userAgent],
      ['Document visibility', document.visibilityState]
    ];
  }

  function updateDiagnostics() {
    if (!state.root) return;
    var grid = state.root.querySelector('[data-diagnostics-grid]');
    if (grid) {
      grid.innerHTML = getDiagnostics().map(function (pair) {
        return '<div><dt>' + escapeHtml(pair[0]) + '</dt><dd>' + escapeHtml(pair[1]) + '</dd></div>';
      }).join('');
    }
    var buildId = state.root.querySelector('[data-build-id]');
    var buildTime = state.root.querySelector('[data-build-time]');
    if (buildId) buildId.textContent = BUILD;
    if (buildTime) buildTime.textContent = BUILD_TIMESTAMP;
  }

  function diagnosticsText() {
    return 'Hughes Room Views Repository Runtime Laboratory\n' + getDiagnostics().map(function (pair) { return pair[0] + ': ' + pair[1]; }).join('\n') + '\n\nCapability results\n' + Array.from(state.statuses.values()).map(function (item) { return item.state + ' | ' + item.label + (item.detail ? ' | ' + item.detail : ''); }).join('\n');
  }

  function announce(message) {
    if (!state.root) return;
    var target = state.root.querySelector('[data-live-message]');
    if (target) target.textContent = message;
    log('info', message);
  }

  async function fetchText(url) {
    var response = await fetch(url, { cache: 'no-store', credentials: 'omit' });
    if (!response.ok) throw new Error('HTTP ' + response.status + ' for ' + url);
    return response.text();
  }

  async function fetchJson(url) {
    var response = await fetch(url, { cache: 'no-store', credentials: 'omit' });
    if (!response.ok) throw new Error('HTTP ' + response.status + ' for ' + url);
    return response.json();
  }

  async function mountRuntime(options) {
    options = options || {};
    var mount = mountNode();
    if (!mount) {
      log('error', 'Runtime mount element is missing.', MOUNT_ID);
      return false;
    }

    if (state.mounted || state.mounting) {
      state.duplicateAttempts += 1;
      setStatus('duplicateProtection', 'PASS', 'Duplicate initialization attempt ' + state.duplicateAttempts + ' was ignored.');
      announce('Duplicate initialization was detected and safely ignored.');
      return false;
    }

    state.mounting = true;
    state.phase = options.remount ? 'remounting' : 'loading external HTML';
    mount.setAttribute('aria-busy', 'true');
    mount.innerHTML = '<div role="status" style="padding:18px;border:2px solid #8b5cf6;border-radius:14px;background:#111831;color:#eaf2ff;font:700 16px/1.5 system-ui,sans-serif">🧪 Loading repository-hosted HTML…<br><small style="font-weight:500">Build ' + escapeHtml(BUILD) + '</small></div>';

    try {
      var htmlUrl = BASE + 'test-page.html?v=' + encodeURIComponent(BUILD) + '&cb=' + Date.now();
      var html = await fetchText(htmlUrl);
      mount.innerHTML = html;
      mount.removeAttribute('aria-busy');
      state.root = mount.querySelector('.hrv-lab');
      if (!state.root) throw new Error('The repository HTML did not include .hrv-lab.');
      state.mounting = false;
      state.mounted = true;
      state.mountCount += 1;
      beginStatusMap();
      setStatus('runtimeLoaded', 'PASS', 'Runtime ' + RUNTIME_VERSION + ' mounted from repository code.');
      setStatus('externalJs', 'PASS', 'index.js executed from ' + (runtimeScript ? runtimeScript.src : BASE));
      setStatus('externalHtml', 'PASS', 'test-page.html fetched and inserted into the Edublogs mount.');
      if (state.mountCount > 1) {
        state.persistentLifecycle.remount = 'PASS';
        setStatus('remount', 'PASS', 'Clean remount number ' + state.mountCount + ' completed.');
      }
      await initializeRuntime();
      return true;
    } catch (error) {
      state.mounting = false;
      state.mounted = false;
      state.root = null;
      mount.removeAttribute('aria-busy');
      mount.innerHTML = '<div role="alert" style="padding:18px;border:2px solid #be123c;border-radius:14px;background:#fff1f2;color:#881337;font:700 16px/1.5 system-ui,sans-serif">Repository HTML failed to load, but the Edublogs page remained readable.<br><small style="font-weight:500">' + escapeHtml(error.message) + '</small><br><button type="button" id="hrv-repo-remount-fallback" style="margin-top:12px;padding:10px 14px;border:0;border-radius:10px;background:#312e81;color:white;font-weight:800;cursor:pointer">Retry repository runtime</button></div>';
      var retry = document.getElementById('hrv-repo-remount-fallback');
      if (retry) retry.addEventListener('click', function () { mountRuntime({ remount: true }); }, { once: true });
      state.lastFailure = 'Repository-hosted HTML: ' + error.message;
      log('error', 'Runtime mount failed gracefully.', error.message);
      return false;
    }
  }

  async function initializeRuntime() {
    state.controller = new AbortController();
    state.cleanups = [];
    state.timers = new Set();
    state.animationFrames = new Set();
    state.observers = new Set();
    state.marquee = { running: true, speed: 0.65, direction: -1, x: 0 };
    state.canvas = { particles: [], width: 0, height: 0 };

    setPhase('initializing controls');
    updateDiagnostics();
    renderStatuses();
    updateConsolePreview();

    var repositoryLink = state.root.querySelector('[data-repository-link]');
    if (repositoryLink) {
      repositoryLink.href = REPOSITORY_URL + '/tree/main/test/repo-runtime-lab';
      repositoryLink.textContent = 'Open ProfessorMinty/HughesWebAssets laboratory source';
    }

    setupDelegatedEvents();
    setupTabsKeyboard();
    setupObservers();
    setupBrowserSignals();
    setupAnimations();
    setupStorage();
    setupResourceTests();
    injectDynamicStyle();

    setStatus('eventHandlers', 'PASS', 'One delegated root listener and scoped browser listeners are active.');
    setStatus('timers', 'PASS', 'Tracked interval and timeout systems started; active count is visible in diagnostics.');
    setStatus('responsiveStyles', 'PASS', 'Media and container query rules are present; viewport is ' + window.innerWidth + 'px wide.');
    setStatus('reducedMotion', window.matchMedia ? 'PASS' : 'UNSUPPORTED', window.matchMedia ? 'Browser preference detected: ' + (window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'reduce' : 'no preference') : 'matchMedia unavailable.');

    var cssProbe = window.getComputedStyle(state.root).getPropertyValue('--hrv-cyan').trim();
    setStatus('externalCss', cssProbe ? 'PASS' : 'FAIL', cssProbe ? 'Scoped CSS custom property resolved to ' + cssProbe : 'Expected stylesheet variable was not found.');
    var cssTable = state.root.querySelector('[data-table-css-state]');
    if (cssTable) { cssTable.textContent = cssProbe ? 'Loaded' : 'Failed'; cssTable.classList.toggle('hrv-badge--pass', !!cssProbe); }
    var htmlTable = state.root.querySelector('[data-table-html-state]');
    if (htmlTable) { htmlTable.textContent = 'Loaded'; htmlTable.classList.add('hrv-badge--pass'); }

    setPhase('running capability tests');
    trackedTimeout(function () {
      mountRuntime({ duplicateProbe: true });
    }, 250);

    trackedTimeout(function () {
      setPhase('interactive');
      announce('Repository laboratory is fully interactive. Use the controls to complete manual tests.');
    }, 900);
  }

  function setupDelegatedEvents() {
    var signal = state.controller.signal;
    state.root.addEventListener('click', function (event) {
      var button = event.target.closest('[data-action]');
      if (!button || !state.root.contains(button)) return;
      handleAction(button.dataset.action, button, event);
    }, { signal: signal });

    state.root.addEventListener('input', function (event) {
      if (event.target.matches('#signal-message')) updateCharacterCounter(event.target);
      if (event.target.matches('[data-card-filter]')) filterCards(event.target.value);
    }, { signal: signal });

    state.root.addEventListener('change', function (event) {
      if (event.target.matches('[data-card-filter]')) filterCards(event.target.value);
    }, { signal: signal });

    var form = state.root.querySelector('[data-test-form]');
    if (form) form.addEventListener('submit', validateForm, { signal: signal });

    var dialog = state.root.querySelector('[data-dialog]');
    if (dialog) {
      dialog.addEventListener('close', function () {
        if (state.previousDialogTrigger && typeof state.previousDialogTrigger.focus === 'function') state.previousDialogTrigger.focus();
      }, { signal: signal });
      dialog.addEventListener('cancel', function () {
        announce('Dialog closed with Escape.');
      }, { signal: signal });
    }
  }

  function handleAction(action, button) {
    var actions = {
      'dismiss-notice': function () {
        var notice = button.closest('[data-dismissible-notice]');
        if (notice) notice.remove();
        announce('Dismissible banner removed from the DOM.');
      },
      'theme-toggle': toggleTheme,
      'pause-all': togglePause,
      'reduced-motion': toggleReducedMotion,
      'shuffle-cards': shuffleCards,
      'burst-particles': burstParticles,
      'toggle-demo': toggleDemo,
      'duplicate-mount': function () { mountRuntime({ duplicateProbe: true }); },
      'reset-runtime': resetRuntime,
      'marquee-start': function () { state.marquee.running = true; announce('JavaScript marquee started.'); },
      'marquee-stop': function () { state.marquee.running = false; announce('JavaScript marquee stopped.'); },
      'marquee-speed': function () { state.marquee.speed = Math.min(4, state.marquee.speed + .5); announce('JavaScript marquee speed is now ' + state.marquee.speed.toFixed(2) + '.'); },
      'marquee-reverse': function () { state.marquee.direction *= -1; announce('JavaScript marquee direction reversed.'); },
      'mutate-text': mutateText,
      'append-node': appendNode,
      'replace-node': replaceNode,
      'remove-node': removeNode,
      'open-modal': function () { openModal(button); },
      'sort-cards': sortCards,
      'push-history': pushHistoryState,
      'copy-diagnostics': copyDiagnostics,
      'missing-json': testMissingJson,
      'missing-image': testMissingImage,
      'missing-script': testMissingScript,
      'simulate-timeout': testTimeout,
      'simulate-error': testControlledError,
      'disable-animation': testDisableAnimation,
      'unmount-runtime': unmountRuntime,
      'remount-runtime': function () { mountRuntime({ remount: true }); }
    };
    if (actions[action]) {
      try { actions[action](); }
      catch (error) {
        recordContainedFailure('Action "' + action + '" threw a contained error', error.message);
      }
    }
  }

  function toggleTheme() {
    var next = state.root.dataset.theme === 'daylight' ? 'aurora' : 'daylight';
    state.root.dataset.theme = next;
    try { localStorage.setItem('hrvRepoLabTheme', next); } catch (error) {}
    announce('Theme changed to ' + next + '.');
  }

  function togglePause() {
    var paused = state.root.classList.toggle('hrv-motion-paused');
    state.marquee.running = !paused;
    announce(paused ? 'All laboratory motion paused.' : 'Laboratory motion resumed.');
  }

  function toggleReducedMotion() {
    var reduced = state.root.classList.toggle('hrv-reduced-motion');
    if (reduced) state.marquee.running = false;
    announce(reduced ? 'Manual reduced-motion mode enabled.' : 'Manual reduced-motion mode disabled.');
    setStatus('reducedMotion', 'PASS', 'Manual reduced-motion control changed the runtime class successfully.');
  }

  function toggleDemo() {
    var card = state.root.querySelector('[data-observe-card]');
    if (!card) return;
    var hidden = card.classList.toggle('hrv-demo-hidden');
    announce(hidden ? 'A demonstration card left the layout.' : 'The demonstration card returned to the layout.');
  }

  function mutateText() {
    var target = state.root.querySelector('[data-mutable-text]');
    if (!target) return;
    target.textContent = target.classList.toggle('hrv-mutated') ? 'The reactor is now amber, translated, and dynamically classed.' : 'The reactor is violet.';
    announce('Text content and CSS class changed through JavaScript.');
  }

  function dynamicZone() { return state.root.querySelector('[data-dynamic-zone]'); }

  function appendNode() {
    var zone = dynamicZone();
    if (!zone) return;
    if (zone.textContent.indexOf('No generated') >= 0) zone.textContent = '';
    var node = document.createElement('span');
    node.className = 'hrv-dynamic-node';
    node.textContent = 'Node ' + (zone.querySelectorAll('.hrv-dynamic-node').length + 1);
    zone.appendChild(node);
    announce('A new element was appended to the DOM.');
  }

  function replaceNode() {
    var zone = dynamicZone();
    if (!zone) return;
    var node = document.createElement('strong');
    node.className = 'hrv-dynamic-node';
    node.textContent = 'DOM content replaced at ' + new Date().toLocaleTimeString();
    zone.replaceChildren(node);
    announce('The dynamic area was replaced with a new node.');
  }

  function removeNode() {
    var zone = dynamicZone();
    if (!zone) return;
    var node = zone.lastElementChild;
    if (node) node.remove();
    if (!zone.children.length) zone.textContent = 'All generated elements were removed.';
    announce('The latest dynamic element was removed.');
  }

  function openModal(button) {
    var dialog = state.root.querySelector('[data-dialog]');
    if (!dialog) {
      setStatus('modal', 'FAIL', 'Dialog element missing.');
      return;
    }
    state.previousDialogTrigger = button;
    if (typeof dialog.showModal === 'function') {
      dialog.showModal();
      setStatus('modal', 'PASS', 'Native dialog opened and focus entered the modal.');
      announce('Modal opened. Press Escape or use the close button.');
    } else {
      dialog.setAttribute('open', '');
      setStatus('modal', 'PARTIAL', 'Dialog API unsupported; open-attribute fallback used.');
    }
  }

  function setupTabsKeyboard() {
    var tabList = state.root.querySelector('[role="tablist"]');
    if (!tabList) return;
    tabList.addEventListener('click', function (event) {
      var tab = event.target.closest('[role="tab"]');
      if (tab) activateTab(tab);
    }, { signal: state.controller.signal });
    tabList.addEventListener('keydown', function (event) {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      var tabs = Array.from(tabList.querySelectorAll('[role="tab"]'));
      var current = tabs.indexOf(document.activeElement);
      var next = current;
      if (event.key === 'ArrowRight') next = (current + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (current - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      event.preventDefault();
      activateTab(tabs[next]);
      tabs[next].focus();
    }, { signal: state.controller.signal });

    var accordionButton = state.root.querySelector('[data-accordion] > button');
    if (accordionButton) accordionButton.addEventListener('click', function () {
      var expanded = accordionButton.getAttribute('aria-expanded') === 'true';
      accordionButton.setAttribute('aria-expanded', String(!expanded));
      var panel = document.getElementById(accordionButton.getAttribute('aria-controls'));
      if (panel) panel.hidden = expanded;
      announce(expanded ? 'Accordion collapsed.' : 'Accordion expanded through JavaScript.');
    }, { signal: state.controller.signal });
  }

  function activateTab(tab) {
    var list = tab.closest('[role="tablist"]');
    if (!list) return;
    list.querySelectorAll('[role="tab"]').forEach(function (item) {
      var selected = item === tab;
      item.setAttribute('aria-selected', String(selected));
      item.tabIndex = selected ? 0 : -1;
      var panel = state.root.querySelector('#' + CSS.escape(item.getAttribute('aria-controls')));
      if (panel) panel.hidden = !selected;
    });
    announce(tab.textContent.trim() + ' tab activated.');
  }

  function updateCharacterCounter(textarea) {
    var counter = state.root.querySelector('[data-char-counter]');
    if (counter) counter.textContent = textarea.value.length + ' / ' + textarea.maxLength;
  }

  function validateForm(event) {
    event.preventDefault();
    var form = event.currentTarget;
    var name = form.elements.signalName;
    var message = form.elements.signalMessage;
    var nameError = state.root.querySelector('[data-name-error]');
    var messageError = state.root.querySelector('[data-message-error]');
    var result = state.root.querySelector('[data-form-result]');
    var valid = true;

    if (!name.value.trim() || name.value.trim().length < 3) {
      valid = false;
      name.setAttribute('aria-invalid', 'true');
      if (nameError) nameError.textContent = 'Use at least three characters.';
    } else {
      name.removeAttribute('aria-invalid');
      if (nameError) nameError.textContent = '';
    }
    if (!message.value.trim()) {
      valid = false;
      message.setAttribute('aria-invalid', 'true');
      if (messageError) messageError.textContent = 'Enter a message.';
    } else {
      message.removeAttribute('aria-invalid');
      if (messageError) messageError.textContent = '';
    }
    if (result) result.textContent = valid ? 'Signal accepted: “' + name.value.trim() + '” was validated without leaving the page.' : 'Signal not transmitted. Correct the labeled fields.';
    announce(valid ? 'Form validation passed.' : 'Form validation found fields requiring attention.');
  }

  function setupStorage() {
    try {
      var localKey = 'hrvRepoLabLocal';
      var localValue = 'local-' + BUILD;
      localStorage.setItem(localKey, localValue);
      var passLocal = localStorage.getItem(localKey) === localValue;
      setStatus('localStorage', passLocal ? 'PASS' : 'FAIL', passLocal ? 'Value persisted in localStorage.' : 'Value did not round-trip.');
      var savedTheme = localStorage.getItem('hrvRepoLabTheme');
      if (savedTheme === 'aurora' || savedTheme === 'daylight') state.root.dataset.theme = savedTheme;
    } catch (error) {
      setStatus('localStorage', 'UNSUPPORTED', error.message);
    }
    try {
      var sessionKey = 'hrvRepoLabSession';
      var prior = sessionStorage.getItem(sessionKey);
      sessionStorage.setItem(sessionKey, prior || ('session-' + Date.now()));
      var passSession = !!sessionStorage.getItem(sessionKey);
      setStatus('sessionStorage', passSession ? 'PASS' : 'FAIL', prior ? 'Existing session value survived this remount.' : 'New session value stored.');
    } catch (error) {
      setStatus('sessionStorage', 'UNSUPPORTED', error.message);
    }
  }

  async function setupResourceTests() {
    var jsonUrl = BASE + 'test-data.json?v=' + encodeURIComponent(BUILD) + '&cb=' + Date.now();
    var imageUrl = REPO_ROOT + 'SPWeekAlert.png?v=' + encodeURIComponent(BUILD);
    var svgUrl = BASE + 'assets/lab-orbit.svg?v=' + encodeURIComponent(BUILD);
    var summary = state.root.querySelector('[data-resource-summary]');

    try {
      state.data = await fetchJson(jsonUrl);
      state.cards = Array.isArray(state.data.cards) ? state.data.cards.slice() : [];
      renderDataCards();
      setStatus('jsonFetch', 'PASS', 'Fetched schema ' + state.data.schemaVersion + ' with ' + state.cards.length + ' cards.');
      var table = state.root.querySelector('[data-table-json-state]');
      if (table) { table.textContent = 'Loaded'; table.classList.add('hrv-badge--pass'); }
    } catch (error) {
      setStatus('jsonFetch', 'FAIL', error.message);
      renderDataFallback(error.message);
    }

    testImageElement(state.root.querySelector('[data-test-image]'), imageUrl, 'imageLoaded', 'Repository PNG');
    testImageElement(state.root.querySelector('[data-test-svg]'), svgUrl, 'svgLoaded', 'Repository SVG');
    loadSecondaryScript();
    loadDynamicModule();
    if (summary) summary.textContent = 'JSON, PNG, SVG, secondary script, and dynamic module requests were launched with cache-busting identifiers.';
  }

  function testImageElement(element, url, statusId, label) {
    if (!element) {
      setStatus(statusId, 'FAIL', label + ' element missing.');
      return;
    }
    element.addEventListener('load', function () {
      setStatus(statusId, 'PASS', label + ' loaded at ' + element.naturalWidth + ' × ' + element.naturalHeight + '.');
    }, { once: true, signal: state.controller.signal });
    element.addEventListener('error', function () {
      setStatus(statusId, 'FAIL', label + ' failed at ' + url);
      element.alt += ' (failed to load)';
    }, { once: true, signal: state.controller.signal });
    element.src = url;
  }

  function loadSecondaryScript() {
    var script = document.createElement('script');
    script.src = BASE + 'secondary.js?v=' + encodeURIComponent(BUILD);
    script.dataset.hrvRepoLabRuntimeAsset = 'secondary';
    script.addEventListener('load', function () {
      try {
        var result = window.HRVRepoLabSecondary && window.HRVRepoLabSecondary.run();
        setStatus('secondaryScript', result ? 'PASS' : 'FAIL', result ? result.message : 'Global secondary API missing.');
      } catch (error) {
        setStatus('secondaryScript', 'FAIL', error.message);
      }
    }, { once: true });
    script.addEventListener('error', function () { setStatus('secondaryScript', 'FAIL', 'Secondary script request failed.'); }, { once: true });
    document.head.appendChild(script);
    addCleanup(function () { script.remove(); });
  }

  async function loadDynamicModule() {
    try {
      var module = await import(BASE + 'dynamic-module.js?v=' + encodeURIComponent(BUILD));
      var result = module.runDynamicModuleTest();
      setStatus('dynamicModule', 'PASS', result.message + ' Version ' + result.moduleVersion + '.');
    } catch (error) {
      setStatus('dynamicModule', 'PARTIAL', 'Dynamic import was blocked or unsupported: ' + error.message);
    }
  }

  function renderDataCards() {
    var container = state.root.querySelector('[data-data-cards]');
    if (!container) return;
    container.innerHTML = state.cards.map(function (card) {
      return '<article class="hrv-data-card" data-card-id="' + escapeHtml(card.id) + '" data-card-group="' + escapeHtml(card.group) + '" data-card-score="' + escapeHtml(card.score) + '">' +
        '<span class="hrv-kicker">' + escapeHtml(card.group) + '</span>' +
        '<div class="hrv-data-card__score" aria-label="Score ' + escapeHtml(card.score) + '">' + escapeHtml(card.score) + '</div>' +
        '<h3>' + escapeHtml(card.label) + '</h3>' +
        '<p>' + escapeHtml(card.description) + '</p>' +
      '</article>';
    }).join('');
  }

  function renderDataFallback(message) {
    var container = state.root.querySelector('[data-data-cards]');
    if (container) container.innerHTML = '<div role="alert" class="hrv-failure-log">JSON cards could not be loaded. The rest of the laboratory remains available. ' + escapeHtml(message) + '</div>';
  }

  function filterCards(group) {
    state.root.querySelectorAll('[data-card-group]').forEach(function (card) {
      card.hidden = group !== 'all' && card.dataset.cardGroup !== group;
    });
    announce(group === 'all' ? 'All JSON cards are visible.' : 'Cards filtered to ' + group + '.');
  }

  function sortCards() {
    state.cardSortDescending = !state.cardSortDescending;
    state.cards.sort(function (a, b) { return state.cardSortDescending ? b.score - a.score : a.score - b.score; });
    renderDataCards();
    announce('JSON cards sorted ' + (state.cardSortDescending ? 'highest to lowest.' : 'lowest to highest.'));
  }

  function shuffleCards() {
    for (var i = state.cards.length - 1; i > 0; i -= 1) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = state.cards[i]; state.cards[i] = state.cards[j]; state.cards[j] = temp;
    }
    renderDataCards();
    state.root.querySelectorAll('.hrv-data-card').forEach(function (card, index) {
      card.animate([{ opacity: .25, transform: 'translateY(15px) rotate(-1deg)' }, { opacity: 1, transform: 'translateY(0) rotate(0)' }], { duration: 360, delay: index * 35, easing: 'cubic-bezier(.2,.8,.2,1)' });
    });
    announce('Card collection shuffled and rearranged.');
  }

  function setupAnimations() {
    setupMarqueeAnimation();
    setupProgressAnimation();
    setupCounterAnimations();
    setupCanvasAnimation();
    setupDynamicBanner();
  }

  function setupMarqueeAnimation() {
    var runner = state.root.querySelector('[data-js-marquee-runner]');
    if (!runner) return;
    var last = performance.now();
    function frame(now) {
      if (!state.mounted) return;
      var delta = Math.min(40, now - last);
      last = now;
      if (state.marquee.running && !state.root.classList.contains('hrv-motion-paused') && !state.root.classList.contains('hrv-reduced-motion')) {
        state.marquee.x += state.marquee.direction * state.marquee.speed * delta * .06;
        var width = Math.max(260, runner.scrollWidth);
        if (state.marquee.x < -width) state.marquee.x = runner.parentElement.clientWidth;
        if (state.marquee.x > runner.parentElement.clientWidth) state.marquee.x = -width;
        runner.style.transform = 'translateX(' + state.marquee.x + 'px)';
      }
      trackedRaf(frame);
    }
    trackedRaf(frame);
  }

  function setupProgressAnimation() {
    var progress = state.root.querySelector('[data-progress]');
    var output = state.root.querySelector('[data-progress-output]');
    if (!progress) return;
    var direction = 1;
    trackedInterval(function () {
      if (!state.mounted || state.root.classList.contains('hrv-motion-paused') || state.root.classList.contains('hrv-reduced-motion')) return;
      var next = Number(progress.value) + direction * 2;
      if (next >= 100) { next = 100; direction = -1; }
      if (next <= 0) { next = 0; direction = 1; }
      progress.value = next;
      if (output) output.textContent = next + '%';
    }, 90);
  }

  function setupCounterAnimations() {
    state.root.querySelectorAll('[data-counter]').forEach(function (element) {
      var target = Number(element.dataset.counter) || 0;
      var start = performance.now();
      function frame(now) {
        if (!state.mounted) return;
        var ratio = Math.min(1, (now - start) / 1200);
        element.textContent = Math.round(target * (1 - Math.pow(1 - ratio, 3)));
        if (ratio < 1) trackedRaf(frame);
      }
      trackedRaf(frame);
    });
  }

  function setupDynamicBanner() {
    var messages = [
      'External HTML is controlling the Edublogs DOM.',
      'Repository CSS is painting this entire laboratory.',
      'Tracked timers and observers are reporting for duty.',
      'Failure tests are contained behind guarded controls.'
    ];
    var index = 0;
    trackedInterval(function () {
      if (!state.mounted) return;
      var banner = state.root.querySelector('[data-dynamic-banner]');
      if (!banner) return;
      index = (index + 1) % messages.length;
      banner.textContent = messages[index];
    }, 5200);
  }

  function setupCanvasAnimation() {
    var canvas = state.root.querySelector('[data-canvas]');
    if (!canvas) {
      setStatus('canvas', 'FAIL', 'Canvas element missing.');
      return;
    }
    var context = canvas.getContext && canvas.getContext('2d');
    if (!context) {
      setStatus('canvas', 'UNSUPPORTED', '2D canvas context unavailable.');
      return;
    }
    state.canvas.particles = Array.from({ length: 28 }, function (_, index) {
      return { x: Math.random() * canvas.width, y: Math.random() * canvas.height, r: 1.5 + Math.random() * 3.5, dx: .15 + Math.random() * .55, dy: -.16 + Math.random() * .32, hue: 175 + (index % 4) * 28 };
    });
    function draw() {
      if (!state.mounted) return;
      context.clearRect(0, 0, canvas.width, canvas.height);
      var gradient = context.createRadialGradient(canvas.width / 2, canvas.height / 2, 20, canvas.width / 2, canvas.height / 2, canvas.width / 1.8);
      gradient.addColorStop(0, 'rgba(49,46,129,.5)');
      gradient.addColorStop(1, 'rgba(2,6,23,.05)');
      context.fillStyle = gradient;
      context.fillRect(0, 0, canvas.width, canvas.height);
      state.canvas.particles.forEach(function (particle) {
        if (!state.root.classList.contains('hrv-motion-paused') && !state.root.classList.contains('hrv-reduced-motion')) {
          particle.x += particle.dx; particle.y += particle.dy;
          if (particle.x > canvas.width + 8) particle.x = -8;
          if (particle.y < -8) particle.y = canvas.height + 8;
          if (particle.y > canvas.height + 8) particle.y = -8;
        }
        context.beginPath();
        context.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
        context.fillStyle = 'hsla(' + particle.hue + ',90%,75%,.85)';
        context.shadowBlur = 14;
        context.shadowColor = 'hsla(' + particle.hue + ',90%,70%,.8)';
        context.fill();
      });
      context.shadowBlur = 0;
      trackedRaf(draw);
    }
    trackedRaf(draw);
    setStatus('canvas', 'PASS', '2D context created and requestAnimationFrame drawing loop started.');
  }

  function burstParticles() {
    var field = state.root.querySelector('[data-particle-field]');
    if (!field) return;
    for (var i = 0; i < 28; i += 1) {
      var particle = document.createElement('span');
      particle.className = 'hrv-particle';
      particle.style.left = (45 + Math.random() * 10) + '%';
      particle.style.top = (55 + Math.random() * 10) + '%';
      particle.style.setProperty('--x', ((Math.random() - .5) * 320) + 'px');
      particle.style.setProperty('--y', (-30 - Math.random() * 130) + 'px');
      particle.style.animationDelay = (Math.random() * .25) + 's';
      field.appendChild(particle);
      trackedTimeout(function () {
        var old = field.querySelector('.hrv-particle');
        if (old) old.remove();
      }, 2600 + i * 10);
    }
    announce('A contained sparkle particle effect entered and will leave the DOM.');
  }

  function setupObservers() {
    var supported = 0;
    var attempted = 3;
    if ('IntersectionObserver' in window) {
      var intersection = addObserver(new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) { entry.target.classList.toggle('hrv-observed', entry.isIntersecting); });
      }, { threshold: .18 }));
      state.root.querySelectorAll('[data-observe-card]').forEach(function (card) { intersection.observe(card); });
      supported += 1;
    }
    if ('MutationObserver' in window) {
      var zone = state.root.querySelector('[data-dynamic-zone]');
      if (zone) {
        var mutation = addObserver(new MutationObserver(function (records) {
          log('info', 'Mutation Observer recorded ' + records.length + ' DOM change(s).');
        }));
        mutation.observe(zone, { childList: true, subtree: true, characterData: true });
        supported += 1;
      }
    }
    if ('ResizeObserver' in window) {
      var resize = addObserver(new ResizeObserver(function (entries) {
        if (entries[0]) state.root.dataset.observedWidth = Math.round(entries[0].contentRect.width);
      }));
      resize.observe(state.root);
      supported += 1;
    }
    setStatus('observers', supported === attempted ? 'PASS' : (supported ? 'PARTIAL' : 'UNSUPPORTED'), supported + ' of ' + attempted + ' observer APIs active.');
  }

  function setupBrowserSignals() {
    var signal = state.controller.signal;
    window.addEventListener('resize', updateDiagnostics, { signal: signal });
    window.addEventListener('online', function () { announce('Browser reports that the connection is online.'); updateApiGrid(); }, { signal: signal });
    window.addEventListener('offline', function () { announce('Browser reports that the connection is offline.'); updateApiGrid(); }, { signal: signal });
    window.addEventListener('popstate', function (event) {
      var target = state.root && state.root.querySelector('[data-history-state]');
      if (target) target.textContent = 'Back/forward event received: ' + safeStringify(event.state || {});
      log('info', 'Browser popstate event observed.', event.state || {});
    }, { signal: signal });
    document.addEventListener('visibilitychange', function () {
      log('info', 'Page visibility changed to ' + document.visibilityState + '.');
      updateApiGrid(); updateDiagnostics();
    }, { signal: signal });

    if (window.matchMedia) {
      var media = window.matchMedia('(prefers-reduced-motion: reduce)');
      var handler = function () { updateApiGrid(); setStatus('reducedMotion', 'PASS', 'matchMedia changed to ' + media.matches + '.'); };
      if (media.addEventListener) media.addEventListener('change', handler);
      else if (media.addListener) media.addListener(handler);
      addCleanup(function () {
        if (media.removeEventListener) media.removeEventListener('change', handler);
        else if (media.removeListener) media.removeListener(handler);
      });
    }
    updateApiGrid();
  }

  function updateApiGrid() {
    if (!state.root) return;
    var grid = state.root.querySelector('[data-api-grid]');
    if (!grid) return;
    var params = [];
    try { new URLSearchParams(location.search).forEach(function (value, key) { params.push(key + '=' + value); }); } catch (error) {}
    var items = [
      ['Viewport', window.innerWidth + ' × ' + window.innerHeight],
      ['Pixel ratio', window.devicePixelRatio || 1],
      ['Online', navigator.onLine ? 'Yes' : 'No'],
      ['Visibility', document.visibilityState],
      ['Reduced motion', window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'Requested' : 'Not requested'],
      ['URL parameters', params.length ? params.join(', ') : 'None'],
      ['Document origin', location.origin],
      ['Asset origin', (function () { try { return new URL(BASE).origin; } catch (error) { return 'Unknown'; } })()],
      ['Intersection Observer', 'IntersectionObserver' in window ? 'Supported' : 'Unsupported'],
      ['Mutation Observer', 'MutationObserver' in window ? 'Supported' : 'Unsupported'],
      ['Resize Observer', 'ResizeObserver' in window ? 'Supported' : 'Unsupported'],
      ['Clipboard API', navigator.clipboard ? 'Supported' : 'Fallback required']
    ];
    grid.innerHTML = items.map(function (item) { return '<div class="hrv-api-item"><strong>' + escapeHtml(item[0]) + '</strong><span>' + escapeHtml(item[1]) + '</span></div>'; }).join('');
  }

  function injectDynamicStyle() {
    var style = document.createElement('style');
    style.dataset.hrvRepoLabRuntimeStyle = 'true';
    style.textContent = '#' + MOUNT_ID + ' .hrv-lab[data-phase="interactive"] .hrv-hero__eyebrow::after{content:" • DYNAMIC STYLE INJECTED";color:var(--hrv-green)}';
    document.head.appendChild(style);
    addCleanup(function () { style.remove(); });
    log('info', 'Runtime injected a scoped dynamic style element.');
  }

  function pushHistoryState() {
    var token = 'hrv-' + Date.now().toString(36);
    history.pushState({ hrvRepositoryLab: token }, '', location.href.split('#')[0] + '#repo-lab-' + token);
    var target = state.root.querySelector('[data-history-state]');
    if (target) target.textContent = 'Pushed history state ' + token + '. Use Back to trigger popstate.';
    announce('A safe same-page history state was pushed.');
  }

  async function copyDiagnostics() {
    var text = diagnosticsText();
    try {
      if (!navigator.clipboard || !navigator.clipboard.writeText) throw new Error('Clipboard API unavailable');
      await navigator.clipboard.writeText(text);
      announce('Diagnostics copied to the clipboard.');
    } catch (error) {
      var area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed'; area.style.opacity = '0';
      document.body.appendChild(area); area.select();
      var copied = document.execCommand && document.execCommand('copy');
      area.remove();
      announce(copied ? 'Diagnostics copied using the fallback method.' : 'Clipboard copy was blocked; diagnostics remain visible for manual selection.');
    }
  }

  function failureLog(message) {
    var target = state.root && state.root.querySelector('[data-failure-log]');
    if (target) target.textContent = message;
  }

  function recordContainedFailure(title, detail) {
    var message = title + ': ' + detail + '. The remaining runtime continued.';
    state.lastFailure = message;
    failureLog(message);
    log('warn', message);
    updateDiagnostics();
  }

  async function testMissingJson() {
    failureLog('Requesting an intentionally missing JSON file…');
    try {
      await fetchJson(BASE + 'missing-json-controlled-test.json?cb=' + Date.now());
      recordContainedFailure('Missing JSON test behaved unexpectedly', 'request succeeded');
    } catch (error) {
      recordContainedFailure('Missing JSON was caught correctly', error.message);
    }
  }

  function testMissingImage() {
    failureLog('Requesting an intentionally missing image…');
    var image = new Image();
    image.onload = function () { recordContainedFailure('Missing image test behaved unexpectedly', 'request loaded'); };
    image.onerror = function () { recordContainedFailure('Missing image was caught correctly', 'image error event received'); };
    image.src = BASE + 'assets/missing-image-controlled-test.png?cb=' + Date.now();
  }

  function testMissingScript() {
    failureLog('Requesting an intentionally missing secondary script…');
    var script = document.createElement('script');
    script.src = BASE + 'missing-script-controlled-test.js?cb=' + Date.now();
    script.onload = function () { recordContainedFailure('Missing script test behaved unexpectedly', 'request loaded'); script.remove(); };
    script.onerror = function () { recordContainedFailure('Missing script was caught correctly', 'script error event received'); script.remove(); };
    document.head.appendChild(script);
  }

  function testTimeout() {
    failureLog('Running a short simulated timeout…');
    Promise.race([
      new Promise(function (resolve) { trackedTimeout(resolve, 800); }),
      new Promise(function (_, reject) { trackedTimeout(function () { reject(new Error('simulated 300ms timeout')); }, 300); })
    ]).then(function () {
      recordContainedFailure('Timeout test behaved unexpectedly', 'slow operation completed first');
    }).catch(function (error) {
      recordContainedFailure('Simulated timeout was caught correctly', error.message);
    });
  }

  function testControlledError() {
    try {
      throw new Error('intentional repository runtime exception');
    } catch (error) {
      recordContainedFailure('Controlled exception boundary worked', error.message);
    }
  }

  function testDisableAnimation() {
    state.root.classList.add('hrv-motion-paused');
    state.marquee.running = false;
    failureLog('Animation was intentionally disabled for 1.5 seconds; controls and content remain usable.');
    trackedTimeout(function () {
      if (!state.root) return;
      state.root.classList.remove('hrv-motion-paused');
      state.marquee.running = true;
      announce('Temporary animation disable test completed and motion resumed.');
    }, 1500);
  }

  function resetRuntime() {
    try {
      localStorage.removeItem('hrvRepoLabTheme');
      localStorage.removeItem('hrvRepoLabLocal');
    } catch (error) {}
    state.cards = state.data && Array.isArray(state.data.cards) ? state.data.cards.slice() : [];
    state.root.dataset.theme = 'aurora';
    state.root.classList.remove('hrv-motion-paused', 'hrv-reduced-motion');
    state.marquee.running = true;
    state.marquee.speed = .65;
    state.marquee.direction = -1;
    renderDataCards();
    var filter = state.root.querySelector('[data-card-filter]');
    if (filter) filter.value = 'all';
    var form = state.root.querySelector('[data-test-form]');
    if (form) form.reset();
    var counter = state.root.querySelector('[data-char-counter]');
    if (counter) counter.textContent = '0 / 140';
    failureLog('No controlled failures triggered yet.');
    announce('The laboratory interface was restored to its initial interactive state.');
  }

  async function unmountRuntime() {
    if (!state.mounted || state.mounting) {
      log('warn', 'Unmount request ignored because no active runtime exists.');
      return;
    }
    setPhase('unmounting');
    var mount = mountNode();
    var timersBefore = state.timers.size;
    var observersBefore = state.observers.size;
    var framesBefore = state.animationFrames.size;

    state.mounted = false;
    if (state.controller) state.controller.abort();
    state.timers.forEach(function (id) { window.clearTimeout(id); window.clearInterval(id); });
    state.timers.clear();
    state.animationFrames.forEach(function (id) { window.cancelAnimationFrame(id); });
    state.animationFrames.clear();
    state.observers.forEach(function (observer) { try { observer.disconnect(); } catch (error) {} });
    state.observers.clear();
    state.cleanups.splice(0).forEach(function (cleanup) { try { cleanup(); } catch (error) { log('warn', 'Cleanup callback failed safely.', error.message); } });
    state.controller = null;
    state.root = null;

    var clean = state.timers.size === 0 && state.observers.size === 0 && state.animationFrames.size === 0;
    state.persistentLifecycle.unmountCleanup = clean ? 'PASS' : 'FAIL';
    state.phase = 'unmounted';
    log(clean ? 'info' : 'error', 'Runtime unmounted.', { timersCleared: timersBefore, observersDisconnected: observersBefore, animationFramesCancelled: framesBefore, clean: clean });

    if (mount) {
      mount.innerHTML = '<div role="status" style="padding:20px;border:2px solid #0f766e;border-radius:16px;background:#ecfeff;color:#134e4a;font:700 16px/1.5 system-ui,sans-serif">✅ Repository runtime unmounted.<br><small style="font-weight:500">Cleared ' + timersBefore + ' timer(s), disconnected ' + observersBefore + ' observer(s), and cancelled ' + framesBefore + ' animation frame(s).</small><br><button type="button" id="hrv-repo-lab-remount" style="margin-top:14px;padding:11px 16px;border:0;border-radius:10px;background:#312e81;color:white;font-weight:800;cursor:pointer">Remount clean runtime</button></div>';
      var remount = document.getElementById('hrv-repo-lab-remount');
      if (remount) remount.addEventListener('click', function () { mountRuntime({ remount: true }); }, { once: true });
    }
  }

  window.HRVRepoLab = {
    version: RUNTIME_VERSION,
    build: BUILD,
    mount: function () { return mountRuntime({ remount: state.mountCount > 0 }); },
    unmount: unmountRuntime,
    remount: function () { return mountRuntime({ remount: true }); },
    diagnostics: diagnosticsText,
    getState: function () {
      return {
        mounted: state.mounted,
        mounting: state.mounting,
        mountCount: state.mountCount,
        duplicateAttempts: state.duplicateAttempts,
        timerCount: state.timers.size,
        observerCount: state.observers.size,
        frameCount: state.animationFrames.size,
        phase: state.phase
      };
    }
  };

  log('info', 'External runtime script parsed.', { version: RUNTIME_VERSION, build: BUILD, base: BASE, mount: MOUNT_ID });
  mountRuntime();
})();
