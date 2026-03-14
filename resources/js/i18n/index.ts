import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en';
import sq from './locales/sq';
import de from './locales/de';
export const LANGUAGES = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'sq', label: 'Shqip',   flag: '🇦🇱' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
] as const;

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },
            sq: { translation: sq },
            de: { translation: de },
        },
        fallbackLng: 'en',
        supportedLngs: ['en', 'sq', 'de'],
        interpolation: { escapeValue: false },
        initImmediate: false,
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
            lookupLocalStorage: 'freshio_lang',
        },
    });

export default i18n;
