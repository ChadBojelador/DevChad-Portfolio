import React, { useEffect, useState } from 'react';
import '../Styles/DriftWall.css';

const cardPlacements = [
  { x: -15, y: 10, rotate: -8, delay: '0s' },
  { x: 16, y: -8, rotate: 7, delay: '-2.2s' },
  { x: -4, y: 22, rotate: 3, delay: '-4.6s' },
  { x: 23, y: 15, rotate: -5, delay: '-1.1s' },
];

function ProjectStoryDialog({ project, onClose }) {
  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  return (
    <div className="project-story-dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <article className={project.image ? 'project-story-dialog' : 'project-story-dialog project-story-dialog--no-image'} role="dialog" aria-modal="true" aria-label={`${project.title || 'Project'} details`} onMouseDown={(event) => event.stopPropagation()}>
        <button className="project-story-dialog-close" type="button" onClick={onClose} aria-label="Close project details">×</button>
        {project.image && <img className="project-story-dialog-image" src={project.image} alt={`${project.title || 'Project'} preview`} />}
        <div className="project-story-dialog-copy">
          {project.number && <p className="project-number">{project.number}</p>}
          <h2>{project.title || 'Untitled project'}</h2>
          <p>{project.details || project.summary}</p>
          {project.stack?.length > 0 && <ul className="tag-list">{project.stack.map((item) => <li key={item}>{item}</li>)}</ul>}
          {(project.github || project.liveDemo || project.caseStudy) && (
            <div className="project-links">
              {project.github && <a href={project.github} target="_blank" rel="noreferrer">GitHub ↗</a>}
              {project.liveDemo && <a href={project.liveDemo} target="_blank" rel="noreferrer">Live demo ↗</a>}
              {project.caseStudy && <a href={project.caseStudy} target="_blank" rel="noreferrer">Case study ↗</a>}
            </div>
          )}
        </div>
      </article>
    </div>
  );
}

function DriftWall({ projects, interactive = false }) {
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const [activeProject, setActiveProject] = useState(null);

  function updatePointer(event) {
    const bounds = event.currentTarget.getBoundingClientRect();
    setPointer({
      x: ((event.clientX - bounds.left) / bounds.width - 0.5) * 16,
      y: ((event.clientY - bounds.top) / bounds.height - 0.5) * 12,
    });
  }

  return (
    <div
      className="drift-wall"
      onPointerMove={updatePointer}
      onPointerLeave={() => setPointer({ x: 0, y: 0 })}
      style={{ '--pointer-x': `${pointer.x}px`, '--pointer-y': `${pointer.y}px` }}
    >
      <p className="drift-wall-hint">Drag your cursor across the wall</p>
      <div className="drift-wall-glow drift-wall-glow-one" />
      <div className="drift-wall-glow drift-wall-glow-two" />
      <div className="drift-wall-grid" aria-label="Project showcase">
        {projects.map((project, index) => {
          const placement = cardPlacements[index % cardPlacements.length];
          return (
            <article
              className={interactive ? 'drift-card is-interactive' : 'drift-card'}
              key={project.id || project.title}
              role={interactive ? 'button' : undefined}
              tabIndex={interactive ? 0 : undefined}
              aria-label={interactive ? `Open ${project.title || 'project'} details` : undefined}
              onClick={interactive ? () => setActiveProject(project) : undefined}
              onKeyDown={interactive ? (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  setActiveProject(project);
                }
              } : undefined}
              style={{
                '--card-x': `${placement.x}px`,
                '--card-y': `${placement.y}px`,
                '--card-rotate': `${placement.rotate}deg`,
                '--drift-delay': placement.delay,
              }}
            >
              <div className="drift-card-media">
                {project.image ? <img src={project.image} alt={`${project.title} preview`} /> : <span>✦</span>}
                <p>{project.image ? 'Project preview' : 'Preview incoming'}</p>
              </div>
              <div className="drift-card-content">
                <p className="project-number">{project.number}</p>
                <h3>{project.title}</h3>
                <p>{project.summary}</p>
                <ul className="tag-list">{project.stack.map((item) => <li key={item}>{item}</li>)}</ul>
                {interactive ? <span className="project-story-open">View project story <span aria-hidden="true">→</span></span> : (project.github || project.liveDemo || project.caseStudy) ? <div className="project-links">
                  {project.github && <a href={project.github}>GitHub ↗</a>}
                  {project.liveDemo && <a href={project.liveDemo}>Live demo ↗</a>}
                  {project.caseStudy && <a href={project.caseStudy}>Case study ↗</a>}
                </div> : <span className="coming-soon">Details coming soon</span>)}
              </div>
            </article>
          );
        })}
      </div>
      {activeProject && <ProjectStoryDialog project={activeProject} onClose={() => setActiveProject(null)} />}
    </div>
  );
}

export default DriftWall;
