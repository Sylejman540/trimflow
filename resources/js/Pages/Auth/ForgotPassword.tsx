import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Scissors, ArrowRight, ShieldCheck, Eye, EyeOff, Lock } from 'lucide-react';

export default function ResetPassword({
    token,
    email,
}: {
    token: string;
    email: string;
}) {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <div className="flex h-screen w-full overflow-hidden bg-white font-sans selection:bg-slate-100">
            <Head title="Reset Password | TrimFlow" />
            
            {/* --- FONTS --- */}
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,700;1,700&display=swap" rel="stylesheet" />

            {/* --- LEFT SIDE: Minimalist Color Block --- */}
            <div className="relative hidden w-1/2 lg:flex flex-col justify-between p-20 bg-[#637060]">
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
                            Account Recovery
                        </span>
                    </div>
                    <h1 className="text-7xl font-light tracking-tighter text-[#FAF9F6] leading-[0.9] mb-8">
                        Secure your <br />
                        <span className="font-serif italic text-[#FAF9F6]/60">new access.</span>
                    </h1>
                    <p className="text-lg text-[#FAF9F6]/80 max-w-sm font-light leading-relaxed">
                        Update your credentials to regain entry to your studio management suite.
                    </p>
                </div>

                <div className="relative z-10 flex items-center gap-6 text-[10px] font-bold uppercase tracking-[0.2em] text-[#FAF9F6]/50">
                    <span>V2.0.4</span>
                    <div className="w-1 h-1 rounded-full bg-[#FAF9F6]/30" />
                    <span className="flex items-center gap-2 tracking-widest uppercase">
                         <ShieldCheck className="w-3 h-3" /> Encrypted Reset
                    </span>
                </div>
            </div>

            {/* --- RIGHT SIDE: Reset Form --- */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-8 md:px-20 py-12 bg-white relative">
                {/* Mobile Logo */}
                <div className="absolute top-10 left-10 lg:hidden flex items-center gap-2">
                    <Scissors className="text-slate-900 w-5 h-5" />
                    <span className="text-lg font-semibold tracking-tight">TrimFlow</span>
                </div>

                <div className="w-full max-w-[380px]">
                    <div className="mb-12">
                        <h2 className="text-3xl font-light tracking-tight text-slate-900 mb-3">Reset password</h2>
                        <p className="text-slate-400 font-light text-sm">Please choose a strong, unique password for your studio.</p>
                    </div>

                    <form onSubmit={submit} className="space-y-8">
                        {/* Email Field (Usually read-only in reset flow) */}
                        <div className="space-y-3">
                            <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Account Email</Label>
                            <Input
                                type="email"
                                value={data.email}
                                className="h-12 rounded-none border-0 border-b border-slate-200 bg-transparent px-0 focus-visible:ring-0 focus-visible:border-slate-900 transition-all font-light opacity-60"
                                onChange={(e) => setData('email', e.target.value)}
                                required
                            />
                            {errors.email && <p className="text-[10px] text-red-500 font-medium uppercase tracking-wider">{errors.email}</p>}
                        </div>

                        {/* New Password Field */}
                        <div className="space-y-3">
                            <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">New Password</Label>
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    value={data.password}
                                    className="h-12 rounded-none border-0 border-b border-slate-200 bg-transparent px-0 focus-visible:ring-0 focus-visible:border-slate-900 transition-all font-light pr-10"
                                    onChange={(e) => setData('password', e.target.value)}
                                    required
                                    autoComplete="new-password"
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

                        {/* Confirm Password Field */}
                        <div className="space-y-3">
                            <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Confirm New Password</Label>
                            <Input
                                type="password"
                                value={data.password_confirmation}
                                className="h-12 rounded-none border-0 border-b border-slate-200 bg-transparent px-0 focus-visible:ring-0 focus-visible:border-slate-900 transition-all font-light"
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                required
                                autoComplete="new-password"
                            />
                            {errors.password_confirmation && <p className="text-[10px] text-red-500 font-medium uppercase tracking-wider">{errors.password_confirmation}</p>}
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={processing}
                                className="group relative flex h-14 w-full items-center justify-center rounded-full bg-slate-900 text-[11px] font-bold tracking-[0.2em] text-white transition-all hover:bg-slate-800 disabled:opacity-50 shadow-lg shadow-slate-100"
                            >
                                UPDATE PASSWORD
                                <ArrowRight className="absolute right-6 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </button>
                        </div>

                        <p className="text-center text-[11px] text-slate-400 font-light pt-6">
                            Remembered your password?{' '}
                            <Link href={route('login')} className="font-semibold text-slate-900 hover:underline underline-offset-4">
                                Back to login
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}