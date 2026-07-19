import CertificatePanel from '../Components/CertificatePanel';
import { certificates } from '../data/certificates';

function Certificates() {
  return (
    <div className="page">
      <header className="page-header">
        <p className="page-eyebrow">Continuous learning</p>
        <h1>Certificates and courses.</h1>
        <p className="page-lede">A record of the programs that have strengthened my development and data skills.</p>
      </header>
      <section className="certificate-list" aria-label="Certificates">
        {certificates.map((cert) => <CertificatePanel cert={cert} key={cert.title} />)}
      </section>
    </div>
  );
}

export default Certificates;
