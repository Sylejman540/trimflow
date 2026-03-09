import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { Scissors, ArrowRight, ShieldCheck, Mail, LogOut } from 'lucide-react';

export default function VerifyEmail({ status }: { status?: string }) {
    const { post, processing } = useForm({});

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    const verificationSent = status === 'verification-link-sent';

    return (
        <div className="flex min-h-screen w-full bg-white font-sans selection:bg-blue-600 selection:text-white">
            <Head title="Verify Email | TrimFlow" />
            
            {/* --- FONTS --- */}
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,700;1,700&display=swap" rel="stylesheet" />

            {/* --- LEFT SIDE: Brand Panel (Cinematic Background) --- */}
            <div className="relative hidden w-1/2 lg:flex flex-col justify-between p-12 xl:p-20 overflow-hidden">
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
                        <span className="text-xl font-bold tracking-tight text-white">TrimFlow</span>
                    </Link>
                </div>

                <div className="relative z-10">
                    <div className="inline-block mb-6">
                        <span className="bg-blue-600/20 text-blue-400 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-blue-500/30 backdrop-blur-md">
                            Final Step
                        </span>
                    </div>
                    <h1 className="text-6xl xl:text-7xl font-bold tracking-tighter text-white leading-[0.95] mb-8">
                        Check your <br />
                        <span className="text-blue-400 italic font-serif font-light">inbox.</span>
                    </h1>
                    <p className="text-lg text-slate-300 max-w-sm font-medium leading-relaxed">
                        We've sent a verification link to your email. Click it to activate your studio dashboard.
                    </p>
                </div>

                <div className="relative z-10 flex items-center gap-6 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">
                    <span className="flex items-center gap-2">
                         <ShieldCheck className="w-3.5 h-3.5 text-blue-500" /> Secure Infrastructure
                    </span>
                </div>
            </div>

            {/* --- RIGHT SIDE: Action Area --- */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-6 sm:px-12 md:px-20 py-12 bg-white relative">
                
                {/* Mobile Header */}
                <div className="w-full max-w-[440px] flex justify-center mb-12 lg:hidden">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="bg-slate-900 p-1.5 rounded-lg">
                            <Scissors className="text-white w-4 h-4" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-slate-900">TrimFlow</span>
                    </Link>
                </div>

                <div className="w-full max-w-[440px]">
                    <div className="mb-12">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                            <Mail size={20} />
                        </div>
                        <h2 className="text-4xl font-bold tracking-tight text-slate-900 mb-3">Verify your email</h2>
                        <p className="text-slate-500 font-medium text-sm leading-relaxed">
                            Thanks for joining! To get started, please click the link we just sent to your inbox. 
                            If you didn't see it, we can send it again.
                        </p>
                    </div>

                    {verificationSent && (
                        <div className="mb-8 text-[10px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 p-5 border border-blue-100 rounded-xl flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                            A new link has been sent to your email address.
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-6">
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={processing}
                                className="group relative flex h-14 w-full items-center justify-center rounded-xl bg-slate-900 text-[11px] font-bold uppercase tracking-widest text-white transition-all hover:bg-blue-600 active:scale-[0.98] disabled:opacity-50"
                            >
                                {processing ? 'SENDING...' : 'RESEND VERIFICATION EMAIL'}
                                {!processing && <ArrowRight className="absolute right-6 h-4 w-4 transition-transform group-hover:translate-x-1 hidden sm:block" />}
                            </button>
                        </div>

                        <div className="flex justify-center pt-4">
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-red-500 transition-colors"
                            >
                                <LogOut size={14} />
                                Log Out
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}