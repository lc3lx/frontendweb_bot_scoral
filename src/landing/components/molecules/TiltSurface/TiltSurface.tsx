import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';
import { useTilt3d } from '@landing/hooks/useTilt3d';
import { cn } from '@landing/utils/cn';

type TiltSurfaceOwnProps<T extends ElementType> = {
  as?: T;
  children: ReactNode;
  maxTiltDeg?: number;
  liftPx?: number;
  glare?: boolean;
  layer?: 'none' | 'near' | 'far';
  enabled?: boolean;
  className?: string;
};

type TiltSurfaceProps<T extends ElementType> = TiltSurfaceOwnProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof TiltSurfaceOwnProps<T>>;

/**
 * Pointer-tracked 3D surface. Safe on touch — tilt is disabled for coarse pointers.
 */
export function TiltSurface<T extends ElementType = 'div'>({
  as,
  children,
  className,
  maxTiltDeg = 8,
  liftPx = 12,
  glare = true,
  layer = 'none',
  enabled = true,
  ...rest
}: TiltSurfaceProps<T>) {
  const Tag = (as ?? 'div') as ElementType;
  const ref = useTilt3d<HTMLElement>({ maxTiltDeg, liftPx, enabled });

  return (
    <Tag
      ref={ref}
      className={cn(
        'tilt3d',
        glare && 'tilt3dGlare',
        layer === 'near' && 'tilt3dLayer',
        layer === 'far' && 'tilt3dLayerDeep',
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}
