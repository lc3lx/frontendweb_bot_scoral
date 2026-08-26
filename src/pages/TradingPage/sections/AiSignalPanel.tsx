import { Link } from 'react-router-dom';

import { tradingAssets } from '@assets';
import { useI18n } from '@i18n';
import { ROUTES } from '@router/routes';

import type { TradingMockData } from '../data/trading.mock';
import styles from './AiSignalPanel.module.css';

type AiSignalPanelProps = {
  signal: TradingMockData['signal'];
};

export function AiSignalPanel({ signal }: AiSignalPanelProps) {
  const { t } = useI18n();

  const rows = [
    { label: t.trading.signal.lastSignal, value: signal.lastSignal, tone: styles.signalUp, ltr: true },
    { label: t.trading.signal.strength, value: signal.strength, ltr: true },
    { label: t.trading.signal.indicator, value: signal.indicator },
    { label: t.trading.signal.strategy, value: signal.strategy },
    { label: t.trading.signal.market, value: signal.market },
  ];

  return (
    <aside className={styles.panel} aria-label={t.trading.signal.aria}>
      <section className={styles.card}>
        <div className={styles.header}>
          <div className={styles.iconWrap}>
            <img
              className={styles.icon}
              src={tradingAssets.iconSignal}
              alt=""
              width={16}
              height={16}
              aria-hidden="true"
            />
          </div>
          <div className={styles.titleBlock}>
            <h2 className={styles.title}>{t.trading.signal.title}</h2>
            <p className={styles.subtitle}>{t.trading.signal.subtitle}</p>
          </div>
          <span className={styles.freshChip}>
            <span className={styles.freshDot} aria-hidden="true" />
            {t.trading.signal.fresh.replace('{seconds}', String(signal.freshSeconds))}
          </span>
        </div>

        <div className={styles.rows}>
          {rows.map((row) => (
            <div key={row.label} className={styles.row}>
              <span className={styles.rowLabel}>{row.label}</span>
              <span className={`${styles.rowValue}${row.tone ? ` ${row.tone}` : ''}${row.ltr ? ` ${styles.ltrValue}` : ''}`}>
                {row.value}
              </span>
            </div>
          ))}
        </div>

        <Link to={ROUTES.aiBot} className={styles.cta}>
          {t.trading.signal.openBot}
        </Link>
      </section>
    </aside>
  );
}
