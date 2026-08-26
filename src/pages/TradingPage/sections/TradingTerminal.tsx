import { tradingAssets } from '@assets';
import { useI18n } from '@i18n';

import type { TradingMockData } from '../data/trading.mock';
import { CandlestickChart } from './CandlestickChart';
import styles from './TradingTerminal.module.css';

type TradingTerminalProps = {
  data: TradingMockData;
};

export function TradingTerminal({ data }: TradingTerminalProps) {
  const { t } = useI18n();

  return (
    <section className={styles.terminal} aria-labelledby="trading-terminal-title">
      <div className={styles.topBar}>
        <div className={styles.brandRow}>
          <div className={styles.binollaIconWrap}>
            <img
              className={styles.binollaIcon}
              src={tradingAssets.iconBinolla}
              alt=""
              width={12}
              height={18}
              aria-hidden="true"
            />
          </div>
          <div>
            <p id="trading-terminal-title" className={styles.brandName}>
              {t.trading.terminal.binolla}
            </p>
            <p className={styles.brandSub}>{t.trading.terminal.embeddedTerminal}</p>
          </div>
        </div>
        <div className={styles.balanceBlock}>
          <p className={styles.balanceLabel}>{t.trading.terminal.balance}</p>
          <p className={`${styles.balanceValue} ${styles.ltrValue}`}>{data.balance}</p>
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.pairRow}>
          <div>
            <p className={styles.pairName}>
              <span className={styles.ltrValue}>{data.pair}</span>
              <span className={styles.pairType}>{data.pairType}</span>
            </p>
            <p className={`${styles.pairPrice} ${styles.ltrValue}`}>
              {data.price} <span className={styles.pairChange}>{data.change}</span>
            </p>
          </div>
          <div className={styles.expiryBadge}>
            <span className={styles.expiryLabel}>{t.trading.terminal.expiry}</span>
            <span className={`${styles.expiryValue} ${styles.ltrValue}`}>{data.expiry}</span>
          </div>
        </div>

        <div className={styles.chartWrap}>
          <CandlestickChart candles={data.candles} height={300} />
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.inputsRow}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>{t.trading.terminal.amount}</span>
            <div className={styles.inputWrap}>
              <span className={styles.currency}>$</span>
              <input
                className={`${styles.input} ${styles.ltrValue}`}
                type="text"
                readOnly
                value={data.amount}
                aria-label={t.trading.terminal.amount}
              />
            </div>
          </label>

          <div className={styles.field}>
            <span className={styles.fieldLabel}>{t.trading.terminal.duration}</span>
            <button type="button" className={styles.durationButton}>
              <span>{data.duration}</span>
              <img
                className={styles.durationChevron}
                src={tradingAssets.iconChevronDown}
                alt=""
                width={16}
                height={16}
                aria-hidden="true"
              />
            </button>
          </div>
        </div>

        <div className={styles.actionsRow}>
          <button type="button" className={styles.upButton}>
            <img
              className={styles.actionIcon}
              src={tradingAssets.iconUp}
              alt=""
              width={18}
              height={18}
              aria-hidden="true"
            />
            {t.trading.terminal.up}
          </button>
          <button type="button" className={styles.downButton}>
            <img
              className={styles.actionIcon}
              src={tradingAssets.iconDown}
              alt=""
              width={18}
              height={18}
              aria-hidden="true"
            />
            {t.trading.terminal.down}
          </button>
        </div>
      </div>
    </section>
  );
}
