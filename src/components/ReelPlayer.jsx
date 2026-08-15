import React, { useRef } from 'react';

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

  return (
    <iframe
      src={parsed.embedUrl}
      title={title || 'Reel Video'}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
      style={{
        width: '100%', height: '100%', border: 'none',
        background: '#000', borderRadius: '12px', display: 'block', ...style
      }}
    />
  );
}
