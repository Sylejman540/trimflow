import { Link } from '@inertiajs/react';
import { Scissors } from 'lucide-react';
import { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-[#F2F2F2] px-4 py-12">
            <div className="w-full max-w-[420px]">
                {/* Logo */}
                <Link href="/" className="mb-8 flex items-center justify-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-900">
                        <Scissors className="h-4.5 w-4.5 text-white" />
                    </div>
                    <span className="text-lg font-black tracking-tight text-gray-900 uppercase">
                        TrimFlow
                    </span>
                </Link>

                {/* Card */}
                <div className="rounded-2xl bg-white p-8 shadow-xl shadow-black/5 ring-1 ring-gray-100">
                    {children}
                </div>
            </div>
        </div>
    );
}
