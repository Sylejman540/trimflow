import React, { useState, useEffect } from 'react';
import {
    Calendar, BarChart3, Scissors, Check,
    ArrowRight, Settings, Menu, X,
    Smartphone, ShieldCheck, Star, Users
} from 'lucide-react';

function FreshioLogo({ dark = true }: { dark?: boolean }) {
    return (
        <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-sm shrink-0">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                    <path d="M12 2C9.5 6 7 8.5 7 12a5 5 0 0 0 10 0c0-3.5-2.5-6-5-10z" opacity="0.9"/>
                    <path d="M12 8c-1 2.5-2 4-2 5.5a2 2 0 0 0 4 0C14 12 13 10.5 12 8z" fill="white" opacity="0.6"/>
                </svg>
            </div>
            <span className={`text-lg font-bold tracking-tight ${dark ? 'text-slate-900' : 'text-white'}`}>
                Fresh<span className="text-emerald-500">io</span>
            </span>
        </div>
    );
}

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            <nav className={`fixed top-0 w-full z-[200] transition-all duration-500 ${
                scrolled || isOpen
                    ? 'bg-white/90 backdrop-blur-md border-b border-slate-100 py-4'
                    : 'bg-transparent py-6 md:py-8'
            }`}>
                <div className="max-w-7xl mx-auto px-5 md:px-10 flex items-center justify-between">
                    <div className="relative z-[210]">
                        {scrolled || isOpen ? <FreshioLogo dark /> : <FreshioLogo dark={false} />}
                    </div>

                    <div className={`hidden lg:flex items-center gap-12 text-[10px] font-bold uppercase tracking-[0.3em] transition-colors ${scrolled ? 'text-slate-500' : 'text-white/70'}`}>
                        <a href="#features" className="hover:text-emerald-600 transition-colors">Features</a>
                        <a href="#how" className="hover:text-emerald-600 transition-colors">How it works</a>
                        <a href="#reviews" className="hover:text-emerald-600 transition-colors">Reviews</a>
                    </div>

                    <div className="flex items-center gap-4 relative z-[210]">
                        <a href="/login" className={`hidden sm:block text-[10px] font-bold uppercase tracking-[0.3em] transition-colors hover:text-emerald-600 ${scrolled ? 'text-slate-500' : 'text-white/70'}`}>
                            Sign In
                        </a>
                        <a href="/register" className="bg-slate-900 text-white px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-emerald-600 transition-all shadow-sm">
                            Get Started
                        </a>
                        <button onClick={() => setIsOpen(!isOpen)} className={`lg:hidden p-1 relative z-[220] ${scrolled || isOpen ? 'text-slate-900' : 'text-white'}`}>
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </nav>

            <div className={`fixed inset-0 z-[150] bg-white transition-all duration-500 ease-in-out lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className="flex flex-col h-full pt-32 px-10 pb-12 justify-between">
                    <div className="space-y-8">
                        {['Features', 'How it works', 'Reviews'].map((item) => (
                            <a key={item} href="#" onClick={() => setIsOpen(false)} className="block text-4xl font-bold tracking-tighter text-slate-900 hover:text-emerald-600">{item}</a>
                        ))}
                    </div>
                    <div className="pt-10 border-t border-slate-100">
                        <a href="/register" className="block w-full bg-slate-900 text-white py-5 rounded-full text-[10px] font-bold uppercase tracking-[0.3em] text-center hover:bg-emerald-600 transition-all">
                            Get Started Free
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
};

const Hero = () => (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
            <img
                src="https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=2000"
                className="w-full h-full object-cover"
                alt="Barber Shop"
            />
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-[2px]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-10 w-full text-center relative z-10 pt-20">
            <div className="inline-block mb-6">
                <span className="bg-emerald-500/20 text-emerald-400 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-emerald-500/30 backdrop-blur-md">
                    The New Standard in Shop Management
                </span>
            </div>
            <h1 className="text-5xl sm:text-7xl md:text-[100px] lg:text-[120px] font-bold tracking-tighter text-white leading-[0.95] mb-8">
                Simplify the <br />
                <span className="text-emerald-400 italic font-light">modern shop.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
                Online bookings, schedule management, and revenue tracking — all in one clean dashboard.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a href="/register" className="w-full sm:w-auto bg-white text-slate-900 h-14 px-10 rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center gap-3 group">
                    Start Free <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </a>
                <a href="/login" className="w-full sm:w-auto h-14 px-10 rounded-xl text-[11px] font-bold uppercase tracking-widest text-white border border-white/20 hover:bg-white/10 transition-all flex items-center justify-center">
                    Sign In
                </a>
            </div>
        </div>
    </section>
);

const StatsSection = () => (
    <section className="py-20 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-y-12 text-center">
                {[
                    { label: 'Active Shops', val: '2.4k+' },
                    { label: 'Bookings', val: '1.2M' },
                    { label: 'Revenue', val: '$45M' },
                    { label: 'Time Saved', val: '14hrs' },
                    { label: 'Uptime', val: '99.9%' },
                    { label: 'Rating', val: '4.9/5' },
                ].map((s, i) => (
                    <div key={i} className="flex flex-col gap-2">
                        <span className="text-3xl font-bold text-slate-900 tracking-tighter">{s.val}</span>
                        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-600">{s.label}</span>
                    </div>
                ))}
            </div>
        </div>
    </section>
);

const FeaturesGrid = () => (
    <section id="features" className="py-32 bg-white px-6 md:px-10">
        <div className="max-w-7xl mx-auto">
            <div className="mb-20 max-w-xl">
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-4">Everything you need</p>
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900">Built for barbers,<br />not spreadsheets.</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-16 gap-y-16">
                {[
                    { title: 'Online Booking', icon: Calendar, desc: 'Customers book directly from your link — no phone calls, no back and forth.' },
                    { title: 'Smart Schedule', icon: BarChart3, desc: 'Day, week, and month calendar views with drag-and-drop rescheduling.' },
                    { title: 'Team Management', icon: Users, desc: 'Add barbers, set their hours, and track individual performance.' },
                    { title: 'Shop Settings', icon: Settings, desc: 'Manage your services, pricing, and shop details in one place.' },
                    { title: 'Revenue Reports', icon: BarChart3, desc: 'See exactly how much you earned, by barber and by service.' },
                    { title: 'Secure & Reliable', icon: ShieldCheck, desc: 'Your data is protected and the platform stays online when you need it.' },
                ].map((f, i) => (
                    <div key={i} className="flex flex-col group">
                        <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                            <f.icon size={20} />
                        </div>
                        <h4 className="text-xs font-bold uppercase tracking-widest text-slate-900 mb-3">{f.title}</h4>
                        <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    </section>
);

const ReviewsSection = () => {
    const reviews = [
        { name: 'Julian P.', role: 'Lead Barber', review: 'The interface is so clean it actually makes me want to look at my schedule.' },
        { name: 'Elena S.', role: 'Studio Owner', review: 'Finally, a platform that understands that aesthetic matters as much as function.' },
        { name: 'Marcus W.', role: 'Senior Stylist', review: 'The automated re-booking has increased my monthly revenue by 15%.' },
        { name: 'Sophia R.', role: 'Spa Manager', review: 'Client profiles let us provide a truly personalised experience every time.' },
        { name: 'David L.', role: 'Director', review: "Managing four locations used to be a nightmare. Now it's just a few taps." },
        { name: 'Nathan B.', role: 'Shop Owner', review: 'This is the first software that actually feels like it was built for us.' },
    ];

    return (
        <section id="reviews" className="py-32 bg-slate-50 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 md:px-10">
                <div className="mb-16">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-4">Reviews</p>
                    <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
                        Loved by the <span className="text-emerald-500 italic font-light">community.</span>
                    </h2>
                </div>
                <div className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory no-scrollbar">
                    {reviews.map((r, i) => (
                        <div key={i} className="flex-none w-[300px] md:w-[380px] snap-center bg-white p-8 border border-slate-100 rounded-2xl shadow-sm hover:border-emerald-100 transition-all">
                            <div className="flex gap-1 mb-5">
                                {[...Array(5)].map((_, j) => <Star key={j} size={11} className="fill-emerald-500 text-emerald-500" />)}
                            </div>
                            <p className="text-slate-600 text-sm leading-relaxed mb-6">"{r.review}"</p>
                            <div className="pt-5 border-t border-slate-50">
                                <h4 className="font-bold text-slate-900 text-[10px] uppercase tracking-widest">{r.name}</h4>
                                <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">{r.role}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <style dangerouslySetInnerHTML={{ __html: `.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}` }} />
        </section>
    );
};

const HowItWorks = () => (
    <section id="how" className="py-32 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6 md:px-10 text-center mb-20">
            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-4">Simple setup</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Up and running in minutes.</h2>
        </div>
        <div className="max-w-7xl mx-auto px-6 md:px-10 grid grid-cols-1 md:grid-cols-4 gap-12">
            {[
                { step: '01', title: 'Create your shop', desc: 'Sign up, name your shop, and you\'re in.' },
                { step: '02', title: 'Add your team', desc: 'Add barbers and set their working hours.' },
                { step: '03', title: 'Add services', desc: 'List your services with prices and durations.' },
                { step: '04', title: 'Share your link', desc: 'Send customers your booking link and start receiving appointments.' },
            ].map((p, i) => (
                <div key={i} className="border-l border-slate-800 pl-8">
                    <span className="text-emerald-500 font-bold text-xs uppercase mb-4 block">{p.step}</span>
                    <h4 className="text-lg font-bold mb-2">{p.title}</h4>
                    <p className="text-slate-400 text-sm leading-relaxed">{p.desc}</p>
                </div>
            ))}
        </div>
        <div className="max-w-7xl mx-auto px-6 md:px-10 mt-20 text-center">
            <a href="/register" className="inline-flex items-center gap-3 bg-emerald-500 hover:bg-emerald-400 text-white h-14 px-10 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all group">
                Get started free <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </a>
        </div>
    </section>
);

const Footer = () => (
    <footer className="bg-white pt-16 pb-10 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 md:px-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <FreshioLogo dark />
            <p className="text-xs text-slate-400">© 2026 Freshio. All rights reserved.</p>
            <div className="flex items-center gap-6 text-xs text-slate-400">
                <a href="#" className="hover:text-slate-900 transition-colors">Privacy</a>
                <a href="#" className="hover:text-slate-900 transition-colors">Terms</a>
                <a href="/login" className="hover:text-slate-900 transition-colors">Sign In</a>
            </div>
        </div>
    </footer>
);

export default function FreshioSite() {
    return (
        <div className="min-h-screen bg-white font-sans text-slate-900">
            <Navbar />
            <Hero />
            <StatsSection />
            <FeaturesGrid />
            <ReviewsSection />
            <HowItWorks />
            <Footer />
        </div>
    );
}
