/* react binding over the active i18next language, shaped like useCountry()/
   useSwitchCountry() in @/lib/use-country for call-site parity (e.g. LanguageSheet
   next to CountrySheet), even though the actual state lives in i18next itself */
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { setLocale, type Locale } from '@/lib/locale';

export function useLocale(): Locale {
  const { i18n } = useTranslation();
  return i18n.language as Locale;
}

/** unlike useSwitchCountry, this never needs to reset react-query's cache —
    no cached query data is locale-dependent, only rendered text, and
    react-i18next already re-renders every useTranslation() consumer on change */
export function useSwitchLocale(): (locale: Locale) => Promise<void> {
  return useCallback((locale: Locale) => setLocale(locale), []);
}
