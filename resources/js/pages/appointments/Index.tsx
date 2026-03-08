import { Head, Link, router, useForm } from '@inertiajs/react';
import { ColumnDef, FilterFn } from '@tanstack/react-table';
import { FormEvent, useState } from 'react';
import { Edit, Eye, MoreHorizontal, Plus, Trash2 } from 'lucide-react';
import AppLayout from '@/layouts/AppLayout';
import { DataTable } from '@/components/data-table';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { formatCents, formatDuration } from '@/lib/utils';
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

function EditModal({
    appointment,
    barbers,
    services,
    open,
    onOpenChange,
}: {
    appointment: Appointment;
    barbers: Barber[];
    services: Service[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const { data, setData, put, processing, errors } = useForm({
        barber_id: String(appointment.barber_id),
        customer_name: appointment.customer?.name ?? '',
        customer_phone: appointment.customer?.phone ?? '',
        service_id: String(appointment.service_id),
        starts_at: appointment.starts_at.slice(0, 16),
        status: appointment.status,
        notes: appointment.notes ?? '',
    });

    const selectedService = services.find(
        (s) => s.id === Number(data.service_id),
    );

    function submit(e: FormEvent) {
        e.preventDefault();
        put(route('appointments.update', appointment.id), {
            onSuccess: () => onOpenChange(false),
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Edit Appointment</DialogTitle>
                    <DialogDescription>
                        Update appointment details for {appointment.customer?.name ?? 'this customer'}.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label>Barber</Label>
                        <Select
                            value={data.barber_id}
                            onValueChange={(v) => setData('barber_id', v ?? '')}
                        >
                            <SelectTrigger className="h-9">
                                <SelectValue placeholder="Select barber" />
                            </SelectTrigger>
                            <SelectContent>
                                {barbers.map((b) => (
                                    <SelectItem key={b.id} value={String(b.id)}>
                                        {b.user?.name ?? ''}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.barber_id && <p className="text-xs text-red-600">{errors.barber_id}</p>}
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="edit_customer_name">Customer Name</Label>
                            <Input
                                id="edit_customer_name"
                                value={data.customer_name}
                                onChange={(e) => setData('customer_name', e.target.value)}
                                className="h-9"
                                required
                            />
                            {errors.customer_name && <p className="text-xs text-red-600">{errors.customer_name}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="edit_customer_phone">Phone</Label>
                            <Input
                                id="edit_customer_phone"
                                value={data.customer_phone}
                                onChange={(e) => setData('customer_phone', e.target.value)}
                                className="h-9"
                            />
                            {errors.customer_phone && <p className="text-xs text-red-600">{errors.customer_phone}</p>}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label>Service</Label>
                        <Select
                            value={data.service_id}
                            onValueChange={(v) => setData('service_id', v ?? '')}
                        >
                            <SelectTrigger className="h-9">
                                <SelectValue placeholder="Select service" />
                            </SelectTrigger>
                            <SelectContent>
                                {services.map((s) => (
                                    <SelectItem key={s.id} value={String(s.id)}>
                                        {s.name} - {formatCents(s.price)} ({formatDuration(s.duration)})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {selectedService && (
                            <p className="text-xs text-gray-500">
                                {formatDuration(selectedService.duration)} | {formatCents(selectedService.price)}
                            </p>
                        )}
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="edit_starts_at">Date & Time</Label>
                            <Input
                                id="edit_starts_at"
                                type="datetime-local"
                                value={data.starts_at}
                                onChange={(e) => setData('starts_at', e.target.value)}
                                className="h-9"
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Status</Label>
                            <Select
                                value={data.status}
                                onValueChange={(v) => v && setData('status', v as AppointmentStatus)}
                            >
                                <SelectTrigger className="h-9">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {allStatuses.map((s) => (
                                        <SelectItem key={s} value={s}>
                                            {s.replace('_', ' ')}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="edit_notes">Notes</Label>
                        <Textarea
                            id="edit_notes"
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            rows={2}
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            Save Changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
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
    const [editingAppt, setEditingAppt] = useState<Appointment | null>(null);
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
    <Badge className={`text-xs font-medium rounded-full px-2.5 py-1 ${statusVariant(row.original.status)}`}>
        {row.original.status.replace('_', ' ')}
    </Badge>
),
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                const appt = row.original;
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger render={<Button variant="ghost" size="sm" />}>
                            <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem render={<Link href={route('appointments.show', appt.id)} />}>
                                <Eye className="mr-2 h-4 w-4" />
                                View
                            </DropdownMenuItem>
                            {appt.can_edit && (
                                <DropdownMenuItem onClick={() => { setTimeout(() => setEditingAppt(appt), 0); }}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                </DropdownMenuItem>
                            )}
                            {appt.can_delete && (
                                <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => { setTimeout(() => setDeletingAppt(appt), 0); }}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    return (
        <AppLayout
            title="Appointments"
            actions={
                can_create ? (
                    <Link href={route('appointments.create')} className={buttonVariants({ variant: "default" })}>
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

            {/* Edit Modal */}
            {editingAppt && (
                <EditModal
                    key={editingAppt.id}
                    appointment={editingAppt}
                    barbers={barbers}
                    services={services}
                    open={!!editingAppt}
                    onOpenChange={(open) => { if (!open) setEditingAppt(null); }}
                />
            )}

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
