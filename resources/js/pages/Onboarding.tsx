import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Scissors, ArrowRight, ShieldCheck, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function Login({ status, canResetPassword }: { status?: string, canResetPassword: boolean }) {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="flex h-screen w-full overflow-hidden bg-white font-sans relative">
            <Head title="Sign In | Freshio" />

            {/* --- MOBILE LOGO --- */}
            <div className="absolute top-8 left-8 z-20 lg:hidden">
                <Link href="/" className="flex items-center gap-2.5">
                    <svg width="28" height="28" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 2 L34 18 L18 34 L2 18 Z" fill="#2563EB" />
                        <text x="18" y="24" textAnchor="middle" fontFamily="'Bebas Neue', sans-serif" fontSize="20" fontWeight="900" fill="#ffffff" letterSpacing="-0.5">F</text>
                    </svg>
                    <span className="text-sm font-black tracking-tight text-slate-950" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.04em' }}>Freshio</span>
                </Link>
            </div>

            {/* --- LEFT SIDE: Brand Anchor --- */}
            <div className="relative hidden w-1/2 lg:flex flex-col justify-between p-16 bg-slate-950">
                <div className="absolute inset-0 z-0">
                    <img 
                        src="https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=2000" 
                        alt="Barber Tools" 
                        className="h-full w-full object-cover opacity-30 grayscale"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
                </div>

                <div className="relative z-10">
                    <Link href="/" className="flex items-center gap-2.5">
                        <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 2 L34 18 L18 34 L2 18 Z" fill="#2563EB" />
                            <text x="18" y="24" textAnchor="middle" fontFamily="'Bebas Neue', sans-serif" fontSize="20" fontWeight="900" fill="#ffffff" letterSpacing="-0.5">F</text>
                        </svg>
                        <span className="text-2xl font-black tracking-tight text-white" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.04em' }}>Freshio</span>
                    </Link>
                </div>

                <div className="relative z-10 max-w-xl text-white">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 mb-6 backdrop-blur-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/90">Welcome Back</span>
                    </div>
                    <h1 className="text-7xl font-black tracking-tighter leading-[0.85] mb-6">
                        RESUME <br />
                        <span className="text-white/40 italic font-light">THE FLOW.</span>
                    </h1>
                    <p className="text-xl text-white/70 max-w-md leading-relaxed">
                        Sign in to access your dashboard and manage your shop in real-time.
                    </p>
                </div>

                <div className="relative z-10 flex items-center gap-6 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                    <span>V2.0.4</span>
                    <div className="w-1 h-1 rounded-full bg-slate-800" />
                    <span className="flex items-center gap-2 tracking-widest uppercase">
                         <ShieldCheck className="w-3 h-3" /> Enterprise Security
                    </span>
                </div>
            </div>

            {/* --- RIGHT SIDE: Form --- */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-8 md:px-20 py-12 bg-white overflow-y-auto">
                <div className="w-full max-w-[400px] mt-12 lg:mt-0">
                    <div className="mb-10 text-left">
                        <h2 className="text-4xl font-black tracking-tighter text-slate-950">Sign In.</h2>
                        <p className="mt-2 text-slate-500 font-medium">Enter your credentials to continue.</p>
                    </div>

                    {status && (
                        <div className="mb-6 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 border border-emerald-100">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-6">
                        {/* Email Field */}
                        <div className="space-y-2">
                            <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Work Email</Label>
                            <Input
                                type="email"
                                value={data.email}
                                className={`h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:ring-slate-950 transition-all ${errors.email ? 'border-red-500 bg-red-50/30 focus:ring-red-500' : ''}`}
                                placeholder="name@shop.com"
                                onChange={(e) => setData('email', e.target.value)}
                            />
                            {errors.email && (
                                <p className="text-[11px] font-bold text-red-600 uppercase tracking-tight flex items-center gap-1">
                                    <AlertCircle size={12} /> {errors.email}
                                </p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Password</Label>
                                {canResetPassword && (
                                    <Link href={route('password.request')} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-950">
                                        Forgot?
                                    </Link>
                                )}
                            </div>
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    value={data.password}
                                    className={`h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:ring-slate-950 transition-all pr-10 ${errors.password ? 'border-red-500 bg-red-50/30 focus:ring-red-500' : ''}`}
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

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="remember"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                                className="h-4 w-4 rounded border-slate-300 text-slate-950 focus:ring-slate-950 cursor-pointer"
                            />
                            <label htmlFor="remember" className="text-xs font-medium text-slate-500 cursor-pointer select-none">
                                Remember this session
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="group flex h-14 w-full items-center justify-center gap-3 rounded-full bg-slate-950 text-sm font-bold text-white transition-all hover:scale-[1.01] active:scale-[0.99] shadow-xl shadow-slate-200 disabled:opacity-70"
                        >
                            {processing ? 'SIGNING IN...' : 'SIGN IN'}
                            {!processing && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
                        </button>

                        <p className="text-center text-sm text-slate-500 pt-4">
                            New to Freshio?{' '}
                            <Link href={route('register')} className="font-bold text-slate-950 underline underline-offset-4">
                                Create your shop
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}