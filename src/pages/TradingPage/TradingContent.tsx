import { tradingAssets } from '@assets';
import { useI18n } from '@i18n';

import { tradingMockData } from './data/trading.mock';
import styles from './TradingPage.module.css';
import { AiSignalPanel } from './sections/AiSignalPanel';
import { TradingTerminal } from './sections/TradingTerminal';

type TradingContentProps = {
  figmaNode: string;
};

export function TradingContent({ figmaNode }: TradingContentProps) {
  const { t } = useI18n();
  const data = tradingMockData;

  return (
    <div className={styles.page} data-figma-node={figmaNode}>
      <div className={styles.pageHeader}>
        <div>
          <h2 className={styles.pageTitle}>{t.trading.header.title}</h2>
          <p className={styles.pageSubtitle}>{t.trading.header.subtitle}</p>
        </div>

        <div className={styles.statusRow}>
          <span className={styles.chipConnected}>
            <span className={styles.chipDotGreen} aria-hidden="true" />
            {t.trading.status.connected}
          </span>
          <span className={styles.chipDemo}>
            <span className={styles.chipDotBlue} aria-hidden="true" />
            {t.trading.status.demo}
          </span>
          <button type="button" className={styles.iconButton} aria-label={t.trading.status.refreshAria}>
            <img
              className={styles.iconButtonImg}
              src={tradingAssets.iconRefresh}
              alt=""
              width={16}
              height={16}
              aria-hidden="true"
            />
          </button>
          <button type="button" className={styles.iconButton} aria-label={t.trading.status.externalAria}>
            <img
              className={styles.iconButtonImg}
              src={tradingAssets.iconExternal}
              alt=""
              width={16}
              height={16}
              data-flip-rtl="true"
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      <div className={styles.grid}>
        <TradingTerminal data={data} />
        <AiSignalPanel signal={data.signal} />
      </div>
    </div>
  );
}
