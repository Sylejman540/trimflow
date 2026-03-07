import GuestLayout from '@/layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Sign up" />

            <div className="mb-6">
                <h1 className="text-xl font-bold text-gray-900">Create an account</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Get started with TrimFlow for free.
                </p>
            </div>

            <form onSubmit={submit} className="space-y-4">
                <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-gray-700">Full name</Label>
                    <Input
                        id="name"
                        value={data.name}
                        className="h-10"
                        autoComplete="name"
                        autoFocus
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />
                    {errors.name && (
                        <p className="text-xs text-red-600">{errors.name}</p>
                    )}
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-gray-700">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        value={data.email}
                        className="h-10"
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />
                    {errors.email && (
                        <p className="text-xs text-red-600">{errors.email}</p>
                    )}
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-gray-700">Password</Label>
                    <Input
                        id="password"
                        type="password"
                        value={data.password}
                        className="h-10"
                        autoComplete="new-password"
                        onChange={(e) => setData('password', e.target.value)}
                        required
                    />
                    {errors.password && (
                        <p className="text-xs text-red-600">{errors.password}</p>
                    )}
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="password_confirmation" className="text-gray-700">
                        Confirm password
                    </Label>
                    <Input
                        id="password_confirmation"
                        type="password"
                        value={data.password_confirmation}
                        className="h-10"
                        autoComplete="new-password"
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        required
                    />
                    {errors.password_confirmation && (
                        <p className="text-xs text-red-600">{errors.password_confirmation}</p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="w-full rounded-xl bg-gray-900 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-black disabled:opacity-50"
                >
                    Create account
                </button>

                <p className="text-center text-sm text-gray-500">
                    Already have an account?{' '}
                    <Link href={route('login')} className="font-medium text-gray-900 hover:underline">
                        Sign in
                    </Link>
                </p>
            </form>
        </GuestLayout>
    );
}
