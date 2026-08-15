import React, { useState, useRef } from 'react';

// ─── ROBUST VIDEO PARSER ───────────────────────────────────────────────────────
export function parseVideoUrl(rawUrl = '') {
  const url = (rawUrl || '').trim();
  if (!url) return { type: 'unknown', embedUrl: '', thumbnailUrl: '', directUrl: '', rawUrl: '', platformName: 'فيديو' };

  // 1. YouTube & YouTube Shorts
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([A-Za-z0-9_-]{11})/i);
  if (ytMatch) {
    const videoId = ytMatch[1];
    return {
      type: 'youtube',
      videoId,
      embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&playsinline=1&modestbranding=1`,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      rawUrl: url,
      platformName: 'YouTube'
    };
  }

  // 2. Instagram Reels / Posts
  const igMatch = url.match(/instagram\.com\/(?:p|reel|reels)\/([A-Za-z0-9_-]+)/i);
  if (igMatch) {
    const code = igMatch[1];
    return {
      type: 'instagram',
      code,
      embedUrl: `https://www.instagram.com/reel/${code}/embed/`,
      thumbnailUrl: '',
      rawUrl: url,
      platformName: 'Instagram'
    };
  }

  // 3. TikTok
  const ttMatch = url.match(/tiktok\.com\/(?:@[\w.-]+\/video\/|v\/|embed\/v2\/)(\d+)/i);
  if (ttMatch) {
    const videoId = ttMatch[1];
    return {
      type: 'tiktok',
      videoId,
      embedUrl: `https://www.tiktok.com/embed/v2/${videoId}`,
      thumbnailUrl: '',
      rawUrl: url,
      platformName: 'TikTok'
    };
  } else if (/tiktok\.com/i.test(url)) {
    return {
      type: 'tiktok',
      embedUrl: url,
      thumbnailUrl: '',
      rawUrl: url,
      platformName: 'TikTok'
    };
  }

  // 4. Facebook Reels / Videos
  if (/facebook\.com|fb\.watch|fb\.com/i.test(url)) {
    return {
      type: 'facebook',
      embedUrl: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&autoplay=true&mute=0`,
      thumbnailUrl: '',
      rawUrl: url,
      platformName: 'Facebook'
    };
  }

  // 5. Direct Video (MP4 / WebM / Supabase Storage)
  return {
    type: 'direct',
    directUrl: url,
    embedUrl: url,
    thumbnailUrl: '',
    rawUrl: url,
    platformName: 'فيديو مباشر MP4'
  };
}

// ─── REEL PLAYER COMPONENT ────────────────────────────────────────────────────
export default function ReelPlayer({ url, autoPlay = true, title = '', style = {} }) {
  const videoRef = useRef(null);
  const [iframeError, setIframeError] = useState(false);
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

  // Native MP4 / Direct Video File
  if (parsed.type === 'direct') {
    return (
      <video
        ref={videoRef}
        src={parsed.directUrl || url}
        controls
        autoPlay={autoPlay}
        playsInline
        style={{
          width: '100%', height: '100%', objectFit: 'contain',
          background: '#000', borderRadius: '12px', ...style
        }}
      />
    );
  }

  // YouTube Embed
  if (parsed.type === 'youtube') {
    return (
      <iframe
        src={parsed.embedUrl}
        title={title || 'YouTube Video'}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        style={{
          width: '100%', height: '100%', border: 'none',
          background: '#000', borderRadius: '12px', display: 'block', ...style
        }}
      />
    );
  }

  // Social Embed with smart fallback overlay (Facebook / TikTok / Instagram)
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: '12px', overflow: 'hidden', background: '#000', ...style }}>
      {!iframeError && (
        <iframe
          src={parsed.embedUrl}
          title={title || `${parsed.platformName} Video`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          onError={() => setIframeError(true)}
          style={{
            width: '100%', height: '100%', border: 'none',
            background: '#000', display: 'block'
          }}
        />
      )}

      {/* Floating Direct Play Button (if browser/adblocker blocks social embed) */}
      <div style={{
        position: 'absolute', bottom: '8px', left: '8px', right: '8px',
        display: 'flex', justifyContent: 'center', zIndex: 10
      }}>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '6px 14px', borderRadius: '20px',
            background: 'rgba(0, 0, 0, 0.8)', border: '1px solid rgba(255,255,255,0.25)',
            color: '#FFF', fontSize: '0.74rem', fontWeight: 800,
            textDecoration: 'none', backdropFilter: 'blur(8px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
          }}
        >
          <span>▶</span>
          <span>تشغيل عبر {parsed.platformName}</span>
        </a>
      </div>
    </div>
  );
}
