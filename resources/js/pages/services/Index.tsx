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
import { formatCents, formatDuration } from '@/lib/utils';
import { Service } from '@/types';

const columns: ColumnDef<Service>[] = [
    {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => (
            <span className="font-medium">{row.original.name}</span>
        ),
    },
    {
        accessorKey: 'category',
        header: 'Category',
        cell: ({ row }) => row.original.category ?? '-',
    },
    {
        accessorKey: 'duration',
        header: 'Duration',
        cell: ({ row }) => formatDuration(row.original.duration),
    },
    {
        accessorKey: 'price',
        header: 'Price',
        cell: ({ row }) => formatCents(row.original.price),
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
            const service = row.original;
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger
                        render={<Button variant="ghost" size="sm" />}
                    >
                        <MoreHorizontal className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem render={<Link href={route('services.edit', service.id)} />}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                                if (confirm('Delete this service?')) {
                                    router.delete(
                                        route('services.destroy', service.id),
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

export default function Index({ services }: { services: Service[] }) {
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const filtered = statusFilter === 'all'
        ? services
        : services.filter((s) => (statusFilter === 'active') === s.is_active);

    return (
        <AppLayout
            title="Services"
            actions={
                <Link href={route('services.create')} className={buttonVariants()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Service
                </Link>
            }
        >
            <Head title="Services" />
            <DataTable
                columns={columns}
                data={filtered}
                searchPlaceholder="Search services..."
                searchColumn="name"
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
