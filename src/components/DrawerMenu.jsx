import React, { useState, useEffect, createContext, useContext, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

// ─── DRAWER CONTEXT ───────────────────────────────────────────────────────────
const DrawerContext = createContext({
  isOpen: false,
  openDrawer: () => {},
  closeDrawer: () => {},
  toggleDrawer: () => {},
});
export const useDrawer = () => useContext(DrawerContext);

// ─── ROLE LABELS ──────────────────────────────────────────────────────────────
const ROLE_LABELS = {
  ar: { admin: 'مدير النظام', coach: 'مدرب', parent: 'ولي أمر', guest: 'زائر' },
  en: { admin: 'Admin', coach: 'Coach', parent: 'Parent', guest: 'Guest' },
};

const ROLE_COLORS = {
  admin: '#FF3D00',
  coach: '#FFC107',
  parent: '#00E676',
};

// ─── NAV LINKS ────────────────────────────────────────────────────────────────
function getNavLinks(currentUser, lang) {
  const ar = lang === 'ar';
  return [
    { path: '/',             icon: '🏠', label: ar ? 'الرئيسية'        : 'Home' },
    { path: '/programs',     icon: '🏋️', label: ar ? 'برامجنا'          : 'Programs' },
    { path: '/academy',      icon: '🏆', label: ar ? 'الأكاديمية'       : 'Academy' },
    { path: '/schedule',     icon: '📅', label: ar ? 'الجدول'           : 'Schedule' },
    { path: '/player-cards', icon: '⭐', label: ar ? 'بطاقات اللاعبين' : 'Player Cards' },
    {
      path: currentUser?.role === 'coach' ? '/coach-portal' : '/portal',
      icon: currentUser?.role === 'coach' ? '⚽' : '👨‍👩‍👧',
      label: currentUser?.role === 'coach'
        ? (ar ? 'تطبيق المدرب'   : 'Coach Portal')
        : (ar ? 'بوابة الأولياء' : 'Parent Portal'),
    },
    { path: '/reels', icon: '🎬', label: 'Reels' },
    ...(currentUser?.role === 'admin' || currentUser?.role === 'coach'
      ? [{ path: '/admin', icon: '🛡️', label: ar ? 'إدارة النظام' : 'Admin', adminOnly: true }]
      : []),
  ];
}

// ─── ANIMATED HAMBURGER BUTTON ────────────────────────────────────────────────
export function HamburgerButton({ style = {} }) {
  const { toggleDrawer, isOpen } = useDrawer();

  return (
    <button
      onClick={toggleDrawer}
      aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
      style={{
        width: '42px',
        height: '42px',
        minWidth: '42px',
        borderRadius: '12px',
        backgroundColor: isOpen ? 'rgba(0,230,118,0.15)' : 'rgba(255,255,255,0.08)',
        border: isOpen
          ? '1px solid rgba(0,230,118,0.45)'
          : '1px solid rgba(255,255,255,0.15)',
        color: isOpen ? '#00E676' : '#FFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        padding: 0,
        transition: 'background 0.25s ease, border-color 0.25s ease, color 0.25s ease',
        flexShrink: 0,
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
    >
      {/* Animated 3-bar → X icon */}
      <span
        style={{
          display: 'block',
          position: 'relative',
          width: '20px',
          height: '14px',
        }}
      >
        {/* Bar 1 */}
        <span style={{
          position: 'absolute',
          left: 0,
          top: isOpen ? '6px' : '0px',
          width: '20px',
          height: '2px',
          borderRadius: '2px',
          background: 'currentColor',
          transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
          transition: 'top 0.22s ease 0.08s, transform 0.22s ease, opacity 0.22s ease',
        }} />
        {/* Bar 2 (middle — fades out) */}
        <span style={{
          position: 'absolute',
          left: 0,
          top: '6px',
          width: '20px',
          height: '2px',
          borderRadius: '2px',
          background: 'currentColor',
          opacity: isOpen ? 0 : 1,
          transform: isOpen ? 'scaleX(0)' : 'scaleX(1)',
          transition: 'opacity 0.18s ease, transform 0.18s ease',
        }} />
        {/* Bar 3 */}
        <span style={{
          position: 'absolute',
          left: 0,
          top: isOpen ? '6px' : '12px',
          width: '20px',
          height: '2px',
          borderRadius: '2px',
          background: 'currentColor',
          transform: isOpen ? 'rotate(-45deg)' : 'rotate(0deg)',
          transition: 'top 0.22s ease 0.08s, transform 0.22s ease, opacity 0.22s ease',
        }} />
      </span>
    </button>
  );
}

// ─── UNDERLYING MENU CANVAS ───────────────────────────────────────────────────
function UnderlyingMenuCanvas({ currentUser, onClose, dir, lang }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { setLang } = useLanguage();
  const navLinks = getNavLinks(currentUser, lang);
  const isRTL = dir === 'rtl';

  const handleNav = (path) => { navigate(path); onClose(); };

  const handleLogout = () => {
    localStorage.removeItem('allstar_user_session');
    onClose();
    window.location.href = '/';
  };

  const labels    = ROLE_LABELS[lang] || ROLE_LABELS.en;
  const roleLabel = currentUser ? (labels[currentUser.role] || labels.guest) : labels.guest;
  const roleColor = currentUser ? (ROLE_COLORS[currentUser.role] || '#8E9BAE') : '#8E9BAE';
  const displayName  = currentUser?.name || (isRTL ? 'الزائر' : 'Guest');
  const avatarLetter = displayName.charAt(0).toUpperCase() || '?';

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        bottom: 0,
        // AR → RIGHT side;  EN → LEFT side
        ...(isRTL
          ? { right: 0, left: 'auto', width: '78vw', maxWidth: '310px' }
          : { left: 0,  right: 'auto', width: '78vw', maxWidth: '310px' }),
        background: 'linear-gradient(160deg, #0D1117 0%, #111827 50%, #0B0F17 100%)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 10,
        overflowY: 'auto',
        overflowX: 'hidden',
        fontFamily: '"Cairo", "Tajawal", sans-serif',
        /* Lock direction so global html[dir=rtl] can't bleed in */
        direction: isRTL ? 'rtl' : 'ltr',
        unicodeBidi: 'isolate',
      }}
    >
      {/* ── Header: Avatar + Name + Role ─────────────────────────── */}
      <div style={{
        padding: '52px 24px 28px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        background: 'linear-gradient(180deg, rgba(0,230,118,0.07) 0%, transparent 100%)',
        /* Row layout: avatar on correct side per language */
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: '16px',
        /* RTL → avatar on RIGHT; LTR → avatar on LEFT */
        direction: isRTL ? 'rtl' : 'ltr',
        unicodeBidi: 'isolate',
      }}>
        {/* Avatar circle — always on the physical LEFT */}
        <div style={{
          width: '64px', height: '64px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #00E676 0%, #00C853 100%)',
          border: '3px solid #00E676',
          boxShadow: '0 0 24px rgba(0,230,118,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.6rem', fontWeight: 900, color: '#03110a',
          flexShrink: 0,
          letterSpacing: '-1px',
        }}>
          {avatarLetter}
        </div>

        {/* Name + Role — text aligned per language */}
        <div style={{
          display: 'flex', flexDirection: 'column', gap: '6px',
          textAlign: isRTL ? 'right' : 'left',
          direction: isRTL ? 'rtl' : 'ltr',
          minWidth: 0,
        }}>
          {/* Display name */}
          <div style={{
            color: '#FFFFFF', fontSize: '1.05rem', fontWeight: 900,
            lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {displayName}
          </div>

          {/* Role badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: `${roleColor}1A`,
            border: `1px solid ${roleColor}55`,
            borderRadius: '20px', padding: '3px 10px',
            alignSelf: 'flex-start',
          }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: roleColor, display: 'block', flexShrink: 0 }} />
            <span style={{ fontSize: '0.76rem', fontWeight: 700, color: roleColor }}>{roleLabel}</span>
          </div>
        </div>
      </div>

      {/* ── Nav Links ─────────────────────────────────────────────── */}
      <nav style={{ flex: 1, padding: '14px 10px 8px' }}>
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
                gap: '13px',
                padding: '12px 14px',
                borderRadius: '14px',
                background: isActive ? 'rgba(0,230,118,0.1)' : 'transparent',
                border: 'none',
                // Active accent bar on the correct side
                ...(isRTL
                  ? { borderRight: isActive ? '3px solid #00E676' : '3px solid transparent' }
                  : { borderLeft:  isActive ? '3px solid #00E676' : '3px solid transparent' }),
                color: isActive ? '#00E676' : '#94A3B8',
                cursor: 'pointer',
                textAlign: isRTL ? 'right' : 'left',
                marginBottom: '3px',
                fontFamily: '"Cairo", "Tajawal", sans-serif',
                fontWeight: isActive ? 800 : 600,
                fontSize: '0.93rem',
                transition: 'all 0.18s ease',
              }}
            >
              <span style={{ fontSize: '1.15rem', flexShrink: 0 }}>{link.icon}</span>
              <span style={{ flex: 1 }}>{link.label}</span>
              {link.adminOnly && (
                <span style={{
                  background: '#FF3D0018',
                  border: '1px solid #FF3D0044',
                  color: '#FF3D00',
                  fontSize: '0.6rem', fontWeight: 800,
                  padding: '2px 7px', borderRadius: '8px',
                  flexShrink: 0,
                }}>ADMIN</span>
              )}
            </button>
          );
        })}

        {/* Divider */}
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '8px 0' }} />

        {/* Notification Center */}
        <button
          onClick={() => { navigate('/admin'); onClose(); }}
          style={{
            width: '100%',
            display: 'flex', alignItems: 'center', gap: '13px',
            padding: '12px 14px', borderRadius: '14px',
            background: 'transparent',
            border: 'none',
            ...(isRTL
              ? { borderRight: '3px solid transparent' }
              : { borderLeft:  '3px solid transparent' }),
            color: '#94A3B8', cursor: 'pointer',
            textAlign: isRTL ? 'right' : 'left', marginBottom: '3px',
            fontFamily: '"Cairo", "Tajawal", sans-serif',
            fontWeight: 600, fontSize: '0.93rem',
            transition: 'all 0.18s ease',
          }}
        >
          <span style={{ fontSize: '1.15rem', flexShrink: 0 }}>🔔</span>
          <span>{isRTL ? 'مركز الإشعارات' : 'Notifications'}</span>
        </button>

        {/* Language Switcher */}
        <button
          onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
          style={{
            width: '100%',
            display: 'flex', alignItems: 'center', gap: '13px',
            padding: '12px 14px', borderRadius: '14px',
            border: '1px solid rgba(255,193,7,0.35)',
            background: 'rgba(255,193,7,0.08)',
            color: '#FFC107', cursor: 'pointer',
            textAlign: isRTL ? 'right' : 'left',
            marginTop: '6px', marginBottom: '3px',
            fontFamily: '"Cairo", "Tajawal", sans-serif',
            fontWeight: 800, fontSize: '0.9rem',
            transition: 'all 0.18s ease',
          }}
        >
          <span style={{ fontSize: '1.15rem', flexShrink: 0 }}>🌐</span>
          <span>{lang === 'ar' ? 'EN — English (🇬🇧)' : 'AR — العربية (🇹🇳)'}</span>
        </button>
      </nav>

      {/* ── Footer: Logout ────────────────────────────────────────── */}
      <div style={{ padding: '12px 10px 28px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        {currentUser ? (
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex', alignItems: 'center', gap: '13px',
              padding: '12px 14px', borderRadius: '14px',
              border: '1px solid rgba(239,68,68,0.25)',
              background: 'rgba(239,68,68,0.08)',
              color: '#EF4444', cursor: 'pointer',
              fontFamily: '"Cairo", "Tajawal", sans-serif',
              fontWeight: 700, fontSize: '0.9rem',
              transition: 'all 0.18s ease',
              textAlign: isRTL ? 'right' : 'left',
            }}
          >
            <span style={{ fontSize: '1.15rem', flexShrink: 0 }}>🚪</span>
            <span>{isRTL ? 'تسجيل الخروج' : 'Logout'}</span>
          </button>
        ) : (
          <div style={{ fontSize: '0.75rem', color: '#374151', textAlign: 'center', padding: '8px' }}>
            {isRTL ? 'أكاديمية أولستار الرياضية 🇹🇳' : 'All-Star Sports Academy 🇹🇳'}
          </div>
        )}
        <div style={{ marginTop: '10px', fontSize: '0.68rem', color: '#2d3748', textAlign: 'center' }}>
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

  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  const openDrawer   = useCallback(() => setIsOpen(true),     []);
  const closeDrawer  = useCallback(() => setIsOpen(false),    []);
  const toggleDrawer = useCallback(() => setIsOpen(o => !o), []);

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && isOpen) closeDrawer(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, closeDrawer]);

  // ── 3D push values ─────────────────────────────────────────────
  // AR (RTL): menu RIGHT  → card slides LEFT  (negative X)
  // EN (LTR): menu LEFT   → card slides RIGHT (positive X)
  const translateX   = dir === 'rtl' ? '-72%' : '72%';
  const origin       = dir === 'rtl' ? 'right center' : 'left center';
  const cardShadow   = dir === 'rtl'
    ? '-24px 0 60px rgba(0,0,0,0.75)'
    :  '24px 0 60px rgba(0,0,0,0.75)';

  return (
    <DrawerContext.Provider value={{ isOpen, openDrawer, closeDrawer, toggleDrawer }}>
      {/*
        ┌─────────────────────────────────────────────────────────────┐
        │  STAGE — vivid green brand background, always visible       │
        │  This is what shows through around the scaled-down card.    │
        └─────────────────────────────────────────────────────────────┘
      */}
      <div
        style={{
          position: 'relative',
          width: '100vw',
          minHeight: '100vh',
          /* ★ THE GREEN STAGE ★ */
          background: isOpen
            ? 'linear-gradient(135deg, #00E676 0%, #00C853 40%, #00BFA5 100%)'
            : '#060912',
          overflow: 'hidden',
          transition: 'background 350ms cubic-bezier(0.32,0.72,0,1)',
        }}
      >
        {/* ─── Dark menu canvas, sits on top of green stage, behind the card ── */}
        <UnderlyingMenuCanvas
          currentUser={currentUser}
          onClose={closeDrawer}
          dir={dir}
          lang={lang}
        />

        {/* ─── Main App Card (scales + slides to reveal menu) ──────────── */}
        <div
          ref={wrapperRef}
          onClick={isOpen ? closeDrawer : undefined}
          style={{
            position: 'relative',
            zIndex: 20,
            minHeight: '100vh',
            width: '100%',
            background: '#060912',
            transformOrigin: origin,
            borderRadius: isOpen ? '28px' : '0px',
            boxShadow: isOpen ? cardShadow : 'none',
            overflow: isOpen ? 'hidden' : 'visible',
            transform: isOpen
              ? `scale(0.84) translateX(${translateX})`
              : 'scale(1) translateX(0)',
            transition: [
              'transform 320ms cubic-bezier(0.32,0.72,0,1)',
              'border-radius 320ms cubic-bezier(0.32,0.72,0,1)',
              'box-shadow 320ms cubic-bezier(0.32,0.72,0,1)',
            ].join(', '),
            cursor: isOpen ? 'pointer' : 'default',
            // Disable interaction with content while drawer is open
            // (tap anywhere on card to close)
            pointerEvents: isOpen ? 'none' : 'auto',
            willChange: 'transform, border-radius',
          }}
        >
          {/* Re-enable pointer events for actual content when closed */}
          <div style={{ pointerEvents: 'auto' }}>
            {children}
          </div>
        </div>
      </div>
    </DrawerContext.Provider>
  );
}
