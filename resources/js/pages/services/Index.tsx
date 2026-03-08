import { Head, Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { useState } from 'react';
import { Edit, Plus, Trash2, Search, SlidersHorizontal, Clock } from 'lucide-react';
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
import { Service } from '@/types';

/**
 * Helper to capitalize the first letter of each word and remove underscores
 */
function capitalizeWords(str: string) {
    if (!str) return '';
    return str
        .replace(/_/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

function DeleteModal({
    service,
    open,
    onOpenChange,
}: {
    service: Service;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const [processing, setProcessing] = useState(false);

    function handleDelete() {
        setProcessing(true);
        router.delete(route('services.destroy', service.id), {
            onSuccess: () => onOpenChange(false),
            onFinish: () => setProcessing(false),
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-sm border-slate-200 shadow-none">
                <DialogHeader>
                    <DialogTitle>Delete Service</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete the service{' '}
                        <span className="font-medium text-gray-900">
                            {service.name}
                        </span>? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="border-slate-200 shadow-none">
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={processing} className="shadow-none">
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function Index({ services }: { services: Service[] }) {
    const [statusFilter, setStatusFilter] = useState('all');
    const [globalSearch, setGlobalSearch] = useState('');
    const [deletingService, setDeletingService] = useState<Service | null>(null);

    const filtered = services.filter((s) => {
        const matchesStatus = statusFilter === 'all' || 
            (statusFilter === 'active' ? s.is_active : !s.is_active);
        
        const search = globalSearch.toLowerCase();
        const matchesSearch = !search || [
            s.name,
            s.category,
        ].some((val) => val?.toLowerCase().includes(search));

        return matchesStatus && matchesSearch;
    });

    const columns: ColumnDef<Service>[] = [
        {
            accessorKey: 'name',
            header: () => <span className="text-[10px] font-bold tracking-wider text-slate-400">SERVICE NAME</span>,
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-slate-900">{row.original.name}</span>
                    <span className="text-[11px] text-slate-500 uppercase tracking-tight">{row.original.category || 'Uncategorized'}</span>
                </div>
            ),
        },
        {
            accessorKey: 'duration',
            header: () => <span className="text-[10px] font-bold tracking-wider text-slate-400">DURATION</span>,
            cell: ({ row }) => (
                <div className="flex items-center text-sm text-slate-600">
                    <Clock className="mr-1.5 h-3.5 w-3.5 text-slate-400" />
                    {row.original.duration} min
                </div>
            ),
        },
        {
            accessorKey: 'price',
            header: () => <span className="text-[10px] font-bold tracking-wider text-slate-400">PRICE</span>,
            cell: ({ row }) => <span className="text-sm font-medium text-slate-900">{formatCents(row.original.price)}</span>,
        },
        {
            accessorKey: 'is_active',
            header: () => <span className="text-[10px] font-bold tracking-wider text-slate-400">STATUS</span>,
            cell: ({ row }) => (
                <Badge className={cn(
                    "text-[10px] font-bold tracking-wider rounded-md px-2 py-0.5 shadow-none border",
                    row.original.is_active 
                        ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                        : "bg-slate-50 text-slate-600 border-slate-100"
                )}>
                    {row.original.is_active ? 'ACTIVE' : 'INACTIVE'}
                </Badge>
            ),
        },
        {
            id: 'actions',
            header: () => <div className="text-right px-2 text-[10px] font-bold tracking-wider text-slate-400">ACTIONS</div>,
            cell: ({ row }) => {
                const service = row.original;
                return (
                    <div className="flex items-center justify-end gap-1">
                        <Link href={route('services.edit', service.id)} className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), "h-8 w-8 text-slate-400 hover:text-slate-900 hover:bg-slate-100")}>
                            <Edit className="h-4 w-4" />
                        </Link>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-red-600 hover:bg-red-50" onClick={() => setDeletingService(service)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                );
            },
        },
    ];

    return (
        <AppLayout
            title="Services"
            actions={
                <Link href={route('services.create')} className={cn(buttonVariants({ variant: "default" }), "bg-slate-900 text-white hover:bg-slate-800 h-9 px-4 rounded-lg text-xs font-bold border-none shadow-none")}>
                    <Plus className="mr-2 h-3.5 w-3.5" />
                    Add Service
                </Link>
            }
        >
            <Head title="Services" />

            <div className="space-y-4">
                {/* IDENTICAL SEARCH & FILTER BAR */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 p-2 rounded-xl">
                    <div className="relative flex-1 max-w-2xl">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input 
                            type="text"
                            value={globalSearch}
                            placeholder="Search by name or category..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50/50 border border-slate-100 rounded-lg text-sm focus:bg-white transition-all placeholder:text-slate-400 outline-none"
                            onChange={(e) => setGlobalSearch(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="hidden lg:flex items-center gap-1.5 mr-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            <SlidersHorizontal size={12} /> Filter
                        </div>
                        
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="h-9 w-[140px] bg-white border-slate-200 rounded-lg text-xs font-semibold shadow-none focus:ring-0">
                                <SelectValue>
                                    {statusFilter === 'all' ? 'All Statuses' : capitalizeWords(statusFilter)}
                                </SelectValue>
                            </SelectTrigger>

                            <SelectContent className="rounded-xl border-slate-200 shadow-none">
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* IDENTICAL TABLE CONTAINER */}
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                    <DataTable
                        columns={columns}
                        data={filtered}
                        showSearch={false}
                    />
                </div>
            </div>

            {deletingService && (
                <DeleteModal
                    service={deletingService}
                    open={!!deletingService}
                    onOpenChange={(open) => !open && setDeletingService(null)}
                />
            )}
        </AppLayout>
    );
}