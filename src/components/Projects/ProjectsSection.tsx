import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { projects, type Project } from "../../data/projects";
import { ProjectCard } from "./ProjectCard";
import "./projects.css";

const LOOP_COPIES = 3;
const AUTO_LOOP_INTERVAL_MS = 3500;
const AUTO_LOOP_PAUSE_AFTER_INTERACTION_MS = 8000;
const PROGRAMMATIC_SCROLL_SETTLE_MS = 650;

type LoopedProject = {
  project: Project;
  canonicalIndex: number;
  loopIndex: number;
  key: string;
};

export function ProjectsSection() {
  const [activeLoopIndex, setActiveLoopIndex] = useState<number>(() =>
    projects.length > 1 ? projects.length : 0,
  );
  const [enableVideoPreviews, setEnableVideoPreviews] = useState(false);

  const reelRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const rafRef = useRef<number | null>(null);
  const settleTimeoutRef = useRef<number | null>(null);
  const repositionFrameRef = useRef<number | null>(null);
  const programmaticScrollTimeoutRef = useRef<number | null>(null);
  const autoLoopPauseUntilRef = useRef<number>(0);
  const isMouseOverReelRef = useRef<boolean>(false);

  const visibleProjects = useMemo(() => projects, []);
  const reelCount = visibleProjects.length;
  const hasLoop = reelCount > 1;
  const middleOffset = hasLoop ? reelCount : 0;

  const loopedProjects = useMemo<LoopedProject[]>(() => {
    if (!visibleProjects.length) return [];

    if (!hasLoop) {
      return visibleProjects.map((project, canonicalIndex) => ({
        project,
        canonicalIndex,
        loopIndex: canonicalIndex,
        key: `single-${project.id}-${canonicalIndex}`,
      }));
    }

    return Array.from({ length: LOOP_COPIES }).flatMap((_, copyIndex) =>
      visibleProjects.map((project, canonicalIndex) => ({
        project,
        canonicalIndex,
        loopIndex: copyIndex * reelCount + canonicalIndex,
        key: `${copyIndex}-${project.id}-${canonicalIndex}`,
      })),
    );
  }, [hasLoop, reelCount, visibleProjects]);

  const activeCanonicalIndex = useMemo(() => {
    if (!reelCount) return 0;
    return ((activeLoopIndex % reelCount) + reelCount) % reelCount;
  }, [activeLoopIndex, reelCount]);

  const setItemRef = (loopIndex: number, node: HTMLDivElement | null) => {
    itemRefs.current[loopIndex] = node;
  };

  const getCanonicalIndex = (loopIndex: number): number => {
    if (!reelCount) return 0;
    return ((loopIndex % reelCount) + reelCount) % reelCount;
  };

  const moveToMiddleCopy = (loopIndex: number): number => {
    if (!hasLoop) return loopIndex;
    return middleOffset + getCanonicalIndex(loopIndex);
  };

  const withInstantReposition = (action: () => void) => {
    const reel = reelRef.current;
    if (!reel) return;

    reel.classList.add("is-repositioning");
    action();

    if (repositionFrameRef.current !== null) {
      cancelAnimationFrame(repositionFrameRef.current);
    }

    repositionFrameRef.current = requestAnimationFrame(() => {
      repositionFrameRef.current = requestAnimationFrame(() => {
        reel.classList.remove("is-repositioning");
        repositionFrameRef.current = null;
      });
    });
  };

  const pauseAutoLoop = (durationMs: number = AUTO_LOOP_PAUSE_AFTER_INTERACTION_MS) => {
    autoLoopPauseUntilRef.current = Date.now() + durationMs;
  };

  const clearProgrammaticScrollMode = () => {
    const reel = reelRef.current;
    if (!reel) return;

    if (programmaticScrollTimeoutRef.current !== null) {
      window.clearTimeout(programmaticScrollTimeoutRef.current);
      programmaticScrollTimeoutRef.current = null;
    }

    reel.classList.remove("is-programmatic-scroll");
  };

  const runProgrammaticScroll = (action: () => void) => {
    const reel = reelRef.current;
    if (!reel) {
      action();
      return;
    }

    reel.classList.add("is-programmatic-scroll");
    action();

    if (programmaticScrollTimeoutRef.current !== null) {
      window.clearTimeout(programmaticScrollTimeoutRef.current);
    }

    programmaticScrollTimeoutRef.current = window.setTimeout(() => {
      reel.classList.remove("is-programmatic-scroll");
      programmaticScrollTimeoutRef.current = null;
    }, PROGRAMMATIC_SCROLL_SETTLE_MS);
  };

  const centerOnLoopIndex = (loopIndex: number, behavior: ScrollBehavior = "smooth") => {
    const reel = reelRef.current;
    const target = itemRefs.current[loopIndex];
    if (!reel || !target) return;

    const left = target.offsetLeft - (reel.clientWidth - target.clientWidth) / 2;

    if (behavior === "auto") {
      reel.scrollLeft = left;
      return;
    }

    reel.scrollTo({ left, behavior });
  };

  const getLoopSequenceWidth = (): number => {
    const startNode = itemRefs.current[middleOffset];
    const endNode = itemRefs.current[middleOffset + reelCount];
    if (!startNode || !endNode) return 0;
    return endNode.offsetLeft - startNode.offsetLeft;
  };

  const getNearestLoopIndex = (): number | null => {
    const reel = reelRef.current;
    if (!reel || !loopedProjects.length) return null;

    const center = reel.scrollLeft + reel.clientWidth / 2;
    let nearest: number | null = null;
    let bestDistance = Number.POSITIVE_INFINITY;

    for (const item of loopedProjects) {
      const node = itemRefs.current[item.loopIndex];
      if (!node) continue;
      const itemCenter = node.offsetLeft + node.clientWidth / 2;
      const distance = Math.abs(itemCenter - center);
      if (distance < bestDistance) {
        bestDistance = distance;
        nearest = item.loopIndex;
      }
    }

    return nearest;
  };

  const syncActiveWithViewport = () => {
    const reel = reelRef.current;
    const nearestRaw = getNearestLoopIndex();
    if (nearestRaw === null || !reel) return;

    setActiveLoopIndex((current) => (current === nearestRaw ? current : nearestRaw));
  };

  const normalizeLoopIfNeeded = () => {
    if (!hasLoop) return;

    const reel = reelRef.current;
    const nearestRaw = getNearestLoopIndex();
    if (!reel || nearestRaw === null) return;

    const sequenceWidth = getLoopSequenceWidth();
    if (sequenceWidth <= 0) return;

    if (nearestRaw < middleOffset) {
      withInstantReposition(() => {
        reel.scrollTo({ left: reel.scrollLeft + sequenceWidth, behavior: "auto" });
        setActiveLoopIndex(nearestRaw + reelCount);
      });
      return;
    }

    if (nearestRaw >= middleOffset + reelCount) {
      withInstantReposition(() => {
        reel.scrollTo({ left: reel.scrollLeft - sequenceWidth, behavior: "auto" });
        setActiveLoopIndex(nearestRaw - reelCount);
      });
    }
  };

  const scrollReel = (direction: 1 | -1) => {
    if (!reelCount) return;

    if (!hasLoop) {
      setActiveLoopIndex(0);
      runProgrammaticScroll(() => {
        centerOnLoopIndex(0, "smooth");
      });
      return;
    }

    const currentLoopIndex = getNearestLoopIndex() ?? activeLoopIndex;
    const baseLoopIndex = moveToMiddleCopy(currentLoopIndex);

    if (baseLoopIndex !== currentLoopIndex) {
      withInstantReposition(() => {
        centerOnLoopIndex(baseLoopIndex, "auto");
        setActiveLoopIndex(baseLoopIndex);
      });
    }

    const nextLoopIndex = baseLoopIndex + direction;

    runProgrammaticScroll(() => {
      centerOnLoopIndex(nextLoopIndex, "smooth");
    });
  };

  const jumpToProject = (canonicalIndex: number) => {
    if (!reelCount) return;

    if (!hasLoop) {
      runProgrammaticScroll(() => {
        centerOnLoopIndex(canonicalIndex, "smooth");
      });
      return;
    }

    const currentLoopIndex = getNearestLoopIndex() ?? activeLoopIndex;
    const baseLoopIndex = moveToMiddleCopy(currentLoopIndex);

    if (baseLoopIndex !== currentLoopIndex) {
      withInstantReposition(() => {
        centerOnLoopIndex(baseLoopIndex, "auto");
        setActiveLoopIndex(baseLoopIndex);
      });
    }

    const targetLoopIndex = middleOffset + canonicalIndex;

    runProgrammaticScroll(() => {
      centerOnLoopIndex(targetLoopIndex, "smooth");
    });
  };

  const handlePreviousClick = () => {
    pauseAutoLoop();
    scrollReel(-1);
  };

  const handleNextClick = () => {
    pauseAutoLoop();
    scrollReel(1);
  };

  const handleDotClick = (canonicalIndex: number) => {
    pauseAutoLoop();
    jumpToProject(canonicalIndex);
  };

  const handleReelMouseEnter = () => {
    isMouseOverReelRef.current = true;
  };

  const handleReelMouseLeave = () => {
    isMouseOverReelRef.current = false;
  };

  const getReelItemClass = (loopIndex: number): string => {
    const distance = loopIndex - activeLoopIndex;
    if (distance === 0) return "is-active";
    if (distance === -1) return "is-prev";
    if (distance === 1) return "is-next";
    return distance < 0 ? "is-far-prev" : "is-far-next";
  };

  useEffect(() => {
    const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncVideoPreference = () => {
      setEnableVideoPreviews(!reduceMotionQuery.matches);
    };

    syncVideoPreference();

    if (typeof reduceMotionQuery.addEventListener === "function") {
      reduceMotionQuery.addEventListener("change", syncVideoPreference);
      return () => {
        reduceMotionQuery.removeEventListener("change", syncVideoPreference);
      };
    }

    reduceMotionQuery.addListener(syncVideoPreference);
    return () => {
      reduceMotionQuery.removeListener(syncVideoPreference);
    };
  }, []);

  useLayoutEffect(() => {
    if (!loopedProjects.length) return;

    const initialIndex = hasLoop ? middleOffset : 0;
    setActiveLoopIndex(initialIndex);
    centerOnLoopIndex(initialIndex, "auto");
  }, [hasLoop, loopedProjects.length, middleOffset]);

  useEffect(() => {
    const reel = reelRef.current;
    if (!reel || !loopedProjects.length) return;

    const onScroll = () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        syncActiveWithViewport();
      });

      if (settleTimeoutRef.current !== null) {
        window.clearTimeout(settleTimeoutRef.current);
      }
      settleTimeoutRef.current = window.setTimeout(() => {
        normalizeLoopIfNeeded();
      }, 120);
    };

    const onResize = () => {
      syncActiveWithViewport();
      normalizeLoopIfNeeded();
    };

    const onPointerDown = () => {
      pauseAutoLoop();
      clearProgrammaticScrollMode();
    };

    const onTouchStart = () => {
      pauseAutoLoop();
      clearProgrammaticScrollMode();
    };

    const onWheel = () => {
      pauseAutoLoop();
      clearProgrammaticScrollMode();
    };

    reel.addEventListener("scroll", onScroll, { passive: true });
    reel.addEventListener("pointerdown", onPointerDown, { passive: true });
    reel.addEventListener("touchstart", onTouchStart, { passive: true });
    reel.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("resize", onResize);

    const initialSyncRaf = requestAnimationFrame(() => {
      syncActiveWithViewport();
    });

    return () => {
      reel.removeEventListener("scroll", onScroll);
      reel.removeEventListener("pointerdown", onPointerDown);
      reel.removeEventListener("touchstart", onTouchStart);
      reel.removeEventListener("wheel", onWheel);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(initialSyncRaf);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      if (settleTimeoutRef.current !== null) {
        window.clearTimeout(settleTimeoutRef.current);
      }
      if (repositionFrameRef.current !== null) {
        cancelAnimationFrame(repositionFrameRef.current);
      }
      clearProgrammaticScrollMode();
      isMouseOverReelRef.current = false;
      reel.classList.remove("is-repositioning");
    };
  }, [loopedProjects]);

  useEffect(() => {
    if (!hasLoop || !loopedProjects.length) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const intervalId = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      if (isMouseOverReelRef.current) return;
      if (Date.now() < autoLoopPauseUntilRef.current) return;
      scrollReel(1);
    }, AUTO_LOOP_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [hasLoop, loopedProjects.length, scrollReel]);

  return (
    <section className="projects-section" aria-labelledby="projects-title">
      <div className="projects-section__inner">
        <header className="projects-section__header">
          <p className="projects-section__eyebrow">Case study</p>
          <h2 id="projects-title">Progetti reali, risultati concreti</h2>
          <p className="projects-section__subtitle">
            Selezioniamo solo i lavori che raccontano bene metodo, esecuzione e impatto operativo.
          </p>
        </header>

        <div className="projects-reel-toolbar">
          <p className="projects-reel-hint">Swipe o scorri i case study</p>
          <div className="projects-reel-controls" aria-label="Controlli scorrimento case study">
            <button
              type="button"
              className="projects-reel-control"
              onClick={handlePreviousClick}
              disabled={!hasLoop}
              aria-label="Case study precedente"
            >
              ←
            </button>
            <button
              type="button"
              className="projects-reel-control"
              onClick={handleNextClick}
              disabled={!hasLoop}
              aria-label="Case study successivo"
            >
              →
            </button>
          </div>
        </div>

        <div
          className="projects-reel"
          ref={reelRef}
          aria-live="polite"
          onMouseEnter={handleReelMouseEnter}
          onMouseLeave={handleReelMouseLeave}
        >
          {loopedProjects.map((item) => {
            const itemClass = getReelItemClass(item.loopIndex);
            return (
              <div
                key={item.key}
                ref={(node) => setItemRef(item.loopIndex, node)}
                data-project-id={item.project.id}
                data-canonical-index={item.canonicalIndex}
                className={`projects-reel__item ${itemClass}`}
              >
                <ProjectCard
                  project={item.project}
                  playPreview={enableVideoPreviews && item.loopIndex === activeLoopIndex}
                />
              </div>
            );
          })}
        </div>

        {visibleProjects.length > 1 ? (
          <div className="projects-reel-dots" aria-label="Navigazione case study">
            {visibleProjects.map((project, index) => (
              <button
                key={project.id}
                type="button"
                className={`projects-reel-dot${index === activeCanonicalIndex ? " is-active" : ""}`}
                onClick={() => handleDotClick(index)}
                aria-label={`Vai al case study ${index + 1}: ${project.title}`}
                aria-pressed={index === activeCanonicalIndex}
              />
            ))}
          </div>
        ) : null}

      </div>
    </section>
  );
}
