import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import AppLayout from '@/layouts/AppLayout';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { Scissors, Clock, DollarSign, AlignLeft, Info, Tag } from 'lucide-react';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        category: '',
        duration: 30,
        price: 0,
        description: '',
        is_active: true,
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        // Send the request with price transformed to cents
        post(route('services.store'), {
            onBefore: () => {
                data.price = Math.round(Number(data.price) * 100);
            }
        });
    }

    return (
        <AppLayout title="Create Service">
            <Head title="Create New Service" />
            
            <div className="mx-auto max-w-2xl mt-4">
                {/* Header Section */}
                <div className="mb-8 px-2">
                    <h2 className="text-xl font-bold tracking-tight text-slate-900">New Service</h2>
                    <p className="text-sm text-slate-500 mt-1">Define a new offering for your shop, including duration and pricing.</p>
                </div>

                <form onSubmit={submit} className="space-y-8 bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
                    
                    {/* Basic Info Grid */}
                    <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <Scissors size={12} /> Service Name
                            </Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="h-10 bg-slate-50 border-slate-200 focus:bg-white rounded-lg transition-all"
                                placeholder="e.g. Classic Haircut"
                                required
                            />
                            {errors.name && <p className="text-xs text-red-500 font-medium">{errors.name}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="category" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <Tag size={12} /> Category
                            </Label>
                            <Input
                                id="category"
                                value={data.category}
                                onChange={(e) => setData('category', e.target.value)}
                                className="h-10 bg-slate-50 border-slate-200 focus:bg-white rounded-lg transition-all"
                                placeholder="e.g. Haircuts"
                            />
                            {errors.category && <p className="text-xs text-red-500 font-medium">{errors.category}</p>}
                        </div>
                    </div>

                    {/* Duration & Price Grid */}
                    <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="duration" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <Clock size={12} /> Duration (Minutes)
                            </Label>
                            <Input
                                id="duration"
                                type="number"
                                min={1}
                                value={data.duration}
                                onChange={(e) => setData('duration', parseInt(e.target.value) || 0)}
                                className="h-10 bg-slate-50 border-slate-200 focus:bg-white rounded-lg transition-all"
                                required
                            />
                            {errors.duration && <p className="text-xs text-red-500 font-medium">{errors.duration}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="price" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <DollarSign size={12} /> Price ($)
                            </Label>
                            <Input
                                id="price"
                                type="number"
                                step="0.01"
                                value={data.price}
                                onChange={(e) => setData('price', parseFloat(e.target.value) || 0)}
                                className="h-10 bg-slate-50 border-slate-200 focus:bg-white rounded-lg transition-all"
                                placeholder="0.00"
                                required
                            />
                            {errors.price && <p className="text-xs text-red-500 font-medium">{errors.price}</p>}
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <AlignLeft size={12} /> Service Description
                        </Label>
                        <Textarea
                            id="description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            className="bg-slate-50 border-slate-200 focus:bg-white rounded-lg min-h-[80px] transition-all"
                            placeholder="Provide details about what this service entails..."
                            rows={3}
                        />
                        {errors.description && <p className="text-xs text-red-500 font-medium">{errors.description}</p>}
                    </div>

                    {/* Status Toggle */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl">
                        <div className="flex items-start gap-3">
                            <div className="mt-1 bg-white p-2 rounded-lg border border-slate-200">
                                <Info size={16} className="text-slate-400" />
                            </div>
                            <div className="space-y-0.5">
                                <Label htmlFor="is_active" className="text-sm font-bold text-slate-900">Active Status</Label>
                                <p className="text-xs text-slate-500">Service will be visible for booking immediately.</p>
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
                            Create Service
                        </Button>
                        <Link 
                            href={route('services.index')} 
                            className={cn(buttonVariants({ variant: "ghost" }), "text-slate-500 hover:bg-slate-50 hover:text-slate-900 text-xs font-bold h-10 px-4")}
                        >
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}