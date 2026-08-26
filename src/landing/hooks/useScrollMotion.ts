import { useEffect, useState } from 'react';

const REVEAL_SELECTOR =
  '.motionFadeIn, .motionSlideUp, .motionSlideDown, .motionScaleIn, .motionStaggerChildren';

/**
 * Adds `.is-visible` when motion targets enter the viewport.
 * Animations are defined in `styles/tokens/motion.css`.
 */
export function useScrollReveal(enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const targets = [...document.querySelectorAll<HTMLElement>(REVEAL_SELECTOR)];

    if (reduced) {
      targets.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      },
      {
        root: null,
        rootMargin: '0px 0px -10% 0px',
        threshold: 0.1,
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
    const onScroll = () => {
      setVisible(window.scrollY > offsetPx);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [offsetPx]);

  return visible;
}
