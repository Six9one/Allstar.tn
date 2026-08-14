import React, { useState, useEffect, useRef } from 'react'
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
  const [slides, setSlides] = useState(FALLBACK_SLIDES)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
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
        {/* CAROUSEL CARD WRAPPER */}
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            position: 'relative',
            borderRadius: '22px',
            overflow: 'hidden',
            height: 'clamp(170px, 28vh, 280px)',
            width: '100%',
            background: '#0F131C',
            border: '1.5px solid rgba(0, 230, 118, 0.35)',
            boxShadow: '0 12px 35px rgba(0, 0, 0, 0.85), 0 0 20px rgba(0, 230, 118, 0.12)',
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
                    objectPosition: 'center',
                    display: 'block'
                  }}
                />
                {/* DARK GRADIENT OVERLAY FOR TEXT READABILITY */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, rgba(8,9,12,0.15) 0%, rgba(8,9,12,0.85) 100%)'
                  }}
                />
              </div>
            ))}
          </div>

          {/* SLIDE CAPTION & DOTS AT BOTTOM */}
          <div
            style={{
              position: 'absolute',
              bottom: '14px',
              right: '16px',
              left: '16px',
              zIndex: 10,
              color: '#FFFFFF'
            }}
          >
            <div
              style={{
                fontSize: 'clamp(0.82rem, 1.8vw, 1.15rem)',
                fontWeight: 900,
                textShadow: '0 2px 8px rgba(0,0,0,0.9)',
                lineHeight: 1.25
              }}
            >
              {currentSlide?.caption || '📸 ألبوم الصور الرسمية لأكاديمية أولستار بتطاوين'}
            </div>

            {/* INDICATOR DOTS */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  style={{
                    height: '6px',
                    width: i === currentIndex ? '18px' : '6px',
                    borderRadius: '3px',
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
      </main>
    </div>
  )
}
