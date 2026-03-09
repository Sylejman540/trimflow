import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn, formatCents, formatDateTime } from '@/lib/utils';
import { Appointment, Customer } from '@/types';
import { Edit, Phone, Mail, MapPin, Star, CalendarDays, CheckCircle2, AlignLeft } from 'lucide-react';

const tierStyle: Record<string, string> = {
    bronze:   'bg-orange-50 text-orange-700 border-orange-100',
    silver:   'bg-slate-50 text-slate-600 border-slate-200',
    gold:     'bg-amber-50 text-amber-700 border-amber-100',
    platinum: 'bg-blue-50 text-blue-700 border-blue-100',
};

const statusStyle: Record<string, string> = {
    pending:     'bg-orange-50 text-orange-700 border-orange-100',
    confirmed:   'bg-emerald-50 text-emerald-700 border-emerald-100',
    in_progress: 'bg-amber-50 text-amber-700 border-amber-100',
    completed:   'bg-green-50 text-green-700 border-green-100',
    cancelled:   'bg-red-50 text-red-600 border-red-100',
    no_show:     'bg-slate-50 text-slate-600 border-slate-100',
};

export default function Show({
    customer,
    appointments,
}: {
    customer: Customer & { loyalty_tier?: string; visit_count?: number };
    appointments: Appointment[];
}) {
    const upcoming = appointments.filter(a => !['completed', 'cancelled', 'no_show'].includes(a.status));
    const past = appointments.filter(a => ['completed', 'cancelled', 'no_show'].includes(a.status));

    return (
        <AppLayout
            title={customer.name}
            actions={
                <Link href={route('customers.edit', customer.id)} className={cn(buttonVariants({ variant: 'outline' }), 'h-9 px-3 rounded-lg text-xs font-bold border-slate-200 shadow-none')}>
                    <Edit className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline ml-2">Edit</span>
                </Link>
            }
        >
            <Head title={customer.name} />

            <div className="space-y-6 max-w-3xl">
                {/* Profile card */}
                <div className="bg-white border border-slate-200 rounded-xl p-6">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 text-xl font-bold shrink-0">
                                {customer.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">{customer.name}</h2>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                    {customer.loyalty_tier && (
                                        <Badge className={cn('text-[10px] font-bold tracking-wider rounded-md px-2 py-0.5 shadow-none border capitalize', tierStyle[customer.loyalty_tier] ?? '')}>
                                            {customer.loyalty_tier}
                                        </Badge>
                                    )}
                                    <span className="text-xs text-slate-400">{customer.loyalty_points ?? 0} pts</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right shrink-0">
                            <p className="text-2xl font-bold text-slate-900">{customer.visit_count ?? 0}</p>
                            <p className="text-xs text-slate-400">total visits</p>
                        </div>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        {customer.phone && (
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                {customer.phone}
                            </div>
                        )}
                        {customer.email && (
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                {customer.email}
                            </div>
                        )}
                        {customer.address && (
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                {customer.address}
                            </div>
                        )}
                        {customer.favorite_barber && (
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Star className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                Prefers {customer.favorite_barber.user?.name}
                            </div>
                        )}
                        {customer.notes && (
                            <div className="flex items-start gap-2 text-sm text-slate-600 sm:col-span-2">
                                <AlignLeft className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                                <span>{customer.notes}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Upcoming appointments */}
                {upcoming.length > 0 && (
                    <section className="space-y-3">
                        <div className="flex items-center gap-2">
                            <CalendarDays className="h-4 w-4 text-slate-400" />
                            <h3 className="text-sm font-bold text-slate-700">Upcoming ({upcoming.length})</h3>
                        </div>
                        {upcoming.map(a => (
                            <AppointmentRow key={a.id} appt={a} />
                        ))}
                    </section>
                )}

                {/* Past appointments */}
                {past.length > 0 && (
                    <section className="space-y-3">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-slate-400" />
                            <h3 className="text-sm font-bold text-slate-700">Past Appointments ({past.length})</h3>
                        </div>
                        {past.map(a => (
                            <AppointmentRow key={a.id} appt={a} />
                        ))}
                    </section>
                )}

                {appointments.length === 0 && (
                    <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
                        <p className="text-sm text-slate-400">No appointments yet.</p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

function AppointmentRow({ appt }: { appt: Appointment }) {
    return (
        <Link
            href={route('appointments.show', appt.id)}
            className="block bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition-colors"
        >
            <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                    <p className="font-semibold text-slate-900 text-sm truncate">{appt.service?.name ?? '—'}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                        {appt.barber?.user?.name ? `with ${appt.barber.user.name} · ` : ''}{formatDateTime(appt.starts_at)}
                    </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-semibold text-slate-900">{formatCents(appt.price)}</span>
                    <Badge className={cn('text-[10px] font-bold tracking-wider rounded-md px-2 py-0.5 shadow-none border', statusStyle[appt.status] ?? 'bg-slate-50 text-slate-500 border-slate-100')}>
                        {appt.status.replace('_', ' ')}
                    </Badge>
                </div>
            </div>
        </Link>
    );
}
