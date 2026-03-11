import { Head, Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Edit, Plus, Trash2, Search, User, Clock, Mail, PowerOff } from 'lucide-react';
import AppLayout from '@/layouts/AppLayout';
import { DataTable } from '@/components/data-table';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Barber } from '@/types';

function DeleteBarberModal({ barber, open, onOpenChange }: {
    barber: Barber; open: boolean; onOpenChange: (open: boolean) => void;
}) {
    const { t } = useTranslation();
    const [processing, setProcessing] = useState(false);
    function handleDelete() {
        setProcessing(true);
        router.delete(route('barbers.destroy', barber.id), {
            onSuccess: () => onOpenChange(false),
            onFinish: () => setProcessing(false),
        });
    }
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-sm border-slate-200 shadow-none">
                <DialogHeader>
                    <DialogTitle>{t('barber.edit')}</DialogTitle>
                    <DialogDescription>
                        {t('barber.deleteConfirm')}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="border-slate-200 shadow-none">{t('cancel')}</Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={processing} className="shadow-none">{t('delete')}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function Index({ barbers, off_today_ids = [] }: { barbers: Barber[]; off_today_ids?: number[] }) {
    const { t } = useTranslation();
    const [statusFilter, setStatusFilter] = useState('all');
    const [globalSearch, setGlobalSearch] = useState('');
    const [deletingBarber, setDeletingBarber] = useState<Barber | null>(null);

    function toggleAvailability(barberId: number) {
        router.post(route('barbers.toggle-availability', barberId), {}, { preserveScroll: true });
    }

    const filtered = barbers.filter((b) => {
        const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' ? b.is_active : !b.is_active);
        const search = globalSearch.toLowerCase();
        const matchesSearch = !search || [b.user?.name, b.user?.email, b.specialty].some(v => v?.toLowerCase().includes(search));
        return matchesStatus && matchesSearch;
    });

    const columns: ColumnDef<Barber>[] = [
        {
            accessorKey: 'user.name',
            header: () => <span className="text-[10px] font-bold tracking-wider text-slate-400">{t('name').toUpperCase()}</span>,
            cell: ({ row }) => {
                const isOff = off_today_ids.includes(row.original.id);
                return (
                <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                        <User className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-slate-900 truncate">{row.original.user?.name}</p>
                            {isOff && (
                                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                                    {t('barber.offToday')}
                                </span>
                            )}
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">{row.original.specialty || t('barber.generalist')}</p>
                    </div>
                </div>
                );
            },
        },
        {
            accessorKey: 'user.email',
            header: () => <span className="text-[10px] font-bold tracking-wider text-slate-400">{t('email').toUpperCase()}</span>,
            cell: ({ row }) => (
                <div className="flex items-center text-sm text-slate-600">
                    <Mail className="mr-1.5 h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{row.original.user?.email}</span>
                </div>
            ),
        },
        {
            accessorKey: 'is_active',
            header: () => <span className="text-[10px] font-bold tracking-wider text-slate-400">{t('status').toUpperCase()}</span>,
            cell: ({ row }) => (
                <Badge className={cn("text-[10px] font-bold tracking-wider rounded-md px-2 py-0.5 shadow-none border",
                    row.original.is_active ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-slate-50 text-red-600 border-red-100")}>
                    {row.original.is_active ? t('active').toUpperCase() : t('inactive').toUpperCase()}
                </Badge>
            ),
        },
        {
            id: 'actions',
            header: () => <div className="text-right px-2 text-[10px] font-bold tracking-wider text-slate-400">{t('actions').toUpperCase()}</div>,
            cell: ({ row }) => {
                const barber = row.original;
                const isOff = off_today_ids.includes(barber.id);
                return (
                    <div className="flex items-center justify-end gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn("h-8 w-8 transition-colors", isOff ? "text-amber-500 hover:text-amber-700 hover:bg-amber-50" : "text-slate-300 hover:text-slate-600 hover:bg-slate-100")}
                            title={isOff ? t('barber.markAvailable') : t('barber.markUnavailable')}
                            onClick={() => toggleAvailability(barber.id)}
                        >
                            <PowerOff className="h-4 w-4" />
                        </Button>
                        <Link href={route('barbers.schedule', barber.id)} className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), "h-8 w-8 text-slate-400 hover:text-slate-900 hover:bg-slate-100")} title="Schedule">
                            <Clock className="h-4 w-4" />
                        </Link>
                        <Link href={route('barbers.edit', barber.id)} className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), "h-8 w-8 text-slate-400 hover:text-slate-900 hover:bg-slate-100")}>
                            <Edit className="h-4 w-4" />
                        </Link>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-red-600 hover:bg-red-50" onClick={() => setDeletingBarber(barber)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                );
            },
        },
    ];

    return (
        <AppLayout
            title={t('barber.title')}
            actions={
                <Link href={route('barbers.create')} className={cn(buttonVariants({ variant: 'default' }), 'bg-slate-900 text-white hover:bg-slate-800 h-9 px-3 rounded-lg text-xs font-bold border-none shadow-none')}>
                    <Plus className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline ml-2">{t('barber.new')}</span>
                </Link>
            }
        >
            <Head title={t('barber.title')} />

            <div className="space-y-4">
                {/* Search & Filter */}
                <div className="flex flex-col gap-2 bg-white border border-slate-200 p-2 rounded-xl">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input type="text" value={globalSearch} placeholder={t('search')}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-100 rounded-lg text-sm focus:bg-white transition-all placeholder:text-slate-400 outline-none"
                            onChange={e => setGlobalSearch(e.target.value)} />
                    </div>
                    <Select value={statusFilter} onValueChange={v => setStatusFilter(v ?? 'all')}>
                        <SelectTrigger className="h-9 bg-white border-slate-200 rounded-lg text-xs font-semibold shadow-none focus:ring-0">
                            <SelectValue>{statusFilter === 'all' ? t('all') : statusFilter === 'active' ? t('active') : t('inactive')}</SelectValue>
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-200 shadow-none">
                            <SelectItem value="all">{t('all')}</SelectItem>
                            <SelectItem value="active">{t('active')}</SelectItem>
                            <SelectItem value="inactive">{t('inactive')}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Mobile cards */}
                <div className="sm:hidden space-y-2">
                    {filtered.length === 0 && (
                        <p className="text-sm text-slate-400 text-center py-10">{t('barber.noBarbers')}</p>
                    )}
                    {filtered.map(barber => {
                        const isOff = off_today_ids.includes(barber.id);
                        return (
                        <div key={barber.id} className={cn("bg-white border rounded-xl p-4 space-y-3", isOff ? "border-amber-200 bg-amber-50/30" : "border-slate-200")}>
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                                    <User className="h-5 w-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-slate-900 text-sm truncate">{barber.user?.name}</p>
                                    <p className="text-xs text-slate-400 truncate">{barber.user?.email}</p>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                    {isOff && (
                                        <Badge className="text-[10px] font-bold rounded-md px-2 py-0.5 shadow-none border bg-amber-50 text-amber-700 border-amber-200">
                                            {t('barber.offToday')}
                                        </Badge>
                                    )}
                                    <Badge className={cn("text-[10px] font-bold rounded-md px-2 py-0.5 shadow-none border",
                                        barber.is_active ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-slate-50 text-red-600 border-red-100")}>
                                        {barber.is_active ? t('active') : t('inactive')}
                                    </Badge>
                                </div>
                            </div>
                            {barber.specialty && (
                                <p className="text-xs text-slate-500 italic">{barber.specialty}</p>
                            )}
                            <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                                <button
                                    onClick={() => toggleAvailability(barber.id)}
                                    className={cn("h-9 w-9 flex items-center justify-center rounded-lg border transition-colors shrink-0",
                                        isOff ? "text-amber-600 border-amber-200 bg-amber-50 hover:bg-amber-100" : "text-slate-400 border-slate-200 hover:text-slate-700 hover:bg-slate-50")}
                                    title={isOff ? t('barber.markAvailable') : t('barber.markUnavailable')}
                                >
                                    <PowerOff className="h-3.5 w-3.5" />
                                </button>
                                <Link href={route('barbers.schedule', barber.id)} className={cn(buttonVariants({ variant: 'outline' }), 'flex-1 h-9 text-xs font-bold border-slate-200 shadow-none gap-1.5')}>
                                    <Clock className="h-3.5 w-3.5" /> {t('barber.schedule')}
                                </Link>
                                <Link href={route('barbers.edit', barber.id)} className={cn(buttonVariants({ variant: 'outline' }), 'flex-1 h-9 text-xs font-bold border-slate-200 shadow-none gap-1.5')}>
                                    <Edit className="h-3.5 w-3.5" /> {t('edit')}
                                </Link>
                                <button onClick={() => setDeletingBarber(barber)} className="h-9 w-9 flex items-center justify-center text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg border border-slate-200">
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>
                        );
                    })}
                </div>

                {/* Desktop table */}
                <div className="hidden sm:block bg-white border border-slate-200 rounded-xl overflow-hidden">
                    <DataTable columns={columns} data={filtered} showSearch={false} />
                </div>
            </div>

            {deletingBarber && (
                <DeleteBarberModal barber={deletingBarber} open={!!deletingBarber} onOpenChange={open => !open && setDeletingBarber(null)} />
            )}
        </AppLayout>
    );
}
