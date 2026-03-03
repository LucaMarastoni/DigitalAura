import type { Project } from "../../data/projects";

type FeaturedProjectProps = {
  project: Project;
};

const isExternalHref = (href?: string) => Boolean(href && /^(https?:)?\/\//.test(href));

export function FeaturedProject({ project }: FeaturedProjectProps) {
  const primaryHref = project.caseStudyHref ?? project.url;
  const primaryExternal = isExternalHref(primaryHref);
  const hasSecondaryCta = Boolean(project.url && project.url !== primaryHref);

  return (
    <article className="featured-project">
      <div className="featured-project__media-wrap">
        <img
          className="featured-project__media"
          src={project.cover}
          alt={project.coverAlt}
          loading="lazy"
          decoding="async"
        />
      </div>

      <div className="featured-project__content">
        <span className="featured-project__eyebrow">Featured</span>
        <h3>{project.title}</h3>
        <p className="featured-project__description">{project.description}</p>

        <ul className="featured-project__tags">
          {project.tags.slice(0, 3).map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>

        {project.highlight ? (
          <p className="featured-project__result">
            <span>Risultato</span>
            {project.highlight}
          </p>
        ) : null}

        <div className="featured-project__actions">
          {primaryHref ? (
            <a
              className="projects-btn projects-btn--primary"
              href={primaryHref}
              target={primaryExternal ? "_blank" : undefined}
              rel={primaryExternal ? "noopener noreferrer" : undefined}
            >
              Scopri il caso studio
            </a>
          ) : null}

          {hasSecondaryCta ? (
            <a
              className="projects-btn projects-btn--ghost"
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Visita il sito
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}
