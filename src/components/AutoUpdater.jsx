import { useEffect, useState } from 'react'
import { registerSW } from 'virtual:pwa-register'

export default function AutoUpdater() {
  const [updateNotification, setUpdateNotification] = useState(false)

  useEffect(() => {
    let updateSWFunction = null

    try {
      updateSWFunction = registerSW({
        immediate: true,
        onNeedRefresh() {
          console.log('[PWA] New version detected! Auto updating...')
          setUpdateNotification(true)
          if (updateSWFunction) {
            updateSWFunction(true)
          } else {
            window.location.reload()
          }
        },
        onOfflineReady() {
          console.log('[PWA] App ready to work offline.')
        },
        onRegisteredSW(swUrl, registration) {
          console.log('[PWA] Service Worker registered:', swUrl)
          if (registration) {
            // Check for updates every 30 seconds
            setInterval(() => {
              registration.update().catch(err => console.log('[PWA] Update check failed:', err))
            }, 30000)

            // Check for updates whenever app comes back into focus
            window.addEventListener('focus', () => {
              registration.update().catch(err => console.log('[PWA] Focus update check failed:', err))
            })
            window.addEventListener('visibilitychange', () => {
              if (document.visibilityState === 'visible') {
                registration.update().catch(err => console.log('[PWA] Visibility update check failed:', err))
              }
            })
          }
        }
      })
    } catch (e) {
      console.log('[PWA] Service Worker registration fallback:', e)
    }
  }, [])

  if (!updateNotification) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: '80px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 999999,
      background: 'linear-gradient(135deg, #FFC107 0%, #FF9500 100%)',
      color: '#08090C',
      padding: '10px 20px',
      borderRadius: '20px',
      fontWeight: 900,
      fontSize: '0.85rem',
      boxShadow: '0 10px 30px rgba(0,0,0,0.8), 0 0 20px rgba(255,193,7,0.5)',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }}>
      <span>⚡ تم التحديث التلقائي إلى أحدث إصدار! (Auto-Updated)</span>
    </div>
  )
}
