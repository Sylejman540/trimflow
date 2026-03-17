import { Head, Link, router } from '@inertiajs/react';
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
    Store,
    User,
    Trophy,
    TrendingUp,
    Settings,
    Eye,
    EyeOff,
    CheckSquare,
    Calendar,
} from 'lucide-react';

import AppLayout from '@/layouts/AppLayout';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { formatCents, formatTime } from '@/lib/utils';
import { Appointment, AppointmentStatus } from '@/types';

interface Stats {
    today_appointments: number;
    today_pending: number;
    today_revenue: number;
    completion_rate: number;
}

interface Insights {
    top_barber:       { name: string; count: number } | null;
    top_service:      { name: string; count: number } | null;
    repeat_customers: number;
    no_show_rate:     number;
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
            className="flex items-center gap-3 rounded-xl px-2 py-3 transition-colors hover:bg-muted/50 active:bg-muted/80 min-h-[52px]"
        >
            <div className="flex h-11 w-14 flex-col items-center justify-center rounded-lg bg-slate-100 text-xs font-bold shrink-0 text-slate-700">
                {formatTime(appointment.starts_at)}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{appointment.customer?.name ?? t('dash.walkin')}</p>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {appointment.service?.name}
                    {appointment.barber?.user?.name && ` · ${appointment.barber.user.name}`}
                </p>
            </div>
            <span className={`shrink-0 inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusColor(appointment.status)}`}>
                {t(`appt.${statusKey}`)}
            </span>
        </Link>
    );
}

function SetupChecklist({ setup }: { setup: Setup }) {
    const { t } = useTranslation();
    const [copied, setCopied] = useState(false);

    function copyLink() {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(setup.booking_link).catch(() => fallbackCopy(setup.booking_link));
        } else {
            fallbackCopy(setup.booking_link);
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    function fallbackCopy(text: string) {
        const el = document.createElement('textarea');
        el.value = text;
        el.style.position = 'fixed';
        el.style.opacity = '0';
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
    }

    const steps = [
        {
            done: setup.shop_info,
            icon: Building2,
            label: t('setup.shopInfoLabel'),
            sub: t('setup.shopInfoSub'),
            href: route('settings.index') + '?tab=shop',
            linkLabel: t('setup.shopInfoLink'),
        },
        {
            done: setup.has_barbers,
            icon: Users,
            label: t('setup.barbersLabel'),
            sub: t('setup.barbersSub'),
            href: route('barbers.index'),
            linkLabel: t('setup.barbersLink'),
        },
        {
            done: setup.has_services,
            icon: Scissors,
            label: t('setup.servicesLabel'),
            sub: t('setup.servicesSub'),
            href: route('services.index'),
            linkLabel: t('setup.servicesLink'),
        },
    ];

    const doneCount = steps.filter(s => s.done).length;

    return (
        <Card className="border-slate-200 shadow-none">
            <CardHeader className="px-4 lg:px-6 pt-4 pb-3">
                <div className="flex items-center gap-2">
                    <Rocket className="h-4 w-4 text-slate-400" />
                    <CardTitle className="text-base">{t('setup.title')}</CardTitle>
                    <span className="ml-auto text-xs font-semibold text-slate-400">{doneCount}/{steps.length} {t('setup.done')}</span>
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
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-emerald-500 bg-emerald-500">
                        <Check className="h-3 w-3 text-white" strokeWidth={3} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900">{t('setup.shareLink')}</p>
                        <p className="text-xs text-slate-400 mt-0.5 truncate">{setup.booking_link}</p>
                    </div>
                    <button
                        onClick={copyLink}
                        className="shrink-0 flex items-center gap-1 text-xs font-semibold text-slate-900 hover:underline"
                    >
                        {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                        {copied ? t('setup.copied') : t('setup.copy')}
                    </button>
                </div>
            </CardContent>
        </Card>
    );
}


interface LowStockProduct { id: number; name: string; stock_qty: number; low_stock_threshold: number; }

export default function Dashboard({
    is_barber, is_owner_barber = false,
    stats, today_schedule, upcoming_appointments,
    my_stats, my_today_schedule, my_upcoming,
    low_stock_products = [], setup, insights,
}: {
    is_barber: boolean;
    is_owner_barber?: boolean;
    stats: Stats;
    today_schedule: Appointment[];
    upcoming_appointments: Appointment[];
    my_stats?: Stats | null;
    my_today_schedule?: Appointment[] | null;
    my_upcoming?: Appointment[] | null;
    low_stock_products?: LowStockProduct[];
    setup?: Setup | null;
    insights?: Insights | null;
}) {
    const { t } = useTranslation();
    const [lowStockDismissed, setLowStockDismissed] = useState(false);
    const [viewMine, setViewMine] = useState(is_owner_barber);
    const [customizeOpen, setCustomizeOpen] = useState(false);
    const [visibleCards, setVisibleCards] = useState<Set<string>>(() => {
        if (typeof window === 'undefined') return new Set(['kpi', 'insights', 'schedule', 'upcoming']);
        const saved = localStorage.getItem('dashboard-visible-cards');
        return new Set(saved ? JSON.parse(saved) : ['kpi', 'insights', 'schedule', 'upcoming']);
    });
    const [confirmingAll, setConfirmingAll] = useState(false);

    useEffect(() => {
        localStorage.setItem('dashboard-visible-cards', JSON.stringify(Array.from(visibleCards)));
    }, [visibleCards]);

    function confirmAllPending() {
        if (activeStats.today_pending === 0) return;
        setConfirmingAll(true);
        const pendingIds = activeSchedule
            .filter(a => a.status === 'pending')
            .map(a => a.id);

        if (pendingIds.length > 0) {
            router.post(route('appointments.bulk'),
                { action: 'confirm', ids: pendingIds },
                { onFinish: () => setConfirmingAll(false) }
            );
        }
    }

    function toggleCard(cardId: string) {
        setVisibleCards(prev => {
            const next = new Set(prev);
            if (next.has(cardId)) {
                next.delete(cardId);
            } else {
                next.add(cardId);
            }
            return next;
        });
    }

    const activeStats        = (is_owner_barber && viewMine && my_stats)          ? my_stats          : stats;
    const activeSchedule     = (is_owner_barber && viewMine && my_today_schedule) ? my_today_schedule : today_schedule;
    const activeUpcoming     = (is_owner_barber && viewMine && my_upcoming)       ? my_upcoming       : upcoming_appointments;

    return (
        <AppLayout title={t('dashboard')}>
            <Head title={t('dashboard')} />
            <div className="space-y-4 lg:space-y-6">
                {/* Quick Actions + Customize */}
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    {/* Quick Action Buttons */}
                    <div className="flex items-center gap-2">
                        {activeStats.today_pending > 0 && (
                            <Button
                                onClick={confirmAllPending}
                                disabled={confirmingAll}
                                className="flex items-center gap-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-xs font-semibold h-9 px-3 shadow-none"
                            >
                                <CheckSquare className="h-3.5 w-3.5" />
                                Confirm {activeStats.today_pending} Pending
                            </Button>
                        )}
                        <Link
                            href={route('appointments.index')}
                            className="flex items-center gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg text-xs font-semibold h-9 px-3 shadow-none"
                        >
                            <Calendar className="h-3.5 w-3.5" />
                            {t('schedule.thisWeek')}
                        </Link>
                    </div>

                    {/* Customize Button */}
                    <Button
                        onClick={() => setCustomizeOpen(true)}
                        className="flex items-center gap-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-semibold h-9 px-3"
                    >
                        <Settings className="h-3.5 w-3.5" />
                        {t('dash.customize')}
                    </Button>
                </div>

                {/* Customize Modal */}
                <Dialog open={customizeOpen} onOpenChange={setCustomizeOpen}>
                    <DialogContent className="max-w-sm rounded-xl">
                        <DialogHeader>
                            <DialogTitle>{t('dash.customize')}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50">
                                <span className="text-sm font-medium text-slate-900">{t('dash.kpiCards')}</span>
                                <button onClick={() => toggleCard('kpi')} className="text-slate-400 hover:text-slate-600">
                                    {visibleCards.has('kpi') ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                </button>
                            </div>
                            <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50">
                                <span className="text-sm font-medium text-slate-900">{t('dash.weeklyInsights')}</span>
                                <button onClick={() => toggleCard('insights')} className="text-slate-400 hover:text-slate-600">
                                    {visibleCards.has('insights') ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                </button>
                            </div>
                            <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50">
                                <span className="text-sm font-medium text-slate-900">{t('dash.todaysSchedule')}</span>
                                <button onClick={() => toggleCard('schedule')} className="text-slate-400 hover:text-slate-600">
                                    {visibleCards.has('schedule') ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                </button>
                            </div>
                            <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50">
                                <span className="text-sm font-medium text-slate-900">{t('dash.upcomingAppointmentsList')}</span>
                                <button onClick={() => toggleCard('upcoming')} className="text-slate-400 hover:text-slate-600">
                                    {visibleCards.has('upcoming') ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

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

                {/* Owner-barber view toggle */}
                {is_owner_barber && (
                    <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg w-fit">
                        <button
                            onClick={() => setViewMine(false)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                                !viewMine
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            <Store className="h-3.5 w-3.5" />
                            {t('dash.shopView')}
                        </button>
                        <button
                            onClick={() => setViewMine(true)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                                viewMine
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            <User className="h-3.5 w-3.5" />
                            {t('dash.mySchedule')}
                        </button>
                    </div>
                )}

                {/* KPI Cards */}
                {visibleCards.has('kpi') && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
                    <Card className="border-slate-200 shadow-none">
                        <CardContent className="p-4 lg:p-5 space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 shrink-0">
                                    <CalendarDays className="h-4 w-4" />
                                </div>
                                <p className="text-xs font-medium text-muted-foreground">{t('dash.todayAppointments')}</p>
                            </div>
                            <p className="text-2xl lg:text-3xl font-bold ml-11">{activeStats.today_appointments}</p>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 shadow-none">
                        <CardContent className="p-4 lg:p-5 space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 text-orange-600 shrink-0">
                                    <Clock className="h-4 w-4" />
                                </div>
                                <p className="text-xs font-medium text-muted-foreground">{t('dash.pendingConfirmation')}</p>
                            </div>
                            <p className="text-2xl lg:text-3xl font-bold ml-11">{activeStats.today_pending}</p>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 shadow-none">
                        <CardContent className="p-4 lg:p-5 space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
                                    <CheckCircle2 className="h-4 w-4" />
                                </div>
                                <p className="text-xs font-medium text-muted-foreground">{t('dash.revenueToday')}</p>
                            </div>
                            <p className="text-2xl lg:text-3xl font-bold ml-11">{formatCents(activeStats.today_revenue)}</p>
                        </CardContent>
                    </Card>
                </div>
                )}

                {/* Weekly Insights */}
                {visibleCards.has('insights') && !is_barber && insights && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4">
                        <Card className="border-slate-200 shadow-none">
                            <CardContent className="p-3 lg:p-5 flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-500 shrink-0">
                                    <Trophy className="h-4 w-4" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] lg:text-xs font-medium text-muted-foreground">{t('dash.topBarber')}</p>
                                    {insights.top_barber
                                        ? <p className="text-sm font-bold truncate">{insights.top_barber.name} <span className="text-xs font-normal text-slate-400">({insights.top_barber.count})</span></p>
                                        : <p className="text-sm text-slate-400">—</p>
                                    }
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-slate-200 shadow-none">
                            <CardContent className="p-3 lg:p-5 flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-500 shrink-0">
                                    <TrendingUp className="h-4 w-4" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] lg:text-xs font-medium text-muted-foreground">{t('dash.topService')}</p>
                                    {insights.top_service
                                        ? <p className="text-sm font-bold truncate">{insights.top_service.name} <span className="text-xs font-normal text-slate-400">({insights.top_service.count})</span></p>
                                        : <p className="text-sm text-slate-400">—</p>
                                    }
                                </div>
                            </CardContent>
                        </Card>


                    </div>
                )}

                {/* Today's Schedule + Upcoming */}
                <div className="grid gap-4 lg:gap-6 lg:grid-cols-2">
                    {visibleCards.has('schedule') && (
                    <Card className="border-slate-200 shadow-none">
                        <CardHeader className="pb-2 px-4 lg:px-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-base">{t('dash.todaySchedule')}</CardTitle>
                                    <CardDescription>
                                        {activeSchedule.length} {activeSchedule.length !== 1 ? t('dash.appointmentsPlural') : t('dash.appointments')}
                                    </CardDescription>
                                </div>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </div>
                        </CardHeader>
                        <CardContent className="pt-0 px-2 lg:px-4">
                            <div className="max-h-72 overflow-y-auto space-y-0.5">
                                {activeSchedule.length > 0 ? activeSchedule.map(a => <ScheduleRow key={a.id} appointment={a} />) : (
                                    <p className="py-8 text-center text-sm text-muted-foreground">{t('dash.noToday')}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                    )}

                    {visibleCards.has('upcoming') && (
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
                                {activeUpcoming.length > 0 ? activeUpcoming.map(a => <ScheduleRow key={a.id} appointment={a} />) : (
                                    <p className="py-8 text-center text-sm text-muted-foreground">{t('dash.noUpcoming')}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
