import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    Building2, Users, CalendarDays, DollarSign, ExternalLink,
    ToggleLeft, ToggleRight, ArrowUpRight, TrendingUp, TrendingDown,
    Scissors, BarChart3, Activity, CheckCircle2, XCircle, Clock,
    AlertTriangle, LogOut,
} from 'lucide-react';
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { formatCents } from '@/lib/utils';
import { PageProps } from '@/types';
import { usePage } from '@inertiajs/react';
import { cn } from '@/lib/utils';

// ── Types ──────────────────────────────────────────────────────────────────────
interface Company {
    id: number; name: string; slug: string; email: string | null;
    phone: string | null; address: string | null; is_active: boolean;
    created_at: string; users_count: number; barbers_count: number;
    appointments_count: number; customers_count: number;
    revenue: number; last_booking_at: string;
}
interface Totals {
    companies: number; active_companies: number; users: number;
    appointments: number; appointments_today: number;
    revenue: number; revenue_this_month: number; revenue_prev_month: number;
    customers: number; cancellation_rate: number;
}
interface ChartPoint  { date: string; bookings: number }
interface RevenuePoint { month: string; revenue: number }
interface StatusPoint  { status: string; count: number }
interface TopShop      { name: string; revenue: number }
interface ActivityItem {
    id: number; company_name: string; company_slug: string;
    customer: string; service: string; barber: string;
    status: string; starts_at: string; created_at: string;
}
interface NewShop { id: number; name: string; slug: string; is_active: boolean; created_at: string }

// ── Constants ──────────────────────────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
    confirmed:   'bg-emerald-500/20 text-emerald-400',
    pending:     'bg-amber-500/20 text-amber-400',
    cancelled:   'bg-red-500/20 text-red-400',
    completed:   'bg-slate-500/20 text-slate-300',
    in_progress: 'bg-blue-500/20 text-blue-400',
    no_show:     'bg-orange-500/20 text-orange-400',
};
const STATUS_BAR_COLORS: Record<string, string> = {
    completed:   '#10b981',
    confirmed:   '#6366f1',
    pending:     '#f59e0b',
    cancelled:   '#ef4444',
    in_progress: '#3b82f6',
    no_show:     '#f97316',
};

// ── Helpers ────────────────────────────────────────────────────────────────────
function revChange(cur: number, prev: number) {
    if (prev === 0) return { pct: cur > 0 ? 100 : 0, up: true };
    const pct = Math.round(((cur - prev) / prev) * 100);
    return { pct: Math.abs(pct), up: pct >= 0 };
}

// ── Sub-components ─────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, icon, accent, trend }: {
    label: string; value: string | number; sub?: string;
    icon: React.ReactNode; accent?: boolean;
    trend?: { pct: number; up: boolean };
}) {
    return (
        <div className={cn(
            'rounded-2xl p-5 flex flex-col gap-4',
            accent ? 'bg-emerald-500' : 'bg-white/5 border border-white/8'
        )}>
            <div className={cn('flex h-9 w-9 items-center justify-center rounded-xl', accent ? 'bg-white/20' : 'bg-white/10')}>
                {icon}
            </div>
            <div>
                <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
                <p className={cn('text-xs font-medium mt-0.5', accent ? 'text-white/80' : 'text-white/50')}>{label}</p>
                {sub && !trend && <p className={cn('text-[11px] mt-0.5', accent ? 'text-white/60' : 'text-white/30')}>{sub}</p>}
                {trend && (
                    <div className={cn('flex items-center gap-1 text-[11px] font-semibold mt-1', trend.up ? 'text-emerald-300' : 'text-red-400')}>
                        {trend.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {trend.pct}% vs last month
                    </div>
                )}
            </div>
        </div>
    );
}

function SectionCard({ title, children, action }: { title: React.ReactNode; children: React.ReactNode; action?: React.ReactNode }) {
    return (
        <div className="bg-white/5 border border-white/8 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white">{title}</h2>
                {action}
            </div>
            {children}
        </div>
    );
}

const NAV_ITEMS = [
    { key: 'overview',  label: 'Overview',      icon: BarChart3 },
    { key: 'shops',     label: 'Shops',         icon: Building2 },
    { key: 'activity',  label: 'Activity',      icon: Activity },
];

// ── Main ───────────────────────────────────────────────────────────────────────
export default function AdminDashboard({
    companies, totals, chart_data, revenue_months,
    status_breakdown, top_shops, recent_activity, new_shops,
}: {
    companies: Company[]; totals: Totals;
    chart_data: ChartPoint[]; revenue_months: RevenuePoint[];
    status_breakdown: StatusPoint[]; top_shops: TopShop[];
    recent_activity: ActivityItem[]; new_shops: NewShop[];
}) {
    const { auth } = usePage<PageProps>().props;
    const [tab, setTab] = useState<'overview' | 'shops' | 'activity'>('overview');
    const revTrend = revChange(totals.revenue_this_month, totals.revenue_prev_month);
    const maxRevenue = Math.max(...top_shops.map(s => s.revenue), 1);

    function toggleCompany(id: number) {
        router.patch(route('admin.companies.toggle', id), {}, { preserveScroll: true });
    }

    const tooltipStyle = {
        backgroundColor: '#1e2130',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '10px',
        fontSize: '12px',
        color: '#fff',
    };

    return (
        <div className="min-h-screen bg-[#0f1117] flex">
            <Head title="Platform Admin — Freshio" />

            {/* ── Sidebar ──────────────────────────────────────────────────────── */}
            <aside className="fixed inset-y-0 left-0 w-56 bg-[#0a0c10] border-r border-white/5 flex flex-col z-20">
                {/* Logo */}
                <div className="px-5 py-5 border-b border-white/5">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 shrink-0">
                            <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
                                <path d="M12 2C9.5 6 7 8.5 7 12a5 5 0 0 0 10 0c0-3.5-2.5-6-5-10z" opacity="0.9"/>
                                <path d="M12 8c-1 2.5-2 4-2 5.5a2 2 0 0 0 4 0C14 12 13 10.5 12 8z" opacity="0.5"/>
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white leading-none">Fresh<span className="text-emerald-400">io</span></p>
                            <p className="text-[10px] text-white/30 mt-0.5">Super Admin</p>
                        </div>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-3 py-4 space-y-1">
                    {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
                        <button
                            key={key}
                            onClick={() => setTab(key as typeof tab)}
                            className={cn(
                                'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left',
                                tab === key
                                    ? 'bg-white/10 text-white font-medium'
                                    : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                            )}
                        >
                            <Icon className={cn('h-4 w-4 shrink-0', tab === key ? 'text-emerald-400' : '')} />
                            {label}
                        </button>
                    ))}
                </nav>

                {/* Stats summary */}
                <div className="px-4 pb-4 space-y-2 border-t border-white/5 pt-4">
                    <div className="flex justify-between text-[11px]">
                        <span className="text-white/30">Active shops</span>
                        <span className="text-white/60 font-medium">{totals.active_companies}/{totals.companies}</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                        <span className="text-white/30">Today's bookings</span>
                        <span className="text-white/60 font-medium">{totals.appointments_today}</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                        <span className="text-white/30">Cancel rate</span>
                        <span className={cn('font-medium', totals.cancellation_rate > 20 ? 'text-red-400' : 'text-white/60')}>{totals.cancellation_rate}%</span>
                    </div>
                </div>

                {/* User */}
                <div className="px-4 py-4 border-t border-white/5">
                    <div className="flex items-center gap-2.5 mb-3">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold shrink-0">
                            {(auth.user.name ?? 'A').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-medium text-white truncate">{auth.user.name}</p>
                            <p className="text-[10px] text-white/30 truncate">{auth.user.email}</p>
                        </div>
                    </div>
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="flex items-center gap-1.5 text-[11px] text-white/30 hover:text-white/60 transition-colors"
                    >
                        <LogOut className="h-3 w-3" /> Sign out
                    </Link>
                </div>
            </aside>

            {/* ── Main ─────────────────────────────────────────────────────────── */}
            <main className="ml-56 flex-1 min-h-screen">
                {/* Top bar */}
                <div className="sticky top-0 z-10 bg-[#0f1117]/90 backdrop-blur border-b border-white/5 px-8 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-sm font-semibold text-white capitalize">{tab === 'overview' ? 'Platform Overview' : tab === 'shops' ? 'All Shops' : 'Recent Activity'}</h1>
                        <p className="text-[11px] text-white/30">
                            {tab === 'overview' && `${totals.appointments.toLocaleString()} total bookings · ${formatCents(totals.revenue)} revenue`}
                            {tab === 'shops' && `${totals.companies} shops · ${totals.active_companies} active`}
                            {tab === 'activity' && `Last 30 bookings across all shops`}
                        </p>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-white/30">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                        Live
                    </div>
                </div>

                <div className="px-8 py-7 space-y-6">

                    {/* ── OVERVIEW TAB ──────────────────────────────────────── */}
                    {tab === 'overview' && (<>

                        {/* KPI row */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <KpiCard
                                label="Total Revenue"
                                value={formatCents(totals.revenue)}
                                sub={`${formatCents(totals.revenue_this_month)} this month`}
                                icon={<DollarSign className="h-4 w-4 text-white" />}
                                accent
                                trend={revTrend}
                            />
                            <KpiCard
                                label="Total Bookings"
                                value={totals.appointments.toLocaleString()}
                                sub={`${totals.appointments_today} today`}
                                icon={<CalendarDays className="h-4 w-4 text-white/60" />}
                            />
                            <KpiCard
                                label="Shops"
                                value={totals.active_companies}
                                sub={`${totals.companies} total · ${totals.companies - totals.active_companies} inactive`}
                                icon={<Building2 className="h-4 w-4 text-white/60" />}
                            />
                            <KpiCard
                                label="Customers"
                                value={totals.customers.toLocaleString()}
                                sub={`${totals.cancellation_rate}% cancellation rate`}
                                icon={<Users className="h-4 w-4 text-white/60" />}
                            />
                        </div>

                        {/* Charts row */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                            {/* Bookings 30d area chart */}
                            <div className="lg:col-span-2 bg-white/5 border border-white/8 rounded-2xl p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <p className="text-sm font-semibold text-white">Bookings</p>
                                        <p className="text-[11px] text-white/30">Last 30 days</p>
                                    </div>
                                </div>
                                <div className="h-[200px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={chart_data} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                            <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} tickLine={false} axisLine={false} interval={4} />
                                            <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} tickLine={false} axisLine={false} allowDecimals={false} />
                                            <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: 'rgba(255,255,255,0.1)' }} />
                                            <Area type="monotone" dataKey="bookings" stroke="#10b981" strokeWidth={2} fill="url(#areaGrad)" dot={false} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Revenue 6-month bar chart */}
                            <div className="bg-white/5 border border-white/8 rounded-2xl p-5">
                                <div className="mb-4">
                                    <p className="text-sm font-semibold text-white">Revenue</p>
                                    <p className="text-[11px] text-white/30">Last 6 months</p>
                                </div>
                                <div className="h-[200px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={revenue_months} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                            <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} tickLine={false} axisLine={false} />
                                            <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} tickLine={false} axisLine={false} allowDecimals={false} tickFormatter={v => `$${(v/100).toFixed(0)}`} />
                                            <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [formatCents(v), 'Revenue']} />
                                            <Bar dataKey="revenue" fill="#10b981" radius={[4,4,0,0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Top shops + status breakdown + new shops */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                            {/* Top shops bar */}
                            <SectionCard title={<>Top Shops <span className="text-white/30 font-normal">· this month</span></>}>
                                <div className="p-5 space-y-4">
                                    {top_shops.length === 0 && <p className="text-xs text-white/30 text-center py-4">No data yet.</p>}
                                    {top_shops.map((s, i) => (
                                        <div key={i}>
                                            <div className="flex items-center justify-between mb-1.5">
                                                <span className="text-xs text-white/70 truncate max-w-[130px]">{s.name}</span>
                                                <span className="text-xs font-semibold text-white">{formatCents(s.revenue)}</span>
                                            </div>
                                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-emerald-500 rounded-full"
                                                    style={{ width: `${Math.round((s.revenue / maxRevenue) * 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </SectionCard>

                            {/* Appointment status breakdown */}
                            <SectionCard title="Status Breakdown">
                                <div className="p-5 space-y-3">
                                    {status_breakdown.filter(s => s.count > 0).map(s => {
                                        const total = status_breakdown.reduce((a, b) => a + b.count, 0);
                                        const pct = total > 0 ? Math.round((s.count / total) * 100) : 0;
                                        return (
                                            <div key={s.status}>
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-[11px] text-white/60 capitalize">{s.status.replace('_', ' ')}</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[11px] text-white/30">{s.count}</span>
                                                        <span className="text-[11px] font-semibold text-white/60 w-8 text-right">{pct}%</span>
                                                    </div>
                                                </div>
                                                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full"
                                                        style={{
                                                            width: `${pct}%`,
                                                            backgroundColor: STATUS_BAR_COLORS[s.status] ?? '#64748b',
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </SectionCard>

                            {/* New shops this week */}
                            <SectionCard title={<>New Shops <span className="text-white/30 font-normal">· last 7 days</span></>}>
                                <div className="divide-y divide-white/5">
                                    {new_shops.length === 0 && (
                                        <p className="text-xs text-white/30 text-center px-5 py-8">No new shops this week.</p>
                                    )}
                                    {new_shops.map(s => (
                                        <div key={s.id} className="flex items-center gap-3 px-5 py-3 hover:bg-white/5 transition-colors">
                                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 shrink-0">
                                                <Scissors className="h-3 w-3 text-white/30" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium text-white truncate">{s.name}</p>
                                                <p className="text-[10px] text-white/30">{s.created_at}</p>
                                            </div>
                                            <span className={cn(
                                                'text-[10px] font-semibold px-1.5 py-0.5 rounded-full',
                                                s.is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-white/30'
                                            )}>
                                                {s.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </SectionCard>
                        </div>

                        {/* Recent activity preview */}
                        <SectionCard
                            title="Recent Bookings"
                            action={
                                <button onClick={() => setTab('activity')} className="text-[11px] text-emerald-400 hover:text-emerald-300 transition-colors">
                                    View all →
                                </button>
                            }
                        >
                            <div className="divide-y divide-white/5">
                                {recent_activity.slice(0, 8).map(item => (
                                    <div key={item.id} className="flex items-center gap-4 px-5 py-3 hover:bg-white/5 transition-colors">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 shrink-0">
                                            <Scissors className="h-3.5 w-3.5 text-white/20" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="text-xs font-medium text-white truncate">{item.customer}</p>
                                                <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded-full capitalize shrink-0', STATUS_COLORS[item.status] ?? 'bg-white/10 text-white/40')}>
                                                    {item.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-white/40 truncate">{item.service} · {item.company_name}</p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-[11px] text-white/40">{item.starts_at}</p>
                                            <p className="text-[10px] text-white/20">{item.created_at}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </SectionCard>
                    </>)}

                    {/* ── SHOPS TAB ─────────────────────────────────────────── */}
                    {tab === 'shops' && (
                        <div className="bg-white/5 border border-white/8 rounded-2xl overflow-hidden">
                            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                                <h2 className="text-sm font-semibold text-white">All Shops</h2>
                                <span className="text-[10px] text-white/30">{companies.length} total</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-white/5">
                                            {['SHOP', 'CONTACT', 'BARBERS', 'CUSTOMERS', 'APPTS', 'REVENUE', 'LAST BOOKING', 'STATUS', ''].map(h => (
                                                <th key={h} className={cn(
                                                    'py-3 text-[10px] font-bold tracking-wider text-white/30',
                                                    ['BARBERS','CUSTOMERS','APPTS'].includes(h) ? 'px-4 text-center' : 'px-4 text-left',
                                                    h === 'REVENUE' ? 'text-right' : '',
                                                    h === 'STATUS' ? 'text-center' : '',
                                                    h === '' ? 'w-8' : '',
                                                    h === 'SHOP' ? 'pl-6' : '',
                                                )}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {companies.map(c => (
                                            <tr key={c.id} className="hover:bg-white/5 transition-colors group">
                                                <td className="pl-6 pr-4 py-3.5">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 shrink-0">
                                                            <Scissors className="h-3 w-3 text-white/30" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-medium text-white">{c.name}</p>
                                                            <p className="text-[10px] text-white/30">Joined {c.created_at}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <p className="text-[11px] text-white/50 truncate max-w-[130px]">{c.email ?? '—'}</p>
                                                    <p className="text-[10px] text-white/30">{c.phone ?? ''}</p>
                                                </td>
                                                <td className="px-4 py-3.5 text-center">
                                                    <span className="text-xs text-white/60">{c.barbers_count}</span>
                                                </td>
                                                <td className="px-4 py-3.5 text-center">
                                                    <span className="text-xs text-white/60">{c.customers_count}</span>
                                                </td>
                                                <td className="px-4 py-3.5 text-center">
                                                    <span className="text-xs text-white/60">{c.appointments_count}</span>
                                                </td>
                                                <td className="px-4 py-3.5 text-right">
                                                    <span className="text-xs font-semibold text-white">{formatCents(c.revenue)}</span>
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <span className="text-[11px] text-white/30">{c.last_booking_at}</span>
                                                </td>
                                                <td className="px-4 py-3.5 text-center">
                                                    <button
                                                        onClick={() => toggleCompany(c.id)}
                                                        className={cn(
                                                            'inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full transition-colors',
                                                            c.is_active
                                                                ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                                                                : 'bg-white/5 text-white/30 hover:bg-white/10 hover:text-white/60'
                                                        )}
                                                    >
                                                        {c.is_active
                                                            ? <><ToggleRight className="h-3 w-3" /> Active</>
                                                            : <><ToggleLeft className="h-3 w-3" /> Inactive</>
                                                        }
                                                    </button>
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <a
                                                        href={`/book/${c.slug}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-white/20 hover:text-emerald-400 transition-colors opacity-0 group-hover:opacity-100"
                                                        title="Open booking page"
                                                    >
                                                        <ArrowUpRight className="h-3.5 w-3.5" />
                                                    </a>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* ── ACTIVITY TAB ──────────────────────────────────────── */}
                    {tab === 'activity' && (
                        <div className="bg-white/5 border border-white/8 rounded-2xl overflow-hidden">
                            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                                <h2 className="text-sm font-semibold text-white">Recent Bookings</h2>
                                <span className="text-[10px] text-white/30">Last 30</span>
                            </div>
                            <div className="divide-y divide-white/5">
                                {recent_activity.length === 0 && (
                                    <p className="text-xs text-white/30 text-center px-6 py-12">No activity yet.</p>
                                )}
                                {recent_activity.map(item => (
                                    <div key={item.id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/5 transition-colors">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 shrink-0">
                                            <Scissors className="h-4 w-4 text-white/20" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <p className="text-sm font-medium text-white">{item.customer}</p>
                                                <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded-full capitalize shrink-0', STATUS_COLORS[item.status] ?? 'bg-white/10 text-white/40')}>
                                                    {item.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <p className="text-xs text-white/40">{item.service} with {item.barber}</p>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <Building2 className="h-3 w-3 text-white/20" />
                                                <span className="text-[11px] text-white/30">{item.company_name}</span>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-xs text-white/50">{item.starts_at}</p>
                                            <p className="text-[11px] text-white/20 mt-0.5">booked {item.created_at}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
}
