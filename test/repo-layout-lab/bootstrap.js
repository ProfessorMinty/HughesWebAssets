(function () {
  'use strict';

  var PREFIX = '[HRV LAYOUT LAB]';
  var script = document.currentScript;
  var build = (script && script.dataset && script.dataset.build) || '2026.08.05.2';
  var mountId = (script && script.dataset && script.dataset.mount) || 'hrv-layout-lab';
  var mount = document.getElementById(mountId);

  function log(level, message, detail) {
    var method = console[level] || console.log;
    method.call(console, PREFIX + ' ' + message, detail || '');
  }

  function showFallback(title, message) {
    if (!mount) return;
    mount.removeAttribute('aria-busy');
    mount.setAttribute('data-hrv-layout-fallback-active', 'true');
    var fallback = mount.querySelector('[data-hrv-layout-static-fallback]');
    if (!fallback) {
      fallback = document.createElement('div');
      fallback.setAttribute('data-hrv-layout-static-fallback', '');
      fallback.setAttribute('role', 'status');
      fallback.style.cssText = 'padding:24px;border:2px solid #b45309;border-radius:18px;background:#fff7ed;color:#7c2d12;font:600 17px/1.55 system-ui,sans-serif;box-shadow:0 18px 50px rgba(124,45,18,.12)';
      mount.replaceChildren(fallback);
    }
    fallback.innerHTML = '<strong style="display:block;font-size:1.2em;margin-bottom:8px">' + title + '</strong><span>' + message + '</span><small style="display:block;margin-top:10px;font-weight:500">Build ' + build + '</small>';
  }

  if (!mount) {
    log('error', 'No mount was found.', { mountId: mountId });
    return;
  }

  if (window.__HRV_LAYOUT_LAB_BOOTSTRAP__) {
    log('warn', 'Duplicate bootstrap ignored.');
    mount.setAttribute('data-hrv-layout-duplicate', 'true');
    return;
  }
  window.__HRV_LAYOUT_LAB_BOOTSTRAP__ = true;

  var source = script && script.src ? script.src : '';
  var base = source ? source.replace(/bootstrap\.js(?:\?.*)?$/i, '') : '';
  if (!base) {
    showFallback('Layout laboratory temporarily unavailable', 'The external asset address could not be determined. The Edublogs page itself is still available.');
    return;
  }

  mount.setAttribute('aria-busy', 'true');
  mount.setAttribute('data-hrv-layout-build', build);

  var query = new URLSearchParams(window.location.search);
  var simulateFailure = query.get('hrvSimulateAssetFailure') === '1';

  var css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = base + 'layout-lab.css?v=' + encodeURIComponent(build);
  css.dataset.hrvLayoutLab = 'stylesheet';
  css.addEventListener('error', function () {
    log('error', 'External stylesheet failed.', css.href);
  }, { once: true });
  document.head.appendChild(css);

  var runtime = document.createElement('script');
  runtime.src = base + (simulateFailure ? 'intentional-missing-runtime.js' : 'index.js') + '?v=' + encodeURIComponent(build);
  runtime.dataset.base = base;
  runtime.dataset.build = build;
  runtime.dataset.mount = mountId;
  runtime.dataset.bootstrapSource = source;
  runtime.addEventListener('load', function () {
    log('info', 'Layout runtime loaded.', runtime.src);
  }, { once: true });
  runtime.addEventListener('error', function () {
    showFallback(
      'Interactive layout temporarily unavailable',
      simulateFailure
        ? 'Controlled cold-start failure succeeded: the external runtime was intentionally blocked and this Edublogs-hosted fallback remained readable.'
        : 'The external runtime could not load. Please try again shortly. The rest of the Edublogs site remains available.'
    );
    log('error', 'Runtime failed to load; static Edublogs fallback retained.', runtime.src);
  }, { once: true });
  document.head.appendChild(runtime);

  log('info', 'Bootstrap started.', { base: base, build: build, simulateFailure: simulateFailure });
})();
