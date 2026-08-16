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
        : (isRTL ? 'بوابة الأولياء' : 'Parent Portal')
    },
    { path: '/admin', label: isRTL ? 'إدارة النظام' : 'Admin' }
  ]

  const langBtnStyle = {
    minHeight: '36px',
    padding: '0 10px',
    borderRadius: '10px',
    backgroundColor: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,193,7,0.4)',
    color: '#FFC107',
    fontWeight: 800,
    fontSize: '0.8rem',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontFamily: '"Cairo","Tajawal",sans-serif',
    whiteSpace: 'nowrap',
    flexShrink: 0,
    transition: 'all 0.2s ease',
  }

  const loginBtnStyle = {
    minHeight: '36px',
    padding: '0 14px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #FFC107 0%, #FF9500 100%)',
    border: 'none',
    color: '#08090C',
    fontWeight: 900,
    fontSize: '0.82rem',
    cursor: 'pointer',
    fontFamily: '"Cairo","Tajawal",sans-serif',
    boxShadow: '0 2px 10px rgba(255,193,7,0.3)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '5px',
    whiteSpace: 'nowrap',
    flexShrink: 0,
    transition: 'all 0.2s ease',
  }

  const UserSection = () =>
    currentUser ? (
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <button
          onClick={() => navigate(currentUser.role === 'coach' ? '/coach-portal' : '/portal')}
          style={{
            minHeight: '36px',
            padding: '0 12px',
            borderRadius: '10px',
            background: currentUser.role === 'coach'
              ? 'linear-gradient(135deg, #FFC107 0%, #FF9500 100%)'
              : 'linear-gradient(135deg, #00E676 0%, #00B0FF 100%)',
            border: 'none',
            color: '#08090C',
            fontWeight: 800,
            fontSize: '0.82rem',
            cursor: 'pointer',
            fontFamily: '"Cairo","Tajawal",sans-serif',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            flexShrink: 0,
          }}
        >
          <span>{currentUser.role === 'coach' ? '⚽' : '👨‍👩‍👧‍👦'}</span>
          <span>{currentUser.name}</span>
        </button>
        <button
          onClick={handleLogout}
          title={isRTL ? 'تسجيل الخروج' : 'Logout'}
          style={{
            minWidth: '36px',
            minHeight: '36px',
            borderRadius: '10px',
            background: 'rgba(239,68,68,0.12)',
            border: '1px solid rgba(239,68,68,0.3)',
            color: '#EF4444',
            fontWeight: 900,
            cursor: 'pointer',
            fontSize: '0.82rem',
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
      <button onClick={onOpenOnboarding} style={loginBtnStyle}>
        <span>🔐</span>
        <span className="btn-label-desktop">{isRTL ? 'تسجيل الدخول' : 'Login'}</span>
        <span className="btn-label-mobile">{isRTL ? 'دخول' : 'Login'}</span>
      </button>
    )

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        height: 'calc(3.5rem + env(safe-area-inset-top, 0px))',
        paddingTop: 'env(safe-area-inset-top, 0px)',
        backgroundColor: 'rgba(11, 15, 23, 0.90)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.10)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        boxSizing: 'border-box',
        transition: 'background-color 0.3s ease',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '1280px',
          height: '3.5rem',
          margin: '0 auto',
          padding: '0 max(16px, env(safe-area-inset-left, 16px)) 0 max(16px, env(safe-area-inset-right, 16px))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
          direction: isRTL ? 'rtl' : 'ltr',
          boxSizing: 'border-box',
          whiteSpace: 'nowrap',
        }}
      >
        {/* ── START SECTION (Left in LTR / Right in RTL) ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            flexShrink: 0,
          }}
        >
          {/* LTR: Hamburger FIRST */}
          {!isRTL && <HamburgerButton />}

          {/* Logo */}
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              height: '36px',
            }}
          >
            <img
              src={logoMain}
              alt="All-Star Academy Logo"
              style={{ height: '36px', width: 'auto', objectFit: 'contain' }}
            />
          </Link>
        </div>

        {/* ── CENTER SPACER / DESKTOP NAV ── */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <nav
            className="desktop-nav"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              flexWrap: 'nowrap',
            }}
          >
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  style={{
                    minHeight: '36px',
                    padding: '0 12px',
                    borderRadius: '10px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    textDecoration: 'none',
                    color: isActive ? '#00E676' : '#94A3B8',
                    backgroundColor: isActive ? 'rgba(0, 230, 118, 0.12)' : 'transparent',
                    border: isActive ? '1px solid rgba(0, 230, 118, 0.3)' : '1px solid transparent',
                    fontWeight: isActive ? 800 : 600,
                    fontSize: '0.84rem',
                    fontFamily: '"Cairo","Tajawal",sans-serif',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* ── END SECTION (Right in LTR / Left in RTL) ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexShrink: 0,
          }}
        >
          <UserSection />

          <button
            onClick={toggleLanguage}
            title={isRTL ? 'Switch to English' : 'التحويل إلى العربية'}
            style={langBtnStyle}
          >
            <span>🌐</span>
            <span>{isRTL ? 'EN' : 'AR'}</span>
          </button>

          {/* RTL: Hamburger LAST */}
          {isRTL && <HamburgerButton />}
        </div>
      </div>
    </header>
  )
}
