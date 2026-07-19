import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { experiences } from '../data/experiences';
import '../Styles/experiences.css';

const slideIn = (side) => ({
  hidden: { opacity: 0, x: side === 'left' ? -50 : 50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
});

function TimelineCard({ exp, index }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      className="exp-timeline-item"
      variants={slideIn(index % 2 === 0 ? 'left' : 'right')}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
    >
      {/* Node dot */}
      <motion.div
        className="exp-node"
        initial={{ scale: 0, opacity: 0 }}
        animate={isInView ? { scale: 1, opacity: 1 } : {}}
        transition={{ delay: 0.3, duration: 0.4, type: 'spring', stiffness: 200 }}
      >
        <div className="exp-node-inner" />
      </motion.div>

      {/* Card */}
      <div className="exp-card">
        {/* Accent top bar */}
        <div className="exp-card-accent" />

        <div className="exp-card-header">
          <div className="exp-card-meta">
            <span className="exp-period-badge">{exp.period}</span>
            <span className="exp-company">{exp.company}</span>
          </div>
          <h2 className="exp-card-title">{exp.title}</h2>
        </div>

        <p className="exp-card-desc">{exp.description}</p>

        <div className="exp-achievements">
          <span className="exp-achievements-label">Key Achievements</span>
          <ul className="exp-achievements-list">
            {exp.achievements.map((item, i) => (
              <motion.li
                key={i}
                className="exp-achievement-item"
                initial={{ opacity: 0, x: -16 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.45 + i * 0.12, duration: 0.5 }}
              >
                <span className="exp-bullet" />
                {item}
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}

export default function Experiences({ className = '' }) {
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true });
  const [showAll, setShowAll] = useState(false);

  const maxVisible = 2;
  const hasMoreThanLimit = experiences.length > maxVisible;
  const visibleExperiences = hasMoreThanLimit && !showAll
    ? experiences.slice(0, maxVisible)
    : experiences;

  return (
    <section className={`exp-section ${className}`.trim()} aria-label="Professional Experience">
      {/* Ambient blobs */}
      <div className="exp-blob exp-blob-1" aria-hidden="true" />
      <div className="exp-blob exp-blob-2" aria-hidden="true" />

      <motion.header
        ref={headerRef}
        className="exp-section-header"
        initial={{ opacity: 0, y: 24 }}
        animate={headerInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="exp-eyebrow">Experience</div>
        <h1 className="exp-section-title">Professional Journey</h1>
        <div className="exp-title-line" />
        <p className="exp-section-subtitle">
          Events, hackathons, and leadership roles that shaped my craft.
        </p>
      </motion.header>

      <div className="exp-timeline">
        {/* Vertical track */}
        <div className="exp-track" aria-hidden="true">
          <motion.div
            className="exp-track-fill"
            initial={{ scaleY: 0 }}
            animate={headerInView ? { scaleY: 1 } : {}}
            transition={{ delay: 0.4, duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>

        {visibleExperiences.map((exp, index) => (
          <TimelineCard key={index} exp={exp} index={index} />
        ))}
      </div>

      {hasMoreThanLimit && (
        <div className="exp-view-more-wrap">
          <button
            type="button"
            className="exp-view-more-btn"
            onClick={() => setShowAll((prev) => !prev)}
            aria-expanded={showAll}
            aria-label={showAll ? 'Show fewer experiences' : 'Show more experiences'}
          >
            {showAll ? 'View Less' : `View More (${experiences.length - maxVisible})`}
          </button>
        </div>
      )}
    </section>
  );
}
