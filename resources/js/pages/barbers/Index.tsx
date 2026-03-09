import { Head, Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { useState } from 'react';
import { Edit, Plus, Trash2, Search, SlidersHorizontal, Mail, User, Clock } from 'lucide-react';
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
import { cn } from '@/lib/utils';
import { Barber } from '@/types';

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

function DeleteBarberModal({
    barber,
    open,
    onOpenChange,
}: {
    barber: Barber;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const [processing, setProcessing] = useState(false);

    function handleDelete() {
        setProcessing(true);
        router.delete(route('barbers.destroy', barber.id), {
            onSuccess: () => onOpenChange(false),
            onFinish: () => setProcessing(false),
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-sm border-slate-200 shadow-none">
                <DialogHeader>
                    <DialogTitle>Remove Barber</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to remove <span className="font-medium text-gray-900">{barber.user?.name}</span>? 
                        This will affect their availability and future schedule.
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

export default function Index({
    barbers,
}: {
    barbers: Barber[];
}) {
    const [statusFilter, setStatusFilter] = useState('all');
    const [globalSearch, setGlobalSearch] = useState('');
    const [deletingBarber, setDeletingBarber] = useState<Barber | null>(null);

    const filtered = barbers.filter((b) => {
        const matchesStatus = statusFilter === 'all' || 
            (statusFilter === 'active' ? b.is_active : !b.is_active);
        
        const search = globalSearch.toLowerCase();
        const matchesSearch = !search || [
            b.user?.name,
            b.user?.email,
            b.specialty,
        ].some((val) => val?.toLowerCase().includes(search));

        return matchesStatus && matchesSearch;
    });

    const columns: ColumnDef<Barber>[] = [
        {
            accessorKey: 'user.name',
            header: () => <span className="text-[10px] font-bold tracking-wider text-slate-400">BARBER NAME</span>,
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                        <User className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium text-slate-900">{row.original.user?.name}</span>
                </div>
            ),
        },
        {
            accessorKey: 'user.email',
            header: () => <span className="text-[10px] font-bold tracking-wider text-slate-400">CONTACT</span>,
            cell: ({ row }) => (
                <div className="flex items-center text-sm text-slate-600">
                    <Mail className="mr-1.5 h-3.5 w-3.5 text-slate-400" />
                    {row.original.user?.email}
                </div>
            ),
        },
        {
            accessorKey: 'specialty',
            header: () => <span className="text-[10px] font-bold tracking-wider text-slate-400">SPECIALTY</span>,
            cell: ({ row }) => (
                <span className="text-sm text-slate-600 italic">
                    {row.original.specialty || 'Generalist'}
                </span>
            ),
        },
        {
            accessorKey: 'is_active',
            header: () => <span className="text-[10px] font-bold tracking-wider text-slate-400">STATUS</span>,
            cell: ({ row }) => (
                <Badge className={cn(
                    "text-[10px] font-bold tracking-wider rounded-md px-2 py-0.5 shadow-none border",
                    row.original.is_active 
                        ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                        : "bg-slate-50 text-red-600 border-red-100"
                )}>
                    {row.original.is_active ? 'ACTIVE' : 'INACTIVE'}
                </Badge>
            ),
        },
        {
            id: 'actions',
            header: () => <div className="text-right px-2 text-[10px] font-bold tracking-wider text-slate-400">ACTIONS</div>,
            cell: ({ row }) => {
                const barber = row.original;
                return (
                    <div className="flex items-center justify-end gap-1">
                        <Link href={route('barbers.schedule', barber.id)} className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), "h-8 w-8 text-slate-400 hover:text-slate-900 hover:bg-slate-100")} title="Edit Schedule">
                            <Clock className="h-4 w-4" />
                        </Link>
                        <Link href={route('barbers.edit', barber.id)} className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), "h-8 w-8 text-slate-400 hover:text-slate-900 hover:bg-slate-100")}>
                            <Edit className="h-4 w-4" />
                        </Link>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-red-600 hover:bg-red-50" onClick={() => setDeletingBarber(barber)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                );
            },
        },
    ];

    return (
        <AppLayout
            title="Barbers"
            actions={
                <Link href={route('barbers.create')} className={cn(buttonVariants({ variant: "default" }), "bg-slate-900 text-white hover:bg-slate-800 h-9 px-4 rounded-lg text-xs font-bold border-none shadow-none")}>
                    <Plus className="mr-2 h-3.5 w-3.5" />
                    Add Barber
                </Link>
            }
        >
            <Head title="Barbers" />

            <div className="space-y-4">
                {/* Search & Filter Bar - Identical to Appointments */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 p-2 rounded-xl">
                    <div className="relative flex-1 max-w-2xl">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input 
                            type="text"
                            value={globalSearch}
                            placeholder="Search by name, email, or specialty..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50/50 border border-slate-100 rounded-lg text-sm focus:bg-white transition-all placeholder:text-slate-400 outline-none"
                            onChange={(e) => setGlobalSearch(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="hidden lg:flex items-center gap-1.5 mr-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            <SlidersHorizontal size={12} /> Filter
                        </div>
                        
                        <Select value={statusFilter} onValueChange={v => setStatusFilter(v ?? 'all')}>
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

                {/* Table Container - Identical UI */}
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                    <DataTable
                        columns={columns}
                        data={filtered}
                        showSearch={false}
                    />
                </div>
            </div>

            {deletingBarber && (
                <DeleteBarberModal
                    barber={deletingBarber}
                    open={!!deletingBarber}
                    onOpenChange={(open) => !open && setDeletingBarber(null)}
                />
            )}
        </AppLayout>
    );
}