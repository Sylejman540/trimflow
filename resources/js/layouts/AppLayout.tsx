import { Link, router, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useState, useEffect } from 'react';
import {
    CalendarDays,
    LayoutDashboard,
    LogOut,
    Menu,
    Scissors,
    Settings,
    User,
    Briefcase,
    ChevronLeft,
    ChevronRight,
    X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PageProps } from '@/types';

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
        label: 'Services',
        href: '/services',
        icon: Scissors,
        active: 'services.*',
        roles: ['platform-admin', 'shop-admin'],
    },
    {
        label: 'Barbers',
        href: '/barbers',
        icon: Briefcase,
        active: 'barbers.*',
        roles: ['platform-admin', 'shop-admin'],
    },
];

export default function AppLayout({
    children,
    title,
    actions,
}: PropsWithChildren<{ title?: string; actions?: ReactNode }>) {
    const { auth } = usePage<PageProps>().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        setSidebarOpen(false);
    }, [route().current()]);

    const visibleNavItems = navItems.filter(
        (item) => !item.roles || item.roles.some((r) => auth.roles.includes(r)),
    );

    // Helper to render a sidebar link consistently
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
            'group flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 w-full',
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
        <div className="flex h-screen overflow-hidden bg-white font-sans text-slate-900">
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 bg-slate-900/10 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Sidebar */}
            <aside className={cn(
                'fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-200 bg-white transition-all duration-300 lg:static lg:translate-x-0',
                isCollapsed ? 'w-20' : 'w-64',
                sidebarOpen ? 'translate-x-0' : '-translate-x-full',
            )}>
                {/* Brand */}
                <div className="flex h-16 items-center px-6 shrink-0">
                    <Link href="/dashboard" className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
                            <Scissors size={16} />
                        </div>
                        {!isCollapsed && <span className="text-lg font-semibold tracking-tight">TrimFlow</span>}
                    </Link>
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

                {/* Account Section (Always Visible) */}
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
                        <div className="h-8 w-8 shrink-0 flex items-center justify-center rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold">
                            {auth.user.name.charAt(0).toUpperCase()}
                        </div>
                        {!isCollapsed && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold truncate">{auth.user.name}</p>
                                <p className="text-[11px] text-slate-500 truncate capitalize">{auth.roles[0]?.replace('-', ' ')}</p>
                            </div>
                        )}
                    </div>

                    {/* Collapse Button */}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="hidden lg:flex w-full items-center justify-center py-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                        {isCollapsed ? <ChevronRight size={16} /> : <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest"><ChevronLeft size={14} /> Collapse</div>}
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden bg-white">
                <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-8">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-slate-600 hover:bg-slate-50 rounded-md">
                            <Menu size={20} />
                        </button>
                        <h1 className="text-sm font-semibold text-slate-900">{title}</h1>
                    </div>
                    <div className="flex items-center gap-4">{actions}</div>
                </header>

                <main className="flex-1 overflow-y-auto p-8 bg-white">
                    <div className="max-w-[1400px] mx-auto">{children}</div>
                </main>
            </div>
        </div>
    );
}