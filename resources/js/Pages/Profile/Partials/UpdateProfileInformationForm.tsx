import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Link, useForm, usePage } from '@inertiajs/react';
import { Transition } from '@headlessui/react';
import { FormEvent } from 'react';
import { PageProps } from '@/types';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}: {
    mustVerifyEmail: boolean;
    status?: string;
    className?: string;
}) {
    const user = usePage<PageProps>().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
        });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        patch(route('profile.update'));
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-semibold text-slate-900">Profile Information</h2>
                <p className="mt-1 text-sm text-slate-500">
                    Update your account profile details.
                </p>
            </header>

            <form onSubmit={submit} className="mt-8 space-y-6">
                <div>
                    <InputLabel htmlFor="name" value="Name" className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1" />
                    <TextInput
                        id="name"
                        className="mt-1 block w-full border-none bg-slate-50 focus:bg-white focus:ring-1 focus:ring-slate-900 transition-all rounded-lg h-10"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        isFocused
                        autoComplete="name"
                    />
                    <InputError className="mt-2" message={errors.name} />
                </div>

                <div>
                    <InputLabel htmlFor="email" value="Email" className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1" />
                    <TextInput
                        id="email"
                        type="email"
                        className="mt-1 block w-full border-none bg-slate-50 focus:bg-white focus:ring-1 focus:ring-slate-900 transition-all rounded-lg h-10"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoComplete="username"
                    />
                    <InputError className="mt-2" message={errors.email} />
                </div>

                <div className="flex items-center gap-4 pt-2">
                    <PrimaryButton 
                        disabled={processing}
                        className="bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-950 px-6 py-2 rounded-lg shadow-sm transition-all"
                    >
                        Save
                    </PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-slate-500">Saved.</p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}