import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslations from './i18n/en.json';
import hiTranslations from './i18n/hi.json';
import mrTranslations from './i18n/mr.json';
import taTranslations from './i18n/ta.json';
import teTranslations from './i18n/te.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslations },
      hi: { translation: hiTranslations },
      mr: { translation: mrTranslations },
      ta: { translation: taTranslations },
      te: { translation: teTranslations }
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already does escaping
    },
  });

export default i18n;
