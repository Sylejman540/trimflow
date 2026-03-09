import { Head, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { useState } from 'react';
import { Search, SlidersHorizontal, ShieldCheck } from 'lucide-react';
import AppLayout from '@/layouts/AppLayout';
import { DataTable } from '@/components/data-table';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { User } from '@/types';

interface AuditLogEntry {
    id: number;
    action: 'created' | 'updated' | 'deleted';
    model_name: string;
    auditable_id: number;
    old_values: Record<string, unknown> | null;
    new_values: Record<string, unknown> | null;
    ip_address: string | null;
    user_agent: string | null;
    created_at: string;
    user?: User;
}

interface PaginatedLogs {
    data: AuditLogEntry[];
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
    from: number;
    to: number;
    links: { url: string | null; label: string; active: boolean }[];
}

function actionVariant(action: string) {
    const map: Record<string, string> = {
        created: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        updated: 'bg-blue-50 text-blue-700 border-blue-100',
        deleted: 'bg-red-50 text-red-600 border-red-100',
    };
    return map[action] ?? 'bg-slate-50 text-slate-600 border-slate-100';
}

function formatDateTime(dateStr: string) {
    return new Date(dateStr).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}

function ChangeSummary({ old_values, new_values, action }: { old_values: Record<string, unknown> | null; new_values: Record<string, unknown> | null; action: string }) {
    if (action === 'created' && new_values) {
        const keys = Object.keys(new_values).filter(k => !['company_id', 'created_at', 'updated_at'].includes(k));
        return (
            <span className="text-xs text-slate-500">
                {keys.slice(0, 3).map(k => (
                    <span key={k} className="inline-flex items-center gap-1 mr-2">
                        <span className="font-medium text-slate-700">{k}:</span>
                        <span className="text-emerald-600 truncate max-w-[80px]">{String(new_values[k] ?? '').slice(0, 20)}</span>
                    </span>
                ))}
                {keys.length > 3 && <span className="text-slate-400">+{keys.length - 3} more</span>}
            </span>
        );
    }

    if (action === 'updated' && old_values && new_values) {
        const keys = Object.keys(new_values).filter(k => !['updated_at'].includes(k));
        return (
            <span className="text-xs text-slate-500">
                {keys.slice(0, 2).map(k => (
                    <span key={k} className="inline-flex items-center gap-1 mr-2">
                        <span className="font-medium text-slate-700">{k}:</span>
                        <span className="text-red-500 line-through mr-0.5 truncate max-w-[50px]">{String(old_values[k] ?? '').slice(0, 15)}</span>
                        <span className="text-emerald-600 truncate max-w-[50px]">{String(new_values[k] ?? '').slice(0, 15)}</span>
                    </span>
                ))}
                {keys.length > 2 && <span className="text-slate-400">+{keys.length - 2} fields</span>}
            </span>
        );
    }

    if (action === 'deleted') {
        return <span className="text-xs text-slate-400 italic">Record removed</span>;
    }

    return null;
}

const MODEL_OPTIONS = [
    { value: 'all', label: 'All Models' },
    { value: 'Appointment', label: 'Appointments' },
    { value: 'Customer', label: 'Customers' },
    { value: 'Barber', label: 'Barbers' },
    { value: 'Service', label: 'Services' },
];

const ACTION_OPTIONS = [
    { value: 'all', label: 'All Actions' },
    { value: 'created', label: 'Created' },
    { value: 'updated', label: 'Updated' },
    { value: 'deleted', label: 'Deleted' },
];

export default function Index({
    logs,
    filters,
}: {
    logs: PaginatedLogs;
    filters: { action?: string; model?: string };
}) {
    const [actionFilter, setActionFilter] = useState(filters?.action ?? 'all');
    const [modelFilter, setModelFilter] = useState(filters?.model ?? 'all');
    const [search, setSearch] = useState('');

    const filtered = logs.data.filter(log => {
        const matchesAction = actionFilter === 'all' || log.action === actionFilter;
        const matchesModel = modelFilter === 'all' || log.model_name === modelFilter;
        const s = search.toLowerCase();
        const matchesSearch = !s || [
            log.model_name,
            log.user?.name,
            log.action,
            String(log.auditable_id),
        ].some(v => v?.toLowerCase().includes(s));
        return matchesAction && matchesModel && matchesSearch;
    });

    const columns: ColumnDef<AuditLogEntry>[] = [
        {
            accessorKey: 'created_at',
            header: () => <span className="text-[10px] font-bold tracking-wider text-slate-400">WHEN</span>,
            cell: ({ row }) => (
                <span className="whitespace-nowrap text-sm text-slate-600">
                    {formatDateTime(row.original.created_at)}
                </span>
            ),
        },
        {
            id: 'actor',
            header: () => <span className="text-[10px] font-bold tracking-wider text-slate-400">USER</span>,
            cell: ({ row }) => (
                <span className="text-sm font-medium text-slate-900">
                    {row.original.user?.name ?? 'System'}
                </span>
            ),
        },
        {
            accessorKey: 'action',
            header: () => <span className="text-[10px] font-bold tracking-wider text-slate-400">ACTION</span>,
            cell: ({ row }) => (
                <Badge className={cn(
                    'text-[10px] font-bold tracking-wider rounded-md px-2 py-0.5 shadow-none border capitalize',
                    actionVariant(row.original.action),
                )}>
                    {row.original.action}
                </Badge>
            ),
        },
        {
            id: 'subject',
            header: () => <span className="text-[10px] font-bold tracking-wider text-slate-400">SUBJECT</span>,
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-slate-900">{row.original.model_name}</span>
                    <span className="text-[11px] text-slate-400">ID #{row.original.auditable_id}</span>
                </div>
            ),
        },
        {
            id: 'changes',
            header: () => <span className="text-[10px] font-bold tracking-wider text-slate-400">CHANGES</span>,
            cell: ({ row }) => (
                <ChangeSummary
                    action={row.original.action}
                    old_values={row.original.old_values}
                    new_values={row.original.new_values}
                />
            ),
        },
        {
            id: 'ip',
            header: () => <span className="text-[10px] font-bold tracking-wider text-slate-400">IP</span>,
            cell: ({ row }) => (
                <span className="text-xs text-slate-400 font-mono">
                    {row.original.ip_address ?? '-'}
                </span>
            ),
        },
    ];

    function applyServerFilters() {
        router.get(
            route('audit-logs.index'),
            {
                action: actionFilter !== 'all' ? actionFilter : undefined,
                model: modelFilter !== 'all' ? modelFilter : undefined,
            },
            { preserveState: true, replace: true },
        );
    }

    return (
        <AppLayout title="Audit Log">
            <Head title="Audit Log" />

            <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 p-2 rounded-xl">
                    <div className="relative flex-1 max-w-2xl">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            placeholder="Search by user, model, action..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50/50 border border-slate-100 rounded-lg text-sm focus:bg-white transition-all placeholder:text-slate-400 outline-none"
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="hidden lg:flex items-center gap-1.5 mr-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            <SlidersHorizontal size={12} /> Filter
                        </div>

                        <Select
                            value={modelFilter}
                            onValueChange={(v) => { setModelFilter(v ?? 'all'); }}
                        >
                            <SelectTrigger className="h-9 w-[140px] bg-white border-slate-200 rounded-lg text-xs font-semibold shadow-none focus:ring-0">
                                <SelectValue>
                                    {MODEL_OPTIONS.find(o => o.value === modelFilter)?.label ?? 'All Models'}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-200 shadow-none">
                                {MODEL_OPTIONS.map(o => (
                                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select
                            value={actionFilter}
                            onValueChange={(v) => { setActionFilter(v ?? 'all'); }}
                        >
                            <SelectTrigger className="h-9 w-[140px] bg-white border-slate-200 rounded-lg text-xs font-semibold shadow-none focus:ring-0">
                                <SelectValue>
                                    {ACTION_OPTIONS.find(o => o.value === actionFilter)?.label ?? 'All Actions'}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-200 shadow-none">
                                {ACTION_OPTIONS.map(o => (
                                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex items-center justify-between px-1">
                    <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                        <ShieldCheck size={13} className="text-slate-300" />
                        {logs.total.toLocaleString()} total events &middot; showing {logs.from}–{logs.to}
                    </p>

                    {logs.last_page > 1 && (
                        <div className="flex items-center gap-1">
                            {logs.links.map((link, i) => (
                                <button
                                    key={i}
                                    disabled={!link.url}
                                    onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                    className={cn(
                                        'px-2.5 py-1 text-xs rounded-lg font-medium transition-colors',
                                        link.active
                                            ? 'bg-slate-900 text-white'
                                            : 'text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed',
                                    )}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                    <DataTable
                        columns={columns}
                        data={filtered}
                        showSearch={false}
                        pageSize={50}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
