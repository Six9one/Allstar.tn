import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import logoMain from '../assets/logo-light.png'
import { HamburgerButton } from './DrawerMenu'
import { useLanguage } from '../context/LanguageContext'

export default function Navbar({ onOpenOnboarding, currentUser }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { lang, setLang } = useLanguage()

  const handleLogout = () => {
    localStorage.removeItem('allstar_user_session')
    window.location.href = '/'
  }

  const toggleLanguage = () => {
    setLang(lang === 'ar' ? 'en' : 'ar')
  }

  const isRTL = lang === 'ar'

  const navLinks = [
    { path: '/', label: isRTL ? 'الرئيسية' : 'Home' },
    { path: '/programs', label: isRTL ? 'برامجنا' : 'Programs' },
    { path: '/academy', label: isRTL ? 'الأكاديمية' : 'Academy' },
    { path: '/schedule', label: isRTL ? 'الجدول' : 'Schedule' },
    { path: '/player-cards', label: isRTL ? 'بطاقات اللاعبين' : 'Player Cards' },
    {
      path: currentUser?.role === 'coach' ? '/coach-portal' : '/portal',
      label: currentUser?.role === 'coach'
        ? (isRTL ? 'تطبيق المدرب' : 'Coach Portal')
        : (isRTL ? 'بوابة الأولياء' : 'Parent Portal'),
    },
    ...(currentUser?.role === 'admin' || currentUser?.role === 'coach'
      ? [{ path: '/admin', label: isRTL ? 'إدارة النظام' : 'Admin' }]
      : []),
  ]

  const langBtnStyle = {
    height: '36px',
    padding: '0 8px',
    borderRadius: '10px',
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    border: '1px solid rgba(255, 193, 7, 0.45)',
    color: '#FFC107',
    fontWeight: 800,
    fontSize: '0.78rem',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    fontFamily: '"Cairo", "Tajawal", sans-serif',
    whiteSpace: 'nowrap',
    flexShrink: 0,
    transition: 'all 0.2s ease',
  }

  const loginBtnStyle = {
    height: '36px',
    padding: '0 10px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #FFC107 0%, #FF9500 100%)',
    border: 'none',
    color: '#08090C',
    fontWeight: 800,
    fontSize: '0.8rem',
    cursor: 'pointer',
    fontFamily: '"Cairo", "Tajawal", sans-serif',
    boxShadow: '0 4px 14px rgba(255, 193, 7, 0.35)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    whiteSpace: 'nowrap',
    flexShrink: 0,
    transition: 'all 0.2s ease',
  }

  const UserSection = () =>
    currentUser ? (
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        <button
          onClick={() =>
            navigate(currentUser.role === 'coach' ? '/coach-portal' : '/portal')
          }
          style={{
            height: '36px',
            padding: '0 10px',
            borderRadius: '10px',
            background:
              currentUser.role === 'coach'
                ? 'linear-gradient(135deg, #FFC107 0%, #FF9500 100%)'
                : 'linear-gradient(135deg, #00E676 0%, #00B0FF 100%)',
            border: 'none',
            color: '#000000',
            fontWeight: 800,
            fontSize: '0.8rem',
            cursor: 'pointer',
            fontFamily: '"Cairo", "Tajawal", sans-serif',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            flexShrink: 0,
            maxWidth: '110px',
          }}
        >
          <span>{currentUser.role === 'coach' ? '⚽' : '👨‍👩‍👧'}</span>
          <span
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {currentUser.name}
          </span>
        </button>
        <button
          onClick={handleLogout}
          type="button"
          title={isRTL ? 'تسجيل الخروج' : 'Logout'}
          style={{
            width: '34px',
            height: '36px',
            borderRadius: '10px',
            background: 'rgba(255, 61, 0, 0.12)',
            border: '1px solid rgba(255, 61, 0, 0.4)',
            color: '#FF3D00',
            fontWeight: 800,
            cursor: 'pointer',
            fontSize: '0.8rem',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          🚪
        </button>
      </div>
    ) : (
      <button onClick={onOpenOnboarding} type="button" style={loginBtnStyle}>
        <span>🔐</span>
        <span className="btn-label-desktop">
          {isRTL ? 'تسجيل الدخول' : 'Login'}
        </span>
        <span className="btn-label-mobile">
          {isRTL ? 'دخول' : 'Login'}
        </span>
      </button>
    )

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        width: '100%',
        height: 'calc(4rem + env(safe-area-inset-top, 0px))',
        paddingTop: 'env(safe-area-inset-top, 0px)',
        backgroundColor: 'rgba(11, 15, 23, 0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.10)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '1320px',
          padding: '0 14px',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxSizing: 'border-box',
          /* Fixed physical left-to-right orientation so logo is ALWAYS on the physical left */
          direction: 'ltr',
          unicodeBidi: 'isolate',
        }}
      >
        {/* ── SLOT 1 (PHYSICAL LEFT) — LOGO (ALWAYS HERE) + BURGER (IF EN) ─ */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexShrink: 0,
            direction: 'ltr',
          }}
        >
          {/* Burger on Left ONLY in English */}
          {!isRTL && <HamburgerButton />}

          {/* Logo ALWAYS on the Physical Left */}
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              flexShrink: 0,
            }}
          >
            <img
              src={logoMain}
              alt="All-Star Academy Logo"
              style={{
                height: '34px',
                maxWidth: '120px',
                width: 'auto',
                objectFit: 'contain',
              }}
            />
          </Link>
        </div>

        {/* ── SLOT 2 — SPACER ───────────────────────────────────────── */}
        <div style={{ flex: 1 }} />

        {/* ── SLOT 3 — DESKTOP NAV LINKS (CENTER/HIDDEN ON MOBILE) ──── */}
        <nav
          className="desktop-nav"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            flexWrap: 'nowrap',
            direction: isRTL ? 'rtl' : 'ltr',
          }}
        >
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path
            return (
              <Link
                key={link.path}
                to={link.path}
                style={{
                  height: '36px',
                  padding: '0 12px',
                  borderRadius: '10px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  textDecoration: 'none',
                  color: isActive ? '#00E676' : '#B0BEC5',
                  backgroundColor: isActive ? 'rgba(0, 230, 118, 0.12)' : 'transparent',
                  border: isActive ? '1px solid rgba(0, 230, 118, 0.3)' : '1px solid transparent',
                  fontWeight: isActive ? 800 : 600,
                  fontSize: '0.84rem',
                  fontFamily: '"Cairo", "Tajawal", sans-serif',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* ── SLOT 4 (PHYSICAL RIGHT) — USER/LOGIN + LANG + BURGER (IF AR) ─ */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            flexShrink: 0,
            direction: 'ltr',
          }}
        >
          <UserSection />

          {/* Language Switcher Button */}
          <button
            onClick={toggleLanguage}
            type="button"
            title={isRTL ? 'Switch to English' : 'التحويل إلى العربية'}
            style={langBtnStyle}
          >
            <span>🌐</span>
            <span>{isRTL ? 'EN' : 'AR'}</span>
          </button>

          {/* Burger on Right ONLY in Arabic */}
          {isRTL && <HamburgerButton />}
        </div>
      </div>
    </header>
  )
}
