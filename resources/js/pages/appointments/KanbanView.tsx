import { Link, router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { Edit, Eye, Trash2, CheckCircle2, GripVertical } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { formatCents, formatTime, cn } from '@/lib/utils';
import { Appointment, AppointmentStatus } from '@/types';
import { useState } from 'react';

function statusVariant(status: AppointmentStatus) {
    const map: Record<AppointmentStatus, string> = {
        pending:     'bg-orange-50 text-orange-700 border-orange-100',
        confirmed:   'bg-emerald-50 text-emerald-700 border-emerald-100',
        in_progress: 'bg-amber-50 text-amber-700 border-amber-100',
        completed:   'bg-green-50 text-green-700 border-green-100',
        cancelled:   'bg-red-50 text-red-600 border-red-100',
        no_show:     'bg-slate-50 text-slate-600 border-slate-100',
    };
    return map[status];
}

function statusDot(status: AppointmentStatus) {
    const map: Record<AppointmentStatus, string> = {
        pending:     'bg-orange-400',
        confirmed:   'bg-emerald-400',
        in_progress: 'bg-amber-400',
        completed:   'bg-green-400',
        cancelled:   'bg-red-400',
        no_show:     'bg-slate-400',
    };
    return map[status];
}

const STATUS_COLS: AppointmentStatus[] = [
    'pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show',
];

function ApptCard({ appt, isBarber, isOwnerBarber, onDelete, isDragging, onDragStart }: {
    appt: Appointment; isBarber: boolean; isOwnerBarber: boolean; onDelete: (a: Appointment) => void; isDragging: boolean; onDragStart: (e: React.DragEvent<HTMLDivElement>, appt: Appointment) => void;
}) {
    const { t } = useTranslation();
    return (
        <div
            draggable
            onDragStart={(e) => onDragStart(e, appt)}
            className={cn(
                "bg-white border border-slate-200 rounded-lg p-3.5 space-y-3 transition-all hover:shadow-sm cursor-grab active:cursor-grabbing",
                isDragging && "opacity-50"
            )}>
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 flex-1 min-w-0">
                    <GripVertical className="h-4 w-4 text-slate-300 shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-900 text-sm truncate">{appt.customer?.name ?? '-'}</p>
                        <p className="text-xs text-slate-500 mt-1 truncate">
                            {appt.service?.name ?? '-'}
                            {(!isBarber || isOwnerBarber) && appt.barber?.user?.name ? ` · ${appt.barber.user.name}` : ''}
                        </p>
                    </div>
                </div>
                <Badge className={cn('text-[11px] font-bold shrink-0 rounded-full px-2.5 py-1 shadow-none border', statusVariant(appt.status))}>
                    {t(`appt.${appt.status === 'no_show' ? 'noShow' : appt.status === 'in_progress' ? 'inProgress' : appt.status}`)}
                </Badge>
            </div>
            <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-600 bg-slate-50 px-2 py-1 rounded">{formatTime(appt.starts_at)}</span>
                <span className="font-bold text-slate-900">{formatCents(appt.price)}</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
                {appt.status === 'pending' && (
                    <button onClick={() => router.patch(route('appointments.confirm', appt.id))}
                        className="flex-1 min-w-[90px] h-9 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> {t('confirm')}
                    </button>
                )}
                <Link href={route('appointments.show', appt.id)}
                    className={cn(buttonVariants({ variant: 'outline' }), 'h-9 px-2 text-xs font-bold border-slate-200 shadow-none flex-1 min-w-[40px]')}>
                    <Eye className="h-3.5 w-3.5" />
                </Link>
                {appt.status !== 'in_progress' && (
                    <Link href={route('appointments.edit', appt.id)}
                        className={cn(buttonVariants({ variant: 'outline' }), 'h-9 px-2 text-xs font-bold border-slate-200 shadow-none flex-1 min-w-[40px]')}>
                        <Edit className="h-3.5 w-3.5" />
                    </Link>
                )}
                {appt.status !== 'in_progress' && appt.can_delete && (
                    <button onClick={() => onDelete(appt)}
                        className="h-9 w-9 flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg border border-slate-200 transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                    </button>
                )}
            </div>
        </div>
    );
}

export function KanbanView({ filtered, isBarber, isOwnerBarber, onDelete }: {
    filtered: Appointment[]; isBarber: boolean; isOwnerBarber: boolean; onDelete: (a: Appointment) => void;
}) {
    const { t } = useTranslation();
    const [draggedAppt, setDraggedAppt] = useState<Appointment | null>(null);
    const [draggedFromStatus, setDraggedFromStatus] = useState<AppointmentStatus | null>(null);

    const statusLabel: Record<AppointmentStatus, string> = {
        pending:     t('appt.pending'),
        confirmed:   t('appt.confirmed'),
        in_progress: t('appt.inProgress'),
        completed:   t('appt.completed'),
        cancelled:   t('appt.cancelled'),
        no_show:     t('appt.noShow'),
    };

    function handleDragStart(e: React.DragEvent<HTMLDivElement>, appt: Appointment) {
        setDraggedAppt(appt);
        setDraggedFromStatus(appt.status);
        e.dataTransfer.effectAllowed = 'move';
    }

    function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }

    function handleDrop(e: React.DragEvent<HTMLDivElement>, targetStatus: AppointmentStatus) {
        e.preventDefault();
        if (!draggedAppt || !draggedFromStatus) return;

        if (draggedAppt.status === targetStatus) {
            setDraggedAppt(null);
            setDraggedFromStatus(null);
            return;
        }

        // Update appointment status via PATCH request
        const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '';
        fetch(route('appointments.update', draggedAppt.id), {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken },
            body: JSON.stringify({ status: targetStatus }),
        })
            .then(r => {
                if (r.ok) {
                    // Reload to reflect the change
                    router.get(route('appointments.index'), {}, { preserveState: true });
                }
            })
            .catch(err => console.error('Failed to update appointment:', err))
            .finally(() => {
                setDraggedAppt(null);
                setDraggedFromStatus(null);
            });
    }

    return (
        <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
            {STATUS_COLS.map(status => {
                const col = filtered.filter(a => a.status === status);
                return (
                    <div key={status} className="flex-shrink-0 w-72 sm:w-80">
                        <div className="flex items-center gap-2.5 mb-3 px-1">
                            <span className={cn('h-2.5 w-2.5 rounded-full shrink-0', statusDot(status))} />
                            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider truncate">{statusLabel[status]}</span>
                            <span className="ml-auto text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full shrink-0">{col.length}</span>
                        </div>
                        <div
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, status)}
                            className={cn(
                                "space-y-2.5 min-h-[100px] p-2 rounded-lg transition-colors",
                                draggedFromStatus && draggedFromStatus !== status && "bg-slate-50"
                            )}>
                            {col.length === 0 ? (
                                <div className="border-2 border-dashed border-slate-100 rounded-lg h-20 flex items-center justify-center">
                                    <span className="text-xs text-slate-400">{t('noResults')}</span>
                                </div>
                            ) : col.map(appt => (
                                <ApptCard
                                    key={appt.id}
                                    appt={appt}
                                    isBarber={isBarber}
                                    isOwnerBarber={isOwnerBarber}
                                    onDelete={onDelete}
                                    isDragging={draggedAppt?.id === appt.id}
                                    onDragStart={handleDragStart}
                                />
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
