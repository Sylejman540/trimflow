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
import { cn } from '@/lib/utils';
import { Barber } from '@/types';
import { User, Phone, Mail, MapPin, AlignLeft, Star } from 'lucide-react';

export default function Create({ barbers }: { barbers: Barber[] }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        phone: '',
        address: '',
        notes: '',
        favorite_barber_id: '',
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        post(route('customers.store'));
    }

    return (
        <AppLayout title="New Customer">
            <Head title="New Customer" />

            <div className="mx-auto max-w-2xl">
                <div className="mb-6 px-1">
                    <h2 className="text-xl font-bold tracking-tight text-slate-900">New Customer</h2>
                    <p className="text-sm text-slate-500 mt-1">Add a new customer to your shop.</p>
                </div>

                <form onSubmit={submit} className="space-y-6 bg-white border border-slate-200 rounded-xl p-4 sm:p-8 shadow-sm">
                    <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <User size={12} /> Name
                            </Label>
                            <Input
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                className="h-11 bg-slate-50 border-slate-200 focus:bg-white rounded-lg"
                                placeholder="e.g. John Doe"
                                required
                            />
                            {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <Phone size={12} /> Phone
                            </Label>
                            <Input
                                value={data.phone}
                                onChange={e => setData('phone', e.target.value)}
                                className="h-11 bg-slate-50 border-slate-200 focus:bg-white rounded-lg"
                                placeholder="+1 (555) 000-0000"
                            />
                            {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
                        </div>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <Mail size={12} /> Email
                            </Label>
                            <Input
                                type="email"
                                value={data.email}
                                onChange={e => setData('email', e.target.value)}
                                className="h-11 bg-slate-50 border-slate-200 focus:bg-white rounded-lg"
                                placeholder="john@example.com"
                            />
                            {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <Star size={12} /> Favorite Barber
                            </Label>
                            <Select value={data.favorite_barber_id} onValueChange={v => setData('favorite_barber_id', v ?? '')}>
                                <SelectTrigger className="h-11 bg-slate-50 border-slate-200 focus:bg-white rounded-lg">
                                    <SelectValue placeholder="None" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                                    <SelectItem value="none">None</SelectItem>
                                    {barbers.map(b => (
                                        <SelectItem key={b.id} value={String(b.id)}>{b.user?.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <MapPin size={12} /> Address
                        </Label>
                        <Input
                            value={data.address}
                            onChange={e => setData('address', e.target.value)}
                            className="h-11 bg-slate-50 border-slate-200 focus:bg-white rounded-lg"
                            placeholder="123 Main St"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <AlignLeft size={12} /> Notes
                        </Label>
                        <Textarea
                            value={data.notes}
                            onChange={e => setData('notes', e.target.value)}
                            className="bg-slate-50 border-slate-200 focus:bg-white rounded-lg"
                            placeholder="Allergies, preferences, etc..."
                            rows={2}
                        />
                    </div>

                    <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                        <Button type="submit" disabled={processing} className="bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-sm font-bold h-11 px-6 shadow-sm flex-1 sm:flex-none">
                            Save Customer
                        </Button>
                        <Link href={route('customers.index')} className={cn(buttonVariants({ variant: 'ghost' }), 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 text-sm font-bold h-11 px-4')}>
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
