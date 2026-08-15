import React, { useState, useRef, useEffect } from 'react';

// ─── DIRECT VIDEO SOURCE PARSER ───────────────────────────────────────────────
export function getDirectVideoSource(reelOrUrl) {
  if (!reelOrUrl) return { videoUrl: '', posterUrl: '', type: 'direct' };

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

  return {
    videoUrl: url,
    posterUrl: poster,
    thumbnailUrl: poster,
    type: 'direct'
  };
}

export const parseVideoUrl = getDirectVideoSource;

// ─── PURE NATIVE HTML5 REEL PLAYER (ZERO IFRAMES, ZERO EMBEDS) ─────────────────
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

  const { videoUrl, posterUrl } = getDirectVideoSource(typeof url === 'object' ? url : { url, thumbnailUrl: poster });

  // Sync playback for native HTML5 video
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoUrl) return;

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
            // Autoplay with audio might be blocked by browser; retry muted
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
  }, [isActive, videoUrl, isMuted]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const handleTogglePlay = (e) => {
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

  if (!videoUrl) {
    return (
      <div style={{
        width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        background: '#000000', color: '#5A6A7E', fontSize: '0.85rem', gap: '8px', ...style
      }}>
        <span style={{ fontSize: '2.5rem' }}>🎬</span>
        <span>لا يوجد فيديو متاح</span>
      </div>
    );
  }

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
        src={videoUrl}
        poster={posterUrl || undefined}
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
        onCanPlay={() => setIsLoading(false)}
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
      {isLoading && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.25)', pointerEvents: 'none', zIndex: 5
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
