import { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { scarAlphaLogo } from '@assets';

import { useI18n } from '@i18n';

import { ROUTES } from '@router/routes';

import { cn } from '@utils/cn';

import styles from './SplashPage.module.css';



const HOLD_MS = 2600;

const EXIT_MS = 780;



/**

 * Figma frame "1" (574:1026) — full-viewport brand splash with glow, then navigate to login.

 */

export function SplashPage() {

  const { t } = useI18n();

  const navigate = useNavigate();

  const [phase, setPhase] = useState<'play' | 'exit'>('play');



  useEffect(() => {

    document.title = t.seo.title;

    const meta = document.querySelector('meta[name="description"]');

    if (meta) meta.setAttribute('content', t.seo.description);

  }, [t.seo.description, t.seo.title]);



  useEffect(() => {

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const hold = reduced ? 180 : HOLD_MS;

    const exit = reduced ? 120 : EXIT_MS;



    const exitTimer = window.setTimeout(() => setPhase('exit'), hold);

    const navigateTimer = window.setTimeout(() => {

      navigate(ROUTES.login, { replace: true });

    }, hold + exit);



    return () => {

      window.clearTimeout(exitTimer);

      window.clearTimeout(navigateTimer);

    };

  }, [navigate]);



  return (

    <main

      className={cn(styles.page, phase === 'exit' && styles.pageExiting)}

      data-figma-node="574:1026"

      role="status"

      aria-live="polite"

      aria-label={t.a11y.splashLoading}

    >

      <div className={styles.vignette} aria-hidden="true" />



      <div className={styles.backdrop} aria-hidden="true">

        <div className={styles.ellipseGlow} />

      </div>



      <div className={styles.stage}>

        <div className={styles.logoGlow} aria-hidden="true" />

        <img

          className={styles.logo}

          src={scarAlphaLogo}

          alt={t.brand.logoAlt}

          width={374}

          height={300}

          decoding="async"

        />

      </div>

    </main>

  );

}


