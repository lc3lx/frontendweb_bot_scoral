import { useEffect } from 'react';

import { loginAssets } from '@assets';
import { BINOLLA_REFERRAL_SIGNUP_URL } from '@constants/binolla';
import { useI18n } from '@i18n';
import { t as tFlat } from '@shared/i18n';
import { useLoginForm } from './hooks/useLoginForm';
import styles from './LoginPage.module.css';

/** Web entry — Binolla login/signup only (no separate Scar Alpha password). */
export function LoginPage() {
  const { t } = useI18n();
  const form = useLoginForm();
  const isLogin = form.isLogin;

  useEffect(() => {
    document.title = isLogin
      ? tFlat('binolla.auth.loginTitle')
      : tFlat('binolla.auth.signupTitle');
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute(
        'content',
        isLogin ? tFlat('binolla.auth.loginDesc') : tFlat('binolla.auth.signupDesc'),
      );
    }
  }, [isLogin]);

  return (
    <main className={styles.page} data-figma-node="574:975">
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
        <section className={styles.hero} aria-labelledby="login-hero-title">
          <h1 id="login-hero-title" className={styles.heroTitle}>
            <span className={styles.heroTitleLine}>{t.login.hero.line1}</span>
            <span className={styles.heroTitleLine}>
              {t.login.hero.line2Prefix}
              <span className={styles.heroTitleHighlight}>{t.login.hero.line2Highlight}</span>
            </span>
          </h1>

          <p className={styles.heroSubtitle}>
            {isLogin ? tFlat('binolla.auth.loginDesc') : tFlat('binolla.auth.signupDesc')}
          </p>

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

        <section className={styles.loginCard} aria-labelledby="login-form-title">
          <div className={styles.loginCardInner}>
            <div className={styles.brandMark}>
              <div className={styles.brandIconWrap}>
                <img
                  className={styles.brandIcon}
                  src={loginAssets.brandIcon}
                  alt=""
                  width={24}
                  height={19}
                  aria-hidden="true"
                />
              </div>
              <div className={styles.brandText} aria-hidden="true">
                <img
                  className={styles.brandTextTop}
                  src={loginAssets.brandTextTop}
                  alt=""
                  width={100}
                  height={17}
                />
                <img
                  className={styles.brandTextBottom}
                  src={loginAssets.brandTextBottom}
                  alt=""
                  width={97}
                  height={10}
                />
              </div>
            </div>

            <header className={styles.formHeader}>
              <h2 id="login-form-title" className={styles.formTitle}>
                {isLogin ? tFlat('binolla.auth.loginTitle') : tFlat('binolla.auth.signupTitle')}
              </h2>
              <p className={styles.formSubtitle}>
                {isLogin ? tFlat('binolla.auth.loginDesc') : tFlat('binolla.auth.signupDesc')}
              </p>
            </header>

            <form
              className={styles.form}
              onSubmit={(event) => {
                void form.submit(event);
              }}
              noValidate
            >
              {form.serverError ? (
                <p className={styles.serverError} role="alert">
                  {form.serverError}
                </p>
              ) : null}

              <div className={styles.field}>
                <label className={styles.label} htmlFor="login-email">
                  {tFlat('binolla.auth.emailLabel')}
                </label>
                <input
                  id="login-email"
                  className={styles.input}
                  type="email"
                  name="email"
                  autoComplete="username"
                  placeholder={tFlat('binolla.auth.emailPlaceholder')}
                  value={form.values.email}
                  onChange={(event) => form.setField('email', event.target.value)}
                />
                {form.fieldErrors.email ? (
                  <span className={styles.fieldError}>{form.fieldErrors.email}</span>
                ) : null}
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="login-password">
                  {tFlat('binolla.auth.passwordLabel')}
                </label>
                <div className={styles.passwordWrap}>
                  <input
                    id="login-password"
                    className={`${styles.input} ${styles.passwordInput}`}
                    type="password"
                    name="password"
                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                    value={form.values.password}
                    onChange={(event) => form.setField('password', event.target.value)}
                  />
                </div>
                {form.fieldErrors.password ? (
                  <span className={styles.fieldError}>{form.fieldErrors.password}</span>
                ) : null}
              </div>

              <div className={styles.submitWrap}>
                <button type="submit" className={styles.submitButton} disabled={form.isSubmitDisabled}>
                  {form.status === 'loading'
                    ? isLogin
                      ? tFlat('binolla.auth.loggingIn')
                      : tFlat('binolla.auth.creating')
                    : isLogin
                      ? tFlat('binolla.auth.loginCta')
                      : tFlat('binolla.auth.signupCta')}
                </button>
              </div>

              <button
                type="button"
                className={styles.signupLink}
                onClick={() => window.open(BINOLLA_REFERRAL_SIGNUP_URL, '_blank', 'noopener,noreferrer')}
              >
                {tFlat('binolla.auth.goSignup')}
              </button>

              <p className={styles.signupPrompt}>
                {isLogin ? (
                  <>
                    {tFlat('signup.noAccount')}{' '}
                    <button
                      type="button"
                      className={styles.signupLink}
                      onClick={() => form.setMode('register')}
                    >
                      {tFlat('signup.createBinolla')}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      className={styles.signupLink}
                      onClick={() => form.setMode('login')}
                    >
                      {tFlat('binolla.auth.loginCta')}
                    </button>
                  </>
                )}
              </p>

              <p className={styles.formDisclaimer}>{t.login.form.disclaimer}</p>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
