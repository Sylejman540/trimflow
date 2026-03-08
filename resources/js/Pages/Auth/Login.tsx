import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Scissors, ArrowRight, ShieldCheck, Eye, EyeOff } from 'lucide-react';

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
        <div className="flex h-screen w-full overflow-hidden bg-white font-sans selection:bg-slate-100">
            <Head title="Sign In | TrimFlow" />
            
            {/* --- FONTS --- */}
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,700;1,700&display=swap" rel="stylesheet" />

            {/* --- LEFT SIDE: Minimalist Color Block --- */}
            {/* COLOR SELECTION: SAGE GREEN (#637060)
              Minimalist, calming, premium aesthetic.
            */}
            <div className="relative hidden w-1/2 lg:flex flex-col justify-between p-20 bg-[#637060]">
                {/* Minimal grain texture for depth (Optional - remove if too much) */}
                <div className="absolute inset-0 opacity-[0.03] grayscale pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />

                <div className="relative z-10">
                    <Link href="/" className="flex items-center gap-2">
                        <Scissors className="text-[#FAF9F6] w-5 h-5" />
                        <span className="text-xl font-semibold tracking-tight text-[#FAF9F6]">TrimFlow</span>
                    </Link>
                </div>

                <div className="relative z-10">
                    <div className="inline-block mb-10">
                        <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#FAF9F6]/70 pb-1">
                            Partner Portal
                        </span>
                    </div>
                    {/* Main Headings are slightly warmer off-white */}
                    <h1 className="text-7xl font-light tracking-tighter text-[#FAF9F6] leading-[0.9] mb-8">
                        Resume the <br />
                        <span className="font-serif italic text-[#FAF9F6]/60">modern flow.</span>
                    </h1>
                    <p className="text-lg text-[#FAF9F6]/80 max-w-sm font-light leading-relaxed">
                        Access your studio dashboard and manage your appointments with surgical precision.
                    </p>
                </div>

                <div className="relative z-10 flex items-center gap-6 text-[10px] font-bold uppercase tracking-[0.2em] text-[#FAF9F6]/50">
                    <span>Build 2.0.4</span>
                    <div className="w-1 h-1 rounded-full bg-[#FAF9F6]/30" />
                    <span className="flex items-center gap-2 tracking-widest uppercase">
                         <ShieldCheck className="w-3 h-3" /> Secure Session
                    </span>
                </div>
            </div>

            {/* --- RIGHT SIDE: Minimalist Form --- */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-8 md:px-20 py-12 bg-white relative">
                {/* Mobile Logo */}
                <div className="absolute top-10 left-10 lg:hidden flex items-center gap-2">
                    <Scissors className="text-slate-900 w-5 h-5" />
                    <span className="text-lg font-semibold tracking-tight">TrimFlow</span>
                </div>

                <div className="w-full max-w-[380px]">
                    <div className="mb-12">
                        <h2 className="text-3xl font-light tracking-tight text-slate-900 mb-3">Sign in</h2>
                        <p className="text-slate-400 font-light text-sm">Enter your studio credentials to continue.</p>
                    </div>

                    {status && (
                        <div className="mb-6 text-xs font-medium text-slate-600 bg-slate-50 p-4 border border-slate-100 rounded-sm">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-8">
                        <div className="space-y-3">
                            <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Work Email</Label>
                            <Input
                                type="email"
                                value={data.email}
                                className="h-12 rounded-none border-0 border-b border-slate-200 bg-transparent px-0 focus-visible:ring-0 focus-visible:border-slate-900 transition-all placeholder:text-slate-300 font-light"
                                placeholder="name@studio.com"
                                onChange={(e) => setData('email', e.target.value)}
                                required
                            />
                            {errors.email && <p className="text-[10px] text-red-500 font-medium uppercase tracking-wider">{errors.email}</p>}
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Password</Label>
                                {canResetPassword && (
                                    <Link href={route('password.request')} className="text-[10px] font-medium text-slate-400 hover:text-slate-900 transition-colors">
                                        Forgot?
                                    </Link>
                                )}
                            </div>
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    value={data.password}
                                    className="h-12 rounded-none border-0 border-b border-slate-200 bg-transparent px-0 focus-visible:ring-0 focus-visible:border-slate-900 transition-all font-light pr-10"
                                    onChange={(e) => setData('password', e.target.value)}
                                    required
                                />
                                <button 
                                    type="button" 
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-900 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {errors.password && <p className="text-[10px] text-red-500 font-medium uppercase tracking-wider">{errors.password}</p>}
                        </div>

                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="remember"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                                className="h-4 w-4 rounded-none border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                            />
                            <label htmlFor="remember" className="text-xs font-light text-slate-500 cursor-pointer select-none">
                                Keep me signed in
                            </label>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={processing}
                                className="group relative flex h-14 w-full items-center justify-center rounded-full bg-slate-900 text-[11px] font-bold tracking-[0.2em] text-white transition-all hover:bg-slate-800 disabled:opacity-50"
                            >
                                SIGN IN
                                <ArrowRight className="absolute right-6 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </button>
                        </div>

                        <p className="text-center text-[11px] text-slate-400 font-light pt-6">
                            Don't have an account?{' '}
                            <Link href={route('register')} className="font-semibold text-slate-900 hover:underline underline-offset-4">
                                Join the network
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}