import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';

import FreshioLogo from '@/components/FreshioLogo';

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
        <div className="min-h-screen w-full bg-white font-sans flex flex-col items-center justify-center px-6 py-12">
            <Head title={t('auth.register')} />

            <div className="w-full max-w-[440px] flex justify-center mb-10">
                <FreshioLogo theme="dark" />
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
                                    className="h-11 rounded-none border-0 border-b border-slate-200 bg-transparent px-0 focus-visible:ring-0 focus-visible:border-blue-600 transition-all placeholder:text-slate-300 text-sm"
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
                                    className="h-11 rounded-none border-0 border-b border-slate-200 bg-transparent px-0 focus-visible:ring-0 focus-visible:border-blue-600 transition-all placeholder:text-slate-300 text-sm"
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
                                className="h-11 rounded-none border-0 border-b border-slate-200 bg-transparent px-0 focus-visible:ring-0 focus-visible:border-blue-600 transition-all placeholder:text-slate-300 text-sm"
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
                                        className="h-11 rounded-none border-0 border-b border-slate-200 bg-transparent px-0 focus-visible:ring-0 focus-visible:border-blue-600 transition-all pr-10 text-sm"
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
                                    className="h-11 rounded-none border-0 border-b border-slate-200 bg-transparent px-0 focus-visible:ring-0 focus-visible:border-blue-600 transition-all text-sm"
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
                                className="group relative flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-[11px] font-bold uppercase tracking-widest text-white transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 active:scale-[0.98] disabled:opacity-50"
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
    );
}
