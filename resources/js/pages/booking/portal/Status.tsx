import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { Scissors, CalendarDays, Clock } from 'lucide-react';
import { formatCents, formatDateTime, cn } from '@/lib/utils';

function PoweredBy() {
    return (
        <div className="py-6 text-center">
            <a href="https://fade.app" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors">
                <svg width="14" height="14" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 2 L34 18 L18 34 L2 18 Z" fill="#2563EB" />
                    <text x="18" y="24" textAnchor="middle" fontFamily="sans-serif" fontSize="20" fontWeight="900" fill="#ffffff">F</text>
                </svg>
                Powered by <span className="font-semibold text-slate-500">Fade</span>
            </a>
        </div>
    );
}

interface Company {
    id: number;
    name: string;
    slug: string;
    logo?: string | null;
}

interface Appointment {
    status: string;
    starts_at: string;
    barber: string;
    services: string;
    price: number;
}

const statusStyle: Record<string, string> = {
    pending:     'bg-orange-50 text-orange-700 border-orange-100',
    confirmed:   'bg-blue-50 text-blue-700 border-blue-100',
    in_progress: 'bg-amber-50 text-amber-700 border-amber-100',
    completed:   'bg-green-50 text-green-700 border-green-100',
    cancelled:   'bg-slate-50 text-slate-500 border-slate-100',
    no_show:     'bg-slate-50 text-slate-400 border-slate-100',
};

const statusMessages: Record<string, { title: string; key: string }> = {
    pending:     { title: 'booking.statusPending', key: 'booking.statusPendingDesc' },
    confirmed:   { title: 'booking.statusConfirmed', key: 'booking.statusConfirmedDesc' },
    in_progress: { title: 'booking.statusInProgress', key: 'booking.statusInProgressDesc' },
    completed:   { title: 'booking.statusCompleted', key: 'booking.statusCompletedDesc' },
    cancelled:   { title: 'booking.statusCancelled', key: 'booking.statusCancelledDesc' },
    no_show:     { title: 'booking.statusNoShow', key: 'booking.statusNoShowDesc' },
};

export default function Status({
    company,
    appointment,
}: {
    company: Company;
    appointment: Appointment;
}) {
    const { t } = useTranslation();

    const statusMsg = statusMessages[appointment.status] || statusMessages.pending;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Head title={`Booking Status — ${company.name}`} />

            {/* Header */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-2xl mx-auto px-4 py-5 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 border border-slate-200 shrink-0 overflow-hidden">
                        {company.logo
                            ? <img src={company.logo} alt={company.name} className="h-full w-full object-cover" />
                            : <Scissors className="h-4 w-4 text-slate-500" />
                        }
                    </div>
                    <h1 className="text-base font-semibold text-slate-900">{company.name}</h1>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex items-center justify-center px-4 py-8">
                <div className="max-w-sm w-full space-y-6">
                    {/* Status Badge */}
                    <div className="text-center">
                        <span className={cn("inline-flex items-center text-sm font-bold tracking-wider border rounded-lg px-3 py-1.5 mb-4", statusStyle[appointment.status] ?? 'bg-slate-50 text-slate-500 border-slate-100')}>
                            {appointment.status.replace('_', ' ').toUpperCase()}
                        </span>
                        <h2 className="text-2xl font-semibold text-slate-900">{t(statusMsg.title)}</h2>
                        <p className="text-sm text-slate-500 mt-1">{t(statusMsg.key)}</p>
                    </div>

                    {/* Appointment Card */}
                    <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
                        <div className="border-b border-slate-100 pb-4">
                            <p className="font-semibold text-slate-900 text-sm">{appointment.services}</p>
                            <p className="text-xs text-slate-400 mt-1">with {appointment.barber}</p>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <CalendarDays className="h-4 w-4 text-slate-400 shrink-0" />
                                <span>{formatDateTime(appointment.starts_at)}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-600">Total price</span>
                                <span className="font-semibold text-slate-900">{formatCents(appointment.price)}</span>
                            </div>
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="flex flex-col gap-3">
                        <a
                            href={route('booking.show', company.slug)}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm py-2.5 rounded-xl transition-colors text-center"
                        >
                            {t('booking.bookAnother')}
                        </a>
                        <a
                            href={route('portal.show', company.slug)}
                            className="w-full text-slate-600 hover:text-slate-900 font-medium text-sm py-2.5 text-center border border-slate-200 rounded-xl transition-colors"
                        >
                            {t('booking.viewMyAppts')}
                        </a>
                    </div>

                    <PoweredBy />
                </div>
            </div>
        </div>
    );
}
