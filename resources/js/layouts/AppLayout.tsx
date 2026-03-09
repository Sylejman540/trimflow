import { Link, router, usePage, useForm } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useState, useEffect, FormEvent } from 'react';
import CommandPalette from '@/components/CommandPalette';
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
    Search,
    Users,
} from 'lucide-react';
import { cn, formatCents } from '@/lib/utils';
import { PageProps } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
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
    const { data, setData, post, processing, errors, reset } = useForm({
        customer_name: '',
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
            <DialogContent className="sm:max-w-md border-slate-200 shadow-none">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-amber-500" /> Walk-in Quick Book
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4 pt-2">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Customer Name</Label>
                        <Input
                            value={data.customer_name}
                            onChange={e => setData('customer_name', e.target.value)}
                            className="h-10 bg-slate-50 border-slate-200 focus:bg-white rounded-lg"
                            placeholder="e.g. John Doe"
                            required
                        />
                        {errors.customer_name && <p className="text-xs text-red-500">{errors.customer_name}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Service</Label>
                        <Select value={data.service_id} onValueChange={v => setData('service_id', v ?? '')}>
                            <SelectTrigger className="h-10 bg-slate-50 border-slate-200 focus:bg-white rounded-lg">
                                <SelectValue placeholder="Select service" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                                {walkin.services.map(s => (
                                    <SelectItem key={s.id} value={String(s.id)}>
                                        {s.name} — {formatCents(s.price)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.service_id && <p className="text-xs text-red-500">{errors.service_id}</p>}
                    </div>
                    {!walkin.is_barber && (
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Barber</Label>
                            <Select value={data.barber_id} onValueChange={v => setData('barber_id', v ?? '')}>
                                <SelectTrigger className="h-10 bg-slate-50 border-slate-200 focus:bg-white rounded-lg">
                                    <SelectValue placeholder="Select barber" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                                    {walkin.barbers.map(b => (
                                        <SelectItem key={b.id} value={String(b.id)}>{b.user.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.barber_id && <p className="text-xs text-red-500">{errors.barber_id}</p>}
                        </div>
                    )}
                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={onClose} className="text-slate-500">Cancel</Button>
                        <Button type="submit" disabled={processing} className="bg-slate-900 text-white hover:bg-slate-800 shadow-none">
                            Book Now
                        </Button>
                    </DialogFooter>
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

const navItems: NavItem[] = [
    {
        label: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
        active: 'dashboard',
    },
    {
        label: 'Appointments',
        href: '/appointments',
        icon: CalendarDays,
        active: 'appointments.*',
    },
    {
        label: 'Schedule',
        href: '/schedule',
        icon: LayoutGrid,
        active: 'schedule.*',
    },
    {
        label: 'Services',
        href: '/services',
        icon: Scissors,
        active: 'services.*',
        roles: ['platform-admin', 'shop-admin'],
    },
    {
        label: 'Products',
        href: '/products',
        icon: Package,
        active: 'products.*',
        roles: ['shop-admin', 'platform-admin'],
    },
    {
        label: 'Customers',
        href: '/customers',
        icon: Users,
        active: 'customers.*',
        roles: ['platform-admin', 'shop-admin'],
    },
    {
        label: 'Barbers',
        href: '/barbers',
        icon: Briefcase,
        active: 'barbers.*',
        roles: ['platform-admin', 'shop-admin'],
    },
    {
        label: 'Time Off',
        href: '/barbers/time-off',
        icon: PalmtreeIcon,
        active: 'barbers.time-off.*',
        roles: ['platform-admin', 'shop-admin'],
    },
];

// Bottom nav items for mobile (most important 4)
const mobileBottomNav: NavItem[] = [
    { label: 'Home', href: '/dashboard', icon: LayoutDashboard, active: 'dashboard' },
    { label: 'Appts', href: '/appointments', icon: CalendarDays, active: 'appointments.*' },
    { label: 'Schedule', href: '/schedule', icon: LayoutGrid, active: 'schedule.*' },
    { label: 'Products', href: '/products', icon: Package, active: 'products.*', roles: ['shop-admin', 'platform-admin'] },
    { label: 'Profile', href: '/profile', icon: User, active: 'profile.*' },
];

export default function AppLayout({
    children,
    title,
    actions,
}: PropsWithChildren<{ title?: string; actions?: ReactNode }>) {
    const { auth, walkin } = usePage<PageProps & { walkin: WalkinProps | null }>().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [walkinOpen, setWalkinOpen] = useState(false);

    useEffect(() => {
        setSidebarOpen(false);
    }, [route().current()]);

    const visibleNavItems = navItems.filter(
        (item) => !item.roles || item.roles.some((r) => auth.roles.includes(r)),
    );

    const visibleMobileNav = mobileBottomNav.filter(
        (item) => !item.roles || item.roles.some((r) => auth.roles.includes(r)),
    );

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
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
                            <Scissors size={16} />
                        </div>
                        {!isCollapsed && <span className="text-lg font-semibold tracking-tight">TrimFlow</span>}
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
                        {!isCollapsed && <h3 className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">Workspace</h3>}
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
                        {!isCollapsed && <h3 className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">Account</h3>}

                        <SidebarLink
                            href={route('profile.edit')}
                            icon={User}
                            label="My Profile"
                            active={route().current('profile.edit')}
                        />

                        <SidebarLink
                            onClick={() => router.post(route('logout'))}
                            icon={LogOut}
                            label="Sign Out"
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
                        {isCollapsed ? <ChevronRight size={16} /> : <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest"><ChevronLeft size={14} /> Collapse</div>}
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                {/* Header */}
                <header className="flex h-14 lg:h-16 shrink-0 items-center justify-between border-b border-slate-200 px-4 lg:px-8">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 -ml-1 text-slate-600 hover:bg-slate-50 rounded-md"
                        >
                            <Menu size={20} />
                        </button>
                        <h1 className="text-sm font-semibold text-slate-900">{title}</h1>
                    </div>
                    <div className="flex items-center gap-2 lg:gap-3">
                        {walkin && (
                            <button
                                onClick={() => setWalkinOpen(true)}
                                className="flex items-center gap-1.5 h-9 px-3 lg:px-4 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors"
                            >
                                <Zap className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">Walk-in</span>
                            </button>
                        )}
                        {actions}
                        <button
                            onClick={() => document.dispatchEvent(new Event('open-command-palette'))}
                            className="hidden sm:flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-700 hover:border-slate-300 transition-colors text-xs"
                            title="Search (Ctrl+K)"
                        >
                            <Search size={13} />
                            <span className="text-[11px] font-medium">⌘K</span>
                        </button>
                        <LanguageSwitcher compact />
                        <Link
                            href={route('notifications.index')}
                            className="relative p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                        >
                            <Bell size={18} />
                            {auth.unread_notifications > 0 && (
                                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 text-[9px] font-bold text-white">
                                    {auth.unread_notifications > 9 ? '9+' : auth.unread_notifications}
                                </span>
                            )}
                        </Link>
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
                        Walk-in
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

            <CommandPalette />
        </div>
    );
}
