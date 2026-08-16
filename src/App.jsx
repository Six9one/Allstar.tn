import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { LanguageProvider } from './context/LanguageContext'
import DrawerRoot from './components/DrawerMenu'
import Navbar from './components/Navbar'
import BottomNav from './components/BottomNav'
import InstallPrompt from './components/InstallPrompt'
import OnboardingModal from './components/OnboardingModal'
import AutoUpdater from './components/AutoUpdater'
import PushNotificationBanner from './components/PushNotificationBanner'
import PWAInstalledNotificationModal from './components/PWAInstalledNotificationModal'
import { notificationService } from './services/notifications'
import Home from './pages/Home'
import Programs from './pages/Programs'
import Academy from './pages/Academy'
import Register from './pages/Register'
import Schedule from './pages/Schedule'
import Contact from './pages/Contact'
import Gallery from './pages/Gallery'
import Events from './pages/Events'
import Pricing from './pages/Pricing'
import Shop from './pages/Shop'
import Portal from './pages/Portal'
import Drills from './pages/Drills'
import PlayerCards from './pages/PlayerCards'
import WeatherStatus from './pages/WeatherStatus'
import Feedback from './pages/Feedback'
import Certificates from './pages/Certificates'
import Reels from './pages/Reels'
import Admin from './pages/Admin'
import CoachPortal from './pages/CoachPortal'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    const savedUser = localStorage.getItem('allstar_user_session')
    
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser))
      } catch (e) {
        console.error(e)
      }
    }

    // Auto-request Native Phone System Notifications in background
    if ('Notification' in window && Notification.permission === 'default') {
      notificationService.requestPermission()
    }
  }, [])

  const handleLoginSuccess = (userSession) => {
    setCurrentUser(userSession)
  }

  const location = useLocation()
  const isReelsPage = location.pathname === '/reels'

  return (
    <LanguageProvider>
      <DrawerRoot currentUser={currentUser}>
        <ScrollToTop />

        {/* 1. FIXED TOP NAVBAR */}
        {!isReelsPage && (
          <Navbar onOpenOnboarding={() => setShowOnboarding(true)} currentUser={currentUser} />
        )}

        {/* 2. MAIN SCROLLABLE CONTENT WITH HARD PADDING */}
        <main className={isReelsPage ? 'reels-fullscreen-main' : 'main-content'}>
          <Routes>
            <Route path="/" element={<Home currentUser={currentUser} onOpenOnboarding={() => setShowOnboarding(true)} />} />
            <Route path="/programs" element={<Programs />} />
            <Route path="/academy" element={<Academy />} />
            <Route path="/register" element={<Register />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/events" element={<Events />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/portal" element={<Portal currentUser={currentUser} />} />
            <Route path="/coach-portal" element={<CoachPortal currentUser={currentUser} />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/drills" element={<Drills />} />
            <Route path="/player-cards" element={<PlayerCards />} />
            <Route path="/weather-status" element={<WeatherStatus />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/reels" element={<Reels />} />
            <Route path="/certificates" element={<Certificates />} />
          </Routes>
        </main>

        {/* 3. FIXED BOTTOM NAVIGATION BAR */}
        <BottomNav />

        {/* 4. MODALS & POPUPS */}
        <OnboardingModal
          isOpen={showOnboarding}
          onClose={() => setShowOnboarding(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      </DrawerRoot>

      {/* Floating System Modals - rendered outside drawer transform */}
      <AutoUpdater />
      <InstallPrompt />
      <PushNotificationBanner />
      <PWAInstalledNotificationModal />
    </LanguageProvider>
  )
}
