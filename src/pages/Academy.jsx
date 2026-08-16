import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../services/db';

export default function Academy() {
  const [coaches, setCoaches] = useState([]);

  useEffect(() => {
    setCoaches(db.getCoaches());
    db.getCoachesAsync().then(setCoaches);
    const unsub = db.subscribeToRealtime((liveCoaches) => setCoaches(liveCoaches));
    return () => { if (unsub) unsub(); };
  }, []);

  return (
    <div style={{
      maxWidth: '480px',
      margin: '0 auto',
      paddingBottom: '80px',
      color: '#FFFFFF',
      fontFamily: "'Cairo', 'Tajawal', sans-serif",
      direction: 'rtl',
      minHeight: '100vh'
    }}>
      {/* 1. Hero Section */}
      <div style={{ padding: '16px 20px 24px 20px' }}>
        <div className="sleek-card" style={{ 
          textAlign: 'center', 
          padding: '40px 20px',
          background: 'linear-gradient(145deg, rgba(25,29,42,0.95), rgba(14,16,24,0.98))',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '26px'
        }}>
          <div className="star-badge" style={{ 
            display: 'inline-block', 
            background: 'rgba(255,193,7,0.1)', 
            color: '#FFC107', 
            padding: '6px 16px', 
            borderRadius: '9999px',
            marginBottom: '16px',
            fontSize: '0.9rem',
            fontWeight: 'bold'
          }}>
            تأسست 2020
          </div>
          <h1 style={{ 
            fontSize: '2.4rem', 
            fontWeight: '900', 
            margin: '0 0 12px 0',
            lineHeight: '1.2'
          }}>
            أكاديمية أولستار الرياضية
          </h1>
          <p style={{ 
            color: '#8E9BAE', 
            fontSize: '1.1rem', 
            margin: '0' 
          }}>
            نبني الأبطال من تطاوين 🇹🇳
          </p>
        </div>
      </div>

      <div style={{ padding: '0 20px' }}>
        {/* 2. Quick Stats Row */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          gap: '10px',
          marginBottom: '32px'
        }}>
          <div className="sleek-card" style={{ flex: 1, textAlign: 'center', padding: '16px 8px' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>🏃</div>
            <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#FFC107' }}>120+</div>
            <div style={{ fontSize: '0.8rem', color: '#8E9BAE' }}>لاعب</div>
          </div>
          <div className="sleek-card" style={{ flex: 1, textAlign: 'center', padding: '16px 8px' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>🎯</div>
            <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#00E5FF' }}>3</div>
            <div style={{ fontSize: '0.8rem', color: '#8E9BAE' }}>رياضات</div>
          </div>
          <div className="sleek-card" style={{ flex: 1, textAlign: 'center', padding: '16px 8px' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>👨‍🏫</div>
            <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#00E676' }}>5</div>
            <div style={{ fontSize: '0.8rem', color: '#8E9BAE' }}>مدربين</div>
          </div>
        </div>

        {/* 3. Mission Card */}
        <div className="sleek-card" style={{ 
          marginBottom: '32px',
          padding: '24px',
          borderLeft: '4px solid #FFC107'
        }}>
          <h2 style={{ fontSize: '1.4rem', color: '#FFC107', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🎯</span> رسالتنا
          </h2>
          <p style={{ color: '#8E9BAE', fontSize: '0.95rem', lineHeight: '1.8', margin: 0 }}>
            تطوير الرياضة الشبابية في تطاوين من خلال بيئة تدريبية احترافية تجمع بين التفوق الرياضي، الدعم الأكاديمي، وبناء الشخصية القيادية لأبطال المستقبل.
          </p>
        </div>

        {/* 4. Values Grid */}
        <h2 className="section-title" style={{ fontSize: '1.4rem', margin: '0 0 16px 0' }}>قيمنا</h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '12px',
          marginBottom: '32px'
        }}>
          <div className="sleek-card" style={{ textAlign: 'center', padding: '16px 8px' }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🏅</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>التميز</div>
            <div style={{ fontSize: '0.75rem', color: '#5A677B' }}>(Excellence)</div>
          </div>
          <div className="sleek-card" style={{ textAlign: 'center', padding: '16px 8px' }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🤝</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>الروح الرياضية</div>
            <div style={{ fontSize: '0.75rem', color: '#5A677B' }}>(Sportsmanship)</div>
          </div>
          <div className="sleek-card" style={{ textAlign: 'center', padding: '16px 8px' }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>💪</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>الانضباط</div>
            <div style={{ fontSize: '0.75rem', color: '#5A677B' }}>(Discipline)</div>
          </div>
        </div>

        {/* 5. Coaches Section */}
        <h2 className="section-title" style={{ fontSize: '1.4rem', margin: '0 0 16px 0' }}>فريق المدربين</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
          {coaches.map((coach, i) => {
            const color = coach.sport === 'Football' ? '#FFC107' : coach.sport === 'Basketball' ? '#00E5FF' : '#00E676';
            const role = coach.sport === 'Football' ? 'مدرب كرة القدم' : coach.sport === 'Basketball' ? 'مدرب كرة السلة' : coach.sport === 'Handball' ? 'مدرب كرة اليد' : coach.sport;
            return (
              <div key={coach.id || i} className="sleek-card" style={{ display: 'flex', gap: '16px', padding: '20px', alignItems: 'center' }}>
                <div style={{ 
                  width: '60px', 
                  height: '60px', 
                  borderRadius: '50%', 
                  background: 'rgba(255,255,255,0.05)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: '2rem',
                  border: `2px solid ${color}`,
                  overflow: 'hidden',
                  flexShrink: 0
                }}>
                  {coach.photoUrl ? (
                    <img src={coach.photoUrl} alt={coach.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    coach.sport === 'Basketball' ? '🏀' : coach.sport === 'Handball' ? '🤾' : '⚽'
                  )}
                </div>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem' }}>{coach.nickname || coach.name}</h3>
                  <div style={{ color, fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '6px' }}>{role} ({coach.group || 'الأكاديمية'})</div>
                  {coach.phone && (
                    <div style={{ 
                      display: 'inline-block', 
                      background: 'rgba(255,255,255,0.1)', 
                      padding: '2px 8px', 
                      borderRadius: '12px', 
                      fontSize: '0.7rem',
                      color: '#8E9BAE',
                      marginBottom: '8px'
                    }}>
                      📞 {coach.phone}
                    </div>
                  )}
                  <p style={{ color: '#8E9BAE', fontSize: '0.85rem', margin: 0, lineHeight: '1.4' }}>{coach.bio || 'مدرب معتمد بـ أكاديمية أولستار الرياضية'}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* 6. Timeline Section */}
        <h2 className="section-title" style={{ fontSize: '1.4rem', margin: '0 0 16px 0' }}>مسيرتنا</h2>
        <div className="sleek-card" style={{ padding: '24px', marginBottom: '32px' }}>
          <div style={{ position: 'relative', paddingRight: '24px' }}>
            {/* Vertical Line */}
            <div style={{ position: 'absolute', right: '11px', top: '10px', bottom: '10px', width: '2px', background: 'rgba(255,255,255,0.1)' }}></div>
            
            {[
              { year: '2020', title: 'التأسيس' },
              { year: '2021', title: 'أول موسم' },
              { year: '2022', title: 'أول بطولة' },
              { year: '2024', title: '120 لاعب' }
            ].map((item, i) => (
              <div key={i} style={{ position: 'relative', marginBottom: i !== 3 ? '24px' : '0' }}>
                <div style={{ 
                  position: 'absolute', 
                  right: '-28px', 
                  top: '4px', 
                  width: '10px', 
                  height: '10px', 
                  borderRadius: '50%', 
                  background: '#FFC107',
                  border: '3px solid #08090C'
                }}></div>
                <div style={{ color: '#FFC107', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '4px' }}>{item.year}</div>
                <div style={{ color: '#FFFFFF', fontSize: '1rem' }}>{item.title}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 7. Facilities Section */}
        <h2 className="section-title" style={{ fontSize: '1.4rem', margin: '0 0 16px 0' }}>مرافقنا</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '40px' }}>
          <div className="sleek-card" style={{ padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🏟️</div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem', color: '#00E676' }}>ملعب خارجي</h3>
            <p style={{ color: '#8E9BAE', fontSize: '0.8rem', margin: 0 }}>ملاعب معشبة ومجهزة للتدريبات الخارجية</p>
          </div>
          <div className="sleek-card" style={{ padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🏢</div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem', color: '#00E5FF' }}>قاعة مغطاة</h3>
            <p style={{ color: '#8E9BAE', fontSize: '0.8rem', margin: 0 }}>قاعة مجهزة لألعاب الصالات والأنشطة</p>
          </div>
        </div>

        {/* 8. CTA Section */}
        <div className="sleek-card" style={{ 
          textAlign: 'center', 
          padding: '32px 20px',
          background: 'linear-gradient(145deg, rgba(255,193,7,0.1), rgba(14,16,24,0.98))',
          border: '1px solid rgba(255,193,7,0.3)'
        }}>
          <h2 style={{ fontSize: '1.6rem', margin: '0 0 12px 0' }}>انضم لأسرة أولستار</h2>
          <p style={{ color: '#8E9BAE', fontSize: '0.95rem', marginBottom: '24px' }}>
            سجل الآن وابدأ رحلة التألق الرياضي والأكاديمي معنا
          </p>
          <Link to="/register" className="btn-star" style={{ 
            display: 'inline-block',
            padding: '16px 32px',
            fontSize: '1.1rem',
            textDecoration: 'none',
            background: 'linear-gradient(135deg, #FFC107, #FF9500)',
            color: '#08090C',
            fontWeight: '900',
            borderRadius: '9999px',
            boxShadow: '0 4px 15px rgba(255,193,7,0.3)'
          }}>
            سجل طفلك الآن ✍️
          </Link>
        </div>

      </div>
    </div>
  );
}
