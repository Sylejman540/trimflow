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
import { Barber, Customer } from '@/types';

export default function Edit({
    customer,
    barbers,
}: {
    customer: Customer;
    barbers: Barber[];
}) {
    const { data, setData, put, processing, errors } = useForm({
        name: customer.name,
        email: customer.email ?? '',
        phone: customer.phone ?? '',
        address: '',
        notes: customer.notes ?? '',
        favorite_barber_id: customer.favorite_barber_id ? String(customer.favorite_barber_id) : '',
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        put(route('customers.update', customer.id));
    }

    return (
        <AppLayout title="Edit Customer">
            <Head title="Edit Customer" />
            <div className="mx-auto max-w-2xl">
                <Card>
                    <CardHeader>
                        <CardTitle>Edit Customer</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                />
                                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                />
                                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                    id="phone"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                />
                                {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">Address</Label>
                                <Textarea
                                    id="address"
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    rows={2}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Favorite Barber</Label>
                                <Select
                                    value={data.favorite_barber_id}
                                    onValueChange={(v) => setData('favorite_barber_id', v ?? '')}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select barber (optional)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {barbers.map((b) => (
                                            <SelectItem key={b.id} value={String(b.id)}>
                                                {b.user?.name ?? ''}
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
                                    Update Customer
                                </Button>
                                <Link href={route('customers.index')} className={buttonVariants({ variant: "outline" })}>
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
