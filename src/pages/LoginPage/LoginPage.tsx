import { useEffect, useState } from 'react';

import { Link } from 'react-router-dom';

import { loginAssets } from '@assets';

import { useI18n } from '@i18n';

import { ROUTES } from '@router/routes';

import styles from './LoginPage.module.css';



/**

 * Figma frame "2" (574:975) — login with hero column and auth card.

 */

export function LoginPage() {

  const { t } = useI18n();

  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);



  useEffect(() => {

    document.title = t.login.seo.title;

    const meta = document.querySelector('meta[name="description"]');

    if (meta) meta.setAttribute('content', t.login.seo.description);

  }, [t.login.seo.description, t.login.seo.title]);



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

                {t.login.form.welcome}

              </h2>

              <p className={styles.formSubtitle}>{t.login.form.subtitle}</p>

            </header>



            <form

              className={styles.form}

              onSubmit={(event) => {

                event.preventDefault();

              }}

            >

              <div className={styles.field}>

                <label className={styles.label} htmlFor="login-email">

                  {t.login.form.emailLabel}

                </label>

                <input

                  id="login-email"

                  className={styles.input}

                  type="email"

                  name="email"

                  autoComplete="email"

                  placeholder={t.login.form.emailPlaceholder}

                  value={email}

                  onChange={(event) => setEmail(event.target.value)}

                />

              </div>



              <div className={styles.field}>

                <label className={styles.label} htmlFor="login-password">

                  {t.login.form.passwordLabel}

                </label>

                <div className={styles.passwordWrap}>

                  <input

                    id="login-password"

                    className={`${styles.input} ${styles.passwordInput}`}

                    type={showPassword ? 'text' : 'password'}

                    name="password"

                    autoComplete="current-password"

                    value={password}

                    onChange={(event) => setPassword(event.target.value)}

                  />

                  <button

                    type="button"

                    className={styles.togglePassword}

                    onClick={() => setShowPassword((visible) => !visible)}

                    aria-label={showPassword ? t.a11y.hidePassword : t.a11y.showPassword}

                  >

                    <img

                      className={styles.togglePasswordIcon}

                      src={loginAssets.iconEye}

                      alt=""

                      width={18}

                      height={18}

                      aria-hidden="true"

                    />

                  </button>

                </div>

              </div>



              <div className={styles.forgotWrap}>

                <button type="button" className={styles.forgotLink}>

                  {t.login.form.forgotPassword}

                </button>

              </div>



              <div className={styles.submitWrap}>

                <button type="submit" className={styles.submitButton}>

                  {t.login.form.submit}

                </button>

              </div>



              <p className={styles.formDisclaimer}>{t.login.form.disclaimer}</p>

              <p className={styles.signupPrompt}>
                {t.login.form.noAccount}{' '}
                <Link to={ROUTES.signup} className={styles.signupLink}>
                  {t.login.form.createAccount}
                </Link>
              </p>

            </form>

          </div>

        </section>

      </div>

    </main>

  );

}


