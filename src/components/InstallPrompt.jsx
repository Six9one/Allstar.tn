import { useState, useEffect } from 'react'

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [showInstructionsModal, setShowInstructionsModal] = useState(false)

  useEffect(() => {
    // Detect if app is running in installed Standalone PWA mode (from home screen icon)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                         window.navigator.standalone === true ||
                         document.referrer.includes('android-app://')

    if (isStandalone) {
      setShowPrompt(false)
      return
    }

    // Detect iOS (iPhone/iPad)
    const userAgent = window.navigator.userAgent.toLowerCase()
    const isIphone = /iphone|ipad|ipod/.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    setIsIOS(isIphone)

    const isDismissed = localStorage.getItem('pwa_prompt_dismissed')
    if (isDismissed) {
      setShowPrompt(false)
      return
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowPrompt(true)
    }

    const handleOpenGuide = () => {
      setShowInstructionsModal(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('open-install-guide', handleOpenGuide)
    window.addEventListener('appinstalled', () => {
      setShowPrompt(false)
      setDeferredPrompt(null)
    })

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('open-install-guide', handleOpenGuide)
    }
  }, [])

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice
        if (outcome === 'accepted') {
          setShowPrompt(false)
        }
        setDeferredPrompt(null)
        return
      } catch (err) {
        console.log('Install prompt error:', err)
      }
    }
    // For iOS or browsers without native prompt event: show visual step guide
    setShowInstructionsModal(true)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('pwa_prompt_dismissed', Date.now().toString())
  }

  return (
    <>
      {/* TOP FLOATING INSTALL BANNER */}
      {showPrompt && (
        <div style={{
          position: 'fixed',
          top: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '92%',
          maxWidth: '520px',
          zIndex: 99999,
          background: 'linear-gradient(135deg, #0D47A1 0%, #0A1F44 100%)',
          border: '2px solid #FFC107',
          borderRadius: '20px',
          padding: '18px 20px',
          boxShadow: '0 15px 50px rgba(0,0,0,0.85), 0 0 30px rgba(255, 193, 7, 0.45)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          animation: 'bounceDown 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #FFC107 0%, #FF9500 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.8rem',
              flexShrink: 0,
              boxShadow: '0 0 15px rgba(255, 193, 7, 0.6)'
            }}>
              📱
            </div>

            <div style={{ flex: 1 }}>
              <div style={{
                display: 'inline-block',
                background: 'rgba(255,193,7,0.2)',
                color: '#FFC107',
                padding: '2px 8px',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: 800,
                marginBottom: '4px'
              }}>
                تثبيت التطبيق على الهاتف 🇹🇳
              </div>
              <h4 style={{ color: '#FFFFFF', fontSize: '1.05rem', fontWeight: 900, margin: 0 }}>
                تثبيت تطبيق أكاديمية أولستار
              </h4>
              <p style={{ color: '#B0BEC5', fontSize: '0.82rem', margin: '4px 0 0 0' }}>
                وصول سريع بنقرة واحدة من الشاشة الرئيسية بدون متصفح!
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <button
              onClick={handleInstallClick}
              className="btn-star"
              style={{
                flex: 1,
                padding: '12px',
                fontSize: '0.92rem',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #FFC107 0%, #FF9500 100%)',
                color: '#08090C',
                fontWeight: 900
              }}
            >
              ⚡ تثبيت التطبيق الآن (Install)
            </button>
            <button
              onClick={handleDismiss}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#90A4AE',
                padding: '12px 16px',
                borderRadius: '12px',
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              إلغاء
            </button>
          </div>
        </div>
      )}

      {/* STEP-BY-STEP INSTALL GUIDE MODAL (FOR IPHONE / SAFARI / CHROME) */}
      {showInstructionsModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          right: 0,
          left: 0,
          bottom: 0,
          zIndex: 999999,
          background: 'rgba(5, 7, 12, 0.95)',
          backdropFilter: 'blur(20px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '440px',
            background: 'linear-gradient(145deg, #0D1627 0%, #0A101D 100%)',
            border: '2px solid #FFC107',
            borderRadius: '24px',
            padding: '28px 24px',
            boxShadow: '0 25px 60px rgba(0,0,0,0.9), 0 0 35px rgba(255,193,7,0.3)',
            color: '#FFFFFF',
            textAlign: 'center',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowInstructionsModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                color: '#FFF',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 900
              }}
            >
              ✕
            </button>

            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>
              {isIOS ? '📱' : '📲'}
            </div>

            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#FFC107', marginBottom: '8px' }}>
              خطوات تثبيت التطبيق على هاتفك
            </h3>
            <p style={{ color: '#B0BEC5', fontSize: '0.88rem', marginBottom: '24px' }}>
              {isIOS ? 'لأجهزة آيفون (iPhone / Safari):' : 'لأجهزة الأندرويد ومتصفح كروم:'}
            </p>

            {isIOS ? (
              /* IPHONE / SAFARI STEPS */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'right', marginBottom: '24px' }}>
                <div style={{ background: 'rgba(255,255,255,0.06)', padding: '14px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ background: '#FFC107', color: '#08090C', width: '28px', height: '28px', borderRadius: '50%', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>1</div>
                  <div style={{ fontSize: '0.9rem' }}>اضغط على زر المشاركة <strong>Share (⎘)</strong> في أسفل المتصفح Safari</div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.06)', padding: '14px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ background: '#FFC107', color: '#08090C', width: '28px', height: '28px', borderRadius: '50%', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>2</div>
                  <div style={{ fontSize: '0.9rem' }}>انزل للأسفل واختر <strong>"Add to Home Screen" ➕</strong> (إضافة إلى الشاشة الرئيسية)</div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.06)', padding: '14px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ background: '#FFC107', color: '#08090C', width: '28px', height: '28px', borderRadius: '50%', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</div>
                  <div style={{ fontSize: '0.9rem' }}>اضغط على <strong>"Add" (إضافة)</strong> أعلى اليمين ليظهر أيقونة التطبيق مباشرة!</div>
                </div>
              </div>
            ) : (
              /* ANDROID / CHROME STEPS */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'right', marginBottom: '24px' }}>
                <div style={{ background: 'rgba(255,255,255,0.06)', padding: '14px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ background: '#FFC107', color: '#08090C', width: '28px', height: '28px', borderRadius: '50%', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>1</div>
                  <div style={{ fontSize: '0.9rem' }}>اضغط على قائمة المتصفح <strong>(⋮)</strong> أعلى اليمين</div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.06)', padding: '14px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ background: '#FFC107', color: '#08090C', width: '28px', height: '28px', borderRadius: '50%', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>2</div>
                  <div style={{ fontSize: '0.9rem' }}>اختر <strong>"تثبيت التطبيق" (Install app)</strong> أو "إضافة إلى الشاشة الرئيسية"</div>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowInstructionsModal(false)}
              className="btn-star"
              style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '1rem' }}
            >
              حسناً، فهمت 👍
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounceDown {
          0% { transform: translate(-50%, -100px); opacity: 0; }
          100% { transform: translate(-50%, 0); opacity: 1; }
        }
      `}</style>
    </>
  )
}
