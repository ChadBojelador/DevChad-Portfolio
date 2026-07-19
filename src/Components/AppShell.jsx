import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';
import PortfolioChat from './PortfolioChat';
import SpotifyPlaylistCard from './SpotifyPlaylistCard';
import '../Styles/index.css';

function AppShell() {
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
          <span className="app-sidebar__status" aria-hidden="true" />
          Available for thoughtful collaborations
        </div>
      </aside>

      <header className="app-mobile-header">
        <div>
          <span className="app-mobile-header__eyebrow">Portfolio</span>
          <p>Chad Bojelador</p>
        </div>
        <Navigation />
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
