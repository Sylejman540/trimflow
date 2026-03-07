import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import AppLayout from '@/layouts/AppLayout';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
        setData('price', Math.round(data.price * 100));
        post(route('services.store'));
    }

    return (
        <AppLayout title="Create Service">
            <Head title="Create Service" />
            <div className="mx-auto max-w-2xl">
                <Card>
                    <CardHeader>
                        <CardTitle>New Service</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    required
                                />
                                {errors.name && (
                                    <p className="text-sm text-destructive">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Input
                                    id="category"
                                    value={data.category}
                                    onChange={(e) =>
                                        setData('category', e.target.value)
                                    }
                                    placeholder="e.g. Haircut, Beard, Styling"
                                />
                                {errors.category && (
                                    <p className="text-sm text-destructive">
                                        {errors.category}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="duration">
                                        Duration (minutes)
                                    </Label>
                                    <Input
                                        id="duration"
                                        type="number"
                                        min={5}
                                        max={480}
                                        value={data.duration}
                                        onChange={(e) =>
                                            setData(
                                                'duration',
                                                parseInt(e.target.value) || 0,
                                            )
                                        }
                                        required
                                    />
                                    {errors.duration && (
                                        <p className="text-sm text-destructive">
                                            {errors.duration}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="price">Price ($)</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        min={0}
                                        step={0.01}
                                        value={data.price}
                                        onChange={(e) =>
                                            setData(
                                                'price',
                                                parseFloat(e.target.value) || 0,
                                            )
                                        }
                                        required
                                    />
                                    {errors.price && (
                                        <p className="text-sm text-destructive">
                                            {errors.price}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) =>
                                        setData('description', e.target.value)
                                    }
                                    rows={3}
                                />
                                {errors.description && (
                                    <p className="text-sm text-destructive">
                                        {errors.description}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center gap-3">
                                <Switch
                                    id="is_active"
                                    checked={data.is_active}
                                    onCheckedChange={(v) =>
                                        setData('is_active', v)
                                    }
                                />
                                <Label htmlFor="is_active">Active</Label>
                            </div>

                            <div className="flex gap-3">
                                <Button type="submit" disabled={processing}>
                                    Create Service
                                </Button>
                                <Link href={route('services.index')} className={buttonVariants({ variant: "outline" })}>
                                    Cancel
                                </Link>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
