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
  const [activeNotification, setActiveNotification] = useState(null);
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);
  const [permissionState, setPermissionState] = useState('default');
  const [isRequesting, setIsRequesting] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Detect PWA standalone mode
    const standalone = window.matchMedia('(display-mode: standalone)').matches ||
                       window.navigator.standalone === true ||
                       document.referrer.includes('android-app://');
    setIsStandalone(standalone);

    // Check current notification permission
    if ('Notification' in window) {
      setPermissionState(Notification.permission);

      if (Notification.permission === 'default') {
        setShowPermissionPrompt(true);
      }
    } else {
      // In iOS Safari WebKit before install, Notification object might only exist in standalone
      if (standalone) {
        setShowPermissionPrompt(true);
      }
    }
  }, []);

  useEffect(() => {
    const checkUnreadNotifications = () => {
      const allNotifs = notificationService.getNotifications();
      const latest = allNotifs.find(n => !n.dismissed && !n.read);
      if (latest && (!activeNotification || activeNotification.id !== latest.id)) {
        setActiveNotification(latest);
        playNotificationChime();
      }
    };

    checkUnreadNotifications();
    const unsubscribe = notificationService.subscribe(() => {
      checkUnreadNotifications();
    });

    const handleStorage = (e) => {
      if (e.key === 'allstar_notifications_list') {
        checkUnreadNotifications();
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      unsubscribe();
      window.removeEventListener('storage', handleStorage);
    };
  }, [activeNotification]);

  const handleDismissAlert = () => {
    if (activeNotification) {
      const notifs = notificationService.getNotifications().map(n => 
        n.id === activeNotification.id ? { ...n, dismissed: true, read: true } : n
      );
      localStorage.setItem('allstar_notifications_list', JSON.stringify(notifs));
      setActiveNotification(null);
    }
  };

  const handleDismissPermission = () => {
    setShowPermissionPrompt(false);
  };

  const handleEnablePermission = async () => {
    setIsRequesting(true);
    try {
      const granted = await notificationService.requestPermission();
      if (granted) {
        setPermissionState('granted');
        setShowPermissionPrompt(false);
        playNotificationChime();
        // Show immediate confirmation push
        notificationService.showNativePush(
          '🔔 تم تفعيل إشعارات الأكاديمية بنجاح!',
          'ستصلك التنبيهات المباشرة ومواعيد التمارين والطقس فور صدورها.'
        );
      } else {
        if ('Notification' in window) {
          setPermissionState(Notification.permission);
        }
      }
    } catch (e) {
      console.warn('Permission request error:', e);
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <>
      {/* 1. FLOATING PERMISSION PROMPT (FIXED ABOVE EVERYTHING AT BOTTOM/TOP) */}
      {showPermissionPrompt && permissionState !== 'granted' && (
        <div style={{
          position: 'fixed',
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 76px)',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 32px)',
          maxWidth: '560px',
          zIndex: 2147483647, // Highest possible z-index
          background: 'linear-gradient(145deg, #0A1628 0%, #060D1A 100%)',
          border: '2px solid #FFC107',
          borderRadius: '22px',
          padding: '18px 20px',
          color: '#FFF',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.95), 0 0 30px rgba(255, 193, 7, 0.45)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          direction: 'rtl',
          fontFamily: '"Cairo", "Tajawal", sans-serif',
          animation: 'slideUpRibbon 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '14px',
              background: 'linear-gradient(135deg, #FFC107, #FF9500)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.5rem', flexShrink: 0,
              boxShadow: '0 4px 16px rgba(255,193,7,0.5)'
            }}>
              🔔
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                display: 'inline-block',
                background: 'rgba(255,193,7,0.2)',
                color: '#FFC107',
                padding: '2px 8px',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: 800,
                marginBottom: '4px'
              }}>
                {isStandalone ? 'تطبيق الهاتف (PWA) 📱' : 'تنبيهات فورية 🔔'}
              </div>
              <h4 style={{ color: '#FFFFFF', fontSize: '1.05rem', fontWeight: 900, margin: 0 }}>
                تفعيل إشعارات أكاديمية أولستار على هاتفك
              </h4>
              <p style={{ color: '#B0BEC5', fontSize: '0.8rem', margin: '4px 0 0 0', lineHeight: 1.4 }}>
                احصل على تنبيهات التمارين، بطاقات FUT، وحالة الطقس على شاشة هاتفك فوراً!
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleEnablePermission}
              disabled={isRequesting}
              style={{
                flex: 1,
                background: 'linear-gradient(135deg, #00E676, #00B0FF)',
                border: 'none',
                color: '#08090C',
                padding: '12px',
                borderRadius: '14px',
                fontWeight: 900,
                cursor: isRequesting ? 'wait' : 'pointer',
                fontSize: '0.92rem',
                fontFamily: '"Cairo", "Tajawal", sans-serif',
                boxShadow: '0 4px 16px rgba(0,230,118,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <span>{isRequesting ? '⏳' : '⚡'}</span>
              <span>{isRequesting ? 'جاري التفعيل...' : 'تفعيل الإشعارات الآن'}</span>
            </button>
            <button
              onClick={handleDismissPermission}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#90A4AE',
                padding: '12px 16px',
                borderRadius: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: '0.84rem',
                fontFamily: '"Cairo", "Tajawal", sans-serif'
              }}
            >
              لاحقاً
            </button>
          </div>
        </div>
      )}

      {/* 2. URGENT PWA APP NOTIFICATION MODAL CARD */}
      {activeNotification && (
        <div style={{
          position: 'fixed',
          top: 'calc(env(safe-area-inset-top, 0px) + 80px)',
          left: '16px',
          right: '16px',
          zIndex: 2147483647,
          maxWidth: '540px',
          margin: '0 auto',
          background: 'linear-gradient(145deg, #0A1628, #07101E)',
          border: '2px solid #FF3D00',
          borderRadius: '24px',
          padding: '20px 24px',
          color: '#FFF',
          boxShadow: '0 20px 50px rgba(255,61,0,0.4), 0 0 30px rgba(0,0,0,0.9)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          direction: 'rtl',
          fontFamily: '"Cairo", "Tajawal", sans-serif',
          animation: 'popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}>
          {/* Header Badge */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{
              background: 'linear-gradient(90deg, #FF3D00, #FF9500)',
              color: '#FFF',
              padding: '4px 12px',
              borderRadius: '12px',
              fontSize: '0.75rem',
              fontWeight: 900,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 0 12px rgba(255,61,0,0.6)'
            }}>
              <span className="pulsing-red-dot" />
              <span>🔔 إشعار فوري من إدارة الأكاديمية</span>
            </div>
            <span style={{ fontSize: '0.72rem', color: '#8E9BAE' }}>{activeNotification.date || 'الآن'}</span>
          </div>

          {/* Title & Body */}
          <h3 style={{ color: '#FFF', fontSize: '1.15rem', fontWeight: 900, margin: '0 0 8px 0', lineHeight: 1.3 }}>
            {activeNotification.title}
          </h3>
          <p style={{ color: '#ECEFF1', fontSize: '0.9rem', margin: '0 0 16px 0', lineHeight: 1.6 }}>
            {activeNotification.body}
          </p>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleDismissAlert}
              style={{
                flex: 1,
                padding: '12px',
                background: 'linear-gradient(135deg, #00E676, #00B0FF)',
                border: 'none',
                borderRadius: '14px',
                color: '#000',
                fontWeight: 900,
                fontSize: '0.88rem',
                cursor: 'pointer',
                fontFamily: '"Cairo", "Tajawal", sans-serif'
              }}
            >
              ✅ تم القراءة والموافقة
            </button>
            <button
              onClick={handleDismissAlert}
              style={{
                padding: '12px 18px',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '14px',
                color: '#B0BEC5',
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: 'pointer',
                fontFamily: '"Cairo", "Tajawal", sans-serif'
              }}
            >
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
        @keyframes slideUpRibbon {
          0% { opacity: 0; transform: translate(-50%, 60px); }
          100% { opacity: 1; transform: translate(-50%, 0); }
        }
        .pulsing-red-dot {
          width: 8px; height: 8px; background: #FFF; border-radius: 50%;
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
