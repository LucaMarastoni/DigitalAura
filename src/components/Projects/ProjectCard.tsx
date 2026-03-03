import type { Project } from "../../data/projects";

type ProjectCardProps = {
  project: Project;
  playPreview?: boolean;
};

const isExternalHref = (href?: string) => Boolean(href && /^(https?:)?\/\//.test(href));

export function ProjectCard({ project, playPreview = false }: ProjectCardProps) {
  const href = project.url ?? project.caseStudyHref;
  const ctaLabel = project.ctaLabel ?? (project.url ? "Visita il sito" : "Vedi progetto");
  const external = isExternalHref(href);
  const shouldRenderVideo = Boolean(project.previewVideo && playPreview);
  const previewImage = project.previewPoster ?? project.cover;

  return (
    <article id={project.id} className="project-card">
      <div className="project-card__media-wrap">
        {shouldRenderVideo ? (
          <video
            className="project-card__media"
            autoPlay
            muted
            playsInline
            loop
            preload="metadata"
            poster={previewImage}
            aria-hidden="true"
          >
            <source src={project.previewVideo!} type="video/mp4" />
            Il tuo browser non supporta i video HTML5.
          </video>
        ) : (
          <img
            className="project-card__media"
            src={previewImage}
            alt={project.coverAlt}
            loading="lazy"
            decoding="async"
          />
        )}
      </div>

      <div className="project-card__content">
        <h3>{project.title}</h3>
        <p className="project-card__description">{project.description}</p>

        {href ? (
          <a
            className="project-card__cta"
            href={href}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
          >
            {ctaLabel}
          </a>
        ) : null}
      </div>
    </article>
  );
}
