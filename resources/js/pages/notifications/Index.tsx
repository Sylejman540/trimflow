import { Head, router } from '@inertiajs/react';
import { BellOff, CalendarDays, CheckCircle2, XCircle, AlertTriangle, Check, ArrowRight } from 'lucide-react';
import AppLayout from '@/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NotificationItem {
    id: string;
    data: {
        message: string;
        appointment_id?: number;
        status?: string;
        icon?: string;
    };
    read_at: string | null;
    created_at: string;
}

function NotifIcon({ icon }: { icon?: string }) {
    const cls = 'h-3.5 w-3.5 shrink-0';
    switch (icon) {
        case 'check':        return <Check className={cn(cls, 'text-emerald-500')} />;
        case 'check-circle': return <CheckCircle2 className={cn(cls, 'text-emerald-500')} />;
        case 'x-circle':     return <XCircle className={cn(cls, 'text-red-500')} />;
        case 'alert':        return <AlertTriangle className={cn(cls, 'text-amber-500')} />;
        default:             return <CalendarDays className={cn(cls, 'text-slate-400')} />;
    }
}

export default function Index({
    notifications,
    unread_count,
}: {
    notifications: NotificationItem[];
    unread_count: number;
}) {
    function markAll() {
        router.post(route('notifications.read'), {}, { preserveScroll: true });
    }

    function markOne(id: string) {
        router.post(route('notifications.read'), { id }, { preserveScroll: true });
    }

    return (
        <AppLayout
            title="Notifications"
            actions={
                unread_count > 0 ? (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-[11px] font-semibold text-slate-500"
                        onClick={markAll}
                    >
                        Mark all as read
                    </Button>
                ) : undefined
            }
        >
            <Head title="Notifications" />

            <div className="flex flex-col items-center w-full py-4 px-4">
                <div className="w-full max-w-3xl space-y-1">
                    {notifications.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <BellOff className="h-8 w-8 text-slate-200 mb-2" />
                            <p className="text-sm text-slate-500 font-medium">No notifications</p>
                        </div>
                    )}

                    {notifications.map((n) => (
                        <div
                            key={n.id}
                            className={cn(
                                'group flex items-center gap-3 rounded-md border px-3 py-1.5 transition-all duration-200',
                                n.read_at
                                    ? 'border-transparent bg-white hover:bg-slate-50'
                                    : 'border-blue-100 bg-blue-50/30'
                            )}
                        >
                            {/* 1. Icon Section */}
                            <div className="shrink-0 flex items-center justify-center w-5">
                                <NotifIcon icon={n.data.icon} />
                            </div>

                            {/* 2. Message Section (Flex-Grow) */}
                            <div className="flex-1 min-w-0">
                                <p className={cn(
                                    'text-[13px] truncate', // Truncate keeps it to exactly one line
                                    n.read_at ? 'text-slate-500' : 'font-medium text-slate-900'
                                )}>
                                    {n.data.message}
                                </p>
                            </div>

                            {/* 3. Action Section (View Link) */}
                            <div className="shrink-0">
                                {n.data.appointment_id && (
                                    <button
                                        onClick={() => router.visit(route('appointments.show', n.data.appointment_id!))}
                                        className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 px-2 py-1"
                                    >
                                        View
                                        <ArrowRight className="h-3 w-3" />
                                    </button>
                                )}
                            </div>

                            {/* 4. Timestamp Section */}
                            <div className="shrink-0 text-[10px] text-slate-400 w-20 text-right">
                                {n.created_at}
                            </div>

                            {/* 5. Status/Marking Section */}
                            <div className="shrink-0 flex items-center justify-center w-6">
                                {!n.read_at ? (
                                    <button
                                        onClick={() => markOne(n.id)}
                                        className="h-5 w-5 flex items-center justify-center rounded-full hover:bg-blue-100 transition-colors"
                                        title="Mark as read"
                                    >
                                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                                    </button>
                                ) : (
                                    <div className="h-5 w-5" /> // Spacer for alignment
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}