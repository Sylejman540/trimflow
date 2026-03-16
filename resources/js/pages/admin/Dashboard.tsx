import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Building2, Users, CalendarDays, DollarSign,
    ToggleLeft, ToggleRight, ArrowUpRight, TrendingUp, TrendingDown,
    Scissors, BarChart3, Activity, Menu, X,
    LogOut,
} from 'lucide-react';
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer,
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
// Nav items built inside component to support i18n

const STATUS_COLORS: Record<string, string> = {
    confirmed:   'bg-emerald-50 text-emerald-700',
    pending:     'bg-amber-50 text-amber-700',
    cancelled:   'bg-red-50 text-red-600',
    completed:   'bg-slate-100 text-slate-600',
    in_progress: 'bg-blue-50 text-blue-700',
    no_show:     'bg-orange-50 text-orange-700',
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
            'rounded-2xl p-4 lg:p-5 flex flex-col gap-3 lg:gap-4',
            accent ? 'bg-slate-900' : 'bg-white border border-slate-100 shadow-sm'
        )}>
            <div className={cn('flex h-8 w-8 lg:h-9 lg:w-9 items-center justify-center rounded-xl', accent ? 'bg-white/10' : 'bg-slate-50')}>
                {icon}
            </div>
            <div>
                <p className={cn('text-xl lg:text-2xl font-bold tracking-tight', accent ? 'text-white' : 'text-slate-900')}>{value}</p>
                <p className={cn('text-xs font-medium mt-0.5', accent ? 'text-white/70' : 'text-slate-500')}>{label}</p>
                {sub && !trend && <p className={cn('text-[11px] mt-0.5', accent ? 'text-white/40' : 'text-slate-400')}>{sub}</p>}
                {trend && (
                    <div className={cn('flex items-center gap-1 text-[11px] font-semibold mt-1', trend.up ? 'text-blue-600' : 'text-red-500')}>
                        {trend.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {trend.pct}%
                    </div>
                )}
            </div>
        </div>
    );
}

function SectionCard({ title, children, action }: { title: React.ReactNode; children: React.ReactNode; action?: React.ReactNode }) {
    return (
        <div className="bg-white border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
            <div className="px-4 lg:px-5 py-3 lg:py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
                {action}
            </div>
            {children}
        </div>
    );
}


const tooltipStyle = {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '12px',
    color: '#0f172a',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07)',
};

// ── Sidebar content (shared between desktop & mobile drawer) ──────────────────
function SidebarContent({
    tab, setTab, totals, auth, onNavClick,
}: {
    tab: string;
    setTab: (t: 'overview' | 'shops' | 'activity') => void;
    totals: Totals;
    auth: PageProps['auth'];
    onNavClick?: () => void;
}) {
    const { t } = useTranslation();
    const NAV_ITEMS: { key: 'overview' | 'shops' | 'activity'; label: string; icon: typeof BarChart3 }[] = [
        { key: 'overview',  label: t('admin.overview'),  icon: BarChart3 },
        { key: 'shops',     label: t('admin.shops'),     icon: Building2 },
        { key: 'activity',  label: t('admin.activity'),  icon: Activity  },
    ];
    return (
        <>
            {/* Logo */}
            <div className="px-5 py-5 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 shrink-0">
                        <Scissors className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-white leading-none">Fade</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{t('admin.superAdmin')}</p>
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 space-y-1">
                {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
                    <button
                        key={key}
                        onClick={() => { setTab(key); onNavClick?.(); }}
                        className={cn(
                            'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left',
                            tab === key
                                ? 'bg-white/10 text-white font-medium'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                        )}
                    >
                        <Icon className={cn('h-4 w-4 shrink-0', tab === key ? 'text-emerald-400' : '')} />
                        {label}
                    </button>
                ))}
            </nav>

            {/* Stats summary */}
            <div className="px-4 pb-4 space-y-2 border-t border-slate-800 pt-4">
                <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">{t('admin.activeShopsLabel')}</span>
                    <span className="text-slate-300 font-medium">{totals.active_companies}/{totals.companies}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">{t('admin.todayBookings')}</span>
                    <span className="text-slate-300 font-medium">{totals.appointments_today}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">{t('admin.cancelRate')}</span>
                    <span className={cn('font-medium', totals.cancellation_rate > 20 ? 'text-red-400' : 'text-slate-300')}>{totals.cancellation_rate}%</span>
                </div>
            </div>

            {/* User */}
            <div className="px-4 py-4 border-t border-slate-800">
                <div className="flex items-center gap-2.5 mb-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold shrink-0">
                        {(auth.user.name ?? 'A').charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-medium text-white truncate">{auth.user.name}</p>
                        <p className="text-[10px] text-slate-500 truncate">{auth.user.email}</p>
                    </div>
                </div>
                <Link
                    href={route('logout')}
                    method="post"
                    as="button"
                    className="flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-slate-300 transition-colors"
                >
                    <LogOut className="h-3 w-3" /> {t('admin.signOut')}
                </Link>
            </div>
        </>
    );
}

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
    const { t } = useTranslation();
    const [tab, setTab] = useState<'overview' | 'shops' | 'activity'>('overview');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const revTrend = revChange(totals.revenue_this_month, totals.revenue_prev_month);
    const maxRevenue = Math.max(...top_shops.map(s => s.revenue), 1);

    function toggleCompany(id: number) {
        router.patch(route('admin.companies.toggle', id), {}, { preserveScroll: true });
    }

    const tabTitle = tab === 'overview' ? t('admin.platformOverview') : tab === 'shops' ? t('admin.allShops') : t('admin.recentActivity');
    const tabSub = tab === 'overview'
        ? `${totals.appointments.toLocaleString()} ${t('admin.totalBookings')} · ${formatCents(totals.revenue)} ${t('admin.totalRevenue')}`
        : tab === 'shops'
        ? `${totals.companies} ${t('admin.shops')} · ${totals.active_companies} ${t('admin.activeShopsLabel')}`
        : t('admin.last30');

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <Head title={t('admin.title')} />

            {/* ── Mobile overlay ────────────────────────────────────────────── */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* ── Desktop sidebar (fixed) ───────────────────────────────────── */}
            <aside className="hidden lg:flex fixed inset-y-0 left-0 w-56 bg-slate-900 border-r border-slate-800 flex-col z-20">
                <SidebarContent tab={tab} setTab={setTab} totals={totals} auth={auth} />
            </aside>

            {/* ── Mobile sidebar (drawer) ───────────────────────────────────── */}
            <aside className={cn(
                'fixed inset-y-0 left-0 w-64 bg-slate-900 border-r border-slate-800 flex flex-col z-40 transition-transform duration-200 lg:hidden',
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            )}>
                <div className="absolute top-4 right-4">
                    <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-white">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <SidebarContent tab={tab} setTab={setTab} totals={totals} auth={auth} onNavClick={() => setSidebarOpen(false)} />
            </aside>

            {/* ── Main ──────────────────────────────────────────────────────── */}
            <main className="lg:ml-56 flex-1 min-h-screen w-full">
                {/* Top bar */}
                <div className="sticky top-0 z-10 bg-white border-b border-slate-100 px-4 lg:px-8 py-3 lg:py-4 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                        {/* Hamburger (mobile only) */}
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden text-slate-500 hover:text-slate-900 mr-1"
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                        <div>
                            <h1 className="text-sm font-semibold text-slate-900">{tabTitle}</h1>
                            <p className="text-[11px] text-slate-400 hidden sm:block">{tabSub}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                        {t('admin.live')}
                    </div>
                </div>

                <div className="px-4 lg:px-8 py-5 lg:py-7 space-y-5 lg:space-y-6">

                    {/* ── OVERVIEW TAB ──────────────────────────────────────── */}
                    {tab === 'overview' && (<>

                        {/* KPI row */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                            <KpiCard
                                label={t('admin.totalRevenue')}
                                value={formatCents(totals.revenue)}
                                sub={`${formatCents(totals.revenue_this_month)} ${t('admin.vsLastMonth')}`}
                                icon={<DollarSign className="h-4 w-4 text-white" />}
                                accent
                                trend={revTrend}
                            />
                            <KpiCard
                                label={t('admin.totalBookings')}
                                value={totals.appointments.toLocaleString()}
                                sub={`${totals.appointments_today} ${t('admin.today')}`}
                                icon={<CalendarDays className="h-4 w-4 text-slate-400" />}
                            />
                            <KpiCard
                                label={t('admin.activeShops')}
                                value={totals.active_companies}
                                sub={`${totals.companies} ${t('admin.total')} · ${totals.companies - totals.active_companies} ${t('admin.inactiveLabel')}`}
                                icon={<Building2 className="h-4 w-4 text-slate-400" />}
                            />
                            <KpiCard
                                label={t('admin.customers')}
                                value={totals.customers.toLocaleString()}
                                sub={`${totals.cancellation_rate}% ${t('admin.cancelRate')}`}
                                icon={<Users className="h-4 w-4 text-slate-400" />}
                            />
                        </div>

                        {/* Charts row */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5">
                            {/* Bookings 30d */}
                            <div className="lg:col-span-2">
                                <SectionCard title={<>{t('admin.bookings30d')}</>}>
                                    <div className="p-4 lg:p-5 pb-3">
                                        <div className="h-[180px] lg:h-[200px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={chart_data} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                                                    <defs>
                                                        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%"  stopColor="#10b981" stopOpacity={0.2} />
                                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} interval={4} />
                                                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} allowDecimals={false} />
                                                    <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: '#e2e8f0' }} />
                                                    <Area type="monotone" dataKey="bookings" stroke="#10b981" strokeWidth={2} fill="url(#areaGrad)" dot={false} />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </SectionCard>
                            </div>

                            {/* Revenue 6-month */}
                            <SectionCard title={<>{t('admin.revenue6m')}</>}>
                                <div className="p-4 lg:p-5 pb-3">
                                    <div className="h-[180px] lg:h-[200px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={revenue_months} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                                                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} allowDecimals={false} tickFormatter={v => `$${(v/100).toFixed(0)}`} />
                                                <Tooltip contentStyle={tooltipStyle} formatter={(v) => [formatCents(v as number), t('admin.totalRevenue')]} />
                                                <Bar dataKey="revenue" fill="#0f172a" radius={[4,4,0,0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </SectionCard>
                        </div>

                        {/* Top shops + status + new shops + recent */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
                            {/* Top shops */}
                            <SectionCard title={<>{t('admin.topShops')}</>}>
                                <div className="p-4 lg:p-5 space-y-4">
                                    {top_shops.length === 0 && <p className="text-xs text-slate-400 text-center py-4">{t('admin.noData')}</p>}
                                    {top_shops.map((s, i) => (
                                        <div key={i}>
                                            <div className="flex items-center justify-between mb-1.5">
                                                <span className="text-xs text-slate-600 truncate max-w-[130px]">{s.name}</span>
                                                <span className="text-xs font-semibold text-slate-900">{formatCents(s.revenue)}</span>
                                            </div>
                                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-slate-900 rounded-full" style={{ width: `${Math.round((s.revenue / maxRevenue) * 100)}%` }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </SectionCard>

                            {/* Status breakdown */}
                            <SectionCard title={t('admin.statusBreakdown')}>
                                <div className="p-4 lg:p-5 space-y-3">
                                    {status_breakdown.filter(s => s.count > 0).map(s => {
                                        const total = status_breakdown.reduce((a, b) => a + b.count, 0);
                                        const pct = total > 0 ? Math.round((s.count / total) * 100) : 0;
                                        return (
                                            <div key={s.status}>
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-[11px] text-slate-600 capitalize">{s.status.replace('_', ' ')}</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[11px] text-slate-400">{s.count}</span>
                                                        <span className="text-[11px] font-semibold text-slate-500 w-8 text-right">{pct}%</span>
                                                    </div>
                                                </div>
                                                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: STATUS_BAR_COLORS[s.status] ?? '#64748b' }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </SectionCard>

                            {/* New shops */}
                            <SectionCard title={<>{t('admin.newShops')}</>}>
                                <div className="divide-y divide-slate-100">
                                    {new_shops.length === 0 && (
                                        <p className="text-xs text-slate-400 text-center px-5 py-8">{t('admin.noNewShops')}</p>
                                    )}
                                    {new_shops.map(s => (
                                        <div key={s.id} className="flex items-center gap-3 px-4 lg:px-5 py-3 hover:bg-slate-50 transition-colors">
                                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 shrink-0">
                                                <Scissors className="h-3 w-3 text-slate-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium text-slate-800 truncate">{s.name}</p>
                                                <p className="text-[10px] text-slate-400">{s.created_at}</p>
                                            </div>
                                            <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0', s.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500')}>
                                                {s.is_active ? t('admin.activeShopsLabel') : t('admin.inactiveLabel')}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </SectionCard>
                        </div>

                        {/* Recent bookings preview */}
                        <SectionCard
                            title={t('admin.recentBookings')}
                            action={
                                <button onClick={() => setTab('activity')} className="text-[11px] text-slate-500 hover:text-slate-900 transition-colors">
                                    {t('admin.viewAll')}
                                </button>
                            }
                        >
                            <div className="divide-y divide-slate-100">
                                {recent_activity.slice(0, 6).map(item => (
                                    <div key={item.id} className="flex items-center gap-3 px-4 lg:px-5 py-3 hover:bg-slate-50 transition-colors">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="text-xs font-medium text-slate-800 truncate">{item.customer}</p>
                                                <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded-full capitalize shrink-0', STATUS_COLORS[item.status] ?? 'bg-slate-100 text-slate-500')}>
                                                    {item.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-slate-400 truncate">{item.service} · {item.company_name}</p>
                                        </div>
                                        <p className="text-[11px] text-slate-400 shrink-0 hidden sm:block">{item.starts_at}</p>
                                    </div>
                                ))}
                            </div>
                        </SectionCard>
                    </>)}

                    {/* ── SHOPS TAB ─────────────────────────────────────────── */}
                    {tab === 'shops' && (
                        <div className="bg-white border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
                            <div className="px-4 lg:px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                                <h2 className="text-sm font-semibold text-slate-900">{t('admin.allShops')}</h2>
                                <span className="text-[10px] text-slate-400">{companies.length} {t('admin.total')}</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm min-w-[600px]">
                                    <thead>
                                        <tr className="border-b border-slate-100 bg-slate-50">
                                            {['SHOP', 'CONTACT', 'BARBERS', 'APPTS', 'REVENUE', 'LAST BOOKING', 'STATUS', ''].map(h => (
                                                <th key={h} className={cn(
                                                    'py-3 text-[10px] font-bold tracking-wider text-slate-400',
                                                    ['BARBERS','APPTS'].includes(h) ? 'px-3 text-center' : 'px-3 text-left',
                                                    h === 'REVENUE' ? 'text-right' : '',
                                                    h === 'STATUS' ? 'text-center' : '',
                                                    h === '' ? 'w-8' : '',
                                                    h === 'SHOP' ? 'pl-4 lg:pl-6' : '',
                                                )}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {companies.map(c => (
                                            <tr key={c.id} className="hover:bg-slate-50 transition-colors group">
                                                <td className="pl-4 lg:pl-6 pr-3 py-3.5">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 shrink-0">
                                                            <Scissors className="h-3 w-3 text-slate-400" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-medium text-slate-800">{c.name}</p>
                                                            <p className="text-[10px] text-slate-400">{t('admin.joined')} {c.created_at}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-3 py-3.5">
                                                    <p className="text-[11px] text-slate-500 truncate max-w-[120px]">{c.email ?? '—'}</p>
                                                </td>
                                                <td className="px-3 py-3.5 text-center">
                                                    <span className="text-xs text-slate-600">{c.barbers_count}</span>
                                                </td>
                                                <td className="px-3 py-3.5 text-center">
                                                    <span className="text-xs text-slate-600">{c.appointments_count}</span>
                                                </td>
                                                <td className="px-3 py-3.5 text-right">
                                                    <span className="text-xs font-semibold text-slate-900">{formatCents(c.revenue)}</span>
                                                </td>
                                                <td className="px-3 py-3.5">
                                                    <span className="text-[11px] text-slate-400">{c.last_booking_at}</span>
                                                </td>
                                                <td className="px-3 py-3.5 text-center">
                                                    <button
                                                        onClick={() => toggleCompany(c.id)}
                                                        className={cn(
                                                            'inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full transition-colors',
                                                            c.is_active
                                                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                                        )}
                                                    >
                                                        {c.is_active
                                                            ? <><ToggleRight className="h-3 w-3" /> {t('admin.activeShopsLabel')}</>
                                                            : <><ToggleLeft className="h-3 w-3" /> {t('admin.inactiveLabel')}</>
                                                        }
                                                    </button>
                                                </td>
                                                <td className="px-3 py-3.5">
                                                    <a
                                                        href={`/book/${c.slug}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-slate-300 hover:text-slate-700 transition-colors opacity-0 group-hover:opacity-100"
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
                        <div className="bg-white border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
                            <div className="px-4 lg:px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                                <h2 className="text-sm font-semibold text-slate-900">{t('admin.recentBookings')}</h2>
                                <span className="text-[10px] text-slate-400">{t('admin.last30')}</span>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {recent_activity.length === 0 && (
                                    <p className="text-xs text-slate-400 text-center px-6 py-12">{t('admin.noActivity')}</p>
                                )}
                                {recent_activity.map(item => (
                                    <div key={item.id} className="flex items-center gap-3 lg:gap-4 px-4 lg:px-6 py-3 lg:py-4 hover:bg-slate-50 transition-colors">
                                        <div className="flex h-8 w-8 lg:h-9 lg:w-9 items-center justify-center rounded-xl bg-slate-100 shrink-0">
                                            <Scissors className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-slate-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <p className="text-sm font-medium text-slate-800">{item.customer}</p>
                                                <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded-full capitalize shrink-0', STATUS_COLORS[item.status] ?? 'bg-slate-100 text-slate-500')}>
                                                    {item.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500">{item.service} {t('admin.with')} {item.barber}</p>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <Building2 className="h-3 w-3 text-slate-300" />
                                                <span className="text-[11px] text-slate-400">{item.company_name}</span>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0 hidden sm:block">
                                            <p className="text-xs text-slate-500">{item.starts_at}</p>
                                            <p className="text-[11px] text-slate-400 mt-0.5">{t('admin.booked')} {item.created_at}</p>
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
