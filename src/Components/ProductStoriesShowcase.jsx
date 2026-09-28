import React from 'react';
import '../Styles/ProductStoriesPage.css';

function isRealProject(project) {
  if (project?.placeholder) return true;
  if (!project?.title) return false;
  const content = `${project.title} ${project.summary || ''}`.toLowerCase();
  return project.title.toLowerCase() !== 'project two'
    && !content.includes('future home for an experiment');
}

function StoryLinks({ project }) {
  if (!project.github && !project.liveDemo && !project.caseStudy) return null;

  return (
    <div className="product-story-links">
      {project.github && <a href={project.github} target="_blank" rel="noreferrer">GitHub ↗</a>}
      {project.liveDemo && <a href={project.liveDemo} target="_blank" rel="noreferrer">Live demo ↗</a>}
      {project.caseStudy && <a href={project.caseStudy} target="_blank" rel="noreferrer">View project story →</a>}
    </div>
  );
}

function ProductStoriesShowcase({ featuredProject, screens, projects, onOpenFeatured, emailHref }) {
  const visibleProjects = projects
    .filter(isRealProject)
    .filter((project) => project.title !== featuredProject.title);
  const [primaryScreen, ...supportingScreens] = screens.slice(1);

  return (
    <>
      <section className="product-stories-featured" aria-labelledby="product-stories-title">
        <div className="product-stories-visual glass-panel">
          <figure className="product-stories-visual-primary">
            <img src={primaryScreen.src} alt={primaryScreen.alt} />
          </figure>
          <div className="product-stories-visual-rail" aria-label="Additional GInsights screens">
            {supportingScreens.slice(0, 2).map((screen) => (
              <figure key={screen.src}>
                <img src={screen.src} alt={screen.alt} loading="lazy" />
              </figure>
            ))}
          </div>
        </div>

        <article className="product-stories-feature-copy glass-panel">
          <div className="product-stories-feature-heading">
            <p className="eyebrow">{featuredProject.eyebrow}</p>
            {featuredProject.metadata?.length > 0 && (
              <ul className="product-stories-metadata" aria-label="Project context">
                {featuredProject.metadata.map((item) => <li key={item}>{item}</li>)}
              </ul>
            )}
          </div>
          <h2 id="product-stories-title">{featuredProject.title}</h2>
          <p className="product-stories-feature-description">{featuredProject.description}</p>
          {featuredProject.solution && (
            <div className="product-stories-feature-solution">
              <h3>What it delivers</h3>
              <p>{featuredProject.solution}</p>
            </div>
          )}
          {featuredProject.stack?.length > 0 && (
            <ul className="product-stories-tags" aria-label="GInsights technologies">
              {featuredProject.stack.map((item) => <li key={item}>{item}</li>)}
            </ul>
          )}
          <button className="product-stories-primary-action" type="button" onClick={onOpenFeatured}>
            View project story <span aria-hidden="true">→</span>
          </button>
        </article>
      </section>

      <section className="more-product-stories" aria-labelledby="more-product-stories-title">
        <header className="more-product-stories-heading">
          <p className="eyebrow">Supporting work</p>
          <h2 id="more-product-stories-title">More product stories</h2>
          <p>Projects, systems, and experiments I&apos;ve built along the way.</p>
        </header>
        <div className={`more-product-stories-grid${visibleProjects.length === 1 ? ' is-single' : ''}`}>
          {visibleProjects.map((project) => {
            const hasStory = Boolean(project.github || project.liveDemo || project.caseStudy);
            return (
              <article className="product-story-card glass-panel" key={project.id || project.title}>
                <div className={project.image ? 'product-story-card-media has-image' : 'product-story-card-media'}>
                  {project.image ? (
                    <img src={project.image} alt={`${project.title} preview`} loading="lazy" />
                  ) : (
                    <>
                      <span>{project.number || '—'}</span>
                      {project.stack?.length > 0 && <small>{project.stack.slice(0, 2).join(' + ')}</small>}
                    </>
                  )}
                </div>
                <div className="product-story-card-copy">
                  {project.number && <p className="project-number">{project.number}</p>}
                  <h3>{project.title}</h3>
                  {project.summary && <p>{project.summary}</p>}
                  {project.stack?.length > 0 && (
                    <ul className="product-stories-tags">
                      {project.stack.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                  )}
                  {hasStory ? <StoryLinks project={project} /> : (
                    <div className="product-story-coming-soon">
                      <span>Coming soon</span>
                      <p>Case study currently being documented.</p>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {emailHref && (
        <section className="product-stories-closing" aria-label="Contact Chad">
          <p>Have something worth building?</p>
          <a href={emailHref}>Let&apos;s talk <span aria-hidden="true">→</span></a>
        </section>
      )}
    </>
  );
}

export default ProductStoriesShowcase;
