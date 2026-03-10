import { useForm } from '@inertiajs/react';
import { FormEventHandler, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertTriangle, Lock } from 'lucide-react';

export default function DeleteUserForm({ className = '' }: { className?: string }) {
    const [open, setOpen] = useState(false);
    const passwordInput = useRef<HTMLInputElement>(null);

    const { data, setData, delete: destroy, processing, reset, errors, clearErrors } = useForm({
        password: '',
    });

    const deleteUser: FormEventHandler = (e) => {
        e.preventDefault();
        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current?.focus(),
            onFinish: () => reset(),
        });
    };

    function closeModal() {
        setOpen(false);
        clearErrors();
        reset();
    }

    return (
        <section className={`space-y-4 ${className}`}>
            <header>
                <h2 className="text-base font-bold text-rose-700">Delete Account</h2>
                <p className="mt-1 text-sm text-rose-700/70">
                    Once your account is deleted, all data will be permanently removed. This action cannot be undone.
                </p>
            </header>

            <Button
                type="button"
                onClick={() => setOpen(true)}
                className="bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold h-10 px-6 shadow-none"
            >
                Delete Account
            </Button>

            <Dialog open={open} onOpenChange={v => !v && closeModal()}>
                <DialogContent className="sm:max-w-md border-slate-200 shadow-none">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-rose-600">
                            <AlertTriangle className="h-4 w-4" /> Delete Account
                        </DialogTitle>
                    </DialogHeader>

                    <p className="text-sm text-slate-600">
                        This will permanently delete your account and all associated data. Enter your password to confirm.
                    </p>

                    <form onSubmit={deleteUser} className="space-y-4 pt-1">
                        <div className="space-y-2">
                            <Label htmlFor="delete_password" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <Lock size={12} /> Password
                            </Label>
                            <Input
                                id="delete_password"
                                type="password"
                                ref={passwordInput}
                                value={data.password}
                                onChange={e => setData('password', e.target.value)}
                                className="h-10 bg-slate-50 border-slate-200 focus:bg-white rounded-lg"
                                placeholder="Enter your password"
                                autoComplete="current-password"
                            />
                            {errors.password && <p className="text-xs text-red-500 font-medium">{errors.password}</p>}
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={closeModal} className="text-slate-500 shadow-none">
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-none"
                            >
                                Permanently Delete
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </section>
    );
}
