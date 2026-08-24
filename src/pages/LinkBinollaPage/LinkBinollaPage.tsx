import { useEffect } from 'react';
import { Link } from 'react-router-dom';

import { loginAssets } from '@assets';
import { useI18n } from '@i18n';
import { ROUTES } from '@router/routes';
import loginStyles from '@pages/LoginPage/LoginPage.module.css';

import { useBinollaPlatformAuth } from './hooks/useBinollaPlatformAuth';
import styles from './LinkBinollaPage.module.css';

export function LinkBinollaPage() {
  const { t } = useI18n();
  const flow = useBinollaPlatformAuth('login');

  useEffect(() => {
    document.title = t.login.seo.title;
  }, [t.login.seo.title]);

  return (
    <main className={loginStyles.page}>
      <img className={loginStyles.bgPattern} src={loginAssets.bgPattern} alt="" aria-hidden="true" />
      <img className={loginStyles.decorChart} src={loginAssets.decorChart} alt="" aria-hidden="true" />

      <div className={loginStyles.layout}>
        <section className={loginStyles.hero} aria-labelledby="link-binolla-title">
          <h1 id="link-binolla-title" className={loginStyles.heroTitle}>
            {t.login.hero.line1}
          </h1>
          <p className={loginStyles.heroSubtitle}>{t.login.hero.subtitle}</p>
        </section>

        <section className={loginStyles.loginCard} aria-labelledby="link-binolla-form-title">
          <div className={loginStyles.loginCardInner}>
            <header className={loginStyles.formHeader}>
              <h2 id="link-binolla-form-title" className={loginStyles.formTitle}>
                {t.signup.form.binollaLabel}
              </h2>
              <p className={loginStyles.formSubtitle}>{t.signup.form.disclaimer}</p>
            </header>

            <form
              className={loginStyles.form}
              onSubmit={(event) => {
                event.preventDefault();
                void flow.submitCredentials();
              }}
            >
              <div className={loginStyles.field}>
                <label className={loginStyles.label} htmlFor="binolla-email">
                  {t.signup.form.emailLabel}
                </label>
                <input
                  id="binolla-email"
                  className={loginStyles.input}
                  type="email"
                  autoComplete="username"
                  value={flow.email}
                  onChange={(event) => flow.setEmail(event.target.value)}
                />
              </div>

              <div className={loginStyles.field}>
                <label className={loginStyles.label} htmlFor="binolla-password">
                  {t.signup.form.passwordLabel}
                </label>
                <input
                  id="binolla-password"
                  className={loginStyles.input}
                  type="password"
                  autoComplete="current-password"
                  value={flow.password}
                  onChange={(event) => flow.setPassword(event.target.value)}
                />
              </div>

              {flow.error ? (
                <p className={styles.error} role="alert">
                  {flow.error}
                </p>
              ) : null}

              <div className={loginStyles.submitWrap}>
                <button
                  type="submit"
                  className={loginStyles.submitButton}
                  disabled={flow.status === 'loading' || flow.status === 'success'}
                >
                  {t.login.form.submit}
                </button>
              </div>

              <p className={loginStyles.signupPrompt}>
                <Link to={ROUTES.login} className={loginStyles.signupLink}>
                  {t.pendingApproval.actions.backToLogin}
                </Link>
              </p>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
