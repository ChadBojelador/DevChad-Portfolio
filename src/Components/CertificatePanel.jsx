function CertificatePanel({ cert }) {
  return (
    <article className="certificate-card">
      <img src={cert.image} alt="" className="certificate-card__image" />
      <div className="certificate-card__content">
        <p className="certificate-card__issuer">{cert.issuer}</p>
        <h2>{cert.title}</h2>
        <p className="certificate-card__date">Issued {cert.date}</p>
        <p>{cert.description}</p>
        <div className="tag-list">
          {cert.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}
        </div>
        <div className="certificate-card__footer">
          {cert.id && <span>Credential ID: {cert.id}</span>}
          {cert.link && cert.link !== '#' && (
            <a href={cert.link} target="_blank" rel="noopener noreferrer">View credential <span aria-hidden="true">↗</span></a>
          )}
        </div>
      </div>
    </article>
  );
}

export default CertificatePanel;
