import React, { useState, useEffect, useRef } from 'react';
import { db } from '../services/db';

// ─── SPORT CONFIG ──────────────────────────────────────────────────────────────
const SPORT_ICONS  = { Football: '⚽', Basketball: '🏀', Handball: '🤾', General: '🎬', Event: '🏆', Training: '💪' };
const SPORT_COLORS = { Football: '#00E676', Basketball: '#FF9500', Handball: '#00E5FF', General: '#FFC107', Event: '#FF9500', Training: '#E040FB' };

// ─── VIDEO URL HELPERS ─────────────────────────────────────────────────────────
export function detectVideoType(url = '') {
  if (!url) return 'unknown';
  if (/youtu\.be|youtube\.com/i.test(url)) return 'youtube';
  if (/tiktok\.com/i.test(url)) return 'tiktok';
  if (/facebook\.com|fb\.watch|fb\.com/i.test(url)) return 'facebook';
  if (/instagram\.com/i.test(url)) return 'instagram';
  if (/\.(mp4|webm|ogg|mov)(\?|$)/i.test(url)) return 'direct';
  return 'iframe';
}

export function getEmbedUrl(url = '', type) {
  const t = type || detectVideoType(url);
  if (t === 'youtube') {
    const m = url.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
    return m ? `https://www.youtube.com/embed/${m[1]}?autoplay=1&rel=0` : url;
  }
  if (t === 'tiktok') {
    const m = url.match(/video\/(\d+)/);
    return m ? `https://www.tiktok.com/embed/v2/${m[1]}` : url;
  }
  if (t === 'facebook') {
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&autoplay=true&show_text=false`;
  }
  if (t === 'instagram') {
    // Convert /p/CODE/ or /reel/CODE/ to embed
    const m = url.match(/\/(p|reel)\/([A-Za-z0-9_-]+)/);
    return m ? `https://www.instagram.com/${m[1]}/${m[2]}/embed/` : url;
  }
  return url; // direct mp4 or fallback
}

export function getAutoThumbnail(url = '', type) {
  const t = type || detectVideoType(url);
  if (t === 'youtube') {
    const m = url.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
    return m ? `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg` : null;
  }
  return null; // TikTok/FB/Instagram need manual thumbnail
}

// ─── REEL CARD ─────────────────────────────────────────────────────────────────
function ReelCard({ reel, onClick }) {
  const [imgError, setImgError] = useState(false);
  const sportColor = SPORT_COLORS[reel.sport] || '#FFC107';
  const sportIcon  = SPORT_ICONS[reel.sport]  || '🎬';
  const thumb = !imgError && (reel.thumbnailUrl || getAutoThumbnail(reel.url, reel.type));

  return (
    <div
      onClick={() => onClick(reel)}
      style={{
        position: 'relative', borderRadius: '16px', overflow: 'hidden',
        aspectRatio: '9/16', cursor: 'pointer', background: '#0D111A',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = `0 12px 32px rgba(0,0,0,0.7), 0 0 0 1.5px ${sportColor}55`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.5)'; }}
    >
      {/* Thumbnail or gradient placeholder */}
      {thumb ? (
        <img
          src={thumb}
          alt=""
          onError={() => setImgError(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      ) : (
        <div style={{
          width: '100%', height: '100%',
          background: `linear-gradient(160deg, #0D111A 0%, ${sportColor}18 100%)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2.8rem',
        }}>
          {sportIcon}
        </div>
      )}

      {/* Dark gradient overlay at bottom */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(0,0,0,0.05) 50%, rgba(0,0,0,0.82) 100%)',
        pointerEvents: 'none'
      }} />

      {/* Sport tag — top left */}
      <div style={{
        position: 'absolute', top: '10px', left: '10px',
        background: `${sportColor}22`,
        border: `1px solid ${sportColor}55`,
        borderRadius: '8px', padding: '3px 8px',
        fontSize: '1rem', lineHeight: 1,
      }}>
        {sportIcon}
      </div>

      {/* Play button — center */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '52px', height: '52px', borderRadius: '50%',
        background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(8px)',
        border: '2px solid rgba(255,255,255,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.3rem', color: '#FFF',
      }}>
        ▶
      </div>
    </div>
  );
}

// ─── LIGHTBOX ──────────────────────────────────────────────────────────────────
function Lightbox({ reel, onClose }) {
  const videoRef = useRef(null);
  const embedUrl = getEmbedUrl(reel.url, reel.type);
  const isDirect = reel.type === 'direct';
  const sportColor = SPORT_COLORS[reel.sport] || '#FFC107';
  const sportIcon  = SPORT_ICONS[reel.sport]  || '🎬';

  // Trap focus & ESC close
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
        position: 'fixed', inset: 0, zIndex: 99999,
        background: '#000',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}
    >
      {/* Top bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        padding: '16px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'linear-gradient(180deg, rgba(0,0,0,0.8) 0%, transparent 100%)',
        zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            background: `${sportColor}22`, border: `1px solid ${sportColor}55`,
            borderRadius: '8px', padding: '4px 10px', fontSize: '1rem',
          }}>{sportIcon}</span>
          {reel.title && (
            <span style={{ color: '#FFF', fontWeight: 800, fontSize: '0.95rem', fontFamily: '"Cairo", sans-serif' }}>
              {reel.title}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          style={{
            width: '38px', height: '38px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
            color: '#FFF', fontSize: '1.1rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >✕</button>
      </div>

      {/* Video player */}
      <div style={{
        width: '100%', maxWidth: '460px',
        aspectRatio: '9/16', position: 'relative',
        maxHeight: 'calc(100vh - 120px)',
      }}>
        {isDirect ? (
          <video
            ref={videoRef}
            src={reel.url}
            controls
            autoPlay
            style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '12px' }}
          />
        ) : (
          <iframe
            src={embedUrl}
            title={reel.title || 'Reel'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{
              width: '100%', height: '100%', border: 'none', borderRadius: '12px',
            }}
          />
        )}
      </div>

      {/* Bottom bar — WhatsApp share */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '20px',
        background: 'linear-gradient(0deg, rgba(0,0,0,0.85) 0%, transparent 100%)',
        display: 'flex', justifyContent: 'center', zIndex: 10,
      }}>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '10px',
            padding: '12px 28px', borderRadius: '999px',
            background: 'linear-gradient(135deg, #25D366, #128C7E)',
            color: '#FFF', fontWeight: 900, fontSize: '0.9rem',
            fontFamily: '"Cairo", "Tajawal", sans-serif',
            textDecoration: 'none',
            boxShadow: '0 6px 20px rgba(37,211,102,0.4)',
          }}
        >
          <span style={{ fontSize: '1.2rem' }}>📤</span>
          شارك على واتساب
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
      justifyContent: 'center', minHeight: '60vh',
      fontFamily: '"Cairo", "Tajawal", sans-serif', textAlign: 'center',
      padding: '40px 20px',
    }}>
      <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🎬</div>
      <h2 style={{ color: '#FFF', fontSize: '1.3rem', fontWeight: 900, margin: '0 0 8px' }}>
        قريباً — ريلز الأكاديمية
      </h2>
      <p style={{ color: '#5A6A7E', fontSize: '0.9rem', margin: 0, maxWidth: '260px' }}>
        سيتم إضافة مقاطع الفيديو قريباً من قِبل إدارة الأكاديمية
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
    const load = async (content) => {
      const r = content?.reels;
      if (Array.isArray(r)) {
        setReels(r.filter(x => x && x.url));
      }
      setLoading(false);
    };

    // Instant local
    load(db.getSiteContent());

    // Cloud async
    db.getSiteContentAsync().then(c => c && load(c));

    // Realtime
    const unsub = db.subscribeToRealtime(null, null, (live) => {
      if (live) load(live);
    });
    return () => { if (unsub) unsub(); };
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#000',
      color: '#FFF',
      fontFamily: '"Cairo", "Tajawal", sans-serif',
      direction: 'rtl',
      paddingTop: '80px',
      paddingBottom: '80px',
    }}>
      <style>{`
        @keyframes reelsFadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Lightbox */}
      {activeReel && <Lightbox reel={activeReel} onClose={() => setActiveReel(null)} />}

      <div style={{ maxWidth: '520px', margin: '0 auto', padding: '0 16px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 900, margin: 0, color: '#FFF' }}>
            🎬 ريلز الأكاديمية
          </h1>
          <span style={{
            background: 'rgba(255,193,7,0.15)', border: '1px solid #FFC107',
            color: '#FFC107', borderRadius: '20px', padding: '3px 12px',
            fontSize: '0.72rem', fontWeight: 900, letterSpacing: '0.5px',
          }}>REELS</span>
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{
                aspectRatio: '9/16', borderRadius: '16px',
                background: 'linear-gradient(160deg, #0D111A, #141A28)',
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
            gap: '12px',
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
