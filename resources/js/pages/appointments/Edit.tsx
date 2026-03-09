import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
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
import { Appointment, Barber, Service } from '@/types';
import { Calendar, User, Scissors, AlignLeft, Phone, Info, DollarSign, RefreshCw } from 'lucide-react';

const statuses = [
    'confirmed',
    'in_progress',
    'completed',
    'cancelled',
    'no_show',
] as const;

export default function Edit({
    appointment,
    barbers,
    services,
    is_barber,
}: {
    appointment: Appointment;
    barbers: Barber[];
    services: Service[];
    is_barber: boolean;
}) {
    const isRecurring = appointment.recurrence_rule && appointment.recurrence_rule !== 'none';

    const { data, setData, put, processing, errors } = useForm({
        barber_id: String(appointment.barber_id),
        customer_name: appointment.customer?.name ?? '',
        customer_phone: appointment.customer?.phone ?? '',
        service_id: String(appointment.service_id),
        starts_at: appointment.starts_at.slice(0, 16),
        status: appointment.status,
        notes: appointment.notes ?? '',
        tip_amount: appointment.tip_amount ? String(appointment.tip_amount / 100) : '0',
        update_scope: 'this' as 'this' | 'future',
    });

    const selectedService = services.find(
        (s) => s.id === Number(data.service_id),
    );

    function submit(e: FormEvent) {
        e.preventDefault();
        put(route('appointments.update', appointment.id));
    }

    return (
        <AppLayout title="Edit Appointment">
            <Head title="Edit Appointment" />
            
            <div className="mx-auto max-w-2xl">
                {/* Header Section */}
                <div className="mb-6 px-1">
                    <h2 className="text-xl font-bold tracking-tight text-slate-900">Edit Appointment</h2>
                    <p className="text-sm text-slate-500 mt-1">Update the information below to modify this session.</p>
                </div>

                <form onSubmit={submit} className="space-y-6 bg-white border border-slate-200 rounded-xl p-4 sm:p-8 shadow-sm">
                    
                    {/* Status & Barber Selection */}
                    <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <Info size={12} /> Appointment Status
                            </Label>
                            <Select
                                value={data.status}
                                onValueChange={(v) => v && setData('status', v as typeof data.status)}
                            >
                                <SelectTrigger className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-all rounded-lg capitalize">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                                    {statuses.map((s) => (
                                        <SelectItem key={s} value={s} className="capitalize text-sm font-medium">
                                            {s.replace('_', ' ')}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.status && <p className="text-xs text-red-500 font-medium">{errors.status}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <User size={12} /> Assigned Barber
                            </Label>
                            {is_barber ? (
                                <div className="h-10 bg-slate-50 border border-slate-200 rounded-lg px-3 flex items-center text-sm text-slate-700">
                                    {appointment.barber?.user?.name ?? 'You'}
                                </div>
                            ) : (
                                <Select
                                    value={data.barber_id}
                                    onValueChange={(v) => setData('barber_id', v ?? '')}
                                >
                                    <SelectTrigger className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-all rounded-lg">
                                        <SelectValue placeholder="Select barber" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                                        {barbers.map((b) => (
                                            <SelectItem key={b.id} value={String(b.id)} className="text-sm font-medium">
                                                {b.user?.name ?? ''}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                            {errors.barber_id && <p className="text-xs text-red-500 font-medium">{errors.barber_id}</p>}
                        </div>
                    </div>

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
                                className="h-11 bg-slate-50 border-slate-200 focus:bg-white rounded-lg"
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
                                className="h-11 bg-slate-50 border-slate-200 focus:bg-white rounded-lg"
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
                        <Select
                            value={data.service_id}
                            onValueChange={(v) => setData('service_id', v ?? '')}
                        >
                            <SelectTrigger className="h-11 bg-slate-50 border-slate-200 focus:bg-white rounded-lg">
                                <SelectValue placeholder="Select service" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-200 shadow-xl min-w-[260px]">
                                {services.map((s) => (
                                    <SelectItem key={s.id} value={String(s.id)} className="text-sm font-medium">
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
                                className="h-11 bg-slate-50 border-slate-200 focus:bg-white rounded-lg"
                                required
                            />
                            {errors.starts_at && <p className="text-xs text-red-500 font-medium">{errors.starts_at}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="tip_amount" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <DollarSign size={12} /> Tip ($)
                            </Label>
                            <Input
                                id="tip_amount"
                                type="number"
                                min="0"
                                step="0.01"
                                value={data.tip_amount}
                                onChange={(e) => setData('tip_amount', e.target.value)}
                                className="h-11 bg-slate-50 border-slate-200 focus:bg-white rounded-lg"
                                placeholder="0.00"
                            />
                            {errors.tip_amount && <p className="text-xs text-red-500 font-medium">{errors.tip_amount}</p>}
                        </div>
                    </div>

                    {/* Notes */}
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

                    {/* Recurrence scope */}
                    {isRecurring && (
                        <div className="rounded-lg border border-amber-100 bg-amber-50 p-3 space-y-2">
                            <div className="flex items-center gap-2 text-xs font-bold text-amber-700">
                                <RefreshCw className="h-3.5 w-3.5" />
                                This is a recurring appointment
                            </div>
                            <div className="flex items-center gap-4">
                                {(['this', 'future'] as const).map((scope) => (
                                    <label key={scope} className="flex items-center gap-2 text-xs text-amber-800 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="update_scope"
                                            value={scope}
                                            checked={data.update_scope === scope}
                                            onChange={() => setData('update_scope', scope)}
                                            className="accent-amber-600"
                                        />
                                        {scope === 'this' ? 'This appointment only' : 'This and all future'}
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                        <Button
                            type="submit"
                            disabled={processing}
                            className="bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-sm font-bold h-11 px-6 shadow-sm transition-all flex-1 sm:flex-none"
                        >
                            Update Appointment
                        </Button>
                        <Link
                            href={route('appointments.index')}
                            className={cn(buttonVariants({ variant: "ghost" }), "text-slate-500 hover:bg-slate-50 hover:text-slate-900 text-sm font-bold h-11 px-4")}
                        >
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}