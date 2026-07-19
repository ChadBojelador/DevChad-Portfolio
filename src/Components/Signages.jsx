const stats = [
  { value: '+15', label: 'Projects completed' },
  { value: '+10', label: 'Certificates received' },
  { value: '+3', label: 'Affiliated organizations' },
];

function Signages() {
  return (
    <section className="home-stats" aria-label="Portfolio highlights">
      {stats.map((stat) => (
        <div key={stat.label}>
          <strong>{stat.value}</strong>
          <span>{stat.label}</span>
        </div>
      ))}
    </section>
  );
}

export default Signages;
