// Notification & Alert Service for All-Star Sports Academy
// Web Push Notifications + ServiceWorker PWA Push + Supabase Realtime WebSocket Push

import { db, supabase } from './db';

const NOTIF_KEY = 'allstar_notifications_list';
const BROADCAST_KEY = 'allstar_broadcast_announcements';
const PROCESSED_IDS_KEY = 'allstar_processed_announcement_ids';

const INITIAL_NOTIFS = [
  {
    id: 'n-1',
    title: '☀️ تنبيه طقس تطاوين / Weather Warning',
    body: 'مؤشر الأشعة فوق البنفسجية مرتفع (UV 8). يرجى إحضار الواقي الشمسي وقارورة الماء.',
    date: 'منذ ساعتين',
    type: 'weather',
    read: false
  },
  {
    id: 'n-2',
    title: '⚽ تذكير التمرين القادم / Upcoming Session',
    body: 'تمرين كرة القدم غداً الساعة 16:00 بالملعب الرئيسي.',
    date: 'اليوم',
    type: 'schedule',
    read: false
  }
];

class NotificationService {
  constructor() {
    this.listeners = [];
    this.broadcastChannel = null;
    this.realtimeChannel = null;
    this.init();
  }

  init() {
    if (!localStorage.getItem(NOTIF_KEY)) {
      localStorage.setItem(NOTIF_KEY, JSON.stringify(INITIAL_NOTIFS));
    }
    if (!localStorage.getItem(BROADCAST_KEY)) {
      localStorage.setItem(BROADCAST_KEY, JSON.stringify([]));
    }
    if (!localStorage.getItem(PROCESSED_IDS_KEY)) {
      localStorage.setItem(PROCESSED_IDS_KEY, JSON.stringify(['n-1', 'n-2']));
    }

    // 1. Set up Local BroadcastChannel for inter-tab & PWA app windows on same device
    if ('BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel('allstar_notif_channel');
        this.broadcastChannel.onmessage = (event) => {
          if (event.data && event.data.type === 'NEW_NOTIFICATION') {
            this.handleIncomingBroadcast(event.data.notification);
          }
        };
      } catch (e) {
        console.log('BroadcastChannel setup error:', e);
      }
    }

    // 2. Set up Supabase Realtime WebSocket Channel for Live Push Across All Mobile Phones over Internet
    if (supabase) {
      try {
        this.realtimeChannel = supabase.channel('allstar_live_push_channel');
        this.realtimeChannel
          .on('broadcast', { event: 'admin_notification' }, (payload) => {
            console.log('⚡ Received live Supabase WebSocket push on mobile device:', payload);
            if (payload && payload.notification) {
              this.handleIncomingBroadcast(payload.notification);
            }
          })
          .subscribe();
      } catch (e) {
        console.log('Supabase Realtime setup error:', e);
      }
    }

    // 3. Listen for storage events & Cloud Polling Fallback
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === NOTIF_KEY || e.key === BROADCAST_KEY || e.key === 'allstar_db_site_content') {
          this.checkCloudAnnouncements();
          this.notifyListeners();
        }
      });

      // Poll cloud announcements every 3 seconds so mobile phones catch admin broadcasts live
      setInterval(() => {
        this.checkCloudAnnouncements();
      }, 3000);
    }
  }

  checkCloudAnnouncements() {
    try {
      const siteContent = db.getSiteContent();
      const latestAnn = siteContent.latest_announcement;
      if (!latestAnn || !latestAnn.id) return;

      const processedIds = JSON.parse(localStorage.getItem(PROCESSED_IDS_KEY)) || [];
      if (!processedIds.includes(latestAnn.id)) {
        processedIds.push(latestAnn.id);
        localStorage.setItem(PROCESSED_IDS_KEY, JSON.stringify(processedIds));

        // Trigger push notification & popup on this mobile phone/device!
        this.handleIncomingBroadcast(latestAnn);
      }
    } catch (e) {
      console.log('Cloud announcement sync error:', e);
    }
  }

  async requestPermission() {
    if (!('Notification' in window)) {
      alert('الإشعارات غير مدعومة على متصفحك أو هذا الجهاز.');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        this.showNativePush(
          '🔔 تم تفعيل إشعارات الأكاديمية بنجاح!',
          'ستصلك التنبيهات المباشرة ومواعيد التمارين والطقس فور صدورها.'
        );
        this.sendLocalNotification(
          '🔔 تم تفعيل الإشعارات بنجاح / Notifications Enabled',
          'ستصلك إشعارات حول المواعيد والطقس في تطاوين.'
        );
        return true;
      }
    } catch (e) {
      console.error('Error requesting notification permission:', e);
    }
    return false;
  }

  // Trigger Native Push via ServiceWorker (Works on installed PWA & mobile background lockscreen)
  async showNativePush(title, body, icon = '/pwa-192x192.png') {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    const options = {
      body,
      icon,
      badge: icon,
      vibrate: [200, 100, 200, 100, 200],
      tag: 'allstar-announcement-' + Date.now(),
      renotify: true,
      data: { url: '/' }
    };

    // Try via ServiceWorker first (best for PWA & mobile lockscreen)
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        if (registration && registration.showNotification) {
          await registration.showNotification(title, options);
          return;
        }
      } catch (e) {
        console.log('SW notification fallback to Notification constructor:', e);
      }
    }

    // Fallback to standard web notification
    try {
      new Notification(title, options);
    } catch (e) {
      console.log('Native notification error:', e);
    }
  }

  // Broadcast to all clients (saves globally, broadcasts via WebSocket & triggers PWA native push)
  broadcastToAllClients(title, body, icon = '/pwa-192x192.png') {
    const notifItem = {
      id: 'ann-' + Date.now(),
      title,
      body,
      date: 'الآن',
      type: 'broadcast',
      read: false,
      timestamp: Date.now()
    };

    // 1. Add to local notification center list
    const notifs = this.getNotifications();
    notifs.unshift(notifItem);
    localStorage.setItem(NOTIF_KEY, JSON.stringify(notifs));

    // 2. Mark as processed on sender device
    try {
      const processedIds = JSON.parse(localStorage.getItem(PROCESSED_IDS_KEY)) || [];
      if (!processedIds.includes(notifItem.id)) {
        processedIds.push(notifItem.id);
        localStorage.setItem(PROCESSED_IDS_KEY, JSON.stringify(processedIds));
      }
    } catch (e) {
      console.error(e);
    }

    // 3. Post to Supabase Realtime WebSocket channel for all connected mobile phones over internet!
    if (this.realtimeChannel) {
      try {
        this.realtimeChannel.send({
          type: 'broadcast',
          event: 'admin_notification',
          payload: { notification: notifItem }
        });
      } catch (e) {
        console.log('Supabase Realtime broadcast error:', e);
      }
    }

    // 4. Post to local BroadcastChannel for active app windows
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({
          type: 'NEW_NOTIFICATION',
          notification: notifItem
        });
      } catch (e) {
        console.log('Broadcast postMessage error:', e);
      }
    }

    // 5. Save to Cloud / Site Content so remote mobile phones receive it via polling
    try {
      const currentSite = db.getSiteContent();
      const existingAnnouncements = currentSite.announcements || [];
      db.saveSiteContent({
        announcements: [notifItem, ...existingAnnouncements],
        latest_announcement: notifItem
      });
    } catch (e) {
      console.error('Cloud broadcast save error:', e);
    }

    // 6. Trigger Native PWA push notification on this device
    this.showNativePush(title, body, icon);

    // 7. Notify in-app subscribers
    this.notifyListeners();
    return notifItem;
  }

  sendLocalNotification(title, body, icon = '/pwa-192x192.png') {
    return this.broadcastToAllClients(title, body, icon);
  }

  handleIncomingBroadcast(notification) {
    const notifs = this.getNotifications();
    if (!notifs.some(n => n.id === notification.id)) {
      notifs.unshift(notification);
      localStorage.setItem(NOTIF_KEY, JSON.stringify(notifs));
      this.notifyListeners();
      this.showNativePush(notification.title, notification.body);
    }
  }

  getNotifications() {
    try {
      return JSON.parse(localStorage.getItem(NOTIF_KEY)) || INITIAL_NOTIFS;
    } catch {
      return INITIAL_NOTIFS;
    }
  }

  markAllAsRead() {
    const notifs = this.getNotifications().map(n => ({ ...n, read: true }));
    localStorage.setItem(NOTIF_KEY, JSON.stringify(notifs));
    this.notifyListeners();
  }

  sendWhatsAppNotification(phoneNumber, text) {
    const cleanPhone = (phoneNumber || '+21698123456').replace(/[^0-9]/g, '');
    const encodedText = encodeURIComponent(`🇹🇳 *أكاديمية أولستار الرياضية - All Star Sports Academy*\n\n${text}`);
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedText}`;
    
    this.sendLocalNotification(`💬 إشعار واتساب (WhatsApp): ${phoneNumber || ''}`, text);
    window.open(whatsappUrl, '_blank');
  }

  sendSMSAlert(phoneNumber, text) {
    const cleanPhone = (phoneNumber || '+21698123456').replace(/[^0-9]/g, '');
    const smsUrl = `sms:${cleanPhone}?body=${encodeURIComponent(text)}`;
    
    this.sendLocalNotification(`📱 إشعار SMS: ${phoneNumber || ''}`, text);
    window.open(smsUrl, '_blank');
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notifyListeners() {
    const list = this.getNotifications();
    this.listeners.forEach(l => l(list));
  }
}

export const notificationService = new NotificationService();
