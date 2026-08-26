import { useEffect, useRef, type RefObject } from 'react';

export type Tilt3dOptions = {
  /** Peak rotation at the edges, in degrees. */
  maxTiltDeg?: number;
  /** How far the surface lifts toward the viewer at full tilt, in px. */
  liftPx?: number;
  /** Set false to leave the element flat (e.g. a section that opted out). */
  enabled?: boolean;
};

const DEFAULTS = { maxTiltDeg: 9, liftPx: 14 } as const;

/**
 * Pointer-driven 3D tilt.
 *
 * Writes `--tilt-x` / `--tilt-y` / `--tilt-lift` and a `--glare-x`/`--glare-y` pair onto
 * the element; the styling lives in `motion3d.css` so a caller only has to add the
 * `tilt3d` class. Values are written straight to the style attribute inside a rAF rather
 * than through React state — this fires on every pointer move, and re-rendering at that
 * rate is what makes tilt effects feel heavy.
 *
 * Skipped entirely on coarse pointers (a finger has no hover) and under
 * `prefers-reduced-motion`.
 */
export function useTilt3d<T extends HTMLElement>({
  maxTiltDeg = DEFAULTS.maxTiltDeg,
  liftPx = DEFAULTS.liftPx,
  enabled = true,
}: Tilt3dOptions = {}): RefObject<T> {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;

    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!finePointer.matches || reduced.matches) return;

    let frame = 0;

    const write = (tiltX: number, tiltY: number, lift: number, gx: number, gy: number) => {
      el.style.setProperty('--tilt-x', `${tiltX.toFixed(2)}deg`);
      el.style.setProperty('--tilt-y', `${tiltY.toFixed(2)}deg`);
      el.style.setProperty('--tilt-lift', `${lift.toFixed(2)}px`);
      el.style.setProperty('--glare-x', `${gx.toFixed(1)}%`);
      el.style.setProperty('--glare-y', `${gy.toFixed(1)}%`);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const rect = el.getBoundingClientRect();
        if (!rect.width || !rect.height) return;

        // -1 … 1 from the centre of the element.
        const px = (event.clientX - rect.left) / rect.width;
        const py = (event.clientY - rect.top) / rect.height;
        const nx = px * 2 - 1;
        const ny = py * 2 - 1;

        // Pointer below centre tips the far edge away, so rotateX is negated.
        write(-ny * maxTiltDeg, nx * maxTiltDeg, liftPx, px * 100, py * 100);
      });
    };

    const onPointerLeave = () => {
      if (frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
      write(0, 0, 0, 50, 50);
    };

    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerleave', onPointerLeave);
    el.addEventListener('pointercancel', onPointerLeave);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerleave', onPointerLeave);
      el.removeEventListener('pointercancel', onPointerLeave);
      onPointerLeave();
    };
  }, [maxTiltDeg, liftPx, enabled]);

  return ref;
}
