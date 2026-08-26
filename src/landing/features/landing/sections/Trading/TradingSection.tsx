import { Button } from '@landing/components/atoms/Button';
import { Text } from '@landing/components/atoms/Text';
import { Card } from '@landing/components/molecules/Card';
import { SectionTitle } from '@landing/components/molecules/SectionTitle';
import { SectionContainer } from '@landing/components/organisms/SectionContainer';
import { FIGMA_LANDING_NODES } from '@landing/constants/figma';
import { useI18n } from '@landing/i18n';
import { TRADING_BINOLLA, TRADING_SIGNAL } from '../../data/trading';
import { LANDING_SECTION_IDS } from '../../constants/sectionIds';
import styles from './TradingSection.module.css';

/**
 * Trading Integration — Figma 55:224 (copy) + 55:231 (Binolla) + 55:246 (Signal)
 * Candles chart asset: 488:1266
 */
export function TradingSection() {
  const { t } = useI18n();

  return (
    <SectionContainer
      as="section"
      id={LANDING_SECTION_IDS.trading}
      spacing="none"
      width="full"
      background="transparent"
      className={styles.trading}
      data-figma-node={FIGMA_LANDING_NODES.tradingCopy}
      aria-labelledby="trading-heading"
    >
      <div className={styles.layout}>
        <SectionTitle
          className={`${styles.copy} motionDepthIn`}
          align="start"
          titleAs="h2"
          eyebrow={t.trading.eyebrow}
          title={<span id="trading-heading">{t.trading.title}</span>}
          description={t.trading.description}
        />

        <div className={`${styles.cards} motionOrbitIn`}>
          <Card
            as="article"
            variant="flat"
            padding="none"
            className={`${styles.panel} ${styles.binolla}`}
            data-figma-node={TRADING_BINOLLA.figmaNodeId}
            aria-label={t.trading.binollaTitle}
          >
            <div className={styles.binollaHeader}>
              <Text as="h3" variant="title" tone="heading" className={styles.cardTitle}>
                {t.trading.binollaTitle}
              </Text>
              <Text as="p" variant="body" tone="accent" className={styles.pair}>
                {TRADING_BINOLLA.pair}
              </Text>
            </div>

            <div className={styles.chartWell} data-figma-node={FIGMA_LANDING_NODES.tradingCandles}>
              <img
                className={styles.candles}
                src={TRADING_BINOLLA.candles}
                alt=""
                width={TRADING_BINOLLA.candlesWidth}
                height={TRADING_BINOLLA.candlesHeight}
                decoding="async"
                loading="lazy"
              />
            </div>

            <div className={styles.actions} role="group" aria-label={t.a11y.tradeDirection}>
              <Button
                type="button"
                variant="primary"
                size="md"
                className={styles.actionBtn}
                aria-label={t.trading.upLabel}
              >
                {t.trading.upLabel}
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="md"
                className={`${styles.actionBtn} ${styles.btnDown}`}
                aria-label={t.trading.downLabel}
              >
                {t.trading.downLabel}
              </Button>
            </div>
          </Card>

          <Card
            as="article"
            variant="flat"
            padding="none"
            className={`${styles.panel} ${styles.signal}`}
            data-figma-node={TRADING_SIGNAL.figmaNodeId}
            aria-label={t.trading.signalTitle}
          >
            <Text as="h3" variant="title" tone="heading" className={styles.signalTitle}>
              {t.trading.signalTitle}
            </Text>

            <dl className={styles.rows}>
              {TRADING_SIGNAL.rows.map((row) => {
                const copy = t.trading.rows[row.id];
                return (
                  <div key={row.id} className={styles.row}>
                    <dt className={styles.rowLabel}>{copy.label}</dt>
                    <dd
                      className={`${styles.rowValue} ${
                        row.tone === 'accent' ? styles.rowValueAccent : ''
                      }`}
                    >
                      {copy.value}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </Card>
        </div>
      </div>
    </SectionContainer>
  );
}
