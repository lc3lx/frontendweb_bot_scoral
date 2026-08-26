import { Button } from '@landing/components/atoms/Button';
import { Text } from '@landing/components/atoms/Text';
import { SectionTitle } from '@landing/components/molecules/SectionTitle';
import { SectionContainer } from '@landing/components/organisms/SectionContainer';
import { FIGMA_LANDING_NODES } from '@landing/constants/figma';
import { useI18n } from '@landing/i18n';
import { PRICING_PLANS } from '../../data/pricing';
import { LANDING_SECTION_IDS } from '../../constants/sectionIds';
import styles from './PricingSection.module.css';

/**
 * Bonus packages — Figma 596:1316 (title) + 641:182 / 642:445 / 642:463 / 642:481
 */
export function PricingSection() {
  const { t } = useI18n();

  return (
    <SectionContainer
      as="section"
      id={LANDING_SECTION_IDS.pricing}
      spacing="none"
      width="full"
      background="transparent"
      className={styles.pricing}
      data-figma-node={FIGMA_LANDING_NODES.pricing}
      aria-labelledby="pricing-heading"
    >
      <SectionTitle
        className={`${styles.heading} motionSlideUp`}
        align="center"
        titleAs="h2"
        eyebrow={t.pricing.eyebrow}
        title={<span id="pricing-heading">{t.pricing.title}</span>}
        description={t.pricing.description}
      />

      <ul className={`${styles.grid} motionFadeIn motionStaggerChildren`}>
        {PRICING_PLANS.map((plan) => {
          const copy = t.pricing.plans[plan.id];
          const toneClass = plan.tone === 'gold' ? styles.cardGold : styles.cardRed;

          return (
            <li key={plan.id} className={styles.gridItem}>
              <article
                className={`${styles.card} ${toneClass}`}
                data-figma-node={plan.figmaNodeId}
                aria-label={copy.title}
              >
                <img
                  className={styles.glow}
                  src={plan.glowSrc}
                  alt=""
                  width={302}
                  height={315}
                  decoding="async"
                  aria-hidden="true"
                />

                {plan.popular ? (
                  <span className={styles.badge}>{t.pricing.popular}</span>
                ) : null}

                <Text as="h3" variant="title" tone="heading" className={styles.planTitle}>
                  {copy.title}
                </Text>

                <ul className={styles.rows}>
                  {plan.rows.map((rowId) => {
                    const icon = plan.icons[rowId];
                    const label = copy.rows[rowId];
                    if (!label) return null;
                    return (
                      <li key={rowId} className={styles.row}>
                        <img
                          className={styles.rowIcon}
                          src={icon.src}
                          alt=""
                          width={icon.width}
                          height={icon.height}
                          decoding="async"
                          aria-hidden="true"
                        />
                        <span className={styles.rowLabel}>{label}</span>
                      </li>
                    );
                  })}
                </ul>

                <Button
                  variant="primary"
                  size="md"
                  type="button"
                  className={styles.cta}
                >
                  {t.pricing.cta}
                </Button>
              </article>
            </li>
          );
        })}
      </ul>
    </SectionContainer>
  );
}
