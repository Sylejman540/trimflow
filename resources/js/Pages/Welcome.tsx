import React, { useState, useRef, useEffect } from 'react';
import { 
  Calendar, Users, BarChart3, Scissors, Check, 
  ArrowRight, LayoutDashboard, Settings, Menu, X, 
  Instagram, Twitter, Linkedin, Globe,
  ChevronLeft, ChevronRight, TrendingUp, Star,
  Smartphone, Zap, ShieldCheck
} from 'lucide-react';

// --- STYLES & FONTS ---
const FontImport = () => (
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap" rel="stylesheet" />
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

// --- COMPONENTS ---

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  return (
    <nav className="absolute top-0 w-full z-[100]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3 relative z-[110]">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-xl border border-white/20">
            <Scissors className="text-slate-900 w-4 h-4" />
          </div>
          <span className="text-lg font-bold tracking-tighter text-white">
            TrimFlow
          </span>
        </div>

        <div className="hidden lg:flex items-center gap-10 text-[11px] font-bold uppercase tracking-[0.2em] text-white/70">
          <a href="#" className="hover:text-white transition-colors">Platform</a>
          <a href="#" className="hover:text-white transition-colors">Pricing</a>
          <a href="#" className="hover:text-white transition-colors">Resources</a>
        </div>

        <div className="flex items-center gap-4 relative z-[110]">
          <button className="hidden sm:block text-white text-sm font-medium px-4 opacity-80 hover:opacity-100 transition-opacity">Log in</button>
          <button className="bg-white text-slate-900 px-5 py-2 rounded-full text-xs font-bold hover:bg-slate-100 transition-all">
            Get Started
          </button>
          <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden text-white p-2">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Refined Mobile Menu */}
      <div className={`fixed inset-0 bg-slate-950 transition-all duration-300 ease-in-out lg:hidden ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
        <div className="flex flex-col h-full pt-28 px-8 pb-12">
          <div className="flex flex-col gap-6">
            <a href="#" onClick={() => setIsOpen(false)} className="text-2xl font-medium text-white tracking-tight">Platform</a>
            <a href="#" onClick={() => setIsOpen(false)} className="text-2xl font-medium text-white tracking-tight">Pricing</a>
            <a href="#" onClick={() => setIsOpen(false)} className="text-2xl font-medium text-white tracking-tight">Resources</a>
          </div>
          <div className="mt-auto pt-8 border-t border-white/10">
            <button className="w-full bg-white text-slate-950 py-4 rounded-xl font-bold">Start Free Trial</button>
          </div>
        </div>
      </div>
    </nav>
  );
};

const Hero = () => (
  <section className="relative h-[90vh] min-h-[700px] flex items-center overflow-hidden bg-slate-950">
    <div className="absolute inset-0 z-0">
      <img 
        src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=2000" 
        alt="Modern barbershop" 
        className="w-full h-full object-cover opacity-50"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-transparent to-slate-950" />
    </div>

    <div className="relative z-10 max-w-[1440px] mx-auto px-6 md:px-10 w-full pt-12">
      <div className="max-w-4xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 mb-6 backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/90">The New Standard</span>
        </div>
        <h1 className="text-5xl md:text-7xl lg:text-[100px] font-black tracking-tighter text-white leading-[0.9] mb-8">
          The platform <br />
          <span className="text-white/40 italic font-light">for barbershops.</span>
        </h1>
        <p className="text-lg md:text-xl text-white/70 max-w-xl mb-12 leading-relaxed">
          Manage appointments, staff, and revenue with precision. Built for high-volume shops.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button className="bg-white text-slate-900 h-14 px-8 rounded-full font-bold hover:scale-105 transition-all flex items-center justify-center gap-3">
            Start free trial <ArrowRight className="w-5 h-5" />
          </button>
          <button className="border border-white/30 text-white h-14 px-8 rounded-full font-bold hover:bg-white/10 transition-all backdrop-blur-md">
            Watch Tour
          </button>
        </div>
      </div>
    </div>
  </section>
);

const LiveStats = () => {
  const appointments = useCountUp(12480);
  const revenue = useCountUp(98);
  const shops = useCountUp(450);
  const rating = useCountUp(4);

  return (
    <section className="bg-white py-16 md:py-24 border-b border-slate-100">
      <div className="max-w-[1440px] mx-auto px-6 md:px-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { label: "Live Bookings", val: `${appointments.toLocaleString()}+`, icon: Calendar },
            { label: "Efficiency Gain", val: `${revenue}%`, icon: TrendingUp },
            { label: "Active Shops", val: shops, icon: Globe },
            { label: "Partner Rating", val: `${rating}.9/5`, icon: Star }
          ].map((stat, i) => (
            <div key={i} className="border-l-2 border-slate-100 pl-6">
              <div className="flex items-center gap-2 text-slate-400 mb-4">
                <stat.icon size={14} />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{stat.label}</span>
              </div>
              <h3 className="text-3xl md:text-5xl font-black text-slate-950 tracking-tighter">{stat.val}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const HowItWorks = () => (
  <section className="py-24 bg-slate-950 text-white px-6 md:px-10">
    <div className="max-w-[1440px] mx-auto">
      <div className="mb-20 text-center max-w-2xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-6">Built for speed.</h2>
        <p className="text-slate-400 text-lg">Transition your entire shop in minutes.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {[
          { step: "01", title: "Set your chairs", desc: "Sync staff rosters and define custom services.", icon: Users },
          { step: "02", title: "Go Live", desc: "Embed your link on Instagram and Google.", icon: Zap },
          { step: "03", title: "Automate", desc: "TrimFlow handles reminders and payouts.", icon: Smartphone }
        ].map((item, i) => (
          <div key={i} className="group">
            <div className="mb-8 flex items-center justify-between">
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-slate-900 transition-all duration-500">
                <item.icon size={24} />
              </div>
              <span className="text-4xl font-black text-white/10">{item.step}</span>
            </div>
            <h4 className="text-xl font-bold mb-4">{item.title}</h4>
            <p className="text-slate-500 leading-relaxed text-sm">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const ReviewsSection = () => {
  const scrollRef = useRef(null);
  const reviews = [
    { name: "Jade L.", role: "Barber", avatar: "https://randomuser.me/api/portraits/women/68.jpg", review: "TrimFlow makes managing my schedule effortless. My clients love the automated reminders." },
    { name: "Marcus R.", role: "Shop Owner", avatar: "https://randomuser.me/api/portraits/men/45.jpg", review: "The dashboard gives me real-time insights. I can finally focus on growth, not paperwork." },
    { name: "Sophie K.", role: "Client", avatar: "https://randomuser.me/api/portraits/women/12.jpg", review: "Booking is so easy. I always get notified before my appointment. Highly recommend." },
    { name: "Alex T.", role: "Senior Barber", avatar: "https://randomuser.me/api/portraits/men/32.jpg", review: "The CRM features help me remember client preferences and keep them coming back." }
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
    <section className="py-24 bg-slate-50 overflow-hidden px-6 md:px-10">
      <div className="max-w-[1440px] mx-auto">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-950 tracking-tight">Voices of the floor.</h2>
            <p className="text-slate-500 mt-2">Trusted by the industry's best.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => scroll('left')} className="p-3 border rounded-full hover:bg-white transition-all"><ChevronLeft size={20}/></button>
            <button onClick={() => scroll('right')} className="p-3 border rounded-full hover:bg-white transition-all"><ChevronRight size={20}/></button>
          </div>
        </div>
        <div ref={scrollRef} className="flex gap-6 overflow-x-auto pb-8 snap-x hide-scrollbar" style={{ scrollbarWidth: 'none' }}>
          {reviews.map((r, i) => (
            <div key={i} className="min-w-[320px] md:min-w-[400px] snap-center bg-white rounded-3xl p-10 border border-slate-100 shadow-sm">
              <p className="text-slate-600 text-lg italic mb-8">"{r.review}"</p>
              <div className="flex items-center gap-4">
                <img src={r.avatar} alt={r.name} className="w-12 h-12 rounded-full object-cover" />
                <div>
                  <h4 className="font-bold text-slate-950">{r.name}</h4>
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

const FeaturesGrid = () => (
  <section className="py-24 bg-white px-6 md:px-10">
    <div className="max-w-[1440px] mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-slate-100 border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
        {[
          { title: "Intelligent Booking", icon: Calendar, desc: "A drag-and-drop calendar that handles complexity." },
          { title: "Staff Performance", icon: BarChart3, desc: "Detailed metrics for every chair and retention rates." },
          { title: "Client CRM", icon: Users, desc: "Deep client profiles with automated reminders." },
          { title: "Global Controls", icon: Settings, desc: "Manage multiple locations from one unified login." },
          { title: "Security First", icon: ShieldCheck, desc: "Enterprise-grade protection and daily backups." },
          { title: "Live Insights", icon: LayoutDashboard, desc: "Real-time revenue tracking synced with your bank." }
        ].map((f, i) => (
          <div key={i} className="bg-white p-12 hover:bg-slate-50 transition-all group">
            <f.icon className="w-6 h-6 text-slate-400 mb-8 group-hover:text-slate-950 transition-colors" />
            <h4 className="text-xl font-bold text-slate-950 mb-4">{f.title}</h4>
            <p className="text-slate-500 leading-relaxed text-sm">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="bg-slate-950 text-white pt-24 pb-12 px-6 md:px-10">
    <div className="max-w-[1440px] mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
        <div>
          <div className="flex items-center gap-3 mb-6">
            <Scissors className="text-white w-6 h-6" />
            <span className="text-2xl font-bold tracking-tighter">TrimFlow</span>
          </div>
          <p className="text-slate-500 text-sm">Modern tools for modern barbers.</p>
        </div>
        {["Platform", "Resources", "Legal"].map(c => (
          <div key={c}>
            <h5 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-6">{c}</h5>
            <ul className="space-y-3 text-sm text-slate-500">
              <li><a href="#" className="hover:text-white">Features</a></li>
              <li><a href="#" className="hover:text-white">Privacy</a></li>
              <li><a href="#" className="hover:text-white">Terms</a></li>
            </ul>
          </div>
        ))}
      </div>
      <div className="pt-8 border-t border-white/5 flex justify-between text-[10px] font-bold text-slate-600 uppercase tracking-widest">
        <span>© 2026 TrimFlow Inc.</span>
        <div className="flex gap-4 items-center">
          <Globe size={12}/> EN
        </div>
      </div>
    </div>
  </footer>
);

export default function TrimFlowSite() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-950 selection:bg-slate-900 selection:text-white" style={{ fontFamily: "'Inter', sans-serif" }}>
      <FontImport />
      <Navbar />
      <Hero />
      <LiveStats />
      <HowItWorks />
      <ReviewsSection />
      <FeaturesGrid />
      <Footer />
    </div>
  );
}