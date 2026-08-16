import React, { useState, useEffect, createContext, useContext, useCallback } from 'react'
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

export function DrawerProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false)
  const openDrawer = useCallback(() => setIsOpen(true), [])
  const closeDrawer = useCallback(() => setIsOpen(false), [])
  const toggleDrawer = useCallback(() => setIsOpen(prev => !prev), [])

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

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        closeDrawer()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, closeDrawer])

  return (
    <DrawerContext.Provider value={{ isOpen, openDrawer, closeDrawer, toggleDrawer }}>
      {children}
    </DrawerContext.Provider>
  )
}

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

// ─── FLOATING OVERLAY DRAWER MENU ─────────────────────────────────────────────
export default function DrawerMenu({ currentUser }) {
  const { isOpen, closeDrawer } = useDrawer()
  const navigate = useNavigate()
  const location = useLocation()
  const { lang, setLang } = useLanguage()

  const isRTL = lang === 'ar'
  const navLinks = getNavLinks(currentUser, lang)

  const handleNav = (path) => {
    navigate(path)
    closeDrawer()
  }

  const handleLogout = () => {
    localStorage.removeItem('allstar_user_session')
    closeDrawer()
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
        inset: 0,
        zIndex: 99999,
        pointerEvents: isOpen ? 'auto' : 'none',
        visibility: isOpen ? 'visible' : 'hidden',
        transition: 'visibility 0.3s ease',
      }}
    >
      {/* 1. BACKDROP OVERLAY */}
      <div
        onClick={closeDrawer}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          opacity: isOpen ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      />

      {/* 2. SLIDING DRAWER PANEL */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          ...(isRTL
            ? {
                right: 0,
                transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
              }
            : {
                left: 0,
                transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
              }),
          width: '82vw',
          maxWidth: '320px',
          backgroundColor: '#0D1117',
          backgroundImage: 'linear-gradient(165deg, #0D1117 0%, #111827 50%, #0B0F17 100%)',
          borderRight: isRTL ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
          borderLeft: isRTL ? '1px solid rgba(255, 255, 255, 0.08)' : 'none',
          boxShadow: isRTL
            ? '-10px 0 35px rgba(0, 0, 0, 0.85)'
            : '10px 0 35px rgba(0, 0, 0, 0.85)',
          display: 'flex',
          flexDirection: 'column',
          direction: isRTL ? 'rtl' : 'ltr',
          transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          overflowY: 'auto',
          overflowX: 'hidden',
          fontFamily: '"Cairo", "Tajawal", sans-serif',
          zIndex: 100000,
        }}
      >
        {/* ── Header: Avatar + User Info + Close Button ───────────────── */}
        <div
          style={{
            padding: 'calc(env(safe-area-inset-top, 0px) + 24px) 20px 20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'linear-gradient(180deg, rgba(0, 230, 118, 0.08) 0%, transparent 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0, flex: 1 }}>
            {/* Avatar Circle */}
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #00E676 0%, #00C853 100%)',
                border: '2.5px solid #00E676',
                boxShadow: '0 0 20px rgba(0, 230, 118, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.4rem',
                fontWeight: 900,
                color: '#03110A',
                flexShrink: 0,
              }}
            >
              {avatarLetter}
            </div>

            {/* Name + Role */}
            <div style={{ minWidth: 0, flex: 1 }}>
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
                  marginTop: '4px',
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

          {/* Close button */}
          <button
            onClick={closeDrawer}
            type="button"
            aria-label="Close menu"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#8E9BAE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '0.9rem',
              flexShrink: 0,
            }}
          >
            ✕
          </button>
        </div>

        {/* ── Navigation Links ────────────────────────────────────────── */}
        <nav style={{ flex: 1, padding: '14px 12px' }}>
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
                  marginBottom: '4px',
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
          <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.06)', margin: '10px 0' }} />

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
              marginBottom: '4px',
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
              marginBottom: '4px',
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

        {/* ── Footer: Logout / Branding ────────────────────────────────── */}
        <div
          style={{
            padding: '12px 14px calc(env(safe-area-inset-bottom, 0px) + 20px)',
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
    </div>
  )
}
