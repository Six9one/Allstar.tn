import React, { useState, useEffect } from 'react';
import { db } from '../services/db';

const Events = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [now, setNow] = useState(new Date());
  const [siteEvents, setSiteEvents] = useState([]);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000 * 60 * 60); 
    const content = db.getSiteContent();
    if (content.events && content.events.length > 0) {
      setSiteEvents(content.events);
    }
    return () => clearInterval(timer);
  }, []);

  const calculateDaysLeft = (targetDateStr) => {
    if (!targetDateStr) return 0;
    const targetDate = new Date(targetDateStr);
    const difference = targetDate - now;
    if (difference <= 0) return 0;
    return Math.ceil(difference / (1000 * 60 * 60 * 24));
  };

  const defaultEvents = [
    {
      id: 1,
      title: 'بطولة رمضان لكرة القدم',
      date: '2026-09-15',
      displayDate: 'Sept 15, 2026',
      location: 'Tataouine Stadium',
      ages: 'U12-U16',
      emoji: '🏆',
      accent: '#FFC107'
    },
    {
      id: 2,
      title: 'بطولة كرة السلة',
      date: '2026-10-05',
      displayDate: 'Oct 5, 2026',
      location: 'Indoor Hall',
      ages: 'U14',
      emoji: '🏀',
      accent: '#FF9500'
    },
    {
      id: 3,
      title: 'نهائي كرة اليد',
      date: '2026-11-20',
      displayDate: 'Nov 20, 2026',
      location: 'Tataouine',
      ages: 'Open Age',
      emoji: '🤾',
      accent: '#00E5FF'
    }
  ];

  const upcomingEvents = siteEvents.length > 0
    ? siteEvents.map(e => ({
        id: e.id,
        title: e.title,
        date: e.date || '2026-09-15',
        displayDate: e.date || 'قريباً',
        location: e.location || 'المركب البلدي',
        ages: 'جميع الفئات',
        emoji: e.sport || '🏆',
        accent: e.sport === '⚽' ? '#00E676' : e.sport === '🏀' ? '#FF9500' : '#FFC107'
      }))
    : defaultEvents;

  const pastEvents = [
    { id: 1, title: 'بطولة الشتاء لكرة القدم', result: 'المركز الأول 🥇' },
    { id: 2, title: 'دوري كرة السلة المحلي', result: 'الوصيف 🥈' },
    { id: 3, title: 'كأس الربيع الودية', result: 'البطل 🏆' }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#08090C',
      color: '#FFFFFF',
      fontFamily: '"Cairo", "Tajawal", sans-serif',
      direction: 'rtl',
      paddingBottom: '40px'
    }}>
      <div style={{
        maxWidth: '480px',
        margin: '0 auto',
        padding: '95px 20px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        
        {/* Page Header */}
        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: 800 }}>فعالياتنا <span style={{ color: '#FFC107' }}>(Events)</span></h1>
          <p style={{ margin: 0, color: '#8E9BAE', fontSize: '14px' }}>أكاديمية أولستار الرياضية - تطاوين</p>
        </div>

        {/* Filter Tabs */}
        <div style={{
          display: 'flex',
          background: 'rgba(25, 29, 42, 0.6)',
          borderRadius: '16px',
          padding: '4px',
          border: '1px solid rgba(255,255,255,0.05)'
        }}>
          <button 
            onClick={() => setActiveTab('upcoming')}
            style={{
              flex: 1,
              padding: '10px 0',
              border: 'none',
              borderRadius: '12px',
              backgroundColor: activeTab === 'upcoming' ? 'rgba(255, 193, 7, 0.15)' : 'transparent',
              color: activeTab === 'upcoming' ? '#FFC107' : '#8E9BAE',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            القادمة (Upcoming)
          </button>
          <button 
            onClick={() => setActiveTab('past')}
            style={{
              flex: 1,
              padding: '10px 0',
              border: 'none',
              borderRadius: '12px',
              backgroundColor: activeTab === 'past' ? 'rgba(255, 193, 7, 0.15)' : 'transparent',
              color: activeTab === 'past' ? '#FFC107' : '#8E9BAE',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            السابقة (Past)
          </button>
        </div>

        {activeTab === 'upcoming' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {upcomingEvents.map((ev) => (
              <div key={ev.id} style={{
                background: 'linear-gradient(145deg, rgba(25,29,42,0.95), rgba(14,16,24,0.98))',
                border: `1px solid rgba(255,255,255,0.08)`,
                borderRight: `4px solid ${ev.accent}`,
                borderRadius: '26px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 800 }}>{ev.emoji} {ev.title}</h3>
                    <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.1)', borderRadius: '9999px', padding: '4px 10px', fontSize: '11px', fontWeight: 700, color: '#FFC107' }}>
                      {ev.ages}
                    </div>
                  </div>
                  <div style={{ 
                    background: 'rgba(25, 29, 42, 0.8)', 
                    padding: '8px 12px', 
                    borderRadius: '12px', 
                    border: '1px solid rgba(255,255,255,0.05)',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '20px', fontWeight: 900, color: ev.accent }}>{calculateDaysLeft(ev.date)}</div>
                    <div style={{ fontSize: '10px', color: '#8E9BAE', fontWeight: 700 }}>يوم متبقي</div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: '#8E9BAE', fontSize: '13px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>📅</span> <span>{ev.displayDate}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>📍</span> <span>{ev.location}</span>
                  </div>
                </div>

                <a href="/register" style={{ textDecoration: 'none' }}>
                  <button style={{
                    width: '100%',
                    background: `linear-gradient(135deg, ${ev.accent}, ${ev.accent}cc)`,
                    color: '#08090C',
                    border: 'none',
                    borderRadius: '9999px',
                    padding: '14px',
                    fontWeight: 900,
                    fontSize: '15px',
                    cursor: 'pointer',
                    marginTop: '4px'
                  }}>
                    سجل الآن (Register)
                  </button>
                </a>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'past' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Achievement Banner */}
            <div style={{
              background: 'linear-gradient(135deg, #FFC107 0%, #FF9500 100%)',
              borderRadius: '26px',
              padding: '24px',
              color: '#08090C',
              textAlign: 'center'
            }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: 900 }}>إنجازاتنا 🌟</h3>
              <div style={{ display: 'flex', justifyContent: 'space-around', gap: '8px', flexWrap: 'wrap' }}>
                <div style={{ background: 'rgba(0,0,0,0.1)', padding: '8px 12px', borderRadius: '12px', fontWeight: 800, fontSize: '13px' }}>
                  بطولتان إقليميتان
                </div>
                <div style={{ background: 'rgba(0,0,0,0.1)', padding: '8px 12px', borderRadius: '12px', fontWeight: 800, fontSize: '13px' }}>
                  5 كؤوس
                </div>
                <div style={{ background: 'rgba(0,0,0,0.1)', padding: '8px 12px', borderRadius: '12px', fontWeight: 800, fontSize: '13px' }}>
                  8 ميدالية
                </div>
              </div>
            </div>

            {/* YOUTH LEAGUE STANDINGS TABLE & GOLDEN BOOT LEADERBOARD */}
            <div style={{ background: 'linear-gradient(145deg, rgba(25,29,42,0.95), rgba(14,16,24,0.98))', border: '1px solid #FFC107', borderRadius: '24px', padding: '20px', marginTop: '16px' }}>
              <h3 style={{ color: '#FFC107', fontSize: '1.2rem', fontWeight: 900, marginBottom: '14px', textAlign: 'center' }}>
                🏆 ترتيب دوري أكاديمية أولستار U14 (Tataouine Youth League)
              </h3>
              
              <div style={{ overflowX: 'auto', marginBottom: '24px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #FFC107', color: '#FFC107' }}>
                      <th style={{ padding: '8px', textAlign: 'right' }}>الفريق</th>
                      <th style={{ padding: '8px' }}>لعب</th>
                      <th style={{ padding: '8px' }}>فوز</th>
                      <th style={{ padding: '8px' }}>تعادل</th>
                      <th style={{ padding: '8px' }}>له/عليه</th>
                      <th style={{ padding: '8px' }}>النقاط</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <td style={{ padding: '10px', textAlign: 'right', fontWeight: 900, color: '#00E676' }}>🥇 نسور أولستار U14</td>
                      <td>8</td><td>7</td><td>1</td><td>21:5</td><td style={{ color: '#FFC107', fontWeight: 900 }}>22</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <td style={{ padding: '10px', textAlign: 'right', fontWeight: 900, color: '#00E5FF' }}>🥈 نجم تطاوين الشاب</td>
                      <td>8</td><td>5</td><td>2</td><td>16:8</td><td style={{ color: '#FFC107', fontWeight: 900 }}>17</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <td style={{ padding: '10px', textAlign: 'right', fontWeight: 900, color: '#FF9500' }}>🥉 أبطال الأكاديمية B</td>
                      <td>8</td><td>4</td><td>1</td><td>12:10</td><td style={{ color: '#FFC107', fontWeight: 900 }}>13</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* GOLDEN BOOT LEADERBOARD */}
              <h4 style={{ color: '#00E5FF', fontSize: '1.05rem', fontWeight: 900, marginBottom: '12px', textAlign: 'center' }}>
                ⚽ هدافو الدوري (Golden Boot Scorers)
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px 14px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>🥇 <strong>يوسف المنصوري (Youssef M.)</strong> — U14</span>
                  <span style={{ background: '#FFC107', color: '#08090C', padding: '2px 10px', borderRadius: '10px', fontWeight: 900 }}>12 هدف ⚽</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px 14px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>🥈 <strong>عمر الطرابلسي (Omar T.)</strong> — U14</span>
                  <span style={{ background: 'rgba(255,255,255,0.1)', color: '#FFF', padding: '2px 10px', borderRadius: '10px', fontWeight: 800 }}>8 أهداف ⚽</span>
                </div>
              </div>
            </div>

            {/* Past Events Gallery */}
            <div>
              <h2 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: 800 }}>أحداث سابقة (Past Events)</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {pastEvents.map((ev) => (
                  <div key={ev.id} style={{
                    background: 'linear-gradient(145deg, rgba(25,29,42,0.95), rgba(14,16,24,0.98))',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '20px',
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ fontSize: '24px' }}>🏆</div>
                      <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>{ev.title}</h4>
                    </div>
                    <div style={{ 
                      background: 'rgba(0, 230, 118, 0.1)', 
                      color: '#00E676', 
                      padding: '6px 12px', 
                      borderRadius: '9999px', 
                      fontSize: '12px', 
                      fontWeight: 800 
                    }}>
                      {ev.result}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default Events;
