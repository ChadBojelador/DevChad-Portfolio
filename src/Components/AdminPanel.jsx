import React from 'react';
import './AdminPanel.css';

const makeId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

function Field({ label, value, onChange, multiline = false, type = 'text', min, placeholder }) {
  const sharedProps = {
    value: value ?? '',
    onChange: (event) => onChange(event.target.value),
    placeholder,
  };

  return (
    <label className="admin-field">
      <span>{label}</span>
      {multiline ? <textarea {...sharedProps} rows="3" /> : <input {...sharedProps} type={type} min={min} />}
    </label>
  );
}

function AdminPanel({ content, onChange, onClose, onReset }) {
  const updateProject = (id, field, value) => {
    onChange((previous) => ({
      ...previous,
      projects: previous.projects.map((project) => project.id === id ? { ...project, [field]: value } : project),
    }));
  };

  const updateEarly = (collection, id, field, value) => {
    onChange((previous) => ({
      ...previous,
      earlyChapters: {
        ...previous.earlyChapters,
        [collection]: previous.earlyChapters[collection].map((item) => item.id === id ? { ...item, [field]: value } : item),
      },
    }));
  };

  const updatePresentation = (area, section, field, value) => {
    onChange((previous) => ({
      ...previous,
      presentation: {
        ...previous.presentation,
        [area]: {
          ...previous.presentation[area],
          [section]: {
            ...previous.presentation[area][section],
            [field]: value,
          },
        },
      },
    }));
  };

  const addProject = () => {
    onChange((previous) => ({
      ...previous,
      projects: [...previous.projects, {
        id: makeId('project'),
        number: String(previous.projects.length + 1).padStart(2, '0'),
        title: 'New project',
        summary: '',
        stack: [],
        image: '',
        github: '',
        liveDemo: '',
        caseStudy: '',
      }],
    }));
  };

  const addTimelineItem = () => {
    const nextOrder = Math.max(0, ...content.earlyChapters.timeline.map((item) => Number(item.order) || 0)) + 1;
    onChange((previous) => ({
      ...previous,
      earlyChapters: {
        ...previous.earlyChapters,
        timeline: [...previous.earlyChapters.timeline, {
          id: makeId('chapter'),
          order: nextOrder,
          eyebrow: `${String(nextOrder).padStart(2, '0')} · new chapter`,
          title: 'New chapter',
          description: '',
          image: '',
          alt: '',
        }],
      },
    }));
  };

  const addCarouselItem = () => {
    const nextOrder = Math.max(0, ...content.earlyChapters.carousel.map((item) => Number(item.order) || 0)) + 1;
    onChange((previous) => ({
      ...previous,
      earlyChapters: {
        ...previous.earlyChapters,
        carousel: [...previous.earlyChapters.carousel, {
          id: makeId('story'),
          order: nextOrder,
          image: '',
          alt: '',
        }],
      },
    }));
  };

  const removeItem = (collection, id) => {
    if (collection === 'projects') {
      onChange((previous) => ({
        ...previous,
        projects: previous.projects.filter((item) => item.id !== id),
      }));
      return;
    }

    onChange((previous) => ({
      ...previous,
      earlyChapters: {
        ...previous.earlyChapters,
        [collection]: previous.earlyChapters[collection].filter((item) => item.id !== id),
      },
    }));
  };

  return (
    <div className="admin-panel-backdrop" role="presentation" onMouseDown={onClose}>
      <aside className="admin-panel" role="dialog" aria-modal="true" aria-labelledby="admin-panel-title" onMouseDown={(event) => event.stopPropagation()}>
        <header className="admin-panel-header">
          <div>
            <p className="panel-label">Local editor</p>
            <h2 id="admin-panel-title">Admin controls</h2>
            <p>Changes are saved in this browser only.</p>
          </div>
          <button className="admin-close-button" type="button" onClick={onClose} aria-label="Close admin controls">×</button>
        </header>

        <div className="admin-panel-content">
          <section className="admin-section">
            <div className="admin-section-heading">
              <div>
                <p className="panel-label">Projects</p>
                <h3>Section and story presentation</h3>
              </div>
            </div>
            <article className="admin-editor-card">
              <div className="admin-editor-card-heading"><strong>Projects home section</strong></div>
              <div className="admin-field-grid">
                <Field label="Eyebrow" value={content.presentation.projects.home.eyebrow} onChange={(value) => updatePresentation('projects', 'home', 'eyebrow', value)} />
                <Field label="Action button label" value={content.presentation.projects.home.actionLabel} onChange={(value) => updatePresentation('projects', 'home', 'actionLabel', value)} />
              </div>
              <Field label="Title" value={content.presentation.projects.home.title} onChange={(value) => updatePresentation('projects', 'home', 'title', value)} />
              <Field label="Description" value={content.presentation.projects.home.description} onChange={(value) => updatePresentation('projects', 'home', 'description', value)} multiline />
              <div className="admin-field-grid">
                <Field label="Story image path or URL" value={content.presentation.projects.home.storyImage} onChange={(value) => updatePresentation('projects', 'home', 'storyImage', value)} />
                <Field label="Story image alt text" value={content.presentation.projects.home.storyImageAlt} onChange={(value) => updatePresentation('projects', 'home', 'storyImageAlt', value)} />
              </div>
              <Field label="Story image label" value={content.presentation.projects.home.storyLabel} onChange={(value) => updatePresentation('projects', 'home', 'storyLabel', value)} />
              <div className="admin-field-grid">
                <Field label="Learning image path or URL" value={content.presentation.projects.home.learningImage} onChange={(value) => updatePresentation('projects', 'home', 'learningImage', value)} />
                <Field label="Learning image alt text" value={content.presentation.projects.home.learningImageAlt} onChange={(value) => updatePresentation('projects', 'home', 'learningImageAlt', value)} />
              </div>
              <Field label="Learning image label" value={content.presentation.projects.home.learningLabel} onChange={(value) => updatePresentation('projects', 'home', 'learningLabel', value)} />
            </article>
            <article className="admin-editor-card">
              <div className="admin-editor-card-heading"><strong>Product stories page</strong></div>
              <div className="admin-field-grid">
                <Field label="Page eyebrow" value={content.presentation.projects.detail.eyebrow} onChange={(value) => updatePresentation('projects', 'detail', 'eyebrow', value)} />
                <Field label="Feature eyebrow" value={content.presentation.projects.storyFeature.eyebrow} onChange={(value) => updatePresentation('projects', 'storyFeature', 'eyebrow', value)} />
              </div>
              <Field label="Page title" value={content.presentation.projects.detail.title} onChange={(value) => updatePresentation('projects', 'detail', 'title', value)} />
              <Field label="Page description" value={content.presentation.projects.detail.description} onChange={(value) => updatePresentation('projects', 'detail', 'description', value)} multiline />
              <Field label="Feature title" value={content.presentation.projects.storyFeature.title} onChange={(value) => updatePresentation('projects', 'storyFeature', 'title', value)} />
              <Field label="Feature description" value={content.presentation.projects.storyFeature.description} onChange={(value) => updatePresentation('projects', 'storyFeature', 'description', value)} multiline />
              <div className="admin-field-grid">
                <Field label="Feature image path or URL" value={content.presentation.projects.storyFeature.image} onChange={(value) => updatePresentation('projects', 'storyFeature', 'image', value)} />
                <Field label="Feature image alt text" value={content.presentation.projects.storyFeature.imageAlt} onChange={(value) => updatePresentation('projects', 'storyFeature', 'imageAlt', value)} />
              </div>
            </article>
          </section>

          <section className="admin-section">
            <div className="admin-section-heading">
              <div>
                <p className="panel-label">Projects</p>
                <h3>Cards and project details</h3>
              </div>
              <button className="admin-add-button" type="button" onClick={addProject}>Add project</button>
            </div>
            {content.projects.map((project) => (
              <article className="admin-editor-card" key={project.id}>
                <div className="admin-editor-card-heading">
                  <strong>{project.title || 'Untitled project'}</strong>
                  <button className="admin-remove-button" type="button" onClick={() => removeItem('projects', project.id)}>Remove</button>
                </div>
                <div className="admin-field-grid">
                  <Field label="Number" value={project.number} onChange={(value) => updateProject(project.id, 'number', value)} />
                  <Field label="Title" value={project.title} onChange={(value) => updateProject(project.id, 'title', value)} />
                </div>
                <Field label="Summary" value={project.summary} onChange={(value) => updateProject(project.id, 'summary', value)} multiline />
                <Field label="Image path or URL" value={project.image} onChange={(value) => updateProject(project.id, 'image', value)} placeholder="/projects/example.jpg" />
                <Field label="Stack (comma separated)" value={project.stack.join(', ')} onChange={(value) => updateProject(project.id, 'stack', value.split(',').map((item) => item.trim()).filter(Boolean))} />
                <div className="admin-field-grid">
                  <Field label="GitHub URL" value={project.github} onChange={(value) => updateProject(project.id, 'github', value)} />
                  <Field label="Live demo URL" value={project.liveDemo} onChange={(value) => updateProject(project.id, 'liveDemo', value)} />
                </div>
                <Field label="Case study URL" value={project.caseStudy} onChange={(value) => updateProject(project.id, 'caseStudy', value)} />
              </article>
            ))}
          </section>

          <section className="admin-section">
            <div className="admin-section-heading">
              <div>
                <p className="panel-label">Early chapters</p>
                <h3>Section and roadmap page copy</h3>
              </div>
            </div>
            <article className="admin-editor-card">
              <div className="admin-editor-card-heading"><strong>Early chapters home section</strong></div>
              <div className="admin-field-grid">
                <Field label="Eyebrow" value={content.presentation.earlyChapters.home.eyebrow} onChange={(value) => updatePresentation('earlyChapters', 'home', 'eyebrow', value)} />
                <Field label="Action button label" value={content.presentation.earlyChapters.home.actionLabel} onChange={(value) => updatePresentation('earlyChapters', 'home', 'actionLabel', value)} />
              </div>
              <Field label="Title" value={content.presentation.earlyChapters.home.title} onChange={(value) => updatePresentation('earlyChapters', 'home', 'title', value)} />
              <Field label="Description" value={content.presentation.earlyChapters.home.description} onChange={(value) => updatePresentation('earlyChapters', 'home', 'description', value)} multiline />
            </article>
            <article className="admin-editor-card">
              <div className="admin-editor-card-heading"><strong>Roadmap page header</strong></div>
              <Field label="Eyebrow" value={content.presentation.earlyChapters.detail.eyebrow} onChange={(value) => updatePresentation('earlyChapters', 'detail', 'eyebrow', value)} />
              <Field label="Title" value={content.presentation.earlyChapters.detail.title} onChange={(value) => updatePresentation('earlyChapters', 'detail', 'title', value)} />
              <Field label="Description" value={content.presentation.earlyChapters.detail.description} onChange={(value) => updatePresentation('earlyChapters', 'detail', 'description', value)} multiline />
            </article>
          </section>

          <section className="admin-section">
            <div className="admin-section-heading">
              <div>
                <p className="panel-label">Early chapters</p>
                <h3>Roadmap entries</h3>
              </div>
              <button className="admin-add-button" type="button" onClick={addTimelineItem}>Add chapter</button>
            </div>
            <label className="admin-field admin-direction-field">
              <span>Display order</span>
              <select value={content.earlyChapters.direction} onChange={(event) => onChange((previous) => ({ ...previous, earlyChapters: { ...previous.earlyChapters, direction: event.target.value } }))}>
                <option value="descending">Newest first</option>
                <option value="ascending">Oldest first</option>
              </select>
            </label>
            {content.earlyChapters.timeline.map((item) => (
              <article className="admin-editor-card" key={item.id}>
                <div className="admin-editor-card-heading">
                  <strong>{item.title || 'Untitled chapter'}</strong>
                  <button className="admin-remove-button" type="button" onClick={() => removeItem('timeline', item.id)}>Remove</button>
                </div>
                <div className="admin-field-grid">
                  <Field label="Order" type="number" min="0" value={item.order} onChange={(value) => updateEarly('timeline', item.id, 'order', Number(value) || 0)} />
                  <Field label="Eyebrow" value={item.eyebrow} onChange={(value) => updateEarly('timeline', item.id, 'eyebrow', value)} />
                </div>
                <Field label="Title" value={item.title} onChange={(value) => updateEarly('timeline', item.id, 'title', value)} />
                <Field label="Description" value={item.description} onChange={(value) => updateEarly('timeline', item.id, 'description', value)} multiline />
                <Field label="Image path or URL" value={item.image} onChange={(value) => updateEarly('timeline', item.id, 'image', value)} placeholder="/early-chapters/example.jpg" />
                <Field label="Image alt text" value={item.alt} onChange={(value) => updateEarly('timeline', item.id, 'alt', value)} />
              </article>
            ))}
          </section>

          <section className="admin-section">
            <div className="admin-section-heading">
              <div>
                <p className="panel-label">Early chapters</p>
                <h3>Home story carousel</h3>
              </div>
              <button className="admin-add-button" type="button" onClick={addCarouselItem}>Add picture</button>
            </div>
            {content.earlyChapters.carousel.map((item) => (
              <article className="admin-editor-card" key={item.id}>
                <div className="admin-editor-card-heading">
                  <strong>Story {item.order}</strong>
                  <button className="admin-remove-button" type="button" onClick={() => removeItem('carousel', item.id)}>Remove</button>
                </div>
                <div className="admin-field-grid">
                  <Field label="Order" type="number" min="0" value={item.order} onChange={(value) => updateEarly('carousel', item.id, 'order', Number(value) || 0)} />
                  <Field label="Image alt text" value={item.alt} onChange={(value) => updateEarly('carousel', item.id, 'alt', value)} />
                </div>
                <Field label="Image path or URL" value={item.image} onChange={(value) => updateEarly('carousel', item.id, 'image', value)} placeholder="/early-chapters/example.jpg" />
              </article>
            ))}
          </section>
        </div>

        <footer className="admin-panel-footer">
          <button className="admin-reset-button" type="button" onClick={onReset}>Reset all local edits</button>
          <button className="admin-done-button" type="button" onClick={onClose}>Done</button>
        </footer>
      </aside>
    </div>
  );
}

export default AdminPanel;
