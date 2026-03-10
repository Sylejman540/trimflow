import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Scissors, ArrowRight, ShieldCheck, Eye, EyeOff, Star } from 'lucide-react';

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
        <div className="flex min-h-screen w-full bg-white font-sans selection:bg-blue-600 selection:text-white">
            <Head title="Sign In | Freshio" />
            
            {/* --- FONTS --- */}
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,700;1,700&display=swap" rel="stylesheet" />

            {/* --- LEFT SIDE: Brand Panel (Matches Landing Hero) --- */}
            <div className="relative hidden w-1/2 lg:flex flex-col justify-between p-12 xl:p-20 overflow-hidden">
                {/* Background Image & Overlay */}
                <div className="absolute inset-0 z-0">
                    <img 
                        src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=2000" 
                        className="w-full h-full object-cover"
                        alt="Barber Shop Interior"
                    />
                    <div className="absolute inset-0 bg-slate-900/85 backdrop-blur-[2px]"></div>
                </div>

                <div className="relative z-10">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="bg-white p-1.5 rounded-lg">
                            <Scissors className="text-slate-900 w-4 h-4" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white">Freshio</span>
                    </Link>
                </div>

                <div className="relative z-10">
                    <div className="inline-block mb-6">
                        <span className="bg-blue-600/20 text-blue-400 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-blue-500/30 backdrop-blur-md">
                            Partner Portal
                        </span>
                    </div>
                    <h1 className="text-6xl xl:text-7xl font-bold tracking-tighter text-white leading-[0.95] mb-8">
                        Resume the <br />
                        <span className="text-blue-400 italic font-serif font-light">modern flow.</span>
                    </h1>
                    <p className="text-lg text-slate-300 max-w-sm font-medium leading-relaxed">
                        Access your studio dashboard and manage your appointments with surgical precision.
                    </p>
                    
                    {/* Minimal Review Snippet */}
                    <div className="mt-12 flex items-center gap-4 bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm max-w-xs">
                        <div className="flex flex-col gap-1">
                            <div className="flex gap-1 mb-2">
                                {[...Array(5)].map((_, i) => <Star key={i} size={10} className="fill-blue-500 text-blue-500" />)}
                            </div>
                            <p className="text-white text-xs font-medium italic">"The automated re-booking has increased my monthly revenue by 15%."</p>
                            <span className="text-blue-400 text-[9px] font-bold uppercase tracking-widest mt-2">— Marcus W., Senior Stylist</span>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 flex items-center gap-6 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">
                    <span className="flex items-center gap-2">
                         <ShieldCheck className="w-3.5 h-3.5 text-blue-500" /> Secure Session
                    </span>
                    <div className="w-1 h-1 rounded-full bg-slate-800" />
                    <span>Build 2.0.4</span>
                </div>
            </div>

            {/* --- RIGHT SIDE: Form --- */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-6 sm:px-12 md:px-20 py-12 bg-white relative">
                
                {/* Mobile Logo visibility */}
                <div className="w-full max-w-[380px] flex justify-center mb-12 lg:hidden">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="bg-slate-900 p-1.5 rounded-lg">
                            <Scissors className="text-white w-4 h-4" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-slate-900">Freshio</span>
                    </Link>
                </div>

                <div className="w-full max-w-[380px]">
                    <div className="mb-12">
                        <h2 className="text-4xl font-bold tracking-tight text-slate-900 mb-3">Sign in</h2>
                        <p className="text-slate-500 font-medium text-sm">Enter your studio credentials to continue.</p>
                    </div>

                    {status && (
                        <div className="mb-6 text-[10px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 p-4 border border-blue-100 rounded-lg">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-8">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600">Work Email</Label>
                            <Input
                                type="email"
                                value={data.email}
                                className="h-11 rounded-none border-0 border-b border-slate-200 bg-transparent px-0 focus-visible:ring-0 focus-visible:border-blue-600 transition-all placeholder:text-slate-300 font-medium text-sm"
                                placeholder="name@studio.com"
                                onChange={(e) => setData('email', e.target.value)}
                                required
                            />
                            {errors.email && <p className="text-[10px] text-red-500 font-bold tracking-tight uppercase mt-1">{errors.email}</p>}
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600">Password</Label>
                                {canResetPassword && (
                                    <Link href={route('password.request')} className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors">
                                        Forgot?
                                    </Link>
                                )}
                            </div>
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    value={data.password}
                                    className="h-11 rounded-none border-0 border-b border-slate-200 bg-transparent px-0 focus-visible:ring-0 focus-visible:border-blue-600 transition-all font-medium pr-10 text-sm"
                                    onChange={(e) => setData('password', e.target.value)}
                                    required
                                />
                                <button 
                                    type="button" 
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-900 p-2 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {errors.password && <p className="text-[10px] text-red-500 font-bold tracking-tight uppercase mt-1">{errors.password}</p>}
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="relative flex items-center">
                                <input
                                    type="checkbox"
                                    id="remember"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="h-4 w-4 rounded-md border-slate-200 text-blue-600 focus:ring-blue-600 cursor-pointer transition-all"
                                />
                            </div>
                            <label htmlFor="remember" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 cursor-pointer select-none hover:text-slate-600 transition-colors">
                                Keep me signed in
                            </label>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={processing}
                                className="group relative flex h-14 w-full items-center justify-center rounded-xl bg-slate-900 text-[11px] font-bold uppercase tracking-widest text-white transition-all hover:bg-blue-600 active:scale-[0.98] disabled:opacity-50"
                            >
                                {processing ? 'AUTHENTICATING...' : 'SIGN IN'}
                                {!processing && <ArrowRight className="absolute right-6 h-4 w-4 transition-transform group-hover:translate-x-1 hidden sm:block" />}
                            </button>
                        </div>

                        <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] pt-6">
                            New here?{' '}
                            <Link href={route('register')} className="text-slate-900 hover:text-blue-600 transition-colors underline-offset-4">
                                Join the network
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}