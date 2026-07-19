import { useState, useRef, useCallback, useEffect } from 'react';
import { spotifyCard } from '../data/spotifyCard';
import { FaSpotify } from 'react-icons/fa';
import '../Styles/floating-spotify.css';

const SPOTIFY_TRACK_ID_REGEX = /^[A-Za-z0-9]{22}$/;

function toEmbedTrackUrl(trackUrl) {
  if (typeof trackUrl !== 'string') return null;
  const value = trackUrl.trim();
  if (!value) return null;

  let trackId = null;

  if (value.startsWith('spotify:track:')) {
    const idFromUri = value.split(':')[2];
    if (SPOTIFY_TRACK_ID_REGEX.test(idFromUri || '')) {
      trackId = idFromUri;
    }
  } else {
    try {
      const parsed = new URL(value);
      const segments = parsed.pathname.split('/').filter(Boolean);
      const trackIndex = segments.findIndex((s) => s === 'track');
      if (trackIndex >= 0 && segments[trackIndex + 1]) {
        const idFromPath = segments[trackIndex + 1];
        if (SPOTIFY_TRACK_ID_REGEX.test(idFromPath)) {
          trackId = idFromPath;
        }
      }
    } catch {
      return null;
    }
  }

  return trackId ? `https://open.spotify.com/embed/track/${trackId}` : null;
}

const DEFAULT_POSITION = { x: 24, y: 24 };
const STORAGE_KEY = 'spotify-widget-pos';

function clampPosition(x, y, width, height) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  return {
    x: Math.max(0, Math.min(x, vw - width)),
    y: Math.max(0, Math.min(y, vh - height)),
  };
}

function loadPosition() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && typeof saved.x === 'number' && typeof saved.y === 'number') return saved;
  } catch {
    // ignore
  }
  return DEFAULT_POSITION;
}

function FloatingSpotify() {
  const embedUrl = toEmbedTrackUrl(spotifyCard.trackUrl);
  const [minimized, setMinimized] = useState(false);
  const [position, setPosition] = useState(loadPosition);
  const [isDragging, setIsDragging] = useState(false);

  const widgetRef = useRef(null);
  const dragState = useRef(null); // { startMouseX, startMouseY, startX, startY }

  // Persist position
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(position));
    } catch {
      // ignore
    }
  }, [position]);

  // Clamp on resize
  useEffect(() => {
    function onResize() {
      const el = widgetRef.current;
      if (!el) return;
      const { width, height } = el.getBoundingClientRect();
      setPosition((prev) => clampPosition(prev.x, prev.y, width, height));
    }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const onMouseDown = useCallback((e) => {
    // Only drag on the header bar
    if (e.button !== 0) return;
    e.preventDefault();
    dragState.current = {
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startX: position.x,
      startY: position.y,
    };
    setIsDragging(true);
  }, [position]);

  const onMouseMove = useCallback((e) => {
    if (!dragState.current) return;
    const dx = e.clientX - dragState.current.startMouseX;
    const dy = e.clientY - dragState.current.startMouseY;
    const newX = dragState.current.startX + dx;
    const newY = dragState.current.startY + dy;
    const el = widgetRef.current;
    const width = el ? el.offsetWidth : 280;
    const height = el ? el.offsetHeight : 160;
    setPosition(clampPosition(newX, newY, width, height));
  }, []);

  const onMouseUp = useCallback(() => {
    dragState.current = null;
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDragging, onMouseMove, onMouseUp]);

  // Touch support
  const onTouchStart = useCallback((e) => {
    const touch = e.touches[0];
    dragState.current = {
      startMouseX: touch.clientX,
      startMouseY: touch.clientY,
      startX: position.x,
      startY: position.y,
    };
    setIsDragging(true);
  }, [position]);

  const onTouchMove = useCallback((e) => {
    if (!dragState.current) return;
    const touch = e.touches[0];
    const dx = touch.clientX - dragState.current.startMouseX;
    const dy = touch.clientY - dragState.current.startMouseY;
    const newX = dragState.current.startX + dx;
    const newY = dragState.current.startY + dy;
    const el = widgetRef.current;
    const width = el ? el.offsetWidth : 280;
    const height = el ? el.offsetHeight : 160;
    setPosition(clampPosition(newX, newY, width, height));
  }, []);

  const onTouchEnd = useCallback(() => {
    dragState.current = null;
    setIsDragging(false);
  }, []);

  return (
    <div
      ref={widgetRef}
      className={`floating-spotify${minimized ? ' floating-spotify--minimized' : ''}${isDragging ? ' floating-spotify--dragging' : ''}`}
      style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
      aria-label="Floating Spotify player"
      role="region"
    >
      {/* Drag handle / header */}
      <div
        className="floating-spotify__header"
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <span className="floating-spotify__icon" aria-hidden="true">
          <FaSpotify />
        </span>
        <span className="floating-spotify__label">
          {minimized ? spotifyCard.playlistTitle || 'Now Playing' : "I'm Listening to"}
        </span>

        <button
          className="floating-spotify__toggle"
          onClick={() => setMinimized((v) => !v)}
          aria-label={minimized ? 'Expand player' : 'Minimize player'}
          title={minimized ? 'Expand' : 'Minimize'}
        >
          {minimized ? (
            // Expand icon
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 3 21 3 21 9" />
              <polyline points="9 21 3 21 3 15" />
              <line x1="21" y1="3" x2="14" y2="10" />
              <line x1="3" y1="21" x2="10" y2="14" />
            </svg>
          ) : (
            // Minimize icon
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          )}
        </button>
      </div>

      {/* Expandable body */}
      <div className="floating-spotify__body">
        {embedUrl ? (
          <div className="floating-spotify__embed-wrap">
            <iframe
              className="floating-spotify__embed"
              src={embedUrl}
              title="Spotify player"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              scrolling="no"
            />
          </div>
        ) : (
          <p className="floating-spotify__fallback">
            Spotify embed unavailable.
          </p>
        )}
      </div>
    </div>
  );
}

export default FloatingSpotify;
