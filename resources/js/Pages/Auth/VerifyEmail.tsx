import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight, ShieldCheck, Mail, LogOut, Star } from 'lucide-react';

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

export default function VerifyEmail({ status }: { status?: string }) {
    const { t } = useTranslation();
    const { post, processing } = useForm({});

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    const verificationSent = status === 'verification-link-sent';

    return (
        <div className="flex min-h-screen w-full bg-white font-sans">
            <Head title={t('auth.verifyTitle')} />

            {/* LEFT: Brand panel */}
            <div className="relative hidden w-1/2 lg:flex flex-col justify-between p-12 xl:p-20 overflow-hidden bg-slate-900">

                <div className="relative z-10">
                    <FreshioLogo />
                </div>

                <div className="relative z-10">
                    <h1 className="text-6xl xl:text-7xl font-bold tracking-tighter text-white leading-[0.95] mb-8">
                        {t('auth.welcomeBack')} <br />
                        <span className="text-emerald-400 italic font-light">{t('auth.welcomeBackAccent')}</span>
                    </h1>
                    <p className="text-lg text-slate-300 max-w-sm font-medium leading-relaxed">
                        {t('auth.welcomeBackSub')}
                    </p>

                    <div className="mt-12 bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm max-w-xs">
                        <div className="flex gap-1 mb-3">
                            {[...Array(5)].map((_, i) => <Star key={i} size={10} className="fill-amber-400 text-emerald-400" />)}
                        </div>
                        <p className="text-white text-xs font-medium italic">"{t('auth.testimonialLogin')}"</p>
                        <span className="text-emerald-400 text-[9px] font-bold uppercase tracking-widest mt-3 block">{t('auth.shopOwner')}</span>
                    </div>
                </div>

                <div className="relative z-10 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{t('auth.secureLogin')}</span>
                </div>
            </div>

            {/* RIGHT: Form */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-6 sm:px-12 md:px-20 py-12 bg-white">

                <div className="w-full max-w-[440px] flex justify-center mb-12 lg:hidden">
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
                        <div className="mb-8 text-sm font-medium text-emerald-700 bg-emerald-50 p-4 border border-emerald-200 rounded-lg flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse shrink-0" />
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
        </div>
    );
}
