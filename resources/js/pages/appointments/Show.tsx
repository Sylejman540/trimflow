import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import AppLayout from '@/layouts/AppLayout';
import { buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { formatCents } from '@/lib/utils';
import { Appointment, AppointmentStatus } from '@/types';

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
        <div className="flex justify-between py-2">
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className="text-sm font-medium">{value}</span>
        </div>
    );
}

export default function Show({ appointment }: { appointment: Appointment }) {
    return (
        <AppLayout
            title={`Appointment #${appointment.id}`}
            actions={
                <div className="flex gap-2">
                    <Link href={route('appointments.index')} className={buttonVariants({ variant: "outline" })}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Link>
                    <Link href={route('appointments.edit', appointment.id)} className={buttonVariants({ variant: "default" })}>
                        Edit
                    </Link>
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
            </Tabs>
        </AppLayout>
    );
}
