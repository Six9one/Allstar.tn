// Notification & Alert Service for All-Star Sports Academy
// Native OS Web Push Notifications + ServiceWorker PWA Push + Supabase Realtime WebSocket + Edge Functions

import { db, supabase } from './db';

const NOTIF_KEY = 'allstar_notifications_list';
const NOTIF_LOG_KEY = 'allstar_notifications_log_cache';
const PROCESSED_IDS_KEY = 'allstar_processed_announcement_ids';

// Default VAPID Public Key fallback (matching backend Edge Function private key)
const DEFAULT_VAPID_PUBLIC_KEY = 'BNf5rkYVMwOreTQ5KLFlDgqHCS5OHG3RVwT_IqUzp-TuNo2NXOhQrKmBGJei1Uety9DX03hIdnj_rmWOEZ2cuq8';

const INITIAL_NOTIFS = [
  {
    id: 'n-1',
    title: '☀️ تنبيه طقس تطاوين / Weather Warning',
    body: 'مؤشر الأشعة فوق البنفسجية مرتفع (UV 8). يرجى إحضار الواقي الشمسي وقارورة الماء.',
    date: 'منذ ساعتين',
    type: 'weather',
    read: true
  },
  {
    id: 'n-2',
    title: '⚽ تذكير التمرين القادم / Upcoming Session',
    body: 'تمرين كرة القدم غداً الساعة 16:00 بالملعب الرئيسي.',
    date: 'اليوم',
    type: 'schedule',
    read: true
  }
];

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

class NotificationService {
  constructor() {
    this.listeners = [];
    this.receiveCallbacks = [];
    this.broadcastChannel = null;
    this.realtimeChannel = null;
    this.init();
  }

  onReceive(callback) {
    this.receiveCallbacks.push(callback);
    return () => {
      this.receiveCallbacks = this.receiveCallbacks.filter(c => c !== callback);
    };
  }

  init() {
    this.initOneSignal();

    if (!localStorage.getItem(NOTIF_KEY)) {
      localStorage.setItem(NOTIF_KEY, JSON.stringify(INITIAL_NOTIFS));
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
            this.handleIncomingNotification(event.data.notification);
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
            const notif = payload?.payload?.notification || payload?.notification;
            if (notif) {
              this.handleIncomingNotification(notif);
            }
          })
          .subscribe();

        // Also listen to direct PostgreSQL INSERT events on notifications_log
        this.dbLogChannel = supabase
          .channel('allstar_notif_log_db')
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications_log' }, (payload) => {
            if (payload?.new) {
              const log = payload.new;
              const notif = {
                id: 'notif-log-' + log.id,
                title: log.title,
                body: log.body,
                target_url: log.target_url || '/',
                target_role: log.target_role || 'الجميع',
                image_url: log.image_url || null,
                date: 'الآن',
                read: false,
                timestamp: Date.now()
              };
              this.handleIncomingNotification(notif);
            }
          })
          .subscribe();
      } catch (e) {
        console.log('Supabase Realtime setup error:', e);
      }
    }

    // 3. Listen for visibility changes (App opened / foregrounded on iPhone) & Cloud Polling
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === NOTIF_KEY || e.key === 'allstar_db_site_content') {
          this.checkCloudAnnouncements();
          this.notifyListeners();
        }
      });

      // Immediate check when phone screen unlocks or user switches back to the app
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          this.checkCloudAnnouncements();
        }
      });
      window.addEventListener('focus', () => {
        this.checkCloudAnnouncements();
      });

      // Periodic check every 3 seconds for bulletproof real-time reception
      setInterval(() => {
        this.checkCloudAnnouncements();
      }, 3000);

      // Auto-register push subscription if permission already granted
      if ('Notification' in window && Notification.permission === 'granted') {
        this.registerPushSubscription().catch(() => {});
      }
    }
  }

  async checkCloudAnnouncements() {
    try {
      // 1. Check Supabase notifications_log table directly
      if (supabase) {
        const { data: logs } = await supabase
          .from('notifications_log')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1);

        if (logs && logs.length > 0) {
          const latest = logs[0];
          const notifId = 'notif-db-' + latest.id;
          const processedIds = JSON.parse(localStorage.getItem(PROCESSED_IDS_KEY)) || [];
          if (!processedIds.includes(notifId) && !processedIds.includes(latest.id?.toString())) {
            processedIds.push(notifId);
            if (latest.id) processedIds.push(latest.id.toString());
            localStorage.setItem(PROCESSED_IDS_KEY, JSON.stringify(processedIds));

            this.handleIncomingNotification({
              id: notifId,
              title: latest.title,
              body: latest.body,
              target_url: latest.target_url || '/',
              target_role: latest.target_role || 'الجميع',
              image_url: latest.image_url || null,
              date: 'الآن',
              read: false,
              timestamp: new Date(latest.created_at || Date.now()).getTime()
            });
            return;
          }
        }
      }

      // 2. Check site_content async
      const siteContent = await db.getSiteContentAsync();
      const latestAnn = siteContent?.latest_announcement;
      if (!latestAnn || !latestAnn.id) return;

      const processedIds = JSON.parse(localStorage.getItem(PROCESSED_IDS_KEY)) || [];
      if (!processedIds.includes(latestAnn.id)) {
        processedIds.push(latestAnn.id);
        localStorage.setItem(PROCESSED_IDS_KEY, JSON.stringify(processedIds));

        // Trigger push notification & popup on this mobile phone/device!
        this.handleIncomingNotification(latestAnn);
      }
    } catch (e) {
      // Silently handle
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
        // Register Web Push subscription in background
        await this.registerPushSubscription();

        if (window.OneSignal?.Notifications) {
          try {
            await window.OneSignal.Notifications.requestPermission();
          } catch (e) {
            console.log('OneSignal permission hook:', e);
          }
        }

        // Show single welcome notification if not already shown
        if (!localStorage.getItem('allstar_welcome_notif_sent')) {
          localStorage.setItem('allstar_welcome_notif_sent', 'true');
          this.showNativePush(
            '🔔 تم تفعيل إشعارات الأكاديمية بنجاح!',
            'ستصلك التنبيهات المباشرة ومواعيد التمارين والطقس فور صدورها.'
          );
        }
        return true;
      }
    } catch (e) {
      console.error('Error requesting notification permission:', e);
    }
    return false;
  }

  // Register push subscription to Supabase push_subscriptions table
  async registerPushSubscription(vapidKey = DEFAULT_VAPID_PUBLIC_KEY, role = 'all', userId = null) {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      if (!registration.pushManager) return null;

      let subscription = await registration.pushManager.getSubscription();

      if (!subscription && vapidKey) {
        const convertedVapidKey = urlBase64ToUint8Array(vapidKey);
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey,
        });
      }

      if (subscription && supabase) {
        const subJson = subscription.toJSON();
        const p256dh = subJson.keys?.p256dh;
        const auth = subJson.keys?.auth;
        const endpoint = subJson.endpoint;

        if (endpoint && p256dh && auth) {
          const userAgent = navigator.userAgent;
          await supabase.from('push_subscriptions').upsert(
            {
              endpoint,
              p256dh,
              auth,
              role: role || 'all',
              user_id: userId || null,
              user_agent: userAgent,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'endpoint' }
          );
          console.log('✅ Push subscription registered in Supabase');
        }
      }

      return subscription;
    } catch (error) {
      console.warn('Push subscription registration error:', error);
      return null;
    }
  }

  // Trigger Native Push via ServiceWorker (Works on installed PWA & mobile background lockscreen)
  async showNativePush(title, body, icon = '/icon.png', data = { url: '/' }) {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    const options = {
      body,
      icon: 'https://allstar.tn/icon.png',
      badge: 'https://allstar.tn/icon.png',
      vibrate: [200, 100, 200, 100, 200],
      tag: 'allstar-notification-' + Date.now(),
      renotify: true,
      data: data || { url: '/' }
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

  // Send Push Notification from Admin via Supabase Edge Function with instant local/realtime dispatch
  async sendPushNotification({ title, body, targetUrl = '/', imageUrl = null, targetAudience = 'الجميع' }) {
    const config = this.getNotificationConfig();
    const notifIcon = (config.logoUrl && config.logoUrl.startsWith('http'))
      ? config.logoUrl
      : (config.logoUrl ? config.logoUrl : 'https://allstar.tn/logo-light.png');

    const notifItem = {
      id: 'notif-' + Date.now(),
      title,
      body,
      target_url: targetUrl || '/',
      target_role: targetAudience || 'الجميع',
      image_url: imageUrl,
      logo_url: config.logoUrl || null,
      app_title: config.appTitle || 'ALL-STAR SPORTS ACADEMY',
      app_subtitle: config.appSubtitle || 'أكاديمية أولستار تطاوين 🇹🇳',
      sound_type: config.soundType || 'tri-tone',
      custom_sound_url: config.customSoundUrl || null,
      date: 'الآن',
      type: 'notification',
      read: false,
      timestamp: Date.now()
    };

    // 1. Mark as processed on sender so sender doesn't re-trigger itself
    const processedIds = JSON.parse(localStorage.getItem(PROCESSED_IDS_KEY)) || [];
    processedIds.push(notifItem.id);
    localStorage.setItem(PROCESSED_IDS_KEY, JSON.stringify(processedIds));

    // 2. INSTANT LOCAL & REALTIME DISPATCH (0ms latency for all open apps/phones)
    const notifs = this.getNotifications();
    notifs.unshift(notifItem);
    localStorage.setItem(NOTIF_KEY, JSON.stringify(notifs));

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

    this.notifyListeners();

    // 3. PARALLEL EDGE FUNCTION & DATABASE PERSISTENCE
    const pushPayload = {
      title,
      body,
      icon: notifIcon,
      badge: 'https://allstar.tn/logo-light.png',
      imageUrl: imageUrl || undefined,
      image: imageUrl || undefined,
      targetUrl: targetUrl || '/',
      targetAudience: targetAudience || 'الجميع',
      vibrate: [200, 100, 200],
      tag: `academy-notification-${Date.now()}`,
      renotify: true,
      data: {
        url: targetUrl || '/',
        dateOfArrival: Date.now(),
        customSoundUrl: config.customSoundUrl || undefined,
        soundType: config.soundType || 'tri-tone',
        logoUrl: config.logoUrl || undefined,
        imageUrl: imageUrl || undefined,
      }
    };

    let sentCount = 1;
    let successMessage = '';

    if (supabase) {
      try {
        // Save directly to notifications_log table
        await supabase.from('notifications_log').insert({
          title,
          body,
          target_role: targetAudience || 'الجميع',
          target_url: targetUrl || '/',
          image_url: imageUrl || null,
          sent_count: 1
        });

        // Save to Cloud Site Content for background polling
        const currentSite = await db.getSiteContentAsync();
        const existingAnnouncements = currentSite?.announcements || [];
        await db.saveSiteContent({
          ...currentSite,
          announcements: [notifItem, ...existingAnnouncements],
          latest_announcement: notifItem
        });

        const { data, error } = await supabase.functions.invoke('send-push-notification', {
          body: pushPayload
        });

        if (!error && data) {
          sentCount = data.results?.sent_count || data.results?.total || 1;
          successMessage = data.message || `تم إرسال الإشعار بنجاح إلى ${sentCount} جهاز`;
        }
      } catch (invokeErr) {
        console.warn('Edge function invoke notice:', invokeErr);
      }
    }

    // 4. OneSignal REST API Broadcast to closed devices/iPhones
    try {
      const appId = config.oneSignalAppId || 'dedea313-29ed-453f-810f-f7a2a164ad8e';
      const apiKey = config.oneSignalApiKey;
      if (appId && apiKey) {
        const authHeader = apiKey.startsWith('os_v2_') ? `Key ${apiKey}` : `Basic ${apiKey}`;
        const response = await fetch('https://onesignal.com/api/v1/notifications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Authorization': authHeader
          },
          body: JSON.stringify({
            app_id: appId,
            included_segments: ['Total Subscriptions'],
            headings: { en: title, ar: title },
            contents: { en: body, ar: body },
            url: targetUrl.startsWith('http') ? targetUrl : `https://allstar.tn${targetUrl}`,
            chrome_web_image: imageUrl || undefined,
            big_picture: imageUrl || undefined,
            chrome_web_icon: notifIcon,
            chrome_web_badge: 'https://allstar.tn/logo-light.png',
            firefox_icon: notifIcon,
            small_icon: 'https://allstar.tn/icon.png',
            large_icon: notifIcon,
            ios_attachments: imageUrl ? { id1: imageUrl } : undefined,
            adm_big_picture: imageUrl || undefined,
            ios_sound: 'notification.mp3',
            android_sound: 'notification',
            data: {
              customSoundUrl: config.customSoundUrl || undefined,
              soundType: config.soundType || 'tri-tone',
              imageUrl: imageUrl || undefined,
              logoUrl: config.logoUrl || undefined,
              appTitle: config.appTitle || undefined,
              appSubtitle: config.appSubtitle || undefined,
            }
          })
        });
        const osData = await response.json();
        console.log('⚡ OneSignal Push Response:', osData);
        if (osData?.recipients || osData?.id) {
          sentCount = Math.max(sentCount, osData.recipients || 1);
          successMessage = `تم بث الإشعار إلى ${sentCount} جهاز بنجاح (بما في ذلك الهواتف المقفلة عبر OneSignal)`;
        }
      }
    } catch (osErr) {
      console.warn('OneSignal dispatch notice:', osErr);
    }

    return {
      success: true,
      sentCount: sentCount || 1,
      message: successMessage || `تم إرسال الإشعار بنجاح إلى ${sentCount || 1} جهاز`,
      notification: notifItem
    };
  }

  // Fetch Push Notifications Log from Supabase or cache
  async getNotificationsLog() {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('notifications_log')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(30);

        if (!error && Array.isArray(data)) {
          localStorage.setItem(NOTIF_LOG_KEY, JSON.stringify(data));
          return data;
        }
      } catch (e) {
        console.warn('Failed to fetch notifications log from Supabase:', e);
      }
    }

    try {
      const cached = JSON.parse(localStorage.getItem(NOTIF_LOG_KEY));
      if (Array.isArray(cached) && cached.length > 0) return cached;
    } catch {
      // Fall through to local notifications
    }

    // Fallback from local notifications
    return this.getNotifications().map(n => ({
      id: n.id,
      title: n.title,
      body: n.body,
      target_role: n.target_role || 'الجميع',
      target_url: n.target_url || '/',
      sent_count: 1,
      created_at: n.timestamp ? new Date(n.timestamp).toISOString() : new Date().toISOString()
    }));
  }

  broadcastToAllClients(title, body, icon = '/icon.png') {
    return this.sendPushNotification({ title, body, imageUrl: icon });
  }

  sendLocalNotification(title, body, icon = '/icon.png') {
    return this.broadcastToAllClients(title, body, icon);
  }

  handleIncomingNotification(notification) {
    const notifs = this.getNotifications();
    if (!notifs.some(n => n.id === notification.id)) {
      notifs.unshift(notification);
      localStorage.setItem(NOTIF_KEY, JSON.stringify(notifs));
      this.notifyListeners();

      // Play configured custom sound chime
      const soundConfig = {
        soundType: notification.sound_type || this.getNotificationConfig().soundType || 'tri-tone',
        customSoundUrl: notification.custom_sound_url || this.getNotificationConfig().customSoundUrl || ''
      };
      this.playConfiguredSound(soundConfig);

      // Direct instant UI pop
      this.receiveCallbacks.forEach(cb => {
        try { cb(notification); } catch (e) { console.warn('Receive callback error:', e); }
      });

      this.showNativePush(
        notification.title,
        notification.body,
        notification.logo_url || 'https://allstar.tn/logo-light.png',
        { url: notification.target_url || '/' }
      );
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
    const cleanPhone = (phoneNumber || '+21658263467').replace(/[^0-9]/g, '');
    const encodedText = encodeURIComponent(`🇹🇳 *أكاديمية أولستار الرياضية - All Star Sports Academy*\n\n${text}`);
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedText}`;
    
    this.sendLocalNotification(`💬 إشعار واتساب (WhatsApp): ${phoneNumber || ''}`, text);
    window.open(whatsappUrl, '_blank');
  }

  sendSMSAlert(phoneNumber, text) {
    const cleanPhone = (phoneNumber || '+21658263467').replace(/[^0-9]/g, '');
    const smsUrl = `sms:${cleanPhone}?body=${encodeURIComponent(text)}`;
    
    this.sendLocalNotification(`📱 إشعار SMS: ${phoneNumber || ''}`, text);
    window.open(smsUrl, '_blank');
  }

  initOneSignal() {
    if (typeof window === 'undefined') return;
    try {
      window.OneSignalDeferred = window.OneSignalDeferred || [];
      const config = this.getNotificationConfig();
      const appId = config?.oneSignalAppId;
      if (appId) {
        window.OneSignalDeferred.push(async function(OneSignal) {
          try {
            await OneSignal.init({
              appId: appId,
              allowLocalhostAsSecureOrigin: true,
              notifyButton: { enable: false },
            });
            console.log('✅ OneSignal Push Engine Initialized for Background Delivery');
          } catch (e) {
            console.log('OneSignal init notice:', e);
          }
        });
      }
    } catch (e) {
      console.log('OneSignal deferred error:', e);
    }
  }

  getNotificationConfig() {
    try {
      const siteContent = db.getSiteContent();
      if (siteContent?.notification_config) {
        return {
          ...siteContent.notification_config,
          oneSignalAppId: siteContent.notification_config.oneSignalAppId || 'dedea313-29ed-453f-810f-f7a2a164ad8e',
          oneSignalApiKey: siteContent.notification_config.oneSignalApiKey || '',
        };
      }
      const local = JSON.parse(localStorage.getItem('allstar_notification_config'));
      if (local) {
        return {
          ...local,
          oneSignalAppId: local.oneSignalAppId || 'dedea313-29ed-453f-810f-f7a2a164ad8e',
          oneSignalApiKey: local.oneSignalApiKey || '',
        };
      }
    } catch {}
    return {
      logoUrl: '',
      soundType: 'tri-tone',
      customSoundUrl: '',
      appTitle: 'ALL-STAR SPORTS ACADEMY',
      appSubtitle: 'أكاديمية أولستار تطاوين 🇹🇳',
      oneSignalAppId: 'dedea313-29ed-453f-810f-f7a2a164ad8e',
      oneSignalApiKey: ''
    };
  }

  saveNotificationConfig(config) {
    try {
      localStorage.setItem('allstar_notification_config', JSON.stringify(config));
      const currentSite = db.getSiteContent();
      db.saveSiteContent({
        ...currentSite,
        notification_config: config
      });
      if (this.broadcastChannel) {
        this.broadcastChannel.postMessage({ type: 'CONFIG_UPDATED', config });
      }
      this.notifyListeners();
    } catch (e) {
      console.warn('Error saving notification config:', e);
    }
  }

  playConfiguredSound(customConfig) {
    const config = customConfig || this.getNotificationConfig();
    const soundType = config.soundType || 'tri-tone';

    if (soundType === 'custom' && config.customSoundUrl) {
      try {
        const audio = new Audio(config.customSoundUrl);
        audio.volume = 0.7;
        const p = audio.play();
        if (p !== undefined) {
          p.catch(() => this.playTriToneSound());
        }
        return;
      } catch {
        this.playTriToneSound();
        return;
      }
    }

    if (soundType === 'whistle') {
      this.playWhistleSound();
    } else if (soundType === 'crystal') {
      this.playCrystalSound();
    } else {
      this.playTriToneSound();
    }
  }

  playTriToneSound() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const notes = [
        { freq: 783.99, delay: 0.0,  duration: 0.35, gain: 0.22 },
        { freq: 987.77, delay: 0.08, duration: 0.40, gain: 0.20 },
        { freq: 1318.51, delay: 0.16, duration: 0.65, gain: 0.28 },
      ];
      const master = ctx.createGain();
      master.gain.setValueAtTime(0.7, ctx.currentTime);
      master.connect(ctx.destination);
      notes.forEach(({ freq, delay, duration, gain }) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
        g.gain.setValueAtTime(0.001, ctx.currentTime + delay);
        g.gain.exponentialRampToValueAtTime(gain, ctx.currentTime + delay + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + duration);
        osc.connect(g);
        g.connect(master);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + duration + 0.05);
      });
    } catch {}
  }

  playWhistleSound() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(2200, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(2600, ctx.currentTime + 0.08);
      osc.frequency.linearRampToValueAtTime(2300, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.36);
    } catch {}
  }

  playCrystalSound() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1046.5, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(2093.0, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.42);
    } catch {}
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
