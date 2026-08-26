import type { CSSProperties } from 'react';
import { Text } from '@landing/components/atoms/Text';
import { Card } from '@landing/components/molecules/Card';
import { SectionTitle } from '@landing/components/molecules/SectionTitle';
import { TiltSurface } from '@landing/components/molecules/TiltSurface';
import { SectionContainer } from '@landing/components/organisms/SectionContainer';
import { FIGMA_LANDING_NODES } from '@landing/constants/figma';
import { useI18n } from '@landing/i18n';
import { cn } from '@landing/utils/cn';
import { BOT_ENGINE_CARDS } from '../../data/botEngine';
import { LANDING_SECTION_IDS } from '../../constants/sectionIds';
import styles from './BotEngineSection.module.css';

/**
 * AI Bot Engine — Figma 55:134 (title) + 524:1947–1949 (9 control cards)
 */
export function BotEngineSection() {
  const { t } = useI18n();

  return (
    <SectionContainer
      as="section"
      id={LANDING_SECTION_IDS.botEngine}
      spacing="none"
      width="full"
      background="transparent"
      className={cn(styles.botEngine, 'scene3d')}
      data-figma-node={FIGMA_LANDING_NODES.botEngineTitle}
      aria-labelledby="bot-engine-heading"
    >
      <SectionTitle
        id="bot-engine-heading"
        className={cn(styles.heading, 'motionDepthIn')}
        align="center"
        titleAs="h2"
        eyebrow={t.botEngine.eyebrow}
        title={t.botEngine.title}
        description={t.botEngine.description}
      />

      <ul className={cn(styles.grid, 'motionStaggerDepth')} role="list">
        {BOT_ENGINE_CARDS.map((card) => {
          const copy = t.botEngine.cards[card.id as keyof typeof t.botEngine.cards];
          const iconVars = {
            '--icon-w': card.iconWidth,
            '--icon-h': card.iconHeight,
            '--icon-x': card.iconOffsetX,
            '--icon-y': card.iconOffsetY,
          } as CSSProperties;

          return (
            <li key={card.id} className={styles.gridItem}>
              <TiltSurface
                as="div"
                className={styles.tiltWrap}
                maxTiltDeg={6}
                liftPx={10}
                glare
              >
                <Card
                  as="article"
                  variant="flat"
                  padding="none"
                  className={styles.card}
                  data-figma-node={card.figmaNodeId}
                >
                  <div className={cn(styles.iconPlate, 'tilt3dLayer')} aria-hidden="true" style={iconVars}>
                    <img
                      className={styles.icon}
                      src={card.icon}
                      alt=""
                      width={card.iconWidth}
                      height={card.iconHeight}
                      decoding="async"
                      loading="lazy"
                    />
                  </div>
                  <div className={styles.copy}>
                    <Text as="h3" variant="title" tone="heading" className={styles.cardTitle}>
                      {copy.title}
                    </Text>
                    <Text as="p" variant="caption" tone="muted" className={styles.cardBody}>
                      {copy.description}
                    </Text>
                  </div>
                </Card>
              </TiltSurface>
            </li>
          );
        })}
      </ul>
    </SectionContainer>
  );
}
