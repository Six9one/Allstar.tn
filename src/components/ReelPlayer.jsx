import React, { useState, useRef, useEffect, useCallback } from 'react';

// ─── VIDEO SOURCE PARSER ──────────────────────────────────────────────────────
export function getDirectVideoSource(reelOrUrl) {
  if (!reelOrUrl) return { videoUrl: '', posterUrl: '', type: 'native', tiktokVideoId: '' };

  let url = '';
  let poster = '';
  let playbackType = 'native';
  let tiktokVideoId = '';

  if (typeof reelOrUrl === 'object') {
    url = (reelOrUrl.video_url || reelOrUrl.url || '').trim();
    poster = (reelOrUrl.thumbnail_url || reelOrUrl.thumbnailUrl || reelOrUrl.cover_image_url || '').trim();
    playbackType = reelOrUrl.playback_type || 'native';
    tiktokVideoId = reelOrUrl.tiktok_video_id || '';
  } else if (typeof reelOrUrl === 'string') {
    url = reelOrUrl.trim();
  }

  // Handle accidental iframe paste — extract src
  if (url.includes('<iframe') || url.includes('src=')) {
    const srcMatch = url.match(/src=["']([^"']+)["']/i);
    if (srcMatch && srcMatch[1]) url = srcMatch[1].replace(/&amp;/g, '&');
  }

  // Extract TikTok video ID from various URL formats
  if (!tiktokVideoId && url) {
    const tiktokMatch = url.match(/tiktok\.com\/@[^/]+\/video\/(\d+)/);
    if (tiktokMatch) {
      tiktokVideoId = tiktokMatch[1];
      playbackType = 'tiktok';
    }
  }

  return { videoUrl: url, posterUrl: poster, thumbnailUrl: poster, type: playbackType, tiktokVideoId };
}

export const parseVideoUrl = getDirectVideoSource;

// ─── TIKTOK VIDEO ID EXTRACTOR ────────────────────────────────────────────────
export function extractTikTokVideoId(input) {
  if (!input) return '';
  const str = String(input).trim();
  // Pure numeric ID
  if (/^\d{15,25}$/.test(str)) return str;
  // URL with /video/ID
  const match = str.match(/(?:tiktok\.com|vm\.tiktok\.com).*?\/(\d{15,25})/);
  if (match) return match[1];
  // embed link with /embed/v2/ID or /player/v1/ID
  const embedMatch = str.match(/\/(?:embed\/v2|player\/v1)\/(\d{15,25})/);
  if (embedMatch) return embedMatch[1];
  return '';
}

// ─── TIKTOK PLAYER URL BUILDER ────────────────────────────────────────────────
function buildTikTokPlayerUrl(videoId) {
  const params = new URLSearchParams({
    controls: '0',
    progress_bar: '0',
    play_button: '0',
    volume_control: '0',
    fullscreen_button: '0',
    timestamp: '0',
    music_info: '0',
    description: '0',
    rel: '0',
    native_context_menu: '0',
    autoplay: '1',
    muted: '0',
    loop: '1',
  });
  return `https://www.tiktok.com/player/v1/${videoId}?${params.toString()}`;
}

// ─── TIKTOK PLAYER COMPONENT ──────────────────────────────────────────────────
function TikTokPlayer({ videoId, isActive, isMuted, posterUrl, onReady, onError }) {
  const iframeRef = useRef(null);
  const [playerReady, setPlayerReady] = useState(false);
  const [playerError, setPlayerError] = useState(null);
  const [showPoster, setShowPoster] = useState(true);

  const playerUrl = buildTikTokPlayerUrl(videoId);

  // postMessage sender with origin validation
  const sendPlayerMessage = useCallback((type, value) => {
    if (!iframeRef.current?.contentWindow) return;
    try {
      const msg = { 'x-tiktok-player': true, type };
      if (value !== undefined) msg.value = value;
      iframeRef.current.contentWindow.postMessage(msg, 'https://www.tiktok.com');
    } catch (e) {
      console.warn('TikTok postMessage failed:', e);
    }
  }, []);

  // Listen for TikTok player events
  useEffect(() => {
    const handleMessage = (event) => {
      if (!event.origin.includes('tiktok.com')) return;
      const data = event.data;
      if (!data || data['x-tiktok-player'] !== true) return;

      switch (data.type) {
        case 'onPlayerReady':
          setPlayerReady(true);
          setShowPoster(false);
          // Immediately trigger play and unMute
          sendPlayerMessage('play');
          if (!isMuted) {
            sendPlayerMessage('unMute');
            sendPlayerMessage('setVolume', 1);
          }
          if (onReady) onReady();
          break;
        case 'onStateChange':
          // state: -1 unstarted, 0 ended, 1 playing, 2 paused, 3 buffering
          if (data.value === 1 || data.value === 3) {
            setShowPoster(false);
            if (!isMuted) {
              sendPlayerMessage('unMute');
            }
          }
          break;
        case 'onPlayerError':
          console.warn('TikTok Player notice/error:', data.value);
          // If error is autoplay restriction (3001, 3002, etc.), do NOT show error modal
          // Just ensure player is muted and retry play
          if (data.value === 3002 || data.value === 3001 || data.value === -1) {
            sendPlayerMessage('mute');
            sendPlayerMessage('play');
          } else if (data.value === 1001 || data.value === 2001) {
            setPlayerError(data.value);
            if (onError) onError(data.value);
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onReady, onError, isMuted, sendPlayerMessage]);

  // Keep player in sync with active slide
  useEffect(() => {
    if (!iframeRef.current?.contentWindow) return;
    if (isActive) {
      sendPlayerMessage('play');
      if (!isMuted) {
        sendPlayerMessage('unMute');
        sendPlayerMessage('setVolume', 1);
      }
    } else {
      sendPlayerMessage('pause');
    }
  }, [isActive, isMuted, sendPlayerMessage]);

  // Sync mute state
  useEffect(() => {
    if (!iframeRef.current?.contentWindow) return;
    if (isMuted) {
      sendPlayerMessage('mute');
    } else {
      sendPlayerMessage('unMute');
      sendPlayerMessage('setVolume', 1);
    }
  }, [isMuted, sendPlayerMessage]);

  // Tap on player directly toggles sound or ensures unMute
  const handleTap = () => {
    if (isMuted) {
      sendPlayerMessage('unMute');
      sendPlayerMessage('setVolume', 1);
    }
  };

  const errorMessages = {
    1001: 'فيديو غير صالح',
    2001: 'خطأ في الخادم',
    3001: 'خطأ في التشغيل',
    3002: 'التشغيل التلقائي غير مدعوم',
  };

  return (
    <div
      onClick={handleTap}
      style={{ position: 'relative', width: '100%', height: '100%', background: '#000' }}
    >
      {/* TikTok Player iframe — treated as pure video layer */}
      <iframe
        ref={iframeRef}
        src={playerUrl}
        allow="autoplay *; fullscreen *; encrypted-media *"
        allowFullScreen
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          border: 0,
          background: '#000',
          zIndex: 1,
        }}
        title="Academy Reel Video"
      />

      {/* Poster overlay while loading */}
      {showPoster && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 2,
          background: '#000',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'opacity 0.4s ease',
          opacity: playerReady ? 0 : 1,
          pointerEvents: playerReady ? 'none' : 'auto',
        }}>
          {posterUrl ? (
            <img
              src={posterUrl}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : null}
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              width: '42px', height: '42px',
              border: '3px solid rgba(255,193,7,0.2)',
              borderTopColor: '#FFC107',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }} />
          </div>
        </div>
      )}

      {/* Error state */}
      {playerError && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 3,
          background: 'rgba(0,0,0,0.85)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          color: '#FFF', gap: '10px',
          direction: 'rtl', textAlign: 'center', padding: '20px',
        }}>
          <span style={{ fontSize: '2rem' }}>⚠️</span>
          <span style={{ fontSize: '0.85rem', color: '#FF6E40', fontWeight: 800 }}>
            {errorMessages[playerError] || 'خطأ في تحميل الفيديو'}
          </span>
          <button
            onClick={() => {
              setPlayerError(null);
              setPlayerReady(false);
              setShowPoster(true);
              // Force reload by remounting
              if (iframeRef.current) {
                iframeRef.current.src = playerUrl;
              }
            }}
            style={{
              padding: '8px 20px', borderRadius: '999px',
              background: 'rgba(255,193,7,0.2)', border: '1px solid #FFC107',
              color: '#FFC107', fontWeight: 800, fontSize: '0.8rem',
              cursor: 'pointer', fontFamily: '"Cairo", "Tajawal", sans-serif',
            }}
          >
            إعادة المحاولة
          </button>
        </div>
      )}
    </div>
  );
}

// ─── NATIVE HTML5 VIDEO PLAYER ────────────────────────────────────────────────
function NativePlayer({ videoUrl, posterUrl, isActive, isMuted, onToggleMute }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showPlayIcon, setShowPlayIcon] = useState(false);

  // Sync playback
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
    if (videoRef.current) videoRef.current.muted = isMuted;
  }, [isMuted]);

  const handleTogglePlay = (e) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().then(() => { setIsPlaying(true); triggerIcon(); }).catch(console.error);
    } else {
      video.pause();
      setIsPlaying(false);
      triggerIcon();
    }
  };

  const triggerIcon = () => {
    setShowPlayIcon(true);
    setTimeout(() => setShowPlayIcon(false), 650);
  };

  return (
    <div
      onClick={handleTogglePlay}
      style={{
        position: 'relative', width: '100%', height: '100%',
        background: '#000', overflow: 'hidden', cursor: 'pointer',
        userSelect: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
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
        onPlaying={() => { setIsLoading(false); setIsPlaying(true); }}
        onCanPlay={() => setIsLoading(false)}
        style={{
          width: '100%', height: '100%',
          objectFit: 'cover', objectPosition: 'center center',
          display: 'block', backgroundColor: '#000',
        }}
      />

      {/* Loading Spinner */}
      {isLoading && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.25)', pointerEvents: 'none', zIndex: 5,
        }}>
          <div style={{
            width: '42px', height: '42px',
            border: '3px solid rgba(255,193,7,0.2)',
            borderTopColor: '#FFC107', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
        </div>
      )}

      {/* Play/Pause Animation Ripple */}
      {showPlayIcon && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '74px', height: '74px', borderRadius: '50%',
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
          border: '1.5px solid rgba(255,255,255,0.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2rem', color: '#FFF',
          pointerEvents: 'none', zIndex: 12,
          boxShadow: '0 8px 32px rgba(0,0,0,0.8)',
          transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        }}>
          {isPlaying ? '▶' : '⏸'}
        </div>
      )}
    </div>
  );
}

// ─── MAIN REEL PLAYER (DUAL MODE) ─────────────────────────────────────────────
export default function ReelPlayer({
  url,
  reel,
  poster = '',
  isActive = true,
  isMuted = false,
  onToggleMute,
  title = '',
  style = {},
  objectFit = 'cover'
}) {
  // Resolve reel data from either 'reel' object or individual props
  const reelData = reel || (typeof url === 'object' ? url : { url, thumbnailUrl: poster });
  const { videoUrl, posterUrl, type, tiktokVideoId } = getDirectVideoSource(reelData);

  // Determine playback mode
  const isTikTok = type === 'tiktok' && tiktokVideoId;

  if (!videoUrl && !tiktokVideoId) {
    return (
      <div style={{
        width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        background: '#000000', color: '#5A6A7E', fontSize: '0.85rem', gap: '8px', ...style,
      }}>
        <span style={{ fontSize: '2.5rem' }}>🎬</span>
        <span>لا يوجد فيديو متاح</span>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', ...style }}>
      {isTikTok ? (
        <TikTokPlayer
          videoId={tiktokVideoId}
          isActive={isActive}
          isMuted={isMuted}
          posterUrl={posterUrl}
        />
      ) : (
        <NativePlayer
          videoUrl={videoUrl}
          posterUrl={posterUrl}
          isActive={isActive}
          isMuted={isMuted}
          onToggleMute={onToggleMute}
        />
      )}
    </div>
  );
}
