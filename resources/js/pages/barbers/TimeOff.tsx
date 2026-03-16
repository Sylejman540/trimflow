import { Head, useForm, router } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ColumnDef } from '@tanstack/react-table';
import { PalmtreeIcon, Plus, Trash2, CalendarDays, User, ArrowRight, Inbox } from 'lucide-react';
import AppLayout from '@/layouts/AppLayout';
import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface BarberSimple { id: number; user: { name: string } }
interface TimeOff {
    id: number;
    starts_on: string;
    ends_on: string;
    reason: string | null;
    barber: { id: number; user: { name: string } };
}

function todayStr() { return new Date().toISOString().split('T')[0]; }
function isPast(endsOn: string) { return endsOn < todayStr(); }
function isActive(startsOn: string, endsOn: string) {
    const today = todayStr();
    return startsOn <= today && endsOn >= today;
}

function fmtDate(d: string) {
    return new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function TimeOff({ time_offs, barbers, can_manage }: { time_offs: TimeOff[]; barbers: BarberSimple[]; can_manage: boolean }) {
    const { t } = useTranslation();
    const [addOpen, setAddOpen] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        barber_id: '',
        starts_on: todayStr(),
        ends_on: todayStr(),
        reason: '',
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        post(route('barbers.time-off.store'), {
            onSuccess: () => { reset(); setAddOpen(false); },
        });
    }

    function remove(id: number) {
        if (confirm('Are you sure you want to remove this time off?')) {
            router.delete(route('barbers.time-off.destroy', id), { preserveScroll: true });
        }
    }

    const columns: ColumnDef<TimeOff>[] = [
        {
            accessorKey: 'barber.user.name',
            header: () => <span className="text-[10px] font-bold tracking-wider text-slate-400">{t('barber.title').toUpperCase()}</span>,
            cell: ({ row }) => {
                const active = isActive(row.original.starts_on, row.original.ends_on);
                return (
                    <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                            <PalmtreeIcon className={cn("h-4 w-4", active && "text-amber-500")} />
                        </div>
                        <span className="text-sm font-medium text-slate-900">{row.original.barber.user.name}</span>
                    </div>
                );
            },
        },
        {
            id: 'dates',
            header: () => <span className="text-[10px] font-bold tracking-wider text-slate-400">{t('timeoff.from').toUpperCase()} → {t('timeoff.to').toUpperCase()}</span>,
            cell: ({ row }) => (
                <div className="flex items-center gap-2 text-sm">
                    <span className="text-slate-600 font-medium">{fmtDate(row.original.starts_on)}</span>
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-600 font-medium">{fmtDate(row.original.ends_on)}</span>
                </div>
            ),
        },
        {
            accessorKey: 'reason',
            header: () => <span className="text-[10px] font-bold tracking-wider text-slate-400">{t('timeoff.reason').toUpperCase()}</span>,
            cell: ({ row }) => <span className="text-sm text-slate-500 italic">{row.original.reason || '—'}</span>,
        },
        {
            id: 'status',
            header: () => <span className="text-[10px] font-bold tracking-wider text-slate-400">{t('status').toUpperCase()}</span>,
            cell: ({ row }) => {
                const active = isActive(row.original.starts_on, row.original.ends_on);
                const future = row.original.starts_on > todayStr();
                return (
                    <div className="flex items-center gap-2">
                        {active && (
                            <Badge className="text-[9px] font-bold uppercase tracking-wider rounded-md px-2 py-0.5 shadow-none border bg-amber-50 text-amber-700 border-amber-200">
                                {t('active')}
                            </Badge>
                        )}
                        {future && !active && (
                            <Badge className="text-[9px] font-bold uppercase tracking-wider rounded-md px-2 py-0.5 shadow-none border bg-blue-50 text-blue-700 border-blue-200">
                                {t('upcoming')}
                            </Badge>
                        )}
                        {!active && !future && (
                            <span className="text-[9px] text-slate-400 font-medium">{t('past')}</span>
                        )}
                    </div>
                );
            },
        },
    ];

    if (can_manage) {
        columns.push({
            id: 'actions',
            header: () => <div className="text-right px-2 text-[10px] font-bold tracking-wider text-slate-400">{t('actions').toUpperCase()}</div>,
            cell: ({ row }) => (
                <div className="flex items-center justify-end gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-300 hover:text-red-600 hover:bg-red-50"
                        onClick={() => remove(row.original.id)}
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
            ),
        });
    }

    return (
        <AppLayout
            title={t('timeoff.title')}
            actions={can_manage ? (
                <button
                    onClick={() => setAddOpen(true)}
                    className="hidden sm:flex items-center gap-1.5 h-9 px-3 lg:px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors shadow-sm"
                >
                    <Plus className="h-3.5 w-3.5" />
                    {t('timeoff.add')}
                </button>
            ) : undefined}
            mobileAction={can_manage ? (
                <button
                    onClick={() => setAddOpen(true)}
                    className="flex items-center justify-center gap-2 w-full h-12 rounded-2xl bg-slate-900 text-white text-sm font-bold shadow-lg active:scale-[0.98] transition-transform"
                >
                    <Plus className="h-5 w-5" />
                    {t('timeoff.add')}
                </button>
            ) : undefined}
        >
            <Head title={t('timeoff.title')} />

            {/* Mobile cards */}
            <div className="sm:hidden">
                {time_offs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-12">
                        <Inbox className="h-12 w-12 text-slate-200" />
                        <div className="text-center">
                            <p className="text-sm font-semibold text-slate-700">No results found</p>
                            <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or search terms</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-2">
                {time_offs.map(timeOff => {
                    const active = isActive(timeOff.starts_on, timeOff.ends_on);
                    const future = timeOff.starts_on > todayStr();
                    return (
                        <div key={timeOff.id} className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                                        <PalmtreeIcon className={cn("h-5 w-5", active && "text-amber-500")} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-semibold text-slate-900 text-sm truncate">{timeOff.barber.user.name}</p>
                                        <p className="text-xs text-slate-400">{fmtDate(timeOff.starts_on)} → {fmtDate(timeOff.ends_on)}</p>
                                    </div>
                                </div>
                            </div>
                            {timeOff.reason && (
                                <p className="text-xs text-slate-500 italic">{timeOff.reason}</p>
                            )}
                            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                                <div className="flex-1 space-y-1">
                                    {active && (
                                        <Badge className="text-[9px] font-bold rounded-md px-2 py-0.5 shadow-none border bg-amber-50 text-amber-700 border-amber-200">
                                            {t('active')}
                                        </Badge>
                                    )}
                                    {future && !active && (
                                        <Badge className="text-[9px] font-bold rounded-md px-2 py-0.5 shadow-none border bg-blue-50 text-blue-700 border-blue-200">
                                            {t('upcoming')}
                                        </Badge>
                                    )}
                                    {!active && !future && (
                                        <span className="text-[9px] text-slate-400 font-medium">{t('past')}</span>
                                    )}
                                </div>
                                {can_manage && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9 text-slate-300 hover:text-red-600 hover:bg-red-50"
                                        onClick={() => remove(timeOff.id)}
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    );
                })}
                    </div>
                )}
            </div>

            {/* Desktop table */}
            <div className="hidden sm:block">
                <DataTable columns={columns} data={time_offs} pageSize={10} searchPlaceholder={t('search')} showSearch={false} />
            </div>

            <Dialog open={addOpen} onOpenChange={v => !v && setAddOpen(false)}>
                <DialogContent className="sm:max-w-md border-slate-200 shadow-2xl rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-sm font-bold flex items-center gap-2">
                            <Plus className="h-4 w-4 text-slate-900" />
                            {t('timeoff.add')}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={submit} className="space-y-4 pt-2">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <User size={12} /> {t('appt.barber')}
                            </Label>
                            <Select value={data.barber_id} onValueChange={v => setData('barber_id', v ?? '')}>
                                <SelectTrigger className="h-11 bg-slate-50 border-slate-200 focus:bg-white rounded-xl text-xs">
                                    <SelectValue placeholder={t('search')} />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                                    {barbers.map(b => (
                                        <SelectItem key={b.id} value={String(b.id)} className="text-xs font-medium">{b.user.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.barber_id && <p className="text-[10px] text-red-500 font-medium">{errors.barber_id}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="starts_on" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                    <CalendarDays size={12} /> {t('timeoff.from')}
                                </Label>
                                <Input
                                    id="starts_on"
                                    type="date"
                                    value={data.starts_on}
                                    onChange={e => setData('starts_on', e.target.value)}
                                    className="h-11 bg-slate-50 border-slate-200 focus:bg-white rounded-xl text-xs font-medium"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="ends_on" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                    <CalendarDays size={12} /> {t('timeoff.to')}
                                </Label>
                                <Input
                                    id="ends_on"
                                    type="date"
                                    value={data.ends_on}
                                    min={data.starts_on}
                                    onChange={e => setData('ends_on', e.target.value)}
                                    className="h-11 bg-slate-50 border-slate-200 focus:bg-white rounded-xl text-xs font-medium"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="reason" className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t('timeoff.reason')}</Label>
                            <Input
                                id="reason"
                                value={data.reason}
                                onChange={e => setData('reason', e.target.value)}
                                className="h-11 bg-slate-50 border-slate-200 focus:bg-white rounded-xl text-xs font-medium"
                                placeholder={t('timeoff.reasonPlaceholder')}
                            />
                        </div>

                        <DialogFooter className="gap-2 sm:gap-0 mt-2">
                            <Button type="button" variant="ghost" onClick={() => setAddOpen(false)} className="h-11 rounded-xl text-xs text-slate-500 font-bold">{t('cancel')}</Button>
                            <Button type="submit" disabled={processing} className="h-11 rounded-xl bg-slate-900 text-white hover:bg-slate-800 shadow-none text-xs font-bold">
                                {t('save')}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
