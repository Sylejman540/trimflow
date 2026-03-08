import React, { useState, useRef, useEffect } from 'react';
import { 
  Calendar, Users, BarChart3, Scissors, Check, 
  ArrowRight, LayoutDashboard, Settings, Menu, X, 
  Globe, ChevronLeft, ChevronRight, TrendingUp, Star,
  Smartphone, Zap, ShieldCheck
} from 'lucide-react';

// --- STYLES & FONTS ---
const FontImport = () => (
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,700;1,700&display=swap" rel="stylesheet" />
);

// --- ANIMATION HOOK ---
const useCountUp = (end, duration = 2000) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration]);
  return count;
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-[100] transition-all duration-500 ${scrolled ? 'bg-white/90 backdrop-blur-md border-b border-slate-100 py-4' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 md:px-10 flex items-center justify-between">
        <div className="flex items-center gap-2 relative z-[110]">
          <Scissors className="text-slate-900 w-5 h-5" />
          <span className="text-xl font-semibold tracking-tight text-slate-900">TrimFlow</span>
        </div>

        <div className="hidden lg:flex items-center gap-10 text-[11px] font-medium uppercase tracking-[0.2em] text-slate-400">
          <a href="#" className="hover:text-slate-900 transition-colors">Platform</a>
          <a href="#" className="hover:text-slate-900 transition-colors">Pricing</a>
          <a href="#" className="hover:text-slate-900 transition-colors">Resources</a>
        </div>

        <div className="flex items-center gap-6 relative z-[110]">
          <a href="/login" className="hidden sm:block text-slate-600 text-sm font-medium hover:text-slate-900 transition-colors">Log in</a>
          <a href="/register" className="bg-slate-900 text-white px-6 py-2.5 rounded-full text-xs font-semibold hover:bg-slate-800 transition-all">
            Join Now
          </a>
          <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden text-slate-900">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </nav>
  );
};

const Hero = () => (
  <section className="relative min-h-[95vh] flex items-center bg-white overflow-hidden">
    {/* Background Image Container */}
    <div className="absolute inset-0 z-0">
      <img 
        src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=2000" 
        alt="Minimalist Barber Interior" 
        className="w-full h-full object-cover grayscale-[0.5] opacity-25"
      />
      {/* Soft gradient to blend image into the white layout */}
      <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
    </div>

    <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 w-full pt-20">
      <div className="max-w-3xl">
        <div className="inline-block mb-8">
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400">Built for the Craft</span>
        </div>
        <h1 className="text-6xl md:text-[110px] font-light tracking-tighter text-slate-900 leading-[0.85] mb-12">
          Simplify the <br />
          <span className="font-serif italic text-slate-400">modern shop.</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-500 max-w-md mb-12 font-light leading-relaxed">
          The essential toolkit for ambitious studios. Clean interface, powerful automation, zero friction.
        </p>
        <div className="flex items-center gap-8">
          <a href="/register" className="bg-slate-900 text-white h-14 px-10 rounded-full font-medium hover:bg-slate-800 transition-all flex items-center justify-center">
            Start Free Trial
          </a>
          <a href="#features" className="text-slate-900 font-medium flex items-center gap-2 group">
            Explore Features <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>
    </div>
  </section>
);

const LiveStats = () => {
  const appointments = useCountUp(12480);
  const shops = useCountUp(450);

  return (
    <section className="bg-white py-24 border-y border-slate-50">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          {[
            { label: "Bookings Processed", val: `${appointments.toLocaleString()}+`, detail: "Real-time volume" },
            { label: "Platform Uptime", val: `99.9%`, detail: "Enterprise reliability" },
            { label: "Partner Studios", val: shops, detail: "Curated network" }
          ].map((stat, i) => (
            <div key={i} className="flex flex-col border-l border-slate-100 pl-8">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">{stat.label}</span>
              <h3 className="text-4xl font-light text-slate-900 mb-1">{stat.val}</h3>
              <p className="text-xs text-slate-400 font-light">{stat.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const HowItWorks = () => (
  <section className="py-32 bg-[#FAF9F6] px-6 md:px-10">
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
        <div>
          <h2 className="text-4xl md:text-5xl font-light tracking-tight text-slate-900 mb-8">Refined workflow.</h2>
          <p className="text-slate-500 text-lg font-light leading-relaxed max-w-md">
            We stripped away the clutter of traditional legacy software to leave you with only what matters.
          </p>
        </div>
        <div className="space-y-20">
          {[
            { step: "01", title: "Setup", desc: "Define your studio services and staff tiers with clean, intuitive inputs." },
            { step: "02", title: "Launch", desc: "Integrate with Instagram and your custom domain in seconds." },
            { step: "03", title: "Automate", desc: "Let the engine handle reminders, payouts, and re-booking flows." }
          ].map((item, i) => (
            <div key={i} className="flex gap-8 group">
              <span className="text-xs font-bold text-slate-200 group-hover:text-slate-900 transition-colors pt-1">{item.step}</span>
              <div>
                <h4 className="text-xl font-medium text-slate-900 mb-3">{item.title}</h4>
                <p className="text-slate-500 font-light text-sm leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

const FeaturesGrid = () => (
  <section id="features" className="py-32 bg-white px-6 md:px-10">
    <div className="max-w-7xl mx-auto">
      <div className="mb-24">
        <h2 className="text-4xl md:text-5xl font-light text-slate-900 tracking-tight mb-6">
          Everything, <span className="font-serif italic text-slate-400">nothing more.</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-20">
        {[
          { title: "Minimal Calendar", icon: Calendar, desc: "A clean interface focusing on your daily flow without visual noise." },
          { title: "Smart Analytics", icon: BarChart3, desc: "See your revenue and retention rates through elegant charts." },
          { title: "Guest Profiles", icon: Users, desc: "Track client history and preferences in a beautiful directory." },
          { title: "Global Controls", icon: Settings, desc: "Scale across locations with one unified administrative account." },
          { title: "Silent Alerts", icon: Smartphone, desc: "Automated SMS reminders that feel personal, not transactional." },
          { title: "Secure Vault", icon: ShieldCheck, desc: "Your studio data is encrypted and protected by enterprise protocols." }
        ].map((f, i) => (
          <div key={i} className="flex flex-col">
            <f.icon className="w-5 h-5 text-slate-300 mb-6" />
            <h4 className="text-lg font-medium text-slate-900 mb-3">{f.title}</h4>
            <p className="text-slate-500 font-light text-sm leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const ReviewsSection = () => {
  const scrollRef = useRef(null);
  const reviews = [
    { name: "Julian P.", role: "Lead Barber", avatar: "https://randomuser.me/api/portraits/men/32.jpg", review: "The interface is so clean it actually makes me want to look at my schedule." },
    { name: "Elena S.", role: "Studio Owner", avatar: "https://randomuser.me/api/portraits/women/44.jpg", review: "Finally, a platform that understands aesthetic matters as much as function." },
    { name: "Marcus W.", role: "Senior Stylist", avatar: "https://randomuser.me/api/portraits/men/12.jpg", review: "The automated re-booking has increased my monthly revenue by 15% easily." },
    { name: "Sasha K.", role: "Manager", avatar: "https://randomuser.me/api/portraits/women/68.jpg", review: "Managing four locations used to be a nightmare. Now it's a single dashboard." }
  ];

  const scroll = (dir) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      scrollRef.current.scrollTo({ 
        left: dir === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth, 
        behavior: 'smooth' 
      });
    }
  };

  return (
    <section className="py-32 bg-[#FAF9F6] overflow-hidden px-6 md:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-16">
          <div>
            <h2 className="text-4xl font-light text-slate-900 tracking-tight">Voices of the studio.</h2>
            <p className="text-slate-400 font-light mt-3 italic font-serif">Trusted by the industry's elite.</p>
          </div>
          <div className="flex gap-4">
            <button onClick={() => scroll('left')} className="w-12 h-12 border border-slate-200 rounded-full flex items-center justify-center hover:bg-white transition-all"><ChevronLeft size={18}/></button>
            <button onClick={() => scroll('right')} className="w-12 h-12 border border-slate-200 rounded-full flex items-center justify-center hover:bg-white transition-all"><ChevronRight size={18}/></button>
          </div>
        </div>
        <div ref={scrollRef} className="flex gap-8 overflow-x-auto pb-8 snap-x no-scrollbar" style={{ scrollbarWidth: 'none' }}>
          {reviews.map((r, i) => (
            <div key={i} className="min-w-[350px] md:min-w-[450px] snap-center bg-white p-12 rounded-sm border border-slate-100">
              <div className="flex gap-1 mb-8">
                {[...Array(5)].map((_, i) => <Star key={i} size={12} className="fill-slate-900 text-slate-900" />)}
              </div>
              <p className="text-slate-600 text-lg font-light leading-relaxed mb-10">"{r.review}"</p>
              <div className="flex items-center gap-4">
                <img src={r.avatar} alt={r.name} className="w-10 h-10 rounded-full object-cover grayscale" />
                <div>
                  <h4 className="font-medium text-slate-900 text-sm">{r.name}</h4>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{r.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Footer = () => (
  <footer className="bg-white border-t border-slate-50 pt-32 pb-12 px-6 md:px-10">
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-20 mb-24">
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center gap-2 mb-8">
            <Scissors className="text-slate-900 w-5 h-5" />
            <span className="text-xl font-semibold tracking-tight text-slate-900">TrimFlow</span>
          </div>
          <p className="text-slate-400 text-sm font-light max-w-xs leading-relaxed">
            Designing the digital infrastructure for the world's finest studios. <br /> Minimal by design, powerful by nature.
          </p>
        </div>
        {["Platform", "Resources"].map(c => (
          <div key={c}>
            <h5 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-900 mb-8">{c}</h5>
            <ul className="space-y-4 text-sm font-light text-slate-500">
              <li><a href="#" className="hover:text-slate-900 transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-slate-900 transition-colors">Privacy</a></li>
              <li><a href="#" className="hover:text-slate-900 transition-colors">Contact</a></li>
            </ul>
          </div>
        ))}
      </div>
      <div className="pt-8 border-t border-slate-50 flex justify-between items-center text-[10px] font-bold text-slate-300 uppercase tracking-widest">
        <span>© 2026 TrimFlow Digital</span>
        <div className="flex gap-8 items-center">
          <a href="#" className="hover:text-slate-900 transition-colors">Instagram</a>
          <a href="#" className="hover:text-slate-900 transition-colors">Twitter</a>
        </div>
      </div>
    </div>
  </footer>
);

export default function TrimFlowSite() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-slate-100" style={{ fontFamily: "'Inter', sans-serif" }}>
      <FontImport />
      <Navbar />
      <Hero />
      <LiveStats />
      <HowItWorks />
      <FeaturesGrid />
      <ReviewsSection />
      <Footer />
    </div>
  );
}