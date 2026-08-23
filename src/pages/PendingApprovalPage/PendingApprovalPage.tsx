import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { loginAssets, pendingAssets } from '@assets';
import { useI18n } from '@i18n';
import { ROUTES } from '@router/routes';

import styles from './PendingApprovalPage.module.css';

/** Figma frame "4" (595:669) — pending approval with hero column and status card. */
export function PendingApprovalPage() {
  const { t } = useI18n();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = t.pendingApproval.seo.title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', t.pendingApproval.seo.description);
  }, [t.pendingApproval.seo.description, t.pendingApproval.seo.title]);

  return (
    <main className={styles.page} data-figma-node="595:669">
      <img
        className={styles.bgPattern}
        src={loginAssets.bgPattern}
        alt=""
        aria-hidden="true"
        decoding="async"
      />

      <img
        className={styles.decorChart}
        src={loginAssets.decorChart}
        alt=""
        aria-hidden="true"
        decoding="async"
      />

      <div className={styles.layout}>
        <section className={styles.hero} aria-labelledby="pending-hero-title">
          <h1 id="pending-hero-title" className={styles.heroTitle}>
            <span className={styles.heroTitleLine}>{t.login.hero.line1}</span>
            <span className={styles.heroTitleLine}>
              {t.login.hero.line2Prefix}
              <span className={styles.heroTitleHighlight}>{t.login.hero.line2Highlight}</span>
            </span>
          </h1>

          <p className={styles.heroSubtitle}>{t.login.hero.subtitle}</p>

          <ul className={styles.features}>
            {t.login.features.map((feature) => (
              <li key={feature.title} className={styles.feature}>
                <div className={styles.featureIconWrap}>
                  <img
                    className={styles.featureIcon}
                    src={loginAssets.iconFeature}
                    alt=""
                    width={18}
                    height={18}
                    aria-hidden="true"
                  />
                </div>
                <div className={styles.featureCopy}>
                  <h2 className={styles.featureTitle}>{feature.title}</h2>
                  <p className={styles.featureDescription}>{feature.description}</p>
                </div>
              </li>
            ))}
          </ul>

          <p className={styles.heroCopyright}>{t.login.hero.copyright}</p>
        </section>

        <section className={styles.pendingCard} aria-labelledby="pending-card-title">
          <header className={styles.topBar}>
            <div className={styles.topBarSpacer} aria-hidden="true" />
            <h2 id="pending-card-title" className={styles.topBarTitle}>
              {t.pendingApproval.topBar.title}
            </h2>
            <div className={styles.topBarSpacer} aria-hidden="true" />
          </header>

          <div className={styles.pendingBody}>
            <div className={styles.statusVisual}>
              <div className={styles.statusRingOuter}>
                <div className={styles.statusRingInner}>
                  <img
                    className={styles.statusIcon}
                    src={pendingAssets.iconSpinner}
                    alt=""
                    width={32}
                    height={32}
                    aria-hidden="true"
                  />
                </div>
              </div>
            </div>

            <div className={styles.chipWrap}>
              <span className={styles.chip}>
                <span className={styles.chipDot} aria-hidden="true" />
                {t.pendingApproval.status.chip}
              </span>
            </div>

            <h3 className={styles.statusTitle}>{t.pendingApproval.status.heading}</h3>
            <p className={styles.statusDescription}>{t.pendingApproval.status.description}</p>

            <dl className={styles.infoCard}>
              <div className={styles.infoRow}>
                <dt className={styles.infoLabel}>{t.pendingApproval.details.submittedLabel}</dt>
                <dd className={styles.infoValue}>{t.pendingApproval.details.submittedValue}</dd>
              </div>
              <div className={styles.infoRow}>
                <dt className={styles.infoLabel}>{t.pendingApproval.details.estimatedLabel}</dt>
                <dd className={styles.infoValue}>{t.pendingApproval.details.estimatedValue}</dd>
              </div>
              <div className={styles.infoRow}>
                <dt className={styles.infoLabel}>{t.pendingApproval.details.reviewerLabel}</dt>
                <dd className={styles.infoValue}>{t.pendingApproval.details.reviewerValue}</dd>
              </div>
            </dl>

            <div className={styles.actions}>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={() => navigate(ROUTES.dashboard)}
              >
                {t.pendingApproval.actions.refresh}
              </button>
              <button
                type="button"
                className={styles.ghostButton}
                onClick={() => navigate(ROUTES.login)}
              >
                {t.pendingApproval.actions.backToLogin}
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
