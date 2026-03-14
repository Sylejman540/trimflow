import { Head, Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Edit, Plus, Trash2, Search, Clock, LayoutList, LayoutGrid } from 'lucide-react';
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
import { formatCents, cn } from '@/lib/utils';
import { Service } from '@/types';

type ViewMode = 'list' | 'grid';

const COLOR_HEX: Record<string, string> = {
    slate: '#64748b', red: '#ef4444', orange: '#f97316',
    amber: '#f59e0b', green: '#22c55e', teal: '#14b8a6',
    blue: '#3b82f6', violet: '#8b5cf6',
};

function DeleteModal({ service, open, onOpenChange }: {
    service: Service; open: boolean; onOpenChange: (open: boolean) => void;
}) {
    const { t } = useTranslation();
    const [processing, setProcessing] = useState(false);
    function handleDelete() {
        setProcessing(true);
        router.delete(route('services.destroy', service.id), {
            onSuccess: () => onOpenChange(false),
            onFinish: () => setProcessing(false),
        });
    }
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-sm border-slate-200 shadow-none">
                <DialogHeader>
                    <DialogTitle>{t('delete')} {t('svc.title')}</DialogTitle>
                    <DialogDescription>{t('svc.deleteConfirm')}</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="border-slate-200 shadow-none">{t('cancel')}</Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={processing} className="shadow-none">{t('delete')}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function Index({ services }: { services: Service[] }) {
    const { t } = useTranslation();
    const [statusFilter, setStatusFilter] = useState(() => localStorage.getItem('services_status') ?? 'all');
    const [globalSearch, setGlobalSearch] = useState(() => localStorage.getItem('services_search') ?? '');
    const [deletingService, setDeletingService] = useState<Service | null>(null);
    const [view, setView] = useState<ViewMode>(() => (localStorage.getItem('services_view') as ViewMode) ?? 'list');

    function changeView(v: ViewMode) { localStorage.setItem('services_view', v); setView(v); }
    function changeStatus(v: string) { localStorage.setItem('services_status', v); setStatusFilter(v); }
    function changeSearch(v: string) { localStorage.setItem('services_search', v); setGlobalSearch(v); }

    const filtered = services.filter((s) => {
        const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' ? s.is_active : !s.is_active);
        const search = globalSearch.toLowerCase();
        const matchesSearch = !search || [s.name, s.category].some(v => v?.toLowerCase().includes(search));
        return matchesStatus && matchesSearch;
    });

    const columns: ColumnDef<Service>[] = [
        {
            accessorKey: 'name',
            header: () => <span className="text-[10px] font-bold tracking-wider text-slate-400">{t('svc.title').toUpperCase()}</span>,
            cell: ({ row }) => {
                const color = (row.original as any).color;
                return (
                    <div className="flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color && COLOR_HEX[color] ? COLOR_HEX[color] : '#cbd5e1' }} />
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">{row.original.name}</p>
                            <p className="text-[11px] text-slate-500 uppercase tracking-tight">{row.original.category || t('svc.uncategorized')}</p>
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: 'duration',
            header: () => <span className="text-[10px] font-bold tracking-wider text-slate-400">{t('duration').toUpperCase()}</span>,
            cell: ({ row }) => (
                <div className="flex items-center text-sm text-slate-600">
                    <Clock className="mr-1.5 h-3.5 w-3.5 text-slate-400" />
                    {row.original.duration} {t('booking.min')}
                </div>
            ),
        },
        {
            accessorKey: 'price',
            header: () => <span className="text-[10px] font-bold tracking-wider text-slate-400">{t('price').toUpperCase()}</span>,
            cell: ({ row }) => <span className="text-sm font-medium text-slate-900">{formatCents(row.original.price)}</span>,
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
                const service = row.original;
                return (
                    <div className="flex items-center justify-end gap-1">
                        <Link href={route('services.edit', service.id)} className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), "h-8 w-8 text-slate-400 hover:text-slate-900 hover:bg-slate-100")}>
                            <Edit className="h-4 w-4" />
                        </Link>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-red-600 hover:bg-red-50" onClick={() => setDeletingService(service)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                );
            },
        },
    ];

    return (
        <AppLayout
            title={t('svc.title')}
            actions={
                <Link href={route('services.create')} className={cn(buttonVariants({ variant: 'default' }), 'hidden sm:flex bg-slate-900 text-white hover:bg-slate-800 h-9 px-3 rounded-lg text-xs font-bold border-none shadow-none')}>
                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                    {t('svc.new')}
                </Link>
            }
            mobileAction={
                <Link href={route('services.create')}
                    className="flex items-center justify-center gap-2 w-full h-12 rounded-2xl bg-slate-900 text-white text-sm font-bold shadow-lg active:scale-[0.98] transition-transform">
                    <Plus className="h-5 w-5" />
                    {t('svc.new')}
                </Link>
            }
        >
            <Head title={t('svc.title')} />

            <div className="space-y-2">
                {/* Toolbar */}
                <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                        <input type="text" value={globalSearch} placeholder={t('search')}
                            className="w-full pl-8 pr-3 h-8 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none placeholder:text-slate-400"
                            onChange={e => changeSearch(e.target.value)} />
                    </div>
                    <Select value={statusFilter} onValueChange={v => changeStatus(v ?? 'all')}>
                        <SelectTrigger className="h-8 w-auto min-w-[90px] bg-white border-slate-200 rounded-lg text-xs font-semibold shadow-none focus:ring-0">
                            <SelectValue>{statusFilter === 'all' ? t('all') : statusFilter === 'active' ? t('active') : t('inactive')}</SelectValue>
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-200 shadow-none">
                            <SelectItem value="all">{t('all')}</SelectItem>
                            <SelectItem value="active">{t('active')}</SelectItem>
                            <SelectItem value="inactive">{t('inactive')}</SelectItem>
                        </SelectContent>
                    </Select>
                    {/* View toggle */}
                    <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white">
                        <button onClick={() => changeView('list')} className={cn('h-8 w-8 flex items-center justify-center transition-colors', view === 'list' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-700')}>
                            <LayoutList className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => changeView('grid')} className={cn('h-8 w-8 flex items-center justify-center transition-colors', view === 'grid' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-700')}>
                            <LayoutGrid className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>

                {/* Grid View */}
                {view === 'grid' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        {filtered.length === 0 && (
                            <p className="col-span-full text-sm text-slate-400 text-center py-10">{t('svc.noServices')}</p>
                        )}
                        {filtered.map(service => {
                            const color = (service as any).color;
                            return (
                                <div key={service.id} className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <span className="w-3 h-3 rounded-full shrink-0 mt-0.5" style={{ background: color && COLOR_HEX[color] ? COLOR_HEX[color] : '#cbd5e1' }} />
                                            <div className="min-w-0">
                                                <p className="font-semibold text-slate-900 text-sm truncate">{service.name}</p>
                                                <p className="text-xs text-slate-400 uppercase tracking-tight">{service.category || t('svc.uncategorized')}</p>
                                            </div>
                                        </div>
                                        <Badge className={cn("text-[10px] font-bold rounded-md px-2 py-0.5 shadow-none border shrink-0",
                                            service.is_active ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-slate-50 text-red-600 border-red-100")}>
                                            {service.is_active ? t('active') : t('inactive')}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm">
                                        <span className="flex items-center gap-1 text-slate-600">
                                            <Clock className="h-3.5 w-3.5 text-slate-400" /> {service.duration} {t('booking.min')}
                                        </span>
                                        <span className="font-semibold text-slate-900">{formatCents(service.price)}</span>
                                    </div>
                                    <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                                        <Link href={route('services.edit', service.id)} className={cn(buttonVariants({ variant: 'outline' }), 'flex-1 h-8 text-xs font-bold border-slate-200 shadow-none gap-1')}>
                                            <Edit className="h-3 w-3" /> {t('edit')}
                                        </Link>
                                        <button onClick={() => setDeletingService(service)} className="h-8 w-8 flex items-center justify-center text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg border border-slate-200">
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* List View */}
                {view === 'list' && (
                    <>
                        {/* Mobile cards */}
                        <div className="sm:hidden space-y-2">
                            {filtered.length === 0 && (
                                <p className="text-sm text-slate-400 text-center py-10">{t('svc.noServices')}</p>
                            )}
                            {filtered.map(service => {
                                const color = (service as any).color;
                                return (
                                    <div key={service.id} className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <span className="w-3 h-3 rounded-full shrink-0 mt-0.5" style={{ background: color && COLOR_HEX[color] ? COLOR_HEX[color] : '#cbd5e1' }} />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-slate-900 text-sm truncate">{service.name}</p>
                                                <p className="text-xs text-slate-400 uppercase tracking-tight">{service.category || t('svc.uncategorized')}</p>
                                            </div>
                                            <Badge className={cn("text-[10px] font-bold rounded-md px-2 py-0.5 shadow-none border shrink-0",
                                                service.is_active ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-slate-50 text-red-600 border-red-100")}>
                                                {service.is_active ? t('active') : t('inactive')}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm">
                                            <span className="flex items-center gap-1 text-slate-600">
                                                <Clock className="h-3.5 w-3.5 text-slate-400" /> {service.duration} {t('booking.min')}
                                            </span>
                                            <span className="font-semibold text-slate-900">{formatCents(service.price)}</span>
                                        </div>
                                        <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                                            <Link href={route('services.edit', service.id)} className={cn(buttonVariants({ variant: 'outline' }), 'flex-1 h-9 text-xs font-bold border-slate-200 shadow-none gap-1.5')}>
                                                <Edit className="h-3.5 w-3.5" /> {t('edit')}
                                            </Link>
                                            <button onClick={() => setDeletingService(service)} className="h-9 w-9 flex items-center justify-center text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg border border-slate-200">
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
                    </>
                )}
            </div>

            {deletingService && (
                <DeleteModal service={deletingService} open={!!deletingService} onOpenChange={open => !open && setDeletingService(null)} />
            )}
        </AppLayout>
    );
}
