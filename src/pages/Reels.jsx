import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import ReelPlayer, { parseVideoUrl } from '../components/ReelPlayer';

// ─── SPORT CONFIG ──────────────────────────────────────────────────────────────
const SPORT_ICONS  = { Football: '⚽', Basketball: '🏀', Handball: '🤾', General: '🎬', Event: '🏆', Training: '💪' };
const SPORT_COLORS = { Football: '#00E676', Basketball: '#FF9500', Handball: '#00E5FF', General: '#FFC107', Event: '#FF9500', Training: '#E040FB' };

// ─── FULLSCREEN REEL SLIDE ────────────────────────────────────────────────────
function FullscreenReelSlide({ reel, index, total }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(() => Math.floor(Math.random() * 40) + 15);
  const parsed = parseVideoUrl(reel.url);
  const sportColor = SPORT_COLORS[reel.sport] || '#FFC107';
  const sportIcon  = SPORT_ICONS[reel.sport]  || '🎬';

  const handleLike = () => {
    if (liked) {
      setLiked(false);
      setLikeCount(c => c - 1);
    } else {
      setLiked(true);
      setLikeCount(c => c + 1);
    }
  };

  const whatsappText = encodeURIComponent(`🎬 شاهد هذا الريل من أكاديمية أولستار الرياضية بتطاوين!\n${reel.url}`);
  const whatsappUrl  = `https://wa.me/?text=${whatsappText}`;

  return (
    <div style={{
      position: 'relative',
      width: '100vw',
      height: '100dvh',
      scrollSnapAlign: 'start',
      scrollSnapStop: 'always',
      background: '#000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    }}>

      {/* Pure Fullscreen Video Player */}
      <div style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        inset: 0,
        background: '#000',
      }}>
        <ReelPlayer
          url={reel.url}
          autoPlay={true}
          title={reel.title}
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      {/* Subtle Bottom Vignette for Text Legibility */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '200px',
        background: 'linear-gradient(0deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.5) 50%, transparent 100%)',
        pointerEvents: 'none', zIndex: 10
      }} />

      {/* Right Side Action Column (TikTok / Instagram Style) */}
      <div style={{
        position: 'absolute',
        right: '12px',
        bottom: '80px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        zIndex: 25,
      }}>
        {/* Like Button */}
        <button
          onClick={handleLike}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
            color: '#FFF', padding: 0
          }}
        >
          <div style={{
            width: '44px', height: '44px', borderRadius: '50%',
            background: liked ? 'rgba(255, 60, 60, 0.3)' : 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(8px)',
            border: liked ? '1.5px solid #FF3B30' : '1.5px solid rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.3rem', color: liked ? '#FF3B30' : '#FFF'
          }}>
            {liked ? '❤️' : '🤍'}
          </div>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, textShadow: '0 2px 4px rgba(0,0,0,0.9)' }}>
            {likeCount}
          </span>
        </button>

        {/* WhatsApp Share Button */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
            textDecoration: 'none', color: '#FFF'
          }}
        >
          <div style={{
            width: '44px', height: '44px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #25D366, #128C7E)',
            boxShadow: '0 4px 15px rgba(37,211,102,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.2rem'
          }}>
            📤
          </div>
          <span style={{ fontSize: '0.68rem', fontWeight: 800, textShadow: '0 2px 4px rgba(0,0,0,0.9)' }}>
            واتساب
          </span>
        </a>

        {/* Direct App Link */}
        {parsed.type !== 'direct' && (
          <a
            href={reel.url}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
              textDecoration: 'none', color: '#FFF'
            }}
          >
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%',
              background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
              border: '1.5px solid rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1rem'
            }}>
              🔗
            </div>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, textShadow: '0 2px 4px rgba(0,0,0,0.9)' }}>
              {parsed.platformName}
            </span>
          </a>
        )}
      </div>

      {/* Bottom Info Overlay (Title & Sport Tag) */}
      <div style={{
        position: 'absolute',
        bottom: '72px',
        left: '16px',
        right: '72px',
        zIndex: 20,
        direction: 'rtl',
        textAlign: 'right'
      }}>
        {/* Sport Tag & Author */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
          <span style={{
            background: 'rgba(0,0,0,0.7)',
            border: `1px solid ${sportColor}88`,
            backdropFilter: 'blur(6px)',
            borderRadius: '8px', padding: '2px 8px',
            color: '#FFF', fontSize: '0.75rem', fontWeight: 800
          }}>
            {sportIcon} {reel.sport || 'عام'}
          </span>
          <span style={{ color: '#FFC107', fontWeight: 800, fontSize: '0.78rem' }}>
            ⭐ All-Star
          </span>
        </div>

        {/* Reel Title */}
        {reel.title && (
          <p style={{
            color: '#FFFFFF',
            fontSize: '0.86rem',
            fontWeight: 700,
            margin: 0,
            lineHeight: 1.4,
            textShadow: '0 2px 6px rgba(0,0,0,0.9)',
            maxHeight: '44px',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {reel.title}
          </p>
        )}
      </div>

    </div>
  );
}

// ─── EMPTY STATE ───────────────────────────────────────────────────────────────
function EmptyState() {
  const navigate = useNavigate();
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', height: '100dvh',
      fontFamily: '"Cairo", "Tajawal", sans-serif', textAlign: 'center',
      padding: '40px 20px', background: '#000', color: '#FFF'
    }}>
      <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🎬</div>
      <h2 style={{ color: '#FFF', fontSize: '1.4rem', fontWeight: 900, margin: '0 0 8px' }}>
        ريلز وأبرز لحظات الأكاديمية
      </h2>
      <p style={{ color: '#8E9BAE', fontSize: '0.9rem', margin: '0 0 24px 0', maxWidth: '280px', lineHeight: 1.6 }}>
        سيتم إضافة مقاطع التدريبات والمباريات قريباً من لوحة الإدارة
      </p>
      <button
        onClick={() => navigate('/')}
        style={{
          padding: '12px 28px', borderRadius: '999px',
          background: 'linear-gradient(135deg, #FFC107, #FF9500)',
          color: '#000', border: 'none', fontWeight: 900, fontSize: '0.9rem',
          cursor: 'pointer'
        }}
      >
        العودة للرئيسية 🏠
      </button>
    </div>
  );
}

// ─── MAIN FULLSCREEN REELS FEED PAGE ──────────────────────────────────────────
export default function Reels() {
  const navigate = useNavigate();
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);

  useEffect(() => {
    const load = (content) => {
      const r = content?.reels;
      if (Array.isArray(r)) {
        setReels(r.filter(x => x && x.url));
      }
      setLoading(false);
    };

    // 1. Instant local load
    load(db.getSiteContent());

    // 2. Cloud async sync
    db.getSiteContentAsync().then(c => c && load(c));

    // 3. Realtime Supabase subscription
    const unsub = db.subscribeToRealtime(null, null, (live) => {
      if (live) load(live);
    });
    return () => { if (unsub) unsub(); };
  }, []);

  if (loading) {
    return (
      <div style={{
        height: '100dvh', background: '#000', color: '#FFC107',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1rem', fontWeight: 900
      }}>
        ⏳ جاري تحميل الريلز...
      </div>
    );
  }

  if (reels.length === 0) {
    return <EmptyState />;
  }

  return (
    <div style={{
      position: 'relative',
      width: '100vw',
      height: '100dvh',
      overflow: 'hidden',
      background: '#000'
    }}>
      {/* Top Floating Back Arrow Only */}
      <button
        onClick={() => navigate('/')}
        aria-label="Back"
        style={{
          position: 'fixed', top: 'calc(env(safe-area-inset-top, 0px) + 14px)',
          left: '16px', zIndex: 99999,
          width: '38px', height: '38px', borderRadius: '50%',
          background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.25)',
          color: '#FFF', fontSize: '1.2rem', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.6)'
        }}
      >
        ←
      </button>

      {/* Fullscreen Vertical Snap Scroll Container */}
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
          <FullscreenReelSlide
            key={reel.id}
            reel={reel}
            index={index}
            total={reels.length}
          />
        ))}
      </div>
    </div>
  );
}
