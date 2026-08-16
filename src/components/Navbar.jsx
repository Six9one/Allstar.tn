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
    { path: currentUser?.role === 'coach' ? '/coach-portal' : '/portal', label: currentUser?.role === 'coach' ? (isRTL ? 'تطبيق المدرب' : 'Coach Portal') : (isRTL ? 'بوابة الأولياء' : 'Parent Portal') },
    { path: '/admin', label: isRTL ? 'إدارة النظام' : 'Admin' }
  ]

  return (
    <header
      style={{
        position: 'fixed',
        top: 'calc(env(safe-area-inset-top, 0px) + 8px)',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 20px)',
        maxWidth: '1320px',
        zIndex: 999999,
        backgroundColor: 'rgba(12, 15, 22, 0.95)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        border: '1.5px solid rgba(0, 230, 118, 0.35)',
        borderRadius: '20px',
        boxShadow: '0 12px 35px rgba(0, 0, 0, 0.85), 0 0 20px rgba(0, 230, 118, 0.15)',
        padding: '6px 12px',
        transition: 'all 0.3s ease',
        boxSizing: 'border-box'
      }}
    >
      <div
        style={{
          maxWidth: '1320px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          minHeight: '44px',
          direction: isRTL ? 'rtl' : 'ltr'
        }}
      >
        {/* LEFT SECTION (Logo + Hamburger in EN/LTR) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              minHeight: '44px',
              padding: '2px 0'
            }}
          >
            <img
              src={logoMain}
              alt="All-Star Academy Logo"
              style={{
                height: '38px',
                width: 'auto',
                objectFit: 'contain'
              }}
            />
          </Link>

          {/* IN ENGLISH (LTR): Hamburger button sits on the LEFT beside the logo */}
          {!isRTL && <HamburgerButton className="mobile-toggle" />}
        </div>

        {/* CENTER: DESKTOP NAVIGATION LINKS */}
        <nav
          className="desktop-nav"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            flexWrap: 'nowrap',
            direction: isRTL ? 'rtl' : 'ltr'
          }}
        >
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path
            return (
              <Link
                key={link.path}
                to={link.path}
                style={{
                  minHeight: '40px',
                  padding: '0 12px',
                  borderRadius: '12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  textDecoration: 'none',
                  color: isActive ? '#00E676' : '#B0BEC5',
                  backgroundColor: isActive ? 'rgba(0, 230, 118, 0.12)' : 'transparent',
                  border: isActive ? '1px solid rgba(0, 230, 118, 0.3)' : '1px solid transparent',
                  fontWeight: isActive ? 900 : 700,
                  fontSize: '0.84rem',
                  fontFamily: '"Cairo", "Tajawal", sans-serif',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap'
                }}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* RIGHT SECTION (Actions + Hamburger in AR/RTL) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {/* COMPACT 2-LETTER LANGUAGE SWITCHER (AR / EN) */}
          <button
            onClick={toggleLanguage}
            title={isRTL ? 'Switch to English' : 'التحويل إلى العربية'}
            style={{
              minHeight: '38px',
              padding: '0 9px',
              borderRadius: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 193, 7, 0.5)',
              color: '#FFC107',
              fontWeight: 900,
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontFamily: '"Cairo", "Tajawal", sans-serif',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            <span>🌐</span>
            <span>{isRTL ? 'EN' : 'AR'}</span>
          </button>

          {/* IN ARABIC (RTL): Hamburger button sits on the RIGHT */}
          {isRTL && <HamburgerButton className="mobile-toggle" />}

          {/* USER / ONBOARDING BUTTON */}
          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                onClick={() => navigate(currentUser.role === 'coach' ? '/coach-portal' : '/portal')}
                style={{
                  minHeight: '38px',
                  padding: '0 12px',
                  borderRadius: '12px',
                  background: currentUser.role === 'coach'
                    ? 'linear-gradient(135deg, #FFC107 0%, #FF9500 100%)'
                    : 'linear-gradient(135deg, #00E676 0%, #00B0FF 100%)',
                  border: 'none',
                  color: '#000000',
                  fontWeight: 900,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  fontFamily: '"Cairo", "Tajawal", sans-serif',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
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
                  minHeight: '38px',
                  borderRadius: '10px',
                  background: 'rgba(255, 61, 0, 0.15)',
                  border: '1px solid #FF3D00',
                  color: '#FF3D00',
                  fontWeight: 900,
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                🚪
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenOnboarding}
              style={{
                minHeight: '38px',
                padding: '0 12px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #FFC107 0%, #FF9500 100%)',
                border: 'none',
                color: '#08090C',
                fontWeight: 900,
                fontSize: '0.82rem',
                cursor: 'pointer',
                fontFamily: '"Cairo", "Tajawal", sans-serif',
                boxShadow: '0 4px 14px rgba(255, 193, 7, 0.35)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
            >
              <span>🔐</span>
              <span className="btn-label-desktop">{isRTL ? 'تسجيل الدخول' : 'Login'}</span>
              <span className="btn-label-mobile">{isRTL ? 'دخول' : 'Login'}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
