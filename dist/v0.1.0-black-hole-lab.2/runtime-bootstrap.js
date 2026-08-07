(function () {
  'use strict';

  var VERSION = '0.1.0';
  var KEY = '__HRV_REPOSITORY_BOOTSTRAP__';
  var script = document.currentScript;
  var mountId = script && script.dataset.mount ? script.dataset.mount : 'hrv-black-hole-museum-root';
  var routeId = script && script.dataset.route ? script.dataset.route : 'repository-page-lab-black-holes';
  var expectedPath = script && script.dataset.path ? script.dataset.path : '/repository-page-lab/';
  var releaseUrl = script && script.dataset.releaseManifest ? script.dataset.releaseManifest : '';
  var timeoutMs = Number(script && script.dataset.timeout || 12000);
  var mount = document.getElementById(mountId);

  function log(level, message, detail) {
    var method = console[level] || console.log;
    method.call(console, '[HRV BOOTSTRAP] ' + message, detail || '');
  }

  function status(message, kind) {
    if (!mount) return;
    var node = mount.querySelector('[data-hrv-native-status]');
    if (!node) return;
    node.textContent = message;
    node.setAttribute('data-state', kind || 'info');
  }

  function fail(code, message, error) {
    if (mount) {
      mount.removeAttribute('aria-busy');
      mount.setAttribute('data-hrv-state', 'failed');
      mount.setAttribute('data-hrv-failure', code);
      status(message, 'failed');
    }
    log('error', code + ': ' + message, error || '');
  }

  function fetchJson(url, label) {
    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, timeoutMs);
    return fetch(url, { cache: 'no-store', signal: controller.signal })
      .then(function (response) {
        if (!response.ok) throw new Error(label + ' returned HTTP ' + response.status);
        return response.json();
      })
      .finally(function () { clearTimeout(timer); });
  }

  function loadStyle(url) {
    return new Promise(function (resolve, reject) {
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = url;
      link.dataset.hrvRepositoryStyle = 'black-hole-museum';
      link.addEventListener('load', function () { resolve(link); }, { once: true });
      link.addEventListener('error', function () { reject(new Error('Stylesheet failed: ' + url)); }, { once: true });
      document.head.appendChild(link);
    });
  }

  if (!mount) {
    log('error', 'Mount root not found.', mountId);
    return;
  }

  if (window[KEY]) {
    mount.setAttribute('data-hrv-duplicate-bootstrap', 'ignored');
    log('warn', 'Duplicate bootstrap ignored.');
    return;
  }
  window[KEY] = { version: VERSION, startedAt: Date.now(), routeId: routeId };

  var path = new URL(window.location.href).pathname;
  if (path !== expectedPath) {
    fail('route-mismatch', 'The enhanced museum did not start because this is not its approved laboratory route.');
    return;
  }
  if (mount.dataset.hrvPage !== routeId ||
      mount.dataset.hrvPageSystem !== 'black-hole-museum' ||
      mount.dataset.hrvSchema !== '1.0') {
    fail('contract-mismatch', 'The native route shell does not match the museum contract.');
    return;
  }
  if (!mount.querySelector('[data-hrv-fallback]')) {
    fail('fallback-missing', 'The required readable fallback is missing, so enhancement was refused.');
    return;
  }
  if (!releaseUrl) {
    fail('release-url-missing', 'The immutable release address is missing.');
    return;
  }

  mount.setAttribute('aria-busy', 'true');
  mount.setAttribute('data-hrv-state', 'checking');
  status('Checking the immutable repository release…');

  fetchJson(releaseUrl, 'Release manifest')
    .then(function (release) {
      if (release.schemaVersion !== '1.0' || !release.pageSystems || !release.pageSystems['black-hole-museum']) {
        throw new Error('Unsupported or incomplete release manifest.');
      }
      var system = release.pageSystems['black-hole-museum'];
      if (!system.script || !system.style || !system.content || !system.assets || !system.experience) {
        throw new Error('Release manifest is missing required page-system assets.');
      }
      mount.setAttribute('data-hrv-release', release.release);
      mount.setAttribute('data-hrv-commit', release.commit);
      mount.setAttribute('data-hrv-state', 'loading');
      status('Loading the Black Hole Gallery…');

      return Promise.all([
        loadStyle(system.style.url),
        fetchJson(system.content.url, 'Content manifest'),
        fetchJson(system.assets.url, 'Asset manifest'),
        fetchJson(system.experience.url, 'Experience manifest'),
        import(system.script.url)
      ]).then(function (parts) {
        return {
          release: release,
          content: parts[1],
          assets: parts[2],
          experience: parts[3],
          module: parts[4]
        };
      });
    })
    .then(function (bundle) {
      if (!bundle.module || typeof bundle.module.mountBlackHoleMuseum !== 'function') {
        throw new Error('Renderer entry point is unavailable.');
      }
      return bundle.module.mountBlackHoleMuseum({
        mount: mount,
        release: bundle.release,
        content: bundle.content,
        assets: bundle.assets,
        experience: bundle.experience
      });
    })
    .then(function () {
      mount.removeAttribute('aria-busy');
      mount.setAttribute('data-hrv-state', 'ready');
      document.documentElement.classList.add('hrv-route-black-hole-lab-ready');
      status('Enhanced museum loaded.', 'ready');
      log('info', 'Black Hole Museum ready.', {
        release: mount.dataset.hrvRelease,
        commit: mount.dataset.hrvCommit
      });
    })
    .catch(function (error) {
      fail('enhancement-failed', 'The enhanced museum is unavailable. The complete readable recap remains below.', error);
    });
})();