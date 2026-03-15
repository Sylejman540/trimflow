import { Head, Link, router, useForm } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { useState, useMemo, useEffect, FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Edit, Eye, Plus, Trash2, Search, CheckCircle2, RefreshCw,
    User, Scissors, Calendar, Phone, List, LayoutGrid, Kanban,
    ChevronLeft, ChevronRight, Clock, MoreHorizontal,
} from 'lucide-react';
import AppLayout from '@/layouts/AppLayout';
import { DataTable } from '@/components/data-table';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter,
    DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { formatCents, formatDateTime, formatTime, cn } from '@/lib/utils';
import { Appointment, AppointmentStatus, Barber, PageProps, Service } from '@/types';
import { KanbanView } from './KanbanView';

type ViewMode = 'list' | 'calendar' | 'kanban';

const allStatuses: AppointmentStatus[] = [
    'pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show',
];

const STATUS_COLS: AppointmentStatus[] = [
    'pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show',
];

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

function statusDot(status: AppointmentStatus) {
    const map: Record<AppointmentStatus, string> = {
        pending:     'bg-orange-400',
        confirmed:   'bg-emerald-400',
        in_progress: 'bg-amber-400',
        completed:   'bg-green-400',
        cancelled:   'bg-red-400',
        no_show:     'bg-slate-400',
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

function isSameDay(a: Date, b: Date) {
    return a.getFullYear() === b.getFullYear()
        && a.getMonth() === b.getMonth()
        && a.getDate() === b.getDate();
}

// ─── Quick Book Modal ──────────────────────────────────────────────────────────

function QuickBookModal({ open, onClose, barbers, services, isBarber }: {
    open: boolean; onClose: () => void;
    barbers: Barber[]; services: Service[]; isBarber: boolean;
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
        const mins = now.getMinutes();
        const rounded = Math.ceil((mins + 1) / 15) * 15;
        const base = new Date(now);
        base.setMinutes(rounded, 0, 0);
        return [
            { label: t('apptIndex.nowLabel'), date: base },
            { label: '+30m', date: new Date(base.getTime() + 30 * 60000) },
            { label: '+1h',  date: new Date(base.getTime() + 60 * 60000) },
            { label: '+2h',  date: new Date(base.getTime() + 120 * 60000) },
            { label: '+3h',  date: new Date(base.getTime() + 180 * 60000) },
        ];
    }, []);

    function submit(e: FormEvent) {
        e.preventDefault();
        post(route('appointments.store'), { onSuccess: () => { reset(); onClose(); } });
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
                                <SelectTrigger className="h-10 bg-slate-50 border-slate-200 rounded-lg">
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
                            <Input value={data.customer_name} onChange={e => setData('customer_name', e.target.value)}
                                className="h-10 bg-slate-50 border-slate-200 rounded-lg"
                                placeholder={t('apptIndex.namePlaceholder')} autoFocus required />
                            {errors.customer_name && <p className="text-xs text-red-500">{errors.customer_name}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                                <Phone size={10} /> {t('phone')}
                            </Label>
                            <Input value={data.customer_phone} onChange={e => setData('customer_phone', e.target.value)}
                                className="h-10 bg-slate-50 border-slate-200 rounded-lg"
                                placeholder={t('apptIndex.phonePlaceholder')} inputMode="tel" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                            <Scissors size={10} /> {t('appt.service')}
                        </Label>
                        <Select value={data.service_id} onValueChange={v => setData('service_id', v ?? '')}>
                            <SelectTrigger className="h-10 bg-slate-50 border-slate-200 rounded-lg">
                                <SelectValue placeholder={t('appt.selectService')} />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                                {services.map(s => (
                                    <SelectItem key={s.id} value={String(s.id)}>{s.name} — {formatCents(s.price)}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {selectedService && <p className="text-xs text-slate-400">{selectedService.duration} min · {formatCents(selectedService.price)}</p>}
                        {errors.service_id && <p className="text-xs text-red-500">{errors.service_id}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                            <Calendar size={10} /> {t('appt.dateTime')}
                        </Label>
                        <div className="flex gap-1.5 flex-wrap">
                            {timePresets.map(p => (
                                <button key={p.label} type="button"
                                    onClick={() => setData('starts_at', toLocalDatetimeValue(p.date))}
                                    className={cn('px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors',
                                        data.starts_at === toLocalDatetimeValue(p.date)
                                            ? 'bg-slate-900 text-white border-slate-900'
                                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-400'
                                    )}>{p.label}</button>
                            ))}
                        </div>
                        <Input type="datetime-local" value={data.starts_at}
                            onChange={e => setData('starts_at', e.target.value)}
                            className="h-10 bg-slate-50 border-slate-200 rounded-lg" required />
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

// ─── Delete Modal ──────────────────────────────────────────────────────────────

function DeleteModal({ appointment, open, onOpenChange }: {
    appointment: Appointment; open: boolean; onOpenChange: (open: boolean) => void;
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
                    <DialogDescription>{t('appt.deleteConfirm')}</DialogDescription>
                </DialogHeader>
                <DialogFooter className={isRecurring ? 'flex-col gap-2 sm:flex-col' : ''}>
                    {isRecurring ? (
                        <>
                            <Button variant="destructive" onClick={() => handleDelete('this')} disabled={processing} className="shadow-none w-full">{t('appt.deleteThisOnly')}</Button>
                            <Button variant="destructive" onClick={() => handleDelete('future')} disabled={processing} className="shadow-none w-full opacity-80">{t('appt.deleteThisFuture')}</Button>
                            <Button variant="outline" onClick={() => onOpenChange(false)} className="border-slate-200 shadow-none w-full">{t('cancel')}</Button>
                        </>
                    ) : (
                        <>
                            <Button variant="outline" onClick={() => onOpenChange(false)} className="border-slate-200 shadow-none">{t('cancel')}</Button>
                            <Button variant="destructive" onClick={() => handleDelete('this')} disabled={processing} className="shadow-none">{t('delete')}</Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ─── Appointment Card (shared) ────────────────────────────────────────────────

function ApptCard({ appt, isBarber, isOwnerBarber, onDelete }: {
    appt: Appointment; isBarber: boolean; isOwnerBarber: boolean; onDelete: (a: Appointment) => void;
}) {
    const { t } = useTranslation();
    return (
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-2.5 active:bg-slate-50 transition-colors">
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                    <p className="font-bold text-slate-900 text-sm truncate">{appt.customer?.name ?? '-'}</p>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">
                        {appt.service?.name ?? '-'}
                        {(!isBarber || isOwnerBarber) && appt.barber?.user?.name ? ` · ${appt.barber.user.name}` : ''}
                    </p>
                </div>
                <Badge className={cn('text-[10px] font-bold shrink-0 rounded-full px-2.5 py-1 shadow-none border', statusVariant(appt.status))}>
                    {t(`appt.${appt.status === 'no_show' ? 'noShow' : appt.status === 'in_progress' ? 'inProgress' : appt.status}`)}
                </Badge>
            </div>
            <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 font-bold text-xs px-2.5 py-1 rounded-lg">
                    <Clock className="h-3.5 w-3.5" />{formatTime(appt.starts_at)}
                </span>
                <span className="font-bold text-sm text-slate-900">{formatCents(appt.price)}</span>
            </div>
            <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                {appt.status === 'pending' && (
                    <button onClick={() => router.patch(route('appointments.confirm', appt.id))}
                        className="flex-1 flex items-center justify-center gap-1.5 h-9 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg active:bg-emerald-100 transition-colors">
                        <CheckCircle2 className="h-3.5 w-3.5" /> {t('confirm')}
                    </button>
                )}
                <Link href={route('appointments.show', appt.id)}
                    className={cn(buttonVariants({ variant: 'outline' }), 'flex-1 h-9 text-xs font-bold border-slate-200 shadow-none gap-1.5')}>
                    <Eye className="h-3.5 w-3.5" /> {t('appt.view')}
                </Link>
                {appt.status !== 'in_progress' && (
                    <Link href={route('appointments.edit', appt.id)}
                        className={cn(buttonVariants({ variant: 'outline' }), 'flex-1 h-9 text-xs font-bold border-slate-200 shadow-none gap-1.5')}>
                        <Edit className="h-3.5 w-3.5" /> {t('edit')}
                    </Link>
                )}
                {appt.status !== 'in_progress' && appt.can_delete && (
                    <button onClick={() => onDelete(appt)}
                        className="h-9 w-9 flex items-center justify-center text-slate-300 active:text-red-600 active:bg-red-50 rounded-lg border border-slate-200 transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                    </button>
                )}
            </div>
        </div>
    );
}

// ─── List View ────────────────────────────────────────────────────────────────

function ListView({ filtered, columns, isBarber, isOwnerBarber, onDelete, selectedIds, toggleSelect, toggleSelectAll, bulkProcessing, bulkAction, setSelectedIds }: {
    filtered: Appointment[]; columns: ColumnDef<Appointment>[];
    isBarber: boolean; isOwnerBarber: boolean;
    onDelete: (a: Appointment) => void;
    selectedIds: Set<number>; toggleSelect: (id: number) => void;
    toggleSelectAll: () => void; bulkProcessing: boolean;
    bulkAction: (action: 'confirm' | 'cancel') => void;
    setSelectedIds: (s: Set<number>) => void;
}) {
    const { t } = useTranslation();
    return (
        <div className="space-y-3">
            {selectedIds.size > 0 && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 bg-slate-900 text-white rounded-lg px-4 py-3">
                    <span className="text-sm font-semibold flex-1">{t('apptIndex.selected', { count: selectedIds.size })}</span>
                    <div className="flex items-center gap-2">
                        <button onClick={() => bulkAction('confirm')} disabled={bulkProcessing}
                            className="flex items-center justify-center gap-1.5 text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-2 rounded-lg transition-colors disabled:opacity-50 h-9">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">{t('apptIndex.confirmAll')}</span>
                            <span className="sm:hidden">{t('confirm')}</span>
                        </button>
                        <button onClick={() => bulkAction('cancel')} disabled={bulkProcessing}
                            className="flex items-center justify-center gap-1.5 text-xs font-bold bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg transition-colors disabled:opacity-50 h-9">
                            <Trash2 className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">{t('apptIndex.cancelAll')}</span>
                            <span className="sm:hidden">{t('cancel')}</span>
                        </button>
                        <button onClick={() => setSelectedIds(new Set())} className="text-xs text-white/60 hover:text-white transition-colors px-2">
                            {t('apptIndex.clear')}
                        </button>
                    </div>
                </div>
            )}

            {/* Mobile cards */}
            <div className="sm:hidden space-y-2">
                {filtered.length === 0 ? (
                    <div className="py-10 flex flex-col items-center gap-2 text-center px-6">
                        <Calendar className="h-8 w-8 text-slate-200" />
                        <p className="text-sm font-semibold text-slate-700">{t('appt.noAppointments')}</p>
                        <p className="text-xs text-slate-400">{t('appt.noAppointmentsHint')}</p>
                    </div>
                ) : filtered.map(appt => (
                    <ApptCard key={appt.id} appt={appt} isBarber={isBarber} isOwnerBarber={isOwnerBarber} onDelete={onDelete} />
                ))}
            </div>

            {/* Desktop table */}
            <div className="hidden sm:block bg-white border border-slate-200 rounded-xl overflow-hidden">
                {filtered.length === 0 ? (
                    <div className="py-14 flex flex-col items-center gap-2 text-center px-6">
                        <Calendar className="h-10 w-10 text-slate-200" />
                        <p className="text-sm font-semibold text-slate-700">{t('appt.noAppointments')}</p>
                        <p className="text-xs text-slate-400 max-w-sm">{t('appt.noAppointmentsHint')}</p>
                    </div>
                ) : (
                    <DataTable columns={columns} data={filtered} showSearch={false} />
                )}
            </div>
        </div>
    );
}

// ─── Calendar View ────────────────────────────────────────────────────────────

function CalendarView({ filtered, isBarber, isOwnerBarber, onDelete }: {
    filtered: Appointment[]; isBarber: boolean; isOwnerBarber: boolean; onDelete: (a: Appointment) => void;
}) {
    const { t } = useTranslation();
    const [calMode, setCalMode] = useState<'day' | 'week'>('week');
    const [anchor, setAnchor] = useState(() => {
        const d = new Date(); d.setHours(0, 0, 0, 0); return d;
    });
    const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);

    // Week days starting from anchor's Monday
    const weekDays = useMemo(() => {
        const days: Date[] = [];
        const start = new Date(anchor);
        const dow = start.getDay(); // 0=Sun
        const diff = dow === 0 ? -6 : 1 - dow; // go to Monday
        start.setDate(start.getDate() + diff);
        for (let i = 0; i < 7; i++) {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            days.push(d);
        }
        return days;
    }, [anchor]);

    const hours = Array.from({ length: 14 }, (_, i) => i + 7); // 7am–8pm

    const displayDays = calMode === 'day' ? [anchor] : weekDays;

    function prev() {
        const d = new Date(anchor);
        d.setDate(d.getDate() - (calMode === 'day' ? 1 : 7));
        setAnchor(d);
    }
    function next() {
        const d = new Date(anchor);
        d.setDate(d.getDate() + (calMode === 'day' ? 1 : 7));
        setAnchor(d);
    }
    function goToday() {
        const d = new Date(); d.setHours(0, 0, 0, 0); setAnchor(d);
    }

    const today = new Date(); today.setHours(0, 0, 0, 0);

    function apptsForDayHour(day: Date, hour: number) {
        return filtered.filter(a => {
            const d = parseShopDate(a.starts_at);
            return isSameDay(d, day) && d.getHours() === hour;
        });
    }

    const headerLabel = calMode === 'day'
        ? anchor.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
        : `${weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

    return (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            {/* Calendar toolbar */}
            <div className="flex flex-col gap-3 px-4 py-3 border-b border-slate-100">
                <div className="flex items-center gap-1.5 sm:gap-2">
                    <button onClick={prev} className="h-10 w-10 sm:h-8 sm:w-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 transition-colors border border-slate-200 sm:border-0">
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button onClick={next} className="h-10 w-10 sm:h-8 sm:w-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 transition-colors border border-slate-200 sm:border-0">
                        <ChevronRight className="h-4 w-4" />
                    </button>
                    <button onClick={goToday} className="h-10 px-3 sm:h-8 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors">
                        {t('today')}
                    </button>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-900">{headerLabel}</span>
                    <div className="flex items-center rounded-lg border border-slate-200 overflow-hidden bg-white">
                        {(['day', 'week'] as const).map(m => (
                            <button
                                key={m}
                                onClick={() => setCalMode(m)}
                                className={cn(
                                    'px-3 h-10 sm:h-8 text-xs font-semibold capitalize transition-colors border-r border-slate-200 last:border-r-0',
                                    calMode === m ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'
                                )}>
                                {m}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="overflow-auto max-h-[600px]">
                <div className="min-w-full sm:min-w-[500px]" style={{ display: 'grid', gridTemplateColumns: `48px repeat(${displayDays.length}, 1fr)` }}>
                    {/* Header row */}
                    <div className="border-b border-slate-100 bg-slate-50" />
                    {displayDays.map(day => {
                        const isCurrentDay = isSameDay(day, today);
                        return (
                            <div key={day.toISOString()} className={cn('border-b border-l border-slate-100 bg-slate-50 px-2 py-2 text-center', isCurrentDay && 'bg-slate-50')}>
                                <p className={cn('text-[10px] font-bold uppercase tracking-wider', isCurrentDay ? 'text-slate-900' : 'text-slate-400')}>
                                    {day.toLocaleDateString('en-US', { weekday: 'short' })}
                                </p>
                                <p className={cn('text-base font-black mt-0.5', isCurrentDay ? 'text-slate-900' : 'text-slate-900')}>
                                    {day.getDate()}
                                </p>
                            </div>
                        );
                    })}

                    {/* Hour rows */}
                    {hours.map(hour => (
                        <>
                            <div key={`h-${hour}`} className="border-b border-slate-100 px-1 py-1 text-right">
                                <span className="text-[10px] text-slate-400 font-medium">
                                    {hour === 12 ? '12pm' : hour < 12 ? `${hour}am` : `${hour - 12}pm`}
                                </span>
                            </div>
                            {displayDays.map(day => {
                                const appts = apptsForDayHour(day, hour);
                                const isCurrentDay = isSameDay(day, today);
                                return (
                                    <div key={`${day.toISOString()}-${hour}`}
                                        className={cn('border-b border-l border-slate-100 p-0.5 min-h-[52px] align-top', isCurrentDay && 'bg-slate-50/50')}>
                                        {appts.map(appt => (
                                            <button key={appt.id} onClick={() => setSelectedAppt(appt)}
                                                className={cn('w-full flex flex-col px-1.5 py-1 rounded-md text-[10px] font-semibold mb-0.5 leading-tight hover:opacity-80 transition-opacity border cursor-pointer text-left',
                                                    statusVariant(appt.status))}>
                                                <span className="truncate">{appt.customer?.name ?? '-'}</span>
                                                <span className="font-normal opacity-80 truncate">{formatTime(appt.starts_at)} · {appt.service?.name ?? '-'}</span>
                                            </button>
                                        ))}
                                    </div>
                                );
                            })}
                        </>
                    ))}
                </div>
            </div>

            {/* Appointment Details Modal */}
            <Dialog open={!!selectedAppt} onOpenChange={(open) => !open && setSelectedAppt(null)}>
                <DialogContent className="max-w-sm sm:max-w-lg w-[calc(100vw-2rem)] sm:w-full px-4 sm:px-6">
                    {selectedAppt && (
                        <>
                            <DialogHeader className="text-left">
                                <DialogTitle className="text-lg sm:text-xl">{selectedAppt.customer?.name ?? 'Appointment'}</DialogTitle>
                                <DialogDescription>
                                    <Badge className={cn('mt-2 text-xs sm:text-sm', statusVariant(selectedAppt.status))}>
                                        {t(`appt.${selectedAppt.status === 'no_show' ? 'noShow' : selectedAppt.status === 'in_progress' ? 'inProgress' : selectedAppt.status}`)}
                                    </Badge>
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-3 sm:space-y-4">
                                <div className="grid gap-2 sm:gap-3 text-xs sm:text-sm">
                                    <div className="flex justify-between items-start gap-2">
                                        <span className="text-slate-500 shrink-0">{t('appt.startsAt')}</span>
                                        <span className="font-medium text-right">{formatDateTime(selectedAppt.starts_at)}</span>
                                    </div>
                                    {selectedAppt.barber && (
                                        <div className="flex justify-between items-start gap-2">
                                            <span className="text-slate-500 shrink-0">{t('appt.barber')}</span>
                                            <span className="font-medium text-right">{selectedAppt.barber.user?.name ?? '-'}</span>
                                        </div>
                                    )}
                                    {selectedAppt.service && (
                                        <div className="flex justify-between items-start gap-2">
                                            <span className="text-slate-500 shrink-0">{t('appt.service')}</span>
                                            <span className="font-medium text-right">{selectedAppt.service.name}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-start gap-2">
                                        <span className="text-slate-500 shrink-0">{t('price')}</span>
                                        <span className="font-medium text-right">{formatCents(selectedAppt.price)}</span>
                                    </div>
                                    {selectedAppt.customer?.phone && (
                                        <div className="flex justify-between items-start gap-2">
                                            <span className="text-slate-500 shrink-0">{t('phone')}</span>
                                            <span className="font-medium text-right">{selectedAppt.customer.phone}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                                <Link href={route('appointments.show', selectedAppt.id)}
                                    className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'w-full')}>
                                    {t('viewDetails')}
                                </Link>
                                <Link href={route('appointments.edit', selectedAppt.id)}
                                    className={cn(buttonVariants({ size: 'sm' }), 'w-full')}>
                                    {t('edit')}
                                </Link>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}


// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Index({
    appointments: initialAppointments,
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
    const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
    const [view, setView] = useState<ViewMode>(() => (localStorage.getItem('appt_view') as ViewMode) ?? 'list');
    const [statusFilter, setStatusFilter] = useState(() => localStorage.getItem('appt_status') ?? filters?.status ?? 'all');
    const [dateFilter, setDateFilter] = useState('all');
    const [globalSearch, setGlobalSearch] = useState(() => localStorage.getItem('appt_search') ?? filters?.search ?? '');

    // Keep local list in sync when Inertia re-renders the page
    useEffect(() => { setAppointments(initialAppointments); }, [initialAppointments]);

    function changeView(v: ViewMode) { localStorage.setItem('appt_view', v); setView(v); }
    function changeStatus(v: string) { localStorage.setItem('appt_status', v); setStatusFilter(v); }
    function changeDateFilter(v: string) { setDateFilter(v); }
    function changeSearch(v: string) { localStorage.setItem('appt_search', v); setGlobalSearch(v); }
    const [deletingAppt, setDeletingAppt] = useState<Appointment | null>(null);
    const [quickBookOpen, setQuickBookOpen] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [bulkProcessing, setBulkProcessing] = useState(false);

    function toggleSelect(id: number) {
        setSelectedIds(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    }

    function toggleSelectAll() {
        if (selectedIds.size === filtered.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filtered.map(a => a.id)));
        }
    }

    function bulkAction(action: 'confirm' | 'cancel') {
        if (selectedIds.size === 0 || bulkProcessing) return;
        setBulkProcessing(true);
        router.post(route('appointments.bulk'), { action, ids: Array.from(selectedIds) }, {
            onFinish: () => { setBulkProcessing(false); setSelectedIds(new Set()); },
        });
    }

    function toggleMine() {
        router.get(route('appointments.index'), { mine: filter_mine ? undefined : '1' }, { preserveState: false });
    }

    const DONE_STATUSES: AppointmentStatus[] = ['completed', 'cancelled', 'no_show'];

    const filtered = appointments
        .filter(a => {
            const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
            const matchesDate =
                dateFilter === 'all' ||
                (dateFilter === 'today' && isToday(a.starts_at)) ||
                (dateFilter === 'tomorrow' && isTomorrow(a.starts_at));
            const search = globalSearch.toLowerCase();
            const matchesSearch = !search || [
                a.customer?.name, a.barber?.user?.name, a.service?.name,
            ].some(val => val?.toLowerCase().includes(search));
            return matchesStatus && matchesDate && matchesSearch;
        })
        .sort((a, b) => {
            const aDone = DONE_STATUSES.includes(a.status) ? 1 : 0;
            const bDone = DONE_STATUSES.includes(b.status) ? 1 : 0;
            if (aDone !== bDone) return aDone - bDone;
            return parseShopDate(a.starts_at).getTime() - parseShopDate(b.starts_at).getTime();
        });

    const columns: ColumnDef<Appointment>[] = [
        {
            id: 'select',
            header: () => (
                <input type="checkbox"
                    checked={filtered.length > 0 && selectedIds.size === filtered.length}
                    onChange={toggleSelectAll}
                    className="rounded border-slate-300 h-4 w-4 accent-slate-900" />
            ),
            cell: ({ row }) => (
                <input type="checkbox" checked={selectedIds.has(row.original.id)}
                    onChange={() => toggleSelect(row.original.id)}
                    className="rounded border-slate-300 h-4 w-4 accent-slate-900" />
            ),
        },
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
        ...(!is_barber || is_owner_barber ? [{
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
            header: () => <span />,
            cell: ({ row }) => {
                const rule = row.original.recurrence_rule;
                if (!rule || rule === 'none') return null;
                return (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-md">
                        <RefreshCw className="h-2.5 w-2.5" />{rule}
                    </span>
                );
            },
        },
        {
            accessorKey: 'status',
            header: () => <span className="text-[10px] font-bold tracking-wider text-slate-400">{t('status').toUpperCase()}</span>,
            cell: ({ row }) => {
                const s = row.original.status;
                const label = t(`appt.${s === 'no_show' ? 'noShow' : s === 'in_progress' ? 'inProgress' : s}`);
                return (
                    <Badge className={cn('text-[10px] font-bold tracking-wider rounded-md px-2 py-0.5 shadow-none border', statusVariant(s))}>
                        {label}
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
                            <button onClick={() => router.patch(route('appointments.confirm', appt.id))}
                                className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'h-8 w-8 text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50')}
                                title={t('apptIndex.confirmApptTooltip')}>
                                <CheckCircle2 className="h-4 w-4" />
                            </button>
                        )}
                        <Link href={route('appointments.show', appt.id)} className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'h-8 w-8 text-slate-400 hover:text-slate-900 hover:bg-slate-100')}>
                            <Eye className="h-4 w-4" />
                        </Link>
                        {appt.status !== 'in_progress' && (
                            <Link href={route('appointments.edit', appt.id)} className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'h-8 w-8 text-slate-400 hover:text-slate-900 hover:bg-slate-100')}>
                                <Edit className="h-4 w-4" />
                            </Link>
                        )}
                        {appt.status !== 'in_progress' && appt.can_delete && (
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-red-600 hover:bg-red-50" onClick={() => setDeletingAppt(appt)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                );
            },
        },
    ];

    const viewButtons: { mode: ViewMode; icon: React.ElementType; label: string }[] = [
        { mode: 'list',     icon: List,       label: 'List' },
        { mode: 'calendar', icon: Calendar,   label: 'Calendar' },
        { mode: 'kanban',   icon: LayoutGrid, label: 'Kanban' },
    ];

    return (
        <AppLayout
            title={t('appt.title')}
            actions={
                <div className="flex items-center gap-1.5">
                    {is_owner_barber && (
                        <button onClick={toggleMine}
                            className={cn(buttonVariants({ variant: 'outline' }),
                                'h-9 px-2.5 rounded-lg text-xs font-bold shadow-none transition-colors',
                                filter_mine ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-200 text-slate-600'
                            )}>
                            <span className="hidden sm:inline">{filter_mine ? t('appt.allAppointments') : t('appt.myAppointments')}</span>
                            <span className="sm:hidden">{filter_mine ? t('all') : t('appt.mine')}</span>
                        </button>
                    )}
                    {can_create && (
                        <Link href={route('appointments.create')}
                            className="hidden sm:flex items-center gap-1.5 h-9 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors shadow-sm">
                            <Plus className="h-4 w-4" />
                            {t('appt.new')}
                        </Link>
                    )}
                </div>
            }
            mobileAction={can_create ? (
                <Link href={route('appointments.create')}
                    className="flex items-center justify-center gap-2 w-full h-12 rounded-2xl bg-slate-900 text-white text-sm font-bold shadow-lg active:scale-[0.98] transition-transform">
                    <Plus className="h-5 w-5" />
                    {t('appt.new')}
                </Link>
            ) : undefined}
        >
            <Head title={t('appt.title')} />

            <div className="space-y-2">
                {/* Toolbar */}
                <div className="flex flex-col gap-2">
                    {/* Search row */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input type="text" value={globalSearch} placeholder={t('search')}
                            className="w-full pl-10 pr-3 h-10 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none placeholder:text-slate-400"
                            onChange={e => changeSearch(e.target.value)} />
                    </div>

                    {/* Filters row */}
                    <div className="flex items-center gap-2">
                        <Select value={dateFilter} onValueChange={v => changeDateFilter(v ?? 'today')}>
                            <SelectTrigger className="h-9 flex-1 bg-white border-slate-200 rounded-lg text-xs font-semibold shadow-none focus:ring-0">
                                <SelectValue>{dateFilter === 'all' ? t('all') : dateFilter === 'today' ? t('today') : t('tomorrow')}</SelectValue>
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-200 shadow-none">
                                <SelectItem value="all">{t('all')}</SelectItem>
                                <SelectItem value="today">{t('today')}</SelectItem>
                                <SelectItem value="tomorrow">{t('tomorrow')}</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={statusFilter} onValueChange={v => changeStatus(v ?? 'all')}>
                            <SelectTrigger className="h-9 flex-1 bg-white border-slate-200 rounded-lg text-xs font-semibold shadow-none focus:ring-0">
                                <SelectValue>{statusFilter === 'all' ? t('all') : t(`appt.${statusFilter === 'no_show' ? 'noShow' : statusFilter === 'in_progress' ? 'inProgress' : statusFilter}`)}</SelectValue>
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-200 shadow-none">
                                <SelectItem value="all">{t('all')}</SelectItem>
                                {allStatuses.map(s => (
                                    <SelectItem key={s} value={s}>{t(`appt.${s === 'no_show' ? 'noShow' : s === 'in_progress' ? 'inProgress' : s}`)}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <div className="flex items-center rounded-lg border border-slate-200 overflow-hidden shrink-0 bg-white">
                            {viewButtons.map(({ mode, icon: Icon, label }) => (
                                <button
                                    key={mode}
                                    onClick={() => changeView(mode)}
                                    title={label}
                                    className={cn(
                                        'h-10 px-3 sm:h-9 sm:px-2.5 flex items-center justify-center gap-1.5 sm:gap-1 transition-colors border-r border-slate-200 last:border-r-0',
                                        view === mode
                                            ? 'bg-slate-900 text-white'
                                            : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                                    )}>
                                    <Icon className="h-4 w-4" />
                                    <span className="sm:hidden text-xs font-semibold">{label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* View content */}
                {view === 'list' && (
                    <ListView
                        filtered={filtered} columns={columns}
                        isBarber={is_barber} isOwnerBarber={is_owner_barber}
                        onDelete={setDeletingAppt}
                        selectedIds={selectedIds} toggleSelect={toggleSelect}
                        toggleSelectAll={toggleSelectAll} bulkProcessing={bulkProcessing}
                        bulkAction={bulkAction} setSelectedIds={setSelectedIds}
                    />
                )}
                {view === 'calendar' && (
                    <CalendarView
                        filtered={filtered}
                        isBarber={is_barber} isOwnerBarber={is_owner_barber}
                        onDelete={setDeletingAppt}
                    />
                )}
                {view === 'kanban' && (
                    <KanbanView
                        filtered={filtered}
                        isBarber={is_barber} isOwnerBarber={is_owner_barber}
                        onDelete={setDeletingAppt}
                    />
                )}
            </div>

            {deletingAppt && (
                <DeleteModal
                    appointment={deletingAppt}
                    open={!!deletingAppt}
                    onOpenChange={open => !open && setDeletingAppt(null)}
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
