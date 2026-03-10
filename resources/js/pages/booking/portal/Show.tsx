import { Head, useForm } from '@inertiajs/react';
import { Scissors, Phone } from 'lucide-react';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { cn } from '@/lib/utils';

function PoweredBy() {
    return (
        <div className="pt-2 text-center">
            <a href="https://freshio.app" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 text-amber-500">
                    <circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/>
                    <line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/>
                    <line x1="8.12" y1="8.12" x2="12" y2="12"/>
                </svg>
                Powered by <span className="font-semibold text-slate-500">Freshio</span>
            </a>
        </div>
    );
}

interface Company { id: number; name: string; slug: string; phone?: string; }

export default function PortalShow({ company }: { company: Company }) {
    const { data, setData, post, processing, errors } = useForm({ phone: '' });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(route('portal.lookup', company.slug));
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Head title={`My Appointments — ${company.name}`} />

            <div className="bg-white border-b border-slate-200">
                <div className="max-w-2xl mx-auto px-4 py-5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900">
                            <Scissors className="h-4 w-4 text-white" />
                        </div>
                        <h1 className="text-base font-semibold text-slate-900">{company.name}</h1>
                    </div>
                    <LanguageSwitcher compact />
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center px-4 py-16">
                <div className="max-w-sm w-full space-y-6">
                    <div className="text-center space-y-1">
                        <h2 className="text-2xl font-semibold text-slate-900">My Appointments</h2>
                        <p className="text-sm text-slate-500">Enter your phone number to view your booking history.</p>
                    </div>

                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                                Phone Number
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                    type="tel"
                                    value={data.phone}
                                    onChange={e => setData('phone', e.target.value)}
                                    placeholder="+1 (555) 000-0000"
                                    autoComplete="tel"
                                    className={cn(
                                        "w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-slate-900",
                                        errors.phone ? 'border-red-300' : 'border-slate-200'
                                    )}
                                    required
                                />
                            </div>
                            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm py-2.5 rounded-xl transition-colors disabled:opacity-50"
                        >
                            {processing ? 'Looking up…' : 'View My Appointments'}
                        </button>
                    </form>

                    <p className="text-center text-xs text-slate-400">
                        Want to book?{' '}
                        <a href={route('booking.show', company.slug)} className="text-slate-600 font-medium hover:underline">
                            Book an appointment
                        </a>
                    </p>
                    <PoweredBy />
                </div>
            </div>
        </div>
    );
}
