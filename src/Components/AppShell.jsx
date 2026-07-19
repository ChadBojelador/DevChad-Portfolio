import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';
import PortfolioChat from './PortfolioChat';
import SpotifyPlaylistCard from './SpotifyPlaylistCard';
import ThemeToggle from './ThemeToggle';
import '../Styles/index.css';

function getInitialTheme() {
  if (typeof window === 'undefined') return 'light';

  try {
    const savedTheme = window.localStorage.getItem('portfolio-theme');
    if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;
  } catch {
    // Fall back to the system preference when storage is unavailable.
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function AppShell() {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;

    try {
      window.localStorage.setItem('portfolio-theme', theme);
    } catch {
      // The selected theme still applies for the current session.
    }
  }, [theme]);

  const toggleTheme = () => setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'));

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="app-sidebar__identity">
          <span className="app-sidebar__eyebrow">Portfolio</span>
          <p className="app-sidebar__name">Chad Bojelador</p>
          <p className="app-sidebar__role">Student developer</p>
        </div>

        <Navigation />

        <div className="app-sidebar__music">
          <SpotifyPlaylistCard compact />
        </div>

        <div className="app-sidebar__footer">
          <div className="app-sidebar__availability">
            <span className="app-sidebar__status" aria-hidden="true" />
            Available for thoughtful collaborations
          </div>
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
      </aside>

      <header className="app-mobile-header">
        <div>
          <span className="app-mobile-header__eyebrow">Portfolio</span>
          <p>Chad Bojelador</p>
        </div>
        <div className="app-mobile-header__controls">
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
          <Navigation />
        </div>
      </header>

      <details className="app-mobile-music">
        <summary>Listening to music</summary>
        <SpotifyPlaylistCard compact />
      </details>

      <main className="app-main">
        <Outlet />
      </main>

      <PortfolioChat />
    </div>
  );
}

export default AppShell;
