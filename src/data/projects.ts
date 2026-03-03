export type ProjectCategory =
  | "Ristorazione"
  | "Turismo"
  | "Community"
  | "Artigianato"
  | "Software"
  | "Intrattenimento"
  | "Streetwear";

export type Project = {
  id: string;
  title: string;
  category: ProjectCategory;
  cover: string;
  previewVideo?: string;
  previewPoster?: string;
  coverAlt: string;
  description: string;
  tags: string[];
  ctaLabel?: string;
  url?: string;
  caseStudyHref?: string;
  highlight?: string;
  featured?: boolean;
};

const withBase = (path: string): string => {
  const base = (import.meta.env.BASE_URL || "/").replace(/\/?$/, "/");
  return `${base}${path.replace(/^\//, "")}`;
};

export const projects: Project[] = [
  {
    id: "project-albatros",
    title: "Albatros Tropea Noleggio",
    category: "Turismo",
    cover: withBase("logos/albatros_logo.png"),
    previewVideo: withBase("video/Albatros.mp4"),
    previewPoster: withBase("image/albatros.png"),
    coverAlt: "Brand Albatros Tropea Noleggio",
    description:
      "Sito per noleggio gommoni ed escursioni a Tropea con booking online e gestione richieste semplificata.",
    tags: ["Booking engine", "Landing multilingua", "Lead automation"],
    url: "https://lucamarastoni.github.io/Albatros-Tropea-Noleggio/",
    caseStudyHref: "#case-study-albatros",
    highlight: "Booking online integrato con gestione richieste semplificata.",
  },
  {
    id: "project-37100",
    title: "37100 Club",
    category: "Community",
    cover: withBase("logos/37100club_logo.jpeg"),
    previewVideo: withBase("video/37100club.mp4"),
    previewPoster: withBase("image/37100club.png"),
    coverAlt: "Brand 37100 Club",
    description:
      "Hub community con eventi, ticketing e marketplace dell'usato in un flusso unico.",
    tags: ["Gestione eventi", "Marketplace circolare", "Meccaniche di gioco"],
    url: "https://37100club.it",
    caseStudyHref: "#case-study-37100-club",
    highlight: "Calendario eventi e ticketing in un unico hub community.",
  },
  {
    id: "project-martylab",
    title: "Martylab",
    category: "Artigianato",
    cover: withBase("logos/martylab_logo.jpg"),
    previewVideo: withBase("video/anna.mp4"),
    previewPoster: withBase("image/martylab.png"),
    coverAlt: "Brand Martylab",
    description:
      "Esperienza digitale per laboratorio artigianale con catalogo, gallery e richieste personalizzate.",
    tags: ["Shop personalizzato", "Gallery prodotto", "Richieste su misura"],
    url: "https://martylab.it",
    caseStudyHref: "#case-study-martylab",
    highlight: "Richieste personalizzate centralizzate in un flusso unico.",
  },
  {
    id: "project-pizzaparty",
    title: "Pizza Party VR",
    category: "Ristorazione",
    cover: withBase("logos/pizzaparty_logo.png"),
    previewVideo: withBase("video/pizzapartyvr.mp4"),
    previewPoster: withBase("image/pizzaparty.png"),
    coverAlt: "Brand Pizza Party VR",
    description:
      "Sito e funnel locale per pizzeria con menu digitale, prenotazioni integrate e campagne Google Ads.",
    tags: ["Brand identity", "Menu digitale", "Google Ads locali"],
    url: "https://www.pizzapartyvr.it",
    caseStudyHref: "#case-study-pizza-party",
    highlight: "Prenotazioni integrate e campagne locali coordinate.",
  },
  {
    id: "project-vaulted",
    title: "Vaulted",
    category: "Streetwear",
    cover: withBase("logos/vaulted_logo.png"),
    previewVideo: withBase("video/vaulted.mp4"),
    previewPoster: withBase("image/vaulted.png"),
    coverAlt: "Brand Vaulted",
    description:
      "Vetrina streetwear con lookbook e percorso diretto verso l'acquisto.",
    tags: ["Lookbook editoriale", "Calendario drop", "Lead wholesale"],
    url: "https://lucamarastoni.github.io/Vaulted/",
    caseStudyHref: "#case-study-vaulted",
    highlight: "Lookbook editoriale con percorso diretto verso l'acquisto.",
  },
  {
    id: "project-terra-sushi",
    title: "Terra Sushi",
    category: "Ristorazione",
    cover: withBase("logos/terrasushi_logo.png"),
    previewVideo: withBase("video/terrasushi.mp4"),
    previewPoster: withBase("image/terrasushi.png"),
    coverAlt: "Brand Terra Sushi",
    description:
      "Sito vetrina orientato alla prenotazione con menu, location e contatti chiari.",
    tags: ["Brand identity", "Menu in evidenza", "Prenotazioni rapide"],
    url: "https://terrasushivr.it",
    caseStudyHref: "#case-study-terra-sushi",
    highlight: "Percorso orientato alla prenotazione con menu e contatti chiari.",
  },
  {
    id: "project-miclab",
    title: "MICLAB",
    category: "Intrattenimento",
    cover: withBase("logos/miclab_logo.jpg"),
    previewVideo: withBase("video/miclab.mp4"),
    previewPoster: withBase("image/miclab.png"),
    coverAlt: "Brand MICLAB",
    description:
      "Landing episodica per progetto musicale con teaser, lore e distribuzione multi-piattaforma.",
    tags: ["Sound design", "Storytelling", "Landing episodica"],
    url: "https://miclab.it",
    caseStudyHref: "#case-study-miclab",
    highlight: "Distribuzione multi-piattaforma con storytelling episodico.",
  },
  {
    id: "project-piuma",
    title: "Piuma | CRM per la ristorazione",
    category: "Software",
    cover: withBase("image/software.png"),
    coverAlt: "Anteprima CRM Piuma per pizzerie take-away e delivery",
    description:
      "Gestionale cassa per take-away e delivery con ordini rapidi, extra ingredienti e coordinamento rider.",
    tags: ["Ordini e comande", "Gestione ingredienti", "Tracking rider"],
    ctaLabel: "Richiedi info",
    caseStudyHref: "#contact",
    highlight: "Flussi guidati per ordini e delivery planner anche offline.",
    featured: true,
  },
];
