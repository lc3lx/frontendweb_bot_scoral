import { useEffect, useRef, useState } from 'react';

import { dashboardAssets } from '@assets';
import { useI18n } from '@i18n';
import { useSessionProfile } from '@hooks/useSessionProfile';

import styles from './DashboardHeader.module.css';
import { ProfileDropdown } from './ProfileDropdown';

type DashboardHeaderProps = {
  title: string;
  profileDropdownOpen?: boolean;
};

export function DashboardHeader({ title, profileDropdownOpen }: DashboardHeaderProps) {
  const { t } = useI18n();
  const profile = useSessionProfile();
  const [menuOpen, setMenuOpen] = useState(Boolean(profileDropdownOpen));
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (profileDropdownOpen != null) setMenuOpen(profileDropdownOpen);
  }, [profileDropdownOpen]);

  useEffect(() => {
    if (!menuOpen) return undefined;

    function onPointerDown(event: MouseEvent) {
      if (!wrapRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setMenuOpen(false);
    }

    window.addEventListener('mousedown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  const accountLabel =
    profile.accountType === 'Real' ? t.dashboard.user.live : t.dashboard.user.demo;

  return (
    <header className={styles.header}>
      <h1 className={styles.title}>{title}</h1>

      <div className={styles.actions}>
        <div className={styles.profileWrap} ref={wrapRef}>
          <div className={`${styles.profile} ${menuOpen ? styles.profileOpen : ''}`}>
            <button
              type="button"
              className={styles.profileMain}
              aria-label={t.dashboard.profileAria}
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span className={styles.avatar} aria-hidden="true" />
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
                className={`${styles.chevron}${menuOpen ? ` ${styles.chevronOpen}` : ''}`}
                src={dashboardAssets.iconChevronDown}
                alt=""
                width={16}
                height={16}
                aria-hidden="true"
              />
            </button>
          </div>

          {menuOpen ? (
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

          {profile.error && !menuOpen ? (
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
