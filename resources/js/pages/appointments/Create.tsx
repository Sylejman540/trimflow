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
import { Calendar, User, Scissors, AlignLeft, Phone, Tag, Loader2, Mail, ChevronRight, Check } from 'lucide-react';

type WizardStep = 'barber' | 'customer' | 'services' | 'datetime' | 'review';

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

    const [currentStep, setCurrentStep] = useState<WizardStep>(isBarber ? 'customer' : 'barber');
    const [selectedDate, setSelectedDate] = useState('');
    const [slots, setSlots] = useState<string[] | null>(null);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState('');

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

    const selectedServices = services.filter(s => data.service_ids.includes(String(s.id)));
    const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration, 0);
    const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);

    const todayStr = useMemo(() => {
        const d = new Date();
        const pad = (n: number) => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    }, []);

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

    function toggleService(s: Service) {
        const id = String(s.id);
        setData('service_ids', data.service_ids.includes(id)
            ? data.service_ids.filter(x => x !== id)
            : [...data.service_ids, id]
        );
        setSelectedSlot('');
        setData('starts_at', '');
    }

    function isValidPhone(phone: string): boolean {
        if (!phone) return true; // Empty is valid (optional field)
        // Accept phone numbers with at least 10 digits
        const digitsOnly = phone.replace(/\D/g, '');
        return digitsOnly.length >= 10;
    }

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
    }, [data.barber_id, data.service_ids.join(','), selectedDate, companySlug]);

    function pickSlot(slot: string) {
        setSelectedSlot(slot);
        setData('starts_at', `${selectedDate}T${slot}`);
    }

    function nextStep() {
        const steps: WizardStep[] = isBarber ? ['customer', 'services', 'datetime', 'review'] : ['barber', 'customer', 'services', 'datetime', 'review'];
        const currentIdx = steps.indexOf(currentStep);
        if (currentIdx < steps.length - 1) {
            setCurrentStep(steps[currentIdx + 1]);
        }
    }

    function prevStep() {
        const steps: WizardStep[] = isBarber ? ['customer', 'services', 'datetime', 'review'] : ['barber', 'customer', 'services', 'datetime', 'review'];
        const currentIdx = steps.indexOf(currentStep);
        if (currentIdx > 0) {
            setCurrentStep(steps[currentIdx - 1]);
        }
    }

    function canProceed(): boolean {
        if (currentStep === 'barber') return !!data.barber_id;
        if (currentStep === 'customer') return !!data.customer_name;
        if (currentStep === 'services') return data.service_ids.length > 0;
        if (currentStep === 'datetime') return !!data.starts_at;
        return true;
    }

    function submit(e: FormEvent) {
        e.preventDefault();
        post(route('appointments.store'));
    }

    const steps: WizardStep[] = isBarber ? ['customer', 'services', 'datetime', 'review'] : ['barber', 'customer', 'services', 'datetime', 'review'];
    const currentStepIdx = steps.indexOf(currentStep);
    const stepLabels: Record<WizardStep, string> = {
        barber: t('appt.assignedBarber'),
        customer: t('appt.customerInfo'),
        services: t('appt.selectServices'),
        datetime: t('appt.dateTime'),
        review: t('appt.review') || 'Review',
    };

    return (
        <AppLayout title={t('appt.new')}>
            <Head title={t('appt.new')} />

            <div className="mx-auto max-w-2xl">
                {/* Header */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">{t('appt.new')}</h2>
                    <p className="text-sm text-slate-500 mt-1">Step {currentStepIdx + 1} of {steps.length}</p>
                </div>

                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex items-center justify-between gap-2 mb-3">
                        {steps.map((step, idx) => (
                            <div key={step} className="flex-1 flex items-center gap-2">
                                <div className={cn(
                                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                                    idx < currentStepIdx ? 'bg-emerald-500 text-white' : idx === currentStepIdx ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-500'
                                )}>
                                    {idx < currentStepIdx ? <Check className="w-4 h-4" /> : idx + 1}
                                </div>
                                {idx < steps.length - 1 && (
                                    <div className={cn('flex-1 h-1 rounded-full', idx < currentStepIdx ? 'bg-emerald-500' : 'bg-slate-200')} />
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-semibold text-slate-900">{stepLabels[currentStep]}</p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={submit} className="space-y-6 bg-white border border-slate-200 rounded-xl p-4 sm:p-8 shadow-sm">

                    {/* Step: Barber */}
                    {currentStep === 'barber' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
                            <div className="space-y-3">
                                <Label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                    <User size={16} />{t('appt.assignedBarber')}
                                </Label>
                                <Select value={data.barber_id} onValueChange={(v) => setData('barber_id', v ?? '')}>
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
                        </div>
                    )}

                    {/* Step: Customer Info */}
                    {currentStep === 'customer' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
                            <div className="space-y-3">
                                <Label htmlFor="customer_name" className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                    <User size={16} />{t('appt.customerName')}
                                </Label>
                                <Input
                                    id="customer_name"
                                    value={data.customer_name}
                                    onChange={(e) => setData('customer_name', e.target.value)}
                                    className="h-11 bg-slate-50 border-slate-200 focus:bg-white rounded-lg"
                                    placeholder="e.g. John Doe"
                                    autoFocus
                                />
                                {errors.customer_name && <p className="text-xs text-red-500 font-medium">{errors.customer_name}</p>}
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="customer_phone" className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                    <Phone size={16} />{t('appt.phoneNumber')} <span className="text-xs text-slate-400">(optional)</span>
                                </Label>
                                <Input
                                    id="customer_phone"
                                    value={data.customer_phone}
                                    onChange={(e) => setData('customer_phone', e.target.value)}
                                    className={cn("h-11 bg-slate-50 border-slate-200 focus:bg-white rounded-lg", data.customer_phone && !isValidPhone(data.customer_phone) && "border-red-300")}
                                    placeholder="+1 (555) 000-0000"
                                />
                                {data.customer_phone && !isValidPhone(data.customer_phone) && <p className="text-xs text-red-500 font-medium">Phone number must have at least 10 digits</p>}
                                {errors.customer_phone && <p className="text-xs text-red-500 font-medium">{errors.customer_phone}</p>}
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="customer_email" className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                    <Mail size={16} /> {t('appt.email')}
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
                    )}

                    {/* Step: Services */}
                    {currentStep === 'services' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
                            <div>
                                <Label className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
                                    <Scissors size={16} />{t('appt.serviceType')}
                                </Label>
                                <div className="flex flex-wrap gap-2">
                                    {services.map((s) => {
                                        const isSelected = data.service_ids.includes(String(s.id));
                                        return (
                                            <button
                                                key={s.id}
                                                type="button"
                                                onClick={() => toggleService(s)}
                                                className={cn(
                                                    'flex flex-col items-start px-4 py-3 rounded-xl border text-left transition-all',
                                                    isSelected
                                                        ? 'bg-slate-900 border-slate-900 text-white'
                                                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-400',
                                                )}
                                            >
                                                <span className="font-semibold">{s.name}</span>
                                                <span className={cn('text-xs mt-1', isSelected ? 'text-slate-300' : 'text-slate-400')}>
                                                    {formatDuration(s.duration)} · {formatCents(s.price)}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                                {errors.service_ids && <p className="text-xs text-red-500 font-medium mt-2">{errors.service_ids}</p>}
                            </div>

                            {selectedServices.length > 0 && (
                                <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <p className="text-xs font-bold text-blue-600 uppercase tracking-tight">Total Duration</p>
                                            <p className="text-lg font-bold text-blue-900">{formatDuration(totalDuration)}</p>
                                        </div>
                                        <div className="h-8 w-px bg-blue-200" />
                                        <div>
                                            <p className="text-xs font-bold text-blue-600 uppercase tracking-tight">Estimated Price</p>
                                            <p className="text-lg font-bold text-blue-900">{formatCents(totalPrice)}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step: Date & Time */}
                    {currentStep === 'datetime' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
                            <div className="space-y-3">
                                <Label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                    <Calendar size={16} />{t('appt.selectDate')}
                                </Label>
                                <Input
                                    type="date"
                                    value={selectedDate}
                                    min={todayStr}
                                    onChange={e => setSelectedDate(e.target.value)}
                                    className="h-11 bg-slate-50 border-slate-200 focus:bg-white rounded-lg"
                                />
                                {selectedDate && (
                                    <p className="text-xs text-slate-600 font-medium">{formatDateWithDay(selectedDate)}</p>
                                )}
                            </div>

                            {canShowSlots && selectedDate && (
                                <div className="space-y-3">
                                    <Label className="text-sm font-bold text-slate-900">Available Times</Label>
                                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                        {slotsLoading && (
                                            <div className="flex items-center gap-2 py-4 justify-center text-xs text-slate-400">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                {t('appt.checkingAvailability')}
                                            </div>
                                        )}

                                        {!slotsLoading && slots !== null && slots.length === 0 && (
                                            <p className="text-sm text-slate-500 text-center py-4 font-medium">
                                                {t('appt.noSlotsOnDate')}
                                            </p>
                                        )}

                                        {!slotsLoading && slots !== null && slots.length > 0 && (
                                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                                {slots.map(slot => (
                                                    <button
                                                        key={slot}
                                                        type="button"
                                                        onClick={() => pickSlot(slot)}
                                                        className={cn(
                                                            'h-10 rounded-lg text-sm font-bold border transition-all',
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
                                    {errors.starts_at && <p className="text-xs text-red-500 font-medium">{errors.starts_at}</p>}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step: Review */}
                    {currentStep === 'review' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
                            <div className="space-y-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                                {!isBarber && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-slate-600">{t('appt.barber')}</span>
                                        <span className="text-sm font-semibold text-slate-900">{barbers.find(b => String(b.id) === data.barber_id)?.user?.name}</span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-slate-600">{t('appt.customer')}</span>
                                    <span className="text-sm font-semibold text-slate-900">{data.customer_name}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-slate-600">{t('appt.phone')}</span>
                                    <span className="text-sm font-semibold text-slate-900">{data.customer_phone}</span>
                                </div>
                                {data.customer_email && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-slate-600">{t('appt.email')}</span>
                                        <span className="text-sm font-semibold text-slate-900">{data.customer_email}</span>
                                    </div>
                                )}
                                <div className="h-px bg-slate-200 my-2" />
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-slate-600">{t('appt.service')}</span>
                                    <span className="text-sm font-semibold text-slate-900">{selectedServices.map(s => s.name).join(', ')}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-slate-600">{t('appt.dateTime')}</span>
                                    <span className="text-sm font-semibold text-slate-900">{selectedDate} {selectedSlot}</span>
                                </div>
                                <div className="h-px bg-slate-200 my-2" />
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-slate-600">Total Duration</span>
                                    <span className="text-sm font-semibold text-slate-900">{formatDuration(totalDuration)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-slate-600">{t('price')}</span>
                                    <span className="text-lg font-bold text-emerald-600">{formatCents(totalPrice)}</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="notes" className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                    <AlignLeft size={16} />{t('appt.internalNotes')}
                                </Label>
                                <Textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    className="bg-slate-50 border-slate-200 focus:bg-white rounded-lg min-h-[80px]"
                                    placeholder={t('appt.notesPlaceholder')}
                                    rows={3}
                                />
                            </div>

                            <div className="space-y-3">
                                <Label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                    <Tag size={16} />{t('appt.repeat')}
                                </Label>
                                <Select value={data.recurrence_rule} onValueChange={(v) => setData('recurrence_rule', v ?? 'none')}>
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
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex items-center gap-3 pt-6 border-t border-slate-100">
                        {currentStepIdx > 0 && (
                            <Button
                                type="button"
                                onClick={prevStep}
                                className="bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-lg text-sm font-bold h-11 px-6 transition-all"
                            >
                                Back
                            </Button>
                        )}
                        {currentStepIdx < steps.length - 1 ? (
                            <Button
                                type="button"
                                onClick={nextStep}
                                disabled={!canProceed()}
                                className="bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-sm font-bold h-11 px-6 shadow-sm transition-all flex-1 sm:flex-none flex items-center gap-2 disabled:opacity-50"
                            >
                                Next <ChevronRight className="w-4 h-4" />
                            </Button>
                        ) : (
                            <Button
                                type="submit"
                                disabled={processing}
                                className="bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg text-sm font-bold h-11 px-6 shadow-sm transition-all flex-1 sm:flex-none flex items-center gap-2"
                            >
                                <Check className="w-4 h-4" /> {t('appt.bookAppointment')}
                            </Button>
                        )}
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
