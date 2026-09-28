import React from 'react';
import '../Styles/ProjectShowcase.css';

function ProjectLinks({ project, onOpenCaseStudy }) {
  if (!project.github && !project.liveDemo && !project.caseStudy && !onOpenCaseStudy) return null;

  return (
    <div className="project-showcase-links">
      {project.github && <a href={project.github} target="_blank" rel="noreferrer">GitHub ↗</a>}
      {project.liveDemo && <a href={project.liveDemo} target="_blank" rel="noreferrer">Live demo ↗</a>}
      {onOpenCaseStudy ? (
        <button type="button" onClick={onOpenCaseStudy}>View case study <span aria-hidden="true">→</span></button>
      ) : project.caseStudy ? (
        <a href={project.caseStudy} target="_blank" rel="noreferrer">Case study ↗</a>
      ) : null}
    </div>
  );
}

function ProjectMeta({ project }) {
  if (!project.role && !project.contribution && !project.result) return null;

  return (
    <dl className="project-showcase-meta">
      {(project.role || project.contribution) && (
        <div>
          <dt>Contribution</dt>
          <dd>{project.role || project.contribution}</dd>
        </div>
      )}
      {project.result && (
        <div>
          <dt>Result</dt>
          <dd>{project.result}</dd>
        </div>
      )}
    </dl>
  );
}

function isPortfolioReady(project) {
  if (!project?.title) return false;
  const content = `${project.title} ${project.summary || ''}`.toLowerCase();
  return !content.includes('future home for an experiment');
}

function ProjectShowcase({ featuredProject, projects, onOpenFeatured }) {
  const secondaryProjects = projects
    .filter(isPortfolioReady)
    .filter((project) => project.title !== featuredProject.title);
  const featuredSummary = featuredProject.problem || featuredProject.summary || featuredProject.description;
  const featuredSolution = featuredProject.solution || featuredProject.details;

  return (
    <div className="project-showcase">
      <article className="project-showcase-feature glass-panel magnetic-bento-card">
        <div className="project-showcase-feature-media">
          {featuredProject.image ? (
            <img src={featuredProject.image} alt={featuredProject.imageAlt || `${featuredProject.title} preview`} loading="lazy" />
          ) : (
            <div className="project-showcase-placeholder" aria-label="Project visual coming soon"><span>✦</span></div>
          )}
          <span className="project-showcase-feature-label">Featured project</span>
        </div>
        <div className="project-showcase-feature-copy">
          <p className="project-number">{featuredProject.number || '01'}</p>
          <h3>{featuredProject.title}</h3>
          {featuredSummary && <p className="project-showcase-lead">{featuredSummary}</p>}
          {featuredSolution && featuredSolution !== featuredSummary && (
            <div className="project-showcase-detail">
              <h4>Solution</h4>
              <p>{featuredSolution}</p>
            </div>
          )}
          {featuredProject.stack?.length > 0 && (
            <ul className="tag-list" aria-label={`${featuredProject.title} technology stack`}>
              {featuredProject.stack.map((item) => <li key={item}>{item}</li>)}
            </ul>
          )}
          <ProjectMeta project={featuredProject} />
          <ProjectLinks project={featuredProject} onOpenCaseStudy={onOpenFeatured} />
        </div>
      </article>

      {secondaryProjects.length > 0 && (
        <section className="project-showcase-secondary" aria-labelledby="secondary-projects-title">
          <header className="project-showcase-secondary-heading">
            <p>Secondary projects</p>
            <h3 id="secondary-projects-title">More engineering work</h3>
          </header>
          <div className="project-showcase-secondary-grid">
            {secondaryProjects.map((project) => (
              <article className="project-showcase-card glass-panel magnetic-bento-card" key={project.id || project.title}>
                <div className="project-showcase-card-media">
                  {project.image ? <img src={project.image} alt={`${project.title} preview`} loading="lazy" /> : <span>{project.number || '—'}</span>}
                </div>
                <div className="project-showcase-card-copy">
                  {project.number && <p className="project-number">{project.number}</p>}
                  <h4>{project.title}</h4>
                  {project.summary && <p>{project.summary}</p>}
                  {project.stack?.length > 0 && <ul className="tag-list">{project.stack.map((item) => <li key={item}>{item}</li>)}</ul>}
                  <ProjectMeta project={project} />
                  <ProjectLinks project={project} />
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default ProjectShowcase;
