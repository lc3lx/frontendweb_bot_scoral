import { useCallback, useEffect, useRef, useState } from 'react';

import { binollaApi } from '@shared/api/endpoints';
import { t } from '@shared/i18n';
import type { BrokerId, GuidedLoginState } from '@shared/api/types';

import styles from './GuidedLoginModal.module.css';

/**
 * Lets the user answer the broker's human check themselves.
 *
 * The broker reports a CAPTCHA as a flag on an API response, not as a picture — the widget
 * only exists inside a live browser session on its page. So the server keeps that browser
 * open and this shows the page as an image: clicks and keystrokes here are replayed into
 * the real page, and the login finishes there.
 *
 * The image is a picture of the broker's own page and nothing else: no input is captured
 * from it, and nothing is sent anywhere except back to that one browser session.
 */

/** How often to ask for a fresh frame while the user is working on the challenge. */
const POLL_MS = 1500;

type GuidedLoginModalProps = {
  isOpen: boolean;
  email: string;
  password: string;
  broker: BrokerId;
  onClose: () => void;
  onConnected: (state: GuidedLoginState) => void;
};

export function GuidedLoginModal({
  isOpen,
  email,
  password,
  broker,
  onClose,
  onConnected,
}: GuidedLoginModalProps) {
  const [state, setState] = useState<GuidedLoginState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const sessionRef = useRef<string | null>(null);
  const doneRef = useRef(false);

  const apply = useCallback(
    (next: GuidedLoginState) => {
      sessionRef.current = next.sessionId;
      setState(next);
      if (next.state === 'success' && !doneRef.current) {
        doneRef.current = true;
        onConnected(next);
      }
      if (next.state === 'failed') setError(next.message ?? t('binolla.auth.loginFailed'));
    },
    [onConnected],
  );

  // Open the session when the modal opens, and always close it on the way out — each one
  // holds a browser on the server.
  useEffect(() => {
    if (!isOpen) return undefined;

    let active = true;
    doneRef.current = false;
    setError(null);
    setState(null);
    setBusy(true);

    binollaApi
      .guidedStart({ email, password, broker })
      .then((next) => {
        if (active) apply(next);
      })
      .catch((err: unknown) => {
        if (active) setError(messageOf(err));
      })
      .finally(() => {
        if (active) setBusy(false);
      });

    return () => {
      active = false;
      const sessionId = sessionRef.current;
      sessionRef.current = null;
      // Not conditional on success: an abandoned session would hold a browser open until
      // the server's own timeout swept it.
      if (sessionId && !doneRef.current) void binollaApi.guidedCancel(sessionId).catch(() => {});
    };
  }, [apply, broker, email, isOpen, password]);

  // Keep the frame current. The page can also finish on its own once a challenge passes,
  // so polling is what notices that without the user clicking again.
  useEffect(() => {
    if (!isOpen || !state || state.state !== 'awaiting-user') return undefined;

    const timer = window.setInterval(() => {
      const sessionId = sessionRef.current;
      if (!sessionId || doneRef.current) return;
      void binollaApi
        .guidedState(sessionId)
        .then(apply)
        .catch(() => {
          /* a dropped poll is not worth surfacing; the next one retries */
        });
    }, POLL_MS);

    return () => window.clearInterval(timer);
  }, [apply, isOpen, state]);

  const send = useCallback(
    async (event: Parameters<typeof binollaApi.guidedEvent>[0]) => {
      const sessionId = sessionRef.current;
      if (!sessionId || doneRef.current) return;
      setBusy(true);
      try {
        apply(await binollaApi.guidedEvent(event));
      } catch (err) {
        setError(messageOf(err));
      } finally {
        setBusy(false);
      }
    },
    [apply],
  );

  const onImageClick = (event: React.MouseEvent<HTMLImageElement>) => {
    const image = imageRef.current;
    const sessionId = sessionRef.current;
    if (!image || !sessionId || !state) return;

    // The image is displayed at whatever width fits the screen, so the click has to be
    // scaled back into the page's own pixel space or it lands somewhere else entirely.
    const rect = image.getBoundingClientRect();
    const scaleX = state.width / rect.width;
    const scaleY = state.height / rect.height;

    void send({
      sessionId,
      type: 'click',
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    });
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    const sessionId = sessionRef.current;
    if (!sessionId) return;

    if (event.key.length === 1) {
      event.preventDefault();
      void send({ sessionId, type: 'type', text: event.key });
      return;
    }
    if (['Enter', 'Backspace', 'Tab', 'Delete', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
      event.preventDefault();
      void send({ sessionId, type: 'key', key: event.key });
    }
  };

  if (!isOpen) return null;

  const connected = state?.state === 'success';

  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true">
      <div className={styles.panel}>
        <header className={styles.head}>
          <div>
            <h2 className={styles.title}>{t('binolla.guided.title')}</h2>
            <p className={styles.subtitle}>{t('binolla.guided.subtitle')}</p>
          </div>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>

        {error ? <p className={styles.error}>{error}</p> : null}

        <div
          className={styles.stage}
          tabIndex={0}
          onKeyDown={onKeyDown}
          role="application"
          aria-label={t('binolla.guided.title')}
        >
          {state?.screenshot ? (
            <img
              ref={imageRef}
              className={styles.frame}
              src={state.screenshot}
              alt={t('binolla.guided.frameAlt')}
              onClick={onImageClick}
              draggable={false}
            />
          ) : (
            <div className={styles.loading}>{t('binolla.guided.loading')}</div>
          )}

          {busy ? <span className={styles.busy} aria-hidden="true" /> : null}
        </div>

        <footer className={styles.foot}>
          <p className={styles.hint}>
            {connected ? t('binolla.guided.done') : t('binolla.guided.hint')}
          </p>
          <button
            type="button"
            className={styles.secondary}
            onClick={() => {
              const sessionId = sessionRef.current;
              if (sessionId) void send({ sessionId, type: 'refresh' });
            }}
            disabled={connected}
          >
            {t('binolla.guided.refresh')}
          </button>
        </footer>
      </div>
    </div>
  );
}

function messageOf(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  return t('binolla.auth.loginFailed');
}
