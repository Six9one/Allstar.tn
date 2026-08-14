import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import logoMain from '../assets/logo-light.png'
import { db } from '../services/db'

const FALLBACK_SLIDES = [
  { id: 'SL-1', url: 'https://images.unsplash.com/photo-1551958219-acbc27eb9b0c?w=1200&auto=format&fit=crop&q=80', caption: '⚽ تدريبات فريق أولستار U12 - كرة القدم' },
  { id: 'SL-2', url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1200&auto=format&fit=crop&q=80', caption: '🏀 حصص كرة السلة التكتيكية للأشبال' },
  { id: 'SL-3', url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&auto=format&fit=crop&q=80', caption: '🏆 أبطال أولستار بتطاوين - لحظة التتويج' },
  { id: 'SL-4', url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1200&auto=format&fit=crop&q=80', caption: ' تمارينات اللياقة البدنية والسرعة' },
  { id: 'SL-5', url: 'https://images.unsplash.com/photo-1543286386-713bdd548da4?w=1200&auto=format&fit=crop&q=80', caption: '📸 صور المباراة الودية الكبرى' }
]

export default function Home() {
  const navigate = useNavigate()
  const [slides, setSlides] = useState(FALLBACK_SLIDES)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [showPacksModal, setShowPacksModal] = useState(false)
  const autoPlayRef = useRef(null)

  // Load and subscribe to live images from DB
  useEffect(() => {
    const loadImages = (content) => {
      if (content && Array.isArray(content.gallery_images) && content.gallery_images.length > 0) {
        const valid = content.gallery_images.filter(img => img.url && img.url.trim())
        if (valid.length > 0) {
          setSlides(valid)
          return
        }
      }
      setSlides(FALLBACK_SLIDES)
    }

    const currentContent = db.getSiteContent()
    loadImages(currentContent)

    db.getSiteContentAsync().then(c => c && loadImages(c))

    // Realtime Supabase Sync
    const unsub = db.subscribeToRealtime(null, null, (liveContent) => {
      if (liveContent) loadImages(liveContent)
    })

    return () => {
      if (unsub) unsub()
    }
  }, [])

  // Auto-Glide Carousel Timer (Glides every 4 seconds)
  useEffect(() => {
    if (slides.length <= 1 || isHovered) return

    autoPlayRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length)
    }, 4000)

    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current)
    }
  }, [slides.length, isHovered])

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length)
  }

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const currentSlide = slides[currentIndex] || slides[0]

  return (
    <div
      className="home-page text-break-safe"
      style={{
        minHeight: '100vh',
        width: '100%',
        backgroundColor: '#08090C',
        direction: 'rtl',
        fontFamily: '"Cairo", "Tajawal", sans-serif',
        color: '#FFFFFF',
        boxSizing: 'border-box',
        position: 'relative'
      }}
    >
      {/* AUTO-GLIDING HERO PHOTO CAROUSEL SECTION */}
      <main
        style={{
          paddingTop: '24px',
          paddingBottom: '32px',
          paddingLeft: 'max(16px, env(safe-area-inset-left, 16px))',
          paddingRight: 'max(16px, env(safe-area-inset-right, 16px))',
          maxWidth: '1280px',
          margin: '0 auto',
          boxSizing: 'border-box'
        }}
      >
        {/* CAROUSEL CARD WRAPPER - FULLY RESPONSIVE MOBILE & DESKTOP */}
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            position: 'relative',
            borderRadius: '24px',
            overflow: 'hidden',
            height: 'clamp(220px, 42vh, 480px)',
            width: '100%',
            background: '#0F131C',
            border: '1.5px solid rgba(0, 230, 118, 0.35)',
            boxShadow: '0 14px 40px rgba(0, 0, 0, 0.85), 0 0 25px rgba(0, 230, 118, 0.15)',
            boxSizing: 'border-box'
          }}
        >
          {/* SLIDES CONTAINER WITH SMOOTH SLIDE ANIMATION */}
          <div
            style={{
              display: 'flex',
              height: '100%',
              width: `${slides.length * 100}%`,
              transform: `translateX(${currentIndex * (100 / slides.length)}%)`,
              transition: 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)'
            }}
          >
            {slides.map((slide, idx) => (
              <div
                key={slide.id || idx}
                style={{
                  width: `${100 / slides.length}%`,
                  height: '100%',
                  position: 'relative',
                  flexShrink: 0
                }}
              >
                <img
                  src={slide.url}
                  alt={slide.caption || 'صور الأكاديمية'}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center center',
                    display: 'block'
                  }}
                />
                {/* DARK GRADIENT OVERLAY FOR TEXT READABILITY */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, rgba(8,9,12,0.1) 0%, rgba(8,9,12,0.85) 100%)'
                  }}
                />
              </div>
            ))}
          </div>

          {/* SLIDE CAPTION & DOTS AT BOTTOM */}
          <div
            style={{
              position: 'absolute',
              bottom: '16px',
              right: '18px',
              left: '18px',
              zIndex: 10,
              color: '#FFFFFF'
            }}
          >
            <div
              style={{
                fontSize: 'clamp(0.85rem, 2vw, 1.25rem)',
                fontWeight: 900,
                textShadow: '0 2px 10px rgba(0,0,0,0.95)',
                lineHeight: 1.3
              }}
            >
              {currentSlide?.caption || '📸 ألبوم الصور الرسمية لأكاديمية أولستار بتطاوين'}
            </div>

            {/* INDICATOR DOTS */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px' }}>
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  style={{
                    height: '8px',
                    width: i === currentIndex ? '24px' : '8px',
                    borderRadius: '4px',
                    backgroundColor: i === currentIndex ? '#00E676' : 'rgba(255, 255, 255, 0.4)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    padding: 0
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ⚽ REGISTER CHILD BUTTON - COMPACT & CENTERED */}
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', width: '100%' }}>
          <button
            onClick={() => setShowPacksModal(true)}
            style={{
              padding: '12px 28px',
              borderRadius: '9999px',
              background: 'linear-gradient(135deg, #00E676 0%, #00B0FF 100%)',
              border: 'none',
              color: '#04101A',
              fontWeight: 900,
              fontSize: '0.95rem',
              fontFamily: '"Cairo", "Tajawal", sans-serif',
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(0, 230, 118, 0.35)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.3s ease'
            }}
          >
            <span>⚽</span>
            <span>سجل طفلك الآن</span>
          </button>
        </div>

        {/* 🏆 3 PACKS SELECTION MODAL */}
        {showPacksModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 9999999,
              backgroundColor: 'rgba(5, 7, 12, 0.92)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
              boxSizing: 'border-box'
            }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: '680px',
                maxHeight: '90vh',
                overflowY: 'auto',
                backgroundColor: '#0D111A',
                border: '1.5px solid rgba(0, 230, 118, 0.4)',
                borderRadius: '24px',
                padding: '24px',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.9), 0 0 30px rgba(0, 230, 118, 0.2)',
                position: 'relative',
                color: '#FFFFFF'
              }}
            >
              {/* CLOSE BUTTON */}
              <button
                onClick={() => setShowPacksModal(false)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  left: '16px',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  color: '#FFFFFF',
                  fontWeight: 900,
                  fontSize: '1.1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>

              <div style={{ textAlign: 'center', marginBottom: '22px' }}>
                <span style={{
                  padding: '4px 14px',
                  borderRadius: '20px',
                  fontSize: '0.78rem',
                  fontWeight: 900,
                  backgroundColor: 'rgba(0, 230, 118, 0.15)',
                  color: '#00E676',
                  border: '1px solid #00E676'
                }}>
                  ⚽ باقات أكاديمية أولستار بتطاوين 🇹🇳
                </span>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 900, marginTop: '10px', color: '#FFFFFF' }}>
                  اختر باقة الاشتراك المناسبة لطفلك
                </h2>
                <p style={{ color: '#8E9BAE', fontSize: '0.88rem', margin: '4px 0 0 0' }}>
                  تدريبات احترافية معتمدة، بطاقات FIFA FUT، وتقييمات رياضية مستمرة
                </p>
              </div>

              {/* 3 PACKS CARDS GRID */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                
                {/* PACK 1: BASIC MONTHLY */}
                <div style={{
                  backgroundColor: '#131824',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '20px',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative'
                }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#00E5FF' }}>🌟 الباقة الشهرية</span>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#00E676', margin: '6px 0 10px 0' }}>
                      60 <span style={{ fontSize: '0.85rem' }}>د.ت / شهر</span>
                    </h3>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.82rem', color: '#B0BEC5', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <li>✓ 3 حصص أسبوعية تكتيكية</li>
                      <li>✓ متابعة الحضور والتقييم</li>
                      <li>✓ مدربون محترفون معتمدون</li>
                    </ul>
                  </div>
                  <button
                    onClick={() => {
                      setShowPacksModal(false)
                      navigate('/register?pack=monthly')
                    }}
                    style={{
                      width: '100%',
                      marginTop: '16px',
                      padding: '10px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(0, 230, 118, 0.15)',
                      border: '1px solid #00E676',
                      color: '#00E676',
                      fontWeight: 900,
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    ⚽ اختيار الباقة الشهرية
                  </button>
                </div>

                {/* PACK 2: PRO SEMI-ANNUAL (BEST SELLER) */}
                <div style={{
                  backgroundColor: '#161F33',
                  border: '2px solid #FFC107',
                  borderRadius: '20px',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative',
                  boxShadow: '0 8px 25px rgba(255, 193, 7, 0.2)'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '-12px',
                    right: '16px',
                    backgroundColor: '#FFC107',
                    color: '#000000',
                    fontWeight: 900,
                    fontSize: '0.7rem',
                    padding: '2px 10px',
                    borderRadius: '10px'
                  }}>
                    🔥 الأكثر طلباً
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#FFC107' }}>🏆 الباقة النصف سنوية</span>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#FFC107', margin: '6px 0 10px 0' }}>
                      160 <span style={{ fontSize: '0.85rem' }}>د.ت / 6 أشهر</span>
                    </h3>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.82rem', color: '#E0E0E0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <li>✓ جميع التمارين والمباريات الودية</li>
                      <li>✓ بطاقة لاعب FIFA FUT مجاناً 🎴</li>
                      <li>✓ زي أولستار الموحد كاملاً 👕</li>
                      <li>✓ توفير 200 د.ت مقارنة بالشهرية</li>
                    </ul>
                  </div>
                  <button
                    onClick={() => {
                      setShowPacksModal(false)
                      navigate('/register?pack=semiannual')
                    }}
                    style={{
                      width: '100%',
                      marginTop: '16px',
                      padding: '10px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #FFC107 0%, #FF9500 100%)',
                      border: 'none',
                      color: '#000000',
                      fontWeight: 900,
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    🚀 اختيار الباقة النصف سنوية
                  </button>
                </div>

                {/* PACK 3: VIP ANNUAL */}
                <div style={{
                  backgroundColor: '#131824',
                  border: '1px solid rgba(0, 176, 255, 0.4)',
                  borderRadius: '20px',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative'
                }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#00B0FF' }}>👑 الباقة السنوية النخبة</span>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#00B0FF', margin: '6px 0 10px 0' }}>
                      280 <span style={{ fontSize: '0.85rem' }}>د.ت / سنة</span>
                    </h3>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.82rem', color: '#B0BEC5', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <li>✓ تغطية كاملة للموسم الرياضي</li>
                      <li>✓ زي رياضي كامل + حقيبة رياضية</li>
                      <li>✓ أولوية مشاركة التربصات والبطولات</li>
                    </ul>
                  </div>
                  <button
                    onClick={() => {
                      setShowPacksModal(false)
                      navigate('/register?pack=annual')
                    }}
                    style={{
                      width: '100%',
                      marginTop: '16px',
                      padding: '10px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(0, 176, 255, 0.15)',
                      border: '1px solid #00B0FF',
                      color: '#00B0FF',
                      fontWeight: 900,
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    👑 اختيار الباقة السنوية
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
