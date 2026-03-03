import { useEffect, useMemo, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./ScrollReveal.css";

gsap.registerPlugin(ScrollTrigger);

export default function ScrollReveal({
  children,
  scrollContainerRef,
  enableBlur = true,
  baseOpacity = 0.1,
  baseRotation = 3,
  blurStrength = 4,
  containerClassName = "",
  textClassName = "",
  rotationStart = "top bottom",
  rotationEnd = "bottom bottom",
  wordAnimationStart = "top bottom-=20%",
  wordAnimationEnd = "bottom bottom",
}) {
  const containerRef = useRef(null);

  const splitText = useMemo(() => {
    if (typeof children !== "string") {
      return children;
    }

    return children.split(/(\s+)/).map((word, index) => {
      if (/^\s+$/.test(word)) {
        return word;
      }

      return (
        <span className="scroll-reveal-word" key={index}>
          {word}
        </span>
      );
    });
  }, [children]);

  useEffect(() => {
    const root = containerRef.current;
    if (!root || typeof children !== "string") {
      return;
    }

    const words = root.querySelectorAll(".scroll-reveal-word");
    if (!words.length) {
      return;
    }

    const scroller = scrollContainerRef?.current || undefined;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        root,
        { transformOrigin: "0% 50%", rotate: baseRotation },
        {
          rotate: 0,
          ease: "none",
          scrollTrigger: {
            trigger: root,
            scroller,
            start: rotationStart,
            end: rotationEnd,
            scrub: true,
          },
        },
      );

      gsap.fromTo(
        words,
        {
          opacity: baseOpacity,
          filter: enableBlur ? `blur(${blurStrength}px)` : "blur(0px)",
          willChange: "opacity, filter",
        },
        {
          opacity: 1,
          filter: "blur(0px)",
          ease: "none",
          stagger: 0.05,
          scrollTrigger: {
            trigger: root,
            scroller,
            start: wordAnimationStart,
            end: wordAnimationEnd,
            scrub: true,
          },
        },
      );
    }, root);

    requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      ctx.revert();
    };
  }, [
    baseOpacity,
    baseRotation,
    blurStrength,
    children,
    enableBlur,
    rotationStart,
    rotationEnd,
    scrollContainerRef,
    wordAnimationStart,
    wordAnimationEnd,
  ]);

  return (
    <div ref={containerRef} className={`scroll-reveal ${containerClassName}`.trim()}>
      <p className={`scroll-reveal-text ${textClassName}`.trim()}>{splitText}</p>
    </div>
  );
}
