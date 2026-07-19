import { useEffect, useRef, useState, useCallback } from 'react';
import '../Styles/pet-sprite.css';

// Sprite states
const STATE = {
  IDLE: 'idle',
  WALK: 'walk',
  JUMP: 'jump',
  FALL: 'fall',
  LAND: 'land',
  SIT: 'sit',
  SLEEP: 'sleep',
};

// Physics constants
const GRAVITY = 0.6;
const JUMP_FORCE = -11;
const WALK_SPEED = 1.8;
const GROUND_FRICTION = 0.85;
const SPRITE_SIZE = 32;

function getTextPlatforms() {
  const selectors = 'h1, h2, h3, h4, p, span.tag, a, .section-label, .outcome-card__number';
  const elements = document.querySelectorAll(`.app-main ${selectors}`);
  const platforms = [];

  elements.forEach((el) => {
    const rect = el.getBoundingClientRect();
    // Only visible elements with real dimensions
    if (rect.width > 10 && rect.height > 5 && rect.top < window.innerHeight * 2) {
      platforms.push({
        x: rect.left + window.scrollX,
        y: rect.top + window.scrollY,
        width: rect.width,
        height: rect.height,
        el,
      });
    }
  });

  // Sort top to bottom for consistent ordering
  platforms.sort((a, b) => a.y - b.y);
  return platforms;
}

function PetSprite() {
  const petRef = useRef(null);
  const stateRef = useRef({
    x: 100,
    y: 200,
    vx: WALK_SPEED,
    vy: 0,
    state: STATE.WALK,
    facing: 1, // 1 = right, -1 = left
    grounded: false,
    currentPlatform: null,
    idleTimer: 0,
    sitTimer: 0,
    sleepTimer: 0,
    jumpCooldown: 0,
    animFrame: 0,
    animTimer: 0,
    platforms: [],
    hidden: false,
  });
  const rafRef = useRef(null);
  const [minimized, setMinimized] = useState(false);

  const refreshPlatforms = useCallback(() => {
    stateRef.current.platforms = getTextPlatforms();
  }, []);

  useEffect(() => {
    // Initial platform scan
    refreshPlatforms();

    // Rescan on scroll/resize
    let scanTimeout;
    const debouncedScan = () => {
      clearTimeout(scanTimeout);
      scanTimeout = setTimeout(refreshPlatforms, 200);
    };

    window.addEventListener('scroll', debouncedScan, { passive: true });
    window.addEventListener('resize', debouncedScan, { passive: true });

    // Watch for DOM changes (route changes etc)
    const observer = new MutationObserver(debouncedScan);
    const main = document.querySelector('.app-main');
    if (main) {
      observer.observe(main, { childList: true, subtree: true });
    }

    // Position the pet on the first available platform
    const s = stateRef.current;
    if (s.platforms.length > 0) {
      const plat = s.platforms[0];
      s.x = plat.x + plat.width / 2;
      s.y = plat.y - SPRITE_SIZE;
      s.currentPlatform = plat;
      s.grounded = true;
    }

    // Main game loop
    const tick = () => {
      if (!minimized) {
        update();
        render();
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('scroll', debouncedScan);
      window.removeEventListener('resize', debouncedScan);
      observer.disconnect();
      clearTimeout(scanTimeout);
    };
  }, [minimized, refreshPlatforms]);

  function findPlatformUnder(x, y, vy) {
    const s = stateRef.current;
    for (const plat of s.platforms) {
      const platTop = plat.y;
      if (
        x >= plat.x - 4 &&
        x <= plat.x + plat.width + 4 &&
        y + SPRITE_SIZE >= platTop &&
        y + SPRITE_SIZE <= platTop + 12 &&
        vy >= 0
      ) {
        return plat;
      }
    }
    return null;
  }

  function pickNearbyPlatform() {
    const s = stateRef.current;
    const candidates = s.platforms.filter((p) => {
      if (p === s.currentPlatform) return false;
      const dx = Math.abs(p.x + p.width / 2 - s.x);
      const dy = p.y - (s.y + SPRITE_SIZE);
      // Can jump to platforms within range (above or slightly below)
      return dx < 300 && dy > -200 && dy < 60;
    });
    if (candidates.length === 0) return null;
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  function update() {
    const s = stateRef.current;

    // Animation frame counter
    s.animTimer++;
    if (s.animTimer >= 8) {
      s.animTimer = 0;
      s.animFrame = (s.animFrame + 1) % 4;
    }

    if (s.jumpCooldown > 0) s.jumpCooldown--;

    switch (s.state) {
    case STATE.WALK: {
      s.x += s.vx;

      // Check if still on current platform
      if (s.currentPlatform) {
        const plat = s.currentPlatform;
        if (s.x < plat.x - 8 || s.x > plat.x + plat.width + 8) {
          // Walked off the edge — decide to turn around or jump
          if (Math.random() < 0.4 && s.jumpCooldown === 0) {
            // Try jumping to another platform
            const target = pickNearbyPlatform();
            if (target) {
              const dx = (target.x + target.width / 2) - s.x;
              s.vx = dx * 0.03;
              s.vy = JUMP_FORCE;
              s.state = STATE.JUMP;
              s.grounded = false;
              s.jumpCooldown = 60;
              break;
            }
          }
          // Turn around
          s.facing *= -1;
          s.vx = WALK_SPEED * s.facing;
          s.x = Math.max(plat.x, Math.min(plat.x + plat.width, s.x));
        }
      }

      // Random behaviors
      s.idleTimer++;
      if (s.idleTimer > 120 + Math.random() * 200) {
        s.idleTimer = 0;
        const roll = Math.random();
        if (roll < 0.25 && s.jumpCooldown === 0) {
          // Jump to a nearby platform
          const target = pickNearbyPlatform();
          if (target) {
            const dx = (target.x + target.width / 2) - s.x;
            s.vx = dx * 0.03;
            s.vy = JUMP_FORCE;
            s.state = STATE.JUMP;
            s.grounded = false;
            s.jumpCooldown = 60;
          }
        } else if (roll < 0.4) {
          s.state = STATE.IDLE;
          s.vx = 0;
          s.sitTimer = 0;
        } else if (roll < 0.55) {
          // Change direction
          s.facing *= -1;
          s.vx = WALK_SPEED * s.facing;
        }
      }
      break;
    }

    case STATE.IDLE: {
      s.sitTimer++;
      if (s.sitTimer > 80 + Math.random() * 60) {
        const roll = Math.random();
        if (roll < 0.4) {
          s.state = STATE.SIT;
          s.sleepTimer = 0;
        } else {
          s.state = STATE.WALK;
          s.facing = Math.random() < 0.5 ? 1 : -1;
          s.vx = WALK_SPEED * s.facing;
          s.idleTimer = 0;
        }
      }
      break;
    }

    case STATE.SIT: {
      s.sleepTimer++;
      if (s.sleepTimer > 180 + Math.random() * 120) {
        if (Math.random() < 0.35) {
          s.state = STATE.SLEEP;
          s.sleepTimer = 0;
        } else {
          s.state = STATE.WALK;
          s.facing = Math.random() < 0.5 ? 1 : -1;
          s.vx = WALK_SPEED * s.facing;
          s.idleTimer = 0;
        }
      }
      break;
    }

    case STATE.SLEEP: {
      s.sleepTimer++;
      if (s.sleepTimer > 300 + Math.random() * 200) {
        s.state = STATE.WALK;
        s.facing = Math.random() < 0.5 ? 1 : -1;
        s.vx = WALK_SPEED * s.facing;
        s.idleTimer = 0;
      }
      break;
    }

    case STATE.JUMP:
    case STATE.FALL: {
      s.vy += GRAVITY;
      s.x += s.vx;
      s.y += s.vy;

      if (s.vy > 0) {
        s.state = STATE.FALL;
      }

      // Check platform collision
      const plat = findPlatformUnder(s.x, s.y, s.vy);
      if (plat) {
        s.y = plat.y - SPRITE_SIZE;
        s.vy = 0;
        s.vx *= GROUND_FRICTION;
        s.grounded = true;
        s.currentPlatform = plat;
        s.state = STATE.LAND;
        s.animTimer = 0;
        s.animFrame = 0;
      }

      // Fell off screen — respawn on a random platform
      if (s.y > window.scrollY + window.innerHeight + 100) {
        const rp = s.platforms[Math.floor(Math.random() * s.platforms.length)];
        if (rp) {
          s.x = rp.x + rp.width / 2;
          s.y = rp.y - SPRITE_SIZE - 50;
          s.vy = 0;
          s.vx = WALK_SPEED * s.facing;
          s.currentPlatform = rp;
          s.state = STATE.FALL;
        }
      }
      break;
    }

    case STATE.LAND: {
      s.sitTimer++;
      if (s.sitTimer > 10) {
        s.state = STATE.WALK;
        s.vx = WALK_SPEED * s.facing;
        s.idleTimer = 0;
        s.sitTimer = 0;
      }
      break;
    }

    default:
      break;
    }
  }

  function render() {
    const el = petRef.current;
    if (!el) return;
    const s = stateRef.current;

    // Convert from document coords to viewport coords
    const viewX = s.x - window.scrollX;
    const viewY = s.y - window.scrollY;

    el.style.transform = `translate(${viewX}px, ${viewY}px) scaleX(${s.facing})`;

    // Update sprite state class
    el.dataset.state = s.state;
    el.dataset.frame = s.animFrame;
  }

  const handleClick = useCallback(() => {
    const s = stateRef.current;
    if (s.grounded && s.state !== STATE.JUMP) {
      // Click makes the pet jump!
      s.vy = JUMP_FORCE * 0.8;
      s.state = STATE.JUMP;
      s.grounded = false;
      s.jumpCooldown = 30;
    }
  }, []);

  if (minimized) {
    return (
      <button
        className="pet-sprite-toggle pet-sprite-toggle--minimized"
        onClick={() => setMinimized(false)}
        aria-label="Show pet"
        title="Bring back the cat!"
      >
        <span className="pet-sprite-toggle__icon">🐱</span>
      </button>
    );
  }

  return (
    <>
      <div
        ref={petRef}
        className="pet-sprite"
        data-state={STATE.WALK}
        data-frame="0"
        onClick={handleClick}
        role="img"
        aria-label="Pet cat walking on text"
        title="Click me to jump!"
      >
        {/* Pixel cat body */}
        <div className="pet-sprite__body">
          {/* Ears */}
          <div className="pet-sprite__ear pet-sprite__ear--left" />
          <div className="pet-sprite__ear pet-sprite__ear--right" />
          {/* Head */}
          <div className="pet-sprite__head">
            <div className="pet-sprite__eye pet-sprite__eye--left" />
            <div className="pet-sprite__eye pet-sprite__eye--right" />
            <div className="pet-sprite__nose" />
            <div className="pet-sprite__mouth" />
          </div>
          {/* Torso */}
          <div className="pet-sprite__torso" />
          {/* Legs */}
          <div className="pet-sprite__leg pet-sprite__leg--fl" />
          <div className="pet-sprite__leg pet-sprite__leg--fr" />
          <div className="pet-sprite__leg pet-sprite__leg--bl" />
          <div className="pet-sprite__leg pet-sprite__leg--br" />
          {/* Tail */}
          <div className="pet-sprite__tail" />
        </div>
        {/* Sleep Z's */}
        <div className="pet-sprite__zzz">
          <span>z</span><span>z</span><span>z</span>
        </div>
      </div>

      <button
        className="pet-sprite-toggle"
        onClick={() => setMinimized(true)}
        aria-label="Hide pet"
        title="Hide the cat"
      >
        ✕
      </button>
    </>
  );
}

export default PetSprite;
