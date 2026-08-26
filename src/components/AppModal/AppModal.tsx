import { useEffect, useId, type ReactNode } from 'react';

import { aiBotAssets } from '@assets';

import styles from './AppModal.module.css';

export type AppModalSize = 'narrow' | 'compact' | 'medium' | 'wide';

type AppModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  size?: AppModalSize;
  figmaNode?: string;
  footer?: ReactNode;
  headerStart?: ReactNode;
  children: ReactNode;
};

const sizeClass: Record<AppModalSize, string> = {
  narrow: styles.panelNarrow,
  compact: styles.panelCompact,
  medium: styles.panelMedium,
  wide: styles.panelWide,
};

export function AppModal({
  isOpen,
  onClose,
  title,
  subtitle,
  size = 'compact',
  figmaNode,
  footer,
  headerStart,
  children,
}: AppModalProps) {
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }

    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className={styles.overlay}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className={`${styles.panel} ${sizeClass[size]}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        data-figma-node={figmaNode}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className={styles.header}>
          {headerStart}
          <div className={styles.headerMain}>
            <h2 id={titleId} className={styles.title}>
              {title}
            </h2>
            {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
          </div>
          <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Close">
            <img className={styles.closeIcon} src={aiBotAssets.iconClose} alt="" aria-hidden="true" />
          </button>
        </div>
        <div className={styles.body}>{children}</div>
        {footer ? <div className={styles.footer}>{footer}</div> : null}
      </div>
    </div>
  );
}
