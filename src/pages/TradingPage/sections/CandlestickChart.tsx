import { useEffect, useId, useMemo, useRef, useState } from 'react';

import type { TradingCandle } from '../data/trading.mock';
import styles from './CandlestickChart.module.css';

type CandlestickChartProps = {
  candles: TradingCandle[];
  height?: number;
};

const UP = '#12e655';
const DOWN = '#ef4444';
const GRID = 'rgba(42, 46, 57, 0.95)';
const AXIS = '#787b86';
const CROSS = 'rgba(120, 123, 134, 0.55)';
const BG = '#131722';
const VISIBLE_BARS = 32;

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

function domainTrackingFocus(points: TradingCandle[], focus: number): PriceDomain {
  const minPrice = Math.min(...points.map((p) => p.low), focus);
  const maxPrice = Math.max(...points.map((p) => p.high), focus);
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

export function CandlestickChart({ candles, height = 280 }: CandlestickChartProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(680);
  const smoothDomainRef = useRef<PriceDomain | null>(null);
  const [, bump] = useState(0);
  const clipId = useId().replace(/:/g, '');

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
  const visible = useMemo(
    () => sanitized.slice(Math.max(0, sanitized.length - VISIBLE_BARS)),
    [sanitized],
  );

  const padL = 10;
  const padR = 56;
  const padT = 14;
  const padB = 28;
  const plotW = Math.max(1, width - padL - padR);
  const plotH = Math.max(1, height - padT - padB);
  const slot = plotW / Math.max(visible.length, 1);
  const bodyW = Math.max(4, Math.min(16, slot * 0.68));
  const wickW = bodyW >= 6 ? 1.6 : 1.25;

  const liveClose = visible.length > 0 ? visible[visible.length - 1]!.close : 0;
  const targetDomain = useMemo(() => {
    if (visible.length === 0) return { lo: 0, hi: 1 };
    return domainTrackingFocus(visible, liveClose);
  }, [visible, liveClose]);

  useEffect(() => {
    smoothDomainRef.current = lerpDomain(smoothDomainRef.current, targetDomain, 0.42);
    bump((n) => n + 1);
  }, [targetDomain]);

  const domain = smoothDomainRef.current ?? targetDomain;
  const lo = domain.lo;
  const hi = domain.hi;
  const priceRange = hi - lo || 1;
  const scaleY = (price: number) => padT + plotH - ((price - lo) / priceRange) * plotH;

  if (visible.length === 0) {
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

  const live = visible[visible.length - 1]!;
  const lastUp = live.close >= live.open;
  const lastColor = lastUp ? UP : DOWN;
  const lastY = scaleY(live.close);
  const priceLabel = formatPrice(live.close, priceRange);
  const labelH = 18;
  const labelW = Math.max(48, priceLabel.length * 7 + 12);
  const labelY = Math.min(Math.max(lastY - labelH / 2, padT), padT + plotH - labelH);

  const xForIndex = (index: number) => padL + index * slot + slot / 2;

  const timeTicks: { x: number; label: string }[] = [];
  const tickCount = Math.min(5, visible.length);
  for (let i = 0; i < tickCount; i++) {
    const idx =
      tickCount === 1 ? 0 : Math.round((i * (visible.length - 1)) / (tickCount - 1));
    const point = visible[idx]!;
    const label = formatCandleTime(point.time);
    if (!label) continue;
    const x = xForIndex(idx);
    if (x < padL + 12 || x > padL + plotW - 12) continue;
    timeTicks.push({ x, label });
  }

  return (
    <div ref={hostRef} className={styles.wrap} dir="ltr" aria-hidden="true">
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
          {visible.map((point, index) => {
            const isUp = point.close >= point.open;
            const color = isUp ? UP : DOWN;
            const xCenter = xForIndex(index);
            const bodyTop = scaleY(Math.max(point.open, point.close));
            const bodyBottom = scaleY(Math.min(point.open, point.close));
            const bodyHeight = Math.max(1.8, bodyBottom - bodyTop);
            const isLive = index === visible.length - 1;

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
      </svg>
    </div>
  );
}
