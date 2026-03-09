import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en';
import sq from './locales/sq';
import de from './locales/de';
import fr from './locales/fr';
import it from './locales/it';
import el from './locales/el';
import sr from './locales/sr';

export const LANGUAGES = [
    { code: 'en', label: 'English',    flag: '🇬🇧' },
    { code: 'sq', label: 'Shqip',      flag: '🇦🇱' },
    { code: 'de', label: 'Deutsch',    flag: '🇩🇪' },
    { code: 'fr', label: 'Français',   flag: '🇫🇷' },
    { code: 'it', label: 'Italiano',   flag: '🇮🇹' },
    { code: 'el', label: 'Ελληνικά',   flag: '🇬🇷' },
    { code: 'sr', label: 'Srpski',     flag: '🇷🇸' },
] as const;

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },
            sq: { translation: sq },
            de: { translation: de },
            fr: { translation: fr },
            it: { translation: it },
            el: { translation: el },
            sr: { translation: sr },
        },
        fallbackLng: 'en',
        supportedLngs: ['en', 'sq', 'de', 'fr', 'it', 'el', 'sr'],
        interpolation: { escapeValue: false },
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
            lookupLocalStorage: 'trimflow_lang',
        },
    });

export default i18n;
