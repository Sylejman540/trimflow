import { Head, useForm } from '@inertiajs/react';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronRight, ChevronLeft, Scissors, User, Clock, CheckCircle2, Calendar, Loader2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn, formatCents } from '@/lib/utils';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { Turnstile } from '@marsidev/react-turnstile';

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
    logo?: string | null;
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

const ANY_BARBER_ID = 0;

function todayStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatDateWithDay(dateStr: string, lang: string) {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const localeMap: Record<string, string> = {
        sq: 'sq-AL', de: 'de-DE', fr: 'fr-FR', it: 'it-IT',
        el: 'el-GR', hr: 'hr-HR', pl: 'pl-PL', pt: 'pt-PT',
        es: 'es-ES', bg: 'bg-BG', tr: 'tr-TR', ru: 'ru-RU',
    };
    const locale = localeMap[lang] ?? lang;
    return date.toLocaleDateString(locale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

export default function Show({ company, barbers: initialBarbers, services, turnstile_site_key }: {
    company: Company;
    barbers: Barber[];
    services: Service[];
    turnstile_site_key?: string;
}) {
    const { t, i18n } = useTranslation();

    const STEPS = [
        t('booking.step.service'),
        t('booking.step.barber'),
        t('booking.step.dateTime'),
        t('booking.step.info'),
    ];

    const [step, setStep] = useState(0);
    const [selectedServices, setSelectedServices] = useState<Service[]>([]);
    const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
    const [isAnyBarber, setIsAnyBarber] = useState(false);
    const [selectedDate, setSelectedDate] = useState(todayStr());
    const [selectedTime, setSelectedTime] = useState('');
    const [barbers, setBarbers] = useState<Barber[]>(initialBarbers);
    const [availabilityLoading, setAvailabilityLoading] = useState(false);
    const [slots, setSlots] = useState<string[]>([]);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [anyBarberSlotMap, setAnyBarberSlotMap] = useState<Map<string, number>>(new Map());

    const { data, setData, post, processing, errors } = useForm({
        barber_id: '',
        service_ids: [] as string[],
        starts_at: '',
        customer_name: '',
        customer_phone: '',
        notes: '',
        _hp: '',
        _t: '',
        cf_turnstile_response: '',
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

    const fetchAvailability = useCallback((serviceIds: number[]) => {
        if (serviceIds.length === 0) return;
        setAvailabilityLoading(true);
        const params = new URLSearchParams();
        serviceIds.forEach(id => params.append('service_ids[]', String(id)));
        fetch(route('booking.availability', company.slug) + '?' + params.toString())
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
    }, [company.slug, initialBarbers]);

    const fetchSlots = useCallback(async (barberId: number | 'any', serviceIds: number[], date: string) => {
        setSlotsLoading(true);
        setSlots([]);
        setSelectedTime('');

        if (barberId === 'any') {
            const fetches = initialBarbers.map(b => {
                const params = new URLSearchParams({ barber_id: String(b.id), date });
                serviceIds.forEach(id => params.append('service_ids[]', String(id)));
                return fetch(route('booking.slots', company.slug) + '?' + params.toString())
                    .then(r => r.json())
                    .then((json: { slots: string[] }) => ({ barberId: b.id, slots: json.slots ?? [] }))
                    .catch(() => ({ barberId: b.id, slots: [] as string[] }));
            });
            try {
                const results = await Promise.all(fetches);
                const slotBarberMap = new Map<string, number>();
                results.forEach(({ barberId: bid, slots: s }) => {
                    s.forEach(slot => { if (!slotBarberMap.has(slot)) slotBarberMap.set(slot, bid); });
                });
                setSlots(Array.from(slotBarberMap.keys()).sort());
                setAnyBarberSlotMap(slotBarberMap);
            } finally {
                setSlotsLoading(false);
            }
        } else {
            const params = new URLSearchParams({ barber_id: String(barberId), date });
            serviceIds.forEach(id => params.append('service_ids[]', String(id)));
            fetch(route('booking.slots', company.slug) + '?' + params.toString())
                .then(r => r.json())
                .then((json: { slots: string[] }) => setSlots(json.slots ?? []))
                .catch(() => setSlots([]))
                .finally(() => setSlotsLoading(false));
        }
    }, [company.slug, initialBarbers]);

    useEffect(() => {
        if (step !== 2) return;
        const serviceIds = selectedServices.map(s => s.id);
        if (serviceIds.length === 0) return;
        if (isAnyBarber) fetchSlots('any', serviceIds, selectedDate);
        else if (selectedBarber) fetchSlots(selectedBarber.id, serviceIds, selectedDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [step, selectedDate, selectedBarber?.id, selectedServices.map(s => s.id).join(',')]);

    function toggleService(s: Service) {
        setSelectedServices(prev =>
            prev.find(x => x.id === s.id) ? prev.filter(x => x.id !== s.id) : [...prev, s]
        );
    }

    function proceedFromServices() {
        const ids = selectedServices.map(s => s.id);
        setData('service_ids', ids.map(String));
        fetchAvailability(ids);
        setStep(1);
    }

    function selectBarber(b: Barber) {
        setSelectedBarber(b);
        setIsAnyBarber(false);
        setData('barber_id', String(b.id));
        fetchSlots(b.id, selectedServices.map(s => s.id), selectedDate);
        setStep(2);
    }

    function selectAnyBarber() {
        setSelectedBarber(null);
        setIsAnyBarber(true);
        setData('barber_id', String(ANY_BARBER_ID));
        fetchSlots('any', selectedServices.map(s => s.id), selectedDate);
        setStep(2);
    }

    function selectTime(time: string) {
        setSelectedTime(time);
        setData('starts_at', `${selectedDate}T${time}:00`);
        if (isAnyBarber) {
            const bid = anyBarberSlotMap.get(time);
            if (bid) {
                setData('barber_id', String(bid));
                const found = initialBarbers.find(b => b.id === bid);
                if (found) setSelectedBarber(found);
            }
        }
        setStep(3);
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(route('booking.store', company.slug));
    }

    const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration, 0);
    const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <Head title={`${company.name}`} />

            {/* Header */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 border border-slate-200 shrink-0 overflow-hidden">
                            {company.logo
                                ? <img src={company.logo} alt={company.name} className="h-full w-full object-cover" />
                                : <Scissors className="h-4 w-4 text-slate-500" />
                            }
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate">{company.name}</p>
                            {(company.address || company.phone) && (
                                <p className="text-[11px] text-slate-400 truncate">{company.address ?? company.phone}</p>
                            )}
                        </div>
                    </div>
                    <LanguageSwitcher compact />
                </div>
            </div>

            <div className="max-w-xl mx-auto px-4 py-6">
                {/* Step Indicator */}
                <div className="flex items-center justify-center gap-1 mb-6">
                    {STEPS.map((label, i) => (
                        <div key={i} className="flex items-center gap-1">
                            <div className={cn(
                                'flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold transition-colors shrink-0',
                                i < step ? 'bg-slate-900 text-white' :
                                i === step ? 'bg-slate-900 text-white ring-2 ring-slate-900 ring-offset-2' :
                                'bg-slate-100 text-slate-400'
                            )}>
                                {i < step ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
                            </div>
                            <span className={cn('hidden sm:block text-[11px] font-semibold', i === step ? 'text-slate-900' : 'text-slate-400')}>
                                {label}
                            </span>
                            {i < STEPS.length - 1 && <ChevronRight className="h-3.5 w-3.5 text-slate-300 mx-0.5" />}
                        </div>
                    ))}
                </div>

                {/* Step 0: Service Selection */}
                {step === 0 && (
                    <div className="space-y-3 pb-32">
                        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest">{t('booking.chooseServices')}</h2>

                        {categories.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                                <button
                                    onClick={() => setCategoryFilter('')}
                                    className={cn('px-3 py-1 rounded-lg text-xs font-semibold border transition-colors',
                                        !categoryFilter ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                                    )}
                                >{t('all')}</button>
                                {categories.map(c => (
                                    <button key={c} onClick={() => setCategoryFilter(c)}
                                        className={cn('px-3 py-1 rounded-lg text-xs font-semibold border transition-colors',
                                            categoryFilter === c ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                                        )}
                                    >{c}</button>
                                ))}
                            </div>
                        )}

                        <div className="space-y-2">
                            {filteredServices.map(s => {
                                const isSelected = !!selectedServices.find(x => x.id === s.id);
                                const colorHex = s.color && COLOR_HEX[s.color] ? COLOR_HEX[s.color] : undefined;
                                return (
                                    <button
                                        key={s.id}
                                        onClick={() => toggleService(s)}
                                        className={cn(
                                            'relative w-full flex items-center justify-between bg-white border rounded-xl p-4 transition-all text-left active:scale-[0.99]',
                                            isSelected
                                                ? 'border-slate-900 ring-1 ring-slate-900 shadow-sm'
                                                : 'border-slate-200 hover:border-slate-400 hover:shadow-sm'
                                        )}
                                        style={colorHex && !isSelected ? { borderLeftColor: colorHex, borderLeftWidth: 3 } : undefined}
                                    >
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            {colorHex && (
                                                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: colorHex }} />
                                            )}
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-slate-900">{s.name}</p>
                                                {s.description && <p className="text-xs text-slate-500 mt-0.5 truncate">{s.description}</p>}
                                                <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                                                    <Clock className="h-3 w-3" /> {s.duration} {t('booking.min')}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 ml-4 shrink-0">
                                            <span className="text-sm font-bold text-slate-900">{formatCents(s.price)}</span>
                                            <div className={cn(
                                                'flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors shrink-0',
                                                isSelected ? 'bg-slate-900 border-slate-900' : 'border-slate-300 bg-white'
                                            )}>
                                                {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {selectedServices.length > 0 && (
                            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-4 z-10">
                                <div className="max-w-xl mx-auto space-y-2">
                                    <div className="flex items-center justify-between text-xs text-slate-500">
                                        <span>{selectedServices.length} {selectedServices.length === 1 ? t('booking.service') : t('booking.services')} · {totalDuration} {t('booking.min')}</span>
                                        <span className="font-bold text-slate-900">{formatCents(totalPrice)}</span>
                                    </div>
                                    <Button onClick={proceedFromServices} className="w-full bg-slate-900 hover:bg-slate-800 text-white h-11 rounded-xl font-semibold shadow-none">
                                        {t('booking.continue')} <ChevronRight className="h-4 w-4 ml-1" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Step 1: Barber Selection */}
                {step === 1 && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <button onClick={() => setStep(0)} className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-slate-900 hover:border-slate-400 transition-colors">
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest">{t('booking.chooseBarber')}</h2>
                            {availabilityLoading && (
                                <span className="flex items-center gap-1 text-xs text-slate-400 ml-auto">
                                    <Loader2 className="h-3 w-3 animate-spin" /> {t('booking.loadingAvailability')}
                                </span>
                            )}
                        </div>

                        <div className="space-y-2">
                            {/* Any Barber */}
                            <button
                                onClick={selectAnyBarber}
                                className="w-full flex items-center gap-3 bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-400 hover:shadow-sm transition-all text-left active:scale-[0.99]"
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 border border-slate-200 shrink-0">
                                    <Zap className="h-4 w-4 text-slate-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-slate-900">{t('booking.anyBarber')}</p>
                                    <p className="text-xs text-slate-400">{t('booking.anyBarberDesc')}</p>
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-100 px-2 py-1 rounded-lg shrink-0">{t('booking.anyBarberFastest')}</span>
                            </button>

                            {barbers.map(b => (
                                <button
                                    key={b.id}
                                    onClick={() => selectBarber(b)}
                                    className="w-full flex items-center gap-3 bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-400 hover:shadow-sm transition-all text-left active:scale-[0.99]"
                                >
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 border border-slate-200 shrink-0">
                                        <User className="h-4 w-4 text-slate-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-900">{b.user.name}</p>
                                        {b.specialty && <p className="text-xs text-slate-400 truncate">{b.specialty}</p>}
                                    </div>
                                    {b.next_time_label && (
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-lg shrink-0">
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

                {/* Step 2: Date & Time */}
                {step === 2 && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <button onClick={() => setStep(1)} className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-slate-900 hover:border-slate-400 transition-colors">
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest">{t('booking.pickDateTime')}</h2>
                        </div>

                        {isAnyBarber && (
                            <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                                <Zap className="h-3.5 w-3.5 shrink-0" />
                                {t('booking.anyBarberAutoAssign')}
                            </div>
                        )}

                        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                                    <Calendar className="h-3 w-3 inline mr-1" />{t('booking.date')}
                                </label>
                                <input
                                    type="date"
                                    min={todayStr()}
                                    max={(() => { const d = new Date(); d.setDate(d.getDate() + 60); return d.toISOString().split('T')[0]; })()}
                                    value={selectedDate}
                                    onChange={e => setSelectedDate(e.target.value)}
                                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-900"
                                />
                                {selectedDate && (
                                    <p className="text-xs text-slate-500 mt-1.5 font-medium">{formatDateWithDay(selectedDate, i18n.language)}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                                    <Clock className="h-3 w-3 inline mr-1" />{t('booking.time')}
                                </label>

                                {slotsLoading && (
                                    <div className="flex items-center gap-2 text-sm text-slate-400 py-6 justify-center">
                                        <Loader2 className="h-4 w-4 animate-spin" /> {t('booking.loadingSlots')}
                                    </div>
                                )}

                                {!slotsLoading && slots.length === 0 && (
                                    <p className="text-sm text-slate-400 py-6 text-center">{t('booking.noSlots')}</p>
                                )}

                                {!slotsLoading && slots.length > 0 && (
                                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                                        {slots.map(slot => (
                                            <button
                                                key={slot}
                                                onClick={() => selectTime(slot)}
                                                className={cn(
                                                    'py-2 text-xs font-semibold rounded-lg border transition-colors active:scale-[0.97]',
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
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <button onClick={() => setStep(2)} className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-slate-900 hover:border-slate-400 transition-colors">
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest">{t('booking.yourDetails')}</h2>
                        </div>

                        {/* Summary card */}
                        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t('booking.bookingSummary')}</p>
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 border border-slate-200 shrink-0 overflow-hidden">
                                    {company.logo
                                        ? <img src={company.logo} alt={company.name} className="h-full w-full object-cover" />
                                        : <Scissors className="h-4 w-4 text-slate-500" />
                                    }
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-slate-900 truncate">{company.name}</p>
                                    {company.address && <p className="text-xs text-slate-400 truncate">{company.address}</p>}
                                </div>
                            </div>
                            <div className="border-t border-slate-100 pt-3 space-y-1.5">
                                <p className="text-sm font-semibold text-slate-900">
                                    {selectedServices.map(s => s.name).join(' + ')}
                                    <span className="text-slate-500 font-normal"> · {formatCents(totalPrice)}</span>
                                </p>
                                <p className="text-xs text-slate-500 flex items-center gap-1.5">
                                    <User className="h-3 w-3 text-slate-400" />
                                    {isAnyBarber && !selectedBarber ? t('booking.anyBarber') : selectedBarber?.user.name}
                                    {selectedBarber?.specialty && <span className="text-slate-300">· {selectedBarber.specialty}</span>}
                                </p>
                                <p className="text-xs text-slate-500 flex items-center gap-1.5">
                                    <Calendar className="h-3 w-3 text-slate-400" />
                                    {formatDateWithDay(selectedDate, i18n.language)} · {selectedTime}
                                </p>
                            </div>
                        </div>

                        <form onSubmit={submit} className="space-y-3">
                            <input type="text" name="_hp" value={data._hp} onChange={e => setData('_hp', e.target.value)}
                                style={{ display: 'none' }} tabIndex={-1} autoComplete="off" aria-hidden="true" />
                            <input type="hidden" name="_t" value={data._t} />

                            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">{t('name')} *</label>
                                    <input
                                        type="text"
                                        value={data.customer_name}
                                        onChange={e => setData('customer_name', e.target.value)}
                                        placeholder={t('booking.namePlaceholder')}
                                        autoComplete="name"
                                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 placeholder:text-slate-400"
                                        required
                                    />
                                    {errors.customer_name && <p className="text-xs text-red-500 mt-1">{errors.customer_name}</p>}
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">{t('phone')} *</label>
                                    <input
                                        type="tel"
                                        value={data.customer_phone}
                                        onChange={e => setData('customer_phone', e.target.value)}
                                        placeholder={t('booking.phonePlaceholder')}
                                        autoComplete="tel"
                                        inputMode="tel"
                                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 placeholder:text-slate-400"
                                        required
                                    />
                                    {errors.customer_phone && <p className="text-xs text-red-500 mt-1">{errors.customer_phone}</p>}
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">{t('notes')}</label>
                                    <textarea
                                        value={data.notes}
                                        onChange={e => setData('notes', e.target.value)}
                                        placeholder={t('booking.specialRequests')}
                                        rows={3}
                                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 resize-none placeholder:text-slate-400"
                                    />
                                </div>
                            </div>

                            {errors.starts_at && (
                                <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{errors.starts_at}</p>
                            )}
                            {errors.barber_id && (
                                <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{errors.barber_id}</p>
                            )}

                            {turnstile_site_key && (
                                <div className="flex justify-center">
                                    <Turnstile
                                        siteKey={turnstile_site_key}
                                        onSuccess={token => setData('cf_turnstile_response', token)}
                                        onExpire={() => setData('cf_turnstile_response', '')}
                                        onError={() => setData('cf_turnstile_response', '')}
                                    />
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={processing || !data.customer_name || !data.customer_phone || (!!turnstile_site_key && !data.cf_turnstile_response)}
                                className="w-full bg-slate-900 hover:bg-slate-800 text-white h-11 rounded-xl font-semibold shadow-none"
                            >
                                {processing ? (
                                    <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> {t('booking.booking')}</span>
                                ) : t('booking.confirmBooking')}
                            </Button>
                        </form>
                    </div>
                )}

                {/* Powered by */}
                <div className="text-center pt-8 pb-4">
                    <a href="https://freshio.app" target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3 text-slate-400">
                            <path d="M12 2C9.5 6 7 8.5 7 12a5 5 0 0 0 10 0c0-3.5-2.5-6-5-10z"/>
                        </svg>
                        Powered by <span className="font-semibold text-slate-500">Freshio</span>
                    </a>
                </div>
            </div>
        </div>
    );
}
