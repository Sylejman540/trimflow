import { Head, Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import {
    CalendarDays,
    Clock,
    CheckCircle2,
    AlertTriangle,
    Package,
    Rocket,
    Building2,
    Scissors,
    Users,
    Copy,
    Check,
} from 'lucide-react';
import AppLayout from '@/layouts/AppLayout';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import { useState } from 'react';
import { formatCents, formatTime } from '@/lib/utils';
import { Appointment, AppointmentStatus } from '@/types';

interface Stats {
    today_appointments: number;
    today_pending: number;
    today_revenue: number;
    completion_rate: number;
}

interface Setup {
    shop_info: boolean;
    has_barbers: boolean;
    has_services: boolean;
    booking_link: string;
    all_done: boolean;
}

function statusColor(status: AppointmentStatus) {
    const map: Record<AppointmentStatus, string> = {
        pending:     'bg-orange-500/15 text-orange-700',
        confirmed:   'bg-green-500/15 text-green-700',
        in_progress: 'bg-amber-500/15 text-amber-700',
        completed:   'bg-emerald-500/15 text-emerald-700',
        cancelled:   'bg-red-500/15 text-red-700',
        no_show:     'bg-gray-500/15 text-gray-700',
    };
    return map[status];
}

function ScheduleRow({ appointment }: { appointment: Appointment }) {
    const { t } = useTranslation();
    const statusKey = appointment.status === 'no_show' ? 'noShow'
        : appointment.status === 'in_progress' ? 'inProgress'
        : appointment.status;
    return (
        <Link
            href={route('appointments.show', appointment.id)}
            className="flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-muted/50 active:bg-muted"
        >
            <div className="flex h-10 w-14 flex-col items-center justify-center rounded-md bg-muted/60 text-xs font-medium shrink-0">
                {formatTime(appointment.starts_at)}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{appointment.customer?.name ?? t('dash.walkin')}</p>
                <p className="text-xs text-muted-foreground truncate">
                    {appointment.service?.name}
                    {appointment.barber?.user?.name && ` · ${appointment.barber.user.name}`}
                </p>
            </div>
            <span className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${statusColor(appointment.status)}`}>
                {t(`appt.${statusKey}`)}
            </span>
        </Link>
    );
}

function SetupChecklist({ setup }: { setup: Setup }) {
    const [copied, setCopied] = useState(false);

    function copyLink() {
        navigator.clipboard.writeText(setup.booking_link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    const steps = [
        {
            done: setup.shop_info,
            icon: Building2,
            label: 'Fill in your shop info',
            sub: 'Add your phone number and address',
            href: route('settings.index'),
            linkLabel: 'Go to Settings',
        },
        {
            done: setup.has_barbers,
            icon: Users,
            label: 'Add your barbers',
            sub: 'Set up barber profiles and working hours',
            href: route('barbers.index'),
            linkLabel: 'Add Barbers',
        },
        {
            done: setup.has_services,
            icon: Scissors,
            label: 'Add your services',
            sub: 'Define what you offer with prices and durations',
            href: route('services.index'),
            linkLabel: 'Add Services',
        },
    ];

    const doneCount = steps.filter(s => s.done).length;

    return (
        <Card className="border-slate-200 shadow-none">
            <CardHeader className="px-4 lg:px-6 pt-4 pb-3">
                <div className="flex items-center gap-2">
                    <Rocket className="h-4 w-4 text-slate-400" />
                    <CardTitle className="text-base">Getting Started</CardTitle>
                    <span className="ml-auto text-xs font-semibold text-slate-400">{doneCount}/{steps.length} done</span>
                </div>
                <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-slate-900 rounded-full transition-all duration-500"
                        style={{ width: `${(doneCount / steps.length) * 100}%` }}
                    />
                </div>
            </CardHeader>
            <CardContent className="px-4 lg:px-6 pb-4 space-y-3">
                {steps.map((step, i) => (
                    <div key={i} className="flex items-start gap-3">
                        <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                            step.done ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300 bg-white'
                        }`}>
                            {step.done && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${step.done ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                                {step.label}
                            </p>
                            {!step.done && <p className="text-xs text-slate-400 mt-0.5">{step.sub}</p>}
                        </div>
                        {!step.done && (
                            <Link href={step.href} className="shrink-0 text-xs font-semibold text-slate-900 hover:underline">
                                {step.linkLabel} →
                            </Link>
                        )}
                    </div>
                ))}

                {/* Booking link row */}
                <div className="flex items-start gap-3 pt-1 border-t border-slate-100">
                    <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-emerald-500 bg-emerald-500`}>
                        <Check className="h-3 w-3 text-white" strokeWidth={3} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900">Share your booking link</p>
                        <p className="text-xs text-slate-400 mt-0.5 truncate">{setup.booking_link}</p>
                    </div>
                    <button
                        onClick={copyLink}
                        className="shrink-0 flex items-center gap-1 text-xs font-semibold text-slate-900 hover:underline"
                    >
                        {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                        {copied ? 'Copied!' : 'Copy'}
                    </button>
                </div>
            </CardContent>
        </Card>
    );
}

interface LowStockProduct { id: number; name: string; stock_qty: number; low_stock_threshold: number; }

export default function Dashboard({
    is_barber, stats, today_schedule, upcoming_appointments, low_stock_products = [], setup,
}: {
    is_barber: boolean; stats: Stats;
    today_schedule: Appointment[];
    upcoming_appointments: Appointment[];
    low_stock_products?: LowStockProduct[];
    setup?: Setup | null;
}) {
    const { t } = useTranslation();
    const [lowStockDismissed, setLowStockDismissed] = useState(false);

    return (
        <AppLayout title={t('dashboard')}>
            <Head title={t('dashboard')} />
            <div className="space-y-4 lg:space-y-6">

                {/* Low-stock alert */}
                {!is_barber && !lowStockDismissed && low_stock_products.length > 0 && (
                    <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                        <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-amber-800">{t('dash.lowStockAlert')}</p>
                            <p className="text-xs text-amber-700 mt-0.5">
                                {low_stock_products.map(p => `${p.name} (${p.stock_qty} left)`).join(' · ')}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <Link href={route('products.index')} className="text-xs font-semibold text-amber-700 hover:text-amber-900 flex items-center gap-1">
                                <Package className="h-3.5 w-3.5" /> {t('dash.viewProducts')}
                            </Link>
                            <button onClick={() => setLowStockDismissed(true)} className="text-xs text-amber-400 hover:text-amber-700">✕</button>
                        </div>
                    </div>
                )}

                {/* Getting started checklist */}
                {!is_barber && setup && !setup.all_done && (
                    <SetupChecklist setup={setup} />
                )}

                {/* KPI Cards */}
                <div className="grid grid-cols-2 gap-3 lg:gap-4 lg:grid-cols-3">
                    <Card className="border-slate-200 shadow-none">
                        <CardContent className="p-4 lg:p-6 flex items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shrink-0">
                                <CalendarDays className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">{t('dash.todayAppointments')}</p>
                                <p className="text-2xl font-bold">{stats.today_appointments}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 shadow-none">
                        <CardContent className="p-4 lg:p-6 flex items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600 shrink-0">
                                <Clock className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">{t('dash.pendingConfirmation')}</p>
                                <p className="text-2xl font-bold">{stats.today_pending}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 shadow-none col-span-2 lg:col-span-1">
                        <CardContent className="p-4 lg:p-6 flex items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
                                <CheckCircle2 className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">{t('dash.revenueToday')}</p>
                                <p className="text-2xl font-bold">{formatCents(stats.today_revenue)}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Today's Schedule + Upcoming */}
                <div className="grid gap-4 lg:gap-6 lg:grid-cols-2">
                    <Card className="border-slate-200 shadow-none">
                        <CardHeader className="pb-2 px-4 lg:px-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-base">{t('dash.todaySchedule')}</CardTitle>
                                    <CardDescription>
                                        {today_schedule.length} {today_schedule.length !== 1 ? t('dash.appointmentsPlural') : t('dash.appointments')}
                                    </CardDescription>
                                </div>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </div>
                        </CardHeader>
                        <CardContent className="pt-0 px-2 lg:px-4">
                            <div className="max-h-72 overflow-y-auto space-y-0.5">
                                {today_schedule.length > 0 ? today_schedule.map(a => <ScheduleRow key={a.id} appointment={a} />) : (
                                    <p className="py-8 text-center text-sm text-muted-foreground">{t('dash.noToday')}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 shadow-none">
                        <CardHeader className="pb-2 px-4 lg:px-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-base">{t('dash.upcoming')}</CardTitle>
                                    <CardDescription>{t('dash.nextScheduled')}</CardDescription>
                                </div>
                                <Link href={route('appointments.index')} className="text-xs font-medium text-primary hover:underline">
                                    {t('dash.viewAll')}
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-0 px-2 lg:px-4">
                            <div className="max-h-72 overflow-y-auto space-y-0.5">
                                {upcoming_appointments.length > 0 ? upcoming_appointments.map(a => <ScheduleRow key={a.id} appointment={a} />) : (
                                    <p className="py-8 text-center text-sm text-muted-foreground">{t('dash.noUpcoming')}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
