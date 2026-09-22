/* import '@/test/i18n' (side effect) in any test that renders a component using
   useTranslation() — it initializes the same shared i18next instance the app
   uses (via @/i18n) and resets it to en-GB before each test, so tests don't
   depend on locale state leaking in from a previous test file */
import i18n from '@/i18n';

beforeEach(async () => {
  await i18n.changeLanguage('en-GB');
});
