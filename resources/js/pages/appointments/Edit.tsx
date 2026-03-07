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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCents, formatDuration } from '@/lib/utils';
import { Appointment, Barber, Service } from '@/types';

const statuses = [
    'scheduled',
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
}: {
    appointment: Appointment;
    barbers: Barber[];
    services: Service[];
}) {
    const { data, setData, put, processing, errors } = useForm({
        barber_id: String(appointment.barber_id),
        service_id: String(appointment.service_id),
        customer_name: appointment.customer_name,
        customer_phone: appointment.customer_phone ?? '',
        starts_at: appointment.starts_at.slice(0, 16),
        status: appointment.status,
        notes: appointment.notes ?? '',
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
                <Card>
                    <CardHeader>
                        <CardTitle>Edit Appointment</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="customer_name">Customer Name</Label>
                                <Input
                                    id="customer_name"
                                    value={data.customer_name}
                                    onChange={(e) => setData('customer_name', e.target.value)}
                                    required
                                />
                                {errors.customer_name && <p className="text-sm text-destructive">{errors.customer_name}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="customer_phone">
                                    Phone{' '}
                                    <span className="text-muted-foreground">(optional)</span>
                                </Label>
                                <Input
                                    id="customer_phone"
                                    value={data.customer_phone}
                                    onChange={(e) => setData('customer_phone', e.target.value)}
                                    placeholder="(555) 123-4567"
                                />
                                {errors.customer_phone && <p className="text-sm text-destructive">{errors.customer_phone}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label>Barber</Label>
                                <Select
                                    value={data.barber_id}
                                    onValueChange={(v) => setData('barber_id', v ?? '')}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select barber" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {barbers.map((b) => (
                                            <SelectItem key={b.id} value={String(b.id)}>
                                                {b.user?.name ?? ''}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.barber_id && <p className="text-sm text-destructive">{errors.barber_id}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label>Service</Label>
                                <Select
                                    value={data.service_id}
                                    onValueChange={(v) => setData('service_id', v ?? '')}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select service" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {services.map((s) => (
                                            <SelectItem key={s.id} value={String(s.id)}>
                                                {s.name} - {formatCents(s.price)} ({formatDuration(s.duration)})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {selectedService && (
                                    <p className="text-sm text-muted-foreground">
                                        Duration: {formatDuration(selectedService.duration)} | Price: {formatCents(selectedService.price)}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="starts_at">Date & Time</Label>
                                <Input
                                    id="starts_at"
                                    type="datetime-local"
                                    value={data.starts_at}
                                    onChange={(e) => setData('starts_at', e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select
                                    value={data.status}
                                    onValueChange={(v) => v && setData('status', v as typeof data.status)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {statuses.map((s) => (
                                            <SelectItem key={s} value={s}>
                                                {s.replace('_', ' ')}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    rows={3}
                                />
                            </div>

                            <div className="flex gap-3">
                                <Button type="submit" disabled={processing}>
                                    Update Appointment
                                </Button>
                                <Link href={route('appointments.index')} className={buttonVariants({ variant: "outline" })}>Cancel</Link>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
