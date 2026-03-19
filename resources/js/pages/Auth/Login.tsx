import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react';

import FadeLogo from '@/components/FadeLogo';


export default function Login({ status, canResetPassword }: { status?: string, canResetPassword: boolean }) {
    const { t, i18n } = useTranslation();
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('fade_lang');
        if (saved) {
            i18n.changeLanguage(saved);
        } else {
            i18n.changeLanguage('en');
        }
    }, []);
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: true as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="min-h-screen w-full bg-white font-sans flex flex-col items-center justify-center px-6 py-12">
            <Head title={t('auth.signInTitle')} />

            <div className="w-full max-w-[420px]">
                <div className="flex justify-center mb-12">
                    <FadeLogo theme="dark" />
                </div>

                <div className="text-center mb-10">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-black mb-3">{t('auth.signInHeading')}</h2>
                    <p className="text-gray-600 text-sm">{t('auth.signInSub')}</p>
                </div>

                {status && (
                    <div className="mb-6 text-sm text-emerald-700 bg-emerald-50 p-4 border border-emerald-200 rounded-lg">
                        {status}
                    </div>
                )}

                {errors.email && errors.email.includes('seconds') && (
                    <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                        <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700">{errors.email}</p>
                    </div>
                )}

                <form onSubmit={submit} className="space-y-6">
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
                        {errors.email && !errors.email.includes('seconds') && (
                            <p className="text-xs text-red-600">{errors.email}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-semibold text-gray-900 uppercase tracking-wider">{t('auth.password')}</Label>
                            {canResetPassword && (
                                <Link href={route('password.request')} className="text-xs font-semibold text-blue-600 hover:text-blue-700 uppercase tracking-wider transition-colors">
                                    {t('auth.forgot')}
                                </Link>
                            )}
                        </div>
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

                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="h-4 w-4 rounded border-gray-200 text-blue-600 cursor-pointer"
                        />
                        <label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer select-none">
                            {t('auth.keepSignedIn')}
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="group relative flex h-10 w-full items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm uppercase tracking-wider transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 active:scale-[0.98] disabled:opacity-50 mt-2"
                    >
                        {processing ? t('auth.signingIn') : t('auth.signInButton')}
                        {!processing && <ArrowRight className="absolute right-4 h-4 w-4 transition-transform group-hover:translate-x-1" />}
                    </button>

                    <p className="text-center text-sm text-gray-600 pt-4">
                        {t('auth.noAccount')}{' '}
                        <Link href={route('register')} className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                            {t('auth.createOne')}
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
