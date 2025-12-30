
import React from 'react';
import { 
  Facebook, Linkedin, Instagram, Twitter, Mail, Phone, 
  MapPin, Heart, ChevronRight, Star, ArrowUpRight, 
  ShieldCheck, Globe, Zap, Users, Trophy, Cpu, 
  Activity, Database, Network, Terminal, Sparkles,
  Command, Layers, Fingerprint, Code2, Scale, Shield, Cookie
} from 'lucide-react';
import { ViewState } from '../types';
import Logo from './Logo';

interface FooterProps {
  onNavigate: (view: ViewState) => void;
  onRate: () => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate, onRate }) => {
  
  const handleNavigation = (e: React.MouseEvent, view: ViewState) => {
    e.preventDefault();
    onNavigate(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-[#020617] text-slate-400 pt-1 border-t border-emerald-500/20 overflow-hidden font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* 1. TOP STATUS BAR: THE "SYSTEM PULSE" */}
      <div className="bg-slate-900/40 backdrop-blur-md border-b border-white/5 py-3 px-6 hidden sm:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-[10px] font-black uppercase tracking-[0.3em]">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]"></div>
              <span className="text-emerald-500">Node Status: Online</span>
            </div>
            <div className="flex items-center gap-2">
              <Database size={12} className="text-slate-600" />
              <span className="text-slate-500">Domain: nuesascholars.org</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity size={12} className="text-slate-600" />
              <span className="text-slate-500">Sync: TLS 1.3 Active</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2">
                <Star size={12} className="text-amber-400 fill-amber-400" />
                <span className="text-slate-300">Certified Secure</span>
             </div>
             <span className="text-slate-600">Region: Africa/Lagos</span>
          </div>
        </div>
      </div>

      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '30px 30px' }}></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Module 1: Brand & Identity */}
          <div className="lg:col-span-1 bg-white/[0.02] border border-white/5 p-8 rounded-[2rem] flex flex-col justify-between group hover:border-emerald-500/30 transition-all duration-500">
            <div>
              <div className="cursor-pointer mb-6 block transform origin-left hover:scale-105 transition-transform" onClick={(e) => handleNavigation(e, ViewState.HOME)}>
                <Logo variant="full" size={54} id="footer-bento-logo" />
              </div>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                The official intelligence layer for nuesascholars.org, connecting engineering excellence with global funding opportunities.
              </p>
            </div>
            <div className="mt-8 pt-8 border-t border-white/5 flex gap-4">
              {[Twitter, Linkedin, Instagram, Facebook].map((Social, i) => (
                <a key={i} href="#" className="p-2.5 rounded-xl bg-white/5 hover:bg-emerald-500 hover:text-white transition-all text-slate-500">
                  <Social size={18} />
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 grid grid-cols-2 gap-6">
            <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[2rem] hover:border-emerald-500/30 transition-all duration-500">
              <h4 className="text-white text-xs font-black uppercase tracking-[0.25em] mb-8 flex items-center gap-3">
                <Layers size={14} className="text-emerald-500" /> Ecosystem
              </h4>
              <nav className="flex flex-col gap-4">
                {[
                  { label: 'Intelligence Hub', view: ViewState.HOME },
                  { label: 'Scholarship Scout', view: ViewState.SCHOLARSHIPS },
                  { label: 'Internship Portal', view: ViewState.INTERNSHIPS },
                  { label: 'Partner Gateway', view: ViewState.SPONSORS }
                ].map((item) => (
                  <a key={item.label} href="#" onClick={(e) => handleNavigation(e, item.view)} className="text-slate-400 hover:text-white text-sm font-bold flex items-center gap-2 group">
                    <ChevronRight size={14} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-emerald-500" />
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>
            <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[2rem] hover:border-orange-500/30 transition-all duration-500">
              <h4 className="text-white text-xs font-black uppercase tracking-[0.25em] mb-8 flex items-center gap-3">
                <Fingerprint size={14} className="text-orange-500" /> Account Node
              </h4>
              <nav className="flex flex-col gap-4">
                {[
                  { label: 'Personal Tracker', view: ViewState.DASHBOARD },
                  { label: 'Verified Profile', view: ViewState.PROFILE },
                  { label: 'System Settings', view: ViewState.SETTINGS },
                  { label: 'Alert Center', view: ViewState.NOTIFICATIONS }
                ].map((item) => (
                  <a key={item.label} href="#" onClick={(e) => handleNavigation(e, item.view)} className="text-slate-400 hover:text-white text-sm font-bold flex items-center gap-2 group">
                    <ChevronRight size={14} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-orange-500" />
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-emerald-600 p-8 rounded-[2rem] text-white shadow-2xl shadow-emerald-900/20 relative overflow-hidden group">
              <Zap size={40} className="absolute -right-2 -top-2 opacity-10 group-hover:scale-125 transition-transform" />
              <h4 className="text-lg font-black mb-2">Intel Sync</h4>
              <p className="text-[11px] text-emerald-100 mb-6 leading-relaxed">Broadcast updates from nuesascholars.org directly to your node.</p>
              <form onSubmit={e => e.preventDefault()} className="space-y-3">
                <input 
                  type="email" 
                  placeholder="name@university.edu" 
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-xs placeholder:text-emerald-300/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                />
                <button className="w-full bg-white text-emerald-600 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">
                  Initialize Sync
                </button>
              </form>
            </div>
            <div className="bg-white/[0.02] border border-white/5 p-6 rounded-[2rem] flex flex-col justify-center items-center gap-4 group cursor-pointer hover:bg-white/[0.04] transition-all" onClick={onRate}>
               <div className="flex gap-1">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} size={14} className={i <= 4 ? "text-amber-400 fill-amber-400" : "text-amber-400/30"} />
                  ))}
               </div>
               <div className="text-center">
                  <p className="text-white text-xs font-black uppercase tracking-widest leading-none mb-1">Highly Trusted</p>
                  <p className="text-[9px] text-slate-500 uppercase font-bold">Official Student Gateway</p>
               </div>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12">
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      © {new Date().getFullYear()} NUESASCHOLARS.ORG • INTEL UNIT
                   </p>
                </div>
                
                <div className="flex gap-6 sm:gap-8">
                    <a href="#" onClick={(e) => handleNavigation(e, ViewState.LEGAL)} className="group flex items-center gap-2 text-[9px] font-black text-slate-500 hover:text-emerald-400 uppercase tracking-[0.2em] transition-colors">
                        <Scale size={12} className="opacity-50 group-hover:opacity-100" />
                        Terms
                    </a>
                    <a href="#" onClick={(e) => handleNavigation(e, ViewState.LEGAL)} className="group flex items-center gap-2 text-[9px] font-black text-slate-500 hover:text-emerald-400 uppercase tracking-[0.2em] transition-colors">
                        <Shield size={12} className="opacity-50 group-hover:opacity-100" />
                        Privacy
                    </a>
                    <a href="#" onClick={(e) => handleNavigation(e, ViewState.LEGAL)} className="group flex items-center gap-2 text-[9px] font-black text-slate-500 hover:text-emerald-400 uppercase tracking-[0.2em] transition-colors">
                        <Cookie size={12} className="opacity-50 group-hover:opacity-100" />
                        Cookies
                    </a>
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                    <ShieldCheck size={14} className="text-emerald-500" />
                    <span className="text-[9px] font-black text-emerald-500/80 uppercase tracking-widest">nuesascholars.org SECURED</span>
                </div>
            </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
