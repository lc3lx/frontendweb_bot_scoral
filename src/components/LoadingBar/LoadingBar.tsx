import { useEffect, useState } from 'react';

import { subscribeRequestActivity } from '@shared/api/requestActivity';

import styles from './LoadingBar.module.css';

/**
 * A thin progress bar across the top of the app while it is waiting on the server.
 *
 * Shows for ANY in-flight request, so a slow page, a slow chart poll and a slow login all
 * look the same to the user: the app is working. Without it a slow response is
 * indistinguishable from a frozen screen, which is what "the site feels stuck" usually
 * turns out to be.
 */

/**
 * Requests faster than this never show the bar. Most calls finish in tens of
 * milliseconds, and flashing a bar for each one reads as flicker, not progress.
 */
const SHOW_AFTER_MS = 250;

/**
 * Once shown, stay up at least this long. A bar that appears and vanishes within a frame
 * is more distracting than no bar at all.
 */
const MIN_VISIBLE_MS = 400;

export function LoadingBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let showTimer: number | undefined;
    let hideTimer: number | undefined;
    let shownAt = 0;

    const unsubscribe = subscribeRequestActivity((pending) => {
      if (pending > 0) {
        if (hideTimer !== undefined) {
          window.clearTimeout(hideTimer);
          hideTimer = undefined;
        }
        if (!visible && showTimer === undefined) {
          showTimer = window.setTimeout(() => {
            showTimer = undefined;
            shownAt = Date.now();
            setVisible(true);
          }, SHOW_AFTER_MS);
        }
        return;
      }

      // Nothing in flight: cancel a pending show, or schedule the hide.
      if (showTimer !== undefined) {
        window.clearTimeout(showTimer);
        showTimer = undefined;
        return;
      }
      if (hideTimer === undefined) {
        const held = Date.now() - shownAt;
        hideTimer = window.setTimeout(
          () => {
            hideTimer = undefined;
            setVisible(false);
          },
          Math.max(0, MIN_VISIBLE_MS - held),
        );
      }
    });

    return () => {
      unsubscribe();
      if (showTimer !== undefined) window.clearTimeout(showTimer);
      if (hideTimer !== undefined) window.clearTimeout(hideTimer);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div className={styles.track} role="status" aria-live="polite" aria-label="Loading">
      <div className={styles.bar} />
    </div>
  );
}
