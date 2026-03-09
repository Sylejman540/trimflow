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
import { Barber, Customer } from '@/types';
import { User, Mail, Phone, MapPin, Star, ClipboardList, Save } from 'lucide-react';

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
        address: customer.address ?? '',
        notes: customer.notes ?? '',
        favorite_barber_id: customer.favorite_barber_id ? String(customer.favorite_barber_id) : '',
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        put(route('customers.update', customer.id));
    }

    return (
        <AppLayout title="Edit Customer">
            <Head title={`Edit ${customer.name}`} />
            
            <div className="mx-auto max-w-2xl mt-4 pb-12">
                {/* Header Section */}
                <div className="mb-8 px-2">
                    <h2 className="text-xl font-bold tracking-tight text-slate-900">Edit Customer</h2>
                    <p className="text-sm text-slate-500 mt-1">Update profile information, contact details, and internal shop notes.</p>
                </div>

                <form onSubmit={submit} className="space-y-8 bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
                    
                    {/* Basic Identity */}
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <User size={12} /> Full Name
                        </Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="h-10 bg-slate-50 border-slate-200 focus:bg-white rounded-lg transition-all"
                            required
                        />
                        {errors.name && <p className="text-xs text-red-500 font-medium">{errors.name}</p>}
                    </div>

                    {/* Contact Grid */}
                    <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <Mail size={12} /> Email Address
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className="h-10 bg-slate-50 border-slate-200 focus:bg-white rounded-lg transition-all"
                                placeholder="customer@example.com"
                            />
                            {errors.email && <p className="text-xs text-red-500 font-medium">{errors.email}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <Phone size={12} /> Phone Number
                            </Label>
                            <Input
                                id="phone"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                className="h-10 bg-slate-50 border-slate-200 focus:bg-white rounded-lg transition-all"
                                placeholder="+1 (555) 000-0000"
                            />
                            {errors.phone && <p className="text-xs text-red-500 font-medium">{errors.phone}</p>}
                        </div>
                    </div>

                    {/* Address Field */}
                    <div className="space-y-2">
                        <Label htmlFor="address" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <MapPin size={12} /> Physical Address
                        </Label>
                        <Textarea
                            id="address"
                            value={data.address}
                            onChange={(e) => setData('address', e.target.value)}
                            className="bg-slate-50 border-slate-200 focus:bg-white rounded-lg min-h-[60px] transition-all"
                            rows={2}
                        />
                    </div>

                    {/* Preferences Section */}
                    <div className="pt-4 border-t border-slate-100 space-y-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-[#637060] flex items-center gap-2">
                                <Star size={12} /> Preferred Barber
                            </Label>
                            <Select
                                value={data.favorite_barber_id}
                                onValueChange={(v) => setData('favorite_barber_id', v ?? '')}
                            >
                                <SelectTrigger className="h-10 bg-slate-50 border-slate-200 focus:bg-white rounded-lg transition-all">
                                    <SelectValue placeholder="Assign a favorite barber (optional)" />
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
                            <Label htmlFor="notes" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <ClipboardList size={12} /> Internal Client Notes
                            </Label>
                            <Textarea
                                id="notes"
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                className="bg-slate-50 border-slate-200 focus:bg-white rounded-lg min-h-[100px] transition-all"
                                placeholder="Add preferences, sensitivities, or style notes..."
                                rows={4}
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 pt-6 border-t border-slate-100">
                        <Button 
                            type="submit" 
                            disabled={processing} 
                            className="bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-xs font-bold h-10 px-6 shadow-sm transition-all"
                        >
                        
                            Update Customer
                        </Button>
                        <Link 
                            href={route('customers.index')} 
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