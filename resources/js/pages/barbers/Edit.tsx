import { Head, Link, useForm, router } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AppLayout from '@/layouts/AppLayout';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Barber } from '@/types';
import { User, Mail, Star, AlignLeft, Contact, PalmtreeIcon, Plus, Trash2, CalendarDays, ArrowRight, ArrowLeft } from 'lucide-react';

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

export default function Edit({ barber, time_offs = [] }: { barber: Barber; time_offs?: TimeOff[] }) {
    const { t } = useTranslation();
    const [addTimeOffOpen, setAddTimeOffOpen] = useState(false);

    const { data, setData, put, processing, errors } = useForm({
        name: barber.user?.name ?? '',
        email: barber.user?.email ?? '',
        bio: barber.bio ?? '',
        specialty: barber.specialty ?? '',
        is_active: barber.is_active,
    });

    const { data: timeOffData, setData: setTimeOffData, post: postTimeOff, processing: timeOffProcessing, errors: timeOffErrors, reset: resetTimeOff } = useForm({
        starts_on: todayStr(),
        ends_on: todayStr(),
        reason: '',
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        put(route('barbers.update', barber.id));
    }

    function submitTimeOff(e: FormEvent) {
        e.preventDefault();
        postTimeOff(route('barbers.time-off.store'), {
            onSuccess: () => {
                resetTimeOff();
                setAddTimeOffOpen(false);
            },
        });
    }

    function removeTimeOff(id: number) {
        if (confirm(t('confirm'))) {
            router.delete(route('barbers.time-off.destroy', id), { preserveScroll: true });
        }
    }

    return (
        <AppLayout
            title={t('barber.edit')}
            actions={
                <Link
                    href={route('barbers.index')}
                    className={cn(buttonVariants({ variant: 'outline' }), 'h-10 px-3 rounded-lg text-xs font-bold border-slate-200 shadow-none gap-1.5')}
                >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{t('back')}</span>
                </Link>
            }
        >
            <Head title={`${t('barber.edit')} ${barber.user?.name}`} />
            
            <div className="mx-auto max-w-2xl">
                {/* Header Section */}
                <div className="mb-6 px-1">
                    <h2 className="text-xl font-bold tracking-tight text-slate-900">{t('barber.edit')}</h2>
                    <p className="text-sm text-slate-500 mt-1">{t('barber.editDesc')}</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <Tabs defaultValue="info" className="w-full">
                        <TabsList className="w-full justify-start border-b border-slate-200 rounded-none bg-slate-50 px-6 h-14">
                            <TabsTrigger value="info" className="text-xs font-semibold">{t('barber.info')}</TabsTrigger>
                            <TabsTrigger value="timeoff" className="text-xs font-semibold">{t('timeoff.title')}</TabsTrigger>
                        </TabsList>

                        <TabsContent value="info" className="p-4 sm:p-8">
                            <form onSubmit={submit} className="space-y-6">
                    
                    {/* Identity & Contact Grid */}
                    <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <User size={12} />{' '}{t('barber.fullName')}
                            </Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="h-10 bg-slate-50 border-slate-200 focus:bg-white rounded-lg transition-all"
                                placeholder={t('barber.namePlaceholder')}
                                required
                            />
                            {errors.name && <p className="text-xs text-red-500 font-medium">{errors.name}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <Mail size={12} />{' '}{t('barber.emailAddress')}
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className="h-10 bg-slate-50 border-slate-200 focus:bg-white rounded-lg transition-all"
                                placeholder={t('barber.emailPlaceholder')}
                                required
                            />
                            {errors.email && <p className="text-xs text-red-500 font-medium">{errors.email}</p>}
                        </div>
                    </div>

                    {/* Specialty Field */}
                    <div className="space-y-2">
                        <Label htmlFor="specialty" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <Star size={12} />{' '}{t('barber.specialtyExpertise')}
                        </Label>
                        <Input
                            id="specialty"
                            value={data.specialty}
                            onChange={(e) => setData('specialty', e.target.value)}
                            className="h-10 bg-slate-50 border-slate-200 focus:bg-white rounded-lg transition-all"
                            placeholder={t('barber.specialtyPlaceholder')}
                        />
                        {errors.specialty && <p className="text-xs text-red-500 font-medium">{errors.specialty}</p>}
                    </div>

                    {/* Bio Field */}
                    <div className="space-y-2">
                        <Label htmlFor="bio" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <AlignLeft size={12} />{' '}{t('barber.professionalBio')}
                        </Label>
                        <Textarea
                            id="bio"
                            value={data.bio}
                            onChange={(e) => setData('bio', e.target.value)}
                            className="bg-slate-50 border-slate-200 focus:bg-white rounded-lg min-h-[100px] transition-all"
                            placeholder={t('barber.bioPlaceholder')}
                            rows={4}
                        />
                        {errors.bio && <p className="text-xs text-red-500 font-medium">{errors.bio}</p>}
                    </div>

                    {/* Status Toggle */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl">
                        <div className="flex items-start gap-3">
                            <div className="mt-1 bg-white p-2 rounded-lg border border-slate-200">
                                <Contact size={16} className="text-slate-400" />
                            </div>
                            <div className="space-y-0.5">
                                <Label htmlFor="is_active" className="text-sm font-bold text-slate-900">{t('barber.activeSchedule')}</Label>
                                <p className="text-xs text-slate-500">{t('barber.activeScheduleDesc')}</p>
                            </div>
                        </div>
                        <Switch
                            id="is_active"
                            checked={data.is_active}
                            onCheckedChange={(v) => setData('is_active', v)}
                        />
                    </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-xs font-bold h-10 px-6 shadow-sm transition-all"
                                    >
                                        {t('barber.updateBarber')}
                                    </Button>
                                    <Link
                                        href={route('barbers.index')}
                                        className={cn(buttonVariants({ variant: "ghost" }), "text-slate-500 hover:bg-slate-50 hover:text-slate-900 text-xs font-bold h-10 px-4")}
                                    >
                                        {t('cancel')}
                                    </Link>
                                </div>
                            </form>
                        </TabsContent>

                        <TabsContent value="timeoff" className="p-4 sm:p-8">
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900">{t('timeoff.title')}</h3>
                                        <p className="text-xs text-slate-500 mt-1">{t('timeoff.manage')}</p>
                                    </div>
                                    <Button
                                        onClick={() => setAddTimeOffOpen(true)}
                                        className="bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-xs font-bold h-9 px-4"
                                    >
                                        <Plus className="h-3.5 w-3.5 mr-1.5" />
                                        {t('timeoff.add')}
                                    </Button>
                                </div>

                                {time_offs && time_offs.length > 0 ? (
                                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                                        {time_offs.filter(t => !isPast(t.ends_on)).length > 0 && (
                                            <div>
                                                <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
                                                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                                        {t('timeoff.upcomingActive')}
                                                    </h4>
                                                </div>
                                                {time_offs.filter(t => !isPast(t.ends_on)).map(entry => (
                                                    <TimeOffItem key={entry.id} entry={entry} onRemove={() => removeTimeOff(entry.id)} />
                                                ))}
                                            </div>
                                        )}

                                        {time_offs.filter(t => isPast(t.ends_on)).length > 0 && (
                                            <div>
                                                <div className="px-4 py-3 bg-slate-50 border-t border-b border-slate-100">
                                                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                                        {t('past')}
                                                    </h4>
                                                </div>
                                                <div className="opacity-60">
                                                    {time_offs.filter(t => isPast(t.ends_on)).map(entry => (
                                                        <TimeOffItem key={entry.id} entry={entry} onRemove={() => removeTimeOff(entry.id)} />
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <div className="bg-slate-50 p-3 rounded-full mb-3">
                                            <PalmtreeIcon className="h-6 w-6 text-slate-300" />
                                        </div>
                                        <p className="text-sm font-medium text-slate-500">{t('timeoff.noTimeOff')}</p>
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Time Off Dialog */}
                <Dialog open={addTimeOffOpen} onOpenChange={v => !v && setAddTimeOffOpen(false)}>
                    <DialogContent className="sm:max-w-md border-slate-200 shadow-2xl rounded-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-sm font-bold flex items-center gap-2">
                                <Plus className="h-4 w-4 text-slate-900" />
                                {t('timeoff.add')}
                            </DialogTitle>
                        </DialogHeader>

                        <form onSubmit={submitTimeOff} className="space-y-4 pt-2">
                            <div className="space-y-2">
                                <Label htmlFor="starts_on" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                    <CalendarDays size={12} /> {t('timeoff.from')}
                                </Label>
                                <Input
                                    id="starts_on"
                                    type="date"
                                    value={timeOffData.starts_on}
                                    onChange={e => setTimeOffData('starts_on', e.target.value)}
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
                                    value={timeOffData.ends_on}
                                    min={timeOffData.starts_on}
                                    onChange={e => setTimeOffData('ends_on', e.target.value)}
                                    className="h-11 bg-slate-50 border-slate-200 focus:bg-white rounded-xl text-xs font-medium"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="reason" className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t('timeoff.reason')}</Label>
                                <Input
                                    id="reason"
                                    value={timeOffData.reason}
                                    onChange={e => setTimeOffData('reason', e.target.value)}
                                    className="h-11 bg-slate-50 border-slate-200 focus:bg-white rounded-xl text-xs font-medium"
                                    placeholder={t('timeoff.reasonPlaceholder')}
                                />
                            </div>

                            <DialogFooter className="gap-2 sm:gap-0 mt-2">
                                <Button type="button" variant="ghost" onClick={() => setAddTimeOffOpen(false)} className="h-11 rounded-xl text-xs text-slate-500 font-bold">{t('cancel')}</Button>
                                <Button type="submit" disabled={timeOffProcessing} className="h-11 rounded-xl bg-slate-900 text-white hover:bg-slate-800 shadow-none text-xs font-bold">
                                    {t('save')}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}

function TimeOffItem({ entry, onRemove }: { entry: TimeOff; onRemove: () => void }) {
    const { t } = useTranslation();
    const active = isActive(entry.starts_on, entry.ends_on);
    const today = todayStr();
    const future = entry.starts_on > today;

    function fmtDate(d: string) {
        return new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    return (
        <div className={cn(
            "group flex items-center gap-4 px-4 sm:px-6 py-3 border-b border-slate-100 transition-colors duration-150",
            active ? "bg-amber-50/30" : "bg-white hover:bg-slate-50"
        )}>
            <div className="flex-none flex items-center justify-center">
                <PalmtreeIcon className={cn("h-4 w-4 shrink-0", active ? "text-amber-500" : "text-slate-400")} />
            </div>

            <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                <div className="flex items-center gap-2 text-[13px] text-slate-500">
                    <CalendarDays className="h-3 w-3 shrink-0" />
                    <span>{fmtDate(entry.starts_on)}</span>
                    <ArrowRight className="h-2.5 w-2.5 text-slate-300" />
                    <span>{fmtDate(entry.ends_on)}</span>
                </div>

                {entry.reason && (
                    <span className="text-[11px] italic text-slate-400">
                        — {entry.reason}
                    </span>
                )}
            </div>

            <div className="flex-none flex items-center gap-2">
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

            <div className="flex-none w-8 flex justify-end">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-slate-300 opacity-0 group-hover:opacity-100 hover:text-red-600 hover:bg-red-50 transition-all"
                    onClick={onRemove}
                >
                    <Trash2 className="h-3.5 w-3.5" />
                </Button>
            </div>
        </div>
    );
}