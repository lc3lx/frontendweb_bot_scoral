import { Button } from '@landing/components/atoms/Button';
import { SectionContainer } from '@landing/components/organisms/SectionContainer';
import { FIGMA_LANDING_NODES } from '@landing/constants/figma';
import { LOCALE_META, useI18n } from '@landing/i18n';
import { LANDING_SECTION_IDS } from '../../constants/sectionIds';
import { CREATE_ACCOUNT_HREF, LOGIN_HREF } from '../../constants/links';
import { HEADER_NAV_ITEMS, scarAlphaLogo } from '../../data';
import styles from './HeaderSection.module.css';

/**
 * Landing Header — Figma App (55:584)
 * Logo + Navigation + language toggle + Create Account CTA.
 */
export function HeaderSection() {
  const { t, locale, toggleLocale } = useI18n();
  const switchLabel = LOCALE_META[locale].switchToLabel;

  return (
    <SectionContainer
      as="header"
      id={LANDING_SECTION_IDS.header}
      spacing="none"
      background="default"
      className={styles.header}
      data-figma-node={FIGMA_LANDING_NODES.header}
    >
      <div className={styles.bar}>
        <a className={styles.logoLink} href={`#${LANDING_SECTION_IDS.hero}`}>
          <img
            className={styles.logo}
            src={scarAlphaLogo}
            alt={t.header.logoAlt}
            width={401}
            height={122}
            decoding="async"
          />
        </a>

        <nav className={styles.nav} aria-label={t.a11y.primaryNav}>
          <ul className={styles.navList}>
            {HEADER_NAV_ITEMS.map((item) => (
              <li key={item.id} className={styles.navItem}>
                <a className={styles.navLink} href={item.href}>
                  {t.header.nav[item.id]}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.langToggle}
            onClick={toggleLocale}
            aria-label={t.a11y.switchLanguage}
            title={t.a11y.switchLanguage}
          >
            <span className={styles.langCode} lang={locale === 'en' ? 'ar' : 'en'}>
              {switchLabel}
            </span>
          </button>

          <div className={styles.cta}>
            {/* Same-origin, so no target/rel — this stays inside the app. */}
            <Button variant="secondary" size="md" href={LOGIN_HREF}>
              {t.header.login}
            </Button>

            <Button
              variant="primary"
              size="md"
              href={CREATE_ACCOUNT_HREF}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t.header.createAccount}
            </Button>
          </div>
        </div>
      </div>
    </SectionContainer>
  );
}
