import React from 'react';
import { Link } from 'react-router-dom';

export default function Programs() {
  const sports = [
    {
      id: 'football',
      emoji: '⚽',
      nameAr: 'كرة القدم',
      nameEn: 'Football',
      color: '#00E676',
      desc: 'تدريب متكامل على ملعب معشب بأحدث المعايير في تطاوين. نركز على المهارات الأساسية واللعب الجماعي.',
      ages: ['U8', 'U10', 'U12', 'U14', 'U16', 'Seniors'],
      schedule: 'الثلاثاء والجمعة | 17:00 - 19:00',
      coach: 'كابتن محمد',
      coachEmoji: '👨‍🏫',
      capacity: 20,
      totalCapacity: 24,
    },
    {
      id: 'basketball',
      emoji: '🏀',
      nameAr: 'كرة السلة',
      nameEn: 'Basketball',
      color: '#FF6D00',
      desc: 'طور مهاراتك في القفز والتسديد في قاعتنا المغطاة بتطاوين. تدريب يركز على اللياقة والسرعة.',
      ages: ['U10', 'U12', 'U14', 'U16', 'Seniors'],
      schedule: 'الأربعاء والسبت | 16:00 - 18:00',
      coach: 'كابتن أمين',
      coachEmoji: '🧔‍♂️',
      capacity: 15,
      totalCapacity: 20,
    },
    {
      id: 'handball',
      emoji: '🤾',
      nameAr: 'كرة اليد',
      nameEn: 'Handball',
      color: '#00E5FF',
      desc: 'برنامج مكثف لتعلم تكتيكات كرة اليد وتقوية البنية الجسمانية. انضم لفريق الأبطال في تطاوين.',
      ages: ['U12', 'U14', 'U16', 'Seniors'],
      schedule: 'الإثنين والخميس | 18:00 - 20:00',
      coach: 'كابتن طارق',
      coachEmoji: '👨‍🦲',
      capacity: 12,
      totalCapacity: 16,
    }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#08090C',
      color: '#FFFFFF',
      fontFamily: '"Cairo", "Tajawal", sans-serif',
      direction: 'rtl'
    }}>
      <div style={{
        maxWidth: '480px',
        margin: '0 auto',
        paddingTop: '16px',
        paddingBottom: '24px',
        paddingLeft: '16px',
        paddingRight: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        
        {/* Header Section */}
        <div style={{ textAlign: 'center', marginBottom: '10px' }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 900,
            margin: '0 0 8px 0',
            color: '#FFC107',
            textShadow: '0 2px 10px rgba(255,193,7,0.2)'
          }}>
            برامج الأكاديمية
          </h1>
          <p style={{
            color: '#8E9BAE',
            fontSize: '1.1rem',
            margin: '0 0 16px 0'
          }}>
            Train Like a Champion
          </p>
          <div style={{
            height: '3px',
            width: '60px',
            background: 'linear-gradient(90deg, transparent, #FFC107, transparent)',
            margin: '0 auto'
          }}></div>
        </div>

        {/* Sport Cards */}
        {sports.map((sport) => (
          <div key={sport.id} className="sleek-card" style={{
            background: 'linear-gradient(145deg, rgba(25,29,42,0.95), rgba(14,16,24,0.98))',
            border: '1px solid rgba(255,255,255,0.08)',
            borderTop: `4px solid ${sport.color}`,
            borderRadius: '26px',
            padding: '24px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Header: Icon + Titles */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <div style={{ fontSize: '3rem', lineHeight: 1 }}>{sport.emoji}</div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800 }}>
                  {sport.nameAr}
                </h2>
                <div style={{ color: sport.color, fontWeight: 700, fontSize: '0.9rem', letterSpacing: '1px' }}>
                  {sport.nameEn.toUpperCase()}
                </div>
              </div>
            </div>

            {/* Description */}
            <p style={{ color: '#8E9BAE', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '20px' }}>
              {sport.desc}
            </p>

            {/* Ages */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
              {sport.ages.map(age => (
                <span key={age} style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  padding: '4px 10px',
                  borderRadius: '999px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: '#FFFFFF'
                }}>
                  {age}
                </span>
              ))}
            </div>

            {/* Info Rows */}
            <div style={{
              background: 'rgba(0,0,0,0.2)',
              borderRadius: '16px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#5A677B', fontSize: '0.9rem' }}>⏰ التوقيت</span>
                <span style={{ color: '#FFFFFF', fontSize: '0.85rem', fontWeight: 600 }}>{sport.schedule}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#5A677B', fontSize: '0.9rem' }}>المُدرب</span>
                <span style={{ color: '#FFFFFF', fontSize: '0.9rem', fontWeight: 600 }}>
                  {sport.coachEmoji} {sport.coach}
                </span>
              </div>
              
              {/* Capacity Bar */}
              <div style={{ marginTop: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: '#5A677B', fontSize: '0.85rem' }}>الطاقة الاستيعابية</span>
                  <span style={{ color: '#FFFFFF', fontSize: '0.85rem', fontWeight: 700 }}>
                    {sport.capacity}/{sport.totalCapacity} لاعب
                  </span>
                </div>
                <div className="stat-box" style={{
                  height: '8px',
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '999px',
                  overflow: 'hidden'
                }}>
                  <div className="stat-progress-fill" style={{
                    width: `${(sport.capacity / sport.totalCapacity) * 100}%`,
                    height: '100%',
                    background: sport.color,
                    borderRadius: '999px'
                  }}></div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <Link to="/register" style={{ textDecoration: 'none' }}>
              <button className="btn-star" style={{
                width: '100%',
                background: 'linear-gradient(135deg, #FFC107, #FF9500)',
                color: '#08090C',
                fontWeight: 900,
                borderRadius: '9999px',
                padding: '14px',
                border: 'none',
                fontSize: '1.1rem',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px'
              }}>
                سجّل الآن ⭐
              </button>
            </Link>
          </div>
        ))}

        {/* Bottom CTA Section */}
        <div style={{
          marginTop: '16px',
          background: 'linear-gradient(145deg, rgba(25,29,42,0.95), rgba(14,16,24,0.98))',
          border: '1px solid rgba(255,193,7,0.3)',
          borderRadius: '26px',
          padding: '32px 24px',
          textAlign: 'center'
        }}>
          <h2 style={{ fontSize: '1.8rem', color: '#FFFFFF', margin: '0 0 12px 0' }}>
            هل أنت مستعد؟
          </h2>
          <p style={{ color: '#8E9BAE', fontSize: '1rem', margin: '0 0 24px 0', lineHeight: 1.6 }}>
            انضم إلى عائلة أولستار الرياضية في تطاوين وابدأ رحلتك نحو الاحتراف.
          </p>
          <Link to="/register" style={{ textDecoration: 'none' }}>
            <button className="btn-star" style={{
              width: '100%',
              background: 'linear-gradient(135deg, #FFC107, #FF9500)',
              color: '#08090C',
              fontWeight: 900,
              borderRadius: '9999px',
              padding: '16px',
              border: 'none',
              fontSize: '1.2rem',
              cursor: 'pointer'
            }}>
              انضم إلينا اليوم 🚀
            </button>
          </Link>
        </div>

      </div>
    </div>
  );
}
