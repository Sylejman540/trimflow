import React, { useState, useEffect, useRef } from 'react';
if (typeof document !== 'undefined') {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap';
    document.head.appendChild(link);
}
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Menu, X, Zap, Shield, Globe, Heart, Target, Users, Calendar, BarChart3, Bell, Scissors, CreditCard, TrendingUp, ChevronDown, Star } from 'lucide-react';

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

// ─── Mega Menu Data ────────────────────────────────────────────────────────────

const megaMenuColumns = [
    {
        heading: 'For Clients',
        items: [
            { icon: Calendar, label: 'Easy Booking', desc: 'Book a barber in under 30 seconds' },
            { icon: Bell, label: 'Smart Reminders', desc: 'Never miss an appointment again' },
            { icon: Star, label: 'Reviews & Ratings', desc: 'Find the best barber near you' },
            { icon: Users, label: 'Loyalty Rewards', desc: 'Earn points with every visit' },
        ],
    },
    {
        heading: 'For Barbers',
        items: [
            { icon: Scissors, label: 'Schedule Manager', desc: 'Control your calendar, block time off' },
            { icon: BarChart3, label: 'Earnings Dashboard', desc: 'Track revenue and top services' },
            { icon: CreditCard, label: 'Instant Payouts', desc: 'Get paid fast, no delays' },
            { icon: Shield, label: 'No-show Protection', desc: 'Deposits and auto-cancellation' },
        ],
    },
    {
        heading: 'For Barbershops',
        items: [
            { icon: Users, label: 'Team Management', desc: 'Manage multiple barbers in one place' },
            { icon: TrendingUp, label: 'Shop Analytics', desc: 'Revenue, retention, and growth metrics' },
            { icon: Zap, label: 'Automated Marketing', desc: 'Re-engage clients on autopilot' },
            { icon: Zap, label: 'Custom Booking Page', desc: 'Your shop, your brand' },
        ],
    },
];

// ─── Navbar ───────────────────────────────────────────────────────────────────

const Navbar = () => {
    const [open, setOpen] = useState(false);
    const [megaOpen, setMegaOpen] = useState(false);
    const [mobileFeatures, setMobileFeatures] = useState(false);
    const scrolled = useScrolled();
    const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleFeaturesEnter = () => {
        if (leaveTimer.current) clearTimeout(leaveTimer.current);
        setMegaOpen(true);
    };
    const handleFeaturesLeave = () => {
        leaveTimer.current = setTimeout(() => setMegaOpen(false), 120);
    };

    return (
        <>
            <nav className={`fixed top-0 inset-x-0 z-[100] transition-all duration-300 ${
                scrolled ? 'bg-black/95 backdrop-blur-xl shadow-lg shadow-black/30' : 'bg-transparent'
            }`}>
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <a href="/" className="text-2xl font-black tracking-tight text-white">Fade</a>

                    {/* Desktop center links */}
                    <div className="hidden md:flex items-center gap-1 text-sm font-medium">
                        <a href="/#how-it-works" className="px-4 py-2 rounded-lg hover:bg-white/5 transition-colors text-zinc-300 hover:text-white">How it works</a>

                        <div
                            className="relative"
                            onMouseEnter={handleFeaturesEnter}
                            onMouseLeave={handleFeaturesLeave}
                        >
                            <button className={`flex items-center gap-1 px-4 py-2 rounded-lg transition-colors ${megaOpen ? 'bg-white/10 text-white' : 'text-zinc-300 hover:bg-white/5 hover:text-white'}`}>
                                Features
                                <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${megaOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {megaOpen && (
                                <div
                                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[780px] bg-white rounded-2xl shadow-2xl border border-zinc-100 overflow-hidden"
                                    onMouseEnter={handleFeaturesEnter}
                                    onMouseLeave={handleFeaturesLeave}
                                >
                                    <div className="grid grid-cols-3 divide-x divide-zinc-100">
                                        {megaMenuColumns.map((col) => (
                                            <div key={col.heading} className="p-6">
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-4">{col.heading}</p>
                                                <ul className="space-y-1">
                                                    {col.items.map(({ icon: Icon, label, desc }) => (
                                                        <li key={label}>
                                                            <a href="/#features" className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-zinc-50 transition-colors group">
                                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors mt-0.5">
                                                                    <Icon className="h-4 w-4" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-semibold text-zinc-900 leading-tight">{label}</p>
                                                                    <p className="text-xs text-zinc-500 mt-0.5 leading-snug">{desc}</p>
                                                                </div>
                                                            </a>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="bg-zinc-950 px-6 py-4 flex items-center justify-between">
                                        <div>
                                            <p className="text-white text-sm font-semibold">Start free — no credit card needed</p>
                                            <p className="text-zinc-400 text-xs mt-0.5">Join barbershops already using Fade to grow</p>
                                        </div>
                                        <a href="/register" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-colors shrink-0">
                                            Get started free <ArrowRight className="h-3.5 w-3.5" />
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>

                        <a href="/#pricing" className="px-4 py-2 rounded-lg hover:bg-white/5 transition-colors text-zinc-300 hover:text-white">Pricing</a>
                        <a href="/company" className="px-4 py-2 rounded-lg hover:bg-white/5 transition-colors text-white bg-white/5">Company</a>
                        <a href="/#support" className="px-4 py-2 rounded-lg hover:bg-white/5 transition-colors text-zinc-300 hover:text-white">Support</a>
                    </div>

                    <div className="hidden md:flex items-center gap-2">
                        <a href="/login" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors px-4 py-2">Login</a>
                        <a href="/register" className="text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl transition-all">Book Appointment</a>
                    </div>

                    <div className="flex md:hidden items-center gap-3">
                        <a href="/login" className="text-sm font-medium text-white border border-zinc-700 px-4 py-1.5 rounded-full hover:border-zinc-400 transition-all">Login</a>
                        <button className="p-1 text-white" onClick={() => setOpen(v => !v)}>
                            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                    </div>
                </div>
            </nav>

            {open && (
                <div className="fixed inset-0 z-[99] bg-black flex flex-col overflow-y-auto" style={{ paddingTop: '64px' }}>
                    <div className="flex flex-col px-6 pt-6 gap-0 flex-1">
                        <a href="/#how-it-works" onClick={() => setOpen(false)}
                            className="text-xl font-light text-white hover:text-zinc-400 py-3.5 border-b border-zinc-900 tracking-wide">
                            How it works
                        </a>
                        <button
                            onClick={() => setMobileFeatures(v => !v)}
                            className="flex items-center justify-between text-xl font-light text-white hover:text-zinc-400 py-3.5 border-b border-zinc-900 tracking-wide w-full text-left"
                        >
                            Features
                            <ChevronDown className={`h-4 w-4 transition-transform ${mobileFeatures ? 'rotate-180' : ''}`} />
                        </button>
                        {mobileFeatures && (
                            <div className="bg-zinc-950 rounded-xl mb-1 overflow-hidden">
                                {megaMenuColumns.map((col) => (
                                    <div key={col.heading} className="px-4 py-3">
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 mb-2">{col.heading}</p>
                                        {col.items.map(({ icon: Icon, label }) => (
                                            <a key={label} href="/#features" onClick={() => setOpen(false)}
                                                className="flex items-center gap-2.5 py-2 text-sm text-zinc-300 hover:text-white transition-colors">
                                                <Icon className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                                                {label}
                                            </a>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        )}
                        {[{ label: 'Pricing', href: '/#pricing' }, { label: 'Company', href: '/company' }, { label: 'Support', href: '/#support' }].map(({ label, href }) => (
                            <a key={label} href={href} onClick={() => setOpen(false)}
                                className="text-xl font-light text-white hover:text-zinc-400 py-3.5 border-b border-zinc-900 tracking-wide">
                                {label}
                            </a>
                        ))}
                    </div>
                    <div className="px-6 pb-10 pt-6 space-y-3">
                        <a href="/login" className="block text-center py-3 border border-zinc-700 rounded-full text-sm font-medium text-white hover:border-zinc-500 transition-all">Login</a>
                        <a href="/register" className="block text-center py-3 bg-blue-600 hover:bg-blue-500 rounded-full text-sm font-semibold text-white transition-all">Book Appointment</a>
                    </div>
                </div>
            )}
        </>
    );
};

// ─── Hero ─────────────────────────────────────────────────────────────────────

const Hero = () => (
    <section className="relative min-h-[70vh] flex flex-col items-center justify-center bg-black pt-16">
        {/* Grid bg */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
        {/* Blue glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[400px] w-[800px] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center py-24">
            <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-6"
            >
                Our Story
            </motion.p>
            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="text-6xl sm:text-7xl md:text-8xl text-white leading-none mb-8"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
                Built for the craft.<br />
                <span className="text-blue-500">Built for barbers.</span>
            </motion.h1>
            <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.25 }}
                className="text-base md:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed"
            >
                Fade started in a barbershop chair. We watched barbers lose clients to missed DMs, double-booked slots, and no-shows. So we built the tool we wish existed.
            </motion.p>
        </div>
    </section>
);

// ─── Mission ──────────────────────────────────────────────────────────────────

const Mission = () => (
    <section className="py-24 md:py-32 bg-black">
        <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-center">
                <FadeIn>
                    <p className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-4">Mission</p>
                    <h2
                        className="text-[56px] md:text-[72px] leading-none text-white mb-8"
                        style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                    >
                        Give every barber a fair shot
                    </h2>
                    <p className="text-zinc-400 text-base leading-relaxed max-w-sm">
                        Big salon chains have software teams. Independent barbers don't. Fade levels the playing field with professional tools that take minutes to set up and seconds to use.
                    </p>
                </FadeIn>
                <FadeIn delay={0.15}>
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { n: '00', label: 'Barbers active' },
                            { n: '00', label: 'Appointments booked' },
                            { n: '00', label: 'Countries' },
                            { n: '00', label: 'Satisfaction rate' },
                        ].map(({ n, label }) => (
                            <div key={label} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                                <p className="text-5xl text-white mb-1" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>{n}</p>
                                <p className="text-xs text-zinc-500 uppercase tracking-widest font-medium">{label}</p>
                            </div>
                        ))}
                    </div>
                </FadeIn>
            </div>
        </div>
    </section>
);

// ─── Values ───────────────────────────────────────────────────────────────────

const values = [
    { icon: Zap, title: 'Speed first', desc: 'Every feature is designed to save time — yours and your clients\'.' },
    { icon: Shield, title: 'Privacy by default', desc: 'Client data belongs to you. We never sell it, share it, or use it for ads.' },
    { icon: Globe, title: 'Built for everyone', desc: 'Available in 15+ languages. Barbershop culture is global and so are we.' },
    { icon: Users, title: 'Community driven', desc: 'Real barbers shape our roadmap. Every major feature came from a customer request.' },
    { icon: Heart, title: 'Genuinely care', desc: 'We answer support ourselves. Not a bot. Not a ticket queue. A person who gives a damn.' },
    { icon: Target, title: 'Laser focused', desc: 'We do one thing — barbershop management. We do it better than anyone.' },
];

const Values = () => (
    <section className="py-20 md:py-28 bg-black border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-6">
            <FadeIn className="mb-16 text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-4">What we stand for</p>
                <h2
                    className="text-5xl md:text-7xl leading-none text-white"
                    style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                >
                    Our values
                </h2>
            </FadeIn>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-px bg-zinc-800 rounded-2xl overflow-hidden">
                {values.map(({ icon: Icon, title, desc }, i) => (
                    <FadeIn key={title} delay={i * 0.06}>
                        <div className="bg-black p-8 hover:bg-zinc-950 transition-colors">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/10 border border-blue-600/20 mb-5">
                                <Icon className="h-5 w-5 text-blue-500" />
                            </div>
                            <h3 className="text-white font-semibold text-base mb-2">{title}</h3>
                            <p className="text-zinc-500 text-sm leading-relaxed">{desc}</p>
                        </div>
                    </FadeIn>
                ))}
            </div>
        </div>
    </section>
);

// ─── CTA ──────────────────────────────────────────────────────────────────────

const CTA = () => (
    <section className="py-20 md:py-28 bg-black border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-6">
            <div className="bg-blue-600 rounded-3xl px-8 py-16 md:px-16 md:py-20 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
                <div className="relative z-10">
                    <FadeIn>
                        <h2
                            className="text-5xl md:text-7xl text-white leading-none mb-6"
                            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                        >
                            Ready to join us?
                        </h2>
                        <p className="text-blue-100 text-base md:text-lg max-w-lg mx-auto mb-8 leading-relaxed">
                            Start your free account today. No credit card, no contracts — just a better way to run your shop.
                        </p>
                        <a
                            href="/register"
                            className="inline-flex items-center gap-2 bg-white text-blue-600 font-bold px-8 py-4 rounded-xl hover:bg-blue-50 transition-all shadow-lg text-sm"
                        >
                            Get started free <ArrowRight className="h-4 w-4" />
                        </a>
                    </FadeIn>
                </div>
            </div>
        </div>
    </section>
);

// ─── Footer ───────────────────────────────────────────────────────────────────

const Footer = () => (
    <footer className="bg-black border-t border-zinc-900 text-zinc-500 pt-14 pb-8">
        <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-10 pb-10 md:pb-12 border-b border-zinc-900">
                <div className="col-span-2">
                    <span className="text-base font-black text-white mb-4 block">Fade</span>
                    <p className="text-sm leading-relaxed max-w-xs">
                        The modern appointment platform built for barbershops. Simple, fast, and reliable.
                    </p>
                    <div className="flex gap-3 mt-5">
                        {['IG', 'X', 'YT'].map((label) => (
                            <a key={label} href="#" className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 hover:bg-blue-600 hover:text-white transition-colors text-xs font-bold">
                                {label}
                            </a>
                        ))}
                    </div>
                </div>
                {[
                    { title: 'Product', links: ['Features', 'Pricing', 'Changelog', 'Roadmap'] },
                    { title: 'Company', links: ['About', 'Blog', 'Careers', 'Press'] },
                    { title: 'Resources', links: ['Docs', 'Help Center', 'API', 'Status'] },
                ].map(col => (
                    <div key={col.title}>
                        <p className="text-white font-semibold text-sm mb-4">{col.title}</p>
                        <ul className="space-y-2.5">
                            {col.links.map(link => (
                                <li key={link}>
                                    <a href="#" className="text-sm hover:text-white transition-colors">{link}</a>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
            <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-700">
                <p>© 2026 Fade. All rights reserved.</p>
                <div className="flex gap-6">
                    <a href="#" className="hover:text-zinc-400 transition-colors">Privacy</a>
                    <a href="#" className="hover:text-zinc-400 transition-colors">Terms</a>
                    <a href="#" className="hover:text-zinc-400 transition-colors">Cookies</a>
                </div>
            </div>
        </div>
    </footer>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Company() {
    return (
        <div className="min-h-screen bg-black font-sans antialiased">
            <Navbar />
            <Hero />
            <Mission />
            <Values />
            <CTA />
            <Footer />
        </div>
    );
}
