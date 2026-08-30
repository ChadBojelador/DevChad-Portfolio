import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import './DepthCarousel.css';

const DEFAULT_ITEMS = [
  { image: 'https://picsum.photos/seed/depth1/800/1000', alt: 'Slide 1' },
  { image: 'https://picsum.photos/seed/depth2/800/1000', alt: 'Slide 2' },
  { image: 'https://picsum.photos/seed/depth3/800/1000', alt: 'Slide 3' },
  { image: 'https://picsum.photos/seed/depth4/800/1000', alt: 'Slide 4' },
  { image: 'https://picsum.photos/seed/depth5/800/1000', alt: 'Slide 5' },
  { image: 'https://picsum.photos/seed/depth6/800/1000', alt: 'Slide 6' }
];

const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
const normalizeItem = it => (typeof it === 'string' ? { image: it, alt: '' } : it);

const DepthCarousel = ({
  items = DEFAULT_ITEMS,
  cardWidth = 300,
  cardHeight = 380,
  radius = 18,
  tint = '#05060a',
  depth = 220,
  spread = 90,
  tilt = 22,
  tiltDirection = 'right',
  perspective = 1400,
  visibleCards = 4,
  falloff = 0.2,
  blur = 6,
  duration = 700,
  ease = 'power3.out',
  autoplay = false,
  autoplayDelay = 3200,
  loop = true,
  showControls = true,
  showIndicators = true,
  onChange,
  variant = 'depth',
  className = ''
}) => {
  const data = useMemo(() => (Array.isArray(items) ? items : []).map(normalizeItem), [items]);
  const count = data.length;

  const rootRef = useRef(null);
  const stageRef = useRef(null);
  const cardRefs = useRef([]);
  const overlayRefs = useRef([]);

  const posRef = useRef(0);
  const focusRef = useRef(0);
  const storyPointerRef = useRef({ x: 0, y: 0 });
  const tweenRef = useRef(null);
  const scaleRef = useRef(1);
  const cfgRef = useRef({});
  const onChangeRef = useRef(onChange);

  const dragRef = useRef(null);
  const wheelTimerRef = useRef(null);
  const autoTimerRef = useRef(null);
  const reducedRef = useRef(false);

  const [active, setActive] = useState(0);
  const [likedItems, setLikedItems] = useState(() => new Set());

  useEffect(() => {
    onChangeRef.current = onChange;
    cfgRef.current = {
      count,
      depth,
      spread,
      tilt,
      tiltDirection,
      visibleCards,
      falloff,
      blur,
      duration,
      ease,
      loop,
      cardWidth,
      cardHeight,
      variant,
      autoplayDelay
    };
  }, [
    autoplayDelay,
    blur,
    cardWidth,
    cardHeight,
    count,
    depth,
    duration,
    ease,
    falloff,
    loop,
    onChange,
    spread,
    tilt,
    tiltDirection,
    variant,
    visibleCards
  ]);

  const layout = useCallback(pos => {
    const cfg = cfgRef.current;
    const n = cfg.count;
    if (!n) return;
    const dir = cfg.tiltDirection === 'left' ? -1 : 1;
    const sc = scaleRef.current;
    const isStory = cfg.variant === 'story';
    const storyPointer = storyPointerRef.current;
    const storyVisibleCards = isStory
      ? Math.min(cfg.count, cfg.viewportWidth < 560 ? 2 : cfg.visibleCards)
      : cfg.visibleCards;

    for (let i = 0; i < n; i++) {
      const el = cardRefs.current[i];
      if (!el) continue;

      let d = i - pos;
      if (cfg.loop && n > 1) {
        d = ((d % n) + n) % n;
        if (d > n / 2) d -= n;
      }

      const storyOffset = isStory && storyVisibleCards % 2 === 0 ? 0.5 : 0;
      const storyDistance = isStory ? d - storyOffset : d;
      const az = Math.abs(storyDistance);
      const storyRange = Math.max(0, (storyVisibleCards - 1) / 2);
      const shown = isStory ? az <= storyRange + 0.52 : az <= cfg.visibleCards + 0.5;
      // Story cards occupy their own fixed slots, separated by a small gap.
      // This keeps the visible set side by side instead of layered in depth.
      const storyGap = cfg.viewportWidth >= 700 ? 48 : 18;
      const storyTravel = cfg.cardWidth + storyGap / sc;
      const storyParallax = isStory ? (i % 2 === 0 ? 0.32 : -0.32) : 0;
      const tx = isStory ? storyDistance * storyTravel + storyPointer.x * storyParallax : dir * cfg.spread * d;
      const ty = isStory ? (i % 3 === 0 ? 10 : i % 3 === 1 ? -8 : 4) + storyPointer.y * (0.3 + (i % 2) * 0.12) : 0;
      const rz = isStory ? (i % 3 === 0 ? -6 : i % 3 === 1 ? 5 : -3) : 0;
      const tz = isStory ? 0 : -cfg.depth * d;
      const ry = isStory ? 0 : dir * cfg.tilt * clamp(d, 0, 1);

      let opacity = isStory
        ? clamp(1 - Math.max(0, az - storyRange) * 0.35, 0, 1)
        : d < 0 ? Math.max(0, 1 + d) : 1;
      if (!shown) opacity = 0;

      const back = Math.max(0, d);
      const brightness = isStory ? 1 : Math.max(0.15, 1 - back * cfg.falloff);
      const blurPx = isStory ? 0 : cfg.blur > 0 ? Math.min(cfg.blur, (back / Math.max(1, cfg.visibleCards)) * cfg.blur) : 0;
      const zi = Math.round(2000 - az * 20);

      el.style.transform = `translate(-50%, -50%) scale(${sc}) translateX(${tx.toFixed(2)}px) translateY(${ty.toFixed(2)}px) translateZ(${tz.toFixed(2)}px) rotateY(${ry.toFixed(3)}deg) rotateZ(${rz.toFixed(3)}deg)`;
      el.style.opacity = opacity.toFixed(3);
      el.style.filter = `brightness(${brightness.toFixed(3)}) blur(${blurPx.toFixed(2)}px)`;
      el.style.zIndex = String(zi);
      el.style.pointerEvents = shown && opacity > 0.05 ? 'auto' : 'none';

      const ov = overlayRefs.current[i];
      if (ov) ov.style.opacity = isStory ? '0' : clamp(back * cfg.falloff * 1.25, 0, 0.86).toFixed(3);
    }
  }, []);

  const notify = useCallback(idx => {
    setActive(idx);
    onChangeRef.current?.(idx, data[idx]);
  }, [data]);

  const tweenTo = useCallback((target, animate) => {
    tweenRef.current?.kill();
    const cfg = cfgRef.current;
    const proxy = { p: posRef.current };
    const dur = animate && !reducedRef.current ? cfg.duration / 1000 : 0;
    tweenRef.current = gsap.to(proxy, {
      p: target,
      duration: dur,
      ease: cfg.ease,
      onUpdate: () => {
        posRef.current = proxy.p;
        layout(proxy.p);
      },
      onComplete: () => {
        const n = cfg.count;
        if (n > 0) posRef.current = ((posRef.current % n) + n) % n;
        layout(posRef.current);
      }
    });
  }, [layout]);

  const setFocus = useCallback((rawIndex, animate = true) => {
    const cfg = cfgRef.current;
    const n = cfg.count;
    if (!n) return;
    const idx = cfg.loop ? ((rawIndex % n) + n) % n : clamp(rawIndex, 0, n - 1);
    let delta = idx - posRef.current;
    if (cfg.loop && n > 1) {
      delta = ((delta % n) + n) % n;
      if (delta > n / 2) delta -= n;
    }
    tweenTo(posRef.current + delta, animate);
    if (idx !== focusRef.current) {
      focusRef.current = idx;
      notify(idx);
    }
  }, [tweenTo, notify]);

  const navigateBy = useCallback(step => setFocus(focusRef.current + step, true), [setFocus]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const ro = new ResizeObserver(entries => {
      const { width: w, height: h } = entries[0].contentRect;
      const cfg = cfgRef.current;
      cfg.viewportWidth = w;
      const storyVisibleCards = cfg.variant === 'story'
        ? Math.min(cfg.count, w < 560 ? 2 : cfg.visibleCards)
        : cfg.visibleCards;
      const storyGap = w >= 700 ? 48 : 18;
      const needed = cfg.variant === 'story'
        ? cfg.cardWidth * storyVisibleCards + storyGap * Math.max(0, storyVisibleCards - 1) + 32
        : cfg.cardWidth + Math.abs(cfg.spread) * 2 + 120;
      const widthScale = w / needed;
      const heightScale = cfg.variant === 'story' ? h / (cfg.cardHeight + 28) : 1;
      scaleRef.current = clamp(
        cfg.variant === 'story' ? Math.min(widthScale, heightScale) : widthScale,
        cfg.variant === 'story' ? 0.28 : 0.4,
        1
      );
      layout(posRef.current);
    });
    ro.observe(root);
    return () => ro.disconnect();
  }, [layout]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const onWheel = e => {
      const cfg = cfgRef.current;
      if (cfg.count < 2) return;
      e.preventDefault();
      tweenRef.current?.kill();
      const raw = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      const delta = e.deltaMode === 1 ? raw * 24 : raw;
      const step = clamp(delta / (cfg.cardWidth * 0.9), -0.6, 0.6);
      posRef.current += step;
      layout(posRef.current);
      if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
      wheelTimerRef.current = setTimeout(() => setFocus(Math.round(posRef.current), true), 130);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', onWheel);
      if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
    };
  }, [layout, setFocus]);

  const onPointerDown = useCallback(e => {
    const cfg = cfgRef.current;
    if (cfg.count < 2) return;
    tweenRef.current?.kill();
    dragRef.current = {
      x: e.clientX,
      startPos: posRef.current,
      lastX: e.clientX,
      lastT: performance.now(),
      v: 0,
      moved: false,
      id: e.pointerId
    };
  }, []);

  const onPointerMove = useCallback(e => {
    const drag = dragRef.current;
    const root = rootRef.current;
    const cfg = cfgRef.current;
    if (cfg.variant === 'story' && root) {
      const bounds = root.getBoundingClientRect();
      storyPointerRef.current = {
        x: ((e.clientX - bounds.left) / bounds.width - 0.5) * 14,
        y: ((e.clientY - bounds.top) / bounds.height - 0.5) * 10
      };
    }
    if (!drag) {
      if (cfg.variant === 'story') layout(posRef.current);
      return;
    }
    const stepPx = Math.max(cfg.cardWidth * 0.55 * scaleRef.current, 40);
    const dx = e.clientX - drag.x;
    if (!drag.moved && Math.abs(dx) > 4) {
      drag.moved = true;
      rootRef.current?.setPointerCapture(drag.id);
    }
    if (!drag.moved) return;
    const now = performance.now();
    const dt = Math.max(now - drag.lastT, 1);
    drag.v = (e.clientX - drag.lastX) / dt;
    drag.lastX = e.clientX;
    drag.lastT = now;
    posRef.current = drag.startPos - dx / stepPx;
    layout(posRef.current);
  }, [layout]);

  const resetStoryPointer = useCallback(() => {
    if (cfgRef.current.variant !== 'story') return;
    storyPointerRef.current = { x: 0, y: 0 };
    layout(posRef.current);
  }, [layout]);

  const onPointerEnd = useCallback(() => {
    const drag = dragRef.current;
    if (!drag) return;
    dragRef.current = null;
    if (!drag.moved) return;
    const cfg = cfgRef.current;
    const stepPx = Math.max(cfg.cardWidth * 0.55 * scaleRef.current, 40);
    const projected = posRef.current - (drag.v * 180) / stepPx;
    setFocus(Math.round(projected), true);
  }, [setFocus]);

  const onKeyDown = useCallback(e => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      navigateBy(-1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      navigateBy(1);
    }
  }, [navigateBy]);

  const onCardClick = useCallback(index => {
    if (dragRef.current?.moved) return;
    setFocus(index, true);
  }, [setFocus]);

  const toggleLike = useCallback((event, index) => {
    event.stopPropagation();
    setLikedItems(previous => {
      const next = new Set(previous);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }, []);

  useEffect(() => {
    reducedRef.current = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!autoplay || reducedRef.current || count < 2) return;
    const root = rootRef.current;
    let hovered = false;
    let focused = false;
    const stop = () => {
      if (autoTimerRef.current) clearInterval(autoTimerRef.current);
      autoTimerRef.current = null;
    };
    const start = () => {
      stop();
      autoTimerRef.current = window.setInterval(() => {
        if (!hovered && !focused) navigateBy(1);
      }, Math.max(cfgRef.current.autoplayDelay, 600));
    };
    const onEnter = () => {
      hovered = true;
    };
    const onLeave = () => {
      hovered = false;
    };
    const onFocusIn = () => {
      focused = true;
    };
    const onFocusOut = () => {
      focused = false;
    };
    root?.addEventListener('mouseenter', onEnter);
    root?.addEventListener('mouseleave', onLeave);
    root?.addEventListener('focusin', onFocusIn);
    root?.addEventListener('focusout', onFocusOut);
    start();
    return () => {
      stop();
      root?.removeEventListener('mouseenter', onEnter);
      root?.removeEventListener('mouseleave', onLeave);
      root?.removeEventListener('focusin', onFocusIn);
      root?.removeEventListener('focusout', onFocusOut);
    };
  }, [autoplay, autoplayDelay, count, navigateBy]);

  useEffect(() => {
    layout(posRef.current);
  }, [layout, depth, spread, tilt, tiltDirection, visibleCards, falloff, blur, cardWidth, cardHeight, radius, count, variant]);

  useEffect(() => () => {
    tweenRef.current?.kill();
    if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
    if (autoTimerRef.current) clearInterval(autoTimerRef.current);
  }, []);

  return (
    <div
      ref={rootRef}
      className={`depth-carousel${variant === 'story' ? ' depth-carousel--story' : ''}${className ? ` ${className}` : ''}`}
      style={{ '--dc-perspective': `${perspective}px` }}
      role="group"
      aria-roledescription="carousel"
      aria-label={variant === 'story' ? 'Early chapters stories' : 'Depth carousel'}
      tabIndex={0}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerLeave={resetStoryPointer}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
      onKeyDown={onKeyDown}>
      <div className="depth-carousel__stage" ref={stageRef}>
        {data.map((item, i) => (
          <div
            key={i}
            className="depth-carousel__card"
            ref={el => (cardRefs.current[i] = el)}
            style={{ width: cardWidth, height: cardHeight, borderRadius: radius, opacity: i === 0 ? 1 : 0 }}
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}`}
            aria-hidden={active !== i}
            onClick={() => onCardClick(i)}>
            <img
              className="depth-carousel__img"
              src={item.image}
              alt={item.alt || ''}
              draggable={false} />
            <span
              className="depth-carousel__tint"
              ref={el => (overlayRefs.current[i] = el)}
              style={{ background: tint }} />
            {variant === 'story' && (
              <div className="depth-carousel__story-interface">
                <button
                  className={likedItems.has(i) ? 'depth-carousel__story-like is-liked' : 'depth-carousel__story-like'}
                  type="button"
                  aria-label={likedItems.has(i) ? `Unlike story ${i + 1}` : `Like story ${i + 1}`}
                  aria-pressed={likedItems.has(i)}
                  onClick={event => toggleLike(event, i)}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.7a5.4 5.4 0 0 0-7.6 0L12 5.9l-1.2-1.2a5.4 5.4 0 0 0-7.6 7.6L12 21l8.8-8.7a5.4 5.4 0 0 0 0-7.6Z" /></svg>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {showControls && count > 1 && (
        <>
          <button
            type="button"
            className="depth-carousel__arrow depth-carousel__arrow--prev"
            aria-label="Previous slide"
            onClick={() => navigateBy(-1)}>
            <svg viewBox="0 24" width="20" height="20" aria-hidden="true">
              <path
                d="M15 5l-7 7 7 7"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            className="depth-carousel__arrow depth-carousel__arrow--next"
            aria-label="Next slide"
            onClick={() => navigateBy(1)}>
            <svg viewBox="0 24" width="20" height="20" aria-hidden="true">
              <path
                d="M9 5l7 7-7 7"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round" />
            </svg>
          </button>
        </>
      )}

      {showIndicators && count > 1 && (
        <div className="depth-carousel__dots" role="tablist" aria-label="Slides">
          {data.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={active === i}
              aria-label={`Go to slide ${i + 1}`}
              className={`depth-carousel__dot${active === i ? 'is-active' : ''}`}
              onClick={() => setFocus(i, true)} />
          ))}
        </div>
      )}
    </div>
  );
};

export default DepthCarousel;
