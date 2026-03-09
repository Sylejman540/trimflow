import { Head, Link } from '@inertiajs/react';
import { CheckCircle2, Scissors, CalendarDays } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Company {
    id: number;
    name: string;
    slug: string;
    phone?: string;
    address?: string;
}

export default function Confirmation({ company }: { company: Company }) {
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
