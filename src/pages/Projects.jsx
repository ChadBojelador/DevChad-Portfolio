import ProjectPanel from '../Components/ProjectPanel';
import { projects } from '../data/projects';

function Projects() {
  return (
    <div className="page">
      <header className="page-header">
        <p className="page-eyebrow">Selected work</p>
        <h1>Projects that make an idea concrete.</h1>
        <p className="page-lede">A small collection of software explorations, from practical tools to interactive interfaces.</p>
      </header>

      <section className="project-list" aria-label="Project showcase">
        {projects.map((project, index) => <ProjectPanel key={project.title} {...project} projectIndex={index} />)}
      </section>
    </div>
  );
}

export default Projects;
