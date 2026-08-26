import { Link } from 'react-router-dom';

import { tradingAssets } from '@assets';
import { useI18n } from '@i18n';
import { ROUTES } from '@router/routes';
import { HomeTilt } from '@pages/DashboardPage/HomeTilt';

import type { TradingMockData } from '../data/trading.mock';
import styles from './AiSignalPanel.module.css';

type AiSignalPanelProps = {
  signal: TradingMockData['signal'];
};

export function AiSignalPanel({ signal }: AiSignalPanelProps) {
  const { t } = useI18n();

  const cells = [
    { label: t.trading.signal.lastSignal, value: signal.lastSignal, tone: styles.signal, ltr: true },
    { label: t.trading.signal.strength, value: signal.strength, ltr: true },
    { label: t.trading.signal.indicator, value: signal.indicator },
    { label: t.trading.signal.strategy, value: signal.strategy },
    { label: t.trading.signal.market, value: signal.market, wide: true },
  ] as const;

  return (
    <aside className={styles.panel} aria-label={t.trading.signal.aria}>
      <HomeTilt maxTiltDeg={6} liftPx={12}>
        <section className={styles.card}>
          <div className={styles.header}>
            <div className={styles.iconWrap}>
              <img
                className={styles.icon}
                src={tradingAssets.iconSignal}
                alt=""
                width={18}
                height={18}
                aria-hidden="true"
              />
            </div>
            <div className={styles.titleBlock}>
              <h2 className={styles.title}>{t.trading.signal.title}</h2>
              <span className={styles.freshChip}>
                <span className={styles.freshDot} aria-hidden="true" />
                {t.trading.signal.fresh.replace('{seconds}', String(signal.freshSeconds))}
              </span>
            </div>
          </div>

          <div className={styles.grid}>
            {cells.map((cell) => (
              <div
                key={cell.label}
                className={`${styles.cell}${'wide' in cell && cell.wide ? ` ${styles.cellWide}` : ''}`}
              >
                <p className={styles.cellLabel}>{cell.label}</p>
                <p
                  className={`${styles.cellValue}${'tone' in cell && cell.tone ? ` ${cell.tone}` : ''}${'ltr' in cell && cell.ltr ? ` ${styles.ltrValue}` : ''}`}
                >
                  {cell.value}
                </p>
              </div>
            ))}
          </div>

          <Link to={ROUTES.aiBot} className={styles.cta}>
            {t.trading.signal.openBot}
          </Link>
        </section>
      </HomeTilt>
    </aside>
  );
}
