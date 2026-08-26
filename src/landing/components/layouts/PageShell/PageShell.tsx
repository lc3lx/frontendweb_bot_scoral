import type { HTMLAttributes, PropsWithChildren } from 'react';
import { cn } from '@landing/utils/cn';
import styles from './PageShell.module.css';

export interface PageShellProps
  extends PropsWithChildren,
    Omit<HTMLAttributes<HTMLElement>, 'children'> {
  className?: string;
  /** Optional landmark role override */
  as?: 'div' | 'main';
}

/**
 * Structural page shell — responsive content width only.
 * No Landing visual design. Sections mount inside this later.
 */
export function PageShell({
  children,
  className,
  as: Tag = 'main',
  ...rest
}: PageShellProps) {
  return (
    <Tag className={cn(styles.shell, className)} {...rest}>
      {children}
    </Tag>
  );
}
