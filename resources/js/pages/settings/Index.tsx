import AppLayout from '@/layouts/AppLayout';
import { PageProps } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import { User, Building2, ShieldCheck, AlertTriangle, Monitor, Smartphone, Key, Link2, Copy, Check, Camera, Trash2 } from 'lucide-react';
import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SessionData {
    id: string;
    ip_address: string;
    user_agent: string;
    last_activity: number;
    is_current: boolean;
}

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
}

function parseUserAgent(ua: string): { browser: string; platform: string; isMobile: boolean } {
    const isMobile = /mobile|android|iphone|ipad/i.test(ua);
    const isTablet = /ipad|tablet/i.test(ua);

    let browser = 'Unknown Browser';
    if (/edg\//i.test(ua)) browser = 'Edge';
    else if (/opr\//i.test(ua)) browser = 'Opera';
    else if (/chrome/i.test(ua)) browser = 'Chrome';
    else if (/safari/i.test(ua)) browser = 'Safari';
    else if (/firefox/i.test(ua)) browser = 'Firefox';

    let platform = 'Unknown OS';
    if (/windows nt 10/i.test(ua)) platform = 'Windows 10';
    else if (/windows/i.test(ua)) platform = 'Windows';
    else if (/mac os x/i.test(ua)) platform = 'macOS';
    else if (/iphone/i.test(ua)) platform = 'iPhone';
    else if (/ipad/i.test(ua)) platform = 'iPad';
    else if (/android/i.test(ua)) platform = 'Android';
    else if (/linux/i.test(ua)) platform = 'Linux';

    return { browser, platform, isMobile: isMobile && !isTablet };
}

function fmtLastActive(timestamp: number): string {
    const diffSec = Math.floor(Date.now() / 1000) - timestamp;
    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)} min ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} hr ago`;
    return `${Math.floor(diffSec / 86400)} days ago`;
}

const TABS = [
    { id: 'account',  labelKey: 'profile.general',    icon: User },
    { id: 'shop',     labelKey: 'settingsPage.shopInfo', icon: Building2 },
    { id: 'security', labelKey: 'profile.security',   icon: ShieldCheck },
    { id: 'sessions', labelKey: 'profile.sessions',   icon: Monitor },
    { id: 'danger',   labelKey: 'profile.dangerZone', icon: AlertTriangle },
];

export default function Settings({
    auth,
    mustVerifyEmail,
    status,
    can_manage_company,
    booking_url,
    company,
    sessions = [],
}: PageProps<{ mustVerifyEmail: boolean; status?: string; can_manage_company: boolean; booking_url?: string | null; company: Company; sessions?: SessionData[] }>) {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('account');
    const [copied, setCopied] = useState(false);
    const [logoPreview, setLogoPreview] = useState<string | null>(company.logo ?? null);
    const [logoUploading, setLogoUploading] = useState(false);

    function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setLogoPreview(URL.createObjectURL(file));
        setLogoUploading(true);
        router.post(route('settings.logo'), { logo: file }, {
            forceFormData: true,
            preserveScroll: true,
            onFinish: () => setLogoUploading(false),
        });
    }

    function handleLogoRemove() {
        setLogoPreview(null);
        router.delete(route('settings.logo.destroy'), { preserveScroll: true });
    }

    const { data, setData, patch, processing, errors } = useForm({
        name:    company.name    ?? '',
        email:   company.email   ?? '',
        phone:   company.phone   ?? '',
        address: company.address ?? '',
        city:    company.city    ?? '',
        state:   company.state   ?? '',
        zip:     company.zip     ?? '',
        country: company.country ?? '',
        timezone: company.timezone ?? '',
    });

    function handleCompanySubmit(e: React.FormEvent) {
        e.preventDefault();
        patch(route('settings.company'), { preserveScroll: true });
    }

    function copyLink() {
        if (!booking_url) return;
        if (navigator.clipboard) {
            navigator.clipboard.writeText(booking_url).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }).catch(() => fallbackCopy(booking_url));
        } else {
            fallbackCopy(booking_url);
        }
    }

    function fallbackCopy(text: string) {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <AppLayout title={t('settingsPage.title')}>
            <Head title={t('settingsPage.title')} />

            <div className="max-w-3xl mx-auto space-y-6">
                {/* Tab Navigation */}
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar border-b border-slate-200 -mx-4 px-4 lg:mx-0 lg:px-0">
                    {TABS.filter(tab => tab.id !== 'shop' || can_manage_company).map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 py-3 px-3 border-b-2 text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
                                    isActive
                                        ? 'border-slate-900 text-slate-900'
                                        : 'border-transparent text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                <Icon className={`h-4 w-4 ${tab.id === 'danger' && isActive ? 'text-rose-600' : ''}`} />
                                <span className="hidden sm:inline">{t(tab.labelKey)}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Tab Content */}

                {/* Account Tab */}
                {activeTab === 'account' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
                        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-8">
                            <UpdateProfileInformationForm mustVerifyEmail={mustVerifyEmail} status={status} />
                        </div>

                        {booking_url && (
                            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 shrink-0">
                                        <Link2 className="h-4 w-4 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900">{t('profile.bookingLink')}</h3>
                                        <p className="text-xs text-slate-500">{t('profile.bookingLinkDesc')}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 min-w-0 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 truncate font-mono">
                                        {booking_url}
                                    </code>
                                    <button
                                        onClick={copyLink}
                                        className="flex items-center gap-1.5 shrink-0 px-3 py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
                                    >
                                        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                                        {copied ? t('profile.copied') : t('profile.copy')}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Shop Tab */}
                {activeTab === 'shop' && (
                    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-8 animate-in fade-in slide-in-from-bottom-2 duration-200">
                        <div className="mb-6">
                            <h3 className="text-base font-bold text-slate-900">{t('settingsPage.shopInfo')}</h3>
                            <p className="text-sm text-slate-500 mt-1">{t('settingsPage.shopInfoDesc')}</p>
                        </div>
                        {/* Logo Upload */}
                        <div className="flex items-center gap-5 mb-6 pb-6 border-b border-slate-100">
                            <div className="relative shrink-0">
                                <div className="h-20 w-20 rounded-2xl border-2 border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center">
                                    {logoPreview
                                        ? <img src={logoPreview} alt="Logo" className="h-full w-full object-cover" />
                                        : <Building2 className="h-8 w-8 text-slate-300" />
                                    }
                                </div>
                                {logoUploading && (
                                    <div className="absolute inset-0 rounded-2xl bg-white/70 flex items-center justify-center">
                                        <div className="h-5 w-5 rounded-full border-2 border-slate-300 border-t-slate-900 animate-spin" />
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm font-bold text-slate-900">{t('settingsPage.shopLogo')}</p>
                                <p className="text-xs text-slate-400">{t('settingsPage.shopLogoDesc')}</p>
                                <div className="flex items-center gap-2">
                                    <label className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors">
                                        <Camera className="h-3.5 w-3.5" />
                                        {logoPreview ? t('settingsPage.changeLogo') : t('settingsPage.uploadLogo')}
                                        <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                                    </label>
                                    {logoPreview && (
                                        <button
                                            type="button"
                                            onClick={handleLogoRemove}
                                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                            {t('remove')}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleCompanySubmit} className="space-y-4">
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
                    </div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
                        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-8">
                            <UpdatePasswordForm />
                        </div>

                        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-8 border-l-4 border-l-amber-400">
                            <div className="flex gap-4">
                                <div className="bg-amber-50 p-3 rounded-xl h-fit shrink-0">
                                    <Key className="h-5 w-5 text-amber-600" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900">Two-Factor Authentication</h3>
                                    <p className="text-slate-500 text-sm mt-1">Add an extra layer of security to your account.</p>
                                    <button className="mt-4 text-sm font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg transition-all">
                                        Enable 2FA
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Sessions Tab */}
                {activeTab === 'sessions' && (
                    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-8 animate-in fade-in slide-in-from-bottom-2 duration-200">
                        <header className="mb-6">
                            <h3 className="text-base font-bold text-slate-900">{t('profile.sessions')}</h3>
                            <p className="text-sm text-slate-500 mt-1">These are all your currently active browser sessions.</p>
                        </header>

                        {sessions.length === 0 ? (
                            <p className="text-sm text-slate-400 text-center py-6">No active sessions found.</p>
                        ) : (
                            <div className="space-y-3">
                                {sessions.map(session => {
                                    const { browser, platform, isMobile } = parseUserAgent(session.user_agent);
                                    const Icon = isMobile ? Smartphone : Monitor;
                                    return (
                                        <div
                                            key={session.id}
                                            className={`flex items-center gap-4 p-4 border rounded-xl ${session.is_current ? 'bg-slate-50/50 border-slate-200' : 'border-slate-100'}`}
                                        >
                                            <Icon className="h-6 w-6 text-slate-400 shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-bold text-slate-900 truncate">
                                                    {platform} — {browser}
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    {session.ip_address} · {session.is_current
                                                        ? <span className="text-blue-600 font-bold">This device</span>
                                                        : fmtLastActive(session.last_activity)
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Danger Zone Tab */}
                {activeTab === 'danger' && (
                    <div className="bg-rose-50 rounded-xl border border-rose-200 p-4 sm:p-8 animate-in fade-in slide-in-from-bottom-2 duration-200">
                        <div className="flex items-center gap-3 text-rose-600 mb-4">
                            <AlertTriangle className="h-5 w-5" />
                            <h3 className="text-base font-bold">{t('profile.deleteAccount')}</h3>
                        </div>
                        <p className="text-rose-700/80 text-sm mb-6 leading-relaxed">
                            Permanently delete your account and all associated data.
                        </p>
                        <DeleteUserForm />
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
