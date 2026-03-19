import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';

import FadeLogo from '@/components/FadeLogo';

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

            <div className="w-full max-w-[420px]">
                <div className="flex justify-center mb-12">
                    <FadeLogo theme="dark" />
                </div>

                <div className="text-center mb-10">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-black mb-3">{t('auth.registerHeading')}</h2>
                    <p className="text-gray-600 text-sm">{t('auth.registerSub')}</p>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold text-gray-900 uppercase tracking-wider">{t('auth.shopName')}</Label>
                            <Input
                                value={data.shop_name}
                                className="h-11 rounded-lg border border-gray-200 bg-white px-4 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-transparent transition-all text-sm"
                                placeholder={t('auth.shopNamePlaceholder')}
                                onChange={(e) => setData('shop_name', e.target.value)}
                                required
                            />
                            {errors.shop_name && <p className="text-xs text-red-600">{errors.shop_name}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold text-gray-900 uppercase tracking-wider">{t('auth.yourName')}</Label>
                            <Input
                                value={data.name}
                                className="h-11 rounded-lg border border-gray-200 bg-white px-4 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-transparent transition-all text-sm"
                                placeholder={t('auth.yourNamePlaceholder')}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                            />
                            {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-semibold text-gray-900 uppercase tracking-wider">{t('email')}</Label>
                        <Input
                            type="email"
                            value={data.email}
                            className="h-11 rounded-lg border border-gray-200 bg-white px-4 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-transparent transition-all text-sm"
                            placeholder="you@example.com"
                            onChange={(e) => setData('email', e.target.value)}
                            required
                        />
                        {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold text-gray-900 uppercase tracking-wider">{t('auth.password')}</Label>
                            <div className="relative">
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    value={data.password}
                                    className="h-11 rounded-lg border border-gray-200 bg-white px-4 pr-10 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-transparent transition-all text-sm"
                                    onChange={(e) => setData('password', e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {errors.password && <p className="text-xs text-red-600">{errors.password}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold text-gray-900 uppercase tracking-wider">{t('auth.confirmPassword')}</Label>
                            <Input
                                type={showPassword ? 'text' : 'password'}
                                value={data.password_confirmation}
                                className="h-11 rounded-lg border border-gray-200 bg-white px-4 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-transparent transition-all text-sm"
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                required
                            />
                            {errors.password_confirmation && <p className="text-xs text-red-600">{errors.password_confirmation}</p>}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="group relative flex h-10 w-full items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm uppercase tracking-wider transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 active:scale-[0.98] disabled:opacity-50 mt-2"
                    >
                        {processing ? t('auth.creatingShop') : t('auth.registerButton')}
                        {!processing && <ArrowRight className="absolute right-4 h-4 w-4 transition-transform group-hover:translate-x-1" />}
                    </button>

                    <p className="text-center text-sm text-gray-600 pt-4">
                        {t('auth.alreadyAccount')}{' '}
                        <Link href={route('login')} className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                            {t('auth.signInLink')}
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
