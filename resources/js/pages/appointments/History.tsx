import { Head, Link } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, Search } from 'lucide-react';
import AppLayout from '@/layouts/AppLayout';
import { DataTable } from '@/components/data-table';
import { Badge } from '@/components/ui/badge';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { formatCents, formatTime, cn } from '@/lib/utils';
import { Appointment, AppointmentStatus } from '@/types';

const DONE_STATUSES: AppointmentStatus[] = ['completed', 'cancelled', 'no_show'];

function statusVariant(status: AppointmentStatus) {
    const map: Record<AppointmentStatus, string> = {
        pending:     'bg-orange-50 text-orange-700 border-orange-100',
        confirmed:   'bg-emerald-50 text-emerald-700 border-emerald-100',
        in_progress: 'bg-amber-50 text-amber-700 border-amber-100',
        completed:   'bg-green-50 text-green-700 border-green-100',
        cancelled:   'bg-red-50 text-red-600 border-red-100',
        no_show:     'bg-slate-50 text-slate-600 border-slate-100',
    };
    return map[status];
}

function parseShopDate(dateStr: string): Date {
    return new Date(dateStr.replace(/([+-]\d{2}:\d{2}|Z)$/, ''));
}

export default function History({
    appointments: initialAppointments,
    is_barber,
}: {
    appointments: Appointment[];
    is_barber: boolean;
}) {
    const { t } = useTranslation();
    const [appointments] = useState<Appointment[]>(initialAppointments);
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('all');
    const [globalSearch, setGlobalSearch] = useState('');

    const handleStatusChange = (v: string | null) => setStatusFilter(v ?? 'all');
    const handleDateChange = (v: string | null) => setDateFilter(v ?? 'all');

    const filtered = useMemo(() => {
        return appointments
            .filter(a => {
                const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
                const now = new Date();
                let matchesDate = true;

                if (dateFilter === 'last7d') {
                    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    const apptDate = parseShopDate(a.starts_at);
                    matchesDate = apptDate >= sevenDaysAgo;
                } else if (dateFilter === 'last30d') {
                    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    const apptDate = parseShopDate(a.starts_at);
                    matchesDate = apptDate >= thirtyDaysAgo;
                } else if (dateFilter === 'last90d') {
                    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                    const apptDate = parseShopDate(a.starts_at);
                    matchesDate = apptDate >= ninetyDaysAgo;
                }

                const search = globalSearch.toLowerCase();
                const matchesSearch = !search || [
                    a.customer?.name, a.barber?.user?.name, a.service?.name,
                ].some(val => val?.toLowerCase().includes(search));

                return matchesStatus && matchesDate && matchesSearch;
            })
            .sort((a, b) => parseShopDate(b.starts_at).getTime() - parseShopDate(a.starts_at).getTime());
    }, [appointments, statusFilter, dateFilter, globalSearch]);

    const columns: ColumnDef<Appointment>[] = [
        {
            accessorKey: 'starts_at',
            header: () => <span className="text-[10px] font-bold tracking-wider text-slate-400">{t('appt.startsAt').toUpperCase()}</span>,
            cell: ({ row }) => {
                const iso = row.original.starts_at;
                const d = parseShopDate(iso);
                return (
                    <div className="whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-md">{formatTime(iso)}</span>
                        <p className="text-xs text-slate-400 mt-0.5">{d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                    </div>
                );
            },
        },
        {
            id: 'customer',
            header: () => <span className="text-[10px] font-bold tracking-wider text-slate-400">{t('appt.customer').toUpperCase()}</span>,
            cell: ({ row }) => <span className="text-sm font-medium text-slate-900">{row.original.customer?.name ?? '-'}</span>,
        },
        ...(!is_barber ? [{
            id: 'barber',
            header: () => <span className="text-[10px] font-bold tracking-wider text-slate-400">{t('appt.barber').toUpperCase()}</span>,
            cell: ({ row }: { row: { original: Appointment } }) => <span className="text-sm text-slate-600">{row.original.barber?.user?.name ?? '-'}</span>,
        }] : []),
        {
            id: 'service',
            header: () => <span className="text-[10px] font-bold tracking-wider text-slate-400">{t('appt.service').toUpperCase()}</span>,
            cell: ({ row }) => <span className="text-sm text-slate-600">{row.original.service?.name ?? '-'}</span>,
        },
        {
            id: 'price',
            header: () => <span className="text-[10px] font-bold tracking-wider text-slate-400">{t('appt.price').toUpperCase()}</span>,
            cell: ({ row }) => <span className="text-sm font-medium text-slate-900">{formatCents(row.original.price)}</span>,
        },
        {
            id: 'status',
            header: () => <span className="text-[10px] font-bold tracking-wider text-slate-400">{t('appt.status').toUpperCase()}</span>,
            cell: ({ row }) => (
                <Badge className={cn('text-[10px] font-bold rounded-full px-2.5 py-1 shadow-none border', statusVariant(row.original.status))}>
                    {t(`appt.${row.original.status === 'no_show' ? 'noShow' : row.original.status}`)}
                </Badge>
            ),
        },
        {
            id: 'actions',
            header: () => <span className="text-[10px] font-bold tracking-wider text-slate-400">{t('actions.title').toUpperCase()}</span>,
            cell: ({ row }) => (
                <Link href={route('appointments.show', row.original.id)} className="text-slate-500 hover:text-slate-900 transition-colors">
                    <Eye className="h-4 w-4" />
                </Link>
            ),
        },
    ];

    return (
        <AppLayout title={t('appt.history')}>
            <Head title={t('appt.history')} />

            <div className="space-y-2">
                {/* Toolbar */}
                <div className="flex flex-col gap-2">
                    {/* Search row */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input type="text" value={globalSearch} placeholder={t('apptIndex.searchPlaceholder')}
                            className="w-full pl-10 pr-3 h-10 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none placeholder:text-slate-400"
                            onChange={e => setGlobalSearch(e.target.value)} />
                    </div>

                    {/* Filters row */}
                    <div className="flex items-center gap-2">
                        <Select value={dateFilter} onValueChange={v => handleDateChange(v ?? 'all')}>
                            <SelectTrigger className="h-9 flex-1 bg-white border-slate-200 rounded-lg text-xs font-semibold shadow-none focus:ring-0">
                                <SelectValue>{dateFilter === 'all' ? t('apptIndex.filterDateAll') : dateFilter === 'last7d' ? t('apptIndex.filterDateLast7d') : dateFilter === 'last30d' ? t('apptIndex.filterDateLast30d') : t('apptIndex.filterDateLast90d')}</SelectValue>
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-200 shadow-none">
                                <SelectItem value="all">{t('apptIndex.filterDateAll')}</SelectItem>
                                <SelectItem value="last7d">{t('apptIndex.filterDateLast7d')}</SelectItem>
                                <SelectItem value="last30d">{t('apptIndex.filterDateLast30d')}</SelectItem>
                                <SelectItem value="last90d">{t('apptIndex.filterDateLast90d')}</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={statusFilter} onValueChange={v => handleStatusChange(v ?? 'all')}>
                            <SelectTrigger className="h-9 flex-1 bg-white border-slate-200 rounded-lg text-xs font-semibold shadow-none focus:ring-0">
                                <SelectValue>{statusFilter === 'all' ? t('apptIndex.filterStatusAll') : t(`appt.${statusFilter === 'no_show' ? 'noShow' : statusFilter}`)}</SelectValue>
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-200 shadow-none">
                                <SelectItem value="all">{t('apptIndex.filterStatusAll')}</SelectItem>
                                <SelectItem value="completed">{t('appt.completed')}</SelectItem>
                                <SelectItem value="cancelled">{t('appt.cancelled')}</SelectItem>
                                <SelectItem value="no_show">{t('appt.noShow')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {filtered.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                        <p>{t('appt.noAppointments')}</p>
                    </div>
                ) : (
                    <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
                        <DataTable columns={columns} data={filtered} showSearch={false} />
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
