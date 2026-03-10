import { Head, router } from '@inertiajs/react';
import { BarChart2, TrendingUp, Users, CheckCircle2, XCircle, AlertTriangle, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import AppLayout from '@/layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCents } from '@/lib/utils';

const PERIODS = [
    { value: 'today',      label: 'Today' },
    { value: 'this_week',  label: 'This Week' },
    { value: 'this_month', label: 'This Month' },
    { value: 'last_month', label: 'Last Month' },
    { value: 'last_week',  label: 'Last Week' },
    { value: 'this_year',  label: 'This Year' },
];

interface DayData   { date: string; revenue: number; count: number }
interface BarberData { name: string; revenue: number; count: number }
interface ServiceData{ name: string; revenue: number; count: number }
interface Totals {
    revenue: number; tips: number; total: number;
    completed: number; cancelled: number; no_shows: number;
}

function StatCard({ label, value, sub, icon: Icon, color }: {
    label: string; value: string; sub?: string;
    icon: React.ElementType; color: string;
}) {
    return (
        <Card className="border-slate-200 shadow-none">
            <CardContent className="px-4 py-4 flex items-center gap-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color} shrink-0`}>
                    <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider truncate">{label}</p>
                    <p className="text-xl font-bold text-slate-900 leading-tight">{value}</p>
                    {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
                </div>
            </CardContent>
        </Card>
    );
}

export default function Index({
    period,
    period_label,
    revenue_by_day,
    revenue_by_barber,
    revenue_by_service,
    totals,
}: {
    period: string;
    period_label: string;
    revenue_by_day: DayData[];
    revenue_by_barber: BarberData[];
    revenue_by_service: ServiceData[];
    totals: Totals;
}) {
    function changePeriod(p: string) {
        router.get(route('reports.index'), { period: p }, { preserveState: false });
    }

    const completionRate = totals.total > 0
        ? Math.round((totals.completed / totals.total) * 100)
        : 0;

    return (
        <AppLayout title="Reports">
            <Head title="Reports" />

            <div className="space-y-6">
                {/* Period selector */}
                <div className="flex flex-wrap gap-2">
                    {PERIODS.map(p => (
                        <button
                            key={p.value}
                            onClick={() => changePeriod(p.value)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                                period === p.value
                                    ? 'bg-slate-900 text-white border-slate-900'
                                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                            }`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>

                {/* Summary cards */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    <StatCard
                        label="Revenue"
                        value={formatCents(totals.revenue)}
                        sub={totals.tips > 0 ? `+${formatCents(totals.tips)} tips` : undefined}
                        icon={DollarSign}
                        color="bg-emerald-50 text-emerald-600"
                    />
                    <StatCard
                        label="Appointments"
                        value={String(totals.total)}
                        sub={`${completionRate}% completion rate`}
                        icon={BarChart2}
                        color="bg-blue-50 text-blue-600"
                    />
                    <StatCard
                        label="Completed"
                        value={String(totals.completed)}
                        icon={CheckCircle2}
                        color="bg-green-50 text-green-600"
                    />
                    <StatCard
                        label="Cancelled"
                        value={String(totals.cancelled)}
                        icon={XCircle}
                        color="bg-red-50 text-red-500"
                    />
                    <StatCard
                        label="No-shows"
                        value={String(totals.no_shows)}
                        icon={AlertTriangle}
                        color="bg-orange-50 text-orange-500"
                    />
                    <StatCard
                        label="Tips Collected"
                        value={formatCents(totals.tips)}
                        icon={TrendingUp}
                        color="bg-amber-50 text-amber-600"
                    />
                </div>

                {/* Revenue chart */}
                {revenue_by_day.length > 0 && (
                    <Card className="border-slate-200 shadow-none">
                        <CardHeader className="px-4 lg:px-6 pt-4 pb-2">
                            <CardTitle className="text-base">Revenue — {period_label}</CardTitle>
                        </CardHeader>
                        <CardContent className="px-2 pb-4">
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={revenue_by_day} margin={{ left: 0, right: 8, top: 4, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                    <YAxis
                                        tickFormatter={v => `$${(v / 100).toFixed(0)}`}
                                        tick={{ fontSize: 11, fill: '#94a3b8' }}
                                        axisLine={false} tickLine={false} width={48}
                                    />
                                    <Tooltip
                                        formatter={(v: number) => [formatCents(v), 'Revenue']}
                                        contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
                                    />
                                    <Bar dataKey="revenue" fill="#0f172a" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* By barber */}
                    <Card className="border-slate-200 shadow-none">
                        <CardHeader className="px-4 lg:px-6 pt-4 pb-2">
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-slate-400" />
                                <CardTitle className="text-base">By Barber</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="px-4 lg:px-6 pb-4">
                            {revenue_by_barber.length === 0 ? (
                                <p className="text-sm text-slate-400 py-4 text-center">No data for this period.</p>
                            ) : (
                                <div className="space-y-3">
                                    {revenue_by_barber.map((b, i) => {
                                        const maxRevenue = revenue_by_barber[0]?.revenue ?? 1;
                                        const pct = maxRevenue > 0 ? (b.revenue / maxRevenue) * 100 : 0;
                                        return (
                                            <div key={i} className="space-y-1">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="font-medium text-slate-900 truncate">{b.name}</span>
                                                    <span className="text-slate-500 shrink-0 ml-2">{formatCents(b.revenue)} · {b.count} appts</span>
                                                </div>
                                                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-slate-900 rounded-full" style={{ width: `${pct}%` }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* By service */}
                    <Card className="border-slate-200 shadow-none">
                        <CardHeader className="px-4 lg:px-6 pt-4 pb-2">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-slate-400" />
                                <CardTitle className="text-base">By Service</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="px-4 lg:px-6 pb-4">
                            {revenue_by_service.length === 0 ? (
                                <p className="text-sm text-slate-400 py-4 text-center">No data for this period.</p>
                            ) : (
                                <div className="space-y-3">
                                    {revenue_by_service.map((s, i) => {
                                        const maxRevenue = revenue_by_service[0]?.revenue ?? 1;
                                        const pct = maxRevenue > 0 ? (s.revenue / maxRevenue) * 100 : 0;
                                        return (
                                            <div key={i} className="space-y-1">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="font-medium text-slate-900 truncate">{s.name}</span>
                                                    <span className="text-slate-500 shrink-0 ml-2">{formatCents(s.revenue)} · {s.count}×</span>
                                                </div>
                                                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
