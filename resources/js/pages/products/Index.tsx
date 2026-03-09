import { Head, Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Edit, Plus, Trash2, Search, Package } from 'lucide-react';
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

interface Product {
    id: number;
    name: string;
    category?: string;
    price: number;
    stock_qty: number;
    low_stock_threshold: number;
    is_active: boolean;
}

function capitalizeWords(str: string) {
    if (!str) return '';
    return str
        .replace(/_/g, ' ')
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

function DeleteModal({
    product,
    open,
    onOpenChange,
}: {
    product: Product;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const { t } = useTranslation();
    const [processing, setProcessing] = useState(false);

    function handleDelete() {
        setProcessing(true);
        router.delete(route('products.destroy', product.id), {
            onSuccess: () => onOpenChange(false),
            onFinish: () => setProcessing(false),
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-sm border-slate-200 shadow-none">
                <DialogHeader>
                    <DialogTitle>Delete Product</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete{' '}
                        <span className="font-medium text-gray-900">{product.name}</span>? This
                        action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="border-slate-200 shadow-none"
                    >
                        {t('cancel')}
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={processing}
                        className="shadow-none"
                    >
                        {t('delete')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function Index({ products }: { products: Product[] }) {
    const { t } = useTranslation();
    const [statusFilter, setStatusFilter] = useState('all');
    const [globalSearch, setGlobalSearch] = useState('');
    const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

    const filtered = products.filter((p) => {
        const matchesStatus =
            statusFilter === 'all' ||
            (statusFilter === 'active' ? p.is_active : !p.is_active);

        const search = globalSearch.toLowerCase();
        const matchesSearch =
            !search ||
            [p.name, p.category].some((val) => val?.toLowerCase().includes(search));

        return matchesStatus && matchesSearch;
    });

    const columns: ColumnDef<Product>[] = [
        {
            accessorKey: 'name',
            header: () => (
                <span className="text-[10px] font-bold tracking-wider text-slate-400">
                    {t('prod.title').toUpperCase()}
                </span>
            ),
            cell: ({ row }) => (
                <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                        <Package className="h-4 w-4 text-slate-400" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-900">
                            {row.original.name}
                        </span>
                        <span className="text-[11px] text-slate-500 uppercase tracking-tight">
                            {row.original.category || 'Uncategorized'}
                        </span>
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'price',
            header: () => (
                <span className="text-[10px] font-bold tracking-wider text-slate-400">{t('price').toUpperCase()}</span>
            ),
            cell: ({ row }) => (
                <span className="text-sm font-medium text-slate-900">
                    {formatCents(row.original.price)}
                </span>
            ),
        },
        {
            accessorKey: 'stock_qty',
            header: () => (
                <span className="text-[10px] font-bold tracking-wider text-slate-400">{t('prod.stock').toUpperCase()}</span>
            ),
            cell: ({ row }) => {
                const { stock_qty, low_stock_threshold } = row.original;
                const isLow = stock_qty <= low_stock_threshold;
                return (
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-700">{stock_qty}</span>
                        {isLow && (
                            <Badge
                                className={cn(
                                    'text-[10px] font-bold tracking-wider rounded-md px-2 py-0.5 shadow-none border',
                                    'bg-amber-50 text-amber-700 border-amber-200',
                                )}
                            >
                                {t('prod.lowStock').toUpperCase()}
                            </Badge>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: 'is_active',
            header: () => (
                <span className="text-[10px] font-bold tracking-wider text-slate-400">{t('status').toUpperCase()}</span>
            ),
            cell: ({ row }) => (
                <Badge
                    className={cn(
                        'text-[10px] font-bold tracking-wider rounded-md px-2 py-0.5 shadow-none border',
                        row.original.is_active
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            : 'bg-slate-50 text-red-600 border-red-100',
                    )}
                >
                    {row.original.is_active ? t('active').toUpperCase() : t('inactive').toUpperCase()}
                </Badge>
            ),
        },
        {
            id: 'actions',
            header: () => (
                <div className="text-right px-2 text-[10px] font-bold tracking-wider text-slate-400">
                    {t('actions').toUpperCase()}
                </div>
            ),
            cell: ({ row }) => {
                const product = row.original;
                return (
                    <div className="flex items-center justify-end gap-1">
                        <Link
                            href={route('products.edit', product.id)}
                            className={cn(
                                buttonVariants({ variant: 'ghost', size: 'icon' }),
                                'h-8 w-8 text-slate-400 hover:text-slate-900 hover:bg-slate-100',
                            )}
                        >
                            <Edit className="h-4 w-4" />
                        </Link>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-300 hover:text-red-600 hover:bg-red-50"
                            onClick={() => setDeletingProduct(product)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                );
            },
        },
    ];

    return (
        <AppLayout
            title={t('prod.title')}
            actions={
                <Link
                    href={route('products.create')}
                    className={cn(
                        buttonVariants({ variant: 'default' }),
                        'bg-slate-900 text-white hover:bg-slate-800 h-9 px-3 rounded-lg text-xs font-bold border-none shadow-none',
                    )}
                >
                    <Plus className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline ml-2">{t('prod.new')}</span>
                </Link>
            }
        >
            <Head title={t('prod.title')} />

            <div className="space-y-4">
                {/* Search & Filter Bar */}
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
                        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? 'all')}>
                            <SelectTrigger className="h-9 flex-1 bg-white border-slate-200 rounded-lg text-xs font-semibold shadow-none focus:ring-0">
                                <SelectValue>
                                    {statusFilter === 'all' ? t('all') : capitalizeWords(statusFilter)}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-200 shadow-none">
                                <SelectItem value="all">{t('all')}</SelectItem>
                                <SelectItem value="active">{t('active')}</SelectItem>
                                <SelectItem value="inactive">{t('inactive')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                    <DataTable columns={columns} data={filtered} showSearch={false} />
                </div>
            </div>

            {deletingProduct && (
                <DeleteModal
                    product={deletingProduct}
                    open={!!deletingProduct}
                    onOpenChange={(open) => !open && setDeletingProduct(null)}
                />
            )}
        </AppLayout>
    );
}
