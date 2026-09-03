import { useEffect } from 'react';

/**
 * Sets `data-scrolling` on `<html>` while the user is actively scrolling.
 *
 * CSS uses this to pause infinite ambient animations (glow drift, phone float).
 * One attribute on the root avoids the document-wide style recalc that toggling
 * `pointer-events` on `body` caused in profiling.
 */
export function useScrollIdle(scrollEndMs = 120) {
  useEffect(() => {
    const root = document.documentElement;
    let frame = 0;
    let endTimer = 0;
    let scrolling = false;

    const setScrolling = (active: boolean) => {
      if (active === scrolling) return;
      scrolling = active;
      if (active) root.setAttribute('data-scrolling', '');
      else root.removeAttribute('data-scrolling');
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        setScrolling(true);
        window.clearTimeout(endTimer);
        endTimer = window.setTimeout(() => setScrolling(false), scrollEndMs);
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
      window.clearTimeout(endTimer);
      root.removeAttribute('data-scrolling');
    };
  }, [scrollEndMs]);
}
