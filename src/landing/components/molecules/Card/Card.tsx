import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@landing/utils/cn';
import styles from './Card.module.css';

export type CardVariant = 'default' | 'glow' | 'flat';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: 'article' | 'div' | 'section';
  variant?: CardVariant;
  padding?: CardPadding;
  children: ReactNode;
}

/**
 * Generic card surface — Figma Article (523:1841).
 * Content (icon/title/body) is composed by callers.
 */
export function Card({
  as: Tag = 'article',
  variant = 'glow',
  padding = 'md',
  className,
  children,
  ...rest
}: CardProps) {
  return (
    <Tag
      className={cn(
        styles.card,
        styles[variant],
        styles[`pad_${padding}`],
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}
