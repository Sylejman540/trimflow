import { PropsWithChildren } from 'react';
import { Scissors } from 'lucide-react';

export default function GuestLayout({ children }: PropsWithChildren) {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-sm">
                <div className="flex items-center justify-center gap-2 mb-8">
                    <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                        <Scissors className="text-white w-4 h-4" />
                    </div>
                    <span className="text-lg font-bold tracking-tighter text-slate-900">BarberFlow</span>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                    {children}
                </div>
            </div>
        </div>
    );
}
