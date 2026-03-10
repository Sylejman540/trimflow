import { PropsWithChildren } from 'react';

export default function GuestLayout({ children }: PropsWithChildren) {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-sm">
                <div className="flex items-center justify-center gap-2 mb-8">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm bg-gradient-to-br from-amber-400 to-amber-600">
                        <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
                            <path d="M12 2C9.5 6 7 8.5 7 12a5 5 0 0 0 10 0c0-3.5-2.5-6-5-10z" opacity="0.9"/>
                            <path d="M12 8c-1 2.5-2 4-2 5.5a2 2 0 0 0 4 0C14 12 13 10.5 12 8z" opacity="0.5"/>
                        </svg>
                    </div>
                    <span className="text-lg font-bold tracking-tight text-slate-900">Fresh<span className="text-amber-500">io</span></span>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                    {children}
                </div>
            </div>
        </div>
    );
}
