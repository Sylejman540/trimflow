import { Head, Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { useState } from 'react';
import { Edit, MoreHorizontal, Plus, Trash2 } from 'lucide-react';
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
import { Barber } from '@/types';

const columns: ColumnDef<Barber>[] = [
    {
        accessorKey: 'user.name',
        header: 'Name',
        cell: ({ row }) => (
            <span className="font-medium">{row.original.user?.name}</span>
        ),
    },
    {
        accessorKey: 'user.email',
        header: 'Email',
        cell: ({ row }) => row.original.user?.email,
    },
    {
        accessorKey: 'specialty',
        header: 'Specialty',
        cell: ({ row }) => row.original.specialty ?? '-',
    },
    {
        accessorKey: 'is_active',
        header: 'Status',
        cell: ({ row }) => (
            <Badge variant={row.original.is_active ? 'default' : 'secondary'}>
                {row.original.is_active ? 'Active' : 'Inactive'}
            </Badge>
        ),
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const barber = row.original;
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="ghost" size="sm" />}>
                        <MoreHorizontal className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem render={<Link href={route('barbers.edit', barber.id)} />}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                                if (confirm('Delete this barber?')) {
                                    router.delete(
                                        route('barbers.destroy', barber.id),
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

export default function Index({ barbers }: { barbers: Barber[] }) {
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const filtered = statusFilter === 'all'
        ? barbers
        : barbers.filter((b) => (statusFilter === 'active') === b.is_active);

    return (
        <AppLayout
            title="Barbers"
            actions={
                <Link href={route('barbers.create')} className={buttonVariants({ variant: "default" })}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Barber
                </Link>
            }
        >
            <Head title="Barbers" />
            <DataTable
                columns={columns}
                data={filtered}
                searchPlaceholder="Search barbers..."
                filters={
                    <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? 'all')}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                    </Select>
                }
            />
        </AppLayout>
    );
}
