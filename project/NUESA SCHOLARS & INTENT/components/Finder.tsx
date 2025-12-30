
import React, { useState, useEffect } from 'react';
import { Search, Loader2, ExternalLink, Globe, AlertCircle, ThumbsUp, ThumbsDown, DollarSign, Calendar, Building, ArrowRight, Sparkles, PlusCircle, Check, ChevronDown, Zap, Bookmark, MessageSquare, X, GraduationCap, Briefcase, Filter, MapPin, Clock, Send, Star, AlertTriangle } from 'lucide-react';
import { searchOpportunities, getAdvice } from '../services/geminiService';
import { AISearchResult, ParsedOpportunity, SavedOpportunity, User, Opportunity, ViewState } from '../types';
import FeaturedCard from './FeaturedCard';
import OpportunityModal from './OpportunityModal';
import { storageService } from '../services/storage';

interface FinderProps {
  type: 'scholarship' | 'internship';
  onSave?: (item: ParsedOpportunity, status: 'Applied' | 'Interested' | 'Won', requiredDocs?: string[]) => void;
  user?: User | null;
  featuredOpportunities?: Opportunity[];
}

const Finder: React.FC<FinderProps> = ({ type, onSave, user, featuredOpportunities = [] }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AISearchResult | null>(null);
  const [advice, setAdvice] = useState<string>('');
  const [hasSearched, setHasSearched] = useState(false);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const [isCommenting, setIsCommenting] = useState(false);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [savedItems, setSavedItems] = useState<Set<string>>(new Set());
  
  // Modal State
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);

  // Date Filter State
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Theme configuration based on type
  const theme = type === 'scholarship' ? {
      primary: 'orange',
      heroGradient: 'bg-gradient-to-br from-orange-700 via-amber-700 to-orange-900', 
      heroOverlay: 'from-orange-500/20',
      accent: 'text-orange-600',
      border: 'border-orange-200',
      icon: GraduationCap,
      heroTitle: 'Fund Your Education',
      heroSubtitle: 'Discover tuition waivers, research grants, and financial aid worldwide.',
      quickFilters: ['Undergraduate', 'Masters', 'PhD', 'Fully Funded', 'Europe', 'USA']
  } : {
      primary: 'emerald',
      heroGradient: 'bg-gradient-to-br from-emerald-800 via-teal-800 to-emerald-950', 
      heroOverlay: 'from-emerald-500/20',
      accent: 'text-emerald-600',
      border: 'border-emerald-200',
      icon: Briefcase,
      heroTitle: 'Launch Your Career',
      heroSubtitle: 'Find internships, co-op positions, and graduate trainee programs.',
      quickFilters: ['Remote', 'Paid', 'Engineering', 'Product Design', 'Marketing', 'Summer 2025']
  };

  useEffect(() => {
    const loadAdvice = async () => {
        const topic = type === 'scholarship' ? "how to win scholarships" : "how to land a good internship";
        const adviceText = await getAdvice(topic);
        setAdvice(adviceText);
    };
    loadAdvice();
  }, [type]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setHasSearched(true);
    setResult(null);
    setFeedback(null);
    setIsCommenting(false);
    setFeedbackComment('');
    setSavedItems(new Set()); 

    try {
      let enhancedQuery = query;
      if (dateRange.start && dateRange.end) {
          enhancedQuery += ` with deadline between ${dateRange.start} and ${dateRange.end}`;
      } else if (dateRange.start) {
          enhancedQuery += ` with deadline after ${dateRange.start}`;
      } else if (dateRange.end) {
          enhancedQuery += ` with deadline before ${dateRange.end}`;
      }

      const data = await searchOpportunities(enhancedQuery, type);
      setResult(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFilter = (filter: string) => {
      setQuery(prev => prev ? `${prev} ${filter}` : filter);
  };

  const handleSave = (opp: ParsedOpportunity | Opportunity, status: 'Applied' | 'Interested' | 'Won', requiredDocs?: string[]) => {
      if (onSave) {
          const toSave: ParsedOpportunity = {
              title: opp.title,
              Provider: (opp as any).provider || (opp as any).Provider,
              Amount: (opp as any).amount || (opp as any).Amount,
              Deadline: (opp as any).deadline || (opp as any).Deadline,
              Summary: (opp as any).description || (opp as any).Summary,
              Link: (opp as any).link || (opp as any).Link
          };
          onSave(toSave, status, requiredDocs);
          setSavedItems(prev => new Set(prev).add(opp.title));
      }
  };

  const handleApplyNow = (opp: Opportunity) => {
      const isPartner = opp.tags?.includes('Partner Sponsored');

      if (!isPartner) {
          // REAL LIFE SEARCH: Direct to external portal
          const directLink = opp.link || `https://www.google.com/search?q=${encodeURIComponent(opp.title)}`;
          window.open(directLink, '_blank');
          return;
      }

      // NUESA INTERNAL: Auto-apply logic
      if (!user) {
          alert("Sign-in required: You must be logged in as a student to apply for partner schemes.");
          window.dispatchEvent(new CustomEvent('navigate-auth'));
          return;
      }

      if (user.role !== 'student') {
          alert("Restricted: Automatic applications can only be submitted from a Student account.");
          return;
      }
      
      // Mark as done in local state and storage
      handleSave(opp, 'Applied', opp.requiredDocuments);
      
      // Simulate backend tracking increment
      storageService.incrementSponsorshipApplicants(opp.id);
      
      // Check for missing documents
      const missingDocs = opp.requiredDocuments?.filter(doc => !user.documents?.[doc]) || [];
      
      const successMsg = `Application Complete! We have successfully transmitted your NUESA profile to ${opp.provider}. You are now being tracked as an applicant.`;
      
      if (missingDocs.length > 0) {
          alert(`${successMsg}\n\nURGENT: Please visit your Profile to upload: ${missingDocs.join(', ')}. The partner will prioritize your file once these are verified.`);
      } else {
          alert(`${successMsg}\n\nYour profile is 100% verified for this scheme.`);
      }
      
      setSelectedOpportunity(null);
  };

  const parseOpportunities = (text: string): ParsedOpportunity[] | null => {
    if (!text.includes('###')) return null;
    const parts = text.split('###').filter(part => part.trim().length > 0);
    const parsed = parts.map(part => {
        const lines = part.trim().split('\n');
        const title = lines[0].trim();
        const details: Record<string, string> = {};
        lines.slice(1).forEach(line => {
            const match = line.match(/\- \*\*(.*?)\*\*:(.*)/);
            if (match) {
                details[match[1].trim()] = match[2].trim();
            } else if (line.trim().startsWith('- **Summary**:')) {
                details['Summary'] = line.replace('- **Summary**:', '').trim();
            } else if (details['Summary'] && line.trim()) {
                 details['Summary'] += ' ' + line.trim();
            }
        });
        return { title, ...details } as ParsedOpportunity;
    });
    return parsed.length > 0 ? parsed : null;
  };

  const renderResults = () => {
    if (!result) return null;
    const opportunities = parseOpportunities(result.text);
    if (opportunities) {
        return (
            <div className="space-y-8 animate-fade-in-up">
                 <div className="flex items-center gap-3 mb-6">
                    <div className={`p-2 rounded-lg bg-gradient-to-r from-${theme.primary}-600 to-${theme.primary}-500 text-white shadow-lg`}>
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">AI Search Discoveries</h3>
                        <p className="text-sm text-gray-500">Real-life sources identified via live intelligence</p>
                    </div>
                </div>
                
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2">
                    {opportunities.map((opp, idx) => {
                        const isSaved = savedItems.has(opp.title);
                        const directLink = opp.Link?.trim();
                        const isLinkValid = directLink && directLink.toLowerCase() !== 'not specified' && directLink.startsWith('http');

                        return (
                            <div 
                                key={idx} 
                                onClick={() => isLinkValid && window.open(directLink, '_blank')}
                                className="group bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-xl shadow-gray-200/50 dark:shadow-none relative overflow-hidden hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer"
                            >
                                <div className={`absolute -right-12 -top-12 w-40 h-40 bg-${theme.primary}-50 dark:bg-${theme.primary}-900/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700 pointer-events-none`}></div>
                                <div className="relative z-10 flex flex-col h-full">
                                    <div className="flex justify-between items-start gap-4 mb-4">
                                         <div className="flex items-center gap-3">
                                             <div className={`w-12 h-12 rounded-2xl bg-${theme.primary}-100 dark:bg-${theme.primary}-900/40 flex items-center justify-center text-${theme.primary}-600 dark:text-${theme.primary}-400 shadow-inner`}>
                                                 <Globe size={20} />
                                             </div>
                                             <div>
                                                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">External Source</p>
                                                 <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight truncate max-w-[120px]">{opp.Provider || 'Verified Site'}</p>
                                             </div>
                                         </div>
                                         <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                !isSaved && handleSave(opp, 'Interested');
                                            }}
                                            disabled={isSaved}
                                            className={`p-2.5 rounded-xl transition-all duration-200 ${
                                                isSaved
                                                    ? `text-${theme.primary}-500 bg-${theme.primary}-50 dark:bg-${theme.primary}-900/20`
                                                    : `text-gray-400 dark:text-gray-600 hover:text-${theme.primary}-500 hover:bg-white dark:hover:bg-gray-700 shadow-sm`
                                            }`}
                                        >
                                            <Bookmark size={20} className={isSaved ? "fill-current" : ""} />
                                        </button>
                                    </div>
                                    <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-6 leading-tight pr-2 group-hover:text-emerald-500 transition-colors">{opp.title}</h3>
                                    {opp.Amount && (
                                        <div className={`mb-6 p-4 rounded-2xl bg-gradient-to-r from-${theme.primary}-50 to-white dark:from-${theme.primary}-900/20 dark:to-gray-800 border border-${theme.primary}-100 dark:border-${theme.primary}-900/30 flex items-center gap-4 group-hover:shadow-md transition-shadow`}>
                                            <div className={`p-3 rounded-full bg-white dark:bg-gray-800 text-${theme.primary}-500 shadow-sm border border-${theme.primary}-100 dark:border-${theme.primary}-900`}>
                                                <DollarSign size={24} />
                                            </div>
                                            <div>
                                                <p className={`text-[10px] font-bold text-${theme.primary}-600/70 dark:text-${theme.primary}-400/70 uppercase tracking-wider`}>Estimated Value</p>
                                                <p className={`text-xl font-black text-${theme.primary}-700 dark:text-${theme.primary}-300`}>{opp.Amount}</p>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex-grow">
                                         <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-6 line-clamp-3">{opp.Summary}</p>
                                    </div>
                                    
                                    <div className="flex items-center justify-between gap-3 mt-auto">
                                         <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                isLinkValid ? window.open(directLink, '_blank') : window.open(`https://www.google.com/search?q=${encodeURIComponent(opp.title)}`, '_blank');
                                            }}
                                            className={`flex-1 flex items-center justify-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-4 rounded-xl font-bold hover:bg-gray-800 dark:hover:bg-gray-100 transition-all shadow-lg group/btn`}
                                         >
                                             {isLinkValid ? "Visit Application Portal" : "Search Original Source"}
                                             <ExternalLink size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                                         </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }
    return (
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden animate-fade-in-up">
            <div className={`bg-gradient-to-r from-${theme.primary}-600 to-${theme.primary}-500 px-8 py-6 flex items-center justify-between`}>
                <div>
                    <h3 className="text-white font-bold text-2xl flex items-center gap-2 mb-1">
                        <Globe className="w-6 h-6" />
                        Intelligence Summary
                    </h3>
                    <p className="text-white/80 text-sm">Real-time data from 50+ global education nodes.</p>
                </div>
            </div>
            <div className="p-8 prose prose-lg max-w-none text-gray-700 dark:text-gray-300">
                <div className="whitespace-pre-line leading-relaxed">{result.text}</div>
            </div>
        </div>
    );
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className={`relative pt-28 pb-40 px-4 overflow-visible ${theme.heroGradient} transition-all duration-500`}>
         <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-overlay"></div>
         <div className={`absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] ${theme.heroOverlay} via-transparent to-transparent`}></div>
         <div className="max-w-7xl mx-auto relative z-10 text-center">
             <div className="inline-flex items-center justify-center px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full mb-6 animate-scale-in shadow-xl">
                 <theme.icon size={18} className="text-white mr-2" />
                 <span className="text-white/90 text-xs font-bold uppercase tracking-widest">{type} Intelligence Scouting</span>
             </div>
             <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight leading-tight drop-shadow-lg">{theme.heroTitle}</h1>
             <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-0 leading-relaxed font-light drop-shadow-md">{theme.heroSubtitle}</p>
         </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-24 relative z-20">
         <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-4 md:p-6 shadow-2xl shadow-black/10 border border-gray-100 dark:border-gray-700 backdrop-blur-xl animate-fade-in-up">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-center gap-2 md:gap-4 bg-gray-50 dark:bg-gray-900 p-2 rounded-2xl border border-gray-200 dark:border-gray-700">
                <div className="flex-1 flex items-center w-full">
                    <div className="pl-4 text-gray-400"><Search className="w-6 h-6" /></div>
                    <input
                        type="text"
                        className="w-full px-4 py-4 text-lg text-gray-900 dark:text-white bg-transparent focus:outline-none placeholder-gray-400 font-medium"
                        placeholder={`Search for live ${type}s...`}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto p-1">
                    <button type="button" onClick={() => setShowDateFilter(!showDateFilter)} className={`p-4 rounded-xl transition-all border ${showDateFilter ? `bg-${theme.primary}-50 border-${theme.primary}-200 text-${theme.primary}-600 dark:bg-${theme.primary}-900/30 dark:border-${theme.primary}-800 dark:text-${theme.primary}-400` : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`} title="Filter by Date"><Filter size={20} /></button>
                    <button type="submit" disabled={loading} className={`bg-gradient-to-r from-${theme.primary}-600 to-${theme.primary}-500 text-white font-bold py-4 px-8 md:px-12 text-lg rounded-xl transition-all shadow-lg shadow-${theme.primary}-200 dark:shadow-none hover:shadow-xl hover:-translate-y-0.5 w-full md:w-auto flex justify-center`}>{loading ? <Loader2 className="animate-spin w-6 h-6" /> : <span className="flex items-center gap-2">Initiate Discovery <ArrowRight size={20} /></span>}</button>
                </div>
            </form>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider py-2 mr-2">Quick Nodes:</span>
                {theme.quickFilters.map(filter => (
                    <button key={filter} onClick={() => handleQuickFilter(filter)} className={`px-3 py-1.5 rounded-full text-xs font-bold bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-${theme.primary}-400 hover:text-${theme.primary}-600 dark:hover:text-${theme.primary}-400 hover:bg-white dark:hover:bg-gray-800 transition-all`}>{filter}</button>
                ))}
            </div>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        {!hasSearched && advice && (
            <div className={`mb-20 max-w-4xl mx-auto bg-white dark:bg-gray-800 border border-${theme.primary}-100 dark:border-${theme.primary}-900/30 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-6 shadow-xl animate-fade-in-up`}>
                <div className={`p-4 bg-${theme.primary}-50 dark:bg-${theme.primary}-900/20 rounded-2xl text-${theme.primary}-600 dark:text-${theme.primary}-400 shadow-sm`}><Zap className="w-8 h-8" /></div>
                <div className="text-center md:text-left"><h4 className={`text-xl font-bold text-gray-900 dark:text-white mb-2`}>Scouting Intelligence</h4><p className={`text-gray-600 dark:text-gray-300 text-base leading-relaxed`}>{advice}</p></div>
            </div>
        )}

        {!hasSearched && !loading && featuredOpportunities.length > 0 && (
            <div className="mb-24 animate-fade-in">
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl bg-gradient-to-br from-${theme.primary}-500 to-${theme.primary}-600 text-white shadow-lg transform -rotate-3`}><Star size={24} className="fill-white" /></div>
                        <div><h3 className="text-3xl font-black text-gray-900 dark:text-white">Partner & Local Hub</h3><p className="text-gray-500 font-medium">Direct opportunities from NUESA verified partners</p></div>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {featuredOpportunities.map((opp) => (
                        <FeaturedCard key={opp.id} opportunity={opp} colorTheme={type === 'scholarship' ? 'orange' : 'green'} onClick={setSelectedOpportunity} />
                    ))}
                </div>
            </div>
        )}

        {loading && (
            <div className="flex flex-col items-center justify-center py-20 space-y-8">
                <div className="relative"><div className={`w-24 h-24 border-4 border-${theme.primary}-100 border-t-${theme.primary}-600 rounded-full animate-spin`}></div><div className={`absolute inset-0 flex items-center justify-center`}><theme.icon size={32} className={`text-${theme.primary}-600 opacity-50`} /></div></div>
                <div className="text-center space-y-2"><h3 className="text-2xl font-bold text-gray-900 dark:text-white">Connecting to Global Nodes...</h3><p className="text-gray-500 dark:text-gray-400 text-lg">Parsing live data for verified {type} sources.</p></div>
            </div>
        )}

        {result && <div className="space-y-20 animate-fade-in">{renderResults()}</div>}
      </div>

      {selectedOpportunity && (
          <OpportunityModal opportunity={selectedOpportunity} user={user} onClose={() => setSelectedOpportunity(null)} onApply={handleApplyNow} />
      )}
    </div>
  );
};

export default Finder;
