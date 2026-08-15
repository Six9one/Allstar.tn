import React, { useState } from 'react';
import ReactPlayer from 'react-player';

// ─── ROBUST URL CLEANER ───────────────────────────────────────────────────────
export function parseVideoUrl(rawInput = '') {
  let url = (rawInput || '').trim();
  if (!url) return { type: 'unknown', url: '', thumbnailUrl: '', platformName: 'فيديو' };

  // 0. Auto-extract src if user pasted an entire <iframe> code snippet
  if (url.includes('<iframe') || url.includes('src=')) {
    const srcMatch = url.match(/src=["']([^"']+)["']/i);
    if (srcMatch && srcMatch[1]) {
      url = srcMatch[1].replace(/&amp;/g, '&');
    }
  }

  // 1. YouTube & YouTube Shorts
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([A-Za-z0-9_-]{11})/i);
  if (ytMatch) {
    const videoId = ytMatch[1];
    return {
      type: 'youtube',
      url: `https://www.youtube.com/watch?v=${videoId}`,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      platformName: 'YouTube'
    };
  }

  // 2. Facebook
  if (/facebook\.com|fb\.watch|fb\.com/i.test(url)) {
    return {
      type: 'facebook',
      url,
      thumbnailUrl: '',
      platformName: 'Facebook'
    };
  }

  // 3. Instagram
  if (/instagram\.com/i.test(url)) {
    return {
      type: 'instagram',
      url,
      thumbnailUrl: '',
      platformName: 'Instagram'
    };
  }

  // 4. TikTok
  if (/tiktok\.com/i.test(url)) {
    return {
      type: 'tiktok',
      url,
      thumbnailUrl: '',
      platformName: 'TikTok'
    };
  }

  // 5. Direct / Other
  return {
    type: 'direct',
    url,
    thumbnailUrl: '',
    platformName: 'فيديو مباشر MP4'
  };
}

// ─── REEL PLAYER COMPONENT (POWERED BY REACT-PLAYER) ──────────────────────────
export default function ReelPlayer({ url, autoPlay = true, style = {} }) {
  const [hasError, setHasError] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const parsed = parseVideoUrl(url);

  if (!url) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#0D111A', color: '#5A6A7E', width: '100%', height: '100%',
        borderRadius: '12px', fontSize: '0.85rem', ...style
      }}>
        لا يوجد رابط فيديو
      </div>
    );
  }

  return (
    <div style={{
      position: 'relative', width: '100%', height: '100%',
      borderRadius: '14px', overflow: 'hidden', background: '#000',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      ...style
    }}>
      {/* Loading Skeleton */}
      {!isReady && !hasError && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(145deg, #090E18, #141C30)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#FFC107', fontSize: '0.85rem', fontWeight: 800, zIndex: 1
        }}>
          ⏳ جاري تحميل الفيديو...
        </div>
      )}

      {/* ReactPlayer Engine */}
      <ReactPlayer
        url={parsed.url || url}
        playing={autoPlay}
        controls={true}
        playsinline={true}
        width="100%"
        height="100%"
        onReady={() => setIsReady(true)}
        onError={() => setHasError(true)}
        config={{
          youtube: {
            playerVars: { showinfo: 0, rel: 0, modestbranding: 1, playsinline: 1 }
          },
          facebook: {
            appId: '100000000000000'
          },
          file: {
            attributes: {
              controlsList: 'nodownload',
              playsInline: true
            }
          }
        }}
        style={{ position: 'absolute', top: 0, left: 0 }}
      />

      {/* Fallback open button if adblocker or cookie policies block third-party widgets */}
      {hasError && (
        <div style={{
          position: 'absolute', inset: 0, background: 'rgba(8, 12, 20, 0.95)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '20px', textAlign: 'center', gap: '12px', zIndex: 10
        }}>
          <span style={{ fontSize: '2rem' }}>⚠️</span>
          <div style={{ fontSize: '0.84rem', color: '#FFF', fontWeight: 700 }}>
            تم حظر مشغل الطرف الثالث بواسطة متصفحك أو مانع الإعلانات
          </div>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            style={{
              padding: '10px 20px', borderRadius: '999px',
              background: 'linear-gradient(135deg, #FFC107, #FF9500)',
              color: '#000', fontWeight: 900, fontSize: '0.82rem', textDecoration: 'none'
            }}
          >
            ▶ فتح الفيديو مباشرة في {parsed.platformName}
          </a>
        </div>
      )}
    </div>
  );
}
