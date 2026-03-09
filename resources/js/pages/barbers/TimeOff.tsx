import { Head, useForm, router } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PalmtreeIcon, Plus, Trash2, CalendarDays, User } from 'lucide-react';
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
        router.delete(route('barbers.time-off.destroy', id));
    }

    const upcoming = time_offs.filter(t => !isPast(t.ends_on));
    const past     = time_offs.filter(t => isPast(t.ends_on));

    return (
        <AppLayout
            title={t('timeoff.title')}
            actions={
                <Button
                    onClick={() => setAddOpen(true)}
                    className="bg-slate-900 text-white hover:bg-slate-800 h-9 px-4 rounded-lg text-xs font-bold shadow-none border-none"
                >
                    <Plus className="mr-2 h-3.5 w-3.5" /> {t('timeoff.add')}
                </Button>
            }
        >
            <Head title={t('timeoff.title')} />

            <div className="space-y-6 max-w-2xl mx-auto">
                {time_offs.length === 0 && (
                    <div className="bg-white border border-slate-200 rounded-xl py-16 text-center">
                        <PalmtreeIcon className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                        <p className="text-sm text-slate-500">{t('timeoff.noTimeOff')}</p>
                    </div>
                )}

                {upcoming.length > 0 && (
                    <section>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">{t('timeoff.upcomingActive')}</h3>
                        <div className="space-y-2">
                            {upcoming.map(t => (
                                <TimeOffRow key={t.id} entry={t} onRemove={() => remove(t.id)} />
                            ))}
                        </div>
                    </section>
                )}

                {past.length > 0 && (
                    <section>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">{t('past')}</h3>
                        <div className="space-y-2 opacity-60">
                            {past.map(t => (
                                <TimeOffRow key={t.id} entry={t} onRemove={() => remove(t.id)} />
                            ))}
                        </div>
                    </section>
                )}
            </div>

            {/* Add Modal */}
            <Dialog open={addOpen} onOpenChange={v => !v && setAddOpen(false)}>
                <DialogContent className="sm:max-w-md border-slate-200 shadow-none">
                    <DialogHeader>
                        <DialogTitle>{t('timeoff.add')}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submit} className="space-y-4 pt-2">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <User size={12} /> {t('appt.barber')}
                            </Label>
                            <Select value={data.barber_id} onValueChange={v => setData('barber_id', v ?? '')}>
                                <SelectTrigger className="h-10 bg-slate-50 border-slate-200 focus:bg-white rounded-lg">
                                    <SelectValue placeholder={t('search')} />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                                    {barbers.map(b => (
                                        <SelectItem key={b.id} value={String(b.id)}>{b.user.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.barber_id && <p className="text-xs text-red-500">{errors.barber_id}</p>}
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
                                    className="h-10 bg-slate-50 border-slate-200 focus:bg-white rounded-lg"
                                    required
                                />
                                {errors.starts_on && <p className="text-xs text-red-500">{errors.starts_on}</p>}
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
                                    className="h-10 bg-slate-50 border-slate-200 focus:bg-white rounded-lg"
                                    required
                                />
                                {errors.ends_on && <p className="text-xs text-red-500">{errors.ends_on}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="reason" className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t('timeoff.reason')}</Label>
                            <Input
                                id="reason"
                                value={data.reason}
                                onChange={e => setData('reason', e.target.value)}
                                className="h-10 bg-slate-50 border-slate-200 focus:bg-white rounded-lg"
                                placeholder={t('timeoff.reasonPlaceholder')}
                            />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setAddOpen(false)} className="text-slate-500">{t('cancel')}</Button>
                            <Button type="submit" disabled={processing} className="bg-slate-900 text-white hover:bg-slate-800 shadow-none">
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
        <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 flex items-center gap-3">
            <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-slate-900">{entry.barber.user.name}</span>
                {active && (
                    <Badge className="text-[10px] font-bold tracking-wider rounded-md px-1.5 py-0 shadow-none border bg-amber-50 text-amber-700 border-amber-200">
                        {t('active')}
                    </Badge>
                )}
                {future && (
                    <Badge className="text-[10px] font-bold tracking-wider rounded-md px-1.5 py-0 shadow-none border bg-blue-50 text-blue-700 border-blue-200">
                        {t('upcoming')}
                    </Badge>
                )}
                <span className="text-xs text-slate-500 flex items-center gap-1">
                    <CalendarDays className="h-3 w-3 shrink-0" />
                    {fmtDate(entry.starts_on)} — {fmtDate(entry.ends_on)}
                </span>
                {entry.reason && <span className="text-xs italic text-slate-400">{entry.reason}</span>}
            </div>
            <Button
                variant="ghost" size="icon"
                className="h-7 w-7 text-slate-300 hover:text-red-600 hover:bg-red-50 shrink-0"
                onClick={onRemove}
            >
                <Trash2 className="h-3.5 w-3.5" />
            </Button>
        </div>
    );
}
