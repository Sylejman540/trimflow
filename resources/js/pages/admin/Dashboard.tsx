import { Head, Link } from '@inertiajs/react';
import { Building2, Users, CalendarDays, DollarSign, CheckCircle2, XCircle, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCents } from '@/lib/utils';
import { PageProps } from '@/types';
import { usePage } from '@inertiajs/react';

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

export default function AdminDashboard({ companies, totals }: { companies: Company[]; totals: Totals }) {
    const { auth } = usePage<PageProps>().props;

    return (
        <div className="min-h-screen bg-slate-50">
            <Head title="Platform Admin" />

            {/* Top bar */}
            <div className="bg-slate-900 text-white">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-slate-900 font-bold text-sm">T</div>
                        <div>
                            <p className="text-sm font-bold text-white">Freshio</p>
                            <p className="text-[11px] text-white/50">Super Admin</p>
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

                {/* Companies table */}
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
                                        <th className="text-left px-4 py-3 text-[10px] font-bold tracking-wider text-slate-400">CONTACT</th>
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
                                                <p className="text-xs text-slate-400">{c.address ?? '—'}</p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="text-slate-600">{c.email ?? '—'}</p>
                                                <p className="text-xs text-slate-400">{c.phone ?? '—'}</p>
                                            </td>
                                            <td className="px-4 py-3 text-center text-slate-600">{c.barbers_count}</td>
                                            <td className="px-4 py-3 text-center text-slate-600">{c.appointments_count}</td>
                                            <td className="px-4 py-3 text-right font-medium text-slate-900">{formatCents(c.revenue)}</td>
                                            <td className="px-4 py-3 text-center">
                                                {c.is_active
                                                    ? <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-medium"><CheckCircle2 className="h-3.5 w-3.5" /> Active</span>
                                                    : <span className="inline-flex items-center gap-1 text-slate-400 text-xs font-medium"><XCircle className="h-3.5 w-3.5" /> Inactive</span>
                                                }
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
        </div>
    );
}
