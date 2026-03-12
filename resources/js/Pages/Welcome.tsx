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
    ArrowRight, Menu, X, Star, Scissors,
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

                    {/* Desktop links */}
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white">
                        {['Features', 'Barbers', 'Clients', 'Stories'].map(l => (
                            <a key={l} href={`#${l.toLowerCase()}`} className="hover:text-zinc-300 transition-colors">{l}</a>
                        ))}
                    </div>

                    {/* Desktop auth */}
                    <div className="hidden md:flex items-center gap-3">
                        {canLogin && (
                            <a href="/login" className="text-sm font-medium text-white hover:text-zinc-300 transition-colors px-4 py-2">Login</a>
                        )}
                        {canRegister && (
                            <a href="/register" className="text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl transition-all">Get Started</a>
                        )}
                    </div>

                    {/* Mobile: Login + Sign Up + hamburger */}
                    <div className="flex md:hidden items-center gap-3">
                        {canLogin && <a href="/login" className="text-sm font-medium text-white border border-zinc-600 px-4 py-1.5 rounded-full hover:border-zinc-400 transition-all">Login</a>}
                        {canRegister && <a href="/register" className="text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-full transition-all">Sign Up</a>}
                        <button className="p-1 text-white" onClick={() => setOpen(v => !v)}>
                            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile dropdown */}
            {open && (
                <div className="fixed inset-0 z-[99] bg-black flex flex-col" style={{ paddingTop: '64px' }}>
                    {/* Nav links */}
                    <div className="flex flex-col px-6 pt-8 gap-1 flex-1">
                        {['Features', 'Barbers', 'Clients', 'Stories'].map(l => (
                            <a key={l} href={`#${l.toLowerCase()}`} onClick={() => setOpen(false)}
                                className="text-2xl font-light text-white hover:text-zinc-400 py-3 border-b border-zinc-900 tracking-wide">
                                {l}
                            </a>
                        ))}
                    </div>

                    {/* Bottom CTA */}
                    <div className="px-6 pb-10 space-y-3">
                        <p className="text-xs text-zinc-600 uppercase tracking-widest mb-4">Get started today</p>
                        {canLogin && (
                            <a href="/login" className="block text-center py-3 border border-zinc-700 rounded-full text-sm font-medium text-white hover:border-zinc-500 transition-all">
                                Login
                            </a>
                        )}
                        {canRegister && (
                            <a href="/register" className="block text-center py-3 bg-blue-600 hover:bg-blue-700 rounded-full text-sm font-semibold text-white transition-all">
                                Create Account
                            </a>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

// ─── Hero ─────────────────────────────────────────────────────────────────────

const Hero = () => (
    <section className="relative min-h-screen flex flex-col items-center justify-center bg-black pt-16">

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full flex flex-col items-center text-center">
            {/* Headline */}
            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="text-6xl sm:text-5xl md:text-6xl text-white tracking-tight leading-[1.05] mb-6 max-w-3xl mt-16"
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
                className="mb-48"
            >
                <a href="/register"
                    className="text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white px-12 py-3 rounded-full transition-all">
                    Get Started
                </a>
            </motion.div>

            {/* Hero showcase — mobile: center phone only; desktop: full floating layout */}
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="w-full mt-8 md:mt-20"
            >
                {/* Mobile: single centered phone over gray box */}
                <div className="flex md:hidden justify-center relative" style={{ height: '420px' }}>
                    {/* Gray background box */}
                    <div className="absolute left-0 right-0 rounded-3xl bg-slate-400" style={{ top: '60px', bottom: '60px' }} />
                    {/* Phone */}
                    <div className="relative z-10 rounded-[20px] p-[1.5px] shadow-[0_40px_80px_rgba(0,0,0,0.5)]" style={{ width: '220px', height: '420px', background: 'rgba(255,255,255,0.3)' }}>
                        <div className="rounded-[19px] overflow-hidden w-full h-full bg-zinc-900">
                            <video autoPlay loop muted playsInline className="w-full h-full object-cover">
                                <source src="/videos/haircut.mp4" type="video/mp4" />
                            </video>
                        </div>
                    </div>
                </div>

                {/* Desktop: full floating layout */}
                <div className="hidden md:block relative" style={{ height: '500px' }}>
                    {/* Gray background box */}
                    <div
                        className="absolute left-0 right-0 rounded-3xl bg-slate-400"
                        style={{ top: '80px', bottom: '80px' }}
                    />

                    {/* Left phone */}
                    <div className="absolute z-20" style={{ left: '6%', top: '0', width: '260px' }}>
                        <div className="rounded-[20px] p-[1.5px] shadow-[0_30px_60px_rgba(0,0,0,0.4)]" style={{ height: '500px', background: 'rgba(255,255,255,0.3)' }}>
                            <div className="rounded-[19px] overflow-hidden w-full h-full">
                                <img src="/left-side.png" alt="App screen" className="w-full h-full object-cover" />
                            </div>
                        </div>
                    </div>

                    {/* Center phone — tallest, most prominent */}
                    <div className="absolute left-1/2 -translate-x-1/2 z-30" style={{ top: '-40px', width: '300px' }}>
                        <div className="rounded-[20px] p-[1.5px] shadow-[0_40px_80px_rgba(0,0,0,0.5)]" style={{ height: '580px', background: 'rgba(255,255,255,0.3)' }}>
                            <div className="rounded-[19px] overflow-hidden w-full h-full bg-zinc-900">
                                <video autoPlay loop muted playsInline className="w-full h-full object-cover">
                                    <source src="/videos/haircut.mp4" type="video/mp4" />
                                </video>
                            </div>
                        </div>
                    </div>

                    {/* Right phone */}
                    <div className="absolute z-20" style={{ right: '6%', top: '0', width: '260px' }}>
                        <div className="rounded-[20px] p-[1.5px] shadow-[0_30px_60px_rgba(0,0,0,0.4)]" style={{ height: '500px', background: 'rgba(255,255,255,0.3)' }}>
                            <div className="rounded-[19px] overflow-hidden w-full h-full">
                                <img src="/right-side.png" alt="App screen" className="w-full h-full object-cover" />
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    </section>
);


// ─── Marquee ──────────────────────────────────────────────────────────────────

const marqueeItems = [
    'Elite Cuts', 'The Fade Room', 'Sharp & Co.', 'Classic Barbers', 'Blade & Brush',
    'The Cut Lab', 'Fresh Edges', 'Crown Cuts', 'Prestige Barbershop', 'The Lineup',
    'Gents Only', 'Studio 305', 'Uptown Fades', 'The Gentleman\'s Club', 'Zero Fade',
];

const Marquee = () => (
    <div className="mt-20 py-10 bg-black border-y border-zinc-900 overflow-hidden">
        <div className="flex w-max animate-[marquee_30s_linear_infinite]">
            {[...marqueeItems, ...marqueeItems].map((name, i) => (
                <div key={i} className="flex items-center gap-6 px-8">
                    <span className="text-sm font-semibold text-zinc-500 whitespace-nowrap tracking-wide uppercase">{name}</span>
                    <span className="h-1 w-1 rounded-full bg-zinc-700 shrink-0" />
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

// ─── Lock in Loyalty ──────────────────────────────────────────────────────────

const LockInLoyalty = () => (
    <section className="py-32 bg-black" id="features">
        <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">

                {/* LEFT: marketing content */}
                <FadeIn>
                    {/* Label */}
                    <p className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-4">Retention</p>

                    {/* Headline */}
                    <h2
                        className="text-[80px] leading-none text-white mb-6"
                        style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.01em' }}
                    >
                        Lock in<br />loyalty
                    </h2>

                    {/* Paragraph */}
                    <p className="text-zinc-400 text-sm leading-relaxed mb-10 max-w-xs">
                        Launch your own booking app so clients can tap your icon on their phone and book instantly. No app store needed — it lives right on their home screen.
                    </p>

                    {/* CTA Button */}
                    <a
                        href="/register"
                        className="inline-flex items-center gap-2 border border-white text-white text-sm font-semibold px-6 py-3 rounded-full hover:bg-white hover:text-black transition-all duration-200"
                    >
                        Be an icon <ArrowRight className="h-4 w-4" />
                    </a>
                </FadeIn>

                {/* RIGHT: layered visual */}
                <FadeIn delay={0.15}>
                    <div className="relative flex items-center justify-center mt-16 md:mt-0" style={{ height: '480px' }}>

                        {/* Element 1: Background card */}
                        <div
                            className="absolute bg-pink-400 rounded-3xl"
                            style={{
                                width: '100%',
                                maxWidth: '560px',
                                height: '340px',
                                top: '70px',
                                right: '0',
                            }}
                        />

                        {/* Element 2: Dashboard — top right, overlapping card */}
                        <div
                            className="absolute overflow-hidden shadow-2xl"
                            style={{
                                width: '320px',
                                borderRadius: '20px',
                                top: '0',
                                right: '80px',
                            }}
                        >
                            <img
                                src="/dashboard.png"
                                alt="Dashboard"
                                className="w-full h-auto object-contain"
                            />
                        </div>

                        {/* Element 3: Barber photo — front, bottom-left */}
                        <div
                            className="absolute z-20 overflow-hidden shadow-[0_30px_70px_rgba(0,0,0,0.6)]"
                            style={{
                                width: '230px',
                                height: '290px',
                                borderRadius: '20px',
                                bottom: '0',
                                left: '60px',
                            }}
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

// ─── Barbers & Clients ────────────────────────────────────────────────────────

const BarbersClients = () => (
    <section className="py-32 bg-black" id="barbers">
        <div className="max-w-7xl mx-auto px-6">

            {/* Top label */}
            <FadeIn>
                <p className="text-xs uppercase tracking-widest text-white font-bold mb-6">For</p>
            </FadeIn>

            {/* Interactive headline */}
            <FadeIn>
                <h2
                    className="text-7xl md:text-8xl leading-none mb-16"
                    style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.01em' }}
                >
                    <span className="text-blue-500 hover:text-white transition-colors duration-300 cursor-default">Barbers </span>
                    <span className="text-zinc-500 hover:text-white transition-colors duration-300 cursor-default">
                        Business Clients
                    </span>
                </h2>
            </FadeIn>

            {/* Content block */}
            <div className="grid grid-cols-1 md:grid-cols-[3fr_1fr] items-stretch">

                {/* Left: barber image — no right border radius */}
                <FadeIn>
                    <img
                        src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80"
                        alt="Barber"
                        className="w-full object-cover shadow-xl"
                        style={{ aspectRatio: '21/9', borderRadius: '12px 0 0 12px' }}
                    />
                </FadeIn>

                {/* Right: dark card — no left border radius */}
                <FadeIn delay={0.1}>
                    <div className="bg-neutral-900 p-6 shadow-xl h-full flex flex-col justify-center" style={{ borderRadius: '0 12px 12px 0' }}>
                        <p className="text-zinc-300 text-sm leading-relaxed mb-6">
                            Take control of your schedule, clients, money, and brand.
                        </p>
                        <a
                            href="/register"
                            className="inline-flex items-center gap-2 border border-zinc-600 text-zinc-400 rounded-full px-4 py-1.5 text-xs font-bold hover:border-white hover:text-white transition-all duration-200 w-fit"
                        >
                            Find out how
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

// ─── Shop Stories ─────────────────────────────────────────────────────────────

const stories = [
    {
        name: 'Marcus Johnson',
        shop: 'Classic Cuts NYC',
        avatar: 'https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=100&q=80',
        text: "Before Freshio, I was managing bookings through Instagram DMs at midnight. Now my schedule fills itself. Revenue is up 40% in three months.",
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
        text: "Freshio turned my shop into a fully booked machine. Clients love the experience and I love not dealing with missed calls.",
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
                        <div className={`bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden ${i === 1 || i === 4 ? 'md:mt-8' : ''}`}>
                            {s.image && (
                                <img src={s.image} alt="Barbershop" className="w-full h-48 object-cover" />
                            )}
                            <div className="p-6">
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

// ─── Footer ───────────────────────────────────────────────────────────────────

const Footer = () => (
    <footer className="bg-black border-t border-zinc-900 text-zinc-500 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-10 pb-12 border-b border-zinc-900">
                <div className="col-span-2">
                    <span className="text-base font-black text-white mb-4 block">Freshio</span>
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
                <p>© 2026 Freshio. All rights reserved.</p>
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

export default function Welcome({ canLogin, canRegister, ads = [] }: Props) {
    return (
        <div className="min-h-screen bg-black font-sans antialiased">
            <Navbar canLogin={canLogin} canRegister={canRegister} />
            <Hero />
            <Marquee />
            <LockInLoyalty />
            <BarbersClients />
            <ShopStories />
            <GetFree />
            <ScrollDemo />
            <Footer />
        </div>
    );
}
