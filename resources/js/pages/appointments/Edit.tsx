import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
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
import { Appointment, Barber, Service } from '@/types';
import { Calendar, User, Scissors, AlignLeft, Phone, Info, DollarSign, RefreshCw, CheckCircle2, Mail } from 'lucide-react';
import { NumberStepper } from '@/components/ui/number-stepper';

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
    appointment: Appointment & { services?: Service[] };
    barbers: Barber[];
    services: Service[];
    is_barber: boolean;
}) {
    const { t } = useTranslation();
    const isRecurring = appointment.recurrence_rule && appointment.recurrence_rule !== 'none';

    // Resolve initial selected services: prefer pivot services[], fall back to primary service_id
    const initialServiceIds = appointment.services && appointment.services.length > 0
        ? appointment.services.map(s => String(s.id))
        : [String(appointment.service_id)];

    const { data, setData, put, processing, errors } = useForm({
        barber_id: String(appointment.barber_id),
        customer_name: appointment.customer?.name ?? '',
        customer_phone: appointment.customer?.phone ?? '',
        customer_email: appointment.customer?.email ?? '',
        service_ids: initialServiceIds,
        starts_at: appointment.starts_at.slice(0, 16),
        status: appointment.status,
        notes: appointment.notes ?? '',
        tip_amount: appointment.tip_amount ? String(appointment.tip_amount / 100) : '0',
        update_scope: 'this' as 'this' | 'future',
    });

    const selectedServices = services.filter(s => data.service_ids.includes(String(s.id)));
    const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration, 0);
    const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);

    function toggleService(s: Service) {
        const id = String(s.id);
        setData('service_ids', data.service_ids.includes(id)
            ? data.service_ids.filter(x => x !== id)
            : [...data.service_ids, id]
        );
    }

    function submit(e: FormEvent) {
        e.preventDefault();
        put(route('appointments.update', appointment.id));
    }

    return (
        <AppLayout title={t('appt.edit')}>
            <Head title={t('appt.edit')} />

            <div className="mx-auto max-w-2xl">
                <div className="mb-6 px-1">
                    <h2 className="text-xl font-bold tracking-tight text-slate-900">{t('appt.edit')}</h2>
                    <p className="text-sm text-slate-500 mt-1">{t('appt.editDesc')}</p>
                </div>

                <form onSubmit={submit} className="space-y-6 bg-white border border-slate-200 rounded-xl p-4 sm:p-8 shadow-sm">

                    {/* Status & Barber Selection */}
                    <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <Info size={12} />{' '}{t('appt.apptStatus')}
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
                                <User size={12} />{' '}{t('appt.assignedBarber')}
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
                                        <SelectValue placeholder={t('appt.selectBarber')} />
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

                        <div className="space-y-1.5 rounded-xl border border-slate-200 overflow-hidden">
                            {services.map((s) => {
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
                            </div>
                        )}
                        {errors.service_ids && <p className="text-xs text-red-500 font-medium">{errors.service_ids}</p>}
                    </div>

                    {/* Time & Tip */}
                    <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="starts_at" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <Calendar size={12} />{' '}{t('appt.dateTime')}
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
                                <DollarSign size={12} />{' '}{t('appt.tip')}
                            </Label>
                            <NumberStepper
                                id="tip_amount"
                                value={Number(data.tip_amount) || 0}
                                onChange={v => setData('tip_amount', String(v))}
                                min={0}
                                step={0.5}
                                decimal
                                className="h-11"
                            />
                            {errors.tip_amount && <p className="text-xs text-red-500 font-medium">{errors.tip_amount}</p>}
                        </div>
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

                    {/* Recurrence scope */}
                    {isRecurring && (
                        <div className="rounded-lg border border-amber-100 bg-amber-50 p-3 space-y-2">
                            <div className="flex items-center gap-2 text-xs font-bold text-amber-700">
                                <RefreshCw className="h-3.5 w-3.5" />
                                {t('appt.recurringAppt')}
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
                                        {scope === 'this' ? t('appt.thisOnly') : t('appt.thisFuture')}
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                        <Button
                            type="submit"
                            disabled={processing || data.service_ids.length === 0}
                            className="bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-sm font-bold h-11 px-6 shadow-sm transition-all flex-1 sm:flex-none"
                        >
                            {t('appt.updateAppointment')}
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
