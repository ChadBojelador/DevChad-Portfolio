import { useEffect, useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';
import PortfolioChat from './PortfolioChat';
import FloatingSpotify from './FloatingSpotify';
import ThemeToggle from './ThemeToggle';
import '../Styles/index.css';

function resolveSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getInitialPreference() {
  if (typeof window === 'undefined') return 'system';

  try {
    const saved = window.localStorage.getItem('portfolio-theme');
    if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
  } catch {
    // Fall back to system when storage is unavailable.
  }

  return 'system';
}

function applyTheme(preference) {
  const resolved = preference === 'system' ? resolveSystemTheme() : preference;
  document.documentElement.dataset.theme = resolved;
  document.documentElement.style.colorScheme = resolved;
}

function AppShell() {
  const [preference, setPreference] = useState(getInitialPreference);

  const handleToggle = useCallback((newPref) => {
    setPreference(newPref);
  }, []);

  // Apply theme whenever preference changes, and listen for OS changes when in system mode
  useEffect(() => {
    applyTheme(preference);

    try {
      window.localStorage.setItem('portfolio-theme', preference);
    } catch {
      // The selected theme still applies for the current session.
    }

    if (preference === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => applyTheme('system');
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  }, [preference]);

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="app-sidebar__identity">
          <p className="app-sidebar__name">Chad Bojelador</p>
          <p className="app-sidebar__role">Student Developer</p>
        </div>

        <Navigation />



        <div className="app-sidebar__footer">
          <ThemeToggle theme={preference} onToggle={handleToggle} />

          <div className="app-sidebar__contact">
            <p className="app-sidebar__contact-label">
              For work, collabs &amp; everything else, reach me at
            </p>
            <a
              className="app-sidebar__email"
              href="mailto:slsuls.chadbojelador@gmail.com"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M22 7l-10 7L2 7" />
              </svg>
              slsuls.chadbojelador@gmail.com
            </a>
          </div>
        </div>
      </aside>

      <header className="app-mobile-header">
        <div>
          <p className="app-mobile-header__name">Chad Bojelador</p>
        </div>
        <div className="app-mobile-header__controls">
          <ThemeToggle theme={preference} onToggle={handleToggle} />
          <Navigation />
        </div>
      </header>



      <main className="app-main">
        <Outlet />
      </main>

      <PortfolioChat />
      <FloatingSpotify />
    </div>
  );
}

export default AppShell;
