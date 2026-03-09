import { Head, router } from '@inertiajs/react';
import {
    AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
    DollarSign, CalendarDays, Users, TrendingUp,
    CheckCircle2, XCircle, AlertCircle, SlidersHorizontal,
} from 'lucide-react';
import AppLayout from '@/layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { formatCents, cn } from '@/lib/utils';

interface Summary {
    total_revenue: number;
    total_appointments: number;
    completed: number;
    no_shows: number;
    cancelled: number;
    new_customers: number;
    completion_rate: number;
}

interface DailyPoint  { date: string; revenue: number; bookings: number }
interface NameRevenue { name: string; revenue: number; bookings: number }

const PERIODS = [
    { value: 'today',         label: 'Today' },
    { value: 'this_week',     label: 'This Week' },
    { value: 'this_month',    label: 'This Month' },
    { value: 'last_month',    label: 'Last Month' },
    { value: 'last_3_months', label: 'Last 3 Months' },
    { value: 'this_year',     label: 'This Year' },
];

function KpiCard({ title, value, sub, icon, highlight = false }: {
    title: string; value: string | number; sub?: string;
    icon: React.ReactNode; highlight?: boolean;
}) {
    return (
        <Card className={cn('border-slate-200 shadow-none', highlight && 'bg-slate-900 text-white border-slate-900')}>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <p className={cn('text-sm font-medium', highlight ? 'text-slate-300' : 'text-muted-foreground')}>{title}</p>
                        <p className="text-2xl font-semibold tracking-tight">{value}</p>
                        {sub && <p className={cn('text-xs', highlight ? 'text-slate-400' : 'text-muted-foreground')}>{sub}</p>}
                    </div>
                    <div className={cn('rounded-lg p-3', highlight ? 'bg-white/10' : 'bg-muted/50')}>{icon}</div>
                </div>
            </CardContent>
        </Card>
    );
}

function RankedList({ title, description, data, valueKey = 'revenue' }: {
    title: string; description: string; data: NameRevenue[]; valueKey?: 'revenue' | 'bookings';
}) {
    const max = Math.max(...data.map(d => d[valueKey]), 1);
    return (
        <Card className="border-slate-200 shadow-none">
            <CardHeader className="pb-2">
                <CardTitle className="text-base">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
                {data.length === 0 && (
                    <p className="text-sm text-muted-foreground py-4 text-center">No data for this period.</p>
                )}
                {data.map((item, i) => (
                    <div key={item.name} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-400 w-4">{i + 1}</span>
                                <span className="font-medium text-slate-900">{item.name}</span>
                            </div>
                            <div className="flex items-center gap-3 text-right">
                                <span className="text-xs text-slate-400">{item.bookings} appts</span>
                                <span className="font-semibold text-slate-900 tabular-nums">
                                    {valueKey === 'revenue' ? formatCents(item.revenue) : item.bookings}
                                </span>
                            </div>
                        </div>
                        <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                            <div
                                className="h-full rounded-full bg-slate-900 transition-all"
                                style={{ width: `${(item[valueKey] / max) * 100}%` }}
                            />
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}

export default function Index({
    period,
    period_label,
    summary,
    daily_revenue,
    by_service,
    by_barber,
    status_breakdown,
}: {
    period: string;
    period_label: string;
    summary: Summary;
    daily_revenue: DailyPoint[];
    by_service: NameRevenue[];
    by_barber: NameRevenue[];
    status_breakdown: Record<string, number>;
}) {
    function changePeriod(value: string) {
        router.get(route('reports.index'), { period: value }, { preserveState: false });
    }

    return (
        <AppLayout
            title="Reports"
            actions={
                <div className="flex items-center gap-2">
                    <div className="hidden lg:flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        <SlidersHorizontal size={12} /> Period
                    </div>
                    <Select value={period} onValueChange={(v) => changePeriod(v ?? 'this_month')}>
                        <SelectTrigger className="h-9 w-[150px] bg-white border-slate-200 rounded-lg text-xs font-semibold shadow-none focus:ring-0">
                            <SelectValue>{period_label}</SelectValue>
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-200 shadow-none">
                            {PERIODS.map(p => (
                                <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            }
        >
            <Head title="Reports" />

            <div className="space-y-6">
                {/* KPI row */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <KpiCard
                        title="Total Revenue"
                        value={formatCents(summary.total_revenue)}
                        sub={period_label}
                        icon={<DollarSign className="h-5 w-5 text-white" />}
                        highlight
                    />
                    <KpiCard
                        title="Total Appointments"
                        value={summary.total_appointments}
                        sub={`${summary.completion_rate}% completion rate`}
                        icon={<CalendarDays className="h-5 w-5 text-muted-foreground" />}
                    />
                    <KpiCard
                        title="New Customers"
                        value={summary.new_customers}
                        sub="Joined this period"
                        icon={<Users className="h-5 w-5 text-muted-foreground" />}
                    />
                    <KpiCard
                        title="Completed"
                        value={summary.completed}
                        sub={`${summary.no_shows} no-shows · ${summary.cancelled} cancelled`}
                        icon={<TrendingUp className="h-5 w-5 text-muted-foreground" />}
                    />
                </div>

                {/* Status badges */}
                <div className="flex flex-wrap gap-2">
                    {[
                        { key: 'completed',   label: 'Completed',   cls: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
                        { key: 'scheduled',   label: 'Scheduled',   cls: 'bg-blue-50 text-blue-700 border-blue-100' },
                        { key: 'confirmed',   label: 'Confirmed',   cls: 'bg-green-50 text-green-700 border-green-100' },
                        { key: 'in_progress', label: 'In Progress', cls: 'bg-amber-50 text-amber-700 border-amber-100' },
                        { key: 'cancelled',   label: 'Cancelled',   cls: 'bg-red-50 text-red-600 border-red-100' },
                        { key: 'no_show',     label: 'No Show',     cls: 'bg-slate-50 text-slate-600 border-slate-100' },
                    ].map(({ key, label, cls }) => status_breakdown[key] != null && (
                        <Badge key={key} className={cn('text-[10px] font-bold tracking-wider rounded-md px-2 py-0.5 shadow-none border', cls)}>
                            {label}: {status_breakdown[key]}
                        </Badge>
                    ))}
                </div>

                {/* Revenue over time chart */}
                <Card className="border-slate-200 shadow-none">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Revenue Over Time</CardTitle>
                        <CardDescription>{period_label}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="h-[260px]">
                            {daily_revenue.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={daily_revenue} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#111827" stopOpacity={0.15} />
                                                <stop offset="95%" stopColor="#111827" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                                        <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                                        <YAxis
                                            tick={{ fontSize: 11 }}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(v) => `$${(v / 100).toFixed(0)}`}
                                        />
                                        <Tooltip
                                            formatter={(v: unknown) => [formatCents(v as number), 'Revenue']}
                                            contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px' }}
                                        />
                                        <Area type="monotone" dataKey="revenue" stroke="#111827" strokeWidth={2} fill="url(#revFill)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                                    No completed appointments in this period.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* By service + by barber */}
                <div className="grid gap-6 lg:grid-cols-2">
                    <RankedList
                        title="Revenue by Service"
                        description="Top performing services"
                        data={by_service}
                    />
                    <RankedList
                        title="Revenue by Barber"
                        description="Top performing team members"
                        data={by_barber}
                    />
                </div>

                {/* Bookings bar chart */}
                {daily_revenue.length > 0 && (
                    <Card className="border-slate-200 shadow-none">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Daily Bookings</CardTitle>
                            <CardDescription>Total appointments per day</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="h-[200px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={daily_revenue} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                                        <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                                        <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                                        <Tooltip
                                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                            formatter={(v: any) => [v, 'Bookings']}
                                            contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px' }}
                                        />
                                        <Bar dataKey="bookings" fill="#111827" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
