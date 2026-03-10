import { Head, Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Edit, Plus, Trash2, Search, Package, AlertTriangle } from 'lucide-react';
import AppLayout from '@/layouts/AppLayout';
import { DataTable } from '@/components/data-table';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { formatCents, cn } from '@/lib/utils';

interface Product {
    id: number; name: string; category?: string;
    price: number; stock_qty: number; low_stock_threshold: number; is_active: boolean;
}

function DeleteModal({ product, open, onOpenChange }: {
    product: Product; open: boolean; onOpenChange: (open: boolean) => void;
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
                    <DialogTitle>{t('delete')} {t('prod.title')}</DialogTitle>
                    <DialogDescription>
                        {t('prod.deleteConfirm')}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="border-slate-200 shadow-none">{t('cancel')}</Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={processing} className="shadow-none">{t('delete')}</Button>
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
        const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' ? p.is_active : !p.is_active);
        const search = globalSearch.toLowerCase();
        const matchesSearch = !search || [p.name, p.category].some(v => v?.toLowerCase().includes(search));
        return matchesStatus && matchesSearch;
    });

    const columns: ColumnDef<Product>[] = [
        {
            accessorKey: 'name',
            header: () => <span className="text-[10px] font-bold tracking-wider text-slate-400">{t('prod.title').toUpperCase()}</span>,
            cell: ({ row }) => (
                <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                        <Package className="h-4 w-4 text-slate-400" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{row.original.name}</p>
                        <p className="text-[11px] text-slate-500 uppercase tracking-tight">{row.original.category || t('prod.uncategorized')}</p>
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'price',
            header: () => <span className="text-[10px] font-bold tracking-wider text-slate-400">{t('price').toUpperCase()}</span>,
            cell: ({ row }) => <span className="text-sm font-medium text-slate-900">{formatCents(row.original.price)}</span>,
        },
        {
            accessorKey: 'stock_qty',
            header: () => <span className="text-[10px] font-bold tracking-wider text-slate-400">{t('prod.stock').toUpperCase()}</span>,
            cell: ({ row }) => {
                const { stock_qty, low_stock_threshold } = row.original;
                const isLow = stock_qty <= low_stock_threshold;
                return (
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-700">{stock_qty}</span>
                        {isLow && (
                            <Badge className="text-[10px] font-bold tracking-wider rounded-md px-2 py-0.5 shadow-none border bg-amber-50 text-amber-700 border-amber-200">
                                {t('prod.lowStock').toUpperCase()}
                            </Badge>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: 'is_active',
            header: () => <span className="text-[10px] font-bold tracking-wider text-slate-400">{t('status').toUpperCase()}</span>,
            cell: ({ row }) => (
                <Badge className={cn("text-[10px] font-bold tracking-wider rounded-md px-2 py-0.5 shadow-none border",
                    row.original.is_active ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-slate-50 text-red-600 border-red-100")}>
                    {row.original.is_active ? t('active').toUpperCase() : t('inactive').toUpperCase()}
                </Badge>
            ),
        },
        {
            id: 'actions',
            header: () => <div className="text-right px-2 text-[10px] font-bold tracking-wider text-slate-400">{t('actions').toUpperCase()}</div>,
            cell: ({ row }) => {
                const product = row.original;
                return (
                    <div className="flex items-center justify-end gap-1">
                        <Link href={route('products.edit', product.id)} className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), "h-8 w-8 text-slate-400 hover:text-slate-900 hover:bg-slate-100")}>
                            <Edit className="h-4 w-4" />
                        </Link>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-red-600 hover:bg-red-50" onClick={() => setDeletingProduct(product)}>
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
                <Link href={route('products.create')} className={cn(buttonVariants({ variant: 'default' }), 'bg-slate-900 text-white hover:bg-slate-800 h-9 px-3 rounded-lg text-xs font-bold border-none shadow-none')}>
                    <Plus className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline ml-2">{t('prod.new')}</span>
                </Link>
            }
        >
            <Head title={t('prod.title')} />

            <div className="space-y-4">
                {/* Search & Filter */}
                <div className="flex flex-col gap-2 bg-white border border-slate-200 p-2 rounded-xl">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input type="text" value={globalSearch} placeholder={t('search')}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-100 rounded-lg text-sm focus:bg-white transition-all placeholder:text-slate-400 outline-none"
                            onChange={e => setGlobalSearch(e.target.value)} />
                    </div>
                    <Select value={statusFilter} onValueChange={v => setStatusFilter(v ?? 'all')}>
                        <SelectTrigger className="h-9 bg-white border-slate-200 rounded-lg text-xs font-semibold shadow-none focus:ring-0">
                            <SelectValue>{statusFilter === 'all' ? t('all') : statusFilter === 'active' ? t('active') : t('inactive')}</SelectValue>
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-200 shadow-none">
                            <SelectItem value="all">{t('all')}</SelectItem>
                            <SelectItem value="active">{t('active')}</SelectItem>
                            <SelectItem value="inactive">{t('inactive')}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Mobile cards */}
                <div className="sm:hidden space-y-2">
                    {filtered.length === 0 && (
                        <p className="text-sm text-slate-400 text-center py-10">{t('prod.noProducts')}</p>
                    )}
                    {filtered.map(product => {
                        const isLow = product.stock_qty <= product.low_stock_threshold;
                        return (
                            <div key={product.id} className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                                        <Package className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-slate-900 text-sm truncate">{product.name}</p>
                                        <p className="text-xs text-slate-400 uppercase tracking-tight">{product.category || t('prod.uncategorized')}</p>
                                    </div>
                                    <Badge className={cn("text-[10px] font-bold rounded-md px-2 py-0.5 shadow-none border shrink-0",
                                        product.is_active ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-slate-50 text-red-600 border-red-100")}>
                                        {product.is_active ? t('active') : t('inactive')}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-semibold text-slate-900">{formatCents(product.price)}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-slate-500">{t('prod.stock')}: {product.stock_qty}</span>
                                        {isLow && (
                                            <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-1.5 py-0.5">
                                                <AlertTriangle className="h-3 w-3" /> {t('prod.lowStock')}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                                    <Link href={route('products.edit', product.id)} className={cn(buttonVariants({ variant: 'outline' }), 'flex-1 h-9 text-xs font-bold border-slate-200 shadow-none gap-1.5')}>
                                        <Edit className="h-3.5 w-3.5" /> {t('edit')}
                                    </Link>
                                    <button onClick={() => setDeletingProduct(product)} className="h-9 w-9 flex items-center justify-center text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg border border-slate-200">
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Desktop table */}
                <div className="hidden sm:block bg-white border border-slate-200 rounded-xl overflow-hidden">
                    <DataTable columns={columns} data={filtered} showSearch={false} />
                </div>
            </div>

            {deletingProduct && (
                <DeleteModal product={deletingProduct} open={!!deletingProduct} onOpenChange={open => !open && setDeletingProduct(null)} />
            )}
        </AppLayout>
    );
}
