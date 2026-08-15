import React, { useRef } from 'react';

// ─── ROBUST UNIVERSAL PARSER ──────────────────────────────────────────────────
export function parseVideoUrl(rawInput = '') {
  let url = (rawInput || '').trim();
  if (!url) return { type: 'unknown', embedUrl: '', rawUrl: '', platformName: 'فيديو' };

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
      videoId,
      embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1&rel=0&modestbranding=1&loop=1&playlist=${videoId}`,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      rawUrl: url,
      platformName: 'YouTube'
    };
  }

  // 2. TikTok
  const ttMatch = url.match(/tiktok\.com\/(?:@[\w.-]+\/video\/|v\/|embed\/v2\/)(\d+)/i);
  if (ttMatch) {
    const videoId = ttMatch[1];
    return {
      type: 'tiktok',
      videoId,
      embedUrl: `https://www.tiktok.com/embed/v2/${videoId}`,
      rawUrl: url,
      thumbnailUrl: '',
      platformName: 'TikTok'
    };
  } else if (/tiktok\.com/i.test(url)) {
    return {
      type: 'tiktok',
      embedUrl: url,
      rawUrl: url,
      thumbnailUrl: '',
      platformName: 'TikTok'
    };
  }

  // 3. Instagram Reels / Posts
  const igMatch = url.match(/instagram\.com\/(?:p|reel|reels)\/([A-Za-z0-9_-]+)/i);
  if (igMatch) {
    const code = igMatch[1];
    return {
      type: 'instagram',
      code,
      embedUrl: `https://www.instagram.com/reel/${code}/embed/`,
      rawUrl: url,
      thumbnailUrl: '',
      platformName: 'Instagram'
    };
  }

  // 4. Facebook Reels / Videos / Share links
  if (/facebook\.com|fb\.watch|fb\.com/i.test(url)) {
    let embedUrl = url;
    if (!url.includes('facebook.com/plugins/video.php')) {
      embedUrl = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=0&autoplay=1&mute=0`;
    }
    return {
      type: 'facebook',
      embedUrl,
      rawUrl: url,
      thumbnailUrl: '',
      platformName: 'Facebook'
    };
  }

  // 5. Direct MP4 / WebM / Cloud Video
  return {
    type: 'direct',
    directUrl: url,
    embedUrl: url,
    rawUrl: url,
    thumbnailUrl: '',
    platformName: 'فيديو مباشر MP4'
  };
}

// ─── REEL PLAYER COMPONENT (CLEAN EDGE-TO-EDGE) ───────────────────────────────
export default function ReelPlayer({ url, autoPlay = true, title = '', style = {} }) {
  const videoRef = useRef(null);
  const parsed = parseVideoUrl(url);

  if (!url) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#0D111A', color: '#5A6A7E', width: '100%', height: '100%',
        fontSize: '0.85rem', ...style
      }}>
        لا يوجد رابط فيديو
      </div>
    );
  }

  // 1. Direct MP4 / MOV Video File (Pure Fullscreen)
  if (parsed.type === 'direct') {
    return (
      <div style={{ width: '100%', height: '100%', background: '#000', overflow: 'hidden', ...style }}>
        <video
          ref={videoRef}
          src={parsed.directUrl || url}
          controls
          autoPlay={autoPlay}
          loop
          playsInline
          style={{ width: '100%', height: '100%', objectFit: 'cover', background: '#000', display: 'block' }}
        />
      </div>
    );
  }

  // 2. YouTube & YouTube Shorts (Pure Fullscreen)
  if (parsed.type === 'youtube') {
    return (
      <div style={{ width: '100%', height: '100%', background: '#000', overflow: 'hidden', ...style }}>
        <iframe
          src={parsed.embedUrl}
          title={title || 'YouTube Video'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          style={{ width: '100%', height: '100%', border: 'none', background: '#000', display: 'block' }}
        />
      </div>
    );
  }

  // 3. TikTok (Clipped clean to hide white footer card)
  if (parsed.type === 'tiktok') {
    return (
      <div style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: '#000',
        overflow: 'hidden',
        ...style
      }}>
        <iframe
          src={parsed.embedUrl}
          title={title || 'TikTok Reel'}
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          style={{
            width: '100%',
            height: 'calc(100% + 150px)', // Crops out the bottom white footer card!
            border: 'none',
            background: '#000',
            display: 'block',
            position: 'absolute',
            top: 0,
            left: 0
          }}
        />
      </div>
    );
  }

  // 4. Facebook & Instagram
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: '#000', overflow: 'hidden', ...style }}>
      <iframe
        src={parsed.embedUrl}
        title={title || `${parsed.platformName} Video`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        style={{ width: '100%', height: '100%', border: 'none', background: '#000', display: 'block' }}
      />
    </div>
  );
}
