import React, { useState, useEffect, useRef, FormEvent } from 'react';
// Load Bebas Neue from Google Fonts
if (typeof document !== 'undefined') {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap';
    document.head.appendChild(link);
}
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Menu, X, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LANGUAGES, initializeUserLanguage } from '../i18n';

interface Props {
    canLogin: boolean;
    canRegister: boolean;
}

function useScrolled(threshold = 40) {
    const [scrolled, setScrolled] = useState(false);
    useEffect(() => {
        const fn = () => setScrolled(window.scrollY > threshold);
        window.addEventListener('scroll', fn, { passive: true });
        return () => window.removeEventListener('scroll', fn);
    }, [threshold]);
    return scrolled;
}

function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-60px' });
    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// ─── Phone Frame ──────────────────────────────────────────────────────────────

function PhoneFrame({ children, className = '', style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
    return (
        <div className={`relative ${className}`} style={{ aspectRatio: '9/19.5', ...style }}>
            {/* Phone shell */}
            <div className="absolute inset-0 rounded-[44px] bg-zinc-800 shadow-[0_0_0_2px_#3f3f46,0_30px_60px_rgba(0,0,0,0.7),inset_0_0_0_1px_rgba(255,255,255,0.08)]" />

            {/* Side buttons */}
            <div className="absolute rounded-sm bg-zinc-600" style={{ left: '-2.5px', top: '22%', width: '2.5px', height: '7%' }} />
            <div className="absolute rounded-sm bg-zinc-600" style={{ left: '-2.5px', top: '32%', width: '2.5px', height: '7%' }} />
            <div className="absolute rounded-sm bg-zinc-600" style={{ right: '-2.5px', top: '27%', width: '2.5px', height: '11%' }} />

            {/* Screen area — clipped content */}
            <div className="absolute overflow-hidden rounded-[30px] bg-black" style={{ top: '1.5%', left: '3%', right: '3%', bottom: '1.5%' }}>
                {/* Dynamic island */}
                <div className="absolute left-1/2 -translate-x-1/2 bg-black rounded-full z-20" style={{ top: '2%', width: '35%', height: '3.5%' }} />
                {/* Content fills screen */}
                <div className="w-full h-full">
                    {children}
                </div>
                {/* Home indicator */}
                <div className="absolute bottom-[2%] left-1/2 -translate-x-1/2 bg-white/30 rounded-full z-20" style={{ width: '30%', height: '3px' }} />
            </div>
        </div>
    );
}

function Logo() {
    return (
        <div className="flex items-center gap-2.5">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 2 L34 18 L18 34 L2 18 Z" fill="#2563EB" />
                <text x="18" y="24" textAnchor="middle" fontFamily="'Bebas Neue', sans-serif" fontSize="20" fontWeight="900" fill="#ffffff" letterSpacing="-0.5">F</text>
            </svg>
            <span className="text-2xl font-black tracking-tight text-white" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.04em' }}>
                Fade
            </span>
        </div>
    );
}


// ─── Cookie Banner ────────────────────────────────────────────────────────────

function CookieBanner() {
    const { t } = useTranslation();
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const consent = localStorage.getItem('cookie_consent');
            if (!consent) setVisible(true);
        }
    }, []);

    function accept() {
        localStorage.setItem('cookie_consent', 'accepted');
        setVisible(false);
    }

    function decline() {
        localStorage.setItem('cookie_consent', 'declined');
        setVisible(false);
    }

    if (!visible) return null;

    return (
        <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-0 inset-x-0 z-[200] px-4 pb-4 sm:px-6"
        >
            <div className="max-w-3xl mx-auto bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-2xl shadow-black/60">
                <div className="flex-1 text-sm text-zinc-300 leading-relaxed">
                    {t('land.cookieText')}{' '}
                    <a href="#" className="text-blue-400 hover:text-blue-300 underline underline-offset-2">
                        {t('land.cookieLearnMore')}
                    </a>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <button
                        onClick={decline}
                        className="text-sm font-medium text-zinc-400 hover:text-white px-4 py-2 rounded-xl transition-colors"
                    >
                        {t('land.cookieDecline')}
                    </button>
                    <button
                        onClick={accept}
                        className="text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl transition-colors"
                    >
                        {t('land.cookieAccept')}
                    </button>
                </div>
            </div>
        </motion.div>
    );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

// ─── Language Switcher ────────────────────────────────────────────────────────

function LangSwitcher() {
    const { i18n } = useTranslation();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const current = LANGUAGES.find(l => l.code === i18n.language) ?? LANGUAGES[0];

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen(v => !v)}
                className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
            >
                <span>{current.flag}</span>
                <span>{current.code.toUpperCase()}</span>
                <svg className={`h-3 w-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} viewBox="0 0 12 12" fill="none">
                    <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-1.5 w-36 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl shadow-black/50 overflow-hidden z-50">
                    {LANGUAGES.map(({ code, label, flag }) => (
                        <button
                            key={code}
                            onClick={() => {
                                i18n.changeLanguage(code);
                                localStorage.setItem('fade_lang_guest', code);
                                setOpen(false);
                            }}
                            className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors ${
                                i18n.language === code
                                    ? 'bg-white/5 text-white font-semibold'
                                    : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                            }`}
                        >
                            <span>{flag}</span>
                            <span>{label}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

const Navbar = ({ canLogin, canRegister }: { canLogin: boolean; canRegister: boolean }) => {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const scrolled = useScrolled();

    function scrollToSupport(e: React.MouseEvent) {
        e.preventDefault();
        setOpen(false);
        document.getElementById('support')?.scrollIntoView({ behavior: 'smooth' });
    }

    return (
        <>
            <nav className={`fixed top-0 inset-x-0 z-[100] transition-all duration-300 ${
                scrolled ? 'bg-black/95 backdrop-blur-xl shadow-lg shadow-black/30' : 'bg-transparent'
            }`}>
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Logo />

                    {/* Desktop center links */}
                    <div className="hidden md:flex items-center gap-1 text-sm font-medium text-white">
                        <a href="#how-it-works" className="px-4 py-2 rounded-lg hover:bg-white/5 transition-colors text-zinc-300 hover:text-white">{t('land.navHowItWorks')}</a>
                        <a href="#stories" className="px-4 py-2 rounded-lg hover:bg-white/5 transition-colors text-zinc-300 hover:text-white">{t('land.navStories')}</a>
                        <a href="#support" onClick={scrollToSupport} className="px-4 py-2 rounded-lg hover:bg-white/5 transition-colors text-zinc-300 hover:text-white">{t('land.navSupport')}</a>
                    </div>

                    {/* Desktop auth + lang */}
                    <div className="hidden md:flex items-center gap-3">
                        <LangSwitcher />
                        {canLogin && (
                            <a href="/login" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors px-4 py-2">{t('land.navLogin')}</a>
                        )}
                        {canRegister && (
                            <a href="/register" className="text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl transition-all">{t('land.navBook')}</a>
                        )}
                    </div>

                    {/* Mobile controls */}
                    <div className="flex md:hidden items-center gap-2">
                        <LangSwitcher />
                        {canLogin && <a href="/login" className="text-sm font-medium text-white border border-zinc-700 px-4 py-1.5 rounded-full hover:border-zinc-400 transition-all">{t('land.navLogin')}</a>}
                        <button className="p-1 text-white" onClick={() => setOpen(v => !v)}>
                            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile fullscreen menu */}
            {open && (
                <div className="fixed inset-0 z-[99] bg-black flex flex-col overflow-y-auto" style={{ paddingTop: '64px' }}>
                    <div className="flex flex-col px-6 pt-6 gap-0 flex-1">
                        <a href="#how-it-works" onClick={() => setOpen(false)}
                            className="text-xl font-light text-white hover:text-zinc-400 py-3.5 border-b border-zinc-900 tracking-wide">
                            {t('land.navHowItWorks')}
                        </a>
                        <a href="#stories" onClick={() => setOpen(false)}
                            className="text-xl font-light text-white hover:text-zinc-400 py-3.5 border-b border-zinc-900 tracking-wide">
                            {t('land.navStories')}
                        </a>
                        <a href="#support" onClick={scrollToSupport}
                            className="text-xl font-light text-white hover:text-zinc-400 py-3.5 border-b border-zinc-900 tracking-wide">
                            {t('land.navSupport')}
                        </a>
                    </div>

                    <div className="px-6 pb-10 pt-6 space-y-3">
                        {canLogin && (
                            <a href="/login" className="block text-center py-3 border border-zinc-700 rounded-full text-sm font-medium text-white hover:border-zinc-500 transition-all">
                                {t('land.navLogin')}
                            </a>
                        )}
                        {canRegister && (
                            <a href="/register" className="block text-center py-3 bg-blue-600 hover:bg-blue-500 rounded-full text-sm font-semibold text-white transition-all">
                                {t('land.navBook')}
                            </a>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

// ─── Hero ─────────────────────────────────────────────────────────────────────

const Hero = () => {
    const { t } = useTranslation();
    return (
        <section className="relative min-h-screen flex flex-col items-center justify-center bg-black pt-16">
            <div className="relative z-10 max-w-7xl mx-auto px-6 w-full flex flex-col items-center text-center">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                    className="text-5xl sm:text-6xl md:text-7xl text-white tracking-tight leading-[1.05] mb-6 max-w-3xl mt-12 md:mt-16"
                    style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                >
                    {t('land.heroHeading')}
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.25 }}
                    className="text-sm md:text-base text-zinc-400 max-w-lg mb-8 md:mb-10 leading-relaxed px-2"
                >
                    {t('land.heroSub')}
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.35 }}
                    className="mb-12 md:mb-48"
                >
                    <a href="/register"
                        className="text-base md:text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white px-10 md:px-12 py-3 rounded-full transition-all">
                        {t('land.heroBtn')}
                    </a>
                </motion.div>

                {/* Hero showcase */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="w-full"
                >
                    {/* Mobile: single centered phone */}
                    <div className="flex md:hidden justify-center relative" style={{ height: '400px' }}>
                        <div className="absolute left-0 right-0 rounded-3xl bg-slate-400" style={{ top: '60px', bottom: '60px' }} />
                        <PhoneFrame className="relative z-10" style={{ width: '180px' }}>
                            <video autoPlay loop muted playsInline className="w-full h-full object-cover">
                                <source src="/videos/haircut.mp4" type="video/mp4" />
                            </video>
                        </PhoneFrame>
                    </div>

                    {/* Desktop: full floating layout */}
                    <div className="hidden md:flex relative items-center justify-center gap-16" style={{ height: '600px' }}>
                        <div className="absolute rounded-3xl bg-slate-400" style={{ left: '2%', right: '2%', top: '160px', bottom: '100px' }} />

                        {/* Left phone */}
                        <PhoneFrame className="relative z-20 -rotate-3 shadow-2xl" style={{ width: '210px', marginTop: '32px' }}>
                            <img src="/left-side.png" alt="App screen" className="w-full h-full object-cover" />
                        </PhoneFrame>

                        {/* Center phone — video */}
                        <PhoneFrame className="relative z-30 shadow-2xl" style={{ width: '245px' }}>
                            <video autoPlay loop muted playsInline className="w-full h-full object-cover">
                                <source src="/videos/haircut.mp4" type="video/mp4" />
                            </video>
                        </PhoneFrame>

                        {/* Right phone */}
                        <PhoneFrame className="relative z-20 rotate-3 shadow-2xl" style={{ width: '210px', marginTop: '32px' }}>
                            <img src="/right-side.png" alt="App screen" className="w-full h-full object-cover" />
                        </PhoneFrame>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};


// ─── Marquee ──────────────────────────────────────────────────────────────────

interface Sponsor { id: number; shop_name: string; url: string | null; }

type MarqueeSlot =
    | { type: 'sponsor'; sponsor: Sponsor }
    | { type: 'ghost'; width: number }
    | { type: 'cta' };

const ghostWidths = [88, 112, 96, 120, 80, 104, 92, 116, 100];

function buildSlots(sponsors: Sponsor[]): MarqueeSlot[] {
    // Always keep at least 8 slots so the strip looks full.
    // Interleave sponsors with ghosts; insert a CTA every 4 slots.
    const slots: MarqueeSlot[] = [];
    let sponsorIdx = 0;
    let ghostIdx = 0;
    const total = Math.max(8, sponsors.length * 2 + 2);

    for (let i = 0; i < total; i++) {
        if ((i + 1) % 4 === 0) {
            slots.push({ type: 'cta' });
        } else if (sponsorIdx < sponsors.length) {
            slots.push({ type: 'sponsor', sponsor: sponsors[sponsorIdx++] });
        } else {
            slots.push({ type: 'ghost', width: ghostWidths[ghostIdx++ % ghostWidths.length] });
        }
    }
    return slots;
}

const Marquee = () => {
    const [sponsors, setSponsors] = useState<Sponsor[]>([]);

    useEffect(() => {
        fetch('/api/marquee-sponsors')
            .then(r => r.json())
            .then(setSponsors)
            .catch(() => {});
    }, []);

    const slots = buildSlots(sponsors);

    return (
        <div className="mt-12 md:mt-20 py-8 md:py-10 bg-black border-y border-zinc-900 overflow-hidden">
            <div className="flex w-max animate-[marquee_30s_linear_infinite]">
                {[...slots, ...slots].map((slot, i) => (
                    <div key={i} className="flex items-center gap-6 px-6 md:px-8">
                        {slot.type === 'sponsor' ? (
                            slot.sponsor.url ? (
                                <a
                                    href={slot.sponsor.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs font-semibold text-zinc-400 hover:text-white whitespace-nowrap tracking-wide uppercase transition-colors"
                                >
                                    {slot.sponsor.shop_name}
                                </a>
                            ) : (
                                <span className="text-xs font-semibold text-zinc-400 whitespace-nowrap tracking-wide uppercase">
                                    {slot.sponsor.shop_name}
                                </span>
                            )
                        ) : slot.type === 'cta' ? (
                            <a
                                href="/register"
                                className="flex items-center gap-2 border border-dashed border-zinc-700 hover:border-blue-500 text-zinc-500 hover:text-blue-400 text-xs font-semibold whitespace-nowrap tracking-wide uppercase px-3 py-1 rounded-full transition-all duration-200 group"
                            >
                                <span className="h-3.5 w-3.5 rounded-full border border-dashed border-current flex items-center justify-center transition-colors">
                                    <svg viewBox="0 0 8 8" className="h-2 w-2 fill-current"><path d="M4 1v6M1 4h6"/></svg>
                                </span>
                                Your shop here
                            </a>
                        ) : (
                            <div className="h-3 rounded-full bg-zinc-800" style={{ width: slot.width }} />
                        )}
                        <span className="h-1 w-1 rounded-full bg-zinc-800 shrink-0" />
                    </div>
                ))}
            </div>
            <style>{`
                @keyframes marquee {
                    from { transform: translateX(0); }
                    to { transform: translateX(-50%); }
                }
            `}</style>
        </div>
    );
};

// ─── Lock in Loyalty ──────────────────────────────────────────────────────────

const LockInLoyalty = () => {
    const { t } = useTranslation();
    return (
        <section className="py-20 md:py-32 bg-black" id="features">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">

                    <FadeIn>
                        <p className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-4">{t('land.retentionLabel')}</p>
                        <h2
                            className="text-[64px] md:text-[80px] leading-none text-white mb-6 whitespace-pre-line"
                            style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.01em' }}
                        >
                            {t('land.loyaltyHeading')}
                        </h2>
                        <p className="text-zinc-400 text-sm leading-relaxed mb-8 md:mb-10 max-w-xs">
                            {t('land.loyaltySub')}
                        </p>
                        <a
                            href="/register"
                            className="inline-flex items-center gap-2 border border-white text-white text-sm font-semibold px-6 py-3 rounded-full hover:bg-white hover:text-black transition-all duration-200"
                        >
                            {t('land.loyaltyBtn')} <ArrowRight className="h-4 w-4" />
                        </a>
                    </FadeIn>

                    <FadeIn delay={0.15}>
                        <div className="relative flex items-center justify-center mt-8 md:mt-0" style={{ height: '400px' }}>

                            <div
                                className="absolute bg-pink-400 rounded-3xl"
                                style={{ width: '85%', maxWidth: '560px', height: '280px', top: '60px', right: '0' }}
                            />

                            <div
                                className="absolute overflow-hidden shadow-2xl"
                                style={{ width: '55%', maxWidth: '320px', borderRadius: '20px', top: '0', right: '10%' }}
                            >
                                <img src="/dashboard.png" alt="Dashboard" className="w-full h-auto object-contain" />
                            </div>

                            <div
                                className="absolute z-20 overflow-hidden shadow-[0_30px_70px_rgba(0,0,0,0.6)]"
                                style={{ width: '42%', maxWidth: '230px', height: '240px', borderRadius: '20px', bottom: '0', left: '5%' }}
                            >
                                <img
                                    src="https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=500&q=80"
                                    alt="Barber"
                                    className="w-full h-full object-cover"
                                />
                            </div>

                        </div>
                    </FadeIn>

                </div>
            </div>
        </section>
    );
};

// ─── Barbers & Clients ────────────────────────────────────────────────────────

const BarbersClients = () => {
    const { t } = useTranslation();
    return (
        <section className="py-20 md:py-32 bg-black" id="barbers">
            <div className="max-w-7xl mx-auto px-6">

                <FadeIn>
                    <p className="text-xs uppercase tracking-widest text-white font-bold mb-6">{t('land.forLabel')}</p>
                </FadeIn>

                <FadeIn>
                    <h2
                        className="text-6xl md:text-8xl leading-none mb-10 md:mb-16"
                        style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.01em' }}
                    >
                        <span className="text-blue-500 cursor-default">{t('land.barbersTitle')} </span>
                        <span className="text-zinc-500 hover:text-white transition-colors duration-300 cursor-default">
                            {t('land.businessTitle')}
                        </span>
                    </h2>
                </FadeIn>

                {/* Mobile: stacked */}
                <div className="flex flex-col md:hidden gap-0">
                    <FadeIn>
                        <img
                            src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80"
                            alt="Barber"
                            className="w-full object-cover shadow-xl rounded-t-2xl"
                            style={{ aspectRatio: '16/9' }}
                        />
                    </FadeIn>
                    <FadeIn delay={0.1}>
                        <div className="bg-neutral-900 p-6 shadow-xl rounded-b-2xl">
                            <p className="text-zinc-300 text-sm leading-relaxed mb-6">
                                {t('land.barbersSub')}
                            </p>
                            <a
                                href="/register"
                                className="inline-flex items-center gap-2 border border-zinc-600 text-zinc-400 rounded-full px-4 py-1.5 text-xs font-bold hover:border-white hover:text-white transition-all duration-200 w-fit"
                            >
                                {t('land.findOutHow')}
                                <span className="flex items-center justify-center bg-blue-600 rounded-full h-5 w-5">
                                    <ArrowRight className="h-3 w-3 text-white" />
                                </span>
                            </a>
                        </div>
                    </FadeIn>
                </div>

                {/* Desktop: side by side */}
                <div className="hidden md:grid grid-cols-[3fr_1fr] items-stretch">
                    <FadeIn>
                        <img
                            src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80"
                            alt="Barber"
                            className="w-full object-cover shadow-xl"
                            style={{ aspectRatio: '21/9', borderRadius: '12px 0 0 12px' }}
                        />
                    </FadeIn>
                    <FadeIn delay={0.1}>
                        <div className="bg-neutral-900 p-6 shadow-xl h-full flex flex-col justify-center" style={{ borderRadius: '0 12px 12px 0' }}>
                            <p className="text-zinc-300 text-sm leading-relaxed mb-6">
                                {t('land.barbersSub')}
                            </p>
                            <a
                                href="/register"
                                className="inline-flex items-center gap-2 border border-zinc-600 text-zinc-400 rounded-full px-4 py-1.5 text-xs font-bold hover:border-white hover:text-white transition-all duration-200 w-fit"
                            >
                                {t('land.findOutHow')}
                                <span className="flex items-center justify-center bg-blue-600 rounded-full h-5 w-5">
                                    <ArrowRight className="h-3 w-3 text-white" />
                                </span>
                            </a>
                        </div>
                    </FadeIn>
                </div>
            </div>
        </section>
    );
};

// ─── Shop Stories ─────────────────────────────────────────────────────────────

const stories = [
    {
        name: 'Marcus Johnson',
        shop: 'Classic Cuts NYC',
        avatar: 'https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=100&q=80',
        text: "Before Fade, I was managing bookings through Instagram DMs at midnight. Now my schedule fills itself. Revenue is up 40% in three months.",
        rating: 5,
        image: null,
    },
    {
        name: 'David Kowalski',
        shop: 'The Fade Factory',
        avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&q=80',
        text: "The client profiles are a game changer. I know every regular's preferences before they even sit down. It's made my work so much more personal and efficient.",
        rating: 5,
        image: null,
    },
    {
        name: 'Arben Gashi',
        shop: 'Fresh Edges Prishtina',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&q=80',
        text: "Set up in 10 minutes. My clients love the booking link. No-shows dropped from 3-4 a week to almost zero. Simple, fast, professional.",
        rating: 5,
        image: null,
    },
    {
        name: 'Luca Ferretti',
        shop: 'Blade & Brush Milano',
        avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&q=80',
        text: "Fade turned my shop into a fully booked machine. Clients love the experience and I love not dealing with missed calls.",
        rating: 5,
        image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&q=80',
    },
    {
        name: 'Jordan Blake',
        shop: 'Uptown Fades Chicago',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80',
        text: "I was skeptical at first but within a week my calendar was full. The reminders alone cut my no-shows in half. Couldn't go back.",
        rating: 5,
        image: null,
    },
    {
        name: 'Yusuf Al-Amin',
        shop: 'The Lineup Dubai',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
        text: "Running three chairs is now manageable. Every barber has their own schedule, clients book who they want. It just works.",
        rating: 5,
        image: null,
    },
];

const ShopStories = () => {
    const { t } = useTranslation();
    return (
        <section className="py-20 md:py-28 bg-black" id="stories">
            <div className="max-w-7xl mx-auto px-6">
                <FadeIn className="text-center mb-12 md:mb-16">
                    <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-3">{t('land.testimonialsLabel')}</p>
                    <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">{t('land.shopStoriesTitle')}</h2>
                    <p className="text-zinc-400 mt-4 max-w-md mx-auto text-sm md:text-base">{t('land.shopStoriesSub')}</p>
                </FadeIn>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 items-start">
                    {stories.map((s, i) => (
                        <FadeIn key={s.name} delay={i * 0.08}>
                            <div className={`bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden ${i === 1 || i === 4 ? 'md:mt-8' : ''}`}>
                                {s.image && (
                                    <img src={s.image} alt="Barbershop" className="w-full h-40 md:h-48 object-cover" />
                                )}
                                <div className="p-5 md:p-6">
                                    <div className="flex gap-1 mb-4">
                                        {Array.from({ length: s.rating }).map((_, j) => (
                                            <Star key={j} className="h-3.5 w-3.5 md:h-4 md:w-4 fill-amber-400 text-amber-400" />
                                        ))}
                                    </div>
                                    <p className="text-zinc-300 text-sm leading-relaxed mb-6">"{s.text}"</p>
                                    <div className="flex items-center gap-3 pt-4 border-t border-zinc-700">
                                        <img src={s.avatar} alt={s.name} className="h-9 w-9 md:h-10 md:w-10 rounded-full object-cover" />
                                        <div>
                                            <p className="font-semibold text-white text-sm">{s.name}</p>
                                            <p className="text-xs text-zinc-500">{s.shop}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </FadeIn>
                    ))}
                </div>
            </div>
        </section>
    );
};


// ─── Get Fade Free ─────────────────────────────────────────────────────────

const GetFree = () => {
    const { t } = useTranslation();
    return (
        <section className="py-20 md:py-28 bg-black" id="clients">
            <div className="max-w-7xl mx-auto px-6">
                <div className="bg-blue-600 rounded-3xl px-6 py-12 md:px-16 md:py-16 flex flex-col md:flex-row items-center gap-8 md:gap-12 overflow-hidden relative">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />

                    {/* Phone mockup */}
                    <div className="relative z-10 shrink-0">
                        <PhoneFrame style={{ width: '190px' }}>
                            <div className="w-full h-full bg-zinc-900 flex flex-col" style={{ paddingTop: '36px' }}>
                                <div className="bg-blue-700 px-3 py-4">
                                    <div className="text-white text-[10px] font-bold">Fade Booking</div>
                                    <div className="text-blue-200 text-[9px] mt-0.5">Marcus's Barbershop</div>
                                </div>
                                <div className="p-2.5 space-y-2 flex-1">
                                    <div className="bg-zinc-800 rounded-xl p-2.5">
                                        <p className="text-[8px] text-zinc-500 mb-1.5">Select service</p>
                                        <div className="space-y-1.5">
                                            {['Classic Haircut — $25', 'Beard Trim — $15', 'Full Package — $35'].map((s, i) => (
                                                <div key={i} className={`rounded-lg px-2 py-1.5 text-[8px] font-medium ${i === 0 ? 'bg-blue-600 text-white' : 'bg-zinc-700 text-zinc-300'}`}>{s}</div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="bg-zinc-800 rounded-xl p-2.5">
                                        <p className="text-[8px] text-zinc-500 mb-1.5">Pick a time</p>
                                        <div className="grid grid-cols-3 gap-1">
                                            {['9:00', '10:30', '12:00', '2:00', '3:30', '5:00'].map((t, i) => (
                                                <div key={i} className={`rounded-md py-1 text-center text-[7px] font-semibold ${i === 2 ? 'bg-blue-600 text-white' : 'bg-zinc-700 text-zinc-300'}`}>{t}</div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="bg-blue-600 rounded-xl py-2 text-center text-white text-[8px] font-bold">
                                        Confirm Booking →
                                    </div>
                                </div>
                            </div>
                        </PhoneFrame>
                    </div>

                    {/* Text */}
                    <div className="relative z-10 text-white text-center md:text-left">
                        <p className="text-xs font-bold uppercase tracking-widest text-blue-200 mb-4">{t('land.startTodayLabel')}</p>
                        <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight mb-4 md:mb-6 whitespace-pre-line">
                            {t('land.getFreeTitle')}
                        </h2>
                        <p className="text-blue-100 text-base md:text-lg leading-relaxed mb-6 md:mb-8">
                            {t('land.getFreeSub')}
                        </p>
                        <a href="/register"
                            className="inline-flex items-center gap-2 bg-white text-blue-600 font-bold px-6 md:px-8 py-3 md:py-4 rounded-xl hover:bg-blue-50 transition-all shadow-lg text-sm">
                            {t('land.getFreeBtn')} <ArrowRight className="h-4 w-4" />
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
};

// ─── Footer ───────────────────────────────────────────────────────────────────

const Footer = () => {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);

    function handleSupport(e: FormEvent) {
        e.preventDefault();
        if (!email.trim()) return;
        setSent(true);
        setEmail('');
    }

    return (
        <footer id="support" className="bg-black border-t border-zinc-900 text-zinc-500 pt-14 pb-8">
            <div className="max-w-7xl mx-auto px-6">

                {/* Main footer row: brand + columns + support */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 pb-12 border-b border-zinc-900">

                    {/* Left: brand + link columns */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 order-2 md:order-1">
                        {/* Brand */}
                        <div className="col-span-2 sm:col-span-1">
                            <span className="text-base font-black text-white mb-3 block">Fade</span>
                            <p className="text-sm leading-relaxed">
                                {t('land.footerTagline')}
                            </p>
                        </div>

                        {[
                            {
                                title: t('land.colProduct'),
                                links: [
                                    { label: t('land.linkHowItWorks'), href: '#how-it-works' },
                                    { label: t('land.linkStories'), href: '#stories' },
                                    { label: t('land.linkGetStarted'), href: '/register' },
                                ],
                            },
                            {
                                title: t('land.colCompany'),
                                links: [
                                    { label: t('land.linkAbout'), href: '#' },
                                    { label: t('land.linkBlog'), href: '#' },
                                    { label: t('land.linkCareers'), href: '#' },
                                ],
                            },
                            {
                                title: t('land.colLegal'),
                                links: [
                                    { label: t('land.linkPrivacy'), href: '#' },
                                    { label: t('land.linkTerms'), href: '#' },
                                    { label: t('land.linkCookies'), href: '#' },
                                ],
                            },
                        ].map(col => (
                            <div key={col.title}>
                                <p className="text-white font-semibold text-sm mb-4">{col.title}</p>
                                <ul className="space-y-2.5">
                                    {col.links.map(link => (
                                        <li key={link.label}>
                                            <a href={link.href} className="text-sm hover:text-white transition-colors">{link.label}</a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    {/* Right: support form */}
                    <div className="order-1 md:order-2">
                        <p className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-3">{t('land.supportLabel')}</p>
                        <h3 className="text-2xl md:text-3xl font-black text-white mb-2">{t('land.supportTitle')}</h3>
                        <p className="text-sm text-zinc-400 mb-6 max-w-sm">{t('land.supportSub')}</p>
                        {sent ? (
                            <p className="text-sm text-emerald-400 font-medium">{t('land.supportSent')}</p>
                        ) : (
                            <form onSubmit={handleSupport} className="flex gap-2">
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder={t('land.supportPlaceholder')}
                                    className="flex-1 h-11 rounded-xl bg-zinc-900 border border-zinc-800 px-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
                                />
                                <button
                                    type="submit"
                                    className="h-11 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors shrink-0"
                                >
                                    {t('land.supportBtn')}
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
                    <p>{t('land.copyright')}</p>
                    <p className="text-zinc-400">
                        {t('land.madeBy')}{' '}
                        <a
                            href="https://an2tech.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-500 transition-colors font-bold text-sm"
                        >
                            AN2Tech
                        </a>
                    </p>
                    <p className="text-zinc-400">{t('land.builtBy')}</p>
                </div>
            </div>
        </footer>
    );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Welcome({ canLogin, canRegister }: Props) {
    // Initialize guest language preference on mount
    useEffect(() => {
        initializeUserLanguage();
    }, []);

    return (
        <div className="min-h-screen bg-black font-sans antialiased">
            <Navbar canLogin={canLogin} canRegister={canRegister} />
            <Hero />
            <Marquee />
            <LockInLoyalty />
            <BarbersClients />
            <ShopStories />
            <GetFree />
            <Footer />
            <CookieBanner />
        </div>
    );
}
