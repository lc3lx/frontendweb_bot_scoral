import { SectionContainer } from '@landing/components/organisms/SectionContainer';
import { FIGMA_LANDING_NODES } from '@landing/constants/figma';
import { useI18n } from '@landing/i18n';
import { FEATURE_STRIP_ITEMS } from '../../data/featureStrip';
import { LANDING_SECTION_IDS } from '../../constants/sectionIds';
import styles from './FeatureStripSection.module.css';

/**
 * Feature Strip — Figma Group 3221 (388:1766)
 * Horizontal checklist of product capabilities under the Hero.
 */
export function FeatureStripSection() {
  const { t } = useI18n();

  return (
    <SectionContainer
      as="section"
      id={LANDING_SECTION_IDS.featureStrip}
      spacing="none"
      width="full"
      background="transparent"
      className={styles.strip}
      data-figma-node={FIGMA_LANDING_NODES.featureStrip}
      aria-label={t.a11y.productHighlights}
    >
      <ul className={`${styles.list} motionFadeIn motionStaggerChildren`}>
        {FEATURE_STRIP_ITEMS.map((item) => (
          <li key={item.id} className={styles.item} data-figma-node={item.figmaNodeId}>
            <img
              className={styles.icon}
              src={item.iconSrc}
              alt=""
              width={20}
              height={20}
              decoding="async"
              loading="lazy"
              aria-hidden="true"
            />
            <span className={styles.label}>{t.featureStrip.items[item.id]}</span>
          </li>
        ))}
      </ul>
    </SectionContainer>
  );
}
