
import React, { useState, useEffect } from 'react';
import { User, Sponsorship, DOCUMENTS_LIST, AppNotification } from '../types';
import { storageService } from '../services/storage';
import { Handshake, User as UserIcon, Mail, Briefcase, CheckCircle, ArrowRight, Star, PlusCircle, Users, DollarSign, Calendar, FileText, ChevronLeft, GraduationCap, Award, Search, CheckSquare, Square, Eye, Info, Check, Building2, UserCircle, ClipboardList, BriefcaseBusiness, Mail as MailIcon, ShieldCheck, Lock, UploadCloud, FileBadge, FileCheck, Loader2, Zap, Globe, TrendingUp, Quote, Activity, Clock, LayoutGrid, PieChart, Layers, Target, BarChart3, Wallet, X, Scale, Shield, Cookie, FileWarning, Link as LinkIcon } from 'lucide-react';

interface SponsorsProps {
  onLogin: (user: User) => void;
  user?: User | null;
  onNewNotification: (notification: AppNotification) => void;
}

const TITLES = [
  "Engineer",
  "Professor",
  "Doctor",
  "CEO/Director",
  "HR Manager",
  "CSR Lead",
  "Alumni",
  "Other"
];

// Success Stories Data for the Hero Section
const SUCCESS_STORIES = [
    {
        id: 1,
        partner: "Shell Nigeria",
        partnerLogo: "https://upload.wikimedia.org/wikipedia/en/thumb/e/e8/Shell_logo.svg/1200px-Shell_logo.svg.png",
        beneficiary: "Amara Nwachukwu",
        role: "MSc Chemical Engineering",
        school: "University of Lagos",
        impact: "Full Tuition + Research Grant",
        value: "N3.5M",
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600",
        quote: "The Shell JV scholarship didn't just pay my fees; it funded the research that launched my career in renewables."
    },
    {
        id: 2,
        partner: "MTN Foundation",
        partnerLogo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/New-mtn-logo.jpg/800px-New-mtn-logo.jpg",
        beneficiary: "Ibrahim Yusuf",
        role: "BSc Computer Science",
        school: "Ahmadu Bello University",
        impact: "Tech Talent Bootcamp",
        value: "Laptop + Stipend",
        image: "https://images.unsplash.com/photo-1531384441138-2736e62e0919?auto=format&fit=crop&q=80&w=600",
        quote: "Access to a high-end laptop and data stipend allowed me to compete in global hackathons."
    },
    {
        id: 3,
        partner: "TotalEnergies",
        partnerLogo: "https://upload.wikimedia.org/wikipedia/en/thumb/f/fa/TotalEnergies_logo.svg/1200px-TotalEnergies_logo.svg.png",
        beneficiary: "Tunde Bakare",
        role: "Geology Intern",
        school: "OAU Ile-Ife",
        impact: "Industrial Placement",
        value: "Paid Internship",
        image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=600",
        quote: "Real-world field experience is rare. TotalEnergies gave me a platform to apply my theoretical knowledge."
    }
];

// Mock Live Activity
const LIVE_ACTIVITY = [
    { partner: "Chevron", action: "posted a new Scholarship", time: "2m ago" },
    { partner: "UBA Foundation", action: "reviewed 15 applications", time: "5m ago" },
    { partner: "Dangote Group", action: "awarded a grant", time: "12m ago" },
    { partner: "Seplat Energy", action: "opened internship slots", time: "1h ago" },
];

// Mock Students for Direct Sponsorship
const MOCK_STUDENTS = [
    { id: 1, name: "Emmanuel Okafor", institution: "University of Lagos", cgpa: "4.85", dept: "Computer Science", need: "N150,000 for Tuition", bio: "Building AI models for agricultural pest detection." },
    { id: 2, name: "Fatima Yusuf", institution: "Ahmadu Bello University", cgpa: "4.50", dept: "Medicine", need: "N80,000 for Textbooks", bio: "Researching rural maternal health outcomes." },
    { id: 3, name: "Sarah Bassey", institution: "University of Calabar", cgpa: "4.20", dept: "Chemical Engineering", need: "Laptop for Projects", bio: "Developing sustainable waste-to-energy solutions." },
    { id: 4, name: "Tunde Bakare", institution: "OAU Ile-Ife", cgpa: "4.60", dept: "Law", need: "Bar Exam Fees", bio: "Advocate for juvenile justice reform." },
];

const PolicyModal: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void; 
    title: string; 
    content: React.ReactNode 
  }> = ({ isOpen, onClose, title, content }) => {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
        <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 relative flex flex-col max-h-[80vh]">
          <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              {title.includes('Privacy') ? <Shield className="text-green-500" /> : title.includes('Cookie') ? <Cookie className="text-emerald-600" /> : <Scale className="text-green-600" />}
              {title}
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>
          <div className="p-8 overflow-y-auto custom-scrollbar text-sm text-gray-600 dark:text-gray-300 leading-relaxed space-y-4">
            {content}
          </div>
          <div className="p-6 border-t border-gray-100 dark:border-gray-800 text-right">
            <button 
              onClick={onClose}
              className="px-6 py-2 bg-green-600 text-white rounded-xl font-bold hover:opacity-90 transition-opacity"
            >
              I Accept Partner Terms
            </button>
          </div>
        </div>
      </div>
    );
};

const Sponsors: React.FC<SponsorsProps> = ({ onLogin, user, onNewNotification }) => {
  // Auth State
  const [isRegistering, setIsRegistering] = useState(false);
  const [authStep, setAuthStep] = useState<'details' | 'otp' | 'kyc'>('details');
  const [vettingStage, setVettingStage] = useState(0); 
  
  // Auth Form Fields
  const [email, setEmail] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [title, setTitle] = useState('');
  
  // Agreement State
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [agreedToCookies, setAgreedToCookies] = useState(false);
  const [agreedToSponsorshipPolicy, setAgreedToSponsorshipPolicy] = useState(false);
  const [showPolicy, setShowPolicy] = useState<'terms' | 'privacy' | 'cookies' | 'sponsorship' | null>(null);

  // Verification Fields
  const [otp, setOtp] = useState('');
  const [cacNumber, setCacNumber] = useState('');
  const [tinNumber, setTinNumber] = useState(''); 
  const [loading, setLoading] = useState(false);

  // Dashboard State
  const [activeTab, setActiveTab] = useState<'overview' | 'schemes' | 'talent' | 'create'>('overview');
  const [mySponsorships, setMySponsorships] = useState<Sponsorship[]>([]);
  const [selectedSponsorship, setSelectedSponsorship] = useState<Sponsorship | null>(null);
  const [confirmStudent, setConfirmStudent] = useState<typeof MOCK_STUDENTS[0] | null>(null);
  
  // Create Form State
  const [scholarshipForm, setScholarshipForm] = useState({
      title: '',
      type: 'Scholarship',
      amount: '',
      deadline: '',
      criteria: '',
      slots: 1,
      link: '',
      requiredDocuments: [] as string[]
  });
  const [docSearch, setDocSearch] = useState('');

  // Slider State
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);

  useEffect(() => {
      if (user?.email) {
          setMySponsorships(storageService.getSponsorships(user.email));
      }
  }, [user, activeTab]);

  // Story Slider Timer
  useEffect(() => {
    if (user) return; 
    const timer = setInterval(() => {
        setCurrentStoryIndex(prev => (prev + 1) % SUCCESS_STORIES.length);
    }, 6000); 
    return () => clearInterval(timer);
  }, [user]);

  const totalApplications = mySponsorships.reduce((acc, curr) => acc + (curr.slots * 12), 0);
  const totalFunds = mySponsorships.length * 250000; // Mock calculation

  const runVettingProcess = () => {
    setLoading(true);
    setVettingStage(1);
    setTimeout(() => {
        setVettingStage(2);
        setTimeout(() => {
            setVettingStage(3);
            setTimeout(() => {
                const userName = organizationName;
                const user = storageService.login(email, userName, 'sponsor', title, contactPerson);
                onLogin(user);
                setLoading(false);
                setVettingStage(0);
                alert("Advanced verification successful! Partner account created.");
            }, 1000);
        }, 1500);
    }, 1500);
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isRegistering) {
        if (!email.trim()) { alert("Please enter your email."); return; }
        setLoading(true);
        setTimeout(() => {
            const userName = organizationName || email.split('@')[0];
            const user = storageService.login(email, userName, 'sponsor', title, contactPerson);
            onLogin(user);
            setLoading(false);
        }, 1500);
        return;
    }
    if (authStep === 'details') {
        if (!organizationName.trim() || !contactPerson.trim() || !title || !email.includes('@')) {
            alert("Please fill in all details correctly."); return;
        }
        if (!agreedToTerms || !agreedToPrivacy || !agreedToCookies || !agreedToSponsorshipPolicy) {
            alert("You must agree to all policies, including the Sponsorship Policy, to proceed.");
            return;
        }
        setLoading(true);
        setTimeout(() => { setLoading(false); setAuthStep('otp'); setOtp(''); }, 1000);
    }
    else if (authStep === 'otp') {
        if (otp !== '123456') { alert("Invalid verification code."); return; }
        setLoading(true);
        setTimeout(() => { setLoading(false); setAuthStep('kyc'); }, 800);
    }
    else if (authStep === 'kyc') {
        if (!cacNumber.trim() || !tinNumber.trim()) { alert("Please enter valid registration details."); return; }
        runVettingProcess();
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!user) return;
      setLoading(true);
      setTimeout(() => {
          const newSponsorship: Sponsorship = {
              id: crypto.randomUUID(),
              providerEmail: user.email,
              providerName: user.name,
              title: scholarshipForm.title,
              type: scholarshipForm.type as any,
              amount: scholarshipForm.amount,
              deadline: scholarshipForm.deadline,
              criteria: scholarshipForm.criteria,
              slots: scholarshipForm.slots,
              requiredDocuments: scholarshipForm.requiredDocuments,
              dateCreated: new Date().toISOString(),
              link: scholarshipForm.link || undefined
          };
          storageService.createSponsorship(newSponsorship);
          const notification: AppNotification = {
              id: crypto.randomUUID(),
              title: `New ${scholarshipForm.type} Posted`,
              message: `${user.name} has just created a new ${scholarshipForm.type}: ${scholarshipForm.title}. Apply now!`,
              date: new Date().toISOString(),
              read: false,
              type: scholarshipForm.type.toLowerCase() as any,
              link: scholarshipForm.link || undefined
          };
          onNewNotification(notification);
          setLoading(false);
          setActiveTab('overview');
          setScholarshipForm({
              title: '', type: 'Scholarship', amount: '', deadline: '', criteria: '', slots: 1, link: '', requiredDocuments: []
          });
          alert("Opportunity created and broadcasted successfully!");
      }, 1000);
  };

  const initiateSponsorship = (student: typeof MOCK_STUDENTS[0]) => { setConfirmStudent(student); };
  const finalizeSponsorship = () => {
      if (!confirmStudent) return;
      alert(`Request initiated for ${confirmStudent.name}. Check your email.`);
      setConfirmStudent(null);
  };

  const toggleDocument = (doc: string) => {
      setScholarshipForm(prev => {
          const exists = prev.requiredDocuments.includes(doc);
          return exists 
            ? { ...prev, requiredDocuments: prev.requiredDocuments.filter(d => d !== doc) }
            : { ...prev, requiredDocuments: [...prev.requiredDocuments, doc] };
      });
  };

  const filteredDocs = DOCUMENTS_LIST.filter(doc => doc.toLowerCase().includes(docSearch.toLowerCase()));
  const toggleMode = () => { 
    setIsRegistering(!isRegistering); 
    setAuthStep('details'); 
    setOtp(''); 
    setCacNumber(''); 
    setTinNumber(''); 
    setAgreedToTerms(false);
    setAgreedToPrivacy(false);
    setAgreedToCookies(false);
    setAgreedToSponsorshipPolicy(false);
  };

  const currentStory = SUCCESS_STORIES[currentStoryIndex] || SUCCESS_STORIES[0];

  const termsContent = (
    <div className="space-y-4">
      <h4 className="font-bold text-gray-900 dark:text-white">Partner Terms of Service (B2B)</h4>
      <p>By creating a Partner account, your organization agrees to post only verified and funded academic opportunities. Fraudulent scholarship postings are strictly prohibited and will lead to legal action.</p>
      <p>You agree to handle student academic records with the highest level of confidentiality and comply with international data protection standards (GDPR/NDPR).</p>
      <h4 className="font-bold text-gray-900 dark:text-white">Liability</h4>
      <p>NUESA SCHOLAS provides the matching engine; the final legal and financial obligation of the award rests solely with your organization as the provider.</p>
    </div>
  );

  const privacyContent = (
    <div className="space-y-4">
      <h4 className="font-bold text-gray-900 dark:text-white">Organizational Privacy</h4>
      <p>Your business documents (CAC, TIN) are stored in an isolated, encrypted vault. They are only used by our compliance team to verify your identity before allowing you to post public schemes.</p>
      <h4 className="font-bold text-gray-900 dark:text-white">Student Data Usage</h4>
      <p>You are granted a limited license to view applying student data. You may not export this data for third-party marketing or profiling outside of your specific recruitment needs.</p>
    </div>
  );

  const cookiesContent = (
    <div className="space-y-4">
      <h4 className="font-bold text-gray-900 dark:text-white">Professional Analytics Cookies</h4>
      <p>Our partner portal uses session-persistence cookies to maintain your administrative access and analytical cookies to provide you with insights into applicant demographics and engagement rates.</p>
    </div>
  );

  const sponsorshipPolicyContent = (
    <div className="space-y-4">
      <h4 className="font-bold text-gray-900 dark:text-white">Official Sponsorship Policy</h4>
      <p>This policy outlines the financial and ethical obligations of a Sponsor on the NUESA platform.</p>
      <ul className="list-disc pl-5 space-y-2">
        <li><strong>Verification of Funds:</strong> Sponsors must provide evidence of scholarship funding if requested by the NUESA Audit Committee.</li>
        <li><strong>Selection Impartiality:</strong> The selection process must be free from nepotism and strictly follow the published criteria.</li>
        <li><strong>Timely Disbursement:</strong> Awards must be disbursed within 30 days of the announcement of winners, unless otherwise stated.</li>
        <li><strong>Direct Communication:</strong> Sponsors must use the NUESA portal for official communications with applicants to maintain an audit trail.</li>
      </ul>
      <p>Any violation of this policy will result in immediate suspension of the Partner account and potential blacklisting from university-affiliated programs.</p>
    </div>
  );

  // --- RENDER: If NOT Logged In (Or User is Student) ---
  if (!user) {
    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors animate-fade-in font-sans">
        {/* Vetting Overlay Modal */}
        {vettingStage > 0 && (
             <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
                 <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-md w-full text-center border border-gray-200 dark:border-gray-800 shadow-2xl">
                     <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                         <ShieldCheck className="w-10 h-10 text-emerald-600 animate-pulse" />
                     </div>
                     <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Corporate Verification</h3>
                     <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Processing your organization's credentials securely.</p>
                     
                     <div className="space-y-4 text-left">
                         <div className="flex items-center gap-3">
                             {vettingStage >= 1 ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <Loader2 className="w-5 h-5 text-gray-300 animate-spin" />}
                             <span className={vettingStage >= 1 ? "text-gray-900 dark:text-white font-medium" : "text-gray-400"}>Corporate Affairs Commission (CAC) Check</span>
                         </div>
                         <div className="flex items-center gap-3">
                             {vettingStage >= 2 ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <div className={`w-5 h-5 rounded-full border-2 ${vettingStage === 1 ? 'border-emerald-500 border-t-transparent animate-spin' : 'border-gray-200'}`}></div>}
                             <span className={vettingStage >= 2 ? "text-gray-900 dark:text-white font-medium" : "text-gray-400"}>Tax Compliance Verification (TIN)</span>
                         </div>
                         <div className="flex items-center gap-3">
                             {vettingStage >= 3 ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <div className={`w-5 h-5 rounded-full border-2 ${vettingStage === 2 ? 'border-emerald-500 border-t-transparent animate-spin' : 'border-gray-200'}`}></div>}
                             <span className={vettingStage >= 3 ? "text-gray-900 dark:text-white font-medium" : "text-gray-400"}>Account Activation</span>
                         </div>
                     </div>
                 </div>
             </div>
        )}

        {/* REDESIGNED HERO SECTION */}
        <div className="relative bg-[#0F172A] text-white overflow-hidden min-h-[90vh] flex items-center py-20 lg:py-0">
            {/* Background Texture - Deep Corporate Feel */}
            <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#022c22] via-[#064e3b] to-[#0f172a]"></div>
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[120px] -translate-y-1/3 translate-x-1/3"></div>

            <div className="max-w-7xl mx-auto px-4 relative z-10 w-full">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    
                    {/* Left: Content */}
                    <div className="space-y-8 animate-fade-in-up">
                        <div className="inline-flex items-center gap-2 bg-emerald-900/50 border border-emerald-700/50 rounded-full px-4 py-1.5 backdrop-blur-sm">
                            <Globe className="w-3 h-3 text-emerald-400" />
                            <span className="text-xs font-bold text-emerald-200 uppercase tracking-widest">NUESA Corporate Gateway</span>
                        </div>
                        
                        <h1 className="text-5xl md:text-6xl font-serif font-medium leading-[1.1]">
                            Strategic Philanthropy, <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-500 font-bold">Measurable Impact.</span>
                        </h1>
                        
                        <p className="text-lg text-emerald-100/70 max-w-xl leading-relaxed font-light">
                            Transform your CSR initiatives into tangible outcomes. Partner with NUESA to identify, verify, and fund the next generation of African leaders with transparency and precision.
                        </p>

                        <div className="flex flex-wrap gap-8 py-4 border-t border-white/10">
                            <div>
                                <p className="text-3xl font-bold text-white">50+</p>
                                <p className="text-xs text-emerald-400 uppercase tracking-wider mt-1">Corporate Partners</p>
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-white">100%</p>
                                <p className="text-xs text-emerald-400 uppercase tracking-wider mt-1">Verified Students</p>
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-white">N200M+</p>
                                <p className="text-xs text-emerald-400 uppercase tracking-wider mt-1">Funds Disbursed</p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <button 
                                onClick={() => document.getElementById('partner-form')?.scrollIntoView({ behavior: 'smooth' })}
                                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-medium px-8 py-4 rounded-xl transition-all shadow-lg shadow-emerald-900/50 flex items-center justify-center gap-2"
                            >
                                <span>Become a Partner</span>
                                <ArrowRight size={18} />
                            </button>
                            <button className="px-8 py-4 rounded-xl border border-white/10 hover:bg-white/5 text-emerald-100 transition-all font-medium">
                                View Impact Report
                            </button>
                        </div>
                    </div>

                    {/* Right: Unique Impact Showcase */}
                    <div className="relative hidden lg:block perspective-1000">
                        {/* Decorative Background for Card */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-emerald-500/5 rounded-full blur-3xl"></div>

                        {/* Main Spotlight Card */}
                        <div className="relative w-full max-w-md mx-auto bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-1 shadow-2xl transition-all duration-700 animate-float">
                            <div className="bg-gradient-to-b from-gray-900 to-black rounded-[1.8rem] p-6 overflow-hidden relative">
                                {/* Gold Accent Line */}
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent opacity-50"></div>
                                
                                {/* Header */}
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white rounded-lg p-1">
                                           {/* Partner Logo Placeholder */}
                                           <div className="w-full h-full bg-emerald-100 rounded flex items-center justify-center text-xs font-bold text-emerald-900">
                                               {currentStory?.partner?.charAt(0) || 'P'}
                                           </div>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-emerald-400 uppercase tracking-wider font-bold">Powered By</p>
                                            <p className="text-white font-bold text-sm">{currentStory?.partner || 'Valued Partner'}</p>
                                        </div>
                                    </div>
                                    <div className="px-3 py-1 bg-white/10 rounded-full border border-white/10 text-[10px] text-white flex items-center gap-1">
                                        <CheckCircle size={10} className="text-yellow-400" /> Verified Impact
                                    </div>
                                </div>

                                {/* Student Image Area */}
                                <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-6 group">
                                    <img src={currentStory?.image} alt={currentStory?.beneficiary} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-90 group-hover:opacity-100" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90"></div>
                                    
                                    <div className="absolute bottom-4 left-4 right-4">
                                        <h3 className="text-2xl font-bold text-white mb-1">{currentStory?.beneficiary}</h3>
                                        <p className="text-emerald-300 text-sm flex items-center gap-1">
                                            <GraduationCap size={14} /> {currentStory?.role}
                                        </p>
                                        <p className="text-gray-400 text-xs mt-0.5">{currentStory?.school}</p>
                                    </div>
                                </div>

                                {/* Stats Row */}
                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Grant Value</p>
                                        <p className="text-yellow-400 font-bold text-lg">{currentStory?.value}</p>
                                    </div>
                                    <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Outcome</p>
                                        <p className="text-white font-bold text-sm leading-tight">{currentStory?.impact}</p>
                                    </div>
                                </div>

                                {/* Quote */}
                                <div className="relative pl-4 border-l-2 border-emerald-500/30">
                                    <Quote size={16} className="absolute -top-2 left-3 text-emerald-500/20 transform -scale-x-100" />
                                    <p className="text-gray-400 text-xs italic leading-relaxed">"{currentStory?.quote}"</p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Live Activity Feed - Floating Component */}
                        <div className="absolute -right-12 bottom-12 w-64 bg-slate-900/90 backdrop-blur-md border border-slate-700/50 rounded-xl p-4 shadow-2xl animate-fade-in-up" style={{animationDelay: '0.5s'}}>
                            <div className="flex items-center gap-2 mb-3 border-b border-white/5 pb-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-xs font-bold text-white uppercase tracking-wider">Live Activity</span>
                            </div>
                            <div className="space-y-3">
                                {LIVE_ACTIVITY.map((activity, idx) => (
                                    <div key={idx} className="flex items-start gap-3">
                                        <Activity size={12} className="text-emerald-500 mt-1 flex-shrink-0" />
                                        <div>
                                            <p className="text-xs text-gray-300 leading-tight">
                                                <span className="font-bold text-white">{activity.partner}</span> {activity.action}.
                                            </p>
                                            <p className="text-[10px] text-gray-500 mt-0.5 flex items-center gap-1">
                                                <Clock size={8} /> {activity.time}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-16 grid lg:grid-cols-2 gap-16 items-start">
            
            {/* Info Section */}
            <div className="space-y-8 order-2 lg:order-1">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white font-serif">Why Partner with Us?</h2>
                
                <div className="space-y-6">
                    <div className="flex gap-4 p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center flex-shrink-0 text-orange-600 dark:text-orange-400">
                            <Briefcase size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Corporate Visibility</h3>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">Showcase your brand to thousands of high-achieving students. Direct access to top talent for internships.</p>
                        </div>
                    </div>

                    <div className="flex gap-4 p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center flex-shrink-0 text-emerald-600 dark:text-emerald-400">
                            <ShieldCheck size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Verified & Secure</h3>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">Our advanced vetting system ensures your funds reach genuine students. All partners undergo business verification.</p>
                        </div>
                    </div>

                     <div className="flex gap-4 p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 text-blue-600 dark:text-blue-400">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Real-Time Impact Reports</h3>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">Track every naira disbursed. Get automated reports on student performance and career progression.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Auth Form - Order 1 on mobile to show first */}
            <div id="partner-form" className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 order-1 lg:order-2">
                <div className="mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {isRegistering ? 'Become a Partner' : 'Partner Login'}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        {isRegistering && (
                            <>
                                <span className={`flex items-center gap-1 ${authStep === 'details' ? 'text-emerald-600 font-bold' : ''}`}>1. Details</span>
                                <span className="text-gray-300">→</span>
                                <span className={`flex items-center gap-1 ${authStep === 'otp' ? 'text-emerald-600 font-bold' : ''}`}>2. Verify Email</span>
                                <span className="text-gray-300">→</span>
                                <span className={`flex items-center gap-1 ${authStep === 'kyc' ? 'text-emerald-600 font-bold' : ''}`}>3. Advanced KYC</span>
                            </>
                        )}
                        {!isRegistering && <span>Welcome back to your dashboard.</span>}
                    </div>
                </div>

                <form onSubmit={handleAuthSubmit} className="space-y-4">
                    
                    {/* --- REGISTRATION FLOW --- */}
                    {isRegistering && authStep === 'details' && (
                        <div className="space-y-4 animate-fade-in">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Organization Name</label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input 
                                        type="text" 
                                        required 
                                        value={organizationName}
                                        onChange={e => setOrganizationName(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-emerald-500" 
                                        placeholder="e.g. Shell Nigeria"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Person Name</label>
                                <div className="relative">
                                    <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input 
                                        type="text" 
                                        required 
                                        value={contactPerson}
                                        onChange={e => setContactPerson(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-emerald-500" 
                                        placeholder="e.g. Dr. John Okon"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title / Role</label>
                                <div className="relative">
                                    <BriefcaseBusiness className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <select 
                                        value={title}
                                        onChange={e => setTitle(e.target.value)}
                                        required
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-emerald-500 appearance-none"
                                    >
                                        <option value="">Select Title</option>
                                        {TITLES.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                            </div>

                             <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Official Email Address</label>
                                <div className="relative">
                                    <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input 
                                        type="email" 
                                        required 
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-emerald-500" 
                                        placeholder="partner@company.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Partner Agreement Required</p>
                                <label className="flex items-start gap-3 group cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={agreedToTerms}
                                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                                    className="mt-1 w-4 h-4 rounded text-green-600 focus:ring-green-500 border-gray-300"
                                />
                                <span className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                    I accept the <button type="button" onClick={() => setShowPolicy('terms')} className="text-green-600 font-bold hover:underline">Sponsorship & Partnership Terms</button>.
                                </span>
                                </label>
                                <label className="flex items-start gap-3 group cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={agreedToPrivacy}
                                    onChange={(e) => setAgreedToPrivacy(e.target.checked)}
                                    className="mt-1 w-4 h-4 rounded text-green-600 focus:ring-green-500 border-gray-300"
                                />
                                <span className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                    I consent to the <button type="button" onClick={() => setShowPolicy('privacy')} className="text-green-600 font-bold hover:underline">Partner Privacy Policy</button>.
                                </span>
                                </label>
                                <label className="flex items-start gap-3 group cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={agreedToCookies}
                                    onChange={(e) => setAgreedToCookies(e.target.checked)}
                                    className="mt-1 w-4 h-4 rounded text-green-600 focus:ring-green-500 border-gray-300"
                                />
                                <span className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                    I accept the <button type="button" onClick={() => setShowPolicy('cookies')} className="text-green-600 font-bold hover:underline">Partner Cookies Policy</button>.
                                </span>
                                </label>
                                <label className="flex items-start gap-3 group cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={agreedToSponsorshipPolicy}
                                    onChange={(e) => setAgreedToSponsorshipPolicy(e.target.checked)}
                                    className="mt-1 w-4 h-4 rounded text-green-600 focus:ring-green-500 border-gray-300"
                                />
                                <span className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                    I accept the <button type="button" onClick={() => setShowPolicy('sponsorship')} className="text-green-600 font-bold hover:underline">Official Sponsorship Policy</button>.
                                </span>
                                </label>
                            </div>
                        </div>
                    )}

                    {isRegistering && authStep === 'otp' && (
                        <div className="space-y-4 animate-fade-in text-center py-4">
                             <div className="mx-auto w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 mb-2">
                                <Mail size={32} />
                            </div>
                            <h4 className="font-bold text-gray-900 dark:text-white">Verify your Email</h4>
                            <p className="text-sm text-gray-500">Enter the code sent to <b>{email}</b></p>
                            
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm rounded-lg font-medium border border-blue-100 dark:border-blue-800">
                                Use Demo Code: <strong>123456</strong>
                            </div>

                            <input
                                type="text"
                                required
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                                className="w-full px-4 py-4 text-center text-2xl font-bold tracking-widest rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-emerald-500"
                                placeholder="000000"
                                autoFocus
                            />
                            <button type="button" onClick={() => alert("Resent code: 123456")} className="text-sm text-orange-500 hover:underline">Resend Code</button>
                        </div>
                    )}

                    {isRegistering && authStep === 'kyc' && (
                         <div className="space-y-6 animate-fade-in py-2">
                             <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 flex gap-3">
                                 <Lock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                 <div className="text-sm text-blue-800 dark:text-blue-300">
                                     <p className="font-bold mb-1">Advanced Verification Required</p>
                                     <p>To ensure trust, we verify your company status with the Corporate Affairs Commission (CAC) and Tax Authorities.</p>
                                 </div>
                             </div>

                             <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company Registration (CAC) Number</label>
                                <div className="relative">
                                    <FileBadge className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input 
                                        type="text" 
                                        required 
                                        value={cacNumber}
                                        onChange={e => setCacNumber(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-emerald-500" 
                                        placeholder="RC 12345678"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tax Identification Number (TIN)</label>
                                <div className="relative">
                                    <FileCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input 
                                        type="text" 
                                        required 
                                        value={tinNumber}
                                        onChange={e => setTinNumber(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-emerald-500" 
                                        placeholder="TIN-00000000"
                                    />
                                </div>
                            </div>

                            <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-6 text-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer" onClick={() => alert("Simulated: Upload Dialog Opened")}>
                                <UploadCloud className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm font-medium text-gray-900 dark:text-white">Upload Certificate of Incorporation</p>
                                <p className="text-xs text-gray-400 mt-1">PDF, JPG or PNG (Max 5MB)</p>
                            </div>
                        </div>
                    )}


                    {/* --- LOGIN FLOW --- */}
                    {!isRegistering && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                            <div className="relative">
                                <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input 
                                    type="email" 
                                    required 
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-emerald-500" 
                                    placeholder="partner@company.com"
                                />
                            </div>
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={loading || (isRegistering && authStep === 'details' && (!agreedToTerms || !agreedToPrivacy || !agreedToCookies || !agreedToSponsorshipPolicy))}
                        className={`w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-200 dark:shadow-none transition-all flex items-center justify-center gap-2 ${loading || (isRegistering && authStep === 'details' && (!agreedToTerms || !agreedToPrivacy || !agreedToCookies || !agreedToSponsorshipPolicy)) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Processing...' : (
                            isRegistering 
                                ? (authStep === 'details' ? 'Next: Verify Email' : authStep === 'otp' ? 'Next: Business KYC' : 'Verify & Create Account') 
                                : 'Access Dashboard'
                        )}
                        {!loading && <ArrowRight size={18} />}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button 
                        onClick={toggleMode}
                        className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                        {isRegistering ? 'Already have an account? Login' : 'New here? Register as a Partner'}
                    </button>
                </div>
            </div>
        </div>

        <PolicyModal 
            isOpen={showPolicy === 'terms'} 
            onClose={() => setShowPolicy(null)} 
            title="Partner Terms & Conditions" 
            content={termsContent} 
        />
        <PolicyModal 
            isOpen={showPolicy === 'privacy'} 
            onClose={() => setShowPolicy(null)} 
            title="Partner Privacy Policy" 
            content={privacyContent} 
        />
        <PolicyModal 
            isOpen={showPolicy === 'cookies'} 
            onClose={() => setShowPolicy(null)} 
            title="Partner Cookies Policy" 
            content={cookiesContent} 
        />
        <PolicyModal 
            isOpen={showPolicy === 'sponsorship'} 
            onClose={() => setShowPolicy(null)} 
            title="Official Sponsorship Policy" 
            content={sponsorshipPolicyContent} 
        />
        </div>
    );
  }

  // --- RENDER: Logged In (Dashboard) ---
  return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 px-4 py-8 animate-fade-in font-sans">
          <div className="max-w-7xl mx-auto">
              
              {/* Premium Dashboard Header */}
              <div className="bg-gradient-to-r from-emerald-900 to-gray-900 rounded-[2rem] p-8 md:p-12 mb-10 shadow-2xl relative overflow-hidden">
                   {/* Abstract Shapes */}
                   <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
                   <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold-500/5 rounded-full blur-[80px]"></div>

                   <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                       <div>
                           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-4">
                               <ShieldCheck size={12} /> Verified Partner Portal
                           </div>
                           <h1 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight">
                               Welcome back, <br/>
                               <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">{user.name}</span>
                           </h1>
                           <p className="text-gray-400 text-lg max-w-lg">{user.title || 'Sponsor'} • {user.email}</p>
                       </div>
                       
                       <div className="flex gap-3">
                           <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center min-w-[120px]">
                               <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Schemes</p>
                               <p className="text-2xl font-bold text-white">{mySponsorships.length}</p>
                           </div>
                           <div className="bg-emerald-600/20 backdrop-blur-md rounded-2xl p-4 border border-emerald-500/30 text-center min-w-[120px]">
                               <p className="text-xs text-emerald-300 uppercase tracking-wider mb-1">Impact</p>
                               <p className="text-2xl font-bold text-white">{totalApplications}</p>
                           </div>
                       </div>
                   </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex overflow-x-auto gap-2 mb-8 pb-2">
                  {[
                      { id: 'overview', label: 'Mission Control', icon: LayoutGrid },
                      { id: 'schemes', label: 'My Schemes', icon: Layers },
                      { id: 'talent', label: 'Talent Scout', icon: Target },
                      { id: 'create', label: 'Create New', icon: PlusCircle },
                  ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all ${
                            activeTab === tab.id
                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 dark:shadow-none'
                                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                          <tab.icon size={18} />
                          {tab.label}
                      </button>
                  ))}
              </div>

              {/* DASHBOARD CONTENT AREA */}
              <div className="min-h-[500px]">
                  
                  {/* OVERVIEW TAB */}
                  {activeTab === 'overview' && (
                      <div className="space-y-8 animate-fade-in">
                          {/* Financial / Impact Stats Grid */}
                          <div className="grid md:grid-cols-3 gap-6">
                              <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden group">
                                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors"></div>
                                  <div className="relative z-10">
                                      <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
                                          <Wallet size={24} />
                                      </div>
                                      <p className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-wider">Estimated Value</p>
                                      <h3 className="text-3xl font-black text-gray-900 dark:text-white mt-1">N{totalFunds.toLocaleString()}</h3>
                                      <p className="text-emerald-500 text-xs font-bold mt-2 flex items-center gap-1">
                                          <TrendingUp size={12} /> +12% this quarter
                                      </p>
                                  </div>
                              </div>

                              <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden group">
                                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors"></div>
                                  <div className="relative z-10">
                                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
                                          <Users size={24} />
                                      </div>
                                      <p className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-wider">Lives Touched</p>
                                      <h3 className="text-3xl font-black text-gray-900 dark:text-white mt-1">{totalApplications * 3}</h3>
                                      <p className="text-blue-500 text-xs font-bold mt-2 flex items-center gap-1">
                                          <Globe size={12} /> Across 12 Universities
                                      </p>
                                  </div>
                              </div>

                              <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden group">
                                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl group-hover:bg-purple-500/10 transition-colors"></div>
                                  <div className="relative z-10">
                                      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-2xl flex items-center justify-center mb-4">
                                          <BarChart3 size={24} />
                                      </div>
                                      <p className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-wider">Success Rate</p>
                                      <h3 className="text-3xl font-black text-gray-900 dark:text-white mt-1">94%</h3>
                                      <p className="text-purple-500 text-xs font-bold mt-2 flex items-center gap-1">
                                          <CheckCircle size={12} /> Completion
                                      </p>
                                  </div>
                              </div>
                          </div>

                          {/* Recent Activity Timeline */}
                          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700">
                              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Recent Portal Activity</h3>
                              <div className="space-y-6 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100 dark:before:bg-gray-700">
                                  {[1,2,3].map((_, i) => (
                                      <div key={i} className="relative pl-10">
                                          <div className="absolute left-[11px] top-1.5 w-3 h-3 bg-emerald-500 rounded-full border-4 border-white dark:border-gray-800"></div>
                                          <p className="text-sm font-bold text-gray-900 dark:text-white">New Application Batch Received</p>
                                          <p className="text-xs text-gray-500 mt-1">15 students applied for "2025 Tech Grant" • {i * 2 + 1} hours ago</p>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      </div>
                  )}

                  {/* SCHEMES TAB */}
                  {activeTab === 'schemes' && (
                      <div className="animate-fade-in">
                          <div className="flex justify-between items-center mb-6">
                              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Active Programs</h2>
                              <button onClick={() => setActiveTab('create')} className="text-sm font-bold text-emerald-600 hover:underline">
                                  + Create New
                              </button>
                          </div>
                          
                          {mySponsorships.length === 0 ? (
                              <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
                                  <Layers size={48} className="mx-auto text-gray-300 mb-4" />
                                  <p className="text-gray-500 dark:text-gray-400 font-medium">No active schemes found.</p>
                                  <p className="text-sm text-gray-400">Launch your first scholarship to see it here.</p>
                              </div>
                          ) : (
                              <div className="grid gap-4">
                                  {mySponsorships.map(scheme => (
                                      <div key={scheme.id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-emerald-400 transition-colors group cursor-pointer" onClick={() => {setSelectedSponsorship(scheme); /* Ideally show modal */}}>
                                          <div className="flex justify-between items-start">
                                              <div>
                                                  <div className="flex items-center gap-2 mb-2">
                                                      <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">{scheme.type}</span>
                                                  </div>
                                                  <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 transition-colors">{scheme.title}</h3>
                                                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{scheme.amount} • {scheme.slots} Slots Available</p>
                                              </div>
                                              <div className="text-right">
                                                  <p className="text-2xl font-black text-gray-900 dark:text-white">{scheme.slots * 12}</p>
                                                  <p className="text-xs text-gray-400 uppercase">Applicants</p>
                                              </div>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          )}
                      </div>
                  )}

                  {/* TALENT SCOUT TAB */}
                  {activeTab === 'talent' && (
                      <div className="animate-fade-in">
                          <div className="mb-8">
                               <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Direct Sponsorship Pool</h2>
                               <p className="text-gray-500 dark:text-gray-400">Verified high-potential students requiring immediate funding.</p>
                          </div>

                          <div className="grid md:grid-cols-2 gap-6">
                              {MOCK_STUDENTS.map(student => (
                                  <div key={student.id} className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all group relative overflow-hidden">
                                      <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                                      
                                      <div className="flex items-start gap-4 mb-6">
                                          <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-2xl flex items-center justify-center text-2xl font-bold text-gray-500 dark:text-gray-300 shadow-inner">
                                              {student?.name?.charAt(0) || 'S'}
                                          </div>
                                          <div>
                                              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{student.name}</h3>
                                              <div className="text-sm text-gray-500 dark:text-gray-400 space-y-0.5">
                                                  <p>{student.institution}</p>
                                                  <p className="text-emerald-600 dark:text-emerald-400 font-medium">{student.dept} • CGPA {student.cgpa}</p>
                                              </div>
                                          </div>
                                      </div>

                                      <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl mb-6">
                                          <p className="text-gray-600 dark:text-gray-300 text-sm italic">"{student.bio}"</p>
                                          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                                              <span className="text-xs font-bold text-gray-400 uppercase">Need Identified</span>
                                              <span className="text-sm font-bold text-orange-500">{student.need}</span>
                                          </div>
                                      </div>

                                      <button 
                                        onClick={() => initiateSponsorship(student)}
                                        className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 group-hover:scale-[1.02]"
                                      >
                                          Sponsor Student <ArrowRight size={16} />
                                      </button>
                                  </div>
                              ))}
                          </div>
                      </div>
                  )}

                  {/* CREATE TAB */}
                  {activeTab === 'create' && (
                      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-700 animate-fade-in">
                          <div className="mb-8 pb-8 border-b border-gray-100 dark:border-gray-700">
                              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Launch New Program</h2>
                              <p className="text-gray-500 dark:text-gray-400">Configure your scholarship or internship parameters below.</p>
                          </div>
                          
                          <form onSubmit={handleCreateSubmit} className="space-y-8">
                              <div className="space-y-4">
                                  <label className="block text-sm font-bold text-gray-900 dark:text-white">Basic Information</label>
                                  <div className="grid gap-4">
                                      <input 
                                        type="text" 
                                        required 
                                        value={scholarshipForm.title}
                                        onChange={e => setScholarshipForm({...scholarshipForm, title: e.target.value})}
                                        className="w-full px-5 py-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-emerald-500" 
                                        placeholder="Program Title (e.g. 2025 Engineering Excellence Award)"
                                      />
                                      <div className="grid md:grid-cols-2 gap-4">
                                          <select 
                                            value={scholarshipForm.type}
                                            onChange={e => setScholarshipForm({...scholarshipForm, type: e.target.value})}
                                            className="w-full px-5 py-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-emerald-500"
                                          >
                                              <option value="Scholarship">Scholarship</option>
                                              <option value="Grant">Grant</option>
                                              <option value="Internship">Internship</option>
                                          </select>
                                          <input 
                                            type="number" 
                                            min="1"
                                            value={scholarshipForm.slots}
                                            onChange={e => setScholarshipForm({...scholarshipForm, slots: parseInt(e.target.value)})}
                                            className="w-full px-5 py-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-emerald-500"
                                            placeholder="Slots"
                                          />
                                      </div>
                                  </div>
                              </div>

                              <div className="space-y-4">
                                  <label className="block text-sm font-bold text-gray-900 dark:text-white">Value & Timing</label>
                                  <div className="grid md:grid-cols-2 gap-4">
                                      <div className="relative">
                                          <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                          <input 
                                            type="text" 
                                            required 
                                            value={scholarshipForm.amount}
                                            onChange={e => setScholarshipForm({...scholarshipForm, amount: e.target.value})}
                                            className="w-full pl-12 pr-5 py-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-emerald-500" 
                                            placeholder="Value (e.g. N200,000)"
                                          />
                                      </div>
                                      <div className="relative">
                                          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                          <input 
                                            type="date" 
                                            required 
                                            value={scholarshipForm.deadline}
                                            onChange={e => setScholarshipForm({...scholarshipForm, deadline: e.target.value})}
                                            className="w-full pl-12 pr-5 py-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-emerald-500" 
                                          />
                                      </div>
                                  </div>
                              </div>

                              <div className="space-y-4">
                                  <label className="block text-sm font-bold text-gray-900 dark:text-white">Direct Application Link (Optional)</label>
                                  <div className="relative">
                                      <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                      <input 
                                        type="url" 
                                        value={scholarshipForm.link}
                                        onChange={e => setScholarshipForm({...scholarshipForm, link: e.target.value})}
                                        className="w-full pl-12 pr-5 py-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-emerald-500" 
                                        placeholder="https://yourcompany.com/apply"
                                      />
                                  </div>
                                  <p className="text-[10px] text-gray-400 mt-1 italic">Optional: Providing a direct source link ensures higher student conversion.</p>
                              </div>

                              <div className="space-y-4">
                                  <label className="block text-sm font-bold text-gray-900 dark:text-white">Criteria & Requirements</label>
                                  <textarea 
                                    required 
                                    value={scholarshipForm.criteria}
                                    onChange={e => setScholarshipForm({...scholarshipForm, criteria: e.target.value})}
                                    className="w-full px-5 py-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-emerald-500 h-32" 
                                    placeholder="Describe eligibility (e.g. CGPA > 4.5, Final Year Students)..."
                                  />
                                  
                                  {/* Document Selection */}
                                  <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
                                      <div className="flex justify-between items-center mb-4">
                                          <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Required Documents</span>
                                          <span className="text-xs text-emerald-600 font-bold">{scholarshipForm.requiredDocuments.length} Selected</span>
                                      </div>
                                      <div className="relative mb-3">
                                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                          <input 
                                            type="text" 
                                            placeholder="Search documents..." 
                                            value={docSearch}
                                            onChange={e => setDocSearch(e.target.value)}
                                            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:border-emerald-500 bg-white dark:bg-gray-800"
                                          />
                                      </div>
                                      <div className="max-h-40 overflow-y-auto space-y-2 custom-scrollbar pr-2">
                                          {filteredDocs.map((doc) => {
                                              const isSelected = scholarshipForm.requiredDocuments.includes(doc);
                                              return (
                                                  <div 
                                                    key={doc} 
                                                    onClick={() => toggleDocument(doc)}
                                                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'hover:bg-gray-200 dark:hover:bg-gray-800'}`}
                                                  >
                                                      <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-emerald-600 border-emerald-600' : 'border-gray-400 bg-white dark:bg-gray-800'}`}>
                                                          {isSelected && <Check size={14} className="text-white" />}
                                                      </div>
                                                      <span className={`text-sm ${isSelected ? 'text-emerald-900 dark:text-emerald-300 font-medium' : 'text-gray-600 dark:text-gray-400'}`}>{doc}</span>
                                                  </div>
                                              );
                                          })}
                                      </div>
                                  </div>
                              </div>

                              <div className="pt-4 flex gap-4">
                                  <button 
                                    type="button" 
                                    onClick={() => setActiveTab('overview')}
                                    className="flex-1 py-4 text-gray-600 dark:text-gray-400 font-bold hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                                  >
                                      Cancel
                                  </button>
                                  <button 
                                    type="submit" 
                                    disabled={loading}
                                    className="flex-[2] bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all"
                                  >
                                      {loading ? 'Creating...' : 'Launch Program'}
                                  </button>
                              </div>
                          </form>
                      </div>
                  )}

              </div>
              
              {/* Confirm Dialog */}
               {confirmStudent && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                      <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-3xl shadow-2xl p-8 border border-gray-100 dark:border-gray-700 text-center">
                          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600">
                              <Handshake size={32} />
                          </div>
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Confirm Sponsorship</h3>
                          <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
                              You are initiating a funding request for <span className="font-bold text-gray-900 dark:text-white">{confirmStudent.name}</span>.
                          </p>

                          <div className="flex gap-4">
                              <button 
                                  onClick={() => setConfirmStudent(null)}
                                  className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                              >
                                  Cancel
                              </button>
                              <button 
                                  onClick={finalizeSponsorship}
                                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg transition-colors"
                              >
                                  Confirm
                              </button>
                          </div>
                      </div>
                  </div>
              )}
          </div>
      </div>
  );
};

export default Sponsors;
