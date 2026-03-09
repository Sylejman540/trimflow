import { Head, useForm } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { ChevronRight, ChevronLeft, Scissors, User, Clock, CheckCircle2, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn, formatCents } from '@/lib/utils';

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
}

interface Service {
    id: number;
    name: string;
    price: number;
    duration: number;
    category?: string;
    description?: string;
}

const STEPS = ['Service', 'Barber', 'Date & Time', 'Your Info'];

function StepIndicator({ current }: { current: number }) {
    return (
        <div className="flex items-center justify-center gap-2 mb-8">
            {STEPS.map((label, i) => (
                <div key={i} className="flex items-center gap-2">
                    <div className={cn(
                        'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors',
                        i < current ? 'bg-slate-900 text-white' :
                        i === current ? 'bg-slate-900 text-white ring-2 ring-slate-900 ring-offset-2' :
                        'bg-slate-100 text-slate-400'
                    )}>
                        {i < current ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                    </div>
                    <span className={cn('hidden sm:block text-xs font-medium', i === current ? 'text-slate-900' : 'text-slate-400')}>
                        {label}
                    </span>
                    {i < STEPS.length - 1 && <ChevronRight className="h-4 w-4 text-slate-300" />}
                </div>
            ))}
        </div>
    );
}

// Generate time slots every 30 minutes
function generateSlots(start = '08:00', end = '20:00') {
    const slots: string[] = [];
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    let h = sh, m = sm;
    while (h < eh || (h === eh && m < em)) {
        slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
        m += 30;
        if (m >= 60) { h++; m -= 60; }
    }
    return slots;
}

function todayStr() {
    return new Date().toISOString().split('T')[0];
}

export default function Show({ company, barbers, services }: {
    company: Company;
    barbers: Barber[];
    services: Service[];
}) {
    const [step, setStep] = useState(0);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
    const [selectedDate, setSelectedDate] = useState(todayStr());
    const [selectedTime, setSelectedTime] = useState('');

    const { data, setData, post, processing, errors } = useForm({
        barber_id: '',
        service_id: '',
        starts_at: '',
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        notes: '',
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

    const slots = generateSlots();

    function selectService(s: Service) {
        setSelectedService(s);
        setData('service_id', String(s.id));
        setStep(1);
    }

    function selectBarber(b: Barber) {
        setSelectedBarber(b);
        setData('barber_id', String(b.id));
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
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-2xl mx-auto px-4 py-5 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900">
                        <Scissors className="h-4 w-4 text-white" />
                    </div>
                    <div>
                        <h1 className="text-base font-semibold text-slate-900">{company.name}</h1>
                        {company.address && <p className="text-xs text-slate-500">{company.address}</p>}
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-8">
                <StepIndicator current={step} />

                {/* Step 0: Service */}
                {step === 0 && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-slate-900">Choose a Service</h2>

                        {categories.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => setCategoryFilter('')}
                                    className={cn('px-3 py-1 rounded-full text-xs font-medium border transition-colors',
                                        !categoryFilter ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                                    )}
                                >All</button>
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
                            {filteredServices.map(s => (
                                <button
                                    key={s.id}
                                    onClick={() => selectService(s)}
                                    className="w-full flex items-center justify-between bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-400 hover:shadow-sm transition-all text-left"
                                >
                                    <div>
                                        <p className="text-sm font-medium text-slate-900">{s.name}</p>
                                        {s.description && <p className="text-xs text-slate-500 mt-0.5">{s.description}</p>}
                                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                                            <Clock className="h-3 w-3" /> {s.duration} min
                                        </p>
                                    </div>
                                    <span className="text-sm font-semibold text-slate-900">{formatCents(s.price)}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 1: Barber */}
                {step === 1 && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <button onClick={() => setStep(0)} className="text-slate-400 hover:text-slate-700">
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <h2 className="text-lg font-semibold text-slate-900">Choose a Barber</h2>
                        </div>

                        <div className="space-y-2">
                            {barbers.map(b => (
                                <button
                                    key={b.id}
                                    onClick={() => selectBarber(b)}
                                    className="w-full flex items-center gap-4 bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-400 hover:shadow-sm transition-all text-left"
                                >
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 shrink-0">
                                        <User className="h-5 w-5 text-slate-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-900">{b.user.name}</p>
                                        {b.specialty && <p className="text-xs text-slate-500">{b.specialty}</p>}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 2: Date & Time */}
                {step === 2 && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <button onClick={() => setStep(1)} className="text-slate-400 hover:text-slate-700">
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <h2 className="text-lg font-semibold text-slate-900">Pick a Date & Time</h2>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                    <Calendar className="h-3.5 w-3.5 inline mr-1" /> Date
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
                                    <Clock className="h-3.5 w-3.5 inline mr-1" /> Time
                                </label>
                                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                                    {slots.map(slot => (
                                        <button
                                            key={slot}
                                            onClick={() => selectTime(slot)}
                                            className={cn(
                                                'py-2 text-xs font-medium rounded-lg border transition-colors',
                                                selectedTime === slot
                                                    ? 'bg-slate-900 text-white border-slate-900'
                                                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                                            )}
                                        >
                                            {slot}
                                        </button>
                                    ))}
                                </div>
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
                            <h2 className="text-lg font-semibold text-slate-900">Your Details</h2>
                        </div>

                        {/* Summary */}
                        <div className="bg-slate-900 rounded-xl p-4 text-white space-y-1">
                            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Booking Summary</p>
                            <p className="text-sm font-semibold">{selectedService?.name} · {formatCents(selectedService?.price ?? 0)}</p>
                            <p className="text-xs text-slate-300">{selectedBarber?.user.name} · {selectedDate} at {selectedTime}</p>
                        </div>

                        <form onSubmit={submit} className="space-y-4">
                            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Name *</label>
                                    <input
                                        type="text"
                                        value={data.customer_name}
                                        onChange={e => setData('customer_name', e.target.value)}
                                        placeholder="Your full name"
                                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-900"
                                        required
                                    />
                                    {errors.customer_name && <p className="text-xs text-red-500 mt-1">{errors.customer_name}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Phone</label>
                                    <input
                                        type="tel"
                                        value={data.customer_phone}
                                        onChange={e => setData('customer_phone', e.target.value)}
                                        placeholder="+1 (555) 000-0000"
                                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-900"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={data.customer_email}
                                        onChange={e => setData('customer_email', e.target.value)}
                                        placeholder="you@example.com"
                                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-900"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Notes</label>
                                    <textarea
                                        value={data.notes}
                                        onChange={e => setData('notes', e.target.value)}
                                        placeholder="Any special requests?"
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
                                {processing ? 'Booking...' : 'Confirm Booking'}
                            </Button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
