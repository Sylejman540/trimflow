import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, Mail } from 'lucide-react';

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

export default function ForgotPassword({ status }: { status?: string }) {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors } = useForm({ email: '' });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <div className="min-h-screen w-full bg-white font-sans flex flex-col items-center justify-center px-6 py-12">
            <Head title={t('auth.forgotTitle')} />

            <div className="w-full max-w-[380px] flex justify-center mb-10">
                <FreshioLogo dark />
            </div>

            <div className="w-full max-w-[380px]">
                    <div className="mb-10">
                        <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center mb-6">
                            <Mail size={20} />
                        </div>
                        <h2 className="text-4xl font-bold tracking-tight text-slate-900 mb-2">{t('auth.forgotHeading')}</h2>
                        <p className="text-slate-500 text-sm">{t('auth.forgotSub')}</p>
                    </div>

                    {status && (
                        <div className="mb-6 text-sm text-blue-700 bg-blue-50 p-4 border border-blue-200 rounded-lg">
                            {status}
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
                                autoFocus
                            />
                            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={processing}
                                className="group relative flex h-12 w-full items-center justify-center rounded-xl bg-slate-900 text-[11px] font-bold uppercase tracking-widest text-white transition-all hover:bg-slate-700 active:scale-[0.98] disabled:opacity-50"
                            >
                                {processing ? t('auth.sendingReset') : t('auth.forgotButton')}
                                {!processing && <ArrowRight className="absolute right-5 h-4 w-4 transition-transform group-hover:translate-x-1" />}
                            </button>
                        </div>

                        <p className="text-center text-xs text-slate-400 pt-2">
                            <Link href={route('login')} className="font-semibold text-slate-900 hover:underline">
                                ← {t('auth.backToLogin')}
                            </Link>
                        </p>
                    </form>
                </div>
        </div>
    );
}
