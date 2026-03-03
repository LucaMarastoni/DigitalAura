import { motion } from "motion/react";
import "./process-scroll-triggered.css";

const BASE_URL = import.meta.env.BASE_URL || "/";

const processCards = [
  {
    key: "kickoff",
    label: "Step 01",
    icon: "🧭",
    title: "Kickoff strategico",
    description:
      "Allineiamo obiettivi, priorita e KPI, cosi ogni attivita nasce con una direzione chiara.",
    detail:
      "Definiamo scope, priorita operative e milestones, cosi il team sa sempre cosa fare e in quale ordine.",
    output: "Scope condiviso, roadmap e piano esecutivo approvato.",
    tintA: "#1d2533",
    tintB: "#2c3a50",
  },
  {
    key: "execution",
    label: "Step 02",
    icon: "⚙️",
    title: "Sviluppo e validazione",
    description:
      "Costruiamo in sprint brevi, condividiamo avanzamenti e testiamo ogni rilascio prima del go-live.",
    detail:
      "Ogni settimana lavoriamo su feedback reali, cosi riduciamo gli errori e manteniamo alta la velocita di consegna.",
    output: "Avanzamento trasparente, test continui e decisioni rapide.",
    tools: true,
    tintA: "#212c3e",
    tintB: "#364864",
  },
  {
    key: "launch",
    label: "Step 03",
    icon: "🚀",
    title: "Lancio e ottimizzazione",
    description:
      "Monitoriamo performance reali, interveniamo sui colli di bottiglia e iteriamo per migliorare conversione e operativita.",
    detail:
      "Dopo il rilascio seguiamo KPI tecnici e business, con azioni di ottimizzazione su UX, funnel e acquisizione.",
    output: "Rilascio stabile, monitoraggio e miglioramento continuo.",
    tintA: "#253348",
    tintB: "#425777",
  },
];

const cardVariants = {
  offscreen: {
    y: 220,
    rotate: 0,
    opacity: 0.86,
  },
  onscreen: (index) => ({
    y: 22,
    rotate: index % 2 === 0 ? -6 : 6,
    opacity: 1,
    transition: {
      type: "spring",
      bounce: 0.32,
      duration: 0.85,
      delay: index * 0.06,
    },
  }),
};

export default function ProcessScrollTriggered() {
  return (
    <div className="process-scroll-triggered">
      {processCards.map((card, index) => {
        const background = `linear-gradient(306deg, ${card.tintA}, ${card.tintB})`;

        return (
          <motion.div
            key={card.key}
            className={`process-card-container process-card-container-${index}`}
            initial="offscreen"
            whileInView="onscreen"
            viewport={{ amount: 0.55, once: false }}
          >
            <div className="process-card-splash" style={{ background }} aria-hidden="true" />
            <motion.article
              className="process-card"
              variants={cardVariants}
              custom={index}
              aria-label={`${card.label}: ${card.title}`}
            >
              <span className="process-card-label">{card.label}</span>
              <span className="process-card-icon" aria-hidden="true">
                {card.icon}
              </span>
              <h3>{card.title}</h3>
              <p className="process-card-description">{card.description}</p>
              <p className="process-card-detail">{card.detail}</p>
              {card.tools ? (
                <div className="process-card-tools" role="group" aria-label="Workspace condiviso su Notion e Trello">
                  <span className="process-card-tools-label">Workspace condiviso:</span>
                  <span className="process-card-tool-logo">
                    <img src={`${BASE_URL}image/notion.png`} alt="Notion" loading="lazy" decoding="async" />
                  </span>
                  <span className="process-card-tool-logo">
                    <img src={`${BASE_URL}image/trello.png`} alt="Trello" loading="lazy" decoding="async" />
                  </span>
                </div>
              ) : null}
              <p className="process-card-output">
                <span>Output:</span> {card.output}
              </p>
            </motion.article>
          </motion.div>
        );
      })}
    </div>
  );
}
