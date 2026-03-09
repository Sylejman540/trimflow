import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
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
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { formatCents, cn } from '@/lib/utils';
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

function statusColor(status: AppointmentStatus) {
    const map: Record<AppointmentStatus, string> = {
        scheduled: 'bg-blue-500/15 text-blue-700 dark:text-blue-400',
        confirmed: 'bg-green-500/15 text-green-700 dark:text-green-400',
        in_progress: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
        completed: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
        cancelled: 'bg-red-500/15 text-red-700 dark:text-red-400',
        no_show: 'bg-gray-500/15 text-gray-700 dark:text-gray-400',
    };
    return map[status];
}

function formatTime(dateStr: string) {
    return new Date(dateStr).toLocaleString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
    });
}

function revenueChange(current: number, previous: number): { pct: number; up: boolean } {
    if (previous === 0) return { pct: current > 0 ? 100 : 0, up: true };
    const pct = Math.round(((current - previous) / previous) * 100);
    return { pct: Math.abs(pct), up: pct >= 0 };
}

function KpiCard({
    title,
    value,
    subtitle,
    icon,
    trend,
}: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    trend?: { pct: number; up: boolean };
}) {
    return (
        <Card className="relative overflow-hidden">
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">{title}</p>
                        <p className="text-2xl font-semibold tracking-tight">{value}</p>
                        {subtitle && (
                            <p className="text-xs text-muted-foreground">{subtitle}</p>
                        )}
                        {trend && trend.pct > 0 && (
                            <div className={`flex items-center gap-1 text-xs font-medium ${trend.up ? 'text-emerald-600' : 'text-red-600'}`}>
                                {trend.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                {trend.pct}% vs last month
                            </div>
                        )}
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3">
                        {icon}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function ScheduleRow({ appointment }: { appointment: Appointment }) {
    return (
        <Link
            href={route('appointments.show', appointment.id)}
            className="flex items-center gap-4 rounded-lg px-3 py-3 transition-colors hover:bg-muted/50"
        >
            <div className="flex h-10 w-16 flex-col items-center justify-center rounded-md bg-muted/60 text-xs font-medium">
                {formatTime(appointment.starts_at)}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                    {appointment.customer?.name ?? 'Walk-in'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                    {appointment.service?.name}
                    {!appointment.barber && '' }
                    {appointment.barber?.user?.name && ` \u00b7 ${appointment.barber.user.name}`}
                </p>
            </div>
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColor(appointment.status)}`}>
                {appointment.status.replace('_', ' ')}
            </span>
        </Link>
    );
}

interface ShopGoal {
    revenue_target: number;
    bookings_target: number;
    month: number;
    year: number;
}

function GoalBar({ label, current, target }: { label: string; current: number; target: number }) {
    const pct = target > 0 ? Math.min(Math.round((current / target) * 100), 100) : 0;
    const done = pct >= 100;
    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-700">{label}</span>
                <span className={cn('font-bold', done ? 'text-emerald-600' : 'text-slate-500')}>
                    {pct}% {done && '✓'}
                </span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                    className={cn('h-full rounded-full transition-all', done ? 'bg-emerald-500' : 'bg-slate-900')}
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
}

function GoalSetModal({ goal, month, year, open, onClose }: {
    goal: ShopGoal | null; month: number; year: number; open: boolean; onClose: () => void;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        month: String(month),
        year: String(year),
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
                <DialogHeader><DialogTitle>Set Monthly Goals</DialogTitle></DialogHeader>
                <form onSubmit={submit} className="space-y-4 pt-2">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Revenue Target ($)</Label>
                        <Input
                            type="number" min="0" step="0.01"
                            value={data.revenue_target}
                            onChange={e => setData('revenue_target', e.target.value)}
                            className="h-10 bg-slate-50 border-slate-200 focus:bg-white rounded-lg"
                            placeholder="e.g. 5000"
                        />
                        {errors.revenue_target && <p className="text-xs text-red-500">{errors.revenue_target}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Bookings Target</Label>
                        <Input
                            type="number" min="0"
                            value={data.bookings_target}
                            onChange={e => setData('bookings_target', e.target.value)}
                            className="h-10 bg-slate-50 border-slate-200 focus:bg-white rounded-lg"
                            placeholder="e.g. 80"
                        />
                        {errors.bookings_target && <p className="text-xs text-red-500">{errors.bookings_target}</p>}
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={onClose} className="text-slate-500">Cancel</Button>
                        <Button type="submit" disabled={processing} className="bg-slate-900 text-white hover:bg-slate-800 shadow-none">Save Goals</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default function Dashboard({
    is_barber,
    stats,
    chart_data,
    barber_performance,
    today_schedule,
    upcoming_appointments,
    goal,
}: {
    is_barber: boolean;
    stats: Stats;
    chart_data: ChartPoint[];
    barber_performance: BarberPerf[];
    today_schedule: Appointment[];
    upcoming_appointments: Appointment[];
    goal: ShopGoal | null;
}) {
    const revTrend = revenueChange(stats.monthly_revenue, stats.prev_month_revenue);
    const [goalOpen, setGoalOpen] = useState(false);
    const now = new Date();

    return (
        <AppLayout title="Dashboard">
            <Head title="Dashboard" />

            <div className="space-y-6">
                {/* KPI Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <KpiCard
                        title="Today's Appointments"
                        value={stats.today_appointments}
                        subtitle={`${stats.weekly_bookings} this week`}
                        icon={<CalendarDays className="h-5 w-5 text-muted-foreground" />}
                    />
                    <KpiCard
                        title="Monthly Bookings"
                        value={stats.monthly_bookings}
                        icon={<BarChart3 className="h-5 w-5 text-muted-foreground" />}
                    />
                    <KpiCard
                        title="Monthly Revenue"
                        value={formatCents(stats.monthly_revenue)}
                        trend={revTrend}
                        icon={<DollarSign className="h-5 w-5 text-muted-foreground" />}
                    />
                    {!is_barber && stats.active_barbers != null ? (
                        <KpiCard
                            title="Active Barbers"
                            value={stats.active_barbers}
                            icon={<Users className="h-5 w-5 text-muted-foreground" />}
                        />
                    ) : (
                        <KpiCard
                            title="Completion Rate"
                            value={`${stats.completion_rate}%`}
                            subtitle="This month"
                            icon={<CheckCircle2 className="h-5 w-5 text-muted-foreground" />}
                        />
                    )}
                </div>

                {/* Popular service pill */}
                {stats.popular_service && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Star className="h-4 w-4 text-amber-500" />
                        Top service this month:{' '}
                        <span className="font-medium text-foreground">{stats.popular_service}</span>
                        <Badge variant="secondary" className="text-xs">{stats.popular_service_count} bookings</Badge>
                    </div>
                )}

                {/* Monthly Goals */}
                {!is_barber && (
                    <Card className="border-slate-200 shadow-none">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-base">Monthly Goals</CardTitle>
                                    <CardDescription>
                                        {new Date(now.getFullYear(), now.getMonth()).toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                                    </CardDescription>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 text-xs text-slate-400 hover:text-slate-900"
                                    onClick={() => setGoalOpen(true)}
                                >
                                    {goal ? 'Edit' : 'Set Goals'}
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-0 space-y-4">
                            {goal ? (
                                <>
                                    <GoalBar
                                        label={`Revenue — ${formatCents(stats.monthly_revenue)} of ${formatCents(goal.revenue_target)}`}
                                        current={stats.monthly_revenue}
                                        target={goal.revenue_target}
                                    />
                                    <GoalBar
                                        label={`Bookings — ${stats.monthly_bookings} of ${goal.bookings_target}`}
                                        current={stats.monthly_bookings}
                                        target={goal.bookings_target}
                                    />
                                </>
                            ) : (
                                <p className="text-sm text-muted-foreground py-2">
                                    No goals set for this month.{' '}
                                    <button className="font-medium text-slate-900 underline underline-offset-2" onClick={() => setGoalOpen(true)}>
                                        Set goals
                                    </button>
                                </p>
                            )}
                        </CardContent>
                    </Card>
                )}
                <GoalSetModal
                    goal={goal}
                    month={now.getMonth() + 1}
                    year={now.getFullYear()}
                    open={goalOpen}
                    onClose={() => setGoalOpen(false)}
                />

                {/* Chart + Today's Schedule */}
                <div className="grid gap-6 lg:grid-cols-5">
                    {/* Bookings Chart */}
                    <Card className="lg:col-span-3">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Bookings Trend</CardTitle>
                            <CardDescription>Last 14 days</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="h-[260px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chart_data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="bookingsFill" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                                        <XAxis
                                            dataKey="date"
                                            tick={{ fontSize: 12 }}
                                            className="fill-muted-foreground"
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <YAxis
                                            tick={{ fontSize: 12 }}
                                            className="fill-muted-foreground"
                                            tickLine={false}
                                            axisLine={false}
                                            allowDecimals={false}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'hsl(var(--card))',
                                                border: '1px solid hsl(var(--border))',
                                                borderRadius: '8px',
                                                fontSize: '13px',
                                            }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="bookings"
                                            stroke="hsl(var(--primary))"
                                            strokeWidth={2}
                                            fill="url(#bookingsFill)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Today's Schedule */}
                    <Card className="lg:col-span-2">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-base">Today's Schedule</CardTitle>
                                    <CardDescription>
                                        {today_schedule.length} appointment{today_schedule.length !== 1 ? 's' : ''}
                                    </CardDescription>
                                </div>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="max-h-[260px] overflow-y-auto space-y-0.5">
                                {today_schedule.length > 0 ? (
                                    today_schedule.map((a) => (
                                        <ScheduleRow key={a.id} appointment={a} />
                                    ))
                                ) : (
                                    <p className="py-8 text-center text-sm text-muted-foreground">
                                        No appointments today
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Bottom row: Barber Performance + Upcoming */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Barber Performance (admin only) */}
                    {!is_barber && barber_performance.length > 0 && (
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">Barber Performance</CardTitle>
                                <CardDescription>This month</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="space-y-3">
                                    {barber_performance.map((b, i) => (
                                        <div key={b.id} className="flex items-center gap-3">
                                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                                                {i + 1}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{b.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {b.completed}/{b.appointments} completed
                                                    {b.no_shows > 0 && ` · ${b.no_shows} no-show${b.no_shows > 1 ? 's' : ''}`}
                                                </p>
                                            </div>
                                            <div className="flex flex-col items-end gap-0.5">
                                                <p className="text-sm font-semibold tabular-nums">
                                                    {formatCents(b.revenue)}
                                                </p>
                                                {b.avg_rating > 0 && (
                                                    <span className="flex items-center gap-0.5 text-[11px] text-amber-500 font-medium">
                                                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                                        {b.avg_rating}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Upcoming Appointments */}
                    <Card className={!is_barber && barber_performance.length > 0 ? '' : 'lg:col-span-2'}>
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-base">Upcoming</CardTitle>
                                    <CardDescription>Next scheduled appointments</CardDescription>
                                </div>
                                <Link
                                    href={route('appointments.index')}
                                    className="text-xs font-medium text-primary hover:underline"
                                >
                                    View all
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-0 space-y-0.5">
                            {upcoming_appointments.length > 0 ? (
                                upcoming_appointments.map((a) => (
                                    <ScheduleRow key={a.id} appointment={a} />
                                ))
                            ) : (
                                <p className="py-8 text-center text-sm text-muted-foreground">
                                    No upcoming appointments
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
