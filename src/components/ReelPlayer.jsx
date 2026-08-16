import React, { useState, useRef, useEffect, useCallback } from 'react';

// ─── PLAYER STATE MACHINE CONSTANTS ───────────────────────────────────────────
export const PLAYER_STATE = {
  INITIALIZING: 'INITIALIZING',
  READY: 'READY',
  MUTED: 'MUTED',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  BUFFERING: 'BUFFERING',
  ERROR: 'ERROR',
};

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
  if (/^\d{15,25}$/.test(str)) return str;
  const match = str.match(/(?:tiktok\.com|vm\.tiktok\.com).*?\/(\d{15,25})/);
  if (match) return match[1];
  const embedMatch = str.match(/\/(?:embed\/v2|player\/v1)\/(\d{15,25})/);
  if (embedMatch) return embedMatch[1];
  return '';
}

// ─── TIKTOK PLAYER URL BUILDER ────────────────────────────────────────────────
function buildTikTokPlayerUrl(videoId) {
  const params = new URLSearchParams({
    autoplay: '1',
    loop: '1',
    muted: '1',
    play_button: '0',
    controls: '0',
    progress_bar: '0',
    volume_control: '0',
    fullscreen_button: '0',
    timestamp: '0',
    music_info: '0',
    description: '0',
    rel: '0',
    native_context_menu: '0',
  });
  return `https://www.tiktok.com/player/v1/${videoId}?${params.toString()}`;
}

// ─── TIKTOK PLAYER COMPONENT (STATE MACHINE DRIVEN) ───────────────────────────
function TikTokPlayer({ videoId, isActive, isMuted = false, posterUrl, onReady, onError, onToggleMute }) {
  const iframeRef = useRef(null);
  const [playerState, setPlayerState] = useState(PLAYER_STATE.INITIALIZING);
  const isReadyRef = useRef(false);
  const isActiveRef = useRef(isActive);
  const isMutedRef = useRef(isMuted);

  isActiveRef.current = isActive;
  isMutedRef.current = isMuted;

  const playerUrl = buildTikTokPlayerUrl(videoId);

  const sendPlayerMessage = useCallback((type, value) => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentWindow) return;
    try {
      const msg = { 'x-tiktok-player': true, type };
      if (value !== undefined) msg.value = value;
      iframe.contentWindow.postMessage(msg, '*');
    } catch (e) {
      console.warn('TikTok postMessage failed:', e);
    }
  }, []);

  // Listen for TikTok iframe events
  useEffect(() => {
    const handleMessage = (event) => {
      if (!event.origin || !event.origin.includes('tiktok.com')) return;
      const data = event.data;
      if (!data || data['x-tiktok-player'] !== true) return;

      // Strict source isolation
      if (iframeRef.current && event.source !== iframeRef.current.contentWindow) {
        return;
      }

      switch (data.type) {
        case 'onPlayerReady':
          isReadyRef.current = true;
          setPlayerState(PLAYER_STATE.READY);

          if (isActiveRef.current) {
            setPlayerState(PLAYER_STATE.MUTED);
            sendPlayerMessage('mute');
            sendPlayerMessage('play');
            if (!isMutedRef.current) {
              sendPlayerMessage('unMute');
              sendPlayerMessage('setVolume', 1);
            }
          }
          if (onReady) onReady();
          break;

        case 'onStateChange':
          if (data.value === 1) {
            setPlayerState(PLAYER_STATE.PLAYING);
            if (!isMutedRef.current) {
              sendPlayerMessage('unMute');
              sendPlayerMessage('setVolume', 1);
            }
          } else if (data.value === 2) {
            setPlayerState(PLAYER_STATE.PAUSED);
          } else if (data.value === 3) {
            setPlayerState(PLAYER_STATE.BUFFERING);
          }
          break;

        case 'onPlayerError':
          console.warn(`TikTok Player [${videoId}] error:`, data.value);
          if (data.value === 3002 || data.value === 3001) {
            // Autoplay policy fallback: start muted
            sendPlayerMessage('mute');
            sendPlayerMessage('play');
          } else if (data.value === 1001 || data.value === 2001) {
            setPlayerState(PLAYER_STATE.ERROR);
            if (onError) onError(data.value);
          }
          break;

        default:
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [videoId, onReady, onError, sendPlayerMessage]);

  // Handle active status transitions
  useEffect(() => {
    isActiveRef.current = isActive;

    if (!isActive) {
      if (isReadyRef.current) {
        sendPlayerMessage('pause');
        setPlayerState(PLAYER_STATE.PAUSED);
      }
      return;
    }

    // When Reel becomes active: Start immediately muted then play
    if (isReadyRef.current) {
      setPlayerState(PLAYER_STATE.MUTED);
      sendPlayerMessage('mute');
      sendPlayerMessage('play');
      if (!isMutedRef.current) {
        sendPlayerMessage('unMute');
        sendPlayerMessage('setVolume', 1);
      }
    }
  }, [isActive, sendPlayerMessage]);

  // Sync mute state
  useEffect(() => {
    isMutedRef.current = isMuted;
    if (!isReadyRef.current) return;
    if (isMuted) {
      sendPlayerMessage('mute');
    } else {
      sendPlayerMessage('unMute');
      sendPlayerMessage('setVolume', 1);
    }
  }, [isMuted, sendPlayerMessage]);

  // Un-mute / play on tap
  const handleTap = () => {
    if (onToggleMute) {
      onToggleMute();
    } else {
      if (isMuted) {
        sendPlayerMessage('unMute');
        sendPlayerMessage('setVolume', 1);
      } else {
        if (playerState === PLAYER_STATE.PLAYING) {
          sendPlayerMessage('pause');
        } else {
          sendPlayerMessage('play');
        }
      }
    }
  };

  return (
    <div
      onClick={handleTap}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: '#000000',
        overflow: 'hidden',
        border: 'none',
        outline: 'none',
      }}
    >
      <iframe
        ref={iframeRef}
        src={playerUrl}
        allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
        allowFullScreen
        playsInline
        webkit-playsinline="true"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          border: 'none',
          outline: 'none',
          background: '#000000',
          zIndex: 1,
          display: 'block',
        }}
        title={`TikTok Reel ${videoId}`}
      />
    </div>
  );
}

// ─── NATIVE HTML5 VIDEO PLAYER (STATE MACHINE DRIVEN) ─────────────────────────
function NativePlayer({ videoUrl, posterUrl, isActive, isMuted, onToggleMute }) {
  const videoRef = useRef(null);
  const [playerState, setPlayerState] = useState(PLAYER_STATE.INITIALIZING);
  const [showPlayIcon, setShowPlayIcon] = useState(false);

  // ─── PLAYBACK STATE MACHINE: Driven ONLY by isActive + videoUrl ─────────────
  // Rule: Always start play() muted — browsers block unmuted autoplay.
  // Rule: After play() resolves, apply the real isMuted value.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoUrl) return;

    if (isActive) {
      // 1. Force muted first — satisfies browser autoplay policy
      video.muted = true;
      setPlayerState(PLAYER_STATE.MUTED);

      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setPlayerState(PLAYER_STATE.PLAYING);
            // 2. After play starts, apply the real mute preference
            video.muted = isMuted;
          })
          .catch((err) => {
            console.warn('Autoplay blocked even muted, retrying:', err);
            video.muted = true;
            video.play()
              .then(() => {
                setPlayerState(PLAYER_STATE.PLAYING);
                video.muted = isMuted;
              })
              .catch(() => setPlayerState(PLAYER_STATE.PAUSED));
          });
      }
    } else {
      video.pause();
      setPlayerState(PLAYER_STATE.PAUSED);
    }
  }, [isActive, videoUrl]); // eslint-disable-line react-hooks/exhaustive-deps
  // NOTE: isMuted intentionally excluded — handled by separate effect below

  // ─── MUTE SYNC: Independent of play/pause ────────────────────────────────
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
      video.play()
        .then(() => {
          setPlayerState(PLAYER_STATE.PLAYING);
          triggerIcon();
        })
        .catch(console.error);
    } else {
      video.pause();
      setPlayerState(PLAYER_STATE.PAUSED);
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
        border: 'none',
        outline: 'none',
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
        preload="auto"
        onLoadedData={() => {
          if (playerState === PLAYER_STATE.INITIALIZING) {
            setPlayerState(PLAYER_STATE.READY);
          }
        }}
        onWaiting={() => setPlayerState(PLAYER_STATE.BUFFERING)}
        onPlaying={() => setPlayerState(PLAYER_STATE.PLAYING)}
        onPause={() => setPlayerState(PLAYER_STATE.PAUSED)}
        onError={() => setPlayerState(PLAYER_STATE.ERROR)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center center',
          display: 'block',
          backgroundColor: '#000000',
          border: 'none',
          outline: 'none',
        }}
      />

      {/* Loading Spinner for Buffering */}
      {playerState === PLAYER_STATE.BUFFERING && (
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

      {/* Play/Pause Animated Feedback */}
      {showPlayIcon && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '72px', height: '72px', borderRadius: '50%',
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
          border: '1.5px solid rgba(255,255,255,0.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2rem', color: '#FFF',
          pointerEvents: 'none', zIndex: 12,
          boxShadow: '0 8px 32px rgba(0,0,0,0.8)',
          transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        }}>
          {playerState === PLAYER_STATE.PLAYING ? '▶' : '⏸'}
        </div>
      )}
    </div>
  );
}

// ─── MAIN REEL PLAYER COMPONENT (DUAL MODE) ───────────────────────────────────
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
  const reelData = reel || (typeof url === 'object' ? url : { url, thumbnailUrl: poster });
  const { videoUrl, posterUrl, type, tiktokVideoId } = getDirectVideoSource(reelData);

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
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      background: '#000000',
      border: 'none',
      outline: 'none',
      ...style
    }}>
      {isTikTok ? (
        <TikTokPlayer
          videoId={tiktokVideoId}
          isActive={isActive}
          isMuted={isMuted}
          posterUrl={posterUrl}
          onToggleMute={onToggleMute}
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
