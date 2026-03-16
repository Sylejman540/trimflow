import enLocale from './en';
import deLocale from './de';
import sqLocale from './sq';

export function getDaysAndMonths(lang: string) {
    const locales: Record<string, any> = {
        en: enLocale,
        de: deLocale,
        sq: sqLocale,
    };

    const locale = locales[lang] || enLocale;

    const dayNames = [
        locale.days.sunday,
        locale.days.monday,
        locale.days.tuesday,
        locale.days.wednesday,
        locale.days.thursday,
        locale.days.friday,
        locale.days.saturday,
    ];

    const monthNames = [
        locale.months.january,
        locale.months.february,
        locale.months.march,
        locale.months.april,
        locale.months.may,
        locale.months.june,
        locale.months.july,
        locale.months.august,
        locale.months.september,
        locale.months.october,
        locale.months.november,
        locale.months.december,
    ];

    return { days: dayNames, months: monthNames };
}
