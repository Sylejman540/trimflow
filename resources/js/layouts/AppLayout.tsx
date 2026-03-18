import { Link, router, usePage, useForm } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useState, useEffect, useRef, FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import GlobalSearch from '@/components/GlobalSearch';
import { initializeUserLanguage } from '@/i18n';
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
    Zap,
    X,
    Package,
    Settings,
    BarChart2,
    Link2,
    Copy,
    Check,
    History,
} from 'lucide-react';
import { cn, formatCents } from '@/lib/utils';
import { PageProps } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
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

function playNotificationSound(type: 'default' | 'bell' | 'chime' | 'ping' = 'default') {
    console.log('Playing notification sound:', type);
    try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        console.log('Audio context created, state:', audioContext.state);

        const now = audioContext.currentTime;

        if (type === 'default') {
            // Two beeps - 800Hz then 1000Hz
            const osc1 = audioContext.createOscillator();
            const gain1 = audioContext.createGain();
            osc1.connect(gain1);
            gain1.connect(audioContext.destination);
            osc1.frequency.value = 800;
            osc1.type = 'sine';
            gain1.gain.setValueAtTime(0.3, now);
            gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
            osc1.start(now);
            osc1.stop(now + 0.15);

            const osc2 = audioContext.createOscillator();
            const gain2 = audioContext.createGain();
            osc2.connect(gain2);
            gain2.connect(audioContext.destination);
            osc2.frequency.value = 1000;
            osc2.type = 'sine';
            gain2.gain.setValueAtTime(0.3, now + 0.2);
            gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
            osc2.start(now + 0.2);
            osc2.stop(now + 0.35);
        } else if (type === 'bell') {
            // Bell sound - three ascending tones
            const frequencies = [523.25, 659.25, 783.99]; // C, E, G (major chord)
            frequencies.forEach((freq, idx) => {
                const osc = audioContext.createOscillator();
                const gain = audioContext.createGain();
                osc.connect(gain);
                gain.connect(audioContext.destination);
                osc.frequency.value = freq;
                osc.type = 'sine';
                const startTime = now + idx * 0.1;
                gain.gain.setValueAtTime(0.2, startTime);
                gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);
                osc.start(startTime);
                osc.stop(startTime + 0.2);
            });
        } else if (type === 'chime') {
            // Chime - high pitched descending tones
            const frequencies = [1046.50, 783.99, 587.33]; // C, G, D (descending)
            frequencies.forEach((freq, idx) => {
                const osc = audioContext.createOscillator();
                const gain = audioContext.createGain();
                osc.connect(gain);
                gain.connect(audioContext.destination);
                osc.frequency.value = freq;
                osc.type = 'sine';
                const startTime = now + idx * 0.12;
                gain.gain.setValueAtTime(0.25, startTime);
                gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.25);
                osc.start(startTime);
                osc.stop(startTime + 0.25);
            });
        } else if (type === 'ping') {
            // Single high ping
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            osc.connect(gain);
            gain.connect(audioContext.destination);
            osc.frequency.value = 1200;
            osc.type = 'sine';
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
        }

        console.log('Sound playing completed');
    } catch (e) {
        // Audio context not supported
        console.warn('Notification sound not supported:', e);
    }
}

function WalkinModal({ open, onClose, walkin }: { open: boolean; onClose: () => void; walkin: WalkinProps }) {
    const { t } = useTranslation();
    const [availableBarbers, setAvailableBarbers] = useState<WalkinBarber[]>([]);
    const [loadingBarbers, setLoadingBarbers] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        customer_name: '',
        service_id: '',
        barber_id: '',
    });

    // Fetch available barbers when service is selected
    useEffect(() => {
        if (!data.service_id) {
            setAvailableBarbers(walkin.barbers);
            return;
        }

        setLoadingBarbers(true);
        const selectedService = walkin.services.find(s => String(s.id) === data.service_id);
        if (!selectedService) {
            setAvailableBarbers([]);
            setLoadingBarbers(false);
            return;
        }

        // Fetch available barbers for this service at current time
        fetch(route('walkin.availability', { service_id: data.service_id }))
            .then(r => r.json())
            .then((json: { barbers: number[] }) => {
                const available = walkin.barbers.filter(b => json.barbers.includes(b.id));
                setAvailableBarbers(available);
                // Reset barber selection if previously selected barber is no longer available
                if (data.barber_id && !available.find(b => String(b.id) === data.barber_id)) {
                    setData('barber_id', '');
                }
            })
            .catch(() => setAvailableBarbers(walkin.barbers))
            .finally(() => setLoadingBarbers(false));
    }, [data.service_id]);

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
                        <Zap className="h-4 w-4 text-slate-900" /> {t('walkin.title')}
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
                            <SelectContent className="rounded-xl border-slate-200 shadow-xl w-[var(--radix-select-trigger-width)]">
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
                            {loadingBarbers ? (
                                <div className="h-11 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center">
                                    <p className="text-xs text-slate-400">{t('loading')}</p>
                                </div>
                            ) : !data.service_id ? (
                                <div className="h-11 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center">
                                    <p className="text-xs text-slate-400">{t('walkin.selectService')}</p>
                                </div>
                            ) : availableBarbers.length === 0 ? (
                                <div className="h-11 bg-red-50 border border-red-200 rounded-lg flex items-center justify-center">
                                    <p className="text-xs text-red-600 font-medium">{t('walkin.noBarbers')}</p>
                                </div>
                            ) : (
                                <Select value={data.barber_id} onValueChange={v => setData('barber_id', v ?? '')}>
                                    <SelectTrigger className="h-11 bg-slate-50 border-slate-200 focus:bg-white rounded-lg">
                                        <SelectValue placeholder={t('walkin.selectBarber')} />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-slate-200 shadow-xl w-[var(--radix-select-trigger-width)]">
                                        {availableBarbers.map(b => (
                                            <SelectItem key={b.id} value={String(b.id)}>{b.user.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
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

interface NavGroup {
    groupKey: string;
    items: {
        href: string;
        icon: React.ElementType;
        active: string;
        labelKey: string;
        descKey: string;
        roles?: string[];
    }[];
}

const navGroups: NavGroup[] = [
    {
        groupKey: 'nav.groupMain',
        items: [
            { href: '/dashboard',    icon: LayoutDashboard, active: 'dashboard',      labelKey: 'nav.dashboard',    descKey: 'nav.dashboardDesc' },
            { href: '/appointments', icon: CalendarDays,    active: 'appointments.*', labelKey: 'nav.appointments', descKey: 'nav.appointmentsDesc' },
            { href: '/appointments/history', icon: History, active: 'appointments.history', labelKey: 'nav.history', descKey: 'nav.historyDesc' },
        ],
    },
    {
        groupKey: 'nav.groupManage',
        items: [
            { href: '/barbers',          icon: Briefcase,   active: 'barbers.*',          labelKey: 'nav.barbers',   descKey: 'nav.barbersDesc',   roles: ['platform-admin', 'shop-admin'] },
            { href: '/services',         icon: Scissors,    active: 'services.*',         labelKey: 'nav.services',  descKey: 'nav.servicesDesc',  roles: ['platform-admin', 'shop-admin'] },
            { href: '/products',         icon: Package,     active: 'products.*',         labelKey: 'nav.products',  descKey: 'nav.productsDesc',  roles: ['shop-admin', 'platform-admin'] },
            { href: '/barbers/time-off', icon: PalmtreeIcon, active: 'barbers.time-off.*', labelKey: 'timeoff.title', descKey: 'nav.timeoffDesc' },
        ],
    },
    {
        groupKey: 'nav.groupInsights',
        items: [
            { href: '/reports',  icon: BarChart2, active: 'reports.*',  labelKey: 'nav.reports',  descKey: 'nav.reportsDesc',  roles: ['platform-admin', 'shop-admin'] },
            { href: '/settings', icon: Settings,  active: 'settings.*', labelKey: 'nav.settings', descKey: 'nav.settingsDesc' },
        ],
    },
];

const mobileNavConfig: Omit<NavItem, 'label'>[] = [
    { href: '/dashboard',    icon: LayoutDashboard, active: 'dashboard',      labelKey: 'nav.dashboard' },
    { href: '/appointments', icon: CalendarDays,    active: 'appointments.*', labelKey: 'nav.appointments' },
    { href: '/barbers',      icon: Briefcase,       active: 'barbers.*',      labelKey: 'nav.barbers',   roles: ['platform-admin', 'shop-admin'] },
    { href: '/services',     icon: Scissors,        active: 'services.*',     labelKey: 'nav.services',  roles: ['platform-admin', 'shop-admin'] },
    { href: '/settings',     icon: Settings,        active: 'settings.*',     labelKey: 'nav.settings' },
] as any[];

export default function AppLayout({
    children,
    title,
    actions,
    mobileAction,
}: PropsWithChildren<{ title?: string; actions?: ReactNode; mobileAction?: ReactNode }>) {
    const { auth, walkin, flash } = usePage<PageProps & { walkin: WalkinProps | null; flash: { success?: string; error?: string } }>().props;
    const [isCollapsed, setIsCollapsed] = useState(() => localStorage.getItem('sidebar_collapsed') === 'true');
    const [unreadCount, setUnreadCount] = useState(auth.unread_notifications ?? 0);
    const [hasUserClearedNotifications, setHasUserClearedNotifications] = useState(false);

    const toggleCollapsed = (val: boolean) => {
        localStorage.setItem('sidebar_collapsed', String(val));
        setIsCollapsed(val);
    };
    const navScrollRef = useRef<HTMLDivElement>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [walkinOpen, setWalkinOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [signOutOpen, setSignOutOpen] = useState(false);

    useEffect(() => {
        // Sync unread count from server props whenever it changes
        // But don't sync if user just cleared notifications
        if (!hasUserClearedNotifications) {
            console.log('Updating unread count from auth:', auth.unread_notifications);
            setUnreadCount(auth.unread_notifications ?? 0);
        }
    }, [auth.unread_notifications, hasUserClearedNotifications]);

    useEffect(() => {
        const companyId = auth.company?.id;
        if (!companyId || !window.Echo) return;

        // Listen for appointment changes
        const appointmentChannel = window.Echo.channel(`company.${companyId}.appointments`);
        appointmentChannel.listen('.AppointmentChanged', () => {
            router.reload({ only: ['appointments', 'stats', 'upcoming', 'recent'] });
        });

        // Listen for new notifications via appointment events
        appointmentChannel.listen('.NotificationCreated', (data: any) => {
            console.log('NotificationCreated event received:', data, 'current user:', auth.user.id);
            // Only increment if we have the right data structure
            if (data?.user_id === auth.user.id) {
                console.log('Notification is for current user');
                setUnreadCount(prev => prev + 1);

                // Play notification sound if enabled
                console.log('Sound enabled?', (auth.user as any).notifications_sound);
                if ((auth.user as any).notifications_sound) {
                    playNotificationSound('chime');
                }
            }
        });

        return () => { window.Echo.leave(`company.${companyId}.appointments`); };
    }, [auth.company?.id, auth.user.id]);

    function copyBookingLink() {
        const url = `${window.location.origin}/book/${auth.company?.slug}`;
        const done = () => {
            setCopied(true);
            toast.success(t('nav.copyBookingLink'));
            setTimeout(() => setCopied(false), 2000);
        };
        if (navigator.clipboard) {
            navigator.clipboard.writeText(url).then(done).catch(() => {
                const el = document.createElement('textarea');
                el.value = url;
                el.style.position = 'fixed';
                el.style.opacity = '0';
                document.body.appendChild(el);
                el.select();
                document.execCommand('copy');
                document.body.removeChild(el);
                done();
            });
        } else {
            const el = document.createElement('textarea');
            el.value = url;
            el.style.position = 'fixed';
            el.style.opacity = '0';
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
            done();
        }
    }
    const { t, i18n } = useTranslation();

    // Per-user language: load the user's saved language on mount
    useEffect(() => {
        const userLangKey = `fade_lang_${auth.user.id}`;
        const userLang = localStorage.getItem(userLangKey);
        if (userLang && userLang !== i18n.language) {
            i18n.changeLanguage(userLang);
        } else if (!userLang) {
            // First time this user — default to English
            i18n.changeLanguage('en');
        }
    }, [auth.user.id]);

    useEffect(() => { setSidebarOpen(false); }, [route().current()]);

    // Persist + restore sidebar scroll position across Inertia navigations
    useEffect(() => {
        const saved = sessionStorage.getItem('sidebar_scroll');
        if (saved && navScrollRef.current) {
            navScrollRef.current.scrollTop = parseInt(saved, 10);
        }
        // Save before every navigation (Inertia doesn't remount layout, so cleanup won't fire)
        const save = () => {
            if (navScrollRef.current) {
                sessionStorage.setItem('sidebar_scroll', String(navScrollRef.current.scrollTop));
            }
        };
        const unsub = router.on('before', save);
        return () => {
            unsub();
            save();
        };
    }, []);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const visibleNavGroups = navGroups.map(group => ({
        ...group,
        items: group.items
            .filter(item => !item.roles || item.roles.some(r => auth.roles.includes(r)))
            .map(item => ({ ...item, label: t(item.labelKey), desc: t(item.descKey) })),
    })).filter(group => group.items.length > 0);

    const visibleMobileNav = mobileNavConfig
        .filter((item: any) => !item.roles || item.roles.some((r: string) => auth.roles.includes(r)))
        .map((item: any) => ({ ...item, label: t(item.labelKey) }));

    const SidebarLink = ({
        href, icon: Icon, label, desc, active = false, onClick, variant = 'default',
    }: {
        href?: string; icon: any; label: string; desc?: string;
        active?: boolean; onClick?: () => void; variant?: 'default' | 'danger';
    }) => {
        const className = cn(
            'group flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 w-full',
            active
                ? 'bg-slate-100 text-slate-900'
                : variant === 'danger'
                    ? 'text-slate-500 hover:bg-red-50 hover:text-red-600'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900',
            isCollapsed && 'justify-center px-0'
        );

        const content = (
            <>
                <div className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors',
                    variant === 'danger'
                        ? 'bg-slate-100 text-slate-400 group-hover:bg-red-100 group-hover:text-red-600'
                        : active ? 'bg-slate-200 text-slate-900' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200 group-hover:text-slate-700'
                )}>
                    <Icon className="h-4 w-4" />
                </div>
                {!isCollapsed && (
                    <div className="flex-1 min-w-0">
                        <p className={cn('text-sm font-semibold leading-tight', active ? 'text-slate-900' : 'text-slate-700')}>{label}</p>
                        {desc && <p className="text-[11px] text-slate-400 leading-tight mt-0.5 truncate">{desc}</p>}
                    </div>
                )}
            </>
        );

        if (onClick) return <button onClick={onClick} className={cn(className, 'text-left')}>{content}</button>;
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
                    <Link href="/dashboard" className="flex items-center gap-4">
                        <svg width="32" height="32" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 2 L34 18 L18 34 L2 18 Z" fill="#111827" />
                            <text x="18" y="24" textAnchor="middle" fontFamily="'Bebas Neue', sans-serif" fontSize="20" fontWeight="900" fill="#ffffff" letterSpacing="-0.5">F</text>
                        </svg>
                        {!isCollapsed && (
                            <span className="text-xl font-black tracking-tight text-slate-900" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.04em' }}>
                                Fade
                            </span>
                        )}
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
                <div ref={navScrollRef} className="flex-1 px-3 py-4 overflow-y-auto space-y-5">
                    {visibleNavGroups.map(group => (
                        <div key={group.groupKey} className="space-y-0.5">
                            {!isCollapsed && (
                                <p className="px-3 mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">{t(group.groupKey)}</p>
                            )}
                            {group.items.map(item => (
                                <SidebarLink
                                    key={item.href}
                                    href={item.href}
                                    icon={item.icon}
                                    label={item.label}
                                    desc={item.desc}
                                    active={route().current(item.active)}
                                />
                            ))}
                        </div>
                    ))}
                </div>

                {/* Account Section */}
                <div className="border-t border-slate-200 p-4 space-y-4">
                    <div className="space-y-1">
                        <SidebarLink
                            onClick={() => setSignOutOpen(true)}
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
                        onClick={() => toggleCollapsed(!isCollapsed)}
                        className="hidden lg:flex w-full items-center justify-center py-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                        {isCollapsed ? <ChevronRight size={16} /> : <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest"><ChevronLeft size={14} /> {t('walkin.collapse')}</div>}
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                {/* Header */}
                <header className="flex h-14 lg:h-16 shrink-0 items-center justify-between border-b border-slate-200 px-3 sm:px-4 lg:px-8">
                    {/* Krahu i Majtë: Menu & Titulli */}
                    <div className="flex items-center gap-2 min-w-0">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-50 rounded-md transition-colors shrink-0"
                        >
                            <Menu size={20} />
                        </button>
                        <h1 className="text-sm font-bold text-slate-900 tracking-tight leading-none truncate">
                            {title}
                        </h1>
                    </div>

                    {/* Krahu i Djathtë: Actions, Walk-in, Lang, Notifications */}
                    <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 shrink-0">
                        {/* Butonat specifikë të faqes (p.sh. Add, Export) */}
                        {actions && (
                            <div className="flex items-center gap-1 sm:gap-1.5">
                                {actions}
                            </div>
                        )}

                        {/* Ndarësi vizual nëse ka actions dhe walkin */}
                        {actions && walkin && (
                            <div className="w-px h-4 bg-slate-200 mx-1 hidden sm:block" />
                        )}

                        {/* Walk-in Button — desktop only (mobile uses bottom nav) */}
                        {walkin && (
                            <button
                                onClick={() => setWalkinOpen(true)}
                                className="hidden sm:flex items-center gap-1.5 h-9 px-3 lg:px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-[11px] font-bold transition-all shadow-sm active:scale-95 shrink-0"
                            >
                                <Zap className="h-4 w-4 sm:h-3.5 sm:w-3.5 fill-current" />
                                {t('dash.walkin')}
                            </button>
                        )}

                        {/* Booking Link - Navigate to booking page */}
                        {auth.company?.slug && (
                            <a
                                href={`/book/${auth.company.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center w-9 h-9 sm:w-9 sm:h-9 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-colors shrink-0 sm:border sm:border-slate-200"
                                title={t('nav.bookingLink')}
                            >
                                <Link2 className="h-5 w-5 sm:h-5 sm:w-5" />
                            </a>
                        )}

                        {/* Language & Notifications */}
                        <div className="flex items-center gap-1">
                            <div className="flex items-center h-9">
                                <LanguageSwitcher compact userId={auth.user.id} />
                            </div>

                            <Link
                                href={route('notifications.index')}
                                onClick={() => {
                                    setUnreadCount(0);
                                    setHasUserClearedNotifications(true);
                                }}
                                className="relative flex items-center justify-center w-9 h-9 sm:w-9 sm:h-9 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                            >
                                <Bell size={20} className="sm:w-[18px] sm:h-[18px]" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 text-[9px] font-bold text-white ring-2 ring-white">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </Link>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className={cn('flex-1 overflow-y-auto p-3 lg:p-6 bg-white lg:pb-6', mobileAction ? 'pb-36' : 'pb-24')}>
                    <div className="max-w-[1400px] mx-auto">{children}</div>
                </main>
            </div>

            {/* Mobile Primary Action — sits above bottom nav */}
            {mobileAction && (
                <div className="lg:hidden fixed bottom-16 inset-x-0 z-20 px-3 pb-3">
                    {mobileAction}
                </div>
            )}

            {/* Mobile Bottom Nav */}
            <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-slate-200">
                <div className="flex items-stretch h-14 overflow-x-auto">
                    {visibleMobileNav.map((item) => {
                        const Icon = item.icon;
                        const isActive = route().current(item.active);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'flex flex-col items-center justify-center gap-0.5 flex-1 active:scale-95 transition-all border-t-2',
                                    isActive ? 'text-slate-900 border-slate-900 bg-slate-50' : 'text-slate-400 border-transparent'
                                )}
                            >
                                <Icon className="h-5 w-5" />
                                <span className="text-[9px] font-medium leading-none">{item.label}</span>
                            </Link>
                        );
                    })}
                    {walkin && (
                        <button
                            onClick={() => setWalkinOpen(true)}
                            className="flex flex-col items-center justify-center gap-0.5 flex-1 active:scale-95 transition-transform text-slate-900"
                        >
                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900">
                                <Zap className="h-3.5 w-3.5 text-white fill-white" />
                            </div>
                            <span className="text-[9px] font-medium leading-none">{t('walkin.button')}</span>
                        </button>
                    )}
                </div>
            </nav>

            {walkin && (
                <WalkinModal
                    open={walkinOpen}
                    onClose={() => setWalkinOpen(false)}
                    walkin={walkin}
                />
            )}

            {/* Sign out confirm dialog */}
            <Dialog open={signOutOpen} onOpenChange={setSignOutOpen}>
                <DialogContent className="sm:max-w-sm border-slate-200 shadow-none">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <LogOut className="h-4 w-4 text-red-500" /> {t('nav.signOut')}
                        </DialogTitle>
                        <DialogDescription>{t('nav.signOutConfirm')}</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSignOutOpen(false)} className="border-slate-200 shadow-none">
                            {t('cancel')}
                        </Button>
                        <Button
                            variant="destructive"
                            className="shadow-none"
                            onClick={() => {
                                localStorage.removeItem(`fade_lang_${auth.user.id}`);
                                router.post(route('logout'));
                            }}
                        >
                            {t('nav.signOut')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <GlobalSearch />
            <Toaster position="bottom-right" richColors closeButton />
        </div>
    );
}
