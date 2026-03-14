import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Package, Trash2, Plus, Star } from 'lucide-react';
import { NumberStepper } from '@/components/ui/number-stepper';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import AppLayout from '@/layouts/AppLayout';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { formatCents, formatDateTime, cn } from '@/lib/utils';
import { Appointment, AppointmentStatus } from '@/types';

interface ProductItem {
    id: number;
    name: string;
    price: number;
    stock_qty: number;
    pivot?: { qty: number; unit_price: number };
}

function statusVariant(status: AppointmentStatus): string {
    const map: Record<AppointmentStatus, string> = {
        pending:     'bg-orange-50 text-orange-700 border-orange-100',
        confirmed:   'bg-emerald-50 text-emerald-700 border-emerald-100',
        in_progress: 'bg-amber-50 text-amber-700 border-amber-100',
        completed:   'bg-green-50 text-green-700 border-green-100',
        cancelled:   'bg-red-50 text-red-600 border-red-100',
        no_show:     'bg-slate-50 text-slate-600 border-slate-100',
    };
    return map[status];
}


function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex items-start justify-between gap-4 py-2.5">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider shrink-0">{label}</span>
            <span className="text-sm font-medium text-slate-900 text-right">{value}</span>
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
    const { t } = useTranslation();
    const [addingProduct, setAddingProduct] = useState(false);
    const { data, setData, post, processing, reset } = useForm({ product_id: '', qty: 1 });

    const statusKeyMap: Record<AppointmentStatus, string> = {
        pending:     'appt.pending',
        confirmed:   'appt.confirmed',
        in_progress: 'appt.inProgress',
        completed:   'appt.completed',
        cancelled:   'appt.cancelled',
        no_show:     'appt.noShow',
    };

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
            title={`${t('appt.title')} #${appointment.id}`}
            actions={
                <div className="flex gap-2">
                    <Link
                        href={route('appointments.index')}
                        className={cn(buttonVariants({ variant: 'outline' }), 'h-10 px-3 rounded-lg text-xs font-bold border-slate-200 shadow-none gap-1.5')}
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">{t('back')}</span>
                    </Link>
                    {can_edit && (
                        <Link
                            href={route('appointments.edit', appointment.id)}
                            className={cn(buttonVariants({ variant: 'default' }), 'bg-slate-900 text-white hover:bg-slate-800 h-10 px-3 rounded-lg text-xs font-bold border-none shadow-none')}
                        >
                            {t('edit')}
                        </Link>
                    )}
                </div>
            }
        >
            <Head title={`${t('appt.title')} #${appointment.id}`} />

            <Tabs defaultValue="overview" className="space-y-4">
                <div className="overflow-x-auto -mx-4 px-4 lg:mx-0 lg:px-0 no-scrollbar">
                <TabsList className="bg-white border border-slate-200 rounded-xl p-1 h-auto gap-0.5 w-max lg:w-auto">
                    <TabsTrigger value="overview" className="rounded-lg text-xs font-semibold whitespace-nowrap data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-none">
                        {t('show.overview')}
                    </TabsTrigger>
                    <TabsTrigger value="customer" className="rounded-lg text-xs font-semibold whitespace-nowrap data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-none">
                        {t('appt.customer')}
                    </TabsTrigger>
                    <TabsTrigger value="service" className="rounded-lg text-xs font-semibold whitespace-nowrap data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-none">
                        {t('appt.service')}
                    </TabsTrigger>
                    <TabsTrigger value="notes" className="rounded-lg text-xs font-semibold whitespace-nowrap data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-none">
                        {t('notes')}
                    </TabsTrigger>
                    <TabsTrigger value="products" className="rounded-lg text-xs font-semibold whitespace-nowrap data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-none gap-1.5">
                        <Package className="h-3.5 w-3.5" />
                        {t('show.products')}
                        {attachedProducts.length > 0 && (
                            <span className="bg-slate-200 text-slate-700 text-[10px] font-bold px-1.5 rounded-full">{attachedProducts.length}</span>
                        )}
                    </TabsTrigger>
                </TabsList>
                </div>

                <TabsContent value="overview">
                    {can_edit && appointment.status === 'pending' && (
                        <div className="mb-4 flex items-center justify-between gap-4 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3">
                            <div>
                                <p className="text-sm font-semibold text-orange-800">{t('show.newBookingRequest')}</p>
                                <p className="text-xs text-orange-600 mt-0.5">{t('show.newBookingRequestSub')}</p>
                            </div>
                            <button
                                onClick={() => router.patch(route('appointments.confirm', appointment.id))}
                                className="shrink-0 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-4 py-2 transition-colors"
                            >
                                {t('confirm')}
                            </button>
                        </div>
                    )}
                    <Card className="border-slate-200 shadow-none">
                        <CardHeader className="px-4 lg:px-6 pb-0 pt-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base">{t('appt.title')} #{appointment.id}</CardTitle>
                                <Badge className={cn('text-[10px] font-bold tracking-wider rounded-md px-2 py-0.5 shadow-none border', statusVariant(appointment.status))}>
                                    {t(statusKeyMap[appointment.status])}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="px-4 lg:px-6 divide-y divide-slate-100">
                            <InfoRow label={t('appt.startsAt')} value={formatDateTime(appointment.starts_at)} />
                            <InfoRow label={t('appt.endsAt')} value={formatDateTime(appointment.ends_at)} />
                            <InfoRow label={t('appt.barber')} value={appointment.barber?.user?.name ?? '-'} />
                            <InfoRow label={t('appt.customer')} value={appointment.customer?.name ?? '-'} />
                            <InfoRow label={t('appt.service')} value={appointment.service?.name ?? '-'} />
                            <InfoRow label={t('price')} value={formatCents(appointment.price)} />
                            {appointment.tip_amount > 0 && (
                                <>
                                    <InfoRow label={t('show.tip')} value={<span className="text-emerald-600 font-semibold">+{formatCents(appointment.tip_amount)}</span>} />
                                    <InfoRow label={t('total')} value={<span className="font-bold text-slate-900">{formatCents(appointment.price + appointment.tip_amount)}</span>} />
                                </>
                            )}
                            {appointment.payment && (
                                <InfoRow
                                    label={t('show.payment')}
                                    value={
                                        <Badge className={cn('text-[10px] font-bold tracking-wider rounded-md px-2 py-0.5 shadow-none border', appointment.payment.status === 'paid' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-slate-50 text-slate-600 border-slate-100')}>
                                            {appointment.payment.status} · {appointment.payment.method}
                                        </Badge>
                                    }
                                />
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="customer">
                    <Card className="border-slate-200 shadow-none">
                        <CardHeader className="px-4 lg:px-6 pb-0 pt-4">
                            <CardTitle className="text-base">{t('show.customerInfo')}</CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 lg:px-6 divide-y divide-slate-100">
                            <InfoRow label={t('name')} value={appointment.customer?.name ?? '-'} />
                            <InfoRow label={t('email')} value={appointment.customer?.email ?? '-'} />
                            <InfoRow label={t('phone')} value={appointment.customer?.phone ?? '-'} />
                        </CardContent>
                    </Card>

                    {appointment.review && (
                        <Card className="mt-4 border-slate-200 shadow-none">
                            <CardHeader className="px-4 lg:px-6 pb-0 pt-4">
                                <div className="flex items-center gap-2">
                                    <CardTitle className="text-base">{t('show.review')}</CardTitle>
                                    <div className="flex items-center gap-0.5">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <Star key={i} className={cn('h-3.5 w-3.5', i < appointment.review!.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200')} />
                                        ))}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="px-4 lg:px-6 divide-y divide-slate-100">
                                <InfoRow label={t('show.rating')} value={`${appointment.review.rating}/5`} />
                                {appointment.review.comment && (
                                    <div className="py-2.5">
                                        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">{t('show.comment')}</p>
                                        <p className="text-sm text-slate-700">{appointment.review.comment}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="service">
                    <Card className="border-slate-200 shadow-none">
                        <CardHeader className="px-4 lg:px-6 pb-0 pt-4">
                            <CardTitle className="text-base">{t('show.serviceDetails')}</CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 lg:px-6 space-y-0 divide-y divide-slate-100">
                            {/* Multi-service: show all pivot services if present, else fall back to primary */}
                            {(appointment as any).services?.length > 0
                                ? (appointment as any).services.map((s: any, i: number) => (
                                    <div key={s.id} className="py-3 flex items-center justify-between gap-4">
                                        <div>
                                            <p className="text-sm font-medium text-slate-900">{s.name}</p>
                                            {s.category && <p className="text-xs text-slate-400">{s.category}</p>}
                                            {s.description && <p className="text-xs text-slate-500 mt-0.5">{s.description}</p>}
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-sm font-semibold text-slate-900">{formatCents(s.pivot?.price ?? s.price)}</p>
                                            <p className="text-xs text-slate-400">{s.pivot?.duration ?? s.duration} {t('show.min')}</p>
                                        </div>
                                    </div>
                                ))
                                : (
                                    <>
                                        <InfoRow label={t('appt.service')} value={appointment.service?.name ?? '-'} />
                                        <InfoRow label={t('category')} value={appointment.service?.category ?? '-'} />
                                        <InfoRow label={t('duration')} value={appointment.service ? `${appointment.service.duration} ${t('show.min')}` : '-'} />
                                        <InfoRow label={t('price')} value={appointment.service ? formatCents(appointment.service.price) : '-'} />
                                        {appointment.service?.description && (
                                            <div className="py-2.5">
                                                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">{t('description')}</p>
                                                <p className="text-sm text-slate-700">{appointment.service.description}</p>
                                            </div>
                                        )}
                                    </>
                                )
                            }
                            {/* Total row when multiple services */}
                            {(appointment as any).services?.length > 1 && (
                                <div className="pt-2 flex justify-between text-sm font-bold text-slate-900 border-t border-slate-200">
                                    <span>Total</span>
                                    <span>{formatCents(appointment.price)}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="notes">
                    <Card className="border-slate-200 shadow-none">
                        <CardHeader className="px-4 lg:px-6 pb-0 pt-4">
                            <CardTitle className="text-base">{t('notes')}</CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 lg:px-6 space-y-4">
                            {appointment.notes ? (
                                <div>
                                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">{t('show.appointmentNotes')}</p>
                                    <p className="text-sm text-slate-700">{appointment.notes}</p>
                                </div>
                            ) : null}

                            {appointment.barber_notes && appointment.barber_notes.length > 0 ? (
                                <div className="space-y-2">
                                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{t('show.barberNotes')}</p>
                                    {appointment.barber_notes.map((note) => (
                                        <div key={note.id} className="rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2.5">
                                            <p className="text-sm text-slate-700">{note.notes}</p>
                                            <p className="mt-1 text-xs text-slate-400">{new Date(note.created_at).toLocaleDateString()}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : null}

                            {!appointment.notes && (!appointment.barber_notes || appointment.barber_notes.length === 0) && (
                                <p className="text-sm text-muted-foreground py-2">{t('show.noNotes')}</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="products">
                    <Card className="border-slate-200 shadow-none">
                        <CardHeader className="px-4 lg:px-6 pb-0 pt-4 flex-row items-center justify-between">
                            <CardTitle className="text-base">{t('show.productsSold')}</CardTitle>
                            {can_edit && (
                                <Button size="sm" variant="outline" onClick={() => setAddingProduct(v => !v)} className="h-8 text-xs shadow-none border-slate-200">
                                    <Plus className="h-3.5 w-3.5 mr-1" /> {t('show.add')}
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent className="px-4 lg:px-6 space-y-3 pt-4">
                            {can_edit && addingProduct && (
                                <form onSubmit={submitProduct} className="space-y-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t('show.product')}</label>
                                        <select
                                            value={data.product_id}
                                            onChange={e => setData('product_id', e.target.value)}
                                            className="w-full h-11 bg-white border border-slate-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-1 focus:ring-slate-900"
                                            required
                                        >
                                            <option value="">{t('show.selectProduct')}</option>
                                            {all_products.map(p => (
                                                <option key={p.id} value={p.id} disabled={p.stock_qty === 0}>
                                                    {p.name} ({formatCents(p.price)}) {p.stock_qty === 0 ? t('show.outOfStock') : `— ${p.stock_qty} ${t('show.inStock')}`}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex items-end gap-3">
                                        <div className="w-32 space-y-1">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t('show.qty')}</label>
                                            <NumberStepper
                                                value={data.qty}
                                                onChange={v => setData('qty', v)}
                                                min={1}
                                                className="h-11"
                                            />
                                        </div>
                                        <Button type="submit" disabled={processing} className="flex-1 bg-slate-900 text-white hover:bg-slate-800 h-11 shadow-none">{t('show.addProduct')}</Button>
                                    </div>
                                </form>
                            )}

                            {attachedProducts.length === 0 && !addingProduct && (
                                <p className="text-sm text-muted-foreground py-2">{t('show.noProducts')}</p>
                            )}

                            {attachedProducts.map(p => (
                                <div key={p.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
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
                                <div className="pt-2 flex justify-between text-sm font-semibold text-slate-900">
                                    <span>{t('total')}</span>
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
