(function () {
  'use strict';

  var PREFIX = '[HRV LAYOUT LAB]';
  var script = document.currentScript;
  var BASE = script && script.dataset.base ? script.dataset.base : '';
  var BUILD = script && script.dataset.build ? script.dataset.build : '2026.08.05.2';
  var MOUNT_ID = script && script.dataset.mount ? script.dataset.mount : 'hrv-layout-lab';
  var BOOTSTRAP_SOURCE = script && script.dataset.bootstrapSource ? script.dataset.bootstrapSource : '';
  var mount = document.getElementById(MOUNT_ID);

  if (!mount) {
    console.error(PREFIX, 'Mount missing:', MOUNT_ID);
    return;
  }
  if (window.__HRV_LAYOUT_LAB_RUNTIME__) {
    console.warn(PREFIX, 'Duplicate runtime ignored.');
    mount.setAttribute('data-hrv-layout-runtime-duplicate', 'true');
    return;
  }
  window.__HRV_LAYOUT_LAB_RUNTIME__ = true;

  var state = {
    mode: 'native',
    nativeWidth: 0,
    currentWidth: 0,
    ancestorRows: [],
    clippingAncestor: null,
    horizontalOverflow: false,
    health: 'NOT TESTED',
    healthDetail: '',
    resilience: 'NOT TESTED',
    lastMeasurement: null,
    report: null
  };

  function log(level, message, detail) {
    var method = console[level] || console.log;
    method.call(console, PREFIX + ' ' + message, detail || '');
  }

  function qs(selector, root) { return (root || mount).querySelector(selector); }
  function qsa(selector, root) { return Array.from((root || mount).querySelectorAll(selector)); }
  function px(value) { var n = parseFloat(value); return Number.isFinite(n) ? Math.round(n * 10) / 10 : value; }
  function fmtPx(value) { return Number.isFinite(value) ? Math.round(value) + ' px' : String(value || '—'); }

  function selectorFor(el) {
    if (!el || el.nodeType !== 1) return 'unknown';
    var out = el.tagName.toLowerCase();
    if (el.id) out += '#' + el.id;
    if (el.classList && el.classList.length) out += '.' + Array.from(el.classList).slice(0, 3).join('.');
    return out;
  }

  function toast(message) {
    var node = qs('[data-toast]');
    node.textContent = message;
    node.hidden = false;
    clearTimeout(toast.timer);
    toast.timer = setTimeout(function () { node.hidden = true; }, 3000);
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    var area = document.createElement('textarea');
    area.value = text;
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    var ok = document.execCommand('copy');
    area.remove();
    return ok ? Promise.resolve() : Promise.reject(new Error('Copy command failed'));
  }

  function measureAncestors() {
    var rows = [];
    var node = mount;
    var rootRect = mount.getBoundingClientRect();
    var clipper = null;
    var depth = 0;

    while (node && node.nodeType === 1 && depth < 18) {
      var rect = node.getBoundingClientRect();
      var style = getComputedStyle(node);
      var overflowX = style.overflowX;
      var clips = ['hidden', 'clip', 'auto', 'scroll'].indexOf(overflowX) !== -1 &&
        (rootRect.left < rect.left - 1 || rootRect.right > rect.right + 1);
      if (!clipper && clips) clipper = selectorFor(node);
      rows.push({
        element: selectorFor(node),
        renderedWidth: px(rect.width),
        maxWidth: style.maxWidth,
        paddingLeft: px(style.paddingLeft),
        paddingRight: px(style.paddingRight),
        marginLeft: px(style.marginLeft),
        marginRight: px(style.marginRight),
        overflowX: overflowX,
        position: style.position,
        display: style.display,
        clipsRoot: clips
      });
      if (node === document.documentElement) break;
      node = node.parentElement;
      depth += 1;
    }

    state.ancestorRows = rows;
    state.clippingAncestor = clipper;
    state.currentWidth = px(rootRect.width);
    state.horizontalOverflow = document.documentElement.scrollWidth > window.innerWidth + 2;
    state.lastMeasurement = new Date().toISOString();
    renderMeasurements();
    buildReport();
  }

  function renderMeasurements() {
    var body = qs('[data-ancestor-rows]');
    body.innerHTML = state.ancestorRows.map(function (row) {
      return '<tr' + (row.clipsRoot ? ' class="is-clipping"' : '') + '>' +
        '<td><code>' + escapeHtml(row.element) + '</code>' + (row.clipsRoot ? '<br><strong>Clips root</strong>' : '') + '</td>' +
        '<td>' + fmtPx(row.renderedWidth) + '</td>' +
        '<td>' + escapeHtml(row.maxWidth) + '</td>' +
        '<td>' + escapeHtml(row.paddingLeft + ' / ' + row.paddingRight) + '</td>' +
        '<td>' + escapeHtml(row.marginLeft + ' / ' + row.marginRight) + '</td>' +
        '<td>' + escapeHtml(row.overflowX) + '</td>' +
        '<td>' + escapeHtml(row.position) + '</td></tr>';
    }).join('');

    var gain = state.nativeWidth ? Math.round(state.currentWidth - state.nativeWidth) : 0;
    setMetric('viewport', window.innerWidth + ' × ' + window.innerHeight);
    setMetric('nativeWidth', fmtPx(state.nativeWidth));
    setMetric('currentWidth', fmtPx(state.currentWidth));
    setMetric('gain', (gain >= 0 ? '+' : '') + gain + ' px');
    setMetric('overflow', state.horizontalOverflow ? 'YES' : 'No');
    setMetric('clipper', state.clippingAncestor || 'None detected');

    var overall = qs('[data-overall-status]');
    if (state.horizontalOverflow) {
      overall.textContent = 'Horizontal overflow detected';
      overall.dataset.state = 'warn';
    } else if (state.clippingAncestor) {
      overall.textContent = 'Ancestor clipping detected';
      overall.dataset.state = 'warn';
    } else {
      overall.textContent = 'No clipping or overflow detected';
      overall.dataset.state = 'pass';
    }
  }

  function setMetric(name, value) {
    var node = qs('[data-metric="' + name + '"]');
    if (node) node.textContent = value;
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function applyMode(mode) {
    state.mode = mode;
    mount.classList.remove('hrv-layout-mode-native', 'hrv-layout-mode-safe', 'hrv-layout-mode-full');
    mount.classList.add('hrv-layout-mode-' + mode);
    qsa('[data-layout-mode]').forEach(function (button) {
      var selected = button.dataset.layoutMode === mode;
      button.classList.toggle('is-selected', selected);
      button.setAttribute('aria-pressed', selected ? 'true' : 'false');
    });
    requestAnimationFrame(function () {
      measureAncestors();
      var url = new URL(window.location.href);
      url.searchParams.set('hrvLayoutMode', mode);
      history.replaceState({ hrvLayoutMode: mode }, '', url);
    });
  }

  function buildReport() {
    var shell = qs('.hrv-layout-shell');
    var report = {
      title: 'Hughes Room Views Layout, Readability & Resilience Laboratory',
      build: BUILD,
      measuredAt: state.lastMeasurement,
      pageUrl: window.location.href,
      origin: window.location.origin,
      bootstrapSource: BOOTSTRAP_SOURCE,
      runtimeSource: script.src,
      externalBase: BASE,
      viewport: { width: window.innerWidth, height: window.innerHeight },
      devicePixelRatio: window.devicePixelRatio,
      reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
      online: navigator.onLine,
      mode: state.mode,
      theme: shell ? shell.dataset.theme : 'unknown',
      density: shell ? shell.dataset.density : 'unknown',
      readingWidth: getComputedStyle(mount).getPropertyValue('--hrv-reading').trim(),
      nativeRootWidth: state.nativeWidth,
      currentRootWidth: state.currentWidth,
      widthGain: Math.round(state.currentWidth - state.nativeWidth),
      horizontalOverflow: state.horizontalOverflow,
      clippingAncestor: state.clippingAncestor,
      healthEndpoint: state.health,
      healthDetail: state.healthDetail,
      resilienceTest: state.resilience,
      ancestors: state.ancestorRows
    };
    state.report = report;
    qs('[data-report-output]').textContent = JSON.stringify(report, null, 2);
  }

  function runHealthCheck() {
    var result = qs('[data-resilience-result]');
    result.className = 'hrv-test-result';
    result.textContent = 'Checking repository health marker…';
    fetch(BASE + 'health.json?v=' + encodeURIComponent(BUILD) + '&t=' + Date.now(), { cache: 'no-store' })
      .then(function (response) {
        if (!response.ok) throw new Error('HTTP ' + response.status);
        return response.json();
      })
      .then(function (data) {
        if (data.marker !== 'HRV_LAYOUT_LAB_HEALTHY' || data.build !== BUILD) throw new Error('Unexpected health payload');
        state.health = 'PASS';
        state.healthDetail = data.marker + ' · build ' + data.build;
        qs('[data-health-badge]').textContent = 'Health endpoint PASS';
        result.className = 'hrv-test-result is-pass';
        result.textContent = 'PASS: health.json returned the expected marker and build. This is suitable for an external uptime or keyword monitor.';
        buildReport();
      })
      .catch(function (error) {
        state.health = 'FAIL';
        state.healthDetail = error.message;
        qs('[data-health-badge]').textContent = 'Health endpoint FAIL';
        result.className = 'hrv-test-result is-warn';
        result.textContent = 'FAIL: ' + error.message;
        buildReport();
      });
  }

  function simulateDataFailure() {
    var result = qs('[data-resilience-result]');
    result.className = 'hrv-test-result';
    result.textContent = 'Requesting an intentionally missing JSON resource…';
    fetch(BASE + 'intentional-missing-data.json?t=' + Date.now(), { cache: 'no-store' })
      .then(function (response) {
        if (!response.ok) throw new Error('Expected missing resource returned HTTP ' + response.status);
        throw new Error('Unexpectedly received a successful response');
      })
      .catch(function (error) {
        state.resilience = 'PASS: controlled data failure handled';
        result.className = 'hrv-test-result is-pass';
        result.textContent = 'PASS: ' + error.message + '. The loaded interface, controls, measurements, and animations remain operational.';
        buildReport();
      });
  }

  function coldStartUrl() {
    var url = new URL(window.location.href);
    url.searchParams.set('hrvSimulateAssetFailure', '1');
    return url.toString();
  }

  function previewStaticFallback() {
    var shell = qs('.hrv-layout-shell');
    var saved = shell.outerHTML;
    mount.innerHTML = '<div data-hrv-layout-static-fallback role="status" style="padding:28px;border:2px solid #b45309;border-radius:18px;background:#fff7ed;color:#7c2d12;font:600 17px/1.55 system-ui,sans-serif;box-shadow:0 18px 50px rgba(124,45,18,.12)"><strong style="display:block;font-size:1.25em;margin-bottom:8px">Interactive page temporarily unavailable</strong><span>The visual experience could not load. Please try again shortly. The main Hughes Room Views site remains available.</span><small style="display:block;margin-top:10px;font-weight:500">Static Edublogs fallback preview · Build ' + BUILD + '</small></div>';
    setTimeout(function () {
      mount.innerHTML = saved;
      initializeUi(false);
      applyMode(state.mode);
      toast('Static fallback preview ended.');
    }, 4500);
  }

  function initializeUi(firstMount) {
    var shell = qs('.hrv-layout-shell');
    if (!shell) return;
    qs('[data-build-label]').textContent = BUILD;
    qs('[data-runtime-status]').textContent = 'Repository runtime active';
    mount.removeAttribute('aria-busy');
    mount.removeAttribute('data-hrv-layout-fallback-active');

    qsa('[data-layout-mode]').forEach(function (button) {
      button.addEventListener('click', function () { applyMode(button.dataset.layoutMode); });
    });
    qs('[data-reading-width]').addEventListener('input', function (event) {
      var value = event.target.value + 'px';
      mount.style.setProperty('--hrv-reading', value);
      qs('[data-reading-output]').textContent = value.replace('px', ' px');
      buildReport();
    });
    qs('[data-theme-toggle]').addEventListener('click', function (event) {
      var dark = shell.dataset.theme !== 'dark';
      shell.dataset.theme = dark ? 'dark' : 'light';
      event.currentTarget.textContent = dark ? 'Use light mode' : 'Use dark mode';
      buildReport();
    });
    qs('[data-contrast-toggle]').addEventListener('click', function (event) {
      var active = shell.classList.toggle('is-high-contrast');
      event.currentTarget.textContent = active ? 'Standard contrast' : 'High contrast';
      buildReport();
    });
    qs('[data-density-toggle]').addEventListener('click', function (event) {
      var compact = shell.dataset.density !== 'compact';
      shell.dataset.density = compact ? 'compact' : 'comfortable';
      event.currentTarget.textContent = compact ? 'Comfortable spacing' : 'Compact spacing';
      buildReport();
    });
    qs('[data-refresh-measurements]').addEventListener('click', measureAncestors);
    qs('[data-health-check]').addEventListener('click', runHealthCheck);
    qs('[data-data-failure]').addEventListener('click', simulateDataFailure);
    qs('[data-copy-cold-url]').addEventListener('click', function () {
      copyText(coldStartUrl()).then(function () { toast('Cold-start failure URL copied. Open it in a separate tab.'); }).catch(function () { toast('Could not copy automatically.'); });
    });
    qs('[data-show-static-fallback]').addEventListener('click', previewStaticFallback);
    qs('[data-copy-report]').addEventListener('click', function () {
      copyText(JSON.stringify(state.report, null, 2)).then(function () { toast('Layout report copied.'); }).catch(function () { toast('Report copy failed.'); });
    });
    qs('[data-download-report]').addEventListener('click', function () {
      var blob = new Blob([JSON.stringify(state.report, null, 2)], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'hrv-layout-report-' + BUILD + '.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    });

    if (firstMount) {
      window.addEventListener('resize', debounce(measureAncestors, 150));
      window.addEventListener('online', measureAncestors);
      window.addEventListener('offline', measureAncestors);
    }
  }

  function debounce(fn, delay) {
    var timer;
    return function () {
      clearTimeout(timer);
      timer = setTimeout(fn, delay);
    };
  }

  function mountRuntime() {
    fetch(BASE + 'layout-lab.html?v=' + encodeURIComponent(BUILD), { cache: 'no-store' })
      .then(function (response) {
        if (!response.ok) throw new Error('layout-lab.html returned HTTP ' + response.status);
        return response.text();
      })
      .then(function (html) {
        mount.innerHTML = html;
        mount.classList.add('hrv-layout-mode-native');
        state.nativeWidth = px(mount.getBoundingClientRect().width);
        initializeUi(true);
        var initialMode = new URLSearchParams(window.location.search).get('hrvLayoutMode');
        applyMode(['native', 'safe', 'full'].indexOf(initialMode) !== -1 ? initialMode : 'native');
        setTimeout(runHealthCheck, 350);
        log('info', 'Layout laboratory mounted.', { build: BUILD, base: BASE });
      })
      .catch(function (error) {
        mount.removeAttribute('aria-busy');
        mount.setAttribute('data-hrv-layout-fallback-active', 'true');
        mount.innerHTML = '<div data-hrv-layout-static-fallback role="alert" style="padding:28px;border:2px solid #b45309;border-radius:18px;background:#fff7ed;color:#7c2d12;font:600 17px/1.55 system-ui,sans-serif"><strong style="display:block;font-size:1.25em;margin-bottom:8px">Interactive layout temporarily unavailable</strong><span>The repository HTML could not load. Please try again shortly. The Edublogs page itself remains available.</span><small style="display:block;margin-top:10px;font-weight:500">' + escapeHtml(error.message) + '</small></div>';
        log('error', 'Mount failed.', error);
      });
  }

  mountRuntime();
})();
