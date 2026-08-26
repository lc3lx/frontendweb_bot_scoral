import type { HTMLAttributes, ElementType, ReactNode } from 'react';
import { cn } from '@landing/utils/cn';
import styles from './Container.module.css';

export type ContainerWidth = 'content' | 'narrow' | 'full';

export interface ContainerProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  width?: ContainerWidth;
  children: ReactNode;
}

/**
 * Generic horizontal content constraint.
 * Prefer SectionContainer for full sections.
 */
export function Container({
  as: Tag = 'div',
  width = 'content',
  className,
  children,
  ...rest
}: ContainerProps) {
  return (
    <Tag className={cn(styles.container, styles[width], className)} {...rest}>
      {children}
    </Tag>
  );
}
