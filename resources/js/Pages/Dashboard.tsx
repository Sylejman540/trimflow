import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    CalendarDays,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Users,
    Star,
    CheckCircle2,
    Clock,
    BarChart3,
    Package,
    AlertTriangle,
    Link2,
    Copy,
    Check,
    MessageCircle,
    ChevronDown,
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import AppLayout from '@/layouts/AppLayout';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { formatCents, formatTime, cn } from '@/lib/utils';
import { Appointment, AppointmentStatus } from '@/types';

interface Stats {
    today_appointments: number;
    weekly_bookings: number;
    monthly_bookings: number;
    monthly_revenue: number;
    prev_month_revenue: number;
    completion_rate: number;
    active_barbers?: number;
    popular_service: string | null;
    popular_service_count: number;
}

interface ChartPoint {
    date: string;
    bookings: number;
}

interface BarberPerf {
    id: number;
    name: string;
    appointments: number;
    completed: number;
    revenue: number;
    no_shows: number;
    avg_rating: number;
}

interface ShopGoal { revenue_target: number; bookings_target: number; month: number; year: number; }

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

const MANYCHAT_URL = 'https://manychat.com';

const STEP_KEYS = [
    { num: 1, titleKey: 'mc.step1Title', descKey: 'mc.step1Desc', actionKey: 'mc.step1Action', href: MANYCHAT_URL },
    { num: 2, titleKey: 'mc.step2Title', descKey: 'mc.step2Desc', actionKey: null, href: null },
    { num: 3, titleKey: 'mc.step3Title', descKey: 'mc.step3Desc', actionKey: null, href: null },
    { num: 4, titleKey: 'mc.step4Title', descKey: 'mc.step4Desc', actionKey: null, href: null },
    { num: 5, titleKey: 'mc.step5Title', descKey: 'mc.step5Desc', actionKey: null, href: null },
];

function BookingLinkCard({ slug }: { slug: string }) {
    const { t } = useTranslation();
    const bookingUrl = window.location.origin + '/book/' + slug;
    const [copied, setCopied] = useState<string | null>(null);
    const [guideOpen, setGuideOpen] = useState(false);

    function copy(text: string, key: string) {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(key);
            setTimeout(() => setCopied(null), 2000);
        });
    }

    const template1 = (t('dm.template1') as string).replace('{url}', bookingUrl);
    const template2 = (t('dm.template2') as string).replace('{url}', bookingUrl);

    return (
        <Card className="border-slate-200 shadow-none">
            <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                    <Link2 className="h-4 w-4 text-slate-400" />
                    <CardTitle className="text-sm font-bold">{t('dm.bookingLink')}</CardTitle>
                </div>
                <CardDescription className="text-xs">{t('dm.bookingLinkDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">

                {/* Booking URL */}
                <div className="space-y-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t('mc.yourBookingLink')}</p>
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                        <span className="flex-1 text-xs font-mono text-slate-600 truncate">{bookingUrl}</span>
                        <button
                            onClick={() => copy(bookingUrl, 'url')}
                            className="shrink-0 flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-slate-900 transition-colors"
                        >
                            {copied === 'url' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                            {copied === 'url' ? t('dm.copied') : t('dm.copyLink')}
                        </button>
                    </div>
                </div>

                {/* DM Templates */}
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">{t('dm.dmTemplates')}</p>
                    <div className="grid sm:grid-cols-2 gap-2">
                        {[{ key: 't1', label: t('dm.copy1'), text: template1 }, { key: 't2', label: t('dm.copy2'), text: template2 }].map(tpl => (
                            <div key={tpl.key} className="relative bg-slate-50 border border-slate-200 rounded-lg p-3">
                                <div className="flex items-center gap-1.5 mb-1.5">
                                    <MessageCircle className="h-3 w-3 text-slate-400" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{tpl.label}</span>
                                </div>
                                <p className="text-[11px] text-slate-600 whitespace-pre-line leading-relaxed">{tpl.text}</p>
                                <button
                                    onClick={() => copy(tpl.text, tpl.key)}
                                    className="absolute top-2 right-2 flex items-center justify-center h-6 w-6 rounded-md hover:bg-slate-200 transition-colors"
                                >
                                    {copied === tpl.key ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3 text-slate-400" />}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ManyChat Setup Guide */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <button
                        onClick={() => setGuideOpen(!guideOpen)}
                        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <MessageCircle className="h-3.5 w-3.5 text-slate-400" />
                            <span className="text-xs font-bold text-slate-700">{t('mc.igSetup')}</span>
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-md">{t('mc.free')}</span>
                        </div>
                        <ChevronDown className={cn("h-3.5 w-3.5 text-slate-400 transition-transform", guideOpen && "rotate-180")} />
                    </button>

                    {guideOpen && (
                        <div className="p-4 space-y-1">
                            {/* QR to ManyChat */}
                            <div className="flex items-center gap-3 mb-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                                <div className="shrink-0 p-1.5 bg-white border border-slate-200 rounded-lg">
                                    <QRCodeSVG value={MANYCHAT_URL} size={56} fgColor="#0f172a" bgColor="#ffffff" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-slate-700">{t('mc.scanToOpen')}</p>
                                    <p className="text-[11px] text-slate-500 mt-0.5">{t('mc.scanHint')}</p>
                                    <a href={MANYCHAT_URL} target="_blank" rel="noreferrer" className="text-[11px] font-bold text-blue-600 hover:underline">manychat.com →</a>
                                </div>
                            </div>

                            {/* Steps */}
                            <div className="space-y-3">
                                {STEP_KEYS.map((step, i) => (
                                    <div key={step.num} className="flex gap-3">
                                        <div className="shrink-0 flex flex-col items-center">
                                            <div className="h-6 w-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">
                                                {step.num}
                                            </div>
                                            {i < STEP_KEYS.length - 1 && <div className="w-px flex-1 bg-slate-200 mt-1" />}
                                        </div>
                                        <div className="pb-3 min-w-0">
                                            <p className="text-xs font-bold text-slate-800">{t(step.titleKey)}</p>
                                            <p className="text-[11px] text-slate-500 mt-0.5">{t(step.descKey)}</p>
                                            {step.actionKey && step.href && (
                                                <a href={step.href} target="_blank" rel="noreferrer"
                                                    className="inline-flex items-center mt-1.5 text-[11px] font-bold text-blue-600 hover:underline">
                                                    {t(step.actionKey)}
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

            </CardContent>
        </Card>
    );
}

function revenueChange(current: number, previous: number): { pct: number; up: boolean } {
    if (previous === 0) return { pct: current > 0 ? 100 : 0, up: true };
    const pct = Math.round(((current - previous) / previous) * 100);
    return { pct: Math.abs(pct), up: pct >= 0 };
}

function KpiCard({ title, value, subtitle, icon, trend }: {
    title: string; value: string | number; subtitle?: string;
    icon: React.ReactNode; trend?: { pct: number; up: boolean; label: string };
}) {
    return (
        <Card className="relative overflow-hidden border-slate-200 shadow-none">
            <CardContent className="p-4 lg:p-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-1 min-w-0">
                        <p className="text-xs font-medium text-muted-foreground truncate">{title}</p>
                        <p className="text-xl lg:text-2xl font-semibold tracking-tight">{value}</p>
                        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
                        {trend && trend.pct > 0 && (
                            <div className={`flex items-center gap-1 text-xs font-medium ${trend.up ? 'text-emerald-600' : 'text-red-600'}`}>
                                {trend.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                {trend.pct}% {trend.label}
                            </div>
                        )}
                    </div>
                    <div className="rounded-lg bg-muted/50 p-2.5 lg:p-3 shrink-0">{icon}</div>
                </div>
            </CardContent>
        </Card>
    );
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

function GoalBar({ label, current, target }: { label: string; current: number; target: number }) {
    const pct = target > 0 ? Math.min(Math.round((current / target) * 100), 100) : 0;
    const done = pct >= 100;
    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-700 truncate pr-2">{label}</span>
                <span className={cn('font-bold shrink-0', done ? 'text-emerald-600' : 'text-slate-500')}>{pct}% {done && '✓'}</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className={cn('h-full rounded-full transition-all', done ? 'bg-emerald-500' : 'bg-slate-900')} style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
}

function GoalSetModal({ goal, month, year, open, onClose }: {
    goal: ShopGoal | null; month: number; year: number; open: boolean; onClose: () => void;
}) {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors, reset } = useForm({
        month: String(month), year: String(year),
        revenue_target: goal ? String(goal.revenue_target / 100) : '',
        bookings_target: goal ? String(goal.bookings_target) : '',
    });
    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(route('goals.update'), { onSuccess: () => { reset(); onClose(); } });
    }
    return (
        <Dialog open={open} onOpenChange={v => !v && onClose()}>
            <DialogContent className="sm:max-w-sm border-slate-200 shadow-none">
                <DialogHeader><DialogTitle>{t('dash.setMonthlyGoals')}</DialogTitle></DialogHeader>
                <form onSubmit={submit} className="space-y-4 pt-2">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t('dash.revenueTarget')}</Label>
                        <Input type="number" min="0" step="0.01" value={data.revenue_target}
                            onChange={e => setData('revenue_target', e.target.value)}
                            className="h-10 bg-slate-50 border-slate-200 focus:bg-white rounded-lg" placeholder="e.g. 5000" />
                        {errors.revenue_target && <p className="text-xs text-red-500">{errors.revenue_target}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t('dash.bookingsTarget')}</Label>
                        <Input type="number" min="0" value={data.bookings_target}
                            onChange={e => setData('bookings_target', e.target.value)}
                            className="h-10 bg-slate-50 border-slate-200 focus:bg-white rounded-lg" placeholder="e.g. 80" />
                        {errors.bookings_target && <p className="text-xs text-red-500">{errors.bookings_target}</p>}
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={onClose} className="text-slate-500">{t('cancel')}</Button>
                        <Button type="submit" disabled={processing} className="bg-slate-900 text-white hover:bg-slate-800 shadow-none">{t('dash.saveGoals')}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

interface LowStockProduct { id: number; name: string; stock_qty: number; low_stock_threshold: number; }

export default function Dashboard({
    is_barber, stats, chart_data, barber_performance,
    today_schedule, upcoming_appointments, goal, low_stock_products = [],
}: {
    is_barber: boolean; stats: Stats; chart_data: ChartPoint[];
    barber_performance: BarberPerf[]; today_schedule: Appointment[];
    upcoming_appointments: Appointment[]; goal: ShopGoal | null;
    low_stock_products?: LowStockProduct[];
}) {
    const { t } = useTranslation();
    const { auth } = usePage<PageProps>().props;
    const revTrend = revenueChange(stats.monthly_revenue, stats.prev_month_revenue);
    const [goalOpen, setGoalOpen] = useState(false);
    const [lowStockDismissed, setLowStockDismissed] = useState(false);
    const now = new Date();

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

                {/* KPI Cards */}
                <div className="grid grid-cols-2 gap-3 lg:gap-4 lg:grid-cols-4">
                    <KpiCard
                        title={t('dash.todayAppointments')}
                        value={stats.today_appointments}
                        subtitle={`${stats.weekly_bookings} ${t('dash.thisWeek')}`}
                        icon={<CalendarDays className="h-4 w-4 lg:h-5 lg:w-5 text-muted-foreground" />}
                    />
                    <KpiCard
                        title={t('dash.bookingsGoal')}
                        value={stats.monthly_bookings}
                        icon={<BarChart3 className="h-4 w-4 lg:h-5 lg:w-5 text-muted-foreground" />}
                    />
                    <KpiCard
                        title={t('dash.revenueToday')}
                        value={formatCents(stats.monthly_revenue)}
                        trend={{ ...revTrend, label: t('dash.vsLastMonth') }}
                        icon={<DollarSign className="h-4 w-4 lg:h-5 lg:w-5 text-muted-foreground" />}
                    />
                    {!is_barber && stats.active_barbers != null ? (
                        <KpiCard
                            title={t('dash.activeBarbers')}
                            value={stats.active_barbers}
                            icon={<Users className="h-4 w-4 lg:h-5 lg:w-5 text-muted-foreground" />}
                        />
                    ) : (
                        <KpiCard
                            title={t('appt.completed')}
                            value={`${stats.completion_rate}%`}
                            subtitle={t('dash.thisMonth')}
                            icon={<CheckCircle2 className="h-4 w-4 lg:h-5 lg:w-5 text-muted-foreground" />}
                        />
                    )}
                </div>

                {/* Booking Link */}
                {!is_barber && auth.company?.slug && (
                    <BookingLinkCard slug={auth.company.slug} />
                )}

                {/* Popular service */}
                {stats.popular_service && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                        <Star className="h-4 w-4 text-amber-500 shrink-0" />
                        <span>{t('dash.topService')}</span>
                        <span className="font-medium text-foreground">{stats.popular_service}</span>
                        <Badge variant="secondary" className="text-xs">{stats.popular_service_count}</Badge>
                    </div>
                )}

                {/* Monthly Goals */}
                {!is_barber && (
                    <Card className="border-slate-200 shadow-none">
                        <CardHeader className="pb-3 px-4 lg:px-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-base">{t('dash.monthlyGoals')}</CardTitle>
                                    <CardDescription>
                                        {new Date(now.getFullYear(), now.getMonth()).toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                                    </CardDescription>
                                </div>
                                <Button variant="ghost" size="sm" className="h-8 text-xs text-slate-400 hover:text-slate-900" onClick={() => setGoalOpen(true)}>
                                    {goal ? t('dash.editGoals') : t('dash.setGoals')}
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-0 space-y-4 px-4 lg:px-6">
                            {goal ? (
                                <>
                                    <GoalBar
                                        label={`${t('dash.revenueGoal')} — ${formatCents(stats.monthly_revenue)} of ${formatCents(goal.revenue_target)}`}
                                        current={stats.monthly_revenue} target={goal.revenue_target}
                                    />
                                    <GoalBar
                                        label={`${t('dash.bookingsGoal')} — ${stats.monthly_bookings} of ${goal.bookings_target}`}
                                        current={stats.monthly_bookings} target={goal.bookings_target}
                                    />
                                </>
                            ) : (
                                <p className="text-sm text-muted-foreground py-2">
                                    {t('dash.noGoals')}{' '}
                                    <button className="font-medium text-slate-900 underline underline-offset-2" onClick={() => setGoalOpen(true)}>
                                        {t('dash.setGoalsLink')}
                                    </button>
                                </p>
                            )}
                        </CardContent>
                    </Card>
                )}
                <GoalSetModal goal={goal} month={now.getMonth() + 1} year={now.getFullYear()} open={goalOpen} onClose={() => setGoalOpen(false)} />

                {/* Chart + Today's Schedule */}
                <div className="grid gap-4 lg:gap-6 lg:grid-cols-5">
                    <Card className="lg:col-span-3 border-slate-200 shadow-none">
                        <CardHeader className="pb-2 px-4 lg:px-6">
                            <CardTitle className="text-base">{t('dash.bookingsTrend')}</CardTitle>
                            <CardDescription>{t('dash.last14')}</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0 px-2 lg:px-4">
                            <div className="h-[200px] lg:h-[260px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chart_data} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="bookingsFill" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                                        <XAxis dataKey="date" tick={{ fontSize: 11 }} className="fill-muted-foreground" tickLine={false} axisLine={false} interval="preserveStartEnd" />
                                        <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" tickLine={false} axisLine={false} allowDecimals={false} />
                                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '13px' }} />
                                        <Area type="monotone" dataKey="bookings" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#bookingsFill)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="lg:col-span-2 border-slate-200 shadow-none">
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
                            <div className="max-h-[220px] lg:max-h-[260px] overflow-y-auto space-y-0.5">
                                {today_schedule.length > 0 ? today_schedule.map(a => <ScheduleRow key={a.id} appointment={a} />) : (
                                    <p className="py-8 text-center text-sm text-muted-foreground">{t('dash.noToday')}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Barber Performance + Upcoming */}
                <div className="grid gap-4 lg:gap-6 lg:grid-cols-2">
                    {!is_barber && barber_performance.length > 0 && (
                        <Card className="border-slate-200 shadow-none">
                            <CardHeader className="pb-2 px-4 lg:px-6">
                                <CardTitle className="text-base">{t('dash.barberPerf')}</CardTitle>
                                <CardDescription>{t('dash.thisMonth')}</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-0 px-4 lg:px-6">
                                <div className="space-y-3">
                                    {barber_performance.map((b, i) => (
                                        <div key={b.id} className="flex items-center gap-3">
                                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">{i + 1}</div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{b.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {b.completed}/{b.appointments} {t('dash.completed')}
                                                    {b.no_shows > 0 && ` · ${b.no_shows} ${b.no_shows > 1 ? t('dash.noShows') : t('dash.noShow')}`}
                                                </p>
                                            </div>
                                            <div className="flex flex-col items-end gap-0.5 shrink-0">
                                                <p className="text-sm font-semibold tabular-nums">{formatCents(b.revenue)}</p>
                                                {b.avg_rating > 0 && (
                                                    <span className="flex items-center gap-0.5 text-[11px] text-amber-500 font-medium">
                                                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {b.avg_rating}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <Card className={cn('border-slate-200 shadow-none', (!is_barber && barber_performance.length > 0) ? '' : 'lg:col-span-2')}>
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
                        <CardContent className="pt-0 px-2 lg:px-4 space-y-0.5">
                            {upcoming_appointments.length > 0 ? upcoming_appointments.map(a => <ScheduleRow key={a.id} appointment={a} />) : (
                                <p className="py-8 text-center text-sm text-muted-foreground">{t('dash.noUpcomingFull')}</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}