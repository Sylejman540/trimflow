import { Link, router, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useState } from 'react';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { PageProps } from '@/types';

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
        icon: <LayoutDashboard className="h-[18px] w-[18px]" />,
        active: 'dashboard',
    },
    {
        label: 'Appointments',
        href: '/appointments',
        icon: <CalendarDays className="h-[18px] w-[18px]" />,
        active: 'appointments.*',
    },
    {
        label: 'Services',
        href: '/services',
        icon: <Scissors className="h-[18px] w-[18px]" />,
        active: 'services.*',
        roles: ['platform-admin', 'shop-admin'],
    },
    {
        label: 'Barbers',
        href: '/barbers',
        icon: <Briefcase className="h-[18px] w-[18px]" />,
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

    const visibleNavItems = navItems.filter(
        (item) => !item.roles || item.roles.some((r) => auth.roles.includes(r)),
    );

    return (
        <div className="flex h-screen overflow-hidden bg-[#F9FAFB]">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col bg-gray-950 transition-transform duration-200 lg:static lg:translate-x-0',
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full',
                )}
            >
                {/* Logo */}
                <div className="flex h-16 items-center gap-2.5 px-5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                        <Scissors className="h-4 w-4 text-amber-400" />
                    </div>
                    <span className="text-[15px] font-bold tracking-tight text-white uppercase">
                        TrimFlow
                    </span>
                    <button
                        className="ml-auto rounded-md p-1 text-gray-500 hover:text-white lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Company */}
                {auth.company && (
                    <div className="mx-4 mb-1 rounded-lg bg-white/5 px-3 py-2.5">
                        <p className="text-[11px] font-medium uppercase tracking-wider text-gray-500">
                            Workspace
                        </p>
                        <p className="mt-0.5 truncate text-sm font-medium text-gray-200">
                            {auth.company.name}
                        </p>
                    </div>
                )}

                {/* Navigation */}
                <nav className="mt-2 flex-1 space-y-0.5 overflow-y-auto px-3">
                    {visibleNavItems.map((item) => {
                        const active = isActive(item.active);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors',
                                    active
                                        ? 'bg-white/10 text-white'
                                        : 'text-gray-400 hover:bg-white/5 hover:text-gray-200',
                                )}
                            >
                                <span className={cn(
                                    'transition-colors',
                                    active ? 'text-amber-400' : 'text-gray-500 group-hover:text-gray-400',
                                )}>
                                    {item.icon}
                                </span>
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* User menu at bottom */}
                <div className="border-t border-white/5 p-3">
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            render={
                                <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-white/5" />
                            }
                        >
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/15 text-xs font-bold text-amber-400">
                                {auth.user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 text-left">
                                <p className="truncate text-[13px] font-medium text-gray-200 leading-none">
                                    {auth.user.name}
                                </p>
                                <p className="mt-1 truncate text-[11px] capitalize text-gray-500">
                                    {auth.roles[0]?.replace('-', ' ') ?? 'user'}
                                </p>
                            </div>
                            <ChevronDown className="h-4 w-4 shrink-0 text-gray-600" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            side="top"
                            align="start"
                            className="w-56"
                        >
                            <DropdownMenuItem render={<Link href={route('profile.edit')} />}>
                                <User className="mr-2 h-4 w-4" />
                                Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem render={<Link href={route('profile.edit')} />}>
                                <Settings className="mr-2 h-4 w-4" />
                                Settings
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => router.post(route('logout'))}
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                Log Out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Top bar */}
                <header className="flex h-16 shrink-0 items-center gap-4 border-b border-gray-200/80 bg-white px-5 lg:px-8">
                    <button
                        className="rounded-md p-1 text-gray-400 hover:text-gray-600 lg:hidden"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu className="h-5 w-5" />
                    </button>

                    {title && (
                        <h1 className="text-lg font-bold tracking-tight text-gray-900">
                            {title}
                        </h1>
                    )}

                    <div className="ml-auto flex items-center gap-3">
                        {actions}
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto p-5 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
