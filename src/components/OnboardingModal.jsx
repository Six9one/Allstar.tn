import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../services/db'
import logoBadge from '../assets/logo-badge.jpg'

export default function OnboardingModal({ isOpen, onClose, onLoginSuccess }) {
  const [selectedRole, setSelectedRole] = useState(null) // 'parent' | 'coach' | null
  const [phone, setPhone] = useState('')
  const [pin, setPin] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  if (!isOpen) return null

  const handleRoleSelect = (role) => {
    setSelectedRole(role)
    setErrorMsg('')
  }

  const handleLoginSubmit = (e) => {
    e.preventDefault()
    if (!phone.trim()) {
      setErrorMsg('يرجى إدخال رقم الهاتف المسجل')
      return
    }

    setIsLoading(true)
    setErrorMsg('')

    setTimeout(() => {
      const authenticatedUser = db.authenticateUser(phone, pin, selectedRole)

      if (authenticatedUser) {
        const userSession = {
          role: selectedRole,
          id: authenticatedUser.id,
          name: authenticatedUser.name,
          phone: authenticatedUser.phone || phone,
          coachId: authenticatedUser.coachId || '',
          playerIds: authenticatedUser.playerIds || [],
          sport: authenticatedUser.sport || '',
          group: authenticatedUser.group || '',
          connectedAt: Date.now()
        }

        // Save session automatically
        localStorage.setItem('allstar_user_session', JSON.stringify(userSession))
        if (onLoginSuccess) onLoginSuccess(userSession)
        setIsLoading(false)
        onClose()

        // Auto Redirect to specialized separated apps
        if (selectedRole === 'coach') {
          navigate('/coach-portal')
        } else if (selectedRole === 'parent') {
          navigate('/portal')
        }
      } else {
        // Fallback demo connection if not found
        const fallbackSession = {
          role: selectedRole,
          id: 'ACC-' + Date.now(),
          name: selectedRole === 'coach' ? 'الكابتن أحمد المنصوري' : 'محمد علي المنصوري (ولي أمر)',
          phone: phone,
          coachId: selectedRole === 'coach' ? 'COACH-001' : '',
          playerIds: selectedRole === 'parent' ? ['ALLSTAR-101'] : [],
          connectedAt: Date.now()
        }

        localStorage.setItem('allstar_user_session', JSON.stringify(fallbackSession))
        if (onLoginSuccess) onLoginSuccess(fallbackSession)
        setIsLoading(false)
        onClose()

        if (selectedRole === 'coach') {
          navigate('/coach-portal')
        } else {
          navigate('/portal')
        }
      }
    }, 500)
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(5, 7, 14, 0.94)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        display: 'flex',
        alignItems: 'center',
        justify: 'center',
        padding: '16px',
        direction: 'rtl',
        fontFamily: '"Cairo", "Tajawal", sans-serif'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          background: 'linear-gradient(145deg, rgba(14, 20, 32, 0.98), rgba(8, 11, 18, 0.99))',
          borderRadius: '26px',
          border: '1.5px solid rgba(0, 230, 118, 0.4)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.9), 0 0 35px rgba(0, 230, 118, 0.15)',
          padding: '28px 24px',
          position: 'relative',
          color: '#FFFFFF'
        }}
      >
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#FFFFFF',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            justify: 'center'
          }}
        >
          ✕
        </button>

        {/* HEADER */}
        <div style={{ textAlign: 'center', marginBottom: '22px' }}>
          <img
            src={logoBadge}
            alt="All-Star Academy"
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              margin: '0 auto 12px auto',
              border: '2px solid #00E676',
              boxShadow: '0 4px 15px rgba(0, 230, 118, 0.3)'
            }}
          />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#00E676', margin: '0 0 6px 0' }}>
            بوابة تسجيل الدخول الرسمية
          </h2>
          <p style={{ color: '#8E9BAE', fontSize: '0.85rem', margin: 0 }}>
            اختر نوع الحساب للدخول المباشر للتطبيق المخصص
          </p>
        </div>

        {/* STEP 1: CHOOSE ROLE (PARENT VS COACH) */}
        {!selectedRole ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* OPTION 1: PARENT */}
            <button
              onClick={() => handleRoleSelect('parent')}
              style={{
                background: 'linear-gradient(135deg, rgba(0, 230, 118, 0.12) 0%, rgba(0, 176, 255, 0.08) 100%)',
                border: '1.5px solid #00E676',
                borderRadius: '20px',
                padding: '18px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                cursor: 'pointer',
                textAlign: 'right',
                transition: 'all 0.2s ease'
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '16px',
                  background: 'rgba(0, 230, 118, 0.2)',
                  border: '1px solid #00E676',
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'center',
                  fontSize: '1.6rem',
                  flexShrink: 0
                }}
              >
                👨‍👩‍👧‍👦
              </div>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#00E676' }}>
                  دخول ولي الأمر (Parent Portal)
                </div>
                <div style={{ fontSize: '0.8rem', color: '#B0BEC5', marginTop: '2px' }}>
                  متابعة حضور طفلك، بطاقات FUT، والتقييمات الفنية
                </div>
              </div>
            </button>

            {/* OPTION 2: COACH */}
            <button
              onClick={() => handleRoleSelect('coach')}
              style={{
                background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.12) 0%, rgba(255, 149, 0, 0.08) 100%)',
                border: '1.5px solid #FFC107',
                borderRadius: '20px',
                padding: '18px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                cursor: 'pointer',
                textAlign: 'right',
                transition: 'all 0.2s ease'
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '16px',
                  background: 'rgba(255, 193, 7, 0.2)',
                  border: '1px solid #FFC107',
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'center',
                  fontSize: '1.6rem',
                  flexShrink: 0
                }}
              >
                ⚽
              </div>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#FFC107' }}>
                  دخول الكابتن والمدرب (Coach Portal)
                </div>
                <div style={{ fontSize: '0.8rem', color: '#B0BEC5', marginTop: '2px' }}>
                  تسجيل الحضور، تقييم اللاعبين، وإدارة الحصص التدريبية
                </div>
              </div>
            </button>
          </div>
        ) : (
          /* STEP 2: PHONE & PIN LOGIN FORM */
          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 900, color: selectedRole === 'coach' ? '#FFC107' : '#00E676' }}>
                {selectedRole === 'coach' ? '⚽ تسجيل دخول المدرب' : '👨‍👩‍👧‍👦 تسجيل دخول ولي الأمر'}
              </span>
              <button
                type="button"
                onClick={() => setSelectedRole(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#8E9BAE',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                تغيير النوع
              </button>
            </div>

            {errorMsg && (
              <div
                style={{
                  background: 'rgba(255, 61, 0, 0.15)',
                  border: '1px solid #FF3D00',
                  color: '#FF5252',
                  padding: '10px',
                  borderRadius: '12px',
                  fontSize: '0.85rem',
                  textAlign: 'center'
                }}
              >
                {errorMsg}
              </div>
            )}

            {/* QUICK PRESET ACCOUNTS CHIPS */}
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <span style={{ fontSize: '0.75rem', color: '#8E9BAE', fontWeight: 800, display: 'block', marginBottom: '8px' }}>
                ⚡ اختيار سريع للحسابات المسجلة:
              </span>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {selectedRole === 'coach' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => { setPhone('+216 95 263 467'); setPin('1234'); }}
                      style={{
                        padding: '6px 12px', borderRadius: '10px', background: 'rgba(255, 193, 7, 0.15)',
                        border: '1px solid #FFC107', color: '#FFC107', fontSize: '0.78rem', fontWeight: 900, cursor: 'pointer'
                      }}
                    >
                      ⚽ الكابتن أحمد (+216 95 263 467)
                    </button>
                    <button
                      type="button"
                      onClick={() => { setPhone('+216 98 323 941'); setPin('1234'); }}
                      style={{
                        padding: '6px 12px', borderRadius: '10px', background: 'rgba(255, 193, 7, 0.15)',
                        border: '1px solid #FFC107', color: '#FFC107', fontSize: '0.78rem', fontWeight: 900, cursor: 'pointer'
                      }}
                    >
                      🏀 الكابتن سامي (+216 98 323 941)
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => { setPhone('+216 98 123 456'); setPin('1234'); }}
                      style={{
                        padding: '6px 12px', borderRadius: '10px', background: 'rgba(0, 230, 118, 0.15)',
                        border: '1px solid #00E676', color: '#00E676', fontSize: '0.78rem', fontWeight: 900, cursor: 'pointer'
                      }}
                    >
                      👨‍👩‍👧‍👦 ولي أمر يوسف (+216 98 123 456)
                    </button>
                    <button
                      type="button"
                      onClick={() => { setPhone('+216 95 323 941'); setPin('1234'); }}
                      style={{
                        padding: '6px 12px', borderRadius: '10px', background: 'rgba(0, 230, 118, 0.15)',
                        border: '1px solid #00E676', color: '#00E676', fontSize: '0.78rem', fontWeight: 900, cursor: 'pointer'
                      }}
                    >
                      👨‍👩‍👧‍👦 ولي أمر عمر (+216 95 323 941)
                    </button>
                  </>
                )}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#B0BEC5', fontWeight: 700, marginBottom: '6px' }}>
                📱 رقم الهاتف المسجل
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+216 98 123 456"
                required
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: '14px',
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#FFFFFF',
                  fontSize: '1rem',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#B0BEC5', fontWeight: 700, marginBottom: '6px' }}>
                🔑 الرمز السري / PIN (الافتراضي: 1234)
              </label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: '14px',
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#FFFFFF',
                  fontSize: '1rem',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                minHeight: '48px',
                width: '100%',
                borderRadius: '14px',
                background: selectedRole === 'coach'
                  ? 'linear-gradient(135deg, #FFC107 0%, #FF9500 100%)'
                  : 'linear-gradient(135deg, #00E676 0%, #00B0FF 100%)',
                border: 'none',
                color: '#000000',
                fontWeight: 900,
                fontSize: '1rem',
                cursor: 'pointer',
                fontFamily: 'inherit',
                marginTop: '8px',
                boxShadow: '0 6px 20px rgba(0, 230, 118, 0.3)'
              }}
            >
              {isLoading ? 'جاري التحقق والدخول...' : '🚀 دخول الحساب والتطبيق المخصص'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
