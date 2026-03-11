import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
    Calendar, BarChart3, Check, ArrowRight, Menu, X,
    Zap, Shield, Users, Clock, Bell, Link2,
    MessageCircleX, CalendarX2, Repeat2, BotOff,
    ChevronRight, Star, Sparkles, TrendingUp,
    CheckCircle2, Activity, GitBranch,
} from 'lucide-react';

// ─── helpers ─────────────────────────────────────────────────────────────────

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
    const inView = useInView(ref, { once: true, margin: '-80px' });
    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 28 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// ─── Logo ─────────────────────────────────────────────────────────────────────

function TrimFlowLogo({ dark = true }: { dark?: boolean }) {
    return (
        <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-sm shrink-0">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                    <path d="M12 2C9.5 6 7 8.5 7 12a5 5 0 0 0 10 0c0-3.5-2.5-6-5-10z" opacity="0.9"/>
                    <path d="M12 8c-1 2.5-2 4-2 5.5a2 2 0 0 0 4 0C14 12 13 10.5 12 8z" fill="white" opacity="0.6"/>
                </svg>
            </div>
            <span className={`text-base font-bold tracking-tight ${dark ? 'text-slate-900' : 'text-white'}`}>
                Fresh<span className="text-emerald-500">io</span>
            </span>
        </div>
    );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

const Navbar = () => {
    const [open, setOpen] = useState(false);
    const scrolled = useScrolled();

    return (
        <>
            <nav className={`fixed top-0 inset-x-0 z-[100] transition-all duration-500 ${
                scrolled ? 'bg-white/90 backdrop-blur-xl border-b border-slate-100 shadow-sm' : 'bg-transparent'
            }`}>
                <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
                    <TrimFlowLogo dark />

                    <div className="hidden md:flex items-center gap-8 text-sm text-slate-500">
                        {[
                            { label: 'Features', href: '#features' },
                            { label: 'Pricing', href: '#pricing' },
                            { label: 'How it works', href: '#how-it-works' },
                        ].map(l => (
                            <a key={l.label} href={l.href} className="hover:text-slate-900 transition-colors">{l.label}</a>
                        ))}
                    </div>

                    <div className="flex items-center gap-3">
                        <a href="/login" className="hidden sm:block text-sm text-slate-500 hover:text-slate-900 transition-colors px-3 py-1.5">
                            Sign in
                        </a>
                        <a href="/register"
                           className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/40">
                            Start free
                        </a>
                        <button onClick={() => setOpen(!open)} className="md:hidden text-slate-600 hover:text-slate-900 p-1">
                            {open ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>
            </nav>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-x-0 top-16 z-[99] bg-white border-b border-slate-100 shadow-lg px-5 py-6 flex flex-col gap-5 md:hidden"
                    >
                        {['Features', 'Pricing', 'How it works'].map(l => (
                            <a key={l} href="#" onClick={() => setOpen(false)}
                               className="text-slate-700 hover:text-slate-900 text-base font-medium transition-colors">{l}</a>
                        ))}
                        <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
                            <a href="/login" className="text-slate-500 text-sm text-center py-2">Sign in</a>
                            <a href="/register" className="bg-gradient-to-r from-emerald-500 to-green-600 text-white text-sm font-semibold py-3 rounded-lg text-center">
                                Start free
                            </a>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

// ─── Floating UI Cards ────────────────────────────────────────────────────────

const FloatingCard = ({ children, className = '', delay = 0, floatY = 8 }: {
    children: React.ReactNode; className?: string; delay?: number; floatY?: number;
}) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
        className={`absolute bg-white rounded-2xl shadow-xl border border-slate-100/80 ${className}`}
    >
        <motion.div
            animate={{ y: [0, -floatY, 0] }}
            transition={{ duration: 3.5 + delay, repeat: Infinity, ease: 'easeInOut', delay: delay * 0.5 }}
        >
            {children}
        </motion.div>
    </motion.div>
);

const ProductVisual = () => (
    <div className="relative w-full h-[540px] md:h-[620px]">

        {/* Main dashboard card */}
        <FloatingCard delay={0.5} floatY={6} className="right-0 top-8 w-72 p-4 z-20">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <p className="text-xs text-slate-400 font-medium">Today's Revenue</p>
                    <p className="text-2xl font-black text-slate-900 tracking-tight">$2,840</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                </div>
            </div>
            {/* Mini bar chart */}
            <div className="flex items-end gap-1 h-14 mb-2">
                {[40, 65, 45, 80, 55, 90, 72, 85, 60, 95, 70, 100].map((h, i) => (
                    <motion.div
                        key={i}
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ duration: 0.4, delay: 0.8 + i * 0.05, ease: 'easeOut' }}
                        style={{ height: `${h}%` }}
                        className={`flex-1 rounded-sm origin-bottom ${i === 11 ? 'bg-emerald-500' : 'bg-emerald-100'}`}
                    />
                ))}
            </div>
            <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-emerald-600">+18%</span>
                <span className="text-xs text-slate-400">vs last week</span>
            </div>
        </FloatingCard>

        {/* Booking confirmed card */}
        <FloatingCard delay={0.7} floatY={10} className="left-0 top-0 w-64 p-4 z-20">
            <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900">Booking Confirmed</p>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">James W. · Haircut + Beard</p>
                    <div className="flex items-center gap-1.5 mt-2">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center">
                            <span className="text-[8px] font-bold text-white">A</span>
                        </div>
                        <span className="text-[10px] text-slate-500">Alex · Today 10:30</span>
                    </div>
                </div>
            </div>
        </FloatingCard>

        {/* Schedule card */}
        <FloatingCard delay={0.9} floatY={7} className="left-4 top-40 w-60 p-4 z-10">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">Today's Schedule</p>
            <div className="space-y-2.5">
                {[
                    { name: 'James Wilson', time: '09:00', color: 'bg-emerald-500' },
                    { name: 'Marco Silva', time: '10:30', color: 'bg-green-400' },
                    { name: 'David Park', time: '12:00', color: 'bg-emerald-300' },
                ].map((a, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${a.color}`} />
                        <span className="text-xs text-slate-700 flex-1 font-medium">{a.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{a.time}</span>
                    </div>
                ))}
            </div>
        </FloatingCard>

        {/* Activity feed */}
        <FloatingCard delay={1.1} floatY={9} className="right-4 bottom-28 w-56 p-4 z-10">
            <div className="flex items-center gap-2 mb-3">
                <Activity className="h-3.5 w-3.5 text-emerald-500" />
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Live Activity</p>
            </div>
            <div className="space-y-2">
                {[
                    { text: 'New booking via link', time: '2m ago' },
                    { text: 'Ryan completed a cut', time: '8m ago' },
                    { text: '$60 payment received', time: '15m ago' },
                ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                            <div className="w-1 h-1 rounded-full bg-emerald-400 shrink-0" />
                            <span className="text-[10px] text-slate-600 truncate">{item.text}</span>
                        </div>
                        <span className="text-[9px] text-slate-400 shrink-0">{item.time}</span>
                    </div>
                ))}
            </div>
        </FloatingCard>

        {/* Barbers online pill */}
        <FloatingCard delay={1.3} floatY={5} className="right-0 bottom-10 w-48 px-4 py-3 z-20">
            <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                    {['A', 'R', 'J'].map((l, i) => (
                        <div key={i} className={`w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-bold text-white ${
                            i === 0 ? 'bg-emerald-500' : i === 1 ? 'bg-green-400' : 'bg-teal-500'
                        }`}>{l}</div>
                    ))}
                </div>
                <div>
                    <p className="text-xs font-bold text-slate-900">3 barbers</p>
                    <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <p className="text-[10px] text-emerald-600 font-medium">online now</p>
                    </div>
                </div>
            </div>
        </FloatingCard>

        {/* Booking link card */}
        <FloatingCard delay={1.5} floatY={8} className="left-8 bottom-8 w-56 px-4 py-3 z-20">
            <div className="flex items-center gap-2 mb-2">
                <Link2 className="h-3.5 w-3.5 text-emerald-500" />
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Your booking link</p>
            </div>
            <div className="bg-emerald-50 rounded-lg px-3 py-1.5">
                <p className="text-[10px] text-emerald-700 font-mono truncate">trimflow.app/book/yourshop</p>
            </div>
            <div className="flex items-center gap-1.5 mt-2">
                <TrendingUp className="h-3 w-3 text-emerald-500" />
                <span className="text-[10px] text-slate-500">24 bookings today</span>
            </div>
        </FloatingCard>
    </div>
);

// ─── Hero ─────────────────────────────────────────────────────────────────────

const Hero = () => {

    return (
        <section className="relative min-h-screen flex items-center overflow-hidden bg-white pt-16">

            {/* SVG Stripe-style diagonal stripes — Stripe.com inspired */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <motion.svg
                    className="absolute inset-0 w-full h-full"
                    xmlns="http://www.w3.org/2000/svg"
                    preserveAspectRatio="xMidYMid slice"
                    viewBox="0 0 1440 900"
                    animate={{ x: [0, 14, 0], y: [0, -8, 0] }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
                >
                    <defs>
                        <linearGradient id="sg1" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.55" />
                            <stop offset="100%" stopColor="#4ade80" stopOpacity="0.15" />
                        </linearGradient>
                        <linearGradient id="sg2" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#16a34a" stopOpacity="0.45" />
                            <stop offset="100%" stopColor="#22c55e" stopOpacity="0.10" />
                        </linearGradient>
                        <linearGradient id="sg3" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#4ade80" stopOpacity="0.60" />
                            <stop offset="100%" stopColor="#bbf7d0" stopOpacity="0.08" />
                        </linearGradient>
                        <linearGradient id="sg4" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.30" />
                            <stop offset="100%" stopColor="#4ade80" stopOpacity="0.05" />
                        </linearGradient>
                        <linearGradient id="sg5" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#16a34a" stopOpacity="0.20" />
                            <stop offset="100%" stopColor="#22c55e" stopOpacity="0.04" />
                        </linearGradient>
                        <filter id="gblur-heavy">
                            <feGaussianBlur stdDeviation="28" />
                        </filter>
                        <filter id="gblur-med">
                            <feGaussianBlur stdDeviation="14" />
                        </filter>
                        <filter id="gblur-light">
                            <feGaussianBlur stdDeviation="6" />
                        </filter>
                    </defs>

                    {/* All stripes grouped and rotated -20deg around center-right */}
                    <g transform="rotate(-20, 1100, 450)">
                        {/* Stripe A — wide background fill, heavy blur */}
                        <rect x="720" y="-300" width="340" height="1600" rx="60" fill="url(#sg5)" filter="url(#gblur-heavy)" />
                        {/* Stripe B — wide mid, heavy blur */}
                        <rect x="860" y="-200" width="220" height="1400" rx="50" fill="url(#sg4)" filter="url(#gblur-heavy)" />
                        {/* Stripe C — main vivid stripe, med blur */}
                        <rect x="1010" y="-100" width="110" height="1200" rx="40" fill="url(#sg1)" filter="url(#gblur-med)" />
                        {/* Stripe D — thin sharp accent, light blur */}
                        <rect x="1140" y="0" width="56" height="1100" rx="28" fill="url(#sg2)" filter="url(#gblur-light)" />
                        {/* Stripe E — hairline, crisp */}
                        <rect x="1216" y="80" width="28" height="980" rx="14" fill="url(#sg3)" filter="url(#gblur-light)" />
                        {/* Stripe F — far right whisper */}
                        <rect x="1270" y="160" width="180" height="900" rx="40" fill="url(#sg4)" filter="url(#gblur-heavy)" />
                        {/* Stripe G — extra depth behind C */}
                        <rect x="950" y="-180" width="60" height="1300" rx="30" fill="url(#sg2)" filter="url(#gblur-med)" />
                    </g>
                </motion.svg>

                {/* Hard left mask — keeps text area pure white */}
                <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-white via-white/95 to-transparent pointer-events-none" />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-5 w-full grid md:grid-cols-2 gap-12 items-center py-20">

                {/* Left: copy */}
                <div>
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-full px-4 py-1.5 mb-8"
                    >
                        <Sparkles className="h-3 w-3 text-emerald-600" />
                        <span className="text-xs text-emerald-700 font-semibold">The smarter way to run your barbershop</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        className="text-5xl sm:text-6xl md:text-[64px] font-black tracking-tight text-slate-900 leading-[1.04] mb-6"
                    >
                        The Modern<br />
                        <span className="bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 bg-clip-text text-transparent">
                            Booking System
                        </span><br />
                        for Barbershops
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.35 }}
                        className="text-lg text-slate-500 leading-relaxed mb-10 max-w-md"
                    >
                        Stop managing appointments through Instagram DMs.
                        Let clients book their haircut in seconds — from your link, any device, any time.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.45 }}
                        className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6"
                    >
                        <a href="/register"
                           className="group flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-semibold px-7 py-3.5 rounded-xl transition-all shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 text-sm">
                            Start free
                            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                        </a>
                        <a href="#features"
                           className="flex items-center gap-2 text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300 px-7 py-3.5 rounded-xl transition-all font-medium text-sm bg-white/70 hover:bg-white">
                            See how it works
                            <ChevronRight className="h-4 w-4" />
                        </a>
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="text-xs text-slate-400 font-medium"
                    >
                        No credit card required · Free forever for 1 barber
                    </motion.p>

                </div>

                {/* Right: floating product cards */}
                <div className="relative hidden md:block">
                    <ProductVisual />
                </div>
            </div>

            {/* Bottom fade */}
            <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-white to-transparent pointer-events-none" />
        </section>
    );
};

// ─── Stats bar ────────────────────────────────────────────────────────────────

const Stats = () => (
    <section className="py-12 bg-slate-50 border-y border-slate-100">
        <div className="max-w-5xl mx-auto px-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                {[
                    { val: '2,400+', label: 'Active Shops' },
                    { val: '1.2M', label: 'Bookings Processed' },
                    { val: '99.9%', label: 'Uptime' },
                    { val: '4.9/5', label: 'Average Rating' },
                ].map(s => (
                    <div key={s.label}>
                        <p className="text-2xl font-black text-slate-900 tracking-tight mb-1">{s.val}</p>
                        <p className="text-xs text-slate-400 font-medium">{s.label}</p>
                    </div>
                ))}
            </div>
        </div>
    </section>
);

// ─── Problem section ──────────────────────────────────────────────────────────

const Problems = () => (
    <section className="py-28 bg-white" id="features">
        <div className="max-w-5xl mx-auto px-5">
            <FadeIn className="text-center mb-16">
                <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600 mb-3">The old way</p>
                <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
                    Still managing bookings in DMs?
                </h2>
                <p className="text-slate-400 mt-4 max-w-md mx-auto text-base leading-relaxed">
                    Every barbershop owner knows the chaos. Here's what you're dealing with every single day.
                </p>
            </FadeIn>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { icon: MessageCircleX, title: 'Endless DMs', desc: 'Spending hours replying to Instagram and WhatsApp just to schedule one haircut.' },
                    { icon: CalendarX2, title: 'Double Bookings', desc: 'Two clients show up at the same time. Awkward conversations, lost trust.' },
                    { icon: BotOff, title: 'No-Shows', desc: 'Clients forget. You lose money and time with zero way to prevent it.' },
                    { icon: Repeat2, title: 'Schedule Chaos', desc: 'Paper notes, phone reminders, spreadsheets — nothing works together.' },
                ].map(({ icon: Icon, title, desc }, i) => (
                    <FadeIn key={i} delay={i * 0.08}>
                        <div className="group relative bg-white border border-slate-100 rounded-2xl p-6 hover:border-red-100 hover:shadow-lg transition-all duration-300">
                            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center mb-4 group-hover:bg-red-100 transition-colors">
                                <Icon className="h-5 w-5 text-red-400" />
                            </div>
                            <h3 className="text-slate-900 font-bold text-sm mb-2">{title}</h3>
                            <p className="text-slate-400 text-xs leading-relaxed">{desc}</p>
                        </div>
                    </FadeIn>
                ))}
            </div>
        </div>
    </section>
);

// ─── Features ─────────────────────────────────────────────────────────────────

const Features = () => (
    <section className="py-28 bg-slate-50">
        <div className="max-w-5xl mx-auto px-5">
            <FadeIn className="text-center mb-16">
                <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600 mb-3">The TrimFlow way</p>
                <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
                    TrimFlow fixes it instantly
                </h2>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                    { icon: Link2, title: 'Instant Booking Link', desc: 'Share one link anywhere — Instagram bio, WhatsApp, stories. Clients book without calling.', bg: 'bg-emerald-50', hover: 'hover:border-emerald-200', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
                    { icon: Zap, title: 'Smart Availability', desc: 'Real-time slot detection. No double bookings. Ever. The system handles everything automatically.', bg: 'bg-white', hover: 'hover:border-green-200', iconBg: 'bg-green-100', iconColor: 'text-green-600' },
                    { icon: Bell, title: 'Auto Notifications', desc: 'SMS and email reminders sent to clients before their appointment. No-shows drop dramatically.', bg: 'bg-white', hover: 'hover:border-teal-200', iconBg: 'bg-teal-100', iconColor: 'text-teal-600' },
                    { icon: Shield, title: 'Anti-Spam Protection', desc: 'Phone verification and booking limits prevent fake bookings from blocking your schedule.', bg: 'bg-white', hover: 'hover:border-amber-200', iconBg: 'bg-amber-100', iconColor: 'text-amber-600' },
                    { icon: Users, title: 'Multi-Barber Scheduling', desc: 'Manage your entire team. Each barber has their own calendar, hours, and services.', bg: 'bg-white', hover: 'hover:border-blue-200', iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
                    { icon: BarChart3, title: 'Revenue Reports', desc: 'See exactly how much each barber earns, which services are popular, and track growth over time.', bg: 'bg-white', hover: 'hover:border-purple-200', iconBg: 'bg-purple-100', iconColor: 'text-purple-600' },
                ].map(({ icon: Icon, title, desc, bg, hover, iconBg, iconColor }, i) => (
                    <FadeIn key={i} delay={i * 0.07}>
                        <div className={`${bg} border border-slate-100 ${hover} rounded-2xl p-6 transition-all duration-300 hover:shadow-lg h-full`}>
                            <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center mb-4`}>
                                <Icon className={`h-5 w-5 ${iconColor}`} />
                            </div>
                            <h3 className="text-slate-900 font-bold text-sm mb-2">{title}</h3>
                            <p className="text-slate-400 text-xs leading-relaxed">{desc}</p>
                        </div>
                    </FadeIn>
                ))}
            </div>
        </div>
    </section>
);

// ─── Booking Demo ──────────────────────────────────────────────────────────────

const BookingDemo = () => {
    const [step, setStep] = useState(0);

    useEffect(() => {
        const t = setInterval(() => setStep(s => (s + 1) % 4), 2200);
        return () => clearInterval(t);
    }, []);

    const steps = [
        { label: 'Select a barber', icon: Users },
        { label: 'Choose a time slot', icon: Clock },
        { label: 'Enter your number', icon: Bell },
        { label: 'Booking confirmed!', icon: Check },
    ];

    const barbers = ['Alex Martinez', 'Ryan Chen', 'Jordan Blake'];
    const slots = ['09:00', '10:30', '12:00', '14:30', '16:00'];

    return (
        <section className="py-28 bg-white overflow-hidden">
            <div className="max-w-5xl mx-auto px-5">
                <FadeIn className="text-center mb-16">
                    <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600 mb-3">Live preview</p>
                    <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
                        What your clients see
                    </h2>
                    <p className="text-slate-400 mt-4 text-base max-w-md mx-auto">
                        A clean, mobile-first booking experience. Book in under 30 seconds.
                    </p>
                </FadeIn>

                <div className="grid md:grid-cols-2 gap-12 items-center">
                    {/* Steps list */}
                    <FadeIn delay={0.1}>
                        <div className="space-y-3">
                            {steps.map((s, i) => {
                                const Icon = s.icon;
                                const active = i === step;
                                const done = i < step;
                                return (
                                    <div key={i} onClick={() => setStep(i)}
                                         className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
                                             active ? 'bg-emerald-50 border-emerald-200' :
                                             done ? 'bg-slate-50 border-slate-100' :
                                             'border-transparent opacity-50'
                                         }`}>
                                        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all ${
                                            done ? 'bg-emerald-100' : active ? 'bg-emerald-500' : 'bg-slate-100'
                                        }`}>
                                            {done ? <Check className="h-4 w-4 text-emerald-600" /> :
                                             <Icon className={`h-4 w-4 ${active ? 'text-white' : 'text-slate-400'}`} />}
                                        </div>
                                        <div>
                                            <p className={`text-sm font-bold ${active ? 'text-slate-900' : 'text-slate-400'}`}>Step {i + 1}</p>
                                            <p className={`text-xs ${active ? 'text-emerald-600' : 'text-slate-400'}`}>{s.label}</p>
                                        </div>
                                        {active && <div className="ml-auto w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
                                    </div>
                                );
                            })}
                        </div>
                    </FadeIn>

                    {/* Phone mockup */}
                    <FadeIn delay={0.2}>
                        <div className="relative mx-auto w-[260px]">
                            <div className="relative bg-slate-900 border border-slate-700 rounded-[2.5rem] p-3 shadow-2xl">
                                <div className="w-20 h-5 bg-slate-800 rounded-full mx-auto mb-3" />
                                <div className="bg-white rounded-[1.75rem] overflow-hidden min-h-[400px] p-4">
                                    <AnimatePresence mode="wait">
                                        {step === 0 && (
                                            <motion.div key="s0"
                                                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                                transition={{ duration: 0.3 }} className="space-y-3">
                                                <p className="text-slate-900 text-xs font-bold mb-4">Choose your barber</p>
                                                {barbers.map((b, i) => (
                                                    <div key={b} className={`flex items-center gap-3 p-3 rounded-xl border ${i === 0 ? 'border-emerald-300 bg-emerald-50' : 'border-slate-100'}`}>
                                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center">
                                                            <span className="text-xs font-bold text-white">{b[0]}</span>
                                                        </div>
                                                        <div>
                                                            <p className="text-slate-900 text-[10px] font-semibold">{b}</p>
                                                            <p className="text-slate-400 text-[9px]">Available today</p>
                                                        </div>
                                                        {i === 0 && <Check className="h-3.5 w-3.5 text-emerald-500 ml-auto" />}
                                                    </div>
                                                ))}
                                            </motion.div>
                                        )}
                                        {step === 1 && (
                                            <motion.div key="s1"
                                                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                                transition={{ duration: 0.3 }} className="space-y-2">
                                                <p className="text-slate-900 text-xs font-bold mb-4">Pick a time slot</p>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {slots.map((s, i) => (
                                                        <div key={s} className={`py-2 rounded-lg text-center text-[10px] font-semibold border ${i === 1 ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'border-slate-100 text-slate-500'}`}>{s}</div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                        {step === 2 && (
                                            <motion.div key="s2"
                                                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                                transition={{ duration: 0.3 }} className="space-y-4">
                                                <p className="text-slate-900 text-xs font-bold mb-4">Your phone number</p>
                                                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                                                    <p className="text-slate-600 text-[10px]">+1 (555) 000-0000</p>
                                                </div>
                                                <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl py-3 text-center">
                                                    <p className="text-white text-[10px] font-bold">Confirm Booking</p>
                                                </div>
                                            </motion.div>
                                        )}
                                        {step === 3 && (
                                            <motion.div key="s3"
                                                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                                                transition={{ duration: 0.4 }} className="flex flex-col items-center justify-center h-full gap-4 pt-12">
                                                <motion.div
                                                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                                                    transition={{ type: 'spring', delay: 0.1 }}
                                                    className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center"
                                                >
                                                    <Check className="h-8 w-8 text-emerald-600" />
                                                </motion.div>
                                                <p className="text-slate-900 font-black text-sm">Booking Confirmed!</p>
                                                <p className="text-slate-400 text-[10px] text-center">Alex · Haircut · Wed 10:30</p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-40 h-10 bg-emerald-400/20 blur-2xl rounded-full" />
                        </div>
                    </FadeIn>
                </div>
            </div>
        </section>
    );
};

// ─── How it works ──────────────────────────────────────────────────────────────

const HowItWorks = () => (
    <section className="py-28 bg-slate-900" id="how-it-works">
        <div className="max-w-5xl mx-auto px-5">
            <FadeIn className="text-center mb-16">
                <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-3">Setup</p>
                <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">Up and running in 5 minutes</h2>
            </FadeIn>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { n: '01', title: 'Create your barbershop', desc: 'Sign up, name your shop, add your barbers and services. Takes under 5 minutes.' },
                    { n: '02', title: 'Share your booking link', desc: 'Put your unique link in your Instagram bio, WhatsApp status, or anywhere online.' },
                    { n: '03', title: 'Clients book instantly', desc: 'They pick a barber, choose a time, confirm. You get notified. That\'s it.' },
                ].map((s, i) => (
                    <FadeIn key={i} delay={i * 0.1}>
                        <div className="relative bg-white/[0.04] border border-white/[0.08] rounded-2xl p-7 group hover:border-emerald-500/30 transition-all">
                            <span className="text-5xl font-black text-white/[0.04] absolute top-5 right-6 leading-none select-none">{s.n}</span>
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-5">
                                <span className="text-emerald-400 font-bold text-sm">{s.n}</span>
                            </div>
                            <h3 className="text-white font-bold text-sm mb-3">{s.title}</h3>
                            <p className="text-white/40 text-xs leading-relaxed">{s.desc}</p>
                        </div>
                    </FadeIn>
                ))}
            </div>
        </div>
    </section>
);

// ─── Pricing ───────────────────────────────────────────────────────────────────

const Pricing = () => (
    <section className="py-28 bg-white" id="pricing">
        <div className="max-w-4xl mx-auto px-5">
            <FadeIn className="text-center mb-16">
                <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600 mb-3">Pricing</p>
                <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">Simple, honest pricing</h2>
                <p className="text-slate-400 mt-4 text-base">No hidden fees. No surprises.</p>
            </FadeIn>

            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                <FadeIn delay={0.05}>
                    <div className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col h-full">
                        <p className="text-slate-500 text-sm font-semibold mb-1">Starter</p>
                        <div className="flex items-end gap-1 mb-6">
                            <span className="text-4xl font-black text-slate-900">Free</span>
                            <span className="text-slate-400 text-sm mb-1.5">forever</span>
                        </div>
                        <ul className="space-y-3 flex-1 mb-8">
                            {['1 barber', 'Unlimited bookings', 'Booking link', 'Basic reports'].map(f => (
                                <li key={f} className="flex items-center gap-2.5 text-sm text-slate-600">
                                    <Check className="h-4 w-4 text-slate-300 shrink-0" /> {f}
                                </li>
                            ))}
                        </ul>
                        <a href="/register" className="w-full py-3 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold text-center hover:border-slate-300 hover:bg-slate-50 transition-all">
                            Get started free
                        </a>
                    </div>
                </FadeIn>

                <FadeIn delay={0.1}>
                    <div className="relative bg-slate-900 rounded-2xl p-8 flex flex-col h-full overflow-hidden">
                        <div className="absolute top-4 right-4 bg-gradient-to-r from-emerald-400 to-green-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                            POPULAR
                        </div>
                        <div className="absolute -top-16 -right-16 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
                        <p className="text-white text-sm font-semibold mb-1">Pro</p>
                        <div className="flex items-end gap-1 mb-6">
                            <span className="text-4xl font-black text-white">$10</span>
                            <span className="text-slate-400 text-sm mb-1.5">/month</span>
                        </div>
                        <ul className="space-y-3 flex-1 mb-8">
                            {[
                                'Up to 10 barbers',
                                'Unlimited bookings',
                                'Customer portal',
                                'Advanced reports',
                                'Notification reminders',
                                'Priority support',
                            ].map(f => (
                                <li key={f} className="flex items-center gap-2.5 text-sm text-slate-300">
                                    <Check className="h-4 w-4 text-emerald-400 shrink-0" /> {f}
                                </li>
                            ))}
                        </ul>
                        <a href="/register" className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white text-sm font-bold text-center transition-all shadow-lg shadow-emerald-500/20">
                            Start with Pro
                        </a>
                    </div>
                </FadeIn>
            </div>
        </div>
    </section>
);

// ─── Testimonials ──────────────────────────────────────────────────────────────

const Testimonials = () => (
    <section className="py-28 bg-slate-50 overflow-hidden">
        <div className="max-w-5xl mx-auto px-5">
            <FadeIn className="text-center mb-16">
                <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600 mb-3">Reviews</p>
                <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
                    Loved by shop owners
                </h2>
            </FadeIn>
            <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar snap-x">
                {[
                    { name: 'Julian P.', role: 'Lead Barber', text: 'We went from 20 DMs a day to zero. Clients book themselves and everything just works.' },
                    { name: 'Elena S.', role: 'Studio Owner', text: 'The dashboard is so clean. I can see my whole day at a glance. Never going back.' },
                    { name: 'Marcus W.', role: 'Senior Stylist', text: 'Double bookings were killing us. Since TrimFlow — not a single one in 6 months.' },
                    { name: 'David L.', role: 'Shop Director', text: "Managing four locations used to be a nightmare. Now it's just a few taps." },
                    { name: 'Sofia R.', role: 'Barbershop Owner', text: 'My clients love the booking link. I share it on Instagram and they book in seconds.' },
                ].map((r, i) => (
                    <div key={i} className="flex-none w-72 snap-center bg-white border border-slate-100 rounded-2xl p-6 hover:border-emerald-100 hover:shadow-lg transition-all">
                        <div className="flex gap-0.5 mb-4">
                            {[...Array(5)].map((_, j) => <Star key={j} className="h-3.5 w-3.5 fill-emerald-500 text-emerald-500" />)}
                        </div>
                        <p className="text-slate-600 text-sm leading-relaxed mb-5">"{r.text}"</p>
                        <div className="pt-4 border-t border-slate-50">
                            <p className="text-slate-900 text-xs font-bold">{r.name}</p>
                            <p className="text-emerald-600 text-[10px] font-medium mt-0.5">{r.role}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
        <style dangerouslySetInnerHTML={{ __html: `.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}` }} />
    </section>
);


// ─── Footer ────────────────────────────────────────────────────────────────────

const Footer = () => (
    <footer className="bg-slate-50 border-t border-slate-100">
        {/* Main footer grid */}
        <div className="max-w-6xl mx-auto px-5 pt-20 pb-12">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-12 md:gap-8">

                {/* Col 1 — Brand (spans 2 cols on md) */}
                <div className="md:col-span-2">
                    <TrimFlowLogo dark />
                    <p className="mt-4 text-sm text-slate-400 leading-relaxed max-w-xs">
                        The modern booking and management platform built for barbershops. Run your shop smarter.
                    </p>
                    {/* Social icons */}
                    <div className="flex items-center gap-3 mt-6">
                        {[
                            { label: 'Instagram', svg: <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/> },
                            { label: 'Twitter/X', svg: <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/> },
                        ].map(({ label, svg }) => (
                            <a key={label} href="#" aria-label={label}
                               className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-600 flex items-center justify-center text-slate-400 transition-colors">
                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">{svg}</svg>
                            </a>
                        ))}
                    </div>
                </div>

                {/* Col 2 — Product */}
                <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-900 mb-5">Product</p>
                    <ul className="space-y-3">
                        {[
                            { label: 'Features', href: '#features' },
                            { label: 'Pricing', href: '#pricing' },
                            { label: 'How it works', href: '#how-it-works' },
                            { label: 'Integrations', href: '#' },
                        ].map(l => (
                            <li key={l.label}>
                                <a href={l.href} className="text-sm text-slate-400 hover:text-slate-900 transition-colors">{l.label}</a>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Col 3 — Company */}
                <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-900 mb-5">Company</p>
                    <ul className="space-y-3">
                        {['About', 'Careers', 'Blog', 'Press'].map(l => (
                            <li key={l}>
                                <a href="#" className="text-sm text-slate-400 hover:text-slate-900 transition-colors">{l}</a>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Col 4 — Resources */}
                <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-900 mb-5">Resources</p>
                    <ul className="space-y-3">
                        {[
                            { label: 'Documentation', href: '#' },
                            { label: 'Help Center', href: '#' },
                            { label: 'Contact', href: '#' },
                            { label: 'Sign in', href: '/login' },
                        ].map(l => (
                            <li key={l.label}>
                                <a href={l.href} className="text-sm text-slate-400 hover:text-slate-900 transition-colors">{l.label}</a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-100">
            <div className="max-w-6xl mx-auto px-5 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-slate-400">© 2026 Freshio. All rights reserved.</p>
                <div className="flex items-center gap-5 text-xs text-slate-400">
                    <a href="#" className="hover:text-slate-900 transition-colors">Privacy Policy</a>
                    <a href="#" className="hover:text-slate-900 transition-colors">Terms of Service</a>
                    <a href="#" className="hover:text-slate-900 transition-colors">Cookie Policy</a>
                </div>
            </div>
        </div>
    </footer>
);

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function Welcome() {
    return (
        <div className="min-h-screen bg-white font-sans text-slate-900">
            <Navbar />
            <Hero />
            <Stats />
            <Problems />
            <Features />
            <BookingDemo />
            <HowItWorks />
            <Testimonials />
            <Pricing />
            <Footer />
        </div>
    );
}
