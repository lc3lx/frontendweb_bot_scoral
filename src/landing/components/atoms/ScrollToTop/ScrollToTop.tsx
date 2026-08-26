import { useShowOnScroll } from '@landing/hooks/useScrollMotion';
import { useI18n } from '@landing/i18n';
import { cn } from '@landing/utils/cn';
import styles from './ScrollToTop.module.css';

export interface ScrollToTopProps {
  className?: string;
  /** Show after scrolling this many pixels. */
  offsetPx?: number;
}

/**
 * Floating control — scrolls the page back to the top.
 */
export function ScrollToTop({ className, offsetPx = 480 }: ScrollToTopProps) {
  const visible = useShowOnScroll(offsetPx);
  const { t } = useI18n();

  const scrollUp = () => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  };

  return (
    <button
      type="button"
      className={cn(styles.button, visible && styles.visible, className)}
      onClick={scrollUp}
      aria-label={t.a11y.backToTop}
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
    >
      <svg
        className={styles.icon}
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M10 4.5L10 15.5M10 4.5L5.5 9M10 4.5L14.5 9"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
