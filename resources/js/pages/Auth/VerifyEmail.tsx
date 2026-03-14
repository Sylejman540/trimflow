import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Mail, LogOut } from 'lucide-react';

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

export default function VerifyEmail({ status }: { status?: string }) {
    const { t } = useTranslation();
    const { post, processing } = useForm({});

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    const verificationSent = status === 'verification-link-sent';

    return (
        <div className="min-h-screen w-full bg-white font-sans flex flex-col items-center justify-center px-6 py-12">
            <Head title={t('auth.verifyTitle')} />

            <div className="w-full max-w-[440px] flex justify-center mb-10">
                <FreshioLogo dark />
            </div>

            <div className="w-full max-w-[440px]">
                    <div className="mb-10">
                        <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center mb-6">
                            <Mail size={20} />
                        </div>
                        <h2 className="text-4xl font-bold tracking-tight text-slate-900 mb-2">{t('auth.verifyHeading')}</h2>
                        <p className="text-slate-500 text-sm leading-relaxed">{t('auth.verifySub')}</p>
                    </div>

                    {verificationSent && (
                        <div className="mb-8 text-sm font-medium text-blue-700 bg-blue-50 p-4 border border-blue-200 rounded-lg flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse shrink-0" />
                            {t('auth.verificationSent')}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-6">
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={processing}
                                className="group relative flex h-12 w-full items-center justify-center rounded-xl bg-slate-900 text-[11px] font-bold uppercase tracking-widest text-white transition-all hover:bg-slate-700 active:scale-[0.98] disabled:opacity-50"
                            >
                                {processing ? t('auth.sendingVerify') : t('auth.verifyButton')}
                                {!processing && <ArrowRight className="absolute right-5 h-4 w-4 transition-transform group-hover:translate-x-1" />}
                            </button>
                        </div>

                        <div className="flex justify-center pt-2">
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="flex items-center gap-2 text-xs text-slate-400 hover:text-red-500 transition-colors"
                            >
                                <LogOut size={14} />
                                {t('auth.logOut')}
                            </Link>
                        </div>
                    </form>
                </div>
        </div>
    );
}
