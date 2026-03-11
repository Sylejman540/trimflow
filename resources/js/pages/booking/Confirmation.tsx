import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Scissors, CalendarDays, X, AlertCircle, Calendar, User } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import LanguageSwitcher from '@/components/LanguageSwitcher';

function PoweredBy() {
    return (
        <div className="pt-2 text-center">
            <a href="https://freshio.app" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 text-emerald-500">
                    <path d="M12 2C9.5 6 7 8.5 7 12a5 5 0 0 0 10 0c0-3.5-2.5-6-5-10z"/>
                    <path d="M12 8c-1 2.5-2 4-2 5.5a2 2 0 0 0 4 0C14 12 13 10.5 12 8z" fill="white" opacity="0.5"/>
                </svg>
                Powered by <span className="font-semibold text-slate-500">Freshio</span>
            </a>
        </div>
    );
}

interface Company {
    id: number;
    name: string;
    slug: string;
    phone?: string;
}

function formatApptDate(startsAt: string | null | undefined, lang: string) {
    if (!startsAt) return null;
    const [datePart, timePart] = startsAt.split(' ');
    const [y, m, d] = datePart.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const localeMap: Record<string, string> = {
        sq: 'sq-AL', de: 'de-DE', fr: 'fr-FR', it: 'it-IT',
        el: 'el-GR', hr: 'hr-HR', pl: 'pl-PL', pt: 'pt-PT',
        es: 'es-ES', bg: 'bg-BG', tr: 'tr-TR', ru: 'ru-RU',
    };
    const locale = localeMap[lang] ?? lang;
    const dayLabel = date.toLocaleDateString(locale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    return { day: dayLabel, time: timePart };
}

export default function Confirmation({
    company,
    cancel_token,
    cancel_expires_at,
    appt_starts_at,
    appt_barber_name,
    appt_services,
}: {
    company: Company;
    cancel_token?: string | null;
    cancel_expires_at?: string | null;
    appt_starts_at?: string | null;
    appt_barber_name?: string | null;
    appt_services?: string | null;
}) {
    const { t, i18n } = useTranslation();
    const apptDate = formatApptDate(appt_starts_at, i18n.language);
    const { props } = usePage();
    const cancelled = (props as any).flash?.cancelled ?? false;

    const [secondsLeft, setSecondsLeft] = useState<number>(() => {
        if (!cancel_expires_at) return 0;
        return Math.max(0, Math.floor((new Date(cancel_expires_at).getTime() - Date.now()) / 1000));
    });

    useEffect(() => {
        if (!cancel_token || secondsLeft <= 0) return;
        const timer = setInterval(() => {
            setSecondsLeft(s => {
                if (s <= 1) { clearInterval(timer); return 0; }
                return s - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [cancel_token]);

    const { post, processing } = useForm({ token: cancel_token ?? '' });

    function handleCancel() {
        post(route('booking.cancel', company.slug));
    }

    if (cancelled) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col">
                <Head title={`Cancelled — ${company.name}`} />
                <div className="bg-white border-b border-slate-200">
                    <div className="max-w-2xl mx-auto px-4 py-5 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900">
                                <Scissors className="h-4 w-4 text-white" />
                            </div>
                            <h1 className="text-base font-semibold text-slate-900">{company.name}</h1>
                        </div>
                        <LanguageSwitcher compact />
                    </div>
                </div>
                <div className="flex-1 flex items-center justify-center px-4 py-16">
                    <div className="max-w-sm w-full text-center space-y-6">
                        <div className="flex justify-center">
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 border border-slate-200">
                                <X className="h-10 w-10 text-slate-500" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-semibold text-slate-900">{t('booking.cancelledTitle')}</h2>
                            <p className="text-sm text-slate-500">{t('booking.cancelledDesc')}</p>
                        </div>
                        <Link
                            href={route('booking.show', company.slug)}
                            className={cn(buttonVariants({ variant: 'default' }), 'bg-slate-900 hover:bg-slate-800 h-10 rounded-xl font-semibold shadow-none')}
                        >
                            <CalendarDays className="mr-2 h-4 w-4" /> {t('booking.bookAnother')}
                        </Link>
                        <PoweredBy />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Head title={`Booked at ${company.name}`} />

            {/* Header */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-2xl mx-auto px-4 py-5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900">
                            <Scissors className="h-4 w-4 text-white" />
                        </div>
                        <h1 className="text-base font-semibold text-slate-900">{company.name}</h1>
                    </div>
                    <LanguageSwitcher compact />
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center px-4 py-16">
                <div className="max-w-sm w-full text-center space-y-6">
                    <div className="flex justify-center">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 border border-emerald-100">
                            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-2xl font-semibold text-slate-900">{t('booking.confirmed')}</h2>
                        <p className="text-sm text-slate-500">{t('booking.confirmedDesc')}</p>
                    </div>

                    {apptDate && (
                        <div className="bg-slate-900 rounded-xl p-4 text-left space-y-2 w-full">
                            {appt_services && (
                                <p className="text-sm font-semibold text-white flex items-center gap-2">
                                    <Scissors className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                    {appt_services}
                                </p>
                            )}
                            {appt_barber_name && (
                                <p className="text-xs text-slate-300 flex items-center gap-2">
                                    <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                    {appt_barber_name}
                                </p>
                            )}
                            <p className="text-xs text-slate-300 flex items-center gap-2">
                                <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                <span>{apptDate.day} · <span className="font-bold text-white">{apptDate.time}</span></span>
                            </p>
                        </div>
                    )}

                    {company.phone && (
                        <p className="text-xs text-slate-400">
                            {t('booking.shopPhone')}: <span className="font-medium text-slate-600">{company.phone}</span>
                        </p>
                    )}

                    {/* Self-cancellation window */}
                    {cancel_token && secondsLeft > 0 && (
                        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-left space-y-3">
                            <div className="flex items-start gap-2">
                                <AlertCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                                <p className="text-xs text-amber-700 font-medium">
                                    {t('booking.cancelWindow')} <span className="font-bold">{secondsLeft}s</span>.
                                </p>
                            </div>
                            <button
                                onClick={handleCancel}
                                disabled={processing}
                                className="w-full text-sm font-semibold text-red-600 bg-white border border-red-200 rounded-lg py-2 hover:bg-red-50 transition-colors disabled:opacity-50"
                            >
                                {processing ? t('loading') : t('booking.cancelAppt')}
                            </button>
                        </div>
                    )}

                    <div className="flex flex-col gap-2">
                        <Link
                            href={route('booking.show', company.slug)}
                            className={cn(buttonVariants({ variant: 'default' }), 'bg-slate-900 hover:bg-slate-800 h-10 rounded-xl font-semibold shadow-none')}
                        >
                            <CalendarDays className="mr-2 h-4 w-4" /> {t('booking.bookAnother')}
                        </Link>
                        <Link
                            href={route('portal.show', company.slug)}
                            className={cn(buttonVariants({ variant: 'outline' }), 'h-10 rounded-xl font-semibold shadow-none border-slate-200')}
                        >
                            {t('booking.viewMyAppts')}
                        </Link>
                    </div>
                    <PoweredBy />
                </div>
            </div>
        </div>
    );
}
