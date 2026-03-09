import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { CheckCircle2, Scissors, CalendarDays, X, AlertCircle } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface Company {
    id: number;
    name: string;
    slug: string;
    phone?: string;
}

export default function Confirmation({
    company,
    cancel_token,
    cancel_expires_at,
}: {
    company: Company;
    cancel_token?: string | null;
    cancel_expires_at?: string | null;
}) {
    const { props } = usePage();
    const cancelled = (props as any).flash?.cancelled ?? false;

    const [secondsLeft, setSecondsLeft] = useState<number>(() => {
        if (!cancel_expires_at) return 0;
        return Math.max(0, Math.floor((new Date(cancel_expires_at).getTime() - Date.now()) / 1000));
    });

    useEffect(() => {
        if (!cancel_token || secondsLeft <= 0) return;
        const timer = setInterval(() => {
            setSecondsLeft(s => {
                if (s <= 1) { clearInterval(timer); return 0; }
                return s - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [cancel_token]);

    const { post, processing } = useForm({ token: cancel_token ?? '' });

    function handleCancel() {
        post(route('booking.cancel', company.slug));
    }

    if (cancelled) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col">
                <Head title={`Cancelled — ${company.name}`} />
                <div className="bg-white border-b border-slate-200">
                    <div className="max-w-2xl mx-auto px-4 py-5 flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900">
                            <Scissors className="h-4 w-4 text-white" />
                        </div>
                        <h1 className="text-base font-semibold text-slate-900">{company.name}</h1>
                    </div>
                </div>
                <div className="flex-1 flex items-center justify-center px-4 py-16">
                    <div className="max-w-sm w-full text-center space-y-6">
                        <div className="flex justify-center">
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 border border-slate-200">
                                <X className="h-10 w-10 text-slate-500" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-semibold text-slate-900">Booking Cancelled</h2>
                            <p className="text-sm text-slate-500">Your appointment has been cancelled successfully.</p>
                        </div>
                        <Link
                            href={route('booking.show', company.slug)}
                            className={cn(buttonVariants({ variant: 'default' }), 'bg-slate-900 hover:bg-slate-800 h-10 rounded-xl font-semibold shadow-none')}
                        >
                            <CalendarDays className="mr-2 h-4 w-4" /> Book Again
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Head title={`Booked at ${company.name}`} />

            {/* Header */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-2xl mx-auto px-4 py-5 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900">
                        <Scissors className="h-4 w-4 text-white" />
                    </div>
                    <h1 className="text-base font-semibold text-slate-900">{company.name}</h1>
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center px-4 py-16">
                <div className="max-w-sm w-full text-center space-y-6">
                    <div className="flex justify-center">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 border border-emerald-100">
                            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-2xl font-semibold text-slate-900">You're booked!</h2>
                        <p className="text-sm text-slate-500">
                            Your appointment at <span className="font-medium text-slate-700">{company.name}</span> has been confirmed.
                            We'll see you soon!
                        </p>
                    </div>

                    {company.phone && (
                        <p className="text-xs text-slate-400">
                            Questions? Call us at <span className="font-medium text-slate-600">{company.phone}</span>
                        </p>
                    )}

                    {/* Self-cancellation — visible only during the 60-second window */}
                    {cancel_token && secondsLeft > 0 && (
                        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-left space-y-3">
                            <div className="flex items-start gap-2">
                                <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                <p className="text-xs text-amber-700 font-medium">
                                    Made a mistake? You can cancel within <span className="font-bold">{secondsLeft}s</span>.
                                </p>
                            </div>
                            <button
                                onClick={handleCancel}
                                disabled={processing}
                                className="w-full text-sm font-semibold text-red-600 bg-white border border-red-200 rounded-lg py-2 hover:bg-red-50 transition-colors disabled:opacity-50"
                            >
                                {processing ? 'Cancelling…' : 'Cancel this booking'}
                            </button>
                        </div>
                    )}

                    <div className="flex flex-col gap-2">
                        <Link
                            href={route('booking.show', company.slug)}
                            className={cn(buttonVariants({ variant: 'default' }), 'bg-slate-900 hover:bg-slate-800 h-10 rounded-xl font-semibold shadow-none')}
                        >
                            <CalendarDays className="mr-2 h-4 w-4" /> Book Another Appointment
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
