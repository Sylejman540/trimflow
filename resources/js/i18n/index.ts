import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en';
import sq from './locales/sq';
import de from './locales/de';
import fr from './locales/fr';
import it from './locales/it';
import el from './locales/el';
import hr from './locales/hr';
import pl from './locales/pl';
import pt from './locales/pt';
import es from './locales/es';
import bg from './locales/bg';
import tr from './locales/tr';
import ru from './locales/ru';
import sr from './locales/sr';

export const LANGUAGES = [
    { code: 'en', label: 'English',    flag: '🇬🇧' },
    { code: 'sq', label: 'Shqip',      flag: '🇦🇱' },
    { code: 'de', label: 'Deutsch',    flag: '🇩🇪' },
    { code: 'fr', label: 'Français',   flag: '🇫🇷' },
    { code: 'it', label: 'Italiano',   flag: '🇮🇹' },
    { code: 'el', label: 'Ελληνικά',   flag: '🇬🇷' },
    { code: 'hr', label: 'Hrvatski',   flag: '🇭🇷' },
    { code: 'pl', label: 'Polski',     flag: '🇵🇱' },
    { code: 'pt', label: 'Português',  flag: '🇵🇹' },
    { code: 'es', label: 'Español',    flag: '🇪🇸' },
    { code: 'bg', label: 'Български',  flag: '🇧🇬' },
    { code: 'tr', label: 'Türkçe',     flag: '🇹🇷' },
    { code: 'ru', label: 'Русский',    flag: '🇷🇺' },
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
            hr: { translation: hr },
            pl: { translation: pl },
            pt: { translation: pt },
            es: { translation: es },
            bg: { translation: bg },
            tr: { translation: tr },
            ru: { translation: ru },
            sr: { translation: sr },
        },
        fallbackLng: 'en',
        supportedLngs: ['en', 'sq', 'de', 'fr', 'it', 'el', 'hr', 'pl', 'pt', 'es', 'bg', 'tr', 'ru', 'sr'],
        interpolation: { escapeValue: false },
        initImmediate: false,
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
            lookupLocalStorage: 'trimflow_lang',
        },
    });

export default i18n;
