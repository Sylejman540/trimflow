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
import { Separator } from '@/components/ui/separator';
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

    const visibleNavItems = navItems.filter(
        (item) => !item.roles || item.roles.some((r) => auth.roles.includes(r)),
    );

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r bg-sidebar text-sidebar-foreground transition-transform lg:static lg:translate-x-0',
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full',
                )}
            >
                {/* Logo */}
                <div className="flex h-14 items-center gap-2 px-4">
                    <Scissors className="h-5 w-5 text-amber-500" />
                    <span className="text-lg font-semibold tracking-tight">
                        TrimFlow
                    </span>
                    <button
                        className="ml-auto lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <Separator className="bg-sidebar-border" />

                {/* Company */}
                {auth.company && (
                    <div className="px-4 py-3">
                        <p className="text-xs font-medium text-sidebar-foreground/60">
                            Workspace
                        </p>
                        <p className="mt-0.5 truncate text-sm font-medium">
                            {auth.company.name}
                        </p>
                    </div>
                )}

                {/* Navigation */}
                <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
                    {visibleNavItems.map((item) => {
                        const active = isActive(item.active);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                                    active
                                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                                        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground',
                                )}
                            >
                                {item.icon}
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <Separator className="bg-sidebar-border" />

                {/* User menu at bottom */}
                <div className="p-3">
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            render={<button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground" />}
                        >
                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sidebar-accent text-xs font-semibold text-sidebar-accent-foreground">
                                    {auth.user.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="truncate text-sm font-medium leading-none">
                                        {auth.user.name}
                                    </p>
                                    <p className="mt-0.5 truncate text-xs text-sidebar-foreground/50">
                                        {auth.roles[0] ?? 'user'}
                                    </p>
                                </div>
                                <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
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
                <header className="flex h-14 shrink-0 items-center gap-4 border-b bg-background px-4 lg:px-6">
                    <button
                        className="lg:hidden"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu className="h-5 w-5" />
                    </button>

                    {title && (
                        <h1 className="text-lg font-semibold">{title}</h1>
                    )}

                    <div className="ml-auto flex items-center gap-2">
                        {actions}
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
