import type { TradingCandle } from '../data/trading.mock';

import styles from './CandlestickChart.module.css';

type CandlestickChartProps = {
  candles: TradingCandle[];
  yAxis: string[];
  xAxis: string[];
  currentPrice: string;
};

const CHART_WIDTH = 680;
const CHART_HEIGHT = 240;
/** Fixed LTR layout — time flows left→right like Figma, regardless of page locale. */
const PADDING = { top: 8, right: 52, bottom: 24, left: 8 };
const BULL_COLOR = '#26c281';
const BEAR_COLOR = '#dd0912';

export function CandlestickChart({ candles, yAxis, xAxis, currentPrice }: CandlestickChartProps) {
  const plotLeft = PADDING.left;
  const plotRight = CHART_WIDTH - PADDING.right;
  const plotWidth = plotRight - plotLeft;
  const plotHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom;

  const minPrice = Math.min(...candles.map((c) => c.low), ...yAxis.map(Number));
  const maxPrice = Math.max(...candles.map((c) => c.high), ...yAxis.map(Number));
  const priceRange = maxPrice - minPrice || 1;

  const priceToY = (price: number) =>
    PADDING.top + plotHeight - ((price - minPrice) / priceRange) * plotHeight;

  const candleWidth = plotWidth / candles.length;
  const bodyWidth = Math.max(4, candleWidth * 0.55);

  const currentPriceNum = Number(currentPrice);
  const currentY = priceToY(currentPriceNum);

  const yLabelX = plotRight + 6;
  const badgeWidth = 44;
  const badgeX = plotRight - badgeWidth - 2;
  const badgeTextX = badgeX + badgeWidth / 2;
  const xStep = xAxis.length > 1 ? xAxis.length - 1 : 1;

  return (
    <div className={styles.wrap} dir="ltr" aria-hidden="true">
      <svg
        className={styles.chart}
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        preserveAspectRatio="none"
      >
        {yAxis.map((label) => {
          const y = priceToY(Number(label));
          return (
            <g key={label}>
              <line x1={plotLeft} y1={y} x2={plotRight} y2={y} className={styles.gridLine} />
              <text x={yLabelX} y={y + 4} className={styles.yLabel} textAnchor="start">
                {label}
              </text>
            </g>
          );
        })}

        {xAxis.map((label, index) => {
          const x = plotLeft + (index / xStep) * plotWidth;
          return (
            <text key={label} x={x} y={CHART_HEIGHT - 4} className={styles.xLabel} textAnchor="middle">
              {label}
            </text>
          );
        })}

        {candles.map((candle, index) => {
          const x = plotLeft + index * candleWidth + candleWidth / 2;
          const bullish = candle.close >= candle.open;
          const color = bullish ? BULL_COLOR : BEAR_COLOR;
          const bodyTop = priceToY(Math.max(candle.open, candle.close));
          const bodyBottom = priceToY(Math.min(candle.open, candle.close));
          const bodyHeight = Math.max(1, bodyBottom - bodyTop);
          const wickTop = priceToY(candle.high);
          const wickBottom = priceToY(candle.low);

          return (
            <g key={index}>
              <line x1={x} y1={wickTop} x2={x} y2={wickBottom} stroke={color} strokeWidth={1} />
              <rect
                x={x - bodyWidth / 2}
                y={bodyTop}
                width={bodyWidth}
                height={bodyHeight}
                fill={color}
                rx={1}
              />
            </g>
          );
        })}

        <line
          x1={plotLeft}
          y1={currentY}
          x2={plotRight}
          y2={currentY}
          className={styles.priceLine}
          strokeDasharray="4 4"
        />
        <rect
          x={badgeX}
          y={currentY - 10}
          width={badgeWidth}
          height={20}
          rx={4}
          className={styles.priceBadge}
        />
        <text x={badgeTextX} y={currentY + 4} className={styles.priceBadgeText} textAnchor="middle">
          {currentPrice}
        </text>
      </svg>
    </div>
  );
}
