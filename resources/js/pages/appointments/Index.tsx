import { Head, Link, router, useForm } from '@inertiajs/react';
import { ColumnDef, FilterFn } from '@tanstack/react-table';
import { FormEvent, useState } from 'react';
import { Edit, Eye, Plus, Trash2 } from 'lucide-react';
import AppLayout from '@/layouts/AppLayout';
import { DataTable } from '@/components/data-table';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { formatCents, cn } from '@/lib/utils';
import { Appointment, AppointmentStatus, Barber, Service } from '@/types';

const allStatuses: AppointmentStatus[] = [
    'scheduled',
    'confirmed',
    'in_progress',
    'completed',
    'cancelled',
    'no_show',
];

function statusVariant(status: AppointmentStatus) {
    const map = {
        scheduled: 'bg-blue-50 text-blue-600 border border-blue-200',
        confirmed: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
        in_progress: 'bg-amber-50 text-amber-700 border border-amber-200',
        completed: 'bg-green-50 text-green-700 border border-green-200',
        cancelled: 'bg-red-50 text-red-600 border border-red-200',
        no_show: 'bg-slate-100 text-slate-600',
    };

    return map[status];
}

function formatDateTime(dateStr: string) {
    return new Date(dateStr).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}

const searchFilter: FilterFn<Appointment> = (row, _columnId, filterValue) => {
    const search = (filterValue as string).toLowerCase();
    const a = row.original;
    return [
        a.customer?.name,
        a.barber?.user?.name,
        a.service?.name,
    ].some((val) => val?.toLowerCase().includes(search));
};

function isToday(dateStr: string) {
    const d = new Date(dateStr);
    const now = new Date();
    return d.getFullYear() === now.getFullYear()
        && d.getMonth() === now.getMonth()
        && d.getDate() === now.getDate();
}

function isTomorrow(dateStr: string) {
    const d = new Date(dateStr);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return d.getFullYear() === tomorrow.getFullYear()
        && d.getMonth() === tomorrow.getMonth()
        && d.getDate() === tomorrow.getDate();
}

function DeleteModal({
    appointment,
    open,
    onOpenChange,
}: {
    appointment: Appointment;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const [processing, setProcessing] = useState(false);

    function handleDelete() {
        setProcessing(true);
        router.delete(route('appointments.destroy', appointment.id), {
            onSuccess: () => onOpenChange(false),
            onFinish: () => setProcessing(false),
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>Delete Appointment</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete the appointment for{' '}
                        <span className="font-medium text-gray-900">
                            {appointment.customer?.name ?? 'this customer'}
                        </span>
                        {' '}on {formatDateTime(appointment.starts_at)}? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={processing}
                    >
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function Index({
    appointments,
    can_create,
    barbers,
    services,
}: {
    appointments: Appointment[];
    can_create: boolean;
    barbers: Barber[];
    services: Service[];
}) {
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [dateFilter, setDateFilter] = useState<string>('all');
    const [deletingAppt, setDeletingAppt] = useState<Appointment | null>(null);

    const filtered = appointments.filter((a) => {
        if (statusFilter !== 'all' && a.status !== statusFilter) return false;
        if (dateFilter === 'today' && !isToday(a.starts_at)) return false;
        if (dateFilter === 'tomorrow' && !isTomorrow(a.starts_at)) return false;
        return true;
    });

    const columns: ColumnDef<Appointment>[] = [
        {
            accessorKey: 'starts_at',
            header: 'Date & Time',
            cell: ({ row }) => (
                <span className="whitespace-nowrap">
                    {formatDateTime(row.original.starts_at)}
                </span>
            ),
        },
        {
            id: 'customer',
            header: 'Customer',
            cell: ({ row }) => (
                <span className="font-medium">{row.original.customer?.name ?? '-'}</span>
            ),
        },
        {
            id: 'barber',
            header: 'Barber',
            cell: ({ row }) => row.original.barber?.user?.name ?? '-',
        },
        {
            id: 'service',
            header: 'Service',
            cell: ({ row }) => row.original.service?.name ?? '-',
        },
        {
            accessorKey: 'price',
            header: 'Price',
            cell: ({ row }) => formatCents(row.original.price),
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => (
                <Badge className={`text-xs font-medium rounded-full px-2.5 py-1 ${statusVariant(row.original.status)} shadow-none`}>
                    {row.original.status.replace('_', ' ')}
                </Badge>
            ),
        },
        {
            id: 'actions',
            header: () => <div className="text-right px-4">Actions</div>,
            cell: ({ row }) => {
                const appt = row.original;
                return (
                    <div className="flex items-center justify-end gap-1">
                        {/* View Details Link */}
                        <Link
                            href={route('appointments.show', appt.id)}
                            className={cn(
                                buttonVariants({ variant: 'ghost', size: 'icon' }),
                                "h-8 w-8 text-slate-500 hover:text-slate-900"
                            )}
                        >
                            <Eye className="h-4 w-4" />
                        </Link>
                        
                        {/* Edit Page Link */}
                        <Link
                            href={route('appointments.edit', appt.id)}
                            className={cn(
                                buttonVariants({ variant: 'ghost', size: 'icon' }),
                                "h-8 w-8 text-slate-500 hover:text-slate-900"
                            )}
                        >
                            <Edit className="h-4 w-4" />
                        </Link>

                        {/* Delete Modal Trigger */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50"
                            onClick={() => setDeletingAppt(appt)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                );
            },
        },
    ];

    return (
        <AppLayout
            title="Appointments"
            actions={
                can_create ? (
                    <Link href={route('appointments.create')} className={cn(buttonVariants({ variant: "default" }), "bg-slate-900 text-white hover:bg-slate-800")}>
                        <Plus className="mr-2 h-4 w-4" />
                        New Appointment
                    </Link>
                ) : undefined
            }
        >
            <Head title="Appointments" />
            <DataTable
                columns={columns}
                data={filtered}
                searchPlaceholder="Search by customer, barber, service..."
                globalFilterFn={searchFilter}
                filters={
                    <>
                        <Select value={dateFilter} onValueChange={(v) => setDateFilter(v ?? 'all')}>
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="All dates" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All dates</SelectItem>
                                <SelectItem value="today">Today</SelectItem>
                                <SelectItem value="tomorrow">Tomorrow</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? 'all')}>
                            <SelectTrigger className="w-[160px]">
                                <SelectValue placeholder="All statuses" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All statuses</SelectItem>
                                {allStatuses.map((s) => (
                                    <SelectItem key={s} value={s}>
                                        {s.replace('_', ' ')}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </>
                }
            />

            {/* Delete Confirmation Modal */}
            {deletingAppt && (
                <DeleteModal
                    key={deletingAppt.id}
                    appointment={deletingAppt}
                    open={!!deletingAppt}
                    onOpenChange={(open) => { if (!open) setDeletingAppt(null); }}
                />
            )}
        </AppLayout>
    );
}