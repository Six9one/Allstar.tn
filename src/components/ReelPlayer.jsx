import React, { useState, useRef, useEffect } from 'react';

// ─── ROBUST DIRECT VIDEO & SOCIAL URL PARSER ──────────────────────────────────
export function getDirectVideoSource(reelOrUrl) {
  if (!reelOrUrl) return { videoUrl: '', posterUrl: '', type: 'direct', platformName: 'فيديو مباشر' };

  let url = '';
  let poster = '';

  if (typeof reelOrUrl === 'object') {
    url = (reelOrUrl.video_url || reelOrUrl.url || '').trim();
    poster = (reelOrUrl.thumbnail_url || reelOrUrl.thumbnailUrl || '').trim();
  } else if (typeof reelOrUrl === 'string') {
    url = reelOrUrl.trim();
  }

  // Handle accidental iframe paste
  if (url.includes('<iframe') || url.includes('src=')) {
    const srcMatch = url.match(/src=["']([^"']+)["']/i);
    if (srcMatch && srcMatch[1]) url = srcMatch[1].replace(/&amp;/g, '&');
  }

  // 1. YouTube & Shorts
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([A-Za-z0-9_-]{11})/i);
  if (ytMatch) {
    const videoId = ytMatch[1];
    return {
      type: 'youtube',
      videoUrl: url,
      embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1&rel=0&modestbranding=1&loop=1&playlist=${videoId}`,
      posterUrl: poster || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      thumbnailUrl: poster || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      platformName: 'YouTube'
    };
  }

  // 2. TikTok
  const ttMatch = url.match(/tiktok\.com\/(?:@[\w.-]+\/video\/|v\/|embed\/v2\/)(\d+)/i);
  if (ttMatch) {
    const videoId = ttMatch[1];
    return {
      type: 'tiktok',
      videoUrl: url,
      embedUrl: `https://www.tiktok.com/embed/v2/${videoId}`,
      posterUrl: poster,
      thumbnailUrl: poster,
      platformName: 'TikTok'
    };
  } else if (/tiktok\.com/i.test(url)) {
    return {
      type: 'tiktok',
      videoUrl: url,
      embedUrl: url,
      posterUrl: poster,
      thumbnailUrl: poster,
      platformName: 'TikTok'
    };
  }

  // 3. Facebook
  if (/facebook\.com|fb\.watch|fb\.com/i.test(url)) {
    let embedUrl = url;
    if (!url.includes('facebook.com/plugins/video.php')) {
      embedUrl = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=0&autoplay=1&mute=0`;
    }
    return {
      type: 'facebook',
      videoUrl: url,
      embedUrl,
      posterUrl: poster,
      thumbnailUrl: poster,
      platformName: 'Facebook'
    };
  }

  // 4. Native Direct MP4 / MOV / Supabase Storage
  return {
    type: 'direct',
    videoUrl: url,
    embedUrl: url,
    posterUrl: poster,
    thumbnailUrl: poster,
    platformName: 'فيديو مباشر MP4'
  };
}

export const parseVideoUrl = getDirectVideoSource;

// ─── UNIVERSAL HYBRID REEL PLAYER ─────────────────────────────────────────────
export default function ReelPlayer({
  url,
  poster = '',
  isActive = true,
  isMuted = true,
  onToggleMute,
  title = '',
  style = {},
  objectFit = 'cover'
}) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showPlayIcon, setShowPlayIcon] = useState(false);
  const [hasError, setHasError] = useState(false);

  const parsed = getDirectVideoSource(typeof url === 'object' ? url : { url, thumbnailUrl: poster });

  // Sync playback for native HTML5 video
  useEffect(() => {
    if (parsed.type !== 'direct') return;
    const video = videoRef.current;
    if (!video || !parsed.videoUrl) return;

    if (isActive) {
      video.muted = isMuted;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setIsLoading(false);
          })
          .catch(() => {
            if (!video.muted) {
              video.muted = true;
              video.play()
                .then(() => setIsPlaying(true))
                .catch(() => setIsPlaying(false));
            } else {
              setIsPlaying(false);
            }
          });
      }
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, [isActive, parsed.videoUrl, parsed.type, isMuted]);

  useEffect(() => {
    if (videoRef.current && parsed.type === 'direct') {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted, parsed.type]);

  const handleTogglePlay = (e) => {
    if (parsed.type !== 'direct') return;
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().then(() => {
        setIsPlaying(true);
        triggerIconAnimation();
      }).catch(console.error);
    } else {
      video.pause();
      setIsPlaying(false);
      triggerIconAnimation();
    }
  };

  const triggerIconAnimation = () => {
    setShowPlayIcon(true);
    setTimeout(() => setShowPlayIcon(false), 650);
  };

  if (!parsed.videoUrl) {
    return (
      <div style={{
        width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        background: '#07090E', color: '#5A6A7E', fontSize: '0.85rem', gap: '8px', ...style
      }}>
        <span style={{ fontSize: '2rem' }}>🎬</span>
        <span>لا يوجد فيديو متاح</span>
      </div>
    );
  }

  // ─── 1. NATIVE HTML5 DIRECT VIDEO (FOR MP4 / MOV / SUPABASE STORAGE) ────────
  if (parsed.type === 'direct') {
    return (
      <div
        onClick={handleTogglePlay}
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          background: '#000000',
          overflow: 'hidden',
          cursor: 'pointer',
          userSelect: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...style
        }}
      >
        <video
          ref={videoRef}
          src={parsed.videoUrl}
          poster={parsed.posterUrl || undefined}
          playsInline
          webkit-playsinline="true"
          x5-playsinline="true"
          loop
          muted={isMuted}
          preload="metadata"
          onWaiting={() => setIsLoading(true)}
          onPlaying={() => {
            setIsLoading(false);
            setIsPlaying(true);
          }}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          style={{
            width: '100%',
            height: '100%',
            objectFit: objectFit,
            objectPosition: 'center center',
            display: 'block',
            backgroundColor: '#000'
          }}
        />

        {/* Loading Spinner */}
        {isLoading && !hasError && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.3)', pointerEvents: 'none', zIndex: 5
          }}>
            <div style={{
              width: '42px', height: '42px',
              border: '3px solid rgba(255,193,7,0.2)',
              borderTopColor: '#FFC107',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite'
            }} />
          </div>
        )}

        {/* Error Fallback */}
        {hasError && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(5, 7, 12, 0.95)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '20px', textAlign: 'center', gap: '10px', zIndex: 6
          }}>
            <span style={{ fontSize: '2rem' }}>⚠️</span>
            <div style={{ color: '#FFF', fontSize: '0.84rem', fontWeight: 800 }}>
              تعذر تشغيل هذا المقطع مباشرة
            </div>
            <a
              href={parsed.videoUrl}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              style={{
                padding: '8px 18px', borderRadius: '999px',
                background: '#FFC107', color: '#000', fontWeight: 900,
                fontSize: '0.78rem', textDecoration: 'none'
              }}
            >
              فتح الرابط المباشر ↗
            </a>
          </div>
        )}

        {/* Play/Pause Animation Ripple */}
        {showPlayIcon && (
          <div style={{
            position: 'absolute',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '74px', height: '74px', borderRadius: '50%',
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1.5px solid rgba(255, 255, 255, 0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', color: '#FFF',
            pointerEvents: 'none', zIndex: 12,
            boxShadow: '0 8px 32px rgba(0,0,0,0.8)',
            transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}>
            {isPlaying ? '▶' : '⏸'}
          </div>
        )}
      </div>
    );
  }

  // ─── 2. YOUTUBE & SHORTS EMBED ───────────────────────────────────────────────
  if (parsed.type === 'youtube') {
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%', background: '#000', overflow: 'hidden', ...style }}>
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

  // ─── 3. TIKTOK & OTHER SOCIAL EMBEDS (SEAMLESS CLEAN FIT) ─────────────────────
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
