import { Text } from '@landing/components/atoms/Text';
import { Card } from '@landing/components/molecules/Card';
import { SectionTitle } from '@landing/components/molecules/SectionTitle';
import { SectionContainer } from '@landing/components/organisms/SectionContainer';
import { FIGMA_LANDING_NODES } from '@landing/constants/figma';
import { useI18n } from '@landing/i18n';
import { TRADE_TRACKING_CARDS } from '../../data/tradeTracking';
import { LANDING_SECTION_IDS } from '../../constants/sectionIds';
import styles from './TradeTrackingSection.module.css';

/**
 * Trade Tracking — Figma 55:315 (title) + 55:323–55:353 (4 cards)
 */
export function TradeTrackingSection() {
  const { t } = useI18n();
  const hasCards = TRADE_TRACKING_CARDS.length > 0;

  return (
    <SectionContainer
      as="section"
      id={LANDING_SECTION_IDS.tradeTracking}
      spacing="none"
      width="full"
      background="transparent"
      className={styles.tradeTracking}
      data-figma-node={FIGMA_LANDING_NODES.tradeTracking}
      aria-labelledby="trade-tracking-heading"
    >
      <SectionTitle
        className={`${styles.heading} motionDepthIn`}
        align="center"
        titleAs="h2"
        eyebrow={t.tradeTracking.eyebrow}
        title={<span id="trade-tracking-heading">{t.tradeTracking.title}</span>}
      />

      {hasCards ? (
        <ul className={`${styles.grid} motionStaggerDepth`}>
          {TRADE_TRACKING_CARDS.map((card) => {
            const copy = t.tradeTracking.cards[card.id as keyof typeof t.tradeTracking.cards];
            return (
              <li key={card.id} className={styles.gridItem}>
                <Card
                  as="article"
                  variant="glow"
                  padding="none"
                  className={`${styles.card} motionLift3d`}
                  data-figma-node={card.figmaNodeId}
                  aria-label={copy.title}
                >
                  <img
                    className={styles.icon}
                    src={card.iconSrc}
                    alt=""
                    width={29}
                    height={29}
                    decoding="async"
                    loading="lazy"
                    aria-hidden="true"
                  />
                  <Text as="h3" variant="title" tone="heading" className={styles.cardTitle}>
                    {copy.title}
                  </Text>
                  <Text as="p" variant="body" tone="body" className={styles.cardBody}>
                    {copy.description}
                  </Text>
                </Card>
              </li>
            );
          })}
        </ul>
      ) : null}
    </SectionContainer>
  );
}
