import React, { useState, useEffect, useRef } from 'react';
// Load Bebas Neue from Google Fonts
if (typeof document !== 'undefined') {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap';
    document.head.appendChild(link);
}
import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
    ArrowRight, Menu, X, Star, Check, ChevronRight, Scissors,
    Calendar, Users, Bell, BarChart3,
} from 'lucide-react';

interface Props {
    canLogin: boolean;
    canRegister: boolean;
    ads?: Array<{ id: number; headline: string; sub: string | null; emoji: string }>;
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

function Logo() {
    return (
        <div className="flex items-center gap-2.5">
            <span className="text-2xl font-black tracking-tight text-white">
                Freshio
            </span>
        </div>
    );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

const Navbar = ({ canLogin, canRegister }: { canLogin: boolean; canRegister: boolean }) => {
    const [open, setOpen] = useState(false);
    const scrolled = useScrolled();

    return (
        <>
            <nav className={`fixed top-0 inset-x-0 z-[100] transition-all duration-300 ${
                scrolled ? 'bg-black/95 backdrop-blur-xl' : 'bg-transparent'
            }`}>
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Logo />

                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white">
                        {['Features', 'Barbers', 'Clients', 'Stories'].map(l => (
                            <a key={l} href={`#${l.toLowerCase()}`} className="hover:text-white transition-colors">{l}</a>
                        ))}
                    </div>

                    <div className="hidden md:flex items-center gap-3">
                        {canLogin && (
                            <a href="/login" className="text-sm font-medium text-white hover:text-zinc-300 transition-colors px-4 py-2">
                                Login
                            </a>
                        )}
                        {canRegister && (
                            <a href="/register" className="text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl transition-all">
                                Get Started
                            </a>
                        )}
                    </div>

                    <button className="md:hidden p-2 rounded-lg text-zinc-400 hover:text-white" onClick={() => setOpen(v => !v)}>
                        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </nav>

            {/* Mobile menu */}
            {open && (
                <div className="fixed inset-0 z-[99] bg-black pt-16 flex flex-col p-6 gap-4">
                    {['Features', 'Barbers', 'Clients', 'Stories'].map(l => (
                        <a key={l} href={`#${l.toLowerCase()}`} onClick={() => setOpen(false)}
                            className="text-lg font-medium text-zinc-300 hover:text-white py-2 border-b border-zinc-800">
                            {l}
                        </a>
                    ))}
                    <div className="mt-4 flex flex-col gap-3">
                        {canLogin && <a href="/login" className="text-center py-3 border border-zinc-700 rounded-xl font-medium text-zinc-300">Login</a>}
                        {canRegister && <a href="/register" className="text-center py-3 bg-blue-600 text-white rounded-xl font-semibold">Get Started</a>}
                    </div>
                </div>
            )}
        </>
    );
};

// ─── Hero ─────────────────────────────────────────────────────────────────────

const Hero = () => (
    <section className="relative min-h-screen flex flex-col items-center justify-center bg-black pt-16 overflow-hidden">

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full flex flex-col items-center text-center">
            {/* Headline */}
            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="text-4xl sm:text-5xl md:text-6xl text-white tracking-tight leading-[1.05] mb-6 max-w-3xl mt-16"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
                The easiest way to manage{' '}
                barber appointments
            </motion.h1>

            <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.25 }}
                className="text-base text-zinc-400 max-w-lg mb-10 leading-relaxed"
            >
                Let clients book in seconds, reduce no-shows, and grow your barbershop — all from one simple dashboard.
            </motion.p>

            <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.35 }}
                className="mb-24"
            >
                <a href="/register"
                    className="text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white px-12 py-3 rounded-full transition-all">
                    Get Started
                </a>
            </motion.div>

            {/* Hero phone showcase */}
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="relative w-full flex items-end justify-center gap-6 pb-0"
                style={{ minHeight: '520px' }}
            >
                {/* Left phone 1 — taller, slightly back */}
                <div className="relative z-10 shrink-0" style={{ width: '200px', marginBottom: '0px' }}>
                    <div className="bg-slate-400 rounded-[40px] p-2.5 shadow-2xl">
                        <div className="rounded-[32px] overflow-hidden" style={{ height: '420px' }}>
                            <img
                                src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&q=80"
                                alt="Barber at work"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>

                {/* Left phone 2 — slightly shorter */}
                <div className="relative z-10 shrink-0" style={{ width: '200px', marginBottom: '40px' }}>
                    <div className="bg-slate-400 rounded-[40px] p-2.5 shadow-2xl">
                        <div className="rounded-[32px] overflow-hidden" style={{ height: '380px' }}>
                            <img
                                src="https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=400&q=80"
                                alt="Barbershop"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>

                {/* Center phone — biggest, video */}
                <div className="relative z-20 shrink-0" style={{ width: '260px', marginBottom: '0px' }}>
                    <div className="bg-slate-400 rounded-[48px] p-3 shadow-[0_40px_80px_rgba(0,0,0,0.5)]">
                        {/* Notch */}
                        <div className="absolute top-6 left-1/2 -translate-x-1/2 w-20 h-5 bg-slate-400 rounded-full z-30" />
                        <div className="rounded-[38px] overflow-hidden" style={{ height: '520px' }}>
                            <video
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="w-full h-full object-cover"
                            >
                                <source src="/videos/app-demo.mp4" type="video/mp4" />
                                {/* Fallback */}
                                <img
                                    src="https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400&q=80"
                                    alt="App demo"
                                    className="w-full h-full object-cover"
                                />
                            </video>
                        </div>
                    </div>
                </div>

                {/* Right phone — mirror of left 2 */}
                <div className="relative z-10 shrink-0" style={{ width: '200px', marginBottom: '40px' }}>
                    <div className="bg-slate-400 rounded-[40px] p-2.5 shadow-2xl">
                        <div className="rounded-[32px] overflow-hidden" style={{ height: '380px' }}>
                            <img
                                src="https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=400&q=80"
                                alt="Haircut"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>

                {/* Right phone — mirror of left 1 */}
                <div className="relative z-10 shrink-0" style={{ width: '200px', marginBottom: '0px' }}>
                    <div className="bg-slate-400 rounded-[40px] p-2.5 shadow-2xl">
                        <div className="rounded-[32px] overflow-hidden" style={{ height: '420px' }}>
                            <img
                                src="https://images.unsplash.com/photo-1596728325488-58c87691e9af?w=400&q=80"
                                alt="Barber shop"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    </section>
);

// ─── Marquee ──────────────────────────────────────────────────────────────────

const Marquee = ({ ads }: { ads: Props['ads'] }) => {
    const defaultAds = [
        { id: 1, emoji: '💈', headline: 'Classic Cuts Barbershop — Open 7 days', sub: 'Book now →' },
        { id: 2, emoji: '✂️', headline: "Tony's Fade Studio — New clients welcome", sub: 'Book now →' },
        { id: 3, emoji: '🪒', headline: 'The Shave Bar — Premium grooming', sub: 'Book now →' },
        { id: 4, emoji: '💈', headline: 'Kings & Kutz — Walk-ins available', sub: 'Book now →' },
        { id: 5, emoji: '✂️', headline: 'Fresh Edges — Best fades in town', sub: 'Book now →' },
        { id: 6, emoji: '🪒', headline: 'Elite Cuts — Beard trims & hot towel', sub: 'Book now →' },
    ];
    const items = (ads && ads.length > 0 ? ads : defaultAds);
    const doubled = [...items, ...items];

    return (
        <section className="py-0 bg-black border-y border-zinc-800 overflow-hidden">
            <div className="text-center pt-5 pb-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Shops on Freshio</span>
            </div>
            <div className="relative pb-5">
                <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
                <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />
                <motion.div
                    className="flex gap-3 w-max"
                    animate={{ x: ['0%', '-50%'] }}
                    transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                >
                    {doubled.map((ad, i) => (
                        <div key={i} className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-3 shrink-0 hover:border-blue-200 hover:bg-blue-50/40 transition-colors cursor-pointer group">
                            <span className="text-lg">{ad.emoji}</span>
                            <div>
                                <p className="text-xs font-semibold text-zinc-200 whitespace-nowrap">{ad.headline}</p>
                                <p className="text-[10px] text-blue-600 font-bold group-hover:underline">{ad.sub}</p>
                            </div>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

// ─── Lock in Loyalty ──────────────────────────────────────────────────────────

const LockInLoyalty = () => (
    <section className="py-28 bg-black" id="features">
        <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-16 items-center">
                {/* Left */}
                <FadeIn>
                    <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-4">Retention</p>
                    <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-6">
                        Lock in loyalty
                    </h2>
                    <div className="space-y-4 mb-8">
                        {[
                            { icon: Bell, title: 'Automated reminders', text: 'SMS and email reminders reduce no-shows by up to 60%. Clients never forget their appointment.' },
                            { icon: Calendar, title: 'Easy rebooking', text: 'One tap to rebook their last service. Returning clients book 3x faster than new ones.' },
                            { icon: Star, title: 'Loyalty rewards', text: 'Build a points system that keeps clients coming back. Reward your best customers automatically.' },
                            { icon: Users, title: 'Client profiles', text: 'Every client has a profile with their history, preferences, and notes. Know your regulars.' },
                        ].map(({ icon: Icon, title, text }) => (
                            <div key={title} className="flex gap-4 p-4 rounded-xl hover:bg-zinc-800 transition-colors group">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-950 text-blue-400 shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <Icon className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="font-semibold text-white text-sm mb-0.5">{title}</p>
                                    <p className="text-sm text-zinc-400 leading-relaxed">{text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <a href="/register" className="inline-flex items-center gap-2 bg-slate-900 text-white border border-slate-700 font-semibold px-6 py-3 rounded-xl text-sm hover:bg-slate-800 transition-all">
                        Learn more <ArrowRight className="h-4 w-4" />
                    </a>
                </FadeIn>

                {/* Right */}
                <FadeIn delay={0.15}>
                    <div className="relative">
                        <img
                            src="https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800&q=80"
                            alt="Barbershop"
                            className="w-full rounded-3xl object-cover shadow-2xl"
                            style={{ height: '560px' }}
                        />
                        {/* Floating stat card */}
                        <div className="absolute -bottom-6 -left-6 bg-zinc-900 rounded-2xl p-5 shadow-xl border border-zinc-800">
                            <p className="text-3xl font-black text-white">60%</p>
                            <p className="text-xs text-zinc-400 mt-1">fewer no-shows<br />on average</p>
                        </div>
                        <div className="absolute -top-6 -right-6 bg-blue-600 rounded-2xl p-5 shadow-xl">
                            <p className="text-3xl font-black text-white">4.9</p>
                            <p className="text-xs text-blue-200 mt-1">average shop<br />rating</p>
                        </div>
                    </div>
                </FadeIn>
            </div>
        </div>
    </section>
);

// ─── Barbers & Clients ────────────────────────────────────────────────────────

const BarbersClients = () => (
    <section className="py-28 bg-zinc-950" id="barbers">
        <div className="max-w-7xl mx-auto px-6">
            <FadeIn className="text-center mb-16">
                <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-3">Platform</p>
                <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                    Built for barbers and their clients
                </h2>
            </FadeIn>

            <div className="grid md:grid-cols-2 gap-8 items-stretch">
                {/* Left: image */}
                <FadeIn>
                    <img
                        src="https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800&q=80"
                        alt="Barber cutting hair"
                        className="w-full h-full rounded-3xl object-cover shadow-xl"
                        style={{ minHeight: '440px' }}
                    />
                </FadeIn>

                {/* Right: gray box */}
                <FadeIn delay={0.1}>
                    <div className="bg-zinc-800 rounded-3xl p-10 flex flex-col justify-center h-full">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white mb-6">
                            <BarChart3 className="h-6 w-6" />
                        </div>
                        <h3 className="text-2xl font-black text-white mb-4">Everything your shop needs</h3>
                        <p className="text-zinc-400 leading-relaxed mb-6">
                            Freshio gives barbers a full business toolkit — bookings, payments, client management, and analytics — while giving clients the smoothest booking experience they've ever had. No app downloads required.
                        </p>
                        <ul className="space-y-3 mb-8">
                            {[
                                'Online booking page shared via link',
                                'Real-time calendar for each barber',
                                'Automated payment collection',
                                'Revenue and performance reports',
                            ].map(item => (
                                <li key={item} className="flex items-center gap-3 text-sm text-zinc-300">
                                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-600 shrink-0">
                                        <Check className="h-3 w-3" />
                                    </div>
                                    {item}
                                </li>
                            ))}
                        </ul>
                        <a href="/register"
                            className="inline-flex items-center gap-2 bg-slate-900 text-white font-semibold px-6 py-3.5 rounded-xl text-sm hover:bg-slate-800 transition-all w-fit">
                            Find out how <ChevronRight className="h-4 w-4" />
                        </a>
                    </div>
                </FadeIn>
            </div>
        </div>
    </section>
);

// ─── Shop Stories ─────────────────────────────────────────────────────────────

const stories = [
    {
        name: 'Marcus Johnson',
        shop: 'Classic Cuts NYC',
        avatar: 'https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=100&q=80',
        text: "Before Freshio, I was managing bookings through Instagram DMs at midnight. Now my schedule fills itself. Revenue is up 40% in three months.",
        rating: 5,
        height: 'h-auto',
    },
    {
        name: 'David Kowalski',
        shop: 'The Fade Factory',
        avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&q=80',
        text: "The client profiles are a game changer. I know every regular's preferences before they even sit down. It's made my work so much more personal and efficient.",
        rating: 5,
        height: 'h-auto',
    },
    {
        name: 'Arben Gashi',
        shop: 'Fresh Edges Prishtina',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&q=80',
        text: "Set up in 10 minutes. My clients love the booking link. No-shows dropped from 3-4 a week to almost zero. Simple, fast, professional.",
        rating: 5,
        height: 'h-auto',
    },
];

const ShopStories = () => (
    <section className="py-28 bg-black" id="stories">
        <div className="max-w-7xl mx-auto px-6">
            <FadeIn className="text-center mb-16">
                <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-3">Testimonials</p>
                <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">Shop stories</h2>
                <p className="text-zinc-400 mt-4 max-w-md mx-auto">Real barbers, real results.</p>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                {stories.map((s, i) => (
                    <FadeIn key={s.name} delay={i * 0.1}>
                        <div className={`bg-zinc-900 rounded-2xl p-6 border border-zinc-800 ${i === 1 ? 'md:mt-8' : ''}`}>
                            <div className="flex gap-1 mb-4">
                                {Array.from({ length: s.rating }).map((_, j) => (
                                    <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                                ))}
                            </div>
                            <p className="text-zinc-300 text-sm leading-relaxed mb-6">"{s.text}"</p>
                            <div className="flex items-center gap-3 pt-4 border-t border-zinc-700">
                                <img src={s.avatar} alt={s.name} className="h-10 w-10 rounded-full object-cover" />
                                <div>
                                    <p className="font-semibold text-white text-sm">{s.name}</p>
                                    <p className="text-xs text-zinc-500">{s.shop}</p>
                                </div>
                            </div>
                        </div>
                    </FadeIn>
                ))}
            </div>
        </div>
    </section>
);

// ─── Get Freshio Free ─────────────────────────────────────────────────────────

const GetFree = () => (
    <section className="py-28 bg-black" id="clients">
        <div className="max-w-7xl mx-auto px-6">
            <div className="bg-blue-600 rounded-3xl px-8 py-16 md:px-16 flex flex-col md:flex-row items-center gap-12 overflow-hidden relative">
                {/* Background pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />

                {/* Left: phone mockup */}
                <div className="relative z-10 shrink-0">
                    <div className="bg-slate-900 rounded-[36px] p-3 shadow-2xl w-[200px]">
                        <div className="bg-zinc-800 rounded-[26px] overflow-hidden" style={{ height: '380px' }}>
                            <div className="bg-blue-700 px-4 py-5">
                                <div className="text-white text-xs font-bold">Freshio Booking</div>
                                <div className="text-blue-200 text-[10px] mt-0.5">Marcus's Barbershop</div>
                            </div>
                            <div className="p-3 space-y-2">
                                <div className="bg-zinc-900 rounded-xl p-3 shadow-sm">
                                    <p className="text-[9px] text-zinc-500 mb-1">Select service</p>
                                    <div className="space-y-1.5">
                                        {['Classic Haircut — $25', 'Beard Trim — $15', 'Full Package — $35'].map((s, i) => (
                                            <div key={i} className={`rounded-lg px-2 py-1.5 text-[8px] font-medium ${i === 0 ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-300'}`}>{s}</div>
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-zinc-900 rounded-xl p-3 shadow-sm">
                                    <p className="text-[9px] text-zinc-500 mb-1.5">Pick a time</p>
                                    <div className="grid grid-cols-3 gap-1">
                                        {['9:00', '10:30', '12:00', '2:00', '3:30', '5:00'].map((t, i) => (
                                            <div key={i} className={`rounded-md py-1 text-center text-[7px] font-semibold ${i === 2 ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-300'}`}>{t}</div>
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-blue-600 rounded-xl py-2.5 text-center text-white text-[9px] font-bold">
                                    Confirm Booking →
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: text */}
                <div className="relative z-10 text-white max-w-lg">
                    <p className="text-xs font-bold uppercase tracking-widest text-blue-200 mb-4">Start today</p>
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight mb-6">
                        Get Freshio<br />for free
                    </h2>
                    <p className="text-blue-100 text-lg leading-relaxed mb-8">
                        Set up your booking page in under 10 minutes. No credit card required. Start accepting appointments today.
                    </p>
                    <a href="/register"
                        className="inline-flex items-center gap-2 bg-white text-blue-600 font-bold px-8 py-4 rounded-xl hover:bg-blue-50 transition-all shadow-lg text-sm">
                        Start now <ArrowRight className="h-4 w-4" />
                    </a>
                </div>
            </div>
        </div>
    </section>
);

// ─── Scroll Feature Demo ──────────────────────────────────────────────────────

const ScrollDemo = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end end'] });
    const screen = useTransform(scrollYProgress, [0, 0.5, 1], [0, 0, 1]);
    const [showSecond, setShowSecond] = useState(false);
    useEffect(() => screen.on('change', v => setShowSecond(v > 0.5)), [screen]);

    return (
        <section ref={containerRef} className="relative bg-slate-950" style={{ height: '200vh' }} id="how-it-works">
            <div className="sticky top-0 h-screen flex overflow-hidden">
                {/* Left sticky title */}
                <div className="w-1/3 flex flex-col justify-center px-12 shrink-0">
                    <p className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-4">How it works</p>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shrink-0">
                            <Scissors className="h-4 w-4" />
                        </div>
                        <span className="text-2xl font-black text-white">Fresh<span className="text-blue-400">io</span></span>
                    </div>
                    <h2 className="text-3xl font-black text-white leading-tight mb-6">
                        {showSecond ? 'Manage every appointment' : 'Your shop, fully online'}
                    </h2>
                    <p className="text-slate-400 text-sm leading-relaxed mb-8">
                        {showSecond
                            ? 'View, confirm, and manage every booking from a clean dashboard. Get notified instantly.'
                            : 'Share your booking link and clients book themselves. Zero back-and-forth.'}
                    </p>
                    <div className="flex flex-col gap-3">
                        {[
                            { label: 'Booking page', active: !showSecond },
                            { label: 'Dashboard', active: showSecond },
                        ].map(({ label, active }) => (
                            <div key={label} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${active ? 'bg-blue-600/20 border border-blue-500/30' : 'border border-transparent'}`}>
                                <div className={`h-2 w-2 rounded-full ${active ? 'bg-blue-400' : 'bg-slate-700'}`} />
                                <span className={`text-sm font-medium ${active ? 'text-white' : 'text-slate-500'}`}>{label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: screenshots */}
                <div className="flex-1 flex items-center justify-center px-8 relative">
                    <AnimatePresence mode="wait">
                        {!showSecond ? (
                            <motion.div key="screen1"
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.5 }}
                                className="w-full max-w-2xl bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl"
                            >
                                <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800">
                                    <div className="h-3 w-3 rounded-full bg-red-500/70" />
                                    <div className="h-3 w-3 rounded-full bg-yellow-500/70" />
                                    <div className="h-3 w-3 rounded-full bg-green-500/70" />
                                    <div className="flex-1 bg-slate-800 rounded-md h-5 mx-4 flex items-center px-3">
                                        <span className="text-[9px] text-slate-500">freshio.app/book/marcus-barbershop</span>
                                    </div>
                                </div>
                                <img
                                    src="https://images.unsplash.com/photo-1560066984-138daaa0ad8a?w=900&q=80"
                                    alt="Booking interface"
                                    className="w-full object-cover"
                                    style={{ height: '420px' }}
                                />
                            </motion.div>
                        ) : (
                            <motion.div key="screen2"
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.5 }}
                                className="w-full max-w-2xl bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl"
                            >
                                <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800">
                                    <div className="h-3 w-3 rounded-full bg-red-500/70" />
                                    <div className="h-3 w-3 rounded-full bg-yellow-500/70" />
                                    <div className="h-3 w-3 rounded-full bg-green-500/70" />
                                    <div className="flex-1 bg-slate-800 rounded-md h-5 mx-4 flex items-center px-3">
                                        <span className="text-[9px] text-slate-500">app.freshio.com/dashboard</span>
                                    </div>
                                </div>
                                <img
                                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&q=80"
                                    alt="Dashboard"
                                    className="w-full object-cover"
                                    style={{ height: '420px' }}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
};

// ─── Footer ───────────────────────────────────────────────────────────────────

const Footer = () => (
    <footer className="bg-slate-950 text-slate-400 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
                <div className="col-span-2">
                    <div className="flex items-center gap-2.5 mb-4">
                        <span className="text-base font-black text-white">Freshio</span>
                    </div>
                    <p className="text-sm leading-relaxed max-w-xs">
                        The modern appointment platform built for barbershops. Simple, fast, and reliable.
                    </p>
                    <div className="flex gap-3 mt-5">
                        {['IG', 'X', 'YT'].map((label) => (
                            <a key={label} href="#" className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 hover:bg-blue-600 hover:text-white transition-colors text-xs font-bold text-slate-400 hover:text-white">
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

            <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
                <p>© 2026 Freshio. All rights reserved.</p>
                <div className="flex gap-6">
                    <a href="#" className="hover:text-slate-400 transition-colors">Privacy</a>
                    <a href="#" className="hover:text-slate-400 transition-colors">Terms</a>
                    <a href="#" className="hover:text-slate-400 transition-colors">Cookies</a>
                </div>
            </div>
        </div>
    </footer>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Welcome({ canLogin, canRegister, ads = [] }: Props) {
    return (
        <div className="min-h-screen bg-black font-sans antialiased">
            <Navbar canLogin={canLogin} canRegister={canRegister} />
            <Hero />
            <Marquee ads={ads} />
            <LockInLoyalty />
            <BarbersClients />
            <ShopStories />
            <GetFree />
            <ScrollDemo />
            <Footer />
        </div>
    );
}
