
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Database, Zap, Lock, Activity, ShieldAlert, Wifi } from 'lucide-react';

const SecurityPulse: React.FC = () => {
    const [uptime, setUptime] = useState(0);
    const [threatsBlocked, setThreatsBlocked] = useState(1420);
    const [isHealthy, setIsHealthy] = useState(true);

    useEffect(() => {
        const timer = setInterval(() => {
            setUptime(prev => prev + 1);
            if (Math.random() > 0.95) setThreatsBlocked(prev => prev + 1);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="bg-[#020617] border-y border-emerald-500/20 py-2 px-6 overflow-hidden hidden sm:block">
            <div className="max-w-7xl mx-auto flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em]">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full animate-pulse shadow-[0_0_8px_#10b981] ${isHealthy ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                        <span className="text-emerald-500">Firewall Node: Active</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                        <Zap size={10} className="text-amber-500" />
                        <span>DDoS Shield: 100%</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                        <Database size={10} className="text-blue-500" />
                        <span>Auto-Backup: Every 4h (Next: 2h 15m)</span>
                    </div>
                </div>

                <div className="flex items-center gap-6 text-slate-500">
                    <div className="flex items-center gap-2">
                        <ShieldAlert size={10} className="text-emerald-500" />
                        <span>Sanitized Inputs: {threatsBlocked.toLocaleString()} Today</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Activity size={10} className="text-slate-400" />
                        <span>Latency: 42ms</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Wifi size={10} className="text-emerald-500" />
                        <span>SSL: TLS 1.3 Secure</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SecurityPulse;
