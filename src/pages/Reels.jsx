import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import ReelPlayer, { parseVideoUrl } from '../components/ReelPlayer';

// ─── SPORT CONFIG ──────────────────────────────────────────────────────────────
const SPORT_ICONS  = { Football: '⚽', Basketball: '🏀', Handball: '🤾', General: '🎬', Event: '🏆', Training: '💪' };
const SPORT_COLORS = { Football: '#00E676', Basketball: '#FF9500', Handball: '#00E5FF', General: '#FFC107', Event: '#FF9500', Training: '#E040FB' };

// ─── REEL CARD ─────────────────────────────────────────────────────────────────
function ReelCard({ reel, onClick }) {
  const [imgError, setImgError] = useState(false);
  const parsed = parseVideoUrl(reel.url);
  const sportColor = SPORT_COLORS[reel.sport] || '#FFC107';
  const sportIcon  = SPORT_ICONS[reel.sport]  || '🎬';
  const thumb = !imgError && (reel.thumbnailUrl || parsed.thumbnailUrl);

  return (
    <div
      onClick={() => onClick(reel)}
      style={{
        position: 'relative',
        borderRadius: '18px',
        overflow: 'hidden',
        aspectRatio: '9/16',
        cursor: 'pointer',
        background: '#0D111A',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        transition: 'transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
        e.currentTarget.style.boxShadow = `0 14px 36px rgba(0,0,0,0.7), 0 0 0 1.5px ${sportColor}66`;
        e.currentTarget.style.borderColor = sportColor;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.5)';
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
      }}
    >
      {/* Thumbnail or animated backdrop */}
      {thumb ? (
        <img
          src={thumb}
          alt={reel.title || 'Reel'}
          onError={() => setImgError(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      ) : (
        <div style={{
          width: '100%', height: '100%',
          background: `linear-gradient(160deg, #090E18 0%, ${sportColor}22 50%, #060910 100%)`,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: '8px', padding: '16px', boxSizing: 'border-box'
        }}>
          <span style={{ fontSize: '3rem', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' }}>
            {sportIcon}
          </span>
          <span style={{
            fontSize: '0.72rem', color: '#8E9BAE', fontWeight: 700,
            background: 'rgba(0,0,0,0.5)', padding: '3px 8px', borderRadius: '12px'
          }}>
            {parsed.platformName}
          </span>
        </div>
      )}

      {/* Dark gradient overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.05) 40%, rgba(0,0,0,0.85) 100%)',
        pointerEvents: 'none'
      }} />

      {/* Sport Badge Top Left */}
      <div style={{
        position: 'absolute', top: '10px', left: '10px',
        background: 'rgba(10, 14, 24, 0.85)',
        border: `1px solid ${sportColor}66`,
        backdropFilter: 'blur(8px)',
        borderRadius: '10px', padding: '4px 8px',
        fontSize: '0.95rem', lineHeight: 1,
        display: 'flex', alignItems: 'center', gap: '4px'
      }}>
        <span>{sportIcon}</span>
      </div>

      {/* Platform Badge Top Right */}
      <div style={{
        position: 'absolute', top: '10px', right: '10px',
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(6px)',
        borderRadius: '8px', padding: '3px 8px',
        fontSize: '0.65rem', fontWeight: 800, color: '#CBD5E1'
      }}>
        {parsed.platformName}
      </div>

      {/* Play Button Icon Center */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '54px', height: '54px', borderRadius: '50%',
        background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(10px)',
        border: '2px solid rgba(255,255,255,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.3rem', color: '#FFF',
        boxShadow: '0 8px 24px rgba(0,0,0,0.6), 0 0 20px rgba(255,193,7,0.3)',
        transition: 'transform 0.2s ease',
      }}>
        ▶
      </div>

      {/* Title at bottom if provided */}
      {reel.title && (
        <div style={{
          position: 'absolute', bottom: '12px', left: '12px', right: '12px',
          color: '#FFF', fontSize: '0.82rem', fontWeight: 800,
          textShadow: '0 2px 8px rgba(0,0,0,0.9)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          direction: 'rtl', textAlign: 'right'
        }}>
          {reel.title}
        </div>
      )}
    </div>
  );
}

// ─── LIGHTBOX ──────────────────────────────────────────────────────────────────
function Lightbox({ reel, onClose }) {
  const parsed = parseVideoUrl(reel.url);
  const sportColor = SPORT_COLORS[reel.sport] || '#FFC107';
  const sportIcon  = SPORT_ICONS[reel.sport]  || '🎬';
  const isDirect = parsed.type === 'direct';

  // ESC keyboard close
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const whatsappText = encodeURIComponent(`🎬 شاهد هذا الريل من أكاديمية أولستار الرياضية بتطاوين!\n${reel.url}`);
  const whatsappUrl  = `https://wa.me/?text=${whatsappText}`;

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 999999,
        background: 'rgba(0, 0, 0, 0.95)',
        backdropFilter: 'blur(12px)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '16px', boxSizing: 'border-box'
      }}
    >
      {/* Top bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        padding: '16px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'linear-gradient(180deg, rgba(0,0,0,0.85) 0%, transparent 100%)',
        zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            background: `${sportColor}22`, border: `1px solid ${sportColor}55`,
            borderRadius: '8px', padding: '4px 10px', fontSize: '1rem',
          }}>{sportIcon}</span>
          <span style={{ color: '#FFF', fontWeight: 800, fontSize: '0.95rem', fontFamily: '"Cairo", sans-serif' }}>
            {reel.title || `ريل الأكاديمية (${parsed.platformName})`}
          </span>
        </div>
        <button
          onClick={onClose}
          style={{
            width: '40px', height: '40px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)',
            color: '#FFF', fontSize: '1.2rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,60,60,0.4)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
        >✕</button>
      </div>

      {/* Video player container */}
      <div style={{
        width: '100%', maxWidth: '420px',
        height: '75vh', maxHeight: '720px',
        position: 'relative',
        borderRadius: '16px', overflow: 'hidden',
        background: '#080C14',
        boxShadow: '0 20px 50px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <ReelPlayer url={reel.url} autoPlay={true} title={reel.title} />
      </div>

      {/* Action buttons bar */}
      <div style={{
        marginTop: '16px',
        display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap',
        justifyContent: 'center', zIndex: 10
      }}>
        {/* Open in external app/site fallback */}
        {!isDirect && (
          <a
            href={reel.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '10px 20px', borderRadius: '999px',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#FFF', fontWeight: 800, fontSize: '0.84rem',
              fontFamily: '"Cairo", "Tajawal", sans-serif',
              textDecoration: 'none', backdropFilter: 'blur(8px)'
            }}
          >
            <span>🔗</span>
            فتح في {parsed.platformName}
          </a>
        )}

        {/* WhatsApp Share */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '10px 24px', borderRadius: '999px',
            background: 'linear-gradient(135deg, #25D366, #128C7E)',
            color: '#FFF', fontWeight: 900, fontSize: '0.86rem',
            fontFamily: '"Cairo", "Tajawal", sans-serif',
            textDecoration: 'none',
            boxShadow: '0 6px 20px rgba(37,211,102,0.4)',
          }}
        >
          <span>📤</span>
          مشاركة على واتساب
        </a>
      </div>
    </div>
  );
}

// ─── EMPTY STATE ───────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '55vh',
      fontFamily: '"Cairo", "Tajawal", sans-serif', textAlign: 'center',
      padding: '40px 20px',
    }}>
      <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🎬</div>
      <h2 style={{ color: '#FFF', fontSize: '1.3rem', fontWeight: 900, margin: '0 0 8px' }}>
        ريلز وأبرز لحظات الأكاديمية
      </h2>
      <p style={{ color: '#8E9BAE', fontSize: '0.9rem', margin: 0, maxWidth: '280px', lineHeight: 1.6 }}>
        سيتم إضافة مقاطع التدريبات والمباريات قريباً من لوحة الإدارة
      </p>
    </div>
  );
}

// ─── MAIN REELS PAGE ───────────────────────────────────────────────────────────
export default function Reels() {
  const [reels, setReels]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [activeReel, setActiveReel] = useState(null);

  useEffect(() => {
    const load = (content) => {
      const r = content?.reels;
      if (Array.isArray(r)) {
        setReels(r.filter(x => x && x.url));
      }
      setLoading(false);
    };

    // 1. Instant local cache load
    load(db.getSiteContent());

    // 2. Cloud async sync
    db.getSiteContentAsync().then(c => c && load(c));

    // 3. Realtime subscription
    const unsub = db.subscribeToRealtime(null, null, (live) => {
      if (live) load(live);
    });
    return () => { if (unsub) unsub(); };
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#060910',
      color: '#FFF',
      fontFamily: '"Cairo", "Tajawal", sans-serif',
      direction: 'rtl',
      paddingTop: '90px',
      paddingBottom: '100px',
    }}>
      <style>{`
        @keyframes reelsFadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Lightbox */}
      {activeReel && <Lightbox reel={activeReel} onClose={() => setActiveReel(null)} />}

      <div style={{ maxWidth: '540px', margin: '0 auto', padding: '0 16px' }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: '24px', paddingBottom: '12px',
          borderBottom: '1px solid rgba(255,255,255,0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.6rem' }}>🎬</span>
            <div>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 900, margin: 0, color: '#FFF', lineHeight: 1.2 }}>
                ريلز الأكاديمية
              </h1>
              <div style={{ fontSize: '0.75rem', color: '#8E9BAE' }}>
                أبرز المهارات، التدريبات، ولحظات المباريات
              </div>
            </div>
          </div>

          <span style={{
            background: 'linear-gradient(135deg, rgba(255,193,7,0.2), rgba(255,149,0,0.2))',
            border: '1px solid #FFC107',
            color: '#FFC107', borderRadius: '20px', padding: '4px 12px',
            fontSize: '0.72rem', fontWeight: 900, letterSpacing: '0.5px',
          }}>REELS</span>
        </div>

        {/* Content Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{
                aspectRatio: '9/16', borderRadius: '18px',
                background: 'linear-gradient(160deg, #0E1422, #141C30)',
                animation: 'reelsFadeIn 0.4s ease',
              }} />
            ))}
          </div>
        ) : reels.length === 0 ? (
          <EmptyState />
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '14px',
            animation: 'reelsFadeIn 0.4s ease',
          }}>
            {reels.map((reel) => (
              <ReelCard key={reel.id} reel={reel} onClick={setActiveReel} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
