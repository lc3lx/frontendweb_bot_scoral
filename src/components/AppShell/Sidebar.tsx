import { NavLink, useNavigate } from 'react-router-dom';

import { aiBotAssets, dashboardAssets, loginAssets } from '@assets';
import { useI18n } from '@i18n';
import { ROUTES } from '@router/routes';
import { tokenStore } from '@shared/auth/tokenStore';

import styles from './Sidebar.module.css';

export type DashboardNavId = 'home' | 'trading' | 'trades' | 'aiBot' | 'account';

type NavLabelKey = 'home' | 'trading' | 'trades' | 'aiBot' | 'account';

type NavItemConfig = {
  id: DashboardNavId;
  labelKey: NavLabelKey;
  icon: string;
  to?: string;
};

const NAV_ITEMS: NavItemConfig[] = [
  { id: 'home', labelKey: 'home', icon: dashboardAssets.iconNavHome, to: ROUTES.home },
  { id: 'trading', labelKey: 'trading', icon: dashboardAssets.iconNavTrading, to: ROUTES.trading },
  { id: 'trades', labelKey: 'trades', icon: dashboardAssets.iconNavTrades, to: ROUTES.trades },
  { id: 'aiBot', labelKey: 'aiBot', icon: dashboardAssets.iconNavAiBot, to: ROUTES.aiBot },
  { id: 'account', labelKey: 'account', icon: dashboardAssets.iconNavAccount, to: ROUTES.account },
];

type SidebarProps = {
  activeNav: DashboardNavId;
  id?: string;
  open?: boolean;
  onClose?: () => void;
};

export function Sidebar({ activeNav, id, open = true, onClose }: SidebarProps) {
  const { t } = useI18n();
  const navigate = useNavigate();

  return (
    <aside
      id={id}
      className={`${styles.sidebar}${open ? ` ${styles.sidebarOpen}` : ''}`}
      data-app-sidebar=""
      aria-label={t.dashboard.sidebarAria}
      aria-hidden={open ? undefined : true}
    >
      <div className={styles.brand}>
        <div className={styles.brandMark}>
          <img
            className={styles.brandIcon}
            src={loginAssets.brandIcon}
            alt=""
            width={23}
            height={19}
            aria-hidden="true"
          />
        </div>
        <div className={styles.brandText}>
          <img
            className={styles.brandTextTop}
            src={loginAssets.brandTextTop}
            alt=""
            aria-hidden="true"
          />
          <img
            className={styles.brandTextBottom}
            src={loginAssets.brandTextBottom}
            alt=""
            aria-hidden="true"
          />
        </div>
        {onClose ? (
          <button
            type="button"
            className={styles.closeButton}
            aria-label={t.a11y.closeMenu}
            onClick={onClose}
          >
            <img
              className={styles.closeIcon}
              src={aiBotAssets.iconClose}
              alt=""
              width={16}
              height={16}
              aria-hidden="true"
            />
          </button>
        ) : null}
      </div>

      <nav className={styles.nav}>
        {NAV_ITEMS.map((item) => {
          const className = `${styles.navItem}${activeNav === item.id ? ` ${styles.navItemActive}` : ''}`;

          if (item.to) {
            return (
              <NavLink key={item.id} to={item.to} className={className} onClick={onClose}>
                <img className={styles.navIcon} src={item.icon} alt="" width={18} height={18} aria-hidden="true" />
                {t.dashboard.nav[item.labelKey]}
              </NavLink>
            );
          }

          return (
            <button key={item.id} type="button" className={className} disabled>
              <img className={styles.navIcon} src={item.icon} alt="" width={18} height={18} aria-hidden="true" />
              {t.dashboard.nav[item.labelKey]}
            </button>
          );
        })}
      </nav>

      <button
        type="button"
        className={`${styles.navItem} ${styles.logout}`}
        onClick={() => {
          tokenStore.clear();
          onClose?.();
          navigate(ROUTES.login, { replace: true });
        }}
      >
        <img
          className={styles.navIcon}
          src={dashboardAssets.iconNavLogout}
          alt=""
          width={18}
          height={18}
          aria-hidden="true"
        />
        {t.dashboard.nav.logout}
      </button>
    </aside>
  );
}
