import { LOCALE_META, useI18n } from '@i18n';
import styles from './LanguageSwitcher.module.css';

export function LanguageSwitcher() {
  const { locale, toggleLocale, t } = useI18n();
  const switchLabel = LOCALE_META[locale].switchToLabel;

  return (
    <button
      type="button"
      className={styles.switcher}
      onClick={toggleLocale}
      aria-label={t.a11y.switchLanguage}
    >
      <span className={styles.langCode} lang={locale === 'en' ? 'ar' : 'en'}>
        {switchLabel}
      </span>
    </button>
  );
}
