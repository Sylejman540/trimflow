import { Head, Link } from '@inertiajs/react';
import {
    CalendarDays,
    DollarSign,
    Scissors,
    Briefcase,
} from 'lucide-react';
import AppLayout from '@/layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCents } from '@/lib/utils';
import { Appointment, AppointmentStatus } from '@/types';

interface Stats {
    today_appointments: number;
    active_barbers?: number;
    active_services: number;
    monthly_revenue: number;
}

function statusVariant(
    status: AppointmentStatus,
): 'default' | 'secondary' | 'destructive' | 'outline' {
    const map: Record<
        AppointmentStatus,
        'default' | 'secondary' | 'destructive' | 'outline'
    > = {
        scheduled: 'outline',
        confirmed: 'default',
        in_progress: 'secondary',
        completed: 'default',
        cancelled: 'destructive',
        no_show: 'destructive',
    };
    return map[status];
}

function formatTime(dateStr: string) {
    return new Date(dateStr).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}

function StatCard({
    title,
    value,
    icon,
}: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
}) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <p className="text-2xl font-bold">{value}</p>
            </CardContent>
        </Card>
    );
}

function AppointmentRow({ appointment }: { appointment: Appointment }) {
    return (
        <Link
            href={route('appointments.show', appointment.id)}
            className="flex items-center justify-between rounded-md px-3 py-2.5 transition-colors hover:bg-muted/50"
        >
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                    {appointment.customer_name}
                </p>
                <p className="text-xs text-muted-foreground">
                    {appointment.barber?.user?.name} &middot;{' '}
                    {appointment.service?.name}
                </p>
            </div>
            <div className="flex items-center gap-3 shrink-0 ml-4">
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatTime(appointment.starts_at)}
                </span>
                <Badge variant={statusVariant(appointment.status)} className="text-xs">
                    {appointment.status.replace('_', ' ')}
                </Badge>
            </div>
        </Link>
    );
}

export default function Dashboard({
    is_barber,
    stats,
    upcoming_appointments,
    recent_appointments,
}: {
    is_barber: boolean;
    stats: Stats;
    upcoming_appointments: Appointment[];
    recent_appointments: Appointment[];
}) {
    return (
        <AppLayout title="Dashboard">
            <Head title="Dashboard" />

            <div className="space-y-6">
                {/* Stats */}
                <div className={`grid gap-4 sm:grid-cols-2 ${is_barber ? 'lg:grid-cols-3' : 'lg:grid-cols-4'}`}>
                    <StatCard
                        title="Today's Appointments"
                        value={stats.today_appointments}
                        icon={
                            <CalendarDays className="h-4 w-4 text-muted-foreground" />
                        }
                    />
                    {!is_barber && (
                        <StatCard
                            title="Active Barbers"
                            value={stats.active_barbers ?? 0}
                            icon={
                                <Briefcase className="h-4 w-4 text-muted-foreground" />
                            }
                        />
                    )}
                    <StatCard
                        title="Active Services"
                        value={stats.active_services}
                        icon={
                            <Scissors className="h-4 w-4 text-muted-foreground" />
                        }
                    />
                    <StatCard
                        title="Monthly Revenue"
                        value={formatCents(stats.monthly_revenue)}
                        icon={
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        }
                    />
                </div>

                {/* Lists */}
                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                Upcoming Appointments
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1">
                            {upcoming_appointments.length > 0 ? (
                                upcoming_appointments.map((a) => (
                                    <AppointmentRow
                                        key={a.id}
                                        appointment={a}
                                    />
                                ))
                            ) : (
                                <p className="py-4 text-center text-sm text-muted-foreground">
                                    No upcoming appointments
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                Recent Activity
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1">
                            {recent_appointments.length > 0 ? (
                                recent_appointments.map((a) => (
                                    <AppointmentRow
                                        key={a.id}
                                        appointment={a}
                                    />
                                ))
                            ) : (
                                <p className="py-4 text-center text-sm text-muted-foreground">
                                    No recent appointments
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
