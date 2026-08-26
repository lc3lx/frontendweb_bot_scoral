import { Text } from '@landing/components/atoms/Text';
import { Card } from '@landing/components/molecules/Card';
import { SectionTitle } from '@landing/components/molecules/SectionTitle';
import { SectionContainer } from '@landing/components/organisms/SectionContainer';
import { FIGMA_LANDING_NODES } from '@landing/constants/figma';
import { useI18n } from '@landing/i18n';
import { FEATURE_CARDS } from '../../data/features';
import { LANDING_SECTION_IDS } from '../../constants/sectionIds';
import styles from './FeaturesSection.module.css';

/**
 * Features section — Figma 55:31 (title) + 475:130 (subtitle) + 523:1840 (cards)
 */
export function FeaturesSection() {
  const { t } = useI18n();

  return (
    <SectionContainer
      as="section"
      id={LANDING_SECTION_IDS.features}
      spacing="none"
      width="full"
      background="transparent"
      className={styles.features}
      data-figma-node={FIGMA_LANDING_NODES.featuresTitle}
      aria-labelledby="features-heading"
    >
      <SectionTitle
        id="features-heading"
        className={`${styles.heading} motionSlideUp`}
        align="center"
        titleAs="h2"
        eyebrow={t.features.eyebrow}
        title={t.features.title}
        description={t.features.description}
      />

      <ul
        className={`${styles.grid} motionFadeIn motionStaggerChildren`}
        data-figma-node={FIGMA_LANDING_NODES.featuresGrid}
      >
        {FEATURE_CARDS.map((card) => {
          const copy = t.features.cards[card.id];
          return (
            <li key={card.id} className={styles.gridItem}>
              <Card
                as="article"
                variant="glow"
                padding="md"
                className={styles.card}
                data-figma-node={card.figmaNodeId}
              >
                <img
                  className={styles.icon}
                  src={card.iconSrc}
                  alt=""
                  width={32}
                  height={32}
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
    </SectionContainer>
  );
}
