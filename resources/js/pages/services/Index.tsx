import { Head, Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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

const COLOR_HEX: Record<string, string> = {
    slate: '#64748b', red: '#ef4444', orange: '#f97316',
    amber: '#f59e0b', green: '#22c55e', teal: '#14b8a6',
    blue: '#3b82f6', violet: '#8b5cf6',
};

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
    const { t } = useTranslation();
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
                        {t('cancel')}
                    </Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={processing} className="shadow-none">
                        {t('delete')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function Index({ services }: { services: Service[] }) {
    const { t } = useTranslation();
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
            header: () => <span className="text-[10px] font-bold tracking-wider text-slate-400">{t('svc.title').toUpperCase()}</span>,
            cell: ({ row }) => {
                const color = (row.original as any).color;
                return (
                    <div className="flex items-center gap-2.5">
                        {color && COLOR_HEX[color] ? (
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COLOR_HEX[color] }} />
                        ) : (
                            <span className="w-2.5 h-2.5 rounded-full bg-slate-200 shrink-0" />
                        )}
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-slate-900">{row.original.name}</span>
                            <span className="text-[11px] text-slate-500 uppercase tracking-tight">{row.original.category || 'Uncategorized'}</span>
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: 'duration',
            header: () => <span className="text-[10px] font-bold tracking-wider text-slate-400">{t('duration').toUpperCase()}</span>,
            cell: ({ row }) => (
                <div className="flex items-center text-sm text-slate-600">
                    <Clock className="mr-1.5 h-3.5 w-3.5 text-slate-400" />
                    {row.original.duration} {t('booking.min')}
                </div>
            ),
        },
        {
            accessorKey: 'price',
            header: () => <span className="text-[10px] font-bold tracking-wider text-slate-400">{t('price').toUpperCase()}</span>,
            cell: ({ row }) => <span className="text-sm font-medium text-slate-900">{formatCents(row.original.price)}</span>,
        },
        {
            accessorKey: 'is_active',
            header: () => <span className="text-[10px] font-bold tracking-wider text-slate-400">{t('status').toUpperCase()}</span>,
            cell: ({ row }) => (
                <Badge className={cn(
                    "text-[10px] font-bold tracking-wider rounded-md px-2 py-0.5 shadow-none border",
                    row.original.is_active
                        ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                        : "bg-slate-50 text-red-600 border-red-100"
                )}>
                    {row.original.is_active ? t('active').toUpperCase() : t('inactive').toUpperCase()}
                </Badge>
            ),
        },
        {
            id: 'actions',
            header: () => <div className="text-right px-2 text-[10px] font-bold tracking-wider text-slate-400">{t('actions').toUpperCase()}</div>,
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
            title={t('svc.title')}
            actions={
                <Link href={route('services.create')} className={cn(buttonVariants({ variant: "default" }), "bg-slate-900 text-white hover:bg-slate-800 h-9 px-3 rounded-lg text-xs font-bold border-none shadow-none")}>
                    <Plus className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline ml-2">{t('svc.new')}</span>
                </Link>
            }
        >
            <Head title={t('svc.title')} />

            <div className="space-y-4">
                {/* IDENTICAL SEARCH & FILTER BAR */}
                <div className="flex flex-col gap-2 bg-white border border-slate-200 p-2 rounded-xl">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            value={globalSearch}
                            placeholder={t('search')}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50/50 border border-slate-100 rounded-lg text-sm focus:bg-white transition-all placeholder:text-slate-400 outline-none"
                            onChange={(e) => setGlobalSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Select value={statusFilter} onValueChange={v => setStatusFilter(v ?? 'all')}>
                            <SelectTrigger className="h-9 flex-1 bg-white border-slate-200 rounded-lg text-xs font-semibold shadow-none focus:ring-0">
                                <SelectValue>{statusFilter === 'all' ? t('all') : capitalizeWords(statusFilter)}</SelectValue>
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-200 shadow-none">
                                <SelectItem value="all">{t('all')}</SelectItem>
                                <SelectItem value="active">{t('active')}</SelectItem>
                                <SelectItem value="inactive">{t('inactive')}</SelectItem>
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