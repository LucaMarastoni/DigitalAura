// FILE: script.js
(() => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) document.body.classList.add('reduce-motion');

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);

  const state = {
    scrollY: window.scrollY,
    viewportH: window.innerHeight,
    dirty: true,
  };

  const layout = {
    heroTop: 0,
    heroHeight: 1,
    storyTop: 0,
    storyHeight: 1,
    storyStickyH: 1,
  };

  const nav = document.querySelector('.nav');

  /* HERO */
  const hero = document.getElementById('hero');
  let heroCurrent = document.querySelector('.hero__phrase--current');
  let heroNext = document.querySelector('.hero__phrase--next');
  const heroProgressFill = document.querySelector('.hero__progress-fill');
  const heroMicro = document.querySelector('.hero__micro');
  const heroStage = document.querySelector('.hero__stage');

  const phrases = [
    'We build digital products that feel inevitable.',
    'Web Agency — design, code, performance.',
    'Digital Agency — strategy, content, conversion.',
    'Brand Identity — systems, tone, consistency.',
    'Interfaces that feel calm. Systems that scale.',
    'Fast, accessible, search-ready.',
    'Launch is just the beginning.',
    'Less noise. More clarity.',
  ];
  const microCaptions = [
    'Stage 1 — Foundation',
    'Stage 2 — Performance',
    'Stage 3 — Strategy',
    'Stage 4 — Identity',
    'Stage 5 — Interfaces',
    'Stage 6 — Velocity',
    'Stage 7 — Launch',
    'Stage 8 — Clarity',
  ];
  let currentPhraseIdx = 0;

  const heroLayerConfigs = [
    { sel: '.layer-grid', speedY: -120, speedX: 0, scale: [1, 1.06], rotate: [-0.6, 0.6], opacity: [0.35, 0.65], gate: [0, 1] },
    { sel: '.layer-noise', speedY: 16, speedX: 8, scale: [1, 1.02], rotate: [0, 0], opacity: [0.06, 0.12], gate: [0, 1] },
    { sel: '.layer-lines', speedY: 140, speedX: -40, scale: [1, 1.03], rotate: [-2, 2], opacity: [0.05, 0.32], gate: [0.1, 0.92] },
    { sel: '.layer-shape-a', speedY: -160, speedX: 30, scale: [0.96, 1.08], rotate: [-3, 2], opacity: [0.18, 0.7], gate: [0, 1] },
    { sel: '.layer-shape-b', speedY: 120, speedX: -26, scale: [0.92, 1.06], rotate: [1, -2], opacity: [0.16, 0.6], gate: [0, 1] },
    { sel: '.layer-card-a', speedY: -80, speedX: 18, scale: [0.92, 1.08], rotate: [-4, 2], opacity: [0.3, 1], gate: [0.05, 0.95], climaxBoost: 0.04 },
    { sel: '.layer-card-b', speedY: 110, speedX: -14, scale: [0.9, 1.06], rotate: [3, -2], opacity: [0.28, 0.9], gate: [0.08, 0.92], climaxBoost: 0.03 },
    { sel: '.layer-typo', speedY: 40, speedX: 0, scale: [1, 1.02], rotate: [0, 0], opacity: [0, 0.85], gate: [0.28, 0.9], climaxOpacity: 0.2 },
    { sel: '.layer-focus', speedY: 0, speedX: 0, scale: [1, 1.02], rotate: [0, 0], opacity: [0.4, 0.8], gate: [0, 1] },
  ];
  const heroLayers = heroLayerConfigs.map((c) => document.querySelector(c.sel));
  const layerSweep = document.querySelector('.layer-sweep');
  const layerParticles = document.querySelector('.layer-particles');

  /* STORY */
  const storySection = document.getElementById('story');
  const storySteps = storySection.querySelectorAll('.story__steps li');
  const storyLayers = Array.from(storySection.querySelectorAll('.story__layers .layer'));
  const storySticky = storySection.querySelector('.story__layers');
  const storyCaption = storySection.querySelector('.story__caption');
  const storyCaptions = [
    'Discovery in focus',
    'Systems over pages',
    'Prototype with signals',
    'Ship with observability',
    'Iterate with clarity',
  ];

  /* WORK + PROCESS */
  const workPosters = Array.from(document.querySelectorAll('.work__poster'));
  const processSteps = Array.from(document.querySelectorAll('.process__step'));
  const revealEls = Array.from(document.querySelectorAll('.reveal'));

  /* Utility */
  const measureLayout = () => {
    layout.heroTop = hero.offsetTop;
    layout.heroHeight = hero.offsetHeight || 1;
    layout.storyTop = storySection.offsetTop;
    layout.storyHeight = storySection.offsetHeight || 1;
    layout.storyStickyH = storySticky.offsetHeight || 1;
  };

  const getHeroProgress = () => {
    const denom = Math.max(layout.heroHeight - state.viewportH, 1);
    const raw = (state.scrollY - layout.heroTop) / denom;
    return clamp(raw, 0, 1);
  };

  const getSectionProgress = (sectionEl) => {
    const top = sectionEl.offsetTop;
    const height = sectionEl.offsetHeight || 1;
    const raw = (state.scrollY - top + state.viewportH * 0.2) / height;
    return clamp(raw, 0, 1);
  };

  const getStickyProgress = (sectionEl, stickyEl) => {
    const top = sectionEl.offsetTop;
    const height = sectionEl.offsetHeight || 1;
    const stickyH = stickyEl.offsetHeight || 1;
    const denom = Math.max(height - stickyH, 1);
    const raw = (state.scrollY - top + state.viewportH * 0.1) / denom;
    return clamp(raw, 0, 1);
  };

  const swapHeroPhrase = (nextIdx) => {
    if (nextIdx === currentPhraseIdx || nextIdx < 0 || nextIdx >= phrases.length) return;
    heroNext.textContent = phrases[nextIdx];
    heroNext.classList.add('hero__phrase--current');
    heroNext.classList.remove('hero__phrase--next');
    heroCurrent.classList.add('hero__phrase--next');
    heroCurrent.classList.remove('hero__phrase--current');
    currentPhraseIdx = nextIdx;
    [heroCurrent, heroNext] = [heroNext, heroCurrent];
  };

  /* Parallax */
  const applyLayer = (layer, cfg, progress, inClimax) => {
    if (!layer) return;
    const [gStart, gEnd] = cfg.gate || [0, 1];
    const g = clamp((progress - gStart) / Math.max(gEnd - gStart, 0.0001), 0, 1);
    const eased = easeOut(g);
    const x = lerp(0, cfg.speedX || 0, g);
    const y = lerp(0, cfg.speedY || 0, g);
    let s = lerp(cfg.scale?.[0] ?? 1, cfg.scale?.[1] ?? 1, eased);
    let r = lerp(cfg.rotate?.[0] ?? 0, cfg.rotate?.[1] ?? 0, g);
    let o = lerp(cfg.opacity?.[0] ?? 0.4, cfg.opacity?.[1] ?? 1, g);

    if (inClimax && cfg.climaxBoost) s += cfg.climaxBoost;
    if (inClimax && cfg.climaxOpacity) o = clamp(o + cfg.climaxOpacity, 0, 1);

    if (!prefersReducedMotion) {
      layer.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${s}) rotate(${r}deg)`;
    }
    layer.style.opacity = o;
  };

  const updateParticles = (progress) => {
    if (!layerParticles || prefersReducedMotion) return;
    const children = layerParticles.children;
    for (const dot of children) {
      const depth = Number(dot.dataset.depth || 0.1);
      const y = progress * depth * 260;
      const x = Math.sin((progress + depth) * 6.28) * depth * 80;
      dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    }
  };

  const updateHero = () => {
    const progress = getHeroProgress();
    const idx = clamp(Math.floor(progress * phrases.length), 0, phrases.length - 1);
    swapHeroPhrase(idx);
    if (heroProgressFill) heroProgressFill.style.width = `${progress * 100}%`;
    if (heroMicro) heroMicro.textContent = microCaptions[idx] || microCaptions[0];

    const inClimax = progress > 0.65 && progress < 0.85;
    heroLayerConfigs.forEach((cfg, i) => applyLayer(heroLayers[i], cfg, progress, inClimax));

    if (layerSweep) {
      const sweepPhase = clamp((progress - 0.62) / 0.2, 0, 1);
      const sweepX = lerp(-80, 80, sweepPhase);
      const sweepOpacity = sweepPhase > 0 && sweepPhase < 1 ? 0.8 : 0;
      if (!prefersReducedMotion) layerSweep.style.transform = `translate3d(${sweepX}%, 0, 0)`;
      layerSweep.style.opacity = sweepOpacity;
    }

    updateParticles(progress);
  };

  /* Story */
  const updateStory = () => {
    const progress = getStickyProgress(storySection, storySticky);
    const steps = storySteps.length;
    const stepIdx = clamp(Math.floor(progress * steps), 0, steps - 1);
    storySteps.forEach((step, i) => step.classList.toggle('is-active', i === stepIdx));
    storyCaption.textContent = storyCaptions[stepIdx] || storyCaptions[0];

    if (!prefersReducedMotion) {
      const speeds = [12, 24, 38, 60, -18];
      const scales = [0.01, 0.02, 0.04, 0.0, 0.0];
      storyLayers.forEach((layer, i) => {
        const local = clamp(progress + i * 0.04, 0, 1);
        const y = local * speeds[i];
        const s = 1 + local * scales[i];
        layer.style.transform = `translate3d(0, ${y}px, 0) scale(${s})`;
        if (layer.classList.contains('shine')) {
          layer.style.opacity = lerp(0.3, 0.8, progress);
        }
      });
    }
  };

  /* Work parallax */
  const updateWork = () => {
    if (prefersReducedMotion) return;
    const centerY = state.viewportH / 2;
    const rects = workPosters.map((el) => el.getBoundingClientRect());
    rects.forEach((rect, i) => {
      const depth = Number(workPosters[i].dataset.depth || 0.15);
      const distance = (rect.top + rect.height / 2) - centerY;
      const ratio = clamp(distance / state.viewportH, -1, 1);
      const translate = -ratio * depth * 80;
      workPosters[i].style.transform = `translate3d(0, ${translate}px, 0)`;
    });
  };

  /* Process highlight */
  const updateProcess = () => {
    const centerY = state.viewportH * 0.4;
    let activeIndex = 0;
    const rects = processSteps.map((step) => step.getBoundingClientRect());
    rects.forEach((rect, i) => {
      const distance = Math.abs((rect.top + rect.height / 2) - centerY);
      if (distance < Math.abs((rects[activeIndex].top + rects[activeIndex].height / 2) - centerY)) {
        activeIndex = i;
      }
    });
    processSteps.forEach((step, i) => step.classList.toggle('is-active', i === activeIndex));
  };

  const updateNav = () => {
    nav.classList.toggle('is-scrolled', state.scrollY > 60);
  };

  /* Reveal observer */
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-in');
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  const initParticles = () => {
    if (!layerParticles) return;
    const fragment = document.createDocumentFragment();
    const count = 18;
    for (let i = 0; i < count; i++) {
      const dot = document.createElement('span');
      dot.dataset.depth = (0.06 + Math.random() * 0.35).toFixed(3);
      dot.style.left = `${Math.random() * 100}%`;
      dot.style.top = `${Math.random() * 100}%`;
      fragment.appendChild(dot);
    }
    layerParticles.appendChild(fragment);
  };

  const initReveals = () => {
    if (prefersReducedMotion) {
      revealEls.forEach((el) => el.classList.add('reveal-in'));
      return;
    }
    revealEls.forEach((el) => observer.observe(el));
  };

  const frame = () => {
    if (state.dirty) {
      updateNav();
      updateHero();
      updateStory();
      updateWork();
      updateProcess();
      state.dirty = false;
    }
    requestAnimationFrame(frame);
  };

  const init = () => {
    measureLayout();
    initParticles();
    initReveals();
    state.dirty = true;
    frame();
  };

  window.addEventListener(
    'scroll',
    () => {
      state.scrollY = window.scrollY;
      state.dirty = true;
    },
    { passive: true }
  );

  window.addEventListener('resize', () => {
    state.viewportH = window.innerHeight;
    measureLayout();
    state.dirty = true;
  });

  init();
})();
