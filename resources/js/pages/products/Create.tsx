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

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        category: '',
        price: 0,
        stock_qty: 0,
        low_stock_threshold: 5,
        is_active: true,
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        post(route('products.store'), {
            onBefore: () => {
                data.price = Math.round(Number(data.price) * 100);
            },
        });
    }

    return (
        <AppLayout title="Create Product">
            <Head title="Create New Product" />

            <div className="mx-auto max-w-2xl">
                {/* Header Section */}
                <div className="mb-6 px-1">
                    <h2 className="text-xl font-bold tracking-tight text-slate-900">New Product</h2>
                    <p className="text-sm text-slate-500 mt-1">
                        Add a retail product to your inventory for sale at appointments.
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
                                <Package size={12} /> Product Name
                            </Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="h-10 bg-slate-50 border-slate-200 focus:bg-white rounded-lg transition-all"
                                placeholder="e.g. Pomade"
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
                                <Tag size={12} /> Category
                            </Label>
                            <Input
                                id="category"
                                value={data.category}
                                onChange={(e) => setData('category', e.target.value)}
                                className="h-10 bg-slate-50 border-slate-200 focus:bg-white rounded-lg transition-all"
                                placeholder="e.g. Hair Care"
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
                            <DollarSign size={12} /> Price ($)
                        </Label>
                        <Input
                            id="price"
                            type="number"
                            step="0.01"
                            min="0"
                            value={data.price}
                            onChange={(e) => setData('price', parseFloat(e.target.value) || 0)}
                            className="h-10 bg-slate-50 border-slate-200 focus:bg-white rounded-lg transition-all"
                            placeholder="0.00"
                            required
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
                                <ArchiveRestore size={12} /> Stock Quantity
                            </Label>
                            <Input
                                id="stock_qty"
                                type="number"
                                min="0"
                                value={data.stock_qty}
                                onChange={(e) =>
                                    setData('stock_qty', parseInt(e.target.value) || 0)
                                }
                                className="h-10 bg-slate-50 border-slate-200 focus:bg-white rounded-lg transition-all"
                                required
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
                                <AlertTriangle size={12} /> Low Stock Alert
                            </Label>
                            <Input
                                id="low_stock_threshold"
                                type="number"
                                min="0"
                                value={data.low_stock_threshold}
                                onChange={(e) =>
                                    setData('low_stock_threshold', parseInt(e.target.value) || 0)
                                }
                                className="h-10 bg-slate-50 border-slate-200 focus:bg-white rounded-lg transition-all"
                                required
                            />
                            <p className="text-[11px] text-slate-400">
                                Show warning badge when stock falls to or below this number.
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
                                    Active Status
                                </Label>
                                <p className="text-xs text-slate-500">
                                    Product will be available to add to appointments.
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
                            Create Product
                        </Button>
                        <Link
                            href={route('products.index')}
                            className={cn(
                                buttonVariants({ variant: 'ghost' }),
                                'text-slate-500 hover:bg-slate-50 hover:text-slate-900 text-xs font-bold h-10 px-4',
                            )}
                        >
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
