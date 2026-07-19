import profilePhoto from '../assets/profile-photo.png';
import Signages from '../Components/Signages';
import { accomplishments } from '../data/accomplishments';

const skills = [
  'React', 'Node.js', 'Express', 'SQL', 'NoSQL', 'Python', 'LangChain', 'Google ADK', 'Claude CLI',
];

function App() {
  return (
    <div className="page page--home">
      <section className="home-intro">
        <img className="home-intro__portrait" src={profilePhoto} alt="Chad Bojelador" />
        <div>
          <p className="page-eyebrow">Student developer</p>
          <h1>Software with a clear purpose.</h1>
          <p className="page-lede">
            I am Chad Bojelador, an Information Technology student focused on building useful software with
            intuitive design and dependable functionality.
          </p>
        </div>
      </section>

      <section className="home-section" aria-labelledby="skills-heading">
        <p className="section-label">Current toolkit</p>
        <h2 id="skills-heading">Tools I use to turn ideas into working products.</h2>
        <div className="tag-list" aria-label="Technical skills">
          {skills.map((skill) => <span key={skill} className="tag">{skill}</span>)}
        </div>
      </section>

      <Signages />

      <section className="home-section" aria-labelledby="accomplishments-heading">
        <p className="section-label">Selected outcomes</p>
        <h2 id="accomplishments-heading">What I have been building.</h2>
        <div className="outcome-list">
          {accomplishments.map((item) => (
            <article key={item.metric} className="outcome-card">
              <span className="outcome-card__number">{item.metric}</span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default App;
