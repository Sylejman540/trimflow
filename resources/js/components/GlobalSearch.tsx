import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { router } from '@inertiajs/react';
import {
    Command,
    CommandDialog,
    CommandInput,
    CommandList,
    CommandEmpty,
    CommandGroup,
    CommandItem,
    CommandSeparator,
} from '@/components/ui/command';
import {
    Calendar,
    Users,
    Scissors,
    BarChart3,
    Settings,
    Home,
} from 'lucide-react';

type SearchSection = 'navigation';

interface SearchItem {
    id: string;
    label: string;
    icon: React.ElementType;
    section: SearchSection;
    href: string;
}

export default function GlobalSearch() {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [searchItems] = useState<SearchItem[]>([
        {
            id: 'nav-dashboard',
            label: t('dashboard'),
            section: 'navigation',
            icon: Home,
            href: route('dashboard'),
        },
        {
            id: 'nav-appointments',
            label: t('appt.title'),
            section: 'navigation',
            icon: Calendar,
            href: route('appointments.index'),
        },
        {
            id: 'nav-barbers',
            label: t('barber.title'),
            section: 'navigation',
            icon: Scissors,
            href: route('barbers.index'),
        },
        {
            id: 'nav-services',
            label: t('service.title'),
            section: 'navigation',
            icon: BarChart3,
            href: route('services.index'),
        },
        {
            id: 'nav-settings',
            label: t('settings'),
            section: 'navigation',
            icon: Settings,
            href: route('settings.index'),
        },
    ]);

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen(open => !open);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    const handleSelect = (href: string) => {
        setOpen(false);
        router.visit(href);
    };

    return (
        <CommandDialog open={open} onOpenChange={setOpen} title={t('search')} description={t('searchDesc') || 'Search for pages and actions...'}>
            <Command shouldFilter>
                <CommandInput
                    placeholder={t('searchPlaceholder') || 'Search...'}
                    className="text-sm"
                />
                <CommandList>
                    <CommandEmpty>{t('noResults') || 'No results found.'}</CommandEmpty>

                    <CommandGroup heading={t('navigation')}>
                        {searchItems.map(item => (
                            <CommandItem
                                key={item.id}
                                onSelect={() => handleSelect(item.href)}
                                className="cursor-pointer"
                            >
                                <item.icon className="mr-2 h-4 w-4 opacity-60" />
                                <span className="text-xs font-medium">{item.label}</span>
                            </CommandItem>
                        ))}
                    </CommandGroup>

                    <CommandSeparator />

                    <div className="p-2 text-center text-xs text-muted-foreground">
                        <kbd className="rounded border border-slate-300 bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium">
                            {typeof navigator !== 'undefined' && navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'} K
                        </kbd>
                        <span className="ml-2">{t('toOpenSearch') || 'to open search'}</span>
                    </div>
                </CommandList>
            </Command>
        </CommandDialog>
    );
}
