import { Head, Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { useState } from 'react';
import { Edit, Eye, Plus, Trash2, Search, SlidersHorizontal, Star, Download } from 'lucide-react';
import AppLayout from '@/layouts/AppLayout';
import { DataTable } from '@/components/data-table';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Dialog, DialogContent, DialogDescription,
    DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Customer } from '@/types';

function tierClass(tier?: string) {
    switch (tier) {
        case 'Gold':   return 'bg-amber-50 text-amber-700 border-amber-200';
        case 'Silver': return 'bg-slate-100 text-slate-600 border-slate-200';
        case 'Bronze': return 'bg-orange-50 text-orange-700 border-orange-200';
        default:       return 'bg-slate-50 text-slate-500 border-slate-100';
    }
}

function DeleteModal({ customer, open, onOpenChange }: {
    customer: Customer; open: boolean; onOpenChange: (v: boolean) => void;
}) {
    const [processing, setProcessing] = useState(false);
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-sm border-slate-200 shadow-none">
                <DialogHeader>
                    <DialogTitle>Delete Customer</DialogTitle>
                    <DialogDescription>
                        Delete <span className="font-medium text-gray-900">{customer.name}</span>? This cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="border-slate-200 shadow-none">Cancel</Button>
                    <Button variant="destructive" disabled={processing} className="shadow-none" onClick={() => {
                        setProcessing(true);
                        router.delete(route('customers.destroy', customer.id), {
                            onSuccess: () => onOpenChange(false),
                            onFinish: () => setProcessing(false),
                        });
                    }}>Delete</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function Index({ customers }: { customers: Customer[] }) {
    const [search, setSearch] = useState('');
    const [deleting, setDeleting] = useState<Customer | null>(null);

    const filtered = customers.filter(c => {
        const s = search.toLowerCase();
        return !s || [c.name, c.email, c.phone, c.favorite_barber?.user?.name]
            .some(v => v?.toLowerCase().includes(s));
    });

    const columns: ColumnDef<Customer>[] = [
        {
            accessorKey: 'name',
            header: () => <span className="text-[10px] font-bold tracking-wider text-slate-400">NAME</span>,
            cell: ({ row }) => <span className="text-sm font-medium text-slate-900">{row.original.name}</span>,
        },
        {
            accessorKey: 'email',
            header: () => <span className="text-[10px] font-bold tracking-wider text-slate-400">EMAIL</span>,
            cell: ({ row }) => <span className="text-sm text-slate-600">{row.original.email ?? '-'}</span>,
        },
        {
            accessorKey: 'phone',
            header: () => <span className="text-[10px] font-bold tracking-wider text-slate-400">PHONE</span>,
            cell: ({ row }) => <span className="text-sm text-slate-600">{row.original.phone ?? '-'}</span>,
        },
        {
            id: 'favorite_barber',
            header: () => <span className="text-[10px] font-bold tracking-wider text-slate-400">BARBER</span>,
            cell: ({ row }) => <span className="text-sm text-slate-600">{row.original.favorite_barber?.user?.name ?? '-'}</span>,
        },
        {
            id: 'loyalty',
            header: () => <span className="text-[10px] font-bold tracking-wider text-slate-400">LOYALTY</span>,
            cell: ({ row }) => {
                const c = row.original;
                return (
                    <div className="flex items-center gap-2">
                        <Badge className={cn('text-[10px] font-bold tracking-wider rounded-md px-2 py-0.5 shadow-none border', tierClass(c.loyalty_tier))}>
                            {c.loyalty_tier ?? 'Member'}
                        </Badge>
                        <span className="text-xs text-slate-400 flex items-center gap-0.5">
                            <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                            {c.loyalty_points ?? 0}
                        </span>
                    </div>
                );
            },
        },
        {
            id: 'visits',
            header: () => <span className="text-[10px] font-bold tracking-wider text-slate-400">VISITS</span>,
            cell: ({ row }) => (
                <span className="text-sm font-medium text-slate-700">{row.original.visit_count ?? 0}</span>
            ),
        },
        {
            id: 'actions',
            header: () => <div className="text-right px-2 text-[10px] font-bold tracking-wider text-slate-400">ACTIONS</div>,
            cell: ({ row }) => {
                const customer = row.original;
                return (
                    <div className="flex items-center justify-end gap-1">
                        <Link href={route('customers.show', customer.id)} className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'h-8 w-8 text-slate-400 hover:text-slate-900 hover:bg-slate-100')}>
                            <Eye className="h-4 w-4" />
                        </Link>
                        <Link href={route('customers.edit', customer.id)} className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'h-8 w-8 text-slate-400 hover:text-slate-900 hover:bg-slate-100')}>
                            <Edit className="h-4 w-4" />
                        </Link>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-red-600 hover:bg-red-50" onClick={() => setDeleting(customer)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                );
            },
        },
    ];

    return (
        <AppLayout
            title="Customers"
            actions={
                <div className="flex items-center gap-2">
                    <a
                        href={route('export.customers')}
                        className={cn(buttonVariants({ variant: 'outline' }), 'h-9 px-4 rounded-lg text-xs font-bold border-slate-200 shadow-none')}
                    >
                        <Download className="mr-2 h-3.5 w-3.5" /> Export CSV
                    </a>
                    <Link href={route('customers.create')} className={cn(buttonVariants({ variant: 'default' }), 'bg-slate-900 text-white hover:bg-slate-800 h-9 px-4 rounded-lg text-xs font-bold border-none shadow-none')}>
                        <Plus className="mr-2 h-3.5 w-3.5" /> New Customer
                    </Link>
                </div>
            }
        >
            <Head title="Customers" />

            <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 p-2 rounded-xl">
                    <div className="relative flex-1 max-w-2xl">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            placeholder="Search by name, email, or phone..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50/50 border border-slate-100 rounded-lg text-sm focus:bg-white transition-all placeholder:text-slate-400 outline-none"
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="hidden lg:flex items-center gap-1.5 px-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        <SlidersHorizontal size={12} /> {filtered.length} customers
                    </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                    <DataTable columns={columns} data={filtered} showSearch={false} />
                </div>
            </div>

            {deleting && (
                <DeleteModal
                    customer={deleting}
                    open={!!deleting}
                    onOpenChange={open => !open && setDeleting(null)}
                />
            )}
        </AppLayout>
    );
}
