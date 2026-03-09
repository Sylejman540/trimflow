import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import AppLayout from '@/layouts/AppLayout';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { User, Mail, Lock, Star, AlignLeft, UserPlus } from 'lucide-react';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        bio: '',
        specialty: '',
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        post(route('barbers.store'));
    }

    return (
        <AppLayout title="Add Barber">
            <Head title="Add Barber" />
            
            <div className="mx-auto max-w-2xl mt-4">
                {/* Header Section */}
                <div className="mb-8 px-2">
                    <h2 className="text-xl font-bold tracking-tight text-slate-900">New Barber</h2>
                    <p className="text-sm text-slate-500 mt-1">Create a new professional profile and login credentials for a barber.</p>
                </div>

                <form onSubmit={submit} className="space-y-8 bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
                    
                    {/* Identity Section */}
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <User size={12} /> Full Name
                        </Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="h-10 bg-slate-50 border-slate-200 focus:bg-white rounded-lg transition-all"
                            placeholder="e.g. Marcus Wright"
                            required
                        />
                        {errors.name && <p className="text-xs text-red-500 font-medium">{errors.name}</p>}
                    </div>

                    {/* Login Credentials Grid */}
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
                                placeholder="barber@example.com"
                                required
                            />
                            {errors.email && <p className="text-xs text-red-500 font-medium">{errors.email}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <Lock size={12} /> Initial Password
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className="h-10 bg-slate-50 border-slate-200 focus:bg-white rounded-lg transition-all"
                                placeholder="••••••••"
                                required
                            />
                            {errors.password && <p className="text-xs text-red-500 font-medium">{errors.password}</p>}
                        </div>
                    </div>

                    {/* Professional Info */}
                    <div className="space-y-6 pt-2">
                        <div className="space-y-2">
                            <Label htmlFor="specialty" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <Star size={12} /> Specialty / Expertise
                            </Label>
                            <Input
                                id="specialty"
                                value={data.specialty}
                                onChange={(e) => setData('specialty', e.target.value)}
                                className="h-10 bg-slate-50 border-slate-200 focus:bg-white rounded-lg transition-all"
                                placeholder="e.g. Skin Fades, Beard Sculpting"
                            />
                            {errors.specialty && <p className="text-xs text-red-500 font-medium">{errors.specialty}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="bio" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <AlignLeft size={12} /> Professional Bio
                            </Label>
                            <Textarea
                                id="bio"
                                value={data.bio}
                                onChange={(e) => setData('bio', e.target.value)}
                                className="bg-slate-50 border-slate-200 focus:bg-white rounded-lg min-h-[100px] transition-all"
                                placeholder="A brief description of the barber's background and style..."
                                rows={4}
                            />
                            {errors.bio && <p className="text-xs text-red-500 font-medium">{errors.bio}</p>}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                        <Button 
                            type="submit" 
                            disabled={processing} 
                            className="bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-xs font-bold h-10 px-6 shadow-sm transition-all"
                        >
                            <UserPlus className="mr-2 h-3.5 w-3.5" />
                            Create Barber
                        </Button>
                        <Link 
                            href={route('barbers.index')} 
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