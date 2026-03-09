import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FormEvent, useState, useMemo } from 'react';
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
import { Calendar, User, Scissors, AlignLeft, Phone, Tag } from 'lucide-react';

export default function Create({
    barbers,
    services,
}: {
    barbers: Barber[];
    services: Service[];
}) {
    const { auth } = usePage<PageProps>().props;
    const isBarber = auth.roles.includes('barber') && !auth.roles.includes('shop-admin');

    const { data, setData, post, processing, errors } = useForm({
        barber_id: isBarber ? String(barbers[0]?.id ?? '') : '',
        customer_name: '',
        customer_phone: '',
        service_id: '',
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

    const selectedService = services.find(
        (s) => s.id === Number(data.service_id),
    );

    function submit(e: FormEvent) {
        e.preventDefault();
        post(route('appointments.store'));
    }

    return (
        <AppLayout title="New Appointment">
            <Head title="New Appointment" />
            
            <div className="mx-auto max-w-2xl">
                {/* Header Section */}
                <div className="mb-6 px-1">
                    <h2 className="text-xl font-bold tracking-tight text-slate-900">Booking Details</h2>
                    <p className="text-sm text-slate-500 mt-1">Fill in the information below to schedule a new session.</p>
                </div>

                <form onSubmit={submit} className="space-y-6 bg-white border border-slate-200 rounded-xl p-4 sm:p-8 shadow-sm">
                    
                    {/* Barber Selection (If applicable) */}
                    {!isBarber && (
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <User size={12} /> Assigned Barber
                            </Label>
                            <Select
                                value={data.barber_id}
                                onValueChange={(v) => setData('barber_id', v ?? '')}
                            >
                                <SelectTrigger className="h-10 bg-slate-50 border-slate-200 focus:bg-white transition-all rounded-lg">
                                    <SelectValue placeholder="Select barber" />
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

                    {/* Customer Info Grid */}
                    <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="customer_name" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <User size={12} /> Customer Name
                            </Label>
                            <Input
                                id="customer_name"
                                value={data.customer_name}
                                onChange={(e) => setData('customer_name', e.target.value)}
                                className="h-10 bg-slate-50 border-slate-200 focus:bg-white rounded-lg"
                                placeholder="e.g. John Doe"
                                required
                            />
                            {errors.customer_name && <p className="text-xs text-red-500 font-medium">{errors.customer_name}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="customer_phone" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <Phone size={12} /> Phone Number
                            </Label>
                            <Input
                                id="customer_phone"
                                value={data.customer_phone}
                                onChange={(e) => setData('customer_phone', e.target.value)}
                                className="h-10 bg-slate-50 border-slate-200 focus:bg-white rounded-lg"
                                placeholder="+1 (555) 000-0000"
                            />
                            {errors.customer_phone && <p className="text-xs text-red-500 font-medium">{errors.customer_phone}</p>}
                        </div>
                    </div>

                    {/* Service Selection */}
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <Scissors size={12} /> Service Type
                        </Label>
                        {categories.length > 2 && (
                            <div className="flex items-center gap-2 flex-wrap">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => {
                                            setCategoryFilter(cat);
                                            setData('service_id', '');
                                        }}
                                        className={cn(
                                            'inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors border',
                                            categoryFilter === cat
                                                ? 'bg-slate-900 text-white border-slate-900'
                                                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400',
                                        )}
                                    >
                                        <Tag size={9} />
                                        {cat === 'all' ? 'All' : cat}
                                    </button>
                                ))}
                            </div>
                        )}
                        <Select
                            value={data.service_id}
                            onValueChange={(v) => setData('service_id', v ?? '')}
                        >
                            <SelectTrigger className="h-10 bg-slate-50 border-slate-200 focus:bg-white rounded-lg">
                                <SelectValue placeholder="Select service" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-200 shadow-xl min-w-[260px]">
                                {filteredServices.map((s) => (
                                    <SelectItem key={s.id} value={String(s.id)} className="text-sm">
                                        {s.name} — {formatCents(s.price)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {selectedService && (
                            <div className="flex items-center gap-2 px-1 mt-1">
                                <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-5 py-0.5 rounded-full border border-blue-100 uppercase tracking-tight">
                                    {formatDuration(selectedService.duration)}
                                </span>
                                <span className="text-[11px] font-bold text-slate-500">
                                    Estimated Price: {formatCents(selectedService.price)}
                                </span>
                            </div>
                        )}
                        {errors.service_id && <p className="text-xs text-red-500 font-medium">{errors.service_id}</p>}
                    </div>

                    {/* Time & Notes */}
                    <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="starts_at" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <Calendar size={12} /> Date & Time
                            </Label>
                            <Input
                                id="starts_at"
                                type="datetime-local"
                                value={data.starts_at}
                                onChange={(e) => setData('starts_at', e.target.value)}
                                className="h-10 bg-slate-50 border-slate-200 focus:bg-white rounded-lg"
                                required
                            />
                            {errors.starts_at && <p className="text-xs text-red-500 font-medium">{errors.starts_at}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="notes" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <AlignLeft size={12} /> Internal Notes
                            </Label>
                            <Textarea
                                id="notes"
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                className="bg-slate-50 border-slate-200 focus:bg-white rounded-lg min-h-[42px] transition-all"
                                placeholder="Allergies, preferences, etc..."
                                rows={1}
                            />
                        </div>
                    </div>

                    {/* Recurrence */}
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <Tag size={12} /> Repeat
                        </Label>
                        <Select
                            value={data.recurrence_rule}
                            onValueChange={(v) => setData('recurrence_rule', v ?? 'none')}
                        >
                            <SelectTrigger className="h-10 bg-slate-50 border-slate-200 focus:bg-white rounded-lg">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                                <SelectItem value="none">Does not repeat</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="biweekly">Every 2 weeks</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                        <Button 
                            type="submit" 
                            disabled={processing} 
                            className="bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-xs font-bold h-10 px-6 shadow-sm transition-all"
                        >
                            Book Appointment
                        </Button>
                        <Link 
                            href={route('appointments.index')} 
                            className={cn(buttonVariants({ variant: "ghost" }), "text-slate-500 hover:bg-slate-50 hover:text-slate-900 text-xs font-bold h-10 px-4")}
                        >
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}