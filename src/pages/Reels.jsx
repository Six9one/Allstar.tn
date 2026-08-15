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
      width: '100%',
      height: '100dvh',
      scrollSnapAlign: 'start',
      scrollSnapStop: 'always',
      background: '#000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      boxSizing: 'border-box',
    }}>

      {/* Video Player (Fills the screen) */}
      <div style={{
        width: '100%',
        maxWidth: '480px',
        height: '100%',
        position: 'relative',
        background: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <ReelPlayer
          url={reel.url}
          autoPlay={true}
          title={reel.title}
          style={{ width: '100%', height: '100%', borderRadius: 0 }}
        />
      </div>

      {/* Gradient Overlays for Readability */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '120px',
        background: 'linear-gradient(180deg, rgba(0,0,0,0.85) 0%, transparent 100%)',
        pointerEvents: 'none', zIndex: 10
      }} />
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '220px',
        background: 'linear-gradient(0deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 50%, transparent 100%)',
        pointerEvents: 'none', zIndex: 10
      }} />

      {/* Right Side Action Bar (TikTok / Instagram Style) */}
      <div style={{
        position: 'absolute',
        right: '12px',
        bottom: '100px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '18px',
        zIndex: 25,
      }}>
        {/* Like Button */}
        <button
          onClick={handleLike}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
            color: '#FFF', padding: 0
          }}
        >
          <div style={{
            width: '46px', height: '46px', borderRadius: '50%',
            background: liked ? 'rgba(255, 60, 60, 0.25)' : 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(10px)',
            border: liked ? '1.5px solid #FF3B30' : '1.5px solid rgba(255,255,255,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.4rem', color: liked ? '#FF3B30' : '#FFF',
            transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}>
            {liked ? '❤️' : '🤍'}
          </div>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
            {likeCount}
          </span>
        </button>

        {/* WhatsApp Share Button */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
            textDecoration: 'none', color: '#FFF'
          }}
        >
          <div style={{
            width: '46px', height: '46px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #25D366, #128C7E)',
            boxShadow: '0 4px 15px rgba(37,211,102,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.3rem'
          }}>
            📤
          </div>
          <span style={{ fontSize: '0.7rem', fontWeight: 800, textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
            واتساب
          </span>
        </a>

        {/* Direct Platform Link */}
        {parsed.type !== 'direct' && (
          <a
            href={reel.url}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
              textDecoration: 'none', color: '#FFF'
            }}
          >
            <div style={{
              width: '46px', height: '46px', borderRadius: '50%',
              background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)',
              border: '1.5px solid rgba(255,255,255,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.1rem'
            }}>
              🔗
            </div>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
              {parsed.platformName}
            </span>
          </a>
        )}

        {/* Sport Icon Badge */}
        <div style={{
          width: '40px', height: '40px', borderRadius: '50%',
          background: 'rgba(0,0,0,0.6)',
          border: `1.5px solid ${sportColor}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.1rem'
        }}>
          {sportIcon}
        </div>
      </div>

      {/* Bottom Info Overlay (Title, Sport, Academy Details) */}
      <div style={{
        position: 'absolute',
        bottom: '80px',
        left: '16px',
        right: '72px',
        zIndex: 20,
        direction: 'rtl',
        textAlign: 'right'
      }}>
        {/* Academy Profile & Sport Tag */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #FFC107, #FF9500)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.9rem', fontWeight: 900, color: '#000'
          }}>
            ⭐
          </div>
          <div>
            <div style={{ color: '#FFF', fontWeight: 900, fontSize: '0.88rem', lineHeight: 1.2 }}>
              أكاديمية أولستار الرياضية
            </div>
            <div style={{ color: sportColor, fontSize: '0.72rem', fontWeight: 800 }}>
              {sportIcon} {reel.sport || 'عام'} · ريل {index + 1} من {total}
            </div>
          </div>
        </div>

        {/* Reel Title */}
        {reel.title && (
          <p style={{
            color: '#FFFFFF',
            fontSize: '0.86rem',
            fontWeight: 700,
            margin: '0 0 8px 0',
            lineHeight: 1.4,
            textShadow: '0 2px 6px rgba(0,0,0,0.9)',
            maxHeight: '48px',
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
      padding: '40px 20px', background: '#05070D', color: '#FFF'
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
      {/* Top Floating Header (Back + Title) */}
      <div style={{
        position: 'fixed', top: 'calc(env(safe-area-inset-top, 0px) + 12px)',
        left: '16px', right: '16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        zIndex: 9999, pointerEvents: 'auto'
      }}>
        {/* Back to Home Button */}
        <button
          onClick={() => navigate('/')}
          style={{
            width: '42px', height: '42px', borderRadius: '50%',
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)',
            border: '1.5px solid rgba(255,255,255,0.25)',
            color: '#FFF', fontSize: '1.2rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
          }}
        >
          ←
        </button>

        {/* Reels Pill */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)',
          border: '1.5px solid rgba(255, 193, 7, 0.4)',
          borderRadius: '999px', padding: '6px 16px',
          color: '#FFC107', fontWeight: 900, fontSize: '0.82rem',
          boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
        }}>
          <span>🎬</span>
          <span>REELS</span>
        </div>
      </div>

      {/* Fullscreen Vertical Snap Scroll Container */}
      <div
        ref={containerRef}
        style={{
          width: '100%',
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
