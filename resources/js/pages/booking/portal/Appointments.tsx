import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Scissors, CalendarDays, CheckCircle2, XCircle, Clock, X } from 'lucide-react';
import LanguageSwitcher from '@/components/LanguageSwitcher';
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

interface Company { id: number; name: string; slug: string; phone?: string; address?: string; city?: string; }
interface Customer { name: string; phone: string; }
interface Appt {
    id: number;
    starts_at: string;
    ends_at: string;
    status: string;
    price: number;
    barber: string;
    service: string;
}

const statusStyle: Record<string, string> = {
    pending:     'bg-orange-50 text-orange-700 border-orange-100',
    confirmed:   'bg-blue-50 text-blue-700 border-blue-100',
    in_progress: 'bg-amber-50 text-amber-700 border-amber-100',
    completed:   'bg-green-50 text-green-700 border-green-100',
    cancelled:   'bg-slate-50 text-slate-500 border-slate-100',
    no_show:     'bg-slate-50 text-slate-400 border-slate-100',
};

function AppointmentCard({ appt, phone, slug, cancellable }: { appt: Appt; phone: string; slug: string; cancellable: boolean }) {
    const [cancelling, setCancelling] = useState(false);

    function handleCancel() {
        if (!confirm('Cancel this appointment?')) return;
        setCancelling(true);
        router.post(route('portal.cancel', slug), { appointment_id: appt.id, phone }, {
            onFinish: () => setCancelling(false),
        });
    }

    return (
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="font-semibold text-slate-900 text-sm">{appt.service}</p>
                    <p className="text-xs text-slate-400 mt-0.5">with {appt.barber}</p>
                </div>
                <span className={cn("inline-flex items-center text-[10px] font-bold tracking-wider border rounded-md px-2 py-0.5", statusStyle[appt.status] ?? 'bg-slate-50 text-slate-500 border-slate-100')}>
                    {appt.status.replace('_', ' ')}
                </span>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {formatDateTime(appt.starts_at)}
                </span>
                <span className="font-medium text-slate-700">{formatCents(appt.price)}</span>
            </div>

            {cancellable && (
                <button
                    onClick={handleCancel}
                    disabled={cancelling}
                    className="w-full text-xs font-semibold text-red-600 border border-red-200 bg-white hover:bg-red-50 rounded-lg py-1.5 transition-colors disabled:opacity-50"
                >
                    {cancelling ? 'Cancelling…' : 'Cancel appointment'}
                </button>
            )}
        </div>
    );
}

export default function PortalAppointments({
    company,
    customer,
    upcoming,
    past,
}: {
    company: Company;
    customer: Customer;
    upcoming: Appt[];
    past: Appt[];
}) {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Head title={`My Appointments — ${company.name}`} />

            <div className="bg-white border-b border-slate-200">
                <div className="max-w-2xl mx-auto px-4 py-5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900">
                            <Scissors className="h-4 w-4 text-white" />
                        </div>
                        <div>
                            <h1 className="text-base font-semibold text-slate-900">{company.name}</h1>
                            <div className="text-xs text-slate-500 space-y-0.5">
                                {company.phone && <p>{company.phone}</p>}
                                {company.address && company.city && <p>{company.address}, {company.city}</p>}
                            </div>
                            <p className="text-xs text-slate-400 mt-1.5">{customer.name}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <a href={route('booking.show', company.slug)} className="text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors">
                            Book again
                        </a>
                        <LanguageSwitcher compact />
                    </div>
                </div>
            </div>

            <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-8 space-y-8">

                {/* Upcoming */}
                <section className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-slate-400" />
                        <h2 className="text-sm font-bold text-slate-700">Upcoming</h2>
                        <span className="text-xs text-slate-400">({upcoming.length})</span>
                    </div>
                    {upcoming.length === 0 ? (
                        <p className="text-sm text-slate-400 py-4 text-center">No upcoming appointments.</p>
                    ) : (
                        upcoming.map(a => (
                            <AppointmentCard
                                key={a.id}
                                appt={a}
                                phone={customer.phone}
                                slug={company.slug}
                                cancellable={a.status === 'confirmed' || a.status === 'pending'}
                            />
                        ))
                    )}
                </section>

                {/* Past */}
                {past.length > 0 && (
                    <section className="space-y-3">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-slate-400" />
                            <h2 className="text-sm font-bold text-slate-700">Past Appointments</h2>
                        </div>
                        {past.map(a => (
                            <AppointmentCard
                                key={a.id}
                                appt={a}
                                phone={customer.phone}
                                slug={company.slug}
                                cancellable={false}
                            />
                        ))}
                    </section>
                )}

                <PoweredBy />
            </div>
        </div>
    );
}
