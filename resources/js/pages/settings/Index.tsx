import { Head, useForm } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { Building2, Bot, Copy, Check } from 'lucide-react';
import AppLayout from '@/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useState } from 'react';

interface Company {
    id: number;
    name: string;
    slug: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    timezone?: string;
    meta_page_id?: string;
    instagram_agent_enabled?: boolean;
}

export default function Index({
    company,
    has_meta_token,
    has_openai_key,
    webhook_url,
    verify_token,
}: {
    company: Company;
    has_meta_token: boolean;
    has_openai_key: boolean;
    webhook_url: string;
    verify_token: string;
}) {
    const { t } = useTranslation();
    const [copiedWebhook, setCopiedWebhook] = useState(false);
    const [copiedVerify, setCopiedVerify] = useState(false);

    function copyText(text: string, setCopied: (v: boolean) => void) {
        navigator.clipboard?.writeText(text).catch(() => {});
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    const { data, setData, patch, processing, errors } = useForm({
        name:                    company.name                    ?? '',
        email:                   company.email                   ?? '',
        phone:                   company.phone                   ?? '',
        address:                 company.address                 ?? '',
        city:                    company.city                    ?? '',
        state:                   company.state                   ?? '',
        zip:                     company.zip                     ?? '',
        country:                 company.country                 ?? '',
        timezone:                company.timezone                ?? '',
        meta_access_token:       '' as string,
        meta_page_id:            company.meta_page_id            ?? '',
        openai_api_key:          '' as string,
        instagram_agent_enabled: company.instagram_agent_enabled ?? false,
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        patch(route('settings.company'), { preserveScroll: true });
    }

    return (
        <AppLayout title={t('settingsPage.title')}>
            <Head title={t('settingsPage.title')} />

            <div className="max-w-2xl mx-auto space-y-6">

                <Card className="border-slate-200 shadow-none">
                    <CardHeader className="px-4 lg:px-6 pt-4 pb-2">
                        <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-slate-400" />
                            <CardTitle className="text-base">{t('settingsPage.shopInfo')}</CardTitle>
                        </div>
                        <CardDescription className="text-xs text-slate-400 mt-0.5">
                            {t('settingsPage.shopInfoDesc')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-4 lg:px-6 pb-4">
                        <form onSubmit={submit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">{t('settingsPage.shopName')} *</Label>
                                    <Input
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        className="h-10 border-slate-200 shadow-none"
                                        required
                                    />
                                    {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">{t('email')}</Label>
                                    <Input
                                        type="email"
                                        value={data.email}
                                        onChange={e => setData('email', e.target.value)}
                                        className="h-10 border-slate-200 shadow-none"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">{t('phone')}</Label>
                                    <Input
                                        type="tel"
                                        value={data.phone}
                                        onChange={e => setData('phone', e.target.value)}
                                        className="h-10 border-slate-200 shadow-none"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">{t('settingsPage.timezone')}</Label>
                                    <Input
                                        value={data.timezone}
                                        onChange={e => setData('timezone', e.target.value)}
                                        placeholder={t('settingsPage.timezonePlaceholder')}
                                        className="h-10 border-slate-200 shadow-none"
                                    />
                                </div>
                                <div className="sm:col-span-2 space-y-1.5">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">{t('settingsPage.streetAddress')}</Label>
                                    <Input
                                        value={data.address}
                                        onChange={e => setData('address', e.target.value)}
                                        className="h-10 border-slate-200 shadow-none"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">{t('settingsPage.city')}</Label>
                                    <Input
                                        value={data.city}
                                        onChange={e => setData('city', e.target.value)}
                                        className="h-10 border-slate-200 shadow-none"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">{t('settingsPage.stateRegion')}</Label>
                                    <Input
                                        value={data.state}
                                        onChange={e => setData('state', e.target.value)}
                                        className="h-10 border-slate-200 shadow-none"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">{t('settingsPage.zipPostal')}</Label>
                                    <Input
                                        value={data.zip}
                                        onChange={e => setData('zip', e.target.value)}
                                        className="h-10 border-slate-200 shadow-none"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">{t('settingsPage.country')}</Label>
                                    <Input
                                        value={data.country}
                                        onChange={e => setData('country', e.target.value)}
                                        className="h-10 border-slate-200 shadow-none"
                                    />
                                </div>
                            </div>

                            <div className="pt-2">
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-slate-900 hover:bg-slate-800 text-white h-10 px-6 shadow-none"
                                >
                                    {t('save')}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Instagram AI Agent */}
                <Card className="border-slate-200 shadow-none">
                    <CardHeader className="px-4 lg:px-6 pt-4 pb-2">
                        <div className="flex items-center gap-2">
                            <Bot className="h-4 w-4 text-pink-500" />
                            <CardTitle className="text-base">{t('settingsPage.agentTitle')}</CardTitle>
                        </div>
                        <CardDescription className="text-xs text-slate-400 mt-0.5">
                            {t('settingsPage.agentDesc')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-4 lg:px-6 pb-5 space-y-4">

                        {/* Webhook info */}
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2 text-xs">
                            <p className="font-semibold text-slate-700">{t('settingsPage.agentWebhookInfo')}</p>
                            <div className="space-y-1">
                                <p className="text-slate-500">{t('settingsPage.agentWebhookUrl')}</p>
                                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded px-2 py-1.5">
                                    <code className="flex-1 text-slate-700 truncate text-[11px]">{webhook_url}</code>
                                    <button onClick={() => copyText(webhook_url, setCopiedWebhook)} className="shrink-0 text-slate-400 hover:text-slate-700">
                                        {copiedWebhook ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-slate-500">{t('settingsPage.agentVerifyToken')}</p>
                                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded px-2 py-1.5">
                                    <code className="flex-1 text-slate-700 truncate text-[11px]">{verify_token}</code>
                                    <button onClick={() => copyText(verify_token, setCopiedVerify)} className="shrink-0 text-slate-400 hover:text-slate-700">
                                        {copiedVerify ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    {t('settingsPage.agentPageId')}
                                </Label>
                                <Input
                                    value={data.meta_page_id}
                                    onChange={e => setData('meta_page_id', e.target.value)}
                                    placeholder="e.g. 123456789"
                                    className="h-10 border-slate-200 shadow-none"
                                />
                                <p className="text-[11px] text-slate-400">{t('settingsPage.agentPageIdHint')}</p>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    {t('settingsPage.agentMetaToken')} {has_meta_token && <span className="text-emerald-500 normal-case font-normal ml-1">✓ {t('settingsPage.agentSaved')}</span>}
                                </Label>
                                <Input
                                    type="password"
                                    value={data.meta_access_token}
                                    onChange={e => setData('meta_access_token', e.target.value)}
                                    placeholder={has_meta_token ? t('settingsPage.agentLeaveBlank') : 'EAAxxxxxxx...'}
                                    className="h-10 border-slate-200 shadow-none"
                                />
                            </div>

                            <div className="sm:col-span-2 space-y-1.5">
                                <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    {t('settingsPage.agentOpenAiKey')} {has_openai_key && <span className="text-emerald-500 normal-case font-normal ml-1">✓ {t('settingsPage.agentSaved')}</span>}
                                </Label>
                                <Input
                                    type="password"
                                    value={data.openai_api_key}
                                    onChange={e => setData('openai_api_key', e.target.value)}
                                    placeholder={has_openai_key ? t('settingsPage.agentLeaveBlank') : 'sk-proj-...'}
                                    className="h-10 border-slate-200 shadow-none"
                                />
                            </div>
                        </div>

                        {/* Enable toggle */}
                        <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                            <div>
                                <p className="text-sm font-semibold text-slate-900">{t('settingsPage.agentEnable')}</p>
                                <p className="text-xs text-slate-500 mt-0.5">{t('settingsPage.agentEnableDesc')}</p>
                            </div>
                            <Switch
                                checked={data.instagram_agent_enabled}
                                onCheckedChange={v => setData('instagram_agent_enabled', v)}
                            />
                        </div>

                        <div className="pt-1">
                            <Button
                                type="button"
                                onClick={submit}
                                disabled={processing}
                                className="bg-slate-900 hover:bg-slate-800 text-white h-10 px-6 shadow-none"
                            >
                                {t('save')}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

            </div>
        </AppLayout>
    );
}
