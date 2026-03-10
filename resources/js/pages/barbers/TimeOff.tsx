import { Head, useForm, router } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PalmtreeIcon, Plus, Trash2, CalendarDays, User, ArrowRight } from 'lucide-react';
import AppLayout from '@/layouts/AppLayout';
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

export default function TimeOff({ time_offs, barbers }: { time_offs: TimeOff[]; barbers: BarberSimple[] }) {
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

    const upcoming = time_offs.filter(t => !isPast(t.ends_on));
    const past     = time_offs.filter(t => isPast(t.ends_on));

    return (
        <AppLayout
            title={t('timeoff.title')}
            actions={
                <Button
                    onClick={() => setAddOpen(true)}
                    className="bg-slate-900 text-white hover:bg-slate-800 h-8 px-3 rounded-lg text-[11px] font-bold shadow-none"
                >
                    <Plus className="mr-1.5 h-3.5 w-3.5" /> {t('timeoff.add')}
                </Button>
            }
        >
            <Head title={t('timeoff.title')} />

            <div className="w-full">
                <div className="flex flex-col bg-white">
                    {time_offs.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <PalmtreeIcon className="h-10 w-10 text-slate-200 mb-4" />
                            <p className="text-sm font-medium text-slate-500">{t('timeoff.noTimeOff')}</p>
                        </div>
                    )}

                    {upcoming.length > 0 && (
                        <div className="flex flex-col">
                            {/* Section Header matches the sidebar/dashboard vibe */}
                            <div className="px-6 py-2 bg-slate-50/50 border-b border-slate-100">
                                <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    {t('timeoff.upcomingActive')}
                                </h3>
                            </div>
                            {upcoming.map(t => (
                                <TimeOffRow key={t.id} entry={t} onRemove={() => remove(t.id)} />
                            ))}
                        </div>
                    )}

                    {past.length > 0 && (
                        <div className="flex flex-col mt-4">
                            <div className="px-6 py-2 bg-slate-50/50 border-b border-slate-100">
                                <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    {t('past')}
                                </h3>
                            </div>
                            <div className="opacity-60">
                                {past.map(t => (
                                    <TimeOffRow key={t.id} entry={t} onRemove={() => remove(t.id)} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal remains largely the same but adjusted for internal consistency */}
            <Dialog open={addOpen} onOpenChange={v => !v && setAddOpen(false)}>
                <DialogContent className="sm:max-w-md border-slate-200 shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-sm font-bold">{t('timeoff.add')}</DialogTitle>
                    </DialogHeader>
                    {/* ... (Form Content Remains Same) ... */}
                    <form onSubmit={submit} className="space-y-4 pt-2">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <User size={12} /> {t('appt.barber')}
                            </Label>
                            <Select value={data.barber_id} onValueChange={v => setData('barber_id', v ?? '')}>
                                <SelectTrigger className="h-10 bg-slate-50 border-slate-200 focus:bg-white rounded-lg text-xs">
                                    <SelectValue placeholder={t('search')} />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                                    {barbers.map(b => (
                                        <SelectItem key={b.id} value={String(b.id)} className="text-xs">{b.user.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.barber_id && <p className="text-[10px] text-red-500">{errors.barber_id}</p>}
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
                                    className="h-10 bg-slate-50 border-slate-200 focus:bg-white rounded-lg text-xs"
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
                                    className="h-10 bg-slate-50 border-slate-200 focus:bg-white rounded-lg text-xs"
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
                                className="h-10 bg-slate-50 border-slate-200 focus:bg-white rounded-lg text-xs"
                                placeholder={t('timeoff.reasonPlaceholder')}
                            />
                        </div>

                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button type="button" variant="ghost" onClick={() => setAddOpen(false)} className="text-xs text-slate-500">{t('cancel')}</Button>
                            <Button type="submit" disabled={processing} className="bg-slate-900 text-white hover:bg-slate-800 shadow-none text-xs">
                                {t('save')}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

function TimeOffRow({ entry, onRemove }: { entry: TimeOff; onRemove: () => void }) {
    const { t } = useTranslation();
    const active = isActive(entry.starts_on, entry.ends_on);
    const today  = todayStr();
    const future = entry.starts_on > today;

    function fmtDate(d: string) {
        return new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    return (
        <div className={cn(
            "group flex items-start gap-3 px-4 sm:px-6 py-3 border-b border-slate-100 transition-colors duration-150",
            active ? "bg-amber-50/30" : "bg-white hover:bg-slate-50"
        )}>
            {/* Icon */}
            <div className="flex-none flex items-center justify-center pt-0.5">
                <PalmtreeIcon className={cn("h-4 w-4 shrink-0", active ? "text-amber-500" : "text-slate-400")} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[13px] font-bold text-slate-900">
                        {entry.barber.user.name}
                    </span>
                    {active && (
                        <Badge className="text-[9px] font-bold uppercase tracking-wider rounded-md px-1.5 py-0 shadow-none border bg-amber-50 text-amber-700 border-amber-200">
                            {t('active')}
                        </Badge>
                    )}
                    {future && (
                        <Badge className="text-[9px] font-bold uppercase tracking-wider rounded-md px-1.5 py-0 shadow-none border bg-blue-50 text-blue-700 border-blue-200">
                            {t('upcoming')}
                        </Badge>
                    )}
                </div>
                <div className="flex items-center gap-1.5 text-[12px] text-slate-500">
                    <CalendarDays className="h-3 w-3 shrink-0" />
                    <span>{fmtDate(entry.starts_on)}</span>
                    <ArrowRight className="h-2.5 w-2.5 text-slate-300" />
                    <span>{fmtDate(entry.ends_on)}</span>
                </div>
                {entry.reason && (
                    <p className="text-[11px] italic text-slate-400 truncate">
                        {entry.reason}
                    </p>
                )}
            </div>

            {/* Delete */}
            <div className="flex-none">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-slate-300 sm:opacity-0 sm:group-hover:opacity-100 hover:text-red-600 hover:bg-red-50 transition-all"
                    onClick={onRemove}
                >
                    <Trash2 className="h-3.5 w-3.5" />
                </Button>
            </div>
        </div>
    );
}