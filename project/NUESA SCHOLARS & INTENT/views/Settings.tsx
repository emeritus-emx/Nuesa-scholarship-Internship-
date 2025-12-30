
import React, { useState, useEffect, useMemo } from 'react';
import { User, ActivityLog } from '../types';
import { 
    Bell, Lock, Smartphone, Globe, Moon, Sun, Monitor, LogOut, 
    ChevronRight, ToggleRight, ToggleLeft, Shield, Mail, Trash2, 
    Key, CheckCircle, MailWarning, Timer, ShieldCheck, Activity,
    History, AlertTriangle, Fingerprint, Database, EyeOff, ShieldAlert
} from 'lucide-react';
import { storageService } from '../services/storage';

interface SettingsProps {
  user: User;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  onLogout: () => void;
  reduceMotion: boolean;
  toggleReduceMotion: () => void;
  highContrast: boolean;
  toggleHighContrast: () => void;
}

const Settings: React.FC<SettingsProps> = ({ 
  user, 
  theme, 
  toggleTheme, 
  onLogout,
  reduceMotion,
  toggleReduceMotion,
  highContrast,
  toggleHighContrast
}) => {
  const [activeTab, setActiveTab] = useState<'notifications' | 'security' | 'display' | 'general' | 'logs'>('notifications');
  const [notifications, setNotifications] = useState({
      email: true,
      push: true,
      newsletters: false,
      sponsorshipAlerts: true
  });
  const [twoFactor, setTwoFactor] = useState(false);
  const [securityLogs, setSecurityLogs] = useState<ActivityLog[]>([]);
  
  // Password Change State
  const [passwordForm, setPasswordForm] = useState({ new: '', confirm: '', otp: '' });
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [pwMessage, setPwMessage] = useState({ text: '', type: 'error' as 'error' | 'success' });

  useEffect(() => {
    let interval: any;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  useEffect(() => {
      setSecurityLogs(storageService.getSecurityLogs());
  }, [activeTab]);

  const handleNotificationToggle = (key: keyof typeof notifications) => {
      setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
      storageService.addSecurityLog('Settings', `Notification ${key} toggled`);
  };

  const handleRequestOtp = (e: React.MouseEvent) => {
      e.preventDefault();
      if (!passwordForm.new || passwordForm.new.length < 8) {
          setPwMessage({ text: 'New password must be at least 8 characters.', type: 'error' });
          return;
      }
      if (passwordForm.new !== passwordForm.confirm) {
          setPwMessage({ text: 'Passwords do not match.', type: 'error' });
          return;
      }

      setIsOtpSent(true);
      setResendTimer(60);
      setPwMessage({ text: `A 6-digit verification code has been sent to ${user.email}`, type: 'success' });
      storageService.addSecurityLog('Security', 'Password change request initiated', 'warning');
  };

  const handlePasswordUpdate = (e: React.FormEvent) => {
      e.preventDefault();
      if (!passwordForm.otp || passwordForm.otp.length !== 6) {
          setPwMessage({ text: 'Please enter a valid 6-digit OTP.', type: 'error' });
          return;
      }
      
      if (passwordForm.otp !== '123456') {
          setPwMessage({ text: 'Invalid verification code. Use demo code: 123456', type: 'error' });
          storageService.addSecurityLog('Security', 'Failed password change: Invalid OTP', 'error');
          return;
      }

      setPwMessage({ text: 'Password successfully updated!', type: 'success' });
      storageService.addSecurityLog('Security', 'Password updated successfully', 'success');
      setTimeout(() => {
          setPasswordForm({ new: '', confirm: '', otp: '' });
          setIsOtpSent(false);
          setPwMessage({ text: '', type: 'success' });
      }, 3000);
  };

  const handlePurge = () => {
      const promptMsg = "This action will permanently remove this item. Continue?";
      if (window.confirm(promptMsg)) {
          if (window.confirm(promptMsg)) {
              storageService.purgeAllData();
              onLogout();
          }
      }
  };

  const menuItems = [
      { id: 'notifications', label: 'Alert Center', icon: Bell, desc: 'Signals & Communications' },
      { id: 'security', label: 'Hardening', icon: Lock, desc: 'Account Defense' },
      { id: 'logs', label: 'Audit Logs', icon: History, desc: 'Transaction History' },
      { id: 'display', label: 'Appearance', icon: Monitor, desc: 'Theme & UX' },
      { id: 'general', label: 'Region', icon: Globe, desc: 'Location Data' },
  ];

  const Toggle = ({ active, onChange }: { active: boolean, onChange: () => void }) => (
      <button onClick={onChange} className={`transition-colors duration-200 ${active ? 'text-green-600 dark:text-green-400' : 'text-gray-300 dark:text-gray-600'}`}>
          {active ? <ToggleRight size={40} className="fill-current" /> : <ToggleLeft size={40} />}
      </button>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 animate-fade-in font-sans">
        <div className="mb-8 flex justify-between items-end">
            <div>
                <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">System Config</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-wider">Node: {user.email} • ID: {crypto.randomUUID().slice(0, 8)}</p>
            </div>
            <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-xl border border-emerald-100 dark:border-emerald-800">
                <ShieldCheck className="text-emerald-600" size={16} />
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Security Score: {user.securityScore}%</span>
            </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-64 space-y-2">
                {menuItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id as any)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                            activeTab === item.id 
                                ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 font-bold' 
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                    >
                        <item.icon size={20} />
                        <div>
                            <span className="block text-sm font-black uppercase tracking-tighter">{item.label}</span>
                            <span className="block text-[9px] opacity-70 font-bold uppercase tracking-widest">{item.desc}</span>
                        </div>
                    </button>
                ))}
                
                <div className="pt-6 mt-6 border-t border-gray-100 dark:border-gray-800">
                     <button
                        onClick={onLogout}
                        className="w-full flex items-center gap-3 p-3 rounded-xl text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all font-black uppercase tracking-widest text-xs"
                    >
                        <LogOut size={20} />
                        <span>Sign Out Node</span>
                    </button>
                </div>
            </div>

            <div className="flex-1 bg-white dark:bg-gray-900 rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-800">
                
                {activeTab === 'notifications' && (
                    <div className="space-y-8 animate-fade-in">
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                            <Bell className="text-orange-500" /> Signal Router
                        </h2>
                        
                        <div className="space-y-4">
                            {[
                                { key: 'email', label: 'Mail Relay', icon: Mail, desc: 'End-to-end encrypted academic updates' },
                                { key: 'push', label: 'Push Broadcast', icon: Smartphone, desc: 'Real-time OS-level signals' },
                                { key: 'sponsorshipAlerts', label: 'Scholarship Tracker', icon: Shield, desc: 'Alerts for verified funding matches' }
                            ].map(n => (
                                <div key={n.key} className="flex items-center justify-between p-5 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-white dark:bg-gray-800 rounded-xl text-orange-500 shadow-sm">
                                            <n.icon size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-gray-900 dark:text-white text-sm uppercase tracking-tight">{n.label}</h3>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">{n.desc}</p>
                                        </div>
                                    </div>
                                    <Toggle active={(notifications as any)[n.key]} onChange={() => handleNotificationToggle(n.key as any)} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'security' && (
                    <div className="space-y-8 animate-fade-in">
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                            <Lock className="text-emerald-500" /> Account Defense
                        </h2>

                        <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                             <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-tight">Multi-Factor Authentication</h3>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Biometric or OTP secondary verification</p>
                                </div>
                                <Toggle active={twoFactor} onChange={() => {
                                    setTwoFactor(!twoFactor);
                                    storageService.addSecurityLog('Security', `2FA ${!twoFactor ? 'Enabled' : 'Disabled'}`, !twoFactor ? 'success' : 'warning');
                                }} />
                             </div>
                             {twoFactor && (
                                 <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg text-[10px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                                     <CheckCircle size={14} /> Shield Status: Maximum
                                 </div>
                             )}
                        </div>

                        <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
                            <h3 className="font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2 uppercase tracking-tight text-sm">
                                <Key size={18} /> Update Access Sequence
                            </h3>
                            
                            <form onSubmit={handlePasswordUpdate} className="space-y-4 max-w-md">
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">New Sequence</label>
                                        <input 
                                            type="password" 
                                            required
                                            disabled={isOtpSent}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-orange-500 outline-none transition-all disabled:opacity-50 font-bold"
                                            placeholder="••••••••"
                                            value={passwordForm.new}
                                            onChange={e => setPasswordForm({...passwordForm, new: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Repeat Sequence</label>
                                        <input 
                                            type="password" 
                                            required
                                            disabled={isOtpSent}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-orange-500 outline-none transition-all disabled:opacity-50 font-bold"
                                            placeholder="••••••••"
                                            value={passwordForm.confirm}
                                            onChange={e => setPasswordForm({...passwordForm, confirm: e.target.value})}
                                        />
                                    </div>
                                </div>

                                {isOtpSent ? (
                                    <div className="space-y-4 animate-fade-in bg-orange-50 dark:bg-orange-900/10 p-6 rounded-2xl border border-orange-100 dark:border-orange-900/20">
                                        <div className="flex items-center gap-3 mb-2 text-orange-800 dark:text-orange-300">
                                            <ShieldCheck size={20} />
                                            <span className="font-black uppercase tracking-tighter text-sm">Identity Confirmation</span>
                                        </div>
                                        <div>
                                            <input 
                                                type="text" 
                                                required
                                                maxLength={6}
                                                className="w-full px-4 py-4 text-center text-3xl font-black tracking-[0.5em] rounded-xl border-2 border-orange-200 dark:border-orange-800 bg-white dark:bg-gray-950 focus:border-orange-500 outline-none transition-all"
                                                placeholder="000000"
                                                value={passwordForm.otp}
                                                onChange={e => setPasswordForm({...passwordForm, otp: e.target.value.replace(/[^0-9]/g, '')})}
                                                autoFocus
                                            />
                                        </div>
                                        <button 
                                            type="submit" 
                                            className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-black shadow-lg shadow-orange-500/20 transition-all uppercase tracking-widest text-xs"
                                        >
                                            Confirm Sequence Update
                                        </button>
                                    </div>
                                ) : (
                                    <button 
                                        type="button" 
                                        onClick={handleRequestOtp}
                                        className="w-full py-4 bg-gray-900 dark:bg-gray-700 text-white rounded-xl hover:bg-gray-800 dark:hover:bg-gray-600 transition-all font-black flex items-center justify-center gap-2 shadow-xl uppercase tracking-widest text-xs"
                                    >
                                        <ShieldAlert size={18} />
                                        Request Authentication Code
                                    </button>
                                )}

                                {pwMessage.text && (
                                    <div className={`p-4 rounded-xl text-[10px] font-black uppercase tracking-widest border flex items-start gap-3 animate-fade-in ${pwMessage.type === 'success' ? 'bg-green-50 border-green-100 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300' : 'bg-red-50 border-red-100 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-green-300'}`}>
                                        {pwMessage.type === 'success' ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
                                        <p>{pwMessage.text}</p>
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                )}

                {activeTab === 'logs' && (
                    <div className="space-y-8 animate-fade-in">
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                            <History className="text-orange-500" /> Security Logs
                        </h2>
                        
                        <div className="space-y-3">
                            {securityLogs.length === 0 ? (
                                <div className="text-center py-20 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                                    <Activity className="mx-auto text-gray-300 mb-2" size={32} />
                                    <p className="text-xs text-gray-400 font-bold uppercase">No recent audit trails.</p>
                                </div>
                            ) : (
                                securityLogs.map(log => (
                                    <div key={log.id} className="p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-800 rounded-xl flex items-center justify-between hover:border-emerald-500/30 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-2 h-2 rounded-full ${log.status === 'success' ? 'bg-emerald-500' : log.status === 'warning' ? 'bg-amber-500' : 'bg-red-500'}`}></div>
                                            <div>
                                                <p className="text-sm font-black text-gray-900 dark:text-white tracking-tight">{log.action}</p>
                                                <div className="flex items-center gap-4 mt-1">
                                                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{log.ip}</span>
                                                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-[9px] font-black text-gray-300 dark:text-gray-700 uppercase tracking-widest">{log.device.split(' ')[0]}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'display' && (
                    <div className="space-y-8 animate-fade-in">
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                            <Monitor className="text-orange-500" /> Visual Engine
                        </h2>

                        <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                             <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-tight text-sm mb-4">Rendering Theme</h3>
                             <div className="grid grid-cols-2 gap-4 max-w-md">
                                 <button 
                                    onClick={() => theme === 'dark' && toggleTheme()}
                                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${theme === 'light' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'}`}
                                 >
                                     <Sun size={32} className={theme === 'light' ? 'text-orange-600' : 'text-gray-400'} />
                                     <span className="font-black uppercase tracking-widest text-[10px]">Luminous Mode</span>
                                 </button>

                                 <button 
                                    onClick={() => theme === 'light' && toggleTheme()}
                                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${theme === 'dark' ? 'border-blue-500 bg-gray-800' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'}`}
                                 >
                                     <Moon size={32} className={theme === 'dark' ? 'text-blue-400' : 'text-gray-400'} />
                                     <span className="font-black uppercase tracking-widest text-[10px]">Shadow Node</span>
                                 </button>
                             </div>
                        </div>

                        <div>
                            <h3 className="font-black text-gray-900 dark:text-white mb-4 uppercase tracking-tight text-sm">Accessibility Layers</h3>
                            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
                                <span className="text-xs font-bold uppercase tracking-wider">Reduce Motion Rendering</span>
                                <Toggle active={reduceMotion} onChange={toggleReduceMotion} />
                            </div>
                            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
                                <span className="text-xs font-bold uppercase tracking-wider">High Contrast Matrix</span>
                                <Toggle active={highContrast} onChange={toggleHighContrast} />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'general' && (
                    <div className="space-y-8 animate-fade-in">
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                            <Globe className="text-orange-500" /> Platform General
                        </h2>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Interface Dialect</label>
                                <select className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 outline-none font-bold text-sm">
                                    <option>English (Global Intelligence)</option>
                                    <option>French (Regional Sync)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Temporal Node</label>
                                <select className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 outline-none font-bold text-sm">
                                    <option>Lagos (WAT) Node</option>
                                    <option>GMT Baseline</option>
                                </select>
                            </div>
                        </div>

                        <div className="pt-8 mt-8 border-t border-gray-100 dark:border-gray-800">
                            <h3 className="text-red-600 font-black mb-4 flex items-center gap-2 uppercase tracking-tight text-sm">
                                <Database size={18} /> Memory Purge Zone
                            </h3>
                            <div className="p-5 border border-red-200 bg-red-50 dark:bg-red-900/10 rounded-2xl flex justify-between items-center">
                                <div className="max-w-md">
                                    <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-tight">Identity Erasure</h4>
                                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1">Permanently remove your academic footprint and application history from this node.</p>
                                </div>
                                <button onClick={handlePurge} className="px-5 py-3 bg-white dark:bg-gray-800 border border-red-200 dark:border-red-900 text-red-600 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/40 font-black uppercase tracking-widest text-[10px] transition-all shadow-sm">
                                    Purge Node
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    </div>
  );
};

export default Settings;
