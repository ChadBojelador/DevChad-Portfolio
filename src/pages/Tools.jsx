import { tools } from '../data/tools';

function Tools() {
  return (
    <div className="page">
      <header className="page-header">
        <p className="page-eyebrow">Technical toolkit</p>
        <h1>Tools I reach for.</h1>
        <p className="page-lede">A practical mix of languages, frameworks, and platforms for building full-stack experiences.</p>
      </header>
      <div className="tool-groups">
        {tools.map((group) => (
          <section className="tool-group" key={group.category}>
            <h2>{group.category}</h2>
            <div className="tag-list">
              {group.items.map((item) => <span className="tag" key={item}>{item}</span>)}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

export default Tools;
