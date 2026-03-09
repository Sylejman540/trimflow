import { Head, Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Edit, Eye, Plus, Trash2, Search, SlidersHorizontal, Download, CheckCircle2 } from 'lucide-react';
import AppLayout from '@/layouts/AppLayout';
import { DataTable } from '@/components/data-table';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { formatCents, formatDateTime, cn } from '@/lib/utils';
import { Appointment, AppointmentStatus, Barber, Service } from '@/types';

const allStatuses: AppointmentStatus[] = [
    'pending',
    'confirmed',
    'in_progress',
    'completed',
    'cancelled',
    'no_show',
];

/**
 * Helper to capitalize the first letter of each word and remove underscores
 */
function capitalizeWords(str: string) {
    return str
        .replace(/_/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

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

function isToday(dateStr: string) {
    const d = parseShopDate(dateStr);
    const now = new Date();
    return d.getFullYear() === now.getFullYear()
        && d.getMonth() === now.getMonth()
        && d.getDate() === now.getDate();
}

function isTomorrow(dateStr: string) {
    const d = parseShopDate(dateStr);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return d.getFullYear() === tomorrow.getFullYear()
        && d.getMonth() === tomorrow.getMonth()
        && d.getDate() === tomorrow.getDate();
}


function DeleteModal({
    appointment,
    open,
    onOpenChange,
}: {
    appointment: Appointment;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const { t } = useTranslation();
    const [processing, setProcessing] = useState(false);

    function handleDelete() {
        setProcessing(true);
        router.delete(route('appointments.destroy', appointment.id), {
            onSuccess: () => onOpenChange(false),
            onFinish: () => setProcessing(false),
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-sm border-slate-200 shadow-none">
                <DialogHeader>
                    <DialogTitle>Delete Appointment</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete the appointment for{' '}
                        <span className="font-medium text-gray-900">
                            {appointment.customer?.name ?? 'this customer'}
                        </span>
                        {' '}on {formatDateTime(appointment.starts_at)}?
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="border-slate-200 shadow-none">
                        {t('cancel')}
                    </Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={processing} className="shadow-none">
                        {t('delete')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function Index({
    appointments,
    can_create,
    filters,
}: {
    appointments: Appointment[];
    can_create: boolean;
    filters: { search?: string; status?: string; date?: string };
}) {
    const { t } = useTranslation();
    const [statusFilter, setStatusFilter] = useState(filters?.status ?? 'all');
    const [dateFilter, setDateFilter] = useState(filters?.date ?? 'all');
    const [globalSearch, setGlobalSearch] = useState(filters?.search ?? '');
    const [deletingAppt, setDeletingAppt] = useState<Appointment | null>(null);

    const filtered = appointments.filter((a) => {
        const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
        const matchesDate =
            dateFilter === 'all' ||
            (dateFilter === 'today' && isToday(a.starts_at)) ||
            (dateFilter === 'tomorrow' && isTomorrow(a.starts_at));
        
        const search = globalSearch.toLowerCase();
        const matchesSearch = !search || [
            a.customer?.name,
            a.barber?.user?.name,
            a.service?.name,
        ].some((val) => val?.toLowerCase().includes(search));

        return matchesStatus && matchesDate && matchesSearch;
    });

    const columns: ColumnDef<Appointment>[] = [
        {
            accessorKey: 'starts_at',
            header: () => <span className="text-[10px] font-bold tracking-wider text-slate-400">{t('appt.startsAt').toUpperCase()}</span>,
            cell: ({ row }) => <span className="whitespace-nowrap text-sm text-slate-600">{formatDateTime(row.original.starts_at)}</span>,
        },
        {
            id: 'customer',
            header: () => <span className="text-[10px] font-bold tracking-wider text-slate-400">{t('appt.customer').toUpperCase()}</span>,
            cell: ({ row }) => <span className="text-sm font-medium text-slate-900">{row.original.customer?.name ?? '-'}</span>,
        },
        {
            id: 'barber',
            header: () => <span className="text-[10px] font-bold tracking-wider text-slate-400">{t('appt.barber').toUpperCase()}</span>,
            cell: ({ row }) => <span className="text-sm text-slate-600">{row.original.barber?.user?.name ?? '-'}</span>,
        },
        {
            id: 'service',
            header: () => <span className="text-[10px] font-bold tracking-wider text-slate-400">{t('appt.service').toUpperCase()}</span>,
            cell: ({ row }) => <span className="text-sm text-slate-600">{row.original.service?.name ?? '-'}</span>,
        },
        {
            accessorKey: 'price',
            header: () => <span className="text-[10px] font-bold tracking-wider text-slate-400">{t('price').toUpperCase()}</span>,
            cell: ({ row }) => <span className="text-sm font-medium text-slate-900">{formatCents(row.original.price)}</span>,
        },
        {
            accessorKey: 'status',
            header: () => <span className="text-[10px] font-bold tracking-wider text-slate-400">{t('status').toUpperCase()}</span>,
            cell: ({ row }) => {
                const statusKeyMap: Record<AppointmentStatus, string> = {
                    confirmed:   'appt.confirmed',
                    in_progress: 'appt.inProgress',
                    completed:   'appt.completed',
                    cancelled:   'appt.cancelled',
                    no_show:     'appt.noShow',
                };
                const key = statusKeyMap[row.original.status];
                return (
                    <Badge className={cn("text-[10px] font-bold tracking-wider rounded-md px-2 py-0.5 shadow-none border", statusVariant(row.original.status))}>
                        {key ? t(key) : capitalizeWords(row.original.status)}
                    </Badge>
                );
            },
        },
        {
            id: 'actions',
            header: () => <div className="text-right px-2 text-[10px] font-bold tracking-wider text-slate-400">{t('actions').toUpperCase()}</div>,
            cell: ({ row }) => {
                const appt = row.original;
                return (
                    <div className="flex items-center justify-end gap-1">
                        <Link href={route('appointments.show', appt.id)} className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), "h-8 w-8 text-slate-400 hover:text-slate-900 hover:bg-slate-100")}>
                            <Eye className="h-4 w-4" />
                        </Link>
                        <Link href={route('appointments.edit', appt.id)} className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), "h-8 w-8 text-slate-400 hover:text-slate-900 hover:bg-slate-100")}>
                            <Edit className="h-4 w-4" />
                        </Link>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-red-600 hover:bg-red-50" onClick={() => setDeletingAppt(appt)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                );
            },
        },
    ];

    return (
        <AppLayout
            title={t('appt.title')}
            actions={
                <div className="flex items-center gap-2">
                    <a
                        href={route('export.appointments')}
                        className={cn(buttonVariants({ variant: 'outline' }), 'h-9 px-3 rounded-lg text-xs font-bold border-slate-200 shadow-none')}
                        title="Export CSV"
                    >
                        <Download className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline ml-2">Export</span>
                    </a>
                    {can_create && (
                        <Link href={route('appointments.create')} className={cn(buttonVariants({ variant: 'default' }), 'bg-slate-900 text-white hover:bg-slate-800 h-9 px-3 rounded-lg text-xs font-bold border-none shadow-none')}>
                            <Plus className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline ml-2">{t('appt.new')}</span>
                        </Link>
                    )}
                </div>
            }
        >
            <Head title={t('appt.title')} />

            <div className="space-y-4">
                <div className="flex flex-col gap-2 bg-white border border-slate-200 p-2 rounded-xl">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            value={globalSearch}
                            placeholder={t('search')}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50/50 border border-slate-100 rounded-lg text-sm focus:bg-white transition-all placeholder:text-slate-400 outline-none"
                            onChange={(e) => setGlobalSearch(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        <Select value={dateFilter} onValueChange={v => setDateFilter(v ?? 'all')}>
                            <SelectTrigger className="h-9 flex-1 min-w-[110px] bg-white border-slate-200 rounded-lg text-xs font-semibold shadow-none focus:ring-0">
                                <SelectValue>
                                    {dateFilter === 'all' ? t('all') : dateFilter === 'today' ? t('today') : t('tomorrow')}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-200 shadow-none">
                                <SelectItem value="all">{t('all')}</SelectItem>
                                <SelectItem value="today">{t('today')}</SelectItem>
                                <SelectItem value="tomorrow">{t('tomorrow')}</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={statusFilter} onValueChange={v => setStatusFilter(v ?? 'all')}>
                            <SelectTrigger className="h-9 flex-1 min-w-[120px] bg-white border-slate-200 rounded-lg text-xs font-semibold shadow-none focus:ring-0">
                                <SelectValue>{statusFilter === 'all' ? t('all') : capitalizeWords(statusFilter)}</SelectValue>
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-200 shadow-none">
                                <SelectItem value="all">{t('all')}</SelectItem>
                                {allStatuses.map((s) => (
                                    <SelectItem key={s} value={s}>{capitalizeWords(s)}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                    <DataTable
                        columns={columns}
                        data={filtered}
                        showSearch={false}
                    />
                </div>
            </div>

            {deletingAppt && (
                <DeleteModal
                    appointment={deletingAppt}
                    open={!!deletingAppt}
                    onOpenChange={(open) => !open && setDeletingAppt(null)}
                />
            )}
        </AppLayout>
    );
}