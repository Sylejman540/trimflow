import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import { User, ShieldCheck, AlertTriangle, Monitor, Smartphone, Key, ArrowLeft, LogOut } from 'lucide-react';
import Dropdown from '@/components/Dropdown';

export default function Edit({
    auth,
    mustVerifyEmail,
    status,
}: PageProps<{ mustVerifyEmail: boolean; status?: string }>) {
    const [activeTab, setActiveTab] = useState('general');

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Settings" />

            {/* Premium Page Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                    
                    {/* Top Utility Bar */}
                    <div className="flex items-center justify-between py-4 border-b border-slate-50 mb-6">
                        <Link 
                            href={route('dashboard')}
                            className="group flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                            Back to Dashboard
                        </Link>

                        <div className="flex items-center gap-4">
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <button className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200">
                                        <div className="h-7 w-7 rounded-full bg-slate-900 flex items-center justify-center text-[10px] font-bold text-white">
                                            {auth.user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="text-sm font-semibold text-slate-700">{auth.user.name}</span>
                                    </button>
                                </Dropdown.Trigger>
                                <Dropdown.Content>
                                    <Dropdown.Link href={route('logout')} method="post" as="button" className="flex items-center gap-2 text-rose-600">
                                        <LogOut className="h-4 w-4" />
                                        Sign Out
                                    </Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Account Settings</h1>
                            <p className="text-slate-500 mt-1 text-sm">
                                Update your profile details, security, and manage active sessions.
                            </p>
                        </div>
                    </div>

                    {/* Horizontal Tab Navigation */}
                    <div className="flex items-center gap-8 overflow-x-auto no-scrollbar">
                        {[
                            { id: 'general', label: 'General', icon: User },
                            { id: 'security', label: 'Security', icon: ShieldCheck },
                            { id: 'sessions', label: 'Sessions', icon: Monitor },
                            { id: 'danger', label: 'Danger Zone', icon: AlertTriangle },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 py-4 border-b-2 text-sm font-semibold transition-all whitespace-nowrap ${
                                    activeTab === tab.id
                                        ? 'border-slate-900 text-slate-900'
                                        : 'border-transparent text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                <tab.icon className={`h-4 w-4 ${tab.id === 'danger' && activeTab === 'danger' ? 'text-rose-600' : ''}`} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="py-12 bg-slate-50/50 min-h-[calc(100vh-200px)]">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                    
                    {/* Content Logic (Same as before) */}
                    {activeTab === 'general' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6 sm:p-8">
                                <UpdateProfileInformationForm mustVerifyEmail={mustVerifyEmail} status={status} />
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6 sm:p-8">
                                <UpdatePasswordForm />
                            </div>
                            
                            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6 sm:p-8 border-l-4 border-amber-400">
                                <div className="flex gap-4">
                                    <div className="bg-amber-50 p-3 rounded-xl h-fit">
                                        <Key className="h-6 w-6 text-amber-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900">Two-Factor Authentication</h3>
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
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6 sm:p-8">
                                <header className="mb-6">
                                    <h3 className="text-xl font-bold text-slate-900">Browser Sessions</h3>
                                    <p className="text-sm text-slate-500">Log out of other active sessions on other devices.</p>
                                </header>
                                
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 p-4 border border-slate-100 rounded-2xl bg-slate-50/50">
                                        <Monitor className="h-8 w-8 text-slate-400" />
                                        <div className="flex-1">
                                            <div className="text-sm font-bold text-slate-900">macOS - Chrome</div>
                                            <div className="text-xs text-slate-500">192.168.1.1 • <span className="text-emerald-600 font-bold">This device</span></div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 p-4 border border-slate-100 rounded-2xl">
                                        <Smartphone className="h-8 w-8 text-slate-400" />
                                        <div className="flex-1">
                                            <div className="text-sm font-bold text-slate-900">iPhone 15 Pro</div>
                                            <div className="text-xs text-slate-500">London, UK • 2 hours ago</div>
                                        </div>
                                        <button className="text-xs font-bold text-rose-600 hover:underline">Revoke</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'danger' && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="bg-rose-50 rounded-2xl shadow-sm ring-1 ring-rose-200 p-6 sm:p-8">
                                <div className="flex items-center gap-3 text-rose-600 mb-4">
                                    <AlertTriangle className="h-6 w-6" />
                                    <h3 className="text-xl font-bold">Delete Account</h3>
                                </div>
                                <p className="text-rose-700/80 text-sm mb-8 leading-relaxed">
                                    Permanently delete your account and all associated data.
                                </p>
                                <DeleteUserForm />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}