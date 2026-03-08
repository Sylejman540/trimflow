import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import { User, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function Edit({
    mustVerifyEmail,
    status,
}: PageProps<{ mustVerifyEmail: boolean; status?: string }>) {
    return (
        <AuthenticatedLayout>
            <Head title="Settings" />

            <div className="py-12">
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                    
                    {/* Header Section */}
                    <div className="mb-10">
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                            Settings
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Manage your account settings and profile preferences.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
                        
                        {/* Sidebar Navigation */}
                        <div className="lg:col-span-1">
                            <nav className="space-y-1 sticky top-8">
                                <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold text-slate-900 rounded-lg bg-slate-100 transition-colors">
                                    <User className="h-4 w-4" />
                                    General Information
                                </button>
                                <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">
                                    <ShieldCheck className="h-4 w-4" />
                                    Security
                                </button>
                                <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors mt-4">
                                    <AlertTriangle className="h-4 w-4" />
                                    Danger Zone
                                </button>
                            </nav>
                        </div>

                        {/* Content Area */}
                        <div className="lg:col-span-2 space-y-8">
                            
                            {/* General Information */}
                            <section className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200/50 overflow-hidden">
                                <div className="p-6 sm:p-8">
                                    <UpdateProfileInformationForm
                                        mustVerifyEmail={mustVerifyEmail}
                                        status={status}
                                        className="w-full"
                                    />
                                </div>
                            </section>

                            {/* Password Security */}
                            <section className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200/50 overflow-hidden">
                                <div className="p-6 sm:p-8">
                                    <UpdatePasswordForm className="w-full" />
                                </div>
                            </section>

                            {/* Danger Zone */}
                            <section className="bg-white rounded-2xl shadow-sm ring-1 ring-rose-100 overflow-hidden">
                                <div className="p-6 sm:p-8">
                                    <div className="mb-6">
                                        <h3 className="text-lg font-semibold text-rose-600 flex items-center gap-2">
                                            <AlertTriangle className="h-4 w-4" />
                                            Danger Zone
                                        </h3>
                                        <p className="text-sm text-slate-500 mt-1">
                                            Once you delete your account, there is no going back. Please be certain.
                                        </p>
                                    </div>
                                    <DeleteUserForm className="w-full" />
                                </div>
                            </section>
                            
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}