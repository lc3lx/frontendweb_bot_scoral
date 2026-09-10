import { en, type TranslationKey } from './locales/en';
import { ar } from './locales/ar';
import { applyBrokerName, namesASpecificBroker } from './brokerName';
import { getLocale } from './localeStore';
import type { Locale, TranslateFn, TranslateParams } from './types';

const dictionaries: Record<Locale, Record<TranslationKey, string>> = {
  en,
  ar,
};

function interpolate(
  template: string,
  params?: TranslateParams,
  key?: string,
): string {
  // The broker's name is resolved for every string, with or without params: copy naming
  // a broker means the user's own venue, and a Quotex user must never read Binolla. The
  // exception is a key that names a specific venue on purpose — the platform picker.
  const text = key && namesASpecificBroker(key) ? template : applyBrokerName(template);
  if (!params) return text;
  return text.replace(/\{(\w+)\}/g, (match, key: string) => {
    const value = params[key];
    return value === undefined || value === null ? match : String(value);
  });
}

export function t(key: TranslationKey | string, params?: TranslateParams): string {
  const locale = getLocale();
  const dict = dictionaries[locale] ?? dictionaries.en;
  const fallback = dictionaries.en;
  const template =
    (dict as Record<string, string>)[key] ??
    (fallback as Record<string, string>)[key] ??
    key;
  return interpolate(template, params, String(key));
}

export function createTranslator(locale: Locale): TranslateFn {
  return (key, params) => {
    const dict = dictionaries[locale] ?? dictionaries.en;
    const fallback = dictionaries.en;
    const template =
      (dict as Record<string, string>)[key] ??
      (fallback as Record<string, string>)[key] ??
      key;
    return interpolate(template, params, String(key));
  };
}

export type { TranslationKey };
