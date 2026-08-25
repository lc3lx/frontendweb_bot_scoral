import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { loginAssets } from '@assets';
import { BINOLLA_REFERRAL_SIGNUP_URL } from '@constants/binolla';
import { useI18n } from '@i18n';
import { ROUTES } from '@router/routes';
import { t as tFlat } from '@shared/i18n';
import loginStyles from '@pages/LoginPage/LoginPage.module.css';

import { useBinollaPlatformAuth, type BinollaAuthMode } from './hooks/useBinollaPlatformAuth';
import styles from './LinkBinollaPage.module.css';

export function LinkBinollaPage() {
  const { t } = useI18n();
  const [mode, setMode] = useState<BinollaAuthMode>('login');
  const flow = useBinollaPlatformAuth(mode);
  const isLogin = mode === 'login';

  useEffect(() => {
    document.title = isLogin
      ? tFlat('binolla.auth.loginTitle')
      : tFlat('binolla.auth.signupTitle');
  }, [isLogin]);

  return (
    <main className={loginStyles.page}>
      <img className={loginStyles.bgPattern} src={loginAssets.bgPattern} alt="" aria-hidden="true" />
      <img className={loginStyles.decorChart} src={loginAssets.decorChart} alt="" aria-hidden="true" />

      <div className={loginStyles.layout}>
        <section className={loginStyles.hero} aria-labelledby="link-binolla-title">
          <h1 id="link-binolla-title" className={loginStyles.heroTitle}>
            {isLogin ? tFlat('binolla.auth.loginTitle') : tFlat('binolla.auth.signupTitle')}
          </h1>
          <p className={loginStyles.heroSubtitle}>
            {isLogin ? tFlat('binolla.auth.loginDesc') : tFlat('binolla.auth.signupDesc')}
          </p>
        </section>

        <section className={loginStyles.loginCard} aria-labelledby="link-binolla-form-title">
          <div className={loginStyles.loginCardInner}>
            <header className={loginStyles.formHeader}>
              <h2 id="link-binolla-form-title" className={loginStyles.formTitle}>
                {isLogin ? tFlat('binolla.auth.loginTitle') : tFlat('binolla.auth.signupTitle')}
              </h2>
              <p className={loginStyles.formSubtitle}>
                {isLogin ? tFlat('binolla.auth.loginDesc') : tFlat('binolla.auth.signupDesc')}
              </p>
            </header>

            <form
              className={loginStyles.form}
              onSubmit={(event) => {
                event.preventDefault();
                void flow.submitCredentials();
              }}
              noValidate
            >
              <div className={loginStyles.field}>
                <label className={loginStyles.label} htmlFor="binolla-email">
                  {tFlat('binolla.auth.emailLabel')}
                </label>
                <input
                  id="binolla-email"
                  className={loginStyles.input}
                  type="email"
                  autoComplete="username"
                  placeholder={tFlat('binolla.auth.emailPlaceholder')}
                  value={flow.email}
                  onChange={(event) => flow.setEmail(event.target.value)}
                />
              </div>

              <div className={loginStyles.field}>
                <label className={loginStyles.label} htmlFor="binolla-password">
                  {tFlat('binolla.auth.passwordLabel')}
                </label>
                <input
                  id="binolla-password"
                  className={loginStyles.input}
                  type="password"
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
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
                  {flow.status === 'loading'
                    ? isLogin
                      ? tFlat('binolla.auth.loggingIn')
                      : tFlat('binolla.auth.creating')
                    : flow.status === 'success'
                      ? tFlat('binolla.auth.entering')
                      : isLogin
                        ? tFlat('binolla.auth.loginCta')
                        : tFlat('binolla.auth.signupCta')}
                </button>
              </div>

              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => window.open(BINOLLA_REFERRAL_SIGNUP_URL, '_blank', 'noopener,noreferrer')}
              >
                {tFlat('binolla.auth.goSignup')}
              </button>

              <p className={loginStyles.signupPrompt}>
                {isLogin ? (
                  <>
                    {tFlat('signup.noAccount')}{' '}
                    <button
                      type="button"
                      className={`${loginStyles.signupLink} ${styles.modeSwitch}`}
                      onClick={() => setMode('register')}
                    >
                      {tFlat('signup.createBinolla')}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      className={`${loginStyles.signupLink} ${styles.modeSwitch}`}
                      onClick={() => setMode('login')}
                    >
                      {tFlat('binolla.auth.loginCta')}
                    </button>
                  </>
                )}
              </p>

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
