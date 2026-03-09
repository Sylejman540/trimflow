import { Head, router } from '@inertiajs/react';
import { Bell, BellOff, CalendarDays, CheckCircle2, XCircle, AlertTriangle, Check } from 'lucide-react';
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
                        variant="outline"
                        className="h-9 px-4 rounded-lg text-xs font-bold border-slate-200 shadow-none"
                        onClick={markAll}
                    >
                        Mark all read
                    </Button>
                ) : undefined
            }
        >
            <Head title="Notifications" />

            {/* Centering Wrapper */}
            <div className="flex flex-col items-center w-full py-10">
                <div className="w-full max-w-2xl space-y-2">
                    {notifications.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <BellOff className="h-10 w-10 text-slate-200 mb-4" />
                            <p className="text-sm font-medium text-slate-500">No notifications yet</p>
                            <p className="text-xs text-slate-400 mt-1">Status changes and alerts will appear here.</p>
                        </div>
                    )}

                    {notifications.map(n => (
                        <div
                            key={n.id}
                            className={cn(
                                'flex items-start gap-4 rounded-xl border px-5 py-4 transition-colors',
                                n.read_at
                                    ? 'border-slate-100 bg-white'
                                    : 'border-slate-200 bg-slate-50',
                            )}
                        >
                            <div className="mt-0.5">
                                <NotifIcon icon={n.data.icon} />
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className={cn(
                                    'text-sm leading-snug',
                                    n.read_at ? 'text-slate-500' : 'font-medium text-slate-900',
                                )}>
                                    {n.data.message}
                                </p>
                                <p className="text-[11px] text-slate-400 mt-0.5">{n.created_at}</p>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                                {n.data.appointment_id && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 px-2 text-xs text-slate-400 hover:text-slate-900"
                                        onClick={() => router.visit(route('appointments.show', n.data.appointment_id!))}
                                    >
                                        View
                                    </Button>
                                )}
                                {!n.read_at && (
                                    <button
                                        onClick={() => markOne(n.id)}
                                        className="h-2 w-2 rounded-full bg-slate-900 hover:bg-slate-600 transition-colors shrink-0"
                                        title="Mark as read"
                                    />
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}