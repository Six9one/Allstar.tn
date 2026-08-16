import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../services/notifications';
import logoBadge from '../assets/logo-badge.jpg';

export default function PushNotificationBanner() {
  const [activeNotification, setActiveNotification] = useState(null);
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);
  const [permissionState, setPermissionState] = useState('default');
  const [isRequesting, setIsRequesting] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const autoDismissTimerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Detect PWA standalone mode
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true ||
      document.referrer.includes('android-app://');
    setIsStandalone(standalone);

    if ('Notification' in window) {
      setPermissionState(Notification.permission);
      if (Notification.permission === 'default') {
        setShowPermissionPrompt(true);
      }
    }
  }, []);

  useEffect(() => {
    const handleNewNotification = (latest) => {
      if (!latest || latest.read || latest.dismissed) return;

      setActiveNotification(latest);

      // Trigger subtle haptic vibration if supported on phone
      if ('vibrate' in navigator) {
        try {
          navigator.vibrate([40, 60, 40]);
        } catch {
          // Ignore
        }
      }

      // Auto dismiss after 7 seconds like native iOS banner
      if (autoDismissTimerRef.current) clearTimeout(autoDismissTimerRef.current);
      autoDismissTimerRef.current = setTimeout(() => {
        setActiveNotification(null);
      }, 7000);
    };

    const checkUnread = () => {
      const allNotifs = notificationService.getNotifications();
      const latest = allNotifs.find((n) => !n.dismissed && !n.read);
      if (latest && (!activeNotification || activeNotification.id !== latest.id)) {
        handleNewNotification(latest);
      }
    };

    checkUnread();
    const unsubscribe = notificationService.subscribe(() => {
      checkUnread();
    });

    const handleStorage = (e) => {
      if (e.key === 'allstar_notifications_list') {
        checkUnread();
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      unsubscribe();
      window.removeEventListener('storage', handleStorage);
      if (autoDismissTimerRef.current) clearTimeout(autoDismissTimerRef.current);
    };
  }, [activeNotification]);

  const handleDismissAlert = (e) => {
    if (e) e.stopPropagation();
    if (activeNotification) {
      const notifs = notificationService.getNotifications().map((n) =>
        n.id === activeNotification.id ? { ...n, dismissed: true, read: true } : n
      );
      localStorage.setItem('allstar_notifications_list', JSON.stringify(notifs));
      setActiveNotification(null);
    }
  };

  const handleBannerClick = () => {
    if (!activeNotification) return;
    const targetUrl = activeNotification.target_url || activeNotification.targetUrl || '/';
    handleDismissAlert();

    if (targetUrl.startsWith('http')) {
      window.open(targetUrl, '_blank');
    } else {
      navigate(targetUrl);
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
      } else if ('Notification' in window) {
        setPermissionState(Notification.permission);
      }
    } catch (e) {
      console.warn('Permission request error:', e);
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <>
      {/* ───────────────────────────────────────────────────────────────── */}
      {/* 1. NATIVE iOS-STYLE DROP-DOWN PUSH NOTIFICATION BANNER             */}
      {/* ───────────────────────────────────────────────────────────────── */}
      {activeNotification && (
        <div
          onClick={handleBannerClick}
          style={{
            position: 'fixed',
            top: 'calc(env(safe-area-inset-top, 0px) + 10px)',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'calc(100% - 24px)',
            maxWidth: '430px',
            zIndex: 2147483647, // Above everything on screen
            background: 'rgba(16, 22, 34, 0.95)',
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
            borderRadius: '24px',
            border: '1.5px solid rgba(255, 193, 7, 0.4)',
            boxShadow: '0 16px 45px rgba(0, 0, 0, 0.85), 0 0 25px rgba(255, 193, 7, 0.25)',
            padding: '12px 16px',
            color: '#FFFFFF',
            cursor: 'pointer',
            direction: 'rtl',
            fontFamily: '"Cairo", "Tajawal", -apple-system, BlinkMacSystemFont, sans-serif',
            animation: 'iosBannerSlideDown 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
            boxSizing: 'border-box',
            userSelect: 'none',
            WebkitUserSelect: 'none',
          }}
        >
          {/* Top Row: App Badge + Title + Time */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img
                src={logoBadge}
                alt="All-Star"
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '7px',
                  border: '1px solid #FFC107',
                }}
              />
              <span
                style={{
                  fontSize: '0.74rem',
                  fontWeight: 900,
                  color: '#FFC107',
                  letterSpacing: '0.5px',
                }}
              >
                ALL-STAR SPORTS ACADEMY
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.7rem', color: '#8E9BAE', fontWeight: 600 }}>الآن • Now</span>
              <button
                type="button"
                onClick={handleDismissAlert}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  color: '#B0BEC5',
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Main Notification Content */}
          <div style={{ paddingRight: '2px' }}>
            <h4
              style={{
                fontSize: '0.98rem',
                fontWeight: 900,
                color: '#FFFFFF',
                margin: '0 0 4px 0',
                lineHeight: 1.3,
              }}
            >
              {activeNotification.title}
            </h4>
            <p
              style={{
                fontSize: '0.84rem',
                color: '#CFD8DC',
                margin: 0,
                lineHeight: 1.45,
              }}
            >
              {activeNotification.body}
            </p>
          </div>

          {/* Swipe indicator bar at bottom */}
          <div
            style={{
              width: '36px',
              height: '4px',
              borderRadius: '2px',
              background: 'rgba(255, 255, 255, 0.25)',
              margin: '8px auto 0 auto',
            }}
          />
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────── */}
      {/* 2. FLOATING BOTTOM PROMPT (ONLY IF PERMISSION IS DEFAULT)          */}
      {/* ───────────────────────────────────────────────────────────────── */}
      {showPermissionPrompt && permissionState === 'default' && (
        <div
          style={{
            position: 'fixed',
            bottom: 'calc(env(safe-area-inset-bottom, 0px) + 76px)',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'calc(100% - 32px)',
            maxWidth: '540px',
            zIndex: 2147483646,
            background: 'linear-gradient(145deg, #0A1628 0%, #060D1A 100%)',
            border: '2px solid #FFC107',
            borderRadius: '22px',
            padding: '16px 18px',
            color: '#FFF',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.95), 0 0 30px rgba(255, 193, 7, 0.35)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            direction: 'rtl',
            fontFamily: '"Cairo", "Tajawal", sans-serif',
            animation: 'slideUpRibbon 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #FFC107, #FF9500)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.4rem',
                flexShrink: 0,
                boxShadow: '0 4px 14px rgba(255,193,7,0.4)',
              }}
            >
              🔔
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: 'inline-block',
                  background: 'rgba(255,193,7,0.2)',
                  color: '#FFC107',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  marginBottom: '2px',
                }}
              >
                {isStandalone ? 'تطبيق الهاتف (PWA) 📱' : 'تنبيهات فورية 🔔'}
              </div>
              <h4 style={{ color: '#FFFFFF', fontSize: '0.98rem', fontWeight: 900, margin: 0 }}>
                تفعيل إشعارات أكاديمية أولستار على هاتفك
              </h4>
              <p style={{ color: '#B0BEC5', fontSize: '0.78rem', margin: '2px 0 0 0', lineHeight: 1.35 }}>
                تنبيهات التمارين، بطاقات FUT، وحالة الطقس على شاشة هاتفك فوراً!
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
                padding: '11px',
                borderRadius: '12px',
                fontWeight: 900,
                cursor: isRequesting ? 'wait' : 'pointer',
                fontSize: '0.88rem',
                fontFamily: '"Cairo", "Tajawal", sans-serif',
                boxShadow: '0 4px 14px rgba(0,230,118,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
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
                padding: '11px 16px',
                borderRadius: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: '0.82rem',
                fontFamily: '"Cairo", "Tajawal", sans-serif',
              }}
            >
              لاحقاً
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes iosBannerSlideDown {
          0% {
            opacity: 0;
            transform: translate(-50%, -40px) scale(0.92);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, 0) scale(1);
          }
        }
        @keyframes slideUpRibbon {
          0% {
            opacity: 0;
            transform: translate(-50%, 50px);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
      `}</style>
    </>
  );
}
