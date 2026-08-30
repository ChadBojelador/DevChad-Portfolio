import React, { useCallback, useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import AdminPanel from './Components/AdminPanel';
import DepthCarousel from './Components/DepthCarousel';
import DriftWall from './Components/DriftWall';
import SpecularButton from './Components/SpecularButton';
import {
  contactLinks,
  earlyChapterCarouselItems as defaultEarlyChapterCarouselItems,
  earlyChapterRoadmapSettings as defaultEarlyChapterRoadmapSettings,
  earlyChapterTimeline as defaultEarlyChapterTimeline,
  projects as defaultProjects,
} from './data/portfolioData';
import './App.css';

const WELCOME_SESSION_KEY = 'chad-portfolio-welcome-seen';
const AUDIO_ENABLED_SESSION_KEY = 'chad-portfolio-audio-enabled';
const THEME_STORAGE_KEY = 'chad-portfolio-theme';
const CONTENT_STORAGE_KEY = 'chad-portfolio-admin-content';
const welcomeAudioSrc = '/mascot/sounds/startup.MP3';
const heroAudioSrc = '/mascot/sounds/startup2.MP3';
const clickAudioSrc = '/mascot/sounds/click.mp3';
const mascotSrc = '/mascot/chad-mascot.png';
const chatMascotSrc = '/mascot/chatmascot.webp';

const detailPageHashes = {
  productStories: '#product-stories',
  earlyChapters: '#early-chapters',
};

function createDefaultPortfolioContent() {
  return {
    projects: defaultProjects.map((project, index) => ({
      ...project,
      id: project.id || `project-${index + 1}`,
      stack: Array.isArray(project.stack) ? [...project.stack] : [],
    })),
    earlyChapters: {
      direction: defaultEarlyChapterRoadmapSettings.direction,
      timeline: defaultEarlyChapterTimeline.map((item, index) => ({
        ...item,
        id: item.id || `chapter-${index + 1}`,
        order: Number(item.order) || index + 1,
      })),
      carousel: defaultEarlyChapterCarouselItems.map((item, index) => ({
        ...item,
        id: item.id || `story-${index + 1}`,
        order: Number(item.order) || index + 1,
      })),
    },
  };
}

function normalisePortfolioContent(content) {
  const defaults = createDefaultPortfolioContent();
  const projects = Array.isArray(content?.projects) ? content.projects : defaults.projects;
  const timeline = Array.isArray(content?.earlyChapters?.timeline) ? content.earlyChapters.timeline : defaults.earlyChapters.timeline;
  const carousel = Array.isArray(content?.earlyChapters?.carousel) ? content.earlyChapters.carousel : defaults.earlyChapters.carousel;

  return {
    projects: projects.map((project, index) => ({
      ...project,
      id: project.id || `project-${index + 1}`,
      stack: Array.isArray(project.stack) ? project.stack : [],
    })),
    earlyChapters: {
      direction: content?.earlyChapters?.direction === 'ascending' ? 'ascending' : 'descending',
      timeline: timeline.map((item, index) => ({ ...item, id: item.id || `chapter-${index + 1}`, order: Number(item.order) || index + 1 })),
      carousel: carousel.map((item, index) => ({ ...item, id: item.id || `story-${index + 1}`, order: Number(item.order) || index + 1 })),
    },
  };
}

function loadPortfolioContent() {
  try {
    const savedContent = localStorage.getItem(CONTENT_STORAGE_KEY);
    return savedContent ? normalisePortfolioContent(JSON.parse(savedContent)) : createDefaultPortfolioContent();
  } catch {
    return createDefaultPortfolioContent();
  }
}

function getOrderedRoadmapItems(content) {
  const direction = content.earlyChapters.direction === 'ascending' ? 1 : -1;
  return [...content.earlyChapters.timeline].sort((first, second) => (first.order - second.order) * direction);
}

function getOrderedCarouselItems(content) {
  return [...content.earlyChapters.carousel]
    .filter((item) => item.image)
    .sort((first, second) => first.order - second.order);
}

function getActivePage() {
  if (window.location.hash === detailPageHashes.productStories) return 'productStories';
  if (window.location.hash === detailPageHashes.earlyChapters) return 'earlyChapters';
  return 'home';
}

function useGsapSmoothScroll(enabled) {
  const targetScrollRef = useRef(0);
  const currentScrollRef = useRef(0);
  const scrollTweenRef = useRef(null);

  const scrollToPosition = useCallback((top, { immediate = false } = {}) => {
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const nextScroll = Math.min(maxScroll, Math.max(0, top));
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    scrollTweenRef.current?.kill();
    if (immediate || reduceMotion) {
      targetScrollRef.current = nextScroll;
      currentScrollRef.current = nextScroll;
      window.scrollTo({ top: nextScroll, behavior: 'auto' });
      return;
    }

    const scrollProxy = { value: window.scrollY };
    scrollTweenRef.current = gsap.to(scrollProxy, {
      value: nextScroll,
      duration: 0.78,
      ease: 'power3.out',
      overwrite: true,
      onUpdate: () => {
        targetScrollRef.current = scrollProxy.value;
        currentScrollRef.current = scrollProxy.value;
        window.scrollTo({ top: scrollProxy.value, behavior: 'auto' });
      },
    });
  }, []);

  useEffect(() => {
    if (!enabled) return undefined;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const desktopViewport = window.matchMedia('(min-width: 701px)');
    let tickerActive = false;

    const syncScrollPosition = () => {
      if (Math.abs(window.scrollY - currentScrollRef.current) <= 1) return;
      targetScrollRef.current = window.scrollY;
      currentScrollRef.current = window.scrollY;
    };

    const stopTicker = () => {
      if (!tickerActive) return;
      gsap.ticker.remove(renderScroll);
      tickerActive = false;
    };

    const renderScroll = () => {
      const distance = targetScrollRef.current - currentScrollRef.current;
      if (Math.abs(distance) < 0.5) {
        currentScrollRef.current = targetScrollRef.current;
        window.scrollTo({ top: targetScrollRef.current, behavior: 'auto' });
        stopTicker();
        return;
      }

      currentScrollRef.current += distance * 0.14;
      window.scrollTo({ top: currentScrollRef.current, behavior: 'auto' });
    };

    const startTicker = () => {
      if (tickerActive) return;
      tickerActive = true;
      gsap.ticker.add(renderScroll);
    };

    const shouldPreserveNativeScroll = (target) => {
      if (!(target instanceof Element)) return false;
      return Boolean(target.closest('.depth-carousel, .experience-gallery-track, .custom-scrollbar'));
    };

    const handleWheel = (event) => {
      if (reduceMotion.matches || !desktopViewport.matches || event.defaultPrevented || event.ctrlKey || event.metaKey) return;
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY) || shouldPreserveNativeScroll(event.target)) return;

      event.preventDefault();
      const multiplier = event.deltaMode === 1 ? 24 : 1;
      const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      const baseScroll = tickerActive ? targetScrollRef.current : window.scrollY;
      targetScrollRef.current = Math.min(maxScroll, Math.max(0, baseScroll + event.deltaY * multiplier));
      if (!tickerActive) currentScrollRef.current = window.scrollY;
      startTicker();
    };

    targetScrollRef.current = window.scrollY;
    currentScrollRef.current = window.scrollY;
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('scroll', syncScrollPosition, { passive: true });

    return () => {
      stopTicker();
      scrollTweenRef.current?.kill();
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('scroll', syncScrollPosition);
    };
  }, [enabled]);

  return scrollToPosition;
}

function App() {
  const welcomeAudioRef = useRef(null);
  const heroAudioRef = useRef(null);
  const clickAudioRef = useRef(null);
  const hasStartedWelcomeAudioRef = useRef(false);
  const hasStartedHeroAudioRef = useRef(false);
  const [hasEntered, setHasEntered] = useState(() => sessionStorage.getItem(WELCOME_SESSION_KEY) === 'true');
  const [isWelcomeLeaving, setIsWelcomeLeaving] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(() => sessionStorage.getItem(AUDIO_ENABLED_SESSION_KEY) === 'true');
  const isMuted = !isAudioEnabled;
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_STORAGE_KEY) ?? 'light');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isHeroDocked, setIsHeroDocked] = useState(false);
  const [activePage, setActivePage] = useState(getActivePage);
  const [portfolioContent, setPortfolioContent] = useState(loadPortfolioContent);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);
  const smoothScrollTo = useGsapSmoothScroll(hasEntered && activePage === 'home');
  const earlyChapterRoadmapItems = getOrderedRoadmapItems(portfolioContent);
  const earlyChapterCarouselItems = getOrderedCarouselItems(portfolioContent);

  const updatePortfolioContent = useCallback((updater) => {
    setPortfolioContent((previous) => normalisePortfolioContent(updater(previous)));
  }, []);

  const scrollToSection = useCallback((sectionId) => {
    const section = document.getElementById(sectionId);
    if (!section) return;

    const offset = Number.parseFloat(getComputedStyle(section).scrollMarginTop) || 0;
    smoothScrollTo(window.scrollY + section.getBoundingClientRect().top - offset);
  }, [smoothScrollTo]);

  const openDetailPage = useCallback((page) => {
    const hash = detailPageHashes[page];
    if (!hash) return;

    window.history.pushState(null, '', hash);
    setIsHeroDocked(false);
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  const returnHome = useCallback(() => {
    window.history.pushState(null, '', `${window.location.pathname}${window.location.search}`);
    setIsHeroDocked(false);
    setActivePage('home');
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  useEffect(() => {
    const syncActivePage = () => setActivePage(getActivePage());
    window.addEventListener('hashchange', syncActivePage);
    window.addEventListener('popstate', syncActivePage);

    return () => {
      window.removeEventListener('hashchange', syncActivePage);
      window.removeEventListener('popstate', syncActivePage);
    };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(portfolioContent));
    } catch {
      // The portfolio remains editable for this session if storage is unavailable.
    }
  }, [portfolioContent]);

  useEffect(() => {
    if (!lightboxImage) return undefined;

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setLightboxImage(null);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [lightboxImage]);

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

  useEffect(() => {
    if (activePage !== 'home') {
      return undefined;
    }

    const desktopViewport = window.matchMedia('(min-width: 901px)');
    let animationFrame;

    const updateHeroPosition = () => {
      const shouldDock = desktopViewport.matches && window.scrollY > 36;
      setIsHeroDocked((currentState) => currentState === shouldDock ? currentState : shouldDock);
      animationFrame = undefined;
    };
    const scheduleHeroPosition = () => {
      if (!animationFrame) animationFrame = window.requestAnimationFrame(updateHeroPosition);
    };

    updateHeroPosition();
    window.addEventListener('scroll', scheduleHeroPosition, { passive: true });
    window.addEventListener('resize', scheduleHeroPosition);
    desktopViewport.addEventListener('change', scheduleHeroPosition);

    return () => {
      window.removeEventListener('scroll', scheduleHeroPosition);
      window.removeEventListener('resize', scheduleHeroPosition);
      desktopViewport.removeEventListener('change', scheduleHeroPosition);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };
  }, [activePage]);

  useEffect(() => {
    if (!hasEntered) return undefined;

    const bentoTargets = document.querySelectorAll('.magnetic-bento');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion || !('IntersectionObserver' in window)) {
      bentoTargets.forEach((target) => target.classList.add('is-settled'));
      return undefined;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-settled');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.18 });

    bentoTargets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [hasEntered]);

  function playClickSound() {
    if (!isAudioEnabled) return;

    const clickAudio = clickAudioRef.current;
    if (!clickAudio) return;

    clickAudio.currentTime = 0;
    clickAudio.play().catch(() => {});
  }

  const playWelcomeAudio = useCallback((force = false) => {
    const welcomeAudio = welcomeAudioRef.current;
    if (!welcomeAudio || (!isAudioEnabled && !force)) return;

    if (hasStartedWelcomeAudioRef.current && !force) return;

    welcomeAudio.currentTime = 0;
    welcomeAudio.muted = false;
    hasStartedWelcomeAudioRef.current = true;
    welcomeAudio.play().catch(() => {
      hasStartedWelcomeAudioRef.current = false;
      if (force || isAudioEnabled) {
        setIsAudioEnabled(false);
        sessionStorage.setItem(AUDIO_ENABLED_SESSION_KEY, 'false');
      }
    });
  }, [isAudioEnabled]);

  const playHeroAudio = useCallback((force = false) => {
    const heroAudio = heroAudioRef.current;
    if (!heroAudio || (!isAudioEnabled && !force)) return;

    heroAudio.currentTime = 0;
    heroAudio.muted = false;
    hasStartedHeroAudioRef.current = true;
    heroAudio.play().catch(() => {
      hasStartedHeroAudioRef.current = false;
      setIsAudioEnabled(false);
      sessionStorage.setItem(AUDIO_ENABLED_SESSION_KEY, 'false');
    });
  }, [isAudioEnabled]);

  useEffect(() => {
    if (hasEntered || isWelcomeLeaving || hasStartedWelcomeAudioRef.current) return;

    playWelcomeAudio(true);
  }, [hasEntered, isWelcomeLeaving, playWelcomeAudio]);

  useEffect(() => {
    if (!hasEntered || isWelcomeLeaving || !isAudioEnabled || hasStartedHeroAudioRef.current) return;

    playHeroAudio();
  }, [hasEntered, isWelcomeLeaving, isAudioEnabled, playHeroAudio]);

  function enterPortfolio(shouldPlayMusic) {
    if (isWelcomeLeaving) return;

    sessionStorage.setItem(WELCOME_SESSION_KEY, 'true');
    sessionStorage.setItem(AUDIO_ENABLED_SESSION_KEY, String(shouldPlayMusic));
    setIsAudioEnabled(shouldPlayMusic);
    setIsWelcomeLeaving(true);

    if (shouldPlayMusic) {
      playWelcomeAudio(true);
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.setTimeout(() => {
      const welcomeAudio = welcomeAudioRef.current;
      if (welcomeAudio) {
        welcomeAudio.pause();
        welcomeAudio.currentTime = 0;
      }

      setHasEntered(true);
      if (shouldPlayMusic) playHeroAudio(true);
    }, reduceMotion ? 0 : 520);
  }

  function toggleAudio() {
    const nextAudioEnabled = !isAudioEnabled;
    setIsAudioEnabled(nextAudioEnabled);
    sessionStorage.setItem(AUDIO_ENABLED_SESSION_KEY, String(nextAudioEnabled));

    if (nextAudioEnabled) {
      playHeroAudio(true);
      return;
    }

    [welcomeAudioRef.current, heroAudioRef.current, clickAudioRef.current].forEach((audio) => {
      if (!audio) return;
      audio.pause();
      audio.currentTime = 0;
    });
    hasStartedHeroAudioRef.current = false;
  }

  return (
    <div className="site-shell">
      <div className="liquid-background" aria-hidden="true">
        <div className="liquid-background-stage">
          <span className="liquid-blob liquid-blob-one" />
          <span className="liquid-blob liquid-blob-two" />
          <span className="liquid-blob liquid-blob-three" />
          <span className="liquid-blob liquid-blob-four" />
          <span className="liquid-blob liquid-blob-five" />
        </div>
        <div className="liquid-background-noise" />
      </div>
      <audio ref={welcomeAudioRef} preload="auto" src={welcomeAudioSrc} />
      <audio ref={heroAudioRef} preload="auto" src={heroAudioSrc} />
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
          className="icon-button audio-toggle"
          type="button"
          onClick={() => {
            playClickSound();
            toggleAudio();
          }}
          aria-label={isAudioEnabled ? 'Mute sounds' : 'Unmute sounds'}
          title={isAudioEnabled ? 'Mute sounds' : 'Unmute sounds'}
          data-audio-state={isAudioEnabled ? 'on' : 'off'}
        >
          <span className="audio-toggle-label">{isAudioEnabled ? 'Sound on' : 'Sound off'}</span>
          {isMuted ? '♪̸' : '♪'}
        </button>
        <button
          className="icon-button admin-mode-button"
          type="button"
          onClick={() => {
            playClickSound();
            setIsAdminOpen(true);
          }}
          aria-label="Open admin controls"
          title="Open admin controls"
        >
          <span aria-hidden="true">✎</span>
          <span className="admin-mode-label">Edit</span>
        </button>
      </aside>

      {hasEntered && <CustomScrollbar onScrollTo={smoothScrollTo} />}

      {activePage === 'home' ? (
        <main id="top" className={isHeroDocked ? 'portfolio-layout hero-is-docked' : 'portfolio-layout'}>
          <Hero
            isDocked={isHeroDocked}
            onButtonClick={playClickSound}
            onScrollToSection={scrollToSection}
            onHoverAudio={() => {
              if (isAudioEnabled) {
                playHeroAudio(true);
              }
            }}
          />
          <div className="portfolio-content">
            <About />
            <Projects projects={portfolioContent.projects} onOpenPage={() => openDetailPage('productStories')} />
            <Experience carouselItems={earlyChapterCarouselItems} onOpenPage={() => openDetailPage('earlyChapters')} />
            <Contact />
          </div>
        </main>
      ) : (
        <main id="top" className="detail-page">
          {activePage === 'productStories' && <ProductStoriesPage projects={portfolioContent.projects} onBack={returnHome} />}
          {activePage === 'earlyChapters' && <EarlyChaptersPage items={earlyChapterRoadmapItems} onBack={returnHome} onImageOpen={setLightboxImage} />}
        </main>
      )}

      {hasEntered && (
        <ChatMascot
          isOpen={isChatOpen}
          onToggle={() => setIsChatOpen((currentState) => !currentState)}
          onButtonClick={playClickSound}
        />
      )}

      {isAdminOpen && (
        <AdminPanel
          content={portfolioContent}
          onChange={updatePortfolioContent}
          onClose={() => setIsAdminOpen(false)}
          onReset={() => setPortfolioContent(createDefaultPortfolioContent())}
        />
      )}

      {lightboxImage && <ImageLightbox image={lightboxImage} onClose={() => setLightboxImage(null)} />}

      <footer className={activePage === 'home' && isHeroDocked ? 'site-footer site-footer--content-aligned' : 'site-footer'}>
        <span>Built with intention.</span>
        <span>© {new Date().getFullYear()} Chad</span>
      </footer>
    </div>
  );
}

function CustomScrollbar({ onScrollTo }) {
  const trackRef = useRef(null);
  const dragStateRef = useRef(null);
  const [metrics, setMetrics] = useState({
    maxScroll: 0,
    progress: 0,
    thumbHeight: 28,
    thumbOffset: 0,
  });

  useEffect(() => {
    let animationFrame;

    const updateMetrics = () => {
      const documentHeight = document.documentElement.scrollHeight;
      const maxScroll = Math.max(0, documentHeight - window.innerHeight);
      const trackHeight = trackRef.current?.getBoundingClientRect().height ?? 0;
      const viewportRatio = documentHeight > 0 ? Math.min(1, window.innerHeight / documentHeight) : 1;
      const thumbHeight = trackHeight ? Math.min(trackHeight, Math.max(28, trackHeight * viewportRatio)) : 28;
      const availableTrack = Math.max(0, trackHeight - thumbHeight);
      const progress = maxScroll ? Math.min(1, Math.max(0, window.scrollY / maxScroll)) : 0;

      setMetrics({
        maxScroll,
        progress,
        thumbHeight,
        thumbOffset: progress * availableTrack,
      });
      animationFrame = undefined;
    };

    const scheduleUpdate = () => {
      if (!animationFrame) animationFrame = window.requestAnimationFrame(updateMetrics);
    };

    const resizeObserver = new ResizeObserver(scheduleUpdate);
    if (document.body) resizeObserver.observe(document.body);

    updateMetrics();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  const scrollToTrackPosition = useCallback((clientY) => {
    const track = trackRef.current;
    if (!track || !metrics.maxScroll) return;

    const bounds = track.getBoundingClientRect();
    const availableTrack = Math.max(1, bounds.height - metrics.thumbHeight);
    const offset = Math.min(
      availableTrack,
      Math.max(0, clientY - bounds.top - metrics.thumbHeight / 2),
    );

    onScrollTo((offset / availableTrack) * metrics.maxScroll, { immediate: true });
  }, [metrics.maxScroll, metrics.thumbHeight, onScrollTo]);

  function handlePointerDown(event) {
    event.preventDefault();
    dragStateRef.current = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
    scrollToTrackPosition(event.clientY);
  }

  function handlePointerMove(event) {
    if (dragStateRef.current !== event.pointerId) return;
    scrollToTrackPosition(event.clientY);
  }

  function finishDragging(event) {
    if (dragStateRef.current !== event.pointerId) return;
    dragStateRef.current = null;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  }

  function handleKeyDown(event) {
    const pageAmount = Math.max(120, Math.round(window.innerHeight * 0.82));
    let nextScroll;

    if (event.key === 'ArrowDown') nextScroll = window.scrollY + 80;
    if (event.key === 'ArrowUp') nextScroll = window.scrollY - 80;
    if (event.key === 'PageDown') nextScroll = window.scrollY + pageAmount;
    if (event.key === 'PageUp') nextScroll = window.scrollY - pageAmount;
    if (event.key === 'Home') nextScroll = 0;
    if (event.key === 'End') nextScroll = metrics.maxScroll;
    if (nextScroll === undefined) return;

    event.preventDefault();
    onScrollTo(nextScroll);
  }

  return (
    <aside className={metrics.maxScroll ? 'custom-scrollbar' : 'custom-scrollbar is-inactive'} aria-label="Page navigation" aria-hidden={!metrics.maxScroll}>
      <div
        ref={trackRef}
        className="custom-scrollbar-track"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishDragging}
        onPointerCancel={finishDragging}
      >
        <button
          className="custom-scrollbar-thumb"
          type="button"
          role="scrollbar"
          aria-controls="top"
          aria-label="Page scroll position"
          aria-orientation="vertical"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(metrics.progress * 100)}
          style={{ height: `${metrics.thumbHeight}px`, transform: `translate(-50%, ${metrics.thumbOffset}px)` }}
          onKeyDown={handleKeyDown}
          tabIndex={metrics.maxScroll ? 0 : -1}
        />
      </div>
    </aside>
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
        aria-label={isOpen ? 'Close chat assistant' : 'Open chat assistant'}
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
            tintOpacity={0}
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
            tintOpacity={0}
            blur={8}
            lineColor="#bde9ff"
            baseColor="#064b8a"
            intensity={0.95}
            shineSize={22}
            shineFade={28}
            thickness={1.1}
            disabled={isLeaving}
            onClick={() => {
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

function Hero({ isDocked, onButtonClick, onScrollToSection, onHoverAudio }) {
  const [hasMascotImage, setHasMascotImage] = useState(true);

  return (
    <section
      className={isDocked ? 'hero hero-centered section is-docked' : 'hero hero-centered section'}
      aria-labelledby="hero-title"
      onMouseEnter={onHoverAudio}
    >
      <div className="hero-glass-card" aria-hidden="true" />
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
        <p className="hero-role">An AI Engineer creating thoughtful solutions for real people</p>
        <p className="hero-description">I&apos;m interested in the human side of intelligent technology: where useful systems, considerate design, and curiosity meet.</p>
        <div className="hero-actions">
          <SpecularButton
            className="brand-specular-button--primary"
            size="md"
            radius={16}
            tint="#1686dd"
            tintOpacity={0}
            blur={8}
            lineColor="#d5f0ff"
            baseColor="#075ca9"
            intensity={1.3}
            shineSize={24}
            shineFade={25}
            thickness={1.2}
            onClick={() => {
              onButtonClick();
              onScrollToSection('projects');
            }}
          >
            Explore projects <span aria-hidden="true">↓</span>
          </SpecularButton>
          <SpecularButton
            className="brand-specular-button--soft"
            size="md"
            radius={16}
            tint="#0c6eba"
            tintOpacity={0}
            blur={10}
            lineColor="#bde9ff"
            baseColor="#064b8a"
            intensity={1.05}
            shineSize={22}
            shineFade={28}
            thickness={1.1}
            onClick={() => {
              onButtonClick();
              onScrollToSection('contact');
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
      <div className="about-quote glass-panel scroll-reveal section-card-reveal">
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

function Projects({ onOpenPage, projects }) {
  return (
    <section id="projects" className="section magnetic-bento" aria-labelledby="projects-title">
      <SectionIntro
        eyebrow="02 · selected work"
        title="Projects in motion."
        description="Drag through the wall to explore the product stories as they take shape."
        actionLabel="View product stories"
        onAction={onOpenPage}
      />
      <div className="projects-bento-wall magnetic-bento-card">
        <DriftWall projects={projects} />
      </div>
      <article className="projects-bento-note glass-panel magnetic-bento-card">
        <img src="/projects/ginsight/ginsight 1.png" alt="Ginsight product preview" loading="lazy" />
        <p>Product stories</p>
      </article>
      <article className="projects-bento-status glass-panel magnetic-bento-card">
        <img src="/Learning/asean.png" alt="ASEAN learning certificate" loading="lazy" />
        <p>Always learning</p>
      </article>
    </section>
  );
}

function Experience({ onOpenPage, carouselItems }) {
  return (
    <section id="experience" className="section magnetic-bento" aria-labelledby="experience-title">
      <SectionIntro
        eyebrow="03 · learning in public"
        title="The early chapters."
        description="Explore the moments shaping Chad&apos;s early path in AI engineering."
        actionLabel="Explore early chapters"
        onAction={onOpenPage}
      />
      <div className="experience-carousel magnetic-bento-card">
        <div className="experience-depth-carousel">
          <DepthCarousel
            items={carouselItems}
            variant="story"
            cardWidth={294}
            cardHeight={430}
            radius={24}
            duration={560}
            visibleCards={3}
            autoplay
            autoplayDelay={3800}
            loop
            showControls={false}
            showIndicators={false}
          />
        </div>
      </div>
    </section>
  );
}

export function ExperienceCategory({ item }) {
  const galleryRef = useRef(null);

  function scrollGallery(direction) {
    const gallery = galleryRef.current;
    if (!gallery) return;

    gallery.scrollBy({
      left: direction * Math.min(gallery.clientWidth * 0.84, 620),
      behavior: 'smooth',
    });
  }

  return (
    <article className="experience-category glass-panel magnetic-bento-card">
      <div className="experience-category-heading">
        <div>
          <p className="panel-label">{item.type}</p>
          <h3>{item.title}</h3>
          <p>{item.description}</p>
        </div>
        <div className="experience-gallery-controls" aria-label={`${item.title} gallery controls`}>
          <button className="gallery-control" type="button" onClick={() => scrollGallery(-1)} aria-label={`Show previous ${item.title} picture`}>
            <span aria-hidden="true">←</span>
          </button>
          <button className="gallery-control" type="button" onClick={() => scrollGallery(1)} aria-label={`Show next ${item.title} picture`}>
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
      <div className="experience-gallery" role="region" aria-label={`${item.title} picture gallery`}>
        <div className="experience-gallery-track" ref={galleryRef} tabIndex="0">
          {item.images.map((image, index) => (
            <figure key={image.src} className="experience-gallery-slide">
              <img src={image.src} alt={image.alt} loading="lazy" />
              <figcaption>
                <span>{image.label}</span>
                <span>{String(index + 1).padStart(2, '0')} / {String(item.images.length).padStart(2, '0')}</span>
              </figcaption>
            </figure>
          ))}
        </div>
        <p className="experience-gallery-hint">Swipe to explore <span aria-hidden="true">→</span></p>
      </div>
    </article>
  );
}

function DetailPageHeader({ eyebrow, title, description, onBack }) {
  return (
    <header className="detail-page-header glass-panel">
      <button className="detail-back-button" type="button" onClick={onBack}>
        <span aria-hidden="true">←</span> Back to home
      </button>
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p>{description}</p>
    </header>
  );
}

function ProductStoriesPage({ onBack, projects }) {
  return (
    <div className="detail-page-content">
      <DetailPageHeader
        eyebrow="Selected work · product stories"
        title="The stories behind the work."
        description="A dedicated space for the products, experiments, and ideas that are taking shape."
        onBack={onBack}
      />
      <section className="product-stories-detail" aria-labelledby="product-stories-title">
        <article className="product-story-feature glass-panel">
          <div className="product-story-feature-media">
            <img src="/projects/ginsight/ginsight 1.png" alt="Ginsight product preview" />
          </div>
          <div className="product-story-feature-copy">
            <p className="eyebrow">Featured preview</p>
            <h2 id="product-stories-title">Product stories in progress.</h2>
            <p>Each story will bring together the problem, the process, and the human impact behind the work.</p>
          </div>
        </article>
        <div className="product-stories-wall">
          <DriftWall projects={projects} />
        </div>
      </section>
    </div>
  );
}

function EarlyChaptersPage({ onBack, items, onImageOpen }) {
  return (
    <div className="detail-page-content">
      <DetailPageHeader
        eyebrow="Learning in public · early chapters"
        title="A roadmap of curiosity."
        description="The people, experiments, and learning moments that are gradually shaping an AI engineering journey."
        onBack={onBack}
      />
      <section className="early-chapters-roadmap" aria-label="Early chapters roadmap">
        <svg className="roadmap-curve" viewBox="0 0 120 1000" preserveAspectRatio="none" aria-hidden="true">
          <path d="M60 0C8 92 112 158 60 250S8 408 60 500s52 158 0 250S8 908 60 1000" />
        </svg>
        {items.map((item, index) => (
          <article className="roadmap-stop" key={item.id}>
            <div className="roadmap-stop-marker" aria-hidden="true"><span>{String(item.order).padStart(2, '0')}</span></div>
            <div className="roadmap-stop-content">
              {item.image && (
                <div className="roadmap-stop-media">
                  <button
                    className="roadmap-image-button"
                    type="button"
                    onClick={() => onImageOpen({ src: item.image, alt: item.alt || item.title || 'Expanded roadmap image' })}
                    aria-label={`Expand ${item.title || 'roadmap'} image`}
                  >
                    <img src={item.image} alt={item.alt || ''} loading={index === 0 ? 'eager' : 'lazy'} />
                  </button>
                </div>
              )}
              <div className="roadmap-stop-copy glass-panel">
                <p className="eyebrow">{item.eyebrow}</p>
                <h2>{item.title}</h2>
                <p>{item.description}</p>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

function ImageLightbox({ image, onClose }) {
  return (
    <div className="image-lightbox" role="presentation" onMouseDown={onClose}>
      <div className="image-lightbox-dialog" role="dialog" aria-modal="true" aria-label={image.alt || 'Expanded image'} onMouseDown={(event) => event.stopPropagation()}>
        <button className="image-lightbox-close" type="button" onClick={onClose} aria-label="Close expanded image">×</button>
        <img src={image.src} alt={image.alt || ''} />
      </div>
    </div>
  );
}

function Contact() {
  return (
    <section id="contact" className="section contact-section" aria-labelledby="contact-title">
      <div className="contact-card glass-panel scroll-reveal section-card-reveal">
        <p className="eyebrow">04 · get in touch</p>
        <h2 id="contact-title">Let&apos;s make something meaningful.</h2>
        <p>I&apos;m always open to conversations about AI engineering, creative technology, and opportunities to grow.</p>
        {contactLinks.length > 0 ? <div className="contact-links">{contactLinks.map((link) => <a key={link.label} href={link.href} aria-label={link.label}><span aria-hidden="true">↗</span></a>)}</div> : <p className="contact-placeholder">Contact links will be added here soon.</p>}
      </div>
    </section>
  );
}

function SectionIntro({ eyebrow, title, description, actionLabel, onAction }) {
  return (
    <div className="section-intro scroll-reveal">
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
      {actionLabel && onAction && (
        <button className="section-page-link" type="button" onClick={onAction}>
          {actionLabel} <span aria-hidden="true">→</span>
        </button>
      )}
    </div>
  );
}

export default App;
