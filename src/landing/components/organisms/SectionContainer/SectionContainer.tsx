import type { HTMLAttributes, ElementType, ReactNode } from 'react';
import { Container } from '@landing/components/molecules/Container';
import type { ContainerWidth } from '@landing/components/molecules/Container';
import { cn } from '@landing/utils/cn';
import styles from './SectionContainer.module.css';

export type SectionBackground = 'default' | 'surface' | 'transparent' | 'glow';
export type SectionSpacing = 'none' | 'sm' | 'md' | 'lg';

export interface SectionContainerProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  /** Anchor id for in-page navigation */
  id?: string;
  background?: SectionBackground;
  spacing?: SectionSpacing;
  width?: ContainerWidth;
  /** Skip inner Container when composing custom full-bleed layouts */
  contained?: boolean;
  children: ReactNode;
}

/**
 * Required wrapper for every Landing section.
 * Owns max-width, gutters, vertical spacing, background, and anchors.
 */
export function SectionContainer({
  as: Tag = 'section',
  id,
  background = 'default',
  spacing = 'lg',
  width = 'content',
  contained = true,
  className,
  children,
  ...rest
}: SectionContainerProps) {
  return (
    <Tag
      id={id}
      className={cn(
        styles.section,
        styles[`bg_${background}`],
        styles[`space_${spacing}`],
        className,
      )}
      {...rest}
    >
      {contained ? (
        <Container width={width} className={styles.inner}>
          {children}
        </Container>
      ) : (
        children
      )}
    </Tag>
  );
}
