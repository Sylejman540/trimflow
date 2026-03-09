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

/**
 * Smaller, more refined icons for the compact list
 */
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
                        className="h-8 text-[11px] font-semibold text-slate-500 hover:text-slate-900"
                        onClick={markAll}
                    >
                        Mark all as read
                    </Button>
                ) : undefined
            }
        >
            <Head title="Notifications" />

            <div className="flex flex-col items-center w-full py-6 px-4">
                {/* Max-width reduced slightly to make the list feel tighter */}
                <div className="w-full max-w-xl space-y-1.5">
                    {notifications.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <BellOff className="h-8 w-8 text-slate-200 mb-3" />
                            <p className="text-sm font-medium text-slate-500">All caught up!</p>
                            <p className="text-xs text-slate-400">No new notifications to show.</p>
                        </div>
                    )}

                    {notifications.map((n) => (
                        <div
                            key={n.id}
                            className={cn(
                                'group relative flex items-start gap-3 rounded-md border p-2.5 transition-all duration-200',
                                n.read_at
                                    ? 'border-slate-100 bg-white opacity-80 hover:opacity-100'
                                    : 'border-blue-100 bg-blue-50/40 shadow-sm ring-1 ring-blue-50/50'
                            )}
                        >
                            {/* Icon - tucked top-left */}
                            <div className="mt-0.5">
                                <NotifIcon icon={n.data.icon} />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                    <p className={cn(
                                        'text-[13px] leading-snug break-words',
                                        n.read_at ? 'text-slate-500' : 'font-medium text-slate-900'
                                    )}>
                                        {n.data.message}
                                    </p>
                                    
                                    {/* Inline Timestamp to save vertical space */}
                                    <span className="shrink-0 text-[10px] text-slate-400 mt-0.5">
                                        {n.created_at}
                                    </span>
                                </div>

                                {/* Footer actions: Tiny and clean */}
                                <div className="flex items-center gap-3 mt-1.5">
                                    {n.data.appointment_id && (
                                        <button
                                            onClick={() => router.visit(route('appointments.show', n.data.appointment_id!))}
                                            className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 transition-colors"
                                        >
                                            View details
                                            <ArrowRight className="h-3 w-3" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Mark as read - hidden until hover for a cleaner look */}
                            {!n.read_at && (
                                <button
                                    onClick={() => markOne(n.id)}
                                    className="ml-2 shrink-0 opacity-0 group-hover:opacity-100 h-6 w-6 flex items-center justify-center rounded-full bg-white border border-slate-200 shadow-sm hover:border-blue-300 hover:text-blue-600 transition-all"
                                    title="Mark as read"
                                >
                                    <Check className="h-3 w-3" />
                                </button>
                            )}
                            
                            {/* Unread indicator dot (when not hovering) */}
                            {!n.read_at && (
                                <div className="absolute top-2.5 right-2.5 h-1.5 w-1.5 rounded-full bg-blue-500 group-hover:hidden" />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}