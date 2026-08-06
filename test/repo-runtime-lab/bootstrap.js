(function () {
  'use strict';

  var PREFIX = '[HRV REPO TEST]';
  var script = document.currentScript;
  var build = (script && script.dataset && script.dataset.build) || '2026.08.05.1';
  var mountId = (script && script.dataset && script.dataset.mount) || 'hrv-repo-test-root';
  var mount = document.getElementById(mountId) || document.getElementById('hrv-repo-test');

  function log(level, message, detail) {
    var method = console[level] || console.log;
    method.call(console, PREFIX + ' ' + message, detail || '');
  }

  if (!mount) {
    log('error', 'Bootstrap stopped because no mount element was found.', { mountId: mountId });
    return;
  }

  if (window.__HRV_REPO_LAB_BOOTSTRAP__) {
    log('warn', 'Duplicate bootstrap request detected and ignored.');
    mount.setAttribute('data-hrv-bootstrap-duplicate', 'true');
    return;
  }
  window.__HRV_REPO_LAB_BOOTSTRAP__ = true;

  var source = script && script.src ? script.src : '';
  var base = source ? source.replace(/bootstrap\.js(?:\?.*)?$/i, '') : '';
  if (!base) {
    mount.innerHTML = '<div role="alert" style="padding:16px;border:2px solid #b91c1c;border-radius:12px;background:#fee2e2;color:#7f1d1d;font-weight:700">Repository laboratory could not determine its asset base URL.</div>';
    log('error', 'Could not determine asset base URL from bootstrap source.');
    return;
  }

  mount.setAttribute('data-hrv-bootstrap-build', build);
  mount.setAttribute('aria-busy', 'true');
  mount.innerHTML = '<div role="status" style="padding:18px;border:2px solid #8b5cf6;border-radius:14px;background:linear-gradient(135deg,#eef2ff,#f5f3ff);color:#312e81;font:700 16px/1.4 system-ui,sans-serif">🧪 Repository Runtime Laboratory is assembling…<br><small style="font-weight:500">Bootstrap ' + build + '</small></div>';

  var cssId = 'hrv-repo-lab-css';
  var existingCss = document.getElementById(cssId);
  if (!existingCss) {
    var link = document.createElement('link');
    link.id = cssId;
    link.rel = 'stylesheet';
    link.href = base + 'test-page.css?v=' + encodeURIComponent(build);
    link.dataset.hrvRepoLab = 'stylesheet';
    link.addEventListener('load', function () {
      document.documentElement.setAttribute('data-hrv-repo-css-loaded', 'true');
      log('info', 'External stylesheet loaded.', link.href);
    }, { once: true });
    link.addEventListener('error', function () {
      document.documentElement.setAttribute('data-hrv-repo-css-loaded', 'false');
      log('error', 'External stylesheet failed to load.', link.href);
    }, { once: true });
    document.head.appendChild(link);
  }

  var runtime = document.createElement('script');
  runtime.src = base + 'index.js?v=' + encodeURIComponent(build);
  runtime.defer = true;
  runtime.dataset.base = base;
  runtime.dataset.build = build;
  runtime.dataset.mount = mount.id;
  runtime.dataset.bootstrapSource = source;
  runtime.addEventListener('error', function () {
    mount.removeAttribute('aria-busy');
    mount.innerHTML = '<div role="alert" style="padding:18px;border:2px solid #b91c1c;border-radius:14px;background:#fff1f2;color:#881337;font:700 16px/1.5 system-ui,sans-serif">Repository runtime failed to load. The Edublogs page is still intact, but the external JavaScript asset could not be executed.<br><small style="font-weight:500">Source: ' + runtime.src.replace(/</g, '&lt;') + '</small></div>';
    log('error', 'External runtime script failed to load.', runtime.src);
  }, { once: true });
  document.head.appendChild(runtime);
  log('info', 'Bootstrap injected stylesheet and runtime.', { base: base, build: build, mount: mount.id });
})();
