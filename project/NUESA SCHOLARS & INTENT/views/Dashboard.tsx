
import React, { useState, useEffect } from 'react';
import { User, SavedOpportunity } from '../types';
import { storageService } from '../services/storage';
import { Building, Calendar, DollarSign, Trash2, ExternalLink, CheckCircle, RefreshCw, FileCheck, FileWarning, AlertCircle } from 'lucide-react';

interface DashboardProps {
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [opportunities, setOpportunities] = useState<SavedOpportunity[]>([]);

  useEffect(() => {
    setOpportunities(storageService.getSavedOpportunities());
  }, []);

  const handleDelete = (id: string) => {
    const promptMsg = "This action will permanently remove this item. Continue?";
    if (window.confirm(promptMsg)) {
        if (window.confirm(promptMsg)) {
            storageService.removeOpportunity(id);
            setOpportunities(prev => prev.filter(o => o.id !== id));
        }
    }
  };

  const handleStatusChange = (id: string, newStatus: 'Applied' | 'Interested' | 'Won') => {
      storageService.updateOpportunityStatus(id, newStatus);
      setOpportunities(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
  };

  const cycleStatus = (id: string, currentStatus: 'Applied' | 'Interested' | 'Won') => {
      let nextStatus: 'Applied' | 'Interested' | 'Won' = 'Applied';
      if (currentStatus === 'Interested') nextStatus = 'Applied';
      else if (currentStatus === 'Applied') nextStatus = 'Won';
      else if (currentStatus === 'Won') nextStatus = 'Interested';
      
      handleStatusChange(id, nextStatus);
  };

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'Won': return 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 border-green-200 dark:border-green-800';
          case 'Interested': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400 border-orange-200 dark:border-orange-800';
          default: return 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-900';
      }
  };

  const renderDocStatus = (opp: SavedOpportunity) => {
      if (!opp.requiredDocuments || opp.requiredDocuments.length === 0) return null;
      
      const missingDocs = opp.requiredDocuments.filter(doc => !user.documents?.[doc]);
      const isComplete = missingDocs.length === 0;

      return (
          <div className={`mt-4 p-3 rounded-xl border flex items-center gap-3 ${isComplete ? 'bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-900/30' : 'bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/30'}`}>
              {isComplete ? (
                  <>
                    <FileCheck size={18} className="text-green-600 dark:text-green-400" />
                    <span className="text-xs font-bold text-green-700 dark:text-green-400 uppercase tracking-tight">Full File Transmitted</span>
                  </>
              ) : (
                  <>
                    <FileWarning size={18} className="text-amber-600 dark:text-amber-400" />
                    <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-tight">
                        Missing {missingDocs.length} Documents
                    </span>
                  </>
              )}
          </div>
      );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2">Student Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg">Welcome back, <span className="text-green-600 dark:text-green-400 font-bold">{user.name}</span></p>
        </div>
        
        {/* Stats */}
        <div className="flex gap-4">
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-900/30 px-6 py-4 rounded-2xl">
                <span className="block text-3xl font-black text-orange-600 dark:text-orange-400">{opportunities.length}</span>
                <span className="text-sm text-orange-800 dark:text-orange-300 font-medium">Applications Tracked</span>
            </div>
        </div>
      </div>

      {/* Content */}
      {opportunities.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 border-dashed">
            <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <ExternalLink className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Applications Yet</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">Start searching for scholarships or internships and click "Track Application" to save them here.</p>
        </div>
      ) : (
        <div className="grid gap-6">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                My Tracked Opportunities
            </h3>
            
            {opportunities.map((opp) => (
                <div key={opp.id} className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-6">
                    <div className="flex-grow">
                        <div className="flex items-center gap-3 mb-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${opp.type === 'scholarship' ? 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400 border-orange-100 dark:border-orange-900' : 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-green-100 dark:border-green-900'}`}>
                                {opp.type}
                            </span>
                            
                            <button 
                                onClick={() => cycleStatus(opp.id, opp.status)}
                                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-all ${getStatusColor(opp.status)}`}
                                title="Click to cycle status: Interested -> Applied -> Won"
                            >
                                {opp.status}
                                <RefreshCw size={10} className="opacity-70" />
                            </button>
                        </div>
                        <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{opp.title}</h4>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                             <div className="flex items-center gap-1">
                                <Building size={14} />
                                <span>{opp.Provider || 'Unknown Provider'}</span>
                            </div>
                            {opp.Amount && (
                                <div className="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
                                    <DollarSign size={14} />
                                    <span>{opp.Amount}</span>
                                </div>
                            )}
                             {opp.Deadline && (
                                <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400 font-medium">
                                    <Calendar size={14} />
                                    <span>Deadline: {opp.Deadline}</span>
                                </div>
                            )}
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">{opp.Summary}</p>
                        
                        {renderDocStatus(opp)}
                    </div>
                    
                    <div className="flex md:flex-col justify-between items-end gap-3 min-w-[140px]">
                        <p className="text-xs text-gray-400 hidden md:block">Saved: {new Date(opp.dateSaved).toLocaleDateString()}</p>
                         <div className="flex gap-2 w-full md:w-auto">
                             <button 
                                onClick={() => handleDelete(opp.id)}
                                className="flex-1 md:flex-none flex items-center justify-center p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title="Remove"
                            >
                                <Trash2 size={18} />
                            </button>
                             <a 
                                href={opp.Link && opp.Link !== '#' ? opp.Link : `https://www.google.com/search?q=${encodeURIComponent(opp.title + ' ' + (opp.Provider || ''))}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-gray-900 dark:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors text-sm"
                            >
                                <span>Continue</span>
                                <ExternalLink size={14} />
                            </a>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
