import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';

import i18n from '@/i18n';
import { getLocale, loadLocale, setLocale } from '@/lib/locale';

jest.mock('expo-localization', () => ({
  __esModule: true,
  getLocales: jest.fn(),
}));

function mockDeviceLanguage(languageCode: string | null) {
  (Localization.getLocales as jest.Mock).mockReturnValue([{ languageCode }]);
}

beforeEach(async () => {
  await AsyncStorage.clear();
  await i18n.changeLanguage('en-GB');
});

describe('loadLocale', () => {
  it('detects a German device locale as de-AT', async () => {
    mockDeviceLanguage('de');
    expect(await loadLocale()).toBe('de-AT');
    expect(getLocale()).toBe('de-AT');
  });

  it('detects an English device locale as en-GB', async () => {
    mockDeviceLanguage('en');
    expect(await loadLocale()).toBe('en-GB');
  });

  it('falls back to en-GB for an unsupported device locale', async () => {
    mockDeviceLanguage('fr');
    expect(await loadLocale()).toBe('en-GB');
  });

  it('prefers a persisted choice over the device locale', async () => {
    mockDeviceLanguage('de');
    await AsyncStorage.setItem('somes.locale', 'en-GB');
    expect(await loadLocale()).toBe('en-GB');
  });
});

describe('setLocale', () => {
  it('updates i18next and persists the choice', async () => {
    mockDeviceLanguage('en');
    await setLocale('de-AT');

    expect(getLocale()).toBe('de-AT');
    expect(await AsyncStorage.getItem('somes.locale')).toBe('de-AT');
  });
});
