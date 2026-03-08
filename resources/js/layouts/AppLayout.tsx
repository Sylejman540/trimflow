import { Link, router, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useState, useEffect } from 'react';
import {
    Calendar,
    LayoutDashboard,
    LogOut,
    Menu,
    Scissors,
    User,
    X,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PageProps } from '@/types';

export default function AppLayout({
    children,
    title,
    actions,
}: PropsWithChildren<{ title?: string; actions?: ReactNode }>) {
    const { auth } = usePage<PageProps>().props;
    const [mobileOpen, setMobileOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        setMobileOpen(false);
    }, [route().current()]);

    const NavItem = ({ href, icon: Icon, label, activePattern }: { href: string; icon: any; label: string; activePattern: string }) => {
        const active = route().current(activePattern);
        return (
            <Link
                href={href}
                className={cn(
                    'group flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    active 
                        ? 'bg-slate-100 text-slate-900' 
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                )}
            >
                <Icon className={cn('h-4 w-4 shrink-0', active ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-900')} />
                {!isCollapsed && <span>{label}</span>}
            </Link>
        );
    };

    return (
        <div className="flex h-screen overflow-hidden bg-white font-sans text-slate-900">
            {/* --- SIDEBAR --- */}
            <aside
                className={cn(
                    'relative hidden lg:flex flex-col border-r border-slate-200 bg-white transition-all duration-300 ease-in-out',
                    isCollapsed ? 'w-20' : 'w-64'
                )}
            >
                {/* Brand Header */}
                <div className="flex h-16 items-center px-6 shrink-0">
                    <Link href="/dashboard" className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900">
                            <Scissors className="h-4 w-4 text-white" />
                        </div>
                        {!isCollapsed && (
                            <span className="text-lg font-semibold tracking-tight text-slate-900">TrimFlow</span>
                        )}
                    </Link>
                </div>

                {/* Sidebar Navigation */}
                <div className="flex-1 px-4 py-6 space-y-8 overflow-y-auto">
                    {/* WORKSPACE GROUP */}
                    <div className="space-y-1">
                        {!isCollapsed && (
                            <h3 className="px-3 mb-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
                                Workspace
                            </h3>
                        )}
                        <NavItem href="/dashboard" icon={LayoutDashboard} label="Dashboard" activePattern="dashboard" />
                        <NavItem href="/appointments" icon={Calendar} label="Appointments" activePattern="appointments.*" />
                    </div>

                    {/* ACCOUNT GROUP */}
                    <div className="space-y-1">
                        {!isCollapsed && (
                            <h3 className="px-3 mb-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
                                Account
                            </h3>
                        )}
                        <NavItem href={route('profile.edit')} icon={User} label="My Profile" activePattern="profile.edit" />
                        <button
                            onClick={() => router.post(route('logout'))}
                            className={cn(
                                "w-full group flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all",
                                isCollapsed && "justify-center"
                            )}
                        >
                            <LogOut className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-red-600" />
                            {!isCollapsed && <span>Sign Out</span>}
                        </button>
                    </div>
                </div>

                {/* User Profile Section */}
                <div className="mt-auto border-t border-slate-200 p-4 bg-white">
                    <div className={cn(
                        "flex items-center gap-3 rounded-xl transition-all",
                        !isCollapsed && "px-2 py-2"
                    )}>
                        <div className="h-9 w-9 shrink-0 flex items-center justify-center rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold shadow-sm">
                            {auth.user.name.charAt(0).toUpperCase()}
                        </div>
                        
                        {!isCollapsed && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-900 truncate">
                                    {auth.user.name}
                                </p>
                                <p className="text-xs text-slate-500 truncate capitalize">
                                    {auth.roles[0]?.replace('-', ' ') || 'Partner'}
                                </p>
                            </div>
                        )}
                    </div>
                    
                    {/* Collapse Toggle Button */}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="mt-4 flex w-full items-center justify-center py-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100"
                    >
                        {isCollapsed ? <ChevronRight size={16} /> : <div className="flex items-center gap-2 text-xs font-medium"><ChevronLeft size={14} /> Collapse</div>}
                    </button>
                </div>
            </aside>

            {/* --- MAIN CONTENT AREA --- */}
            {/* Unchanged as per instructions */}
            <div className="flex-1 flex flex-col overflow-hidden bg-white">
                <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-8 lg:px-12">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 text-slate-600 hover:bg-slate-50 rounded-md">
                            <Menu size={24} />
                        </button>
                        <h1 className="text-sm font-semibold text-slate-900">{title}</h1>
                    </div>
                    <div className="flex items-center gap-4">{actions}</div>
                </header>

                <main className="flex-1 overflow-y-auto p-8 lg:p-12">
                    <div className="max-w-[1400px] mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}