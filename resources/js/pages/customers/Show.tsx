import { Head, Link } from '@inertiajs/react';
import { 
    ChevronLeft, Star, CalendarDays, Edit, Phone, Mail, 
    MapPin, Wallet, Award, History, ClipboardList, Scissors 
} from 'lucide-react';
import AppLayout from '@/layouts/AppLayout';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { formatCents, cn } from '@/lib/utils';
import { Customer, Appointment } from '@/types';

function tierClass(tier?: string) {
    switch (tier) {
        case 'Gold':   return 'bg-amber-50 text-amber-700 border-amber-200';
        case 'Silver': return 'bg-slate-100 text-slate-600 border-slate-200';
        case 'Bronze': return 'bg-orange-50 text-orange-700 border-orange-200';
        default:       return 'bg-slate-50 text-slate-500 border-slate-100';
    }
}

function statusVariant(status: string) {
    const map: Record<string, string> = {
        scheduled:   'bg-blue-50 text-blue-600 border-blue-100',
        confirmed:   'bg-emerald-50 text-emerald-700 border-emerald-100',
        in_progress: 'bg-amber-50 text-amber-700 border-amber-100',
        completed:   'bg-[#637060]/10 text-[#637060] border-[#637060]/20',
        cancelled:   'bg-red-50 text-red-600 border-red-100',
        no_show:     'bg-slate-50 text-slate-600 border-slate-100',
    };
    return map[status] ?? 'bg-slate-50 text-slate-500 border-slate-100';
}

function formatDate(d: string) {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateTime(d: string) {
    return new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export default function Show({
    customer,
    appointments,
}: {
    customer: Customer & { loyalty_tier: string; visit_count: number };
    appointments: Appointment[];
}) {
    const completedAppts = appointments.filter(a => a.status === 'completed');
    const upcomingAppts  = appointments.filter(a => ['scheduled', 'confirmed'].includes(a.status));
    const totalSpend     = completedAppts.reduce((sum, a) => sum + a.price, 0);

    return (
        <AppLayout title={customer.name}>
            <Head title={customer.name} />

            <div className="max-w-5xl mx-auto space-y-10 pb-12 mt-4">
                
                {/* Header & Quick Actions */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#637060]">
                                Profile Management
                            </span>
                            <span className="h-px w-8 bg-[#637060]/20" />
                            <Badge className={cn('text-[9px] font-bold tracking-[0.2em] uppercase rounded-md px-2 py-0.5 shadow-none border', tierClass(customer.loyalty_tier))}>
                                {customer.loyalty_tier}
                            </Badge>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-light tracking-tighter text-slate-900 leading-[0.9]">
                            {customer.name.split(' ')[0]} <br />
                            <span className="font-serif italic text-[#637060]/60">{customer.name.split(' ').slice(1).join(' ')}</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href={route('customers.edit', customer.id)}
                            className={cn(buttonVariants({ variant: 'outline' }), 'h-10 px-6 rounded-lg text-xs font-bold border-slate-200 shadow-sm transition-all hover:bg-slate-50')}
                        >
                            <Edit className="mr-2 h-3.5 w-3.5" /> Edit Profile
                        </Link>
                        <Link
                            href={route('customers.index')}
                            className={cn(buttonVariants({ variant: 'ghost' }), 'h-10 px-4 rounded-lg text-xs font-bold text-slate-500')}
                        >
                            <ChevronLeft className="mr-1 h-3.5 w-3.5" /> Back
                        </Link>
                    </div>
                </div>

                {/* Info Cards Grid */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 px-2">
                    {/* Contact Details */}
                    <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
                             Contact & Preferences
                        </h3>
                        <div className="grid sm:grid-cols-2 gap-y-4 gap-x-8">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-sm text-slate-600">
                                    <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                                        <Mail size={14} />
                                    </div>
                                    <span className="truncate">{customer.email || 'No email provided'}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-slate-600">
                                    <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                                        <Phone size={14} />
                                    </div>
                                    <span>{customer.phone || 'No phone provided'}</span>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-sm text-slate-600">
                                    <div className="h-8 w-8 rounded-lg bg-[#637060]/5 flex items-center justify-center text-amber-500">
                                        <Star size={14} className="fill-current" />
                                    </div>
                                    <span>{customer.favorite_barber?.user?.name || 'No preferred barber'}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-slate-600">
                                    <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                                        <MapPin size={14} />
                                    </div>
                                    <span className="truncate">{customer.address || 'No address'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Loyalty Points */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm group">
                        <div className="flex justify-between items-start mb-4">
                             <div className="p-2.5 bg-slate-50 rounded-xl group-hover:bg-[#637060]/5 transition-colors text-[#637060]">
                                <Award size={18} className="opacity-70" />
                             </div>
                        </div>
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">Loyalty Points</h3>
                        <p className="text-3xl font-light tracking-tighter text-slate-900">{customer.loyalty_points}</p>
                        <p className="text-[9px] font-bold uppercase text-slate-400 mt-2">{customer.visit_count} completed visits</p>
                    </div>

                    {/* Total Spend */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm group">
                        <div className="flex justify-between items-start mb-4">
                             <div className="p-2.5 bg-slate-50 rounded-xl group-hover:bg-[#637060]/5 transition-colors text-[#637060]">
                                <Wallet size={18} className="opacity-70" />
                             </div>
                        </div>
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">Total Lifetime</h3>
                        <p className="text-3xl font-light tracking-tighter text-slate-900">{formatCents(totalSpend)}</p>
                        <p className="text-[9px] font-bold uppercase text-slate-400 mt-2">Member since {formatDate(customer.created_at)}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-2">
                    {/* Main History Column */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Upcoming Appointments */}
                        {upcomingAppts.length > 0 && (
                            <div className="space-y-4">
                                <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-900 flex items-center gap-2">
                                    <CalendarDays size={14} className="text-[#637060]" /> Upcoming Sessions
                                </h2>
                                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                                    {upcomingAppts.map((a, i) => (
                                        <Link key={a.id} href={route('appointments.show', a.id)} className={cn("flex items-center justify-between p-5 hover:bg-slate-50 transition-colors border-slate-100", i !== upcomingAppts.length - 1 && "border-b")}>
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-xl bg-[#FAF9F6] border border-slate-100 flex items-center justify-center text-[#637060] font-serif italic font-bold">
                                                    {a.service?.name?.charAt(0) || 'S'}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-900">{a.service?.name}</p>
                                                    <p className="text-[11px] text-slate-500">{a.barber?.user?.name} · {formatDateTime(a.starts_at)}</p>
                                                </div>
                                            </div>
                                            <Badge className={cn('text-[9px] font-bold tracking-widest uppercase rounded-md px-2 py-0.5 shadow-none border', statusVariant(a.status))}>
                                                {a.status.replace('_', ' ')}
                                            </Badge>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Full Visit History */}
                        <div className="space-y-4">
                            <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-900 flex items-center gap-2">
                                <History size={14} className="text-[#637060]" /> Visit History
                            </h2>
                            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                                {appointments.length === 0 ? (
                                    <p className="py-12 text-center text-sm text-slate-400 font-light">No appointment records found.</p>
                                ) : (
                                    appointments.map((a, i) => (
                                        <Link key={a.id} href={route('appointments.show', a.id)} className={cn("flex items-center justify-between p-5 hover:bg-slate-50 transition-colors border-slate-100", i !== appointments.length - 1 && "border-b")}>
                                            <div className="flex items-center gap-4">
                                                <div className="flex h-10 w-14 flex-col items-center justify-center rounded-lg bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-tighter shrink-0 border border-slate-100 group-hover:bg-white transition-colors">
                                                    <span className="text-slate-900 text-xs">{new Date(a.starts_at).toLocaleDateString('en-US', { day: 'numeric' })}</span>
                                                    {new Date(a.starts_at).toLocaleDateString('en-US', { month: 'short' })}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-slate-900 truncate">{a.service?.name ?? 'General Service'}</p>
                                                    <p className="text-xs text-slate-500 flex items-center gap-1">
                                                        {a.barber?.user?.name}
                                                        {a.review && (
                                                            <span className="ml-2 inline-flex items-center gap-0.5 text-amber-500">
                                                                <Star size={10} className="fill-current" /> {a.review.rating}
                                                            </span>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="text-sm font-bold tabular-nums text-slate-900">{formatCents(a.price)}</span>
                                                <Badge className={cn('text-[9px] font-bold tracking-widest uppercase rounded-md px-2 py-0.5 shadow-none border hidden sm:block', statusVariant(a.status))}>
                                                    {a.status.replace('_', ' ')}
                                                </Badge>
                                            </div>
                                        </Link>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Notes */}
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-900 flex items-center gap-2 px-2">
                                <ClipboardList size={14} className="text-[#637060]" /> Internal Notes
                            </h2>
                            <div className="bg-[#FAF9F6] border border-slate-200 rounded-2xl p-6 relative overflow-hidden min-h-[160px]">
                                {customer.notes ? (
                                    <p className="text-xs text-slate-600 font-light leading-relaxed whitespace-pre-wrap relative z-10">
                                        {customer.notes}
                                    </p>
                                ) : (
                                    <p className="text-xs text-slate-400 italic font-light">No special notes recorded for this customer.</p>
                                )}
                                <div className="absolute -bottom-4 -right-4 h-24 w-24 bg-white/50 rounded-full blur-3xl" />
                            </div>
                        </div>

                        {/* Brand Decoration Card */}
                        <div className="bg-[#637060] rounded-3xl p-8 text-white shadow-xl shadow-[#637060]/10 relative overflow-hidden group">
                            <div className="relative z-10">
                                <h3 className="text-lg font-light tracking-tight mb-1 opacity-90 font-serif italic">The Client Standard</h3>
                                <p className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-60">
                                    Quality is our signature.
                                </p>
                            </div>
                            <Scissors className="absolute -bottom-6 -right-6 text-white opacity-[0.07] -rotate-12 transition-transform duration-700 group-hover:scale-110" size={140} />
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}