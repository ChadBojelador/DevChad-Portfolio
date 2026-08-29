import React, { useEffect, useRef, useState } from 'react';
import DriftWall from './Components/DriftWall';
import SpecularButton from './Components/SpecularButton';
import { contactLinks, experienceItems, projects } from './data/portfolioData';
import './App.css';

const WELCOME_SESSION_KEY = 'chad-portfolio-welcome-seen';
const THEME_STORAGE_KEY = 'chad-portfolio-theme';
const backgroundAudioSrc = import.meta.env.VITE_BACKGROUND_AUDIO_URL ?? '';
const clickAudioSrc = '/mascot/sounds/click.mp3';
const mascotSrc = '/mascot/chad-mascot.webp';
const chatMascotSrc = '/mascot/chatmascot.webp';

function App() {
  const audioRef = useRef(null);
  const clickAudioRef = useRef(null);
  const [hasEntered, setHasEntered] = useState(() => sessionStorage.getItem(WELCOME_SESSION_KEY) === 'true');
  const [isWelcomeLeaving, setIsWelcomeLeaving] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_STORAGE_KEY) ?? 'light');
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    if (!hasEntered) return undefined;

    const revealTargets = document.querySelectorAll('.scroll-reveal');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion || !('IntersectionObserver' in window)) {
      revealTargets.forEach((target) => target.classList.add('is-revealed'));
      return undefined;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.16 });

    revealTargets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [hasEntered]);

  function playClickSound() {
    const clickAudio = clickAudioRef.current;
    if (!clickAudio) return;

    clickAudio.currentTime = 0;
    clickAudio.play().catch(() => {});
  }

  function enterPortfolio(shouldPlayMusic) {
    if (isWelcomeLeaving) return;

    sessionStorage.setItem(WELCOME_SESSION_KEY, 'true');
    setIsWelcomeLeaving(true);

    if (shouldPlayMusic && audioRef.current && backgroundAudioSrc) {
      audioRef.current.muted = false;
      audioRef.current.play().catch(() => setIsMuted(true));
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.setTimeout(() => setHasEntered(true), reduceMotion ? 0 : 520);
  }

  function toggleAudio() {
    const audio = audioRef.current;
    if (!audio || !backgroundAudioSrc) return;

    const nextMuted = !isMuted;
    audio.muted = nextMuted;
    setIsMuted(nextMuted);

    if (!nextMuted) {
      audio.play().catch(() => setIsMuted(true));
    }
  }

  return (
    <div className="site-shell">
      {backgroundAudioSrc && <audio ref={audioRef} loop src={backgroundAudioSrc} />}
      <audio ref={clickAudioRef} preload="auto" src={clickAudioSrc} />

      {!hasEntered && <WelcomeScreen isLeaving={isWelcomeLeaving} onButtonClick={playClickSound} onChoose={enterPortfolio} />}

      <aside className="utility-dock" aria-label="Portfolio controls">
        <button
          className="icon-button"
          type="button"
          onClick={() => {
            playClickSound();
            setTheme((currentTheme) => currentTheme === 'light' ? 'dark' : 'light');
          }}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
        >
          {theme === 'light' ? '◐' : '☼'}
        </button>
        <button
          className="icon-button"
          type="button"
          onClick={() => {
            playClickSound();
            toggleAudio();
          }}
          aria-label={backgroundAudioSrc ? (isMuted ? 'Unmute background music' : 'Mute background music') : 'Background music is not configured'}
          title={backgroundAudioSrc ? (isMuted ? 'Unmute music' : 'Mute music') : 'Add VITE_BACKGROUND_AUDIO_URL to enable music'}
          disabled={!backgroundAudioSrc}
        >
          {isMuted ? '♪̸' : '♪'}
        </button>
      </aside>

      <main id="top">
        <Hero onButtonClick={playClickSound} />
        <About />
        <Projects />
        <Experience />
        <Contact />
      </main>

      {hasEntered && (
        <ChatMascot
          isOpen={isChatOpen}
          onToggle={() => setIsChatOpen((currentState) => !currentState)}
          onButtonClick={playClickSound}
        />
      )}

      <footer className="site-footer">
        <span>Built with intention.</span>
        <span>© {new Date().getFullYear()} Chad</span>
      </footer>
    </div>
  );
}

function ChatMascot({ isOpen, onToggle, onButtonClick }) {
  function toggleChat() {
    onButtonClick();
    onToggle();
  }

  return (
    <aside className="chat-assistant" aria-label="Chat assistant">
      {isOpen && (
        <section id="chat-panel" className="chat-panel glass-panel" aria-labelledby="chat-title">
          <div className="chat-panel-heading">
            <div>
              <p className="eyebrow">Chad&apos;s chat mascot</p>
              <h2 id="chat-title">Hey, I&apos;m here to help.</h2>
            </div>
            <button className="chat-close-button" type="button" onClick={toggleChat} aria-label="Close chat">
              <span aria-hidden="true">×</span>
            </button>
          </div>
          <p className="chat-panel-message">I&apos;m getting ready to answer questions about Chad&apos;s work, projects, and AI engineering journey.</p>
          <p className="chat-status"><span aria-hidden="true" />Chat is in development</p>
        </section>
      )}
      <button
        className={isOpen ? 'chat-launcher is-open' : 'chat-launcher'}
        type="button"
        onClick={toggleChat}
        aria-expanded={isOpen}
        aria-controls="chat-panel"
      >
        <span className="chat-mascot-avatar" aria-hidden="true">
          <img src={chatMascotSrc} alt="" />
        </span>
        <span className="chat-launcher-label">Talk to me</span>
      </button>
    </aside>
  );
}

function WelcomeScreen({ isLeaving, onButtonClick, onChoose }) {
  return (
    <section className={isLeaving ? 'welcome-screen is-leaving' : 'welcome-screen'} aria-labelledby="welcome-title">
      <div className="aurora aurora-one" />
      <div className="aurora aurora-two" />
      <div className="welcome-card glass-panel">
        <span className="eyebrow">welcome to my corner of the internet</span>
        <div className="orbital-icon" aria-hidden="true"><span>✦</span></div>
        <h1 id="welcome-title">Are you in the mood for music?</h1>
        <p>A little atmosphere before we get started.</p>
        <div className="welcome-actions">
          <SpecularButton
            className="brand-specular-button--primary"
            size="md"
            radius={16}
            tint="#1686dd"
            tintOpacity={0.9}
            blur={8}
            lineColor="#d5f0ff"
            baseColor="#075ca9"
            intensity={1.25}
            shineSize={24}
            shineFade={25}
            thickness={1.2}
            disabled={isLeaving}
            onClick={() => {
              onButtonClick();
              onChoose(true);
            }}
          >
            I&apos;m in the mood <span aria-hidden="true">→</span>
          </SpecularButton>
          <SpecularButton
            className="brand-specular-button--soft"
            size="md"
            radius={16}
            tint="#0c6eba"
            tintOpacity={0.8}
            blur={8}
            lineColor="#bde9ff"
            baseColor="#064b8a"
            intensity={0.95}
            shineSize={22}
            shineFade={28}
            thickness={1.1}
            disabled={isLeaving}
            onClick={() => {
              onButtonClick();
              onChoose(false);
            }}
          >
            I&apos;m not in the mood
          </SpecularButton>
        </div>
      </div>
    </section>
  );
}

function Hero({ onButtonClick }) {
  const [hasMascotImage, setHasMascotImage] = useState(true);

  function scrollToSection(sectionId) {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <section id="top" className="hero hero-centered section" aria-labelledby="hero-title">
      <div className="hero-bubbles" aria-hidden="true">
        <span className="hero-bubble hero-bubble-one" />
        <span className="hero-bubble hero-bubble-two" />
        <span className="hero-bubble hero-bubble-three" />
        <span className="hero-bubble hero-bubble-four" />
        <span className="hero-bubble hero-bubble-five" />
        <span className="hero-bubble hero-bubble-six" />
      </div>
      <div className={hasMascotImage ? 'mascot-frame has-mascot-image' : 'mascot-frame'}>
        {hasMascotImage ? <img src={mascotSrc} alt="Chad's mascot" onError={() => setHasMascotImage(false)} /> : (
          <div className="mascot-placeholder" aria-label="Mascot image placeholder">
            <span>✦</span>
            <p>Drop your mascot into<br />public/mascot</p>
          </div>
        )}
      </div>
      <div className="hero-copy">
        <h1 id="hero-title">Meet Chad!</h1>
        <p className="hero-role">An AI Engineer creating thoughtful tools for real people.</p>
        <p className="hero-description">I&apos;m interested in the human side of intelligent technology: where useful systems, considerate design, and curiosity meet.</p>
        <div className="hero-actions">
          <SpecularButton
            className="brand-specular-button--primary"
            size="md"
            radius={16}
            tint="#1686dd"
            tintOpacity={0.92}
            blur={8}
            lineColor="#d5f0ff"
            baseColor="#075ca9"
            intensity={1.3}
            shineSize={24}
            shineFade={25}
            thickness={1.2}
            onClick={() => {
              onButtonClick();
              scrollToSection('projects');
            }}
          >
            Explore projects <span aria-hidden="true">↓</span>
          </SpecularButton>
          <SpecularButton
            className="brand-specular-button--soft"
            size="md"
            radius={16}
            tint="#0c6eba"
            tintOpacity={0.84}
            blur={10}
            lineColor="#bde9ff"
            baseColor="#064b8a"
            intensity={1.05}
            shineSize={22}
            shineFade={28}
            thickness={1.1}
            onClick={() => {
              onButtonClick();
              scrollToSection('contact');
            }}
          >
            Let&apos;s connect
          </SpecularButton>
        </div>
      </div>
    </section>
  );
}

function About() {
  return (
    <section id="about" className="section about-section" aria-labelledby="about-title">
      <div className="about-quote glass-panel scroll-reveal">
        <span className="quote-mark quote-mark-open" aria-hidden="true">“</span>
        <div>
          <p className="eyebrow">01 · about</p>
          <h2 id="about-title">A people-first way of building.</h2>
          <blockquote>It was a journey in human-centered AI development—one that showed me technology is most meaningful when it is designed around people’s real needs.</blockquote>
        </div>
        <span className="quote-mark quote-mark-close" aria-hidden="true">”</span>
      </div>
    </section>
  );
}

function Projects() {
  return (
    <section id="projects" className="section" aria-labelledby="projects-title">
      <SectionIntro eyebrow="02 · selected work" title="Projects in motion." description="Drag through the wall to explore the product stories as they take shape." />
      <div className="scroll-reveal scroll-reveal-delay">
        <DriftWall projects={projects} />
      </div>
    </section>
  );
}

function Experience() {
  return (
    <section id="experience" className="section" aria-labelledby="experience-title">
      <SectionIntro eyebrow="03 · learning in public" title="The early chapters." description="Hackathons, certifications, and milestones will live here as they take shape." />
      <ol className="timeline scroll-reveal scroll-reveal-delay">
        {experienceItems.map((item) => <li key={item.title} className="timeline-item">
          <span className="timeline-dot" />
          <article className="timeline-card glass-panel">
            <p className="panel-label">{item.type}</p>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </article>
        </li>)}
      </ol>
    </section>
  );
}

function Contact() {
  return (
    <section id="contact" className="section contact-section" aria-labelledby="contact-title">
      <div className="contact-card glass-panel scroll-reveal">
        <p className="eyebrow">04 · get in touch</p>
        <h2 id="contact-title">Let&apos;s make something meaningful.</h2>
        <p>I&apos;m always open to conversations about AI engineering, creative technology, and opportunities to grow.</p>
        {contactLinks.length > 0 ? <div className="contact-links">{contactLinks.map((link) => <a key={link.label} href={link.href}>{link.label} <span>↗</span></a>)}</div> : <p className="contact-placeholder">Contact links will be added here soon.</p>}
      </div>
    </section>
  );
}

function SectionIntro({ eyebrow, title, description }) {
  return (
    <div className="section-intro scroll-reveal">
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  );
}

export default App;
