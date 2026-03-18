import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import FadeLogo from '@/components/FadeLogo';

export default function VerifyEmail({ status }: { status?: string }) {
    const { t } = useTranslation();
    const { data, setData, post, processing } = useForm({
        code: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('verification.verify'));
    };

    const verificationSent = status === 'verification-link-sent';

    return (
        <div className="min-h-screen w-full bg-white font-sans flex flex-col items-center justify-center px-6 py-12">
            <Head title={t('auth.verifyTitle')} />

            <div className="w-full max-w-[380px] flex justify-center mb-10">
                <FadeLogo theme="dark" />
            </div>

            <div className="w-full max-w-[380px]">
                <div className="mb-10">
                    <h2 className="text-4xl font-bold tracking-tight text-slate-900 mb-2">{t('auth.verifyHeading')}</h2>
                    <p className="text-slate-500 text-sm">{t('auth.verifySub')}</p>
                </div>

                {verificationSent && (
                    <div className="mb-6 text-sm text-blue-700 bg-blue-50 p-4 border border-blue-200 rounded-lg">
                        {t('auth.verificationSent')}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-7">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">{t('auth.code') || 'Verification Code'}</Label>
                        <Input
                            type="text"
                            value={data.code}
                            className="h-11 rounded-none border-0 border-b border-slate-200 bg-transparent px-0 focus-visible:ring-0 focus-visible:border-blue-600 transition-all placeholder:text-slate-300 text-sm"
                            placeholder="Enter code from email"
                            onChange={(e) => setData('code', e.target.value)}
                            required
                        />
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={processing}
                            className="group relative flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-[11px] font-bold uppercase tracking-widest text-white transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 active:scale-[0.98] disabled:opacity-50"
                        >
                            {processing ? t('auth.sendingVerify') : t('auth.verifyButton')}
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
