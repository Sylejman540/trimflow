import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import { ChevronLeft, User, Phone, Mail, Briefcase, Scissors, CalendarDays, AlignLeft } from 'lucide-react';
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

interface Barber { id: number; user: { name: string }; specialty?: string; }
interface Service { id: number; name: string; }

export default function Create({ barbers, services }: { barbers: Barber[]; services: Service[] }) {
    const { data, setData, post, processing, errors } = useForm({
        customer_name:  '',
        customer_email: '',
        customer_phone: '',
        barber_id:      '',
        service_id:     '',
        preferred_date: '',
        notes:          '',
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        post(route('waitlist.store'));
    }

    return (
        <AppLayout
            title="Add to Waitlist"
            actions={
                <Link
                    href={route('waitlist.index')}
                    className={cn(buttonVariants({ variant: 'ghost' }), 'h-9 px-4 rounded-lg text-xs font-bold text-slate-500')}
                >
                    <ChevronLeft className="mr-1 h-3.5 w-3.5" /> Back
                </Link>
            }
        >
            <Head title="Add to Waitlist" />

            <div className="mx-auto max-w-2xl mt-4">
                <div className="mb-8 px-2">
                    <h2 className="text-xl font-bold tracking-tight text-slate-900">New Waitlist Entry</h2>
                    <p className="text-sm text-slate-500 mt-1">Add a customer to the waitlist. They'll be notified when a slot opens up.</p>
                </div>

                <form onSubmit={submit} className="space-y-8 bg-white border border-slate-200 rounded-xl p-8 shadow-sm">

                    {/* Customer Info */}
                    <div className="space-y-2">
                        <Label htmlFor="customer_name" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <User size={12} /> Customer Name
                        </Label>
                        <Input
                            id="customer_name"
                            value={data.customer_name}
                            onChange={e => setData('customer_name', e.target.value)}
                            className="h-10 bg-slate-50 border-slate-200 focus:bg-white rounded-lg transition-all"
                            placeholder="e.g. John Doe"
                            required
                        />
                        {errors.customer_name && <p className="text-xs text-red-500 font-medium">{errors.customer_name}</p>}
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="customer_phone" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <Phone size={12} /> Phone
                            </Label>
                            <Input
                                id="customer_phone"
                                type="tel"
                                value={data.customer_phone}
                                onChange={e => setData('customer_phone', e.target.value)}
                                className="h-10 bg-slate-50 border-slate-200 focus:bg-white rounded-lg transition-all"
                                placeholder="+1 (555) 000-0000"
                            />
                            {errors.customer_phone && <p className="text-xs text-red-500 font-medium">{errors.customer_phone}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="customer_email" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <Mail size={12} /> Email
                            </Label>
                            <Input
                                id="customer_email"
                                type="email"
                                value={data.customer_email}
                                onChange={e => setData('customer_email', e.target.value)}
                                className="h-10 bg-slate-50 border-slate-200 focus:bg-white rounded-lg transition-all"
                                placeholder="you@example.com"
                            />
                            {errors.customer_email && <p className="text-xs text-red-500 font-medium">{errors.customer_email}</p>}
                        </div>
                    </div>

                    {/* Preferences */}
                    <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <Briefcase size={12} /> Preferred Barber
                            </Label>
                            <Select value={data.barber_id} onValueChange={v => setData('barber_id', v ?? '')}>
                                <SelectTrigger className="h-10 bg-slate-50 border-slate-200 focus:bg-white transition-all rounded-lg">
                                    <SelectValue placeholder="Any barber" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                                    <SelectItem value="any">Any barber</SelectItem>
                                    {barbers.map(b => (
                                        <SelectItem key={b.id} value={String(b.id)}>{b.user.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <Scissors size={12} /> Preferred Service
                            </Label>
                            <Select value={data.service_id} onValueChange={v => setData('service_id', v ?? '')}>
                                <SelectTrigger className="h-10 bg-slate-50 border-slate-200 focus:bg-white transition-all rounded-lg">
                                    <SelectValue placeholder="Any service" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                                    <SelectItem value="any">Any service</SelectItem>
                                    {services.map(s => (
                                        <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="preferred_date" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <CalendarDays size={12} /> Preferred Date
                        </Label>
                        <Input
                            id="preferred_date"
                            type="date"
                            value={data.preferred_date}
                            onChange={e => setData('preferred_date', e.target.value)}
                            className="h-10 bg-slate-50 border-slate-200 focus:bg-white rounded-lg transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <AlignLeft size={12} /> Notes
                        </Label>
                        <Textarea
                            id="notes"
                            value={data.notes}
                            onChange={e => setData('notes', e.target.value)}
                            className="bg-slate-50 border-slate-200 focus:bg-white rounded-lg min-h-[80px] transition-all"
                            placeholder="Any special requests or preferences..."
                            rows={3}
                        />
                    </div>

                    <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                        <Button
                            type="submit"
                            disabled={processing}
                            className="bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-xs font-bold h-10 px-6 shadow-sm transition-all"
                        >
                            Add to Waitlist
                        </Button>
                        <Link
                            href={route('waitlist.index')}
                            className={cn(buttonVariants({ variant: 'ghost' }), 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 text-xs font-bold h-10 px-4')}
                        >
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
