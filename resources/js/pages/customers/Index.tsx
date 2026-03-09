import { Head, Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { useState } from 'react';
import { Edit, Eye, Plus, Trash2, Search, User, Phone, Star } from 'lucide-react';
import AppLayout from '@/layouts/AppLayout';
import { DataTable } from '@/components/data-table';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Customer } from '@/types';

const tierStyle: Record<string, string> = {
    bronze:   'bg-orange-50 text-orange-700 border-orange-100',
    silver:   'bg-slate-50 text-slate-600 border-slate-200',
    gold:     'bg-amber-50 text-amber-700 border-amber-100',
    platinum: 'bg-blue-50 text-blue-700 border-blue-100',
};

function DeleteModal({ customer, open, onOpenChange }: { customer: Customer; open: boolean; onOpenChange: (v: boolean) => void }) {
    const [processing, setProcessing] = useState(false);

    function handleDelete() {
        setProcessing(true);
        router.delete(route('customers.destroy', customer.id), {
            onSuccess: () => onOpenChange(false),
            onFinish: () => setProcessing(false),
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-sm border-slate-200 shadow-none">
                <DialogHeader>
                    <DialogTitle>Delete Customer</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete <span className="font-medium text-slate-900">{customer.name}</span>? This cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="border-slate-200 shadow-none">Cancel</Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={processing} className="shadow-none">Delete</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function Index({ customers }: { customers: Customer[] }) {
    const [search, setSearch] = useState('');
    const [deleting, setDeleting] = useState<Customer | null>(null);

    const filtered = customers.filter(c => {
        const q = search.toLowerCase();
        return !q || c.name.toLowerCase().includes(q) || c.phone?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q);
    });

    const columns: ColumnDef<Customer>[] = [
        {
            accessorKey: 'name',
            header: () => <span className="text-[10px] font-bold tracking-wider text-slate-400">NAME</span>,
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-bold shrink-0">
                        {row.original.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-slate-900">{row.original.name}</span>
                </div>
            ),
        },
        {
            accessorKey: 'phone',
            header: () => <span className="text-[10px] font-bold tracking-wider text-slate-400">PHONE</span>,
            cell: ({ row }) => (
                <div className="flex items-center gap-1.5 text-sm text-slate-600">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    {row.original.phone ?? <span className="text-slate-300">—</span>}
                </div>
            ),
        },
        {
            accessorKey: 'visit_count',
            header: () => <span className="text-[10px] font-bold tracking-wider text-slate-400">VISITS</span>,
            cell: ({ row }) => <span className="text-sm font-medium text-slate-900">{row.original.visit_count ?? 0}</span>,
        },
        {
            accessorKey: 'loyalty_tier',
            header: () => <span className="text-[10px] font-bold tracking-wider text-slate-400">TIER</span>,
            cell: ({ row }) => {
                const tier = row.original.loyalty_tier;
                if (!tier) return null;
                return (
                    <Badge className={cn('text-[10px] font-bold tracking-wider rounded-md px-2 py-0.5 shadow-none border capitalize', tierStyle[tier] ?? 'bg-slate-50 text-slate-500 border-slate-100')}>
                        {tier}
                    </Badge>
                );
            },
        },
        {
            id: 'actions',
            header: () => <div className="text-right px-2 text-[10px] font-bold tracking-wider text-slate-400">ACTIONS</div>,
            cell: ({ row }) => (
                <div className="flex items-center justify-end gap-1">
                    <Link href={route('customers.show', row.original.id)} className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'h-8 w-8 text-slate-400 hover:text-slate-900 hover:bg-slate-100')}>
                        <Eye className="h-4 w-4" />
                    </Link>
                    <Link href={route('customers.edit', row.original.id)} className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'h-8 w-8 text-slate-400 hover:text-slate-900 hover:bg-slate-100')}>
                        <Edit className="h-4 w-4" />
                    </Link>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-red-600 hover:bg-red-50" onClick={() => setDeleting(row.original)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <AppLayout
            title="Customers"
            actions={
                <Link href={route('customers.create')} className={cn(buttonVariants({ variant: 'default' }), 'bg-slate-900 text-white hover:bg-slate-800 h-9 px-3 rounded-lg text-xs font-bold border-none shadow-none')}>
                    <Plus className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline ml-2">New Customer</span>
                </Link>
            }
        >
            <Head title="Customers" />

            <div className="space-y-4">
                <div className="flex flex-col gap-2 bg-white border border-slate-200 p-2 rounded-xl">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            placeholder="Search customers..."
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-100 rounded-lg text-sm focus:bg-white transition-all placeholder:text-slate-400 outline-none"
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Mobile card list */}
                <div className="sm:hidden space-y-2">
                    {filtered.length === 0 && (
                        <p className="text-sm text-slate-400 text-center py-8">No customers found.</p>
                    )}
                    {filtered.map(c => (
                        <div key={c.id} className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-xs font-bold shrink-0">
                                        {c.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-semibold text-slate-900 text-sm truncate">{c.name}</p>
                                        <p className="text-xs text-slate-400">{c.phone ?? '—'}</p>
                                    </div>
                                </div>
                                {c.loyalty_tier && (
                                    <Badge className={cn('text-[10px] font-bold tracking-wider rounded-md px-2 py-0.5 shadow-none border capitalize shrink-0', tierStyle[c.loyalty_tier] ?? 'bg-slate-50 text-slate-500 border-slate-100')}>
                                        {c.loyalty_tier}
                                    </Badge>
                                )}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                <Star className="h-3 w-3" />
                                <span>{c.visit_count ?? 0} visits</span>
                            </div>
                            <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                                <Link href={route('customers.show', c.id)} className={cn(buttonVariants({ variant: 'outline' }), 'flex-1 h-9 text-xs font-bold border-slate-200 shadow-none')}>
                                    <Eye className="h-3.5 w-3.5 mr-1" /> View
                                </Link>
                                <Link href={route('customers.edit', c.id)} className={cn(buttonVariants({ variant: 'outline' }), 'flex-1 h-9 text-xs font-bold border-slate-200 shadow-none')}>
                                    <Edit className="h-3.5 w-3.5 mr-1" /> Edit
                                </Link>
                                <button onClick={() => setDeleting(c)} className="h-9 w-9 flex items-center justify-center text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg border border-slate-200">
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Desktop table */}
                <div className="hidden sm:block bg-white border border-slate-200 rounded-xl overflow-hidden">
                    <DataTable columns={columns} data={filtered} showSearch={false} />
                </div>
            </div>

            {deleting && (
                <DeleteModal customer={deleting} open={!!deleting} onOpenChange={v => !v && setDeleting(null)} />
            )}
        </AppLayout>
    );
}
