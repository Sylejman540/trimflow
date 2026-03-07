import { Head, Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Edit, MoreHorizontal, Plus, Trash2 } from 'lucide-react';
import AppLayout from '@/layouts/AppLayout';
import { DataTable } from '@/components/data-table';
import { Button, buttonVariants } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Customer } from '@/types';

const columns: ColumnDef<Customer>[] = [
    {
        accessorKey: 'name',
        header: 'Name',
    },
    {
        accessorKey: 'email',
        header: 'Email',
        cell: ({ row }) => row.original.email ?? '-',
    },
    {
        accessorKey: 'phone',
        header: 'Phone',
        cell: ({ row }) => row.original.phone ?? '-',
    },
    {
        id: 'favorite_barber',
        header: 'Favorite Barber',
        cell: ({ row }) => row.original.favorite_barber?.user?.name ?? '-',
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const customer = row.original;
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="ghost" size="sm" />}>
                        <MoreHorizontal className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem render={<Link href={route('customers.edit', customer.id)} />}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                                if (confirm('Delete this customer?')) {
                                    router.delete(route('customers.destroy', customer.id));
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

export default function Index({ customers }: { customers: Customer[] }) {
    return (
        <AppLayout
            title="Customers"
            actions={
                <Link href={route('customers.create')} className={buttonVariants({ variant: "default" })}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Customer
                </Link>
            }
        >
            <Head title="Customers" />
            <DataTable columns={columns} data={customers} />
        </AppLayout>
    );
}
