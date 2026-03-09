import { Head, Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { useState } from 'react';
import { Plus, Trash2, Bell, CheckCircle2, Search, SlidersHorizontal, CalendarDays } from 'lucide-react';
import AppLayout from '@/layouts/AppLayout';
import { DataTable } from '@/components/data-table';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface WaitlistEntry {
    id: number;
    customer_name: string;
    customer_email?: string;
    customer_phone?: string;
    preferred_date?: string;
    notes?: string;
    status: 'waiting' | 'notified' | 'booked' | 'expired';
    notified_at?: string;
    created_at: string;
    barber?: { id: number; user: { name: string } };
    service?: { id: number; name: string };
}

const STATUS_CONFIG = {
    waiting:  { label: 'Waiting',  cls: 'bg-amber-50 text-amber-700 border-amber-200' },
    notified: { label: 'Notified', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
    booked:   { label: 'Booked',   cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    expired:  { label: 'Expired',  cls: 'bg-slate-50 text-slate-500 border-slate-200' },
} as const;

function DeleteModal({ entry, open, onOpenChange }: {
    entry: WaitlistEntry; open: boolean; onOpenChange: (v: boolean) => void;
}) {
    const [processing, setProcessing] = useState(false);
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-sm border-slate-200 shadow-none">
                <DialogHeader>
                    <DialogTitle>Remove from Waitlist</DialogTitle>
                    <DialogDescription>
                        Remove <span className="font-medium text-gray-900">{entry.customer_name}</span> from the waitlist? This cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="border-slate-200 shadow-none">Cancel</Button>
                    <Button variant="destructive" disabled={processing} className="shadow-none" onClick={() => {
                        setProcessing(true);
                        router.delete(route('waitlist.destroy', entry.id), {
                            onSuccess: () => onOpenChange(false),
                            onFinish: () => setProcessing(false),
                        });
                    }}>Remove</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function Index({ entries }: { entries: WaitlistEntry[] }) {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [deleting, setDeleting] = useState<WaitlistEntry | null>(null);

    const filtered = entries.filter(e => {
        const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
        const s = search.toLowerCase();
        const matchesSearch = !s || [e.customer_name, e.customer_email, e.customer_phone, e.service?.name, e.barber?.user.name]
            .some(v => v?.toLowerCase().includes(s));
        return matchesStatus && matchesSearch;
    });

    function setStatus(entry: WaitlistEntry, status: string) {
        router.patch(route('waitlist.update', entry.id), { status });
    }

    const columns: ColumnDef<WaitlistEntry>[] = [
        {
            accessorKey: 'customer_name',
            header: () => <span className="text-[10px] font-bold tracking-wider text-slate-400">CUSTOMER</span>,
            cell: ({ row }) => <span className="text-sm font-medium text-slate-900">{row.original.customer_name}</span>,
        },
        {
            id: 'contact',
            header: () => <span className="text-[10px] font-bold tracking-wider text-slate-400">CONTACT</span>,
            cell: ({ row }) => (
                <div className="text-sm text-slate-600 space-y-0.5">
                    {row.original.customer_phone && <div>{row.original.customer_phone}</div>}
                    {row.original.customer_email && <div className="text-xs text-slate-400">{row.original.customer_email}</div>}
                </div>
            ),
        },
        {
            id: 'preference',
            header: () => <span className="text-[10px] font-bold tracking-wider text-slate-400">PREFERENCE</span>,
            cell: ({ row }) => (
                <div className="text-sm text-slate-600 space-y-0.5">
                    {row.original.service && <div>{row.original.service.name}</div>}
                    {row.original.barber && <div className="text-xs text-slate-400">{row.original.barber.user.name}</div>}
                    {!row.original.service && !row.original.barber && <span className="text-slate-400">—</span>}
                </div>
            ),
        },
        {
            accessorKey: 'preferred_date',
            header: () => <span className="text-[10px] font-bold tracking-wider text-slate-400">DATE</span>,
            cell: ({ row }) => row.original.preferred_date
                ? <span className="inline-flex items-center gap-1 text-sm text-slate-600"><CalendarDays className="h-3.5 w-3.5 text-slate-400" />{row.original.preferred_date}</span>
                : <span className="text-slate-400">—</span>,
        },
        {
            accessorKey: 'status',
            header: () => <span className="text-[10px] font-bold tracking-wider text-slate-400">STATUS</span>,
            cell: ({ row }) => {
                const cfg = STATUS_CONFIG[row.original.status];
                return (
                    <Badge className={cn('text-[10px] font-bold tracking-wider rounded-md px-2 py-0.5 shadow-none border', cfg.cls)}>
                        {cfg.label}
                    </Badge>
                );
            },
        },
        {
            id: 'actions',
            header: () => <div className="text-right px-2 text-[10px] font-bold tracking-wider text-slate-400">ACTIONS</div>,
            cell: ({ row }) => {
                const entry = row.original;
                return (
                    <div className="flex items-center justify-end gap-1">
                        {entry.status === 'waiting' && (
                            <Button
                                variant="ghost" size="sm"
                                className="h-8 text-xs text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                                onClick={() => setStatus(entry, 'notified')}
                            >
                                <Bell className="mr-1 h-3.5 w-3.5" /> Notify
                            </Button>
                        )}
                        {entry.status === 'notified' && (
                            <>
                                <Button
                                    variant="ghost" size="sm"
                                    className="h-8 text-xs text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                                    onClick={() => setStatus(entry, 'booked')}
                                >
                                    <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Booked
                                </Button>
                                <Button
                                    variant="ghost" size="sm"
                                    className="h-8 text-xs text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                                    onClick={() => setStatus(entry, 'expired')}
                                >
                                    Expire
                                </Button>
                            </>
                        )}
                        <Button
                            variant="ghost" size="icon"
                            className="h-8 w-8 text-slate-300 hover:text-red-600 hover:bg-red-50"
                            onClick={() => setDeleting(entry)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                );
            },
        },
    ];

    return (
        <AppLayout
            title="Waitlist"
            actions={
                <Link
                    href={route('waitlist.create')}
                    className={cn(buttonVariants({ variant: 'default' }), 'bg-slate-900 text-white hover:bg-slate-800 h-9 px-4 rounded-lg text-xs font-bold border-none shadow-none')}
                >
                    <Plus className="mr-2 h-3.5 w-3.5" /> Add to Waitlist
                </Link>
            }
        >
            <Head title="Waitlist" />

            <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 p-2 rounded-xl">
                    <div className="relative flex-1 max-w-2xl">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            placeholder="Search by name, phone, or service..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50/50 border border-slate-100 rounded-lg text-sm focus:bg-white transition-all placeholder:text-slate-400 outline-none"
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="hidden lg:flex items-center gap-1.5 mr-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            <SlidersHorizontal size={12} /> Filter
                        </div>
                        <Select value={statusFilter} onValueChange={v => setStatusFilter(v ?? 'all')}>
                            <SelectTrigger className="h-9 w-[140px] bg-white border-slate-200 rounded-lg text-xs font-semibold shadow-none focus:ring-0">
                                <SelectValue>
                                    {statusFilter === 'all' ? 'All Statuses' : STATUS_CONFIG[statusFilter as keyof typeof STATUS_CONFIG]?.label ?? statusFilter}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-200 shadow-none">
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="waiting">Waiting</SelectItem>
                                <SelectItem value="notified">Notified</SelectItem>
                                <SelectItem value="booked">Booked</SelectItem>
                                <SelectItem value="expired">Expired</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                    <DataTable columns={columns} data={filtered} showSearch={false} />
                </div>
            </div>

            {deleting && (
                <DeleteModal
                    entry={deleting}
                    open={!!deleting}
                    onOpenChange={open => !open && setDeleting(null)}
                />
            )}
        </AppLayout>
    );
}
