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
import { User, Mail, Phone, MapPin, Star, ClipboardList, UserPlus } from 'lucide-react';

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
            
            <div className="mx-auto max-w-2xl mt-4 pb-12">
                {/* Header Section */}
                <div className="mb-8 px-2">
                    <h2 className="text-xl font-bold tracking-tight text-slate-900">Add Customer</h2>
                    <p className="text-sm text-slate-500 mt-1">Register a new client to track their loyalty, preferences, and appointment history.</p>
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
                            placeholder="e.g. James Harrison"
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
                                placeholder="client@example.com"
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

                    {/* Preferences & Details */}
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
                            <Label htmlFor="address" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <MapPin size={12} /> Address
                            </Label>
                            <Textarea
                                id="address"
                                value={data.address}
                                onChange={(e) => setData('address', e.target.value)}
                                className="bg-slate-50 border-slate-200 focus:bg-white rounded-lg min-h-[60px] transition-all"
                                placeholder="Street address, City, Zip"
                                rows={2}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <ClipboardList size={12} /> Internal Notes
                            </Label>
                            <Textarea
                                id="notes"
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                className="bg-slate-50 border-slate-200 focus:bg-white rounded-lg min-h-[100px] transition-all"
                                placeholder="Hair type, sensitivities, or special requests..."
                                rows={3}
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
                            <UserPlus className="mr-2 h-3.5 w-3.5" />
                            Create Customer
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