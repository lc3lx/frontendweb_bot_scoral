import type { HTMLAttributes, ElementType } from 'react';
import { cn } from '@landing/utils/cn';
import styles from './Text.module.css';

export type TextVariant =
  | 'hero'
  | 'display'
  | 'title'
  | 'subtitle'
  | 'body'
  | 'caption'
  | 'label'
  | 'eyebrow';

export type TextTone = 'primary' | 'heading' | 'secondary' | 'body' | 'muted' | 'accent';

export interface TextProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  variant?: TextVariant;
  tone?: TextTone;
  align?: 'start' | 'center' | 'end';
}

export function Text({
  as: Tag = 'p',
  variant = 'body',
  tone = 'primary',
  align = 'start',
  className,
  children,
  ...rest
}: TextProps) {
  return (
    <Tag
      className={cn(
        styles.text,
        styles[variant],
        styles[`tone_${tone}`],
        styles[`align_${align}`],
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}
