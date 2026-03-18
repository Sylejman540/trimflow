import { useEffect, useState, useCallback } from 'react';
import { router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { Users, CalendarDays, Scissors, User } from 'lucide-react';
import {
    CommandDialog,
    CommandInput,
    CommandList,
    CommandEmpty,
    CommandGroup,
    CommandItem,
} from '@/components/ui/command';

interface SearchResult {
    id: number;
    label: string;
    subtitle: string;
    url: string;
    type: 'customer' | 'appointment' | 'service' | 'barber';
}

interface SearchResults {
    customers: SearchResult[];
    appointments: SearchResult[];
    services: SearchResult[];
    barbers: SearchResult[];
}

const typeIcon = {
    customer:    <Users className="h-4 w-4 text-slate-400 shrink-0" />,
    appointment: <CalendarDays className="h-4 w-4 text-slate-400 shrink-0" />,
    service:     <Scissors className="h-4 w-4 text-slate-400 shrink-0" />,
    barber:      <User className="h-4 w-4 text-slate-400 shrink-0" />,
};

export default function CommandPalette() {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResults | null>(null);
    const [loading, setLoading] = useState(false);

    // Open on Ctrl+K / Cmd+K
    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setOpen((o) => !o);
            }
        }
        // Also allow external trigger via custom event
        function onCustom() { setOpen(true); }
        document.addEventListener('keydown', onKey);
        document.addEventListener('open-command-palette', onCustom);
        return () => {
            document.removeEventListener('keydown', onKey);
            document.removeEventListener('open-command-palette', onCustom);
        };
    }, []);

    // Debounced search
    useEffect(() => {
        if (query.length < 2) { setResults(null); return; }
        setLoading(true);
        const timeout = setTimeout(async () => {
            try {
                const res = await window.axios.get<SearchResults>(`/search?q=${encodeURIComponent(query)}`);
                setResults(res.data);
            } catch (err) {
                console.error('[Search error]', err);
            } finally {
                setLoading(false);
            }
        }, 300);
        return () => clearTimeout(timeout);
    }, [query]);

    const navigate = useCallback((url: string) => {
        setOpen(false);
        setQuery('');
        router.visit(url);
    }, []);

    const groups: { key: keyof SearchResults; label: string }[] = [
        { key: 'customers',    label: t('cust.title') },
        { key: 'appointments', label: t('appt.title') },
        { key: 'services',     label: t('svc.title') },
        { key: 'barbers',      label: t('barber.title') },
    ];

    const hasResults = results && groups.some((g) => results[g.key].length > 0);

    return (
        <CommandDialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setQuery(''); }}>
            <CommandInput
                placeholder={t('search')}
                value={query}
                onValueChange={setQuery}
            />
            <CommandList>
                {query.length >= 2 && !loading && !hasResults && (
                    <CommandEmpty>{t('noResults')}</CommandEmpty>
                )}
                {loading && (
                    <div className="py-6 text-center text-sm text-slate-400">{t('loading')}</div>
                )}
                {results && groups.map(({ key, label }) =>
                    results[key].length > 0 ? (
                        <CommandGroup key={key} heading={label}>
                            {results[key].map((item) => (
                                <CommandItem
                                    key={`${key}-${item.id}`}
                                    value={item.url}
                                    onSelect={navigate}
                                >
                                    {typeIcon[item.type]}
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-sm font-medium text-slate-900 truncate">{item.label}</span>
                                        {item.subtitle && (
                                            <span className="text-xs text-slate-400 truncate">{item.subtitle}</span>
                                        )}
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    ) : null
                )}
            </CommandList>
        </CommandDialog>
    );
}
