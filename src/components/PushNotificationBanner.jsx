import React, { useState, useEffect } from 'react';
import { notificationService } from '../services/notifications';

// Web Audio API chime for app-like notification sound
function playNotificationChime() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch (e) {
    console.log('Audio chime error:', e);
  }
}

export default function PushNotificationBanner() {
  const [activeBroadcast, setActiveBroadcast] = useState(null);
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);

  useEffect(() => {
    // Check notification permission status
    if ('Notification' in window && Notification.permission === 'default') {
      // Show polite permission request bar after 3 seconds
      const timer = setTimeout(() => setShowPermissionPrompt(true), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    // Check if there is an unread broadcast notification
    const checkUnreadBroadcasts = () => {
      const allNotifs = notificationService.getNotifications();
      const latestBroadcast = allNotifs.find(n => (n.type === 'broadcast' || n.type === 'info') && !n.dismissed);
      if (latestBroadcast && (!activeBroadcast || activeBroadcast.id !== latestBroadcast.id)) {
        setActiveBroadcast(latestBroadcast);
        playNotificationChime();
      }
    };

    checkUnreadBroadcasts();
    const unsubscribe = notificationService.subscribe(() => {
      checkUnreadBroadcasts();
    });

    const handleStorage = (e) => {
      if (e.key === 'allstar_notifications_list' || e.key === 'allstar_broadcast_announcements') {
        checkUnreadBroadcasts();
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      unsubscribe();
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const handleDismiss = () => {
    if (activeBroadcast) {
      const notifs = notificationService.getNotifications().map(n => 
        n.id === activeBroadcast.id ? { ...n, dismissed: true, read: true } : n
      );
      localStorage.setItem('allstar_notifications_list', JSON.stringify(notifs));
      setActiveBroadcast(null);
    }
  };

  const handleEnablePermission = async () => {
    setShowPermissionPrompt(false);
    const granted = await notificationService.requestPermission();
    if (granted) {
      playNotificationChime();
    }
  };

  return (
    <>
      {/* 1. FLOATING PERMISSION REQUEST RIBBON (if not yet granted) */}
      {showPermissionPrompt && (
        <div style={{
          position: 'fixed', top: '72px', left: '16px', right: '16px', zIndex: 9998,
          maxWidth: '600px', margin: '0 auto',
          background: 'linear-gradient(135deg, rgba(10,31,68,0.96), rgba(6,19,41,0.98))',
          border: '1.5px solid #FFC107', borderRadius: '16px',
          padding: '12px 18px', color: '#FFF',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px',
          boxShadow: '0 10px 30px rgba(255,193,7,0.3)', backdropFilter: 'blur(10px)',
          direction: 'rtl', fontFamily: '"Cairo", "Tajawal", sans-serif',
          animation: 'slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.4rem' }}>🔔</span>
            <div>
              <div style={{ fontWeight: 900, fontSize: '0.85rem', color: '#FFC107' }}>تفعيل إشعارات الأكاديمية المباشرة</div>
              <div style={{ fontSize: '0.75rem', color: '#B0BEC5' }}>احصل على تنبيهات التمارين والطقس على هاتفك فور صدورها</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handleEnablePermission} style={{
              background: 'linear-gradient(135deg, #FFC107, #FF9500)', border: 'none', color: '#000',
              padding: '7px 14px', borderRadius: '10px', fontWeight: 900, cursor: 'pointer', fontSize: '0.78rem',
              fontFamily: '"Cairo", "Tajawal", sans-serif'
            }}>تفعيل الآن 🚀</button>
            <button onClick={() => setShowPermissionPrompt(false)} style={{
              background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#8E9BAE',
              padding: '7px 10px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '0.75rem'
            }}>إلغاء</button>
          </div>
        </div>
      )}

      {/* 2. URGENT PWA APP PUSH ANNOUNCEMENT MODAL CARD */}
      {activeBroadcast && (
        <div style={{
          position: 'fixed', top: '80px', left: '16px', right: '16px', zIndex: 9999,
          maxWidth: '540px', margin: '0 auto',
          background: 'linear-gradient(145deg, #0A1628, #07101E)',
          border: '2px solid #FF3D00', borderRadius: '24px',
          padding: '20px 24px', color: '#FFF',
          boxShadow: '0 20px 50px rgba(255,61,0,0.4), 0 0 30px rgba(0,0,0,0.9)',
          backdropFilter: 'blur(12px)', direction: 'rtl',
          fontFamily: '"Cairo", "Tajawal", sans-serif',
          animation: 'popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}>
          {/* Header Badge */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{
              background: 'linear-gradient(90deg, #FF3D00, #FF9500)', color: '#FFF',
              padding: '4px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 900,
              display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 0 12px rgba(255,61,0,0.6)'
            }}>
              <span className="pulsing-red-dot" />
              🚨 إشعار عاجل من الإدارة
            </div>
            <span style={{ fontSize: '0.72rem', color: '#8E9BAE' }}>{activeBroadcast.date || 'الآن'}</span>
          </div>

          {/* Title & Body */}
          <h3 style={{ color: '#FFF', fontSize: '1.15rem', fontWeight: 900, margin: '0 0 8px 0', lineHeight: 1.3 }}>
            {activeBroadcast.title}
          </h3>
          <p style={{ color: '#ECEFF1', fontSize: '0.9rem', margin: '0 0 16px 0', lineHeight: 1.6 }}>
            {activeBroadcast.body}
          </p>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleDismiss} style={{
              flex: 1, padding: '12px', background: 'linear-gradient(135deg, #00E676, #00B0FF)',
              border: 'none', borderRadius: '14px', color: '#000', fontWeight: 900,
              fontSize: '0.88rem', cursor: 'pointer', fontFamily: '"Cairo", "Tajawal", sans-serif'
            }}>
              ✅ تم القراءة والموافقة
            </button>
            <button onClick={handleDismiss} style={{
              padding: '12px 18px', background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)', borderRadius: '14px', color: '#B0BEC5',
              fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', fontFamily: '"Cairo", "Tajawal", sans-serif'
            }}>
              إغلاق ✕
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes popIn {
          0% { opacity: 0; transform: scale(0.85) translateY(-20px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes slideDown {
          0% { opacity: 0; transform: translateY(-30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .pulsing-red-dot {
          width: 8px; height: 8px; background: #FFF; borderRadius: 50%;
          display: inline-block; animation: pulseDot 1s infinite alternate;
        }
        @keyframes pulseDot {
          0% { opacity: 0.3; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1.3); }
        }
      `}</style>
    </>
  );
}
