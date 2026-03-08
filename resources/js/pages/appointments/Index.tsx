import { Head, Link, router, useForm } from '@inertiajs/react';
import { ColumnDef, FilterFn } from '@tanstack/react-table';
import { FormEvent, useState } from 'react';
import { Edit, Eye, MoreHorizontal, Plus, Trash2, AlertCircle, Clock, Calendar as CalendarIcon, User, Scissors } from 'lucide-react';
import AppLayout from '@/layouts/AppLayout';
import { DataTable } from '@/components/data-table';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { formatCents, formatDuration, cn } from '@/lib/utils';
import { Appointment, AppointmentStatus, Barber, Service } from '@/types';

const allStatuses: AppointmentStatus[] = [
    'scheduled',
    'confirmed',
    'in_progress',
    'completed',
    'cancelled',
    'no_show',
];

// Premium SaaS Status Styling
const statusStyles: Record<AppointmentStatus, { bg: string, text: string, ring: string }> = {
    scheduled:   { bg: 'bg-slate-50', text: 'text-slate-600', ring: 'ring-slate-500/10' },
    confirmed:   { bg: 'bg-blue-50', text: 'text-blue-700', ring: 'ring-blue-700/10' },
    in_progress: { bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-600/20' },
    completed:   { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-600/20' },
    cancelled:   { bg: 'bg-red-50', text: 'text-red-700', ring: 'ring-red-600/10' },
    no_show:     { bg: 'bg-rose-50', text: 'text-rose-700', ring: 'ring-rose-600/10' },
};

function formatDateOnly(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTimeOnly(dateStr: string) {
    return new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function getInitials(name?: string) {
    if (!name) return '-';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

const searchFilter: FilterFn<Appointment> = (row, _columnId, filterValue) => {
    const search = (filterValue as string).toLowerCase();
    const a = row.original;
    return [
        a.customer?.name,
        a.barber?.user?.name,
        a.service?.name,
    ].some((val) => val?.toLowerCase().includes(search));
};

function isToday(dateStr: string) {
    const d = new Date(dateStr);
    const now = new Date();
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

function isTomorrow(dateStr: string) {
    const d = new Date(dateStr);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return d.getFullYear() === tomorrow.getFullYear() && d.getMonth() === tomorrow.getMonth() && d.getDate() === tomorrow.getDate();
}

function EditModal({
    appointment,
    barbers,
    services,
    open,
    onOpenChange,
}: {
    appointment: Appointment;
    barbers: Barber[];
    services: Service[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const { data, setData, put, processing, errors } = useForm({
        barber_id: String(appointment.barber_id),
        customer_name: appointment.customer?.name ?? '',
        customer_phone: appointment.customer?.phone ?? '',
        service_id: String(appointment.service_id),
        starts_at: appointment.starts_at.slice(0, 16),
        status: appointment.status,
        notes: appointment.notes ?? '',
    });

    const selectedService = services.find((s) => s.id === Number(data.service_id));

    function submit(e: FormEvent) {
        e.preventDefault();
        put(route('appointments.update', appointment.id), {
            onSuccess: () => onOpenChange(false),
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl p-0 overflow-hidden bg-white border-slate-200 shadow-2xl rounded-2xl">
                <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
                    <DialogTitle className="text-lg font-semibold text-slate-900">Edit Appointment</DialogTitle>
                    <DialogDescription className="text-sm text-slate-500 mt-1">
                        Make changes to {appointment.customer?.name ?? 'this customer'}'s booking.
                    </DialogDescription>
                </div>

                <form onSubmit={submit}>
                    <div className="px-6 py-6 space-y-6">
                        {/* Status Area */}
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                            <div>
                                <Label className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-1 block">Current Status</Label>
                                <Select value={data.status} onValueChange={(v) => v && setData('status', v as AppointmentStatus)}>
                                    <SelectTrigger className="w-[180px] h-9 bg-white border-slate-200">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {allStatuses.map((s) => (
                                            <SelectItem key={s} value={s} className="capitalize">{s.replace('_', ' ')}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="text-right">
                                <Label className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-1 block">Date & Time</Label>
                                <Input
                                    type="datetime-local"
                                    value={data.starts_at}
                                    onChange={(e) => setData('starts_at', e.target.value)}
                                    className="h-9 bg-white border-slate-200 min-w-[200px]"
                                    required
                                />
                            </div>
                        </div>

                        {/* Customer Info */}
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label className="text-slate-700">Customer Name</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                    <Input
                                        value={data.customer_name}
                                        onChange={(e) => setData('customer_name', e.target.value)}
                                        className="h-10 pl-9 border-slate-200"
                                        required
                                    />
                                </div>
                                {errors.customer_name && <p className="text-xs text-red-500">{errors.customer_name}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-700">Phone Number</Label>
                                <Input
                                    value={data.customer_phone}
                                    onChange={(e) => setData('customer_phone', e.target.value)}
                                    className="h-10 border-slate-200"
                                    placeholder="+1 (555) 000-0000"
                                />
                                {errors.customer_phone && <p className="text-xs text-red-500">{errors.customer_phone}</p>}
                            </div>
                        </div>

                        {/* Service & Barber */}
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label className="text-slate-700">Assigned Barber</Label>
                                <Select value={data.barber_id} onValueChange={(v) => setData('barber_id', v ?? '')}>
                                    <SelectTrigger className="h-10 border-slate-200">
                                        <SelectValue placeholder="Select barber" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {barbers.map((b) => (
                                            <SelectItem key={b.id} value={String(b.id)}>
                                                {b.user?.name ?? ''}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.barber_id && <p className="text-xs text-red-500">{errors.barber_id}</p>}
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label className="text-slate-700">Service</Label>
                                    {selectedService && (
                                        <span className="text-[10px] font-semibold tracking-wider uppercase text-slate-400">
                                            {formatDuration(selectedService.duration)} • {formatCents(selectedService.price)}
                                        </span>
                                    )}
                                </div>
                                <div className="relative">
                                    <Scissors className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                    <Select value={data.service_id} onValueChange={(v) => setData('service_id', v ?? '')}>
                                        <SelectTrigger className="h-10 pl-9 border-slate-200">
                                            <SelectValue placeholder="Select service" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {services.map((s) => (
                                                <SelectItem key={s.id} value={String(s.id)}>
                                                    {s.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-slate-700">Internal Notes</Label>
                            <Textarea
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                rows={2}
                                className="resize-none border-slate-200 placeholder:text-slate-400"
                                placeholder="Add any special requests or notes here..."
                            />
                        </div>
                    </div>

                    <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-end gap-3">
                        <Button type="button" variant="ghost" className="text-slate-600 hover:bg-slate-100" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing} className="bg-slate-900 text-white hover:bg-slate-800 shadow-sm">
                            Save Changes
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function DeleteModal({
    appointment,
    open,
    onOpenChange,
}: {
    appointment: Appointment;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const [processing, setProcessing] = useState(false);

    function handleDelete() {
        setProcessing(true);
        router.delete(route('appointments.destroy', appointment.id), {
            onSuccess: () => onOpenChange(false),
            onFinish: () => setProcessing(false),
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden border-slate-200 shadow-2xl rounded-2xl">
                <div className="px-6 pt-8 pb-6 flex flex-col items-center text-center">
                    <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                        <AlertCircle className="h-6 w-6 text-red-600" />
                    </div>
                    <DialogTitle className="text-xl font-semibold text-slate-900 mb-2">Cancel Appointment?</DialogTitle>
                    <DialogDescription className="text-sm text-slate-500 max-w-[280px]">
                        Are you sure you want to delete the appointment for <strong className="text-slate-900">{appointment.customer?.name}</strong> on {formatDateOnly(appointment.starts_at)}? This action cannot be undone.
                    </DialogDescription>
                </div>
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-stretch gap-3">
                    <Button variant="outline" className="flex-1 bg-white border-slate-200 text-slate-700 hover:bg-slate-50" onClick={() => onOpenChange(false)}>
                        Keep Appointment
                    </Button>
                    <Button variant="destructive" className="flex-1 shadow-sm" onClick={handleDelete} disabled={processing}>
                        Yes, Delete It
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default function Index({
    appointments,
    can_create,
    barbers,
    services,
}: {
    appointments: Appointment[];
    can_create: boolean;
    barbers: Barber[];
    services: Service[];
}) {
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [dateFilter, setDateFilter] = useState<string>('all');
    const [editingAppt, setEditingAppt] = useState<Appointment | null>(null);
    const [deletingAppt, setDeletingAppt] = useState<Appointment | null>(null);

    const filtered = appointments.filter((a) => {
        if (statusFilter !== 'all' && a.status !== statusFilter) return false;
        if (dateFilter === 'today' && !isToday(a.starts_at)) return false;
        if (dateFilter === 'tomorrow' && !isTomorrow(a.starts_at)) return false;
        return true;
    });

    const columns: ColumnDef<Appointment>[] = [
        {
            accessorKey: 'starts_at',
            header: 'Date & Time',
            cell: ({ row }) => (
                <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-slate-900 whitespace-nowrap">
                        {formatDateOnly(row.original.starts_at)}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTimeOnly(row.original.starts_at)}
                    </span>
                </div>
            ),
        },
        {
            id: 'customer',
            header: 'Customer',
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-semibold text-slate-600 shrink-0">
                        {getInitials(row.original.customer?.name)}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-900">{row.original.customer?.name ?? '-'}</span>
                        {row.original.customer?.phone && (
                            <span className="text-xs text-slate-500">{row.original.customer.phone}</span>
                        )}
                    </div>
                </div>
            ),
        },
        {
            id: 'barber',
            header: 'Barber',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-[#637060]/10 flex items-center justify-center text-[10px] font-bold text-[#637060] shrink-0">
                        {getInitials(row.original.barber?.user?.name)}
                    </div>
                    <span className="text-sm text-slate-700">{row.original.barber?.user?.name ?? '-'}</span>
                </div>
            ),
        },
        {
            id: 'service',
            header: 'Service',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-slate-900">{row.original.service?.name ?? '-'}</span>
                    <span className="text-xs text-slate-500">{formatCents(row.original.price)}</span>
                </div>
            ),
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
                const style = statusStyles[row.original.status];
                return (
                    <span className={cn(
                        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ring-1 ring-inset whitespace-nowrap capitalize",
                        style.bg, style.text, style.ring
                    )}>
                        {row.original.status.replace('_', ' ')}
                    </span>
                );
            },
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                const appt = row.original;
                return (
                    <div className="flex justify-end pr-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-slate-900 transition-colors">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40 rounded-xl border-slate-100 shadow-xl py-1.5">
                                <DropdownMenuItem asChild className="text-sm cursor-pointer mx-1.5 rounded-md focus:bg-slate-50">
                                    <Link href={route('appointments.show', appt.id)} className="flex items-center">
                                        <Eye className="mr-2 h-4 w-4 text-slate-400" />
                                        View Details
                                    </Link>
                                </DropdownMenuItem>
                                {appt.can_edit && (
                                    <DropdownMenuItem 
                                        onClick={() => { setTimeout(() => setEditingAppt(appt), 0); }}
                                        className="text-sm cursor-pointer mx-1.5 rounded-md focus:bg-slate-50"
                                    >
                                        <Edit className="mr-2 h-4 w-4 text-slate-400" />
                                        Edit
                                    </DropdownMenuItem>
                                )}
                                {appt.can_delete && (
                                    <>
                                        <DropdownMenuSeparator className="bg-slate-100 my-1" />
                                        <DropdownMenuItem
                                            className="text-sm cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50 mx-1.5 rounded-md"
                                            onClick={() => { setTimeout(() => setDeletingAppt(appt), 0); }}
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            },
        },
    ];

    return (
        <AppLayout
            title="Appointments"
            actions={
                can_create ? (
                    <Link 
                        href={route('appointments.create')} 
                        className={cn(buttonVariants({ variant: "default" }), "bg-slate-900 text-white hover:bg-slate-800 shadow-sm rounded-lg text-sm px-4 h-9")}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        New Appointment
                    </Link>
                ) : undefined
            }
        >
            <Head title="Appointments" />
            
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                {/* Custom Filters Wrapper passed to DataTable */}
                <div className="p-0 border-b border-transparent">
                    <DataTable
                        columns={columns}
                        data={filtered}
                        searchPlaceholder="Search customers, barbers..."
                        globalFilterFn={searchFilter}
                        filters={
                            <div className="flex items-center gap-3">
                                <Select value={dateFilter} onValueChange={(v) => setDateFilter(v ?? 'all')}>
                                    <SelectTrigger className="w-[150px] h-9 border-slate-200 bg-white text-sm">
                                        <CalendarIcon className="mr-2 h-3.5 w-3.5 text-slate-400" />
                                        <SelectValue placeholder="All dates" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-slate-100 shadow-lg">
                                        <SelectItem value="all">All dates</SelectItem>
                                        <SelectItem value="today">Today</SelectItem>
                                        <SelectItem value="tomorrow">Tomorrow</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? 'all')}>
                                    <SelectTrigger className="w-[160px] h-9 border-slate-200 bg-white text-sm capitalize">
                                        <SelectValue placeholder="All statuses" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-slate-100 shadow-lg">
                                        <SelectItem value="all">All statuses</SelectItem>
                                        {allStatuses.map((s) => (
                                            <SelectItem key={s} value={s} className="capitalize">
                                                {s.replace('_', ' ')}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        }
                    />
                </div>
            </div>

            {/* Edit Modal */}
            {editingAppt && (
                <EditModal
                    key={editingAppt.id}
                    appointment={editingAppt}
                    barbers={barbers}
                    services={services}
                    open={!!editingAppt}
                    onOpenChange={(open) => { if (!open) setEditingAppt(null); }}
                />
            )}

            {/* Delete Confirmation Modal */}
            {deletingAppt && (
                <DeleteModal
                    key={deletingAppt.id}
                    appointment={deletingAppt}
                    open={!!deletingAppt}
                    onOpenChange={(open) => { if (!open) setDeletingAppt(null); }}
                />
            )}
        </AppLayout>
    );
}