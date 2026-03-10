import { Head, Link, router } from '@inertiajs/react';
import { Building2, Users, CalendarDays, DollarSign, ExternalLink, Activity, ToggleLeft, ToggleRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    revenue: number;
}

interface Totals {
    companies: number;
    users: number;
    appointments: number;
    revenue: number;
}

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
    confirmed:   'bg-emerald-50 text-emerald-700',
    pending:     'bg-amber-50 text-amber-700',
    cancelled:   'bg-red-50 text-red-600',
    completed:   'bg-slate-100 text-slate-600',
    in_progress: 'bg-blue-50 text-blue-700',
    no_show:     'bg-orange-50 text-orange-700',
};

function KpiCard({ title, value, icon }: { title: string; value: string | number; icon: React.ReactNode }) {
    return (
        <Card className="border-slate-200 shadow-none">
            <CardContent className="p-5">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-muted-foreground">{title}</p>
                        <p className="text-2xl font-semibold tracking-tight mt-0.5">{value}</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-2.5">{icon}</div>
                </div>
            </CardContent>
        </Card>
    );
}

export default function AdminDashboard({
    companies,
    totals,
    recent_activity,
}: {
    companies: Company[];
    totals: Totals;
    recent_activity: ActivityItem[];
}) {
    const { auth } = usePage<PageProps>().props;

    function toggleCompany(id: number) {
        router.patch(route('admin.companies.toggle', id), {}, { preserveScroll: true });
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <Head title="Platform Admin" />

            {/* Top bar */}
            <div className="bg-slate-900 text-white">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600">
                            <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
                                <path d="M12 2C9.5 6 7 8.5 7 12a5 5 0 0 0 10 0c0-3.5-2.5-6-5-10z" opacity="0.9"/>
                                <path d="M12 8c-1 2.5-2 4-2 5.5a2 2 0 0 0 4 0C14 12 13 10.5 12 8z" opacity="0.5"/>
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white">Fresh<span className="text-emerald-400">io</span></p>
                            <p className="text-[11px] text-white/50">Platform Admin</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-white/60">{auth.user.email}</span>
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="text-xs text-white/60 hover:text-white transition-colors"
                        >
                            Log out
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">

                {/* KPI row */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <KpiCard title="Total Shops" value={totals.companies} icon={<Building2 className="h-5 w-5 text-muted-foreground" />} />
                    <KpiCard title="Total Users" value={totals.users} icon={<Users className="h-5 w-5 text-muted-foreground" />} />
                    <KpiCard title="Total Appointments" value={totals.appointments} icon={<CalendarDays className="h-5 w-5 text-muted-foreground" />} />
                    <KpiCard title="Total Revenue" value={formatCents(totals.revenue)} icon={<DollarSign className="h-5 w-5 text-muted-foreground" />} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Companies table */}
                    <div className="lg:col-span-2">
                        <Card className="border-slate-200 shadow-none">
                            <CardHeader className="px-6 pb-3">
                                <CardTitle className="text-base">Shops</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-slate-100">
                                                <th className="text-left px-6 py-3 text-[10px] font-bold tracking-wider text-slate-400">SHOP</th>
                                                <th className="text-center px-4 py-3 text-[10px] font-bold tracking-wider text-slate-400">BARBERS</th>
                                                <th className="text-center px-4 py-3 text-[10px] font-bold tracking-wider text-slate-400">APPTS</th>
                                                <th className="text-right px-4 py-3 text-[10px] font-bold tracking-wider text-slate-400">REVENUE</th>
                                                <th className="text-center px-4 py-3 text-[10px] font-bold tracking-wider text-slate-400">STATUS</th>
                                                <th className="px-4 py-3"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {companies.map(c => (
                                                <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-6 py-3">
                                                        <p className="font-medium text-slate-900">{c.name}</p>
                                                        <p className="text-xs text-slate-400">{c.email ?? c.address ?? '—'}</p>
                                                    </td>
                                                    <td className="px-4 py-3 text-center text-slate-600">{c.barbers_count}</td>
                                                    <td className="px-4 py-3 text-center text-slate-600">{c.appointments_count}</td>
                                                    <td className="px-4 py-3 text-right font-medium text-slate-900">{formatCents(c.revenue)}</td>
                                                    <td className="px-4 py-3 text-center">
                                                        <button
                                                            onClick={() => toggleCompany(c.id)}
                                                            className={cn(
                                                                'inline-flex items-center gap-1 text-xs font-medium transition-colors',
                                                                c.is_active
                                                                    ? 'text-emerald-600 hover:text-emerald-800'
                                                                    : 'text-slate-400 hover:text-slate-600'
                                                            )}
                                                            title={c.is_active ? 'Click to deactivate' : 'Click to activate'}
                                                        >
                                                            {c.is_active
                                                                ? <><ToggleRight className="h-4 w-4" /> Active</>
                                                                : <><ToggleLeft className="h-4 w-4" /> Inactive</>
                                                            }
                                                        </button>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <a
                                                            href={`/book/${c.slug}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-slate-400 hover:text-slate-700 transition-colors"
                                                            title="View booking page"
                                                        >
                                                            <ExternalLink className="h-4 w-4" />
                                                        </a>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recent activity feed */}
                    <div>
                        <Card className="border-slate-200 shadow-none">
                            <CardHeader className="px-5 pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Activity className="h-4 w-4 text-slate-400" /> Recent Activity
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-slate-100 max-h-[480px] overflow-y-auto">
                                    {recent_activity.length === 0 && (
                                        <p className="text-xs text-slate-400 px-5 py-6 text-center">No recent activity.</p>
                                    )}
                                    {recent_activity.map(item => (
                                        <div key={item.id} className="px-5 py-3 hover:bg-slate-50/50 transition-colors">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0">
                                                    <p className="text-xs font-medium text-slate-900 truncate">{item.customer}</p>
                                                    <p className="text-[11px] text-slate-500 truncate">{item.service} · {item.company_name}</p>
                                                    <p className="text-[11px] text-slate-400 mt-0.5">{item.starts_at}</p>
                                                </div>
                                                <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 capitalize', STATUS_COLORS[item.status] ?? 'bg-slate-100 text-slate-500')}>
                                                    {item.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-slate-300 mt-1">{item.created_at}</p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

            </div>
        </div>
    );
}
