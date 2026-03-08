import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Scissors, ArrowRight, ShieldCheck, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        shop_name: '',
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
        <div className="flex h-screen w-full overflow-hidden bg-white font-sans relative">
            <Head title="Create Your Shop | TrimFlow" />

            {/* --- MOBILE LOGO --- */}
            <div className="absolute top-8 left-8 z-20 lg:hidden">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-slate-950 rounded-lg flex items-center justify-center shadow-lg">
                        <Scissors className="text-white w-4 h-4" />
                    </div>
                    <span className="text-sm font-black tracking-tighter text-slate-950 uppercase">TrimFlow</span>
                </Link>
            </div>

            {/* --- LEFT SIDE: Brand Anchor --- */}
            <div className="relative hidden w-1/2 lg:flex flex-col justify-between p-16 bg-slate-950">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=2000"
                        alt="Modern barbershop"
                        className="h-full w-full object-cover opacity-40 grayscale"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
                </div>

                <div className="relative z-10">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-xl">
                            <Scissors className="text-slate-900 w-5 h-5" />
                        </div>
                        <span className="text-xl font-black tracking-tighter text-white uppercase">TrimFlow</span>
                    </Link>
                </div>

                <div className="relative z-10 max-w-xl text-white">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 mb-6 backdrop-blur-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/90">The Industry Standard</span>
                    </div>
                    <h1 className="text-7xl font-black tracking-tighter leading-[0.85] mb-6">
                        CREATE <br />
                        <span className="text-white/40 italic font-light">YOUR SHOP.</span>
                    </h1>
                    <p className="text-xl text-white/70 max-w-md leading-relaxed">
                        Precision tools for high-volume shops. Manage staff, appointments, and revenue in one flow.
                    </p>
                </div>

                <div className="relative z-10 flex items-center gap-6 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                    <span>V2.0.4</span>
                    <div className="w-1 h-1 rounded-full bg-slate-800" />
                    <span className="flex items-center gap-2 tracking-widest uppercase">
                        <ShieldCheck className="w-3 h-3" /> Secure Infrastructure
                    </span>
                </div>
            </div>

            {/* --- RIGHT SIDE: Form --- */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-8 md:px-20 py-12 bg-white overflow-y-auto">
                <div className="w-full max-w-[460px] mt-12 lg:mt-0">
                    <div className="mb-10">
                        <h2 className="text-4xl font-black tracking-tighter text-slate-950">Get Started.</h2>
                        <p className="mt-2 text-slate-500 font-medium">Set up your professional shop profile.</p>
                    </div>

                    <form onSubmit={submit} className="space-y-5">
                        {/* Row 1: Names */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Shop Name</Label>
                                <Input
                                    value={data.shop_name}
                                    className={`h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:ring-slate-950 ${errors.shop_name ? 'border-red-500 bg-red-50/30' : ''}`}
                                    placeholder="Classic Cut"
                                    onChange={(e) => setData('shop_name', e.target.value)}
                                />
                                {errors.shop_name && (
                                    <p className="text-[11px] font-bold text-red-600 uppercase tracking-tight flex items-center gap-1">
                                        <AlertCircle size={12} /> {errors.shop_name}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Owner Name</Label>
                                <Input
                                    value={data.name}
                                    className={`h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:ring-slate-950 ${errors.name ? 'border-red-500 bg-red-50/30' : ''}`}
                                    placeholder="Marcus Ray"
                                    onChange={(e) => setData('name', e.target.value)}
                                />
                                {errors.name && (
                                    <p className="text-[11px] font-bold text-red-600 uppercase tracking-tight flex items-center gap-1">
                                        <AlertCircle size={12} /> {errors.name}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Work Email</Label>
                            <Input
                                type="email"
                                value={data.email}
                                className={`h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:ring-slate-950 ${errors.email ? 'border-red-500 bg-red-50/30' : ''}`}
                                placeholder="name@shop.com"
                                onChange={(e) => setData('email', e.target.value)}
                            />
                            {errors.email && (
                                <p className="text-[11px] font-bold text-red-600 uppercase tracking-tight flex items-center gap-1">
                                    <AlertCircle size={12} /> {errors.email}
                                </p>
                            )}
                        </div>

                        {/* Passwords */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2 relative">
                                <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Password</Label>
                                <div className="relative">
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        value={data.password}
                                        className={`h-12 rounded-xl border-slate-200 bg-slate-50/50 pr-10 focus:ring-slate-950 ${errors.password ? 'border-red-500 bg-red-50/30' : ''}`}
                                        onChange={(e) => setData('password', e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-950"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="text-[11px] font-bold text-red-600 uppercase tracking-tight flex items-center gap-1">
                                        <AlertCircle size={12} /> {errors.password}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Confirm</Label>
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    value={data.password_confirmation}
                                    className={`h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:ring-slate-950 ${errors.password_confirmation ? 'border-red-500 bg-red-50/30' : ''}`}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                />
                                {errors.password_confirmation && (
                                    <p className="text-[11px] font-bold text-red-600 uppercase tracking-tight flex items-center gap-1">
                                        <AlertCircle size={12} /> {errors.password_confirmation}
                                    </p>
                                )}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="group flex h-14 w-full items-center justify-center gap-3 rounded-full bg-slate-950 text-sm font-bold text-white transition-all hover:bg-slate-800 shadow-xl shadow-slate-200 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {processing ? 'CREATING ACCOUNT...' : 'CREATE MY SHOP'}
                            {!processing && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
                        </button>

                        <p className="text-center text-sm text-slate-500 pt-4">
                            Already using TrimFlow?{' '}
                            <Link href={route('login')} className="font-bold text-slate-950 underline underline-offset-4">
                                Sign in
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}