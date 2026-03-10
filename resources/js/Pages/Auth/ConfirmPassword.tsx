import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Scissors, ArrowRight, ShieldCheck, Eye, EyeOff, Lock } from 'lucide-react';

export default function ConfirmPassword() {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.confirm'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="flex min-h-screen w-full bg-white font-sans selection:bg-blue-600 selection:text-white">
            <Head title="Confirm Access | Freshio" />
            
            {/* --- FONTS --- */}
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,700;1,700&display=swap" rel="stylesheet" />

            {/* --- LEFT SIDE: Brand Panel (Cinematic Background) --- */}
            <div className="relative hidden w-1/2 lg:flex flex-col justify-between p-12 xl:p-20 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img 
                        src="https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=2000" 
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
                            Security Gate
                        </span>
                    </div>
                    <h1 className="text-6xl xl:text-7xl font-bold tracking-tighter text-white leading-[0.95] mb-8">
                        Confirm your <br />
                        <span className="text-blue-400 italic font-serif font-light">authority.</span>
                    </h1>
                    <p className="text-lg text-slate-300 max-w-sm font-medium leading-relaxed">
                        This is a secure area of the Freshio suite. Please verify your credentials to continue.
                    </p>
                </div>

                <div className="relative z-10 flex items-center gap-6 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">
                    <span className="flex items-center gap-2">
                         <ShieldCheck className="w-3.5 h-3.5 text-blue-500" /> Secure Infrastructure
                    </span>
                </div>
            </div>

            {/* --- RIGHT SIDE: Form --- */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-6 sm:px-12 md:px-20 py-12 bg-white relative">
                
                {/* Mobile Header */}
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
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                            <Lock size={20} />
                        </div>
                        <h2 className="text-4xl font-bold tracking-tight text-slate-900 mb-3">Password required</h2>
                        <p className="text-slate-500 font-medium text-sm">Please confirm your password before continuing to the secure area.</p>
                    </div>

                    <form onSubmit={submit} className="space-y-8">
                        <div className="space-y-2 relative">
                            <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600">Password</Label>
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    value={data.password}
                                    className="h-11 rounded-none border-0 border-b border-slate-200 bg-transparent px-0 focus-visible:ring-0 focus-visible:border-blue-600 transition-all font-medium pr-10 text-sm"
                                    onChange={(e) => setData('password', e.target.value)}
                                    autoFocus
                                    required
                                />
                                <button 
                                    type="button" 
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-900 transition-colors p-2"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {errors.password && <p className="text-[10px] text-red-500 font-bold tracking-tight uppercase mt-1">{errors.password}</p>}
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={processing}
                                className="group relative flex h-14 w-full items-center justify-center rounded-xl bg-slate-900 text-[11px] font-bold uppercase tracking-widest text-white transition-all hover:bg-blue-600 active:scale-[0.98] disabled:opacity-50"
                            >
                                {processing ? 'VERIFYING...' : 'CONFIRM ACCESS'}
                                {!processing && <ArrowRight className="absolute right-6 h-4 w-4 transition-transform group-hover:translate-x-1 hidden sm:block" />}
                            </button>
                        </div>

                        <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] pt-6">
                            Not you?{' '}
                            <Link href={route('login')} className="text-slate-900 hover:text-blue-600 transition-colors underline-offset-4">
                                Sign in as different user
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}