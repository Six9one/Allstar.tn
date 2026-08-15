import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import logoMain from '../assets/logo-light.png'
import { db } from '../services/db'
import ReelPlayer, { parseVideoUrl } from '../components/ReelPlayer'

const FALLBACK_SLIDES = [
  { id: 'SL-1', url: 'https://hsylnrzxeyqxczdalurj.supabase.co/storage/v1/object/public/carousel/live-slide-1-1786751135590.webp', caption: '⚽ تدريبات وبطولات أكاديمية أولستار الرياضية' },
  { id: 'SL-2', url: 'https://hsylnrzxeyqxczdalurj.supabase.co/storage/v1/object/public/carousel/live-slide-2-1786751135909.webp', caption: '🏆 افتتاح التسجيل ومشاريع التميز الرياضي والدراسي' }
]

const getUsableSlides = (galleryImages) => {
  if (!Array.isArray(galleryImages)) return []
  return galleryImages.filter((image) => {
    const url = image?.url?.trim?.() || (typeof image?.url === 'string' ? image.url : '')
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
  const [reels, setReels] = useState(() => db.getReels())
  const [activeReel, setActiveReel] = useState(null)
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
      if (Array.isArray(content?.reels)) {
        setReels(content.reels.filter(r => {
          if (!r || r.active === false) return false;
          const src = (r.video_url || r.url || '').trim();
          if (!src || /tiktok\.com|facebook\.com|fb\.watch/i.test(src)) return false;
          return true;
        }));
      }
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

  // Auto-Glide Carousel Timer (Glides every 4 seconds when not hovered or actively touched)
  useEffect(() => {
    if (slides.length <= 1 || isHovered || isTouching) return

    autoPlayRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length)
    }, 4000)

    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current)
    }
  }, [slides.length, isHovered, isTouching])

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
            borderRadius: '24px',
            overflow: 'hidden',
            height: 'clamp(230px, 44vh, 480px)',
            width: '100%',
            background: '#0F131C',
            border: '1.5px solid rgba(0, 230, 118, 0.35)',
            boxShadow: '0 14px 40px rgba(0, 0, 0, 0.85), 0 0 25px rgba(0, 230, 118, 0.15)',
            boxSizing: 'border-box',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            WebkitTouchCallout: 'none',
            touchAction: 'pan-y'
          }}
        >
          {/* STACKED CROSS-FADE SLIDES (100% RTL & MOBILE SAFE) */}
          {slides.map((slide, idx) => {
            const isActive = idx === currentIndex
            return (
              <div
                key={slide.id || idx}
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: isActive ? 1 : 0,
                  pointerEvents: 'none',
                  transition: 'opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
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
                    WebkitUserDrag: 'none'
                  }}
                />
                {/* DARK GRADIENT OVERLAY */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    pointerEvents: 'none',
                    background: 'linear-gradient(180deg, rgba(8,9,12,0.15) 0%, rgba(8,9,12,0.4) 50%, rgba(8,9,12,0.92) 100%)'
                  }}
                />
              </div>
            )
          })}

          {/* PREV / NEXT ARROW BUTTONS */}
          {slides.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                aria-label="Previous Slide"
                style={{
                  position: 'absolute',
                  top: '50%',
                  right: '12px',
                  transform: 'translateY(-50%)',
                  zIndex: 25,
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(0, 0, 0, 0.65)',
                  border: '1.5px solid rgba(255, 255, 255, 0.3)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '22px',
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
                  left: '12px',
                  transform: 'translateY(-50%)',
                  zIndex: 25,
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(0, 0, 0, 0.65)',
                  border: '1.5px solid rgba(255, 255, 255, 0.3)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '22px',
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
              bottom: '16px',
              right: '18px',
              left: '18px',
              zIndex: 20,
              color: '#FFFFFF',
              pointerEvents: 'none'
            }}
          >
            <div
              style={{
                fontSize: 'clamp(0.88rem, 2.5vw, 1.25rem)',
                fontWeight: 900,
                textShadow: '0 2px 10px rgba(0,0,0,0.95)',
                lineHeight: 1.35
              }}
            >
              {currentSlide?.caption || '📸 ألبوم الصور الرسمية لأكاديمية أولستار بتطاوين'}
            </div>

            {/* INDICATOR DOTS WITH LARGE TOUCH TARGETS */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '10px', pointerEvents: 'auto' }}>
              {slides.map((_, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(i);
                  }}
                  aria-label={`Go to slide ${i + 1}`}
                  style={{
                    height: '28px',
                    minWidth: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0 2px',
                    touchAction: 'manipulation'
                  }}
                >
                  <span
                    style={{
                      display: 'block',
                      height: '8px',
                      width: i === currentIndex ? '26px' : '8px',
                      borderRadius: '4px',
                      backgroundColor: i === currentIndex ? '#00E676' : 'rgba(255, 255, 255, 0.45)',
                      boxShadow: i === currentIndex ? '0 0 8px #00E676' : 'none',
                      transition: 'all 0.3s ease'
                    }}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 🎬 REELS SHOWCASE ROW (HOME PAGE) */}
        {reels.length > 0 && (
          <div style={{ marginTop: '28px', width: '100%' }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: '14px', padding: '0 4px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.4rem' }}>🎬</span>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 900, margin: 0, color: '#FFF' }}>
                  أبرز اللحظات (Reels)
                </h2>
              </div>
              <Link
                to="/reels"
                style={{
                  color: '#FFC107', fontSize: '0.8rem', fontWeight: 800,
                  textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px'
                }}
              >
                <span>مشاهدة الكل</span>
                <span>‹</span>
              </Link>
            </div>

            {/* Horizontal scrollable reels cards */}
            <div style={{
              display: 'flex', gap: '14px', overflowX: 'auto',
              paddingBottom: '10px', scrollSnapType: 'x mandatory',
              WebkitOverflowScrolling: 'touch'
            }}>
              {reels.map((reel) => {
                const videoSrc = reel.video_url || reel.url || '';
                const thumb = reel.thumbnail_url || reel.thumbnailUrl || '';
                return (
                  <div
                    key={reel.id}
                    onClick={() => setActiveReel(reel)}
                    style={{
                      flex: '0 0 135px',
                      aspectRatio: '9/16',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      position: 'relative',
                      background: '#0F131C',
                      border: '1px solid rgba(255,255,255,0.1)',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.6)',
                      cursor: 'pointer',
                      scrollSnapAlign: 'start',
                      transition: 'transform 0.2s ease',
                    }}
                  >
                    {thumb ? (
                      <img
                        src={thumb}
                        alt={reel.title || 'Reel'}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{
                        width: '100%', height: '100%',
                        background: 'linear-gradient(145deg, #090E18, #141C30)',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px'
                      }}>
                        <span style={{ fontSize: '2rem' }}>🎬</span>
                        <span style={{ fontSize: '0.65rem', color: '#FFC107', fontWeight: 800 }}>
                          {reel.sport || 'ريل'}
                        </span>
                      </div>
                    )}

                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.8) 100%)'
                    }} />

                    {/* Play button */}
                    <div style={{
                      position: 'absolute', top: '50%', left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '38px', height: '38px', borderRadius: '50%',
                      background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)',
                      border: '1.5px solid rgba(255,255,255,0.4)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1rem', color: '#FFF'
                    }}>
                      ▶
                    </div>

                    {reel.title && (
                      <div style={{
                        position: 'absolute', bottom: '8px', left: '8px', right: '8px',
                        color: '#FFF', fontSize: '0.72rem', fontWeight: 800,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                      }}>
                        {reel.title}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* REELS LIGHTBOX ON HOME */}
        {activeReel && (
          <div
            onClick={(e) => { if (e.target === e.currentTarget) setActiveReel(null); }}
            style={{
              position: 'fixed', inset: 0, zIndex: 9999999,
              background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(12px)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              padding: '16px', boxSizing: 'border-box'
            }}
          >
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, padding: '16px 20px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10
            }}>
              <span style={{ color: '#FFF', fontWeight: 800, fontSize: '0.95rem' }}>
                {activeReel.title || 'ريل الأكاديمية'}
              </span>
              <button
                onClick={() => setActiveReel(null)}
                style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)',
                  color: '#FFF', fontSize: '1.2rem', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >✕</button>
            </div>

            <div style={{
              width: '100%', maxWidth: '420px', height: '75vh', maxHeight: '720px',
              borderRadius: '20px', overflow: 'hidden', background: '#000',
              boxShadow: '0 20px 50px rgba(0,0,0,0.9)'
            }}>
              <ReelPlayer
                url={activeReel.video_url || activeReel.url}
                poster={activeReel.thumbnail_url || activeReel.thumbnailUrl}
                isActive={true}
                isMuted={false}
                title={activeReel.title}
              />
            </div>

            <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`🎬 شاهد هذا الريل من أكاديمية أولستار الرياضية!\n${activeReel.video_url || activeReel.url}`)}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  padding: '10px 22px', borderRadius: '999px',
                  background: 'linear-gradient(135deg, #25D366, #128C7E)',
                  color: '#FFF', fontWeight: 900, fontSize: '0.84rem', textDecoration: 'none'
                }}
              >
                📤 مشاركة على واتساب
              </a>
            </div>
          </div>
        )}

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
