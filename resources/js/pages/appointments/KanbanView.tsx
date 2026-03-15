import { Link, router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { Edit, Eye, Trash2, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { formatCents, formatTime, cn } from '@/lib/utils';
import { Appointment, AppointmentStatus } from '@/types';

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

function ApptCard({ appt, isBarber, isOwnerBarber, onDelete }: {
    appt: Appointment; isBarber: boolean; isOwnerBarber: boolean; onDelete: (a: Appointment) => void;
}) {
    const { t } = useTranslation();
    return (
        <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-2 active:bg-slate-50 transition-colors">
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                    <p className="font-semibold text-slate-900 text-sm truncate">{appt.customer?.name ?? '-'}</p>
                    <p className="text-xs text-slate-400 mt-1 truncate">
                        {appt.service?.name ?? '-'}
                        {(!isBarber || isOwnerBarber) && appt.barber?.user?.name ? ` · ${appt.barber.user.name}` : ''}
                    </p>
                </div>
                <Badge className={cn('text-[10px] font-bold shrink-0 rounded-full px-2 py-0.5 shadow-none border', statusVariant(appt.status))}>
                    {t(`appt.${appt.status === 'no_show' ? 'noShow' : appt.status === 'in_progress' ? 'inProgress' : appt.status}`)}
                </Badge>
            </div>
            <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-600">{formatTime(appt.starts_at)}</span>
                <span className="font-bold text-slate-900">{formatCents(appt.price)}</span>
            </div>
            <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100">
                {appt.status === 'pending' && (
                    <button onClick={() => router.patch(route('appointments.confirm', appt.id))}
                        className="h-8 px-2 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-md hover:bg-emerald-100 transition-colors flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> {t('confirm')}
                    </button>
                )}
                <Link href={route('appointments.show', appt.id)}
                    className={cn(buttonVariants({ variant: 'ghost' }), 'h-8 w-8 p-0 text-slate-400 hover:text-slate-900 hover:bg-slate-100')}>
                    <Eye className="h-3.5 w-3.5" />
                </Link>
                {appt.status !== 'in_progress' && (
                    <Link href={route('appointments.edit', appt.id)}
                        className={cn(buttonVariants({ variant: 'ghost' }), 'h-8 w-8 p-0 text-slate-400 hover:text-slate-900 hover:bg-slate-100')}>
                        <Edit className="h-3.5 w-3.5" />
                    </Link>
                )}
                {appt.status !== 'in_progress' && appt.can_delete && (
                    <button onClick={() => onDelete(appt)}
                        className="h-8 w-8 flex items-center justify-center text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-md border border-slate-200 transition-colors">
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

    const statusLabel: Record<AppointmentStatus, string> = {
        pending:     t('appt.pending'),
        confirmed:   t('appt.confirmed'),
        in_progress: t('appt.inProgress'),
        completed:   t('appt.completed'),
        cancelled:   t('appt.cancelled'),
        no_show:     t('appt.noShow'),
    };

    return (
        <div className="flex gap-3 overflow-x-auto pb-4">
            {STATUS_COLS.map(status => {
                const col = filtered.filter(a => a.status === status);
                return (
                    <div key={status} className="flex-shrink-0 w-80">
                        <div className="flex items-center gap-2 mb-3 px-1">
                            <span className={cn('h-2 w-2 rounded-full shrink-0', statusDot(status))} />
                            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">{statusLabel[status]}</span>
                            <span className="ml-auto text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{col.length}</span>
                        </div>
                        <div className="space-y-2 min-h-[100px]">
                            {col.length === 0 ? (
                                <div className="border-2 border-dashed border-slate-100 rounded-lg h-20 flex items-center justify-center">
                                    <span className="text-xs text-slate-300">{t('noResults')}</span>
                                </div>
                            ) : col.map(appt => (
                                <ApptCard key={appt.id} appt={appt} isBarber={isBarber} isOwnerBarber={isOwnerBarber} onDelete={onDelete} />
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
