import { Badge } from '@landing/components/atoms/Badge';
import { Text } from '@landing/components/atoms/Text';
import { Card } from '@landing/components/molecules/Card';
import { SectionTitle } from '@landing/components/molecules/SectionTitle';
import { SectionContainer } from '@landing/components/organisms/SectionContainer';
import { FIGMA_LANDING_NODES } from '@landing/constants/figma';
import { useI18n } from '@landing/i18n';
import {
  STATISTICS_CHART,
  STATISTICS_METRICS,
  STATISTICS_TRADES,
} from '../../data/statistics';
import { LANDING_SECTION_IDS } from '../../constants/sectionIds';
import styles from './StatisticsSection.module.css';

const TONE_CLASS = {
  positive: styles.tone_positive,
  neutral: styles.tone_neutral,
  negative: styles.tone_negative,
} as const;

/**
 * Statistics — Figma 55:266 (title) + 55:274 (metrics) + 491:1487 (chart) + 55:299 (trades)
 */
export function StatisticsSection() {
  const { t } = useI18n();
  const hasMetrics = STATISTICS_METRICS.length > 0;
  const hasTrades = STATISTICS_TRADES.items.length > 0;
  const hasChart = Boolean(STATISTICS_CHART.src);

  return (
    <SectionContainer
      as="section"
      id={LANDING_SECTION_IDS.statistics}
      spacing="none"
      width="full"
      background="transparent"
      className={styles.statistics}
      data-figma-node={FIGMA_LANDING_NODES.statisticsTitle}
      aria-labelledby="statistics-heading"
    >
      <SectionTitle
        className={`${styles.heading} motionSlideUp`}
        align="center"
        titleAs="h2"
        eyebrow={t.statistics.eyebrow}
        title={<span id="statistics-heading">{t.statistics.title}</span>}
      />

      {hasMetrics ? (
        <ul
          className={`${styles.metrics} motionFadeIn motionStaggerChildren`}
          data-figma-node={FIGMA_LANDING_NODES.statisticsMetrics}
        >
          {STATISTICS_METRICS.map((metric) => {
            const label = t.statistics.metrics[metric.id as keyof typeof t.statistics.metrics];
            return (
              <li key={metric.id} className={styles.metricItem}>
                <Card
                  as="article"
                  variant="flat"
                  padding="none"
                  className={styles.metricCard}
                  data-figma-node={metric.figmaNodeId}
                  aria-label={`${label}: ${metric.value}`}
                >
                  <p className={styles.metricLabel}>{label}</p>
                  <p className={`${styles.metricValue} ${TONE_CLASS[metric.tone]}`}>
                    {metric.value || '—'}
                  </p>
                </Card>
              </li>
            );
          })}
        </ul>
      ) : null}

      <div className={`${styles.panels} motionFadeIn`}>
        {hasChart ? (
          <figure className={styles.chart} data-figma-node={STATISTICS_CHART.figmaNodeId}>
            <img
              className={styles.chartImage}
              src={STATISTICS_CHART.src}
              alt={t.statistics.chartAlt}
              width={STATISTICS_CHART.width}
              height={STATISTICS_CHART.height}
              decoding="async"
              loading="lazy"
            />
          </figure>
        ) : null}

        <Card
          as="article"
          variant="flat"
          padding="none"
          className={styles.trades}
          data-figma-node={STATISTICS_TRADES.figmaNodeId}
          aria-label={t.statistics.tradesTitle}
        >
          <Text as="h3" variant="title" tone="heading" className={styles.tradesTitle}>
            {t.statistics.tradesTitle}
          </Text>

          {hasTrades ? (
            <ul className={styles.tradeList}>
              {STATISTICS_TRADES.items.map((trade) => (
                <li key={trade.id} className={styles.tradeItem}>
                  <p className={styles.tradeText}>
                    <span>{trade.pair || '—'}</span>
                    <span className={styles.tradeSep} aria-hidden="true">
                      •
                    </span>
                    <span>
                      {
                        t.statistics.tradeStrategies[
                          trade.id as keyof typeof t.statistics.tradeStrategies
                        ]
                      }
                    </span>
                    <span className={styles.tradeSep} aria-hidden="true">
                      •
                    </span>
                    <span>{trade.result || '—'}</span>
                  </p>
                </li>
              ))}
            </ul>
          ) : null}

          <div className={styles.status}>
            <Badge variant="soft" className={styles.statusBadge}>
              {t.statistics.tradesStatus}
            </Badge>
          </div>
        </Card>
      </div>
    </SectionContainer>
  );
}
