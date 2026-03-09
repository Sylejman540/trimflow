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
    const cls = 'h-4 w-4 shrink-0';
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
                        className="h-8 text-[11px] font-bold text-slate-500 hover:text-slate-900"
                        onClick={markAll}
                    >
                        Mark all as read
                    </Button>
                ) : undefined
            }
        >
            <Head title="Notifications" />

            <div className="w-full">
                {/* Full-width container with no max-width to allow flexing left-to-right */}
                <div className="flex flex-col bg-white">
                    {notifications.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <BellOff className="h-10 w-10 text-slate-200 mb-4" />
                            <p className="text-sm font-medium text-slate-500">No notifications yet</p>
                        </div>
                    )}

                    {notifications.map((n) => (
                        <div
                            key={n.id}
                            className={cn(
                                'group flex items-center gap-4 px-6 py-3 border-b border-slate-100 transition-colors duration-150',
                                n.read_at ? 'bg-white' : 'bg-slate-50/50 hover:bg-slate-50'
                            )}
                        >
                            {/* 1. Icon (Fixed Width) */}
                            <div className="flex-none">
                                <NotifIcon icon={n.data.icon} />
                            </div>

                            {/* 2. Message & View Action (Flex Grow) */}
                            <div className="flex-1 min-w-0 flex items-center gap-3">
                                <span className={cn(
                                    'text-[13px] truncate',
                                    n.read_at ? 'text-slate-500' : 'font-medium text-slate-900'
                                )}>
                                    {n.data.message}
                                </span>
                                
                                {n.data.appointment_id && (
                                    <button
                                        onClick={() => router.visit(route('appointments.show', n.data.appointment_id!))}
                                        className="flex-none text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-0.5"
                                    >
                                        View <ArrowRight className="h-3 w-3" />
                                    </button>
                                )}
                            </div>

                            {/* 3. Timestamp (Fixed Width) */}
                            <div className="flex-none text-[11px] text-slate-400 min-w-[100px] text-right">
                                {n.created_at}
                            </div>

                            {/* 4. Mark as Read Action */}
                            <div className="flex-none w-8 flex justify-end">
                                {!n.read_at ? (
                                    <button
                                        onClick={() => markOne(n.id)}
                                        className="h-6 w-6 flex items-center justify-center rounded-full hover:bg-blue-100 transition-all"
                                        title="Mark as read"
                                    >
                                        <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                                    </button>
                                ) : (
                                    <Check className="h-3.5 w-3.5 text-slate-200" />
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}