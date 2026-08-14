import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import logoMain from '../assets/logo-light.png'
import { db } from '../services/db'

export default function Footer() {
  const [content, setContent] = useState(() => db.getSiteContent())

  useEffect(() => {
    setContent(db.getSiteContent())
  }, [])

  return (
    <footer style={{
      background: 'linear-gradient(180deg, #0A1F44 0%, #061329 100%)',
      borderTop: '2px solid rgba(255, 193, 7, 0.4)',
      paddingTop: '60px',
      paddingBottom: '30px',
      color: '#FFFFFF',
      marginTop: '60px'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '40px',
          marginBottom: '50px'
        }}>

          {/* Column 1: Brand Info */}
          <div>
            <div style={{ marginBottom: '20px' }}>
              <img
                src={logoMain}
                alt="All Star Sports Academy Main Logo"
                style={{ height: '55px', width: 'auto', display: 'block', filter: 'drop-shadow(0 0 10px rgba(255, 193, 7, 0.4))' }}
              />
            </div>
            <p style={{ color: '#B0BEC5', fontSize: '0.95rem', lineHeight: '1.7', marginBottom: '20px' }}>
              {content.academy_desc || 'مركز تطوير رياضي وتربوي للأطفال والشباب (6 - 16 سنة) بتطاوين، تونس.'}
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <a href={content.footer_facebook || "https://www.facebook.com/allstartataouine"} target="_blank" rel="noreferrer" title="Facebook Page" style={{
                width: '42px', height: '42px', borderRadius: '50%', background: 'rgba(255,193,7,0.15)',
                border: '1.5px solid #FFC107', color: '#FFC107', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem'
              }}>f</a>
              <a href={content.footer_instagram || "https://instagram.com"} target="_blank" rel="noreferrer" title="Instagram" style={{
                width: '42px', height: '42px', borderRadius: '50%', background: 'rgba(255,193,7,0.15)',
                border: '1.5px solid #FFC107', color: '#FFC107', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem'
              }}>📸</a>
              <a href={`https://wa.me/${(content.footer_whatsapp || '21658263467').replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" title="WhatsApp" style={{
                width: '42px', height: '42px', borderRadius: '50%', background: 'rgba(255,193,7,0.15)',
                border: '1.5px solid #FFC107', color: '#FFC107', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem'
              }}>💬</a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 style={{ color: '#FFC107', fontSize: '1.1rem', marginBottom: '20px', borderRight: '3px solid #FFC107', paddingRight: '10px' }}>
              روابط سريعة
            </h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li><Link to="/" style={{ color: '#B0BEC5' }}>الرئيسية</Link></li>
              <li><Link to="/programs" style={{ color: '#B0BEC5' }}>برامجنا الرياضية</Link></li>
              <li><Link to="/academy" style={{ color: '#B0BEC5' }}>عن الأكاديمية (رؤيتنا ورسالتنا)</Link></li>
              <li><Link to="/schedule" style={{ color: '#B0BEC5' }}>جدول الحصص والتمارين</Link></li>
              <li><Link to="/register" style={{ color: '#B0BEC5' }}>تسجيل مشترك جديد</Link></li>
            </ul>
          </div>

          {/* Column 3: Sports Programs */}
          <div>
            <h4 style={{ color: '#FFC107', fontSize: '1.1rem', marginBottom: '20px', borderRight: '3px solid #FFC107', paddingRight: '10px' }}>
              الرياضات والدعم
            </h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px', color: '#B0BEC5' }}>
              <li>⚽ كرة القدم (Football)</li>
              <li>🏀 كرة السلة (Basketball)</li>
              <li>🤾 كرة اليد (Handball)</li>
              <li>📚 المرافقة والدعم المدرسي</li>
              <li>🌟 ورشات المهارات الحياتية</li>
            </ul>
          </div>

          {/* Column 4: Contact Info */}
          <div>
            <h4 style={{ color: '#FFC107', fontSize: '1.1rem', marginBottom: '20px', borderRight: '3px solid #FFC107', paddingRight: '10px' }}>
              العنوان والتواصل الرسمـي
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', color: '#B0BEC5', fontSize: '0.95rem' }}>
              <div>📍 <strong>المقر:</strong> القاعة المغطاة، المركب الرياضي حي المهرجان، تطاوين</div>
              <div>🌐 <strong>فيسبوك:</strong> <a href="https://www.facebook.com/allstartataouine" target="_blank" rel="noreferrer" style={{ color: '#FFC107' }}>allstartataouine</a></div>
              <div>📧 <strong>البريد:</strong> contact@allstar.tn</div>
              <div>⏰ <strong>أوقات الحصص:</strong> الإثنين - السبت: 16:00 - 19:30</div>
            </div>
          </div>

        </div>

        {/* Bottom copyright line */}
        <div style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          paddingTop: '25px',
          textAlign: 'center',
          color: '#78909C',
          fontSize: '0.85rem'
        }}>
          جميع الحقوق محفوظة © {new Date().getFullYear()} أكاديمية أولستار الرياضية - All Star Sports Academy Tataouine 🇹🇳
        </div>
      </div>
    </footer>
  )
}
