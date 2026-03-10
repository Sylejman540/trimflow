import { Link, router, usePage, useForm } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useState, useEffect, FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import {
    CalendarDays,
    LayoutDashboard,
    LogOut,
    Menu,
    Scissors,
    User,
    Briefcase,
    ChevronLeft,
    ChevronRight,
    Bell,
    PalmtreeIcon,
    LayoutGrid,
    Zap,
    X,
    Package,
    Phone,
} from 'lucide-react';
import { cn, formatCents } from '@/lib/utils';
import { PageProps } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

interface WalkinBarber { id: number; user: { name: string } }
interface WalkinService { id: number; name: string; duration: number; price: number }
interface WalkinProps {
    is_barber: boolean;
    barbers: WalkinBarber[];
    services: WalkinService[];
}

function WalkinModal({ open, onClose, walkin }: { open: boolean; onClose: () => void; walkin: WalkinProps }) {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors, reset } = useForm({
        customer_name: '',
        customer_phone: '',
        service_id: '',
        barber_id: '',
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        post(route('walkin.store'), {
            onSuccess: () => { reset(); onClose(); },
        });
    }

    return (
        <Dialog open={open} onOpenChange={v => !v && onClose()}>
            <DialogContent className="sm:max-w-lg border-slate-200 shadow-sm">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-base font-bold">
                        <Zap className="h-4 w-4 text-amber-500" /> {t('walkin.title')}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-5 pt-1">
                    {/* Customer name */}
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                            <User size={11} /> {t('walkin.customerName')}
                        </Label>
                        <Input
                            value={data.customer_name}
                            onChange={e => setData('customer_name', e.target.value)}
                            className="h-11 bg-slate-50 border-slate-200 focus:bg-white rounded-lg"
                            placeholder={t('walkin.namePlaceholder')}
                            required
                        />
                        {errors.customer_name && <p className="text-xs text-red-500">{errors.customer_name}</p>}
                    </div>

                    {/* Service */}
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                            <Scissors size={11} /> {t('walkin.service')}
                        </Label>
                        <Select value={data.service_id} onValueChange={v => setData('service_id', v ?? '')}>
                            <SelectTrigger className="h-11 bg-slate-50 border-slate-200 focus:bg-white rounded-lg">
                                <SelectValue placeholder={t('walkin.selectService')} />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-200 shadow-xl min-w-[320px]">
                                {walkin.services.map(s => (
                                    <SelectItem key={s.id} value={String(s.id)}>
                                        {s.name} — {formatCents(s.price)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.service_id && <p className="text-xs text-red-500">{errors.service_id}</p>}
                    </div>

                    {/* Barber (admin/owner only) */}
                    {!walkin.is_barber && (
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                                <Briefcase size={11} /> {t('walkin.barber')}
                            </Label>
                            <Select value={data.barber_id} onValueChange={v => setData('barber_id', v ?? '')}>
                                <SelectTrigger className="h-11 bg-slate-50 border-slate-200 focus:bg-white rounded-lg">
                                    <SelectValue placeholder={t('walkin.selectBarber')} />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-slate-200 shadow-xl min-w-[320px]">
                                    {walkin.barbers.map(b => (
                                        <SelectItem key={b.id} value={String(b.id)}>{b.user.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.barber_id && <p className="text-xs text-red-500">{errors.barber_id}</p>}
                        </div>
                    )}

                    <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                        <Button
                            type="submit"
                            disabled={processing}
                            className="flex-1 sm:flex-none bg-slate-900 text-white hover:bg-slate-800 h-11 px-6 rounded-lg text-sm font-bold shadow-sm"
                        >
                            <Zap className="h-3.5 w-3.5 mr-1.5 fill-current" />
                            {t('walkin.bookNow')}
                        </Button>
                        <Button type="button" variant="ghost" onClick={onClose} className="text-slate-500 h-11 px-4">
                            {t('cancel')}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

interface NavItem {
    label: string;
    href: string;
    icon: React.ElementType;
    active: string;
    roles?: string[];
}

const navConfig: Omit<NavItem, 'label'>[] = [
    { href: '/dashboard',        icon: LayoutDashboard, active: 'dashboard',          labelKey: 'nav.dashboard' },
    { href: '/appointments',     icon: CalendarDays,    active: 'appointments.*',     labelKey: 'nav.appointments' },
    { href: '/schedule',         icon: LayoutGrid,      active: 'schedule.*',         labelKey: 'nav.schedule' },
    { href: '/services',         icon: Scissors,        active: 'services.*',         labelKey: 'nav.services',  roles: ['platform-admin', 'shop-admin'] },
    { href: '/products',         icon: Package,         active: 'products.*',         labelKey: 'nav.products',  roles: ['shop-admin', 'platform-admin'] },
    { href: '/barbers',          icon: Briefcase,       active: 'barbers.*',          labelKey: 'nav.barbers',   roles: ['platform-admin', 'shop-admin'] },
    { href: '/barbers/time-off', icon: PalmtreeIcon,    active: 'barbers.time-off.*', labelKey: 'timeoff.title', roles: ['platform-admin', 'shop-admin'] },
] as any[];

const mobileNavConfig: Omit<NavItem, 'label'>[] = [
    { href: '/dashboard',    icon: LayoutDashboard, active: 'dashboard',      labelKey: 'nav.dashboard' },
    { href: '/appointments', icon: CalendarDays,    active: 'appointments.*', labelKey: 'nav.appointments' },
    { href: '/schedule',     icon: LayoutGrid,      active: 'schedule.*',     labelKey: 'nav.schedule' },
    { href: '/products',     icon: Package,         active: 'products.*',     labelKey: 'nav.products', roles: ['shop-admin', 'platform-admin'] },
    { href: '/profile',      icon: User,            active: 'profile.*',      labelKey: 'profileLabel' },
] as any[];

export default function AppLayout({
    children,
    title,
    actions,
}: PropsWithChildren<{ title?: string; actions?: ReactNode }>) {
    const { auth, walkin, flash } = usePage<PageProps & { walkin: WalkinProps | null; flash: { success?: string; error?: string } }>().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [walkinOpen, setWalkinOpen] = useState(false);
    const { t } = useTranslation();

    useEffect(() => {
        setSidebarOpen(false);
    }, [route().current()]);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const visibleNavItems = navConfig
        .filter((item: any) => !item.roles || item.roles.some((r: string) => auth.roles.includes(r)))
        .map((item: any) => ({ ...item, label: t(item.labelKey) }));

    const visibleMobileNav = mobileNavConfig
        .filter((item: any) => !item.roles || item.roles.some((r: string) => auth.roles.includes(r)))
        .map((item: any) => ({ ...item, label: t(item.labelKey) }));

    const SidebarLink = ({
        href,
        icon: Icon,
        label,
        active = false,
        onClick,
        variant = 'default'
    }: {
        href?: string,
        icon: any,
        label: string,
        active?: boolean,
        onClick?: () => void,
        variant?: 'default' | 'danger'
    }) => {
        const className = cn(
            'group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 w-full',
            active
                ? 'bg-slate-100 text-slate-900'
                : variant === 'danger'
                    ? 'text-slate-500 hover:bg-red-50 hover:text-red-600'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900',
            isCollapsed && "justify-center px-0"
        );

        const content = (
            <>
                <Icon className={cn(
                    'h-4 w-4 shrink-0 transition-colors',
                    active ? 'text-slate-900' : 'text-slate-400 group-hover:text-inherit'
                )} />
                {!isCollapsed && <span>{label}</span>}
            </>
        );

        if (onClick) {
            return <button onClick={onClick} className={className}>{content}</button>;
        }

        return <Link href={href || '#'} className={className}>{content}</Link>;
    };

    return (
        <div className="flex h-[100dvh] overflow-hidden bg-white font-sans text-slate-900">
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar — desktop always visible, mobile slides in */}
            <aside className={cn(
                'fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-200 bg-white transition-all duration-300 lg:static lg:translate-x-0',
                isCollapsed ? 'w-20' : 'w-72 lg:w-64',
                sidebarOpen ? 'translate-x-0' : '-translate-x-full',
            )}>
                {/* Brand */}
                <div className="flex h-16 items-center justify-between px-6 shrink-0">
                    <Link href="/dashboard" className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-white shadow-sm">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                                <circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/>
                                <line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/>
                                <line x1="8.12" y1="8.12" x2="12" y2="12"/>
                            </svg>
                        </div>
                        {!isCollapsed && <span className="text-lg font-bold tracking-tight">Barber<span className="text-amber-500">Flow</span></span>}
                    </Link>
                    {/* Close button on mobile */}
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden p-2 text-slate-400 hover:text-slate-900 rounded-md"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Workspace Nav */}
                <div className="flex-1 px-4 py-6 overflow-y-auto space-y-8">
                    <div className="space-y-1">
                        {!isCollapsed && <h3 className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">{t('nav.workspace')}</h3>}
                        {visibleNavItems.map((item) => (
                            <SidebarLink
                                key={item.href}
                                href={item.href}
                                icon={item.icon}
                                label={item.label}
                                active={route().current(item.active)}
                            />
                        ))}
                    </div>
                </div>

                {/* Account Section */}
                <div className="border-t border-slate-200 p-4 space-y-4">
                    <div className="space-y-1">
                        {!isCollapsed && <h3 className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">{t('nav.account')}</h3>}

                        <SidebarLink
                            href={route('profile.edit')}
                            icon={User}
                            label={t('nav.myProfile')}
                            active={route().current('profile.edit')}
                        />

                        <SidebarLink
                            onClick={() => router.post(route('logout'))}
                            icon={LogOut}
                            label={t('nav.signOut')}
                            variant="danger"
                        />
                    </div>

                    {/* User Badge */}
                    <div className={cn("flex items-center gap-3 pt-2", !isCollapsed && "px-2")}>
                        <div className="ml-1 h-8 w-8 shrink-0 flex items-center justify-center rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold">
                            {auth.user.name.charAt(0).toUpperCase()}
                        </div>
                        {!isCollapsed && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold truncate">{auth.user.name}</p>
                                <p className="text-[11px] text-slate-500 truncate capitalize">{auth.roles[0]?.replace('-', ' ')}</p>
                            </div>
                        )}
                    </div>

                    {/* Collapse Button (desktop only) */}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="hidden lg:flex w-full items-center justify-center py-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                        {isCollapsed ? <ChevronRight size={16} /> : <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest"><ChevronLeft size={14} /> {t('walkin.collapse')}</div>}
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                {/* Header */}
                <header className="flex h-14 lg:h-16 shrink-0 items-center justify-between border-b border-slate-200 px-4 lg:px-8">
                    {/* Krahu i Majtë: Menu & Titulli */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-50 rounded-md transition-colors"
                        >
                            <Menu size={20} />
                        </button>
                        <h1 className="text-sm font-bold text-slate-900 tracking-tight leading-none">
                            {title}
                        </h1>
                    </div>

                    {/* Krahu i Djathtë: Actions, Walk-in, Lang, Notifications */}
                    <div className="flex items-center gap-1.5 sm:gap-3">
                        {/* Butonat specifikë të faqes (p.sh. Add, Export) */}
                        {actions && (
                            <div className="flex items-center gap-1.5">
                                {actions}
                            </div>
                        )}

                        {/* Ndarësi vizual nëse ka actions dhe walkin */}
                        {actions && walkin && (
                            <div className="w-px h-4 bg-slate-200 mx-1 hidden xs:block" />
                        )}

                        {/* Walk-in Button - Forcuam h-9 dhe font-bold */}
                        {walkin && (
                            <button
                                onClick={() => setWalkinOpen(true)}
                                className="flex items-center gap-1.5 h-9 px-3 lg:px-4 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold transition-all shadow-sm active:scale-95 shrink-0"
                            >
                                <Zap className="h-3.5 w-3.5 fill-current" />
                                <span className="hidden xs:inline">Walk-in</span>
                            </button>
                        )}

                        {/* Language & Notifications */}
                        <div className="flex items-center gap-1">
                            <div className="flex items-center h-9">
                                <LanguageSwitcher compact />
                            </div>
                            
                            <Link
                                href={route('notifications.index')}
                                className="relative flex items-center justify-center w-9 h-9 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                            >
                                <Bell size={18} />
                                {auth.unread_notifications > 0 && (
                                    <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 text-[9px] font-bold text-white ring-2 ring-white">
                                        {auth.unread_notifications > 9 ? '9+' : auth.unread_notifications}
                                    </span>
                                )}
                            </Link>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-white pb-20 lg:pb-8">
                    <div className="max-w-[1400px] mx-auto">{children}</div>
                </main>
            </div>

            {/* Mobile Bottom Nav */}
            <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-slate-200 flex items-stretch">
                {visibleMobileNav.map((item) => {
                    const Icon = item.icon;
                    const isActive = route().current(item.active);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors',
                                isActive ? 'text-slate-900' : 'text-slate-400'
                            )}
                        >
                            <Icon className={cn('h-5 w-5', isActive ? 'text-slate-900' : 'text-slate-400')} />
                            {item.label}
                        </Link>
                    );
                })}
                {walkin && (
                    <button
                        onClick={() => setWalkinOpen(true)}
                        className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-bold text-amber-500"
                    >
                        <Zap className="h-5 w-5" />
                        {t('walkin.button')}
                    </button>
                )}
            </nav>

            {walkin && (
                <WalkinModal
                    open={walkinOpen}
                    onClose={() => setWalkinOpen(false)}
                    walkin={walkin}
                />
            )}

            <Toaster position="bottom-right" richColors closeButton />
        </div>
    );
}
