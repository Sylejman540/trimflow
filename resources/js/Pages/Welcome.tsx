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

// --- COMPONENTS ---

const Navbar = ({ onJoinClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav className={`fixed top-0 w-full z-[100] transition-all duration-500 ${scrolled || isOpen ? 'bg-white/90 backdrop-blur-md border-b border-slate-100 py-4' : 'bg-transparent py-8'}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-10 flex items-center justify-between">
          <div className="flex items-center gap-2 relative z-[110]">
            <Scissors className="text-[#637060] w-5 h-5" />
            <span className="text-xl font-semibold tracking-tight text-slate-900">TrimFlow</span>
          </div>

          <div className="hidden lg:flex items-center gap-12 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">
            <a href="#" className="hover:text-slate-900 transition-colors">Platform</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Pricing</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Journal</a>
          </div>

          <div className="flex items-center gap-6 relative z-[110]">
            <a href="/login" className="hidden sm:block text-[11px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors">Login</a>
            <a 
              href="/register"
              onClick={(e) => {
                e.preventDefault();
                onJoinClick();
              }}
              className="bg-[#637060] text-[#FAF9F6] px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-[#4f5a4d] transition-all shadow-lg shadow-slate-200"
            >
              Join Now
            </a>
            <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden text-slate-900 p-1">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`fixed inset-0 z-[100] bg-[#FAF9F6] transition-transform duration-500 ease-in-out lg:hidden ${isOpen ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="flex flex-col h-full pt-32 px-10 pb-12">
          <div className="space-y-8">
            {['Platform', 'Pricing', 'Resources', 'About'].map((item) => (
              <a key={item} href="#" onClick={() => setIsOpen(false)} className="block text-4xl font-light tracking-tight text-slate-900 hover:text-[#637060] transition-colors">
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

const Hero = () => (
  <section className="relative min-h-[100vh] flex items-center bg-white overflow-hidden">
    <div className="absolute inset-0 z-0">
      <img 
        src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=2000" 
        alt="Modern Studio Interior" 
        className="w-full h-full object-cover opacity-35 grayscale"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-transparent via-transparent to-white"></div>
    </div>

    <div className="max-w-7xl mx-auto px-6 md:px-10 w-full text-center relative z-10 pt-20">
      <div className="inline-block mb-10">
        <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#637060] border-b border-[#637060]/20 pb-2">
          Est. 2026 — The New Standard
        </span>
      </div>
      <h1 className="text-6xl md:text-[120px] font-light tracking-tighter text-slate-900 leading-[0.85] mb-12">
        Simplify the <br />
        <span className="font-serif italic text-[#637060]/60">modern shop.</span>
      </h1>
      <p className="text-lg md:text-xl text-slate-900 max-w-xl mx-auto mb-16 font-light leading-relaxed">
        The essential toolkit for ambitious studios. Clean interface, powerful automation, zero friction.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-10">
        <a href="/register" className="bg-slate-900 text-white h-16 px-12 rounded-full text-[11px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-2xl flex items-center gap-3 group">
          Start Free Trial <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </a>
      </div>
    </div>
  </section>
);

const FeaturesGrid = () => (
  <section id="features" className="py-40 bg-white px-6 md:px-10">
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-16 gap-y-24">
        {[
          { title: "Minimal Calendar", icon: Calendar, desc: "A clean interface focusing on your daily flow without visual noise." },
          { title: "Smart Analytics", icon: BarChart3, desc: "See your revenue and retention rates through elegant charts." },
          { title: "Guest Profiles", icon: Users, desc: "Track client history and preferences in a beautiful directory." },
          { title: "Global Controls", icon: Settings, desc: "Scale across locations with one unified administrative account." },
          { title: "Silent Alerts", icon: Smartphone, desc: "Automated SMS reminders that feel personal, not transactional." },
          { title: "Secure Vault", icon: ShieldCheck, desc: "Your studio data is encrypted and protected by enterprise protocols." }
        ].map((f, i) => (
          <div key={i} className="flex flex-col border-t border-slate-100 pt-10 group hover:border-[#637060] transition-colors">
            <f.icon className="w-5 h-5 text-[#637060] mb-8 opacity-40 group-hover:opacity-100 transition-opacity" />
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-900 mb-4">{f.title}</h4>
            <p className="text-slate-400 font-light text-sm leading-relaxed">{f.desc}</p>
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
      const { scrollLeft } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - 400 : scrollLeft + 400;
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
    <section className="py-32 bg-[#FAF9F6] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
          <h2 className="text-4xl md:text-6xl font-light text-slate-900 tracking-tight">
            Voices of the <br />
            <span className="font-serif italic text-[#637060]/60">community.</span>
          </h2>
          <div className="flex gap-3">
            <button onClick={() => scroll('left')} className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all"><ChevronLeft size={20} /></button>
            <button onClick={() => scroll('right')} className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all"><ChevronRight size={20} /></button>
          </div>
        </div>
        <div ref={scrollRef} className="flex overflow-x-auto pb-10 gap-5 snap-x snap-mandatory scrollbar-hide" style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
          {reviews.map((r, i) => (
            <div key={i} className="min-w-[75vw] md:min-w-[380px] snap-start bg-white p-10 border border-slate-100 flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, i) => <Star key={i} size={11} className="fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-slate-600 text-lg font-light leading-relaxed mb-10">"{r.review}"</p>
              </div>
              <div className="flex items-center gap-4 pt-8 border-t border-slate-50">
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

const Footer = () => {
  const footerLinks = {
    Platform: ["Features", "Automation", "Analytics", "Security", "Guest Experience"],
    Resources: ["Journal", "Help Center", "Community", "API Docs", "System Status"],
    Company: ["About Us", "Careers", "Press Kit", "Contact", "Partners"],
    Legal: ["Privacy Policy", "Terms of Service", "Cookie Policy", "GDPR", "Accessibility"]
  };

  return (
    <footer className="bg-white pt-40 pb-12 px-6 md:px-10 border-t border-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-y-12 gap-x-8 mb-20">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <Scissors className="text-[#637060] w-5 h-5" />
              <span className="text-xl font-semibold tracking-tighter text-slate-900">TrimFlow</span>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 leading-relaxed max-w-[180px]">Defining the aesthetic of modern service.</p>
          </div>
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h5 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-900 mb-8">{category}</h5>
              <ul className="space-y-3">
                {links.map(link => (
                  <li key={link}><a href="#" className="text-sm font-light text-slate-500 hover:text-[#637060] transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-slate-100">
          <div className="mt-12 flex flex-col md:flex-row justify-between items-center gap-4 text-[9px] font-bold text-slate-300 uppercase tracking-[0.4em]">
            <span>© 2026 TrimFlow — All Rights Reserved</span>
            <div className="flex gap-8 mb-2 ml-auto">
              {['Instagram', 'Twitter', 'LinkedIn'].map((social) => (
                <a key={social} href="#" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">{social}</a>
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
  const [isWaitlistOpen, setWaitlistOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('reveal-visible');
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-[#637060] selection:text-white overflow-x-hidden">
      <style>{`
        .reveal { opacity: 0; transform: translateY(30px); transition: all 0.8s cubic-bezier(0.2, 1, 0.3, 1); }
        .reveal-visible { opacity: 1; transform: translateY(0); }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
      
      <FontImport />
      <Navbar onJoinClick={() => setWaitlistOpen(true)} />
      
      <div className="reveal"><Hero /></div>
      <div className="reveal"><FeaturesGrid /></div>
      <div className="reveal"><ReviewsSection /></div>
      <Footer />

      {/* Floating Scroll to Top */}
      <button 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-8 right-8 w-12 h-12 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-xl z-[90] transition-all duration-500 ${showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}
      >
        <ChevronRight className="-rotate-90 text-slate-900" size={20} />
      </button>

      {/* Waitlist Modal */}
      {isWaitlistOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setWaitlistOpen(false)} />
          <div className="bg-white w-full max-w-lg p-12 rounded-3xl relative z-[210] shadow-2xl animate-in zoom-in duration-300">
            <button onClick={() => setWaitlistOpen(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900"><X size={24} /></button>
            <h3 className="text-4xl font-light tracking-tight mb-4">Join the <span className="font-serif italic text-[#637060]">inner circle.</span></h3>
            <p className="text-slate-400 mb-8 font-light">Enter your email to get early access to TrimFlow Pro when we launch this summer.</p>
            <div className="space-y-4">
              <input type="email" placeholder="Email Address" className="w-full bg-slate-50 border-0 rounded-2xl py-4 px-6 focus:ring-2 focus:ring-[#637060]/20 outline-none" />
              <button 
                onClick={() => {
                   window.location.href = "/register";
                }}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-slate-800 transition-all"
              >
                Submit Interest
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}