import { Link, useForm, usePage } from '@inertiajs/react';
import { FormEvent } from 'react';
import { PageProps } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail } from 'lucide-react';

export default function UpdateProfileInformationForm({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
    className?: string;
}) {
    const user = usePage<PageProps>().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        name: user.name,
        email: user.email,
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        patch(route('profile.update'));
    }

    return (
        <section>
            <header className="mb-6">
                <h2 className="text-base font-bold text-slate-900">Profile Information</h2>
                <p className="mt-1 text-sm text-slate-500">Update your account name and email address.</p>
            </header>

            <form onSubmit={submit} className="space-y-5">
                <div className="space-y-2">
                    <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <User size={12} /> Name
                    </Label>
                    <Input
                        id="name"
                        value={data.name}
                        onChange={e => setData('name', e.target.value)}
                        className="h-10 bg-slate-50 border-slate-200 focus:bg-white rounded-lg"
                        required
                        autoComplete="name"
                    />
                    {errors.name && <p className="text-xs text-red-500 font-medium">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <Mail size={12} /> Email
                    </Label>
                    <Input
                        id="email"
                        type="email"
                        value={data.email}
                        onChange={e => setData('email', e.target.value)}
                        className="h-10 bg-slate-50 border-slate-200 focus:bg-white rounded-lg"
                        required
                        autoComplete="username"
                    />
                    {errors.email && <p className="text-xs text-red-500 font-medium">{errors.email}</p>}
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-sm text-amber-700">
                            Your email is unverified.{' '}
                            <Link href={route('verification.send')} method="post" as="button" className="font-semibold underline hover:no-underline">
                                Resend verification email.
                            </Link>
                        </p>
                        {status === 'verification-link-sent' && (
                            <p className="mt-1 text-xs text-amber-600">A new verification link has been sent.</p>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4 pt-2 border-t border-slate-100">
                    <Button
                        type="submit"
                        disabled={processing}
                        className="bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-xs font-bold h-10 px-6 shadow-none"
                    >
                        Save Changes
                    </Button>
                    {recentlySuccessful && <p className="text-sm text-slate-500">Saved.</p>}
                </div>
            </form>
        </section>
    );
}
