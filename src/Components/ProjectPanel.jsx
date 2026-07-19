import { useId, useState } from 'react';

function ProjectPanel({ title, description, details, picture, link, githubLink, tags = [], projectIndex }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const detailsId = useId();

  return (
    <article className="project-card">
      {picture && <img className="project-card__image" src={picture} alt={`${title} preview`} />}
      <div className="project-card__content">
        <span className="card-index">{String(projectIndex + 1).padStart(2, '0')}</span>
        <h2>{title}</h2>
        <p>{description}</p>
        <div className="tag-list">
          {tags.map((tag) => <span key={tag} className="tag">{tag}</span>)}
        </div>

        <button
          type="button"
          className="text-button"
          onClick={() => setIsExpanded((value) => !value)}
          aria-expanded={isExpanded}
          aria-controls={detailsId}
        >
          {isExpanded ? 'Hide details' : 'Read details'}
        </button>

        {isExpanded && (
          <div id={detailsId} className="project-card__details">
            <p>{details}</p>
            <div className="inline-actions">
              {githubLink && <a href={githubLink} target="_blank" rel="noopener noreferrer">View source <span aria-hidden="true">↗</span></a>}
              {link && <a href={link} target="_blank" rel="noopener noreferrer">Live demo <span aria-hidden="true">↗</span></a>}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

export default ProjectPanel;
