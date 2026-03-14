import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FormEvent, useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import AppLayout from '@/layouts/AppLayout';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { formatCents, formatDuration, cn } from '@/lib/utils';
import { Barber, PageProps, Service } from '@/types';
import { Calendar, User, Scissors, AlignLeft, Phone, Tag, Loader2, CheckCircle2, Mail } from 'lucide-react';

export default function Create({
    barbers,
    services,
}: {
    barbers: Barber[];
    services: Service[];
}) {
    const { auth } = usePage<PageProps>().props;
    const isBarber = auth.roles.includes('barber') && !auth.roles.includes('shop-admin');
    const companySlug = auth.company?.slug ?? '';
    const { t, i18n } = useTranslation();

    function formatDateWithDay(dateStr: string) {
        if (!dateStr) return '';
        const [y, m, d] = dateStr.split('-').map(Number);
        const date = new Date(y, m - 1, d);
        const localeMap: Record<string, string> = {
            sq: 'sq-AL', de: 'de-DE', fr: 'fr-FR', it: 'it-IT',
            el: 'el-GR', hr: 'hr-HR', pl: 'pl-PL', pt: 'pt-PT',
            es: 'es-ES', bg: 'bg-BG', tr: 'tr-TR', ru: 'ru-RU',
        };
        const locale = localeMap[i18n.language] ?? i18n.language;
        return date.toLocaleDateString(locale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }

    const { data, setData, post, processing, errors } = useForm({
        barber_id: isBarber ? String(barbers[0]?.id ?? '') : '',
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        service_ids: [] as string[],
        starts_at: '',
        notes: '',
        recurrence_rule: 'none',
    });

    const categories = useMemo(() => {
        const cats = services.map(s => s.category).filter(Boolean) as string[];
        return ['all', ...Array.from(new Set(cats))];
    }, [services]);

    const [categoryFilter, setCategoryFilter] = useState('all');

    const filteredServices = useMemo(() =>
        categoryFilter === 'all'
            ? services
            : services.filter(s => s.category === categoryFilter),
        [services, categoryFilter],
    );

    const selectedServices = services.filter(s => data.service_ids.includes(String(s.id)));
    const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration, 0);
    const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);

    function toggleService(s: Service) {
        const id = String(s.id);
        setData('service_ids', data.service_ids.includes(id)
            ? data.service_ids.filter(x => x !== id)
            : [...data.service_ids, id]
        );
        // Reset slot when services change
        setSelectedSlot('');
        setData('starts_at', '');
    }

    // --- Slot picker state ---
    const [selectedDate, setSelectedDate] = useState('');
    const [slots, setSlots] = useState<string[] | null>(null);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState('');

    const todayStr = useMemo(() => {
        const d = new Date();
        const pad = (n: number) => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    }, []);

    const canShowSlots = !!(data.barber_id && data.service_ids.length > 0);

    useEffect(() => {
        if (!data.barber_id || data.service_ids.length === 0 || !selectedDate || !companySlug) {
            setSlots(null);
            setSelectedSlot('');
            setData('starts_at', '');
            return;
        }

        setSlotsLoading(true);
        setSlots(null);
        setSelectedSlot('');
        setData('starts_at', '');

        const params = new URLSearchParams({ barber_id: data.barber_id, date: selectedDate });
        data.service_ids.forEach(id => params.append('service_ids[]', id));

        fetch(route('booking.slots', companySlug) + '?' + params.toString())
            .then(r => r.json())
            .then((json: { slots: string[] }) => setSlots(json.slots ?? []))
            .catch(() => setSlots([]))
            .finally(() => setSlotsLoading(false));
    }, [data.barber_id, data.service_ids.join(','), selectedDate]);

    function pickSlot(slot: string) {
        setSelectedSlot(slot);
        setData('starts_at', `${selectedDate}T${slot}`);
    }

    function submit(e: FormEvent) {
        e.preventDefault();
        post(route('appointments.store'));
    }

    return (
        <AppLayout title={t('appt.new')}>
            <Head title={t('appt.new')} />

            <div className="mx-auto max-w-2xl">
                <div className="mb-6 px-1">
                    <h2 className="text-xl font-bold tracking-tight text-slate-900">{t('appt.bookingDetails')}</h2>
                    <p className="text-sm text-slate-500 mt-1">{t('appt.bookingDetailsDesc')}</p>
                </div>

                <form onSubmit={submit} className="space-y-6 bg-white border border-slate-200 rounded-xl p-4 sm:p-8 shadow-sm">

                    {/* Barber Selection */}
                    {!isBarber && (
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <User size={12} />{' '}{t('appt.assignedBarber')}
                            </Label>
                            <Select
                                value={data.barber_id}
                                onValueChange={(v) => setData('barber_id', v ?? '')}
                            >
                                <SelectTrigger className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-all rounded-lg">
                                    <SelectValue placeholder={t('appt.selectBarber')} />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                                    {barbers.map((b) => (
                                        <SelectItem key={b.id} value={String(b.id)} className="text-sm">
                                            {b.user?.name ?? ''}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.barber_id && <p className="text-xs text-red-500 font-medium">{errors.barber_id}</p>}
                        </div>
                    )}

                    {/* Customer Info */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="customer_name" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <User size={12} />{' '}{t('appt.customerName')}
                            </Label>
                            <Input
                                id="customer_name"
                                value={data.customer_name}
                                onChange={(e) => setData('customer_name', e.target.value)}
                                className="h-11 bg-slate-50 border-slate-200 focus:bg-white rounded-lg"
                                placeholder="e.g. John Doe"
                                required
                            />
                            {errors.customer_name && <p className="text-xs text-red-500 font-medium">{errors.customer_name}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="customer_phone" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <Phone size={12} />{' '}{t('appt.phoneNumber')}
                            </Label>
                            <Input
                                id="customer_phone"
                                value={data.customer_phone}
                                onChange={(e) => setData('customer_phone', e.target.value)}
                                className="h-11 bg-slate-50 border-slate-200 focus:bg-white rounded-lg"
                                placeholder="+1 (555) 000-0000"
                            />
                            {errors.customer_phone && <p className="text-xs text-red-500 font-medium">{errors.customer_phone}</p>}
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="customer_email" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <Mail size={12} /> Email (for reminders)
                            </Label>
                            <Input
                                id="customer_email"
                                type="email"
                                value={data.customer_email}
                                onChange={(e) => setData('customer_email', e.target.value)}
                                className="h-11 bg-slate-50 border-slate-200 focus:bg-white rounded-lg"
                                placeholder="customer@email.com"
                            />
                            {errors.customer_email && <p className="text-xs text-red-500 font-medium">{errors.customer_email}</p>}
                        </div>
                    </div>

                    {/* Service Selection — multi-select */}
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <Scissors size={12} />{' '}{t('appt.serviceType')}
                            <span className="ml-auto text-[10px] font-normal normal-case tracking-normal text-slate-400">Select one or more</span>
                        </Label>

                        {categories.length > 2 && (
                            <div className="flex items-center gap-2 flex-wrap">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => setCategoryFilter(cat)}
                                        className={cn(
                                            'inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors border',
                                            categoryFilter === cat
                                                ? 'bg-slate-900 text-white border-slate-900'
                                                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400',
                                        )}
                                    >
                                        <Tag size={9} />
                                        {cat === 'all' ? t('all') : cat}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="space-y-1.5 rounded-xl border border-slate-200 overflow-hidden">
                            {filteredServices.map((s) => {
                                const isSelected = data.service_ids.includes(String(s.id));
                                return (
                                    <button
                                        key={s.id}
                                        type="button"
                                        onClick={() => toggleService(s)}
                                        className={cn(
                                            'w-full flex items-center justify-between px-4 py-3 text-left transition-colors border-b border-slate-100 last:border-0',
                                            isSelected ? 'bg-slate-900 text-white' : 'bg-white hover:bg-slate-50',
                                        )}
                                    >
                                        <div>
                                            <p className={cn('text-sm font-medium', isSelected ? 'text-white' : 'text-slate-900')}>{s.name}</p>
                                            <p className={cn('text-xs mt-0.5', isSelected ? 'text-slate-300' : 'text-slate-400')}>
                                                {formatDuration(s.duration)} · {formatCents(s.price)}
                                            </p>
                                        </div>
                                        <div className={cn(
                                            'flex h-5 w-5 items-center justify-center rounded-full border-2 shrink-0 transition-colors',
                                            isSelected ? 'bg-white border-white' : 'border-slate-300',
                                        )}>
                                            {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-slate-900" />}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {selectedServices.length > 0 && (
                            <div className="flex items-center gap-3 px-1">
                                <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-3 py-0.5 rounded-full border border-blue-100 uppercase tracking-tight">
                                    {formatDuration(totalDuration)} total
                                </span>
                                <span className="text-[11px] font-bold text-slate-500">
                                    {t('appt.estimatedPrice')} {formatCents(totalPrice)}
                                </span>
                                <span className="text-[11px] text-slate-400">
                                    {selectedServices.length} service{selectedServices.length !== 1 ? 's' : ''}
                                </span>
                            </div>
                        )}
                        {errors.service_ids && <p className="text-xs text-red-500 font-medium">{errors.service_ids}</p>}
                    </div>

                    {/* Date + Slot Picker */}
                    <div className="space-y-3">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <Calendar size={12} />{' '}{t('appt.dateTime')}
                        </Label>

                        <Input
                            type="date"
                            value={selectedDate}
                            min={todayStr}
                            onChange={e => setSelectedDate(e.target.value)}
                            className="h-11 bg-slate-50 border-slate-200 focus:bg-white rounded-lg w-full sm:w-56"
                            disabled={!canShowSlots}
                        />
                        {selectedDate && canShowSlots && (
                            <p className="text-xs text-slate-500 font-medium -mt-1">{formatDateWithDay(selectedDate)}</p>
                        )}

                        {!canShowSlots && (
                            <p className="text-xs text-slate-400">Select a barber and at least one service first</p>
                        )}

                        {canShowSlots && selectedDate && (
                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                                {slotsLoading && (
                                    <div className="flex items-center gap-2 py-3 justify-center text-xs text-slate-400">
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        {t('appt.checkingAvailability')}
                                    </div>
                                )}

                                {!slotsLoading && slots !== null && slots.length === 0 && (
                                    <p className="text-xs text-slate-500 text-center py-3 font-medium">
                                        {t('appt.noSlotsOnDate')}
                                    </p>
                                )}

                                {!slotsLoading && slots !== null && slots.length > 0 && (
                                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
                                        {slots.map(slot => (
                                            <button
                                                key={slot}
                                                type="button"
                                                onClick={() => pickSlot(slot)}
                                                className={cn(
                                                    'h-9 rounded-lg text-xs font-bold border transition-all',
                                                    selectedSlot === slot
                                                        ? 'bg-slate-900 text-white border-slate-900'
                                                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400 hover:bg-slate-50',
                                                )}
                                            >
                                                {slot}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {errors.starts_at && <p className="text-xs text-red-500 font-medium">{errors.starts_at}</p>}
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="notes" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <AlignLeft size={12} />{' '}{t('appt.internalNotes')}
                        </Label>
                        <Textarea
                            id="notes"
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            className="bg-slate-50 border-slate-200 focus:bg-white rounded-lg min-h-[42px] transition-all"
                            placeholder={t('appt.notesPlaceholder')}
                            rows={1}
                        />
                    </div>

                    {/* Recurrence */}
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <Tag size={12} />{' '}{t('appt.repeat')}
                        </Label>
                        <Select
                            value={data.recurrence_rule}
                            onValueChange={(v) => setData('recurrence_rule', v ?? 'none')}
                        >
                            <SelectTrigger className="h-11 bg-slate-50 border-slate-200 focus:bg-white rounded-lg">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                                <SelectItem value="none">{t('appt.doesNotRepeat')}</SelectItem>
                                <SelectItem value="weekly">{t('appt.weekly')}</SelectItem>
                                <SelectItem value="biweekly">{t('appt.biweekly')}</SelectItem>
                                <SelectItem value="monthly">{t('appt.monthly')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                        <Button
                            type="submit"
                            disabled={processing || !data.starts_at || data.service_ids.length === 0}
                            className="bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-sm font-bold h-11 px-6 shadow-sm transition-all flex-1 sm:flex-none"
                        >
                            {t('appt.bookAppointment')}
                        </Button>
                        <Link
                            href={route('appointments.index')}
                            className={cn(buttonVariants({ variant: "ghost" }), "text-slate-500 hover:bg-slate-50 hover:text-slate-900 text-sm font-bold h-11 px-4")}
                        >
                            {t('cancel')}
                        </Link>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
