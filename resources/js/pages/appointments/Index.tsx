import { Head, Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Edit, Eye, MoreHorizontal, Plus, Trash2 } from 'lucide-react';
import AppLayout from '@/layouts/AppLayout';
import { DataTable } from '@/components/data-table';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatCents } from '@/lib/utils';
import { Appointment, AppointmentStatus } from '@/types';

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
        accessorKey: 'customer_name',
        header: 'Customer',
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
                        <DropdownMenuItem render={<Link href={route('appointments.edit', appt.id)} />}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                        </DropdownMenuItem>
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
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];

export default function Index({
    appointments,
}: {
    appointments: Appointment[];
}) {
    return (
        <AppLayout
            title="Appointments"
            actions={
                <Link href={route('appointments.create')} className={buttonVariants({ variant: "default" })}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Appointment
                </Link>
            }
        >
            <Head title="Appointments" />
            <DataTable columns={columns} data={appointments} />
        </AppLayout>
    );
}
