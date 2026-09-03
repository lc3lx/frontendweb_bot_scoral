import { useEffect, useState } from 'react';

const REVEAL_SELECTOR = [
  '.motionFadeIn',
  '.motionSlideUp',
  '.motionSlideDown',
  '.motionScaleIn',
  '.motionStaggerChildren',
  '.motionDepthIn',
  '.motionDepthInStart',
  '.motionDepthInEnd',
  '.motionOrbitIn',
  '.motionStaggerDepth',
].join(', ');

/**
 * Adds `.is-visible` when motion targets enter the viewport.
 * Animations are defined in `styles/tokens/motion.css` + `motion3d.css`.
 */
export function useScrollReveal(enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const targets = [...document.querySelectorAll<HTMLElement>(REVEAL_SELECTOR)];

    if (reduced || targets.length === 0) {
      targets.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    // Every target reveals exactly once. Tracking how many are left lets the observer
    // shut down completely when the last one fires — an observer with live targets keeps
    // running computeIntersections on every scroll frame, which showed up in the trace as
    // one of the larger per-frame costs on a long page.
    let remaining = targets.length;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
          remaining -= 1;
        }
        if (remaining <= 0) observer.disconnect();
      },
      {
        root: null,
        rootMargin: '0px 0px -8% 0px',
        threshold: 0.08,
      },
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [enabled]);
}

/** Shows after the user scrolls past `offsetPx`. */
export function useShowOnScroll(offsetPx = 480) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let frame = 0;
    let last = false;

    // Scroll fires far more often than once per frame. Coalescing into a rAF and only
    // publishing an actual change turns a per-event React update into at most one state
    // write per crossing of the threshold.
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const next = window.scrollY > offsetPx;
        if (next !== last) {
          last = next;
          setVisible(next);
        }
      });
    };

    last = window.scrollY > offsetPx;
    setVisible(last);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
    };
  }, [offsetPx]);

  return visible;
}
