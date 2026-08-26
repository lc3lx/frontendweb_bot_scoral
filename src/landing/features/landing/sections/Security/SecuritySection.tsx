import { Text } from '@landing/components/atoms/Text';
import { Card } from '@landing/components/molecules/Card';
import { SectionTitle } from '@landing/components/molecules/SectionTitle';
import { SectionContainer } from '@landing/components/organisms/SectionContainer';
import { FIGMA_LANDING_NODES } from '@landing/constants/figma';
import { useI18n } from '@landing/i18n';
import { SECURITY_CARDS } from '../../data/security';
import { LANDING_SECTION_IDS } from '../../constants/sectionIds';
import styles from './SecuritySection.module.css';

/**
 * Security & access — Figma 491:1572 (title + 55:386 / 55:370 / 55:378)
 */
export function SecuritySection() {
  const { t } = useI18n();
  const hasCards = SECURITY_CARDS.length > 0;

  return (
    <SectionContainer
      as="section"
      id={LANDING_SECTION_IDS.security}
      spacing="none"
      width="full"
      background="transparent"
      className={styles.security}
      data-figma-node={FIGMA_LANDING_NODES.security}
      aria-labelledby="security-heading"
    >
      <SectionTitle
        className={`${styles.heading} motionSlideUp`}
        align="center"
        titleAs="h2"
        eyebrow={t.security.eyebrow}
        title={<span id="security-heading">{t.security.title}</span>}
      />

      {hasCards ? (
        <ul className={`${styles.grid} motionFadeIn motionStaggerChildren`}>
          {SECURITY_CARDS.map((card) => {
            const copy = t.security.cards[card.id as keyof typeof t.security.cards];
            return (
              <li key={card.id} className={styles.gridItem}>
                <Card
                  as="article"
                  variant="flat"
                  padding="none"
                  className={styles.card}
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
