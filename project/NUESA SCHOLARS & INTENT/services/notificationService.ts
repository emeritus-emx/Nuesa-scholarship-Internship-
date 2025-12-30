
import { AppNotification } from '../types';

export const notificationService = {
  // Request permission from the browser
  requestPermission: async (): Promise<boolean> => {
    if (!("Notification" in window)) {
      console.warn("This browser does not support desktop notifications");
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }

    return false;
  },

  // Trigger a native system notification (Desktop/Mobile OS level)
  triggerSystemNotification: (title: string, body: string, type: string = 'scholarship') => {
    if (Notification.permission === "granted") {
      try {
        const iconMap: Record<string, string> = {
          scholarship: 'https://cdn-icons-png.flaticon.com/512/2995/2995620.png',
          internship: 'https://cdn-icons-png.flaticon.com/512/1904/1904235.png',
          system: 'https://cdn-icons-png.flaticon.com/512/1067/1067562.png'
        };

        const options = {
            body: body,
            icon: iconMap[type] || iconMap.system,
            vibrate: [200, 100, 200],
            tag: 'nuesa-live-alert',
            badge: iconMap[type] || iconMap.system,
            requireInteraction: false // Set to true if you want it to stay until dismissed
        };
        
        const n = new Notification(title, options);
        
        // Handle click on notification
        n.onclick = () => {
            window.focus();
            // Could add logic here to navigate to a specific view
        };
      } catch (e) {
        console.error("Native Notification trigger error:", e);
      }
    }
  },

  // Creates a structured notification object from real discovered data
  formatDiscoveredNotification: (title: string, provider: string, type: 'scholarship' | 'internship' | 'system', link?: string): AppNotification => {
    const safeType = type || 'scholarship';
    const typeLabel = safeType.charAt(0).toUpperCase() + safeType.slice(1);
    
    return {
      id: crypto.randomUUID(),
      title: `New ${typeLabel} Found`,
      message: `${title} is now accepting applications from ${provider}. View details in the portal.`,
      date: new Date().toISOString(),
      read: false,
      type: safeType as any,
      link: link
    };
  }
};
