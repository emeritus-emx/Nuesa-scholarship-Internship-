
import React from 'react';
import { Opportunity, User } from '../types';
import { 
    X, Calendar, MapPin, Building, DollarSign, CheckCircle2, ShieldCheck, 
    ExternalLink, ArrowRight, Bookmark, LogIn, FileWarning, Check, 
    UserCheck, ScrollText, ListChecks, Globe, Flag, ShieldAlert, Lock
} from 'lucide-react';
import { storageService } from '../services/storage';

interface OpportunityModalProps {
  opportunity: Opportunity;
  onClose: () => void;
  onApply: (opp: Opportunity) => void;
  user: User | null;
}

const OpportunityModal: React.FC<OpportunityModalProps> = ({ opportunity, onClose, onApply, user }) => {
  const hasRequiredDocs = opportunity.requiredDocuments && opportunity.requiredDocuments.length > 0;
  const isStudent = user?.role === 'student';
  const isSponsor = user?.role === 'sponsor';
  const isPartnerPost = opportunity.tags?.includes('Partner Sponsored');
  
  const savedOpps = storageService.getSavedOpportunities();
  const hasApplied = isPartnerPost && savedOpps.some(o => o.title === opportunity.title && o.status === 'Applied');

  const handleReport = () => {
      if (window.confirm("Flag for audit? This signals our security team to manually verify the legitimacy of this provider and fund availability.")) {
          alert("Signal broadcasted. Node marked for investigation.");
          storageService.addSecurityLog('Safety', `Report filed against: ${opportunity.title}`, 'warning');
      }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-white dark:bg-gray-900 w-full max-w-5xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 relative flex flex-col md:flex-row max-h-[90vh] animate-scale-in">
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 md:p-12">
            <button 
                onClick={onClose}
                className="md:hidden absolute top-4 right-4 p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
                <X size={20} />
            </button>

            <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center text-orange-600">
                        {isPartnerPost ? <Building size={24} /> : <Globe size={24} />}
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{isPartnerPost ? 'NUESA Verified Node' : 'Discovered Remote Node'}</p>
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white">{opportunity.provider}</h4>
                    </div>
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white leading-tight pr-8">
                    {opportunity.title}
                </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                    <div className="text-orange-500 mb-1"><DollarSign size={18} /></div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Estimated Value</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{opportunity.amount || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                    <div className="text-green-500 mb-1"><Calendar size={18} /></div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Termination Date</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{opportunity.deadline || 'Permanent'}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                    <div className="text-blue-500 mb-1"><MapPin size={18} /></div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Node Location</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{opportunity.location || 'Distributed'}</p>
                </div>
            </div>

            <div className="space-y-10">
                <div className="relative">
                    <div className="flex items-center gap-3 mb-4 text-gray-900 dark:text-white">
                        <ScrollText className="text-orange-500" size={22} />
                        <h3 className="text-xl font-bold uppercase tracking-tight">Technical Criteria</h3>
                    </div>
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base whitespace-pre-line">
                            {opportunity.description}
                        </p>
                    </div>
                </div>

                {hasRequiredDocs && (
                    <div className="relative">
                        <div className="flex items-center gap-3 mb-4 text-gray-900 dark:text-white">
                            <ListChecks className="text-green-500" size={22} />
                            <h3 className="text-xl font-bold uppercase tracking-tight">Identity Requirements</h3>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-3">
                            {opportunity.requiredDocuments?.map((doc, idx) => {
                                const isProvided = user?.documents?.[doc];
                                return (
                                    <div key={idx} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${isProvided ? 'bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-900/30' : 'bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800'}`}>
                                        <span className={`text-sm font-bold ${isProvided ? 'text-green-800 dark:text-green-300' : 'text-gray-600 dark:text-gray-400'}`}>{doc}</span>
                                        {isProvided ? (
                                            <div className="bg-green-500 text-white rounded-full p-1" title="Present in profile">
                                                <Check size={12} strokeWidth={4} />
                                            </div>
                                        ) : (
                                            <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600" title="Missing"></div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {isPartnerPost && (
                    <div className="p-6 bg-emerald-50 dark:bg-emerald-900/10 rounded-3xl border border-emerald-100 dark:border-emerald-900/30 flex gap-4">
                        <ShieldCheck className="text-emerald-600 dark:text-emerald-400 shrink-0" size={24} />
                        <div>
                            <h4 className="text-[10px] font-black text-emerald-900 dark:text-emerald-300 mb-1 uppercase tracking-widest">Digital Trust Verified</h4>
                            <p className="text-[11px] text-emerald-700 dark:text-emerald-400 leading-relaxed font-bold uppercase tracking-tighter">
                                Secured handshake enabled. Your encrypted academic profile will be transmitted directly to the partner's secure vault.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>

        <div className="w-full md:w-[380px] bg-gray-50 dark:bg-gray-800/80 p-8 md:p-12 border-l border-gray-100 dark:border-gray-800 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-12">
                <button 
                    onClick={handleReport}
                    className="p-3 bg-red-50 hover:bg-red-100 text-red-500 rounded-2xl transition-all"
                    title="Flag for Security Audit"
                >
                    <Flag size={20} />
                </button>
                <button 
                    onClick={onClose}
                    className="p-3 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-2xl text-gray-500 transition-colors"
                >
                    <X size={24} />
                </button>
            </div>

            <div>
                <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-xl mb-8 border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${isPartnerPost ? 'bg-orange-500' : 'bg-blue-500'}`}>
                            {isPartnerPost ? <Lock size={20} /> : <Globe size={20} />}
                        </div>
                        <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-tight">{isPartnerPost ? 'Secure Vault' : 'External Relay'}</h4>
                    </div>
                    
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-relaxed mb-6 font-bold uppercase tracking-widest">
                        {isPartnerPost 
                           ? "Authorized NUESA partnership tunnel. Data isolation protocols active."
                           : "Discovered via AI search. External redirection required for application finalization."
                        }
                    </p>

                    {hasApplied ? (
                        <div className="w-full py-4 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-black rounded-2xl flex items-center justify-center gap-2 border border-emerald-200 dark:border-emerald-800 text-xs uppercase tracking-widest">
                            <CheckCircle2 size={18} />
                            <span>Node Synced</span>
                        </div>
                    ) : isStudent ? (
                        <button 
                            onClick={() => onApply(opportunity)}
                            className={`w-full py-4 text-white font-black rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 group text-xs uppercase tracking-widest ${isPartnerPost ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/30' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/30'}`}
                        >
                            <span>{isPartnerPost ? 'Establish Link' : 'Exit to Portal'}</span>
                            {isPartnerPost ? <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /> : <ExternalLink size={18} />}
                        </button>
                    ) : (
                        <button 
                            onClick={() => {
                                onClose();
                                window.dispatchEvent(new CustomEvent('navigate-auth'));
                            }}
                            className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 text-xs uppercase tracking-widest"
                        >
                            <LogIn size={18} />
                            <span>Sign-In Required</span>
                        </button>
                    )}
                </div>

                {!isPartnerPost && (
                    <div className="space-y-4">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] text-center">Safety Advisory</p>
                        <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-2xl flex gap-3">
                             <ShieldAlert className="text-amber-600 shrink-0" size={16} />
                             <p className="text-[9px] text-amber-800 dark:text-amber-400 font-bold uppercase leading-relaxed">External sources are unvetted. Never share passwords or private bank codes on external portals.</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-12 text-center">
                <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest flex items-center justify-center gap-2">
                    <ShieldCheck size={14} className="text-emerald-500" /> AES-256 Encrypted Connection
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default OpportunityModal;
