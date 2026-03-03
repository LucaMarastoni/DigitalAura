import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./process-cascade.css";

const steps = [
  {
    id: "01",
    title: "Analisi & Direzione",
    subtitle:
      "Non partiamo dal sito: partiamo da te. Capiamo dove vuoi arrivare e cosa deve funzionare davvero.",
    bullets: [
      "Audit rapido ma mirato",
      "Obiettivi concreti e KPI chiari",
      "Priorita reali e vincoli compresi",
    ],
    deliverable: "Output: direzione strategica chiara + roadmap operativa.",
  },
  {
    id: "02",
    title: "Architettura & Strategia Tecnica",
    subtitle:
      "Costruiamo le fondamenta prima di alzare i muri: struttura, stack e flussi devono sostenere crescita e conversioni.",
    bullets: [
      "Mappa pagine e flussi decisionali",
      "Scelte tecniche ragionate",
      "Roadmap per fasi sostenibile e scalabile",
    ],
    deliverable: "Output: architettura validata + piano esecutivo pronto a partire.",
  },
  {
    id: "03",
    title: "Design & Messaggio",
    subtitle:
      "Qui non abbelliamo: progettiamo per guidare l'utente verso un'azione concreta.",
    bullets: [
      "Wireframe essenziale, zero rumore",
      "Copy orientato alla conversione",
      "Gerarchia visiva che accompagna lo sguardo",
    ],
    deliverable: "Output: layout strategico + contenuti pronti per lo sviluppo.",
  },
  {
    id: "04",
    title: "Sviluppo Sito / CRM",
    subtitle:
      "Diamo forma concreta alla strategia: pulito, veloce, integrato.",
    bullets: [
      "Frontend responsive e performante",
      "Automazioni e logiche operative",
      "Integrazione strumenti e CRM",
    ],
    deliverable: "Output: sistema funzionante, stabile, pronto al test.",
  },
  {
    id: "05",
    title: "Tracking & Controllo Qualita",
    subtitle:
      "Se non misuri stai solo sperando. Noi misuriamo, testiamo e validiamo.",
    bullets: [
      "Event tracking configurato correttamente",
      "Test funzionali e di usabilita",
      "Performance sotto controllo",
    ],
    deliverable: "Output: setup misurabile + checklist QA completata.",
  },
  {
    id: "06",
    title: "Go-Live & Crescita Continua",
    subtitle: "Il lancio non e la fine: e l'inizio.",
    bullets: [
      "Deploy controllato",
      "Primo report con dati reali",
      "Iterazioni prioritarie basate sui numeri",
    ],
    deliverable: "Output: rilascio stabile + piano di ottimizzazione continuo.",
  },
];

const OBSERVER_THRESHOLDS = [0, 0.2, 0.35, 0.5, 0.7, 0.9];

const getNextActiveIndex = (elements, ratios) => {
  const viewportMid = window.innerHeight * 0.45;
  let bestIndex = 0;
  let bestRatio = -1;
  let bestDistance = Number.POSITIVE_INFINITY;

  elements.forEach((element, index) => {
    if (!element) {
      return;
    }

    const ratio = ratios.get(index) ?? 0;
    const rect = element.getBoundingClientRect();
    const center = rect.top + rect.height / 2;
    const distance = Math.abs(center - viewportMid);

    if (ratio > bestRatio + 0.01 || (Math.abs(ratio - bestRatio) <= 0.01 && distance < bestDistance)) {
      bestIndex = index;
      bestRatio = ratio;
      bestDistance = distance;
    }
  });

  return bestIndex;
};

export default function ProcessCascade() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [visibleSteps, setVisibleSteps] = useState(() => steps.map((_, index) => index === 0));
  const cardRefs = useRef([]);
  const ratioMapRef = useRef(new Map());

  const progressPercent = useMemo(() => {
    if (steps.length <= 1) {
      return 0;
    }
    return (activeIndex / (steps.length - 1)) * 100;
  }, [activeIndex]);

  useEffect(() => {
    const elements = cardRefs.current.filter(Boolean);
    if (!elements.length) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = Number(entry.target.getAttribute("data-step-index"));
          if (Number.isNaN(index)) {
            return;
          }

          ratioMapRef.current.set(index, entry.isIntersecting ? entry.intersectionRatio : 0);

          if (entry.isIntersecting && entry.intersectionRatio > 0.12) {
            setVisibleSteps((previous) => {
              if (previous[index]) {
                return previous;
              }
              const next = [...previous];
              next[index] = true;
              return next;
            });
          }
        });

        const nextActive = getNextActiveIndex(cardRefs.current, ratioMapRef.current);
        setActiveIndex((previous) => (previous === nextActive ? previous : nextActive));
      },
      {
        root: null,
        threshold: OBSERVER_THRESHOLDS,
        rootMargin: "-18% 0px -32% 0px",
      },
    );

    elements.forEach((element) => observer.observe(element));

    return () => {
      observer.disconnect();
    };
  }, []);

  const setCardRef = useCallback(
    (index) => (node) => {
      cardRefs.current[index] = node;
    },
    [],
  );

  const scrollToStep = useCallback((index) => {
    const element = cardRefs.current[index];
    if (!element) {
      return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    element.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "center",
      inline: "nearest",
    });
    setActiveIndex(index);
  }, []);

  return (
    <section className="process-cascade" aria-label="Processo operativo">
      <div className="process-cascade__layout">
        <aside className="process-cascade__rail" aria-label="Navigazione step">
          <div className="process-cascade__rail-track" aria-hidden="true">
            <span className="process-cascade__rail-line" />
            <span className="process-cascade__rail-fill" style={{ "--process-progress": `${progressPercent}%` }} />
          </div>

          <ol className="process-cascade__dots" role="list">
            {steps.map((step, index) => {
              const isActive = index === activeIndex;
              return (
                <li key={step.id} className="process-cascade__dot-item">
                  <button
                    type="button"
                    className={`process-cascade__dot ${isActive ? "is-active" : ""}`}
                    aria-label={`Vai allo step ${step.id}: ${step.title}`}
                    aria-pressed={isActive}
                    onClick={() => scrollToStep(index)}
                  >
                    <span className="process-cascade__dot-core" aria-hidden="true" />
                  </button>
                  <span className="process-cascade__dot-label" aria-hidden="true">
                    {step.id}
                  </span>
                </li>
              );
            })}
          </ol>
        </aside>

        <div className="process-cascade__cards">
          {steps.map((step, index) => {
            const isActive = index === activeIndex;
            const isVisible = visibleSteps[index];

            return (
              <article
                key={step.id}
                ref={setCardRef(index)}
                data-step-index={index}
                className={[
                  "process-cascade__card",
                  "glass-card",
                  isVisible ? "is-visible" : "is-hidden",
                  isActive ? "is-active" : "is-inactive",
                ].join(" ")}
              >
                <header className="process-cascade__card-head">
                  <p className="process-cascade__step-id">Step {step.id}</p>
                  <h3>{step.title}</h3>
                  <p className="process-cascade__subtitle">{step.subtitle}</p>
                </header>

                <ul className="process-cascade__bullets">
                  {step.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>

                <p className="process-cascade__deliverable">{step.deliverable}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
