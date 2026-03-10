import { PropsWithChildren } from 'react';

export default function GuestLayout({ children }: PropsWithChildren) {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-sm">
                <div className="flex items-center justify-center gap-2 mb-8">
                    <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center shadow-sm">
                        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                            <circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/>
                            <line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/>
                            <line x1="8.12" y1="8.12" x2="12" y2="12"/>
                        </svg>
                    </div>
                    <span className="text-lg font-bold tracking-tight text-slate-900">Barber<span className="text-amber-500">Flow</span></span>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                    {children}
                </div>
            </div>
        </div>
    );
}
