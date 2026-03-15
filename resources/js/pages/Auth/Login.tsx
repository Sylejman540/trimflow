import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react';

function FreshioLogo({ dark = false }: { dark?: boolean }) {
    return (
        <a href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-sm shrink-0">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                    <path d="M12 2C9.5 6 7 8.5 7 12a5 5 0 0 0 10 0c0-3.5-2.5-6-5-10z" opacity="0.9"/>
                    <path d="M12 8c-1 2.5-2 4-2 5.5a2 2 0 0 0 4 0C14 12 13 10.5 12 8z" fill="white" opacity="0.6"/>
                </svg>
            </div>
            <span className={`text-xl font-bold tracking-tight ${dark ? 'text-slate-900' : 'text-white'}`}>
                Fresh<span className="text-blue-500">io</span>
            </span>
        </a>
    );
}

export default function Login({ status, canResetPassword }: { status?: string, canResetPassword: boolean }) {
    const { t, i18n } = useTranslation();
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('freshio_lang');
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

            <div className="w-full max-w-[380px] flex justify-center mb-10">
                <FreshioLogo dark />
            </div>

            <div className="w-full max-w-[380px]">
                    <div className="mb-10">
                        <h2 className="text-4xl font-bold tracking-tight text-slate-900 mb-2">{t('auth.signInHeading')}</h2>
                        <p className="text-slate-500 text-sm">{t('auth.signInSub')}</p>
                    </div>

                    {status && (
                        <div className="mb-6 text-sm text-blue-700 bg-blue-50 p-4 border border-blue-200 rounded-lg">
                            {status}
                        </div>
                    )}

                    {/* Throttle / lockout error banner */}
                    {errors.email && errors.email.includes('seconds') && (
                        <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                            <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                            <p className="text-sm text-red-700">{errors.email}</p>
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-7">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">{t('email')}</Label>
                            <Input
                                type="email"
                                value={data.email}
                                className="h-11 rounded-none border-0 border-b border-slate-200 bg-transparent px-0 focus-visible:ring-0 focus-visible:border-blue-600 transition-all placeholder:text-slate-300 text-sm"
                                placeholder="you@example.com"
                                onChange={(e) => setData('email', e.target.value)}
                                required
                            />
                            {errors.email && !errors.email.includes('seconds') && (
                                <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">{t('auth.password')}</Label>
                                {canResetPassword && (
                                    <Link href={route('password.request')} className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">
                                        {t('auth.forgot')}
                                    </Link>
                                )}
                            </div>
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
                                    className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-900 p-2 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                        </div>

                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="remember"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                                className="h-4 w-4 rounded border-slate-200 text-slate-900 cursor-pointer"
                            />
                            <label htmlFor="remember" className="text-xs text-slate-500 cursor-pointer select-none">
                                {t('auth.keepSignedIn')}
                            </label>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={processing}
                                className="group relative flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-[11px] font-bold uppercase tracking-widest text-white transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 active:scale-[0.98] disabled:opacity-50"
                            >
                                {processing ? t('auth.signingIn') : t('auth.signInButton')}
                                {!processing && <ArrowRight className="absolute right-5 h-4 w-4 transition-transform group-hover:translate-x-1" />}
                            </button>
                        </div>

                        <p className="text-center text-xs text-slate-400 pt-2">
                            {t('auth.noAccount')}{' '}
                            <Link href={route('register')} className="font-semibold text-slate-900 hover:underline">
                                {t('auth.createOne')}
                            </Link>
                        </p>
                    </form>
                </div>
        </div>
    );
}
