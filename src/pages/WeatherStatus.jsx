import React, { useState } from 'react';
import { notificationService } from '../services/notifications';

export default function WeatherStatus() {
  const [notifGranted, setNotifGranted] = useState(
    typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted'
  );

  const handleEnableAlerts = async () => {
    const granted = await notificationService.requestPermission();
    setNotifGranted(granted);
  };

  const handleTestWeatherPush = () => {
    notificationService.sendLocalNotification(
      '⚠️ إشعار رياضي عاجل - تطاوين',
      'تنبيه: تم تعديل توقيت حصة تدريب كرة القدم بسبب ارتفاع الحرارة إلى الساعة 17:30.'
    );
    alert('🔔 Notification sent! Check your notification bar or in-app bell.');
  };

  // Mock data for 7-day forecast
  const forecast = [
    { day: 'اليوم', emoji: '☀️', temp: '35°' },
    { day: 'غداً', emoji: '⛅', temp: '33°' },
    { day: 'الأربعاء', emoji: '☀️', temp: '36°' },
    { day: 'الخميس', emoji: '🌤️', temp: '34°' },
    { day: 'الجمعة', emoji: '☁️', temp: '31°' },
    { day: 'السبت', emoji: '☀️', temp: '35°' },
    { day: 'الأحد', emoji: '☀️', temp: '36°' },
  ];

  const currentTemp = 35; // Change this to test the alert banner

  return (
    <div 
      style={{ 
        minHeight: '100vh', 
        backgroundColor: '#08090C', 
        color: '#FFFFFF',
        fontFamily: "'Cairo', 'Tajawal', sans-serif",
        direction: 'rtl'
      }}
    >
      <div style={{ maxWidth: '480px', margin: '0 auto', paddingTop: '95px', paddingBottom: '30px', paddingLeft: '16px', paddingRight: '16px' }}>
        
        {/* Page Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h1 className="section-title" style={{ fontSize: '28px', margin: '0 0 4px 0', color: '#FFC107' }}>
            حالة الملاعب (Field Conditions)
          </h1>
          <p className="section-subtitle" style={{ color: '#8E9BAE', margin: 0, fontSize: '15px' }}>
            تطاوين ، تونس 🇹🇳
          </p>
        </div>

        {/* Alert Banner (Conditional) */}
        {currentTemp > 38 && (
          <div style={{ 
            background: 'linear-gradient(135deg, rgba(255,61,0,0.2), rgba(255,61,0,0.05))',
            border: '1px solid rgba(255,61,0,0.4)',
            borderRadius: '16px',
            padding: '12px 16px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{ fontSize: '24px' }}>🚨</span>
            <div>
              <div style={{ color: '#FF3D00', fontWeight: 'bold', fontSize: '15px' }}>تحذير من الحرارة</div>
              <div style={{ color: '#FFFFFF', fontSize: '13px', opacity: 0.9 }}>تدريب في الصباح فقط</div>
            </div>
          </div>
        )}

        {/* Main Weather Card */}
        <div 
          className="sleek-card"
          style={{ 
            background: 'linear-gradient(145deg, rgba(25,29,42,0.95), rgba(14,16,24,0.98))',
            border: '1px solid rgba(255,193,7,0.3)', 
            borderRadius: '26px',
            padding: '24px',
            marginBottom: '24px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Decorative glow */}
          <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(255,193,7,0.15) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%' }}></div>
          
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
            <span style={{ fontSize: '64px', lineHeight: 1 }}>☀️</span>
            <span style={{ fontSize: '64px', fontWeight: '900', lineHeight: 1, letterSpacing: '-2px' }}>{currentTemp}°<span style={{ fontSize: '32px' }}>C</span></span>
          </div>
          
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#FFC107', marginBottom: '4px' }}>
            حار وصافي <span style={{ color: '#8E9BAE', fontSize: '16px', fontWeight: 'normal' }}>(Hot & Clear)</span>
          </div>
          <div style={{ fontSize: '14px', color: '#8E9BAE', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', marginBottom: '20px' }}>
            <span>📍</span> ملعب أولستار - تطاوين
          </div>

          {/* Field Status Badge */}
          <div style={{ 
            background: 'rgba(0, 230, 118, 0.1)', 
            border: '1px solid rgba(0, 230, 118, 0.3)',
            borderRadius: '9999px',
            padding: '10px 20px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 'bold',
            color: '#00E676',
            fontSize: '16px'
          }}>
            <span>🟢</span> الملعب مفتوح
          </div>
        </div>

        {/* Weather Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
          {[
            { icon: '💧', label: 'الرطوبة', value: '45%' },
            { icon: '💨', label: 'الرياح', value: '15 km/h' },
            { icon: '☀️', label: 'مؤشر UV', value: '8 (عالي)' },
            { icon: '🌡️', label: 'الإحساس', value: '38°C' }
          ].map((item, idx) => (
            <div key={idx} className="sleek-card" style={{ 
              background: 'linear-gradient(145deg, rgba(25,29,42,0.95), rgba(14,16,24,0.98))',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '20px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span style={{ fontSize: '24px' }}>{item.icon}</span>
              <div>
                <div style={{ fontSize: '12px', color: '#5A677B', marginBottom: '2px' }}>{item.label}</div>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#FFFFFF' }}>{item.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Training Readiness Score */}
        <div className="sleek-card" style={{ 
          background: 'linear-gradient(145deg, rgba(25,29,42,0.95), rgba(14,16,24,0.98))',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '26px',
          padding: '20px',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>مؤشر الجاهزية للتدريب</h3>
            <span style={{ fontWeight: '900', color: '#00E5FF', fontSize: '18px' }}>85/100</span>
          </div>
          <div className="stat-box" style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '999px', height: '12px', overflow: 'hidden' }}>
            <div className="stat-progress-bar stat-progress-fill" style={{ 
              width: '85%', 
              height: '100%', 
              background: 'linear-gradient(90deg, #00E5FF, #00E676)',
              borderRadius: '999px'
            }}></div>
          </div>
          <p style={{ margin: '12px 0 0 0', fontSize: '13px', color: '#8E9BAE' }}>
            الظروف ممتازة للتدريب، احرص على شرب الماء.
          </p>
        </div>

        {/* 7-Day Forecast */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px', paddingRight: '8px' }}>توقعات 7 أيام</h3>
          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            overflowX: 'auto', 
            paddingBottom: '8px',
            scrollbarWidth: 'none', // Firefox
            msOverflowStyle: 'none' // IE/Edge
          }}>
            {forecast.map((f, i) => (
              <div key={i} className="sleek-card" style={{ 
                background: 'linear-gradient(145deg, rgba(25,29,42,0.95), rgba(14,16,24,0.98))',
                border: i === 0 ? '1px solid rgba(255,193,7,0.3)' : '1px solid rgba(255,255,255,0.05)',
                borderRadius: '20px',
                padding: '16px 12px',
                minWidth: '70px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                flexShrink: 0
              }}>
                <div style={{ fontSize: '12px', color: i === 0 ? '#FFC107' : '#8E9BAE', fontWeight: i === 0 ? 'bold' : 'normal' }}>{f.day}</div>
                <div style={{ fontSize: '24px' }}>{f.emoji}</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{f.temp}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Push Notification Card */}
        <div className="sleek-card" style={{ 
          background: 'linear-gradient(145deg, rgba(25,29,42,0.95), rgba(14,16,24,0.98))',
          border: '1px solid rgba(0,229,255,0.2)',
          borderRadius: '26px',
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔔</div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 'bold', color: '#FFFFFF' }}>فعّل تنبيهات الطقس</h3>
          <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: '#8E9BAE', lineHeight: '1.5' }}>
            تلقَّ إشعارات فورية عند تغيير مكان التدريب أو تحذيرات الطقس بتطاوين.
          </p>
          
          {!notifGranted ? (
            <button 
              onClick={handleEnableAlerts} 
              className="btn-star" 
              style={{ 
                width: '100%', 
                padding: '14px', 
                background: 'linear-gradient(135deg, #FFC107, #FF9500)',
                color: '#08090C',
                border: 'none',
                borderRadius: '9999px',
                fontWeight: '900',
                fontSize: '15px',
                cursor: 'pointer'
              }}
            >
              تفعيل الإشعارات الفورية
            </button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ 
                background: 'rgba(0, 230, 118, 0.1)',
                border: '1px solid rgba(0, 230, 118, 0.2)',
                color: '#00E676',
                padding: '12px',
                borderRadius: '9999px',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                ✅ الإشعارات مفعلة
              </div>
              <button 
                onClick={handleTestWeatherPush}
                style={{ 
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#FFC107',
                  padding: '10px',
                  borderRadius: '9999px',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                ⚡ تجربة إشعار تمرين
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
