import { Head, Link, router } from '@inertiajs/react';
import { ColumnDef, FilterFn } from '@tanstack/react-table';
import { useState } from 'react';
import { Edit, Eye, MoreHorizontal, Plus, Trash2 } from 'lucide-react';
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatCents } from '@/lib/utils';
import { Appointment, AppointmentStatus } from '@/types';

const statuses: AppointmentStatus[] = [
    'scheduled',
    'confirmed',
    'in_progress',
    'completed',
    'cancelled',
    'no_show',
];

function statusVariant(status: AppointmentStatus) {
    const map: Record<AppointmentStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
        scheduled: 'outline',
        confirmed: 'default',
        in_progress: 'secondary',
        completed: 'default',
        cancelled: 'destructive',
        no_show: 'destructive',
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
        cell: ({ row }) => row.original.customer?.name ?? '-',
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
            <Badge variant={statusVariant(row.original.status)}>
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
                            <DropdownMenuItem render={<Link href={route('appointments.edit', appt.id)} />}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                        )}
                        {appt.can_delete && (
                            <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => {
                                    if (confirm('Delete this appointment?')) {
                                        router.delete(
                                            route('appointments.destroy', appt.id),
                                        );
                                    }
                                }}
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

export default function Index({
    appointments,
    can_create,
}: {
    appointments: Appointment[];
    can_create: boolean;
}) {
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [dateFilter, setDateFilter] = useState<string>('all');

    const filtered = appointments.filter((a) => {
        if (statusFilter !== 'all' && a.status !== statusFilter) return false;
        if (dateFilter === 'today' && !isToday(a.starts_at)) return false;
        if (dateFilter === 'tomorrow' && !isTomorrow(a.starts_at)) return false;
        return true;
    });

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
                                {statuses.map((s) => (
                                    <SelectItem key={s} value={s}>
                                        {s.replace('_', ' ')}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </>
                }
            />
        </AppLayout>
    );
}
