/* i18next (initialized in @/i18n) is the source of truth for the active locale —
   i18n.language is the synchronous read, changeLanguage() the setter, and
   react-i18next already re-renders every useTranslation() consumer on change.
   this module only adds what i18next doesn't provide: device-locale detection
   and persisting the user's choice, mirroring loadCountry()'s shape in @/lib/somes */
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';

import i18n from '@/i18n';

export type Locale = 'de-AT' | 'en-GB';

const LOCALE_KEY = 'somes.locale';

function isLocale(value: string | null): value is Locale {
  return value === 'de-AT' || value === 'en-GB';
}

/** de* -> de-AT, everything else (including en*) -> en-GB, the app's two
    supported variants plus the agreed-on fallback for unmatched locales */
function detectDeviceLocale(): Locale {
  const languageCode = Localization.getLocales()[0]?.languageCode;
  return languageCode === 'de' ? 'de-AT' : 'en-GB';
}

/** reads the persisted locale, falling back to the device locale on first
    launch, call once alongside loadToken/loadCountry */
export async function loadLocale(): Promise<Locale> {
  try {
    const stored = await AsyncStorage.getItem(LOCALE_KEY);
    const next = isLocale(stored) ? stored : detectDeviceLocale();
    if (next !== i18n.language) await i18n.changeLanguage(next);
    return next;
  } catch (error) {
    console.warn(`Could not read the stored locale: ${error}`);
    return getLocale();
  }
}

/** synchronous read, 'en-GB' (i18next's configured default) until loadLocale resolves */
export function getLocale(): Locale {
  return isLocale(i18n.language) ? i18n.language : 'en-GB';
}

export async function setLocale(next: Locale): Promise<void> {
  if (next === i18n.language) return;
  await i18n.changeLanguage(next);
  try {
    await AsyncStorage.setItem(LOCALE_KEY, next);
  } catch (error) {
    console.warn(`Could not persist the locale: ${error}`);
  }
}
