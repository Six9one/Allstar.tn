import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import logoMain from '../assets/logo-light.png'

export default function Navbar({ onOpenOnboarding, currentUser }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('allstar_user_session')
    window.location.href = '/'
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
        {/* TOP LEFT: LOGO ONLY (STRICTLY LEFT) */}
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

        {/* TOP RIGHT: CONNECTION BUTTON & MOBILE TOGGLE */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', direction: 'rtl' }}>
          {/* MOBILE TOGGLE BUTTON (3 LINES MENU ICON - PERFECTLY CENTERED & ALIGNED) */}
          <button
            className="mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
            style={{
              width: '42px',
              height: '42px',
              minWidth: '42px',
              minHeight: '42px',
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#FFF',
              display: 'none',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              direction: 'ltr',
              padding: 0,
              lineHeight: 1,
              boxSizing: 'border-box',
              flexShrink: 0
            }}
          >
            {mobileMenuOpen ? (
              <span style={{ fontSize: '1.2rem', fontWeight: 900, lineHeight: 1 }}>✕</span>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', margin: '0 auto' }}>
                <line x1="4" y1="6" x2="20" y2="6"></line>
                <line x1="4" y1="12" x2="20" y2="12"></line>
                <line x1="4" y1="18" x2="20" y2="18"></line>
              </svg>
            )}
          </button>

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
                  justify: 'center'
                }}
              >
                🚪
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenOnboarding}
              style={{
                minHeight: '48px',
                padding: '0 16px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #00E676 0%, #00B0FF 100%)',
                border: 'none',
                color: '#04101A',
                fontWeight: 900,
                fontSize: '0.88rem',
                cursor: 'pointer',
                fontFamily: '"Cairo", "Tajawal", sans-serif',
                boxShadow: '0 4px 14px rgba(0, 230, 118, 0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                justify: 'center',
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

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div
          style={{
            backgroundColor: '#0D1017',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '16px',
            marginTop: '8px',
            borderRadius: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  minHeight: '48px',
                  padding: '0 16px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  textDecoration: 'none',
                  color: isActive ? '#00E676' : '#FFFFFF',
                  backgroundColor: isActive ? 'rgba(0, 230, 118, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                  fontWeight: 800,
                  fontSize: '0.95rem'
                }}
              >
                {link.label}
              </Link>
            )
          })}
        </div>
      )}
    </header>
  )
}
