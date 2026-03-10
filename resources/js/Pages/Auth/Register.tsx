import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, ShieldCheck, Eye, EyeOff, Star } from 'lucide-react';

function FreshioLogo({ dark = false }: { dark?: boolean }) {
    return (
        <a href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-sm shrink-0">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                    <path d="M12 2C9.5 6 7 8.5 7 12a5 5 0 0 0 10 0c0-3.5-2.5-6-5-10z" opacity="0.9"/>
                    <path d="M12 8c-1 2.5-2 4-2 5.5a2 2 0 0 0 4 0C14 12 13 10.5 12 8z" fill="white" opacity="0.6"/>
                </svg>
            </div>
            <span className={`text-xl font-bold tracking-tight ${dark ? 'text-slate-900' : 'text-white'}`}>
                Fresh<span className="text-emerald-500">io</span>
            </span>
        </a>
    );
}

export default function Register() {
    const { t } = useTranslation();
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
        <div className="flex min-h-screen w-full bg-white font-sans">
            <Head title={t('auth.register')} />

            {/* LEFT: Brand panel */}
            <div className="relative hidden w-1/2 lg:flex flex-col justify-between p-12 xl:p-20 overflow-hidden bg-slate-900">

                <div className="relative z-10">
                    <FreshioLogo />
                </div>

                <div className="relative z-10">
                    <h1 className="text-6xl xl:text-7xl font-bold tracking-tighter text-white leading-[0.95] mb-8">
                        {t('auth.setUpShop')} <br />
                        <span className="text-emerald-400 italic font-light">{t('auth.setUpShopAccent')}</span>
                    </h1>
                    <p className="text-lg text-slate-300 max-w-sm font-medium leading-relaxed">
                        {t('auth.setUpShopSub')}
                    </p>

                    <div className="mt-12 bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm max-w-xs">
                        <div className="flex gap-1 mb-3">
                            {[...Array(5)].map((_, i) => <Star key={i} size={10} className="fill-amber-400 text-emerald-400" />)}
                        </div>
                        <p className="text-white text-xs font-medium italic">"{t('auth.testimonialRegister')}"</p>
                        <span className="text-emerald-400 text-[9px] font-bold uppercase tracking-widest mt-3 block">{t('auth.shopOwner')}</span>
                    </div>
                </div>

                <div className="relative z-10 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{t('auth.secureRegistration')}</span>
                </div>
            </div>

            {/* RIGHT: Form */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-6 sm:px-12 md:px-20 py-12 bg-white">

                <div className="w-full max-w-[440px] flex justify-center mb-12 lg:hidden">
                    <FreshioLogo dark />
                </div>

                <div className="w-full max-w-[440px]">
                    <div className="mb-10">
                        <h2 className="text-4xl font-bold tracking-tight text-slate-900 mb-2">{t('auth.registerHeading')}</h2>
                        <p className="text-slate-500 text-sm">{t('auth.registerSub')}</p>
                    </div>

                    <form onSubmit={submit} className="space-y-7">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">{t('auth.shopName')} *</Label>
                                <Input
                                    value={data.shop_name}
                                    className="h-11 rounded-none border-0 border-b border-slate-200 bg-transparent px-0 focus-visible:ring-0 focus-visible:border-slate-900 transition-all placeholder:text-slate-300 text-sm"
                                    placeholder={t('auth.shopNamePlaceholder')}
                                    onChange={(e) => setData('shop_name', e.target.value)}
                                    required
                                />
                                {errors.shop_name && <p className="text-xs text-red-500 mt-1">{errors.shop_name}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">{t('auth.yourName')} *</Label>
                                <Input
                                    value={data.name}
                                    className="h-11 rounded-none border-0 border-b border-slate-200 bg-transparent px-0 focus-visible:ring-0 focus-visible:border-slate-900 transition-all placeholder:text-slate-300 text-sm"
                                    placeholder={t('auth.yourNamePlaceholder')}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                />
                                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">{t('email')} *</Label>
                            <Input
                                type="email"
                                value={data.email}
                                className="h-11 rounded-none border-0 border-b border-slate-200 bg-transparent px-0 focus-visible:ring-0 focus-visible:border-slate-900 transition-all placeholder:text-slate-300 text-sm"
                                placeholder="you@example.com"
                                onChange={(e) => setData('email', e.target.value)}
                                required
                            />
                            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">{t('auth.password')} *</Label>
                                <div className="relative">
                                    <Input
                                        type={showPassword ? 'text' : 'password'}
                                        value={data.password}
                                        className="h-11 rounded-none border-0 border-b border-slate-200 bg-transparent px-0 focus-visible:ring-0 focus-visible:border-slate-900 transition-all pr-10 text-sm"
                                        onChange={(e) => setData('password', e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-900 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">{t('auth.confirmPassword')} *</Label>
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    value={data.password_confirmation}
                                    className="h-11 rounded-none border-0 border-b border-slate-200 bg-transparent px-0 focus-visible:ring-0 focus-visible:border-slate-900 transition-all text-sm"
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    required
                                />
                                {errors.password_confirmation && <p className="text-xs text-red-500 mt-1">{errors.password_confirmation}</p>}
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={processing}
                                className="group relative flex h-12 w-full items-center justify-center rounded-xl bg-slate-900 text-[11px] font-bold uppercase tracking-widest text-white transition-all hover:bg-slate-700 active:scale-[0.98] disabled:opacity-50"
                            >
                                {processing ? t('auth.creatingShop') : t('auth.registerButton')}
                                {!processing && <ArrowRight className="absolute right-5 h-4 w-4 transition-transform group-hover:translate-x-1" />}
                            </button>
                        </div>

                        <p className="text-center text-xs text-slate-400 pt-2">
                            {t('auth.alreadyAccount')}{' '}
                            <Link href={route('login')} className="font-semibold text-slate-900 hover:underline">
                                {t('auth.signInLink')}
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
