import { useEffect } from 'react';
import { Badge } from '@landing/components/atoms/Badge';
import { Button } from '@landing/components/atoms/Button';
import { Text } from '@landing/components/atoms/Text';
import { TiltSurface } from '@landing/components/molecules/TiltSurface';
import { SectionContainer } from '@landing/components/organisms/SectionContainer';
import { BREAKPOINTS } from '@landing/constants/breakpoints';
import { FIGMA_LANDING_NODES } from '@landing/constants/figma';
import { useMinWidth } from '@landing/hooks/useBreakpoint';
import { useI18n } from '@landing/i18n';
import { LazyImage, preloadHeroAsset } from '@landing/performance';
import { cn } from '@landing/utils/cn';
import { heroAssets } from '../../data';
import { LANDING_SECTION_IDS } from '../../constants/sectionIds';
import { CREATE_ACCOUNT_HREF, TELEGRAM_BOT_HREF } from '../../constants/links';
import styles from './HeroSection.module.css';

/**
 * Landing Hero — Figma 55:515 (copy) + 388:1507 (phones) + 388:1529/1530 (glows)
 * Depth: drifting glows, 3D copy entrance, floating tilted phones.
 */
export function HeroSection() {
  const { t } = useI18n();
  const isDesktopPhones = useMinWidth(BREAKPOINTS.tablet + 1); // >768 duo layout

  useEffect(() => {
    if (isDesktopPhones) {
      preloadHeroAsset(heroAssets.phonesDuo);
    }
  }, [isDesktopPhones]);

  return (
    <SectionContainer
      as="section"
      id={LANDING_SECTION_IDS.hero}
      spacing="none"
      width="full"
      background="transparent"
      className={cn(styles.hero, 'scene3d')}
      data-figma-node={FIGMA_LANDING_NODES.heroCopy}
    >
      <div className={styles.glowLayer} aria-hidden="true">
        <img
          className={cn(styles.glowLeft, 'motionGlowDrift')}
          src={heroAssets.glowLeft}
          alt=""
          width={754}
          height={596}
          decoding="async"
          loading="lazy"
          fetchPriority="low"
        />
        <img
          className={cn(styles.glowRight, 'motionGlowDriftAlt')}
          src={heroAssets.glowRight}
          alt=""
          width={646}
          height={646}
          decoding="async"
          loading="lazy"
          fetchPriority="low"
        />
      </div>

      <div className={styles.layout}>
        <div className={cn(styles.copy, 'motionDepthIn')}>
          <Badge
            variant="soft"
            className={styles.eyebrow}
            startIcon={
              <img
                src={heroAssets.eyebrowShield}
                alt=""
                width={20}
                height={20}
                decoding="async"
                aria-hidden="true"
              />
            }
          >
            {t.hero.eyebrow}
          </Badge>

          <Text as="h1" variant="hero" tone="heading" className={styles.title}>
            {t.hero.title}
          </Text>

          <Text as="p" variant="body" tone="body" className={styles.description}>
            {t.hero.description}
          </Text>

          <div className={styles.actions}>
            <Button
              variant="primary"
              size="md"
              href={CREATE_ACCOUNT_HREF}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t.hero.primaryCta}
              endIcon={
                <img
                  className={styles.ctaArrow}
                  src={heroAssets.arrowRight}
                  alt=""
                  width={20}
                  height={20}
                  decoding="async"
                  aria-hidden="true"
                />
              }
            >
              {t.hero.primaryCta}
            </Button>

            <Button
              variant="secondary"
              size="md"
              href={TELEGRAM_BOT_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.secondaryCta}
              aria-label={t.hero.secondaryCta}
            >
              {t.hero.secondaryCta}
            </Button>
          </div>
        </div>

        <div
          className={cn(styles.visual, 'motionOrbitIn')}
          data-figma-node={FIGMA_LANDING_NODES.heroPhones}
        >
          <TiltSurface className={styles.phoneStage} maxTiltDeg={10} liftPx={18} glare>
            <div className={cn(styles.phoneFloat, 'tilt3dLayer', 'motionFloat3d')}>
              {isDesktopPhones ? (
                <LazyImage
                  className={styles.phonesDuo}
                  src={heroAssets.phonesDuo}
                  alt={t.hero.phonesDuoAlt}
                  width={563}
                  height={749}
                  priority
                />
              ) : (
                <div className={styles.phonesStack}>
                  <LazyImage
                    className={styles.phone}
                    src={heroAssets.phoneSplash}
                    alt={t.hero.phoneSplashAlt}
                    width={249}
                    height={591}
                  />
                  <LazyImage
                    className={cn(styles.phone, 'motionFloat3dDelayed')}
                    src={heroAssets.phoneDashboard}
                    alt={t.hero.phoneDashboardAlt}
                    width={249}
                    height={591}
                  />
                </div>
              )}
            </div>
          </TiltSurface>
        </div>
      </div>
    </SectionContainer>
  );
}
