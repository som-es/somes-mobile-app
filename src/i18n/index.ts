/* side-effect import: initializes the shared i18next instance used app-wide.
   import this once, at the top of the root layout, before anything reads i18n.language */
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import { NAMESPACES, resources } from './resources';

i18next.use(initReactI18next).init({
  resources,
  supportedLngs: ['de-AT', 'en-GB'],
  fallbackLng: 'en-GB',
  lng: 'en-GB',
  ns: NAMESPACES,
  defaultNS: 'common',
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

export default i18next;
