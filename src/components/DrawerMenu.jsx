import React, { useState, useEffect, createContext, useContext, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

// ─── DRAWER CONTEXT ───────────────────────────────────────────────────────────
const DrawerContext = createContext({ isOpen: false, openDrawer: () => {}, closeDrawer: () => {}, toggleDrawer: () => {} });
export const useDrawer = () => useContext(DrawerContext);

// ─── ROLE LABELS ──────────────────────────────────────────────────────────────
const ROLE_LABELS = {
  admin: 'مدير النظام',
  coach: 'مدرب',
  parent: 'ولي أمر',
};

const ROLE_COLORS = {
  admin: '#FF3D00',
  coach: '#FFC107',
  parent: '#00E676',
};

// ─── NAV LINKS ────────────────────────────────────────────────────────────────
function getNavLinks(currentUser) {
  return [
    { path: '/',             icon: '🏠', label: 'الرئيسية' },
    { path: '/programs',     icon: '🏋️', label: 'برامجنا' },
    { path: '/academy',      icon: '🏆', label: 'الأكاديمية' },
    { path: '/schedule',     icon: '📅', label: 'الجدول' },
    { path: '/player-cards', icon: '⭐', label: 'بطاقات اللاعبين' },
    {
      path: currentUser?.role === 'coach' ? '/coach-portal' : '/portal',
      icon: currentUser?.role === 'coach' ? '⚽' : '👨‍👩‍👧',
      label: 'بوابة الأولياء',
    },
    { path: '/reels',        icon: '🎬', label: 'Reels' },
    ...(currentUser?.role === 'admin' || currentUser?.role === 'coach'
      ? [{ path: '/admin', icon: '🛡️', label: 'إدارة النظام', adminOnly: true }]
      : []),
  ];
}

// ─── HAMBURGER BUTTON (exported for use in Navbar) ────────────────────────────
export function HamburgerButton({ style = {} }) {
  const { toggleDrawer, isOpen } = useDrawer();
  return (
    <button
      onClick={toggleDrawer}
      aria-label="Toggle navigation menu"
      style={{
        width: '42px',
        height: '42px',
        minWidth: '42px',
        borderRadius: '12px',
        backgroundColor: 'rgba(255,255,255,0.08)',
        border: '1px solid rgba(255,255,255,0.15)',
        color: '#FFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        padding: 0,
        transition: 'all 0.2s ease',
        flexShrink: 0,
        ...style,
      }}
    >
      {isOpen ? (
        <span style={{ fontSize: '1.1rem', fontWeight: 900, lineHeight: 1 }}>✕</span>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ display: 'block' }}>
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="18" x2="20" y2="18" />
        </svg>
      )}
    </button>
  );
}

// ─── UNDERLYING MENU CANVAS ───────────────────────────────────────────────────
function UnderlyingMenuCanvas({ currentUser, isOpen, onClose, dir }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { lang, setLang } = useLanguage();
  const navLinks = getNavLinks(currentUser);

  const handleNav = (path) => {
    navigate(path);
    onClose();
  };

  const handleLogout = () => {
    localStorage.removeItem('allstar_user_session');
    onClose();
    window.location.href = '/';
  };

  const roleLabel = currentUser ? (ROLE_LABELS[currentUser.role] || 'زائر') : 'زائر';
  const roleColor = currentUser ? (ROLE_COLORS[currentUser.role] || '#8E9BAE') : '#8E9BAE';
  const displayName = currentUser?.name || 'الزائر';
  const avatarLetter = displayName.charAt(0) || '؟';

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        bottom: 0,
        // RTL: Menu on right. LTR: Menu on left.
        ...(dir === 'rtl'
          ? { right: 0, left: 'auto', width: '75vw', maxWidth: '320px' }
          : { left: 0, right: 'auto', width: '75vw', maxWidth: '320px' }),
        background: 'linear-gradient(180deg, #0B0F17 0%, #111827 100%)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 10,
        overflowY: 'auto',
        fontFamily: '"Cairo", "Tajawal", sans-serif',
      }}
    >
      {/* ── Header: User Avatar ───────────────────────────────────── */}
      <div style={{
        padding: '48px 24px 28px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'linear-gradient(180deg, rgba(245,158,11,0.08) 0%, transparent 100%)',
      }}>
        {/* Avatar */}
        <div style={{
          width: '64px', height: '64px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #F59E0B, #D97706)',
          border: '3px solid #F59E0B',
          boxShadow: '0 0 20px rgba(245,158,11,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.6rem', fontWeight: 900, color: '#0B0F17',
          marginBottom: '14px',
        }}>
          {avatarLetter}
        </div>
        {/* Name */}
        <div style={{ color: '#FFF', fontSize: '1.05rem', fontWeight: 900, lineHeight: 1.3, direction: 'rtl' }}>
          {displayName}
        </div>
        {/* Role Tag */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '5px',
          background: `${roleColor}18`,
          border: `1px solid ${roleColor}55`,
          borderRadius: '20px', padding: '3px 10px', marginTop: '6px',
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: roleColor, display: 'block' }} />
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: roleColor }}>{roleLabel}</span>
        </div>
      </div>

      {/* ── Nav Links ─────────────────────────────────────────────── */}
      <nav style={{ flex: 1, padding: '16px 12px', direction: 'rtl' }}>
        {navLinks.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <button
              key={link.path}
              onClick={() => handleNav(link.path)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '13px 16px',
                borderRadius: '14px',
                border: 'none',
                background: isActive ? 'rgba(245,158,11,0.12)' : 'transparent',
                borderRight: isActive ? '3px solid #F59E0B' : '3px solid transparent',
                color: isActive ? '#F59E0B' : '#94A3B8',
                cursor: 'pointer',
                textAlign: 'right',
                marginBottom: '4px',
                fontFamily: '"Cairo", "Tajawal", sans-serif',
                fontWeight: isActive ? 800 : 600,
                fontSize: '0.95rem',
                transition: 'all 0.18s ease',
              }}
            >
              <span style={{ fontSize: '1.1rem' }}>{link.icon}</span>
              <span>{link.label}</span>
              {link.adminOnly && (
                <span style={{
                  marginRight: 'auto', marginLeft: 0,
                  background: '#FF3D0018',
                  border: '1px solid #FF3D0044',
                  color: '#FF3D00',
                  fontSize: '0.65rem', fontWeight: 800,
                  padding: '2px 7px', borderRadius: '8px',
                }}>ADMIN</span>
              )}
            </button>
          );
        })}

        {/* Notification Center */}
        <button
          onClick={() => { navigate('/admin'); onClose(); }}
          style={{
            width: '100%',
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '13px 16px', borderRadius: '14px',
            border: 'none', background: 'transparent',
            borderRight: '3px solid transparent',
            color: '#94A3B8', cursor: 'pointer',
            textAlign: 'right', marginBottom: '4px',
            fontFamily: '"Cairo", "Tajawal", sans-serif',
            fontWeight: 600, fontSize: '0.95rem',
            transition: 'all 0.18s ease',
          }}
        >
          <span style={{ fontSize: '1.1rem' }}>🔔</span>
          <span>مركز الإشعارات</span>
        </button>

        {/* Language Switcher */}
        <button
          onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
          style={{
            width: '100%',
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '13px 16px', borderRadius: '14px',
            border: '1px solid rgba(255, 193, 7, 0.4)',
            background: 'rgba(255, 193, 7, 0.1)',
            color: '#FFC107', cursor: 'pointer',
            textAlign: lang === 'ar' ? 'right' : 'left', marginTop: '8px', marginBottom: '4px',
            fontFamily: '"Cairo", "Tajawal", sans-serif',
            fontWeight: 800, fontSize: '0.92rem',
            transition: 'all 0.18s ease',
          }}
        >
          <span style={{ fontSize: '1.1rem' }}>🌐</span>
          <span>{lang === 'ar' ? 'EN — English (🇬🇧)' : 'AR — العربية (🇹🇳)'}</span>
        </button>
      </nav>

      {/* ── Bottom: Logout ────────────────────────────────────────── */}
      <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.06)', direction: 'rtl' }}>
        {currentUser ? (
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '12px 16px', borderRadius: '14px',
              border: '1px solid rgba(239,68,68,0.25)',
              background: 'rgba(239,68,68,0.08)',
              color: '#EF4444', cursor: 'pointer',
              fontFamily: '"Cairo", "Tajawal", sans-serif',
              fontWeight: 700, fontSize: '0.9rem',
              transition: 'all 0.18s ease',
            }}
          >
            <span>🚪</span>
            <span>تسجيل الخروج</span>
          </button>
        ) : (
          <div style={{ fontSize: '0.75rem', color: '#4B5563', textAlign: 'center', padding: '8px' }}>
            أكاديمية أولستار الرياضية 🇹🇳
          </div>
        )}
        <div style={{
          marginTop: '12px',
          fontSize: '0.7rem', color: '#374151', textAlign: 'center',
        }}>
          ALL-STAR SPORTS ACADEMY · v2.0
        </div>
      </div>
    </div>
  );
}

// ─── DRAWER ROOT (WRAPS ENTIRE APP) ──────────────────────────────────────────
export default function DrawerRoot({ children, currentUser }) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);
  const { lang } = useLanguage();

  // Detect document direction (RTL Arabic default for this app)
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  const openDrawer = useCallback(() => setIsOpen(true), []);
  const closeDrawer = useCallback(() => setIsOpen(false), []);
  const toggleDrawer = useCallback(() => setIsOpen(o => !o), []);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) closeDrawer();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeDrawer]);

  // ── Transform values per direction ──────────────────────────────
  // RTL (Arabic): menu on right, app slides LEFT
  // LTR (English/French): menu on left, app slides RIGHT
  const translateValue = dir === 'rtl' ? '-72%' : '72%';
  const originValue = dir === 'rtl' ? 'right center' : 'left center';
  const shadowValue = dir === 'rtl'
    ? '-20px 0 50px rgba(0,0,0,0.6)'
    : '20px 0 50px rgba(0,0,0,0.6)';

  return (
    <DrawerContext.Provider value={{ isOpen, openDrawer, closeDrawer, toggleDrawer }}>
      <div
        style={{
          position: 'relative',
          width: '100vw',
          minHeight: '100vh',
          background: '#0B0F17',
          overflow: 'hidden',
        }}
      >
        {/* ─── Underlying Menu Canvas (fixed behind main screen) ──── */}
        <UnderlyingMenuCanvas
          currentUser={currentUser}
          isOpen={isOpen}
          onClose={closeDrawer}
          dir={dir}
        />

        {/* ─── Main App Content Wrapper (scales + slides on open) ─── */}
        <div
          ref={wrapperRef}
          onClick={isOpen ? closeDrawer : undefined}
          style={{
            position: 'relative',
            zIndex: 20,
            minHeight: '100vh',
            width: '100%',
            background: '#060912',
            transformOrigin: originValue,
            borderRadius: isOpen ? '28px' : '0px',
            boxShadow: isOpen ? shadowValue : 'none',
            overflow: isOpen ? 'hidden' : 'visible',
            // 3D scale + translate with smooth easing
            transform: isOpen
              ? `scale(0.84) translateX(${translateValue})`
              : 'scale(1) translateX(0)',
            transition: 'transform 300ms cubic-bezier(0.32,0.72,0,1), border-radius 300ms cubic-bezier(0.32,0.72,0,1), box-shadow 300ms cubic-bezier(0.32,0.72,0,1)',
            cursor: isOpen ? 'pointer' : 'default',
            // Prevent scrolling on main wrapper while drawer is open
            pointerEvents: isOpen ? 'none' : 'auto',
          }}
        >
          {/* Restore pointer events for the children themselves when closed */}
          <div style={{ pointerEvents: 'auto' }}>
            {children}
          </div>
        </div>
      </div>

      {/* ── Global Drawer Styles ───────────────────────────────────── */}
      <style>{`
        @media (min-width: 768px) {
          /* On desktop, drawer is purely cosmetic — hide it */
          .drawer-mobile-only { display: none !important; }
        }
      `}</style>
    </DrawerContext.Provider>
  );
}
