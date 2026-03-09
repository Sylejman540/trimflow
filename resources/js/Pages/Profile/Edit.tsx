import AppLayout from '@/layouts/AppLayout';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import { User, ShieldCheck, AlertTriangle, Monitor, Smartphone, Key, Link2, Copy, Check } from 'lucide-react';

const TABS = [
    { id: 'general',  label: 'General',     icon: User },
    { id: 'security', label: 'Security',    icon: ShieldCheck },
    { id: 'sessions', label: 'Sessions',    icon: Monitor },
    { id: 'danger',   label: 'Danger Zone', icon: AlertTriangle },
];

export default function Edit({
    auth,
    mustVerifyEmail,
    status,
    booking_url,
}: PageProps<{ mustVerifyEmail: boolean; status?: string; booking_url?: string | null }>) {
    const [activeTab, setActiveTab] = useState('general');
    const [copied, setCopied] = useState(false);

    function copyLink() {
        if (!booking_url) return;
        navigator.clipboard.writeText(booking_url).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    }

    return (
        <AppLayout title="Account Settings">
            <Head title="Settings" />

            <div className="max-w-3xl mx-auto space-y-6">
                {/* Tab Navigation */}
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar border-b border-slate-200 -mx-4 px-4 lg:mx-0 lg:px-0">
                    {TABS.map((tab) => {
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
                                <span className="hidden sm:inline">{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Tab Content */}
                {activeTab === 'general' && (
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
                                        <h3 className="text-sm font-bold text-slate-900">Your Booking Link</h3>
                                        <p className="text-xs text-slate-500">Share this link so customers can book online</p>
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
                                        {copied ? 'Copied!' : 'Copy'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

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

                {activeTab === 'sessions' && (
                    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-8 animate-in fade-in slide-in-from-bottom-2 duration-200">
                        <header className="mb-6">
                            <h3 className="text-base font-bold text-slate-900">Browser Sessions</h3>
                            <p className="text-sm text-slate-500 mt-1">Log out of other active sessions on other devices.</p>
                        </header>

                        <div className="space-y-3">
                            <div className="flex items-center gap-4 p-4 border border-slate-100 rounded-xl bg-slate-50/50">
                                <Monitor className="h-6 w-6 text-slate-400 shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-bold text-slate-900 truncate">macOS — Chrome</div>
                                    <div className="text-xs text-slate-500">192.168.1.1 · <span className="text-emerald-600 font-bold">This device</span></div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-4 border border-slate-100 rounded-xl">
                                <Smartphone className="h-6 w-6 text-slate-400 shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-bold text-slate-900 truncate">iPhone 15 Pro</div>
                                    <div className="text-xs text-slate-500">London, UK · 2 hours ago</div>
                                </div>
                                <button className="text-xs font-bold text-rose-600 hover:underline shrink-0">Revoke</button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'danger' && (
                    <div className="bg-rose-50 rounded-xl border border-rose-200 p-4 sm:p-8 animate-in fade-in slide-in-from-bottom-2 duration-200">
                        <div className="flex items-center gap-3 text-rose-600 mb-4">
                            <AlertTriangle className="h-5 w-5" />
                            <h3 className="text-base font-bold">Delete Account</h3>
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
