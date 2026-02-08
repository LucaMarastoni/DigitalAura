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
    viewportW: window.innerWidth,
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
  let heroCurrent = document.querySelector('.hero-phrase--current');
  let heroNext = document.querySelector('.hero-phrase--next');
  const heroProgressFill = document.querySelector('.hero-progress-fill');
  const heroMicro = document.querySelector('.hero-micro');
  const heroStage = document.querySelector('.hero-stage');

  const phrases = [
    'We build digital products that feel inevitable.',
    'Web Agency - design, code, performance.',
    'Digital Agency - strategy, content, conversion.',
    'Brand Identity - systems, tone, consistency.',
    'Interfaces that feel calm. Systems that scale.',
    'Fast, accessible, search-ready.',
    'Launch is just the beginning.',
    'Less noise. More clarity.',
  ];
  const microCaptions = [
    'Stage 1 - Foundation',
    'Stage 2 - Performance',
    'Stage 3 - Strategy',
    'Stage 4 - Identity',
    'Stage 5 - Interfaces',
    'Stage 6 - Velocity',
    'Stage 7 - Launch',
    'Stage 8 - Clarity',
  ];
  let currentPhraseIdx = 0;

  const heroLayerConfigs = [
    { sel: '.layer-grid', depth: 0.45, depthX: 0.35, rotMult: 0.4, scaleMult: 0.4, opacity: [0.35, 0.65], gate: [0, 1] },
    { sel: '.layer-noise', depth: 0.14, depthX: 0.08, rotMult: 0, scaleMult: 0.15, opacity: [0.06, 0.12], gate: [0, 1] },
    { sel: '.layer-lines', depth: 0.7, depthX: 0.5, rotMult: 0.8, scaleMult: 0.35, opacity: [0.05, 0.32], gate: [0.1, 0.92] },
    { sel: '.layer-shape-a', depth: 0.8, depthX: 0.5, rotMult: 1, scaleMult: 0.6, opacity: [0.18, 0.7], gate: [0, 1] },
    { sel: '.layer-shape-b', depth: 0.68, depthX: 0.4, rotMult: 0.8, scaleMult: 0.5, opacity: [0.16, 0.6], gate: [0, 1] },
    { sel: '.layer-card-a', depth: 0.9, depthX: 0.6, rotMult: 1, scaleMult: 0.9, opacity: [0.3, 1], gate: [0.05, 0.95], climaxScale: 1.2 },
    { sel: '.layer-card-b', depth: 0.8, depthX: 0.55, rotMult: 1, scaleMult: 0.8, opacity: [0.28, 0.9], gate: [0.08, 0.92], climaxScale: 1.1 },
    { sel: '.layer-typo', depth: 0.5, depthX: 0.2, rotMult: 0, scaleMult: 0.3, opacity: [0, 0.85], gate: [0.26, 0.9], climaxOpacity: 0.12 },
    { sel: '.layer-focus', depth: 0.2, depthX: 0, rotMult: 0, scaleMult: 0.2, opacity: [0.4, 0.8], gate: [0, 1] },
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
  const processSection = document.getElementById('process');
  const processLine = document.querySelector('.process__line');
  const processSteps = Array.from(document.querySelectorAll('.process__step'));
  const servicesProcess = document.querySelector('.services-process');
  const miniProcessRow = document.querySelector('.process-mini');
  const miniProcessSteps = Array.from(document.querySelectorAll('.process-mini__step'));
  const revealEls = Array.from(document.querySelectorAll('.reveal'));
  const processMiniSteps = Array.from(document.querySelectorAll('.process-mini__step'));

  /* Utility */
  const measureLayout = () => {
    layout.heroTop = hero.offsetTop;
    layout.heroHeight = hero.offsetHeight || 1;
    layout.storyTop = storySection.offsetTop;
    layout.storyHeight = storySection.offsetHeight || 1;
    layout.storyStickyH = storySticky.offsetHeight || 1;
  };

  const getScrollProgress = (el) => {
    const start = el.offsetTop;
    const end = start + el.offsetHeight - state.viewportH;
    const raw = (state.scrollY - start) / Math.max(end - start, 1);
    return clamp(raw, 0, 1);
  };

  const getStickyProgress = (sectionEl, stickyEl) => {
    const top = sectionEl.offsetTop;
    const height = sectionEl.offsetHeight || 1;
    const stickyH = stickyEl.offsetHeight || 1;
    const denom = Math.max(height - stickyH, 1);
    const raw = (state.scrollY - top) / denom;
    return clamp(raw, 0, 1);
  };

  const swapHeroPhrase = (nextIdx) => {
    if (nextIdx === currentPhraseIdx || nextIdx < 0 || nextIdx >= phrases.length) return;
    heroNext.textContent = phrases[nextIdx];
    heroNext.classList.add('hero-phrase--current');
    heroNext.classList.remove('hero-phrase--next');
    heroCurrent.classList.add('hero-phrase--next');
    heroCurrent.classList.remove('hero-phrase--current');
    currentPhraseIdx = nextIdx;
    [heroCurrent, heroNext] = [heroNext, heroCurrent];
  };

  /* Parallax */
  const applyLayer = (layer, cfg, progress, climax) => {
    if (!layer) return;
    const [gateStart, gateEnd] = cfg.gate || [0, 1];
    const g = clamp((progress - gateStart) / Math.max(gateEnd - gateStart, 0.0001), 0, 1);
    const eased = easeOut(g);
    const swing = (g - 0.5) * 2; // -1..1

    const desktop = state.viewportW >= 960;
    const ampY = (desktop ? 0.22 : 0.16) * state.viewportH * (cfg.depth || 1);
    const ampX = (desktop ? 0.10 : 0.06) * state.viewportW * (cfg.depthX || cfg.depth || 1);
    const baseScaleDelta = (desktop ? 0.10 : 0.07) * (cfg.scaleMult || 1);
    let scale = 1 + baseScaleDelta * eased;
    if (climax && cfg.climaxScale) scale += 0.02 * cfg.climaxScale;

    const rotBase = (desktop ? 4 : 2.5) * (cfg.rotMult || 0);
    const rotation = rotBase * swing;
    const x = ampX * swing;
    const y = ampY * swing;
    const opacity = lerp(cfg.opacity?.[0] ?? 0.3, cfg.opacity?.[1] ?? 1, eased) + (climax && cfg.climaxOpacity ? cfg.climaxOpacity : 0);

    if (!prefersReducedMotion) {
      layer.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale}) rotate(${rotation}deg)`;
    }
    layer.style.opacity = clamp(opacity, 0, 1);
  };

  const updateParticles = (progress) => {
    if (!layerParticles || prefersReducedMotion) return;
    const children = layerParticles.children;
    const desktop = state.viewportW >= 960;
    const ampY = (desktop ? 0.14 : 0.1) * state.viewportH;
    const ampX = (desktop ? 0.08 : 0.06) * state.viewportW;
    for (const dot of children) {
      const depth = Number(dot.dataset.depth || 0.1);
      const swing = (progress - 0.5) * 2;
      const y = swing * ampY * depth;
      const x = Math.sin((progress + depth) * 6.28) * ampX * depth;
      dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    }
  };

  const updateHero = () => {
    const progress = getScrollProgress(hero);
    const idx = clamp(Math.floor(progress * phrases.length), 0, phrases.length - 1);
    swapHeroPhrase(idx);
    if (heroProgressFill) heroProgressFill.style.width = `${progress * 100}%`;
    if (heroMicro) heroMicro.textContent = microCaptions[idx] || microCaptions[0];

    const climax = progress > 0.6 && progress < 0.82;
    heroLayerConfigs.forEach((cfg, i) => applyLayer(heroLayers[i], cfg, progress, climax));

    if (layerSweep) {
      const sweepPhase = clamp((progress - 0.6) / 0.18, 0, 1);
      const sweepX = lerp(-120, 120, sweepPhase);
      const sweepOpacity = sweepPhase > 0 && sweepPhase < 1 ? 0.85 : 0;
      if (!prefersReducedMotion) layerSweep.style.transform = `translate3d(${sweepX}%, 0, 0)`;
      layerSweep.style.opacity = sweepOpacity;
    }

    updateParticles(progress);
  };

  /* Story */
  const updateStory = () => {
    const mobile = state.viewportW < 960;
    const progress = mobile ? getScrollProgress(storySection) : getStickyProgress(storySection, storySticky);
    const steps = storySteps.length;
    const stepIdx = clamp(Math.floor(progress * steps), 0, steps - 1);
    storySteps.forEach((step, i) => step.classList.toggle('is-active', i === stepIdx));
    storyCaption.textContent = storyCaptions[stepIdx] || storyCaptions[0];

    if (!prefersReducedMotion) {
      const speeds = mobile ? [8, 14, 20, 30, -10] : [12, 24, 38, 60, -18];
      const scales = mobile ? [0.008, 0.012, 0.02, 0.0, 0.0] : [0.01, 0.02, 0.04, 0.0, 0.0];
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

  /* Process parallax */
  const updateProcess = () => {
    const centerY = state.viewportH * 0.4;
    const sectionProgress = getScrollProgress(processSection);
    const desktop = state.viewportW >= 960;
    const amp = desktop ? 60 : 28;

    if (processLine && !prefersReducedMotion) {
      processLine.style.transform = `scaleY(${sectionProgress})`;
    }

    let activeIndex = 0;
    const rects = processSteps.map((step) => step.getBoundingClientRect());
    rects.forEach((rect, i) => {
      const distance = Math.abs((rect.top + rect.height / 2) - centerY);
      if (distance < Math.abs((rects[activeIndex].top + rects[activeIndex].height / 2) - centerY)) {
        activeIndex = i;
      }
    });

    rects.forEach((rect, i) => {
      const mid = rect.top + rect.height / 2;
      const norm = clamp((mid - centerY) / state.viewportH, -1, 1);
      const stagger = 1 + i * 0.05;
      const translate = norm * amp * stagger;
      const opacity = lerp(0.65, 1, 1 - Math.min(Math.abs(norm), 1));

      if (!prefersReducedMotion) {
        processSteps[i].style.transform = `translate3d(0, ${translate}px, 0)`;
        processSteps[i].style.opacity = opacity;
      } else {
        processSteps[i].style.transform = '';
        processSteps[i].style.opacity = '';
      }

      processSteps[i].classList.toggle('is-active', i === activeIndex);
    });

    processMiniSteps.forEach((step, i) => step.classList.toggle('is-active', i === activeIndex));

    // Mini process parallax & activation
    if (servicesProcess && miniProcessRow) {
      const miniProgress = getScrollProgress(servicesProcess);
      const rowAmp = desktop ? 18 : 10;
      const rowScale = desktop ? 0.02 : 0.01;
      if (!prefersReducedMotion) {
        const translateY = (0.5 - miniProgress) * rowAmp;
        const scale = 1 + (0.5 - Math.abs(0.5 - miniProgress)) * rowScale;
        miniProcessRow.style.transform = `translate3d(0, ${translateY}px, 0) scale(${scale})`;
        miniProcessRow.style.opacity = lerp(0.7, 1, miniProgress);
      } else {
        miniProcessRow.style.transform = '';
        miniProcessRow.style.opacity = '';
      }

      const miniActiveIdx = clamp(Math.floor(miniProgress * miniProcessSteps.length), 0, miniProcessSteps.length - 1);
      miniProcessSteps.forEach((step, i) => {
        const phase = clamp(miniProgress * 1.1 - i * 0.08, 0, 1);
        step.classList.toggle('is-active', i === miniActiveIdx);
        if (!prefersReducedMotion) {
          const localShift = (0.5 - phase) * (desktop ? 14 : 8);
          const localOpacity = lerp(0.55, 1, phase);
          step.style.transform = `translate3d(0, ${localShift}px, 0)`;
          step.style.opacity = localOpacity;
        } else {
          step.style.transform = '';
          step.style.opacity = '';
        }
      });
    }
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
    const count = 20;
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
    state.viewportW = window.innerWidth;
    measureLayout();
    state.dirty = true;
  });

  init();
})();
