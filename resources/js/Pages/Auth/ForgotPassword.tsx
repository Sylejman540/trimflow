import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Scissors, ArrowRight, ShieldCheck, Mail, ChevronLeft } from 'lucide-react';

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <div className="flex h-screen w-full overflow-hidden bg-white font-sans relative">
            <Head title="Reset Password | TrimFlow" />

            {/* --- MOBILE LOGO (Visible only on small screens) --- */}
            <div className="absolute top-8 left-8 z-20 lg:hidden">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-slate-950 rounded-lg flex items-center justify-center shadow-lg">
                        <Scissors className="text-white w-4 h-4" />
                    </div>
                    <span className="text-sm font-black tracking-tighter text-slate-950 uppercase">TrimFlow</span>
                </Link>
            </div>

            {/* --- LEFT SIDE: Cinematic Brand Anchor --- */}
            <div className="relative hidden w-1/2 lg:flex flex-col justify-between p-16 bg-slate-950">
                <div className="absolute inset-0 z-0">
                    <img 
                        src="https://images.unsplash.com/photo-1512690118275-1aa3c24176e8?auto=format&fit=crop&q=80&w=2000" 
                        alt="Workspace" 
                        className="h-full w-full object-cover opacity-30 grayscale"
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
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/90">Account Recovery</span>
                    </div>
                    <h1 className="text-7xl font-black tracking-tighter leading-[0.85] mb-6">
                        RECOVER <br />
                        <span className="text-white/40 italic font-light">ACCESS.</span>
                    </h1>
                    <p className="text-xl text-white/70 max-w-md leading-relaxed">
                        Don't lose your rhythm. Enter your email to receive a secure reset link.
                    </p>
                </div>

                <div className="relative z-10 flex items-center gap-6 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                    <span>V2.0.4</span>
                    <div className="w-1 h-1 rounded-full bg-slate-800" />
                    <span className="flex items-center gap-2 uppercase tracking-widest">
                         <ShieldCheck className="w-3 h-3" /> Encrypted Recovery
                    </span>
                </div>
            </div>

            {/* --- RIGHT SIDE: Reset Form --- */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-8 md:px-20 py-12 bg-white overflow-y-auto">
                <div className="w-full max-w-[400px] mt-12 lg:mt-0">
                    
                    <Link 
                        href={route('login')}
                        className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-950 transition-colors mb-8"
                    >
                        <ChevronLeft size={14} /> Back to Login
                    </Link>

                    <div className="mb-10">
                        <h2 className="text-4xl font-black tracking-tighter text-slate-950">Forgot Password?</h2>
                        <p className="mt-2 text-slate-500 font-medium">
                            No problem. Just let us know your email address and we will send a reset link.
                        </p>
                    </div>

                    {status && (
                        <div className="mb-6 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 border border-emerald-100">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-6">
                        <div className="space-y-2">
                            <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Recovery Email</Label>
                            <div className="relative">
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    className="h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:ring-slate-950 transition-all font-medium"
                                    placeholder="name@shop.com"
                                    onChange={(e) => setData('email', e.target.value)}
                                    autoFocus
                                />
                            </div>
                            {errors.email && <p className="text-xs font-medium text-red-500">{errors.email}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="group flex h-14 w-full items-center justify-center gap-3 rounded-full bg-slate-950 text-sm font-bold text-white transition-all hover:scale-[1.01] active:scale-[0.99] shadow-xl shadow-slate-200 disabled:opacity-50"
                        >
                            SEND RESET LINK
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}