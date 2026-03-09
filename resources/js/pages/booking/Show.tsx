import { Head, useForm } from '@inertiajs/react';
import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronRight, ChevronLeft, Scissors, User, Clock, CheckCircle2, Calendar, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn, formatCents } from '@/lib/utils';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const COLOR_HEX: Record<string, string> = {
    slate: '#64748b', red: '#ef4444', orange: '#f97316',
    amber: '#f59e0b', green: '#22c55e', teal: '#14b8a6',
    blue: '#3b82f6', violet: '#8b5cf6',
};

interface Company {
    id: number;
    name: string;
    slug: string;
    address?: string;
    phone?: string;
}

interface Barber {
    id: number;
    user: { name: string };
    specialty?: string;
    next_available?: string | null;
    next_time_label?: string | null;
}

interface Service {
    id: number;
    name: string;
    price: number;
    duration: number;
    category?: string;
    description?: string;
    color?: string | null;
}

function todayStr() {
    return new Date().toISOString().split('T')[0];
}

export default function Show({ company, barbers: initialBarbers, services }: {
    company: Company;
    barbers: Barber[];
    services: Service[];
}) {
    const { t } = useTranslation();

    const STEPS = [
        t('booking.step.barber'),
        t('booking.step.service'),
        t('booking.step.dateTime'),
        t('booking.step.info'),
    ];

    const [step, setStep] = useState(0);
    const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
    const [selectedServices, setSelectedServices] = useState<Service[]>([]);
    const [selectedDate, setSelectedDate] = useState(todayStr());
    const [selectedTime, setSelectedTime] = useState('');

    const [barbers, setBarbers] = useState<Barber[]>(initialBarbers);
    const [availabilityLoading, setAvailabilityLoading] = useState(false);

    const [slots, setSlots] = useState<string[]>([]);
    const [slotsLoading, setSlotsLoading] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        barber_id: '',
        service_ids: [] as string[],
        starts_at: '',
        customer_name: '',
        customer_phone: '',
        notes: '',
        _hp: '', // honeypot — must stay empty
        _t: '',
    });

    const categories = useMemo(() => {
        const cats = services.map(s => s.category).filter(Boolean) as string[];
        return Array.from(new Set(cats));
    }, [services]);

    const [categoryFilter, setCategoryFilter] = useState('');

    const filteredServices = useMemo(() =>
        categoryFilter ? services.filter(s => s.category === categoryFilter) : services,
        [services, categoryFilter]
    );

    useEffect(() => {
        setData('_t', String(Math.floor(Date.now() / 1000)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (services.length === 0) return;
        const serviceId = services[0]?.id;
        if (!serviceId) return;

        setAvailabilityLoading(true);
        fetch(route('booking.availability', company.slug) + `?service_id=${serviceId}`)
            .then(r => r.json())
            .then((json: { barbers: Barber[] }) => {
                const map = new Map(json.barbers.map(b => [b.id, b]));
                setBarbers(initialBarbers.map(b => ({
                    ...b,
                    next_available: map.get(b.id)?.next_available ?? null,
                    next_time_label: map.get(b.id)?.next_time_label ?? null,
                })));
            })
            .catch(() => {})
            .finally(() => setAvailabilityLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (step !== 2 || !selectedBarber || selectedServices.length === 0 || !selectedDate) return;

        setSlotsLoading(true);
        setSlots([]);
        setSelectedTime('');

        const params = new URLSearchParams({
            barber_id: String(selectedBarber.id),
            date: selectedDate,
        });
        selectedServices.forEach(s => params.append('service_ids[]', String(s.id)));
        const url = route('booking.slots', company.slug) + '?' + params.toString();

        fetch(url)
            .then(r => r.json())
            .then((json: { slots: string[] }) => setSlots(json.slots ?? []))
            .catch(() => setSlots([]))
            .finally(() => setSlotsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [step, selectedDate]);

    function selectBarber(b: Barber) {
        setSelectedBarber(b);
        setData('barber_id', String(b.id));
        setStep(1);
    }

    function toggleService(s: Service) {
        setSelectedServices(prev =>
            prev.find(x => x.id === s.id)
                ? prev.filter(x => x.id !== s.id)
                : [...prev, s]
        );
    }

    function proceedFromServices() {
        setData('service_ids', selectedServices.map(s => String(s.id)));
        setStep(2);
    }

    function selectTime(time: string) {
        setSelectedTime(time);
        const dt = `${selectedDate}T${time}:00`;
        setData('starts_at', dt);
        setStep(3);
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(route('booking.store', company.slug));
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <Head title={`Book at ${company.name}`} />

            {/* Header */}
            <div className="bg-slate-900 text-white">
                <div className="max-w-2xl mx-auto px-4 py-6 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 border border-white/20 shrink-0">
                            <Scissors className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-white">{company.name}</h1>
                            {company.address && <p className="text-xs text-white/60 mt-0.5">{company.address}</p>}
                            {company.phone && <p className="text-xs text-white/60">{company.phone}</p>}
                        </div>
                    </div>
                    <LanguageSwitcher compact />
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-8">
                {/* Step Indicator */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    {STEPS.map((label, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <div className={cn(
                                'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors',
                                i < step ? 'bg-slate-900 text-white' :
                                i === step ? 'bg-slate-900 text-white ring-2 ring-slate-900 ring-offset-2' :
                                'bg-slate-100 text-slate-400'
                            )}>
                                {i < step ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                            </div>
                            <span className={cn('hidden sm:block text-xs font-medium', i === step ? 'text-slate-900' : 'text-slate-400')}>
                                {label}
                            </span>
                            {i < STEPS.length - 1 && <ChevronRight className="h-4 w-4 text-slate-300" />}
                        </div>
                    ))}
                </div>

                {/* Step 0: Barber */}
                {step === 0 && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-slate-900">{t('booking.chooseBarber')}</h2>
                            {availabilityLoading && (
                                <span className="flex items-center gap-1 text-xs text-slate-400">
                                    <Loader2 className="h-3 w-3 animate-spin" /> {t('booking.loadingAvailability')}
                                </span>
                            )}
                        </div>

                        <div className="space-y-2">
                            {barbers.map(b => (
                                <button
                                    key={b.id}
                                    onClick={() => selectBarber(b)}
                                    className="w-full flex items-center gap-4 bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-400 hover:shadow-sm transition-all text-left active:scale-[0.99]"
                                >
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 shrink-0">
                                        <User className="h-5 w-5 text-slate-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-900">{b.user.name}</p>
                                        {b.specialty && <p className="text-xs text-slate-500 truncate">{b.specialty}</p>}
                                    </div>
                                    {b.next_time_label && (
                                        <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded-full shrink-0">
                                            {b.next_time_label}
                                        </span>
                                    )}
                                    {!b.next_time_label && !availabilityLoading && (
                                        <span className="text-xs text-slate-400 shrink-0">{t('booking.noSlotsBadge')}</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 1: Service */}
                {step === 1 && (
                    <div className="space-y-4 pb-32">
                        <div className="flex items-center gap-2">
                            <button onClick={() => setStep(0)} className="text-slate-400 hover:text-slate-700">
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <h2 className="text-lg font-semibold text-slate-900">{t('booking.chooseServices')}</h2>
                        </div>

                        {categories.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => setCategoryFilter('')}
                                    className={cn('px-3 py-1 rounded-full text-xs font-medium border transition-colors',
                                        !categoryFilter ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                                    )}
                                >{t('all')}</button>
                                {categories.map(c => (
                                    <button
                                        key={c}
                                        onClick={() => setCategoryFilter(c)}
                                        className={cn('px-3 py-1 rounded-full text-xs font-medium border transition-colors',
                                            categoryFilter === c ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                                        )}
                                    >{c}</button>
                                ))}
                            </div>
                        )}

                        <div className="space-y-2">
                            {filteredServices.map(s => {
                                const isSelected = !!selectedServices.find(x => x.id === s.id);
                                return (
                                    <button
                                        key={s.id}
                                        onClick={() => toggleService(s)}
                                        className={cn(
                                            'relative w-full flex items-center justify-between bg-white border rounded-xl p-4 hover:shadow-sm transition-all text-left active:scale-[0.99]',
                                            isSelected
                                                ? 'border-slate-900 ring-1 ring-slate-900'
                                                : 'border-slate-200 hover:border-slate-400'
                                        )}
                                        style={s.color && COLOR_HEX[s.color] ? { borderLeftColor: isSelected ? undefined : COLOR_HEX[s.color], borderLeftWidth: 3 } : undefined}
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-900">{s.name}</p>
                                            {s.description && <p className="text-xs text-slate-500 mt-0.5">{s.description}</p>}
                                            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                                                <Clock className="h-3 w-3" /> {s.duration} {t('booking.min')}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3 ml-4 shrink-0">
                                            <span className="text-sm font-semibold text-slate-900">{formatCents(s.price)}</span>
                                            <div className={cn(
                                                'flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors',
                                                isSelected
                                                    ? 'bg-slate-900 border-slate-900'
                                                    : 'border-slate-300 bg-white'
                                            )}>
                                                {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Sticky Continue bar */}
                        {selectedServices.length > 0 && (
                            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-4 z-10">
                                <div className="max-w-2xl mx-auto space-y-3">
                                    <p className="text-xs text-slate-500 text-center">
                                        {selectedServices.length} {selectedServices.length === 1 ? t('booking.service') : t('booking.services')} &middot;&nbsp;
                                        {selectedServices.reduce((sum, s) => sum + s.duration, 0)} {t('booking.min')} total &middot;&nbsp;
                                        {formatCents(selectedServices.reduce((sum, s) => sum + s.price, 0))} total
                                    </p>
                                    <Button
                                        onClick={proceedFromServices}
                                        className="w-full bg-slate-900 hover:bg-slate-800 text-white h-11 rounded-xl font-semibold shadow-none"
                                    >
                                        {t('booking.continue')}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Step 2: Date & Time */}
                {step === 2 && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <button onClick={() => setStep(1)} className="text-slate-400 hover:text-slate-700">
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <h2 className="text-lg font-semibold text-slate-900">{t('booking.pickDateTime')}</h2>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                    <Calendar className="h-3.5 w-3.5 inline mr-1" /> {t('booking.date')}
                                </label>
                                <input
                                    type="date"
                                    min={todayStr()}
                                    value={selectedDate}
                                    onChange={e => setSelectedDate(e.target.value)}
                                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-900"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                    <Clock className="h-3.5 w-3.5 inline mr-1" /> {t('booking.time')}
                                </label>

                                {slotsLoading && (
                                    <div className="flex items-center gap-2 text-sm text-slate-400 py-4 justify-center">
                                        <Loader2 className="h-4 w-4 animate-spin" /> {t('booking.loadingSlots')}
                                    </div>
                                )}

                                {!slotsLoading && slots.length === 0 && (
                                    <p className="text-sm text-slate-500 py-4 text-center">{t('booking.noSlots')}</p>
                                )}

                                {!slotsLoading && slots.length > 0 && (
                                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                                        {slots.map(slot => (
                                            <button
                                                key={slot}
                                                onClick={() => selectTime(slot)}
                                                className={cn(
                                                    'py-2 text-xs font-medium rounded-lg border transition-colors active:scale-[0.97]',
                                                    selectedTime === slot
                                                        ? 'bg-slate-900 text-white border-slate-900'
                                                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                                                )}
                                            >
                                                {slot}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Customer Info */}
                {step === 3 && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <button onClick={() => setStep(2)} className="text-slate-400 hover:text-slate-700">
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <h2 className="text-lg font-semibold text-slate-900">{t('booking.yourDetails')}</h2>
                        </div>

                        {/* Summary */}
                        <div className="bg-slate-900 rounded-xl p-4 text-white space-y-3">
                            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{t('booking.bookingSummary')}</p>
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 border border-white/20 shrink-0">
                                    <Scissors className="h-4 w-4 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white">{company.name}</p>
                                    {company.address && <p className="text-xs text-white/50">{company.address}</p>}
                                </div>
                            </div>
                            <div className="border-t border-white/10 pt-3 space-y-1">
                                <p className="text-sm font-semibold">
                                    {selectedServices.map(s => s.name).join(' + ')} &middot; {formatCents(selectedServices.reduce((sum, s) => sum + s.price, 0))}
                                </p>
                                <p className="text-xs text-slate-300 flex items-center gap-1">
                                    <User className="h-3 w-3" /> {selectedBarber?.user.name}
                                    {selectedBarber?.specialty && <span className="text-white/40"> · {selectedBarber.specialty}</span>}
                                </p>
                                <p className="text-xs text-slate-300 flex items-center gap-1">
                                    <Calendar className="h-3 w-3" /> {selectedDate} · {selectedTime}
                                </p>
                            </div>
                        </div>

                        <form onSubmit={submit} className="space-y-4">
                            {/* Honeypot — hidden from real users, bots fill it */}
                            <input
                                type="text"
                                name="_hp"
                                value={data._hp}
                                onChange={e => setData('_hp', e.target.value)}
                                style={{ display: 'none' }}
                                tabIndex={-1}
                                autoComplete="off"
                                aria-hidden="true"
                            />
                            <input type="hidden" name="_t" value={data._t} />
                            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">{t('name')} *</label>
                                    <input
                                        type="text"
                                        value={data.customer_name}
                                        onChange={e => setData('customer_name', e.target.value)}
                                        placeholder={t('booking.namePlaceholder')}
                                        autoComplete="name"
                                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-900"
                                        required
                                    />
                                    {errors.customer_name && <p className="text-xs text-red-500 mt-1">{errors.customer_name}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">{t('phone')} *</label>
                                    <input
                                        type="tel"
                                        value={data.customer_phone}
                                        onChange={e => setData('customer_phone', e.target.value)}
                                        placeholder={t('booking.phonePlaceholder')}
                                        autoComplete="tel"
                                        inputMode="tel"
                                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-900"
                                        required
                                    />
                                    {errors.customer_phone && <p className="text-xs text-red-500 mt-1">{errors.customer_phone}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">{t('notes')}</label>
                                    <textarea
                                        value={data.notes}
                                        onChange={e => setData('notes', e.target.value)}
                                        placeholder={t('booking.specialRequests')}
                                        rows={3}
                                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 resize-none"
                                    />
                                </div>
                            </div>

                            {errors.starts_at && (
                                <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{errors.starts_at}</p>
                            )}

                            <Button
                                type="submit"
                                disabled={processing}
                                className="w-full bg-slate-900 hover:bg-slate-800 text-white h-11 rounded-xl font-semibold shadow-none"
                            >
                                {processing ? (
                                    <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> {t('booking.booking')}</span>
                                ) : t('booking.confirmBooking')}
                            </Button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
