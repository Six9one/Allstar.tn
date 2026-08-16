import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { db } from '../services/db';
import ReelPlayer from '../components/ReelPlayer';

// ─── SPORT CONFIG ──────────────────────────────────────────────────────────────
const SPORT_ICONS  = { Football: '⚽', Basketball: '🏀', Handball: '🤾', General: '⭐', Event: '🏆', Training: '💪' };
const SPORT_COLORS = { Football: '#00E676', Basketball: '#FF9500', Handball: '#00E5FF', General: '#FFC107', Event: '#FF9500', Training: '#E040FB' };

const PLAYER_WINDOW = 1;

// ─── TIKTOK STYLE VECTOR ICONS ────────────────────────────────────────────────
function HeartIcon({ filled }) {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill={filled ? '#FE2C55' : 'none'} stroke={filled ? '#FE2C55' : '#FFFFFF'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.6))' }}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function CommentIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="#FFFFFF" style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.6))' }}>
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

function BookmarkIcon({ saved }) {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill={saved ? '#FACE15' : 'none'} stroke={saved ? '#FACE15' : '#FFFFFF'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.6))' }}>
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="#FFFFFF" style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.6))' }}>
      <path d="M10 9V5l7 7-7 7v-4.1c-5 0-8.5 1.6-11 5.1 1-5 4-10 11-11z" />
    </svg>
  );
}

// ─── SINGLE FULLSCREEN REEL SLIDE ─────────────────────────────────────────────
function ReelSlide({
  reel,
  index,
  total,
  isActive,
  isMuted,
  onToggleMute,
  setSlideRef,
  shouldMountPlayer
}) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(() => Math.floor(Math.random() * 45) + 18);
  const [saved, setSaved] = useState(false);
  const [saveCount, setSaveCount] = useState(() => Math.floor(Math.random() * 15) + 4);
  const [commentCount] = useState(() => Math.floor(Math.random() * 8) + 2);
  const [shareCount, setShareCount] = useState(() => Math.floor(Math.random() * 12) + 3);
  const [isCopied, setIsCopied] = useState(false);

  const sportColor = SPORT_COLORS[reel.sport] || '#FFC107';
  const sportIcon  = SPORT_ICONS[reel.sport]  || '⭐';

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

  const handleBookmark = (e) => {
    e.stopPropagation();
    if (saved) {
      setSaved(false);
      setSaveCount(c => c - 1);
    } else {
      setSaved(true);
      setSaveCount(c => c + 1);
    }
  };

  const handleShare = (e) => {
    e.stopPropagation();
    setShareCount(c => c + 1);
    const shareUrl = reel.tiktok_share_url || reel.video_url || reel.url || 'https://allstar.tn/reels';
    const shareText = `🎬 شاهد هذا الريل من أكاديمية أولستار الرياضية بتطاوين!\n${shareUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleCopyLink = (e) => {
    e.stopPropagation();
    const link = reel.tiktok_share_url || reel.video_url || reel.url || 'https://allstar.tn/reels';
    if (navigator.clipboard && link) {
      navigator.clipboard.writeText(link);
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
        {/* PLAYER — mounted within windowing range */}
        {shouldMountPlayer ? (
          <ReelPlayer
            reel={reel}
            url={reel.video_url || reel.url || ''}
            poster={reel.cover_image_url || reel.thumbnail_url || reel.thumbnailUrl || ''}
            isActive={isActive}
            isMuted={isMuted}
            onToggleMute={onToggleMute}
            title={reel.title}
            objectFit="cover"
          />
        ) : (
          <div style={{
            width: '100%', height: '100%', background: '#000',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {(reel.cover_image_url || reel.thumbnail_url) ? (
              <img
                src={reel.cover_image_url || reel.thumbnail_url}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }}
              />
            ) : (
              <span style={{ fontSize: '2rem', opacity: 0.3 }}>🎬</span>
            )}
          </div>
        )}

        {/* TOP CINEMATIC GRADIENT */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '120px',
          background: 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, transparent 100%)',
          pointerEvents: 'none', zIndex: 15
        }} />

        {/* BOTTOM CINEMATIC GRADIENT */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '280px',
          background: 'linear-gradient(0deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 40%, transparent 100%)',
          pointerEvents: 'none', zIndex: 15
        }} />

        {/* ─── RIGHT SIDE TIKTOK-STYLE ACTION COLUMN ────────────────────────── */}
        <div style={{
          position: 'absolute',
          right: '12px',
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 85px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '18px',
          zIndex: 30,
        }}>
          {/* Academy Profile Avatar with + badge */}
          <div style={{ position: 'relative', marginBottom: '4px' }}>
            <div style={{
              width: '46px', height: '46px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #FFC107, #FF9500)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid #FFFFFF',
              boxShadow: '0 4px 12px rgba(0,0,0,0.6)',
              fontSize: '1.25rem'
            }}>
              {sportIcon}
            </div>
            <div style={{
              position: 'absolute', bottom: '-6px', left: '50%', transform: 'translateX(-50%)',
              width: '18px', height: '18px', borderRadius: '50%',
              background: '#FE2C55', color: '#FFF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', fontWeight: 900, border: '1.5px solid #FFF'
            }}>
              +
            </div>
          </div>

          {/* Like Heart Button */}
          <button
            onClick={handleLike}
            aria-label="Like"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
              padding: 0, color: '#FFF'
            }}
          >
            <div style={{
              transform: liked ? 'scale(1.2)' : 'scale(1)',
              transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}>
              <HeartIcon filled={liked} />
            </div>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, textShadow: '0 2px 6px rgba(0,0,0,0.9)' }}>
              {likeCount}
            </span>
          </button>

          {/* Comment Button */}
          <button
            onClick={handleShare}
            aria-label="Comment"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
              padding: 0, color: '#FFF'
            }}
          >
            <CommentIcon />
            <span style={{ fontSize: '0.74rem', fontWeight: 800, textShadow: '0 2px 6px rgba(0,0,0,0.9)' }}>
              {commentCount}
            </span>
          </button>

          {/* Bookmark / Save Button */}
          <button
            onClick={handleBookmark}
            aria-label="Save"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
              padding: 0, color: '#FFF'
            }}
          >
            <div style={{
              transform: saved ? 'scale(1.2)' : 'scale(1)',
              transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}>
              <BookmarkIcon saved={saved} />
            </div>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, textShadow: '0 2px 6px rgba(0,0,0,0.9)' }}>
              {saveCount}
            </span>
          </button>

          {/* WhatsApp / Share Button */}
          <button
            onClick={handleShare}
            aria-label="Share"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
              padding: 0, color: '#FFF'
            }}
          >
            <ShareIcon />
            <span style={{ fontSize: '0.74rem', fontWeight: 800, textShadow: '0 2px 6px rgba(0,0,0,0.9)' }}>
              {shareCount}
            </span>
          </button>
        </div>

        {/* ─── BOTTOM OVERLAY: TITLE ONLY (CLEAN TIKTOK STYLE) ──────────────── */}
        {(reel.title || reel.description) && (
          <div style={{
            position: 'absolute',
            bottom: 'calc(env(safe-area-inset-bottom, 0px) + 82px)',
            left: '16px',
            right: '72px',
            zIndex: 25,
            direction: 'rtl',
            textAlign: 'right',
            pointerEvents: 'none'
          }}>
            {/* Title */}
            {reel.title && (
              <p style={{
                color: '#FFFFFF',
                fontSize: '0.9rem',
                fontWeight: 700,
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

            {/* Description */}
            {reel.description && (
              <p style={{
                color: 'rgba(255,255,255,0.85)',
                fontSize: '0.78rem',
                fontWeight: 500,
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
        )}
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
        لم يتم نشر مقاطع فيديو بعد. يمكنك نشر مقاطع التدريبات والمباريات من لوحة الإدارة.
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

// ─── MAIN FULLSCREEN REELS COMPONENT WITH SWIPE BACK & FLOATING BAR ──────────
export default function Reels() {
  const navigate = useNavigate();
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true); // 🔇 Starts muted for instant autoplay; tap unmutes all videos!

  const containerRef = useRef(null);
  const slideRefs = useRef({});

  // ─── APPLE-STYLE SWIPE FROM LEFT-TO-RIGHT TO GO BACK ───────────────────────
  const touchStartRef = useRef({ x: 0, y: 0, time: 0 });

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };
  };

  const handleTouchEnd = (e) => {
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const deltaTime = Date.now() - touchStartRef.current.time;

    // Horizontal swipe from left edge/left-to-right (min 70px, mostly horizontal)
    if (deltaX > 75 && Math.abs(deltaY) < 60 && deltaTime < 400) {
      navigate('/');
    }
  };

  const setSlideRef = useCallback((index, el) => {
    if (el) {
      slideRefs.current[index] = el;
    } else {
      delete slideRefs.current[index];
    }
  }, []);

  // Fetch reels from dedicated table, with legacy fallback
  useEffect(() => {
    let mounted = true;

    const loadReels = async () => {
      try {
        const academyReels = await db.getAcademyReels();
        if (mounted && Array.isArray(academyReels) && academyReels.length > 0) {
          const valid = academyReels.filter(r => {
            if (!r || r.is_active === false) return false;
            if (r.playback_type === 'tiktok') return !!r.tiktok_video_id;
            const src = (r.video_url || r.url || '').trim();
            return !!src;
          });
          setReels(valid);
          setLoading(false);
          return;
        }
      } catch (e) {
        console.warn('Academy reels fetch failed, trying legacy:', e);
      }

      if (mounted) {
        const content = db.getSiteContent();
        loadLegacyReels(content);
        db.getSiteContentAsync().then(c => {
          if (c && mounted) loadLegacyReels(c);
        });
      }
    };

    const loadLegacyReels = (content) => {
      const r = content?.reels;
      if (Array.isArray(r)) {
        const validReels = r.filter(x => {
          if (!x || x.active === false) return false;
          const src = (x.video_url || x.url || '').trim();
          return !!src;
        });
        setReels(validReels);
      }
      setLoading(false);
    };

    loadReels();

    // Background auto-sync check if TikTok account is connected
    db.getTikTokSyncState().then((syncState) => {
      if (syncState?.connected_username && syncState.auto_sync_enabled !== false) {
        const lastSync = syncState.last_sync_at ? new Date(syncState.last_sync_at).getTime() : 0;
        const now = Date.now();
        // If never synced or last sync was > 20 mins ago, trigger background sync
        if (now - lastSync > 20 * 60 * 1000) {
          db.triggerTikTokSync()
            .then(() => { if (mounted) loadReels(); })
            .catch(() => {});
        }
      }
    }).catch(() => {});

    const unsub = db.subscribeToRealtime(null, null, (live) => {
      if (live && mounted) loadReels();
    });

    return () => {
      mounted = false;
      if (unsub) unsub();
    };
  }, []);

  // IntersectionObserver for active viewport slide
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
        threshold: 0.65
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
      } else if (e.key === 'Escape') {
        navigate('/');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeSlideIndex, reels.length, navigate]);

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
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        position: 'relative',
        width: '100vw',
        height: '100dvh',
        overflow: 'hidden',
        background: '#000000',
        fontFamily: '"Cairo", "Tajawal", sans-serif'
      }}
    >
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
            width: '40px', height: '40px', borderRadius: '50%',
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.25)',
            color: '#FFF', fontSize: '1.2rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
            pointerEvents: 'auto'
          }}
        >
          ←
        </button>

        {/* Center Title */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 193, 7, 0.4)',
          borderRadius: '999px', padding: '5px 14px',
          color: '#FFC107', fontWeight: 900, fontSize: '0.78rem',
          boxShadow: '0 4px 16px rgba(0,0,0,0.6)'
        }}>
          <span>🎬</span>
          <span>ALL-STAR REELS</span>
        </div>

        {/* Audio Mute/Unmute Toggle */}
        <button
          onClick={() => setIsMuted(m => !m)}
          aria-label={isMuted ? "Unmute sound" : "Mute sound"}
          style={{
            height: '40px', minWidth: '40px', borderRadius: '20px',
            background: isMuted ? 'rgba(0,0,0,0.65)' : 'linear-gradient(135deg, rgba(255,193,7,0.35), rgba(255,149,0,0.4))',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: isMuted ? '1px solid rgba(255,255,255,0.25)' : '1.5px solid #FFC107',
            color: isMuted ? '#FFF' : '#FFC107', fontSize: '1rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            padding: isMuted ? '0 12px' : '0 14px',
            boxShadow: isMuted ? '0 4px 16px rgba(0,0,0,0.6)' : '0 4px 20px rgba(255,193,7,0.5)',
            pointerEvents: 'auto',
            transition: 'all 0.2s ease',
            fontFamily: '"Cairo", "Tajawal", sans-serif',
            fontWeight: 800
          }}
        >
          <span>{isMuted ? '🔇' : '🔊'}</span>
          <span style={{ fontSize: '0.72rem', fontWeight: 800 }}>{isMuted ? 'تشغيل الصوت' : 'الصوت يعمل'}</span>
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
            shouldMountPlayer={Math.abs(index - activeSlideIndex) <= PLAYER_WINDOW}
          />
        ))}
      </div>

      {/* ─── FLOATING GLASS BOTTOM NAVIGATION BAR ───────────────────────────── */}
      <div style={{
        position: 'fixed',
        bottom: 'calc(env(safe-area-inset-bottom, 0px) + 10px)',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 32px)',
        maxWidth: '400px',
        height: '56px',
        borderRadius: '28px',
        background: 'rgba(10, 14, 23, 0.75)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.8), 0 0 1px rgba(255,255,255,0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: '0 12px',
        zIndex: 99990,
        boxSizing: 'border-box'
      }}>
        {/* Home */}
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
            color: '#8E9BAE', fontSize: '0.68rem', fontWeight: 700, padding: 0
          }}
        >
          <span style={{ fontSize: '1.25rem' }}>🏠</span>
          <span>الرئيسية</span>
        </button>

        {/* Reels (Active Tab) */}
        <button
          onClick={() => {}}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
            color: '#FFC107', fontSize: '0.68rem', fontWeight: 900, padding: 0
          }}
        >
          <span style={{ fontSize: '1.25rem', filter: 'drop-shadow(0 0 6px rgba(255,193,7,0.6))' }}>🎬</span>
          <span>Reels</span>
        </button>

        {/* Schedule */}
        <button
          onClick={() => navigate('/schedule')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
            color: '#8E9BAE', fontSize: '0.68rem', fontWeight: 700, padding: 0
          }}
        >
          <span style={{ fontSize: '1.25rem' }}>📅</span>
          <span>الجدول</span>
        </button>

        {/* Portal */}
        <button
          onClick={() => navigate('/portal')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
            color: '#8E9BAE', fontSize: '0.68rem', fontWeight: 700, padding: 0
          }}
        >
          <span style={{ fontSize: '1.25rem' }}>👤</span>
          <span>بوابتي</span>
        </button>
      </div>
    </div>
  );
}
