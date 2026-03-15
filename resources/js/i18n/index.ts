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
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },
            sq: { translation: sq },
            de: { translation: de },
        },
        lng: 'en',
        fallbackLng: 'en',
        supportedLngs: ['en', 'sq', 'de'],
        interpolation: { escapeValue: false },
        initImmediate: false,
    });

// Initialize language preference - user-specific or guest
export function initializeUserLanguage(userId?: number) {
    const userLangKey = userId ? `freshio_lang_${userId}` : 'freshio_lang_guest';
    const savedLang = localStorage.getItem(userLangKey);
    if (savedLang && LANGUAGES.some(l => l.code === savedLang)) {
        i18n.changeLanguage(savedLang);
    }
}

export default i18n;
