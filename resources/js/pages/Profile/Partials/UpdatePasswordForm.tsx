import { useForm } from '@inertiajs/react';
import { useRef, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock } from 'lucide-react';

export default function UpdatePasswordForm({ className = '' }: { className?: string }) {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    const { data, setData, errors, put, reset, processing, recentlySuccessful } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    function updatePassword(e: FormEvent) {
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
    }

    return (
        <section className={className}>
            <header className="mb-6">
                <h2 className="text-base font-bold text-slate-900">Update Password</h2>
                <p className="mt-1 text-sm text-slate-500">Use a long, random password to keep your account secure.</p>
            </header>

            <form onSubmit={updatePassword} className="space-y-5">
                <div className="space-y-2">
                    <Label htmlFor="current_password" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <Lock size={12} /> Current Password
                    </Label>
                    <Input
                        id="current_password"
                        ref={currentPasswordInput}
                        type="password"
                        value={data.current_password}
                        onChange={e => setData('current_password', e.target.value)}
                        className="h-10 bg-slate-50 border-slate-200 focus:bg-white rounded-lg"
                        autoComplete="current-password"
                    />
                    {errors.current_password && <p className="text-xs text-red-500 font-medium">{errors.current_password}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <Lock size={12} /> New Password
                    </Label>
                    <Input
                        id="password"
                        ref={passwordInput}
                        type="password"
                        value={data.password}
                        onChange={e => setData('password', e.target.value)}
                        className="h-10 bg-slate-50 border-slate-200 focus:bg-white rounded-lg"
                        autoComplete="new-password"
                    />
                    {errors.password && <p className="text-xs text-red-500 font-medium">{errors.password}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password_confirmation" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <Lock size={12} /> Confirm New Password
                    </Label>
                    <Input
                        id="password_confirmation"
                        type="password"
                        value={data.password_confirmation}
                        onChange={e => setData('password_confirmation', e.target.value)}
                        className="h-10 bg-slate-50 border-slate-200 focus:bg-white rounded-lg"
                        autoComplete="new-password"
                    />
                    {errors.password_confirmation && <p className="text-xs text-red-500 font-medium">{errors.password_confirmation}</p>}
                </div>

                <div className="flex items-center gap-4 pt-2 border-t border-slate-100">
                    <Button
                        type="submit"
                        disabled={processing}
                        className="bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-xs font-bold h-10 px-6 shadow-none"
                    >
                        Update Password
                    </Button>
                    {recentlySuccessful && <p className="text-sm text-slate-500">Saved.</p>}
                </div>
            </form>
        </section>
    );
}
