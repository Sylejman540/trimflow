import React, { useState, useRef, useEffect } from 'react';
import { 
  Calendar, Users, BarChart3, Scissors, Check, 
  ArrowRight, LayoutDashboard, Settings, Menu, X, 
  Globe, ChevronLeft, ChevronRight, TrendingUp, Star,
  Smartphone, Zap, ShieldCheck, Layers, Coffee, Sparkles
} from 'lucide-react';

// --- STYLES & FONTS ---
const FontImport = () => (
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,700;1,700&display=swap" rel="stylesheet" />
);

// --- COMPONENTS ---

// --- UPDATED NAVBAR COMPONENT ---
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
  }, [isOpen]);

  const handleJoinAction = () => {
    setIsOpen(false);
    window.location.href = "/register";
  };

  return (
    <>
      <nav className={`fixed top-0 w-full z-[100] transition-all duration-500 ${scrolled || isOpen ? 'bg-white border-b border-slate-100 py-4' : 'bg-transparent py-6 md:py-8'}`}>
        <div className="max-w-7xl mx-auto px-5 md:px-10 flex items-center justify-between">
          <div className="flex items-center gap-2 relative z-[110]">
            <Scissors className="text-[#637060] w-5 h-5" />
            <span className="text-lg md:text-xl font-semibold tracking-tight text-slate-900">TrimFlow</span>
          </div>

          <div className="hidden lg:flex items-center gap-12 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">
            <a href="#features" className="hover:text-slate-900 transition-colors">Platform</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Pricing</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Journal</a>
          </div>

          <div className="flex items-center gap-4 md:gap-6 relative z-[110]">
            <a href="/login" className="hidden sm:block text-[11px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors">Login</a>
            <button 
              onClick={handleJoinAction}
              className="bg-[#637060] text-[#FAF9F6] px-5 md:px-8 py-2.5 md:py-3 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-widest hover:bg-[#4f5a4d] transition-all shadow-lg shadow-slate-200"
            >
              Join Now
            </button>
            {/* TOGGLE: Swaps between Menu and X icon */}
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="lg:hidden text-slate-900 p-1" 
              aria-label={isOpen ? "Close Menu" : "Open Menu"}
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE MENU OVERLAY */}
      <div className={`fixed inset-0 z-[100] bg-white transition-transform duration-500 ease-in-out lg:hidden ${isOpen ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="flex flex-col h-full pt-32 px-10 pb-12 justify-between">
          <div className="space-y-6">
            {['Platform', 'Pricing', 'Resources', 'About'].map((item) => (
              <a 
                key={item} 
                href="#" 
                onClick={() => setIsOpen(false)} 
                className="block text-4xl md:text-5xl font-light tracking-tighter text-slate-900 hover:text-[#637060] transition-colors"
              >
                {item}
              </a>
            ))}
          </div>
          <div className="space-y-6 pt-10 border-t border-slate-200">
             <button 
               onClick={handleJoinAction}
               className="w-full bg-slate-900 text-white py-5 rounded-full font-bold text-[10px] uppercase tracking-widest"
             >
               Get Started Now
             </button>
             <p className="text-center text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">© 2026 TrimFlow</p>
          </div>
        </div>
      </div>
    </>
  );
};

const Hero = () => (
  <section className="relative min-h-[90vh] md:min-h-screen flex items-center bg-white overflow-hidden">
    <div className="absolute inset-0 z-0">
      <img 
        src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=2000" 
        alt="Modern Studio Interior" 
        className="w-full h-full object-cover opacity-30 grayscale"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-transparent to-white"></div>
    </div>

    <div className="max-w-7xl mx-auto px-6 md:px-10 w-full text-center relative z-10 pt-20">
      <div className="inline-block mb-6 md:mb-10">
        <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.3em] md:tracking-[0.4em] text-[#637060] border-b border-[#637060]/20 pb-2">
          Est. 2026 — The New Standard
        </span>
      </div>
      <h1 className="text-5xl sm:text-7xl md:text-[110px] lg:text-[130px] font-light tracking-tighter text-slate-900 leading-[0.9] mb-8 md:mb-12">
        Simplify the <br />
        <span className="font-serif italic text-[#637060]/60">modern shop.</span>
      </h1>
      <p className="text-base md:text-xl text-slate-600 max-w-lg mx-auto mb-10 md:mb-16 font-light leading-relaxed px-4">
        The essential toolkit for ambitious studios. Clean interface, powerful automation, zero friction.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
        <a href="/register" className="w-full sm:w-auto bg-slate-900 text-white h-14 md:h-16 px-10 md:px-12 rounded-full text-[10px] md:text-[11px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl flex items-center justify-center gap-3 group">
          Start Free Trial <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </a>
      </div>
    </div>
  </section>
);

const StatsSection = () => (
  <section className="py-16 md:py-24 bg-white border-y border-slate-100">
    <div className="max-w-7xl mx-auto px-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-12 gap-x-4 text-center">
        {[
          { label: "Active Studios", val: "2.4k+" },
          { label: "Bookings Monthly", val: "1.2M" },
          { label: "Revenue Processed", val: "$45M" },
          { label: "Time Saved/Week", val: "14hrs" }
        ].map((s, i) => (
          <div key={i} className="flex flex-col gap-1 md:gap-2">
            <span className="text-3xl md:text-5xl font-light text-slate-900 tracking-tighter">{s.val}</span>
            <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-[0.2em] md:tracking-[0.3em] text-[#637060]">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const FeaturesGrid = () => (
  <section id="features" className="py-24 md:py-40 bg-white px-6 md:px-10">
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 md:gap-x-16 gap-y-16 md:gap-y-24">
        {[
          { title: "Minimal Calendar", icon: Calendar, desc: "A clean interface focusing on your daily flow without visual noise." },
          { title: "Smart Analytics", icon: BarChart3, desc: "See your revenue and retention rates through elegant charts." },
          { title: "Guest Profiles", icon: Users, desc: "Track client history and preferences in a beautiful directory." },
          { title: "Global Controls", icon: Settings, desc: "Scale across locations with one unified administrative account." },
          { title: "Silent Alerts", icon: Smartphone, desc: "Automated SMS reminders that feel personal, not transactional." },
          { title: "Secure Vault", icon: ShieldCheck, desc: "Your studio data is encrypted and protected by enterprise protocols." }
        ].map((f, i) => (
          <div key={i} className="flex flex-col border-t border-slate-100 pt-8 md:pt-10 group transition-colors">
            <f.icon className="w-5 h-5 text-[#637060] mb-6 md:mb-8 opacity-60 lg:opacity-40 group-hover:opacity-100 transition-opacity" />
            <h4 className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-slate-900 mb-3 md:mb-4">{f.title}</h4>
            <p className="text-slate-500 font-light text-sm leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);


const ReviewsSection = () => {
  const scrollRef = useRef(null);
  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  const reviews = [
    { name: "Julian P.", role: "Lead Barber", avatar: "https://randomuser.me/api/portraits/men/32.jpg", review: "The interface is so clean it actually makes me want to look at my schedule." },
    { name: "Elena S.", role: "Studio Owner", avatar: "https://randomuser.me/api/portraits/women/44.jpg", review: "Finally, a platform that understands aesthetic matters as much as function." },
    { name: "Marcus W.", role: "Senior Stylist", avatar: "https://randomuser.me/api/portraits/men/12.jpg", review: "The automated re-booking has increased my monthly revenue by 15% easily." },
    { name: "Sophia R.", role: "Esthetician", avatar: "https://randomuser.me/api/portraits/women/65.jpg", review: "The Guest Profiles allow me to provide a truly bespoke experience for every client." },
    { name: "David L.", role: "Creative Director", avatar: "https://randomuser.me/api/portraits/men/46.jpg", review: "TrimFlow's analytics gave me insights into my slow hours." },
    { name: "Amara K.", role: "Spa Manager", avatar: "https://randomuser.me/api/portraits/women/33.jpg", review: "Managing four locations used to be a nightmare. Now it's just a few taps." }
  ];

  return (
    <section className="py-24 md:py-32 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 md:mb-12 gap-8">
          <h2 className="text-4xl md:text-6xl font-light text-slate-900 tracking-tight">
            Voices of the <br />
            <span className="font-serif italic text-[#637060]/60">community.</span>
          </h2>
          <div className="hidden md:flex gap-3">
            <button onClick={() => scroll('left')} className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all"><ChevronLeft size={20} /></button>
            <button onClick={() => scroll('right')} className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all"><ChevronRight size={20} /></button>
          </div>
        </div>
        <div 
          ref={scrollRef} 
          className="flex overflow-x-auto pb-10 gap-5 snap-x snap-mandatory scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0" 
          style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
        >
          {reviews.map((r, i) => (
            <div key={i} className="min-w-[85vw] sm:min-w-[450px] md:min-w-[380px] snap-center md:snap-start bg-[#FAF9F6] p-8 md:p-10 border border-slate-100 flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, i) => <Star key={i} size={11} className="fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-slate-600 text-base md:text-lg font-light leading-relaxed mb-8 md:mb-10">"{r.review}"</p>
              </div>
              <div className="flex items-center gap-4 pt-6 md:pt-8 border-t border-slate-200">
                <img src={r.avatar} alt={r.name} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <h4 className="font-bold text-slate-900 text-[9px] uppercase tracking-[0.2em]">{r.name}</h4>
                  <span className="text-[9px] text-[#637060]/70 font-bold uppercase tracking-widest">{r.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const ProcessSection = () => (
  <section className="py-24 md:py-40 bg-[#FAF9F6]">
    <div className="max-w-7xl mx-auto px-6 md:px-10">
      <div className="flex flex-col lg:flex-row gap-16 lg:gap-20">
        <div className="lg:w-1/3">
          <h2 className="text-4xl md:text-5xl font-light tracking-tighter text-slate-900 leading-none mb-6 md:mb-8">
            Crafted for <br />
            <span className="font-serif italic text-[#637060]/60">perfection.</span>
          </h2>
          <p className="text-slate-500 font-light leading-relaxed max-w-md">We stripped away the complexity of traditional management software to focus on what matters: the craft.</p>
        </div>
        <div className="lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-10 md:gap-12">
          {[
            { step: "01", title: "Setup", desc: "Import your client list and services in minutes with our smart onboarding." },
            { step: "02", title: "Automate", desc: "Let our AI handle the reminders, re-booking, and deposit collections." },
            { step: "03", title: "Analyze", desc: "Monitor your growth with high-fidelity reports tailored for owners." },
            { step: "04", title: "Scale", desc: "Expand your team or locations without ever outgrowing the platform." }
          ].map((p, i) => (
            <div key={i} className="relative pl-10 md:pl-12">
              <span className="absolute left-0 top-0 text-[10px] md:text-[12px] font-bold text-[#637060]/30 font-serif italic">{p.step}</span>
              <h4 className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-900 mb-2 md:mb-3">{p.title}</h4>
              <p className="text-slate-500 text-sm font-light leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

const Footer = () => {
  const footerLinks = {
    Platform: ["Features", "Automation", "Analytics", "Security", "Guest Experience"],
    Resources: ["Journal", "Help Center", "Community", "API Docs", "Status"],
    Company: ["About Us", "Careers", "Press Kit", "Contact", "Partners"],
    Legal: ["Privacy", "Terms", "Cookies", "GDPR"]
  };

  return (
    <footer className="bg-white pt-24 md:pt-40 pb-10 md:pb-12 px-6 md:px-10 border-t border-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-y-12 gap-x-8 mb-16 md:mb-20">
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <Scissors className="text-[#637060] w-5 h-5" />
              <span className="text-xl font-semibold tracking-tighter text-slate-900">TrimFlow</span>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 leading-relaxed max-w-[180px]">Defining the aesthetic of modern service.</p>
          </div>
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h5 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-900 mb-6 md:mb-8">{category}</h5>
              <ul className="space-y-3">
                {links.map(link => (
                  <li key={link}><a href="#" className="text-sm font-light text-slate-500 hover:text-[#637060] transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-slate-100 pt-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-[8px] md:text-[9px] font-bold text-slate-300 uppercase tracking-[0.3em] md:tracking-[0.4em] text-center md:text-left">
            <span>© 2026 TrimFlow — All Rights Reserved</span>
            <div className="flex gap-6 md:gap-8">
              {['Instagram', 'Twitter', 'LinkedIn'].map((social) => (
                <a key={social} href="#" className="text-slate-400 hover:text-slate-900 transition-colors">{social}</a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

// --- MAIN PAGE WRAPPER ---

export default function TrimFlowSite() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('reveal-visible');
      });
    }, { threshold: 0.05 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-[#637060] selection:text-white overflow-x-hidden">
      <style>{`
        .reveal { opacity: 0; transform: translateY(20px); transition: all 0.8s cubic-bezier(0.2, 1, 0.3, 1); }
        .reveal-visible { opacity: 1; transform: translateY(0); }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        html { scroll-behavior: smooth; }
      `}</style>
      
      <FontImport />
      <Navbar />
      
      <div className="reveal"><Hero /></div>
      <div className="reveal"><StatsSection /></div>
      <div className="reveal"><FeaturesGrid /></div>
      <div className="reveal"><ReviewsSection /></div>
      <div className="reveal"><ProcessSection /></div>
      <Footer />

      <button 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-6 right-6 w-10 h-10 md:w-12 md:h-12 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-xl z-[90] transition-all duration-500 ${showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}
      >
        <ChevronRight className="-rotate-90 text-slate-900" size={18} />
      </button>
    </div>
  );
}