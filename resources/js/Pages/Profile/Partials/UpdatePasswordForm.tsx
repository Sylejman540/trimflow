import InputError from '@/components/InputError';
import InputLabel from '@/components/InputLabel';
import PrimaryButton from '@/components/PrimaryButton';
import TextInput from '@/components/TextInput';
import { useForm } from '@inertiajs/react';
import { Transition } from '@headlessui/react';
import { useRef, FormEvent } from 'react';

export default function UpdatePasswordForm({ className = '' }: { className?: string }) {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    const { data, setData, errors, put, reset, processing, recentlySuccessful } =
        useForm({
            current_password: '',
            password: '',
            password_confirmation: '',
        });

    const updatePassword = (e: FormEvent) => {
        e.preventDefault();
        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }
                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-semibold text-slate-900">Update Password</h2>
                <p className="mt-1 text-sm text-slate-500">
                    Ensure your account is using a long, random password to stay secure.
                </p>
            </header>

            <form onSubmit={updatePassword} className="mt-8 space-y-6">
                <div className="space-y-1">
                    <InputLabel 
                        htmlFor="current_password" 
                        value="Current Password" 
                        className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1" 
                    />
                    <TextInput
                        id="current_password"
                        ref={currentPasswordInput}
                        value={data.current_password}
                        onChange={(e) => setData('current_password', e.target.value)}
                        type="password"
                        className="px-2 mt-1 block w-full border-none bg-slate-50 focus:bg-white focus:ring-1 focus:ring-slate-900 transition-all rounded-lg h-10 shadow-none"
                        autoComplete="current-password"
                    />
                    <InputError message={errors.current_password} className="mt-2 text-xs" />
                </div>

                <div className="space-y-1">
                    <InputLabel 
                        htmlFor="password" 
                        value="New Password" 
                        className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1" 
                    />
                    <TextInput
                        id="password"
                        ref={passwordInput}
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        type="password"
                        className="px-2 mt-1 block w-full border-none bg-slate-50 focus:bg-white focus:ring-1 focus:ring-slate-900 transition-all rounded-lg h-10 shadow-none"
                        autoComplete="new-password"
                    />
                    <InputError message={errors.password} className="mt-2 text-xs" />
                </div>

                <div className="space-y-1">
                    <InputLabel 
                        htmlFor="password_confirmation" 
                        value="Confirm Password" 
                        className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1" 
                    />
                    <TextInput
                        id="password_confirmation"
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        type="password"
                        className="px-2 mt-1 block w-full border-none bg-slate-50 focus:bg-white focus:ring-1 focus:ring-slate-900 transition-all rounded-lg h-10 shadow-none"
                        autoComplete="new-password"
                    />
                    <InputError message={errors.password_confirmation} className="mt-2 text-xs" />
                </div>

                <div className="flex items-center gap-4 pt-4">
                    <PrimaryButton 
                        disabled={processing}
                        className="bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-950 px-6 py-2 rounded-lg shadow-sm transition-all border-none"
                    >
                        Update Password
                    </PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-slate-500">Saved successfully.</p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}