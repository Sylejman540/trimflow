import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { useState, useMemo, FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Edit, Eye, Plus, Trash2, Search, CheckCircle2, RefreshCw, User, Scissors, Calendar, Phone } from 'lucide-react';
import AppLayout from '@/layouts/AppLayout';
import { DataTable } from '@/components/data-table';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { formatCents, formatDateTime, formatTime, cn } from '@/lib/utils';
import { Appointment, AppointmentStatus, Barber, PageProps, Service } from '@/types';

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


function toLocalDatetimeValue(d: Date) {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function QuickBookModal({
    open,
    onClose,
    barbers,
    services,
    isBarber,
}: {
    open: boolean;
    onClose: () => void;
    barbers: Barber[];
    services: Service[];
    isBarber: boolean;
}) {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors, reset } = useForm({
        barber_id: isBarber ? String(barbers[0]?.id ?? '') : '',
        customer_name: '',
        customer_phone: '',
        service_id: '',
        starts_at: '',
        notes: '',
        recurrence_rule: 'none',
    });

    const selectedService = useMemo(
        () => services.find(s => s.id === Number(data.service_id)),
        [services, data.service_id],
    );

    const timePresets = useMemo(() => {
        const now = new Date();
        // round up to next 15-min slot
        const mins = now.getMinutes();
        const rounded = Math.ceil((mins + 1) / 15) * 15;
        const base = new Date(now);
        base.setMinutes(rounded, 0, 0);
        return [
            { label: 'Now', date: base },
            { label: '+30m', date: new Date(base.getTime() + 30 * 60000) },
            { label: '+1h',  date: new Date(base.getTime() + 60 * 60000) },
            { label: '+2h',  date: new Date(base.getTime() + 120 * 60000) },
            { label: '+3h',  date: new Date(base.getTime() + 180 * 60000) },
        ];
    }, [open]);

    function submit(e: FormEvent) {
        e.preventDefault();
        post(route('appointments.store'), {
            onSuccess: () => { reset(); onClose(); },
        });
    }

    return (
        <Dialog open={open} onOpenChange={v => !v && onClose()}>
            <DialogContent className="sm:max-w-lg border-slate-200 shadow-none">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Plus className="h-4 w-4" /> {t('appt.new')}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4 pt-1">
                    {!isBarber && (
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                                <User size={10} /> {t('appt.barber')}
                            </Label>
                            <Select value={data.barber_id} onValueChange={v => setData('barber_id', v ?? '')}>
                                <SelectTrigger className="h-10 bg-slate-50 border-slate-200 focus:bg-white rounded-lg">
                                    <SelectValue placeholder={t('appt.selectBarber')} />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                                    {barbers.map(b => (
                                        <SelectItem key={b.id} value={String(b.id)}>{b.user?.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.barber_id && <p className="text-xs text-red-500">{errors.barber_id}</p>}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                                <User size={10} /> {t('appt.customerName')}
                            </Label>
                            <Input
                                value={data.customer_name}
                                onChange={e => setData('customer_name', e.target.value)}
                                className="h-10 bg-slate-50 border-slate-200 focus:bg-white rounded-lg"
                                placeholder="John Doe"
                                autoFocus
                                required
                            />
                            {errors.customer_name && <p className="text-xs text-red-500">{errors.customer_name}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                                <Phone size={10} /> {t('phone')}
                            </Label>
                            <Input
                                value={data.customer_phone}
                                onChange={e => setData('customer_phone', e.target.value)}
                                className="h-10 bg-slate-50 border-slate-200 focus:bg-white rounded-lg"
                                placeholder="+1 555 000-0000"
                                inputMode="tel"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                            <Scissors size={10} /> {t('appt.service')}
                        </Label>
                        <Select value={data.service_id} onValueChange={v => setData('service_id', v ?? '')}>
                            <SelectTrigger className="h-10 bg-slate-50 border-slate-200 focus:bg-white rounded-lg">
                                <SelectValue placeholder={t('appt.selectService')} />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                                {services.map(s => (
                                    <SelectItem key={s.id} value={String(s.id)}>
                                        {s.name} — {formatCents(s.price)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {selectedService && (
                            <p className="text-xs text-slate-400">{selectedService.duration} min · {formatCents(selectedService.price)}</p>
                        )}
                        {errors.service_id && <p className="text-xs text-red-500">{errors.service_id}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                            <Calendar size={10} /> {t('appt.dateTime')}
                        </Label>
                        {/* Quick presets */}
                        <div className="flex gap-1.5 flex-wrap">
                            {timePresets.map(p => (
                                <button
                                    key={p.label}
                                    type="button"
                                    onClick={() => setData('starts_at', toLocalDatetimeValue(p.date))}
                                    className={cn(
                                        'px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors',
                                        data.starts_at === toLocalDatetimeValue(p.date)
                                            ? 'bg-slate-900 text-white border-slate-900'
                                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-400'
                                    )}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                        <Input
                            type="datetime-local"
                            value={data.starts_at}
                            onChange={e => setData('starts_at', e.target.value)}
                            className="h-10 bg-slate-50 border-slate-200 focus:bg-white rounded-lg"
                            required
                        />
                        {errors.starts_at && <p className="text-xs text-red-500">{errors.starts_at}</p>}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={onClose} className="text-slate-500 shadow-none">{t('cancel')}</Button>
                        <Button type="submit" disabled={processing} className="bg-slate-900 text-white hover:bg-slate-800 shadow-none">
                            {t('appt.bookAppointment')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
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
    const isRecurring = appointment.recurrence_rule && appointment.recurrence_rule !== 'none';

    function handleDelete(scope: 'this' | 'future' = 'this') {
        setProcessing(true);
        router.delete(route('appointments.destroy', appointment.id), {
            data: { delete_scope: scope },
            onSuccess: () => onOpenChange(false),
            onFinish: () => setProcessing(false),
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-sm border-slate-200 shadow-none">
                <DialogHeader>
                    <DialogTitle>{t('appt.deleteAppt')}</DialogTitle>
                    <DialogDescription>
                        {t('appt.deleteConfirm')}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className={isRecurring ? 'flex-col gap-2 sm:flex-col' : ''}>
                    {isRecurring ? (
                        <>
                            <Button variant="destructive" onClick={() => handleDelete('this')} disabled={processing} className="shadow-none w-full">
                                {t('appt.deleteThisOnly')}
                            </Button>
                            <Button variant="destructive" onClick={() => handleDelete('future')} disabled={processing} className="shadow-none w-full opacity-80">
                                {t('appt.deleteThisFuture')}
                            </Button>
                            <Button variant="outline" onClick={() => onOpenChange(false)} className="border-slate-200 shadow-none w-full">
                                {t('cancel')}
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="outline" onClick={() => onOpenChange(false)} className="border-slate-200 shadow-none">
                                {t('cancel')}
                            </Button>
                            <Button variant="destructive" onClick={() => handleDelete('this')} disabled={processing} className="shadow-none">
                                {t('delete')}
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function Index({
    appointments,
    can_create,
    is_barber,
    is_owner_barber = false,
    filter_mine = false,
    filters,
    barbers = [],
    services = [],
}: {
    appointments: Appointment[];
    can_create: boolean;
    is_barber: boolean;
    is_owner_barber?: boolean;
    filter_mine?: boolean;
    filters: { search?: string; status?: string; date?: string };
    barbers: Barber[];
    services: Service[];
}) {
    const { t } = useTranslation();
    const [statusFilter, setStatusFilter] = useState(filters?.status ?? 'all');
    const [dateFilter, setDateFilter] = useState(filters?.date ?? 'all');
    const [globalSearch, setGlobalSearch] = useState(filters?.search ?? '');
    const [deletingAppt, setDeletingAppt] = useState<Appointment | null>(null);
    const [quickBookOpen, setQuickBookOpen] = useState(false);

    function toggleMine() {
        router.get(route('appointments.index'), { mine: filter_mine ? undefined : '1' }, { preserveState: false });
    }

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
            cell: ({ row }) => {
                const iso = row.original.starts_at;
                const d = new Date(iso.replace(/([+-]\d{2}:\d{2}|Z)$/, ''));
                const datePart = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                const timePart = formatTime(iso);
                return (
                    <div className="whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-md">
                            {timePart}
                        </span>
                        <p className="text-xs text-slate-400 mt-0.5">{datePart}</p>
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
            accessorKey: 'price',
            header: () => <span className="text-[10px] font-bold tracking-wider text-slate-400">{t('price').toUpperCase()}</span>,
            cell: ({ row }) => <span className="text-sm font-medium text-slate-900">{formatCents(row.original.price)}</span>,
        },
        {
            id: 'recurrence',
            header: () => <span></span>,
            cell: ({ row }) => {
                const rule = row.original.recurrence_rule;
                if (!rule || rule === 'none') return null;
                return (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-md">
                        <RefreshCw className="h-2.5 w-2.5" />
                        {rule}
                    </span>
                );
            },
        },
        {
            accessorKey: 'status',
            header: () => <span className="text-[10px] font-bold tracking-wider text-slate-400">{t('status').toUpperCase()}</span>,
            cell: ({ row }) => {
                const statusKeyMap: Record<AppointmentStatus, string> = {
                    pending:     'appt.pending',
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
                        {appt.status === 'pending' && (
                            <button
                                onClick={() => router.patch(route('appointments.confirm', appt.id))}
                                className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), "h-8 w-8 text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50")}
                                title="Confirm appointment"
                            >
                                <CheckCircle2 className="h-4 w-4" />
                            </button>
                        )}
                        <Link href={route('appointments.show', appt.id)} className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), "h-8 w-8 text-slate-400 hover:text-slate-900 hover:bg-slate-100")}>
                            <Eye className="h-4 w-4" />
                        </Link>
                        {appt.status !== 'in_progress' && (
                            <Link href={route('appointments.edit', appt.id)} className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), "h-8 w-8 text-slate-400 hover:text-slate-900 hover:bg-slate-100")}>
                                <Edit className="h-4 w-4" />
                            </Link>
                        )}
                        {appt.status !== 'in_progress' && (
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-red-600 hover:bg-red-50" onClick={() => setDeletingAppt(appt)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                );
            },
        },
    ];

    return (
        <AppLayout
            title={t('appt.title')}
            actions={
                <div className="flex items-center gap-1.5">
                    {is_owner_barber && (
                        <button
                            onClick={toggleMine}
                            className={cn(
                                buttonVariants({ variant: 'outline' }),
                                'h-9 px-2.5 rounded-lg text-xs font-bold shadow-none transition-colors',
                                filter_mine
                                    ? 'bg-slate-900 text-white border-slate-900'
                                    : 'border-slate-200 text-slate-600',
                            )}
                        >
                            <span className="hidden sm:inline">{filter_mine ? t('appt.myAppointments') : t('appt.allAppointments')}</span>
                            <span className="sm:hidden">{filter_mine ? t('appt.mine') : t('all')}</span>
                        </button>
                    )}
{can_create && (
                        <Link href={route('appointments.create')} className="flex items-center gap-1.5 h-9 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors shadow-sm">
                            <Plus className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">{t('appt.new')}</span>
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
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-100 rounded-lg text-sm focus:bg-white transition-all placeholder:text-slate-400 outline-none"
                            onChange={(e) => setGlobalSearch(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        <Select value={dateFilter} onValueChange={v => setDateFilter(v ?? 'all')}>
                            <SelectTrigger className="h-10 flex-1 min-w-[110px] bg-white border-slate-200 rounded-lg text-xs font-semibold shadow-none focus:ring-0">
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
                            <SelectTrigger className="h-10 flex-1 min-w-[120px] bg-white border-slate-200 rounded-lg text-xs font-semibold shadow-none focus:ring-0">
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

                {/* Mobile card list */}
                <div className="sm:hidden space-y-2">
                    {filtered.length === 0 && (
                        <p className="text-sm text-slate-400 text-center py-8">{t('appt.noAppointments')}</p>
                    )}
                    {filtered.map(appt => (
                        <div key={appt.id} className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
                            <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                    <p className="font-semibold text-slate-900 text-sm truncate">{appt.customer?.name ?? '-'}</p>
                                    <p className="text-xs text-slate-400 mt-0.5">{appt.service?.name ?? '-'}{!is_barber && appt.barber?.user?.name ? ` · ${appt.barber.user.name}` : ''}</p>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                    {appt.recurrence_rule && appt.recurrence_rule !== 'none' && (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-md">
                                            <RefreshCw className="h-2.5 w-2.5" />{appt.recurrence_rule}
                                        </span>
                                    )}
                                    <Badge className={cn('text-[10px] font-bold tracking-wider rounded-md px-2 py-0.5 shadow-none border', statusVariant(appt.status))}>
                                        {capitalizeWords(appt.status)}
                                    </Badge>
                                </div>
                            </div>
                            <div className="flex items-center justify-between text-xs text-slate-500">
                                <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-md">
                                        {formatTime(appt.starts_at)}
                                    </span>
                                    <span className="text-slate-400">
                                        {parseShopDate(appt.starts_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                    </span>
                                </div>
                                <span className="font-semibold text-slate-900">{formatCents(appt.price)}</span>
                            </div>
                            <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                                {appt.status === 'pending' && (
                                    <button
                                        onClick={() => router.patch(route('appointments.confirm', appt.id))}
                                        className="flex-1 flex items-center justify-center gap-1.5 h-9 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg"
                                    >
                                        <CheckCircle2 className="h-3.5 w-3.5" /> {t('confirm')}
                                    </button>
                                )}
                                <Link href={route('appointments.show', appt.id)} className={cn(buttonVariants({ variant: 'outline' }), 'flex-1 h-9 text-xs font-bold border-slate-200 shadow-none')}>
                                    <Eye className="h-3.5 w-3.5 mr-1" /> {t('appt.view')}
                                </Link>
                                {appt.status !== 'in_progress' && (
                                    <Link href={route('appointments.edit', appt.id)} className={cn(buttonVariants({ variant: 'outline' }), 'flex-1 h-9 text-xs font-bold border-slate-200 shadow-none')}>
                                        <Edit className="h-3.5 w-3.5 mr-1" /> Edit
                                    </Link>
                                )}
                                {appt.status !== 'in_progress' && (
                                    <button onClick={() => setDeletingAppt(appt)} className="h-9 w-9 flex items-center justify-center text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg border border-slate-200">
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Desktop table */}
                <div className="hidden sm:block bg-white border border-slate-200 rounded-xl overflow-hidden">
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

            <QuickBookModal
                open={quickBookOpen}
                onClose={() => setQuickBookOpen(false)}
                barbers={barbers}
                services={services}
                isBarber={is_barber}
            />
        </AppLayout>
    );
}