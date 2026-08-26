import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';

import type { TradingCandle } from '../data/trading.mock';
import styles from './CandlestickChart.module.css';

export type ChartEntryMarker = {
  timeSec: number;
  price?: number;
  direction: 'up' | 'down' | string;
  label: string;
};

type CandlestickChartProps = {
  candles: TradingCandle[];
  height?: number;
  entryMarker?: ChartEntryMarker | null;
};

const UP = '#12e655';
const DOWN = '#ef4444';
const ENTRY_UP = '#22c55e';
const ENTRY_DOWN = '#f0454e';
const GRID = 'rgba(42, 46, 57, 0.95)';
const AXIS = '#787b86';
const CROSS = 'rgba(120, 123, 134, 0.55)';
const BG = '#131722';
const DEFAULT_BARS = 32;
const MIN_BARS = 8;
const MAX_BARS = 120;

function isDownDirection(direction: string | undefined): boolean {
  const d = (direction ?? '').toUpperCase();
  return d === 'PUT' || d === 'DOWN';
}

function findCandleIndexByTime(candles: TradingCandle[], timeSec: number): number {
  let best = -1;
  for (let i = 0; i < candles.length; i += 1) {
    const t = candles[i]?.time;
    if (t == null) continue;
    if (t <= timeSec) best = i;
  }
  if (best < 0 && candles.length > 0) return candles.length - 1;
  return best;
}

type PriceDomain = { lo: number; hi: number };

function sanitize(point: TradingCandle): TradingCandle {
  const open = point.open;
  const close = point.close;
  let high = point.high;
  let low = point.low;
  if (low > high) {
    const t = low;
    low = high;
    high = t;
  }
  return {
    ...point,
    open,
    close,
    high: Math.max(high, open, close),
    low: Math.min(low, open, close),
  };
}

function formatPrice(value: number, range: number): string {
  if (range >= 100) return value.toFixed(2);
  if (range >= 1) return value.toFixed(4);
  if (range >= 0.01) return value.toFixed(5);
  return value.toFixed(6);
}

function formatCandleTime(timeSec: number | undefined): string {
  if (timeSec == null || !Number.isFinite(timeSec)) return '';
  const d = new Date(timeSec * 1000);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function domainFrom(points: TradingCandle[], extra: number[] = []): PriceDomain {
  const lows = points.map((p) => p.low);
  const highs = points.map((p) => p.high);
  const minPrice = Math.min(...lows, ...extra);
  const maxPrice = Math.max(...highs, ...extra);
  const span = Math.max(maxPrice - minPrice, Math.abs(maxPrice) * 1e-4, 1e-5);
  const pad = span * 0.18;
  return { lo: minPrice - pad, hi: maxPrice + pad };
}

function domainTrackingFocus(points: TradingCandle[], focus: number, extra: number[] = []): PriceDomain {
  const minPrice = Math.min(...points.map((p) => p.low), focus, ...extra);
  const maxPrice = Math.max(...points.map((p) => p.high), focus, ...extra);
  const dataSpan = Math.max(maxPrice - minPrice, Math.abs(focus) * 1e-4, 1e-5);
  const above = Math.max(maxPrice - focus, dataSpan * 0.45);
  const below = Math.max(focus - minPrice, dataSpan * 0.45);
  const half = Math.max(above, below) * 1.28;
  return { lo: focus - half, hi: focus + half };
}

function lerpDomain(prev: PriceDomain | null, next: PriceDomain, t: number): PriceDomain {
  if (!prev) return next;
  return {
    lo: prev.lo + (next.lo - prev.lo) * t,
    hi: prev.hi + (next.hi - prev.hi) * t,
  };
}

export function CandlestickChart({ candles, height = 280, entryMarker }: CandlestickChartProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(680);
  const smoothDomainRef = useRef<PriceDomain | null>(null);
  const frozenDomainRef = useRef<PriceDomain | null>(null);
  const [, bump] = useState(0);
  const clipId = useId().replace(/:/g, '');

  /** Pixel pan: 0 = live candle at horizontal center. Positive = older history to the right shift. */
  const [panPx, setPanPx] = useState(0);
  const [barsVisible, setBarsVisible] = useState(DEFAULT_BARS);
  const panPxRef = useRef(0);
  const barsVisibleRef = useRef(barsVisible);
  const dragRef = useRef<{ pointerId: number; startX: number; startPan: number } | null>(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    barsVisibleRef.current = barsVisible;
  }, [barsVisible]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || typeof ResizeObserver === 'undefined') return;

    const apply = (next: number) => {
      const rounded = Math.max(240, Math.round(next));
      setWidth((prev) => (prev === rounded ? prev : rounded));
    };

    apply(host.clientWidth || 680);
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      apply(entry.contentRect.width);
    });
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  const sanitized = useMemo(() => candles.map(sanitize), [candles]);

  const padL = 10;
  const padR = 56;
  const padT = 14;
  const padB = 28;
  const plotW = Math.max(1, width - padL - padR);
  const plotH = Math.max(1, height - padT - padB);
  const slot = plotW / Math.max(barsVisible, 1);
  const bodyW = Math.max(3, Math.min(16, slot * 0.68));
  const wickW = bodyW >= 6 ? 1.6 : 1.25;

  /** Live candle sits on the horizontal midpoint when pan ≈ 0 — empty half on the right. */
  const liveCenterX = padL + plotW / 2;
  const maxPanPx = Math.max(0, (sanitized.length - Math.ceil(barsVisible / 2)) * slot);
  const clampedPan = Math.min(Math.max(0, panPx), maxPanPx);
  const followLive = clampedPan < slot * 0.25 && !dragging;

  const rightIndex =
    sanitized.length === 0 ? 0 : sanitized.length - 1 - Math.round(clampedPan / slot);
  const halfBars = Math.floor(barsVisible / 2);
  const leftIndex = Math.max(0, rightIndex - halfBars);

  const visiblePoints = useMemo(() => {
    if (sanitized.length === 0) return [];
    const end = Math.min(sanitized.length, rightIndex + 1);
    // Leave right-side empty: only take left half-ish of bars when following live.
    const windowStart = followLive
      ? Math.max(0, sanitized.length - halfBars - 1)
      : Math.max(0, end - barsVisible);
    return sanitized.slice(windowStart, end);
  }, [sanitized, rightIndex, barsVisible, followLive, halfBars]);

  const liveClose = sanitized.length > 0 ? sanitized[sanitized.length - 1]!.close : 0;

  const entryIndex =
    entryMarker && sanitized.length > 0
      ? findCandleIndexByTime(sanitized, entryMarker.timeSec)
      : -1;
  const entryPrice =
    entryMarker?.price != null && Number.isFinite(entryMarker.price)
      ? entryMarker.price
      : entryIndex >= 0
        ? sanitized[entryIndex]?.close
        : undefined;
  const extraPrice =
    entryPrice != null && Number.isFinite(entryPrice) ? [entryPrice] : [];

  const targetDomain = useMemo(() => {
    if (visiblePoints.length === 0) return { lo: 0, hi: 1 };
    if (followLive) return domainTrackingFocus(visiblePoints, liveClose, extraPrice);
    return domainFrom(visiblePoints, extraPrice);
  }, [visiblePoints, followLive, liveClose, extraPrice]);

  useEffect(() => {
    if (dragging || !followLive) return;
    smoothDomainRef.current = lerpDomain(smoothDomainRef.current, targetDomain, 0.42);
    bump((n) => n + 1);
  }, [targetDomain, dragging, followLive]);

  const domain: PriceDomain = (() => {
    if (dragging || !followLive) {
      return frozenDomainRef.current ?? targetDomain;
    }
    return smoothDomainRef.current ?? targetDomain;
  })();

  const lo = domain.lo;
  const hi = domain.hi;
  const priceRange = hi - lo || 1;
  const scaleY = (price: number) => padT + plotH - ((price - lo) / priceRange) * plotH;

  const xForIndex = (index: number) =>
    liveCenterX - (sanitized.length - 1 - index) * slot + clampedPan;

  const applyZoom = useCallback(
    (nextBars: number) => {
      const clamped = Math.min(MAX_BARS, Math.max(MIN_BARS, nextBars));
      const prevBars = barsVisibleRef.current;
      if (clamped === prevBars) return;
      const prevSlot = plotW / Math.max(prevBars, 1);
      const nextSlot = plotW / Math.max(clamped, 1);
      const panCandles = panPxRef.current / Math.max(prevSlot, 1e-6);
      const nextPan = panCandles * nextSlot;
      const nextMax = Math.max(0, (sanitized.length - Math.ceil(clamped / 2)) * nextSlot);
      const clampedPanNext = Math.min(Math.max(0, nextPan), nextMax);
      panPxRef.current = clampedPanNext;
      setPanPx(clampedPanNext);
      barsVisibleRef.current = clamped;
      setBarsVisible(clamped);
    },
    [plotW, sanitized.length],
  );

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
        const next = Math.min(maxPanPx, Math.max(0, panPxRef.current + event.deltaX));
        panPxRef.current = next;
        setPanPx(next);
        return;
      }
      const step = Math.max(2, Math.round(barsVisibleRef.current * 0.08));
      applyZoom(barsVisibleRef.current + (event.deltaY > 0 ? step : -step));
    };

    host.addEventListener('wheel', onWheel, { passive: false });
    return () => host.removeEventListener('wheel', onWheel);
  }, [applyZoom, maxPanPx]);

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    const host = hostRef.current;
    if (!host) return;
    host.setPointerCapture(event.pointerId);
    frozenDomainRef.current = smoothDomainRef.current ?? targetDomain;
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startPan: clampedPan,
    };
    setDragging(true);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const dx = event.clientX - drag.startX;
    const next = Math.min(maxPanPx, Math.max(0, drag.startPan + dx));
    panPxRef.current = next;
    setPanPx(next);
  };

  const endDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    dragRef.current = null;
    setDragging(false);
    if (panPxRef.current < slot * 0.25) {
      panPxRef.current = 0;
      setPanPx(0);
      frozenDomainRef.current = null;
      smoothDomainRef.current = null;
    }
    try {
      hostRef.current?.releasePointerCapture(event.pointerId);
    } catch {
      /* ignore */
    }
  };

  const onDoubleClick = () => {
    panPxRef.current = 0;
    setPanPx(0);
    barsVisibleRef.current = DEFAULT_BARS;
    setBarsVisible(DEFAULT_BARS);
    frozenDomainRef.current = null;
    smoothDomainRef.current = null;
  };

  if (sanitized.length === 0) {
    return (
      <div ref={hostRef} className={styles.wrap} dir="ltr">
        <div className={styles.empty}>Waiting for candles…</div>
      </div>
    );
  }

  const gridSteps = 4;
  const gridLines = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const step = i / gridSteps;
    return { y: padT + plotH * step, price: hi - step * priceRange };
  });

  const live = sanitized[sanitized.length - 1]!;
  const lastUp = live.close >= live.open;
  const lastColor = lastUp ? UP : DOWN;
  const lastY = scaleY(live.close);
  const priceLabel = formatPrice(live.close, priceRange);
  const labelH = 18;
  const labelW = Math.max(48, priceLabel.length * 7 + 12);
  const labelY = Math.min(Math.max(lastY - labelH / 2, padT), padT + plotH - labelH);

  const liveX = xForIndex(sanitized.length - 1);
  const entryX = entryIndex >= 0 ? xForIndex(entryIndex) : null;
  const entryY = entryPrice != null ? scaleY(entryPrice) : null;
  const entryColor = isDownDirection(entryMarker?.direction) ? ENTRY_DOWN : ENTRY_UP;
  const entryVisible =
    entryX != null &&
    entryY != null &&
    entryX >= padL - 8 &&
    entryX <= padL + plotW + 8;
  const entryPriceLabel = entryPrice != null ? formatPrice(entryPrice, priceRange) : '';
  const entryLabelW = Math.max(44, entryPriceLabel.length * 6.4 + 10);

  // Draw candles that fall inside (or near) the plot horizontally.
  const drawStart = Math.max(0, leftIndex - 2);
  const drawEnd = Math.min(sanitized.length, rightIndex + halfBars + 3);

  const timeTicks: { x: number; label: string }[] = [];
  const tickCount = Math.min(5, Math.max(2, visiblePoints.length));
  for (let i = 0; i < tickCount; i++) {
    const idxInVisible =
      tickCount === 1 ? 0 : Math.round((i * (visiblePoints.length - 1)) / (tickCount - 1));
    const point = visiblePoints[idxInVisible];
    if (!point) continue;
    const globalIndex = sanitized.indexOf(point);
    const index = globalIndex >= 0 ? globalIndex : leftIndex + idxInVisible;
    const label = formatCandleTime(point.time);
    if (!label) continue;
    const x = xForIndex(index);
    if (x < padL + 12 || x > padL + plotW - 12) continue;
    timeTicks.push({ x, label });
  }

  return (
    <div
      ref={hostRef}
      className={`${styles.wrap} ${dragging ? styles.dragging : styles.pannable}`}
      dir="ltr"
      aria-hidden="true"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onDoubleClick={onDoubleClick}
      title="Scroll to zoom · Drag to pan · Double-click to reset"
    >
      <svg className={styles.chart} width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <rect x={0} y={0} width={width} height={height} fill={BG} rx={10} />

        {gridLines.map(({ y, price }) => (
          <g key={`g-${price}`}>
            <line
              x1={padL}
              y1={y}
              x2={width - padR}
              y2={y}
              stroke={GRID}
              strokeWidth={1}
              strokeDasharray={y === padT || y === padT + plotH ? undefined : '2 3'}
            />
            <text
              x={width - padR + 6}
              y={y + 3}
              className={styles.axisLabel}
              fill={AXIS}
              fontSize={10}
            >
              {formatPrice(price, priceRange)}
            </text>
          </g>
        ))}

        <defs>
          <clipPath id={clipId}>
            <rect x={padL} y={padT} width={plotW} height={plotH} />
          </clipPath>
        </defs>

        <g clipPath={`url(#${clipId})`}>
          {sanitized.slice(drawStart, drawEnd).map((point, i) => {
            const index = drawStart + i;
            const isUp = point.close >= point.open;
            const color = isUp ? UP : DOWN;
            const xCenter = xForIndex(index);
            if (xCenter < padL - slot || xCenter > padL + plotW + slot) return null;
            const bodyTop = scaleY(Math.max(point.open, point.close));
            const bodyBottom = scaleY(Math.min(point.open, point.close));
            const bodyHeight = Math.max(1.8, bodyBottom - bodyTop);
            const isLive = followLive && index === sanitized.length - 1;

            return (
              <g key={point.time != null ? `t-${point.time}` : `i-${index}`}>
                <line
                  x1={xCenter}
                  y1={scaleY(point.high)}
                  x2={xCenter}
                  y2={scaleY(point.low)}
                  stroke={color}
                  strokeWidth={wickW}
                  strokeLinecap="butt"
                />
                <rect
                  x={xCenter - bodyW / 2}
                  y={bodyTop}
                  width={bodyW}
                  height={bodyHeight}
                  fill={color}
                  stroke={color}
                  strokeWidth={isLive ? 1.25 : 0.8}
                  className={isLive ? styles.liveBody : undefined}
                />
              </g>
            );
          })}
        </g>

        {timeTicks.map(({ x, label }) => (
          <g key={`time-${label}-${x}`}>
            <line x1={x} y1={padT + plotH} x2={x} y2={padT + plotH + 4} stroke={AXIS} strokeWidth={1} />
            <text x={x} y={height - 8} textAnchor="middle" className={styles.axisLabel} fill={AXIS} fontSize={10}>
              {label}
            </text>
          </g>
        ))}

        {followLive ? (
          <>
            <line
              x1={padL}
              y1={lastY}
              x2={width - padR}
              y2={lastY}
              stroke={CROSS}
              strokeWidth={1}
              strokeDasharray="4 3"
            />
            <rect x={width - padR + 1} y={labelY} width={labelW} height={labelH} rx={3} fill={lastColor} />
            <text
              x={width - padR + 1 + labelW / 2}
              y={labelY + 12.5}
              textAnchor="middle"
              fill="#fff"
              fontSize={10}
              fontWeight={700}
              className={styles.axisLabel}
            >
              {priceLabel}
            </text>
            {/* subtle vertical guide at live center */}
            <line
              x1={liveX}
              y1={padT}
              x2={liveX}
              y2={padT + plotH}
              stroke="rgba(120, 123, 134, 0.22)"
              strokeWidth={1}
              strokeDasharray="2 4"
            />
          </>
        ) : (
          <text x={padL + 8} y={padT + 14} className={styles.hint} fill={AXIS} fontSize={10}>
            History · double-click to live
          </text>
        )}

        {entryMarker && entryY != null ? (
          <g>
            <line
              x1={padL}
              y1={entryY}
              x2={width - padR}
              y2={entryY}
              stroke={entryColor}
              strokeWidth={1.4}
              strokeDasharray="5 4"
              opacity={0.95}
            />
            {entryVisible && entryX != null ? (
              <>
                <line
                  x1={entryX}
                  y1={padT}
                  x2={entryX}
                  y2={padT + plotH}
                  stroke={entryColor}
                  strokeWidth={1.2}
                  strokeDasharray="3 3"
                  opacity={0.85}
                />
                <circle
                  cx={entryX}
                  cy={entryY}
                  r={5}
                  fill={entryColor}
                  stroke="#131722"
                  strokeWidth={1.5}
                />
                <rect
                  x={Math.min(Math.max(entryX - 28, padL + 4), padL + plotW - 60)}
                  y={Math.max(padT + 4, entryY - 28)}
                  width={56}
                  height={16}
                  rx={3}
                  fill={entryColor}
                />
                <text
                  x={Math.min(Math.max(entryX, padL + 32), padL + plotW - 32)}
                  y={Math.max(padT + 16, entryY - 16)}
                  textAnchor="middle"
                  fill="#0b0e14"
                  fontSize={9}
                  fontWeight={800}
                  className={styles.axisLabel}
                >
                  {entryMarker.label}
                </text>
              </>
            ) : null}
            <rect
              x={padL}
              y={Math.min(Math.max(entryY - labelH / 2, padT), padT + plotH - labelH)}
              width={entryLabelW}
              height={labelH}
              rx={2}
              fill={entryColor}
            />
            <text
              x={padL + entryLabelW / 2}
              y={Math.min(Math.max(entryY - labelH / 2, padT), padT + plotH - labelH) + 12.5}
              textAnchor="middle"
              fill="#0b0e14"
              fontSize={9}
              fontWeight={700}
              className={styles.axisLabel}
            >
              {entryPriceLabel}
            </text>
          </g>
        ) : null}
      </svg>
    </div>
  );
}
