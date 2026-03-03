(() => {
  "use strict";

  const canvas = document.getElementById("stars-bg");
  if (!canvas) {
    return;
  }

  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) {
    return;
  }

  const reducedMotionMedia = window.matchMedia("(prefers-reduced-motion: reduce)");
  const mobileMedia = window.matchMedia("(max-width: 768px)");

  const STAR_COUNT_DESKTOP = 160;
  const STAR_COUNT_MOBILE = 90;
  const DPR_CAP = 2;

  let width = 0;
  let height = 0;
  let dpr = 1;
  let stars = [];

  let rafId = 0;
  let resizeRafId = 0;
  let running = false;
  let lastTs = 0;

  const isLightTheme = () => document.body.classList.contains("light");

  const starColor = (alpha, lightTheme) => {
    if (lightTheme) {
      return `rgba(10, 14, 20, ${alpha.toFixed(3)})`;
    }
    return `rgba(255, 255, 255, ${alpha.toFixed(3)})`;
  };

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  const starCount = () => (mobileMedia.matches ? STAR_COUNT_MOBILE : STAR_COUNT_DESKTOP);

  const createStar = () => {
    const depth = 0.35 + Math.random() * 0.65;
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      size: 0.45 + depth * 1.25,
      baseAlpha: 0.18 + depth * 0.42,
      phase: Math.random() * Math.PI * 2,
      twinkleSpeed: 0.25 + Math.random() * 0.55,
      speedY: 1.8 + depth * 5.2,
      speedX: (Math.random() - 0.5) * 0.28,
      depth,
    };
  };

  const initStars = () => {
    const count = starCount();
    stars = Array.from({ length: count }, createStar);
  };

  const resize = () => {
    const nextWidth = Math.max(1, Math.floor(window.innerWidth));
    const nextHeight = Math.max(1, Math.floor(window.innerHeight));
    const nextDpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);

    width = nextWidth;
    height = nextHeight;
    dpr = nextDpr;

    canvas.width = Math.max(1, Math.round(width * dpr));
    canvas.height = Math.max(1, Math.round(height * dpr));

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    initStars();
  };

  const render = (timeMs, deltaSec, animate) => {
    const lightTheme = isLightTheme();
    const timeSec = timeMs * 0.001;

    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < stars.length; i += 1) {
      const star = stars[i];

      if (animate) {
        star.y += star.speedY * deltaSec;
        star.x += star.speedX * deltaSec * 20;

        if (star.y > height + 2) {
          star.y = -2;
          star.x = Math.random() * width;
        }

        if (star.x < -2) {
          star.x = width + 2;
        } else if (star.x > width + 2) {
          star.x = -2;
        }
      }

      const twinkle = animate ? Math.sin(timeSec * star.twinkleSpeed + star.phase) * 0.08 : 0;
      const alpha = clamp(star.baseAlpha + twinkle, 0.05, 0.75);

      ctx.fillStyle = starColor(alpha, lightTheme);

      if (star.size < 1) {
        const pixelSize = 0.9 + star.depth * 0.3;
        ctx.fillRect(star.x, star.y, pixelSize, pixelSize);
      } else {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  };

  const drawStatic = () => {
    render(performance.now(), 0, false);
  };

  const stop = () => {
    running = false;
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
    lastTs = 0;
  };

  const loop = (ts) => {
    if (!running) {
      return;
    }

    if (lastTs === 0) {
      lastTs = ts;
    }

    const deltaSec = Math.min((ts - lastTs) / 1000, 0.05);
    lastTs = ts;

    render(ts, deltaSec, true);
    rafId = requestAnimationFrame(loop);
  };

  const start = () => {
    if (running || reducedMotionMedia.matches || document.visibilityState === "hidden") {
      return;
    }
    running = true;
    rafId = requestAnimationFrame(loop);
  };

  const onResize = () => {
    if (resizeRafId) {
      return;
    }

    resizeRafId = requestAnimationFrame(() => {
      resizeRafId = 0;
      resize();

      if (reducedMotionMedia.matches) {
        drawStatic();
      } else {
        render(performance.now(), 0, false);
        if (document.visibilityState === "visible") {
          start();
        }
      }
    });
  };

  const onVisibilityChange = () => {
    if (document.visibilityState === "hidden") {
      stop();
      return;
    }

    if (reducedMotionMedia.matches) {
      drawStatic();
      return;
    }

    start();
  };

  const onMotionPreferenceChange = () => {
    if (reducedMotionMedia.matches) {
      stop();
      drawStatic();
      return;
    }

    if (document.visibilityState === "visible") {
      start();
    }
  };

  const onDensityChange = () => {
    resize();
    if (reducedMotionMedia.matches) {
      drawStatic();
    } else {
      render(performance.now(), 0, false);
      if (document.visibilityState === "visible") {
        start();
      }
    }
  };

  resize();

  if (reducedMotionMedia.matches) {
    drawStatic();
  } else {
    render(performance.now(), 0, false);
    if (document.visibilityState === "visible") {
      start();
    }
  }

  window.addEventListener("resize", onResize, { passive: true });
  document.addEventListener("visibilitychange", onVisibilityChange);

  if (typeof reducedMotionMedia.addEventListener === "function") {
    reducedMotionMedia.addEventListener("change", onMotionPreferenceChange);
  } else if (typeof reducedMotionMedia.addListener === "function") {
    reducedMotionMedia.addListener(onMotionPreferenceChange);
  }

  if (typeof mobileMedia.addEventListener === "function") {
    mobileMedia.addEventListener("change", onDensityChange);
  } else if (typeof mobileMedia.addListener === "function") {
    mobileMedia.addListener(onDensityChange);
  }
})();
