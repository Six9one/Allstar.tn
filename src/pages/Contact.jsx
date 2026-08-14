import { useState } from 'react';

export default function Contact() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div style={{ paddingTop: '95px', paddingBottom: '40px', minHeight: '100vh', background: '#08090C' }}>
      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '0 16px', direction: 'rtl', fontFamily: '"Cairo", "Tajawal", sans-serif' }}>
        
        {/* Page Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ color: '#FFFFFF', fontSize: '2rem', fontWeight: 900, marginBottom: '8px' }}>تواصل معنا</h1>
          <p style={{ color: '#8E9BAE', fontSize: '1rem', margin: 0 }}>نحن هنا للإجابة على جميع استفساراتك</p>
        </div>

        {/* WhatsApp CTA Card */}
        <div 
          className="sleek-card"
          style={{
            background: 'linear-gradient(145deg, rgba(25,29,42,0.95), rgba(14,16,24,0.98))',
            border: '2px solid #00E676',
            boxShadow: '0 0 20px rgba(0, 230, 118, 0.2)',
            borderRadius: '26px',
            padding: '24px',
            textAlign: 'center',
            marginBottom: '24px'
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📱</div>
          <h2 style={{ color: '#00E676', fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px' }}>راسلنا مباشرة على واتساب</h2>
          <p style={{ color: '#FFFFFF', fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px', direction: 'ltr' }}>+216 58 263 467</p>
          
          <a 
            href="https://wa.me/21658263467" 
            target="_blank" 
            rel="noreferrer"
            style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, #00E676, #00C853)',
              color: '#08090C',
              fontWeight: 900,
              padding: '14px 32px',
              borderRadius: '9999px',
              textDecoration: 'none',
              fontSize: '1.1rem',
              width: '100%',
              boxSizing: 'border-box'
            }}
          >
            فتح واتساب
          </a>
        </div>

        {/* Contact Info Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          <div className="sleek-card" style={{ padding: '16px', borderRadius: '20px', textAlign: 'center', background: 'linear-gradient(145deg, rgba(25,29,42,0.95), rgba(14,16,24,0.98))', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>📍</div>
            <h3 style={{ color: '#8E9BAE', fontSize: '0.9rem', marginBottom: '4px' }}>الموقع</h3>
            <p style={{ color: '#FFFFFF', fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>تطاوين، تونس</p>
            <p style={{ color: '#5A677B', fontSize: '0.8rem', margin: 0 }}>(Tataouine, Tunisia)</p>
          </div>
          
          <div className="sleek-card" style={{ padding: '16px', borderRadius: '20px', textAlign: 'center', background: 'linear-gradient(145deg, rgba(25,29,42,0.95), rgba(14,16,24,0.98))', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>📞</div>
            <h3 style={{ color: '#8E9BAE', fontSize: '0.9rem', marginBottom: '4px' }}>الهاتف</h3>
            <p style={{ color: '#FFFFFF', fontSize: '1rem', fontWeight: 700, margin: 0, direction: 'ltr' }}>+216 XX XXX XXX</p>
          </div>

          <div className="sleek-card" style={{ padding: '16px', borderRadius: '20px', textAlign: 'center', background: 'linear-gradient(145deg, rgba(25,29,42,0.95), rgba(14,16,24,0.98))', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>📧</div>
            <h3 style={{ color: '#8E9BAE', fontSize: '0.9rem', marginBottom: '4px' }}>البريد</h3>
            <p style={{ color: '#FFFFFF', fontSize: '0.85rem', fontWeight: 700, margin: 0 }}>contact@allstar.tn</p>
          </div>

          <div className="sleek-card" style={{ padding: '16px', borderRadius: '20px', textAlign: 'center', background: 'linear-gradient(145deg, rgba(25,29,42,0.95), rgba(14,16,24,0.98))', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>⏰</div>
            <h3 style={{ color: '#8E9BAE', fontSize: '0.9rem', marginBottom: '4px' }}>أوقات العمل</h3>
            <p style={{ color: '#FFFFFF', fontSize: '0.9rem', fontWeight: 700, margin: 0 }}>الإثنين - السبت</p>
            <p style={{ color: '#FFFFFF', fontSize: '0.8rem', fontWeight: 700, margin: 0, direction: 'ltr' }}>8:00 - 20:00</p>
          </div>
        </div>

        {/* Map Embed */}
        <div className="sleek-card" style={{ padding: '8px', borderRadius: '20px', marginBottom: '24px', background: 'linear-gradient(145deg, rgba(25,29,42,0.95), rgba(14,16,24,0.98))', border: '1px solid rgba(255,255,255,0.08)' }}>
          <iframe 
            title="Tataouine Map"
            width="100%" 
            height="200" 
            frameBorder="0" 
            scrolling="no" 
            marginHeight="0" 
            marginWidth="0" 
            src="https://www.openstreetmap.org/export/embed.html?bbox=10.43,32.91,10.47,32.93&layer=mapnik&marker=32.9211,10.4514"
            style={{ borderRadius: '16px', display: 'block', border: 'none' }}
          ></iframe>
        </div>

        {/* Social Links Row */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '32px' }}>
          {['📘', '📸', '🎵'].map((emoji, idx) => (
            <button 
              key={idx}
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'linear-gradient(145deg, rgba(25,29,42,0.95), rgba(14,16,24,0.98))',
                border: '1px solid rgba(255,255,255,0.08)',
                fontSize: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Quick Message Form */}
        <div className="sleek-card" style={{ padding: '24px', borderRadius: '26px', background: 'linear-gradient(145deg, rgba(25,29,42,0.95), rgba(14,16,24,0.98))', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h3 style={{ color: '#FFC107', fontSize: '1.2rem', fontWeight: 800, marginBottom: '20px' }}>أرسل رسالة سريعة ✉️</h3>
          {sent ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>✅</div>
              <h4 style={{ color: '#00E676', fontSize: '1.1rem', marginBottom: '8px' }}>تم الإرسال بنجاح!</h4>
              <p style={{ color: '#8E9BAE', fontSize: '0.9rem', margin: 0 }}>سنتواصل معك في أقرب وقت.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="الاسم الكامل"
                  style={{ 
                    width: '100%', 
                    padding: '14px', 
                    borderRadius: '12px', 
                    background: 'rgba(255,255,255,0.05)', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    color: '#FFFFFF',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div>
                <textarea
                  required
                  rows="4"
                  value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value })}
                  placeholder="كيف يمكننا مساعدتك؟"
                  style={{ 
                    width: '100%', 
                    padding: '14px', 
                    borderRadius: '12px', 
                    background: 'rgba(255,255,255,0.05)', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    color: '#FFFFFF',
                    fontFamily: 'inherit',
                    resize: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <button 
                type="submit" 
                style={{ 
                  background: 'linear-gradient(135deg, #FFC107, #FF9500)',
                  color: '#08090C',
                  fontWeight: 900,
                  padding: '14px',
                  borderRadius: '9999px',
                  border: 'none',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  fontFamily: 'inherit'
                }}
              >
                إرسال 🚀
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
