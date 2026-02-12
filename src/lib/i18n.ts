import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

/**
 * Supported languages configuration
 * - en: English (LTR)
 * - ar: Arabic (RTL)
 * - ur: Urdu (RTL)
 */
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', direction: 'ltr' as const },
  { code: 'ar', name: 'العربية', direction: 'rtl' as const },
  { code: 'ur', name: 'اردو', direction: 'rtl' as const },
] as const;

export const RTL_LANGUAGES = ['ar', 'ur', 'he', 'fa'];

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]['code'];

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'ar', 'ur'],
    interpolation: {
      escapeValue: false,
    },
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
    react: {
      useSuspense: false,
    },
  });

// Update document direction when language changes
i18n.on('languageChanged', (lng: string) => {
  if (typeof document !== 'undefined') {
    const isRTL = RTL_LANGUAGES.includes(lng);
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = lng;
  }
});

export default i18n;
