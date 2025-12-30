
import React, { useState } from 'react';
import { AppNotification, User } from '../types';
import { Bell, Check, Trash2, Calendar, Info, Briefcase, GraduationCap, DollarSign, Shield, Filter, Search, CheckCircle2, Users, Handshake, ExternalLink } from 'lucide-react';

interface NotificationsProps {
  notifications: AppNotification[];
  user: User | null;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}

const Notifications: React.FC<NotificationsProps> = ({ notifications, user, onMarkRead, onMarkAllRead }) => {
  const isSponsor = user?.role === 'sponsor';
  const [activeCategory, setActiveCategory] = useState<'student' | 'partner'>(isSponsor ? 'partner' : 'student');
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const studentTypes = ['scholarship', 'internship', 'bursary'];
  const partnerTypes = ['grant', 'system'];

  // Filter notifications logic
  const filteredNotifications = notifications.filter(n => {
    // 1. Filter by Category Tab
    if (activeCategory === 'student' && !studentTypes.includes(n.type)) return false;
    if (activeCategory === 'partner' && !partnerTypes.includes(n.type)) return false;

    // 2. Filter by Read Status
    if (filter === 'unread' && n.read) return false;
    
    return true;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'scholarship': return <GraduationCap size={20} />;
      case 'internship': return <Briefcase size={20} />;
      case 'bursary': return <DollarSign size={20} />;
      case 'grant': return <Handshake size={20} />;
      case 'system': return <Shield size={20} />;
      default: return <Bell size={20} />;
    }
  };

  const getColorClass = (type: string) => {
    switch (type) {
      case 'scholarship': return 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400';
      case 'internship': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
      case 'bursary': return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400';
      case 'grant': return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
      case 'system': return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const counts = {
      student: notifications.filter(n => studentTypes.includes(n.type) && (!n.read || filter === 'all')).length,
      partner: notifications.filter(n => partnerTypes.includes(n.type) && (!n.read || filter === 'all')).length
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4 border-b border-gray-100 dark:border-gray-800 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-3 rounded-2xl ${isSponsor ? 'bg-green-600 text-white' : 'bg-orange-500 text-white'}`}>
               <Bell size={24} />
            </div>
            <div>
                 <h1 className="text-3xl font-black text-gray-900 dark:text-white">
                    Notifications
                 </h1>
                 <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                    Stay updated on your applications, scholarships, and system alerts.
                 </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                <button 
                    onClick={() => setFilter('all')}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === 'all' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                >
                    All
                </button>
                <button 
                    onClick={() => setFilter('unread')}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === 'unread' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                >
                    Unread
                </button>
            </div>
            
            {notifications.some(n => !n.read) && (
                <button 
                    onClick={onMarkAllRead}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 dark:bg-gray-700 text-white rounded-xl text-sm font-bold hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors"
                >
                    <CheckCircle2 size={16} /> Mark all read
                </button>
            )}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-100 dark:border-gray-800">
          <button
            onClick={() => setActiveCategory('student')}
            className={`pb-3 px-2 flex items-center gap-2 font-bold text-sm transition-all border-b-2 ${activeCategory === 'student' ? 'border-orange-500 text-orange-600 dark:text-orange-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
          >
              <Users size={18} />
              Student Notifications
              <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full text-xs text-gray-600 dark:text-gray-300">{counts.student}</span>
          </button>
          
          <button
            onClick={() => setActiveCategory('partner')}
            className={`pb-3 px-2 flex items-center gap-2 font-bold text-sm transition-all border-b-2 ${activeCategory === 'partner' ? 'border-green-500 text-green-600 dark:text-green-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
          >
              <Handshake size={18} />
              Partner Notifications
              <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full text-xs text-gray-600 dark:text-gray-300">{counts.partner}</span>
          </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-4 animate-fade-in">
        {filteredNotifications.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 border-dashed">
                <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    {activeCategory === 'student' ? <GraduationCap className="w-8 h-8 text-gray-300" /> : <Shield className="w-8 h-8 text-gray-300" />}
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">No {activeCategory} notifications</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                    You have no {filter === 'unread' ? 'unread' : ''} {activeCategory} alerts at the moment.
                </p>
            </div>
        ) : (
            filteredNotifications.map((notif) => (
                <div 
                    key={notif.id} 
                    onClick={() => !notif.read && onMarkRead(notif.id)}
                    className={`group relative p-5 rounded-2xl border transition-all duration-200 ${
                        notif.read 
                            ? 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 opacity-75 hover:opacity-100' 
                            : 'bg-white dark:bg-gray-900 border-orange-200 dark:border-orange-900 shadow-sm hover:shadow-md transform hover:-translate-y-0.5'
                    }`}
                >
                    {!notif.read && (
                        <span className="absolute top-5 right-5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    )}
                    
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${getColorClass(notif.type)}`}>
                            {getIcon(notif.type)}
                        </div>
                        
                        <div className="flex-1 pr-6">
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                                    notif.type === 'system' 
                                        ? 'bg-gray-100 text-gray-700 border-gray-200' 
                                        : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-transparent'
                                }`}>
                                    {notif.type}
                                </span>
                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                    <Calendar size={10} />
                                    {new Date(notif.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            
                            <h3 className={`text-base font-bold mb-1 ${notif.read ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white'}`}>
                                {notif.title}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
                                {notif.message}
                            </p>

                            {/* Direct Link Redirection */}
                            {notif.link && notif.link !== '#' && (
                                <a 
                                    href={notif.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if(!notif.read) onMarkRead(notif.id);
                                    }}
                                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                        notif.type === 'scholarship' 
                                            ? 'bg-orange-600 text-white hover:bg-orange-700' 
                                            : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}
                                >
                                    <span>Apply Directly to Source</span>
                                    <ExternalLink size={14} />
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
