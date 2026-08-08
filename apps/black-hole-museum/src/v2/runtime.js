export const RUNTIME_WINDOW = 'current-plus-one-ahead';

export function motionBehavior(state) {
  return state?.reducedMotion || state?.motionPaused ? 'auto' : 'smooth';
}

function setVideoBudget(section, state) {
  section.querySelectorAll('video').forEach((video) => {
    if (state === 'live') {
      video.preload = 'auto';
      return;
    }
    if (state === 'next') {
      video.preload = 'metadata';
      return;
    }
    video.pause();
    video.preload = 'none';
  });
}

export function installRuntimeWindow(shell, sections, cleanups) {
  if (!sections.length) return;

  shell.dataset.runtimeWindow = RUNTIME_WINDOW;
  let activeIndex = 0;
  let direction = 1;
  let lastScrollY = window.scrollY;
  let raf = 0;

  const chooseActive = () => {
    const anchor = window.innerHeight * .42;
    let bestIndex = 0;
    let bestDistance = Number.POSITIVE_INFINITY;

    sections.forEach((section, index) => {
      const rect = section.getBoundingClientRect();
      const containsAnchor = rect.top <= anchor && rect.bottom >= anchor;
      const distance = containsAnchor ? 0 : Math.min(Math.abs(rect.top - anchor), Math.abs(rect.bottom - anchor));
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = index;
      }
    });
    return bestIndex;
  };

  const apply = () => {
    raf = 0;
    const nextIndex = Math.max(0, Math.min(sections.length - 1, activeIndex + direction));
    sections.forEach((section, index) => {
      const state = index === activeIndex ? 'live' : index === nextIndex ? 'next' : 'dormant';
      section.dataset.runtimeState = state;
      section.classList.toggle('is-runtime-live', state === 'live');
      section.classList.toggle('is-runtime-next', state === 'next');
      section.classList.toggle('is-runtime-dormant', state === 'dormant');
      setVideoBudget(section, state);
    });
    shell.dataset.runtimeStation = sections[activeIndex]?.dataset.station || '';
    shell.dataset.runtimeDirection = direction > 0 ? 'forward' : 'backward';
  };

  const schedule = () => {
    const y = window.scrollY;
    if (Math.abs(y - lastScrollY) > 2) direction = y >= lastScrollY ? 1 : -1;
    lastScrollY = y;
    activeIndex = chooseActive();
    if (!raf) raf = requestAnimationFrame(apply);
  };

  activeIndex = chooseActive();
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  cleanups.push(() => {
    window.removeEventListener('scroll', schedule);
    window.removeEventListener('resize', schedule);
    if (raf) cancelAnimationFrame(raf);
  });
  apply();
}

export function installSectionSpy(shell, sections, cleanups) {
  if (!('IntersectionObserver' in window)) return;
  const links = [...shell.querySelectorAll('[data-bhv2-wayfinding] a')];
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((link) => {
        const active = link.getAttribute('href') === '#' + entry.target.id;
        link.classList.toggle('is-active', active);
        if (active) link.setAttribute('aria-current', 'step');
        else link.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-35% 0px -50% 0px', threshold: .05 });

  sections.forEach((section) => observer.observe(section));
  cleanups.push(() => observer.disconnect());
}

export function installLazyYouTube(center, cleanups) {
  if (!center) return;
  const frames = [...center.querySelectorAll('[data-youtube-id]')];

  const activate = () => {
    frames.forEach((frame) => {
      if (frame.querySelector('iframe')) return;
      const id = frame.dataset.youtubeId;
      if (!id) return;
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=0&controls=1&rel=0&playsinline=1`;
      iframe.title = frame.dataset.youtubeTitle || 'YouTube video';
      iframe.loading = 'lazy';
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      iframe.allow = 'accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      iframe.allowFullscreen = true;
      frame.replaceChildren(iframe);
    });
    center.dataset.playerState = 'ready';
  };

  const sleep = () => {
    const activeElement = document.activeElement;
    if (activeElement && center.contains(activeElement)) return;
    frames.forEach((frame) => {
      const iframe = frame.querySelector('iframe');
      if (iframe) iframe.remove();
      if (!frame.firstChild) {
        const placeholder = document.createElement('div');
        placeholder.className = 'bhv2-youtube-placeholder';
        placeholder.textContent = 'Video player wakes up when the Media Center is nearby.';
        frame.append(placeholder);
      }
    });
    center.dataset.playerState = 'sleeping';
  };

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) activate();
        else if (center.dataset.playerState === 'ready') sleep();
      });
    }, { rootMargin: '100% 0px 100% 0px', threshold: 0 });
    observer.observe(center);
    cleanups.push(() => observer.disconnect());
  } else {
    activate();
  }

  cleanups.push(sleep);
}

function pauseRunningAnimations(shell, state) {
  if (typeof shell.getAnimations !== 'function') return;
  state.manuallyPausedAnimations = shell.getAnimations({ subtree: true }).filter((animation) => animation.playState === 'running');
  state.manuallyPausedAnimations.forEach((animation) => animation.pause());
}

function resumeManuallyPausedAnimations(state) {
  (state.manuallyPausedAnimations || []).forEach((animation) => {
    try { animation.play(); } catch {}
  });
  state.manuallyPausedAnimations = [];
}

export function installMotionControl(shell, button, state) {
  if (!button) return;
  button.setAttribute('aria-pressed', 'false');
  button.addEventListener('click', () => {
    state.motionPaused = !state.motionPaused;
    shell.dataset.motion = state.motionPaused ? 'paused' : state.reducedMotion ? 'still' : 'running';
    button.textContent = state.motionPaused ? 'Resume motion' : 'Pause motion';
    button.setAttribute('aria-pressed', String(state.motionPaused));

    if (state.motionPaused) {
      shell.querySelectorAll('video').forEach((video) => video.pause());
      pauseRunningAnimations(shell, state);
    } else if (!state.reducedMotion) {
      resumeManuallyPausedAnimations(state);
    }
  });
}

export function destroyEnhancedMedia(shell) {
  shell.querySelectorAll('video').forEach((video) => {
    video.pause();
    video.removeAttribute('src');
    video.querySelectorAll('source').forEach((source) => source.removeAttribute('src'));
    video.load();
  });
  shell.querySelectorAll('iframe').forEach((iframe) => iframe.remove());
}
