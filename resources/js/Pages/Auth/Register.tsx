import GuestLayout from '@/layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Scissors, ArrowRight } from 'lucide-react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Join TrimFlow" />

            <div className="mb-10 flex flex-col items-center text-center">
                {/* Brand Icon - Matching Landing Page logo style */}
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-950 shadow-xl border border-white/10">
                    <Scissors className="h-6 w-6 text-white" />
                </div>
                
                <h1 className="text-3xl font-black tracking-tighter text-slate-950">
                    Start your flow.
                </h1>
                <p className="mt-2 text-sm text-slate-500">
                    Join the standard in modern shop management.
                </p>
            </div>

            <form onSubmit={submit} className="space-y-5">
                <div className="space-y-2">
                    <Label htmlFor="name" className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                        Full Name
                    </Label>
                    <Input
                        id="name"
                        value={data.name}
                        className="h-12 rounded-xl border-slate-200 focus-visible:ring-slate-950"
                        autoComplete="name"
                        autoFocus
                        placeholder="e.g. Marcus Ray"
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />
                    {errors.name && (
                        <p className="text-xs font-medium text-red-500">{errors.name}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email" className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                        Work Email
                    </Label>
                    <Input
                        id="email"
                        type="email"
                        value={data.email}
                        className="h-12 rounded-xl border-slate-200 focus-visible:ring-slate-950"
                        autoComplete="username"
                        placeholder="name@shop.com"
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />
                    {errors.email && (
                        <p className="text-xs font-medium text-red-500">{errors.email}</p>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                            Password
                        </Label>
                        <Input
                            id="password"
                            type="password"
                            value={data.password}
                            className="h-12 rounded-xl border-slate-200 focus-visible:ring-slate-950"
                            autoComplete="new-password"
                            onChange={(e) => setData('password', e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password_confirmation" className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                            Confirm
                        </Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            value={data.password_confirmation}
                            className="h-12 rounded-xl border-slate-200 focus-visible:ring-slate-950"
                            autoComplete="new-password"
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            required
                        />
                    </div>
                </div>
                {(errors.password || errors.password_confirmation) && (
                    <p className="text-xs font-medium text-red-500">
                        {errors.password || errors.password_confirmation}
                    </p>
                )}

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="group flex w-full items-center justify-center gap-2 rounded-full bg-slate-950 h-14 text-sm font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-slate-200"
                    >
                        Create Account
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </button>
                </div>

                <div className="flex items-center justify-center pt-4">
                    <p className="text-sm text-slate-500">
                        Already using TrimFlow?{' '}
                        <Link 
                            href={route('login')} 
                            className="font-bold text-slate-950 hover:underline underline-offset-4"
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
            </form>

            <div className="mt-10 border-t border-slate-100 pt-6">
                <p className="text-center text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                    Secure Enterprise Infrastructure
                </p>
            </div>
        </GuestLayout>
    );
}