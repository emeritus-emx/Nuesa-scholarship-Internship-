
import React, { useState, useEffect, useMemo } from 'react';
import { User } from '../types';
import { storageService } from '../services/storage';
import { apiService } from '../services/apiService';
import { 
  ArrowRight, 
  ShieldCheck, 
  Mail, 
  Timer, 
  Edit2, 
  Info, 
  KeyRound, 
  X, 
  FileText, 
  Shield, 
  Cookie, 
  Scale, 
  User as UserIcon, 
  Lock, 
  Sparkles,
  ArrowLeft,
  Check,
  AlertTriangle,
  Fingerprint,
  Eye,
  EyeOff
} from 'lucide-react';
import Logo from '../components/Logo';

interface AuthProps {
  onLogin: (user: User) => void;
}

const PasswordStrength: React.FC<{ password: string }> = ({ password }) => {
    const strength = useMemo(() => {
        if (!password) return 0;
        let s = 0;
        if (password.length > 7) s += 25;
        if (/[A-Z]/.test(password)) s += 25;
        if (/[0-9]/.test(password)) s += 25;
        if (/[^A-Za-z0-9]/.test(password)) s += 25;
        return s;
    }, [password]);

    const colorClass = strength <= 25 ? 'bg-red-500' : strength <= 50 ? 'bg-orange-500' : strength <= 75 ? 'bg-yellow-500' : 'bg-green-500';
    const label = strength <= 25 ? 'Weak' : strength <= 50 ? 'Fair' : strength <= 75 ? 'Good' : 'Very Strong';

    return (
        <div className="mt-2 space-y-1">
            <div className="flex justify-between items-center px-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Entropy Score: {strength}%</span>
                <span className={`text-[10px] font-black uppercase tracking-wider ${colorClass.replace('bg-', 'text-')}`}>{label}</span>
            </div>
            <div className="h-1 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div className={`h-full transition-all duration-500 ${colorClass}`} style={{ width: `${strength}%` }}></div>
            </div>
        </div>
    );
};

const PolicyModal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  title: string; 
  content: React.ReactNode 
}> = ({ isOpen, onClose, title, content }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 relative flex flex-col max-h-[85vh]">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            {title.includes('Privacy') ? <Shield className="text-green-500" /> : title.includes('Cookie') ? <Cookie className="text-amber-600" /> : <Scale className="text-orange-500" />}
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
            className="px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-bold hover:opacity-90 transition-opacity shadow-lg"
          >
            I Accept
          </button>
        </div>
      </div>
    </div>
  );
};

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isBlankedOut, setIsBlankedOut] = useState(false);
  const [regStep, setRegStep] = useState(1); // 1: Info, 2: Security & Policies, 3: OTP
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Agreement State
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [agreedToCookies, setAgreedToCookies] = useState(false);
  const [showPolicy, setShowPolicy] = useState<'terms' | 'privacy' | 'cookies' | null>(null);

  // Verification State
  const [otp, setOtp] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    let interval: any;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
    
    if (isBlankedOut) {
        if (!email) {
            alert("Please enter your email address to recover your account.");
            return;
        }
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            alert(`Recovery instructions have been sent to ${email}. Check your inbox!`);
            setIsBlankedOut(false);
            setIsLogin(true);
        }, 1500);
        return;
    }

    if (isLogin) {
        setLoading(true);
        try {
            // Call backend API for authentication
            const data = await apiService.login(email, password);
            // apiService stores access token in localStorage; now create local user entry
            const user = storageService.login(email, name || email.split('@')[0]);
            onLogin(user);
        } catch (err: any) {
            // On failure, ensure any existing token is cleared and present useful message
            apiService.logout();
            storageService.purgeAllData();
            alert(err?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
        return;
    }

    // Registration Steps
    if (regStep === 1) {
        if (!email || !name) {
            alert("Please provide your name and email.");
            return;
        }
        setRegStep(2);
        return;
    }

    if (regStep === 2) {
        // Validate password strength: min 8 chars, uppercase, digit, special char
        if (!password || password.length < 8) {
            alert("Please set a secure password (min 8 characters).");
            return;
        }
        if (!/[A-Z]/.test(password)) {
            alert("Password must contain at least one uppercase letter.");
            return;
        }
        if (!/[0-9]/.test(password)) {
            alert("Password must contain at least one digit.");
            return;
        }
        if (!/[!@#$%^&*]/.test(password)) {
            alert("Password must contain at least one special character (!@#$%^&*).");
            return;
        }
        if (!agreedToTerms || !agreedToPrivacy || !agreedToCookies) {
            alert("Please review and accept all student policies to continue.");
            return;
        }
        
        setLoading(true);
        // Call backend registration API
        apiService.register(name, email, password)
            .then(() => {
                setLoading(false);
                setRegStep(3);
                setResendTimer(30);
            })
            .catch((err: any) => {
                setLoading(false);
                const errorMsg = err?.message || 'Registration failed';
                // Handle duplicate email error
                if (errorMsg.includes('already registered') || errorMsg.includes('409')) {
                    alert("This email is already registered. Please log in or use a different email.");
                } else {
                    alert(errorMsg);
                }
            });
        return;
    }

    if (regStep === 3) {
        if (otp !== '123456') {
            alert("Invalid verification code. Try 123456.");
            return;
        }
        setLoading(true);
        // After OTP verification, log in the user
        apiService.login(email, password)
            .then(() => {
                const user = storageService.login(email, name);
                onLogin(user);
                setLoading(false);
            })
            .catch((err: any) => {
                setLoading(false);
                alert(err?.message || 'Login after registration failed. Please log in manually.');
            });
    }
  };

  const toggleMode = () => {
      setIsLogin(!isLogin);
      setRegStep(1);
      setIsBlankedOut(false);
      setOtp('');
      setAgreedToTerms(false);
      setAgreedToPrivacy(false);
      setAgreedToCookies(false);
  };

  const termsContent = (
    <div className="space-y-4">
      <h4 className="font-bold text-gray-900 dark:text-white">Student Terms of Service</h4>
      <p>By using NUESA SCHOLAS, you agree to provide authentic academic data. You understand that the platform uses AI to help you find opportunities, and you must verify all specific details with the original provider.</p>
      <h4 className="font-bold text-gray-900 dark:text-white">Eligibility</h4>
      <p>This service is intended for active students in recognized tertiary institutions. You must maintain a passing grade to remain eligible for certain sponsored programs.</p>
    </div>
  );

  const privacyContent = (
    <div className="space-y-4">
      <h4 className="font-bold text-gray-900 dark:text-white">Student Data Privacy</h4>
      <p>We collect your CGPA, institution, and department to suggest relevant scholarships. We only share this data with a Sponsor when you click "Apply" on their specific listing.</p>
      <h4 className="font-bold text-gray-900 dark:text-white">GDPR & NDPR Compliance</h4>
      <p>You have the right to request deletion of your academic profile at any time through the settings menu.</p>
    </div>
  );

  const cookiesContent = (
    <div className="space-y-4">
      <h4 className="font-bold text-gray-900 dark:text-white">Student Experience Cookies</h4>
      <p>We use cookies to keep you logged in to your dashboard and to remember which scholarships you've already viewed or tracked.</p>
    </div>
  );

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-white dark:bg-gray-950 px-4 py-20 transition-colors overflow-hidden">
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-orange-100/40 dark:bg-orange-900/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-green-100/40 dark:bg-green-900/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-5xl w-full grid md:grid-cols-2 bg-white dark:bg-gray-900 rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 relative z-10 animate-scale-in">
        
        <div className="relative p-12 bg-gradient-to-br from-green-700 to-green-950 text-white flex flex-col justify-between overflow-hidden">
             <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')] mix-blend-overlay"></div>
             
             <div className="relative z-10">
                <div className="flex items-center gap-3 mb-12">
                    <Logo size={48} id="auth-logo" />
                    <div>
                         <h1 className="text-2xl font-black tracking-tight">NUESA <span className="text-orange-400">SCHOLAS</span></h1>
                         <p className="text-[10px] text-green-200 font-bold uppercase tracking-widest">Secure Student Portal</p>
                    </div>
                </div>

                <div className="space-y-8">
                    <h2 className="text-4xl md:text-5xl font-black leading-tight tracking-tight">
                        Your scholarship journey <span className="text-orange-400">is secured.</span>
                    </h2>
                    <p className="text-green-100/80 text-lg leading-relaxed font-light max-w-sm">
                        Enterprise-grade encryption protecting your academic identity since day one.
                    </p>
                    
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-sm">
                            <div className="p-2 bg-orange-500/20 rounded-lg text-orange-400">
                                <Fingerprint size={20} />
                            </div>
                            <span className="text-sm font-medium">Biometric Sync Capability</span>
                        </div>
                        <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-sm">
                            <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                                <ShieldCheck size={20} />
                            </div>
                            <span className="text-sm font-medium">Verified Partner Vault</span>
                        </div>
                    </div>
                </div>
             </div>

             <div className="relative z-10 pt-12 flex items-center justify-between border-t border-white/10">
                <p className="text-xs text-green-200/50">© {new Date().getFullYear()} NUESA INTEL UNIT</p>
                <div className="flex gap-4">
                    <Shield size={16} className="text-green-400" />
                    <Lock size={16} className="text-green-400" />
                </div>
             </div>
        </div>

        <div className="p-8 md:p-14 bg-white dark:bg-gray-900 overflow-y-auto max-h-[90vh] custom-scrollbar">
          <div className="mb-10 flex justify-between items-center">
             <div>
                <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
                    {isBlankedOut ? 'Recover Identity' : (isLogin ? 'Safe Entry' : 'Enroll Now')}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                    {isLogin 
                        ? "Authentication required to access node." 
                        : regStep === 1 
                            ? "Identity establishment" 
                            : regStep === 2 
                                ? "Security & Compliance"
                                : "Broadcast Verification"}
                </p>
             </div>
             {!isLogin && !isBlankedOut && regStep > 1 && (
                 <button 
                    onClick={() => setRegStep(prev => prev - 1)}
                    className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
             )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {isBlankedOut && (
                <div className="animate-fade-in space-y-6">
                    <div className="p-4 bg-orange-50 dark:bg-orange-900/10 rounded-2xl text-sm text-orange-800 dark:text-orange-300 border border-orange-100 dark:border-orange-900/20">
                        Enter your registered email to initiate an identity recovery sequence.
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Academic Email</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" size={20} />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                                placeholder="student@university.edu"
                            />
                        </div>
                    </div>
                </div>
            )}

            {isLogin && !isBlankedOut && (
                <div className="animate-fade-in space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Email Identifier</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" size={20} />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                                placeholder="student@university.edu"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center ml-1">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Key Sequence</label>
                            <button type="button" onClick={() => setIsBlankedOut(true)} className="text-xs font-bold text-orange-500 hover:text-orange-600">Lost Access?</button>
                        </div>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" size={20} />
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-12 pr-12 py-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>
                    
                    <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 flex items-center gap-3">
                        <ShieldCheck className="text-emerald-500" size={18} />
                        <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest">SSL Secure Layer Active</span>
                    </div>
                </div>
            )}

            {!isLogin && !isBlankedOut && (
                <div className="animate-fade-in space-y-6">
                    <div className="flex gap-2 mb-8">
                        {[1, 2, 3].map(step => (
                            <div key={step} className={`h-1.5 rounded-full transition-all duration-300 ${regStep === step ? 'w-10 bg-green-600' : 'w-4 bg-gray-200 dark:bg-gray-800'}`}></div>
                        ))}
                    </div>

                    {regStep === 1 && (
                        <div className="space-y-6 animate-slide-in-right">
                             <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Legal Name</label>
                                <div className="relative group">
                                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors" size={20} />
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-600 outline-none transition-all"
                                        placeholder="Full Name as per ID"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Academic Email</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors" size={20} />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-600 outline-none transition-all"
                                        placeholder="student@university.edu"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {regStep === 2 && (
                        <div className="space-y-6 animate-slide-in-right">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Secure Key Sequence</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors" size={20} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-12 pr-12 py-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-600 outline-none transition-all"
                                        placeholder="Entropy recommended"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                                <PasswordStrength password={password} />
                            </div>

                            <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Integrity Framework Agreements</p>
                                
                                <div 
                                    onClick={() => setAgreedToTerms(!agreedToTerms)}
                                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 ${agreedToTerms ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800' : 'bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700 hover:border-green-200'}`}
                                >
                                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${agreedToTerms ? 'bg-green-600 text-white' : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600'}`}>
                                        {agreedToTerms && <Check size={14} strokeWidth={4} />}
                                    </div>
                                    <span className="flex-1 text-xs text-gray-600 dark:text-gray-400 font-bold uppercase tracking-tighter">
                                        I accept <button type="button" onClick={(e) => { e.stopPropagation(); setShowPolicy('terms'); }} className="text-green-600 font-black hover:underline">Terms of Service</button>
                                    </span>
                                </div>

                                <div 
                                    onClick={() => setAgreedToPrivacy(!agreedToPrivacy)}
                                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 ${agreedToPrivacy ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800' : 'bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700 hover:border-green-200'}`}
                                >
                                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${agreedToPrivacy ? 'bg-green-600 text-white' : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600'}`}>
                                        {agreedToPrivacy && <Check size={14} strokeWidth={4} />}
                                    </div>
                                    <span className="flex-1 text-xs text-gray-600 dark:text-gray-400 font-bold uppercase tracking-tighter">
                                        Consent to <button type="button" onClick={(e) => { e.stopPropagation(); setShowPolicy('privacy'); }} className="text-green-600 font-black hover:underline">Privacy Policy</button>
                                    </span>
                                </div>

                                <div 
                                    onClick={() => setAgreedToCookies(!agreedToCookies)}
                                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 ${agreedToCookies ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800' : 'bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700 hover:border-green-200'}`}
                                >
                                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${agreedToCookies ? 'bg-green-600 text-white' : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600'}`}>
                                        {agreedToCookies && <Check size={14} strokeWidth={4} />}
                                    </div>
                                    <span className="flex-1 text-xs text-gray-600 dark:text-gray-400 font-bold uppercase tracking-tighter">
                                        Accept <button type="button" onClick={(e) => { e.stopPropagation(); setShowPolicy('cookies'); }} className="text-green-600 font-black hover:underline">Cookies Policy</button>
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {regStep === 3 && (
                        <div className="space-y-6 animate-slide-in-right">
                            <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-[2rem] border border-blue-100 dark:border-blue-800 text-center">
                                <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                                    <Mail className="text-blue-600" size={32} />
                                </div>
                                <h4 className="font-bold text-gray-900 dark:text-white mb-1">Verify Node Access</h4>
                                <p className="text-xs text-gray-500 mb-4">OTP broadcasted to <b>{email}</b></p>
                                
                                <div className="p-2 bg-white dark:bg-gray-800 rounded-xl inline-block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">
                                    Auth Code: <span className="text-green-600">123456</span>
                                </div>

                                <div className="flex justify-center">
                                    <input
                                        type="text"
                                        required
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                                        className="w-full max-w-[240px] px-4 py-4 text-center text-4xl font-black tracking-[0.3em] rounded-2xl border-2 border-blue-100 dark:border-blue-900 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-blue-600 outline-none transition-all"
                                        placeholder="000000"
                                        autoFocus
                                    />
                                </div>
                                
                                <div className="mt-6">
                                    <button type="button" onClick={() => setResendTimer(30)} disabled={resendTimer > 0} className={`text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 mx-auto ${resendTimer > 0 ? 'text-gray-400' : 'text-blue-600 hover:text-blue-700'}`}>
                                        {resendTimer > 0 ? <><Timer size={14} /> Resend in {resendTimer}s</> : 'Request New Code'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-5 rounded-[1.5rem] font-bold transition-all flex items-center justify-center gap-3 group shadow-xl ${
                  isLogin 
                    ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/20' 
                    : 'bg-green-600 hover:bg-green-700 text-white shadow-green-600/20'
              } ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                  <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span className="text-lg">
                      {isBlankedOut ? 'Recover Access' : (isLogin ? 'Enter Node' : (regStep === 1 ? 'Verify Identity' : regStep === 2 ? 'Establish Key' : 'Finalize Enrollment'))}
                  </span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 text-center">
             <button 
                onClick={toggleMode} 
                className="text-gray-500 dark:text-gray-400 font-medium hover:text-gray-900 dark:hover:text-white transition-colors"
             >
                {isLogin ? "No academic node? " : "Already verified? "}
                <span className={`font-black ${isLogin ? 'text-green-600' : 'text-orange-500'}`}>
                    {isLogin ? 'Establish new node' : 'Enter existing node'}
                </span>
             </button>
          </div>
        </div>
      </div>

      <PolicyModal 
        isOpen={showPolicy === 'terms'} 
        onClose={() => setShowPolicy(null)} 
        title="Student Terms & Conditions" 
        content={termsContent} 
      />
      <PolicyModal 
        isOpen={showPolicy === 'privacy'} 
        onClose={() => setShowPolicy(null)} 
        title="Student Privacy Policy" 
        content={privacyContent} 
      />
      <PolicyModal 
        isOpen={showPolicy === 'cookies'} 
        onClose={() => setShowPolicy(null)} 
        title="Student Cookies Policy" 
        content={cookiesContent} 
      />
    </div>
  );
};

export default Auth;
