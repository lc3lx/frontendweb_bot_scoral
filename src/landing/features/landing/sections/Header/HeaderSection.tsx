import { useCallback, useEffect, useId, useState, type CSSProperties } from 'react';

import { Button } from '@landing/components/atoms/Button';
import { SectionContainer } from '@landing/components/organisms/SectionContainer';
import { BREAKPOINTS } from '@landing/constants/breakpoints';
import { FIGMA_LANDING_NODES } from '@landing/constants/figma';
import { useMinWidth } from '@landing/hooks';
import { LOCALE_META, useI18n } from '@landing/i18n';
import { cn } from '@landing/utils/cn';
import { LANDING_SECTION_IDS } from '../../constants/sectionIds';
import { CREATE_ACCOUNT_HREF, LOGIN_HREF } from '../../constants/links';
import { HEADER_NAV_ITEMS, scarAlphaLogo } from '../../data';
import styles from './HeaderSection.module.css';

/**
 * Landing Header — Figma App (55:584)
 * Logo + Navigation + language toggle + Log in / Create Account.
 *
 * Below `laptop` the nav links and the two CTAs cannot share a row with the logo —
 * they used to overflow the viewport — so they move into a drawer behind a menu button.
 * The drawer is rendered only under that breakpoint so there is never a duplicate set
 * of focusable links in the DOM.
 */
export function HeaderSection() {
  const { t, locale, toggleLocale } = useI18n();
  const switchLabel = LOCALE_META[locale].switchToLabel;
  const isLaptopUp = useMinWidth(BREAKPOINTS.laptop);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  // Growing past the breakpoint puts the links back in the bar; a drawer left open
  // would then be an invisible focus trap.
  useEffect(() => {
    if (isLaptopUp) closeMenu();
  }, [isLaptopUp, closeMenu]);

  useEffect(() => {
    if (!menuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMenu();
    };
    window.addEventListener('keydown', onKeyDown);

    // The drawer scrolls on its own; the page behind it must not.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen, closeMenu]);

  const langButton = (
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
  );

  const actionButtons = (
    <>
      {/* Same-origin, so no target/rel — this stays inside the app. */}
      <Button variant="secondary" size="md" href={LOGIN_HREF} onClick={closeMenu}>
        {t.header.login}
      </Button>

      <Button
        variant="primary"
        size="md"
        href={CREATE_ACCOUNT_HREF}
        target="_blank"
        rel="noopener noreferrer"
        onClick={closeMenu}
      >
        {t.header.createAccount}
      </Button>
    </>
  );

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

        {isLaptopUp ? (
          <>
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
              {langButton}
              <div className={styles.cta}>{actionButtons}</div>
            </div>
          </>
        ) : (
          <div className={styles.actions}>
            {langButton}
            <button
              type="button"
              className={cn(styles.menuToggle, menuOpen && styles.menuToggleOpen)}
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls={menuId}
              aria-label={menuOpen ? t.a11y.closeMenu : t.a11y.openMenu}
            >
              <span className={styles.menuBar} aria-hidden="true" />
              <span className={styles.menuBar} aria-hidden="true" />
              <span className={styles.menuBar} aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      {!isLaptopUp && (
        <div
          id={menuId}
          className={cn(styles.drawer, menuOpen && styles.drawerOpen)}
          // `visibility: hidden` while collapsed (see the CSS) is what keeps these links
          // out of the tab order — React 18 has no typed `inert`.
          aria-hidden={!menuOpen}
        >
          <div className={styles.drawerInner}>
            <nav className={styles.drawerNav} aria-label={t.a11y.primaryNav}>
              <ul className={styles.drawerList}>
                {HEADER_NAV_ITEMS.map((item, index) => (
                  <li
                    key={item.id}
                    className={styles.drawerItem}
                    style={{ '--drawer-index': index } as CSSProperties}
                  >
                    <a className={styles.drawerLink} href={item.href} onClick={closeMenu}>
                      {t.header.nav[item.id]}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className={styles.drawerCta}>{actionButtons}</div>
          </div>
        </div>
      )}
    </SectionContainer>
  );
}
