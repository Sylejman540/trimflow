import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Scissors, ArrowRight, ShieldCheck, Eye, EyeOff } from 'lucide-react';

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
        <div className="flex min-h-screen w-full bg-white font-sans selection:bg-slate-100">
            <Head title="Create Your Shop | TrimFlow" />
            
            {/* --- FONTS --- */}
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,700;1,700&display=swap" rel="stylesheet" />

            {/* --- LEFT SIDE: Minimalist Sage Panel (Hidden on Mobile/Tablet) --- */}
            <div className="relative hidden w-1/2 lg:flex flex-col justify-between p-12 xl:p-20 bg-[#637060]">
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
                            The New Standard
                        </span>
                    </div>
                    <h1 className="text-6xl xl:text-7xl font-light tracking-tighter text-[#FAF9F6] leading-[0.9] mb-8">
                        Create your <br />
                        <span className="font-serif italic text-[#FAF9F6]/60">studio profile.</span>
                    </h1>
                    <p className="text-lg text-[#FAF9F6]/80 max-w-sm font-light leading-relaxed">
                        Join the network of elite studios using precision tools to manage staff and revenue.
                    </p>
                </div>

                <div className="relative z-10 flex items-center gap-6 text-[10px] font-bold uppercase tracking-[0.2em] text-[#FAF9F6]/50">
                    <span>Build 2.0.4</span>
                    <div className="w-1 h-1 rounded-full bg-[#FAF9F6]/30" />
                    <span className="flex items-center gap-2 tracking-widest uppercase">
                         <ShieldCheck className="w-3 h-3" /> Secure Infrastructure
                    </span>
                </div>
            </div>

            {/* --- RIGHT SIDE: Form (Full width on mobile) --- */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-start lg:justify-center px-6 sm:px-12 md:px-20 py-12 bg-white relative">
                
                {/* Mobile Header: Visible only on < lg screens */}
                <div className="w-full max-w-[440px] flex justify-between items-center mb-16 lg:hidden">
                    <Link href="/" className="flex items-center gap-2">
                        <Scissors className="text-slate-900 w-5 h-5" />
                        <span className="text-lg font-semibold tracking-tight">TrimFlow</span>
                    </Link>
                </div>

                <div className="w-full max-w-[440px]">
                    <div className="mb-10 md:mb-12">
                        <h2 className="text-3xl md:text-4xl font-light tracking-tight text-slate-900 mb-3">Get started</h2>
                        <p className="text-slate-400 font-light text-sm">Set up your professional studio profile in seconds.</p>
                    </div>

                    <form onSubmit={submit} className="space-y-6 md:space-y-8">
                        {/* Grid Rows: Switch from 1 to 2 columns on tablet/desktop */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                            <div className="space-y-2">
                                <Label className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">Studio Name</Label>
                                <Input
                                    value={data.shop_name}
                                    className="h-11 rounded-none border-0 border-b border-slate-200 bg-transparent px-0 focus-visible:ring-0 focus-visible:border-slate-900 transition-all placeholder:text-slate-300 font-light text-base md:text-sm"
                                    placeholder="Classic Cut"
                                    onChange={(e) => setData('shop_name', e.target.value)}
                                />
                                {errors.shop_name && <p className="text-[10px] text-red-500 font-medium tracking-tight uppercase">{errors.shop_name}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">Owner Name</Label>
                                <Input
                                    value={data.name}
                                    className="h-11 rounded-none border-0 border-b border-slate-200 bg-transparent px-0 focus-visible:ring-0 focus-visible:border-slate-900 transition-all placeholder:text-slate-300 font-light text-base md:text-sm"
                                    placeholder="Marcus Ray"
                                    onChange={(e) => setData('name', e.target.value)}
                                />
                                {errors.name && <p className="text-[10px] text-red-500 font-medium tracking-tight uppercase">{errors.name}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">Work Email</Label>
                            <Input
                                type="email"
                                value={data.email}
                                className="h-11 rounded-none border-0 border-b border-slate-200 bg-transparent px-0 focus-visible:ring-0 focus-visible:border-slate-900 transition-all placeholder:text-slate-300 font-light text-base md:text-sm"
                                placeholder="name@studio.com"
                                onChange={(e) => setData('email', e.target.value)}
                            />
                            {errors.email && <p className="text-[10px] text-red-500 font-medium tracking-tight uppercase">{errors.email}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                            <div className="space-y-2 relative">
                                <Label className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">Password</Label>
                                <div className="relative">
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        value={data.password}
                                        className="h-11 rounded-none border-0 border-b border-slate-200 bg-transparent px-0 focus-visible:ring-0 focus-visible:border-slate-900 transition-all font-light pr-10 text-base md:text-sm"
                                        onChange={(e) => setData('password', e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-900 p-2"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {errors.password && <p className="text-[10px] text-red-500 font-medium tracking-tight uppercase">{errors.password}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">Confirm</Label>
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    value={data.password_confirmation}
                                    className="h-11 rounded-none border-0 border-b border-slate-200 bg-transparent px-0 focus-visible:ring-0 focus-visible:border-slate-900 transition-all font-light text-base md:text-sm"
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                />
                                {errors.password_confirmation && <p className="text-[10px] text-red-500 font-medium tracking-tight uppercase">{errors.password_confirmation}</p>}
                            </div>
                        </div>

                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={processing}
                                className="group relative flex h-14 w-full items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold tracking-[0.2em] text-white transition-all hover:bg-slate-800 active:scale-[0.98] disabled:opacity-50"
                            >
                                {processing ? 'CREATING...' : 'CREATE MY STUDIO'}
                                {!processing && <ArrowRight className="absolute right-6 h-4 w-4 transition-transform group-hover:translate-x-1 hidden sm:block" />}
                            </button>
                        </div>

                        <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-[0.1em] pt-4">
                            Member?{' '}
                            <Link href={route('login')} className="text-slate-900 hover:underline underline-offset-4">
                                Sign in
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}