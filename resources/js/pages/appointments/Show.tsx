import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Package, Trash2, Plus } from 'lucide-react';
import { useState } from 'react';
import AppLayout from '@/layouts/AppLayout';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { formatCents } from '@/lib/utils';
import { Appointment, AppointmentStatus } from '@/types';

interface ProductItem {
    id: number;
    name: string;
    price: number;
    stock_qty: number;
    pivot?: { qty: number; unit_price: number };
}

function statusVariant(status: AppointmentStatus) {
    const map: Record<AppointmentStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
        scheduled: 'outline',
        confirmed: 'default',
        in_progress: 'secondary',
        completed: 'default',
        cancelled: 'destructive',
        no_show: 'destructive',
    };
    return map[status];
}

function formatDateTime(dateStr: string) {
    return new Date(dateStr).toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex items-start justify-between gap-4 py-2">
            <span className="text-sm text-muted-foreground shrink-0">{label}</span>
            <span className="text-sm font-medium text-right">{value}</span>
        </div>
    );
}

export default function Show({
    appointment,
    can_edit,
    all_products,
}: {
    appointment: Appointment;
    can_edit: boolean;
    all_products: ProductItem[];
}) {
    const [addingProduct, setAddingProduct] = useState(false);
    const { data, setData, post, processing, reset } = useForm({ product_id: '', qty: 1 });

    function submitProduct(e: React.FormEvent) {
        e.preventDefault();
        post(route('appointment-products.store', appointment.id), {
            onSuccess: () => { reset(); setAddingProduct(false); },
        });
    }

    function removeProduct(productId: number) {
        router.delete(route('appointment-products.destroy', [appointment.id, productId]));
    }

    const attachedProducts: ProductItem[] = (appointment as any).products ?? [];

    return (
        <AppLayout
            title={`Appointment #${appointment.id}`}
            actions={
                <div className="flex gap-2">
                    <Link href={route('appointments.index')} className={buttonVariants({ variant: "outline", size: "sm" })}>
                        <ArrowLeft className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Back</span>
                    </Link>
                    {can_edit && (
                        <Link href={route('appointments.edit', appointment.id)} className={buttonVariants({ variant: "default", size: "sm" })}>
                            Edit
                        </Link>
                    )}
                </div>
            }
        >
            <Head title={`Appointment #${appointment.id}`} />

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="customer">Customer</TabsTrigger>
                    <TabsTrigger value="service">Service</TabsTrigger>
                    <TabsTrigger value="notes">Notes</TabsTrigger>
                    <TabsTrigger value="products">
                        <Package className="h-3.5 w-3.5 sm:mr-1.5" />
                        <span className="hidden sm:inline">Products</span>
                        {attachedProducts.length > 0 && (
                            <span className="ml-1 bg-slate-200 text-slate-700 text-[10px] font-bold px-1.5 rounded-full">{attachedProducts.length}</span>
                        )}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                Appointment Details
                                <Badge variant={statusVariant(appointment.status)}>
                                    {appointment.status.replace('_', ' ')}
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1">
                            <InfoRow
                                label="Date & Time"
                                value={formatDateTime(appointment.starts_at)}
                            />
                            <Separator />
                            <InfoRow
                                label="End Time"
                                value={formatDateTime(appointment.ends_at)}
                            />
                            <Separator />
                            <InfoRow
                                label="Barber"
                                value={appointment.barber?.user?.name ?? '-'}
                            />
                            <Separator />
                            <InfoRow
                                label="Customer"
                                value={appointment.customer?.name ?? '-'}
                            />
                            <Separator />
                            <InfoRow
                                label="Service"
                                value={appointment.service?.name ?? '-'}
                            />
                            <Separator />
                            <InfoRow
                                label="Price"
                                value={formatCents(appointment.price)}
                            />
                            {appointment.tip_amount > 0 && (
                                <>
                                    <Separator />
                                    <InfoRow
                                        label="Tip"
                                        value={
                                            <span className="text-emerald-600 font-semibold">
                                                +{formatCents(appointment.tip_amount)}
                                            </span>
                                        }
                                    />
                                    <Separator />
                                    <InfoRow
                                        label="Total"
                                        value={
                                            <span className="font-bold text-slate-900">
                                                {formatCents(appointment.price + appointment.tip_amount)}
                                            </span>
                                        }
                                    />
                                </>
                            )}
                            {appointment.payment && (
                                <>
                                    <Separator />
                                    <InfoRow
                                        label="Payment"
                                        value={
                                            <Badge variant={appointment.payment.status === 'paid' ? 'default' : 'secondary'}>
                                                {appointment.payment.status} ({appointment.payment.method})
                                            </Badge>
                                        }
                                    />
                                </>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="customer">
                    <Card>
                        <CardHeader>
                            <CardTitle>Customer Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1">
                            <InfoRow
                                label="Name"
                                value={appointment.customer?.name ?? '-'}
                            />
                            <Separator />
                            <InfoRow
                                label="Email"
                                value={appointment.customer?.email ?? '-'}
                            />
                            <Separator />
                            <InfoRow
                                label="Phone"
                                value={appointment.customer?.phone ?? '-'}
                            />
                        </CardContent>
                    </Card>

                    {appointment.review && (
                        <Card className="mt-4">
                            <CardHeader>
                                <CardTitle>Review</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-1">
                                <InfoRow
                                    label="Rating"
                                    value={`${appointment.review.rating}/5`}
                                />
                                {appointment.review.comment && (
                                    <>
                                        <Separator />
                                        <div className="py-2">
                                            <p className="text-sm text-muted-foreground">Comment</p>
                                            <p className="mt-1 text-sm">{appointment.review.comment}</p>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="service">
                    <Card>
                        <CardHeader>
                            <CardTitle>Service Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1">
                            <InfoRow
                                label="Service"
                                value={appointment.service?.name ?? '-'}
                            />
                            <Separator />
                            <InfoRow
                                label="Category"
                                value={appointment.service?.category ?? '-'}
                            />
                            <Separator />
                            <InfoRow
                                label="Duration"
                                value={appointment.service ? `${appointment.service.duration} min` : '-'}
                            />
                            <Separator />
                            <InfoRow
                                label="Price"
                                value={appointment.service ? formatCents(appointment.service.price) : '-'}
                            />
                            {appointment.service?.description && (
                                <>
                                    <Separator />
                                    <div className="py-2">
                                        <p className="text-sm text-muted-foreground">Description</p>
                                        <p className="mt-1 text-sm">{appointment.service.description}</p>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="notes">
                    <Card>
                        <CardHeader>
                            <CardTitle>Notes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {appointment.notes && (
                                <div className="mb-4">
                                    <p className="text-sm font-medium text-muted-foreground">Appointment Notes</p>
                                    <p className="mt-1 text-sm">{appointment.notes}</p>
                                </div>
                            )}

                            {appointment.barber_notes && appointment.barber_notes.length > 0 ? (
                                <div className="space-y-3">
                                    <p className="text-sm font-medium text-muted-foreground">Barber Notes</p>
                                    {appointment.barber_notes.map((note) => (
                                        <div
                                            key={note.id}
                                            className="rounded-md border p-3"
                                        >
                                            <p className="text-sm">{note.notes}</p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {new Date(note.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                !appointment.notes && (
                                    <p className="text-sm text-muted-foreground">
                                        No notes for this appointment.
                                    </p>
                                )
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="products">
                    <Card>
                        <CardHeader className="flex-row items-center justify-between">
                            <CardTitle>Products Sold</CardTitle>
                            {can_edit && (
                                <Button size="sm" variant="outline" onClick={() => setAddingProduct(v => !v)} className="h-8 text-xs shadow-none">
                                    <Plus className="h-3.5 w-3.5 mr-1" /> Add
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {can_edit && addingProduct && (
                                <form onSubmit={submitProduct} className="flex items-end gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                                    <div className="flex-1 space-y-1">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Product</label>
                                        <select
                                            value={data.product_id}
                                            onChange={e => setData('product_id', e.target.value)}
                                            className="w-full h-9 bg-white border border-slate-200 rounded-lg px-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-900"
                                            required
                                        >
                                            <option value="">Select product…</option>
                                            {all_products.map(p => (
                                                <option key={p.id} value={p.id} disabled={p.stock_qty === 0}>
                                                    {p.name} ({formatCents(p.price)}) {p.stock_qty === 0 ? '— out of stock' : `— ${p.stock_qty} in stock`}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="w-20 space-y-1">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Qty</label>
                                        <input
                                            type="number" min={1} value={data.qty}
                                            onChange={e => setData('qty', parseInt(e.target.value) || 1)}
                                            className="w-full h-9 bg-white border border-slate-200 rounded-lg px-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-900"
                                        />
                                    </div>
                                    <Button type="submit" disabled={processing} size="sm" className="bg-slate-900 text-white hover:bg-slate-800 h-9 shadow-none">Add</Button>
                                </form>
                            )}

                            {attachedProducts.length === 0 && !addingProduct && (
                                <p className="text-sm text-muted-foreground py-2">No products added to this appointment.</p>
                            )}

                            {attachedProducts.map(p => (
                                <div key={p.id} className="flex items-center justify-between py-2">
                                    <div>
                                        <p className="text-sm font-medium text-slate-900">{p.name}</p>
                                        <p className="text-xs text-slate-500">
                                            {p.pivot?.qty ?? 1} × {formatCents(p.pivot?.unit_price ?? p.price)}
                                            {' = '}<span className="font-semibold">{formatCents((p.pivot?.qty ?? 1) * (p.pivot?.unit_price ?? p.price))}</span>
                                        </p>
                                    </div>
                                    {can_edit && (
                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-300 hover:text-red-600 hover:bg-red-50" onClick={() => removeProduct(p.id)}>
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    )}
                                </div>
                            ))}

                            {attachedProducts.length > 0 && (
                                <div className="border-t border-slate-100 pt-2 flex justify-between text-sm font-semibold">
                                    <span>Total</span>
                                    <span>{formatCents(attachedProducts.reduce((sum, p) => sum + (p.pivot?.qty ?? 1) * (p.pivot?.unit_price ?? p.price), 0))}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </AppLayout>
    );
}
