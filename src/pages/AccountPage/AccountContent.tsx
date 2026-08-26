import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { accountAssets, dashboardAssets } from '@assets';
import { useI18n } from '@i18n';
import { HomeTilt } from '@pages/DashboardPage/HomeTilt';
import { ROUTES } from '@router/routes';
import { tokenStore } from '@shared/auth/tokenStore';

import { accountService } from './data/accountService';
import type { AccountProfile } from './data/account.mock';
import styles from './AccountPage.module.css';

type AccountContentProps = {
  figmaNode: string;
};

function AccountBackdrop() {
  return (
    <div className={styles.backdrop} aria-hidden="true">
      <img className={styles.bg} src={dashboardAssets.homeBg} alt="" />
      <span className={styles.veil} />
    </div>
  );
}

export function AccountContent({ figmaNode }: AccountContentProps) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<AccountProfile | null>(null);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const next = await accountService.fetchProfile();
        if (active) {
          setProfile({
            fullName: next.fullName,
            email: next.email,
            country: next.country,
            telegram: next.telegram,
            binollaId: next.binollaId,
            unreadNotifications: next.unreadNotifications,
          });
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  if (!profile) {
    return (
      <div className={styles.page} data-figma-node={figmaNode}>
        <AccountBackdrop />
        <div className={styles.content}>
          <p>…</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page} data-figma-node={figmaNode}>
      <AccountBackdrop />

      <div className={styles.content}>
        <div className={styles.accountLayout}>
          <div className={styles.accountLeft}>
            <HomeTilt maxTiltDeg={6} liftPx={12}>
              <section className={`${styles.homeCard} ${styles.profileCard}`}>
                <div className={styles.profileHead}>
                  <div className={styles.profileAvatar}>
                    <img
                      className={styles.profileAvatarIcon}
                      src={accountAssets.iconProfile}
                      alt=""
                      width={32}
                      height={32}
                      aria-hidden="true"
                    />
                  </div>
                  <div className={styles.profileInfo}>
                    <p className={styles.profileName}>{profile.fullName}</p>
                    <p className={styles.profileEmail}>{profile.email}</p>
                  </div>
                </div>
                <div className={styles.profileBadges}>
                  <span className={`${styles.badge} ${styles.badgeApproved}`}>
                    <span className={styles.badgeDot} aria-hidden="true" />
                    {t.account.profile.approved}
                  </span>
                  <span className={`${styles.badge} ${styles.badgePlan}`}>
                    <span className={`${styles.badgeDot} ${styles.badgeDotPlan}`} aria-hidden="true" />
                    {t.account.profile.alphaPro}
                  </span>
                </div>
              </section>
            </HomeTilt>

            <section className={styles.section}>
              <h2 className={styles.sectionLabel}>{t.account.sections.accountDetails}</h2>
              <HomeTilt maxTiltDeg={5} liftPx={8}>
                <div className={`${styles.homeCard} ${styles.detailCard}`}>
                  <div className={styles.detailRow}>
                    <div className={styles.detailIconWrap}>
                      <img
                        src={accountAssets.iconCountry}
                        alt=""
                        width={18}
                        height={18}
                        aria-hidden="true"
                      />
                    </div>
                    <span className={styles.detailLabel}>{t.account.fields.country}</span>
                    <span className={styles.detailValue}>{profile.country}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <div className={styles.detailIconWrap}>
                      <img
                        src={accountAssets.iconTelegram}
                        alt=""
                        width={18}
                        height={18}
                        aria-hidden="true"
                      />
                    </div>
                    <span className={styles.detailLabel}>{t.account.fields.telegram}</span>
                    <span className={styles.detailValue}>{profile.telegram}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <div className={styles.detailIconWrap}>
                      <img
                        src={accountAssets.iconBinolla}
                        alt=""
                        width={18}
                        height={18}
                        aria-hidden="true"
                      />
                    </div>
                    <span className={styles.detailLabel}>{t.account.fields.binollaId}</span>
                    <span className={styles.detailValue}>{profile.binollaId}</span>
                  </div>
                </div>
              </HomeTilt>
            </section>
          </div>

          <div className={styles.accountRight}>
            <section className={styles.section}>
              <h2 className={styles.sectionLabel}>{t.account.sections.settings}</h2>
              <HomeTilt maxTiltDeg={5} liftPx={8}>
                <div className={`${styles.homeCard} ${styles.settingsCard}`}>
                  <button
                    type="button"
                    className={styles.settingsRow}
                    onClick={() => navigate(ROUTES.accountEditProfile)}
                  >
                    <div className={styles.settingsIconWrap}>
                      <img
                        src={accountAssets.iconEdit}
                        alt=""
                        width={18}
                        height={18}
                        aria-hidden="true"
                      />
                    </div>
                    <span className={styles.settingsLabel}>{t.account.settings.editProfile}</span>
                    <img
                      className={styles.settingsChevron}
                      src={accountAssets.iconChevron}
                      alt=""
                      width={16}
                      height={16}
                      data-flip-rtl="true"
                      aria-hidden="true"
                    />
                  </button>
                  <button
                    type="button"
                    className={styles.settingsRow}
                    onClick={() => navigate(ROUTES.accountNotifications)}
                  >
                    <div className={styles.settingsIconWrap}>
                      <img
                        src={accountAssets.iconNotifications}
                        alt=""
                        width={18}
                        height={18}
                        aria-hidden="true"
                      />
                    </div>
                    <span className={styles.settingsLabel}>{t.account.settings.notifications}</span>
                    <span className={`${styles.badge} ${styles.badgeCount}`}>
                      <span className={`${styles.badgeDot} ${styles.badgeDotPlan}`} aria-hidden="true" />
                      {profile.unreadNotifications}
                    </span>
                    <img
                      className={styles.settingsChevron}
                      src={accountAssets.iconChevron}
                      alt=""
                      width={16}
                      height={16}
                      data-flip-rtl="true"
                      aria-hidden="true"
                    />
                  </button>
                </div>
              </HomeTilt>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionLabel}>{t.account.sections.session}</h2>
              <HomeTilt maxTiltDeg={4} liftPx={8}>
                <button
                  type="button"
                  className={styles.logoutRow}
                  onClick={() => {
                    tokenStore.clear();
                    navigate(ROUTES.login, { replace: true });
                  }}
                >
                  <div className={styles.logoutIconWrap}>
                    <img
                      src={accountAssets.iconSessionLogout}
                      alt=""
                      width={18}
                      height={18}
                      aria-hidden="true"
                    />
                  </div>
                  <span className={styles.logoutLabel}>{t.account.actions.logout}</span>
                  <img
                    className={styles.settingsChevron}
                    src={accountAssets.iconSessionChevron}
                    alt=""
                    width={16}
                    height={16}
                    data-flip-rtl="true"
                    aria-hidden="true"
                  />
                </button>
              </HomeTilt>
            </section>

            <p className={styles.versionFooter}>{t.account.footer.version}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
