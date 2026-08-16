import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const NAV_ITEMS = [
  { path: '/',         icon: '🏠', labelAr: 'الرئيسية',           labelEn: 'Home' },
  { path: '/reels',    icon: '🎬', labelAr: 'Reels',              labelEn: 'Reels' },
  { path: '/schedule', icon: '📅', labelAr: 'الجدول',             labelEn: 'Schedule' },
  { path: '/portal',   icon: '⭐', labelAr: 'بوابتي',             labelEn: 'My Portal' },
];

// Hide bottom nav on admin and fullscreen reels page
const HIDDEN_PATHS = ['/admin', '/coach-portal', '/reels'];

export default function BottomNav() {
  const location = useLocation();
  const { lang } = useLanguage();
  const isRTL = lang === 'ar';

  if (HIDDEN_PATHS.some(p => location.pathname.startsWith(p))) return null;

  return (
    <>
      <style>{`
        .bottom-nav-item {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }
        .bottom-nav-item:active {
          transform: scale(0.92);
        }
        .bnav-dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #F59E0B;
          box-shadow: 0 0 6px #F59E0B;
          margin: 2px auto 0;
          transition: opacity 0.2s ease, transform 0.2s ease;
        }
      `}</style>

      <nav
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          height: 'calc(4rem + env(safe-area-inset-bottom, 0px))',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          backgroundColor: 'rgba(11, 15, 23, 0.95)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.10)',
          boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'stretch',
          justifyContent: 'space-around',
          direction: isRTL ? 'rtl' : 'ltr',
          boxSizing: 'border-box',
        }}
      >
        {NAV_ITEMS.map((item) => {
          const label = isRTL ? item.labelAr : item.labelEn;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className="bottom-nav-item"
              style={({ isActive }) => ({
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px 0',
                textDecoration: 'none',
                color: isActive ? '#F59E0B' : '#8E9BAE',
                fontFamily: '"Cairo", "Tajawal", sans-serif',
                fontSize: '0.72rem',
                fontWeight: isActive ? 800 : 600,
                gap: '2px',
                position: 'relative',
              })}
            >
              {({ isActive }) => (
                <>
                  <span
                    style={{
                      fontSize: '1.35rem',
                      lineHeight: 1,
                      filter: isActive ? 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.75))' : 'none',
                      transition: 'filter 0.2s ease, transform 0.2s ease',
                      transform: isActive ? 'translateY(-1px)' : 'none',
                    }}
                  >
                    {item.icon}
                  </span>
                  <span style={{ letterSpacing: isRTL ? '0' : '-0.2px' }}>{label}</span>
                  <span
                    className="bnav-dot"
                    style={{
                      opacity: isActive ? 1 : 0,
                      transform: isActive ? 'scale(1)' : 'scale(0.5)',
                    }}
                  />
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </>
  );
}
