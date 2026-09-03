import { useCallback, useState } from 'react';
import { PageShell } from '@landing/components/layouts';
import { ScrollToTop } from '@landing/components/atoms/ScrollToTop';
import { FIGMA_LANDING_NODES } from '@landing/constants/figma';
import { useScrollReveal } from '@landing/hooks/useScrollMotion';
import { useScrollIdle } from '@landing/hooks/useScrollIdle';
import { useI18n } from '@landing/i18n';
import { DocumentHead } from '@landing/seo';
import { cn } from '@landing/utils/cn';
import { LogoSplash } from './components/LogoSplash';
import { HeaderSection } from './sections/Header';
import { HeroSection } from './sections/Hero';
import { FeatureStripSection } from './sections/FeatureStrip';
import { FeaturesSection } from './sections/Features';
import { PricingSection } from './sections/Pricing';
import { BotEngineSection } from './sections/BotEngine';
import { TradingSection } from './sections/Trading';
import { StatisticsSection } from './sections/Statistics';
import { TradeTrackingSection } from './sections/TradeTracking';
import { SecuritySection } from './sections/Security';
import { FooterSection } from './sections/Footer';
import type { LandingFeatureProps } from './types';
import styles from './LandingFeature.module.css';

/**
 * Landing feature entry — splash intro, then full page with scroll reveal + back-to-top.
 */
export function LandingFeature({ className }: LandingFeatureProps) {
  const [splashDone, setSplashDone] = useState(false);
  const onSplashFinished = useCallback(() => setSplashDone(true), []);
  useScrollReveal(splashDone);
  useScrollIdle();
  const { t, locale, dir } = useI18n();

  return (
    <>
      <LogoSplash onFinished={onSplashFinished} />
      <DocumentHead
        key={locale}
        seo={{
          title: t.seo.title,
          description: t.seo.description,
          openGraph: {
            title: t.seo.title,
            description: t.seo.description,
            siteName: t.seo.title,
          },
          twitter: {
            title: t.seo.title,
            description: t.seo.description,
          },
        }}
      />
      <PageShell
        className={cn(styles.root, className)}
        data-figma-node={FIGMA_LANDING_NODES.desktopRoot}
        aria-hidden={!splashDone}
        dir={dir}
        lang={locale === 'ar' ? 'ar' : 'en'}
      >
        <HeaderSection />
        <HeroSection />
        <FeatureStripSection />
        <FeaturesSection />
        <PricingSection />
        <BotEngineSection />
        <TradingSection />
        <StatisticsSection />
        <TradeTrackingSection />
        <SecuritySection />
        <FooterSection />
      </PageShell>
      <ScrollToTop />
    </>
  );
}
