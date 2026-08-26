import { useEffect, useRef, useState } from 'react';

import { dashboardAssets, loginAssets } from '@assets';
import { LOCALE_META, useI18n } from '@i18n';
import { useSessionProfile } from '@hooks/useSessionProfile';

import styles from './DashboardHeader.module.css';
import { ProfileDropdown } from './ProfileDropdown';

type DashboardHeaderProps = {
  title: string;
  profileDropdownOpen?: boolean;
  menuOpen?: boolean;
  menuId?: string;
  onMenuToggle?: () => void;
};

export function DashboardHeader({
  title,
  profileDropdownOpen,
  menuOpen = false,
  menuId,
  onMenuToggle,
}: DashboardHeaderProps) {
  const { t, locale, toggleLocale } = useI18n();
  const profile = useSessionProfile();
  const [menuProfileOpen, setMenuProfileOpen] = useState(Boolean(profileDropdownOpen));
  const wrapRef = useRef<HTMLDivElement>(null);
  const switchLabel = LOCALE_META[locale].switchToLabel;

  useEffect(() => {
    if (profileDropdownOpen != null) setMenuProfileOpen(profileDropdownOpen);
  }, [profileDropdownOpen]);

  useEffect(() => {
    if (!menuProfileOpen) return undefined;

    function onPointerDown(event: MouseEvent) {
      if (!wrapRef.current?.contains(event.target as Node)) {
        setMenuProfileOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setMenuProfileOpen(false);
    }

    window.addEventListener('mousedown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [menuProfileOpen]);

  const accountLabel =
    profile.accountType === 'Real' ? t.dashboard.user.live : t.dashboard.user.demo;

  return (
    <header className={styles.header}>
      <div className={styles.start}>
        {onMenuToggle ? (
          <button
            type="button"
            className={`${styles.menuButton}${menuOpen ? ` ${styles.menuButtonOpen}` : ''}`}
            aria-label={menuOpen ? t.a11y.closeMenu : t.a11y.openMenu}
            aria-expanded={menuOpen}
            aria-controls={menuId}
            onClick={onMenuToggle}
          >
            <span className={styles.menuBar} aria-hidden="true" />
            <span className={styles.menuBar} aria-hidden="true" />
            <span className={styles.menuBar} aria-hidden="true" />
          </button>
        ) : null}

        <h1 className={styles.title}>{title}</h1>
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.langButton}
          onClick={toggleLocale}
          aria-label={t.a11y.switchLanguage}
          title={t.a11y.switchLanguage}
        >
          <span className={styles.langCode} lang={locale === 'en' ? 'ar' : 'en'}>
            {switchLabel}
          </span>
        </button>

        <div className={styles.profileWrap} ref={wrapRef}>
          <div className={`${styles.profile} ${menuProfileOpen ? styles.profileOpen : ''}`}>
            <button
              type="button"
              className={styles.profileMain}
              aria-label={t.dashboard.profileAria}
              aria-expanded={menuProfileOpen}
              aria-haspopup="menu"
              onClick={() => setMenuProfileOpen((open) => !open)}
            >
              <span className={styles.avatar} aria-hidden="true">
                <img
                  className={styles.avatarLogo}
                  src={loginAssets.brandIcon}
                  alt=""
                  width={28}
                  height={28}
                />
              </span>
              <span className={styles.profileText}>
                <span className={styles.profileName}>
                  {profile.loading ? t.dashboard.user.name : profile.name}
                </span>
                <span className={styles.profileBalanceRow}>
                  <span className={styles.profileBalance}>{profile.balance}</span>
                  <span className={styles.profileDemo}>{accountLabel}</span>
                </span>
              </span>
            </button>

            <button
              type="button"
              className={`${styles.chevronButton}${profile.switching ? ` ${styles.chevronBusy}` : ''}`}
              aria-label={t.dashboard.accountMenu.switchAccount}
              title={t.dashboard.accountMenu.switchAccount}
              disabled={profile.switching || profile.loading}
              onClick={() => {
                void profile.toggleAccount();
              }}
            >
              <img
                className={`${styles.chevron}${menuProfileOpen ? ` ${styles.chevronOpen}` : ''}`}
                src={dashboardAssets.iconChevronDown}
                alt=""
                width={16}
                height={16}
                aria-hidden="true"
              />
            </button>
          </div>

          {menuProfileOpen ? (
            <ProfileDropdown
              name={profile.name}
              email={profile.email}
              accountType={profile.accountType}
              demoBalance={profile.demoBalance}
              realBalance={profile.realBalance}
              switching={profile.switching}
              error={profile.error}
              onSelectAccount={(next) => {
                void profile.switchAccount(next);
              }}
            />
          ) : null}

          {profile.error && !menuProfileOpen ? (
            <p className={styles.switchError} role="alert">
              {profile.error}
            </p>
          ) : null}
        </div>

        <button type="button" className={styles.notifButton} aria-label={t.dashboard.notificationsAria}>
          <img
            className={styles.notifIcon}
            src={dashboardAssets.iconBell}
            alt=""
            width={16}
            height={16}
            aria-hidden="true"
          />
          <span className={styles.notifDot} aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
