import { Link, router, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useState, useEffect } from 'react';
import {
    CalendarDays,
    ChevronDown,
    LayoutDashboard,
    LogOut,
    Menu,
    Scissors,
    Settings,
    User,
    X,
    Briefcase,
    ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PageProps } from '@/types';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NavItem {
    label: string;
    href: string;
    icon: ReactNode;
    active: string;
    roles?: string[];
}

const navItems: NavItem[] = [
    {
        label: 'Dashboard',
        href: '/dashboard',
        icon: <LayoutDashboard className="h-4 w-4" />,
        active: 'dashboard',
    },
    {
        label: 'Appointments',
        href: '/appointments',
        icon: <CalendarDays className="h-4 w-4" />,
        active: 'appointments.*',
    },
    {
        label: 'Services',
        href: '/services',
        icon: <Scissors className="h-4 w-4" />,
        active: 'services.*',
        roles: ['platform-admin', 'shop-admin'],
    },
    {
        label: 'Barbers',
        href: '/barbers',
        icon: <Briefcase className="h-4 w-4" />,
        active: 'barbers.*',
        roles: ['platform-admin', 'shop-admin'],
    },
];

function isActive(pattern: string): boolean {
    return route().current(pattern) ?? false;
}

export default function AppLayout({
    children,
    title,
    actions,
}: PropsWithChildren<{ title?: string; actions?: ReactNode }>) {
    const { auth } = usePage<PageProps>().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Close sidebar on route change (for mobile)
    useEffect(() => {
        setSidebarOpen(false);
    }, [route().current()]);

    const visibleNavItems = navItems.filter(
        (item) => !item.roles || item.roles.some((r) => auth.roles.includes(r)),
    );

    return (
        <div className="flex h-screen overflow-hidden bg-[#FDFDFD]">
            {/* Mobile Overlay - Clicking this closes the sidebar */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden transition-opacity"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col bg-slate-950 border-r border-white/5 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0',
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full',
                )}
            >
                {/* Logo Section */}
                <div className="flex h-20 items-center justify-between px-6">
                    <Link href="/dashboard" className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                            <Scissors className="h-5 w-5 text-slate-950" />
                        </div>
                        <span className="text-sm font-black tracking-widest text-white uppercase">
                            TrimFlow
                        </span>
                    </Link>
                    <button
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-slate-400 hover:text-white lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>


                {/* Main Navigation */}
                <nav className="flex-1 space-y-1 overflow-y-auto px-4">
                    {visibleNavItems.map((item) => {
                        const active = isActive(item.active);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'group flex items-center gap-3 rounded-xl px-4 py-3 text-[13px] font-bold tracking-tight transition-all duration-200',
                                    active
                                        ? 'bg-white text-slate-950 shadow-[0_10px_20px_rgba(0,0,0,0.4)]'
                                        : 'text-slate-400 hover:bg-white/5 hover:text-white',
                                )}
                            >
                                <span className={cn(
                                    'transition-colors',
                                    active ? 'text-slate-950' : 'text-slate-500 group-hover:text-white',
                                )}>
                                    {item.icon}
                                </span>
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Footer Section */}
                <div className="mt-auto border-t border-white/5 p-4">
                    <DropdownMenu>
                        <DropdownMenuTrigger className="w-full">
                            <div className="flex w-full items-center gap-3 rounded-2xl p-2 transition-colors hover:bg-white/5">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 text-xs font-black text-white shadow-inner">
                                    {auth.user.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="truncate text-sm font-bold text-white leading-tight">
                                        {auth.user.name}
                                    </p>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <ShieldCheck className="h-3 w-3 text-emerald-500" />
                                        <p className="truncate text-[10px] font-black uppercase tracking-widest text-slate-500">
                                            {auth.roles[0]?.replace('-', ' ') ?? 'Member'}
                                        </p>
                                    </div>
                                </div>
                                <ChevronDown className="h-4 w-4 text-slate-600 group-hover:text-white transition-transform" />
                            </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            side="right"
                            align="end"
                            className="w-56 bg-slate-900 border-white/10 text-white"
                        >
                            <DropdownMenuItem className="focus:bg-white/10 focus:text-white cursor-pointer" onClick={() => router.get(route('profile.edit'))}>
                                <User className="mr-2 h-4 w-4" />
                                My Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem className="focus:bg-white/10 focus:text-white cursor-pointer" onClick={() => router.get(route('profile.edit'))}>
                                <Settings className="mr-2 h-4 w-4" />
                                Shop Settings
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-white/5" />
                            <DropdownMenuItem
                                className="text-red-400 focus:bg-red-500/10 focus:text-red-400 cursor-pointer"
                                onClick={() => router.post(route('logout'))}
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                Log Out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Modern Header */}
                <header className="flex h-20 shrink-0 items-center justify-between border-b border-slate-100 bg-white px-6 lg:px-10">
                    <div className="flex items-center gap-4">
                        <button
                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-500 hover:bg-slate-100 lg:hidden transition-colors"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu className="h-5 w-5" />
                        </button>

                        {title && (
                            <h1 className="text-xl font-black tracking-tighter text-slate-950">
                                {title}
                            </h1>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        {actions}
                    </div>
                </header>

                {/* Main Scrollable Area */}
                <main className="flex-1 overflow-y-auto bg-[#F9FAFB] p-6 lg:p-10">
                    <div className="mx-auto max-w-7xl">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}