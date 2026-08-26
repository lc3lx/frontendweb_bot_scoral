import type { HTMLAttributes, ReactNode } from 'react';
import { Text } from '@landing/components/atoms/Text';
import { cn } from '@landing/utils/cn';
import styles from './SectionTitle.module.css';

export type SectionTitleAlign = 'start' | 'center';

export interface SectionTitleProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  align?: SectionTitleAlign;
  titleAs?: 'h1' | 'h2' | 'h3';
}

/**
 * Generic section heading block — Figma SectionTitle (55:32).
 * eyebrow (red uppercase) + title + optional description.
 */
export function SectionTitle({
  eyebrow,
  title,
  description,
  align = 'center',
  titleAs = 'h2',
  className,
  ...rest
}: SectionTitleProps) {
  return (
    <div
      className={cn(styles.root, styles[`align_${align}`], className)}
      {...rest}
    >
      {eyebrow ? (
        <Text as="p" variant="eyebrow" tone="accent" align={align} className={styles.eyebrow}>
          {eyebrow}
        </Text>
      ) : null}

      <Text
        as={titleAs}
        variant="display"
        tone="heading"
        align={align}
        className={styles.title}
      >
        {title}
      </Text>

      {description ? (
        <Text
          as="p"
          variant="body"
          tone="body"
          align={align}
          className={styles.description}
        >
          {description}
        </Text>
      ) : null}
    </div>
  );
}
