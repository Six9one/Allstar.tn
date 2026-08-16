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

  const navLinks = [
    { path: '/', label: 'الرئيسية' },
    { path: '/programs', label: 'برامجنا' },
    { path: '/academy', label: 'الأكاديمية' },
    { path: '/schedule', label: 'الجدول' },
    { path: '/player-cards', label: 'بطاقات اللاعبين' },
    { path: currentUser?.role === 'coach' ? '/coach-portal' : '/portal', label: currentUser?.role === 'coach' ? 'تطبيق المدرب' : 'بوابة الأولياء' },
    { path: '/admin', label: 'إدارة النظام' }
  ]

  return (
    <header
      style={{
        position: 'fixed',
        top: 'calc(env(safe-area-inset-top, 0px) + 8px)',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 24px)',
        maxWidth: '1320px',
        zIndex: 999999,
        backgroundColor: 'rgba(12, 15, 22, 0.95)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        border: '1.5px solid rgba(0, 230, 118, 0.35)',
        borderRadius: '20px',
        boxShadow: '0 12px 35px rgba(0, 0, 0, 0.85), 0 0 20px rgba(0, 230, 118, 0.15)',
        paddingTop: '6px',
        paddingBottom: '6px',
        paddingLeft: '16px',
        paddingRight: '16px',
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
          gap: '16px',
          minHeight: '48px',
          direction: 'ltr'
        }}
      >
        {/* TOP LEFT: LOGO */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            minHeight: '48px',
            padding: '4px 0',
            flexShrink: 0
          }}
        >
          <img
            src={logoMain}
            alt="All-Star Academy Logo"
            style={{
              height: '44px',
              width: 'auto',
              objectFit: 'contain'
            }}
          />
        </Link>

        {/* CENTER: DESKTOP NAVIGATION LINKS */}
        <nav
          className="desktop-nav"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            flexWrap: 'wrap',
            direction: 'rtl'
          }}
        >
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path
            return (
              <Link
                key={link.path}
                to={link.path}
                style={{
                  minHeight: '48px',
                  padding: '0 14px',
                  borderRadius: '12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  textDecoration: 'none',
                  color: isActive ? '#00E676' : '#B0BEC5',
                  backgroundColor: isActive ? 'rgba(0, 230, 118, 0.12)' : 'transparent',
                  border: isActive ? '1px solid rgba(0, 230, 118, 0.3)' : '1px solid transparent',
                  fontWeight: isActive ? 900 : 700,
                  fontSize: '0.88rem',
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

        {/* TOP RIGHT: USER BUTTON + LANGUAGE SWITCHER + 3D DRAWER HAMBURGER */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', direction: 'rtl' }}>
          {/* LANGUAGE SWITCHER BUTTON (AR ↔ EN) */}
          <button
            onClick={toggleLanguage}
            title={lang === 'ar' ? 'Switch to English' : 'التحويل إلى العربية'}
            style={{
              minHeight: '40px',
              padding: '0 11px',
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 193, 7, 0.4)',
              color: '#FFC107',
              fontWeight: 800,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontFamily: '"Cairo", "Tajawal", sans-serif',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease'
            }}
          >
            <span>🌐</span>
            <span>{lang === 'ar' ? 'EN' : 'العربية'}</span>
          </button>

          {/* 3D DRAWER HAMBURGER — opens the scale-down sliding drawer on mobile */}
          <HamburgerButton className="mobile-toggle" />

          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => navigate(currentUser.role === 'coach' ? '/coach-portal' : '/portal')}
                style={{
                  minHeight: '48px',
                  padding: '0 16px',
                  borderRadius: '14px',
                  background: currentUser.role === 'coach'
                    ? 'linear-gradient(135deg, #FFC107 0%, #FF9500 100%)'
                    : 'linear-gradient(135deg, #00E676 0%, #00B0FF 100%)',
                  border: 'none',
                  color: '#000000',
                  fontWeight: 900,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  fontFamily: '"Cairo", "Tajawal", sans-serif',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>{currentUser.role === 'coach' ? '⚽' : '👨‍👩‍👧‍👦'}</span>
                <span>{currentUser.name}</span>
              </button>

              <button
                onClick={handleLogout}
                title="تسجيل الخروج"
                style={{
                  minWidth: '40px',
                  minHeight: '48px',
                  borderRadius: '12px',
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
                minHeight: '44px',
                padding: '0 16px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #FFC107 0%, #FF9500 100%)',
                border: 'none',
                color: '#08090C',
                fontWeight: 900,
                fontSize: '0.88rem',
                cursor: 'pointer',
                fontFamily: '"Cairo", "Tajawal", sans-serif',
                boxShadow: '0 4px 16px rgba(255, 193, 7, 0.4)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
            >
              <span>🔐</span>
              <span className="btn-label-desktop">تسجيل الدخول (مدرب / ولي أمر)</span>
              <span className="btn-label-mobile">تسجيل الدخول</span>
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
