import { Head, Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { BarChart3, TrendingUp, Users, DollarSign, Percent } from 'lucide-react';
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import AppLayout from '@/layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCents } from '@/lib/utils';
import { memo } from 'react';

interface FunnelStep {
    step: string;
    value: number;
    percentage: number;
}

interface Metrics {
    total_bookings: number;
    completion_rate: number;
    no_show_rate: number;
    cancellation_rate: number;
    total_revenue: number;
    avg_booking_value: number;
}

interface RevenuePoint {
    date: string;
    revenue: number;
}

interface Customer {
    name: string;
    value: number;
}

interface BusyTime {
    day: string;
    hour: string;
    bookings: number;
}

interface Barber {
    name: string;
    bookings: number;
    revenue: number;
    completed: number;
}

interface Service {
    service: string;
    bookings: number;
    revenue: number;
}

interface AnalyticsProps {
    funnel: FunnelStep[];
    metrics: Metrics;
    revenueTrend: RevenuePoint[];
    customerAcquisition: Customer[];
    busyTimes: BusyTime[];
    barberPerformance: Barber[];
    serviceBreakdown: Service[];
    dateRange: { start: string; end: string };
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

// Memoized KPI card to prevent unnecessary re-renders
const KpiCard = memo(({ icon: Icon, label, value, trend }: {
    icon: React.ElementType;
    label: string;
    value: string | number;
    trend?: number;
}) => (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-3">
            <Icon className="h-5 w-5 text-slate-400" />
            {trend !== undefined && (
                <span className={`text-sm font-semibold ${trend >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {trend > 0 ? '+' : ''}{trend}%
                </span>
            )}
        </div>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-xs text-slate-500 mt-1">{label}</p>
    </div>
));

export default function Analytics({
    funnel,
    metrics,
    revenueTrend,
    customerAcquisition,
    busyTimes,
    barberPerformance,
    serviceBreakdown,
    dateRange,
}: AnalyticsProps) {
    const { t } = useTranslation();

    return (
        <AppLayout>
            <Head title="Analytics" />

            <div className="space-y-6 pb-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                            <BarChart3 className="h-8 w-8 text-slate-400" />
                            Analytics
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            {dateRange.start} to {dateRange.end}
                        </p>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <KpiCard
                        icon={BarChart3}
                        label="Total Bookings"
                        value={metrics.total_bookings}
                    />
                    <KpiCard
                        icon={Percent}
                        label="Completion Rate"
                        value={`${metrics.completion_rate}%`}
                    />
                    <KpiCard
                        icon={Users}
                        label="No-Show Rate"
                        value={`${metrics.no_show_rate}%`}
                        trend={-metrics.no_show_rate}
                    />
                    <KpiCard
                        icon={DollarSign}
                        label="Total Revenue"
                        value={formatCents(metrics.total_revenue)}
                    />
                </div>

                {/* Booking Funnel */}
                <Card className="border-slate-200 shadow-none">
                    <CardHeader>
                        <CardTitle>Booking Funnel</CardTitle>
                        <CardDescription>Track bookings through each stage</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={funnel}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="step" />
                                <YAxis />
                                <Tooltip contentStyle={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }} />
                                <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                        <div className="grid grid-cols-3 gap-4 mt-6">
                            {funnel.map((step, i) => (
                                <div key={i} className="text-center">
                                    <p className="text-2xl font-bold text-slate-900">{step.value}</p>
                                    <p className="text-xs text-slate-500 mt-1">{step.step}</p>
                                    <p className="text-sm font-semibold text-slate-700 mt-2">{step.percentage}%</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Revenue Trend */}
                    <Card className="border-slate-200 shadow-none">
                        <CardHeader>
                            <CardTitle>Revenue Trend</CardTitle>
                            <CardDescription>Daily revenue over last 30 days</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={revenueTrend}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip contentStyle={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }} />
                                    <Line
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#10b981"
                                        strokeWidth={2}
                                        dot={false}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Customer Acquisition */}
                    <Card className="border-slate-200 shadow-none">
                        <CardHeader>
                            <CardTitle>Customer Acquisition</CardTitle>
                            <CardDescription>New vs returning customers</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={customerAcquisition}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, value }) => `${name}: ${value}`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {customerAcquisition.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Barber Performance */}
                <Card className="border-slate-200 shadow-none">
                    <CardHeader>
                        <CardTitle>Top Barbers</CardTitle>
                        <CardDescription>Performance by revenue and bookings</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {barberPerformance.map((barber, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                    <div>
                                        <p className="font-semibold text-slate-900">{barber.name}</p>
                                        <p className="text-sm text-slate-500 mt-1">
                                            {barber.bookings} bookings · {barber.completed} completed
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-slate-900">{formatCents(barber.revenue)}</p>
                                        <p className="text-xs text-slate-500 mt-1">Revenue</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Service Breakdown */}
                <Card className="border-slate-200 shadow-none">
                    <CardHeader>
                        <CardTitle>Service Breakdown</CardTitle>
                        <CardDescription>Most booked services by revenue</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={serviceBreakdown}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="service" />
                                <YAxis yAxisId="left" />
                                <YAxis yAxisId="right" orientation="right" />
                                <Tooltip contentStyle={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }} />
                                <Legend />
                                <Bar yAxisId="left" dataKey="bookings" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                                <Bar yAxisId="right" dataKey="revenue" fill="#10b981" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
