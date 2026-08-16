import React, { useState, useEffect } from 'react';
import { notificationService } from '../services/notifications';
import logoBadge from '../assets/logo-badge.jpg';

export default function PWAInstalledNotificationModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // 1. Check if running in standalone PWA mode (from Home Screen icon)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true ||
      document.referrer.includes('android-app://');

    const checkPermissionAndShow = () => {
      if ('Notification' in window) {
        if (Notification.permission === 'default' || Notification.permission !== 'granted') {
          // If in standalone mode on Home screen, show modal
          if (isStandalone) {
            setIsOpen(true);
          }
        }
      } else if (isStandalone) {
        // Fallback on iOS WebKit standalone
        setIsOpen(true);
      }
    };

    checkPermissionAndShow();

    // 2. Listen for 'appinstalled' event (when Android/Chrome finishes adding to home screen)
    const handleAppInstalled = () => {
      console.log('🎉 App was installed to home screen!');
      setTimeout(() => {
        setIsOpen(true);
      }, 500);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  if (!isOpen) return null;

  const handleAuthorize = async () => {
    setIsRequesting(true);
    try {
      const granted = await notificationService.requestPermission();
      if (granted) {
        setIsSuccess(true);
        // Show immediate test native push
        notificationService.showNativePush(
          '🎉 مرحباً بك في تطبيق أولستار!',
          'تم تفعيل إشعارات الهاتف بنجاح. ستصلك التنبيهات المباشرة فوراً.'
        );
        setTimeout(() => {
          setIsOpen(false);
        }, 1800);
      } else {
        setIsOpen(false);
      }
    } catch (e) {
      console.warn('Notification permission error:', e);
      setIsOpen(false);
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2147483647, // Above everything
        background: 'rgba(4, 7, 15, 0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        direction: 'rtl',
        fontFamily: '"Cairo", "Tajawal", sans-serif',
        animation: 'pwaModalFadeIn 0.35s ease-out',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          background: 'linear-gradient(145deg, #0C1526 0%, #060A13 100%)',
          borderRadius: '28px',
          border: '2px solid #FFC107',
          boxShadow: '0 25px 70px rgba(0,0,0,0.95), 0 0 40px rgba(255, 193, 7, 0.35)',
          padding: '32px 26px',
          textAlign: 'center',
          color: '#FFFFFF',
          position: 'relative',
          boxSizing: 'border-box',
          animation: 'pwaModalPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        }}
      >
        {/* Top Floating Badge & Icon */}
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: '18px' }}>
          <img
            src={logoBadge}
            alt="All-Star Logo"
            style={{
              width: '74px',
              height: '74px',
              borderRadius: '50%',
              border: '3px solid #FFC107',
              boxShadow: '0 8px 25px rgba(255,193,7,0.5)',
              display: 'block',
              margin: '0 auto',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-6px',
              right: '-6px',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #00E676, #00B0FF)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1rem',
              border: '2px solid #0C1526',
              boxShadow: '0 2px 10px rgba(0,0,0,0.6)',
            }}
          >
            🔔
          </div>
        </div>

        {/* Header Titles */}
        <div style={{
          display: 'inline-block',
          background: 'rgba(255,193,7,0.15)',
          color: '#FFC107',
          padding: '4px 14px',
          borderRadius: '999px',
          fontSize: '0.78rem',
          fontWeight: 900,
          marginBottom: '10px',
        }}>
          تطبيق الهاتف الرسمي — PWA 🇹🇳
        </div>

        <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#FFFFFF', margin: '0 0 8px 0', lineHeight: 1.3 }}>
          {isSuccess ? '✅ تم تفعيل الإشعارات بنجاح!' : 'تفعيل إشعارات الأكاديمية على هاتفك'}
        </h2>

        <p style={{ color: '#B0BEC5', fontSize: '0.88rem', margin: '0 0 24px 0', lineHeight: 1.6 }}>
          {isSuccess
            ? 'ستصلك التنبيهات المباشرة ومواعيد التمارين والطقس فور صدورها.'
            : 'للحصول على تنبيهات التمارين الفورية، بطاقات FUT، وحالة الطقس على شاشة هاتفك مباشرة، يرجى السماح بتفعيل الإشعارات.'}
        </p>

        {/* Action Buttons */}
        {!isSuccess ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={handleAuthorize}
              disabled={isRequesting}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #00E676 0%, #00B0FF 100%)',
                border: 'none',
                color: '#08090C',
                fontWeight: 900,
                fontSize: '1.05rem',
                cursor: isRequesting ? 'wait' : 'pointer',
                fontFamily: '"Cairo", "Tajawal", sans-serif',
                boxShadow: '0 6px 25px rgba(0, 230, 118, 0.45)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                transition: 'all 0.2s ease',
              }}
            >
              {isRequesting ? (
                <>
                  <div
                    style={{
                      width: '22px',
                      height: '22px',
                      border: '3px solid rgba(0,0,0,0.3)',
                      borderTopColor: '#000',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite',
                    }}
                  />
                  <span>جاري تفعيل الإشعارات...</span>
                </>
              ) : (
                <>
                  <span>🔔</span>
                  <span>تفعيل الإشعارات الآن (Allow Notifications)</span>
                </>
              )}
            </button>

            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#78909C',
                padding: '10px',
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: '"Cairo", "Tajawal", sans-serif',
              }}
            >
              تخطي والمتابعة للتطبيق ←
            </button>
          </div>
        ) : (
          <div
            style={{
              padding: '14px',
              borderRadius: '14px',
              background: 'rgba(0, 230, 118, 0.15)',
              border: '1.5px solid #00E676',
              color: '#00E676',
              fontWeight: 900,
              fontSize: '0.95rem',
            }}
          >
            🚀 جاري فتح التطبيق...
          </div>
        )}
      </div>

      <style>{`
        @keyframes pwaModalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pwaModalPop {
          from { opacity: 0; transform: scale(0.85) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
