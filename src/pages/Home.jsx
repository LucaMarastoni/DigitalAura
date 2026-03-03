import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";
import ContactSection from "../components/Contact/ContactSection";
import ProcessCascade from "../components/ProcessCascade/ProcessCascade";
import { ProjectsSection } from "../components/Projects/ProjectsSection";
import RotatingText from "../components/TextType/RotatingText";
import ScrollReveal from "../components/ScrollReveal/ScrollReveal";
import homeBodyRaw from "../content/home-body.html?raw";
import { withBaseAssetPaths } from "../utils/legacyHtml";

const homeBody = withBaseAssetPaths(
  homeBodyRaw
  .replace(/<span\s+class="swap-word"[\s\S]*?<\/span>/i, '<span id="hero-texttype-root" class="text-type-slot"></span>')
  .replace(/<canvas id="stars-bg"[^>]*><\/canvas>\s*/i, "")
  .replace(/<script[^>]*src="\.\/assets\/stars-bg\.js"[^>]*><\/script>\s*/i, "")
  .replace(/<script[^>]*src="\.\/scripts\.js"[^>]*><\/script>\s*/i, "")
  .replace(/<header class="header">[\s\S]*?<\/header>\s*/i, "")
  .replace(/href="#(?!\/)([^"]+)"/g, 'href="#/?section=$1"'),
);

const HEADER_OFFSET_PX = 72;

const scrollToRequestedSection = (sectionId) => {
  const section = document.getElementById(sectionId);
  if (!section) {
    return;
  }

  const targetTop = Math.max(
    0,
    section.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET_PX,
  );
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduceMotion) {
    window.scrollTo({ top: targetTop, behavior: "auto" });
    return;
  }

  window.scrollTo({ top: targetTop, behavior: "smooth" });
};

export default function Home() {
  const location = useLocation();
  const [titleTextMount, setTitleTextMount] = useState(null);
  const [subtitleRevealMount, setSubtitleRevealMount] = useState(null);
  const [processCascadeMount, setProcessCascadeMount] = useState(null);
  const [projectsSectionMount, setProjectsSectionMount] = useState(null);
  const [contactSectionMount, setContactSectionMount] = useState(null);

  const html = useMemo(() => homeBody, []);

  useEffect(() => {
    document.body.classList.remove("crm-page");
    document.title = "Luca Marastoni | Siti Web, CRM e Google Ads";
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const section = params.get("section");

    if (section) {
      requestAnimationFrame(() => scrollToRequestedSection(section));
      return;
    }

    window.scrollTo({ top: 0, behavior: "auto" });
  }, [location.search]);

  useEffect(() => {
    setTitleTextMount(document.getElementById("hero-texttype-root"));
    setSubtitleRevealMount(document.getElementById("hero-scroll-reveal-root"));
    setProcessCascadeMount(document.getElementById("process-scroll-triggered-root"));
    setProjectsSectionMount(document.getElementById("projects-section-root"));
    setContactSectionMount(document.getElementById("contact-section-root"));
  }, [html, location.pathname]);

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: html }} />
      {titleTextMount
        ? createPortal(
            <RotatingText
              texts={["WEB", "DIGITAL", "CRM", "ADS", "GROWTH"]}
              mainClassName="hero-rotating-text"
              splitLevelClassName="hero-rotating-word"
              elementLevelClassName="hero-rotating-char"
              staggerFrom="last"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-120%" }}
              staggerDuration={0.02}
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
              rotationInterval={2200}
            />,
            titleTextMount,
          )
        : null}
      {subtitleRevealMount
        ? createPortal(
            <ScrollReveal
              containerClassName="hero-scroll-reveal"
              textClassName="hero-scroll-reveal-text"
              baseOpacity={0.15}
              enableBlur
              baseRotation={2}
              blurStrength={3}
              rotationStart="top 72%"
              rotationEnd="top 38%"
              wordAnimationStart="top 72%"
              wordAnimationEnd="top 38%"
            >
              Costruiamo sistemi digitali, siti e CRM su misura, insieme a campagne Google Ads orientate ai contatti qualificati, per trasformare traffico e processi in risultati concreti, misurabili e sostenibili nel tempo.
            </ScrollReveal>,
            subtitleRevealMount,
          )
        : null}
      {processCascadeMount
        ? createPortal(<ProcessCascade />, processCascadeMount)
        : null}
      {projectsSectionMount
        ? createPortal(<ProjectsSection />, projectsSectionMount)
        : null}
      {contactSectionMount
        ? createPortal(<ContactSection />, contactSectionMount)
        : null}
    </>
  );
}
