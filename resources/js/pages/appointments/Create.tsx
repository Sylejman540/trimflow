import { Head, Link, useForm, usePage } from '@inertiajs/react';
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
import { Barber, PageProps, Service } from '@/types';

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
    });

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
                <Card>
                    <CardHeader>
                        <CardTitle>Book Appointment</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-6">
                            {!isBarber && (
                                <div className="space-y-2">
                                    <Label>Barber</Label>
                                    <Select
                                        value={data.barber_id}
                                        onValueChange={(v) =>
                                            setData('barber_id', v ?? '')
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select barber" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {barbers.map((b) => (
                                                <SelectItem
                                                    key={b.id}
                                                    value={String(b.id)}
                                                >
                                                    {b.user?.name ?? ''}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.barber_id && (
                                        <p className="text-sm text-destructive">
                                            {errors.barber_id}
                                        </p>
                                    )}
                                </div>
                            )}

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="customer_name">Customer Name</Label>
                                    <Input
                                        id="customer_name"
                                        value={data.customer_name}
                                        onChange={(e) => setData('customer_name', e.target.value)}
                                        placeholder="John Doe"
                                        required
                                    />
                                    {errors.customer_name && (
                                        <p className="text-sm text-destructive">{errors.customer_name}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="customer_phone">Customer Phone</Label>
                                    <Input
                                        id="customer_phone"
                                        value={data.customer_phone}
                                        onChange={(e) => setData('customer_phone', e.target.value)}
                                        placeholder="+1 234 567 890"
                                    />
                                    {errors.customer_phone && (
                                        <p className="text-sm text-destructive">{errors.customer_phone}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Service</Label>
                                <Select
                                    value={data.service_id}
                                    onValueChange={(v) =>
                                        setData('service_id', v ?? '')
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select service" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {services.map((s) => (
                                            <SelectItem
                                                key={s.id}
                                                value={String(s.id)}
                                            >
                                                {s.name} -{' '}
                                                {formatCents(s.price)} (
                                                {formatDuration(s.duration)})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.service_id && (
                                    <p className="text-sm text-destructive">
                                        {errors.service_id}
                                    </p>
                                )}
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
                                    onChange={(e) =>
                                        setData('starts_at', e.target.value)
                                    }
                                    required
                                />
                                {errors.starts_at && (
                                    <p className="text-sm text-destructive">
                                        {errors.starts_at}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) =>
                                        setData('notes', e.target.value)
                                    }
                                    rows={3}
                                />
                            </div>

                            <div className="flex gap-3">
                                <Button type="submit" disabled={processing}>
                                    Book Appointment
                                </Button>
                                <Link href={route('appointments.index')} className={buttonVariants({ variant: "outline" })}>
                                    Cancel
                                </Link>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
