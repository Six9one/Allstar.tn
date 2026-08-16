import React, { useState, useEffect, createContext, useContext, useCallback, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'

// ─── DRAWER CONTEXT ───────────────────────────────────────────────────────────
const DrawerContext = createContext({
  isOpen: false,
  openDrawer: () => {},
  closeDrawer: () => {},
  toggleDrawer: () => {},
})

export const useDrawer = () => useContext(DrawerContext)

// ─── ROLE LABELS ──────────────────────────────────────────────────────────────
const ROLE_LABELS = {
  ar: { admin: 'مدير النظام', coach: 'مدرب', parent: 'ولي أمر', guest: 'زائر' },
  en: { admin: 'Admin', coach: 'Coach', parent: 'Parent', guest: 'Guest' },
}

const ROLE_COLORS = {
  admin: '#FF3D00',
  coach: '#FFC107',
  parent: '#00E676',
  guest: '#8E9BAE',
}

// ─── NAV LINKS ────────────────────────────────────────────────────────────────
function getNavLinks(currentUser, lang) {
  const ar = lang === 'ar'
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
  ]
}

// ─── ANIMATED HAMBURGER BUTTON ────────────────────────────────────────────────
export function HamburgerButton({ style = {} }) {
  const { toggleDrawer, isOpen } = useDrawer()

  return (
    <button
      onClick={toggleDrawer}
      type="button"
      aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
      style={{
        width: '38px',
        height: '38px',
        minWidth: '38px',
        borderRadius: '10px',
        backgroundColor: isOpen ? 'rgba(0, 230, 118, 0.15)' : 'rgba(255, 255, 255, 0.08)',
        border: isOpen
          ? '1px solid rgba(0, 230, 118, 0.45)'
          : '1px solid rgba(255, 255, 255, 0.15)',
        color: isOpen ? '#00E676' : '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        padding: 0,
        transition: 'all 0.2s ease',
        flexShrink: 0,
        position: 'relative',
        ...style,
      }}
    >
      <span
        style={{
          display: 'block',
          position: 'relative',
          width: '18px',
          height: '14px',
        }}
      >
        {/* Bar 1 */}
        <span
          style={{
            position: 'absolute',
            left: 0,
            top: isOpen ? '6px' : '0px',
            width: '18px',
            height: '2px',
            borderRadius: '2px',
            backgroundColor: 'currentColor',
            transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
            transition: 'top 0.2s ease, transform 0.2s ease',
          }}
        />
        {/* Bar 2 */}
        <span
          style={{
            position: 'absolute',
            left: 0,
            top: '6px',
            width: '18px',
            height: '2px',
            borderRadius: '2px',
            backgroundColor: 'currentColor',
            opacity: isOpen ? 0 : 1,
            transform: isOpen ? 'scaleX(0)' : 'scaleX(1)',
            transition: 'opacity 0.15s ease, transform 0.15s ease',
          }}
        />
        {/* Bar 3 */}
        <span
          style={{
            position: 'absolute',
            left: 0,
            top: isOpen ? '6px' : '12px',
            width: '18px',
            height: '2px',
            borderRadius: '2px',
            backgroundColor: 'currentColor',
            transform: isOpen ? 'rotate(-45deg)' : 'rotate(0deg)',
            transition: 'top 0.2s ease, transform 0.2s ease',
          }}
        />
      </span>
    </button>
  )
}

// ─── UNDERLYING MENU CANVAS (REVEALED BEHIND SCALED CARD) ─────────────────────
function UnderlyingMenuCanvas({ currentUser, onClose, dir, lang, isOpen }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { setLang } = useLanguage()
  const navLinks = getNavLinks(currentUser, lang)
  const isRTL = dir === 'rtl'

  const handleNav = (path) => {
    navigate(path)
    onClose()
  }

  const handleLogout = () => {
    localStorage.removeItem('allstar_user_session')
    onClose()
    window.location.href = '/'
  }

  const labels = ROLE_LABELS[lang] || ROLE_LABELS.en
  const roleLabel = currentUser ? (labels[currentUser.role] || labels.guest) : labels.guest
  const roleColor = currentUser ? (ROLE_COLORS[currentUser.role] || '#8E9BAE') : '#8E9BAE'
  const displayName = currentUser?.name || (isRTL ? 'الزائر' : 'Guest')
  const avatarLetter = displayName.charAt(0).toUpperCase() || '?'

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        bottom: 0,
        ...(isRTL
          ? { right: 0, left: 'auto', width: '78vw', maxWidth: '310px' }
          : { left: 0, right: 'auto', width: '78vw', maxWidth: '310px' }),
        background: 'linear-gradient(160deg, #0D1117 0%, #111827 50%, #0B0F17 100%)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 10,
        overflowY: 'auto',
        overflowX: 'hidden',
        fontFamily: '"Cairo", "Tajawal", sans-serif',
        direction: isRTL ? 'rtl' : 'ltr',
        visibility: isOpen ? 'visible' : 'hidden',
        pointerEvents: isOpen ? 'auto' : 'none',
        transition: 'visibility 0.3s ease',
      }}
    >
      {/* ── Header: Avatar + Name + Role ─────────────────────────── */}
      <div
        style={{
          padding: 'calc(env(safe-area-inset-top, 0px) + 28px) 20px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'linear-gradient(180deg, rgba(0, 230, 118, 0.08) 0%, transparent 100%)',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '14px',
          direction: isRTL ? 'rtl' : 'ltr',
        }}
      >
        {/* Avatar circle */}
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #00E676 0%, #00C853 100%)',
            border: '2.5px solid #00E676',
            boxShadow: '0 0 20px rgba(0, 230, 118, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.45rem',
            fontWeight: 900,
            color: '#03110A',
            flexShrink: 0,
          }}
        >
          {avatarLetter}
        </div>

        {/* Name + Role */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            textAlign: isRTL ? 'right' : 'left',
            direction: isRTL ? 'rtl' : 'ltr',
            minWidth: 0,
            flex: 1,
          }}
        >
          <div
            style={{
              color: '#FFFFFF',
              fontSize: '1rem',
              fontWeight: 800,
              lineHeight: 1.3,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {displayName}
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              background: `${roleColor}1A`,
              border: `1px solid ${roleColor}55`,
              borderRadius: '16px',
              padding: '2px 8px',
              alignSelf: 'flex-start',
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: roleColor,
                display: 'block',
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: roleColor }}>
              {roleLabel}
            </span>
          </div>
        </div>
      </div>

      {/* ── Nav Links ─────────────────────────────────────────────── */}
      <nav style={{ flex: 1, padding: '14px 10px 8px' }}>
        {navLinks.map((link) => {
          const isActive = location.pathname === link.path
          return (
            <button
              key={link.path}
              onClick={() => handleNav(link.path)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '11px 14px',
                borderRadius: '12px',
                background: isActive ? 'rgba(0, 230, 118, 0.12)' : 'transparent',
                border: 'none',
                ...(isRTL
                  ? { borderRight: isActive ? '3px solid #00E676' : '3px solid transparent' }
                  : { borderLeft: isActive ? '3px solid #00E676' : '3px solid transparent' }),
                color: isActive ? '#00E676' : '#94A3B8',
                cursor: 'pointer',
                textAlign: isRTL ? 'right' : 'left',
                marginBottom: '3px',
                fontFamily: '"Cairo", "Tajawal", sans-serif',
                fontWeight: isActive ? 800 : 600,
                fontSize: '0.92rem',
                transition: 'all 0.18s ease',
              }}
            >
              <span style={{ fontSize: '1.15rem', flexShrink: 0 }}>{link.icon}</span>
              <span style={{ flex: 1 }}>{link.label}</span>
              {link.adminOnly && (
                <span
                  style={{
                    background: '#FF3D0018',
                    border: '1px solid #FF3D0044',
                    color: '#FF3D00',
                    fontSize: '0.6rem',
                    fontWeight: 800,
                    padding: '2px 6px',
                    borderRadius: '6px',
                    flexShrink: 0,
                  }}
                >
                  ADMIN
                </span>
              )}
            </button>
          )
        })}

        {/* Divider */}
        <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.06)', margin: '8px 0' }} />

        {/* Notification Center */}
        <button
          onClick={() => handleNav('/admin')}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '11px 14px',
            borderRadius: '12px',
            background: 'transparent',
            border: 'none',
            color: '#94A3B8',
            cursor: 'pointer',
            textAlign: isRTL ? 'right' : 'left',
            marginBottom: '3px',
            fontFamily: '"Cairo", "Tajawal", sans-serif',
            fontWeight: 600,
            fontSize: '0.92rem',
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
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '11px 14px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 193, 7, 0.35)',
            background: 'rgba(255, 193, 7, 0.08)',
            color: '#FFC107',
            cursor: 'pointer',
            textAlign: isRTL ? 'right' : 'left',
            marginTop: '6px',
            marginBottom: '3px',
            fontFamily: '"Cairo", "Tajawal", sans-serif',
            fontWeight: 800,
            fontSize: '0.88rem',
            transition: 'all 0.18s ease',
          }}
        >
          <span style={{ fontSize: '1.15rem', flexShrink: 0 }}>🌐</span>
          <span>{lang === 'ar' ? 'EN — English (🇬🇧)' : 'AR — العربية (🇹🇳)'}</span>
        </button>
      </nav>

      {/* ── Footer: Logout ────────────────────────────────────────── */}
      <div
        style={{
          padding: '12px 10px calc(env(safe-area-inset-bottom, 0px) + 24px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        {currentUser ? (
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '11px 14px',
              borderRadius: '12px',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              background: 'rgba(239, 68, 68, 0.08)',
              color: '#EF4444',
              cursor: 'pointer',
              fontFamily: '"Cairo", "Tajawal", sans-serif',
              fontWeight: 700,
              fontSize: '0.88rem',
              transition: 'all 0.18s ease',
              textAlign: isRTL ? 'right' : 'left',
            }}
          >
            <span style={{ fontSize: '1.15rem', flexShrink: 0 }}>🚪</span>
            <span>{isRTL ? 'تسجيل الخروج' : 'Logout'}</span>
          </button>
        ) : (
          <div style={{ fontSize: '0.74rem', color: '#4B5563', textAlign: 'center', padding: '6px' }}>
            {isRTL ? 'أكاديمية أولستار الرياضية 🇹🇳' : 'All-Star Sports Academy 🇹🇳'}
          </div>
        )}
        <div style={{ marginTop: '8px', fontSize: '0.66rem', color: '#374151', textAlign: 'center' }}>
          ALL-STAR SPORTS ACADEMY · v2.0
        </div>
      </div>
    </div>
  )
}

// ─── 3D SCALE-DOWN DRAWER ROOT (WRAPS ENTIRE APP) ────────────────────────────
export default function DrawerRoot({ children, currentUser }) {
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef(null)
  const { lang } = useLanguage()

  const dir = lang === 'ar' ? 'rtl' : 'ltr'

  const openDrawer = useCallback(() => setIsOpen(true), [])
  const closeDrawer = useCallback(() => setIsOpen(false), [])
  const toggleDrawer = useCallback(() => setIsOpen((prev) => !prev), [])

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && isOpen) closeDrawer()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, closeDrawer])

  // ── 3D Push/Scale Values ───────────────────────────────────────
  // AR (RTL): menu is on the RIGHT  → card slides LEFT  (negative X: -72%)
  // EN (LTR): menu is on the LEFT   → card slides RIGHT (positive X: 72%)
  const translateX = dir === 'rtl' ? '-72%' : '72%'
  const origin = dir === 'rtl' ? 'right center' : 'left center'
  const cardShadow = dir === 'rtl'
    ? '-24px 0 60px rgba(0, 0, 0, 0.85)'
    : '24px 0 60px rgba(0, 0, 0, 0.85)'

  return (
    <DrawerContext.Provider value={{ isOpen, openDrawer, closeDrawer, toggleDrawer }}>
      {/*
        ┌─────────────────────────────────────────────────────────────┐
        │  STAGE — vivid green brand background, visible when open    │
        │  Shows through around the scaled-down card.                 │
        └─────────────────────────────────────────────────────────────┘
      */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          minHeight: '100vh',
          background: isOpen
            ? 'linear-gradient(135deg, #00E676 0%, #00C853 40%, #00BFA5 100%)'
            : '#08090C',
          overflow: isOpen ? 'hidden' : 'visible',
          transition: 'background 350ms cubic-bezier(0.32, 0.72, 0, 1)',
        }}
      >
        {/* ─── Dark menu canvas, sits behind the card ───────────────── */}
        <UnderlyingMenuCanvas
          currentUser={currentUser}
          onClose={closeDrawer}
          dir={dir}
          lang={lang}
          isOpen={isOpen}
        />

        {/* ─── Main App Card (scales + slides in 3D when open) ──────── */}
        <div
          ref={wrapperRef}
          onClick={isOpen ? closeDrawer : undefined}
          style={{
            position: 'relative',
            zIndex: 20,
            minHeight: '100vh',
            width: '100%',
            background: '#08090C',
            transformOrigin: origin,
            borderRadius: isOpen ? '28px' : '0px',
            boxShadow: isOpen ? cardShadow : 'none',
            overflow: isOpen ? 'hidden' : 'visible',
            /* CRITICAL: transform is 'none' when closed so position:fixed works natively */
            transform: isOpen
              ? `scale(0.84) translateX(${translateX})`
              : 'none',
            transition: [
              'transform 320ms cubic-bezier(0.32, 0.72, 0, 1)',
              'border-radius 320ms cubic-bezier(0.32, 0.72, 0, 1)',
              'box-shadow 320ms cubic-bezier(0.32, 0.72, 0, 1)',
            ].join(', '),
            cursor: isOpen ? 'pointer' : 'default',
            pointerEvents: isOpen ? 'none' : 'auto',
            willChange: isOpen ? 'transform, border-radius' : 'auto',
          }}
        >
          <div style={{ pointerEvents: 'auto', minHeight: '100vh', display: 'flex', flexDirection: 'column', width: '100%' }}>
            {children}
          </div>
        </div>
      </div>
    </DrawerContext.Provider>
  )
}
