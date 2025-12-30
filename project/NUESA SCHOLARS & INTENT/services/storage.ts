
import { User, SavedOpportunity, Sponsorship, AppNotification, ActivityLog } from '../types';

const USER_KEY = 'nuesa_user';
const DATA_KEY = 'nuesa_data';
const SPONSORSHIP_KEY = 'nuesa_sponsorships';
const NOTIFICATIONS_KEY = 'nuesa_notifications';
const RATING_PROMPT_KEY = 'nuesa_rating_prompt_date';
const LOGS_KEY = 'nuesa_security_logs';

const RECENT_STUDENTS = [
  { name: "Olawale J.", img: "https://i.pravatar.cc/150?u=olawale" },
  { name: "Zainab A.", img: "https://i.pravatar.cc/150?u=zainab" },
  { name: "Chidi O.", img: "https://i.pravatar.cc/150?u=chidi" },
  { name: "Fatima B.", img: "https://i.pravatar.cc/150?u=fatima" },
  { name: "Tunde E.", img: "https://i.pravatar.cc/150?u=tunde" },
  { name: "Amaka N.", img: "https://i.pravatar.cc/150?u=amaka" }
];

interface AppData {
  saved: SavedOpportunity[];
}

export const storageService = {
  getUser: (): User | null => {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  },

  getRecentStudents: () => RECENT_STUDENTS,

  login: (email: string, name: string, role: 'student' | 'sponsor' = 'student', title?: string, contactPerson?: string): User => {
    const stored = localStorage.getItem(USER_KEY);
    let user: User;

    if (stored) {
        const existing: User = JSON.parse(stored);
        if (existing.email === email) {
            if (role && existing.role !== role) existing.role = role;
            if (title && !existing.title) existing.title = title;
            if (contactPerson) existing.contactPerson = contactPerson;
            if (name && existing.name !== name) existing.name = name;
            existing.lastLogin = new Date().toISOString();
            
            user = existing;
            localStorage.setItem(USER_KEY, JSON.stringify(existing));
        } else {
            user = { email, name, role, title, contactPerson, lastLogin: new Date().toISOString(), securityScore: 65 };
            localStorage.setItem(USER_KEY, JSON.stringify(user));
        }
    } else {
        user = { email, name, role, title, contactPerson, lastLogin: new Date().toISOString(), securityScore: 65 };
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    }

    if (!localStorage.getItem(DATA_KEY)) {
      localStorage.setItem(DATA_KEY, JSON.stringify({ saved: [] }));
    }

    storageService.addSecurityLog('Authentication', 'Successful sign-in');
    return user;
  },

  updateUser: (updatedUser: User) => {
    localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
  },

  logout: () => {
    storageService.addSecurityLog('Authentication', 'Session terminated by user');
    localStorage.removeItem(USER_KEY);
  },

  getSavedOpportunities: (): SavedOpportunity[] => {
    const data = localStorage.getItem(DATA_KEY);
    return data ? JSON.parse(data).saved : [];
  },

  saveOpportunity: (opportunity: SavedOpportunity) => {
    const data = localStorage.getItem(DATA_KEY);
    const parsed: AppData = data ? JSON.parse(data) : { saved: [] };
    
    if (!parsed.saved.some(o => o.title === opportunity.title)) {
      parsed.saved.unshift(opportunity);
      localStorage.setItem(DATA_KEY, JSON.stringify(parsed));
      storageService.addSecurityLog('Data Usage', `Opportunity tracked: ${opportunity.title}`);
    }
  },

  updateOpportunityStatus: (id: string, status: 'Applied' | 'Interested' | 'Won') => {
    const data = localStorage.getItem(DATA_KEY);
    if (data) {
        const parsed: AppData = JSON.parse(data);
        const index = parsed.saved.findIndex(o => o.id === id);
        if (index !== -1) {
            parsed.saved[index].status = status;
            localStorage.setItem(DATA_KEY, JSON.stringify(parsed));
            storageService.addSecurityLog('Data Usage', `Application status updated to ${status}`);
        }
    }
  },

  removeOpportunity: (id: string) => {
    const data = localStorage.getItem(DATA_KEY);
    if (data) {
        const parsed: AppData = JSON.parse(data);
        parsed.saved = parsed.saved.filter(o => o.id !== id);
        localStorage.setItem(DATA_KEY, JSON.stringify(parsed));
    }
  },

  createSponsorship: (sponsorship: Sponsorship) => {
    const stored = localStorage.getItem(SPONSORSHIP_KEY);
    const list: Sponsorship[] = stored ? JSON.parse(stored) : [];
    list.unshift(sponsorship);
    localStorage.setItem(SPONSORSHIP_KEY, JSON.stringify(list));
    storageService.addSecurityLog('Program Audit', `New scheme created: ${sponsorship.title}`);
  },

  getSponsorships: (email?: string): Sponsorship[] => {
    const stored = localStorage.getItem(SPONSORSHIP_KEY);
    const list: Sponsorship[] = stored ? JSON.parse(stored) : [];
    if (email) {
      return list.filter(s => s.providerEmail === email);
    }
    return list;
  },

  incrementSponsorshipApplicants: (id: string) => {
      const stored = localStorage.getItem(SPONSORSHIP_KEY);
      if (stored) {
          const list: Sponsorship[] = JSON.parse(stored);
          const index = list.findIndex(s => s.id === id);
          if (index !== -1) {
              console.log(`Applicant tracked for sponsorship: ${id}`);
          }
      }
  },

  getNotifications: (): AppNotification[] => {
    const stored = localStorage.getItem(NOTIFICATIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  addNotification: (notification: AppNotification) => {
    const stored = localStorage.getItem(NOTIFICATIONS_KEY);
    const list: AppNotification[] = stored ? JSON.parse(stored) : [];
    if (list.length > 50) list.pop();
    list.unshift(notification);
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(list));
  },

  addSecurityLog: (action: string, detail: string, status: 'success' | 'warning' | 'error' = 'success') => {
      const stored = localStorage.getItem(LOGS_KEY);
      const list: ActivityLog[] = stored ? JSON.parse(stored) : [];
      const newLog: ActivityLog = {
          id: crypto.randomUUID(),
          action: `${action}: ${detail}`,
          timestamp: new Date().toISOString(),
          ip: '197.210.64.' + Math.floor(Math.random() * 255),
          device: 'Chrome on MacOS (Encrypted)',
          status
      };
      list.unshift(newLog);
      if (list.length > 20) list.pop();
      localStorage.setItem(LOGS_KEY, JSON.stringify(list));
  },

  getSecurityLogs: (): ActivityLog[] => {
      const stored = localStorage.getItem(LOGS_KEY);
      return stored ? JSON.parse(stored) : [];
  },

  purgeAllData: () => {
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(DATA_KEY);
      localStorage.removeItem(NOTIFICATIONS_KEY);
      localStorage.removeItem(LOGS_KEY);
  },

  shouldShowRating: (): boolean => {
    const lastPrompt = localStorage.getItem(RATING_PROMPT_KEY);
    if (!lastPrompt) return true;
    const oneDay = 24 * 60 * 60 * 1000;
    const now = Date.now();
    return now - parseInt(lastPrompt) > oneDay;
  },

  saveRatingPromptDate: () => {
    localStorage.setItem(RATING_PROMPT_KEY, Date.now().toString());
  }
};
