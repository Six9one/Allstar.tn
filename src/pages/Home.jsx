import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../services/db'
import { notificationService } from '../services/notifications'

const FALLBACK_SLIDES = [
  { id: 'SL-1', url: '/hero-banner.png', caption: '⚽ تدريبات وبطولات أكاديمية أولستار الرياضية بتطاوين' },
  { id: 'SL-2', url: '/logo-badge.jpg', caption: '🏆 افتتاح التسجيل ومشاريع التميز الرياضي والدراسي' }
]

const getUsableSlides = (galleryImages) => {
  if (!Array.isArray(galleryImages)) return []
  return galleryImages
    .map(image => {
      if (!image) return null;
      const url = typeof image === 'string' ? image.trim() : (image?.url?.trim?.() || (typeof image?.url === 'string' ? image.url : ''));
      const caption = image?.caption || 'صور الأكاديمية';
      return { id: image.id || `SL-${Math.random().toString(36).slice(2)}`, url, caption };
    })
    .filter((image) => {
      const url = image?.url || ''
      return url.length > 0 && (/^(https?:\/\/|data:image\/|\/|blob:)/i.test(url))
    })
}

export default function Home() {
  const navigate = useNavigate()
  const [slides, setSlides] = useState(FALLBACK_SLIDES)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [isTouching, setIsTouching] = useState(false)
  const [showPacksModal, setShowPacksModal] = useState(false)
  const autoPlayRef = useRef(null)
  const touchStartRef = useRef(null)

  // Load and subscribe to live images from DB
  useEffect(() => {
    const loadImages = async (syncContent) => {
      const content = syncContent || (await db.getSiteContentAsync());
      const nextSlides = getUsableSlides(content?.gallery_images);
      const finalSlides = nextSlides.length > 0 ? nextSlides : FALLBACK_SLIDES;
      setSlides(finalSlides);
      setCurrentIndex((previous) => Math.min(previous, Math.max(finalSlides.length, 1) - 1));
    };

    // 1. Instant local load
    loadImages(db.getSiteContent());

    // 2. Cloud async fetch with cache-busting
    db.getSiteContentAsync().then(c => c && loadImages(c));

    // 3. Realtime Supabase Sync
    const unsub = db.subscribeToRealtime(null, null, (liveContent) => {
      if (liveContent) loadImages(liveContent);
    });

    return () => {
      if (unsub) unsub();
    };
  }, []);

  const activeSlides = slides && slides.length > 0 ? slides : FALLBACK_SLIDES
  const totalSlides = activeSlides.length

  // Auto-Glide Carousel Timer (Glides every 4 seconds when not hovered or actively touched)
  useEffect(() => {
    if (totalSlides <= 1 || isHovered || isTouching) return

    autoPlayRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalSlides)
    }, 4000)

    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current)
    }
  }, [totalSlides, isHovered, isTouching])

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides)
  }

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides)
  }

  const currentSlide = activeSlides[currentIndex] || activeSlides[0] || FALLBACK_SLIDES[0]

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
      <section
        style={{
          paddingTop: '16px',
          paddingBottom: '24px',
          paddingLeft: 'max(16px, env(safe-area-inset-left, 16px))',
          paddingRight: 'max(16px, env(safe-area-inset-right, 16px))',
          maxWidth: '1280px',
          margin: '0 auto',
          boxSizing: 'border-box'
        }}
      >
        {/* PWA WEB PUSH ACTIVATION BANNER */}
        {'Notification' in window && Notification.permission !== 'granted' && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.15), rgba(255, 149, 0, 0.08))',
            border: '1.5px solid #FFC107',
            borderRadius: '18px',
            padding: '14px 18px',
            marginBottom: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.65)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '42px', height: '42px', borderRadius: '12px',
                background: 'linear-gradient(135deg, #FFC107, #FF9500)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.3rem', flexShrink: 0,
                boxShadow: '0 4px 12px rgba(255,193,7,0.4)'
              }}>
                🔔
              </div>
              <div>
                <div style={{ fontWeight: 900, fontSize: '0.95rem', color: '#FFC107' }}>
                  تفعيل إشعارات الهاتف المباشرة (PWA Push)
                </div>
                <div style={{ fontSize: '0.8rem', color: '#B0BEC5', marginTop: '2px' }}>
                  اضغط هنا لتصلك تنبيهات التمارين والبطولات والطقس فور صدورها!
                </div>
              </div>
            </div>
            <button
              onClick={async () => {
                const granted = await notificationService.requestPermission();
                if (granted) {
                  alert('✅ تم تفعيل إشعارات الهاتف بنجاح!');
                  window.location.reload();
                }
              }}
              style={{
                background: 'linear-gradient(135deg, #00E676, #00B0FF)',
                border: 'none',
                color: '#08090C',
                padding: '10px 20px',
                borderRadius: '12px',
                fontWeight: 900,
                fontSize: '0.88rem',
                cursor: 'pointer',
                fontFamily: 'inherit',
                boxShadow: '0 4px 14px rgba(0,230,118,0.4)'
              }}
            >
              ⚡ تفعيل الإشعارات الآن
            </button>
          </div>
        )}

        {/* CAROUSEL CARD WRAPPER - BULLETPROOF CROSS-FADE & TOUCH SWIPE */}
        <div
          onPointerEnter={(e) => {
            if (e.pointerType === 'mouse') setIsHovered(true)
          }}
          onPointerLeave={(e) => {
            if (e.pointerType === 'mouse') setIsHovered(false)
          }}
          onTouchStart={(e) => {
            setIsTouching(true)
            if (e.touches && e.touches[0]) {
              touchStartRef.current = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
              }
            }
          }}
          onTouchMove={() => {
            // Keep active touch status
            setIsTouching(true)
          }}
          onTouchEnd={(e) => {
            if (touchStartRef.current && e.changedTouches && e.changedTouches[0]) {
              const diffX = touchStartRef.current.x - e.changedTouches[0].clientX
              const diffY = touchStartRef.current.y - e.changedTouches[0].clientY
              // If horizontal movement was greater than vertical movement and exceeds threshold
              if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 30) {
                if (diffX > 0) {
                  // Swiped left (finger right to left)
                  handleNext()
                } else {
                  // Swiped right (finger left to right)
                  handlePrev()
                }
              }
            }
            touchStartRef.current = null
            // Resume auto-slide after touch release with a small buffer
            setTimeout(() => setIsTouching(false), 300)
          }}
          onTouchCancel={() => {
            touchStartRef.current = null
            setIsTouching(false)
          }}
          style={{
            position: 'relative',
            borderRadius: '18px',
            overflow: 'hidden',
            height: 'clamp(140px, 20vh, 220px)',
            width: '100%',
            background: '#0B0F17',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.65)',
            boxSizing: 'border-box',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            WebkitTouchCallout: 'none',
            touchAction: 'pan-y'
          }}
        >
          {/* STACKED CROSS-FADE SLIDES */}
          {activeSlides.map((slide, idx) => {
            const isActive = idx === currentIndex
            return (
              <div
                key={slide.id || idx}
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: isActive ? 1 : 0,
                  pointerEvents: 'none',
                  transition: 'opacity 0.5s ease-in-out',
                  zIndex: isActive ? 2 : 1,
                  transform: 'translateZ(0)',
                  WebkitTransform: 'translateZ(0)',
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  willChange: 'opacity'
                }}
              >
                <img
                  src={slide.url}
                  alt={slide.caption || 'صور الأكاديمية'}
                  loading={idx === 0 ? 'eager' : 'lazy'}
                  fetchPriority={idx === 0 ? 'high' : 'auto'}
                  draggable={false}
                  onError={(e) => {
                    const fallbackUrl = FALLBACK_SLIDES[idx % FALLBACK_SLIDES.length]?.url || FALLBACK_SLIDES[0].url;
                    if (e.currentTarget.dataset.fallbackApplied !== 'true') {
                      e.currentTarget.dataset.fallbackApplied = 'true';
                      e.currentTarget.src = fallbackUrl;
                    }
                  }}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center center',
                    display: 'block',
                    pointerEvents: 'none',
                    userSelect: 'none',
                    WebkitUserDrag: 'none',
                    imageRendering: '-webkit-optimize-contrast'
                  }}
                />
                {/* SUBTLE BOTTOM GRADIENT */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    pointerEvents: 'none',
                    background: 'linear-gradient(180deg, transparent 65%, rgba(6, 9, 15, 0.75) 100%)'
                  }}
                />
              </div>
            )
          })}

          {/* PREV / NEXT COMPACT ARROW BUTTONS */}
          {activeSlides.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                aria-label="Previous Slide"
                style={{
                  position: 'absolute',
                  top: '50%',
                  right: '8px',
                  transform: 'translateY(-50%)',
                  zIndex: 25,
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(0, 0, 0, 0.55)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '16px',
                  backdropFilter: 'blur(6px)',
                  WebkitBackdropFilter: 'blur(6px)',
                  transition: 'all 0.2s ease',
                  touchAction: 'manipulation',
                  userSelect: 'none'
                }}
              >
                ›
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleNext(); }}
                aria-label="Next Slide"
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '8px',
                  transform: 'translateY(-50%)',
                  zIndex: 25,
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(0, 0, 0, 0.55)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '16px',
                  backdropFilter: 'blur(6px)',
                  WebkitBackdropFilter: 'blur(6px)',
                  transition: 'all 0.2s ease',
                  touchAction: 'manipulation',
                  userSelect: 'none'
                }}
              >
                ‹
              </button>
            </>
          )}

          {/* SLIDE CAPTION & DOTS AT BOTTOM */}
          <div
            style={{
              position: 'absolute',
              bottom: '10px',
              right: '12px',
              left: '12px',
              zIndex: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px',
              pointerEvents: 'none'
            }}
          >
            {/* CAPTION PILL */}
            <div
              style={{
                fontSize: '0.76rem',
                fontWeight: 800,
                color: '#FFFFFF',
                background: 'rgba(8, 12, 20, 0.75)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                padding: '3px 10px',
                borderRadius: '8px',
                maxWidth: '75%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                lineHeight: 1.4
              }}
            >
              {currentSlide?.caption || '📸 أكاديمية أولستار الرياضية'}
            </div>

            {/* INDICATOR DOTS */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: 'rgba(8, 12, 20, 0.75)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                padding: '5px 8px',
                borderRadius: '8px',
                pointerEvents: 'auto'
              }}
            >
              {activeSlides.map((_, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(i);
                  }}
                  aria-label={`Go to slide ${i + 1}`}
                  style={{
                    height: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0 1px',
                    touchAction: 'manipulation'
                  }}
                >
                  <span
                    style={{
                      display: 'block',
                      height: '4px',
                      width: i === currentIndex ? '16px' : '4px',
                      borderRadius: '2px',
                      backgroundColor: i === currentIndex ? '#00E676' : 'rgba(255, 255, 255, 0.4)',
                      boxShadow: i === currentIndex ? '0 0 6px #00E676' : 'none',
                      transition: 'all 0.3s ease'
                    }}
                  />
                </button>
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
      </section>
    </div>
  )
}
