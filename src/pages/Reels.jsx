import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import ReelPlayer, { parseVideoUrl } from '../components/ReelPlayer';

// ─── SPORT CONFIG ──────────────────────────────────────────────────────────────
const SPORT_ICONS  = { Football: '⚽', Basketball: '🏀', Handball: '🤾', General: '🎬', Event: '🏆', Training: '💪' };
const SPORT_COLORS = { Football: '#00E676', Basketball: '#FF9500', Handball: '#00E5FF', General: '#FFC107', Event: '#FF9500', Training: '#E040FB' };

// ─── SINGLE IN-PLACE REEL ITEM (TIKTOK / INSTAGRAM STYLE) ─────────────────────
function InPlaceReelCard({ reel, index, total }) {
  const parsed = parseVideoUrl(reel.url);
  const sportColor = SPORT_COLORS[reel.sport] || '#FFC107';
  const sportIcon  = SPORT_ICONS[reel.sport]  || '🎬';

  const whatsappText = encodeURIComponent(`🎬 شاهد هذا الريل من أكاديمية أولستار الرياضية بتطاوين!\n${reel.url}`);
  const whatsappUrl  = `https://wa.me/?text=${whatsappText}`;

  return (
    <div style={{
      width: '100%',
      maxWidth: '430px',
      margin: '0 auto 32px auto',
      scrollSnapAlign: 'start',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      {/* Reel Card Container */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: 'clamp(520px, 76vh, 720px)',
        borderRadius: '24px',
        overflow: 'hidden',
        background: '#080C14',
        border: '1.5px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.85), 0 0 25px rgba(255, 193, 7, 0.1)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Top Header Overlay */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          padding: '14px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'linear-gradient(180deg, rgba(0,0,0,0.85) 0%, transparent 100%)',
          zIndex: 10,
          pointerEvents: 'none'
        }}>
          {/* Sport Tag */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: 'rgba(10, 14, 24, 0.85)',
            border: `1px solid ${sportColor}88`,
            backdropFilter: 'blur(8px)',
            borderRadius: '12px', padding: '4px 10px',
            color: '#FFF', fontSize: '0.82rem', fontWeight: 800
          }}>
            <span>{sportIcon}</span>
            <span>{reel.sport || 'عام'}</span>
          </div>

          {/* Reel Index Indicator */}
          <span style={{
            background: 'rgba(0,0,0,0.6)',
            borderRadius: '10px', padding: '3px 8px',
            fontSize: '0.72rem', color: '#CBD5E1', fontWeight: 700
          }}>
            {index + 1} / {total}
          </span>
        </div>

        {/* In-Place Video Player Engine */}
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
          <ReelPlayer url={reel.url} autoPlay={true} title={reel.title} />
        </div>

        {/* Bottom Bar Overlay */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          padding: '16px',
          background: 'linear-gradient(0deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)',
          zIndex: 10,
          display: 'flex', flexDirection: 'column', gap: '10px'
        }}>
          {/* Reel Title */}
          {reel.title && (
            <div style={{
              color: '#FFF', fontSize: '0.92rem', fontWeight: 800,
              textShadow: '0 2px 8px rgba(0,0,0,0.9)',
              direction: 'rtl', textAlign: 'right'
            }}>
              {reel.title}
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {/* WhatsApp Share Button */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                flex: 1,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                padding: '10px 14px', borderRadius: '12px',
                background: 'linear-gradient(135deg, #25D366, #128C7E)',
                color: '#FFF', fontWeight: 900, fontSize: '0.8rem',
                textDecoration: 'none',
                boxShadow: '0 4px 15px rgba(37,211,102,0.35)'
              }}
            >
              <span>📤</span>
              <span>مشاركة على واتساب</span>
            </a>

            {/* Direct App Link */}
            {parsed.type !== 'direct' && (
              <a
                href={reel.url}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  padding: '10px 14px', borderRadius: '12px',
                  background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
                  color: '#FFF', fontWeight: 800, fontSize: '0.78rem',
                  textDecoration: 'none', backdropFilter: 'blur(8px)'
                }}
              >
                <span>🔗</span>
                <span>{parsed.platformName}</span>
              </a>
            )}
          </div>
        </div>
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
        ريلز وأبرز لحظات الأكاديمية
      </h2>
      <p style={{ color: '#8E9BAE', fontSize: '0.9rem', margin: 0, maxWidth: '280px', lineHeight: 1.6 }}>
        سيتم إضافة مقاطع التدريبات والمباريات قريباً من لوحة الإدارة
      </p>
    </div>
  );
}

// ─── MAIN REELS PAGE (TIKTOK / INSTAGRAM REELS VERTICAL FEED) ─────────────────
export default function Reels() {
  const [reels, setReels]     = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div style={{
      minHeight: '100vh',
      background: '#05070D',
      color: '#FFF',
      fontFamily: '"Cairo", "Tajawal", sans-serif',
      direction: 'rtl',
      paddingTop: '86px',
      paddingBottom: '90px',
      boxSizing: 'border-box'
    }}>
      <div style={{ maxWidth: '520px', margin: '0 auto', padding: '0 12px' }}>

        {/* Page Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: '20px', paddingBottom: '12px',
          borderBottom: '1px solid rgba(255,255,255,0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.5rem' }}>🎬</span>
            <h1 style={{ fontSize: '1.3rem', fontWeight: 900, margin: 0, color: '#FFF' }}>
              ريلز الأكاديمية
            </h1>
          </div>

          <span style={{
            background: 'linear-gradient(135deg, rgba(255,193,7,0.2), rgba(255,149,0,0.2))',
            border: '1px solid #FFC107',
            color: '#FFC107', borderRadius: '20px', padding: '4px 12px',
            fontSize: '0.72rem', fontWeight: 900, letterSpacing: '0.5px',
          }}>REELS FEED</span>
        </div>

        {/* Vertical In-Place Reels Feed */}
        {loading ? (
          <div style={{
            width: '100%', maxWidth: '430px', height: '65vh', margin: '0 auto',
            borderRadius: '24px', background: 'linear-gradient(145deg, #090E18, #141C30)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFC107', fontWeight: 800
          }}>
            ⏳ جاري تحميل الريلز...
          </div>
        ) : reels.length === 0 ? (
          <EmptyState />
        ) : (
          <div style={{
            display: 'flex', flexDirection: 'column', gap: '20px',
            scrollSnapType: 'y mandatory', WebkitOverflowScrolling: 'touch'
          }}>
            {reels.map((reel, index) => (
              <InPlaceReelCard
                key={reel.id}
                reel={reel}
                index={index}
                total={reels.length}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
