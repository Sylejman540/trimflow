import React, { useState, useRef, useEffect } from 'react';
import { 
  Calendar, Users, BarChart3, Scissors, Check, 
  ArrowRight, LayoutDashboard, Settings, Menu, X, 
  Globe, ChevronLeft, ChevronRight, TrendingUp, Star,
  Smartphone, Zap, ShieldCheck, Layers, Coffee, Sparkles,
  CreditCard, Shield, Clock, MapPin
} from 'lucide-react';

// --- STYLES & FONTS ---
const FontImport = () => (
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,700;1,700&display=swap" rel="stylesheet" />
);

// --- COMPONENTS ---

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleJoinAction = () => {
    setIsOpen(false);
    window.location.href = "/register";
  };

  return (
    <>
      <nav
        className={`fixed top-0 w-full z-[200] transition-all duration-500 ${
          scrolled || isOpen
            ? "bg-white/80 backdrop-blur-md border-b border-slate-100 py-4"
            : "bg-transparent py-6 md:py-8"
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 md:px-10 flex items-center justify-between">
          <div className="flex items-center gap-2 relative z-[210]">
            <div className="bg-slate-900 p-1.5 rounded-lg">
                <Scissors className="text-white w-4 h-4" />
            </div>
            <span className={`text-lg font-bold tracking-tight transition-colors ${scrolled || isOpen ? "text-slate-900" : "text-white md:text-slate-900"}`}>
              BarberFlow
            </span>
          </div>

          <div className={`hidden lg:flex items-center gap-12 text-[10px] font-bold uppercase tracking-[0.3em] transition-colors ${scrolled ? "text-slate-500" : "text-slate-400"}`}>
            <a href="#features" className="hover:text-blue-600 transition-colors">Platform</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Pricing</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Journal</a>
          </div>

          <div className="flex items-center gap-4 md:gap-6 relative z-[210]">
            <a href="/login" className={`hidden sm:block text-[10px] font-bold uppercase tracking-[0.3em] transition-colors hover:text-blue-600 ${scrolled ? "text-slate-500" : "text-white md:text-slate-500"}`}>
              Login
            </a>
            <button
              onClick={handleJoinAction}
              className="bg-slate-900 text-white px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-sm"
            >
              Join Now
            </button>
            <button onClick={() => setIsOpen(!isOpen)} className={`lg:hidden p-1 relative z-[220] ${scrolled || isOpen ? "text-slate-900" : "text-white"}`}>
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      <div className={`fixed inset-0 z-[150] bg-white transition-all duration-500 ease-in-out lg:hidden ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <div className="flex flex-col h-full pt-32 px-10 pb-12 justify-between">
          <div className="space-y-8">
            {["Platform", "Pricing", "Resources", "About"].map((item) => (
              <a key={item} href="#" className="block text-4xl font-bold tracking-tighter text-slate-900 hover:text-blue-600">{item}</a>
            ))}
          </div>
          <div className="pt-10 border-t border-slate-100">
            <button onClick={handleJoinAction} className="w-full bg-slate-900 text-white py-5 rounded-full text-[10px] font-bold uppercase tracking-[0.3em]">Get Started</button>
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
        src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=2000" 
        className="w-full h-full object-cover"
        alt="Barber Shop Background"
      />
      <div className="absolute inset-0 bg-slate-900/75 backdrop-blur-[2px]"></div>
    </div>

    <div className="max-w-7xl mx-auto px-6 md:px-10 w-full text-center relative z-10 pt-20">
      <div className="inline-block mb-6">
        <span className="bg-blue-600/20 text-blue-400 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-blue-500/30 backdrop-blur-md">
           The New Standard in Management
        </span>
      </div>
      <h1 className="text-5xl sm:text-7xl md:text-[100px] lg:text-[120px] font-bold tracking-tighter text-white leading-[0.95] mb-8">
        Simplify the <br />
        <span className="text-blue-400 italic font-serif font-light">modern shop.</span>
      </h1>
      <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
        The essential toolkit for ambitious studios. Clean interface, powerful automation, and zero friction.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <a href="/register" className="w-full sm:w-auto bg-white text-slate-900 h-14 px-10 rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-3 group">
          Start Free Trial <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </a>
        <a href="#" className="w-full sm:w-auto h-14 px-10 rounded-xl text-[11px] font-bold uppercase tracking-widest text-white border border-white/20 hover:bg-white/10 transition-all flex items-center justify-center">
            Watch Demo
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
          { label: "Active Studios", val: "2.4k+" },
          { label: "Bookings", val: "1.2M" },
          { label: "Revenue", val: "$45M" },
          { label: "Time Saved", val: "14hrs" },
          { label: "Uptime", val: "99.9%" },
          { label: "Rating", val: "4.9/5" }
        ].map((s, i) => (
          <div key={i} className="flex flex-col gap-2">
            <span className="text-3xl font-bold text-slate-900 tracking-tighter">{s.val}</span>
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-blue-600">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const FeaturesGrid = () => (
  <section id="features" className="py-32 bg-white px-6 md:px-10">
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-16 gap-y-20">
        {[
          { title: "Minimal Calendar", icon: Calendar, desc: "A clean interface focusing on your daily flow without visual noise." },
          { title: "Smart Analytics", icon: BarChart3, desc: "See your revenue and retention rates through elegant charts." },
          { title: "Guest Profiles", icon: Users, desc: "Track client history and preferences in a beautiful directory." },
          { title: "Global Controls", icon: Settings, desc: "Scale across locations with one unified administrative account." },
          { title: "Instant Alerts", icon: Smartphone, desc: "Automated SMS reminders that feel personal and professional." },
          { title: "Secure Vault", icon: ShieldCheck, desc: "Your studio data is encrypted and protected by enterprise protocols." }
        ].map((f, i) => (
          <div key={i} className="flex flex-col group">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all">
                <f.icon size={20} />
            </div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-900 mb-4">{f.title}</h4>
            <p className="text-slate-500 font-medium text-sm leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const ReviewsSection = () => {
  const reviews = [
    { name: "Julian P.", role: "Lead Barber", review: "The interface is so clean it actually makes me want to look at my schedule." },
    { name: "Elena S.", role: "Studio Owner", review: "Finally, a platform that understands aesthetic matters as much as function." },
    { name: "Marcus W.", role: "Senior Stylist", review: "The automated re-booking has increased my monthly revenue by 15% easily." },
    { name: "Sophia R.", role: "Spa Manager", review: "Guest Profiles allow us to provide a truly bespoke experience for every client." },
    { name: "David L.", role: "Director", review: "Managing four locations used to be a nightmare. Now it's just a few taps." },
    { name: "Amara K.", role: "Esthetician", review: "The smart analytics gave me insights into my slow hours I never noticed." },
    { name: "Nathan B.", role: "Shop Owner", review: "This is the first software that actually feels like it was built for us." }
  ];

  return (
    <section className="py-32 bg-slate-50/30 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="flex items-end justify-between mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
              Loved by <span className="text-blue-600 italic font-serif font-light">the community.</span>
          </h2>
          <div className="hidden md:flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            <span>Scroll to explore</span>
            <div className="w-12 h-[1px] bg-slate-200"></div>
          </div>
        </div>
        
        {/* HORIZONTAL FLEX SCROLL */}
        <div className="flex overflow-x-auto gap-6 pb-12 snap-x snap-mandatory no-scrollbar cursor-grab active:cursor-grabbing">
          {reviews.map((r, i) => (
            <div key={i} className="flex-none w-[320px] md:w-[400px] snap-center bg-white p-10 border border-slate-100 rounded-2xl shadow-sm hover:border-blue-100 transition-all">
              <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, i) => <Star key={i} size={11} className="fill-blue-600 text-blue-600" />)}
              </div>
              <p className="text-slate-600 text-sm font-medium leading-relaxed mb-8">"{r.review}"</p>
              <div className="flex flex-col pt-6 border-t border-slate-50">
                <h4 className="font-bold text-slate-900 text-[10px] uppercase tracking-widest">{r.name}</h4>
                <span className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">{r.role}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </section>
  );
};

const ProcessSection = () => (
  <section className="py-32 bg-slate-900 text-white">
    <div className="max-w-7xl mx-auto px-6 md:px-10 text-center mb-20">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Built for scale.</h2>
        <p className="text-slate-400 font-medium max-w-xl mx-auto">We've removed the complexity to help you focus on the craft.</p>
    </div>
    <div className="max-w-7xl mx-auto px-6 md:px-10 grid grid-cols-1 md:grid-cols-4 gap-12">
        {[
            { step: "01", title: "Setup", desc: "Import your client list and services in minutes." },
            { step: "02", title: "Automate", desc: "AI handles reminders and deposits." },
            { step: "03", title: "Analyze", desc: "Monitor growth with high-fidelity reports." },
            { step: "04", title: "Scale", desc: "Expand team or locations instantly." }
        ].map((p, i) => (
            <div key={i} className="border-l border-slate-800 pl-8">
                <span className="text-blue-500 font-bold text-xs uppercase mb-4 block">{p.step}</span>
                <h4 className="text-lg font-bold mb-2">{p.title}</h4>
                <p className="text-slate-400 text-sm leading-relaxed">{p.desc}</p>
            </div>
        ))}
    </div>
  </section>
);

const Footer = () => (
    <footer className="bg-white pt-24 pb-12 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-12 mb-20">
            <div className="col-span-2">
                <div className="flex items-center gap-2 mb-4">
                    <div className="bg-slate-900 p-1 rounded-md"><Scissors size={14} className="text-white"/></div>
                    <span className="text-xl font-bold tracking-tighter">BarberFlow</span>
                </div>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em] max-w-xs leading-relaxed">Defining the aesthetic of modern management.</p>
            </div>
            
            {['Platform', 'Resources', 'Company', 'Legal'].map((cat) => (
              <div key={cat}>
                  <h5 className="text-[10px] font-bold uppercase tracking-widest text-slate-900 mb-6">{cat}</h5>
                  <ul className="space-y-3">
                      {['Features', 'Journal', 'Contact', 'Terms'].slice(0, 3).map(link => (
                        <li key={link}><a href="#" className="text-sm text-slate-500 hover:text-blue-600 transition-colors">{link}</a></li>
                      ))}
                  </ul>
              </div>
            ))}
        </div>
        <div className="flex justify-between items-center text-[9px] font-bold text-slate-300 uppercase tracking-widest border-t border-slate-50 pt-10">
            <span>© 2026 BarberFlow</span>
            <div className="flex gap-6">
                <a href="#" className="hover:text-slate-900 transition-colors">Instagram</a>
                <a href="#" className="hover:text-slate-900 transition-colors">Twitter</a>
                <a href="#" className="hover:text-slate-900 transition-colors">LinkedIn</a>
            </div>
        </div>
      </div>
    </footer>
);

export default function BarberFlowSite() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-blue-600 selection:text-white">
      <FontImport />
      <Navbar />
      <Hero />
      <StatsSection />
      <FeaturesGrid />
      <ReviewsSection />
      <ProcessSection />
      <Footer />
    </div>
  );
}