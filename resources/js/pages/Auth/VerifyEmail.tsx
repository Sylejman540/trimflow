import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Mail, CheckCircle } from 'lucide-react';

import FadeLogo from '@/components/FadeLogo';

export default function VerifyEmail({ status }: { status?: string }) {
    const { t } = useTranslation();
    const [verified, setVerified] = useState(false);
    const { data, setData, post, processing, errors } = useForm({
        code: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('verification.verify'), {
            onSuccess: () => setVerified(true),
        });
    };

    const resendCode: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    const verificationSent = status === 'verification-link-sent';

    if (verified) {
        return (
            <div className="min-h-screen w-full bg-white font-sans flex flex-col items-center justify-center px-6 py-12">
                <Head title={t('auth.verifyTitle')} />

                <div className="w-full max-w-[420px]">
                    <div className="text-center">
                        <div className="flex justify-center mb-6">
                            <CheckCircle className="h-20 w-20 text-emerald-500" />
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-3">
                            {t('auth.verificationSuccess')}
                        </h2>
                        <p className="text-slate-600 text-sm leading-relaxed mb-10">
                            {t('auth.verificationSuccessSub')}
                        </p>

                        <Link
                            href={route('dashboard')}
                            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-all shadow-lg shadow-blue-500/25 text-sm"
                        >
                            {t('auth.goToDashboard')}
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-white font-sans flex flex-col items-center justify-center px-6 py-12">
            <Head title={t('auth.verifyTitle')} />

            <div className="w-full max-w-[420px]">
                <div className="flex justify-center mb-10">
                    <FadeLogo theme="dark" />
                </div>

                <div className="text-center mb-10">
                    <div className="flex justify-center mb-6">
                        <Mail className="h-16 w-16 text-blue-600" />
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-3">
                        {t('auth.verifyHeading')}
                    </h2>
                    <p className="text-slate-600 text-sm leading-relaxed">
                        {t('auth.verifySub')}
                    </p>
                </div>

                {verificationSent && (
                    <div className="mb-8 text-sm text-emerald-700 bg-emerald-50 p-4 border border-emerald-200 rounded-lg">
                        {t('auth.verificationCodeSent')}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-6">
                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-slate-900">
                            {t('auth.verificationCode')}
                        </label>
                        <input
                            type="text"
                            value={data.code}
                            onChange={(e) => setData('code', e.target.value.toUpperCase())}
                            placeholder="000000"
                            maxLength={6}
                            className="w-full h-14 rounded-xl border border-slate-200 px-4 text-center text-2xl font-bold tracking-widest text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                            required
                        />
                        {errors.code && (
                            <p className="text-sm text-red-600">{errors.code}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={processing || data.code.length !== 6}
                        className="group relative flex h-10 w-full items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm uppercase tracking-wider transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 active:scale-[0.98] disabled:opacity-50"
                    >
                        {processing ? t('auth.verifying') : t('auth.verifyCode')}
                        {!processing && <ArrowRight className="absolute right-4 h-4 w-4 transition-transform group-hover:translate-x-1" />}
                    </button>

                    <button
                        type="button"
                        onClick={resendCode}
                        disabled={processing}
                        className="w-full text-center text-sm font-semibold text-blue-600 hover:text-blue-700 py-2 transition-colors"
                    >
                        {t('auth.resendCode')}
                    </button>
                </form>

                <div className="mt-10 text-center">
                    <p className="text-xs text-slate-500">
                        {t('auth.notYourEmail')}{' '}
                        <Link href={route('login')} className="font-semibold text-slate-900 hover:text-blue-600 transition-colors">
                            {t('auth.backToLogin')}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
