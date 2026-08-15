import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import ReelPlayer from '../components/ReelPlayer';

// ─── SPORT CONFIG ──────────────────────────────────────────────────────────────
const SPORT_ICONS  = { Football: '⚽', Basketball: '🏀', Handball: '🤾', General: '🎬', Event: '🏆', Training: '💪' };
const SPORT_COLORS = { Football: '#00E676', Basketball: '#FF9500', Handball: '#00E5FF', General: '#FFC107', Event: '#FF9500', Training: '#E040FB' };

// ─── SINGLE FULLSCREEN REEL SLIDE ─────────────────────────────────────────────
function ReelSlide({
  reel,
  index,
  total,
  isActive,
  isMuted,
  onToggleMute,
  setSlideRef
}) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(() => Math.floor(Math.random() * 30) + 12);
  const [isCopied, setIsCopied] = useState(false);

  const sportColor = SPORT_COLORS[reel.sport] || '#FFC107';
  const sportIcon  = SPORT_ICONS[reel.sport]  || '🎬';
  const videoSrc   = reel.video_url || reel.url || '';
  const posterSrc  = reel.thumbnail_url || reel.thumbnailUrl || '';

  const handleLike = (e) => {
    e.stopPropagation();
    if (liked) {
      setLiked(false);
      setLikeCount(c => c - 1);
    } else {
      setLiked(true);
      setLikeCount(c => c + 1);
    }
  };

  const handleShare = (e) => {
    e.stopPropagation();
    const shareText = `🎬 شاهد هذا الريل من أكاديمية أولستار الرياضية بتطاوين!\n${videoSrc}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleCopyLink = (e) => {
    e.stopPropagation();
    if (navigator.clipboard && videoSrc) {
      navigator.clipboard.writeText(videoSrc);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div
      ref={(el) => setSlideRef(index, el)}
      data-index={index}
      style={{
        position: 'relative',
        width: '100%',
        height: '100dvh',
        scrollSnapAlign: 'start',
        scrollSnapStop: 'always',
        background: '#000000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        boxSizing: 'border-box'
      }}
    >
      {/* ─── VIDEO CONTAINER (RESPONSIVE: 100% MOBILE, 9:16 CENTERED DESKTOP) ─── */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '440px',
        height: '100%',
        background: '#000000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 0 50px rgba(0,0,0,0.9)'
      }}>
        {/* NATIVE HTML5 DIRECT PLAYER */}
        <ReelPlayer
          url={videoSrc}
          poster={posterSrc}
          isActive={isActive}
          isMuted={isMuted}
          onToggleMute={onToggleMute}
          title={reel.title}
          objectFit="cover"
        />

        {/* TOP CINEMATIC GRADIENT */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '140px',
          background: 'linear-gradient(180deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)',
          pointerEvents: 'none', zIndex: 15
        }} />

        {/* BOTTOM CINEMATIC GRADIENT */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '260px',
          background: 'linear-gradient(0deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 45%, transparent 100%)',
          pointerEvents: 'none', zIndex: 15
        }} />

        {/* ─── RIGHT SIDE ACTION COLUMN (OUR ACADEMY UI) ────────────────────── */}
        <div style={{
          position: 'absolute',
          right: '12px',
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 28px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          zIndex: 30,
        }}>
          {/* Like Heart Button */}
          <button
            onClick={handleLike}
            aria-label="Like"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
              color: '#FFF', padding: 0
            }}
          >
            <div style={{
              width: '46px', height: '46px', borderRadius: '50%',
              background: liked ? 'rgba(255, 59, 48, 0.3)' : 'rgba(0, 0, 0, 0.55)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: liked ? '2px solid #FF3B30' : '1.5px solid rgba(255,255,255,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.4rem', color: liked ? '#FF3B30' : '#FFF',
              transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}>
              {liked ? '❤️' : '🤍'}
            </div>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, textShadow: '0 2px 6px rgba(0,0,0,0.9)' }}>
              {likeCount}
            </span>
          </button>

          {/* WhatsApp Share Button */}
          <button
            onClick={handleShare}
            aria-label="Share on WhatsApp"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
              color: '#FFF', padding: 0
            }}
          >
            <div style={{
              width: '46px', height: '46px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #25D366, #128C7E)',
              boxShadow: '0 4px 16px rgba(37,211,102,0.45)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.3rem'
            }}>
              📤
            </div>
            <span style={{ fontSize: '0.68rem', fontWeight: 800, textShadow: '0 2px 6px rgba(0,0,0,0.9)' }}>
              واتساب
            </span>
          </button>

          {/* Copy Direct Link Button */}
          <button
            onClick={handleCopyLink}
            aria-label="Copy Link"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
              color: '#FFF', padding: 0
            }}
          >
            <div style={{
              width: '42px', height: '42px', borderRadius: '50%',
              background: isCopied ? 'rgba(0, 230, 118, 0.3)' : 'rgba(0, 0, 0, 0.55)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: isCopied ? '1.5px solid #00E676' : '1.5px solid rgba(255,255,255,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.1rem', color: isCopied ? '#00E676' : '#FFF'
            }}>
              {isCopied ? '✓' : '🔗'}
            </div>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, textShadow: '0 2px 6px rgba(0,0,0,0.9)' }}>
              {isCopied ? 'تم النسخ' : 'رابط'}
            </span>
          </button>

          {/* Sport Tag Circle */}
          <div style={{
            width: '40px', height: '40px', borderRadius: '50%',
            background: 'rgba(0,0,0,0.6)',
            border: `1.5px solid ${sportColor}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.1rem',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)'
          }}>
            {sportIcon}
          </div>
        </div>

        {/* ─── BOTTOM OVERLAY: ACADEMY PROFILE & TITLE (RTL) ────────────────── */}
        <div style={{
          position: 'absolute',
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)',
          left: '16px',
          right: '72px',
          zIndex: 25,
          direction: 'rtl',
          textAlign: 'right',
          pointerEvents: 'none'
        }}>
          {/* Academy Identity & Sport */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #FFC107, #FF9500)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.9rem', fontWeight: 900, color: '#000',
              boxShadow: '0 2px 8px rgba(0,0,0,0.5)'
            }}>
              ⭐
            </div>
            <div>
              <div style={{ color: '#FFF', fontWeight: 900, fontSize: '0.88rem', lineHeight: 1.2, textShadow: '0 2px 6px rgba(0,0,0,0.9)' }}>
                أكاديمية أولستار الرياضية
              </div>
              <div style={{ color: sportColor, fontSize: '0.72rem', fontWeight: 800, textShadow: '0 2px 6px rgba(0,0,0,0.9)' }}>
                {sportIcon} {reel.sport || 'عام'} · {index + 1} / {total}
              </div>
            </div>
          </div>

          {/* Title */}
          {reel.title && (
            <p style={{
              color: '#FFFFFF',
              fontSize: '0.88rem',
              fontWeight: 800,
              margin: '0 0 4px 0',
              lineHeight: 1.4,
              textShadow: '0 2px 8px rgba(0,0,0,0.95)',
              maxHeight: '44px',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {reel.title}
            </p>
          )}

          {/* Description (if present) */}
          {reel.description && (
            <p style={{
              color: 'rgba(255,255,255,0.85)',
              fontSize: '0.76rem',
              fontWeight: 600,
              margin: 0,
              lineHeight: 1.3,
              textShadow: '0 2px 6px rgba(0,0,0,0.95)',
              maxHeight: '34px',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {reel.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── EMPTY STATE COMPONENT ────────────────────────────────────────────────────
function EmptyReelsState() {
  const navigate = useNavigate();
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', height: '100dvh', width: '100vw',
      fontFamily: '"Cairo", "Tajawal", sans-serif', textAlign: 'center',
      padding: '40px 20px', background: '#000', color: '#FFF',
      boxSizing: 'border-box', direction: 'rtl'
    }}>
      <div style={{ fontSize: '4.5rem', marginBottom: '16px' }}>🎬</div>
      <h2 style={{ color: '#FFF', fontSize: '1.4rem', fontWeight: 900, margin: '0 0 8px' }}>
        ريلز وأبرز لحظات الأكاديمية
      </h2>
      <p style={{ color: '#8E9BAE', fontSize: '0.9rem', margin: '0 0 24px 0', maxWidth: '300px', lineHeight: 1.6 }}>
        لم يتم نشر مقاطع فيديو بعد. يمكنك رفع مقاطع التدريبات والمباريات من لوحة الإدارة.
      </p>
      <button
        onClick={() => navigate('/')}
        style={{
          padding: '12px 32px', borderRadius: '999px',
          background: 'linear-gradient(135deg, #FFC107, #FF9500)',
          color: '#000', border: 'none', fontWeight: 900, fontSize: '0.9rem',
          cursor: 'pointer', boxShadow: '0 4px 20px rgba(255,193,7,0.35)'
        }}
      >
        العودة للرئيسية 🏠
      </button>
    </div>
  );
}

// ─── MAIN FULLSCREEN REELS COMPONENT (SMART INTERSECTION OBSERVER) ─────────────
export default function Reels() {
  const navigate = useNavigate();
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);

  const containerRef = useRef(null);
  const slideRefs = useRef({});

  const setSlideRef = useCallback((index, el) => {
    if (el) {
      slideRefs.current[index] = el;
    } else {
      delete slideRefs.current[index];
    }
  }, []);

  // Fetch site reels
  useEffect(() => {
    const load = (content) => {
      const r = content?.reels;
      if (Array.isArray(r)) {
        // Filter out empty, inactive, or non-video web links (e.g. raw TikTok/Facebook page URLs)
        const validReels = r.filter(x => {
          if (!x || x.active === false) return false;
          const src = (x.video_url || x.url || '').trim();
          if (!src) return false;
          // Exclude raw TikTok / Facebook webpage URLs from native playback feed
          if (/tiktok\.com|facebook\.com|fb\.watch/i.test(src)) return false;
          return true;
        });
        setReels(validReels);
      }
      setLoading(false);
    };

    load(db.getSiteContent());
    db.getSiteContentAsync().then(c => c && load(c));

    const unsub = db.subscribeToRealtime(null, null, (live) => {
      if (live) load(live);
    });
    return () => { if (unsub) unsub(); };
  }, []);

  // Set up IntersectionObserver to detect which slide is active in viewport
  useEffect(() => {
    if (reels.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-index'));
            if (!isNaN(index)) {
              setActiveSlideIndex(index);
            }
          }
        });
      },
      {
        root: containerRef.current,
        threshold: 0.65 // Slide must be at least 65% visible to become active
      }
    );

    Object.values(slideRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, [reels]);

  // Keyboard navigation on desktop (Arrow Up / Arrow Down)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        const nextIndex = Math.min(activeSlideIndex + 1, reels.length - 1);
        slideRefs.current[nextIndex]?.scrollIntoView({ behavior: 'smooth' });
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        const prevIndex = Math.max(activeSlideIndex - 1, 0);
        slideRefs.current[prevIndex]?.scrollIntoView({ behavior: 'smooth' });
      } else if (e.key === 'm' || e.key === 'M') {
        setIsMuted(m => !m);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeSlideIndex, reels.length]);

  if (loading) {
    return (
      <div style={{
        height: '100dvh', width: '100vw', background: '#000', color: '#FFC107',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        fontSize: '1rem', fontWeight: 900, gap: '14px', direction: 'rtl'
      }}>
        <div style={{
          width: '46px', height: '46px',
          border: '3px solid rgba(255,193,7,0.2)',
          borderTopColor: '#FFC107',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        <span>جاري تحميل ريلز الأكاديمية...</span>
      </div>
    );
  }

  if (reels.length === 0) {
    return <EmptyReelsState />;
  }

  return (
    <div style={{
      position: 'relative',
      width: '100vw',
      height: '100dvh',
      overflow: 'hidden',
      background: '#000000',
      fontFamily: '"Cairo", "Tajawal", sans-serif'
    }}>
      {/* ─── FLOATING TOP HEADER ────────────────────────────────────────────── */}
      <div style={{
        position: 'fixed',
        top: 'calc(env(safe-area-inset-top, 0px) + 12px)',
        left: '16px',
        right: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 99999,
        pointerEvents: 'none'
      }}>
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          aria-label="Back to Home"
          style={{
            width: '42px', height: '42px', borderRadius: '50%',
            background: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1.5px solid rgba(255,255,255,0.25)',
            color: '#FFF', fontSize: '1.2rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
            pointerEvents: 'auto'
          }}
        >
          ←
        </button>

        {/* Center Pill */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1.5px solid rgba(255, 193, 7, 0.4)',
          borderRadius: '999px', padding: '6px 16px',
          color: '#FFC107', fontWeight: 900, fontSize: '0.8rem',
          boxShadow: '0 4px 16px rgba(0,0,0,0.6)'
        }}>
          <span>🎬</span>
          <span>ALL-STAR REELS</span>
        </div>

        {/* Global Sound Mute/Unmute Toggle */}
        <button
          onClick={() => setIsMuted(m => !m)}
          aria-label={isMuted ? "Unmute" : "Mute"}
          style={{
            width: '42px', height: '42px', borderRadius: '50%',
            background: isMuted ? 'rgba(0,0,0,0.65)' : 'rgba(255, 193, 7, 0.25)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: isMuted ? '1.5px solid rgba(255,255,255,0.25)' : '1.5px solid #FFC107',
            color: isMuted ? '#FFF' : '#FFC107', fontSize: '1.1rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
            pointerEvents: 'auto'
          }}
        >
          {isMuted ? '🔇' : '🔊'}
        </button>
      </div>

      {/* ─── FULLSCREEN VERTICAL SNAP SCROLL FEED ───────────────────────────── */}
      <div
        ref={containerRef}
        style={{
          width: '100vw',
          height: '100dvh',
          overflowY: 'scroll',
          scrollSnapType: 'y mandatory',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        <style>{`
          ::-webkit-scrollbar { display: none; }
        `}</style>

        {reels.map((reel, index) => (
          <ReelSlide
            key={reel.id || index}
            reel={reel}
            index={index}
            total={reels.length}
            isActive={index === activeSlideIndex}
            isMuted={isMuted}
            onToggleMute={() => setIsMuted(m => !m)}
            setSlideRef={setSlideRef}
          />
        ))}
      </div>
    </div>
  );
}
