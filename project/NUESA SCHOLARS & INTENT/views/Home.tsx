
import React, { useState } from 'react';
import Hero from '../components/Hero';
import { ViewState } from '../types';
import { Trophy, TrendingUp, Users, Search, ArrowRight, HelpCircle, ChevronDown, ChevronUp, Handshake, Briefcase, Shield, Check, ChevronRight, GraduationCap, Globe, Zap, Sparkles } from 'lucide-react';

interface HomeProps {
  onNavigate: (view: ViewState) => void;
}

const FAQS = [
  {
    question: "What is the difference between a Scholarship and a Bursary?",
    answer: "A scholarship is typically awarded based on academic merit, athletic skill, or other specific talents. A bursary, on the other hand, is primarily financial aid awarded based on financial need to help students cover tuition and living expenses, regardless of their grades (though they must usually pass)."
  },
  {
    question: "Do I have to repay a Student Grant?",
    answer: "No. Grants are often referred to as 'gift aid' because they do not need to be repaid. They are usually given by governments, universities, or private organizations for specific purposes, such as research projects or hardship support."
  },
  {
    question: "How does a Student Loan work?",
    answer: "A student loan is money borrowed from the government or a private lender to pay for college tuition and living costs. Unlike scholarships and grants, loans MUST be repaid with interest after you graduate or leave school, depending on the specific terms of the loan provider (e.g., NELFUND)."
  },
  {
    question: "Are Internships paid?",
    answer: "It depends. Many corporate internships in engineering, tech, and finance are paid and offer competitive stipends. However, some NGO or government internships may be unpaid or offer a small transport allowance. Our portal clearly highlights the 'Amount' or stipend where available."
  },
  {
    question: "What documents do I need to apply for these opportunities?",
    answer: "Commonly required documents include your Admission Letter, Valid School ID, Current Semester Results (CGPA), LGA Identification Letter, and Passport Photographs. For a full checklist, visit the 'Profile' section of your dashboard where you can also manage your uploads."
  },
  {
    question: "Can I apply for multiple scholarships at the same time?",
    answer: "Yes, you are generally encouraged to apply for as many scholarships as you are eligible for. However, some providers may have rules against holding two fully funded scholarships simultaneously. Always check the specific terms and conditions."
  }
];

const FAQItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden transition-all duration-300 hover:border-green-300 dark:hover:border-green-800 bg-white dark:bg-gray-900">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-5 text-left flex justify-between items-center focus:outline-none"
      >
        <span className="font-bold text-gray-900 dark:text-gray-100 text-lg">{question}</span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-green-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>
      <div 
        className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-48 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          {answer}
        </p>
      </div>
    </div>
  );
};

const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  return (
    <div className="animate-fade-in bg-white dark:bg-gray-950 transition-colors">
      <Hero onNavigate={onNavigate} />
      
      {/* Sponsorship Highlight Section */}
      <div className="py-24 px-4 max-w-7xl mx-auto">
        <div className="relative overflow-hidden bg-gray-900 dark:bg-gray-800 rounded-[3rem] shadow-2xl isolate transform transition-all hover:shadow-green-900/20 duration-500">
            <div className="absolute top-0 left-0 -translate-x-1/3 -translate-y-1/3 w-96 h-96 bg-green-500/30 rounded-full blur-[100px] opacity-50"></div>
            <div className="absolute bottom-0 right-0 translate-x-1/3 translate-y-1/3 w-96 h-96 bg-orange-500/30 rounded-full blur-[100px] opacity-50"></div>
            
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>

            <div className="relative z-10 grid lg:grid-cols-2 gap-12 lg:gap-0 items-center">
                <div className="p-8 md:p-16 lg:pr-8">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/10 text-orange-300 text-xs font-black uppercase tracking-[0.2em] mb-8 backdrop-blur-md shadow-lg">
                        <Trophy className="w-4 h-4" />
                        <span>Institutional Partnership</span>
                    </div>
                    
                    <h2 className="text-4xl md:text-6xl font-black text-white mb-8 leading-tight tracking-tight">
                        Power the <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">Ambitions</span> of Africa.
                    </h2>
                    
                    <p className="text-xl text-gray-300 mb-10 leading-relaxed font-light">
                        Corporate responsibility meets targeted excellence. Launch verified scholarship programs, access pre-vetted top-tier talent, and scale your social impact with data-driven transparency.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button 
                            onClick={() => onNavigate(ViewState.SPONSORS)}
                            className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-10 py-5 rounded-[2rem] font-black transition-all transform hover:-translate-y-1 shadow-2xl shadow-green-900/50"
                        >
                            Launch a Grant
                            <ArrowRight className="w-5 h-5" />
                        </button>
                        <button 
                             onClick={() => onNavigate(ViewState.SPONSORS)}
                             className="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white border-2 border-white/10 px-10 py-5 rounded-[2rem] font-black transition-all backdrop-blur-sm"
                        >
                            Partner Directory
                        </button>
                    </div>

                    <div className="mt-12 flex items-center gap-8 text-xs font-black uppercase tracking-widest text-gray-400 border-t border-white/10 pt-8">
                        <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-green-400" />
                            <span>Verified Students</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-orange-400" />
                            <span>Direct Talent Access</span>
                        </div>
                    </div>
                </div>

                <div className="relative h-full min-h-[450px] lg:min-h-auto w-full flex items-center justify-center p-8 lg:p-0 overflow-hidden">
                    <div className="relative w-full max-w-md perspective-1000">
                         <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-green-600 to-gray-900 rounded-[2.5rem] opacity-20 transform translate-x-6 translate-y-6 scale-95 blur-sm"></div>
                         
                         <div className="relative bg-gray-900/80 backdrop-blur-2xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl transform transition-transform hover:scale-[1.02] duration-500">
                             <div className="flex items-center justify-between mb-10">
                                 <div className="flex items-center gap-4">
                                     <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-black text-xl shadow-inner">
                                        N
                                     </div>
                                     <div>
                                         <div className="text-white font-black tracking-tight">NUESA Intelligence</div>
                                         <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Authorized Node</div>
                                     </div>
                                 </div>
                                 <div className="px-3 py-1 bg-green-500/20 text-green-400 text-[10px] font-black rounded-full uppercase border border-green-500/20 tracking-widest">Secured</div>
                             </div>

                             <div className="space-y-5">
                                 <div className="bg-white/5 rounded-2xl p-5 flex items-center justify-between border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                                     <div className="flex items-center gap-4">
                                         <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400 group-hover:scale-110 transition-transform">
                                            <Users size={20} />
                                         </div>
                                         <div>
                                             <div className="text-gray-200 text-base font-bold">Engineering Pool</div>
                                             <div className="text-xs text-gray-500 font-medium">85 Pre-vetted Candidates</div>
                                         </div>
                                     </div>
                                     <ChevronRight size={18} className="text-gray-600" />
                                 </div>

                                 <div className="bg-white/5 rounded-2xl p-5 flex items-center justify-between border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                                     <div className="flex items-center gap-4">
                                         <div className="p-3 bg-purple-500/20 rounded-xl text-purple-400 group-hover:scale-110 transition-transform">
                                            <GraduationCap size={20} />
                                         </div>
                                         <div>
                                             <div className="text-gray-200 text-base font-bold">CSR Endowment</div>
                                             <div className="text-xs text-gray-500 font-medium">N50.5M Active Funds</div>
                                         </div>
                                     </div>
                                     <ChevronRight size={18} className="text-gray-600" />
                                 </div>
                             </div>

                             <div className="absolute -right-8 top-1/2 bg-white text-gray-900 p-5 rounded-2xl shadow-2xl flex items-center gap-4 animate-bounce" style={{ animationDuration: '4s' }}>
                                 <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                    <Check className="w-5 h-5 text-green-600" strokeWidth={3} />
                                 </div>
                                 <div>
                                     <p className="text-xs font-black uppercase tracking-tight">Milestone Reached</p>
                                     <p className="text-[10px] font-bold text-gray-500">1,200+ Lives Impacted</p>
                                 </div>
                             </div>
                         </div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Write Up Improvements - Bento Grid */}
      <div className="py-24 px-4 max-w-7xl mx-auto">
        <div className="mb-20 text-center max-w-4xl mx-auto">
            <h2 className="text-5xl font-black text-green-950 dark:text-green-100 mb-6 tracking-tight leading-tight">
                Beyond Conventional <span className="text-orange-500 underline decoration-green-500 underline-offset-8">Searching.</span>
            </h2>
            <p className="text-xl text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                NUESA SCHOLAS leverages neural search patterns to decode eligibility criteria, matching you with opportunities you didn't even know existed.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 auto-rows-[340px]">
            <div className="md:col-span-2 bg-gradient-to-br from-green-900 to-green-800 dark:from-green-950 dark:to-green-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden group shadow-2xl shadow-green-900/20">
                <div className="absolute top-0 right-0 w-80 h-80 bg-green-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:bg-green-500/30 transition-all duration-700" />
                <div className="relative z-10 h-full flex flex-col justify-between">
                    <div>
                        <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border border-white/10 shadow-xl">
                            <Sparkles className="w-7 h-7 text-green-200" />
                        </div>
                        <h3 className="text-4xl font-black mb-4 tracking-tight">Contextual Intelligence</h3>
                        <p className="text-green-100 text-lg leading-relaxed max-w-xl font-light">
                            Our proprietary search architecture interprets complex academic requirements into simple matches. We don't just find keywords; we find futures.
                        </p>
                    </div>
                    <button onClick={() => onNavigate(ViewState.SCHOLARSHIPS)} className="self-start flex items-center gap-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all">
                        Experience Discovery <ArrowRight size={16} />
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-10 border-2 border-green-50 dark:border-green-900 shadow-xl hover:shadow-2xl transition-all duration-500 group relative overflow-hidden">
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-green-50 dark:bg-green-950 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-inner">
                    <Zap className="w-7 h-7 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-2xl font-black text-green-950 dark:text-green-100 mb-4 tracking-tight">Real-Time Sync</h3>
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                    Automated web scanning ensures our database reflects live availability, giving you a 48-hour advantage on new postings.
                </p>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-10 border-2 border-orange-50 dark:border-orange-900 shadow-xl hover:shadow-2xl transition-all duration-500 group relative overflow-hidden">
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-orange-50 dark:bg-orange-950 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="w-14 h-14 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500 shadow-inner">
                    <Globe className="w-7 h-7 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">Global Connectivity</h3>
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                    Integrated across 50+ countries. Whether it's a local bursary or an Ivy League endowment, your portal bridges the distance.
                </p>
            </div>

            <div className="md:col-span-2 bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 rounded-[2.5rem] p-10 text-white relative overflow-hidden group shadow-2xl shadow-orange-900/20">
                 <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
                 <div className="relative z-10 flex items-center justify-between h-full">
                    <div className="max-w-xl">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border border-white/20 shadow-xl">
                            <Trophy className="w-7 h-7 text-white" />
                        </div>
                        <h3 className="text-4xl font-black mb-4 tracking-tight">Proven Excellence</h3>
                        <p className="text-orange-50 text-xl font-light leading-relaxed">
                            Over 15,000 students have successfully transitioned into their next academic or professional chapter using our AI discovery engine.
                        </p>
                    </div>
                     <div className="hidden lg:block">
                        <TrendingUp className="w-48 h-48 text-white/10 rotate-12 scale-125" />
                    </div>
                 </div>
            </div>
        </div>
      </div>

      <div className="py-24 bg-orange-50/20 dark:bg-gray-900/40 border-y-2 border-gray-50 dark:border-gray-900">
        <div className="max-w-7xl mx-auto px-4">
             <div className="text-center mb-20">
                <h2 className="text-4xl font-black text-green-950 dark:text-green-100 tracking-tight">The Blueprint for Success</h2>
                <div className="w-20 h-1.5 bg-orange-500 mx-auto mt-4 rounded-full"></div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-16 relative">
                <div className="hidden md:block absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-orange-200 to-transparent dark:via-orange-900 -z-10"></div>

                <div className="text-center relative group">
                    <div className="w-28 h-28 bg-white dark:bg-gray-800 border-4 border-orange-100 dark:border-orange-800 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl z-10 relative group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                        <span className="text-5xl font-black text-orange-500">01</span>
                    </div>
                    <h3 className="text-2xl font-black mb-4 text-green-950 dark:text-green-100">Intelligent Discovery</h3>
                    <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                        Input your academic identity. Our engine parses thousands of datasets to find your unique matches.
                    </p>
                </div>

                <div className="text-center relative group">
                     <div className="w-28 h-28 bg-white dark:bg-gray-800 border-4 border-green-100 dark:border-green-800 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl z-10 relative group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500">
                        <span className="text-5xl font-black text-green-500">02</span>
                    </div>
                    <h3 className="text-2xl font-black mb-4 text-green-950 dark:text-green-100">Precision Matching</h3>
                    <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                        Filter by geolocation, stipend value, or academic level. We rank opportunities by your likelihood of success.
                    </p>
                </div>

                <div className="text-center relative group">
                     <div className="w-28 h-28 bg-white dark:bg-gray-800 border-4 border-orange-300 dark:border-orange-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl z-10 relative group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                        <span className="text-5xl font-black text-orange-600">03</span>
                    </div>
                    <h3 className="text-2xl font-black mb-4 text-green-950 dark:text-green-100">Direct Application</h3>
                    <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                        Navigate to provider portals with pre-formatted document packages prepared in your student profile.
                    </p>
                </div>
            </div>
        </div>
      </div>

      <div className="py-32 bg-white dark:bg-gray-950">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl mb-6 shadow-inner">
                <HelpCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-5xl font-black text-gray-900 dark:text-white mb-6 tracking-tight">Intelligence Hub</h2>
            <p className="text-xl text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                Navigating global education and career funding can be complex. We provide the clarity you need to move forward.
            </p>
          </div>
          
          <div className="space-y-6">
            {FAQS.map((faq, index) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
