import React, { useState, useEffect } from 'react';
import { db } from '../services/db';

export default function Schedule() {
  const [filterSport, setFilterSport] = useState('all');
  const [viewMode, setViewMode] = useState('week');
  const [siteSessions, setSiteSessions] = useState([]);

  useEffect(() => {
    const content = db.getSiteContent();
    if (content.schedule_sessions && content.schedule_sessions.length > 0) {
      setSiteSessions(content.schedule_sessions);
    }
  }, []);

  const defaultScheduleData = {
    'الإثنين': [
      { sport: 'كرة القدم', emoji: '⚽', category: 'football', time: '16:30 - 18:00', age: 'U10', coach: 'الكابتن أحمد', color: '#00E676' },
      { sport: 'كرة اليد', emoji: '🤾', category: 'handball', time: '18:00 - 19:30', age: 'U14', coach: 'الكابتن يوسف', color: '#00E5FF' }
    ],
    'الثلاثاء': [
      { sport: 'كرة السلة', emoji: '🏀', category: 'basketball', time: '16:30 - 18:00', age: 'U10', coach: 'الكابتن أميرة', color: '#FF9500' },
      { sport: 'كرة السلة', emoji: '🏀', category: 'basketball', time: '18:00 - 19:30', age: 'U16', coach: 'الكابتن أميرة', color: '#FF9500' }
    ],
    'الأربعاء': [
      { sport: 'كرة القدم', emoji: '⚽', category: 'football', time: '16:30 - 18:00', age: 'U14', coach: 'الكابتن أحمد', color: '#00E676' },
      { sport: 'كرة اليد', emoji: '🤾', category: 'handball', time: '18:00 - 19:30', age: 'U16', coach: 'الكابتن يوسف', color: '#00E5FF' }
    ],
    'الخميس': [
      { sport: 'كرة السلة', emoji: '🏀', category: 'basketball', time: '16:30 - 18:00', age: 'U14', coach: 'الكابتن أميرة', color: '#FF9500' }
    ],
    'الجمعة': [
      { sport: 'كرة القدم', emoji: '⚽', category: 'football', time: '16:30 - 18:00', age: 'U16', coach: 'الكابتن أحمد', color: '#00E676' },
      { sport: 'دعم مدرسي', emoji: '📚', category: 'edu', time: '18:00 - 19:30', age: 'الجميع', coach: 'الأستاذة سارة', color: '#FFC107' }
    ]
  };

  const scheduleData = siteSessions.length > 0
    ? siteSessions.reduce((acc, sess) => {
        const day = sess.day || 'الإثنين';
        if (!acc[day]) acc[day] = [];
        acc[day].push({
          sport: sess.sport === 'Football' ? 'كرة القدم' : sess.sport === 'Basketball' ? 'كرة السلة' : sess.sport === 'Handball' ? 'كرة اليد' : sess.sport,
          emoji: sess.sport === 'Football' ? '⚽' : sess.sport === 'Basketball' ? '🏀' : sess.sport === 'Handball' ? '🤾' : '🏆',
          category: sess.sport === 'Football' ? 'football' : sess.sport === 'Basketball' ? 'basketball' : 'handball',
          time: sess.time || '16:00 - 18:00',
          age: sess.group || 'U12',
          coach: sess.coach || 'الكابتن',
          color: sess.sport === 'Football' ? '#00E676' : sess.sport === 'Basketball' ? '#FF9500' : '#00E5FF'
        });
        return acc;
      }, {})
    : defaultScheduleData;

  const getFilteredDays = () => {
    if (filterSport === 'all') return Object.entries(scheduleData);
    
    return Object.entries(scheduleData).map(([day, sessions]) => {
      return [day, sessions.filter(s => s.category === filterSport)];
    }).filter(([day, sessions]) => sessions.length > 0);
  };

  const filteredDays = getFilteredDays();

  return (
    <div style={{ 
      backgroundColor: '#08090C', 
      minHeight: '100vh', 
      direction: 'rtl', 
      fontFamily: '"Cairo", "Tajawal", sans-serif', 
      paddingTop: '95px', 
      paddingBottom: '80px',
      color: '#FFFFFF'
    }}>
      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '0 20px' }}>

        {/* Page Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div className="star-badge" style={{ marginBottom: '12px', display: 'inline-block' }}>التوقيت الأسبوعي</div>
          <h1 className="section-title" style={{ fontSize: '2.2rem', marginBottom: '8px' }}>
            جدول <span className="text-yellow">التدريبات</span>
          </h1>
          <p className="section-subtitle" style={{ color: '#8E9BAE', fontSize: '1rem', lineHeight: '1.6' }}>
            أكاديمية أولستار الرياضية (تطاوين)
          </p>
        </div>

        {/* Monthly View Toggle */}
        <div style={{ 
          display: 'flex', 
          background: 'rgba(255,255,255,0.05)', 
          borderRadius: '9999px', 
          padding: '4px',
          marginBottom: '24px'
        }}>
          <button 
            onClick={() => setViewMode('week')}
            style={{
              flex: 1,
              padding: '10px 0',
              borderRadius: '9999px',
              border: 'none',
              background: viewMode === 'week' ? 'linear-gradient(135deg, #FFC107, #FF9500)' : 'transparent',
              color: viewMode === 'week' ? '#08090C' : '#8E9BAE',
              fontWeight: viewMode === 'week' ? '900' : '600',
              fontSize: '0.95rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            أسبوعي
          </button>
          <button 
            onClick={() => setViewMode('month')}
            style={{
              flex: 1,
              padding: '10px 0',
              borderRadius: '9999px',
              border: 'none',
              background: viewMode === 'month' ? 'linear-gradient(135deg, #FFC107, #FF9500)' : 'transparent',
              color: viewMode === 'month' ? '#08090C' : '#8E9BAE',
              fontWeight: viewMode === 'month' ? '900' : '600',
              fontSize: '0.95rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            شهري
          </button>
        </div>

        {/* Sport Filter Pills */}
        <div style={{ 
          display: 'flex', 
          gap: '8px', 
          overflowX: 'auto', 
          paddingBottom: '12px',
          marginBottom: '24px',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}>
          {[
            { id: 'all', label: 'الكل' },
            { id: 'football', label: '⚽ كرة القدم' },
            { id: 'basketball', label: '🏀 كرة السلة' },
            { id: 'handball', label: '🤾 كرة اليد' }
          ].map(filter => (
            <button
              key={filter.id}
              onClick={() => setFilterSport(filter.id)}
              style={{
                padding: '8px 16px',
                borderRadius: '16px',
                border: filterSport === filter.id ? '1px solid #FFC107' : '1px solid rgba(255,255,255,0.1)',
                background: filterSport === filter.id ? 'rgba(255,193,7,0.1)' : 'rgba(25,29,42,0.6)',
                color: filterSport === filter.id ? '#FFC107' : '#8E9BAE',
                fontWeight: '700',
                fontSize: '0.9rem',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Next Session Banner */}
        <div className="sleek-card" style={{ 
          background: 'linear-gradient(145deg, rgba(255,193,7,0.15), rgba(255,149,0,0.05))',
          border: '1px solid rgba(255,193,7,0.3)',
          marginBottom: '32px',
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ color: '#FFC107', fontSize: '0.85rem', fontWeight: '800', marginBottom: '4px' }}>
              ⏳ الحصة القادمة
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: '800' }}>
              كرة القدم - U10
            </div>
            <div style={{ color: '#8E9BAE', fontSize: '0.9rem', marginTop: '4px' }}>
              غداً الساعة 09:00 صباحاً
            </div>
          </div>
          <div style={{ 
            background: 'linear-gradient(135deg, #FFC107, #FF9500)',
            width: '48px',
            height: '48px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            boxShadow: '0 4px 15px rgba(255,193,7,0.3)'
          }}>
            ⚽
          </div>
        </div>

        {/* Weekly Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {filteredDays.map(([day, sessions], idx) => (
            <div key={idx} className="sleek-card" style={{ padding: '24px' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginBottom: '16px',
                paddingBottom: '12px',
                borderBottom: '1px solid rgba(255,255,255,0.05)'
              }}>
                <h3 style={{ fontSize: '1.4rem', fontWeight: '800', margin: 0 }}>{day}</h3>
                <div style={{ flex: 1 }}></div>
                <div style={{ color: '#5A677B', fontSize: '0.9rem', fontWeight: '600' }}>
                  {sessions.length} حصص
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {sessions.map((session, sIdx) => (
                  <div key={sIdx} style={{ 
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: '16px',
                    padding: '16px',
                    borderRight: `4px solid ${session.color}`
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.4rem' }}>{session.emoji}</span>
                        <div>
                          <div style={{ fontWeight: '800', fontSize: '1.1rem' }}>{session.sport}</div>
                          <div style={{ color: '#8E9BAE', fontSize: '0.85rem' }}>فئة {session.age}</div>
                        </div>
                      </div>
                      <div style={{ 
                        background: 'rgba(255,255,255,0.05)', 
                        padding: '6px 12px', 
                        borderRadius: '12px', 
                        fontSize: '0.85rem',
                        fontWeight: '700',
                        color: session.color,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <span>🕒</span> {session.time}
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#5A677B', fontSize: '0.9rem' }}>
                      <span>👨‍🏫</span> المدرب: {session.coach}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {filteredDays.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#8E9BAE' }}>
              لا توجد حصص مبرمجة لهذه الرياضة.
            </div>
          )}
        </div>

        {/* Download PDF button */}
        <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'center' }}>
          <button className="btn-outline" style={{
            background: 'transparent',
            border: '1px solid #FFC107',
            color: '#FFC107',
            padding: '16px 32px',
            borderRadius: '9999px',
            fontWeight: '800',
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}>
            تحميل الجدول PDF 📥
          </button>
        </div>

      </div>
    </div>
  );
}
