import { Head, Link, router } from '@inertiajs/react';
import {
    Building2, Users, CalendarDays, DollarSign, ExternalLink,
    ToggleLeft, ToggleRight, TrendingUp, TrendingDown, Scissors,
    UserCheck, XCircle, BarChart3, ArrowUpRight,
} from 'lucide-react';
import { formatCents } from '@/lib/utils';
import { PageProps } from '@/types';
import { usePage } from '@inertiajs/react';
import { cn } from '@/lib/utils';

interface Company {
    id: number;
    name: string;
    slug: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    is_active: boolean;
    users_count: number;
    barbers_count: number;
    appointments_count: number;
    customers_count: number;
    revenue: number;
    last_booking_at: string;
}

interface Totals {
    companies: number;
    active_companies: number;
    users: number;
    appointments: number;
    appointments_today: number;
    revenue: number;
    revenue_this_month: number;
    customers: number;
    cancellation_rate: number;
}

interface SparkPoint { date: string; count: number }

interface TopShop { name: string; revenue: number }

interface ActivityItem {
    id: number;
    company_name: string;
    company_slug: string;
    customer: string;
    service: string;
    barber: string;
    status: string;
    starts_at: string;
    created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
    confirmed:   'bg-emerald-500/20 text-emerald-300',
    pending:     'bg-amber-500/20 text-amber-300',
    cancelled:   'bg-red-500/20 text-red-300',
    completed:   'bg-slate-500/20 text-slate-300',
    in_progress: 'bg-blue-500/20 text-blue-300',
    no_show:     'bg-orange-500/20 text-orange-300',
};

function Sparkline({ data }: { data: SparkPoint[] }) {
    const max = Math.max(...data.map(d => d.count), 1);
    const w = 120, h = 36, pad = 2;
    const pts = data.map((d, i) => {
        const x = pad + (i / (data.length - 1)) * (w - pad * 2);
        const y = h - pad - (d.count / max) * (h - pad * 2);
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg width={w} height={h} className="overflow-visible">
            <polyline
                points={pts}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
                strokeLinecap="round"
                className="text-emerald-400"
            />
        </svg>
    );
}

function StatCard({
    label, value, sub, icon, accent = false, sparkline,
}: {
    label: string;
    value: string | number;
    sub?: string;
    icon: React.ReactNode;
    accent?: boolean;
    sparkline?: SparkPoint[];
}) {
    return (
        <div className={cn(
            'rounded-2xl p-5 flex flex-col gap-3',
            accent ? 'bg-emerald-500' : 'bg-white/5 border border-white/10'
        )}>
            <div className="flex items-start justify-between">
                <div className={cn('flex h-9 w-9 items-center justify-center rounded-xl', accent ? 'bg-white/20' : 'bg-white/10')}>
                    {icon}
                </div>
                {sparkline && (
                    <div className="opacity-60">
                        <Sparkline data={sparkline} />
                    </div>
                )}
            </div>
            <div>
                <p className={cn('text-2xl font-bold tracking-tight', accent ? 'text-white' : 'text-white')}>{value}</p>
                <p className={cn('text-xs font-medium mt-0.5', accent ? 'text-white/80' : 'text-white/50')}>{label}</p>
                {sub && <p className={cn('text-[11px] mt-1', accent ? 'text-white/70' : 'text-white/30')}>{sub}</p>}
            </div>
        </div>
    );
}

export default function AdminDashboard({
    companies,
    totals,
    sparkline,
    top_shops,
    recent_activity,
}: {
    companies: Company[];
    totals: Totals;
    sparkline: SparkPoint[];
    top_shops: TopShop[];
    recent_activity: ActivityItem[];
}) {
    const { auth } = usePage<PageProps>().props;

    function toggleCompany(id: number) {
        router.patch(route('admin.companies.toggle', id), {}, { preserveScroll: true });
    }

    const maxRevenue = Math.max(...top_shops.map(s => s.revenue), 1);

    return (
        <div className="min-h-screen bg-[#0f1117]">
            <Head title="Platform Admin — Freshio" />

            {/* Sidebar */}
            <div className="fixed inset-y-0 left-0 w-56 bg-[#0a0c10] border-r border-white/5 flex flex-col z-20">
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
                    <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white/10 text-white text-sm font-medium">
                        <BarChart3 className="h-4 w-4 text-emerald-400" />
                        Overview
                    </div>
                    <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-white/40 text-sm hover:text-white/70 cursor-default transition-colors">
                        <Building2 className="h-4 w-4" />
                        Shops
                    </div>
                    <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-white/40 text-sm hover:text-white/70 cursor-default transition-colors">
                        <Users className="h-4 w-4" />
                        Users
                    </div>
                    <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-white/40 text-sm hover:text-white/70 cursor-default transition-colors">
                        <CalendarDays className="h-4 w-4" />
                        Appointments
                    </div>
                </nav>

                {/* User */}
                <div className="px-4 py-4 border-t border-white/5">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold shrink-0">
                            {auth.user.name?.charAt(0).toUpperCase()}
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
                        className="mt-3 w-full text-left text-[11px] text-white/30 hover:text-white/60 transition-colors"
                    >
                        Sign out
                    </Link>
                </div>
            </div>

            {/* Main content */}
            <div className="ml-56 min-h-screen">
                {/* Top bar */}
                <div className="sticky top-0 z-10 bg-[#0f1117]/80 backdrop-blur border-b border-white/5 px-8 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-base font-semibold text-white">Platform Overview</h1>
                        <p className="text-xs text-white/30">All shops · all time</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-white/30">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Live
                    </div>
                </div>

                <div className="px-8 py-7 space-y-8">

                    {/* KPI grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard
                            label="Total Revenue"
                            value={formatCents(totals.revenue)}
                            sub={`${formatCents(totals.revenue_this_month)} this month`}
                            icon={<DollarSign className="h-4 w-4 text-emerald-400" />}
                            accent
                        />
                        <StatCard
                            label="Bookings"
                            value={totals.appointments.toLocaleString()}
                            sub={`${totals.appointments_today} today`}
                            icon={<CalendarDays className="h-4 w-4 text-white/60" />}
                            sparkline={sparkline}
                        />
                        <StatCard
                            label="Active Shops"
                            value={`${totals.active_companies} / ${totals.companies}`}
                            sub={`${totals.companies - totals.active_companies} inactive`}
                            icon={<Building2 className="h-4 w-4 text-white/60" />}
                        />
                        <StatCard
                            label="Customers"
                            value={totals.customers.toLocaleString()}
                            sub={`${totals.cancellation_rate}% cancellation rate`}
                            icon={<UserCheck className="h-4 w-4 text-white/60" />}
                        />
                    </div>

                    {/* Middle row: Top shops bar chart + Activity feed */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Top shops by revenue */}
                        <div className="lg:col-span-1 bg-white/5 border border-white/10 rounded-2xl p-5">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-sm font-semibold text-white">Top Shops <span className="text-white/30 font-normal">· this month</span></h2>
                                <TrendingUp className="h-4 w-4 text-white/20" />
                            </div>
                            {top_shops.length === 0 && (
                                <p className="text-xs text-white/30 text-center py-6">No data yet.</p>
                            )}
                            <div className="space-y-4">
                                {top_shops.map((s, i) => (
                                    <div key={i}>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs text-white/70 truncate max-w-[140px]">{s.name}</span>
                                            <span className="text-xs font-semibold text-white">{formatCents(s.revenue)}</span>
                                        </div>
                                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-emerald-500 rounded-full transition-all"
                                                style={{ width: `${Math.round((s.revenue / maxRevenue) * 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent activity */}
                        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                            <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
                                <h2 className="text-sm font-semibold text-white">Recent Bookings</h2>
                                <span className="text-[10px] text-white/30">Last 25</span>
                            </div>
                            <div className="overflow-y-auto max-h-[340px] divide-y divide-white/5">
                                {recent_activity.length === 0 && (
                                    <p className="text-xs text-white/30 px-5 py-8 text-center">No activity yet.</p>
                                )}
                                {recent_activity.map(item => (
                                    <div key={item.id} className="flex items-center gap-4 px-5 py-3 hover:bg-white/5 transition-colors">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 shrink-0">
                                            <Scissors className="h-3.5 w-3.5 text-white/30" />
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
                        </div>
                    </div>

                    {/* Shops table */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-white">All Shops</h2>
                            <span className="text-[10px] text-white/30">{companies.length} total</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-white/5">
                                        <th className="text-left px-6 py-3 text-[10px] font-bold tracking-wider text-white/30">SHOP</th>
                                        <th className="text-center px-4 py-3 text-[10px] font-bold tracking-wider text-white/30">BARBERS</th>
                                        <th className="text-center px-4 py-3 text-[10px] font-bold tracking-wider text-white/30">CUSTOMERS</th>
                                        <th className="text-center px-4 py-3 text-[10px] font-bold tracking-wider text-white/30">APPTS</th>
                                        <th className="text-right px-4 py-3 text-[10px] font-bold tracking-wider text-white/30">REVENUE</th>
                                        <th className="text-left px-4 py-3 text-[10px] font-bold tracking-wider text-white/30">LAST BOOKING</th>
                                        <th className="text-center px-4 py-3 text-[10px] font-bold tracking-wider text-white/30">STATUS</th>
                                        <th className="px-4 py-3 w-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {companies.map(c => (
                                        <tr key={c.id} className="hover:bg-white/5 transition-colors group">
                                            <td className="px-6 py-3.5">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 shrink-0">
                                                        <Scissors className="h-3 w-3 text-white/30" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-medium text-white">{c.name}</p>
                                                        <p className="text-[11px] text-white/30">{c.email ?? c.address ?? '—'}</p>
                                                    </div>
                                                </div>
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
                                                            : 'bg-white/5 text-white/30 hover:bg-white/10'
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
                                                    className="text-white/20 hover:text-white/60 transition-colors opacity-0 group-hover:opacity-100"
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

                </div>
            </div>
        </div>
    );
}
