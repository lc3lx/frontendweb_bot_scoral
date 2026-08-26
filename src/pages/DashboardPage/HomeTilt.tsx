import type { CSSProperties, ReactNode } from 'react';

import { useTilt3d } from '@landing/hooks/useTilt3d';

import styles from './HomeTilt.module.css';

type HomeTiltProps = {
  children: ReactNode;
  className?: string;
  maxTiltDeg?: number;
  liftPx?: number;
  glare?: boolean;
  style?: CSSProperties;
};

/** Pointer-tracked 3D lift for home cards. Disabled on touch and reduced-motion. */
export function HomeTilt({
  children,
  className,
  maxTiltDeg = 7,
  liftPx = 10,
  glare = true,
  style,
}: HomeTiltProps) {
  const ref = useTilt3d<HTMLDivElement>({ maxTiltDeg, liftPx });

  return (
    <div
      ref={ref}
      className={`${styles.tilt} ${glare ? styles.glare : ''} ${className ?? ''}`.trim()}
      style={style}
    >
      {children}
    </div>
  );
}
