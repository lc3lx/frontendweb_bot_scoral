import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@landing/utils/cn';
import styles from './Badge.module.css';

export type BadgeVariant = 'eyebrow' | 'soft' | 'outline';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  startIcon?: ReactNode;
  children: ReactNode;
}

/**
 * Generic badge / pill label.
 * Figma refs: hero eyebrow chip, section eyebrows (via SectionTitle).
 */
export function Badge({
  variant = 'soft',
  startIcon,
  className,
  children,
  ...rest
}: BadgeProps) {
  return (
    <span className={cn(styles.badge, styles[variant], className)} {...rest}>
      {startIcon ? <span className={styles.icon}>{startIcon}</span> : null}
      <span className={styles.label}>{children}</span>
    </span>
  );
}
