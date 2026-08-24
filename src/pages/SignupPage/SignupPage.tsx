import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { loginAssets, signupAssets } from '@assets';
import { useI18n } from '@i18n';
import { ROUTES } from '@router/routes';
import loginStyles from '@pages/LoginPage/LoginPage.module.css';

import { useSignupForm } from './hooks/useSignupForm';
import styles from './SignupPage.module.css';

/** Figma frame "3" (591:180) — create account with hero column and signup card. */
export function SignupPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const form = useSignupForm();

  useEffect(() => {
    document.title = t.signup.seo.title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', t.signup.seo.description);
  }, [t.signup.seo.description, t.signup.seo.title]);

  return (
    <main className={styles.page} data-figma-node="591:180">
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
        <section className={styles.hero} aria-labelledby="signup-hero-title">
          <h1 id="signup-hero-title" className={styles.heroTitle}>
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

        <section className={styles.signupCard} aria-labelledby="signup-form-title">
          <header className={styles.topBar}>
            <button
              type="button"
              className={styles.backButton}
              onClick={() => navigate(ROUTES.login)}
              aria-label={t.a11y.backToLogin}
            >
              <img
                className={styles.backIcon}
                src={signupAssets.iconBack}
                alt=""
                width={18}
                height={18}
                data-flip-rtl="true"
                aria-hidden="true"
              />
            </button>
            <h2 className={styles.topBarTitle}>{t.signup.topBar.title}</h2>
          </header>

          <div className={styles.signupBody}>
            <header className={styles.formHeader}>
              <h2 id="signup-form-title" className={styles.formTitle}>
                {t.signup.form.heading}
              </h2>
              <p className={styles.formSubtitle}>{t.signup.form.subtitle}</p>
            </header>

            <form
              className={styles.form}
              onSubmit={(event) => {
                void form.submit(event);
              }}
              noValidate
            >
              {form.serverError ? (
                <p className={loginStyles.serverError} role="alert">
                  {form.serverError}
                </p>
              ) : null}

              <div className={styles.field}>
                <label className={styles.label} htmlFor="signup-full-name">
                  {t.signup.form.fullNameLabel}
                </label>
                <input
                  id="signup-full-name"
                  className={styles.input}
                  type="text"
                  name="fullName"
                  autoComplete="name"
                  placeholder={t.signup.form.fullNamePlaceholder}
                  value={form.values.fullName}
                  onChange={(event) => form.setField('fullName', event.target.value)}
                />
                {form.fieldErrors.fullName ? (
                  <span className={loginStyles.fieldError}>{form.fieldErrors.fullName}</span>
                ) : null}
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="signup-email">
                  {t.signup.form.emailLabel}
                </label>
                <input
                  id="signup-email"
                  className={styles.input}
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder={t.signup.form.emailPlaceholder}
                  value={form.values.email}
                  onChange={(event) => form.setField('email', event.target.value)}
                />
                {form.fieldErrors.email ? (
                  <span className={loginStyles.fieldError}>{form.fieldErrors.email}</span>
                ) : null}
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="signup-password">
                  {t.signup.form.passwordLabel}
                </label>
                <input
                  id="signup-password"
                  className={styles.input}
                  type="password"
                  name="password"
                  autoComplete="new-password"
                  placeholder={t.signup.form.passwordPlaceholder}
                  value={form.values.password}
                  onChange={(event) => form.setField('password', event.target.value)}
                />
                {form.fieldErrors.password ? (
                  <span className={loginStyles.fieldError}>{form.fieldErrors.password}</span>
                ) : null}
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="signup-country">
                  {t.signup.form.countryLabel}
                </label>
                <input
                  id="signup-country"
                  className={styles.input}
                  type="text"
                  name="country"
                  autoComplete="country-name"
                  placeholder={t.signup.form.countryPlaceholder}
                  value={form.values.country}
                  onChange={(event) => form.setField('country', event.target.value)}
                />
                {form.fieldErrors.country ? (
                  <span className={loginStyles.fieldError}>{form.fieldErrors.country}</span>
                ) : null}
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="signup-telegram">
                  {t.signup.form.telegramLabel}
                </label>
                <input
                  id="signup-telegram"
                  className={styles.input}
                  type="text"
                  name="telegramId"
                  placeholder={t.signup.form.telegramPlaceholder}
                  value={form.values.telegramId}
                  onChange={(event) => form.setField('telegramId', event.target.value)}
                />
                {form.fieldErrors.telegramId ? (
                  <span className={loginStyles.fieldError}>{form.fieldErrors.telegramId}</span>
                ) : null}
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="signup-binolla">
                  {t.signup.form.binollaLabel}
                </label>
                <input
                  id="signup-binolla"
                  className={styles.input}
                  type="text"
                  name="binollaAccount"
                  placeholder={t.signup.form.binollaPlaceholder}
                  value={form.values.binollaAccount}
                  onChange={(event) => form.setField('binollaAccount', event.target.value)}
                />
              </div>

              <div className={styles.submitWrap}>
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={form.isSubmitDisabled}
                >
                  {t.signup.form.submit}
                </button>
              </div>

              <p className={styles.formDisclaimer}>{t.signup.form.disclaimer}</p>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
