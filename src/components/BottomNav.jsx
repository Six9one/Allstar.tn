import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  { path: '/',         icon: '🏠', label: 'الرئيسية' },
  { path: '/reels',   icon: '🎬', label: 'Reels'     },
  { path: '/schedule', icon: '📅', label: 'الجدول'   },
  { path: '/portal',  icon: '👤', label: 'بوابتي'    },
];

// Hide bottom nav on admin page
const HIDDEN_PATHS = ['/admin', '/coach-portal'];

export default function BottomNav() {
  const location = useLocation();

  if (HIDDEN_PATHS.some(p => location.pathname.startsWith(p))) return null;

  return (
    <>
      <style>{`
        .bottom-nav-item { transition: all 0.2s ease; }
        .bottom-nav-item:active { transform: scale(0.92); }
        .bnav-dot {
          width: 4px; height: 4px; border-radius: 50%;
          background: #FFC107; margin: 3px auto 0;
          transition: opacity 0.2s;
        }
      `}</style>

      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 99990,
        background: 'rgba(8, 9, 12, 0.96)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'stretch',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        boxShadow: '0 -8px 32px rgba(0,0,0,0.6)',
      }}>
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className="bottom-nav-item"
            style={({ isActive }) => ({
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              padding: '10px 0 8px',
              textDecoration: 'none',
              color: isActive ? '#FFC107' : '#4A5A70',
              fontFamily: '"Cairo", "Tajawal", sans-serif',
              fontSize: '0.65rem', fontWeight: isActive ? 800 : 600,
              gap: '2px',
              position: 'relative',
            })}
          >
            {({ isActive }) => (
              <>
                <span style={{
                  fontSize: '1.3rem', lineHeight: 1,
                  filter: isActive ? 'drop-shadow(0 0 6px rgba(255,193,7,0.7))' : 'none',
                  transition: 'filter 0.2s',
                }}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
                <span className="bnav-dot" style={{ opacity: isActive ? 1 : 0 }} />
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </>
  );
}
