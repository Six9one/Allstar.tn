import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../services/notifications';
import logoLight from '../assets/logo-light.png';
import logoBadge from '../assets/logo-badge.jpg';

const DEFAULT_HD_LOGO = logoLight || logoBadge || '/icon.png';

export default function PushNotificationBanner() {
  const [activeNotification, setActiveNotification] = useState(null);
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);
  const [permissionState, setPermissionState] = useState('default');
  const [isRequesting, setIsRequesting] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [notifConfig, setNotifConfig] = useState(() => notificationService.getNotificationConfig());
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
      if (!latest) return;

      setActiveNotification(latest);

      // Play configured sound (Tri-Tone, Whistle, Crystal, or Custom MP3)
      const currentConfig = notificationService.getNotificationConfig();
      setNotifConfig(currentConfig);
      notificationService.playConfiguredSound(currentConfig);

      // Trigger subtle haptic vibration on phone
      if ('vibrate' in navigator) {
        try {
          navigator.vibrate([40, 60, 40]);
        } catch {
          // Ignore
        }
      }

      // Auto dismiss after 8 seconds like native iOS banner
      if (autoDismissTimerRef.current) clearTimeout(autoDismissTimerRef.current);
      autoDismissTimerRef.current = setTimeout(() => {
        setActiveNotification(null);
      }, 8000);
    };

    // 1. Direct Instant Event Listener (0ms)
    const unsubReceive = notificationService.onReceive((notif) => {
      handleNewNotification(notif);
    });

    // 2. Storage / Cloud Polling check
    const checkUnread = () => {
      const allNotifs = notificationService.getNotifications();
      const latest = allNotifs.find((n) => !n.dismissed && !n.read && n.id.startsWith('notif-'));
      if (latest && (!activeNotification || activeNotification.id !== latest.id)) {
        handleNewNotification(latest);
      }
      setNotifConfig(notificationService.getNotificationConfig());
    };

    const unsubscribe = notificationService.subscribe(() => {
      checkUnread();
    });

    const handleStorage = (e) => {
      if (e.key === 'allstar_notifications_list' || e.key === 'allstar_notification_config') {
        checkUnread();
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      unsubReceive();
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
        notificationService.playConfiguredSound(notifConfig);
      } else if ('Notification' in window) {
        setPermissionState(Notification.permission);
      }
    } catch (e) {
      console.warn('Permission request error:', e);
    } finally {
      setIsRequesting(false);
    }
  };

  const bannerLogo = activeNotification?.logo_url || notifConfig?.logoUrl || DEFAULT_HD_LOGO;
  const appTitle = activeNotification?.app_title || notifConfig?.appTitle || 'ALL-STAR SPORTS ACADEMY';
  const appSubtitle = activeNotification?.app_subtitle || notifConfig?.appSubtitle || 'أكاديمية أولستار تطاوين 🇹🇳';

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
            zIndex: 2147483647,
            background: 'rgba(14, 20, 32, 0.96)',
            backdropFilter: 'blur(35px)',
            WebkitBackdropFilter: 'blur(35px)',
            borderRadius: '26px',
            border: '1.5px solid rgba(255, 193, 7, 0.45)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.9), 0 0 30px rgba(255, 193, 7, 0.3)',
            padding: '14px 18px',
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
          {/* Top Row: Crisp HD App Badge + Title + Time */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.25), rgba(0, 0, 0, 0.8))',
                  border: '1.5px solid #FFC107',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 10px rgba(255, 193, 7, 0.4)',
                  overflow: 'hidden',
                  flexShrink: 0,
                }}
              >
                <img
                  src={bannerLogo}
                  alt="All-Star Logo"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    imageRendering: '-webkit-optimize-contrast',
                  }}
                />
              </div>
              <div>
                <span
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 900,
                    color: '#FFC107',
                    letterSpacing: '0.4px',
                    display: 'block',
                    lineHeight: 1.2,
                  }}
                >
                  {appTitle}
                </span>
                <span style={{ fontSize: '0.68rem', color: '#90A4AE', fontWeight: 600 }}>{appSubtitle}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.7rem', color: '#8E9BAE', fontWeight: 700 }}>الآن • Now</span>
              <button
                type="button"
                onClick={handleDismissAlert}
                style={{
                  background: 'rgba(255, 255, 255, 0.12)',
                  border: 'none',
                  color: '#CFD8DC',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'background 0.2s',
                }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Main Notification Content */}
          <div style={{ paddingRight: '4px' }}>
            <h4
              style={{
                fontSize: '1.02rem',
                fontWeight: 900,
                color: '#FFFFFF',
                margin: '0 0 4px 0',
                lineHeight: 1.35,
              }}
            >
              {activeNotification.title}
            </h4>
            <p
              style={{
                fontSize: '0.86rem',
                color: '#ECEFF1',
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              {activeNotification.body}
            </p>

            {/* Rich Media Banner Image inside Notification */}
            {(activeNotification.image_url || activeNotification.imageUrl || activeNotification.image) && (
              <div
                style={{
                  marginTop: '10px',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  maxHeight: '180px',
                  width: '100%',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
                }}
              >
                <img
                  src={activeNotification.image_url || activeNotification.imageUrl || activeNotification.image}
                  alt="Notification Attachment"
                  style={{
                    width: '100%',
                    height: '100%',
                    maxHeight: '180px',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            )}
          </div>

          {/* Swipe indicator bar at bottom */}
          <div
            style={{
              width: '38px',
              height: '4px',
              borderRadius: '2px',
              background: 'rgba(255, 255, 255, 0.3)',
              margin: '10px auto 0 auto',
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
            borderRadius: '24px',
            padding: '18px 20px',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #FFC107, #FF9500)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.45rem',
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
              <h4 style={{ color: '#FFFFFF', fontSize: '1rem', fontWeight: 900, margin: 0 }}>
                تفعيل إشعارات أكاديمية أولستار على هاتفك
              </h4>
              <p style={{ color: '#B0BEC5', fontSize: '0.8rem', margin: '2px 0 0 0', lineHeight: 1.35 }}>
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
                padding: '12px',
                borderRadius: '14px',
                fontWeight: 900,
                cursor: isRequesting ? 'wait' : 'pointer',
                fontSize: '0.9rem',
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
                padding: '12px 16px',
                borderRadius: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: '0.84rem',
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
            transform: translate(-50%, -45px) scale(0.92);
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
