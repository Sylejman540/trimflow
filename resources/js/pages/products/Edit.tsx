import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import AppLayout from '@/layouts/AppLayout';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { Package, Tag, DollarSign, ArchiveRestore, AlertTriangle, Info } from 'lucide-react';
import { NumberStepper } from '@/components/ui/number-stepper';

interface Product {
    id: number;
    name: string;
    category?: string;
    price: number;
    stock_qty: number;
    low_stock_threshold: number;
    is_active: boolean;
}

export default function Edit({ product }: { product: Product }) {
    const { t } = useTranslation();
    const { data, setData, put, processing, errors } = useForm({
        name: product.name,
        category: product.category ?? '',
        price: product.price / 100, // Display as dollars
        stock_qty: product.stock_qty,
        low_stock_threshold: product.low_stock_threshold,
        is_active: product.is_active,
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        put(route('products.update', product.id), {
            onBefore: () => {
                data.price = Math.round(Number(data.price) * 100);
            },
        });
    }

    return (
        <AppLayout title={t('prod.edit')}>
            <Head title={`${t('prod.edit')} ${product.name}`} />

            <div className="mx-auto max-w-2xl">
                {/* Header Section */}
                <div className="mb-6 px-1">
                    <h2 className="text-xl font-bold tracking-tight text-slate-900">{t('prod.edit')}</h2>
                    <p className="text-sm text-slate-500 mt-1">
                        {t('prod.editDesc')}
                    </p>
                </div>

                <form
                    onSubmit={submit}
                    className="space-y-6 bg-white border border-slate-200 rounded-xl p-4 sm:p-8 shadow-sm"
                >
                    {/* Name & Category */}
                    <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label
                                htmlFor="name"
                                className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2"
                            >
                                <Package size={12} /> {t('prod.productName')}
                            </Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="h-10 bg-slate-50 border-slate-200 focus:bg-white rounded-lg transition-all"
                                placeholder={t('prod.namePlaceholder')}
                                required
                            />
                            {errors.name && (
                                <p className="text-xs text-red-500 font-medium">{errors.name}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label
                                htmlFor="category"
                                className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2"
                            >
                                <Tag size={12} /> {t('category')}
                            </Label>
                            <Input
                                id="category"
                                value={data.category}
                                onChange={(e) => setData('category', e.target.value)}
                                className="h-10 bg-slate-50 border-slate-200 focus:bg-white rounded-lg transition-all"
                                placeholder={t('prod.categoryPlaceholder')}
                            />
                            {errors.category && (
                                <p className="text-xs text-red-500 font-medium">{errors.category}</p>
                            )}
                        </div>
                    </div>

                    {/* Price */}
                    <div className="space-y-2">
                        <Label
                            htmlFor="price"
                            className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2"
                        >
                            <DollarSign size={12} /> {t('prod.priceDollar')}
                        </Label>
                        <NumberStepper
                            id="price"
                            value={data.price}
                            onChange={v => setData('price', v)}
                            min={0}
                            step={0.5}
                            decimal
                        />
                        {errors.price && (
                            <p className="text-xs text-red-500 font-medium">{errors.price}</p>
                        )}
                    </div>

                    {/* Stock Qty & Low Stock Threshold */}
                    <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label
                                htmlFor="stock_qty"
                                className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2"
                            >
                                <ArchiveRestore size={12} /> {t('prod.stockQuantity')}
                            </Label>
                            <NumberStepper
                                id="stock_qty"
                                value={data.stock_qty}
                                onChange={v => setData('stock_qty', v)}
                                min={0}
                            />
                            {errors.stock_qty && (
                                <p className="text-xs text-red-500 font-medium">{errors.stock_qty}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label
                                htmlFor="low_stock_threshold"
                                className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2"
                            >
                                <AlertTriangle size={12} /> {t('prod.lowStockAlert')}
                            </Label>
                            <NumberStepper
                                id="low_stock_threshold"
                                value={data.low_stock_threshold}
                                onChange={v => setData('low_stock_threshold', v)}
                                min={0}
                            />
                            <p className="text-[11px] text-slate-400">
                                {t('prod.lowStockHint')}
                            </p>
                            {errors.low_stock_threshold && (
                                <p className="text-xs text-red-500 font-medium">
                                    {errors.low_stock_threshold}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Active Status */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl">
                        <div className="flex items-start gap-3">
                            <div className="mt-1 bg-white p-2 rounded-lg border border-slate-200">
                                <Info size={16} className="text-slate-400" />
                            </div>
                            <div className="space-y-0.5">
                                <Label htmlFor="is_active" className="text-sm font-bold text-slate-900">
                                    {t('prod.activeStatus')}
                                </Label>
                                <p className="text-xs text-slate-500">
                                    {t('prod.activeDesc')}
                                </p>
                            </div>
                        </div>
                        <Switch
                            id="is_active"
                            checked={data.is_active}
                            onCheckedChange={(v) => setData('is_active', v)}
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                        <Button
                            type="submit"
                            disabled={processing}
                            className="bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-xs font-bold h-10 px-6 shadow-sm transition-all"
                        >
                            {t('prod.updateProduct')}
                        </Button>
                        <Link
                            href={route('products.index')}
                            className={cn(
                                buttonVariants({ variant: 'ghost' }),
                                'text-slate-500 hover:bg-slate-50 hover:text-slate-900 text-xs font-bold h-10 px-4',
                            )}
                        >
                            {t('cancel')}
                        </Link>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
